/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {
        jqUnit.module("Reorder Grid Tests");

        var k = fluid.testUtils.reorderer.bindReorderer(fluid.testUtils.imageReorderer.orderableIds);

        var assembleOptions = function (isDisableWrap) {
            var obj = {
                selectors: {
                    movables: ".float"
                },
                disableWrap: isDisableWrap,
                reordererFn: "fluid.reorderGrid",
                expectOrderFn: fluid.testUtils.reorderer.assertItemsInOrder,
                key: fluid.testUtils.reorderer.bindReorderer(fluid.testUtils.imageReorderer.orderableIds).compositeKey,
                thumbArray: "img",
                prefix: "fluid.img."
            };
            return obj;
        };

        jqUnit.test("reorderGrid API", function () {
            var options = assembleOptions(false);
            var containerSelector = "[id='" + fluid.testUtils.imageReorderer.imageReordererRootId + "']";
            var gridReorderer = fluid.reorderGrid(containerSelector, options);
            var item2 = fluid.focus(fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]));
            var item3 = fluid.jById(fluid.testUtils.imageReorderer.orderableIds[2]);
            var item5 = fluid.jById(fluid.testUtils.imageReorderer.orderableIds[4]);

            // Sniff test the reorderer that was created - keyboard selection and movement

            jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertTrue("focus on item2 - item3 should be default", item3.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("focus on item2 - item5 should be default", item5.hasClass("fl-reorderer-movable-default"));

            k.keyDown(gridReorderer, k.keyEvent("DOWN"), 1);
            jqUnit.assertTrue("down arrow - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow - item3 should be default", item3.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow - grid is 3 wide - item5 should be selected", item5.hasClass("fl-reorderer-movable-selected"));

            k.compositeKey(gridReorderer, k.ctrlKeyEvent("DOWN"), 4);

            fluid.testUtils.reorderer.assertItemsInOrder("after ctrl-down", [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11, 12, 13], $("img", $(containerSelector)), "fluid.img.");
        });

        jqUnit.test("reorderGrid with optional styles", function () {
            var options = {
                selectors: {
                    movables: ".float"
                },
                styles: {
                    defaultStyle: "myDefault",
                    selected: "mySelected"
                }
            };

            var containerSelector = "[id='" + fluid.testUtils.imageReorderer.imageReordererRootId + "']";
            var gridReorderer = fluid.reorderGrid(containerSelector, options);

            jqUnit.assertEquals("default class is myDefault", "myDefault", gridReorderer.options.styles.defaultStyle);
            jqUnit.assertEquals("selected class is mySelected", "mySelected", gridReorderer.options.styles.selected);
            jqUnit.assertEquals("dragging class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", gridReorderer.options.styles.dragging);
            jqUnit.assertEquals("mouseDrag class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", gridReorderer.options.styles.mouseDrag);

        });

        jqUnit.test("reorderGrid, option set disabled wrap, user action ctrl+down", function () {
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "DOWN",
                expectedOrderArrays: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 9, 13],
                                      [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 9, 13]],
                itemSelector: fluid.jById(fluid.testUtils.imageReorderer.orderableIds[9]),
                itemIndex: 9
            };

            fluid.testUtils.reorderer.stepReorderer("[id='" + fluid.testUtils.imageReorderer.imageReordererRootId + "']", options);
        });

        jqUnit.test("reorderGrid, option set enabled wrap, user action ctrl+down", function () {
            var options = {
                reordererOptions: assembleOptions(false),
                direction: "DOWN",
                expectedOrderArrays: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 9, 13],
                                      [9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13]],
                itemSelector: fluid.jById(fluid.testUtils.imageReorderer.orderableIds[9]),
                itemIndex: 9
            };

            fluid.testUtils.reorderer.stepReorderer("[id='" + fluid.testUtils.imageReorderer.imageReordererRootId + "']", options);
        });

        jqUnit.test("reorderGrid, option set disabled wrap, user action ctrl+up", function () {
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "UP",
                expectedOrderArrays: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                                      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
                itemSelector: fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]),
                itemIndex: 1
            };

            fluid.testUtils.reorderer.stepReorderer("[id='" + fluid.testUtils.imageReorderer.imageReordererRootId + "']", options);
        });

        jqUnit.test("reorderGrid, option set enabled wrap, user action ctrl+up", function () {
            var options = {
                reordererOptions: assembleOptions(false),
                direction: "UP",
                expectedOrderArrays: [[0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1],
                                      [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 11, 12, 13],
                                      [0, 2, 3, 4, 5, 6, 7, 1, 8, 9, 10, 11, 12, 13]],
                itemSelector: fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]),
                itemIndex: 1
            };

            fluid.testUtils.reorderer.stepReorderer("[id='" + fluid.testUtils.imageReorderer.imageReordererRootId + "']", options);
        });

        jqUnit.test("reorderGrid, option set disabled wrap, user action ctrl+right", function () {
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "RIGHT",
                expectedOrderArrays: [[0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                                      [0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
                itemSelector: fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]),
                itemIndex: 1
            };

            fluid.testUtils.reorderer.stepReorderer("[id='" + fluid.testUtils.imageReorderer.imageReordererRootId + "']", options);
        });

        jqUnit.test("reorderGrid, option set enabled wrap, user action ctrl+right", function () {
            var options = {
                reordererOptions: assembleOptions(false),
                direction: "RIGHT",
                expectedOrderArrays: [[0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                                      [0, 2, 3, 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
                itemSelector: fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]),
                itemIndex: 1
            };

            fluid.testUtils.reorderer.stepReorderer("[id='" + fluid.testUtils.imageReorderer.imageReordererRootId + "']", options);
        });

        jqUnit.test("reorderGrid, option set disabled wrap, user action ctrl+left", function () {
            var options = {
                reordererOptions: assembleOptions(true),
                direction: "LEFT",
                expectedOrderArrays: [[1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                                      [1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
                itemSelector: fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]),
                itemIndex: 1
            };

            fluid.testUtils.reorderer.stepReorderer("[id='" + fluid.testUtils.imageReorderer.imageReordererRootId + "']", options);
        });

        jqUnit.test("reorderGrid, option set enabled wrap, user action ctrl+left", function () {
            var options = {
                reordererOptions: assembleOptions(false),
                direction: "LEFT",
                expectedOrderArrays: [[1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                                      [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1]],
                itemSelector: fluid.jById(fluid.testUtils.imageReorderer.orderableIds[1]),
                itemIndex: 1
            };

            fluid.testUtils.reorderer.stepReorderer("[id='" + fluid.testUtils.imageReorderer.imageReordererRootId + "']", options);
        });

    });
})(jQuery);
