var exportApp = angular.module("exportApp", []);

exportApp.controller("exportCtrl",['$scope','$http', function($scope,$http){
  $scope.avaliableOptions = [
  ['Type']
  ];
}]);
