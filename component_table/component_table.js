var tableComponent = angular.module('tableComponent', []);

tableComponent.filter('sortObjectToArray', function(){
  return function(input, standardArray){
    var result = [];
    for (var key in standardArray){
       if(input[standardArray[key]]) {
        result.push(input[standardArray[key]]);
      } else {
        alert("Error: sort row to column fails");
      }
    }
    return result;
  };
});

tableComponent.directive('daveTable', function(){
  return {
      restrict: "E",
      templateUrl : "component_table/component_table.html",
      scope : {
        rows : '='
      },
      controller : function($scope){
        if($scope.rows[0]){
          $scope.headers = Object.keys($scope.rows[0]);

        } else {
          $scope.headers = ['Error: empty content!'];
        }

        $scope.choseThisItem = function(item){
          $scope.$emit('choseThisItem', item);
        };
      }
  };
});
