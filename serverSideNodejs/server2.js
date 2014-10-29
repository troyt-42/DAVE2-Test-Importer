var ZooKeeper = require ("zookeeper");
var express = require('express');
var http = require('http');
var multiparty = require('multiparty');
var fs = require('fs');
var io = require('socket.io');
var bodyparser = require('body-parser');
var debuger = require('debug')('socket.io');

var app = express();
var server = http.createServer(app);
var socket = io.listen(server);

app.use(express.static(__dirname + '/../UI/app'));

var userZnode = '';
var userName = '';
var fileZnode = '';
var jsonMetaData = '';
var metaData = '';
var itemNum = 0;

var zk = new ZooKeeper({
  connect: " 10.3.83.235:2181"
  ,timeout: 200000
  ,debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN
  ,host_order_deterministic: false
  ,data_as_buffer:false
});

app.post("/username", bodyparser.json(), function(req, res){
  userName = req.body.username;
  userZnode = '/upload/' + userName;
  console.log(userName);
  console.log(userZnode);
  res.writeHead(200);
  res.end();
});

app.post("/itemnum",bodyparser.json(), function(req,res){
  console.log(req.body);
  itemNum = Number(req.body.sizeofupload);
  console.log("Total files to be uploaded: " + itemNum);
  res.writeHead(200);
  res.end();
});



app.post("/upload", function(req, res){

  var count = 0;
  var form = new multiparty.Form({'autoFields' : true});
  var fileMetaData = {};
  var file;
  var fileName;
  var znodeName = '';

  form.on('error', function(err) {
    console.log('Error parsing form: ' + err.stack);
  });

  form.on('part', function(part) {
    if ((part.filename === null) || (part.filename === undefined)){


      var data = '';
      part.on("data", function(chunk){

        data += chunk;
      });

      part.on("end", function(){
        if (part.name === 'name') {
          znodeName += data;
          fileMetaData.name = data;
        };
        data = '';
      });
      part.resume();
    }
    if ((part.filename !== null) && (part.filename !== undefined) ){
      count++;
      fileMetaData.filename = part.filename;
      fileName = part.filename;

      part.on('data', function(chunk){

        file += chunk;
      });

      part.on('end', function(){
        console.log('file upload success!');
      });

      part.resume();
    }
  });

  form.on('close', function() {
    console.log('Upload completed!');
    var uploadedFileName = fileName.slice(0, -4) + " " + Date().toLocaleString() + fileName.slice(-4);
    fileURL = "10.3.86.65:8888" + "/Importer/serverSideNodejs/upload/" + userName + '/' + uploadedFileName;
    fileURL2 = __dirname + "/upload/" + userName + "/" + uploadedFileName;
    fileMetaData.fileURL = fileURL;
    fs.writeFile(fileURL2, file, function(err){
      res.end(err);
    });

    jsonMetaData = JSON.stringify(fileMetaData);
    metaData = "[" + jsonMetaData + "]";
    fileZnode = userZnode + '/' + znodeName;

    res.end('Received ' + count + ' files');




    fileMetaData = [];
  });

  form.parse(req);
});


socket.on("connection", function(client){

  console.log("Connected!" + client.handshake.address);

  var nodes = {};
  zk.connect(function (err) {
    if(err) throw err;
    console.log ("zk session established, id=%s", zk.client_id);

    client.on("stepOne", function(){
      zk.a_create (fileZnode, metaData, ZooKeeper.ZOO_SEQUENCE, function (rc, error, path)  {
        if (rc != 0) {
          console.log ("zk node create result: %d, error: '%s', path=%s", rc, error, path);
        } else {
          nodes[JSON.parse(jsonMetaData).filename] = path;
          console.log ("created zk node %s", path);
          if (itemNum == 1){

            zk.a_set(userZnode, 'Done!', -1, function ( rc, error, stat ){
              if (rc != 0) {
                console.log ("zk node set result: %d error: '%s', stat= %s", rc, error, stat);
              } else {
                console.log("Set userZnode : " + userZnode  + " " + jsonMetaData);
              };
            });

            zk.aw_get(path
              , function ( type, state, path ){
                if (type === 3) {
                  console.log("Node %s has been changed to: ", path);
                  zk.a_get(path, false, function(rc, error, stat, data){
                    console.log(data);
                    client.emit("stepOne", data);
                  });
                };
              }
              , function ( rc, error, stat, data ){
                console.log("Watch is set on " + path);
              });

            });
          } else {
            itemNum--;
            zk.aw_get(path
              , function ( type, state, path ){
                if (type === 3) {
                  console.log("Node %s has been changed to: ", path);
                  zk.a_get(path, false, function(rc, error, stat, data){
                    console.log(data);
                    client.emit("stepOne", data);
                  });
                };
              }
              , function ( rc, error, stat, data ){
                console.log("Watch is set on " + path);
              }
            );
          };
        };
      });
    });


    client.on("stepTwo", function(selection){
      if (selection.length !== 0){
        var loop = function(i){
          if (i !== -1){
            var selectedFile = selection[i];
            var selectedFileMeta = selectedFile[0];
            var selectedFileFilename = selectedFileMeta.filename;

            var fileZnodePath = nodes[selectedFileFilename];

            var selectedFileString = JSON.stringify(selectedFile);
            zk.a_set(fileZnodePath, selectedFileString, -1, function ( rc, error, stat ){
              if (rc !== 0){
                console.log("zk node set step two result: %d error: %s, stat = %s", rc, error, stat);
              } else {
                console.log("Feedback success!");
                console.log(selectedFile);
                zk.a_get(fileZnodePath, false, function(rc, error, stat, data){
                  console.log(data);
                });
                loop(i-1);
              }
            });
          } else {
            zk.a_set(userZnode, "Done2!", -1, function ( rc, error, stat ){
              if (rc !== 0){
                console.log("zk node set userZnode two result: %d error: %s, stat = %s", rc, error, stat);
              } else {
                console.log("Set userZnode two " + userZnode);
              }
            });
          };
        };
        loop(selection.length - 1);
      } else {
        console.log("Invalid Selection!");
      };
    });

    client.on("disconnect", function(){
      if ((userZnode === '') || (userName === '')){
        console.log("userZnode is null!");
      } else {
        zk.a_get_children(userZnode, false, function(rc, error, children){
          if (rc != 0) {
            console.log("zk a_get_children result: %d, error: '%s', path = %s", rc, error, userZnode);
          } else {
            if (children.length !== 0){
              var loop = function(i, children){
                if (i !== -1){
                  var childRoute = userZnode + "/" + children[i];
                  zk.a_delete_ ( childRoute, -1, function(rc, error){
                    if (rc !== 0) {
                      console.log("zk a_delete_ result: %d, error: '%s', path = %s", rc, error, childRoute);
                    } else {
                      console.log("Cleared the children: " + childRoute);
                      loop(i-1, children);
                    };
                  });
                } else {
                  zk.a_set(userZnode, "Clear", -1, function ( rc, error, stat ){
                    if (rc !== 0 ) {
                      console.log("zk a_set result: %d, error: '$s', path = $s", rc, error, userZnode);
                    } else {
                      console.log("Clear userZnode: " + userZnode);
                    };
                  });
                };
              };

              loop(children.length - 1, children);
            };
          };
        });
      };

      console.log(client.handshake.address + " Disconnected!");
    });
  });
});

server.listen(3000);
console.log("Express Server Is Listenning at 3000");
