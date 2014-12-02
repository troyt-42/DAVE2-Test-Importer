var panelComponent = angular.module("panelComponent", []);

panelComponent.directive("davePanel", ['$window', function($window){
  return {
    restrict : "E",
    templateUrl : "component_panel/component_panel.html",
    transclude : true,
    scope : {
      panelHeading : "@"
    },
    controller : function($scope, $window){
      var fixedWidth = $window.innerWidth * 0.25;
      fixedWidth = 'width:' + fixedWidth + "px";
      $("div #fixedWidth").attr('style', fixedWidth); // Fix the width so that overflow:hidden attr can be in effect.
      console.log($("div #fixedWidth").attr('width'));

    },

  };
}]);
