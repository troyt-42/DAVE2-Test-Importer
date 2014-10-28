var tableComponent = angular.module("tableComponent", []);

tableComponent.directive("daveTable", function(){
  return {
    restrict : 'E',
    templateUrl :"component_table/component_table.html",
    scope:{
      selectionData : "=",
      fieldValues : "="
    },
    controller : function($scope){
      $scope.headers = Object.keys($scope.selectionData);
    }
  };
});
