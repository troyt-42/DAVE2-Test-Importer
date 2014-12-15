var ZooKeeper = require ("zookeeper");
var express = require('express');
var http = require('http');
var multiparty = require('multiparty');
var fs = require('fs');
var io = require('socket.io');
var bodyparser = require('body-parser');
var kafka = require('kafka-node');
var Q = require('q');

var app = express();
var server = http.createServer(app);
var socket = io.listen(server);
var messageDB = [];

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


var kafkaClient = new kafka.Client('10.3.83.235:2181');
var producer = kafka.HighLevelProducer;
var consumer = kafka.HighLevelConsumer;

var sender = new producer(kafkaClient);

var receiver = new consumer(kafkaClient, [{topic : 'default'}], {});


// Data-Item Display Part
var currentDataItem = [];
var currentDataItemToShow = [];
var start = 0;
var end = 0;

app.get('/gettable', function(req, res){
  fs.readFile('table.json', function(err,data){
    if (err){
      console.log('Error Reading File');
      console.log(err);
      res.writeHead(404,{'Content-Type': 'text/plain'});
      res.end();
    } else {
      res.write(data);
      res.end();
    }
  });
});

app.get('/getfile/:filename/:reduction', function(req, res){
  fs.readFile(req.param('filename') + "-" + req.param('reduction') + '.json',{encoding: 'utf8'},function (err, data) {
    if (err) {

      console.log("Error Reading File");
      console.log(err);
      res.writeHead(404,{'Content-Type': 'text/plain'});
      res.end();
    } else {
      var dataItem = JSON.parse(data);
      if(dataItem.data){
        dataItem.data.sort(function compare(a, b){
          if (Date.parse(a.Date) < Date.parse(b.Date)){
            return -1;
          } else if (Date.parse(a.Date) > Date.parse(b.Date)){
            return 1;
          } else {
            return 0;
          }
        });

        var itemData = [];

        for (var key in dataItem.data){
          var date = Date.parse(dataItem.data[key].Date);
          var value = dataItem.data[key].Value;
          var sub = [date, value];
          itemData.push(sub);
        }

        itemData.sort(function(a, b){
          return a[0] - b[0];
        });

        dataItem.itemData = itemData;

        currentDataItem = itemData;
        currentDataItemToShow = itemData;
        start = 0;
        end = itemData.length;

        var dataMirror = [];

        for (key in dataItem.data){
          var dateInMms = Date.parse(dataItem.data[key].Date);

          dataMirror.push(dateInMms);
        }
        console.log(dataMirror);
        dataItem.dataMirror = dataMirror;



      }

      if (start <= end){
        var avg = 0;
        var maxValue = currentDataItemToShow[0][1];
        var minValue = currentDataItemToShow[0][1];

        var maxIndex = 0;
        var minIndex = 0;

        var temSum = 0;
        for(var key2 in currentDataItemToShow){

          var value2 = currentDataItemToShow[key2][1];
          temSum += value2;


          if (value2 > maxValue){
            maxValue = currentDataItemToShow[key2][1];
            maxIndex = key2;
          }

          if (value2 < minValue){
            minValue = currentDataItemToShow[key2][1];
            minIndex = key2;
          }

        }
        avg = temSum / currentDataItemToShow.length;

        dataItem.avg = avg.toFixed(4);

        dataItem.maxValueIndex = maxIndex;
        dataItem.minValueIndex = minIndex;
      } else {
        dataItem.avg = null;
        dataItem.maxValueIndex = null;
        dataItem.maxValueIndex = null;
      }


      if (dataItem.avg !== null){
        var numOfValuesHigherThan0 = 0;
        var numOfValuesHigherThan20 = 0;
        var numOfValuesHigherThan40 = 0;
        var numOfValuesHigherThan50 = 0;
        var numOfValuesHigherThan80 = 0;

        for (var key3 in currentDataItemToShow){
          if ((currentDataItemToShow[key3][1] >= 0) && (currentDataItemToShow[key3][1] <= 20)){
            numOfValuesHigherThan0 ++;
          } else if ((currentDataItemToShow[key3][1] > 20) && (currentDataItemToShow[key3][1] <= 40)){
            numOfValuesHigherThan20 ++;
          } else if ((currentDataItemToShow[key3][1] > 40) && (currentDataItemToShow[key3][1] <= 50)){
            numOfValuesHigherThan40++;
          } else if ((currentDataItemToShow[key3][1] > 50) && (currentDataItemToShow[key3][1] <= 80)){
            numOfValuesHigherThan50++;
          } else {
            numOfValuesHigherThan80++;
          }
        }

        dataItem.numOfValuesHigherThan0 = numOfValuesHigherThan0;
        dataItem.numOfValuesHigherThan20 = numOfValuesHigherThan20;
        dataItem.numOfValuesHigherThan40 = numOfValuesHigherThan40;
        dataItem.numOfValuesHigherThan50 = numOfValuesHigherThan50;
        dataItem.numOfValuesHigherThan80 = numOfValuesHigherThan80;
      } else {
        dataItem.numOfValuesHigherThan0 = null;
        dataItem.numOfValuesHigherThan20 = null;
        dataItem.numOfValuesHigherThan40 = null;
        dataItem.numOfValuesHigherThan50 = null;
        dataItem.numOfValuesHigherThan80 = null;
      }


      res.write(JSON.stringify(dataItem));
      res.end();
    }
  });
});

app.get('/getIndex/:min/:max', function(req, res){
  var min = req.param('min');
  var max = req.param('max');

  var dataMinIndex = 0;
  var dataMaxIndex = 0;
  var returnJSON = {};

  if (currentDataItemToShow.length !== 0){
    if ((min < currentDataItemToShow[0][0]) && (max > currentDataItemToShow[currentDataItemToShow.length - 1][0])){

      for(var i1 = 0; i1 < currentDataItem.length; i1++){
        if(currentDataItem[i1][0] >= min){
          dataMinIndex = i1;
          break;
        }
      }

      for(var p1 = currentDataItem.length - 1; p1 >= 0; p1--){
        if(currentDataItem[p1][0] <= max){
          dataMaxIndex = p1;
          break;
        }
      }

      start = dataMinIndex;
      end = dataMaxIndex;

      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }


    } else if ((min > currentDataItemToShow[currentDataItemToShow.length - 1][0]) && (max > currentDataItemToShow[currentDataItemToShow.length - 1][0])){
      var tem = currentDataItem.slice(end);

      for(var i5 = 0; i5 < tem.length; i5++){
        if(tem[i5][0] >= min){
          dataMinIndex = i5;
          break;
        }
      }

      for(var p5 = tem.length - 1; p5 >= 0; p5--){
        if(tem[p5][0] <= max){
          dataMaxIndex = p5;
          break;
        }
      }

      start = end + dataMinIndex;
      end += dataMaxIndex;

      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }

    } else if ((max < currentDataItemToShow[0][0])){
      var tem2 = currentDataItem.slice(0, start);

      for(var i6 = 0; i6 < tem2.length; i6++){
        if(tem2[i6][0] >= min){
          dataMinIndex = i6;
          console.log('Min:' + min);
          console.log('DataMin: ' + tem2[i6][0]);
          break;
        } else if (i6 === tem2.length -1){
          dataMinIndex = start;
        }
      }

      for(var p6 = tem2.length - 1; p6 >= 0; p6--){
        if(tem2[p6][0] <= max){
          dataMaxIndex = p6;

          console.log('Max:' + max);
          console.log('DataMax: ' + tem2[p6][0]);
          console.log('index:' + p6);
          break;
        }
      }

      start = dataMinIndex;
      end = dataMaxIndex;

      console.log(dataMinIndex);
      console.log(dataMaxIndex);
      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }

    } else if (min < currentDataItemToShow[0][0]){
      for (var i2 = 0; i2 < currentDataItem.length; i2++){
        if (currentDataItem[i2][0] >= min){
          dataMinIndex = i2;
          break;
        }
      }

      for(var p2 = currentDataItemToShow.length - 1; p2 >= 0; p2--){
        if(currentDataItemToShow[p2][0] <= max){
          dataMaxIndex = p2;
          break;
        }
      }

      end = start + dataMaxIndex;
      start = dataMinIndex;
      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }


    } else if (max > currentDataItemToShow[currentDataItemToShow.length - 1][0]){
      for (var i3 = 0; i3 < currentDataItemToShow.length; i3++){
        if (currentDataItemToShow[i3][0] >= min){
          dataMinIndex = i3;
          break;
        }
      }

      for(var p3 = currentDataItem.length - 1; p3 >= 0; p3--){
        if(currentDataItem[p3][0] <= max){
          dataMaxIndex = p3;
          break;
        }
      }

      end = dataMaxIndex;
      start += dataMinIndex;
      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }


    } else {
      for (var i4 = 0; i4 < currentDataItemToShow.length; i4++){
        if (currentDataItemToShow[i4][0] >= min){
          dataMinIndex = i4;
          break;
        }
      }

      for(var p4 = currentDataItemToShow.length - 1; p4 >= 0; p4--){
        if(currentDataItemToShow[p4][0] <= max){
          dataMaxIndex = p4;
          break;
        }
      }


      end = start + dataMaxIndex;
      start += dataMinIndex;
      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }


    }
    returnJSON = {
      dataMinIndex : start,
      dataMaxIndex : end + 1
    };
  } else {
    console.log('Beware!!');
    returnJSON = {
      dataMinIndex : -1,
      dataMaxIndex : -1
    };
  }


  if (start <= end){
    var avg = 0;
    var maxValue = currentDataItemToShow[0][1];
    var minValue = currentDataItemToShow[0][1];

    var maxIndex = 0;
    var minIndex = 0;

    var temSum = 0;
    for(var key in currentDataItemToShow){

      var value = currentDataItemToShow[key][1];
      temSum += value;


      if (value > maxValue){
        maxValue = currentDataItemToShow[key][1];
        maxIndex = key;
      }

      if (value < minValue){
        minValue = currentDataItemToShow[key][1];
        minIndex = key;
      }

    }
    avg = temSum / currentDataItemToShow.length;

    returnJSON.avg = avg.toFixed(4);

    returnJSON.maxValueIndex = maxIndex;
    returnJSON.minValueIndex = minIndex;
  } else {
    returnJSON.avg = null;
    returnJSON.maxValue = null;
    returnJSON.minValue = null;
  }


  if (returnJSON.avg !== null){
    var numOfValuesHigherThan0 = 0;
    var numOfValuesHigherThan20 = 0;
    var numOfValuesHigherThan40 = 0;
    var numOfValuesHigherThan50 = 0;
    var numOfValuesHigherThan80 = 0;

    for (var key3 in currentDataItemToShow){
      if ((currentDataItemToShow[key3][1] >= 0) && (currentDataItemToShow[key3][1] <= 20)){
        numOfValuesHigherThan0 ++;
      } else if ((currentDataItemToShow[key3][1] > 20) && (currentDataItemToShow[key3][1] <= 40)){
        numOfValuesHigherThan20 ++;
      } else if ((currentDataItemToShow[key3][1] > 40) && (currentDataItemToShow[key3][1] <= 50)){
        numOfValuesHigherThan40++;
      } else if ((currentDataItemToShow[key3][1] > 50) && (currentDataItemToShow[key3][1] <= 80)){
        numOfValuesHigherThan50++;
      } else {
        numOfValuesHigherThan80++;
      }
    }

    returnJSON.numOfValuesHigherThan0 = numOfValuesHigherThan0;
    returnJSON.numOfValuesHigherThan20 = numOfValuesHigherThan20;
    returnJSON.numOfValuesHigherThan40 = numOfValuesHigherThan40;
    returnJSON.numOfValuesHigherThan50 = numOfValuesHigherThan50;
    returnJSON.numOfValuesHigherThan80 = numOfValuesHigherThan80;
  } else {
    returnJSON.numOfValuesHigherThan0 = null;
    returnJSON.numOfValuesHigherThan20 = null;
    returnJSON.numOfValuesHigherThan40 = null;
    returnJSON.numOfValuesHigherThan50 = null;
    returnJSON.numOfValuesHigherThan80 = null;
  }
  console.log('start: ' + returnJSON.dataMinIndex);
  console.log('end: ' + returnJSON.dataMaxIndex);

  console.log('length: ' + currentDataItem.length);
  res.write(JSON.stringify(returnJSON));
  res.end();
});

app.post('/sendChanges',bodyparser.json(), function(req, res){
  var changes = req.body;
  console.log(changes);
  //send changes to backend engine
  console.log('Successful change!!');
  res.writeHead(200,{'Content-Type': 'text/plain'});
  res.end();
});



//Importer Part

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
          var array = JSON.parse(data);
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

      //kafka messager part
      receiver.removeTopics([client.id], function(err, removed){
        if(removed){
          console.log('removed: ' + removed);
        }else {
          console.log('err: ' + err);
        }
      });


      client.on('stopReceiveMessage', function(){
        receiver.removeTopics([client.id], function(err, removed){
          if(removed){
            console.log('removed: ' + removed);
          }else {
            console.log('err: ' + err);
          }
        });
      });
    });


    //chatter part

    client.on("messages",function(nickname,messages,color){
      var message = {
        'nickname' : nickname,
        'message': messages,
        'color': color
      };
      console.log(messages);
      client.broadcast.emit("messages", nickname, messages,color);
      messageDB.push(message);
      if (messageDB.length >= 10) {
        messageDB.pop();
      }
    });

    //kafka messager part
    var created = false;
    var isAdded = false;


    receiver.on('message', function(message){
      console.log('New Message Coming!');
      client.emit('messageToAngular', message);
    });





    client.on('whatIsTheId', function(){
      if (!created){
        sender.createTopics([client.id], true, function (err, data) {
          console.log(data);
          created = true;
          var messageToSend = [{topic : client.id, messages : ['default']}];
          console.log(messageToSend);
          sender.send(messageToSend, function (err, data) {
            console.log('callback data:' +　data);

            var topicToAdd = [client.id];
            console.log(topicToAdd);

            if (!isAdded){
              receiver.addTopics(topicToAdd, function(err, added){
                console.log("add function called");
                if (added) {
                  console.log('add success result: '+ added);
                  isAdded = true;
                } else {
                  console.log('add err result: ' + err );
                }
              });
            }

          });
        });
      }
    });

    client.on('sendMessageToTopic', function(message){

      console.log(message);

      sender.send(message, function (err, data) {
        console.log('callback data:' +　data);

        var topicToAdd = [client.id];
        console.log(topicToAdd);

        if (!isAdded){
          receiver.addTopics(topicToAdd, function(err, added){
            console.log("add function called");
            if (added) {
              console.log('add success result: '+ added);
              isAdded = true;
            } else {
              console.log('add err result: ' + err );
            }
          });
        }

      });
    });




  });


  //chatter part
  app.get("/getHistoryMessages", function(req,res){
    console.log(messageDB);
    res.write(JSON.stringify(messageDB));
    res.end();
  });

  server.listen(3000);
  console.log("Express Server Is Listenning at 3000");
