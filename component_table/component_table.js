var tableComponent = angular.module("tableComponent", []);

tableComponent.directive("daveTable", function(){
  return {
    restrict : 'E',
    templateUrl :"component_table/component_table.html",
    scope:{
      headers : "=",
      fieldValues : "="
    }
  };
});
