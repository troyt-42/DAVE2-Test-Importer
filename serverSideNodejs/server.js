var ZooKeeper = require ("zookeeper");
var express = require('express');
var http = require('http');
var multiparty = require('multiparty');
var fs = require('fs');
var io = require('socket.io');
var bodyparser = require('body-parser');
var kafka = require('kafka-node');


var app = express();
var server = http.createServer(app);
var socket = io.listen(server);

app.use(express.static(__dirname + '/../'));

var userZnode = '';
var userName = '';
var fileZnode = '';
var jsonMetaData = '';
var metaData = '';
var itemNum = 0;

var zk = new ZooKeeper({
  connect: "10.3.83.235:2181",
  timeout: 200000,
  debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN,
  host_order_deterministic: false,
  data_as_buffer:false
});


app.get('/getfile/:filename', function(req, res){
  fs.readFile(req.param('filename'),function (err, data) {
    if (err) {
      console.log("Error Reading File");
      res.writeHead(404,
        {
          'Content-Type': 'text/plain'
        });
        res.end();
      } else {
        console.log(data);
        res.write(data);
        res.end();
      }
    });
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
          }
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
      var fileURL = "10.3.86.65:8888" + "/Importer/serverSideNodejs/upload/" + userName + '/' + uploadedFileName;
      var fileURL2 = __dirname + "/upload/" + userName + "/" + uploadedFileName;
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
      if (err){
        throw err;
      }
      console.log ("zk session established, id=%s", zk.client_id);
    });

    client.on("stepOne", function(){

      zk.a_create (fileZnode, metaData, ZooKeeper.ZOO_SEQUENCE, function (rc, error, path)  {
        if (rc !== 0) {
          console.log ("zk node create result: %d, error: '%s', path=%s", rc, error, path);
        } else {
          console.log ("created zk node %s", path);

          zk.a_get(path, false, function ( rc, error, stat, data ){
            var array = eval(data);
            var file = array[0];
            nodes[file.filename] = path;
          });

          if (itemNum === 1){
            zk.aw_get(path, function ( type, state, path ){
              if (type === 3) {
                console.log("Node %s has been changed to: ", path);
                zk.a_get(path, false, function(rc, error, stat, data){
                  console.log(data);
                  var fakeData = [
                  {filename:"VCDaveImport.csv",name:"test",fileURL:"10.3.86.65:8888/Importer/serverSideNodejs/upload/troy/VCDaveImport Thu Oct 23 2014 14:32:30 GMT-0400 (EDT).csv"},
                  ["CH DRYER_C_SRP.FIC16107.MEAS", "CH FERMENT_4.TT14502.PNT", "CH FERMENT_4.FIC14601.MEAST","CH FERMENT_4.FIC14601.OUT"]];
                  client.emit("stepOne", fakeData);
                });
              }
            }, function ( rc, error, stat, data ){
              if (rc !== 0) {
                console.log ("zk node get result: %d error: '%s', stat= %s", rc, error, stat);
              } else {
                console.log("Watch is set on " + path);
              }
            });

            zk.a_set(userZnode, 'Done!', -1, function ( rc, error, stat ){
              if (rc !== 0) {
                console.log ("zk node set result: %d error: '%s', stat= %s", rc, error, stat);
              } else {
                console.log("Set userZnode one : " + userZnode);
              }
            });
          } else {
            itemNum--;
            zk.aw_get(path, function ( type, state, path ){
              if (type === 3) {
                console.log("Node %s has been changed to: ", path);
                zk.a_get(path, false, function(rc, error, stat, data){
                  console.log(data);
                  client.emit("stepOne", fakeData);
                });
              }
            }, function ( rc, error, stat, data ){
              if (rc !== 0) {
                console.log ("zk node get result: %d error: '%s', stat= %s", rc, error, stat);
              } else {
                console.log("Watch is set on " + path);
              }

            });
          }
        }
      });
    });

    client.on("stepTwo", function(selection){
      console.log(selection[0]);
      console.log(nodes);
      if (selection.length !== 0){

        for ( var i = 0; i < selection.length; i++){
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
            }
          });
        }

        zk.a_set(userZnode, "Done2!", -1, function ( rc, error, stat ){
          if (rc !== 0){
            console.log("zk node set userZnode two result: %d error: %s, stat = %s", rc, error, stat);
          } else {
            console.log("Set userZnode two " + userZnode);

          }
        });
      } else {
        console.log("Invalid Selection!");
      }
    });



    var kafkaClient = new kafka.Client("10.3.83.239");
    var consumer = new kafka.Consumer(
      kafkaClient,
      [{ topic: 'test', partition: 0 }],
      {
        autoCommit: false
      }
    );

    consumer.on("message",function(message){
      console.log(message);
    });



    client.on("disconnect", function(){
      console.log(client.handshake.address + " Disconnected!");
      if ((userZnode === '') || (userName === '')){
        console.log("userZnode is null!");
      } else {
        zk.a_get_children(userZnode, false, function(rc, error, children){
          if (rc !== 0) {
            console.log("zk a_get_children result: %d, error: '%s', path = %s", rc, error, userZnode);
          } else {

            for(var i = 0; i < children.length; i++){
              var childRoute = userZnode + "/" + children[i];
              zk.a_delete_ ( childRoute, -1, function(rc, error){
                if (rc !== 0) {
                  console.log("zk a_delete_ result: %d, error: '%s', path = %s", rc, error, childRoute);
                } else {
                  console.log("Cleared the children: " + childRoute);
                }
              });
            }
            zk.a_set(userZnode, "Clear", -1, function ( rc, error, stat ){
              if (rc !== 0 ) {
                console.log("zk a_set result: %d, error: '$s', path = $s", rc, error, userZnode);
              } else {
                console.log("Clear userZnode: " + userZnode);
              }
            });
          }
        });
      }
    });


    var messageDB = [];

    client.on("messages",function(nickname,messages,color){
      client.broadcast.emit("messages", nickname, messages,color);
      messageDB.push(messages);
      if (messageDB.length >= 10) {
        messageDB.pop();
      }
    });

  });

  server.listen(3000);
  console.log("Express Server Is Listenning at 3000");
