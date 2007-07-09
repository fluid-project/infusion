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

if(!dojo._hasResource["dijit.util.typematic"]){
dojo._hasResource["dijit.util.typematic"] = true;
dojo.provide("dijit.util.typematic");

dijit.util.typematic = {
	// summary:
	//              These functions are used to repetitively call a user specified callback
	//		method when a specific key or mouse click over a specific DOM node is
	//		held down for a specific amount of time.
	//		Only 1 such event is allowed to occur on the browser page at 1 time.

	_fireEventAndReload: function(){
		this._timer = null;
		this._callback(++this._count, this._node, this._evt);
		this._currentTimeout = (this._currentTimeout < 0) ? this._initialDelay : ((this._subsequentDelay > 1) ? this._subsequentDelay : Math.round(this._currentTimeout * this._subsequentDelay));
		this._timer = setTimeout(dojo.hitch(this, "_fireEventAndReload"), this._currentTimeout);
	},

	trigger: function(/*Event*/ evt, /* Object */ _this, /*DOMNode*/ node, /* Function */ callback, /* Object */ obj, /* Number */ subsequentDelay, /* Number */ initialDelay){
		// summary:
		//      Start a timed, repeating callback sequence.
		//	If already started, the function call is ignored.
		//	This method is not normally called by the user but can be
		//	when the normal listener code is insufficient.
		//	_this: pointer to the user's widget space.
		//	callback: function name to call until the sequence is stopped.
		//	obj: any user space object to pass to the callback.
		//	subsequentDelay: if > 1, the number of milliseconds until the 3->n events occur
		//		or else the fractional time multiplier for the next event.
		//	initialDelay: the number of milliseconds until the 2nd event occurs.
		if (obj != this._obj){
			this.stop();
			this._initialDelay = initialDelay ? initialDelay : 500;
			this._subsequentDelay = subsequentDelay ? subsequentDelay : 0.90;
			this._obj = obj;
			this._evt = evt;
			this._node = node;
			this._currentTimeout = -1;
			this._count = -1;
			this._callback = dojo.hitch(_this, callback);
			this._fireEventAndReload();
		}
	},

	stop: function(){
		// summary:
		//      Stop an ongoing timed, repeating callback sequence.
		if(this._timer){
			clearTimeout(this._timer);
			this._timer = null;
		}
		if(this._obj){
			this._callback(-1, this._node, this._evt);
			this._obj = null;
		}
	},

	addKeyListener: function(/*DOMNode*/ node, /*Object*/ keyObject, /*Object*/ _this, /*Function*/ callback, /*Number*/ subsequentDelay, /*Number*/ initialDelay){
		// summary: Start listening for a specific typematic key.
		//	node: the DOM node object to listen on for key events.
		//	keyObject: an object defining the key to listen for.
		//		key: (mandatory) the keyCode (number) or character (string) to listen for.
		//		ctrlKey: desired ctrl key state to initiate the calback sequence:
		//			pressed (true)
		//			released (false)
		//			either (unspecified)
		//		altKey: same as ctrlKey but for the alt key
		//		shiftKey: same as ctrlKey but for the shift key
		//	See the trigger method for other parameters.
		var ary = [];
		ary.push(dojo.connect(node, "onkeypress", this, function(evt){
			if(evt.keyCode == keyObject.keyCode && (!keyObject.charCode || keyObject.charCode == evt.charCode)
			&& ((typeof keyObject.ctrlKey == "undefined") || keyObject.ctrlKey == evt.ctrlKey)
			&& ((typeof keyObject.altKey == "undefined") || keyObject.altKey == evt.ctrlKey)
			&& ((typeof keyObject.shiftKey == "undefined") || keyObject.shiftKey == evt.ctrlKey)){
				dojo.stopEvent(evt);
				dijit.util.typematic.trigger(keyObject, _this, node, callback, keyObject, subsequentDelay, initialDelay);
			}else if (dijit.util.typematic._obj == keyObject){
				dijit.util.typematic.stop();
			}
		}));
		ary.push(dojo.connect(node, "onkeyup", this, function(evt){
			if(dijit.util.typematic._obj == keyObject){
				dijit.util.typematic.stop();
			}
		}));
		return ary;
	},

	addMouseListener: function(/*DOMNode*/ node, /*Object*/ _this, /*Function*/ callback, /*Number*/ subsequentDelay, /*Number*/ initialDelay){
		// summary: Start listening for a typematic mouse click.
		//	node: the DOM node object to listen on for mouse events.
		//	See the trigger method for other parameters.
		var ary = [];
		ary.push(dojo.connect(node, "mousedown", this, function(evt){
			dojo.stopEvent(evt);
			dijit.util.typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay);
		}));
		ary.push(dojo.connect(node, "mouseup", this, function(evt){
			dojo.stopEvent(evt);
			dijit.util.typematic.stop();
		}));
		ary.push(dojo.connect(node, "mouseout", this, function(evt){
			dojo.stopEvent(evt);
			dijit.util.typematic.stop();
		}));
		ary.push(dojo.connect(node, "mousemove", this, function(evt){
			dojo.stopEvent(evt);
		}));
		ary.push(dojo.connect(node, "dblclick", this, function(evt){
			dojo.stopEvent(evt);
			if(dojo.isIE){
				dijit.util.typematic.trigger(evt, _this, node, callback, node, subsequentDelay, initialDelay);
				setTimeout("dijit.util.typematic.stop()",50);
			}
		}));
		return ary;
	},

	addListener: function(/*Node*/ mouseNode, /*Node*/ keyNode, /*Object*/ keyObject, /*Object*/ _this, /*Function*/ callback, /*Number*/ subsequentDelay, /*Number*/ initialDelay){
		// summary: Start listening for a specific typematic key and mouseclick.
		//	This is a thin wrapper to addKeyListener and addMouseListener.
		//	mouseNode: the DOM node object to listen on for mouse events.
		//	keyNode: the DOM node object to listen on for key events.
		//	The mouseNode is used as the callback obj parameter.
		//	See the trigger method for other parameters.
		return this.addKeyListener(keyNode, keyObject, _this, callback, subsequentDelay, initialDelay).concat(
			this.addMouseListener(mouseNode, _this, callback, subsequentDelay, initialDelay));
	}
};

}

if(!dojo._hasResource["dijit.ColorPalette"]){
dojo._hasResource["dijit.ColorPalette"] = true;
dojo.provide("dijit.ColorPalette");






dojo.declare(
		"dijit.ColorPalette",
		[dijit._Widget, dijit._Templated],
{
	// summary
	//		Grid showing various colors, so the user can pick a certain color

	// defaultTimeout: Number
	//      number of milliseconds before a held key or button becomes typematic
	defaultTimeout: 500,

	// timeoutChangeRate: Number
	//      fraction of time used to change the typematic timer between events
	//      1.0 means that each typematic event fires at defaultTimeout intervals
	//      < 1.0 means that each typematic event fires at an increasing faster rate
	timeoutChangeRate: 0.90,

	// palette: String
	//		Size of grid, either "7x10" or "3x4".
	palette: "7x10",

	//_selectedColor: String
	//		The value of the selected color.
	selectedColor: null,

	//_currentFocus: Integer
	//		Index of the currently focused color.
	_currentFocus: 0,

	// _xDim: Integer
	//		This is the number of colors horizontally across.
	_xDim: null,

	// _yDim: Integer
	///		This is the number of colors vertically down.
	_yDim: null,

	// _palettes: Map
	// 		This represents the value of the colors.
	//		The first level is a hashmap of the different arrays available
	//		The next two dimensions represent the columns and rows of colors.
	_palettes: {
		"7x10": [["fff", "fcc", "fc9", "ff9", "ffc", "9f9", "9ff", "cff", "ccf", "fcf"],
			["ccc", "f66", "f96", "ff6", "ff3", "6f9", "3ff", "6ff", "99f", "f9f"],
			["c0c0c0", "f00", "f90", "fc6", "ff0", "3f3", "6cc", "3cf", "66c", "c6c"],
			["999", "c00", "f60", "fc3", "fc0", "3c0", "0cc", "36f", "63f", "c3c"],
			["666", "900", "c60", "c93", "990", "090", "399", "33f", "60c", "939"],
			["333", "600", "930", "963", "660", "060", "366", "009", "339", "636"],
			["000", "300", "630", "633", "330", "030", "033", "006", "309", "303"]],

		"3x4": [["ffffff"/*white*/, "00ff00"/*lime*/, "008000"/*green*/, "0000ff"/*blue*/],
			["c0c0c0"/*silver*/, "ffff00"/*yellow*/, "ff00ff"/*fuchsia*/, "000080"/*navy*/],
			["808080"/*gray*/, "ff0000"/*red*/, "800080"/*purple*/, "000000"/*black*/]]
			//["00ffff"/*aqua*/, "808000"/*olive*/, "800000"/*maroon*/, "008080"/*teal*/]];
	},

	// _imagePaths: Map
	//		This is stores the path to the palette images
	_imagePaths: {
		"7x10": dojo.moduleUrl("dijit", "templates/colors7x10.png"),
		"3x4": dojo.moduleUrl("dijit", "templates/colors3x4.png")
	},

	// _paletteCoords: Map
	//		This is a map that is used to calculate the coordinates of the
	//		images that make up the palette.
	_paletteCoords: {
		"leftOffset": 3, "topOffset": 3,
		"cWidth": 18, "cHeight": 16
	},

	// templatePath: String
	//		Path to the template of this widget.
	templateString:"<fieldset class=\"dijitInlineBox\">\n\t<div style=\"overflow: hidden\" dojoAttachPoint=\"divNode\" >\n\t\t<img style=\"border-style: none;\" dojoAttachPoint=\"imageNode\" tabIndex=\"-1\" />\n\t</div>\t\n</fieldset>\n",


	_paletteDims: {
		"7x10": {"width": "185px", "height": "117px"},
		"3x4": {"width": "82px", "height": "58px"}
	},


	postCreate: function(){
		// A name has to be given to the colorMap, this needs to be unique per Palette.
		dojo.mixin(this.divNode.style, this._paletteDims[this.palette]);
		this.imageNode.setAttribute("src", this._imagePaths[this.palette]);
		var choices = this._palettes[this.palette];	
		this.domNode.style.position = "relative";
		this._highlightNodes = [];	

		for(var row=0; row < choices.length; row++){
			for(var col=0; col < choices[row].length; col++){
				var highlightNode = document.createElement("img");
				highlightNode.src = dojo.moduleUrl("dijit", "templates/blank.gif");
				dojo.addClass(highlightNode, "dijitPaletteImg");
				var color = choices[row][col];
				highlightNode.alt = highlightNode.color = color;
				var highlightStyle = highlightNode.style;
				highlightStyle.color = highlightStyle.backgroundColor = "#" + color;
				dojo.forEach(["onMouseOver", "onBlur", "onFocus", "onKeyDown"], function(handler){
					this.connect(highlightNode, handler.toLowerCase(), handler);
				}, this);
				this.connect(highlightNode, "onmousedown", "onClick");
				this.divNode.appendChild(highlightNode);
				var coords = this._paletteCoords;
				highlightStyle.top = coords.topOffset + (row * coords.cHeight) + "px";
				highlightStyle.left = coords.leftOffset + (col * coords.cWidth) + "px";
				highlightNode.setAttribute("tabIndex","-1");
				highlightNode.title = color+ " "; //color name will go here
				dijit.util.wai.setAttr(highlightNode, "waiRole", "role", "td");
				highlightNode.index = this._highlightNodes.length;
				this._highlightNodes.push(highlightNode);
			}
		}
		this._highlightNodes[this._currentFocus].tabIndex = 0;
		this._xDim = choices[0].length;
		this._yDim = choices.length;

		// Now set all events
		// The palette itself is navigated to with the tab key on the keyboard
		// Keyboard navigation within the Palette is with the arrow keys
		// Spacebar selects the color.
		// For the up key the index is changed by negative the x dimension.		

		var keyIncrementMap = {
			UP_ARROW: -this._xDim,
			// The down key the index is increase by the x dimension.	
			DOWN_ARROW: this._xDim,
			// Right and left move the index by 1.
			RIGHT_ARROW: 1,
			LEFT_ARROW: -1
		};
		for(var key in keyIncrementMap){
			dijit.util.typematic.addKeyListener(this.domNode,
				{keyCode:dojo.keys[key], ctrlKey:false, altKey:false, shiftKey:false},
				this,
				function(){
					var increment = keyIncrementMap[key];
					return function(count){ this._navigateByKey(increment, count); };
				}(),
				this.timeoutChangeRate, this.defaultTimeout);
		}
	},

	onColorSelect: function(color){
		// summary:
		//		Callback when a color is selected.
		// color: String
		//		Hex value corresponding to color.
		console.debug("Color selected is: "+color);
	},

	onClick: function(/*Event*/ evt){
		// summary:
		//		Handler when a mouse click occurs. This causes the color that is clicked to be selected.
		// evt:
		//			The click event.
		var target = evt.currentTarget;
		this._currentFocus = target.index;
		target.focus();
		this._selectColor(target);	
	},

	onMouseOver: function(evt){
		// summary:
		//		Handler for onMouseOver. This changes the color being highlighted.
		// evt:
		//		The mouse event.
		var target = evt.currentTarget;
		target.tabIndex = 0;
		target.focus();
	},

	onBlur: function(evt){
		// summary:
		//		Handler for the onBlur event. Causes the highlight Div
		//		to be destroyed.
		// evt:
		//		The blur event.
		dojo.removeClass(evt.currentTarget, "dijitPaletteImgHighlight");
	},

	onFocus: function(evt){
		// summary:
		//		Handler for onFocus. This highlights the first color in the
		//		palette if it is the first time the palette is focused.
		//		Otherwise the last color highlighted is focused.
		// evt:
		//		The focus event.
		if(this._currentFocus != evt.currentTarget.index){
			this._highlightNodes[this._currentFocus].tabIndex = -1;
		}
		this._currentFocus = evt.currentTarget.index;
		dojo.addClass(evt.currentTarget, "dijitPaletteImgHighlight");

	},

	onKeyDown: function(evt){
		// summary:
		//		Handler for the onKeyDown event.
		//		It handles space and tab being pressed.
		//		Space selects the color currently highlighted.
		//		Tab blurs the area currently highlighted.
		// evt:
		//		The keydown event.

		if((evt.keyCode == dojo.keys.SPACE) && this._currentFocus){
			this._selectColor(this._highlightNodes[this._currentFocus]);
		}
	},

	_selectColor: function(selectNode){	
		// summary:
		// 		This selects a color. It triggers the onColorSelect event
		// area:
		//		The area node that covers the color being selected.
		this.selectedColor = selectNode.color;
		this.onColorSelect(selectNode.color);
	},

	_navigateByKey: function(increment, typeCount){
		// summary:
		// 	  	This is the callback for typematic.
		// 		It changes the focus and the highlighed color.
		// increment:
		// 		How much the key is navigated.
		//	typeCount:
		//		How many times typematic has fired.

		// typecount == -1 means the key is released.
		if(typeCount == -1){ return; }

		var newFocusIndex = this._currentFocus + increment;
		if(newFocusIndex < this._highlightNodes.length && newFocusIndex > -1)
		{
			var focusNode = this._highlightNodes[newFocusIndex];
			focusNode.tabIndex = 0;
			focusNode.focus();
		}
	}
});

}

if(!dojo._hasResource["dijit.Declaration"]){
dojo._hasResource["dijit.Declaration"] = true;
dojo.provide("dijit.Declaration");



dojo.declare(
	"dijit.Declaration",
	dijit._Widget,
	{
		// summary:
		//		The Declaration widget allows a user to declare new widget
		//		classes directly from a snippet of markup.

		widgetClass: "",
		replaceVars: true,
		defaults: null,
		mixins: [],
		buildRendering: function(){
			var src = this.srcNodeRef.parentNode.removeChild(this.srcNodeRef);
			var scripts = dojo.query("> script[type='dojo/connect']", src).orphan();
			var srcType = src.nodeName;

			if(this.mixins.length){
				this.mixins = dojo.map(this.mixins, dojo.getObject);
			}else{
				this.mixins = [ dijit._Widget, dijit._Templated ];
			}
			this.mixins.push(function(){
				scripts.forEach(function(script){
					dojo.parser._wireUpConnect(this, script);
				});
			});

			var propList = this.defaults||{};
			propList.widgetsInTemplate = true;
			propList.templateString = "<"+srcType+">"+src.innerHTML+"</"+srcType+">";

			// strip things so we don't create stuff under us in the initial setup phase
			dojo.query("[dojoType]", src).forEach(function(node){
				node.removeAttribute("dojoType");
			});

			// create the new widget class
			dojo.declare(
				this.widgetClass,
				this.mixins,
				propList
			);
		}
	}
);

}

if(!dojo._hasResource["dojo.dnd.common"]){
dojo._hasResource["dojo.dnd.common"] = true;
dojo.provide("dojo.dnd.common");

dojo.dnd._copyKey = navigator.appVersion.indexOf("Macintosh") < 0 ? "ctrlKey" : "metaKey";

dojo.dnd.getCopyKeyState = function(e) {
	// summary: abstracts away the difference between selection on Mac and PC,
	//	and returns the state of the "copy" key to be pressed.
	// e: Event: mouse event
	return e[dojo.dnd._copyKey];	// Boolean
};

dojo.dnd._uniqueId = 0;
dojo.dnd.getUniqueId = function(){
	// summary: returns a unique string for use with any DOM element
	var id;
	do{
		id = "dojoUnique" + (++dojo.dnd._uniqueId);
	}while(dojo.byId(id));
	return id;
};

}

if(!dojo._hasResource["dojo.dnd.autoscroll"]){
dojo._hasResource["dojo.dnd.autoscroll"] = true;
dojo.provide("dojo.dnd.autoscroll");

dojo.dnd.getViewport = function(){
	// summary: returns a viewport size (visible part of the window)
	var d = dojo.doc, dd = d.documentElement, w = window, b = dojo.body();
	if(dojo.isMozilla){
		return {w: dd.clientWidth, h: w.innerHeight};	// Object
	}else if(!dojo.isOpera && w.innerWidth){
		return {w: w.innerWidth, h: w.innerHeight};		// Object
	}else if (!dojo.isOpera && dd && dd.clientWidth){
		return {w: dd.clientWidth, h: dd.clientHeight};	// Object
	}else if (b.clientWidth){
		return {w: b.clientWidth, h: b.clientHeight};	// Object
	}
	return null;	// Object
};

dojo.dnd.V_TRIGGER_AUTOSCROLL = 32;
dojo.dnd.H_TRIGGER_AUTOSCROLL = 32;

dojo.dnd.V_AUTOSCROLL_VALUE = 16;
dojo.dnd.H_AUTOSCROLL_VALUE = 16;

dojo.dnd.autoScroll = function(e){
	// summary: a handler for onmousemove event, which scrolls the window, if necesary
	// e: Event: onmousemove event
	var v = dojo.dnd.getViewport(), dx = 0, dy = 0;
	if(e.clientX < dojo.dnd.H_TRIGGER_AUTOSCROLL){
		dx = -dojo.dnd.H_AUTOSCROLL_VALUE;
	}else if(e.clientX > v.w - dojo.dnd.H_TRIGGER_AUTOSCROLL){
		dx = dojo.dnd.H_AUTOSCROLL_VALUE;
	}
	if(e.clientY < dojo.dnd.V_TRIGGER_AUTOSCROLL){
		dy = -dojo.dnd.V_AUTOSCROLL_VALUE;
	}else if(e.clientY > v.h - dojo.dnd.V_TRIGGER_AUTOSCROLL){
		dy = dojo.dnd.V_AUTOSCROLL_VALUE;
	}
	window.scrollBy(dx, dy);
};

dojo.dnd._validNodes = {"div": 1, "p": 1, "td": 1};
dojo.dnd._validOverflow = {"auto": 1, "scroll": 1};

dojo.dnd.autoScrollNodes = function(e){
	// summary: a handler for onmousemove event, which scrolls the first avaialble Dom element,
	//	it falls back to dojo.dnd.autoScroll()
	// e: Event: onmousemove event
	for(var n = e.target; n;){
		if(n.nodeType == 1 && (n.tagName.toLowerCase() in dojo.dnd._validNodes)){
			var s = dojo.getComputedStyle(n);
			if(s.overflow.toLowerCase() in dojo.dnd._validOverflow){
				var b = dojo._getContentBox(n, s), t = dojo._abs(n, true);
				console.debug(b.l, b.t, t.x, t.y, n.scrollLeft, n.scrollTop);
				b.l += t.x + n.scrollLeft;
				b.t += t.y + n.scrollTop;
				var w = Math.min(dojo.dnd.H_TRIGGER_AUTOSCROLL, b.w / 2), 
					h = Math.min(dojo.dnd.V_TRIGGER_AUTOSCROLL, b.h / 2),
					rx = e.pageX - b.l, ry = e.pageY - b.t, dx = 0, dy = 0;
				if(rx > 0 && rx < b.w){
					if(rx < w){
						dx = -dojo.dnd.H_AUTOSCROLL_VALUE;
					}else if(rx > b.w - w){
						dx = dojo.dnd.H_AUTOSCROLL_VALUE;
					}
				}
				//console.debug("ry =", ry, "b.h =", b.h, "h =", h);
				if(ry > 0 && ry < b.h){
					if(ry < h){
						dy = -dojo.dnd.V_AUTOSCROLL_VALUE;
					}else if(ry > b.h - h){
						dy = dojo.dnd.V_AUTOSCROLL_VALUE;
					}
				}
				var oldLeft = n.scrollLeft, oldTop = n.scrollTop;
				n.scrollLeft = n.scrollLeft + dx;
				n.scrollTop  = n.scrollTop  + dy;
				if(dx || dy) console.debug(oldLeft + ", " + oldTop + "\n" + dx + ", " + dy + "\n" + n.scrollLeft + ", " + n.scrollTop);
				if(oldLeft != n.scrollLeft || oldTop != n.scrollTop){ return; }
			}
		}
		try{
			n = n.parentNode;
		}catch(x){
			n = null;
		}
	}
	dojo.dnd.autoScroll(e);
};

}

if(!dojo._hasResource["dojo.dnd.move"]){
dojo._hasResource["dojo.dnd.move"] = true;
dojo.provide("dojo.dnd.move");




dojo.dnd.Mover = function(node, e){
	// summary: an object, which makes a node follow the mouse, 
	//	used as a default mover, and as a base class for custom movers
	// node: Node: a node (or node's id) to be moved
	// e: Event: a mouse event, which started the move;
	//	only pageX and pageY properties are used
	this.node = dojo.byId(node);
	this.marginBox = {l: e.pageX, t: e.pageY};
	var d = node.ownerDocument, firstEvent = dojo.connect(d, "onmousemove", this, "onFirstMove");
	this.events = [
		dojo.connect(d, "onmousemove", this, "onMouseMove"),
		dojo.connect(d, "onmouseup",   this, "destroy"),
		// cancel text selection and text dragging
		dojo.connect(d, "ondragstart",   dojo, "stopEvent"),
		dojo.connect(d, "onselectstart", dojo, "stopEvent"),
		firstEvent
	];
	// set globals to indicate that move has started
	dojo.publish("dndMoveStart", [this.node]);
	dojo.addClass(dojo.body(), "dojoMove"); 
	dojo.addClass(this.node, "dojoMoveItem"); 
};

dojo.extend(dojo.dnd.Mover, {
	// mouse event processors
	onMouseMove: function(e){
		// summary: event processor for onmousemove
		// e: Event: mouse event
		dojo.dnd.autoScroll(e);
		var m = this.marginBox;
		dojo.marginBox(this.node, {l: m.l + e.pageX, t: m.t + e.pageY});
	},
	// utilities
	onFirstMove: function(){
		// summary: makes the node absolute; it is meant to be called only once
		this.node.style.position = "absolute";	// enforcing the absolute mode
		var m = dojo.marginBox(this.node);
		m.l -= this.marginBox.l;
		m.t -= this.marginBox.t;
		this.marginBox = m;
		dojo.disconnect(this.events.pop());
	},
	destroy: function(){
		// summary: stops the move, deletes all references, so the object can be garbage-collected
		dojo.forEach(this.events, dojo.disconnect);
		// undo global settings
		dojo.publish("dndMoveStop", [this.node]);
		dojo.removeClass(dojo.body(), "dojoMove");
		dojo.removeClass(this.node, "dojoMoveItem");
		// destroy objects
		this.events = this.node = null;
	}
});

dojo.dnd.Moveable = function(node, opt){
	// summary: an object, which makes a node moveable
	// node: Node: a node (or node's id) to be moved
	// opt: Object: an optional object with additional parameters;
	//	following parameters are recognized:
	//		handle: Node: a node (or node's id), which is used as a mouse handle
	//			if omitted, the node itself is used as a handle
	//		delay: Number: delay move by this number of pixels
	//		skip: Boolean: skip move of form elements
	//		mover: Object: a constructor of custom Mover
	this.node = dojo.byId(node);
	this.handle = (opt && opt.handle) ? dojo.byId(opt.handle) : null;
	if(!this.handle){ this.handle = this.node; }
	this.delay = (opt && opt.delay > 0) ? opt.delay : 0;
	this.skip  = opt && opt.skip;
	this.mover = (opt && opt.mover) ? opt.mover : dojo.dnd.Mover;
	this.events = [
		dojo.connect(this.handle, "onmousedown", this, "onMouseDown"),
		// cancel text selection and text dragging
		dojo.connect(this.handle, "ondragstart",   dojo, "stopEvent"),
		dojo.connect(this.handle, "onselectstart", dojo, "stopEvent")
	];
};

dojo.extend(dojo.dnd.Moveable, {
	// mouse event processors
	onMouseDown: function(e){
		// summary: event processor for onmousedown, creates a Mover for the node
		// e: Event: mouse event
		if(this.skip){
			var t = e.target;
			if(t.nodeType == 3 /*TEXT_NODE*/){
				t = t.parentNode;
			}
			// do not trigger move if user interacts with form elements
			if(" button textarea input select option ".indexOf(" " + t.tagName.toLowerCase() + " ") >= 0) {
				return;
			}
		}
		if(this.delay){
			this.events.push(dojo.connect(this.handle, "onmousemove", this, "onMouseMove"));
			this.events.push(dojo.connect(this.handle, "onmouseup", this, "onMouseUp"));
			this._lastX = e.pageX;
			this._lastY = e.pageY;
		}else{
			new this.mover(this.node, e);
		}
		dojo.stopEvent(e);
	},
	onMouseMove: function(e){
		// summary: event processor for onmousemove, used only for delayed drags
		// e: Event: mouse event
		if(Math.abs(e.pageX - this._lastX) > this.delay || Math.abs(e.pageY - this._lastY) > this.delay){
			this.onMouseUp(e);
			new this.mover(this.node, e);
		}
		dojo.stopEvent(e);
	},
	onMouseUp: function(e){
		// summary: event processor for onmouseup, used only for delayed delayed drags
		// e: Event: mouse event
		dojo.disconnect(this.events.pop());
		dojo.disconnect(this.events.pop());
	},
	// utilities
	destroy: function(){
		// summary: stops watching for possible move, deletes all references, so the object can be garbage-collected
		dojo.forEach(this.events, dojo.disconnect);
		this.events = this.node = this.handle = null;
	}
});

dojo.dnd.constrainedMover = function(fun, within){
	// summary: returns a constrained version of dojo.dnd.Mover
	// description: this function produces n object, which will put a constraint on 
	//	the margin box of dragged object in absolute coordinates
	// fun: Function: called on drag, and returns a constraint box
	// within: Boolean: if true, constraints the whole dragged object withtin the rectangle, 
	//	otherwise the constraint is applied to the left-top corner
	var mover = function(node, e){
		dojo.dnd.Mover.call(this, node, e);
	};
	dojo.extend(mover, dojo.dnd.Mover.prototype);
	dojo.extend(mover, {
		onMouseMove: function(e){
			// summary: event processor for onmousemove
			// e: Event: mouse event
			var m = this.marginBox, c = this.constraintBox,
				l = m.l + e.pageX, t = m.t + e.pageY;
			l = l < c.l ? c.l : c.r < l ? c.r : l;
			t = t < c.t ? c.t : c.b < t ? c.b : t;
			dojo.marginBox(this.node, {l: l, t: t});
		},
		onFirstMove: function(){
			// summary: called once to initialize things; it is meant to be called only once
			dojo.dnd.Mover.prototype.onFirstMove.call(this);
			var c = this.constraintBox = fun.call(this), m = this.marginBox;
			c.r = c.l + c.w - (within ? m.w : 0);
			c.b = c.t + c.h - (within ? m.h : 0);
		}
	});
	return mover;	// Object
};

dojo.dnd.boxConstrainedMover = function(box, within){
	// summary: a specialization of dojo.dnd.constrainedMover, which constrains to the specified box
	// box: Object: a constraint box (l, t, w, h)
	// within: Boolean: if true, constraints the whole dragged object withtin the rectangle, 
	//	otherwise the constraint is applied to the left-top corner
	return dojo.dnd.constrainedMover(function(){ return box; }, within);	// Object
};

dojo.dnd.parentConstrainedMover = function(area, within){
	// summary: a specialization of dojo.dnd.constrainedMover, which constrains to the parent node
	// area: String: "margin" to constrain within the parent's margin box, "border" for the border box,
	//	"padding" for the padding box, and "content" for the content box; "content" is the default value.
	// within: Boolean: if true, constraints the whole dragged object withtin the rectangle, 
	//	otherwise the constraint is applied to the left-top corner
	var fun = function(){
		var n = this.node.parentNode, 
			s = dojo.getComputedStyle(n), 
			mb = dojo._getMarginBox(n, s);
		if(area == "margin"){
			return mb;	// Object
		}
		var t = dojo._getMarginExtents(n, s);
		mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
		if(area == "border"){
			return mb;	// Object
		}
		t = dojo._getBorderExtents(n, s);
		mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
		if(area == "padding"){
			return mb;	// Object
		}
		t = dojo._getPadExtents(n, s);
		mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
		return mb;	// Object
	};
	return dojo.dnd.constrainedMover(fun, within);	// Object
};

}

if(!dojo._hasResource["dojo.fx"]){
dojo._hasResource["dojo.fx"] = true;
dojo.provide("dojo.fx");

dojo.fx.chain = function(/*dojo._Animation[]*/ animations){
	// summary: Chain a list of _Animations to run in sequence
	var first = animations.shift();
	var previous = first;
	dojo.forEach(animations, function(current){
		dojo.connect(previous, "onEnd", current, "play");
		previous = current;
	});
	return first; // dojo._Animation
};

dojo.fx.combine = function(/*dojo._Animation[]*/ animations){
	// summary: Combine a list of _Animations to run in parallel

	var first = animations.shift();
	dojo.forEach(animations, function(current){
		dojo.forEach([
//FIXME: onEnd gets fired multiple times for each animation, not once for the combined animation
//	should we return to a "container" with its own unique events?
			"play", "pause", "stop"
		], function(event){
			if(current[event]){
				dojo.connect(first, event, current, event);
			}
		}, this);
	});
	return first; // dojo._Animation
};

dojo.fx.slideIn = function(/*Object*/ args){
	// summary: Returns an animation that will show and wipe in 
	// node defined in 'args' object. 
	args.node = dojo.byId(args.node);

	// get node height, either it's natural height or it's height specified via style or class attributes
	// (for FF, the node has to be (temporarily) rendered to measure height)
	var anim = dojo.animateProperty(dojo.mixin({
		properties: {
			height: {
				start: 1 // 0 causes IE to display the whole panel
			}
		},
		oprop: {}
	}, args));
	dojo.connect(anim, "beforeBegin", anim, function(){
		var node = this.node;
		var s = this.node.style;
		s.visibility="hidden";
		s.display="";

		//		var nodeHeight = dojo.html.getBorderBox(node).height;
		//FIXME: ok to use contentbox?
		var nodeHeight = dojo.contentBox(node).h;

		s.visibility="";
		s.display="none";
		this.properties.height.end = nodeHeight;

		var oprop = this.oprop;
		oprop.overflow = s.overflow;
		oprop.height = s.height;
		s.overflow = "hidden";
		s.height = "1px"; // 0 causes IE to display the whole panel
		dojo.style(this.node, 'display', '');
	});
	
	dojo.connect(anim, "onEnd", anim, function(){ 
		var s = this.node.style;
		var oprop = this.oprop;
		s.overflow = oprop.overflow;
		s.height = oprop.height;
	});

	return anim; // dojo._Animation
}

dojo.fx.slideOut = function(/*Object*/ args){
	// summary: Returns an animation that will wipe out and hide 
	// node defined in args Object
	var node = args.node = dojo.byId(args.node);

	var oprop = {};	// old properties of node (before we mucked w/them)
	var anim = dojo.animateProperty(dojo.mixin({
		properties: {
			height: {
				start: function(){ return dojo.contentBox(node).h; }, //FIXME: why a closure here?
				end: 1 // 0 causes IE to display the whole panel
			}
		},
		oprop: oprop
	}, args));
	dojo.connect(anim, "beforeBegin", anim, function(){
		var s=node.style;
		oprop.overflow = s.overflow;
		oprop.height = s.height;
		s.overflow = "hidden";
		dojo.style(node, 'display', '');
	});
	dojo.connect(anim, "onEnd", anim, function(){
		dojo.style(this.node, 'display', 'none');
		var s=this.node.style;
		s.overflow = oprop.overflow;
		s.height = oprop.height;
	});

	return anim; // dojo._Animation
}

dojo.fx.slideTo = function(/*Object?*/ args){
	// summary: Returns an animation that will slide "node" 
	// defined in args Object from its current position to
	// the position defined in args.coords.
	// 
	// addition mixin args needed: 
	// coords: { top: Decimal?, left: Decimal? }

	var node = args.node = dojo.byId(args.node);
	var compute = dojo.getComputedStyle;
	
	var top = null;
	var left = null;
	
	var init = (function(){
		var innerNode = node;
		return function(){
			var pos = compute(innerNode).position;
			top = (pos == 'absolute' ? node.offsetTop : parseInt(compute(node).top) || 0);
			left = (pos == 'absolute' ? node.offsetLeft : parseInt(compute(node).left) || 0);

			if(pos != 'absolute' && pos != 'relative'){
				var ret = dojo.coords(innerNode, true);
				top = ret.y;
				left = ret.x;
				innerNode.style.position="absolute";
				innerNode.style.top=top+"px";
				innerNode.style.left=left+"px";
			}
		}
	})();
	init();

	var anim = dojo.animateProperty(dojo.mixin({
		properties: {
			top: { start: top, end: args.top||0 },
			left: { start: left, end: args.left||0 }
		}
	}, args));
	dojo.connect(anim, "beforeBegin", anim, init);

	return anim; // dojo._Animation
}


}

if(!dojo._hasResource["dijit.layout.ContentPane"]){
dojo._hasResource["dijit.layout.ContentPane"] = true;
dojo.provide("dijit.layout.ContentPane");




dojo.declare(
	"dijit.layout.ContentPane",
	dijit._Widget,
{
	// summary:
	//		A widget that acts as a Container for other widgets, and includes a ajax interface
	// description:
	//		A widget that can be used as a standalone widget
	//		or as a baseclass for other widgets
	//		Handles replacement of document fragment using either external uri or javascript
	//		generated markup or DOM content, instantiating widgets within that content.
	//		Don't confuse it with an iframe, it only needs/wants document fragments.
	//		It's useful as a child of LayoutContainer, SplitContainer, or TabContainer.
	//		But note that those classes can contain any widget as a child.
	// usage:
	//		Some quick samples:
	//		To change the innerHTML use .setContent('<b>new content</b>')
	//
	//		Or you can send it a NodeList, .setContent(dojo.query('div [class=selected]', userSelection))
	//		please note that the nodes in NodeList will copied, not moved
	//
	//		To do a ajax update use .setHref('url')

	// href: String
	//		The href of the content that displays now
	//		Set this at construction if you want to load externally,
	//		changing href after creation doesn't have any effect, see setHref
	href: "",

	// extractContent: Boolean
	//	Extract visible content from inside of <body> .... </body>
	extractContent: false,

	// parseOnLoad: Boolean
	//	parse content and create the widgets, if any
	parseOnLoad:	true,

	// preventCache: Boolean
	//	Cache content retreived externally
	preventCache:	false,

	// preload: Boolean
	//	Force load of data even if pane is hidden.
	// Note:
	//		In order to delay download you need to initially hide the node it constructs from
	preload: false,

	// refreshOnShow: Boolean
	//		Refresh (re-download) content when pane goes from hidden to shown
	refreshOnShow: false,

	// loadingMessage: String
	//	Message that shows while downloading
	loadingMessage: "Loading...", //TODO: i18n or set a image containing the same info (no i18n required)

	// errorMessage: String
	//	Message that shows if an error occurs
	errorMessage: "Sorry, but an error occured", // TODO: i18n

	// isLoaded: Boolean
	//	Tells loading status see onLoad|onUnload for event hooks
	isLoaded: false,

	// class: String
	//	Class name to apply to ContentPane dom nodes
	"class": "dijitContentPane",

	postCreate: function(){
		// remove the title attribute so it doesn't show up when i hover
		// over a node
		this.domNode.title = "";

		// for programatically created ContentPane (with <span> tag), need to muck w/CSS
		// or it's as though overflow:visible is set
		dojo.addClass(this.domNode, this["class"]);
	},

	startup: function(){
		if(!this._started){
			if(!this.linkLazyLoadToParent()){
				this._loadCheck();
			}
			this._started = true;
		}
	},

	refresh: function(){
		// summary:
		//		Force a refresh (re-download) of content, be sure to turn off cache

		// we return result of _prepareLoad here to avoid code dup. in dojox.widget.ContentPane
		return this._prepareLoad(true);
	},

	setHref: function(/*String|Uri*/ href){
		// summary:
		//		Reset the (external defined) content of this pane and replace with new url
		//		Note: It delays the download until widget is shown if preload is false
		//	href:
		//		url to the page you want to get, must be within the same domain as your mainpage
		this.href = href;

		// we return result of _prepareLoad here to avoid code dup. in dojox.widget.ContentPane
		return this._prepareLoad();
	},

	setContent: function(/*String|DomNode|Nodelist*/data){
		// summary:
		//		Replaces old content with data content, include style classes from old content
		//	data:
		//		the new Content may be String, DomNode or NodeList
		//
		//		if data is a NodeList (or an array of nodes) nodes are copied
		//		so you can import nodes from another document implicitly

		// clear href so we cant run refresh and clear content
		// refresh should only work if we downloaded the content
		if(!this._isDownloaded){
			this.href = "";
			this._onUnloadHandler();
		}

		this._setContent(data || "");

		this._isDownloaded = false; // must be set after _setContent(..), pathadjust in dojox.widget.ContentPane

		if(this.parseOnLoad){
			this._createSubWidgets();
		}

		this._onLoadHandler();
	},

	cancel: function(){
		// summary
		//		Cancels a inflight download of content
		if(this._xhrDfd && (this._xhrDfd.fired == -1)){
			this._xhrDfd.cancel();
		}

		delete this._xhrDfd; // garbage collect
	},

	destroy: function(){
		// if we have multiple controllers destroying us, bail after the first
		if(this._beingDestroyed){
			return;
		}
		// make sure we call onUnload
		this._onUnloadHandler();
		this.unlinkLazyLoadFromParent();
		this._beingDestroyed = true;
		dijit.layout.ContentPane.superclass.destroy.call(this);
	},

	resize: function(size){
		dojo.marginBox(this.domNode, size);
	},

	linkLazyLoadToParent: function(){
		// summary:
		//		start to listen on parent Container selectChild publishes (lazy load)
		//		You dont need to call this method unless you manualy addChild this ContentPane to a Container
		// description:
		//		Container must be a instanceof dijit.layout.StackContainer
		//		like TabContainer, AccordionContainer etc
		//		For this method to work, this.domNode must already be
		//		inserted in DOM as a Child of Container
		if(dijit._Contained && dijit.layout.StackContainer && !this._subscr_show){
			// look upwards to find the closest stackContainer
			var p = this, ch = this;
			while(p = dijit._Contained.prototype.getParent.call(p)){
				if(p && p instanceof dijit.layout.StackContainer){ break; }
				ch = p; // containers child isn't always this widget, see AccordionPane
			}

			if(p){
				// relay published event to correct function (code reuse)
				function cb(receiver){
					return function(page){
						if(page==ch && receiver){ receiver.call(this);}
					};
				}

				// if container has this page selected, start loading..
				if(p.selectedChildWidget == ch){ this._loadCheck(); }

				this._subscr_show = dojo.subscribe(p.id+"-selectChild", this, cb(this._loadCheck));
				this._subscr_remove = dojo.subscribe(p.id+"-selectChild", this, cb(this.unlinkLazyLoadFromParent));
				return true; // Boolean
			}
		}
		return false; // Boolean
	},

	unlinkLazyLoadFromParent: function(){
		// summary:
		//		unhooks selectChild publishes from parent Container (lazy load)
		if(this._subscr_show){
			dojo.unsubscribe(this._subscr_remove);
			dojo.unsubscribe(this._subscr_show);
			this._subscr_remove = this._subscr_show = null;
		}
	},

	_loadCheck: function(){
		// call this when you change onShow (onSelected) status when selected in parent container
		// its used as a trigger for href download when this.domNode.display != 'none'
		if(this.refreshOnShow || (!this.isLoaded && this.href)){
			this._prepareLoad(this.refreshOnShow);
		}
	},

	_prepareLoad: function(forceLoad){
		// sets up for a xhrLoad, load is deferred until widget onShowor selected in parentContainer
		this.isLoaded = false;

		// defer load if until widget is showing
		if(forceLoad || this.preload || (this.domNode.style.display != 'none')){
			this._downloadExternalContent();
		}
	},

	_downloadExternalContent: function(){
		this.cancel();
		this._onUnloadHandler();

		// display loading message
		// TODO: maybe we should just set a css class with a loading image as background?
		this._setContent(
			this.onDownloadStart.call(this)
		);

		var self = this;
		var getArgs = {
			preventCache:  (this.preventCache || this.refreshOnShow),
			url: this.href,
			handleAs: "text"
		};

		var getHandler = this._xhrDfd = dojo.xhrGet(getArgs);

		getHandler.addCallback(function(html){
			try{
				self.onDownloadEnd.call(self);
				self._isDownloaded = true;
				self.setContent.call(self, html); // onload event is called from here
			}catch(err){
				self._onError.call(self, 'Content', err); // onContentError
			}
			return html;
		});

		getHandler.addErrback(function(err){
			if(!getHandler.cancelled){
				// show error message in the pane
				self._onError.call(self, 'Download', err); // onDownloadError
			}
			return err;
		});
	},

	_onLoadHandler: function(){
		this.isLoaded = true;
		try{
			this.onLoad.call(this);
		}catch(e){
			console.error('Error '+this.widgetId+' running custom onLoad code');
		}
	},

	_onUnloadHandler: function(){
		this.isLoaded = false;
		this.cancel();
		try{
			this.onUnload.call(this);
		}catch(e){
			console.error('Error '+this.widgetId+' running custom onUnload code');
		}
	},

	_setContent: function(cont){
		this.destroyDescendants();

		try{
			var node = this.containerNode || this.domNode;
			while(node.firstChild){
				dojo._destroyElement(node.firstChild);
			}
			if(typeof cont == "string"){
				// dijit.ContentPane does only minimal fixes,
				// No pathAdjustments, script retrieval, style clean etc
				// some of these should be available in the dojox.widget.ContentPane
				if(this.extractContent){
					match = cont.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
					if(match){ cont = match[1]; }
				}
				node.innerHTML = cont;
			}else{
				// domNode or NodeList
				if(cont.nodeType){ // domNode (htmlNode 1 or textNode 3)
					node.appendChild(cont);
				}else{// nodelist or array such as dojo.Nodelist
					dojo.forEach(cont, function(n){
						node.appendChild(n.cloneNode(true));
					});
				}
			}
		}catch(e){
			// check if a domfault occurs when we are appending this.errorMessage
			// like for instance if domNode is a UL and we try append a DIV
			var errMess = this.onContentError(e);
			try{
				node.innerHTML = errMess;
			}catch(e){
				console.error('Fatal '+this.id+' could not change content due to '+e.message, e);
			}
		}
	},

	_onError: function(type, err, consoleText){
		// shows user the string that is returned by on[type]Error
		// overide on[type]Error and return your own string to customize
		var errText = this['on' + type + 'Error'].call(this, err);
		if(consoleText){
			console.error(consoleText, err);
		}else if(errText){// a empty string won't change current content
			this._setContent.call(this, errText);
		}
	},

	_createSubWidgets: function(){
		// summary: scan my contents and create subwidgets
		var rootNode = this.containerNode || this.domNode;
		try{
			dojo.parser.parse(rootNode, true);
		}catch(e){
			this._onError('Content', e, "Couldn't create widgets in "+this.id
				+(this.href ? " from "+this.href : ""));
		}
	},

	// EVENT's, should be overide-able
	onLoad: function(e){
		// summary:
		//		Event hook, is called after everything is loaded and widgetified
	},

	onUnload: function(e){
		// summary:
		//		Event hook, is called before old content is cleared
	},

	onDownloadStart: function(){
		// summary:
		//		called before download starts
		//		the string returned by this function will be the html
		//		that tells the user we are loading something
		//		override with your own function if you want to change text
		return this.loadingMessage;
	},

	onContentError: function(/*Error*/ error){
		// summary:
		//		called on DOM faults, require fault etc in content
		//		default is to display errormessage inside pane
	},

	onDownloadError: function(/*Error*/ error){
		// summary:
		//		Called when download error occurs, default is to display
		//		errormessage inside pane. Overide function to change that.
		//		The string returned by this function will be the html
		//		that tells the user a error happend
		return this.errorMessage;
	},

	onDownloadEnd: function(){
		// summary:
		//		called when download is finished
	}
});

}

if(!dojo._hasResource["dijit.Dialog"]){
dojo._hasResource["dijit.Dialog"] = true;
dojo.provide("dijit.Dialog");






			// for BackgroundIFrame



dojo.declare(
	"dijit.DialogUnderlay",
	[dijit._Widget, dijit._Templated],
	{
		// summary: the thing that grays out the screen behind the dialog
		
		// Template has two divs; outer div is used for fade-in/fade-out, and also to hold background iframe.
		// Inner div has opacity specified in CSS file.
		templateString: "<div class=dijitDialogUnderlayWrapper id='${id}_underlay'><div class=dijitDialogUnderlay dojoAttachPoint='node'></div></div>",
		
		postCreate: function(){
			var b = dojo.body();
			b.appendChild(this.domNode);
			this.bgIframe = new dijit.util.BackgroundIframe(this.domNode);
		},

		layout: function(){
			// summary
			//		Sets the background to the size of the viewport (rather than the size
			//		of the document) since we need to cover the whole browser window, even
			//		if the document is only a few lines long.

			var viewport = dijit.util.getViewport();
			var is = this.node.style,
				os = this.domNode.style;

			os.top = viewport.t + "px";
			os.left = viewport.l + "px";
			is.width = viewport.w + "px";
			is.height = viewport.h + "px";
			
			// process twice since the scroll bar may have been removed
			// by the previous resizing
			var viewport2 = dijit.util.getViewport();
			if(viewport.w != viewport2.w){ is.width = viewport2.w + "px"; }
			if(viewport.h != viewport2.h){ is.height = viewport2.h + "px"; }
		},

		show: function(){
			this.domNode.style.display = "block";
			this.layout();
			if(this.bgIframe.iframe){
				this.bgIframe.iframe.style.display = "block";
			}
		},

		hide: function(){
			this.domNode.style.display = "none";
			this.domNode.style.width = this.domNode.style.height = "1px";
			if(this.bgIframe.iframe){
				this.bgIframe.iframe.style.display = "none";
			}
		},

		uninitialize: function(){
			if(this.bgIframe){
				this.bgIframe.destroy();
			}
		}
	}
);
	
dojo.declare(
	"dijit.Dialog",
	[dijit.layout.ContentPane, dijit._Templated],
	{
		// summary:
		//		Pops up a modal dialog window, blocking access to the screen
		//		and also graying out the screen Dialog is extended from
		//		ContentPane so it supports all the same parameters (href, etc.)

		templateString:"<div class=\"dijitDialog\">\n\t\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\" tabindex=\"0\" waiRole=\"dialog\" title=\"${title}\">\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\">${title}</span>\n\t\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: hide\">\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\n\t\t</span>\n\t</div>\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dijitTitlePaneContent\"></div>\n\t<span dojoAttachPoint=\"tabEnd\" dojoAttachEvent=\"onfocus:_cycleFocus;\" tabindex=\"0\"></span>\n</div>\n",

		// title: String
		//		Title of the dialog
		title: "",

		// closeNode: String
		//	Id of button or other dom node to click to close this dialog
		closeNode: "",

		_duration: 400,
		
		_lastFocusItem:null,
				
		postCreate: function(){
			dijit.Dialog.superclass.postCreate.apply(this, arguments);
			this.domNode.style.display="none";
		},

		startup: function(){
			if(this.closeNode){
				var closeNode = dojo.byId(this.closeNode);
				this.connect(closeNode, "onclick", "hide");
			}
		},

		onLoad: function(){
			// when href is specified we need to reposition
			// the dialog after the data is loaded
			this._position();
			dijit.Dialog.superclass.onLoad.call(this);
		},

		_setup: function(){
			// summary:
			//		stuff we need to do before showing the Dialog for the first
			//		time (but we defer it until right beforehand, for
			//		performance reasons)

			this._modalconnects = [];

			if(this.titleBar){
				this._moveable = new dojo.dnd.Moveable(this.domNode, { handle: this.titleBar });
			}

			this._underlay = new dijit.DialogUnderlay();

			var node = this.domNode;
			this._fadeIn = dojo.fx.combine(
				[dojo.fadeIn({
					node: node,
					duration: this._duration
				 }),
				 dojo.fadeIn({
					node: this._underlay.domNode,
					duration: this._duration,
					onBegin: dojo.hitch(this._underlay, "show")
				 })
				]
			);

			this._fadeOut = dojo.fx.combine(
				[dojo.fadeOut({
					node: node,
					duration: this._duration,
					onEnd: function(){
						node.style.display="none";
					}
				 }),
				 dojo.fadeOut({
					node: this._underlay.domNode,
					duration: this._duration,
					onEnd: dojo.hitch(this._underlay, "hide")
				 })
				]
			);
		},

		uninitialize: function(){
			if(this._underlay){
				this._underlay.destroy();
			}
		},

		_position: function(){
			// summary: position modal dialog in center of screen

			var viewport = dijit.util.getViewport();
			var mb = dojo.marginBox(this.domNode);

			var style = this.domNode.style;
			style.left = (viewport.l + (viewport.w - mb.w)/2) + "px";
			style.top = (viewport.t + (viewport.h - mb.h)/2) + "px";
		},
		
		_findLastFocus: function(/*Event*/ evt){
			// summary:  called from onblur of dialog container to determine the last focusable item 
			this._lastFocused = evt.target;
		},
		
		_cycleFocus: function(/*Event*/ evt){
			// summary: when tabEnd receives focus, advance focus around to titleBar
			
			// on first focus to tabEnd, store the last focused item in dialog
			if(!this._lastFocusItem){
				this._lastFocusItem = this._lastFocused;
			}
			this.titleBar.focus();
		},

		_onKey: function(/*Event*/ evt){
			if(evt.keyCode){
				var node = evt.target;
				// see if we are shift-tabbing from titleBar
				if(node == this.titleBar && evt.shiftKey && evt.keyCode == dojo.keys.TAB){
					if (this._lastFocusItem){
						this._lastFocusItem.focus(); // send focus to last item in dialog if known
					}
					dojo.stopEvent(evt);
				}else{
					// see if the key is for the dialog
					while (node){
						if(node == this.domNode){
							if (evt.keyCode == dojo.keys.ESCAPE){
								this.hide(); 
							}else{
								return; // just let it go
							}
						}
						node = node.parentNode;
					}
					// this key is for the disabled document window
					if (evt.keyCode != dojo.keys.TAB){ // allow tabbing into the dialog for a11y
						dojo.stopEvent(evt);
					// opera won't tab to a div
					}else if (!dojo.isOpera){
						try{
							this.titleBar.focus();
						}catch(e){/*squelch*/}
					}
				}
			}
		},

		show: function(){
			// summary: display the dialog

			// first time we show the dialog, there's some initialization stuff to do			
			if(!this._alreadyInitialized){
				this._setup();
				this._alreadyInitialized=true;
			}

			if(this._fadeOut.status() == "playing"){
				this._fadeOut.stop();
			}

			this._modalconnects.push(dojo.connect(window, "onscroll", this, "layout"));
			this._modalconnects.push(dojo.connect(document.documentElement, "onkeypress", this, "_onKey"));
			
			// IE doesn't bubble onblur events - use ondeactivate instead
			var ev = typeof(document.ondeactivate) == "object" ? "ondeactivate" : "onblur";
			this._modalconnects.push(dojo.connect(this.containerNode, ev, this, "_findLastFocus"));
			
			
			dojo.style(this.domNode, "opacity", 0);
			this.domNode.style.display="block";

			this._loadCheck(); // lazy load trigger

			this._position();

			this._fadeIn.play();
			
			this._savedFocus = dijit.util.focus.save(this);
			
			// set timeout to allow the browser to render dialog
			setTimeout(dojo.hitch(this, function(){
				try{
					this.titleBar.focus();
				}catch(e){/*squelch*/}
			}), 50);
		},

		hide: function(){
			// summary
			//		Hide the dialog

			// if we haven't been initialized yet then we aren't showing and we can just return		
			if(!this._alreadyInitialized){
				return;
			}

			if(this._fadeIn.status() == "playing"){
				this._fadeIn.stop();
			}
			this._fadeOut.play();

			if (this._scrollConnected){
				this._scrollConnected = false;
			}
			dojo.forEach(this._modalconnects, dojo.disconnect);
			this._modalconnects = [];
			
			dijit.util.focus.restore(this._savedFocus);
		},

		layout: function() {
			if(this.domNode.style.display == "block"){
				this._underlay.layout();
				this._position();
			}
		}
	}
);
	
dojo.declare(
	"dijit.TooltipDialog",
	[dijit.layout.ContentPane, dijit._Templated],
	{
		// summary:
		//		Pops up a dialog that appears like a Tooltip

		// closeNode: String
		//	Id of button or other dom node to click to close this dialog
		closeNode: "",
		
		// title: String
		// Description of tooltip dialog (required for a11Y)
		title: "",
		
		_lastFocusItem: null,

		templateString:"<div id=\"${id}\" class=\"dijitTooltipDialog\" >\n\t<div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\" tabindex=\"0\" waiRole=\"dialog\"></div>\n\t<span dojoAttachPoint=\"tabEnd\" tabindex=\"0\" dojoAttachEvent=\"focus:_cycleFocus\"></span>\n\t<div class=\"dijitTooltipConnector\" ></div>\n</div>\n",

		postCreate: function(){
			dijit.TooltipDialog.superclass.postCreate.apply(this, arguments);
			this.connect(this.containerNode, "onkeypress", "_onKey");

			// IE doesn't bubble onblur events - use ondeactivate instead
			var ev = typeof(document.ondeactivate) == "object" ? "ondeactivate" : "onblur";
			this.connect(this.containerNode, ev, "_findLastFocus");
			this.containerNode.title=this.title;
	},
	
	startup: function(){
			if(this.closeNode){
				var closeNode = dojo.byId(this.closeNode);
				this.connect(closeNode, "onclick", "_hide");
			}
		},

		onOpen: function(/*Object*/ pos){
			// summary: called when dialog is displayed, with info on where it's being displayed relative to the button
			this.domNode.className="dijitTooltipDialog dijitTooltip" + (pos.corner=='TL' ? "Below" : "Above");
						
			this.containerNode.focus();
		},
		
		_hide: function(){
			// summary: hide the dialog
			dijit.util.popup.closeAll();
		},
		
		_onKey: function(/*Event*/ evt){
			//summary: keep keyboard focus in dialog; close dialog on escape key
			if (evt.keyCode == dojo.keys.ESCAPE){
				this._hide();
			}else if (evt.target == this.containerNode && evt.shiftKey && evt.keyCode == dojo.keys.TAB){
				if (this._lastFocusItem){
					this._lastFocusItem.focus();
				}
				dojo.stopEvent(evt);
			}
		},
		
		_findLastFocus: function(/*Event*/ evt){
			// summary:  called from onblur of dialog container to determine the last focusable item 
			this._lastFocused = evt.target;
		},

		_cycleFocus: function(/*Event*/ evt){
			// summary: when tabEnd receives focus, advance focus around to containerNode
			
			// on first focus to tabEnd, store the last focused item in dialog
			if(!this._lastFocusItem){
				this._lastFocusItem = this._lastFocused;
			}
			this.containerNode.focus();
		}
	}	
);


}

if(!dojo._hasResource["dijit._editor.selection"]){
dojo._hasResource["dijit._editor.selection"] = true;
dojo.provide("dijit._editor.selection");

// FIXME:
//		all of these methods branch internally for IE. This is probably
//		sub-optimal in terms of runtime performance. We should investigate the
//		size difference for differentiating at definition time.

dojo.mixin(dijit._editor.selection, {
	isCollapsed: function(){
		// summary: return whether the current selection is empty
		var _window = dojo.global;
		var _document = dojo.doc;
		if(_document["selection"]){ // IE
			return _document.selection.createRange().text == "";
		}else if(_window["getSelection"]){
			var selection = _window.getSelection();
			if(dojo.isString(selection)){ // Safari
				return selection == "";
			}else{ // Mozilla/W3
				return selection.isCollapsed || selection.toString() == "";
			}
		}
	},

	getType: function(){
		// summary: Get the selection type (like document.select.type in IE).
		if(dojo.doc["selection"]){ //IE
			return dojo.doc.selection.type.toLowerCase();
		}else{
			var stype = "text";

			// Check if the actual selection is a CONTROL (IMG, TABLE, HR, etc...).
			var oSel;
			try{
				oSel = dojo.global.getSelection();
			}catch(e){ /*squelch*/ }

			if(oSel && oSel.rangeCount==1){
				var oRange = oSel.getRangeAt(0);
				if(	(oRange.startContainer == oRange.endContainer) &&
					((oRange.endOffset - oRange.startOffset) == 1) &&
					(oRange.startContainer.nodeType != 3 /* text node*/)
				){
					stype = "control";
				}
			}
			return stype;
		}
	},

	getSelectedElement: function(){
		// summary:
		//		Retrieves the selected element (if any), just in the case that
		//		a single element (object like and image or a table) is
		//		selected.
		if(this.getType() == "control"){
			if(dojo.doc["selection"]){ //IE
				var range = dojo.doc.selection.createRange();
				if(range && range.item){
					return dojo.doc.selection.createRange().item(0);
				}
			}else{
				var selection = dojo.global.getSelection();
				return selection.anchorNode.childNodes[ selection.anchorOffset ];
			}
		}
	},

	getParentElement: function(){
		// summary:
		//		Get the parent element of the current selection
		if(this.getType() == "control"){
			var p = this.getSelectedElement();
			if(p){ return p.parentNode; }
		}else{
			if(dojo.doc["selection"]){ //IE
				return dojo.doc.selection.createRange().parentElement();
			}else{
				var selection = dojo.global.getSelection();
				if(selection){
					var node = selection.anchorNode;

					while(node && (node.nodeType != 1)){ // not an element
						node = node.parentNode;
					}

					return node;
				}
			}
		}
	},

	hasAncestorElement: function(/*String*/tagName /* ... */){
		// summary:
		// 		Check whether current selection has a  parent element which is
		// 		of type tagName (or one of the other specified tagName)
		return (this.getAncestorElement.apply(this, arguments) != null);
	},

	getAncestorElement: function(/*String*/tagName /* ... */){
		// summary:
		//		Return the parent element of the current selection which is of
		//		type tagName (or one of the other specified tagName)

		var node = this.getSelectedElement() || this.getParentElement();
		return this.getParentOfType(node, arguments);
	},

	isTag: function(/*DomNode*/node, /*Array*/tags){
		if(node && node.tagName){
			var _nlc = node.tagName.toLowerCase();
			for(var i=0; i<tags.length; i++){
				var _tlc = String(tags[i]).toLowerCase();
				if(_nlc == _tlc){
					return _tlc;
				}
			}
		}
		return "";
	},

	getParentOfType: function(/*DomNode*/node, /*Array*/tags){
		while(node){
			if(this.isTag(node, tags).length){
				return node;
			}
			node = node.parentNode;
		}
		return null;
	},

	remove: function(){
		// summary: delete current selection
		var _s = dojo.doc.selection;
		if(_s){ //IE
			if(_s.type.toLowerCase() != "none"){
				_s.clear();
			}
			return _s;
		}else{
			_s = dojo.global.getSelection();
			_s.deleteFromDocument();
			return _s;
		}
	},

	selectElementChildren: function(/*DomNode*/element){
		// summary:
		//		clear previous selection and select the content of the node
		//		(excluding the node itself)
		var _window = dojo.global;
		var _document = dojo.doc;
		element = dojo.byId(element);
		if(_document.selection && dojo.body().createTextRange){ // IE
			var range = element.ownerDocument.body.createTextRange();
			range.moveToElementText(element);
			range.select();
		}else if(_window["getSelection"]){
			var selection = _window.getSelection();
			if(selection["setBaseAndExtent"]){ // Safari
				selection.setBaseAndExtent(element, 0, element, element.innerText.length - 1);
			}else if(selection["selectAllChildren"]){ // Mozilla
				selection.selectAllChildren(element);
			}
		}
	},

	selectElement: function(/*DomNode*/element){
		// summary:
		//		clear previous selection and select element (including all its children)
		var _document = dojo.doc;
		element = dojo.byId(element);
		if(_document.selection && dojo.body().createTextRange){ // IE
			try{
				var range = dojo.body().createControlRange();
				range.addElement(element);
				range.select();
			}catch(e){
				this.selectElementChildren(element);
			}
		}else if(dojo.global["getSelection"]){
			var selection = dojo.global.getSelection();
			// FIXME: does this work on Safari?
			if(selection["removeAllRanges"]){ // Mozilla
				var range = _document.createRange() ;
				range.selectNode(element) ;
				selection.removeAllRanges() ;
				selection.addRange(range) ;
			}
		}
	}
});

}

if(!dojo._hasResource["dijit._editor.RichText"]){
dojo._hasResource["dijit._editor.RichText"] = true;
dojo.provide("dijit._editor.RichText");



// dojo.require("dojo.html.layout");
// dojo.require("dojo.html.range");
// dojo.require("dojo.string.extras");

// used to save content
// but do not try doing document.write if we are using xd loading.
// document.write will only work if RichText.js is included in the dojo.js
// file. If it is included in dojo.js and you want to allow rich text saving
// for back/forward actions, then set djConfig.allowXdRichTextSave = true.
if(!djConfig["useXDomain"] || djConfig["allowXdRichTextSave"]){
	if(dojo._post_load){
		(function(){
			var savetextarea = dojo.doc.createElement('textarea');
			savetextarea.id = "dijit._editor.RichText.savedContent";
			var s = savetextarea.style;
			s.display='none';
			s.position='absolute';
			s.top="-100px";
			s.left="-100px"
			s.height="3px";
			s.width="3px";
			dojo.body().appendChild(savetextarea);
		})();
	}else{
		//dojo.body() is not available before onLoad is fired
		try {
			dojo.doc.write('<textarea id="dijit._editor.RichText.savedContent" ' +
				'style="display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;"></textarea>');
		}catch(e){ }
	}
}
dojo.declare(
	"dijit._editor.RichText",
	[ dijit._Widget ], null,
	{
		preamble: function(){
			// summary:
			//		dijit._editor.RichText is the core of the WYSIWYG editor in dojo, which
			//		provides the basic editing features. It also encapsulates the differences
			//		of different js engines for various browsers

			// contentPreFilters: Array
			//		pre content filter function register array.
			//		these filters will be executed before the actual
			//		editing area get the html content
			this.contentPreFilters = [];

			// contentPostFilters: Array
			//		post content filter function register array.
			//		these will be used on the resulting html
			//		from contentDomPostFilters. The resuling
			//		content is the final html (returned by getValue())
			this.contentPostFilters = [];

			// contentDomPreFilters: Array
			//		pre content dom filter function register array.
			//		these filters are applied after the result from
			//		contentPreFilters are set to the editing area
			this.contentDomPreFilters = [];

			// contentDomPostFilters: Array
			//		post content dom filter function register array.
			//		these filters are executed on the editing area dom
			//		the result from these will be passed to contentPostFilters
			this.contentDomPostFilters = [];

			// editingAreaStyleSheets: Array
			//		array to store all the stylesheets applied to the editing area
			this.editingAreaStyleSheets=[];

			this._keyHandlers = {};
			this.contentPreFilters.push(dojo.hitch(this, "_preFixUrlAttributes"));
			if(dojo.isMoz){
				this.contentPreFilters.push(this._fixContentForMoz);
			}
			//this.contentDomPostFilters.push(this._postDomFixUrlAttributes);


			this.onLoadDeferred = new dojo.Deferred();
			if(this.blockNodeForEnter=='BR'){
				if(dojo.isIE){
					this.contentDomPreFilters.push(dojo.hitch(this, "regularPsToSingleLinePs"));
					this.contentDomPostFilters.push(dojo.hitch(this, "singleLinePsToRegularPs"));
				}
			}else if(this.blockNodeForEnter){
				//add enter key handler
				// FIXME: need to port to the new event code!!
				this.addKeyHandler(13, 0, this.handleEnterKey); //enter
				this.addKeyHandler(13, 2, this.handleEnterKey); //shift+enter
			}
		},

		// inheritWidth: Boolean
		//		whether to inherit the parent's width or simply use 100%
		inheritWidth: false,

		// focusOnLoad: Boolean
		//		whether focusing into this instance of richtext when page onload
		focusOnLoad: false,

		// saveName: String
		//		If a save name is specified the content is saved and restored when the user
		//		leave this page can come back, or if the editor is not properly closed after
		//		editing has started.
		saveName: "",

		// styleSheets: String
		//		semicolon (";") separated list of css files for the editing area
		styleSheets: "",

		// _content: String
		//		temporary content storage
		_content: "",

		// height: String
		//		set height to fix the editor at a specific height, with scrolling
		height: "",

		// minHeight: String
		//		The minimum height that the editor should have
		minHeight: "1em",

		// isClosed: Boolean
		isClosed: true,

		// isLoaded: Boolean
		isLoaded: false,

		// _SEPARATOR: String
		//		used to concat contents from multiple textareas into a single string
		_SEPARATOR: "@@**%%__RICHTEXTBOUNDRY__%%**@@",

		// onLoadDeferred: dojo.Deferred
		//		deferred that can be used to connect to the onLoad function. This
		//		will only be set if dojo.Deferred is required
		onLoadDeferred: null,

		// Init
		postCreate: function(){
			dojo.publish("dijit._editor.RichText::init", [this]);
			this.open();
			this.setupDefaultShortcuts();
		},

		setupDefaultShortcuts: function(){
			// summary: add some default key handlers
			// description:
			// 		Overwrite this to setup your own handlers. The default
			// 		implementation does not use Editor2 commands, but directly
			//		executes the builtin commands within the underlying browser
			//		support.
			var ctrl = this.KEY_CTRL;
			var exec = function(cmd, arg){
				return arguments.length == 1 ? function(){ this.execCommand(cmd); } :
					function(){ this.execCommand(cmd, arg); }
			}
			this.addKeyHandler("b", ctrl, exec("bold"));
			this.addKeyHandler("i", ctrl, exec("italic"));
			this.addKeyHandler("u", ctrl, exec("underline"));
			this.addKeyHandler("a", ctrl, exec("selectall"));
			this.addKeyHandler("s", ctrl, function () { this.save(true); });

			this.addKeyHandler("1", ctrl, exec("formatblock", "h1"));
			this.addKeyHandler("2", ctrl, exec("formatblock", "h2"));
			this.addKeyHandler("3", ctrl, exec("formatblock", "h3"));
			this.addKeyHandler("4", ctrl, exec("formatblock", "h4"));

			this.addKeyHandler("\\", ctrl, exec("insertunorderedlist"));
			if(!dojo.isIE){
				this.addKeyHandler("Z", ctrl, exec("redo"));
			}
		},

		// events: Array
		//		 events which should be connected to the underlying editing area
		events: ["onBlur", "onFocus", "onKeyPress", "onKeyDown", "onKeyUp", "onClick"],

		// events: Array
		//		 events which should be connected to the underlying editing
		//		 area, events in this array will be addListener with
		//		 capture=true
		captureEvents: [],

		_safariIsLeopard: function(){
			var gt420 = false;
			if(dojo.isSafari){
				var tmp = navigator.userAgent.split("AppleWebKit/")[1];
				var ver = parseFloat(tmp.split(" ")[0]);
				if(ver >= 420){ gt420 = true; }
			}
			return gt420;
		},

		_editorCommandsLocalized: false,
		_localizeEditorCommands: function(){
			if(this._editorCommandsLocalized){
				return;
			}
			this._editorCommandsLocalized = true;
			//do not use _cacheLocalBlockFormatNames here, as it will
			//trigger security warning in IE7

			//in the array below, ul can not come directly after ol,
			//otherwise the queryCommandValue returns Normal for it
			var formats = ['p', 'pre', 'address', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'div', 'ul'];
			var localhtml = "", format, i=0;
			while(format=formats[i++]){
				if(format.charAt(1) != 'l'){
					localhtml += "<"+format+"><span>content</span></"+format+">";
				}else{
					localhtml += "<"+format+"><li>content</li></"+format+">";
				}
			}
			//queryCommandValue returns empty if we hide editNode, so move it out of screen temporary
			with(this.iframe.style){
				position = "absolute";
				left = "-2000px";
				top = "-2000px";
			}
			this.editNode.innerHTML = localhtml;
			var node = this.editNode.firstChild;
			while(node){
				dojo.withGlobal(this.window, "selectElement", dijit._editor.selection, [node.firstChild]);
				var nativename = node.tagName.toLowerCase();
				this._local2NativeFormatNames[nativename] = this.queryCommandValue("formatblock");
				this._native2LocalFormatNames[this._local2NativeFormatNames[nativename]] = nativename;
				node = node.nextSibling;
			}
			with(this.iframe.style){
				position = "";
				left = "";
				top = "";
			}
		},

		open: function(/*DomNode, optional*/element){
			// summary:
			//		Transforms the node referenced in this.domNode into a rich text editing
			//		node. This will result in the creation and replacement with an <iframe>
			//		if designMode(FF)/contentEditable(IE) is used.
			
			if((!this.onLoadDeferred)||(this.onLoadDeferred.fired >= 0)){
				this.onLoadDeferred = new dojo.Deferred();
			}
			
			if(!this.isClosed){ this.close(); }
			dojo.publish("dijit._editor.RichText::open", [ this ]);
			
			this._content = "";
			if((arguments.length == 1)&&(element["nodeName"])){ this.domNode = element; } // else unchanged
			
			if(	(this.domNode["nodeName"])&&
				(this.domNode.nodeName.toLowerCase() == "textarea")){
				// if we were created from a textarea, then we need to create a
				// new editing harness node.
				this.textarea = this.domNode;
				var html = this._preFilterContent(this.textarea.value);
				this.domNode = dojo.doc.createElement("div");
				this.domNode.cssText = this.textarea.cssText;
				this.domNode.className += " "+this.textarea.className;

				if(!dojo.isSafari){
					// FIXME: VERY STRANGE safari 2.0.4 behavior here caused by
					// moving the textarea. Often crashed the browser!!! Seems
					// fixed on webkit nightlies.
					dojo.place(this.domNode, this.textarea, "before");
				}
				var tmpFunc = dojo.hitch(this, function(){
					//some browsers refuse to submit display=none textarea, so
					//move the textarea out of screen instead
					with(this.textarea.style){
						display = "block";
						position = "absolute";
						left = top = "-1000px";

						if(dojo.isIE){ //nasty IE bug: abnormal formatting if overflow is not hidden
							this.__overflow = overflow;
							overflow = "hidden";
						}
					}
				});
				if(dojo.isIE){
					setTimeout(tmpFunc, 10);
				}else{
					tmpFunc();
				}

				// this.domNode.innerHTML = html;

				if(this.textarea.form){
					// FIXME: port: this used to be before advice!!!
					dojo.connect(this.textarea.form, "onsubmit", this, function(){
						// FIXME: should we be calling close() here instead?
						this.textarea.value = this.getValue();
					});
				}

				// dojo plucks our original domNode from the document so we need
				// to go back and put ourselves back in
				//	var editor = this;
				//	dojo.connect(this, "postCreate", function (){
				//		dojo.place(editor.textarea, editor.domNode, "after");
				//	});
			}else{
				var html = this._preFilterContent(this.getNodeChildrenHtml(this.domNode));
				this.domNode.innerHTML = '';
			}
			if(html == ""){ html = "&nbsp;"; }

			// dojo.body().appendChild(this.domNode);
			dojo.place(this.domNode, this.srcNodeRef, "before");
			var content = dojo.contentBox(this.domNode);
			// var content = dojo.contentBox(this.srcNodeRef);
			this._oldHeight = content.h;
			this._oldWidth = content.w;

			// FIXME: port to new style APIs instead?
			this._firstChildContributingMargin = this.height ? 0 : this._getContributingMargin(this.domNode, "top");
			this._lastChildContributingMargin = this.height ? 0 : this._getContributingMargin(this.domNode, "bottom");

			this.savedContent = html;

			// If we're a list item we have to put in a blank line to force the
			// bullet to nicely align at the top of text
			if(	(this.domNode["nodeName"]) &&
				(this.domNode.nodeName == "LI") ){
				this.domNode.innerHTML = " <br>";
			}

			this.editingArea = dojo.doc.createElement("div");
			this.domNode.appendChild(this.editingArea);

			if(this.saveName != "" && (!djConfig["useXDomain"] || djConfig["allowXdRichTextSave"])){
				var saveTextarea = dojo.byId("dijit._editor.RichText.savedContent");
				if(saveTextarea.value != ""){
					var datas = saveTextarea.value.split(this._SEPARATOR), i=0, dat;
					while(dat=datas[i++]){
						var data = dat.split(":");
						if(data[0] == this.saveName){
							html = data[1];
							datas.splice(i, 1);
							break;
						}
					}
				}
				// FIXME: need to do something different for Opera/Safari
				dojo.connect(window, "onbeforeunload", this, "_saveContent");
				// dojo.connect(window, "onunload", this, "_saveContent");
			}

			this.isClosed = false;
			// Safari's selections go all out of whack if we do it inline,
			// so for now IE is our only hero
			//if (typeof document.body.contentEditable != "undefined") {
			if(dojo.isIE || this._safariIsLeopard() || dojo.isOpera){ // contentEditable, easy
				var ifr = this.iframe = dojo.doc.createElement('iframe');
				ifr.src = 'javascript:void(0)';
				this.editorObject = ifr;
				ifr.style.border = "none";
				ifr.style.width = "100%";
				ifr.frameBorder = 0;
				this.editingArea.appendChild(ifr);
				this.window = ifr.contentWindow;
				this.document = this.window.document;
				this.document.open();
				this.document.write(this._getIframeDocTxt());
				this.document.close();
				if(this.height){
					this.editNode = this.document.body;
				}else{
					this.document.body.appendChild(this.document.createElement("div"));
					this.editNode = this.document.body.firstChild;
				}
				this.editNode.contentEditable = true;
				if(dojo.isIE >= 7){
					if(this.height){
						ifr.style.height = this.height;
					}
					if(this.minHeight){
						ifr.style.minHeight = this.minHeight;
					}
				}else{
					ifr.style.height = this.height ? this.height : this.minHeight;
				}

				// FIXME: setting contentEditable on switches this element to
				// IE's hasLayout mode, triggering weird margin collapsing
				// behavior. It's particularly bad if the element you're editing
				// contains childnodes that don't have margin: defined in local
				// css rules. It would be nice if it was possible to hack around
				// this. Sadly _firstChildContributingMargin and
				// _lastChildContributingMargin don't work on IE unless all
				// elements have margins set in CSS :-(

				//in IE, names for blockformat is locale dependent, so we cache the values here

				//if the normal way fails, we try the hard way to get the list
				
				this._localizeEditorCommands();
				
				this.editNode.innerHTML = html;
				this._preDomFilterContent(this.editNode);
				//	if(this.height){ this.document.body.style.overflowY="scroll"; }
				var events=this.events.concat(this.captureEvents);
				dojo.forEach(events, function(e){
					dojo.connect(this.editNode, e.toLowerCase(), this, e);
				}, this);
				
				this.onLoad();
			}else{ // designMode in iframe
				this._drawIframe(html);
				this.editorObject = this.iframe;
			}

			// TODO: this is a guess at the default line-height, kinda works
			if(this.domNode.nodeName == "LI"){ this.domNode.lastChild.style.marginTop = "-1.2em"; }
			this.domNode.className += " RichTextEditable";
		},

		//static cache variables shared among all instance of this class
		_local2NativeFormatNames: {},
		_native2LocalFormatNames: {},

		_hasCollapseableMargin: function(/*DomNode*/element, /*String*/side){
			// summary:
			//		check if an element has padding or borders on the given side
			//		which would prevent it from collapsing margins
			/*
			if(dojo.html.getPixelValue(element, 'border-'+side+'-width', false)){
				return false;
			}else if(dojo.html.getPixelValue(element, 'padding-'+side, false)){
				return false;
			}else{
				return true;
			}
			*/
		},

		// FIXME: need to port this to 0.9 methods
		_getContributingMargin:	function(/*DomNode*/element, /*String*/topOrBottom){
			// summary:
			//		calculate how much margin this element and its first or last
			//		child are contributing to the total margin between this element
			//		and the adjacent node. CSS border collapsing makes this
			//		necessary.

			return 0; // FIXME: port

			// FIXME: OMG. This has to be horribly inefficient.
			if(topOrBottom == "top"){
				var siblingAttr = "previousSibling";
				var childSiblingAttr = "nextSibling";
				var childAttr = "firstChild";
				var marginProp = "margin-top";
				var siblingMarginProp = "margin-bottom";
			}else{
				var siblingAttr = "nextSibling";
				var childSiblingAttr = "previousSibling";
				var childAttr = "lastChild";
				var marginProp = "margin-bottom";
				var siblingMarginProp = "margin-top";
			}

			var elementMargin = dojo.html.getPixelValue(element, marginProp, false);

			// FIXME: redef'd on every call!!
			function isSignificantNode(element){
				// see if an node is significant in the current context
				// for calulating margins
				return !(element.nodeType==3 && dojo.string.isBlank(element.data))
					&& dojo.html.getStyle(element, "display") != "none"
					&& !dojo.html.isPositionAbsolute(element);
			}

			// walk throuh first/last children to find total collapsed margin size
			var childMargin = 0;
			var child = element[childAttr];
			while(child){
				// skip over insignificant elements (whitespace, etc)
				while((!isSignificantNode(child)) && child[childSiblingAttr]){
					child = child[childSiblingAttr];
				}

				childMargin = Math.max(childMargin, dojo.html.getPixelValue(child, marginProp, false));
				// stop if we hit a bordered/padded element
				if (!this._hasCollapseableMargin(child, topOrBottom)) break;
				child = child[childAttr];
			}

			// if this element has a border, return full child margin immediately
			// as there won't be any margin collapsing
			if (!this._hasCollapseableMargin(element, topOrBottom)){ return parseInt(childMargin); }

			// find margin supplied by nearest sibling
			var contextMargin = 0;
			var sibling = element[siblingAttr];
			while(sibling){
				if(isSignificantNode(sibling)){
					contextMargin = dojo.html.getPixelValue(sibling,
															 siblingMarginProp,
															 false);
					break;
				}
				sibling = sibling[siblingAttr];
			}
			if(!sibling){ // no sibling, look at parent's margin instead
				contextMargin = dojo.html.getPixelValue(element.parentNode, marginProp, false);
			}

			if(childMargin > elementMargin){
				return parseInt(Math.max((childMargin-elementMargin)-contextMargin, 0));
			}else{
				return 0;
			}
		},

		_getIframeDocTxt: function(){
			var _cs = dojo.getComputedStyle(this.domNode);

			var font = [ _cs.fontWeight, _cs.fontSize, _cs.fontFamily ].join(" ");

			// line height is tricky - applying a units value will mess things up.
			// if we can't get a non-units value, bail out.
			var lineHeight = _cs.lineHeight;
			if(lineHeight.indexOf("px") >= 0){
				lineHeight = parseFloat(lineHeight)/parseFloat(_cs.fontSize);
				// console.debug(lineHeight);
			}else if(lineHeight.indexOf("em")>=0){
				lineHeight = parseFloat(lineHeight);
			}else{
				lineHeight = "1.0";
			}
			return [
				"<html><head><style>",
				"body,html {",
				"	background:transparent;",
				"	padding: 0;",
				"	margin: 0;",
				"}",
				// TODO: left positioning will case contents to disappear out of view
				//       if it gets too wide for the visible area
				"body{",
				"	top:0px; left:0px; right:0px;",
					((this.height||dojo.isOpera) ? "" : "position: fixed;"),
				"	font:", font, ";",
				// FIXME: IE 6 won't understand min-height?
				"	min-height:", this.minHeight, ";",
				"	line-height:", lineHeight,
				"}",
				"p{ margin: 1em 0 !important; }",
				(this.height ?
					"" :
					"body > *:first-child{ padding-top:0 !important;margin-top:" + this._firstChildContributingMargin + "px !important;}" + // FIXME: test firstChild nodeType
					"body > *:last-child {"+
					"	padding-bottom:0 !important;"+
					"	margin-bottom:" + this._lastChildContributingMargin + "px !important;"+
					"}"
				),
				"li > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; } ",
				"li{ min-height:1.2em; }",
				"</style>",
				this._applyEditingAreaStyleSheets(),
				"</head><body></body></html>"
			].join("");
		},

		_drawIframe: function(/*String*/html){
			// summary:
			//		Draws an iFrame using the existing one if one exists.
			//		Used by Mozilla, Safari, and Opera

			// detect firefox < 1.5, which has some iframe loading issues
			var oldMoz = Boolean(dojo.isMoz && (typeof window.XML == 'undefined'));

			if(!this.iframe){
				var ifr = this.iframe = dojo.doc.createElement("iframe");
				// this.iframe.src = "about:blank";
				// document.body.appendChild(this.iframe);
				// console.debug(this.iframe.contentDocument.open());
				// dojo.body().appendChild(this.iframe);
				var ifrs = ifr.style;
				// ifrs.border = "1px solid black";
				ifrs.border = "none";
				ifrs.lineHeight = "0"; // squash line height
				ifrs.verticalAlign = "bottom";
				ifrscrolling = this.height ? "auto" : "vertical";
			}
			// opera likes this to be outside the with block
			//	this.iframe.src = "javascript:void(0)";//dojo.uri.dojoUri("src/widget/templates/richtextframe.html") + ((dojo.doc.domain != currentDomain) ? ("#"+dojo.doc.domain) : "");
			this.iframe.style.width = this.inheritWidth ? this._oldWidth : "100%";

			if(this.height){
				this.iframe.style.height = this.height;
			}else{
				var height = this._oldHeight;
				if(this._hasCollapseableMargin(this.domNode, 'top')){
					height += this._firstChildContributingMargin;
				}
				if(this._hasCollapseableMargin(this.domNode, 'bottom')){
					height += this._lastChildContributingMargin;
				}
				this.iframe.height = height;
			}

			var tmpContent = this.srcNodeRef;
			// var tmpContent = dojo.doc.createElement('div');
			//	tmpContent.style.display="none";
			// tmpContent.innerHTML = html;
			//append tmpContent to under the current domNode so that the margin
			//calculation below is correct
			// this.editingArea.appendChild(tmpContent);

			dojo.place(this.iframe, this.srcNodeRef, "before");

			if(!this.height){
				// fix margins on tmpContent
				var c = dojo.query(">", tmpContent);
				var firstChild = c[0];
				var lastChild = c.pop();
				if(firstChild){
					firstChild.style.marginTop = this._firstChildContributingMargin+"px";
				}
				if(lastChild){
					lastChild.style.marginBottom = this._lastChildContributingMargin+"px";
				}
			}
			//do we want to show the content before the editing area finish loading here?
			//if external style sheets are used for the editing area, the appearance now
			//and after loading of the editing area won't be the same (and padding/margin
			//calculation above may not be accurate)
			//	tmpContent.style.display = "none";
			//	this.editingArea.appendChild(this.iframe);

			var _iframeInitialized = false;
			// console.debug(this.iframe);
			// var contentDoc = this.iframe.contentWindow.document;


			// note that on Safari lower than 420+, we have to get the iframe
			// by ID in order to get something w/ a contentDocument property

			var contentDoc = this.iframe.contentDocument;
			contentDoc.open();
			contentDoc.write(this._getIframeDocTxt());
			contentDoc.close();

			// now we wait for onload. Janky hack!
			var ifrFunc = dojo.hitch(this, function(){
				if(!_iframeInitialized){
					_iframeInitialized = true;
				}else{ return; }
				if(!this.editNode){
					if(this.iframe.contentWindow){
						this.window = this.iframe.contentWindow;
						this.document = this.iframe.contentWindow.document
					}else if(this.iframe.contentDocument){
						// for opera
						this.window = this.iframe.contentDocument.window;
						this.document = this.iframe.contentDocument;
					}

					dojo._destroyElement(tmpContent);
					this.document.body.innerHTML = html;
					this.document.designMode = "on";
					//	try{
					//	this.document.designMode = "on";
					// }catch(e){
					//	this._tryDesignModeOnClick=true;
					// }
					try{
						var currentDomain = (new dojo._Url(dojo.doc.location)).host;
						if(dojo.doc.domain!=currentDomain){
							this.document.domain = dojo.doc.domain;
						}
					}catch(e){}

					this.onLoad();
				}else{
					dojo._destroyElement(tmpContent);
					this.editNode.innerHTML = html;
					this.onDisplayChanged();
				}
				this._preDomFilterContent(this.editNode);
			});

			if(this.editNode){
				ifrFunc(); // iframe already exists, just set content
			}else if(dojo.isMoz){
//				// FIXME: if we put this on a delay, we get a height of 20px.
//				// Otherwise we get the correctly specified minHeight value.
				setTimeout(ifrFunc, 250);
			}else{ // new mozillas, opera, safari
				ifrFunc();
			}
		},

		_applyEditingAreaStyleSheets: function(){
			// summary:
			//		apply the specified css files in styleSheets
			var files = [];
			if(this.styleSheets){
				files = this.styleSheets.split(';');
				this.styleSheets = '';
			}

			//empty this.editingAreaStyleSheets here, as it will be filled in addStyleSheet
			files = files.concat(this.editingAreaStyleSheets);
			this.editingAreaStyleSheets = [];

			var text='', i=0, url;
			while(url=files[i++]){
				var abstring = (new dojo._Url(dojo.global.location, url)).toString();
				this.editingAreaStyleSheets.push(abstring);
				text += '<link rel="stylesheet" type="text/css" href="'+abstring+'"/>'
 			}
			return text;
		},

		addStyleSheet: function(/*dojo._Url*/uri){
			// summary:
			//		add an external stylesheet for the editing area
			// uri:	a dojo.uri.Uri pointing to the url of the external css file
			var url=uri.toString();
			if(dojo.indexOf(this.editingAreaStyleSheets, url) > -1){
				console.debug("dijit._editor.RichText.addStyleSheet: Style sheet "+url+" is already applied to the editing area!");
				return;
			}

			//if uri is relative, then convert it to absolute so that it can be resolved correctly in iframe
			if(url.charAt(0) == '.' || (url.charAt(0) != '/' && !uri.host)){
				url = (new dojo._Url(dojo.global.location, url)).toString();
			}

			this.editingAreaStyleSheets.push(url);
			if(this.document.createStyleSheet){ //IE
				this.document.createStyleSheet(url);
			}else{ //other browser
				var head = this.document.getElementsByTagName("head")[0];
				var stylesheet = this.document.createElement("link");
				with(stylesheet){
					rel="stylesheet";
					type="text/css";
					href=url;
				}
				head.appendChild(stylesheet);
			}
		},

		removeStyleSheet: function(/*dojo._Url*/uri){
			// summary:
			//		remove an external stylesheet for the editing area
			var url=uri.toString();
			//if uri is relative, then convert it to absolute so that it can be resolved correctly in iframe
			if(url.charAt(0) == '.' || (url.charAt(0) != '/' && !uri.host)){
				url = (new dojo._Url(dojo.global.location, url)).toString();
			}
			var index = dojo.indexOf(this.editingAreaStyleSheets, url);
			if(index == -1){
				console.debug("dijit._editor.RichText.removeStyleSheet: Style sheet "+url+" is not applied to the editing area so it can not be removed!");
				return;
			}
			delete this.editingAreaStyleSheets[index];

			var link, i=0, links = this.document.getElementsByTagName("link");
			while(link=links[i++]){
				if(link.href == url){
					if(dojo.isIE){//we need to empty the href first, to get IE to remove the rendered styles
						link.href="";
					}
					// FIXME
					dojo.html.removeNode(link);
					break;
				}
			}
		},

		enabled: true,
		enable: function(){
			if(dojo.isIE || this._safariIsLeopard() || dojo.isOpera){
				this.editNode.contentEditable=true;
			}else{ //moz
				this.document.execCommand('contentReadOnly', false, false);
//				this.document.designMode='on';
			}
			this.enabled=true;
		},
		disable: function(){
			if(dojo.isIE || this._safariIsLeopard() || dojo.isOpera){
				this.editNode.contentEditable=false;
			}else{ //moz
				this.document.execCommand('contentReadOnly', false, true);
//				this.blur(); //to remove the blinking caret
//				this.document.designMode='off';
			}
			this.enabled=false;
		},
	/* Event handlers
	 *****************/

		_isResized: function(){ return false; },

		onLoad: function(e){
			// summary: handler after the content of the document finishes loading
			this.isLoaded = true;
			if(this.iframe && !dojo.isIE){
				this.editNode = this.document.body;
				if(!this.height){
					this.connect(this, "onDisplayChanged", "_updateHeight");
				}

				try{ // sanity check for Mozilla
//					this.document.execCommand("useCSS", false, true); // old moz call
					this.document.execCommand("styleWithCSS", false, false); // new moz call
					//this.document.execCommand("insertBrOnReturn", false, false); // new moz call
				}catch(e2){ }

				if(dojo.isSafari){
					/*
					this.iframe.style.visiblity = "visible";
					this.iframe.style.border = "1px solid black";
					this.editNode.style.visiblity = "visible";
					this.editNode.style.border = "1px solid black";
					*/
					// this.onDisplayChanged();
					this.connect(this.editNode, "onblur", "onBlur");
					this.connect(this.editNode, "onfocus", "onFocus");
					this.connect(this.editNode, "onclick", "onFocus");

					this.interval = setInterval(dojo.hitch(this, "onDisplayChanged"), 750);
					// throw new Error("onload");
				}else if(dojo.isMoz || dojo.isOpera){
					var doc = this.document;
					var events=this.events.concat(this.captureEvents);
					dojo.forEach(events, function(e){
						var l = dojo.connect(this.document, e.toLowerCase(), dojo.hitch(this, e));
						if(e=="onBlur"){
							// We need to unhook the blur event listener on close as we
							// can encounter a garunteed crash in FF if another event is
							// also fired
							// FIXME:
							/*
							var unBlur = { unBlur: function(e){
									// FIXME
									dojo.event.browser.removeListener(doc, "blur", l);
							} };
							// FIXME: need a to attach before!
							// dojo.connect("before", this, "close", unBlur, "unBlur");
							*/
						}
					}, this);
				}
				// FIXME: when scrollbars appear/disappear this needs to be fired
			}else if(dojo.isIE){
				// IE contentEditable
				if(!this.height){
					this.connect(this, "onDisplayChanged", "_updateHeight");
				}
				// give the node Layout on IE
				this.editNode.style.zoom = 1.0;
			}

			if(this.focusOnLoad){
				this.focus();
			}
			this.onDisplayChanged(e);
			if(this.onLoadDeferred){
				this.onLoadDeferred.callback(true);
			}
			if(this.blockNodeForEnter=='BR'){
				if(dojo.isIE){
					this._fixNewLineBehaviorForIE();
				}else{
					try{
						this.document.execCommand("insertBrOnReturn", false, true);
					}catch(e){}
				}
			}
		},

		onKeyDown: function(e){
			// summary: Fired on keydown

			// console.debug("onkeydown:", e.keyCode);

			// we need this event at the moment to get the events from control keys
			// such as the backspace. It might be possible to add this to Dojo, so that
			// keyPress events can be emulated by the keyDown and keyUp detection.
			if((dojo.isIE)&&(e.keyCode == dojo.keys.TAB)){
				e.preventDefault();
				e.stopPropagation();
				// FIXME: this is a poor-man's indent/outdent. It would be
				// better if it added 4 "&nbsp;" chars in an undoable way.
				// Unfortuantly pasteHTML does not prove to be undoable
				this.execCommand((e.shiftKey ? "outdent" : "indent"));
			}else if(dojo.isIE){
				// FIXME: get this from connect() instead!
				if(	(65 <= e.keyCode&&e.keyCode <= 90) ||
					(e.keyCode>=37&&e.keyCode<=40)
				){ //arrow keys
					e.charCode = e.keyCode;
					this.onKeyPress(e);
				}
			}
		},

		onKeyUp: function(e){
			// summary: Fired on keyup
			return;
		},

		KEY_CTRL: 1,
		KEY_SHIFT: 2,

		onKeyPress: function(e){
			// summary: Fired on keypress

			// console.debug("onkeypress:", e.keyCode);

			// handle the various key events
			var modifiers = e.ctrlKey ? this.KEY_CTRL : 0 | e.shiftKey?this.KEY_SHIFT : 0;

			// var key = e.key||e.keyCode;
			var key = e.keyChar;
			if(this._keyHandlers[key]){
				// dojo.debug("char:", e.key);
				var handlers = this._keyHandlers[key], i = 0, h;
				while(h = handlers[i++]){
					if(modifiers == h.modifiers){
						if(!h.handler.apply(this,arguments)){
							e.preventDefault();
						}
						break;
					}
				}
			}

			// function call after the character has been inserted
			setTimeout(dojo.hitch(this, function(){
				this.onKeyPressed(e);
			}), 1);
		},

		addKeyHandler: function(/*String*/key, /*Int*/modifiers, /*Function*/handler){
			// summary: add a handler for a keyboard shortcut
			if(!dojo.isArray(this._keyHandlers[key])){ this._keyHandlers[key] = []; }
			this._keyHandlers[key].push({
				modifiers: modifiers || 0,
				handler: handler
			});
		},

		onKeyPressed: function(e){
			if(this._checkListLater){
				// FIXME:
				if(dojo.withGlobal(this.window, 'isCollapsed', dijit._editor.selection)){
					// FIXME:
					if(!dojo.withGlobal(this.window, 'hasAncestorElement', dijit._editor.selection, ['LI'])){
						//circulate the undo detection code by calling RichText::execCommand directly
						// FIXME:
						dijit._editor.RichText.prototype.execCommand.apply(this, ['formatblock',this.blockNodeForEnter]);
						//set the innerHTML of the new block node
						var block = dojo.withGlobal(this.window, 'getAncestorElement', dijit._editor.selection, [this.blockNodeForEnter])
						if(block){
							block.innerHTML=this.bogusHtmlContent;
							if(dojo.isIE){
								//the following won't work, it will move the caret to the last list item in the previous list
	//							var newrange = dojo.html.range.create();
	//							newrange.setStart(block.firstChild,0);
	//							var selection = dojo.html.range.getSelection(this.editor.window)
	//							selection.removeAllRanges();
	//							selection.addRange(newrange);
								//move to the start by move backward one char
								var r = this.document.selection.createRange();
								r.move('character',-1);
								r.select();
							}
						}else{
							alert('onKeyPressed: Can not find the new block node');
						}
					}
				}
				this._checkListLater = false;
			}else if(this._pressedEnterInBlock){
				//the new created is the original current P, so we have previousSibling below
				this.removeTrailingBr(this._pressedEnterInBlock.previousSibling);
				delete this._pressedEnterInBlock;
			}
			this.onDisplayChanged(/*e*/); // can't pass in e
		},

		// blockNodeForEnter: String
		//		this property decides the behavior of Enter key. It can be either P,
		//		DIV, BR, or empty (which means disable this feature). Anything else
		//		will trigger errors.
		blockNodeForEnter: 'BR',
		bogusHtmlContent: '&nbsp;',
		handleEnterKey: function(e){
			// summary: manually handle enter key event to make the behavior consistant across
			//	all supported browsers. See property blockNodeForEnter for available options
			if(!this.blockNodeForEnter){ return true; } //let browser handle this
			if(e.shiftKey  //shift+enter always generates <br>
			    || this.blockNodeForEnter=='BR'){
				// FIXME
				var parent = dojo.withGlobal(this.window, "getParentElement", dijit._editor.selection);
				// FIXME
				var header = dojo.html.range.getAncestor(parent,/^(?:H1|H2|H3|H4|H5|H6|LI)$/);
				if(header){
					if(header.tagName=='LI'){
						return true; //let brower handle
					}
					// FIXME
					var selection = dojo.html.range.getSelection(this.window);
					var range = selection.getRangeAt(0);
					if(!range.collapsed){
						range.deleteContents();
					}
					// FIXME
					if(dojo.html.range.atBeginningOfContainer(header, range.startContainer, range.startOffset)){
						dojo.place(this.document.createElement('br'), header, "before");
					}else if(dojo.html.range.atEndOfContainer(header, range.startContainer, range.startOffset)){
						dojo.place(this.document.createElement('br'), header, "after");
						// FIXME
						var newrange = dojo.html.range.create();
						newrange.setStartAfter(header);

						selection.removeAllRanges();
						selection.addRange(newrange);
					}else{
						return true; //let brower handle
					}
				}else{
					//don't change this: do not call this.execCommand, as that may have other logic in subclass
					// FIXME
					dijit._editor.RichText.prototype.execCommand.call(this, 'inserthtml', '<br>');
				}
				return false;
			}
			var _letBrowserHandle = true;
			//blockNodeForEnter is either P or DIV
			//first remove selection
			// FIXME
			var selection = dojo.html.range.getSelection(this.window);
			var range = selection.getRangeAt(0);
			if(!range.collapsed){
				range.deleteContents();
			}

			// FIXME
			var block = dojo.html.range.getBlockAncestor(range.endContainer, null, this.editNode);

			if(block.blockNode && block.blockNode.tagName == 'LI'){
				this._checkListLater = true;
				return true;
			}else{
				this._checkListLater = false;
			}

			//text node directly under body, let's wrap them in a node
			if(!block.blockNode){
				this.document.execCommand('formatblock',false, this.blockNodeForEnter);
				//get the newly created block node
				// FIXME
				block = {blockNode:dojo.withGlobal(this.window, "getAncestorElement", dijit._editor.selection, [this.blockNodeForEnter]),
						blockContainer: this.editNode};
				if(block.blockNode){
					if(dojo.html.textContent(block.blockNode).replace(/^\s+|\s+$/g, "").length==0){
						this.removeTrailingBr(block.blockNode);
						return false;
					}
				}else{
					block.blockNode = this.editNode;
				}
				selection = dojo.html.range.getSelection(this.window);
				range = selection.getRangeAt(0);
			}
			var newblock = this.document.createElement(this.blockNodeForEnter);
			newblock.innerHTML=this.bogusHtmlContent;
			this.removeTrailingBr(block.blockNode);
			if(dojo.html.range.atEndOfContainer(block.blockNode, range.endContainer, range.endOffset)){
				if(block.blockNode === block.blockContainer){
					block.blockNode.appendChild(newblock);
				}else{
					dojo.html.insertAfter(newblock,block.blockNode);
				}
				_letBrowserHandle = false;
				//lets move caret to the newly created block
				var newrange = dojo.html.range.create();
				newrange.setStart(newblock,0);
				selection.removeAllRanges();
				selection.addRange(newrange);
				if(this.height){
					newblock.scrollIntoView(false);
				}
			}else if(dojo.html.range.atBeginningOfContainer(block.blockNode,
					range.startContainer, range.startOffset)){
				if(block.blockNode === block.blockContainer){
					dojo.html.prependChild(newblock,block.blockNode);
				}else{
					dojo.html.insertBefore(newblock,block.blockNode);
				}
				if(this.height){
					//browser does not scroll the caret position into view, do it manually
					newblock.scrollIntoView(false);
				}
				_letBrowserHandle = false;
			}else{ //press enter in the middle of P
				if(dojo.isMoz){
					//press enter in middle of P may leave a trailing <br/>, let's remove it later
					this._pressedEnterInBlock = block.blockNode;
				}
			}
			return _letBrowserHandle;
		},
		removeTrailingBr: function(container){
			if(/P|DIV|LI/i .test(container.tagName)){
				var para = container;
			}else{
				var para = dijit._editor.selection.getParentOfType(container,['P','DIV','LI']);
			}

			if(!para){ return; }
			if(para.lastChild){
				if(para.childNodes.length>1 && para.lastChild.nodeType==3 && /^[\s\xAD]*$/ .test(para.lastChild.nodeValue)){
					dojo.html.destroyNode(para.lastChild);
				}
				if(para.lastChild && para.lastChild.tagName=='BR'){
					dojo.html.destroyNode(para.lastChild);
				}
			}
			if(para.childNodes.length==0){
				para.innerHTML=this.bogusHtmlContent;
			}
		},
		onClick: function(e){
//			dojo.debug('onClick',this._tryDesignModeOnClick);
//			if(this._tryDesignModeOnClick){
//				try{
//					this.document.designMode='on';
//					this._tryDesignModeOnClick=false;
//				}catch(e){}
//			}
			this.onDisplayChanged(e); },
		onBlur: function(e){ },
		_initialFocus: true,
		onFocus: function(e){
			// summary: Fired on focus
			if( (dojo.isMoz)&&(this._initialFocus) ){
				this._initialFocus = false;
				if(this.editNode.innerHTML.replace(/^\s+|\s+$/g, "") == "&nbsp;"){
					this.placeCursorAtStart();
//					this.execCommand("selectall");
//					this.window.getSelection().collapseToStart();
				}
			}
		},

		blur: function(){
			// summary: remove focus from this instance
			if(this.iframe){
				this.window.blur();
			}else if(this.editNode){
				this.editNode.blur();
			}
		},

		focus: function(){
			// summary: move focus to this instance
			if(this.iframe && !dojo.isIE){
				this.window.focus();
			}else if(this.editNode && this.editNode.focus){
				// editNode may be hidden in display:none div, lets just punt in this case
				this.editNode.focus();
			}else{
				console.debug("Have no idea how to focus into the editor!");
			}
		},

		onDisplayChanged: function(e){
			// summary:
			//		this event will be fired everytime the display context
			//		changes and the result needs to be reflected in the UI
		},

		_normalizeCommand: function(/*String*/cmd){
			// summary:
			//		Used as the advice function by dojo.connect to map our
			//		normalized set of commands to those supported by the target
			//		browser

			var command = cmd.toLowerCase();
			if(command == "formatblock"){
				if(dojo.isSafari){ command = "heading"; }
			}else if(command == "hilitecolor" && !dojo.isMoz){
				command = "backcolor";
			}

			return command;
		},

		queryCommandAvailable: function(/*String*/command){
			// summary:
			//		Tests whether a command is supported by the host. Clients SHOULD check
			//		whether a command is supported before attempting to use it, behaviour
			//		for unsupported commands is undefined.
			// command: The command to test for
			var ie = 1;
			var mozilla = 1 << 1;
			var safari = 1 << 2;
			var opera = 1 << 3;
			var safari420 = 1 << 4;

			var gt420 = this._safariIsLeopard();

			function isSupportedBy(browsers){
				return {
					ie: Boolean(browsers & ie),
					mozilla: Boolean(browsers & mozilla),
					safari: Boolean(browsers & safari),
					safari420: Boolean(browsers & safari420),
					opera: Boolean(browsers & opera)
				}
			}

			var supportedBy = null;

			switch(command.toLowerCase()){
				case "bold": case "italic": case "underline":
				case "subscript": case "superscript":
				case "fontname": case "fontsize":
				case "forecolor": case "hilitecolor":
				case "justifycenter": case "justifyfull": case "justifyleft":
				case "justifyright": case "delete": case "selectall":
					supportedBy = isSupportedBy(mozilla | ie | safari | opera);
					break;

				case "createlink": case "unlink": case "removeformat":
				case "inserthorizontalrule": case "insertimage":
				case "insertorderedlist": case "insertunorderedlist":
				case "indent": case "outdent": case "formatblock":
				case "inserthtml": case "undo": case "redo": case "strikethrough":
					supportedBy = isSupportedBy(mozilla | ie | opera | safari420);
					break;

				case "blockdirltr": case "blockdirrtl":
				case "dirltr": case "dirrtl":
				case "inlinedirltr": case "inlinedirrtl":
					supportedBy = isSupportedBy(ie);
					break;
				case "cut": case "copy": case "paste":
					supportedBy = isSupportedBy( ie | mozilla | safari420);
					break;

				case "inserttable":
					supportedBy = isSupportedBy(mozilla | ie);
					break;

				case "insertcell": case "insertcol": case "insertrow":
				case "deletecells": case "deletecols": case "deleterows":
				case "mergecells": case "splitcell":
					supportedBy = isSupportedBy(ie | mozilla);
					break;

				default: return false;
			}

			return (dojo.isIE && supportedBy.ie) ||
				(dojo.isMoz && supportedBy.mozilla) ||
				(dojo.isSafari && supportedBy.safari) ||
				(gt420 && supportedBy.safari420) ||
				(dojo.isOpera && supportedBy.opera);  // Boolean return true if the command is supported, false otherwise
		},

		execCommand: function(/*String*/command, argument){
			// summary: Executes a command in the Rich Text area
			// command: The command to execute
			// argument: An optional argument to the command
			var returnValue;

			//focus() is required for IE to work
			//In addition, focus() makes sure after the execution of
			//the command, the editor receives the focus as expected
			this.focus();

			command = this._normalizeCommand(command);
			if(argument != undefined){
				if(command == "heading"){
					throw new Error("unimplemented");
				}else if((command == "formatblock") && dojo.isIE){
					argument = '<'+argument+'>';
				}
			}
			if(command == "inserthtml"){
				//TODO: we shall probably call _preDomFilterContent here as well
				argument=this._preFilterContent(argument);
				if(dojo.isIE){
					var insertRange = this.document.selection.createRange();
					insertRange.pasteHTML(argument);
					insertRange.select();
					//insertRange.collapse(true);
					return true;
				}else if(dojo.isMoz && !argument.length){
					//mozilla can not inserthtml an empty html to delete current selection
					//so we delete the selection instead in this case
					dojo.withGlobal(this.window,'remove',dijit._editor.selection); // FIXME
					return true;
				}else{
					return this.document.execCommand(command, false, argument);
				}
			}else if(
				(command == "unlink")&&
				(this.queryCommandEnabled("unlink"))&&
				(dojo.isMoz || dojo.isSafari)
			){
				// fix up unlink in Mozilla to unlink the link and not just the selection

				// grab selection
				// Mozilla gets upset if we just store the range so we have to
				// get the basic properties and recreate to save the selection
				var selection = this.window.getSelection();
				//	var selectionRange = selection.getRangeAt(0);
				//	var selectionStartContainer = selectionRange.startContainer;
				//	var selectionStartOffset = selectionRange.startOffset;
				//	var selectionEndContainer = selectionRange.endContainer;
				//	var selectionEndOffset = selectionRange.endOffset;

				// select our link and unlink
				var a = dojo.withGlobal(this.window, "getAncestorElement",dijit._editor.selection, ['a']);
				dojo.withGlobal(this.window, "selectElement", dijit._editor.selection, [a]);

				return this.document.execCommand("unlink", false, null);
			}else if((command == "hilitecolor")&&(dojo.isMoz)){
//				// mozilla doesn't support hilitecolor properly when useCSS is
//				// set to false (bugzilla #279330)

//				this.document.execCommand("useCSS", false, false);
				returnValue = this.document.execCommand(command, false, argument);
//				this.document.execCommand("useCSS", false, true);

			}else if((dojo.isIE)&&( (command == "backcolor")||(command == "forecolor") )){
				// Tested under IE 6 XP2, no problem here, comment out
				// IE weirdly collapses ranges when we exec these commands, so prevent it
//				var tr = this.document.selection.createRange();
				argument = arguments.length > 1 ? argument : null;
				returnValue = this.document.execCommand(command, false, argument);

				// timeout is workaround for weird IE behavior were the text
				// selection gets correctly re-created, but subsequent input
				// apparently isn't bound to it
//				setTimeout(function(){tr.select();}, 1);
			}else{
				argument = arguments.length > 1 ? argument : null;
//				if(dojo.isMoz){
//					this.document = this.iframe.contentWindow.document
//				}

				if(argument || command!="createlink"){
					returnValue = this.document.execCommand(command, false, argument);
				}
			}

			this.onDisplayChanged();
			return returnValue;
		},

		queryCommandEnabled: function(/*String*/command){
			// summary: check whether a command is enabled or not
			command = this._normalizeCommand(command);
			if(dojo.isMoz || dojo.isSafari){
				if(command == "unlink"){ // mozilla returns true always
					// console.debug(dojo.withGlobal(this.window, "hasAncestorElement",dijit._editor.selection, ['a']));
					return dojo.withGlobal(this.window, "hasAncestorElement",dijit._editor.selection, ['a']);
				}else if (command == "inserttable"){
					return true;
				}
			}

			// return this.document.queryCommandEnabled(command);
			var elem = (dojo.isIE) ? this.document.selection.createRange() : this.document;
			return elem.queryCommandEnabled(command);
		},

		queryCommandState: function(command){
			// summary: check the state of a given command
			command = this._normalizeCommand(command);
			return this.document.queryCommandState(command);
		},

		queryCommandValue: function(command){
			// summary: check the value of a given command
			command = this._normalizeCommand(command);
			if(dojo.isIE && command == "formatblock"){
				return this._local2NativeFormatNames[this.document.queryCommandValue(command)] || this.document.queryCommandValue(command);
			}
			return this.document.queryCommandValue(command);
		},

		// Misc.

		placeCursorAtStart: function(){
			// summary:
			//		place the cursor at the start of the editing area
			this.focus();

			//see comments in placeCursorAtEnd
			var isvalid=false;
			if(dojo.isMoz){
				var first=this.editNode.firstChild;
				while(first){
					if(first.nodeType == 3){
						if(first.nodeValue.replace(/^\s+|\s+$/g, "").length>0){
							isvalid=true;
							dojo.withGlobal(this.window, "selectElement", dijit._editor.selection, [first]);
							break;
						}
					}else if(first.nodeType == 1){
						isvalid=true;
						dojo.withGlobal(this.window, "selectElementChildren",dijit._editor.selection, [first]);
						break;
					}
					first = first.nextSibling;
				}
			}else{
				isvalid=true;
				dojo.withGlobal(this.window, "selectElementChildren",dijit._editor.selection, [this.editNode]);
			}
			if(isvalid){
				dojo.withGlobal(this.window, "collapse", dijit._editor.selection, [true]);
			}
		},

		placeCursorAtEnd: function(){
			// summary:
			//		place the cursor at the end of the editing area
			this.focus();

			//In mozilla, if last child is not a text node, we have to use selectElementChildren on this.editNode.lastChild
			//otherwise the cursor would be placed at the end of the closing tag of this.editNode.lastChild
			var isvalid=false;
			if(dojo.isMoz){
				var last=this.editNode.lastChild;
				while(last){
					if(last.nodeType == 3){
						if(last.nodeValue.replace(/^\s+|\s+$/g, "").length>0){
							isvalid=true;
							dojo.withGlobal(this.window, "selectElement",dijit._editor.selection, [last]);
							break;
						}
					}else if(last.nodeType == 1){
						isvalid=true;
						if(last.lastChild){
							dojo.withGlobal(this.window, "selectElement",dijit._editor.selection, [last.lastChild]);
						}else{
							dojo.withGlobal(this.window, "selectElement",dijit._editor.selection, [last]);
						}
						break;
					}
					last = last.previousSibling;
				}
			}else{
				dojo.withGlobal(this.window, "selectElementChildren",dijit._editor.selection, [this.editNode]);
			}
			if(isvalid){
				dojo.withGlobal(this.window, "collapse", dijit._editor.selection, [false]);
			}
		},

		getValue: function(/*Boolean?*/nonDestructive){
			// summary:
			//		return the current content of the editing area (post filters are applied)
			if(this.isClosed && this.textarea){
				return this.textarea.value;
			}else{
				return this._postFilterContent(null, nonDestructive);
			}
		},

		setValue: function(/*String*/html){
			// summary:
			//		this function set the content. No undo history is preserved
			if(this.isClosed && this.textarea){
				this.textarea.value=html;
			}else{
				html = this._preFilterContent(html);
				if(this.isClosed){
					this.domNode.innerHTML = html;
					this._preDomFilterContent(this.domNode);
				}else{
					this.editNode.innerHTML = html;
					this._preDomFilterContent(this.editNode);
				}
			}
		},

		replaceValue: function(/*String*/html){
			// summary:
			//		this function set the content while trying to maintain the undo stack
			//		(now only works fine with Moz, this is identical to setValue in all
			//		other browsers)
			if(this.isClosed){
				this.setValue(html);
			}else if(this.window && this.window.getSelection && !dojo.isMoz){ // Safari
				// look ma! it's a totally f'd browser!
				this.setValue(html);
			}else if(this.window && this.window.getSelection){ // Moz
				html = this._preFilterContent(html);
				this.execCommand("selectall");
				if(dojo.isMoz && !html){ html = "&nbsp;" }
				this.execCommand("inserthtml", html);
				this._preDomFilterContent(this.editNode);
			}else if(this.document && this.document.selection){//IE
				//In IE, when the first element is not a text node, say
				//an <a> tag, when replacing the content of the editing
				//area, the <a> tag will be around all the content
				//so for now, use setValue for IE too
				this.setValue(html);
			}
		},

		_preFilterContent: function(/*String*/html){
			// summary:
			//		filter the input before setting the content of the editing area
			var ec = html;
			dojo.forEach(this.contentPreFilters, function(ef){ if(ef){ ec = ef(ec); } });
			return ec;
		},
		_preDomFilterContent: function(/*DomNode*/dom){
			// summary:
			//		filter the input
			dom = dom || this.editNode;
			dojo.forEach(this.contentDomPreFilters, function(ef){
				if(ef && dojo.isFunction(ef)){
					ef(dom);
				}
			}, this);
		},

		_postFilterContent: function(/*DomNode|DomNode[]?*/dom,/*Boolean?*/nonDestructive){
			// summary:
			//		filter the output after getting the content of the editing area
			dom = dom || this.editNode;
			if(this.contentDomPostFilters.length){
				if(nonDestructive && dom['cloneNode']){
					dom = dom.cloneNode(true);
				}
				dojo.forEach(this.contentDomPostFilters, function(ef){
					dom = ef(dom);
				});
			}
			var ec = this.getNodeChildrenHtml(dom);
			if(ec.replace(/^\s+|\s+$/g, "") == "&nbsp;"){ ec = ""; }

			//	if(dojo.isIE){
			//		//removing appended <P>&nbsp;</P> for IE
			//		ec = ec.replace(/(?:<p>&nbsp;</p>[\n\r]*)+$/i,"");
			//	}
			dojo.forEach(this.contentPostFilters, function(ef){
				ec = ef(ec);
			});

			return ec;
		},

		//Int: stored last time height
		_lastHeight: 0,

		_updateHeight: function(){
			// summary:
			//		Updates the height of the editor area to fit the contents.
			if(!this.isLoaded){ return; }
			if(this.height){ return; }

			if(dojo.isSafari && (!this._safariIsLeopard())){
				// old safari (2.0.4) is super-janky
				if(!this.editorObject){ return; }
				try{
					this.editorObject.style.height = (this.editNode.offsetHeight + 10) + "px";
					// console.debug("_updateHeight");
				}catch(e){
					try{
						this.editorObject.style.height = "500px";
					}catch(e2){}
				}
				// this.editorObject.style.height = (this.editNode.offsetHeight + 10) + "px";
				return;
			}

			// var height = dojo.marginBox(this.editNode).h;
			var height = dojo.marginBox(this.editNode).h;
			if(dojo.isOpera){
				height = this.editNode.scrollHeight;
			}

			// console.debug(this.editNode);
			// alert(this.editNode);

			//height maybe zero in some cases even though the content is not empty,
			//we try the height of body instead
			if(!height){
				height = dojo.marginBox(this.document.body).h;
			}
			if(height == 0){
				console.debug("Can not figure out the height of the editing area!");
				return; //prevent setting height to 0
			}
			this._lastHeight = height;
			// this.editorObject.style.height = this._lastHeight + "px";
			dojo.marginBox(this.editorObject, { h: this._lastHeight });
			// this.window.scrollTo(0, 0);
		},

		_saveContent: function(e){
			// summary:
			//		Saves the content in an onunload event if the editor has not been closed
			var saveTextarea = dojo.byId("dijit._editor.RichText.savedContent");
			saveTextarea.value += this._SEPARATOR + this.saveName + ":" + this.getValue();
		},


		escapeXml: function(/*string*/str, /*boolean*/noSingleQuotes){
			//summary:
			//		Adds escape sequences for special characters in XML: &<>"'
			//		Optionally skips escapes for single quotes
			str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
			if(!noSingleQuotes){
				str = str.replace(/'/gm, "&#39;");
			}
			return str; // string
		},

		getNodeHtml: function(node){
			switch(node.nodeType){
				case 1: //element node
					var output = '<'+node.tagName.toLowerCase();
					if(dojo.isMoz){
						if(node.getAttribute('type')=='_moz'){
							node.removeAttribute('type');
						}
						if(node.getAttribute('_moz_dirty') != undefined){
							node.removeAttribute('_moz_dirty');
						}
					}
					//store the list of attributes and sort it to have the
					//attributes appear in the dictionary order
					var attrarray = [];
					if(dojo.isIE){
						var s = node.outerHTML;
						s = s.substr(0,s.indexOf('>'));
						s = s.replace(/(?:['"])[^"']*\1/g, '');//to make the following regexp safe
						var reg = /([^\s=]+)=/g;
						var m, key;
						while((m = reg.exec(s)) != undefined){
							key=m[1];
							if(key.substr(0,3) != '_dj'){
								if(key == 'src' || key == 'href'){
									if(node.getAttribute('_djrealurl')){
										attrarray.push([key,node.getAttribute('_djrealurl')]);
										continue;
									}
								}
								if(key == 'class'){
									attrarray.push([key,node.className]);
								}else{
									attrarray.push([key,node.getAttribute(key)]);
								}
							}
						}
					}else{
						var attr, i=0, attrs = node.attributes;
						while(attr=attrs[i++]){
							//ignore all attributes starting with _dj which are
							//internal temporary attributes used by the editor
							if(attr.name.substr(0,3) != '_dj' /*&&
								(attr.specified == undefined || attr.specified)*/){
								var v = attr.value;
								if(attr.name == 'src' || attr.name == 'href'){
									if(node.getAttribute('_djrealurl')){
										v = node.getAttribute('_djrealurl');
									}
								}
								attrarray.push([attr.name,v]);
							}
						}
					}
					attrarray.sort(function(a,b){
						return a[0]<b[0]?-1:(a[0]==b[0]?0:1);
					});
					i=0;
					while(attr=attrarray[i++]){
						output += ' '+attr[0]+'="'+attr[1]+'"';
					}
					if(node.childNodes.length){
						output += '>' + this.getNodeChildrenHtml(node)+'</'+node.tagName.toLowerCase()+'>';
					}else{
						output += ' />';
					}
					break;
				case 3: //text
					// FIXME:
					var output = this.escapeXml(node.nodeValue,true);
					break;
				case 8: //comment
					// FIXME:
					var output = '<!--'+this.escapeXml(node.nodeValue,true)+'-->';
					break;
				default:
					var output = "Element not recognized - Type: " + node.nodeType + " Name: " + node.nodeName;
			}
			return output;
		},

		getNodeChildrenHtml: function(dom){
			var out = "";
			if(!dom){ return out; }
			var nodes = dom["childNodes"]||dom;
			var i=0;
			var node;
			while(node=nodes[i++]){
				out += this.getNodeHtml(node);
			}
			return out;
		},

		close: function(/*Boolean*/save, /*Boolean*/force){
			// summary:
			//		Kills the editor and optionally writes back the modified contents to the
			//		element from which it originated.
			// save:
			//		Whether or not to save the changes. If false, the changes are discarded.
			// force:
			if(this.isClosed){return false; }

			if(!arguments.length){ save = true; }
			this._content = this.getValue();
			var changed = (this.savedContent != this._content);

			// line height is squashed for iframes
			// FIXME: why was this here? if (this.iframe){ this.domNode.style.lineHeight = null; }

			if(this.interval){ clearInterval(this.interval); }

			if(this.textarea){
				with(this.textarea.style){
					position = "";
					left = top = "";
					if(dojo.isIE){
						overflow = this.__overflow;
						this.__overflow = null;
					}
				}
				if(save){
					this.textarea.value = this._content;
				}else{
					this.textarea.value = this.savedContent;
				}
				// dojo.html.removeNode(this.domNode);
				if(this.domNode.parentNode){ // FIXME
					this.domNode.parentNode.removeNode(this.domNode);
				}
				this.domNode = this.textarea;
			}else{
				if(save){
					if(dojo.isMoz){
						var nc = dojo.doc.createElement("span");
						this.domNode.appendChild(nc);
						nc.innerHTML = this.editNode.innerHTML;
					}else{
						this.domNode.innerHTML = this._content;
					}
				}else{
					this.domNode.innerHTML = this.savedContent;
				}
			}

			dojo.removeClass(this.domNode, "RichTextEditable");
			this.isClosed = true;
			this.isLoaded = false;
			// FIXME: is this always the right thing to do?
			delete this.editNode;

			if(this.window && this.window._frameElement){
				this.window._frameElement = null;
			}

			this.window = null;
			this.document = null;
			this.editingArea = null;
			this.editorObject = null;

			return changed; // Boolean: whether the content has been modified
		},

		destroyRendering: function(){}, // stub!

		destroy: function(){
			this.destroyRendering();
			if(!this.isClosed){ this.close(false); }

			dijit._editor.RichText.superclass.destroy.call(this);
		},

		_fixContentForMoz: function(html){
			// summary:
			//		Moz can not handle strong/em tags correctly, convert them to b/i
			html = html.replace(/<(\/)?strong([ \>])/gi, '<$1b$2' );
			html = html.replace(/<(\/)?em([ \>])/gi, '<$1i$2' );
			return html;
		},
		_srcInImgRegex	: /(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi ,
		_hrefInARegex	: /(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi ,
		_preFixUrlAttributes: function(html){
			html = html.replace(this._hrefInARegex, '$1$4$2$3$5$2 _djrealurl=$2$3$5$2') ;
			html = html.replace(this._srcInImgRegex, '$1$4$2$3$5$2 _djrealurl=$2$3$5$2') ;
			return html;
		},
		regularPsToSingleLinePs: function(element, noWhiteSpaceInEmptyP){
			function wrapLinesInPs(el){
			  // move "lines" of top-level text nodes into ps
				function wrapNodes(nodes){
					// nodes are assumed to all be siblings
					var newP = nodes[0].ownerDocument.createElement('p'); // FIXME: not very idiomatic
					nodes[0].parentNode.insertBefore(newP, nodes[0]);
					for(var i=0; i<nodes.length; i++){
					    newP.appendChild(nodes[i]);
					}
				}

				var currentNodeIndex = 0;
				var nodesInLine = [];
				var currentNode;
				while(currentNodeIndex < el.childNodes.length){
					currentNode = el.childNodes[currentNodeIndex];
					if( (currentNode.nodeName!='BR') &&
						(currentNode.nodeType==1) &&
						(dojo.style(currentNode, "display")!="block")
					){
						nodesInLine.push(currentNode);
					}else{
						// hit line delimiter; process nodesInLine if there are any
						var nextCurrentNode = currentNode.nextSibling;
						if(nodesInLine.length){
							wrapNodes(nodesInLine);
							currentNodeIndex = (currentNodeIndex+1)-nodesInLine.length;
							if(currentNode.nodeName=="BR"){
								dojo._destroyElement(currentNode);
							}
						}
						nodesInLine = [];
					}
					currentNodeIndex++;
				}
				if(nodesInLine.length){ wrapNodes(nodesInLine); }
			}

			function splitP(el){
			    // split a paragraph into seperate paragraphs at BRs
			    var currentNode = null;
			    var trailingNodes = [];
			    var lastNodeIndex = el.childNodes.length-1;
			    for(var i=lastNodeIndex; i>=0; i--){
					currentNode = el.childNodes[i];
					if(currentNode.nodeName=="BR"){
						var newP = currentNode.ownerDocument.createElement('p');
						dojo.place(newP, el, "after");
						if (trailingNodes.length==0 && i != lastNodeIndex) {
							newP.innerHTML = "&nbsp;"
						}
						dojo.forEach(trailingNodes, function(node){
							newP.appendChild(node);
						});
						dojo._destroyElement(currentNode);
						trailingNodes = [];
					}else{
						trailingNodes.unshift(currentNode);
					}
			    }
			}

			var pList = [];
			var ps = element.getElementsByTagName('p');
			dojo.forEach(ps, function(p){ pList.push(p); });
			dojo.forEach(pList, function(p){
				if(	(p.previousSibling) &&
					(p.previousSibling.nodeName == 'P' || dojo.style(p.previousSibling, 'display') != 'block')
				){
					var newP = p.parentNode.insertBefore(this.document.createElement('p'), p);
					// this is essential to prevent IE from losing the P.
					// if it's going to be innerHTML'd later we need
					// to add the &nbsp; to _really_ force the issue
					newP.innerHTML = noWhiteSpaceInEmptyP ? "" : "&nbsp;";
				}
				splitP(p);
		  },this);
			wrapLinesInPs(element);
			return element;
		},

		singleLinePsToRegularPs: function(element){
			function getParagraphParents(node){
				var ps = node.getElementsByTagName('p');
				var parents = [];
				for(var i=0; i<ps.length; i++){
					var p = ps[i];
					var knownParent = false;
					for(var k=0; k < parents.length; k++){
						if(parents[k] === p.parentNode){
							knownParent = true;
							break;
						}
					}
					if(!knownParent){
						parents.push(p.parentNode);
					}
				}
				return parents;
			}

			function isParagraphDelimiter(node){
				if(node.nodeType != 1 || node.tagName != 'P'){
					return (dojo.style(node, 'display') == 'block');
				}else{
					if(!node.childNodes.length || node.innerHTML=="&nbsp;"){ return true }
					//return node.innerHTML.match(/^(<br\ ?\/?>| |\&nbsp\;)$/i);
				}
			}

			var paragraphContainers = getParagraphParents(element);
			for(var i=0; i<paragraphContainers.length; i++){
				var container = paragraphContainers[i];
				var firstPInBlock = null;
				var node = container.firstChild;
				var deleteNode = null;
				while(node){
					if(node.nodeType != "1" || node.tagName != 'P'){
						firstPInBlock = null;
					}else if (isParagraphDelimiter(node)){
						deleteNode = node;
						firstPInBlock = null;
					}else{
						if(firstPInBlock == null){
							firstPInBlock = node;
						}else{
							if( (!firstPInBlock.lastChild || firstPInBlock.lastChild.nodeName != 'BR') &&
								(node.firstChild) &&
								(node.firstChild.nodeName != 'BR')
							){
								firstPInBlock.appendChild(this.document.createElement('br'));
							}
							while(node.firstChild){
								firstPInBlock.appendChild(node.firstChild);
							}
							deleteNode = node;
						}
					}
					node = node.nextSibling;
					if(deleteNode){
						dojo._destroyElement(deleteNode);
						deleteNode = null;
					}
				}
			}
			return element;
		},

		_fixNewLineBehaviorForIE: function(){
			if(typeof this.document.__INSERTED_EDITIOR_NEWLINE_CSS == "undefined"){
				var lineFixingStyles = "p{margin:0;}";
				// FIXME:
				// dojo.html.insertCssText(lineFixingStyles, this.document);
				this.document.__INSERTED_EDITIOR_NEWLINE_CSS = true;
				// this.regularPsToSingleLinePs(this.editNode);
			}
		}
	}
);

}

if(!dojo._hasResource["dijit.Toolbar"]){
dojo._hasResource["dijit.Toolbar"] = true;
dojo.provide("dijit.Toolbar");





dojo.declare(
	"dijit.Toolbar",
	[dijit._Widget, dijit._Templated, dijit._Container],
{
	templateString:
		'<div class="dijit dijitToolbar" waiRole="toolbar" tabIndex="-1" dojoAttachPoint="containerNode">' +
//			'<table style="table-layout: fixed" class="dijitReset dijitToolbarTable">' + // factor out style
//				'<tr class="dijitReset" dojoAttachPoint="containerNode"></tr>'+
//			'</table>' +
		'</div>'
}
);

// Combine with dijit.MenuSeparator??
dojo.declare(
	"dijit.ToolbarSeparator",
	[ dijit._Widget, dijit._Templated ],
{
	// summary
	//	A line between two menu items
	templateString: '<div class="dijitToolbarSeparator dijitInline"></div>',
	postCreate: function(){ dojo.setSelectable(this.domNode, false); }
});

}

if(!dojo._hasResource["dijit.form.Button"]){
dojo._hasResource["dijit.form.Button"] = true;
dojo.provide("dijit.form.Button");




dojo.declare(
	"dijit.form.Button",
	dijit.form._FormWidget,
	{
/*
 * usage
 *	<button dojoType="button" onClick="...">Hello world</button>
 *
 *  var button1 = dojo.widget.createWidget("Button", {label: "hello world", onClick: foo});
 *	document.body.appendChild(button1.domNode);
 */
		// summary
		//	Basically the same thing as a normal HTML button, but with special styling.

		// label: String
		//	text to display in button
		label: "",

		// iconClass: String
		//	class to apply to div in button to make it display an icon
		iconClass: "",

		type: "button",
		baseClass: "dijitButton",
		templateString:"<div class=\"dijit dijitLeft dijitInline dijitButton\" baseClass=\"${baseClass}\"\n\tdojoAttachEvent=\"onclick:onClick;onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse\"\n\t><div class='dijitRight'\n\t><button class=\"dijitStretch dijitButtonNode dijitButtonContents\"\n\t\ttabIndex=\"${tabIndex}\" type=\"${type}\" id=\"${id}\" name=\"${name}\" alt=\"${alt}\"\n\t\t><div class=\"dijitInline ${iconClass}\"></div\n\t\t><span class=\"dijitButtonContents\" dojoAttachPoint=\"containerNode;focusNode\">${label}</span\n\t></button\n></div></div>\n",

		// TODO: set button's title to this.containerNode.innerText

		onClick: function(/*Event*/ e){
			// summary: callback for when button is clicked; user can override this function
		},

		setLabel: function(/*String*/ content){
			// summary: reset the label (text) of the button; takes an HTML string
			this.containerNode.innerHTML = this.label = content;
			if(dojo.isMozilla){ // Firefox has re-render issues with tables
				var oldDisplay = dojo.getComputedStyle(this.domNode).display;
				this.domNode.style.display="none";
				var _this = this;
				setTimeout(function(){_this.domNode.style.display=oldDisplay;},1);
			}
			// TODO: set button's title to this.containerNode.innerText
		}		
	}
);

/*
 * usage
 *	<button dojoType="DropDownButton" label="Hello world"><div dojotype=dijit.Menu>...</div></button>
 *
 *  var button1 = dojo.widget.createWidget("DropDownButton", {label: "hello world", dropDownId: foo});
 *	document.body.appendChild(button1.domNode);
 */
dojo.declare(
	"dijit.form.DropDownButton",
	[dijit.form.Button, dijit._Container],
	{
		// summary
		//		push the button and a menu shows up

		baseClass : "dijitDropDownButton",

		templateString:"<div class=\"dijit dijitLeft dijitInlineBox dijitDropDownButton\" baseClass=\"dijitDropDownButton\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;onclick:_onArrowClick; onkeypress:_onKey;\"\n\t><div class='dijitRight'>\n\t<button tabIndex=\"${tabIndex}\" class=\"dijitStretch dijitButtonNode\" type=\"${type}\" id=\"${id}\" name=\"${name}\" alt=\"${alt}\"\n\t\t><div class=\"dijitInline ${iconClass}\"></div\n\t\t><span class=\"dijitButtonContents\" \tdojoAttachPoint=\"containerNode;popupStateNode;focusNode\"\n\t\t waiRole=\"button\" waiState=\"haspopup-true;labelledby-${id}_label\" id=\"${id}_label\">${label}</span\n\t\t><span class='dijitA11yDownArrow'>&#9660;</span>\n\t</button>\n</div></div>\n",

		_fillContent: function(){
			// my inner HTML contains both the button text and a drop down widget, like
			// <DropDownButton>  <button>push me</button>  <Menu> ... </Menu> </DropDownButton>
			// first part holds button label and second part is popup
			if(this.srcNodeRef){
				var nodes = dojo.query("*", this.srcNodeRef);
				dijit.form.DropDownButton.superclass._fillContent.call(this, nodes[0]);
				
				// save pointer to srcNode so we can grab the drop down widget after it's instantiated
				this.dropDownContainer = this.srcNodeRef;
			}
		},

		startup: function(){
			// we didn't copy the dropdown widget from the this.srcNodeRef, so it's in no-man's
			// land now.  move it to document.body.
			if(!this.dropDown){
				var node = dojo.query("[widgetId]", this.dropDownContainer)[0];
				this.dropDown = dijit.util.manager.byNode(node);
			}
			dojo.body().appendChild(this.dropDown.domNode);
			this.dropDown.domNode.style.display="none";
		},

		_onArrowClick: function(/*Event*/ e){
			// summary: callback when the user mouse clicks on menu popup node
			if(this.disabled){ return; }
			this._toggleDropDown();
		},

		_onKey: function(/*Event*/ e){
			// summary: callback when the user presses a key on menu popup node
			if(this.disabled){ return; }
			if(e.keyCode == dojo.keys.DOWN_ARROW){
				if(!this.dropDown || this.dropDown.domNode.style.display=="none"){
					dojo.stopEvent(e);
					return this._toggleDropDown();
				}
			}
		},

		_toggleDropDown: function(){
			// summary: toggle the drop-down widget; if it is up, close it, if not, open it
			if(this.disabled){ return; }
			this.popupStateNode.focus();
			var dropDown = this.dropDown;
			if(!dropDown){ return false; }
			if(!dropDown.isShowingNow){
				var oldWidth=dropDown.domNode.style.width;
				var self = this;
				dijit.util.popup.open({
					popup: dropDown,
					around: this.domNode,
					onClose: function(){
						dropDown.domNode.style.width = oldWidth;
						self.popupStateNode.removeAttribute("popupActive");
					}
				});
				if(this.domNode.offsetWidth > dropDown.domNode.offsetWidth){
					// make menu at least as wide as the button
					dojo.marginBox(dropDown.domNode, {w:this.domNode.offsetWidth});
				}
				this.popupStateNode.setAttribute("popupActive", "true");
				this._opened=true;
			}else{
				dijit.util.popup.closeAll();
				this._opened=false;
			}
			// TODO: set this.selected and call setStateClass(), to affect button look while drop down is shown
			return false;
		}
	});

/*
 * usage
 *	<button dojoType="ComboButton" onClick="..."><span>Hello world</span><div dojoType=dijit.Menu>...</div></button>
 *
 *  var button1 = dojo.widget.createWidget("DropDownButton", {label: "hello world", onClick: foo, dropDownId: "myMenu"});
 *	document.body.appendChild(button1.domNode);
 */
dojo.declare(
	"dijit.form.ComboButton",
	dijit.form.DropDownButton,
	{
		// summary
		//		left side is normal button, right side displays menu
		templateString:"<fieldset class='dijit dijitInline dijitLeft dijitComboButton'  baseClass='dijitComboButton'\n\tid=\"${id}\" name=\"${name}\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;\"\t\n>\n<table cellspacing='0' cellpadding='0'  waiRole=\"presentation\" >\n\t<tr>\n\t\t<td\tclass=\"dijitStretch dijitButtonContents dijitButtonNode\"\n\t\t\ttabIndex=\"${tabIndex}\"\n\t\t\tdojoAttachEvent=\"onklick:_onButtonClick\"\n\t\t\twaiRole=\"button\">\n\t\t\t<div class=\"dijitInline ${iconClass}\"></div>\n\t\t\t<span class=\"dijitButtonContents\" dojoAttachPoint=\"containerNode;focusNode\" id=\"${id}_label\">${label}</span>\n\t\t</td>\n\t\t<td class='dijitReset dijitRight dijitButtonNode dijitDownArrowButton'\n\t\t\tdojoAttachPoint=\"popupStateNode\"\n\t\t\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onmousedown:_onMouse;onklick:_onArrowClick; onkeypress:_onKey;\"\n\t\t\tbaseClass=\"dijitComboButtonDownArrow\"\n\t\t\ttitle=\"${optionsTitle}\"\n\t\t\ttabIndex=\"${tabIndex}\"\n\t\t\twaiRole=\"button\" waiState=\"haspopup-true\"\n\t\t><div waiRole=\"presentation\">&#9660;</div>\n\t</td></tr>\n</table>\n</fieldset>\n",

		// optionsTitle: String
		//  text that describes the options menu (accessibility)
		optionsTitle: "",

		baseClass: "dijitComboButton",

		_onButtonClick: function(/*Event*/ e){
			// summary: callback when the user mouse clicks the button portion
			dojo.stopEvent(e);
			if(this.disabled){ return; }
			this.focusNode.focus();
			return this.onClick(e);
		}
	});

dojo.declare(
	"dijit.form.ToggleButton",
	dijit.form.Button,
{
	// summary
	//	A button that can be in two states (selected or not).
	//	Can be base class for things like tabs or checkbox or radio buttons

	baseClass: "dijitToggleButton",

	// selected: Boolean
	//		True if the button is depressed, or the checkbox is checked,
	//		or the radio button is selected, etc.
	selected: false,

	onChange: function(/*Boolean*/ selected){
		// summary: callback for when state changes
	},

	onClick: function(/*Event*/ evt){
		this.setSelected(!this.selected);
	},

	setSelected: function(/*Boolean*/ selected){
		// summary
		//	Programatically deselect the button
		this.selected=selected;
		this._setStateClass();
		this.onChange(selected);	// TODO: finalize arg list to onChange()
	}
});

}

if(!dojo._hasResource["dijit._editor._Plugin"]){
dojo._hasResource["dijit._editor._Plugin"] = true;
dojo.provide("dijit._editor._Plugin");




dojo.declare("dijit._editor._Plugin", null, 
	function(/*Object*/args, /*DomNode?*/node){
		if(args){
			dojo.mixin(this, args);
		}
	},
	{
		editor: null,
		iconClassPrefix: "dijitEditorIcon",
		button: null,
		queryCommand: null,
		command: "",
		commandArg: null,
		useDefaultCommand: true,
		buttonClass: dijit.form.Button,
		updateInterval: 200, // only allow updates every two tenths of a second
		_initButton: function(){
			if(this.command.length){
				var label = this.editor.commands[this.command];
				var className = this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1);
				if(!this.button){
					var props = {
						label: label,
						iconClass: className
					};
					this.button = new this.buttonClass(props);
				}
			}
		},
		updateState: function(){
			if(!this._lastUpdate){
				this._lateUpdate = new Date();
			}else{
				if(((new Date())-this._lastUpdate) < this.updateInterval){
					return;
				}
			}
			var _e = this.editor;
			var _c = this.command;
			if(!_e){ return; }
			if(!_e.isLoaded){ return; }
			if(!_c.length){ return; }
			if(this.button){
				try{
					var enabled = _e.queryCommandEnabled(_c);
					this.button._setDisabled(!enabled);
					if(this.button.setSelected){
						this.button.setSelected(_e.queryCommandState(_c));
					}
				}catch(e){
					console.debug(e);
				}
			}
			this._lateUpdate = new Date();
		},
		setEditor: function(/*Widget*/editor){
			// FIXME: detatch from previous editor!!
			this.editor = editor;

			// FIXME: prevent creating this if we don't need to (i.e., editor can't handle our command)
			this._initButton();

			// FIXME: wire up editor to button here!
			if(	(this.command.length) && 
				(!this.editor.queryCommandAvailable(this.command))
			){
				// console.debug("hiding:", this.command);
				if(this.button){ 
					this.button.domNode.style.display = "none";
				}
			}
			if(this.button && this.useDefaultCommand){
				dojo.connect(this.button, "onClick",
					dojo.hitch(this.editor, "execCommand", this.command, this.commandArg)
				);
			}
			dojo.connect(this.editor, "onDisplayChanged", this, "updateState");
		},
		setToolbar: function(/*Widget*/toolbar){
			if(this.button){
				toolbar.addChild(this.button);
			}
			// console.debug("adding", this.button, "to:", toolbar);
		}
	}
);

}

if(!dojo._hasResource["dijit._editor.plugins.LinkDialog"]){
dojo._hasResource["dijit._editor.plugins.LinkDialog"] = true;
dojo.provide("dijit._editor.plugins.LinkDialog");




dojo.declare("dijit._editor.plugins.LinkDialog", 
	[ dijit._editor._Plugin, dijit._Widget ],  
	function(){
		this._linkDialog = new dijit.TooltipDialog({
			title: "link url" // FIxmE: i18n
		});
		// FIXME: this is totally torturned. _Templated should make this easier. *sigh*
		this._linkDialog.containerNode.innerHTML = this.linkDialogTemplate;
		// dojo.body().appendChild(this._linkDialog.domNode);
		dijit._Templated.prototype._attachTemplateNodes.call(this, this._linkDialog.containerNode);
		this._linkDialog.startup();

		dojo.connect(this, "_initButton", this, function(){
			this.connect(this.button, "onClick", "showEditor");
		});
	},
	{
		// FIXME: this is a PITA. There should be a lighter weight way to do this
		urlInput: null,
		buttonClass: dijit.form.ToggleButton,
		linkDialogTemplate: [
			"<span>url: &nbsp;</span>",
			"<input class='dijitComboBoxInput' type='text' dojoAttachPoint='urlInput'>",
			"<br>",
			"<input class='dijitButtonNode' type='button' dojoAttachEvent='onclick: setValue;' value='set'>",
			"<input class='dijitButtonNode' type='button' dojoAttachEvent='onclick: hideEditor;' value='cancel'>"
		].join(""),
		useDefaultCommand: false,
		command: "createLink",
		_linkDialog: null,
		setValue: function(){
			var val = this.urlInput.value;
			this.hideEditor();
			this.editor.execCommand(this.command, val);
		},
		_savedSelection: null,
		hideEditor: function(){
			this._linkDialog.hide();
			// FIXME: IE is really messed up here!!
			if(dojo.isIE){
				this.editor.focus();
				var range = this.editor.document.selection.createRange();
				range.moveToBookmark(this._savedSelection);
				range.select();
				this._savedSelection = null;
			}
		},
		showEditor: function(){
			if(!this.button.selected){
				console.debug("selected");
				this.editor.execCommand("unlink");
				// this.button.setSelected();
			}else{

				// FIXME: IE is *really* b0rken
				if(dojo.isIE){
					var range = this.editor.document.selection.createRange();
					this._savedSelection = range.getBookmark();
				}
				dojo.coords(this.button.domNode);
				this._linkDialog.show(this.button.domNode);
				this.urlInput.focus();
			}
		},
		updateState: function(){
			if(!this._lastUpdate){
				this._lastUpdate = new Date();
			}else{
				if(((new Date())-this._lastUpdate) < this.updateInterval){
					return;
				}
			}
			var _e = this.editor;
			if(!_e){ return; }
			if(!_e.isLoaded){ return; }
			if(this.button){
				try{
					// var enabled = _e.queryCommandEnabled("unlink");
					var enabled = _e.queryCommandEnabled("createlink");
					// this.button._setDisabled(!enabled);
					if(this.button.setSelected){
						var selected = !!dojo.withGlobal(this.editor.window, "getAncestorElement",dijit._editor.selection, ['a']);
						this.button.setSelected(selected);
					}
				}catch(e){
					console.debug(e);
				}
			}
			this._lastUpdate = new Date();
		}
	}
);

}

if(!dojo._hasResource["dijit._editor.plugins.DefaultToolbar"]){
dojo._hasResource["dijit._editor.plugins.DefaultToolbar"] = true;
dojo.provide("dijit._editor.plugins.DefaultToolbar");





dojo.declare("dijit._editor.plugins.DefaultToolbar", null,
	// NOTE: we duck-type to dijit._editor._Plugin
	function(){
		// console.debug("creating...");
		// the dead-simple way:
		var _p = dijit._editor._Plugin;
		var _tb = dijit.form.ToggleButton;
		this.plugins = [
			new _p({ command: "cut" }),
			new _p({ command: "copy" }),
			new _p({ command: "paste" }),
			new _p({ button: new dijit.ToolbarSeparator() }),
			new _p({ buttonClass: _tb, command: "bold" }),
			new _p({ buttonClass: _tb, command: "italic" }),
			new _p({ buttonClass: _tb, command: "underline" }),
			new _p({ buttonClass: _tb, command: "strikethrough" }),
			new _p({ button: new dijit.ToolbarSeparator() }),
			new _p({ command: "insertOrderedList" }),
			// new _p({ command: "sep" }), // test for disabled command hiding
			new _p({ command: "insertUnorderedList" }),
			new _p({ command: "indent" }),
			new _p({ command: "outdent" }),
			new _p({ button: new dijit.ToolbarSeparator() }),
			new dijit._editor.plugins.LinkDialog() //,
			// new _p({ command: "unlink" })
			// new _p({ button: new dijit.ToolbarSeparator() }),
		];
		// console.debug("...created");
	},
	{
		plugins: [],
		setEditor: function(editor){
			dojo.forEach(this.plugins, function(i){ i.setEditor(editor); });
		},
		setToolbar: function(toolbar){
			dojo.forEach(this.plugins, function(i){ i.setToolbar(toolbar); });
		}
	}
);

}

if(!dojo._hasResource["dojo.i18n"]){
dojo._hasResource["dojo.i18n"] = true;
dojo.provide("dojo.i18n");

dojo.i18n.getLocalization = function(/*String*/packageName, /*String*/bundleName, /*String?*/locale){
//	summary:
//		Returns an Object containing the localization for a given resource bundle
//		in a package, matching the specified locale.
//
//	description:
//		Returns a hash containing name/value pairs in its prototypesuch that values can be easily overridden.
//		Throws an exception if the bundle is not found.
//		Bundle must have already been loaded by dojo.requireLocalization() or by a build optimization step.
//
//	packageName: package which is associated with this resource
//	bundleName: the base filename of the resource bundle (without the ".js" suffix)
//	locale: the variant to load (optional).  By default, the locale defined by the
//		host environment: dojo.locale

	dojo.i18n._preloadLocalizations();
	locale = dojo.i18n.normalizeLocale(locale);

	// look for nearest locale match
	var elements = locale.split('-');
	var module = [packageName,"nls",bundleName].join('.');
	var bundle = dojo._loadedModules[module];
	if(bundle){
		var localization;
		for(var i = elements.length; i > 0; i--){
			var loc = elements.slice(0, i).join('_');
			if(bundle[loc]){
				localization = bundle[loc];
				break;
			}
		}
		if(!localization){
			localization = bundle.ROOT;
		}

		// make a singleton prototype so that the caller won't accidentally change the values globally
		if(localization){
			var clazz = function(){};
			clazz.prototype = localization;
			return new clazz(); // Object
		}
	}

	throw new Error("Bundle not found: " + bundleName + " in " + packageName+" , locale=" + locale);
};

dojo.i18n.normalizeLocale = function(/*String?*/locale){
	//	summary:
	//		Returns canonical form of locale, as used by Dojo.
	//
	//  description:
	//		All variants are case-insensitive and are separated by '-' as specified in RFC 3066.
	//		If no locale is specified, the dojo.locale is returned.  dojo.locale is defined by
	//		the user agent's locale unless overridden by djConfig.

	var result = locale ? locale.toLowerCase() : dojo.locale;
	if(result == "root"){
		result = "ROOT";
	}
	return result; // String
};

dojo.i18n._requireLocalization = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale, /*String?*/availableFlatLocales){
	// summary:
	//	See dojo.requireLocalization()
	//
	// description:
	//  Called by the bootstrap, but factored out so that it is only included in the build when needed.

	dojo.i18n._preloadLocalizations();
	var targetLocale = dojo.i18n.normalizeLocale(locale);
 	var bundlePackage = [moduleName, "nls", bundleName].join(".");
	// NOTE: 
	//		When loading these resources, the packaging does not match what is
	//		on disk.  This is an implementation detail, as this is just a
	//		private data structure to hold the loaded resources.  e.g.
	//		tests/hello/nls/en-us/salutations.js is loaded as the object
	//		tests.hello.nls.salutations.en_us={...} The structure on disk is
	//		intended to be most convenient for developers and translators, but
	//		in memory it is more logical and efficient to store in a different
	//		order.  Locales cannot use dashes, since the resulting path will
	//		not evaluate as valid JS, so we translate them to underscores.
	
	//Find the best-match locale to load if we have available flat locales.
	var bestLocale = "";
	if(availableFlatLocales){
		var flatLocales = availableFlatLocales.split(",");
		for(var i = 0; i < flatLocales.length; i++){
			//Locale must match from start of string.
			if(targetLocale.indexOf(flatLocales[i]) == 0){
				if(flatLocales[i].length > bestLocale.length){
					bestLocale = flatLocales[i];
				}
			}
		}
		if(!bestLocale){
			bestLocale = "ROOT";
		}		
	}

	//See if the desired locale is already loaded.
	var tempLocale = availableFlatLocales ? bestLocale : targetLocale;
	var bundle = dojo._loadedModules[bundlePackage];
	var localizedBundle = null;
	if(bundle){
		if(djConfig.localizationComplete && bundle._built){return;}
		var jsLoc = tempLocale.replace(/-/g, '_');
		var translationPackage = bundlePackage+"."+jsLoc;
		localizedBundle = dojo._loadedModules[translationPackage];
	}

	if(!localizedBundle){
		bundle = dojo["provide"](bundlePackage);
		var syms = dojo._getModuleSymbols(moduleName);
		var modpath = syms.concat("nls").join("/");
		var parent;

		dojo.i18n._searchLocalePath(tempLocale, availableFlatLocales, function(loc){
			var jsLoc = loc.replace(/-/g, '_');
			var translationPackage = bundlePackage + "." + jsLoc;
			var loaded = false;
			if(!dojo._loadedModules[translationPackage]){
				// Mark loaded whether it's found or not, so that further load attempts will not be made
				dojo["provide"](translationPackage);
				var module = [modpath];
				if(loc != "ROOT"){module.push(loc);}
				module.push(bundleName);
				var filespec = module.join("/") + '.js';
				loaded = dojo._loadPath(filespec, null, function(hash){
					// Use singleton with prototype to point to parent bundle, then mix-in result from loadPath
					var clazz = function(){};
					clazz.prototype = parent;
					bundle[jsLoc] = new clazz();
					for(var j in hash){ bundle[jsLoc][j] = hash[j]; }
				});
			}else{
				loaded = true;
			}
			if(loaded && bundle[jsLoc]){
				parent = bundle[jsLoc];
			}else{
				bundle[jsLoc] = parent;
			}
			
			if(availableFlatLocales){
				//Stop the locale path searching if we know the availableFlatLocales, since
				//the first call to this function will load the only bundle that is needed.
				return true;
			}
		});
	}

	//Save the best locale bundle as the target locale bundle when we know the
	//the available bundles.
	if(availableFlatLocales && targetLocale != bestLocale){
		bundle[targetLocale.replace(/-/g, '_')] = bundle[bestLocale.replace(/-/g, '_')];
	}
};

(function(){
	// If other locales are used, dojo.requireLocalization should load them as
	// well, by default. 
	// 
	// Override dojo.requireLocalization to do load the default bundle, then
	// iterate through the extraLocale list and load those translations as
	// well, unless a particular locale was requested.

	var extra = djConfig.extraLocale;
	if(extra){
		if(!extra instanceof Array){
			extra = [extra];
		}

		var req = dojo.i18n._requireLocalization;
		dojo.i18n._requireLocalization = function(m, b, locale, availableFlatLocales){
			req(m,b,locale, availableFlatLocales);
			if(locale){return;}
			for(var i=0; i<extra.length; i++){
				req(m,b,extra[i], availableFlatLocales);
			}
		};
	}
})();

dojo.i18n._searchLocalePath = function(/*String*/locale, /*Boolean*/down, /*Function*/searchFunc){
	//	summary:
	//		A helper method to assist in searching for locale-based resources.
	//		Will iterate through the variants of a particular locale, either up
	//		or down, executing a callback function.  For example, "en-us" and
	//		true will try "en-us" followed by "en" and finally "ROOT".

	locale = dojo.i18n.normalizeLocale(locale);

	var elements = locale.split('-');
	var searchlist = [];
	for(var i = elements.length; i > 0; i--){
		searchlist.push(elements.slice(0, i).join('-'));
	}
	searchlist.push(false);
	if(down){searchlist.reverse();}

	for(var j = searchlist.length - 1; j >= 0; j--){
		var loc = searchlist[j] || "ROOT";
		var stop = searchFunc(loc);
		if(stop){ break; }
	}
};

//These properties/functions are placed outside of _preloadLocalizations
//So that the xd loading can use/override them.
dojo.i18n._localesGenerated /***BUILD:localesGenerated***/; // value will be inserted here at build time, if necessary
dojo.i18n.registerNlsPath = function(){
	//summary; registers nls path. Defined as a function so xd loading
	//can redefine it.
	dojo.registerModulePath("nls","nls");		
}

dojo.i18n._preloadLocalizations = function(){
	// summary:
	//		Load built, flattened resource bundles, if available for all
	//		locales used in the page. Execute only once. Note that this is a
	//		no-op unless there is a build.

	if(dojo.i18n._localesGenerated){
		dojo.i18n.registerNlsPath();	

		function preload(locale){
			locale = dojo.i18n.normalizeLocale(locale);
			dojo.i18n._searchLocalePath(locale, true, function(loc){
				for(var i=0; i<dojo.i18n._localesGenerated.length;i++){
					if(dojo.i18n._localesGenerated[i] == loc){
						dojo["require"]("nls.dojo_"+loc);
						return true; // Boolean
					}
				}
				return false; // Boolean
			});
		}
		preload();
		var extra = djConfig.extraLocale||[];
		for(var i=0; i<extra.length; i++){
			preload(extra[i]);
		}
	}
	dojo.i18n._preloadLocalizations = function(){};
};

}

if(!dojo._hasResource["dijit.Editor"]){
dojo._hasResource["dijit.Editor"] = true;
dojo.provide("dijit.Editor");





dojo.requireLocalization("dijit._editor", "commands", null, "it,ROOT,de");

dojo.declare(
	"dijit.Editor",
	[ dijit._editor.RichText, dijit._Container ],
	{
		// plugins:
		//		a list of plugin names (as strings) or instances (as objects)
		//		for this widget.
		plugins: [ "dijit._editor.plugins.DefaultToolbar" ],
		preamble: function(){
			this.plugins = [].concat(this.plugins);
		},
		toolbar: null,
		postCreate: function(){
			try{
			dijit.Editor.superclass.postCreate.apply(this, arguments);

			this.commands = dojo.i18n.getLocalization("dijit._editor", "commands", this.lang);

			if(!this.toolbar){
				// if we haven't been assigned a toolbar, create one
				this.toolbar = new dijit.Toolbar();
				dojo.place(this.toolbar.domNode, this.domNode, "before");
			}

			dojo.forEach(this.plugins, this.addPlugin, this);
			}catch(e){ console.debug(e); }
		},

		addPlugin: function(/*String||Object*/plugin, /*Integer?*/index){
			//	summary:
			//		takes a plugin name as a string or a plugin instance and
			//		adds it to the toolbar and associates it with this editor
			//		instance. The resulting plugin is added to the Editor's
			//		plugins array. If index is passed, it's placed in the plugins
			//		array at that index. No big magic, but a nice helper for
			//		passing in plugin names via markup. 
			//	plugin: String or plugin instance. Required.
			//	index:	
			//		Integer, optional. Used when creating an instance from
			//		something already in this.plugins. Ensures that the new
			//		instance is assigned to this.plugins at that index.
			if(dojo.isString(plugin)){
				var pc = dojo.getObject(plugin);
				plugin = new pc();
				if(arguments.length > 1){
					this.plugins[index] = plugin;
				}else{
					this.plugins.push(plugin);
				}
			}
			if(dojo.isFunction(plugin.setEditor)){
				plugin.setEditor(this);
			}
			if(dojo.isFunction(plugin.setToolbar)){
				plugin.setToolbar(this.toolbar);
			}
			if(plugin.button){
				this.toolbar.addChild(plugin.button);
			}
		}
	}
);

}

if(!dojo._hasResource["dijit.util.scroll"]){
dojo._hasResource["dijit.util.scroll"] = true;
dojo.provide("dijit.util.scroll");

dijit.util.scroll.scrollIntoView = function(/* HTMLElement */node){
	//	summary
	//	Scroll the passed node into view, if it is not.

	// don't rely on that node.scrollIntoView works just because the function is there
	// it doesnt work in Konqueror or Opera even though the function is there and probably
	// not safari either
	// dont like browser sniffs implementations but sometimes you have to use it
	if(dojo.isIE){
		//only call scrollIntoView if there is a scrollbar for this menu,
		//otherwise, scrollIntoView will scroll the window scrollbar
		if(dojo.marginBox(node.parentNode).h <= node.parentNode.scrollHeight){ //PORT was getBorderBox
			node.scrollIntoView(false);
		}
	}else if(dojo.isMozilla){
		node.scrollIntoView(false);
	}else{
		var parent = node.parentNode;
		var parentBottom = parent.scrollTop + dojo.marginBox(parent).h; //PORT was getBorderBox
		var nodeBottom = node.offsetTop + dojo.marginBox(node).h;
		if(parentBottom < nodeBottom){
			parent.scrollTop += (nodeBottom - parentBottom);
		}else if(parent.scrollTop > node.offsetTop){
			parent.scrollTop -= (parent.scrollTop - node.offsetTop);
		}
	}
};

}

if(!dojo._hasResource["dijit.Menu"]){
dojo._hasResource["dijit.Menu"] = true;
dojo.provide("dijit.Menu");









dojo.declare(
	"dijit.Menu",
	[dijit._Widget, dijit._Templated, dijit._Container],
{
	templateString:
			'<table class="dijit dijitMenu dijitReset dijitMenuTable" waiRole="menu" dojoAttachEvent="onkeypress:_onKeyPress">' +
				'<tbody class="dijitReset" dojoAttachPoint="containerNode"></tbody>'+
			'</table>',

	// targetNodeIds: String[]
	//	Array of dom node ids of nodes to attach to.
	//	Fill this with nodeIds upon widget creation and it becomes context menu for those nodes.
	targetNodeIds: [],

	// contextMenuForWindow: Boolean
	//	if true, right clicking anywhere on the window will cause this context menu to open;
	//	if false, must specify targetNodeIds
	contextMenuForWindow: false,

	// parentMenu: Widget
	// pointer to menu that displayed me
	parentMenu: null,

	// submenuDelay: Integer
	//	number of milliseconds before hovering (without clicking) causes the submenu to automatically open
	submenuDelay: 500,

	// _contextMenuWithMouse: Boolean
	//	used to record mouse and keyboard events to determine if a context
	//	menu is being opened with the keyboard or the mouse
	_contextMenuWithMouse: false,

	postCreate: function(){
		if(this.contextMenuForWindow){
			this.bindDomNode(dojo.body());
		}else{
			dojo.forEach(this.targetNodeIds, this.bindDomNode, this);
		}

		if(!this.isLeftToRight()){
			this.containerNode.className += " dojoRTL";
		}
	},

	startup: function(){
		dojo.forEach(this.getChildren(), function(child){ child.startup(); });
	},

	_moveToParentMenu: function(/*Event*/ evt){
		if(this.parentMenu){
			//only process event in the focused menu
			//and its immediate parentPopup to support
			//MenuBar
			if(evt._menuUpKeyProcessed){
				dojo.stopEvent(e);
			}else{
				if(this._focusedItem){
					this._blurFocusedItem();
				}
				this.parentMenu.closeSubmenu();
				evt._menuUpKeyProcessed = true;
			}
		}
	},

	_moveToChildMenu: function(/*Event*/ evt){
		if(this._focusedItem && this._focusedItem.popup && !this._focusedItem.disabled){
			return this._activateCurrentItem(evt);
		}
		return false;
	},

	_activateCurrentItem: function(/*Event*/ evt){
		if(this._focusedItem){
			this._focusedItem._onClick();
			if(this.currentSubmenu){
				this.currentSubmenu._focusFirstItem();
			}
			return true; //do not pass to parent menu
		}
		return false;
	},

	_onKeyPress: function(/*Event*/ evt){
		// summary
		//	Handle keyboard based menu navigation.
		if(evt.ctrlKey || evt.altKey){ return; }

		var key = (evt.charCode == dojo.keys.SPACE ? dojo.keys.SPACE : evt.keyCode);
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
	},

	_findValidItem: function(dir){
		// summary: find the next/previous item to focus on (depending on dir setting).

		var curItem = this._focusedItem;
		if(curItem){
			curItem = dir>0 ? curItem.getNextSibling() : curItem.getPreviousSibling();
		}

		var children = this.getChildren();
		for(var i=0; i < children.length; ++i){
			if(!curItem){
				curItem = children[(dir>0) ? 0 : (children.length-1)];
			}
			//find next/previous visible menu item, not including separators
			if(curItem._onHover && dojo.style(curItem.domNode, "display") != "none"){
				return curItem;
			}
			curItem = dir>0 ? curItem.getNextSibling() : curItem.getPreviousSibling();
		}
	},

	_focusNeighborItem: function(dir){
		// summary: focus on the next / previous item (depending on dir setting)
		var item = this._findValidItem(dir);
		this._focusItem(item);
	},

	_focusFirstItem: function(){
		// blur focused item to make findValidItem() find the first item in the menu
		if(this._focusedItem){
			this._blurFocusedItem();
		}
		var item = this._findValidItem(1);
		this._focusItem(item);
	},

	_focusItem: function(/*MenuItem*/ item){
		// summary: internal function to focus a given menu item

		if(!item || item==this._focusedItem){
			return;
		}

		if(this._focusedItem){
			this._blurFocusedItem();
		}
		item._focus();
		this._focusedItem = item;
	},

	onItemHover: function(/*MenuItem*/ item){
		this._focusItem(item);

		if(this._focusedItem.popup && !this._focusedItem.disabled && !this.hover_timer){
			this.hover_timer = setTimeout(dojo.hitch(this, "_openSubmenu"), this.submenuDelay);
		}
	},

	_blurFocusedItem: function(){
		// summary: internal function to remove focus from the currently focused item
		if(this._focusedItem){
			// Close all submenus that are open and descendents of this menu
			dijit.util.popup.closeTo(this);
			this._focusedItem._blur();
			this._stopSubmenuTimer();
			this._focusedItem = null;
		}
	},

	onItemUnhover: function(/*MenuItem*/ item){
		//this._blurFocusedItem();
	},

	_stopSubmenuTimer: function(){
		if(this.hover_timer){
			clearTimeout(this.hover_timer);
			this.hover_timer = null;
		}
	},

	_getTopMenu: function(){
		for(var top=this; top.parentMenu; top=top.parentMenu);
		return top;
	},

	onItemClick: function(/*Widget*/ item){
		// summary: user defined function to handle clicks on an item
		// summary: internal function for clicks
		if(item.disabled){ return false; }

		if(item.popup){
			if(!this.is_open){
				this._openSubmenu();
			}
		}else{
			// before calling user defined handler, close hierarchy of menus
			// and restore focus to place it was when menu was opened
			var savedFocus = this._getTopMenu()._savedFocus;
			if(savedFocus){
				dijit.util.focus.restore(savedFocus);
			}
			dijit.util.popup.closeAll();
		}

		// user defined handler for click
		item.onClick();
	},

	closeSubmenu: function(force){
		// summary: close the currently displayed submenu
		if(!this.currentSubmenu){ return; }

		dijit.util.popup.closeTo(this);
		this._focusedItem._focus();	// put focus back on my node

		this.currentSubmenu = null;
	},

	// thanks burstlib!
	_iframeContentWindow: function(/* HTMLIFrameElement */iframe_el) {
		//	summary
		//	returns the window reference of the passed iframe
		var win = dijit.util.window.getDocumentWindow(dijit.Menu._iframeContentDocument(iframe_el)) ||
			// Moz. TODO: is this available when defaultView isn't?
			dijit.Menu._iframeContentDocument(iframe_el)['__parent__'] ||
			(iframe_el.name && document.frames[iframe_el.name]) || null;
		return win;	//	Window
	},

	_iframeContentDocument: function(/* HTMLIFrameElement */iframe_el){
		//	summary
		//	returns a reference to the document object inside iframe_el
		var doc = iframe_el.contentDocument // W3
			|| (iframe_el.contentWindow && iframe_el.contentWindow.document) // IE
			|| (iframe_el.name && document.frames[iframe_el.name] && document.frames[iframe_el.name].document)
			|| null;
		return doc;	//	HTMLDocument
	},

	bindDomNode: function(/*String|DomNode*/ node){
		// summary: attach menu to given node
		node = dojo.byId(node);

		//TODO: this is to support context popups in Editor.  Maybe this shouldn't be in dijit.Menu
		var win = dijit.util.window.getDocumentWindow(node.ownerDocument);
		if(node.tagName.toLowerCase()=="iframe"){
			win = this._iframeContentWindow(node);
			node = dojo.withGlobal(win, dojo.body);
		}

		// to capture these events at the top level,
		// attach to document, not body
		var cn = (node == dojo.body() ? dojo.doc : node);
		node[this.id+'_connect'] = [
			dojo.connect(cn, "oncontextmenu", this, "_openMyself"),
			dojo.connect(cn, "onkeydown", this, "_contextKey"),
			dojo.connect(cn, "onmousedown", this, "_contextMouse")
		];
	},

	unBindDomNode: function(/*String|DomNode*/ nodeName){
		// summary: detach menu from given node
		var node = dojo.byId(nodeName);
		dojo.forEach(node[this.id+'_connect'], dojo.disconnect);
	},

	_contextKey: function(e){
		this._contextMenuWithMouse = false;
		if (e.keyCode == dojo.keys.F10) {
			dojo.stopEvent(e);
			if (e.shiftKey && e.type=="keydown") {
				// FF: copying the wrong property from e will cause the system
				// context menu to appear in spite of stopEvent. Don't know
				// exactly which properties cause this effect.
				var _e = { target: e.target, pageX: e.pageX, pageY: e.pageY };
				_e.preventDefault = _e.stopPropagation = function(){};
				// IE: without the delay, focus work in "open" causes the system
				// context menu to appear in spite of stopEvent.
				window.setTimeout(dojo.hitch(this, function(){ this._openMyself(_e); }), 1);
			}
		}
	},

	_contextMouse: function(e){
		this._contextMenuWithMouse = true;
	},

	_openMyself: function(/*Event*/ e){
		// summary:
		//		Internal function for opening myself when the user
		//		does a right-click or something similar
		dojo.stopEvent(e);
		// if we are opening the menu with the mouse or on safari open
		// the menu at the mouse cursor
		// (Safari does not have a keyboard command to open the context menu
		// and we don't currently have a reliable way to determine
		// _contextMenuWithMouse on Safari)
		this._savedFocus = dijit.util.focus.save(this);
		if(dojo.isSafari || this._contextMenuWithMouse){
			dijit.util.popup.open({ popup: this, x: e.pageX, y: e.pageY });
		}else{
			// otherwise open near e.target
			var coords = dojo.coords(e.target, true);
			dijit.util.popup.open({popup: this, x: coords.x + 10, y: coords.y + 10});
		}
	},

	onOpen: function(/*Event*/ e){
		// summary
		//		Open menu relative to the mouse
		this._focusFirstItem();
		this.isShowingNow = true;
	},

	onClose: function(){
		// summary: callback when this menu is closed
		this._stopSubmenuTimer();
		this.parentMenu = null;
		this.isShowingNow = false;
		this.currentSubmenu = null;
	},

	_openSubmenu: function(){
		// summary: open the submenu to the side of the current menu item
		this._stopSubmenuTimer();
		var from_item = this._focusedItem;
		var submenu = from_item.popup;

		if(submenu.isShowingNow){ return; }
		submenu.parentMenu = this;
		dijit.util.popup.open({popup: submenu, around: from_item.arrowCell, orient: {'TR': 'TL', 'TL': 'TR'}, submenu: true});

		this.currentSubmenu = submenu;
	}
}
);

dojo.declare(
	"dijit.MenuItem",
	[dijit._Widget, dijit._Templated, dijit._Contained],
{
	// summary
	//	A line item in a Menu2

	// Make 3 columns
	//   icon, label, and arrow (BiDi-dependent) indicating sub-menu
	templateString:
		 '<tr class="dijitReset dijitMenuItem"'
		+'dojoAttachEvent="onmouseover:_onHover;onmouseout:_onUnhover;onklick:_onClick;">'
		+'<td class="dijitReset"><div class="dijitMenuItemIcon ${iconClass}"></div></td>'
		+'<td tabIndex="-1" class="dijitReset dijitMenuItemLabel" dojoAttachPoint="containerNode" waiRole="menuitem"></td>'
		+'<td class="dijitReset" dojoAttachPoint="arrowCell">'
			+'<span class="dijitA11yRightArrow" style="display:none;" dojoAttachPoint="arrow">&#9658;</span>'
		+'</td>'
		+'</tr>',

	// iconSrc: String
	//	path to icon to display to the left of the menu text
	iconSrc: '',

	// label: String
	//	menu text
	label: '',

	// iconClass: String
	//	class to apply to div in button to make it display an icon
	iconClass: "",

	// disabled: Boolean
	//  if true, the menu item is disabled
	//  if false, the menu item is enabled
	disabled: false,

	postCreate: function(){
		dojo.setSelectable(this.domNode, false);
		this.setDisabled(this.disabled);
		if(this.label){
			this.containerNode.innerHTML=this.label;
		}
	},

	_onHover: function(){
		// summary: callback when mouse is moved onto menu item
		this.getParent().onItemHover(this);
	},

	_onUnhover: function(){
		// summary: callback when mouse is moved off of menu item
		// if we are unhovering the currently selected item
		// then unselect it
		this.getParent().onItemUnhover(this);
	},

	_onClick: function(focus){
		this.getParent().onItemClick(this);
	},

	onClick: function() {
		// summary
		//	User defined function to handle clicks
	},

	_focus: function(){
		dojo.addClass(this.domNode, 'dijitMenuItemHover');
		try{
			this.containerNode.focus();
		}catch(e){
			// this throws on IE (at least) in some scenarios
		}
	},

	_blur: function(){
		dojo.removeClass(this.domNode, 'dijitMenuItemHover');
	},

	setDisabled: function(/*Boolean*/ value){
		// summary: enable or disable this menu item
		this.disabled = value;
		dojo[value ? "addClass" : "removeClass"](this.domNode, 'dijitMenuItemDisabled');
		dijit.util.wai.setAttr(this.containerNode, 'waiState', 'disabled', value ? 'true' : 'false');
	}
});

dojo.declare(
	"dijit.PopupMenuItem",
	dijit.MenuItem,
{
	_fillContent: function(){
		// my inner HTML contains both the label and a drop down widget, like
		// <SubMenu>  <span>click me</span>  <Menu> ... </Menu> </SubMenu>
		// first part holds button label and second part is popup
		if(this.srcNodeRef){
			var nodes = dojo.query("*", this.srcNodeRef);
			dijit.PopupMenuItem.superclass._fillContent.call(this, nodes[0]);
			
			// save pointer to srcNode so we can grab the drop down widget after it's instantiated
			this.dropDownContainer = this.srcNodeRef;
		}
	},

	startup: function(){
		// we didn't copy the dropdown widget from the this.srcNodeRef, so it's in no-man's
		// land now.  move it to document.body.
		if(!this.popup){
			var node = dojo.query("[widgetId]", this.dropDownContainer)[0];
			this.popup = dijit.util.manager.byNode(node);
		}
		dojo.body().appendChild(this.popup.domNode);

		this.popup.domNode.style.display="none";
		dojo.style(this.arrow, "display", "");
		dijit.util.wai.setAttr(this.containerNode, "waiState", "haspopup", "true");
	}
});

dojo.declare(
	"dijit.MenuSeparator",
	[dijit._Widget, dijit._Templated, dijit._Contained],
{
	// summary
	//	A line between two menu items

	templateString: '<tr class="dijitMenuSeparator"><td colspan=3>'
			+'<div class="dijitMenuSeparatorTop"></div>'
			+'<div class="dijitMenuSeparatorBottom"></div>'
			+'</td></tr>',

	postCreate: function(){
		dojo.setSelectable(this.domNode, false);
	}
});

}

if(!dojo._hasResource["dojo.regexp"]){
dojo._hasResource["dojo.regexp"] = true;
dojo.provide("dojo.regexp");

dojo.regexp.escapeString = function(/*String*/str, /*String?*/except){
//summary:
//	Adds escape sequences for special characters in regular expressions
// except: a String with special characters to be left unescaped

//	return str.replace(/([\f\b\n\t\r[\^$|?*+(){}])/gm, "\\$1"); // string
	return str.replace(/([\.$?*!=:|{}\(\)\[\]\\\/^])/g, function(ch){
		if(except && except.indexOf(ch) != -1){
			return ch;
		}
		return "\\" + ch;
	}); // String
}

dojo.regexp.buildGroupRE = function(/*value or Array of values*/a, /*Function(x) returns a regular expression as a String*/re,
	/*Boolean?*/nonCapture){
	// summary: Builds a regular expression that groups subexpressions
	// description: A utility function used by some of the RE generators.
	//  The subexpressions are constructed by the function, re, in the second parameter.
	//  re builds one subexpression for each elem in the array a, in the first parameter.
	//  Returns a string for a regular expression that groups all the subexpressions.
	//
	// a:  A single value or an array of values.
	// re:  A function.  Takes one parameter and converts it to a regular expression. 
	// nonCapture: If true, uses non-capturing match, otherwise matches are retained by regular expression. 

	// case 1: a is a single value.
	if(!(a instanceof Array)){
		return re(a); // String
	}

	// case 2: a is an array
	var b = [];
	for (var i = 0; i < a.length; i++){
		// convert each elem to a RE
		b.push(re(a[i]));
	}

	 // join the REs as alternatives in a RE group.
	return dojo.regexp.group(b.join("|"), nonCapture); // String
}

dojo.regexp.group = function(/*String*/expression, /*Boolean?*/nonCapture){
	// summary: adds group match to expression
	// nonCapture: If true, uses non-capturing match, otherwise matches are retained by regular expression. 
	return "(" + (nonCapture ? "?:":"") + expression + ")"; // String
}

}

if(!dojo._hasResource["dojo.number"]){
dojo._hasResource["dojo.number"] = true;
dojo.provide("dojo.number");


dojo.requireLocalization("dojo.cldr", "number", null, "zh-cn,en,en-ca,zh-tw,en-us,it,ja-jp,ROOT,de-de,es-es,fr,pt,ko-kr,es,de");



dojo.number.format = function(/*Number*/value, /*Object?*/options){
	// summary:
	//		Format a Number as a String, using locale-specific settings
	//
	// description:
	//		Create a string from a Number using a known localized pattern.
	//		Formatting patterns appropriate to the locale are chosen from the CLDR http://unicode.org/cldr
	//		as well as the appropriate symbols and delimiters.  See http://www.unicode.org/reports/tr35/#Number_Elements
	//
	// value:
	//		the number to be formatted.  If not a valid JavaScript number, return null.
	//
	// options: object {pattern: String?, type: String?, places: Number?, round: Number?, currency: String?, symbol: String?, locale: String?}
	//		pattern- override formatting pattern with this string (see dojo.number._applyPattern)
	//		type- choose a format type based on the locale from the following: decimal, scientific, percent, currency. decimal by default.
	//		places- fixed number of decimal places to show.  This overrides any information in the provided pattern.
	//		round- 5 rounds to nearest .5; 0 rounds to nearest whole (default). -1 means don't round.
	//		currency- iso4217 currency code
	//		symbol- localized currency symbol
	//		locale- override the locale used to determine formatting rules

	options = dojo.mixin({}, options || {});
	var locale = dojo.i18n.normalizeLocale(options.locale);
	var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
	options.customs = bundle;
	var pattern = options.pattern || bundle[(options.type || "decimal") + "Format"];
	if(isNaN(value)){ return null; } // null
	return dojo.number._applyPattern(value, pattern, options); // String
};

//dojo.number._numberPatternRE = /(?:[#0]*,?)*[#0](?:\.0*#*)?/; // not precise, but good enough
dojo.number._numberPatternRE = /[#0,]*[#0](?:\.0*#*)?/; // not precise, but good enough

dojo.number._applyPattern = function(/*Number*/value, /*String*/pattern, /*Object?*/options){
	// summary: Apply pattern to format value as a string using options. Gives no consideration to local customs.
	// value: the number to be formatted.
	// pattern: a pattern string as described in http://www.unicode.org/reports/tr35/#Number_Format_Patterns
	// options: object {customs: Object?, places: Number?, currency: String?, round: Number?, symbol: String?}
	//  customs- a hash containing: decimal, group, ...

//TODO: support escapes
	options = options || {};
	var group = options.customs.group;
	var decimal = options.customs.decimal;

	var patternList = pattern.split(';');
	var positivePattern = patternList[0];
	pattern = patternList[(value < 0) ? 1 : 0] || ("-" + positivePattern);

	//TODO: only test against unescaped
	if(pattern.indexOf('%') != -1){
		value *= 100;
	}else if(pattern.indexOf('\u2030') != -1){
		value *= 1000; // per mille
	}else if(pattern.indexOf('\u00a4') != -1){
		group = options.customs.currencyGroup || group;//mixins instead?
		decimal = options.customs.currencyDecimal || decimal;// Should these be mixins instead?
		pattern = pattern.replace(/\u00a4{1,3}/, function(match){
			var prop = ["symbol", "currency", "displayName"][match.length-1];
			return options[prop] || options.currency || "";
		});
	}else if(pattern.indexOf('E') != -1){
		throw new Error("exponential notation not supported");
	}
	
//TODO: support @ sig figs?
	var numberPatternRE = dojo.number._numberPatternRE;
	var numberPattern = positivePattern.match(numberPatternRE);
	if(!numberPattern){
		throw new Error("unable to find a number expression in pattern: "+pattern);
	}
	return pattern.replace(numberPatternRE,
		dojo.number._formatAbsolute(value, numberPattern[0], {decimal: decimal, group: group, places: options.places}));
}

dojo.number.round = function(/*Number*/value, /*Number*/places, /*Number?*/multiple){
	// summary: Rounds the number at the given number of places
	// value: the number to round
	// places: the number of decimal places where rounding takes place
	// multiple: rounds next place to nearest multiple

	var pieces = String(value).split(".");
	var length = (pieces[1] && pieces[1].length) || 0;
	if(length > places){
		var factor = Math.pow(10, places);
		if(multiple > 0){factor *= 10/multiple;places++;} //FIXME
		value = Math.round(value * factor)/factor;

		// truncate to remove any residual floating point values
		pieces = String(value).split(".");
		length = (pieces[1] && pieces[1].length) || 0;
		if(length > places){
			pieces[1] = pieces[1].substr(0, places);
			value = Number(pieces.join("."));
		}
	}
	return value; //Number
}

dojo.number._formatAbsolute = function(/*Number*/value, /*String*/pattern, /*Object?*/options){
	// summary: 
	//		Apply numeric pattern to absolute value using options. Gives no
	//		consideration to local customs.
	// value:
	//		the number to be formatted, ignores sign
	// pattern:
	//		the number portion of a pattern (e.g. #,##0.00)
	// options:
	//		object {decimal: String?, group: String?, places: Number?}
	//  		decimal: the decimal separator
	//  		group: the group separator
	//  		places: number of decimal places
	//  		round: 5 rounds to nearest .5; 0 rounds to nearest whole (default). -1 means don't round.
	options = options || {};
	if(options.places === true){options.places=0;}
	if(options.places === Infinity){options.places=6;} // avoid a loop; pick a limit

	var patternParts = pattern.split(".");
	var maxPlaces = (options.places >= 0) ? options.places : (patternParts[1] && patternParts[1].length) || 0;
	if(!(options.round < 0)){
		value = dojo.number.round(value, maxPlaces, options.round);
	}

	var valueParts = String(Math.abs(value)).split(".");
	var fractional = valueParts[1] || "";
	if(options.places){
		valueParts[1] = dojo.string.pad(fractional.substr(0, options.places), options.places, '0', true);
	}else if(patternParts[1] && options.places !== 0){
		// Pad fractional with trailing zeros
		var pad = patternParts[1].lastIndexOf("0") + 1;
		if(pad > fractional.length){
			valueParts[1] = dojo.string.pad(fractional, pad, '0', true);
		}

		// Truncate fractional
		var places = patternParts[1].length;
		if(places < fractional.length){
			valueParts[1] = fractional.substr(0, places);
		}
	}else{
		if(valueParts[1]){ valueParts.pop(); }
	}

	// Pad whole with leading zeros
	var patternDigits = patternParts[0].replace(',', '');
	pad = patternDigits.indexOf("0");
	if(pad != -1){
		pad = patternDigits.length - pad;
		if(pad > valueParts[0].length){
			valueParts[0] = dojo.string.pad(valueParts[0], pad);
		}

		// Truncate whole
		if(patternDigits.indexOf("#") == -1){
			valueParts[0] = valueParts[0].substr(valueParts[0].length - pad);
		}
	}

	// Add group separators
	var index = patternParts[0].lastIndexOf(',');
	var groupSize, groupSize2;
	if(index != -1){
		groupSize = patternParts[0].length - index - 1;
		var remainder = patternParts[0].substr(0, index);
		index = remainder.lastIndexOf(',');
		if(index != -1){
			groupSize2 = remainder.length - index - 1;
		}
	}
	var pieces = [];
	for(var whole = valueParts[0]; whole;){
		var off = whole.length - groupSize;
		pieces.push((off > 0) ? whole.substr(off) : whole);
		whole = (off > 0) ? whole.slice(0, off) : "";
		if(groupSize2){
			groupSize = groupSize2;
			delete groupSize2;
		}
	}
	valueParts[0] = pieces.reverse().join(options.group || ",");

	return valueParts.join(options.decimal || ".");
};

dojo.number.regexp = function(/*Object?*/options){
	//
	// summary:
	//		Builds the regular needed to parse a number
	//
	// description:
	//		returns regular expression with positive and negative match, group
	//		and decimal separators
	//
	// options: object {pattern: String, type: String locale: String, strict: Boolean, places: mixed}
	//		pattern- override pattern with this string
	//		type- choose a format type based on the locale from the following: decimal, scientific, percent, currency. decimal by default.
	//		locale- override the locale used to determine formatting rules
	//		strict- strict parsing, false by default
	//		places- number of decimal places to accept: Infinity, a positive number, or a range "n,m"
	return dojo.number._parseInfo(options).regexp; // String
}

dojo.number._parseInfo = function(/*Object?*/options){
	options = options || {};
	var locale = dojo.i18n.normalizeLocale(options.locale);
	var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
	var pattern = options.pattern || bundle[(options.type || "decimal") + "Format"];
//TODO: memoize?
	var group = bundle.group;
	var decimal = bundle.decimal;
	var factor = 1;

	if(pattern.indexOf('%') != -1){
		factor /= 100;
	}else if(pattern.indexOf('\u2030') != -1){
		factor /= 1000; // per mille
	}else{
		var isCurrency = pattern.indexOf('\u00a4') != -1;
		if(isCurrency){
			group = bundle.currencyGroup || group;
			decimal = bundle.currencyDecimal || decimal;
		}
	}

	if(group == '\xa0'){ group = ' '; }

	//TODO: handle quoted escapes
	var patternList = pattern.split(';');
	if(patternList.length == 1){
		patternList.push("-" + patternList[0]);
	}

	var re = dojo.regexp.buildGroupRE(patternList, function(pattern){
		pattern = "(?:"+dojo.regexp.escapeString(pattern, '.')+")";
		return pattern.replace(dojo.number._numberPatternRE, function(format){
			var flags = {
				signed: false,
				separator: options.strict ? group : [group,""],
				fractional: options.fractional,
				decimal: decimal,
				exponent: false};
			var parts = format.split('.');
			var places = options.places;
			if(parts.length == 1 || places === 0){flags.fractional = false;}
			else{
				if(typeof places == "undefined"){ places = parts[1].lastIndexOf('0')+1; }
				if(places && options.fractional == undefined){flags.fractional = true;} // required fractional, unless otherwise specified
				if(!options.places && (places < parts[1].length)){ places += "," + parts[1].length; }
				flags.places = places;
			}
			var groups = parts[0].split(',');
			if(groups.length>1){
				flags.groupSize = groups.pop().length;
				if(groups.length>1){
					flags.groupSize2 = groups.pop().length;
				}
			}
			return "("+dojo.number._realNumberRegexp(flags)+")";
		});
	}, true);

	if(isCurrency){
		// substitute the currency symbol for the placeholder in the pattern
		re = re.replace(/(\s*)(\u00a4{1,3})(\s*)/g, function(match, before, target, after){
			var prop = ["symbol", "currency", "displayName"][target.length-1];
			var symbol = dojo.regexp.escapeString(options[prop] || options.currency || "");
			before = before ? "\\s" : "";
			after = after ? "\\s" : "";
			if(!options.strict){
				if(before){before += "*";}
				if(after){after += "*";}
				return "(?:"+before+symbol+after+")?";
			}
			return before+symbol+after;
		});
	}

//TODO: substitute localized sign/percent/permille/etc.?

	return {regexp: re, group: group, decimal: decimal, factor: factor}; // Object
}

dojo.number.parse = function(/*String*/expression, /*Object?*/options){
	// summary:
	//		Convert a properly formatted string to a primitive Number,
	//		using locale-specific settings.
	//
	// description:
	//		Create a Number from a string using a known localized pattern.
	//		Formatting patterns are chosen appropriate to the locale.
	//		Formatting patterns are implemented using the syntax described at
	//		*URL*
	//
	// expression: A string representation of a Number
	//
	// options: 
	//		object {pattern: string, locale: string, strict: boolean}
	//		pattern:
	//			override pattern with this string
	//		type:
	//			choose a format type based on the locale from the following:
	//			decimal, scientific, percent, currency. decimal by default.
	//		locale:
	//			override the locale used to determine formatting rules
	//		strict: 
	//			strict parsing, false by default
	//		currency:
	//			object with currency information

	var info = dojo.number._parseInfo(options);

	var results = (new RegExp("^"+info.regexp+"$")).exec(expression);
		if(!results){
			return NaN; //NaN
	}
	var absoluteMatch = results[1]; // match for the positive expression
	if(!results[1]){
		if(!results[2]){
			return NaN; //NaN
		}
		// matched the negative pattern
		absoluteMatch = results[2];
		info.factor *= -1;
	}

	// Transform it to something Javascript can parse as a number
	while(absoluteMatch.indexOf(info.group) != -1){
		absoluteMatch = absoluteMatch.replace(info.group, "");
	}
	absoluteMatch = absoluteMatch.replace(info.decimal, ".");

	// Adjust for negative sign, percent, etc. as necessary
	return Number(absoluteMatch) * info.factor; //Number
};

dojo.number._realNumberRegexp = function(/*Object?*/flags){
	// summary: Builds a regular expression to match a real number in exponential notation
	//
	// flags:An object
	//		flags.places:
	//			The integer number of decimal places or a range given as "n,m".
	//			If not given, the decimal part is optional and the number of
	//			places is unlimited.
	//		flags.decimal:
	//			A string for the character used as the decimal point.  Default
	//			is ".".
	//    flags.fractional:
	//			Whether decimal places are allowed.  Can be true, false, or
	//			[true, false].  Default is [true, false]
	//    flags.exponent:
	//			Express in exponential notation.  Can be true, false, or [true,
	//			false]. Default is [true, false], (i.e. will match if the
	//			exponential part is present are not).
	//    flags.eSigned:
	//			The leading plus-or-minus sign on the exponent.  Can be true,
	//			false, or [true, false].  Default is [true, false], (i.e. will
	//			match if it is signed or unsigned).  flags in regexp.integer
	//			can be applied.

	// assign default values to missing paramters
	flags = (typeof flags == "object") ? flags : {};
	if(typeof flags.places == "undefined"){ flags.places = Infinity; }
	if(typeof flags.decimal != "string"){ flags.decimal = "."; }
	if(typeof flags.fractional == "undefined"){ flags.fractional = [true, false]; }
	if(typeof flags.exponent == "undefined"){ flags.exponent = [true, false]; }
	if(typeof flags.eSigned == "undefined"){ flags.eSigned = [true, false]; }

	// integer RE
	var integerRE = dojo.number._integerRegexp(flags);

	// decimal RE
	var decimalRE = dojo.regexp.buildGroupRE(flags.fractional,
		function(q){
			var re = "";
			if(q && (flags.places!==0)){
				re = "\\" + flags.decimal;
				if(flags.places == Infinity){ 
					re = "(?:" + re + "\\d+)?"; 
				}else{
					re += "\\d{" + flags.places + "}"; 
				}
			}
			return re;
		},
		true
	);

	// exponent RE
	var exponentRE = dojo.regexp.buildGroupRE(flags.exponent,
		function(q){ 
			if(q){ return "([eE]" + dojo.number._integerRegexp({ signed: flags.eSigned}) + ")"; }
			return ""; 
		}
	);

	// real number RE
	var realRE = integerRE + decimalRE;
	// allow for decimals without integers, e.g. .25
	if(decimalRE){realRE = "(?:(?:"+ realRE + ")|(?:" + decimalRE + "))";}
	return realRE + exponentRE; // String
};

dojo.number._integerRegexp = function(/*Object?*/flags){
	// summary: 
	//		Builds a regular expression that matches an integer
	// flags: 
	//		An object
	//		flags.signed :
	//			The leading plus-or-minus sign. Can be true, false, or [true,
	//			false]. Default is [true, false], (i.e. will match if it is
	//			signed or unsigned).
	//		flags.separator:
	//			The character used as the thousands separator. Default is no
	//			separator. For more than one symbol use an array, e.g. [",",
	//			""], makes ',' optional.
	//		flags.groupSize: group size between separators
	//		flags.groupSize2: second grouping (for India)

	// assign default values to missing paramters
	flags = (typeof flags == "object") ? flags : {};
	if(typeof flags.signed == "undefined"){ flags.signed = [true, false]; }
	if(typeof flags.separator == "undefined"){
		flags.separator = "";
	}else if(typeof flags.groupSize == "undefined"){
		flags.groupSize = 3;
	}
	// build sign RE
	var signRE = dojo.regexp.buildGroupRE(flags.signed,
		function(q) { return q ? "[-+]" : ""; },
		true
	);

	// number RE
	var numberRE = dojo.regexp.buildGroupRE(flags.separator,
		function(sep){ 
			if(!sep){ 
				return "(?:0|[1-9]\\d*)";
			}
			sep = dojo.regexp.escapeString(sep);
			var grp = flags.groupSize, grp2 = flags.groupSize2;
			if(grp2){
				var grp2RE = "(?:0|[1-9]\\d{0," + (grp2-1) + "}(?:[" + sep + "]\\d{" + grp2 + "})*[" + sep + "]\\d{" + grp + "})";
				return ((grp-grp2) > 0) ? "(?:" + grp2RE + "|(?:0|[1-9]\\d{0," + (grp-1) + "}))" : grp2RE;
			}
			return "(?:0|[1-9]\\d{0," + (grp-1) + "}(?:[" + sep + "]\\d{" + grp + "})*)";
		},
		true
	);

	// integer RE
	return signRE + numberRE; // String
}

}

if(!dojo._hasResource["dijit.ProgressBar"]){
dojo._hasResource["dijit.ProgressBar"] = true;
dojo.provide("dijit.ProgressBar");








dojo.declare(
	"dijit.ProgressBar",
	[dijit._Widget, dijit._Templated],
	null,
	{
		// summary:
		// a progress widget, with some calculation and server polling capabilities
		//
		// description:
		// (implementation) four overlapped divs:
		// (1) lower z-index
		// (4) higher z-index
		// empty and full percent label have the same content: when the vertical line (*)
		// partially hides the emptyLabel, the fullLabel becomes visible
		//
		//  ___________________________(1)_domNode____________________________________
		// |__(3)_internalProgress____________                                        |
		// |                                  | <--- (*)                              |
		// |            (4) fullLabel        | (2) emptyLabel                         |
		// |__________________________________|                                       |
		// |__________________________________________________________________________|
		//
		// usage:
		// <div dojoType="ProgressBar"
		//   duration="..."
		//   places="0"
		//   progress="..." maximum="..."></div>

		// progress: String (Percentage or Number)
		// initial progress value.
		// with "%": percentual value, 0% <= progress <= 100%
		// or without "%": absolute value, 0 <= progress <= maximum
		progress: "0",

		// maximum: Float
		// max sample number
		maximum: 100,

		// places: Number
		// number of places to show in values; 0 by default
		places: 0,

		// indeterminate: Boolean
		// false: show progress
		// true: show that a process is underway but that the progress is unknown
		indeterminate: false,

		templateString:"<div class=\"dijitProgressBar dijitProgressBarEmpty\"\n\t><div dojoAttachPoint=\"emptyLabel\" class=\"dijitProgressBarEmptyLabel\"\n\t></div\n\t><div waiRole=\"progressbar\" tabindex=\"0\" dojoAttachPoint=\"internalProgress\" class=\"dijitProgressBarFull\"\n\t\t><div class=\"dijitProgressBarTile\"\n\t\t></div\n\t\t><div dojoAttachPoint=\"fullLabel\" class=\"dijitProgressBarFullLabel\"\n\t\t></div\n\t></div\n\t><img dojoAttachPoint=\"inteterminateHighContrastImage\" class=\"dijitIndeterminateProgressBarHighContrastImage\"\n\t></img\n></div>\n",

		_indeterminateHighContrastImagePath:
			dojo.moduleUrl("dijit", "themes/a11y/indeterminate_progress.gif"),

		// public functions
		postCreate: function(){
			dijit.ProgressBar.superclass.postCreate.apply(this, arguments);
			//TODO: can this be accomplished in the template layout?
			// MOW: don't think so because it needs to be set to the absolute size
			//		of the dom node, not the size of the containing element (the full part)
			this.fullLabel.style.width = dojo.getComputedStyle(this.domNode).width;
			this.inteterminateHighContrastImage.setAttribute("src",
				this._indeterminateHighContrastImagePath);
			this.update();
		},

		update: function(/*Object?*/attributes){
			// summary: update progress information
			//
			// attributes: may provide progress and/or maximum properties on this parameter,
			//	see attribute specs for details.
			dojo.mixin(this, attributes||{});
			if(this.indeterminate){
				dojo.addClass(this.domNode, "dijitProgressBarIndeterminate");
				this.internalProgress.style.width = "100%";
				dijit.util.wai.removeAttr(this.internalProgress, "waiState", "valuenow");
				this._setLabels("");
			}else{
				dojo.removeClass(this.domNode, "dijitProgressBarIndeterminate");
				var percent;
				if(String(this.progress).indexOf("%") != -1){
					percent = Math.min(parseFloat(this.progress)/100, 1);
					this.progress = percent * this.maximum;
				}else{
					this.progress = Math.min(this.progress, this.maximum);
					percent = this.progress / this.maximum;
				}
				this.internalProgress.style.width = (percent * 100) + "%";
				var text = this.report(percent);
				dijit.util.wai.setAttr(this.internalProgress, "waiState", "valuenow", text);
				this._setLabels(text);
			}
			this.onChange();
		},

		_setLabels: function(/*string*/text){
			dojo.forEach(["full", "empty"], function(name){
				var labelNode = this[name+"Label"];
				if(labelNode.firstChild){
					labelNode.firstChild.nodeValue = text;
				}else{
					labelNode.appendChild(dojo.doc.createTextNode(text));
				}

// move this out of update, or perhaps replace with css or template layout?
				var dim = dojo.contentBox(labelNode);
				var labelBottom = (parseInt(dojo.getComputedStyle(this.domNode).height) - dim.h)/2;
				labelNode.style.bottom = labelBottom + 'px';
			}, this);
		},

		report: function(/*float*/percent){
			// Generates message to show; may be overridden by user
			return dojo.number.format(percent, {type: "percent", places: this.places, locale: this.lang});
		},

		onChange: function(){}
	}
);

}

if(!dojo._hasResource["dijit.TitlePane"]){
dojo._hasResource["dijit.TitlePane"] = true;
dojo.provide("dijit.TitlePane");






dojo.declare(
	"dijit.TitlePane",
	[dijit._Widget, dijit._Templated],
{
	// summary
	//		A pane with a title on top, that can be opened or collapsed.

	// title: String
	//		Title of the pane
	title: "",

	// open: Boolean
	//		Whether pane is opened or closed.
	open: true,

	// duration: Integer
	//		milliseconds to fade in/fade out
	duration: 250,

	contentClass : "dijitTitlePaneContent",

	templateString:"<div id=\"${id}\">\n\t<div dojoAttachEvent=\"onclick: _onTitleClick; onkeypress: _onTitleKey\" tabindex=\"0\"\n\t\t\twaiRole=\"button\" class=\"dijitTitlePaneTitle\" dojoAttachPoint=\"focusNode\">\n\t\t<span class=\"dijitOpenCloseArrowOuter\" style=\"float: left;\"><span class=\"dijitOpenCloseArrowInner\"></span></span>\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dijitInlineBox dijitTitleNode\"></span>\n\t</div>\n\t<div dojoAttachPoint=\"containerNode\" waiRole=\"region\" tabindex=\"-1\" class=\"dijitTitlePaneContent\"></div>\n</div>\n",

	postCreate: function(){
		this.setTitle(this.title);
		if(!this.open){
			dojo.style(this.containerNode, "display", "none");
		}
		this._setCss();
		dijit.TitlePane.superclass.postCreate.apply(this, arguments);
		dijit.util.wai.setAttr(this.containerNode, "waiState", "titleledby", this.titleNode.id);
		dijit.util.wai.setAttr(this.focusNode, "waiState", "haspopup", "true");

		// setup open/close animations
		this._slideIn = dojo.fx.slideIn({node: this.containerNode, duration: this.duration});
		this._slideOut = dojo.fx.slideOut({node: this.containerNode, duration: this.duration});
	},

	_onTitleClick: function(){
		// summary: callback when title is clicked
		dojo.forEach([this._slideIn, this._slideOut], function(animation){
			if(animation.status() == "playing"){
				animation.stop();
			}
		});
		this[this.open ? "_slideOut" : "_slideIn"].play();
		this.open=!this.open;
		this._setCss();
	},

	_setCss: function(){
		var classes = ["dijitClosed", "dijitOpen"];
		var boolIndex = this.open;
		dojo.removeClass(this.domNode, classes[!boolIndex+0]);
		this.domNode.className += " " + classes[boolIndex+0];
	},

	_onTitleKey: function(/*Event*/ e){
		// summary: callback when user hits a key
		if(e.keyCode == dojo.keys.ENTER || e.charCode == dojo.keys.SPACE){
			this._onTitleClick();
		}
		else if (e.keyCode == dojo.keys.DOWN_ARROW){
			if(this.open){
				this.containerNode.focus();
				e.preventDefault();
			}
	 	}
	},

	setTitle: function(/*String*/ title){
		// summary: sets the text of the title
		this.titleNode.innerHTML=title;
	}
});

}

if(!dojo._hasResource["dijit.Tooltip"]){
dojo._hasResource["dijit.Tooltip"] = true;
dojo.provide("dijit.Tooltip");







dojo.declare(
	"dijit._MasterTooltip",
	[dijit._Widget, dijit._Templated],
	{
		// summary
		//		Internal widget that holds the actual tooltip markup,
		//		which occurs once per page.
		//		Called by Tooltip widgets which are just containers to hold
		//		the markup

		// duration: Integer
		//		Milliseconds to fade in/fade out
		duration: 200,

		templateString:"<div class=\"dijitTooltip\" id=\"dojoTooltip\">\n\t<div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\" waiRole='alert'></div>\n\t<div class=\"dijitTooltipConnector\"></div>\n</div>\n",

		postCreate: function(){
			dojo.body().appendChild(this.domNode);

			this.bgIframe = new dijit.util.BackgroundIframe(this.domNode);

			// Setup fade-in and fade-out functions.  An IE bug prevents the arrow from showing up
			// unless opacity==1, because it's displayed via overflow: visible on the main div.
			var opacity = dojo.isIE ? 1 : dojo.style(this.domNode, "opacity");
			this.fadeIn = dojo._fade({node: this.domNode, duration: this.duration, end: opacity});
			dojo.connect(this.fadeIn, "onEnd", this, "_onShow");
			this.fadeOut = dojo._fade({node: this.domNode, duration: this.duration, end: 0});
			dojo.connect(this.fadeOut, "onEnd", this, "_onHide");

		},

		show: function(/*String*/ innerHTML, /*DomNode*/ aroundNode){
			// summary:
			//	Display tooltip w/specified contents to right specified node
			//	(To left if there's no space on the right, or if LTR==right)

			if(this.fadeOut.status() == "playing"){
				// previous tooltip is being hidden; wait until the hide completes then show new one
				this._onDeck=arguments;
				return;
			}
			this.containerNode.innerHTML=innerHTML;

			// position the element and change CSS according to position	
			var align = this.isLeftToRight() ? {'BR': 'BL', 'BL': 'BR'} : {'BL': 'BR', 'BR': 'BL'};
			var pos = dijit.util.placeOnScreenAroundElement(this.domNode, aroundNode, align);
			this.domNode.className="dijitTooltip dijitTooltip" + (pos.corner=='BL' ? "Right" : "Left");
			
			// show it
			dojo.style(this.domNode, "opacity", 0);
			this.fadeIn.play();
			this.isShowingNow = true;
		},

		_onShow: function(){
			if(dojo.isIE){
				// the arrow won't show up on a node w/an opacity filter
				this.domNode.style.filter="";
			}
		},

		hide: function(){
			// summary: hide the tooltip
			if(this._onDeck){
				// this hide request is for a show() that hasn't even started yet;
				// just cancel the pending show()
				this._onDeck=null;
				return;
			}
			this.fadeIn.stop();
			this.isShowingNow = false;
			this.fadeOut.play();
		},

		_onHide: function(){
			this.domNode.style.cssText="";	// to position offscreen again
			if(this._onDeck){
				// a show request has been queued up; do it now
				this.show.apply(this, this._onDeck);
				this._onDeck=null;
			}
		}

	}
);

// Make a single tooltip markup on the page that is reused as appropriate
dojo.addOnLoad(function(){
	dijit.MasterTooltip = new dijit._MasterTooltip();
});

dojo.declare(
	"dijit.Tooltip",
	dijit._Widget,
	{
		// summary
		//		Pops up a tooltip (a help message) when you hover over a node.

		// label: String
		//		Text to display in the tooltip.
		//		Specified as innerHTML when creating the widget from markup.
		label: "",

		// showDelay: Integer
		//		Number of milliseconds to wait after hovering over/focusing on the object, before
		//		the tooltip is displayed.
		showDelay: 400,

		// connectId: String
		//		Id of domNode to attach the tooltip to.
		//		(When user hovers over specified dom node, the tooltip will appear.)
		connectId: "",

		postCreate: function(){
			this.srcNodeRef.style.display="none";

			this._connectNode = dojo.byId(this.connectId);

			dojo.forEach(["onMouseOver", "onHover", "onMouseOut", "onUnHover"], function(event){
				this.connect(this._connectNode, event.toLowerCase(), "_"+event);
			}, this);
		},

		_onMouseOver: function(/*Event*/ e){
			this._onHover(e);
		},

		_onMouseOut: function(/*Event*/ e){
			if(dojo.isDescendant(e.relatedTarget, this._connectNode)){
				// false event; just moved from target to target child; ignore.
				return;
			}
			this._onUnHover(e);
		},

		_onHover: function(/*Event*/ e){
			if(this._hover){ return; }
			this._hover=true;
			// If tooltip not showing yet then set a timer to show it shortly
			if(!this.isShowingNow && !this._showTimer){
				this._showTimer = setTimeout(dojo.hitch(this, "open"), this.showDelay);
			}
		},

		_onUnHover: function(/*Event*/ e){
			if(!this._hover){ return; }
			this._hover=false;

			if(this._showTimer){
				clearTimeout(this._showTimer);
				delete this._showTimer;
			}else{
				this.close();
			}
		},

		open: function(){
			// summary: display the tooltip; usually not called directly.
			if(this.isShowingNow){ return; }
			if(this._showTimer){
				clearTimeout(this._showTimer);
				delete this._showTimer;
			}
			dijit.MasterTooltip.show(this.label || this.domNode.innerHTML, this._connectNode);
			this.isShowingNow = true;
		},

		close: function(){
			// summary: hide the tooltip; usually not called directly.
			if(!this.isShowingNow){ return; }
			dijit.MasterTooltip.hide();
			this.isShowingNow = false;
		},

		uninitialize: function(){
			this.close();
		}
	}
);

}

if(!dojo._hasResource["dijit._tree.Controller"]){
dojo._hasResource["dijit._tree.Controller"] = true;
dojo.provide("dijit._tree.Controller");




dojo.declare(
	"dijit._tree.Controller",
	[dijit._Widget],
{
	// Summary: _tree.Controller performs all basic operations on Tree
	// Description:
	//	Controller is the component to operate on model.
	//	Tree/_tree.Node know how to modify themselves and show to user,
	//  but operating on the tree often involves higher-level extensible logic,
	//  like: database synchronization, node loading, reacting on clicks etc.
	//  That's why it is handled by separate controller.
	//  Controller processes expand/collapse and should be used if you
	//  modify a tree.

	// treeId: String
	//		id of Tree widget that I'm controlling
	treeId: "",

	postMixInProperties: function(){
		// setup to handle events from tree
		dojo.subscribe(this.treeId, this, "_listener");	
	},

	_listener: function(/*Object*/ message){
		// summary: dispatcher to handle events from tree
		var event = message.event;
		var eventHandler =  "on" + event.charAt(0).toUpperCase() + event.substr(1);
		if(this[eventHandler]){
			this[eventHandler](message);
		}
	},

	onBeforeTreeDestroy: function(message){
		dojo.unsubscribe(message.tree.id);
	},

	onExecute: function(/*Object*/ message){
		// summary: an execute event has occured

		message.node.tree.focusNode(message.node);
		
		// TODO: user guide: tell users to listen for execute events
		console.log("execute message for " + message.node);
	},

	onNext: function(/*Object*/ message){
		// summary: down arrow pressed; move to next visible node

		var returnWidget;

		// if this is an expanded folder, get the first child
		var nodeWidget = message.node;
		if (nodeWidget.isFolder && nodeWidget.isExpanded && nodeWidget.hasChildren()) {
			returnWidget = nodeWidget.getChildren()[0];			
		} else {
			// find a parent node with a sibling
			while (nodeWidget.isTreeNode) {
				returnWidget = nodeWidget.getNextSibling();
				if(returnWidget){
					break;
				}
				nodeWidget = nodeWidget.getParent();
			}	
		}

		if (returnWidget && returnWidget.isTreeNode) {
			returnWidget.tree.focusNode(returnWidget);
			return returnWidget;
		}	
	},

	onPrevious: function(/*Object*/ message){
		// summary: up arrow pressed; move to previous visible node

		var nodeWidget = message.node;
		var returnWidget = nodeWidget;

		// if younger siblings		
		var previousSibling = nodeWidget.getPreviousSibling();
		if (previousSibling) {
			nodeWidget = previousSibling;
			// if the previous nodeWidget is expanded, dive in deep
			while (nodeWidget.isFolder && nodeWidget.isExpanded && nodeWidget.hasChildren()) {
				returnWidget = nodeWidget;
				// move to the last child
				var children = nodeWidget.getChildren();
				nodeWidget = children[children.length-1];
			}
		} else {
			// if this is the first child, return the parent
			nodeWidget = nodeWidget.getParent();
		}

		if (nodeWidget && nodeWidget.isTreeNode) {
			returnWidget = nodeWidget;
		}

		if (returnWidget && returnWidget.isTreeNode) {
			returnWidget.tree.focusNode(returnWidget);
			return returnWidget;
		}
	},

	onZoomIn: function(/*Object*/ message){
		// summary: right arrow pressed; go to child node
		var nodeWidget = message.node;
		var returnWidget = nodeWidget;

		// if not expanded, expand, else move to 1st child
		if (nodeWidget.isFolder && !nodeWidget.isExpanded) {
			this._expand(nodeWidget);
		}else if (nodeWidget.hasChildren()) {
			nodeWidget = nodeWidget.getChildren()[0];
		}

		if (nodeWidget && nodeWidget.isTreeNode) {
			returnWidget = nodeWidget;
		}

		if (returnWidget && returnWidget.isTreeNode) {
			returnWidget.tree.focusNode(returnWidget);
			return returnWidget;
		}
	},

	onZoomOut: function(/*Object*/ message){
		// summary: left arrow pressed; go to parent

		var node = message.node;
		var returnWidget = node;

		// if not collapsed, collapse, else move to parent
		if (node.isFolder && node.isExpanded) {
			this._collapse(node);
		} else {
			node = node.getParent();
		}
		if (node && node.isTreeNode) {
			returnWidget = node;
		}

		if (returnWidget && returnWidget.isTreeNode) {
			returnWidget.tree.focusNode(returnWidget);
			return returnWidget;
		}
	},

	onFirst: function(/*Object*/ message){
		// summary: home pressed; go to first visible node

		var returnWidget = message.tree;

		if (returnWidget){
			returnWidget = returnWidget.getChildren()[0];
			if (returnWidget && returnWidget.isTreeNode){
				returnWidget.tree.focusNode(returnWidget);
				return returnWidget;
			}
		}
	},

	onLast: function(/*Object*/ message){
		// summary: end pressed; go to last visible node

		var returnWidget = message.node.tree;

		var lastChild = returnWidget;
		while(lastChild.isExpanded){
			var c = lastChild.getChildren();
			lastChild = c[c.length - 1];
			if (lastChild.isTreeNode){
				returnWidget = lastChild;
			}
		}

		if (returnWidget && returnWidget.isTreeNode){
			returnWidget.tree.focusNode(returnWidget);
			return returnWidget;
		}
	},

	onToggleOpen: function(/*Object*/ message){
		// summary: user clicked the +/- icon; expand or collapse my children.
		var node = message.node;
		if (node.isExpanded){
			this._collapse(node);
		} else {
			this._expand(node);
		}
	},

	_expand: function(node){
		if (node.isFolder){
			node.expand(); // skip trees or non-folders
			var t = node.tree;
			if (t.lastFocused){ t.focusNode(t.lastFocused); } // restore focus
		}
	},

	_collapse: function(node){
		if (node.isFolder){
			// are we collapsing a child that has the tab index?
			if (dojo.query("[tabindex=0]", node.domNode).length > 0){
				node.tree.focusNode(node);
			}
			node.collapse();
		}
	}
});



dojo.declare(
	"dijit._tree.DataController",
	dijit._tree.Controller,
{
	// summary
	//		Controller for tree that hooks up to dojo.data

	onAfterTreeCreate: function(message){
		// when a tree is created, we query against the store to get the top level nodes
		// in the tree
		var tree = message.tree;

		var _this = this;
		function onComplete(/*dojo.data.Item[]*/ items){
			var childParams=dojo.map(items,
				function(item){
					return {
						item: item,
						isFolder: _this.store.hasAttribute(item, _this.childrenAttr)
						};
				});
			tree.setChildren(childParams);
		}
		this.store.fetch({ query: this.query, onComplete: onComplete });
	},

	_expand: function(/*_TreeNode*/ node){
		var store = this.store;
		var getValue = this.store.getValue;

		switch(node.state){
			case "LOADING":
				// ignore clicks while we are in the process of loading data
				return;

			case "UNCHECKED":
				// need to load all the children, and then expand
				var parentItem = node.item;
				var childItems = store.getValues(parentItem, this.childrenAttr);

				// count how many items need to be loaded
				var _waitCount = 0;
				dojo.forEach(childItems, function(item){ if(!store.isItemLoaded(item)){ _waitCount++; } });

		       	if(_waitCount == 0){
		       		// all items are already loaded.  proceed..
		       		this._onLoadAllItems(node, childItems);
		       	}else{
		       		// still waiting for some or all of the items to load
		       		node.markProcessing();

					var _this = this;
					function onItem(item){
		   				if(--_waitCount == 0){
							// all nodes have been loaded, send them to the tree
							node.unmarkProcessing();
							_this._onLoadAllItems(node, childItems);
						}
					}
					dojo.forEach(childItems, function(item){
						if(!store.isItemLoaded(item)){
			       			store.loadItem({item: item, onItem: onItem});
			       		}
			       	});
		       	}
		       	break;

			default:
				// data is already loaded; just proceed
				dijit._tree.Controller.prototype._expand.apply(this, arguments);
				break;
		}
	},

	_onLoadAllItems: function(/*_TreeNode*/ node, /*dojo.data.Item[]*/ items){
		// sumary: callback when all the children of a given node have been loaded
		// TODO: should this be used when the top level nodes are loaded too?
		var childParams=dojo.map(items, function(item){
			return {
				item: item,
				isFolder: this.store.hasAttribute(item, this.childrenAttr)
			};
		}, this);
		node.setChildren(childParams);
		dijit._tree.Controller.prototype._expand.apply(this, arguments);
	},

	_collapse: function(/*_TreeNode*/ node){
		if(node.state == "LOADING"){
			// ignore clicks while we are in the process of loading data
			return;
		}
		dijit._tree.Controller.prototype._collapse.apply(this, arguments);
	}

});

}

if(!dojo._hasResource["dijit.Tree"]){
dojo._hasResource["dijit.Tree"] = true;
dojo.provide("dijit.Tree");








dojo.declare(
	"dijit._TreeBase",
	[dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained],
{
	// summary:
	//	Base class for Tree and _TreeNode

	// state: String
	//		dynamic loading-related stuff.
	//		When an empty folder node appears, it is "UNCHECKED" first,
	//		then after dojo.data query it becomes "LOADING" and, finally "LOADED"	
	state: "UNCHECKED",
	locked: false,

	lock: function(){
		// summary: lock this node (and it's descendants) while a delete is taking place?
		this.locked=true;
	},
	unlock: function(){
		if(!this.locked){
			//dojo.debug((new Error()).stack);
			throw new Error(this.declaredClass+" unlock: not locked");
		}
		this.locked=false;
	},

	isLocked: function(){
		// summary: can this node be modified?
		// returns: false if this node or any of it's ancestors are locked
		var node = this;
		while(true){
			if(node.lockLevel){
				return true;
			}
			if(!node.getParent() || node.isTree){
				break;
			}	
			node = node.getParent();	
		}
		return false;
	},

	setChildren: function(/* Object[] */ childrenArray){
		// summary:
		//		Sets the children of this node.
		//		Sets this.isFolder based on whether or not there are children
		// 		Takes array of objects like: {label: ..., type: ... }
		//		See parameters of _TreeNode for details.

		this.destroyDescendants();

		this.state = "LOADED";

		if(childrenArray && childrenArray.length > 0){
			this.isFolder = true;
			if(!this.containerNode){ // maybe this node was unfolderized and still has container
				this.containerNode = this.tree.containerNodeTemplate.cloneNode(true);
				this.domNode.appendChild(this.containerNode);
			}

			// Create _TreeNode widget for each specified tree node
			dojo.forEach(childrenArray, function(childParams){
				var child = new dijit._TreeNode(dojo.mixin({
					tree: this.tree,
					label: this.tree.store.getLabel(childParams.item)
				}, childParams));
				this.addChild(child);
			}, this);

			// note that updateLayout() needs to be called on each child after
			// _all_ the children exist
			dojo.forEach(this.getChildren(), function(child, idx){
				child._updateLayout();

				var message = {
					child: child,
					index: idx,
					parent: this
				};
			});
		}else{
			this.isFolder=false;
		}
		
		if (this.isTree){
			// put first child in tab index if one exists.
			var fc = this.getChildren()[0];
			var tabnode = (fc) ? fc.labelNode : this.domNode; 
			tabnode.setAttribute("tabIndex", "0");
		}
	}
});

dojo.declare(
	"dijit.Tree",
	dijit._TreeBase,
{
	// summary
	//	Tree view does all the drawing, visual node management etc.
	//	Throws events about clicks on it, so someone may catch them and process
	//	Events:
	//		afterTreeCreate,
	//		beforeTreeDestroy,
	//		execute				: for clicking the label, or hitting the enter key when focused on the label,
	//		toggleOpen			: for clicking the expando key (toggles hide/collapse),
	//		previous			: go to previous visible node,
	//		next				: go to next visible node,
	//		zoomIn				: go to child nodes,
	//		zoomOut				: go to parent node

	// store: String||dojo.data.Store
	//	The store to get data to display in the tree
	store: null,

	// query: String
	//	query to get top level node(s) of tree (ex: {type:'continent'})
	query: null,

	// childrenAttr: String
	//		name of attribute that holds children of a tree node
	childrenAttr: "children",

	templateString:"<div class=\"TreeContainer\" style=\"\" waiRole=\"tree\"\n\tdojoAttachEvent=\"onclick:_onClick;onkeypress:_onKeyPress\"\n></div>\n",		

	isExpanded: true, // consider this "root node" to be always expanded

	isTree: true,

	_publish: function(/*String*/ topicName, /*Object*/ message){
		// summary:
		//		Publish a message for this widget/topic
		dojo.publish(this.id, [dojo.mixin({tree: this, event: topicName}, message||{})]);
	},

	postMixInProperties: function(){
		this.tree = this;

		// setup table mapping keys to events
		var keyTopicMap = {};
		keyTopicMap[dojo.keys.ENTER]="execute";
		keyTopicMap[dojo.keys.LEFT_ARROW]="zoomOut";
		keyTopicMap[dojo.keys.RIGHT_ARROW]="zoomIn";
		keyTopicMap[dojo.keys.UP_ARROW]="previous";
		keyTopicMap[dojo.keys.DOWN_ARROW]="next";
		keyTopicMap[dojo.keys.HOME]="first";
		keyTopicMap[dojo.keys.END]="last";
		this._keyTopicMap = keyTopicMap;
	},

	postCreate: function(){
		this.containerNode = this.domNode;

		// make template for container node (we will clone this and insert it into
		// any nodes that have children)
		var div = document.createElement('div');
		div.style.display = 'none';
		div.className="TreeContainer";	
		dijit.util.wai.setAttr(div, "waiRole", "role", "presentation");
		this.containerNodeTemplate = div;


		// start the controller, passing in the store
		this._controller = new dijit._tree.DataController(
			{	
				store: this.store,
				treeId: this.id,
				query: this.query,
				childrenAttr: this.childrenAttr
			}
		);

		this._publish("afterTreeCreate");
	},

	destroy: function(){
		// publish destruction event so that any listeners should stop listening
		this._publish("beforeTreeDestroy");

		return dijit._Widget.prototype.destroy.apply(this, arguments);
	},

	toString: function(){
		return "["+this.declaredClass+" ID:"+this.id	+"]"
	},

	_domElement2TreeNode: function(/*DomNode*/ domElement){
		var ret;
		do{
			ret=dijit.util.manager.byNode(domElement);
		}while(!ret && (domElement=domElement.parentNode));
		return ret;
	},

	_onClick: function(/*Event*/ e){
		// summary: translates click events into commands for the controller to process
		var domElement = e.target;

		// find node
        var nodeWidget = this._domElement2TreeNode(domElement);	
		if(!nodeWidget || !nodeWidget.isTreeNode){
			return;
		}

		this._publish(
			(domElement == nodeWidget.expandoNode ||
			 domElement == nodeWidget.expandoNodeText) ? "toggleOpen" : "execute",
			 { node: nodeWidget} );	

		dojo.stopEvent(e);
	},

	_onKeyPress: function(/*Event*/ e){
		// summary: translates key events into commands for the controller to process
		if(!e.keyCode || e.altKey){ return; }
		var nodeWidget = this._domElement2TreeNode(e.target);
		if(!nodeWidget){ return; }

		if(this._keyTopicMap[e.keyCode]){
			this._publish(this._keyTopicMap[e.keyCode], { node: nodeWidget} );	
			dojo.stopEvent(e);
		}
	},

	blurNode: function(){
		// summary
		//	Removes focus from the currently focused node (which must be visible).
		//	Usually not called directly (just call focusNode() on another node instead)
		var node = this.lastFocused;
		if(!node){ return; }
		var labelNode = node.labelNode;
		dojo.removeClass(labelNode, "TreeLabelFocused");
		labelNode.setAttribute("tabIndex", "-1");
		this.lastFocused = null;
	},

	focusNode: function(/* _tree.Node */ node){
		// summary
		//	Focus on the specified node (which must be visible)

		this.blurNode();

		// set tabIndex so that the tab key can find this node
		var labelNode = node.labelNode;
		labelNode.setAttribute("tabIndex", "0");

		this.lastFocused = node;
		dojo.addClass(labelNode, "TreeLabelFocused");

		// set focus so that the label wil be voiced using screen readers
		labelNode.focus();
	}
});

dojo.declare(
	"dijit._TreeNode",
	dijit._TreeBase,
{
	// summary
	//		Single node within a tree

	templateString:"<div class=\"TreeNode TreeExpandLeaf TreeChildrenNo\" waiRole=\"presentation\"\n\tdojoAttachEvent=\"onfocus:_onFocus\";\n\t><span dojoAttachPoint=\"expandoNode\" class=\"TreeExpando\" waiRole=\"presentation\"\n\t></span\n\t><span dojoAttachPoint=\"expandoNodeText\" class=\"dijitExpandoText\" waiRole=\"presentation\"\n\t></span\n\t><div dojoAttachPoint=\"iconNode\" class=\"TreeIcon\" waiRole=\"presentation\"\n\t ><div dojoAttachPoint=\"contentNode\" class=\"TreeContent\" waiRole=\"presentation\"\n\t  ><span dojoAttachPoint=labelNode class=\"TreeLabel\" wairole=\"treeitem\" expanded=\"true\" tabindex=\"-1\"\n\t  ></span\n\t ></div\n\t></div\n></div>\n",		

	// type: String
	//		User defined identifier to differentiate nodes, and to control icon used
	//		Example: folder, garbage, inbox, draftsFolder
	//		TODO: set CSS string base on this type
	nodeType: "",

	// item: dojo.data.Item
	//		the dojo.data entry this tree represents
	item: null,	

	isTreeNode: true,

	// label: String
	//		Text of this tree node
	label: "",

	isFolder: null, // set by widget depending on children/args

	isExpanded: false,

	postCreate: function(){
		// set label, escaping special characters
		this.labelNode.innerHTML="";
		this.labelNode.appendChild(document.createTextNode(this.label));
		
		// set expand icon for leaf 	
		this._setExpando();
	},

	markProcessing: function(){
		// summary: visually denote that tree is loading data, etc.
		this.state = "LOADING";
		this._setExpando(true);	
	},

	unmarkProcessing: function(){
		// summary: clear markup from markProcessing() call
		this._setExpando(false);	
	},
	
	_onFocus: function(/*Event*/ e){
		// summary: don't bubble focus out of tree

		dojo.stopEvent(e);
	},

	_updateLayout: function(){
		// summary: set appropriate CSS classes for this.domNode

		dojo.removeClass(this.domNode, "TreeIsRoot");
		if(this.getParent()["isTree"]){
			dojo.addClass(this.domNode, 'TreeIsRoot');
		}

		dojo.removeClass(this.domNode, "TreeIsLast");
		if(!this.getNextSibling()){
			dojo.addClass(this.domNode, 'TreeIsLast');	
		}
	},

	_setExpando: function(/*Boolean*/ processing) {
		// summary: set the right image for the expando node

		// apply the appropriate class to the expando node
		var styles = ["TreeExpandoLoading", "TreeExpandoOpened",
			"TreeExpandoClosed", "TreeExpandoLeaf"];
		var idx = processing ? 0 : (this.isFolder ?	(this.isExpanded ? 1 : 2) : 3);
		dojo.forEach(styles,
			function(s){
				dojo.removeClass(this.expandoNode, s);
			}, this
		);
		dojo.addClass(this.expandoNode, styles[idx]);

		// provide a non-image based indicator for images-off mode
		this.expandoNodeText.innerHTML =
			processing ? "*" :
				(this.isFolder ?
					(this.isExpanded ? "&#9660;" : "&#9658;") : "-");
	},	

	setChildren: function(items){
		dijit.Tree.superclass.setChildren.apply(this, arguments);

		// create animations for showing/hiding the children
		this._slideIn = dojo.fx.slideIn({node: this.containerNode, duration: 250});
		dojo.connect(this.slideIn, "onEnd", dojo.hitch(this, "_afterExpand"));
		this._slideOut = dojo.fx.slideOut({node: this.containerNode, duration: 250});
		dojo.connect(this.slideOut, "onEnd", dojo.hitch(this, "_afterCollapse"));
	},

	expand: function(){
        // summary: show my children
		if(this.isExpanded){ return; }

		// cancel in progress collapse operation
		if(this._slideOut.status() == "playing"){
			this._slideOut.stop();
		}

		this.isExpanded = true;
		dijit.util.wai.setAttr(this.labelNode, "waiState", "expanded", "true");
		dijit.util.wai.setAttr(this.containerNode, "waiRole", "role", "group");

		this._setExpando();

		// TODO: use animation that's constant speed of movement, not constant time regardless of height
		this._slideIn.play();
	},

	_afterExpand: function(){
        this.onShow();
 		this._publish("afterExpand", {node: this});		
	},

	collapse: function(){					
		if(!this.isExpanded){ return; }

		// cancel in progress expand operation
		if(this._slideIn.status() == "playing"){
			this._slideIn.stop();
		}

		this.isExpanded = false;
		dijit.util.wai.setAttr(this.labelNode, "waiState", "expanded", "false");
		this._setExpando();

		this._slideOut.play();
	},

	_afterCollapse: function(){
		this.onHide();
		this._publish("afterCollapse", {node: this});
	},

	toString: function(){
		return '['+this.declaredClass+', '+this.label+']';
	}
});

}

if(!dojo._hasResource["dijit.form.Checkbox"]){
dojo._hasResource["dijit.form.Checkbox"] = true;
dojo.provide("dijit.form.Checkbox");





dojo.declare(
	"dijit.form.Checkbox",
	dijit.form.ToggleButton,
	{
		// summary:
		// 		Same as an HTML checkbox, but with fancy styling.
		//
		// description:
		// User interacts with real html inputs.
		// On onclick (which occurs by mouse click, space-bar, or
		// using the arrow keys to switch the selected radio button),
		// we update the state of the checkbox/radio.
		//
		// There are two modes:
		//   1. High contrast mode
		//   2. Normal mode
		// In case 1, the regular html inputs are shown and used by the user.
		// In case 2, the regular html inputs are invisible but still used by
		// the user. They are turned quasi-invisible and overlay the background-image.

		templateString:"<span class=\"${baseClass}\" baseClass=\"${baseClass}\"\n\t><input\n\t \tid=\"${id}\" tabIndex=\"${tabIndex}\" type=\"${_type}\" name=\"${name}\" value=\"${value}\"\n\t\tclass=\"dijitCheckboxInput\"\n\t\tdojoAttachPoint=\"inputNode;focusNode\"\n\t \tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;onclick:onClick\"\n></span>\n",

		baseClass: "dijitCheckbox",

		//	Value of "type" attribute for <input>
		_type: "checkbox",

		// checked: Boolean
		// Corresponds to the native HTML <input> element's attribute.
		// If true, checkbox is initially marked turned on;
		// in markup, specified as "checked='checked'" or just "checked"
		checked: false,

		// value: Value
		//	equivalent to value field on normal checkbox (if checked, the value is passed as
		//	the value when form is submitted)
		value: "on",

		postCreate: function(){
			dojo.setSelectable(this.inputNode, false);
			this.setSelected(this.checked);
			dijit.form.ToggleButton.prototype.postCreate.apply(this, arguments);
		},

		setSelected: function(/*Boolean*/ selected){
			this.inputNode.checked = this.checked = selected;
			dijit.form.ToggleButton.prototype.setSelected.apply(this, arguments);
		},

		setValue: function(/*String*/ value){
			if(value == null){ value = ""; }
			this.inputNode.value = value;
			dijit.form.Checkbox.superclass.setValue.call(this,value);
		}
	}
);

dojo.declare(
	"dijit.form.RadioButton",
	dijit.form.Checkbox,
	{
		// summary:
		// 		Same as an HTML radio, but with fancy styling.
		//
		// description:
		// Implementation details
		//
		// Specialization:
		// We keep track of dijit radio groups so that we can update the state
		// of all the siblings (the "context") in a group based on input
		// events. We don't rely on browser radio grouping.

		_type: "radio",
		baseClass: "dijitRadio",

		// This shared object keeps track of all widgets, grouped by name
		_groups: {},

		postCreate: function(){
			// add this widget to _groups
			(this._groups[this.name] = this._groups[this.name] || []).push(this);

			dijit.form.Checkbox.prototype.postCreate.apply(this, arguments);
		},

		uninitialize: function(){
			// remove this widget from _groups
			dojo.forEach(this._groups[this.name], function(widget, i, arr){
				if(widget === this){
					arr.splice(i, 1);
					return;
				}
			}, this);
		},

		setSelected: function(/*Boolean*/ selected){
			// If I am being selected then have to deselect currently selected radio button
			if(selected){
				dojo.forEach(this._groups[this.name], function(widget){
					if(widget != this && widget.selected){
						widget.setSelected(false);
					}
				}, this);
			}
			dijit.form.Checkbox.prototype.setSelected.apply(this, arguments);			
		},

		onClick: function(/*Event*/ e){
			if(!this.selected){
				this.setSelected(true);
			}
		}
	}
);

}

if(!dojo._hasResource["dojo.data.util.filter"]){
dojo._hasResource["dojo.data.util.filter"] = true;
dojo.provide("dojo.data.util.filter");

dojo.data.util.filter.patternToRegExp = function(/*String*/pattern, /*boolean?*/ ignoreCase){
	//	summary:  
	//		Helper function to convert a simple pattern to a regular expression for matching.
	//	description:
	//		Returns a regular expression object that conforms to the defined conversion rules.
	//		For example:  
	//			ca*   -> /^ca.*$/
	//			*ca*  -> /^.*ca.*$/
	//			*c\*a*  -> /^.*c\*a.*$/
	//			*c\*a?*  -> /^.*c\*a..*$/
	//			and so on.
	//
	//	pattern: string
	//		A simple matching pattern to convert that follows basic rules:
	//			* Means match anything, so ca* means match anything starting with ca
	//			? Means match single character.  So, b?b will match to bob and bab, and so on.
	//      	\ is an escape character.  So for example, \* means do not treat * as a match, but literal character *.
	//				To use a \ as a character in the string, it must be escaped.  So in the pattern it should be 
	//				represented by \\ to be treated as an ordinary \ character instead of an escape.
	//
	//	ignoreCase:
	//		An optional flag to indicate if the pattern matching should be treated as case-sensitive or not when comparing
	//		By default, it is assumed case sensitive.

	var rxp = "^";
	var c = null;
	for(var i = 0; i < pattern.length; i++){
		c = pattern.charAt(i);
		switch (c) {
			case '\\':
				rxp += c;
				i++;
				rxp += pattern.charAt(i);
				break;
			case '*':
				rxp += ".*"; break;
			case '?':
				rxp += "."; break;
			case '$':
			case '^':
			case '/':
			case '+':
			case '.':
			case '|':
			case '(':
			case ')':
			case '{':
			case '}':
			case '[':
			case ']':
				rxp += "\\"; //fallthrough
			default:
				rxp += c;
		}
	}
	rxp += "$";
	if(ignoreCase){
		return new RegExp(rxp,"i"); //RegExp
	}else{
		return new RegExp(rxp); //RegExp
	}
	
};

}

if(!dojo._hasResource["dojo.data.util.sorter"]){
dojo._hasResource["dojo.data.util.sorter"] = true;
dojo.provide("dojo.data.util.sorter");

dojo.data.util.sorter.basicComparator = function(	/*anything*/ a, 
													/*anything*/ b){
	//	summary:  
	//		Basic comparision function that compares if an item is greater or less than another item
	//	description:  
	//		returns 1 if a > b, -1 if a < b, 0 if equal.
	//		undefined values are treated as larger values so that they're pushed to the end of the list.

	var ret = 0;
	if(a > b || typeof a === "undefined"){
		ret = 1;
	}else if(a < b || typeof b === "undefined"){
		ret = -1;
	}
	return ret; //int, {-1,0,1}
};

dojo.data.util.sorter.createSortFunction = function(	/* attributes array */sortSpec,
														/*dojo.data.core.Read*/ store){
	//	summary:  
	//		Helper function to generate the sorting function based off the list of sort attributes.
	//	description:  
	//		The sort function creation will look for a property on the store called 'comparatorMap'.  If it exists
	//		it will look in the mapping for comparisons function for the attributes.  If one is found, it will
	//		use it instead of the basic comparator, which is typically used for strings, ints, booleans, and dates.
	//		Returns the sorting function for this particular list of attributes and sorting directions.
	//
	//	sortSpec: array
	//		A JS object that array that defines out what attribute names to sort on and whether it should be descenting or asending.
	//		The objects should be formatted as follows:
	//		{
	//			attribute: "attributeName-string" || attribute,
	//			descending: true|false;   // Default is false.
	//		}
	//	store: object
	//		The datastore object to look up item values from.
	//
	var sortFunctions=[];   

	function createSortFunction(attr, dir){
		return function(itemA, itemB){
			var a = store.getValue(itemA, attr);
			var b = store.getValue(itemB, attr);
			//See if we have a override for an attribute comparison.
			var comparator = null;
			if(store.comparatorMap){
				if(typeof attr !== "string"){
					 attr = store.getIdentity(attr);
				}
				comparator = store.comparatorMap[attr]||dojo.data.util.sorter.basicComparator;
			}
			comparator = comparator||dojo.data.util.sorter.basicComparator; 
			return dir * comparator(a,b); //int
		};
	}

	for(var i = 0; i < sortSpec.length; i++){
		sortAttribute = sortSpec[i];
		if(sortAttribute.attribute){
			var direction = (sortAttribute.descending) ? -1 : 1;
			sortFunctions.push(createSortFunction(sortAttribute.attribute, direction));
		}
	}

	return function(rowA, rowB){
		var i=0;
		while(i < sortFunctions.length){
			var ret = sortFunctions[i++](rowA, rowB);
			if(ret !== 0){
				return ret;//int
			}
		}
		return 0; //int  
	};  //  Function
};

}

if(!dojo._hasResource["dojo.data.util.simpleFetch"]){
dojo._hasResource["dojo.data.util.simpleFetch"] = true;
dojo.provide("dojo.data.util.simpleFetch");


dojo.data.util.simpleFetch.fetch = function(/* Object? */ request){
	//	summary:
	//		The simpleFetch mixin is designed to serve as a set of function(s) that can
	//		be mixed into other datastore implementations to accelerate their development.  
	//		The simpleFetch mixin should work well for any datastore that can respond to a _fetchItems() 
	//		call by returning an array of all the found items that matched the query.  The simpleFetch mixin
	//		is not designed to work for datastores that respond to a fetch() call by incrementally
	//		loading items, or sequentially loading partial batches of the result
	//		set.  For datastores that mixin simpleFetch, simpleFetch 
	//		implements a fetch method that automatically handles eight of the fetch()
	//		arguments -- onBegin, onItem, onComplete, onError, start, count, sort and scope
	//		The class mixing in simpleFetch should not implement fetch(),
	//		but should instead implement a _fetchItems() method.  The _fetchItems() 
	//		method takes three arguments, the keywordArgs object that was passed 
	//		to fetch(), a callback function to be called when the result array is
	//		available, and an error callback to be called if something goes wrong.
	//		The _fetchItems() method should ignore any keywordArgs parameters for
	//		start, count, onBegin, onItem, onComplete, onError, sort, and scope.  
	//		The _fetchItems() method needs to correctly handle any other keywordArgs
	//		parameters, including the query parameter and any optional parameters 
	//		(such as includeChildren).  The _fetchItems() method should create an array of 
	//		result items and pass it to the fetchHandler along with the original request object 
	//		-- or, the _fetchItems() method may, if it wants to, create an new request object 
	//		with other specifics about the request that are specific to the datastore and pass 
	//		that as the request object to the handler.
	//
	//		For more information on this specific function, see dojo.data.api.Read.fetch()
	request = request || {};
	if(!request.store){
		request.store = this;
	}
	var self = this;

	var _errorHandler = function(errorData, requestObject){
		if(requestObject.onError){
			var scope = requestObject.scope || dojo.global;
			requestObject.onError.call(scope, errorData, requestObject);
		}
	};

	var _fetchHandler = function(items, requestObject){
		var oldAbortFunction = requestObject.abort || null;
		var aborted = false;

		var startIndex = requestObject.start?requestObject.start:0;
		var endIndex   = requestObject.count?(startIndex + requestObject.count):items.length;

		requestObject.abort = function(){
			aborted = true;
			if(oldAbortFunction){
				oldAbortFunction.call(requestObject);
			}
		};

		var scope = requestObject.scope || dojo.global;
		if(!requestObject.store){
			requestObject.store = self;
		}
		if(requestObject.onBegin){
			requestObject.onBegin.call(scope, items.length, requestObject);
		}
		if(requestObject.sort){
			items.sort(dojo.data.util.sorter.createSortFunction(requestObject.sort, self));
		}
		if(requestObject.onItem){
			for(var i = startIndex; (i < items.length) && (i < endIndex); ++i){
				var item = items[i];
				if(!aborted){
					requestObject.onItem.call(scope, item, requestObject);
				}
			}
		}
		if(requestObject.onComplete && !aborted){
			var subset = null;
			if (!requestObject.onItem) {
				subset = items.slice(startIndex, endIndex);
			}
			requestObject.onComplete.call(scope, subset, requestObject);   
		}
	};
	this._fetchItems(request, _fetchHandler, _errorHandler);
	return request;	// Object
};

}

if(!dojo._hasResource["dojo.data.JsonItemStore"]){
dojo._hasResource["dojo.data.JsonItemStore"] = true;
dojo.provide("dojo.data.JsonItemStore");




dojo.declare("dojo.data.JsonItemStore",
	null,
	function(/* Object */ keywordParameters){
		// summary: initializer
		// keywordParameters: {url: String}
		// keywordParameters: {data: jsonObject}
		this._arrayOfAllItems = [];
		this._loadFinished = false;
		this._jsonFileUrl = keywordParameters.url;
		this._jsonData = keywordParameters.data;
		this._features = { 'dojo.data.api.Read': true};
		this._itemsByIdentity = null;
		this._storeRef = "_S";  //Default name for the store reference to attach to every item.
		this._itemId = "_0"; //Default Item Id for isItem to attach to every item.
	},{
	//	summary:
	//		The JsonItemStore implements the dojo.data.api.Read API and reads
	//		data from JSON files that have contents in this format --
	//		{ items: [
	//			{ name:'Kermit', color:'green', age:12, friends:['Gonzo', {reference:{name:'Fozzie Bear'}}]},
	//			{ name:'Fozzie Bear', wears:['hat', 'tie']},
	//			{ name:'Miss Piggy', pets:'Foo-Foo'}
	//		]}
	//		Note that it can also contain an 'identifer' property that specified which attribute on the items 
	//		in the array of items that acts as the unique identifier for that item.
	//

	url: "",	// use "" rather than undefined for the benefit of the parser (#3539)

	_assertIsItem: function(/* item */ item){
		//	summary:
		//      This function tests whether the item passed in is indeed an item in the store.
		//	item: 
		//		The item to test for being contained by the store.
		if(!this.isItem(item)){ 
			throw new Error("dojo.data.JsonItemStore: a function was passed an item argument that was not an item");
		}
	},

	_assertIsAttribute: function(/* attribute-name-string */ attribute){
		//	summary:
		//		This function tests whether the item passed in is indeed a valid 'attribute' like type for the store.
		//	attribute: 
		//		The attribute to test for being contained by the store.
		if(typeof attribute !== "string"){ 
			throw new Error("dojo.data.JsonItemStore: a function was passed an attribute argument that was not an attribute name string");
		}
	},

	getValue: function(	/* item */ item, 
						/* attribute-name-string */ attribute, 
						/* value? */ defaultValue){
		//	summary: 
		//      See dojo.data.api.Read.getValue()
		var values = this.getValues(item, attribute);
		return (values.length > 0)?values[0]:defaultValue; //Object || int || Boolean
	},

	getValues: function(/* item */ item, 
						/* attribute-name-string */ attribute){
		//	summary: 
		//		See dojo.data.api.Read.getValues()

		this._assertIsItem(item);
		this._assertIsAttribute(attribute);
		return item[attribute] || []; //Array
	},

	getAttributes: function(/* item */ item){
		//	summary: 
		//		See dojo.data.api.Read.getAttributes()
		this._assertIsItem(item);
		var attributes = [];
		for(var key in item){
			//Save off only the real item attributes, not the special id marks for O(1) isItem.
			if((key !== this._storeRef) && (key !== this._itemId)){
				attributes.push(key);
			}
		}
		return attributes; //Array
	},

	hasAttribute: function(	/* item */ item,
							/* attribute-name-string */ attribute) {
		//	summary: 
		//		See dojo.data.api.Read.hasAttribute()
		return this.getValues(item, attribute).length > 0;
	},

	containsValue: function(/* item */ item, 
							/* attribute-name-string */ attribute, 
							/* anything */ value){
		//	summary: 
		//		See dojo.data.api.Read.containsValue()
		var regexp = undefined;
		if(typeof value === "string"){
			regexp = dojo.data.util.filter.patternToRegExp(value, false);
		}
		return this._containsValue(item, attribute, value, regexp); //boolean.
	},

	_containsValue: function(	/* item */ item, 
								/* attribute || attribute-name-string */ attribute, 
								/* anything */ value,
								/* RegExp?*/ regexp){
		//	summary: 
		//		Internal function for looking at the values contained by the item.
		//	description: 
		//		Internal function for looking at the values contained by the item.  This 
		//		function allows for denoting if the comparison should be case sensitive for
		//		strings or not (for handling filtering cases where string case should not matter)
		//	
		//	item:
		//		The data item to examine for attribute values.
		//	attribute:
		//		The attribute to inspect.
		//	value:	
		//		The value to match.
		//	regexp:
		//		Optional regular expression generated off value if value was of string type to handle wildcarding.
		//		If present and attribute values are string, then it can be used for comparison instead of 'value'
		var values = this.getValues(item, attribute);
		for(var i = 0; i < values.length; ++i){
			var possibleValue = values[i];
			if(typeof possibleValue === "string" && regexp){
				return (possibleValue.match(regexp) !== null);
			}else{
				//Non-string matching.
				if(value === possibleValue){
					return true; // Boolean
				}
			}
		}
		return false; // Boolean
	},

	isItem: function(/* anything */ something){
		//	summary: 
		//		See dojo.data.api.Read.isItem()
		if(something && something[this._storeRef] === this){
			if(this._arrayOfAllItems[something[this._itemId]] === something){
				return true;
			}
		}
		return false; // Boolean
	},

	isItemLoaded: function(/* anything */ something){
		//	summary: 
		//		See dojo.data.api.Read.isItemLoaded()
		return this.isItem(something); //boolean
	},

	loadItem: function(/* object */ keywordArgs){
		//	summary: 
		//		See dojo.data.api.Read.loadItem()
		this._assertIsItem(keywordArgs.item);
	},

	getFeatures: function(){
		//	summary: 
		//		See dojo.data.api.Read.getFeatures()
		if (!this._loadFinished){
			// This has to happen to meet the property that the identity functions are
			// denoted to work only if the store has been loaded and it had an identifier 
			// property in the JSON.  So, for the feature to be found, the load had to have 
			// happened.
			this._forceLoad();
		}
		return this._features; //Object
	},

	getLabel: function(/* item */ item){
		//	summary: 
		//		See dojo.data.api.Read.getLabel()
		if(this._labelAttr && this.isItem(item)){
			return this.getValue(item,this._labelAttr); //String
		}
		return undefined; //undefined
	},

	getLabelAttributes: function(/* item */ item){
		//	summary: 
		//		See dojo.data.api.Read.getLabelAttributes()
		if(this._labelAttr){
			return [this._labelAttr]; //array
		}
		return null; //null
	},

	_fetchItems: function(	/* Object */ keywordArgs, 
							/* Function */ findCallback, 
							/* Function */ errorCallback){
		//	summary: 
		//		See dojo.data.util.simpleFetch.fetch()
		var self = this;
		var filter = function(requestArgs, arrayOfAllItems){
			var items = null;
			if(requestArgs.query){
				var ignoreCase = requestArgs.queryOptions ? requestArgs.queryOptions.ignoreCase : false; 
				items = [];

				//See if there are any string values that can be regexp parsed first to avoid multiple regexp gens on the
				//same value for each item examined.  Much more efficient.
				var regexpList = {};
				for(var key in requestArgs.query){
					var value = requestArgs.query[key];
					if(typeof value === "string"){
						regexpList[key] = dojo.data.util.filter.patternToRegExp(value, ignoreCase);
					}
				}

				for(var i = 0; i < arrayOfAllItems.length; ++i){
					var match = true;
					var candidateItem = arrayOfAllItems[i];
					for(var key in requestArgs.query) {
						var value = requestArgs.query[key];
						if (!self._containsValue(candidateItem, key, value, regexpList[key])){
							match = false;
						}
					}
					if(match){
						items.push(candidateItem);
					}
				}
				findCallback(items, requestArgs);
			}else{
				// We want a copy to pass back in case the parent wishes to sort the array.  We shouldn't allow resort 
				// of the internal list so that multiple callers can get listsand sort without affecting each other.
				if(self._arrayOfAllItems.length> 0){
					items = self._arrayOfAllItems.slice(0,self._arrayOfAllItems.length); 
				}
				findCallback(items, requestArgs);
			}
		};

		if(this._loadFinished){
			filter(keywordArgs, this._arrayOfAllItems);
		}else{
			if(this._jsonFileUrl){
				var getArgs = {
						url: self._jsonFileUrl, 
						handleAs: "json-comment-optional"
					};
				var getHandler = dojo.xhrGet(getArgs);
				getHandler.addCallback(function(data){
					// console.debug(dojo.toJson(data));
					self._loadFinished = true;
					try{
						self._arrayOfAllItems = self._getItemsFromLoadedData(data);
						filter(keywordArgs, self._arrayOfAllItems);
					}catch(e){
						errorCallback(e, keywordArgs);
					}

				});
				getHandler.addErrback(function(error){
					errorCallback(error, keywordArgs);
				});
			}else if(this._jsonData){
				try{
					this._loadFinished = true;
					this._arrayOfAllItems = this._getItemsFromLoadedData(this._jsonData);
					this._jsonData = null;
					filter(keywordArgs, this._arrayOfAllItems);
				}catch(e){
					errorCallback(e, keywordArgs);
				}
			}else{
				errorCallback(new Error("dojo.data.JsonItemStore: No JSON source data was provided as either URL or a nested Javascript object."), keywordArgs);
			}
		}
	},

	close: function(/*dojo.data.api.Request || keywordArgs || null */ request){
		 //	summary: 
		 //		See dojo.data.api.Read.close()
	},

	_getItemsFromLoadedData: function(/* Object */ dataObject){
		//	summary:
		//		Function to parse the loaded data into item format and build the internal items array.
		//	description:
		//		Function to parse the loaded data into item format and build the internal items array.
		//
		//	dataObject:
		//		The JS data object containing the raw data to convery into item format.
		//
		// 	returns: array
		//		Array of items in store item format.

		var arrayOfItems = dataObject.items;
		var i;
		var item;
		var attrNames = {};
		this._labelAttr = dataObject.label;

		// We need to do some transformations to convert the data structure
		// that we read from the file into a format that will be convenient
		// to work with in memory.

		// Step 1: We walk through all the attribute values of all the items, 
		// and replace single values with arrays.  For example, we change this:
		//		{ name:'Miss Piggy', pets:'Foo-Foo'}
		// into this:
		//		{ name:['Miss Piggy'], pets:['Foo-Foo']}
		// Also store off the keys so we can validate our store reference and item 
		// id special properties for the O(1) isItem
		for(i = 0; i < arrayOfItems.length; ++i){
			item = arrayOfItems[i];
			for(var key in item){
				var value = item[key];

				if(value !== null){
					if(!dojo.isArray(value)){
						item[key] = [value];
					}
				}else{
					item[key] = [null];
				}
				attrNames[key]=key;
			}
		}

		//Build unique keys for id and store ref.
		//This should go really fast, it will generally
		// never even run the loop..
		while(attrNames[this._storeRef]){
			this._storeRef += "_";
		}
		while(attrNames[this._itemId]){
			this._itemId += "_";
		}

		// Step 2: Some data files specify an optional 'identifier', which is 
		// the name of an attribute that holds the identity of each item.  If 
		// this data file specified an identifier attribute, then build an 
		// hash table of items keyed by the identity of the items.
		var identifier = dataObject.identifier;
		var arrayOfValues = null;
		if(identifier){
			this._features['dojo.data.api.Identity'] = identifier;
			this._itemsByIdentity = {};
			for(var i = 0; i < arrayOfItems.length; ++i){
				item = arrayOfItems[i];
				arrayOfValues = item[identifier];
				identity = arrayOfValues[0];
				if(!this._itemsByIdentity[identity]){
					this._itemsByIdentity[identity] = item;
				}else{
					if(this._jsonFileUrl){
						throw new Error("dojo.data.JsonItemStore:  The json data as specified by: [" + this._jsonFileUrl + "] is malformed.  Items within the list have identifier: [" + identifier + "].  Value collided: [" + identity + "]");
					}else if(this._jsonData){
						throw new Error("dojo.data.JsonItemStore:  The json data provided by the creation arguments is malformed.  Items within the list have identifier: [" + identifier + "].  Value collided: [" + identity + "]");
					}
				}

			}
		}

		// Step 3: We walk through all the attribute values of all the items,
		// and replace references with pointers to items.  For example, we change:
		//		{ name:['Kermit'], friends:[{reference:{name:'Miss Piggy'}}] }
		// into this:
		//		{ name:['Kermit'], friends:[miss_piggy] } 
		// (where miss_piggy is the object representing the 'Miss Piggy' item).
		// Also generate the associate map for all items for the O(1) isItem function.
		for(i = 0; i < arrayOfItems.length; ++i){
			item = arrayOfItems[i]; // example: { name:['Kermit'], friends:[{reference:{name:'Miss Piggy'}}] }
			item[this._storeRef] = this;
			item[this._itemId] = i;
			for(key in item){
				arrayOfValues = item[key]; // example: [{reference:{name:'Miss Piggy'}}]
				for(var j = 0; j < arrayOfValues.length; ++j) {
					value = arrayOfValues[j]; // example: {reference:{name:'Miss Piggy'}}
					if(value !== null && typeof value == "object" && value.reference){
						var referenceDescription = value.reference; // example: {name:'Miss Piggy'}
						if(dojo.isString(referenceDescription)){
							// example: 'Miss Piggy'
							// from an item like: { name:['Kermit'], friends:[{reference:'Miss Piggy'}]}
							arrayOfValues[j] = this._itemsByIdentity[referenceDescription];
						}else{
							// example: {name:'Miss Piggy'}
							// from an item like: { name:['Kermit'], friends:[{reference:{name:'Miss Piggy'}}] }
							for(var k = 0; k < arrayOfItems.length; ++k){
								var candidateItem = arrayOfItems[k];
								var found = true;
								for(var refKey in referenceDescription){
									if(candidateItem[refKey] != referenceDescription[refKey]){ 
										found = false; 
									}
								}
								if(found){ 
									arrayOfValues[j] = candidateItem; 
								}
							}
						}
					}
				}
			}
		}
		return arrayOfItems; //Array
	},

	getIdentity: function(/* item */ item){
		//	summary: 
		//		See dojo.data.api.Identity.getIdentity()
		var identifier = this._features['dojo.data.api.Identity'];
		var arrayOfValues = item[identifier];
		if(arrayOfValues){
			return arrayOfValues[0]; //Object || String
		}
		return null; //null
	},

	fetchItemByIdentity: function(/* Object */ keywordArgs){
		//	summary: 
		//		See dojo.data.api.Identity.fetchItemByIdentity()

		//Hasn't loaded yet, we have to trigger the load.
		if(!this._loadFinished){
			var self = this;
			if(this._jsonFileUrl){
				var getArgs = {
						url: self._jsonFileUrl, 
						handleAs: "json-comment-optional"
					};
				var getHandler = dojo.xhrGet(getArgs);
				getHandler.addCallback(function(data){
					var scope =  keywordArgs.scope?keywordArgs.scope:dojo.global;
					try{
						self._arrayOfAllItems = self._getItemsFromLoadedData(data);
						self._loadFinished = true;
						var item = self._getItemByIdentity(keywordArgs.identity);
						if(keywordArgs.onItem){
							keywordArgs.onItem.call(scope, item);
						}
					}catch(error){
						if(keywordArgs.onError){
							keywordArgs.onError.call(scope, error);
						}
					}
				});
				getHandler.addErrback(function(error){
					if(keywordArgs.onError){
						var scope =  keywordArgs.scope?keywordArgs.scope:dojo.global;
						keywordArgs.onError.call(scope, error);
					}
				});
			}else if(this._jsonData){
				//Passe din data, no need to xhr.
				self._arrayOfAllItems = self._getItemsFromLoadedData(self._jsonData);
				self._jsonData = null;
				self._loadFinished = true;
				var item = self._getItemByIdentity(keywordArgs.identity);
				if(keywordArgs.onItem){
					var scope =  keywordArgs.scope?keywordArgs.scope:dojo.global;
					keywordArgs.onItem.call(scope, item);
				}
			} 
		}else{
			//Already loaded.  We can just look it up and call back.
			var item = this._getItemByIdentity(keywordArgs.identity);
			if(keywordArgs.onItem){
				var scope =  keywordArgs.scope?keywordArgs.scope:dojo.global;
				keywordArgs.onItem.call(scope, item);
			}
		}
	},

	_getItemByIdentity: function(/* Object */ identity){
		//	summary:
		//		Internal function to look an item up by its identity map.
		var item = null;
		if(this._itemsByIdentity){
			item = this._itemsByIdentity[identity];
			if(item === undefined){
				item = null;
			}
		}
		return item; // Object
	},

	getIdentityAttributes: function(/* item */ item){
		//	summary: 
		//		See dojo.data.api.Identity.getIdentifierAttributes()
		 
		var identifier = this._features['dojo.data.api.Identity'];
		if(identifier){
			return [identifier]; //array
		}
		return null; //null
	},

	_forceLoad: function(){
		//	summary: 
		//		Internal function to force a load of the store if it hasn't occurred yet.  This is required
		//		for specific functions to work properly.  See dojo.data.api.Identity.getItemByIdentity()
		var self = this;
		if(this._jsonFileUrl){
			var getArgs = {
					url: self._jsonFileUrl, 
					handleAs: "json-comment-optional",
					sync: true
				};
			var getHandler = dojo.xhrGet(getArgs);
			getHandler.addCallback(function(data){
				try{
					self._arrayOfAllItems = self._getItemsFromLoadedData(data);
					self._loadFinished = true;
				}catch(e){
					console.log(e);
					throw e;
				}
			});
			getHandler.addErrback(function(error){
				throw error;
			});
		}else if(this._jsonData){
			self._arrayOfAllItems = self._getItemsFromLoadedData(self._jsonData);
			self._jsonData = null;
			self._loadFinished = true;
		} 
	}
});
//Mix in the simple fetch implementation to this class.
dojo.extend(dojo.data.JsonItemStore,dojo.data.util.simpleFetch);

}

if(!dojo._hasResource["dijit.form._DropDownTextBox"]){
dojo._hasResource["dijit.form._DropDownTextBox"] = true;
dojo.provide("dijit.form._DropDownTextBox");




dojo.declare(
	"dijit.form._DropDownTextBox",
	null,
	{
		// summary:
		//		Mixin text box with drop down

		templateString:"<fieldset class='dijit dijitInline dijitLeft ${baseClass}'  baseClass='${baseClass}'\n\tid=\"widget_${id}\" name=\"${name}\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;\"\twaiRole=\"presentation\"\n>\n<table cellspacing=0 cellpadding=0 waiRole=\"presentation\">\n\t<tr>\n\t\t<td class='dijitReset dijitStretch dijitComboBoxInput'\n\t\t\t><input class='XdijitInputField' type=\"text\" autocomplete=\"off\" name=\"${name}\"\n\t\t\tdojoAttachEvent=\"onkeypress; onkeyup; onfocus; onblur; compositionend;\"\n\t\t\tdojoAttachPoint=\"textbox;focusNode\" id='${id}'\n\t\t\ttabIndex='${tabIndex}' size='${size}' maxlength='${maxlength}'\n\t\t\twaiRole=\"combobox\"\n\t></td><td class='dijitReset dijitRight dijitButtonNode dijitDownArrowButton'\n\t\t\tdojoAttachPoint=\"downArrowNode\"\n\t\t\tdojoAttachEvent=\"onklick:_onArrowClick;onmousedown:_onMouse;onmouseup:_onMouse;onmouseover:_onMouse;onmouseout:_onMouse;\"\n\t\t><div waiRole=\"presentation\">&#9660;</div>\n\t</td></tr>\n</table>\n</fieldset>\n",
		
		baseClass:"dijitComboBox",

		// hasDownArrow: Boolean
		// Set this textbox to have a down arrow button
		// Defaults to true
		hasDownArrow:true,

		// _popupWidget: Widget
		//	link to the popup widget created by makePopop
		_popupWidget:null,

		// _hasMasterPopup: Boolean
		//	Flag that determines if this widget should share one popup per widget prototype,
		//	or create one popup per widget instance.
		//	If true, then makePopup() creates one popup per widget prototype.
		//	If false, then makePopup() creates one popup per widget instance.
		_hasMasterPopup:false,

		// _popupClass: String
		//	Class of master popup (dijit.form._ComboBoxMenu)
		_popupClass:"",

		// _popupArgs: Object
		//	Object to pass to popup widget on initialization
		_popupArgs:{},
		
		// _hasFocus: Boolean
		// Represents focus state of the textbox
		_hasFocus:false,

		_arrowPressed: function(){
			if(!this.disabled&&this.hasDownArrow){
				dojo.addClass(this.downArrowNode, "dijitArrowButtonActive");
			}
		},

		_arrowIdle: function(){
			if(!this.disabled&&this.hasDownArrow){
				dojo.removeClass(this.downArrowNode, "dojoArrowButtonPushed");
			}
		},

		makePopup: function(){
			// summary:
			//	create popup widget on demand
			var _this=this;
			function _createNewPopup(){
				// common code from makePopup
				var node=document.createElement("div");
				document.body.appendChild(node);
				var popupProto=dojo.getObject(_this._popupClass, false);
				return new popupProto(_this._popupArgs, node);
			}
			// this code only runs if there is no popup reference
			if(!this._popupWidget){
				// does this widget have one "master" popup?
				if(this._hasMasterPopup){
					// does the master popup not exist yet?
					var parentClass = dojo.getObject(this.declaredClass, false);
					if(!parentClass.prototype._popupWidget){
						// create the master popup for the first time
						parentClass.prototype._popupWidget=_createNewPopup();
					}
					// assign master popup to local link
					this._popupWidget=parentClass.prototype._popupWidget;
				}else{
					// if master popup is not being used, create one popup per widget instance
					this._popupWidget=_createNewPopup();
				}
			}
		},

		_onArrowClick: function(){
			// summary: callback when arrow is clicked
			if(this.disabled){
				return;
			}
			this.focus();
			this.makePopup();
			if(this._isShowingNow){
				this._hideResultList();
			}else{
				// forces full population of results, if they click
				// on the arrow it means they want to see more options
				this._openResultList();
			}
		},

		_hideResultList: function(){
			if(this._isShowingNow){
				dijit.util.popup.close();
				this._arrowIdle();
			}
		},

		_openResultList:function(){
			// summary:
			//	any code that needs to happen before the popup appears.
			//	creating the popupWidget contents etc.
			this._showResultList();
		},

		onfocus:function(){
			this._hasFocus=true;
		},

		onblur:function(){
			this._arrowIdle();
			this._hasFocus=false;
			// removeClass dijitInputFieldFocused
			dojo.removeClass(this.nodeWithBorder, "dijitInputFieldFocused");
			// hide the Tooltip
			this.validate(false);
		},

		onkeypress: function(/*Event*/ evt){
			// summary: generic handler for popup keyboard events
			if(evt.ctrlKey || evt.altKey){
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
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					break;

				case dojo.keys.PAGE_UP:
				case dojo.keys.UP_ARROW:
				case dojo.keys.ENTER:
					// prevent default actions
					dojo.stopEvent(evt);
					// fall through
				case dojo.keys.ESCAPE:
				case dojo.keys.TAB:
					if(this._isShowingNow){
						this._prev_key_backspace = false;
						this._prev_key_esc = (evt.keyCode==dojo.keys.ESCAPE);
						this._hideResultList();
					}
					break;
			}
		},

		compositionend: function(/*Event*/ evt){
			// summary: When inputting characters using an input method, such as Asian
			// languages, it will generate this event instead of onKeyDown event
			this.onkeypress({charCode:-1});
		},

		_showResultList: function(){
			// Our dear friend IE doesnt take max-height so we need to calculate that on our own every time
			this._hideResultList();
			var childs = this._popupWidget.getListLength ? this._popupWidget.getItems() : [this._popupWidget.domNode];

			if(childs.length){
				var visibleCount = Math.min(childs.length,this.maxListLength);
				with(this._popupWidget.domNode.style){
					// trick to get the dimensions of the popup
					// TODO: doesn't dijit.util.popup.open() do this automatically?
					display="";
					width="";
					height="";
				}
				this._arrowPressed();
				// hide the tooltip
				this._displayMessage("");
				var best=this.open();
				// #3212: only set auto scroll bars if necessary
				// prevents issues with scroll bars appearing when they shouldn't when node is made wider (fractional pixels cause this)
				var popupbox=dojo.marginBox(this._popupWidget.domNode);
				this._popupWidget.domNode.style.overflow=((best.h==popupbox.h)&&(best.w==popupbox.w))?"hidden":"auto";
				dojo.marginBox(this._popupWidget.domNode, {h:best.h,w:Math.max(best.w,this.domNode.offsetWidth)});

			}
		},

		getDisplayedValue:function(){
			return this.textbox.value;
		},

		setDisplayedValue:function(/*String*/ value){
			this.textbox.value=value;
		},

		uninitialize:function(){
			if(this._popupWidget){
				this._hideResultList();
				this._popupWidget.destroy()
			};
		},

		open:function(){
			this.makePopup();
			var self=this;
			self._isShowingNow=true;
			return dijit.util.popup.open({
				popup: this._popupWidget,
				around: this.domNode,
				onClose: function(){ self._isShowingNow=false; }
			});
		},

		postMixInProperties:function(){
			this.baseClass=this.hasDownArrow?this.baseClass:this.baseClass+"NoArrow";
		}
	}
);

}

if(!dojo._hasResource["dijit.form.Textbox"]){
dojo._hasResource["dijit.form.Textbox"] = true;
dojo.provide("dijit.form.Textbox");



dojo.declare(
	"dijit.form.Textbox",
	dijit.form._FormWidget,
	{
		// summary:
		//		A generic textbox field.
		//		Serves as a base class to derive more specialized functionality in subclasses.

		//	trim: Boolean
		//		Removes leading and trailing whitespace if true.  Default is false.
		trim: false,

		//	uppercase: Boolean
		//		Converts all characters to uppercase if true.  Default is false.
		uppercase: false,

		//	lowercase: Boolean
		//		Converts all characters to lowercase if true.  Default is false.
		lowercase: false,

		//	propercase: Boolean
		//		Converts the first character of each word to uppercase if true.
		propercase: false,

		// size: String
		//		HTML INPUT tag size declaration.
		size: "20",

		// maxlength: String
		//		HTML INPUT tag maxlength declaration.
		maxlength: "999999",

		templateString:"<input dojoAttachPoint='textbox;focusNode' dojoAttachEvent='onblur;onfocus;onkeyup'\n\tid='${id}' name='${name}' class=\"dijitInputField\" type='${type}' size='${size}' maxlength='${maxlength}' tabIndex='${tabIndex}'>\n",

		getTextValue: function(){
			return this.filter(this.textbox.value);
		},

		getValue: function(){
			return this.parse(this.getTextValue(), this.constraints);
		},

		setValue: function(value, /*String, optional*/ formattedValue){
			if(typeof formattedValue == "undefined" ){
				formattedValue = (typeof value == "undefined" || value == null || value == NaN) ? null : this.filter(this.format(value, this.constraints));
			}
			if(formattedValue != null){
				this.textbox.value = formattedValue;
			}
			dijit.form.Textbox.superclass.setValue.call(this,value);
		},

		forWaiValuenow: function(){
			return this.getTextValue();
		},

		format: function(/* String */ value, /* Object */ constraints){
			// summary: Replacable function to convert a value to a properly formatted string
			return value;
		},

		parse: function(/* String */ value, /* Object */ constraints){
			// summary: Replacable function to convert a formatted string to a value
			return value;
		},

		postCreate: function(){
			dijit.form.Textbox.superclass.postCreate.apply(this);
			// get the node for which the background color will be updated
			if(typeof this.nodeWithBorder != "object"){
				this.nodeWithBorder = this.textbox;
			}
			// assign value programatically in case it has a quote in it
			this.setValue(this.value);
			// setting the value here is needed since value="" in the template causes "undefined"
			// and setting in the DOM (instead of the JS object) helps with form reset actions
			this.textbox.setAttribute("value", this.getTextValue());
		},

		filter: function(val){
			// summary: Apply various filters to textbox value
			if(val == null){ return null; }
			if(this.trim){
				val = val.replace(/(^\s*|\s*$)/g, "");
			}
			if(this.uppercase){
				val = val.toUpperCase();
			}
			if(this.lowercase){
				val = val.toLowerCase();
			}
			if(this.propercase){
				val = val.replace(/[^\s]+/g, function(word){
					return word.substring(0,1).toUpperCase() + word.substring(1);
				});
			}
			return val;
		},

		focus: function(){
			// summary: if the widget wants focus, then focus the textbox
			this.textbox.focus();
		},

		// event handlers, you can over-ride these in your own subclasses
		onfocus: function(){
			dojo.addClass(this.nodeWithBorder, "dijitInputFieldFocused");
		},

		onblur: function(){
			dojo.removeClass(this.nodeWithBorder, "dijitInputFieldFocused");

			this.setValue(this.getValue());
		},

		onkeyup: function(){
			// TODO: it would be nice to massage the value (ie: automatic uppercase, etc) as the user types
			// but this messes up the cursor position if you are typing into the middle of a word, and
			// also trimming doesn't work correctly (it prevents spaces between words too!)
			// this.setValue(this.getValue());
		}
	}
);

}

if(!dojo._hasResource["dijit.form.ValidationTextbox"]){
dojo._hasResource["dijit.form.ValidationTextbox"] = true;
dojo.provide("dijit.form.ValidationTextbox");







dojo.requireLocalization("dijit.form", "validate", null, "zh-cn,ja,it,ROOT,fr,de");

dojo.declare(
	"dijit.form.ValidationTextbox",
	dijit.form.Textbox,
	{
		// summary:
		//		A subclass of Textbox.
		//		Over-ride isValid in subclasses to perform specific kinds of validation.

		// default values for new subclass properties
		// required: Boolean
		//		Can be true or false, default is false.
		required: false,
		// promptMessage: String
		//		Hint string
		promptMessage: "",
		// invalidMessage: String
		// 		The message to display if value is invalid.
		invalidMessage: "",
		// listenOnKeyPress: Boolean
		//		Updates messages on each key press.  Default is true.
		listenOnKeyPress: true,
		// constraints: Object
		//		user-defined object needed to pass parameters to the validator functions
		constraints: {},
		// regExp: String
		//		regular expression string used to validate the input
		//		Do not specify both regExp and regExpGen
		regExp: ".*",
		// regExpGen: Function
		//		user replaceable function used to generate regExp when dependent on constraints
		//		Do not specify both regExp and regExpGen
		regExpGen: function(constraints){ return this.regExp; },

		setValue: function(){
			dijit.form.ValidationTextbox.superclass.setValue.apply(this, arguments);
			this.validate(false);
		},

		validator: function(value,constraints){
			// summary: user replaceable function used to validate the text input against the regular expression.
			return (new RegExp("^(" + this.regExpGen(constraints) + ")$")).test(value);
		},

		isValid: function(/* Boolean*/ isFocused){
			// summary: Need to over-ride with your own validation code in subclasses
			return this.validator(this.textbox.value, this.constraints);
		},

		isEmpty: function(){
			// summary: Checks for whitespace
			return /^\s*$/.test(this.textbox.value); // Boolean
		},

		isMissing: function(/* Boolean*/ isFocused){
			// summary: Checks to see if value is required and is whitespace
			return this.required && this.isEmpty(); // Boolean
		},

		getErrorMessage: function(/* Boolean*/ isFocused){
			// summary: return an error message to show if appropriate
			return this.invalidMessage;
		},

		getPromptMessage: function(/* Boolean*/ isFocused){
			// summary: return a hint to show if appropriate
			return this.promptMessage;
		},

		validate: function(/* Boolean*/ isFocused){
			// summary:
			//		Called by oninit, onblur, and onkeypress.
			// description:
			//		Show missing or invalid messages if appropriate, and highlight textbox field.

			if(!this.isValid(isFocused)){
				this.updateClass("Error");
				var message = this.getErrorMessage(isFocused);
			}else{
				this.updateClass(this.isMissing() ? "Warning" : "Normal");
				var message = "";
			}
			if(this.isEmpty()){
				var prompt = this.getPromptMessage(isFocused);
				if(prompt){ message = prompt; }
			}
			this._displayMessage(isFocused ? message : "");
		},

		// currently displayed message
		_message: "",

		_displayMessage: function(/*String*/ message){
			if(this._message == message){ return; }
			this._message = message;
			this.displayMessage(message);
		},
		
		displayMessage: function(/*String*/ message){
			// summary:
			//		User overridable method to display validation errors/hints.
			//		By default uses a tooltip.
			if(message){
				dijit.MasterTooltip.show(message, this.domNode);
			}else{
				dijit.MasterTooltip.hide();
			}
		},

		updateClass: function(className){
			// summary: used to ensure that only 1 validation class is set at a time
			var _this = this;
			dojo.forEach(["Normal", "Warning", "Error"], function(label){
				dojo.removeClass(_this.nodeWithBorder, "dijitInputFieldValidation"+label); });
			dojo.addClass(this.nodeWithBorder, "dijitInputFieldValidation"+className);
		},

		onblur: function(evt){
			this.validate(false);
			dijit.form.ValidationTextbox.superclass.onblur.apply(this, arguments);
		},

		onfocus: function(evt){
			dijit.form.ValidationTextbox.superclass.onfocus.apply(this, arguments);
			if(this.listenOnKeyPress){
				this.validate(true);
			}else{
				this.updateClass("Warning");
			}
		},

		onkeyup: function(evt){
			this.onfocus(evt);
		},

		postMixInProperties: function(){
			if(this.constraints == dijit.form.ValidationTextbox.prototype.constraints){
				this.constraints = {};
			}
			dijit.form.ValidationTextbox.superclass.postMixInProperties.apply(this, arguments);
			this.constraints.locale=this.lang;
			this.messages = dojo.i18n.getLocalization("dijit.form", "validate", this.lang);
			dojo.forEach(["invalidMessage", "missingMessage"], function(prop){
				if(!this[prop]){ this[prop] = this.messages[prop]; }
			}, this);
			var p = this.regExpGen(this.constraints);
			this.regExp = p;
			// make value a string for all types so that form reset works well
		}
	}
);

dojo.declare(
	"dijit.form.MappedTextbox",
	dijit.form.ValidationTextbox,
	{
		// summary:
		//		A subclass of ValidationTextbox.
		//		Provides a hidden input field and a serialize method to override

		serialize: function(val){
			// summary: user replaceable function used to convert the getValue() result to a String
			return val.toString();
		},

		toString: function(){
			// summary: display the widget as a printable string using the widget's value
			var val = this.getValue();
			return val ? ((typeof val == "string") ? val : this.serialize(val)) : "";
		},

		validate: function(){
			this.valueNode.value = this.toString();
			dijit.form.MappedTextbox.superclass.validate.apply(this, arguments);
		},

		postCreate: function(){
			var textbox = this.textbox;
			var valueNode = (this.valueNode = document.createElement("input"));
			valueNode.setAttribute("type", textbox.type);
			valueNode.setAttribute("value", this.toString());
			dojo.style(valueNode, "display", "none");
			valueNode.name = this.textbox.name;
			this.textbox.removeAttribute("name");

			dojo.place(valueNode, textbox, "after");

			dijit.form.MappedTextbox.superclass.postCreate.apply(this, arguments);
		}
	}
);

dojo.declare(
	"dijit.form.RangeBoundTextbox",
	dijit.form.MappedTextbox,
	{
		// summary:
		//		A subclass of MappedTextbox.
		//		Tests for a value out-of-range
		/*===== contraints object:
		// min: Number
		//		Minimum signed value.  Default is -Infinity
		min: undefined,
		// max: Number
		//		Maximum signed value.  Default is +Infinity
		max: undefined,
		=====*/

		// rangeMessage: String
		//              The message to display if value is out-of-range
		rangeMessage: "",

		compare: function(val1, val2){
			// summary: compare 2 values
			return val1 - val2;
		},

		rangeCheck: function(/* Number */ primitive, /* Object */ constraints){
			// summary: user replaceable function used to validate the range of the numeric input value
			var isMin = (typeof constraints.min != "undefined");
			var isMax = (typeof constraints.max != "undefined");
			if(isMin || isMax){
				return (!isMin || this.compare(primitive,constraints.min) >= 0) &&
					(!isMax || this.compare(primitive,constraints.max) <= 0);
			}else{ return true; }
		},

		isInRange: function(/* Boolean*/ isFocused){
			// summary: Need to over-ride with your own validation code in subclasses
			return this.rangeCheck(this.getValue(), this.constraints);
		},

		isValid: function(/* Boolean*/ isFocused){
			return dijit.form.RangeBoundTextbox.superclass.isValid.call(this, isFocused) &&
				this.isInRange(isFocused);
		},

		getErrorMessage: function(/* Boolean*/ isFocused){
			if(dijit.form.RangeBoundTextbox.superclass.isValid.call(this, false) && !this.isInRange(isFocused)){ return this.rangeMessage; }
			else{ return dijit.form.RangeBoundTextbox.superclass.getErrorMessage.apply(this, arguments); }
		},

		postMixInProperties: function(){
			dijit.form.RangeBoundTextbox.superclass.postMixInProperties.apply(this, arguments);
			if(!this.rangeMessage){
				this.messages = dojo.i18n.getLocalization("dijit.form", "validate", this.lang);
				this.rangeMessage = this.messages.rangeMessage;
			}
		},

		postCreate: function(){
			dijit.form.RangeBoundTextbox.superclass.postCreate.apply(this, arguments);
			if(typeof this.constraints.min != "undefined"){
				dijit.util.wai.setAttr(this.domNode, "waiState", "valuemin", this.constraints.min);
			}
			if(typeof this.constraints.max != "undefined"){
				dijit.util.wai.setAttr(this.domNode, "waiState", "valuemax", this.constraints.max);
			}
		}
	}
);

}

if(!dojo._hasResource["dijit.form.ComboBox"]){
dojo._hasResource["dijit.form.ComboBox"] = true;
dojo.provide("dijit.form.ComboBox");







dojo.declare(
	"dijit.form.ComboBoxMixin",
	dijit.form._DropDownTextBox,
	{
		// summary:
		//		Auto-completing text box, and base class for FilteringSelect widget.
		//
		//		The drop down box's values are populated from an class called
		//		a data provider, which returns a list of values based on the characters
		//		that the user has typed into the input box.
		//
		//		Some of the options to the ComboBox are actually arguments to the data
		//		provider.

		// searchLimit: Integer
		//		Argument to data provider.
		//		Specifies cap on maximum number of search results.
		//		Default is Infinity.
		searchLimit: Infinity,

		// store: Object
		//		Reference to data provider object used by this ComboBox
		store: null,

		// autoComplete: Boolean
		//		If you type in a partial string, and then tab out of the <input> box,
		//		automatically copy the first entry displayed in the drop down list to
		//		the <input> field
		autoComplete: true,

		// searchDelay: Integer
		//		Delay in milliseconds between when user types something and we start
		//		searching based on that value
		searchDelay: 100,

		// searchAttr: String
		//		Searches pattern match against this field
		searchAttr: "name",

		// ignoreCase: Boolean
		//		Does the ComboBox menu ignore case?
		ignoreCase: true,

		_hasMasterPopup:true,

		_popupClass:"dijit.form._ComboBoxMenu",

		getValue:function(){
			// don't get the textbox value but rather the previously set hidden value
			return dijit.form.Textbox.superclass.getValue.apply(this, arguments);
		},

		setDisplayedValue:function(/*String*/ value){
			this.setValue(value);
		},

		_getCaretPos: function(/*DomNode*/ element){
			// khtml 3.5.2 has selection* methods as does webkit nightlies from 2005-06-22
			if(typeof(element.selectionStart)=="number"){
				// FIXME: this is totally borked on Moz < 1.3. Any recourse?
				return element.selectionStart;
			}else if(dojo.isIE){
				// in the case of a mouse click in a popup being handled,
				// then the document.selection is not the textarea, but the popup
				// var r = document.selection.createRange();
				// hack to get IE 6 to play nice. What a POS browser.
				var tr = document.selection.createRange().duplicate();
				var ntr = element.createTextRange();
				tr.move("character",0);
				ntr.move("character",0);
				try{
					// If control doesnt have focus, you get an exception.
					// Seems to happen on reverse-tab, but can also happen on tab (seems to be a race condition - only happens sometimes).
					// There appears to be no workaround for this - googled for quite a while.
					ntr.setEndPoint("EndToEnd", tr);
					return String(ntr.text).replace(/\r/g,"").length;
				}
				catch(e){
					return 0; // If focus has shifted, 0 is fine for caret pos.
				}
			}
		},

		_setCaretPos: function(/*DomNode*/ element, /*Number*/ location){
			location = parseInt(location);
			this._setSelectedRange(element, location, location);
		},

		_setSelectedRange: function(/*DomNode*/ element, /*Number*/ start, /*Number*/ end){
			if(!end){
				end = element.value.length;
			}  // NOTE: Strange - should be able to put caret at start of text?
			// Mozilla
			// parts borrowed from http://www.faqts.com/knowledge_base/view.phtml/aid/13562/fid/130
			if(element.setSelectionRange){
				element.focus();
				element.setSelectionRange(start, end);
			}else if(element.createTextRange){ // IE
				var range = element.createTextRange();
				with(range){
					collapse(true);
					moveEnd('character', end);
					moveStart('character', start);
					select();
				}
			}else{ //otherwise try the event-creation hack (our own invention)
				// do we need these?
				element.value = element.value;
				element.blur();
				element.focus();
				// figure out how far back to go
				var dist = parseInt(element.value.length)-end;
				var tchar = String.fromCharCode(37);
				var tcc = tchar.charCodeAt(0);
				for(var x = 0; x < dist; x++){
					var te = document.createEvent("KeyEvents");
					te.initKeyEvent("keypress", true, true, null, false, false, false, false, tcc, tcc);
					element.dispatchEvent(te);
				}
			}
		},

		onkeypress: function(/*Event*/ evt){
			// summary: handles keyboard events
			if(evt.ctrlKey || evt.altKey){
				return;
			}
			var doSearch = false;
			switch(evt.keyCode){
				case dojo.keys.PAGE_DOWN:
				case dojo.keys.DOWN_ARROW:
					if(!this._isShowingNow||this._prev_key_esc){
						this._arrowPressed();
						// bring up full list
						//this._startSearch("");
						doSearch=true;
					}else{
						evt.keyCode==dojo.keys.PAGE_DOWN ? this._popupWidget.pageDown(): this._popupWidget._highlightNextOption();
						this._announceOption(this._popupWidget.getHighlightedOption());
					}
					dojo.stopEvent(evt);
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					break;

				case dojo.keys.PAGE_UP:
				case dojo.keys.UP_ARROW:
					if(this._isShowingNow){
						evt.keyCode==dojo.keys.PAGE_UP ? this._popupWidget.pageUp() : this._popupWidget._highlightPrevOption();
						this._announceOption(this._popupWidget.getHighlightedOption());
					}
					dojo.stopEvent(evt);
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					break;

				case dojo.keys.ENTER:
					// prevent submitting form if user presses enter
					dojo.stopEvent(evt);
					// fall through

				case dojo.keys.TAB:
					if(this._isShowingNow){
						this._prev_key_backspace = false;
						this._prev_key_esc = false;
						if(this._popupWidget.getHighlightedOption()){
							this._popupWidget.setValue({target:this._popupWidget.getHighlightedOption()});
						}else{
							this.setDisplayedValue(this.getDisplayedValue());
						}
						this._hideResultList();
					}else{
						// also allow arbitrary user input
						this.setDisplayedValue(this.getDisplayedValue());
					}
					break;

				case dojo.keys.SPACE:
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					if(this._isShowingNow && this._highlighted_option){
						dojo.stopEvent(evt);
						this._selectOption();
						this._hideResultList();
					}
					else{doSearch=true;}
					break;

				case dojo.keys.ESCAPE:
					this._prev_key_backspace = false;
					this._prev_key_esc = true;
					this._hideResultList();
					this.setValue(this.getValue());
					break;

				case dojo.keys.DELETE:
				case dojo.keys.BACKSPACE:
					this._prev_key_esc = false;
					this._prev_key_backspace = true;
					doSearch=true;
					break;

				case dojo.keys.RIGHT_ARROW: // fall through

				case dojo.keys.LEFT_ARROW: // fall through
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					break;

				default:// non char keys (F1-F12 etc..)  shouldn't open list
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					if(evt.charCode!=0){
						doSearch=true;
					}
			}
			if(this.searchTimer){
				clearTimeout(this.searchTimer);
			}
			if(doSearch){
				// need to wait a tad before start search so that the event bubbles through DOM and we have value visible
				this.searchTimer = setTimeout(dojo.hitch(this, this._startSearchFromInput), this.searchDelay);
			}
		},

		_autoCompleteText: function(/*String*/ text){
			// summary:
			// Fill in the textbox with the first item from the drop down list, and
			// highlight the characters that were auto-completed.   For example, if user
			// typed "CA" and the drop down list appeared, the textbox would be changed to
			// "California" and "ifornia" would be highlighted.

			// IE7: clear selection so next highlight works all the time
			this._setSelectedRange(this.focusNode, this.focusNode.value.length, this.focusNode.value.length);
			// does text autoComplete the value in the textbox?
			if(new RegExp("^"+this.focusNode.value, this.ignoreCase ? "i" : "").test(text)){
				var cpos = this._getCaretPos(this.focusNode);
				// only try to extend if we added the last character at the end of the input
				if((cpos+1) > this.focusNode.value.length){
					// only add to input node as we would overwrite Capitalisation of chars
					// actually, that is ok
					this.focusNode.value = text;//.substr(cpos);
					// visually highlight the autocompleted characters
					this._setSelectedRange(this.focusNode, cpos, this.focusNode.value.length);
				}
			}else{
				// text does not autoComplete; replace the whole value and highlight
				this.focusNode.value = text;
				this._setSelectedRange(this.focusNode, 0, this.focusNode.value.length);
			}
		},

		_openResultList: function(/*Object*/ results, /*Object*/ dataObject){
			if(this.disabled||dataObject.query[this.searchAttr]!=this._lastQuery){
				return;
			}
			this._popupWidget.clearResultList();
			if(!results.length){
				this._hideResultList();
				return;
			}


			// Fill in the textbox with the first item from the drop down list, and
			// highlight the characters that were auto-completed.   For example, if user
			// typed "CA" and the drop down list appeared, the textbox would be changed to
			// "California" and "ifornia" would be highlighted.

			var zerothvalue=new String(this.store.getValue(results[0], this.searchAttr));
			if(zerothvalue&&(this.autoComplete)&&
			(!this._prev_key_backspace)&&
			// when the user clicks the arrow button to show the full list,
			// startSearch looks for "*".
			// it does not make sense to autocomplete
			// if they are just previewing the options available.
			(dataObject.query[this.searchAttr]!="*")){
				this._autoCompleteText(zerothvalue);
				// announce the autocompleted value
				dijit.util.wai.setAttr(this.focusNode || this.domNode, "waiState", "valuenow", zerothvalue);
			}
			// #2309: iterate over cache nondestructively
			for(var i=0; i<results.length; i++){
				var tr=results[i];
				if(tr){
					var td=this._createOption(tr);
					td.className = "dijitMenuItem";
					this._popupWidget.addItem(td);
				}

			}
// Bill: above loop could be done w/ "dojo.forEach(results, function(tr){" or better yet map()
//
// But actually the interface between ComboBoxMenu and Autocompleter is strange to me.
// ComboBoxMenu should be in charge of the
// DOM manipulation (creating text nodes, etc).   autocompleter should just pass in a list of
// items

			// show our list (only if we have content, else nothing)
			this._showResultList();
		},

		_createOption:function(/*Object*/ tr){
			// summary: creates an option to appear on the popup menu
			// subclassed by FilteringSelect
			var td = document.createElement("div");
			td.appendChild(document.createTextNode(this.store.getValue(tr, this.searchAttr)));
			// #3250: in blank options, assign a normal height
			if(td.innerHTML==""){
				td.innerHTML="&nbsp;"
			}
			td.item=tr;
			return td;
		},

		onfocus:function(){
			dijit.form._DropDownTextBox.prototype.onfocus.apply(this, arguments);
			this.parentClass.onfocus.apply(this, arguments);
		},

		onblur:function(){
			// call onblur first to avoid race conditions with _hasFocus
			dijit.form._DropDownTextBox.prototype.onblur.apply(this, arguments);
			if(!this._isShowingNow){
				// if the user clicks away from the textbox, set the value to the textbox value
				this.setDisplayedValue(this.getDisplayedValue());
			}
			// don't call this since the Textbox setValue is asynchronous
			// if you uncomment this line, when you click away from the textbox,
			// the value in the textbox reverts to match the hidden value
			//this.parentClass.onblur.apply(this, arguments);
		},

		_announceOption: function(/*Node*/ node){
			// summary:
			//	a11y code that puts the highlighted option in the textbox
			//	This way screen readers will know what is happening in the menu

			if(node==null){return;}
			// pull the text value from the item attached to the DOM node
			var newValue=this.store.getValue(node.item, this.searchAttr);
			// get the text that the user manually entered (cut off autocompleted text)
			this.focusNode.value=this.focusNode.value.substring(0, this._getCaretPos(this.focusNode));
			// autocomplete the rest of the option to announce change
			this._autoCompleteText(newValue);
		},

		_selectOption: function(/*Event*/ evt){
			var tgt = null;
			if(!evt){
				evt ={ target: this._popupWidget.getHighlightedOption()};
			}
				// what if nothing is highlighted yet?
			if(!evt.target){
				// handle autocompletion where the the user has hit ENTER or TAB
				this.setDisplayedValue(this.getDisplayedValue());
				return;
			// otherwise the user has accepted the autocompleted value
			}else{
				tgt = evt.target;
			}
			this._doSelect(tgt);
			if(!evt.noHide){
				this._hideResultList();
				this._setSelectedRange(this.focusNode, 0, null);
			}
			this.focus();
		},

		_doSelect: function(tgt){
			this.setValue(this.store.getValue(tgt.item, this.searchAttr));
		},

		_onArrowClick: function(){
			// summary: callback when arrow is clicked
			if(this.disabled){
				return;
			}
			this.focus();
			this.makePopup();
			if(this._isShowingNow){
				this._hideResultList();
			}else{
				// forces full population of results, if they click
				// on the arrow it means they want to see more options
				this._startSearch("");
			}
		},

		_startSearchFromInput: function(){
			this._startSearch(this.focusNode.value);
		},

		_startSearch: function(/*String*/ key){
			this.makePopup();
			// create a new query to prevent accidentally querying for a hidden value from FilteringSelect's keyField
			var query={};
			this._lastQuery=query[this.searchAttr]=key+"*";
			// no need to page; no point in caching the return object
			this.store.fetch({queryOptions:{ignoreCase:this.ignoreCase}, query: query, onComplete:dojo.hitch(this, "_openResultList"), count:this.searchLimit});
		},

		_getValueField:function(){
			return this.searchAttr;
		},

		postMixInProperties: function(){
			dijit.form._DropDownTextBox.prototype.postMixInProperties.apply(this, arguments);
			if(!this.store){
				// if user didn't specify store, then assume there are option tags
				var items = dojo.query("> option", this.srcNodeRef).map(function(node){
					return { value: node.getAttribute("value"), name: String(node.innerHTML) };
				});
				this.store = new dojo.data.JsonItemStore({data: {identifier:this._getValueField(), items:items}});

				// if there is no value set and there is an option list,
				// set the value to the first value to be consistent with native Select
				if(items&&items.length&&!this.value){
					this.value=items[0][this._getValueField()];
				}
				
				this.srcNodeRef.innerHTML="";
			}
		},
		
		postCreate: function(){
			// call the associated Textbox postCreate
			// ValidationTextbox for ComboBox; MappedTextbox for FilteringSelect
			this.parentClass=dojo.getObject(this.declaredClass, false).superclass;
			this.parentClass.postCreate.apply(this, arguments);
		},

		open:function(){
			this._popupWidget.onValueChanged=dojo.hitch(this, this._selectOption);
			// connect onkeypress to ComboBox
			this._popupWidget._onkeypresshandle=this.connect(this._popupWidget.domNode, "onkeypress", "onkeypress");
			return dijit.form._DropDownTextBox.prototype.open.apply(this, arguments);
		}
	}
);

dojo.declare(
	"dijit.form._ComboBoxMenu",
	dijit.form._FormWidget,

// Bill:
// I'd like the interface to ComboBoxMenu to be higher level,
// taking a list of items to initialize it, and returns the selected item
//
//		new _ComboBoxMenu({
//			items: /*dojo.data.Item[]*/ items,
//			labelFunc: dojo.hitc(this, "_makeLabel"),
//			onSelectItem: dojo.hitch(this, "_itemSelected")
//		});
//
// (This is dependent on NOT having a global widget for this, but rather
// creating it on the fly, as per discussion with Bill, Adam, and Mark)
//
// It could also have a method like handleKey(evt) that takes a keystroke
// the <input> received and handles it.
//
// Also, doesn't seem like this should inherit from FormElement, and again I'm not
// sure of the utility of dijit.form._DropDownTextBox.Popup;
// all the popup functionality is supposed to be in dijit.util.popup
//
	{
		// summary:
		//	Focus-less div based menu for internal use in ComboBox

		templateString:"<div class='dijitMenu' dojoAttachEvent='onclick; onmouseover; onmouseout;' tabIndex='-1' style='display:none; position:absolute; overflow:\"auto\";'></div>",
		_onkeypresshandle:null,

		postCreate:function(){
			// summary:
			//	call all postCreates
			dijit.form._FormWidget.prototype.postCreate.apply(this, arguments);
		},

		onClose:function(){
			this.disconnect(this._onkeypresshandle);
			this._blurOptionNode();
		},

		addItem:function(/*Node*/ item){
			this.domNode.appendChild(item);
		},
// Bill: see comments above; this call is too low level for the interface
// between Autocompleter and AutocompleterMenu

		clearResultList:function(){
			this.domNode.innerHTML="";
		},

		// these functions are called in showResultList
		getItems:function(){
			return this.domNode.childNodes;
		},

		getListLength:function(){
			return this.domNode.childNodes.length;
		},

		onclick:function(/*Event*/ evt){
			if(evt.target === this.domNode){ return; }
			var tgt=evt.target;
			// while the clicked node is inside the div
			while(!tgt.item){
				// recurse to the top
				tgt=tgt.parentNode;
			}
			this.setValue({target:tgt});
		},

		onmouseover:function(/*Event*/ evt){
			if(evt.target === this.domNode){ return; }
			this._focusOptionNode(evt.target);
		},

		onmouseout:function(/*Event*/ evt){
			if(evt.target === this.domNode){ return; }
			this._blurOptionNode();
		},

		_focusOptionNode:function(/*DomNode*/ node){
			// summary:
			//	does the actual highlight
			if(this._highlighted_option != node){
				this._blurOptionNode();
				this._highlighted_option = node;
				dojo.addClass(this._highlighted_option, "dijitMenuItemHover");
			}
		},

		_blurOptionNode:function(){
			// summary:
			//	removes highlight on highlighted option
			if(this._highlighted_option){
				dojo.removeClass(this._highlighted_option, "dijitMenuItemHover");
				this._highlighted_option = null;
			}
		},

		_highlightNextOption:function(){
			// because each press of a button clears the menu,
			// the highlighted option sometimes becomes detached from the menu!
			// test to see if the option has a parent to see if this is the case.
			if(!this.getHighlightedOption()){
				this._focusOptionNode(this.domNode.firstChild);
			}else if(this._highlighted_option.nextSibling){
				this._focusOptionNode(this._highlighted_option.nextSibling);
			}
			dijit.util.scroll.scrollIntoView(this._highlighted_option);
		},


		_highlightPrevOption:function(){
			if(!this.getHighlightedOption()){
				dijit.util.popup.close(true);
				return;
			}else if(this._highlighted_option.previousSibling){
				this._focusOptionNode(this._highlighted_option.previousSibling);
			}
			dijit.util.scroll.scrollIntoView(this._highlighted_option);
		},

		_page:function(/*Boolean*/ up){
			var scrollamount=0;
			var oldscroll=this.domNode.scrollTop;
			var height=parseInt(dojo.getComputedStyle(this.domNode).height);
			// if no item is highlighted, highlight the first option
			if(!this.getHighlightedOption()){this._highlightNextOption();}
			while(scrollamount<height){
				if(up){
					// stop at option 1
					if(!this.getHighlightedOption().previousSibling){break;}
					this._highlightPrevOption();
				}else{
					// stop at last option
					if(!this.getHighlightedOption().nextSibling){break;}
					this._highlightNextOption();
				}
				// going backwards
				var newscroll=this.domNode.scrollTop;
				scrollamount+=(newscroll-oldscroll)*(up ? -1:1);
				oldscroll=newscroll;
			}
		},

		pageUp:function(){
			this._page(true);
		},

		pageDown:function(){
			this._page(false);
		},

		getHighlightedOption:function(){
			// summary:
			//	Returns the highlighted option.
			return this._highlighted_option&&this._highlighted_option.parentNode ? this._highlighted_option : null;
		}
	}
);

dojo.declare(
	"dijit.form.ComboBox",
	[dijit.form.ValidationTextbox, dijit.form.ComboBoxMixin],
	{}
);

}

if(!dojo._hasResource["dojo.cldr.monetary"]){
dojo._hasResource["dojo.cldr.monetary"] = true;
dojo.provide("dojo.cldr.monetary");

dojo.cldr.monetary.getData = function(code){
// summary: A mapping of currency code to currency-specific formatting information. Returns a unique object with properties: places, round.
// code: an iso4217 currency code

// from http://www.unicode.org/cldr/data/common/supplemental/supplementalData.xml:supplementalData/currencyData/fractions

	var placesData = {
		ADP:0,BHD:3,BIF:0,BYR:0,CLF:0,CLP:0,DJF:0,ESP:0,GNF:0,
		IQD:3,ITL:0,JOD:3,JPY:0,KMF:0,KRW:0,KWD:3,LUF:0,LYD:3,
		MGA:0,MGF:0,OMR:3,PYG:0,RWF:0,TND:3,TRL:0,VUV:0,XAF:0,
		XOF:0,XPF:0
	};

	var roundingData = {CHF:5};

	var places = placesData[code], round = roundingData[code];
	if(typeof places == "undefined"){ places = 2; }
	if(typeof round == "undefined"){ round = 0; }

	return {places: places, round: round}; // Object
};

}

if(!dojo._hasResource["dojo.currency"]){
dojo._hasResource["dojo.currency"] = true;
dojo.provide("dojo.currency");



dojo.requireLocalization("dojo.cldr", "currency", null, "ko,zh,ja,en,en-ca,en-au,ROOT,en-us,it,fr,pt,es,de");


dojo.currency._mixInDefaults = function(options){
	options = options || {};
	options.type = "currency";

	// Get locale-depenent currency data, like the symbol
	var bundle = dojo.i18n.getLocalization("dojo.cldr", "currency", options.locale) || {};

	// Mixin locale-independent currency data, like # of places
	var iso = options.currency;
	var data = dojo.cldr.monetary.getData(iso);

	dojo.forEach(["displayName","symbol","group","decimal"], function(prop){
		data[prop] = bundle[iso+"_"+prop];
	});

	data.fractional = [true, false];

	// Mixin with provided options
	return dojo.mixin(data, options);
}

dojo.currency.format = function(/*Number*/value, /*Object?*/options){
// summary:
//		Format a Number as a String, using locale-specific settings
//
// description:
//		Create a string from a Number using a known localized pattern.
//		Formatting patterns appropriate to the locale are chosen from the CLDR http://unicode.org/cldr
//		as well as the appropriate symbols and delimiters.  See http://www.unicode.org/reports/tr35/#Number_Elements
//
// value:
//		the number to be formatted.
//
// options: object {currency: String, pattern: String?, places: Number?, round: Number?, symbol: String?, locale: String?}
//		currency- the ISO4217 currency code, a three letter sequence like "USD"
//			See http://en.wikipedia.org/wiki/ISO_4217
//		symbol- override currency symbol. Normally, will be looked up in table of supported currencies, and ISO currency code will
//			be used if not found.  See dojo.i18n.cldr.nls->currency.js
//		pattern- override formatting pattern with this string (see dojo.number.applyPattern)
//		places- fixed number of decimal places to show.  Default is defined by the currency.
//	    round- 5 rounds to nearest .5; 0 rounds to nearest whole (default). -1 means don't round.
//		locale- override the locale used to determine formatting rules

	return dojo.number.format(value, dojo.currency._mixInDefaults(options));
}

dojo.currency.regexp = function(/*Object?*/options){
//
// summary:
//		Builds the regular needed to parse a number
//
// description:
//		returns regular expression with positive and negative match, group and decimal separators
//
// options: object {pattern: String, locale: String, strict: Boolean, places: mixed}
//		currency- the ISO4217 currency code, a three letter sequence like "USD"
//			See http://en.wikipedia.org/wiki/ISO_4217
//		symbol- override currency symbol. Normally, will be looked up in table of supported currencies, and ISO currency code will
//			be used if not found.  See dojo.i18n.cldr.nls->currency.js
//		pattern- override pattern with this string
//		locale- override the locale used to determine formatting rules
//		strict- strict parsing, false by default
//		places- number of decimal places to accept.  Default is defined by currency.
	return dojo.number.regexp(dojo.currency._mixInDefaults(options)); // String
}

dojo.currency.parse = function(/*String*/expression, /*Object?*/options){
//
// summary:
//		Convert a properly formatted string to a primitive Number,
//		using locale-specific settings.
//
// description:
//		Create a Number from a string using a known localized pattern.
//		Formatting patterns are chosen appropriate to the locale.
//		Formatting patterns are implemented using the syntax described at *URL*
//
// expression: A string representation of a Number
//
// options: object {pattern: string, locale: string, strict: boolean}
//		currency- the ISO4217 currency code, a three letter sequence like "USD"
//			See http://en.wikipedia.org/wiki/ISO_4217
//		symbol- override currency symbol. Normally, will be looked up in table of supported currencies, and ISO currency code will
//			be used if not found.  See dojo.i18n.cldr.nls->currency.js
//		pattern- override pattern with this string
//		locale- override the locale used to determine formatting rules
//		strict- strict parsing, false by default
//		places- number of decimal places to accept.  Default is defined by currency.
//		fractional- where places are implied by pattern or explicit 'places' parameter, whether to include the fractional portion.
//			By default for currencies, it the fractional portion is optional.
	return dojo.number.parse(expression, dojo.currency._mixInDefaults(options));
}

}

if(!dojo._hasResource["dijit.form.CurrencyTextbox"]){
dojo._hasResource["dijit.form.CurrencyTextbox"] = true;
dojo.provide("dijit.form.CurrencyTextbox");

//FIXME: dojo.experimental throws an unreadable exception?
//dojo.experimental("dijit.form.CurrencyTextbox");


dojo.declare(
	"dijit.form.CurrencyTextbox",
	dijit.form.NumberTextbox,
	{
		// code: String
		//		the ISO4217 currency code, a three letter sequence like "USD"
		//		See http://en.wikipedia.org/wiki/ISO_4217
		currency: "",

		regExpGen: dojo.currency.regexp,
		format: dojo.currency.format,
		parse: dojo.currency.parse,

		postMixInProperties: function(){
			if(this.constraints === dijit.form.ValidationTextbox.prototype.constraints){
				// declare a constraints property on 'this' so we don't overwrite the shared default object in 'prototype'
				this.constraints = {};
			}
			this.constraints.currency = this.currency;
			dijit.form.CurrencyTextbox.superclass.postMixInProperties.apply(this, arguments);
		}
	}
);

}

if(!dojo._hasResource["dojo.cldr.supplemental"]){
dojo._hasResource["dojo.cldr.supplemental"] = true;
dojo.provide("dojo.cldr.supplemental");



dojo.cldr.supplemental.getFirstDayOfWeek = function(/*String?*/locale){
// summary: Returns a zero-based index for first day of the week
// description:
//		Returns a zero-based index for first day of the week, as used by the local (Gregorian) calendar.
//		e.g. Sunday (returns 0), or Monday (returns 1)

	// from http://www.unicode.org/cldr/data/common/supplemental/supplementalData.xml:supplementalData/weekData/firstDay
	var firstDay = {/*default is 1=Monday*/
		mv:5,
		ae:6,af:6,bh:6,dj:6,dz:6,eg:6,er:6,et:6,iq:6,ir:6,jo:6,ke:6,kw:6,lb:6,ly:6,ma:6,om:6,qa:6,sa:6,
		sd:6,so:6,tn:6,ye:6,
		as:0,au:0,az:0,bw:0,ca:0,cn:0,fo:0,ge:0,gl:0,gu:0,hk:0,ie:0,il:0,is:0,jm:0,jp:0,kg:0,kr:0,la:0,
		mh:0,mo:0,mp:0,mt:0,nz:0,ph:0,pk:0,sg:0,th:0,tt:0,tw:0,um:0,us:0,uz:0,vi:0,za:0,zw:0,
		et:0,mw:0,ng:0,tj:0,
		gb:0,
		sy:4
	};

	var country = dojo.cldr.supplemental._region(locale);
	var dow = firstDay[country];
	return (typeof dow == 'undefined') ? 1 : dow; /*Number*/
};

dojo.cldr.supplemental._region = function(/*String?*/locale){
	locale = dojo.i18n.normalizeLocale(locale);
	var tags = locale.split('-');
	var region = tags[1];
	if(!region){
		// IE often gives language only (#2269)
		// Arbitrary mappings of language-only locales to a country:
        region = {de:"de", en:"us", es:"es", fi:"fi", fr:"fr", hu:"hu", it:"it",
        ja:"jp", ko:"kr", nl:"nl", pt:"br", sv:"se", zh:"cn"}[tags[0]];
	}else if(region.length == 4){
		// The ISO 3166 country code is usually in the second position, unless a
		// 4-letter script is given. See http://www.ietf.org/rfc/rfc4646.txt
		region = tags[2];
	}
	return region;
}

dojo.cldr.supplemental.getWeekend = function(/*String?*/locale){
// summary: Returns a hash containing the start and end days of the weekend
// description:
//		Returns a hash containing the start and end days of the weekend according to local custom using locale,
//		or by default in the user's locale.
//		e.g. {start:6, end:0}

	// from http://www.unicode.org/cldr/data/common/supplemental/supplementalData.xml:supplementalData/weekData/weekend{Start,End}
	var weekendStart = {/*default is 6=Saturday*/
		eg:5,il:5,sy:5,
		'in':0,
		ae:4,bh:4,dz:4,iq:4,jo:4,kw:4,lb:4,ly:4,ma:4,om:4,qa:4,sa:4,sd:4,tn:4,ye:4		
	};

	var weekendEnd = {/*default is 0=Sunday*/
		ae:5,bh:5,dz:5,iq:5,jo:5,kw:5,lb:5,ly:5,ma:5,om:5,qa:5,sa:5,sd:5,tn:5,ye:5,af:5,ir:5,
		eg:6,il:6,sy:6
	};

	var country = dojo.cldr.supplemental._region(locale);
	var start = weekendStart[country];
	var end = weekendEnd[country];
	if(typeof start == 'undefined'){start=6;}
	if(typeof end == 'undefined'){end=0;}
	return {start:start, end:end}; /*Object {start,end}*/
};

}

if(!dojo._hasResource["dojo.date"]){
dojo._hasResource["dojo.date"] = true;
dojo.provide("dojo.date");

dojo.date.getDaysInMonth = function(/*Date*/dateObject){
	// summary: returns the number of days in the month used by dateObject
	var month = dateObject.getMonth();
	var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (month == 1 && dojo.date.isLeapYear(dateObject)){ return 29; } // Number
	return days[month]; // Number
}

dojo.date.isLeapYear = function(/*Date*/dateObject){
	// summary:
	//	Determines if the year of the dateObject is a leap year
	//
	// description:
	//	Leap years are years with an additional day YYYY-02-29, where the year
	//	number is a multiple of four with the following exception: If a year
	//	is a multiple of 100, then it is only a leap year if it is also a
	//	multiple of 400. For example, 1900 was not a leap year, but 2000 is one.

	var year = dateObject.getFullYear();
	return !(year%400) || (!(year%4) && !!(year%100)); // Boolean
}

// FIXME: This is not localized
dojo.date.getTimezoneName = function(/*Date*/dateObject){
	// summary:
	//	Get the user's time zone as provided by the browser
	//
	// dateObject: needed because the timezone may vary with time (daylight savings)
	//
	// description:
	//	Try to get time zone info from toString or toLocaleString
	//	method of the Date object -- UTC offset is not a time zone.
	//	See http://www.twinsun.com/tz/tz-link.htm
	//	Note: results may be inconsistent across browsers.

	var str = dateObject.toString(); // Start looking in toString
	var tz = ''; // The result -- return empty string if nothing found
	var match;

	// First look for something in parentheses -- fast lookup, no regex
	var pos = str.indexOf('(');
	if(pos > -1){
		tz = str.substring(++pos, str.indexOf(')'));
	}else{
		// If at first you don't succeed ...
		// If IE knows about the TZ, it appears before the year
		// Capital letters or slash before a 4-digit year 
		// at the end of string
		var pat = /([A-Z\/]+) \d{4}$/;
		if((match = str.match(pat))){
			tz = match[1];
		}else{
		// Some browsers (e.g. Safari) glue the TZ on the end
		// of toLocaleString instead of putting it in toString
			str = dateObject.toLocaleString();
			// Capital letters or slash -- end of string, 
			// after space
			pat = / ([A-Z\/]+)$/;
			if((match = str.match(pat))){
				tz = match[1];
			}
		}
	}

	// Make sure it doesn't somehow end up return AM or PM
	return (tz == 'AM' || tz == 'PM') ? '' : tz; // String
}

// Utility methods to do arithmetic calculations with Dates

dojo.date.compare = function(/*Date*/date1, /*Date?*/date2, /*String?*/portion){
	//	summary
	//		Compare two date objects by date, time, or both.
	//
	//  description
	//  	Returns 0 if equal, positive if a > b, else negative.
	//
	//	date1
	//		Date object
	//
	//	date2
	//		Date object.  If not specified, the current Date is used.
	//
	//	portion
	//		A string indicating the "date" or "time" portion of a Date object.  Compares both "date" and "time" by default.
	//		One of the following: "date", "time", "datetime"

	// Extra step required in copy for IE - see #3112
	date1 = new Date(Number(date1));
	date2 = new Date(Number(date2 || new Date()));

	if(typeof portion !== "undefined"){
		if(portion == "date"){
			// Ignore times and compare dates.
			date1.setHours(0, 0, 0, 0);
			date2.setHours(0, 0, 0, 0);
		}else if(portion == "time"){
			// Ignore dates and compare times.
			date1.setFullYear(0, 0, 0);
			date2.setFullYear(0, 0, 0);
		}
	}
	
	if(date1 > date2){ return 1; } // int
	if(date1 < date2){ return -1; } // int
	return 0; // int
};

dojo.date.add = function(/*Date*/date, /*String*/interval, /*int*/amount){
	//	summary
	//		Add to a Date in intervals of different size, from milliseconds to years
	//
	//	date
	//		Date object to start with
	//
	//	interval
	//		A string representing the interval.  One of the following:
	//			"year", "month", "day", "hour", "minute", "second", "millisecond", "quarter", "week", "weekday"
	//
	//	amount
	//		How much to add to the date.

	var sum = new Date(Number(date)); // convert to Number before copying to accomodate IE (#3112)
	var fixOvershoot = false;
	var property = "Date";

	switch(interval){
		case "day":
			break;
		case "weekday":
			//i18n FIXME: assumes Saturday/Sunday weekend, but even this is not standard.  There are CLDR entries to localize this.
			var dayOfMonth = date.getDate();
			var weeks = 0;
			var days = 0;
			var strt = 0;
			var trgt = 0;
			var adj = 0;
			// Divide the increment time span into weekspans plus leftover days
			// e.g., 8 days is one 5-day weekspan / and two leftover days
			// Can't have zero leftover days, so numbers divisible by 5 get
			// a days value of 5, and the remaining days make up the number of weeks
			var mod = amount % 5;
			if(!mod){
				days = (amount > 0) ? 5 : -5;
				weeks = (amount > 0) ? ((amount-5)/5) : ((amount+5)/5);
			}else{
				days = mod;
				weeks = parseInt(amount/5);
			}
			// Get weekday value for orig date param
			strt = date.getDay();
			// Orig date is Sat / positive incrementer
			// Jump over Sun
			if(strt == 6 && amount > 0){
				adj = 1;
			}else if(strt == 0 && amount < 0){
			// Orig date is Sun / negative incrementer
			// Jump back over Sat
				adj = -1;
			}
			// Get weekday val for the new date
			trgt = strt + days;
			// New date is on Sat or Sun
			if(trgt == 0 || trgt == 6){
				adj = (amount > 0) ? 2 : -2;
			}
			// Increment by number of weeks plus leftover days plus
			// weekend adjustments
			amount = dayOfMonth + 7*weeks + days + adj;
			break;
		case "year":
			property = "FullYear";
			// Keep increment/decrement from 2/29 out of March
			fixOvershoot = true;
			break;
		case "week":
			amount *= 7;
			break;
		case "quarter":
			// Naive quarter is just three months
			amount *= 3;
			// fallthrough...
		case "month":
			// Reset to last day of month if you overshoot
			fixOvershoot = true;
			property = "Month";
			break;
		case "hour":
		case "minute":
		case "second":
		case "millisecond":
			property = interval.charAt(0).toUpperCase() + interval.substring(1) + "s";
	}

	if(property){
		sum["set"+property](sum["get"+property]()+amount);
	}

	if(fixOvershoot && (sum.getDate() < date.getDate())){
		sum.setDate(0);
	}

	return sum; // Date
};

dojo.date.difference = function(/*Date*/date1, /*Date?*/date2, /*String?*/interval){
	//	summary
	//		Get the difference in a specific unit of time (e.g., number of months, weeks,
	//		days, etc.) between two dates, rounded to the nearest integer.
	//
	//	date1
	//		Date object
	//
	//	date2
	//		Date object.  If not specified, the current Date is used.
	//
	//	interval
	//		A string representing the interval.  One of the following:
	//			"year", "month", "day", "hour", "minute", "second", "millisecond", "quarter", "week", "weekday"
	//		Defaults to "day".

	date2 = date2 || new Date();
	interval = interval || "day";
	var yearDiff = date2.getFullYear() - date1.getFullYear();
	var delta = 1; // Integer return value

	switch(interval){
		case "quarter":
			var m1 = date1.getMonth();
			var m2 = date2.getMonth();
			// Figure out which quarter the months are in
			var q1 = Math.floor(m1/3) + 1;
			var q2 = Math.floor(m2/3) + 1;
			// Add quarters for any year difference between the dates
			q2 += (yearDiff * 4);
			delta = q2 - q1;
			break;
		case "weekday":
			var days = Math.round(dojo.date.difference(date1, date2, "day"));
			var weeks = parseInt(dojo.date.difference(date1, date2, "week"));
			var mod = days % 7;

			// Even number of weeks
			if(mod == 0){
				days = weeks*5;
			}else{
				// Weeks plus spare change (< 7 days)
				var adj = 0;
				var aDay = date1.getDay();
				var bDay = date2.getDay();

				weeks = parseInt(days/7);
				mod = days % 7;
				// Mark the date advanced by the number of
				// round weeks (may be zero)
				var dtMark = new Date(date1);
				dtMark.setDate(dtMark.getDate()+(weeks*7));
				var dayMark = dtMark.getDay();

				// Spare change days -- 6 or less
				if(days > 0){
					switch(true){
						// Range starts on Sat
						case aDay == 6:
							adj = -1;
							break;
						// Range starts on Sun
						case aDay == 0:
							adj = 0;
							break;
						// Range ends on Sat
						case bDay == 6:
							adj = -1;
							break;
						// Range ends on Sun
						case bDay == 0:
							adj = -2;
							break;
						// Range contains weekend
						case (dayMark + mod) > 5:
							adj = -2;
							break;
						default:
							// Do nothing
							break;
					}
				}else if(days < 0){
					switch (true){
						// Range starts on Sat
						case aDay == 6:
							adj = 0;
							break;
						// Range starts on Sun
						case aDay == 0:
							adj = 1;
							break;
						// Range ends on Sat
						case bDay == 6:
							adj = 2;
							break;
						// Range ends on Sun
						case bDay == 0:
							adj = 1;
							break;
						// Range contains weekend
						case (dayMark + mod) < 0:
							adj = 2;
							break;
						default:
							// Do nothing
							break;
					}
				}
				days += adj;
				days -= (weeks*2);
			}
			delta = days;
			break;
		case "year":
			delta = yearDiff;
			break;
		case "month":
			delta = (date2.getMonth() - date1.getMonth()) + (yearDiff * 12);
			break;
		case "week":
			// Truncate instead of rounding
			// Don't use Math.floor -- value may be negative
			delta = parseInt(dojo.date.difference(date1, date2, "day")/7);
			break;
		case "day":
			delta /= 24;
			// fallthrough
		case "hour":
			delta /= 60;
			// fallthrough
		case "minute":
			delta /= 60;
			// fallthrough
		case "second":
			delta /= 1000;
			// fallthrough
		case "millisecond":
			delta *= date2.getTime() - date1.getTime();
	}

	// Round for fractional values and DST leaps
	return Math.round(delta); // Number (integer)
};

}

if(!dojo._hasResource["dojo.date.locale"]){
dojo._hasResource["dojo.date.locale"] = true;
dojo.provide("dojo.date.locale");

// Localization methods for Date.   Honor local customs using locale-dependent dojo.cldr data.







// Load the bundles containing localization information for
// names and formats
dojo.requireLocalization("dojo.cldr", "gregorian", null, "ko,zh-cn,zh,ja,en,it-it,en-ca,en-au,it,en-gb,es-es,fr,pt,ROOT,ko-kr,es,de,pt-br");

//NOTE: Everything in this module assumes Gregorian calendars.
// Other calendars will be implemented in separate modules.

(function(){
	// Format a pattern without literals
	function formatPattern(dateObject, bundle, pattern){
		return pattern.replace(/([a-z])\1*/ig, function(match){
			var s;
			var c = match.charAt(0);
			var l = match.length;
			var pad;
			var widthList = ["abbr", "wide", "narrow"];
			switch(c){
				case 'G':
//					if(l>3){/*unimplemented*/}
					s = bundle.eras[dateObject.getFullYear() < 0 ? 1 : 0];
					break;
				case 'y':
					s = dateObject.getFullYear();
					switch(l){
						case 1:
							break;
						case 2:
							s = String(s); s = s.substr(s.length - 2);
							break;
						default:
							pad = true;
					}
					break;
				case 'Q':
				case 'q':
					s = Math.ceil((dateObject.getMonth()+1)/3);
//					switch(l){
//						case 1: case 2:
							pad = true;
//							break;
//						case 3: case 4: // unimplemented
//					}
					break;
				case 'M':
				case 'L':
					var m = dateObject.getMonth();
					var width;
					switch(l){
						case 1: case 2:
							s = m+1; pad = true;
							break;
						case 3: case 4: case 5:
							width = widthList[l-3];
							break;
					}
					if(width){
						var type = (c == "L") ? "standalone" : "format";
						var prop = ["months",type,width].join("-");
						s = bundle[prop][m];
					}
					break;
				case 'w':
					var firstDay = 0;
					s = dojo.date.locale._getWeekOfYear(dateObject, firstDay); pad = true;
					break;
				case 'd':
					s = dateObject.getDate(); pad = true;
					break;
				case 'D':
					s = dojo.date.locale._getDayOfYear(dateObject); pad = true;
					break;
				case 'E':
				case 'e':
				case 'c': // REVIEW: don't see this in the spec?
					var d = dateObject.getDay();
					var width;
					switch(l){
						case 1: case 2:
							if(c == 'e'){
								var first = dojo.cldr.supplemental.getFirstDayOfWeek(options.locale);
								d = (d-first+7)%7;
							}
							if(c != 'c'){
								s = d+1; pad = true;
								break;
							}
							// else fallthrough...
						case 3: case 4: case 5:
							width = widthList[l-3];
							break;
					}
					if(width){
						var type = (c == "c") ? "standalone" : "format";
						var prop = ["days",type,width].join("-");
						s = bundle[prop][d];
					}
					break;
				case 'a':
					var timePeriod = (dateObject.getHours() < 12) ? 'am' : 'pm';
					s = bundle[timePeriod];
					break;
				case 'h':
				case 'H':
				case 'K':
				case 'k':
					var h = dateObject.getHours();
					// strange choices in the date format make it impossible to write this succinctly
					switch (c) {
						case 'h': // 1-12
							s = (h % 12) || 12;
							break;
						case 'H': // 0-23
							s = h;
							break;
						case 'K': // 0-11
							s = (h % 12);
							break;
						case 'k': // 1-24
							s = h || 24;
							break;
					}
					pad = true;
					break;
				case 'm':
					s = dateObject.getMinutes(); pad = true;
					break;
				case 's':
					s = dateObject.getSeconds(); pad = true;
					break;
				case 'S':
					s = Math.round(dateObject.getMilliseconds() * Math.pow(10, l-3));
					break;
				case 'v': // FIXME: don't know what this is. seems to be same as z?
				case 'z':
					// We only have one timezone to offer; the one from the browser
					s = dojo.date.getTimezoneName(dateObject);
					if(s){break;}
					l=4;
					// fallthrough... use GMT if tz not available
				case 'Z':
					var offset = dateObject.getTimezoneOffset();
					var tz = [
						(offset<=0 ? "+" : "-"),
						dojo.string.pad(Math.floor(Math.abs(offset)/60), 2),
						dojo.string.pad(Math.abs(offset)% 60, 2)
					];
					if(l==4){
						tz.splice(0, 0, "GMT");
						tz.splice(3, 0, ":");
					}
					s = tz.join("");
					break;
//				case 'Y': case 'u': case 'W': case 'F': case 'g': case 'A':
//					console.debug(match+" modifier unimplemented");
				default:
					throw new Error("dojo.date.locale.format: invalid pattern char: "+pattern);
			}
			if(pad){ s = dojo.string.pad(s, l); }
			return s;
		});
	}

dojo.date.locale.format = function(/*Date*/dateObject, /*Object?*/options){
	// summary:
	//		Format a Date object as a String, using locale-specific settings.
	//
	// description:
	//		Create a string from a Date object using a known localized pattern.
	//		By default, this method formats both date and time from dateObject.
	//		Formatting patterns are chosen appropriate to the locale.  Different
	//		formatting lengths may be chosen, with "full" used by default.
	//		Custom patterns may be used or registered with translations using
	//		the addCustomFormats method.
	//		Formatting patterns are implemented using the syntax described at
	//		http://www.unicode.org/reports/tr35/tr35-4.html#Date_Format_Patterns
	//
	// dateObject:
	//		the date and/or time to be formatted.  If a time only is formatted,
	//		the values in the year, month, and day fields are irrelevant.  The
	//		opposite is true when formatting only dates.
	//
	// options: object {selector: string, formatLength: string, datePattern: string, timePattern: string, locale: string}
	//		selector- choice of 'time','date' (default: date and time)
	//		formatLength- choice of long, short, medium or full (plus any custom additions).  Defaults to 'short'
	//		datePattern,timePattern- override pattern with this string
	//		am,pm- override strings for am/pm in times
	//		locale- override the locale used to determine formatting rules

	options = options || {};

	var locale = dojo.i18n.normalizeLocale(options.locale);
	var formatLength = options.formatLength || 'short';
	var bundle = dojo.date.locale._getGregorianBundle(locale);
	var str = [];
	var sauce = dojo.hitch(this, formatPattern, dateObject, bundle);
	if(options.selector == "year"){
		// Special case as this is not yet driven by CLDR data
		var year = dateObject.getFullYear();
		if(locale.match(/^zh|^ja/)){
			year += "\u5E74";
		}
		return year;
	}
	if(options.selector != "time"){
		var datePattern = options.datePattern || bundle["dateFormat-"+formatLength];
		if(datePattern){str.push(_processPattern(datePattern, sauce));}
	}
	if(options.selector != "date"){
		var timePattern = options.timePattern || bundle["timeFormat-"+formatLength];
		if(timePattern){str.push(_processPattern(timePattern, sauce));}
	}
	var result = str.join(" "); //TODO: use locale-specific pattern to assemble date + time
	return result; // String
};

dojo.date.locale.regexp = function(/*Object?*/options){
	// summary:
	//		Builds the regular needed to parse a localized date
	//
	// options: object {selector: string, formatLength: string, datePattern: string, timePattern: string, locale: string, strict: boolean}
	//		selector- choice of 'time', 'date' (default: date and time)
	//		formatLength- choice of long, short, medium or full (plus any custom additions).  Defaults to 'short'
	//		datePattern,timePattern- override pattern with this string
	//		locale- override the locale used to determine formatting rules

	return dojo.date.locale._parseInfo(options).regexp; // String
};

dojo.date.locale._parseInfo = function(/*Object?*/options){
	options = options || {};
	var locale = dojo.i18n.normalizeLocale(options.locale);
	var bundle = dojo.date.locale._getGregorianBundle(locale);
	var formatLength = options.formatLength || 'short';
	var datePattern = options.datePattern || bundle["dateFormat-" + formatLength];
	var timePattern = options.timePattern || bundle["timeFormat-" + formatLength];
	var pattern;
	if(options.selector == 'date'){
		pattern = datePattern;
	}else if(options.selector == 'time'){
		pattern = timePattern;
	}else{
		pattern = datePattern + ' ' + timePattern; //TODO: use locale-specific pattern to assemble date + time
	}

	var tokens = [];
	var re = _processPattern(pattern, dojo.hitch(this, _buildDateTimeRE, tokens, bundle, options));
	return {regexp: re, tokens: tokens, bundle: bundle};
}

dojo.date.locale.parse = function(/*String*/value, /*Object?*/options){
	// summary:
	//		Convert a properly formatted string to a primitive Date object,
	//		using locale-specific settings.
	//
	// description:
	//		Create a Date object from a string using a known localized pattern.
	//		By default, this method parses looking for both date and time in the string.
	//		Formatting patterns are chosen appropriate to the locale.  Different
	//		formatting lengths may be chosen, with "full" used by default.
	//		Custom patterns may be used or registered with translations using
	//		the addCustomFormats method.
	//		Formatting patterns are implemented using the syntax described at
	//		http://www.unicode.org/reports/tr35/#Date_Format_Patterns
	//
	// value:
	//		A string representation of a date
	//
	// options: object {selector: string, formatLength: string, datePattern: string, timePattern: string, locale: string, strict: boolean}
	//		selector- choice of 'time', 'date' (default: date and time)
	//		formatLength- choice of long, short, medium or full (plus any custom additions).  Defaults to 'short'
	//		datePattern,timePattern- override pattern with this string
	//		am,pm- override strings for am/pm in times
	//		locale- override the locale used to determine formatting rules
	//		strict- strict parsing, off by default

	var info = dojo.date.locale._parseInfo(options);
	var tokens = info.tokens, bundle = info.bundle;
	var re = new RegExp("^" + info.regexp + "$");
	var match = re.exec(value);
	if(!match){ return null; } // null

	var widthList = ['abbr', 'wide', 'narrow'];
	//1972 is a leap year.  We want to avoid Feb 29 rolling over into Mar 1,
	//in the cases where the year is parsed after the month and day.
	var result = new Date(1972, 0);
	var expected = {};
	dojo.forEach(match, function(v, i){
		if(!i){return;}
		var token=tokens[i-1];
		var l=token.length;
		switch(token.charAt(0)){
			case 'y':
				if(l != 2){
					//interpret year literally, so '5' would be 5 A.D.
					result.setFullYear(v);
					expected.year = v;
				}else{
					if(v<100){
						v = Number(v);
						//choose century to apply, according to a sliding window
						//of 80 years before and 20 years after present year
						var year = '' + new Date().getFullYear();
						var century = year.substring(0, 2) * 100;
						var yearPart = Number(year.substring(2, 4));
						var cutoff = Math.min(yearPart + 20, 99);
						var num = (v < cutoff) ? century + v : century - 100 + v;
						result.setFullYear(num);
						expected.year = num;
					}else{
						//we expected 2 digits and got more...
						if(options.strict){
							return null;
						}
						//interpret literally, so '150' would be 150 A.D.
						//also tolerate '1950', if 'yyyy' input passed to 'yy' format
						result.setFullYear(v);
						expected.year = v;
					}
				}
				break;
			case 'M':
				if(l>2){
					var months = bundle['months-format-' + widthList[l-3]].concat();
					if(!options.strict){
						//Tolerate abbreviating period in month part
						//Case-insensitive comparison
						v = v.replace(".","").toLowerCase();
						months = dojo.map(months, function(s){ return s.replace(".","").toLowerCase(); } );
					}
					v = dojo.indexOf(months, v);
					if(v == -1){
//						console.debug("dojo.date.locale.parse: Could not parse month name: '" + v + "'.");
						return null;
					}
				}else{
					v--;
				}
				result.setMonth(v);
				expected.month = v;
				break;
			case 'E':
			case 'e':
				var days = bundle['days-format-' + widthList[l-3]].concat();
				if(!options.strict){
					//Case-insensitive comparison
					v = v.toLowerCase();
					days = dojo.map(days, "".toLowerCase);
				}
				v = dojo.indexOf(days, v);
				if(v == -1){
//					console.debug("dojo.date.locale.parse: Could not parse weekday name: '" + v + "'.");
					return null;
				}

				//TODO: not sure what to actually do with this input,
				//in terms of setting something on the Date obj...?
				//without more context, can't affect the actual date
				//TODO: just validate?
				break;
			case 'd':
				result.setDate(v);
				expected.date = v;
				break;
			case 'D':
				//FIXME: need to defer this until after the year is set for leap-year?
				result.setMonth(0);
				result.setDate(v);
				break;
			case 'a': //am/pm
				var am = options.am || bundle.am;
				var pm = options.pm || bundle.pm;
				if(!options.strict){
					var period = /\./g;
					v = v.replace(period,'').toLowerCase();
					am = am.replace(period,'').toLowerCase();
					pm = pm.replace(period,'').toLowerCase();
				}
				if(options.strict && v != am && v != pm){
//					console.debug("dojo.date.locale.parse: Could not parse am/pm part.");
					return null;
				}
				var hours = result.getHours();
				if(v == pm && hours < 12){
					result.setHours(hours + 12); //e.g., 3pm -> 15
				} else if(v == am && hours == 12){
					result.setHours(0); //12am -> 0
				}
				break;
			case 'K': //hour (1-24)
				if(v==24){v=0;}
				// fallthrough...
			case 'h': //hour (1-12)
			case 'H': //hour (0-23)
			case 'k': //hour (0-11)
				//TODO: strict bounds checking, padding
				if(v>23){
//					console.debug("dojo.date.locale.parse: Illegal hours value");
					return null;
				}

				//in the 12-hour case, adjusting for am/pm requires the 'a' part
				//which for now we will assume always comes after the 'h' part
				result.setHours(v);
				break;
			case 'm': //minutes
				result.setMinutes(v);
				break;
			case 's': //seconds
				result.setSeconds(v);
				break;
			case 'S': //milliseconds
				result.setMilliseconds(v);
				break;
			case 'w':
//				var firstDay = 0;
			default:
//TODO: throw?
//				console.debug("dojo.date.locale.parse: unsupported pattern char=" + token.charAt(0));
		}
	});

	//validate parse date fields versus input date fields
	if(expected.year && result.getFullYear() != expected.year){
//		console.debug("dojo.date.locale.parse: Parsed year: '" + result.getFullYear() + "' did not match input year: '" + expected.year + "'.");
		return null;
	}
	if(expected.month && result.getMonth() != expected.month){
//		console.debug("dojo.date.locale.parse: Parsed month: '" + result.getMonth() + "' did not match input month: '" + expected.month + "'.");
		return null;
	}
	if(expected.date && result.getDate() != expected.date){
//		console.debug("dojo.date.locale.parse: Parsed day of month: '" + result.getDate() + "' did not match input day of month: '" + expected.date + "'.");
		return null;
	}

	//TODO: implement a getWeekday() method in order to test 
	//validity of input strings containing 'EEE' or 'EEEE'...
	return result; // Date
};

function _processPattern(pattern, applyPattern, applyLiteral, applyAll){
	//summary: Process a pattern with literals in it

	// Break up on single quotes, treat every other one as a literal, except '' which becomes '
	var identity = function(x){return x;};
	applyPattern = applyPattern || identity;
	applyLiteral = applyLiteral || identity;
	applyAll = applyAll || identity;

	//split on single quotes (which escape literals in date format strings) 
	//but preserve escaped single quotes (e.g., o''clock)
	var chunks = pattern.match(/(''|[^'])+/g); 
	var literal = false;

	dojo.forEach(chunks, function(chunk, i){
		if(!chunk){
			chunks[i]='';
		}else{
			chunks[i]=(literal ? applyLiteral : applyPattern)(chunk);
			literal = !literal;
		}
	});
	return applyAll(chunks.join(''));
}

function _buildDateTimeRE(tokens, bundle, options, pattern){
	return dojo.regexp.escapeString(pattern).replace(/([a-z])\1*/ig, function(match){
		// Build a simple regexp.  Avoid captures, which would ruin the tokens list
		var s;
		var c = match.charAt(0);
		var l = match.length;
		var p2 = '', p3 = '';
		if(options.strict){
			if(l > 1){ p2 = '0' + '{'+(l-1)+'}'; }
			if(l > 2){ p3 = '0' + '{'+(l-2)+'}'; }
		}else{
			p2 = '0?'; p3 = '0{0,2}';
		}
		switch(c){
			case 'y':
				s = '\\d{2,4}';
				break;
			case 'M':
				s = (l>2) ? '\\S+' : p2+'[1-9]|1[0-2]';
				break;
			case 'D':
				s = p2+'[1-9]|'+p3+'[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6]';
				break;
			case 'd':
				s = p2+'[1-9]|[12]\\d|3[01]';
				break;
			case 'w':
				s = p2+'[1-9]|[1-4][0-9]|5[0-3]';
				break;
		    case 'E':
				s = '\\S+';
				break;
			case 'h': //hour (1-12)
				s = p2+'[1-9]|1[0-2]';
				break;
			case 'k': //hour (0-11)
				s = p2+'\\d|1[01]';
				break;
			case 'H': //hour (0-23)
				s = p2+'\\d|1\\d|2[0-3]';
				break;
			case 'K': //hour (1-24)
				s = p2+'[1-9]|1\\d|2[0-4]';
				break;
			case 'm':
			case 's':
				s = '[0-5]\\d';
				break;
			case 'S':
				s = '\\d{'+l+'}';
				break;
			case 'a':
				var am = options.am || bundle.am || 'AM';
				var pm = options.pm || bundle.pm || 'PM';
				if(options.strict){
					s = am + '|' + pm;
				}else{
					s = am + '|' + pm;
					if(am != am.toLowerCase()){ s += '|' + am.toLowerCase(); }
					if(pm != pm.toLowerCase()){ s += '|' + pm.toLowerCase(); }
				}
				break;
//			default:
//				console.debug("parse of date format, pattern=" + pattern);
		}

		if(tokens){ tokens.push(match); }

//FIXME: replace whitespace within final regexp with more flexible whitespace match instead?
		//tolerate whitespace
		return '\\s*(' + s + ')\\s*';
	});
}
})();

(function(){
var _customFormats = [];
dojo.date.locale.addCustomFormats = function(/*String*/packageName, /*String*/bundleName){
	// summary:
	//		Add a reference to a bundle containing localized custom formats to be
	//		used by date/time formatting and parsing routines.
	//
	// description:
	//		The user may add custom localized formats where the bundle has properties following the
	//		same naming convention used by dojo for the CLDR data: dateFormat-xxxx / timeFormat-xxxx
	//		The pattern string should match the format used by the CLDR.
	//		See dojo.date.format for details.
	//		The resources must be loaded by dojo.requireLocalization() prior to use

	_customFormats.push({pkg:packageName,name:bundleName});
};

dojo.date.locale._getGregorianBundle = function(/*String*/locale){
	var gregorian = {};
	dojo.forEach(_customFormats, function(desc){
		var bundle = dojo.i18n.getLocalization(desc.pkg, desc.name, locale);
		gregorian = dojo.mixin(gregorian, bundle);
	}, this);
	return gregorian; /*Object*/
};
})();

dojo.date.locale.addCustomFormats("dojo.cldr","gregorian");

dojo.date.locale.getNames = function(/*String*/item, /*String*/type, /*String?*/use, /*String?*/locale){
	// summary:
	//		Used to get localized strings from dojo.cldr for day or month names.
	//
	// item: 'months' || 'days'
	// type: 'wide' || 'narrow' || 'abbr' (e.g. "Monday", "Mon", or "M" respectively, in English)
	// use: 'standAlone' || 'format' (default)
	// locale: override locale used to find the names

	var label;
	var lookup = dojo.date.locale._getGregorianBundle(locale);
	var props = [item, use, type];
	if(use == 'standAlone'){
		label = lookup[props.join('-')];
	}
	props[1] = 'format';

	// return by copy so changes won't be made accidentally to the in-memory model
	return (label || lookup[props.join('-')]).concat(); /*Array*/
};

dojo.date.locale.isWeekend = function(/*Date?*/dateObject, /*String?*/locale){
	// summary:
	//	Determines if the date falls on a weekend, according to local custom.

	var weekend = dojo.cldr.supplemental.getWeekend(locale);
	var day = (dateObject || new Date()).getDay();
	if(weekend.end<weekend.start){
		weekend.end+=7;
		if(day<weekend.start){ day+=7; }
	}
	return day >= weekend.start && day <= weekend.end; // Boolean
};

// These are used only by format and strftime.  Do they need to be public?  Which module should they go in?

dojo.date.locale._getDayOfYear = function(/*Date*/dateObject){
	// summary: gets the day of the year as represented by dateObject
	var fullYear = dateObject.getFullYear();
	var lastDayOfPrevYear = new Date(fullYear-1, 11, 31);
	return Math.floor((dateObject.getTime() -
		lastDayOfPrevYear.getTime()) / (24*60*60*1000)); // Number
}

dojo.date.locale._getWeekOfYear = function(/*Date*/dateObject, /*Number*/firstDay){
	if(arguments.length == 1){ firstDay = 0; } // Sunday

	// work out the first day of the year corresponding to the week
	var firstDayOfYear = new Date(dateObject.getFullYear(), 0, 1);
	var day = firstDayOfYear.getDay();
	firstDayOfYear.setDate(firstDayOfYear.getDate() -
			day + firstDay - (day > firstDay ? 7 : 0));

	return Math.floor((dateObject.getTime() -
		firstDayOfYear.getTime()) / (7*24*60*60*1000)); // Number
}

}

if(!dojo._hasResource["dijit._Calendar"]){
dojo._hasResource["dijit._Calendar"] = true;
dojo.provide("dijit._Calendar");








dojo.declare(
	"dijit._Calendar",
	[dijit._Widget, dijit._Templated],
	{
		/*
		summary:
			A simple GUI for choosing a date in the context of a monthly calendar.

		description:
			This widget is used internally by other widgets and is not accessible
			as a standalone widget.
			This widget can't be used in a form because it doesn't serialize the date to an
			<input> field.  For a form element, use DateTextbox instead.

			Note that the parser takes all dates attributes passed in the `RFC 3339` format:
			http://www.faqs.org/rfcs/rfc3339.html (2005-06-30T08:05:00-07:00)
			so that they are serializable and locale-independent.

		usage:
			var calendar = new dijit._Calendar({}, dojo.byId("calendarNode"));
		 	-or-
			<div dojoType="dijit._Calendar"></div>
		*/
		templateString:"<table cellspacing=\"0\" cellpadding=\"0\" class=\"calendarContainer\">\n\t<thead>\n\t\t<tr class=\"dijitReset calendarMonthContainer\" valign=\"top\">\n\t\t\t<th class='dijitReset' dojoAttachEvent=\"onclick: _onDecrementMonth;\">\n\t\t\t\t<span class=\"dijitA11yLeftArrow calendarIncrementControl calendarDecrease\">&#9668;</span>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' colspan=\"5\">\n\t\t\t\t<div dojoAttachPoint=\"monthLabelSpacer\" class=\"calendarMonthLabelSpacer\"></div>\n\t\t\t\t<div dojoAttachPoint=\"monthLabelNode\" class=\"calendarMonth\"></div>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' dojoAttachEvent=\"onclick: _onIncrementMonth;\">\n\t\t\t\t<span class=\"dijitA11yRightArrow calendarIncrementControl calendarIncrease\">&#9658;</span>\n\t\t\t</th>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<th class=\"dijitReset calendarDayLabelTemplate\"><span class=\"calendarDayLabel\"></span></th>\n\t\t</tr>\n\t</thead>\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick;\" class=\"dijitReset calendarBodyContainer\">\n\t\t<tr class=\"dijitReset calendarWeekTemplate\">\n\t\t\t<td class=\"dijitReset calendarDateTemplate\"><span class=\"calendarDateLabel\"></span></td>\n\t\t</tr>\n\t</tbody>\n\t<tfoot class=\"dijitReset calendarYearContainer\">\n\t\t<tr>\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\n\t\t\t\t<h3 class=\"calendarYearLabel\">\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\"\n\t\t\t\t\t\tdojoAttachEvent=\"onclick: _onDecrementYear;\" class=\"calendarPreviousYear\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"calendarSelectedYear\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\"\n\t\t\t\t\t\tdojoAttachEvent=\"onclick: _onIncrementYear;\" class=\"calendarNextYear\"></span>\n\t\t\t\t</h3>\n\t\t\t</td>\n\t\t</tr>\n\t</tfoot>\n</table>\t\n",

		// value: Date
		// the currently selected Date
		value: new Date(),

		// dayWidth: String
		// How to represent the days of the week in the calendar header. See dojo.date.locale
		dayWidth: "narrow",

		setValue: function(/*Date*/ value){
			// summary: set the current date and update the UI.  If the date is disabled, the selection will
			//	not change, but the display will change to the corresponding month.
			if(!this.value || dojo.date.compare(value, this.value)){
				value = new Date(value);
				this.displayMonth = new Date(value);
				if(!this.isDisabledDate(value, this.lang)){
					this.value = value;
					this.value.setHours(0,0,0,0);
					this.onValueChanged(this.value);
				}
				this._populateGrid();
			}
		},

		_populateGrid: function(){
			var month = this.displayMonth;
			month.setDate(1);
			var firstDay = month.getDay();
			var daysInMonth = dojo.date.getDaysInMonth(month);
			var daysInPreviousMonth = dojo.date.getDaysInMonth(dojo.date.add(month, "month", -1));
			var today = new Date();
			var selected = this.value;

			var dayOffset = dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
			if(dayOffset > firstDay){ dayOffset -= 7; }

			// Iterate through dates in the calendar and fill in date numbers and style info
			dojo.query(".calendarDateTemplate", this.domNode).forEach(function(template, i){
				i += dayOffset;
				var date = new Date(month);
				var number, clazz, adj = 0;

				if(i < firstDay){
					number = daysInPreviousMonth - firstDay + i + 1;
					adj = -1;
					clazz = "calendarPrevious";
				}else if(i >= (firstDay + daysInMonth)){
					number = i - firstDay - daysInMonth + 1;
					adj = 1;
					clazz = "calendarNext";
				}else{
					number = i - firstDay + 1;
					clazz = "calendarCurrent";
				}

				if(adj){
					date = dojo.date.add(date, "month", adj);
				}
				date.setDate(number);

				if(!dojo.date.compare(date, today, "date")){
					clazz = "calendarCurrentDate " + clazz;
				}

				if(!dojo.date.compare(date, selected, "date")){
					clazz = "calendarSelectedDate " + clazz;
				}

				if(this.isDisabledDate(date, this.lang)){
					clazz = "calendarDisabledDate " + clazz;
				}

				template.className =  clazz + "Month calendarDateTemplate";
				template.dijitDateValue = date.valueOf();
				var label = dojo.query(".calendarDateLabel", template)[0];
				label.innerHTML = date.getDate();
			}, this);

			// Fill in localized month name
			var monthNames = dojo.date.locale.getNames('months', 'wide', 'standAlone', this.lang);
			this.monthLabelNode.innerHTML = monthNames[month.getMonth()];

			// Fill in localized prev/current/next years
			var y = month.getFullYear() - 1;
			dojo.forEach(["previous", "current", "next"], function(name){
				this[name+"YearLabelNode"].innerHTML =
					dojo.date.locale.format(new Date(y++, 0), {selector:'year', locale:this.lang});
			}, this);
		},

		postCreate: function(){
			dijit._Calendar.superclass.postCreate.apply(this);

			var cloneClass = dojo.hitch(this, function(clazz, n){
				var template = dojo.query(clazz, this.domNode)[0];
	 			for(var i=0; i<n; i++){
					template.parentNode.appendChild(template.cloneNode(true));
				}
			});

			// clone the day label and calendar day templates 6 times to make 7 columns
			cloneClass(".calendarDayLabelTemplate", 6);
			cloneClass(".calendarDateTemplate", 6);

			// now make 6 week rows
			cloneClass(".calendarWeekTemplate", 5);

			// insert localized day names in the header
			var dayNames = dojo.date.locale.getNames('days', this.dayWidth, 'standAlone', this.lang);
			var dayOffset = dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
			dojo.query(".calendarDayLabel", this.domNode).forEach(function(label, i){
				label.innerHTML = dayNames[(i + dayOffset) % 7];
			});

			// Fill in spacer element with all the month names (invisible) so that the maximum width will affect layout
			var monthNames = dojo.date.locale.getNames('months', 'wide', 'standAlone', this.lang);
			dojo.forEach(monthNames, function(name){
				var monthSpacer = dojo.doc.createElement("div");
				monthSpacer.innerHTML = name;
				this.monthLabelSpacer.appendChild(monthSpacer);
			}, this);

			this.value = null;
			this.setValue(new Date());
		},

		_adjustDate: function(/*String*/part, /*int*/amount){
			this.displayMonth = dojo.date.add(this.displayMonth, part, amount);
			this._populateGrid();
		},

		_onIncrementMonth: function(/*Event*/evt){
			// summary: handler for increment month event
			evt.stopPropagation();
			this._adjustDate("month", 1);
		},

		_onDecrementMonth: function(/*Event*/evt){
			// summary: handler for increment month event
			evt.stopPropagation();
			this._adjustDate("month", -1);
		},

		_onIncrementYear: function(/*Event*/evt){
			// summary: handler for increment year event
			evt.stopPropagation();
			this._adjustDate("year", 1);
		},

		_onDecrementYear: function(/*Event*/evt){
			// summary: handler for increment year event
			evt.stopPropagation();
			this._adjustDate("year", -1);
		},

		_onDayClick: function(/*Event*/evt){
			var node = evt.target;
			dojo.stopEvent(evt);
			while(!node.dijitDateValue){
				node = node.parentNode;
			}
			if(!dojo.hasClass(node, "calendarDisabledDate")){
				this.setValue(node.dijitDateValue);
				this.onValueSelected(this.value);
			}
		},

		onValueSelected: function(/*Date*/date){
			//summary: a date cell was selected.  It may be the same as the previous value.
		},

		onValueChanged: function(/*Date*/date){
			//summary: called only when the selected date has changed
		},

		isDisabledDate: function(/*Date*/dateObject, /*String?*/locale){
			// summary:
			//	May be overridden to disable certain dates in the calendar e.g. isDisabledDate=dojo.date.locale.isWeekend
			return false; // Boolean
		}
	}
);

}

if(!dojo._hasResource["dijit.form.DateTextbox"]){
dojo._hasResource["dijit.form.DateTextbox"] = true;
dojo.provide("dijit.form.DateTextbox");








dojo.declare(
	"dijit.form.DateTextbox",
	dijit.form.RangeBoundTextbox,
	{
		// summary:
		//		A validating, serializable, range-bound date text box.

		// constraints object: min, max
		regExpGen: dojo.date.locale.regexp,
		compare: dojo.date.compare,
		format: dojo.date.locale.format,
		parse: dojo.date.locale.parse,
		value: new Date(),

		postMixInProperties: function(){
			dijit.form.RangeBoundTextbox.prototype.postMixInProperties.apply(this, arguments);

			// #3407: only change constraints after postMixInProperties or ValidationTextbox will clear the change
			this.constraints.selector = 'date';
	
			// #2999
			if(typeof this.constraints.min == "string"){ this.constraints.min = dojo.date.stamp.fromISOString(this.constraints.min); }
 			if(typeof this.constraints.max == "string"){ this.constraints.max = dojo.date.stamp.fromISOString(this.constraints.max); }
		},

		onfocus: function(/*Event*/ evt){
			// open the calendar, UNLESS we received focus because somebody clicked the calendar
			// (which should close the calendar rather than opening it)
			if(this._skipNextFocusOpen){
				this._skipNextFocusOpen = false;
			}else{
				this._open();
			}
			dijit.form.RangeBoundTextbox.prototype.onfocus.apply(this, arguments);
		},

		serialize: function(/*Date*/date){
			return dojo.date.stamp.toISOString(date, 'date'); // String
		},

		setValue: function(/*Date*/date){
			// summary:
			//	Sets the date on this textbox

			if(!this._calendar || !this._calendar.onValueSelected){
				dijit.form.DateTextbox.superclass.setValue.apply(this, arguments);
			}else{
				this._calendar.setValue(date);
			}
		},

		_open: function(){
			// summary:
			//	opens the Calendar, and sets the onValueSelected for the Calendar
			var self = this;
			if(!this._calendar){
				this._calendar = new dijit._Calendar({
					onValueSelected: function(){
						dijit.form.DateTextbox.superclass.setValue.apply(self, arguments);					
						dijit.util.popup.close();
						self._skipNextFocusOpen=true;	// refocus on <input> but don't reopen popup
						self.focus();
					},
					lang: this.lang,
					isDisabledDate: function(/*Date*/ date){
						// summary:
						// 	disables dates outside of the min/max of the DateTextbox
						return self.constraints && (dojo.date.compare(self.constraints.min,date) > 0 || dojo.date.compare(self.constraints.max,date) < 0);
					}
				});
				this._calendar.setValue(this.getValue() || new Date());
			}
			if(!this._opened){
				dijit.util.popup.open({
					popup: this._calendar,
					around: this.domNode,
					onClose: function(){ self._opened=false; }
				});
				this._opened=true;
			}
		},

		postCreate: function(){
			dijit.form.DateTextbox.superclass.postCreate.apply(this, arguments);
			this.connect(this.domNode, "onclick", "_open");
		},

		getDisplayedValue:function(){
			return this.textbox.value;
		},

		setDisplayedValue:function(/*String*/ value){
			this.textbox.value=value;
		}
	}
);

}

if(!dojo._hasResource["dijit.form.FilteringSelect"]){
dojo._hasResource["dijit.form.FilteringSelect"] = true;
dojo.provide("dijit.form.FilteringSelect");



dojo.declare(
	"dijit.form.FilteringSelect",
	[dijit.form.MappedTextbox, dijit.form.ComboBoxMixin],
	{
		/*
		 * summary
		 *	Enhanced version of HTML's <select> tag.
		 *
		 *	Similar features:
		 *	  - There is a drop down list of possible values.
		 *    - You can only enter a value from the drop down list.  (You can't enter an arbitrary value.)
		 *    - The value submitted with the form is the hidden value (ex: CA),
		 *      not the displayed value a.k.a. label (ex: California)
		 *
		 *	Enhancements over plain HTML version:
		 *    - If you type in some text then it will filter down the list of possible values in the drop down list.
		 *    - List can be specified either as a static list or via a javascript function (that can get the list from a server)
		 */

		// searchAttr: String
		//		Searches pattern match against this field

		// labelAttr: String
		//		Optional.  The text that actually appears in the drop down.
		//		If not specified, the searchAttr text is used instead.
		labelAttr: "",

		// labelType: String
		//		"html" or "text"
		labelType: "text",

		_isvalid:true,

		isValid:function(){
			return this._isvalid;
		},

		_callbackSetLabel: function(/*Array*/ result, /*Object*/ dataObject){
			// summary
			//	Callback function that dynamically sets the label of the ComboBox

			// setValue does a synchronous lookup,
			// so it calls _callbackSetLabel directly, 
			// and so does not pass dataObject
			// dataObject==null means do not test the lastQuery, just continue
			if(dataObject&&dataObject.query[this.searchAttr]!=this._lastQuery){return;}
			if(!result.length){
				//#3268: do nothing on bad input
				//this._setValue("", "");
				//#3285: change CSS to indicate error
				this._isvalid=false;
				this.validate(this._hasFocus);
			}else{
				this._setValueFromItem(result[0]);
			}
		},

		_openResultList: function(/*Object*/ results, /*Object*/ dataObject){
			// #3285: tap into search callback to see if user's query resembles a match
			if(dataObject.query[this.searchAttr]!=this._lastQuery){return;}
			this._isvalid=results.length!=0;
			this.validate(true);
			dijit.form.ComboBoxMixin.prototype._openResultList.apply(this, arguments);
		},

		getValue:function(){
			// don't get the textbox value but rather the previously set hidden value
			return this.valueNode.value;
		},

		_getValueField:function(){
			// used for option tag selects
			return "value";
		},

		_setValue:function(/*String*/ value, /*String*/ displayedValue){
			this.valueNode.value = value;
			dijit.form.FilteringSelect.superclass.setValue.apply(this, arguments);
		},

		setValue: function(/*String*/ value){
			// summary
			//	Sets the value of the select.
			//	Also sets the label to the corresponding value by reverse lookup.

			//#3347: fetchItemByIdentity if no keyAttr specified
			var self=this;
			var handleFetchByIdentity = function(item){
				if(item){
					if(self.store.isItemLoaded(item)){
						self._callbackSetLabel([item]);
					}else{
						self.store.loadItem({item:item, onItem: self._callbackSetLabel});
					}
				}else{
					self._isvalid=false;
					// prevent errors from Tooltip not being created yet
					self.validate(false);
				}
			}
			this.store.fetchItemByIdentity({identity: value, onItem: handleFetchByIdentity});
		},

		_setValueFromItem: function(/*item*/ item){
			// summary
			//	Set the displayed valued in the input box, based on a selected item.
			//	Users shouldn't call this function; they should be calling setDisplayedValue() instead
			this._isvalid=true;
			this._setValue(this.store.getIdentity(item), this.labelFunc(item, this.store));
		},

		labelFunc: function(/*item*/ item, /*dojo.data.store*/ store){
			// summary: Event handler called when the label changes
			// returns the label that the ComboBox should display
			return store.getValue(item, this.searchAttr);
		},

		_createOption:function(/*Object*/ tr){
			// summary: creates an option to appear on the popup menu

			var td=dijit.form.ComboBoxMixin.prototype._createOption.apply(this, arguments);
			// #3129
			if(this.labelAttr){
				if(this.labelType=="html"){
					td.innerHTML=this.store.getValue(tr, this.labelAttr);
				}else{
					// prevent parsing of HTML
					var textnode=document.createTextNode(this.store.getValue(tr, this.labelAttr));
					td.innerHTML="";
					td.appendChild(textnode);
				}
			}
			return td;
		},

		onkeyup: function(/*Event*/ evt){
			// summary: internal function
			// FilteringSelect needs to wait for the complete label before committing to a reverse lookup
			//this.setDisplayedValue(this.textbox.value);
		},

		_doSelect: function(/*Event*/ tgt){
			// summary:
			//	ComboBox's menu callback function
			//	FilteringSelect overrides this to set both the visible and hidden value from the information stored in the menu

			this._setValueFromItem(tgt.item);
		},

		setDisplayedValue:function(/*String*/ label){
			// summary:
			//	Set textbox to display label
			//	Also performs reverse lookup to set the hidden value
			//	Used in InlineEditBox

			if(this.store){
				var query={};
				this._lastQuery=query[this.searchAttr]=label;
				// if the label is not valid, the callback will never set it,
				// so the last valid value will get the warning textbox
				// set the textbox value now so that the impending warning will make sense to the user
				this.textbox.value=label;
				this.store.fetch({query:query, queryOptions:{ignoreCase:this.ignoreCase}, onComplete: dojo.hitch(this, this._callbackSetLabel)});
			}
		}
	}
);

}

if(!dojo._hasResource["dijit.form.InlineEditBox"]){
dojo._hasResource["dijit.form.InlineEditBox"] = true;
dojo.provide("dijit.form.InlineEditBox");







dojo.requireLocalization("dijit", "common", null, "ROOT,de");

dojo.declare(
	"dijit.form.InlineEditBox",
	[dijit.form._FormWidget, dijit._Container],
	// summary
	//		Wrapper widget to a text edit widget.
	//		The text is displayed on the page using normal user-styling.
	//		When clicked, the text is hidden, and the edit widget is
	//		visible, allowing the text to be updated.  Additionally,
	//		Save and Cancel button are displayed below the edit widget.
	//		When Save is clicked, the text is pulled from the edit
	//		widget and redisplayed and the edit widget is again hidden.
	//		Currently all textboxes that inherit from dijit.form.Textbox
	//		are supported edit widgets.
	//		An edit widget must support the following API to be used:
	//		String getTextValue() OR String getValue()
	//		void setTextValue(String) OR void setValue(String)
	//		void focus()
	//		It must also be able to initialize with style="display:none;" set.
{
	templateString:"<span>\n\t<span class='dijitInlineValue' tabIndex=\"0\" dojoAttachPoint=\"editable;focusNode\" style=\"\" waiRole=\"button\"\n\t\tdojoAttachEvent=\"onkeypress:_onKeyPress;onclick:_onClick;onmouseout:_onMouseOut;onmouseover:_onMouseOver;onfocus:_onMouseOver;onblur:_onMouseOut;\"></span>\n\t<fieldset style=\"display:none;\" dojoAttachPoint=\"editNode\" class=\"dijitInlineEditor\">\n\t\t<div dojoAttachPoint=\"containerNode\" dojoAttachEvent=\"onkeyup:checkForValueChange;\"></div>\n\t\t<button class='saveButton' dojoAttachPoint=\"saveButton\" dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:save\">${buttonSave}</button>\n\t\t<button class='cancelButton' dojoAttachPoint=\"cancelButton\" dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:cancel\">${buttonCancel}</button>\n\t</fieldset>\n</span>\n",

	// editing: Boolean
	//		Is the node currently in edit mode?
	editing: false,

	// buttonSave: String
	//              Save button label
	buttonSave: "",

	// buttonCancel: String
	//              Cancel button label
	buttonCancel: "",

	// renderHTML: Boolean
	//              should text render as HTML(true) or plain text(false)
	renderHTML: false,

	widgetsInTemplate: true,

	postCreate: function(){
		// look for the input widget as a child of the containerNode
		var _this = this;
		dojo.addOnLoad(function(){
			if(_this.editWidget){
				_this.containerNode.appendChild(_this.editWidget.domNode);
			}else{
				_this.editWidget = _this.getChildren()[0];
			}
			_this._setEditValue = dojo.hitch(_this.editWidget,_this.editWidget.setDisplayedValue||_this.editWidget.setValue);
			_this._getEditValue = dojo.hitch(_this.editWidget,_this.editWidget.getDisplayedValue||_this.editWidget.getValue);
			_this._setEditFocus = dojo.hitch(_this.editWidget,_this.editWidget.focus);
			_this.editWidget.onValueChanged = dojo.hitch(_this,"checkForValueChange");
			_this.checkForValueChange();
			_this._showText();
		});
	},

	postMixInProperties: function(){
		dijit.form.InlineEditBox.superclass.postMixInProperties.apply(this, arguments);
		this.messages = dojo.i18n.getLocalization("dijit", "common", this.lang);
		dojo.forEach(["buttonSave", "buttonCancel"], function(prop){
			if(!this[prop]){ this[prop] = this.messages[prop]; }
		}, this);
	},

	_onKeyPress: function(e){
		if(this.disabled || e.altKey || e.ctrlKey){ return; }
		if(e.charCode == dojo.keys.SPACE || e.keyCode == dojo.keys.ENTER){
			dojo.stopEvent(e);
			this._onClick(e);
		}
	},

	_onMouseOver: function(){
		if(!this.editing){
			var classname = this.disabled ? "dijitDisabledClickableRegion" : "dijitClickableRegion";
			dojo.addClass(this.editable, classname);
		}
	},

	_onMouseOut: function(){
		if(!this.editing){
			var classStr = this.disabled ? "dijitDisabledClickableRegion" : "dijitClickableRegion";
			dojo.removeClass(this.editable, classStr);
		}
	},

	onClick: function(/*Event*/ e){
		// summary: callback for when button is clicked; user can override this function
	},

	_onClick: function(e){
		// summary
		// 		When user clicks the text, then start editing.
		// 		Hide the text and display the form instead.

		if(this.editing || this.disabled){ return; }
		this._onMouseOut();
		this.editing = true;

		// show the edit form and hide the read only version of the text
		this._setEditValue(this._isEmpty ? '' : (this.renderHTML ? this.editable.innerHTML : this.editable.firstChild.nodeValue));
		this._initialText = this._getEditValue();
		this._visualize();

		this._setEditFocus();
		this.saveButton.disable();
		// moved to postCreate to always listen
		//this.editWidget.onValueChanged = dojo.hitch(this,"checkForValueChange");
		this.onClick();
	},

	_visualize: function(e){
		dojo.style(this.editNode, "display", this.editing ? "" : "none");
		dojo.style(this.editable, "display", this.editing ? "none" : "");
	},

	_showText: function(){
		var value = this._getEditValue();
		dijit.form.InlineEditBox.superclass.setValue.call(this, value);
		// whitespace is really hard to click so show a ?
		// TODO: show user defined message in gray
		if(/^\s*$/.test(value)){ value = "?"; this._isEmpty = true; }
		else { this._isEmpty = false; }
		if(this.renderHTML){
			this.editable.innerHTML = value;
		}else{
			this.editable.innerHTML = "";
			this.editable.appendChild(document.createTextNode(value));
		}
		this._visualize();
	},

	save: function(e){
		// summary: Callback when user presses "Save" button
		if(e){ dojo.stopEvent(e); }
		this.editing = false;
		this._showText();
	},

	cancel: function(e){
		// summary: Callback when user presses "Cancel" button
		if(e){ dojo.stopEvent(e); }
		this.editing = false;
		this._visualize();
	},

	setValue: function(/*String*/ value){
		// sets the text without informing the server
		this._setEditValue(value);
		this.editing = false;
		this._showText();
	},

	checkForValueChange: function(){
		// summary
		//		Callback when user changes input value.
		//		Enable save button if the text value is different than the original value.
		if(this.editing){
			(this._getEditValue() == this._initialText) ? this.saveButton.disable() : this.saveButton.enable();
		}else{
			this._showText();
		}

	},

	disable: function(){
		this.saveButton.disable();
		this.cancelButton.disable();
		this.editable.disabled = true;
		this.editWidget.disable();
		dijit.form.InlineEditBox.superclass.disable.apply(this, arguments);
	},

	enable: function(){
		this.checkForValueChange();
		this.cancelButton.enable();
		this.editable.disabled = false;
		this.editWidget.enable();
		dijit.form.InlineEditBox.superclass.enable.apply(this, arguments);
	}
});

}

if(!dojo._hasResource["dijit.form._Spinner"]){
dojo._hasResource["dijit.form._Spinner"] = true;
dojo.provide("dijit.form._Spinner");





dojo.declare(
	"dijit.form._Spinner",
	dijit.form.RangeBoundTextbox,
	{

		// summary: Mixin for validation widgets with a spinner
		// description: This class basically (conceptually) extends dijit.form.ValidationTextbox.
		//	It modifies the template to have up/down arrows, and provides related handling code.

		// defaultTimeout: Number
		//      number of milliseconds before a held key or button becomes typematic
		defaultTimeout: 500,

		// timeoutChangeRate: Number
		//      fraction of time used to change the typematic timer between events
		//      1.0 means that each typematic event fires at defaultTimeout intervals
		//      < 1.0 means that each typematic event fires at an increasing faster rate
		timeoutChangeRate: 0.90,

		// smallDelta: Number
		//      adjust the value by this much when spinning using the arrow keys/buttons
		smallDelta: 1,
		// largeDelta: Number
		//      adjust the value by this much when spinning using the PgUp/Dn keys
		largeDelta: 10,

		templateString:"<div class=\"dijit dijitInline dijitLeft dijitSpinner\" baseClass=\"dijitSpinner\"\n\tid=\"${id}\" name=\"${name}\"\n\tdojoAttachEvent=\"onmouseover:_onMouse;onmouseout:_onMouse;\"\n\twaiRole=\"presentation\"\n><table cellspacing=\"0\"  waiRole=\"presentation\">\n\t<tr>\n\t\t<td rowspan=\"2\" class=\"dijitReset dijitStretch dijitSpinnerInput\">\n\t\t\t<input dojoAttachPoint=\"textbox;focusNode\" type=\"${type}\" dojoAttachEvent=\"onblur;onfocus;onkeyup;\"\n\t\t\t\tvalue=\"${value}\" name=\"${name}\" size=\"${size}\" maxlength=\"${maxlength}\"\n\t\t\t\twaiRole=\"spinbutton\" autocomplete=\"off\" tabIndex=\"${tabIndex}\"\n\t\t\t></td>\n\t\t<td class=\"dijitReset dijitRight dijitButtonNode dijitUpArrowButton\" \n\t\t\t\tdojoAttachPoint=\"upArrowNode\"\n\t\t\t\tdojoAttachEvent=\"onmousedown:_handleUpArrowEvent;onmouseup:_handleUpArrowEvent;onmouseover:_handleUpArrowEvent;onmouseout:_handleUpArrowEvent;\"\n\t\t\t\tbaseClass=\"dijitSpinnerUpArrow\"\n\t\t\t><div class=\"dijitA11yUpArrow\">&#9650;</div></td>\n\t</tr><tr>\n\t\t<td class=\"dijitReset dijitRight dijitButtonNode dijitDownArrowButton\" \n\t\t\t\tdojoAttachPoint=\"downArrowNode\"\n\t\t\t\tdojoAttachEvent=\"onmousedown:_handleDownArrowEvent;onmouseup:_handleDownArrowEvent;onmouseover:_handleDownArrowEvent;onmouseout:_handleDownArrowEvent;\"\n\t\t\t\tbaseClass=\"dijitSpinnerDownArrow\"\n\t\t\t><div class=\"dijitA11yDownArrow\">&#9660;</div></td>\n\t</tr>\n</table></div>\n\n",

		adjust: function(/* Object */ val, /*Number*/ delta){
			// summary: user replaceable function used to adjust a primitive value(Number/Date/...) by the delta amount specified
			// the val is adjusted in a way that makes sense to the object type
			return val;
		},

		_handleUpArrowEvent : function(/*Event*/ e){
			this._onMouse(e, this.upArrowNode);
		},

		_handleDownArrowEvent : function(/*Event*/ e){
			this._onMouse(e, this.downArrowNode);
		},


		_arrowPressed: function(/*Node*/ nodePressed, /*Number*/ direction){
			if(this.disabled){ return; }
			dojo.addClass(nodePressed, "dijitSpinnerButtonActive");
			this.setValue(this.adjust(this.getValue(), direction*this.smallDelta));
		},

		_arrowReleased: function(/*Node*/ node){
			if(this.disabled){ return; }
			this._wheelTimer = null;
			this.textbox.focus();
			dojo.removeClass(node, "dijitSpinnerButtonActive");
		},

		_typematicCallback: function(/*Number*/ count, /*DOMNode*/ node, /*Event*/ evt){
			if(node == this.textbox){ node = (evt.keyCode == dojo.keys.UP_ARROW) ? this.upArrowNode : this.downArrowNode; }
			if(count == -1){ this._arrowReleased(node); }
			else{ this._arrowPressed(node, (node == this.upArrowNode) ? 1 : -1); }
		},

		_wheelTimer: null,
		_mouseWheeled: function(/*Event*/ evt){
			dojo.stopEvent(evt);
			var scrollAmount = 0;
			if(typeof evt.wheelDelta == 'number'){ // IE
				scrollAmount = evt.wheelDelta;
			}else if(typeof evt.detail == 'number'){ // Mozilla+Firefox
				scrollAmount = -evt.detail;
			}
			if(scrollAmount > 0){
				var node = this.upArrowNode;
				var dir = +1;
			}else if(scrollAmount < 0){
				var node = this.downArrowNode;
				var dir = -1;
			}else{ return; }
			this._arrowPressed(node, dir);
			if(this._wheelTimer != null){
				clearTimeout(this._wheelTimer);
			}
			var _this = this;
			this._wheelTimer = setTimeout(function(){_this._arrowReleased(node);}, 50);
		},

		postCreate: function(){
			dijit.form._Spinner.superclass.postCreate.apply(this, arguments);

			// textbox and domNode get the same style but the css separates the 2 using !important
			if(this.srcNodeRef){
				dojo.style(this.textbox, "cssText", this.srcNodeRef.style.cssText);
				this.textbox.className += " " + this.srcNodeRef.className;
			}

			// extra listeners
			this.connect(this.textbox, dojo.isIE ? "onmousewheel" : 'DOMMouseScroll', "_mouseWheeled");
			dijit.util.typematic.addListener(this.upArrowNode, this.textbox, {keyCode:dojo.keys.UP_ARROW,ctrlKey:false,altKey:false,shiftKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout);
			dijit.util.typematic.addListener(this.downArrowNode, this.textbox, {keyCode:dojo.keys.DOWN_ARROW,ctrlKey:false,altKey:false,shiftKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout);

			this._setDisabled(this.disabled == true);
		}
});

}

if(!dojo._hasResource["dijit.form.NumberTextbox"]){
dojo._hasResource["dijit.form.NumberTextbox"] = true;
dojo.provide("dijit.form.NumberTextbox");




dojo.declare(
	"dijit.form.NumberTextboxMixin",
	null,
	{
		// summary:
		//		A mixin for all number textboxes
		regExpGen: dojo.number.regexp,
		format: dojo.number.format,
		parse: dojo.number.parse,
		value: 0
	}
);

dojo.declare(
	"dijit.form.NumberTextbox",
	[dijit.form.RangeBoundTextbox,dijit.form.NumberTextboxMixin],
	{
		// summary:
		//		A validating, serializable, range-bound text box.
		// constraints object: min, max, places
	}
);

}

if(!dojo._hasResource["dijit.form.NumberSpinner"]){
dojo._hasResource["dijit.form.NumberSpinner"] = true;
dojo.provide("dijit.form.NumberSpinner");




dojo.declare(
"dijit.form.NumberSpinner",
[dijit.form._Spinner, dijit.form.NumberTextboxMixin],
{
	// summary: Number Spinner
	// description: This widget is the same as NumberTextbox but with up/down arrows added

	required: true,

	adjust: function(/* Object */ val, /*Number*/ delta){
		// summary: change Number val by the given amount
		var newval = val+delta;
		if(isNaN(val) || isNaN(newval)){ return val; }
		if((typeof this.constraints.max == "number") && (newval > this.constraints.max)){
			newval = this.constraints.max;
		}
		if((typeof this.constraints.min == "number") && (newval < this.constraints.min)){
			newval = this.constraints.min;
		}
		return newval;
	}
});

}

if(!dojo._hasResource["dijit.form.Slider"]){
dojo._hasResource["dijit.form.Slider"] = true;
dojo.provide("dijit.form.Slider");





dojo.declare(
	"dijit.form.HorizontalSlider",
	dijit.form._FormWidget,
{
	// summary
	//	A form widget that allows one to select a value with a horizontally draggable image

	templateString:"<table class=\"dijitReset dijitSlider\" cellspacing=0 cellpadding=0 border=0 rules=none id=\"${id}\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=2></td\n\t\t><td dojoAttachPoint=\"topDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\n\t\t><td class=\"dijitReset\" colspan=2></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitHorizontalSliderButtonContainer\"\n\t\t\t><span dojoAttachPoint=\"decrementButton\" class=\"dijitSliderButton dijitSliderHorizontalButton\" style=\"display:none;\"></span\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitHorizontalSliderBumper dijitSliderLeftBumper dijitHorizontalSliderLeftBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset\" style=\"width:9999px;\"\n\t\t\t><input dojoAttachPoint=\"valueNode\" name=\"${name}\" type=\"hidden\"\n\t\t\t><div style=\"position:relative;\" dojoAttachPoint=\"containerNode\"\n\t\t\t\t><div dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitHorizontalSliderBar dijitSliderProgressBar dijitHorizontalSliderProgressBar\" dojoAttachEvent=\"onclick:_onBarClick;\"\n\t\t\t\t\t><div tabIndex=\"${tabIndex}\" dojoAttachPoint=\"sliderHandle;focusNode;\" class=\"dijitSliderMoveable dijitHorizontalSliderMoveable\" dojoAttachEvent=\"onkeypress:_onKeyPress;onclick:_onHandleClick;\" waiRole=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t\t><img class=\"dijitSliderImageHandle dijitHorizontalSliderImageHandle\" src=\"${handleSrc}\" style=\"display:inline;\"\n\t\t\t\t\t\t><span class=\"dijitSliderA11yHandle dijitHorizontalSliderA11yHandle\" style=\"display:none;\">&#9830;</span\n\t\t\t\t\t></div\n\t\t\t\t></div\n\t\t\t\t><div dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitHorizontalSliderBar dijitSliderRemainingBar dijitHorizontalSliderRemainingBar\" dojoAttachEvent=\"onclick:_onBarClick;\"></div\n\t\t\t></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitHorizontalSliderBumper dijitSliderRightBumper dijitHorizontalSliderRightBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitHorizontalSliderButtonContainer\"\n\t\t\t><span dojoAttachPoint=\"incrementButton\" class=\"dijitSliderButton dijitSliderHorizontalButton\" style=\"display:none;\"></span\n\t\t></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=2></td\n\t\t><td dojoAttachPoint=\"bottomDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\n\t\t><td class=\"dijitReset\" colspan=2></td\n\t></tr\n></table>\n",
	value: 0,

	// showButtons: boolean
	//	Show increment/decrement buttons at the ends of the slider?
	showButtons: true,

	// incrementButtonContents: String
	//	The increment button label
	incrementButtonContent: "+",

	// decrementButtonContents: String
	//	The decrement button label
	decrementButtonContent: "-",

	// handleSrc: String
	//	The draggable handle image src value
	handleSrc: dojo.moduleUrl('dijit','themes/tundra/images/preciseSliderThumb.png'),
	
	// minimum:: integer
	//	The minimum value allowed.
	minimum: 0,
	
	// maximum: integer
	//	The maximum allowed value.
	maximum: 100,
	
	// discreteValues: integer
	//	The maximum allowed values dispersed evenly between minimum and maximum (inclusive).
	discreteValues: Infinity,
	
	// pageIncrement: integer
	//	The amount of change with shift+arrow
	pageIncrement: 2,
	
	// clickSelect: boolean
	//	If clicking the progress bar changes the value or not
	clickSelect: true,
	
	_mousePixelCoord: "pageX",
	_pixelCount: "w",
	_startingPixelCoord: "x",
	_startingPixelCount: "l",
	_handleOffsetCoord: "left",
	_progressPixelSize: "width",
	_upsideDown: false,

	 _setDisabled: function(/*Boolean*/ disabled){
		if(this.showButtons){
			this.incrementButton.disabled = disabled;
			this.decrementButton.disabled = disabled;
		}
		dijit.form.HorizontalSlider.superclass._setDisabled.apply(this, arguments); 
	 },

	_onKeyPress: function(/*Event*/ e){
		if(this.disabled || e.altKey || e.ctrlKey){ return; }
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
	},

	_onHandleClick: function(e){
		if(this.disabled){ return; }
		this.sliderHandle.focus();
		dojo.stopEvent(e);
	},

	_onBarClick: function(e){
		if(this.disabled || !this.clickSelect){ return; }
		dojo.stopEvent(e);
		var abspos = dojo.coords(this.containerNode, true);
		var pixelValue = e[this._mousePixelCoord] - abspos[this._startingPixelCoord];
		this._setPixelValue(this._upsideDown ? (abspos[this._pixelCount] - pixelValue) : pixelValue, abspos[this._pixelCount]);
	},

	_setPixelValue: function(/*Number*/ pixelValue, /*Number*/ maxPixels){
		pixelValue = pixelValue < 0 ? 0 : maxPixels < pixelValue ? maxPixels : pixelValue;
		var count = this.discreteValues;
		if(count > maxPixels){ count = maxPixels; }
		var pixelsPerValue = maxPixels / count;
		var wholeIncrements = Math.round(pixelValue / pixelsPerValue);
		this.setValue((this.maximum-this.minimum)*wholeIncrements/count + this.minimum);
	},

	setValue: function(/*Number*/ value){
		this.valueNode.value = this.value = value;
		dijit.form.HorizontalSlider.superclass.setValue.call(this, value);
		var percent = (value - this.minimum) / (this.maximum - this.minimum);
		this.progressBar.style[this._progressPixelSize] = (percent*100) + "%";
		this.remainingBar.style[this._progressPixelSize] = ((1-percent)*100) + "%";
	},

	_bumpValue: function(signedChange){
		var s = dojo.getComputedStyle(this.containerNode);
		var c = dojo._getContentBox(this.containerNode, s);
		var count = this.discreteValues;
		if(count > c[this._pixelCount]){ count = c[this._pixelCount]; }
		var value = (this.value - this.minimum) * count / (this.maximum - this.minimum) + signedChange;
		if(value < 0){ value = 0; }
		if(value > count){ value = count; }
		value = value * (this.maximum - this.minimum) / count + this.minimum;
		this.setValue(value);
	},

	decrement: function(e){
		// summary
		//	decrement slider by 1 unit
		this._bumpValue(e.shiftKey?-this.pageIncrement:-1);
	},

	increment: function(e){
		// summary
		//	increment slider by 1 unit
		this._bumpValue(e.shiftKey?this.pageIncrement:1);
	},

	repeatString: function(str,n){
		   var s = "", t = str.toString()
		   while (--n >= 0) s += t
		   return s
	},

	_createButton: function(node, label, fcn){
		var widget = new dijit.form.Button({label: label, tabIndex:-1, onClick: dojo.hitch(this, fcn)}, node);
		widget.domNode.style.display="";
		return widget;
	},

	_createIncrementButton: function(){
		var w = this._createButton(this.incrementButton, this.incrementButtonContent, "increment");
		this.incrementButton = w.focusNode;
	},

	_createDecrementButton: function(){
		var w = this._createButton(this.decrementButton, this.decrementButtonContent, "decrement");
		this.decrementButton = w.focusNode;
	},

	postCreate: function(){
		if(this.showButtons){
			this._createIncrementButton();
			this._createDecrementButton();
		}
		this.sliderHandle.widget = this;

		new dojo.dnd.Moveable(this.sliderHandle, {mover: dijit.form._slider});
		this.setValue(this.value);
	}
});

dojo.declare(
	"dijit.form.VerticalSlider",
	dijit.form.HorizontalSlider,
{
	// summary
	//	A form widget that allows one to select a value with a vertically draggable image

	templateString:"<table class=\"dijitReset dijitSlider\" cellspacing=0 cellpadding=0 border=0 rules=none id=\"${id}\"\n><tbody class=\"dijitReset\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitVerticalSliderButtonContainer\"\n\t\t\t><span dojoAttachPoint=\"incrementButton\" class=\"dijitSliderButton dijitVerticalSliderButton dijitVerticalSliderTopButton\" style=\"display:none;\"></span\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitVerticalSliderBumper dijitSliderTopBumper dijitVerticalSliderTopBumper\"></div></center\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td dojoAttachPoint=\"leftDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\n\t\t><td class=\"dijitReset\" style=\"height:100%;\"\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" name=\"${name}\"\n\t\t\t><center style=\"position:relative;height:100%;\" dojoAttachPoint=\"containerNode\"\n\t\t\t\t><div dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitVerticalSliderBar dijitSliderRemainingBar dijitVerticalSliderRemainingBar\" dojoAttachEvent=\"onclick:_onBarClick;\"></div\n\t\t\t\t><div dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitVerticalSliderBar dijitSliderProgressBar dijitVerticalSliderProgressBar\" dojoAttachEvent=\"onclick:_onBarClick;\"\n\t\t\t\t\t><div tabIndex=\"${tabIndex}\" dojoAttachPoint=\"sliderHandle;focusNode;\" class=\"dijitSliderMoveable\" dojoAttachEvent=\"onkeypress:_onKeyPress;onclick:_onHandleClick;\" style=\"vertical-align:top;\" waiRole=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"\n\t\t\t\t\t\t><img class=\"dijitSliderImageHandle dijitVerticalSliderImageHandle\" src=\"${handleSrc}\" style=\"display:inline;\"\n\t\t\t\t\t\t><span class=\"dijitSliderA11yHandle dijitVerticalSliderA11yHandle\" style=\"display:none;\">&#9830;</span\n\t\t\t\t\t></div\n\t\t\t\t></div\n\t\t\t></center\n\t\t></td\n\t\t><td dojoAttachPoint=\"rightDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><center><div class=\"dijitSliderBar dijitSliderBumper dijitVerticalSliderBumper dijitSliderBottomBumper dijitVerticalSliderBottomBumper\"></div></center\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\"></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitVerticalSliderButtonContainer\"\n\t\t\t><span dojoAttachPoint=\"decrementButton\" class=\"dijitSliderButton dijitVerticalSliderButton dijitVerticalSliderBottomButton\" style=\"display:none;\"></span\n\t\t></td\n\t\t><td class=\"dijitReset\"></td\n\t></tr\n></tbody></table>\n",
	handleSrc: dojo.moduleUrl('dijit','themes/tundra/images/sliderThumb.png'),
	_mousePixelCoord: "pageY",
	_pixelCount: "h",
	_startingPixelCoord: "y",
	_startingPixelCount: "t",
	_handleOffsetCoord: "top",
	_progressPixelSize: "height",
	_upsideDown: true
});

dojo.declare("dijit.form._slider",
	dojo.dnd.Mover,
{
	onMouseMove: function(e){
		var widget = this.node.widget;
		var c = this.constraintBox;
		if(!c){
			var container = widget.containerNode;
			var s = dojo.getComputedStyle(container);
			var c = dojo._getContentBox(container, s);
			c[widget._startingPixelCount] = 0;
			this.constraintBox = c;
		}
		var m = this.marginBox;
		var pixelValue = m[widget._startingPixelCount] + e[widget._mousePixelCoord];
		dojo.hitch(widget, "_setPixelValue")(widget._upsideDown? (c[widget._pixelCount]-pixelValue) : pixelValue, c[widget._pixelCount]);
	}
});

}

if(!dojo._hasResource["dijit.form.Textarea"]){
dojo._hasResource["dijit.form.Textarea"] = true;
dojo.provide("dijit.form.Textarea");



dojo.declare(
	"dijit.form.Textarea",
	dijit.form._FormWidget,
{
	// summary
	//	A textarea that resizes vertically to contain the data.
	//	Takes nearly all the parameters (name, value, etc.) that a vanilla textarea takes.
	//	Cols is not supported and the width should be specified with style width.
	//	Rows is not supported since this widget adjusts the height.
	// usage:
	//	<textarea dojoType="dijit.form.ResizableTextArea">...</textarea>

	templateString: (dojo.isIE || dojo.isSafari || dojo.isMozilla) ? '<fieldset id="${id}" tabIndex="${tabIndex}" class="dijitInlineBox dijitInputField dijitTextArea">'
				+ ((dojo.isIE || dojo.isSafari) ? '<div dojoAttachPoint="editNode" style="text-decoration:none;_padding-bottom:16px;display:block;overflow:auto;" contentEditable="true"></div>'
					: '<iframe dojoAttachPoint="iframe" src="javascript:void(0)" style="border:0px;margin:0px;padding:0px;display:block;width:100%;height:100%;overflow-x:auto;overflow-y:hidden;"></iframe>')
				+ '<textarea name="${name}" value="${value}" dojoAttachPoint="formValueNode" style="display:none;"></textarea>'
				+ '</fieldset>'
			: '<textarea id="${id}" name="${name}" value="${value}" dojoAttachPoint="formValueNode" tabIndex="${tabIndex}" class="dijitInputField dijitTextArea"></textarea>',

	focus: function(){
		// summary: Received focus, needed for the InlineEditBox widget
		if(!this.disabled){
			this._changing(); // set initial height
			this.focusNode.focus();
		}
	},

	_setFormValue: function(){
		// blah<BR>blah --> blah\nblah
		// <P>blah</P><P>blah</P> --> blah\nblah
		// <DIV>blah</DIV><DIV>blah</DIV> --> blah\nblah
		// &amp;&lt;&nbsp;&gt; --> &< >
		value = this.editNode.innerHTML.replace(/<(br[^>]*|\/(p|div))>$|^<(p|div)[^>]*>|\r/gi,"").replace(/<\/(p|div)>\s*<\1[^>]*>|<(br|p|div)[^>]*>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&amp;/gi,"\&").replace(/&nbsp;/gi," ").replace(/&lt;/gi,"<").replace(/&gt;/gi,">");
		this.formValueNode.value = value;
		if(this.iframe){
			var d = this.iframe.contentWindow.document;
			var newHeight = d.body.firstChild.scrollHeight;
			if(d.body.scrollWidth > d.body.clientWidth){ newHeight+=16; } // scrollbar space needed?
			if(this.lastHeight != newHeight){ // cache size so that we don't get a resize event because of a resize event
				if(newHeight == 0){ newHeight = 16; } // height = 0 causes the browser to not set scrollHeight
				dojo.contentBox(this.iframe, {h: newHeight});
				this.lastHeight = newHeight;
			}
		}
		dijit.form.Textarea.superclass.setValue.call(this, value);
	},

	setValue: function(/*String*/ value){
		if(this.editNode){
			this.editNode.innerHTML = ""; // wipe out old nodes
			var lines = value.split("\n");
			for(var i=0; i < lines.length; i++){
				this.editNode.appendChild(document.createTextNode(lines[i])); // use text nodes so that imbedded tags can be edited
				this.editNode.appendChild(document.createElement("BR")); // preserve line breaks
			}
		}
		this._setFormValue();
	},

	getValue: function(){
		return this.formValueNode.value;
	},

	postMixInProperties: function(){
		dijit.form.Textarea.superclass.postMixInProperties.apply(this,arguments);
		// don't let the source text be converted to a DOM structure since we just want raw text
		if(this.srcNodeRef && this.srcNodeRef.innerHTML != ""){
			this.value = this.srcNodeRef.innerHTML;
			this.srcNodeRef.innerHTML = "";
		}
		if((!this.value || this.value == "") && this.srcNodeRef && this.srcNodeRef.value){
			this.value = this.srcNodeRef.value;
		}
		if(!this.value){ this.value = ""; }
	},

	postCreate: function(){
		if(dojo.isIE || dojo.isSafari){
			this.domNode.style.overflowY = 'hidden';
			this.eventNode = this.editNode;
			this.focusNode = this.editNode;
			this.connect(this.eventNode, "oncut", this._changing);
			this.connect(this.eventNode, "onpaste", this._changing);
		}else if(dojo.isMozilla){
			this.iframe = this.domNode.firstChild;
			var w = this.iframe.contentWindow;
			var d = w.document;
			d.open();
			d.write('<html><body style="margin:0px;padding:0px;border:0px;"><div tabIndex="1" style="padding:2px;"></div></body></html>');
			d.close();
			try{ this.iframe.contentDocument.designMode="on"; }catch(e){/*squelch*/} // this can fail if display:none
			this.editNode = d.body.firstChild;
			this.domNode.style.overflowY = 'hidden';
			this.eventNode = d;
			this.focusNode = this.editNode;
			this.eventNode.addEventListener("keypress", dojo.hitch(this, "_interceptTab"), false);
			this.eventNode.addEventListener("resize", dojo.hitch(this, "_changed"), false);
		}else{
			this.focusNode = this.domNode;
		}
		this.setValue(this.value);
		if(this.eventNode){
			this.connect(this.eventNode, "keydown", this._changing);
			this.connect(this.eventNode, "mousemove", this._changed);
			this.connect(this.eventNode, "focus", this._focused);
			this.connect(this.eventNode, "blur", this._blurred);
		}
	},

	// event handlers, you can over-ride these in your own subclasses
	_focused: function(){
		dojo.addClass(this.domNode, "dijitInputFieldFocused");
		this._changed();
	},

	_blurred: function(){
		dojo.removeClass(this.domNode, "dijitInputFieldFocused");
		this._changed();
	},

	_interceptTab: function(e){
		if(e.keyCode == 9 && !e.shiftKey && !e.ctrlKey && !e.altKey){
			this.iframe.focus();
			e.preventDefault();
		}
	},

	_changing: function(){
		// summary: event handler for when a change is imminent
		setTimeout(dojo.hitch(this,"_changed"),1);
	},

	_changed: function(){
		// summary: event handler for when a change has already happened
		if(this.iframe && this.iframe.contentDocument.designMode != "on"){
			this.iframe.contentDocument.designMode="on"; // in case this failed on init due to being hidden
		}
		this._setFormValue();
	}
});

}

if(!dojo._hasResource["dijit.layout.StackContainer"]){
dojo._hasResource["dijit.layout.StackContainer"] = true;
dojo.provide("dijit.layout.StackContainer");





dojo.declare(
	"dijit.layout.StackContainer",
	dijit.layout._LayoutWidget,

	// summary
	//	A container that has multiple children, but shows only
	//	one child at a time (like looking at the pages in a book one by one).
	//
	//	Publishes topics <widgetId>-addChild, <widgetId>-removeChild, and <widgetId>-selectChild
	//
	//	Can be base class for container, Wizard, Show, etc.
{
	// doLayout: Boolean
	//  if true, change the size of my currently displayed child to match my size
	doLayout: true,

	_started: false,

	startup: function(){
		var children = this.getChildren();

		// Setup each page panel
		dojo.forEach(children, this._setupChild, this);

		// Figure out which child to initially display
		dojo.some(children, function(child){
			if(child.selected){
				this.selectedChildWidget = child;
			}
			return child.selected;
		}, this);

		// Default to the first child
		if(!this.selectedChildWidget && children[0]){
			this.selectedChildWidget = children[0];
			this.selectedChildWidget.selected = true;
		}
		if(this.selectedChildWidget){
			this._showChild(this.selectedChildWidget)
		}

		// Now publish information about myself so any StackControllers can initialize..
		dojo.publish(this.id+"-startup", [{children: children, selected: this.selectedChildWidget}]);

		dijit.layout._LayoutWidget.prototype.startup.apply(this, arguments);
		this._started = true;
	},

	_setupChild: function(/*Widget*/ page){
		// Summary: prepare the given child

		page.domNode.style.display = "none";

		// since we are setting the width/height of the child elements, they need
		// to be position:relative, or IE has problems (See bug #2033)
		page.domNode.style.position = "relative";

		return page;
	},

	addChild: function(/*Widget*/ child, /*Integer*/ insertIndex){
		dijit._Container.prototype.addChild.apply(this, arguments);
		child = this._setupChild(child);

		var started = this._started;
		if(started){
			// in case the tab titles have overflowed from one line to two lines
			this.layout();
		}

		// if this is the first child, then select it
		if(!this.selectedChildWidget && started){
			this.selectChild(child);
		}

		if(started){
			dojo.publish(this.id+"-addChild", [child]);
		}
	},

	removeChild: function(/*Widget*/ page){

		dijit._Container.prototype.removeChild.apply(this, arguments);

		// If we are being destroyed than don't run the code below (to select another page), because we are deleting
		// every page one by one
		if(this._beingDestroyed){ return; }

		if(this._started){
			// this will notify any tablists to remove a button; do this first because it may affect sizing
			dojo.publish(this.id+"-removeChild", [page]);

			// in case the tab titles now take up one line instead of two lines
			this.layout();
		}

		if(this.selectedChildWidget === page){
			this.selectedChildWidget = undefined;
			if(this._started){
				var children = this.getChildren();
				if(children.length){
					this.selectChild(children[0]);
				}
			}
		}
	},

	selectChild: function(/*Widget*/ page){
		// summary
		//	Show the given widget (which must be one of my children)

		page = dijit.byId(page);

		if(this.selectedChildWidget != page){
			// Deselect old page and select new one
			this._transition(page, this.selectedChildWidget);
			this.selectedChildWidget = page;
//			this.selectedChild = page ? page.id : null; //TODO is this used anywhere?
			dojo.publish(this.id+"-selectChild", [page]);
		}
	},

	_transition: function(/*Widget*/newWidget, /*Widget*/oldWidget){
		if(oldWidget){
			this._hideChild(oldWidget);
		}
		this._showChild(newWidget);
	},

	forward: function(){
		// Summary: advance to next page
		var index = dojo.indexOf(this.getChildren(), this.selectedChildWidget);
		this.selectChild(this.getChildren()[index+1]);
	},

	back: function(){
		// Summary: go back to previous page
		var index = dojo.indexOf(this.getChildren(), this.selectedChildWidget);
		this.selectChild(this.getChildren()[index-1]);
	},

	layout: function(){
		// Summary: called when any page is shown, to make it fit the container correctly
		if(this.doLayout && this.selectedChildWidget && this.selectedChildWidget.resize){
			this.selectedChildWidget.resize(this._contentBox);
		}
	},

	_showChild: function(/*Widget*/ page){
		var children = this.getChildren();
		page.isFirstChild = (page == children[0]);
		page.isLastChild = (page == children[children.length-1]);
		page.selected = true;

		// size the current page (in case this is the first time it's being shown, or I have been resized)
		// page must be visible for resizing to work
		page.domNode.style.display="";
		if(this.doLayout && page.resize){
			page.resize(this._containerContentBox || this._contentBox);
		}
	},

	_hideChild: function(/*Widget*/ page){
		page.selected=false;
		page.domNode.style.display="none";
	},

	closeChild: function(/*Widget*/ page){
		// summary
		//	callback when user clicks the [X] to remove a page
		//	if onClose() returns true then remove and destroy the childd
		var remove = page.onClose(this, page);
		if(remove){
			this.removeChild(page);
			// makes sure we can clean up executeScripts in ContentPane onUnLoad
			page.destroy();
		}
	},

	destroy: function(){
		this._beingDestroyed = true;
		dijit.layout.StackContainer.superclass.destroy.apply(this, arguments);
	}
});


dojo.declare(
	"dijit.layout.StackController",
	[dijit._Widget, dijit._Templated, dijit._Container],
	{
		// summary
		//	Set of buttons to select a page in a page list.
		//	Monitors the specified StackContainer, and whenever a page is
		//	added, deleted, or selected, updates itself accordingly.

		templateString: "<span wairole='tablist' dojoAttachEvent='onkeypress' class='dijitStackController'></span>",

		// containerId: String
		//	the id of the page container that I point to
		containerId: "",

		// buttonWidget: String
		//	the name of the button widget to create to correspond to each page
		buttonWidget: "dijit.layout._StackButton",

		// childInTabOrder: Widget
		//  the only child button widget in the tab order
		childInTabOrder: undefined,

		postCreate: function(){
			dijit.util.wai.setAttr(this.domNode, "waiRole", "role", "tablist");

			this.pane2button = {};		// mapping from panes to buttons
			this._subscriptions=[
				dojo.subscribe(this.containerId+"-startup", this, "onStartup"),
				dojo.subscribe(this.containerId+"-addChild", this, "onAddChild"),
				dojo.subscribe(this.containerId+"-removeChild", this, "onRemoveChild"),
				dojo.subscribe(this.containerId+"-selectChild", this, "onSelectChild")
			];
		},

		onStartup: function(/*Object*/ info){
			// summary: called after StackContainer has finished initializing
			dojo.forEach(info.children, this.onAddChild, this);
			this.onSelectChild(info.selected);
		},

		destroy: function(){
			dojo.forEach(this._subscriptions, dojo.unsubscribe);
			dijit.layout.StackController.superclass.destroy.apply(this, arguments);
		},

		onAddChild: function(/*Widget*/ page){
			// summary
			//   Called whenever a page is added to the container.
			//   Create button corresponding to the page.

			// add a node that will be promoted to the button widget
			var refNode = document.createElement("span");
			this.domNode.appendChild(refNode);
			// create an instance of the button widget
			var cls = dojo.getObject(this.buttonWidget);
			var button = new cls({label: page.title, closeButton: page.closable}, refNode);
			this.addChild(button);
			this.pane2button[page] = button;
			page.controlButton = button;	// this value might be overwritten if two tabs point to same container

			var _this = this;
			dojo.connect(button, "onClick", function(){ _this.onButtonClick(page); });
			dojo.connect(button, "onClickCloseButton", function(){ _this.onCloseButtonClick(page); });
			if(!this.childInTabOrder){ // put the first child into the tab order
				button.focusNode.setAttribute("tabIndex","0");
				this.childInTabOrder = button;
			}
		},

		onRemoveChild: function(/*Widget*/ page){
			// summary
			//   Called whenever a page is removed from the container.
			//   Remove the button corresponding to the page.
			if(this._currentChild === page){ this._currentChild = null; }
			var button = this.pane2button[page];
			if(button){
				// TODO? if (button == this.childInTabOrder){ reassign }
				button.destroy();
			}
			this.pane2button[page] = null;
		},

		onSelectChild: function(/*Widget*/ page){
			// Summary
			//	Called when a page has been selected in the StackContainer, either by me or by another StackController

			if(!page){ return; }

			if(this._currentChild){
				var oldButton=this.pane2button[this._currentChild];
				oldButton.setSelected(false);
				oldButton.focusNode.setAttribute("tabIndex", "-1");
			}

			var newButton=this.pane2button[page];
			newButton.setSelected(true);
			this._currentChild = page;
			newButton.focusNode.setAttribute("tabIndex", "0");
		},

		onButtonClick: function(/*Widget*/ page){
			// summary
			//   Called whenever one of my child buttons is pressed in an attempt to select a page
			var container = dijit.byId(this.containerId);	// TODO: do this via topics?
			container.selectChild(page);
		},

		onCloseButtonClick: function(/*Widget*/ page){
			// summary
			//   Called whenever one of my child buttons [X] is pressed in an attempt to close a page
			var container = dijit.byId(this.containerId);
			container.closeChild(page);
			var b = this.pane2button[this._currentChild];
			(b.focusNode || b.domNode).focus();
		},

		onkeypress: function(/*Event*/ evt){
			// summary:
			//   Handle keystrokes on the page list, for advancing to next/previous button
			//   and closing the current page.

			if(this.disabled || evt.altKey || evt.shiftKey || evt.ctrlKey){ return; }
			var forward = true;
			switch(evt.keyCode){				
				case dojo.keys.LEFT_ARROW:
				case dojo.keys.UP_ARROW:
					forward=false;
					// fall through
				case dojo.keys.RIGHT_ARROW:
				case dojo.keys.DOWN_ARROW:
					// find currently focused button in children array
					var children = this.getChildren();
					var current = dojo.indexOf(children, this.pane2button[this._currentChild]);
					// pick next button to focus on
					var offset = forward ? 1 : children.length - 1;
					var next = children[ (current + offset) % children.length ];
					dojo.stopEvent(evt);
					next.onClick();
					break;
				case dojo.keys.DELETE:
					if (this._currentChild.closable){
						this.onCloseButtonClick(this._currentChild);
						dojo.stopEvent(evt); // so we don't close a browser tab!
					}
				default:
					return;
			}
		}
	}
);

dojo.declare(
	"dijit.layout._StackButton",
	dijit.form.ToggleButton,
{
	// summary
	//	Internal widget used by StackContainer.
	//	The button-like or tab-like object you click to select or delete a page

	onClick: function(/*Event*/ evt) {
		if(this.focusNode){ this.focusNode.focus(); }
		// ... now let StackController catch the event and tell me what to do
	},

	onClickCloseButton: function(/*Event*/ evt){
		// summary
		//	StackContainer connects to this function; if your widget contains a close button
		//	then clicking it should call this function.
		evt.stopPropagation();
	}
});

// These arguments can be specified for the children of a StackContainer.
// Since any widget can be specified as a StackContainer child, mix them
// into the base widget class.  (This is a hack, but it's effective.)
dojo.extend(dijit._Widget, {
	// title: String
	//		Title of this widget.  Used by TabContainer to the name the tab, etc.
	title: "",

	// selected: Boolean
	//		Is this child currently selected?
	selected: false,

	// closable: Boolean
	//		True if user can close (destroy) this child, such as (for example) clicking the X on the tab.
	closable: false,	// true if user can close this tab pane

	onClose: function(){
		// summary: Callback if someone tries to close the child, child will be closed if func returns true
		return true;
	}
});

}

if(!dojo._hasResource["dijit.layout.AccordionContainer"]){
dojo._hasResource["dijit.layout.AccordionContainer"] = true;
dojo.provide("dijit.layout.AccordionContainer");





dojo.declare(
	"dijit.layout.AccordionContainer",
	dijit.layout.StackContainer,
	{
		// summary: 
		//		Holds a set of panes where every pane's title is visible, but only one pane's content is visible at a time,
		//		and switching between panes is visualized by sliding the other panes up/down.
		// usage:
		// 	<div dojoType="dijit.layout.AccordionContainer">
		// 		<div dojoType="dijit.layout.AccordionPane" title="pane 1">
		// 			<div dojoType="dijit.layout.ContentPane">...</div>
		//  	</div>
		// 		<div dojoType="dijit.layout.AccordionPane" title="pane 2">
		//			<p>This is some text</p>
		// 		...
		// 	</div>

		// duration: Integer
		//		Amount of time (in ms) it takes to slide panes
		duration: 250,

		_verticalSpace: 0,

		startup: function(){
			dijit.layout.StackContainer.prototype.startup.apply(this, arguments);
			if(this.selectedChildWidget){
				var style = this.selectedChildWidget.containerNode.style;
				style.display = "";
				style.overflow = "auto";
				this.selectedChildWidget._setSelectedState(true);
			}else{
				this.getChildren()[0].focusNode.setAttribute("tabIndex","0");
			}
		},

		layout: function(){
			// summary
			//		Set the height of the open pane based on what room remains
			// get cumulative height of all the title bars, and figure out which pane is open
			var totalCollapsedHeight = 0;
			var openPane = this.selectedChildWidget;
			dojo.forEach(this.getChildren(), function(child){
				totalCollapsedHeight += child.getTitleHeight();
			});
			var mySize = this._contentBox;
			this._verticalSpace = (mySize.h - totalCollapsedHeight);
			if(openPane){
				openPane.containerNode.style.height = this._verticalSpace + "px";
				if(openPane.resize){
					openPane.resize({h: this.verticalSpace});
				}
			}
		},

		_setupChild: function(/*Widget*/ page){
			// Summary: prepare the given child
			return page;
		},

		_transition: function(/*Widget?*/newWidget, /*Widget?*/oldWidget){
//TODO: should be able to replace this with calls to slideIn/slideOut
			var animations = [];
			var paneHeight = this._verticalSpace;
			if(newWidget){
				newWidget.setSelected(true);
				var newContents = newWidget.containerNode;
				newContents.style.display = "";
				dojo.forEach(newWidget.getChildren(), function(widget){
					if(widget.resize){
						widget.resize({h: paneHeight});
					}
				});

				animations.push(dojo.animateProperty({ 
					node: newContents, 
					duration: this.duration,
					properties: {
						height: { start: "1", end: paneHeight }
					},
					onEnd: function(){
						newContents.style.overflow = "auto";
					}
				}));
			}
			if(oldWidget){
				oldWidget.setSelected(false);
				var oldContents = oldWidget.containerNode;
				oldContents.style.overflow = "hidden";
				animations.push(dojo.animateProperty({ 
					node: oldContents,
					duration: this.duration,
					properties: {
						height: { start: paneHeight, end: "1" } 
					},
					onEnd: function(){
						oldContents.style.display = "none";
					}
				}));
			}

			dojo.fx.combine(animations).play();
		},

		// note: we are treating the container as controller here
		processKey: function(/*Event*/ evt){
			if(this.disabled || evt.altKey || evt.shiftKey || evt.ctrlKey){ return; }
			var forward = true;
			switch(evt.keyCode){				
				case dojo.keys.LEFT_ARROW:
				case dojo.keys.UP_ARROW:
					forward=false;
				case dojo.keys.RIGHT_ARROW:
				case dojo.keys.DOWN_ARROW:
					// find currently focused button in children array
					var children = this.getChildren();
					var current = dojo.indexOf(children, evt._dijitWidget);
					// pick next button to focus on
					var offset = forward ? 1 : children.length - 1;
					var next = children[ (current + offset) % children.length ];
					dojo.stopEvent(evt);
					next._onTitleClick();
					break;
			default:
				return;
			}
		}
	}
);

dojo.declare(
	"dijit.layout.AccordionPane",
	[dijit.layout._LayoutWidget, dijit._Templated],
{
	// summary
	//		AccordionPane is a box with a title that contains another widget (often a ContentPane).
	//		It's a widget used internally by AccordionContainer.

	// title: String
	//		title to print on top of AccordionPane
	title: "",

	// selected: Boolean
	//	if true, this is the open pane
	selected: false,

	templateString:"<div class='dijitAccordionPane'\n\t><div dojoAttachPoint='titleNode;focusNode' dojoAttachEvent='onklick:_onTitleClick;onkeypress:_onKeyPress'\n\t\tclass='title' wairole=\"tab\"\n\t\t><div class='arrow'></div\n\t\t><div class='arrowTextUp' waiRole=\"presentation\">&#9650;&#9650;</div\n\t\t><div class='arrowTextDown' waiRole=\"presentation\">&#9660;&#9660;</div\n\t\t><span dojoAttachPoint='titleTextNode'>${title}</span></div\n\t><div><div dojoAttachPoint='containerNode' style='overflow: hidden; height: 1px; display: none'\n\t\tclass='body' waiRole=\"tabpanel\"\n\t></div></div>\n</div>\n",

	postCreate: function(){
		dijit.layout.AccordionPane.superclass.postCreate.apply(this, arguments);
		dojo.addClass(this.domNode, this["class"]);
		dojo.setSelectable(this.titleNode, false);
		this.setSelected(this.selected);
	},

	getTitleHeight: function(){
		// summary: returns the height of the title dom node
		return dojo.marginBox(this.titleNode).h;	// Integer
	},

	_onTitleClick: function(){
		// summary: callback when someone clicks my title
		var parent = this.getParent();
//		parent.selectChild(parent.selectedChildWidget == this ? null : this);
		parent.selectChild(this);
		this.focusNode.focus();
	},

	_onKeyPress: function(/*Event*/ evt){
		evt._dijitWidget = this;
		return this.getParent().processKey(evt);
	},
	
	_setSelectedState: function(/*Boolean*/ isSelected){
		this.selected = isSelected;
		(isSelected ? dojo.addClass : dojo.removeClass)(this.domNode, "dijitAccordionPane-selected");
		this.focusNode.setAttribute("tabIndex",(isSelected)? "0":"-1");
	},
	
	setSelected: function(/*Boolean*/ isSelected){
		// summary: change the selected state on this pane
		this._setSelectedState(isSelected);
		if(isSelected){ this.onSelected(); }
	},

	onSelected: function(){
		// summary: called when this pane is selected
	}
});

}

if(!dojo._hasResource["dijit.layout.LayoutContainer"]){
dojo._hasResource["dijit.layout.LayoutContainer"] = true;
dojo.provide("dijit.layout.LayoutContainer");



dojo.declare(
	"dijit.layout.LayoutContainer",
	dijit.layout._LayoutWidget,
{
	// summary
	//	Provides Delphi-style panel layout semantics.
	//
	// details
	//	A LayoutContainer is a box with a specified size (like style="width: 500px; height: 500px;"),
	//	that contains children widgets marked with "layoutAlign" of "left", "right", "bottom", "top", and "client".
	//	It takes it's children marked as left/top/bottom/right, and lays them out along the edges of the box,
	//	and then it takes the child marked "client" and puts it into the remaining space in the middle.
	//
	//  Left/right positioning is similar to CSS's "float: left" and "float: right",
	//	and top/bottom positioning would be similar to "float: top" and "float: bottom", if there were such
	//	CSS.
	//
	//	Note that there can only be one client element, but there can be multiple left, right, top,
	//	or bottom elements.
	//
	// usage
	//	<style>
	//		html, body{ height: 100%; width: 100%; }
	//	</style>
	//	<div dojoType="LayoutContainer" style="width: 100%; height: 100%">
	//		<div dojoType="ContentPane" layoutAlign="top">header text</div>
	//		<div dojoType="ContentPane" layoutAlign="left" style="width: 200px;">table of contents</div>
	//		<div dojoType="ContentPane" layoutAlign="client">client area</div>
	//	</div>
	//
	//	Lays out each child in the natural order the children occur in.
	//	Basically each child is laid out into the "remaining space", where "remaining space" is initially
	//	the content area of this widget, but is reduced to a smaller rectangle each time a child is added.
	//	

	layout: function(){
		var ok = dijit.layout.layoutChildren(this.domNode, this._contentBox, this.getChildren());
	},

	addChild: function(child, overrideContainerNode, pos, ref, insertIndex){
		dijit._Container.prototype.addChild.apply(this, arguments);
		dijit.layout.layoutChildren(this.domNode, this._contentBox, this.getChildren());
	},

	removeChild: function(pane){
        dijit._Container.prototype.removeChild.apply(this, arguments);
		dijit.layout.layoutChildren(this.domNode, this._contentBox, this.getChildren());
	}
});

// This argument can be specified for the children of a LayoutContainer.
// Since any widget can be specified as a LayoutContainer child, mix it
// into the base widget class.  (This is a hack, but it's effective.)
dojo.extend(dijit._Widget, {
	// layoutAlign: String
	//		"none", "left", "right", "bottom", "top", and "client".
	//		See the LayoutContainer description for details on this parameter.
	layoutAlign: 'none'
});

}

if(!dojo._hasResource["dijit.layout.LinkPane"]){
dojo._hasResource["dijit.layout.LinkPane"] = true;
dojo.provide("dijit.layout.LinkPane");




dojo.declare("dijit.layout.LinkPane",
	[dijit.layout.ContentPane, dijit._Templated],
{
	// summary
	//	LinkPane is just a ContentPane that loads data remotely (via the href attribute),
	//	and has markup similar to an anchor.  The anchor's body (the words between <a> and </a>)
	//	become the title of the widget (used for TabContainer, AccordionContainer, etc.)
	// usage
	//	<a href="foo.html">my title</a>

	// I'm using a template because the user may specify the input as
	// <a href="foo.html">title</a>, in which case we need to get rid of the
	// <a> because we don't want a link.
	templateString: '<div class="dijitLinkPane"></div>',

	postCreate: function(){

		// If user has specified node contents, they become the title
		// (the link must be plain text)
		this.title += this.domNode.innerHTML;

		dijit.layout.LinkPane.superclass.postCreate.apply(this, arguments);

	}
});

}

if(!dojo._hasResource["dojo.cookie"]){
dojo._hasResource["dojo.cookie"] = true;
dojo.provide("dojo.cookie");

dojo.cookie = function(/*String*/name, /*String?*/value, /*Object?*/props){
	//	summary: 
	//		Get or set a cookie.
	//
	// 		If you pass in one argument, the the value of the cookie is returned
	//
	// 		If you pass in two arguments, the cookie value is set to the second
	// 		argument.
	//
	// 		If you pass in three arguments, the cookie value is set to the
	// 		second argument, and the options on the third argument are used for
	// 		extended properties on the cookie
	//
	//	name: The name of the cookie
	//	value: Optional. The value for the cookie.
	//	props: 
	//		Optional additional properties for the cookie
	//       expires: Date or Number. Number is seen as days.
	//                If expires is in the past, the cookie will be deleted
	//                If expires is left out or is 0, the cookie will expire 
	//                when the browser closes.
	//       path: String. The path to use for the cookie.
	//       domain: String. The domain to use for the cookie.
	//       secure: Boolean. Whether to only send the cookie on secure connections
	var c = document.cookie;
	if(arguments.length == 1){
		var idx = c.lastIndexOf(name+'=');
		if(idx == -1){ return null; }
		var start = idx+name.length+1;
		var end = c.indexOf(';', idx+name.length+1);
		if(end == -1){ end = c.length; }
		return decodeURIComponent(c.substring(start, end)); 
	}else{
		props = props || {};
		value = encodeURIComponent(value);
		if(typeof(props.expires) == "number"){ 
			var d = new Date();
			d.setTime(d.getTime()+(props.expires*24*60*60*1000));
			props.expires = d;
		}
		document.cookie = name + "=" + value 
			+ (props.expires ? "; expires=" + props.expires.toUTCString() : "")
			+ (props.path ? "; path=" + props.path : "")
			+ (props.domain ? "; domain=" + props.domain : "")
			+ (props.secure ? "; secure" : "");
		return null;
	}
};

}

if(!dojo._hasResource["dijit.layout.SplitContainer"]){
dojo._hasResource["dijit.layout.SplitContainer"] = true;
dojo.provide("dijit.layout.SplitContainer");

//
// TODO
// make it prettier
// active dragging upwards doesn't always shift other bars (direction calculation is wrong in this case)
//




dojo.declare(
	"dijit.layout.SplitContainer",
	dijit.layout._LayoutWidget,
{
	// summary
	//		Contains multiple children widgets, all of which are displayed side by side
	//		(either horizontally or vertically); there's a bar between each of the children,
	//		and you can adjust the relative size of each child by dragging the bars.
	//
	//		You must specify a size (width and height) for the SplitContainer.

	// activeSizing: Boolean
	//		If true, the children's size changes as you drag the bar;
	//		otherwise, the sizes don't change until you drop the bar (by mouse-up)
	activeSizing: false,

	// sizerWidget: Integer
	//		Size in pixels of the bar between each child
	// TODO: this should be a CSS attribute
	sizerWidth: 15,

	// orientation: String
	//		either 'horizontal' or vertical; indicates whether the children are
	//		arranged side-by-side or up/down.
	orientation: 'horizontal',

	// persist: Boolean
	//		Save splitter positions in a cookie
	persist: true,

	postMixInProperties: function(){
		dijit.layout.SplitContainer.superclass.postMixInProperties.apply(this, arguments);
		this.isHorizontal = (this.orientation == 'horizontal');
	},

	postCreate: function(){
		dijit.layout.SplitContainer.superclass.postCreate.apply(this, arguments);
		this.sizers = [];
		dojo.addClass(this.domNode, "dijitSplitContainer");
		// overflow has to be explicitly hidden for splitContainers using gekko (trac #1435)
		// to keep other combined css classes from inadvertantly making the overflow visible
		if(dojo.isMozilla){
			this.domNode.style.overflow = '-moz-scrollbars-none'; // hidden doesn't work
		}

		// create the fake dragger
		if(typeof this.sizerWidth == "object"){
			try{
				this.sizerWidth = parseInt(this.sizerWidth.toString());
			}catch(e){ this.sizerWidth = 15; }
		}
		this.virtualSizer = document.createElement('div');
		this.virtualSizer.style.position = 'relative';

		// #1681: work around the dreaded 'quirky percentages in IE' layout bug
		// If the splitcontainer's dimensions are specified in percentages, it
		// will be resized when the virtualsizer is displayed in _showSizingLine
		// (typically expanding its bounds unnecessarily). This happens because
		// we use position: relative for .dijitSplitContainer.
		// The workaround: instead of changing the display style attribute,
		// switch to changing the zIndex (bring to front/move to back)

		this.virtualSizer.style.zIndex = 10;
		this.virtualSizer.className = this.isHorizontal ? 'dijitSplitContainerVirtualSizerH' : 'dijitSplitContainerVirtualSizerV';
		this.domNode.appendChild(this.virtualSizer);
		dojo.setSelectable(this.virtualSizer, false);

	},

	startup: function(){
		var children = this.getChildren();
		// attach the children and create the draggers
		for(var i = 0; i < children.length; i++){
			with(children[i].domNode.style){
				position = "absolute";
			}
			dojo.addClass(children[i].domNode, "dijitSplitPane");

			if(i == children.length-1){
				break;
			}
			this._addSizer();
		}

		if(this.persist){
			this._restoreState();
		}
		dijit.layout._LayoutWidget.prototype.startup.apply(this, arguments);
	},

	_injectChild: function(child){
		with(child.domNode.style){
			position = "absolute";
		}
		dojo.addClass(child.domNode, "dijitSplitPane");
	},

	_addSizer: function(){
		var i = this.sizers.length;

		// TODO: use a template for this!!!
		var sizer = this.sizers[i] = document.createElement('div');
		sizer.className = this.isHorizontal ? 'dijitSplitContainerSizerH' : 'dijitSplitContainerSizerV';

		// add the thumb div
		var thumb = document.createElement('div');
		thumb.className = 'thumb';
		sizer.appendChild(thumb);

		var self = this;
		var handler = (function(){ var sizer_i = i; return function(e){ self.beginSizing(e, sizer_i); } })();
		dojo.connect(sizer, "onmousedown", handler);

		this.domNode.appendChild(sizer);
		dojo.setSelectable(sizer, false);
	},

	removeChild: function(widget){
		// Remove sizer, but only if widget is really our child and
		// we have at least one sizer to throw away
		if(this.sizers.length > 0){
			var children = this.getChildren();
			for(var x = 0; x < children.length; x++){
				if(children[x] === widget){
					var i = this.sizers.length - 1;
					dojo._destroyElement(this.sizers[i]);
					this.sizers.length = i;
					break;
				}
			}
		}

		// Remove widget and repaint
		dijit._Container.prototype.removeChild.apply(this, arguments);
		this.layout();
   },

	addChild: function(child, insertIndex){
		dijit._Container.prototype.addChild.apply(this, arguments);
		this._injectChild(child);

		var children = this.getChildren();
		if(children.length > 1){
			this._addSizer();
		}
		this.layout();
	},

	layout: function(){
		// summary:
		//		Do layout of panels

		// base class defines this._contentBox on initial creation and also
		// on resize
		this.paneWidth = this._contentBox.w;
		this.paneHeight = this._contentBox.h;

		var children = this.getChildren();
		if(children.length == 0){ return; }

		//
		// calculate space
		//

		var space = this.isHorizontal ? this.paneWidth : this.paneHeight;
		if(children.length > 1){
			space -= this.sizerWidth * (children.length - 1);
		}

		//
		// calculate total of SizeShare values
		//
		var out_of = 0;
		for(var i=0; i<children.length; i++){
			out_of += children[i].sizeShare;
		}

		//
		// work out actual pixels per sizeshare unit
		//
		var pix_per_unit = space / out_of;


		//
		// set the SizeActual member of each pane
		//
		var total_size = 0;
		for(var i = 0; i< children.length-1; i++){
			var size = Math.round(pix_per_unit * children[i].sizeShare);
			children[i].sizeActual = size;
			total_size += size;
		}
		children[children.length-1].sizeActual = space - total_size;

		//
		// make sure the sizes are ok
		//
		this._checkSizes();

		//
		// now loop, positioning each pane and letting children resize themselves
		//

		var pos = 0;
		var size = children[0].sizeActual;
		this._movePanel(children[0], pos, size);
		children[0].position = pos;
		pos += size;

		// if we don't have any sizers, our layout method hasn't been called yet
		// so bail until we are called..TODO: REVISIT: need to change the startup
		// algorithm to guaranteed the ordering of calls to layout method
		if(!this.sizers)
			return;

		for(var i=1; i<children.length; i++){
			// error-checking
			if(!this.sizers[i-1])
				break;
			// first we position the sizing handle before this pane
			this._moveSlider(this.sizers[i-1], pos, this.sizerWidth);
			this.sizers[i-1].position = pos;
			pos += this.sizerWidth;

			size = children[i].sizeActual;
			this._movePanel(children[i], pos, size);
			children[i].position = pos;
			pos += size;
		}
	},

	_movePanel: function(panel, pos, size){
		if(this.isHorizontal){
			panel.domNode.style.left = pos + 'px';	// TODO: resize() takes l and t parameters too, don't need to set manually
			panel.domNode.style.top = 0;
			var box = {w: size, h: this.paneHeight};
			if(panel.resize){
				panel.resize(box);
			}else{
				dojo.marginBox(panel.domNode, box);
			}
		}else{
			panel.domNode.style.left = 0;	// TODO: resize() takes l and t parameters too, don't need to set manually
			panel.domNode.style.top = pos + 'px';
			var box = {w: this.paneWidth, h: size};
			if(panel.resize){
				panel.resize(box);
			}else{
				dojo.marginBox(panel.domNode, box);
			}
		}
	},

	_moveSlider: function(slider, pos, size){
		if(this.isHorizontal){
			slider.style.left = pos + 'px';
			slider.style.top = 0;
			dojo.marginBox(slider, { w: size, h: this.paneHeight });
		}else{
			slider.style.left = 0;
			slider.style.top = pos + 'px';
			dojo.marginBox(slider, { w: this.paneWidth, h: size });
		}
	},

	_growPane: function(growth, pane){
		if(growth > 0){
			if(pane.sizeActual > pane.sizeMin){
				if((pane.sizeActual - pane.sizeMin) > growth){

					// stick all the growth in this pane
					pane.sizeActual = pane.sizeActual - growth;
					growth = 0;
				}else{
					// put as much growth in here as we can
					growth -= pane.sizeActual - pane.sizeMin;
					pane.sizeActual = pane.sizeMin;
				}
			}
		}
		return growth;
	},

	_checkSizes: function(){

		var total_min_size = 0;
		var total_size = 0;
		var children = this.getChildren();

		for(var i=0; i<children.length; i++){
			total_size += children[i].sizeActual;
			total_min_size += children[i].sizeMin;
		}

		// only make adjustments if we have enough space for all the minimums

		if(total_min_size <= total_size){

			var growth = 0;

			for(var i=0; i<children.length; i++){

				if(children[i].sizeActual < children[i].sizeMin){

					growth += children[i].sizeMin - children[i].sizeActual;
					children[i].sizeActual = children[i].sizeMin;
				}
			}

			if(growth > 0){
				if(this.isDraggingLeft){
					for(var i=children.length-1; i>=0; i--){
						growth = this._growPane(growth, children[i]);
					}
				}else{
					for(var i=0; i<children.length; i++){
						growth = this._growPane(growth, children[i]);
					}
				}
			}
		}else{

			for(var i=0; i<children.length; i++){
				children[i].sizeActual = Math.round(total_size * (children[i].sizeMin / total_min_size));
			}
		}
	},

	beginSizing: function(e, i){
		var children = this.getChildren();
		this.paneBefore = children[i];
		this.paneAfter = children[i+1];

		this.isSizing = true;
		this.sizingSplitter = this.sizers[i];

		if(!this.cover){
			this.cover = dojo.doc.createElement('div');
			this.domNode.appendChild(this.cover);
			var s = this.cover.style;
			s.position='absolute';
			s.zIndex=1;
			s.top=0;
			s.left=0;
			s.width="100%";
			s.height="100%";
		}else{
			this.cover.style.zIndex=1;
		}
		this.sizingSplitter.style.zIndex=2;

		// TODO: REVISIT - we want MARGIN_BOX and core hasn't exposed that yet
		this.originPos = dojo.coords(children[0].domNode, true);
		if(this.isHorizontal){
			var client = (e.layerX ? e.layerX : e.offsetX);
			var screen = e.pageX;
			this.originPos = this.originPos.x;
		}else{
			var client = (e.layerY ? e.layerY : e.offsetY);
			var screen = e.pageY;
			this.originPos = this.originPos.y;
		}
		this.startPoint = this.lastPoint = screen;
		this.screenToClientOffset = screen - client;
		this.dragOffset = this.lastPoint - this.paneBefore.sizeActual - this.originPos - this.paneBefore.position;

		if(!this.activeSizing){
			this._showSizingLine();
		}

		//					
		// attach mouse events
		//
		this.connect(document.documentElement, "onmousemove", "changeSizing");
		this.connect(document.documentElement, "onmouseup", "endSizing");

		dojo.stopEvent(e);
	},

	changeSizing: function(e){
		if(!this.isSizing){ return; }
		this.lastPoint = this.isHorizontal ? e.pageX : e.pageY;
		if(this.activeSizing){
			this.movePoint();
			this._updateSize();
		}else{
			this.movePoint();
			this._moveSizingLine();
		}
		dojo.stopEvent(e);
	},

	endSizing: function(e){
		if(!this.isSizing){ return; }
		if(this.cover){
			this.cover.style.zIndex=-1;
		}
		if(!this.activeSizing){
			this._hideSizingLine();
		}

		this._updateSize();

		this.isSizing = false;

		if(this.persist){
			this._saveState(this);
		}
	},

	movePoint: function(){

		// make sure lastPoint is a legal point to drag to
		var p = this.lastPoint - this.screenToClientOffset;

		var a = p - this.dragOffset;
		a = this.legaliseSplitPoint(a);
		p = a + this.dragOffset;

		this.lastPoint = p + this.screenToClientOffset;
	},

	legaliseSplitPoint: function(a){

		a += this.sizingSplitter.position;

		this.isDraggingLeft = (a > 0) ? true : false;

		if(!this.activeSizing){

			if(a < this.paneBefore.position + this.paneBefore.sizeMin){

				a = this.paneBefore.position + this.paneBefore.sizeMin;
			}

			if(a > this.paneAfter.position + (this.paneAfter.sizeActual - (this.sizerWidth + this.paneAfter.sizeMin))){

				a = this.paneAfter.position + (this.paneAfter.sizeActual - (this.sizerWidth + this.paneAfter.sizeMin));
			}
		}

		a -= this.sizingSplitter.position;

		this._checkSizes();

		return a;
	},

	_updateSize: function(){
		var pos = this.lastPoint - this.dragOffset - this.originPos;

		var start_region = this.paneBefore.position;
		var end_region   = this.paneAfter.position + this.paneAfter.sizeActual;

		this.paneBefore.sizeActual = pos - start_region;
		this.paneAfter.position	= pos + this.sizerWidth;
		this.paneAfter.sizeActual  = end_region - this.paneAfter.position;

		var children = this.getChildren();
		for(var i=0; i<children.length; i++){

			children[i].sizeShare = children[i].sizeActual;
		}

		this.layout();
	},

	_showSizingLine: function(){

		this._moveSizingLine();

		if(this.isHorizontal){
			dojo.marginBox(this.virtualSizer, { w: this.sizerWidth, h: this.paneHeight });
		}else{
			dojo.marginBox(this.virtualSizer, { w: this.paneWidth, h: this.sizerWidth });
		}

		this.virtualSizer.style.display = 'block';
	},

	_hideSizingLine: function(){
		this.virtualSizer.style.display = 'none';
	},

	_moveSizingLine: function(){
		if(this.isHorizontal){
			var pos = this.lastPoint - this.startPoint + this.sizingSplitter.position;
			this.virtualSizer.style.left = pos + 'px';
		}else{
			var pos = (this.lastPoint - this.startPoint) + this.sizingSplitter.position;
			this.virtualSizer.style.top = pos + 'px';
		}
	},

	_getCookieName: function(i){
		return this.id + "_" + i;
	},

	_restoreState: function (){
		var children = this.getChildren();
		for(var i = 0; i < children.length; i++){
			var cookieName = this._getCookieName(i);
			var cookieValue = dojo.cookie(cookieName);
			if(cookieValue != null){
				var pos = parseInt(cookieValue);
				if(typeof pos == "number"){
					children[i].sizeShare=pos;
				}
			}
		}
	},

	_saveState: function (){
		var children = this.getChildren();
		for(var i = 0; i < children.length; i++){
			dojo.cookie(this._getCookieName(i), children[i].sizeShare);
		}
	}
});

// These arguments can be specified for the children of a SplitContainer.
// Since any widget can be specified as a SplitContainer child, mix them
// into the base widget class.  (This is a hack, but it's effective.)
dojo.extend(dijit._Widget, {
	// sizeMin: Integer
	//	Minimum size (width or height) of a child of a SplitContainer.
	//	The value is relative to other children's sizeShare properties.
	sizeMin: 10,

	// sizeShare: Integer
	//	Size (width or height) of a child of a SplitContainer.
	//	The value is relative to other children's sizeShare properties.
	//	For example, if there are two children and each has sizeShare=10, then
	//	each takes up 50% of the available space.
	sizeShare: 10
});

}

if(!dojo._hasResource["dijit.layout.TabContainer"]){
dojo._hasResource["dijit.layout.TabContainer"] = true;
dojo.provide("dijit.layout.TabContainer");




dojo.declare(
	"dijit.layout.TabContainer",
	[dijit.layout.StackContainer, dijit._Templated],
{
	// summary
	//	A TabContainer is a container that has multiple panes, but shows only
	//	one pane at a time.  There are a set of tabs corresponding to each pane,
	//	where each tab has the title (aka title) of the pane, and optionally a close button.
	//
	//	Publishes topics <widgetId>-addChild, <widgetId>-removeChild, and <widgetId>-selectChild
	//	(where <widgetId> is the id of the TabContainer itself.

	// tabPosition: String
	//   Defines where tabs go relative to tab content.
	//   "top", "bottom", "left-h", "right-h"
	tabPosition: "top",

	templateString: null,	// override setting in StackContainer
	templateString:"<div class=\"dijitTabContainer\">\n\t<div dojoAttachPoint=\"tablistNode\"></div>\n\t<div class=\"dijitTabPaneWrapper\" dojoAttachPoint=\"containerNode\" dojoAttachEvent=\"onkeypress:_onKeyPress\" waiRole=\"tabpanel\"></div>\n</div>\n",

	postCreate: function(){	
		dijit.layout.TabContainer.superclass.postCreate.apply(this, arguments);
		// create the tab list that will have a tab (a.k.a. tab button) for each tab panel
		this.tablist = new dijit.layout.TabController(
			{
				id: this.id + "_tablist",
				tabPosition: this.tabPosition,
				doLayout: this.doLayout,
				containerId: this.id
			}, this.tablistNode);		
	},

	_setupChild: function(tab){
		dojo.addClass(tab.domNode, "dijitTabPane");
		dijit.layout.TabContainer.superclass._setupChild.apply(this, arguments);
		return tab;
	},

	startup: function(){
		// wire up the tablist and its tabs
		this.tablist.startup();
		dijit.layout.TabContainer.superclass.startup.apply(this, arguments);
	},

	layout: function(){
		// Summary: Configure the content pane to take up all the space except for where the tabs are
		if(!this.doLayout){ return; }

		// position and size the titles and the container node
		var titleAlign=this.tabPosition.replace(/-h/,"");
		var children = [
			{domNode: this.tablist.domNode, layoutAlign: titleAlign},
			{domNode: this.containerNode, layoutAlign: "client"}
		];
		dijit.layout.layoutChildren(this.domNode, this._contentBox, children);

		// Compute size to make each of my children.
		// children[1] is the margin-box size of this.containerNode, set by layoutChildren() call above
		this._containerContentBox = dijit.layout.marginBox2contentBox(this.containerNode, children[1]);

		if(this.selectedChildWidget){
			this._showChild(this.selectedChildWidget);
		}
	},

	_onKeyPress: function(e){
		// summary
		//	Keystroke handling for keystrokes on the tab panel itself (that were bubbled up to me)
		//	Ctrl-w: close tab
		if((e.keyChar == "w") && e.ctrlKey){
			if (this.selectedChildWidget.closable){
				this.closeChild(this.selectedChildWidget);
				dojo.stopEvent(e);
			}
		}
	},

	destroy: function(){
		this.tablist.destroy();
		dijit.layout.TabContainer.superclass.destroy.apply(this, arguments);
	}
});

//TODO: make private?
dojo.declare(
    "dijit.layout.TabController",
    dijit.layout.StackController,
	{
		// summary
		// 	Set of tabs (the things with titles and a close button, that you click to show a tab panel).
		//	Lets the user select the currently shown pane in a TabContainer or StackContainer.
		//	TabController also monitors the TabContainer, and whenever a pane is
		//	added or deleted updates itself accordingly.

		templateString: "<div wairole='tablist' dojoAttachEvent='onkeypress:onkeypress'></div>",

		// tabPosition: String
		//   Defines where tabs go relative to the content.
		//   "top", "bottom", "left-h", "right-h"
		tabPosition: "top",

		doLayout: true,

		// buttonWidget: String
		//	the name of the tab widget to create to correspond to each page
		buttonWidget: "dijit.layout._TabButton",

		postMixInProperties: function(){
			this["class"] = "dijitTabLabels-" + this.tabPosition + (this.doLayout ? "" : " dijitTabNoLayout");
			dijit.layout.TabController.superclass.postMixInProperties.apply(this, arguments);
		}
	}
);

dojo.declare(
	"dijit.layout._TabButton", dijit.layout._StackButton,
{
	// summary
	//	A tab (the thing you click to select a pane).
	//	Contains the title of the pane, and optionally a close-button to destroy the pane.
	//	This is an internal widget and should not be instantiated directly.

	baseClass: "dijitTab",

	templateString: "<div baseClass='dijitTab' dojoAttachEvent='onclick:onClick; onmouseover:_onMouse; onmouseout:_onMouse'>"
						+"<div class='dijitTabInnerDiv' dojoAttachPoint='innerDiv'>"
							+"<span dojoAttachPoint='titleNode;focusNode' tabIndex='-1' waiRole='tab'>${label}</span>"
							+"<span dojoAttachPoint='closeButtonNode' class='closeImage'"
							+" dojoAttachEvent='onmouseover:_onMouse; onmouseout:_onMouse; onclick:onClickCloseButton'"
							+" baseClass='dijitTabCloseButton'>"
								+"<span dojoAttachPoint='closeText' class='closeText'>x</span>"
							+"</span>"
						+"</div>"
					+"</div>",

	postCreate: function(){
		if(!this.closeButton){
			this.closeButtonNode.style.display="none";
		}
		dijit.layout._TabButton.superclass.postCreate.apply(this, arguments);
		dojo.setSelectable(this.titleNode, false);
	}
});

}

if(!dojo._hasResource["dijit.dijit-all"]){
dojo._hasResource["dijit.dijit-all"] = true;
console.warn("dijit-all may include much more code than your application actually requires. We strongly recommend that you investigate a custom build or the web build tool");
dojo.provide("dijit.dijit-all");







































}

