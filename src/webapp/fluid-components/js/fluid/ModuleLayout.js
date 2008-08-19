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
/*global jQuery*/
/*global fluid*/

fluid = fluid || {};

fluid.moduleLayout = fluid.moduleLayout || {};

(function (jQuery, fluid) {
  
    var internals = {
        layoutWalker: function (fn, layout) {
            for (var col = 0; col < layout.columns.length; col++) {
                var idsInCol = layout.columns[col].children;
                for (var i = 0; i < idsInCol.length; i++) {
                    var fnReturn = fn(idsInCol, i, col);
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
        
        findColIndex: function (colId, layout) {
            for (var col = 0; col < layout.columns.length; col++ ) {
                if (colId === layout.columns[col].id) {
                    return col;
                }
            }
            return -1;
        },
        
        findItemIndex: function (itemId, layout) {
            return internals.findColumnAndItemIndices(itemId, layout).itemIndex;
        },
        
        numColumns: function (layout) {
            return layout.columns.length;
        },
        
        numModules: function (layout) {
            var numModules = 0;
            for (var col = 0; col < layout.columns.length; col++) {
                numModules += layout.columns[col].children.length;
            }
            return numModules;
        },
        
        isColumnIndex: function (index, layout) {
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
        },
        
        targetAndPos: function(itemId, position, layout, perms){
            var inc = (position === fluid.position.BEFORE) ? -1 : 1;            
            var startCoords = internals.findColumnAndItemIndices (itemId, layout);
            var defaultTarg = {
                    id: itemId,
                    position: fluid.position.USE_LAST_KNOWN
                };
            
            // If invalid column, return USE_LAST_KNOWN
            if (startCoords.columnIndex < 0) {
                return defaultTarg;
            }
            
            // Loop thru the target column's items, starting with the item adjacent to the given item,
            // looking for an item that can be moved to.
            var idsInCol = layout.columns[startCoords.columnIndex].children;
            var firstTarg;
            for (var i = startCoords.itemIndex + inc; i > -1 && i < idsInCol.length; i = i + inc) {
                var targetId = idsInCol[i];
                if (fluid.moduleLayout.canMove(itemId, targetId, position, layout, perms)) {
                    // Found a valid move - return
                    return {
                        id: targetId,
                        position: position
                    };
                } else if (!firstTarg) {
                    firstTarg = { id: targetId, position: fluid.position.DISALLOWED};
                }
            }
        
            // Didn't find a valid move so return the first target
            return firstTarg || defaultTarg;                        
        },
            
        findPortletsInColumn: function (portlets, column) {
            var portletsForColumn = [];
            portlets.each(function (idx, portlet) {
                if (jQuery("[id=" + portlet.id + "]", column)[0]) {
                    portletsForColumn.push(portlet);
                }
            });
            
            return portletsForColumn;
        },
    
        columnStructure: function (column, portletsInColumn) {
            var structure = {};
            structure.id = column.id;
            structure.children = [];
            jQuery(portletsInColumn).each(function (idx, portlet) {
                structure.children.push(portlet.id);
            });
            
            return structure;
        }

    };   
    
    /** PUBLIC API **/
    
    fluid.moduleLayout.internals = internals;

    fluid.moduleLayout.isColumn = function (id, layout) {
        var colIndex = internals.findColIndex(id, layout);
        return (colIndex > -1);
    };
    
   /**
    * Determine if a given item can move before or after the given target position, given the
    * permissions information.
    */
    fluid.moduleLayout.canMove = function (itemId, targetItemId, position, layout, perms) {
        if ((position === fluid.position.USE_LAST_KNOWN) || (position === fluid.position.DISALLOWED)) {
            return false;
        }
        if (position === fluid.position.INSIDE) {
            return true;
        }
        var indices = internals.findItemAndTargetIndices (itemId, targetItemId, position, layout);
        return (!!perms[indices.itemIndex][indices.targetIndex]); 
    };
    
    /**
     * Given an item id, and a direction, find the top item in the next/previous column.
     */
    fluid.moduleLayout.firstItemInAdjacentColumn =  function (itemId, /* PREVIOUS, NEXT */ direction, layout) {
        var findItemInAdjacentCol = function (idsInCol, index, col) {
            var id = idsInCol[index];
            if (id === itemId) {
                var adjacentCol = col + direction;
                var adjacentItem = internals.getItemAt (adjacentCol, 0, layout);
                // if there are no items in the adjacent column, keep checking further columns
                while (!adjacentItem) {
                    adjacentCol = adjacentCol + direction;
                    if (internals.isColumnIndex(adjacentCol, layout)) {
                        adjacentItem = internals.getItemAt (adjacentCol, 0, layout);
                    } else {
                        adjacentItem = itemId;
                    }
                }
                return adjacentItem; 
            //    return internals.getItemAt (adjacentCol, 0, layout);
            }
        };
        
        return internals.layoutWalker (findItemInAdjacentCol, layout) || itemId; 
    };
    
    /**
     * Return the item above/below the given item within that item's column.  If at
     * bottom of column or at top, return the item itelf (no wrapping).
     */
    fluid.moduleLayout.itemAboveBelow = function (itemId, /*PREVIOUS, NEXT*/ direction, layout) {
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

        return internals.layoutWalker(findItemAboveBelow, layout) || itemId;
    };
      
        /**
         * Move an item within the layout object. 
         */
    fluid.moduleLayout.updateLayout = function (itemId, targetId, position, layout) {
        if (!itemId || !targetId || itemId === targetId) { 
            return; 
        }
        var itemIndices = internals.findColumnAndItemIndices(itemId, layout);
        layout.columns[itemIndices.columnIndex].children.splice(itemIndices.itemIndex, 1);
        var targetCol;
        if (position === fluid.position.INSIDE || position === fluid.position.USE_LAST_KNOWN) {
            targetCol = layout.columns[internals.findColIndex(targetId, layout)].children;
            targetCol.splice (targetCol.length, 0, itemId);

        } else {
            var relativeItemIndices = internals.findColumnAndItemIndices(targetId, layout);
            targetCol = layout.columns[relativeItemIndices.columnIndex].children;
            targetCol.splice (relativeItemIndices.itemIndex + position, 0, itemId);
        }

      };
      
      /**
       * Find the first target that can be moved to in the given column, possibly moving to the end
       * of the column if there are no valid drop targets. 
       * @return Object containing id (the id of the target) and position (relative to the target)
       */
     fluid.moduleLayout.findTarget = function (itemId, /* NEXT, PREVIOUS */ direction, layout, perms) {
        var targetColIndex = internals.findColumnAndItemIndices(itemId, layout).columnIndex + direction;
        var targetCol = layout.columns[targetColIndex];
        
        // If column is invalid, bail returning the current position.
        if (targetColIndex < 0 || targetColIndex >= internals.numColumns (layout)) {
            return { id: itemId, position: fluid.position.BEFORE };               
        }
        
        // Loop thru the target column's items, looking for the first item that can be moved to.
        var idsInCol = targetCol.children;
        for (var i = 0; (i < idsInCol.length); i++) {
            var targetId = idsInCol[i];
            if (fluid.moduleLayout.canMove(itemId, targetId, fluid.position.BEFORE, layout, perms)) {
                return { id: targetId, position: fluid.position.BEFORE };
            }
            else if (fluid.moduleLayout.canMove (itemId, targetId, fluid.position.AFTER, layout, perms)) {
                return { id: targetId, position: fluid.position.AFTER };
            }
        }
        
        // no valid modules found, so target is the column itself
        return { id: targetCol.id, position: fluid.position.INSIDE };
    };

    /**
     * Returns a valid drop target and position above the item being moved.
     * @param {Object} itemId The id of the item being moved
     * @param {Object} layout 
     * @param {Object} perms
     * @returns {Object} id: the target id, position: a 'fluid.position' value relative to the target
     */
    fluid.moduleLayout.targetAndPositionAbove = function (itemId, layout, perms) {
        return internals.targetAndPos(itemId, fluid.position.BEFORE, layout, perms);
    };
    
    /**
     * Returns a valid drop target and position below the item being moved.
     * @param {Object} itemId The id of the item being moved
     * @param {Object} layout 
     * @param {Object} perms
     * @returns {Object} id: the target id, position: a 'fluid.position' value relative to the target
     */
    fluid.moduleLayout.targetAndPositionBelow = function (itemId, layout, perms) {
        return internals.targetAndPos(itemId, fluid.position.AFTER, layout, perms);
    };
    
    /**
     * Determine the moveables, selectables, and drop targets based on the information
     * in the layout and permission objects.
     */
    fluid.moduleLayout.inferSelectors = function (layout, perms, grabHandle) {
        perms = perms || fluid.moduleLayout.buildEmptyPerms(layout);

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
            // now add the column itself
            var colIdSelector = "[id=" + cols[i].id  + "]";
            dropTargets = dropTargets ? dropTargets + "," + colIdSelector : colIdSelector;
        }
        
        var togo = {
          movables: movablesSelector,
          selectables: selectablesSelector,
          dropTargets: dropTargets,
          grabHandle: grabHandle
        };
                  
        return togo;
    };
    
    fluid.moduleLayout.containerId = function (layout) {
        return layout.id;
    };
    
    fluid.moduleLayout.lastItemInCol = function (colId, layout) {
        var colIndex = internals.findColIndex(colId, layout);
        var col = layout.columns[colIndex];
        var numChildren = col.children.length;
        if (numChildren > 0) {
            return col.children[numChildren-1];                
        }
        return undefined;
    };
    
    /**
     * Builds a fake permission object stuffed with 1s.
     * @param {Object} layout
     */
    fluid.moduleLayout.buildEmptyPerms = function (layout) {
        var numCols = internals.numColumns(layout);
        var numModules = internals.numModules(layout);
        
        var permsStructure = [];
        // Each column has a drop target at its top.
        // Each portlet has a drop target below it.
        var numItemsInBitmap = numCols + numModules;
        for (var i = 0; i < numModules; i++) {
            var rowForPortlet = [];
            // Stuff the whole structure with 1s to dispense with permissions altogether.
            for (var j = 0; j < numItemsInBitmap; j++) {
                rowForPortlet.push(1);
            }
            permsStructure.push(rowForPortlet);                
        }
        
        return permsStructure;
    };
  
    /**
     * Builds a permissions object that captures a simple set of rules for locked modules.
     * This permissions object is designed to support modules that are locked at the top of columns.
     * In this definition of locked, the modules cannot be picked up by mouse or keyboard,
     * and if they are at the top of a column, nothing can be placed above them.
     * 
     * @param {jQuery} lockedModules
     * @param {Object} layout
     */
    fluid.moduleLayout.buildPermsForLockedModules = function (lockedModules, layout) {            
        if (lockedModules.length <= 0) {
            return fluid.moduleLayout.buildEmptyPerms(layout);
        }
        
        function isLocked(id) {
            return jQuery.grep(lockedModules, function (el) {return el.id === id;})[0];   
        }
        
        // Build the perms rows
        var permsRow = []; 
        var lockedPermsRow = [];
        var moduleIds = [];

        // Walk the layout and create two interim data structures: 
        // one for unlocked modules and another for locked modules.
        for (var col = 0; col < layout.columns.length; col += 1) {
            var idsInCol = layout.columns[col].children;
            var prevId = null;
            for (var i = 0; i < idsInCol.length; i += 1) {
                var id = idsInCol[i];
                moduleIds.push(id);
                // Check if we're locked at the top of column, or the thing above is locked.
                if (isLocked(id) && (!prevId || isLocked(prevId))) {
                    permsRow.push(0);
                } else {
                   permsRow.push(1);
                } 
                lockedPermsRow.push(0);
                prevId = id; 
            }
            permsRow.push(1);
            lockedPermsRow.push(0);
        }

        // Based on the locked and unlock rows, build up the final permissions object.
        var permsStructure = [];
        for (i = 0; i < moduleIds.length; i += 1) {
            if (isLocked(moduleIds[i])) {
                permsStructure.push(lockedPermsRow);
            }
            else {
                permsStructure.push(permsRow);
            }
        }
        
        return permsStructure;
    };
       
      /**
       * Builds a layout object from a set of columns and modules.
       * @param {jQuery} container
       * @param {jQuery} columns
       * @param {jQuery} portlets
       */
    fluid.moduleLayout.buildLayout = function (container, columns, portlets) {
        var layoutStructure = {};
        layoutStructure.id = container[0].id;
        layoutStructure.columns = [];
        columns.each(function (idx, column) {
            var portletsInColumn = internals.findPortletsInColumn(portlets, column);
            layoutStructure.columns.push(internals.columnStructure(column, portletsInColumn));
        });
        
        return layoutStructure;
      };
    
    var defaultWillShowKBDropWarning = function (item, dropWarning) {
        if (dropWarning) {
            var offset = jQuery(item).offset();
            dropWarning = jQuery(dropWarning);
            dropWarning.css("position", "absolute");
            dropWarning.css("top", offset.top);
            dropWarning.css("left", offset.left);
        }
    };
    
    /*
     * Module Layout Handler for reordering content modules.
     * 
     * General movement guidelines:
     * 
     * - Arrowing sideways will always go to the top (moveable) module in the column
     * - Moving sideways will always move to the top available drop target in the column
     * - Wrapping is not necessary at this first pass, but is ok
     */
    fluid.moduleLayoutHandler = function (container, options) {
            
        var that = fluid.initView("fluid.moduleLayoutHandler", container, options);
        // TODO: actually place some defaults in this structure, and resolve the way
        // that defaults from subsidiary components (layouts) could interact with
        // defaults at a higher level. 
        var orientation = fluid.orientation.VERTICAL;
        
        // Configure optional parameters
        var layout = options.moduleLayout.layout;
        var targetPerms = options.moduleLayout.permissions || fluid.moduleLayout.buildEmptyPerms(layout);
        
        options = options || {};
        var orderChangedCallback = options.orderChangedCallback || function () {};
        if (options.orderChangedCallbackUrl) {
            // Create the orderChangedCallback function
            orderChangedCallback = function (item) {
                jQuery.post(options.orderChangedCallbackUrl, 
                    JSON.stringify(layout),
                    function (data, textStatus) { 
                        targetPerms = data; 
                    }, 
                    "json");
            };
        }
        var dropWarning = fluid.utils.jById(options.dropWarningId);
        var willShowKBDropWarning = options.willShowKBDropWarning || defaultWillShowKBDropWarning;
        
        // Private Methods.
        /*
         * Find an item's sibling in the vertical direction based on the
         * layout.  This assumes that there is no wrapping the top and
         * bottom of the columns, and returns the given item if at top
         * and seeking the previous item, or at the bottom and seeking
         * the next item.
         */
        var getVerticalSibling = function (item, /* NEXT, PREVIOUS */ direction) {
            var siblingId = fluid.moduleLayout.itemAboveBelow(item.id, direction, layout);
            return fluid.utils.jById(siblingId)[0];
        };
    
        /*
         * Find an item's sibling in the horizontal direction based on the
         * layout.  This assumes that there is no wrapping the ends of
         * the rows, and returns the given item if left most and
         * seeking the previous item, or if right most and seeking
         * the next item.
         */
        var getHorizontalSibling = function (item, /* NEXT, PREVIOUS */ direction) {
            var itemId = fluid.moduleLayout.firstItemInAdjacentColumn(item.id, direction, layout);
            return fluid.utils.jById(itemId)[0];
        };
                
        // This should probably be part of the public API so it can be configured.
        var move = function (item, relatedItem, position /* BEFORE, AFTER or INSIDE */) {
            if (!item || !relatedItem) {
                return;
            }           
            if (position === fluid.position.BEFORE) {
                jQuery(relatedItem).before(item);
            } else if (position === fluid.position.AFTER) {
                jQuery(relatedItem).after(item);
            } else if (position === fluid.position.INSIDE) {
                jQuery(relatedItem).append(item);
            }  // otherwise it's either DISALLOWED or USE_LAST_KNOWN
            
            fluid.moduleLayout.updateLayout(item.id, relatedItem.id, position, layout);
            orderChangedCallback(item);
        };
        
        var moveHorizontally = function (item, direction /* PREVIOUS, NEXT */) {
            var targetInfo = fluid.moduleLayout.findTarget(item.id, direction, layout, targetPerms);
            var targetItem = fluid.utils.jById(targetInfo.id)[0];
            move(item, targetItem, targetInfo.position);
        };
        
        var moveVertically = function (item, targetFunc) {
            var targetAndPos = targetFunc(item.id, layout, targetPerms);
            var target = fluid.utils.jById(targetAndPos.id)[0]; 
            if (targetAndPos.position === fluid.position.DISALLOWED) {
                if (dropWarning) {
                    willShowKBDropWarning(item, dropWarning[0]);
                    dropWarning.show();
                }
            } else if (targetAndPos.position !== fluid.position.USE_LAST_KNOWN) {
                move(item, target, targetAndPos.position);
            }
        };
        
        // Public Methods
        that.getRightSibling = function (item) {
            return getHorizontalSibling(item, fluid.direction.NEXT);
        };
        
        that.moveItemRight = function (item) {
            moveHorizontally(item, fluid.direction.NEXT);
        };
    
        that.getLeftSibling = function (item) {
            return getHorizontalSibling(item, fluid.direction.PREVIOUS);
        };
    
        that.moveItemLeft = function (item) {
            moveHorizontally(item, fluid.direction.PREVIOUS);
        };
    
        that.getItemAbove = function (item) {
            return getVerticalSibling(item, fluid.direction.PREVIOUS);
        };
        
        that.moveItemUp = function (item) {
            moveVertically(item, fluid.moduleLayout.targetAndPositionAbove);
        };
            
        that.getItemBelow = function (item) {
            return getVerticalSibling(item, fluid.direction.NEXT);
        };
    
        that.moveItemDown = function (item) {
            moveVertically(item, fluid.moduleLayout.targetAndPositionBelow);
        };
        
        that.dropPosition = function (target, moving, x, y) {
            if (fluid.moduleLayout.isColumn (target.id, layout)) {
                var lastItemInColId = fluid.moduleLayout.lastItemInCol(target.id, layout);
                if (lastItemInColId === undefined) {
                    return fluid.position.INSIDE;
                }
                var lastItem = fluid.utils.jById(lastItemInColId);
                var topOfEmptySpace = lastItem.offset().top + lastItem.height();
                
                if (y > topOfEmptySpace) {
                    return fluid.position.INSIDE;
                } else {
                    return fluid.position.USE_LAST_KNOWN;
                }
            }
            
            var position = fluid.utils.mousePosition(target, orientation, x, y);
            var canDrop = fluid.moduleLayout.canMove(moving.id, target.id, position, layout, targetPerms);
            if (canDrop) {
                return position;
            }
            else {
                return fluid.position.DISALLOWED;
            }
        };

        that.mouseMoveItem = function (moving, target, x, y, position) {
            move(moving, target, position);
        };
        
        return that;
    };
}) (jQuery, fluid);
