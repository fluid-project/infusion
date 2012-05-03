/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    
    fluid.registerNamespace("fluid.moduleLayout");

    /**
     * Calculate the location of the item and the column in which it resides.
     * @return  An object with column index and item index (within that column) properties.
     *          These indices are -1 if the item does not exist in the grid.
     */
    // unsupported - NON-API function
    fluid.moduleLayout.findColumnAndItemIndices = function (item, layout) {
        return fluid.find(layout.columns,
            function (column, colIndex) {
                var index = $.inArray(item, column.elements);
                return index === -1 ? undefined : {columnIndex: colIndex, itemIndex: index};
            }, {columnIndex: -1, itemIndex: -1});
    };
    // unsupported - NON-API function
    fluid.moduleLayout.findColIndex = function (item, layout) {
        return fluid.find(layout.columns,
            function (column, colIndex) {
                return item === column.container ? colIndex : undefined;
            }, -1);
    };

    /**
     * Move an item within the layout object. 
     */
    // unsupported - NON-API function
    fluid.moduleLayout.updateLayout = function (item, target, position, layout) {
        item = fluid.unwrap(item);
        target = fluid.unwrap(target);
        var itemIndices = fluid.moduleLayout.findColumnAndItemIndices(item, layout);
        layout.columns[itemIndices.columnIndex].elements.splice(itemIndices.itemIndex, 1);
        var targetCol;
        if (position === fluid.position.INSIDE) {
            targetCol = layout.columns[fluid.moduleLayout.findColIndex(target, layout)].elements;
            targetCol.splice(targetCol.length, 0, item);

        } else {
            var relativeItemIndices = fluid.moduleLayout.findColumnAndItemIndices(target, layout);
            targetCol = layout.columns[relativeItemIndices.columnIndex].elements;
            position = fluid.dom.normalisePosition(position, 
                  itemIndices.columnIndex === relativeItemIndices.columnIndex, 
                  relativeItemIndices.itemIndex, itemIndices.itemIndex);
            var relative = position === fluid.position.BEFORE ? 0 : 1;
            targetCol.splice(relativeItemIndices.itemIndex + relative, 0, item);
        }
    };
       
    /**
     * Builds a layout object from a set of columns and modules.
     * @param {jQuery} container
     * @param {jQuery} columns
     * @param {jQuery} portlets
     */
    fluid.moduleLayout.layoutFromFlat = function (container, columns, portlets) {
        var layout = {};
        layout.container = container;
        layout.columns = fluid.transform(columns, 
            function (column) {
                return {
                    container: column,
                    elements: $.makeArray(portlets.filter(function () {
                          // is this a bug in filter? would have expected "this" to be 1st arg
                        return fluid.dom.isContainer(column, this);
                    }))
                };
            });
        return layout;
    };
      
    /**
     * Builds a layout object from a serialisable "layout" object consisting of id lists
     */
    fluid.moduleLayout.layoutFromIds = function (idLayout) {
        return {
            container: fluid.byId(idLayout.id),
            columns: fluid.transform(idLayout.columns, function (column) {
                return {
                    container: fluid.byId(column.id),
                    elements: fluid.transform(column.children, fluid.byId)
                };
            })
        };
    };
      
    /**
     * Serializes the current layout into a structure of ids
     */
    fluid.moduleLayout.layoutToIds = function (idLayout) {
        return {
            id: fluid.getId(idLayout.container),
            columns: fluid.transform(idLayout.columns, function (column) {
                return {
                    id: fluid.getId(column.container),
                    children: fluid.transform(column.elements, fluid.getId)
                };
            })
        };
    };
    
    var defaultOnShowKeyboardDropWarning = function (item, dropWarning) {
        if (dropWarning) {
            var offset = $(item).offset();
            dropWarning = $(dropWarning);
            dropWarning.css("position", "absolute");
            dropWarning.css("top", offset.top);
            dropWarning.css("left", offset.left);
        }
    };
    
    fluid.defaults(true, "fluid.moduleLayoutHandler", {
        orientation: fluid.orientation.VERTICAL,
        containerRole: fluid.reorderer.roles.REGIONS,
        selectablesTabindex: -1,
        sentinelize:         true
    });
       
    /**
     * Module Layout Handler for reordering content modules.
     * 
     * General movement guidelines:
     * 
     * - Arrowing sideways will always go to the top (moveable) module in the column
     * - Moving sideways will always move to the top available drop target in the column
     * - Wrapping is not necessary at this first pass, but is ok
     */
    fluid.moduleLayoutHandler = function (container, options, dropManager, dom) {
        var that = {};
        
        function computeLayout() {
            var togo;
            if (options.selectors.modules) {
                togo = fluid.moduleLayout.layoutFromFlat(container, dom.locate("columns"), dom.locate("modules"));
            }
            if (!togo) {
                var idLayout = fluid.get(options, "moduleLayout.layout");
                fluid.moduleLayout.layoutFromIds(idLayout);
            }
            return togo;
        }
        var layout = computeLayout();
        that.layout = layout;
        
        function isLocked(item) {
            var lockedModules = options.selectors.lockedModules ? dom.fastLocate("lockedModules") : [];
            return $.inArray(item, lockedModules) !== -1;
        }

        that.getRelativePosition  = 
            fluid.reorderer.relativeInfoGetter(options.orientation, 
                 fluid.reorderer.WRAP_LOCKED_STRATEGY, fluid.reorderer.GEOMETRIC_STRATEGY, 
                 dropManager, dom, options.disableWrap);
                 
        that.getGeometricInfo = function () {
            var extents = [];
            var togo = {extents: extents,
                        sentinelize: options.sentinelize};
            togo.elementMapper = function (element) {
                return isLocked(element) ? "locked" : null;
            };
            togo.elementIndexer = function (element) {
                var indices = fluid.moduleLayout.findColumnAndItemIndices(element, that.layout);
                return {
                    index:        indices.itemIndex,
                    length:       layout.columns[indices.columnIndex].elements.length,
                    moduleIndex:  indices.columnIndex,
                    moduleLength: layout.columns.length
                };
            };
            for (var col = 0; col < layout.columns.length; col++) {
                var column = layout.columns[col];
                var thisEls = {
                    orientation: options.orientation,
                    elements: $.makeArray(column.elements),
                    parentElement: column.container
                };
              //  fluid.log("Geometry col " + col + " elements " + fluid.dumpEl(thisEls.elements) + " isLocked [" + 
              //       fluid.transform(thisEls.elements, togo.elementMapper).join(", ") + "]");
                extents.push(thisEls);
            }

            return togo;
        };
        
        function computeModules(all) {
            return function () {
                var modules = fluid.accumulate(layout.columns, function (column, list) {
                    return list.concat(column.elements); // note that concat will not work on a jQuery
                }, []);
                if (!all) {
                    fluid.remove_if(modules, isLocked);
                }
                return modules;
            };
        }
        
        that.returnedOptions = {
            selectors: {
                movables: computeModules(false),
                dropTargets: computeModules(false),
                selectables: computeModules(true)
            },
            listeners: {
                onMove: {
                    priority: "last",
                    listener: function (item, requestedPosition) {
                        fluid.moduleLayout.updateLayout(item, requestedPosition.element, requestedPosition.position, layout);
                    }
                },
                onRefresh: function () {
                    layout = computeLayout();
                    that.layout = layout;
                },
                "onShowKeyboardDropWarning.setPosition": defaultOnShowKeyboardDropWarning
            }
        };
        
        that.getModel = function () {
            return fluid.moduleLayout.layoutToIds(layout);
        };
              
        return that;
    };
})(jQuery, fluid_1_5);
