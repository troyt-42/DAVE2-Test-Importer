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
        $scope.headerValues ={};
        if($scope.rows[0]){
          $scope.headers = Object.keys($scope.rows[0]);
          console.log($scope.rows[0]);
          console.log($scope.headers);

        } else {
          $scope.headers = ['Error: empty content!'];
        }

        $scope.choseThisItem = function(item){
          $scope.$emit('choseThisItem', item);
        };

        $scope.inputChanged = function(header){
          $scope.$emit('inputChanged', header, $scope.headerValues[header]);
        };
      }
  };
});
