module.exports = function(request,response, next){
  var start = +new Date();
  var stream = process.stdout;
  var method = request.method;
  var url = request.url;

  response.on('finish', function(){
    var duration = +new Date() - start;
    var message = method + ' to ' + url + ' took ' + duration + ' ms';
    stream.write(message);
  });

  next();
};
