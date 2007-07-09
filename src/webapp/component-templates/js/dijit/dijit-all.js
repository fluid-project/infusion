if(!dojo._hasResource["dijit.util.typematic"]){
dojo._hasResource["dijit.util.typematic"]=true;
dojo.provide("dijit.util.typematic");
dijit.util.typematic={_fireEventAndReload:function(){
this._timer=null;
this._callback(++this._count,this._node,this._evt);
this._currentTimeout=(this._currentTimeout<0)?this._initialDelay:((this._subsequentDelay>1)?this._subsequentDelay:Math.round(this._currentTimeout*this._subsequentDelay));
this._timer=setTimeout(dojo.hitch(this,"_fireEventAndReload"),this._currentTimeout);
},trigger:function(_1,_2,_3,_4,_5,_6,_7){
if(_5!=this._obj){
this.stop();
this._initialDelay=_7?_7:500;
this._subsequentDelay=_6?_6:0.9;
this._obj=_5;
this._evt=_1;
this._node=_3;
this._currentTimeout=-1;
this._count=-1;
this._callback=dojo.hitch(_2,_4);
this._fireEventAndReload();
}
},stop:function(){
if(this._timer){
clearTimeout(this._timer);
this._timer=null;
}
if(this._obj){
this._callback(-1,this._node,this._evt);
this._obj=null;
}
},addKeyListener:function(_8,_9,_a,_b,_c,_d){
var _e=[];
_e.push(dojo.connect(_8,"onkeypress",this,function(_f){
if(_f.keyCode==_9.keyCode&&(!_9.charCode||_9.charCode==_f.charCode)&&((typeof _9.ctrlKey=="undefined")||_9.ctrlKey==_f.ctrlKey)&&((typeof _9.altKey=="undefined")||_9.altKey==_f.ctrlKey)&&((typeof _9.shiftKey=="undefined")||_9.shiftKey==_f.ctrlKey)){
dojo.stopEvent(_f);
dijit.util.typematic.trigger(_9,_a,_8,_b,_9,_c,_d);
}else{
if(dijit.util.typematic._obj==_9){
dijit.util.typematic.stop();
}
}
}));
_e.push(dojo.connect(_8,"onkeyup",this,function(evt){
if(dijit.util.typematic._obj==_9){
dijit.util.typematic.stop();
}
}));
return _e;
},addMouseListener:function(_11,_12,_13,_14,_15){
var ary=[];
ary.push(dojo.connect(_11,"mousedown",this,function(evt){
dojo.stopEvent(evt);
dijit.util.typematic.trigger(evt,_12,_11,_13,_11,_14,_15);
}));
ary.push(dojo.connect(_11,"mouseup",this,function(evt){
dojo.stopEvent(evt);
dijit.util.typematic.stop();
}));
ary.push(dojo.connect(_11,"mouseout",this,function(evt){
dojo.stopEvent(evt);
dijit.util.typematic.stop();
}));
ary.push(dojo.connect(_11,"mousemove",this,function(evt){
dojo.stopEvent(evt);
}));
ary.push(dojo.connect(_11,"dblclick",this,function(evt){
dojo.stopEvent(evt);
if(dojo.isIE){
dijit.util.typematic.trigger(evt,_12,_11,_13,_11,_14,_15);
setTimeout("dijit.util.typematic.stop()",50);
}
}));
return ary;
},addListener:function(_1c,_1d,_1e,_1f,_20,_21,_22){
return this.addKeyListener(_1d,_1e,_1f,_20,_21,_22).concat(this.addMouseListener(_1c,_1f,_20,_21,_22));
}};
}
if(!dojo._hasResource["dijit.ColorPalette"]){
dojo._hasResource["dijit.ColorPalette"]=true;
dojo.provide("dijit.ColorPalette");
dojo.declare("dijit.ColorPalette",[dijit._Widget,dijit._Templated],{defaultTimeout:500,timeoutChangeRate:0.9,palette:"7x10",selectedColor:null,_currentFocus:0,_xDim:null,_yDim:null,_palettes:{"7x10":[["fff","fcc","fc9","ff9","ffc","9f9","9ff","cff","ccf","fcf"],["ccc","f66","f96","ff6","ff3","6f9","3ff","6ff","99f","f9f"],["c0c0c0","f00","f90","fc6","ff0","3f3","6cc","3cf","66c","c6c"],["999","c00","f60","fc3","fc0","3c0","0cc","36f","63f","c3c"],["666","900","c60","c93","990","090","399","33f","60c","939"],["333","600","930","963","660","060","366","009","339","636"],["000","300","630","633","330","030","033","006","309","303"]],"3x4":[["ffffff","00ff00","008000","0000ff"],["c0c0c0","ffff00","ff00ff","000080"],["808080","ff0000","800080","000000"]]},_imagePaths:{"7x10":dojo.moduleUrl("dijit","templates/colors7x10.png"),"3x4":dojo.moduleUrl("dijit","templates/colors3x4.png")},_paletteCoords:{"leftOffset":3,"topOffset":3,"cWidth":18,"cHeight":16},templateString:"<fieldset class=\"dijitInlineBox\">\n\t<div style=\"overflow: hidden\" dojoAttachPoint=\"divNode\" >\n\t\t<img style=\"border-style: none;\" dojoAttachPoint=\"imageNode\" tabIndex=\"-1\" />\n\t</div>\t\n</fieldset>\n",_paletteDims:{"7x10":{"width":"185px","height":"117px"},"3x4":{"width":"82px","height":"58px"}},postCreate:function(){
dojo.mixin(this.divNode.style,this._paletteDims[this.palette]);
this.imageNode.setAttribute("src",this._imagePaths[this.palette]);
var _23=this._palettes[this.palette];
this.domNode.style.position="relative";
this._highlightNodes=[];
for(var row=0;row<_23.length;row++){
for(var col=0;col<_23[row].length;col++){
var _26=document.createElement("img");
_26.src=dojo.moduleUrl("dijit","templates/blank.gif");
dojo.addClass(_26,"dijitPaletteImg");
var _27=_23[row][col];
_26.alt=_26.color=_27;
var _28=_26.style;
_28.color=_28.backgroundColor="#"+_27;
dojo.forEach(["onMouseOver","onBlur","onFocus","onKeyDown"],function(_29){
this.connect(_26,_29.toLowerCase(),_29);
},this);
this.connect(_26,"onmousedown","onClick");
this.divNode.appendChild(_26);
var _2a=this._paletteCoords;
_28.top=_2a.topOffset+(row*_2a.cHeight)+"px";
_28.left=_2a.leftOffset+(col*_2a.cWidth)+"px";
_26.setAttribute("tabIndex","-1");
_26.title=_27+" ";
dijit.util.wai.setAttr(_26,"waiRole","role","td");
_26.index=this._highlightNodes.length;
this._highlightNodes.push(_26);
}
}
this._highlightNodes[this._currentFocus].tabIndex=0;
this._xDim=_23[0].length;
this._yDim=_23.length;
var _2b={UP_ARROW:-this._xDim,DOWN_ARROW:this._xDim,RIGHT_ARROW:1,LEFT_ARROW:-1};
for(var key in _2b){
dijit.util.typematic.addKeyListener(this.domNode,{keyCode:dojo.keys[key],ctrlKey:false,altKey:false,shiftKey:false},this,function(){
var _2d=_2b[key];
return function(_2e){
this._navigateByKey(_2d,_2e);
};
}(),this.timeoutChangeRate,this.defaultTimeout);
}
},onColorSelect:function(_2f){
console.debug("Color selected is: "+_2f);
},onClick:function(evt){
var _31=evt.currentTarget;
this._currentFocus=_31.index;
_31.focus();
this._selectColor(_31);
},onMouseOver:function(evt){
var _33=evt.currentTarget;
_33.tabIndex=0;
_33.focus();
},onBlur:function(evt){
dojo.removeClass(evt.currentTarget,"dijitPaletteImgHighlight");
},onFocus:function(evt){
if(this._currentFocus!=evt.currentTarget.index){
this._highlightNodes[this._currentFocus].tabIndex=-1;
}
this._currentFocus=evt.currentTarget.index;
dojo.addClass(evt.currentTarget,"dijitPaletteImgHighlight");
},onKeyDown:function(evt){
if((evt.keyCode==dojo.keys.SPACE)&&this._currentFocus){
this._selectColor(this._highlightNodes[this._currentFocus]);
}
},_selectColor:function(_37){
this.selectedColor=_37.color;
this.onColorSelect(_37.color);
},_navigateByKey:function(_38,_39){
if(_39==-1){
return;
}
var _3a=this._currentFocus+_38;
if(_3a<this._highlightNodes.length&&_3a>-1){
var _3b=this._highlightNodes[_3a];
_3b.tabIndex=0;
_3b.focus();
}
}});
}
if(!dojo._hasResource["dijit.Declaration"]){
dojo._hasResource["dijit.Declaration"]=true;
dojo.provide("dijit.Declaration");
dojo.declare("dijit.Declaration",dijit._Widget,{widgetClass:"",replaceVars:true,defaults:null,mixins:[],buildRendering:function(){
var src=this.srcNodeRef.parentNode.removeChild(this.srcNodeRef);
var _3d=dojo.query("> script[type='dojo/connect']",src).orphan();
var _3e=src.nodeName;
if(this.mixins.length){
this.mixins=dojo.map(this.mixins,dojo.getObject);
}else{
this.mixins=[dijit._Widget,dijit._Templated];
}
this.mixins.push(function(){
_3d.forEach(function(_3f){
dojo.parser._wireUpConnect(this,_3f);
});
});
var _40=this.defaults||{};
_40.widgetsInTemplate=true;
_40.templateString="<"+_3e+">"+src.innerHTML+"</"+_3e+">";
dojo.query("[dojoType]",src).forEach(function(_41){
_41.removeAttribute("dojoType");
});
dojo.declare(this.widgetClass,this.mixins,_40);
}});
}
if(!dojo._hasResource["dojo.dnd.common"]){
dojo._hasResource["dojo.dnd.common"]=true;
dojo.provide("dojo.dnd.common");
dojo.dnd._copyKey=navigator.appVersion.indexOf("Macintosh")<0?"ctrlKey":"metaKey";
dojo.dnd.getCopyKeyState=function(e){
return e[dojo.dnd._copyKey];
};
dojo.dnd._uniqueId=0;
dojo.dnd.getUniqueId=function(){
var id;
do{
id="dojoUnique"+(++dojo.dnd._uniqueId);
}while(dojo.byId(id));
return id;
};
}
if(!dojo._hasResource["dojo.dnd.autoscroll"]){
dojo._hasResource["dojo.dnd.autoscroll"]=true;
dojo.provide("dojo.dnd.autoscroll");
dojo.dnd.getViewport=function(){
var d=dojo.doc,dd=d.documentElement,w=window,b=dojo.body();
if(dojo.isMozilla){
return {w:dd.clientWidth,h:w.innerHeight};
}else{
if(!dojo.isOpera&&w.innerWidth){
return {w:w.innerWidth,h:w.innerHeight};
}else{
if(!dojo.isOpera&&dd&&dd.clientWidth){
return {w:dd.clientWidth,h:dd.clientHeight};
}else{
if(b.clientWidth){
return {w:b.clientWidth,h:b.clientHeight};
}
}
}
}
return null;
};
dojo.dnd.V_TRIGGER_AUTOSCROLL=32;
dojo.dnd.H_TRIGGER_AUTOSCROLL=32;
dojo.dnd.V_AUTOSCROLL_VALUE=16;
dojo.dnd.H_AUTOSCROLL_VALUE=16;
dojo.dnd.autoScroll=function(e){
var v=dojo.dnd.getViewport(),dx=0,dy=0;
if(e.clientX<dojo.dnd.H_TRIGGER_AUTOSCROLL){
dx=-dojo.dnd.H_AUTOSCROLL_VALUE;
}else{
if(e.clientX>v.w-dojo.dnd.H_TRIGGER_AUTOSCROLL){
dx=dojo.dnd.H_AUTOSCROLL_VALUE;
}
}
if(e.clientY<dojo.dnd.V_TRIGGER_AUTOSCROLL){
dy=-dojo.dnd.V_AUTOSCROLL_VALUE;
}else{
if(e.clientY>v.h-dojo.dnd.V_TRIGGER_AUTOSCROLL){
dy=dojo.dnd.V_AUTOSCROLL_VALUE;
}
}
window.scrollBy(dx,dy);
};
dojo.dnd._validNodes={"div":1,"p":1,"td":1};
dojo.dnd._validOverflow={"auto":1,"scroll":1};
dojo.dnd.autoScrollNodes=function(e){
for(var n=e.target;n;){
if(n.nodeType==1&&(n.tagName.toLowerCase() in dojo.dnd._validNodes)){
var s=dojo.getComputedStyle(n);
if(s.overflow.toLowerCase() in dojo.dnd._validOverflow){
var b=dojo._getContentBox(n,s),t=dojo._abs(n,true);
console.debug(b.l,b.t,t.x,t.y,n.scrollLeft,n.scrollTop);
b.l+=t.x+n.scrollLeft;
b.t+=t.y+n.scrollTop;
var w=Math.min(dojo.dnd.H_TRIGGER_AUTOSCROLL,b.w/2),h=Math.min(dojo.dnd.V_TRIGGER_AUTOSCROLL,b.h/2),rx=e.pageX-b.l,ry=e.pageY-b.t,dx=0,dy=0;
if(rx>0&&rx<b.w){
if(rx<w){
dx=-dojo.dnd.H_AUTOSCROLL_VALUE;
}else{
if(rx>b.w-w){
dx=dojo.dnd.H_AUTOSCROLL_VALUE;
}
}
}
if(ry>0&&ry<b.h){
if(ry<h){
dy=-dojo.dnd.V_AUTOSCROLL_VALUE;
}else{
if(ry>b.h-h){
dy=dojo.dnd.V_AUTOSCROLL_VALUE;
}
}
}
var _57=n.scrollLeft,_58=n.scrollTop;
n.scrollLeft=n.scrollLeft+dx;
n.scrollTop=n.scrollTop+dy;
if(dx||dy){
console.debug(_57+", "+_58+"\n"+dx+", "+dy+"\n"+n.scrollLeft+", "+n.scrollTop);
}
if(_57!=n.scrollLeft||_58!=n.scrollTop){
return;
}
}
}
try{
n=n.parentNode;
}
catch(x){
n=null;
}
}
dojo.dnd.autoScroll(e);
};
}
if(!dojo._hasResource["dojo.dnd.move"]){
dojo._hasResource["dojo.dnd.move"]=true;
dojo.provide("dojo.dnd.move");
dojo.dnd.Mover=function(_59,e){
this.node=dojo.byId(_59);
this.marginBox={l:e.pageX,t:e.pageY};
var d=_59.ownerDocument,_5c=dojo.connect(d,"onmousemove",this,"onFirstMove");
this.events=[dojo.connect(d,"onmousemove",this,"onMouseMove"),dojo.connect(d,"onmouseup",this,"destroy"),dojo.connect(d,"ondragstart",dojo,"stopEvent"),dojo.connect(d,"onselectstart",dojo,"stopEvent"),_5c];
dojo.publish("dndMoveStart",[this.node]);
dojo.addClass(dojo.body(),"dojoMove");
dojo.addClass(this.node,"dojoMoveItem");
};
dojo.extend(dojo.dnd.Mover,{onMouseMove:function(e){
dojo.dnd.autoScroll(e);
var m=this.marginBox;
dojo.marginBox(this.node,{l:m.l+e.pageX,t:m.t+e.pageY});
},onFirstMove:function(){
this.node.style.position="absolute";
var m=dojo.marginBox(this.node);
m.l-=this.marginBox.l;
m.t-=this.marginBox.t;
this.marginBox=m;
dojo.disconnect(this.events.pop());
},destroy:function(){
dojo.forEach(this.events,dojo.disconnect);
dojo.publish("dndMoveStop",[this.node]);
dojo.removeClass(dojo.body(),"dojoMove");
dojo.removeClass(this.node,"dojoMoveItem");
this.events=this.node=null;
}});
dojo.dnd.Moveable=function(_60,opt){
this.node=dojo.byId(_60);
this.handle=(opt&&opt.handle)?dojo.byId(opt.handle):null;
if(!this.handle){
this.handle=this.node;
}
this.delay=(opt&&opt.delay>0)?opt.delay:0;
this.skip=opt&&opt.skip;
this.mover=(opt&&opt.mover)?opt.mover:dojo.dnd.Mover;
this.events=[dojo.connect(this.handle,"onmousedown",this,"onMouseDown"),dojo.connect(this.handle,"ondragstart",dojo,"stopEvent"),dojo.connect(this.handle,"onselectstart",dojo,"stopEvent")];
};
dojo.extend(dojo.dnd.Moveable,{onMouseDown:function(e){
if(this.skip){
var t=e.target;
if(t.nodeType==3){
t=t.parentNode;
}
if(" button textarea input select option ".indexOf(" "+t.tagName.toLowerCase()+" ")>=0){
return;
}
}
if(this.delay){
this.events.push(dojo.connect(this.handle,"onmousemove",this,"onMouseMove"));
this.events.push(dojo.connect(this.handle,"onmouseup",this,"onMouseUp"));
this._lastX=e.pageX;
this._lastY=e.pageY;
}else{
new this.mover(this.node,e);
}
dojo.stopEvent(e);
},onMouseMove:function(e){
if(Math.abs(e.pageX-this._lastX)>this.delay||Math.abs(e.pageY-this._lastY)>this.delay){
this.onMouseUp(e);
new this.mover(this.node,e);
}
dojo.stopEvent(e);
},onMouseUp:function(e){
dojo.disconnect(this.events.pop());
dojo.disconnect(this.events.pop());
},destroy:function(){
dojo.forEach(this.events,dojo.disconnect);
this.events=this.node=this.handle=null;
}});
dojo.dnd.constrainedMover=function(fun,_67){
var _68=function(_69,e){
dojo.dnd.Mover.call(this,_69,e);
};
dojo.extend(_68,dojo.dnd.Mover.prototype);
dojo.extend(_68,{onMouseMove:function(e){
var m=this.marginBox,c=this.constraintBox,l=m.l+e.pageX,t=m.t+e.pageY;
l=l<c.l?c.l:c.r<l?c.r:l;
t=t<c.t?c.t:c.b<t?c.b:t;
dojo.marginBox(this.node,{l:l,t:t});
},onFirstMove:function(){
dojo.dnd.Mover.prototype.onFirstMove.call(this);
var c=this.constraintBox=fun.call(this),m=this.marginBox;
c.r=c.l+c.w-(_67?m.w:0);
c.b=c.t+c.h-(_67?m.h:0);
}});
return _68;
};
dojo.dnd.boxConstrainedMover=function(box,_73){
return dojo.dnd.constrainedMover(function(){
return box;
},_73);
};
dojo.dnd.parentConstrainedMover=function(_74,_75){
var fun=function(){
var n=this.node.parentNode,s=dojo.getComputedStyle(n),mb=dojo._getMarginBox(n,s);
if(_74=="margin"){
return mb;
}
var t=dojo._getMarginExtents(n,s);
mb.l+=t.l,mb.t+=t.t,mb.w-=t.w,mb.h-=t.h;
if(_74=="border"){
return mb;
}
t=dojo._getBorderExtents(n,s);
mb.l+=t.l,mb.t+=t.t,mb.w-=t.w,mb.h-=t.h;
if(_74=="padding"){
return mb;
}
t=dojo._getPadExtents(n,s);
mb.l+=t.l,mb.t+=t.t,mb.w-=t.w,mb.h-=t.h;
return mb;
};
return dojo.dnd.constrainedMover(fun,_75);
};
}
if(!dojo._hasResource["dojo.fx"]){
dojo._hasResource["dojo.fx"]=true;
dojo.provide("dojo.fx");
dojo.fx.chain=function(_7b){
var _7c=_7b.shift();
var _7d=_7c;
dojo.forEach(_7b,function(_7e){
dojo.connect(_7d,"onEnd",_7e,"play");
_7d=_7e;
});
return _7c;
};
dojo.fx.combine=function(_7f){
var _80=_7f.shift();
dojo.forEach(_7f,function(_81){
dojo.forEach(["play","pause","stop"],function(_82){
if(_81[_82]){
dojo.connect(_80,_82,_81,_82);
}
},this);
});
return _80;
};
dojo.fx.slideIn=function(_83){
_83.node=dojo.byId(_83.node);
var _84=dojo.animateProperty(dojo.mixin({properties:{height:{start:1}},oprop:{}},_83));
dojo.connect(_84,"beforeBegin",_84,function(){
var _85=this.node;
var s=this.node.style;
s.visibility="hidden";
s.display="";
var _87=dojo.contentBox(_85).h;
s.visibility="";
s.display="none";
this.properties.height.end=_87;
var _88=this.oprop;
_88.overflow=s.overflow;
_88.height=s.height;
s.overflow="hidden";
s.height="1px";
dojo.style(this.node,"display","");
});
dojo.connect(_84,"onEnd",_84,function(){
var s=this.node.style;
var _8a=this.oprop;
s.overflow=_8a.overflow;
s.height=_8a.height;
});
return _84;
};
dojo.fx.slideOut=function(_8b){
var _8c=_8b.node=dojo.byId(_8b.node);
var _8d={};
var _8e=dojo.animateProperty(dojo.mixin({properties:{height:{start:function(){
return dojo.contentBox(_8c).h;
},end:1}},oprop:_8d},_8b));
dojo.connect(_8e,"beforeBegin",_8e,function(){
var s=_8c.style;
_8d.overflow=s.overflow;
_8d.height=s.height;
s.overflow="hidden";
dojo.style(_8c,"display","");
});
dojo.connect(_8e,"onEnd",_8e,function(){
dojo.style(this.node,"display","none");
var s=this.node.style;
s.overflow=_8d.overflow;
s.height=_8d.height;
});
return _8e;
};
dojo.fx.slideTo=function(_91){
var _92=_91.node=dojo.byId(_91.node);
var _93=dojo.getComputedStyle;
var top=null;
var _95=null;
var _96=(function(){
var _97=_92;
return function(){
var pos=_93(_97).position;
top=(pos=="absolute"?_92.offsetTop:parseInt(_93(_92).top)||0);
_95=(pos=="absolute"?_92.offsetLeft:parseInt(_93(_92).left)||0);
if(pos!="absolute"&&pos!="relative"){
var ret=dojo.coords(_97,true);
top=ret.y;
_95=ret.x;
_97.style.position="absolute";
_97.style.top=top+"px";
_97.style.left=_95+"px";
}
};
})();
_96();
var _9a=dojo.animateProperty(dojo.mixin({properties:{top:{start:top,end:_91.top||0},left:{start:_95,end:_91.left||0}}},_91));
dojo.connect(_9a,"beforeBegin",_9a,_96);
return _9a;
};
}
if(!dojo._hasResource["dijit.layout.ContentPane"]){
dojo._hasResource["dijit.layout.ContentPane"]=true;
dojo.provide("dijit.layout.ContentPane");
dojo.declare("dijit.layout.ContentPane",dijit._Widget,{href:"",extractContent:false,parseOnLoad:true,preventCache:false,preload:false,refreshOnShow:false,loadingMessage:"Loading...",errorMessage:"Sorry, but an error occured",isLoaded:false,"class":"dijitContentPane",postCreate:function(){
this.domNode.title="";
dojo.addClass(this.domNode,this["class"]);
},startup:function(){
if(!this._started){
if(!this.linkLazyLoadToParent()){
this._loadCheck();
}
this._started=true;
}
},refresh:function(){
return this._prepareLoad(true);
},setHref:function(_9b){
this.href=_9b;
return this._prepareLoad();
},setContent:function(_9c){
if(!this._isDownloaded){
this.href="";
this._onUnloadHandler();
}
this._setContent(_9c||"");
this._isDownloaded=false;
if(this.parseOnLoad){
this._createSubWidgets();
}
this._onLoadHandler();
},cancel:function(){
if(this._xhrDfd&&(this._xhrDfd.fired==-1)){
this._xhrDfd.cancel();
}
delete this._xhrDfd;
},destroy:function(){
if(this._beingDestroyed){
return;
}
this._onUnloadHandler();
this.unlinkLazyLoadFromParent();
this._beingDestroyed=true;
dijit.layout.ContentPane.superclass.destroy.call(this);
},resize:function(_9d){
dojo.marginBox(this.domNode,_9d);
},linkLazyLoadToParent:function(){
if(dijit._Contained&&dijit.layout.StackContainer&&!this._subscr_show){
var p=this,ch=this;
while(p=dijit._Contained.prototype.getParent.call(p)){
if(p&&p instanceof dijit.layout.StackContainer){
break;
}
ch=p;
}
if(p){
function cb(_a0){
return function(_a1){
if(_a1==ch&&_a0){
_a0.call(this);
}
};
};
if(p.selectedChildWidget==ch){
this._loadCheck();
}
this._subscr_show=dojo.subscribe(p.id+"-selectChild",this,cb(this._loadCheck));
this._subscr_remove=dojo.subscribe(p.id+"-selectChild",this,cb(this.unlinkLazyLoadFromParent));
return true;
}
}
return false;
},unlinkLazyLoadFromParent:function(){
if(this._subscr_show){
dojo.unsubscribe(this._subscr_remove);
dojo.unsubscribe(this._subscr_show);
this._subscr_remove=this._subscr_show=null;
}
},_loadCheck:function(){
if(this.refreshOnShow||(!this.isLoaded&&this.href)){
this._prepareLoad(this.refreshOnShow);
}
},_prepareLoad:function(_a2){
this.isLoaded=false;
if(_a2||this.preload||(this.domNode.style.display!="none")){
this._downloadExternalContent();
}
},_downloadExternalContent:function(){
this.cancel();
this._onUnloadHandler();
this._setContent(this.onDownloadStart.call(this));
var _a3=this;
var _a4={preventCache:(this.preventCache||this.refreshOnShow),url:this.href,handleAs:"text"};
var _a5=this._xhrDfd=dojo.xhrGet(_a4);
_a5.addCallback(function(_a6){
try{
_a3.onDownloadEnd.call(_a3);
_a3._isDownloaded=true;
_a3.setContent.call(_a3,_a6);
}
catch(err){
_a3._onError.call(_a3,"Content",err);
}
return _a6;
});
_a5.addErrback(function(err){
if(!_a5.cancelled){
_a3._onError.call(_a3,"Download",err);
}
return err;
});
},_onLoadHandler:function(){
this.isLoaded=true;
try{
this.onLoad.call(this);
}
catch(e){
console.error("Error "+this.widgetId+" running custom onLoad code");
}
},_onUnloadHandler:function(){
this.isLoaded=false;
this.cancel();
try{
this.onUnload.call(this);
}
catch(e){
console.error("Error "+this.widgetId+" running custom onUnload code");
}
},_setContent:function(_a8){
this.destroyDescendants();
try{
var _a9=this.containerNode||this.domNode;
while(_a9.firstChild){
dojo._destroyElement(_a9.firstChild);
}
if(typeof _a8=="string"){
if(this.extractContent){
match=_a8.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
if(match){
_a8=match[1];
}
}
_a9.innerHTML=_a8;
}else{
if(_a8.nodeType){
_a9.appendChild(_a8);
}else{
dojo.forEach(_a8,function(n){
_a9.appendChild(n.cloneNode(true));
});
}
}
}
catch(e){
var _ab=this.onContentError(e);
try{
_a9.innerHTML=_ab;
}
catch(e){
console.error("Fatal "+this.id+" could not change content due to "+e.message,e);
}
}
},_onError:function(_ac,err,_ae){
var _af=this["on"+_ac+"Error"].call(this,err);
if(_ae){
console.error(_ae,err);
}else{
if(_af){
this._setContent.call(this,_af);
}
}
},_createSubWidgets:function(){
var _b0=this.containerNode||this.domNode;
try{
dojo.parser.parse(_b0,true);
}
catch(e){
this._onError("Content",e,"Couldn't create widgets in "+this.id+(this.href?" from "+this.href:""));
}
},onLoad:function(e){
},onUnload:function(e){
},onDownloadStart:function(){
return this.loadingMessage;
},onContentError:function(_b3){
},onDownloadError:function(_b4){
return this.errorMessage;
},onDownloadEnd:function(){
}});
}
if(!dojo._hasResource["dijit.Dialog"]){
dojo._hasResource["dijit.Dialog"]=true;
dojo.provide("dijit.Dialog");
dojo.declare("dijit.DialogUnderlay",[dijit._Widget,dijit._Templated],{templateString:"<div class=dijitDialogUnderlayWrapper id='${id}_underlay'><div class=dijitDialogUnderlay dojoAttachPoint='node'></div></div>",postCreate:function(){
var b=dojo.body();
b.appendChild(this.domNode);
this.bgIframe=new dijit.util.BackgroundIframe(this.domNode);
},layout:function(){
var _b6=dijit.util.getViewport();
var is=this.node.style,os=this.domNode.style;
os.top=_b6.t+"px";
os.left=_b6.l+"px";
is.width=_b6.w+"px";
is.height=_b6.h+"px";
var _b9=dijit.util.getViewport();
if(_b6.w!=_b9.w){
is.width=_b9.w+"px";
}
if(_b6.h!=_b9.h){
is.height=_b9.h+"px";
}
},show:function(){
this.domNode.style.display="block";
this.layout();
if(this.bgIframe.iframe){
this.bgIframe.iframe.style.display="block";
}
},hide:function(){
this.domNode.style.display="none";
this.domNode.style.width=this.domNode.style.height="1px";
if(this.bgIframe.iframe){
this.bgIframe.iframe.style.display="none";
}
},uninitialize:function(){
if(this.bgIframe){
this.bgIframe.destroy();
}
}});
dojo.declare("dijit.Dialog",[dijit.layout.ContentPane,dijit._Templated],{templateString:"<div class=\"dijitDialog\">\n\t\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\" title=\"${title}\">\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: hide\">\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\n\t\t</span>\n\t</div>\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dijitTitlePaneContent\"></div>\n\t<span dojoAttachPoint=\"tabEnd\" dojoAttachEvent=\"onfocus:_cycleFocus;\" tabindex=\"0\"></span>\n</div>\n",title:"",closeNode:"",_duration:400,_lastFocusItem:null,postCreate:function(){
dijit.Dialog.superclass.postCreate.apply(this,arguments);
this.domNode.style.display="none";
},startup:function(){
if(this.closeNode){
var _ba=dojo.byId(this.closeNode);
this.connect(_ba,"onclick","hide");
}
},onLoad:function(){
this._position();
dijit.Dialog.superclass.onLoad.call(this);
},_setup:function(){
this._modalconnects=[];
if(this.titleBar){
this._moveable=new dojo.dnd.Moveable(this.domNode,{handle:this.titleBar});
}
this._underlay=new dijit.DialogUnderlay();
var _bb=this.domNode;
this._fadeIn=dojo.fx.combine([dojo.fadeIn({node:_bb,duration:this._duration}),dojo.fadeIn({node:this._underlay.domNode,duration:this._duration,onBegin:dojo.hitch(this._underlay,"show")})]);
this._fadeOut=dojo.fx.combine([dojo.fadeOut({node:_bb,duration:this._duration,onEnd:function(){
_bb.style.display="none";
}}),dojo.fadeOut({node:this._underlay.domNode,duration:this._duration,onEnd:dojo.hitch(this._underlay,"hide")})]);
},uninitialize:function(){
if(this._underlay){
this._underlay.destroy();
}
},_position:function(){
var _bc=dijit.util.getViewport();
var mb=dojo.marginBox(this.domNode);
var _be=this.domNode.style;
_be.left=(_bc.l+(_bc.w-mb.w)/2)+"px";
_be.top=(_bc.t+(_bc.h-mb.h)/2)+"px";
},_findLastFocus:function(evt){
this._lastFocused=evt.target;
},_cycleFocus:function(evt){
if(!this._lastFocusItem){
this._lastFocusItem=this._lastFocused;
}
this.titleBar.focus();
},_onKey:function(evt){
if(evt.keyCode){
var _c2=evt.target;
if(_c2==this.titleBar&&evt.shiftKey&&evt.keyCode==dojo.keys.TAB){
if(this._lastFocusItem){
this._lastFocusItem.focus();
}
dojo.stopEvent(evt);
}else{
while(_c2){
if(_c2==this.domNode){
if(evt.keyCode==dojo.keys.ESCAPE){
this.hide();
}else{
return;
}
}
_c2=_c2.parentNode;
}
if(evt.keyCode!=dojo.keys.TAB){
dojo.stopEvent(evt);
}else{
if(!dojo.isOpera){
try{
this.titleBar.focus();
}
catch(e){
}
}
}
}
}
},show:function(){
if(!this._alreadyInitialized){
this._setup();
this._alreadyInitialized=true;
}
if(this._fadeOut.status()=="playing"){
this._fadeOut.stop();
}
this._modalconnects.push(dojo.connect(window,"onscroll",this,"layout"));
this._modalconnects.push(dojo.connect(document.documentElement,"onkeypress",this,"_onKey"));
var ev=typeof (document.ondeactivate)=="object"?"ondeactivate":"onblur";
this._modalconnects.push(dojo.connect(this.containerNode,ev,this,"_findLastFocus"));
dojo.style(this.domNode,"opacity",0);
this.domNode.style.display="block";
this._loadCheck();
this._position();
this._fadeIn.play();
this._savedFocus=dijit.util.focus.save(this);
setTimeout(dojo.hitch(this,function(){
try{
this.titleBar.focus();
}
catch(e){
}
}),50);
},hide:function(){
if(!this._alreadyInitialized){
return;
}
if(this._fadeIn.status()=="playing"){
this._fadeIn.stop();
}
this._fadeOut.play();
if(this._scrollConnected){
this._scrollConnected=false;
}
dojo.forEach(this._modalconnects,dojo.disconnect);
this._modalconnects=[];
dijit.util.focus.restore(this._savedFocus);
},layout:function(){
if(this.domNode.style.display=="block"){
this._underlay.layout();
this._position();
}
}});
dojo.declare("dijit.TooltipDialog",[dijit.layout.ContentPane,dijit._Templated],{closeNode:"",title:"",_lastFocusItem:null,templateString:"<div id=\"${id}\" class=\"dijitTooltipDialog\" >\n\t<div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\" tabindex=\"0\" waiRole=\"dialog\"></div>\n\t<span dojoAttachPoint=\"tabEnd\" tabindex=\"0\" dojoAttachEvent=\"focus:_cycleFocus\"></span>\n\t<div class=\"dijitTooltipConnector\" ></div>\n</div>\n",postCreate:function(){
dijit.TooltipDialog.superclass.postCreate.apply(this,arguments);
this.connect(this.containerNode,"onkeypress","_onKey");
var ev=typeof (document.ondeactivate)=="object"?"ondeactivate":"onblur";
this.connect(this.containerNode,ev,"_findLastFocus");
this.containerNode.title=this.title;
},startup:function(){
if(this.closeNode){
var _c5=dojo.byId(this.closeNode);
this.connect(_c5,"onclick","_hide");
}
},onOpen:function(pos){
this.domNode.className="dijitTooltipDialog dijitTooltip"+(pos.corner=="TL"?"Below":"Above");
this.containerNode.focus();
},_hide:function(){
dijit.util.popup.closeAll();
},_onKey:function(evt){
if(evt.keyCode==dojo.keys.ESCAPE){
this._hide();
}else{
if(evt.target==this.containerNode&&evt.shiftKey&&evt.keyCode==dojo.keys.TAB){
if(this._lastFocusItem){
this._lastFocusItem.focus();
}
dojo.stopEvent(evt);
}
}
},_findLastFocus:function(evt){
this._lastFocused=evt.target;
},_cycleFocus:function(evt){
if(!this._lastFocusItem){
this._lastFocusItem=this._lastFocused;
}
this.containerNode.focus();
}});
}
if(!dojo._hasResource["dijit._editor.selection"]){
dojo._hasResource["dijit._editor.selection"]=true;
dojo.provide("dijit._editor.selection");
dojo.mixin(dijit._editor.selection,{isCollapsed:function(){
var _ca=dojo.global;
var _cb=dojo.doc;
if(_cb["selection"]){
return _cb.selection.createRange().text=="";
}else{
if(_ca["getSelection"]){
var _cc=_ca.getSelection();
if(dojo.isString(_cc)){
return _cc=="";
}else{
return _cc.isCollapsed||_cc.toString()=="";
}
}
}
},getType:function(){
if(dojo.doc["selection"]){
return dojo.doc.selection.type.toLowerCase();
}else{
var _cd="text";
var _ce;
try{
_ce=dojo.global.getSelection();
}
catch(e){
}
if(_ce&&_ce.rangeCount==1){
var _cf=_ce.getRangeAt(0);
if((_cf.startContainer==_cf.endContainer)&&((_cf.endOffset-_cf.startOffset)==1)&&(_cf.startContainer.nodeType!=3)){
_cd="control";
}
}
return _cd;
}
},getSelectedElement:function(){
if(this.getType()=="control"){
if(dojo.doc["selection"]){
var _d0=dojo.doc.selection.createRange();
if(_d0&&_d0.item){
return dojo.doc.selection.createRange().item(0);
}
}else{
var _d1=dojo.global.getSelection();
return _d1.anchorNode.childNodes[_d1.anchorOffset];
}
}
},getParentElement:function(){
if(this.getType()=="control"){
var p=this.getSelectedElement();
if(p){
return p.parentNode;
}
}else{
if(dojo.doc["selection"]){
return dojo.doc.selection.createRange().parentElement();
}else{
var _d3=dojo.global.getSelection();
if(_d3){
var _d4=_d3.anchorNode;
while(_d4&&(_d4.nodeType!=1)){
_d4=_d4.parentNode;
}
return _d4;
}
}
}
},hasAncestorElement:function(_d5){
return (this.getAncestorElement.apply(this,arguments)!=null);
},getAncestorElement:function(_d6){
var _d7=this.getSelectedElement()||this.getParentElement();
return this.getParentOfType(_d7,arguments);
},isTag:function(_d8,_d9){
if(_d8&&_d8.tagName){
var _da=_d8.tagName.toLowerCase();
for(var i=0;i<_d9.length;i++){
var _dc=String(_d9[i]).toLowerCase();
if(_da==_dc){
return _dc;
}
}
}
return "";
},getParentOfType:function(_dd,_de){
while(_dd){
if(this.isTag(_dd,_de).length){
return _dd;
}
_dd=_dd.parentNode;
}
return null;
},remove:function(){
var _s=dojo.doc.selection;
if(_s){
if(_s.type.toLowerCase()!="none"){
_s.clear();
}
return _s;
}else{
_s=dojo.global.getSelection();
_s.deleteFromDocument();
return _s;
}
},selectElementChildren:function(_e0){
var _e1=dojo.global;
var _e2=dojo.doc;
_e0=dojo.byId(_e0);
if(_e2.selection&&dojo.body().createTextRange){
var _e3=_e0.ownerDocument.body.createTextRange();
_e3.moveToElementText(_e0);
_e3.select();
}else{
if(_e1["getSelection"]){
var _e4=_e1.getSelection();
if(_e4["setBaseAndExtent"]){
_e4.setBaseAndExtent(_e0,0,_e0,_e0.innerText.length-1);
}else{
if(_e4["selectAllChildren"]){
_e4.selectAllChildren(_e0);
}
}
}
}
},selectElement:function(_e5){
var _e6=dojo.doc;
_e5=dojo.byId(_e5);
if(_e6.selection&&dojo.body().createTextRange){
try{
var _e7=dojo.body().createControlRange();
_e7.addElement(_e5);
_e7.select();
}
catch(e){
this.selectElementChildren(_e5);
}
}else{
if(dojo.global["getSelection"]){
var _e8=dojo.global.getSelection();
if(_e8["removeAllRanges"]){
var _e7=_e6.createRange();
_e7.selectNode(_e5);
_e8.removeAllRanges();
_e8.addRange(_e7);
}
}
}
}});
}
if(!dojo._hasResource["dijit._editor.RichText"]){
dojo._hasResource["dijit._editor.RichText"]=true;
dojo.provide("dijit._editor.RichText");
if(!djConfig["useXDomain"]||djConfig["allowXdRichTextSave"]){
if(dojo._post_load){
(function(){
var _e9=dojo.doc.createElement("textarea");
_e9.id="dijit._editor.RichText.savedContent";
var s=_e9.style;
s.display="none";
s.position="absolute";
s.top="-100px";
s.left="-100px";
s.height="3px";
s.width="3px";
dojo.body().appendChild(_e9);
})();
}else{
try{
dojo.doc.write("<textarea id=\"dijit._editor.RichText.savedContent\" "+"style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
}
catch(e){
}
}
}
dojo.declare("dijit._editor.RichText",[dijit._Widget],null,{preamble:function(){
this.contentPreFilters=[];
this.contentPostFilters=[];
this.contentDomPreFilters=[];
this.contentDomPostFilters=[];
this.editingAreaStyleSheets=[];
this._keyHandlers={};
this.contentPreFilters.push(dojo.hitch(this,"_preFixUrlAttributes"));
if(dojo.isMoz){
this.contentPreFilters.push(this._fixContentForMoz);
}
this.onLoadDeferred=new dojo.Deferred();
if(this.blockNodeForEnter=="BR"){
if(dojo.isIE){
this.contentDomPreFilters.push(dojo.hitch(this,"regularPsToSingleLinePs"));
this.contentDomPostFilters.push(dojo.hitch(this,"singleLinePsToRegularPs"));
}
}else{
if(this.blockNodeForEnter){
this.addKeyHandler(13,0,this.handleEnterKey);
this.addKeyHandler(13,2,this.handleEnterKey);
}
}
},inheritWidth:false,focusOnLoad:false,saveName:"",styleSheets:"",_content:"",height:"",minHeight:"1em",isClosed:true,isLoaded:false,_SEPARATOR:"@@**%%__RICHTEXTBOUNDRY__%%**@@",onLoadDeferred:null,postCreate:function(){
dojo.publish("dijit._editor.RichText::init",[this]);
this.open();
this.setupDefaultShortcuts();
},setupDefaultShortcuts:function(){
var _eb=this.KEY_CTRL;
var _ec=function(cmd,arg){
return arguments.length==1?function(){
this.execCommand(cmd);
}:function(){
this.execCommand(cmd,arg);
};
};
this.addKeyHandler("b",_eb,_ec("bold"));
this.addKeyHandler("i",_eb,_ec("italic"));
this.addKeyHandler("u",_eb,_ec("underline"));
this.addKeyHandler("a",_eb,_ec("selectall"));
this.addKeyHandler("s",_eb,function(){
this.save(true);
});
this.addKeyHandler("1",_eb,_ec("formatblock","h1"));
this.addKeyHandler("2",_eb,_ec("formatblock","h2"));
this.addKeyHandler("3",_eb,_ec("formatblock","h3"));
this.addKeyHandler("4",_eb,_ec("formatblock","h4"));
this.addKeyHandler("\\",_eb,_ec("insertunorderedlist"));
if(!dojo.isIE){
this.addKeyHandler("Z",_eb,_ec("redo"));
}
},events:["onBlur","onFocus","onKeyPress","onKeyDown","onKeyUp","onClick"],captureEvents:[],_safariIsLeopard:function(){
var _ef=false;
if(dojo.isSafari){
var tmp=navigator.userAgent.split("AppleWebKit/")[1];
var ver=parseFloat(tmp.split(" ")[0]);
if(ver>=420){
_ef=true;
}
}
return _ef;
},_editorCommandsLocalized:false,_localizeEditorCommands:function(){
if(this._editorCommandsLocalized){
return;
}
this._editorCommandsLocalized=true;
var _f2=["p","pre","address","h1","h2","h3","h4","h5","h6","ol","div","ul"];
var _f3="",_f4,i=0;
while(_f4=_f2[i++]){
if(_f4.charAt(1)!="l"){
_f3+="<"+_f4+"><span>content</span></"+_f4+">";
}else{
_f3+="<"+_f4+"><li>content</li></"+_f4+">";
}
}
with(this.iframe.style){
position="absolute";
left="-2000px";
top="-2000px";
}
this.editNode.innerHTML=_f3;
var _f6=this.editNode.firstChild;
while(_f6){
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[_f6.firstChild]);
var _f7=_f6.tagName.toLowerCase();
this._local2NativeFormatNames[_f7]=this.queryCommandValue("formatblock");
this._native2LocalFormatNames[this._local2NativeFormatNames[_f7]]=_f7;
_f6=_f6.nextSibling;
}
with(this.iframe.style){
position="";
left="";
top="";
}
},open:function(_f8){
if((!this.onLoadDeferred)||(this.onLoadDeferred.fired>=0)){
this.onLoadDeferred=new dojo.Deferred();
}
if(!this.isClosed){
this.close();
}
dojo.publish("dijit._editor.RichText::open",[this]);
this._content="";
if((arguments.length==1)&&(_f8["nodeName"])){
this.domNode=_f8;
}
if((this.domNode["nodeName"])&&(this.domNode.nodeName.toLowerCase()=="textarea")){
this.textarea=this.domNode;
var _f9=this._preFilterContent(this.textarea.value);
this.domNode=dojo.doc.createElement("div");
this.domNode.cssText=this.textarea.cssText;
this.domNode.className+=" "+this.textarea.className;
if(!dojo.isSafari){
dojo.place(this.domNode,this.textarea,"before");
}
var _fa=dojo.hitch(this,function(){
with(this.textarea.style){
display="block";
position="absolute";
left=top="-1000px";
if(dojo.isIE){
this.__overflow=overflow;
overflow="hidden";
}
}
});
if(dojo.isIE){
setTimeout(_fa,10);
}else{
_fa();
}
if(this.textarea.form){
dojo.connect(this.textarea.form,"onsubmit",this,function(){
this.textarea.value=this.getValue();
});
}
}else{
var _f9=this._preFilterContent(this.getNodeChildrenHtml(this.domNode));
this.domNode.innerHTML="";
}
if(_f9==""){
_f9="&nbsp;";
}
dojo.place(this.domNode,this.srcNodeRef,"before");
var _fb=dojo.contentBox(this.domNode);
this._oldHeight=_fb.h;
this._oldWidth=_fb.w;
this._firstChildContributingMargin=this.height?0:this._getContributingMargin(this.domNode,"top");
this._lastChildContributingMargin=this.height?0:this._getContributingMargin(this.domNode,"bottom");
this.savedContent=_f9;
if((this.domNode["nodeName"])&&(this.domNode.nodeName=="LI")){
this.domNode.innerHTML=" <br>";
}
this.editingArea=dojo.doc.createElement("div");
this.domNode.appendChild(this.editingArea);
if(this.saveName!=""&&(!djConfig["useXDomain"]||djConfig["allowXdRichTextSave"])){
var _fc=dojo.byId("dijit._editor.RichText.savedContent");
if(_fc.value!=""){
var _fd=_fc.value.split(this._SEPARATOR),i=0,dat;
while(dat=_fd[i++]){
var data=dat.split(":");
if(data[0]==this.saveName){
_f9=data[1];
_fd.splice(i,1);
break;
}
}
}
dojo.connect(window,"onbeforeunload",this,"_saveContent");
}
this.isClosed=false;
if(dojo.isIE||this._safariIsLeopard()||dojo.isOpera){
var ifr=this.iframe=dojo.doc.createElement("iframe");
ifr.src="javascript:void(0)";
this.editorObject=ifr;
ifr.style.border="none";
ifr.style.width="100%";
ifr.frameBorder=0;
this.editingArea.appendChild(ifr);
this.window=ifr.contentWindow;
this.document=this.window.document;
this.document.open();
this.document.write(this._getIframeDocTxt());
this.document.close();
if(this.height){
this.editNode=this.document.body;
}else{
this.document.body.appendChild(this.document.createElement("div"));
this.editNode=this.document.body.firstChild;
}
this.editNode.contentEditable=true;
if(dojo.isIE>=7){
if(this.height){
ifr.style.height=this.height;
}
if(this.minHeight){
ifr.style.minHeight=this.minHeight;
}
}else{
ifr.style.height=this.height?this.height:this.minHeight;
}
this._localizeEditorCommands();
this.editNode.innerHTML=_f9;
this._preDomFilterContent(this.editNode);
var _102=this.events.concat(this.captureEvents);
dojo.forEach(_102,function(e){
dojo.connect(this.editNode,e.toLowerCase(),this,e);
},this);
this.onLoad();
}else{
this._drawIframe(_f9);
this.editorObject=this.iframe;
}
if(this.domNode.nodeName=="LI"){
this.domNode.lastChild.style.marginTop="-1.2em";
}
this.domNode.className+=" RichTextEditable";
},_local2NativeFormatNames:{},_native2LocalFormatNames:{},_hasCollapseableMargin:function(_104,side){
},_getContributingMargin:function(_106,_107){
return 0;
if(_107=="top"){
var _108="previousSibling";
var _109="nextSibling";
var _10a="firstChild";
var _10b="margin-top";
var _10c="margin-bottom";
}else{
var _108="nextSibling";
var _109="previousSibling";
var _10a="lastChild";
var _10b="margin-bottom";
var _10c="margin-top";
}
var _10d=dojo.html.getPixelValue(_106,_10b,false);
function isSignificantNode(_10e){
return !(_10e.nodeType==3&&dojo.string.isBlank(_10e.data))&&dojo.html.getStyle(_10e,"display")!="none"&&!dojo.html.isPositionAbsolute(_10e);
};
var _10f=0;
var _110=_106[_10a];
while(_110){
while((!isSignificantNode(_110))&&_110[_109]){
_110=_110[_109];
}
_10f=Math.max(_10f,dojo.html.getPixelValue(_110,_10b,false));
if(!this._hasCollapseableMargin(_110,_107)){
break;
}
_110=_110[_10a];
}
if(!this._hasCollapseableMargin(_106,_107)){
return parseInt(_10f);
}
var _111=0;
var _112=_106[_108];
while(_112){
if(isSignificantNode(_112)){
_111=dojo.html.getPixelValue(_112,_10c,false);
break;
}
_112=_112[_108];
}
if(!_112){
_111=dojo.html.getPixelValue(_106.parentNode,_10b,false);
}
if(_10f>_10d){
return parseInt(Math.max((_10f-_10d)-_111,0));
}else{
return 0;
}
},_getIframeDocTxt:function(){
var _cs=dojo.getComputedStyle(this.domNode);
var font=[_cs.fontWeight,_cs.fontSize,_cs.fontFamily].join(" ");
var _115=_cs.lineHeight;
if(_115.indexOf("px")>=0){
_115=parseFloat(_115)/parseFloat(_cs.fontSize);
}else{
if(_115.indexOf("em")>=0){
_115=parseFloat(_115);
}else{
_115="1.0";
}
}
return ["<html><head><style>","body,html {","\tbackground:transparent;","\tpadding: 0;","\tmargin: 0;","}","body{","\ttop:0px; left:0px; right:0px;",((this.height||dojo.isOpera)?"":"position: fixed;"),"\tfont:",font,";","\tmin-height:",this.minHeight,";","\tline-height:",_115,"}","p{ margin: 1em 0 !important; }",(this.height?"":"body > *:first-child{ padding-top:0 !important;margin-top:"+this._firstChildContributingMargin+"px !important;}"+"body > *:last-child {"+"\tpadding-bottom:0 !important;"+"\tmargin-bottom:"+this._lastChildContributingMargin+"px !important;"+"}"),"li > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; } ","li{ min-height:1.2em; }","</style>",this._applyEditingAreaStyleSheets(),"</head><body></body></html>"].join("");
},_drawIframe:function(html){
var _117=Boolean(dojo.isMoz&&(typeof window.XML=="undefined"));
if(!this.iframe){
var ifr=this.iframe=dojo.doc.createElement("iframe");
var ifrs=ifr.style;
ifrs.border="none";
ifrs.lineHeight="0";
ifrs.verticalAlign="bottom";
ifrscrolling=this.height?"auto":"vertical";
}
this.iframe.style.width=this.inheritWidth?this._oldWidth:"100%";
if(this.height){
this.iframe.style.height=this.height;
}else{
var _11a=this._oldHeight;
if(this._hasCollapseableMargin(this.domNode,"top")){
_11a+=this._firstChildContributingMargin;
}
if(this._hasCollapseableMargin(this.domNode,"bottom")){
_11a+=this._lastChildContributingMargin;
}
this.iframe.height=_11a;
}
var _11b=this.srcNodeRef;
dojo.place(this.iframe,this.srcNodeRef,"before");
if(!this.height){
var c=dojo.query(">",_11b);
var _11d=c[0];
var _11e=c.pop();
if(_11d){
_11d.style.marginTop=this._firstChildContributingMargin+"px";
}
if(_11e){
_11e.style.marginBottom=this._lastChildContributingMargin+"px";
}
}
var _11f=false;
var _120=this.iframe.contentDocument;
_120.open();
_120.write(this._getIframeDocTxt());
_120.close();
var _121=dojo.hitch(this,function(){
if(!_11f){
_11f=true;
}else{
return;
}
if(!this.editNode){
if(this.iframe.contentWindow){
this.window=this.iframe.contentWindow;
this.document=this.iframe.contentWindow.document;
}else{
if(this.iframe.contentDocument){
this.window=this.iframe.contentDocument.window;
this.document=this.iframe.contentDocument;
}
}
dojo._destroyElement(_11b);
this.document.body.innerHTML=html;
this.document.designMode="on";
try{
var _122=(new dojo._Url(dojo.doc.location)).host;
if(dojo.doc.domain!=_122){
this.document.domain=dojo.doc.domain;
}
}
catch(e){
}
this.onLoad();
}else{
dojo._destroyElement(_11b);
this.editNode.innerHTML=html;
this.onDisplayChanged();
}
this._preDomFilterContent(this.editNode);
});
if(this.editNode){
_121();
}else{
if(dojo.isMoz){
setTimeout(_121,250);
}else{
_121();
}
}
},_applyEditingAreaStyleSheets:function(){
var _123=[];
if(this.styleSheets){
_123=this.styleSheets.split(";");
this.styleSheets="";
}
_123=_123.concat(this.editingAreaStyleSheets);
this.editingAreaStyleSheets=[];
var text="",i=0,url;
while(url=_123[i++]){
var _127=(new dojo._Url(dojo.global.location,url)).toString();
this.editingAreaStyleSheets.push(_127);
text+="<link rel=\"stylesheet\" type=\"text/css\" href=\""+_127+"\"/>";
}
return text;
},addStyleSheet:function(uri){
var url=uri.toString();
if(dojo.indexOf(this.editingAreaStyleSheets,url)>-1){
console.debug("dijit._editor.RichText.addStyleSheet: Style sheet "+url+" is already applied to the editing area!");
return;
}
if(url.charAt(0)=="."||(url.charAt(0)!="/"&&!uri.host)){
url=(new dojo._Url(dojo.global.location,url)).toString();
}
this.editingAreaStyleSheets.push(url);
if(this.document.createStyleSheet){
this.document.createStyleSheet(url);
}else{
var head=this.document.getElementsByTagName("head")[0];
var _12b=this.document.createElement("link");
with(_12b){
rel="stylesheet";
type="text/css";
href=url;
}
head.appendChild(_12b);
}
},removeStyleSheet:function(uri){
var url=uri.toString();
if(url.charAt(0)=="."||(url.charAt(0)!="/"&&!uri.host)){
url=(new dojo._Url(dojo.global.location,url)).toString();
}
var _12e=dojo.indexOf(this.editingAreaStyleSheets,url);
if(_12e==-1){
console.debug("dijit._editor.RichText.removeStyleSheet: Style sheet "+url+" is not applied to the editing area so it can not be removed!");
return;
}
delete this.editingAreaStyleSheets[_12e];
var link,i=0,_131=this.document.getElementsByTagName("link");
while(link=_131[i++]){
if(link.href==url){
if(dojo.isIE){
link.href="";
}
dojo.html.removeNode(link);
break;
}
}
},enabled:true,enable:function(){
if(dojo.isIE||this._safariIsLeopard()||dojo.isOpera){
this.editNode.contentEditable=true;
}else{
this.document.execCommand("contentReadOnly",false,false);
}
this.enabled=true;
},disable:function(){
if(dojo.isIE||this._safariIsLeopard()||dojo.isOpera){
this.editNode.contentEditable=false;
}else{
this.document.execCommand("contentReadOnly",false,true);
}
this.enabled=false;
},_isResized:function(){
return false;
},onLoad:function(e){
this.isLoaded=true;
if(this.iframe&&!dojo.isIE){
this.editNode=this.document.body;
if(!this.height){
this.connect(this,"onDisplayChanged","_updateHeight");
}
try{
this.document.execCommand("styleWithCSS",false,false);
}
catch(e2){
}
if(dojo.isSafari){
this.connect(this.editNode,"onblur","onBlur");
this.connect(this.editNode,"onfocus","onFocus");
this.connect(this.editNode,"onclick","onFocus");
this.interval=setInterval(dojo.hitch(this,"onDisplayChanged"),750);
}else{
if(dojo.isMoz||dojo.isOpera){
var doc=this.document;
var _134=this.events.concat(this.captureEvents);
dojo.forEach(_134,function(e){
var l=dojo.connect(this.document,e.toLowerCase(),dojo.hitch(this,e));
if(e=="onBlur"){
}
},this);
}
}
}else{
if(dojo.isIE){
if(!this.height){
this.connect(this,"onDisplayChanged","_updateHeight");
}
this.editNode.style.zoom=1;
}
}
if(this.focusOnLoad){
this.focus();
}
this.onDisplayChanged(e);
if(this.onLoadDeferred){
this.onLoadDeferred.callback(true);
}
if(this.blockNodeForEnter=="BR"){
if(dojo.isIE){
this._fixNewLineBehaviorForIE();
}else{
try{
this.document.execCommand("insertBrOnReturn",false,true);
}
catch(e){
}
}
}
},onKeyDown:function(e){
if((dojo.isIE)&&(e.keyCode==dojo.keys.TAB)){
e.preventDefault();
e.stopPropagation();
this.execCommand((e.shiftKey?"outdent":"indent"));
}else{
if(dojo.isIE){
if((65<=e.keyCode&&e.keyCode<=90)||(e.keyCode>=37&&e.keyCode<=40)){
e.charCode=e.keyCode;
this.onKeyPress(e);
}
}
}
},onKeyUp:function(e){
return;
},KEY_CTRL:1,KEY_SHIFT:2,onKeyPress:function(e){
var _13a=e.ctrlKey?this.KEY_CTRL:0|e.shiftKey?this.KEY_SHIFT:0;
var key=e.keyChar;
if(this._keyHandlers[key]){
var _13c=this._keyHandlers[key],i=0,h;
while(h=_13c[i++]){
if(_13a==h.modifiers){
if(!h.handler.apply(this,arguments)){
e.preventDefault();
}
break;
}
}
}
setTimeout(dojo.hitch(this,function(){
this.onKeyPressed(e);
}),1);
},addKeyHandler:function(key,_140,_141){
if(!dojo.isArray(this._keyHandlers[key])){
this._keyHandlers[key]=[];
}
this._keyHandlers[key].push({modifiers:_140||0,handler:_141});
},onKeyPressed:function(e){
if(this._checkListLater){
if(dojo.withGlobal(this.window,"isCollapsed",dijit._editor.selection)){
if(!dojo.withGlobal(this.window,"hasAncestorElement",dijit._editor.selection,["LI"])){
dijit._editor.RichText.prototype.execCommand.apply(this,["formatblock",this.blockNodeForEnter]);
var _143=dojo.withGlobal(this.window,"getAncestorElement",dijit._editor.selection,[this.blockNodeForEnter]);
if(_143){
_143.innerHTML=this.bogusHtmlContent;
if(dojo.isIE){
var r=this.document.selection.createRange();
r.move("character",-1);
r.select();
}
}else{
alert("onKeyPressed: Can not find the new block node");
}
}
}
this._checkListLater=false;
}else{
if(this._pressedEnterInBlock){
this.removeTrailingBr(this._pressedEnterInBlock.previousSibling);
delete this._pressedEnterInBlock;
}
}
this.onDisplayChanged();
},blockNodeForEnter:"BR",bogusHtmlContent:"&nbsp;",handleEnterKey:function(e){
if(!this.blockNodeForEnter){
return true;
}
if(e.shiftKey||this.blockNodeForEnter=="BR"){
var _146=dojo.withGlobal(this.window,"getParentElement",dijit._editor.selection);
var _147=dojo.html.range.getAncestor(_146,/^(?:H1|H2|H3|H4|H5|H6|LI)$/);
if(_147){
if(_147.tagName=="LI"){
return true;
}
var _148=dojo.html.range.getSelection(this.window);
var _149=_148.getRangeAt(0);
if(!_149.collapsed){
_149.deleteContents();
}
if(dojo.html.range.atBeginningOfContainer(_147,_149.startContainer,_149.startOffset)){
dojo.place(this.document.createElement("br"),_147,"before");
}else{
if(dojo.html.range.atEndOfContainer(_147,_149.startContainer,_149.startOffset)){
dojo.place(this.document.createElement("br"),_147,"after");
var _14a=dojo.html.range.create();
_14a.setStartAfter(_147);
_148.removeAllRanges();
_148.addRange(_14a);
}else{
return true;
}
}
}else{
dijit._editor.RichText.prototype.execCommand.call(this,"inserthtml","<br>");
}
return false;
}
var _14b=true;
var _148=dojo.html.range.getSelection(this.window);
var _149=_148.getRangeAt(0);
if(!_149.collapsed){
_149.deleteContents();
}
var _14c=dojo.html.range.getBlockAncestor(_149.endContainer,null,this.editNode);
if(_14c.blockNode&&_14c.blockNode.tagName=="LI"){
this._checkListLater=true;
return true;
}else{
this._checkListLater=false;
}
if(!_14c.blockNode){
this.document.execCommand("formatblock",false,this.blockNodeForEnter);
_14c={blockNode:dojo.withGlobal(this.window,"getAncestorElement",dijit._editor.selection,[this.blockNodeForEnter]),blockContainer:this.editNode};
if(_14c.blockNode){
if(dojo.html.textContent(_14c.blockNode).replace(/^\s+|\s+$/g,"").length==0){
this.removeTrailingBr(_14c.blockNode);
return false;
}
}else{
_14c.blockNode=this.editNode;
}
_148=dojo.html.range.getSelection(this.window);
_149=_148.getRangeAt(0);
}
var _14d=this.document.createElement(this.blockNodeForEnter);
_14d.innerHTML=this.bogusHtmlContent;
this.removeTrailingBr(_14c.blockNode);
if(dojo.html.range.atEndOfContainer(_14c.blockNode,_149.endContainer,_149.endOffset)){
if(_14c.blockNode===_14c.blockContainer){
_14c.blockNode.appendChild(_14d);
}else{
dojo.html.insertAfter(_14d,_14c.blockNode);
}
_14b=false;
var _14a=dojo.html.range.create();
_14a.setStart(_14d,0);
_148.removeAllRanges();
_148.addRange(_14a);
if(this.height){
_14d.scrollIntoView(false);
}
}else{
if(dojo.html.range.atBeginningOfContainer(_14c.blockNode,_149.startContainer,_149.startOffset)){
if(_14c.blockNode===_14c.blockContainer){
dojo.html.prependChild(_14d,_14c.blockNode);
}else{
dojo.html.insertBefore(_14d,_14c.blockNode);
}
if(this.height){
_14d.scrollIntoView(false);
}
_14b=false;
}else{
if(dojo.isMoz){
this._pressedEnterInBlock=_14c.blockNode;
}
}
}
return _14b;
},removeTrailingBr:function(_14e){
if(/P|DIV|LI/i.test(_14e.tagName)){
var para=_14e;
}else{
var para=dijit._editor.selection.getParentOfType(_14e,["P","DIV","LI"]);
}
if(!para){
return;
}
if(para.lastChild){
if(para.childNodes.length>1&&para.lastChild.nodeType==3&&/^[\s\xAD]*$/.test(para.lastChild.nodeValue)){
dojo.html.destroyNode(para.lastChild);
}
if(para.lastChild&&para.lastChild.tagName=="BR"){
dojo.html.destroyNode(para.lastChild);
}
}
if(para.childNodes.length==0){
para.innerHTML=this.bogusHtmlContent;
}
},onClick:function(e){
this.onDisplayChanged(e);
},onBlur:function(e){
},_initialFocus:true,onFocus:function(e){
if((dojo.isMoz)&&(this._initialFocus)){
this._initialFocus=false;
if(this.editNode.innerHTML.replace(/^\s+|\s+$/g,"")=="&nbsp;"){
this.placeCursorAtStart();
}
}
},blur:function(){
if(this.iframe){
this.window.blur();
}else{
if(this.editNode){
this.editNode.blur();
}
}
},focus:function(){
if(this.iframe&&!dojo.isIE){
this.window.focus();
}else{
if(this.editNode&&this.editNode.focus){
this.editNode.focus();
}else{
console.debug("Have no idea how to focus into the editor!");
}
}
},onDisplayChanged:function(e){
},_normalizeCommand:function(cmd){
var _155=cmd.toLowerCase();
if(_155=="formatblock"){
if(dojo.isSafari){
_155="heading";
}
}else{
if(_155=="hilitecolor"&&!dojo.isMoz){
_155="backcolor";
}
}
return _155;
},queryCommandAvailable:function(_156){
var ie=1;
var _158=1<<1;
var _159=1<<2;
var _15a=1<<3;
var _15b=1<<4;
var _15c=this._safariIsLeopard();
function isSupportedBy(_15d){
return {ie:Boolean(_15d&ie),mozilla:Boolean(_15d&_158),safari:Boolean(_15d&_159),safari420:Boolean(_15d&_15b),opera:Boolean(_15d&_15a)};
};
var _15e=null;
switch(_156.toLowerCase()){
case "bold":
case "italic":
case "underline":
case "subscript":
case "superscript":
case "fontname":
case "fontsize":
case "forecolor":
case "hilitecolor":
case "justifycenter":
case "justifyfull":
case "justifyleft":
case "justifyright":
case "delete":
case "selectall":
_15e=isSupportedBy(_158|ie|_159|_15a);
break;
case "createlink":
case "unlink":
case "removeformat":
case "inserthorizontalrule":
case "insertimage":
case "insertorderedlist":
case "insertunorderedlist":
case "indent":
case "outdent":
case "formatblock":
case "inserthtml":
case "undo":
case "redo":
case "strikethrough":
_15e=isSupportedBy(_158|ie|_15a|_15b);
break;
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
_15e=isSupportedBy(ie);
break;
case "cut":
case "copy":
case "paste":
_15e=isSupportedBy(ie|_158|_15b);
break;
case "inserttable":
_15e=isSupportedBy(_158|ie);
break;
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
_15e=isSupportedBy(ie|_158);
break;
default:
return false;
}
return (dojo.isIE&&_15e.ie)||(dojo.isMoz&&_15e.mozilla)||(dojo.isSafari&&_15e.safari)||(_15c&&_15e.safari420)||(dojo.isOpera&&_15e.opera);
},execCommand:function(_15f,_160){
var _161;
this.focus();
_15f=this._normalizeCommand(_15f);
if(_160!=undefined){
if(_15f=="heading"){
throw new Error("unimplemented");
}else{
if((_15f=="formatblock")&&dojo.isIE){
_160="<"+_160+">";
}
}
}
if(_15f=="inserthtml"){
_160=this._preFilterContent(_160);
if(dojo.isIE){
var _162=this.document.selection.createRange();
_162.pasteHTML(_160);
_162.select();
return true;
}else{
if(dojo.isMoz&&!_160.length){
dojo.withGlobal(this.window,"remove",dijit._editor.selection);
return true;
}else{
return this.document.execCommand(_15f,false,_160);
}
}
}else{
if((_15f=="unlink")&&(this.queryCommandEnabled("unlink"))&&(dojo.isMoz||dojo.isSafari)){
var _163=this.window.getSelection();
var a=dojo.withGlobal(this.window,"getAncestorElement",dijit._editor.selection,["a"]);
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[a]);
return this.document.execCommand("unlink",false,null);
}else{
if((_15f=="hilitecolor")&&(dojo.isMoz)){
_161=this.document.execCommand(_15f,false,_160);
}else{
if((dojo.isIE)&&((_15f=="backcolor")||(_15f=="forecolor"))){
_160=arguments.length>1?_160:null;
_161=this.document.execCommand(_15f,false,_160);
}else{
_160=arguments.length>1?_160:null;
if(_160||_15f!="createlink"){
_161=this.document.execCommand(_15f,false,_160);
}
}
}
}
}
this.onDisplayChanged();
return _161;
},queryCommandEnabled:function(_165){
_165=this._normalizeCommand(_165);
if(dojo.isMoz||dojo.isSafari){
if(_165=="unlink"){
return dojo.withGlobal(this.window,"hasAncestorElement",dijit._editor.selection,["a"]);
}else{
if(_165=="inserttable"){
return true;
}
}
}
var elem=(dojo.isIE)?this.document.selection.createRange():this.document;
return elem.queryCommandEnabled(_165);
},queryCommandState:function(_167){
_167=this._normalizeCommand(_167);
return this.document.queryCommandState(_167);
},queryCommandValue:function(_168){
_168=this._normalizeCommand(_168);
if(dojo.isIE&&_168=="formatblock"){
return this._local2NativeFormatNames[this.document.queryCommandValue(_168)]||this.document.queryCommandValue(_168);
}
return this.document.queryCommandValue(_168);
},placeCursorAtStart:function(){
this.focus();
var _169=false;
if(dojo.isMoz){
var _16a=this.editNode.firstChild;
while(_16a){
if(_16a.nodeType==3){
if(_16a.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_169=true;
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[_16a]);
break;
}
}else{
if(_16a.nodeType==1){
_169=true;
dojo.withGlobal(this.window,"selectElementChildren",dijit._editor.selection,[_16a]);
break;
}
}
_16a=_16a.nextSibling;
}
}else{
_169=true;
dojo.withGlobal(this.window,"selectElementChildren",dijit._editor.selection,[this.editNode]);
}
if(_169){
dojo.withGlobal(this.window,"collapse",dijit._editor.selection,[true]);
}
},placeCursorAtEnd:function(){
this.focus();
var _16b=false;
if(dojo.isMoz){
var last=this.editNode.lastChild;
while(last){
if(last.nodeType==3){
if(last.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_16b=true;
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[last]);
break;
}
}else{
if(last.nodeType==1){
_16b=true;
if(last.lastChild){
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[last.lastChild]);
}else{
dojo.withGlobal(this.window,"selectElement",dijit._editor.selection,[last]);
}
break;
}
}
last=last.previousSibling;
}
}else{
dojo.withGlobal(this.window,"selectElementChildren",dijit._editor.selection,[this.editNode]);
}
if(_16b){
dojo.withGlobal(this.window,"collapse",dijit._editor.selection,[false]);
}
},getValue:function(_16d){
if(this.isClosed&&this.textarea){
return this.textarea.value;
}else{
return this._postFilterContent(null,_16d);
}
},setValue:function(html){
if(this.isClosed&&this.textarea){
this.textarea.value=html;
}else{
html=this._preFilterContent(html);
if(this.isClosed){
this.domNode.innerHTML=html;
this._preDomFilterContent(this.domNode);
}else{
this.editNode.innerHTML=html;
this._preDomFilterContent(this.editNode);
}
}
},replaceValue:function(html){
if(this.isClosed){
this.setValue(html);
}else{
if(this.window&&this.window.getSelection&&!dojo.isMoz){
this.setValue(html);
}else{
if(this.window&&this.window.getSelection){
html=this._preFilterContent(html);
this.execCommand("selectall");
if(dojo.isMoz&&!html){
html="&nbsp;";
}
this.execCommand("inserthtml",html);
this._preDomFilterContent(this.editNode);
}else{
if(this.document&&this.document.selection){
this.setValue(html);
}
}
}
}
},_preFilterContent:function(html){
var ec=html;
dojo.forEach(this.contentPreFilters,function(ef){
if(ef){
ec=ef(ec);
}
});
return ec;
},_preDomFilterContent:function(dom){
dom=dom||this.editNode;
dojo.forEach(this.contentDomPreFilters,function(ef){
if(ef&&dojo.isFunction(ef)){
ef(dom);
}
},this);
},_postFilterContent:function(dom,_176){
dom=dom||this.editNode;
if(this.contentDomPostFilters.length){
if(_176&&dom["cloneNode"]){
dom=dom.cloneNode(true);
}
dojo.forEach(this.contentDomPostFilters,function(ef){
dom=ef(dom);
});
}
var ec=this.getNodeChildrenHtml(dom);
if(ec.replace(/^\s+|\s+$/g,"")=="&nbsp;"){
ec="";
}
dojo.forEach(this.contentPostFilters,function(ef){
ec=ef(ec);
});
return ec;
},_lastHeight:0,_updateHeight:function(){
if(!this.isLoaded){
return;
}
if(this.height){
return;
}
if(dojo.isSafari&&(!this._safariIsLeopard())){
if(!this.editorObject){
return;
}
try{
this.editorObject.style.height=(this.editNode.offsetHeight+10)+"px";
}
catch(e){
try{
this.editorObject.style.height="500px";
}
catch(e2){
}
}
return;
}
var _17a=dojo.marginBox(this.editNode).h;
if(dojo.isOpera){
_17a=this.editNode.scrollHeight;
}
if(!_17a){
_17a=dojo.marginBox(this.document.body).h;
}
if(_17a==0){
console.debug("Can not figure out the height of the editing area!");
return;
}
this._lastHeight=_17a;
dojo.marginBox(this.editorObject,{h:this._lastHeight});
},_saveContent:function(e){
var _17c=dojo.byId("dijit._editor.RichText.savedContent");
_17c.value+=this._SEPARATOR+this.saveName+":"+this.getValue();
},escapeXml:function(str,_17e){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_17e){
str=str.replace(/'/gm,"&#39;");
}
return str;
},getNodeHtml:function(node){
switch(node.nodeType){
case 1:
var _180="<"+node.tagName.toLowerCase();
if(dojo.isMoz){
if(node.getAttribute("type")=="_moz"){
node.removeAttribute("type");
}
if(node.getAttribute("_moz_dirty")!=undefined){
node.removeAttribute("_moz_dirty");
}
}
var _181=[];
if(dojo.isIE){
var s=node.outerHTML;
s=s.substr(0,s.indexOf(">"));
s=s.replace(/(?:['"])[^"']*\1/g,"");
var reg=/([^\s=]+)=/g;
var m,key;
while((m=reg.exec(s))!=undefined){
key=m[1];
if(key.substr(0,3)!="_dj"){
if(key=="src"||key=="href"){
if(node.getAttribute("_djrealurl")){
_181.push([key,node.getAttribute("_djrealurl")]);
continue;
}
}
if(key=="class"){
_181.push([key,node.className]);
}else{
_181.push([key,node.getAttribute(key)]);
}
}
}
}else{
var attr,i=0,_188=node.attributes;
while(attr=_188[i++]){
if(attr.name.substr(0,3)!="_dj"){
var v=attr.value;
if(attr.name=="src"||attr.name=="href"){
if(node.getAttribute("_djrealurl")){
v=node.getAttribute("_djrealurl");
}
}
_181.push([attr.name,v]);
}
}
}
_181.sort(function(a,b){
return a[0]<b[0]?-1:(a[0]==b[0]?0:1);
});
i=0;
while(attr=_181[i++]){
_180+=" "+attr[0]+"=\""+attr[1]+"\"";
}
if(node.childNodes.length){
_180+=">"+this.getNodeChildrenHtml(node)+"</"+node.tagName.toLowerCase()+">";
}else{
_180+=" />";
}
break;
case 3:
var _180=this.escapeXml(node.nodeValue,true);
break;
case 8:
var _180="<!--"+this.escapeXml(node.nodeValue,true)+"-->";
break;
default:
var _180="Element not recognized - Type: "+node.nodeType+" Name: "+node.nodeName;
}
return _180;
},getNodeChildrenHtml:function(dom){
var out="";
if(!dom){
return out;
}
var _18e=dom["childNodes"]||dom;
var i=0;
var node;
while(node=_18e[i++]){
out+=this.getNodeHtml(node);
}
return out;
},close:function(save,_192){
if(this.isClosed){
return false;
}
if(!arguments.length){
save=true;
}
this._content=this.getValue();
var _193=(this.savedContent!=this._content);
if(this.interval){
clearInterval(this.interval);
}
if(this.textarea){
with(this.textarea.style){
position="";
left=top="";
if(dojo.isIE){
overflow=this.__overflow;
this.__overflow=null;
}
}
if(save){
this.textarea.value=this._content;
}else{
this.textarea.value=this.savedContent;
}
if(this.domNode.parentNode){
this.domNode.parentNode.removeNode(this.domNode);
}
this.domNode=this.textarea;
}else{
if(save){
if(dojo.isMoz){
var nc=dojo.doc.createElement("span");
this.domNode.appendChild(nc);
nc.innerHTML=this.editNode.innerHTML;
}else{
this.domNode.innerHTML=this._content;
}
}else{
this.domNode.innerHTML=this.savedContent;
}
}
dojo.removeClass(this.domNode,"RichTextEditable");
this.isClosed=true;
this.isLoaded=false;
delete this.editNode;
if(this.window&&this.window._frameElement){
this.window._frameElement=null;
}
this.window=null;
this.document=null;
this.editingArea=null;
this.editorObject=null;
return _193;
},destroyRendering:function(){
},destroy:function(){
this.destroyRendering();
if(!this.isClosed){
this.close(false);
}
dijit._editor.RichText.superclass.destroy.call(this);
},_fixContentForMoz:function(html){
html=html.replace(/<(\/)?strong([ \>])/gi,"<$1b$2");
html=html.replace(/<(\/)?em([ \>])/gi,"<$1i$2");
return html;
},_srcInImgRegex:/(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi,_hrefInARegex:/(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi,_preFixUrlAttributes:function(html){
html=html.replace(this._hrefInARegex,"$1$4$2$3$5$2 _djrealurl=$2$3$5$2");
html=html.replace(this._srcInImgRegex,"$1$4$2$3$5$2 _djrealurl=$2$3$5$2");
return html;
},regularPsToSingleLinePs:function(_197,_198){
function wrapLinesInPs(el){
function wrapNodes(_19a){
var newP=_19a[0].ownerDocument.createElement("p");
_19a[0].parentNode.insertBefore(newP,_19a[0]);
for(var i=0;i<_19a.length;i++){
newP.appendChild(_19a[i]);
}
};
var _19d=0;
var _19e=[];
var _19f;
while(_19d<el.childNodes.length){
_19f=el.childNodes[_19d];
if((_19f.nodeName!="BR")&&(_19f.nodeType==1)&&(dojo.style(_19f,"display")!="block")){
_19e.push(_19f);
}else{
var _1a0=_19f.nextSibling;
if(_19e.length){
wrapNodes(_19e);
_19d=(_19d+1)-_19e.length;
if(_19f.nodeName=="BR"){
dojo._destroyElement(_19f);
}
}
_19e=[];
}
_19d++;
}
if(_19e.length){
wrapNodes(_19e);
}
};
function splitP(el){
var _1a2=null;
var _1a3=[];
var _1a4=el.childNodes.length-1;
for(var i=_1a4;i>=0;i--){
_1a2=el.childNodes[i];
if(_1a2.nodeName=="BR"){
var newP=_1a2.ownerDocument.createElement("p");
dojo.place(newP,el,"after");
if(_1a3.length==0&&i!=_1a4){
newP.innerHTML="&nbsp;";
}
dojo.forEach(_1a3,function(node){
newP.appendChild(node);
});
dojo._destroyElement(_1a2);
_1a3=[];
}else{
_1a3.unshift(_1a2);
}
}
};
var _1a8=[];
var ps=_197.getElementsByTagName("p");
dojo.forEach(ps,function(p){
_1a8.push(p);
});
dojo.forEach(_1a8,function(p){
if((p.previousSibling)&&(p.previousSibling.nodeName=="P"||dojo.style(p.previousSibling,"display")!="block")){
var newP=p.parentNode.insertBefore(this.document.createElement("p"),p);
newP.innerHTML=_198?"":"&nbsp;";
}
splitP(p);
},this);
wrapLinesInPs(_197);
return _197;
},singleLinePsToRegularPs:function(_1ad){
function getParagraphParents(node){
var ps=node.getElementsByTagName("p");
var _1b0=[];
for(var i=0;i<ps.length;i++){
var p=ps[i];
var _1b3=false;
for(var k=0;k<_1b0.length;k++){
if(_1b0[k]===p.parentNode){
_1b3=true;
break;
}
}
if(!_1b3){
_1b0.push(p.parentNode);
}
}
return _1b0;
};
function isParagraphDelimiter(node){
if(node.nodeType!=1||node.tagName!="P"){
return (dojo.style(node,"display")=="block");
}else{
if(!node.childNodes.length||node.innerHTML=="&nbsp;"){
return true;
}
}
};
var _1b6=getParagraphParents(_1ad);
for(var i=0;i<_1b6.length;i++){
var _1b8=_1b6[i];
var _1b9=null;
var node=_1b8.firstChild;
var _1bb=null;
while(node){
if(node.nodeType!="1"||node.tagName!="P"){
_1b9=null;
}else{
if(isParagraphDelimiter(node)){
_1bb=node;
_1b9=null;
}else{
if(_1b9==null){
_1b9=node;
}else{
if((!_1b9.lastChild||_1b9.lastChild.nodeName!="BR")&&(node.firstChild)&&(node.firstChild.nodeName!="BR")){
_1b9.appendChild(this.document.createElement("br"));
}
while(node.firstChild){
_1b9.appendChild(node.firstChild);
}
_1bb=node;
}
}
}
node=node.nextSibling;
if(_1bb){
dojo._destroyElement(_1bb);
_1bb=null;
}
}
}
return _1ad;
},_fixNewLineBehaviorForIE:function(){
if(typeof this.document.__INSERTED_EDITIOR_NEWLINE_CSS=="undefined"){
var _1bc="p{margin:0;}";
this.document.__INSERTED_EDITIOR_NEWLINE_CSS=true;
}
}});
}
if(!dojo._hasResource["dijit.Toolbar"]){
dojo._hasResource["dijit.Toolbar"]=true;
dojo.provide("dijit.Toolbar");
dojo.declare("dijit.Toolbar",[dijit._Widget,dijit._Templated,dijit._Container],{templateString:"<div class=\"dijit dijitToolbar\" waiRole=\"toolbar\" tabIndex=\"-1\" dojoAttachPoint=\"containerNode\">"+"</div>"});
dojo.declare("dijit.ToolbarSeparator",[dijit._Widget,dijit._Templated],{templateString:"<div class=\"dijitToolbarSeparator dijitInline\"></div>",postCreate:function(){
dojo.setSelectable(this.domNode,false);
}});
}
if(!dojo._hasResource["dijit.form.Button"]){
dojo._hasResource["dijit.form.Button"]=true;
dojo.provide("dijit.form.Button");
dojo.declare("dijit.form.Button",dijit.form._FormWidget,{label:"",iconClass:"",type:"button",baseClass:"dijitButton",templateString:"<div class=\"dijit dijitLeft dijitInline dijitButton\" baseClass=\"${baseClass}\"\n\tdojoAttachEvent=\"onclick:onClick;onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse\"\n\t><div class='dijitRight'\n\t><button class=\"dijitStretch dijitButtonNode dijitButtonContents\"\n\t\ttabIndex=\"${tabIndex}\" type=\"${type}\" id=\"${id}\" name=\"${name}\" alt=\"${alt}\"\n\t\t><div class=\"dijitInline ${iconClass}\"></div\n\t\t><span class=\"dijitButtonContents\" dojoAttachPoint=\"containerNode;focusNode\">${label}</span\n\t></button\n></div></div>\n",onClick:function(e){
},setLabel:function(_1be){
this.containerNode.innerHTML=this.label=_1be;
if(dojo.isMozilla){
var _1bf=dojo.getComputedStyle(this.domNode).display;
this.domNode.style.display="none";
var _1c0=this;
setTimeout(function(){
_1c0.domNode.style.display=_1bf;
},1);
}
}});
dojo.declare("dijit.form.DropDownButton",[dijit.form.Button,dijit._Container],{baseClass:"dijitDropDownButton",templateString:"<div class=\"dijit dijitLeft dijitInlineBox dijitDropDownButton\" baseClass=\"dijitDropDownButton\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;onclick:_onArrowClick; onkeypress:_onKey;\"\n\t><div class='dijitRight'>\n\t<button tabIndex=\"${tabIndex}\" class=\"dijitStretch dijitButtonNode\" type=\"${type}\" id=\"${id}\" name=\"${name}\" alt=\"${alt}\"\n\t\t><div class=\"dijitInline ${iconClass}\"></div\n\t\t><span class=\"dijitButtonContents\" \tdojoAttachPoint=\"containerNode;popupStateNode;focusNode\"\n\t\t waiRole=\"button\" waiState=\"haspopup-true;labelledby-${id}_label\" id=\"${id}_label\">${label}</span\n\t\t><span class='dijitA11yDownArrow'>&#9660;</span>\n\t</button>\n</div></div>\n",_fillContent:function(){
if(this.srcNodeRef){
var _1c1=dojo.query("*",this.srcNodeRef);
dijit.form.DropDownButton.superclass._fillContent.call(this,_1c1[0]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(!this.dropDown){
var node=dojo.query("[widgetId]",this.dropDownContainer)[0];
this.dropDown=dijit.util.manager.byNode(node);
}
dojo.body().appendChild(this.dropDown.domNode);
this.dropDown.domNode.style.display="none";
},_onArrowClick:function(e){
if(this.disabled){
return;
}
this._toggleDropDown();
},_onKey:function(e){
if(this.disabled){
return;
}
if(e.keyCode==dojo.keys.DOWN_ARROW){
if(!this.dropDown||this.dropDown.domNode.style.display=="none"){
dojo.stopEvent(e);
return this._toggleDropDown();
}
}
},_toggleDropDown:function(){
if(this.disabled){
return;
}
this.popupStateNode.focus();
var _1c5=this.dropDown;
if(!_1c5){
return false;
}
if(!_1c5.isShowingNow){
var _1c6=_1c5.domNode.style.width;
var self=this;
dijit.util.popup.open({popup:_1c5,around:this.domNode,onClose:function(){
_1c5.domNode.style.width=_1c6;
self.popupStateNode.removeAttribute("popupActive");
}});
if(this.domNode.offsetWidth>_1c5.domNode.offsetWidth){
dojo.marginBox(_1c5.domNode,{w:this.domNode.offsetWidth});
}
this.popupStateNode.setAttribute("popupActive","true");
this._opened=true;
}else{
dijit.util.popup.closeAll();
this._opened=false;
}
return false;
}});
dojo.declare("dijit.form.ComboButton",dijit.form.DropDownButton,{templateString:"<fieldset class='dijit dijitInline dijitLeft dijitComboButton'  baseClass='dijitComboButton'\n\tid=\"${id}\" name=\"${name}\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;\"\t\n>\n<table cellspacing='0' cellpadding='0'  waiRole=\"presentation\" >\n\t<tr>\n\t\t<td\tclass=\"dijitStretch dijitButtonContents dijitButtonNode\"\n\t\t\ttabIndex=\"${tabIndex}\"\n\t\t\tdojoAttachEvent=\"onklick:_onButtonClick\"\n\t\t\twaiRole=\"button\">\n\t\t\t<div class=\"dijitInline ${iconClass}\"></div>\n\t\t\t<span class=\"dijitButtonContents\" dojoAttachPoint=\"containerNode;focusNode\" id=\"${id}_label\">${label}</span>\n\t\t</td>\n\t\t<td class='dijitReset dijitRight dijitButtonNode dijitDownArrowButton'\n\t\t\tdojoAttachPoint=\"popupStateNode\"\n\t\t\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;onklick:_onArrowClick; onkeypress:_onKey;\"\n\t\t\tbaseClass=\"dijitComboButtonDownArrow\"\n\t\t\ttitle=\"${optionsTitle}\"\n\t\t\ttabIndex=\"${tabIndex}\"\n\t\t\twaiRole=\"button\" waiState=\"haspopup-true\"\n\t\t><div waiRole=\"presentation\">&#9660;</div>\n\t</td></tr>\n</table>\n</fieldset>\n",optionsTitle:"",baseClass:"dijitComboButton",_onButtonClick:function(e){
dojo.stopEvent(e);
if(this.disabled){
return;
}
this.focusNode.focus();
return this.onClick(e);
}});
dojo.declare("dijit.form.ToggleButton",dijit.form.Button,{baseClass:"dijitToggleButton",selected:false,onChange:function(_1c9){
},onClick:function(evt){
this.setSelected(!this.selected);
},setSelected:function(_1cb){
this.selected=_1cb;
this._setStateClass();
this.onChange(_1cb);
}});
}
if(!dojo._hasResource["dijit._editor._Plugin"]){
dojo._hasResource["dijit._editor._Plugin"]=true;
dojo.provide("dijit._editor._Plugin");
dojo.declare("dijit._editor._Plugin",null,function(args,node){
if(args){
dojo.mixin(this,args);
}
},{editor:null,iconClassPrefix:"dijitEditorIcon",button:null,queryCommand:null,command:"",commandArg:null,useDefaultCommand:true,buttonClass:dijit.form.Button,updateInterval:200,_initButton:function(){
if(this.command.length){
var _1ce=this.editor.commands[this.command];
var _1cf=this.iconClassPrefix+this.command.charAt(0).toUpperCase()+this.command.substr(1);
if(!this.button){
var _1d0={label:_1ce,iconClass:_1cf};
this.button=new this.buttonClass(_1d0);
}
}
},updateState:function(){
if(!this._lastUpdate){
this._lateUpdate=new Date();
}else{
if(((new Date())-this._lastUpdate)<this.updateInterval){
return;
}
}
var _e=this.editor;
var _c=this.command;
if(!_e){
return;
}
if(!_e.isLoaded){
return;
}
if(!_c.length){
return;
}
if(this.button){
try{
var _1d3=_e.queryCommandEnabled(_c);
this.button._setDisabled(!_1d3);
if(this.button.setSelected){
this.button.setSelected(_e.queryCommandState(_c));
}
}
catch(e){
console.debug(e);
}
}
this._lateUpdate=new Date();
},setEditor:function(_1d4){
this.editor=_1d4;
this._initButton();
if((this.command.length)&&(!this.editor.queryCommandAvailable(this.command))){
if(this.button){
this.button.domNode.style.display="none";
}
}
if(this.button&&this.useDefaultCommand){
dojo.connect(this.button,"onClick",dojo.hitch(this.editor,"execCommand",this.command,this.commandArg));
}
dojo.connect(this.editor,"onDisplayChanged",this,"updateState");
},setToolbar:function(_1d5){
if(this.button){
_1d5.addChild(this.button);
}
}});
}
if(!dojo._hasResource["dijit._editor.plugins.LinkDialog"]){
dojo._hasResource["dijit._editor.plugins.LinkDialog"]=true;
dojo.provide("dijit._editor.plugins.LinkDialog");
dojo.declare("dijit._editor.plugins.LinkDialog",[dijit._editor._Plugin,dijit._Widget],function(){
this._linkDialog=new dijit.TooltipDialog({title:"link url"});
this._linkDialog.containerNode.innerHTML=this.linkDialogTemplate;
dijit._Templated.prototype._attachTemplateNodes.call(this,this._linkDialog.containerNode);
this._linkDialog.startup();
dojo.connect(this,"_initButton",this,function(){
this.connect(this.button,"onClick","showEditor");
});
},{urlInput:null,buttonClass:dijit.form.ToggleButton,linkDialogTemplate:["<span>url: &nbsp;</span>","<input class='dijitComboBoxInput' type='text' dojoAttachPoint='urlInput'>","<br>","<input class='dijitButtonNode' type='button' dojoAttachEvent='onclick: setValue;' value='set'>","<input class='dijitButtonNode' type='button' dojoAttachEvent='onclick: hideEditor;' value='cancel'>"].join(""),useDefaultCommand:false,command:"createLink",_linkDialog:null,setValue:function(){
var val=this.urlInput.value;
this.hideEditor();
this.editor.execCommand(this.command,val);
},_savedSelection:null,hideEditor:function(){
this._linkDialog.hide();
if(dojo.isIE){
this.editor.focus();
var _1d7=this.editor.document.selection.createRange();
_1d7.moveToBookmark(this._savedSelection);
_1d7.select();
this._savedSelection=null;
}
},showEditor:function(){
if(!this.button.selected){
console.debug("selected");
this.editor.execCommand("unlink");
}else{
if(dojo.isIE){
var _1d8=this.editor.document.selection.createRange();
this._savedSelection=_1d8.getBookmark();
}
dojo.coords(this.button.domNode);
this._linkDialog.show(this.button.domNode);
this.urlInput.focus();
}
},updateState:function(){
if(!this._lastUpdate){
this._lastUpdate=new Date();
}else{
if(((new Date())-this._lastUpdate)<this.updateInterval){
return;
}
}
var _e=this.editor;
if(!_e){
return;
}
if(!_e.isLoaded){
return;
}
if(this.button){
try{
var _1da=_e.queryCommandEnabled("createlink");
if(this.button.setSelected){
var _1db=!!dojo.withGlobal(this.editor.window,"getAncestorElement",dijit._editor.selection,["a"]);
this.button.setSelected(_1db);
}
}
catch(e){
console.debug(e);
}
}
this._lastUpdate=new Date();
}});
}
if(!dojo._hasResource["dijit._editor.plugins.DefaultToolbar"]){
dojo._hasResource["dijit._editor.plugins.DefaultToolbar"]=true;
dojo.provide("dijit._editor.plugins.DefaultToolbar");
dojo.declare("dijit._editor.plugins.DefaultToolbar",null,function(){
var _p=dijit._editor._Plugin;
var _tb=dijit.form.ToggleButton;
this.plugins=[new _p({command:"cut"}),new _p({command:"copy"}),new _p({command:"paste"}),new _p({button:new dijit.ToolbarSeparator()}),new _p({buttonClass:_tb,command:"bold"}),new _p({buttonClass:_tb,command:"italic"}),new _p({buttonClass:_tb,command:"underline"}),new _p({buttonClass:_tb,command:"strikethrough"}),new _p({button:new dijit.ToolbarSeparator()}),new _p({command:"insertOrderedList"}),new _p({command:"insertUnorderedList"}),new _p({command:"indent"}),new _p({command:"outdent"}),new _p({button:new dijit.ToolbarSeparator()}),new dijit._editor.plugins.LinkDialog()];
},{plugins:[],setEditor:function(_1de){
dojo.forEach(this.plugins,function(i){
i.setEditor(_1de);
});
},setToolbar:function(_1e0){
dojo.forEach(this.plugins,function(i){
i.setToolbar(_1e0);
});
}});
}
if(!dojo._hasResource["dojo.i18n"]){
dojo._hasResource["dojo.i18n"]=true;
dojo.provide("dojo.i18n");
dojo.i18n.getLocalization=function(_1e2,_1e3,_1e4){
dojo.i18n._preloadLocalizations();
_1e4=dojo.i18n.normalizeLocale(_1e4);
var _1e5=_1e4.split("-");
var _1e6=[_1e2,"nls",_1e3].join(".");
var _1e7=dojo._loadedModules[_1e6];
if(_1e7){
var _1e8;
for(var i=_1e5.length;i>0;i--){
var loc=_1e5.slice(0,i).join("_");
if(_1e7[loc]){
_1e8=_1e7[loc];
break;
}
}
if(!_1e8){
_1e8=_1e7.ROOT;
}
if(_1e8){
var _1eb=function(){
};
_1eb.prototype=_1e8;
return new _1eb();
}
}
throw new Error("Bundle not found: "+_1e3+" in "+_1e2+" , locale="+_1e4);
};
dojo.i18n.normalizeLocale=function(_1ec){
var _1ed=_1ec?_1ec.toLowerCase():dojo.locale;
if(_1ed=="root"){
_1ed="ROOT";
}
return _1ed;
};
dojo.i18n._requireLocalization=function(_1ee,_1ef,_1f0,_1f1){
dojo.i18n._preloadLocalizations();
var _1f2=dojo.i18n.normalizeLocale(_1f0);
var _1f3=[_1ee,"nls",_1ef].join(".");
var _1f4="";
if(_1f1){
var _1f5=_1f1.split(",");
for(var i=0;i<_1f5.length;i++){
if(_1f2.indexOf(_1f5[i])==0){
if(_1f5[i].length>_1f4.length){
_1f4=_1f5[i];
}
}
}
if(!_1f4){
_1f4="ROOT";
}
}
var _1f7=_1f1?_1f4:_1f2;
var _1f8=dojo._loadedModules[_1f3];
var _1f9=null;
if(_1f8){
if(djConfig.localizationComplete&&_1f8._built){
return;
}
var _1fa=_1f7.replace(/-/g,"_");
var _1fb=_1f3+"."+_1fa;
_1f9=dojo._loadedModules[_1fb];
}
if(!_1f9){
_1f8=dojo["provide"](_1f3);
var syms=dojo._getModuleSymbols(_1ee);
var _1fd=syms.concat("nls").join("/");
var _1fe;
dojo.i18n._searchLocalePath(_1f7,_1f1,function(loc){
var _200=loc.replace(/-/g,"_");
var _201=_1f3+"."+_200;
var _202=false;
if(!dojo._loadedModules[_201]){
dojo["provide"](_201);
var _203=[_1fd];
if(loc!="ROOT"){
_203.push(loc);
}
_203.push(_1ef);
var _204=_203.join("/")+".js";
_202=dojo._loadPath(_204,null,function(hash){
var _206=function(){
};
_206.prototype=_1fe;
_1f8[_200]=new _206();
for(var j in hash){
_1f8[_200][j]=hash[j];
}
});
}else{
_202=true;
}
if(_202&&_1f8[_200]){
_1fe=_1f8[_200];
}else{
_1f8[_200]=_1fe;
}
if(_1f1){
return true;
}
});
}
if(_1f1&&_1f2!=_1f4){
_1f8[_1f2.replace(/-/g,"_")]=_1f8[_1f4.replace(/-/g,"_")];
}
};
(function(){
var _208=djConfig.extraLocale;
if(_208){
if(!_208 instanceof Array){
_208=[_208];
}
var req=dojo.i18n._requireLocalization;
dojo.i18n._requireLocalization=function(m,b,_20c,_20d){
req(m,b,_20c,_20d);
if(_20c){
return;
}
for(var i=0;i<_208.length;i++){
req(m,b,_208[i],_20d);
}
};
}
})();
dojo.i18n._searchLocalePath=function(_20f,down,_211){
_20f=dojo.i18n.normalizeLocale(_20f);
var _212=_20f.split("-");
var _213=[];
for(var i=_212.length;i>0;i--){
_213.push(_212.slice(0,i).join("-"));
}
_213.push(false);
if(down){
_213.reverse();
}
for(var j=_213.length-1;j>=0;j--){
var loc=_213[j]||"ROOT";
var stop=_211(loc);
if(stop){
break;
}
}
};
dojo.i18n._localesGenerated;
dojo.i18n.registerNlsPath=function(){
dojo.registerModulePath("nls","nls");
};
dojo.i18n._preloadLocalizations=function(){
if(dojo.i18n._localesGenerated){
dojo.i18n.registerNlsPath();
function preload(_218){
_218=dojo.i18n.normalizeLocale(_218);
dojo.i18n._searchLocalePath(_218,true,function(loc){
for(var i=0;i<dojo.i18n._localesGenerated.length;i++){
if(dojo.i18n._localesGenerated[i]==loc){
dojo["require"]("nls.dojo_"+loc);
return true;
}
}
return false;
});
};
preload();
var _21b=djConfig.extraLocale||[];
for(var i=0;i<_21b.length;i++){
preload(_21b[i]);
}
}
dojo.i18n._preloadLocalizations=function(){
};
};
}
if(!dojo._hasResource["dijit.Editor"]){
dojo._hasResource["dijit.Editor"]=true;
dojo.provide("dijit.Editor");
dojo.requireLocalization("dijit._editor","commands",null,"it,ROOT,de");
dojo.declare("dijit.Editor",[dijit._editor.RichText,dijit._Container],{plugins:["dijit._editor.plugins.DefaultToolbar"],preamble:function(){
this.plugins=[].concat(this.plugins);
},toolbar:null,postCreate:function(){
try{
dijit.Editor.superclass.postCreate.apply(this,arguments);
this.commands=dojo.i18n.getLocalization("dijit._editor","commands",this.lang);
if(!this.toolbar){
this.toolbar=new dijit.Toolbar();
dojo.place(this.toolbar.domNode,this.domNode,"before");
}
dojo.forEach(this.plugins,this.addPlugin,this);
}
catch(e){
console.debug(e);
}
},addPlugin:function(_21d,_21e){
if(dojo.isString(_21d)){
var pc=dojo.getObject(_21d);
_21d=new pc();
if(arguments.length>1){
this.plugins[_21e]=_21d;
}else{
this.plugins.push(_21d);
}
}
if(dojo.isFunction(_21d.setEditor)){
_21d.setEditor(this);
}
if(dojo.isFunction(_21d.setToolbar)){
_21d.setToolbar(this.toolbar);
}
if(_21d.button){
this.toolbar.addChild(_21d.button);
}
}});
}
if(!dojo._hasResource["dijit.util.scroll"]){
dojo._hasResource["dijit.util.scroll"]=true;
dojo.provide("dijit.util.scroll");
dijit.util.scroll.scrollIntoView=function(node){
if(dojo.isIE){
if(dojo.marginBox(node.parentNode).h<=node.parentNode.scrollHeight){
node.scrollIntoView(false);
}
}else{
if(dojo.isMozilla){
node.scrollIntoView(false);
}else{
var _221=node.parentNode;
var _222=_221.scrollTop+dojo.marginBox(_221).h;
var _223=node.offsetTop+dojo.marginBox(node).h;
if(_222<_223){
_221.scrollTop+=(_223-_222);
}else{
if(_221.scrollTop>node.offsetTop){
_221.scrollTop-=(_221.scrollTop-node.offsetTop);
}
}
}
}
};
}
if(!dojo._hasResource["dijit.Menu"]){
dojo._hasResource["dijit.Menu"]=true;
dojo.provide("dijit.Menu");
dojo.declare("dijit.Menu",[dijit._Widget,dijit._Templated,dijit._Container],{templateString:"<table class=\"dijit dijitMenu dijitReset dijitMenuTable\" waiRole=\"menu\" dojoAttachEvent=\"onkeypress:_onKeyPress\">"+"<tbody class=\"dijitReset\" dojoAttachPoint=\"containerNode\"></tbody>"+"</table>",targetNodeIds:[],contextMenuForWindow:false,parentMenu:null,submenuDelay:500,_contextMenuWithMouse:false,postCreate:function(){
if(this.contextMenuForWindow){
this.bindDomNode(dojo.body());
}else{
dojo.forEach(this.targetNodeIds,this.bindDomNode,this);
}
if(!this.isLeftToRight()){
this.containerNode.className+=" dojoRTL";
}
},startup:function(){
dojo.forEach(this.getChildren(),function(_224){
_224.startup();
});
},_moveToParentMenu:function(evt){
if(this.parentMenu){
if(evt._menuUpKeyProcessed){
dojo.stopEvent(e);
}else{
if(this._focusedItem){
this._blurFocusedItem();
}
this.parentMenu.closeSubmenu();
evt._menuUpKeyProcessed=true;
}
}
},_moveToChildMenu:function(evt){
if(this._focusedItem&&this._focusedItem.popup&&!this._focusedItem.disabled){
return this._activateCurrentItem(evt);
}
return false;
},_activateCurrentItem:function(evt){
if(this._focusedItem){
this._focusedItem._onClick();
if(this.currentSubmenu){
this.currentSubmenu._focusFirstItem();
}
return true;
}
return false;
},_onKeyPress:function(evt){
if(evt.ctrlKey||evt.altKey){
return;
}
var key=(evt.charCode==dojo.keys.SPACE?dojo.keys.SPACE:evt.keyCode);
switch(key){
case dojo.keys.DOWN_ARROW:
this._focusNeighborItem(1);
dojo.stopEvent(evt);
break;
case dojo.keys.UP_ARROW:
this._focusNeighborItem(-1);
break;
case dojo.keys.RIGHT_ARROW:
this._moveToChildMenu(evt);
dojo.stopEvent(evt);
break;
case dojo.keys.LEFT_ARROW:
this._moveToParentMenu(evt);
break;
case dojo.keys.ESCAPE:
if(this.parentMenu){
this._moveToParentMenu(evt);
}else{
dojo.stopEvent(evt);
dijit.util.popup.closeAll();
}
break;
case dojo.keys.TAB:
dojo.stopEvent(evt);
dijit.util.popup.closeAll();
break;
}
},_findValidItem:function(dir){
var _22b=this._focusedItem;
if(_22b){
_22b=dir>0?_22b.getNextSibling():_22b.getPreviousSibling();
}
var _22c=this.getChildren();
for(var i=0;i<_22c.length;++i){
if(!_22b){
_22b=_22c[(dir>0)?0:(_22c.length-1)];
}
if(_22b._onHover&&dojo.style(_22b.domNode,"display")!="none"){
return _22b;
}
_22b=dir>0?_22b.getNextSibling():_22b.getPreviousSibling();
}
},_focusNeighborItem:function(dir){
var item=this._findValidItem(dir);
this._focusItem(item);
},_focusFirstItem:function(){
if(this._focusedItem){
this._blurFocusedItem();
}
var item=this._findValidItem(1);
this._focusItem(item);
},_focusItem:function(item){
if(!item||item==this._focusedItem){
return;
}
if(this._focusedItem){
this._blurFocusedItem();
}
item._focus();
this._focusedItem=item;
},onItemHover:function(item){
this._focusItem(item);
if(this._focusedItem.popup&&!this._focusedItem.disabled&&!this.hover_timer){
this.hover_timer=setTimeout(dojo.hitch(this,"_openSubmenu"),this.submenuDelay);
}
},_blurFocusedItem:function(){
if(this._focusedItem){
dijit.util.popup.closeTo(this);
this._focusedItem._blur();
this._stopSubmenuTimer();
this._focusedItem=null;
}
},onItemUnhover:function(item){
},_stopSubmenuTimer:function(){
if(this.hover_timer){
clearTimeout(this.hover_timer);
this.hover_timer=null;
}
},_getTopMenu:function(){
for(var top=this;top.parentMenu;top=top.parentMenu){
}
return top;
},onItemClick:function(item){
if(item.disabled){
return false;
}
if(item.popup){
if(!this.is_open){
this._openSubmenu();
}
}else{
var _236=this._getTopMenu()._savedFocus;
if(_236){
dijit.util.focus.restore(_236);
}
dijit.util.popup.closeAll();
}
item.onClick();
},closeSubmenu:function(_237){
if(!this.currentSubmenu){
return;
}
dijit.util.popup.closeTo(this);
this._focusedItem._focus();
this.currentSubmenu=null;
},_iframeContentWindow:function(_238){
var win=dijit.util.window.getDocumentWindow(dijit.Menu._iframeContentDocument(_238))||dijit.Menu._iframeContentDocument(_238)["__parent__"]||(_238.name&&document.frames[_238.name])||null;
return win;
},_iframeContentDocument:function(_23a){
var doc=_23a.contentDocument||(_23a.contentWindow&&_23a.contentWindow.document)||(_23a.name&&document.frames[_23a.name]&&document.frames[_23a.name].document)||null;
return doc;
},bindDomNode:function(node){
node=dojo.byId(node);
var win=dijit.util.window.getDocumentWindow(node.ownerDocument);
if(node.tagName.toLowerCase()=="iframe"){
win=this._iframeContentWindow(node);
node=dojo.withGlobal(win,dojo.body);
}
var cn=(node==dojo.body()?dojo.doc:node);
node[this.id+"_connect"]=[dojo.connect(cn,"oncontextmenu",this,"_openMyself"),dojo.connect(cn,"onkeydown",this,"_contextKey"),dojo.connect(cn,"onmousedown",this,"_contextMouse")];
},unBindDomNode:function(_23f){
var node=dojo.byId(_23f);
dojo.forEach(node[this.id+"_connect"],dojo.disconnect);
},_contextKey:function(e){
this._contextMenuWithMouse=false;
if(e.keyCode==dojo.keys.F10){
dojo.stopEvent(e);
if(e.shiftKey&&e.type=="keydown"){
var _e={target:e.target,pageX:e.pageX,pageY:e.pageY};
_e.preventDefault=_e.stopPropagation=function(){
};
window.setTimeout(dojo.hitch(this,function(){
this._openMyself(_e);
}),1);
}
}
},_contextMouse:function(e){
this._contextMenuWithMouse=true;
},_openMyself:function(e){
dojo.stopEvent(e);
this._savedFocus=dijit.util.focus.save(this);
if(dojo.isSafari||this._contextMenuWithMouse){
dijit.util.popup.open({popup:this,x:e.pageX,y:e.pageY});
}else{
var _245=dojo.coords(e.target,true);
dijit.util.popup.open({popup:this,x:_245.x+10,y:_245.y+10});
}
},onOpen:function(e){
this._focusFirstItem();
this.isShowingNow=true;
},onClose:function(){
this._stopSubmenuTimer();
this.parentMenu=null;
this.isShowingNow=false;
this.currentSubmenu=null;
},_openSubmenu:function(){
this._stopSubmenuTimer();
var _247=this._focusedItem;
var _248=_247.popup;
if(_248.isShowingNow){
return;
}
_248.parentMenu=this;
dijit.util.popup.open({popup:_248,around:_247.arrowCell,orient:{"TR":"TL","TL":"TR"},submenu:true});
this.currentSubmenu=_248;
}});
dojo.declare("dijit.MenuItem",[dijit._Widget,dijit._Templated,dijit._Contained],{templateString:"<tr class=\"dijitReset dijitMenuItem\""+"dojoAttachEvent=\"onmouseover:_onHover;onmouseout:_onUnhover;onklick:_onClick;\">"+"<td class=\"dijitReset\"><div class=\"dijitMenuItemIcon ${iconClass}\"></div></td>"+"<td tabIndex=\"-1\" class=\"dijitReset dijitMenuItemLabel\" dojoAttachPoint=\"containerNode\" waiRole=\"menuitem\"></td>"+"<td class=\"dijitReset\" dojoAttachPoint=\"arrowCell\">"+"<span class=\"dijitA11yRightArrow\" style=\"display:none;\" dojoAttachPoint=\"arrow\">&#9658;</span>"+"</td>"+"</tr>",iconSrc:"",label:"",iconClass:"",disabled:false,postCreate:function(){
dojo.setSelectable(this.domNode,false);
this.setDisabled(this.disabled);
if(this.label){
this.containerNode.innerHTML=this.label;
}
},_onHover:function(){
this.getParent().onItemHover(this);
},_onUnhover:function(){
this.getParent().onItemUnhover(this);
},_onClick:function(_249){
this.getParent().onItemClick(this);
},onClick:function(){
},_focus:function(){
dojo.addClass(this.domNode,"dijitMenuItemHover");
try{
this.containerNode.focus();
}
catch(e){
}
},_blur:function(){
dojo.removeClass(this.domNode,"dijitMenuItemHover");
},setDisabled:function(_24a){
this.disabled=_24a;
dojo[_24a?"addClass":"removeClass"](this.domNode,"dijitMenuItemDisabled");
dijit.util.wai.setAttr(this.containerNode,"waiState","disabled",_24a?"true":"false");
}});
dojo.declare("dijit.PopupMenuItem",dijit.MenuItem,{_fillContent:function(){
if(this.srcNodeRef){
var _24b=dojo.query("*",this.srcNodeRef);
dijit.PopupMenuItem.superclass._fillContent.call(this,_24b[0]);
this.dropDownContainer=this.srcNodeRef;
}
},startup:function(){
if(!this.popup){
var node=dojo.query("[widgetId]",this.dropDownContainer)[0];
this.popup=dijit.util.manager.byNode(node);
}
dojo.body().appendChild(this.popup.domNode);
this.popup.domNode.style.display="none";
dojo.style(this.arrow,"display","");
dijit.util.wai.setAttr(this.containerNode,"waiState","haspopup","true");
}});
dojo.declare("dijit.MenuSeparator",[dijit._Widget,dijit._Templated,dijit._Contained],{templateString:"<tr class=\"dijitMenuSeparator\"><td colspan=3>"+"<div class=\"dijitMenuSeparatorTop\"></div>"+"<div class=\"dijitMenuSeparatorBottom\"></div>"+"</td></tr>",postCreate:function(){
dojo.setSelectable(this.domNode,false);
}});
}
if(!dojo._hasResource["dojo.regexp"]){
dojo._hasResource["dojo.regexp"]=true;
dojo.provide("dojo.regexp");
dojo.regexp.escapeString=function(str,_24e){
return str.replace(/([\.$?*!=:|{}\(\)\[\]\\\/^])/g,function(ch){
if(_24e&&_24e.indexOf(ch)!=-1){
return ch;
}
return "\\"+ch;
});
};
dojo.regexp.buildGroupRE=function(a,re,_252){
if(!(a instanceof Array)){
return re(a);
}
var b=[];
for(var i=0;i<a.length;i++){
b.push(re(a[i]));
}
return dojo.regexp.group(b.join("|"),_252);
};
dojo.regexp.group=function(_255,_256){
return "("+(_256?"?:":"")+_255+")";
};
}
if(!dojo._hasResource["dojo.number"]){
dojo._hasResource["dojo.number"]=true;
dojo.provide("dojo.number");
dojo.requireLocalization("dojo.cldr","number",null,"zh-cn,en,en-ca,zh-tw,en-us,it,ja-jp,ROOT,de-de,es-es,fr,pt,ko-kr,es,de");
dojo.number.format=function(_257,_258){
_258=dojo.mixin({},_258||{});
var _259=dojo.i18n.normalizeLocale(_258.locale);
var _25a=dojo.i18n.getLocalization("dojo.cldr","number",_259);
_258.customs=_25a;
var _25b=_258.pattern||_25a[(_258.type||"decimal")+"Format"];
if(isNaN(_257)){
return null;
}
return dojo.number._applyPattern(_257,_25b,_258);
};
dojo.number._numberPatternRE=/[#0,]*[#0](?:\.0*#*)?/;
dojo.number._applyPattern=function(_25c,_25d,_25e){
_25e=_25e||{};
var _25f=_25e.customs.group;
var _260=_25e.customs.decimal;
var _261=_25d.split(";");
var _262=_261[0];
_25d=_261[(_25c<0)?1:0]||("-"+_262);
if(_25d.indexOf("%")!=-1){
_25c*=100;
}else{
if(_25d.indexOf("\u2030")!=-1){
_25c*=1000;
}else{
if(_25d.indexOf("\xa4")!=-1){
_25f=_25e.customs.currencyGroup||_25f;
_260=_25e.customs.currencyDecimal||_260;
_25d=_25d.replace(/\u00a4{1,3}/,function(_263){
var prop=["symbol","currency","displayName"][_263.length-1];
return _25e[prop]||_25e.currency||"";
});
}else{
if(_25d.indexOf("E")!=-1){
throw new Error("exponential notation not supported");
}
}
}
}
var _265=dojo.number._numberPatternRE;
var _266=_262.match(_265);
if(!_266){
throw new Error("unable to find a number expression in pattern: "+_25d);
}
return _25d.replace(_265,dojo.number._formatAbsolute(_25c,_266[0],{decimal:_260,group:_25f,places:_25e.places}));
};
dojo.number.round=function(_267,_268,_269){
var _26a=String(_267).split(".");
var _26b=(_26a[1]&&_26a[1].length)||0;
if(_26b>_268){
var _26c=Math.pow(10,_268);
if(_269>0){
_26c*=10/_269;
_268++;
}
_267=Math.round(_267*_26c)/_26c;
_26a=String(_267).split(".");
_26b=(_26a[1]&&_26a[1].length)||0;
if(_26b>_268){
_26a[1]=_26a[1].substr(0,_268);
_267=Number(_26a.join("."));
}
}
return _267;
};
dojo.number._formatAbsolute=function(_26d,_26e,_26f){
_26f=_26f||{};
if(_26f.places===true){
_26f.places=0;
}
if(_26f.places===Infinity){
_26f.places=6;
}
var _270=_26e.split(".");
var _271=(_26f.places>=0)?_26f.places:(_270[1]&&_270[1].length)||0;
if(!(_26f.round<0)){
_26d=dojo.number.round(_26d,_271,_26f.round);
}
var _272=String(Math.abs(_26d)).split(".");
var _273=_272[1]||"";
if(_26f.places){
_272[1]=dojo.string.pad(_273.substr(0,_26f.places),_26f.places,"0",true);
}else{
if(_270[1]&&_26f.places!==0){
var pad=_270[1].lastIndexOf("0")+1;
if(pad>_273.length){
_272[1]=dojo.string.pad(_273,pad,"0",true);
}
var _275=_270[1].length;
if(_275<_273.length){
_272[1]=_273.substr(0,_275);
}
}else{
if(_272[1]){
_272.pop();
}
}
}
var _276=_270[0].replace(",","");
pad=_276.indexOf("0");
if(pad!=-1){
pad=_276.length-pad;
if(pad>_272[0].length){
_272[0]=dojo.string.pad(_272[0],pad);
}
if(_276.indexOf("#")==-1){
_272[0]=_272[0].substr(_272[0].length-pad);
}
}
var _277=_270[0].lastIndexOf(",");
var _278,_279;
if(_277!=-1){
_278=_270[0].length-_277-1;
var _27a=_270[0].substr(0,_277);
_277=_27a.lastIndexOf(",");
if(_277!=-1){
_279=_27a.length-_277-1;
}
}
var _27b=[];
for(var _27c=_272[0];_27c;){
var off=_27c.length-_278;
_27b.push((off>0)?_27c.substr(off):_27c);
_27c=(off>0)?_27c.slice(0,off):"";
if(_279){
_278=_279;
delete _279;
}
}
_272[0]=_27b.reverse().join(_26f.group||",");
return _272.join(_26f.decimal||".");
};
dojo.number.regexp=function(_27e){
return dojo.number._parseInfo(_27e).regexp;
};
dojo.number._parseInfo=function(_27f){
_27f=_27f||{};
var _280=dojo.i18n.normalizeLocale(_27f.locale);
var _281=dojo.i18n.getLocalization("dojo.cldr","number",_280);
var _282=_27f.pattern||_281[(_27f.type||"decimal")+"Format"];
var _283=_281.group;
var _284=_281.decimal;
var _285=1;
if(_282.indexOf("%")!=-1){
_285/=100;
}else{
if(_282.indexOf("\u2030")!=-1){
_285/=1000;
}else{
var _286=_282.indexOf("\xa4")!=-1;
if(_286){
_283=_281.currencyGroup||_283;
_284=_281.currencyDecimal||_284;
}
}
}
if(_283=="\xa0"){
_283=" ";
}
var _287=_282.split(";");
if(_287.length==1){
_287.push("-"+_287[0]);
}
var re=dojo.regexp.buildGroupRE(_287,function(_289){
_289="(?:"+dojo.regexp.escapeString(_289,".")+")";
return _289.replace(dojo.number._numberPatternRE,function(_28a){
var _28b={signed:false,separator:_27f.strict?_283:[_283,""],fractional:_27f.fractional,decimal:_284,exponent:false};
var _28c=_28a.split(".");
var _28d=_27f.places;
if(_28c.length==1||_28d===0){
_28b.fractional=false;
}else{
if(typeof _28d=="undefined"){
_28d=_28c[1].lastIndexOf("0")+1;
}
if(_28d&&_27f.fractional==undefined){
_28b.fractional=true;
}
if(!_27f.places&&(_28d<_28c[1].length)){
_28d+=","+_28c[1].length;
}
_28b.places=_28d;
}
var _28e=_28c[0].split(",");
if(_28e.length>1){
_28b.groupSize=_28e.pop().length;
if(_28e.length>1){
_28b.groupSize2=_28e.pop().length;
}
}
return "("+dojo.number._realNumberRegexp(_28b)+")";
});
},true);
if(_286){
re=re.replace(/(\s*)(\u00a4{1,3})(\s*)/g,function(_28f,_290,_291,_292){
var prop=["symbol","currency","displayName"][_291.length-1];
var _294=dojo.regexp.escapeString(_27f[prop]||_27f.currency||"");
_290=_290?"\\s":"";
_292=_292?"\\s":"";
if(!_27f.strict){
if(_290){
_290+="*";
}
if(_292){
_292+="*";
}
return "(?:"+_290+_294+_292+")?";
}
return _290+_294+_292;
});
}
return {regexp:re,group:_283,decimal:_284,factor:_285};
};
dojo.number.parse=function(_295,_296){
var info=dojo.number._parseInfo(_296);
var _298=(new RegExp("^"+info.regexp+"$")).exec(_295);
if(!_298){
return NaN;
}
var _299=_298[1];
if(!_298[1]){
if(!_298[2]){
return NaN;
}
_299=_298[2];
info.factor*=-1;
}
while(_299.indexOf(info.group)!=-1){
_299=_299.replace(info.group,"");
}
_299=_299.replace(info.decimal,".");
return Number(_299)*info.factor;
};
dojo.number._realNumberRegexp=function(_29a){
_29a=(typeof _29a=="object")?_29a:{};
if(typeof _29a.places=="undefined"){
_29a.places=Infinity;
}
if(typeof _29a.decimal!="string"){
_29a.decimal=".";
}
if(typeof _29a.fractional=="undefined"){
_29a.fractional=[true,false];
}
if(typeof _29a.exponent=="undefined"){
_29a.exponent=[true,false];
}
if(typeof _29a.eSigned=="undefined"){
_29a.eSigned=[true,false];
}
var _29b=dojo.number._integerRegexp(_29a);
var _29c=dojo.regexp.buildGroupRE(_29a.fractional,function(q){
var re="";
if(q&&(_29a.places!==0)){
re="\\"+_29a.decimal;
if(_29a.places==Infinity){
re="(?:"+re+"\\d+)?";
}else{
re+="\\d{"+_29a.places+"}";
}
}
return re;
},true);
var _29f=dojo.regexp.buildGroupRE(_29a.exponent,function(q){
if(q){
return "([eE]"+dojo.number._integerRegexp({signed:_29a.eSigned})+")";
}
return "";
});
var _2a1=_29b+_29c;
if(_29c){
_2a1="(?:(?:"+_2a1+")|(?:"+_29c+"))";
}
return _2a1+_29f;
};
dojo.number._integerRegexp=function(_2a2){
_2a2=(typeof _2a2=="object")?_2a2:{};
if(typeof _2a2.signed=="undefined"){
_2a2.signed=[true,false];
}
if(typeof _2a2.separator=="undefined"){
_2a2.separator="";
}else{
if(typeof _2a2.groupSize=="undefined"){
_2a2.groupSize=3;
}
}
var _2a3=dojo.regexp.buildGroupRE(_2a2.signed,function(q){
return q?"[-+]":"";
},true);
var _2a5=dojo.regexp.buildGroupRE(_2a2.separator,function(sep){
if(!sep){
return "(?:0|[1-9]\\d*)";
}
sep=dojo.regexp.escapeString(sep);
var grp=_2a2.groupSize,grp2=_2a2.groupSize2;
if(grp2){
var _2a9="(?:0|[1-9]\\d{0,"+(grp2-1)+"}(?:["+sep+"]\\d{"+grp2+"})*["+sep+"]\\d{"+grp+"})";
return ((grp-grp2)>0)?"(?:"+_2a9+"|(?:0|[1-9]\\d{0,"+(grp-1)+"}))":_2a9;
}
return "(?:0|[1-9]\\d{0,"+(grp-1)+"}(?:["+sep+"]\\d{"+grp+"})*)";
},true);
return _2a3+_2a5;
};
}
if(!dojo._hasResource["dijit.ProgressBar"]){
dojo._hasResource["dijit.ProgressBar"]=true;
dojo.provide("dijit.ProgressBar");
dojo.declare("dijit.ProgressBar",[dijit._Widget,dijit._Templated],null,{progress:"0",maximum:100,places:0,indeterminate:false,templateString:"<div class=\"dijitProgressBar dijitProgressBarEmpty\"\n\t><div dojoAttachPoint=\"emptyLabel\" class=\"dijitProgressBarEmptyLabel\"\n\t></div\n\t><div waiRole=\"progressbar\" tabindex=\"0\" dojoAttachPoint=\"internalProgress\" class=\"dijitProgressBarFull\"\n\t\t><div class=\"dijitProgressBarTile\"\n\t\t></div\n\t\t><div dojoAttachPoint=\"fullLabel\" class=\"dijitProgressBarFullLabel\"\n\t\t></div\n\t></div\n\t><img dojoAttachPoint=\"inteterminateHighContrastImage\" class=\"dijitIndeterminateProgressBarHighContrastImage\"\n\t></img\n></div>\n",_indeterminateHighContrastImagePath:dojo.moduleUrl("dijit","themes/a11y/indeterminate_progress.gif"),postCreate:function(){
dijit.ProgressBar.superclass.postCreate.apply(this,arguments);
this.fullLabel.style.width=dojo.getComputedStyle(this.domNode).width;
this.inteterminateHighContrastImage.setAttribute("src",this._indeterminateHighContrastImagePath);
this.update();
},update:function(_2aa){
dojo.mixin(this,_2aa||{});
if(this.indeterminate){
dojo.addClass(this.domNode,"dijitProgressBarIndeterminate");
this.internalProgress.style.width="100%";
dijit.util.wai.removeAttr(this.internalProgress,"waiState","valuenow");
this._setLabels("");
}else{
dojo.removeClass(this.domNode,"dijitProgressBarIndeterminate");
var _2ab;
if(String(this.progress).indexOf("%")!=-1){
_2ab=Math.min(parseFloat(this.progress)/100,1);
this.progress=_2ab*this.maximum;
}else{
this.progress=Math.min(this.progress,this.maximum);
_2ab=this.progress/this.maximum;
}
this.internalProgress.style.width=(_2ab*100)+"%";
var text=this.report(_2ab);
dijit.util.wai.setAttr(this.internalProgress,"waiState","valuenow",text);
this._setLabels(text);
}
this.onChange();
},_setLabels:function(text){
dojo.forEach(["full","empty"],function(name){
var _2af=this[name+"Label"];
if(_2af.firstChild){
_2af.firstChild.nodeValue=text;
}else{
_2af.appendChild(dojo.doc.createTextNode(text));
}
var dim=dojo.contentBox(_2af);
var _2b1=(parseInt(dojo.getComputedStyle(this.domNode).height)-dim.h)/2;
_2af.style.bottom=_2b1+"px";
},this);
},report:function(_2b2){
return dojo.number.format(_2b2,{type:"percent",places:this.places,locale:this.lang});
},onChange:function(){
}});
}
if(!dojo._hasResource["dijit.TitlePane"]){
dojo._hasResource["dijit.TitlePane"]=true;
dojo.provide("dijit.TitlePane");
dojo.declare("dijit.TitlePane",[dijit._Widget,dijit._Templated],{title:"",open:true,duration:250,contentClass:"dijitTitlePaneContent",templateString:"<div id=\"${id}\">\n\t<div dojoAttachEvent=\"onclick: _onTitleClick; onkeypress: _onTitleKey\" tabindex=\"0\"\n\t\t\twaiRole=\"button\" class=\"dijitTitlePaneTitle\" dojoAttachPoint=\"focusNode\">\n\t\t<span class=\"dijitOpenCloseArrowOuter\" style=\"float: left;\"><span class=\"dijitOpenCloseArrowInner\"></span></span>\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitInlineBox dijitTitleNode\"></span>\n\t</div>\n\t<div dojoAttachPoint=\"containerNode\" waiRole=\"region\" tabindex=\"-1\" class=\"dijitTitlePaneContent\"></div>\n</div>\n",postCreate:function(){
this.setTitle(this.title);
if(!this.open){
dojo.style(this.containerNode,"display","none");
}
this._setCss();
dijit.TitlePane.superclass.postCreate.apply(this,arguments);
dijit.util.wai.setAttr(this.containerNode,"waiState","titleledby",this.titleNode.id);
dijit.util.wai.setAttr(this.focusNode,"waiState","haspopup","true");
this._slideIn=dojo.fx.slideIn({node:this.containerNode,duration:this.duration});
this._slideOut=dojo.fx.slideOut({node:this.containerNode,duration:this.duration});
},_onTitleClick:function(){
dojo.forEach([this._slideIn,this._slideOut],function(_2b3){
if(_2b3.status()=="playing"){
_2b3.stop();
}
});
this[this.open?"_slideOut":"_slideIn"].play();
this.open=!this.open;
this._setCss();
},_setCss:function(){
var _2b4=["dijitClosed","dijitOpen"];
var _2b5=this.open;
dojo.removeClass(this.domNode,_2b4[!_2b5+0]);
this.domNode.className+=" "+_2b4[_2b5+0];
},_onTitleKey:function(e){
if(e.keyCode==dojo.keys.ENTER||e.charCode==dojo.keys.SPACE){
this._onTitleClick();
}else{
if(e.keyCode==dojo.keys.DOWN_ARROW){
if(this.open){
this.containerNode.focus();
e.preventDefault();
}
}
}
},setTitle:function(_2b7){
this.titleNode.innerHTML=_2b7;
}});
}
if(!dojo._hasResource["dijit.Tooltip"]){
dojo._hasResource["dijit.Tooltip"]=true;
dojo.provide("dijit.Tooltip");
dojo.declare("dijit._MasterTooltip",[dijit._Widget,dijit._Templated],{duration:200,templateString:"<div class=\"dijitTooltip\" id=\"dojoTooltip\">\n\t<div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\" waiRole='alert'></div>\n\t<div class=\"dijitTooltipConnector\"></div>\n</div>\n",postCreate:function(){
dojo.body().appendChild(this.domNode);
this.bgIframe=new dijit.util.BackgroundIframe(this.domNode);
var _2b8=dojo.isIE?1:dojo.style(this.domNode,"opacity");
this.fadeIn=dojo._fade({node:this.domNode,duration:this.duration,end:_2b8});
dojo.connect(this.fadeIn,"onEnd",this,"_onShow");
this.fadeOut=dojo._fade({node:this.domNode,duration:this.duration,end:0});
dojo.connect(this.fadeOut,"onEnd",this,"_onHide");
},show:function(_2b9,_2ba){
if(this.fadeOut.status()=="playing"){
this._onDeck=arguments;
return;
}
this.containerNode.innerHTML=_2b9;
var _2bb=this.isLeftToRight()?{"BR":"BL","BL":"BR"}:{"BL":"BR","BR":"BL"};
var pos=dijit.util.placeOnScreenAroundElement(this.domNode,_2ba,_2bb);
this.domNode.className="dijitTooltip dijitTooltip"+(pos.corner=="BL"?"Right":"Left");
dojo.style(this.domNode,"opacity",0);
this.fadeIn.play();
this.isShowingNow=true;
},_onShow:function(){
if(dojo.isIE){
this.domNode.style.filter="";
}
},hide:function(){
if(this._onDeck){
this._onDeck=null;
return;
}
this.fadeIn.stop();
this.isShowingNow=false;
this.fadeOut.play();
},_onHide:function(){
this.domNode.style.cssText="";
if(this._onDeck){
this.show.apply(this,this._onDeck);
this._onDeck=null;
}
}});
dojo.addOnLoad(function(){
dijit.MasterTooltip=new dijit._MasterTooltip();
});
dojo.declare("dijit.Tooltip",dijit._Widget,{label:"",showDelay:400,connectId:"",postCreate:function(){
this.srcNodeRef.style.display="none";
this._connectNode=dojo.byId(this.connectId);
dojo.forEach(["onMouseOver","onHover","onMouseOut","onUnHover"],function(_2bd){
this.connect(this._connectNode,_2bd.toLowerCase(),"_"+_2bd);
},this);
},_onMouseOver:function(e){
this._onHover(e);
},_onMouseOut:function(e){
if(dojo.isDescendant(e.relatedTarget,this._connectNode)){
return;
}
this._onUnHover(e);
},_onHover:function(e){
if(this._hover){
return;
}
this._hover=true;
if(!this.isShowingNow&&!this._showTimer){
this._showTimer=setTimeout(dojo.hitch(this,"open"),this.showDelay);
}
},_onUnHover:function(e){
if(!this._hover){
return;
}
this._hover=false;
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}else{
this.close();
}
},open:function(){
if(this.isShowingNow){
return;
}
if(this._showTimer){
clearTimeout(this._showTimer);
delete this._showTimer;
}
dijit.MasterTooltip.show(this.label||this.domNode.innerHTML,this._connectNode);
this.isShowingNow=true;
},close:function(){
if(!this.isShowingNow){
return;
}
dijit.MasterTooltip.hide();
this.isShowingNow=false;
},uninitialize:function(){
this.close();
}});
}
if(!dojo._hasResource["dijit._tree.Controller"]){
dojo._hasResource["dijit._tree.Controller"]=true;
dojo.provide("dijit._tree.Controller");
dojo.declare("dijit._tree.Controller",[dijit._Widget],{treeId:"",postMixInProperties:function(){
dojo.subscribe(this.treeId,this,"_listener");
},_listener:function(_2c2){
var _2c3=_2c2.event;
var _2c4="on"+_2c3.charAt(0).toUpperCase()+_2c3.substr(1);
if(this[_2c4]){
this[_2c4](_2c2);
}
},onBeforeTreeDestroy:function(_2c5){
dojo.unsubscribe(_2c5.tree.id);
},onExecute:function(_2c6){
_2c6.node.tree.focusNode(_2c6.node);
console.log("execute message for "+_2c6.node);
},onNext:function(_2c7){
var _2c8;
var _2c9=_2c7.node;
if(_2c9.isFolder&&_2c9.isExpanded&&_2c9.hasChildren()){
_2c8=_2c9.getChildren()[0];
}else{
while(_2c9.isTreeNode){
_2c8=_2c9.getNextSibling();
if(_2c8){
break;
}
_2c9=_2c9.getParent();
}
}
if(_2c8&&_2c8.isTreeNode){
_2c8.tree.focusNode(_2c8);
return _2c8;
}
},onPrevious:function(_2ca){
var _2cb=_2ca.node;
var _2cc=_2cb;
var _2cd=_2cb.getPreviousSibling();
if(_2cd){
_2cb=_2cd;
while(_2cb.isFolder&&_2cb.isExpanded&&_2cb.hasChildren()){
_2cc=_2cb;
var _2ce=_2cb.getChildren();
_2cb=_2ce[_2ce.length-1];
}
}else{
_2cb=_2cb.getParent();
}
if(_2cb&&_2cb.isTreeNode){
_2cc=_2cb;
}
if(_2cc&&_2cc.isTreeNode){
_2cc.tree.focusNode(_2cc);
return _2cc;
}
},onZoomIn:function(_2cf){
var _2d0=_2cf.node;
var _2d1=_2d0;
if(_2d0.isFolder&&!_2d0.isExpanded){
this._expand(_2d0);
}else{
if(_2d0.hasChildren()){
_2d0=_2d0.getChildren()[0];
}
}
if(_2d0&&_2d0.isTreeNode){
_2d1=_2d0;
}
if(_2d1&&_2d1.isTreeNode){
_2d1.tree.focusNode(_2d1);
return _2d1;
}
},onZoomOut:function(_2d2){
var node=_2d2.node;
var _2d4=node;
if(node.isFolder&&node.isExpanded){
this._collapse(node);
}else{
node=node.getParent();
}
if(node&&node.isTreeNode){
_2d4=node;
}
if(_2d4&&_2d4.isTreeNode){
_2d4.tree.focusNode(_2d4);
return _2d4;
}
},onFirst:function(_2d5){
var _2d6=_2d5.tree;
if(_2d6){
_2d6=_2d6.getChildren()[0];
if(_2d6&&_2d6.isTreeNode){
_2d6.tree.focusNode(_2d6);
return _2d6;
}
}
},onLast:function(_2d7){
var _2d8=_2d7.node.tree;
var _2d9=_2d8;
while(_2d9.isExpanded){
var c=_2d9.getChildren();
_2d9=c[c.length-1];
if(_2d9.isTreeNode){
_2d8=_2d9;
}
}
if(_2d8&&_2d8.isTreeNode){
_2d8.tree.focusNode(_2d8);
return _2d8;
}
},onToggleOpen:function(_2db){
var node=_2db.node;
if(node.isExpanded){
this._collapse(node);
}else{
this._expand(node);
}
},_expand:function(node){
if(node.isFolder){
node.expand();
var t=node.tree;
if(t.lastFocused){
t.focusNode(t.lastFocused);
}
}
},_collapse:function(node){
if(node.isFolder){
if(dojo.query("[tabindex=0]",node.domNode).length>0){
node.tree.focusNode(node);
}
node.collapse();
}
}});
dojo.declare("dijit._tree.DataController",dijit._tree.Controller,{onAfterTreeCreate:function(_2e0){
var tree=_2e0.tree;
var _2e2=this;
function onComplete(_2e3){
var _2e4=dojo.map(_2e3,function(item){
return {item:item,isFolder:_2e2.store.hasAttribute(item,_2e2.childrenAttr)};
});
tree.setChildren(_2e4);
};
this.store.fetch({query:this.query,onComplete:onComplete});
},_expand:function(node){
var _2e7=this.store;
var _2e8=this.store.getValue;
switch(node.state){
case "LOADING":
return;
case "UNCHECKED":
var _2e9=node.item;
var _2ea=_2e7.getValues(_2e9,this.childrenAttr);
var _2eb=0;
dojo.forEach(_2ea,function(item){
if(!_2e7.isItemLoaded(item)){
_2eb++;
}
});
if(_2eb==0){
this._onLoadAllItems(node,_2ea);
}else{
node.markProcessing();
var _2ed=this;
function onItem(item){
if(--_2eb==0){
node.unmarkProcessing();
_2ed._onLoadAllItems(node,_2ea);
}
};
dojo.forEach(_2ea,function(item){
if(!_2e7.isItemLoaded(item)){
_2e7.loadItem({item:item,onItem:onItem});
}
});
}
break;
default:
dijit._tree.Controller.prototype._expand.apply(this,arguments);
break;
}
},_onLoadAllItems:function(node,_2f1){
var _2f2=dojo.map(_2f1,function(item){
return {item:item,isFolder:this.store.hasAttribute(item,this.childrenAttr)};
},this);
node.setChildren(_2f2);
dijit._tree.Controller.prototype._expand.apply(this,arguments);
},_collapse:function(node){
if(node.state=="LOADING"){
return;
}
dijit._tree.Controller.prototype._collapse.apply(this,arguments);
}});
}
if(!dojo._hasResource["dijit.Tree"]){
dojo._hasResource["dijit.Tree"]=true;
dojo.provide("dijit.Tree");
dojo.declare("dijit._TreeBase",[dijit._Widget,dijit._Templated,dijit._Container,dijit._Contained],{state:"UNCHECKED",locked:false,lock:function(){
this.locked=true;
},unlock:function(){
if(!this.locked){
throw new Error(this.declaredClass+" unlock: not locked");
}
this.locked=false;
},isLocked:function(){
var node=this;
while(true){
if(node.lockLevel){
return true;
}
if(!node.getParent()||node.isTree){
break;
}
node=node.getParent();
}
return false;
},setChildren:function(_2f6){
this.destroyDescendants();
this.state="LOADED";
if(_2f6&&_2f6.length>0){
this.isFolder=true;
if(!this.containerNode){
this.containerNode=this.tree.containerNodeTemplate.cloneNode(true);
this.domNode.appendChild(this.containerNode);
}
dojo.forEach(_2f6,function(_2f7){
var _2f8=new dijit._TreeNode(dojo.mixin({tree:this.tree,label:this.tree.store.getLabel(_2f7.item)},_2f7));
this.addChild(_2f8);
},this);
dojo.forEach(this.getChildren(),function(_2f9,idx){
_2f9._updateLayout();
var _2fb={child:_2f9,index:idx,parent:this};
});
}else{
this.isFolder=false;
}
if(this.isTree){
var fc=this.getChildren()[0];
var _2fd=(fc)?fc.labelNode:this.domNode;
_2fd.setAttribute("tabIndex","0");
}
}});
dojo.declare("dijit.Tree",dijit._TreeBase,{store:null,query:null,childrenAttr:"children",templateString:"<div class=\"TreeContainer\" style=\"\" waiRole=\"tree\"\n\tdojoAttachEvent=\"onclick:_onClick;onkeypress:_onKeyPress\"\n></div>\n",isExpanded:true,isTree:true,_publish:function(_2fe,_2ff){
dojo.publish(this.id,[dojo.mixin({tree:this,event:_2fe},_2ff||{})]);
},postMixInProperties:function(){
this.tree=this;
var _300={};
_300[dojo.keys.ENTER]="execute";
_300[dojo.keys.LEFT_ARROW]="zoomOut";
_300[dojo.keys.RIGHT_ARROW]="zoomIn";
_300[dojo.keys.UP_ARROW]="previous";
_300[dojo.keys.DOWN_ARROW]="next";
_300[dojo.keys.HOME]="first";
_300[dojo.keys.END]="last";
this._keyTopicMap=_300;
},postCreate:function(){
this.containerNode=this.domNode;
var div=document.createElement("div");
div.style.display="none";
div.className="TreeContainer";
dijit.util.wai.setAttr(div,"waiRole","role","presentation");
this.containerNodeTemplate=div;
this._controller=new dijit._tree.DataController({store:this.store,treeId:this.id,query:this.query,childrenAttr:this.childrenAttr});
this._publish("afterTreeCreate");
},destroy:function(){
this._publish("beforeTreeDestroy");
return dijit._Widget.prototype.destroy.apply(this,arguments);
},toString:function(){
return "["+this.declaredClass+" ID:"+this.id+"]";
},_domElement2TreeNode:function(_302){
var ret;
do{
ret=dijit.util.manager.byNode(_302);
}while(!ret&&(_302=_302.parentNode));
return ret;
},_onClick:function(e){
var _305=e.target;
var _306=this._domElement2TreeNode(_305);
if(!_306||!_306.isTreeNode){
return;
}
this._publish((_305==_306.expandoNode||_305==_306.expandoNodeText)?"toggleOpen":"execute",{node:_306});
dojo.stopEvent(e);
},_onKeyPress:function(e){
if(!e.keyCode||e.altKey){
return;
}
var _308=this._domElement2TreeNode(e.target);
if(!_308){
return;
}
if(this._keyTopicMap[e.keyCode]){
this._publish(this._keyTopicMap[e.keyCode],{node:_308});
dojo.stopEvent(e);
}
},blurNode:function(){
var node=this.lastFocused;
if(!node){
return;
}
var _30a=node.labelNode;
dojo.removeClass(_30a,"TreeLabelFocused");
_30a.setAttribute("tabIndex","-1");
this.lastFocused=null;
},focusNode:function(node){
this.blurNode();
var _30c=node.labelNode;
_30c.setAttribute("tabIndex","0");
this.lastFocused=node;
dojo.addClass(_30c,"TreeLabelFocused");
_30c.focus();
}});
dojo.declare("dijit._TreeNode",dijit._TreeBase,{templateString:"<div class=\"TreeNode TreeExpandLeaf TreeChildrenNo\" waiRole=\"presentation\"\n\tdojoAttachEvent=\"onfocus:_onFocus\";\n\t><span dojoAttachPoint=\"expandoNode\" class=\"TreeExpando\" waiRole=\"presentation\"\n\t></span\n\t><span dojoAttachPoint=\"expandoNodeText\" class=\"dijitExpandoText\" waiRole=\"presentation\"\n\t></span\n\t><div dojoAttachPoint=\"iconNode\" class=\"TreeIcon\" waiRole=\"presentation\"\n\t ><div dojoAttachPoint=\"contentNode\" class=\"TreeContent\" waiRole=\"presentation\"\n\t  ><span dojoAttachPoint=labelNode class=\"TreeLabel\" wairole=\"treeitem\" expanded=\"true\" tabindex=\"-1\"\n\t  ></span\n\t ></div\n\t></div\n></div>\n",nodeType:"",item:null,isTreeNode:true,label:"",isFolder:null,isExpanded:false,postCreate:function(){
this.labelNode.innerHTML="";
this.labelNode.appendChild(document.createTextNode(this.label));
this._setExpando();
},markProcessing:function(){
this.state="LOADING";
this._setExpando(true);
},unmarkProcessing:function(){
this._setExpando(false);
},_onFocus:function(e){
dojo.stopEvent(e);
},_updateLayout:function(){
dojo.removeClass(this.domNode,"TreeIsRoot");
if(this.getParent()["isTree"]){
dojo.addClass(this.domNode,"TreeIsRoot");
}
dojo.removeClass(this.domNode,"TreeIsLast");
if(!this.getNextSibling()){
dojo.addClass(this.domNode,"TreeIsLast");
}
},_setExpando:function(_30e){
var _30f=["TreeExpandoLoading","TreeExpandoOpened","TreeExpandoClosed","TreeExpandoLeaf"];
var idx=_30e?0:(this.isFolder?(this.isExpanded?1:2):3);
dojo.forEach(_30f,function(s){
dojo.removeClass(this.expandoNode,s);
},this);
dojo.addClass(this.expandoNode,_30f[idx]);
this.expandoNodeText.innerHTML=_30e?"*":(this.isFolder?(this.isExpanded?"&#9660;":"&#9658;"):"-");
},setChildren:function(_312){
dijit.Tree.superclass.setChildren.apply(this,arguments);
this._slideIn=dojo.fx.slideIn({node:this.containerNode,duration:250});
dojo.connect(this.slideIn,"onEnd",dojo.hitch(this,"_afterExpand"));
this._slideOut=dojo.fx.slideOut({node:this.containerNode,duration:250});
dojo.connect(this.slideOut,"onEnd",dojo.hitch(this,"_afterCollapse"));
},expand:function(){
if(this.isExpanded){
return;
}
if(this._slideOut.status()=="playing"){
this._slideOut.stop();
}
this.isExpanded=true;
dijit.util.wai.setAttr(this.labelNode,"waiState","expanded","true");
dijit.util.wai.setAttr(this.containerNode,"waiRole","role","group");
this._setExpando();
this._slideIn.play();
},_afterExpand:function(){
this.onShow();
this._publish("afterExpand",{node:this});
},collapse:function(){
if(!this.isExpanded){
return;
}
if(this._slideIn.status()=="playing"){
this._slideIn.stop();
}
this.isExpanded=false;
dijit.util.wai.setAttr(this.labelNode,"waiState","expanded","false");
this._setExpando();
this._slideOut.play();
},_afterCollapse:function(){
this.onHide();
this._publish("afterCollapse",{node:this});
},toString:function(){
return "["+this.declaredClass+", "+this.label+"]";
}});
}
if(!dojo._hasResource["dijit.form.Checkbox"]){
dojo._hasResource["dijit.form.Checkbox"]=true;
dojo.provide("dijit.form.Checkbox");
dojo.declare("dijit.form.Checkbox",dijit.form.ToggleButton,{templateString:"<span class=\"${baseClass}\" baseClass=\"${baseClass}\"\n\t><input\n\t \tid=\"${id}\" tabIndex=\"${tabIndex}\" type=\"${_type}\" name=\"${name}\" value=\"${value}\"\n\t\tclass=\"dijitCheckboxInput\"\n\t\tdojoAttachPoint=\"inputNode;focusNode\"\n\t \tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onclick:onClick\"\n></span>\n",baseClass:"dijitCheckbox",_type:"checkbox",checked:false,value:"on",postCreate:function(){
dojo.setSelectable(this.inputNode,false);
this.setSelected(this.checked);
dijit.form.ToggleButton.prototype.postCreate.apply(this,arguments);
},setSelected:function(_313){
this.inputNode.checked=this.checked=_313;
dijit.form.ToggleButton.prototype.setSelected.apply(this,arguments);
},setValue:function(_314){
if(_314==null){
_314="";
}
this.inputNode.value=_314;
dijit.form.Checkbox.superclass.setValue.call(this,_314);
}});
dojo.declare("dijit.form.RadioButton",dijit.form.Checkbox,{_type:"radio",baseClass:"dijitRadio",_groups:{},postCreate:function(){
(this._groups[this.name]=this._groups[this.name]||[]).push(this);
dijit.form.Checkbox.prototype.postCreate.apply(this,arguments);
},uninitialize:function(){
dojo.forEach(this._groups[this.name],function(_315,i,arr){
if(_315===this){
arr.splice(i,1);
return;
}
},this);
},setSelected:function(_318){
if(_318){
dojo.forEach(this._groups[this.name],function(_319){
if(_319!=this&&_319.selected){
_319.setSelected(false);
}
},this);
}
dijit.form.Checkbox.prototype.setSelected.apply(this,arguments);
},onClick:function(e){
if(!this.selected){
this.setSelected(true);
}
}});
}
if(!dojo._hasResource["dojo.data.util.filter"]){
dojo._hasResource["dojo.data.util.filter"]=true;
dojo.provide("dojo.data.util.filter");
dojo.data.util.filter.patternToRegExp=function(_31b,_31c){
var rxp="^";
var c=null;
for(var i=0;i<_31b.length;i++){
c=_31b.charAt(i);
switch(c){
case "\\":
rxp+=c;
i++;
rxp+=_31b.charAt(i);
break;
case "*":
rxp+=".*";
break;
case "?":
rxp+=".";
break;
case "$":
case "^":
case "/":
case "+":
case ".":
case "|":
case "(":
case ")":
case "{":
case "}":
case "[":
case "]":
rxp+="\\";
default:
rxp+=c;
}
}
rxp+="$";
if(_31c){
return new RegExp(rxp,"i");
}else{
return new RegExp(rxp);
}
};
}
if(!dojo._hasResource["dojo.data.util.sorter"]){
dojo._hasResource["dojo.data.util.sorter"]=true;
dojo.provide("dojo.data.util.sorter");
dojo.data.util.sorter.basicComparator=function(a,b){
var ret=0;
if(a>b||typeof a==="undefined"){
ret=1;
}else{
if(a<b||typeof b==="undefined"){
ret=-1;
}
}
return ret;
};
dojo.data.util.sorter.createSortFunction=function(_323,_324){
var _325=[];
function createSortFunction(attr,dir){
return function(_328,_329){
var a=_324.getValue(_328,attr);
var b=_324.getValue(_329,attr);
var _32c=null;
if(_324.comparatorMap){
if(typeof attr!=="string"){
attr=_324.getIdentity(attr);
}
_32c=_324.comparatorMap[attr]||dojo.data.util.sorter.basicComparator;
}
_32c=_32c||dojo.data.util.sorter.basicComparator;
return dir*_32c(a,b);
};
};
for(var i=0;i<_323.length;i++){
sortAttribute=_323[i];
if(sortAttribute.attribute){
var _32e=(sortAttribute.descending)?-1:1;
_325.push(createSortFunction(sortAttribute.attribute,_32e));
}
}
return function(rowA,rowB){
var i=0;
while(i<_325.length){
var ret=_325[i++](rowA,rowB);
if(ret!==0){
return ret;
}
}
return 0;
};
};
}
if(!dojo._hasResource["dojo.data.util.simpleFetch"]){
dojo._hasResource["dojo.data.util.simpleFetch"]=true;
dojo.provide("dojo.data.util.simpleFetch");
dojo.data.util.simpleFetch.fetch=function(_333){
_333=_333||{};
if(!_333.store){
_333.store=this;
}
var self=this;
var _335=function(_336,_337){
if(_337.onError){
var _338=_337.scope||dojo.global;
_337.onError.call(_338,_336,_337);
}
};
var _339=function(_33a,_33b){
var _33c=_33b.abort||null;
var _33d=false;
var _33e=_33b.start?_33b.start:0;
var _33f=_33b.count?(_33e+_33b.count):_33a.length;
_33b.abort=function(){
_33d=true;
if(_33c){
_33c.call(_33b);
}
};
var _340=_33b.scope||dojo.global;
if(!_33b.store){
_33b.store=self;
}
if(_33b.onBegin){
_33b.onBegin.call(_340,_33a.length,_33b);
}
if(_33b.sort){
_33a.sort(dojo.data.util.sorter.createSortFunction(_33b.sort,self));
}
if(_33b.onItem){
for(var i=_33e;(i<_33a.length)&&(i<_33f);++i){
var item=_33a[i];
if(!_33d){
_33b.onItem.call(_340,item,_33b);
}
}
}
if(_33b.onComplete&&!_33d){
var _343=null;
if(!_33b.onItem){
_343=_33a.slice(_33e,_33f);
}
_33b.onComplete.call(_340,_343,_33b);
}
};
this._fetchItems(_333,_339,_335);
return _333;
};
}
if(!dojo._hasResource["dojo.data.JsonItemStore"]){
dojo._hasResource["dojo.data.JsonItemStore"]=true;
dojo.provide("dojo.data.JsonItemStore");
dojo.declare("dojo.data.JsonItemStore",null,function(_344){
this._arrayOfAllItems=[];
this._loadFinished=false;
this._jsonFileUrl=_344.url;
this._jsonData=_344.data;
this._features={"dojo.data.api.Read":true};
this._itemsByIdentity=null;
this._storeRef="_S";
this._itemId="_0";
},{url:"",_assertIsItem:function(item){
if(!this.isItem(item)){
throw new Error("dojo.data.JsonItemStore: a function was passed an item argument that was not an item");
}
},_assertIsAttribute:function(_346){
if(typeof _346!=="string"){
throw new Error("dojo.data.JsonItemStore: a function was passed an attribute argument that was not an attribute name string");
}
},getValue:function(item,_348,_349){
var _34a=this.getValues(item,_348);
return (_34a.length>0)?_34a[0]:_349;
},getValues:function(item,_34c){
this._assertIsItem(item);
this._assertIsAttribute(_34c);
return item[_34c]||[];
},getAttributes:function(item){
this._assertIsItem(item);
var _34e=[];
for(var key in item){
if((key!==this._storeRef)&&(key!==this._itemId)){
_34e.push(key);
}
}
return _34e;
},hasAttribute:function(item,_351){
return this.getValues(item,_351).length>0;
},containsValue:function(item,_353,_354){
var _355=undefined;
if(typeof _354==="string"){
_355=dojo.data.util.filter.patternToRegExp(_354,false);
}
return this._containsValue(item,_353,_354,_355);
},_containsValue:function(item,_357,_358,_359){
var _35a=this.getValues(item,_357);
for(var i=0;i<_35a.length;++i){
var _35c=_35a[i];
if(typeof _35c==="string"&&_359){
return (_35c.match(_359)!==null);
}else{
if(_358===_35c){
return true;
}
}
}
return false;
},isItem:function(_35d){
if(_35d&&_35d[this._storeRef]===this){
if(this._arrayOfAllItems[_35d[this._itemId]]===_35d){
return true;
}
}
return false;
},isItemLoaded:function(_35e){
return this.isItem(_35e);
},loadItem:function(_35f){
this._assertIsItem(_35f.item);
},getFeatures:function(){
if(!this._loadFinished){
this._forceLoad();
}
return this._features;
},getLabel:function(item){
if(this._labelAttr&&this.isItem(item)){
return this.getValue(item,this._labelAttr);
}
return undefined;
},getLabelAttributes:function(item){
if(this._labelAttr){
return [this._labelAttr];
}
return null;
},_fetchItems:function(_362,_363,_364){
var self=this;
var _366=function(_367,_368){
var _369=null;
if(_367.query){
var _36a=_367.queryOptions?_367.queryOptions.ignoreCase:false;
_369=[];
var _36b={};
for(var key in _367.query){
var _36d=_367.query[key];
if(typeof _36d==="string"){
_36b[key]=dojo.data.util.filter.patternToRegExp(_36d,_36a);
}
}
for(var i=0;i<_368.length;++i){
var _36f=true;
var _370=_368[i];
for(var key in _367.query){
var _36d=_367.query[key];
if(!self._containsValue(_370,key,_36d,_36b[key])){
_36f=false;
}
}
if(_36f){
_369.push(_370);
}
}
_363(_369,_367);
}else{
if(self._arrayOfAllItems.length>0){
_369=self._arrayOfAllItems.slice(0,self._arrayOfAllItems.length);
}
_363(_369,_367);
}
};
if(this._loadFinished){
_366(_362,this._arrayOfAllItems);
}else{
if(this._jsonFileUrl){
var _371={url:self._jsonFileUrl,handleAs:"json-comment-optional"};
var _372=dojo.xhrGet(_371);
_372.addCallback(function(data){
self._loadFinished=true;
try{
self._arrayOfAllItems=self._getItemsFromLoadedData(data);
_366(_362,self._arrayOfAllItems);
}
catch(e){
_364(e,_362);
}
});
_372.addErrback(function(_374){
_364(_374,_362);
});
}else{
if(this._jsonData){
try{
this._loadFinished=true;
this._arrayOfAllItems=this._getItemsFromLoadedData(this._jsonData);
this._jsonData=null;
_366(_362,this._arrayOfAllItems);
}
catch(e){
_364(e,_362);
}
}else{
_364(new Error("dojo.data.JsonItemStore: No JSON source data was provided as either URL or a nested Javascript object."),_362);
}
}
}
},close:function(_375){
},_getItemsFromLoadedData:function(_376){
var _377=_376.items;
var i;
var item;
var _37a={};
this._labelAttr=_376.label;
for(i=0;i<_377.length;++i){
item=_377[i];
for(var key in item){
var _37c=item[key];
if(_37c!==null){
if(!dojo.isArray(_37c)){
item[key]=[_37c];
}
}else{
item[key]=[null];
}
_37a[key]=key;
}
}
while(_37a[this._storeRef]){
this._storeRef+="_";
}
while(_37a[this._itemId]){
this._itemId+="_";
}
var _37d=_376.identifier;
var _37e=null;
if(_37d){
this._features["dojo.data.api.Identity"]=_37d;
this._itemsByIdentity={};
for(var i=0;i<_377.length;++i){
item=_377[i];
_37e=item[_37d];
identity=_37e[0];
if(!this._itemsByIdentity[identity]){
this._itemsByIdentity[identity]=item;
}else{
if(this._jsonFileUrl){
throw new Error("dojo.data.JsonItemStore:  The json data as specified by: ["+this._jsonFileUrl+"] is malformed.  Items within the list have identifier: ["+_37d+"].  Value collided: ["+identity+"]");
}else{
if(this._jsonData){
throw new Error("dojo.data.JsonItemStore:  The json data provided by the creation arguments is malformed.  Items within the list have identifier: ["+_37d+"].  Value collided: ["+identity+"]");
}
}
}
}
}
for(i=0;i<_377.length;++i){
item=_377[i];
item[this._storeRef]=this;
item[this._itemId]=i;
for(key in item){
_37e=item[key];
for(var j=0;j<_37e.length;++j){
_37c=_37e[j];
if(_37c!==null&&typeof _37c=="object"&&_37c.reference){
var _380=_37c.reference;
if(dojo.isString(_380)){
_37e[j]=this._itemsByIdentity[_380];
}else{
for(var k=0;k<_377.length;++k){
var _382=_377[k];
var _383=true;
for(var _384 in _380){
if(_382[_384]!=_380[_384]){
_383=false;
}
}
if(_383){
_37e[j]=_382;
}
}
}
}
}
}
}
return _377;
},getIdentity:function(item){
var _386=this._features["dojo.data.api.Identity"];
var _387=item[_386];
if(_387){
return _387[0];
}
return null;
},fetchItemByIdentity:function(_388){
if(!this._loadFinished){
var self=this;
if(this._jsonFileUrl){
var _38a={url:self._jsonFileUrl,handleAs:"json-comment-optional"};
var _38b=dojo.xhrGet(_38a);
_38b.addCallback(function(data){
var _38d=_388.scope?_388.scope:dojo.global;
try{
self._arrayOfAllItems=self._getItemsFromLoadedData(data);
self._loadFinished=true;
var item=self._getItemByIdentity(_388.identity);
if(_388.onItem){
_388.onItem.call(_38d,item);
}
}
catch(error){
if(_388.onError){
_388.onError.call(_38d,error);
}
}
});
_38b.addErrback(function(_38f){
if(_388.onError){
var _390=_388.scope?_388.scope:dojo.global;
_388.onError.call(_390,_38f);
}
});
}else{
if(this._jsonData){
self._arrayOfAllItems=self._getItemsFromLoadedData(self._jsonData);
self._jsonData=null;
self._loadFinished=true;
var item=self._getItemByIdentity(_388.identity);
if(_388.onItem){
var _392=_388.scope?_388.scope:dojo.global;
_388.onItem.call(_392,item);
}
}
}
}else{
var item=this._getItemByIdentity(_388.identity);
if(_388.onItem){
var _392=_388.scope?_388.scope:dojo.global;
_388.onItem.call(_392,item);
}
}
},_getItemByIdentity:function(_393){
var item=null;
if(this._itemsByIdentity){
item=this._itemsByIdentity[_393];
if(item===undefined){
item=null;
}
}
return item;
},getIdentityAttributes:function(item){
var _396=this._features["dojo.data.api.Identity"];
if(_396){
return [_396];
}
return null;
},_forceLoad:function(){
var self=this;
if(this._jsonFileUrl){
var _398={url:self._jsonFileUrl,handleAs:"json-comment-optional",sync:true};
var _399=dojo.xhrGet(_398);
_399.addCallback(function(data){
try{
self._arrayOfAllItems=self._getItemsFromLoadedData(data);
self._loadFinished=true;
}
catch(e){
console.log(e);
throw e;
}
});
_399.addErrback(function(_39b){
throw _39b;
});
}else{
if(this._jsonData){
self._arrayOfAllItems=self._getItemsFromLoadedData(self._jsonData);
self._jsonData=null;
self._loadFinished=true;
}
}
}});
dojo.extend(dojo.data.JsonItemStore,dojo.data.util.simpleFetch);
}
if(!dojo._hasResource["dijit.form._DropDownTextBox"]){
dojo._hasResource["dijit.form._DropDownTextBox"]=true;
dojo.provide("dijit.form._DropDownTextBox");
dojo.declare("dijit.form._DropDownTextBox",null,{templateString:"<fieldset class='dijit dijitInline dijitLeft ${baseClass}'  baseClass='${baseClass}'\n\tid=\"widget_${id}\" name=\"${name}\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;\"\twaiRole=\"presentation\"\n>\n<table cellspacing=0 cellpadding=0 waiRole=\"presentation\">\n\t<tr>\n\t\t<td class='dijitReset dijitStretch dijitComboBoxInput'\n\t\t\t><input class='XdijitInputField' type=\"text\" autocomplete=\"off\" name=\"${name}\"\n\t\t\tdojoAttachEvent=\"onkeypress; onkeyup; onfocus; onblur; compositionend;\"\n\t\t\tdojoAttachPoint=\"textbox;focusNode\" id='${id}'\n\t\t\ttabIndex='${tabIndex}' size='${size}' maxlength='${maxlength}'\n\t\t\twaiRole=\"combobox\"\n\t></td><td class='dijitReset dijitRight dijitButtonNode dijitDownArrowButton'\n\t\t\tdojoAttachPoint=\"downArrowNode\"\n\t\t\tdojoAttachEvent=\"onklick:_onArrowClick;onmousedown:_onMouse;onmouseup:_onMouse;onmouseover:_onMouse;onmouseout:_onMouse;\"\n\t\t><div waiRole=\"presentation\">&#9660;</div>\n\t</td></tr>\n</table>\n</fieldset>\n",baseClass:"dijitComboBox",hasDownArrow:true,_popupWidget:null,_hasMasterPopup:false,_popupClass:"",_popupArgs:{},_hasFocus:false,_arrowPressed:function(){
if(!this.disabled&&this.hasDownArrow){
dojo.addClass(this.downArrowNode,"dijitArrowButtonActive");
}
},_arrowIdle:function(){
if(!this.disabled&&this.hasDownArrow){
dojo.removeClass(this.downArrowNode,"dojoArrowButtonPushed");
}
},makePopup:function(){
var _39c=this;
function _createNewPopup(){
var node=document.createElement("div");
document.body.appendChild(node);
var _39e=dojo.getObject(_39c._popupClass,false);
return new _39e(_39c._popupArgs,node);
};
if(!this._popupWidget){
if(this._hasMasterPopup){
var _39f=dojo.getObject(this.declaredClass,false);
if(!_39f.prototype._popupWidget){
_39f.prototype._popupWidget=_createNewPopup();
}
this._popupWidget=_39f.prototype._popupWidget;
}else{
this._popupWidget=_createNewPopup();
}
}
},_onArrowClick:function(){
if(this.disabled){
return;
}
this.focus();
this.makePopup();
if(this._isShowingNow){
this._hideResultList();
}else{
this._openResultList();
}
},_hideResultList:function(){
if(this._isShowingNow){
dijit.util.popup.close();
this._arrowIdle();
}
},_openResultList:function(){
this._showResultList();
},onfocus:function(){
this._hasFocus=true;
},onblur:function(){
this._arrowIdle();
this._hasFocus=false;
dojo.removeClass(this.nodeWithBorder,"dijitInputFieldFocused");
this.validate(false);
},onkeypress:function(evt){
if(evt.ctrlKey||evt.altKey){
return;
}
switch(evt.keyCode){
case dojo.keys.PAGE_DOWN:
case dojo.keys.DOWN_ARROW:
if(!this._isShowingNow||this._prev_key_esc){
this.makePopup();
this._arrowPressed();
this._openResultList();
}
dojo.stopEvent(evt);
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
case dojo.keys.PAGE_UP:
case dojo.keys.UP_ARROW:
case dojo.keys.ENTER:
dojo.stopEvent(evt);
case dojo.keys.ESCAPE:
case dojo.keys.TAB:
if(this._isShowingNow){
this._prev_key_backspace=false;
this._prev_key_esc=(evt.keyCode==dojo.keys.ESCAPE);
this._hideResultList();
}
break;
}
},compositionend:function(evt){
this.onkeypress({charCode:-1});
},_showResultList:function(){
this._hideResultList();
var _3a2=this._popupWidget.getListLength?this._popupWidget.getItems():[this._popupWidget.domNode];
if(_3a2.length){
var _3a3=Math.min(_3a2.length,this.maxListLength);
with(this._popupWidget.domNode.style){
display="";
width="";
height="";
}
this._arrowPressed();
this._displayMessage("");
var best=this.open();
var _3a5=dojo.marginBox(this._popupWidget.domNode);
this._popupWidget.domNode.style.overflow=((best.h==_3a5.h)&&(best.w==_3a5.w))?"hidden":"auto";
dojo.marginBox(this._popupWidget.domNode,{h:best.h,w:Math.max(best.w,this.domNode.offsetWidth)});
}
},getDisplayedValue:function(){
return this.textbox.value;
},setDisplayedValue:function(_3a6){
this.textbox.value=_3a6;
},uninitialize:function(){
if(this._popupWidget){
this._hideResultList();
this._popupWidget.destroy();
}
},open:function(){
this.makePopup();
var self=this;
self._isShowingNow=true;
return dijit.util.popup.open({popup:this._popupWidget,around:this.domNode,onClose:function(){
self._isShowingNow=false;
}});
},postMixInProperties:function(){
this.baseClass=this.hasDownArrow?this.baseClass:this.baseClass+"NoArrow";
}});
}
if(!dojo._hasResource["dijit.form.Textbox"]){
dojo._hasResource["dijit.form.Textbox"]=true;
dojo.provide("dijit.form.Textbox");
dojo.declare("dijit.form.Textbox",dijit.form._FormWidget,{trim:false,uppercase:false,lowercase:false,propercase:false,size:"20",maxlength:"999999",templateString:"<input dojoAttachPoint='textbox;focusNode' dojoAttachEvent='onblur;onfocus;onkeyup'\n\tid='${id}' name='${name}' class=\"dijitInputField\" type='${type}' size='${size}' maxlength='${maxlength}' tabIndex='${tabIndex}'>\n",getTextValue:function(){
return this.filter(this.textbox.value);
},getValue:function(){
return this.parse(this.getTextValue(),this.constraints);
},setValue:function(_3a8,_3a9){
if(typeof _3a9=="undefined"){
_3a9=(typeof _3a8=="undefined"||_3a8==null||_3a8==NaN)?null:this.filter(this.format(_3a8,this.constraints));
}
if(_3a9!=null){
this.textbox.value=_3a9;
}
dijit.form.Textbox.superclass.setValue.call(this,_3a8);
},forWaiValuenow:function(){
return this.getTextValue();
},format:function(_3aa,_3ab){
return _3aa;
},parse:function(_3ac,_3ad){
return _3ac;
},postCreate:function(){
dijit.form.Textbox.superclass.postCreate.apply(this);
if(typeof this.nodeWithBorder!="object"){
this.nodeWithBorder=this.textbox;
}
this.setValue(this.value);
this.textbox.setAttribute("value",this.getTextValue());
},filter:function(val){
if(val==null){
return null;
}
if(this.trim){
val=val.replace(/(^\s*|\s*$)/g,"");
}
if(this.uppercase){
val=val.toUpperCase();
}
if(this.lowercase){
val=val.toLowerCase();
}
if(this.propercase){
val=val.replace(/[^\s]+/g,function(word){
return word.substring(0,1).toUpperCase()+word.substring(1);
});
}
return val;
},focus:function(){
this.textbox.focus();
},onfocus:function(){
dojo.addClass(this.nodeWithBorder,"dijitInputFieldFocused");
},onblur:function(){
dojo.removeClass(this.nodeWithBorder,"dijitInputFieldFocused");
this.setValue(this.getValue());
},onkeyup:function(){
}});
}
if(!dojo._hasResource["dijit.form.ValidationTextbox"]){
dojo._hasResource["dijit.form.ValidationTextbox"]=true;
dojo.provide("dijit.form.ValidationTextbox");
dojo.requireLocalization("dijit.form","validate",null,"zh-cn,ja,it,ROOT,fr,de");
dojo.declare("dijit.form.ValidationTextbox",dijit.form.Textbox,{required:false,promptMessage:"",invalidMessage:"",listenOnKeyPress:true,constraints:{},regExp:".*",regExpGen:function(_3b0){
return this.regExp;
},setValue:function(){
dijit.form.ValidationTextbox.superclass.setValue.apply(this,arguments);
this.validate(false);
},validator:function(_3b1,_3b2){
return (new RegExp("^("+this.regExpGen(_3b2)+")$")).test(_3b1);
},isValid:function(_3b3){
return this.validator(this.textbox.value,this.constraints);
},isEmpty:function(){
return /^\s*$/.test(this.textbox.value);
},isMissing:function(_3b4){
return this.required&&this.isEmpty();
},getErrorMessage:function(_3b5){
return this.invalidMessage;
},getPromptMessage:function(_3b6){
return this.promptMessage;
},validate:function(_3b7){
if(!this.isValid(_3b7)){
this.updateClass("Error");
var _3b8=this.getErrorMessage(_3b7);
}else{
this.updateClass(this.isMissing()?"Warning":"Normal");
var _3b8="";
}
if(this.isEmpty()){
var _3b9=this.getPromptMessage(_3b7);
if(_3b9){
_3b8=_3b9;
}
}
this._displayMessage(_3b7?_3b8:"");
},_message:"",_displayMessage:function(_3ba){
if(this._message==_3ba){
return;
}
this._message=_3ba;
this.displayMessage(_3ba);
},displayMessage:function(_3bb){
if(_3bb){
dijit.MasterTooltip.show(_3bb,this.domNode);
}else{
dijit.MasterTooltip.hide();
}
},updateClass:function(_3bc){
var _3bd=this;
dojo.forEach(["Normal","Warning","Error"],function(_3be){
dojo.removeClass(_3bd.nodeWithBorder,"dijitInputFieldValidation"+_3be);
});
dojo.addClass(this.nodeWithBorder,"dijitInputFieldValidation"+_3bc);
},onblur:function(evt){
this.validate(false);
dijit.form.ValidationTextbox.superclass.onblur.apply(this,arguments);
},onfocus:function(evt){
dijit.form.ValidationTextbox.superclass.onfocus.apply(this,arguments);
if(this.listenOnKeyPress){
this.validate(true);
}else{
this.updateClass("Warning");
}
},onkeyup:function(evt){
this.onfocus(evt);
},postMixInProperties:function(){
if(this.constraints==dijit.form.ValidationTextbox.prototype.constraints){
this.constraints={};
}
dijit.form.ValidationTextbox.superclass.postMixInProperties.apply(this,arguments);
this.constraints.locale=this.lang;
this.messages=dojo.i18n.getLocalization("dijit.form","validate",this.lang);
dojo.forEach(["invalidMessage","missingMessage"],function(prop){
if(!this[prop]){
this[prop]=this.messages[prop];
}
},this);
var p=this.regExpGen(this.constraints);
this.regExp=p;
}});
dojo.declare("dijit.form.MappedTextbox",dijit.form.ValidationTextbox,{serialize:function(val){
return val.toString();
},toString:function(){
var val=this.getValue();
return val?((typeof val=="string")?val:this.serialize(val)):"";
},validate:function(){
this.valueNode.value=this.toString();
dijit.form.MappedTextbox.superclass.validate.apply(this,arguments);
},postCreate:function(){
var _3c6=this.textbox;
var _3c7=(this.valueNode=document.createElement("input"));
_3c7.setAttribute("type",_3c6.type);
_3c7.setAttribute("value",this.toString());
dojo.style(_3c7,"display","none");
_3c7.name=this.textbox.name;
this.textbox.removeAttribute("name");
dojo.place(_3c7,_3c6,"after");
dijit.form.MappedTextbox.superclass.postCreate.apply(this,arguments);
}});
dojo.declare("dijit.form.RangeBoundTextbox",dijit.form.MappedTextbox,{rangeMessage:"",compare:function(val1,val2){
return val1-val2;
},rangeCheck:function(_3ca,_3cb){
var _3cc=(typeof _3cb.min!="undefined");
var _3cd=(typeof _3cb.max!="undefined");
if(_3cc||_3cd){
return (!_3cc||this.compare(_3ca,_3cb.min)>=0)&&(!_3cd||this.compare(_3ca,_3cb.max)<=0);
}else{
return true;
}
},isInRange:function(_3ce){
return this.rangeCheck(this.getValue(),this.constraints);
},isValid:function(_3cf){
return dijit.form.RangeBoundTextbox.superclass.isValid.call(this,_3cf)&&this.isInRange(_3cf);
},getErrorMessage:function(_3d0){
if(dijit.form.RangeBoundTextbox.superclass.isValid.call(this,false)&&!this.isInRange(_3d0)){
return this.rangeMessage;
}else{
return dijit.form.RangeBoundTextbox.superclass.getErrorMessage.apply(this,arguments);
}
},postMixInProperties:function(){
dijit.form.RangeBoundTextbox.superclass.postMixInProperties.apply(this,arguments);
if(!this.rangeMessage){
this.messages=dojo.i18n.getLocalization("dijit.form","validate",this.lang);
this.rangeMessage=this.messages.rangeMessage;
}
},postCreate:function(){
dijit.form.RangeBoundTextbox.superclass.postCreate.apply(this,arguments);
if(typeof this.constraints.min!="undefined"){
dijit.util.wai.setAttr(this.domNode,"waiState","valuemin",this.constraints.min);
}
if(typeof this.constraints.max!="undefined"){
dijit.util.wai.setAttr(this.domNode,"waiState","valuemax",this.constraints.max);
}
}});
}
if(!dojo._hasResource["dijit.form.ComboBox"]){
dojo._hasResource["dijit.form.ComboBox"]=true;
dojo.provide("dijit.form.ComboBox");
dojo.declare("dijit.form.ComboBoxMixin",dijit.form._DropDownTextBox,{searchLimit:Infinity,store:null,autoComplete:true,searchDelay:100,searchAttr:"name",ignoreCase:true,_hasMasterPopup:true,_popupClass:"dijit.form._ComboBoxMenu",getValue:function(){
return dijit.form.Textbox.superclass.getValue.apply(this,arguments);
},setDisplayedValue:function(_3d1){
this.setValue(_3d1);
},_getCaretPos:function(_3d2){
if(typeof (_3d2.selectionStart)=="number"){
return _3d2.selectionStart;
}else{
if(dojo.isIE){
var tr=document.selection.createRange().duplicate();
var ntr=_3d2.createTextRange();
tr.move("character",0);
ntr.move("character",0);
try{
ntr.setEndPoint("EndToEnd",tr);
return String(ntr.text).replace(/\r/g,"").length;
}
catch(e){
return 0;
}
}
}
},_setCaretPos:function(_3d5,_3d6){
_3d6=parseInt(_3d6);
this._setSelectedRange(_3d5,_3d6,_3d6);
},_setSelectedRange:function(_3d7,_3d8,end){
if(!end){
end=_3d7.value.length;
}
if(_3d7.setSelectionRange){
_3d7.focus();
_3d7.setSelectionRange(_3d8,end);
}else{
if(_3d7.createTextRange){
var _3da=_3d7.createTextRange();
with(_3da){
collapse(true);
moveEnd("character",end);
moveStart("character",_3d8);
select();
}
}else{
_3d7.value=_3d7.value;
_3d7.blur();
_3d7.focus();
var dist=parseInt(_3d7.value.length)-end;
var _3dc=String.fromCharCode(37);
var tcc=_3dc.charCodeAt(0);
for(var x=0;x<dist;x++){
var te=document.createEvent("KeyEvents");
te.initKeyEvent("keypress",true,true,null,false,false,false,false,tcc,tcc);
_3d7.dispatchEvent(te);
}
}
}
},onkeypress:function(evt){
if(evt.ctrlKey||evt.altKey){
return;
}
var _3e1=false;
switch(evt.keyCode){
case dojo.keys.PAGE_DOWN:
case dojo.keys.DOWN_ARROW:
if(!this._isShowingNow||this._prev_key_esc){
this._arrowPressed();
_3e1=true;
}else{
evt.keyCode==dojo.keys.PAGE_DOWN?this._popupWidget.pageDown():this._popupWidget._highlightNextOption();
this._announceOption(this._popupWidget.getHighlightedOption());
}
dojo.stopEvent(evt);
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
case dojo.keys.PAGE_UP:
case dojo.keys.UP_ARROW:
if(this._isShowingNow){
evt.keyCode==dojo.keys.PAGE_UP?this._popupWidget.pageUp():this._popupWidget._highlightPrevOption();
this._announceOption(this._popupWidget.getHighlightedOption());
}
dojo.stopEvent(evt);
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
case dojo.keys.ENTER:
dojo.stopEvent(evt);
case dojo.keys.TAB:
if(this._isShowingNow){
this._prev_key_backspace=false;
this._prev_key_esc=false;
if(this._popupWidget.getHighlightedOption()){
this._popupWidget.setValue({target:this._popupWidget.getHighlightedOption()});
}else{
this.setDisplayedValue(this.getDisplayedValue());
}
this._hideResultList();
}else{
this.setDisplayedValue(this.getDisplayedValue());
}
break;
case dojo.keys.SPACE:
this._prev_key_backspace=false;
this._prev_key_esc=false;
if(this._isShowingNow&&this._highlighted_option){
dojo.stopEvent(evt);
this._selectOption();
this._hideResultList();
}else{
_3e1=true;
}
break;
case dojo.keys.ESCAPE:
this._prev_key_backspace=false;
this._prev_key_esc=true;
this._hideResultList();
this.setValue(this.getValue());
break;
case dojo.keys.DELETE:
case dojo.keys.BACKSPACE:
this._prev_key_esc=false;
this._prev_key_backspace=true;
_3e1=true;
break;
case dojo.keys.RIGHT_ARROW:
case dojo.keys.LEFT_ARROW:
this._prev_key_backspace=false;
this._prev_key_esc=false;
break;
default:
this._prev_key_backspace=false;
this._prev_key_esc=false;
if(evt.charCode!=0){
_3e1=true;
}
}
if(this.searchTimer){
clearTimeout(this.searchTimer);
}
if(_3e1){
this.searchTimer=setTimeout(dojo.hitch(this,this._startSearchFromInput),this.searchDelay);
}
},_autoCompleteText:function(text){
this._setSelectedRange(this.focusNode,this.focusNode.value.length,this.focusNode.value.length);
if(new RegExp("^"+this.focusNode.value,this.ignoreCase?"i":"").test(text)){
var cpos=this._getCaretPos(this.focusNode);
if((cpos+1)>this.focusNode.value.length){
this.focusNode.value=text;
this._setSelectedRange(this.focusNode,cpos,this.focusNode.value.length);
}
}else{
this.focusNode.value=text;
this._setSelectedRange(this.focusNode,0,this.focusNode.value.length);
}
},_openResultList:function(_3e4,_3e5){
if(this.disabled||_3e5.query[this.searchAttr]!=this._lastQuery){
return;
}
this._popupWidget.clearResultList();
if(!_3e4.length){
this._hideResultList();
return;
}
var _3e6=new String(this.store.getValue(_3e4[0],this.searchAttr));
if(_3e6&&(this.autoComplete)&&(!this._prev_key_backspace)&&(_3e5.query[this.searchAttr]!="*")){
this._autoCompleteText(_3e6);
dijit.util.wai.setAttr(this.focusNode||this.domNode,"waiState","valuenow",_3e6);
}
for(var i=0;i<_3e4.length;i++){
var tr=_3e4[i];
if(tr){
var td=this._createOption(tr);
td.className="dijitMenuItem";
this._popupWidget.addItem(td);
}
}
this._showResultList();
},_createOption:function(tr){
var td=document.createElement("div");
td.appendChild(document.createTextNode(this.store.getValue(tr,this.searchAttr)));
if(td.innerHTML==""){
td.innerHTML="&nbsp;";
}
td.item=tr;
return td;
},onfocus:function(){
dijit.form._DropDownTextBox.prototype.onfocus.apply(this,arguments);
this.parentClass.onfocus.apply(this,arguments);
},onblur:function(){
dijit.form._DropDownTextBox.prototype.onblur.apply(this,arguments);
if(!this._isShowingNow){
this.setDisplayedValue(this.getDisplayedValue());
}
},_announceOption:function(node){
if(node==null){
return;
}
var _3ed=this.store.getValue(node.item,this.searchAttr);
this.focusNode.value=this.focusNode.value.substring(0,this._getCaretPos(this.focusNode));
this._autoCompleteText(_3ed);
},_selectOption:function(evt){
var tgt=null;
if(!evt){
evt={target:this._popupWidget.getHighlightedOption()};
}
if(!evt.target){
this.setDisplayedValue(this.getDisplayedValue());
return;
}else{
tgt=evt.target;
}
this._doSelect(tgt);
if(!evt.noHide){
this._hideResultList();
this._setSelectedRange(this.focusNode,0,null);
}
this.focus();
},_doSelect:function(tgt){
this.setValue(this.store.getValue(tgt.item,this.searchAttr));
},_onArrowClick:function(){
if(this.disabled){
return;
}
this.focus();
this.makePopup();
if(this._isShowingNow){
this._hideResultList();
}else{
this._startSearch("");
}
},_startSearchFromInput:function(){
this._startSearch(this.focusNode.value);
},_startSearch:function(key){
this.makePopup();
var _3f2={};
this._lastQuery=_3f2[this.searchAttr]=key+"*";
this.store.fetch({queryOptions:{ignoreCase:this.ignoreCase},query:_3f2,onComplete:dojo.hitch(this,"_openResultList"),count:this.searchLimit});
},_getValueField:function(){
return this.searchAttr;
},postMixInProperties:function(){
dijit.form._DropDownTextBox.prototype.postMixInProperties.apply(this,arguments);
if(!this.store){
var _3f3=dojo.query("> option",this.srcNodeRef).map(function(node){
return {value:node.getAttribute("value"),name:String(node.innerHTML)};
});
this.store=new dojo.data.JsonItemStore({data:{identifier:this._getValueField(),items:_3f3}});
if(_3f3&&_3f3.length&&!this.value){
this.value=_3f3[0][this._getValueField()];
}
this.srcNodeRef.innerHTML="";
}
},postCreate:function(){
this.parentClass=dojo.getObject(this.declaredClass,false).superclass;
this.parentClass.postCreate.apply(this,arguments);
},open:function(){
this._popupWidget.onValueChanged=dojo.hitch(this,this._selectOption);
this._popupWidget._onkeypresshandle=this.connect(this._popupWidget.domNode,"onkeypress","onkeypress");
return dijit.form._DropDownTextBox.prototype.open.apply(this,arguments);
}});
dojo.declare("dijit.form._ComboBoxMenu",dijit.form._FormWidget,{templateString:"<div class='dijitMenu' dojoAttachEvent='onclick; onmouseover; onmouseout;' tabIndex='-1' style='display:none; position:absolute; overflow:\"auto\";'></div>",_onkeypresshandle:null,postCreate:function(){
dijit.form._FormWidget.prototype.postCreate.apply(this,arguments);
},onClose:function(){
this.disconnect(this._onkeypresshandle);
this._blurOptionNode();
},addItem:function(item){
this.domNode.appendChild(item);
},clearResultList:function(){
this.domNode.innerHTML="";
},getItems:function(){
return this.domNode.childNodes;
},getListLength:function(){
return this.domNode.childNodes.length;
},onclick:function(evt){
if(evt.target===this.domNode){
return;
}
var tgt=evt.target;
while(!tgt.item){
tgt=tgt.parentNode;
}
this.setValue({target:tgt});
},onmouseover:function(evt){
if(evt.target===this.domNode){
return;
}
this._focusOptionNode(evt.target);
},onmouseout:function(evt){
if(evt.target===this.domNode){
return;
}
this._blurOptionNode();
},_focusOptionNode:function(node){
if(this._highlighted_option!=node){
this._blurOptionNode();
this._highlighted_option=node;
dojo.addClass(this._highlighted_option,"dijitMenuItemHover");
}
},_blurOptionNode:function(){
if(this._highlighted_option){
dojo.removeClass(this._highlighted_option,"dijitMenuItemHover");
this._highlighted_option=null;
}
},_highlightNextOption:function(){
if(!this.getHighlightedOption()){
this._focusOptionNode(this.domNode.firstChild);
}else{
if(this._highlighted_option.nextSibling){
this._focusOptionNode(this._highlighted_option.nextSibling);
}
}
dijit.util.scroll.scrollIntoView(this._highlighted_option);
},_highlightPrevOption:function(){
if(!this.getHighlightedOption()){
dijit.util.popup.close(true);
return;
}else{
if(this._highlighted_option.previousSibling){
this._focusOptionNode(this._highlighted_option.previousSibling);
}
}
dijit.util.scroll.scrollIntoView(this._highlighted_option);
},_page:function(up){
var _3fc=0;
var _3fd=this.domNode.scrollTop;
var _3fe=parseInt(dojo.getComputedStyle(this.domNode).height);
if(!this.getHighlightedOption()){
this._highlightNextOption();
}
while(_3fc<_3fe){
if(up){
if(!this.getHighlightedOption().previousSibling){
break;
}
this._highlightPrevOption();
}else{
if(!this.getHighlightedOption().nextSibling){
break;
}
this._highlightNextOption();
}
var _3ff=this.domNode.scrollTop;
_3fc+=(_3ff-_3fd)*(up?-1:1);
_3fd=_3ff;
}
},pageUp:function(){
this._page(true);
},pageDown:function(){
this._page(false);
},getHighlightedOption:function(){
return this._highlighted_option&&this._highlighted_option.parentNode?this._highlighted_option:null;
}});
dojo.declare("dijit.form.ComboBox",[dijit.form.ValidationTextbox,dijit.form.ComboBoxMixin],{});
}
if(!dojo._hasResource["dojo.cldr.monetary"]){
dojo._hasResource["dojo.cldr.monetary"]=true;
dojo.provide("dojo.cldr.monetary");
dojo.cldr.monetary.getData=function(code){
var _401={ADP:0,BHD:3,BIF:0,BYR:0,CLF:0,CLP:0,DJF:0,ESP:0,GNF:0,IQD:3,ITL:0,JOD:3,JPY:0,KMF:0,KRW:0,KWD:3,LUF:0,LYD:3,MGA:0,MGF:0,OMR:3,PYG:0,RWF:0,TND:3,TRL:0,VUV:0,XAF:0,XOF:0,XPF:0};
var _402={CHF:5};
var _403=_401[code],_404=_402[code];
if(typeof _403=="undefined"){
_403=2;
}
if(typeof _404=="undefined"){
_404=0;
}
return {places:_403,round:_404};
};
}
if(!dojo._hasResource["dojo.currency"]){
dojo._hasResource["dojo.currency"]=true;
dojo.provide("dojo.currency");
dojo.requireLocalization("dojo.cldr","currency",null,"ko,zh,ja,en,en-ca,en-au,ROOT,en-us,it,fr,pt,es,de");
dojo.currency._mixInDefaults=function(_405){
_405=_405||{};
_405.type="currency";
var _406=dojo.i18n.getLocalization("dojo.cldr","currency",_405.locale)||{};
var iso=_405.currency;
var data=dojo.cldr.monetary.getData(iso);
dojo.forEach(["displayName","symbol","group","decimal"],function(prop){
data[prop]=_406[iso+"_"+prop];
});
data.fractional=[true,false];
return dojo.mixin(data,_405);
};
dojo.currency.format=function(_40a,_40b){
return dojo.number.format(_40a,dojo.currency._mixInDefaults(_40b));
};
dojo.currency.regexp=function(_40c){
return dojo.number.regexp(dojo.currency._mixInDefaults(_40c));
};
dojo.currency.parse=function(_40d,_40e){
return dojo.number.parse(_40d,dojo.currency._mixInDefaults(_40e));
};
}
if(!dojo._hasResource["dijit.form.CurrencyTextbox"]){
dojo._hasResource["dijit.form.CurrencyTextbox"]=true;
dojo.provide("dijit.form.CurrencyTextbox");
dojo.declare("dijit.form.CurrencyTextbox",dijit.form.NumberTextbox,{currency:"",regExpGen:dojo.currency.regexp,format:dojo.currency.format,parse:dojo.currency.parse,postMixInProperties:function(){
if(this.constraints===dijit.form.ValidationTextbox.prototype.constraints){
this.constraints={};
}
this.constraints.currency=this.currency;
dijit.form.CurrencyTextbox.superclass.postMixInProperties.apply(this,arguments);
}});
}
if(!dojo._hasResource["dojo.cldr.supplemental"]){
dojo._hasResource["dojo.cldr.supplemental"]=true;
dojo.provide("dojo.cldr.supplemental");
dojo.cldr.supplemental.getFirstDayOfWeek=function(_40f){
var _410={mv:5,ae:6,af:6,bh:6,dj:6,dz:6,eg:6,er:6,et:6,iq:6,ir:6,jo:6,ke:6,kw:6,lb:6,ly:6,ma:6,om:6,qa:6,sa:6,sd:6,so:6,tn:6,ye:6,as:0,au:0,az:0,bw:0,ca:0,cn:0,fo:0,ge:0,gl:0,gu:0,hk:0,ie:0,il:0,is:0,jm:0,jp:0,kg:0,kr:0,la:0,mh:0,mo:0,mp:0,mt:0,nz:0,ph:0,pk:0,sg:0,th:0,tt:0,tw:0,um:0,us:0,uz:0,vi:0,za:0,zw:0,et:0,mw:0,ng:0,tj:0,gb:0,sy:4};
var _411=dojo.cldr.supplemental._region(_40f);
var dow=_410[_411];
return (typeof dow=="undefined")?1:dow;
};
dojo.cldr.supplemental._region=function(_413){
_413=dojo.i18n.normalizeLocale(_413);
var tags=_413.split("-");
var _415=tags[1];
if(!_415){
_415={de:"de",en:"us",es:"es",fi:"fi",fr:"fr",hu:"hu",it:"it",ja:"jp",ko:"kr",nl:"nl",pt:"br",sv:"se",zh:"cn"}[tags[0]];
}else{
if(_415.length==4){
_415=tags[2];
}
}
return _415;
};
dojo.cldr.supplemental.getWeekend=function(_416){
var _417={eg:5,il:5,sy:5,"in":0,ae:4,bh:4,dz:4,iq:4,jo:4,kw:4,lb:4,ly:4,ma:4,om:4,qa:4,sa:4,sd:4,tn:4,ye:4};
var _418={ae:5,bh:5,dz:5,iq:5,jo:5,kw:5,lb:5,ly:5,ma:5,om:5,qa:5,sa:5,sd:5,tn:5,ye:5,af:5,ir:5,eg:6,il:6,sy:6};
var _419=dojo.cldr.supplemental._region(_416);
var _41a=_417[_419];
var end=_418[_419];
if(typeof _41a=="undefined"){
_41a=6;
}
if(typeof end=="undefined"){
end=0;
}
return {start:_41a,end:end};
};
}
if(!dojo._hasResource["dojo.date"]){
dojo._hasResource["dojo.date"]=true;
dojo.provide("dojo.date");
dojo.date.getDaysInMonth=function(_41c){
var _41d=_41c.getMonth();
var days=[31,28,31,30,31,30,31,31,30,31,30,31];
if(_41d==1&&dojo.date.isLeapYear(_41c)){
return 29;
}
return days[_41d];
};
dojo.date.isLeapYear=function(_41f){
var year=_41f.getFullYear();
return !(year%400)||(!(year%4)&&!!(year%100));
};
dojo.date.getTimezoneName=function(_421){
var str=_421.toString();
var tz="";
var _424;
var pos=str.indexOf("(");
if(pos>-1){
tz=str.substring(++pos,str.indexOf(")"));
}else{
var pat=/([A-Z\/]+) \d{4}$/;
if((_424=str.match(pat))){
tz=_424[1];
}else{
str=_421.toLocaleString();
pat=/ ([A-Z\/]+)$/;
if((_424=str.match(pat))){
tz=_424[1];
}
}
}
return (tz=="AM"||tz=="PM")?"":tz;
};
dojo.date.compare=function(_427,_428,_429){
_427=new Date(Number(_427));
_428=new Date(Number(_428||new Date()));
if(typeof _429!=="undefined"){
if(_429=="date"){
_427.setHours(0,0,0,0);
_428.setHours(0,0,0,0);
}else{
if(_429=="time"){
_427.setFullYear(0,0,0);
_428.setFullYear(0,0,0);
}
}
}
if(_427>_428){
return 1;
}
if(_427<_428){
return -1;
}
return 0;
};
dojo.date.add=function(date,_42b,_42c){
var sum=new Date(Number(date));
var _42e=false;
var _42f="Date";
switch(_42b){
case "day":
break;
case "weekday":
var _430=date.getDate();
var _431=0;
var days=0;
var strt=0;
var trgt=0;
var adj=0;
var mod=_42c%5;
if(!mod){
days=(_42c>0)?5:-5;
_431=(_42c>0)?((_42c-5)/5):((_42c+5)/5);
}else{
days=mod;
_431=parseInt(_42c/5);
}
strt=date.getDay();
if(strt==6&&_42c>0){
adj=1;
}else{
if(strt==0&&_42c<0){
adj=-1;
}
}
trgt=strt+days;
if(trgt==0||trgt==6){
adj=(_42c>0)?2:-2;
}
_42c=_430+7*_431+days+adj;
break;
case "year":
_42f="FullYear";
_42e=true;
break;
case "week":
_42c*=7;
break;
case "quarter":
_42c*=3;
case "month":
_42e=true;
_42f="Month";
break;
case "hour":
case "minute":
case "second":
case "millisecond":
_42f=_42b.charAt(0).toUpperCase()+_42b.substring(1)+"s";
}
if(_42f){
sum["set"+_42f](sum["get"+_42f]()+_42c);
}
if(_42e&&(sum.getDate()<date.getDate())){
sum.setDate(0);
}
return sum;
};
dojo.date.difference=function(_437,_438,_439){
_438=_438||new Date();
_439=_439||"day";
var _43a=_438.getFullYear()-_437.getFullYear();
var _43b=1;
switch(_439){
case "quarter":
var m1=_437.getMonth();
var m2=_438.getMonth();
var q1=Math.floor(m1/3)+1;
var q2=Math.floor(m2/3)+1;
q2+=(_43a*4);
_43b=q2-q1;
break;
case "weekday":
var days=Math.round(dojo.date.difference(_437,_438,"day"));
var _441=parseInt(dojo.date.difference(_437,_438,"week"));
var mod=days%7;
if(mod==0){
days=_441*5;
}else{
var adj=0;
var aDay=_437.getDay();
var bDay=_438.getDay();
_441=parseInt(days/7);
mod=days%7;
var _446=new Date(_437);
_446.setDate(_446.getDate()+(_441*7));
var _447=_446.getDay();
if(days>0){
switch(true){
case aDay==6:
adj=-1;
break;
case aDay==0:
adj=0;
break;
case bDay==6:
adj=-1;
break;
case bDay==0:
adj=-2;
break;
case (_447+mod)>5:
adj=-2;
break;
default:
break;
}
}else{
if(days<0){
switch(true){
case aDay==6:
adj=0;
break;
case aDay==0:
adj=1;
break;
case bDay==6:
adj=2;
break;
case bDay==0:
adj=1;
break;
case (_447+mod)<0:
adj=2;
break;
default:
break;
}
}
}
days+=adj;
days-=(_441*2);
}
_43b=days;
break;
case "year":
_43b=_43a;
break;
case "month":
_43b=(_438.getMonth()-_437.getMonth())+(_43a*12);
break;
case "week":
_43b=parseInt(dojo.date.difference(_437,_438,"day")/7);
break;
case "day":
_43b/=24;
case "hour":
_43b/=60;
case "minute":
_43b/=60;
case "second":
_43b/=1000;
case "millisecond":
_43b*=_438.getTime()-_437.getTime();
}
return Math.round(_43b);
};
}
if(!dojo._hasResource["dojo.date.locale"]){
dojo._hasResource["dojo.date.locale"]=true;
dojo.provide("dojo.date.locale");
dojo.requireLocalization("dojo.cldr","gregorian",null,"ko,zh-cn,zh,ja,en,it-it,en-ca,en-au,it,en-gb,es-es,fr,pt,ROOT,ko-kr,es,de,pt-br");
(function(){
function formatPattern(_448,_449,_44a){
return _44a.replace(/([a-z])\1*/ig,function(_44b){
var s;
var c=_44b.charAt(0);
var l=_44b.length;
var pad;
var _450=["abbr","wide","narrow"];
switch(c){
case "G":
s=_449.eras[_448.getFullYear()<0?1:0];
break;
case "y":
s=_448.getFullYear();
switch(l){
case 1:
break;
case 2:
s=String(s);
s=s.substr(s.length-2);
break;
default:
pad=true;
}
break;
case "Q":
case "q":
s=Math.ceil((_448.getMonth()+1)/3);
pad=true;
break;
case "M":
case "L":
var m=_448.getMonth();
var _452;
switch(l){
case 1:
case 2:
s=m+1;
pad=true;
break;
case 3:
case 4:
case 5:
_452=_450[l-3];
break;
}
if(_452){
var type=(c=="L")?"standalone":"format";
var prop=["months",type,_452].join("-");
s=_449[prop][m];
}
break;
case "w":
var _455=0;
s=dojo.date.locale._getWeekOfYear(_448,_455);
pad=true;
break;
case "d":
s=_448.getDate();
pad=true;
break;
case "D":
s=dojo.date.locale._getDayOfYear(_448);
pad=true;
break;
case "E":
case "e":
case "c":
var d=_448.getDay();
var _452;
switch(l){
case 1:
case 2:
if(c=="e"){
var _457=dojo.cldr.supplemental.getFirstDayOfWeek(options.locale);
d=(d-_457+7)%7;
}
if(c!="c"){
s=d+1;
pad=true;
break;
}
case 3:
case 4:
case 5:
_452=_450[l-3];
break;
}
if(_452){
var type=(c=="c")?"standalone":"format";
var prop=["days",type,_452].join("-");
s=_449[prop][d];
}
break;
case "a":
var _458=(_448.getHours()<12)?"am":"pm";
s=_449[_458];
break;
case "h":
case "H":
case "K":
case "k":
var h=_448.getHours();
switch(c){
case "h":
s=(h%12)||12;
break;
case "H":
s=h;
break;
case "K":
s=(h%12);
break;
case "k":
s=h||24;
break;
}
pad=true;
break;
case "m":
s=_448.getMinutes();
pad=true;
break;
case "s":
s=_448.getSeconds();
pad=true;
break;
case "S":
s=Math.round(_448.getMilliseconds()*Math.pow(10,l-3));
break;
case "v":
case "z":
s=dojo.date.getTimezoneName(_448);
if(s){
break;
}
l=4;
case "Z":
var _45a=_448.getTimezoneOffset();
var tz=[(_45a<=0?"+":"-"),dojo.string.pad(Math.floor(Math.abs(_45a)/60),2),dojo.string.pad(Math.abs(_45a)%60,2)];
if(l==4){
tz.splice(0,0,"GMT");
tz.splice(3,0,":");
}
s=tz.join("");
break;
default:
throw new Error("dojo.date.locale.format: invalid pattern char: "+_44a);
}
if(pad){
s=dojo.string.pad(s,l);
}
return s;
});
};
dojo.date.locale.format=function(_45c,_45d){
_45d=_45d||{};
var _45e=dojo.i18n.normalizeLocale(_45d.locale);
var _45f=_45d.formatLength||"short";
var _460=dojo.date.locale._getGregorianBundle(_45e);
var str=[];
var _462=dojo.hitch(this,formatPattern,_45c,_460);
if(_45d.selector=="year"){
var year=_45c.getFullYear();
if(_45e.match(/^zh|^ja/)){
year+="\u5e74";
}
return year;
}
if(_45d.selector!="time"){
var _464=_45d.datePattern||_460["dateFormat-"+_45f];
if(_464){
str.push(_processPattern(_464,_462));
}
}
if(_45d.selector!="date"){
var _465=_45d.timePattern||_460["timeFormat-"+_45f];
if(_465){
str.push(_processPattern(_465,_462));
}
}
var _466=str.join(" ");
return _466;
};
dojo.date.locale.regexp=function(_467){
return dojo.date.locale._parseInfo(_467).regexp;
};
dojo.date.locale._parseInfo=function(_468){
_468=_468||{};
var _469=dojo.i18n.normalizeLocale(_468.locale);
var _46a=dojo.date.locale._getGregorianBundle(_469);
var _46b=_468.formatLength||"short";
var _46c=_468.datePattern||_46a["dateFormat-"+_46b];
var _46d=_468.timePattern||_46a["timeFormat-"+_46b];
var _46e;
if(_468.selector=="date"){
_46e=_46c;
}else{
if(_468.selector=="time"){
_46e=_46d;
}else{
_46e=_46c+" "+_46d;
}
}
var _46f=[];
var re=_processPattern(_46e,dojo.hitch(this,_buildDateTimeRE,_46f,_46a,_468));
return {regexp:re,tokens:_46f,bundle:_46a};
};
dojo.date.locale.parse=function(_471,_472){
var info=dojo.date.locale._parseInfo(_472);
var _474=info.tokens,_475=info.bundle;
var re=new RegExp("^"+info.regexp+"$");
var _477=re.exec(_471);
if(!_477){
return null;
}
var _478=["abbr","wide","narrow"];
var _479=new Date(1972,0);
var _47a={};
dojo.forEach(_477,function(v,i){
if(!i){
return;
}
var _47d=_474[i-1];
var l=_47d.length;
switch(_47d.charAt(0)){
case "y":
if(l!=2){
_479.setFullYear(v);
_47a.year=v;
}else{
if(v<100){
v=Number(v);
var year=""+new Date().getFullYear();
var _480=year.substring(0,2)*100;
var _481=Number(year.substring(2,4));
var _482=Math.min(_481+20,99);
var num=(v<_482)?_480+v:_480-100+v;
_479.setFullYear(num);
_47a.year=num;
}else{
if(_472.strict){
return null;
}
_479.setFullYear(v);
_47a.year=v;
}
}
break;
case "M":
if(l>2){
var _484=_475["months-format-"+_478[l-3]].concat();
if(!_472.strict){
v=v.replace(".","").toLowerCase();
_484=dojo.map(_484,function(s){
return s.replace(".","").toLowerCase();
});
}
v=dojo.indexOf(_484,v);
if(v==-1){
return null;
}
}else{
v--;
}
_479.setMonth(v);
_47a.month=v;
break;
case "E":
case "e":
var days=_475["days-format-"+_478[l-3]].concat();
if(!_472.strict){
v=v.toLowerCase();
days=dojo.map(days,"".toLowerCase);
}
v=dojo.indexOf(days,v);
if(v==-1){
return null;
}
break;
case "d":
_479.setDate(v);
_47a.date=v;
break;
case "D":
_479.setMonth(0);
_479.setDate(v);
break;
case "a":
var am=_472.am||_475.am;
var pm=_472.pm||_475.pm;
if(!_472.strict){
var _489=/\./g;
v=v.replace(_489,"").toLowerCase();
am=am.replace(_489,"").toLowerCase();
pm=pm.replace(_489,"").toLowerCase();
}
if(_472.strict&&v!=am&&v!=pm){
return null;
}
var _48a=_479.getHours();
if(v==pm&&_48a<12){
_479.setHours(_48a+12);
}else{
if(v==am&&_48a==12){
_479.setHours(0);
}
}
break;
case "K":
if(v==24){
v=0;
}
case "h":
case "H":
case "k":
if(v>23){
return null;
}
_479.setHours(v);
break;
case "m":
_479.setMinutes(v);
break;
case "s":
_479.setSeconds(v);
break;
case "S":
_479.setMilliseconds(v);
break;
case "w":
default:
}
});
if(_47a.year&&_479.getFullYear()!=_47a.year){
return null;
}
if(_47a.month&&_479.getMonth()!=_47a.month){
return null;
}
if(_47a.date&&_479.getDate()!=_47a.date){
return null;
}
return _479;
};
function _processPattern(_48b,_48c,_48d,_48e){
var _48f=function(x){
return x;
};
_48c=_48c||_48f;
_48d=_48d||_48f;
_48e=_48e||_48f;
var _491=_48b.match(/(''|[^'])+/g);
var _492=false;
dojo.forEach(_491,function(_493,i){
if(!_493){
_491[i]="";
}else{
_491[i]=(_492?_48d:_48c)(_493);
_492=!_492;
}
});
return _48e(_491.join(""));
};
function _buildDateTimeRE(_495,_496,_497,_498){
return dojo.regexp.escapeString(_498).replace(/([a-z])\1*/ig,function(_499){
var s;
var c=_499.charAt(0);
var l=_499.length;
var p2="",p3="";
if(_497.strict){
if(l>1){
p2="0"+"{"+(l-1)+"}";
}
if(l>2){
p3="0"+"{"+(l-2)+"}";
}
}else{
p2="0?";
p3="0{0,2}";
}
switch(c){
case "y":
s="\\d{2,4}";
break;
case "M":
s=(l>2)?"\\S+":p2+"[1-9]|1[0-2]";
break;
case "D":
s=p2+"[1-9]|"+p3+"[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6]";
break;
case "d":
s=p2+"[1-9]|[12]\\d|3[01]";
break;
case "w":
s=p2+"[1-9]|[1-4][0-9]|5[0-3]";
break;
case "E":
s="\\S+";
break;
case "h":
s=p2+"[1-9]|1[0-2]";
break;
case "k":
s=p2+"\\d|1[01]";
break;
case "H":
s=p2+"\\d|1\\d|2[0-3]";
break;
case "K":
s=p2+"[1-9]|1\\d|2[0-4]";
break;
case "m":
case "s":
s="[0-5]\\d";
break;
case "S":
s="\\d{"+l+"}";
break;
case "a":
var am=_497.am||_496.am||"AM";
var pm=_497.pm||_496.pm||"PM";
if(_497.strict){
s=am+"|"+pm;
}else{
s=am+"|"+pm;
if(am!=am.toLowerCase()){
s+="|"+am.toLowerCase();
}
if(pm!=pm.toLowerCase()){
s+="|"+pm.toLowerCase();
}
}
break;
}
if(_495){
_495.push(_499);
}
return "\\s*("+s+")\\s*";
});
};
})();
(function(){
var _4a1=[];
dojo.date.locale.addCustomFormats=function(_4a2,_4a3){
_4a1.push({pkg:_4a2,name:_4a3});
};
dojo.date.locale._getGregorianBundle=function(_4a4){
var _4a5={};
dojo.forEach(_4a1,function(desc){
var _4a7=dojo.i18n.getLocalization(desc.pkg,desc.name,_4a4);
_4a5=dojo.mixin(_4a5,_4a7);
},this);
return _4a5;
};
})();
dojo.date.locale.addCustomFormats("dojo.cldr","gregorian");
dojo.date.locale.getNames=function(item,type,use,_4ab){
var _4ac;
var _4ad=dojo.date.locale._getGregorianBundle(_4ab);
var _4ae=[item,use,type];
if(use=="standAlone"){
_4ac=_4ad[_4ae.join("-")];
}
_4ae[1]="format";
return (_4ac||_4ad[_4ae.join("-")]).concat();
};
dojo.date.locale.isWeekend=function(_4af,_4b0){
var _4b1=dojo.cldr.supplemental.getWeekend(_4b0);
var day=(_4af||new Date()).getDay();
if(_4b1.end<_4b1.start){
_4b1.end+=7;
if(day<_4b1.start){
day+=7;
}
}
return day>=_4b1.start&&day<=_4b1.end;
};
dojo.date.locale._getDayOfYear=function(_4b3){
var _4b4=_4b3.getFullYear();
var _4b5=new Date(_4b4-1,11,31);
return Math.floor((_4b3.getTime()-_4b5.getTime())/(24*60*60*1000));
};
dojo.date.locale._getWeekOfYear=function(_4b6,_4b7){
if(arguments.length==1){
_4b7=0;
}
var _4b8=new Date(_4b6.getFullYear(),0,1);
var day=_4b8.getDay();
_4b8.setDate(_4b8.getDate()-day+_4b7-(day>_4b7?7:0));
return Math.floor((_4b6.getTime()-_4b8.getTime())/(7*24*60*60*1000));
};
}
if(!dojo._hasResource["dijit._Calendar"]){
dojo._hasResource["dijit._Calendar"]=true;
dojo.provide("dijit._Calendar");
dojo.declare("dijit._Calendar",[dijit._Widget,dijit._Templated],{templateString:"<table cellspacing=\"0\" cellpadding=\"0\" class=\"calendarContainer\">\n\t<thead>\n\t\t<tr class=\"dijitReset calendarMonthContainer\" valign=\"top\">\n\t\t\t<th class='dijitReset' dojoAttachEvent=\"onclick: _onDecrementMonth;\">\n\t\t\t\t<span class=\"dijitA11yLeftArrow calendarIncrementControl calendarDecrease\">&#9668;</span>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' colspan=\"5\">\n\t\t\t\t<div dojoAttachPoint=\"monthLabelSpacer\" class=\"calendarMonthLabelSpacer\"></div>\n\t\t\t\t<div dojoAttachPoint=\"monthLabelNode\" class=\"calendarMonth\"></div>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' dojoAttachEvent=\"onclick: _onIncrementMonth;\">\n\t\t\t\t<span class=\"dijitA11yRightArrow calendarIncrementControl calendarIncrease\">&#9658;</span>\n\t\t\t</th>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<th class=\"dijitReset calendarDayLabelTemplate\"><span class=\"calendarDayLabel\"></span></th>\n\t\t</tr>\n\t</thead>\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick;\" class=\"dijitReset calendarBodyContainer\">\n\t\t<tr class=\"dijitReset calendarWeekTemplate\">\n\t\t\t<td class=\"dijitReset calendarDateTemplate\"><span class=\"calendarDateLabel\"></span></td>\n\t\t</tr>\n\t</tbody>\n\t<tfoot class=\"dijitReset calendarYearContainer\">\n\t\t<tr>\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\n\t\t\t\t<h3 class=\"calendarYearLabel\">\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\"\n\t\t\t\t\t\tdojoAttachEvent=\"onclick: _onDecrementYear;\" class=\"calendarPreviousYear\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"calendarSelectedYear\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\"\n\t\t\t\t\t\tdojoAttachEvent=\"onclick: _onIncrementYear;\" class=\"calendarNextYear\"></span>\n\t\t\t\t</h3>\n\t\t\t</td>\n\t\t</tr>\n\t</tfoot>\n</table>\t\n",value:new Date(),dayWidth:"narrow",setValue:function(_4ba){
if(!this.value||dojo.date.compare(_4ba,this.value)){
_4ba=new Date(_4ba);
this.displayMonth=new Date(_4ba);
if(!this.isDisabledDate(_4ba,this.lang)){
this.value=_4ba;
this.value.setHours(0,0,0,0);
this.onValueChanged(this.value);
}
this._populateGrid();
}
},_populateGrid:function(){
var _4bb=this.displayMonth;
_4bb.setDate(1);
var _4bc=_4bb.getDay();
var _4bd=dojo.date.getDaysInMonth(_4bb);
var _4be=dojo.date.getDaysInMonth(dojo.date.add(_4bb,"month",-1));
var _4bf=new Date();
var _4c0=this.value;
var _4c1=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
if(_4c1>_4bc){
_4c1-=7;
}
dojo.query(".calendarDateTemplate",this.domNode).forEach(function(_4c2,i){
i+=_4c1;
var date=new Date(_4bb);
var _4c5,_4c6,adj=0;
if(i<_4bc){
_4c5=_4be-_4bc+i+1;
adj=-1;
_4c6="calendarPrevious";
}else{
if(i>=(_4bc+_4bd)){
_4c5=i-_4bc-_4bd+1;
adj=1;
_4c6="calendarNext";
}else{
_4c5=i-_4bc+1;
_4c6="calendarCurrent";
}
}
if(adj){
date=dojo.date.add(date,"month",adj);
}
date.setDate(_4c5);
if(!dojo.date.compare(date,_4bf,"date")){
_4c6="calendarCurrentDate "+_4c6;
}
if(!dojo.date.compare(date,_4c0,"date")){
_4c6="calendarSelectedDate "+_4c6;
}
if(this.isDisabledDate(date,this.lang)){
_4c6="calendarDisabledDate "+_4c6;
}
_4c2.className=_4c6+"Month calendarDateTemplate";
_4c2.dijitDateValue=date.valueOf();
var _4c8=dojo.query(".calendarDateLabel",_4c2)[0];
_4c8.innerHTML=date.getDate();
},this);
var _4c9=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
this.monthLabelNode.innerHTML=_4c9[_4bb.getMonth()];
var y=_4bb.getFullYear()-1;
dojo.forEach(["previous","current","next"],function(name){
this[name+"YearLabelNode"].innerHTML=dojo.date.locale.format(new Date(y++,0),{selector:"year",locale:this.lang});
},this);
},postCreate:function(){
dijit._Calendar.superclass.postCreate.apply(this);
var _4cc=dojo.hitch(this,function(_4cd,n){
var _4cf=dojo.query(_4cd,this.domNode)[0];
for(var i=0;i<n;i++){
_4cf.parentNode.appendChild(_4cf.cloneNode(true));
}
});
_4cc(".calendarDayLabelTemplate",6);
_4cc(".calendarDateTemplate",6);
_4cc(".calendarWeekTemplate",5);
var _4d1=dojo.date.locale.getNames("days",this.dayWidth,"standAlone",this.lang);
var _4d2=dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
dojo.query(".calendarDayLabel",this.domNode).forEach(function(_4d3,i){
_4d3.innerHTML=_4d1[(i+_4d2)%7];
});
var _4d5=dojo.date.locale.getNames("months","wide","standAlone",this.lang);
dojo.forEach(_4d5,function(name){
var _4d7=dojo.doc.createElement("div");
_4d7.innerHTML=name;
this.monthLabelSpacer.appendChild(_4d7);
},this);
this.value=null;
this.setValue(new Date());
},_adjustDate:function(part,_4d9){
this.displayMonth=dojo.date.add(this.displayMonth,part,_4d9);
this._populateGrid();
},_onIncrementMonth:function(evt){
evt.stopPropagation();
this._adjustDate("month",1);
},_onDecrementMonth:function(evt){
evt.stopPropagation();
this._adjustDate("month",-1);
},_onIncrementYear:function(evt){
evt.stopPropagation();
this._adjustDate("year",1);
},_onDecrementYear:function(evt){
evt.stopPropagation();
this._adjustDate("year",-1);
},_onDayClick:function(evt){
var node=evt.target;
dojo.stopEvent(evt);
while(!node.dijitDateValue){
node=node.parentNode;
}
if(!dojo.hasClass(node,"calendarDisabledDate")){
this.setValue(node.dijitDateValue);
this.onValueSelected(this.value);
}
},onValueSelected:function(date){
},onValueChanged:function(date){
},isDisabledDate:function(_4e2,_4e3){
return false;
}});
}
if(!dojo._hasResource["dijit.form.DateTextbox"]){
dojo._hasResource["dijit.form.DateTextbox"]=true;
dojo.provide("dijit.form.DateTextbox");
dojo.declare("dijit.form.DateTextbox",dijit.form.RangeBoundTextbox,{regExpGen:dojo.date.locale.regexp,compare:dojo.date.compare,format:dojo.date.locale.format,parse:dojo.date.locale.parse,value:new Date(),postMixInProperties:function(){
dijit.form.RangeBoundTextbox.prototype.postMixInProperties.apply(this,arguments);
this.constraints.selector="date";
if(typeof this.constraints.min=="string"){
this.constraints.min=dojo.date.stamp.fromISOString(this.constraints.min);
}
if(typeof this.constraints.max=="string"){
this.constraints.max=dojo.date.stamp.fromISOString(this.constraints.max);
}
},onfocus:function(evt){
if(this._skipNextFocusOpen){
this._skipNextFocusOpen=false;
}else{
this._open();
}
dijit.form.RangeBoundTextbox.prototype.onfocus.apply(this,arguments);
},serialize:function(date){
return dojo.date.stamp.toISOString(date,"date");
},setValue:function(date){
if(!this._calendar||!this._calendar.onValueSelected){
dijit.form.DateTextbox.superclass.setValue.apply(this,arguments);
}else{
this._calendar.setValue(date);
}
},_open:function(){
var self=this;
if(!this._calendar){
this._calendar=new dijit._Calendar({onValueSelected:function(){
dijit.form.DateTextbox.superclass.setValue.apply(self,arguments);
dijit.util.popup.close();
self._skipNextFocusOpen=true;
self.focus();
},lang:this.lang,isDisabledDate:function(date){
return self.constraints&&(dojo.date.compare(self.constraints.min,date)>0||dojo.date.compare(self.constraints.max,date)<0);
}});
this._calendar.setValue(this.getValue()||new Date());
}
if(!this._opened){
dijit.util.popup.open({popup:this._calendar,around:this.domNode,onClose:function(){
self._opened=false;
}});
this._opened=true;
}
},postCreate:function(){
dijit.form.DateTextbox.superclass.postCreate.apply(this,arguments);
this.connect(this.domNode,"onclick","_open");
},getDisplayedValue:function(){
return this.textbox.value;
},setDisplayedValue:function(_4e9){
this.textbox.value=_4e9;
}});
}
if(!dojo._hasResource["dijit.form.FilteringSelect"]){
dojo._hasResource["dijit.form.FilteringSelect"]=true;
dojo.provide("dijit.form.FilteringSelect");
dojo.declare("dijit.form.FilteringSelect",[dijit.form.MappedTextbox,dijit.form.ComboBoxMixin],{labelAttr:"",labelType:"text",_isvalid:true,isValid:function(){
return this._isvalid;
},_callbackSetLabel:function(_4ea,_4eb){
if(_4eb&&_4eb.query[this.searchAttr]!=this._lastQuery){
return;
}
if(!_4ea.length){
this._isvalid=false;
this.validate(this._hasFocus);
}else{
this._setValueFromItem(_4ea[0]);
}
},_openResultList:function(_4ec,_4ed){
if(_4ed.query[this.searchAttr]!=this._lastQuery){
return;
}
this._isvalid=_4ec.length!=0;
this.validate(true);
dijit.form.ComboBoxMixin.prototype._openResultList.apply(this,arguments);
},getValue:function(){
return this.valueNode.value;
},_getValueField:function(){
return "value";
},_setValue:function(_4ee,_4ef){
this.valueNode.value=_4ee;
dijit.form.FilteringSelect.superclass.setValue.apply(this,arguments);
},setValue:function(_4f0){
var self=this;
var _4f2=function(item){
if(item){
if(self.store.isItemLoaded(item)){
self._callbackSetLabel([item]);
}else{
self.store.loadItem({item:item,onItem:self._callbackSetLabel});
}
}else{
self._isvalid=false;
self.validate(false);
}
};
this.store.fetchItemByIdentity({identity:_4f0,onItem:_4f2});
},_setValueFromItem:function(item){
this._isvalid=true;
this._setValue(this.store.getIdentity(item),this.labelFunc(item,this.store));
},labelFunc:function(item,_4f6){
return _4f6.getValue(item,this.searchAttr);
},_createOption:function(tr){
var td=dijit.form.ComboBoxMixin.prototype._createOption.apply(this,arguments);
if(this.labelAttr){
if(this.labelType=="html"){
td.innerHTML=this.store.getValue(tr,this.labelAttr);
}else{
var _4f9=document.createTextNode(this.store.getValue(tr,this.labelAttr));
td.innerHTML="";
td.appendChild(_4f9);
}
}
return td;
},onkeyup:function(evt){
},_doSelect:function(tgt){
this._setValueFromItem(tgt.item);
},setDisplayedValue:function(_4fc){
if(this.store){
var _4fd={};
this._lastQuery=_4fd[this.searchAttr]=_4fc;
this.textbox.value=_4fc;
this.store.fetch({query:_4fd,queryOptions:{ignoreCase:this.ignoreCase},onComplete:dojo.hitch(this,this._callbackSetLabel)});
}
}});
}
if(!dojo._hasResource["dijit.form.InlineEditBox"]){
dojo._hasResource["dijit.form.InlineEditBox"]=true;
dojo.provide("dijit.form.InlineEditBox");
dojo.requireLocalization("dijit","common",null,"ROOT,de");
dojo.declare("dijit.form.InlineEditBox",[dijit.form._FormWidget,dijit._Container],{templateString:"<span>\n\t<span class='dijitInlineValue' tabIndex=\"0\" dojoAttachPoint=\"editable;focusNode\" style=\"\" waiRole=\"button\"\n\t\tdojoAttachEvent=\"onkeypress:_onKeyPress;onclick:_onClick;onmouseout:_onMouseOut;onmouseover:_onMouseOver;onfocus:_onMouseOver;onblur:_onMouseOut;\"></span>\n\t<fieldset style=\"display:none;\" dojoAttachPoint=\"editNode\" class=\"dijitInlineEditor\">\n\t\t<div dojoAttachPoint=\"containerNode\" dojoAttachEvent=\"onkeyup:checkForValueChange;\"></div>\n\t\t<button class='saveButton' dojoAttachPoint=\"saveButton\" dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:save\">${buttonSave}</button>\n\t\t<button class='cancelButton' dojoAttachPoint=\"cancelButton\" dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">${buttonCancel}</button>\n\t</fieldset>\n</span>\n",editing:false,buttonSave:"",buttonCancel:"",renderHTML:false,widgetsInTemplate:true,postCreate:function(){
var _4fe=this;
dojo.addOnLoad(function(){
if(_4fe.editWidget){
_4fe.containerNode.appendChild(_4fe.editWidget.domNode);
}else{
_4fe.editWidget=_4fe.getChildren()[0];
}
_4fe._setEditValue=dojo.hitch(_4fe.editWidget,_4fe.editWidget.setDisplayedValue||_4fe.editWidget.setValue);
_4fe._getEditValue=dojo.hitch(_4fe.editWidget,_4fe.editWidget.getDisplayedValue||_4fe.editWidget.getValue);
_4fe._setEditFocus=dojo.hitch(_4fe.editWidget,_4fe.editWidget.focus);
_4fe.editWidget.onValueChanged=dojo.hitch(_4fe,"checkForValueChange");
_4fe.checkForValueChange();
_4fe._showText();
});
},postMixInProperties:function(){
dijit.form.InlineEditBox.superclass.postMixInProperties.apply(this,arguments);
this.messages=dojo.i18n.getLocalization("dijit","common",this.lang);
dojo.forEach(["buttonSave","buttonCancel"],function(prop){
if(!this[prop]){
this[prop]=this.messages[prop];
}
},this);
},_onKeyPress:function(e){
if(this.disabled||e.altKey||e.ctrlKey){
return;
}
if(e.charCode==dojo.keys.SPACE||e.keyCode==dojo.keys.ENTER){
dojo.stopEvent(e);
this._onClick(e);
}
},_onMouseOver:function(){
if(!this.editing){
var _501=this.disabled?"dijitDisabledClickableRegion":"dijitClickableRegion";
dojo.addClass(this.editable,_501);
}
},_onMouseOut:function(){
if(!this.editing){
var _502=this.disabled?"dijitDisabledClickableRegion":"dijitClickableRegion";
dojo.removeClass(this.editable,_502);
}
},onClick:function(e){
},_onClick:function(e){
if(this.editing||this.disabled){
return;
}
this._onMouseOut();
this.editing=true;
this._setEditValue(this._isEmpty?"":(this.renderHTML?this.editable.innerHTML:this.editable.firstChild.nodeValue));
this._initialText=this._getEditValue();
this._visualize();
this._setEditFocus();
this.saveButton.disable();
this.onClick();
},_visualize:function(e){
dojo.style(this.editNode,"display",this.editing?"":"none");
dojo.style(this.editable,"display",this.editing?"none":"");
},_showText:function(){
var _506=this._getEditValue();
dijit.form.InlineEditBox.superclass.setValue.call(this,_506);
if(/^\s*$/.test(_506)){
_506="?";
this._isEmpty=true;
}else{
this._isEmpty=false;
}
if(this.renderHTML){
this.editable.innerHTML=_506;
}else{
this.editable.innerHTML="";
this.editable.appendChild(document.createTextNode(_506));
}
this._visualize();
},save:function(e){
if(e){
dojo.stopEvent(e);
}
this.editing=false;
this._showText();
},cancel:function(e){
if(e){
dojo.stopEvent(e);
}
this.editing=false;
this._visualize();
},setValue:function(_509){
this._setEditValue(_509);
this.editing=false;
this._showText();
},checkForValueChange:function(){
if(this.editing){
(this._getEditValue()==this._initialText)?this.saveButton.disable():this.saveButton.enable();
}else{
this._showText();
}
},disable:function(){
this.saveButton.disable();
this.cancelButton.disable();
this.editable.disabled=true;
this.editWidget.disable();
dijit.form.InlineEditBox.superclass.disable.apply(this,arguments);
},enable:function(){
this.checkForValueChange();
this.cancelButton.enable();
this.editable.disabled=false;
this.editWidget.enable();
dijit.form.InlineEditBox.superclass.enable.apply(this,arguments);
}});
}
if(!dojo._hasResource["dijit.form._Spinner"]){
dojo._hasResource["dijit.form._Spinner"]=true;
dojo.provide("dijit.form._Spinner");
dojo.declare("dijit.form._Spinner",dijit.form.RangeBoundTextbox,{defaultTimeout:500,timeoutChangeRate:0.9,smallDelta:1,largeDelta:10,templateString:"<div class=\"dijit dijitInline dijitLeft dijitSpinner\" baseClass=\"dijitSpinner\"\n\tid=\"${id}\" name=\"${name}\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;\"\n\twaiRole=\"presentation\"\n><table cellspacing=\"0\"  waiRole=\"presentation\">\n\t<tr>\n\t\t<td rowspan=\"2\" class=\"dijitReset dijitStretch dijitSpinnerInput\">\n\t\t\t<input dojoAttachPoint=\"textbox;focusNode\" type=\"${type}\" dojoAttachEvent=\"onblur;onfocus;onkeyup;\"\n\t\t\t\tvalue=\"${value}\" name=\"${name}\" size=\"${size}\" maxlength=\"${maxlength}\"\n\t\t\t\twaiRole=\"spinbutton\" autocomplete=\"off\" tabIndex=\"${tabIndex}\"\n\t\t\t></td>\n\t\t<td class=\"dijitReset dijitRight dijitButtonNode dijitUpArrowButton\" \n\t\t\t\tdojoAttachPoint=\"upArrowNode\"\n\t\t\t\tdojoAttachEvent=\"onmousedown:_handleUpArrowEvent;onmouseup:_handleUpArrowEvent;onmouseover:_handleUpArrowEvent;onmouseout:_handleUpArrowEvent;\"\n\t\t\t\tbaseClass=\"dijitSpinnerUpArrow\"\n\t\t\t><div class=\"dijitA11yUpArrow\">&#9650;</div></td>\n\t</tr><tr>\n\t\t<td class=\"dijitReset dijitRight dijitButtonNode dijitDownArrowButton\" \n\t\t\t\tdojoAttachPoint=\"downArrowNode\"\n\t\t\t\tdojoAttachEvent=\"onmousedown:_handleDownArrowEvent;onmouseup:_handleDownArrowEvent;onmouseover:_handleDownArrowEvent;onmouseout:_handleDownArrowEvent;\"\n\t\t\t\tbaseClass=\"dijitSpinnerDownArrow\"\n\t\t\t><div class=\"dijitA11yDownArrow\">&#9660;</div></td>\n\t</tr>\n</table></div>\n\n",adjust:function(val,_50b){
return val;
},_handleUpArrowEvent:function(e){
this._onMouse(e,this.upArrowNode);
},_handleDownArrowEvent:function(e){
this._onMouse(e,this.downArrowNode);
},_arrowPressed:function(_50e,_50f){
if(this.disabled){
return;
}
dojo.addClass(_50e,"dijitSpinnerButtonActive");
this.setValue(this.adjust(this.getValue(),_50f*this.smallDelta));
},_arrowReleased:function(node){
if(this.disabled){
return;
}
this._wheelTimer=null;
this.textbox.focus();
dojo.removeClass(node,"dijitSpinnerButtonActive");
},_typematicCallback:function(_511,node,evt){
if(node==this.textbox){
node=(evt.keyCode==dojo.keys.UP_ARROW)?this.upArrowNode:this.downArrowNode;
}
if(_511==-1){
this._arrowReleased(node);
}else{
this._arrowPressed(node,(node==this.upArrowNode)?1:-1);
}
},_wheelTimer:null,_mouseWheeled:function(evt){
dojo.stopEvent(evt);
var _515=0;
if(typeof evt.wheelDelta=="number"){
_515=evt.wheelDelta;
}else{
if(typeof evt.detail=="number"){
_515=-evt.detail;
}
}
if(_515>0){
var node=this.upArrowNode;
var dir=+1;
}else{
if(_515<0){
var node=this.downArrowNode;
var dir=-1;
}else{
return;
}
}
this._arrowPressed(node,dir);
if(this._wheelTimer!=null){
clearTimeout(this._wheelTimer);
}
var _518=this;
this._wheelTimer=setTimeout(function(){
_518._arrowReleased(node);
},50);
},postCreate:function(){
dijit.form._Spinner.superclass.postCreate.apply(this,arguments);
if(this.srcNodeRef){
dojo.style(this.textbox,"cssText",this.srcNodeRef.style.cssText);
this.textbox.className+=" "+this.srcNodeRef.className;
}
this.connect(this.textbox,dojo.isIE?"onmousewheel":"DOMMouseScroll","_mouseWheeled");
dijit.util.typematic.addListener(this.upArrowNode,this.textbox,{keyCode:dojo.keys.UP_ARROW,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout);
dijit.util.typematic.addListener(this.downArrowNode,this.textbox,{keyCode:dojo.keys.DOWN_ARROW,ctrlKey:false,altKey:false,shiftKey:false},this,"_typematicCallback",this.timeoutChangeRate,this.defaultTimeout);
this._setDisabled(this.disabled==true);
}});
}
if(!dojo._hasResource["dijit.form.NumberTextbox"]){
dojo._hasResource["dijit.form.NumberTextbox"]=true;
dojo.provide("dijit.form.NumberTextbox");
dojo.declare("dijit.form.NumberTextboxMixin",null,{regExpGen:dojo.number.regexp,format:dojo.number.format,parse:dojo.number.parse,value:0});
dojo.declare("dijit.form.NumberTextbox",[dijit.form.RangeBoundTextbox,dijit.form.NumberTextboxMixin],{});
}
if(!dojo._hasResource["dijit.form.NumberSpinner"]){
dojo._hasResource["dijit.form.NumberSpinner"]=true;
dojo.provide("dijit.form.NumberSpinner");
dojo.declare("dijit.form.NumberSpinner",[dijit.form._Spinner,dijit.form.NumberTextboxMixin],{required:true,adjust:function(val,_51a){
var _51b=val+_51a;
if(isNaN(val)||isNaN(_51b)){
return val;
}
if((typeof this.constraints.max=="number")&&(_51b>this.constraints.max)){
_51b=this.constraints.max;
}
if((typeof this.constraints.min=="number")&&(_51b<this.constraints.min)){
_51b=this.constraints.min;
}
return _51b;
}});
}
if(!dojo._hasResource["dijit.form.Slider"]){
dojo._hasResource["dijit.form.Slider"]=true;
dojo.provide("dijit.form.Slider");
dojo.declare("dijit.form.HorizontalSlider",dijit.form._FormWidget,{templateString:"<table class=\"dijitReset dijitSlider\" cellspacing=0 cellpadding=0 border=0 rules=none id=\"${id}\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=2></td\n\t\t><td dojoAttachPoint=\"topDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\n\t\t><td class=\"dijitReset\" colspan=2></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitHorizontalSliderButtonContainer\"\n\t\t\t><span dojoAttachPoint=\"decrementButton\" class=\"dijitSliderButton dijitSliderHorizontalButton\" style=\"display:none;\"></span\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitHorizontalSliderBumper dijitSliderLeftBumper dijitHorizontalSliderLeftBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset\" style=\"width:9999px;\"\n\t\t\t><input dojoAttachPoint=\"valueNode\" name=\"${name}\" type=\"hidden\"\n\t\t\t><div style=\"position:relative;\" dojoAttachPoint=\"containerNode\"\n\t\t\t\t><div dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitHorizontalSliderBar dijitSliderProgressBar dijitHorizontalSliderProgressBar\" dojoAttachEvent=\"onclick:_onBarClick;\"\n\t\t\t\t\t><div tabIndex=\"${tabIndex}\" dojoAttachPoint=\"sliderHandle;focusNode;\" class=\"dijitSliderMoveable dijitHorizontalSliderMoveable\" dojoAttachEvent=\"onkeypress:_onKeyPress;onclick:_onHandleClick;\" waiRole=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t\t><img class=\"dijitSliderImageHandle dijitHorizontalSliderImageHandle\" src=\"${handleSrc}\" style=\"display:inline;\"\n\t\t\t\t\t\t><span class=\"dijitSliderA11yHandle dijitHorizontalSliderA11yHandle\" style=\"display:none;\">&#9830;</span\n\t\t\t\t\t></div\n\t\t\t\t></div\n\t\t\t\t><div dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitHorizontalSliderBar dijitSliderRemainingBar dijitHorizontalSliderRemainingBar\" dojoAttachEvent=\"onclick:_onBarClick;\"></div\n\t\t\t></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitHorizontalSliderBumper dijitSliderRightBumper dijitHorizontalSliderRightBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitHorizontalSliderButtonContainer\"\n\t\t\t><span dojoAttachPoint=\"incrementButton\" class=\"dijitSliderButton dijitSliderHorizontalButton\" style=\"display:none;\"></span\n\t\t></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=2></td\n\t\t><td dojoAttachPoint=\"bottomDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\n\t\t><td class=\"dijitReset\" colspan=2></td\n\t></tr\n></table>\n",value:0,showButtons:true,incrementButtonContent:"+",decrementButtonContent:"-",handleSrc:dojo.moduleUrl("dijit","themes/tundra/images/preciseSliderThumb.png"),minimum:0,maximum:100,discreteValues:Infinity,pageIncrement:2,clickSelect:true,_mousePixelCoord:"pageX",_pixelCount:"w",_startingPixelCoord:"x",_startingPixelCount:"l",_handleOffsetCoord:"left",_progressPixelSize:"width",_upsideDown:false,_setDisabled:function(_51c){
if(this.showButtons){
this.incrementButton.disabled=_51c;
this.decrementButton.disabled=_51c;
}
dijit.form.HorizontalSlider.superclass._setDisabled.apply(this,arguments);
},_onKeyPress:function(e){
if(this.disabled||e.altKey||e.ctrlKey){
return;
}
switch(e.keyCode){
case dojo.keys.HOME:
this.setValue(this.minimum);
break;
case dojo.keys.END:
this.setValue(this.maximum);
break;
case dojo.keys.UP_ARROW:
case dojo.keys.RIGHT_ARROW:
this.increment(e);
break;
case dojo.keys.DOWN_ARROW:
case dojo.keys.LEFT_ARROW:
this.decrement(e);
break;
default:
return;
}
dojo.stopEvent(e);
},_onHandleClick:function(e){
if(this.disabled){
return;
}
this.sliderHandle.focus();
dojo.stopEvent(e);
},_onBarClick:function(e){
if(this.disabled||!this.clickSelect){
return;
}
dojo.stopEvent(e);
var _520=dojo.coords(this.containerNode,true);
var _521=e[this._mousePixelCoord]-_520[this._startingPixelCoord];
this._setPixelValue(this._upsideDown?(_520[this._pixelCount]-_521):_521,_520[this._pixelCount]);
},_setPixelValue:function(_522,_523){
_522=_522<0?0:_523<_522?_523:_522;
var _524=this.discreteValues;
if(_524>_523){
_524=_523;
}
var _525=_523/_524;
var _526=Math.round(_522/_525);
this.setValue((this.maximum-this.minimum)*_526/_524+this.minimum);
},setValue:function(_527){
this.valueNode.value=this.value=_527;
dijit.form.HorizontalSlider.superclass.setValue.call(this,_527);
var _528=(_527-this.minimum)/(this.maximum-this.minimum);
this.progressBar.style[this._progressPixelSize]=(_528*100)+"%";
this.remainingBar.style[this._progressPixelSize]=((1-_528)*100)+"%";
},_bumpValue:function(_529){
var s=dojo.getComputedStyle(this.containerNode);
var c=dojo._getContentBox(this.containerNode,s);
var _52c=this.discreteValues;
if(_52c>c[this._pixelCount]){
_52c=c[this._pixelCount];
}
var _52d=(this.value-this.minimum)*_52c/(this.maximum-this.minimum)+_529;
if(_52d<0){
_52d=0;
}
if(_52d>_52c){
_52d=_52c;
}
_52d=_52d*(this.maximum-this.minimum)/_52c+this.minimum;
this.setValue(_52d);
},decrement:function(e){
this._bumpValue(e.shiftKey?-this.pageIncrement:-1);
},increment:function(e){
this._bumpValue(e.shiftKey?this.pageIncrement:1);
},repeatString:function(str,n){
var s="",t=str.toString();
while(--n>=0){
s+=t;
}
return s;
},_createButton:function(node,_535,fcn){
var _537=new dijit.form.Button({label:_535,tabIndex:-1,onClick:dojo.hitch(this,fcn)},node);
_537.domNode.style.display="";
return _537;
},_createIncrementButton:function(){
var w=this._createButton(this.incrementButton,this.incrementButtonContent,"increment");
this.incrementButton=w.focusNode;
},_createDecrementButton:function(){
var w=this._createButton(this.decrementButton,this.decrementButtonContent,"decrement");
this.decrementButton=w.focusNode;
},postCreate:function(){
if(this.showButtons){
this._createIncrementButton();
this._createDecrementButton();
}
this.sliderHandle.widget=this;
new dojo.dnd.Moveable(this.sliderHandle,{mover:dijit.form._slider});
this.setValue(this.value);
}});
dojo.declare("dijit.form.VerticalSlider",dijit.form.HorizontalSlider,{templateString:"<table class=\"dijitReset dijitSlider\" cellspacing=0 cellpadding=0 border=0 rules=none id=\"${id}\"\n><tbody class=\"dijitReset\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitVerticalSliderButtonContainer\"\n\t\t\t><span dojoAttachPoint=\"incrementButton\" class=\"dijitSliderButton dijitVerticalSliderButton dijitVerticalSliderTopButton\" style=\"display:none;\"></span\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitVerticalSliderBumper dijitSliderTopBumper dijitVerticalSliderTopBumper\"></div></center\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td dojoAttachPoint=\"leftDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\n\t\t><td class=\"dijitReset\" style=\"height:100%;\"\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" name=\"${name}\"\n\t\t\t><center style=\"position:relative;height:100%;\" dojoAttachPoint=\"containerNode\"\n\t\t\t\t><div dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitVerticalSliderBar dijitSliderRemainingBar dijitVerticalSliderRemainingBar\" dojoAttachEvent=\"onclick:_onBarClick;\"></div\n\t\t\t\t><div dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitVerticalSliderBar dijitSliderProgressBar dijitVerticalSliderProgressBar\" dojoAttachEvent=\"onclick:_onBarClick;\"\n\t\t\t\t\t><div tabIndex=\"${tabIndex}\" dojoAttachPoint=\"sliderHandle;focusNode;\" class=\"dijitSliderMoveable\" dojoAttachEvent=\"onkeypress:_onKeyPress;onclick:_onHandleClick;\" style=\"vertical-align:top;\" waiRole=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t\t><img class=\"dijitSliderImageHandle dijitVerticalSliderImageHandle\" src=\"${handleSrc}\" style=\"display:inline;\"\n\t\t\t\t\t\t><span class=\"dijitSliderA11yHandle dijitVerticalSliderA11yHandle\" style=\"display:none;\">&#9830;</span\n\t\t\t\t\t></div\n\t\t\t\t></div\n\t\t\t></center\n\t\t></td\n\t\t><td dojoAttachPoint=\"rightDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitVerticalSliderBumper dijitSliderBottomBumper dijitVerticalSliderBottomBumper\"></div></center\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitVerticalSliderButtonContainer\"\n\t\t\t><span dojoAttachPoint=\"decrementButton\" class=\"dijitSliderButton dijitVerticalSliderButton dijitVerticalSliderBottomButton\" style=\"display:none;\"></span\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n></tbody></table>\n",handleSrc:dojo.moduleUrl("dijit","themes/tundra/images/sliderThumb.png"),_mousePixelCoord:"pageY",_pixelCount:"h",_startingPixelCoord:"y",_startingPixelCount:"t",_handleOffsetCoord:"top",_progressPixelSize:"height",_upsideDown:true});
dojo.declare("dijit.form._slider",dojo.dnd.Mover,{onMouseMove:function(e){
var _53b=this.node.widget;
var c=this.constraintBox;
if(!c){
var _53d=_53b.containerNode;
var s=dojo.getComputedStyle(_53d);
var c=dojo._getContentBox(_53d,s);
c[_53b._startingPixelCount]=0;
this.constraintBox=c;
}
var m=this.marginBox;
var _540=m[_53b._startingPixelCount]+e[_53b._mousePixelCoord];
dojo.hitch(_53b,"_setPixelValue")(_53b._upsideDown?(c[_53b._pixelCount]-_540):_540,c[_53b._pixelCount]);
}});
}
if(!dojo._hasResource["dijit.form.Textarea"]){
dojo._hasResource["dijit.form.Textarea"]=true;
dojo.provide("dijit.form.Textarea");
dojo.declare("dijit.form.Textarea",dijit.form._FormWidget,{templateString:(dojo.isIE||dojo.isSafari||dojo.isMozilla)?"<fieldset id=\"${id}\" tabIndex=\"${tabIndex}\" class=\"dijitInlineBox dijitInputField dijitTextArea\">"+((dojo.isIE||dojo.isSafari)?"<div dojoAttachPoint=\"editNode\" style=\"text-decoration:none;_padding-bottom:16px;display:block;overflow:auto;\" contentEditable=\"true\"></div>":"<iframe dojoAttachPoint=\"iframe\" src=\"javascript:void(0)\" style=\"border:0px;margin:0px;padding:0px;display:block;width:100%;height:100%;overflow-x:auto;overflow-y:hidden;\"></iframe>")+"<textarea name=\"${name}\" value=\"${value}\" dojoAttachPoint=\"formValueNode\" style=\"display:none;\"></textarea>"+"</fieldset>":"<textarea id=\"${id}\" name=\"${name}\" value=\"${value}\" dojoAttachPoint=\"formValueNode\" tabIndex=\"${tabIndex}\" class=\"dijitInputField dijitTextArea\"></textarea>",focus:function(){
if(!this.disabled){
this._changing();
this.focusNode.focus();
}
},_setFormValue:function(){
value=this.editNode.innerHTML.replace(/<(br[^>]*|\/(p|div))>$|^<(p|div)[^>]*>|\r/gi,"").replace(/<\/(p|div)>\s*<\1[^>]*>|<(br|p|div)[^>]*>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&amp;/gi,"&").replace(/&nbsp;/gi," ").replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
this.formValueNode.value=value;
if(this.iframe){
var d=this.iframe.contentWindow.document;
var _542=d.body.firstChild.scrollHeight;
if(d.body.scrollWidth>d.body.clientWidth){
_542+=16;
}
if(this.lastHeight!=_542){
if(_542==0){
_542=16;
}
dojo.contentBox(this.iframe,{h:_542});
this.lastHeight=_542;
}
}
dijit.form.Textarea.superclass.setValue.call(this,value);
},setValue:function(_543){
if(this.editNode){
this.editNode.innerHTML="";
var _544=_543.split("\n");
for(var i=0;i<_544.length;i++){
this.editNode.appendChild(document.createTextNode(_544[i]));
this.editNode.appendChild(document.createElement("BR"));
}
}
this._setFormValue();
},getValue:function(){
return this.formValueNode.value;
},postMixInProperties:function(){
dijit.form.Textarea.superclass.postMixInProperties.apply(this,arguments);
if(this.srcNodeRef&&this.srcNodeRef.innerHTML!=""){
this.value=this.srcNodeRef.innerHTML;
this.srcNodeRef.innerHTML="";
}
if((!this.value||this.value=="")&&this.srcNodeRef&&this.srcNodeRef.value){
this.value=this.srcNodeRef.value;
}
if(!this.value){
this.value="";
}
},postCreate:function(){
if(dojo.isIE||dojo.isSafari){
this.domNode.style.overflowY="hidden";
this.eventNode=this.editNode;
this.focusNode=this.editNode;
this.connect(this.eventNode,"oncut",this._changing);
this.connect(this.eventNode,"onpaste",this._changing);
}else{
if(dojo.isMozilla){
this.iframe=this.domNode.firstChild;
var w=this.iframe.contentWindow;
var d=w.document;
d.open();
d.write("<html><body style=\"margin:0px;padding:0px;border:0px;\"><div tabIndex=\"1\" style=\"padding:2px;\"></div></body></html>");
d.close();
try{
this.iframe.contentDocument.designMode="on";
}
catch(e){
}
this.editNode=d.body.firstChild;
this.domNode.style.overflowY="hidden";
this.eventNode=d;
this.focusNode=this.editNode;
this.eventNode.addEventListener("keypress",dojo.hitch(this,"_interceptTab"),false);
this.eventNode.addEventListener("resize",dojo.hitch(this,"_changed"),false);
}else{
this.focusNode=this.domNode;
}
}
this.setValue(this.value);
if(this.eventNode){
this.connect(this.eventNode,"keydown",this._changing);
this.connect(this.eventNode,"mousemove",this._changed);
this.connect(this.eventNode,"focus",this._focused);
this.connect(this.eventNode,"blur",this._blurred);
}
},_focused:function(){
dojo.addClass(this.domNode,"dijitInputFieldFocused");
this._changed();
},_blurred:function(){
dojo.removeClass(this.domNode,"dijitInputFieldFocused");
this._changed();
},_interceptTab:function(e){
if(e.keyCode==9&&!e.shiftKey&&!e.ctrlKey&&!e.altKey){
this.iframe.focus();
e.preventDefault();
}
},_changing:function(){
setTimeout(dojo.hitch(this,"_changed"),1);
},_changed:function(){
if(this.iframe&&this.iframe.contentDocument.designMode!="on"){
this.iframe.contentDocument.designMode="on";
}
this._setFormValue();
}});
}
if(!dojo._hasResource["dijit.layout.StackContainer"]){
dojo._hasResource["dijit.layout.StackContainer"]=true;
dojo.provide("dijit.layout.StackContainer");
dojo.declare("dijit.layout.StackContainer",dijit.layout._LayoutWidget,{doLayout:true,_started:false,startup:function(){
var _549=this.getChildren();
dojo.forEach(_549,this._setupChild,this);
dojo.some(_549,function(_54a){
if(_54a.selected){
this.selectedChildWidget=_54a;
}
return _54a.selected;
},this);
if(!this.selectedChildWidget&&_549[0]){
this.selectedChildWidget=_549[0];
this.selectedChildWidget.selected=true;
}
if(this.selectedChildWidget){
this._showChild(this.selectedChildWidget);
}
dojo.publish(this.id+"-startup",[{children:_549,selected:this.selectedChildWidget}]);
dijit.layout._LayoutWidget.prototype.startup.apply(this,arguments);
this._started=true;
},_setupChild:function(page){
page.domNode.style.display="none";
page.domNode.style.position="relative";
return page;
},addChild:function(_54c,_54d){
dijit._Container.prototype.addChild.apply(this,arguments);
_54c=this._setupChild(_54c);
var _54e=this._started;
if(_54e){
this.layout();
}
if(!this.selectedChildWidget&&_54e){
this.selectChild(_54c);
}
if(_54e){
dojo.publish(this.id+"-addChild",[_54c]);
}
},removeChild:function(page){
dijit._Container.prototype.removeChild.apply(this,arguments);
if(this._beingDestroyed){
return;
}
if(this._started){
dojo.publish(this.id+"-removeChild",[page]);
this.layout();
}
if(this.selectedChildWidget===page){
this.selectedChildWidget=undefined;
if(this._started){
var _550=this.getChildren();
if(_550.length){
this.selectChild(_550[0]);
}
}
}
},selectChild:function(page){
page=dijit.byId(page);
if(this.selectedChildWidget!=page){
this._transition(page,this.selectedChildWidget);
this.selectedChildWidget=page;
dojo.publish(this.id+"-selectChild",[page]);
}
},_transition:function(_552,_553){
if(_553){
this._hideChild(_553);
}
this._showChild(_552);
},forward:function(){
var _554=dojo.indexOf(this.getChildren(),this.selectedChildWidget);
this.selectChild(this.getChildren()[_554+1]);
},back:function(){
var _555=dojo.indexOf(this.getChildren(),this.selectedChildWidget);
this.selectChild(this.getChildren()[_555-1]);
},layout:function(){
if(this.doLayout&&this.selectedChildWidget&&this.selectedChildWidget.resize){
this.selectedChildWidget.resize(this._contentBox);
}
},_showChild:function(page){
var _557=this.getChildren();
page.isFirstChild=(page==_557[0]);
page.isLastChild=(page==_557[_557.length-1]);
page.selected=true;
page.domNode.style.display="";
if(this.doLayout&&page.resize){
page.resize(this._containerContentBox||this._contentBox);
}
},_hideChild:function(page){
page.selected=false;
page.domNode.style.display="none";
},closeChild:function(page){
var _55a=page.onClose(this,page);
if(_55a){
this.removeChild(page);
page.destroy();
}
},destroy:function(){
this._beingDestroyed=true;
dijit.layout.StackContainer.superclass.destroy.apply(this,arguments);
}});
dojo.declare("dijit.layout.StackController",[dijit._Widget,dijit._Templated,dijit._Container],{templateString:"<span wairole='tablist' dojoAttachEvent='onkeypress' class='dijitStackController'></span>",containerId:"",buttonWidget:"dijit.layout._StackButton",childInTabOrder:undefined,postCreate:function(){
dijit.util.wai.setAttr(this.domNode,"waiRole","role","tablist");
this.pane2button={};
this._subscriptions=[dojo.subscribe(this.containerId+"-startup",this,"onStartup"),dojo.subscribe(this.containerId+"-addChild",this,"onAddChild"),dojo.subscribe(this.containerId+"-removeChild",this,"onRemoveChild"),dojo.subscribe(this.containerId+"-selectChild",this,"onSelectChild")];
},onStartup:function(info){
dojo.forEach(info.children,this.onAddChild,this);
this.onSelectChild(info.selected);
},destroy:function(){
dojo.forEach(this._subscriptions,dojo.unsubscribe);
dijit.layout.StackController.superclass.destroy.apply(this,arguments);
},onAddChild:function(page){
var _55d=document.createElement("span");
this.domNode.appendChild(_55d);
var cls=dojo.getObject(this.buttonWidget);
var _55f=new cls({label:page.title,closeButton:page.closable},_55d);
this.addChild(_55f);
this.pane2button[page]=_55f;
page.controlButton=_55f;
var _560=this;
dojo.connect(_55f,"onClick",function(){
_560.onButtonClick(page);
});
dojo.connect(_55f,"onClickCloseButton",function(){
_560.onCloseButtonClick(page);
});
if(!this.childInTabOrder){
_55f.focusNode.setAttribute("tabIndex","0");
this.childInTabOrder=_55f;
}
},onRemoveChild:function(page){
if(this._currentChild===page){
this._currentChild=null;
}
var _562=this.pane2button[page];
if(_562){
_562.destroy();
}
this.pane2button[page]=null;
},onSelectChild:function(page){
if(!page){
return;
}
if(this._currentChild){
var _564=this.pane2button[this._currentChild];
_564.setSelected(false);
_564.focusNode.setAttribute("tabIndex","-1");
}
var _565=this.pane2button[page];
_565.setSelected(true);
this._currentChild=page;
_565.focusNode.setAttribute("tabIndex","0");
},onButtonClick:function(page){
var _567=dijit.byId(this.containerId);
_567.selectChild(page);
},onCloseButtonClick:function(page){
var _569=dijit.byId(this.containerId);
_569.closeChild(page);
var b=this.pane2button[this._currentChild];
(b.focusNode||b.domNode).focus();
},onkeypress:function(evt){
if(this.disabled||evt.altKey||evt.shiftKey||evt.ctrlKey){
return;
}
var _56c=true;
switch(evt.keyCode){
case dojo.keys.LEFT_ARROW:
case dojo.keys.UP_ARROW:
_56c=false;
case dojo.keys.RIGHT_ARROW:
case dojo.keys.DOWN_ARROW:
var _56d=this.getChildren();
var _56e=dojo.indexOf(_56d,this.pane2button[this._currentChild]);
var _56f=_56c?1:_56d.length-1;
var next=_56d[(_56e+_56f)%_56d.length];
dojo.stopEvent(evt);
next.onClick();
break;
case dojo.keys.DELETE:
if(this._currentChild.closable){
this.onCloseButtonClick(this._currentChild);
dojo.stopEvent(evt);
}
default:
return;
}
}});
dojo.declare("dijit.layout._StackButton",dijit.form.ToggleButton,{onClick:function(evt){
if(this.focusNode){
this.focusNode.focus();
}
},onClickCloseButton:function(evt){
evt.stopPropagation();
}});
dojo.extend(dijit._Widget,{title:"",selected:false,closable:false,onClose:function(){
return true;
}});
}
if(!dojo._hasResource["dijit.layout.AccordionContainer"]){
dojo._hasResource["dijit.layout.AccordionContainer"]=true;
dojo.provide("dijit.layout.AccordionContainer");
dojo.declare("dijit.layout.AccordionContainer",dijit.layout.StackContainer,{duration:250,_verticalSpace:0,startup:function(){
dijit.layout.StackContainer.prototype.startup.apply(this,arguments);
if(this.selectedChildWidget){
var _573=this.selectedChildWidget.containerNode.style;
_573.display="";
_573.overflow="auto";
this.selectedChildWidget._setSelectedState(true);
}else{
this.getChildren()[0].focusNode.setAttribute("tabIndex","0");
}
},layout:function(){
var _574=0;
var _575=this.selectedChildWidget;
dojo.forEach(this.getChildren(),function(_576){
_574+=_576.getTitleHeight();
});
var _577=this._contentBox;
this._verticalSpace=(_577.h-_574);
if(_575){
_575.containerNode.style.height=this._verticalSpace+"px";
if(_575.resize){
_575.resize({h:this.verticalSpace});
}
}
},_setupChild:function(page){
return page;
},_transition:function(_579,_57a){
var _57b=[];
var _57c=this._verticalSpace;
if(_579){
_579.setSelected(true);
var _57d=_579.containerNode;
_57d.style.display="";
dojo.forEach(_579.getChildren(),function(_57e){
if(_57e.resize){
_57e.resize({h:_57c});
}
});
_57b.push(dojo.animateProperty({node:_57d,duration:this.duration,properties:{height:{start:"1",end:_57c}},onEnd:function(){
_57d.style.overflow="auto";
}}));
}
if(_57a){
_57a.setSelected(false);
var _57f=_57a.containerNode;
_57f.style.overflow="hidden";
_57b.push(dojo.animateProperty({node:_57f,duration:this.duration,properties:{height:{start:_57c,end:"1"}},onEnd:function(){
_57f.style.display="none";
}}));
}
dojo.fx.combine(_57b).play();
},processKey:function(evt){
if(this.disabled||evt.altKey||evt.shiftKey||evt.ctrlKey){
return;
}
var _581=true;
switch(evt.keyCode){
case dojo.keys.LEFT_ARROW:
case dojo.keys.UP_ARROW:
_581=false;
case dojo.keys.RIGHT_ARROW:
case dojo.keys.DOWN_ARROW:
var _582=this.getChildren();
var _583=dojo.indexOf(_582,evt._dijitWidget);
var _584=_581?1:_582.length-1;
var next=_582[(_583+_584)%_582.length];
dojo.stopEvent(evt);
next._onTitleClick();
break;
default:
return;
}
}});
dojo.declare("dijit.layout.AccordionPane",[dijit.layout._LayoutWidget,dijit._Templated],{title:"",selected:false,templateString:"<div class='dijitAccordionPane'\n\t><div dojoAttachPoint='titleNode;focusNode' dojoAttachEvent='onklick:_onTitleClick;onkeypress:_onKeyPress'\n\t\tclass='title' wairole=\"tab\"\n\t\t><div class='arrow'></div\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;&#9650;</div\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;&#9660;</div\n\t\t><span dojoAttachPoint='titleTextNode'>${title}</span></div\n\t><div><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\n\t\tclass='body' waiRole=\"tabpanel\"\n\t></div></div>\n</div>\n",postCreate:function(){
dijit.layout.AccordionPane.superclass.postCreate.apply(this,arguments);
dojo.addClass(this.domNode,this["class"]);
dojo.setSelectable(this.titleNode,false);
this.setSelected(this.selected);
},getTitleHeight:function(){
return dojo.marginBox(this.titleNode).h;
},_onTitleClick:function(){
var _586=this.getParent();
_586.selectChild(this);
this.focusNode.focus();
},_onKeyPress:function(evt){
evt._dijitWidget=this;
return this.getParent().processKey(evt);
},_setSelectedState:function(_588){
this.selected=_588;
(_588?dojo.addClass:dojo.removeClass)(this.domNode,"dijitAccordionPane-selected");
this.focusNode.setAttribute("tabIndex",(_588)?"0":"-1");
},setSelected:function(_589){
this._setSelectedState(_589);
if(_589){
this.onSelected();
}
},onSelected:function(){
}});
}
if(!dojo._hasResource["dijit.layout.LayoutContainer"]){
dojo._hasResource["dijit.layout.LayoutContainer"]=true;
dojo.provide("dijit.layout.LayoutContainer");
dojo.declare("dijit.layout.LayoutContainer",dijit.layout._LayoutWidget,{layout:function(){
var ok=dijit.layout.layoutChildren(this.domNode,this._contentBox,this.getChildren());
},addChild:function(_58b,_58c,pos,ref,_58f){
dijit._Container.prototype.addChild.apply(this,arguments);
dijit.layout.layoutChildren(this.domNode,this._contentBox,this.getChildren());
},removeChild:function(pane){
dijit._Container.prototype.removeChild.apply(this,arguments);
dijit.layout.layoutChildren(this.domNode,this._contentBox,this.getChildren());
}});
dojo.extend(dijit._Widget,{layoutAlign:"none"});
}
if(!dojo._hasResource["dijit.layout.LinkPane"]){
dojo._hasResource["dijit.layout.LinkPane"]=true;
dojo.provide("dijit.layout.LinkPane");
dojo.declare("dijit.layout.LinkPane",[dijit.layout.ContentPane,dijit._Templated],{templateString:"<div class=\"dijitLinkPane\"></div>",postCreate:function(){
this.title+=this.domNode.innerHTML;
dijit.layout.LinkPane.superclass.postCreate.apply(this,arguments);
}});
}
if(!dojo._hasResource["dojo.cookie"]){
dojo._hasResource["dojo.cookie"]=true;
dojo.provide("dojo.cookie");
dojo.cookie=function(name,_592,_593){
var c=document.cookie;
if(arguments.length==1){
var idx=c.lastIndexOf(name+"=");
if(idx==-1){
return null;
}
var _596=idx+name.length+1;
var end=c.indexOf(";",idx+name.length+1);
if(end==-1){
end=c.length;
}
return decodeURIComponent(c.substring(_596,end));
}else{
_593=_593||{};
_592=encodeURIComponent(_592);
if(typeof (_593.expires)=="number"){
var d=new Date();
d.setTime(d.getTime()+(_593.expires*24*60*60*1000));
_593.expires=d;
}
document.cookie=name+"="+_592+(_593.expires?"; expires="+_593.expires.toUTCString():"")+(_593.path?"; path="+_593.path:"")+(_593.domain?"; domain="+_593.domain:"")+(_593.secure?"; secure":"");
return null;
}
};
}
if(!dojo._hasResource["dijit.layout.SplitContainer"]){
dojo._hasResource["dijit.layout.SplitContainer"]=true;
dojo.provide("dijit.layout.SplitContainer");
dojo.declare("dijit.layout.SplitContainer",dijit.layout._LayoutWidget,{activeSizing:false,sizerWidth:15,orientation:"horizontal",persist:true,postMixInProperties:function(){
dijit.layout.SplitContainer.superclass.postMixInProperties.apply(this,arguments);
this.isHorizontal=(this.orientation=="horizontal");
},postCreate:function(){
dijit.layout.SplitContainer.superclass.postCreate.apply(this,arguments);
this.sizers=[];
dojo.addClass(this.domNode,"dijitSplitContainer");
if(dojo.isMozilla){
this.domNode.style.overflow="-moz-scrollbars-none";
}
if(typeof this.sizerWidth=="object"){
try{
this.sizerWidth=parseInt(this.sizerWidth.toString());
}
catch(e){
this.sizerWidth=15;
}
}
this.virtualSizer=document.createElement("div");
this.virtualSizer.style.position="relative";
this.virtualSizer.style.zIndex=10;
this.virtualSizer.className=this.isHorizontal?"dijitSplitContainerVirtualSizerH":"dijitSplitContainerVirtualSizerV";
this.domNode.appendChild(this.virtualSizer);
dojo.setSelectable(this.virtualSizer,false);
},startup:function(){
var _599=this.getChildren();
for(var i=0;i<_599.length;i++){
with(_599[i].domNode.style){
position="absolute";
}
dojo.addClass(_599[i].domNode,"dijitSplitPane");
if(i==_599.length-1){
break;
}
this._addSizer();
}
if(this.persist){
this._restoreState();
}
dijit.layout._LayoutWidget.prototype.startup.apply(this,arguments);
},_injectChild:function(_59b){
with(_59b.domNode.style){
position="absolute";
}
dojo.addClass(_59b.domNode,"dijitSplitPane");
},_addSizer:function(){
var i=this.sizers.length;
var _59d=this.sizers[i]=document.createElement("div");
_59d.className=this.isHorizontal?"dijitSplitContainerSizerH":"dijitSplitContainerSizerV";
var _59e=document.createElement("div");
_59e.className="thumb";
_59d.appendChild(_59e);
var self=this;
var _5a0=(function(){
var _5a1=i;
return function(e){
self.beginSizing(e,_5a1);
};
})();
dojo.connect(_59d,"onmousedown",_5a0);
this.domNode.appendChild(_59d);
dojo.setSelectable(_59d,false);
},removeChild:function(_5a3){
if(this.sizers.length>0){
var _5a4=this.getChildren();
for(var x=0;x<_5a4.length;x++){
if(_5a4[x]===_5a3){
var i=this.sizers.length-1;
dojo._destroyElement(this.sizers[i]);
this.sizers.length=i;
break;
}
}
}
dijit._Container.prototype.removeChild.apply(this,arguments);
this.layout();
},addChild:function(_5a7,_5a8){
dijit._Container.prototype.addChild.apply(this,arguments);
this._injectChild(_5a7);
var _5a9=this.getChildren();
if(_5a9.length>1){
this._addSizer();
}
this.layout();
},layout:function(){
this.paneWidth=this._contentBox.w;
this.paneHeight=this._contentBox.h;
var _5aa=this.getChildren();
if(_5aa.length==0){
return;
}
var _5ab=this.isHorizontal?this.paneWidth:this.paneHeight;
if(_5aa.length>1){
_5ab-=this.sizerWidth*(_5aa.length-1);
}
var _5ac=0;
for(var i=0;i<_5aa.length;i++){
_5ac+=_5aa[i].sizeShare;
}
var _5ae=_5ab/_5ac;
var _5af=0;
for(var i=0;i<_5aa.length-1;i++){
var size=Math.round(_5ae*_5aa[i].sizeShare);
_5aa[i].sizeActual=size;
_5af+=size;
}
_5aa[_5aa.length-1].sizeActual=_5ab-_5af;
this._checkSizes();
var pos=0;
var size=_5aa[0].sizeActual;
this._movePanel(_5aa[0],pos,size);
_5aa[0].position=pos;
pos+=size;
if(!this.sizers){
return;
}
for(var i=1;i<_5aa.length;i++){
if(!this.sizers[i-1]){
break;
}
this._moveSlider(this.sizers[i-1],pos,this.sizerWidth);
this.sizers[i-1].position=pos;
pos+=this.sizerWidth;
size=_5aa[i].sizeActual;
this._movePanel(_5aa[i],pos,size);
_5aa[i].position=pos;
pos+=size;
}
},_movePanel:function(_5b2,pos,size){
if(this.isHorizontal){
_5b2.domNode.style.left=pos+"px";
_5b2.domNode.style.top=0;
var box={w:size,h:this.paneHeight};
if(_5b2.resize){
_5b2.resize(box);
}else{
dojo.marginBox(_5b2.domNode,box);
}
}else{
_5b2.domNode.style.left=0;
_5b2.domNode.style.top=pos+"px";
var box={w:this.paneWidth,h:size};
if(_5b2.resize){
_5b2.resize(box);
}else{
dojo.marginBox(_5b2.domNode,box);
}
}
},_moveSlider:function(_5b6,pos,size){
if(this.isHorizontal){
_5b6.style.left=pos+"px";
_5b6.style.top=0;
dojo.marginBox(_5b6,{w:size,h:this.paneHeight});
}else{
_5b6.style.left=0;
_5b6.style.top=pos+"px";
dojo.marginBox(_5b6,{w:this.paneWidth,h:size});
}
},_growPane:function(_5b9,pane){
if(_5b9>0){
if(pane.sizeActual>pane.sizeMin){
if((pane.sizeActual-pane.sizeMin)>_5b9){
pane.sizeActual=pane.sizeActual-_5b9;
_5b9=0;
}else{
_5b9-=pane.sizeActual-pane.sizeMin;
pane.sizeActual=pane.sizeMin;
}
}
}
return _5b9;
},_checkSizes:function(){
var _5bb=0;
var _5bc=0;
var _5bd=this.getChildren();
for(var i=0;i<_5bd.length;i++){
_5bc+=_5bd[i].sizeActual;
_5bb+=_5bd[i].sizeMin;
}
if(_5bb<=_5bc){
var _5bf=0;
for(var i=0;i<_5bd.length;i++){
if(_5bd[i].sizeActual<_5bd[i].sizeMin){
_5bf+=_5bd[i].sizeMin-_5bd[i].sizeActual;
_5bd[i].sizeActual=_5bd[i].sizeMin;
}
}
if(_5bf>0){
if(this.isDraggingLeft){
for(var i=_5bd.length-1;i>=0;i--){
_5bf=this._growPane(_5bf,_5bd[i]);
}
}else{
for(var i=0;i<_5bd.length;i++){
_5bf=this._growPane(_5bf,_5bd[i]);
}
}
}
}else{
for(var i=0;i<_5bd.length;i++){
_5bd[i].sizeActual=Math.round(_5bc*(_5bd[i].sizeMin/_5bb));
}
}
},beginSizing:function(e,i){
var _5c2=this.getChildren();
this.paneBefore=_5c2[i];
this.paneAfter=_5c2[i+1];
this.isSizing=true;
this.sizingSplitter=this.sizers[i];
if(!this.cover){
this.cover=dojo.doc.createElement("div");
this.domNode.appendChild(this.cover);
var s=this.cover.style;
s.position="absolute";
s.zIndex=1;
s.top=0;
s.left=0;
s.width="100%";
s.height="100%";
}else{
this.cover.style.zIndex=1;
}
this.sizingSplitter.style.zIndex=2;
this.originPos=dojo.coords(_5c2[0].domNode,true);
if(this.isHorizontal){
var _5c4=(e.layerX?e.layerX:e.offsetX);
var _5c5=e.pageX;
this.originPos=this.originPos.x;
}else{
var _5c4=(e.layerY?e.layerY:e.offsetY);
var _5c5=e.pageY;
this.originPos=this.originPos.y;
}
this.startPoint=this.lastPoint=_5c5;
this.screenToClientOffset=_5c5-_5c4;
this.dragOffset=this.lastPoint-this.paneBefore.sizeActual-this.originPos-this.paneBefore.position;
if(!this.activeSizing){
this._showSizingLine();
}
this.connect(document.documentElement,"onmousemove","changeSizing");
this.connect(document.documentElement,"onmouseup","endSizing");
dojo.stopEvent(e);
},changeSizing:function(e){
if(!this.isSizing){
return;
}
this.lastPoint=this.isHorizontal?e.pageX:e.pageY;
if(this.activeSizing){
this.movePoint();
this._updateSize();
}else{
this.movePoint();
this._moveSizingLine();
}
dojo.stopEvent(e);
},endSizing:function(e){
if(!this.isSizing){
return;
}
if(this.cover){
this.cover.style.zIndex=-1;
}
if(!this.activeSizing){
this._hideSizingLine();
}
this._updateSize();
this.isSizing=false;
if(this.persist){
this._saveState(this);
}
},movePoint:function(){
var p=this.lastPoint-this.screenToClientOffset;
var a=p-this.dragOffset;
a=this.legaliseSplitPoint(a);
p=a+this.dragOffset;
this.lastPoint=p+this.screenToClientOffset;
},legaliseSplitPoint:function(a){
a+=this.sizingSplitter.position;
this.isDraggingLeft=(a>0)?true:false;
if(!this.activeSizing){
if(a<this.paneBefore.position+this.paneBefore.sizeMin){
a=this.paneBefore.position+this.paneBefore.sizeMin;
}
if(a>this.paneAfter.position+(this.paneAfter.sizeActual-(this.sizerWidth+this.paneAfter.sizeMin))){
a=this.paneAfter.position+(this.paneAfter.sizeActual-(this.sizerWidth+this.paneAfter.sizeMin));
}
}
a-=this.sizingSplitter.position;
this._checkSizes();
return a;
},_updateSize:function(){
var pos=this.lastPoint-this.dragOffset-this.originPos;
var _5cc=this.paneBefore.position;
var _5cd=this.paneAfter.position+this.paneAfter.sizeActual;
this.paneBefore.sizeActual=pos-_5cc;
this.paneAfter.position=pos+this.sizerWidth;
this.paneAfter.sizeActual=_5cd-this.paneAfter.position;
var _5ce=this.getChildren();
for(var i=0;i<_5ce.length;i++){
_5ce[i].sizeShare=_5ce[i].sizeActual;
}
this.layout();
},_showSizingLine:function(){
this._moveSizingLine();
if(this.isHorizontal){
dojo.marginBox(this.virtualSizer,{w:this.sizerWidth,h:this.paneHeight});
}else{
dojo.marginBox(this.virtualSizer,{w:this.paneWidth,h:this.sizerWidth});
}
this.virtualSizer.style.display="block";
},_hideSizingLine:function(){
this.virtualSizer.style.display="none";
},_moveSizingLine:function(){
if(this.isHorizontal){
var pos=this.lastPoint-this.startPoint+this.sizingSplitter.position;
this.virtualSizer.style.left=pos+"px";
}else{
var pos=(this.lastPoint-this.startPoint)+this.sizingSplitter.position;
this.virtualSizer.style.top=pos+"px";
}
},_getCookieName:function(i){
return this.id+"_"+i;
},_restoreState:function(){
var _5d2=this.getChildren();
for(var i=0;i<_5d2.length;i++){
var _5d4=this._getCookieName(i);
var _5d5=dojo.cookie(_5d4);
if(_5d5!=null){
var pos=parseInt(_5d5);
if(typeof pos=="number"){
_5d2[i].sizeShare=pos;
}
}
}
},_saveState:function(){
var _5d7=this.getChildren();
for(var i=0;i<_5d7.length;i++){
dojo.cookie(this._getCookieName(i),_5d7[i].sizeShare);
}
}});
dojo.extend(dijit._Widget,{sizeMin:10,sizeShare:10});
}
if(!dojo._hasResource["dijit.layout.TabContainer"]){
dojo._hasResource["dijit.layout.TabContainer"]=true;
dojo.provide("dijit.layout.TabContainer");
dojo.declare("dijit.layout.TabContainer",[dijit.layout.StackContainer,dijit._Templated],{tabPosition:"top",templateString:null,templateString:"<div class=\"dijitTabContainer\">\n\t<div dojoAttachPoint=\"tablistNode\"></div>\n\t<div class=\"dijitTabPaneWrapper\" dojoAttachPoint=\"containerNode\" dojoAttachEvent=\"onkeypress:_onKeyPress\" waiRole=\"tabpanel\"></div>\n</div>\n",postCreate:function(){
dijit.layout.TabContainer.superclass.postCreate.apply(this,arguments);
this.tablist=new dijit.layout.TabController({id:this.id+"_tablist",tabPosition:this.tabPosition,doLayout:this.doLayout,containerId:this.id},this.tablistNode);
},_setupChild:function(tab){
dojo.addClass(tab.domNode,"dijitTabPane");
dijit.layout.TabContainer.superclass._setupChild.apply(this,arguments);
return tab;
},startup:function(){
this.tablist.startup();
dijit.layout.TabContainer.superclass.startup.apply(this,arguments);
},layout:function(){
if(!this.doLayout){
return;
}
var _5da=this.tabPosition.replace(/-h/,"");
var _5db=[{domNode:this.tablist.domNode,layoutAlign:_5da},{domNode:this.containerNode,layoutAlign:"client"}];
dijit.layout.layoutChildren(this.domNode,this._contentBox,_5db);
this._containerContentBox=dijit.layout.marginBox2contentBox(this.containerNode,_5db[1]);
if(this.selectedChildWidget){
this._showChild(this.selectedChildWidget);
}
},_onKeyPress:function(e){
if((e.keyChar=="w")&&e.ctrlKey){
if(this.selectedChildWidget.closable){
this.closeChild(this.selectedChildWidget);
dojo.stopEvent(e);
}
}
},destroy:function(){
this.tablist.destroy();
dijit.layout.TabContainer.superclass.destroy.apply(this,arguments);
}});
dojo.declare("dijit.layout.TabController",dijit.layout.StackController,{templateString:"<div wairole='tablist' dojoAttachEvent='onkeypress:onkeypress'></div>",tabPosition:"top",doLayout:true,buttonWidget:"dijit.layout._TabButton",postMixInProperties:function(){
this["class"]="dijitTabLabels-"+this.tabPosition+(this.doLayout?"":" dijitTabNoLayout");
dijit.layout.TabController.superclass.postMixInProperties.apply(this,arguments);
}});
dojo.declare("dijit.layout._TabButton",dijit.layout._StackButton,{baseClass:"dijitTab",templateString:"<div baseClass='dijitTab' dojoAttachEvent='onclick:onClick; onmouseover:_onMouse; onmouseout:_onMouse'>"+"<div class='dijitTabInnerDiv' dojoAttachPoint='innerDiv'>"+"<span dojoAttachPoint='titleNode;focusNode' tabIndex='-1' waiRole='tab'>${label}</span>"+"<span dojoAttachPoint='closeButtonNode' class='closeImage'"+" dojoAttachEvent='onmouseover:_onMouse; onmouseout:_onMouse; onclick:onClickCloseButton'"+" baseClass='dijitTabCloseButton'>"+"<span dojoAttachPoint='closeText' class='closeText'>x</span>"+"</span>"+"</div>"+"</div>",postCreate:function(){
if(!this.closeButton){
this.closeButtonNode.style.display="none";
}
dijit.layout._TabButton.superclass.postCreate.apply(this,arguments);
dojo.setSelectable(this.titleNode,false);
}});
}
if(!dojo._hasResource["dijit.dijit-all"]){
dojo._hasResource["dijit.dijit-all"]=true;
console.warn("dijit-all may include much more code than your application actually requires. We strongly recommend that you investigate a custom build or the web build tool");
dojo.provide("dijit.dijit-all");
}

