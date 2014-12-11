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

uiModels.controller("dipControllGraphEditCtrl", ['$scope','currentGraphConfig','$http','$modalInstance', '$modal','$timeout',
function($scope,currentGraphConfig, $http,$modalInstance,$modal,$timeout){
  var chartConfig = currentGraphConfig;

  var chartChanges = {};


  $timeout(function(){
    $('#dipModalChartContainer').highcharts(chartConfig);
  }, 400);

  $scope.avaliableOptions = [
  ['Type', ['Pie', 'Column', 'Area','AreaSpline', 'Line','Spline']],
  ['Color' , ['Red', 'Black', 'Green']],
  ['Data' , []],
  ['Logic' , []]
  ];

  $scope.applyChange = function(category, option){
    if(category === 'Type'){
      var newConfig = {
        type: option.toLowerCase()
      };

      chartChanges.type = option.toLowerCase();
      console.log(newConfig);

      $('#dipModalChartContainer').highcharts().series[0].update(newConfig);

    } else if (category === 'Color'){
      var newConfig2 = {
        color : option.toLowerCase()
      };

      chartChanges.color = option.toLowerCase();
      $('#dipModalChartContainer').highcharts().series[0].update(newConfig2);
    }
  };

  $scope.editControllGraphDone = function(){
    $scope.$emit("controllGraphChanged", chartChanges);
    $modalInstance.close();

  };

  $scope.cancelControllGraphEdit = function(){
    $modalInstance.dismiss('cancel');
  };



}]);

uiModels.controller("dipDefaultMenuCtrl", ['$scope','fieldsInfo','$http','$modalInstance', '$modal',
function($scope,fieldsInfo, $http,$modalInstance){
  $scope.fieldsInfo = fieldsInfo;

  $scope.selectField = function(field){
    if (($scope.fieldsInfo.avaliable.indexOf(field) !== -1) && ($scope.fieldsInfo.selection.indexOf(field) === -1)){
      $scope.fieldsInfo.selection.push(field);
      console.log($scope.fieldsInfo.selection);
    } else if ($scope.fieldsInfo.avaliable.indexOf(field) !== -1) {
      console.log('Not avaliable!');
    } else {
      console.log('Already existing');
    }
  };

  $scope.deleteField = function(field){
    if (($scope.fieldsInfo.avaliable.indexOf(field) !== -1) && ($scope.fieldsInfo.selection.indexOf(field) !== -1)){
      var index  = $scope.fieldsInfo.selection.indexOf(field);
      console.log(index);
      $scope.fieldsInfo.selection.splice(index, 1);
      console.log($scope.fieldsInfo);
    } else if ($scope.fieldsInfo.avaliable.indexOf(field) !== -1) {
      console.log('Not avaliable!');
    } else {
      console.log('Doesnt existing');
    }
  };

  $scope.changeOrderTo = function(field, index){
    if (($scope.fieldsInfo.selection[index] !== field) && ($scope.fieldsInfo.selection.indexOf(field) !== -1)){
      var orig = $scope.fieldsInfo.selection.indexOf(field);
      var otherField = $scope.fieldsInfo.selection[index];
      $scope.fieldsInfo.selection.splice(orig, 1, otherField);
      $scope.fieldsInfo.selection.splice(index, 1, field);
    }
  };

  $scope.fomatter = function(){
    return {'defaultFields' : $scope.fieldsInfo};
  };

  $scope.editDefaultDone = function(){
    var sendChanges = $http.post('/sendChanges', $scope.fomatter())
    .success(function(data){
      console.log("Successful Change!");
      $scope.$emit('defaultFieldsChanged', $scope.fieldsInfo);
    }).error(function(err){
      alert("Change Failed!");
      console.log(err);
    });

    $modalInstance.close(sendChanges);
  };

  $scope.cancelEditDefault = function(){
    $modalInstance.dismiss('cancel');
  };

}]);


uiModels.controller("dipDefaultGraphMenuCtrl", ['$scope','currentRange','$http','$modalInstance', '$modal',
function($scope,currentRange , $http,$modalInstance){

  $scope.avaliableOptions = [['Color'],
  ['Sub-Lines-1',[0, 5, 10, 15, 20, 25, 30, 35, 40]],
  ['Sub-Lines-2',[0, 5, 10, 15, 20, 25, 30, 35, 40]],
  ['Sub-Lines-3',[0, 5, 10, 15, 20, 25, 30, 35, 40]]];

  $scope.decideWetherActive = function(category, option){
    console.log(option);
    if (category === 'Sub-Lines-1'){
      console.log('rangeA');
      if(option === currentRange.rangeA){
        return true;
      } else {
        return false;
      }
    } else if (category === 'Sub-Lines-2'){

      console.log('rangeB');
      if(option === currentRange.rangeB){
        return true;
      } else {
        return false;
      }

    } else if (category === 'Sub-Lines-3'){

      console.log('rangeC');
      if(option === currentRange.rangeC){
        return true;
      } else {
        return false;
      }

    }

  };

  $scope.applyChange = function(category, option){
    if (category === 'Sub-Lines-1'){

      currentRange.rangeA = option;

    } else if (category === 'Sub-Lines-2'){

      currentRange.rangeB = option;
    } else if (category === 'Sub-Lines-3'){

      currentRange.rangeC = option;
    }
  };

  $scope.editDeafultGraphDone = function(){
    $modalInstance.close($scope.$emit('rangeChanged',currentRange));
  };

  $scope.cancelEditDeafultGraph = function(){
    $modalInstance.dismiss("cancel");
  };
}]);

uiModels.controller("dipValueCtrl", ['$scope','$http','valueToEdit','$modalInstance',
function($scope, $http,valueToEdit, $modalInstance){
  $scope.value = angular.copy(valueToEdit);
  $scope.originalValue = valueToEdit;


  $scope.editValueDone = function(){

    $modalInstance.close($scope.$emit("tableValueChanged", {new : $scope.value, original : $scope.originalValue}));
  };

  $scope.cancelEditValue = function(){
    $modalInstance.dismiss("cancel");
  };

}]);
