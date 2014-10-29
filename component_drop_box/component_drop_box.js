var dropBoxComponent = angular.module("dropBoxComponent", []);


dropBoxComponent.directive("daveDropBoxData", function(){
  return {
    restrict : "E",
    templateUrl : "component_drop_box/component_drop_box_data.html",
    scope : {
      boxName : "@",
      boxContent : "@"
    },
    transclude : true,
    controller : function($scope){
      $scope.extendField = false;

      $scope.dropAction = function(){
        var temp = [];
        temp.push("Date");
        temp.push($scope.boxName);
        temp.push($scope.boxContent);
        console.log(temp);
        $scope.$emit("Confirm", temp);

        if ($scope.extendField){
          $scope.extendField = false;
        } else {
          $scope.extendField = true;
        }

        $scope.$emit("Close Others");
      };

      $scope.$on("Close", function(event, sender){

        console.log(angular.equals(sender, event.currentScope));
        console.log(sender);
        console.log(event.currentScope);
        if(sender !== event.currentScope){
          event.currentScope.extendField = false;
        }
      });
    }
  };
});

dropBoxComponent.directive("daveDropBoxMeta", function(){
  return {
    restrict : "E",
    templateUrl : "component_drop_box/component_drop_box_meta.html",
    scope : {
      boxName : "@",
      boxContent : "@"
    },
    controller : function($scope){
      $scope.dropAction = function(){

      };
    }
  };
});
