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

if(!dojo._hasResource["dojo.date.stamp"]){
dojo._hasResource["dojo.date.stamp"] = true;
dojo.provide("dojo.date.stamp");

// Methods to convert dates to or from a wire (string) format using well-known conventions

dojo.date.stamp.fromISOString = function(/*String*/formattedString, /*Number?*/defaultTime){
	//	summary:
	//		Returns a Date object given a string formatted according to a subset of the ISO-8601 standard.
	//
	//	description:
	//		Accepts a string formatted according to a profile of ISO8601 as defined by
	//		RFC3339 (http://www.ietf.org/rfc/rfc3339.txt), except that partial input is allowed.
	//		Can also process dates as specified by http://www.w3.org/TR/NOTE-datetime
	//		The following combinations are valid:
	// 			* dates only
	//				yyyy
	//				yyyy-MM
	//				yyyy-MM-dd
	// 			* times only, with an optional time zone appended
	//				THH:mm
	//				THH:mm:ss
	//				THH:mm:ss.SSS
	// 			* and "datetimes" which could be any combination of the above
	//		timezones may be specified as Z (for UTC) or +/- followed by a time expression HH:mm
	//		Assumes the local time zone if not specified.  Does not validate.  Improperly formatted
	//		input may return null.  Arguments which are out of bounds will be handled
	// 		by the Date constructor (e.g. January 32nd typically gets resolved to February 1st)
	//
  	//	formattedString:
	//		A string such as 2005-06-30T08:05:00-07:00 or 2005-06-30 or T08:05:00
	//
	//	defaultTime:
	//		Used for defaults for fields omitted in the formattedString.
	//		Uses 1970-01-01T00:00:00.0Z by default.

	if(!dojo.date.stamp._isoRegExp){
		dojo.date.stamp._isoRegExp =
//TODO: could be more restrictive and check for 00-59, etc.
			/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
	}

	var match = dojo.date.stamp._isoRegExp.exec(formattedString);
	var result = null;

	if(match){
		match.shift();
		match[1] && match[1]--; // Javascript Date months are 0-based
		match[6] && (match[6] *= 1000); // Javascript Date expects fractional seconds as milliseconds

		if(defaultTime){
			// mix in defaultTime.  Relatively expensive, so use || operators for the fast path of defaultTime === 0
			defaultTime = new Date(defaultTime);
			dojo.map(["FullYear", "Month", "Date", "Hours", "Minutes", "Seconds", "Milliseconds"], function(prop){
				return defaultTime["get" + prop]();
			}).forEach(function(value, index){
				if(match[index] === undefined){
					match[index] = value;
				}
			});
		}
		result = new Date(match[0]||1970, match[1]||0, match[2]||0, match[3]||0, match[4]||0, match[5]||0, match[6]||0);

		var offset = 0;
		var zoneSign = match[7] && match[7].charAt(0);
		if(zoneSign != 'Z'){
			offset = ((match[8] || 0) * 60) + (Number(match[9]) || 0);
			if(zoneSign != '-'){ offset *= -1; }
		}
		if(zoneSign){
			offset -= result.getTimezoneOffset();
		}
		if(offset){
			result.setTime(result.getTime() + offset * 60000);
		}
	}

	return result; // Date or null
}

dojo.date.stamp.toISOString = function(/*Date*/dateObject, /*Object?*/options){
	//	summary:
	//		Format a Date object as a string according a subset of the ISO-8601 standard
	//
	//	description:
	//		When options.selector is omitted, output follows RFC3339 (http://www.ietf.org/rfc/rfc3339.txt)
	//		Times are formatted using the local time zone.  Does not check bounds.
	//
	//	dateObject:
	//		A Date object
	//
	//	object {selector: string, zulu: boolean, milliseconds: boolean}
	//		selector- "date" or "time" for partial formatting of the Date object.
	//			Both date and time will be formatted by default.
	//		zulu- if true, UTC/GMT is used for a timezone
	//		milliseconds- if true, output milliseconds

	var _ = function(n){ return (n < 10) ? "0" + n : n; }
	options = options || {};
	var formattedDate = [];
	var getter = options.zulu ? "getUTC" : "get";
	var date = "";
	if(options.selector != "time"){
		date = [dateObject[getter+"FullYear"](), _(dateObject[getter+"Month"]()+1), _(dateObject[getter+"Date"]())].join('-');
	}
	formattedDate.push(date);
	if(options.selector != "date"){
		var time = [_(dateObject[getter+"Hours"]()), _(dateObject[getter+"Minutes"]()), _(dateObject[getter+"Seconds"]())].join(':');
		var millis = dateObject[getter+"Milliseconds"]();
		if(options.milliseconds){
			time += "."+ (millis < 100 ? "0" : "") + _(millis);
		}
		if(options.zulu){
			time += "Z";
		}else{
			var timezoneOffset = dateObject.getTimezoneOffset();
			var absOffset = Math.abs(timezoneOffset);
			time += (timezoneOffset > 0 ? "-" : "+") + 
				_(Math.floor(absOffset/60)) + ":" + _(absOffset%60);
		}
		formattedDate.push(time);
	}
	return formattedDate.join('T'); // String
}

}

if(!dojo._hasResource["dojo.parser"]){
dojo._hasResource["dojo.parser"] = true;
dojo.provide("dojo.parser");


dojo.parser = new function(){

	function val2type(/*Object*/ value){
		// summary:
		//		Returns name of type of given value.

		if(dojo.isString(value)){ return "string"; }
		if(typeof value == "number"){ return "number"; }
		if(typeof value == "boolean"){ return "boolean"; }
		if(dojo.isFunction(value)){ return "function"; }
		if(dojo.isArray(value)){ return "array"; } // typeof [] == "object"
		if(value instanceof Date) { return "date"; } // assume timestamp
		if(value instanceof dojo._Url){ return "url"; }
		return "object";
	}

	function str2obj(/*String*/ value, /*String*/ type){
		// summary:
		//		Convert given string value to given type
		switch(type){
			case "string":
				return value;
			case "number":
				return value.length ? Number(value) : null;
			case "boolean":
				return typeof value == "boolean" ? value : !(value.toLowerCase()=="false");
			case "function":
				if(dojo.isFunction(value)){
					return value;
				}
				try{
					if(value.search(/[^\w\.]+/i) != -1){
						// TODO: "this" here won't work
						value = dojo.parser._nameAnonFunc(new Function(value), this);
					}
					return dojo.getObject(value, false);
				}catch(e){ return new Function(); }
			case "array":
				// FIXME: should we split on "," instead?
				return value.split(/\s*;\s*/);
			case "date":
				return dojo.date.stamp.fromISOString(value);
			case "url":
//PORT FIXME: is value absolute or relative?  Need to join with "/"?
				return dojo.baseUrl + value;
			default:
				try{ eval("var tmp = "+value); return tmp; }
				catch(e){ return value; }
		}
	}

	var instanceClasses = {
		// map from fully qualified name (like "dijit.Button") to structure like
		// { cls: dijit.Button, params: {label: "string", disabled: "boolean"} }
	};
	
	function getClassInfo(/*String*/ className){
		// className:
		//		fully qualified name (like "dijit.Button")
		// returns:
		//		structure like
		//			{ 
		//				cls: dijit.Button, 
		//				params: { label: "string", disabled: "boolean"}
		//			}

		if(!instanceClasses[className]){
			// get pointer to widget class
			var cls = dojo.getObject(className);
			if(!dojo.isFunction(cls)){
				throw new Error("Could not load class '" + className +
					"'. Did you spell the name correctly and use a full path, like 'dijit.form.Button'?");
			}
			var proto = cls.prototype;
	
			// get table of parameter names & types
			var params={};
			for(var name in proto){
				if(name.charAt(0)=="_"){ continue; } 	// skip internal properties
				var defVal = proto[name];
				params[name]=val2type(defVal);
			}

			instanceClasses[className] = { cls: cls, params: params };
		}
		return instanceClasses[className];
	}

	this._functionFromScript = function(script){
		var preamble = "";
		var suffix = "";
		var argsStr = script.getAttribute("args");
		if(argsStr){
			dojo.forEach(argsStr.split(/\s*,\s*/), function(part, idx){
				preamble += "var "+part+" = arguments["+idx+"]; ";
			});
		}
		var withStr = script.getAttribute("with");
		if(withStr && withStr.length){
			dojo.forEach(withStr.split(/\s*,\s*/), function(part){
				preamble += "with("+part+"){";
				suffix += "}";
			});
		}
		return new Function(preamble+script.innerHTML+suffix);
	}

	this._wireUpMethod = function(instance, script){
		var nf = this._functionFromScript(script);
		// if there's a destination, connect it to that, otherwise run it now
		var source = script.getAttribute("event");
		if(source){
			var mode = script.getAttribute("mode");
			if(mode && (mode == "connect")){
				// FIXME: need to implement EL here!!
				dojo.connect(instance, source, instance, nf);
			}else{
				instance[source] = nf;
			}
		}else{
			nf.call(instance);
		}
	}

	this.instantiate = function(nodes){
		// summary:
		//		Takes array of nodes, and turns them into class instances and
		//		potentially calls a layout method to allow them to connect with
		//		any children		
		var thelist = [];
		dojo.forEach(nodes, function(node){
			if(!node){ return; }
			var type = node.getAttribute("dojoType");
			if((!type)||(!type.length)){ return; }
			var clsInfo = getClassInfo(type);
			var params = {};
			for(var attrName in clsInfo.params){
				var attrValue = node.getAttribute(attrName);
				if(attrValue && !dojo.isAlien(attrValue)){ // see bug#3074; ignore builtin attributes
					var attrType = clsInfo.params[attrName];
					var val = str2obj(attrValue, attrType);
					// console.debug(attrName, attrValue, val, (typeof val));
					if(val != null){
						params[attrName] = val;
					}
				}
			}
			// FIXME (perf): making two iterations of the DOM to find the
			// <script> elements feels dirty. Still need a separate iteration
			// if we do it another way, though, so we should probably benchmark
			// the various approaches at some point.

			// preambles are magic. Handle it.
			var preambles = dojo.query("> script[type='dojo/method'][event='preamble']", node).orphan();
			if(preambles.length){
				// we only support one preamble. So be it.
				params.preamble = dojo.parser._functionFromScript(preambles[0]);
			}

			// grab the rest of the scripts for processing later
			var scripts = dojo.query("> script[type='dojo/method']", node).orphan();

			var markupFactory = clsInfo.cls["markupFactory"];
			if((!markupFactory) && (clsInfo.cls["prototype"])){
				markupFactory = clsInfo.cls.prototype["markupFactory"];
			}
			// create the instance
			var instance;
			if(markupFactory){
				instance = markupFactory(params, node);
			}else{
				instance = new clsInfo.cls(params, node);
			}
			thelist.push(instance);

			// map it to the JS namespace if that makes sense
			var jsname = node.getAttribute("jsId");
			if(jsname){
				dojo.setObject(jsname, instance);
			}

			// check to see if we need to hook up events for non-declare()-built classes
			scripts.forEach(function(script){
				dojo.parser._wireUpMethod(instance, script);
			});
		});

		// Call startup on each top level instance if it makes sense (as for
		// widgets).  Parent widgets will recursively call startup on their
		// (non-top level) children
		dojo.forEach(thelist, function(instance){
			if(	instance  && 
				(instance.startup) && 
				((!instance.getParent) || (!instance.getParent()))
			){
				instance.startup();
			}
		});
		return thelist;
	};

	this.parse = function(/*DomNode?*/ rootNode){
		// summary:
		//		Search specified node (or root node) recursively for class instances,
		//		and instantiate them Searches for
		//		dojoType="qualified.class.name"
		var list = dojo.query('[dojoType]', rootNode);
		// go build the object instances
		var instances = this.instantiate(list);
		
		// FIXME: clean up any dangling scripts that we may need to run
		/*
		var scripts = dojo.query("script[type='dojo/method']", rootNode).orphan();
		scripts.forEach(function(script){
			wireUpMethod(instance, script);
		});
		*/

		return instances;
	};
}();

//Register the parser callback. It should be the first callback
//after the a11y test.

(function(){
	var parseRunner = function(){ 
		if(djConfig["parseOnLoad"] == true){
			dojo.parser.parse(); 
		}
	};

	// FIXME: need to clobber cross-dependency!!
	if(dojo.exists("dijit.util.wai.onload") && (dijit.util.wai.onload === dojo._loaders[0])){
		dojo._loaders.splice(1, 0, parseRunner);
	}else{
		dojo._loaders.unshift(parseRunner);
	}
})();

//TODO: ported from 0.4.x Dojo.  Can we reduce this?
dojo.parser._anonCtr = 0;
dojo.parser._anon = {}; // why is this property required?
dojo.parser._nameAnonFunc = function(/*Function*/anonFuncPtr, /*Object*/thisObj){
	// summary:
	//		Creates a reference to anonFuncPtr in thisObj with a completely
	//		unique name. The new name is returned as a String. 
	var jpn = "$joinpoint";
	var nso = (thisObj|| dojo.parser._anon);
	if(dojo.isIE){
		var cn = anonFuncPtr["__dojoNameCache"];
		if(cn && nso[cn] === anonFuncPtr){
			return anonFuncPtr["__dojoNameCache"];
		}
	}
	var ret = "__"+dojo.parser._anonCtr++;
	while(typeof nso[ret] != "undefined"){
		ret = "__"+dojo.parser._anonCtr++;
	}
	nso[ret] = anonFuncPtr;
	return ret; // String
}

}

if(!dojo._hasResource["dijit.util.manager"]){
dojo._hasResource["dijit.util.manager"] = true;
dojo.provide("dijit.util.manager");

dijit.util.manager = new function(){
	// summary
	//	manager class for the widgets.

	// registry of widgets
	var registry = {};

	var widgetTypeCtr = {};

	this.getUniqueId = function(/*String*/widgetType){
		// summary
		//	Generates a unique id for a given widgetType

		var id;
		do{
			id = widgetType + "_" +
				(widgetTypeCtr[widgetType] !== undefined ?
					++widgetTypeCtr[widgetType] : widgetTypeCtr[widgetType] = 0);
		}while(registry[id]);
		return id;
	}

	this.add = function(/*Widget*/ widget){
		// summary
		//	Adds a widget to the registry

		if(!widget.id){
			widget.id = this.getUniqueId(widget.declaredClass.replace("\.","_"));
		}
		registry[widget.id] = widget;
	}

	this.remove = function(id){
		// summary
		//	Removes a widget from the registry by id, but does not destroy the widget

		delete registry[id];
	}

	this.destroyAll = function(){
		// summary
		//	Destroys all the widgets

		for(var id in registry){
			registry[id].destroy();
		}
	}

	this.getWidgets = function(){
		// summary:
		//		Returns the hash of id->widget
		return registry;
	}

	this.byNode = function(/* DOMNode */ node){
		// summary:
		//		Returns the widget as referenced by node
		return registry[node.getAttribute("widgetId")];
	}
};

if(dojo.isIE && dojo.isIE < 7){
	// Only run this for IE6 because we think it's only necessary in that case,
	// and because it causes problems on FF.  See bugt #3531 for details.
	dojo.addOnUnload(function(){
		dijit.util.manager.destroyAll();
	});
}

dijit.byId = function(/*String*/id){
	// summary:
	//		Returns a widget by its id
	return (dojo.isString(id)) ? dijit.util.manager.getWidgets()[id] : id;
};

}

if(!dojo._hasResource["dijit.util.wai"]){
dojo._hasResource["dijit.util.wai"] = true;
dojo.provide("dijit.util.wai");

dijit.util.waiNames  = ["waiRole", "waiState"];

dijit.util.wai = {
	// summary: Contains functions to set accessibility roles and states
	//		onto widget elements
	waiRole: { 	
				// name: String:
				//		information for mapping accessibility role
				name: "waiRole",
				// namespace: String:
				//		URI of the namespace for the set of roles
				"namespace": "http://www.w3.org/TR/xhtml2",
				// alias: String:
				//		The alias to assign the namespace
				alias: "x2",
				// prefix: String:
				//		The prefix to assign to the role value
				prefix: "wairole:"
	},
	waiState: {
				// name: String:
				//		information for mapping accessibility state
				name: "waiState",
				// namespace: String:
				//		URI of the namespace for the set of states
				"namespace": "http://www.w3.org/2005/07/aaa",
				// alias: String:
				//		The alias to assign the namespace
				alias: "aaa",
				// prefix: String:
				//		empty string - state value does not require prefix
				prefix: ""
	},
	setAttr: function(/*DomNode*/node, /*String*/ ns, /*String*/ attr, /*String|Boolean*/value){
		// summary: Use appropriate API to set the role or state attribute onto the element.
		// description: In IE use the generic setAttribute() api.  Append a namespace
		//   alias to the attribute name and appropriate prefix to the value.
		//   Otherwise, use the setAttribueNS api to set the namespaced attribute. Also
		//   add the appropriate prefix to the attribute value.
		if(dojo.isIE){
			node.setAttribute(this[ns].alias+":"+ attr, this[ns].prefix+value);
		}else{
			node.setAttributeNS(this[ns]["namespace"], attr, this[ns].prefix+value);
		}
	},

	getAttr: function(/*DomNode*/ node, /*String*/ ns, /*String|Boolena*/ attr){
		// Summary:  Use the appropriate API to retrieve the role or state value
		// Description: In IE use the generic getAttribute() api.  An alias value
		// 	was added to the attribute name to simulate a namespace when the attribute
		//  was set.  Otherwise use the getAttributeNS() api to retrieve the state value
		if(dojo.isIE){
			return node.getAttribute(this[ns].alias+":"+attr);
		}else{
			return node.getAttributeNS(this[ns]["namespace"], attr);
		}
	},
	removeAttr: function(/*DomNode*/ node, /*String*/ ns, /*String|Boolena*/ attr){
		// summary:  Use the appropriate API to remove the role or state value
		// description: In IE use the generic removeAttribute() api.  An alias value
		// 	was added to the attribute name to simulate a namespace when the attribute
		//  was set.  Otherwise use the removeAttributeNS() api to remove the state value
		var success = true; //only IE returns a value
		if(dojo.isIE){
			 success = node.removeAttribute(this[ns].alias+":"+attr);
		}else{
			node.removeAttributeNS(this[ns]["namespace"], attr);
		}
		return success;
	},

	onload: function(){
		// summary:
		//		Function that detects if we are in high-contrast mode or not,
		//		and sets up a timer to periodically confirm the value.
		//		figure out the background-image style property
		//		and apply that to the image.src property.
		// description:
		//		This must be a named function and not an anonymous
		//		function, so that the widget parsing code can make sure it
		//		registers its onload function after this function.
		//		DO NOT USE "this" within this function.

		// create div for testing if high contrast mode is on or images are turned off
		var div = document.createElement("div");
		div.id = "a11yTestNode";
		div.style.cssText = 'border: 1px solid;'
			+ 'border-color:red green;'
			+ 'position: absolute;'
			+ 'left: -999px;'
			+ 'top: -999px;'
			+ 'background-image: url("' + dojo.moduleUrl("dijit", "form/templates/blank.gif") + '");';
		dojo.body().appendChild(div);

		// test it
		function check(){
			var cs = dojo.getComputedStyle(div);
			var bkImg = cs.backgroundImage;
			var needsA11y = (cs.borderTopColor==cs.borderRightColor) || (bkImg != null && (bkImg == "none" || bkImg == "url(invalid-url:)" ));
			dojo[needsA11y ? "addClass" : "removeClass"](dojo.body(), "dijit_a11y");
		}
		if(dojo.isIE || dojo.isMoz){	// NOTE: checking in Safari messes things up
			check();
			if(dojo.isIE){
				setInterval(check, 4000);
			}
		}
	}
};

// Make sure the a11y test runs first.
dojo._loaders.unshift(dijit.util.wai.onload);

}

if(!dojo._hasResource["dijit.util.focus"]){
dojo._hasResource["dijit.util.focus"] = true;
dojo.provide("dijit.util.focus");

dijit.util.focus = new function(){
	// summary:
	//		This class is used to save the current focus / selection on the screen,
	//		and restore it later.   It's typically used for popups (menus and dialogs),
	//		but can also be used for a menubar or toolbar.   (For example, in the editor
	//		the user might type Ctrl-T to focus the toolbar, and then when he/she selects
	//		a menu choice, focus is returned to the editor window.)
	//
	//		Note that it doesn't deal with submenus off of an original menu;
	//		From this class's perspective it's all part of one big menu.
	//
	//		The widget must implement a close() callback, which will close dialogs or
	//		a context menu, and for a menubar, it will close the submenus and remove
	//		highlighting classes on the root node.


	/////////////////////////////////////////////////////////////
	// Keep track of currently focused and previously focused element

	var curFocus, prevFocus;	
	function onFocus(/*DomNode*/ node){
		if(node && node.tagName=="body"){
			node=null;
		}
		if(node !== curFocus){
			prevFocus = curFocus;
			curFocus = node;
			
			// Publish event that this node received focus.
			// Note that on IE this event comes late (up to 100ms late) so it may be out of order
			// w.r.t. other events.   Use sparingly.
			dojo.publish("focus", [node]);
		}
	}

	dojo.addOnLoad(function(){
		if(dojo.isIE){
			// TODO: to make this more deterministic should delay updating curFocus/prevFocus for 10ms?
			window.setInterval(function(){ onFocus(document.activeElement); }, 100);
		}else{
			dojo.body().addEventListener('focus', function(evt){ onFocus(evt.target); }, true);
		}
	});

	/////////////////////////////////////////////////////////////////
	// Main methods, called when a dialog/menu is opened/closed

	var isCollapsed = function(){
		// summary: return whether the current selection is empty
		var _window = dojo.global;
		var _document = dojo.doc;
		if(_document.selection){ // IE
			return _document.selection.createRange().text == "";
		}else if(_window.getSelection){
			var selection = _window.getSelection();
			if(dojo.isString(selection)){ // Safari
				return selection == "";
			}else{ // Mozilla/W3
				return selection.isCollapsed || selection.toString() == "";
			}
		}
	};

	var getBookmark = function(){
		// summary: Retrieves a bookmark that can be used with moveToBookmark to return to the same range
		var bookmark;
		var _document = dojo.doc;
		if(_document.selection){ // IE
			var range = _document.selection.createRange();
			if(_document.selection.type.toUpperCase()=='CONTROL'){
				if(range.length){
					bookmark=[];
					var i=0;
					while(i<range.length){
						bookmark.push(range.item(i++));
					}
				}else{
					bookmark = null;
				}
			}else{
				bookmark = range.getBookmark();
			}
		}else{
			var selection;
			//TODO: why a try/catch?  check for getSelection instead?
			try{selection = dojo.global.getSelection();}
			catch(e){/*squelch*/}
			if(selection){
				var range = selection.getRangeAt(0);
				bookmark = range.cloneRange();
			}else{
				console.debug("No idea how to store the current selection for this browser!");
			}
		}
		return bookmark;
	};

	var moveToBookmark = function(/*Object*/bookmark){
		// summary: Moves current selection to a bookmark
		// bookmark: this should be a returned object from dojo.html.selection.getBookmark()
		var _document = dojo.doc;
		if(_document.selection){ // IE
			if(dojo.isArray(bookmark)){
				var range= _document.body.createControlRange();
				var i=0;
				while(i<bookmark.length){
					range.addElement(bookmark[i++]);
				}
				range.select();
			}else{
				var range = _document.selection.createRange();
				range.moveToBookmark(bookmark);
				range.select();
			}
		}else{ //Moz/W3C
			var selection;
			//TODO: why a try/catch?  check for getSelection instead?
			try{selection = dojo.global.getSelection();}
			catch(e){/*squelch*/}
			if(selection && selection.removeAllRanges){
				selection.removeAllRanges();
				selection.addRange(bookmark);
			}else{
				console.debug("No idea how to restore selection for this browser!");
			}
		}
	};

	this.save = function(/*Widget*/menu, /*Window*/ openedForWindow){
		// summary:
		//	called when a popup appears (either a top level menu or a dialog),
		//	or when a toolbar/menubar receives focus
		//
		// menu:
		//	the menu that's being opened
		//
		// openedForWindow:
		//	iframe in which menu was opened
		//
		// returns:
		//	a handle to restore focus/selection

		return {
			// Node to return focus to
			focus: dojo.isDescendant(curFocus, menu.domNode) ? prevFocus : curFocus,
			
			// Previously selected text
			bookmark: 
				!dojo.withGlobal(openedForWindow||dojo.global, isCollapsed) ?
				dojo.withGlobal(openedForWindow||dojo.global, getBookmark) :
				null,
				
			openedForWindow: openedForWindow
		};
	};

	this.restore = function(/*Object*/ handle){
		// summary:
		//	notify the manager that menu is closed; it will return focus to
		//	the specified handle

		var restoreFocus = handle.focus,
			bookmark = handle.bookmark,
			openedForWindow = openedForWindow;
			
		// focus on element that was focused before menu stole the focus
		if(restoreFocus){
			restoreFocus.focus();
		}

		//do not need to restore if current selection is not empty
		//(use keyboard to select a menu item)
		if(bookmark && dojo.withGlobal(openedForWindow||dojo.global, isCollapsed)){
			if(openedForWindow){
				openedForWindow.focus();
			}
			try{
				dojo.withGlobal(openedForWindow||dojo.global, moveToBookmark, null, [bookmark]);
			}catch(e){
				/*squelch IE internal error, see http://trac.dojotoolkit.org/ticket/1984 */
			}
		}
	};
}();

}

if(!dojo._hasResource["dijit.util.place"]){
dojo._hasResource["dijit.util.place"] = true;
dojo.provide("dijit.util.place");

// ported from dojo.html.util

dijit.util.getViewport = function(){
	//	summary
	//	Returns the dimensions and scroll position of the viewable area of a browser window

	var _window = dojo.global;
	var _document = dojo.doc;

	// get viewport size
	var w = 0, h = 0;
	if(dojo.isMozilla){
		// mozilla
		w = _document.documentElement.clientWidth;
		h = _window.innerHeight;
	}else if(!dojo.isOpera && _window.innerWidth){
		//in opera9, dojo.body().clientWidth should be used, instead
		//of window.innerWidth/document.documentElement.clientWidth
		//so we have to check whether it is opera
		w = _window.innerWidth;
		h = _window.innerHeight;
	}else if(dojo.isIE && _document.documentElement && _document.documentElement.clientHeight){
		w = _document.documentElement.clientWidth;
		h = _document.documentElement.clientHeight;
	}else if(dojo.body().clientWidth){
		// IE5, Opera
		w = dojo.body().clientWidth;
		h = dojo.body().clientHeight;
	}
	
	// get scroll position
	var scroll = dojo._docScroll();

	return { w: w, h: h, l: scroll.x, t: scroll.y };	//	object
};

dijit.util.placeOnScreen = function(
	/* HTMLElement */	node,
	/* Object */		pos,
	/* Object */		corners,
	/* boolean? */		tryOnly){
	//	summary:
	//		Keeps 'node' in the visible area of the screen while trying to
	//		place closest to pos.x, pos.y. The input coordinates are
	//		expected to be the desired document position.
	//
	//		Set which corner(s) you want to bind to, such as
	//		
	//			placeOnScreen(node, {x: 10, y: 20}, ["TR", "BL"])
	//		
	//		The desired x/y will be treated as the topleft(TL)/topright(TR) or
	//		BottomLeft(BL)/BottomRight(BR) corner of the node. Each corner is tested
	//		and if a perfect match is found, it will be used. Otherwise, it goes through
	//		all of the specified corners, and choose the most appropriate one.
	//		
	//		NOTE: node is assumed to be absolutely or relatively positioned.
	
	var choices = dojo.map(corners, function(corner){ return { corner: corner, pos: pos }; });
	
	return dijit.util._place(node, choices);
}

dijit.util._place = function(/*HtmlElement*/ node, /* Array */ choices){
	// summary:
	//		Given a list of spots to put node, put it at the first spot where it fits,
	//		of if it doesn't fit anywhere then the place with the least overflow
	// choices: Array
	//		Array of elements like: {corner: 'TL', pos: {x: 10, y: 20} }
	//		Above example says to put the top-left corner of the node at (10,20)
			
	// get {x: 10, y: 10, w: 100, h:100} type obj representing position of
	// viewport over document
	var view = dijit.util.getViewport();

	// This won't work if the node is inside a <div style="position: relative">,
	// so reattach it to document.body.   (Otherwise, the positioning will be wrong
	// and also it might get cutoff)
	if(!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body"){
		dojo.body().appendChild(node);
	}

	// get node margin box size
	var oldDisplay = node.style.display;
	var oldVis = node.style.visibility;
	node.style.visibility = "hidden";
	node.style.display = "";
	var mb = dojo.marginBox(node);
	node.style.display = oldDisplay;
	node.style.visibility = oldVis;

	var best=null;
	for(var i=0; i<choices.length; i++){
		var corner = choices[i].corner;
		var pos = choices[i].pos;

		// coordinates and size of node with specified corner placed at pos,
		// and clipped by viewport
		var startX = (corner.charAt(1)=='L' ? pos.x : Math.max(view.l, pos.x - mb.w)),
			startY = (corner.charAt(0)=='T' ? pos.y : Math.max(view.t, pos.y -  mb.h)),
			endX = (corner.charAt(1)=='L' ? Math.min(view.l+view.w, startX+mb.w) : pos.x),
			endY = (corner.charAt(0)=='T' ? Math.min(view.t+view.h, startY+mb.h) : pos.y),
			width = endX-startX,
			height = endY-startY,
			overflow = (mb.w-width) + (mb.h-height);
			
		if(best==null || overflow<best.overflow){
			best = {
				corner: corner,
				aroundCorner: choices[i].aroundCorner,
				x: startX,
				y: startY,
				w: width,
				h: height,
				overflow: overflow
			};
		}
		if(overflow==0){
			break;
		}
	}

	node.style.left = best.x + "px";
	node.style.top = best.y + "px";
	return best;
}

dijit.util.placeOnScreenAroundElement = function(
	/* HTMLElement */	node,
	/* HTMLElement */	aroundNode,
	/* Object */		aroundCorners){

	//	summary
	//	Like placeOnScreen, except it accepts aroundNode instead of x,y
	//	and attempts to place node around it.  Uses margin box dimensions.
	//
	//	aroundCorners
	//		specify Which corner of aroundNode should be
	//		used to place the node => which corner(s) of node to use (see the
	//		corners parameter in dijit.util.placeOnScreen)
	//		e.g. {'TL': 'BL', 'BL': 'TL'}
	
	// get coordinates of aroundNode
	aroundNode = dojo.byId(aroundNode);
	var oldDisplay = aroundNode.style.display;
	aroundNode.style.display="";
	// #3172: use the slightly tighter border box instead of marginBox
	var aroundNodeW = aroundNode.offsetWidth; //mb.w;
	var aroundNodeH = aroundNode.offsetHeight; //mb.h;
	var aroundNodePos = dojo.coords(aroundNode, true);
	aroundNode.style.display=oldDisplay;

	// Generate list of possible positions for node
	var choices = [];
	for(var nodeCorner in aroundCorners){
		choices.push( {
			aroundCorner: nodeCorner,
			corner: aroundCorners[nodeCorner],
			pos: {
				x: aroundNodePos.x + (nodeCorner.charAt(1)=='L' ? 0 : aroundNodeW),
				y: aroundNodePos.y + (nodeCorner.charAt(0)=='T' ? 0 : aroundNodeH)
			}
		});
	}
	
	return dijit.util._place(node, choices);
}

}

if(!dojo._hasResource["dijit.util.window"]){
dojo._hasResource["dijit.util.window"] = true;
dojo.provide("dijit.util.window");

dijit.util.window.getDocumentWindow = function(doc){
	//	summary
	// 	Get window object associated with document doc

	// With Safari, there is not way to retrieve the window from the document, so we must fix it.
	if(dojo.isSafari && !doc._parentWindow){
		/*
			This is a Safari specific function that fix the reference to the parent
			window from the document object.
		*/
		var fix=function(win){
			win.document._parentWindow=win;
			for(var i=0; i<win.frames.length; i++){
				fix(win.frames[i]);
			}
		}
		fix(window.top);
	}

	//In some IE versions (at least 6.0), document.parentWindow does not return a
	//reference to the real window object (maybe a copy), so we must fix it as well
	//We use IE specific execScript to attach the real window reference to
	//document._parentWindow for later use
	if(dojo.isIE && window !== document.parentWindow && !doc._parentWindow){
		/*
		In IE 6, only the variable "window" can be used to connect events (others
		may be only copies).
		*/
		doc.parentWindow.execScript("document._parentWindow = window;", "Javascript");
		//to prevent memory leak, unset it after use
		//another possibility is to add an onUnload handler which seems overkill to me (liucougar)
		var win = doc._parentWindow;
		doc._parentWindow = null;
		return win;	//	Window
	}

	return doc._parentWindow || doc.parentWindow || doc.defaultView;	//	Window
}

}

if(!dojo._hasResource["dijit.util.popup"]){
dojo._hasResource["dijit.util.popup"] = true;
dojo.provide("dijit.util.popup");





dijit.util.popup = new function(){
	// summary:
	//		This class is used to show/hide popups.
	//
	//		The widget must implement a close() callback, which is called when someone
	//		clicks somewhere random on the screen.  It will hide the [chain of] context menus

	var stack = [];
	var beginZIndex=1000;
	var idGen = 1;

	this.open = function(/*Object*/ args){
		// summary:
		//		Popup the widget at the specified position
		//
		// args: Object
		//		popup: Widget
		//			widget to display,
		//		around: DomNode
		//			DOM node (typically a button); place popup relative to this node
		//		orient: Object
		//			structure specifying position of object relative to "around" node
		//		onClose: Function
		//			callback when the popup is closed
		//		submenu: Boolean
		//			Is this a submenu off of the existing popup?
		//
		// examples:
		//		1. opening at the mouse position
		//			dijit.util.popup.open({widget: menuWidget, x: evt.pageX, y: evt.pageY});
		//		2. opening the widget as a dropdown
		//			dijit.util.popup.open({widget: menuWidget, around: buttonWidget, onClose: function(){...}  });

		var widget = args.popup,
			orient = args.orient || {'BL':'TL', 'TL':'BL'},
			around = args.around,
			id = (args.around && args.around.id) ? (args.around.id+"_dropdown") : ("popup_"+idGen++);

		if(!args.submenu){
			this.closeAll();
		}
		if(stack.length == 0){
			this._beforeTopOpen(around, widget);
		}

		// make wrapper div to hold widget and possibly hold iframe behind it.
		// we can't attach the iframe as a child of the widget.domNode because
		// widget.domNode might be a <table>, <ul>, etc.
		var wrapper = dojo.doc.createElement("div");
		wrapper.id = id;
		wrapper.className="dijitPopup";
		with(wrapper.style){
			zIndex = beginZIndex + stack.length;
		}
		dojo.body().appendChild(wrapper);

		widget.domNode.style.display="";
		wrapper.appendChild(widget.domNode);

		var iframe = new dijit.util.BackgroundIframe(wrapper);

		// position the wrapper node
		var best = around ?
			dijit.util.placeOnScreenAroundElement(wrapper, around, orient) :
			dijit.util.placeOnScreen(wrapper, args, ['TL','BL','TR','BR']);

		// TODO: use effects to fade in wrapper

		stack.push({wrapper: wrapper, iframe: iframe, widget: widget, onClose: args.onClose});

		if(widget.onOpen){
			widget.onOpen(best);
		}

		return best;
	};

	this.close = function(){
		// summary:
		//		Close popup on the top of the stack (the highest z-index popup)
		var top = stack.pop();
		var wrapper = top.wrapper,
			iframe = top.iframe,
			widget = top.widget,
			onClose = top.onClose;

		// #2685: check if the widget still has a domNode so ContentPane can change its URL without getting an error
		if(!widget||!widget.domNode){ return; }
		dojo.style(widget.domNode, "display", "none");
		dojo.body().appendChild(widget.domNode);
		iframe.destroy();
		dojo._destroyElement(wrapper);

		if(widget.onClose){
			widget.onClose();
		}
		if(onClose){
			onClose();
		}

		if(stack.length == 0){
			this._afterTopClose(widget);
		}
	};

	this.closeAll = function(){
		// summary: close every popup, from top of stack down to the first one
		while(stack.length){
			this.close();
		}
	};

	this.closeTo = function(/*Widget*/ widget){
		// summary: closes every popup above specified widget
		while(stack.length && stack[stack.length-1].widget != widget){
			this.close();
		}
	};

	///////////////////////////////////////////////////////////////////////
	// Utility functions for making mouse click close popup chain
	var currentTrigger;

	this._beforeTopOpen = function(/*DomNode*/ button, /*Widget*/menu){
		// summary:
		//	Called when a popup is opened, typically a button opening a menu.
		//	Registers handlers so that clicking somewhere else on the screen will close the popup

		currentTrigger=button;

		// setup handlers to catch screen clicks and close current menu	
		this._connectHandlers();
	};

	this._afterTopClose = function(/*Widget*/menu){
		// summary:
		//	called when the top level popup is closed, but before it performs it's actions
		//	removes handlers for mouse movement detection

		// remove handlers to catch screen clicks and close current menu
		this._disconnectHandlers();

		currentTrigger = null;
	};

	this._onEvent = function(/*DomNode*/ node){
		// summary
		// Monitor clicks or focuses on elements on the screen.
		// Clicking or focusing anywhere on the screen will close the current popup hierarchy

		if(stack.length==0){ return; }

		// if they clicked on the trigger node (often a button), ignore the click
		if(currentTrigger && dojo.isDescendant(node, currentTrigger)){
			return;
		}

		// if they clicked on the popup itself then ignore it
		if(dojo.some(stack, function(elem){
			return dojo.isDescendant(node, elem.widget.domNode);
		})){
			return;
		}

		// the click didn't fall within the open popups so close all open popups
		this.closeAll();
	};

	// List of everything we need to disconnect
	this._connects = [];

	this._connectHandlers = function(/*Window?*/targetWindow){
		// summary:
		//		Listens on top window and all the iframes so that whereever
		//		the user clicks in the page, the popup menu will be closed

		if(!targetWindow){ //see comment below
			targetWindow = dijit.util.window.getDocumentWindow(window.top && window.top.document || window.document);
		}

		var self=this;
		this._connects.push(dojo.connect(targetWindow.document, "onmousedown", this, function(evt){self._onEvent(evt.target||evt.srcElement);}));
		//this._connects.push(dojo.connect(targetWindow, "onscroll", this, ???);
		this._focusListener=dojo.subscribe("focus", this, "_onEvent");

		dojo.forEach(targetWindow.frames, function(frame){
			try{
				//do not remove dijit.util.window.getDocumentWindow, see comment in it
				var win = dijit.util.window.getDocumentWindow(frame.document);
				if(win){
					this._connectHandlers(win);
				}
			}catch(e){ /* squelch error for cross domain iframes */ }
		}, this);
	};

	this._disconnectHandlers = function(){
		// summary:
		//		Disconnects handlers for mouse click etc. setup by _connectHandlers()
		dojo.forEach(this._connects, dojo.disconnect);
		this._connects=[];
		if(this._focusListener){
			dojo.unsubscribe(this._focusListener);
			this._focusListener=null;
		}
	};

	// #3531: causes errors, commenting out for now
	//dojo.addOnUnload(this, "_disconnectHandlers");
}();

dijit.util.BackgroundIframe = function(/* HTMLElement */node){
	//	summary:
	//		For IE z-index schenanigans. id attribute is required.
	//
	//	description:
	//		new dijit.util.BackgroundIframe(node)
	//			Makes a background iframe as a child of node, that fills
	//			area (and position) of node

	if(!node.id){ throw new Error("no id"); }

	if((dojo.isIE && dojo.isIE < 7) || (dojo.isFF && dojo.isFF < 3 && dojo.hasClass(dojo.body(), "dijit_a11y"))){
		var iframe;
		if(dojo.isIE){
			var html="<iframe src='javascript:\"\"'"
				+ " style='position: absolute; left: 0px; top: 0px;"
				+ " width: expression(document.getElementById(\"" + node.id + "\").offsetWidth);"
				+ " height: expression(document.getElementById(\"" + node.id + "\").offsetHeight); "
				+ "z-index: -1; filter:Alpha(Opacity=\"0\");'>";
			iframe = dojo.doc.createElement(html);
		}else{
		 	iframe = dojo.doc.createElement("iframe");
			iframe.src = 'javascript:""';
			iframe.className = "dijitBackgroundIframe";
		}
		iframe.tabIndex = -1; // Magic to prevent iframe from getting focus on tab keypress - as style didnt work.
		node.appendChild(iframe);
		this.iframe = iframe;
	}
};

dojo.extend(dijit.util.BackgroundIframe, {
	destroy: function(){
		//	summary: destroy the iframe
		if(this.iframe){
			dojo._destroyElement(this.iframe);
			delete this.iframe;
		}
	}
});

}

if(!dojo._hasResource["dijit._Widget"]){
dojo._hasResource["dijit._Widget"] = true;
dojo.provide("dijit._Widget");



dojo.declare("dijit._Widget", null,
function(params, srcNodeRef){
	// summary:
	//		To understand the process by which widgets are instantiated, it
	//		is critical to understand what other methods the constructor calls and
	//		which of them you'll want to over-ride. Of course, adventurous
	//		developers could over-ride the constructor entirely, but this should
	//		only be done as a last resort.
	//
	//		Below is a list of the methods that are called, in the order
	//		they are fired, along with notes about what they do and if/when
	//		you should over-ride them in your widget:
	//			
	//			postMixInProperties:
	//				a stub function that you can over-ride to modify
	//				variables that may have been naively assigned by
	//				mixInProperties
	//			# widget is added to manager object here
	//			buildRendering
	//				Subclasses use this method to handle all UI initialization
	//				Sets this.domNode.  Templated widgets do this automatically
	//				and otherwise it just uses the source dom node.
	//			postCreate
	//				a stub function that you can over-ride to modify take
	//				actions once the widget has been placed in the UI

	// store pointer to original dom tree
	this.srcNodeRef = dojo.byId(srcNodeRef);

	// For garbage collection.  An array of handles returned by Widget.connect()
	// Each handle returned from Widget.connect() is an array of handles from dojo.connect()
	this._connects=[];

	//mixin our passed parameters
	if(this.srcNodeRef && (typeof this.srcNodeRef.id == "string")){ this.id = this.srcNodeRef.id; }
	if(params){
		dojo.mixin(this,params);
	}

	this.postMixInProperties();
	dijit.util.manager.add(this);
	this.buildRendering();
	if(this.domNode){
		this.domNode.setAttribute("widgetId", this.id);
		if(this.srcNodeRef && this.srcNodeRef.dir){
			this.domNode.dir = this.srcNodeRef.dir;
		}
	}
	this.postCreate();

	// If srcNodeRef has been processed and removed from the DOM (e.g. TemplatedWidget) then delete it to allow GC.
	if(this.srcNodeRef && !this.srcNodeRef.parentNode){
		delete this.srcNodeRef;
	}
},
{
	// id: String
	//		a unique, opaque ID string that can be assigned by users or by the
	//		system. If the developer passes an ID which is known not to be
	//		unique, the specified ID is ignored and the system-generated ID is
	//		used instead.
	id: "",

	// lang: String
	//	Language to display this widget in (like en-us).
	//	Defaults to brower's specified preferred language (typically the language of the OS)
	lang: "",

	// dir: String
	//  Bi-directional support, as defined by the HTML DIR attribute. Either left-to-right "ltr" or right-to-left "rtl".
	dir: "",

	// srcNodeRef: DomNode
	//		pointer to original dom node
	srcNodeRef: null,

	// domNode DomNode:
	//		this is our visible representation of the widget! Other DOM
	//		Nodes may by assigned to other properties, usually through the
	//		template system's dojoAttachPonit syntax, but the domNode
	//		property is the canonical "top level" node in widget UI.
	domNode: null,

	//////////// INITIALIZATION METHODS ///////////////////////////////////////

	postMixInProperties: function(){
		// summary
		//	Called after the parameters to the widget have been read-in,
		//	but before the widget template is instantiated.
		//	Especially useful to set properties that are referenced in the widget template.
	},

	buildRendering: function(){
		// summary:
		//		Construct the UI for this widget, setting this.domNode.
		//		Most widgets will mixin TemplatedWidget, which overrides this method.
		this.domNode = this.srcNodeRef;
	},

	postCreate: function(){
		// summary:
		//		Called after a widget's dom has been setup
	},

	startup: function(){
		// summary:
		//		Called after a widget's children, and other widgets on the page, have been created.
		//		Provides an opportunity to manipulate any children before they are displayed
		//		This is useful for composite widgets that need to control or layout sub-widgets
		//		Many layout widgets can use this as a wiring phase
	},

	//////////// DESTROY FUNCTIONS ////////////////////////////////

	destroyRecursive: function(/*Boolean*/ finalize){
		// summary:
		// 		Destroy this widget and it's descendants. This is the generic
		// 		"destructor" function that all widget users should call to
		// 		cleanly discard with a widget. Once a widget is destroyed, it's
		// 		removed from the manager object.
		// finalize: Boolean
		//		is this function being called part of global environment
		//		tear-down?

		this.destroyDescendants();
		this.destroy();
	},

	destroy: function(/*Boolean*/ finalize){
		// summary:
		// 		Destroy this widget, but not its descendents
		// finalize: Boolean
		//		is this function being called part of global environment
		//		tear-down?
		this.uninitialize();
		dojo.forEach(this._connects, function(array){
			dojo.forEach(array, dojo.disconnect);
		});
		this.destroyRendering(finalize);
		dijit.util.manager.remove(this.id);
	},

	destroyRendering: function(/*Boolean*/ finalize){
		// summary:
		//		Destroys the DOM nodes associated with this widget
		// finalize: Boolean
		//		is this function being called part of global environment
		//		tear-down?

		if(this.bgIframe){
			this.bgIframe.destroy();
			delete this.bgIframe;
		}

		if(this.domNode){
			dojo._destroyElement(this.domNode);
			delete this.domNode;
		}

		if(this.srcNodeRef){
			dojo._destroyElement(this.srcNodeRef);
			delete this.srcNodeRef;
		}
	},

	destroyDescendants: function(){
		// summary:
		//		Recursively destroy the children of this widget and their
		//		descendants.

		// TODO: should I destroy in the reverse order, to go bottom up?
		dojo.forEach(this.getDescendants(), function(widget){ widget.destroy(); });
	},

	uninitialize: function(){
		// summary:
		//		stub function. Over-ride to implement custom widget tear-down
		//		behavior.
		return false;
	},

	////////////////// MISCELLANEOUS METHODS ///////////////////

	toString: function(){
		// summary:
		//		returns a string that represents the widget. When a widget is
		//		cast to a string, this method will be used to generate the
		//		output. Currently, it does not implement any sort of reversable
		//		serialization.
		return '[Widget ' + this.declaredClass + ', ' + (this.id || 'NO ID') + ']'; // String
	},

	getDescendants: function(){
		// summary:
		//	return all the descendent widgets
		var list = dojo.query('[widgetId]', this.domNode);
		return list.map(dijit.util.manager.byNode);		// Array
	},

	nodesWithKeyClick : ["input", "button"],

	connect: function(
			/*Object|null*/ obj,
			/*String*/ event,
			/*String|Function*/ method){

		// summary:
		//		Connects specified obj/event to specified method of this object
		//		and registers for disconnect() on widget destroy.
		//		Special event: "onklick" triggers on a click or enter-down or space-up
		//		Similar to dojo.connect() but takes three arguments rather than four.
		var handles =[];
		if (event == "onklick"){
			var w = this;
			// add key based click activation for unsupported nodes.
			if (!this.nodesWithKeyClick[obj.nodeName]){
				handles.push(dojo.connect(obj, "onkeydown", this,
					function(e){
						if(e.keyCode == dojo.keys.ENTER){
							return (dojo.isString(method))? 
								w[method](e) : method.call(w, e);
						}
			 		}));
				handles.push(dojo.connect(obj, "onkeyup", this,
					function(e){
						if(e.keyCode == dojo.keys.SPACE){
							return (dojo.isString(method))? 
								w[method](e) : method.call(w, e);
						}
			 		}));
			}
			event = "onclick";
		}
		handles.push(dojo.connect(obj, event, this, method));

		// return handles for FormElement and ComboBox
		this._connects.push(handles);
		return handles;
	},

	disconnect: function(/*Object*/ handles){
		// summary:
		//		Disconnects handle created by this.connect.
		//		Also removes handle from this widget's list of connects
		for(var i=0; i<this._connects.length; i++){
			if(this._connects[i]==handles){
				dojo.forEach(handles, dojo.disconnect);
				this._connects.splice(i, 1);
				return;
			}
		}
	},

	isLeftToRight: function(){
		// summary:
		//		Checks the DOM to for the text direction for bi-directional support
		//		See HTML spec, DIR attribute for more information.

		if(typeof this._ltr == "undefined"){
			this._ltr = (this.dir || dojo.getComputedStyle(this.domNode).direction) != "rtl";
		}
		return this._ltr; //Boolean
	}
});

}

if(!dojo._hasResource["dojo.string"]){
dojo._hasResource["dojo.string"] = true;
dojo.provide("dojo.string");

dojo.string.pad = function(/*String*/text, /*int*/size, /*String?*/ch, /*boolean?*/end){
	// summary:
	//		Pad a string to guarantee that it is at least 'size' length by
	//		filling with the character 'c' at either the start or end of the
	//		string. Pads at the start, by default.
	// text: the string to pad
	// size: length to provide padding
	// ch: character to pad, defaults to '0'
	// end: adds padding at the end if true, otherwise pads at start

	var out = String(text);
	if(!ch){
		ch = '0';
	}
	while(out.length < size){
		if(end){
			out += ch;
		}else{
			out = ch + out;
		}
	}
	return out;	// String
}

dojo.string.substitute = function(	/*String*/template, 
									/*Object or Array*/map, 
									/*Function?*/transform, 
									/*Object?*/thisObject){
	// summary:
	//		Performs parameterized substitutions on a string. Throws an
	//		exception if any parameter is unmatched.
	// description:
	//		For example,
	//			dojo.string.substitute("File '${0}' is not found in directory '${1}'.",["foo.html","/temp"]);
	//			dojo.string.substitute("File '${name}' is not found in directory '${info.dir}'.",{name: "foo.html", info: {dir: "/temp"}});
	//		both return
	//			"File 'foo.html' is not found in directory '/temp'."
	// template: 
	//		a string with expressions in the form ${key} to be replaced or
	//		${key:format} which specifies a format function.  NOTE syntax has
	//		changed from %{key}
	// map: where to look for substitutions
	// transform: 
	//		a function to process all parameters before substitution takes
	//		place, e.g. dojo.string.encodeXML
	// thisObject: 
	//		where to look for optional format function; default to the global
	//		namespace

	return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match, key, format){
		var value = dojo.getObject(key,false,map);
		if(format){ value = dojo.getObject(format,false,thisObject)(value);}
		if(transform){ value = transform(value); }
		return value.toString();
	}); // string
};

}

if(!dojo._hasResource["dijit._Templated"]){
dojo._hasResource["dijit._Templated"] = true;
dojo.provide("dijit._Templated");







dojo.declare("dijit._Templated",
	null,
	{
		// summary:
		//		mixin for widgets that are instantiated from a template

		// templateNode: DomNode
		//		a node that represents the widget template. Pre-empts both templateString and templatePath.
		templateNode: null,

		// templateString String:
		//		a string that represents the widget template. Pre-empts the
		//		templatePath. In builds that have their strings "interned", the
		//		templatePath is converted to an inline templateString, thereby
		//		preventing a synchronous network call.
		templateString: null,

		// templatePath: String
		//	Path to template (HTML file) for this widget
		templatePath: null,

		// widgetsInTemplate Boolean:
		//		should we parse the template to find widgets that might be
		//		declared in markup inside it? false by default.
		widgetsInTemplate: false,

		// containerNode DomNode:
		//		holds child elements. "containerNode" is generally set via a
		//		dojoAttachPoint assignment and it designates where children of
		//		the src dom node will be placed
		containerNode: null,

		// method over-ride
		buildRendering: function(){
			// summary:
			//		Construct the UI for this widget from a template.
			// description:
			// Lookup cached version of template, and download to cache if it
			// isn't there already.  Returns either a DomNode or a string, depending on
			// whether or not the template contains ${foo} replacement parameters.

			var cached = dijit._Templated.getCachedTemplate(this.templatePath, this.templateString);

			var node;
			if(dojo.isString(cached)){
				// Cache contains a string because we need to do property replacement
				// do the property replacement
				var tstr = dojo.string.substitute(cached, this, function(value){
					// Safer substitution, see heading "Attribute values" in
					// http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.3.2
					return value.toString().replace(/"/g,"&quot;"); //TODO: support a more complete set of escapes?
				}, this);

				node = dijit._Templated._createNodesFromText(tstr)[0];
			}else{
				// if it's a node, all we have to do is clone it
				node = cached.cloneNode(true);
			}

			// recurse through the node, looking for, and attaching to, our
			// attachment points which should be defined on the template node.
			this._attachTemplateNodes(node);
			if(this.srcNodeRef){
				dojo.style(node, "cssText", this.srcNodeRef.style.cssText);
				if(this.srcNodeRef.className){
					node.className += " " + this.srcNodeRef.className;
				}
			}

			this.domNode = node;
			if(this.srcNodeRef && this.srcNodeRef.parentNode){
				this.srcNodeRef.parentNode.replaceChild(this.domNode, this.srcNodeRef);
			}
			if(this.widgetsInTemplate){
				var childWidgets = dojo.parser.parse(this.domNode);
				this._attachTemplateNodes(childWidgets, function(n,p){
					return n[p];
				});
			}

			this._fillContent(this.srcNodeRef);
		},

		_fillContent: function(/*DomNode*/ source){
			// summary:
			//		relocate source contents to templated container node
			//		this.containerNode must be able to receive children, or exceptions will be thrown
			if(source){
				var dest = this.containerNode||this.domNode;
				while(source.hasChildNodes()){
					dest.appendChild(source.firstChild);
				}
			}
		},

		_attachTemplateNodes: function(rootNode, getAttrFunc){
			// summary:
			//		map widget properties and functions to the handlers specified in
			//		the dom node and it's descendants. This function iterates over all
			//		nodes and looks for these properties:
			//			* dojoAttachPoint
			//			* dojoAttachEvent	
			//			* waiRole
			//			* waiState
			// rootNode: DomNode|Array[Widgets]
			//		the node to search for properties. All children will be searched.
			// getAttrFunc: function?
			//		a function which will be used to obtain property for a given
			//		DomNode/Widget

			var trim = function(str){
				return str.replace(/^\s+|\s+$/g, "");
			};

			getAttrFunc = getAttrFunc || function(n,p){ return n.getAttribute(p); }

			var nodes = dojo.isArray(rootNode) ? rootNode : (rootNode.all || rootNode.getElementsByTagName("*"));
			var x=dojo.isArray(rootNode)?0:-1;
			for(; x<nodes.length; x++){
				var baseNode = (x == -1) ? rootNode : nodes[x];
				if(this.widgetsInTemplate && getAttrFunc(baseNode,'dojoType')){
					continue;
				}
				// Process dojoAttachPoint
				var tmpAttachPoint = getAttrFunc(baseNode, "dojoAttachPoint");
				if(tmpAttachPoint){
					var attachPoint = tmpAttachPoint.split(";");
					var z = 0, ap;
					while((ap=attachPoint[z++])){
						if(dojo.isArray(this[ap])){
							this[ap].push(baseNode);
						}else{
							this[ap]=baseNode;
						}
					}
				}

				// dojoAttachEvent
				var attachEvent = getAttrFunc(baseNode, "dojoAttachEvent");
				if(attachEvent){
					// NOTE: we want to support attributes that have the form
					// "domEvent: nativeEvent; ..."
					var evts = attachEvent.split(";");
					var y = 0, evt;
					while((evt=evts[y++])){
						if(!evt || !evt.length){ continue; }
						var thisFunc = null;
						var tevt = trim(evt);
						if(evt.indexOf(":") != -1){
							// oh, if only JS had tuple assignment
							var funcNameArr = tevt.split(":");
							tevt = trim(funcNameArr[0]);
							thisFunc = trim(funcNameArr[1]);
						}
						if(!thisFunc){
							thisFunc = tevt;
						}
						this.connect(baseNode, tevt, thisFunc);
					}
				}

				// waiRole, waiState
				dojo.forEach(["waiRole", "waiState"], function(name){
					var wai = dijit.util.wai[name];
					var values = getAttrFunc(baseNode, wai.name);
					if(values){
						var role = "role";
						dojo.forEach(values.split(";"), function(val){	// allow multiple states
							if(val.indexOf('-') != -1){
								// this is a state-value pair
								var statePair = val.split('-');
								role = statePair[0];
								val = statePair[1];
							}
							dijit.util.wai.setAttr(baseNode, wai.name, role, val);
						}, this);
					}
				}, this);
			}
		}
	}
);

// key is either templatePath or templateString; object is either string or DOM tree
dijit._Templated._templateCache = {};

dijit._Templated.getCachedTemplate = function(templatePath, templateString){
	// summary:
	//		static method to get a template based on the templatePath or
	//		templateString key
	// templatePath: String
	//		the URL to get the template from. dojo.uri.Uri is often passed as well.
	// templateString: String?
	//		a string to use in lieu of fetching the template from a URL
	// Returns:
	//	Either string (if there are ${} variables that need to be replaced) or just
	//	a DOM tree (if the node can be cloned directly)

	// is it already cached?
	var tmplts = dijit._Templated._templateCache;
	var key = templateString || templatePath;
	var cached = tmplts[key];
	if(cached){
		return cached;
	}

	// If necessary, load template string from template path
	if(!templateString){
		templateString = dijit._Templated._sanitizeTemplateString(dojo._getText(templatePath));
	}

	templateString = templateString.replace(/^\s+|\s+$/g, "");

	if(templateString.match(/\$\{([^\}]+)\}/g)){
		// there are variables in the template so all we can do is cache the string
		return (tmplts[key] = templateString); //String
	}else{
		// there are no variables in the template so we can cache the DOM tree
		return (tmplts[key] = dijit._Templated._createNodesFromText(templateString)[0]); //Node
	}
};

dijit._Templated._sanitizeTemplateString = function(/*String*/tString){
	//summary: Strips <?xml ...?> declarations so that external SVG and XML
	//documents can be added to a document without worry. Also, if the string
	//is an HTML document, only the part inside the body tag is returned.
	if(tString){
		tString = tString.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, "");
		var matches = tString.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
		if(matches){
			tString = matches[1];
		}
	}else{
		tString = "";
	}
	return tString; //String
};


if(dojo.isIE){
	dojo.addOnUnload(function(){
		var cache = dijit._Templated._templateCache;
		for(var key in cache){
			var value = cache[key];
			if(!isNaN(value.nodeType)){ // isNode equivalent
// PORT.  Fix leak			dojo.dom.destroyNode(value);
			}
			cache[key] = null;
		}
	});
}

(function(){
	var tagMap = {
		cell: {re: /^<t[dh][\s\r\n>]/i, pre: "<table><tbody><tr>", post: "</tr></tbody></table>"},
		row: {re: /^<tr[\s\r\n>]/i, pre: "<table><tbody>", post: "</tbody></table>"},
		section: {re: /^<(thead|tbody|tfoot)[\s\r\n>]/i, pre: "<table>", post: "</table>"}
	};

	// dummy container node used temporarily to hold nodes being created
	var tn;

	dijit._Templated._createNodesFromText = function(/*String*/text){
		//	summary
		//	Attempts to create a set of nodes based on the structure of the passed text.

		if(!tn){
			tn = dojo.doc.createElement("div");
			tn.style.visibility="hidden";
		}
		var tableType = "none";
		var rtext = text.replace(/^\s+/);
		for(var type in tagMap){
			var map = tagMap[type];
			if(map.re.test(rtext)){ //FIXME: replace with one arg?  is this a no-op?
				tableType = type;
				text = map.pre + text + map.post;
				break;
			}
		}

		tn.innerHTML = text;
		dojo.body().appendChild(tn);
		if(tn.normalize){
			tn.normalize();
		}

		var tag = { cell: "tr", row: "tbody", section: "table" }[tableType];
		var _parent = (typeof tag != "undefined") ?
						tn.getElementsByTagName(tag)[0] :
						tn;

		var nodes = [];
		while(_parent.firstChild){
			nodes.push(_parent.removeChild(_parent.firstChild));
		}
		tn.innerHTML="";
		return nodes;	//	Array
	}
})();

// These arguments can be specified for widgets which are used in templates.
// Since any widget can be specified as sub widgets in template, mix it
// into the base widget class.  (This is a hack, but it's effective.)
dojo.extend(dijit._Widget,{
	dojoAttachEvent: "",
	dojoAttachPoint: "",
	waiRole: "",
	waiState:""
})

}

if(!dojo._hasResource["dijit._Container"]){
dojo._hasResource["dijit._Container"] = true;
dojo.provide("dijit._Container");



dojo.declare("dijit._Contained",
	null,
	{
		// summary
		//		Mixin for widgets that are children of a container widget

		getParent: function(){
			// summary:
			//		returns the parent widget of this widget, assuming the parent
			//		implements dijit._Container
			for(var p=this.domNode.parentNode; p; p=p.parentNode){
				var id = p.getAttribute && p.getAttribute("widgetId");
				if(id){
					var parent = dijit.byId(id);
					return parent.isContainer ? parent : null;
				}
			}
			return null;
		},

		_getSibling: function(which){
			var node = this.domNode;
			do{
				node = node[which+"Sibling"];
			}while(node && node.nodeType != 1);
			if(!node){ return null; } // null
			var id = node.getAttribute("widgetId");
			return dijit.byId(id);
		},

		getPreviousSibling: function(){
			// summary:
			//		returns null if this is the first child of the parent,
			//		otherwise returns the next element sibling to the "left".

			return this._getSibling("previous");
		},

		getNextSibling: function(){
			// summary:
			//		returns null if this is the last child of the parent,
			//		otherwise returns the next element sibling to the "right".

			return this._getSibling("next");
		}
	}
);

dojo.declare("dijit._Container",
	null,
	{
		// summary
		//		Mixin for widgets that contain a list of children like SplitContainer

		isContainer: true,

		addChild: function(/*Widget*/ widget, /*int?*/ insertIndex){
			// summary:
			//		Process the given child widget, inserting it's dom node as
			//		a child of our dom node

			var containerNode = this.containerNode || this.domNode;
			if(typeof insertIndex == "undefined"){
				insertIndex = "last";
			}
			dojo.place(widget.domNode, containerNode, insertIndex);
		},

		removeChild: function(/*Widget*/ widget){
			// summary:
			//		removes the passed widget instance from this widget but does
			//		not destroy it
			var node = widget.domNode;
			node.parentNode.removeChild(node);	// detach but don't destroy
		},

		_nextElement: function(node){
			do{
				node = node.nextSibling;
			}while(node && node.nodeType != 1);
			return node;
		},

		_firstElement: function(node){
			node = node.firstChild;
			if(node && node.nodeType != 1){
				node = this._nextElement(node);
			}
			return node;
		},

		getChildren: function(){
			// summary:
			//		returns array of children widgets
			return dojo.query("> [widgetId]", this.containerNode || this.domNode).map(dijit.util.manager.byNode); // Array
		},

		hasChildren: function(){
			// summary:
			//		returns true if widget has children
			var cn = this.containerNode || this.domNode;
			return !!this._firstElement(cn); // Boolean
		}
	}
);

}

if(!dojo._hasResource["dijit.layout._LayoutWidget"]){
dojo._hasResource["dijit.layout._LayoutWidget"] = true;
dojo.provide("dijit.layout._LayoutWidget");




dojo.declare("dijit.layout._LayoutWidget",
	[dijit._Widget, dijit._Container, dijit._Contained],
	{
		// summary
		//		Mixin for widgets that contain a list of children like SplitContainer.
		//		Widgets which mixin this code must define layout() to lay out the children

		isLayoutContainer: true,

		startup: function(){
			// summary:
			//		Called after all the widgets have been instantiated and their
			//		dom nodes have been inserted somewhere under document.body.
			//
			//		Widgets should override this method to do any initialization
			//		dependent on other widgets existing, and then call
			//		this superclass method to finish things off.
			//
			//		startup() in subclasses shouldn't do anything
			//		size related because the size of the widget hasn't been set yet.

			if(this._started){
				return;
			}
			this._started=true;

			if(this.getChildren){
				dojo.forEach(this.getChildren(), function(child){ child.startup(); });
			}

			// If I am a top level widget
			if(!this.getParent || !this.getParent()){
				// Do recursive sizing and layout of all my descendants
				this.resize();

				// since my parent isn't a layout container, and my style is width=height=100% (or something similar),
				// then I need to watch when the window resizes, and size myself accordingly
				this.connect(window, 'onresize', "resize");
			}
		},
		
		resize: function(mb){
			// summary:
			//		Explicitly set this widget's size (in pixels),
			//		and then call layout() to resize contents (and maybe adjust child widgets)
			//	
			// mb: Object?
			//		{w: int, h: int, l: int, t: int}

			var node = this.domNode;

			// set margin box size, unless it wasn't specified, in which case use current size
			if(mb){
				dojo.marginBox(node, mb);

				// set offset of the node
				if(mb.t){ node.style.top = mb.t + "px"; }
				if(mb.l){ node.style.left = mb.l + "px"; }
			}
			
			// If either height or width wasn't specified by the user, then query node for it.
			// But note that setting the margin box and then immediately querying dimensions may return
			// inaccurate results, so try not to depend on it.
			mb = dojo.mixin(dojo.marginBox(node), mb||{});

			// Save the size of my content box.
			this._contentBox = dijit.layout.marginBox2contentBox(node, mb);

			// Callback for widget to adjust size of it's children
			this.layout();
		},

		layout: function(){
			//	summary
			//		Widgets override this method to size & position their contents/children.
			//		When this is called this._contentBox is guaranteed to be set (see resize()).
			//
			//		This is called after startup(), and also when the widget's size has been
			//		changed.
		}
	}
);

dijit.layout.marginBox2contentBox = function(/*DomNode*/ node, /*Object*/ mb){
	// summary:
	//		Given the margin-box size of a node, return it's content box size.
	//		Functions like dojo.contentBox() but is more reliable since it doesn't have
	//		to wait for the browser to compute sizes.
	var cs = dojo.getComputedStyle(node);
	var me=dojo._getMarginExtents(node, cs);
	var pb=dojo._getPadBorderExtents(node, cs);
	return {
		l: dojo._toPixelValue(node, cs.paddingLeft),
		t: dojo._toPixelValue(node, cs.paddingTop),
		w: mb.w - (me.w + pb.w),
		h: mb.h - (me.h + pb.h)
	};
};

dijit.layout.layoutChildren = function(/*DomNode*/ container, /*Object*/ dim, /*Object[]*/ children){
	/**
	 * summary
	 *		Layout a bunch of child dom nodes within a parent dom node
	 * container:
	 *		parent node
	 * dim:
	 *		{l, t, w, h} object specifying dimensions of container into which to place children
	 * children:
	 *		an array like [ {domNode: foo, layoutAlign: "bottom" }, {domNode: bar, layoutAlign: "client"} ]
	 */

	// copy dim because we are going to modify it
	dim = dojo.mixin({}, dim);

	dojo.addClass(container, "dijitLayoutContainer");

	// set positions/sizes
	var ret=true;
	dojo.forEach(children, function(child){
		var elm=child.domNode,
			pos=child.layoutAlign;

		// set elem to upper left corner of unused space; may move it later
		var elmStyle = elm.style;
		elmStyle.left = dim.l+"px";
		elmStyle.top = dim.t+"px";
		elmStyle.bottom = elmStyle.right = "auto";

		var capitalize = function(word){
			return word.substring(0,1).toUpperCase() + word.substring(1);
		};
		var size = function(widget, dim){
			// size the child
			widget.resize ? widget.resize(dim) : dojo.marginBox(widget.domNode, dim);
			
			// record child's size, but favor our own numbers when we have them.
			// the browser lies sometimes
			dojo.mixin(widget, dojo.marginBox(widget.domNode));
			dojo.mixin(widget, dim);
		};

		dojo.addClass(elm, "dijitAlign" + capitalize(pos));

		// set size && adjust record of remaining space.
		// note that setting the width of a <div> may affect it's height.
		if (pos=="top" || pos=="bottom"){
			size(child, { w: dim.w });
			dim.h -= child.h;
			if(pos=="top"){
				dim.t += child.h;
			}else{
				elmStyle.top = dim.t + dim.h + "px";
			}
		}else if(pos=="left" || pos=="right"){
			size(child, { h: dim.h });
			dim.w -= child.w;
			if(pos=="left"){
				dim.l += child.w;
			}else{
				elmStyle.left = dim.l + dim.w + "px";
			}
		}else if(pos=="flood" || pos=="client"){
			size(child, dim);
		}
	});
	return ret;
};

}

if(!dojo._hasResource["dijit.util.sniff"]){
dojo._hasResource["dijit.util.sniff"] = true;
dojo.provide("dijit.util.sniff");

// ported from dojo.html.applyBrowserClass (style.js)

//	summary:
//		Applies pre-set class names based on browser & version to the
//		top-level HTML node.  Simply doing a require on this module will
//		establish this CSS.  Modified version of Morris' CSS hack.
(function(){
	var d = dojo;
	var ie = d.isIE;
	var opera = d.isOpera;
	var maj = Math.floor;
	var classes = {
		dj_ie: ie,
//		dj_ie55: ie == 5.5,
		dj_ie6: maj(ie) == 6,
		dj_ie7: maj(ie) == 7,
		dj_iequirks: ie && d.isQuirks,
// NOTE: Opera not supported by dijit
		dj_opera: opera,
		dj_opera8: maj(opera) == 8,
		dj_opera9: maj(opera) == 9,
		dj_khtml: d.isKhtml,
		dj_safari: d.isSafari,
		dj_gecko: d.isMozilla
	}; // no dojo unsupported browsers

	for(var p in classes){
		if(classes[p]){
			var html = dojo.doc.documentElement; //TODO browser-specific DOM magic needed?
			if(html.className){
				html.className += " " + p;
			}else{
				html.className = p;
			}
		}
	}
})();

}

if(!dojo._hasResource["dijit.form._FormWidget"]){
dojo._hasResource["dijit.form._FormWidget"] = true;
dojo.provide("dijit.form._FormWidget");






dojo.declare("dijit.form._FormWidget", [dijit._Widget, dijit._Templated],
{
	/*
	Summary:
		FormElement widgets correspond to native HTML elements such as <input> or <button> or <select>.
		Each FormElement represents a single input value, and has a (possibly hidden) <input> element,
		to which it serializes its input value, so that form submission (either normal submission or via FormBind?)
		works as expected.

		All these widgets should have these attributes just like native HTML input elements.
		You can set them during widget construction, but after that they are read only.

		They also share some common methods.
	*/

	// baseClass: String
	//		Used to add CSS classes like FormElementDisabled
	// TODO: remove this in favor of this.domNode.baseClass?
	baseClass: "",

	// value: String
	//		Corresponds to the native HTML <input> element's attribute.
	value: "",

	// name: String
	//		Name used when submitting form; same as "name" attribute or plain HTML elements
	name: "",

	// id: String
	//		Corresponds to the native HTML <input> element's attribute.
	//		Also becomes the id for the widget.
	id: "",

	// alt: String
	//		Corresponds to the native HTML <input> element's attribute.
	alt: "",

	// type: String
	//		Corresponds to the native HTML <input> element's attribute.
	type: "text",

	// tabIndex: Integer
	//		Order fields are traversed when user hits the tab key
	tabIndex: "0",

	// disabled: Boolean
	//		Should this widget respond to user input?
	//		In markup, this is specified as "disabled='disabled'", or just "disabled".
	disabled: false,

	enable: function(){
		// summary:
		//		enables the widget, usually involving unmasking inputs and
		//		turning on event handlers. Not implemented here.
		this._setDisabled(false);
	},

	disable: function(){
		// summary:
		//		disables the widget, usually involves masking inputs and
		//		unsetting event handlers. Not implemented here.
		this._setDisabled(true);
	},

	_setDisabled: function(/*Boolean*/ disabled){
		// summary:
		//		Set disabled state of widget.
		// TODO:
		//		not sure which parts of disabling a widget should be here;
		//		not sure which code is common to many widgets and which is specific to a particular widget.
		this.domNode.disabled = this.disabled = disabled;
		if(this.focusNode){
			this.focusNode.disabled = disabled;
		}
		dijit.util.wai.setAttr(this.focusNode || this.domNode, "waiState", "disabled", disabled);
		this._setStateClass();
	},


	_onMouse : function(/*Event*/ event){
		// summary:
		//	Sets _hovering, _active, and baseClass attributes depending on mouse state,
		//	then calls setStateClass() to set appropriate CSS class for this.domNode.
		//
		//	To get a different CSS class for hover, send onmouseover and onmouseout events to this method.
		//	To get a different CSS class while mouse button is depressed, send onmousedown to this method.

		var mouseNode = event.target;

		if(!this.disabled){
			switch(event.type){
				case "mouseover" :
					this._hovering = true;
					var baseClass, node=mouseNode;
					while( !(baseClass=node.getAttribute("baseClass")) && node != this.domNode ){
						node=node.parentNode;
					}
					this.baseClass= baseClass || "dijit"+this.declaredClass.replace(/.*\./g,"");
					break;

				case "mouseout" :	
					this._hovering = false;	
					this.baseClass=null;
					break;

				case "mousedown" :
					this._active = true;
					// set a global event to handle mouseup, so it fires properly
					//	even if the cursor leaves the button
					this._active = true;
					var self = this;
					// #2685: use this.connect and disconnect so destroy works properly
					var mouseUpConnector = this.connect(dojo.body(), "onmouseup", function(){
						self._active = false;
						self._setStateClass();
						self.disconnect(mouseUpConnector);
					});
					break;
			}
			this._setStateClass();
		}
	},

	focus: function(){
		if(this.focusNode && this.focusNode.focus){	// mozilla 1.7 doesn't have focus() func
			this.focusNode.focus();
		}
	},

	_setStateClass: function(/*String*/ base){
		// summary:
		//	Update the visual state of the widget by changing the css class on the domnode
		//	according to widget state.
		//
		//	State will be one of:
		//		<baseClass>
		//		<baseClass> + "Disabled"	- if the widget is disabled
		//		<baseClass> + "Active"		- if the mouse is being pressed down
		//		<baseClass> + "Hover"		- if the mouse is over the widget
		//
		//	For widgets which can be in a selected state (like checkbox or radio),
		//	in addition to the above classes...
		//		<baseClass> + "Selected"
		//		<baseClass> + "SelectedDisabled"	- if the widget is disabled
		//		<baseClass> + "SelectedActive"		- if the mouse is being pressed down
		//		<baseClass> + "SelectedHover"		- if the mouse is over the widget

		// get original class specified in template
		var origClass = this._origClass || (this._origClass = this.domNode.className);

		// compute the single classname representing the state of the widget
		var state = this.baseClass || this.domNode.getAttribute("baseClass");
		if(this.selected){
			state += "Selected"
		}
		if(this.disabled){
			state += "Disabled";
		}else if(this._active){
			state += "Active";
		}else if(this._hovering){
			state += "Hover";
		}
		this.domNode.className = origClass + " " + " " + state;
		//console.log(this.id + ": disabled=" + this.disabled + ", active=" + this._active + ", hover=" + this._hovering + "; state=" + state + "--> className is " + this.domNode.className);
	},

	onValueChanged: function(newValue){
		// summary: callback when value is changed
	},

	postCreate: function(){
		this._setDisabled(this.disabled == true);
		this._setStateClass();
	},

	_lastValueReported: null,
	setValue: function(newValue){
		// summary: set the value of the widget.
		dijit.util.wai.setAttr(this.focusNode || this.domNode, "waiState", "valuenow", this.forWaiValuenow());
		if(newValue != this._lastValueReported){
			this._lastValueReported = newValue;
			this.onValueChanged(newValue);
		}
	},

	getValue: function(){
		// summary: get the value of the widget.
		return this._lastValueReported;
	},

	forWaiValuenow: function(){
		// summary: returns a value, reflecting the current state of the widget,
		//		to be used for the ARIA valuenow.
		// 		This method may be overridden by subclasses that want
		// 		to use something other than this.getValue() for valuenow
		return this.getValue();
	}
});

}

if(!dojo._hasResource["dijit.dijit"]){
dojo._hasResource["dijit.dijit"] = true;
console.warn("dijit.dijit may dissapear in the 0.9 timeframe in lieu of a different rollup file!");
dojo.provide("dijit.dijit");














}

