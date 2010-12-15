/*
Copyright 2008-2009 University of Cambridge
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, jqUnit, orderableIds, defaultClass, selectedClass, draggingClass*/

var fluid_1_3 = fluid_1_3 || {};
var fluid = fluid || fluid_1_3;

(function ($, fluid) {

    fluid.testUtils = fluid.testUtils || {};
    fluid.testUtils.reorderer = fluid.testUtils.reorderer || {};

    fluid.testUtils.reorderer.prepend = function (prefix, indices) {
        return fluid.transform(indices, 
            function (index) {
                return prefix + index;
            });
    };

    fluid.testUtils.reorderer.assertItemsInOriginalPosition = function (desc, thumbArray, imageIds) {
        var thumbIds = fluid.transform(thumbArray, fluid.getId);
        jqUnit.assertDeepEq(desc + " expect items in original order", imageIds, thumbIds);
    };
            
    fluid.testUtils.reorderer.assertItemsInOrder = function (message, expectOrder, thumbArray, prefix) {
        var thumbIds = fluid.transform(thumbArray, fluid.getId);
        var expectIds = fluid.testUtils.reorderer.prepend(prefix, expectOrder);
        jqUnit.assertDeepEq(message, expectIds, thumbIds);
    };
        
    fluid.testUtils.reorderer.assertItemDefault = function (message, index) {
        var itemId = orderableIds[index];
        var item = fluid.jById(itemId);
            
        jqUnit.assertTrue(message + itemId + " should be default", item.hasClass(defaultClass));
        jqUnit.assertFalse(message + itemId + " should not be selected", item.hasClass(selectedClass));
        jqUnit.assertFalse(message + itemId + " should not be dragging", item.hasClass(draggingClass));
    };
        
    fluid.testUtils.reorderer.assertItemFocused = function (message, index) {
        var itemId = orderableIds[index];
        var item = fluid.jById(itemId);
            
        jqUnit.assertTrue(message + itemId + " should be selected", item.hasClass(selectedClass));   
        jqUnit.assertFalse(message + itemId + " should not be default", item.hasClass(defaultClass));
        jqUnit.assertFalse(message + itemId + " should not be dragging", item.hasClass(draggingClass));
    };
        
    fluid.testUtils.reorderer.assertItemDragged = function (message, index) {
        var itemId = orderableIds[index];
        var item = fluid.jById(itemId);
            
        jqUnit.assertTrue(message + itemId + " should be dragging", item.hasClass(draggingClass));  
        jqUnit.assertFalse(message + itemId + " should not be default", item.hasClass(defaultClass));
    };
        
        /** Break down the process of firing a particular modified key into the separate events
         * of firing the modifier followed by the modified key itself, to give realism to the process
         * of generating the composite key sequence.
         */
    fluid.testUtils.reorderer.compositeKey = function (reorderer, event, target, keepModifierPressed) {
        target = fluid.unwrap(target);
        var modifierEvent = $.extend(true, {}, event);
        var modifier = event.ctrlKey ? "CTRL": event.shiftKey ? "SHIFT": event.altKey ? "ALT": "";
        modifierEvent.keyCode = $.ui.keyCode[modifier];
        fluid.testUtils.reorderer.keyDown(reorderer, modifierEvent, target);
        fluid.testUtils.reorderer.keyDown(reorderer, event, target);
        if (!keepModifierPressed) {
            modifierEvent.ctrlKey = modifierEvent.shiftKey = modifierEvent.altKey = undefined;
        }
        fluid.testUtils.reorderer.keyUp(reorderer, modifierEvent, target);
    };
        
    fluid.testUtils.reorderer.keyDown = function (reorderer, event, target) {
        event.target = target;
        reorderer.handleKeyDown(event);
    };
        
    fluid.testUtils.reorderer.keyUp = function (reorderer, event, target) {
        event.target = target;
        reorderer.handleKeyUp(event);
    };
        
    fluid.testUtils.reorderer.bindReorderer = function (ids) {
        return {
            compositeKey: function (reorderer, event, targetIndex) {
                return fluid.testUtils.reorderer.compositeKey(reorderer, event, 
                   fluid.byId(ids[targetIndex]));
            },
            keyUp: function (reorderer, event, targetIndex) {
                return fluid.testUtils.reorderer.keyUp(reorderer, event, 
                   fluid.byId(ids[targetIndex]));
            },
            keyDown: function (reorderer, event, targetIndex) {
                return fluid.testUtils.reorderer.keyDown(reorderer, event, 
                   fluid.byId(ids[targetIndex]));
            }
        };
    };   
    
    // GeometricManagerTest
    fluid.testUtils.reorderer.stepProjectFrom = function (disabledWrap) {
        // column 1, 3x3 squares spaced by 1, middle skew 1 to the right
        var rects = [
            {left: 1, top: 1, right: 4, bottom: 4},
            {left: 2, top: 5, right: 5, bottom: 8},
            {left: 1, top: 9, right: 4, bottom: 12},
        // column 2, same dimensions but offset down by 1
            {left: 6, top: 2, right: 9, bottom: 5},
            {left: 6, top: 6, right: 9, bottom: 9}
        ];
        
        var elems = fluid.transform(rects, function (rect, i) {
            return {rect: rect, index: i};
        });
                 
        function assertProject(name, fromIndex, direction, toIndex, couldWrap) {
            var proj = fluid.geom.projectFrom(rects[fromIndex], fluid.direction[direction], elems, false, disabledWrap);
            if (couldWrap && disabledWrap) {
                jqUnit.assertUndefined(name + " index " + toIndex, proj.cacheelem);
                jqUnit.assertFalse("no wrapping from index:" + fromIndex + " to index:" + toIndex + " wrapped set to " + couldWrap, proj.wrapped);
            } else {
                jqUnit.assertEquals(name + " index", toIndex, proj.cacheelem.index);
                jqUnit.assertEquals(name + " wrapped", couldWrap, proj.wrapped);
            }
        }
        
        assertProject("Right0", 0, "RIGHT", 3, false, disabledWrap);
        assertProject("Left3",  3, "LEFT",  0, false, disabledWrap);
        assertProject("Right3", 3, "RIGHT", 0, true, disabledWrap);
        assertProject("Left0",  0, "LEFT",  3, true, disabledWrap);
        assertProject("Down0",  0, "DOWN",  1, false, disabledWrap);
        assertProject("Up1",    1, "UP",    0, false, disabledWrap);
        
        assertProject("Up0",    0, "UP",    2, true, disabledWrap);
        assertProject("Down2",  2, "DOWN",  0, true, disabledWrap);
        assertProject("Right2", 2, "RIGHT", 4, false, disabledWrap);
        assertProject("Left4",  4, "LEFT",  1, false, disabledWrap);
        assertProject("Left1",  1, "LEFT",  4, true, disabledWrap);
        assertProject("Right4", 4, "RIGHT", 1, true, disabledWrap);            
             
    };
    
    // stepReorderTests
    fluid.testUtils.reorderer.stepReorderer = function (container, options) {    
        var that = fluid.invokeGlobalFunction(options.reordererOptions.reordererFn, [container, options.reordererOptions]);
        for (var i = 0; i < options.expectedOrderArrays.length; i++) { 
            var focusItem = $(options.itemSelector).focus();
            var expectedOrder = options.expectedOrderArrays[i];
            jqUnit.assertTrue("focus on item " + focusItem.selector, focusItem.hasClass("fl-reorderer-movable-selected"));   
            options.reordererOptions.key(that, fluid.testUtils.ctrlKeyEvent(options.direction), options.itemIndex ? options.itemIndex: options.itemSelector);                
            options.reordererOptions.expectOrderFn("after ctrl-" + options.direction.toLowerCase() + " the order is " + expectedOrder, expectedOrder, 
                    $(options.reordererOptions.thumbArray, that.container), options.reordererOptions.prefix);           
        }
    };   
  
})(jQuery, fluid_1_3);