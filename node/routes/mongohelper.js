/**
 * db存取module。
 */

var MongoMod = require('mongodb');
var Db = MongoMod.Db;
var Connection = MongoMod.Connection;
var Server = MongoMod.Server;
var BSON = MongoMod.BSON;
var ObjectID = MongoMod.ObjectID;
var errcode = require('../error').error;
var config = require('../config').config;
var request = require('request');
var exec=require('child_process').exec;
/**
 * constructor
 * host: the host of db (up or url)
 * port: port number (integer format)
 * options: an object specifies the options with which the db is connected
 *          details can be seen at https://github.com/mongodb/node-mongodb-native 
 */
var Mongo = function(host, port, options){
  console.log("mongodb constructor");
  if(!options)
	  options={auto_reconnect: true};
  this.db= new Db(config.getDbName(), new Server(host, port, options, {}));
	  
  this.id=Date.now().toString();
}

/**
 * 初始化資料庫
 */

Mongo.prototype.initialize = function(){
    console.log('initialize db');
    insertDefualtCategory(this);
    insertBuildUserProc(this);
}

/**
 *    檢查預設之APP分類是否存在，若不存在即新增
 */
function insertDefualtCategory(db){//
    var _defaultCategory=config.getDefaultCategory();
    db.getCategoryCollection(function(err, collection){
        if(err){
            console.log('fail to initialize category collection!!');
        }else{
            console.log('get group collection:');
            collection.findOne({name:_defaultCategory}, function(err, category){
                if(err){
                    console.log(err);
                }else if(!category){
                    collection.insert({name:_defaultCategory, default:true, timestamp: Date.now(), date:new Date().toString()}, {safe:true}, function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log('create default category');//新增預設群組成功
                        }
                    });
                }else{
                    console.log('default category exists');//預設群組已存在
                }
            });
        }    
    })
}





//function insertDefualtGroup(){//
//    var _defaultGroup=config.getDefaultGroup();
//    //檢查預設之使用者群組(即"未加入群組")有無存在，若不存在即新增此群組，確保使用者註冊時一定可以規屬到某一群組
//    this.getGroupCollection(function(err, collection){
//        if(err){
//            console.log('fail to initialize group collection!!');
//        }else{
//            console.log('get group collection:');
////            console.log(collection);
//            collection.findOne({name:_defaultGroup}, function(err, group){
//                if(err){
//                    console.log(err);
//                }else if(!group){
//                    collection.insert({name:_defaultGroup,description:_defaultGroup, createAt: Date.now(), default:true}, {safe:true}, function(err){
//                        if(err){
//                            console.log(err);
//                        }else{
//                            console.log('create default group');//新增預設群組成功
//                        }
//                    });
//                }else{
//                    console.log('default group exists');//預設群組已存在
//                }
//            });
//        }    
//    })
//}
/**
 * 開啟/關閉db。未使用pool機制的child process會手動開關db。
 */
Mongo.prototype.opendb = function(callback){
	this.db.open(callback);
}	
Mongo.prototype.closedb = function(callback){
	this.db.close(callback);
}	



/**
 * 以下為取得collection的function。僅在此模組內使用。
 */
Mongo.prototype.getBookcaseCollection = function(callback){
  this.db.collection('bookcases', function(error, bc_collection) {
    if( error ) {callback(error); }
    else {callback(null, bc_collection);}
  });
}
Mongo.prototype.getDeleteBookcaseCollection = function(callback){
  this.db.collection('deletebookcases', function(error, bc_collection) {
    if( error ) {callback(error); }
    else {callback(null, bc_collection);}
  });
}
Mongo.prototype.getDeleteAppCollection = function(callback){
  this.db.collection('deleteapps', function(error, bc_collection) {
    if( error ) {callback(error); }
    else {callback(null, bc_collection);}
  });
}
Mongo.prototype.getBookCollection = function(callback){
  this.db.collection('books', function(error, bc_collection) {
    if( error ) {callback(error); }
    else {callback(null, bc_collection);}
  });
}
Mongo.prototype.getBookVersionCollection = function(callback){
  this.db.collection('bookversions', function(error, bc_collection) {
    if( error ) {callback(error); }
    else {callback(null, bc_collection);}
  });
}
Mongo.prototype.getAppsCollection = function(callback){
  this.db.collection('apps', function(error, app_collection) {
    if( error ) callback(error);
    else callback(null, app_collection);
  });
}

Mongo.prototype.getVersionsCollection = function(callback){
  this.db.collection('versions', function(error, ver_collection) {
    if( error ) callback(error);
    else callback(null, ver_collection);
  });
}

Mongo.prototype.getUsersCollection = function(callback){
  this.db.collection('users', function(error, users_collection) {
    if( error ) callback(error);
    else callback(null, users_collection);
  });
}

Mongo.prototype.getAppleAcntCollection = function(callback){
  this.db.collection('apple_accounts', function(error, aAcnts) {
    if( error ) callback(error);
    else callback(null, aAcnts);
  });
}

Mongo.prototype.getGoogleAcntCollection = function(callback){
  this.db.collection('google_accounts', function(error, gAcnts) {
    if( error ){ callback(error);
    }else{ 
    	//var dataStr = JSON.stringify(gAcnts);
    	//console.log("@@@ gAcnts= %f",gAcnts.findOne());
    	callback(null, gAcnts);
    }
  });
}

Mongo.prototype.getGroupCollection = function(callback){
  this.db.collection('groups', function(error, groups_collection) {
    if( error ) callback(error);
    else callback(null, groups_collection);
  });
}
Mongo.prototype.getCategoryCollection = function(callback){
  this.db.collection('category', function(error, collection) {
    if( error ) callback(error);
    else callback(null, collection);
  });
}
Mongo.prototype.getAdsCollection = function(callback){
  this.db.collection('ads', function(error, ad_collection) {
    if( error ) callback(error);
    else callback(null, ad_collection);
  });
}
Mongo.prototype.getAdPlayListCollection = function(callback){
  this.db.collection('adPlayList', function(error, ad_collection) {
    if( error ) callback(error);
    else callback(null, ad_collection);
  });
}
Mongo.prototype.getAdTypeListCollection = function(callback){
  this.db.collection('adTypeList', function(error, ad_collection) {
    if( error ) callback(error);
    else callback(null, ad_collection);
  });
}

Mongo.prototype.getReadersCollection = function(callback){
  this.db.collection('readers', function(error, collection) {
    if( error ) callback(error);
    else callback(null, collection);
  });
}
Mongo.prototype.getPlatformCollection = function(callback){
  this.db.collection('platform', function(error, platform) {
    if( error ) callback(error);
    else callback(null, platform);
  });
}
Mongo.prototype.getBuildUserNumCollection = function(callback){
  this.db.collection('build_user_num', function(error, platform) {
    if( error ) callback(error);
    else callback(null, platform);
  });
}
Mongo.prototype.getBuildUserProcCollection = function(callback){
  this.db.collection('build_user_proc', function(error, platform) {
    if( error ) callback(error);
    else callback(null, platform);
  });
}
Mongo.prototype.getBuildUserProcMsgCollection = function(callback){
  this.db.collection('build_user_proc_msg', function(error, platform) {
    if( error ) callback(error);
    else callback(null, platform);
  });
}


/**
 * 將下面的函數expose給其他模組使用
 */
Mongo.prototype.getAppPermCondition = function(condition, uinfo){
    getAppPermCondition(condition, uinfo);
}

/**
 * query app時取得判斷使用者是否有權限存取的condition
 * 
 * 參數conidtion為起始條件，這個函數會根據uinfo在這個condition上多加一些條件，
 * 在query時可以判斷使用者是否能存取。
 */
function getAppPermCondition(condition, uinfo){
    condition=condition?condition:{};
    if(uinfo.super){
        condition={};
        return condition;
    }else if(uinfo.group && (uinfo.group.manager)){
        condition={'Group.id':uinfo.group.id};
        return condition;
    }else{
        condition={'user':uinfo.user,'Group.id':uinfo.group.id};
        return condition;
    }
}

function getGroupPermCondition(uinfo){
        var condition={'Group.id':uinfo.group.id};
        return condition;
}


/**
 * 取得所有apps
 */
Mongo.prototype.getApps = function(uinfo, callback) {
    var condition=getAppPermCondition(null,uinfo);
    console.log(condition);
    console.log('!!!!');
    this.getApps_general(condition, {}, callback);
};
/**
 * 取得所有apps
 */
Mongo.prototype.getAppsByGroup = function(uinfo, groupId, callback) {
    var condition=getAppPermCondition(null,uinfo);
    console.log(condition);
    console.log('!!!!');
    this.getApps_general(condition, {}, callback);
};

/**
 * 取得所有apps+image
 */

Mongo.prototype.getAppsApi = function(uinfo, option, callback) {
    //var condition=getAppPermCondition(null,uinfo);
	var condition = getGroupPermCondition(uinfo);
    console.log(condition);
    this.getAppsCollection(function(error, app_collection) {
        if( error ){console.log(error);callback(errcode.DB_ERR);}
        else {
			 console.log('in mongo, get apps, condition');
         
          app_collection.find(condition, option).toArray(function(error, results) {
            if( error ) callback(error)
            else callback(null, results)
          });
        }
      });
};

Mongo.prototype.getAppsApiByOS = function(uinfo, os, time, option, callback) {
    //var condition=getAppPermCondition(null,uinfo);
	var condition = getGroupPermCondition(uinfo);
	if(os != undefined)
		condition.OS = os;
	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}

    this.getAppsCollection(function(error, app_collection) {
        if( error ){console.log(error);callback(errcode.DB_ERR);}
        else {
			 console.log('in mongo, get apps, condition');
             console.log("FINAL HERE!!!!!!!!!"+JSON.stringify(condition));

          app_collection.find(condition, option).toArray(function(error, results) {
            if( error ) callback(error)
            else callback(null, results)
          });
        }
      });
};

/**
 * 取得所有書櫃
 */
Mongo.prototype.getBookcases = function(uinfo, callback) {
    var condition_=getAppPermCondition(null,uinfo);
    console.log(condition_);
    console.log(condition_[0]);
    console.log(condition_[1]);
    console.log(condition_['Group.id']);
    var condition={'General_Info.Group.id':condition_['Group.id']};
    console.log('!!!!');
    this.getBookcaseCollection(function(error, bookcase_collection) {
        if( error ){
			console.log(error);
			callback(errcode.DB_ERR);      	  
		  }else{
			condition = createConditionHex(condition, bookcase_collection);
			console.log(condition);
			bookcase_collection.find(condition).toArray(function(error, result) {
				if( error ){
					console.log(error);
					callback(errcode.DB_ERR);  
				} 
				else {
					callback(null, result);
				}
			});
		  }
      });
};

/**
 * 取得所有書櫃by OS
 */
Mongo.prototype.getBookcasesByOS = function(uinfo, os, time, option, callback) {
    //var condition_=getAppPermCondition(null,uinfo);
	var condition = {};

	if(uinfo.group && (uinfo.group.manager)){
        condition={'General_Info.Group.id':uinfo.group.id};
    }else{
        condition={'General_Info.User':uinfo.user,'General_Info.Group.id':uinfo.group.id};
    }



	if(os != undefined)
		condition['General_Info.OS'] = os;
	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}
	//condition['General_Info.User'] = condition_['user'];
	//condition['General_Info.Group.id'] = condition_['Group.id'];

	/*
	if(os != undefined)
		condition = {'General_Info.OS':os, 'General_Info.Group.id':condition_['Group.id']};
	else 
		condition = {'General_Info.Group.id':condition_['Group.id']};
	*/
	console.log(condition);
    //console.log('!!!!');
    this.getBookcaseCollection(function(error, bookcase_collection) {
        if( error ){
			console.log(error);
			callback(errcode.DB_ERR);      	  
		  }else{
			condition = createConditionHex(condition, bookcase_collection);
			console.log(condition);
			bookcase_collection.find(condition, option).toArray(function(error, result) {
				if( error ){
					console.log(error);
					callback(errcode.DB_ERR);  
				} 
				else {
					callback(null, result);
				}
			});
		  }
      });
};

Mongo.prototype.getBookcasesByBookstore = function(uinfo, os, time, option, callback) {
    //var condition=getGroupPermCondition(uinfo);
	var condition = {'General_Info.Group.id':uinfo.group.id};

	if(os != undefined)
		condition['General_Info.OS'] = os;
	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}

	console.log('bookcase condition: ' + JSON.stringify(condition));

    this.getBookcaseCollection(function(error, bookcase_collection) {
        if( error ){
			console.log(error);
			callback(errcode.DB_ERR);      	  
		  }else{
			condition = createConditionHex(condition, bookcase_collection);
			console.log(condition);
			bookcase_collection.find(condition, option).toArray(function(error, bookcases) {
				if( error ){
					console.log(error);
					callback(errcode.DB_ERR);  
				} 
				else {
					callback(null, bookcases);
				}
			});
		  }
      });
};


Mongo.prototype.getDeletedBookcases = function(uinfo, os, time, option, callback) {
	var condition = {};
        condition={'Group.id':uinfo.group.id};

	if(os != undefined)
		condition['OS'] = os;
	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}

	var temp = {};
	temp["$ne"] = "";
	condition.bookcaseId = temp;

	console.log(condition);

    this.getDeleteBookcaseCollection(function(error, del_collection) {
        if( error ){
			console.log(error);
			callback(errcode.DB_ERR);      	  
		  }else{
			condition = createConditionHex(condition, del_collection);
			console.log(condition);
			del_collection.find(condition, option).toArray(function(error, result) {
				if( error ){
					console.log(error);
					callback(errcode.DB_ERR);  
				} 
				else {
					callback(null, result);
				}
			});
		  }
      });
};

Mongo.prototype.getDeletedApps = function(uinfo, os, time, option, callback) {
    var condition={'Group.id':uinfo.group.id};

	if(os != undefined)
		condition['OS'] = os;
	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}

	var temp = {};
	temp["$ne"] = "";
	condition.appId = temp;

	console.log(condition);

    this.getDeleteAppCollection(function(error, del_collection) {
        if( error ){
			console.log(error);
			callback(errcode.DB_ERR);      	  
		  }else{
			condition = createConditionHex(condition, del_collection);
			console.log(condition);
			del_collection.find(condition, option).toArray(function(error, result) {
				if( error ){
					console.log(error);
					callback(errcode.DB_ERR);  
				} 
				else {
					callback(null, result);
				}
			});
		  }
      });
};

Mongo.prototype.getDeletedVersions = function(uinfo, time, option, callback) {
	var condition = {};

	if(uinfo.group && (uinfo.group.manager)){
        condition={'Group.id':uinfo.group.id};
    }else{
        condition={'User':uinfo.user,'Group.id':uinfo.group.id};
    }

	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}

	var temp = {};
	temp["$ne"] = "";
	condition.versionId = temp;

	console.log(condition);

    this.getDeleteAppCollection(function(error, del_collection) {
        if( error ){
			console.log(error);
			callback(errcode.DB_ERR);      	  
		  }else{
			condition = createConditionHex(condition, del_collection);
			console.log(condition);
			del_collection.find(condition, option).toArray(function(error, result) {
				if( error ){
					console.log(error);
					callback(errcode.DB_ERR);  
				} 
				else {
					callback(null, result);
				}
			});
		  }
      });
};

Mongo.prototype.getDeletedBooks = function(uinfo, time, option, callback) {
	var condition = {};

	if(uinfo.group && (uinfo.group.manager)){
        condition={'Group.id':uinfo.group.id};
    }else{
        condition={'User':uinfo.user,'Group.id':uinfo.group.id};
    }

	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}

	var temp = {};
	temp["$ne"] = "";
	condition.bookId = temp;
	

	console.log(condition);

    this.getDeleteBookcaseCollection(function(error, del_collection) {
        if( error ){
			console.log(error);
			callback(errcode.DB_ERR);      	  
		  }else{
			condition = createConditionHex(condition, del_collection);
			console.log(condition);
			del_collection.find(condition, option).toArray(function(error, result) {
				if( error ){
					console.log(error);
					callback(errcode.DB_ERR);  
				} 
				else {
					callback(null, result);
				}
			});
		  }
      });
};

Mongo.prototype.getDeletedBookversions = function(uinfo, time, option, callback) {
	var condition = {};

	if(uinfo.group && (uinfo.group.manager)){
        condition={'Group.id':uinfo.group.id};
    }else{
        condition={'User':uinfo.user,'Group.id':uinfo.group.id};
    }

	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}

	var temp = {};
	temp["$ne"] = "";
	condition.bookversionId = temp;
	

	console.log(condition);

    this.getDeleteBookcaseCollection(function(error, del_collection) {
        if( error ){
			console.log(error);
			callback(errcode.DB_ERR);      	  
		  }else{
			condition = createConditionHex(condition, del_collection);
			console.log(condition);
			del_collection.find(condition, option).toArray(function(error, result) {
				if( error ){
					console.log(error);
					callback(errcode.DB_ERR);  
				} 
				else {
					callback(null, result);
				}
			});
		  }
      });
};
/**
 * 取得所有書櫃
 */
Mongo.prototype.getPushBookcaseList = function(uinfo, callback){
	if(!checkLogin(uinfo, callback))
		return;
	console.log('req bookcase list');
    var condition;
    if(uinfo.super)
        condition={'Features.Push':1};
    else
        condition={'General_Info.Group.name':uinfo.group.name,'Features.Push':1};
    this.getBookcaseCollection(function(error, bc_collection) {
      if( error ) callback(error)
      else {
        bc_collection.find(condition).toArray(function(error, results) {
			console.log("*** getPushBookcaseList result="+results);
          if( error ) {callback(error); }
          else { callback(null, results); }
        });
      }
    });
}
function checkLogin(uinfo, callback){
	if(!uinfo.user){
	    console.log('not logged in');
    	callback(errcode.NOT_LOGIN);
	    return false;
	}else{
		return true;
	}	
}

/**
 * 根據分類取得所有apps
 */
Mongo.prototype.getAppsByCategory = function(uinfo, catId, callback) {
    var condition=getAppPermCondition(null,uinfo);
    condition['Category.id']=catId;
    this.getApps_general(condition, {}, callback);
};


/**
 * 取得分類後的apps
 */
Mongo.prototype.getCategorizedApps = function(uinfo, callback) {
    this.getAppsCollection(function(error, collection) {
        if( error ){console.log(error);callback(errcode.DB_ERR);}
        else {
            var condition=getAppPermCondition(null,uinfo);
            console.log("$$$ condition="+condition["user"]);
            console.log("$$$ condition="+condition["Group.id"]);
            collection.group(
            	{'Category.id': true, 'Category.name':true},
            	condition,
				{apps:[]}, 
				function(doc, prev) { prev.apps.push(doc);},
				function(err, data){ callback(err?errcode.DB_ERR:null, data);}
			);
//          app_collection.find(condition).toArray(function(error, results) {
//            if( error ) callback(error)
//            else callback(null, results)
//          });
        }
      });
};


/**
 * 取得所有apps by groupId
 */
Mongo.prototype.getAppsByGroupId = function(uinfo, groupId, callback) {
    var condition= {'Group.id': groupId};
    console.log(condition);
    //console.log('!!!!');
    this.getApps_general(condition, {}, callback);

};

/**
 * 取得app的function。搜尋條件和包含欄位都用參數傳入。
 */
Mongo.prototype.getApps_general = function(condition, include, callback) {
    if(!include)
        include={};
    this.getAppsCollection(function(error, app_collection) {
        if( error ){console.log(error);callback(errcode.DB_ERR);}
        else {
        	console.log(condition);
            condition=createConditionHex(condition, app_collection);
			 console.log('in mongo, get apps, condition');
         
          //app_collection.find(condition, include).sort({"Timestamp":-1}).toArray(function(error, results) {
          app_collection.find(condition, include).sort({"Timestamp":-1}).toArray(function(error, results) {
            if( error ) callback(error)
            else callback(null, results)
          });
        }
      });
};


/**
 * 根據app id 取得app。變數uinfo和creator是用來權限控管。
 * uinfo用來核對該app的editors清單(即user欄位)是否有該使用者判斷是否俱備app editor身份。
 * 而creator是進一步篩選由該user創建之app(也就是說找出那些由該使用者admin的app)。
 * 若不需要限定query條件為該使用者create的app，則creator為null。
 * 但uinfo一定要有值。
 */
Mongo.prototype._getAppById = function(uinfo, creator, app_id, callback) {
	try{
		this.getAppsCollection(function(error, app_collection) {
			var condition = {'_id':app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if(uinfo.group && uinfo.group.manager){//如果是群組管理者，只需檢查app的群組
    		    condition['Group.id']==uinfo.group.id;
			}else if(!uinfo.super){//如果不是su也不是群組管理者，需要遵循權限檢查
				condition.user=uinfo.user;
                if(creator)
				    condition.Creator=creator;
			}
		    if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    else {
		    	app_collection.findOne(condition, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else callback(null, result)
		    	});
		    }
		 });
	}catch(err){
		console.log(err.stack);
		callback(errcode.DB_ERR);
	}
    
}

Mongo.prototype.getAppApi = function(uinfo, app_id, option, callback) {
	try{
		this.getAppsCollection(function(error, app_collection) {
			var condition = {'_id':app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if(uinfo.group && uinfo.group.manager){//如果是群組管理者，只需檢查app的群組
    		    condition['Group.id']==uinfo.group.id;
			}else if(!uinfo.super){//如果不是su也不是群組管理者，需要遵循權限檢查
				condition.user=uinfo.user;
                //if(creator)
				   // condition.Creator=creator;
			}
			console.log("0710!!!"+condition);
		    if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    else {
		    	app_collection.findOne(condition, option, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else callback(null, result)
		    	});
		    }
		 });
	}catch(err){
		console.log(err.stack);
		callback(errcode.DB_ERR);
	}
    
}
/**
 * 更改某一app的editor資料。可一次修改一位或多位。
 * 若修改一位，uid為該user資料，list為null
 * 若修改多位，uid為null，list為json格式，裏面包含要新增/移除為editors的使用者陣列(放在users欄位)，ex:{"users":["user1","user2"]}。
 * uinfo:更改者資料
 * appId:app id
 * involve:true:新增為editors、false:從移除中移除
 * callback:function(err)
*/
Mongo.prototype.updateAppEditors = function(uinfo, appId, uid, list, involve, callback){
    var uids=[];
    if(uid)
        uids.push(uid);
    if(list){
        try{
        	console.log("updateAppEditors1");
            var data = JSON.parse(list);
            if(data && data.users && Object.prototype.toString.call( data.users ) === '[object Array]'){
                uids.push.apply(uids, data.users);
            }
        }catch(err){
            console.log(err);
        }
    }
    if(uids.length===0){
    	console.log("updateAppEditors2");
        callback(errcode.INVALID_UID);
        return;
    }
    var selfIdx=uids.indexOf(uinfo.user);//禁止移除自己
    if(selfIdx>0){
        delete uids[selfIdx];
    }
    this._updateAppEditors(uinfo, appId, uids, involve, callback);
}
/**
 * 更改某一app的editor資料。和上面的差別在於只給內部呼叫，沒有去做post上來的json data的格式處理。
 * uinfo:更改者資料
 * appId:app id
 * uids:array，要修改的使用者清單
 * involve:true:新增為editors、false:從移除中移除
 * callback:function(err)
 */
Mongo.prototype._updateAppEditors = function(uinfo, appId, uids, involve, callback) {   
 var db=this;
 db.getCreatedAppById(uinfo, appId, function(err, app){
        if(err){
            callback(err);
            return;
        }else if(!app){
            callback(errcode.INACCESSIBLE_APP);
            return;
        }else{
            if(uids.length===0){
                callback(errcode.INVALID_UID);
                return;
            }
            if(involve){//新增editor，若該使用者本來已在editor清單則不處理
                for(var i=0;i<uids.length;i++){
                    if(app.user.indexOf(uids[i])>=0)
                        delete uids[i];
                }
                db.updateApp({_id:appId}, {$pushAll:{user:uids}}, {safe:true}, updateVersions);
            }else{//移除editor，若該使用者本來不在editor清單則不處理
                for(var i=0;i<uids.length;i++){
                    if(app.user.indexOf(uids[i])<0)
                        delete uids[i];
                    else if(app.Creator==uids[i]) //不能刪除app admin
                        delete uids[i];
                }
                db.updateApp({_id:appId}, {$pullAll:{user:uids}}, {safe:true}, updateVersions);
            }
        }
    });
    
    function updateVersions(err, count){ //連同該app底下的version資料也要一errcode
        var operation=involve?{$pushAll:{"General_Info.User":uids}}:{$pullAll:{"General_Info.User":uids}};
        db.updateVersion({"General_Info.APP_id":appId}, operation, {safe:true, multi:true}, callback);
    }
 
}


/**
 * 讓某一app沿襲另一app的editors
 * 由toApp繼承fromApp
 */
Mongo.prototype.inheritAppEditors = function(uinfo, fromApp, toApp, callback){
    if(!uinfo.user){
        callback(errcode.NOT_LOGIN);
        return;
    }else if(!fromApp || !toApp){
        callback(errcode.INVALID_APP);
        return;
    }
    var db =this;
    db.getCreatedAppById(uinfo, fromApp, function(err, app){
        if(err){
            callback(err);
            return;
        }else if(!app || !app.user){
            callback(errcode.INVALID_APP);
            return;
        }
        db._updateAppEditors(uinfo, toApp, app.user, true, callback);
    });
}


/**
 * 將群組成員設為app editors
 */
Mongo.prototype.addGroupToEditorList = function(uinfo, group, appId, callback){
    if(!uinfo.user){
        callback(errcode.NOT_LOGIN);
        return;
    }else if(!appId){
        callback(errcode.INVALID_APP);
        return;
    }
    var db =this;
    db.listGroupUsers(uinfo, group, true, function(err, users){
        if(err){
            callback(err);
            return;
        }else if(!users || users.length===0){
            callback(null);
            return;
        }
        var userArray=[];
        for(var i=0; i<users.length;i++){
            userArray.push(users[i].user);
        }
        db._updateAppEditors(uinfo, appId, userArray, true, callback);
    });
}

/**
 * 取得單一app
 */
Mongo.prototype.getAppById = function(uinfo, app_id, callback) {   
	this._getAppById(uinfo, null, app_id, callback);
};

/**
 * 取得該user建立的某一app
 */
Mongo.prototype.getCreatedAppById = function(uinfo, app_id, callback){
	this._getAppById(uinfo, uinfo.user, app_id, callback);
};

/**
 * 取得該使用者所有創建的app
 */
Mongo.prototype.getCreatedApps = function(uinfo, callback){
    var condition;
    if(uinfo.super){
        condition={};
    }else if(uinfo.group && uinfo.group.manager){
        condition={'Group.id':uinfo.group.id}
    }else{
        condition={Creator:uinfo.user};   
    }
    this.getApps_general(condition, {}, callback);
};

/**
 * 取得該使用者所有被加入的app
 */
Mongo.prototype.getUserApps = function(uinfo, callback){
    var condition;
    if(uinfo.super){
        condition={};
    }else if(uinfo.group && uinfo.group.manager){
        condition={'user':uinfo.user}
    }else{
        condition={Creator:uinfo.user};   
    }
    this.getApps_general(condition, {}, callback);
};

Mongo.prototype.Version={};
Mongo.prototype.Version.IncludeCondition={};
	
/**
 * 當資料向外傳遞時留下欄位。(拿掉所有local端資訊，如icon在local端的path和version的目錄等)
 */
Mongo.prototype.Version.IncludeCondition.Outward = {'iOS.FacebookSdkPath':0, 'iOS.ProvisioningProfile':0, 'iOS.ReaderPath':0, 'Android.ReaderPath':0, 'Features.iOS.csr_path':0, 'General_Info.download':0,'General_Info.BuildXml':0,'General_Info.Src':0,'General_Info.download_plist':0, 'General_Info.Folder':0,'Android.icon':0,'iOS.icon':0};

	
/**
 * 當資料向外傳遞時留下哪些欄位。(拿掉local端資訊，但保留icon)
 */
Mongo.prototype.Version.IncludeCondition.OutwardWithIcon = {'iOS.FacebookSdkPath':0, 'iOS.ProvisioningProfile':0, 'iOS.ReaderPath':0, 'Android.ReaderPath':0,  'Features.iOS.csr_path':0, 'General_Info.download':0,'General_Info.BuildXml':0,'General_Info.Src':0,'General_Info.download_plist':0, 'General_Info.Folder':0};

/**
 * 取得單一app下所有versions
 * 廣義形式
 * 可自行指定query condition和哪些field要include/exclude
 */
Mongo.prototype.getVersions_general = function(uinfo, app_id, queryCondition, include, callback) {
	var condition = {};
	if(queryCondition){
		for(var property in queryCondition){
			condition[property]=queryCondition[property];
		}
	}
    if(uinfo.group && uinfo.group.manager){
        condition['General_Info.Group.id'] = uinfo.group.id;
    }else if(!uinfo.super)
	    condition['General_Info.User'] = uinfo.user;
	condition['General_Info.APP_id'] = app_id;
    this.getVersionsCollection(function(error, ver_collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR)}
      else {
        ver_collection.find(condition, include, {sort:'General_Info.Version'}).toArray(function(error, results) {
          if( error ){console.log(error);callback(errcode.DB_ERR)}
          else callback(null, results)
        });
      }
    });
};

Mongo.prototype.checkBuildUserNumCollectionExist = function(callback) {
	var condition = {};
    this.getBuildUserNumCollection(function(error, bc_collection) {
		if( error ) {callback(error); }
		else {
			bc_collection.findOne({},function(error,doc) {
				callback(error, doc);
			});
		}
	});
};
// Mongo.prototype.createBuildUserNumCollection= function(callback) {
// 	var condition = {};
//     this.getBuildUserNumCollection(function(error, ver_collection) {
//       if( error ) {console.log(error);callback(errcode.DB_ERR)}
//       else {
// 		ver_collection.insert({"currentUser":"0"}, {safe:true}, function(error, doc) {
//           callback(null, doc);
//         });
//       }
//     });
// };
Mongo.prototype.createBuildUserNumCollection = function(callback){
  this.db.createCollection('build_user_num', function(error, bc_collection) {
    if( error ) {
    	console.log('errrrr');
    	callback(error); 
    }
    else {
    	if(bc_collection==null){
			bc_collection.insert({"currentUser":"0"}, {safe:true}, function(error, doc) {
			  callback(null, doc);
			});
        }else{
//         	console.log('hohoho');
        	bc_collection.update({},{$set:{"currentUser":"0"}},{safe:true, upsert: true},function(error,doc) {
        		console.log(error);
        		callback(error, doc);
        		//console.log(error);
        	});
        }
    }
  });
}
Mongo.prototype.createBuildUserProcCollection = function(callback){
  this.db.createCollection('build_user_proc', function(error, bc_collection) {
   callback(error); 
  });
}
Mongo.prototype.createBuildUserProcMsgCollection = function(callback){
  this.db.createCollection('build_user_proc_msg', function(error, bc_collection) {
    callback(error); 
  });
}
Mongo.prototype.setBuildUserNumZero = function( callback){
	console.log("@! buildUserNumPlus");
  this.getBuildUserNumCollection(function(error, bc_collection) {
    if( error ) {callback(error); }
    else {
    	bc_collection.findOne({},function(error,doc) {
    		
			//callback(error, doc);
			console.log(doc.currentUser);
			updateBuildUserNum(bc_collection,0,function(){
				console.log(error);
				callback(error);
			});
			
		});
    }
  });
}
Mongo.prototype.BuildUserNumPlus = function( callback){
	console.log("@! buildUserNumPlus");
  this.getBuildUserNumCollection(function(error, bc_collection) {
    if( error ) {callback(error); }
    else {
    	bc_collection.findOne({},function(error,doc) {
    		
			//callback(error, doc);
			console.log(doc);
			console.log(doc.currentUser);
			updateBuildUserNum(bc_collection,(doc.currentUser+1),function(){
				console.log(error);
				callback(error);
			});
			
		});
    }
  });
}
function updateBuildUserNum(bc_collection,num,callback){
    	bc_collection.update({},{$set:{"currentUser":num}},{safe:true},function(error,doc) {
			callback(error);
			//console.log(error);
		});
}
Mongo.prototype.BuildUserNumMinus = function(ver,uinfo, callback){
	console.log("@! BuildUserNumMinus--");
	var mongoo=this;
	
	 //setTimeout(function() {
		mongoo.getBuildUserProcCollection(function(error, collection){
			mongoo.getBuildUserProcMsgCollection(function(error, msgCollection){
				collection.find({},{}).sort({"timestamp":1}).toArray(function(err, result) {
				//collection.find({"uinfo.user":uinfo.user},{}).toArray(function(err, result) {
					if(ver!=null && uinfo!=null){
						var cur_timestamp=Date.now();
						mongoo.getBookcaseById(uinfo,ver._id, function(err, bc_result){
							mongoo.getVersionById(uinfo, ver._id, function(err, ver_result){
								msgCollection.find({proc_id:ver._id},{}).toArray(function(err, msg_result) {
									if(msg_result.length>0){
										if(bc_result)
											msgCollection.insert({user:uinfo.user, type:"bookcase", buildType:"none", proc_id: ver._id, name:ver.General_Info.APP_name, timestamp:cur_timestamp}, {safe:true}, function(err){
												if(error){}
											});
										else
											msgCollection.insert({user:uinfo.user, type:"version", buildType:"none", proc_id: ver._id, name:ver.General_Info.APP_name, verNum:ver.General_Info.Version, timestamp:cur_timestamp}, {safe:true}, function(err){
												if(error){}
											});
									}
								});
							});
						});
					}
				
				
					if(result.length>0){
						//遙控封裝  /version/build/'+versionId
						//var request = require('request');
				
						var url='http://localhost/version/build/'+result[0].proc_id;
						if(result[0].type=="version" && result[0].buildType=="enterprise") //打包版本
							url='http://localhost/version/build/'+result[0].proc_id;
						else if(result[0].type=="version" && result[0].buildType!="enterprise") //打包上架版本
							url='http://localhost/version/official_build/'+result[0].proc_id;
						else if(result[0].type=="bookcase" && result[0].buildType=="enterprise") //打包書櫃
							url='http://localhost/bookcase/pack/'+result[0].proc_id;
						else if(result[0].type=="bookcase" && result[0].buildType!="enterprise") //打包上架版書櫃
							url='http://localhost/bookcase/pack_official/'+result[0].proc_id;
				
						console.log("*** in getBuildUserProcCollection, user = "+result[0].uinfo.user);
				
						request.post({
						  url: url,
						  headers: {
							'Content-Type': 'application/json'
						  },
						  body: JSON.stringify({
							uinfo:result[0].uinfo
						  })
						}, function(error, response, body){
						  console.log("version/build.");
						})
						collection.remove({"uinfo":result[0].uinfo, type:result[0].type, buildType:result[0].buildType, proc_id:result[0].proc_id},function(error){
							var cur_timestamp=Date.now();
							if(result[0].type=="version"){
								mongoo.getVersionById(result[0].uinfo, result[0].proc_id, function(err, ver){
									msgCollection.insert({user:result[0].uinfo.user, type:result[0].type, buildType:result[0].buildType, proc_id: result[0].proc_id, name:ver.General_Info.APP_name, verNum:ver.General_Info.Version, timestamp:cur_timestamp}, {safe:true}, function(err){
										if(error){}
									});
								});
							}else{
								mongoo.getBookcaseById(result[0].uinfo, result[0].proc_id, function(err, ver){
									msgCollection.insert({user:result[0].uinfo.user, type:result[0].type, buildType:result[0].buildType, proc_id: result[0].proc_id, name:ver.General_Info.APP_name, timestamp:cur_timestamp}, {safe:true}, function(err){
										if(error){}
									});
								});
							}
						});
					}
				});
			});
		});
	//}, 1000);	
	mongoo.getBuildUserNumCollection(function(error, bc_collection) {
		console.log('getBuildUserNum=========');
		if( error ) {
			console.log(error);
			callback(error); 
		}
		else {
			console.log('else =========');
			bc_collection.findOne({},function(error,doc) {
				console.log('err:');
				console.log('err: '+error);
				console.log(doc.currentUser);
				if(doc.currentUser>0){
					updateBuildUserNum(bc_collection,(doc.currentUser-1),function(){
						console.log('updateBuildUserNum:');
						console.log('updateBuildUserNum:'+error);
						callback(error);
					});
				}else{
					callback(error);
				}
			});
		}
	  });
  
	 
 
}


/**
 * 取得所有企業版bundle id =  versions
 * 廣義形式
 * 可自行指定query condition和哪些field要include/exclude
 */
Mongo.prototype.getVersions_general = function(uinfo, app_id, queryCondition, include, callback) {
	var condition = {};
	if(queryCondition){
		for(var property in queryCondition){
			condition[property]=queryCondition[property];
		}
	}
    if(uinfo.group && uinfo.group.manager){
        condition['General_Info.Group.id'] = uinfo.group.id;
    }else if(!uinfo.super)
	    condition['General_Info.User'] = uinfo.user;
	condition['General_Info.APP_id'] = app_id;
    this.getVersionsCollection(function(error, ver_collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR)}
      else {
        ver_collection.find(condition, include, {sort:'General_Info.Version'}).toArray(function(error, results) {
          if( error ){console.log(error);callback(errcode.DB_ERR)}
          else callback(null, results)
        });
      }
    });
};

/**
 * 取得所有version
 */
Mongo.prototype.getVersions = function(uinfo, app_id, outward, callback) {
	var excludeCondition={};
	if(outward){
		if(outward.keepIcon)
			excludeCondition={'Features.iOS.csr_path':0, 'General_Info.download':0,'General_Info.BuildXml':0,'General_Info.Src':0,'General_Info.download_plist':0, 'General_Info.Folder':0};
		else
			excludeCondition={'Features.iOS.csr_path':0, 'General_Info.download':0,'General_Info.BuildXml':0,'General_Info.Src':0,'General_Info.download_plist':0, 'General_Info.Folder':0, 'Android.icon':0,'iOS.icon':0};
	}
    this.getVersionsCollection(function(error, ver_collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR)}
      else {
        var condition={'General_Info.APP_id':app_id};
        if(uinfo.group && uinfo.group.manager){
            condition['General_Info.Group.id'] = uinfo.group.id;
        }else if(!uinfo.super){
//             condition['General_Info.User']=uinfo.user;
            condition['General_Info.Group.id'] = uinfo.group.id;
        }
        //ver_collection.find(condition, excludeCondition).sort({'General_Info.Version':-1}).toArray(function(error, results) {
        ver_collection.find(condition, excludeCondition).sort({'General_Info.Timestamp':-1}).toArray(function(error, results) {
          if( error ){console.log(error);callback(errcode.DB_ERR)}
          else callback(null, results)
        });
      }
    });
};
/**
 * 取得所有version by OS
 */
Mongo.prototype.getVersionsByAPI = function(uinfo, app_id, time, option, outward, callback) {
	var excludeCondition={};
	if(outward){
		if(outward.keepIcon)
			excludeCondition={'Features.iOS.csr_path':0, 'General_Info.download':0,'General_Info.BuildXml':0,'General_Info.Src':0,'General_Info.download_plist':0, 'General_Info.Folder':0};
		else
			excludeCondition={'Features.iOS.csr_path':0, 'General_Info.download':0,'General_Info.BuildXml':0,'General_Info.Src':0,'General_Info.download_plist':0, 'General_Info.Folder':0, 'Android.icon':0,'iOS.icon':0};
	}
    this.getVersionsCollection(function(error, ver_collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR)}
      else {
		var condition = {};
			condition = {'General_Info.APP_id':app_id};
        if(uinfo.group && uinfo.group.manager){
            condition['General_Info.Group.id'] = uinfo.group.id;
        }else if(!uinfo.super){
            condition['General_Info.Group.id'] = uinfo.group.id;
        }
		if(time != undefined) {
			var temp = {};
			temp["$gt"] = parseInt(time);
			condition['General_Info.Timestamp'] = temp;
		}
        ver_collection.find(condition, option, {sort:'General_Info.Version'}).toArray(function(error, results) {
          if( error ){console.log(error);callback(errcode.DB_ERR)}
          else callback(null, results)
        });
      }
    });
};

Mongo.prototype.showOnlineVersionsApi = function(uinfo, app_id, time, option, outward, callback) {
	var excludeCondition={};
	var _this = this;

	if(outward){
		if(outward.keepIcon)
			excludeCondition={'Features.iOS.csr_path':0, 'General_Info.download':0,'General_Info.BuildXml':0,'General_Info.Src':0,'General_Info.download_plist':0, 'General_Info.Folder':0};
		else
			excludeCondition={'Features.iOS.csr_path':0, 'General_Info.download':0,'General_Info.BuildXml':0,'General_Info.Src':0,'General_Info.download_plist':0, 'General_Info.Folder':0, 'Android.icon':0,'iOS.icon':0};
	}
    this.getVersionsCollection(function(error, ver_collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR)}
      else {
		var condition = {};
		condition = {'General_Info.APP_id':app_id};
        condition['General_Info.Group.id'] = uinfo.group.id;

		condition['General_Info.official'] = 1;

		if(time != undefined) {
			var temp = {};
			temp["$gt"] = parseInt(time);
			condition['General_Info.Timestamp'] = temp;
		}
        ver_collection.find(condition, option, {sort:'General_Info.Version'}).toArray(function(error, versions) {
          if( error ){console.log(error);callback(errcode.DB_ERR)}
		  else if(!versions || versions.length == 0) {
		  	callback(null, []); 
		  }
          else {
			console.log(versions);
			 var count = 1;
			 versions.forEach(function(version, i) {
				versions[i].appUrl = "/download_src/"+version._id;
				versions[i].imageUrl = "/version_icon/"+version._id;
				versions[i].Sale_Info = {};
				versions[i].Sale_Info.name = '';
				versions[i].Sale_Info.desc = '';
				versions[i].Sale_Info.price = null;
				versions[i].Sale_Info.date = null;
				versions[i].Sale_Info.online = false;
				if(count == versions.length) {
					callback(null, versions); 
				}
				count++;
			 });
		  }
        });
      }
    });
};

/**
 * 根據version id取得單一version
 */
Mongo.prototype.getVersionById = function(uinfo, ver_id, callback) {
	console.log("*** Mongo.prototype.getVersionById verid="+ver_id);
	var mongo=this;
	try{
		this.getVersionsCollection(function(error, ver_collection) {
		      if( error ){
		      	console.log("*** getVersionsCollection err");
		      	console.log(error);
		    	callback(errcode.DB_ERR);      	  
		      }else {
                var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)};
                console.log("*** condition="+condition);
                if(uinfo.group && uinfo.group.manager){
                    condition['General_Info.Group.id'] = uinfo.group.id;
                    ver_collection.findOne(condition,function(error, result) {
					  if( error ){
						console.log(error);
						callback(errcode.DB_ERR);  
					  } 
					  else callback(null, result)
					});
                }else if(!uinfo.super){
                	ver_collection.findOne(condition,function(error, result) {
					  if( error ){
						console.log(error);
						callback(errcode.DB_ERR);  
					  } 
					  else{ 
					  	mongo._getAppById(uinfo, null, result.General_Info.APP_id, function(err, app){
							if(err){
							   callback(errcode.DB_ERR);  
							}else{
								for(var i=0;i<app.user.length;i++){
									if(app.user[i]==uinfo.user){
										console.log("有！！！！");
										i=app.user.length;
										callback(null, result);
									}
								}
							}
						});
					  	//callback(null, result);
					  }
					});
                    //condition['General_Info.User']=uinfo.user;
                }
		        
		      }
		    });
	}catch(err){
		console.log(err);
		callback(errcode.DB_ERR);
	}
    
};

/**
 * 根據version id取得單一version
 */
Mongo.prototype.getBookcaseById = function(uinfo, ver_id, callback) {
	try{
		this.getBookcaseCollection(function(error, ver_collection) {
		      if( error ){
		      	console.log(error);
		    	callback(errcode.DB_ERR);      	  
		      }else {
                var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)};
                if(uinfo.group && uinfo.group.manager){
                    condition['General_Info.Group.id'] = uinfo.group.id;
                }else if(!uinfo.super)
                    condition['General_Info.User']=uinfo.user;
		        ver_collection.findOne(condition,function(error, result) {
		          if( error ){
		        	console.log(error);
		        	callback(errcode.DB_ERR);  
		          } 
		          else callback(null, result)
		        });
		      }
		    });
	}catch(err){
		console.log(err);
		callback(errcode.DB_ERR);
	}
    
};

Mongo.prototype.getBookcaseApi = function(uinfo, ver_id, option, callback) {
	try{
		this.getBookcaseCollection(function(error, ver_collection) {
		      if( error ){
		      	console.log(error);
		    	callback(errcode.DB_ERR);      	  
		      }else {
                var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)};
                if(uinfo.group && uinfo.group.manager){
                    condition['General_Info.Group.id'] = uinfo.group.id;
                }else if(!uinfo.super)
                    condition['General_Info.User']=uinfo.user;

				console.log(condition);
				console.log(option);

		    	ver_collection.findOne(condition, option, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else callback(null, result)
		    	});
		      }
		    });
	}catch(err){
		console.log(err);
		callback(errcode.DB_ERR);
	}
    
};

Mongo.prototype.getBookApi = function(uinfo, ver_id, option, callback) {
	try{
		this.getBookCollection(function(error, ver_collection) {
		      if( error ){
		      	console.log(error);
		    	callback(errcode.DB_ERR);      	  
		      }else {
                var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id), 'General_Info.Group.name': uinfo.group.name};

		    	ver_collection.findOne(condition, option, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else callback(null, result)
		    	});
		      }
		    });
	}catch(err){
		console.log(err);
		callback(errcode.DB_ERR);
	}
    
};

Mongo.prototype.getBookById = function(uinfo, book_id, callback) {

	try{
		this.getBookCollection(function(error, book_collection) {
		      if( error ){
		      	console.log(error);
		    	callback(errcode.DB_ERR);      	  
		      }else {
                var condition={'_id':book_collection.db.bson_serializer.ObjectID.createFromHexString(book_id), 'General_Info.Group.name': uinfo.group.name};
                //var condition={'_id':book_id};
		        book_collection.findOne(condition,function(error, result) {
		          if( error ){
		        	console.log(error);
		        	callback(errcode.DB_ERR);  
		          } 
		          else callback(null, result)
		        });
		      }
		    });
	}catch(err){
		console.log(err);
		callback(errcode.DB_ERR);
	}    
    
};

Mongo.prototype.getBookVersionById = function(uinfo, book_id, callback) {
    try{
		this.getBookVersionCollection(function(error, book_collection) {
		      if( error ){
		      	console.log(error);
		    	callback(errcode.DB_ERR);      	  
		      }else {
                var condition={'_id':book_collection.db.bson_serializer.ObjectID.createFromHexString(book_id), 'General_Info.Group.name': uinfo.group.name};
                //var condition={'_id':book_id};
		        book_collection.findOne(condition,function(error, result) {
		          if( error ){
		        	console.log(error);
		        	callback(errcode.DB_ERR);  
		          } 
		          else callback(null, result)
		        });
		      }
		    });
	}catch(err){
		console.log(err);
		callback(errcode.DB_ERR);
	}    
};	

Mongo.prototype.showBooksById = function(id, uinfo, callback){

	if(!checkLogin(uinfo, callback))
		return;

	console.log('req books list');

    var condition;
    //if(uinfo.super)
    //    condition=null;
    //else
        condition={'user':uinfo.user, 'bookcaseId':id};

    this.getBookCollection(function(error, book_collection) {
      if( error ) callback(error)
      else {
        book_collection.find(condition).toArray(function(error, results) {
			//console.log(results);
          if( error ) {callback(error); }
          else { callback(null, results); }
        });
      }
    });
}

Mongo.prototype.showBooksApi = function(id, uinfo, time, option, callback){

	if(!checkLogin(uinfo, callback))
		return;

	console.log('req books list');

    var condition={'General_Info.Group.id':uinfo.group.id, bookcaseId:id};
	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}

	console.log(condition);

    this.getBookCollection(function(error, book_collection) {
      if( error ) callback(error)
      else {
        book_collection.find(condition, option).toArray(function(error, results) {
			//console.log(results);
          if( error ) {callback(error); }
          else { callback(null, results); }
        });
      }
    });
}

Mongo.prototype.showOnlineBooksApi = function(id, uinfo, time, option, callback){

	if(!checkLogin(uinfo, callback))
		return;

	console.log('req books list');

    var condition={online: true, $and:[{onlineVersionId: {$ne: null}}, {onlineVersionId: {$ne: ''}}], 'General_Info.Group.id':uinfo.group.id, bookcaseId:id};
	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}

	console.log(condition);
	var _this = this;
    this.getBookCollection(function(error, book_collection) {
      if( error ) callback(error)
      else {
        book_collection.find(condition, option).toArray(function(error, books) {
			//console.log(results);
          if( error ) {callback(error); }
		  else if(!books || books.length == 0 ) {
		  	callback(null, []); 
		  }
          else {
			 var count = 1;
			 books.forEach(function(book, i) {
				books[i].bookUrl = "/book/book_content/"+book._id;
				books[i].imageUrl = "/book/book_image/"+book._id;
				books[i].Paged = 0;
				books[i].Sale_Info = {};
				books[i].Sale_Info.productID = '';
				books[i].Sale_Info.name = '';
				books[i].Sale_Info.priceTier = '';
				books[i].Sale_Info.desc = '';
				books[i].Sale_Info.date = null;
				books[i].Sale_Info.bookType = '';
				books[i].Sale_Info.online = false;

				_this.getBookVersionCollection(function(error, bookver_collection) {
					  if( error ) callback(error);
					  else {
						bookver_collection.find({'_id':bookver_collection.db.bson_serializer.ObjectID.createFromHexString(book.onlineVersionId)}).toArray(function(error, results) {
						  if( error ) {
							console.log("Error: "+error);
						  }
						  else {
							console.log('result!! '+results[0]);
							books[i].Paged = results[0].General_Info.Paged;
						  }
		
							if(count == books.length) {
								callback(null, books); 
							}
							count++;
						});
					  }
				});	
			 });
		  }
        });
      }
    });
}

Mongo.prototype.showBookVersionsApi = function(id, uinfo, time, option, callback){

	if(!checkLogin(uinfo, callback))
		return;

	console.log('req bookVersions list');

    var condition={'bookId':id};

	if(time != undefined) {
		var temp = {};
		temp["$gt"] = parseInt(time);
		condition.Timestamp = temp;
	}

    this.getBookVersionCollection(function(error, book_collection) {
      if( error ) callback(error)
      else {
        book_collection.find(condition, option).toArray(function(error, results) {
			//console.log(results);
          if( error ) {callback(error); }
          else { callback(null, results); }
        });
      }
    });
}


/**
 * 更新app
 */
Mongo.prototype.updateApp = function(condition, update, options, callback) {
    this.getAppsCollection(function(error, app_collection) {
      if( error ){
        console.log(error);
    	callback(errcode.DB_ERR);      	  
      }else{
		//update["$set"].Timestamp = new Date().getTime();
		console.log('xxxx'+JSON.stringify(update));
        condition = createConditionHex(condition, app_collection);
        app_collection.update(condition, update, options, function(error, result) {
            if( error ){
        	    console.log(error);
        	    callback(errcode.DB_ERR);  
            } 
            else callback(null, result);
        });
      }
    });
};	

/**
 * 更新version
 */
Mongo.prototype.updateVersion = function(condition, update, options, callback) {
    this.getVersionsCollection(function(error, ver_collection) {
      if( error ){
      	console.log(error);
    	callback(errcode.DB_ERR);      	  
      }else{
        condition = createConditionHex(condition, ver_collection);
        ver_collection.update(condition, update, options, function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null);
        });
      }
    });
};	

Mongo.prototype.updateBookVersion = function(condition, update, options, callback) {
    this.getBookVersionCollection(function(error, ver_collection) {
      if( error ){
      	console.log(error);
    	callback(errcode.DB_ERR);      	  
      }else{
        condition = createConditionHex(condition, ver_collection);
		console.log("!!!!!!!!!!"+JSON.stringify(condition));
        ver_collection.update(condition, update, options, function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null);
        });
      }
    });
};	


/**
 * 更新bookcase
 */
Mongo.prototype.updateBookcase = function(condition, update, options, callback) {
    this.getBookcaseCollection(function(error, bookcase_collection) {
      if( error ){
        console.log(error);
    	callback(errcode.DB_ERR);      	  
      }else{
        condition = createConditionHex(condition, bookcase_collection);
        bookcase_collection.update(condition, update, options, function(error, result) {
            if( error ){
        	    console.log(error);
        	    callback(errcode.DB_ERR);  
            } 
            else callback(null, result);
        });
      }
    });
};	

/**
 * 找出並更新version。(more efficient than query+update)
 */
Mongo.prototype.findAndModifyVersion = function(condition, update, options, callback) {
    this.getVersionsCollection(function(error, collection) {
      if( error ){
          console.log(error);
    	callback(errcode.DB_ERR);      	  
      }else{
        condition = createConditionHex(condition, collection);
        collection.findAndModify(condition, {}, update, {safe:true}, function(err, ver){
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR, null);  
          } 
          else callback(null, ver);
        });
      }
    });
};	
Mongo.prototype.findAndModifyApp = function(condition, update, options, callback) {
    this.getAppsCollection(function(error, collection) {
      if( error ){
          console.log(error);
    	callback(errcode.DB_ERR);      	  
      }else{
        condition = createConditionHex(condition, collection);
        collection.findAndModify(condition, {}, update, {safe:true}, function(err, ver){
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR, null);  
          } 
          else callback(null, ver);
        });
      }
    });
};		
Mongo.prototype.findAndModifyBook = function(condition, update, options, callback) {
    this.getBookCollection(function(error, collection) {
      if( error ){
          console.log(error);
    	callback(errcode.DB_ERR);      	  
      }else{
        condition = createConditionHex(condition, collection);
        collection.findAndModify(condition, {}, update, {safe:true}, function(err, ver){
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR, null);  
          } 
          else callback(null, ver);
        });
      }
    });
};	
Mongo.prototype.findAndModifyBookcase = function(condition, update, options, callback) {
    this.getBookcaseCollection(function(error, collection) {
      if( error ){
          console.log(error);
    	callback(errcode.DB_ERR);      	  
      }else{
        condition = createConditionHex(condition, collection);
        collection.findAndModify(condition, {}, update, {safe:true}, function(err, ver){
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR, null);  
          } 
          else callback(null, ver);
        });
      }
    });
};	
Mongo.prototype.findAndModifyBookVersion = function(condition, update, options, callback) {
    this.getBookVersionCollection(function(error, collection) {
      if( error ){
          console.log(error);
    	callback(errcode.DB_ERR);      	  
      }else{
        condition = createConditionHex(condition, collection);
        collection.findAndModify(condition, {}, update, {safe:true}, function(err, ver){
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR, null);  
          } 
          else callback(null, ver);
        });
      }
    });
};	
	
/**
 * commit source後更新db資料(如將builded設為0等)
 */
Mongo.prototype.updateAfterCommit = function(uinfo, ver_id, src, callback) {
    this.getVersionsCollection(function(error, ver_collection) {
      if( error ){
      	console.log(error);
    	callback(errcode.DB_ERR);      	  
      }else{
        var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)};
        if(uinfo.group && uinfo.group.manager){
            condition['General_Info.Group.id'] = uinfo.group.id;
        }else if(!uinfo.super)
            condition['General_Info.User']=uinfo.user;        
        ver_collection.update(condition, {'$set':{'General_Info.Uploaded':1, 'General_Info.Src':src, 'General_Info.Builded':0,'General_Info.OfficialBuilded':0, 'General_Info.Date':new Date().toString(),'General_Info.Timestamp':Date.now() }}, {safe:true}, function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null);
        });
      }
    });
};


/**
 * build完後更新version資訊
 */
Mongo.prototype.setVersionBuilded = function(uinfo, ver_id, download_path, plist, callback) {
	var _callback=function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null, result)
    };
    
    var cmd2 = 'du -sh '+download_path;
    var downloadSize =0;
	exec(cmd2, function (err, stdout, stderr) {
		if(!err && !stderr){
// 						console.log("stdout="+stdout);
			var arr_ = stdout.split("\t");
			var arr_2 =arr_[0].substring(0,(arr_[0].length-1));
			if(arr_[0].substring((arr_[0].length-1),arr_[0].length)=="K"){arr_2=arr_2/1000;}
			else if(arr_[0].substring((arr_[0].length-1),arr_[0].length)=="G"){arr_2=arr_2*1000}
			else if(arr_[0].substring((arr_[0].length-1),arr_[0].length)=="T"){arr_2=arr_2*1000000}
			arr_2= formatFloat(arr_2, 2); // 四捨五入
			//downloadSize= formatFloat((arr_2), 2); // 四捨五入
			downloadSize=arr_[0];
		}
	});
    
    
    
    
	var condition={'_id':ver_id};
    if(uinfo.group && uinfo.group.manager){
        condition['General_Info.Group.id'] = uinfo.group.id;
    }else if(!uinfo.super)
        condition['General_Info.User']=uinfo.user;   
	if(plist){
		var update={'$set':{'General_Info.Builded':1, 'General_Info.download':download_path,'General_Info.Waiting':0, 'General_Info.download_plist':plist ,'General_Info.BuildType':'none', 'General_Info.downloadSize':downloadSize}};
	}else{
		var update= {'$set':{'General_Info.Builded':1, 'General_Info.download':download_path,'General_Info.BuildType':'none','General_Info.Waiting':0, 'General_Info.downloadSize':downloadSize }};
	}
	this.updateVersion(condition,update,{safe:true}, _callback);
	function formatFloat(num, pos){
	  var size = Math.pow(10, pos);
	  return Math.round(num * size) / size;
	}
};
Mongo.prototype.setVersionBuilding = function(uinfo, ver_id, callback) {
	var _callback=function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null, result)
    };
	var condition={'_id':ver_id};
    if(uinfo.group && uinfo.group.manager){
        condition['General_Info.Group.id'] = uinfo.group.id;
    }else if(!uinfo.super)
        condition['General_Info.User']=uinfo.user;   
	var update= {'$set':{'General_Info.BuildType':'building' }};
	this.updateVersion(condition,update,{safe:true}, _callback);
};
Mongo.prototype.setVersionEnterprise = function(uinfo, ver_id, callback) {
	var _callback=function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null, result)
    };
	var condition={'_id':ver_id};
    if(uinfo.group && uinfo.group.manager){
        condition['General_Info.Group.id'] = uinfo.group.id;
    }else if(!uinfo.super)
        condition['General_Info.User']=uinfo.user;   
	var update= {'$set':{'General_Info.BuildType':'enterprise','General_Info.Builded':0, 'General_Info.Paged': 1}};
	this.updateVersion(condition,update,{safe:true}, _callback);
};
Mongo.prototype.setVersionNone = function(uinfo, ver_id, callback) {
	var _callback=function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null, result)
    };
	var condition={'_id':ver_id};
    if(uinfo.group && uinfo.group.manager){
        condition['General_Info.Group.id'] = uinfo.group.id;
    }else if(!uinfo.super)
        condition['General_Info.User']=uinfo.user;   
	//var update= {'$set':{'General_Info.BuildType':'none', 'General_Info.Date':new Date().toString()}};
	var update= {'$set':{'General_Info.BuildType':'none'}};
	this.updateVersion(condition,update,{safe:true}, _callback);
};
Mongo.prototype.setVersionOfficial = function(uinfo, ver_id, callback) {
	var _callback=function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null, result)
    };
	var condition={'_id':ver_id};
    if(uinfo.group && uinfo.group.manager){
        condition['General_Info.Group.id'] = uinfo.group.id;
    }else if(!uinfo.super)
        condition['General_Info.User']=uinfo.user;   
	var update= {'$set':{'General_Info.BuildType':'official','General_Info.OfficialBuilded':0,'General_Info.official':1 }};
	
	var mongoo =this;
	
	mongoo.getVersionsCollection(function(error, ver_collection) {
		if( error ){
			console.log(error);
			callback(errcode.DB_ERR);      	  
		}else{
			ver_collection.find({'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)},{}).toArray(function(error, ver) {
      			ver_collection.update({"General_Info.APP_id":ver[0].General_Info.APP_id}, {$set:{'General_Info.official':0}}, {safe:true, upsert:false, multi:true}, function(err){
					condition = createConditionHex(condition, ver_collection);
					mongoo.getVersionsCollection(function(error, ver_collection2) {
						ver_collection2.update({'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)}, update, {safe:true, upsert:false, multi:false}, function(error, result) {
						  if( error ){
							console.log(error);
							callback(errcode.DB_ERR);  
						  } 
						  else callback(null);
						});
					});
				});
			});
		}
    });
	
	
	this.updateVersion(condition,update,{safe:true}, _callback);
};

/**
 * build正式版完後更新version資訊
 */
Mongo.prototype.setOfficialVersionBuilded = function(uinfo, ver_id, download_path, plist, callback) {
	var _callback=function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null, result)
    };
	var condition={'_id':ver_id};
    if(uinfo.group && uinfo.group.manager){
        condition['General_Info.Group.id'] = uinfo.group.id;
    }else if(!uinfo.super)
        condition['General_Info.User']=uinfo.user;   
	if(plist){
		var update={'$set':{'General_Info.OfficialBuilded':1,'General_Info.Waiting':0, 'General_Info.OfficialDownload':download_path, 'General_Info.OfficialDownload_plist':plist,'General_Info.BuildType':'none' }};
	}else{
		var update= {'$set':{'General_Info.OfficialBuilded':1,'General_Info.Waiting':0, 'General_Info.OfficialDownload':download_path,'General_Info.BuildType':'none' }};
	}
	this.updateVersion(condition,update,{safe:true}, _callback);
};

/**
 * build完後更新version資訊(android專用)
 */
Mongo.prototype.setAndroidVersionBuilded = function(uinfo, ver_id, download_path, keyHash, callback) {
    var _callback=function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null, result)
    };
	var condition={'_id':ver_id};
    if(uinfo.group && uinfo.group.manager){
        condition['General_Info.Group.id'] = uinfo.group.id;
    }else if(!uinfo.super)
        condition['General_Info.User']=uinfo.user;   
	
	var cmd2 = 'du -sh '+download_path;
    var downloadSize =0;
	exec(cmd2, function (err, stdout, stderr) {
		if(!err && !stderr){
// 						console.log("stdout="+stdout);
			var arr_ = stdout.split("\t");
			var arr_2 =arr_[0].substring(0,(arr_[0].length-1));
			if(arr_[0].substring((arr_[0].length-1),arr_[0].length)=="K"){arr_2=arr_2/1000;}
			else if(arr_[0].substring((arr_[0].length-1),arr_[0].length)=="G"){arr_2=arr_2*1000}
			else if(arr_[0].substring((arr_[0].length-1),arr_[0].length)=="T"){arr_2=arr_2*1000000}
			arr_2= formatFloat(arr_2, 2); // 四捨五入
			//downloadSize= formatFloat((arr_2), 2); // 四捨五入
			downloadSize=arr_[0];
		}
	});
	
	var update= {'$set':{'General_Info.Builded':1, 'General_Info.download':download_path, 'Android.KeyHash': keyHash,'General_Info.BuildType':'none', 'General_Info.downloadSize':downloadSize}};
	this.updateVersion(condition,update,{safe:true}, _callback);
};
/**
 * build完後更新version資訊(android專用)
 */
Mongo.prototype.setAndroidOfficialVersionBuilded = function(uinfo, ver_id, download_path, keyHash, callback) {
    var _callback=function(error, result) {
          if( error ){
        	console.log(error);
        	callback(errcode.DB_ERR);  
          } 
          else callback(null, result)
    };
	var condition={'_id':ver_id};
    if(uinfo.group && uinfo.group.manager){
        condition['General_Info.Group.id'] = uinfo.group.id;
    }else if(!uinfo.super)
        condition['General_Info.User']=uinfo.user;  
	var update= {'$set':{'General_Info.OfficialBuilded':1, 'General_Info.OfficialDownload':download_path, 'Android.KeyHash': keyHash,'General_Info.BuildType':'none'}};
	this.updateVersion(condition,update,{safe:true}, _callback);
};
/**
 * 清除該version資料
 */
Mongo.prototype.rmVersionData = function(uinfo, ver_id, callback){
	console.log("rmVersionData mongo");
	this.getVersionsCollection(function(error, ver_collection) {
	      if( error ) callback(errcode.DB_ERR)
	      else {
           var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)};
           if(uinfo.group && uinfo.group.manager){
               condition['General_Info.Group.id'] = uinfo.group.id;
           }else if(!uinfo.super) //移除folder資料時已經檢查過一次權限，在這裡只做基本的檢查
               condition['General_Info.User']=uinfo.user;   
	        ver_collection.remove(condition,function(error){
	        	if(error){
	        		callback(errcode.DB_ERR);
	        	}else{
	        		callback(null);
	        	}
	        });
	      }
	});
};

/**
 * 清除多個version資料
 */
Mongo.prototype.rmVersionsSetData = function(uinfo, ver_ids, callback){
	var mongo=this;
	console.log("rmVersionData mongo multiple");
	var ver_id_arr=[];
	for (var i = 0; i < ver_ids.length; i++) {
		ver_id_arr.push({"_id":ObjectID.createFromHexString(ver_ids[i])});
	}
	mongo.getGroupCollection(function(error, groups_collection) {
		mongo.getAppsCollection(function(error, app_collection) {
			mongo.getVersionsCollection(function(error, ver_collection) {
				console.log("getVersionsCollection")
				  if( error ) callback(errcode.DB_ERR)
				  else {
					//var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)};
					var condition={$or:ver_id_arr}
					if(uinfo.group && uinfo.group.manager){
						condition['General_Info.Group.id'] = uinfo.group.id;
						updateSize();
					}else if(!uinfo.super) {//移除folder資料時已經檢查過一次權限，在這裡只做基本的檢查
						condition['General_Info.User']=uinfo.user;   
						callback(errcode.DB_ERR);
					}
					function updateSize(){
						
						ver_collection.findOne(condition, function(error, result) {
							app_collection.findOne({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(result.General_Info.APP_id)}, function(error, appResult) {
								groups_collection.findOne({_id:groups_collection.db.bson_serializer.ObjectID.createFromHexString(appResult.Group.id)}, function(error, groupResult) {	
									ver_collection.find(condition,{}).toArray(function(err, resultMulti){
										var size= appResult.size;
										var groupSize = groupResult.size;
										countSize(0);
										function countSize(i){
											size=size-resultMulti[i].General_Info.size;
											groupSize = groupSize-resultMulti[i].General_Info.size;
											if(i<(resultMulti.length-1)){countSize(i+1);}
											else{goOn();}
										}
										function goOn(){
											groups_collection.update({_id:groups_collection.db.bson_serializer.ObjectID.createFromHexString(appResult.Group.id)}, {$set:{"size":groupSize}}, {safe:true, upsert:false, multi:false}, function(err){
												app_collection.update({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(result.General_Info.APP_id)}, {$set:{"size":size}}, {safe:true, upsert:false, multi:false}, function(err){
													ver_collection.remove(condition,function(error){
														if(error){
															console.log("### mongo helper err");
															callback(errcode.DB_ERR);
														}else{
															console.log("### mongo helper succ");
															callback(null);
														}
													});
												});
											});
										}
									});
								});
							});
						});
					}
				  }
			});
		});
	});
};

/**
 * 設定正式版version
 */
Mongo.prototype.setVerOfficial = function(uinfo, app_id, official_ver_id, curOffVerId, callback){
	var _this = this;
	console.log("### mongo helper setVerOfficial 1");
	this.getAppsCollection(function(error, app_collection) {
	      if( error ) callback(errcode.DB_ERR);
	      else {
            if(uinfo.group && uinfo.group.manager){
               //app_collection.update({"_id":ObjectID.createFromHexString(app_id)}, {'$set':{'Timestamp': new Date().getTime()}}, {safe:true}, function(error, result) { 
               app_collection.update({"_id":ObjectID.createFromHexString(app_id)}, {'$set':{}}, {safe:true}, function(error, result) { 
					if(error){
						console.log("### mongo helper err");
						callback(errcode.DB_ERR);
					}else{
						_this.getVersionsCollection(function(error, ver_collection) {
							  if( error ) callback(errcode.DB_ERR)
							  else {
								//var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)};
								var condition=[{"General_Info.APP_id":app_id}];
								if(uinfo.group && uinfo.group.manager){
								   ver_collection.update({"_id":ObjectID.createFromHexString(curOffVerId)}, {'$set':{'General_Info.official':0, 'General_Info.Timestamp': new Date().getTime()}}, {safe:true}, function(error, result) { 
										if(error){
											console.log("### mongo helper err");
											callback(errcode.DB_ERR);
										}else{
											//setOneOfficial(ver_collection);
											callback(null);
										}
									});
								}else if(!uinfo.super){ //移除folder資料時已經檢查過一次權限，在這裡只做基本的檢查
									callback(errcode.ADMIN_REQUIRED);
								}else{
									callback(errcode.ADMIN_REQUIRED);
								}
							  }
						});
					}
				});
            }
		}
	});
};
/**
 * 設定正式版version
 */
Mongo.prototype.setVerOfficial2 = function(uinfo, app_id, official_ver_id, curOffVerId, callback){
	var _this = this;
	console.log("### mongo helper setVerOfficial 2");
	this.getAppsCollection(function(error, app_collection) {
	      if( error ) callback(errcode.DB_ERR);
	      else {
            if(uinfo.group && uinfo.group.manager){
               //app_collection.update({"_id":ObjectID.createFromHexString(app_id)}, {'$set':{'Timestamp': new Date().getTime()}}, {safe:true}, function(error, result) { 
               app_collection.update({"_id":ObjectID.createFromHexString(app_id)}, {'$set':{}}, {safe:true}, function(error, result) { 
					if(error){
						console.log("### mongo helper err");
						callback(errcode.DB_ERR);
					}else{
						_this.getVersionsCollection(function(error, ver_collection) {
							  if( error ) callback(errcode.DB_ERR)
							  else {
								//var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)};
								var condition=[{"General_Info.APP_id":app_id}];
								if(uinfo.group && uinfo.group.manager){
									ver_collection.update({"_id":ObjectID.createFromHexString(official_ver_id)}, {'$set':{'General_Info.official':1, 'General_Info.Timestamp': new Date().getTime()}}, {safe:true}, function(error, result) { 
										if(error){
											console.log("### mongo helper err");
											callback(errcode.DB_ERR);
										}else{
											//setOneOfficial(ver_collection);
											callback(null);
										}
									});
								}else if(!uinfo.super){ //移除folder資料時已經檢查過一次權限，在這裡只做基本的檢查
									callback(errcode.ADMIN_REQUIRED);
								}else{
									callback(errcode.ADMIN_REQUIRED);
								}
							  }
						});
					}
				});
            }
		}
	});
};

/**
 * 設定企業版version
 */
Mongo.prototype.setVerEntprise = function(uinfo, app_id, official_ver_id, callback){
	var _this = this;
	this.getAppsCollection(function(error, app_collection) {
	      if( error ) callback(errcode.DB_ERR);
	      else {
            if(uinfo.group && uinfo.group.manager){
               app_collection.update({"_id":ObjectID.createFromHexString(app_id)}, {'$set':{'Timestamp': new Date().getTime()}}, {safe:true}, function(error, result) { 
					if(error){
						console.log("### mongo helper err");
						callback(errcode.DB_ERR);
					}else{

						console.log("### mongo setVerEntprise, official_ver_id="+official_ver_id)
						_this.getVersionsCollection(function(error, ver_collection) {
							  if( error ) callback(errcode.DB_ERR)
							  else {
								//var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(ver_id)};
								var condition=[{"_id":ObjectID.createFromHexString(official_ver_id)}];
								if(uinfo.group && uinfo.group.manager){
									ver_collection.update({"_id":ObjectID.createFromHexString(official_ver_id)}, {'$set':{'General_Info.official':0, 'General_Info.Timestamp': new Date().getTime()}}, {safe:true}, function(error, result) { 
										if(error){
											console.log("### mongo helper ent err");
											callback(errcode.DB_ERR);
										}else{
											console.log("### mongo helper ent succ");
											callback(null);
										}
									});
								}else{
									callback(errcode.ADMIN_REQUIRED);
								}
						
					
							  }
						});
					}
				});
            }
		}
	});
};



/**
 * 清除app資料
 */
Mongo.prototype.rmAppData = function(uinfo, app_id, callback){
	var mongo = this;
	mongo.getGroupCollection(function(error, groups_collection) {
		mongo.getAppsCollection(function(error, apps_collection) {
		  if( error ) callback(errcode.DB_ERR)
		  else {
			var condition={'_id':apps_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if(uinfo.group && uinfo.group.manager){
				condition['Group.id'] = uinfo.group.id;
			}else if(!uinfo.super)
				condition['user']=uinfo.user;   
			apps_collection.findOne(condition, function(error, appResult) {	
				groups_collection.findOne({_id:groups_collection.db.bson_serializer.ObjectID.createFromHexString(appResult.Group.id)}, function(error, groupResult) {
					var appSize=0;
					var groupSize=0;
					if(appResult.size)
						appSize=appResult.size;
					if(groupResult.size)
						groupSize=groupResult.size;
					var size= groupSize - appSize;
					groups_collection.update({_id:groups_collection.db.bson_serializer.ObjectID.createFromHexString(appResult.Group.id)}, {$set:{"size":size}}, {safe:true, upsert:false, multi:false}, function(err){
						apps_collection.remove(condition,function(error){
							if(error){
								callback(errcode.DB_ERR);
							}else{
								removeVersions();
							}
						});
					});
				});
			});
		  }
		});
    });
    function removeVersions(){
    	mongo.getVersionsCollection(function(error, ver_collection) {
    	      if( error ) callback(errcode.DB_ERR)
    	      else {
                var condition={'General_Info.APP_id':app_id}
                if(uinfo.group && uinfo.group.manager){
                    condition['General_Info.Group.id'] = uinfo.group.id;
                }else if(!uinfo.super)
                    condition['General_Info.User']=uinfo.user;
    	        ver_collection.remove(condition, function(error){
    	        	if(error){
    	        		callback(errcode.DB_ERR);
    	        	}else{
    	        		callback(null);
    	        	}
    	        });
    	      }
    	});
    }
};

/**
 * for test only
 * for production (or anything remotely serious), use removeUser
 */
Mongo.prototype.clearUserData = function(uinfo, callback){
	var mongo = this;
    this.getAppsCollection(function(error, apps_collection) {
      if( error ) callback(errcode.DB_ERR)
      else {
        apps_collection.remove({'Creator':uinfo.user},function(){
          removeVer();
        });
      }
    });
    
    function removeVer(){
    	mongo.getVersionsCollection(function(error, ver_collection) {
    	      if( error ) callback(errcode.DB_ERR)
    	      else {
    	        ver_collection.remove({'General_Info.Creator':uinfo.user},function(){
    	          callback(null);
    	        });
    	      }
    	});
    }
};

Mongo.prototype.removeUser = function(uinfo, uid, callback){
    var mongo=this;
    if(uinfo.user==uid){
        callback(errcode.SELF_REMOVAL);
        return;
    }else if(!uinfo || !uinfo.super){
        mongo.getUser(uid, function(err, userArray){
            var user=userArray[0];
            console.log(user);
            console.log(user.group);
            console.log(uinfo);
            if(user && uinfo.group.manager && user.group.id==uinfo.group.id){
                removeApp();
            }else{
                callback(errcode.SUPER_REQUIRED);
                return;  
            }    
        });
    }else{
        removeApp();
    }
    
    function removeApp(){
        mongo.getAppsCollection(function(error, apps_collection) {
            if( error ) callback(errcode.DB_ERR);
            else {
                apps_collection.update({'Creator':uid}, {$set:{'Creator':''}, $pull:{'user':uid}}, {safe:true},function(err){
                    if(err){
                        callback(errcode.DB_ERR);
                        return;
                    }
                    apps_collection.update({'user':uid}, {$pull:{'user':uid}}, {safe:true},function(err){
                        if(err){
                            callback(errcode.DB_ERR);
                            return;
                        }
                        removeVer(); 
                    });  
                });
            }
        });
    }
    
    
    function removeVer(){
    	mongo.getVersionsCollection(function(error, ver_collection) {
    	      if( error ) callback(errcode.DB_ERR);
    	      else {
    	        ver_collection.update({'General_Info.User':uid},{$pull:{'General_Info.User':uid}}, {safe:true}, function(err){
                    if(err){
                        callback(errcode.DB_ERR);
                        return;
                    }
    	            removeUser();
    	        });
    	      }
    	});
    }
    
    function removeUser(){
        mongo.getUsersCollection(function(err, collection){
            if( err ) callback(errcode.DB_ERR);
            else{
                collection.remove({user:uid},{safe:true}, function(err){
                    if(err) callback(errcode.DB_ERR);
                    else
                        removeGroupManager();
                });
            }
        });
    }
    
    function removeGroupManager(){
        mongo.getGroupCollection(function(err, collection){
            if( err ) callback(errcode.DB_ERR);
            else{
                collection.update({manager:uid},{$unset:{manager:1}},{safe:true}, function(err){
                    if(err) callback(errcode.DB_ERR);
                    else
                        callback(null);
                });
            }        
        });
    }
};

/**
 * 新增version
 */
Mongo.prototype.addVersion = function(version, callback){
   this.getVersionsCollection(function(error, ver_collection) {
      if( error ) callback(error)
      else {
        version.General_Info.User=[version.General_Info.User];
        ver_collection.insert(version, {safe:true}, function(error, doc) {
          callback(null, doc);
        });
      }
    });
};
	
/**
 * 新增使用者。
 * 檢查使用者是否存在(呼叫checkUID())，若不存在將user data插入到db，否則回傳錯誤。可能callback值null(成功), errcode.DB_ERR(DB錯誤), errcode.USER_EXIST(使用者已存在)
 */
Mongo.prototype.addUser = function(user, callback){
	   var checkUID=this.checkUID;
	   this.getUsersCollection(function(error, users_collection) {
	      if( error ) {console.log(error);callback(errcode.DB_ERR);}
	      else {
	          checkUID(user.super, users_collection, user.email, function(error, count){
	          if(error) {console.log(error);callback(errcode.DB_ERR);}
	          else if(count==0)
	            users_collection.insert(user, {safe:true}, function() {
	              callback(null, user);
	            });
	          else{
	        	if(user.super){
	        		callback(errcode.SUPER_EXIST);
	        	}else{
	        		callback(errcode.USER_EXIST);	
	        	}
	          }
	        });
	      }
	    });	
};

/**
* 檢查uid是否存在。僅在此module內部使用
*/
Mongo.prototype.checkUID = function(checkSuper, collection, email, callback){
  var condition;
  if(checkSuper)
	  condition = {'super':true};
  else
	  condition = {'email':email};
  collection.find(condition).count(function(error, count) {
    if( error ) callback(error)
    else callback(null, count)
  });
};

///**
// * 修改使用者多位使用者建立app之權限
// * 可一次修改一位或多位。
// * 若修改一位，uid為該user資料，list為null
// * 若修改多位，uid為null，list為json格式，裏面包含要新增/移除為editors的使用者陣列(放在users欄位)，ex:{"users":["user1","user2"]}。
// * uinfo:更改者資料
// * enable:true:給予權限、false:移除權限
// * callback:function(err, affectedCnt(更動筆數), affectedList(更動到的清單))
// */
//Mongo.prototype.changeUsersAppCreationPerm = function(uinfo, uid, list, enable, callback){
//    if(!uinfo.super && !uinfo.group.manager){
//        callback(errcode.SUPER_REQUIRED);
//		return;
//	}
//    var uids=new Array();
//    if(uid)
//        uids.push(uid);
//    if(list){
//        try{
//            var data = JSON.parse(list);
//            if(data && data.users && Object.prototype.toString.call( data.users ) === '[object Array]'){
//                uids.push.apply(uids, data.users);
//            }
//        }catch(err){
//            console.log(err);
//        }
//    }
//    if(uids.length==0){
//        callback(errcode.INVALID_UID);
//        return;
//    }
//    var selfIdx=uids.indexOf(uinfo.user);//禁止移除自己
//    if(selfIdx>0){
//        delete uids[selfIdx];
//    }
//    var finishCnt=0;
//    var affectedCnt=0;
//    var affectedList=new Array();
//    for(var i=0;i<uids.length;i++){
//        this._changeAppCreationPerm(uinfo, uids[i], enable, function(err, uid){
//            finishCnt++;
//            if(err){
//                console.log('err in enabling app creation:');
//                console.log(err);
//            }else{
//                affectedCnt++;
//                affectedList.push(uid);
//            }
//            if(finishCnt>=uids.length){
//		        callback(null, affectedCnt, affectedList);
//            }
//	    });
//    }        
//}

/**
 * change app creation permission for user
 */
Mongo.prototype.changeAppCreationPerm = function(uinfo, uid, enable, callback){
    console.log("enable?"+enable);
    var condition;
    if(uinfo.super){
        condition={'user':uid};
    }else if(uinfo.group.manager){
        condition={'user':uid, 'group.name':uinfo.group.name};
    }else{
        callback(errcode.GROUP_MANAGER_REQUIRED);
        return;
    }
   this.getUsersCollection(function(error, collection) {
      if( error ) callback(errcode.DB_ERR, uid);
      else {
        collection.update(condition, {'$set':{createAppPerm:enable}}, {safe:true}, function(error, num) {
          if( error ) callback(errcode.DB_ERR, uid);
          else if(num==0) callback(errcode.INVALID_UID, uid);
          else callback(null, uid);
        });
      }
    });
};

/**
 * 更新使用者資料
 */
Mongo.prototype.updateUser = function(condition, operation, callback){
   this.getUsersCollection(function(error, collection) {
      if( error ) callback(errcode.DB_ERR);
      else {
        collection.update(condition, operation, {safe:true}, function(error) {
          if( error ) callback(errcode.DB_ERR);
          else callback(null);
        });
      }
    });
};
/**
 * 更新使用者資料
 */
Mongo.prototype._updateUser = function(condition, operation, callback){
   this.getUsersCollection(function(error, collection) {
      if( error ) callback(errcode.DB_ERR);
      else {
        collection.update(condition, operation, {safe:true}, function(error) {
          if( error ) callback(errcode.DB_ERR);
          else callback(null);
        });
      }
    });
};

/**
 * 取得使用者資料
 */
Mongo.prototype.getUser = function(uid, callback){
   this.getUsersCollection(function(error, collection) {
      if( error ) callback(errcode.DB_ERR);
      else {
      	console.log("uid="+uid);
        collection.find({'user':uid}).toArray(function(error, results) {
          if( error ) callback(errcode.DB_ERR)
          else callback(null, results)
        });
      }
    });
};
/**
 * 取得使用者資料
 */
Mongo.prototype.getUserByEmail = function(email, callback){
   this.getUsersCollection(function(error, collection) {
      if( error ) callback(errcode.DB_ERR);
      else {
      	console.log("email="+email);
        collection.find({'email':email}).toArray(function(error, results) {
          if( error ) callback(errcode.DB_ERR)
          else callback(null, results)
        });
      }
    });
};

/**
 * 取得所有admin (但不回傳super user本身)
 */
Mongo.prototype.getAllAdmin = function(uinfo, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
    }
    
    this.queryUsers({user:{$ne:uinfo.user}, createAppPerm:true},{user:true, email:true, _id:false},callback);
}

/**
 * 取得所有使用者清單
 */
Mongo.prototype.getUsers = function(callback){
    this.queryUsers({super:false}, {user:true, email:true, createAppPerm:true, group:true, _id:false}, callback);
//   this.getUsersCollection(function(error, collection) {
//      if( error ) callback(errcode.DB_ERR);
//      else {
//        collection.find({},{user:true, email:true, _id:false}).toArray(function(error, results) {
//          if( error ) callback(errcode.DB_ERR)
//          else callback(null, results)
//        });
//      }
//    });
};

/**
 * 傳入特定條件和包含欄位取得使用者清單
 */
Mongo.prototype.queryUsers = function(condition, include, callback){
   this.getUsersCollection(function(error, collection) {
      if( error ) callback(errcode.DB_ERR);
      else {
        collection.find(condition, include).toArray(function(error, results) {
          if( error ) callback(errcode.DB_ERR)
          else callback(null, results)
        });
      }
    });
};

/**
 * 尋找+修改使用者
 */
Mongo.prototype.findAndModifyUser = function(condition, include, operation, callback){
   this.getUsersCollection(function(error, collection) {
      if( error ) callback(errcode.DB_ERR);
      else {
        collection.findAndModify(condition, include, operation, {safe:true}, function(error, user) {
          if( error ) callback(errcode.DB_ERR)
          else callback(null, user)
        });
      }
    });
};

/**
 * 比對db資料。可能callback值null(成功), errcode.DB_ERR(DB錯誤), errcode.INVALID_UID(帳號錯誤), errcode.INVALID_PWD(密碼錯誤)
 */
Mongo.prototype.login = function(uid, pwd, callback){
  this.getUser(uid, function(error, results){
    if(error) {console.log(error);callback(errcode.DB_ERR);}
    else{
      if(!results || results.length==0){
        callback(errcode.INVALID_UID);
      }else{
        if(results[0].pwd==pwd)
          callback(null, results[0]);
        else
          callback(errcode.INVALID_PWD); 
      }
    }
  });
};

/**
 * 檢查super user存不存在
 * callback(err, set)
 * err: error code
 * set: true if super user is set, false o.w.
 */
Mongo.prototype.isSuperUserSet = function(callback){
	this.getUsersCollection(function(error, collection) {
		if( error ) callback(errcode.DB_ERR);
		else {
			collection.find({'super':true}).count(function(error, count) {
				if( error ) callback(errcode.DB_ERR)
		        else callback(null, count>0? true:false)
		    });
		}
	});
};


//Mongo.prototype.login_bak = function(uid, pwd, callback){
//  this.getUser(uid, function(error, results){
//    if(error) {console.log(error);callback(errcode.DB_ERR);}
//    else{
//      if(!results || results.length==0){
//        callback(errcode.INVALID_UID);
//      }else{
//        if(results[0].pwd==pwd)
//          callback(null);
//        else
//          callback(errcode.INVALID_PWD); 
//      }
//    }
//  });
//}

/**
 * 新增app
 */
Mongo.prototype.addApp = function(app, callback){
   this.getAppsCollection(function(error, app_collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        //檢查這個user看到的app裏面是否有名稱重複的
    	//改成檢查這個群組是否有名稱重複的
    	//app_collection.find({'user':app.Creator, 'APP_name':app.APP_name}).toArray(function(error, results) { 
    	app_collection.find({'Group.id':app.Group.id, 'APP_name':app.APP_name}).toArray(function(error, results) { 
    	  if(error){
    		console.log(error);callback(errcode.DB_ERR);
    	  }else if(results && results.length>1){
    		console.log('app:'+app.APP_name+' already exists');callback(errcode.APP_EXIST);  
    	  }else if(results && results.length==1){
    	  	if(results[0].OS==app.OS){
				console.log('app:'+app.APP_name+' already exists');callback(errcode.APP_EXIST);  
			}else{
				app_collection.insert(app, {safe:true}, function(err, docs) {
				  console.log('insert, callback');
				  callback(err?errcode.DB_ERR:null, docs);
				}); 
			}
    	  }else{
    	    app_collection.insert(app, {safe:true}, function(err, docs) {
              console.log('insert, callback');
    	      callback(err?errcode.DB_ERR:null, docs);
    	    }); 
    	  }	
    	});  
      }
    });
};



/**
 * 取得所有app/version
 * user:uid
 * excludeEmptyApp: t/f，如果true, 若該app底下無任何version則不會回傳
 * versionCondition: query version時篩選的條件。(sort of the "where" clause in sql)。若為null不做篩選。
 * versionInclude: 哪些欄位要select。若為null則取得所有欄位
 * callback: callback function
 */
Mongo.prototype.getAll = function(uinfo, excludeEmptyApp, versionCondition, versionInclude, callback){
	  var mongo=this;
	  var returnData = [];
	  this.getApps(uinfo, function(error, apps){
		  if(!apps || apps.length==0)
			  callback(null, null);
		  var finished=0;
		  var called=false;
		  var i;
		  function getCB(apps,i){
			  return function(error, versions){
				  if(error){
					  if(!called)
						  callback(errcode.DB_ERR);
					  called=true;
					  return;
				  }else{
					  if(versions && versions.length>0){
						  apps[i].version=versions;
						  returnData.push(apps[i]);
					  }else if(!excludeEmptyApp){
						  returnData.push(apps[i]);
					  }
					  finished++;
					  if(finished==apps.length && !called){
						  callback(null, returnData);
						  called=true;
					  }
					  return;
				  }
			  };
		  }
	  
		  for(var i=0;i<apps.length;i++){
			  mongo.getVersions_general(uinfo, apps[i]._id.toString(), versionCondition, versionInclude, getCB(apps,i));				  
		  }
	  });
}

/**
 * 取得所有app/version
 * user:uid
 * excludeEmptyApp: t/f，如果true, 若該app底下無任何version則不會回傳
 * versionCondition: query version時篩選的條件。(sort of the "where" clause in sql)。若為null不做篩選。
 * versionInclude: 哪些欄位要select。若為null則取得所有欄位
 * callback: callback function
 */
Mongo.prototype.getAllWithCategory = function(uinfo, versionCondition, versionInclude, callback){
  var mongo=this;
  this.getCategorizedApps(uinfo, function(error, data){
	  if(!data || data.length==0){
		  callback(null, null);
		  return;
	  }
	  var remain=1;
	  var called=false;
	  var returnData={};//format:={id:{name:xxx, apps:{id:{appinfo, versions:[]}}
	  function finish(){
		  if(!called){
			  called=true;
			  callback(null, returnData);
		  }
	  }
	  
	  function getCB(catIdx, appIdx){
		  return function(error, versions){
			  if(error){
				  if(!called)
					  callback(errcode.DB_ERR);
				  called=true;
				  return;
			  }else{
				  var cat=data[catIdx];
				  var app=data[catIdx].apps[appIdx];
				  app._id=app._id.toString();
				  if(versions && versions.length>0){
					if(!returnData[cat['Category.id']]){//empty category
						returnData[cat['Category.id']]={name:cat['Category.name'], apps:{}};
					}
					if(!returnData[cat['Category.id']].apps[app._id]){
						returnData[cat['Category.id']].apps[app._id]=app;
					}
					returnData[cat['Category.id']].apps[app._id].versions=versions;
				  }
				  remain--;
				  if(remain==0){
					  finish();
				  }
				  return;
			  }
		  };
	  }
// 	  console.log("data[0].apps[0]._id.toString()="+data[0].apps[0]._id.toString());
// 	  console.log("data[0].apps[1]._id.toString()="+data[0].apps[1]._id.toString());
	  for(var i=0;i<data.length;i++){
		  remain+=data[i].apps.length;
		  for(var j=0; j<data[i].apps.length;j++){
		  	console.log("i="+i+", j="+j);
		  	console.log("versionCondition="+versionCondition);
		  	console.log("versionInclude="+versionInclude);
		  	
			mongo.getVersions_general(uinfo, data[i].apps[j]._id.toString(), versionCondition, versionInclude, getCB(i,j));  
			console.log("returnData="+returnData.id);    
		  }
	  }
	  remain--;
	  if(remain==0){
		  finish();
	  }
  });
}




/**
 * 群組管理
 */
/**
 * 列出所有群組
 */
Mongo.prototype.listGroups = function(uinfo, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    queryGroups(this, {}, {name:true, key:true, acronym:true, manager:true, engName:true, iosAccount:true}, callback);
}

/**
 * 列出所有群組
 */
Mongo.prototype.listGroupsNotIn = function(uinfo, exclude, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    var condition={};
    if(exclude && Object.prototype.toString.call( exclude ) === '[object Array]')
        condition.name={$nin:exclude};
    queryGroups(this, condition, {name:true}, callback);
}

/**
 * 列出所有群組(只包含群組名稱欄位)
 */
Mongo.prototype.listGroupNames = function(callback){
    queryGroups(this, {}, {name:true, acronym:true, _id:true, engName:true}, callback);
}



function queryGroups(mongo, condition, include, callback){
    mongo.getGroupCollection(function(err, collection){
        if(err){
            console.log(err);
            callback(errcode.DB_ERR);
            return;
        }else{
            if(condition && condition._id && typeof(condition._id)=='string')
                condition._id=collection.db.bson_serializer.ObjectID.createFromHexString(condition._id);
            collection.find(condition, include).toArray(function(err, array){
                if(err){
                    console.log(err);
                    callback(errcode.DB_ERR);
                    return;
                }else{
                    callback(null, array);
                }        
            });
        }
    });        
}

/**
 * 列出所有群組及其下的App Id(只包含群組名稱, 群組Id, 管理者, App Ids)
 */
Mongo.prototype.listGroupsApps = function(uinfo, callback){
    queryGroupsApps(uinfo, this, {}, {name:true, acronym:true, _id:true, engName:true}, callback);
}



function queryGroupsApps(uinfo, mongo, condition, include, callback){
    mongo.getGroupCollection(function(err, groups){
    	
    	
        if(err){
            console.log(err);
            callback(errcode.DB_ERR);
            return;
        }else{
        	groups.find({}, {}).toArray(function(error, results) {
        		console.log("results.length="+results.length);
        		mongo.getBookCollection(function(error, booksTemp) {
					mongo.getBookcaseCollection(function(error, bookcasesTemp) {
						if(!bookcasesTemp || bookcasesTemp.length==0)
							callback(null, null);
						bookcasesTemp.find({},{}).toArray(function(error, bookcases) {
							if( error ) callback(error)
							else {
								console.log(" bookcases.elgnth= "+bookcases.length);
								for(var j=0;j<results.length; j++){
									results[j].Bookcases=[];
									//console.log("???results["+j+"].Bookcases="+results[j].Bookcases)
								}
								if(bookcases.length==0){
									getApps();
								}
								else{
									for(var i=0;i<bookcases.length; i++){
										//console.log("bookcases["+i+"]._id="+bookcases[i]._id);
										for(var j=0;j<results.length; j++){
											//console.log("group name="+results[j].name);
											var json={"key":"value"};
											var json2=bookcases[i].Category;
											//console.log("json['key'] = "+json['key']);
											//console.log("json2['name'] = "+json2['name']);
											//console.log("apps["+i+"].APP_name="+apps[i].APP_name);
											//console.log("bookcases["+i+"].General_Info.Group="+bookcases[i].General_Info.Group);
											//console.log("bookcases.length="+bookcases.length+", i="+i);
											//console.log("bookcases.id="+bookcases[i]._id);
											if(bookcases[i].General_Info.Group){
												//console.log("if exist");
												//if(bookcases[i]._id=="5202fcabe729a6df0a000001")
												//	console.log("(bookcases[i]._id="+bookcases[i]._id);
												//	console.log("results["+j+"].name="+results[j].name+",   bookcases["+i+"].General_Info.Group.name="+bookcases[i].General_Info.Group.name);
												if(bookcases[i].General_Info.Group.name==results[j].name){
													//console.log("bookcases["+i+"].Group.name="+bookcases[i].General_Info.Group.name+"  results[j].name="+results[j].name+"  bookcases[i]._id="+bookcases[i]._id);
													var appIdList = {};
													appIdList.id=bookcases[i]._id;
													appIdList.name=bookcases[i].Bookcase_name;
													appIdList.creator=bookcases[i].General_Info.Author;
													if(bookcases[i].size){appIdList.size=bookcases[i].size;console.log("bookcases["+i+"].size="+bookcases[i].size+"Mb");}
													else{appIdList.size=0;}
													results[j].Bookcases.push(appIdList);
													//console.log("!! groups["+j+"].Apps="+results[j].Apps.length)
													//console.log(JSON.stringify(results));
													j=results.length
													if(i+1==(bookcases.length)){
														getApps();
													}
												}
												else{
													//console.log("else3");
													if(i+1==(bookcases.length) && j+1==results.length){
														//console.log("els4");
														getApps();
													}
												}
											}
											else{
												//console.log("else1");
												if(i+1==(bookcases.length) && j+1==results.length){
													//console.log("else");
													getApps();
												}
											}
										}
									}
								}
							}
						});
					
					});
        		});
        		
        		
        		
        		function getApps(){
					mongo.getApps(uinfo, function(error, apps){
						if(!apps || apps.length==0)
							callback(null, null);
						for(var j=0;j<results.length; j++){
							results[j].Apps=[];
							//console.log("???results["+j+"].Apps="+results[j].Apps)
						}
						for(var i=0;i<apps.length; i++){
							//console.log("apps[i]._id="+apps[i]._id);
							for(var j=0;j<results.length; j++){
								//console.log("group name="+results[j].name);
								var json={"key":"value"};
								var json2=apps[i].Category;
								//console.log("json['key'] = "+json['key']);
								//console.log("json2['name'] = "+json2['name']);
								//console.log("apps["+i+"].APP_name="+apps[i].APP_name);
								if(apps[i].Group){//確認Group欄位是否存在
								
									if(apps[i].Group.name==results[j].name){//若該app中的群組欄位名稱 與 群組名稱清單 中符合，在群組名單中加入App資訊
										//console.log("apps["+i+"].Group.name="+apps[i].Group.name+"  results[j].name="+results[j].name+"  apps[i]._id="+apps[i]._id);
										var appIdList = {};
										appIdList.id=apps[i]._id;
										appIdList.name=apps[i].APP_name;
										appIdList.creator=apps[i].Creator;
										results[j].Apps.push(appIdList);
										if(apps[i].size){appIdList.size=apps[i].size;console.log("apps["+i+"].size="+apps[i].size+"Mb");}
										else{appIdList.size=0;}
										//console.log("!! groups["+j+"].Apps="+results[j].Apps.length)
										//console.log(JSON.stringify(results));
										j=results.length
										if(i+1==(apps.length)){
											callback(null,results);
										}
									}
									else if(i+1==(apps.length) && j+1==results.length){
										callback(null,results);
									}
								}
								else if(i+1==(apps.length) && j+1==results.length){
									callback(null,results);
								}
							}
						}
					});
				}
			});
            
        }
    });        
}


/**
 * 判斷是否為群組管理人, callback:function(err, group) group:如果是manager，回傳group資料；其他情況回傳null
 */
Mongo.prototype.isGroupManager = function(uinfo, callback){
    var _mongo=this;
    _mongo.getUser(uinfo.user, function(err, users){
        if(!users || !users.length){
            callback(errcode.INVALID_UID);
        }else{
            var user=users[0];
            console.log("### the first user of this group is:"+user.user);
            if(!user.group){
                callback(null, null);
            }else{
                _mongo.getGroupByName(user.group.name, function(err, group){
                    if(err){
                        callback(err);
                    }else{
                        callback(null, group.manager==uinfo.user?group:null);
                    }
                })
            }
        }    
    });
}

/**
 * 根據名稱取得群組資料
 */
Mongo.prototype.getGroupByName = function(name, callback){
    this.getGroup_general({name:name}, {}, callback);
}

/**
 * 取得預設群組資料
 */
Mongo.prototype.getDefaultGroup = function(callback){
    this.getGroup_general({default:true}, {}, callback);
}
/**
 * 群組認證(檢查key)
 */
Mongo.prototype.groupAuth = function(id, key, callback){
    this.getGroup_general({_id:id, key:key}, {}, function(err, doc){
        console.log('!!!!!!'+id);
        if(err)
            callback(err);
        else{
            callback(null, doc);
        }
    });
}
/**
 * 根據id取得群組資料
 */
Mongo.prototype.getGroupById = function(uinfo, groupId, callback){
//     if(!uinfo || (!uinfo.super&&!uinfo.group.manager) ){
	if(!uinfo || (!uinfo.super&&!uinfo.createAppPerm.manager&&!uinfo.createAppPerm) ){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    this.getGroup_general({_id:groupId}, {}, callback);
//    if(!uinfo || !uinfo.super){
//        callback(errcode.SUPER_REQUIRED);
//        return;
//    }
//    this.getGroupCollection(function(err, collection){
//        if(err){
//            console.log(err);
//            callback(errcode.DB_ERR);
//            return;
//        }else{
//            collection.findOne({ _id: collection.db.bson_serializer.ObjectID.createFromHexString(groupId)}, function(err, data){
//                if(err){
//                    console.log(err);
//                    callback(errcode.DB_ERR);
//                    return;
//                }else{
//                    callback(null, data);
//                }        
//            });
//        }
//    });
}
Mongo.prototype.getGroup_general = function(condition, include, callback){
    this.getGroupCollection(function(err, collection){
        if(err){
            console.log(err);
            callback(errcode.DB_ERR);
            return;
        }else{
            if(condition._id && typeof(condition._id)=='string')
                condition._id=collection.db.bson_serializer.ObjectID.createFromHexString(condition._id);
            collection.findOne(condition, include, function(err, data){
                if(err){
                    console.log(err);
                    callback(errcode.DB_ERR);
                    return;
                }else{
                    callback(null, data);
                }        
            });
        }
    });
}

/**
 * 設定群組管理者
 */
Mongo.prototype.setGroupManager = function(uinfo, managerUid, groupId, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    setGroupManager(this, managerUid, groupId, callback);
}

/**
 * 設定群組管理者
 */
Mongo.prototype.beManagerByDefault = function(uinfo, group, callback){
    var mongo=this;
    if(group && !group.manager){
        setGroupManager(this, uinfo.user, group._id.toString(), callback);
    }else{
        callback();
    }    
}

function setGroupManager(mongo, managerUid, groupId, callback){
    verifyUser();
    function verifyUser(){
        console.log(managerUid);
        mongo.findAndModifyUser({user: managerUid, "group.id":groupId}, {}, {$set:{createAppPerm:true}}, function(err, user){
//        mongo.queryUsers({user: managerUid, "group.id":groupId},{}, function(err, results){
            if(err){
                callback(errcode.DB_ERR);
            }else if(!user){
                callback(errcode.INVALID_UID);
            }else{
                updateGroupData();
            }
        });
    }
    
    function updateGroupData(){
        mongo.getGroupCollection(function(err, collection){
            collection.update({_id: collection.db.bson_serializer.ObjectID.createFromHexString(groupId)}, {$set: {manager: managerUid}}, {safe:true, upsert:false}, function(err){
            if(err)
                callback(errcode.DB_ERR);
            else
                callback(0);
            });
        });        
    }    
}

/**
 * 新增群組
 */
Mongo.prototype.createGroup = function(uinfo, group, callback){
    var mongo=this;
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    checkExistence();
    function checkExistence(){
        mongo.getGroupCollection(function(err, collection){
            if(err){
                callback(errcode.DB_ERR);
                return;
            }
            collection.findOne({name:group.name}, function(err, doc){
                if(err)
                    callback(errcode.DB_ERR);
                else if(doc)
                    callback(errcode.GROUP_EXISTS);
                else
                    insert();
            });
        });
    }
    
    function insert(){
        mongo.getGroupCollection(function(err, collection){
            if(err){
                callback(errcode.DB_ERR);
                return;
            }
            collection.insert(group, {safe:true, upsert:true}, function(err){
                if(err)
                    callback(errcode.DB_ERR);
                else
                    callback(null);
            });
        });    
    }
    
}

/**
 * 更新群組金鑰
 */
Mongo.prototype.saveGroupKey = function(uinfo, groupId, key, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    this._updateGroup({_id:groupId}, {$set:{key:key}}, function(err){
        if(err){
            callback(err);
        }else{
            callback(null);
        }
    });
} 
 
 
/**
 * 刪除群組(包含群組apps,versions,users)
 */
Mongo.prototype.deleteGroup = function(uinfo, groupId, callback){
    var mongo=this;
    //var fork = child.fork(__dirname+'/adder.js', null, {env:process.env});
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    mongo.getGroupById(uinfo, groupId, function(err, group){
        if(err){
            callback(err);
            return;
        }
        if(!group){
            callback(errcode.INVALID_GROUP);
            return;
        }
        deleteApps(group);
    });
    function deleteGroup(group){
        mongo.getGroupCollection(function(err, collection){
            var condition = {'_id':group._id};
            collection.remove(condition, {safe:true}, function(err){
                if(err)
                    callback(errcode.DB_ERR);
                else
                    callback(null);
            });
        });
    }
    
    function deleteUsers(group){
        mongo.getUsersCollection(function(error, collection){
            collection.remove({'group.name':group.name, 'super':{$ne:true}}, {safe:true}, function(err){
                if(err)
                    callback(errcode.DB_ERR);
                else
                    deleteGroup(group);
            });
        });
    }
    
    function deleteApps(group){
        mongo.getAppsCollection(function(error, collection){
        	
//             collection.find({"Group.name":group.name},{}).toArray( function(err, collection2){
//             	console.log("collection2.length="+collection2.length);
//             	console.log("conllection2[0]._id="+collection2[0]._id.toString());
//             	if(collection2.length==0){
//             		//deleteBookcases(group);
//             		deleteUsers(group);
//             	}
//             	else{
// 					for(var i=0;i<collection2.length;i++){
// 						fork.send({type:"rm_app", app_id:collection2[i]._id.toString(), uinfo:uinfo});
// 						fork.on('message',function(err){});
// 						if(i==(collection2.length-1)){
// 							deleteVersions(group);
// 						}
// 					}
// 					
//             	}
//             });
			collection.remove({"Group.name":group.name}, {safe:true}, function(err){
					if(err)
					callback(errcode.DB_ERR);
				else{
					deleteVersions(group);
				}
			});
        });
    }
    
    function deleteVersions(group){
        mongo.getVersionsCollection(function(error, collection){
            collection.remove({'General_Info.Group.name':group.name}, {safe:true}, function(err){
				if(err)
					callback(errcode.DB_ERR);
				else{
					//deleteBookcases(group);
					deleteUsers(group);
				}
			});
        });
        
    }
    function deleteBookcases(group){
    	this.getBookcaseCollection(function(error, collection) {
    		collection.find({'General_Info.Group.name':group.name},{}).toArray( function(err, collection2){
            	console.log("collection2.length="+collection2.length);
            	console.log("conllection2[0]._id="+collection2[0]._id.toString());
            });
            function _removeFromDb(){
			  collection.remove({'General_Info.Group.name':group.name}, {safe:true}, function(err){
					if(err)
						callback(errcode.DB_ERR);
					else
						deleteBooks(group);
				});
            }
		});
	}
	function deleteBooks(group){
    	this.getBookCollection(function(error, collection) {
		  function _removeFromDb(){
			  collection.remove({'General_Info.Group.name':group.name}, {safe:true}, function(err){
					if(err)
						callback(errcode.DB_ERR);
					else
						deleteBookVersions(group);
				});
            }
		});
	}
	function deleteBookVersions(group){
    	this.getBookVersionCollection(function(error, collection) {
		  collection.remove({'General_Info.Group':group.name}, {safe:true}, function(err){
                if(err)
                    callback(errcode.DB_ERR);
                else
                    deleteUsers(group);
            });
		});
	}
}
/**
 * 列出群組使用者
 */
Mongo.prototype.listGroupUsers = function(uinfo, groupId, callback){
    if(!uinfo || (!uinfo.super && !uinfo.group.manager && !uinfo.createAppPerm)){
        callback(errcode.GROUP_MANAGER_REQUIRED);
        return;
    }
    this.queryUsers({"group.id":groupId}, {user:true, email:true, _id:false, createAppPerm:true}, callback);
}

/**
 * 列出群組使用者(扣除exclude清單)
 */
Mongo.prototype.listGroupUsersNotIn = function(uinfo, groupId, exclude, callback){
    if(!uinfo || (!uinfo.super && !uinfo.group.manager && !uinfo.createAppPerm)){
        callback(errcode.GROUP_MANAGER_REQUIRED);
        return;
    }
    var condition={"group.id":groupId};
    if(exclude && Object.prototype.toString.call( exclude ) === '[object Array]')
        condition.user={$nin:exclude};
    this.queryUsers(condition, {user:true, email:true, _id:false, createAppPerm:true}, callback);
}

//Mongo.prototype.isGroupEmpty = function(groupId, callback){
//    this.queryUsers({"group.id":groupId}, {user:true, _id:false}, function(err, docs){
//        if(err)
//            callback(err);
//        else
//            callback(null, docs&&docs.length>0?false:true);
//    });
//}

/**
 * 更新群組資料
 */
Mongo.prototype._updateGroup = function(condition, operation, callback){
    this.getGroupCollection(function(err, collection){
        if(err){
            err(err);
            return;
        }else{
            if(condition._id && typeof(condition._id)=='string')
                condition._id=collection.db.bson_serializer.ObjectID.createFromHexString(condition._id);
            collection.update(condition, operation, {safe:true, multi:false, upsert:true}, callback);
        }
    });
}

/**
 * 更新單一群組資料(給其他module使用，檢查su權限)
 */
Mongo.prototype.updateGroup = function(uinfo, condition, operation, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    this._updateGroup(condition, operation, callback);
}

/**
 * application account management
 * aAcnt: apple account
 * gAcnt: google account
 * isSystemAcnt: 是否為系統帳號。google皆為系統帳號。iOS需要一個enterprise account當作系統帳號才能產生測試版app
 *
 * [update] --- google無系統帳號，更新時需輸入acntId更新
 */
Mongo.prototype.insertMobileAccount = function(uinfo, aAcnt, gAcnt, isSystemAcnt, acntId, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    var mongo = this;
    insertApple(function(err){
        if(err){
            callback(err);
        }else{
            insertGoogle(null, callback);
        }    
    }, callback);
    
    function insert(acnt, next, callback){
        var mNext = next?next:callback;
        return function(err, collection){
            if(err){
                callback(err);
                return;
            }
            if(isSystemAcnt){ //系統層級的super account只能有一個
            	console.log("isSystemAcnt");
                collection.update({super:true}, acnt, {safe:true, upsert:true}, function(err){callback(null)});
            }else{//實際上是insert，只是避免重複改用upsert
                console.log(acnt);
                acnt.super=false;
                if(acnt.ADCaccountID){
					console.log("going to checkIosAccountExistence");
					mongo.checkIosAccountExistence(acnt.ADCaccountID,acnt.DEVELOPPER_NAME, acntId, function(err, exist){
						console.log("insertMobileAccount exist="+exist);
						console.log("insertMobileAccount err="+err);
					   if(err)callback(err);
					   else if(exist){
						callback(errcode.INVALID_ACCOUNT); 
					   }else{
							console.log("insertMobileAccount acntId="+acntId);
						if(acntId==null){
							collection.update(acnt, acnt, {safe:true, upsert:true}, mNext); 
						}else{
							collection.update({'_id':collection.db.bson_serializer.ObjectID.createFromHexString(acntId)}, acnt, {safe:true, upsert:true}, mNext); 
						}
						}
					});
				}else{  //(account,AndroidKey, GoogleApiKey, GoogleId, acntId, callback){
					mongo.checkAndroidAccountExistence(acnt.account,acnt.AndroidKey, acnt.GoogleApiKey, acnt.GoogleId, acntId, function(err, exist){
						console.log("insertMobileAccount exist="+exist);
						console.log("insertMobileAccount err="+err);
					   if(err)callback(err);
					   else if(exist){
						callback(errcode.INVALID_ACCOUNT); 
					   }else{
							console.log("insertMobileAccount acntId="+acntId);
						if(acntId==null){
							collection.update(acnt, acnt, {safe:true, upsert:true}, mNext); 
						}else{
							collection.update({'_id':collection.db.bson_serializer.ObjectID.createFromHexString(acntId)}, acnt, {safe:true, upsert:true}, mNext); 
						}
						}
					});
				}
            }
        }
    }
    
    function insertGoogle(next, callback){
        if(!gAcnt){
            next?next():callback(null);
            return;
        }
        mongo.getGoogleAcntCollection(insert(gAcnt, next, callback));
    }
    
    function insertApple(next, callback){
        if(!aAcnt){
            next?next():callback(null);
            return;
        }
        mongo.getAppleAcntCollection(insert(aAcnt, next, callback));
    }
};


/**
 * 取得google api設定
 */
Mongo.prototype.getGoogleApiConfig = function(callback){
// 	console.log("## getGoogleApiConfig")
    this.getGoogleAcntCollection(function(err, collection){
        if(err){
            callback(errcode.DB_ERR);
            return;
        }else{
            collection.find().toArray(function(err, doc){
                if(err)
                    callback(errcode.DB_ERR);
                else{
                	for(var i=0;i<doc.length;i++){
                		console.log("@#@#@# doc="+doc[i].GoogleId);
                	}
                    callback(null, doc);
					console.log(doc);
                }
            });
        }
    });
}

/**
 * 取得google api設定
 */
Mongo.prototype.getGoogleApiConfigById = function(id, callback){
    this.getGoogleAcntCollection(function(err, collection){
        if(err){
            callback(errcode.DB_ERR);
            return;
        }else{
            collection.findOne({_id:collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(err, doc){
                if(err)
                    callback(errcode.DB_ERR);
                else{
                    callback(null, doc);
					console.log(doc);
                }
            });
        }
    });
}

/**
 * 取得platform information
 */
Mongo.prototype.getPlatformInfo = function(callback){
    this.getPlatformCollection(function(err, collection){
        if(err){
            callback(errcode.DB_ERR);
            return;
        }else{
            collection.findOne({}, function(err, doc){
                if(err)
                    callback(errcode.DB_ERR);
                else{
                    callback(null, doc);
                }
            });
        }
    });
}
/**
 * 取得iOS系統帳號
 */
Mongo.prototype.getIosSystemAcnt = function(callback){
    this.getAppleAcntCollection(function(err, collection){
        if(err){
            callback(errcode.DB_ERR);
            return;
        }else{
            collection.findOne({super:true}, function(err, doc){
                if(err)
                    callback(errcode.DB_ERR);
                else{
                    callback(null, doc);
                }
            });
        }
    });
}
/**
 * 取得iOS帳號
 */
Mongo.prototype.getIosAccountById = function(id, callback){
    this.getAppleAcntCollection(function(err, collection){
        if(err){
            callback(errcode.DB_ERR);
            return;
        }else{
            collection.findOne({_id:collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(err, doc){
                if(err)
                    callback(errcode.DB_ERR);
                else{
                    callback(null, doc);
                }
            });
        }
    });
}

/**
 * 檢查iOS帳號是否存在
 */
Mongo.prototype.checkIosAccountExistence = function(adcId,devName, acntId, callback){
	var condition={};
    this.getAppleAcntCollection(function(err, collection){
    	console.log("getAppleAcntCollection");
        if(err){
        	console.log("getAppleAcntCollection err");
            callback(errcode.DB_ERR);
            return;
        }else{
        	if(acntId)
				condition={$ne:collection.db.bson_serializer.ObjectID.createFromHexString(acntId)};
			else
				condition={$ne:null};
            collection.findOne({ADCaccountID:adcId, '_id':condition}, function(err, doc){
            	console.log("findOne, "+acntId);
            	console.log("err, "+err);
                if(err)
                    callback(errcode.DB_ERR, false);
                else{
                	//console.log(doc._id);
                	checkDeveloperName(collection, devName, doc);
                    //callback(null, doc?true:false);
                }
            });
        }
    });
    function checkDeveloperName(collection, DEVELOPPER_NAME, doc1){
    	collection.findOne({DEVELOPPER_NAME:devName, '_id':condition}, function(err, doc2){
    		console.log("findOne2, "+acntId);
			if(err)
				callback(errcode.DB_ERR, false);
			else{
				var doc=false;
				if(doc1 || doc2)
					doc=true;
				callback(null, doc);
			}
		});
    }
}

/**
 * 檢查Android帳號是否存在
 */
Mongo.prototype.checkAndroidAccountExistence = function(account,AndroidKey, GoogleApiKey, GoogleId, acntId, callback){
	var condition={};
    this.getGoogleAcntCollection(function(err, collection){
    	console.log("getGoogleAcntCollection");
    	console.log(account);
    	console.log(AndroidKey);
    	console.log(GoogleApiKey);
    	console.log(GoogleId);
    	console.log(acntId);
    	
    	if(acntId)
    		condition={$ne:collection.db.bson_serializer.ObjectID.createFromHexString(acntId)};
    	else
    		condition={$ne:null};
        if(err){
        	console.log("getGoogleAcntCollection err");
            callback(errcode.DB_ERR);
            return;
        }else{
        	console.log("acntId="+acntId);
        	console.log("account="+account);
        	collection.findOne({account:account, '_id':condition}, function(err, doc){
				console.log("findOne, "+acntId);
				console.log("err, "+err);
				if(err)
					callback(errcode.DB_ERR, false);
				else{
					//console.log(doc._id);
					checkAndroidKey(collection, AndroidKey, doc);
					//callback(null, doc?true:false);
				}
			});
        }
    });
    function checkAndroidKey(collection, AndroidKey, doc1){
    	collection.findOne({AndroidKey:AndroidKey, '_id':condition}, function(err, doc2){
    		console.log("checkAndroidKey, "+acntId);
			if(err)
				callback(errcode.DB_ERR, false);
			else{
				checkGoogleApiKey(collection, GoogleApiKey, doc1, doc2);
			}
		});
    }
    function checkGoogleApiKey(collection, GoogleApiKey, doc1, doc2){
    	collection.findOne({GoogleApiKey:GoogleApiKey, '_id':condition}, function(err, doc3){
    		console.log("checkGoogleApiKey, "+acntId);
			if(err)
				callback(errcode.DB_ERR, false);
			else{
				checkGoogleId(collection, GoogleId, doc1, doc2, doc3);
			}
		});
    }
    // GoogleId = projectId
    function checkGoogleId(collection, GoogleId, doc1, doc2, doc3){
    	collection.findOne({GoogleId:GoogleId, '_id':condition}, function(err, doc4){
    		console.log("checkGoogleId, "+acntId);
			if(err)
				callback(errcode.DB_ERR, false);
			else{
				var doc=false;
				if(doc1 || doc2 || doc3 || doc4)
					doc=true;
				callback(null, doc);
			}
		});
    }
}

/**
 * update Android account
 */
Mongo.prototype.updateAndroidAccount = function(uinfo, conf, id, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    
    updateGoogleAccount(this, {'_id':id}, {$set:conf}, function(err){
        if(err)
            callback(errcode.DB_ERR);
        else
            callback(null);
    });
};
/**
 * update ios account
 */
Mongo.prototype.updateIosAccount = function(uinfo, conf, id, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    
    updateAccount(this, {'_id':id}, {$set:conf}, function(err){
        if(err)
            callback(errcode.DB_ERR)
        else
            callback(null);
    });
//    function handler(err, collection){
//        var condition={'_id':collection.db.bson_serializer.ObjectID.createFromHexString(id)};
//        collection.update(condition, {$set:conf}, function(err){
//            if(err)
//                callback(errcode.DB_ERR)
//            else
//                callback(null);
//        })
//    }
//    this.getAppleAcntCollection(handler);
};

/**
 * add group to account
 */
Mongo.prototype.addGroupToAccount = function(uinfo, accountId, groupId, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
    }
    var mongo=this;
    mongo.getGroupById(uinfo, groupId, function(err, group){
        if(err) 
            callback(err);
        else if(!group)
            callback(errcode.INVALID_GROUP);
        else{
            updateAccount(mongo, {"groups.id":groupId }, {$pull:{groups:{id:groupId}}}, function(err){
                if(err){
                    callback(err);
                    return;
                }
				console.log("accountId="+accountId);
                updateAccount(mongo, {_id:accountId}, {$push:{groups:{id:group._id.toString(), name:group.name}}}, function(err, acc){
                    console.log("acc.stringify="+JSON.stringify(acc));
                    if(err) callback(err);
                    else
                        mongo._updateGroup({_id:groupId},{$set:{iosAccount:{id:accountId, ADCaccountID:acc.DEVELOPPER_NAME}}}, callback);
                });
            });
        }
    });
}
/**
 * add group to google (android) account
 */
Mongo.prototype.addGroupToAndroidAccount = function(uinfo, accountId, groupId, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
    }
    var mongo=this;
    mongo.getGroupById(uinfo, groupId, function(err, group){
        if(err) 
            callback(err);
        else if(!group)
            callback(errcode.INVALID_GROUP);
        else{
            updateGoogleAccount(mongo, {"groups.id":groupId }, {$pull:{groups:{id:groupId}}}, function(err){
                if(err){
                    callback(err);
                    return;
                }
                console.log("group.name="+group.name);
                updateGoogleAccount(mongo, {_id:accountId}, {$push:{groups:{id:group._id.toString(), name:group.name}}}, function(err, acc){
                    console.log("accountId="+accountId);
                    console.log("acc.string="+JSON.stringify(acc));
                    if(err) callback(err);
                    else
                        mongo._updateGroup({_id:groupId},{$set:{androidAccount:{id:accountId, name:acc.account}}}, callback);
                });
            });
        }
    });
}

/** ################################
 * add app to account
 */
Mongo.prototype.addUserToApp = function(uinfo, userId, appId, callback){
    if(!uinfo){
        callback(errcode.NOT_LOGIN);
    }
    var mongo=this;
    mongo.getGroupById(uinfo, uinfo.group.id , function(err, group){
        if(err) 
            callback(err);
        else if(!group)
            callback(errcode.INVALID_GROUP);
        else{
            updateAccount(mongo, {"groups.id":groupId }, {$pull:{groups:{id:groupId}}}, function(err){
                if(err){
                    callback(err);
                    return;
                }
                updateAccount(mongo, {_id:accountId}, {$push:{groups:{id:group._id.toString(), name:group.name}}}, function(err, acc){
                    if(err) callback(err);
                    else
                        mongo._updateGroup({_id:groupId},{$set:{iosAccount:{id:accountId, ADCaccountID:acc.ADCaccountID}}}, callback);
                });
            });
        }
    });
}
/**
 * remove group from account
 */
Mongo.prototype.removeGroupFromAccount = function(uinfo, accountId, groupId, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
    }
    var mongo=this;
    mongo.getGroupById(uinfo, groupId, function(err, group){
        if(err) 
            callback(err);
        else if(!group)
            callback(errcode.INVALID_GROUP);
        else{
            updateAccount(mongo, {_id:accountId}, {$pull:{groups:{id:group._id.toString()}}}, function(err){
                if(err) callback(err);
                else
                    mongo._updateGroup({_id:groupId},{$unset:{iosAccount:1}},callback);
            });
        }
    });
}

function updateAccount(mongo, condition, operation, callback){
    mongo.getAppleAcntCollection(function(err, collection){
        if(err){ 
            callback(err);
        }else{
            if(condition && condition._id && typeof condition._id === 'string')
                condition._id=collection.db.bson_serializer.ObjectID.createFromHexString(condition._id);
            
            collection.findAndModify(condition, {}, operation, {safe:true}, callback);
        }
    });
}


function updateGoogleAccount(mongo, condition, operation, callback){
    mongo.getGoogleAcntCollection(function(err, collection){
        if(err){ 
            callback(err);
        }else{
            if(condition && condition._id && typeof condition._id === 'string')
                condition._id=collection.db.bson_serializer.ObjectID.createFromHexString(condition._id);
            
            collection.findAndModify(condition, {}, operation, {safe:true}, callback);
        }
    });
}


/**
 * delete Android account
 */
Mongo.prototype.deleteAndroidAccount = function(uinfo, id, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    function handler(err, collection){
        var condition={'_id':collection.db.bson_serializer.ObjectID.createFromHexString(id)};
        collection.remove(condition, function(err){
            if(err)
                callback(errcode.DB_ERR)
            else
                callback(null);
        })
    } 
    this.getGoogleAcntCollection(handler);
};


/**
 * delete ios account
 */
Mongo.prototype.deleteIosAccount = function(uinfo, id, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    function handler(err, collection){
        var condition={'_id':collection.db.bson_serializer.ObjectID.createFromHexString(id)};
        collection.remove(condition, function(err){
            if(err)
                callback(errcode.DB_ERR)
            else
                callback(null);
        })
    } 
    this.getAppleAcntCollection(handler);
};

/**
 * list iOS accounts
 */
Mongo.prototype.listIosAccounts = function(uinfo, callback){
    //if(!uinfo || !uinfo.super ){   // 為了可以列出上架版ios account選項而修改
    if(!uinfo ||  !uinfo.createAppPerm){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    queryIosAccounts(this, {}, {super:true, ADCaccountID:true, ADCpassword:true, ADCboundleID:true, DEVELOPPER_NAME:true, group:true}, function(err, acnts){
        if(err)
            callback(errcode.DB_ERR)
        else
            callback(null, acnts);
    });
};

/**
 * list iOS accounts
 */
Mongo.prototype.queryIosAccounts = function(uinfo, condition, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    queryIosAccounts(this, condition, {super:true, ADCaccountID:true, ADCboundleID:true, DEVELOPPER_NAME:true}, function(err, acnts){
        if(err)
            callback(errcode.DB_ERR)
        else
            callback(null, acnts);
    });
};

/**
 * list Android accounts
 */
Mongo.prototype.queryAndroidAccounts = function(uinfo, condition, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    queryAndroidAccounts(this, condition, {super:true, AndroidKey:true, GoogleApiKey:true, GoogleId:true, account:true}, function(err, acnts){
        if(err)
            callback(errcode.DB_ERR)
        else
            callback(null, acnts);
    });
};


/**
 * 將_id的hex字串轉為mongo db的object id
 */
function createConditionHex(condition, collection){
    if(condition && condition._id && typeof(condition._id)=='string')
        condition._id=collection.db.bson_serializer.ObjectID.createFromHexString(condition._id);
    return condition;
}

/**
 * query ios accounts
 */
function queryIosAccounts(mongo, condition, include, callback){
    function handler(err, collection){
        condition=createConditionHex(condition, collection);
        collection.find(condition, include).toArray(function(err, acnts){
            if(err)
                callback(errcode.DB_ERR)
            else
                callback(null, acnts);
        });
    } 
    mongo.getAppleAcntCollection(handler);
};

/**
 * query android accounts
 */
function queryAndroidAccounts(mongo, condition, include, callback){
    function handler(err, collection){
        condition=createConditionHex(condition, collection);
        collection.find(condition, include).toArray(function(err, acnts){
            if(err)
                callback(errcode.DB_ERR)
            else
                callback(null, acnts);
        });
    } 
    mongo.getGoogleAcntCollection(handler);
};


/**
 * 取得所有app分類
 */
Mongo.prototype.getCategories = function(callback){
   this.getCategoryCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        collection.find({}).toArray(function(error, docs) { 
    	  if(error){
    		console.log(error);callback(errcode.DB_ERR);
    	  }else{
            callback(null, docs);   
    	  }	
    	});  
      }
    });
};

/**
 * 根據id取得app分類
 */
Mongo.prototype.getCategoryById = function(catId, callback){
	console.log("### cate id ="+catId);
    var mongo=this;
   this.getCategoryCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        collection.findOne({ _id: collection.db.bson_serializer.ObjectID.createFromHexString(catId)}, function(error, category) { 
          if(error){
    		mongo.getDefaultCategory(callback);//若分類有誤，改為預設分類
    	  }else{
            callback(null, category);   
    	  }	
    	});  
      }
    });
};


/**
 * 取得某一分類底下(該使用者有權限取得的)所有apps
 */
Mongo.prototype.getCategoryApps = function(uinfo, cateId, callback){
    var condition=getAppPermCondition({'Category.id':cateId},uinfo);
    this.getApps_general(condition, {}, callback);
}
/**
 * 取得預設分類
 */
Mongo.prototype.getDefaultCategory = function(callback){
   this.getCategoryCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        collection.findOne({default:true}, function(error, category) { 
          if(error){
        	console.log(error);callback(errcode.DB_ERR);
    	  }else{
            callback(null, category);   
    	  }	
    	});  
      }
    });
};
/**
 *  新增分類
 */
Mongo.prototype.createCategory = function(uinfo, name, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
   this.getCategoryCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
      	collection.find({"name":name},{}).toArray(function(error, docs) { 
      		if(!docs){GoOnFn();}
      		else if(docs.length==0){GoOnFn();}
      		else{callback(errcode.CATEGORY_EXIST);}
      	});
      	function GoOnFn(){
			var doc = {name:name, date:new Date().toString(), timestamp:Date.now()};
			collection.update({name:name}, doc, {safe:true, upsert:true}, function(err){
			  callback(err?errcode.DB_ERR:null);
			});  
        }
      }
    });
};

/**
 * 統計每個分類底下有多少app
 */
Mongo.prototype.countCategoryApps = function(uinfo, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    
    this.getAppsCollection(function(err, collection) {
        if(err){
            callback(err);
            return;
        }
        collection.group({ 'Group.id': true, 'Category.id': true},{},
                            {count_: 0}, 
                            function(doc, prev) { prev.count_ += 1},
                            function(err, counts_){
                            	console.log("counts_.length="+counts_.length);
                            	for(var i=0;i<12;i++){
									console.log("***getAppsCollection=%j", counts_[i]);
								}
								collection.group({'Category.id': true},{},
									{count: 0}, 
									function(doc, prev) { prev.count += 1},
									function(err, counts){
									callback(err?errcode.DB_ERR:null, counts, counts_);
							});
                        });
        
    });
}

/**
 * 統計每個分類底每個Group下有多少app
 */
Mongo.prototype.countCategoryGroupApps = function(uinfo, callback){
    var mongo=this;
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    mongo.getCategoryCollection(function(error, c_collection) {
    	mongo.getGroupCollection(function(err, gp_collection){
			mongo.getAppsCollection(function(err, app_collection) {
				c_collection.find({},{}).toArray(function(err, categories){
    				gp_collection.find({},{}).toArray(function(err, groups){
						var results=[];
						if(!groups){
							console.log("!group");
							callback(err?errcode.DB_ERR:null, null);
							return;
						}else{
							//pushCategoryApp(0,0);
							pushGroup(0);
						}		
						console.log("groups.length="+groups.length);
						function pushGroup(i){
							results.push({"GroupId":groups[i]._id.toString(), "GroupName":groups[i].name  , "CategoryInfo":[]});
							console.log(results[i])
							pushCategoryApp(i,0);
						}
						
						function pushCategoryApp(i,j){
							console.log("i="+i+", j="+j);
							app_collection.find({"Category.id":categories[j]._id.toString(), "Group.id":groups[i]._id.toString()},{}).toArray(function(err, apps){
								//results.push({"GroupId":groups[i]._id.toString(),"CategoryInfo":[]});
								if(!results[i].CategoryInfo)
									results[i].CategoryInfo=[];
								results[i].CategoryInfo.push({'CategoryId':categories[j]._id, 'GroupId':groups[i]._id.toString(), 'num':apps.length});
								console.log("results[i].CategoryInfo="+results[i].CategoryInfo[0].toString());
								console.log("j loop");
								if(j==(categories.length-1)){
									if(i==(groups.length-1)){
										console.log("groups.length="+groups.length);
										console.log("categories.length="+categories.length);
										console.log("i="+i+", j="+j+",  callback");
										callback(err, results);
										return;
									}
									else{
										console.log("else 1");
										//pushGroupAppCategory((i+1));
										//pushCategoryApp((i+1),0);
										pushGroup(i+1);
									}
								}
								else{
									console.log("else 2");
									pushCategoryApp(i,(j+1));
								}
							});
						}
					});
    			});
    		});
    	});
    });
    
}

/**
 *  刪除分類
 */
Mongo.prototype.removeCategory = function(uinfo, ids, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
    if(!ids || !ids.length){
        callback(null);
        return;
    }
    var mongo=this;
   mongo.getCategoryCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        var objs=[];
        for(var i=0;i<ids.length;i++){
            objs.push(collection.db.bson_serializer.ObjectID.createFromHexString(ids[i]));
        }
        collection.remove({_id:{$in:objs}, default:{$ne:true}}, {safe:true, upsert:true}, function(err){
            if(err){
                callback(errcode.DB_ERR);
                return;
            }
            //將這個分類底下的app改為預設分類
            mongo.getDefaultCategory(function(err, defCate){
                if(err){
                    callback(err);
                    return;
                }
                mongo.updateApp({'Category.id':{$in:ids}}, {$set:{'Category.id':defCate._id.toString(), 'Category.name':defCate.name}}, {safe:true, multi:true}, function(err){
                    if(err){
                        callback(err);
                    }else{
                        callback(null);
                    }
                });
            });
        });  
      }
    });
};


Mongo.prototype.updateReader = function(uinfo, rid, update, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
   this.getReadersCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        var condition = createConditionHex({_id:rid}, collection);
        collection.update(condition, {$set:update}, {safe:true, upsert:false, multi:false}, function(err){
          callback(err?errcode.DB_ERR:null);
        });  
      }
    });
};

/**
 * update platform information
 */
Mongo.prototype.updatePlatformInfo = function(data, callback){
	var uinfo = data.uinfo;

    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
	delete data.uinfo;
	var mongo = this;
	this.getPlatformCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
		collection.findOne({}, function(err, doc){
			if(err)
				callback(errcode.DB_ERR);
			else if(doc){
				collection.update({}, {$set:data}, {safe:true, upsert:false, multi:false}, function(err){
					if(err)
						callback(errcode.DB_ERR);
					else
						updateAccount(mongo, {super:true}, {$set:{"ADCboundleID":"com."+data.companyAcrony+".ent.test"}}, function(err){
							if(err)
								callback(errcode.DB_ERR);
							else{
								callback(null);
							}
						});
				});  
			}
			else {
				collection.insert(data, {safe:true, upsert:true, multi:false}, function(err){
				  callback(err?errcode.DB_ERR:null);
				});  
			}
		});
      }
    });
}


Mongo.prototype.addReader = function(uinfo, reader, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
   this.getReadersCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        collection.insert(reader, {safe:true, upsert:true, multi:false}, function(err){
          callback(err?errcode.DB_ERR:null);
        });  
      }
    });
};

/**
 * 取得所有reader 
 * callback: function(err, readers)
 * readers: array
 */
Mongo.prototype.getReaders = function(uinfo, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
   this.getReadersCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        collection.find({}).toArray(function(err, readers){
            if(err){
                callback(errcode.DB_ERR);
            }else{
                callback(null, readers);    
            }
        });  
      }
    });
};

/**
 * 查詢readers
 * callback: function(err, readers)
 * readers: array
 */
Mongo.prototype.queryReaders = function(condition, callback){
   this.getReadersCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        condition=createConditionHex(condition, collection);
        collection.find(condition).toArray(function(err, readers){
            if(err){
                callback(errcode.DB_ERR);
            }else{
                callback(null, readers);    
            }
        });  
      }
    });
};

/**
 * 根據id取得某一reader
 */
Mongo.prototype.getReaderById = function(uinfo, rid, callback){
    //if(!uinfo || !uinfo.super){
    if(!uinfo){
        callback(errcode.NOT_LOGIN);
        return;
    }
   this.getReadersCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        var condition = createConditionHex({_id:rid}, collection);
        collection.findOne(condition, function(err, reader){
            if(err){
                callback(errcode.DB_ERR);
            }else{
                callback(null, reader);    
            }
        });  
      }
    });
};

/**
 * 根據id刪除某一reader
 */
Mongo.prototype.rmReaderById = function(uinfo, rid, callback){
    if(!uinfo || !uinfo.super){
        callback(errcode.SUPER_REQUIRED);
        return;
    }
   this.getReadersCollection(function(error, collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        var condition = createConditionHex({_id:rid}, collection);
        collection.remove(condition, {safe:true}, function(err, reader){
            if(err){
                callback(errcode.DB_ERR);
            }else{
                callback(null, reader);    
            }
        });  
      }
    });
};

/**
 * 檢查使用者是否能管理app
 */
Mongo.prototype.canManageApp= function(uinfo, app){
    if(!uinfo){
        return false;
    }
    if(uinfo.super){
        return true;
    }
    if(!app || !app.Group){
        return false;
    }
    if(uinfo.group.manager && app.Group.id==uinfo.group.id){
        console.log(true);
        return true;
    }
    if(uinfo.createAppPerm && uinfo.user==app.Creator){
        return true;
    }
    return false;
}


/*
 * 新增ad
 */
Mongo.prototype.addAd = function(ad, callback){
   this.getAdsCollection(function(error, ad_collection) {
      if( error ) {console.log(error);callback(errcode.DB_ERR);}
      else {
        //檢查這個user看到的ad裏面是否有名稱重複的
    	ad_collection.find({'user':ad.Creator, 'AD_name':ad.AD_name}).toArray(function(error, results) { 
    	  if(error){
    		console.log(error);callback(errcode.DB_ERR);
    	  }else if(results && results.length>0){
    		console.log('ad:'+ad.AD_name+' already exists');callback(errcode.AD_EXIST);  
    	  }else{
    	    ad_collection.insert(ad, {safe:true}, function() {
              console.log('insert, callback');
    	      callback(null);
    	    }); 
    	  }	
    	});  
      }
    });
};

// 列出所有廣告
Mongo.prototype.findAll = function(callback) {
    this.getAdsCollection(function(error, ad_collection) {
      if( error ) callback(error)
      else {
        ad_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

// 列出所有廣告播放清單
Mongo.prototype.findAllAdPlayList = function(callback) {
    this.getAdPlayListCollection(function(error, ad_collection) {
      if( error ) callback(error)
      else {
        ad_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

// 列出所有廣告種類
Mongo.prototype.findAllAdTypeList = function(callback) {
    this.getAdTypeListCollection(function(error, ad_collection) {
      if( error ) callback(error)
      else {
        ad_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

Mongo.prototype.updateAdPlayListByGroup = function(callback){
	var UserCollection, AdCollection;
	console.log("updateAdPlayListByGroup func?");
	var mongo = this;
	this.getAdPlayListCollection(function(error, ad_collection) {
		if( error ) callback(error)
		else {
			AdCollection=ad_collection;
			console.log("updateAdPlayListByGroup func");
			GoOnFn();
		}
	});
	function GoOnFn(){
		mongo.getUsersCollection(function(error, collection){
			console.log("AdCollection ="+AdCollection);
		
			if( error ) callback(error)
			else{
				UserCollection=collection;
				collection.find({},function(error, userResults) {
					userResults.toArray(function(err,userArray){
						AdCollection.find({"Group":{$exists:true}},function(error, results) {
							console.log("AdCollection find");
							if( error ) callback(error)
							else{
								console.log("test");
								results.toArray(function(err,arrayResult){
									if(arrayResult.length!=0){
										userArrayFn(0,0);
									}else{
										callback(null, results);
									}
									function userArrayFn(i,j){
										console.log("arrayResult["+i+"]="+arrayResult.length);
										
											if(userArray[j].user==arrayResult[i].Creator){
												AdCollection.update({_id:arrayResult[i]._id}, {$set:{"Group":{"name":userArray[j].group.name}}}, {safe:true, upsert:false, multi:false}, function(err){
													console.log("AdCollection updated");
											
													if(i==(arrayResult.length-1) && j==(userArray.length-1)){
														console.log("getUsersCollection callback");
														callback(null, results);
													}else if(i==(arrayResult.length-1) && j!=(userArray.length-1)){
														userArrayFn(i,j+1)
													}else if(i!=(arrayResult.length-1) && j==(userArray.length-1)){
														userArrayFn(i+1,0)
													}
													else if(i!=(arrayResult.length-1) && j!=(userArray.length-1)){
														userArrayFn(i,j+1)
													}
												});
											}else{
												if(i==(arrayResult.length-1) && j==(userArray.length-1)){
													console.log("getUsersCollection callback");
													callback(null, results);
												}else if(i==(arrayResult.length-1) && j!=(userArray.length-1)){
													userArrayFn(i,j+1)
												}else if(i!=(arrayResult.length-1) && j==(userArray.length-1)){
													userArrayFn(i+1,0)
												}
												else if(i!=(arrayResult.length-1) && j!=(userArray.length-1)){
													userArrayFn(i,j+1)
												}
											}
									}
								
	// 								for(var i=0;i<arrayResult.length;i++){
	// 									for(var j=0;j<userArray.length;j++){
	// 										if(userArray[j].user==arrayResult[i].Creator){
	// 											AdCollection.update({_id:arrayResult[i]._id}, {$set:{"Group":{"name":userArray[j].group.name}}}, {safe:true, upsert:false, multi:false}, function(err){
	// 												console.log("AdCollection updated");
	// 											});
	// 										}
	// 										//console.log("i="+i+", j="+j);
	// 										//console.log("arrayResult.length="+arrayResult.length+", userArray.langth="+userArray.length);
	// 										if(i==(arrayResult.length-1) && j==(userArray.length-1)){
	// 											//console.log("getUsersCollection callback");
	// 											callback(null, results);
	// 										}
	// 									}
	// 								}
								});

							}
						});
					});
				});
			}
		});
	}
};

/**
 * 列出所有版本以及所有書籍版本及其歸屬的App, Book, Bookcase, Group 的ID
 */
Mongo.prototype.listGroupsStruc = function(callback){
    _listGroupsStruc(this, callback);
}
function _listGroupsStruc(mongo, callback){
    var queryVersionResult=[]; //{"group_id", "app_id", "ver_id"}
    var queryBookVerResult=[]; //{"group_id", "bookcase_id", "book_id", "bookver_id"}
    var applist=[]; //{"group_id", "bookcase_id", "book_id", "bookver_id"}
    mongo.getGroupCollection(function(err, groups){
    	if(err){callback(1);return;}
    	mongo.getBookCollection(function(err, books){
    		if(err){callback(1);return;}
    		mongo.getBookVersionCollection(function(err, bookversions){
    			if(err){callback(1);return;}
				mongo.getBookcaseCollection(function(err, bookcases){
					if(err){callback(1);return;}
					mongo.getVersionsCollection(function(err, versions) {
						if(err){callback(1);return;}
// 						versions.findOne({},function(err, test) {
// 							console.log("!!!! versions.findOne="+test._id);
// 						});
						mongo.getAppsCollection(function(err, apps){
							if(err){callback(1);return;}
							versions.find({},{}).toArray(function(err, versionsArr) {
// 								console.log("!!!! versionsArr[0]="+versionsArr[0]._id);
								if(err){callback(1);return;}
								bookversions.find({},{}).toArray(function(err, bookversionsArr) {
									if(err){callback(1);return;}
									mergeVerToApp(groups, apps, versionsArr, bookversionsArr, books, bookcases);
								});
							});
						});
					});
				});
    		});
    	});
    });
    
    function mergeVerToApp(groups, apps, versionsArr, bookversionsArr, books, bookcases){	
//     	console.log("****** mergeVerToApp ******");
    	//var goThroughEveryVerionIndex=0;
    	goThroughEveryVerion(0);
    	var queryVersionResultLength=0;
    	function goThroughEveryVerion(i){
    		if(i%100==0){
				console.log("current in versionsArr "+i+"/"+versionsArr.length);
    		}
    		if(versionsArr[i]!=null){
    			apps.findOne({_id:apps.db.bson_serializer.ObjectID.createFromHexString(versionsArr[i].General_Info.APP_id)}, function(err, app) {
					if(err){callback(1);return;}
					if(app){
						if(app.Group){
							//{"group_id", "app_id", "ver_id", "ver_timestamp", "ver_preview_timestamp"}
							groups.findOne({_id:apps.db.bson_serializer.ObjectID.createFromHexString(app.Group.id)}, function(err, group) {
								if(err){callback(1);return;}
								//{"group_id", "app_id", "ver_id"}
								if(group){
									queryVersionResult.push({"group_id":group._id,  "app_id":app._id, "ver_id":versionsArr[i]._id, "ver_timestamp":versionsArr[i].General_Info.CreateTimestamp, "ver_preview_timestamp":versionsArr[i].General_Info.PreviewTimestamp});
									console.log("queryVersionResult["+queryVersionResultLength+"]="+queryVersionResult[queryVersionResultLength].group_id);
									console.log("queryVersionResult["+queryVersionResultLength+"].ver_preview_timestamp="+queryVersionResult[queryVersionResultLength].ver_preview_timestamp);
									queryVersionResultLength++;
									if(i==(versionsArr.length-1)){
										mergeBookverToBook(bookversionsArr, books, bookcases, groups);
									}else{
										goThroughEveryVerion(i+1);
									}
								}else{
									goThroughEveryVerion(i+1);
								}
							});
						}else if(versionsArr[i].General_Info.Group){
							groups.findOne({_id:apps.db.bson_serializer.ObjectID.createFromHexString(versionsArr[i].General_Info.Group.id)}, function(err, group) {
								if(err){callback(1);return;}
								//{"group_id", "app_id", "ver_id", "ver_timestamp", "ver_preview_timestamp"}
								queryVersionResult.push({"group_id":group._id,  "app_id":app._id, "ver_id":versionsArr[i]._id, "ver_timestamp":versionsArr[i].General_Info.CreateTimestamp, "ver_preview_timestamp":versionsArr[i].General_Info.PreviewTimestamp});
								console.log("queryVersionResult["+queryVersionResultLength+"]="+queryVersionResult[queryVersionResultLength].group_id);
								console.log("queryVersionResult["+queryVersionResultLength+"].ver_preview_timestamp="+queryVersionResult[queryVersionResultLength].ver_preview_timestamp);
								queryVersionResultLength++;
								if(i==(versionsArr.length-1)){
									mergeBookverToBook(bookversionsArr, books, bookcases, groups);
								}else{
									goThroughEveryVerion(i+1);
								}
							});
						}else{
							if(i==(versionsArr.length-1)){
								mergeBookverToBook(bookversionsArr, books, bookcases, groups);
							}else{
								goThroughEveryVerion(i+1);
							}
						}
					}else{
						if(i==(versionsArr.length-1)){
							mergeBookverToBook(bookversionsArr, books, bookcases, groups);
						}else{
							goThroughEveryVerion(i+1);
						}
					}
				})
			}else{
				mergeBookverToBook(bookversionsArr, books, bookcases, groups);
			}
    	}
    }
    function mergeBookverToBook(bookversionsArr, books, bookcases, groups){
    	console.log("****** bookversionsArr ******");
    	//for(var i=0;i<bookversionsArr.length;i++){
    	goThroughEveryBookVerion(0);
    	function goThroughEveryBookVerion(i){
    		if(i%100==0){
				console.log("current in bookversionsArr "+i+"/"+bookversionsArr.length);
    		}
    		if(bookversionsArr[i]&&bookversionsArr[i].bookId){
    			books.findOne({'_id':books.db.bson_serializer.ObjectID.createFromHexString(bookversionsArr[i].bookId)}, function(err, book) {
					if(err){callback(1);return;}
					if(book){
						bookcases.findOne({'_id':bookcases.db.bson_serializer.ObjectID.createFromHexString(book.bookcaseId)}, function(err, bookcase) {
							if(err){callback(1);return;}
							if(bookcase){
								groups.findOne({_id:groups.db.bson_serializer.ObjectID.createFromHexString(bookcase.General_Info.Group.id)}, function(err, group) {
									if(err){callback(1);return;}
									//{"group_id", "bookcase_id", "book_id", "bookver_id", "bookver_preview_timestamp"}
									if(group){
										queryBookVerResult.push({"group_id":group._id,  "bookcase_id":bookcase._id, "book_id":book._id, "bookver_id":bookversionsArr[i]._id, "bookver_preview_timestamp":bookversionsArr[i].Timestamp});
										if(i==(bookversionsArr.length-1)){
											callback(null, queryVersionResult, queryBookVerResult);
										}else{
											goThroughEveryBookVerion(i+1);
										}
									}else{
										if(i==(bookversionsArr.length-1)){
											callback(null, queryVersionResult, queryBookVerResult);
										}else{
											goThroughEveryBookVerion(i+1);
										}
									}
								});
							}else{
								if(i==(bookversionsArr.length-1)){
									callback(null, queryVersionResult, queryBookVerResult);
								}else{
									goThroughEveryBookVerion(i+1);
								}
							}
						});
					}else{
						if(i==(bookversionsArr.length-1)){
							callback(null, queryVersionResult, queryBookVerResult);
						}else{
							goThroughEveryBookVerion(i+1);
						}
					}
				})
			}else{
				if(i==(bookversionsArr.length-1)){
					callback(null, queryVersionResult, queryBookVerResult);
				}else{
					goThroughEveryBookVerion(i+1);
				}
			}
		}
    }    
}

Mongo.prototype.addAppSize = function(app_id, add_ver_size, callback) {
	try{
// 		console.log("app_id="+app_id);
		this.getAppsCollection(function(error, app_collection) {
			//var condition = {'_id':app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    else {
		    	//app_collection.findOne(condition, function(error, result) {
		    	app_collection.findOne({_id:app_id}, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else{
		    			if(!result.size){
		    				//callback(null);
		    				app_collection.update({_id:app_id}, {$set:{"size":add_ver_size}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			else{
// 		    				console.log("result.size="+result.size);
// 		    				console.log("(add_ver_size+result.size)="+(add_ver_size+result.size));
		    				app_collection.update({_id:app_id}, {$set:{"size":(add_ver_size+result.size)}}, {safe:true, upsert:false, multi:false}, function(err){
// 		    				app_collection.update({_id:app_id}, {$set:{"size":0}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			
		    		}
		    	});
		    }
		 });
	}catch(err){
		console.log(err.stack);
		callback(errcode.DB_ERR);
	}
    
}

Mongo.prototype.updateAppSize = function(app_id, old_ver_size, add_ver_size, callback) {
	try{
		console.log("app_id="+app_id);
		this.getAppsCollection(function(error, app_collection) {
			//var condition = {'_id':app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    else {
		    	//app_collection.findOne(condition, function(error, result) {
		    	app_collection.findOne({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)}, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else{
		    			if(!result.size){
		    				//callback(null);
		    				app_collection.update({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)}, {$set:{"size":add_ver_size}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			else{
		    				console.log("result.size="+result.size);
// 		    				console.log("(add_ver_size+result.size)="+(add_ver_size+result.size));
							console.log("add_ver_size="+add_ver_size);
							console.log("old_ver_size="+old_ver_size);
							console.log(add_ver_size+result.size-old_ver_size);
							var updatedSize=add_ver_size+result.size-old_ver_size
		    				app_collection.update({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)}, {$set:{"size":updatedSize}}, {safe:true, upsert:false, multi:false}, function(err){
// 		    				app_collection.update({_id:app_id}, {$set:{"size":0}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								console.log(err);
								callback(null);
							});
		    			}
		    			
		    		}
		    	});
		    }
		 });
	}catch(err){
		console.log(err.stack);
		callback(errcode.DB_ERR);
	}
    
}

Mongo.prototype.addBookSize = function(app_id, add_ver_size, callback) {
	try{
// 		console.log("app_id="+app_id);
		this.getBookCollection(function(error, app_collection) {
			//var condition = {'_id':app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    else {
		    	//app_collection.findOne(condition, function(error, result) {
		    	app_collection.findOne({_id:app_id}, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else{
		    			if(!result.size){
		    				//callback(null);
		    				app_collection.update({_id:app_id}, {$set:{"size":add_ver_size}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			else{
// 		    				console.log("result.size="+result.size);
// 		    				console.log("(add_ver_size+result.size)="+(add_ver_size+result.size));
		    				app_collection.update({_id:app_id}, {$set:{"size":(add_ver_size+result.size)}}, {safe:true, upsert:false, multi:false}, function(err){
// 		    				app_collection.update({_id:app_id}, {$set:{"size":0}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			
		    		}
		    	});
		    }
		 });
	}catch(err){
		console.log(err.stack);
		callback(errcode.DB_ERR);
	}
    
}

Mongo.prototype.updateBookSize = function(app_id, old_ver_size, add_ver_size, callback) {
	try{
// 		console.log("app_id="+app_id);
		this.getBookCollection(function(error, app_collection) {
			//var condition = {'_id':app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    else {
		    	//app_collection.findOne(condition, function(error, result) {
		    	app_collection.findOne({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)}, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else{
		    			if(!result.size){
		    				//callback(null);
		    				app_collection.update({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)}, {$set:{"size":add_ver_size}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			else{
// 		    				console.log("result.size="+result.size);
// 		    				console.log("(add_ver_size+result.size)="+(add_ver_size+result.size));
		    				app_collection.update({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)}, {$set:{"size":(add_ver_size+result.size-old_ver_size)}}, {safe:true, upsert:false, multi:false}, function(err){
// 		    				app_collection.update({_id:app_id}, {$set:{"size":0}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			
		    		}
		    	});
		    }
		 });
	}catch(err){
		console.log(err.stack);
		callback(errcode.DB_ERR);
	}
    
}

Mongo.prototype.updateBookcaseSize = function(app_id, old_ver_size, add_ver_size, callback) {
	try{
// 		console.log("app_id="+app_id);
		this.getBookcaseCollection(function(error, app_collection) {
			//var condition = {'_id':app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    else {
		    	//app_collection.findOne(condition, function(error, result) {
		    	app_collection.findOne({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)}, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else{
		    			if(!result.size){
		    				//callback(null);
		    				app_collection.update({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)}, {$set:{"size":add_ver_size}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			else{
// 		    				console.log("result.size="+result.size);
// 		    				console.log("(add_ver_size+result.size)="+(add_ver_size+result.size));
		    				app_collection.update({_id:app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)}, {$set:{"size":(add_ver_size+result.size-old_ver_size)}}, {safe:true, upsert:false, multi:false}, function(err){
// 		    				app_collection.update({_id:app_id}, {$set:{"size":0}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			
		    		}
		    	});
		    }
		 });
	}catch(err){
		console.log(err.stack);
		callback(errcode.DB_ERR);
	}
    
}

Mongo.prototype.addBookcaseSize = function(app_id, add_ver_size, callback) {
	try{
// 		console.log("app_id="+app_id);
		this.getBookcaseCollection(function(error, app_collection) {
			//var condition = {'_id':app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    else {
		    	//app_collection.findOne(condition, function(error, result) {
		    	app_collection.findOne({_id:app_id}, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else{
		    			if(!result.size){
		    				//callback(null);
		    				app_collection.update({_id:app_id}, {$set:{"size":add_ver_size}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			else{
// 		    				console.log("result.size="+result.size);
// 		    				console.log("(add_ver_size+result.size)="+(add_ver_size+result.size));
		    				app_collection.update({_id:app_id}, {$set:{"size":(add_ver_size+result.size)}}, {safe:true, upsert:false, multi:false}, function(err){
// 		    				app_collection.update({_id:app_id}, {$set:{"size":0}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			
		    		}
		    	});
		    }
		 });
	}catch(err){
		console.log(err.stack);
		callback(errcode.DB_ERR);
	}
    
}
Mongo.prototype.addGroupSize = function(group_id, add_ver_size, callback) {
	try{
		this.getGroupCollection(function(error, groups){
			//var condition = {'_id':app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    else {
		    	//app_collection.findOne(condition, function(error, result) {
		    	groups.findOne({_id:group_id}, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else{
		    			if(!result.size){
		    				//callback(null);
		    				groups.update({_id:group_id}, {$set:{"size":add_ver_size}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			else{
// 		    				console.log("result.size="+result.size);
// 		    				console.log("(add_ver_size+result.size)="+(add_ver_size+result.size));
		    				groups.update({_id:group_id}, {$set:{"size":(add_ver_size+result.size)}}, {safe:true, upsert:false, multi:false}, function(err){
// 		    				groups.update({_id:group_id}, {$set:{"size":0}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			
		    		}
		    	});
		    }
		 });
	}catch(err){
		console.log(err.stack);
		callback(errcode.DB_ERR);
	}
}
Mongo.prototype.updateGroupSize = function(group_id, old_ver_size, add_ver_size, callback) {
	try{
		this.getGroupCollection(function(error, groups){
			//var condition = {'_id':app_collection.db.bson_serializer.ObjectID.createFromHexString(app_id)};
			if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    else {
		    	//app_collection.findOne(condition, function(error, result) {
		    	groups.findOne({_id:groups.db.bson_serializer.ObjectID.createFromHexString(group_id)}, function(error, result) {
		    		if( error ) {console.log(error);callback(errcode.DB_ERR);}
		    		else{
		    			if(!result.size){
		    				//callback(null);
		    				groups.update({_id:groups.db.bson_serializer.ObjectID.createFromHexString(group_id)}, {$set:{"size":add_ver_size}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			else{
// 		    				console.log("result.size="+result.size);
// 		    				console.log("(add_ver_size+result.size)="+(add_ver_size+result.size));
		    				groups.update({_id:groups.db.bson_serializer.ObjectID.createFromHexString(group_id)}, {$set:{"size":(add_ver_size+result.size-old_ver_size)}}, {safe:true, upsert:false, multi:false}, function(err){
// 		    				groups.update({_id:group_id}, {$set:{"size":0}}, {safe:true, upsert:false, multi:false}, function(err){
// 								console.log("AdCollection updated");
								callback(null);
							});
		    			}
		    			
		    		}
		    	});
		    }
		 });
	}catch(err){
		console.log(err.stack);
		callback(errcode.DB_ERR);
	}
}

Mongo.prototype.createFlagsCollection = function(callback){
  this.db.createCollection('flags', function(error, bc_collection) {
    callback(error,bc_collection); 
  });
}
/**
 * 若在flags這個collection中的size_info_added欄位==1的時候，表示這個server已經計算過舊有的容量了，不再重新計算。
 */
Mongo.prototype.setFlagSizeInfoAdded = function(callback){
  this.db.collection('flags', function(error, users_collection) {
    if( error ) callback(error);
    else{
    	users_collection.findOne({}, function(error, result) {
    		users_collection.update({_id:result._id}, {$set:{"size_info_added":1}}, {safe:true, upsert:false, multi:false}, function(err){
    			callback(err);
    		});
    	});
    }
  });
}
Mongo.prototype.getBuildUserProcArr  = function(callback) {
	this.getBuildUserProcCollection(function(error, collection){
		collection.find({},{}).sort({"proc_id":1}).toArray(function(err, result) {
			callback(err, result);
		});
	});
}
Mongo.prototype.getBuildUserProcMsgArr  = function(user, callback) {
	this.getBuildUserProcMsgCollection(function(error, collection){
		collection.find({"user":user},{}).toArray(function(err, result) {
			callback(err, result);
		});
	});
}

Mongo.prototype.addBuildUserProc  = function(uinfo, type, buildType, proc_id, timestamp, callback) {
	//proc_id= timestamp
	if(type=="ver"){}
	else if (type=="bookcase"){}
	else if(type=="reader"){}
	delete uinfo.pwd;
	delete uinfo.timestampForPwd;
	delete uinfo.updateKey;
	delete uinfo.email;
	var estimateTime = 2;
	var mongoo=this;
	mongoo.getBuildUserProcCollection(function(error, collection){
		mongoo.getBuildUserProcMsgCollection(function(error, msgCollection){
			collection.find({"user":uinfo.user , type:type, buildType:buildType, proc_id: proc_id},{}).toArray(function(err, result) {
			//collection.find({"uinfo.user":uinfo.user},{}).toArray(function(err, result) {
				if(result.length<=0){
					collection.find({},{}).toArray(function(err, allResult) {
						console.log("*** allResult.length="+allResult.length);
						if(allResult.length>0){
							allResultCheck(0);
							function allResultCheck(i){
								console.log("*** allResultCheck("+i+")");
								if(allResult[i].type=="version"){
									mongoo.getVersionById(uinfo, allResult[i].proc_id, function(err, ver){
										if(err || !ver){
											estimateTime+=0.75;
											if(i<(allResult.length-1)){
												allResultCheck(i+1);
											}else{
												insert();
											}
										}else{
											// 估計1.5G封裝10分鐘，空書櫃封裝0.75分鐘
											estimateTime+=0.75+(ver.General_Info.size*2/3)*10/1500;
											if(i<(allResult.length-1)){
												allResultCheck(i+1);
											}else{
												insert();
											}
										}
									});
								}else{
									estimateTime+=0.75;
									if(i<(allResult.length-1)){
										allResultCheck(i+1);
									}else{
										insert();
									}
								}
							}
						}else{
							estimateTime=2;
							insert();
						}
						function insert(){
							collection.insert({uinfo:uinfo, type:type, buildType:buildType, proc_id: proc_id, timestamp:timestamp}, {safe:true}, function(err){
								
								if(err){
									console.log(err);
								}else{
									console.log('addBuildUserProc');
									var waitType =2;
									if(buildType=="enterprise")
										waitType=1;
							
									if(type=="version"){
										mongoo.getVersionsCollection(function(error, ver_collection) {
											var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(proc_id)};
											ver_collection.update({_id:ver_collection.db.bson_serializer.ObjectID.createFromHexString(proc_id)},  {$set:{"General_Info.Waiting":waitType}}, {safe:true, upsert:false, multi:false}, function(err){
												console.log("*** estimateTime="+estimateTime);
												mongoo.getVersionById(uinfo, proc_id, function(err, ver){
													//msgCollection.insert({user:uinfo.user, type:type, buildType:buildType, proc_id: proc_id, name:ver.General_Info.APP_name, verNum:ver.General_Info.Version}, {safe:true}, function(err){
														if(err){
															estimateTime+=0.75;
															callback(err, Math.ceil( estimateTime ));
														}else{
															// 估計1.5G封裝10分鐘，空書櫃封裝0.75分鐘
															estimateTime+=0.75+(ver.General_Info.size)*10/1500;
															console.log("*** estimateTime="+estimateTime);
															console.log("*** estimateTime="+Math.ceil( estimateTime ));
															callback(err, Math.ceil( estimateTime ));
														}
													//});
												});
											});
										});
									}else{
								
										mongoo.getBookcaseCollection(function(error, ver_collection) {
											var condition={'_id':ver_collection.db.bson_serializer.ObjectID.createFromHexString(proc_id)};
											ver_collection.update({_id:ver_collection.db.bson_serializer.ObjectID.createFromHexString(proc_id)},  {$set:{"General_Info.Waiting":waitType}}, {safe:true, upsert:false, multi:false}, function(err){
												console.log("*** estimateTime="+estimateTime);
												mongoo.getBookcaseById(uinfo, proc_id, function(err, ver){
													//msgCollection.insert({user:uinfo.user, type:type, buildType:buildType, proc_id: proc_id, name:ver.General_Info.APP_name}, {safe:true}, function(err){
														console.log("*** estimateTime="+estimateTime);
														// 估計1.5G封裝10分鐘，空書櫃封裝0.75分鐘
														estimateTime+=0.75;
														console.log("*** estimateTime="+estimateTime);
														console.log("*** estimateTime="+Math.ceil( estimateTime ));
														callback(err, Math.ceil( estimateTime ));
													//});
												});
											});
										});
									}
								}
							});
						}
					});
				}else{
					console.log("程序已存在");
					callback(err);
				}
			});
		});
	});
}
Mongo.prototype.removeBuildUserProcMsg  = function(user, callback) {
	this.getBuildUserProcMsgCollection(function(error, collection){
		collection.remove({"user":user},{safe:true, multi:true}, function(err){
			//callback(err, result);
			console.log("remove buildUserProcMsg, user:"+user+", status:"+err);
		});
	});
}




exports.Mongo = Mongo;
