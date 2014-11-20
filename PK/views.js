angular.module('PK.controllers',  ['snap','ngDragDrop','ui.sortable','highcharts-ng'])
// view controllers




.controller('twoCtrl', function($scope, $timeout, $filter, filterFilter) {

  $scope.filterIt = function() {
    return $filter('filter')($scope.list3, $scope.search);
  };

  $scope.list1 = [];
  $scope.list2 = [];
  $scope.list3 = [
  {
    'id': '0001',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Chatham',    'area': 'Distillation', 'description': 'this is item 01'
  },
  {
    'id': '0002',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Chatham',    'area': 'Mashing',    'description': 'this is item 02'
  },
  {
    'id': '0003',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Chatham',    'area': 'Fermentation', 'description': 'this is item 03'
  },
  {
    'id': '0004',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Chatham',    'area': 'Dryers',   'description': 'this is item 04'
  },
  {
    'id': '0005',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Johnstown',  'area': 'Distillation', 'description': 'this is item 05'
  },
  {
    'id': '0006',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Johnstown',  'area': 'Mashing',    'description': 'this is item 06'
  },
  {
    'id': '0007',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Johnstown',  'area': 'Fermentation', 'description': 'this is item 07'
  },
  {
    'id': '0008',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Johnstown',  'area': 'Dryers',   'description': 'this is item 08'
  },
  {
    'id': '0009',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Varennes',   'area': 'Distillation', 'description': 'this is item 09'
  },
  {
    'id': '0010',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Varennes',   'area': 'Mashing',    'description': 'this is item 10'
  },
  {
    'id': '0011',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Varennes',   'area': 'Fermentation', 'description': 'this is item 11'
  },
  {
    'id': '0012',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Varennes',   'area': 'Dryers',   'description': 'this is item 12'
  },
  {
    'id': '0013',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Tiverton',   'area': 'Distillation', 'description': 'this is item 13'
  },
  {
    'id': '0014',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Tiverton',   'area': 'Mashing',    'description': 'this is item 14'
  },
  {
    'id': '0015',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Tiverton',   'area': 'Fermentation', 'description': 'this is item 15'
  },
  {
    'id': '0016',
    'set': '', 'avg': '','min': '','max': '','tot': '','cnt': '','rng': '', 'altdescription': '',  'site': 'Tiverton',   'area': 'Dryers',   'description': 'this is item 16'
  }
  ];

  $scope.startCallback = function(event, ui, id) {
    $scope.message='You started draggin item # ' + id.id + ' inititating callback to get that data for you';
    $scope.draggedId = id.id;
  };

  $scope.dragCallback = function(event, ui) {
    console.log('hey, look I`m flying');
    $scope.message='hey, look I`m flying';
  };

  $scope.stopCallback = function(event, ui) {
    console.log('Why did you stop draggin me?');
    $scope.message='Why did you stop draggin me?';
  };

  $scope.overCallback = function(event, ui) {
    console.log('yup, you got it. drop me here');
    $scope.message='yup, you got it. drop me here';
  };

  $scope.dropCallback = function(event, ui) {
    $scope.message='hey, you dumped item # ' + $scope.draggedId + ' in the correct spot -  I better show you that data';
  };



  $scope.chartTypes = [
  {"id": "line", "title": "Line"},
  {"id": "spline", "title": "Smooth line"},
  {"id": "area", "title": "Area"},
  {"id": "areaspline", "title": "Smooth area"},
  {"id": "column", "title": "Column"},
  {"id": "bar", "title": "Bar"},
  {"id": "pie", "title": "Pie"},
  {"id": "scatter", "title": "Scatter"}
  ];

  $scope.dashStyles = [
  {"id": "Solid", "title": "Solid"},
  {"id": "ShortDash", "title": "ShortDash"},
  {"id": "ShortDot", "title": "ShortDot"},
  {"id": "ShortDashDot", "title": "ShortDashDot"},
  {"id": "ShortDashDotDot", "title": "ShortDashDotDot"},
  {"id": "Dot", "title": "Dot"},
  {"id": "Dash", "title": "Dash"},
  {"id": "LongDash", "title": "LongDash"},
  {"id": "DashDot", "title": "DashDot"},
  {"id": "LongDashDot", "title": "LongDashDot"},
  {"id": "LongDashDotDot", "title": "LongDashDotDot"}
  ];

  $scope.chartSeries = [
  {"name": "Some data", "data": [1, 2, 4, 7, 3]},
  {"name": "Some data 3", "data": [3, 1, null, 5, 2], connectNulls: true},
  {"name": "Some data 2", "data": [5, 2, 2, 3, 5], type: "column"},
  {"name": "My Super Column", "data": [1, 1, 2, 3, 2], type: "column"}
  ];

  $scope.chartStack = [
  {"id": '', "title": "No"},
  {"id": "normal", "title": "Normal"},
  {"id": "percent", "title": "Percent"}
  ];

  $scope.addPoints = function () {
    var seriesArray = $scope.chartConfig.series;
    var rndIdx = Math.floor(Math.random() * seriesArray.length);
    seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20]);
  };

  $scope.addSeries = function () {
    var rnd = [];
    for (var i = 0; i < 6; i++) {
      rnd.push(Math.floor(Math.random() * 8) + 1);
    }
    $scope.chartConfig.series.push({
      type: "column",
      data: rnd
    });
  };

  $scope.removeRandomSeries = function () {
    var seriesArray = $scope.chartConfig.series;
    var rndIdx = Math.floor(Math.random() * seriesArray.length);
    seriesArray.splice(rndIdx, 1);
  };

  $scope.removeSeries = function(id) {
    var seriesArray = $scope.chartConfig.series;
    seriesArray.splice(id, 1);
  };

  $scope.toggleHighCharts = function () {
    this.chartConfig.useHighStocks = !this.chartConfig.useHighStocks;
  };

  $scope.replaceAllSeries = function () {
    var data = [
    { name: "first", data: [10] },
    { name: "second", data: [3] },
    { name: "third", data: [13] }
    ];
    $scope.chartConfig.series = data;
  };

  $scope.chartConfig = {
    options: {
      chart: {
        type: 'areaspline'
      },
      plotOptions: {
        series: {
          stacking: ''
        }
      }
    },
    series: $scope.chartSeries,
    title: {
      text: 'Hello'
    },
    credits: {
      enabled: true
    },
    loading: false
  };
})


.controller('threeCtrl', ['$scope', function ($scope) {
  $scope.title='This is the three page';
}])

.controller('fourCtrl', function($scope, $timeout, $filter, filterFilter) {

  $scope.chartSeries = [
  {"name": "one", "data": [1, 2, 4, 7, 3,1, 2, 4, 7, 3]}
  ];

  $scope.chartConfig = {
    options: {
      chart: {
        type: 'areaspline'
      },
      plotOptions: {
        series: {
          stacking: ''
        }
      }
    },
    series: $scope.chartSeries,
    title: {
      text: 'Data Item 1234'
    },
    credits: {
      enabled: false
    },
    loading: false
  };
})

.controller('fiveCtrl', ['$scope', function ($scope) {
  $scope.title='This is the five page';

}])
