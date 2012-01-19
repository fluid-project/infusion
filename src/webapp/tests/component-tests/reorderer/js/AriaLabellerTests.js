/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery, itemIds*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        fluid.setLogging(true);
        
        fluid.registerNamespace("fluid.tests");
        
        var ariaLabellerTests = new jqUnit.TestCase("Aria Labeller Tests");
        var k = fluid.testUtils.reorderer.bindReorderer(itemIds);

        function assertItemsInOrder(message, expectOrder) {
            return fluid.testUtils.reorderer.assertItemsInOrder(message, expectOrder, 
                $("li", $("#list1")), "list1item");
        }        

        fluid.defaults("fluid.tests.labellerTester", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            components: {
                reorderer: {
                    type: "fluid.reorderList"
                }
            }
        });
        
        fluid.demands("fluid.reorderList", "fluid.tests.labellerTester", 
            ["{labellerTester}.container", "{options}"]);
        
        ariaLabellerTests.test("IoC instantiation", function () {

            var labellerTester = fluid.tests.labellerTester("#list1");
            jqUnit.assertNotUndefined("reorderer created", labellerTester.reorderer);

            $("#list1item3").focus();
            k.compositeKey(labellerTester.reorderer, fluid.testUtils.ctrlKeyEvent("DOWN"), 2);
            assertItemsInOrder("after ctrl-down, order should be ", [1, 2, 4, 3, 5]);

            var region = fluid.jById(fluid.defaults("fluid.ariaLabeller").liveRegionId);
            jqUnit.assertNotUndefined("Live region should exist", region);
        });
    });
})(jQuery);
