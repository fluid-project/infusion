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
        fluid.setLogging(true);

        fluid.registerNamespace("fluid.tests");

        jqUnit.module("Aria Labeller Tests");

        var itemIds = ["list1item1", "list1item2", "list1item3", "list1item4", "list1item5"];

        var k = fluid.testUtils.reorderer.bindReorderer(itemIds);

        function assertItemsInOrder(message, expectOrder) {
            return fluid.testUtils.reorderer.assertItemsInOrder(message, expectOrder,
                $("li", $("#list1")), "list1item");
        }

        fluid.defaults("fluid.tests.labellerTester", {
            gradeNames: ["fluid.viewComponent"],
            components: {
                reorderer: {
                    type: "fluid.reorderList",
                    container: "{labellerTester}.container"
                }
            }
        });

        jqUnit.asyncTest("IoC instantiation", async function () {

            var labellerTester = fluid.tests.labellerTester("#list1");
            jqUnit.assertNotUndefined("reorderer created", labellerTester.reorderer);

            await fluid.focus($("#list1item3"));
            await k.compositeKey(labellerTester.reorderer, fluid.testUtils.reorderer.ctrlKeyEvent("DOWN"), 2);
            assertItemsInOrder("after ctrl-down, order should be ", [1, 2, 4, 3, 5]);

            var region = fluid.jById(fluid.defaults("fluid.ariaLabeller").liveRegionId);
            jqUnit.assertNotUndefined("Live region should exist", region);

            jqUnit.start();
        });
    });
})(jQuery);
