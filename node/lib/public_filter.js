/**
 * Module dependencies.
 */
var strutil = require('./string_util');

/**
 * 
 * This module is used as a filter to prevent users that doesn't log in from accessing to the public folder.
 * If unlogin users try to access html files other than index/login.html, they will be redirected to the login page. 
 */
exports = module.exports = function filter(){
  return function filter(req, res, next) {
	  if(req.session.uinfo && req.session.uinfo.user){
		  //login
		  next();
	  }else{
		  //unlogin
		  if(strutil.endsWith(req.url,['htm','html'],true) && !strutil.endsWith(req.url,['login.html', 'register.html'])){
			  res.redirect('/');
		  }else{
			  next();
		  }
	  }
  }
};