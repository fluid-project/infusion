/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

$(document).ready (function () {
    var tests = new jqUnit.TestCase ("Reorder Grid Tests", setUp, tearDown);

    tests.test ("reorderGrid API", function () {
        var containerSelector = "[id='" + lightboxRootId + "']";
        var gridReorderer = fluid.reorderGrid(containerSelector, ".float", function () {});
        var item2 = fluid.utils.jById(secondReorderableId).focus();
        var item3 = fluid.utils.jById(thirdReorderableId);
        var item5 = fluid.utils.jById(fifthReorderableId);
        var downArrow = fluid.testUtils.createEvtDownArrow(); 
        var ctrlDownArrow = fluid.testUtils.createEvtCtrlDownArrow();
        
        // Sniff test the reorderer that was created - keyboard selection and movement

        jqUnit.assertTrue("focus on item2", item2.hasClass ("orderable-selected"));
        jqUnit.assertTrue("focus on item2 - item3 should be default", item3.hasClass ("orderable-default"));
        jqUnit.assertTrue("focus on item2 - item5 should be default", item5.hasClass ("orderable-default"));

        gridReorderer.handleDirectionKeyDown(downArrow);
        jqUnit.assertTrue("down arrow - item2 should be default", item2.hasClass ("orderable-default"));
        jqUnit.assertTrue("down arrow - item3 should be default", item3.hasClass ("orderable-default"));
        jqUnit.assertTrue("down arrow - grid is 3 wide - item5 should be selected", item5.hasClass ("orderable-selected"));

        gridReorderer.handleDirectionKeyDown(ctrlDownArrow);

        var items = jQuery("img", jQuery(containerSelector));
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", firstImageId, items[0].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", secondImageId, items[1].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", thirdImageId, items[2].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", fourthImageId, items[3].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", sixthImageId, items[4].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", seventhImageId, items[5].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", eighthImageId, items[6].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", fifthImageId, items[7].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", ninthImageId, items[8].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", tenthImageId, items[9].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", eleventhImageId, items[10].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 3, 4, 6, 7, 8, 5, 9, 10, 11, 12", twelvethImageId, items[11].id);
    });

    tests.test ("reorderGrid with option", function () {
        var options = {
            cssClassNames: {
                defaultStyle: "myDefault",
                selected: "mySelected"
            }
        };
        
        var containerSelector = "[id='" + lightboxRootId + "']";
        var gridReorderer = fluid.reorderGrid(containerSelector, ".float", function () {}, options);
        
        jqUnit.assertEquals("default class is myDefault", "myDefault", gridReorderer.cssClasses.defaultStyle);
        jqUnit.assertEquals("selected class is mySelected", "mySelected", gridReorderer.cssClasses.selected);
        jqUnit.assertEquals("dragging class is orderable-dragging", "orderable-dragging", gridReorderer.cssClasses.dragging);
        jqUnit.assertEquals("mouseDrag class is orderable-dragging", "orderable-dragging", gridReorderer.cssClasses.mouseDrag);
        
    });    
});
