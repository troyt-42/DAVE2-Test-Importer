var express = require('express');
var http = require('http');
var fs = require('fs');
var io = require('socket.io');
var bodyparser = require('body-parser');
var kafka = require('kafka-node');


var app = express();
var server = http.createServer(app);
var socket = io.listen(server);

app.use(express.static(__dirname + '/../'));

var currentDataItem = [];
var currentDataItemToShow = [];
var start = 0;
var end = 0;

app.get('/gettable', function(req, res){
  fs.readFile('table.json', function(err,data){
    if (err){
      console.log('Error Reading File');
      console.log(err);
      res.writeHead(404,{'Content-Type': 'text/plain'});
      res.end();
    } else {
      res.write(data);
      res.end();
    }
  });
});

app.get('/getfile/:filename/:reduction', function(req, res){
  fs.readFile(req.param('filename') + "-" + req.param('reduction') + '.json',{encoding: 'utf8'},function (err, data) {
    if (err) {

      console.log("Error Reading File");
      console.log(err);
      res.writeHead(404,{'Content-Type': 'text/plain'});
      res.end();
    } else {
      var dataItem = JSON.parse(data);
      if(dataItem.data){
        dataItem.data.sort(function compare(a, b){
          if (Date.parse(a.Date) < Date.parse(b.Date)){
            return -1;
          } else if (Date.parse(a.Date) > Date.parse(b.Date)){
            return 1;
          } else {
            return 0;
          }
        });

        var itemData = [];

        for (var key in dataItem.data){
          var date = Date.parse(dataItem.data[key].Date);
          var value = dataItem.data[key].Value;
          var sub = [date, value];
          itemData.push(sub);
        }

        itemData.sort(function(a, b){
          return a[0] - b[0];
        });

        dataItem.itemData = itemData;

        currentDataItem = itemData;
        currentDataItemToShow = itemData;
        start = 0;
        end = itemData.length;

        var dataMirror = [];

        for (key in dataItem.data){
          var dateInMms = Date.parse(dataItem.data[key].Date);

          dataMirror.push(dateInMms);
        }
        console.log(dataMirror);
        dataItem.dataMirror = dataMirror;



      }

      if (start <= end){
        var avg = 0;
        var maxValue = currentDataItemToShow[0][1];
        var minValue = currentDataItemToShow[0][1];

        var maxIndex = 0;
        var minIndex = 0;

        var temSum = 0;
        for(var key2 in currentDataItemToShow){

          var value2 = currentDataItemToShow[key2][1];
          temSum += value2;


          if (value2 > maxValue){
            maxValue = currentDataItemToShow[key2][1];
            maxIndex = key2;
          }

          if (value2 < minValue){
            minValue = currentDataItemToShow[key2][1];
            minIndex = key2;
          }

        }
        avg = temSum / currentDataItemToShow.length;

        dataItem.avg = avg.toFixed(4);

        dataItem.maxValueIndex = maxIndex;
        dataItem.minValueIndex = minIndex;
      } else {
        dataItem.avg = null;
        dataItem.maxValueIndex = null;
        dataItem.maxValueIndex = null;
      }


      if (dataItem.avg !== null){
        var numOfValuesHigherThan0 = 0;
        var numOfValuesHigherThan20 = 0;
        var numOfValuesHigherThan40 = 0;
        var numOfValuesHigherThan50 = 0;
        var numOfValuesHigherThan80 = 0;

        for (var key3 in currentDataItemToShow){
          if ((currentDataItemToShow[key3][1] >= 0) && (currentDataItemToShow[key3][1] <= 20)){
            numOfValuesHigherThan0 ++;
          } else if ((currentDataItemToShow[key3][1] > 20) && (currentDataItemToShow[key3][1] <= 40)){
            numOfValuesHigherThan20 ++;
          } else if ((currentDataItemToShow[key3][1] > 40) && (currentDataItemToShow[key3][1] <= 50)){
            numOfValuesHigherThan40++;
          } else if ((currentDataItemToShow[key3][1] > 50) && (currentDataItemToShow[key3][1] <= 80)){
            numOfValuesHigherThan50++;
          } else {
            numOfValuesHigherThan80++;
          }
        }

        dataItem.numOfValuesHigherThan0 = numOfValuesHigherThan0;
        dataItem.numOfValuesHigherThan20 = numOfValuesHigherThan20;
        dataItem.numOfValuesHigherThan40 = numOfValuesHigherThan40;
        dataItem.numOfValuesHigherThan50 = numOfValuesHigherThan50;
        dataItem.numOfValuesHigherThan80 = numOfValuesHigherThan80;
      } else {
        dataItem.numOfValuesHigherThan0 = null;
        dataItem.numOfValuesHigherThan20 = null;
        dataItem.numOfValuesHigherThan40 = null;
        dataItem.numOfValuesHigherThan50 = null;
        dataItem.numOfValuesHigherThan80 = null;
      }


      res.write(JSON.stringify(dataItem));
      res.end();
    }
  });
});

app.get('/getIndex/:min/:max', function(req, res){
  var min = req.param('min');
  var max = req.param('max');

  var dataMinIndex = 0;
  var dataMaxIndex = 0;
  var returnJSON = {};

  if (currentDataItemToShow.length !== 0){
    if ((min < currentDataItemToShow[0][0]) && (max > currentDataItemToShow[currentDataItemToShow.length - 1][0])){

      for(var i1 = 0; i1 < currentDataItem.length; i1++){
        if(currentDataItem[i1][0] >= min){
          dataMinIndex = i1;
          break;
        }
      }

      for(var p1 = currentDataItem.length - 1; p1 >= 0; p1--){
        if(currentDataItem[p1][0] <= max){
          dataMaxIndex = p1;
          break;
        }
      }

      start = dataMinIndex;
      end = dataMaxIndex;

      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }


    } else if ((min > currentDataItemToShow[currentDataItemToShow.length - 1][0]) && (max > currentDataItemToShow[currentDataItemToShow.length - 1][0])){
      var tem = currentDataItem.slice(end);

      for(var i5 = 0; i5 < tem.length; i5++){
        if(tem[i5][0] >= min){
          dataMinIndex = i5;
          break;
        }
      }

      for(var p5 = tem.length - 1; p5 >= 0; p5--){
        if(tem[p5][0] <= max){
          dataMaxIndex = p5;
          break;
        }
      }

      start = end + dataMinIndex;
      end += dataMaxIndex;

      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }

    } else if ((max < currentDataItemToShow[0][0])){
      var tem2 = currentDataItem.slice(0, start);

      for(var i6 = 0; i6 < tem2.length; i6++){
        if(tem2[i6][0] >= min){
          dataMinIndex = i6;
          console.log('Min:' + min);
          console.log('DataMin: ' + tem2[i6][0]);
          break;
        } else if (i6 === tem2.length -1){
          dataMinIndex = start;
        }
      }

      for(var p6 = tem2.length - 1; p6 >= 0; p6--){
        if(tem2[p6][0] <= max){
          dataMaxIndex = p6;

          console.log('Max:' + max);
          console.log('DataMax: ' + tem2[p6][0]);
          console.log('index:' + p6);
          break;
        }
      }

      start = dataMinIndex;
      end = dataMaxIndex;

      console.log(dataMinIndex);
      console.log(dataMaxIndex);
      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }

    } else if (min < currentDataItemToShow[0][0]){
      for (var i2 = 0; i2 < currentDataItem.length; i2++){
        if (currentDataItem[i2][0] >= min){
          dataMinIndex = i2;
          break;
        }
      }

      for(var p2 = currentDataItemToShow.length - 1; p2 >= 0; p2--){
        if(currentDataItemToShow[p2][0] <= max){
          dataMaxIndex = p2;
          break;
        }
      }

      end = start + dataMaxIndex;
      start = dataMinIndex;
      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }


    } else if (max > currentDataItemToShow[currentDataItemToShow.length - 1][0]){
      for (var i3 = 0; i3 < currentDataItemToShow.length; i3++){
        if (currentDataItemToShow[i3][0] >= min){
          dataMinIndex = i3;
          break;
        }
      }

      for(var p3 = currentDataItem.length - 1; p3 >= 0; p3--){
        if(currentDataItem[p3][0] <= max){
          dataMaxIndex = p3;
          break;
        }
      }

      end = dataMaxIndex;
      start += dataMinIndex;
      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }


    } else {
      for (var i4 = 0; i4 < currentDataItemToShow.length; i4++){
        if (currentDataItemToShow[i4][0] >= min){
          dataMinIndex = i4;
          break;
        }
      }

      for(var p4 = currentDataItemToShow.length - 1; p4 >= 0; p4--){
        if(currentDataItemToShow[p4][0] <= max){
          dataMaxIndex = p4;
          break;
        }
      }


      end = start + dataMaxIndex;
      start += dataMinIndex;
      if(start <= end){
        currentDataItemToShow = currentDataItem.slice(start, end + 1);
      }


    }
    returnJSON = {
      dataMinIndex : start,
      dataMaxIndex : end + 1
    };
  } else {
    console.log('Beware!!');
    returnJSON = {
      dataMinIndex : -1,
      dataMaxIndex : -1
    };
  }


  if (start <= end){
    var avg = 0;
    var maxValue = currentDataItemToShow[0][1];
    var minValue = currentDataItemToShow[0][1];

    var maxIndex = 0;
    var minIndex = 0;

    var temSum = 0;
    for(var key in currentDataItemToShow){

      var value = currentDataItemToShow[key][1];
      temSum += value;


      if (value > maxValue){
        maxValue = currentDataItemToShow[key][1];
        maxIndex = key;
      }

      if (value < minValue){
        minValue = currentDataItemToShow[key][1];
        minIndex = key;
      }

    }
    avg = temSum / currentDataItemToShow.length;

    returnJSON.avg = avg.toFixed(4);

    returnJSON.maxValueIndex = maxIndex;
    returnJSON.minValueIndex = minIndex;
  } else {
    returnJSON.avg = null;
    returnJSON.maxValue = null;
    returnJSON.minValue = null;
  }


  if (returnJSON.avg !== null){
    var numOfValuesHigherThan0 = 0;
    var numOfValuesHigherThan20 = 0;
    var numOfValuesHigherThan40 = 0;
    var numOfValuesHigherThan50 = 0;
    var numOfValuesHigherThan80 = 0;

    for (var key3 in currentDataItemToShow){
      if ((currentDataItemToShow[key3][1] >= 0) && (currentDataItemToShow[key3][1] <= 20)){
        numOfValuesHigherThan0 ++;
      } else if ((currentDataItemToShow[key3][1] > 20) && (currentDataItemToShow[key3][1] <= 40)){
        numOfValuesHigherThan20 ++;
      } else if ((currentDataItemToShow[key3][1] > 40) && (currentDataItemToShow[key3][1] <= 50)){
        numOfValuesHigherThan40++;
      } else if ((currentDataItemToShow[key3][1] > 50) && (currentDataItemToShow[key3][1] <= 80)){
        numOfValuesHigherThan50++;
      } else {
        numOfValuesHigherThan80++;
      }
    }

    returnJSON.numOfValuesHigherThan0 = numOfValuesHigherThan0;
    returnJSON.numOfValuesHigherThan20 = numOfValuesHigherThan20;
    returnJSON.numOfValuesHigherThan40 = numOfValuesHigherThan40;
    returnJSON.numOfValuesHigherThan50 = numOfValuesHigherThan50;
    returnJSON.numOfValuesHigherThan80 = numOfValuesHigherThan80;
  } else {
    returnJSON.numOfValuesHigherThan0 = null;
    returnJSON.numOfValuesHigherThan20 = null;
    returnJSON.numOfValuesHigherThan40 = null;
    returnJSON.numOfValuesHigherThan50 = null;
    returnJSON.numOfValuesHigherThan80 = null;
  }
  console.log('start: ' + returnJSON.dataMinIndex);
  console.log('end: ' + returnJSON.dataMaxIndex);

  console.log('length: ' + currentDataItem.length);
  res.write(JSON.stringify(returnJSON));
  res.end();
});


/*app.get('/getIndexAndData/:min/:max', function(req, res){
  var min = req.param('min');
  var max = req.param('max');

  var dataMinIndex = 0;
  var dataMaxIndex = 0;
  var returnJSON = {};

  if (currentDataItem !== []){
    if ((min < currentDataItemToShow[0][0]) && (max > currentDataItemToShow[currentDataItemToShow.length - 1][0])){

      for(var i1 = 0; i1 < currentDataItem.length; i1++){
        if(currentDataItem[i1][0] >= min){
          dataMinIndex = i1;
          break;
        }
      }

      for(var p1 = currentDataItem.length - 1; p1 >= 0; p1--){
        if(currentDataItem[p1][0] <= max){
          dataMaxIndex = p1;
          break;
        }
      }
      start = dataMinIndex;
      end = dataMaxIndex;

      currentDataItemToShow = currentDataItem.slice(start, end);

    } else if ((min > currentDataItemToShow[currentDataItemToShow.length - 1][0]) && (max > currentDataItemToShow[currentDataItemToShow.length - 1][0])){
      var tem = currentDataItem.slice(end);

      for(var i5 = 0; i5 < tem.length; i5++){
        if(tem[i5][0] >= min){
          dataMinIndex = i5;
          break;
        }
      }

      for(var p5 = tem.length - 1; p5 >= 0; p5--){
        if(tem[p5][0] <= max){
          dataMaxIndex = p5;
          break;
        }
      }

      start = end + dataMinIndex;
      end += dataMaxIndex;

      currentDataItemToShow = currentDataItem.slice(start, end);

    } else if ((max < currentDataItemToShow[0][0])){
      var tem2 = currentDataItem.slice(0, start);

      for(var i6 = 0; i6 < tem2.length; i6++){
        if(tem2[i6][0] >= min){
          dataMinIndex = i6;
          break;
        }
      }

      for(var p6 = tem2.length - 1; p6 >= 0; p6--){
        if(tem2[p6][0] <= max){
          dataMaxIndex = p6;
          break;
        }
      }

      start = dataMinIndex;
      end = dataMaxIndex;

      currentDataItemToShow = currentDataItem.slice(start, end);

    } else if (min < currentDataItemToShow[0][0]){
      for (var i2 = 0; i2 < currentDataItem.length; i2++){
        if (currentDataItem[i2][0] >= min){
          dataMinIndex = i2;
          break;
        }
      }

      for(var p2 = currentDataItemToShow.length - 1; p2 >= 0; p2--){
        if(currentDataItemToShow[p2][0] <= max){
          dataMaxIndex = p2;
          break;
        }
      }

      end = start + dataMaxIndex;
      start = dataMinIndex;
      currentDataItemToShow = currentDataItem.slice(start, end);


    } else if (max > currentDataItemToShow[currentDataItemToShow.length - 1][0]){
      for (var i3 = 0; i3 < currentDataItemToShow.length; i3++){
        if (currentDataItemToShow[i3][0] >= min){
          dataMinIndex = i3;
          break;
        }
      }

      for(var p3 = currentDataItem.length - 1; p3 >= 0; p3--){
        if(currentDataItem[p3][0] <= max){
          dataMaxIndex = p3;
          break;
        }
      }

      end = dataMaxIndex;
      start += dataMinIndex;
      console.log(dataMinIndex);
      currentDataItemToShow = currentDataItem.slice(start, end);


    } else {
      for (var i4 = 0; i4 < currentDataItemToShow.length; i4++){
        if (currentDataItemToShow[i4][0] >= min){
          dataMinIndex = i4;
          break;
        }
      }

      for(var p4 = currentDataItemToShow.length - 1; p4 >= 0; p4--){
        if(currentDataItemToShow[p4][0] <= max){
          dataMaxIndex = p4;
          break;
        }
      }


      end = start + dataMaxIndex;
      start += dataMinIndex;
      currentDataItemToShow = currentDataItem.slice(start, end);


    }
    returnJSON = {
      dataMinIndex : start,
      dataMaxIndex : end + 1,
      data : currentDataItemToShow
    };
  } else {
    returnJSON = {
      dataMinIndex : -1,
      dataMaxIndex : -1,
      data : null
    };
  }
  console.log('start: ' + returnJSON.dataMinIndex);
  console.log('end: ' + returnJSON.dataMaxIndex);

  console.log('length: ' + currentDataItem.length);
  res.write(JSON.stringify(returnJSON));
  res.end();
});
*/


server.listen(3000);
console.log("Express Server Is Listenning at 3000");
