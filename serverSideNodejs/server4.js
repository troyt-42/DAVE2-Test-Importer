var express = require('express');
var kafka = require('kafka-node');
var bodyparser = require('body-parser');
var io = require('socket.io');
var http = require('http');


var kafkaClient = new kafka.Client('10.3.83.235:2181/troy_kafka0.8');
var producer = kafka.HighLevelProducer;
var consumer = kafka.HighLevelConsumer;

var sender = new producer(kafkaClient);

var receiver = new consumer(kafkaClient, [{topic:'1'}, {topic:'2'}], {});


receiver.removeTopics(['1'], function(err, removed){
  if(removed){
    console.log('removed: ' + removed);
  }else {
    console.log('err: ' + err);
  }
});

receiver.on('message', function(message){
  console.log(message);
});
