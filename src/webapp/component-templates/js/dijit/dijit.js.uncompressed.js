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

dijit.util.manager = new function(){
	// summary
	//	manager class for the widgets.

	// registry of widgets
	var registry = {};

	var widgetTypeCtr = {};

	this.getUniqueId = function(/*String*/widgetType){
		// summary
		//	Generates a unique id for a given widgetType

		var widgetId;
		do{
			widgetId = widgetType + "_" +
				(widgetTypeCtr[widgetType] !== undefined ?
					++widgetTypeCtr[widgetType] : widgetTypeCtr[widgetType] = 0);
		}while(registry[widgetId]);
		return widgetId;
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

		delete registry.id;
	}

	this.destroyAll = function(){
		// summary
		//	Destroys all the widgets

		for(var id in registry){
			registry[id]._destroy();
		}
	}

	this.getWidgets = function(){
		// summary
		//	Returns the hash of id->widget
		return registry;
	}

	this.byNode = function(/* DOMNode */ node){
		// summary
		//	Returns the widget as referenced by node.?
		return registry[node.widgetId];
	}
};

dojo.addOnUnload(function(){
	dijit.util.manager.destroyAll();
});

dijit.byId = function(/*String*/id){
	// summary
	//	Returns a widget by its id
	return dijit.util.manager.getWidgets()[id];
};

dojo.provide("dijit.base.Widget");



dojo.declare("dijit.base.Widget", null,
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

	// for garbage collection
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
		this.domNode.widgetId = this.id;
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

		if(this.lang === ""){this.lang = null;}
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

	layout: function(){
		// summary:
		//		Called after a widget's children have created
		//		Provides an opportunity to manipulate any children before they are displayed
		//		This is useful for composite widgets that need to control or layout sub-widgets
		//		Many layout widgets can use this as a wiring phase
		
	},

	//////////// DESTROY FUNCTIONS ////////////////////////////////

	destroy: function(/*Boolean*/ finalize){
		// summary:
		// 		Destroy this widget and it's descendants. This is the generic
		// 		"destructor" function that all widget users should call to
		// 		cleanly discard with a widget. Once a widget is destroyed, it's
		// 		removed from the manager object.
		// finalize: Boolean
		//		is this function being called part of global environment
		//		tear-down?

		this.destroyDescendants();
		this._destroy();
	},
	
	_destroy: function(/*Boolean*/ finalize){
		// summary:
		// 		Destroy this widget, but not its descendents
		// finalize: Boolean
		//		is this function being called part of global environment
		//		tear-down?
		this.uninitialize();
		dojo.forEach(this._connects, dojo.disconnect);
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
			this.bgIframe.remove();
			delete this.bgIframe;
		}

//			dojo.dom.destroyNode(this.domNode);
//PORT #2931
		if(this.domNode.parentNode){
			this.domNode.parentNode.removeChild(this.domNode);
		}
		delete this.domNode;
		if(this.srcNodeRef && this.srcNodeRef.parentNode){
//			dojo.dom.destroyNode(this.srcNodeRef);
//PORT #2931
			this.srcNodeRef.parentNode.removeChild(this.srcNodeRef);
			delete this.srcNodeRef;
		}
	},

	destroyDescendants: function(){
		// summary:
		//		Recursively destroy the children of this widget and their
		//		descendents.
		dojo.forEach(this.getDescendants(), function(widget){
			widget._destroy();
		});
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
		var allNodes = this.domNode.all || this.domNode.getElementsByTagName("*");
		var i=0, node;
		var nodes = [];
		while((node = allNodes[i++])){
			var id = node.widgetId;
			if(id){
				nodes.push(dijit.byId(id));
			}
		}
		return nodes;
	},

	connect: function(
			/*Object|null*/ obj, 
			/*String*/ event, 
			/*String|Function*/ method){

		// summary:
		//		Connects specified obj/event to specified method of this object
		//		and registers for disconnect() on widget destroy.
		//		Similar to dojo.connect() but takes three arguments rather than four.
		this._connects.push(dojo.connect(obj, event, this, method));
	}
});

//PORT - where does this go?  dijit.util?  dojo.html?
dijit._disableSelection = function(/*DomNode*/element){
	// summary: disable selection on a node
	element = dojo.byId(element)||dojo.body();

	if(dojo.isMozilla){
		element.style.MozUserSelect = "none";
	}else if(dojo.isKhtml){
		element.style.KhtmlUserSelect = "none"; 
	}else if(dojo.isIE){
		element.unselectable = "on";
	}
	return false;
};

dojo.provide("dijit.base.Container");



dojo.declare("dijit.base.Contained",
	null,
	{
		// summary
		//		Mixin for widgets that are children of a container widget

		getParent: function(){
			// summary:
			//		returns parent widget
			for(var p=this.domNode.parentNode; p; p=p.parentNode){
				var widgetId = p.widgetId;
				if(widgetId){
					return dijit.byId(widgetId);
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
			var id = node.widgetId;
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

dojo.declare("dijit.base.Container", 
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
				dojo.place(widget.domNode, containerNode, "last");
			}else{
				dojo.place(widget.domNode, containerNode, insertIndex);
			}
		},

		removeChild: function(/*Widget*/ widget){
			// summary: 
			//		removes the passed widget instance from this widget but does
			//		not destroy it
			var node = widget.domNode;
			node.parentNode.removeChild(node); //PORT leak #2931 -- call widget.destroy() instead?
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

			var res = [];
			var cn = this.containerNode || this.domNode;
			var childNode = this._firstElement(cn);
			while(childNode){
				var tmp = dijit.byId(childNode.widgetId);
				if(tmp){
					res.push(tmp);
				}
				childNode = this._nextElement(childNode);
			}
			return res;
		},

		hasChildren: function(){
			// summary:
			//		returns true if widget has children
			var cn = this.containerNode || this.domNode;
			return !!this._firstElement(cn);
		}
	}
);

dojo.provide("dijit.base.Layout");



dojo.declare("dijit.base.Sizable", 
	null,
	{
		// summary
		//		Helper mixin for widgets that can have their size adjusted,
		//		and that need to do some processing when their size changes (like SplitContainer)

		resize: function(param){
			// summary:
			//		explicitly set this widget's size (in pixels).
			//		called if our parent is a layout widget.
			//	
			// param: Object
			//		{w: int, h: int}

			param =	dojo.marginBox(this.domNode, param);
			this.onResized(param);
		},
	
		onResized: function(param){
			//	summary
			//		Layout widgets will override this method to size & position their children
			//	
			// param: Object
			//		{w: int, h: int}
		},
		
		startup: function(){
			// summary:
			//		Called after all the widgets have been instantiated and their
			//		dom nodes have been inserted somewhere under document.body

			// if my parent is a layout container then it will resize me; just wait for it's call
			if(this.getParent){
				var parent = this.getParent();
				if(parent && parent.isLayoutContainer){
					return;
				}
			}

			// if my parent isn't a layout container, and my style is width=height=100% (or something similar),
			// then I need to watch when the window resizes, and size myself accordingly
			this.connect(window, 'onresize', "_onWindowResize");

			this._onWindowResize();
		},
		
		_onWindowResize: function(){
			// summary:
			//		Called when my size has been changed to an unknown value.
			//		If the size is explicitly changed by calling resize() this
			//		function is not called.
			// Size my children based on my size
			var size = dojo.marginBox(this.domNode);
			this.onResized(size);
		}
	}
);

dojo.declare("dijit.base.Layout", 
	[dijit.base.Container, dijit.base.Sizable],
	{
		// summary
		//		Mixin for widgets that contain a list of children like SplitContainer.
		//		Widgets which mixin this code must define onResized() to lay out the children

		isLayoutContainer: true
	}
);

dijit.base.Layout.layoutChildren = function(/*DomNode*/ container, /*Object[]*/ children, /*String*/ layoutPriority){
	/**
	 * summary
	 *		Layout a bunch of child dom nodes within a parent dom node
	 *		Returns true if successful, returns false if any of the children would 
	 * 		have been calculated to be hidden (typically if browser hasn't flowed the nodes)
	 *		In the latter case, a best-effort of the layout is done and the caller can
	 *		reschedule a layout at a later time - when the browser has more accurate metrics
	 * container:
	 *		parent node
	 * layoutPriority:
	 *		"top-bottom" or "left-right"
	 * children:
	 *		an array like [ {domNode: foo, layoutAlign: "bottom" }, {domNode: bar, layoutAlign: "client"} ]
	 */

	dojo.addClass(container, "dojoLayoutContainer");

	// Copy children array and remove elements w/out layout.
	// Also record each child's position in the input array, for sorting purposes.
	children = dojo.filter(children, function(child, idx){
		child.idx = idx;
		return dojo.indexOf(["top","bottom","left","right","client","flood"], child.layoutAlign) > -1;
	});

	// Order the children according to layoutPriority.
	// Multiple children w/the same layoutPriority will be sorted by their position in the input array.
	if(layoutPriority && layoutPriority!="none"){
		var rank = function(child){
			switch(child.layoutAlign){
				case "flood":
					return 1;
				case "left":
				case "right":
					return (layoutPriority=="left-right") ? 2 : 3;
				case "top":
				case "bottom":
					return (layoutPriority=="left-right") ? 3 : 2;
				default:
					return 4;
			}
		};
		children.sort(function(a,b){
			return (rank(a)-rank(b)) || (a.idx - b.idx);
		});
	}

	// REVISIT: we need getPixelValue to be public
	var _toPixelValue = function(element, value){
		// parseInt or parseFloat? (style values can be floats)
		return parseFloat(value) || 0; 
	}
	var px = _toPixelValue;
	
		// remaining space (blank area where nothing has been written)
		
	// contentBox gives you the whole box (l, t, w, h)
	f = dojo.contentBox(container);

	var ret = true;
	// set positions/sizes
	dojo.forEach(children, function(child){
		var elm=child.domNode;
		var pos=child.layoutAlign;
		// set elem to upper left corner of unused space; may move it later
		var elmStyle = elm.style;
		elmStyle.left = f.l+"px";
		elmStyle.top = f.t+"px";
		elmStyle.bottom = elmStyle.right = "auto";

		var capitalize = function(word){
			return word.substring(0,1).toUpperCase() + word.substring(1);
		};
		
		dojo.addClass(elm, "dojoAlign" + capitalize(pos));

		// set size && adjust record of remaining space.
		// note that setting the width of a <div> may affect it's height.
		// TODO: same is true for widgets but need to implement API to support that
		if (pos=="top" || pos=="bottom"){
			// marginBox will ignore f.w if it's <= 0
			dojo.marginBox(elm, { w: f.w });
			var h = dojo.marginBox(elm).h;
			f.h -= h;
			if(pos=="top"){
				f.t += h;
			}else{
				elmStyle.top = f.t + f.h + "px";
			}
			// TODO: for widgets I want to call resizeTo(), but I can't because
			// I only want to set the width, and have the height determined
			// dynamically.  (The thinner you make a div, the more height it consumes.)
			if(child.onResized){
				child.onResized();
			}
		}else if(pos=="left" || pos=="right"){
			var w = dojo.marginBox(elm).w;

			// TODO: I only want to set the height, not the width, but see bug#941 (FF),
			// and also the resizeTo() function demands both height and width arguments
			// place the child, make sure to filter for zero widths and height
			var hasZero = dijit.base.Layout._sizeChild(child, elm, w, f.h);
			if(hasZero){
				ret = false;
			}
			f.w -= w;
			if(pos=="left"){
				f.l += w;
			}else{
				elmStyle.left = f.l + f.w + "px";
			}
		} else if(pos=="flood" || pos=="client"){
			// #1635 - filter for zero dimensions (see below)
			var hasZero = dijit.base.Layout._sizeChild(child, elm, f.w, f.h);
			if(hasZero){
				ret = false;
			}
		}
	});
	return ret;
};

dijit.base.Layout._sizeChild = function (child, elm, w, h){
	// Note: zero dimensions can occur if we are called before the browser
	// don't allow such values for width and height, let the browser adjust the
	// layout itself when it reflows and report if any dimension is zero
	var box = {};
	var hasZero = (w == 0 || h == 0);
	if(!hasZero){
		if(w != 0){
			box.w = w;
		}
		if(h != 0){
			box.h = h;
		}
		if(child.resize){
			child.resize(box);
		}else{
			dojo.marginBox(elm, box);
		}
	}
	return hasZero;
}



dojo.provide("dijit.base.Showable");

//TODO: do we need this class at all?
dojo.declare("dijit.base.Showable", null,
{
	// Summary
	//		Mixin for widgets that show/hide themselves in a fancy way

	isShowing: function(){
		// summary
		//	Tests whether widget is set to show-mode or hide-mode (see show() and 
		//	hide() methods)
		//
		//	This function is poorly named.  Even if widget is in show-mode,
		//	if it's inside a container that's hidden
		//	(either a container widget, or just a domnode with display:none),
		//	then it won't be displayed
		return dojo.style(this.domNode, "display") != 'none';	// Boolean
	},

	toggleShowing: function(){
		// summary: show or hide the widget, to switch it's state
		if(this.isShowing()){
			this.hide();
		}else{
			this.show();
		}
	},

	show: function(){
		// summary: show the widget
		if(this.isShowing()){ return; }
		this.domNode.style.display = "";
		this.onShow();
	},

	onShow: function(){
		// summary: callback for when widget is shown
	},

	hide: function(){
		// summary: hide the widget (ending up with display:none)
		if(!this.isShowing()){ return; }
		this.domNode.style.display = "none";
		this.onHide();
	},
	
	onHide: function(){
		// summary: callback for when widget is hidden
	}
});

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
	}
};

dojo.provide("dijit.base.FormElement");




dojo.declare("dijit.base.FormElement", dijit.base.Widget,
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
		
	TODO:
		should this be a mixin or a base class?
		automatically add CSS tags for hover and focus like *class*Hover and *class*Focus (or maybe in FormElement)
	*/
	// baseClass: String
	//		Used to add CSS classes like FormElementDisabled
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
		var css = this.baseClass;
		if(css == ""){
			css = "dojo"+this.declaredClass.replace(/.*\./g,"");
		}
		if(disabled){
			dojo.addClass(this.domNode, css+"Disabled");
			dojo.removeClass(this.domNode, css+"Enabled");
		}else{
			dojo.addClass(this.domNode, css+"Enabled");
			dojo.removeClass(this.domNode, css+"Disabled");
		}
		this.domNode.disabled = this.disabled = disabled;
		dijit.util.wai.setAttr(this.domNode, "waiState", "disabled", disabled);
	},

	onValueChanged: function(newValue){
		// summary: callback when value is changed
	},
	
	postCreate: function(){
		this._setDisabled(this.disabled == true);
	},

	_lastValueReported: null,
	setValue: function(newValue){
		// summary: set the value of the widget.
		if(newValue != this._lastValueReported){
			dijit.util.wai.setAttr(this.domNode, "waiState", "valuenow", newValue);
			this.onValueChanged(newValue);
			this._lastValueReported = newValue;
		}
	},

	getValue: function(){
		// summary: get the value of the widget.
		return this._lastValueReported;
	}
});

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

	return template.replace(/\$\{([^\s\:\}]+)(?:\:(\S+))?\}/g, function(match, key, format){
		var value = dojo.getObject(key,false,map).toString();
		if(format){ value = dojo.getObject(format,false,thisObject)(value);}
		if(transform){ value = transform(value); }
		return value;
	}); // string
};

dojo.provide("dojo.date.stamp");

// Methods to convert dates to or from a wire (string) format using well-known conventions



/* ISO 8601 Functions
 *********************/

dojo.date.stamp.setIso8601 = function(/*Date*/dateObject, /*String*/formattedString){
	// summary: sets a Date object based on an ISO 8601 formatted string (uses date and time)
	var comps = (formattedString.indexOf("T") == -1) ? formattedString.split(" ") : formattedString.split("T");
	dateObject = dojo.date.stamp.setIso8601Date(dateObject, comps[0]);
	if(comps.length == 2){ dateObject = dojo.date.stamp.setIso8601Time(dateObject, comps[1]); }
	return dateObject; /* Date or null */
};

dojo.date.stamp.fromIso8601 = function(/*String*/formattedString){
	// summary: returns a Date object based on an ISO 8601 formatted string (uses date and time)
	return dojo.date.stamp.setIso8601(new Date(0, 0), formattedString);
};

dojo.date.stamp.setIso8601Date = function(/*String*/dateObject, /*String*/formattedString){
	// summary: sets a Date object based on an ISO 8601 formatted string (date only)
	var regexp = "^([0-9]{4})((-?([0-9]{2})(-?([0-9]{2}))?)|" +
			"(-?([0-9]{3}))|(-?W([0-9]{2})(-?([1-7]))?))?$";
	var d = formattedString.match(new RegExp(regexp));
	if(!d){
		console.debug("invalid date string: " + formattedString);
		return null; // null
	}
	var year = d[1];
	var month = d[4];
	var date = d[6];
	var dayofyear = d[8];
	var week = d[10];
	var dayofweek = d[12] || 1;

	dateObject.setFullYear(year);

	if(dayofyear){
		dateObject.setMonth(0);
		dateObject.setDate(Number(dayofyear));
	}
	else if(week){
		dateObject.setMonth(0);
		dateObject.setDate(1);
		var day = dateObject.getDay() || 7;
		var offset = Number(dayofweek) + (7 * Number(week));
	
		if(day <= 4){ dateObject.setDate(offset + 1 - day); }
		else{ dateObject.setDate(offset + 8 - day); }
	} else{
		if(month){
			dateObject.setDate(1);
			dateObject.setMonth(month - 1); 
		}
		if(date){ dateObject.setDate(date); }
	}

	return dateObject; // Date
};

dojo.date.stamp.fromIso8601Date = function(/*String*/formattedString){
	// summary: returns a Date object based on an ISO 8601 formatted string (date only)
	return dojo.date.stamp.setIso8601Date(new Date(0, 0), formattedString);
};

dojo.date.stamp.setIso8601Time = function(/*Date*/dateObject, /*String*/formattedString){
	// summary: sets a Date object based on an ISO 8601 formatted string (time only)

	// first strip timezone info from the end
	var timezone = "Z|(([-+])([0-9]{2})(:?([0-9]{2}))?)$";
	var d = formattedString.match(new RegExp(timezone));

	var offset = 0; // local time if no tz info
	if(d){
		if(d[0] != 'Z'){
			offset = (Number(d[3]) * 60) + Number(d[5] || 0);
			if(d[2] != '-'){ offset *= -1; }
		}
		offset -= dateObject.getTimezoneOffset();
		formattedString = formattedString.substr(0, formattedString.length - d[0].length);
	}

	// then work out the time
	var regexp = "^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(\.([0-9]+))?)?)?$";
	d = formattedString.match(new RegExp(regexp));
	if(!d){
		console.debug("invalid time string: " + formattedString);
		return null; // null
	}
	var hours = d[1];
	var mins = Number(d[3] || 0);
	var secs = d[5] || 0;
	var ms = d[7] ? (Number("0." + d[7]) * 1000) : 0;

	dateObject.setHours(hours);
	dateObject.setMinutes(mins);
	dateObject.setSeconds(secs);
	dateObject.setMilliseconds(ms);

	if(offset !== 0){
		dateObject.setTime(dateObject.getTime() + offset * 60000);
	}	
	return dateObject; // Date
};

dojo.date.stamp.fromIso8601Time = function(/*String*/formattedString){
	// summary: returns a Date object based on an ISO 8601 formatted string (date only)
	return dojo.date.stamp.setIso8601Time(new Date(0, 0), formattedString);
};


/* RFC-3339 Date Functions
 *************************/

dojo.date.stamp.toRfc3339 = function(/*Date?*/dateObject, /*String?*/selector){
//	summary:
//		Format a JavaScript Date object as a string according to RFC 3339
//
//	dateObject:
//		A JavaScript date, or the current date and time, by default
//
//	selector:
//		"date" or "time" to format selected portions of the Date object.
//		Date and time will be formatted by default.

//FIXME: tolerate Number, string input?
	if(!dateObject){
		dateObject = new Date();
	}

	var _ = dojo.string.pad;
	var formattedDate = [];
	if(selector != "time"){
		var date = [_(dateObject.getFullYear(),4), _(dateObject.getMonth()+1,2), _(dateObject.getDate(),2)].join('-');
		formattedDate.push(date);
	}
	if(selector != "date"){
		var time = [_(dateObject.getHours(),2), _(dateObject.getMinutes(),2), _(dateObject.getSeconds(),2)].join(':');
		var timezoneOffset = dateObject.getTimezoneOffset();
		time += (timezoneOffset > 0 ? "-" : "+") + 
					_(Math.floor(Math.abs(timezoneOffset)/60),2) + ":" +
					_(Math.abs(timezoneOffset)%60,2);
		formattedDate.push(time);
	}
	return formattedDate.join('T'); // String
};

dojo.date.stamp.fromRfc3339 = function(/*String*/rfcDate){
//	summary:
//		Create a JavaScript Date object from a string formatted according to RFC 3339
//
//	rfcDate:
//		A string such as 2005-06-30T08:05:00-07:00
//		"any" is also supported in place of a time.

	// backwards compatible support for use of "any" instead of just not 
	// including the time
	rfcDate = rfcDate.replace("Tany","");
	return dojo.date.stamp.setIso8601(new Date(), rfcDate); // Date or null
};

dojo.provide("dijit.util.parser");




dijit.util.parser = new function(){

	function val2type(/*Object*/ value){
		// summary:
		//	Returns name of type of given value.

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
		// summary
		//	Convert given string value to given type
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
						value = dijit.util.parser._nameAnonFunc(new Function(value), this);
					}
					return dojo.getObject(value, false);
				}catch(e){ return new Function(); }
			case "array":
				return value.split(";");
			case "date":
				return dojo.date.stamp.fromRfc3339(value);
			case "url":
//PORT FIXME: is value absolute or relative?  Need to join with "/"?
				return dojo.baseUrl + value;
			default:
				try{ eval("var tmp = "+value); return tmp; }
				catch(e){ return value; }
		}
	}

	var widgetClasses = {
		// map from fully qualified name (like "dijit.Button") to structure like
		// { cls: dijit.Button, params: {caption: "string", disabled: "boolean"} }
	};
	
	function getWidgetClassInfo(/*String*/ className){
		// className:
		//	fully qualified name (like "dijit.Button")
		// returns:
		//	structure like
		//	{ cls: dijit.Button, params: {caption: "string", disabled: "boolean"} }

		if(!widgetClasses[className]){
			// get pointer to widget class
			var cls = dojo.getObject(className);
			if(!dojo.isFunction(cls)){
				throw new Error("Could not load widget '" + className +
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

			widgetClasses[className] = { cls: cls, params: params };
		}
		return widgetClasses[className];
	}
	
	this.instantiate = function(nodes){
		// summary:
		//	Takes array of nodes, and turns them into widgets
		//	Calls their layout method to allow them to connect with any children		
		var thelist = [];
		dojo.forEach(nodes, function(node){
			if(!node){ return; }
			var type = node.getAttribute('dojoType');
			var clsInfo = getWidgetClassInfo(type);
			var params = {};
			for(var attrName in clsInfo.params){
				var attrValue = node.getAttribute(attrName);
				if(attrValue != null){
					var attrType = clsInfo.params[attrName];
					params[attrName] = str2obj(attrValue, attrType);
				}
			}
			thelist.push(new clsInfo.cls(params, node));
		});

		// first sort the widgets so that we can do a top-down wiring phase
		thelist.sort(function(a,b){
			// prefer containers to leaf nodes; keep in document order otherwise
			return (b.getParent && !a.getParent)?1:0;
		});

		// now call layout method on each widget so they can wire up their children
		dojo.forEach(thelist, function(node){
			if(node && node.layout){ node.layout(); }
		});
		return thelist;
	};

	this.parse = function(/*DomNode?*/ rootNode){
		// Summary
		//		Search specified node (or root node) recursively for widgets, and instantiate them
		//		Searches for dojoType="qualified.class.name"
		var list = dojo.query('[dojoType]', rootNode);
		return this.instantiate(list);
	};
}();

dojo.addOnLoad(function(){ dijit.util.parser.parse(); });

//TODO: ported from 0.4.x Dojo.  Can we reduce this?
dijit.util.parser._anonCtr = 0;
dijit.util.parser._anon = {}; // why is this property required?
dijit.util.parser._nameAnonFunc = function(/*Function*/anonFuncPtr, /*Object*/thisObj, /*Boolean*/searchForNames){
	// summary:
	//		Creates a reference to anonFuncPtr in thisObj with a completely
	//		unique name. The new name is returned as a String.  If
	//		searchForNames is true, an effort will be made to locate an
	//		existing reference to anonFuncPtr in thisObj, and if one is found,
	//		the existing name will be returned instead. The default is for
	//		searchForNames to be false.
	var isIE = dojo.isIE;
	var jpn = "$joinpoint";
	var nso = (thisObj|| dijit.util.parser._anon);
	if(isIE){
		var cn = anonFuncPtr["__dojoNameCache"];
		if(cn && nso[cn] === anonFuncPtr){
			return anonFuncPtr["__dojoNameCache"];
		}else if(cn){
			// hack to see if we've been event-system mangled
			var tindex = cn.indexOf(jpn);
			if(tindex != -1){
				return cn.substring(0, tindex);
			}
		}
	}
	if( (searchForNames) ||
		((dojo.global["djConfig"])&&(djConfig["slowAnonFuncLookups"] == true)) ){
		for(var x in nso){
			if(nso[x] === anonFuncPtr){
				if(isIE){
					anonFuncPtr["__dojoNameCache"] = x;
					// hack to see if we've been event-system mangled
					var tindex = x.indexOf(jpn);
					if(tindex != -1){
						x = x.substring(0, tindex);
					}
				}
				return x;
			}
		}
	}
	var ret = "__"+dijit.util.parser._anonCtr++;
	while(typeof nso[ret] != "undefined"){
		ret = "__"+dijit.util.parser._anonCtr++;
	}
	nso[ret] = anonFuncPtr;
	return ret; // String
}

dojo.provide("dijit.base.TemplatedWidget");




dojo.declare("dijit.base.TemplatedWidget", 
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
		// TODO: unsupported; need to copy over code from trunk
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

			var cached = dijit.base.getCachedTemplate(this.templatePath, this.templateString);

			var node;
			if(dojo.isString(cached)){
				// construct table for property replacement
				var hash = this.strings || {};
				for(var key in dijit.base.defaultStrings){
					if(typeof hash[key] == "undefined"){
						hash[key] = dijit.base.defaultStrings[key];
					}
				}

				// Cache contains a string because we need to do property replacement
				var tstr = cached;

				// do the property replacement
				var _this = this;
				tstr = tstr.replace(/\$\{([^\}]+)\}/g, function(match, key){
				//TODO: use dojo.string.substitute
					var value = (key.substring(0, 5) == "this.") ? dojo.getObject(key.substring(5), false, _this) : hash[key];
					if(value){
						// Safer substitution, see heading "Attribute values" in  
						// http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.3.2
						return value.toString().replace(/"/g,"&quot;");
					}
				});

				node = dijit.base._createNodesFromText(tstr)[0];
			}else{
				// if it's a node, all we have to do is clone it
				node = cached.cloneNode(true);
			}

			// recurse through the node, looking for, and attaching to, our
			// attachment points which should be defined on the template node.
			this._attachTemplateNodes(node);

			if(this.srcNodeRef){
				dojo.style(node, "cssText", this.srcNodeRef.style.cssText);
				node.className += " " + this.srcNodeRef.className;
			}

			this.domNode = node;
			if(this.srcNodeRef && this.srcNodeRef.parentNode){
				this.srcNodeRef.parentNode.replaceChild(this.domNode, this.srcNodeRef);
			}
			if(this.widgetsInTemplate){
				var childWidgets=dijit.util.parser.parse(this.domNode);
				this._attachTemplateNodes(childWidgets, function(n,p){
					return n[p];
				});
			}

			// relocate source contents to templated container node
			// this.containerNode must be able to receive children, or exceptions will be thrown
			if(this.srcNodeRef && this.srcNodeRef.hasChildNodes()){
				var dest = this.containerNode||this.domNode;
				while(this.srcNodeRef.hasChildNodes()){
					dest.appendChild(this.srcNodeRef.firstChild);
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
					return;
				}
				// Process dojoAttachPoint
				var tmpAttachPoint = getAttrFunc(baseNode, "dojoAttachPoint");
				if(tmpAttachPoint){
					var attachPoint = tmpAttachPoint.split(";");
					var z=0,ap;
					while(ap=attachPoint[z++]){
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
					var y=0,evt;
					while(evt=evts[y++]){
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
					var val = getAttrFunc(baseNode, wai.name);
					if(val){
						var role = "role";
						if(val.indexOf('-') != -1){ 
							// this is a state-value pair
							var statePair = val.split('-');
							role = statePair[0];
							val = statePair[1];
						}
						dijit.util.wai.setAttr(baseNode, wai.name, role, val);
					}
				}, this);
			}
		}
	}
);

dijit.base.defaultStrings = {
	// summary: a mapping of strings that are used in template variable replacement
	dojoRoot: dojo.baseUrl,
	dojoModuleUri: dojo.moduleUrl("dojo"),
	dijitModuleUri: dojo.moduleUrl("dijit"),	
	baseScriptUri: dojo.baseUrl
};

// key is either templatePath or templateString; object is either string or DOM tree
dijit.base._templateCache = {};

dijit.base.getCachedTemplate = function(templatePath, templateString){
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
	var tmplts = dijit.base._templateCache;
	var key = templateString || templatePath;
	var cached = tmplts[key];
	if(cached){
		return cached;
	}

	// If necessary, load template string from template path
	if(!templateString){
		templateString = dijit.base._sanitizeTemplateString(dojo._getText(templatePath));
	}

	if(templateString.match(/\$\{([^\}]+)\}/g)){
		// there are variables in the template so all we can do is cache the string
		return (tmplts[key] = templateString); //String
	}else{
		// there are no variables in the template so we can cache the DOM tree
		return (tmplts[key] = dijit.base._createNodesFromText(templateString)[0]); //Node
	}
};

dijit.base._sanitizeTemplateString = function(/*String*/tString){
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
		var cache = dijit.base._templateCache;
		for(var key in cache){
			var value = cache[key];
			if(!isNaN(value.nodeType)){ // isNode equivalent
// PORT.  Fix leak			dojo.dom.destroyNode(value);
			}
			cache[key] = null;
		}
	});
}

dijit.base._createNodesFromText = function(/*String*/text){
	//	summary
	//	Attempts to create a set of nodes based on the structure of the passed text.

	text = text.replace(/^\s+|\s+$/g, "");

	var tn = dojo.doc.createElement("div");
	tn.style.visibility="hidden";
	dojo.body().appendChild(tn);
	var tableType = "none";
	var tagMap = {
		cell: {re: /^<t[dh][\s\r\n>]/i, pre: "<table><tbody><tr>", post: "</tr></tbody></table>"},
		row: {re: /^<tr[\s\r\n>]/i, pre: "<table><tbody>", post: "</tbody></table>"},
		section: {re: /^<(thead|tbody|tfoot)[\s\r\n>]/i, pre: "<table>", post: "</table>"}
	};
	for(var type in tagMap){
		var map = tagMap[type];
		if(map.re.test(text.replace(/^\s+/))){ //FIXME: replace with one arg?  is this a no-op?
			tableType = type;
			text = map.pre + text + map.post;
			break;
		}
	}

	tn.innerHTML = text;
	if(tn.normalize){
		tn.normalize();
	}

	var tag = {cell: "tr", row: "tbody", section: "table"}[tableType];
	var parent = tn;
	if(typeof tag != "undefined"){
		parent = tn.getElementsByTagName(tag)[0];
	}

	var nodes = [];
	for(var x=0; x<parent.childNodes.length; x++){
		nodes.push(parent.childNodes[x].cloneNode(true));
	}
//PORT	dojo.html.destroyNode(tn); FIXME: need code to prevent leaks and such
	dojo.body().removeChild(tn);
	return nodes;	//	Array
}

// These arguments can be specified for widgets which are used in templates.
// Since any widget can be specified as sub widgets in template, mix it
// into the base widget class.  (This is a hack, but it's effective.)
dojo.extend(dijit.base.Widget,{
	dojoAttachEvent: "",
	dojoAttachPoint: "",
	waiRole: "",
	waiState:""
})

dojo.provide("dijit.util.FocusManager");

dijit.util.FocusManager = new function(){
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
			console.debug("focused on ", node ? (node.id ? node.id : node.tagName) : "nothing");
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

	// TODO: convert this to a stack, so we can save and restore multiple times?
	// or have save return an object that can be passed to restore?

	var currentMenu = null;	// current menu/dialog
	var closeOnScreenClick = false;	// should clicking the screen close the menu?
	var openedForWindow;	// iframe in which menu was opened
	var restoreFocus;		// focused node before menu opened
	var bookmark;			// selected text before menu opened

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

	this.save = function(/*Widget*/menu, /*Window*/ _openedForWindow){
		// summary:
		//	called when a popup appears (either a top level menu or a dialog),
		//	or when a toolbar/menubar receives focus
		if (menu == currentMenu){ return; }

		if (currentMenu){
			currentMenu.close();
		}

		currentMenu = menu;
		openedForWindow = _openedForWindow;

		//PORT #2804. Use isAncestor
		var isDescendantOf = function(/*Node*/node, /*Node*/ancestor){
			//	summary
			//	Returns boolean if node is a descendant of ancestor
			// guaranteeDescendant allows us to be a "true" isDescendantOf function

			while(node){
				if(node === ancestor){ 
					return true; // boolean
				}
				node = node.parentNode;
			}
			return false; // boolean
		};

		// Find node to restore focus to, when this menu/dialog closes
		restoreFocus = isDescendantOf(curFocus, menu.domNode) ? prevFocus : curFocus;
		console.debug("will restore focus to " + ( restoreFocus ? (restoreFocus.id || restoreFocus.tagName) : "nothing") );
		console.debug("prev focus is " + prevFocus);

		//Store the current selection and restore it before the action for a menu item
		//is executed. This is required as clicking on an menu item deselects current selection
		if(!dojo.withGlobal(openedForWindow||dojo.global, isCollapsed)){
			bookmark = dojo.withGlobal(openedForWindow||dojo.global, getBookmark);
		}else{
			bookmark = null;
		}
	};

	this.restore = function(/*Widget*/menu){
		// summary:
		//	notify the manager that menu is closed; it will return focus to
		//	where it was before the menu got focus
		if(currentMenu == menu){
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

			bookmark = null;
			closeOnScreenClick = false;
			currentMenu = null;
		}
	};
}();

dojo.provide("dijit.util.BackgroundIframe");

dijit.util.BackgroundIframe = function(/* HTMLElement */node){
	//	summary:
	//		For IE z-index schenanigans
	//		Two possible uses:
	//			1. new dijit.util.BackgroundIframe(node)
	//				Makes a background iframe as a child of node, that fills
	//				area (and position) of node
	//			2. new dijit.util.BackgroundIframe()
	//				Attaches frame to dojo.body().  User must call size() to
	//				set size.
	if(dojo.isIE && dojo.isIE < 7){
		var html="<iframe src='javascript:false'"
			+ " style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"
			+ "z-index: -1; filter:Alpha(Opacity=\"0\");'>";
		this.iframe = dojo.doc.createElement(html);
		this.iframe.tabIndex = -1; // Magic to prevent iframe from getting focus on tab keypress - as style didnt work.
		if(node){
			node.appendChild(this.iframe);
			this.domNode=node;
		}else{
			dojo.body().appendChild(this.iframe);
			this.iframe.style.display="none";
		}
	}
};

dojo.extend(dijit.util.BackgroundIframe, {
	iframe: null,
	onResized: function(){
		//	summary:
		//		Resize event handler.

		// TODO: this function shouldn't be necessary but setting
		// 			width=height=100% doesn't work!
		if(this.iframe && this.domNode && this.domNode.parentNode){ 
			// No parentElement if onResized() timeout event occurs on a removed domnode
			var outer = dojo.marginBox(this.domNode);
			if (!outer.w || !outer.h){
				setTimeout(this, this.onResized, 100);
				return;
			}
			this.iframe.style.width = outer.w + "px";
			this.iframe.style.height = outer.h + "px";
		}
	},

	size: function(/* HTMLElement */node){
		// summary:
		//		Call this function if the iframe is connected to dojo.body()
		//		rather than the node being shadowed 

		//	(TODO: erase)
		if(!this.iframe){ return; }
		var coords = dojo.coords(node, true); // PORT used BORDER_BOX
		var s = this.iframe.style;
		s.width = coords.w + "px";
		s.height = coords.h + "px";
		s.left = coords.x + "px";
		s.top = coords.y + "px";
	},

	setZIndex: function(/* HTMLElement|int */node){
		//	summary:
		//		Sets the z-index of the background iframe
		//	node:
		//		If an element, sets zIndex of iframe to zIndex of node minus one. 
		//		Otherwise, specifies the new zIndex as an integer.

		if(!this.iframe){ return; }

		this.iframe.style.zIndex = !isNaN(node) ? node : (node.style.zIndex - 1);
	},

	show: function(){
		//	summary:
		//		show the iframe
		if(this.iframe){ 
			this.iframe.style.display = "block";
		}
	},

	hide: function(){
		//	summary:
		//		hide the iframe
		if(this.iframe){ 
			this.iframe.style.display = "none";
		}
	},

	remove: function(){
		//	summary:
		//		remove the iframe
		if(this.iframe){
			this.iframe.parentNode.removeChild(this.iframe); // PORT: leak?
			delete this.iframe;
			this.iframe=null;
		}
	}
});

dojo.provide("dijit.util.place");

// ported from dojo.html.util

dijit.util.getViewport = function(){
	//	summary
	//	Returns the dimensions of the viewable area of a browser window
	var _window = dojo.global;
	var _document = dojo.doc;
	var w = 0;
	var h = 0;

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
	}else if(dojo.body().clientWidth){
		// IE, Opera
		w = dojo.body().clientWidth;
		h = dojo.body().clientHeight;
	}
	return { w: w, h: h };	//	object
};

dijit.util.getScroll = function(){
	//	summary
	//	Returns the scroll position of the document
	var _window = dojo.global;
	var _document = dojo.doc;
	var top = _window.pageYOffset || _document.documentElement.scrollTop || dojo.body().scrollTop || 0;
	var left = _window.pageXOffset || _document.documentElement.scrollLeft || dojo.body().scrollLeft || 0;
	return { 
		top: top,
		left: left, 
		offset:{ x: left, y: top }	//	note the change, NOT an Array with added properties. 
	};	//	object
};

dijit.util.placeOnScreen = function(
	/* HTMLElement */node,
	/* integer */desiredX,
	/* integer */desiredY,
	/* integer */padding,
	/* boolean? */hasScroll,
	/* string? */corners,
	/* boolean? */tryOnly){
	//	summary
	//	Keeps 'node' in the visible area of the screen while trying to
	//	place closest to desiredX, desiredY. The input coordinates are
	//	expected to be the desired screen position, not accounting for
	//	scrolling. If you already accounted for scrolling, set 'hasScroll'
	//	to true. Set padding to either a number or array for [paddingX, paddingY]
	//	to put some buffer around the element you want to position.
	//	Set which corner(s) you want to bind to, such as
	//
	//	placeOnScreen(node, desiredX, desiredY, padding, hasScroll, "TR")
	//	placeOnScreen(node, [desiredX, desiredY], padding, hasScroll, ["TR", "BL"])
	//
	//	The desiredX/desiredY will be treated as the topleft(TL)/topright(TR) or
	//	BottomLeft(BL)/BottomRight(BR) corner of the node. Each corner is tested
	//	and if a perfect match is found, it will be used. Otherwise, it goes through
	//	all of the specified corners, and choose the most appropriate one.
	//	By default, corner = ['TL'].
	//	If tryOnly is set to true, the node will not be moved to the place.
	//
	//	NOTE: node is assumed to be absolutely or relatively positioned.
	//
	//	Alternate call sig:
	//	 placeOnScreen(node, [x, y], padding, hasScroll)
	//
	//	Examples:
	//	 placeOnScreen(node, 100, 200)
	//	 placeOnScreen("myId", [800, 623], 5)
	//	 placeOnScreen(node, 234, 3284, [2, 5], true)

	// TODO: make this function have variable call sigs
	//	kes(node, ptArray, cornerArray, padding, hasScroll)
	//	kes(node, ptX, ptY, cornerA, cornerB, cornerC, paddingArray, hasScroll)
	if(desiredX instanceof Array || typeof desiredX == "array") {
		tryOnly = corners;
		corners = hasScroll;
		hasScroll = padding;
		padding = desiredY;
		desiredY = desiredX[1];
		desiredX = desiredX[0];
	}

	if(corners instanceof String || typeof corners == "string"){
		corners = corners.split(",");
	}

	if(!isNaN(padding)){
		padding = [Number(padding), Number(padding)];
	}else if(!(padding instanceof Array || typeof padding == "array")) {
		padding = [0, 0];
	}

	var scroll = dijit.util.getScroll().offset;
	var view = dijit.util.getViewport();

	node = dojo.byId(node);
	var oldDisplay = node.style.display;
	node.style.display="";
//	var bb = dojo.html.getBorderBox(node);
	var bb = dojo.marginBox(node); //PORT okay?
	var w = bb.w;
	var h = bb.h;
	node.style.display=oldDisplay;

	if(!(corners instanceof Array || typeof corners == "array")){
		corners = ['TL'];
	}

	var bestx, besty, bestDistance = Infinity, bestCorner;

	for(var cidex=0; cidex<corners.length; ++cidex){
		var corner = corners[cidex];
		var match = true;
		var tryX = desiredX - (corner.charAt(1)=='L' ? 0 : w) + padding[0]*(corner.charAt(1)=='L' ? 1 : -1);
		var tryY = desiredY - (corner.charAt(0)=='T' ? 0 : h) + padding[1]*(corner.charAt(0)=='T' ? 1 : -1);
		if(hasScroll){
			tryX -= scroll.x;
			tryY -= scroll.y;
		}

		if(tryX < 0){
			tryX = 0;
			match = false;
		}

		if(tryY < 0){
			tryY = 0;
			match = false;
		}

		var x = tryX + w;
		if(x > view.w){
			x = view.w - w;
			match = false;
		}else{
			x = tryX;
		}
		x = Math.max(padding[0], x) + scroll.x;

		var y = tryY + h;
		if(y > view.h){
			y = view.h - h;
			match = false;
		}else{
			y = tryY;
		}
		y = Math.max(padding[1], y) + scroll.y;

		if(match){ //perfect match, return now
			bestx = x;
			besty = y;
			bestDistance = 0;
			bestCorner = corner;
			break;
		}else{
			//not perfect, find out whether it is better than the saved one
			var dist = Math.pow(x-tryX-scroll.x,2)+Math.pow(y-tryY-scroll.y,2);
			if(bestDistance > dist){
				bestDistance = dist;
				bestx = x;
				besty = y;
				bestCorner = corner;
			}
		}
	}

	if(!tryOnly){
		node.style.left = bestx + "px";
		node.style.top = besty + "px";
	}

	return {left: bestx, top: besty, x: bestx, y: besty, dist: bestDistance, corner:  bestCorner};	//	object
}

dijit.util.placeOnScreenAroundElement = function(
	/* HTMLElement */node,
	/* HTMLElement */aroundNode,
	/* integer */padding,
	/* string? */aroundCorners,
	/* boolean? */tryOnly){
	//	summary
	//	Like placeOnScreen, except it accepts aroundNode instead of x,y
	//	and attempts to place node around it.  Uses margin box dimensions.
	//
	//	aroundCorners
	//		specify Which corner of aroundNode should be
	//		used to place the node => which corner(s) of node to use (see the
	//		corners parameter in dijit.util.placeOnScreen)
	//		e.g. {'TL': 'BL', 'BL': 'TL'}

	var best, bestDistance=Infinity;
	aroundNode = dojo.byId(aroundNode);
	var oldDisplay = aroundNode.style.display;
	aroundNode.style.display="";
	var mb = dojo.marginBox(aroundNode);
	var aroundNodeW = mb.w;
	var aroundNodeH = mb.h;
	var aroundNodePos = dojo.coords(aroundNode, true);
	aroundNode.style.display=oldDisplay;

	for(var nodeCorner in aroundCorners){
		var pos, desiredX, desiredY;
		var corners = aroundCorners[nodeCorner];

		desiredX = aroundNodePos.x + (nodeCorner.charAt(1)=='L' ? 0 : aroundNodeW);
		desiredY = aroundNodePos.y + (nodeCorner.charAt(0)=='T' ? 0 : aroundNodeH);

		pos = dijit.util.placeOnScreen(node, desiredX, desiredY, padding, true, corners, true);
		if(pos.dist == 0){
			best = pos;
			break;
		}else{
			//not perfect, find out whether it is better than the saved one
			if(bestDistance > pos.dist){
				bestDistance = pos.dist;
				best = pos;
			}
		}
	}

	if(!tryOnly){
		node.style.left = best.left + "px";
		node.style.top = best.top + "px";
	}
	return best;	//	object
}

console.warn("dijit.dijit may dissapear in the 0.9 timeframe in lieu of a different rollup file!");
dojo.provide("dijit.dijit");













