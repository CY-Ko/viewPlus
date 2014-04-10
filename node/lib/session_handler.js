/**
 * 在取得session資料之後、server開始利用session資料之前將資料進行處理。
 * 目前用來
 * 1.確保每個request的session都有uinfo(user info，使用者登入之後將該使用者資訊填在session.uinfo)的欄位，
 * 避免reference到undefined物件裡的attribute的error。
 * 2.讓res.render不需要傳入uinfo也可以執行
 */
var config = require('../config').config;
var util = require('util');

exports = module.exports = function bind(){
    return function bind(req, res, next) {
        if(!req.session.uinfo){
            req.session.uinfo = {user:null};
        }
        if(req.url=='/favicon.ico'){
            res.end();
            return;
        }
        console.log(req.url);
//        console.log(util.inspect(process.memoryUsage()));
        //dirty trick,讓res.render自動使用傳入uinfo，不用額外傳入
        (function(mRender){
            res.render = function(){
            if(arguments && arguments[1]&&!arguments[1].uinfo){
                arguments[1].uinfo=req.session.uinfo?req.session.uinfo:{};
            }
            mRender.apply(res, arguments);
            };
        })(res.render);
        next();
  }
};