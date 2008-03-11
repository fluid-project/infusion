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

    var role = fluid.roles.LIST;
        
    this.domNode = jQuery (container);

    // the reorderable DOM element that is currently active
    this.activeItem = undefined;
        
    this.messageNamebase = "message-bundle:";
            
    this.cssClasses = {
        defaultStyle: "orderable-default",
        selected: "orderable-selected",
        dragging: "orderable-dragging",
        hover: "orderable-hover",
        dropMarker: "orderable-drop-marker",
        avatar: "orderable-avatar"
    };

    findItems = fluid.utils.adaptFindItems (findItems);

    // This should be replaced with proper parsing of the options that we expect    
    if (options) {
        role = options.role || role;
        fluid.mixin (this, options);
    }

    var firstSelectable = function () {
        var selectables = fluid.wrap (findItems.selectables());
        if (selectables.length <= 0) {
            return null;
        }
        return selectables[0];
    }
    
    function setupDomNode (domNode) {
        domNode.focus (thisReorderer.focusActiveItem);
        domNode.keydown (thisReorderer.handleKeyDown);
        domNode.keyup (thisReorderer.handleKeyUp);
        var first = firstSelectable();
        if (first) {
            domNode.ariaState ("activedescendent", first.id);
        }
        
        // FLUID-143. Disable text selection for the reorderer.
		// ondrag() and onselectstart() are Internet Explorer specific functions.
		// Override them so that drag+drop actions don't also select text in IE.
        if (jQuery.browser.msie) {
			domNode[0].ondrag = function () { return false; }; 
			domNode[0].onselectstart = function () { return false; };
        } 
        
        domNode.ariaRole (role.container);
        domNode.ariaState ("multiselectable", "false");
        domNode.ariaState ("readonly", "false");
        domNode.ariaState ("disabled", "false");
    }   
    
    this.focusActiveItem = function (evt) {
        // If the active item has not been set yet, set it to the first selectable.
        if (!thisReorderer.activeItem) {
            var first = firstSelectable();
            if (!first) {  
                return evt.stopPropagation();
            }
            jQuery(first).focus ();
        } else {
            thisReorderer.activeItem.focus ();
        }
        return evt.stopPropagation();
    };

    this.handleKeyDown = function (evt) {
        // The the key pressed is ctrl, and the active item is movable we want to restyle the active item.
        if (thisReorderer.activeItem && evt.keyCode === fluid.keys.CTRL) {
        	// Don't treat the active item as dragging unless it is a movable.
            if (jQuery.inArray (thisReorderer.activeItem, findItems.movables()) >= 0) {
                var jActiveItem = jQuery (thisReorderer.activeItem);
                jActiveItem.removeClass (thisReorderer.cssClasses.selected);
                jActiveItem.addClass (thisReorderer.cssClasses.dragging);
                jActiveItem.ariaState ("grab", "true");
            }
            return false;
        }
        
        // The only other keys we listen for are the arrows.
        return thisReorderer.handleArrowKeyDown(evt);
    };

    this.handleKeyUp = function (evt) {
        if (thisReorderer.activeItem && evt.keyCode === fluid.keys.CTRL) {
            // Don't treat the active item as dragging unless it is a movable.
            if (jQuery.inArray (thisReorderer.activeItem, findItems.movables()) >= 0) {
                var jActiveItem = jQuery (thisReorderer.activeItem);
                jActiveItem.removeClass (thisReorderer.cssClasses.dragging);
                jActiveItem.addClass (thisReorderer.cssClasses.selected);
                jActiveItem.ariaState ("grab", "supported");
                return false;
            }
        }
    };

    var handleArrow = function (isMove, moveFunc, nextItemFunc) {
        if (isMove) {

            // only move the target if it is actually movable
            if (jQuery.inArray (thisReorderer.activeItem, findItems.movables()) >= 0) {
                moveFunc (thisReorderer.activeItem);
                // refocus on the active item because moving places focus on the body
                thisReorderer.activeItem.focus();
                jQuery (thisReorderer.activeItem).removeClass (thisReorderer.cssClasses.selected);
            }

        } else {
            nextItemFunc (thisReorderer.activeItem).focus ();
        }           
    };
            
    this.handleArrowKeyDown = function (evt) {
        if (thisReorderer.activeItem) {
            switch (evt.keyCode) {
                case fluid.keys.DOWN:
                    evt.preventDefault();
                    handleArrow (evt.ctrlKey, layoutHandler.moveItemDown, layoutHandler.getItemBelow);
                    return false;
                case fluid.keys.UP: 
                    evt.preventDefault();
                    handleArrow (evt.ctrlKey, layoutHandler.moveItemUp, layoutHandler.getItemAbove);
                    return false;
                case fluid.keys.LEFT: 
                    evt.preventDefault();
                    handleArrow (evt.ctrlKey, layoutHandler.moveItemLeft, layoutHandler.getLeftSibling);
                    return false;
                case fluid.keys.RIGHT: 
                    evt.preventDefault();
                    handleArrow (evt.ctrlKey, layoutHandler.moveItemRight, layoutHandler.getRightSibling);
                    return false;
                default:
                    return true;
            }
        }
    };
    
    this._fetchMessage = function (messagekey) {
        var messageID = this.messageNamebase + messagekey;
        var node = document.getElementById (messageID);
        
        return node? node.innerHTML: "[Message not found at id " + messageID + "]";
    };
    
    this._setActiveItem = function (anItem) {
        this.activeItem = anItem;
        var jItem = jQuery(anItem);
        jItem.removeClass (thisReorderer.cssClasses.defaultStyle);
        jItem.addClass (thisReorderer.cssClasses.selected);
        jItem.ariaState ("selected", "true");
        this.domNode.ariaState ("activedescendent", anItem.id);
    };

    // Drag and drop set code starts here. This needs to be refactored to be better contained.
    var theAvatar = null;
    var dropMarker; // instantiated below in item.draggable.start().
    
    function createTrackMouseMovement (target, moving) {
        return function trackMouseMovement (evt) {
                var dropInfo = layoutHandler.isDropBefore (target, moving, evt.clientX, evt.pageY);
                if (dropInfo === fluid.position.NO_TARGET) {
        	       dropMarker.style.visibility = "hidden";
                }
                else if (dropInfo === fluid.position.BEFORE) {
                    jQuery (target).before (dropMarker);
                    dropMarker.style.visibility = "visible";
                }
                else {  // must be AFTER
                   jQuery (target).after (dropMarker);
                   dropMarker.style.visibility = "visible";
                }
            };
     }

    /**
     * Takes a jQuery object and adds 'movable' functionality to it
     */
    function initMovable (item) {
        item.addClass (thisReorderer.cssClasses.defaultStyle);
        item.ariaState ("grab", "supported");

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
                item[0].focus ();                
                item.removeClass (thisReorderer.cssClasses.selected);
                item.addClass (thisReorderer.cssClasses.dragging);
                item.ariaState ("grab", "true");
                
                // In order to create valid html, the drop marker is the same type as the node being dragged.
                // This creates a confusing UI in cases such as an ordered list. 
                // drop marker functionality should be made pluggable. 
                dropMarker = document.createElement (item[0].tagName);
                jQuery (dropMarker).addClass (thisReorderer.cssClasses.dropMarker);
                dropMarker.style.visibility = "hidden";
            },
            stop: function(e, ui) {
                item.removeClass (thisReorderer.cssClasses.dragging);
                item.addClass (thisReorderer.cssClasses.selected);
                jQuery (thisReorderer.activeItem).ariaState ("grab", "supported");
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
        item.ariaState ("dropeffect", "move");

    	var trackMouseMovement;
        item.droppable ({
            accept: selector,
            tolerance: "pointer",
            over: function (e, ui) {
                trackMouseMovement = createTrackMouseMovement (item[0], ui.draggable.element);
                item.bind ("mousemove", trackMouseMovement);    
                jQuery (theAvatar).bind ("mousemove", trackMouseMovement);
                
            },
            out: function (e, ui) {
                dropMarker.style.visibility = "hidden";
                item.unbind ("mousemove", trackMouseMovement);
                jQuery (theAvatar).unbind ("mousemove", trackMouseMovement);            
            },
            drop: function (e, ui) {
                layoutHandler.mouseMoveItem (ui.draggable.element, item[0], e.clientX, e.pageY);           
                item.unbind ("mousemove", trackMouseMovement);
                jQuery (theAvatar).unbind ("mousemove", trackMouseMovement);            
                // refocus on the active item because moving places focus on the body
                thisReorderer.activeItem.focus();
            }
        });
    }
        
    var changeSelectedToDefault = function (jItem) {
        jItem.removeClass (thisReorderer.cssClasses.selected);
        jItem.addClass (thisReorderer.cssClasses.defaultStyle);
        jItem.ariaState("selected", "false");
    };
    
    var initSelectables = function (selectables) {
        var handleBlur = function (evt) {
            changeSelectedToDefault (jQuery(this));
            return evt.stopPropagation();
        };
        
        var handleFocus = function (evt) {
            if (thisReorderer.activeItem && thisReorderer.activeItem !== this) {
                changeSelectedToDefault (jQuery(thisReorderer.activeItem));
            }
            thisReorderer._setActiveItem (this);
            return evt.stopPropagation();
        };
        
        // set up selectables 
        // Remove the selectables from the taborder - camel case 'tabIndex' needed for IE7 support
        for (var i = 0; i < selectables.length; i++) {
            var item = jQuery(selectables[i]);
            item.attr ("tabIndex", "-1");
            item.blur (handleBlur);
            item.focus (handleFocus);
            
            item.ariaRole (role.item);
            item.ariaState ("selected", "false");
            item.ariaState ("disabled", "false");
        }
    };
    
    var initItems = function () {
        var i;
        var movables = fluid.wrap (findItems.movables());
        var dropTargets = fluid.wrap (findItems.dropTargets());
        initSelectables (fluid.wrap (findItems.selectables ()));
        
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
    };

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
    var isMouseBefore = function (droppableEl, orientation, x, y) {    	
        var mid;
        if (orientation === fluid.orientation.VERTICAL) {
            mid = jQuery (droppableEl).offset().top + (droppableEl.offsetHeight / 2);
            return (y < mid);
        } else {
            mid = jQuery (droppableEl).offset().left + (droppableEl.offsetWidth / 2);
            return (x < mid);
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
    
        this.isDropBefore = function (target, moving, x, y) {
            if (isMouseBefore (target, orientation, x, y)) {
        		return fluid.position.BEFORE;
        	}
        	else {
        		return fluid.position.AFTER;
        	}
        };
        
        this.mouseMoveItem = function (moving, target, x, y) {
            var whereTo = this.isDropBefore (target, moving, x, y);
            if (whereTo === fluid.position.BEFORE) {
                jQuery (target).before (moving);
            } else if (whereTo === fluid.position.AFTER) {
                jQuery (target).after (moving);
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
	                
	    // We need to override ListLayoutHandler.isDropBefore to ensure that the local private
	    // orientation is used.
        this.isDropBefore = function (target, moving, x, y) {
            if (isMouseBefore (target, orientation, x, y)) {
                return fluid.position.BEFORE;
            }
            else {
                return fluid.position.AFTER;
            }
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
        
        // Check if any optional parameters were sent
        if (options) {
            if (options.orderChangedCallbackUrl) {
                // Create the orderChangedCallback function
                orderChangedCallback = function () {
                    jQuery.post (options.orderChangedCallbackUrl, 
                        JSON.stringify (layout),
                        function (data, textStatus) { 
                            targetPerms = data; 
                        }, 
                        "json");
                };
            }
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
            } else {
                jQuery (relatedItem).after (item);
            }
            fluid.portletLayout.updateLayout (item.id, relatedItem.id, position, layout);
            orderChangedCallback (); 
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
	    	return getVerticalSibling (item, fluid.direction.PREVIOUS);
	    };
	    
	    this.moveItemUp = function (item) {
	        moveVertically (item, fluid.direction.PREVIOIUS);
	    };
	        
	    this.getItemBelow = function (item) {
	    	return getVerticalSibling (item, fluid.direction.NEXT);
	    };
	
	    this.moveItemDown = function (item) {
	        moveVertically (item, fluid.direction.NEXT);
	    };
	    
        this.isDropBefore = function (target, moving, x, y) {
            var position = isMouseBefore (target, orientation, x, y) ? fluid.position.BEFORE : fluid.position.AFTER;
            var canDrop = fluid.portletLayout.canMove (moving.id, target.id, position, layout, targetPerms);
	    	if (canDrop) {
                return position;
	    	}
	    	else {
	    		return fluid.position.NO_TARGET;
	    	}
        };

        this.mouseMoveItem = function (moving, target, x, y) {
            var dropIt = this.isDropBefore (target, moving, x, y);
            if (dropIt === fluid.position.BEFORE) {
                move (moving, target, fluid.position.BEFORE);
            } else if (dropIt === fluid.position.AFTER){
                move (moving, target, fluid.position.AFTER);
            }
        };
        
    }; // End PortalLayoutHandler
}) ();

fluid.portletLayout = function () {
    var internals = {
        layoutWalker: function (fn, layout) {
            for (var col = 0; col < layout.columns.length; col++) {
                var idsInCol = layout.columns[col].children;
                for (var i = 0; i < idsInCol.length; i++) {
                    var fnReturn = fn (idsInCol, i, col);
                    if (fnReturn) {
                        return fnReturn;
                    }
                }
            }
        },
        
        /**
         * Calculate the location of the item and the column in which it resides.
         * @return  An object with column index and item index (within that column) properties.
         *          These indices are -1 if the item does not exist in the grid.
         */
        findColumnAndItemIndices: function (itemId, layout) {
            var findIndices = function (idsInCol, index, col) {
                if (idsInCol[index] === itemId) {
                    return {columnIndex: col, itemIndex: index};
                }  
            };
            
            var indices = internals.layoutWalker (findIndices, layout);
            return indices || { columnIndex: -1, itemIndex: -1 };
        },
        
        findColIndex: function (itemId, layout) {
            return internals.findColumnAndItemIndices (itemId, layout).columnIndex;
        },
        
        findItemIndex: function (itemId, layout) {
            return internals.findColumnAndItemIndices (itemId, layout).itemIndex;
        },
        
        numColumns: function (layout) {
            return layout.columns.length;
        },
        
        isColumn: function (index, layout) {
            return (index < layout.columns.length) && (index >= 0);
        },
        
        /**
         * Returns targetIndex
         * This could have been written in two functions for clarity however it gets called a lot and 
         * the two functions were considerably less performant then this single function.
         * 
         * Item index is the row in the permissions object pertaining to the item.
         * Target index is the column in the permission object refering to the postion before or after the target.
         */
        findItemAndTargetIndices: function (itemId, targetId, position, layout) {
            var columns = layout.columns;
            
            // Default to not found.
            var foundIndices = {
                itemIndex: -1,
                targetIndex: -1
            };
            
            // If the ids are invalid, bail immediately.
            if (!itemId || !targetId) {            
                return foundIndices;
            }

            var itemIndexCounter = 0;
            var targetIndexCounter = position;
            
            for (var i = 0; i < columns.length; i++) {
                var idsInCol = columns[i].children;
                for (var j = 0; j < idsInCol.length; j++) {
                    var currId = idsInCol[j];                    
                    if (currId === itemId) {
                        foundIndices.itemIndex = itemIndexCounter; 
                    }
                    if (currId === targetId) {
                        foundIndices.targetIndex = targetIndexCounter; 
                    }
                    
                    // Check if we're done, and if so, bail early.
                    if (foundIndices.itemIndex >= 0 && foundIndices.targetIndex >= 0) {
                        return foundIndices;
                    }
                    
                    // Increment our index counters and keep searching.
                    itemIndexCounter++;
                    targetIndexCounter++;
                }
                
                // Make sure we account for the additional drop target at the end of a column.
                targetIndexCounter++;
            }

            return foundIndices;     
        },
        
        nearestNextMoveableTarget: function (itemId, layout, perms) {
            // default return value is "the item itself".
            var nextPossibleTarget = { id: itemId, position: fluid.position.AFTER };
            var found = false;
            var startCoords = internals.findColumnAndItemIndices (itemId, layout);
            
            // Safety check findColumnAndItemIndices() returns either valid indices or negative
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
            var startCoords = internals.findColumnAndItemIndices (itemId, layout);
            
            // Safety check findColumnAndItemIndices() returns either valid indices or negative
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
            var cols = layout.columns;
            
            if (columnIndex >= 0 && columnIndex < cols.length) {
                var idsInCol = cols[columnIndex].children;
                if (itemIndex >= 0 && itemIndex < idsInCol.length) {
                    itemId = idsInCol[itemIndex];
                }
            }
            
            return itemId;
        },
        
        canItemMove: function (itemIndex, perms) {
            var itemPerms = perms[itemIndex];
            for (var i = 0; i < itemPerms.length; i++) {
                if (itemPerms[i] === 1) {
                    return true;
                }
            }
            return false;
        }, 
        
        isDropTarget: function (beforeTargetIndex, perms) {
            for (var i = 0; i < perms.length; i++) {
                if (perms[i][beforeTargetIndex] === 1 || perms[i][beforeTargetIndex + 1] === 1) {
                    return true;
                }
            }
            return false;
        }
    };   
	// Public API.
    return {
        internals: internals,

       /**
        * Determine if a given item can move before or after the given target position, given the
        * permissions information.
        */
    	canMove: function (itemId, targetItemId, position, layout, perms) {
    		var indices = internals.findItemAndTargetIndices (itemId, targetItemId, position, layout);
            return (!!perms[indices.itemIndex][indices.targetIndex]); 
        },
        
        /**
         * Given an item id, and a direction, find the top item in the next/previous column.
         */
        firstItemInAdjacentColumn: function (itemId, /* PREVIOUS, NEXT */ direction, layout) {
            var findItemInAdjacentCol = function (idsInCol, index, col) {
                var id = idsInCol[index];
                if (id === itemId) {
                    var adjacentCol = col + direction;
                    return internals.getItemAt (adjacentCol, 0, layout);
                }
            };
            
            return internals.layoutWalker (findItemInAdjacentCol, layout) || itemId; 
        }, 
        
        /**
         * Return the item above/below the given item within that item's column.  If at
         * bottom of column or at top, return the item itelf (no wrapping).
         */
        itemAboveBelow: function (itemId, /*PREVIOUS, NEXT*/ direction, layout) {
            var findItemAboveBelow = function (idsInCol, index) {
                if (idsInCol[index] === itemId) {
                    var siblingIndex = index + direction;
                    if ((siblingIndex < 0) || (siblingIndex >= idsInCol.length)) {
                        return itemId;
                    } else {
                        return idsInCol[siblingIndex];
                    }
                }
        	};

            return internals.layoutWalker (findItemAboveBelow, layout) || itemId;
        },
        
        /**
         * Move an item within the layout object. 
         */
        updateLayout: function (itemId, relativeItemId, position, layout) {
            if (!itemId || !relativeItemId || itemId === relativeItemId) { 
                return; 
            }
            var itemIndices = internals.findColumnAndItemIndices (itemId, layout);
            layout.columns[itemIndices.columnIndex].children.splice (itemIndices.itemIndex, 1);

            var relativeItemIndices = internals.findColumnAndItemIndices (relativeItemId, layout);
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
            var targetColIndex = internals.findColIndex (itemId, layout) + direction;
            
            // Safety check -- can't search before the 0'th column -- declare found so first loop bails.
            if (targetColIndex < 0 || targetColIndex >= internals.numColumns (layout)) {
                found = true;               
            }
            
            // Loop thru all of the columns beginning with the <targetColIndex>'th column.
            for (var i = targetColIndex; internals.isColumn (i, layout) && !found; i += direction) {
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
                return internals.nearestNextMoveableTarget (itemId, layout, perms);
            }
            else {
                return internals.nearestPreviousMoveableTarget (itemId, layout, perms);
            }
        },
        
        /**
         * Determine the moveables, selectables, and drop targets based on the information
         * in the layout and permission objects.
         */
        createFindItems: function (layout, perms, grabHandle) {
            var findItems = {};
            findItems.grabHandle = grabHandle;
            
            var selectablesSelector;
            var movablesSelector;
            var dropTargets;
            
            var cols = layout.columns;
            for (var i = 0; i < cols.length; i++) {
                var idsInCol = cols[i].children;
                for (var j = 0; j < idsInCol.length; j++) {
                    var itemId = idsInCol[j];
                    var idSelector = "[id=" + itemId  + "]";
                    selectablesSelector = selectablesSelector ? selectablesSelector + "," + idSelector : idSelector;
                    
                    var indices = internals.findItemAndTargetIndices (itemId, itemId, fluid.position.BEFORE, layout);
                    if (internals.canItemMove (indices.itemIndex, perms)) {
                        movablesSelector = movablesSelector ? movablesSelector + "," + idSelector : idSelector; 
                    }
                    if (internals.isDropTarget (indices.targetIndex, perms)) {
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
