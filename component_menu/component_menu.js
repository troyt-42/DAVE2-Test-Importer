var menuComponent = angular.module("menuComponent", []);

menuComponent.directive("daveMenu", function(){
  return {
    restrict : "E",
    templateUrl : "component_menu/component_menu.html",
    transclude :true,
    scope : {
      header : '='
    },
    controller : function($scope){
      console.log($scope.header);
    }
  };
});

menuComponent.directive("daveMenuField",function(){
  return {
    restrict : "E",
    templateUrl : "component_menu/component_menu_field.html",
    scope : {
      fieldLabel : "=",
      fieldType : "=",
      selectOptions : "=",
      placeToReturn : "="
    },
    controller : function($scope){
      console.log($scope.placeToReturn);
    }
  };
});

menuComponent.directive("daveFunctionalButton", function(){
  return {
    restrict : "E",
    templateUrl : "component_menu/component_menu_functional_button.html",
    scope : {
      buttonType : "=",
      functionDetail : "=",
      buttonName : "="
    }
  };
});
