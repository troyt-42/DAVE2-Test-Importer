var dave2App = angular.module("dave2App", ["chatApp", "importer",'angularFileUpload', 'ngRoute','dataItemDisplay', 'PK.controllers']);

dave2App.factory('dataLib', ['$http', function($http){

  var result =
  {
    getInitalData : function() {

      var promise = $http.get('http://10.3.86.65:3000/getfile/table.json').success(function(data){
        console.log('Successful Request');
        return data;
      }).error(function(){
        console.log("Error request");
        return "Failed Request";
      });

      return promise;
    }
  };

  return result;
}]);

dave2App.config(["$routeProvider", function($routeProvider){
  $routeProvider.when('/Importer', {
    templateUrl : 'app_importer/app_importer.html',
    controller: 'importerCtrl'
  }).when('/dataItemDisplay', {
    templateUrl : 'app_data_item_display/data_item_display.html',
    controller: 'dataItemDisplayCtrl',
    resolve: {
      initialData : function(dataLib){
        return dataLib.getInitalData();
      }
    }
  }).when('/Chatter', {
    templateUrl : 'app_chatter/app_chatter.html',
    controller : 'chatController'
  })
  .when('/Three', {
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
  })
  .otherwise({redirectTo: '/'});
}]);

dave2App.controller('dave2Ctrl', ['$scope','$location', function($scope, $location){
  $scope.navClass = function(page){
    var currentRoute = $location.path();
    return page === currentRoute ? 'active' : '';
  };
}]);
