/**
 * Module dependencies.
 */
var config = require('../config').config;

/**
 * This module serves as a binder that intercepts the session id(sid) contained in the request url (ex: /native/all_data/:sid), before express.router does, and writes it into req.cookies, 
 * so the express session module later can use the session id in the modified cookies to retrieve the session from the session store.  
 * 
 * 將native api的 /xxx/xxx/<sid>的sid轉換成cookies，這樣處理起來比較單純，可沿用原本的session，不需額外管理一組native專用的session store。
 */
exports = module.exports = function bind(){
  return function bind(req, res, next) {
	  var urlParts = req.url.split("/");
	  if(urlParts.length>3 && urlParts[1]=='native'){
		  // modify user agent, since express.session uses user-agent in the process of session id validation, 
		  // so a unified user-agent for native client is necessary.
		  // however, the ios devices will use itunes as user agents to send http request to install apps, 
		  // so the valid user agent is the one triggers the install link, which is the ios safari, and therefore the user agent is carried around along with the session id to pass the validation.   
		  if(urlParts[2]=='ios'){
			  req.headers['user-agent']=new Buffer(urlParts[urlParts.length-2], 'hex').toString('utf8');
		  }else{
			  req.headers['user-agent']='iiifactory-native';
		  }
		  //session id won't be sent in login and test api
		  if(urlParts[2]!='test' && urlParts[2]!='login'){
			  //session id is the last part of the url
			  var sid = new Buffer(urlParts[urlParts.length-1], 'hex').toString('utf8');
			  req.cookies[config.getSessionKey()]=sid;
		  }
	  }
	  next();
  }
};