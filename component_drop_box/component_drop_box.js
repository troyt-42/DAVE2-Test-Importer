var dropBoxComponent = angular.module("dropBoxComponent", []);


dropBoxComponent.directive("daveDropBoxData", function(){
  return {
    restrict : "E",
    templateUrl : "component_drop_box/component_drop_box_data.html",
    scope : {
      boxName : "@",
      boxContent : "@",
      placeToDrop : "="
    },
    transclude : true,
    controller : function($scope){
      $scope.extendField = false;
      $scope.dropAction = function(){
        $scope.boxContent = eval($scope.boxContent);
        console.log(typeof $scope.boxContent);
        console.log($scope.boxContent);
        for(var i = 0; i < $scope.placeToDrop.length; i++){
          var fieldName = Object.keys($scope.boxContent[i])[0];
          $scope.placeToDrop[i][fieldName] = $scope.boxContent[i][fieldName];
        }
        $scope.extendField = !$scope.extendField;
        console.log($scope.extendField);
      };
    }
  };
});

dropBoxComponent.directive("daveDropBoxMeta", function(){
  return {
    restrict : "E",
    templateUrl : "component_drop_box/component_drop_box_meta.html",
    scope : {
      boxName : "@",
      boxContent : "@",
      placeToDrop : "="
    },
    controller : function($scope){
      $scope.dropAction = function(){
        console.log($scope.boxContent);
        console.log(typeof $scope.boxContent);
        $scope.boxContent = JSON.parse($scope.boxContent);
        var fieldName = Object.keys($scope.boxContent);
        var fieldDetails = $scope.boxContent[fieldName];
        var fieldDetailsNames = Object.keys(fieldDetails);
        for (var i = 0; i < fieldDetailsNames.length; i++){
          var detailName = fieldDetailsNames[i];
          $scope.placeToDrop[fieldName][detailName] = fieldDetails[detailName];
        }
      };
    }
  };
});
