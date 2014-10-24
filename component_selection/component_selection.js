var selectionComponent = angular.module("selectionComponent", []);

selectionComponent.directive("daveSelection", function(){
  return {
    restrict : "E",
    templateUrl : "component_selection/component_selection.html",
    scope : {
      d2MetaData : "=",
      d2Data : "=",
      fieldDetails : "=",
      placeToReturn : "="
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

      $scope.decideSelection = function(){
        $scope.dataToReturn = [$scope.d2MetaData,$scope.d2Data, $scope.selectedFields];
        $scope.placeToReturn.value = $scope.dataToReturn;
        $scope.decided = true;
      };

      $scope.cancelSelection = function(){
        $scope.placeToReturn.value = "";
        $scope.dataToReturn = [];
      };

    }
  };
});
