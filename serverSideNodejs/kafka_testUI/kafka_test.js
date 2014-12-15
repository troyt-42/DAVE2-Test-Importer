var kafkaTestApp = angular.module('kafkaTestApp',['btford.socket-io']);


kafkaTestApp.factory('kafkaSocket',function(socketFactory){
  var socket = io.connect('http://10.3.86.65:3000/');

  return socketFactory({
    ioSocket: socket
  });
});


kafkaTestApp.controller('kafkaTestCtrl', ['$http','$scope','kafkaSocket', function($http, $scope, kafkaSocket){

  $scope.topicName = '';

  $scope.messageToSend = '';
  $scope.messages = [];


  $scope.notempty = false;

  kafkaSocket.on('messageToAngular', function(data){
    $scope.messages.push(data);
    console.log('Update!');
  });

  kafkaSocket.on('created', function(topic){
    $scope.topicName = topic;
  });



  $scope.sendMessageToTopic = function(){
    var message = [{
      topic: $scope.topicName,
      messages: [$scope.messageToSend]
    }];
    kafkaSocket.emit('sendMessageToTopic', message);
    $scope.messageToSend = '';
  };

  $scope.unsubscribeTopic = function(){
    kafkaSocket.emit('stopReceiveMessage');
  };
}]);
