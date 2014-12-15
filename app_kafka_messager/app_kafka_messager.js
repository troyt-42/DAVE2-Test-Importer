var kafkaMessager = angular.module('kafkaMessager',['btford.socket-io']);


kafkaMessager.controller('kafkaMessagerCtrl', ['$http','$scope','daveSocket', function($http, $scope, daveSocket){

  $scope.topicName = '';

  $scope.messageToSend = '';
  $scope.messages = [];
  $scope.topicsCreated = [];


  $scope.notempty = false;

  daveSocket.on('messageToAngular', function(data){
    $scope.messages.push(data);
    console.log('Update!');
  });

  daveSocket.on('created', function(topic){
    $scope.topicName = topic;
  });

  daveSocket.emit('whatIsTheId');

  $scope.sendMessageToTopic = function(){
    var message = [{
      topic: $scope.topicName,
      messages: [$scope.messageToSend]
    }];
    daveSocket.emit('sendMessageToTopic', message);
    $scope.messageToSend = '';
  };

  $scope.unsubscribeTopic = function(){
    daveSocket.emit('stopReceiveMessage');
  };
}]);
