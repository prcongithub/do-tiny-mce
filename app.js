
/**
 * Module dependencies.
 */
if(!process.env.NODE_ENV){
  process.env.NODE_ENV = "development"
}
process.env.TZ = 'Asia/Kolkata'

var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var http = require('http');
var path = require('path');
var domain = require('domain');
var url = require("url");
var app = express();
var logger = require('logger');
var net = require('net');
var fs = require("fs");
var asset_config = JSON.parse(fs.readFileSync(__dirname+'/config/assets_'+process.env.NODE_ENV+'.json', "utf8"));
var assets = require('connect-assets')(asset_config);
var extensions = require("extensions");

var files = require("routes/files");

//app.set('port', process.env.PORT || 3005);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');
// app.use(bodyParser({uploadDir:'public/cheat_sheet'}));
//app.use(bodyParser.json());
var secretKey = "weqweqwe7657657asdsatgbwujnaqazsvbndwerasdadsa45tgbd876as87d68as5d76as5d675as67d5as7";
app.use(assets);
app.use(methodOverride('_method'));
app.set('trust proxy', 1);

app.use(function(request,response,next) {
  response.set({
    "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "Fri, 01 Jan 1990 00:00:00 GMT"
  });  
  request.response = response;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', require('ejs').renderFile);

app.use('/', files);

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
};

if ('development' !== app.get('env')) {
  app.use(function(err,request,response,next) {
    if(response.statusCode >= 200 && response.statusCode < 400){
      response.status(500);
    }
    if (err.code === 'EBADCSRFTOKEN'){
      response.status(403);
    }
    logger.err("Status Code : " + response.statusCode);
    switch(response.statusCode) {
      case 401:
        response.render(__dirname+"/public/"+response.statusCode+".html");
        break;
      case 403:
        response.render(__dirname+"/public/"+response.statusCode+".html");
        break;
      case 404:
        // Send error notification
        response.render(__dirname+"/public/"+response.statusCode+".html");
        break;
      case 500:
        // Send error notification
        logger.err("Sending Error Email");
        response.render(__dirname+"/public/"+response.statusCode+".html");
        break;
      default:
        next(err);
        break;
    }
  });
}

app.locals.getView = function(filename)
{
  var viewPath = path.join(app.get('views'), filename);
  //logger.debug("RENDER VIEW: "+viewPath);
  return viewPath;
}

var port = process.env.PORT || (__dirname+"/tmp/app.sock");
var server = http.createServer(app);
// port is a UNIX socket file
server.on('listening', function() {
  // set permissions
  return fs.chmod(port, 0777, function(){});
});

// double-check EADDRINUSE
server.on('error', function(e) {
  if (e.code !== 'EADDRINUSE') throw e;
  net.connect({ path: port }, function() {
    // really in use: re-throw
    //throw e;
    fs.unlinkSync(port);
    server.listen(port);
  }).on('error', function(e) {
    if (e.code !== 'ECONNREFUSED') throw e;
    // not in use: delete it and re-listen
    fs.unlinkSync(port);
    server.listen(port);
  });
});

server.listen(port, function() {
  require('util').log("Listening on " + port);

  // downgrade process user to owner of this file
  return fs.stat(__filename, function(err, stats) {
    if (err) throw err;
    return process.setuid(stats.uid);
  });
});

