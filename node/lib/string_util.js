/**
 * 常見的string處理函數。
 */

var util = {};

exports = module.exports = util;

util.isString = function (s) {
    return typeof(s) === 'string' || s instanceof String;
}

util._endsWith = function(str, suffix, ignoreCases) {
	if(ignoreCases){
		suffix=suffix.toLowerCase();
	}
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}


util.endsWith = function(str, suffix, ignoreCases) { 
	if(!util.isString(str))
		return false;
	if(ignoreCases){
		str=str.toLowerCase();
	}
	if(util.isString(suffix)){
		return util._endsWith(str, suffix, ignoreCases);
	}else if(Object.prototype.toString.apply(suffix) === '[object Array]'){
		for(var i=0;i<suffix.length;i++){
			if(util.isString(suffix[i]) && util._endsWith(str, suffix[i], ignoreCases))
				return true;
		}
		return false;
	}
	return false;
}

util.startsWith = function(str, prefix, ignoreCases) {
    if(!util.isString(str))
		return false;
    if(!util.isString(prefix))
    	return false;
	if(ignoreCases){
		str=str.toLowerCase();
        prefix=prefix.toLowerCase();
	}
	return str.indexOf(prefix) == 0;
}

util.replaceAll = function(str, target, replace){
	if(!str)
		return '';
	return str.replace(new RegExp(target, 'g'), replace) ;
}

