/*
Copyright 2007 University of Toronto
Copyright 2007 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

if (typeof (fluid) == "undefined") {
    fluid = {};
}

fluid.Reorderer = function (domNodeId, params) {
	// Reliable 'this'.
	//
	var thisReorderer = this;
	
	this.domNode = dojo.byId (domNodeId);
	
	// the reorderable DOM element that is currently active
    this.activeItem = null;
		
	this.layoutHandler = null;
		
	this.messageNamebase = "message-bundle:";
	
	// Default call back does nothing, and avoids "null pointer exceptions".
	this.orderChangedCallback = function() {};
		
    this.orderableFinder = null;
			
    this.cssClasses = {
        defaultStyle: "orderable-default",
        selected: "orderable-selected",
        dragging: "orderable-dragging",
        hover: "orderable-hover",
        focusTarget: "orderable-focus-target",
        dropMarker: "orderable-drop-marker",
        avatar: "orderable-avatar"
    };

	if (params) {
        dojo.mixin (this, params);
    }
    
   /**
    * Return the element within the item that should receive focus. This is determined by 
    * cssClasses.focusTarget. If it is not specified, the item itself is returned.
    * 
    * @param {Object} item
    * @return {Object} The element that should receive focus in the specified item.
    */
	this.getElementToFocus = function (item) {
		var elementToFocus = dojo.query ("." + this.cssClasses.focusTarget, item)[0];
		if (elementToFocus) {
			return elementToFocus;
		}
		return item;
	};
	
	this._setUpDomNode = function() {
		// Connect the listeners that handle keypresses and focusing
		dojo.connect (this.domNode, "keypress", this, "handleArrowKeyPress");
		dojo.connect (this.domNode, "keydown", this, "handleKeyDown");
		dojo.connect (this.domNode, "keyup", this, "handleKeyUp");
		dojo.connect (this.domNode, "onfocus", this, "selectActiveItem");
		dojo.connect (this.domNode, "onblur", this, "handleBlur");
	
		this.layoutHandler.setReorderableContainer (this.domNode);
	
		this.domNode.removeAttribute ("aaa:activedescendent");
	};
		
	/**
	 * Changes the current focus to the specified item.
	 * @param {Object} anItem
	 */
	this.focusItem = function(anItem) {
		this.changeActiveItemToDefaultState();
		this._setActiveItem (anItem);			
		dojo.removeClass (this.activeItem, this.cssClasses.defaultStyle);
		dojo.addClass (this.activeItem, this.cssClasses.selected);
		this.getElementToFocus (this.activeItem).focus();
	};
	
	/**
	 * Changes focus to the active item.
	 */
	this.selectActiveItem = function() {
		if (!this.activeItem) {
			var orderables = this.orderableFinder (this.domNode);
			if (orderables.length > 0) {
				this._setActiveItem (orderables[0]);
			}
			else {
				return;
			}
		}
		this.focusItem (this.activeItem);
	};
	
	this.handleBlur = function() {
		if (!jQuery.browser.msie) {
            this.changeActiveItemToDefaultState();
		}
	};
		
	this.changeActiveItemToDefaultState = function() {
		if (this.activeItem) {
			dojo.removeClass (this.activeItem, this.cssClasses.selected);
			dojo.addClass (this.activeItem, this.cssClasses.defaultStyle);
		}
	};
	
	this.handleKeyDown = function (evt) {
		if (this.activeItem && evt.keyCode == dojo.keys.CTRL) {
			dojo.removeClass (this.activeItem, this.cssClasses.selected);
			dojo.addClass (this.activeItem, this.cssClasses.dragging);
	        this.activeItem.setAttribute ("aaa:grab", "true");
			dojo.stopEvent (evt);
		}
	};
	
	this.handleKeyUp = function (evt) {
		if (this.activeItem && evt.keyCode == dojo.keys.CTRL) {
			dojo.removeClass (this.activeItem, this.cssClasses.dragging);
			dojo.addClass (this.activeItem, this.cssClasses.selected);
	        this.activeItem.setAttribute ("aaa:grab", "supported");
			dojo.stopEvent (evt);
		}		
	};
	
	this.handleArrowKeyPress = function (evt) {
		if (this.activeItem) {
			switch (evt.keyCode) {
				case dojo.keys.DOWN_ARROW: 
					this.handleDownArrow (evt.ctrlKey);								
					dojo.stopEvent (evt);
					break;
				case dojo.keys.UP_ARROW: 
					this.handleUpArrow (evt.ctrlKey);								
					dojo.stopEvent (evt);
					break;
				case dojo.keys.LEFT_ARROW: 
					this.handleLeftArrow (evt.ctrlKey);								
					dojo.stopEvent (evt);
					break;
				case dojo.keys.RIGHT_ARROW: 
					this.handleRightArrow (evt.ctrlKey);								
					dojo.stopEvent (evt);
					break;
				default:
			}
		}
	};
	
	this.handleUpArrow = function (isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemUp (this.activeItem);
			this.getElementToFocus (this.activeItem).focus();
			this.orderChangedCallback();
		} else {
			this.focusItem (this.layoutHandler.getItemAbove(this.activeItem));
		}			
	};
	
	this.handleDownArrow = function (isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemDown (this.activeItem);
			this.getElementToFocus (this.activeItem).focus();
			this.orderChangedCallback();
		} else {
			this.focusItem (this.layoutHandler.getItemBelow (this.activeItem));
		}
	};
	
	this.handleRightArrow = function (isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemRight (this.activeItem);
			this.getElementToFocus (this.activeItem).focus();
			this.orderChangedCallback();				
		} else {
			this.focusItem (this.layoutHandler.getRightSibling (this.activeItem));				
		}			
	};
	
	this.handleLeftArrow = function (isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemLeft (this.activeItem);
			this.getElementToFocus (this.activeItem).focus();
			this.orderChangedCallback();				
		} else {
			this.focusItem (this.layoutHandler.getLeftSibling (this.activeItem));				
		}
	};
			
	this._fetchMessage = function (messagekey) {
		var messageID = this.messageNamebase + messagekey;
		var node = document.getElementById (messageID);
		
		return node? node.innerHTML: "[Message not found at id " + messageID + "]";
	};
	
	this._setActiveItem = function (anItem) {
		this.activeItem = anItem;
		this._updateActiveDescendent();
	};
	
	this._updateActiveDescendent = function() {
		if (this.activeItem) {
			this.domNode.setAttribute ("aaa:activedescendent", this.activeItem.id);
		} else {
			this.domNode.removeAttribute ("aaa:activedescendent");
		}
	};
	
    /**
     * Given an item, make it a draggable and a droppable with the relevant properties and functions.
     * @param  anItem      The element to make draggable and droppable.
     * @param  selector    The jQuery selector(s) that select all the orderables.
     */ 
  
    var dropMarker; // private scratch variable
    
    function setUpDnDItem (anItem, selector) {
        dojo.connect (anItem, "onmouseover",  function () {
            dojo.addClass (this, thisReorderer.cssClasses.hover);
        });
        dojo.connect (anItem, "onmouseout",  function () {
            dojo.removeClass (this, thisReorderer.cssClasses.hover);
        });
  
        jQuery (anItem).draggable ({
            helper: function() {
            	var avatar = jQuery (this).clone();
            	jQuery (avatar).removeAttr ("id");
            	jQuery ("[id]", avatar).removeAttr ("id");
            	jQuery (":hidden", avatar).remove(); 
            	jQuery ("input", avatar).attr ("disabled", "true"); 
            	avatar.addClass (thisReorderer.cssClasses.avatar);          	
            	return avatar;
            },
            start: function (e, ui) {
                thisReorderer.focusItem (ui.draggable.element);                
                dojo.addClass (ui.draggable.element, thisReorderer.cssClasses.dragging);
                ui.draggable.element.setAttribute ("aaa:grab", "true");
                
                // In order to create valid html, the drop marker is the same type as the node being dragged.
                // This creates a confusing UI in cases such as an ordered list. 
                // drop marker functionality should be made pluggable. 
                dropMarker = document.createElement (ui.draggable.element.tagName);
                dojo.addClass (dropMarker, thisReorderer.cssClasses.dropMarker);                    
                dropMarker.style.visibility = "hidden";
            },
            stop: function(e, ui) {
                dojo.removeClass (ui.draggable.element, thisReorderer.cssClasses.dragging);
                thisReorderer.activeItem.setAttribute ("aaa:grab", "supported");
                thisReorderer.domNode.focus();
                if (dropMarker.parentNode) {
                    dropMarker.parentNode.removeChild (dropMarker);
                }
            }
        });

        jQuery (anItem).droppable ({
            accept: selector,
            tolerance: "pointer",
            over: function (e, ui) {
                jQuery (ui.droppable.element).after (dropMarker);                 
                dropMarker.style.visibility = "visible";
            },
            out: function (e, ui) {
                dropMarker.style.visibility = "hidden";
            },
            drop: function (e, ui) {
                jQuery (ui.droppable.element).after (ui.draggable.element);
                thisReorderer.orderChangedCallback();
            }
        });
    }
    	
	function initOrderables() {
        var items = thisReorderer.orderableFinder (thisReorderer.domNode);
        if (items.length === 0) {
        	return;
        }
        
        // Create a selector based on the ids of the nodes for use with drag and drop.
        // This should be replaced with using the actual nodes rather then a selector 
        // but will require a patch to jquery's DnD. 
        // See: FLUID-71, FLUID-112
        var selector = "";
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            selector += "[id=" + item.id + "]";
        	if (i != items.length - 1) {
        		selector += ", ";
        	}        	      	
        }

        // Setup orderable item including drag and drop.
         for (i = 0; i < items.length; i++) {
            jQuery (items[i]).addClass (thisReorderer.cssClasses.defaultStyle);
            setUpDnDItem (items[i], selector);
        }
    }

	/**
	 * Finds the "orderable" parent element given a child element.
	 */
	this._findReorderableParent = function (childElement, items) {
		if (!childElement) {
			return null;
        }
        else {
        	for (var i=0; i<items.length; i++) {
        		if (childElement === items[i]) {
                    return childElement;
        		}  
        	}
        	return this._findReorderableParent (childElement.parentNode, items);
        }
	};

    // Final initialization of the Reorderer at the end of the construction process	
	if (this.domNode) {
        this._setUpDomNode();
        initOrderables();
    }
}; // End Reorderer

fluid.ListLayoutHandler = function (/*function*/ orderableFinder) {
	this.orderableFinder = orderableFinder;
	
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
        var orderables = this.orderableFinder (this._container);
        var index = dojo.indexOf (orderables, item) + incDecrement;
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
        return this.getRightSibling (item);
    };

    this.getItemAbove = function (item) {
        return this.getLeftSibling (item);
    };
    
    this.moveItemUp = this.moveItemLeft;
    
    this.moveItemDown = this.moveItemRight;
    
    this._moveItem = function (item, relatedItemInfo, defaultPlacement, wrappedPlacement) {
        var itemPlacement = defaultPlacement;
        if (relatedItemInfo.hasWrapped) {
            itemPlacement = wrappedPlacement;
        }
        dojo.place (item, relatedItemInfo.item, itemPlacement);
    };
    
}; // End ListLayoutHandler
    
/*
 * Items in the Lightbox are stored in a list, but they are visually presented as a grid that
 * changes dimensions when the window changes size. As a result, when the user presses the up or
 * down arrow key, what lies above or below depends on the current window size.
 * 
 * The GridLayoutHandler is responsible for handling changes to this virtual 'grid' of items
 * in the window, and of informing the Lightbox of which items surround a given item.
 */
fluid.GridLayoutHandler = function (/*function*/ orderableFinder) {

    fluid.ListLayoutHandler.call (this, orderableFinder);
                    
    /*
     * Returns an object containing the item that is below the given item in the current grid
     * and a flag indicating whether or not the process has 'wrapped' around the end of
     * the column that the given item is in. The flag is necessary because when an image is being
     * moved to the resulting item location, the decision of whether or not to insert before or
     * after the item changes if the process wrapped around the column.
     */
    this._getItemInfoBelow = function (inItem) {
        var orderables = this.orderableFinder (this._container);
        var curIndex = dojo.indexOf (orderables, inItem);
        var curCoords = dojo.coords (inItem);
        var i, iCoords;
        
        // Handle case where the passed-in item is *not* an "orderable"
        if (curIndex < 0) {
            return {item: orderables[0], hasWrapped: false};
        }
        
        for (i = curIndex + 1; i < orderables.length; i++) {
            iCoords = dojo.coords (orderables[i]);
            if (iCoords.x == curCoords.x && iCoords.y > curCoords.y) {
                return {item: orderables[i], hasWrapped: false};
            }               
        }
        
        for (i = 0; i < curIndex; i++ ) {
            iCoords = dojo.coords (orderables[i]);
            if (iCoords.x == curCoords.x) {
                return {item: orderables[i], hasWrapped: true};
            }
        }
        
        // Didn't find an item below - return what was passed in
        return {item: inItem, hasWrapped: false};
    };
    
    this.getItemBelow = function(item) {
        return this._getItemInfoBelow (item).item;
    };

    this.moveItemDown = function (item) {
        this._moveItem (item, this._getItemInfoBelow (item), "after", "before");
    };
            
    /*
     * Returns an object containing the item that is above the given item in the current grid
     * and a flag indicating whether or not the process has 'wrapped' around the end of
     * the column that the given item is in. The flag is necessary because when an image is being
     * moved to the resulting item location, the decision of whether or not to insert before or
     * after the item changes if the process wrapped around the column.
     */
    this._getItemInfoAbove = function (inItem) {
        var orderables = this.orderableFinder (this._container);
        var curIndex = dojo.indexOf (orderables, inItem);
        var curCoords = dojo.coords (inItem);
        var i, iCoords;

        // Handle case where the passed-in item is *not* an "orderable"
        if (curIndex < 0) {
            return {item: orderables[0], hasWrapped: false};
        }

        for (i = curIndex - 1; i > -1; i--) {
            iCoords = dojo.coords(orderables[i]);
            if (iCoords.x == curCoords.x && iCoords.y < curCoords.y) {
                return {item: orderables[i], hasWrapped: false};
            }               
        }
        
        for (i = orderables.length - 1; i > curIndex; i-- ) {
            iCoords = dojo.coords(orderables[i]);
            if (iCoords.x == curCoords.x) {
                return {item: orderables[i], hasWrapped: true};
            }
        }
        
        // Didn't find an item above - return what was passed in
        return {item: inItem, hasWrapped: false};
    };

    this.getItemAbove = function (item) {
        return this._getItemInfoAbove (item).item;   
    }; 
    
    this.moveItemUp = function (item) {
        this._moveItem (item, this._getItemInfoAbove (item), "before", "after");
    };
            
}; // End of GridLayoutHandler
    

