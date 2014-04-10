/**
 * typical routes/index.js of express. route all requests to proper handlers.
 */


/**
 * initialize db & getter
 */
var config = require('../config').config;
var Mongo = require('./mongohelper').Mongo;
console.log('------\nrouter connect to db\n------');
var db = new Mongo(config.getMongoHost(), config.getMongoPort(), {auto_reconnect: true, poolSize:50});
/**
 * other modules
 */

var child = require('child_process');
var dbgetter = new (require('./getter'))(db);
var querystring = require('querystring');
var url = require('url');
var path = require('path');
var mime = require('mime');
var users_lib = require('./users');
var pages_lib = require('./pages');
var errcode = require('../error').error;
var fs = require('fs');
var xml2js = require('xml2js');
var util = require('util');
var AdmZip = require('adm-zip');
var exec=require('child_process').exec;
var parser = new xml2js.Parser();
function get(val){
  return val==null?'':val;
}

/**
 * initialize users & native api modules
 */
var users = new users_lib(db);
var pages = new pages_lib(db);
/**
 * export them for app.js to use
 */
exports.users = users;
exports.pages = pages;

/**
 * expose db driver to app.js
 */
exports.dbClient = db.db;


/**
 * 初始化
 */
exports.initialize = function(){
    db.initialize();
}


/**
 * 首頁。有登入回傳/apps.html，沒登入回傳/login.html (in public folder)
 */
exports.index = function(req, res){
	if(req.session.uinfo.user)
		res.redirect('/apps');
	else
		{res.redirect('/login');return;}
	
};


