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

//dojo.require("fluid.GridLayoutManager");
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
	dijit.base.Widget,
	{
		focusedNode: null,

		buildRendering: function() {
			// note: this should really be informed of the Id by the gallery, to be able
			// to handle multiple lightboxes
			this.domNode = dojo.byId("gallery:::gallery-thumbs:::");
		},

		postCreate: function () {
			dojo.connect(this.domNode, "keypress", this, "handleArrowKeyPress");
			dojo.connect(this.domNode, "keydown", this, "handleKeyDown");
			dojo.connect(this.domNode, "keyup", this, "handleKeyUp");
			dojo.connect(this.domNode, "onfocus", this, "selectFocusedNode");
		}, // end postCreate
				
		focusNode: function(aNode) {			
			// deselect any previously focused node
			if (this.focusedNode != null) {
				dojo.removeClass (this.focusedNode, fluid.states.focusedClass);
				dojo.addClass (this.focusedNode, fluid.states.defaultClass);
			}
						
			this.focusedNode = aNode;			
			
			dojo.removeClass (this.focusedNode, fluid.states.defaultClass);
			dojo.addClass (this.focusedNode, fluid.states.focusedClass); 
			this.focusedNode.getElementsByTagName("a")[0].focus();
		}, //end focus
		
		selectFocusedNode: function() {
			if (this.focusedNode == null) {
				this.focusedNode = this.firstElement(this.domNode);
			}
			this.focusNode(this.focusedNode);
		},
		
		handleKeyDown: function (evt) {
			var key = evt.keyCode;
			if (key == dojo.keys.CTRL) {
				dojo.removeClass(this.focusedNode, fluid.states.focusedClass);
				dojo.addClass(this.focusedNode, fluid.states.draggingClass);
				dojo.stopEvent(evt);
			}
		}, // end handleKeyDown
		
		handleKeyUp: function (evt) {
			var key = evt.keyCode;
			if (key == dojo.keys.CTRL) {
				dojo.removeClass(this.focusedNode, fluid.states.draggingClass);
				dojo.addClass(this.focusedNode, fluid.states.focusedClass);
				dojo.stopEvent(evt);
			}		
		}, // end handleKeyUp
		
		handleArrowKeyPress: function (evt){
			switch (key = evt.keyCode) {
			case dojo.keys.DOWN_ARROW: {
				dojo.stopEvent(evt);
				break;
			}
			case dojo.keys.UP_ARROW: {
				dojo.stopEvent(evt);
				break;
			}
			case dojo.keys.LEFT_ARROW: {
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
			}
		}, // end handleArrowKeyPress
		
		handleRightArrow: function(isCtrl) {
			var nextRightSibling = this.nextElement(this.focusedNode);
			var placementPosition;
			
			if (nextRightSibling) {
				placementPosition = "after";
			} else {
				// if current focus image is the last, change focus to first thumbnail
				nextRightSibling = this.firstElement(this.focusedNode.parentNode);
				placementPosition = "before";
			}
			
			this._changeFocusOrMove(isCtrl, nextRightSibling, placementPosition);
		}, // end handleRightArrow
		
		handleLeftArrow: function(isCtrl) {
			var nextLeftSibling = this.previousElement(this.focusedNode);
			var placementPosition;
			
			if (nextLeftSibling) {
				placementPosition = "before";
			} else {
				// if current focus image is the first, the next sibling is the last sibling
				nextLeftSibling = this.lastElement(this.focusedNode.parentNode);
				placementPosition = "after";
			}
			
			this._changeFocusOrMove(isCtrl, nextLeftSibling, placementPosition);
		}, // end handleLeftArrow
		
		_changeFocusOrMove: function(shouldMove, refSibling, placementPosition) {
			if (shouldMove) {
				dojo.place(this.focusedNode, refSibling, placementPosition);
				this.focusedNode.getElementsByTagName("a")[0].focus();
			} else {
				this.focusNode(refSibling);
			}		
		},
		
		nextElement: function(node) {
			while (node){
				node = node.nextSibling;
				if (this.isElement(node)) {
					return (node); 
				}
			}
			return node;
		}, // end nextElement
		
		previousElement: function(node) {
			while (node){
				node = node.previousSibling;
				if (this.isElement(node)) {
					return (node); 
				}
			}
			return node;
		}, // end previousElement
		
		firstElement: function(nodeParent) {
			var node = nodeParent.firstChild;
			
			if (this.isElement(node)) {
				return node;
			}
			
			return this.nextElement(node);
		},
		
		lastElement: function(nodeParent) {
			var node = nodeParent.lastChild;
			
			if (this.isElement(node)) {
				return node;
			}
			
			return this.previousElement(node);
		},
		
		isElement: function(node) {
			return node && node.nodeType == 1;
		}
	}
);

