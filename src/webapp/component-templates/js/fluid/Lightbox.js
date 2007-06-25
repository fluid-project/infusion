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
dojo.require("dojo.dnd.source");
dojo.require("MochiKit.DOM");
dojo.require("dijit.Tooltip");

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
		
		gridLayoutHandler: new GridLayoutHandler(),

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
			 
			 // Internationalization of Strings
// This line here will cause Firefox 1.5 to lock up on Windows.
//			 dojo.requireLocalization("fluid", "instructions");
			
		}, // end postCreate
		
		setUpDomNode: function () {
			// Connect the listeners that handle keypresses and focusing
			dojo.connect(this.domNode, "keypress", this, "handleArrowKeyPress");
			dojo.connect(this.domNode, "keydown", this, "handleKeyDown");
			dojo.connect(this.domNode, "keyup", this, "handleKeyUp");
			dojo.connect(this.domNode, "onfocus", this, "selectActiveItem");
			dojo.connect(this.domNode, "onblur", this, "setActiveItemToDefaultState");

			// remove whitespace from the tree before passing it to the grid handler
			FluidProject.Utilities.removeNonElementNodes(this.domNode);

			this.gridLayoutHandler.setGrid(this.domNode);

			if (MochiKit.DOM.getNodeAttribute (this.domNode,"aaa:activedescendent")) {
				MochiKit.DOM.removeNodeAttribute (this.domNode,"aaa:activedescendent");
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
			// Tooltip disabled because styling makes user experience confusing.
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
			// Tooltip disabled because styling makes user experience confusing.
			// this.activeItem.theTooltip.close ();
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
			// Tooltip disabled because styling makes user experience confusing.
			//if (!anItem.theTooltip) {
			    //var caption = this._fetchMessage("thumbnailInstructions");
				//anItem.theTooltip = new dijit.Tooltip (
				//{connectId: anItem.id, 
				// caption: caption
				//});
            // }

			this.activeItem = anItem;
			this._updateActiveDescendent();
		},
		
		_updateActiveDescendent: function() {
			if (this.activeItem) {
				MochiKit.DOM.setNodeAttribute (this.domNode, "aaa:activedescendent", this.activeItem.id);
			} else if (MochiKit.DOM.getNodeAttribute (this.domNode, "aaa:activedescendent")) {
				MochiKit.DOM.removeNodeAttribute (this.domNode, "aaa:activedescendent");
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
			for(i=0;i<items.length;i++) {
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
		},

		_findAncestorGridCell: function(gridCellDescendent) {
			if (gridCellDescendent == null) {
				return null;
			} else if (MochiKit.DOM.getNodeAttribute (gridCellDescendent, "xhtml10:role") == "wairole:gridcell") {
				return gridCellDescendent;
			} else {
				return this._findAncestorGridCell(MochiKit.DOM.getFirstParentByTagAndClassName(gridCellDescendent, '*', null));
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

var FluidProject = {
/*
 * Utilities object for providing various lightbox-independent convenience functions
 */
  Utilities: {
	  removeNonElementNodes: function(rootNode) {
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
	  },
	escapeSelector: function(id) {
	  return id.replace(/\:/g,"\\:");
	  },
	findForm: function (element) {
      while(element) {
      if (element.nodeName.toLowerCase() == "form") return element;
        element = element.parentNode;
        }
      }
	},
// Server-level initialisation for the lightbox. This is template-specific and
// server-generic, in that template-specific dependencies have been factored off.
	initLightbox: function(namebase, count, messageNamebase) {
      FluidProject.initLightboxClient(namebase, count, messageNamebase, "a", 1);
	  },
	deriveCellBase: function(namebase, index) {
	  return namebase + "lightbox-cell::"+index+":";
	  },
// Custom query method seeks all tags descended from a given root with a 
// particular tag name, whose id matches a regex. The Dojo query parser
// is broken http://trac.dojotoolkit.org/ticket/3520#preview, this is all
// it might do anyway, and this will be plenty fast.
	seekNodesById: function(rootnode, tagname, idmatch) {
	  var inputs = rootnode.getElementsByTagName(tagname);
	  var togo = new Array();
	  for (var i = 0; i < inputs.length; ++ i) {
	    var input = inputs[i];
	    var id = input.id;
	    if (id && id.match(idmatch)) {
	      togo.push(input);
	      }
	    }
	    return togo;
	  },
// Client-level initialisation for the lightbox, allowing parameterisation for
// different templates.
	initLightboxClient: function(namebase, count, messageNamebase, tagName, tagNameIndex) {
	  var reorderform = FluidProject.Utilities.findForm(document.getElementById(namebase));
	  // An <input> tag nested within our root namebase tag, which has an id which 
	  // begins with the  namebase:lightbox-cell:: prefix, and ends with "reorder-index" trail.
	  // Very hard to imagine any perversity which may lead to this picking any stray stuff :P
	  
	  // An approach based on the "sourceIndex" DOM property would be much more efficient,
	  // but this is only supported in IE. 
	  // This selector approach is ALSO broken, see Dojo bug 3520.
	  //var selector = "#" + FluidProject.Utilities.escapeSelector(namebase) 
	  //+ " input[id^=\"" + FluidProject.Utilities.escapeSelector(namebase + "lightbox-cell::") + "\"]"
	  //+ "[id$=\"reorder-index\"]";
	  var orderChangedCallback = function() {
//	  var inputs = dojo.query(selector);
      var inputs = FluidProject.seekNodesById(reorderform, "input", 
          FluidProject.deriveCellBase(namebase, ".*") + "reorder-index");
	  
	    for (var i = 0; i < inputs.length; ++ i) {
	      inputs[i].value = i;
	      }
	    
	    // dojo.io.bind is gone: http://dojotoolkit.org/book/dojo-porting-guide-0-4-x-0-9/io-transports-ajax
	    if (reorderform.action) {
	      dojo.xhrPost({
          url: reorderform.action,
          form: reorderform,
          load: function(type, data, evt){ /* No-op response */ },
          });
        };
	    };
	
	
	  var lightbox = new fluid.Lightbox(
	    {tagNameToFocus: tagName,
	     tagNameIndexToFocus : tagNameIndex,
	     messageNamebase : messageNamebase,
	     orderChangedCallback: orderChangedCallback
	    }, 
	    namebase);
    }
  };
