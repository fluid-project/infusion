/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.testUtils.reorderer");

    jqUnit.bindKeySimulator(fluid.reorderer.keys, "fluid.testUtils.reorderer");

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
        var itemId = fluid.testUtils.imageReorderer.orderableIds[index];
        var item = fluid.jById(itemId);

        jqUnit.assertTrue(message + itemId + " should be default", item.hasClass(fluid.testUtils.imageReorderer.defaultClass));
        jqUnit.assertFalse(message + itemId + " should not be selected", item.hasClass(fluid.testUtils.imageReorderer.selectedClass));
        jqUnit.assertFalse(message + itemId + " should not be dragging", item.hasClass(fluid.testUtils.imageReorderer.draggingClass));
    };

    fluid.testUtils.reorderer.assertItemFocused = function (message, index) {
        var itemId = fluid.testUtils.imageReorderer.orderableIds[index];
        var item = fluid.jById(itemId);

        jqUnit.assertTrue(message + itemId + " should be selected", item.hasClass(fluid.testUtils.imageReorderer.selectedClass));
        jqUnit.assertFalse(message + itemId + " should not be default", item.hasClass(fluid.testUtils.imageReorderer.defaultClass));
        jqUnit.assertFalse(message + itemId + " should not be dragging", item.hasClass(fluid.testUtils.imageReorderer.draggingClass));
    };

    fluid.testUtils.reorderer.assertItemDragged = function (message, index) {
        var itemId = fluid.testUtils.imageReorderer.orderableIds[index];
        var item = fluid.jById(itemId);

        jqUnit.assertTrue(message + itemId + " should be dragging", item.hasClass(fluid.testUtils.imageReorderer.draggingClass));
        jqUnit.assertFalse(message + itemId + " should not be default", item.hasClass(fluid.testUtils.imageReorderer.defaultClass));
    };

    /* Break down the process of firing a particular modified key into the separate events
     * of firing the modifier followed by the modified key itself, to give realism to the process
     * of generating the composite key sequence.
     */
    fluid.testUtils.reorderer.compositeKey = function (reorderer, event, target, keepModifierPressed) {
        target = fluid.unwrap(target);
        var modifierEvent = $.extend(true, {}, event);
        var modifier = event.ctrlKey ? "CTRL" : event.shiftKey ? "SHIFT" : event.altKey ? "ALT" : "";
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
            keyEvent: fluid.testUtils.reorderer.keyEvent,
            ctrlKeyEvent: fluid.testUtils.reorderer.ctrlKeyEvent,
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

    // stepReorderTests
    fluid.testUtils.reorderer.stepReorderer = function (container, options) {
        var that = fluid.invokeGlobalFunction(options.reordererOptions.reordererFn, [container, options.reordererOptions]);
        for (var i = 0; i < options.expectedOrderArrays.length; i++) {
            var focusItem = fluid.focus($(options.itemSelector));
            var expectedOrder = options.expectedOrderArrays[i];
            jqUnit.assertTrue("focus on item " + focusItem.selector, focusItem.hasClass("fl-reorderer-movable-selected"));
            options.reordererOptions.key(that, fluid.testUtils.reorderer.ctrlKeyEvent(options.direction), options.itemIndex ? options.itemIndex : options.itemSelector);
            options.reordererOptions.expectOrderFn("after ctrl-" + options.direction.toLowerCase() + " the order is " + expectedOrder, expectedOrder,
                    $(options.reordererOptions.thumbArray, that.container), options.reordererOptions.prefix);
        }
    };

})(jQuery, fluid);
