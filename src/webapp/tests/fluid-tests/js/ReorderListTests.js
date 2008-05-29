/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

$(document).ready (function () {
    var tests = new jqUnit.TestCase ("Reorder List Tests", setUp);

    tests.test ("reorderList API", function () {
        var listReorderer = fluid.reorderList("#list1", "li", callbackConfirmer);
        var item2 = jQuery("#list1item2").focus();
        var item3 = jQuery("#list1item3");
        var downArrow = fluid.testUtils.createEvtDownArrow(); 
        var ctrlDownArrow = fluid.testUtils.createEvtCtrlDownArrow();
        
        // Sniff test the reorderer that was created - keyboard selection and movement

        jqUnit.assertTrue("focus on item2", item2.hasClass ("orderable-selected"));
        jqUnit.assertTrue("focus on item2 - item3 should be default", item3.hasClass ("orderable-default"));
        jqUnit.assertFalse("order hasn't change", orderChangedCallbackWasCalled);

        listReorderer.handleDirectionKeyDown(downArrow);
        jqUnit.assertTrue("down arrow - item2 should be default", item2.hasClass ("orderable-default"));
        jqUnit.assertTrue("down arrow - item3 should be selected", item3.hasClass ("orderable-selected"));
        jqUnit.assertFalse("order shouldn't change", orderChangedCallbackWasCalled);

        listReorderer.handleDirectionKeyDown(ctrlDownArrow);

        var items = jQuery("li", jQuery("#list1"));
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 4, 3, 5", "list1item1", items[0].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 4, 3, 5", "list1item2", items[1].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 4, 3, 5", "list1item4", items[2].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 4, 3, 5", "list1item3", items[3].id);
        jqUnit.assertEquals("after ctrl-down, expect order 1, 2, 4, 3, 5", "list1item5", items[4].id);

        jqUnit.assertTrue("order should change", orderChangedCallbackWasCalled);

    });
    
    tests.test ("reorderList with option", function () {
        var options = {
            cssClassNames: {
                defaultStyle: "myDefault",
                selected: "mySelected"
            }
        };
        
        var listReorderer = fluid.reorderList("#list1", "li", callbackConfirmer, options);
        
        jqUnit.assertEquals("default class is myDefault", "myDefault", listReorderer.cssClasses.defaultStyle);
        jqUnit.assertEquals("selected class is mySelected", "mySelected", listReorderer.cssClasses.selected);
        jqUnit.assertEquals("dragging class is orderable-dragging", "orderable-dragging", listReorderer.cssClasses.dragging);
        jqUnit.assertEquals("mouseDrag class is orderable-dragging", "orderable-dragging", listReorderer.cssClasses.mouseDrag);
        
    });    

    tests.test ("reorderList with multi selectors", function () {
        var selectors = {
            movables: ".orderable",
            selectables: "li", 
            dropTargets: "li" 
        };

        var listReorderer = fluid.reorderList("#list2", selectors, callbackConfirmer);
        
        var item1 = jQuery("#list2item1").focus();
        var item2 = jQuery("#list2item2");
        var item3 = jQuery("#list2item3");
        var item4 = jQuery("#list2item4");
        var downArrow = fluid.testUtils.createEvtDownArrow(); 
        var ctrlDownArrow = fluid.testUtils.createEvtCtrlDownArrow();

        jqUnit.assertTrue("focus on item1", item1.hasClass ("orderable-selected"));
/*
 * There is currently a bug (FLUID-676) where we don't originally put the 'default' class onto things that are
 * selectable but not movable. After they get focus and then lose focus they will have the 'default' style.
 * Once this bug is fixed the following line should be uncommented
 */
//        jqUnit.assertTrue("focus on item1 - item2 should be default", item2.hasClass ("orderable-default"));
        jqUnit.assertFalse("focus on item1 - item2 should not be selected", item2.hasClass ("orderable-selected"));
        jqUnit.assertFalse("order hasn't change", orderChangedCallbackWasCalled);

        listReorderer.handleDirectionKeyDown(downArrow);
        jqUnit.assertTrue("down arrow to item2 - item1 should be default", item1.hasClass ("orderable-default"));
        jqUnit.assertTrue("down arrow to item2 - item2 should be selected", item2.hasClass ("orderable-selected"));
        jqUnit.assertFalse("order shouldn't change", orderChangedCallbackWasCalled);
        
        listReorderer.handleDirectionKeyDown(ctrlDownArrow);
        var items = jQuery("li", jQuery("#list2"));
        jqUnit.assertEquals("after ctrl-down on non-movable, expect order 1, 2, 3, 4", "list2item1", items[0].id);
        jqUnit.assertEquals("after ctrl-down on non-movable, expect order 1, 2, 3, 4", "list2item2", items[1].id);
        jqUnit.assertEquals("after ctrl-down on non-movable, expect order 1, 2, 3, 4", "list2item3", items[2].id);
        jqUnit.assertEquals("after ctrl-down on non-movable, expect order 1, 2, 3, 4", "list2item4", items[3].id);
        jqUnit.assertFalse("after ctrl-down on non-movable, order shouldn't change", orderChangedCallbackWasCalled);

        listReorderer.handleDirectionKeyDown(downArrow);
        jqUnit.assertTrue("down arrow to item3 - item2 should be default", item2.hasClass ("orderable-default"));
        jqUnit.assertTrue("down arrow to item3 - item3 should be selected", item3.hasClass ("orderable-selected"));
        jqUnit.assertFalse("order shouldn't change", orderChangedCallbackWasCalled);

        listReorderer.handleDirectionKeyDown(ctrlDownArrow);
        items = jQuery("li", jQuery("#list2"));
        jqUnit.assertEquals("after ctrl-down on movable, expect order 1, 2, 4, 3", "list2item1", items[0].id);
        jqUnit.assertEquals("after ctrl-down on movable, expect order 1, 2, 4, 3", "list2item2", items[1].id);
        jqUnit.assertEquals("after ctrl-down on movable, expect order 1, 2, 4, 3", "list2item4", items[2].id);
/*
 * There is currently a bug (FLUID-677) in the keyboard reordering: when a selectable is a drop targets but is not movable 
 * the item being moved is placed after the next movable item rather then after the next selectable item.
 * When the bug is fixed, the next line should be uncommented and the line following should be removed.
 */
//        jqUnit.assertEquals("after ctrl-down on movable, expect order 1, 2, 4, 3", "list2item3", items[3].id);
        jqUnit.assertEquals("after ctrl-down on movable, expect order 1, 2, 4, 3", "list2item3", items[4].id);
        jqUnit.assertTrue("after ctrl-down on movable, order should change", orderChangedCallbackWasCalled);

    });
});
