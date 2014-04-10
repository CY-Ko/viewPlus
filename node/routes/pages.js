/**
 * pages相關資訊存取操作jade view
 */
var config = require('../config').config;
var querystring = require('querystring');
var url = require('url');
var path = require('path');
var mime = require('mime');
var errcode = require('../error').error;
var EventEmitter = require('events').EventEmitter;
//var fs = require('fs');
var fs = require('fs-extra');
var xml2js = require('xml2js');
var db;
var exec=require('child_process').exec;

exports = module.exports = function(_db){
	db=_db;
}

function get(val){
  return val==null?'':val;
}

var dbgetter = new (require('./getter'))(db);


/* New Interface Block START */


/**
 * 首頁。有登入回傳/apps.html，沒登入回傳/login.html (in public folder)
 */

exports.prototype.pushTest = function(req, res){
	if(req.session.uinfo.user) {
		
 		//console.log('get apps, uid:'+req.session.uinfo.user);

  		//db.getApps(req.session.uinfo, function(error, app_collection){
    		//res.render('PushApply', {title:'Push apply', ver:{_id:'test123456', Features: {enable_link:'enableTest'}}, data:{_id:'data54532'}});
    		res.render('PushApply', {title:'Push apply'});
  		//}, req.session.cur_app);

	}
	else
		res.redirect('/login');
	
};


exports.prototype.index = function(req, res){
	if(req.session.uinfo.super){
		res.redirect('/config/index');return;
	}else if(req.session.uinfo.user) {
 		console.log('get apps, uid:'+req.session.uinfo.user);
  		db.getApps(req.session.uinfo, function(error, app_collection){
  			console.log(" page/index uinfo="+JSON.stringify(req.session.uinfo));
  			console.log(" page/index uinfo="+req.session.uinfo.group.manager);
  			
    		res.render('apps', {uinfo: req.session.uinfo, title:'全部APP', apps: app_collection});
  		}, req.session.cur_app);
	}
	else{
		console.log('res 2 loginPage');
        res.redirect('/login');return;
	}
};

exports.prototype.loginPage = function(req, res){
	console.log('res 2 loginPage 2');
	res.render('loginPage', {title:'登入', result:''});
};

/**
 * addAppPage
 */


//exports.prototype.addAppPage = function(req, res){
//	if(req.session.uinfo.user) {
// 		console.log('addApp Page, uid:'+req.session.uinfo.user);
//   		res.render('addAppPage', {title:'新增APP'});
//	}
//	else
//		res.redirect('/login.html');
//	
//};
exports.prototype.addAppPage = function(req, res){
	if(req.session.uinfo.user) {
        var uinfo = req.session.uinfo;
        if(!uinfo.super && !uinfo.createAppPerm && !uinfo.group.manager){
            res.render('forbidden', {title:'新增APP'});
            return;
        }
 		db.getCategories(function(err, categories){
     	    if(err){
                res.redirect('/index');
     	    }else{
     	    	db.getPlatformInfo(function(err, platform){
					if(err){
						res.redirect('/index');
					}
					else{
						if(!platform){
							platform={uinfo:req.session.uinfo, companyChinese:'temp', companyEnglish:'temp', companyAcrony:'temp'};    
							db.updatePlatformInfo(platform, function(error) {
								if(error && error==errcode.NOT_LOGIN)
									res.redirect('/index');
								//else
									//res.redirect('/config/index');
							});
						}
						var groupId=req.params.groupId?req.params.groupId:req.session.uinfo.group.id;
						var tempUser = req.session.uinfo;
						//temporarily no need to check group manager permission here
						//tempUser.group.manager = true;
						db.getGroupById(tempUser, groupId, function(err2, group){
							if(err2){
								showError(res, '頁面錯誤', '錯誤代碼:'+err2, req.session.uinfo);
								return;
							}
							if(!group){
								showError(res, '頁面錯誤', '群組有誤!', req.session.uinfo);
								return;
							}
							db.getGoogleApiConfig(function(err, conf){
								if(err){
									showError(res, '頁面錯誤', '錯誤代碼:'+err, req.session.uinfo);
									return;
								}
								if(!conf)
									conf={GoogleId:'', GoogleApiKey:'', AndroidKey:'', groups:[]};
								//console.log("conf.groups.length="+JSON.stringify(conf[0].groups[0]));
								fs.stat(config.getIosCertPath(), function(err, stat) {
									var csrExist;
									if(err || !stat || stat.size==0){
										//csr檔不存在
										csrExist=false;  
									}else{
										csrExist=true;
									}
									console.log("**** android mode ="+config.getAndroidMode());
									console.log("**** adMode mode ="+config.getAdMode());
									console.log("**** pushMode mode ="+config.getPushMode());
									console.log("**** bookshelfMode mode ="+config.getBookshelfMode());
									res.render('addAppPage', {title:'新增APP', categories:categories, platform:platform, uinfo:uinfo, group:group, currents:conf,csrExist:csrExist, androidMode:config.getAndroidMode() });
								});
							});
						});
					}
				});
     	    }
 		});
	}
	else
		res.redirect('/login');
};
function showError(res, title, msg, uinfo){
    res.render('addAppError', {title:title, successMsg:'', errorMsg:msg, uinfo:uinfo});
}
function temp(){
	 if(!req.session.uinfo || (!req.session.uinfo.super && !req.session.uinfo.group.manager)){
        showForbidden(res, '管理群組成員', req.session.uinfo);
        return;
    }
    var groupId=req.params.groupId?req.params.groupId:req.session.uinfo.group.id;
    db.getGroupById(req.session.uinfo, groupId, function(err, group){
        if(err){
            showError(res, '頁面錯誤', '錯誤代碼:'+err, req.session.uinfo);
            return;
        }
        if(!group){
            showError(res, '頁面錯誤', '群組有誤!', req.session.uinfo);
            return;
        }
        db.listGroupUsers(req.session.uinfo, groupId, function(err, users){
            if(req.session.uinfo.super){//for super user
                res.render('configGroupMembers', { title: '管理群組成員', parent:{href:'/config/group/show',text:'群組管理'}, current:{manager:group.manager}, group:group, users:users, msg:''});    
            }else{//for group manager
                res.render('configGroupMembers_manager', { title: '管理群組成員', current:{manager:group.manager}, group:group, users:users, msg:''});    
            }
        });
    });
}

/*
				db.listIosAccounts(req.session.uinfo, function(err, accounts){
					if(err){
						showError(res, '管理iOS帳號頁面錯誤', '錯誤代碼:'+err, req.session.uinfo);
						return;
					}
					db.getPlatformInfo(function(err, platform){
						if(err){
							showError(res, '設定錯誤', '錯誤代碼:'+err, req.session.uinfo);
							return;
						}
						if(!platform){
							platform={uinfo:req.session.uinfo, companyChinese:'temp', companyEnglish:'temp', companyAcrony:'temp'};    
							db.updatePlatformInfo(platform, function(error) {
								if(error && error==errcode.NOT_LOGIN)
									res.redirect('/');
								//else
									//res.redirect('/config/index');
							});
						}
						res.render('configIndex', {title:'平台資訊', current:conf,accounts:accounts,platform:platform, successMsg:'', failMsg:''}); 
					});		
				});				
*/



exports.prototype.showPushFbEnabler_beta = function(req, res){
	if(req.session.uinfo.user) {
 		console.log('addApp Page beta, uid:'+req.session.uinfo.user);
   		res.render('showPushFbEnabler_beta', {title:'APP設定'});
	}
	else
		res.redirect('/login');
};

exports.prototype.appSettings = function(req, res){
    if(req.session.uinfo.user) {
    	var uinfo = req.session.uinfo;
        if(!uinfo.super && !uinfo.createAppPerm && !uinfo.group.manager){
            res.render('forbidden', {title:'新增APP'});
            return;
        }
        db.getAppById(req.session.uinfo, req.params.appId, function(err, app){
            fs.stat(config.getIosCertPath(), function(err, stat) {
                var csrExist;
                if(err || !stat || stat.size==0){
                    //csr檔不存在
                    csrExist=false;  
                }else{
                    csrExist=true;
                }
                
                fs.stat(config.getAppDir(req.params.appId)+'/pvp.mobileprovision', function(provErr, provStat){
                	fs.stat(config.getAppDir(req.params.appId)+'/aps_production.cer', function(err, stat){
						fs.stat(config.getAppDir(req.params.appId)+'/official_aps_production.cer', function(err2, stat2){
							fs.stat(config.getAppDir(req.params.appId)+'/DEMO_private_prod_key.pem', function(err3, pemStat){
								var provExist;
								var permExist;
								var permOfficialExist;
								var pushPemExist;
								if(provErr || !provStat || provStat.size==0){
									provExist=false;
								}else{
									provExist=true;
								}
								if(err || !stat || stat.size==0){
									//perm檔不存在
									permExist=false;  
								}else{
									permExist=true;
								}
								if(err2 || !stat2 || stat2.size==0){
									//perm檔不存在
									permOfficialExist=false;  
								}else{
									permOfficialExist=true;
								}
								if(err3 || !pemStat || pemStat.size==0){
									pushPemExist=false;
								}else{
									pushPemExist=true;
								}
								db.getCategories(function(err, categories){
									if(err){
										res.redirect('/index');
									}else{
										db.getPlatformInfo(function(err, platform){
											if(err){
												res.redirect('/index');
											}
											else{
												if(!platform){
													platform={uinfo:req.session.uinfo, companyChinese:'temp', companyEnglish:'temp', companyAcrony:'temp'};    
													db.updatePlatformInfo(platform, function(error) {
														if(error && error==errcode.NOT_LOGIN)
															res.redirect('/index');
														//else
															//res.redirect('/config/index');
													});
												}
												var groupId=req.params.groupId?req.params.groupId:req.session.uinfo.group.id;
												db.getGroupById(req.session.uinfo, groupId, function(err2, group){
													if(err2){
														showError(res, '頁面錯誤', '錯誤代碼:'+err2, req.session.uinfo);
														return;
													}
													if(!group){
														showError(res, '頁面錯誤', '群組有誤!', req.session.uinfo);
														return;
													}
													//console.log('###'+group.iosAccount.ADCaccountID)
													//res.render('addAppPage', {title:'新增APP', categories:categories, platform:platform, uinfo:uinfo, group:group });
													db.getGoogleApiConfig(function(err, conf){
														if(err){
															showError(res, '頁面錯誤', '錯誤代碼:'+err, req.session.uinfo);
															return;
														}
														if(!conf)
															conf={GoogleId:'', GoogleApiKey:'', AndroidKey:'', account:'', pwd:''};
														console.log("### conf="+conf);
		// 												fs.stat(config.getIosCertPath(), function(err, stat) {
		// 													var csrExist;
		// 													if(err || !stat || stat.size==0){
		// 														//csr檔不存在
		// 														csrExist=false;  
		// 													}else{
		// 														csrExist=true;
		// 													}
		// 													res.render('addAppPage', {title:'新增APP', categories:categories, platform:platform, uinfo:uinfo, group:group, currents:conf,csrExist:csrExist });
		// 												});
														if(group.iosAccount){
															db.getIosAccountById(group.iosAccount.id, function(err3, iosAcnt){
																if(err3){
																	showError(res, '頁面錯誤', '錯誤代碼:'+err2, req.session.uinfo);
																	return;
																}
																if(!iosAcnt){
																	showError(res, '頁面錯誤', 'iOS帳號有誤!', req.session.uinfo);
																	return;
																}
																var editors = !app.user||!app.user.length?[]:app.user;
																if(!uinfo.group || !app.Group){
																	db.listGroupUsers(uinfo, app.Group.id, function(err, users){
																	var editors = !app.user||!app.user.length?[]:app.user;
																		res.render('appSettings', {title:'APP設定',  editors:editors, users:users, csrExist:csrExist, permOfficialExist:permOfficialExist, permExist:permExist, provExist:provExist, pushPemExist:pushPemExist, currents:conf, app:app,categories:categories, platform:platform, uinfo:uinfo, group:group, iosAcnt:iosAcnt, parent:{href:'/manageApp/viewApp/'+app._id, text:app.APP_name}});    
																		//res.render('configBookcaseEditors', {title:'設定APP編輯者', app:app, editors: editors, users:users, uinfo:req.session.uinfo, parent:{href:'/manageApp/viewApp/'+app._id, text:app.APP_name}}); 
																	});
																}else{
																	//var editors = !app.user||!app.user.length?[]:app.user;
			
																	console.log('????'+editors);
																	db.listGroupUsers(uinfo, app.Group.id, function(err, users){
																	//bookcase.listGroupUsersNotIn(uinfo, app.General_Info.Group.id, app.General_Info.User, function(err, users){
																		console.log("*** pushMod="+config.getPushMode());
																		res.render('appSettings', {title:'APP設定',  editors:editors, users:users, csrExist:csrExist, permOfficialExist:permOfficialExist, permExist:permExist, provExist:provExist, pushPemExist:pushPemExist, currents:conf, app:app,categories:categories, pushMode:config.getPushMode(), platform:platform, uinfo:uinfo, group:group, iosAcnt:iosAcnt, parent:{href:'/manageApp/viewApp/'+app._id, text:app.APP_name}});    
																		//res.render('configAppEditors', {title:'設定APP編輯者', app:app, editors:editors, users:users, uinfo:req.session.uinfo, parent:{href:'/manageApp/viewApp/'+app._id, text:app.APP_name}}); 
																	});
																}
																
															});
														}else{
															showError(res, '頁面錯誤', 'iOS帳號有誤!', req.session.uinfo);
															return;
														}
													});
											
											
												});
											}
										});
									}
								});
							});
						});
						//res.render('appSettings', {title:'APP設定', csrExist:csrExist, permExist:permExist, app:app, parent:{href:'/manageApp/viewApp/'+app._id, text:app.APP_name}});    
                	});
                });
                
                
            });
            
        });
	}
	else{
		res.redirect('/login');
	}
};
exports.prototype.appOfficialSettings = function(req, res){
    if(req.session.uinfo.user) {
    	var uinfo = req.session.uinfo;
        if(!uinfo.super && !uinfo.createAppPerm && !uinfo.group.manager){
            res.render('forbidden', {title:'新增APP'});
            return;
        }
        db.getAppById(req.session.uinfo, req.params.appId, function(err, app){
            fs.stat(config.getIosCertPath(), function(err, stat) {
                var csrExist;
                if(err || !stat || stat.size==0){
                    //csr檔不存在
                    csrExist=false;  
                }else{
                    csrExist=true;
                }
                
                fs.stat(config.getAppDir(req.params.appId)+'/opvp.mobileprovision', function(err, provStat){
                	fs.stat(config.getAppDir(req.params.appId)+'/official_aps_production.cer', function(err2, cerStat){
                		fs.stat(config.getAppDir(req.params.appId)+'/official_private_prod_key.pem', function(err3, pemStat){
							var provOfficialExist;
							var cerOfficialExist;
							var pushPemOfficialExist;
							if(err || !provStat || provStat.size==0){
								//provision profile檔不存在
								provOfficialExist=false;  
							}else{
								provOfficialExist=true;
							}
							if(err2 || !cerStat || cerStat.size==0){
								//推播憑證檔不存在
								cerOfficialExist=false;  
							}else{
								cerOfficialExist=true;
							}
							if(err || !pemStat || pemStat.size==0){
								//製作出來pem檔不存在
								pushPemOfficialExist=false;  
							}else{
								pushPemOfficialExist=true;
							}
							db.getCategories(function(err, categories){
								if(err){
									res.redirect('/index');
								}else{
									db.getPlatformInfo(function(err, platform){
										if(err){
											res.redirect('/index');
										}
										else{
											if(!platform){
												platform={uinfo:req.session.uinfo, companyChinese:'temp', companyEnglish:'temp', companyAcrony:'temp'};    
												db.updatePlatformInfo(platform, function(error) {
													if(error && error==errcode.NOT_LOGIN)
														res.redirect('/index');
													//else
														//res.redirect('/config/index');
												});
											}
											var groupId=req.params.groupId?req.params.groupId:req.session.uinfo.group.id;
											db.getGroupById(req.session.uinfo, groupId, function(err2, group){
												if(err2){
													showError(res, '頁面錯誤', '錯誤代碼:'+err2, req.session.uinfo);
													return;
												}
												if(!group){
													showError(res, '頁面錯誤', '群組有誤!', req.session.uinfo);
													return;
												}
												//console.log('###'+group.iosAccount.ADCaccountID)
												//res.render('addAppPage', {title:'新增APP', categories:categories, platform:platform, uinfo:uinfo, group:group });
												db.getGoogleApiConfig(function(err, conf){
													if(err){
														showError(res, '頁面錯誤', '錯誤代碼:'+err, req.session.uinfo);
														return;
													}
													if(!conf)
														conf={GoogleId:'', GoogleApiKey:'', AndroidKey:'', account:'', pwd:''};
													if(group.iosAccount){
														db.getIosAccountById(group.iosAccount.id, function(err3, iosAcnt){
															if(err3){
																showError(res, '頁面錯誤', '錯誤代碼:'+err2, req.session.uinfo);
																return;
															}
															if(!iosAcnt){
																showError(res, '頁面錯誤', 'iOS帳號有誤!', req.session.uinfo);
																return;
															}
															db.getVersions(req.session.uinfo, req.params.appId, false, function(error, version_data){
																if(error){
																	showError(res, '頁面錯誤', '錯誤代碼:'+err2, req.session.uinfo);
																	return;
																}
															
																db.listIosAccounts(req.session.uinfo, function(err, accounts){
																	if(err){
																		showError(res, '管理iOS帳號頁面錯誤', '錯誤代碼:'+err, req.session.uinfo);
																		return;
																	}
																	db.queryReaders({bookcase:{$ne:1}}, function(err, readers){
																		var androidReaders=[], iosReaders=[];
																		if(!err && readers && readers.length>0){
																			for(var i=0;i<readers.length;i++){
																				if(readers[i].os=='android'){
																					androidReaders.push(readers[i]);
																				}else{
																					iosReaders.push(readers[i]);
																				}
																			}
																		}
																		if(req.params.verId)
																			res.render('appOfficialSettings', {title:'上架版APP設定', pushPemOfficialExist:pushPemOfficialExist, provOfficialExist:provOfficialExist, cerOfficialExist:cerOfficialExist, pushMode:config.getPushMode(), currents:conf, app:app, versions: version_data, thisVer: req.params.verId, readers:readers, categories:categories, platform:platform, uinfo:uinfo, group:group, iosAcnt:iosAcnt, allIosAcnt:accounts, parent:{href:'/manageApp/viewApp/'+req.params.appId, text:app.APP_name}});    
																		else
																			res.render('appOfficialSettings', {title:'上架版APP設定', pushPemOfficialExist:pushPemOfficialExist, provOfficialExist:provOfficialExist, cerOfficialExist:cerOfficialExist, pushMode:config.getPushMode(), currents:conf, app:app, versions: version_data, readers:readers, categories:categories, platform:platform, uinfo:uinfo, group:group, iosAcnt:iosAcnt, allIosAcnt:accounts, parent:{href:'/manageApp/viewApp/'+req.params.appId, text:app.APP_name}});    
																	});
																	
																});	
															});	
														});
													}else{
														showError(res, '頁面錯誤', 'iOS帳號有誤!', req.session.uinfo);
														return;
													}
												});
											
											
											});
										}
									});
								}
							});
						});
                    });
                    //res.render('appSettings', {title:'APP設定', csrExist:csrExist, permExist:permExist, app:app, parent:{href:'/manageApp/viewApp/'+app._id, text:app.APP_name}});    
                });
            });
            
        });
	}
	else{
		res.redirect('/login');
	}
};
/*
					db.getPlatformInfo(function(err, platform){
						if(err){
							res.redirect('/');
						}
						else{
							if(!platform){
								platform={uinfo:req.session.uinfo, companyChinese:'temp', companyEnglish:'temp', companyAcrony:'temp'};    
								db.updatePlatformInfo(platform, function(error) {
									if(error && error==errcode.NOT_LOGIN)
										res.redirect('/');
									//else
										//res.redirect('/config/index');
								});
							}
							var groupId=req.params.groupId?req.params.groupId:req.session.uinfo.group.id;
							db.getGroupById(req.session.uinfo, groupId, function(err2, group){
								if(err2){
									showError(res, '頁面錯誤', '錯誤代碼:'+err2, req.session.uinfo);
									return;
								}
								if(!group){
									showError(res, '頁面錯誤', '群組有誤!', req.session.uinfo);
									return;
								}
								//console.log('###'+group.iosAccount.ADCaccountID)
								res.render('addAppPage', {title:'新增APP', categories:categories, platform:platform, uinfo:uinfo, group:group });
							});
						}
					});
*/


exports.prototype.buildVersion = function(req, res){
	console.log('#################### buildVersion in pages.js')
    if(req.session.uinfo.user) {
        db.getVersionById(req.session.uinfo, req.params.verId, function(err, ver){
            if(err || !ver){
                res.redirect('/index');
            }else{
                res.render('buildStatus', {title:'APP打包', appId:ver.General_Info.APP_id, verId:req.params.verId});
            }
        });
    }
	else{
		res.redirect('/login');
	}
};

/**
 * addVersionPage
 */


exports.prototype.addVersionPage = function(req, res){
	if(req.session.uinfo.user) {
 		console.log('addVersion Page, uid:'+req.session.uinfo.user);
		//console.log(req.params.app_id);
		var timestamp =new Date().getTime();
  		db.getApps(req.session.uinfo, function(error, app_collection){
			res.render('addVersionPage', {uinfo:req.session.uinfo.user, title:'新增版本',timestamp:timestamp, app_id: null, apps: app_collection});
  		}, req.session.cur_app);
   		
	}
	else
		res.redirect('/login');
	
};

/**
 * addAppVersionPage
 */


exports.prototype.addAppVersionPage = function(req, res){
	if(req.session.uinfo.user) {
        db.getAppById(req.session.uinfo, req.params.app_id, function(err, app){
            console.log('addVersion Page, uid:'+req.session.uinfo.user);
            db.queryReaders({bookcase:{$ne:1}}, function(err, readers){
                var androidReaders=[], iosReaders=[];
                if(!err && readers && readers.length>0){
                    for(var i=0;i<readers.length;i++){
                        if(readers[i].os=='android'){
                            androidReaders.push(readers[i]);
                        }else{
                            iosReaders.push(readers[i]);
                        }
                    }
                }
                var timestamp =new Date().getTime();
                console.log("serverUrl="+config.getServerUrl());
                res.render('addAppVersionPage_demo', {uinfo:req.session.uinfo, androidReaders:androidReaders, serverUrl:config.getServerUrl(), dataDir: config.getDataDir(), timestamp:timestamp, iosReaders:iosReaders, title:'新增版本', app:app, app_id: req.params.app_id, parent:{href:'/manageApp/viewApp/'+app._id, text:app.APP_name}});        
            	//res.render('jqueryUpload', {});
            });
        });
	}
	else
		res.redirect('/login');
	
};
//檢查是否有人正在封裝落版
exports.prototype.setVerOccupied = function(req, res){
	if(req.session.uinfo.user) {
		db.setVersionBuilding(req.session.uinfo, req.params.ver_id, function(err){
			if(!err)
				res.end(JSON.stringify({result:0}));
			else
				res.end(JSON.stringify({result:1}));
		});
	}
	else
		res.end(JSON.stringify({result:1}));
};
exports.prototype.setVerNonOccupied = function(req, res){
	if(req.session.uinfo.user) {
		db.setVersionNone(req.session.uinfo, req.params.ver_id, function(err){
			if(!err)
				res.end(JSON.stringify({result:0}));
			else
				res.end(JSON.stringify({result:1}));
		});
	}
	else
		res.end(JSON.stringify({result:1}));
};
exports.prototype.setVerNonOccupiedByGet = function(req, res){
	if(req.session.uinfo.user) {
		db.setVersionNone(req.session.uinfo, req.params.ver_id, function(err){
			res.redirect('/manageApp/viewApp/'+req.params.app_id);
		});
	}
	else
		res.end(JSON.stringify({result:1}));
};
exports.prototype.setVerEnterprise = function(req, res){
	if(req.session.uinfo.user) {
		db.setVersionEnterprise(req.session.uinfo, req.params.ver_id, function(err){
			if(!err)
				res.end(JSON.stringify({result:0}));
			else
				res.end(JSON.stringify({result:1}));
		});
	}
	else
		res.end(JSON.stringify({result:1}));
};
exports.prototype.setVerOfficial = function(req, res){
	if(req.session.uinfo.user) {
		if(req.params.app_id){ //TODO
			//db.updateVersion({"General_Info.APP_id":req.params.app_id}, {$set:{'General_Info.OfficialBuilded':0, 'General_Info.official':0}}, {safe:true, multi:true}, function(err){
				 db.setVersionOfficial(req.session.uinfo, req.params.ver_id, function(err){
					if(!err)
						res.end(JSON.stringify({result:0}));
					else
						res.end(JSON.stringify({result:1}));
				});
			//});
		}else{
			db.setVersionOfficial(req.session.uinfo, req.params.ver_id, function(err){
				if(!err)
					res.end(JSON.stringify({result:0}));
				else
					res.end(JSON.stringify({result:1}));
			});
		}
	}
	else
		res.end(JSON.stringify({result:1}));
};

exports.prototype.checkVerOccupied = function(req, res){
	if(req.session.uinfo.user) {
		db.getVersionById(req.session.uinfo, req.params.ver_id, function(err, ver){
			if(ver.General_Info.BuildType){
				if(ver.General_Info.BuildType=="none"){
					res.end(JSON.stringify({result:"0"}));
				}
				else{
					res.end(JSON.stringify({result:"1"}));
				}
			}
			else{
				res.end(JSON.stringify({result:"0"}));
			}
		});
	}
	else
		res.end(JSON.stringify({result:"1"}));
};
function copyDir(fromDir, toDir, callback) {
	console.log('fromDir: '+ fromDir);
	console.log('toDir: '+ toDir);

	fs.copy(fromDir, toDir, function (err) {
	  if (err) {
		console.error(err);
	  } else {
		console.log("success!");
		callback();
	  }
	}); //copies directory, even if it has subdirectories or files
}
exports.prototype.editAppVersionPage = function(req, res){
	goToEditAppVersionPage("Enterprise",req,res,"version");
};
exports.prototype.editOfficialAppVersionPage = function(req, res){
	goToEditAppVersionPage("Official",req,res,"version");
};
exports.prototype.editBookVerPage = function(req, res){
	goToEditAppVersionPage("Enterprise",req,res,"bookVersion");
};
function goToEditAppVersionPage(type, req, res, editType){
	var BookPath="";
	var contentType;
	if(req.session.uinfo.user) {
		if(editType=="version"){		
			db.getVersionById(req.session.uinfo, req.params.ver_id, function(err, ver){
				if(err) {
					res.status(404).send('Error: '+ err);
					return;
				}
				if(!ver) {
					res.status(404).send('Version Not found');
					return;
				}
				var editType="version";
				afterGetId(err, ver, editType);
			});
        }
        else{
			db.getBookVersionById(req.session.uinfo, req.params.ver_id, function(err, ver){
				db.getBookById(req.session.uinfo, ver.bookId, function(error, book){
					db.getBookcaseById(req.session.uinfo, book.bookcaseId, function(error, bc){
						contentType = bc.General_Info.contentType;
						var editType="bookver";
						console.log("ver.bookPath.length="+ver.bookPath.length);
						console.log(ver.bookPath);
						var PathArr =ver.bookPath.split("/");
						for(var i=0;i<(PathArr.length-2);i++){
							BookPath+=PathArr[i]+"/";
						}
						BookPath=BookPath.substr(0,BookPath.length-1);
						console.log(BookPath);
						afterGetId(err, ver, editType);
					});
				});
			});
        }
        function afterGetId(err, ver, editType){
        	db.queryReaders({bookcase:{$ne:1}}, function(err, readers){
                var androidReaders=[], iosReaders=[];
                if(!err && readers && readers.length>0){
                    for(var i=0;i<readers.length;i++){
                        if(readers[i].os=='android'){
                            androidReaders.push(readers[i]);
                        }else{
                            iosReaders.push(readers[i]);
                        }
                    }
                }
				var browsing_mode = ver.General_Info.browsing_mode;
				var previewTimestamp=ver.General_Info.PreviewTimestamp;
				if(previewTimestamp == undefined || browsing_mode == undefined) { //happened in the old paging version
					var previewTimestamp = new Date().getTime();
					var parser = new xml2js.Parser();
					var defPath_old = "";
					var fromDir = "";
					var toDir ="";
					//------- 辨識要對書籍落版 or Version落版
					if(editType=="version"){
						toDir = config.getDataDir()+"/previewBook/public/files/"+previewTimestamp+"/book";
						fromDir = ver.General_Info.Folder+"/temp/paging";
						defPath_old = ver.General_Info.Folder+"/temp/paging/definition.xml";
					}else{
						toDir = config.getDataDir()+"/previewBook/public/files/"+previewTimestamp+"/book";
						fromDir = BookPath+"/temp/paging";
						defPath_old = BookPath+"/temp/paging/definition.xml";
						console.log(ver._id);
					}
					
					if(fs.existsSync(defPath_old)) {
						copyDir(fromDir, toDir, function() {
							fs.readFile(defPath_old, function(err, data) {
								parser.parseString(data, function (err, result) {
									var manifest = result.package.manifest[0];
									var itemsP = manifest.portrait[0].item;
									var itemsL = manifest.landscape[0].item;
									
									if(itemsL == undefined && itemsP == undefined) {
										browsing_mode = "portrait"; //assign a default value
									}
									else {
										if(itemsL != undefined && itemsP == undefined) {
											browsing_mode = "landscape";
										}
										else if(itemsP != undefined && itemsL == undefined) {
											browsing_mode = "portrait";
										}
										else {
											browsing_mode = "double";
										}
									}
									renewVer();
								});
							});
						});
					}
					else {
						browsing_mode = "portrait";
						renewVer();
					}
					
					function renewVer() {
						var operation = {$set:{'General_Info.PreviewTimestamp': previewTimestamp, 'General_Info.browsing_mode': browsing_mode}}; 
						//-------------------- 檢查對書籍落版 or對版本落版
						if(editType=="version"){
							db.updateVersion({_id:req.params.ver_id}, operation, {safe:true}, function(err){
								if(err){
								}
								else {
									ver.General_Info.PreviewTimestamp = previewTimestamp;
									ver.General_Info.browsing_mode = browsing_mode;
									editVer();
								}
							});	
						}else{
							operation = {$set:{'General_Info.Folder':BookPath, 'General_Info.PreviewTimestamp': previewTimestamp, 'General_Info.browsing_mode': browsing_mode}}; 
							
							db.updateBookVersion({_id:req.params.ver_id}, operation, {safe:true}, function(err){
								if(err){
								}
								else {
									ver.General_Info.PreviewTimestamp = previewTimestamp;
									ver.General_Info.browsing_mode = browsing_mode;
									editVer();
								}
							});	
							
						}
					}
				}
				else {
					editVer();
				}
				function editVer() {
					var bookPath = config.getDataDir()+"/previewBook/public/files/"+previewTimestamp+"/book";
					var configPath = bookPath+"/config.xml";
					var defPath = bookPath+"/definition.xml";
					var data = '';
					var defPath_old = ver.General_Info.Folder+"/temp/paging/definition.xml";
					//-------------------- 檢查對書籍落版 or對版本落版
					if(editType=="version"){
						console.log("editType==version");
						bookPath = config.getDataDir()+"/previewBook/public/files/"+previewTimestamp+"/book";
						configPath = bookPath+"/config.xml";
						defPath = bookPath+"/definition.xml";
						defPath_old = ver.General_Info.Folder+"/temp/paging/definition.xml";
					}else{
						console.log("editType==book");
						bookPath = config.getDataDir()+"/previewBook/public/files/"+previewTimestamp+"/book";
						configPath = bookPath+"/config.xml";
						defPath = bookPath+"/definition.xml";
						defPath_old = ver.General_Info.Folder+"/temp/paging/definition.xml";
					}
					
					console.log('##############'+defPath);
					fs.stat(defPath, function(err, defStats){
						console.log(defStats);
						if(err || !defStats){
							fs.stat(defPath_old, function(err, defStats_old){
								respond(null, defStats_old);
							});
						}else{
							respond(defStats, null);
						}
					});
		
					function respond(defStats, defStats_old){
						var f;
						var path;
			
						if(!defStats && !defStats_old){//definition不存在
							console.log("ERROR def not found");
						}else if(!defStats){
							path = defPath_old;
						}else {
							path = defPath;
						}
						if(path != undefined) {	
							f = fs.createReadStream(path,{
								'bufferSize': 4 * 1024
							}); //.pipe(res);
							f.on('data', function(chunk) {
								data += chunk;
							});
					 		f.on('end', function () {
								console.log('### fs pipe end');
								//console.log(data);
								//-------------------- 檢查對書籍落版 or對版本落版
								if(editType=="version"){
									res.render('editAppVersionPage', {serverUrl:config.getServerUrl(), dataDir: config.getDataDir(), androidReaders:androidReaders,  iosReaders:iosReaders, title:'編輯版本', ver:ver, ver_id: req.params.ver_id, timestamp: ver.General_Info.Timestamp, previewTimestamp: previewTimestamp, text:ver.General_Info.Version_name, def: data, buildType:type, manage:req.session.uinfo.group.manager});
								}else{
									res.render('editBookVersionPage', {contentType:contentType, serverUrl:config.getServerUrl(), dataDir: config.getDataDir(), androidReaders:androidReaders,  iosReaders:iosReaders, title:'編輯書籍版本', ver:ver, ver_id: req.params.ver_id, timestamp: ver.General_Info.Timestamp, previewTimestamp: previewTimestamp, text:ver.General_Info.Version_name, def: data, buildType:type});
								}
							});
						}
					}    
				}
			});       
        }
	}
	else
		res.redirect('/login');
}


///**
// * 檢查使用者是否能管理app
// */
//function canManageApp(uinfo, app){
//    if(!uinfo){
//        return false;
//    }
//    if(uinfo.super){
//        return true;
//    }
//    if(!app || !app.Group){
//        return false;
//    }
//    if(uinfo.group.manager && app.Group.id==uinfo.group.id){
//        console.log(true);
//        return true;
//    }
//    console.log('!!!'+uinfo.group.manager);
//    if(uinfo.createAppPerm && uinfo.user==app.Creator){
//        return true;
//    }
//    return false;
//}

/**
 * 檢查使用者是否能新增app
 */
function canCreateApp(uinfo){
    if(uinfo.super || uinfo.createAppPerm || uinfo.group.manager)
        return true;
    
    return false;
}

/**
 * viewAppList頁面。
 */
exports.prototype.viewAllApps = function(req, res){
	//console.log("###?");
	// 看index怎麼寫，用version資料來做test
	if(req.session.uinfo.user) {
 		console.log('get apps, uid:'+req.session.uinfo.user);
  		
  		db.getApps(req.session.uinfo, function(error, app_collection){
    		res.render('viewApps', {uinfo: req.session.uinfo, title:'APP管理', apps: app_collection});
    		//res.render('apps', {uinfo: req.session.uinfo, title:'全部APP', apps: app_collection});
  		}, req.session.cur_app);
	}
	else
		res.redirect('/index');
}

/**
 * viewApp頁面。
 */
exports.prototype.viewAppPage = function(req, res){
    var args = querystring.parse(url.parse(req.url).query);
    var os=null;
    var call_build_verId=null;
    var buildType=null;
    if(args && args.os && args.os!='all'){
        os=args.os;
    }
	dbgetter.getAppById(req.session.uinfo, req.params.app_id, function(error, data){
		if(error && error==errcode.NOT_LOGIN){
			res.redirect('/login');
		}else if(error || !data){
			delete req.session.cur_app;
			res.redirect('/index');
		}else{
			
	 		console.log('viewApp Page?, uid:'+req.session.uinfo.user);
			db.getVersions(req.session.uinfo, req.params.app_id, false, function(error, version_data){
				//console.log(version_data);
				callBuildVerId="none";
				buildType="none";
				for(var i=0;i<version_data.length;i++){
					if(req.params.ver_id){
						if(req.params.ver_id==version_data[i]._id){
							if(version_data[i].General_Info.BuildType){
								if(version_data[i].General_Info.BuildType!="none"){
									buildType=version_data[i].General_Info.BuildType;
									call_build_verId=version_data[i]._id;
								}
							}
						}
					}
				}
				if(version_data.length>0)
					checkIpaSize(0);
				else
					goOn();
				//goOn();
				function checkIpaSize(ver_i){
					console.log("checkIpaSize["+ver_i+"]");
					if(version_data[ver_i].General_Info.downloadSize){
						if(ver_i<(version_data.length-1))
							checkIpaSize(ver_i+1)
						else
							goOn();
					}
					else{
						var cmd2 = 'du -sh '+version_data[ver_i].General_Info.download;
						exec(cmd2, function (err, stdout, stderr) {
							if(!err && !stderr){
		// 						console.log("stdout="+stdout);
								var arr_ = stdout.split("\t");
								var arr_2 =arr_[0].substring(0,(arr_[0].length-1));
								if(arr_[0].substring((arr_[0].length-1),arr_[0].length)=="K"){arr_2=arr_2/1000;}
								else if(arr_[0].substring((arr_[0].length-1),arr_[0].length)=="G"){arr_2=arr_2*1000}
								else if(arr_[0].substring((arr_[0].length-1),arr_[0].length)=="T"){arr_2=arr_2*1000000}
					
								//queryVersionResult[0].push({"size":(arr2+arr_2)});
								//queryVersionResult[0].size=arr2+arr_2;
								arr_2= formatFloat(arr_2, 2); // 四捨五入
		// 						console.log("size:"+(arr2+arr_2));
								//var size= formatFloat((arr_2), 2); // 四捨五入
								var size=arr_[0];
								version_data[ver_i].General_Info.downloadSize=size;
								console.log("App:"+version_data[ver_i].General_Info.APP_name+", ver:"+version_data[ver_i].General_Info.Version+", size:"+size+", download:"+version_data[ver_i].General_Info.download);
								db.updateVersion({_id:version_data[ver_i]._id}, {'$set':{'General_Info.downloadSize':size}},{safe:true}, function(err){
									if(ver_i<(version_data.length-1))
										checkIpaSize(ver_i+1)
									else
										goOn();
								});
							
							}
							else{
								if(ver_i<(version_data.length-1))
									checkIpaSize(ver_i+1)
								else
									goOn();
							}
						});
					}
				}
				function formatFloat(num, pos){
				  var size = Math.pow(10, pos);
				  return Math.round(num * size) / size;
				}
				
				
				function goOn(){
					db.queryReaders({bookcase:{$ne:1}}, function(err, readers){
						var androidReaders=[], iosReaders=[];
						if(!err && readers && readers.length>0){
							for(var i=0;i<readers.length;i++){
								if(readers[i].os=='android'){
									androidReaders.push(readers[i]);
								}else{
									iosReaders.push(readers[i]);
								}
							}
						}
						//console.log("### iosReaders[0]._id="+iosReaders[0]._id);
						if(req.params.ver_id){
							console.log("ver_id exist");
							res.render('viewAppPage', {title:data.APP_name,app: data, os:os, host:req.headers.host, callBuildVerId:req.params.ver_id, buildType:buildType, readers:readers, androidReaders:JSON.stringify(androidReaders), iosReaders:JSON.stringify(iosReaders), versions: version_data, manageApp:db.canManageApp(req.session.uinfo, data)});
						}else{
							console.log("no ver_id");
							res.render('viewAppPage', {title:data.APP_name,app: data, os:os, host:req.headers.host, callBuildVerId:"", buildType:"none", readers:readers, androidReaders:JSON.stringify(androidReaders), iosReaders:JSON.stringify(iosReaders), versions: version_data, manageApp:db.canManageApp(req.session.uinfo, data)});
						}
					});
				}
				
				
// 				db.queryReaders({bookcase:{$ne:1}}, function(err, readers){
// 					var androidReaders=[], iosReaders=[];
// 					if(!err && readers && readers.length>0){
// 						for(var i=0;i<readers.length;i++){
// 							if(readers[i].os=='android'){
// 								androidReaders.push(readers[i]);
// 							}else{
// 								iosReaders.push(readers[i]);
// 							}
// 						}
// 					}
// 					//console.log("### iosReaders[0]._id="+iosReaders[0]._id);
// 					if(req.params.ver_id){
// 						console.log("ver_id exist");
// 						res.render('viewAppPage', {title:data.APP_name,app: data, os:os, callBuildVerId:req.params.ver_id, buildType:buildType, readers:readers, androidReaders:JSON.stringify(androidReaders), iosReaders:JSON.stringify(iosReaders), versions: version_data, manageApp:db.canManageApp(req.session.uinfo, data)});
// 					}else{
// 						console.log("no ver_id");
// 						res.render('viewAppPage', {title:data.APP_name,app: data, os:os, callBuildVerId:"", buildType:"none", readers:readers, androidReaders:JSON.stringify(androidReaders), iosReaders:JSON.stringify(iosReaders), versions: version_data, manageApp:db.canManageApp(req.session.uinfo, data)});
// 					}
// 				});
				
				
			});	 	
		}
	}, false);	
}

/**
 * viewApp頁面。
 */
exports.prototype.viewNoAppPage = function(req, res){
	res.render('viewNoAppPage', {title:'APP管理',createApp:canCreateApp(req.session.uinfo)});
}


/**
 * manageAppCategory頁面。
 */
exports.prototype.manageAppCategory = function(req, res){
	console.log('manageAppCategory Page, uid:'+req.session.uinfo.user);
	res.render('manageAppCategory', {title:'APP分類管理'});
}


/**
 * aboutUs頁面。
 */
exports.prototype.aboutUs = function(req, res){
	console.log('aboutUs Page, uid:'+req.session.uinfo.user);
	res.render('aboutPage', {uinfo: req.session.uinfo, title:'About Us'});
}

/**
 * show case頁面。
 */
exports.prototype.showCase = function(req, res){
	res.render('showCase', {uinfo: req.session.uinfo, title:'Show Case'});
}

/**
 * contact 頁面。
 */
exports.prototype.contact = function(req, res){
	res.render('contact', {uinfo: req.session.uinfo, title:'Contact'});
}

/**
 * 忘記密碼頁面。
 */
exports.prototype.forgetPwd = function(req, res){
	res.render('forgetPwdPage',  {title:'忘記密碼', result:''});
}

/**
 * push發送頁面。
 */
exports.prototype.push = function(req, res){
// 	console.log('push Page, uid:'+req.session.uinfo.user);
    var uinfo=req.session.uinfo;
//     if(!uinfo.super && !uinfo.createAppPerm && !uinfo.group.manager){
	if(!uinfo || !uinfo.group){
		res.redirect('/login');
		return;
	}
	if(!uinfo.createAppPerm && !uinfo.group.manager){
        res.render('forbidden', {title:'', uinfo:uinfo});
        return;
    }
    else if(uinfo.group.manager){
    	db.getAllWithCategory(req.session.uinfo, {'Features.Push':1}, db.Version.IncludeCondition.Outward, function(error, data){
			db.getPushBookcaseList(req.session.uinfo,function(error, bookcases){
				
				res.render('push', {uinfo:req.session.uinfo, title:'新增訊息', data: data?data:{}, bookcases: bookcases?bookcases:{}});	
			});
		});
    }
    else{
    	db.getAllWithCategory(req.session.uinfo, {'Features.Push':1}, db.Version.IncludeCondition.Outward, function(error, data){
			db.getPushBookcaseList(req.session.uinfo,function(error, bookcases){
				
				res.render('push', {uinfo:req.session.uinfo, title:'新增訊息', data: data?data:{}, bookcases: bookcases?bookcases:{}});	
			});
		});
    }
	/*
	db.getApps(req.session.uinfo, function(error, app_collection){
		res.render('push', {title:'訊息推播', app_id: null, apps: app_collection});
	}, req.session.cur_app);
	res.render('push', {title:'訊息推播'});
	*/
	
}

/**
 * 金曲獎push發送頁面。
 */
exports.prototype.pushGma = function(req, res){
// 	console.log('push Page, uid:'+req.session.uinfo.user);
    var uinfo=req.session.uinfo;
//     if(!uinfo.super && !uinfo.createAppPerm && !uinfo.group.manager){
	if(!uinfo || !uinfo.group){
		res.redirect('/login');
		return;
	}
	if(!uinfo.createAppPerm && !uinfo.group.manager){
        res.render('forbidden', {title:'', uinfo:uinfo});
        return;
    }
    else if(uinfo.group.manager){
    	db.getAllWithCategory(req.session.uinfo, {'Features.Push':1}, db.Version.IncludeCondition.Outward, function(error, data){
			db.getPushBookcaseList(req.session.uinfo,function(error, bookcases){
				
				res.render('pushGma', {uinfo:req.session.uinfo, title:'新增訊息', data: data?data:{}, bookcases: bookcases?bookcases:{}});	
			});
		});
    }
    else{
    	db.getAllWithCategory(req.session.uinfo, {'Features.Push':1}, db.Version.IncludeCondition.Outward, function(error, data){
			db.getPushBookcaseList(req.session.uinfo,function(error, bookcases){
				
				res.render('pushGma', {uinfo:req.session.uinfo, title:'新增訊息', data: data?data:{}, bookcases: bookcases?bookcases:{}});	
			});
		});
    }
	/*
	db.getApps(req.session.uinfo, function(error, app_collection){
		res.render('push', {title:'訊息推播', app_id: null, apps: app_collection});
	}, req.session.cur_app);
	res.render('push', {title:'訊息推播'});
	*/
	
}

/**
 * return getLastEditedApp AppId
 */
exports.prototype.getLastEditedApp = function(req, res){
	var uinfo = req.session.uinfo;
    var condition;
    if(uinfo.super)
        condition=null;
    else
        condition={'user':uinfo.user};
	db.getAppsCollection(function(error, app_collection) {
		app_collection.find(condition).sort({"Timestamp":-1}).limit(1).toArray(function(error, result) {
			if(result.length > 0) {
				var id = result[0]._id;
				res.end('/manageApp/viewApp/'+id);
			}
			else {
				res.end('/manageApp/viewApp/');
			}
		});
	});	
}

/* New Interface Block END */

//#####################
//#############
/**
 * viewApp頁面demo版
 */
exports.prototype.viewAppPage_beta = function(req, res){
	dbgetter.getAppById(req.session.uinfo, req.params.app_id, function(error, data){
		if(error && error==errcode.NOT_LOGIN){
			res.redirect('/login');
		}else if(error || !data){
			delete req.session.cur_app;
			res.redirect('/index');
		}else{
			//console.log(data);
	 		console.log('viewApp Page, uid:'+req.session.uinfo.user);

			db.getVersions(req.session.uinfo, req.params.app_id, false, function(error, version_data){
				//console.log(version_data);
				res.render('viewAppPage_beta', {title:'APP管理',app: data, versions: version_data});
			});	   		
		}
	}, false);	
}

//#####################
//#############
/**
 * PushApply頁面
 */
exports.prototype.pushApply = function(req, res){
	dbgetter.getVersionById(req.session.uinfo, req.params.ver_id, function(error, data){
		if(error && error==errcode.NOT_LOGIN){
			res.redirect('/login');
		}else if(error || !data){
			delete req.session.cur_app;
			res.redirect('/index');
		}else{
			//console.log(data);
	 		console.log('pushApply Page, uid:'+req.session.uinfo.user);

			db.getVersions(req.session.uinfo, req.params.app_id, false, function(error, version_data){
				//console.log(version_data);
				res.render('pushApply', {title:'推播申請',app: data, versions: version_data});
			});	   		
		}
	}, false);	
}




/**##########################
 * ajaxtest
 */
exports.prototype.ajaxtest = function(req, res){
	res.redirect('/test.html');
}

//用來回報申請/打包流程狀態
exports.prototype.ajaxRes = function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	var string = _self.indexTemplate;
	res.write(string);
	res.end();
};


