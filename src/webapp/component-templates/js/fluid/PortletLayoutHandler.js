/*
Copyright 2007 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/
fluid = fluid || {};

/*
 * General movement guidelines:
 * 
 * - Arrowing sideways will always go to the top (moveable) portlet in the column
 * - Moving sideways will always move to the top available drop target in the column
 * - Wrapping is not necessary at this first pass, but is ok
 */
fluid.PortletLayoutHandler = function (/*function*/ orderableFinder,
		/* JSON object */ portletLayoutJSON,
		/* JSON object */ dropTargetPermissionsJSON) {
	
	// Private members.
	var thisLH = this; // Hold onto this layouthandler for the enclosed private functions.
	var portletLayout = portletLayoutJSON;
    var dropTargetPermissions = dropTargetPermissionsJSON;
    var container = null;
    
    // Public members.
	this.orderableFinder = orderableFinder;
    
    // Private Methods
    var getRightSiblingInfo = function(item) {
        if (thisLH._isInRightmostColumn(item))
            return {item: item, hasWrapped: true};
        else
            return getHorizontalSiblingInfo(item, 1);
    };
    
    var getLeftSiblingInfo = function(item) {
        if (thisLH._isInLeftmostColumn(item))
            return {item: item, hasWrapped: true};
        else
            return getHorizontalSiblingInfo(item, -1);
    };
    
    var getItemInfoBelow = function (item) {
        if (thisLH._isLastInColumn(item))
            return {item:item, hasWrapped:true};
        else
            return getVerticalSiblingInfo (item, 1);
    };
    
    var getItemInfoAbove = function (item) {
        if (thisLH._isFirstInColumn(item))
            return {item:item, hasWrapped:true};
        else
            return getVerticalSiblingInfo (item, -1);
    };

    var isAtEndOfColumn = function (item, column) {
        var index = null;
        for (var col = 0; col < portletLayout.columns.length; col++) {
            index = portletLayout.columns[col].children.indexOf(item.id);
            if (index >= 0) {
                break;
            }
        }
        if (index >= 0) {
            if (column == "top") {
            	return (index == 0) ? true : false;
            } else {
                if (index == portletLayout.columns[col].children.length-1) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        return false;
    };
    
    /*
     * A general get{Above|Below}SiblingInfo() given an item and a direction.
     * The direction is encoded by either a +1 to move down, or a -1 to
     * move up, and that value is used internally as an increment or
     * decrement, respectively, of the index of the given item.
     */
    var getVerticalSiblingInfo = function (item, /* +1, -1 */ incDecrement) {
        var orderables = thisLH.orderableFinder (container);
        var index = jQuery(orderables).index(item) + incDecrement;
        var hasWrapped = false;
            
        // If we wrap, backup 
        if ((index == -1) || (index == orderables.length)) {
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
     * Currently, the horizontal sibling defaults to the top item in the
     * neighboring column.
     */
    var getHorizontalSiblingInfo = function (item, /* +1, -1 */ incDecrement) {
        var hasWrapped = false;
        var orderables = thisLH.orderableFinder (container);
            
        var colIndex = -1;
        for (var col = 0; col < portletLayout.columns.length; col++) {
            if (portletLayout.columns[col].children.indexOf(item.id) != -1) {
                colIndex = col;
                break;
            }
        }
        if (colIndex == -1)
            return {item: null, hasWrapped: true};

        colIndex = colIndex + incDecrement;
        var itemIndex = 0;
        var id = portletLayout.columns[colIndex].children[itemIndex];
        var item = jQuery ("#" + id).get (0);
        while (orderables.index (item) == -1) {
            itemIndex += 1;
            id = portletLayout.columns[colIndex].children[itemIndex];
            item = jQuery ("#" + id).get (0);
        }
        return {item: item, hasWrapped: false};

    };
    
    var moveItem = function (item, relatedItemInfo, defaultPlacement, wrappedPlacement) {
        var itemPlacement = defaultPlacement;
        if (relatedItemInfo.hasWrapped) {
            itemPlacement = wrappedPlacement;
        }
        
        if (itemPlacement === "after") {
            jQuery (relatedItemInfo.item).after (item);
        } else {
            jQuery (relatedItemInfo.item).before (item);
        }
    };
    
    // Public Methods
    
    // These methods are public only for our unit tests. They need to be refactored into a portletlayout object.
    this._isFirstInColumn = function (item) {
        return isAtEndOfColumn(item, "top");
    };

    this._isLastInColumn = function (item) {
        return isAtEndOfColumn(item, "bottom");
    };
    
    this.setReorderableContainer = function (aList) {
        _container = aList;
    };
    
    this._isInLeftmostColumn = function (item) {
        if (portletLayout.columns[0].children.indexOf(item.id) != -1)
            return true;
        else
            return false;
    };
    
    this._isInRightmostColumn = function (item) {
        if (portletLayout.columns[portletLayout.columns.length-1].children.indexOf(item.id) != -1)
            return true;
        else
            return false;
    };
    
    this.getRightSibling = function (item) {
    	return getRightSiblingInfo(item).item;
    };
    
    this.moveItemRight = function (item) {
        moveItem(item, getRightSiblingInfo(item), "before", "after");
    };

    this.getLeftSibling = function (item) {
	    return getLeftSiblingInfo(item).item;
    };

    this.moveItemLeft = function (item) {
        moveItem(item, getLeftSiblingInfo(item), "before", "after");
    };

    this.getItemAbove = function (item) {
    	return getItemInfoAbove(item).item;
    };
    
    this.moveItemUp = function (item) {
        moveItem (item, getItemInfoAbove(item), "before", "after");
    };
        
    this.getItemBelow = function (item) {
    	return getItemInfoBelow(item).item;
    };

    this.moveItemDown = function (item) {
    	moveItem (item, getItemInfoBelow(item), "after", "before");
    };
    
    /**
     * For drag-and-drop during the drag:  is the mouse over the "before" half
     * of the droppable?  In the case of a vertically oriented set of orderables,
     * "before" means "above".  For a horizontally oriented set, "before" means
     * "left of".
     */
    this.isMouseBefore = function (evt, droppableEl) {
        if (this.orientation === fluid.orientation.VERTICAL) {
            var mid = jQuery (droppableEl).offset ().top + (droppableEl.offsetHeight / 2);
            return (evt.pageY < mid);
        }
        else {
            var mid = jQuery (droppableEl).offset ().left + (droppableEl.offsetWidth / 2);
            return (evt.clientX < mid);
        }
    };    
}; // End PortalLayoutHandler
   