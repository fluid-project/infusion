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
   
fluid.Reorderer = function (container, findItems, layoutHandler, options) {
    // Reliable 'this'.
    var thisReorderer = this;
    
    this.domNode = jQuery (container);

    // the reorderable DOM element that is currently active
    this.activeItem = null;
        
    this.messageNamebase = "message-bundle:";
            
    this.cssClasses = {
        defaultStyle: "orderable-default",
        selected: "orderable-selected",
        dragging: "orderable-dragging",
        hover: "orderable-hover",
        focusTarget: "orderable-focus-target",
        dropMarker: "orderable-drop-marker",
        avatar: "orderable-avatar"
    };

    findItems = fluid.utils.adaptFindItems (findItems);

    // This should be replaced with proper parsing of the options that we expect    
    if (options) {
        fluid.mixin (this, options);
    }
    
   /**
    * Return the element within the item that should receive focus. This is determined by 
    * cssClasses.focusTarget. If it is not specified, the item itself is returned.
    * 
    * @param {Object} item
    * @return {Object} The element that should receive focus in the specified item.
    */
    this.findElementToFocus = function (item) {
        var elementToFocus = jQuery ("." + this.cssClasses.focusTarget, item)[0];
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
        
        // FLUID-143. Disable text selection for the reorderer.
		// ondrag() and onselectstart() are Internet Explorer specific functions.
		// Override them so that drag+drop actions don't also select text in IE.
        if (jQuery.browser.msie) {
			domNode[0].ondrag = function () { return false; }; 
			domNode[0].onselectstart = function () { return false; };
        } 
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
        var selectables = fluid.wrap(findItems.selectables());
        if (selectables.length <= 0) {
            return;
        }
        
        if (!this.activeItem) {
            this._setActiveItem (selectables[0]);
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
            layoutHandler.moveItemUp (this.activeItem);
            this.findElementToFocus (this.activeItem).focus();
        } else {
            this.focusItem (layoutHandler.getItemAbove(this.activeItem));
        }           
    };
    
    this.handleDownArrow = function (isCtrl) {
        if (isCtrl) {
            layoutHandler.moveItemDown (this.activeItem);
            this.findElementToFocus (this.activeItem).focus();
        } else {
            this.focusItem (layoutHandler.getItemBelow (this.activeItem));
        }
    };
    
    this.handleRightArrow = function (isCtrl) {
        if (isCtrl) {
            layoutHandler.moveItemRight (this.activeItem);
            jQuery(this.findElementToFocus (this.activeItem)).focus();
        } else {
            this.focusItem (layoutHandler.getRightSibling (this.activeItem));              
        }           
    };
    
    this.handleLeftArrow = function (isCtrl) {
        if (isCtrl) {
            layoutHandler.moveItemLeft (this.activeItem);
            this.findElementToFocus (this.activeItem).focus();
        } else {
            this.focusItem (layoutHandler.getLeftSibling (this.activeItem));               
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

    // Drag and drop set code starts here. This needs to be refactored to be better contained.
    var theAvatar = null;
    var dropMarker; // private scratch variable
    
    /**
     * evt.data - the droppable DOM element.
     */
    function trackMouseMovement (evt) {
        if (layoutHandler.isMouseBefore (evt, evt.data)) {
           jQuery (evt.data).before (dropMarker);
       }        
       else {
           jQuery (evt.data).after (dropMarker);
       }
    }

    /**
     * Takes a jQuery object and adds 'movable' functionality to it
     */
    function initMovable (item) {
        item.addClass (thisReorderer.cssClasses.defaultStyle);

        item.mouseover ( 
            function () {
                var handle = jQuery (findItems.grabHandle (item[0]));
                handle.addClass (thisReorderer.cssClasses.hover);
            }
        );
        
        item.mouseout (  
            function () {
                var handle = jQuery (findItems.grabHandle (item[0]));
                handle.removeClass (thisReorderer.cssClasses.hover);
            }
        );
        
        item.draggable ({
            helper: function() {
                theAvatar = item.clone();
                jQuery (theAvatar).removeAttr ("id");
                jQuery ("[id]", theAvatar).removeAttr ("id");
                jQuery (":hidden", theAvatar).remove(); 
                jQuery ("input", theAvatar).attr ("disabled", "true"); 
                theAvatar.addClass (thisReorderer.cssClasses.avatar);           
                return theAvatar;
            },
            start: function (e, ui) {
                thisReorderer.focusItem (item[0]);                
                item.addClass (thisReorderer.cssClasses.dragging);
                item.attr ("aaa:grab", "true");
                
                // In order to create valid html, the drop marker is the same type as the node being dragged.
                // This creates a confusing UI in cases such as an ordered list. 
                // drop marker functionality should be made pluggable. 
                dropMarker = document.createElement (item[0].tagName);
                jQuery (dropMarker).addClass (thisReorderer.cssClasses.dropMarker);
                dropMarker.style.visibility = "hidden";
            },
            stop: function(e, ui) {
                item.removeClass (thisReorderer.cssClasses.dragging);
                thisReorderer.activeItem.setAttribute ("aaa:grab", "supported");
                thisReorderer.domNode.focus();
                if (dropMarker.parentNode) {
                    dropMarker.parentNode.removeChild (dropMarker);
                }
                theAvatar = null;
            },
            handle: findItems.grabHandle (item[0])
        });
    }   

    /**
     * Takes a jQuery object and a selector that matches movable items
     */
    function initDropTarget (item, selector) {
        item.droppable ({
            accept: selector,
            tolerance: "pointer",
            over: function (e, ui) {
                // the second parameter to bind() can be accessed through the event as event.data
                item.bind ("mousemove", item[0], trackMouseMovement);    
                jQuery (theAvatar).bind ("mousemove", item[0], trackMouseMovement);            
                dropMarker.style.visibility = "visible";
            },
            out: function (e, ui) {
                dropMarker.style.visibility = "hidden";
                item.unbind ("mousemove", trackMouseMovement);
                jQuery (theAvatar).unbind ("mousemove", trackMouseMovement);            
            },
            drop: function (e, ui) {
                layoutHandler.mouseMoveItem (e, ui.draggable.element, item[0]);
                item.unbind ("mousemove", trackMouseMovement);
                jQuery (theAvatar).unbind ("mousemove", trackMouseMovement);            
            }
        });
    }
        
    function initItems() {
        var i;
        var movables = fluid.wrap (findItems.movables());
        var dropTargets = fluid.wrap (findItems.dropTargets());
        
        // Selector based on the ids of the nodes for use with drag and drop.
        // This should be replaced with using the actual nodes rather then a selector 
        // but will require a patch to jquery's DnD. 
        // See: FLUID-71, FLUID-112
        var selector = "";

        // Setup moveables
        for (i = 0; i < movables.length; i++) {
            var item = movables[i];
            initMovable (jQuery (item));

            // Build the selector
             selector += "[id=" + item.id + "]";
             if (i !== movables.length - 1) {
                 selector += ", ";
             }
        }

         // Setup dropTargets
        for (i = 0; i < dropTargets.length; i++) {
            initDropTarget (jQuery (dropTargets[i]), selector);
        }  
    } 

    // Final initialization of the Reorderer at the end of the construction process 
    if (this.domNode) {
        setupDomNode(this.domNode);
        initItems();
    }
}; // End Reorderer

/*******************
 * Layout Handlers *
 *******************/
(function () {
    // Shared private functions.
    var moveItem = function (item, relatedItemInfo, position, wrappedPosition) {
        var itemPlacement = position;
        if (relatedItemInfo.hasWrapped) {
            itemPlacement = wrappedPosition;
        }
        
        if (itemPlacement === fluid.position.AFTER) {
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
        getSiblingInfo: function (item, orderables, /* NEXT, PREVIOUS */ direction) {
            var index = jQuery (orderables).index (item) + direction;
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
            return this.getSiblingInfo (item, orderables, fluid.direction.NEXT);
        },
        
        /*
         * Returns an object containing the item that is to the left of the given item
         * and a flag indicating whether or not the process has 'wrapped' around the end of
         * the row that the given item is in
         */
        getLeftSiblingInfo: function (item, orderables) {
            return this.getSiblingInfo (item, orderables, fluid.direction.PREVIOUS);
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
    fluid.ListLayoutHandler = function (findItems, options) {
        findItems = fluid.utils.adaptFindItems (findItems);
        var orderChangedCallback = function () {};
        var orientation = fluid.orientation.VERTICAL;
        if (options) {
            orderChangedCallback = options.orderChangedCallback || orderChangedCallback;
            orientation = options.orientation || orientation;
        }
                
        this.getRightSibling = function (item) {
            return itemInfoFinders.getRightSiblingInfo (item, findItems.selectables ()).item;
        };
        
        this.moveItemRight = function (item) {
        	var rightSiblingInfo = itemInfoFinders.getRightSiblingInfo (item, findItems.movables ());
            moveItem (item, rightSiblingInfo, fluid.position.AFTER, fluid.position.BEFORE);
            orderChangedCallback();
        };
    
        this.getLeftSibling = function (item) {
            return itemInfoFinders.getLeftSiblingInfo(item, findItems.selectables ()).item;
        };
    
        this.moveItemLeft = function (item) {
        	var leftSiblingInfo = itemInfoFinders.getLeftSiblingInfo (item, findItems.movables ());
            moveItem (item, leftSiblingInfo, fluid.position.BEFORE, fluid.position.AFTER);
            orderChangedCallback();
        };
    
        this.getItemBelow = this.getRightSibling;
    
        this.getItemAbove = this.getLeftSibling;
        
        this.moveItemUp = this.moveItemLeft;
        
        this.moveItemDown = this.moveItemRight;
    
        this.isMouseBefore = function(evt, droppableEl) {
            return isMouseBefore(evt, droppableEl, orientation);
        };
        
        this.mouseMoveItem = function (e, item, relatedItem) {
            if (this.isMouseBefore (e, relatedItem)) {
                jQuery (relatedItem).before (item);
            } else {
                jQuery (relatedItem).after (item);
            }
            orderChangedCallback(); 
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
	fluid.GridLayoutHandler = function (findItems, options) {
        fluid.ListLayoutHandler.call (this, findItems, options);

        findItems = fluid.utils.adaptFindItems (findItems);
        
        var orderChangedCallback = function () {};
        if (options) {
            orderChangedCallback = options.orderChangedCallback || orderChangedCallback;
        }
        
        var orientation = fluid.orientation.HORIZONTAL;
                
	    this.getItemBelow = function(item) {
	        return itemInfoFinders.getItemInfoBelow (item, findItems.selectables ()).item;
	    };
	
	    this.moveItemDown = function (item) {
	    	var itemBelow = itemInfoFinders.getItemInfoBelow (item, findItems.movables ());
	        moveItem (item, itemBelow, fluid.position.AFTER, fluid.position.BEFORE);
            orderChangedCallback(); 
	    };
	            
	    this.getItemAbove = function (item) {
	        return itemInfoFinders.getItemInfoAbove (item, findItems.selectables ()).item;   
	    }; 
	    
	    this.moveItemUp = function (item) {
	    	var itemAbove = itemInfoFinders.getItemInfoAbove (item, findItems.movables ());
	        moveItem (item, itemAbove, fluid.position.BEFORE, fluid.position.AFTER);
            orderChangedCallback(); 
	    };
	                
	    // We need to override ListLayoutHandler.isMouseBefore to ensure that the local private
	    // orientation is used.
        this.isMouseBefore = function(evt, droppableEl) {
            return isMouseBefore(evt, droppableEl, orientation);
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
    fluid.PortletLayoutHandler = function (layout, targetPerms, options) {
        var orientation = fluid.orientation.VERTICAL;
        var orderChangedCallback = function () {};
        if (options) {
            orderChangedCallback = options.orderChangedCallback || orderChangedCallback;
        }
        
        // Private Methods.
        /*
	     * Find an item's sibling in the vertical direction based on the
	     * layout.  This assumes that there is no wrapping the top and
	     * bottom of the columns, and returns the given item if at top
	     * and seeking the previous item, or at the bottom and seeking

	     * the next item.
	     */
	    var getVerticalSibling = function (item, /* NEXT, PREVIOUS */ direction) {
	    	var siblingId = fluid.portletLayout.itemAboveBelow (item.id, direction, layout);
            return fluid.utils.jById (siblingId)[0];
	    };
	
	    /*
	     * Find an item's sibling in the horizontal direction based on the
	     * layout.  This assumes that there is no wrapping the ends of
	     * the rows, and returns the given item if left most and
	     * seeking the previous item, or if right most and seeking
	     * the next item.
	     */
	    var getHorizontalSibling = function (item, /* NEXT, PREVIOUS */ direction) {
	        var itemId = fluid.portletLayout.firstItemInAdjacentColumn (item.id, direction, layout);
	        return fluid.utils.jById (itemId)[0];
        };
	    	    
        // This should probably be part of the public API so it can be configured.
        var move = function (item, relatedItem, position /* BEFORE or AFTER */) {
            if (!item || !relatedItem || 
                !fluid.portletLayout.canMove (item.id, relatedItem.id, position, layout, targetPerms)) {
                return;
            }           
            if (position === fluid.position.BEFORE) {
                jQuery (relatedItem).before (item);
            }
            else {
                jQuery (relatedItem).after (item);
            }
            fluid.portletLayout.updateLayout (item.id, relatedItem.id, position, layout);
            layout = orderChangedCallback() || layout; 
        };
        
        var moveHorizontally = function (item, direction /* PREVIOUS, NEXT */) {
            var targetInfo = fluid.portletLayout.firstMoveableTarget (item.id, direction, layout, targetPerms);
            var targetItem = fluid.utils.jById (targetInfo.id)[0];
            move (item, targetItem, targetInfo.position);
        };
        
        var moveVertically = function (item, direction /* PREVIOUS, NEXT */) {
            var target = fluid.portletLayout.nearestMoveableTarget (item.id, direction, layout, targetPerms);
            var targetItem = fluid.utils.jById (target.id)[0];
            move (item, targetItem, target.position);
        };
        
        // Public Methods
	    this.getRightSibling = function (item) {
	        return getHorizontalSibling (item, fluid.direction.NEXT);
	    };
	    
	    this.moveItemRight = function (item) {
	    	moveHorizontally (item, fluid.direction.NEXT);
	    };
	
	    this.getLeftSibling = function (item) {
	        return getHorizontalSibling (item, fluid.direction.PREVIOUS);
	    };
	
	    this.moveItemLeft = function (item) {
            moveHorizontally (item, fluid.direction.PREVIOUS);
	    };
	
	    this.getItemAbove = function (item) {
	    	if (fluid.portletLayout.isFirstInColumn (item.id, layout)) {
                return item;
            } else {
                return getVerticalSibling (item, fluid.direction.PREVIOUS);
            }
	    };
	    
	    this.moveItemUp = function (item) {
	        moveVertically (item, fluid.direction.PREVIOIUS);
	    };
	        
	    this.getItemBelow = function (item) {
	    	if (fluid.portletLayout.isLastInColumn (item, layout)) {
                return item;
            } else {
                return getVerticalSibling (item, fluid.direction.NEXT);
            }
	    };
	
	    this.moveItemDown = function (item) {
	        moveVertically (item, fluid.direction.NEXT);
	    };
	    
	    this.isMouseBefore = function(evt, droppableEl) {
            return isMouseBefore(evt, droppableEl, orientation);
        };

        this.mouseMoveItem = function (e, item, relatedItem) {
            if (this.isMouseBefore (e, relatedItem)) {
                move (item, relatedItem, fluid.position.BEFORE);
            } else {
                move (item, relatedItem, fluid.position.AFTER);
            }
        };
        
    }; // End PortalLayoutHandler
}) ();

fluid.portletLayout = function () {
	// Public API.
    return {
       /**
        * Determine if a given item can move before or after the given target position, given the
        * permissions information.
        */
    	canMove: function (itemId, targetItemId, position, layout, perms) {
            var itemIndex = fluid.portletLayout.findLinearIndex(itemId, layout);
            var targetItemIndex = fluid.portletLayout.findLinearIndex(targetItemId, layout);
    		
            return (!!perms[itemIndex][targetItemIndex][position]); 
        },
        
        /**
         * Calculate the location of the item and the column in which it resides.
         * @return  An object with column index and item index (within that column) properties.
         *          These indices are -1 if the item does not exist in the grid.
         */
        calcColumnAndItemIndex: function (itemId, layout) {
            var indices = { columnIndex: -1, itemIndex: -1 };
            for (var col = 0; col < layout.columns.length; col++) {
                var itemIndex = jQuery (layout.columns[col].children).index (itemId);
                if (itemIndex !== -1) {
                    indices.columnIndex = col;
                    indices.itemIndex = itemIndex;
                    break;
                }                
            }
            return indices;
        },
        
        findColIndex: function (itemId, layout) {
        	return fluid.portletLayout.calcColumnAndItemIndex (itemId, layout).columnIndex;
        },
        
        findItemIndex: function (itemId, layout) {
            return fluid.portletLayout.calcColumnAndItemIndex (itemId, layout).itemIndex;
        },
        
 
      /**

         * Given an item id, and a direction, find the top item in the next/previous column.
         */
        firstItemInAdjacentColumn: function (itemId, /* PREVIOUS, NEXT */ direction, layout) {
            var siblingId = itemId;
            var coords = fluid.portletLayout.calcColumnAndItemIndex (itemId, layout);
            var numColumns = fluid.portletLayout.numColumns (layout);
            
            // Go to the top of the next/previous column

            coords.columnIndex += direction;
            if ((coords.columnIndex >= 0) && (coords.columnIndex < numColumns)) {
                siblingId = fluid.portletLayout.getItemAt (coords.columnIndex, 0, layout);
            }
            return siblingId;
        }, 

        
        /**
         * Return the first orderable item in the given column.
         */
        findFirstOrderableSiblingInColumn:  function (columnIndex, orderableItems, layout) {
            // Pull out the portlet id of the top-most sibling in the column.
            var topMostOrderableSibling = null;
            var itemIndex = 0;
            var column = layout.columns[columnIndex];
            if (column) {
                var id = column.children[itemIndex];
                topMostOrderableSibling = fluid.utils.jById (id)[0];
                // loop down the column looking for first orderable portlet (i.e. skip over non-movable portlets)
                while (orderableItems.index (topMostOrderableSibling) === -1) {
                    itemIndex += 1;
                    id = column.children[itemIndex];
                    topMostOrderableSibling = fluid.utils.jById (id)[0];
                }
            }
            return topMostOrderableSibling;
        },
        
        /**
         * Return the item above/below the given item within that item's column.  If at
         * bottom of column or at top, return the item itelf (no wrapping).
         */
        itemAboveBelow: function (itemId, /*PREVIOUS, NEXT*/ direction, layout) {
        	
        	var coords = fluid.portletLayout.calcColumnAndItemIndex (itemId, layout);
            var siblingIndex = coords.itemIndex + direction;
            var numItems = fluid.portletLayout.numItemsInColumn (coords.columnIndex, layout);
            if ((siblingIndex < 0) || (siblingIndex >= numItems)) {
                return itemId;
            }
            else {
                return fluid.portletLayout.getItemAt (coords.columnIndex, siblingIndex, layout);
            }
        },

        /**
         * Return the number of items in the given column.  If the column index
         * is out of bounds, this returns -1.
         */
        numItemsInColumn: function (columnIndex, layout) {
            if ((columnIndex < 0) || (columnIndex > layout.columns.length)) {
                return -1;
            }
            else {
               return layout.columns[columnIndex].children.length;
            }
        },
        
        numColumns: function (layout) {
            return layout.columns.length;
        },
        
        isColumn: function (index, layout) {
            return (index < layout.columns.length) && (index >= 0);
        },

        findLinearIndex: function (itemId, layout) {
            var columns = layout.columns;
            var linearIndex = 0;
            
            for (var i = 0; i < columns.length; i++) {
                var idsInCol = columns[i].children;
                for (var j = 0; j < idsInCol.length; j++) {
                    if (idsInCol[j] === itemId) {
                        return linearIndex;
                    }
                    linearIndex++;
                }
            }
            return -1;
        },
        
        /**
         * Move an item within the layout object. 
         */
        updateLayout: function (itemId, relativeItemId, position, layout) {
            if (!itemId || !relativeItemId || itemId === relativeItemId) { 
                return; 
            }
            var itemIndices = fluid.portletLayout.calcColumnAndItemIndex (itemId, layout);
            layout.columns[itemIndices.columnIndex].children.splice (itemIndices.itemIndex, 1);

            var relativeItemIndices = fluid.portletLayout.calcColumnAndItemIndex (relativeItemId, layout);
            var targetCol = layout.columns[relativeItemIndices.columnIndex].children;
            targetCol.splice (relativeItemIndices.itemIndex + position, 0, itemId);
        },
        
        /**
         * Find the first target that can be moved in the given column, possibly moving to the next
         * column, left or right, depending on which direction we are moving. 
         */
        firstMoveableTarget: function (itemId, /* NEXT, PREVIOUS */ direction, layout, perms) {
            // default return value is "the item itself".
            var firstPossibleTarget = { id: itemId, position: fluid.position.BEFORE };
            var found = false;
            var targetColIndex = fluid.portletLayout.findColIndex (itemId, layout) + direction;
            
            // Safety check -- can't search before the 0'th column -- declare found so first loop bails.
            if (targetColIndex < 0 || targetColIndex >= fluid.portletLayout.numColumns (layout)) {
                found = true;               
            }
            
            // Loop thru all of the columns beginning with the <targetColIndex>'th column.
            for (var i = targetColIndex; fluid.portletLayout.isColumn (i, layout) && !found; i += direction) {
                // Loop thru the target column's items, looking for the first item that can be moved to.
                var idsInCol = layout.columns[i].children;
                for (var j = 0; (j < idsInCol.length) && !found; j++) {
                    var possibleTargetId = idsInCol[j];
                    if ((found = fluid.portletLayout.canMove (itemId, possibleTargetId, fluid.position.BEFORE, layout, perms))) {
                        firstPossibleTarget.id = possibleTargetId;
                        firstPossibleTarget.position = fluid.position.BEFORE;
                    }
                    else if ((found = fluid.portletLayout.canMove (itemId, possibleTargetId, fluid.position.AFTER, layout, perms))) {
                        firstPossibleTarget.id = possibleTargetId;
                        firstPossibleTarget.position = fluid.position.AFTER;
                    }
                }
            }
            return firstPossibleTarget;
        },

        nearestMoveableTarget: function (itemId, /* NEXT, PREVIOUS */ direction, layout, perms) {
            if (direction === fluid.direction.NEXT) {
                return fluid.portletLayout.nearestNextMoveableTarget (itemId, layout, perms);
            }
            else {
                return fluid.portletLayout.nearestPreviousMoveableTarget (itemId, layout, perms);
            }
        },
        
        nearestNextMoveableTarget: function (itemId, layout, perms) {
            // default return value is "the item itself".
            var nextPossibleTarget = { id: itemId, position: fluid.position.AFTER };
            var found = false;
            var startCoords = fluid.portletLayout.calcColumnAndItemIndex (itemId, layout);
            
            // Safety check calcColumnAndItemIndex() returns either valid indices or negative
            // values.  If the column index is negative, set found.
            if (startCoords.columnIndex < 0) {
                found = true;
            }
            
            if (!found) {
                // Loop thru the target column's items, starting with the item just after the given item
                // looking for an item that can be moved to (after).
                var idsInCol = layout.columns[startCoords.columnIndex].children;
                for (var i = startCoords.itemIndex + 1; (i < idsInCol.length) && !found; i++) {
                    var possibleTargetId = idsInCol[i];
                    if ((found = fluid.portletLayout.canMove (itemId, possibleTargetId, fluid.position.AFTER, layout, perms))) {
                        nextPossibleTarget.id = possibleTargetId;
                    }
                }
            }
            return nextPossibleTarget;
        },
        
        nearestPreviousMoveableTarget: function (itemId, layout, perms) {
            // default return value is "the item itself".
            var previousPossibleTarget = { id: itemId, position: fluid.position.BEFORE };
            var found = false;
            var startCoords = fluid.portletLayout.calcColumnAndItemIndex (itemId, layout);
            
            // Safety check calcColumnAndItemIndex() returns either valid indices or negative
            // values.  If the column index is negative, set found.
            if (startCoords.columnIndex < 0)  {
                found = true;
            }

            if (!found) {
                // Loop thru the target column's items, starting with the item just before the given item,
                // looking for an item that can be moved to (before).
                var idsInCol = layout.columns[startCoords.columnIndex].children;
                for (var i = startCoords.itemIndex - 1; (i > -1) && !found; i--) {
                    var possibleTargetId = idsInCol[i];
                    if ((found = fluid.portletLayout.canMove (itemId, possibleTargetId, fluid.position.BEFORE, layout, perms))) {
                        previousPossibleTarget.id = possibleTargetId;
                    }
                }
            }
            return previousPossibleTarget;
        },
        
        /**
         * Return the item in the given column (index) and at the given position (index)
         * in that column.  If either of the column or item index is out of bounds, this
         * returns null.
         */
        getItemAt: function (columnIndex, itemIndex, layout) {
            var itemId = null;
            if ((columnIndex >= 0) && (columnIndex < fluid.portletLayout.numColumns (layout))) {
                if ((itemIndex >= 0) && (itemIndex < fluid.portletLayout.numItemsInColumn (columnIndex, layout))) {
                    itemId = layout.columns[columnIndex].children[itemIndex];
                }
            }
            return itemId;
        },
        
        isFirstInColumn: function (itemId, layout) {
            return (fluid.portletLayout.findItemIndex (itemId, layout) === 0);
        },
    
        isLastInColumn: function (itemId, layout) {
            var position = fluid.portletLayout.calcColumnAndItemIndex (itemId, layout);
            return (position.itemIndex === fluid.portletLayout.numItemsInColumn (position.columnIndex, layout)-1) ? true : false;
        },
        
        isInLeftmostColumn: function (itemId, layout) {
            return (fluid.portletLayout.findColIndex (itemId, layout) === 0);
        },
        
        isInRightmostColumn: function (itemId, layout) {
            return (fluid.portletLayout.findColIndex (itemId, layout) === fluid.portletLayout.numColumns (layout)-1);
        },
        
        /**
         * Determine the moveables, selectables, and drop targets based on the information
         * in the layout and permission objects.
         */
        createFindItems: function (layout, perms) {
            var findItems = {};
            var selectablesSelector;
            var movablesSelector;
            var dropTargets;

            // Check all the permission pairs in the indexed row.  If any
            // pair has a value of '1', then this item can move.  Otherwise,
            // it is fixed.
            var canItemAtIndexMove = function (linearIndex) {
            	var permsRow = perms[linearIndex];
            	for (var p = 0; p < permsRow.length; p++) {
            		if ((permsRow[p][0] === 1) || (permsRow[p][1] === 1)) {
            			return true;
            		}
            	}
            	return false;
            };
            
            // Check all the permission pairs in the indexed virtual column.  If it's
            // [0,0] all the way down, it's not a drop target.
            var isNotDropTarget = function (linearIndex) {
            	for (var col = 0; col < perms.length; col++) {
            		var permsRow = perms[col];
            		if ((permsRow[linearIndex][0] === 1) || (permsRow[linearIndex][1] === 1)) {
            			return false;
            		}
            	}
            	return true;
            };
              
            var cols = layout.columns;
            for (var i = 0; i < cols.length; i++) {
                var idsInCol = cols[i].children;
                for (var j = 0; j < idsInCol.length; j++) {
                    var idSelector = "[id=" + idsInCol[j] + "]";
                    selectablesSelector = selectablesSelector ? selectablesSelector + "," + idSelector : idSelector;
                    
                    var linearIndex = fluid.portletLayout.findLinearIndex (idsInCol[j], layout);
                    if (canItemAtIndexMove (linearIndex)) {
                        movablesSelector = movablesSelector ? movablesSelector + "," + idSelector : idSelector; 
                    }
                    if (!isNotDropTarget (linearIndex)) {
                    	dropTargets = dropTargets ? dropTargets + "," + idSelector : idSelector;
                    }
                }
            }
            findItems.selectables = function () {
                return jQuery (selectablesSelector);
            };
            findItems.movables = function () {
                return jQuery (movablesSelector);
            };

            findItems.dropTargets = function() {
                return jQuery (dropTargets);
            };
          
            return findItems;
        },
        
        containerId: function (layout) {
            return layout.id;
        }
    };	
} ();
