/*
Copyright 2008 University of Toronto
Copyright 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit*/

(function ($) {
    $(document).ready(function () {
      
        function expectOrder(message, order) {
           var items = fluid.transform(jQuery(".portlet"), fluid.getId);
           var expected = fluid.transform(order, function(item) {return portletIds[item];});
           jqUnit.assertDeepEq(message, expected, items);
        }
      
        var tests = new jqUnit.TestCase("Reorder Layout Tests");
    
        tests.test("reorderLayout API", function () {
            var options = {
                selectors: {
                    columns: "[id^='c']",
                    modules: ".portlet"
                }
            };
            
            var layoutReorderer = fluid.reorderLayout(".reorderer_container", options);
            var item2 = fluid.jById(portletIds[2]).focus();
            var item3 = fluid.jById(portletIds[3]);
            
            // Sniff test the reorderer that was created - keyboard selection and movement
    
            jqUnit.assertTrue("focus on item2", item2.hasClass("orderable-selected"));
            jqUnit.assertTrue("focus on item2 - item3 should be default", item3.hasClass("orderable-default"));
    
            layoutReorderer.handleKeyDown(fluid.testUtils.keyEvent("DOWN", item2));
            jqUnit.assertTrue("down arrow - item2 should be default", item2.hasClass("orderable-default"));
            jqUnit.assertTrue("down arrow - item3 should be selected", item3.hasClass("orderable-selected"));
    
            layoutReorderer.handleKeyDown(fluid.testUtils.ctrlKeyEvent("CTRL", item3));
            layoutReorderer.handleKeyDown(fluid.testUtils.ctrlKeyEvent("DOWN", item3));
    
            expectOrder("after ctrl-down, expect order 1, 2, 4, 3, 5, 6, 7, 8, 9", 
                [1, 2, 4, 3, 5, 6, 7, 8, 9]);
        });
    
        tests.test("reorderLayout with optional styles", function () {
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
            jqUnit.assertEquals("dragging class is orderable-dragging", "orderable-dragging", layoutReorderer.options.styles.dragging);
            jqUnit.assertEquals("mouseDrag class is orderable-dragging", "orderable-dragging", layoutReorderer.options.styles.mouseDrag);
            
        });
        
        tests.test("reorderLayout with locked portlets", function () {
            var options = {
                selectors: {
                    columns: "[id^='c']",
                    modules: ".portlet",
                    lockedModules: ".locked"
                }
            };

            var layoutReorderer = fluid.reorderLayout(".reorderer_container", options);
            var item2 = fluid.jById(portletIds[2]).focus();
            var item3 = fluid.jById(portletIds[3]);

            jqUnit.assertTrue("focus on item2", item2.hasClass("orderable-selected"));
            layoutReorderer.handleKeyDown(fluid.testUtils.keyEvent("CTRL", item2));
            layoutReorderer.handleKeyDown(fluid.testUtils.ctrlKeyEvent("DOWN", item2));

            expectOrder("after ctrl-down, expect order 1, 2, 3, 4", [1, 2, 3, 4, 5, 6, 7, 8, 9]);

            item3.focus();
            jqUnit.assertTrue("focus on item3", item3.hasClass("orderable-selected"));
            layoutReorderer.handleKeyDown(fluid.testUtils.ctrlKeyEvent("CTRL", item3));
            layoutReorderer.handleKeyDown(fluid.testUtils.ctrlKeyEvent("DOWN", item3));

            expectOrder("after ctrl-down, expect order 1, 2, 4, 3", [1, 2, 4, 3, 5, 6, 7, 8, 9]);

        });
    });
})(jQuery);

