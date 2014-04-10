var strutil = require('./string_util');
 
/**
 * 讓使用者先註冊super user帳號才讓其他api可以用。
 * 如果尚未註冊，所有request都會被擋掉並導向到super user註冊頁面。
 * 
 * 可參照app.js的configure部份。
 */
exports = module.exports = function filter(users){
  //設定一個flag，這樣只需要在server初始化時檢查db，如su果已存在將這個flag設為true，之後都只要檢查這個flag
  var isSuperSet=false;
  //監聽super user狀態。如果super user設了，則允許其他api存取。
  users.listenToSuperUserStatus(function(isSet){
	  console.log('super user status changed, exist:'+isSet);
	  isSuperSet=isSet;
  });
  //檢查是否設了super user
  users.isSuperUserSet(function(err, isSet){
	  console.log('super user check finished, exist:'+isSet);
	  if(!err)
		  isSuperSet=isSet;
  });
  return function filter(req, res, next) {
      //如果super已存在，這個filter不做任何事，將request交給下個來處理
	  if(isSuperSet || strutil.startsWith(req.url, '/css/',true) || strutil.startsWith(req.url, '/js/',true) || strutil.startsWith(req.url, '/img/',true)  || strutil.endsWith(req.url, '/register/super',true)){
		  next();
	  }else{
            //res.redirect('/register/super');
        	next();
	  }
  }
};