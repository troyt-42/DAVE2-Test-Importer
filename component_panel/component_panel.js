var panelComponent = angular.module("panelComponent", []);

panelComponent.directive("davePanel", function(){
  return {
    restrict : "E",
    templateUrl : "component_panel/component_panel.html",
    transclude : true,
    scope : {
      panelHeading : "@"
    }
  };
});
