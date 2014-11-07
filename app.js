var dave2App = angular.module("dave2App", ["importer",'angularFileUpload', 'ngRoute','dataItemDisplay']);

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
  })
  .otherwise({redirectTo: '/'});
}]);
