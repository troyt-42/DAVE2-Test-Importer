var selectionComponent = angular.module("selectionComponent", []);

selectionComponent.directive("daveSelection", function(){
  return {
    restrict : "E",
    templateUrl : "component_selection/component_selection.html",
    scope : {
      d2MetaData : "=",
      d2Data : "=",
      fieldDetails : "="
    },
    controller : function($scope){
      console.log($scope.d2MetaData.filename);
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
        $scope.decided = true;
        $scope.$emit("Decided", $scope.dataToReturn);
      };

      $scope.cancelSelection = function(){
        $scope.$emit("Canceled");

        $scope.decided = false;
        $scope.selectedFields = {};

        if ($scope.unSelected !== []){
          for(var key in $scope.unSelected){
            if ($scope.unSelected[key] === false){
              $scope.unSelected[key] = true;
            }
          }
        }

        $scope.dataToReturn = [];
      };

      $scope.submitSelection =function(){
        $scope.$emit("Submit");
      }

    }
  };
});
