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

dojo.provide("dijit.util.manager");
dijit.util.manager=new function(){
var _1={};
var _2={};
this.getUniqueId=function(_3){
var id;
do{
id=_3+"_"+(_2[_3]!==undefined?++_2[_3]:_2[_3]=0);
}while(_1[id]);
return id;
};
this.add=function(_5){
if(!_5.id){
_5.id=this.getUniqueId(_5.declaredClass.replace(".","_"));
}
_1[_5.id]=_5;
};
this.remove=function(id){
delete _1.id;
};
this.destroyAll=function(){
for(var id in _1){
_1[id].destroy();
}
};
this.getWidgets=function(){
return _1;
};
this.byNode=function(_8){
return _1[_8.getAttribute("widgetId")];
};
};
dojo.addOnUnload(function(){
dijit.util.manager.destroyAll();
});
dijit.byId=function(id){
return dijit.util.manager.getWidgets()[id];
};
dojo.provide("dijit.base.Widget");
dojo.declare("dijit.base.Widget",null,function(_a,_b){
this.srcNodeRef=dojo.byId(_b);
this._connects=[];
if(this.srcNodeRef&&(typeof this.srcNodeRef.id=="string")){
this.id=this.srcNodeRef.id;
}
if(_a){
dojo.mixin(this,_a);
}
this.postMixInProperties();
dijit.util.manager.add(this);
this.buildRendering();
if(this.domNode){
this.domNode.setAttribute("widgetId",this.id);
if(this.srcNodeRef&&this.srcNodeRef.dir){
this.domNode.dir=this.srcNodeRef.dir;
}
}
this.postCreate();
if(this.srcNodeRef&&!this.srcNodeRef.parentNode){
delete this.srcNodeRef;
}
},{id:"",lang:"",dir:"",srcNodeRef:null,domNode:null,postMixInProperties:function(){
},buildRendering:function(){
this.domNode=this.srcNodeRef;
},postCreate:function(){
},startup:function(){
},destroyRecursive:function(_c){
this.destroyDescendants();
this.destroy();
},destroy:function(_d){
this.uninitialize();
dojo.forEach(this._connects,dojo.disconnect);
this.destroyRendering(_d);
dijit.util.manager.remove(this.id);
},destroyRendering:function(_e){
if(this.bgIframe){
this.bgIframe.remove();
delete this.bgIframe;
}
if(this.domNode){
if(this.domNode.parentNode){
this.domNode.parentNode.removeChild(this.domNode);
}
delete this.domNode;
}
if(this.srcNodeRef&&this.srcNodeRef.parentNode){
this.srcNodeRef.parentNode.removeChild(this.srcNodeRef);
delete this.srcNodeRef;
}
},destroyDescendants:function(){
dojo.forEach(this.getDescendants(),function(_f){
_f.destroy();
});
},uninitialize:function(){
return false;
},toString:function(){
return "[Widget "+this.declaredClass+", "+(this.id||"NO ID")+"]";
},getDescendants:function(){
var _10=dojo.query("[widgetId]",this.domNode);
return _10.map(dijit.util.manager.byNode);
},connect:function(obj,_12,_13){
this._connects.push(dojo.connect(obj,_12,this,_13));
},isLeftToRight:function(){
if(typeof this._ltr=="undefined"){
this._ltr=(this.dir||dojo.getComputedStyle(this.domNode).direction)!="rtl";
}
return this._ltr;
}});
dijit._disableSelection=function(_14){
if(dojo.isMozilla){
_14.style.MozUserSelect="none";
}else{
if(dojo.isKhtml){
_14.style.KhtmlUserSelect="none";
}else{
if(dojo.isIE){
_14.unselectable="on";
}
}
}
};
dojo.provide("dijit.base.Container");
dojo.declare("dijit.base.Contained",null,{getParent:function(){
for(var p=this.domNode.parentNode;p;p=p.parentNode){
var id=p.getAttribute&&p.getAttribute("widgetId");
if(id){
return dijit.byId(id);
}
}
return null;
},_getSibling:function(_17){
var _18=this.domNode;
do{
_18=_18[_17+"Sibling"];
}while(_18&&_18.nodeType!=1);
if(!_18){
return null;
}
var id=_18.getAttribute("widgetId");
return dijit.byId(id);
},getPreviousSibling:function(){
return this._getSibling("previous");
},getNextSibling:function(){
return this._getSibling("next");
}});
dojo.declare("dijit.base.Container",null,{isContainer:true,addChild:function(_1a,_1b){
var _1c=this.containerNode||this.domNode;
if(typeof _1b=="undefined"){
dojo.place(_1a.domNode,_1c,"last");
}else{
dojo.place(_1a.domNode,_1c,_1b);
}
},removeChild:function(_1d){
var _1e=_1d.domNode;
_1e.parentNode.removeChild(_1e);
},_nextElement:function(_1f){
do{
_1f=_1f.nextSibling;
}while(_1f&&_1f.nodeType!=1);
return _1f;
},_firstElement:function(_20){
_20=_20.firstChild;
if(_20&&_20.nodeType!=1){
_20=this._nextElement(_20);
}
return _20;
},getChildren:function(){
return dojo.query("> [widgetId]",this.containerNode||this.domNode).map(dijit.util.manager.byNode);
},hasChildren:function(){
var cn=this.containerNode||this.domNode;
return !!this._firstElement(cn);
}});
dojo.provide("dijit.base.Layout");
dojo.declare("dijit.base.Sizable",null,{resize:function(mb){
var _23=this.domNode;
if(mb){
dojo.marginBox(_23,mb);
if(mb.t){
_23.style.top=mb.t+"px";
}
if(mb.l){
_23.style.left=mb.l+"px";
}
}
mb=dojo.marginBox(_23);
this._contentBox=dijit.base.Layout.marginBox2contentBox(_23,mb);
this.layout();
},layout:function(){
}});
dojo.declare("dijit.base.Layout",[dijit.base.Sizable,dijit.base.Container,dijit.base.Contained,dijit.base.Showable],{isLayoutContainer:true,startup:function(){
if(this._started){
return;
}
this._started=true;
if(this.getChildren){
dojo.forEach(this.getChildren(),function(_24){
_24.startup();
});
}
if(!this.getParent||!this.getParent()){
this.resize();
this.connect(window,"onresize","resize");
}
}});
dijit.base.Layout.marginBox2contentBox=function(_25,mb){
var cs=dojo.getComputedStyle(_25);
var me=dojo._getMarginExtents(_25,cs);
var pb=dojo._getPadBorderExtents(_25,cs);
return {l:dojo._toPixelValue(this.containerNode,cs.paddingLeft),t:dojo._toPixelValue(this.containerNode,cs.paddingTop),w:mb.w-(me.w+pb.w),h:mb.h-(me.h+pb.h)};
};
dijit.base.Layout.layoutChildren=function(_2a,dim,_2c,_2d){
dojo.addClass(_2a,"dijitLayoutContainer");
_2c=dojo.filter(_2c,function(_2e,idx){
_2e.idx=idx;
return dojo.indexOf(["top","bottom","left","right","client","flood"],_2e.layoutAlign)>-1;
});
if(_2d&&_2d!="none"){
var _30=function(_31){
switch(_31.layoutAlign){
case "flood":
return 1;
case "left":
case "right":
return (_2d=="left-right")?2:3;
case "top":
case "bottom":
return (_2d=="left-right")?3:2;
default:
return 4;
}
};
_2c.sort(function(a,b){
return (_30(a)-_30(b))||(a.idx-b.idx);
});
}
var ret=true;
dojo.forEach(_2c,function(_35){
var elm=_35.domNode;
var pos=_35.layoutAlign;
var _38=elm.style;
_38.left=dim.l+"px";
_38.top=dim.t+"px";
_38.bottom=_38.right="auto";
var _39=function(_3a){
return _3a.substring(0,1).toUpperCase()+_3a.substring(1);
};
dojo.addClass(elm,"dijitAlign"+_39(pos));
if(pos=="top"||pos=="bottom"){
if(_35.resize){
_35.resize({w:dim.w});
}else{
dojo.marginBox(elm,{w:dim.w});
}
var h=dojo.marginBox(elm).h;
dim.h-=h;
dojo.mixin(_35,{w:dim.w,h:h});
if(pos=="top"){
dim.t+=h;
}else{
_38.top=dim.t+dim.h+"px";
}
}else{
if(pos=="left"||pos=="right"){
var w=dojo.marginBox(elm).w;
var _3d=dijit.base.Layout._sizeChild(_35,elm,w,dim.h);
if(_3d){
ret=false;
}
dim.w-=w;
if(pos=="left"){
dim.l+=w;
}else{
_38.left=dim.l+dim.w+"px";
}
}else{
if(pos=="flood"||pos=="client"){
var _3d=dijit.base.Layout._sizeChild(_35,elm,dim.w,dim.h);
if(_3d){
ret=false;
}
}
}
}
});
return ret;
};
dijit.base.Layout._sizeChild=function(_3e,elm,w,h){
var box={};
var _43=(w==0||h==0);
if(!_43){
if(w!=0){
box.w=w;
}
if(h!=0){
box.h=h;
}
if(_3e.resize){
_3e.resize(box);
}else{
dojo.marginBox(elm,box);
}
}
dojo.mixin(_3e,box);
return _43;
};
dojo.provide("dijit.base.Showable");
dojo.declare("dijit.base.Showable",null,{isShowing:function(){
return dojo.style(this.domNode,"display")!="none";
},toggleShowing:function(){
if(this.isShowing()){
this.hide();
}else{
this.show();
}
},show:function(){
if(this.isShowing()){
return;
}
this.domNode.style.display="";
this.onShow();
},onShow:function(){
},hide:function(){
if(!this.isShowing()){
return;
}
this.domNode.style.display="none";
this.onHide();
},onHide:function(){
}});
dojo.provide("dijit.util.sniff");
(function(){
var d=dojo;
var ie=d.isIE;
var _46=d.isOpera;
var maj=Math.floor;
var _48={dj_ie:ie,dj_ie6:maj(ie)==6,dj_ie7:maj(ie)==7,dj_iequirks:ie&&d.isQuirks,dj_opera:_46,dj_opera8:maj(_46)==8,dj_opera9:maj(_46)==9,dj_khtml:d.isKhtml,dj_safari:d.isSafari,dj_gecko:d.isMozilla};
for(var p in _48){
if(_48[p]){
var _4a=dojo.doc.documentElement;
if(_4a.className){
_4a.className+=" "+p;
}else{
_4a.className=p;
}
}
}
})();
dojo.provide("dijit.util.wai");
dijit.util.waiNames=["waiRole","waiState"];
dijit.util.wai={waiRole:{name:"waiRole","namespace":"http://www.w3.org/TR/xhtml2",alias:"x2",prefix:"wairole:"},waiState:{name:"waiState","namespace":"http://www.w3.org/2005/07/aaa",alias:"aaa",prefix:""},setAttr:function(_4b,ns,_4d,_4e){
if(dojo.isIE){
_4b.setAttribute(this[ns].alias+":"+_4d,this[ns].prefix+_4e);
}else{
_4b.setAttributeNS(this[ns]["namespace"],_4d,this[ns].prefix+_4e);
}
},getAttr:function(_4f,ns,_51){
if(dojo.isIE){
return _4f.getAttribute(this[ns].alias+":"+_51);
}else{
return _4f.getAttributeNS(this[ns]["namespace"],_51);
}
},removeAttr:function(_52,ns,_54){
var _55=true;
if(dojo.isIE){
_55=_52.removeAttribute(this[ns].alias+":"+_54);
}else{
_52.removeAttributeNS(this[ns]["namespace"],_54);
}
return _55;
},imageBgToSrc:function(_56){
if(!dojo.isArrayLike(_56)){
_56=[_56];
}
dojo.forEach(_56,function(_57){
var _58=_57&&dojo.getComputedStyle(_57);
if(!_58){
return;
}
var _59=_58.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
if(!_59){
return;
}
_57.src=_59[1];
_57.style.backgroundImage="none";
});
}};
dojo._loaders.unshift(function(){
var div=document.createElement("div");
div.id="a11yTestNode";
dojo.body().appendChild(div);
function check(){
var cs=dojo.getComputedStyle(div);
var _5c=cs.backgroundImage;
var _5d=(cs.borderTopColor==cs.borderRightColor)||(_5c!=null&&(_5c=="none"||_5c=="url(invalid-url:)"));
dojo[_5d?"addClass":"removeClass"](dojo.body(),"dijit_a11y");
};
if(dojo.isIE||dojo.isMoz){
check();
if(dojo.isIE){
setInterval(check,4000);
}
}
});
dojo.provide("dijit.base.FormElement");
dojo.declare("dijit.base.FormElement",dijit.base.Widget,{baseClass:"",value:"",name:"",id:"",alt:"",type:"text",tabIndex:"0",disabled:false,enable:function(){
this._setDisabled(false);
},disable:function(){
this._setDisabled(true);
},_setDisabled:function(_5e){
this.domNode.disabled=this.disabled=_5e;
if(this.focusNode){
this.focusNode.disabled=_5e;
}
dijit.util.wai.setAttr(this.focusNode||this.domNode,"waiState","disabled",_5e);
this._onMouse(null,this.domNode);
},_onMouse:function(_5f,_60,_61){
if(_60==null){
_60=this.domNode;
}
if(_5f){
dojo.stopEvent(_5f);
}
var _62=_60.getAttribute("baseClass")||this.baseClass||(this.baseClass="dijit"+this.declaredClass.replace(/.*\./g,""));
if(this.disabled){
dojo.removeClass(this.domNode,_62+"Enabled");
dojo.removeClass(this.domNode,_62+"Hover");
dojo.removeClass(this.domNode,_62+"Active");
dojo.addClass(this.domNode,_62+"Disabled");
}else{
if(_5f){
switch(_5f.type){
case "mouseover":
_60._hovering=true;
break;
case "mouseout":
_60._hovering=false;
break;
case "mousedown":
_60._active=true;
var _63=this;
var _64=function(_65){
_63._onMouse(_65,_60);
};
_60._mouseUpConnector=dojo.connect(dojo.global,"onmouseup",this,_64);
break;
case "mouseup":
_60._active=false;
if(this._mouseUpConnector){
dojo.disconnect(_60._mouseUpConnector);
_60._mouseUpConnector=false;
}
break;
case "click":
this.onClick(_5f);
break;
}
}
dojo.removeClass(this.domNode,_62+"Disabled");
dojo.toggleClass(this.domNode,_62+"Active",_60._active==true);
dojo.toggleClass(this.domNode,_62+"Hover",_60._hovering==true&&_60._active!=true);
dojo.addClass(this.domNode,_62+"Enabled");
}
},onValueChanged:function(_66){
},postCreate:function(){
this._setDisabled(this.disabled==true);
},_lastValueReported:null,setValue:function(_67){
if(_67!=this._lastValueReported){
this._lastValueReported=_67;
dijit.util.wai.setAttr(this.focusNode||this.domNode,"waiState","valuenow",_67);
this.onValueChanged(_67);
}
},getValue:function(){
return this._lastValueReported;
}});
dojo.provide("dojo.string");
dojo.string.pad=function(_68,_69,ch,end){
var out=String(_68);
if(!ch){
ch="0";
}
while(out.length<_69){
if(end){
out+=ch;
}else{
out=ch+out;
}
}
return out;
};
dojo.string.substitute=function(_6d,map,_6f,_70){
return _6d.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,function(_71,key,_73){
var _74=dojo.getObject(key,false,map);
if(_73){
_74=dojo.getObject(_73,false,_70)(_74);
}
if(_6f){
_74=_6f(_74);
}
return _74.toString();
});
};
dojo.provide("dojo.date.stamp");
dojo.date.stamp.fromISOString=function(_75,_76){
var _77=new Date(_76||0);
var _78=_75.split("T");
if(_78[0]){
var _79=_78[0].split("-");
_77.setFullYear(_79[0]);
_77.setMonth(0);
_77.setDate(_79[2]);
_77.setMonth(_79[1]-1);
}
if(_78[1]){
var _7a=_78[1].substring(0,8).split(":");
_77.setHours(_7a[0]);
_77.setMinutes(_7a[1]);
_77.setSeconds(_7a[2]);
var _7b=_78[1].substring(8);
if(_7b.charAt(0)==="."){
}
if(_7b){
var _7c=0;
if(_7b.charAt(0)!="Z"){
var _7d=_7b.substring(1).split(":");
_7c=(_7d[0]*60)+(Number(_7d[1])||0);
if(_7b.charAt(0)!="-"){
_7c*=-1;
}
}
_7c-=_77.getTimezoneOffset();
if(_7c){
_77.setTime(_77.getTime()+_7c*60000);
}
}
}
return _77;
};
dojo.date.stamp.toISOString=function(_7e,_7f){
var _=function(n){
return (n<10)?"0"+n:n;
};
_7f=_7f||{};
var _82=[];
var _83=_7f.zulu?"getUTC":"get";
var _84="";
if(_7f.selector!="time"){
_84=[_7e[_83+"FullYear"](),_(_7e[_83+"Month"]()+1),_(_7e[_83+"Date"]())].join("-");
}
_82.push(_84);
if(_7f.selector!="date"){
var _85=[_(_7e[_83+"Hours"]()),_(_7e[_83+"Minutes"]()),_(_7e[_83+"Seconds"]())].join(":");
if(_7f.zulu){
_85+="Z";
}else{
var _86=_7e.getTimezoneOffset();
var _87=Math.abs(_86);
_85+=(_86>0?"-":"+")+_(Math.floor(_87/60))+":"+_(_87%60);
}
_82.push(_85);
}
return _82.join("T");
};
dojo.provide("dijit.util.parser");
dijit.util.parser=new function(){
function val2type(_88){
if(dojo.isString(_88)){
return "string";
}
if(typeof _88=="number"){
return "number";
}
if(typeof _88=="boolean"){
return "boolean";
}
if(dojo.isFunction(_88)){
return "function";
}
if(dojo.isArray(_88)){
return "array";
}
if(_88 instanceof Date){
return "date";
}
if(_88 instanceof dojo._Url){
return "url";
}
return "object";
};
function str2obj(_89,_8a){
switch(_8a){
case "string":
return _89;
case "number":
return _89.length?Number(_89):null;
case "boolean":
return typeof _89=="boolean"?_89:!(_89.toLowerCase()=="false");
case "function":
if(dojo.isFunction(_89)){
return _89;
}
try{
if(_89.search(/[^\w\.]+/i)!=-1){
_89=dijit.util.parser._nameAnonFunc(new Function(_89),this);
}
return dojo.getObject(_89,false);
}
catch(e){
return new Function();
}
case "array":
return _89.split(";");
case "date":
return dojo.date.stamp.fromISOString(_89);
case "url":
return dojo.baseUrl+_89;
default:
try{
eval("var tmp = "+_89);
return tmp;
}
catch(e){
return _89;
}
}
};
var _8b={};
function getWidgetClassInfo(_8c){
if(!_8b[_8c]){
var cls=dojo.getObject(_8c);
if(!dojo.isFunction(cls)){
throw new Error("Could not load widget '"+_8c+"'. Did you spell the name correctly and use a full path, like 'dijit.form.Button'?");
}
var _8e=cls.prototype;
var _8f={};
for(var _90 in _8e){
if(_90.charAt(0)=="_"){
continue;
}
var _91=_8e[_90];
_8f[_90]=val2type(_91);
}
_8b[_8c]={cls:cls,params:_8f};
}
return _8b[_8c];
};
this.instantiate=function(_92){
var _93=[];
dojo.forEach(_92,function(_94){
if(!_94){
return;
}
var _95=_94.getAttribute("dojoType");
if((!_95)||(!_95.length)){
return;
}
var _96=getWidgetClassInfo(_95);
var _97={};
for(var _98 in _96.params){
var _99=_94.getAttribute(_98);
if(_99!=null){
var _9a=_96.params[_98];
_97[_98]=str2obj(_99,_9a);
}
}
_93.push(new _96.cls(_97,_94));
var _9b=_94.getAttribute("jsId");
if(_9b){
dojo.setObject(_9b,_93[_93.length-1]);
}
});
dojo.forEach(_93,function(_9c){
if(_9c&&_9c.startup&&(!_9c.getParent||_9c.getParent()==null)){
_9c.startup();
}
});
return _93;
};
this.parse=function(_9d){
var _9e=dojo.query("[dojoType]",_9d);
return this.instantiate(_9e);
};
}();
dojo.addOnLoad(function(){
dijit.util.parser.parse();
});
dijit.util.parser._anonCtr=0;
dijit.util.parser._anon={};
dijit.util.parser._nameAnonFunc=function(_9f,_a0,_a1){
var jpn="$joinpoint";
var nso=(_a0||dijit.util.parser._anon);
if(dojo.isIE){
var cn=_9f["__dojoNameCache"];
if(cn&&nso[cn]===_9f){
return _9f["__dojoNameCache"];
}else{
if(cn){
var _a5=cn.indexOf(jpn);
if(_a5!=-1){
return cn.substring(0,_a5);
}
}
}
}
var ret="__"+dijit.util.parser._anonCtr++;
while(typeof nso[ret]!="undefined"){
ret="__"+dijit.util.parser._anonCtr++;
}
nso[ret]=_9f;
return ret;
};
dojo.provide("dijit.base.TemplatedWidget");
dojo.declare("dijit.base.TemplatedWidget",null,{templateNode:null,templateString:null,templatePath:null,widgetsInTemplate:false,containerNode:null,buildRendering:function(){
var _a7=dijit.base.getCachedTemplate(this.templatePath,this.templateString);
var _a8;
if(dojo.isString(_a7)){
var _a9=dojo.string.substitute(_a7,this,function(_aa){
return _aa.toString().replace(/"/g,"&quot;");
},this);
_a8=dijit.base._createNodesFromText(_a9)[0];
}else{
_a8=_a7.cloneNode(true);
}
this._attachTemplateNodes(_a8);
if(this.srcNodeRef){
dojo.style(_a8,"cssText",this.srcNodeRef.style.cssText);
if(this.srcNodeRef.className){
_a8.className+=" "+this.srcNodeRef.className;
}
}
this.domNode=_a8;
if(this.srcNodeRef&&this.srcNodeRef.parentNode){
this.srcNodeRef.parentNode.replaceChild(this.domNode,this.srcNodeRef);
}
if(this.widgetsInTemplate){
var _ab=dijit.util.parser.parse(this.domNode);
this._attachTemplateNodes(_ab,function(n,p){
return n[p];
});
}
if(this.srcNodeRef&&this.srcNodeRef.hasChildNodes()){
var _ae=this.containerNode||this.domNode;
while(this.srcNodeRef.hasChildNodes()){
_ae.appendChild(this.srcNodeRef.firstChild);
}
}
},_attachTemplateNodes:function(_af,_b0){
var _b1=function(str){
return str.replace(/^\s+|\s+$/g,"");
};
_b0=_b0||function(n,p){
return n.getAttribute(p);
};
var _b5=dojo.isArray(_af)?_af:(_af.all||_af.getElementsByTagName("*"));
var x=dojo.isArray(_af)?0:-1;
for(;x<_b5.length;x++){
var _b7=(x==-1)?_af:_b5[x];
if(this.widgetsInTemplate&&_b0(_b7,"dojoType")){
return;
}
var _b8=_b0(_b7,"dojoAttachPoint");
if(_b8){
var _b9=_b8.split(";");
var z=0,ap;
while((ap=_b9[z++])){
if(dojo.isArray(this[ap])){
this[ap].push(_b7);
}else{
this[ap]=_b7;
}
}
}
var _bc=_b0(_b7,"dojoAttachEvent");
if(_bc){
var _bd=_bc.split(";");
var y=0,evt;
while((evt=_bd[y++])){
if(!evt||!evt.length){
continue;
}
var _c0=null;
var _c1=_b1(evt);
if(evt.indexOf(":")!=-1){
var _c2=_c1.split(":");
_c1=_b1(_c2[0]);
_c0=_b1(_c2[1]);
}
if(!_c0){
_c0=_c1;
}
this.connect(_b7,_c1,_c0);
}
}
dojo.forEach(["waiRole","waiState"],function(_c3){
var wai=dijit.util.wai[_c3];
var val=_b0(_b7,wai.name);
if(val){
var _c6="role";
if(val.indexOf("-")!=-1){
var _c7=val.split("-");
_c6=_c7[0];
val=_c7[1];
}
dijit.util.wai.setAttr(_b7,wai.name,_c6,val);
}
},this);
}
}});
dijit.base._templateCache={};
dijit.base.getCachedTemplate=function(_c8,_c9){
var _ca=dijit.base._templateCache;
var key=_c9||_c8;
var _cc=_ca[key];
if(_cc){
return _cc;
}
if(!_c9){
_c9=dijit.base._sanitizeTemplateString(dojo._getText(_c8));
}
_c9=_c9.replace(/^\s+|\s+$/g,"");
if(_c9.match(/\$\{([^\}]+)\}/g)){
return (_ca[key]=_c9);
}else{
return (_ca[key]=dijit.base._createNodesFromText(_c9)[0]);
}
};
dijit.base._sanitizeTemplateString=function(_cd){
if(_cd){
_cd=_cd.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,"");
var _ce=_cd.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(_ce){
_cd=_ce[1];
}
}else{
_cd="";
}
return _cd;
};
if(dojo.isIE){
dojo.addOnUnload(function(){
var _cf=dijit.base._templateCache;
for(var key in _cf){
var _d1=_cf[key];
if(!isNaN(_d1.nodeType)){
}
_cf[key]=null;
}
});
}
(function(){
var _d2={cell:{re:/^<t[dh][\s\r\n>]/i,pre:"<table><tbody><tr>",post:"</tr></tbody></table>"},row:{re:/^<tr[\s\r\n>]/i,pre:"<table><tbody>",post:"</tbody></table>"},section:{re:/^<(thead|tbody|tfoot)[\s\r\n>]/i,pre:"<table>",post:"</table>"}};
var tn;
var _d4;
dijit.base._createNodesFromText=function(_d5){
if(!tn){
_d4=tn=dojo.doc.createElement("div");
tn.style.visibility="hidden";
}
var _d6="none";
var _d7=_d5.replace(/^\s+/);
for(var _d8 in _d2){
var map=_d2[_d8];
if(map.re.test(_d7)){
_d6=_d8;
_d5=map.pre+_d5+map.post;
break;
}
}
tn.innerHTML=_d5;
dojo.body().appendChild(tn);
if(tn.normalize){
tn.normalize();
}
var tag={cell:"tr",row:"tbody",section:"table"}[_d6];
if(typeof tag!="undefined"){
_d4=tn.getElementsByTagName(tag)[0];
}
var _db=[];
while(_d4.firstChild){
_db.push(_d4.removeChild(_d4.firstChild));
}
_d4=dojo.body().removeChild(tn);
return _db;
};
})();
dojo.extend(dijit.base.Widget,{dojoAttachEvent:"",dojoAttachPoint:"",waiRole:"",waiState:""});
dojo.provide("dijit.util.FocusManager");
dijit.util.FocusManager=new function(){
var _dc,_dd;
function onFocus(_de){
if(_de&&_de.tagName=="body"){
_de=null;
}
if(_de!==_dc){
_dd=_dc;
_dc=_de;
console.debug("focused on ",_de?(_de.id?_de.id:_de.tagName):"nothing");
}
};
dojo.addOnLoad(function(){
if(dojo.isIE){
window.setInterval(function(){
onFocus(document.activeElement);
},100);
}else{
dojo.body().addEventListener("focus",function(evt){
onFocus(evt.target);
},true);
}
});
var _e0=null;
var _e1=false;
var _e2;
var _e3;
var _e4;
var _e5=function(){
var _e6=dojo.global;
var _e7=dojo.doc;
if(_e7.selection){
return _e7.selection.createRange().text=="";
}else{
if(_e6.getSelection){
var _e8=_e6.getSelection();
if(dojo.isString(_e8)){
return _e8=="";
}else{
return _e8.isCollapsed||_e8.toString()=="";
}
}
}
};
var _e9=function(){
var _ea;
var _eb=dojo.doc;
if(_eb.selection){
var _ec=_eb.selection.createRange();
if(_eb.selection.type.toUpperCase()=="CONTROL"){
if(_ec.length){
_ea=[];
var i=0;
while(i<_ec.length){
_ea.push(_ec.item(i++));
}
}else{
_ea=null;
}
}else{
_ea=_ec.getBookmark();
}
}else{
var _ee;
try{
_ee=dojo.global.getSelection();
}
catch(e){
}
if(_ee){
var _ec=_ee.getRangeAt(0);
_ea=_ec.cloneRange();
}else{
console.debug("No idea how to store the current selection for this browser!");
}
}
return _ea;
};
var _ef=function(_f0){
var _f1=dojo.doc;
if(_f1.selection){
if(dojo.isArray(_f0)){
var _f2=_f1.body.createControlRange();
var i=0;
while(i<_f0.length){
_f2.addElement(_f0[i++]);
}
_f2.select();
}else{
var _f2=_f1.selection.createRange();
_f2.moveToBookmark(_f0);
_f2.select();
}
}else{
var _f4;
try{
_f4=dojo.global.getSelection();
}
catch(e){
}
if(_f4&&_f4.removeAllRanges){
_f4.removeAllRanges();
_f4.addRange(_f0);
}else{
console.debug("No idea how to restore selection for this browser!");
}
}
};
this.save=function(_f5,_f6){
if(_f5==_e0){
return;
}
if(_e0){
_e0.close();
}
_e0=_f5;
_e2=_f6;
var _f7=function(_f8,_f9){
while(_f8){
if(_f8===_f9){
return true;
}
_f8=_f8.parentNode;
}
return false;
};
_e3=_f7(_dc,_f5.domNode)?_dd:_dc;
console.debug("will restore focus to "+(_e3?(_e3.id||_e3.tagName):"nothing"));
console.debug("prev focus is "+_dd);
if(!dojo.withGlobal(_e2||dojo.global,_e5)){
_e4=dojo.withGlobal(_e2||dojo.global,_e9);
}else{
_e4=null;
}
};
this.restore=function(_fa){
if(_e0==_fa){
if(_e3){
_e3.focus();
}
if(_e4&&dojo.withGlobal(_e2||dojo.global,_e5)){
if(_e2){
_e2.focus();
}
try{
dojo.withGlobal(_e2||dojo.global,_ef,null,[_e4]);
}
catch(e){
}
}
_e4=null;
_e1=false;
_e0=null;
}
};
}();
dojo.provide("dijit.util.BackgroundIframe");
dijit.util.BackgroundIframe=function(_fb){
if(dojo.isIE&&dojo.isIE<7){
var _fc="<iframe src='javascript:false'"+" style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"+"z-index: -1; filter:Alpha(Opacity=\"0\");'>";
this.iframe=dojo.doc.createElement(_fc);
this.iframe.tabIndex=-1;
if(_fb){
_fb.appendChild(this.iframe);
this.domNode=_fb;
}else{
dojo.body().appendChild(this.iframe);
this.iframe.style.display="none";
}
}
};
dojo.extend(dijit.util.BackgroundIframe,{iframe:null,onResized:function(){
if(this.iframe&&this.domNode&&this.domNode.parentNode){
var _fd=dojo.marginBox(this.domNode);
if(!_fd.w||!_fd.h){
setTimeout(this,this.onResized,100);
return;
}
this.iframe.style.width=_fd.w+"px";
this.iframe.style.height=_fd.h+"px";
}
},size:function(_fe){
if(!this.iframe){
return;
}
var _ff=dojo.coords(_fe,true);
var s=this.iframe.style;
s.width=_ff.w+"px";
s.height=_ff.h+"px";
s.left=_ff.x+"px";
s.top=_ff.y+"px";
},setZIndex:function(node){
if(!this.iframe){
return;
}
this.iframe.style.zIndex=!isNaN(node)?node:(node.style.zIndex-1);
},show:function(){
if(this.iframe){
this.iframe.style.display="block";
}
},hide:function(){
if(this.iframe){
this.iframe.style.display="none";
}
},remove:function(){
if(this.iframe){
this.iframe.parentNode.removeChild(this.iframe);
delete this.iframe;
this.iframe=null;
}
}});
dojo.provide("dijit.util.place");
dijit.util.getViewport=function(){
var _102=dojo.global;
var _103=dojo.doc;
var w=0;
var h=0;
if(dojo.isMozilla){
w=_103.documentElement.clientWidth;
h=_102.innerHeight;
}else{
if(!dojo.isOpera&&_102.innerWidth){
w=_102.innerWidth;
h=_102.innerHeight;
}else{
if(dojo.isIE&&_103.documentElement&&_103.documentElement.clientHeight){
w=_103.documentElement.clientWidth;
h=_103.documentElement.clientHeight;
}else{
if(dojo.body().clientWidth){
w=dojo.body().clientWidth;
h=dojo.body().clientHeight;
}
}
}
}
return {w:w,h:h};
};
dijit.util.getScroll=function(){
var _106=dojo.global;
var _107=dojo.doc;
var top=_106.pageYOffset||_107.documentElement.scrollTop||dojo.body().scrollTop||0;
var left=_106.pageXOffset||_107.documentElement.scrollLeft||dojo.body().scrollLeft||0;
return {top:top,left:left,offset:{x:left,y:top}};
};
dijit.util.placeOnScreen=function(node,_10b,_10c,_10d,_10e,_10f,_110){
if(dojo.isArray(_10b)){
_110=_10f;
_10f=_10e;
_10e=_10d;
_10d=_10c;
_10c=_10b[1];
_10b=_10b[0];
}
if(dojo.isString(_10f)){
_10f=_10f.split(",");
}
if(!isNaN(_10d)){
_10d=[Number(_10d),Number(_10d)];
}else{
if(!dojo.isArray(_10d)){
_10d=[0,0];
}
}
var _111=dijit.util.getScroll().offset;
var view=dijit.util.getViewport();
node=dojo.byId(node);
var _113=node.style.display;
var _114=node.style.visibility;
node.style.visibility="hidden";
node.style.display="";
var bb=dojo.marginBox(node);
var w=bb.w;
var h=bb.h;
node.style.display=_113;
node.style.visibility=_114;
var _118,_119,_11a,_11b="";
if(!dojo.isArray(_10f)){
_10f=["TL"];
}
var _11c,_11d,_11e=Infinity,_11f;
for(var _120=0;_120<_10f.length;++_120){
var _118,_119="";
var _121=_10f[_120];
var _122=true;
var tryX=_10b-(_121.charAt(1)=="L"?0:w)+_10d[0]*(_121.charAt(1)=="L"?1:-1);
var tryY=_10c-(_121.charAt(0)=="T"?0:h)+_10d[1]*(_121.charAt(0)=="T"?1:-1);
if(_10e){
tryX-=_111.x;
tryY-=_111.y;
}
var x=tryX+w;
if(x>view.w){
_122=false;
}
x=Math.max(_10d[0],tryX)+_111.x;
if(_121.charAt(1)=="L"){
if(w>view.w-tryX){
_118=view.w-tryX;
_122=false;
}else{
_118=w;
}
}else{
if(tryX<0){
_118=w+tryX;
_122=false;
}else{
_118=w;
}
}
var y=tryY+h;
if(y>view.h){
_122=false;
}
y=Math.max(_10d[1],tryY)+_111.y;
if(_121.charAt(0)=="T"){
if(h>view.h-tryY){
_119=view.h-tryY;
_122=false;
}else{
_119=h;
}
}else{
if(tryY<0){
_119=h+tryY;
_122=false;
}else{
_119=h;
}
}
if(_122){
_11c=x;
_11d=y;
_11e=0;
_11a=_118;
_11b=_119;
_11f=_121;
break;
}else{
var dist=Math.pow(x-tryX-_111.x,2)+Math.pow(y-tryY-_111.y,2);
if(dist==0){
dist=Math.pow(h-_119,2);
}
if(_11e>dist){
_11e=dist;
_11c=x;
_11d=y;
_11a=_118;
_11b=_119;
_11f=_121;
}
}
}
if(!_110){
node.style.left=_11c+"px";
node.style.top=_11d+"px";
}
return {left:_11c,top:_11d,x:_11c,y:_11d,dist:_11e,corner:_11f,h:_11b,w:_11a};
};
dijit.util.placeOnScreenAroundElement=function(node,_129,_12a,_12b,_12c){
if(!node.parentNode||String(node.parentNode.tagName).toLowerCase()!="body"){
dojo.body().appendChild(node);
}
var best,_12e=Infinity;
_129=dojo.byId(_129);
var _12f=_129.style.display;
_129.style.display="";
var _130=_129.offsetWidth;
var _131=_129.offsetHeight;
var _132=dojo.coords(_129,true);
_129.style.display=_12f;
for(var _133 in _12b){
var pos,_135,_136;
var _137=_12b[_133];
_135=_132.x+(_133.charAt(1)=="L"?0:_130);
_136=_132.y+(_133.charAt(0)=="T"?0:_131);
pos=dijit.util.placeOnScreen(node,_135,_136,_12a,true,_137,true);
if(pos.dist==0){
best=pos;
break;
}else{
if(_12e>pos.dist){
_12e=pos.dist;
best=pos;
}
}
}
if(!_12c){
node.style.left=best.left+"px";
node.style.top=best.top+"px";
}
return best;
};
console.warn("dijit.dijit may dissapear in the 0.9 timeframe in lieu of a different rollup file!");
dojo.provide("dijit.dijit");
