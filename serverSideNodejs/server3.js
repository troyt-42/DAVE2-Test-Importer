var express = require('express');
var kafka = require('kafka-node');
var bodyparser = require('body-parser');
var io = require('socket.io');
var http = require('http');
var Q = require('q');


var app = express();
var server = http.createServer(app);
var socket = io.listen(server);


server.listen(3000);
console.log("Express Server Is Listenning at 3000");

app.use(express.static(__dirname + '/kafka_testUI'));


socket.on('connection', function(client){
  var kafkaClient = new kafka.Client('10.3.83.235:2181/troy_kafka0.8');
  var producer = kafka.HighLevelProducer;
  var consumer = kafka.HighLevelConsumer;

  var sender = new producer(kafkaClient);

  var receiver = new consumer(kafkaClient, [{topic : 'default'}], {});

  receiver.on('message', function(message){
    console.log('New Message Coming!');
    client.emit('messageToAngular', message);
  });

  receiver.on('err', function(err){
    console.log('err: ' + err);
  });

  receiver.on('offsetOutOfRange', function(err){
    console.log('offset out of range err: ' + err);
  });



  console.log("Connected!" + client.handshake.address);


  client.on('createTopic', function(){

    sender.createTopics([client.id], true, function (err, data) {
      console.log(data);
    });

    Q.fcall(function(){
      return sender.send([{topic: client.id, messages: 'test'}], function(err, data){
        console.log(data);
        console.log(err);
      });
    }).then(function(){
      return receiver.addTopics([client.id], function(err, added){
        if (added) {
          console.log('add success result: '+ added);
          client.emit('created', client.id);
        } else {
          console.log('add err result: ' + err );
        }
      });
    }).fail(function(err){
      throw err;
    });




  });

  client.on('sendMessageToTopic', function(message){

    console.log(message);
    sender.send(message, function (err, data) {
      console.log(data);
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
