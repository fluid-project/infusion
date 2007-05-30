/*
 Fluid Project

 Copyright (c) 2006, 2007 University of Toronto. All rights reserved.

 Licensed under the Educational Community License, Version 1.0 (the "License"); 
 you may not use this file except in compliance with the License. 
 You may obtain a copy of the License at 
 
 http://www.opensource.org/licenses/ecl1.php 
 
 Unless required by applicable law or agreed to in writing, software 
 distributed under the License is distributed on an "AS IS" BASIS, 
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 See the License for the specific language governing permissions and 
 limitations under the License.

 Adaptive Technology Resource Centre, University of Toronto
 130 St. George St., Toronto, Ontario, Canada
 Telephone: (416) 978-4360
*/


dojo.provide("fluid.Lightbox");

dojo.require("fluid.GridLayoutManager");
dojo.require("dijit.base.Widget");

(function() {
	fluid.states = {
		defaultClass:"image-container-default",
		focusedClass:"image-container-selected",
		draggingClass:"image-container-dragging"
	};		
})();

dojo.declare(
	"fluid.Lightbox",	// class name
	[dijit.base.Widget],
	{
		focusedNode: null,
		focusedNodeIndex: 0,
		debugMode: true,

		buildRendering: function(){
			// summary:
			//		Construct the UI for this widget, setting this.domNode.
			//		Most widgets will mixin TemplatedWidget, which overrides this method.
			this.domNode = dojo.byId("fluid-lightbox");
		},

		postCreate: function () {
			dojo.connect(this.domNode, "keypress", this, "handleArrowKeyPress");
			dojo.connect(this.domNode, "keydown", this, "handleKeyDown");
			dojo.connect(this.domNode, "keyup", this, "handleKeyUp");
			this.focus(this.domNode.firstChild);
		}, // end postCreate
				
		focus: function(/*node*/ aNode) {			
			// deselect any previously focused node
			if (this.focusedNode != null) {
				dojo.removeClass (this.focusedNode, fluid.states.focusedClass);
				dojo.addClass (this.focusedNode, fluid.states.defaultClass);
			}
						
			this.focusedNode = aNode;			
			
			dojo.removeClass (this.focusedNode, fluid.states.defaultClass);
			dojo.addClass (this.focusedNode, fluid.states.focusedClass); 
		}, //end focus
		
		handleKeyDown: function (/*event object*/ evt) {
			var key = evt.keyCode;
			if (key == dojo.keys.CTRL) {
				this._debugMessage("CTRL down");
				dojo.removeClass(this.focusedNode, fluid.states.focusedClass);
				dojo.addClass(this.focusedNode, fluid.states.draggingClass);
				dojo.stopEvent(evt);
			}
			else {
				
			}
		}, // end handleKeyDown
		
		handleKeyUp: function (/*event object*/ evt) {
			var key = evt.keyCode;
			if (key == dojo.keys.CTRL) {
				this._debugMessage("CTRL up");
				dojo.removeClass(this.focusedNode, fluid.states.draggingClass);
				dojo.addClass(this.focusedNode, fluid.states.focusedClass);
				dojo.stopEvent(evt);
			}
			else {
				
			}			
		}, // end handleKeyUp
		
		handleArrowKeyPress: function (/*event object*/ evt){
			switch (key = evt.keyCode) {
			case dojo.keys.DOWN_ARROW: {
				this._debugMessage("Down");
				dojo.stopEvent(evt);
				break;
			}
			case dojo.keys.UP_ARROW: {
				this._debugMessage("Up");
				dojo.stopEvent(evt);
				break;
			}
			case dojo.keys.LEFT_ARROW: {
				this._debugMessage("Left Arrow");
				this.handleLeftArrow(evt.ctrlKey);								
				
				dojo.stopEvent(evt);
				break;
			}
			case dojo.keys.RIGHT_ARROW: {
				this.handleRightArrow(evt.ctrlKey);								
				dojo.stopEvent(evt);
				break;
			}
			default: 
				this._debugMessage(key);
				break;
			}
		}, // end handleArrowKeyPress
		
		handleRightArrow: function(isCtrl) {
			if (isCtrl) {
				dojo.place(this.focusedNode,this.focusedNode.nextSibling,"after");
			} else {			
				// set focus to next to right sibling
				// if current focus image is the last, change focus to first thumbnail
				if (this.focusedNode.nextSibling) {					
					this.focus (this.focusedNode.nextSibling);					
				} else {
					this.focus (this.focusedNode.parentNode.firstChild);
				}
			}
		}, // end handleRightArrow
		
		handleLeftArrow: function(isCtrl) {
			if (isCtrl) {
				dojo.place(this.focusedNode,this.focusedNode.previousSibling,"before");
			} else {			
				// set focus to next to left sibling
				// if current focus image is the first, change focus to last thumbnail
				if (this.focusedNode.previousSibling) {					
					this.focus (this.focusedNode.previousSibling);					
				} else {
					this.focus (this.focusedNode.parentNode.lastChild);
				}
			}
		}, // end handleLeftArrow
		
		_debugMessage: function(message) {
			if (this.debugMode && dojo.byId("debugString"))
				dojo.byId("debugString").firstChild.nodeValue = message;
		} // end _debugMessage
	}
);

