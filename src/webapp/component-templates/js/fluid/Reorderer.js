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
if (typeof(fluid) == "undefined") {
    fluid = {};
};

(function() {
	fluid.states = {
		defaultClass:"image-container-default",
		selectedClass:"image-container-selected",
		draggingClass:"image-container-dragging"
	};
})();



fluid.Reorderer = function(domNodeId, params) {
	this.domNode = dojo.byId(domNodeId);
	
	// the reorderable DOM element that is currently active
    this.activeItem = null;
		
	this.layoutHandler = null;
		
	this.messageNamebase = "message-bundle:";
		
	this.orderChangedCallback = null;
		
	this.orderableIdBase = null;
		
	if (params) {
        dojo.mixin(this, params);
    }
        
   /**
    * Return the element within the item that should receive focus. This is determined by the class 
    * 'reorderable-focus-target'. If it is not specified, the item itself is returned.
    * 
    * @param {Object} item
    * @return {Object} The element that should receive focus in the specified item.
    */
	this.getElementToFocus = function(item) {
		var elementToFocus = dojo.query(".reorderable-focus-target", item)[0];
		if (elementToFocus) {
			return elementToFocus;
		}
		
		return item;
	};
	
	this._setUpDomNode = function () {
		// Connect the listeners that handle keypresses and focusing
		dojo.connect(this.domNode, "keypress", this, "handleArrowKeyPress");
		dojo.connect(this.domNode, "keydown", this, "handleKeyDown");
		dojo.connect(this.domNode, "keyup", this, "handleKeyUp");
		dojo.connect(this.domNode, "onfocus", this, "selectActiveItem");
		dojo.connect(this.domNode, "onblur", this, "changeActiveItemToDefaultState");
	
		this.layoutHandler.setReorderableContainer(this.domNode);
	
		if (this.domNode.getAttribute("aaa:activedescendent")) {
			this.domNode.removeAttribute("aaa:activedescendent");
		}
	};
		
	/**
	 * Changes the current focus to the specified item.
	 * @param {Object} anItem
	 */
	this.focusItem = function(anItem) {
		this.changeActiveItemToDefaultState();
		this._setActiveItem(anItem);			
		dojo.removeClass(this.activeItem, fluid.states.defaultClass);
		dojo.addClass(this.activeItem, fluid.states.selectedClass);
		this.getElementToFocus(this.activeItem).focus();
	};
	
	/**
	 * Changes focus to the active item.
	 */
	this.selectActiveItem = function() {
		if (!this.activeItem) {
			var orderables = dojo.query (".orderable", this.domNode);
			if (orderables.length > 0) {
				this._setActiveItem(orderables[0]);
			}
			else
				return;
		}
		this.focusItem(this.activeItem);
	};
		
	this.changeActiveItemToDefaultState = function() {
		if (this.activeItem) {
			dojo.removeClass(this.activeItem, fluid.states.selectedClass);
			dojo.addClass(this.activeItem, fluid.states.defaultClass);
		}
	};
	
	this.handleKeyDown = function (evt) {
		if (this.activeItem && evt.keyCode == dojo.keys.CTRL) {
			dojo.removeClass(this.activeItem, fluid.states.selectedClass);
			dojo.addClass(this.activeItem, fluid.states.draggingClass);
	        this.activeItem.setAttribute("aaa:grab", "true");
			dojo.stopEvent(evt);
		}
	};
	
	this.handleKeyUp = function (evt) {
		if (this.activeItem && evt.keyCode == dojo.keys.CTRL) {
			dojo.removeClass(this.activeItem, fluid.states.draggingClass);
			dojo.addClass(this.activeItem, fluid.states.selectedClass);
	        this.activeItem.setAttribute("aaa:grab", "supported");
			dojo.stopEvent(evt);
		}		
	};
	
	this.handleArrowKeyPress = function (evt){
		if (this.activeItem) {
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
		}
	};
	
	this.handleUpArrow = function (isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemUp(this.activeItem);
			this.getElementToFocus(this.activeItem).focus();
			this.orderChangedCallback();
		} else {
			this.focusItem(this.layoutHandler.getItemAbove(this.activeItem));
		}			
	};
	
	this.handleDownArrow = function (isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemDown(this.activeItem);
			this.getElementToFocus(this.activeItem).focus();
			this.orderChangedCallback();
		} else {
			this.focusItem(this.layoutHandler.getItemBelow(this.activeItem));
		}
	};
	
	this.handleRightArrow = function(isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemRight(this.activeItem);
			this.getElementToFocus(this.activeItem).focus();
			this.orderChangedCallback();				
		} else {
			this.focusItem(this.layoutHandler.getRightSibling(this.activeItem));				
		}			
	};
	
	this.handleLeftArrow = function(isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemLeft(this.activeItem);
			this.getElementToFocus(this.activeItem).focus();
			this.orderChangedCallback();				
		} else {
			this.focusItem(this.layoutHandler.getLeftSibling(this.activeItem));				
		}
	};
			
	this._fetchMessage = function(messagekey) {
		var messageID = this.messageNamebase + messagekey;
		var node = document.getElementById(messageID);
		
		return node? node.innerHTML: "[Message not found at id " + messageID + "]";
	};
	
	this._setActiveItem = function(anItem) {
		this.activeItem = anItem;
		this._updateActiveDescendent();
	};
	
	this._updateActiveDescendent = function() {
		if (this.activeItem) {
			this.domNode.setAttribute("aaa:activedescendent", this.activeItem.id);
		} else if (this.domNode.getAttribute("aaa:activedescendent")) {
			this.domNode.removeAttribute("aaa:activedescendent");
		}
	};
	
	this._enableDragAndDrop = function() {
        var reorderer = this;
        jQuery(this.domNode).sortable({
            items: "[id^="+this.orderableIdBase+"]",
            start: function(e, ui) {
                reorderer.focusItem(reorderer._findReorderableParent(ui.draggable.element));
                reorderer.activeItem.setAttribute("aaa:grab", "true");
            },
            update: function(e, ui) {
                reorderer.orderChangedCallback();
                reorderer.focusItem (reorderer.activeItem);
                reorderer.activeItem.setAttribute("aaa:grab", "supported");
            }
        });
    };

	/**
	 * Finds the parent element marked "orderable" for a child element.
	 */
	this._findReorderableParent = function(childElement) {
		if (childElement == null) {
			return null;
		} else if (dojo.hasClass(childElement, "orderable")) {
			return childElement;
		} else {
			return this._findReorderableParent(childElement.parentNode);
		}
	};

    // Final initialization of the Reorderer at the end of the construction process	
	if (this.domNode) {
        this._setUpDomNode();
        this._enableDragAndDrop();
    }
}; // End Reorderer

fluid.ListLayoutHandler = function () {
    this._container = null;
    
    this.setReorderableContainer = function (aList) {
        this._container = aList;
    };
    
    /*
     * Returns an object containing the item that is to the right of the given item
     * and a flag indicating whether or not the process has 'wrapped' around the end of
     * the row that the given item is in
     */
    this._getRightSiblingInfo = function (item) {           
        return this._getSiblingInfo (item, 1);
    };
    
    this.getRightSibling = function (item) {
        return this._getRightSiblingInfo(item).item;
    };
    
    this.moveItemRight = function (item) {
        this._moveItem(item, this._getRightSiblingInfo(item), "after", "before");
    };

    /*
     * Returns an object containing the item that is to the left of the given item
     * and a flag indicating whether or not the process has 'wrapped' around the end of
     * the row that the given item is in
     */
    this._getLeftSiblingInfo = function (item) {
        return this._getSiblingInfo (item, -1);
    };
        
    this.getLeftSibling = function (item) {
        return this._getLeftSiblingInfo(item).item;
    };

    this.moveItemLeft = function (item) {
        this._moveItem(item, this._getLeftSiblingInfo(item), "before", "after");
    };

    /*
     * A general get{Left|Right}SiblingInfo() given an item and a direction.
     * The direction is encoded by either a +1 to move right, or a -1 to
     * move left, and that value is used internally as an increment or
     * decrement, respectively, of the index of the given item.
     */
    this._getSiblingInfo = function (item, /* +1, -1 */ incDecrement) {
        var orderables = dojo.query(".orderable", this._container);
        var index = dojo.indexOf(orderables, item) + incDecrement;
        var hasWrapped = false;
            
        // Handle wrapping to 'before' the beginning. 
        if (index == -1) {
            index = orderables.length - 1;
            hasWrapped = true;
        }
        // Handle wrapping to 'after' the end.
        else if (index == orderables.length) {
            index = 0;
            hasWrapped = true;
        } 
        // Handle case where the passed-in item is *not* an "orderable"
        // (or other undefined error).
        //
        else if (index < -1 || index > orderables.length) {
            index = 0;
        }
        
        return {item: orderables[index], hasWrapped: hasWrapped};
    };

    this.getItemBelow = function (item) {
        return this.getRightSibling(item);
    };

    this.getItemAbove = function (item) {
        return this.getLeftSibling(item);
    };
    
    this.moveItemUp = this.moveItemLeft;
    
    this.moveItemDown = this.moveItemRight;
    
    this._moveItem = function(item, relatedItemInfo, defaultPlacement, wrappedPlacement) {
        var itemPlacement = defaultPlacement;
        if (relatedItemInfo.hasWrapped) {
            itemPlacement = wrappedPlacement;
        }
        dojo.place(item, relatedItemInfo.item, itemPlacement);
    };
    
}; // End ListLayoutHandler
    
/*
 * Items in the Lightbox are stored in a list, but they are visually presented as a grid that
 * changes dimensions when the window changes size. As a result, when the user presses the up or
 * down arrow key, the expected behaviour depends on the current window size.
 * 
 * The GridLayoutHandler is responsible for handling changes to this virtual 'grid' of items
 * in the window, and of informing the Lightbox of which items surround a given item.
 */
fluid.GridLayoutHandler = function (){

    fluid.ListLayoutHandler.call(this);
                    
    /*
     * Returns an object containing the item that is below the given item in the current grid
     * and a flag indicating whether or not the process has 'wrapped' around the end of
     * the column that the given item is in. The flag is necessary because when an image is being
     * moved to the resulting item location, the decision of whether or not to insert before or
     * after the item changes if the process wrapped around the column.
     */
    this._getItemInfoBelow = function (inItem) {
        var orderables = dojo.query(".orderable", this._container);
        var curIndex = dojo.indexOf(orderables, inItem);
        var curCoords = dojo.coords(inItem);
        
        // Handle case where the passed-in item is *not* an "orderable"
        if (curIndex < 0) {
            return {item: orderables[0], hasWrapped: false};
        }
        
        for (i = curIndex + 1; i < orderables.length; i++) {
            var iCoords = dojo.coords(orderables[i]);
            if (iCoords.x == curCoords.x && iCoords.y > curCoords.y) {
                return {item: orderables[i], hasWrapped: false};
            }               
        }
        
        for (i = 0; i < curIndex; i++ ) {
            var iCoords = dojo.coords(orderables[i]);
            if (iCoords.x == curCoords.x) {
                return {item: orderables[i], hasWrapped: true};
            }
        }
        
        // Didn't find an item below - return what was passed in
        return {item: inItem, hasWrapped: false};
    };
    
    this.getItemBelow = function(item) {
        return this._getItemInfoBelow(item).item;
    };

    this.moveItemDown = function (item) {
        this._moveItem(item, this._getItemInfoBelow(item), "after", "before");
    };
            
    /*
     * Returns an object containing the item that is above the given item in the current grid
     * and a flag indicating whether or not the process has 'wrapped' around the end of
     * the column that the given item is in. The flag is necessary because when an image is being
     * moved to the resulting item location, the decision of whether or not to insert before or
     * after the item changes if the process wrapped around the column.
     */
    this._getItemInfoAbove = function (inItem) {
        var orderables = dojo.query(".orderable", this._container);
        var curIndex = dojo.indexOf(orderables, inItem);
        var curCoords = dojo.coords(inItem);

        // Handle case where the passed-in item is *not* an "orderable"
        if (curIndex < 0) {
            return {item: orderables[0], hasWrapped: false};
        }

        for (i = curIndex - 1; i > -1; i--) {
            var iCoords = dojo.coords(orderables[i]);
            if (iCoords.x == curCoords.x && iCoords.y < curCoords.y) {
                return {item: orderables[i], hasWrapped: false};
            }               
        }
        
        for (i = orderables.length - 1; i > curIndex; i-- ) {
            var iCoords = dojo.coords(orderables[i]);
            if (iCoords.x == curCoords.x) {
                return {item: orderables[i], hasWrapped: true};
            }
        }
        
        // Didn't find an item above - return what was passed in
        return {item: inItem, hasWrapped: false};
    };

    this.getItemAbove = function (item) {
        return this._getItemInfoAbove(item).item;   
    }; 
    
    this.moveItemUp = function(item) {
        this._moveItem(item, this._getItemInfoAbove(item), "before", "after");
    };
            
}; // End of GridLayoutHandler
    

