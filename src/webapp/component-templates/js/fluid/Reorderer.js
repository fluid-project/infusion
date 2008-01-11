/*
Copyright 2007 - 2008 University of Toronto
Copyright 2007 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
var fluid = fluid || {};

fluid.Reorderer = function (container, params) {
	// Reliable 'this'.
	//
	var thisReorderer = this;
	var theAvatar = null;
	
	this.domNode = jQuery (container);
    
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
        fluid.mixin (this, params);
    }
    
   /**
    * Return the element within the item that should receive focus. This is determined by 
    * cssClasses.focusTarget. If it is not specified, the item itself is returned.
    * 
    * @param {Object} item
    * @return {Object} The element that should receive focus in the specified item.
    */
	this.findElementToFocus = function (item) {
		var elementToFocus = jQuery ("." + this.cssClasses.focusTarget, item).get (0);
		if (elementToFocus) {
			return elementToFocus;
		}
		return item;
	};
	
	function setupDomNode (domNode) {
		domNode.focus(thisReorderer.handleFocus);
        domNode.blur (thisReorderer.handleBlur);
        domNode.keydown (thisReorderer.handleKeyDown);
        domNode.keyup (thisReorderer.handleKeyUp);
        domNode.removeAttr ("aaa:activedescendent");
 	}	
	
	/**
	 * Changes the current focus to the specified item.
	 * @param {Object} anItem
	 */
	this.focusItem = function(anItem) {
		if (this.activeItem !== anItem) {
            this.changeActiveItemToDefaultState();
            this._setActiveItem (anItem);	
		}
		
		var jActiveItem = jQuery (this.activeItem);
        jActiveItem.removeClass (this.cssClasses.defaultStyle);
        jActiveItem.addClass (this.cssClasses.selected);
        
        this.addFocusToElement (this.findElementToFocus (this.activeItem));
	};
	
	this.addFocusToElement = function (anElement) {
		var jElement = jQuery (anElement);
        if (!jElement.hasTabIndex ()) {
            jElement.tabIndex (-1);
        }
        jElement.focus ();
	};
	
	this.removeFocusFromElement = function (anElement) {
		jQuery (anElement).blur ();
    };

	/**
	 * Changes focus to the active item.
	 */
	this.selectActiveItem = function() {
		if (!this.activeItem) {
			var orderables = this.orderableFinder (this.domNode.get(0));
			if (orderables.length > 0) {
				this._setActiveItem (orderables[0]);
			}
			else {
				return;
			}
		}
		this.focusItem (this.activeItem);
	};
	
    this.handleFocus = function (evt) {
        thisReorderer.selectActiveItem();
        return false;
    };
    
    this.handleBlur = function (evt) {
        // Temporarily disabled blur handling in IE. See FLUID-7 for details.
        if (!jQuery.browser.msie) {
            thisReorderer.changeActiveItemToDefaultState();
        }
    };
    		
	this.changeActiveItemToDefaultState = function() {
		if (this.activeItem) {
			var jActiveItem = jQuery (this.activeItem);
			jActiveItem.removeClass (this.cssClasses.selected);
			jActiveItem.addClass (this.cssClasses.defaultStyle);
			this.removeFocusFromElement (jActiveItem);
		}
	};
	
    this.handleKeyDown = function (evt) {
       if (thisReorderer.activeItem && evt.keyCode === fluid.keys.CTRL) {
           jQuery (thisReorderer.activeItem).removeClass (thisReorderer.cssClasses.selected);
           jQuery (thisReorderer.activeItem).addClass (thisReorderer.cssClasses.dragging);
           thisReorderer.activeItem.setAttribute ("aaa:grab", "true");
           return false;
       }

       return thisReorderer.handleArrowKeyPress(evt);
    };

    this.handleKeyUp = function (evt) {
       if (thisReorderer.activeItem && evt.keyCode === fluid.keys.CTRL) {
           jQuery (thisReorderer.activeItem).removeClass (thisReorderer.cssClasses.dragging);
           jQuery (thisReorderer.activeItem).addClass (thisReorderer.cssClasses.selected);
           thisReorderer.activeItem.setAttribute ("aaa:grab", "supported");
           return false;
       } 
    };
		
	this.handleArrowKeyPress = function (evt) {
        if (thisReorderer.activeItem) {
            switch (evt.keyCode) {
                case fluid.keys.DOWN:
                    evt.preventDefault();
                    thisReorderer.handleDownArrow (evt.ctrlKey);                                
                    return false;
                case fluid.keys.UP: 
                    evt.preventDefault();
                    thisReorderer.handleUpArrow (evt.ctrlKey);                              
                    return false;
                case fluid.keys.LEFT: 
                    evt.preventDefault();
                    thisReorderer.handleLeftArrow (evt.ctrlKey);                                
                    return false;
                case fluid.keys.RIGHT: 
                    evt.preventDefault();
                    thisReorderer.handleRightArrow (evt.ctrlKey);                               
                    return false;
                default:
                    return true;
            }
        }
    };
	
	this.handleUpArrow = function (isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemUp (this.activeItem);
			this.findElementToFocus (this.activeItem).focus();
			this.orderChangedCallback();
		} else {
			this.focusItem (this.layoutHandler.getItemAbove(this.activeItem));
		}			
	};
	
	this.handleDownArrow = function (isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemDown (this.activeItem);
			this.findElementToFocus (this.activeItem).focus();
			this.orderChangedCallback();
		} else {
			this.focusItem (this.layoutHandler.getItemBelow (this.activeItem));
		}
	};
	
	this.handleRightArrow = function (isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemRight (this.activeItem);
			jQuery(this.findElementToFocus (this.activeItem)).focus();
			this.orderChangedCallback();	
	
		} else {
			this.focusItem (this.layoutHandler.getRightSibling (this.activeItem));				
		}			
	};
	
	this.handleLeftArrow = function (isCtrl) {
		if (isCtrl) {
			this.layoutHandler.moveItemLeft (this.activeItem);
			this.findElementToFocus (this.activeItem).focus();
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
			this.domNode.attr ("aaa:activedescendent", this.activeItem.id);
		} else {
			this.domNode.removeAttr ("aaa:activedescendent");
		}
	};

    var dropMarker; // private scratch variable
    
    /**
     * evt.data - the droppable DOM element.
     */
    function trackMouseMovement (evt) {
        if (thisReorderer.layoutHandler.isMouseBefore (evt, evt.data)) {
           jQuery (evt.data).before (dropMarker);
       }        
       else {
           jQuery (evt.data).after (dropMarker);
       }
	}

    /**
     * Given an item, make it draggable.
     */
    function setUpDraggable (anItem) {
        anItem.draggable ({
            helper: function() {
                theAvatar = jQuery (this).clone();
                jQuery (theAvatar).removeAttr ("id");
                jQuery ("[id]", theAvatar).removeAttr ("id");
                jQuery (":hidden", theAvatar).remove(); 
                jQuery ("input", theAvatar).attr ("disabled", "true"); 
                theAvatar.addClass (thisReorderer.cssClasses.avatar);           
                return theAvatar;
            },
            start: function (e, ui) {
                thisReorderer.focusItem (ui.draggable.element);                
                jQuery (ui.draggable.element).addClass (thisReorderer.cssClasses.dragging);
                ui.draggable.element.setAttribute ("aaa:grab", "true");
                
                // In order to create valid html, the drop marker is the same type as the node being dragged.
                // This creates a confusing UI in cases such as an ordered list. 
                // drop marker functionality should be made pluggable. 
                dropMarker = document.createElement (ui.draggable.element.tagName);
                jQuery (dropMarker).addClass (thisReorderer.cssClasses.dropMarker);
                dropMarker.style.visibility = "hidden";
            },
            stop: function(e, ui) {
                jQuery (ui.draggable.element).removeClass (thisReorderer.cssClasses.dragging);
                thisReorderer.activeItem.setAttribute ("aaa:grab", "supported");
                thisReorderer.domNode.focus();
                if (dropMarker.parentNode) {
                    dropMarker.parentNode.removeChild (dropMarker);
                }
                theAvatar = null;
            }
        });
    
    }   // end setUpDraggable()

    /**
     * Make item a drop target.
     */
    function setUpDroppable (anItem, selector) {
        anItem.droppable ({
            accept: selector,
            tolerance: "pointer",
            over: function (e, ui) {
                // the second parameter to bind() can be accessed through the event as event.data
                jQuery (ui.droppable.element).bind ("mousemove", ui.droppable.element, trackMouseMovement);    
                jQuery (theAvatar).bind ("mousemove", ui.droppable.element, trackMouseMovement);            
                dropMarker.style.visibility = "visible";
            },
            out: function (e, ui) {
                dropMarker.style.visibility = "hidden";
                jQuery (ui.droppable.element).unbind ("mousemove", trackMouseMovement);
                jQuery (theAvatar).unbind ("mousemove", trackMouseMovement);            
            },
            drop: function (e, ui) {
                if (thisReorderer.layoutHandler.isMouseBefore (e, this)) {
                    jQuery (ui.droppable.element).before (ui.draggable.element);
                } else {
                    jQuery (ui.droppable.element).after (ui.draggable.element);
                }
                jQuery (ui.droppable.element).unbind ("mousemove", trackMouseMovement);
                jQuery (theAvatar).unbind ("mousemove", trackMouseMovement);            
                thisReorderer.orderChangedCallback();
            }
        });
    
    }   // end setUpDroppable().
 
    /**
     * Given an item, make it a draggable and a droppable with the relevant properties and functions.
     * @param  anItem      The element to make draggable and droppable.
     * @param  selector    The jQuery selector(s) that select all the orderables.
     */ 
    function setUpDnDItem (anItem, selector) {
        anItem.mouseover ( 
            function () {
            	jQuery (this).addClass (thisReorderer.cssClasses.hover);
            }
        );
    	
        anItem.mouseout (  
            function () {
                jQuery (this).removeClass (thisReorderer.cssClasses.hover);
            }
        );
  
        // Make anItem draggable and a drop target (in the jQuery UI sense).
        setUpDraggable (anItem);
        setUpDroppable (anItem, selector);
            
    }   // end setUpDnDItem()
    	
	function initOrderables() {
        var items = thisReorderer.orderableFinder (thisReorderer.domNode.get(0));
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
        	if (i !== items.length - 1) {
        		selector += ", ";
        	}        	      	
        }

         // Setup orderable item including drag and drop.
         for (i = 0; i < items.length; i++) {
            jQuery (items[i]).addClass (thisReorderer.cssClasses.defaultStyle);
            setUpDnDItem (jQuery (items[i]), selector);
        }
        
        // Add any other drop targets (e.g., any unmoveable ones).
        if ((thisReorderer.droppableFinder) && (thisReorderer.droppableFinder.constructor === Function)) {
            var extraDropTargets = thisReorderer.droppableFinder (thisReorderer.domNode);
            for (i = 0; i < extraDropTargets.length; i++) {
                var jExtraDropTarget = jQuery (extraDropTargets[i]);
                if (!jExtraDropTarget.droppableInstance()) {
                    setUpDroppable (jExtraDropTarget, selector);
                }
            }
        }
    }   // end initOrderables().

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
        setupDomNode(this.domNode);
        initOrderables();
    }
}; // End Reorderer

/*******************
 * Layout Handlers *
 *******************/
(function () {
	// Shared private functions.
	var moveItem = function (item, relatedItemInfo, defaultPlacement, wrappedPlacement) {
        var itemPlacement = defaultPlacement;
        if (relatedItemInfo.hasWrapped) {
            itemPlacement = wrappedPlacement;
        }
        
        // The "after" and "before" strings are an artifact of using dojo.place. 
        // This should be refactored. 
        if (itemPlacement === "after") {
            jQuery (relatedItemInfo.item).after (item);
        } else {
            jQuery (relatedItemInfo.item).before (item);
        } 
    };
    
    /**
     * For drag-and-drop during the drag:  is the mouse over the "before" half
     * of the droppable?  In the case of a vertically oriented set of orderables,
     * "before" means "above".  For a horizontally oriented set, "before" means
     * "left of".
     */
    var isMouseBefore = function (evt, droppableEl, orientation) {
        var mid;
        if (orientation === fluid.orientation.VERTICAL) {
            mid = jQuery (droppableEl).offset().top + (droppableEl.offsetHeight / 2);
            return (evt.pageY < mid);
        } else {
            mid = jQuery (droppableEl).offset().left + (droppableEl.offsetWidth / 2);
            return (evt.clientX < mid);
        }
    };    

    var itemInfoFinders = {
        /*
         * A general get{Left|Right}SiblingInfo() given an item, a list of orderables and a direction.
         * The direction is encoded by either a +1 to move right, or a -1 to
         * move left, and that value is used internally as an increment or
         * decrement, respectively, of the index of the given item.
         */
        getSiblingInfo: function (item, orderables, /* +1, -1 */ incDecrement) {
            var index = jQuery (orderables).index (item) + incDecrement;
            var hasWrapped = false;
                
            // Handle wrapping to 'before' the beginning. 
            if (index === -1) {
                index = orderables.length - 1;
                hasWrapped = true;
            }
            // Handle wrapping to 'after' the end.
            else if (index === orderables.length) {
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
        },

        /*
         * Returns an object containing the item that is to the right of the given item
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the row that the given item is in
         */
        getRightSiblingInfo: function (item, orderables) {
            return this.getSiblingInfo (item, orderables, 1);
        },
        
        /*
         * Returns an object containing the item that is to the left of the given item
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the row that the given item is in
         */
        getLeftSiblingInfo: function (item, orderables) {
            return this.getSiblingInfo (item, orderables, -1);
        },
        
        /*
         * Returns an object containing the item that is below the given item in the current grid
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the column that the given item is in. The flag is necessary because when an image is being
         * moved to the resulting item location, the decision of whether or not to insert before or
         * after the item changes if the process wrapped around the column.
         */
        getItemInfoBelow: function (inItem, orderables) {
            var curCoords = jQuery (inItem).offset();
            var i, iCoords;
            var firstItemInColumn, currentItem;
            
            for (i = 0; i < orderables.length; i++) {
                currentItem = orderables [i];
                iCoords = jQuery (orderables[i]).offset();
                if (iCoords.left === curCoords.left) {
                    firstItemInColumn = firstItemInColumn || currentItem;
                    if (iCoords.top > curCoords.top) {
                        return {item: currentItem, hasWrapped: false};
                    }
                }
            }
    
            firstItemInColumn = firstItemInColumn || orderables [0];
            return {item: firstItemInColumn, hasWrapped: true};
        },
        
        /*
         * Returns an object containing the item that is above the given item in the current grid
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the column that the given item is in. The flag is necessary because when an image is being
         * moved to the resulting item location, the decision of whether or not to insert before or
         * after the item changes if the process wrapped around the column.
         */
         getItemInfoAbove: function (inItem, orderables) {
            var curCoords = jQuery (inItem).offset();
            var i, iCoords;
            var lastItemInColumn, currentItem;
            
            for (i = orderables.length - 1; i > -1; i--) {
                currentItem = orderables [i];
                iCoords = jQuery (orderables[i]).offset();
                if (iCoords.left === curCoords.left) {
                    lastItemInColumn = lastItemInColumn || currentItem;
                    if (curCoords.top > iCoords.top) {
                        return {item: currentItem, hasWrapped: false};
                    }
                }
            }
    
            lastItemInColumn = lastItemInColumn || orderables [0];
            return {item: lastItemInColumn, hasWrapped: true};
        }
    
    };
    
    // Public layout handlers.
	fluid.ListLayoutHandler = function (/*function*/ orderableFinder, container) {
        // Unwrap the container if it's a jQuery.
        if (container.jquery) {
            container = container.get(0);
        }
       
        this.orderableFinder = orderableFinder;
	    	    
	    this.orientation = fluid.orientation.VERTICAL;  // default.
	    	    
	    this.getRightSibling = function (item) {
	        return itemInfoFinders.getRightSiblingInfo(item, this.orderableFinder(container)).item;
	    };
	    
	    this.moveItemRight = function (item) {
	        moveItem (item, itemInfoFinders.getRightSiblingInfo(item, this.orderableFinder(container)), "after", "before");
	    };
	
	    this.getLeftSibling = function (item) {
	        return itemInfoFinders.getLeftSiblingInfo(item, this.orderableFinder(container)).item;
	    };
	
	    this.moveItemLeft = function (item) {
	        moveItem (item, itemInfoFinders.getLeftSiblingInfo(item, this.orderableFinder(container)), "before", "after");
	    };
	
	    this.getItemBelow = this.getRightSibling;
	
	    this.getItemAbove = this.getLeftSibling;
	    
	    this.moveItemUp = this.moveItemLeft;
	    
	    this.moveItemDown = this.moveItemRight;
	
        this.isMouseBefore = function(evt, droppableEl) {
        	return isMouseBefore(evt, droppableEl, this.orientation);
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
	fluid.GridLayoutHandler = function (/*function*/ orderableFinder, container) {
		// Unwrap the container if it's a jQuery.
		if (container.jquery) {
			container = container.get(0);
		}
	   
	    fluid.ListLayoutHandler.call (this, orderableFinder, container);
	    this.orientation = fluid.orientation.HORIZONTAL;
	                    
	    this.getItemBelow = function(item) {
	        return itemInfoFinders.getItemInfoBelow (item, this.orderableFinder(container)).item;
	    };
	
	    this.moveItemDown = function (item) {
	        moveItem (item, itemInfoFinders.getItemInfoBelow (item, this.orderableFinder(container)), "after", "before");
	    };
	            
	    this.getItemAbove = function (item) {
	        return itemInfoFinders.getItemInfoAbove (item, this.orderableFinder(container)).item;   
	    }; 
	    
	    this.moveItemUp = function (item) {
	        moveItem (item, itemInfoFinders.getItemInfoAbove (item, this.orderableFinder(container)), "before", "after");
	    };
	                
	}; // End of GridLayoutHandler

	/*
	 * Portlet Layout Handler for reordering portlet-type markup.
	 * 
	 * General movement guidelines:
	 * 
	 * - Arrowing sideways will always go to the top (moveable) portlet in the column
	 * - Moving sideways will always move to the top available drop target in the column
	 * - Wrapping is not necessary at this first pass, but is ok
	 */
	fluid.PortletLayoutHandler = function (/*function*/ orderableFinder, container,
	        /* JSON object */ portletLayoutJSON,
	        /* JSON object */ dropTargetPermissionsJSON) {
	    
	    // Private members.
	    var thisLH = this; // Hold onto this layouthandler for the enclosed private functions.
	    var portletLayout = portletLayoutJSON;
	    var dropTargetPermissions = dropTargetPermissionsJSON;
	    
	    // Unwrap the container if it's a jQuery.
        if (container.jquery) {
            container = container.get(0);
        }
        
	    // Public members.
	    this.orderableFinder = orderableFinder;
	    
	    // Private Methods.
        /*
	     * A general get{Above|Below}SiblingInfo() given an item and a direction.
	     * The direction is encoded by either a +1 to move down, or a -1 to
	     * move up, and that value is used internally as an increment or
	     * decrement, respectively, of the index of the given item.
	     * This implementation does not wrap around. 
	     */
	    var getVerticalSiblingInfo = function (item, /* +1, -1 */ incDecrement) {
	        var orderables = thisLH.orderableFinder (container);
	        var index = jQuery(orderables).index(item) + incDecrement;
	        var hasWrapped = false;
	            
	        // If we wrap, backup 
	        if ((index === -1) || (index === orderables.length)) {
	            return {item: null, hasWrapped: true};
	        }
	        // Handle case where the passed-in item is *not* an "orderable"
	        // (or other undefined error).
	        //
	        else if (index < -1 || index > orderables.length) {
	            index = 0;
	        }
	        
	        return {item: orderables[index], hasWrapped: hasWrapped};
	    };
	
	    /*
	     * A general get{Beside}SiblingInfo() given an item and a direction.
	     * The direction is encoded by either a +1 to move right, or a -1 to
	     * move left.
	     * Currently, the horizontal sibling defaults to the top orderable item in the
	     * neighboring column.
	     */
	    var getHorizontalSiblingInfo = function (item, /* +1, -1 */ incDecrement) {
	        var hasWrapped = false;
	        var orderables = thisLH.orderableFinder (container);
	            
	        var colIndex = -1;
	        for (var col = 0; col < portletLayout.columns.length; col++) {
	            if (jQuery(portletLayout.columns[col].children).index(item.id) !== -1) {
	                colIndex = col;
	                break;
	            }
	        }
	        if (colIndex === -1) {
	            return {item: null, hasWrapped: true};
	        }
	
	        colIndex = colIndex + incDecrement;
	        var itemIndex = 0;
	        var id = portletLayout.columns[colIndex].children[itemIndex];
	        var sibling = jQuery ("#" + id).get (0);
	        while (orderables.index (sibling) === -1) {
	            itemIndex += 1;
	            id = portletLayout.columns[colIndex].children[itemIndex];
	            sibling = jQuery ("#" + id).get (0);
	        }
	        return {item: sibling, hasWrapped: false};
	
	    };
	    
	    var getRightSiblingInfo = function(item) {
	        if (thisLH._isInRightmostColumn(item)) {
	            return {item: item, hasWrapped: true};
	        } else {
	            return getHorizontalSiblingInfo(item, 1);
	        }
	    };
	    
	    var getLeftSiblingInfo = function(item) {
	        if (thisLH._isInLeftmostColumn(item)) {
	            return {item: item, hasWrapped: true};
	        } else {
	            return getHorizontalSiblingInfo(item, -1);
	        }
	    };
	    
	    var getItemInfoBelow = function (item) {
	        if (thisLH._isLastInColumn(item)) {
	            return {item:item, hasWrapped:true};
	        } else {
	            return getVerticalSiblingInfo (item, 1);
	        }
	    };
	    
	    var getItemInfoAbove = function (item) {
	        if (thisLH._isFirstInColumn(item)) {
	            return {item:item, hasWrapped:true};
	        } else {
	            return getVerticalSiblingInfo (item, -1);
	        }
	    };
	
	    var isAtEndOfColumn = function (item, column) {
	        var index = null;
	        for (var col = 0; col < portletLayout.columns.length; col++) {
	            index = jQuery(portletLayout.columns[col].children).index(item.id);
	            if (index >= 0) {
	                break;
	            }
	        }
	        if (index >= 0) {
	            if (column === "top") {
	                return (index === 0) ? true : false;
	            } else {
	                if (index === portletLayout.columns[col].children.length-1) {
	                    return true;
	                } else {
	                    return false;
	                }
	            }
	        }
	        return false;
	    };
	    
	    // Public Methods
	    
	    // These methods are public only for our unit tests. They need to be refactored into a portletlayout object.
	    this._isFirstInColumn = function (item) {
	        return isAtEndOfColumn(item, "top");
	    };
	
	    this._isLastInColumn = function (item) {
	        return isAtEndOfColumn(item, "bottom");
	    };
	    
	    this._isInLeftmostColumn = function (item) {
	        if (jQuery(portletLayout.columns[0].children).index(item.id) !== -1) {
	            return true;
	        } else {
	            return false;
	        }
	    };
	    
	    this._isInRightmostColumn = function (item) {
	        if (jQuery(portletLayout.columns[portletLayout.columns.length-1].children).index(item.id) !== -1) {
	            return true;
	        } else {
	            return false;
	        }
	    };
	    
	    // Identical to ListLayoutHandler, except for privacy settings
	    this.getRightSibling = function (item) {
	        return getRightSiblingInfo(item).item;
	    };
	    
	    // Identical to ListLayoutHandler, except for privacy settings
	    this.moveItemRight = function (item) {
	        moveItem(item, getRightSiblingInfo(item), "before", "after");
	    };
	
	    // Identical to ListLayoutHandler, except for privacy settings
	    this.getLeftSibling = function (item) {
	        return getLeftSiblingInfo(item).item;
	    };
	
	    // Identical to ListLayoutHandler, except for privacy settings
	    this.moveItemLeft = function (item) {
	        moveItem(item, getLeftSiblingInfo(item), "before", "after");
	    };
	
	    // Identical to GridLayoutHandler, except for privacy settings
	    this.getItemAbove = function (item) {
	        return getItemInfoAbove(item).item;
	    };
	    
	    // Identical to GridLayoutHandler, except for privacy settings
	    this.moveItemUp = function (item) {
	        moveItem (item, getItemInfoAbove(item), "before", "after");
	    };
	        
	    // Identical to GridLayoutHandler, except for privacy settings
	    this.getItemBelow = function (item) {
	        return getItemInfoBelow(item).item;
	    };
	
	    // Identical to GridLayoutHandler, except for privacy settings
	    this.moveItemDown = function (item) {
	        moveItem (item, getItemInfoBelow(item), "after", "before");
	    };
	    
	    this.isMouseBefore = function(evt, droppableEl) {
            return isMouseBefore(evt, droppableEl, this.orientation);
        };

	}; // End PortalLayoutHandler
}) ();

