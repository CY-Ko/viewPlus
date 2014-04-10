//config = {
//  projDir : '/home/jp/nodedata', //AppFactory node.js端資料存放處
//  javaDir : '/home/jp/workspace/AppBuild', //AppFactory java端目錄 
//  mongoHost : 'localhost', //mongodb host
//  mongoPort : 27017 //mongo db port number
//}
var iniparser = require('iniparser');
//var config=null;
//if(!config){
//	var data = iniparser.parseSync('../config');
//	console.log('config data:'+JSON.stringify(data));
//	config={};
//	config.projDir = data.config.work_dir;
//	config.mongoHost = data.config.mongo_host;
//	config.mongoPort = data.config.mongo_port;
//	config.javaDir = __dirname.substring(0,__dirname.lastIndexOf('/'));
//	console.log('config:'+JSON.stringify(config));
//}


var ConfigGetter = function(){
	var config={};
//    config.defaultGroup='未加入群組';
    config.defaultCategory='未分類';
    config.javaDir = __dirname.substring(0,__dirname.lastIndexOf('/'));
	var data = iniparser.parseSync(config.javaDir+'/config');
	config.projDir = data.config.work_dir;
	config.server_path = data.config.server_path;
	config.adDir = data.config.work_dir+'/ad';//data.config.ad_dir;
	config.bookcaseDir = data.config.work_dir+'/bookcase';
	config.bookDir = data.config.work_dir+'/book';
	config.mongoHost = data.config.mongo_host;
	config.iosAccountDir = data.config.work_dir+'/iosAccount';
    config.os = data.config.os;
	config.mongoPort = parseInt(data.config.mongo_port);
	//config.limitIP = data.config.limitIP.split(',');
    config.androidApiKey= data.config.android_api_key;
    config.serverUrl= data.config.server_url;
    config.serverPort= data.config.server_port;
    config.facebookSdkPath= data.config.facebook_sdk_path;
    config.bookshelfTypeMode= data.config.bookshelfTypeMode;
    config.bookshelfMode= data.config.bookshelfMode;
    config.getAdMode= data.config.adMode;
    config.getPushMode= data.config.pushMode;
    config.getAndroidMode= data.config.androidMode;
    
    if(config.os == 'windows')
        config.javaDir = __dirname.substring(0,__dirname.lastIndexOf('\\'));
	this.config=config;
}

ConfigGetter.prototype.getHttpsKey = function(){ 
    return this.config.server_path+'/node/resources/crypto/privatekey.pem';
}
ConfigGetter.prototype.getHttpsCert = function(){ 
    return this.config.server_path+'/node/resources/crypto/certificate.pem';
}
ConfigGetter.prototype.getHttpsCa = function(){ 
    return this.config.server_path+'/node/resources/crypto/sub.class1.server.ca.pem';
}
ConfigGetter.prototype.getHttpsKey2 = function(){ 
    return this.config.server_path+'/node/resources/crypto/ssk.key';
}
ConfigGetter.prototype.getHttpsCert2 = function(){ 
    return this.config.server_path+'/node/resources/crypto/ssl.crt';
}
ConfigGetter.prototype.getIosCertPath = function(){ 
    return this.config.projDir+'/ios.csr';
}
ConfigGetter.prototype.getIosDevCertPath = function(){ 
    return this.config.server_path+'/CertificateSigningRequest.certSigningRequest';
}
ConfigGetter.prototype.getGenDevCsrAppPath = function(){ 
    return this.config.server_path+'/certGenerator.app';
}

ConfigGetter.prototype.getIosProvForReaderPath = function(){ 
    return this.config.projDir+'/testReader.mobileprovision';
}

ConfigGetter.prototype.getIosPushCertForReaderPath = function(){ 
    return this.config.projDir+'/testReader.cer';
}

ConfigGetter.prototype.getIosPushP12ForReaderPath = function(){ 
    return this.config.projDir+'/iphone_distribution.p12';
}

ConfigGetter.prototype.getUserKeyPath = function(){ 
    return this.config.projDir+'/userkey.key';
}

ConfigGetter.prototype.getDataDir = function(){ 
    return this.config.projDir;
}

//ConfigGetter.prototype.config=config;
ConfigGetter.prototype.getJars = function(){ 
  if(this.config.os=='windows')
    return this.config.javaDir+'\\jars\\*'
  return this.config.javaDir+'/jars/*'
};

ConfigGetter.prototype.getIconSize = function(){
  return 150;
};

ConfigGetter.prototype.getSessionKey = function(){
  return 'this is so funny';
};


ConfigGetter.prototype.getDbName = function(){
  return 'view_plus';
};

ConfigGetter.prototype.getBinDir = function(){
  var path;
  if(this.config.os=='windows')
    path=this.config.javaDir+'\\bin'
  else
    path=this.config.javaDir+'/bin'
  return path;
};


ConfigGetter.prototype.getXmlPath = function(user){
  if(!user)
    user='default';
  return this.config.projDir+'/'+user+'_'+Date.now()+'.xml';
};

ConfigGetter.prototype.getAppDir = function(app_id){
  if(!app_id)
    return null;
  return this.config.projDir+'/'+app_id;
};

ConfigGetter.prototype.getIosAcntDir = function(ios_acnt_id){
  if(!ios_acnt_id)
    return null;
  return this.config.projDir+'/iosAccount/'+ios_acnt_id;
};

ConfigGetter.prototype.getAdDir = function(ad_id){
  if(!ad_id)
    return this.config.adDir;
  return this.config.adDir+'/'+ad_id;
};

ConfigGetter.prototype.getBookcaseDir = function(bc_id){
  if(!bc_id)
    return this.config.bookcaseDir;
  return this.config.bookcaseDir+'/'+bc_id;
};

ConfigGetter.prototype.getBookDir = function(book_id){
  if(!book_id)
    return this.config.bookDir;
  return this.config.bookDir+'/'+book_id;
};

ConfigGetter.prototype.getMongoHost = function(){
  return this.config.mongoHost;
};

ConfigGetter.prototype.getMongoPort = function(){
  return this.config.mongoPort;
};
ConfigGetter.prototype.getAndroidApiKey = function(){
  return this.config.androidApiKey;
};

//ConfigGetter.prototype.getDefaultGroup = function(){
//    return this.config.defaultGroup;
//};
ConfigGetter.prototype.getDefaultCategory = function(){
    return this.config.defaultCategory;
};

ConfigGetter.prototype.getServerUrl = function(){
  return this.config.serverUrl;
};

ConfigGetter.prototype.getServerPort = function(){
  return this.config.serverPort;
};

ConfigGetter.prototype.getFacebookSdkPath = function(){
  return this.config.facebookSdkPath?this.config.facebookSdkPath:'';
};

ConfigGetter.prototype.getLimitIP = function(){
  return this.config.limitIP;
};

ConfigGetter.prototype.getBookshelfTypeMode = function(){
  return this.config.bookshelfTypeMode?this.config.bookshelfTypeMode:0;
};

ConfigGetter.prototype.getBookshelfMode = function(){
  return this.config.bookshelfMode?this.config.bookshelfMode:0;
};

ConfigGetter.prototype.getAdMode = function(){
  return this.config.getAdMode?this.config.getAdMode:0;;
};

ConfigGetter.prototype.getPushMode = function(){
  return this.config.getPushMode?this.config.getPushMode:0;
};

ConfigGetter.prototype.getAndroidMode = function(){
  return this.config.getAndroidMode?this.config.getAndroidMode:0;
};

exports.config=new ConfigGetter();
