/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

(function($) {
    $(document).ready(function() {
        var tests = new jqUnit.TestCase("Reorder Grid Tests");
        
        var k = fluid.testUtils.reorderer.bindReorderer(orderableIds);
    
        tests.test("reorderGrid API", function() {
            var options = {
                selectors: {
                    movables: ".float"
                }
            };
            var containerSelector = "[id='" + lightboxRootId + "']";
            var gridReorderer = fluid.reorderGrid(containerSelector, options);
            var item2 = fluid.jById(orderableIds[1]).focus();
            var item3 = fluid.jById(orderableIds[2]);
            var item5 = fluid.jById(orderableIds[4]);
            var ctrlDownArrow = fluid.testUtils.ctrlKeyEvent("DOWN");
            
            // Sniff test the reorderer that was created - keyboard selection and movement
    
            jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertTrue("focus on item2 - item3 should be default", item3.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("focus on item2 - item5 should be default", item5.hasClass("fl-reorderer-movable-default"));
    
            k.keyDown(gridReorderer, fluid.testUtils.keyEvent("DOWN"), 1);
            jqUnit.assertTrue("down arrow - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow - item3 should be default", item3.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow - grid is 3 wide - item5 should be selected", item5.hasClass("fl-reorderer-movable-selected"));
    
            k.compositeKey(gridReorderer, fluid.testUtils.ctrlKeyEvent("DOWN"), 4);
            
            fluid.testUtils.reorderer.assertItemsInOrder("after ctrl-down", [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11, 12, 13], 
                jQuery("img", jQuery(containerSelector)), "fluid.img.");
        
            });
    
        tests.test("reorderGrid with optional styles", function() {
            var options = {
                selectors: {
                    movables: ".float"
                },
                styles: {
                    defaultStyle: "myDefault",
                    selected: "mySelected"
                }
            };
            
            var containerSelector = "[id='" + lightboxRootId + "']";
            var gridReorderer = fluid.reorderGrid(containerSelector, options);
            
            jqUnit.assertEquals("default class is myDefault", "myDefault", gridReorderer.options.styles.defaultStyle);
            jqUnit.assertEquals("selected class is mySelected", "mySelected", gridReorderer.options.styles.selected);
            jqUnit.assertEquals("dragging class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", gridReorderer.options.styles.dragging);
            jqUnit.assertEquals("mouseDrag class is fl-reorderer-movable-dragging", "fl-reorderer-movable-dragging", gridReorderer.options.styles.mouseDrag);
            
        });    
    });
})(jQuery);
