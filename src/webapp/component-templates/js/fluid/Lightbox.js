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
		
		// the lightbox-reorderable DOM element that is currently active
		activeItem: null,
		
		gridLayoutHandler: null,

		utilities: null,
		
		/**
		 * Return the element within the item that should receive focus.
		 * 
		 * NOTE: The lightbox currently assumes that items will have an anchor, and that this anchor
		 * should receive focus so that it can be activated with an 'enter' keypress. This function
		 * currently returns the first anchor in the item.
		 * 
		 * @param {Object} item
		 * @return {Object} The element that should receive focus in the specified item.
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
			dojo.connect(window, "onresize", this, "handleWindowResizeEvent");
			
			// remove whitespace from the tree before passing it to the grid handler
			this.utilities = new Utilities();
			this.utilities.removeNonElementNodes(this.domNode);

			this.gridLayoutHandler = new GridLayoutHandler();
			this.gridLayoutHandler.setGrid(this.domNode);

			if (this.domNode.hasAttribute("aaa:activedescendent")) {
				this.domNode.removeAttribute("aaa:activedescendent");			
			}
		}, // end postCreate
		
		/**
		 * Changes the current focus to the specified item.
		 * @param {Object} anItem
		 */
		focusItem: function(anItem) {			
			this.setActiveItemToDefaultState();
						
			this._setActiveItem(anItem);			
			
			dojo.removeClass (this.activeItem, fluid.states.defaultClass);
			dojo.addClass (this.activeItem, fluid.states.focusedClass);
			this.getElementToFocus(this.activeItem).focus();
		}, //end focus
		
		/**
		 * Changes focus to the active item.
		 */
		selectActiveItem: function() {
			if (!this.activeItem) {
				this._setActiveItem(this.domNode.firstChild);
			}
			this.focusItem(this.activeItem);
		},
		
		setActiveItemToDefaultState: function() {
			if (this.activeItem) {
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
				this.handleDownArrow(evt.ctrlKey);								
				dojo.stopEvent(evt);
				break;
			}
			case dojo.keys.UP_ARROW: {
				this.handleUpArrow(evt.ctrlKey);								
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
	
		handleUpArrow: function (isCtrl) {
			var itemAboveInfo = this.gridLayoutHandler.getItemAbove(this.activeItem);
			
			// if we wrap around, then we want to insert after the item 'above' 
			if (itemAboveInfo.hasWrapped) {
				this._changeFocusOrMove(isCtrl, itemAboveInfo.item, "after");	
			} else {
				this._changeFocusOrMove(isCtrl, itemAboveInfo.item, "before");	
			}
		},

		handleDownArrow: function (isCtrl) {
			var itemBelowInfo = this.gridLayoutHandler.getItemBelow(this.activeItem);
			
			// if we wrap around, then we want to insert before the item 'below' 
			if (itemBelowInfo.hasWrapped) {
				this._changeFocusOrMove(isCtrl, itemBelowInfo.item, "before");
			} else {
				this._changeFocusOrMove(isCtrl, itemBelowInfo.item, "after");
			}	
		},
		
		handleRightArrow: function(isCtrl) {
			var rightSiblingInfo = this.gridLayoutHandler.getRightSibling(this.activeItem);
			
			if (rightSiblingInfo.hasWrapped) {
				this._changeFocusOrMove(isCtrl, rightSiblingInfo.item, "before");
			} else {
				this._changeFocusOrMove(isCtrl, rightSiblingInfo.item, "after");
			}

		}, // end handleRightArrow
		
		handleLeftArrow: function(isCtrl) {
			var leftSiblingInfo = this.gridLayoutHandler.getLeftSibling(this.activeItem);
			
			if (leftSiblingInfo.hasWrapped) {
				this._changeFocusOrMove(isCtrl, leftSiblingInfo.item, "after");
			} else {
				this._changeFocusOrMove(isCtrl, leftSiblingInfo.item, "before");				
			}			
		}, // end handleLeftArrow
		
		_changeFocusOrMove: function(shouldMove, refSibling, placementPosition) {
			if (shouldMove) {
				dojo.place(this.activeItem, refSibling, placementPosition);
				this.getElementToFocus(this.activeItem).focus();
			} else {
				this.focusItem(refSibling);
			}		
		},
		
		// currently just updates the size of the grid.
		handleWindowResizeEvent: function(resizeEvent) {
			this.gridLayoutHandler.updateGridWidth();
		},

		_setActiveItem: function(anItem) {
			this.activeItem = anItem;
			this._updateActiveDescendent();
		},
		
		_updateActiveDescendent: function() {
			if (this.activeItem) {
				this.domNode.setAttribute("aaa:activedescendent", this.activeItem.id);
			} else if (this.domNode.hasAttribute("aaa:activedescendent")) {
				this.domNode.removeAttribute("aaa:activedescendent");
			}
		}	

	}
);

/*
 * Items in the Lightbox are stored in a list, but they are visually presented as a grid that
 * changes dimensions when the window changes size. As a result, when the user presses the up or
 * down arrow key, the expected behaviour depends on the current window size.
 * 
 * The GridLayoutHandler is responsible for handling changes to this virtual 'grid' of items
 * in the window, and of informing the Lightbox of which items surround a given item.
 */
function GridLayoutHandler() {
	
	this.numOfColumnsInGrid = 0
	this.grid = null;
	
	this.setGrid = function (aGrid) {
		this.grid = aGrid;
		this.updateGridWidth();
	};
	
	this.updateGridWidth = function () {
		var firstItemY = dojo.coords(this.grid.childNodes[0]).y;

		var i = 1;
		while (i < this.grid.childNodes.length) {		
			if (dojo.coords(this.grid.childNodes[i]).y > firstItemY) {
				this.numOfColumnsInGrid = i;
				break;
			}
			i++;
		}
	};
	
	/*
	 * Returns an object containing the item that is to the right of the given item
	 * and a flag indicating whether or not the process has 'wrapped' around the end of
	 * the row that the given item is in
	 */
	this.getRightSibling = function (item) {
		var nextIndex = dojo.indexOf(this.grid.childNodes, item) + 1;
		var hasWrapped = false;
		
		if (nextIndex >= this.grid.childNodes.length) {
			nextIndex = 0;
			hasWrapped = true
		}
		
		return {item: this.grid.childNodes[nextIndex], hasWrapped: hasWrapped};
	},
	
	/*
	 * Returns an object containing the item that is to the left of the given item
	 * and a flag indicating whether or not the process has 'wrapped' around the end of
	 * the row that the given item is in
	 */
	this.getLeftSibling = function (item) {
		var previousIndex = dojo.indexOf(this.grid.childNodes, item) - 1;
		var hasWrapped = false;
		
		if (previousIndex < 0) {
			previousIndex = this.grid.childNodes.length - 1;
			hasWrapped = true
		}
		
		return {item: this.grid.childNodes[previousIndex], hasWrapped: hasWrapped};
	},
	
	/*
	 * Returns an object containing the item that is below the given item in the current grid
	 * and a flag indicating whether or not the process has 'wrapped' around the end of
	 * the column that the given item is in. The flag is necessary because when an image is being
	 * moved to the resulting item location, the decision of whether or not to insert before or
	* after the item changes if the process wrapped around the column.
	 */
	this.getItemBelow = function (item) {
		var curIndex = dojo.indexOf(this.grid.childNodes, item);
		var belowIndex = curIndex+this.numOfColumnsInGrid;
		var hasWrapped = false;
		
		if (belowIndex >= this.grid.childNodes.length) {
			hasWrapped = true;
			belowIndex = belowIndex % this.numOfColumnsInGrid;
		}
		return {item: this.grid.childNodes[belowIndex], hasWrapped: hasWrapped};
	};
	
	/*
	 * Returns an object containing the item that is above the given item in the current grid
	 * and a flag indicating whether or not the process has 'wrapped' around the end of
	 * the column that the given item is in. The flag is necessary because when an image is being
	 * moved to the resulting item location, the decision of whether or not to insert before or
	* after the item changes if the process wrapped around the column.
	 */
	this.getItemAbove = function (item) {
		var curIndex = dojo.indexOf(this.grid.childNodes, item);
		var aboveIndex = curIndex-this.numOfColumnsInGrid;
		var hasWrapped = false;
		
		if (aboveIndex < 0) {
			hasWrapped = true;
			var itemsInLastRow = this.grid.childNodes.length % this.numOfColumnsInGrid;
			if (curIndex  >= itemsInLastRow) {
				aboveIndex = curIndex + this.grid.childNodes.length - itemsInLastRow
					- this.numOfColumnsInGrid;
			} else {
				aboveIndex = curIndex + this.grid.childNodes.length - itemsInLastRow;
			}
		}
		
		return {item: this.grid.childNodes[aboveIndex], hasWrapped: hasWrapped};
	};
}

/*
 * Utilities object for providing various lightbox-independent convenience functions
 */
function Utilities() {
	this.removeNonElementNodes = function(rootNode) {
		var currChild = rootNode.firstChild;
		var nextSibling = currChild.nextSibling;
		if (currChild.nodeType != 1) {
			rootNode.removeChild(currChild);
		}
		while (nextSibling){
			currChild = nextSibling;
			nextSibling = currChild.nextSibling;
			if (currChild.nodeType != 1) {
				rootNode.removeChild(currChild);
			}			
		} 
	}
}

