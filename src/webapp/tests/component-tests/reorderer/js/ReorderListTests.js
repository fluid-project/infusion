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
        var tests = new jqUnit.TestCase("Reorder List Tests", setUp);
    
        function assertItemsInOrder(message, expectOrder) {
            return fluid.testUtils.reorderer.assertItemsInOrder(message, expectOrder, 
               jQuery("li", jQuery("#list1")), "list1item");
        }
        
        var k = fluid.testUtils.reorderer.bindReorderer(itemIds);
        
        tests.test("reorderList API", function() {
            var options = {
                selectors: {
                    movables: "li"
                },
                listeners: {
                    afterMove: callbackConfirmer
                }
            };
            var listReorderer = fluid.reorderList("#list1", options);
            var item2 = jQuery("#list1item2").focus();
            var item3 = jQuery("#list1item3");
            
            // Sniff test the reorderer that was created - keyboard selection and movement
    
            jqUnit.assertTrue("focus on item2", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertTrue("focus on item2 - item3 should be default", item3.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertFalse("order hasn't changed", afterMoveCallbackWasCalled);
    
            k.keyDown(listReorderer, fluid.testUtils.keyEvent("DOWN"), 1);
            jqUnit.assertTrue("down arrow - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow - item3 should be selected", item3.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertFalse("order shouldn't change", afterMoveCallbackWasCalled);
    
            k.compositeKey(listReorderer, fluid.testUtils.ctrlKeyEvent("DOWN"), 2);
            
            assertItemsInOrder("after ctrl-down, order should be ", [1, 2, 4, 3, 5]);

            jqUnit.assertTrue("order should change", afterMoveCallbackWasCalled);
    
        });
        
        tests.test("reorderList with optional styles", function() {
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
               jQuery("li", jQuery("#list2")), "list2item");
        }
    
    
        var k2 = fluid.testUtils.reorderer.bindReorderer(itemIds2);
    
        tests.test("reorderList with multi selectors", function() {
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
            
            var item1 = jQuery("#list2item1").focus();
            var item2 = jQuery("#list2item2");
            var item3 = jQuery("#list2item3");
            var item4 = jQuery("#list2item4");
    
            jqUnit.assertTrue("focus on item1", item1.hasClass("fl-reorderer-movable-selected"));

            jqUnit.assertTrue("focus on item1 - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertFalse("focus on item1 - item2 should not be selected", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertFalse("order hasn't changed", afterMoveCallbackWasCalled);
    
            k2.keyDown(listReorderer, fluid.testUtils.keyEvent("DOWN"), 0);
            jqUnit.assertTrue("down arrow to item2 - item1 should be default", item1.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow to item2 - item2 should be selected", item2.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertFalse("order shouldn't change", afterMoveCallbackWasCalled);
            
            k2.compositeKey(listReorderer, fluid.testUtils.ctrlKeyEvent("DOWN"), 1);
            assertItemsInOrder2("after ctrl-down on non-movable, expect order ", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            jqUnit.assertFalse("after ctrl-down on non-movable, order shouldn't change", afterMoveCallbackWasCalled);
    
            k2.keyDown(listReorderer, fluid.testUtils.keyEvent("DOWN"), 1);
            jqUnit.assertTrue("down arrow to item3 - item2 should be default", item2.hasClass("fl-reorderer-movable-default"));
            jqUnit.assertTrue("down arrow to item3 - item3 should be selected", item3.hasClass("fl-reorderer-movable-selected"));
            jqUnit.assertFalse("order shouldn't change", afterMoveCallbackWasCalled);
    
            k2.compositeKey(listReorderer, fluid.testUtils.ctrlKeyEvent("DOWN"), 2);
            assertItemsInOrder2("after ctrl-down on non-movable, expect order ", [1, 2, 4, 5, 3, 6, 7, 8, 9, 10]);

            jqUnit.assertTrue("after ctrl-down on movable, order should change", afterMoveCallbackWasCalled);
    
        });
    });
})(jQuery);
