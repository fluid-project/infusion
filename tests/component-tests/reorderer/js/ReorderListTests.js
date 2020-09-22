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

(function ($) {
    "use strict";

    $(document).ready(function () {

        var afterMoveCallbackWasCalled;

        var callbackConfirmer = function () {
            afterMoveCallbackWasCalled = true;
        };

        // This setUp will be called before each of the tests that are included in unordered-list.html
        function setUp() {
            afterMoveCallbackWasCalled = false;
        }

        jqUnit.module("Reorder List Tests", {setup: setUp});

        function assertItemsInOrder(message, expectOrder) {
            return fluid.testUtils.reorderer.assertItemsInOrder(message, expectOrder,
                $("li", $("#list1")), "list1item");
        }

        var itemIds = ["list1item1", "list1item2", "list1item3", "list1item4", "list1item5"];
        var itemIds2 = fluid.testUtils.reorderer.prepend("list2item", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        var assembleOptions = function (isDisableWrap) {
            var obj = {
                selectors: {
                    movables: "li"
                },
                listeners: {
                    afterMove: callbackConfirmer
                },
                disableWrap: isDisableWrap,
                reordererFn: "fluid.reorderList",
                expectOrderFn: fluid.testUtils.reorderer.assertItemsInOrder,
                key: fluid.testUtils.reorderer.bindReorderer(itemIds).compositeKey,
                thumbArray: "li",
                prefix: "list1item"
            };
            return obj;
        };

        jqUnit.asyncTest("reorderList API", async function () {
            var k = fluid.testUtils.reorderer.bindReorderer(itemIds);
            var options = assembleOptions(false);
            var listReorderer = fluid.reorderList("#list1", options);
            var item2 = $("#list1item2");
            await fluid.focus(item2);
            var item3 = $("#list1item3");

            // Sniff test the reorderer that was created - keyboard selection and movement

            jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertTrue("focus on item2 - item3 should be default", item3.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertFalse("order hasn't changed", afterMoveCallbackWasCalled);

            await k.keyDown(listReorderer, k.keyEvent("DOWN"), 1);
            jqUnit.assertTrue("down arrow - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow - item3 should be selected", item3.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertFalse("order shouldn't change", afterMoveCallbackWasCalled);

            await k.compositeKey(listReorderer, k.ctrlKeyEvent("DOWN"), 2);

            assertItemsInOrder("after ctrl-down, order should be ", [1, 2, 4, 3, 5]);

            jqUnit.assertTrue("order should change", afterMoveCallbackWasCalled);

            jqUnit.start();
        });

        jqUnit.test("reorderList with optional styles", function () {
            var options = {
                selectors: {
                    movables: "li"
                },
                listeners: {
                    afterMove: callbackConfirmer
                },
                styles: {
                    defaultStyle: "myDefault",
                    selected: "mySelected"
                }
            };

            var listReorderer = fluid.reorderList("#list1", options);

            jqUnit.assertEquals("default class is myDefault", "myDefault", listReorderer.options.styles.defaultStyle);
            jqUnit.assertEquals("selected class is mySelected", "mySelected", listReorderer.options.styles.selected);
            jqUnit.assertEquals("dragging class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", listReorderer.options.styles.dragging);
            jqUnit.assertEquals("mouseDrag class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", listReorderer.options.styles.mouseDrag);

        });

        function assertItemsInOrder2(message, expectOrder) {
            return fluid.testUtils.reorderer.assertItemsInOrder(message, expectOrder,
                $("li", $("#list2")), "list2item");
        }

        jqUnit.asyncTest("reorderList with multi selectors", async function () {
            var k2 = fluid.testUtils.reorderer.bindReorderer(itemIds2);
            var options = {
                selectors: {
                    movables: ".orderable",
                    selectables: "li",
                    dropTargets: "li"
                },
                listeners: {
                    afterMove: callbackConfirmer
                }
            };

            var listReorderer = fluid.reorderList("#list2", options);

            var item1 = $("#list2item1");
            await fluid.focus(item1);
            var item2 = $("#list2item2");
            var item3 = $("#list2item3");

            jqUnit.assertTrue("focus on item1", item1.hasClass("fl-reorderer-movable-selected"));

            jqUnit.assertTrue("focus on item1 - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertFalse("focus on item1 - item2 should not be selected", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertFalse("order hasn't changed", afterMoveCallbackWasCalled);

            await k2.keyDown(listReorderer, k2.keyEvent("DOWN"), 0);
            jqUnit.assertTrue("down arrow to item2 - item1 should be default", item1.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow to item2 - item2 should be selected", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertFalse("order shouldn't change", afterMoveCallbackWasCalled);

            await k2.compositeKey(listReorderer, k2.ctrlKeyEvent("DOWN"), 1);
            assertItemsInOrder2("after ctrl-down on non-movable, expect order ", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            jqUnit.assertFalse("after ctrl-down on non-movable, order shouldn't change", afterMoveCallbackWasCalled);

            await k2.keyDown(listReorderer, k2.keyEvent("DOWN"), 1);
            jqUnit.assertTrue("down arrow to item3 - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow to item3 - item3 should be selected", item3.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertFalse("order shouldn't change", afterMoveCallbackWasCalled);

            await k2.compositeKey(listReorderer, k2.ctrlKeyEvent("DOWN"), 2);
            assertItemsInOrder2("after ctrl-down on non-movable, expect order ", [1, 2, 4, 5, 3, 6, 7, 8, 9, 10]);

            jqUnit.assertTrue("after ctrl-down on movable, order should change", afterMoveCallbackWasCalled);

            jqUnit.start();
        });

        jqUnit.asyncTest("reorderList, option set disabled wrap, user action ctrl+down", async function () {
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "DOWN",
                expectedOrderArrays: [[1, 2, 3, 5, 4], [1, 2, 3, 5, 4]],
                itemSelector: $("#list1item4"),
                itemIndex: 3
            };

            await fluid.testUtils.reorderer.stepReorderer("#list1", options);

            jqUnit.start();
        });

        jqUnit.asyncTest("reorderList, option set disabled wrap, user action ctrl+up", async function () {
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "UP",
                expectedOrderArrays: [[2, 1, 3, 4, 5], [2, 1, 3, 4, 5]],
                itemSelector: $("#list1item2"),
                itemIndex: 1
            };

            await fluid.testUtils.reorderer.stepReorderer("#list1", options);

            jqUnit.start();
        });

    });
})(jQuery);
