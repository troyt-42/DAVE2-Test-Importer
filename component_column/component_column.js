var columnComponent = angular.module("columnComponent", []);

columnComponent.directive("daveColumn", function(){
  return {
    restrict : 'E',
    templateUrl :"component_column/component_column.html",
    scope:{
      headers : "=",
      fieldValues : "="
    }
  };
});
