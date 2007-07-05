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

fluid.declare = function(target, args) {
	for (arg in args) {
    	target[arg] = args[arg];
    }
};

dojo.require("dijit._Widget");
dojo.require("dojo.dnd.source");
dojo.require("dijit.Tooltip");
dojo.require("fluid.Fluid");

(function() {
	fluid.states = {
		defaultClass:"image-container-default",
		focusedClass:"image-container-selected",
		draggingClass:"image-container-dragging"
	};
})();



dojo.declare(
	"fluid.Lightbox",	// class name
	dijit._Widget,
	{
		// the lightbox-reorderable DOM element that is currently active
		activeItem: null,
		
		gridLayoutHandler: new fluid.GridLayoutHandler(),

		tagNameToFocus: null,
		
		tagNameIndexToFocus: 0,
		
		messageNamebase: "message-bundle:",
		
		orderChangedCallback: null,
		
		/**
		 * Return the element within the item that should receive focus. 
		 * 
		 * Note: If the tag name to focus is not specified, the item itself is returned.
		 * 
		 * @param {Object} item
		 * @return {Object} The element that should receive focus in the specified item.
		 */
		getElementToFocus: function(item) {
			if (this.tagNameToFocus) {
				return item.getElementsByTagName(this.tagNameToFocus)[this.tagNameIndexToFocus];
			}
			return item;
		},

		postCreate: function () {
			// Dojo calls this function after constructing the object.
			dojo.connect(window, "onresize", this, "handleWindowResizeEvent");
			if (this.domNode) {
				this.setUpDomNode();
			}
			
			// calling _initDnD will activate the drag-and-drop functionality
			 this._initDnD();
		}, // end postCreate
		
		setUpDomNode: function () {
			// Connect the listeners that handle keypresses and focusing
			dojo.connect(this.domNode, "keypress", this, "handleArrowKeyPress");
			dojo.connect(this.domNode, "keydown", this, "handleKeyDown");
			dojo.connect(this.domNode, "keyup", this, "handleKeyUp");
			dojo.connect(this.domNode, "onfocus", this, "selectActiveItem");
			dojo.connect(this.domNode, "onblur", this, "setActiveItemToDefaultState");

			// remove whitespace from the tree before passing it to the grid handler
			// this is currently necessary because the Lightbox assumes that any nodes inside
			// it are re-orderable items.
			// NOTE: The lightbox needs to be refactored to work without this assumption, so that
			// it can identify re-orderable items another way e.g. through a class name
			fluid.Utilities.removeNonElementNodes(this.domNode);

			this.gridLayoutHandler.setGrid(this.domNode);

			if (this.domNode.getAttribute("aaa:activedescendent")) {
				this.domNode.removeAttribute("aaa:activedescendent");
			}
		},
		
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
			// Temporarily disable the tooltip; when it is properly styled and behaving,
			// it will be re-enabled.
			// this.activeItem.theTooltip.open();	
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
				// Temporarily disable the tooltip; when it is properly styled and behaving,
				// it will be re-enabled.
				// if (this.activeItem.theTooltip) {
				// 	this.activeItem.theTooltip.close ();
				// }
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
				this.orderChangedCallback();
			} else {
				this.focusItem(refSibling);
			}		
		},
		
		// currently just updates the size of the grid.
		handleWindowResizeEvent: function(resizeEvent) {
			this.gridLayoutHandler.updateGridWidth();
		},
		
		_fetchMessage: function(messagekey) {
		  var messageid = this.messageNamebase + messagekey;
		  var node = document.getElementById(messageid);
		  return node? node.innerHTML: "[Message not found at id " + messageid + "]";
		  },
		
		_setActiveItem: function(anItem) {
			// Temporarily disable the tooltip; when it is properly styled and behaving,
			// it will be re-enabled.
//			if (!anItem.theTooltip) {
//			    var caption = this._fetchMessage("thumbnailInstructions");
//				anItem.theTooltip = new dijit.Tooltip (
//				{connectId: anItem.id, 
//				 label: caption
//				}, "dojoTooltip");
//             }

			this.activeItem = anItem;
			this._updateActiveDescendent();
		},
		
		_updateActiveDescendent: function() {
			if (this.activeItem) {
				this.domNode.setAttribute("aaa:activedescendent", this.activeItem.id);
			} else if (this.domNode.getAttribute("aaa:activedescendent")) {
				this.domNode.removeAttribute("aaa:activedescendent");
			}
		},


        _itemCreator: function(item, hint) {
          var types = [];
          return {node: item, data: item, types: types};
          },

		_initDnD: function() {
			dndlb = new dojo.dnd.Source(this.domNode.id, {creator: this._itemCreator, horizontal: true});
			dndlb.lightbox = this;
			items = this.domNode.childNodes;
			var itemArray = new Array();
			for(i = 0; i < items.length; i++) {
				itemArray.push(items[i]);
			}
			dndlb.insertNodes(false, itemArray);
			
			// Override dojo's dnd 'onMouseDown' in order to put focus on the drag source.  Then
			// apply the superclass 'onMouseDown'.
			//
            dndlb.onMouseDown = function(ecmaEvent){
				// note: source.target will not work in IE, need to use source.srcElement instead.
				var targetElement = (ecmaEvent.target || ecmaEvent.srcElement);
                this.lightbox.focusItem(this.lightbox._findAncestorGridCell(targetElement));
                dojo.dnd.Source.prototype.onMouseDown.apply(dndlb, arguments);
            };
			
			// dojo's dnd system lastly calls 'onDndCancel'.  Override it here to first call the
			// superclass 'onDndCancel', and then set focus to the dropped item after superclass
			// returns.
			//
			dndlb.onDndCancel = function () {
				dojo.dnd.Source.prototype.onDndCancel.apply (dndlb, arguments);
				this.lightbox.focusItem (this.lightbox.activeItem);
			};
			dndlb.onDndDrop = function(source, nodes, copy) {
			// Use of "this" here is alarmingly ambiguous, and we really want the
			// callback not to be a public property.
           // TODO: why can't we call "superclass" rather than "prototype" here
           // Answer: Dojo inheritance documented at http://manual.dojotoolkit.org/WikiHome/DojoDotBook/Book20
           // "superclass" must be explicitly enabled with a call to "inherit"
                dojo.dnd.Source.prototype.onDndDrop.call(this, source, nodes, copy);
		  	    this.lightbox.orderChangedCallback();
			}
		},

		_findAncestorGridCell: function(gridCellDescendent) {
			if (gridCellDescendent == null) {
				return null;
			} else if (gridCellDescendent.getAttribute("xhtml10:role") == "wairole:gridcell") {
				return gridCellDescendent;
			} else {
				return this._findAncestorGridCell(gridCellDescendent.parentNode);
			}
		}
	}
	
);
