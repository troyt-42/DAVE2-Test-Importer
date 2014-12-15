var dave2App = angular.module("dave2App", ["chatApp", "importer",'angularFileUpload', 'ngRoute','dataItemDisplay', 'PK.controllers','infinite-scroll','historyTracer','exportApp','kafkaMessager','btford.socket-io']);

dave2App.factory('daveSocket',function(socketFactory){
  var socket = io.connect('http://10.3.86.65:3000');

  return socketFactory({
    ioSocket: socket
  });
});


dave2App.factory('dataLib', ['$http', '$route','$routeParams','daveSocket',function($http, $route, $routeParams,daveSocket){

  var result =
  {
    getInitialData : function() {

      var promise = $http.get('http://10.3.86.65:3000/gettable').success(function(data){
        console.log('Successful Request');
        return data;
      }).error(function(){
        console.log("Error request");
        return "Failed Request";
      });

      return promise;
    },

    checkItemId : function(){
      console.log($route.current.params);
      if ($route.current.params.id){
        return $route.current.params.id;
      } else {
        return null;
      }
    }
  };

  return result;
}]);

dave2App.config(["$routeProvider", function($routeProvider){
  $routeProvider.when('/Importer', {
    templateUrl : 'app_importer/app_importer.html',
    controller: 'importerCtrl'
  }).when('/dataItemDisplay/initial', {
    templateUrl : 'app_data_item_display/data_item_display_table.html',
    controller: 'dataItemDisplayTableCtrl',
    resolve: {
      initialData : function(dataLib){
        return dataLib.getInitialData();
      }
    }
  }).when('/dataItemDisplay/item/:id', {
    templateUrl : 'app_data_item_display/data_item_display_graph.html',
    controller: "dataItemDisplayGraphCtrl",
    resolve : {
      itemId : function(dataLib){
        return dataLib.checkItemId();
      }
    }
  }).when('/Export',{
    templateUrl : "app_export/app_export.html",
    controller : "exportCtrl"
  }).when('/Chatter', {
    templateUrl : 'app_chatter/app_chatter.html',
    controller : 'chatController'
  }).when('/HistoryTracer', {
    templateUrl : 'app_history_tracer/app_history_tracer.html',
    controller: 'historyTracerCtrl'
  }).when('/KafkaMessager', {
    templateUrl : 'app_kafka_messager/app_kafka_messager.html',
    controller : 'kafkaMessagerCtrl'
  }).when('/Three', {
    templateUrl : 'PK/two.htm',
    controller : 'twoCtrl'
  }).when('/Four',{
    templateUrl : 'PK/three.htm',
    controller : 'threeCtrl'
  }).when('/Five', {
    templateUrl : 'PK/four.htm',
    controller : 'fourCtrl'
  }).when('/Six', {
    templateUrl : 'PK/five.htm',
    controller: 'fiveCtrl'
  });
}]);

dave2App.controller('dave2Ctrl', ['$scope','$location', function($scope, $location){
  $scope.navClass = function(page){
    var currentRoute = $location.path();
    if (currentRoute.indexOf('dataItemDisplay') !== -1){
      currentRoute = "/dataItemDisplay/initial";
    }
    return page === currentRoute ? 'active' : '';
  };

  $scope.isHome = function(){
    if ($location.path() === ''){
      return true;
    } else {
      return false;
    }
  };


}]);
