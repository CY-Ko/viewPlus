/**
 * users相關資訊存取操作的module，如登入、註冊等
 */

var errcode = require('../error').error;
var EventEmitter = require('events').EventEmitter;
var config = require('../config').config;
/**
 * lib/super_filter負責在super user(su)未註冊前擋掉所有request，因此super_filter需要監聽su註冊狀態，
 * 當得知su註冊後不再擋掉request。
 * 
 * 聽取狀態透過event emitter，類似design pattern的observer模式。
 */
var userEmitter = new EventEmitter();
var db;
exports = module.exports = function(_db){
	db=_db;
}

function get(val){
  return val==null?'':val;
}
	
exports.prototype.listenToSuperUserStatus = function(listener){
	userEmitter.on('super', listener);
} 

function _emitEvent(tag, msg){
	userEmitter.emit(tag, msg);
}	
	
/**
 * 檢查是否已設super user
 */
exports.prototype.isSuperUserSet = function(callback){
    console.log('is super set');
    db.isSuperUserSet(callback);
}

exports.prototype.showRegisterPage = function(req, res){
    showRegisterPage(res, '');
}

function showRegisterPage(res, registerErr){
     db.listGroupNames(function(err, groups){
            res.render('registerPage', {groups:groups, registerErr:registerErr});
    });    
}

function showLoginPage(res, result, registerErr){
        res.render('loginPage', {result:result});
}

exports.prototype.showRegisterSuperPage = function(req, res){
    res.render('registerSuper', { title: '註冊系統管理者', registerErr:''});
}

function _register(req, res, isSuper){
	  console.log('register');
	  var files = req.files;
	  var fields = req.body;
      
	  
	  //the data inserted into db. include uid/pwd & ios publication information
	  var userData = {
	  		user:get(fields['name']),
	  		pwd: get(fields['pwd']),  
	  		company: get(fields['company']), 
	  		position: get(fields['position']), 
	  		phone: get(fields['phone']), 
	  		cellPhone: get(fields['cellPhone']),
	  		email: get(fields['email']),
	    	super: isSuper,
	    	uploadContantPerm: isSuper
	  };
                             
      addUser();

      function addUser(group){
        db.addUser(userData, function(error, uinfo){
	        if(error){
	            console.log(error);
				//res.redirect('/login.html');
                var msg='使用者已存在';
                showRegisterPage(res, msg);
//				res.render('loginPage', {title:'註冊',result:'使用者已存在', registerErr:'使用者已存在'});
	        }else{
	            //如果是註冊super user，發送event通知其他模組super user已註冊
	            if(isSuper){
    	            _emitEvent('super', true);
                    onLoginSuccess(req, res, uinfo, true);   
	            }else{
                    db.beManagerByDefault(uinfo, group, function(e){
                    	if(e)
                    		if(e=="SetAdmin")
                    			uinfo.createAppPerm=true;
                        onLoginSuccess(req, res, uinfo); 
                    });
	            }
	        }
	   });	          
    }
}	


/** 
 * 取得使用者資料資料
 */
exports.prototype.listUsers = function(req, res){
    if(!req.session.uinfo.user){
        res.end(JSON.stringify({result:errcode.NOT_LOGIN}));
        return;
    }else if(!req.session.uinfo.super && !req.session.uinfo.createAppPerm){
        res.end(JSON.stringify({result:errcode.CREATE_APP_PERMISSION}));
        return;
    }
    
    db.getUsers(function(err, data){
        if(err){
            res.end(JSON.stringify({result:err}));
        }else{
            res.end(JSON.stringify({result:0, users:data}));
        }
    });
}


function onLoginSuccess(req, res, uinfo, config){
    delete req.session.uinfo;
    req.session.uinfo=uinfo;
    if(!req.session.uinfo.group)
        req.session.uinfo.group={};
    db.isGroupManager(req.session.uinfo, function(err, group){
        if(err || !group){
        	console.log(" !!!! false");
            req.session.uinfo.group.manager=false;
        }else{
        	console.log(" !!!! true");
            req.session.uinfo.group.manager=true;
            req.session.uinfo.createAppPerm=true;
        }
        if(config)
            res.redirect('/config/index');
        else
            res.redirect('/index');
    })
}	
/**
 * 註冊使用者
 * 1. 呼叫mongohelper.addUser把使用者data存入db
 * 2. 成功direct到/apps.html，否則導到登入頁/login.html    
 */
exports.prototype.register = function(req, res){
	_register(req, res, false);
}

/**
 * 註冊super user    
 */
exports.prototype.registerSuperUser = function(req, res){
	_register(req, res, true);
}	



/**
 * 1.呼叫mongohelper.login檢查登入資料。
 * 2.mongohelper.login callback，成功direct到/apps.html，否則導到登入頁/login.html    
 */
exports.prototype.login = function(req, res){
	console.log('login3');
	var files = req.files;
	var fields = req.body;

    var data = {user:get(fields['user']), pwd: get(fields['pwd'])};
    db.login(data.user, data.pwd, function(error, uinfo){
      if(error){
        console.log(error);
        //res.redirect('/login.html');
        showLoginPage(res, '錯誤的帳號/密碼', '');
//        db.listGroupNames(function(err, groups){
//            res.render('loginPage', {result:'錯誤的帳號/密碼', groups:groups, registerErr:''});
//        });
      }else if(!uinfo.super){
        onLoginSuccess(req, res, uinfo);
      }else{
      	onLoginSuccess(req, res, uinfo, true);
      }
    });
}

/**
 * 登出 (刪除session)
 */
exports.prototype.logout = function(req, res){
  if(req.session.uinfo){
    console.log('logout:'+req.session.uinfo.user);
    delete req.session.uinfo;
  }else{
    console.log('logout error:not logged in');
  }
  //res.redirect('http://'+config.getServerUrl());
	res.redirect('/home');
}

/** 
 * 查詢email
 */
exports.prototype.confirmEmail = function(req, res){
	console.log("123");
	console.log("req.params.user_id="+req.params.user_id);
    db.getUser(req.params.user_id, function(err, data){
        if(err){
        	console.log("err")
            res.end(JSON.stringify({result:err}));
        }else{
        
        	if(data!=""){
        		console.log("有data");
        		res.end(JSON.stringify({result:0, user:data[0].email}));
        	}else{
        		console.log("沒data");
        		db.getUserByEmail(req.params.user_id, function(err, data2){
					if(data2=="")
						res.end(JSON.stringify({result:1, user:null}));
					else
						res.end(JSON.stringify({result:0, user:data2[0].email}));
        		});
        	}
        }
    });
}
/** 
 * 查詢email
 */
exports.prototype.sendEmail = function(req, res){
    db.getUser(req.params.user, function(err, data){
        if(err){
            res.end(JSON.stringify({result:err}));
        }else{
            res.end(JSON.stringify({result:0, user:data}));
        }
    });
}

/**
 * 更新使用者資料
 **/
 exports.prototype.updateSetting= function(req, res){
 
 	var email = "";
 	var pwd = req.body.pwd;
 	var user="";
 	var timestamp=""
 	var currentTimestamp=Date.now();
 	var updateKey="";
 	var oldPwd="";
 	if(req.session.uinfo){
 		console.log(req.session.uinfo.user);
 		user=req.session.uinfo.user;
 		email = req.body.email;
 		oldPwd = req.body.oldPwd;
 	}
 	if(req.params.timestamp){
 		console.log(req.params.timestamp);
 		timestamp=req.params.timestamp;
 		user = req.body.user;
 	}
 	//var user = req.session.uinfo.user;
 	console.log("****** updateSetting");
 	console.log("email="+email);
 	console.log("pwd="+pwd);
 	console.log("timestamp="+timestamp);
 	console.log("timestamp="+timestamp);
 	if(timestamp==""){
 		db.getUser(user, function(err, data){
			if(err){
				res.end(JSON.stringify({result:err}));
			}else{
				if(data[0].pwd==oldPwd){
					db.updateUser({"user":user},  {$set:{"email":email, "pwd":pwd}}, function(err){
						if(err){
							console.log("err")
							res.end(JSON.stringify({result:err}));
						}else{
							res.end(JSON.stringify({result:0}));
						}
					});
				}else{
					res.end(JSON.stringify({result:errcode.INVALID_PWD}));
				}
			}
		});
 	
 	
 	

 	}else{
 		console.log("pwd ="+pwd);
 		db.getUser(user, function(err, data){
			if(err){
				res.end(JSON.stringify({result:err}));
			}else{
				if(data=="")
					res.end(JSON.stringify({result:1}));
				else{
					updateKey=req.body.updateKey;
					
					if(currentTimestamp-timestamp>1800000){ //必須半小時內修改完成
						console.log("UPDATE_TIMEOUT")
						res.end(JSON.stringify({result:errcode.UPDATE_TIMEOUT}));
					}else{
						if(updateKey==data[0].updateKey){
							db.updateUser({"user":user},  {$set:{"pwd":pwd}}, function(err){
								if(err){
									console.log("DBERROR")
									res.end(JSON.stringify({result:errcode.DB_ERR}));
								}else{
									res.end(JSON.stringify({result:0}));
								}
							});
						}else{
							res.end(JSON.stringify({result:errcode.DB_ERR}));
						}
					}
				}
			}
		});
 	}
}

/**
 * 設定使用者資料頁面
 **/
exports.prototype.accountSettingPage = function(req, res){
	if(!req.session.uinfo.user){res.redirect('/login');return;}
	console.log("req.session.uinfo.user="+req.session.uinfo.user);
    db.getUser(req.session.uinfo.user, function(error, results){
		if(error || !results || results.length==0){
			console.log(error);
			callback(error);
		}else{
			res.render('userAcntSettings', { title: '帳號設定', user:results[0]});    
		}
	});
}

/**
 * 設定使用者密碼頁面  /user/pwdSetting/:user/:timestamp/:key
 **/
 
exports.prototype.pwdSettingPage = function(req, res){
	var user=req.params.user;
	var currentTimestamp=Date.now();
	console.log(currentTimestamp);
	var timestamp=req.params.timestamp;
	var key=req.params.key; 
    db.getUser(user, function(error, results){
		if(error || !results || results.length==0){
			console.log(error);
			res.redirect('/login');
		}else{
			if(results[0].updateKey){
				console.log("有key");
				if(results[0].updateKey==key){
					console.log("key對");
					if(currentTimestamp-timestamp>900000){ //必須15分鐘內按下
						console.log("UPDATE_TIMEOUT")
						//res.end(JSON.stringify({result:errcode.UPDATE_TIMEOUT}));
					}else{
						console.log("UPDATE_TIME IN !!")
						res.render('updatePwdPage', { title: '帳號', user:results[0], timestamp:timestamp, updateKey:results[0].updateKey, result:''});    
						//res.render('loginPage', {title:'登入', result:''});
					}
				}else{
					res.redirect('/login');
				}
			}
			else{
				res.redirect('/login');
			}
			//res.render('userAcntSettings', { title: '帳號設定', user:results[0]});    
		}
	});
}

