var express = require('express');
var fs = require('fs');
var http = require('http');

var app = express();
var server = http.createServer(app);


server.listen(3000);
console.log("Express Server Is Listenning at 3000");

app.use(express.static(__dirname + '/../'));

app.get('/getfile/:filename', function(req, res){
  fs.readFile(req.param('filename'),function (err, data) {
    if (err) {
      console.log("Error Reading File");
      res.writeHead(404,
        {
          'Content-Type': 'text/plain'
        });
        res.end();
      } else {
        console.log(data);
        res.write(data);
        res.end();
      }
    });
  });
