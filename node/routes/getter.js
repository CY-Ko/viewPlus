/**
 * db(mongohelper)和其他物件的中介層，大部份物件都是透過這個module存取db。負責格式或訊息的轉換。
 */


var config = require('../config').config;
var errcode = require('../error').error;

var db;
exports = module.exports = function(_db){
	db=_db;
}

exports.prototype._checkLogin = function(uinfo, callback){
	if(!uinfo.user){
	    console.log('not logged in');
	    callback(errcode.NOT_LOGIN, null);
	    return false;
	}else{
		return true;
	}	
}

/**
 * 呼叫mongohelper.getApps取得db資料，並將資料轉為json格式回傳
 */
exports.prototype.getApps = function(uinfo, callback, cur_app){
  if(!this._checkLogin(uinfo, callback))
	  return;
//  var db = new Mongo(config.getMongoHost(), config.getMongoPort());
  db.getApps(uinfo, function(error, data){
    if(error) callback(error);
    else{
      //check if the app is in db data
      var appInDb=false;
      var i;
      if(cur_app && data){
    	  for(i=0; i<data.length;i++){
    		  var app=data[i];
    		  if(app._id==cur_app){
    			  appInDb=true;
    		  }
    	  }
      }
      var result = {'result':0,'apps':data};
      if(appInDb)
    	  result.cur_id=cur_app;
      callback(null, JSON.stringify(result));
    }
  })
}

/**
 * 根據app id取得某一app資料
 */
exports.prototype.getAppById = function(uinfo, app_id, callback, stringify){
  if(!this._checkLogin(uinfo, callback))
    return;	  
//  console.log('!!!!app_id:'+app_id);
//  var db = new Mongo(config.getMongoHost(), config.getMongoPort());
  db.getAppById(uinfo, app_id, function(error, data){
    if(error) callback(error);
    else{
      if(stringify){
    	  var result = {'result':0,'app':data};
          callback(null, JSON.stringify(result));
      }else{
    	  callback(error, data);
      }
    }
  })
}

/**
 * 呼叫mongohelper.getversions取得db資料，並將資料轉為json格式回傳
 */
exports.prototype.getVersions = function(uinfo, app_id, callback, stringify){
  if(!this._checkLogin(uinfo, callback))
	return;	 	
//  var db = new Mongo(config.getMongoHost(), config.getMongoPort());
  db.getVersions(uinfo, app_id, false, function(error, data){
    if(error) callback(error);
    else{
      if(!stringify){
    	  callback(null, data);
      }else{
    	  var result = {'result':0,'versions':data};
          callback(null, JSON.stringify(result));  
      }
    }
//      callback(null, JSON.stringify(data));
  });
}

/**
 * 根據ver id取得某一version資料
 */
exports.prototype.getBookcaseById = function(stringify,uinfo, ver_id, callback){
  if(!this._checkLogin(uinfo, callback))
	return;
//  var db = new Mongo(config.getMongoHost(), config.getMongoPort());
  db.getBookcaseById(uinfo, ver_id, function(error, data){
    if(error) callback(error);
    else
      if(stringify){
    	var result={'result':0,'version':data};
        callback(null, JSON.stringify(result));
      }else
        callback(null, data);
  })
}

/**
 * 根據ver id取得某一version資料
 */
exports.prototype.getVersionById = function(stringify,uinfo, ver_id, callback){
  if(!this._checkLogin(uinfo, callback))
	return;
//  var db = new Mongo(config.getMongoHost(), config.getMongoPort());
  db.getVersionById(uinfo, ver_id, function(error, data){
    if(error) callback(error);
    else
      if(stringify){
    	var result={'result':0,'version':data};
        callback(null, JSON.stringify(result));
      }else
        callback(null, data);
  })
}

/**
 * 取得所有push enabled的app/version
 */
exports.prototype.getAllPushEnabled = function(uinfo, callback){
  if(!uinfo){
	  callback(errcode.NOT_LOGIN);
	  return;
  }
  db.getAll(uinfo, true, {'Features.Push':1}, db.Version.IncludeCondition.Outward, function(error, data){
    if(error)
      callback(error);
    else
      callback(null, data);
  });
}

/**
 * 呼叫mongohelper.getAll取得資料，並將資料轉為json格式回傳
 */
exports.prototype.getAll = function(uinfo, callback){
  if(!uinfo){
	  callback(errcode.NOT_LOGIN);
	  return;
  }
  db.getAll(uinfo, false, null, db.Version.IncludeCondition.Outward, function(error, data){
    if(error)
      callback(error);
    else
      callback(null, data);
  })
}

/**
 * 取得所有app/version，其中version資料包含icon path
 */
exports.prototype.getAllWithIcon = function(uinfo, callback){
  if(!uinfo){
	  callback(errcode.NOT_LOGIN);
	  return;
  }
  db.getAll(uinfo, false, null, db.Version.IncludeCondition.OutwardWithIcon, function(error, data){
    if(error)
      callback(error);
    else
      callback(null, data);
  })
}

exports.prototype.clearUserData =function(uinfo, callback){
	  if(!uinfo.user){
		  callback(errcode.NOT_LOGIN);
		  return;
	  }
//	var db = new Mongo(config.getMongoHost(), config.getMongoPort());
	db.clearUserData(uinfo, callback);
}
