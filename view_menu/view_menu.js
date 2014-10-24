var menuApp = angular.module("menuApp", []);

menuApp.directive("daveMenu", function(){
  return {
    restrict : "E",
    templateUrl : "view_menu/view_menu.html",
    transclude :true,
    scope : {
      header : '='
    },
    controller : function($scope){
      console.log($scope.header);
    }
  };
});

menuApp.directive("daveMenuField",function(){
  return {
    restrict : "E",
    templateUrl : "view_menu/view_menu_field.html",
    scope : {
      fieldLabel : "=",
      fieldType : "=",
      selectOptions : "="
    },
    controller : function($scope){
      console.log($scope.fieldLabel);
      console.log($scope.fieldType);
      console.log($scope.selectionOptions);
    }
  };
});
