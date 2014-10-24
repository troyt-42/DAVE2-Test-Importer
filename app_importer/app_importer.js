var importer = angular.module("importer", ["selectionComponent", "menuComponent",'angularFileUpload']);


importer.controller("importerCtrl", ["$scope", "FileUploader", function($scope, FileUploader){
  $scope.filesMetaData = [
  {filename:"VCDaveImport.csv",name:"test",fileURL:"10.3.86.65:8888/Importer/serverSideNodejs/upload/troy/VCDaveImport Thu Oct 23 2014 14:32:30 GMT-0400 (EDT).csv"},

  ];

  $scope.filesData = {};
  $scope.uploader = new FileUploader({url : "http:///10.3.86.65:3000/upload", removeAfterUpload : false});

  $scope.filesData["VCDaveImport.csv"] = ["field1", "field2", "field3","field4", "field5", "field6","field7", "field8", "field9","field10", "field11", "field12"];


  $scope.fieldDetails = [
  {
    detailName : "Number Type",
    options : ["Int", "Float1", "Float2"]
  },
  {
    detailName : "Unit",
    options : ["meter", "centimeter", "litre"]
  },
  {
    detailName : "Anything",
    options : ["random1", "random2", "random3"]
  }];
  $scope.menuFieldDetail = {
    fieldType : {value : ""},
    fieldName : {value : ""},
    fieldUploader : {value : $scope.uploader}
  };

  $scope.selectedFields = {value : ""};



  $scope.submitUpload = function(){

  };
}]);
