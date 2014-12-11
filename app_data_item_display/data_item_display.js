var dataItemDisplay = angular.module('dataItemDisplay', ['ui.bootstrap', 'btford.socket-io','panelComponent', 'tableComponent', 'menuComponent','infinite-scroll','dip_angularui_models']);

/*dataItemDisplay.factory('displaySocket',function(socketFactory){
var socket = io.connect('http://10.3.86.65:3000/');

return socketFactory({
ioSocket: socket
});
});*/

dataItemDisplay.filter("customized", function(){
  return function(rawData, keyWord, keyWordValue){
    var result = [];
    rawData.forEach(function(element, index, array){
      if(element[keyWord]){
        if(element[keyWord].indexOf(keyWordValue) > -1){
          result.push(element);
        }
      }
    });
    return result;
  };
});

dataItemDisplay.filter("sortOrder", function(){
  return function(rawData, DataToCompare){
    var result = DataToCompare;
    rawData.forEach(function(element, index, array){
      if( result.indexOf(element) === -1){
        result.push(element);
      }
    });
    console.log(result);
    return result;
  };
});


dataItemDisplay.controller('dataItemDisplayTableCtrl', ['$scope', 'initialData', 'customizedFilter','$modal','$location', function($scope, initialData, customizedFilter, $modal, $location){
  $scope.completeDataSet = initialData.data;

  var chunk = $scope.completeDataSet.slice(0, 10);
  $scope.tableRows = chunk;

  $scope.totalItems = 100;
  $scope.currentPage = 1;
  $scope.maxSize = 10;



  $scope.$watch('currentPage', function(newValue, oldValue){
    console.log("page changed");
    chunk = $scope.completeDataSet.slice(newValue * 10 - 10, newValue * 10);
    $scope.tableRows = chunk;
  });


  $scope.applyFilter = function(keyWord,keyWordValue){
    if(keyWord && keyWordValue){
      $scope.completeDataSet = customizedFilter(initialData.data, keyWord, keyWordValue);
      $scope.tableRows = $scope.completeDataSet.slice($scope.currentPage * 10 - 10, $scope.currentPage * 10);
    } else {
      $scope.tableRows = initialData.data.slice($scope.currentPage * 10 - 10, $scope.currentPage * 10);
    }
  };

  $scope.nameValue = { value : ''};
  $scope.locationValue = {value : ''};
  $scope.ownerValue = { value : ''};
  $scope.idValue = { value : ''};

  $scope.loading = false;
  $scope.itemDetails = [];
  $scope.initial = true;



  $scope.fieldsInfo = {
    avaliable : ['Id', 'Name','Location', 'Owner'],
    selection : ['Id', 'Name','Location', 'Owner']
  };


  $scope.$watch(function(){
    return $scope.fieldsInfo.selection;
  }, function(newValue, oldValue){
    if (newValue.constructor === Array){
      var result = [];
      newValue.forEach(function(element){
        result.push(element);
      });
      $scope.fieldsInfo.avaliable.forEach(function(element, index, array){
        if( result.indexOf(element) === -1){
          result.push(element);
        }
      });
      $scope.fieldsInfo.avaliable = result;
    }
  },true);

  $scope.openDefaultMenuModel = function(){
    $modal.open({
      templateUrl: 'app_data_item_display/dip_angularui_models/dip_defaultmenu.html',
      controller: "dipDefaultMenuCtrl",
      resolve: {
        fieldsInfo : function(){
          return angular.copy($scope.fieldsInfo);
        }
      },
      scope: $scope
    });
  };


  $scope.$on('defaultFieldsChanged', function(event,data){
    console.log(event.name);
    $scope.fieldsInfo = data;
  });

  $scope.$on('choseThisItem', function(event, item){
    $location.url("/dataItemDisplay/item/" + item.Id);
  });

  $scope.$on('inputChanged', function(event, key, keyValue){
    $scope.applyFilter(key, keyValue); //apply filters to the list
  });

}]);


dataItemDisplay.controller('dataItemDisplayGraphCtrl', ['itemId', '$http', '$scope','customizedFilter', '$window','$timeout','$anchorScroll','$location','$modal', function(itemId, $http, $scope,customizedFilter,$window,$timeout, $anchorScroll,$location,$modal){



  //Descripted

  /*$scope.chosen = false;
  $scope.expand = false;
  $scope.mainAreaClass = '';

  $scope.expandFn = function(){
  if($scope.expand){
  $scope.expand = false;
  //$scope.highchartsNGConfig.size.width = $window.innerWidth * 0.74;
  $timeout(function(){
  angular.element($window).triggerHandler('resize');
},1001);
} else {
$scope.expand = true;

$("div #fixedWidth").attr('width', 441);
//$scope.highchartsNGConfig.size.width = $window.innerWidth * 0.55;
$timeout(function(){
angular.element($window).triggerHandler('resize');

console.log($("div #fixedWidth").attr('width'));
},1001);
}
};*/

$scope.getRandomColor = function () {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};



$scope.openDipDetailEditModel = function(){
  $modal.open({
    templateUrl: 'app_data_item_display/dip_angularui_models/dip_detail_edit.html',
    controller: 'dipDetailEditCtrl',
    resolve: {
      detailData: function () {
        return   angular.copy($scope.itemDetails);
      }
    },
    scope : $scope
  });
};

$scope.$on("detailChanged", function(event, data){
  console.log(event.name);
  $scope.itemDetails = data;
});


$scope.openDipControllGraphModel = function(){
  $modal.open({
    templateUrl: 'app_data_item_display/dip_angularui_models/dip_controllgraph_edit.html',
    controller: "dipControllGraphEditCtrl",
    resolve: {
      currentGraphConfig : function(){
        return angular.copy($scope.currentGraphConfig);
      }
    },
    size : 'lg',
    scope:$scope
  });
};

$scope.$on("controllGraphChanged",function(event,data){
  console.log(event.name);
  $("#chartContainer2").highcharts().series[0].update(data);
});




$scope.openDipEditValueModal = function(row){
  $modal.open({
    templateUrl: 'app_data_item_display/dip_angularui_models/dip_value_edit.html',
    controller: "dipValueCtrl",
    resolve: {
      valueToEdit : function(){
        return angular.copy(row);
      }
    },
    scope: $scope
  });
};

$scope.showList = function(){
  $location.url("/dataItemDisplay/initial");
};

$scope.$on("tableValueChanged", function(event, data){
  console.log(event.name);
  console.log(data.original);
  console.log($scope.tableDataMirror);
  var valueToApply = data.new;
  var index = $scope.tableDataMirror.indexOf(Date.parse(valueToApply.Date));
  console.log(index);
  $scope.tableDataToShow[index] = valueToApply;
});


//set up css
var dipTableHeight = $window.innerHeight - 280;
angular.element(".dip-table-innner-container").attr('style', "height:" + dipTableHeight + "px");
angular.element("#chartContainer").attr('style', "height:" + $window.innerHeight * 0.4 + "px");

angular.element("#dipDetailWidget1").attr('style', "height:" + $window.innerWidth * 0.25 + "px;" + "float:left");
angular.element("#dipDetailWidget2").attr('style', "height:" + $window.innerWidth * 0.25 + "px;");
angular.element("#chartContainer2").attr('style', "height:" + $window.innerWidth * 0.20 + "px;" + "width:50%;float:right");
angular.element("#dipDetailWidget3").attr('style', "height:" + $window.innerWidth * 0.25 + "px;" + "float:right");

$scope.avg = "Calculating...";
$scope.maxValue = "Calculating...";
$scope.minValue = "Calculating...";


//$scope.highchartsNGConfig.series[0].name = $scope.itemName;
//$scope.highchartsNGConfig.title.text = $scope.itemName;
$scope.dataItemVolume = 0;

$scope.loading = true;
$http.get('http://10.3.86.65:3000/getfile/' +　itemId + "/4D").success(function(data){
  $scope.itemDetails = data.details;
  $scope.rawItemData = data.data;
  $scope.rawItemDataMirror = data.dataMirror;


  $scope.tableData = $scope.rawItemData;
  $scope.tableDataMirror = $scope.rawItemDataMirror;
  $scope.tableDataToShow = $scope.tableData.slice(0,100);

  $scope.itemData = data.itemData;

  $scope.itemName = data.details[0].fieldvalue;

  if (data.avg !== null){
    $scope.avg = data.avg;
    $scope.maxValue = $scope.tableData[data.maxValueIndex];
    $scope.minValue = $scope.tableData[data.minValueIndex];

    console.log(data);
    console.log($scope.maxValue);
    console.log($scope.minValue);
  } else {
    $scope.avg = 'Not Avaliable';
    $scope.maxValue = 'Not Avaliable';
    $scope.minValue = 'Not Avaliable';
  }
  $scope.numOfValuesHigherThan0 = data.numOfValuesHigherThan0;
  $scope.numOfValuesHigherThan20 = data.numOfValuesHigherThan20;
  $scope.numOfValuesHigherThan40 = data.numOfValuesHigherThan40;
  $scope.numOfValuesHigherThan50 = data.numOfValuesHigherThan50;
  $scope.numOfValuesHigherThan80 = data.numOfValuesHigherThan80;

  $scope.reductionLevel = ['1H','3H','6H','12H', '24H', '2D', '4D'];
  $scope.currentReductionLevel = '4D';
  $scope.dataItemVolume = $scope.itemData.length;

  $scope.changeReductionLevel = function(reduction){
    angular.element('#chartContainer').highcharts().showLoading('Loading data from server ...');

    $scope.loading = true;
    $http.get("/getfile/" + itemId + '/' + reduction).success(function(data){
      if(data.length < 4000){
        angular.element("#chartContainer").highcharts().scrollbar.liveRedraw = true;
      }


      $scope.itemDetails = data.details;
      $scope.rawItemData = data.data;
      $scope.rawItemDataMirror = data.dataMirror;


      $scope.tableData = $scope.rawItemData;
      $scope.tableDataMirror = $scope.rawItemDataMirror;
      $scope.tableDataToShow = $scope.tableData.slice(0,100);
      $scope.dataItemVolume = data.data.length;


      $scope.numOfValuesHigherThan0 = data.numOfValuesHigherThan0;
      $scope.numOfValuesHigherThan20 = data.numOfValuesHigherThan20;
      $scope.numOfValuesHigherThan40 = data.numOfValuesHigherThan40;
      $scope.numOfValuesHigherThan50 = data.numOfValuesHigherThan50;
      $scope.numOfValuesHigherThan80 = data.numOfValuesHigherThan80;

      console.log(data.data);
      angular.element("#chartContainer").highcharts().series[0].setData(data.itemData);

      angular.element("#chartContainer").highcharts().redraw();
      angular.element("#chartContainer").highcharts().xAxis[0].setExtremes(data.itemData[0][0], data.itemData[data.itemData.length -1][0]);
      angular.element("#chartContainer").highcharts().yAxis[0].plotLinesAndBands[0].options.value = $scope.avg; //Add the average plotline
      angular.element('#chartContainer').highcharts().hideLoading();
      $scope.currentReductionLevel = reduction;

      if ($scope.avg === null){
        angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('avg');
      } else {
        angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('avg');
        angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
          value: $scope.avg,
          width: 2,
          color: 'black',
          label: {
            text: 'Average value',
            align: 'right',
            style : {
              'font-weight' : 'bold',
              color: 'red'
            },
            y: 12,
            x: 0
          },
          zIndex : 5,
          id : "avg"
        });
      }

      if ($scope.numOfValuesHigherThan0 === null){
        angular.element("#chartContainer2").highcharts().showLoading("Not Avaliable");
      } else {
        angular.element("#chartContainer2").highcharts().hideLoading();

        angular.element("#chartContainer2").highcharts().yAxis[0].removePlotLine('avg');
        angular.element("#chartContainer2").highcharts().series[0].setData([{
          name : '0 ~ 20',
          y : $scope.numOfValuesHigherThan0 / $scope.tableData.length
        },{
          name : '20 ~ 40',
          y : $scope.numOfValuesHigherThan20 / $scope.tableData.length
        },{
          name : '40 ~ 50',
          y : $scope.numOfValuesHigherThan40 / $scope.tableData.length
        },{
          name : '50 ~ 80',
          y : $scope.numOfValuesHigherThan50 / $scope.tableData.length
        },{
          name : '80 ~ 100',
          y : $scope.numOfValuesHigherThan80 / $scope.tableData.length
        }
        ]);
      }

      $scope.loading = false;

    }).error(function(){
      alert("Change Reduction Level Failed! Please Try Again");
      angular.element('#chartContainer').highcharts().hideLoading();
      $location.url("/dataItemDisplay/initial");

      $scope.loading = false;
    });
  };

  $scope.loadMore = function(){
    var k = $scope.tableDataToShow.length / 100 + 1;

    if($scope.tableData.length > ((k - 1) * 100)){
      if ($scope.tableData.length > (k * 100 )){
        $scope.tableDataToShow = $scope.tableData.slice(0, k * 100);
      } else {
        $scope.tableDataToShow = $scope.tableData;
      }
    }

  };


  $scope.locateToSepecificDate = function(value){
    console.log('Called!');
    var sd = Date.parse(value.Date);
    var index = $scope.rawItemDataMirror.indexOf(sd);

    angular.element("#chartContainer").highcharts().xAxis[0].setExtremes($scope.rawItemDataMirror[index - 50],$scope.rawItemDataMirror[index + 50]);

    console.log($scope.rawItemDataMirror);
    console.log(angular.element("#chartContainer").highcharts().series[0].data);
    angular.element("#chartContainer").highcharts().series[0].data[index].select(true);
  };

  var myTimer = '';


  var rangeA = 20;
  var rangeB = 30;
  var rangeC = 40;
  var upperLine1 = Number($scope.avg) + rangeA;
  var upperLine2 = Number($scope.avg) + rangeB;
  var upperLine3 = Number($scope.avg) + rangeC;
  var lowerLine1 = Number($scope.avg) - rangeA;
  var lowerLine2 = Number($scope.avg) - rangeB;
  var lowerLine3 = Number($scope.avg) - rangeC;
  var controlGraphLines = [
  {
    value: $scope.avg,
    width: 2,
    color: 'black',
    label: {
      text: 'Average value',
      align: 'right',
      style : {
        'font-weight' : 'bold',
        color: 'red'
      },
      y: 12,
      x: 0
    },
    zIndex : 5,
    id : "avg"
  },{
    value: upperLine1,
    width: 1,
    color: 'green',
    zIndex : 5,
    id : "upperLine1",
    dashStyle : "LongDash"
  },{
    value: lowerLine1,
    width: 1,
    color: 'green',
    zIndex : 5,
    id : "lowerLine1",
    dashStyle : "LongDash"
  },{
    value: upperLine2,
    width: 1,
    color: 'brown',
    zIndex : 5,
    id : "upperLine2",
    dashStyle : "LongDash"
  },{
    value: lowerLine2,
    width: 1,
    color: 'brown',
    zIndex : 5,
    id : "lowerLine2",
    dashStyle : "LongDash"
  },{
    value: upperLine3,
    width: 1,
    color: 'red',
    zIndex : 5,
    id : "upperLine3",
    dashStyle : "LongDash"
  },{
    value: lowerLine3,
    width: 1,
    color: 'red',
    zIndex : 5,
    id : "lowerLine3",
    dashStyle : "LongDash"
  }];

  $scope.openDefaultGraphMenuModel = function(){
    $modal.open({
      templateUrl: 'app_data_item_display/dip_angularui_models/dip_default_graphmenu.html',
      controller: "dipDefaultGraphMenuCtrl",
      scope: $scope,
      resolve : {
        currentRange : function(){
          return {
            rangeA : rangeA,
            rangeB : rangeB,
            rangeC : rangeC,
          };
        }
      }
    });
  };

  $scope.$on("rangeChanged", function(event,data){

    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('lowerLine1');
    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('lowerLine2');
    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('lowerLine3');
    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('upperLine1');
    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('upperLine2');
    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('upperLine3');
    rangeA = data.rangeA;
    rangeB = data.rangeB;
    rangeC = data.rangeC;


    var upperLine1 = Number($scope.avg) + rangeA;
    var upperLine2 = Number($scope.avg) + rangeB;
    var upperLine3 = Number($scope.avg) + rangeC;
    var lowerLine1 = Number($scope.avg) - rangeA;
    var lowerLine2 = Number($scope.avg) - rangeB;
    var lowerLine3 = Number($scope.avg) - rangeC;

    angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine(
      {
        value: $scope.avg,
        width: 2,
        color: 'black',
        label: {
          text: 'Average value',
          align: 'right',
          style : {
            'font-weight' : 'bold',
            color: 'red'
          },
          y: 12,
          x: 0
        },
        zIndex : 5,
        id : "avg"
      });
      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
        value: upperLine1,
        width: 1,
        color: 'green',
        zIndex : 5,
        id : "upperLine1",
        dashStyle : "LongDash"
      });
      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
        value: lowerLine1,
        width: 1,
        color: 'green',
        zIndex : 5,
        id : "lowerLine1",
        dashStyle : "LongDash"
      });
      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
        value: upperLine2,
        width: 1,
        color: 'brown',
        zIndex : 5,
        id : "upperLine2",
        dashStyle : "LongDash"
      });
      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
        value: lowerLine2,
        width: 1,
        color: 'brown',
        zIndex : 5,
        id : "lowerLine2",
        dashStyle : "LongDash"
      });
      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
        value: upperLine3,
        width: 1,
        color: 'red',
        zIndex : 5,
        id : "upperLine3",
        dashStyle : "LongDash"
      });
      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
        value: lowerLine3,
        width: 1,
        color: 'red',
        zIndex : 5,
        id : "lowerLine3",
        dashStyle : "LongDash"
      });


    });

    $scope.chartsConfig = {
      chart: {
        backgroundColor: null,
        style: {
          fontFamily: "Dosis, sans-serif"
        },
        type: 'spline',
        zoomType: 'x',
        width: null
      },
      navigator : {
        adaptToUpdatedData : true
      },
      scrollbar : {
        enabled : true,
        liveRedraw : false
      },
      rangeSelector:{
        selected: 5
      },
      legend: {
        itemStyle: {
          fontWeight: 'bold',
          fontSize: '13px'
        }
      },
      xAxis: {
        gridLineWidth: 1,
        labels: {
          style: {
            fontSize: '12px'
          }
        },
        events:{
          afterSetExtremes : function(e){
            $timeout.cancel(myTimer);
            //angular.element('#chartContainer').highcharts().showLoading('Loading data from server ...');
            myTimer = $timeout(function(){
              console.log("!!!!");
              var tem = e;
              if(tem.max){


                var max = tem.max;
                var min = tem.min;


                console.log(new Date(max).toString());
                console.log(new Date(min).toString());

                var dataMinIndex = 0;
                var dataMaxIndex = 1;



                $http.get('/getIndex/' + min + "/" + max)
                .success(function(data){
                  dataMinIndex = data.dataMinIndex;
                  dataMaxIndex = data.dataMaxIndex;

                  $scope.numOfValuesHigherThan0 = data.numOfValuesHigherThan0;
                  $scope.numOfValuesHigherThan20 = data.numOfValuesHigherThan20;
                  $scope.numOfValuesHigherThan40 = data.numOfValuesHigherThan40;
                  $scope.numOfValuesHigherThan50 = data.numOfValuesHigherThan50;
                  $scope.numOfValuesHigherThan80 = data.numOfValuesHigherThan80;
                  //data = data.data;
                  console.log(dataMinIndex);
                  console.log(dataMaxIndex);

                  if(dataMinIndex < dataMaxIndex){
                    $scope.noValueSelectedInTable = false;
                    $scope.tableData = $scope.rawItemData.slice(dataMinIndex,dataMaxIndex);
                    $scope.tableDataMirror = $scope.rawItemDataMirror.slice(dataMinIndex,dataMaxIndex);

                    if ($scope.tableData.length > 100){
                      $scope.tableDataToShow = $scope.tableData.slice(0,100);
                    } else if ($scope.tableData.length <= 100){
                      $scope.tableDataToShow = $scope.tableData;
                    }
                  } else if (dataMinIndex === -1){

                  } else {
                    $scope.noValueSelectedInTable = true;

                    $scope.tableData = [];
                    $scope.tableDataToShow = [];
                  }

                  if (data.avg !== null){
                    $scope.avg = data.avg;
                    $scope.maxValue = $scope.tableData[data.maxValueIndex];
                    $scope.minValue = $scope.tableData[data.minValueIndex];

                    console.log(data);
                    console.log($scope.maxValue);
                    console.log($scope.minValue);
                  } else {
                    $scope.avg = 'Not Avaliable';
                    $scope.maxValue = 'Not Avaliable';
                    $scope.minValue = 'Not Avaliable';
                  }
                  //angular.element('#chartContainer').highcharts().series[0].setData(data);
                  if ($scope.avg === null){
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('avg');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('lowerLine1');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('lowerLine2');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('lowerLine3');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('upperLine1');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('upperLine2');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('upperLine3');


                  } else {
                    var upperLine1 = Number($scope.avg) + rangeA;
                    var upperLine2 = Number($scope.avg) + rangeB;
                    var upperLine3 = Number($scope.avg) + rangeC;
                    var lowerLine1 = Number($scope.avg) - rangeA;
                    var lowerLine2 = Number($scope.avg) - rangeB;
                    var lowerLine3 = Number($scope.avg) - rangeC;

                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('avg');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('lowerLine1');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('lowerLine2');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('lowerLine3');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('upperLine1');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('upperLine2');
                    angular.element("#chartContainer").highcharts().yAxis[0].removePlotLine('upperLine3');

                    angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine(
                      {
                        value: $scope.avg,
                        width: 2,
                        color: 'black',
                        label: {
                          text: 'Average value',
                          align: 'right',
                          style : {
                            'font-weight' : 'bold',
                            color: 'red'
                          },
                          y: 12,
                          x: 0
                        },
                        zIndex : 5,
                        id : "avg"
                      });
                      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
                        value: upperLine1,
                        width: 1,
                        color: 'green',
                        zIndex : 5,
                        id : "upperLine1",
                        dashStyle : "LongDash"
                      });
                      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
                        value: lowerLine1,
                        width: 1,
                        color: 'green',
                        zIndex : 5,
                        id : "lowerLine1",
                        dashStyle : "LongDash"
                      });
                      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
                        value: upperLine2,
                        width: 1,
                        color: 'brown',
                        zIndex : 5,
                        id : "upperLine2",
                        dashStyle : "LongDash"
                      });
                      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
                        value: lowerLine2,
                        width: 1,
                        color: 'brown',
                        zIndex : 5,
                        id : "lowerLine2",
                        dashStyle : "LongDash"
                      });
                      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
                        value: upperLine3,
                        width: 1,
                        color: 'red',
                        zIndex : 5,
                        id : "upperLine3",
                        dashStyle : "LongDash"
                      });
                      angular.element("#chartContainer").highcharts().yAxis[0].addPlotLine({
                        value: lowerLine3,
                        width: 1,
                        color: 'red',
                        zIndex : 5,
                        id : "lowerLine3",
                        dashStyle : "LongDash"
                      });
                    }

                    if ($scope.numOfValuesHigherThan0 === null){
                      angular.element("#chartContainer2").highcharts().showLoading("Not Avaliable");
                    } else {
                      angular.element("#chartContainer2").highcharts().hideLoading();

                      angular.element("#chartContainer2").highcharts().yAxis[0].removePlotLine('avg');
                      angular.element("#chartContainer2").highcharts().series[0].setData([{
                        name : '0 ~ 20',
                        y : $scope.numOfValuesHigherThan0 / $scope.tableData.length
                      },{
                        name : '20 ~ 40',
                        y : $scope.numOfValuesHigherThan20 / $scope.tableData.length
                      },{
                        name : '40 ~ 50',
                        y : $scope.numOfValuesHigherThan40 / $scope.tableData.length
                      },{
                        name : '50 ~ 80',
                        y : $scope.numOfValuesHigherThan50 / $scope.tableData.length
                      },{
                        name : '80 ~ 100',
                        y : $scope.numOfValuesHigherThan80 / $scope.tableData.length
                      }
                      ]);
                    }


                    angular.element('#chartContainer').highcharts().hideLoading();

                  })
                  .error(function(err){
                    alert(err);
                  });
                }
              },500);
            }
          }
        },
        yAxis: {
          minorTickInterval: 'auto',
          title: {
            style: {
              textTransform: 'uppercase'
            }
          },
          labels: {
            style: {
              fontSize: '12px'
            }
          },
          plotLines: controlGraphLines
        },

        tooltip: {
          borderWidth: 0,
          backgroundColor: 'rgba(219,219,216,0.8)',
          shadow: false,
          crosshairs: {
            width: 3,
            color: 'red'
          }
        },

        colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
        "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],

        title : {
          text : $scope.itemName,
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }
        },

        series : [{
          name : $scope.itemName,
          data : $scope.itemData,
          tooltip: {
            valueDecimals: 2
          },
          color:$scope.getRandomColor(),
          marker: {
            enabled: true,
            fillColor: 'gray',
            states : {
              select : {
                fillColor : 'red',
                lineColor : 'black',
                radius : 4
              }
            }
          }
        }]

      };

      $scope.chartsConfig2 = {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: 1,//null,
          plotShadow: false
        },
        title: {
          text: "Distribution of Values"
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}:</b> <br>{point.percentage:.1f} %',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              },
              connectorPadding: 3,
              distance: -30,
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Browser share',
          data: [
          {
            name : '0 ~ 20',
            y : $scope.numOfValuesHigherThan0 / $scope.tableData.length
          },{
            name : '20 ~ 40',
            y : $scope.numOfValuesHigherThan20 / $scope.tableData.length
          },{
            name : '40 ~ 50',
            y : $scope.numOfValuesHigherThan40 / $scope.tableData.length
          },{
            name : '50 ~ 80',
            y : $scope.numOfValuesHigherThan50 / $scope.tableData.length
          },{
            name : '80 ~ 100',
            y : $scope.numOfValuesHigherThan80 / $scope.tableData.length
          }
          ]
        }]
      };

      $scope.chartsConfig3 = {

        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: 1,//null,
          plotShadow: false,

        },
        title: {
          text: "Distribution of Values"
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.y:.2f}</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}:</b> <br>{point.percentage:.1f} %',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            }
          },
          column : {
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}:</b> <br>{point.y:.4f} ',
              style: {

                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            },

            colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
            colorByPoint: true,
            options3d: {
              enabled: true,
              alpha: 15,
              beta: 15,
              depth: 50
            }
          },
          area : {
            marker: {
              fillColor: '#FFFFFF',
              lineWidth: 2,
              lineColor: null // inherit from series
            },
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}:</b> <br>{point.y:.4f} ',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            },
            colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
            color: '#7cb5ec'
          },
          areaspline : {
            marker: {
              fillColor: '#FFFFFF',
              lineWidth: 2,
              lineColor: null // inherit from series
            },
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}:</b> <br>{point.y:.4f} ',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            },
            colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
            color: '#7cb5ec'
          },
          line : {
            marker: {
              fillColor: '#FFFFFF',
              lineWidth: 2,
              lineColor: null // inherit from series
            },
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}:</b> <br>{point.y:.4f} ',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            },
            colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
            color: '#7cb5ec'
          },
          spline: {
            marker: {
              fillColor: '#FFFFFF',
              lineWidth: 2,
              lineColor: null // inherit from series
            },
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}:</b> <br>{point.y:.4f} ',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            },
            colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
            color: '#7cb5ec'
          }
        },
        series: [{
          type: 'column',
          name: 'Values Distribution',
          data: [
          {
            name : '0 ~ 20',
            y : $scope.numOfValuesHigherThan0 / $scope.tableData.length,
            x : 10
          },{
            name : '20 ~ 40',
            y : $scope.numOfValuesHigherThan20 / $scope.tableData.length,
            x : 30
          },{
            name : '40 ~ 50',
            y : $scope.numOfValuesHigherThan40 / $scope.tableData.length,
            x : 45

          },{
            name : '50 ~ 80',
            y : $scope.numOfValuesHigherThan50 / $scope.tableData.length,
            x : 65
          },{
            name : '80 ~ 100',
            y : $scope.numOfValuesHigherThan80 / $scope.tableData.length,
            x : 90
          }
          ]
        }]
      };

      Highcharts.createElement('link', {
        href: 'http://fonts.googleapis.com/css?family=Dosis:400,600',
        rel: 'stylesheet',
        type: 'text/css'
      }, null, document.getElementsByTagName('head')[0]);

      Highcharts.theme = {
        colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
        "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        chart: {
          backgroundColor: null,
          style: {
            fontFamily: "Dosis, sans-serif"
          }
        },
        title: {
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }
        },
        tooltip: {
          borderWidth: 0,
          backgroundColor: 'rgba(219,219,216,0.8)',
          shadow: false
        },
        legend: {
          itemStyle: {
            fontWeight: 'bold',
            fontSize: '13px'
          }
        },
        xAxis: {
          gridLineWidth: 1,
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        yAxis: {
          minorTickInterval: 'auto',
          title: {
            style: {
              textTransform: 'uppercase'
            }
          },
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        plotOptions: {
          candlestick: {
            lineColor: '#404048'
          }
        },


        // General
        background2: '#F0F0EA'

      };

      // Apply the theme
      Highcharts.setOptions(Highcharts.theme);

      if($scope.itemData.length < 4000){
        $scope.chartsConfig.scrollbar.liveRedraw = true;
      }

      //angular.element('#chartContainer').highcharts('StockChart', $scope.chartsConfig);

      $timeout(function(){

        $scope.currentGraphConfig = angular.copy($scope.chartsConfig3);
        angular.element('#chartContainer').highcharts('StockChart', $scope.chartsConfig);
        angular.element('#chartContainer2').highcharts($scope.chartsConfig3);
        angular.element('input.highcharts-range-selector').datepicker();

        $.datepicker.setDefaults({
          dateFormat: 'yy-mm-dd',
          onSelect: function () {
            this.onchange();
            this.onblur();
          }
        });

        $scope.loading = false;
      }, 400);


      $scope.noValueSelectedInTalbe = false;





    }).error(function(){
      alert("Request DataItem Value Failed! Please Try Again");
      $location.url("/dataItemDisplay/initial");

      $scope.loading = false;
    });


  }]);
