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
		
		// the currently active item 
		activeItem: null,

		/**
		 * Return the first anchor tag in the specified item. This is done so that the user can use
		 * a keypress (i.e. Enter key) to activate the link.
		 * 
		 * In this Lightbox component this means that the image link is returned by this method,
		 * so the user can get the full-sized version of the image.
		 * 
		 * @param {Object} item
		 * @return {Object} The first "a" (anchor) element contained in the specified item.
		 */
		getElementToFocus: function(item) {
			// TODO: generalize this to return any specified element specified on construction of 
			// Lightbox
			return item.getElementsByTagName("a")[0];
		},


		buildRendering: function() {
			// note: this should really be informed of the Id by the gallery, to be able
			// to handle multiple lightboxes
			this.domNode = dojo.byId("gallery:::gallery-thumbs:::");
		},

		postCreate: function () {
			// Dojo calls this function after constructing the object.
			
			// Connect the listeners that handle keypresses and focusing
			dojo.connect(this.domNode, "keypress", this, "handleArrowKeyPress");
			dojo.connect(this.domNode, "keydown", this, "handleKeyDown");
			dojo.connect(this.domNode, "keyup", this, "handleKeyUp");
			dojo.connect(this.domNode, "onfocus", this, "selectActiveItem");
			dojo.connect(this.domNode, "onblur", this, "setActiveItemToDefaultState");
		}, // end postCreate
		
		/**
		 * Changes the current focus to the specified item.
		 * @param {Object} anItem
		 */
		focusItem: function(anItem) {			
			this.setActiveItemToDefaultState();
						
			this.activeItem = anItem;			
			
			dojo.removeClass (this.activeItem, fluid.states.defaultClass);
			dojo.addClass (this.activeItem, fluid.states.focusedClass);
			this.getElementToFocus(this.activeItem).focus();
		}, //end focus
		
		/**
		 * Changes focus to the active item.
		 */
		selectActiveItem: function() {
			if (this.activeItem == null) {
				this.activeItem = this.firstElement(this.domNode);
			}
			this.focusItem(this.activeItem);
		},
		
		setActiveItemToDefaultState: function() {
			if (this.activeItem != null) {
				dojo.removeClass (this.activeItem, fluid.states.focusedClass);
				dojo.addClass (this.activeItem, fluid.states.defaultClass);
			}
		},
		
		handleKeyDown: function (evt) {
			var key = evt.keyCode;
			if (key == dojo.keys.CTRL) {
				dojo.removeClass(this.activeItem, fluid.states.focusedClass);
				dojo.addClass(this.activeItem, fluid.states.draggingClass);
				dojo.stopEvent(evt);
			}
		}, // end handleKeyDown
		
		handleKeyUp: function (evt) {
			var key = evt.keyCode;
			if (key == dojo.keys.CTRL) {
				dojo.removeClass(this.activeItem, fluid.states.draggingClass);
				dojo.addClass(this.activeItem, fluid.states.focusedClass);
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
			var nextRightSibling = this.nextElement(this.activeItem);
			var placementPosition;
			
			if (nextRightSibling) {
				placementPosition = "after";
			} else {
				// if current focus image is the last, change focus to first thumbnail
				nextRightSibling = this.firstElement(this.activeItem.parentNode);
				placementPosition = "before";
			}
			
			this._changeFocusOrMove(isCtrl, nextRightSibling, placementPosition);
		}, // end handleRightArrow
		
		handleLeftArrow: function(isCtrl) {
			var nextLeftSibling = this.previousElement(this.activeItem);
			var placementPosition;
			
			if (nextLeftSibling) {
				placementPosition = "before";
			} else {
				// if current focus image is the first, the next sibling is the last sibling
				nextLeftSibling = this.lastElement(this.activeItem.parentNode);
				placementPosition = "after";
			}
			
			this._changeFocusOrMove(isCtrl, nextLeftSibling, placementPosition);
		}, // end handleLeftArrow
		
		_changeFocusOrMove: function(shouldMove, refSibling, placementPosition) {
			if (shouldMove) {
				dojo.place(this.activeItem, refSibling, placementPosition);
				this.getElementToFocus(this.activeItem).focus();
			} else {
				this.focusItem(refSibling);
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

