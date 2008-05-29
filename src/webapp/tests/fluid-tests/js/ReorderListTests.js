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

});
