/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

/*
	This is a compiled version of Dojo, built for deployment and not for
	development. To get an editable version, please visit:

		http://dojotoolkit.org

	for documentation and information on getting the source.
*/

if(typeof dojo=="undefined"){
(function(){
if(typeof this["djConfig"]=="undefined"){
this.djConfig={};
}
if((!this["console"])||(!console["firebug"])){
this.console={};
}
var cn=["assert","count","debug","dir","dirxml","error","group","groupEnd","info","log","profile","profileEnd","time","timeEnd","trace","warn"];
var i=0,tn;
while(tn=cn[i++]){
if(!console[tn]){
console[tn]=function(){
};
}
}
if(typeof this["dojo"]=="undefined"){
this.dojo={};
}
dojo.global=this;
var _4={isDebug:false,allowQueryConfig:false,baseScriptUri:"",baseRelativePath:"",libraryScriptUri:"",preventBackButtonFix:true,delayMozLoadingFix:false};
for(var _5 in _4){
if(typeof djConfig[_5]=="undefined"){
djConfig[_5]=_4[_5];
}
}
var _6=["Browser","Rhino","Spidermonkey","Mobile"];
var t;
while(t=_6.shift()){
dojo["is"+t]=false;
}
})();
dojo.locale=djConfig.locale;
dojo.version={major:0,minor:0,patch:0,flag:"dev",revision:Number("$Rev: 8123 $".match(/[0-9]+/)[0]),toString:function(){
with(dojo.version){
return major+"."+minor+"."+patch+flag+" ("+revision+")";
}
}};
dojo._getProp=function(_8,_9,_a){
var _b=_a||dojo.global;
for(var i=0,p;_b&&(p=_8[i]);i++){
_b=(p in _b?_b[p]:(_9?_b[p]={}:undefined));
}
return _b;
};
dojo.setObject=function(_e,_f,_10){
var _11=_e.split("."),p=_11.pop(),obj=dojo._getProp(_11,true,_10);
return (obj&&p?(obj[p]=_f):undefined);
};
dojo.getObject=function(_14,_15,_16){
return dojo._getProp(_14.split("."),_15,_16);
};
dojo.exists=function(_17,obj){
return Boolean(dojo.getObject(_17,false,obj));
};
dojo["eval"]=function(_19){
return dojo.global.eval?dojo.global.eval(_19):eval(_19);
};
dojo.deprecated=function(_1a,_1b,_1c){
var _1d="DEPRECATED: "+_1a;
if(_1b){
_1d+=" "+_1b;
}
if(_1c){
_1d+=" -- will be removed in version: "+_1c;
}
console.debug(_1d);
};
dojo.experimental=function(_1e,_1f){
var _20="EXPERIMENTAL: "+_1e;
_20+=" -- Not yet ready for use.  APIs subject to change without notice.";
if(_1f){
_20+=" "+_1f;
}
console.debug(_20);
};
dojo._getText=function(uri){
};
(function(){
var _22={_pkgFileName:"__package__",_loadedModules:{},_inFlightCount:0,_modulePrefixes:{dojo:{name:"dojo",value:"."},doh:{name:"doh",value:"../util/doh"},tests:{name:"tests",value:"tests"}},_moduleHasPrefix:function(_23){
var mp=this._modulePrefixes;
return Boolean(mp[_23]&&mp[_23].value);
},_getModulePrefix:function(_25){
var mp=this._modulePrefixes;
if(this._moduleHasPrefix(_25)){
return mp[_25].value;
}
return _25;
},_loadedUrls:[],_postLoad:false,_loaders:[],_unloaders:[],_loadNotifying:false};
for(var _27 in _22){
dojo[_27]=_22[_27];
}
})();
dojo._loadPath=function(_28,_29,cb){
var uri=(((_28.charAt(0)=="/"||_28.match(/^\w+:/)))?"":this.baseUrl)+_28;
if(djConfig.cacheBust&&dojo.isBrowser){
uri+="?"+String(djConfig.cacheBust).replace(/\W+/g,"");
}
try{
return !_29?this._loadUri(uri,cb):this._loadUriAndCheck(uri,_29,cb);
}
catch(e){
console.debug(e);
return false;
}
};
dojo._loadUri=function(uri,cb){
if(this._loadedUrls[uri]){
return true;
}
var _2e=this._getText(uri,true);
if(!_2e){
return false;
}
this._loadedUrls[uri]=true;
if(cb){
_2e="("+_2e+")";
}
var _2f=dojo["eval"]("//@ sourceURL="+uri+"\r\n"+_2e);
if(cb){
cb(_2f);
}
return true;
};
dojo._loadUriAndCheck=function(uri,_31,cb){
var ok=false;
try{
ok=this._loadUri(uri,cb);
}
catch(e){
console.debug("failed loading ",uri," with error: ",e);
}
return Boolean(ok&&this._loadedModules[_31]);
};
dojo.loaded=function(){
this._loadNotifying=true;
this._postLoad=true;
var mll=this._loaders;
for(var x=0;x<mll.length;x++){
mll[x]();
}
this._loaders=[];
this._loadNotifying=false;
};
dojo.unloaded=function(){
var mll=this._unloaders;
while(mll.length){
(mll.pop())();
}
};
dojo.addOnLoad=function(obj,_38){
var d=dojo;
if(arguments.length==1){
d._loaders.push(obj);
}else{
if(arguments.length>1){
d._loaders.push(function(){
obj[_38]();
});
}
}
if(d._postLoad&&d._inFlightCount==0&&!d._loadNotifying){
d._callLoaded();
}
};
dojo.addOnUnload=function(obj,_3b){
var d=dojo;
if(arguments.length==1){
d._unloaders.push(obj);
}else{
if(arguments.length>1){
d._unloaders.push(function(){
obj[_3b]();
});
}
}
};
dojo._modulesLoaded=function(){
if(this._postLoad){
return;
}
if(this._inFlightCount>0){
console.debug("files still in flight!");
return;
}
dojo._callLoaded();
};
dojo._callLoaded=function(){
if(typeof setTimeout=="object"||(djConfig["useXDomain"]&&dojo.isOpera)){
setTimeout("dojo.loaded();",0);
}else{
dojo.loaded();
}
};
dojo._getModuleSymbols=function(_3d){
var _3e=_3d.split(".");
for(var i=_3e.length;i>0;i--){
var _40=_3e.slice(0,i).join(".");
if((i==1)&&!this._moduleHasPrefix(_40)){
_3e[0]="../"+_3e[0];
}else{
var _41=this._getModulePrefix(_40);
if(_41!=_40){
_3e.splice(0,i,_41);
break;
}
}
}
return _3e;
};
dojo._global_omit_module_check=false;
dojo._loadModule=function(_42,_43,_44){
_44=this._global_omit_module_check||_44;
var _45=this._loadedModules[_42];
if(_45){
return _45;
}
var _46=_42.split(".");
var _47=this._getModuleSymbols(_42);
var _48=((_47[0].charAt(0)!="/")&&!_47[0].match(/^\w+:/));
var _49=_47[_47.length-1];
var _4a;
if(_49=="*"){
_42=_46.slice(0,-1).join(".");
_47.pop();
_4a=_47.join("/")+"/"+this._pkgFileName+".js";
if(_48&&_4a.charAt(0)=="/"){
_4a=_4a.slice(1);
}
}else{
_4a=_47.join("/")+".js";
_42=_46.join(".");
}
var _4b=(!_44)?_42:null;
var ok=this._loadPath(_4a,_4b);
if((!ok)&&(!_44)){
throw new Error("Could not load '"+_42+"'; last tried '"+_4a+"'");
}
if((!_44)&&(!this["isXDomain"])){
_45=this._loadedModules[_42];
if(!_45){
throw new Error("symbol '"+_42+"' is not defined after loading '"+_4a+"'");
}
}
return _45;
};
dojo.require=dojo._loadModule;
dojo.provide=function(_4d){
var _4e=String(_4d);
var _4f=_4e;
var _50=_4d.split(/\./);
if(_50[_50.length-1]=="*"){
_50.pop();
_4f=_50.join(".");
}
var _51=dojo.getObject(_4f,true);
this._loadedModules[_4e]=_51;
this._loadedModules[_4f]=_51;
return _51;
};
dojo.platformRequire=function(_52){
var _53=_52["common"]||[];
var _54=_53.concat(_52[dojo._name]||_52["default"]||[]);
for(var x=0;x<_54.length;x++){
var _56=_54[x];
if(_56.constructor==Array){
dojo._loadModule.apply(dojo,_56);
}else{
dojo._loadModule(_56);
}
}
};
dojo.requireIf=function(_57,_58){
if(_57===true){
var _59=[];
for(var i=1;i<arguments.length;i++){
_59.push(arguments[i]);
}
dojo.require.apply(dojo,_59);
}
};
dojo.requireAfterIf=dojo.requireIf;
dojo.registerModulePath=function(_5b,_5c){
this._modulePrefixes[_5b]={name:_5b,value:_5c};
};
if(djConfig["modulePaths"]){
for(var param in djConfig["modulePaths"]){
dojo.registerModulePath(param,djConfig["modulePaths"][param]);
}
}
dojo.requireLocalization=function(_5d,_5e,_5f,_60){
dojo.require("dojo.i18n");
dojo.i18n._requireLocalization.apply(dojo.hostenv,arguments);
};
(function(){
var ore=new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$");
var ire=new RegExp("^((([^:]+:)?([^@]+))@)?([^:]*)(:([0-9]+))?$");
dojo._Url=function(){
var n=null;
var _a=arguments;
var uri=_a[0];
for(var i=1;i<_a.length;i++){
if(!_a[i]){
continue;
}
var _67=new dojo._Url(_a[i]+"");
var _68=new dojo._Url(uri+"");
if((_67.path=="")&&(!_67.scheme)&&(!_67.authority)&&(!_67.query)){
if(_67.fragment!=null){
_68.fragment=_67.fragment;
}
_67=_68;
}else{
if(_67.scheme==null){
_67.scheme=_68.scheme;
if(_67.authority==null){
_67.authority=_68.authority;
if(_67.path.charAt(0)!="/"){
var _69=_68.path.substring(0,_68.path.lastIndexOf("/")+1)+_67.path;
var _6a=_69.split("/");
for(var j=0;j<_6a.length;j++){
if(_6a[j]=="."){
if(j==_6a.length-1){
_6a[j]="";
}else{
_6a.splice(j,1);
j--;
}
}else{
if(j>0&&!(j==1&&_6a[0]=="")&&_6a[j]==".."&&_6a[j-1]!=".."){
if(j==(_6a.length-1)){
_6a.splice(j,1);
_6a[j-1]="";
}else{
_6a.splice(j-1,2);
j-=2;
}
}
}
}
_67.path=_6a.join("/");
}
}
}
}
uri="";
if(_67.scheme!=null){
uri+=_67.scheme+":";
}
if(_67.authority!=null){
uri+="//"+_67.authority;
}
uri+=_67.path;
if(_67.query!=null){
uri+="?"+_67.query;
}
if(_67.fragment!=null){
uri+="#"+_67.fragment;
}
}
this.uri=uri.toString();
var r=this.uri.match(ore);
this.scheme=r[2]||(r[1]?"":null);
this.authority=r[4]||(r[3]?"":null);
this.path=r[5];
this.query=r[7]||(r[6]?"":null);
this.fragment=r[9]||(r[8]?"":null);
if(this.authority!=null){
r=this.authority.match(ire);
this.user=r[3]||null;
this.password=r[4]||null;
this.host=r[5];
this.port=r[7]||null;
}
};
dojo._Url.prototype.toString=function(){
return this.uri;
};
})();
dojo.moduleUrl=function(_6d,url){
var loc=dojo._getModuleSymbols(_6d).join("/");
if(!loc){
return null;
}
if(loc.lastIndexOf("/")!=loc.length-1){
loc+="/";
}
var _70=loc.indexOf(":");
if(loc.charAt(0)!="/"&&(_70==-1||_70>loc.indexOf("/"))){
loc=dojo.baseUrl+loc;
}
return new dojo._Url(loc,url);
};
}
if(typeof window!="undefined"){
dojo.isBrowser=true;
dojo._name="browser";
(function(){
var d=dojo;
if(document&&document.getElementsByTagName){
var _72=document.getElementsByTagName("script");
var _73=/dojo\.js([\?\.]|$)/i;
for(var i=0;i<_72.length;i++){
var src=_72[i].getAttribute("src");
if(!src){
continue;
}
var m=src.match(_73);
if(m){
if(!djConfig["baseUrl"]){
djConfig["baseUrl"]=src.substring(0,m.index);
}
var cfg=_72[i].getAttribute("djConfig");
if(cfg){
var _78=eval("({ "+cfg+" })");
for(var x in _78){
djConfig[x]=_78[x];
}
}
break;
}
}
}
d.baseUrl=djConfig["baseUrl"];
var n=navigator;
var dua=n.userAgent;
var dav=n.appVersion;
var tv=parseFloat(dav);
d.isOpera=(dua.indexOf("Opera")>=0)?tv:0;
d.isKhtml=(dav.indexOf("Konqueror")>=0)||(dav.indexOf("Safari")>=0)?tv:0;
d.isSafari=(dav.indexOf("Safari")>=0)?tv:0;
var _7e=dua.indexOf("Gecko");
d.isMozilla=d.isMoz=((_7e>=0)&&(!d.isKhtml))?tv:0;
d.isFF=0;
d.isIE=0;
d.isGears=0;
try{
if(d.isMoz){
d.isFF=parseFloat(dua.split("Firefox/")[1].split(" ")[0]);
}
if((document.all)&&(!d.isOpera)){
d.isIE=parseFloat(dav.split("MSIE ")[1].split(";")[0]);
}
}
catch(e){
}
d._gearsObject=function(){
var _7f;
var _80;
var _81=d.getObject("google.gears");
if(_81){
return _81;
}
if(typeof GearsFactory!="undefined"){
_7f=new GearsFactory();
}else{
try{
_7f=new ActiveXObject("Gears.Factory");
}
catch(exp){
if(navigator.mimeTypes["application/x-googlegears"]){
_7f=document.createElement("object");
_7f.setAttribute("type","application/x-googlegears");
_7f.setAttribute("width",0);
_7f.setAttribute("height",0);
_7f.style.display="none";
document.documentElement.appendChild(_7f);
}
}
}
if(!_7f){
return null;
}
dojo.setObject("google.gears.factory",_7f);
return dojo.getObject("google.gears");
};
var _82=d._gearsObject();
if(_82){
d.isGears=parseFloat(_82.factory.getBuildInfo());
}
var cm=document["compatMode"];
d.isQuirks=(cm=="BackCompat")||(cm=="QuirksMode")||(d.isIE<6);
d.locale=djConfig.locale||(d.isIE?n.userLanguage:n.language).toLowerCase();
d._println=console.debug;
d._XMLHTTP_PROGIDS=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"];
d._xhrObj=function(){
var _84=null;
var _85=null;
try{
_84=new XMLHttpRequest();
}
catch(e){
}
if(!_84){
for(var i=0;i<3;++i){
var _87=dojo._XMLHTTP_PROGIDS[i];
try{
_84=new ActiveXObject(_87);
}
catch(e){
_85=e;
}
if(_84){
dojo._XMLHTTP_PROGIDS=[_87];
break;
}
}
}
if(!_84){
throw new Error("XMLHTTP not available: "+_85);
}
return _84;
};
d._isDocumentOk=function(_88){
var _89=_88.status||0;
return ((_89>=200)&&(_89<300))||(_89==304)||(_89==1223)||(!_89&&(location.protocol=="file:"||location.protocol=="chrome:"));
};
d._getText=function(uri,_8b){
var _8c=this._xhrObj();
if(dojo._Url){
uri=(new dojo._Url(window.location,uri)).toString();
}
_8c.open("GET",uri,false);
try{
_8c.send(null);
if(!d._isDocumentOk(_8c)){
var err=Error("Unable to load "+uri+" status:"+_8c.status);
err.status=_8c.status;
err.responseText=_8c.responseText;
throw err;
}
}
catch(e){
if(_8b){
return null;
}
throw e;
}
return _8c.responseText;
};
})();
dojo._handleNodeEvent=function(_8e,_8f,fp){
var _91=_8e["on"+_8f]||function(){
};
_8e["on"+_8f]=function(){
fp.apply(_8e,arguments);
_91.apply(_8e,arguments);
};
return true;
};
dojo._initFired=false;
dojo._loadInit=function(e){
dojo._initFired=true;
var _93=(e&&e.type)?e.type.toLowerCase():"load";
if(arguments.callee.initialized||(_93!="domcontentloaded"&&_93!="load")){
return;
}
arguments.callee.initialized=true;
if(typeof dojo["_khtmlTimer"]!="undefined"){
clearInterval(dojo._khtmlTimer);
delete dojo._khtmlTimer;
}
if(dojo._inFlightCount==0){
dojo._modulesLoaded();
}
};
if(document.addEventListener){
if(dojo.isOpera||(dojo.isMoz&&(djConfig["enableMozDomContentLoaded"]===true))){
document.addEventListener("DOMContentLoaded",dojo._loadInit,null);
}
window.addEventListener("load",dojo._loadInit,null);
}
if(dojo.isIE){
document.write("<scr"+"ipt defer src=\"//:\" "+"onreadystatechange=\"if(this.readyState=='complete'){dojo._loadInit();}\">"+"</scr"+"ipt>");
}
if(/(WebKit|khtml)/i.test(navigator.userAgent)){
dojo._khtmlTimer=setInterval(function(){
if(/loaded|complete/.test(document.readyState)){
dojo._loadInit();
}
},10);
}
if(dojo.isIE){
dojo._handleNodeEvent(window,"beforeunload",function(){
dojo._unloading=true;
window.setTimeout(function(){
dojo._unloading=false;
},0);
});
}
dojo._handleNodeEvent(window,"unload",function(){
if((!dojo.isIE)||(dojo.isIE&&dojo._unloading)){
dojo.unloaded();
}
});
try{
if(dojo.isIE){
document.namespaces.add("v","urn:schemas-microsoft-com:vml");
document.createStyleSheet().addRule("v\\:*","behavior:url(#default#VML)");
}
}
catch(e){
}
dojo._writeIncludes=function(){
};
dojo.doc=window["document"]||null;
dojo.body=function(){
return dojo.doc.body||dojo.doc.getElementsByTagName("body")[0];
};
dojo.setContext=function(_94,_95){
dojo.global=_94;
dojo.doc=_95;
};
dojo._fireCallback=function(_96,_97,_98){
if((_97)&&((typeof _96=="string")||(_96 instanceof String))){
_96=_97[_96];
}
return (_97?_96.apply(_97,_98||[]):_96());
};
dojo.withGlobal=function(_99,_9a,_9b,_9c){
var _9d;
var _9e=dojo.global;
var _9f=dojo.doc;
try{
dojo.setContext(_99,_99.document);
_9d=dojo._fireCallback(_9a,_9b,_9c);
}
finally{
dojo.setContext(_9e,_9f);
}
return _9d;
};
dojo.withDoc=function(_a0,_a1,_a2,_a3){
var _a4;
var _a5=dojo.doc;
try{
dojo.doc=_a0;
_a4=dojo._fireCallback(_a1,_a2,_a3);
}
finally{
dojo.doc=_a5;
}
return _a4;
};
}
if(djConfig.isDebug){
if(!console.firebug){
dojo.require("dojo._firebug.firebug");
}
}
dojo.provide("dojo._base.lang");
dojo.isString=function(it){
return (typeof it=="string"||it instanceof String);
};
dojo.isArray=function(it){
return (it&&it instanceof Array||typeof it=="array"||((typeof dojo["NodeList"]!="undefined")&&(it instanceof dojo.NodeList)));
};
if(dojo.isBrowser&&dojo.isSafari){
dojo.isFunction=function(it){
if((typeof (it)=="function")&&(it=="[object NodeList]")){
return false;
}
return (typeof it=="function"||it instanceof Function);
};
}else{
dojo.isFunction=function(it){
return (typeof it=="function"||it instanceof Function);
};
}
dojo.isObject=function(it){
if(typeof it=="undefined"){
return false;
}
return (it===null||typeof it=="object"||dojo.isArray(it)||dojo.isFunction(it));
};
dojo.isArrayLike=function(it){
var d=dojo;
if((!it)||(typeof it=="undefined")){
return false;
}
if(d.isString(it)){
return false;
}
if(d.isFunction(it)){
return false;
}
if(d.isArray(it)){
return true;
}
if((it.tagName)&&(it.tagName.toLowerCase()=="form")){
return false;
}
if(isFinite(it.length)){
return true;
}
return false;
};
dojo.isAlien=function(it){
if(!it){
return false;
}
return !dojo.isFunction(it)&&/\{\s*\[native code\]\s*\}/.test(String(it));
};
dojo._mixin=function(obj,_af){
var _b0={};
for(var x in _af){
if((typeof _b0[x]=="undefined")||(_b0[x]!=_af[x])){
obj[x]=_af[x];
}
}
if(dojo.isIE&&(typeof (_af["toString"])=="function")&&(_af["toString"]!=obj["toString"])&&(_af["toString"]!=_b0["toString"])){
obj.toString=_af.toString;
}
return obj;
};
dojo.mixin=function(obj,_b3){
for(var i=1,l=arguments.length;i<l;i++){
dojo._mixin(obj,arguments[i]);
}
return obj;
};
dojo.extend=function(_b6,_b7){
for(var i=1,l=arguments.length;i<l;i++){
dojo._mixin(_b6.prototype,arguments[i]);
}
return _b6;
};
dojo._hitchArgs=function(_ba,_bb){
var pre=dojo._toArray(arguments,2);
var _bd=dojo.isString(_bb);
return function(){
var _be=dojo._toArray(arguments);
var f=(_bd?(_ba||dojo.global)[_bb]:_bb);
return (f)&&(f.apply(_ba||this,pre.concat(_be)));
};
};
dojo.hitch=function(_c0,_c1){
if(arguments.length>2){
return dojo._hitchArgs.apply(dojo,arguments);
}
if(!_c1){
_c1=_c0;
_c0=null;
}
if(dojo.isString(_c1)){
_c0=_c0||dojo.global;
if(!_c0[_c1]){
throw (["dojo.hitch: scope[\"",_c1,"\"] is null (scope=\"",_c0,"\")"].join(""));
}
return function(){
return _c0[_c1].apply(_c0,arguments||[]);
};
}else{
return (!_c0?_c1:function(){
return _c1.apply(_c0,arguments||[]);
});
}
};
dojo._delegate=function(obj,_c3){
function TMP(){
};
TMP.prototype=obj;
var tmp=new TMP();
if(_c3){
dojo.mixin(tmp,_c3);
}
return tmp;
};
dojo.partial=function(_c5){
var arr=[null];
return dojo.hitch.apply(dojo,arr.concat(dojo._toArray(arguments)));
};
dojo._toArray=function(obj,_c8){
var arr=[];
for(var x=_c8||0;x<obj.length;x++){
arr.push(obj[x]);
}
return arr;
};
dojo.provide("dojo._base.declare");
dojo.declare=function(_cb,_cc,_cd,_ce){
if(dojo.isFunction(_ce)||(!_ce&&!dojo.isFunction(_cd))){
var t=_ce;
_ce=_cd;
_cd=t;
}
var _d0=function(){
this._construct(arguments);
};
var dd=dojo.declare,p=_ce||{},_d3=[],pc;
if(dojo.isArray(_cc)){
_d3=_cc;
_cc=_d3.shift();
}
var scp=_cc?_cc.prototype:null;
if(scp){
_d0.prototype=dojo._delegate(scp);
}
dojo.mixin(_d0,{superclass:scp,mixins:_d3,extend:dd._extend});
for(var i=0,m;(m=_d3[i]);i++){
dojo.extend(_d0,m.prototype);
}
_cd=_cd||(pc=p.constructor)&&(pc!=Object)&&pc||null;
dojo.extend(_d0,{declaredClass:_cb,_initializer:_cd,preamble:null},p,dd._core);
_d0.prototype.constructor=_d0;
return dojo.setObject(_cb,_d0);
};
dojo.mixin(dojo.declare,{_extend:function(_d8,_d9){
dojo.extend(this,_d8);
this.mixins.push(!_d9?_d8:function(){
_d8.apply(this,_d9.apply(this,arguments)||arguments);
});
},_core:{_construct:function(_da){
var c=_da.callee,s=c.superclass,ct=s&&s.constructor,a=_da,ii;
if(fn=c.prototype.preamble){
a=fn.apply(this,a)||a;
}
if(ct&&ct.apply){
ct.apply(this,a);
}
for(var i=0,m;(m=c.mixins[i]);i++){
if(m.apply){
m.apply(this,a);
}
}
var ii=c.prototype._initializer;
if(ii){
ii.apply(this,_da);
}
},inherited:function(_e2,_e3,_e4){
var c=_e3.callee,p=this.constructor.prototype,a=_e4||_e3,fn;
if(this[_e2]!=c||p[_e2]==c){
while(p&&(p[_e2]!==c)){
p=p.constructor.superclass;
}
if(!p){
throw (this.toString()+": name argument (\""+_e2+"\") to inherited must match callee (declare.js)");
}
while(p&&(p[_e2]==c)){
p=p.constructor.superclass;
}
}
return (fn=p&&p[_e2])&&(fn.apply(this,a));
}}});
dojo.provide("dojo._base.connect");
dojo._listener={getDispatcher:function(){
return function(){
var ls=arguments.callee.listeners;
for(var i in ls){
if(!(i in Array.prototype)){
ls[i].apply(this,arguments);
}
}
};
},add:function(_eb,_ec,_ed){
_eb=_eb||dojo.global;
var f=_eb[_ec];
if(!f||!f.listeners){
var d=dojo._listener.getDispatcher();
d.listeners=(f?[f]:[]);
f=_eb[_ec]=d;
}
return f.listeners.push(_ed);
},remove:function(_f0,_f1,_f2){
var f=(_f0||dojo.global)[_f1];
if(f&&f.listeners&&_f2--){
delete f.listeners[_f2];
}
}};
dojo.connect=function(obj,_f5,_f6,_f7,_f8){
var a=arguments,_fa=[],i=0;
_fa.push(dojo.isString(a[0])?null:a[i++],a[i++]);
var a1=a[i+1];
_fa.push(dojo.isString(a1)||dojo.isFunction(a1)?a[i++]:null,a[i++]);
for(var l=a.length;i<l;i++){
_fa.push(a[i]);
}
return dojo._connect.apply(this,_fa);
};
dojo._connect=function(obj,_ff,_100,_101){
var h=dojo._listener.add(obj,_ff,dojo.hitch(_100,_101));
return [obj,_ff,h];
};
dojo.disconnect=function(_103){
dojo._disconnect.apply(this,_103);
if(_103&&_103[0]!=undefined){
dojo._disconnect.apply(this,_103);
delete _103[0];
}
};
dojo._disconnect=function(obj,_105,_106){
dojo._listener.remove(obj,_105,_106);
};
dojo._topics={};
dojo.subscribe=function(_107,_108,_109){
return [_107,dojo._listener.add(dojo._topics,_107,dojo.hitch(_108,_109))];
};
dojo.unsubscribe=function(_10a){
dojo._listener.remove(dojo._topics,_10a[0],_10a[1]);
};
dojo.publish=function(_10b,args){
var f=dojo._topics[_10b];
(f)&&(f.apply(this,args||[]));
};
dojo.provide("dojo._base.Deferred");
dojo.Deferred=function(_10e){
this.chain=[];
this.id=this._nextId();
this.fired=-1;
this.paused=0;
this.results=[null,null];
this.canceller=_10e;
this.silentlyCancelled=false;
};
dojo.extend(dojo.Deferred,{_getFunctionFromArgs:function(){
var a=arguments;
if((a[0])&&(!a[1])){
if(dojo.isFunction(a[0])){
return a[0];
}else{
if(dojo.isString(a[0])){
return dojo.global[a[0]];
}
}
}else{
if((a[0])&&(a[1])){
return dojo.hitch(a[0],a[1]);
}
}
return null;
},makeCalled:function(){
var _110=new dojo.Deferred();
_110.callback();
return _110;
},toString:function(){
var _111;
if(this.fired==-1){
_111="unfired";
}else{
if(this.fired==0){
_111="success";
}else{
_111="error";
}
}
return "Deferred("+this.id+", "+_111+")";
},_nextId:(function(){
var n=1;
return function(){
return n++;
};
})(),cancel:function(){
if(this.fired==-1){
if(this.canceller){
this.canceller(this);
}else{
this.silentlyCancelled=true;
}
if(this.fired==-1){
this.errback(new Error(this.toString()));
}
}else{
if((this.fired==0)&&(this.results[0] instanceof dojo.Deferred)){
this.results[0].cancel();
}
}
},_pause:function(){
this.paused++;
},_unpause:function(){
this.paused--;
if((this.paused==0)&&(this.fired>=0)){
this._fire();
}
},_continue:function(res){
this._resback(res);
this._unpause();
},_resback:function(res){
this.fired=((res instanceof Error)?1:0);
this.results[this.fired]=res;
this._fire();
},_check:function(){
if(this.fired!=-1){
if(!this.silentlyCancelled){
throw new Error("already called!");
}
this.silentlyCancelled=false;
return;
}
},callback:function(res){
this._check();
this._resback(res);
},errback:function(res){
this._check();
if(!(res instanceof Error)){
res=new Error(res);
}
this._resback(res);
},addBoth:function(cb,cbfn){
var _119=this._getFunctionFromArgs(cb,cbfn);
if(arguments.length>2){
_119=dojo.partial(_119,arguments,2);
}
return this.addCallbacks(_119,_119);
},addCallback:function(cb,cbfn){
var _11c=this._getFunctionFromArgs(cb,cbfn);
if(arguments.length>2){
_11c=dojo.partial(_11c,arguments,2);
}
return this.addCallbacks(_11c,null);
},addErrback:function(cb,cbfn){
var _11f=this._getFunctionFromArgs(cb,cbfn);
if(arguments.length>2){
_11f=dojo.partial(_11f,arguments,2);
}
return this.addCallbacks(null,_11f);
return this.addCallbacks(null,cbfn);
},addCallbacks:function(cb,eb){
this.chain.push([cb,eb]);
if(this.fired>=0){
this._fire();
}
return this;
},_fire:function(){
var _122=this.chain;
var _123=this.fired;
var res=this.results[_123];
var self=this;
var cb=null;
while((_122.length>0)&&(this.paused==0)){
var pair=_122.shift();
var f=pair[_123];
if(f==null){
continue;
}
try{
res=f(res);
_123=((res instanceof Error)?1:0);
if(res instanceof dojo.Deferred){
cb=function(res){
self._continue(res);
};
this._pause();
}
}
catch(err){
_123=1;
res=err;
}
}
this.fired=_123;
this.results[_123]=res;
if((cb)&&(this.paused)){
res.addBoth(cb);
}
}});
dojo.provide("dojo._base.json");
dojo.fromJson=function(json){
try{
return eval("("+json+")");
}
catch(e){
console.debug(e);
return json;
}
};
dojo._escapeString=function(str){
return ("\""+str.replace(/(["\\])/g,"\\$1")+"\"").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r");
};
dojo.toJsonIndentStr="\t";
dojo.toJson=function(it,_12d,_12e){
_12e=_12e||"";
var _12f=(_12d?_12e+dojo.toJsonIndentStr:"");
var _130=(_12d?"\n":"");
var _131=typeof (it);
if(_131=="undefined"){
return "undefined";
}else{
if((_131=="number")||(_131=="boolean")){
return it+"";
}else{
if(it===null){
return "null";
}
}
}
if(_131=="string"){
return dojo._escapeString(it);
}
var _132=arguments.callee;
var _133;
if(typeof it.__json__=="function"){
_133=it.__json__();
if(it!==_133){
return _132(_133,_12d,_12f);
}
}
if(typeof it.json=="function"){
_133=it.json();
if(it!==_133){
return _132(_133,_12d,_12f);
}
}
if(dojo.isArray(it)){
var res=[];
for(var i=0;i<it.length;i++){
var val=_132(it[i],_12d,_12f);
if(typeof (val)!="string"){
val="undefined";
}
res.push(_130+_12f+val);
}
return "["+res.join(",")+_130+_12e+"]";
}
if(_131=="function"){
return null;
}
var _137=[];
for(var key in it){
var _139;
if(typeof (key)=="number"){
_139="\""+key+"\"";
}else{
if(typeof (key)=="string"){
_139=dojo._escapeString(key);
}else{
continue;
}
}
val=_132(it[key],_12d,_12f);
if(typeof (val)!="string"){
continue;
}
_137.push(_130+_12f+_139+":"+val);
}
return "{"+_137.join(",")+_130+_12e+"}";
};
dojo.provide("dojo._base.array");
(function(){
var d=dojo;
if(Array.forEach){
var tn=["indexOf","lastIndexOf","every","some","forEach","filter","map"];
for(var x=0;x<tn.length;x++){
d[tn[x]]=Array[tn[x]];
}
}else{
var _13d=function(arr,obj){
return [(d.isString(arr)?arr.split(""):arr),(obj||d.global)];
};
d.mixin(d,{indexOf:function(_140,_141,_142,_143){
if(_143){
var step=-1,i=(_142||_140.length-1),end=-1;
}else{
var step=1,i=(_142||0),end=_140.length;
}
for(;i!=end;i+=step){
if(_140[i]==_141){
return i;
}
}
return -1;
},lastIndexOf:function(_147,_148,_149){
return d.indexOf(_147,_148,_149,true);
},map:function(arr,func,obj){
var _p=_13d(arr,obj);
arr=_p[0];
obj=_p[1];
var _14e=[];
for(var i=0;i<arr.length;++i){
_14e.push(func.call(obj,arr[i],i,arr));
}
return _14e;
},forEach:function(arr,_151,obj){
if((!arr)||(!arr.length)){
return;
}
var _p=_13d(arr,obj);
arr=_p[0];
obj=_p[1];
for(var i=0,l=arr.length;i<l;i++){
_151.call(obj,arr[i],i,arr);
}
},_everyOrSome:function(_156,arr,_158,obj){
var _p=_13d(arr,obj);
arr=_p[0];
obj=_p[1];
for(var i=0,l=arr.length;i<l;i++){
var _15d=_158.call(obj,arr[i],i,arr);
if(_156&&!_15d){
return false;
}else{
if((!_156)&&(_15d)){
return true;
}
}
}
return (!!_156);
},every:function(arr,_15f,_160){
return this._everyOrSome(true,arr,_15f,_160);
},some:function(arr,_162,_163){
return this._everyOrSome(false,arr,_162,_163);
},filter:function(arr,_165,obj){
var _p=_13d(arr,obj);
arr=_p[0];
obj=_p[1];
var _168=[];
for(var i=0;i<arr.length;i++){
if(_165.call(obj,arr[i],i,arr)){
_168.push(arr[i]);
}
}
return _168;
}});
}
})();
dojo.provide("dojo._base");
dojo.provide("dojo._base.event");
(function(){
var de={addListener:function(node,_16c,fp){
if(!node){
return;
}
_16c=de._normalizeEventName(_16c);
fp=de._fixCallback(_16c,fp);
node.addEventListener(_16c,fp,false);
return fp;
},removeListener:function(node,_16f,_170){
(node)&&(node.removeEventListener(de._normalizeEventName(_16f),_170,false));
},_normalizeEventName:function(name){
return (name.slice(0,2)=="on"?name.slice(2):name);
},_fixCallback:function(name,fp){
return (name!="keypress"?fp:function(e){
return fp.call(this,de._fixEvent(e,this));
});
},_fixEvent:function(evt,_176){
switch(evt.type){
case "keypress":
de._setKeyChar(evt);
break;
}
return evt;
},_setKeyChar:function(evt){
evt.keyChar=(evt.charCode?String.fromCharCode(evt.charCode):"");
}};
dojo.fixEvent=function(evt,_179){
return de._fixEvent(evt,_179);
};
dojo.stopEvent=function(evt){
evt.preventDefault();
evt.stopPropagation();
};
addListener=function(node,_17c,_17d,_17e){
return de.addListener(node,_17c,dojo.hitch(_17d,_17e));
};
removeListener=function(node,_180,_181){
de.removeListener(node,_180,_181);
};
var dc=dojo._connect;
var dd=dojo._disconnect;
dojo._connect=function(obj,_185,_186,_187,_188){
_188=Boolean(!obj||!(obj.nodeType||obj.attachEvent||obj.addEventListener)||_188);
var h=(_188?dc.apply(this,arguments):[obj,_185,addListener.apply(this,arguments)]);
h.push(_188);
return h;
};
dojo._disconnect=function(obj,_18b,_18c,_18d){
(_18d?dd:removeListener).apply(this,arguments);
};
dojo.keys={BACKSPACE:8,TAB:9,CLEAR:12,ENTER:13,SHIFT:16,CTRL:17,ALT:18,PAUSE:19,CAPS_LOCK:20,ESCAPE:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT_ARROW:37,UP_ARROW:38,RIGHT_ARROW:39,DOWN_ARROW:40,INSERT:45,DELETE:46,HELP:47,LEFT_WINDOW:91,RIGHT_WINDOW:92,SELECT:93,NUMPAD_0:96,NUMPAD_1:97,NUMPAD_2:98,NUMPAD_3:99,NUMPAD_4:100,NUMPAD_5:101,NUMPAD_6:102,NUMPAD_7:103,NUMPAD_8:104,NUMPAD_9:105,NUMPAD_MULTIPLY:106,NUMPAD_PLUS:107,NUMPAD_ENTER:108,NUMPAD_MINUS:109,NUMPAD_PERIOD:110,NUMPAD_DIVIDE:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,F13:124,F14:125,F15:126,NUM_LOCK:144,SCROLL_LOCK:145};
if(dojo.isIE){
_trySetKeyCode=function(e,code){
try{
return e.keyCode=code;
}
catch(e){
return 0;
}
};
var ap=Array.prototype;
var iel=dojo._listener;
if((dojo.isIE<7)&&(!djConfig._allow_leaks)){
iel=dojo._ie_listener={handlers:[],add:function(_192,_193,_194){
_192=_192||dojo.global;
var f=d=_192[_193];
if(!d||!d.listeners){
d=_192[_193]=dojo._getIeDispatcher();
d.listeners=(f?[ieh.push(f)-1]:[]);
}
return d.listeners.push(ieh.push(_194)-1);
},remove:function(_197,_198,_199){
var f=(_197||dojo.global)[_198],l=f&&f.listeners;
if(f&&l&&_199--){
delete ieh[l[_199]];
delete l[_199];
}
}};
var ieh=iel.handlers;
}
dojo.mixin(de,{addListener:function(node,_19d,fp){
if(!node){
return;
}
_19d=de._normalizeEventName(_19d);
if(_19d=="onkeypress"){
var kd=node.onkeydown;
if(!kd||!kd.listeners||!kd._stealthKeydown){
de.addListener(node,"onkeydown",de._stealthKeyDown);
node.onkeydown._stealthKeydown=true;
}
}
return iel.add(node,_19d,de._fixCallback(fp,node));
},removeListener:function(node,_1a1,_1a2){
iel.remove(node,de._normalizeEventName(_1a1),_1a2);
},_normalizeEventName:function(_1a3){
return (_1a3.slice(0,2)!="on"?"on"+_1a3:_1a3);
},_nop:function(){
},_fixCallback:function(fp,_1a5){
return function(e){
return fp.call(this,de._fixEvent(e,_1a5));
};
},_fixEvent:function(evt,_1a8){
if(!evt){
var w=(_1a8)&&((_1a8.ownerDocument||_1a8.document||_1a8).parentWindow)||window;
evt=w.event;
}
evt.target=evt.srcElement;
evt.currentTarget=(_1a8||evt.srcElement);
evt.layerX=evt.offsetX;
evt.layerY=evt.offsetY;
var se=evt.srcElement,doc=(se&&se.ownerDocument)||document;
var _1ac=((dojo.isIE<6)||(doc["compatMode"]=="BackCompat"))?doc.body:doc.documentElement;
evt.pageX=evt.clientX+(_1ac.scrollLeft||0);
evt.pageY=evt.clientY+(_1ac.scrollTop||0);
if(evt.type=="mouseover"){
evt.relatedTarget=evt.fromElement;
}
if(evt.type=="mouseout"){
evt.relatedTarget=evt.toElement;
}
evt.stopPropagation=this._stopPropagation;
evt.preventDefault=this._preventDefault;
return this._fixKeys(evt);
},_fixKeys:function(evt){
switch(evt.type){
case "keypress":
var c=("charCode" in evt?evt.charCode:evt.keyCode);
if(c==10){
c=0;
evt.keyCode=13;
}else{
if(c==13||c==27){
c=0;
}else{
if(c==3){
c=99;
}
}
}
evt.charCode=c;
de._setKeyChar(evt);
break;
}
return evt;
},_punctMap:{106:42,111:47,186:59,187:43,188:44,189:45,190:46,191:47,192:96,219:91,220:92,221:93,222:39},_stealthKeyDown:function(evt){
var kp=evt.currentTarget.onkeypress;
if(!kp||!kp.listeners){
return;
}
var k=evt.keyCode;
var _1b2=(k!=13)&&(k!=32)&&(k!=27)&&(k<48||k>90)&&(k<96||k>111)&&(k<186||k>192)&&(k<219||k>222);
if(_1b2||evt.ctrlKey){
var c=(_1b2?0:k);
if(evt.ctrlKey){
if(k==3||k==13){
return;
}else{
if(c>95&&c<106){
c-=48;
}else{
if((!evt.shiftKey)&&(c>=65&&c<=90)){
c+=32;
}else{
c=de._punctMap[c]||c;
}
}
}
}
var faux=de._synthesizeEvent(evt,{type:"keypress",faux:true,charCode:c});
kp.call(evt.currentTarget,faux);
evt.cancelBubble=faux.cancelBubble;
evt.returnValue=faux.returnValue;
_trySetKeyCode(evt,faux.keyCode);
}
},_stopPropagation:function(){
this.cancelBubble=true;
},_preventDefault:function(){
_trySetKeyCode(this,0);
this.returnValue=false;
}});
dojo.stopEvent=function(evt){
evt=evt||window.event;
de._stopPropagation.call(evt);
de._preventDefault.call(evt);
};
}
de._synthesizeEvent=function(evt,_1b7){
var faux=dojo.mixin({},evt,_1b7);
de._setKeyChar(faux);
faux.preventDefault=function(){
evt.preventDefault();
};
faux.stopPropagation=function(){
evt.stopPropagation();
};
return faux;
};
if(dojo.isOpera){
dojo.mixin(de,{_fixEvent:function(evt,_1ba){
switch(evt.type){
case "keypress":
var c=evt.which;
if(c==3){
c=99;
}
c=((c<41)&&(!evt.shiftKey)?0:c);
if((evt.ctrlKey)&&(!evt.shiftKey)&&(c>=65)&&(c<=90)){
c+=32;
}
return de._synthesizeEvent(evt,{charCode:c});
}
return evt;
}});
}
if(dojo.isSafari){
dojo.mixin(de,{_fixEvent:function(evt,_1bd){
switch(evt.type){
case "keypress":
var c=evt.charCode,s=evt.shiftKey;
if(evt.keyIdentifier=="Enter"){
c=0;
}else{
if((evt.ctrlKey)&&(c>0)&&(c<27)){
c+=96;
}else{
if(c==dojo.keys.SHIFT_TAB){
c=dojo.keys.TAB;
s=true;
}else{
c=(c>=32&&c<63232?c:0);
}
}
}
return de._synthesizeEvent(evt,{charCode:c,shiftKey:s});
}
return evt;
}});
dojo.mixin(dojo.keys,{SHIFT_TAB:25,UP_ARROW:63232,DOWN_ARROW:63233,LEFT_ARROW:63234,RIGHT_ARROW:63235,F1:63236,F2:63237,F3:63238,F4:63239,F5:63240,F6:63241,F7:63242,F8:63243,F9:63244,F10:63245,F11:63246,F12:63247,PAUSE:63250,DELETE:63272,HOME:63273,END:63275,PAGE_UP:63276,PAGE_DOWN:63277,INSERT:63302,PRINT_SCREEN:63248,SCROLL_LOCK:63249,NUM_LOCK:63289});
}
})();
if(dojo.isIE<7){
dojo._getIeDispatcher=function(){
return function(){
var ap=Array.prototype,ls=arguments.callee.listeners,h=dojo._ie_listener.handlers;
for(var i in ls){
if(!(i in ap)){
h[ls[i]].apply(this,arguments);
}
}
};
};
}
dojo.provide("dojo._base.html");
try{
document.execCommand("BackgroundImageCache",false,true);
}
catch(e){
}
dojo.createElement=function(obj,_1c5,_1c6){
};
if(dojo.isIE&&(dojo.isIE<7)){
dojo.byId=function(id,doc){
if(dojo.isString(id)){
var _d=(doc||dojo.doc);
var te=_d.getElementById(id);
if((te)&&(te.id==id)){
return te;
}else{
var eles=_d.all[id];
if(!eles){
return;
}
if(!eles.length){
return eles;
}
var i=0;
while(te=eles[i++]){
if(te.id==id){
return te;
}
}
}
}else{
return id;
}
};
}else{
dojo.byId=function(id,doc){
if(dojo.isString(id)){
return (doc||dojo.doc).getElementById(id);
}else{
return id;
}
};
}
(function(){
var _1cf=function(node,ref){
ref.parentNode.insertBefore(node,ref);
return true;
};
var _1d2=function(node,ref){
var pn=ref.parentNode;
if(ref==pn.lastChild){
pn.appendChild(node);
}else{
return _1cf(node,ref.nextSibling);
}
return true;
};
dojo.place=function(node,_1d7,_1d8){
if((!node)||(!_1d7)||(typeof _1d8=="undefined")){
return false;
}
if(typeof _1d8=="number"){
var cn=_1d7.childNodes;
if(((_1d8==0)&&(cn.length==0))||(cn.length==_1d8)){
_1d7.appendChild(node);
return true;
}
if(_1d8==0){
return _1cf(node,_1d7.firstChild);
}
return _1d2(node,cn[_1d8-1]);
}
switch(_1d8.toLowerCase()){
case "before":
return _1cf(node,_1d7);
case "after":
return _1d2(node,_1d7);
case "first":
if(_1d7.firstChild){
return _1cf(node,_1d7.firstChild);
}else{
_1d7.appendChild(node);
return true;
}
break;
default:
_1d7.appendChild(node);
return true;
}
};
dojo.boxModel="content-box";
if(dojo.isIE){
var _dcm=document.compatMode;
dojo.boxModel=(_dcm=="BackCompat")||(_dcm=="QuirksMode")||(dojo.isIE<6)?"border-box":"content-box";
}
if(!dojo.isIE){
var dv=document.defaultView;
dojo.getComputedStyle=((dojo.isSafari)?function(node){
var s=dv.getComputedStyle(node,null);
if(!s){
node.style.display="";
s=dv.getComputedStyle(node,null);
}
return s;
}:function(node){
return dv.getComputedStyle(node,null);
});
dojo._toPixelValue=function(_1df,_1e0){
return (parseFloat(_1e0)||0);
};
}else{
dojo.getComputedStyle=function(node){
return node.currentStyle;
};
dojo._toPixelValue=function(_1e2,_1e3){
if(!_1e3){
return 0;
}
if(_1e3.slice&&(_1e3.slice(-2)=="px")){
return parseFloat(_1e3);
}
with(_1e2){
var _1e4=style.left;
var _1e5=runtimeStyle.left;
runtimeStyle.left=currentStyle.left;
try{
style.left=_1e3;
_1e3=style.pixelLeft;
}
catch(e){
_1e3=0;
}
style.left=_1e4;
runtimeStyle.left=_1e5;
}
return _1e3;
};
}
dojo._getOpacity=((dojo.isIE)?function(node){
try{
return (node.filters.alpha.opacity/100);
}
catch(e){
return 1;
}
}:function(node){
return node.style.opacity;
});
dojo._setOpacity=((dojo.isIE)?function(node,_1e9){
var o="Alpha(Opacity="+(_1e9*100)+")";
node.style.filter=o;
if(node.nodeName.toLowerCase=="tr"){
dojo.query("> td",node).forEach(function(i){
i.style.filter=o;
});
}
return _1e9;
}:function(node,_1ed){
node.style.opacity=_1ed;
});
var _1ee={width:true,height:true,left:true,top:true};
var _1ef=function(node,type,_1f2){
if(_1ee[type]===true){
return dojo._toPixelValue(node,_1f2);
}else{
if(_1ee[type]===false){
return _1f2;
}else{
type=type.toLowerCase();
if((type.indexOf("margin")>=0)||(type.indexOf("padding")>=0)||(type.indexOf("width")>=0)||(type.indexOf("height")>=0)||(type.indexOf("max")>=0)||(type.indexOf("min")>=0)||(type.indexOf("offset")>=0)){
_1ee[type]=true;
return dojo._toPixelValue(node,_1f2);
}else{
_1ee[type]=false;
return _1f2;
}
}
}
};
dojo.style=function(){
var _a=arguments;
var _a_l=_a.length;
if(!_a_l){
return;
}
var node=dojo.byId(_a[0]);
var io=((dojo.isIE)&&(_a[1]=="opacity"));
if(_a_l==3){
return (io)?dojo._setOpacity(node,_a[2]):node.style[_a[1]]=_a[2];
}
var s=dojo.getComputedStyle(node);
if(_a_l==1){
return s;
}
if(_a_l==2){
return (io)?dojo._getOpacity(node):_1ef(node,_a[1],s[_a[1]]);
}
};
dojo._getPadBounds=function(n,_1f9){
var s=_1f9||dojo.getComputedStyle(n),px=dojo._toPixelValue,l=px(n,s.paddingLeft),t=px(n,s.paddingTop);
return {l:l,t:t,w:l+px(n,s.paddingRight),h:t+px(n,s.paddingBottom)};
};
dojo._getPadBorderExtents=function(n,_1ff){
var s=_1ff||dojo.getComputedStyle(n),px=dojo._toPixelValue,p=dojo._getPadBounds(n,s),bw=(s.borderLeftStyle!="none"?px(n,s.borderLeftWidth):0)+(s.borderRightStyle!="none"?px(n,s.borderRightWidth):0),bh=(s.borderTopStyle!="none"?px(n,s.borderTopWidth):0)+(s.borderBottomStyle!="none"?px(n,s.borderBottomWidth):0);
return {w:p.w+bw,h:p.h+bh};
};
dojo._getMarginExtents=function(n,_206){
var s=_206||dojo.getComputedStyle(n),px=dojo._toPixelValue;
return {w:px(n,s.marginLeft)+px(n,s.marginRight),h:px(n,s.marginTop)+px(n,s.marginBottom)};
};
if(dojo.isMoz){
dojo._getMarginBox=function(node,_20a){
var s=_20a||dojo.getComputedStyle(node);
var mb=dojo._getMarginExtents(node,s);
return {l:parseFloat(s.left)||0,t:parseFloat(s.top)||0,w:node.offsetWidth+mb.w,h:node.offsetHeight+mb.h};
};
}else{
dojo._getMarginBox=function(node,_20e){
var mb=dojo._getMarginExtents(node,_20e);
return {l:node.offsetLeft,t:node.offsetTop,w:node.offsetWidth+mb.w,h:node.offsetHeight+mb.h};
};
}
dojo._getContentBox=function(node,_211){
var pb=dojo._getPadBounds(node,_211);
return {l:pb.l,t:pb.t,w:node.clientWidth-pb.w,h:node.clientHeight-pb.h};
};
dojo._setBox=function(node,l,t,w,h,u){
u=u||"px";
with(node.style){
if(!isNaN(l)){
left=l+u;
}
if(!isNaN(t)){
top=t+u;
}
if(w>=0){
width=w+u;
}
if(h>=0){
height=h+u;
}
}
};
dojo._setContentBox=function(node,_21a,_21b,_21c,_21d,_21e){
if(dojo.boxModel=="border-box"){
var pb=dojo._getPadBorderExtents(node,_21e);
if(_21c>=0){
_21c+=pb.w;
}
if(_21d>=0){
_21d+=pb.h;
}
}
dojo._setBox(node,_21a,_21b,_21c,_21d);
};
dojo._nilExtents={w:0,h:0};
dojo._setMarginBox=function(node,_221,_222,_223,_224,_225){
var s=_225||dojo.getComputedStyle(node);
var pb=((dojo.boxModel=="border-box")?dojo._nilExtents:dojo._getPadBorderExtents(node,s));
var mb=dojo._getMarginExtents(node,s);
if(_223>=0){
_223=Math.max(_223-pb.w-mb.w,0);
}
if(_224>=0){
_224=Math.max(_224-pb.h-mb.h,0);
}
dojo._setBox(node,_221,_222,_223,_224);
};
dojo.marginBox=function(node,_22a){
node=dojo.byId(node);
var s=dojo.getComputedStyle(node),b=_22a;
return !b?dojo._getMarginBox(node,s):dojo._setMarginBox(node,b.l,b.t,b.w,b.h,s);
};
dojo.contentBox=function(node,_22e){
node=dojo.byId(node);
var s=dojo.getComputedStyle(node),b=_22e;
return !b?dojo._getContentBox(node,s):dojo._setContentBox(node,b.l,b.t,b.w,b.h,s);
};
var _231=function(node,prop){
if(!node){
return 0;
}
var _b=dojo.body();
var _235=0;
while(node){
try{
if(dojo.getComputedStyle(node).position=="fixed"){
return 0;
}
}
catch(e){
}
var val=node[prop];
if(val){
_235+=val-0;
if(node==_b){
break;
}
}
node=node.parentNode;
}
return _235;
};
dojo._docScroll=function(){
var _b=dojo.body();
var _w=dojo.global;
var de=dojo.doc.documentElement;
return {y:(_w.pageYOffset||de.scrollTop||_b.scrollTop||0),x:(_w.pageXOffset||de.scrollLeft||_b.scrollLeft||0)};
};
var _23a=((dojo.isIE>=7)&&(dojo.boxModel!="border-box"))?2:0;
dojo._abs=function(node,_23c){
var _23d=dojo.doc;
var ret={x:0,y:0};
var db=dojo.body();
if(dojo.isIE){
with(node.getBoundingClientRect()){
ret.x=left-_23a;
ret.y=top-_23a;
}
}else{
if(_23d["getBoxObjectFor"]){
var bo=_23d.getBoxObjectFor(node);
ret.x=bo.x-_231(node,"scrollLeft");
ret.y=bo.y-_231(node,"scrollTop");
}else{
if(node["offsetParent"]){
var _241;
if((dojo.isSafari)&&(node.style.getPropertyValue("position")=="absolute")&&(node.parentNode==db)){
_241=db;
}else{
_241=db.parentNode;
}
if(node.parentNode!=db){
var nd=node;
if(dojo.isOpera){
nd=db;
}
ret.x-=_231(nd,"scrollLeft");
ret.y-=_231(nd,"scrollTop");
}
var _243=node;
do{
var n=_243["offsetLeft"];
if(!dojo.isOpera||n>0){
ret.x+=isNaN(n)?0:n;
}
var m=_243["offsetTop"];
ret.y+=isNaN(m)?0:m;
_243=_243.offsetParent;
}while((_243!=_241)&&(_243!=null));
}else{
if(node["x"]&&node["y"]){
ret.x+=isNaN(node.x)?0:node.x;
ret.y+=isNaN(node.y)?0:node.y;
}
}
}
}
if(_23c){
var _246=dojo._docScroll();
ret.y+=_246.y;
ret.x+=_246.x;
}
return ret;
};
dojo.coords=function(node,_248){
node=dojo.byId(node);
var s=dojo.getComputedStyle(node);
var mb=dojo._getMarginBox(node,s);
var abs=dojo._abs(node,_248);
mb.x=abs.x;
mb.y=abs.y;
return mb;
};
})();
dojo.hasClass=function(node,_24d){
return ((" "+node.className+" ").indexOf(" "+_24d+" ")>=0);
};
dojo.addClass=function(node,_24f){
var cls=node.className;
if((" "+cls+" ").indexOf(" "+_24f+" ")<0){
node.className=cls+(cls?" ":"")+_24f;
}
};
dojo.removeClass=function(node,_252){
var cls=node.className;
if(cls&&cls.indexOf(_252)>=0){
node.className=cls.replace(new RegExp("(^|\\s+)"+_252+"(\\s+|$)"),"$1$2");
}
};
dojo.toggleClass=function(node,_255,_256){
if(typeof _256=="undefined"){
_256=!dojo.hasClass(node,_255);
}
dojo[_256?"addClass":"removeClass"](node,_255);
};
dojo.provide("dojo._base.NodeList");
(function(){
var d=dojo;
dojo.NodeList=function(){
if((arguments.length==1)&&(typeof arguments[0]=="number")){
this.length=parseInt(arguments[0]);
}else{
if((arguments.length==1)&&(arguments[0].constructor==dojo.NodeList)){
}else{
for(var x=0;x<arguments.length;x++){
this.push(arguments[x]);
}
}
}
};
dojo.NodeList.prototype=new Array;
dojo.extend(dojo.NodeList,{box:function(){
return dojo.coords(this[0]);
},boxes:function(){
var ret=[];
this.forEach(function(item){
ret.push(dojo.coords(item));
});
return ret;
},style:function(prop){
var aa=dojo._toArray(arguments);
aa.unshift(this[0]);
return dojo.style.apply(dojo,aa);
},styles:function(prop){
var aa=dojo._toArray(arguments);
aa.unshift(null);
return this.map(function(i){
aa[0]=i;
return dojo.style.apply(dojo,aa);
});
},place:function(_260,_261){
var item=d.query(_260)[0];
_261=_261||"last";
for(var x=0;x<this.length;x++){
d.place(this[x],item,_261);
}
return this;
},orphan:function(_264){
var _265=d._filterQueryResult(this,_264);
_265.forEach(function(item){
if(item["parentNode"]){
item.parentNode.removeChild(item);
}
});
return _265;
},adopt:function(_267,_268){
var item=this[0];
_268=_268||"last";
var _26a=d.query(_267);
for(var x=0;x<_26a.length;x++){
d.place(_26a[x],item,_268);
}
return _26a;
},query:function(_26c){
_26c=_26c||"";
var ret=new d.NodeList();
this.forEach(function(item){
d.query(_26c,item).forEach(function(_26f){
if(typeof _26f!="undefined"){
ret.push(_26f);
}
});
});
return ret;
},filter:function(_270){
var _271=this;
var _a=arguments;
var r=new d.NodeList();
var rp=function(t){
if(typeof t!="undefined"){
r.push(t);
}
};
if(dojo.isString(_270)){
_271=d._filterQueryResult(this,_a[0]);
if(_a.length==1){
return _271;
}
d.forEach(d.filter(_271,_a[1],_a[2]),rp);
return r;
}
d.forEach(d.filter(_271,_a[0],_a[1]),rp);
return r;
},addContent:function(_276,_277){
var ta=dojo.doc.createElement("span");
if(dojo.isString(_276)){
ta.innerHTML=_276;
}else{
ta.appendChild(_276);
}
var ct=((_277=="first")||(_277=="after"))?"lastChild":"firstChild";
this.forEach(function(item){
var tn=ta.cloneNode(true);
while(tn[ct]){
d.place(tn[ct],item,_277);
}
});
return this;
}});
if(!Array.forEach){
dojo.extend(dojo.NodeList,{indexOf:function(_27c,_27d){
return d.indexOf(this,_27c,_27d);
},lastIndexOf:function(_27e,_27f){
return d.lastIndexOf(this,_27e,_27f);
},forEach:function(_280,_281){
return d.forEach(this,_280,_281);
},every:function(_282,_283){
return d.every(this,_282,_283);
},some:function(_284,_285){
return d.some(this,_284,_285);
},map:function(_286,obj){
return d.map(this,_286,obj);
}});
}
if(d.isIE){
var _288=function(_289){
return ("var a2 = parent."+_289+"; "+"var ap = Array.prototype; "+"var a2p = a2.prototype; "+"for(var x in a2p){ ap[x] = a2p[x]; } "+"parent."+_289+" = Array; ");
};
var scs=_288("dojo.NodeList");
var _28b=window.createPopup();
_28b.document.write("<script>"+scs+"</script>");
_28b.show(1,1,1,1);
}
})();
dojo.provide("dojo._base.query");
(function(){
var d=dojo;
var _28d=function(q){
return [q.indexOf("#"),q.indexOf("."),q.indexOf("["),q.indexOf(":")];
};
var _28f=function(_290,_291){
var ql=_290.length;
var i=_28d(_290);
var end=ql;
for(var x=_291;x<i.length;x++){
if(i[x]>=0){
if(i[x]<end){
end=i[x];
}
}
}
return (end<0)?ql:end;
};
var _296=function(_297){
return _28f(_297,1);
};
var _298=function(_299){
var i=_28d(_299);
if(i[0]!=-1){
return _299.substring(i[0]+1,_296(_299));
}else{
return "";
}
};
var _29b=function(_29c){
var i=_28d(_29c);
if((i[0]==0)||(i[1]==0)){
return 0;
}else{
return _28f(_29c,0);
}
};
var _29e=function(_29f){
var _2a0=_29b(_29f);
return ((_2a0>0)?_29f.substr(0,_2a0).toLowerCase():"*");
};
var _2a1=function(arr){
var ret=-1;
for(var x=0;x<arr.length;x++){
var ta=arr[x];
if(ta>=0){
if((ta>ret)||(ret==-1)){
ret=ta;
}
}
}
return ret;
};
var _2a6=function(_2a7){
var i=_28d(_2a7);
if(-1==i[1]){
return "";
}
var di=i[1]+1;
var _2aa=_2a1(i.slice(2));
if(di<_2aa){
return _2a7.substring(di,_2aa);
}else{
if(-1==_2aa){
return _2a7.substr(di);
}else{
return "";
}
}
};
var _2ab=[{key:"|=",match:function(attr,_2ad){
return "[contains(concat(' ',@"+attr+",' '), ' "+_2ad+"-')]";
}},{key:"~=",match:function(attr,_2af){
return "[contains(concat(' ',@"+attr+",' '), ' "+_2af+" ')]";
}},{key:"^=",match:function(attr,_2b1){
return "[starts-with(@"+attr+", '"+_2b1+"')]";
}},{key:"*=",match:function(attr,_2b3){
return "[contains(@"+attr+", '"+_2b3+"')]";
}},{key:"$=",match:function(attr,_2b5){
return "[substring(@"+attr+", string-length(@"+attr+")-"+(_2b5.length-1)+")='"+_2b5+"']";
}},{key:"!=",match:function(attr,_2b7){
return "[not(@"+attr+"='"+_2b7+"')]";
}},{key:"=",match:function(attr,_2b9){
return "[@"+attr+"='"+_2b9+"']";
}}];
var _2ba=function(val){
var re=/^\s+|\s+$/g;
return val.replace(re,"");
};
var _2bd=function(_2be,_2bf,_2c0,_2c1){
var _2c2;
var i=_28d(_2bf);
if(i[2]>=0){
var _2c4=_2bf.indexOf("]",i[2]);
var _2c5=_2bf.substring(i[2]+1,_2c4);
while(_2c5&&_2c5.length){
if(_2c5.charAt(0)=="@"){
_2c5=_2c5.slice(1);
}
_2c2=null;
for(var x=0;x<_2be.length;x++){
var ta=_2be[x];
var tci=_2c5.indexOf(ta.key);
if(tci>=0){
var attr=_2c5.substring(0,tci);
var _2ca=_2c5.substring(tci+ta.key.length);
if((_2ca.charAt(0)=="\"")||(_2ca.charAt(0)=="'")){
_2ca=_2ca.substring(1,_2ca.length-1);
}
_2c2=ta.match(_2ba(attr),_2ba(_2ca));
break;
}
}
if((!_2c2)&&(_2c5.length)){
_2c2=_2c0(_2c5);
}
if(_2c2){
_2c1(_2c2);
}
_2c5=null;
var _2cb=_2bf.indexOf("[",_2c4);
if(0<=_2cb){
_2c4=_2bf.indexOf("]",_2cb);
if(0<=_2c4){
_2c5=_2bf.substring(_2cb+1,_2c4);
}
}
}
}
};
var _2cc=function(_2cd){
var _2ce=".";
var _2cf=_2cd.split(" ");
while(_2cf.length){
var tqp=_2cf.shift();
var _2d1;
if(tqp==">"){
_2d1="/";
tqp=_2cf.shift();
}else{
_2d1="//";
}
var _2d2=_29e(tqp);
_2ce+=_2d1+_2d2;
var id=_298(tqp);
if(id.length){
_2ce+="[@id='"+id+"'][1]";
}
var cn=_2a6(tqp);
if(cn.length){
var _2d5=" ";
if(cn.charAt(cn.length-1)=="*"){
_2d5="";
cn=cn.substr(0,cn.length-1);
}
_2ce+="[contains(concat(' ',@class,' '), ' "+cn+_2d5+"')]";
}
_2bd(_2ab,tqp,function(_2d6){
return "[@"+_2d6+"]";
},function(_2d7){
_2ce+=_2d7;
});
}
return _2ce;
};
var _2d8={};
var _2d9=function(path){
if(_2d8[path]){
return _2d8[path];
}
var doc=d.doc;
var _2dc=_2cc(path);
var tf=function(_2de){
var ret=[];
var _2e0;
try{
_2e0=doc.evaluate(_2dc,_2de,null,XPathResult.ANY_TYPE,null);
}
catch(e){
console.debug("failure in exprssion:",_2dc,"under:",_2de);
console.debug(e);
}
var _2e1=_2e0.iterateNext();
while(_2e1){
ret.push(_2e1);
_2e1=_2e0.iterateNext();
}
return ret;
};
return _2d8[path]=tf;
};
var _2e2={};
var _2e3={};
var _2e4=function(_2e5,_2e6){
if(!_2e5){
return _2e6;
}
if(!_2e6){
return _2e5;
}
return function(){
return _2e5.apply(window,arguments)&&_2e6.apply(window,arguments);
};
};
var _2e7=function(_2e8,_2e9,_2ea,idx){
var nidx=idx+1;
var _2ed=(_2e9.length==nidx);
var tqp=_2e9[idx];
if(tqp==">"){
var ecn=_2e8.childNodes;
if(!ecn.length){
return;
}
nidx++;
var _2ed=(_2e9.length==nidx);
var tf=_2f1(_2e9[idx+1]);
for(var x=ecn.length-1,te;x>=0,te=ecn[x];x--){
if(tf(te)){
if(_2ed){
_2ea.push(te);
}else{
_2e7(te,_2e9,_2ea,nidx);
}
}
if(x==0){
break;
}
}
}
var _2f4=_2f5(tqp)(_2e8);
if(_2ed){
while(_2f4.length){
_2ea.push(_2f4.shift());
}
}else{
while(_2f4.length){
_2e7(_2f4.shift(),_2e9,_2ea,nidx);
}
}
};
var _2f6=function(_2f7,_2f8){
ret=[];
var x=_2f7.length-1,te;
while(te=_2f7[x--]){
_2e7(te,_2f8,ret,0);
}
return ret;
};
var _2f1=function(_2fb){
if(_2e2[_2fb]){
return _2e2[_2fb];
}
var ff=null;
var _2fd=_29e(_2fb);
if(_2fd!="*"){
ff=_2e4(ff,function(elem){
var isTn=((elem.nodeType==1)&&(_2fd==elem.tagName.toLowerCase()));
return isTn;
});
}
var _300=_298(_2fb);
if(_300.length){
ff=_2e4(ff,function(elem){
return ((elem.nodeType==1)&&(elem.id==_300));
});
}
if(Math.max.apply(this,_28d(_2fb).slice(1))>=0){
ff=_2e4(ff,_302(_2fb));
}
return _2e2[_2fb]=ff;
};
var _303=function(node){
var pn=node.parentNode;
var pnc=pn.childNodes;
var nidx=-1;
var _308=pn.firstChild;
if(!_308){
return nidx;
}
var ci=node["__cachedIndex"];
var cl=pn["__cachedLength"];
if(((typeof cl=="number")&&(cl!=pnc.length))||(typeof ci!="number")){
pn["__cachedLength"]=pnc.length;
var idx=1;
do{
if(_308===node){
nidx=idx;
}
if(_308.nodeType==1){
_308["__cachedIndex"]=idx;
idx++;
}
_308=_308.nextSibling;
}while(_308);
}else{
nidx=ci;
}
return nidx;
};
var _30c=0;
var _30d=function(elem,attr){
var _310="";
if(attr=="class"){
return elem.className||_310;
}
if(attr=="for"){
return elem.htmlFor||_310;
}
return elem.getAttribute(attr,2)||_310;
};
var _311=[{key:"|=",match:function(attr,_313){
var _314=" "+_313+"-";
return function(elem){
var ea=" "+(elem.getAttribute(attr,2)||"");
return ((ea==_313)||(ea.indexOf(_314)==0));
};
}},{key:"^=",match:function(attr,_318){
return function(elem){
return (_30d(elem,attr).indexOf(_318)==0);
};
}},{key:"*=",match:function(attr,_31b){
return function(elem){
return (_30d(elem,attr).indexOf(_31b)>=0);
};
}},{key:"~=",match:function(attr,_31e){
var tval=" "+_31e+" ";
return function(elem){
var ea=" "+_30d(elem,attr)+" ";
return (ea.indexOf(tval)>=0);
};
}},{key:"$=",match:function(attr,_323){
var tval=" "+_323;
return function(elem){
var ea=" "+_30d(elem,attr);
return (ea.lastIndexOf(_323)==(ea.length-_323.length));
};
}},{key:"!=",match:function(attr,_328){
return function(elem){
return (_30d(elem,attr)!=_328);
};
}},{key:"=",match:function(attr,_32b){
return function(elem){
return (_30d(elem,attr)==_32b);
};
}}];
var _32d=[{key:"first-child",match:function(name,_32f){
return function(elem){
if(elem.nodeType!=1){
return false;
}
var fc=elem.previousSibling;
while(fc&&(fc.nodeType!=1)){
fc=fc.previousSibling;
}
return (!fc);
};
}},{key:"last-child",match:function(name,_333){
return function(elem){
if(elem.nodeType!=1){
return false;
}
var nc=elem.nextSibling;
while(nc&&(nc.nodeType!=1)){
nc=nc.nextSibling;
}
return (!nc);
};
}},{key:"empty",match:function(name,_337){
return function(elem){
var cn=elem.childNodes;
var cnl=elem.childNodes.length;
for(var x=cnl-1;x>=0;x--){
var nt=cn[x].nodeType;
if((nt==1)||(nt==3)){
return false;
}
}
return true;
};
}},{key:"contains",match:function(name,_33e){
return function(elem){
return (elem.innerHTML.indexOf(_33e)>=0);
};
}},{key:"not",match:function(name,_341){
var ntf=_2f1(_341);
return function(elem){
return (!ntf(elem));
};
}},{key:"nth-child",match:function(name,_345){
var pi=parseInt;
if(_345=="odd"){
return function(elem){
return (((_303(elem))%2)==1);
};
}else{
if((_345=="2n")||(_345=="even")){
return function(elem){
return ((_303(elem)%2)==0);
};
}else{
if(_345.indexOf("0n+")==0){
var _349=pi(_345.substr(3));
return function(elem){
return (elem.parentNode.childNodes[_349-1]===elem);
};
}else{
if((_345.indexOf("n+")>0)&&(_345.length>3)){
var _34b=_345.split("n+",2);
var pred=pi(_34b[0]);
var idx=pi(_34b[1]);
return function(elem){
return ((_303(elem)%pred)==idx);
};
}else{
if(_345.indexOf("n")==-1){
var _349=pi(_345);
return function(elem){
return (_303(elem)==_349);
};
}
}
}
}
}
}}];
var _302=function(_350){
var _351=(_2e3[_350]||_2e2[_350]);
if(_351){
return _351;
}
var ff=null;
var i=_28d(_350);
if(i[0]>=0){
var tn=_29e(_350);
if(tn!="*"){
ff=_2e4(ff,function(elem){
return (elem.tagName.toLowerCase()==tn);
});
}
}
var _356;
var _357=_2a6(_350);
if(_357.length){
var _358=_357.charAt(_357.length-1)=="*";
if(_358){
_357=_357.substr(0,_357.length-1);
}
var re=new RegExp("(?:^|\\s)"+_357+(_358?".*":"")+"(?:\\s|$)");
ff=_2e4(ff,function(elem){
return re.test(elem.className);
});
}
if(i[3]>=0){
var _35b=_350.substr(i[3]+1);
var _35c="";
var obi=_35b.indexOf("(");
var cbi=_35b.lastIndexOf(")");
if((0<=obi)&&(0<=cbi)&&(cbi>obi)){
_35c=_35b.substring(obi+1,cbi);
_35b=_35b.substr(0,obi);
}
_356=null;
for(var x=0;x<_32d.length;x++){
var ta=_32d[x];
if(ta.key==_35b){
_356=ta.match(_35b,_35c);
break;
}
}
if(_356){
ff=_2e4(ff,_356);
}
}
var _361=(d.isIE)?function(cond){
return function(elem){
return elem[cond];
};
}:function(cond){
return function(elem){
return elem.hasAttribute(cond);
};
};
_2bd(_311,_350,_361,function(_366){
ff=_2e4(ff,_366);
});
if(!ff){
ff=function(){
return true;
};
}
return _2e3[_350]=ff;
};
var _367=function(_368){
return (Math.max.apply(this,_28d(_368))==-1);
};
var _369={};
var _2f5=function(_36a,root){
var fHit=_369[_36a];
if(fHit){
return fHit;
}
var i=_28d(_36a);
var id=_298(_36a);
if(i[0]==0){
return _369[_36a]=function(root){
return [d.byId(id)];
};
}
var _370=_302(_36a);
var _371;
if(i[0]>=0){
_371=function(root){
var te=d.byId(id);
if(_370(te)){
return [te];
}
};
}else{
var tret;
var tn=_29e(_36a);
if(_367(_36a)){
_371=function(root){
var ret=[];
var te,x=0,tret=root.getElementsByTagName(tn);
while(te=tret[x++]){
ret.push(te);
}
return ret;
};
}else{
_371=function(root){
var ret=[];
var te,x=0,tret=root.getElementsByTagName(tn);
while(te=tret[x++]){
if(_370(te)){
ret.push(te);
}
}
return ret;
};
}
}
return _369[_36a]=_371;
};
var _37e={};
var _37f={};
var _380=function(_381){
if(0>_381.indexOf(" ")){
return _2f5(_381);
}
var sqf=function(root){
var _384=_381.split(" ");
var _385;
if(_384[0]==">"){
_385=[root];
root=document;
}else{
_385=_2f5(_384.shift())(root);
}
return _2f6(_385,_384);
};
return sqf;
};
var _386=((document["evaluate"]&&!d.isSafari)?function(_387){
var _388=_387.split(" ");
if((document["evaluate"])&&(_387.indexOf(":")==-1)&&((true))){
if(((_388.length>2)&&(_387.indexOf(">")==-1))||(_388.length>3)||(_387.indexOf("[")>=0)||((1==_388.length)&&(0<=_387.indexOf(".")))){
return _2d9(_387);
}
}
return _380(_387);
}:_380);
var _389=function(_38a){
if(_37f[_38a]){
return _37f[_38a];
}
if(0>_38a.indexOf(",")){
return _37f[_38a]=_386(_38a);
}else{
var _38b=_38a.split(", ");
var tf=function(root){
var _38e=0;
var ret=[];
var tp;
while(tp=_38b[_38e++]){
ret=ret.concat(_386(tp,tp.indexOf(" "))(root));
}
return ret;
};
return _37f[_38a]=tf;
}
};
var _391=0;
var _zip=function(arr){
var ret=new d.NodeList();
if(!arr){
return ret;
}
if(arr[0]){
ret.push(arr[0]);
}
if(arr.length<2){
return ret;
}
_391++;
arr[0]["_zipIdx"]=_391;
for(var x=1,te;te=arr[x];x++){
if(arr[x]["_zipIdx"]!=_391){
ret.push(te);
}
te["_zipIdx"]=_391;
}
return ret;
};
d.query=function(_397,root){
if(typeof _397!="string"){
return new d.NodeList(_397);
}
if(typeof root=="string"){
root=dojo.byId(root);
}
return _zip(_389(_397)(root||dojo.doc));
};
d._filterQueryResult=function(_399,_39a){
var tnl=new d.NodeList();
var ff=(_39a)?_2f1(_39a):function(){
return true;
};
for(var x=0,te;te=_399[x];x++){
if(ff(te)){
tnl.push(te);
}
}
return tnl;
};
})();
dojo.provide("dojo._base.xhr");
dojo.formToObject=function(_39f){
var ret={};
var iq="input[type!=file][type!=submit][type!=image][type!=reset][type!=button], select, textarea";
dojo.query(iq,_39f).filter(function(node){
return (!node.disabled);
}).forEach(function(item){
var _in=item.name;
var type=(item.type||"").toLowerCase();
if((type=="radio")||(type=="checkbox")){
if(item.checked){
ret[_in]=item.value;
}
}else{
if(item.multiple){
var ria=ret[_in]=[];
dojo.query("option[selected]",item).forEach(function(opt){
ria.push(opt.value);
});
}else{
ret[_in]=item.value;
if(type=="image"){
ret[_in+".x"]=ret[_in+".y"]=ret[_in].x=ret[_in].y=0;
}
}
}
});
return ret;
};
dojo.objectToQuery=function(map){
var ec=encodeURIComponent;
var ret="";
var _3ab={};
for(var x in map){
if(map[x]!=_3ab[x]){
if(dojo.isArray(map[x])){
for(var y=0;y<map[x].length;y++){
ret+=ec(x)+"="+ec(map[x][y])+"&";
}
}else{
ret+=ec(x)+"="+ec(map[x])+"&";
}
}
}
if((ret.length)&&(ret.charAt(ret.length-1)=="&")){
ret=ret.substr(0,ret.length-1);
}
return ret;
};
dojo.formToQuery=function(_3ae){
return dojo.objectToQuery(dojo.formToObject(_3ae));
};
dojo.formToJson=function(_3af){
return dojo.toJson(dojo.formToObject(_3af));
};
dojo.queryToObject=function(str){
var ret={};
var qp=str.split("&");
var dc=decodeURIComponent;
dojo.forEach(qp,function(item){
if(item.length){
var _3b5=item.split("=");
var name=_3b5.shift();
var val=dc(_3b5.join("="));
if(dojo.isString(ret[name])){
ret[name]=[ret[name]];
}
if(dojo.isArray(ret[name])){
ret[name].push(val);
}else{
ret[name]=val;
}
}
});
return ret;
};
dojo._blockAsync=false;
dojo._contentHandlers={"text":function(xhr){
return xhr.responseText;
},"json":function(xhr){
console.debug("please consider using a mimetype of text/json-comment-filtered to avoid potential security issues with JSON endpoints");
return dojo.fromJson(xhr.responseText);
},"json-comment-optional":function(xhr){
var _3bb=xhr.responseText;
var _3bc=_3bb.indexOf("/*");
var _3bd=_3bb.lastIndexOf("*/");
if((_3bc==-1)||(_3bd==-1)){
return dojo.fromJson(xhr.responseText);
}
return dojo.fromJson(_3bb.substring(_3bc+2,_3bd));
},"json-comment-filtered":function(xhr){
var _3bf=xhr.responseText;
var _3c0=_3bf.indexOf("/*");
var _3c1=_3bf.lastIndexOf("*/");
if((_3c0==-1)||(_3c1==-1)){
console.debug("your JSON wasn't comment filtered!");
return "";
}
return dojo.fromJson(_3bf.substring(_3c0+2,_3c1));
},"javascript":function(xhr){
return dojo.eval(xhr.responseText);
},"xml":function(xhr){
return xhr.responseXML;
}};
(function(){
dojo._ioSetArgs=function(args,_3c5,_3c6,_3c7){
var _3c8={};
_3c8.args=args;
var _3c9=null;
if(args.form){
var form=dojo.byId(args.form);
_3c8.url=args.url||form.getAttribute("action");
_3c9=dojo.formToQuery(form);
}else{
_3c8.url=args.url;
}
var qi=_3c8.url.indexOf("?");
var _3cc=[{}];
if(qi!=-1){
_3cc.push(dojo.queryToObject(_3c8.url.substr(qi+1)));
_3c8.url=_3c8.url.substr(0,qi);
}
if(_3c9){
_3cc.push(dojo.queryToObject(_3c9));
}
if(args.content){
_3cc.push(args.content);
}
if(args.preventCache){
_3cc.push({"dojo.preventCache":new Date().valueOf()});
}
_3c8.query=dojo.objectToQuery(dojo.mixin.apply(null,_3cc));
_3c8.ha=args.handleAs||"text";
var d=new dojo.Deferred(_3c5);
d.addCallbacks(_3c6,function(_3ce){
return _3c7(_3ce,d);
});
d.ioArgs=_3c8;
return d;
};
var _3cf=function(dfd){
dfd.canceled=true;
dfd.ioArgs.xhr.abort();
};
var _3d1=function(dfd){
return dojo._contentHandlers[dfd.ioArgs.ha](dfd.ioArgs.xhr);
};
var _3d3=function(_3d4,dfd){
console.debug("xhr error in:",dfd.ioArgs.xhr);
console.debug(_3d4);
return _3d4;
};
var _3d6=function(args){
var dfd=dojo._ioSetArgs(args,_3cf,_3d1,_3d3);
dfd.ioArgs.xhr=dojo._xhrObj();
return dfd;
};
var _3d9=null;
var _3da=[];
var _3db=function(){
var now=(new Date()).getTime();
if(!dojo._blockAsync){
dojo.forEach(_3da,function(tif,_3de){
if(!tif){
return;
}
var dfd=tif.dfd;
try{
if(!dfd||dfd.canceled||!tif.validCheck(dfd)){
_3da.splice(_3de,1);
return;
}
if(tif.ioCheck(dfd)){
_3da.splice(_3de,1);
tif.resHandle(dfd);
}else{
if(dfd.startTime){
if(dfd.startTime+(dfd.ioArgs.args.timeout||0)<now){
dfd.cancel();
_3da.splice(_3de,1);
var err=new Error("timeout exceeded");
err.dojoType="timeout";
dfd.errback(err);
}
}
}
}
catch(e){
console.debug(e);
dfd.errback(new Error("_watchInFlightError!"));
}
});
}
if(!_3da.length){
clearInterval(_3d9);
_3d9=null;
return;
}
};
dojo._ioWatch=function(dfd,_3e2,_3e3,_3e4){
if(dfd.ioArgs.args.timeout){
dfd.startTime=(new Date()).getTime();
}
_3da.push({dfd:dfd,validCheck:_3e2,ioCheck:_3e3,resHandle:_3e4});
if(!_3d9){
_3d9=setInterval(_3db,50);
}
_3db();
};
var _3e5="application/x-www-form-urlencoded";
var _3e6=function(dfd){
return dfd.ioArgs.xhr.readyState;
};
var _3e8=function(dfd){
return 4==dfd.ioArgs.xhr.readyState;
};
var _3ea=function(dfd){
if(dojo._isDocumentOk(dfd.ioArgs.xhr)){
dfd.callback(dfd);
}else{
dfd.errback(new Error("bad http response code:"+dfd.ioArgs.xhr.status));
}
};
var _3ec=function(type,dfd){
var _3ef=dfd.ioArgs;
var args=_3ef.args;
_3ef.xhr.open(type,_3ef.url,(args.sync!==true),(args.user?args.user:undefined),(args.password?args.password:undefined));
_3ef.xhr.setRequestHeader("Content-Type",(args.contentType||_3e5));
try{
_3ef.xhr.send(_3ef.query);
}
catch(e){
_3ef.cancel();
}
dojo._ioWatch(dfd,_3e6,_3e8,_3ea);
return dfd;
};
dojo.xhrGet=function(args){
var dfd=_3d6(args);
var _3f3=dfd.ioArgs;
if(_3f3.query.length){
_3f3.url+="?"+_3f3.query;
_3f3.query=null;
}
return _3ec("GET",dfd);
};
dojo.xhrPost=function(args){
return _3ec("POST",_3d6(args));
};
dojo.rawXhrPost=function(args){
var dfd=_3d6(args);
dfd.ioArgs.query=args.postData;
return _3ec("POST",dfd);
};
dojo.wrapForm=function(_3f7){
throw new Error("dojo.wrapForm not yet implemented");
};
})();
dojo.provide("dojo._base.fx");
dojo._Line=function(_3f8,end){
this.start=_3f8;
this.end=end;
this.getValue=function(n){
return ((this.end-this.start)*n)+this.start;
};
};
dojo.Color=function(){
this.setColor.apply(this,arguments);
};
dojo.Color.named={black:[0,0,0],silver:[192,192,192],gray:[128,128,128],white:[255,255,255],maroon:[128,0,0],red:[255,0,0],purple:[128,0,128],fuchsia:[255,0,255],green:[0,128,0],lime:[0,255,0],olive:[128,128,0],yellow:[255,255,0],navy:[0,0,128],blue:[0,0,255],teal:[0,128,128],aqua:[0,255,255]};
dojo.extend(dojo.Color,{_cache:null,setColor:function(){
this._cache=[];
var d=dojo;
var a=arguments;
var a0=a[0];
var pmap=(d.isArray(a0)?a0:(d.isString(a0)?d.extractRgb(a0):d._toArray(a)));
d.forEach(["r","g","b","a"],function(p,i){
this._cache[i]=this[p]=parseFloat(pmap[i]);
},this);
this._cache[3]=this.a=this.a||1;
},toRgb:function(_401){
return this._cache.slice(0,((_401)?4:3));
},toRgba:function(){
return this._cache.slice(0,4);
},toHex:function(){
return dojo.rgb2hex(this.toRgb());
},toCss:function(){
return "rgb("+this.toRgb().join(", ")+")";
},toString:function(){
return this.toHex();
}});
dojo.blendColors=function(a,b,_404){
if(typeof a=="string"){
a=dojo.extractRgb(a);
}
if(typeof b=="string"){
b=dojo.extractRgb(b);
}
if(a["_cache"]){
a=a._cache;
}
if(b["_cache"]){
b=b._cache;
}
_404=Math.min(Math.max(-1,(_404||0)),1);
_404=((_404+1)/2);
var c=[];
for(var x=0;x<3;x++){
c[x]=parseInt(b[x]+((a[x]-b[x])*_404));
}
return c;
};
dojo.extractRgb=function(_407){
_407=_407.toLowerCase();
if(_407.indexOf("rgb")==0){
var _408=_407.match(/rgba*\((\d+), *(\d+), *(\d+)/i);
var ret=dojo.map(_408.splice(1,3),parseFloat);
return ret;
}else{
return dojo.hex2rgb(_407)||dojo.Color.named[_407]||[255,255,255];
}
};
dojo.hex2rgb=function(hex){
var _40b="0123456789abcdef";
var rgb=new Array(3);
if(hex.charAt(0)=="#"){
hex=hex.substr(1);
}
hex=hex.toLowerCase();
if(hex.replace(new RegExp("["+_40b+"]","g"),"")!=""){
return null;
}
if(hex.length==3){
rgb[0]=hex.charAt(0)+hex.charAt(0);
rgb[1]=hex.charAt(1)+hex.charAt(1);
rgb[2]=hex.charAt(2)+hex.charAt(2);
}else{
rgb[0]=hex.substr(0,2);
rgb[1]=hex.substr(2,2);
rgb[2]=hex.substr(4);
}
for(var i=0;i<rgb.length;i++){
rgb[i]=_40b.indexOf(rgb[i].charAt(0))*16+_40b.indexOf(rgb[i].charAt(1));
}
return rgb;
};
dojo.rgb2hex=function(r,g,b){
var ret=dojo.map(((r._cache)||((!g)?r:[r,g,b])),function(x,i){
var s=(new Number(x)).toString(16);
while(s.length<2){
s="0"+s;
}
return s;
});
ret.unshift("#");
return ret.join("");
};
dojo.declare("dojo._Animation",null,function(args){
dojo.mixin(this,args);
if(dojo.isArray(this.curve)){
this.curve=new dojo._Line(this.curve[0],this.curve[1]);
}
},{curve:null,duration:1000,easing:null,repeat:0,rate:10,delay:null,beforeBegin:null,onBegin:null,onAnimate:null,onEnd:null,onPlay:null,onPause:null,onStop:null,_active:false,_paused:false,_startTime:null,_endTime:null,_timer:null,_percent:0,_startRepeatCount:0,fire:function(evt,args){
if(this[evt]){
this[evt].apply(this,args||[]);
}
return this;
},chain:function(_418){
dojo.forEach(_418,function(anim,i){
var prev=(i==0)?this:_418[i-1];
dojo.connect(prev,"onEnd",anim,"play");
},this);
return this;
},combine:function(_41c){
dojo.forEach(_41c,function(anim){
dojo.forEach(["beforeBegin","onBegin","onAnimate","onEnd","onPlay","onPause","onStop","play"],function(evt){
if(anim[evt]){
dojo.connect(this,evt,anim,evt);
}
},this);
},this);
return this;
},play:function(_41f,_420){
if(_420){
clearTimeout(this._timer);
this._active=this._paused=false;
this._percent=0;
}else{
if(this._active&&!this._paused){
return this;
}
}
this.fire("beforeBegin");
var d=_41f||this.delay;
if(d>0){
setTimeout(dojo.hitch(this,function(){
this.play(null,_420);
}),d);
return this;
}
this._startTime=new Date().valueOf();
if(this._paused){
this._startTime-=this.duration*this._percent;
}
this._endTime=this._startTime+this.duration;
this._active=true;
this._paused=false;
var _422=this.curve.getValue(this._percent);
if(this._percent==0){
if(!this._startRepeatCount){
this._startRepeatCount=this.repeat;
}
this.fire("onBegin",[_422]);
}
this.fire("onPlay",[_422]);
this._cycle();
return this;
},pause:function(){
clearTimeout(this._timer);
if(!this._active){
return this;
}
this._paused=true;
this.fire("onPause",[this.curve.getValue(this._percent)]);
return this;
},gotoPercent:function(pct,_424){
clearTimeout(this._timer);
this._active=this._paused=true;
this._percent=pct*100;
if(_424){
this.play();
}
return this;
},stop:function(_425){
clearTimeout(this._timer);
if(_425){
this._percent=1;
}
this.fire("onStop",[this.curve.getValue(this._percent)]);
this._active=this._paused=false;
return this;
},status:function(){
if(this._active){
return this._paused?"paused":"playing";
}
return "stopped";
},_cycle:function(){
clearTimeout(this._timer);
if(this._active){
var curr=new Date().valueOf();
var step=(curr-this._startTime)/(this._endTime-this._startTime);
if(step>=1){
step=1;
}
this._percent=step;
if(this.easing){
step=this.easing(step);
}
this.fire("onAnimate",[this.curve.getValue(step)]);
if(step<1){
this._timer=setTimeout(dojo.hitch(this,"_cycle"),this.rate);
}else{
this._active=false;
if(this.repeat>0){
this.repeat--;
this.play(null,true);
}else{
if(this.repeat==-1){
this.play(null,true);
}else{
if(this._startRepeatCount){
this.repeat=this._startRepeatCount;
this._startRepeatCount=0;
}
}
}
this._percent=0;
this.fire("onEnd");
}
}
return this;
}});
(function(){
var _428=function(node){
if(dojo.isIE){
if(node.style.zoom.length==0&&dojo.style(node,"zoom")=="normal"){
node.style.zoom="1";
}
if(node.style.width.length==0&&dojo.style(node,"width")=="auto"){
node.style.width="auto";
}
}
};
dojo._fade=function(args){
if(typeof args.end=="undefined"){
throw new Error("dojo._fade needs an end value");
}
args.node=dojo.byId(args.node);
var _42b=dojo.mixin({properties:{}},args);
var _42c=_42b.properties.opacity={};
_42c.start=(typeof _42b.start=="undefined")?function(){
return Number(dojo.style(_42b.node,"opacity"));
}:_42b.start;
_42c.end=_42b.end;
var anim=dojo.animateProperty(_42b);
dojo.connect(anim,"beforeBegin",null,function(){
_428(_42b.node);
});
return anim;
};
dojo.fadeIn=function(args){
return dojo._fade(dojo.mixin({end:1},args));
};
dojo.fadeOut=function(args){
return dojo._fade(dojo.mixin({end:0},args));
};
if(dojo.isKhtml&&!dojo.isSafari){
dojo._defaultEasing=function(n){
return parseFloat("0.5")+((Math.sin((n+parseFloat("1.5"))*Math.PI))/2);
};
}else{
dojo._defaultEasing=function(n){
return 0.5+((Math.sin((n+1.5)*Math.PI))/2);
};
}
dojo.animateProperty=function(args){
args.node=dojo.byId(args.node);
if(!args.easing){
args.easing=dojo._defaultEasing;
}
var _433=function(_434){
this._properties=_434;
for(var p in _434){
var prop=_434[p];
if(dojo.isFunction(prop.start)){
prop.start=prop.start(prop);
}
if(dojo.isFunction(prop.end)){
prop.end=prop.end(prop);
}
}
this.getValue=function(n){
var ret={};
for(var p in this._properties){
var prop=this._properties[p];
var _43b=null;
if(prop.start instanceof dojo.Color){
_43b=dojo.rgb2hex(dojo.blendColors(prop.end,prop.start,n));
}else{
if(!dojo.isArray(prop.start)){
_43b=((prop.end-prop.start)*n)+prop.start+(p!="opacity"?prop.units||"px":"");
}
}
ret[p]=_43b;
}
return ret;
};
};
var anim=new dojo._Animation(args);
dojo.connect(anim,"beforeBegin",anim,function(){
var pm=this.properties;
for(var p in pm){
var prop=pm[p];
if(dojo.isFunction(prop.start)){
prop.start=prop.start();
}
if(dojo.isFunction(prop.end)){
prop.end=prop.end();
}
var _440=(p.toLowerCase().indexOf("color")>=0);
if(typeof prop.end=="undefined"){
prop.end=dojo.style(this.node,p);
}else{
if(typeof prop.start=="undefined"){
prop.start=dojo.style(this.node,p);
}
}
if(_440){
prop.start=new dojo.Color(prop.start);
prop.end=new dojo.Color(prop.end);
}else{
prop.start=(p=="opacity")?Number(prop.start):parseInt(prop.start);
}
}
this.curve=new _433(pm);
});
dojo.connect(anim,"onAnimate",anim,function(_441){
for(var s in _441){
dojo.style(this.node,s,_441[s]);
}
});
return anim;
};
})();
