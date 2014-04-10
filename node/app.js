/**
 * The entry point of this project. Its primary functions are:
 * 1. construct and configure the server
 * 2. list all routes of api
 * 3. initialize the push server
 */
var config = require('./config').config;
var express = require('express')
  , routes = require('./routes')
  , MongoStore = require('connect-mongo')(express)
  , nSidConverter = require('./lib/native_sid_converter')
  , pubFilter = require('./lib/public_filter')
  , superFilter = require('./lib/super_filter')
  , sessionHandler = require('./lib/session_handler');
var errcode = require('./error').error;
var child = require('child_process');

//讓console.log紀錄時間
(function(logger){
  console.log = function(){
    var rightNow = new Date();
    var timestamp = '['+rightNow.toLocaleString()+']';
    logger.apply(console, [timestamp].concat(Array.prototype.slice.call(arguments)));
  };
})(console.log);

//var app = module.exports = express.createServer();//form({ keepExtensions: true }) );
var app = express(); //express 3.0
app.listen(3001);

//express setting end
app.use(express.favicon(__dirname + '/public/img/favicon.ico')); 

var mStore = new MongoStore({db: config.getDbName(), auto_reconnect: true });
// Configuration
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });

  //app.use(express.limit('3gb')); //limitSize for single http request, could be multi files
  app.use(express.compress());
  /*app.use(express.bodyParser({ 
    keepExtensions: true
  }));*/
  app.use(express.json())
   .use(express.urlencoded())
   .use(express.multipart({limit:'3gb'}));  //.use(express.multipart({limit:'3gb'}));

  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(superFilter(routes.users));
  // use native sid converter module. 
  // details can be seen in lib/native_sid_converter.js
  // ** shoud be used between the cookie parser and the session module
  app.use(nSidConverter()); 
  app.use(express.session({ 
	  key: config.getSessionKey(),
	  secret: 'wang li hong is gay!!! by JP',
	  maxAge: new Date(Date.now() + 12 * 60 * 60 * 1000),
    //maxAge: new Date(Date.now() + 3 * 1000),
	  store: mStore
	  })
  );
  app.use(sessionHandler()); //在取得session資料後對其額外處理
  app.use(app.router);
  app.use(express.static(__dirname + '/Rating/public'));
  app.use(pubFilter()); //沒登入的話不得檢視public資料夾，用pubFilter擋掉request

  //app.use(gzippo.staticGzip(__dirname + '/public'));
  //app.use(gzippo.compress());
  app.use(express.compress());
  app.use(express.static(__dirname + '/public', {maxAge: 604800000})); //存取public靜態資料夾

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('/', function(req,res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
});

app.get('/register/super', function(req,res){
	console.log("/register/super");
	res.render('register', {title:'註冊super user', result:''});
});
app.post('/register/super', routes.users.registerSuperUser);
app.get('/login', function(req,res){
	console.log("/register/super");
	res.render('login', {title:'login', result:''});
});
app.get('/about', function(req,res){
	res.render('about', {title:'about', result:''});
});
app.get('/features', function(req,res){
	res.render('features', {title:'features', result:''});
});
app.get('/prices', function(req,res){
	res.render('prices', {title:'features', result:''});
});
app.get('/cases', function(req,res){
	res.render('cases', {title:'features', result:''});
});
app.get('/partners', function(req,res){
	res.render('partners', {title:'features', result:''});
});
app.get('/contacts', function(req,res){
	res.render('contacts', {title:'features', result:''});
});
app.get('/download', function(req,res){
	res.render('downloadPage', {title:'features', result:''});
});

// var fork = child.fork(__dirname+'/routes/startCheckList.js', null, {env:process.env});
// fork.send({type:'StartList'});

