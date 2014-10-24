var myApp = angular.module("myApp", ["selectionApp", "menuApp"]);


myApp.controller("importerCtrl", ["$scope", function($scope){
  $scope.filesMetaData = [
  {filename:"VCDaveImport.csv",name:"test",fileURL:"10.3.86.65:8888/Importer/serverSideNodejs/upload/troy/VCDaveImport Thu Oct 23 2014 14:32:30 GMT-0400 (EDT).csv"},
  {filename:"Fuel_Ethanol_Import.csv",name:"test",fileURL:"10.3.86.65:8888/Importer/serverSideNodejs/upload/troy/Fuel_Ethanol_Import Thu Oct 23 2014 14:32:30 GMT-0400 (EDT).csv"}
  ];

  $scope.filesData = {};

  $scope.filesData["VCDaveImport.csv"] = ["field1", "field2", "field3"];
  $scope.filesData["Fuel_Ethanol_Import.csv"] = ["field4", "field5", "field6"];

}]);
