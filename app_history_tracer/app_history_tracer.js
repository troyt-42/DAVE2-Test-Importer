var historyTracer = angular.module("historyTracer", []);

historyTracer.controller("historyTracerCtrl", ['$scope','$http', function($scope,$http){
  $scope.currentNumOptions = [1,2,3,4,5,6,7,8,9];
  $scope.currentLetterOptions = ['A','B','C','D','E','F','G','H','I'];
  $scope.currentOptions = $scope.currentNumOptions;
  $scope.userHistorys = [];

  $scope.currentValue ='';
  $scope.currentPosition = -1;
  $scope.associateData = '';
  $scope.historyTracer = function(type, id, detail){
    var record = {
      type : type,
      id : id,
      detail : detail
    };

    if ($scope.userHistorys.length > 0){
      console.log($scope.currentPosition);

      if (!angular.equals(record, $scope.userHistorys[$scope.currentPosition])){
        console.log(record);
        console.log($scope.userHistorys[$scope.currentPosition]);
        $scope.currentPosition += 1;

        if ($scope.currentPosition <= $scope.userHistorys.length - 1){

          $scope.userHistorys.splice($scope.currentPosition);
        }
        $scope.userHistorys.push(record);
      }

    } else if ($scope.userHistorys.length === 0){
      $scope.userHistorys.push(record);

      $scope.currentPosition += 1;

    }
  };

  $scope.setCurrentValue = function(value){
    $scope.currentValue = value;

    if ((value.toString().charCodeAt(0) >= 48) && (value.toString().charCodeAt(0) <= 57 )){

      $scope.currentOptions = $scope.currentLetterOptions;

      $http.get('http://10.3.86.65:3000/getfile/DA-60-CF-2A-24-CF/4D').success(function(data){
        $scope.associateData = data;
      })
      .error(function(err){
        console.log(err);
      });

    } else if ((value.toString().charCodeAt(0) >= 65) && (value.toString().charCodeAt(0) <= 73)){

      $scope.currentOptions = $scope.currentNumOptions;

      $http.get('http://10.3.86.65:3000/getfile/DA-60-CF-2A-24-CF/2D').success(function(data){
        $scope.associateData = data;
      })
      .error(function(err){
        console.log(err);
      });
      
    } else {
      console.log(value.toString().charCodeAt(0));
    }


    //Record
    $scope.historyTracer('function','setCurrentValue', [value]);

  };

  $scope.historyCaller = function(record){

    if(record.type === 'function'){
      if(record.detail.length === 1){
        $scope[record.id](record.detail[0]);
      } else if (record.detail.length === 2){
        $scope[record.id](record.detail[0], record.detail[1]);
      } else if (record.detail.length === 3){
        $scope[record.id](record.detail[0], record.detail[1], record.detail[2]);
      }
    }
  };

  $scope.backHistory = function(){
    if ($scope.currentPosition > 0){
      $scope.currentPosition -= 1;
      $scope.historyCaller($scope.userHistorys[$scope.currentPosition]);




    }
  };

  $scope.forwardHistory = function(){
    if ($scope.currentPosition < $scope.userHistorys.length - 1){
      $scope.currentPosition += 1;
      $scope.historyCaller($scope.userHistorys[$scope.currentPosition]);



    }
  };
}]);
