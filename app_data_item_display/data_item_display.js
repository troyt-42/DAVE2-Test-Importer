var dataItemDisplay = angular.module('dataItemDisplay', ['ui.bootstrap', 'btford.socket-io','panelComponent', 'tableComponent', 'menuComponent','highcharts-ng','infinite-scroll']);

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

dataItemDisplay.controller('dataItemDisplayCtrl', ['initialData','$http', '$scope','customizedFilter', '$window','$timeout','$anchorScroll','$location', function(initialData,$http, $scope,customizedFilter,$window,$timeout, $anchorScroll,$location){
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


  $scope.chosen = false;
  $scope.expand = false;
  $scope.mainAreaClass = '';

  $scope.expandFn = function(){
    if($scope.expand){
      $scope.expand = false;
      //$scope.highchartsNGConfig.size.width = $window.innerWidth * 0.74;
    } else {
      $scope.expand = true;
      //$scope.highchartsNGConfig.size.width = $window.innerWidth * 0.55;
    }
  };


  $scope.getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };




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


  $scope.$on('choseThisItem', function(event, item){
    console.log(event.name);
    console.log(item);
    console.log(typeof item);


    $scope.itemName = item.Name;
    //$scope.highchartsNGConfig.series[0].name = $scope.itemName;
    //$scope.highchartsNGConfig.title.text = $scope.itemName;
    $scope.loading = true;

    $http.get('http://10.3.86.65:3000/getfile/' +　item.Id + ".json").success(function(data){
      $scope.itemDetails = data.details;
      $scope.rawItemData = data.data;
      $scope.rawItemDataMirror = data.dataMirror;


      $scope.tableData = $scope.rawItemData;
      $scope.tableDataMirror = $scope.rawItemDataMirror;
      $scope.tableDataToShow = $scope.tableData.slice(0,100);

      $scope.itemData = data.itemData;

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

      $scope.destroyGraph = function(){
        angular.element('#chartContainer').highcharts().destroy();
      };

      $scope.chosen = true;
      $('#chartContainer').highcharts('StockChart', {
        chart: {
          backgroundColor: null,
          style: {
            fontFamily: "Dosis, sans-serif"
          },
          type: 'area',
          zoomType: 'x',
          width: null
        },
        navigator : {
          enabled : true
        },
        scrollbar : {
          enabled : true
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
            fillColor: 'gray'
          }
        }]

      });



      $scope.highchartsExtremes = angular.element('#chartContainer').highcharts().xAxis[0].getExtremes();
      $scope.noValueSelectedInTalbe = false;

      var myTimer = '';
      $scope.$watch('highchartsExtremes', function(newValue, oldValue){
        $timeout.cancel(myTimer);

        myTimer = $timeout(function(){
          console.log("!!!!");
          var tem = angular.copy(newValue);
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
              console.log(dataMinIndex);
              console.log(dataMaxIndex);

              if(dataMinIndex < dataMaxIndex){
                $scope.noValueSelectedInTable = false;
                $scope.tableData = $scope.rawItemData.slice(dataMinIndex,dataMaxIndex);

                if ($scope.tableData.length > 100){
                  $scope.tableDataToShow = $scope.tableData.slice(0,100);
                } else if ($scope.tableData.length <= 100){
                  $scope.tableDataToShow = $scope.tableData;
                }
              } else if (dataMinIndex === -1){

              } else {
                $scope.noValueSelectedInTable = true;
              }
            })
            .error(function(err){
              alert(err);
            });
          }
        }, 500);
      }, true);



      $scope.manualRecursionCall(function(){
        $scope.highchartsExtremes = angular.element('#chartContainer').highcharts().xAxis[0].getExtremes();
      }, 100);

      /*$scope.manualRecursionCall(function(){
      angular.element('#chartContainer').highcharts().reflow();
    },0.01);

    $scope.manualRecursionCall(function(){
    console.log(angular.element('.dip-table-innner-container').scrollTop());
    var height = angular.element('.dip-table').height();
    var scrolltop = angular.element('.dip-table-innner-container').scrollTop();
    if((height - scrolltop) < (height / 3)){
    $scope.loadMore();
  }
}, 0.01);*/

$scope.loading = false;



}).error(function(){
  alert("Request DataItem Value Failed! Please Try Again");
  $scope.loading = false;
});
});

$scope.fieldsInfo = {
  avaliable : ['Id', 'Name','Location', 'Owner'],
  selection : []
};

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
    $scope.fieldsInfo.selection.splice(index, 1);
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


$scope.manualRecursionCall = function(functionToCall, interval){


  $timeout(function(){
    functionToCall();
    $scope.manualRecursionCall(functionToCall, interval);
  }, interval);

};



}]);
