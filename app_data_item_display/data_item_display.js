var dataItemDisplay = angular.module('dataItemDisplay', ['ui.bootstrap', 'btford.socket-io','panelComponent', 'tableComponent', 'menuComponent','highcharts-ng']);

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

dataItemDisplay.controller('dataItemDisplayCtrl', ['initialData','$http', '$scope','customizedFilter', function(initialData,$http, $scope,customizedFilter){
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
      $scope.mainAreaClass = 'col-md-12';
    } else {
      $scope.expand = true;
      $scope.mainAreaClass = 'col-md-9';
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

  $scope.chartConfig = {
    chart: {
      type: 'spline'
    },
    title: {
      text: $scope.itemName
    },
    subtitle: {
      text: 'Data item display graph'
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { // don't display the dummy year
      month: '%e. %b',
      year: '%b'
    },
    title: {
      text: 'Date'
    }
  },
  yAxis: {
    title: {
      text: 'Data Item Values'
    },
    min: 0
  },
  tooltip: {
    headerFormat: '<b>{series.name}</b><br>',
    pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
  },

  series: [{
    name: $scope.itemName,
    // Define the data points. All series have a dummy year
    // of 1970/71 in order to be compared on the same x axis. Note
    // that in JavaScript, months start at 0 for January, 1 for February etc.
    data: $scope.itemData,
    color: $scope.getRandomColor()
  }]
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
  $scope.chartConfig.series[0].name = $scope.itemName;
  $scope.chartConfig.title.text = $scope.itemName;
  $scope.loading = true;

  $http.get('http://10.3.86.65:3000/getfile/' +　item.Id + ".json").success(function(data){
    $scope.itemDetails = data.details;
    var result = [];

    for (var key in data.data){
      var date = Date.parse(data.data[key].Date);
      var value = data.data[key].Value;
      var sub = [date, value];
      result.push(sub);
    }

    result.sort(function(a, b){
      return a[0] - b[0];
    });
    $scope.itemData = result;
    $scope.chartConfig.series[0].data = $scope.itemData;
    $scope.chartConfig.series[0].color = $scope.getRandomColor();
    console.log($scope.itemData);
    $scope.loading = false;
    $scope.chosen = true;


  }).error(function(){
    alert("Request DataItem Value Failed! Please Try Again");
    $scope.loading = false;
  });


});

$scope.$on('inputChanged', function(event, fieldname,fieldvalue){
  console.log(event.name);
  console.log(fieldname);
  console.log(fieldvalue);
  $scope.applyFilter(fieldname, fieldvalue);
});

}]);
