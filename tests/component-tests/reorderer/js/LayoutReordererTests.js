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

/* global jqUnit */

"use strict";

jqUnit.module("LayoutReorderer Tests");

jqUnit.test("grabHandle propagatation test (FLUID-5243)", function () {
    var that = fluid.reorderLayout("#" + fluid.testUtils.moduleLayout.portalRootId, {
        selectors: {
            grabHandle: ".title"
        }
    });
    jqUnit.assertEquals("grabHandle propagated through expansion", ".title",
        that.options.selectors.grabHandle);
});

var k = fluid.testUtils.reorderer.bindReorderer(fluid.testUtils.moduleLayout.portletIds);

jqUnit.asyncTest("Default selectors", async function () {
    fluid.reorderLayout("#default-selector-test");
    var item1 = $("#portlet-1");
    var item2 = $("#portlet-2");
    await fluid.focus(item2);

    // Sniff test the reorderer that was created - keyboard selection
    jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
    jqUnit.assertTrue("focus on item2 - item1 should be default", item1.hasClass("fl-reorderer-movable-default"));

    jqUnit.start();
});

jqUnit.asyncTest("Events within module", async function () {
    var reorderer = fluid.reorderLayout("#" + fluid.testUtils.moduleLayout.portalRootId, {
        selectors: {
            columns: fluid.testUtils.moduleLayout.columnSelector,
            modules: fluid.testUtils.moduleLayout.portletSelector
        }
    });

    await fluid.focus(fluid.jById(fluid.testUtils.moduleLayout.portletIds[2]));
    var text2 = fluid.jById("text-2");
    await fluid.focus(text2);
    text2.simulate("keypress", {keyCode: fluid.reorderer.keys.m});

    jqUnit.assertEquals("After typing M into text field, portlet 2 should still be the active item",
        fluid.testUtils.moduleLayout.portletIds[2], reorderer.activeItem.id);
    // This test for FLUID-1690 cannot be made to work in the jqUnit environment yet
    // var blurred = false;
    // text2.blur(function() {blurred = true;});

    // $("#portlet2 .title").simulate("mousedown");
    // $("#portlet2 .title").simulate("mouseup");
    // jqUnit.assertTrue("After mouseDown on title, text field should be blurred", blurred);

    jqUnit.start();

});

jqUnit.asyncTest("Drop warning visibility for up and down", async function () {
    var reorderer = fluid.testUtils.moduleLayout.initReorderer();

    jqUnit.notVisible("On first load the warning should not be visible", "#drop-warning");

    // focus on portlet 3 - it is underneath a locked portlet
    var portlet3 = fluid.jById(fluid.testUtils.moduleLayout.portletIds[3]);
    await fluid.focus(portlet3);

    var label = fluid.getAriaLabeller(portlet3);
    jqUnit.assertValue("Aria labeller is present", label);

    var labelElement = portlet3.attr("aria-label");
    jqUnit.assertTrue("Text labels position of portlet",
        labelElement.indexOf("3 of 4 in column 1 of 4") > -1);

    // try to move portlet 3 up
    // Press the ctrl key
    await k.keyDown(reorderer, k.ctrlKeyEvent("CTRL"), 3);
    jqUnit.notVisible("After ctrl down, the warning should not be visible", "#drop-warning");

    // Press the up arrow key while holding down ctrl
    await k.keyDown(reorderer, k.ctrlKeyEvent("UP"), 3);
    jqUnit.isVisible("After ctrl + up arrow, drop warning should be visible", "#drop-warning");

    // release the ctrl key
    k.keyUp(reorderer, k.keyEvent("CTRL"), 3);
    jqUnit.notVisible("After ctrl is released, drop warning should not be visible", "#drop-warning");

    // Press the up arrow key while holding down ctrl again
    await k.keyDown(reorderer, k.ctrlKeyEvent("CTRL"), 3);
    await k.keyDown(reorderer, k.ctrlKeyEvent("UP"), 3);
    jqUnit.isVisible("After ctrl + up arrow, drop warning should be visible", "#drop-warning");

    // Press the down arrow key while holding down ctrl
    await k.keyDown(reorderer, k.ctrlKeyEvent("DOWN"), 3);
    jqUnit.notVisible("After ctrl + down arrow, drop warning should NOT be visible", "#drop-warning");

    jqUnit.assertTrue("Label is updated to account for temporary moved state",
        portlet3.attr("aria-label").indexOf("moved from") > -1);

    await fluid.blur(portlet3[0]);
    // focus on portlet 8
    var portlet8 = fluid.byId(fluid.testUtils.moduleLayout.portletIds[8]);
    await fluid.focus($(portlet8));

    jqUnit.assertTrue("Temporary moved state is cleared",
        portlet3.attr("aria-label").indexOf("moved from") === -1);

    // move portlet 8 down
    // Press the ctrl key
    await reorderer.handleKeyDown(k.ctrlKeyEvent("CTRL", portlet8));
    jqUnit.notVisible("After ctrl down, the warning should not be visible", "#drop-warning");

    await reorderer.handleKeyDown(k.ctrlKeyEvent("DOWN", portlet8));
    jqUnit.notVisible("After moving portlet 8 down, drop warning should not be visible", "#drop-warning");

    // try to move portlet 8 down from the bottom position.
    await reorderer.handleKeyDown(k.ctrlKeyEvent("DOWN", portlet8));
    jqUnit.notVisible("After trying to move portlet 8 down, drop warning should not be visible", "#drop-warning");

    // release the ctrl key
    reorderer.handleKeyUp(k.keyEvent("CTRL", portlet8));
    jqUnit.notVisible("After ctrl is released, drop warning should not be visible", "#drop-warning");

    jqUnit.start();
});

function numbersToIds(numbers) {
    return fluid.transform(numbers, function (item) {
        return fluid.testUtils.moduleLayout.portletIds[item];
    });
}

function expectOrder(canonEqual) {
    canonEqual = numbersToIds(canonEqual);
    // TODO: Hack to allow two possible orders for FLUID-5859 in "LEFT" test
    var canonFunc = canonEqual ? function (array) {
        return fluid.transform(array, function (element) {
            return canonEqual.includes(element) ? canonEqual[0] : element;
        });
    } : fluid.identity;
    return function (message, order) {
        var items = fluid.transform($(".portlet"), fluid.getId);
        var expected = numbersToIds(order);
        if (canonEqual) {
            jqUnit.assertCanoniseEqual(message, expected, items, canonFunc);
        } else {
            jqUnit.assertDeepEq(message, expected, items);
        }
    };
}

jqUnit.module("Reorder Layout Tests");

// TODO: This should be expressed as a proper grade constructor rather than
// "a bunch of functions returning stuff"
var assembleOptions = function (isDisableWrap, isLocked, canonEqual) {
    var obj = {
        selectors: {
            columns: "[id^='c']",
            modules: ".portlet",
            lockedModules: isLocked
        },
        disableWrap: isDisableWrap,
        reordererFn: "fluid.reorderLayout",
        expectOrderFn: expectOrder(canonEqual),
        key: fluid.testUtils.reorderer.compositeKey
    };

    return obj;
};

jqUnit.asyncTest("reorderLayout API", async function () {
    var options = assembleOptions();
    var lastLayoutModel = null;

    var layoutReorderer = fluid.reorderLayout(".reorderer_container", options);

    // Test for FLUID-3121
    var afterMoveListener = function () {
        lastLayoutModel = layoutReorderer.layoutHandler.getModel();
    };
    layoutReorderer.events.afterMove.addListener(afterMoveListener);

    var item2 = fluid.jById(fluid.testUtils.moduleLayout.portletIds[2]);
    await fluid.focus(item2);
    var item3 = fluid.jById(fluid.testUtils.moduleLayout.portletIds[3]);

    // Sniff test the reorderer that was created - keyboard selection and movement
    jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
    jqUnit.assertTrue("focus on item2 - item3 should be default", item3.hasClass("fl-reorderer-movable-default"));
    jqUnit.assertEquals("No move callback", null, lastLayoutModel);

    await layoutReorderer.handleKeyDown(k.keyEvent("DOWN", item2));
    jqUnit.assertTrue("down arrow - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
    jqUnit.assertTrue("down arrow - item3 should be selected", item3.hasClass("fl-reorderer-movable-selected"));

    await layoutReorderer.handleKeyDown(k.ctrlKeyEvent("CTRL", item3));
    await layoutReorderer.handleKeyDown(k.ctrlKeyEvent("DOWN", item3));
    // Test FLUID-3121 - the afterMoveCallback should successfully execute and obtain the model
    jqUnit.assertNotEquals("Move callback with model", null, lastLayoutModel);

    expectOrder("after ctrl-down, expect order 1, 2, 4, 3, 5, 6, 7, 8, 9",
        [1, 2, 4, 3, 5, 6, 7, 8, 9]);

    jqUnit.start();
});

jqUnit.test("reorderLayout with optional styles", function () {
    var options = {
        selectors: {
            columns: "[id^='c']",
            modules: ".portlet"
        },
        styles: {
            defaultStyle: "myDefault",
            selected: "mySelected"
        }
    };

    var layoutReorderer = fluid.reorderLayout(".reorderer_container", options);

    jqUnit.assertEquals("default class is myDefault", "myDefault", layoutReorderer.options.styles.defaultStyle);
    jqUnit.assertEquals("selected class is mySelected", "mySelected", layoutReorderer.options.styles.selected);
    jqUnit.assertEquals("dragging class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", layoutReorderer.options.styles.dragging);
    jqUnit.assertEquals("mouseDrag class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", layoutReorderer.options.styles.mouseDrag);

});

jqUnit.asyncTest("reorderLayout with locked portlets", async function () {
    var options = assembleOptions(false, ".locked");
    var layoutReorderer = fluid.reorderLayout(".reorderer_container", options);
    var item2 = fluid.jById(fluid.testUtils.moduleLayout.portletIds[2]);
    await fluid.focus(item2);
    var item3 = fluid.jById(fluid.testUtils.moduleLayout.portletIds[3]);
    var key = fluid.testUtils.reorderer.compositeKey;

    jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
    await key(layoutReorderer, k.ctrlKeyEvent("DOWN"), item3);

    expectOrder("after ctrl-down, expect order 1, 2, 3, 4", [1, 2, 3, 4, 5, 6, 7, 8, 9]);

    await fluid.focus(item3);
    jqUnit.assertTrue("focus on item3", item3.hasClass("fl-reorderer-movable-selected"));
    await key(layoutReorderer, k.ctrlKeyEvent("DOWN"), item3);

    expectOrder("after ctrl-down, expect order 1, 2, 4, 3", [1, 2, 4, 3, 5, 6, 7, 8, 9]);

    $("#portlet-reorderer-root tr").append($("<td id=\"c5\"/>"));
    layoutReorderer.refresh();

    var model = layoutReorderer.layoutHandler.layout;

    jqUnit.assertEquals("Should now have 5 columns", 5, model.columns.length);

    await key(layoutReorderer, k.ctrlKeyEvent("LEFT"), item3);

    jqUnit.assertTrue("Moved to new column", fluid.byId("c5").contains(item3[0]));

    jqUnit.start();
});

jqUnit.asyncTest("reorderLayout, option set disabled wrap, user action ctrl+up", async function () {
    var options = {
        reordererOptions: assembleOptions(true),
        direction: "UP",
        expectedOrderArrays: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
        itemSelector: fluid.jById(fluid.testUtils.moduleLayout.portletIds[1])
    };

    await fluid.testUtils.reorderer.stepReorderer(".reorderer_container", options);

    jqUnit.start();
});

jqUnit.asyncTest("reorderLayout, option set disabled wrap, user action ctrl+down", async function () {
    var options = {
        reordererOptions: assembleOptions(true),
        direction: "DOWN",
        expectedOrderArrays: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
        itemSelector: fluid.jById(fluid.testUtils.moduleLayout.portletIds[9])
    };

    await fluid.testUtils.reorderer.stepReorderer(".reorderer_container", options);

    jqUnit.start();
});

jqUnit.asyncTest("reorderLayout with locked portlets, option set disabled wrap, user action ctrl+up", async function () {
    var options = {
        reordererOptions: assembleOptions(true, ".locked"),
        direction: "UP",
        expectedOrderArrays: [[1, 2, 4, 3, 5, 6, 7, 8, 9], [1, 2, 4, 3, 5, 6, 7, 8, 9]],
        itemSelector: fluid.jById(fluid.testUtils.moduleLayout.portletIds[4])
    };

    await fluid.testUtils.reorderer.stepReorderer(".reorderer_container", options);

    jqUnit.assertValue("gives warning message when trying to move item4 up ", $(".flc-reorderer-dropWarning"));

    jqUnit.start();
});

jqUnit.asyncTest("reorderLayout with locked portlets, option set disabled wrap, user action ctrl+right", async function () {
    var options = {
        reordererOptions: assembleOptions(true, ".locked"),
        direction: "RIGHT",
        expectedOrderArrays: [
            [1, 2, 4, 5, 6, 3, 7, 8, 9],
            [1, 2, 4, 5, 6, 7, 8, 3, 9],
            [1, 2, 4, 5, 6, 7, 8, 9, 3],
            [1, 2, 4, 5, 6, 7, 8, 9, 3]
        ],
        itemSelector: fluid.jById(fluid.testUtils.moduleLayout.portletIds[3])
    };

    await fluid.testUtils.reorderer.stepReorderer(".reorderer_container", options);

    jqUnit.start();
});

jqUnit.asyncTest("reorderLayout with locked portlets, option set disabled wrap, user action ctrl+left", async function () {
    var options = {
        // TODO: HACK to resolve FLUID-5859 on Linux - these portlets may appear in either order in the left column due to layout variation
        reordererOptions: assembleOptions(true, ".locked", [3, 9]),
        direction: "LEFT",
        expectedOrderArrays: [
            [1, 2, 3, 4, 5, 6, 9, 7, 8],
            [1, 2, 3, 9, 4, 5, 6, 7, 8],
            // FLUID-5859: variant order here to test the test
            [1, 2, 9, 3, 4, 5, 6, 7, 8]
        ],
        itemSelector: fluid.jById(fluid.testUtils.moduleLayout.portletIds[9])
    };

    await fluid.testUtils.reorderer.stepReorderer(".reorderer_container", options);

    jqUnit.start();
});

var tabIndexTest = function (container, reordererOptions) {
    var layoutReorderer =  fluid.reorderLayout(container, reordererOptions);
    jqUnit.assertEquals("Tabindex should be set to 0 for the container ", 0, +layoutReorderer.container.attr("tabindex"));

    var modules = layoutReorderer.locate("modules");
    for (var i = 0; i < modules.length; i++) {
        jqUnit.assertEquals("Tabindex should be set to -1 for item " + i, -1, +modules.eq(i).attr("tabindex"));
    }
};

jqUnit.test("Check tabindex with default selectors", function () {
    tabIndexTest("#default-selector-test");
});

jqUnit.test("Check tabindex when using a table. ", function () {
    var options = {
        selectors: {
            columns: "td",
            modules: "td > div"
        }
    };
    tabIndexTest("#portlet-reorderer-root", options);
});
