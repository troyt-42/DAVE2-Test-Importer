var uiModels = angular.module('dip_angularui_models', ['ui.bootstrap', 'panelComponent']);

uiModels.controller('dipDetailEditCtrl', ['$scope','detailData','$http','$modalInstance', '$modal', function($scope,detailData, $http,$modalInstance,$modal){
  console.log(detailData);
  $scope.detailData = detailData;
  console.log($scope);

  $scope.editDetailDone = function(){

    var sendChanges = $http.post('sendChanges', $scope.detailData)
    .success(function(){
      console.log("Changed!");
      $scope.$emit('detailChanged', $scope.detailData);
    }).error(function(err){
      console.log(err);
      alert('Edit failed');
    });
    $modalInstance.close(sendChanges);


  };

  $scope.createNewField = function(){
    $modal.open({
      templateUrl: 'app_data_item_display/dip_angularui_models/dip_detail_create.html',
      controller: 'dipDetailCreateCtrl',
      resolve: {
        detailData: function () {
          return   angular.copy($scope.detailData);
        }
      },
      scope : $scope
    });
  };


  $scope.deleteField = function(field){
    var index = $scope.detailData.indexOf(field);

    $scope.detailData.splice(index, 1);
  };

  $scope.cancelEditDetail = function(){
    $modalInstance.dismiss("cancel");
  };

  $scope.$on('createdNewDetail', function(event, data){
    $scope.detailData = data;
  });
}]);

uiModels.controller('dipDetailCreateCtrl', ['$scope','detailData','$http','$modalInstance', '$modal', function($scope,detailData, $http,$modalInstance,$modal){
  $scope.fieldname = '';
  $scope.fieldvalue = '';
  $scope.detailData = detailData;

  $scope.createDetailDone = function(){
    if ($scope.fieldname && $scope.fieldvalue){
      $scope.detailData.push({
        fieldname: $scope.fieldname,
        fieldvalue : $scope.fieldvalue
      });

      var sendChanges = $http.post('sendChanges', $scope.detailData)
      .success(function(){
        console.log("Changed!");
        $scope.$emit('createdNewDetail', $scope.detailData);
      }).error(function(err){
        console.log(err);
        alert('Create failed');
      });
      $modalInstance.close(sendChanges);
    }

  };




  $scope.cancelCreateDetail = function(){
    $modalInstance.dismiss("cancel");
  };
}]);

uiModels.controller("dipControllGraphEditCtrl", ['$scope','currentGraphConfig','$http','$modalInstance', '$modal',
 function($scope,currentGraphConfig, $http,$modalInstance){

 }]);

 uiModels.controller("dipDefaultMenuCtrl", ['$scope','fieldsInfo','$http','$modalInstance', '$modal',
 function($scope,fieldsInfo, $http,$modalInstance){
   $scope.fieldsInfo = fieldsInfo;

 }]);
