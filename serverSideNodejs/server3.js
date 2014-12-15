var express = require('express');
var kafka = require('kafka-node');
var bodyparser = require('body-parser');
var io = require('socket.io');
var http = require('http');


var app = express();
var server = http.createServer(app);
var socket = io.listen(server);


server.listen(3000);
console.log("Express Server Is Listenning at 3000");

app.use(express.static(__dirname + '/kafka_testUI'));


var kafkaClient = new kafka.Client('10.3.83.235:2181/');
var producer = kafka.HighLevelProducer;
var consumer = kafka.HighLevelConsumer;

var sender = new producer(kafkaClient);
var receiver = new consumer(kafkaClient, [{topic:'default'}], {});



socket.on('connection', function(client){


  var created = false;
  var isAdded = false;


  receiver.on('message', function(message){
    console.log('New Message Coming!');
    client.emit(uniqueEventName, message);
  });

  console.log("Connected!" + client.handshake.address);
  client.emit('created', client.id);


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

  client.on('disconnect', function(){
    receiver.removeTopics([client.id], function(err, removed){
      if(removed){
        console.log('removed: ' + removed);
      }else {
        console.log('err: ' + err);
      }
    });
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
