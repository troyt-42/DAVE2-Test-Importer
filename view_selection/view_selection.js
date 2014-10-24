var selectionApp = angular.module("selectionApp", []);

selectionApp.directive("daveSelection", function(){
  return {
    restrict : "E",
    templateUrl : "view_selection/view_selection.html",
    scope : {
      d2MetaData : "=",
      d2Data : "="
    },
    controller : function($scope){
      console.log($scope.d2MetaData);
      console.log($scope.d2Data);

      $scope.decided = false;
      $scope.selectedFields = {};
      $scope.unSelected = [];

      $scope.dataToReturn = [];


      $scope.selectField = function(field){
        $scope.selectedFields[field] = {};
      };

      $scope.defineFieldDetail = function(field, detail, value){
        $scope.selectedFields[field][detail] = value;
      };

    }
  };
});
