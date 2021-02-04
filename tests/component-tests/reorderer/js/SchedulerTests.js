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

(function ($) {
    "use strict";

    $(function () {
        jqUnit.module("Scheduler Tests");

        var SchedulerTests = {
            // Conference schedule constants
            conferenceContainerId: "sortableSchedule",
            moveableClass: "movableTopic",
            numMoveables: 6,
            orderableName: "orderable",
            firstMoveableId: "sortableSchedule\\.orderable0",
            secondMoveableId: "sortableSchedule\\.orderable1",
            thirdMoveableId: "sortableSchedule\\.orderable2",
            numUnmoveables: 3,
            unmoveableClass: "fixed"
        };

        jqUnit.test("CSSOrderableFinder", function () {
            // Create a cssOrderableFinder for the class "movableTopic."
            var orderableFinder = fluid.Scheduler.createCSSOrderableFinderForClass(SchedulerTests.moveableClass);
            var foundOrderables = orderableFinder();
            jqUnit.assertEquals("There should be six moveable topics.", 6, foundOrderables.length);

            // Check to make sure each returned element does indeed contain the correct class.
            for (var elementIdx = 0; elementIdx < foundOrderables.length; elementIdx++) {
                var element = foundOrderables[elementIdx];
                jqUnit.assertTrue("The found element should contain the 'movableTopic' CSS class.",
                    jQuery(element).hasClass(SchedulerTests.moveableClass));
            }

            // Create a cssOrderableFinder for a non-existant class "foo."
            orderableFinder = fluid.Scheduler.createCSSOrderableFinderForClass("foo");
            foundOrderables = orderableFinder();
            jqUnit.assertEquals("There should be no elements matched for 'foo'.", 0, foundOrderables.length);
        });

        jqUnit.test("PortalSafeFinder", function () {
            // Create an orderable finder for the core case: orderables with an id of sortableSchedule.orderable[num].
            var orderableFinder = fluid.Scheduler.createPortalSafeFinder(SchedulerTests.conferenceContainerId,
                "orderable", SchedulerTests.numMoveables, ".");
            var containerElement = jQuery("#" + SchedulerTests.conferenceContainerId).get(0);
            var foundOrderables = orderableFinder();
            jqUnit.assertEquals("There should be six moveable topics.", SchedulerTests.numMoveables, foundOrderables.length);

            // Make sure they're all good and correct orderables.
            for (var i = 0; i < SchedulerTests.numMoveables; i++) {
                var element = foundOrderables[i];
                jqUnit.assertValue("Orderable should be a valid element.", foundOrderables[i]);
                jqUnit.assertTrue("Orderable should have the moveable class.", jQuery(element).hasClass(SchedulerTests.moveableClass));
            }

            // Now create a orderable finder for a id pattern that doesn't exist.
            var finder = fluid.Scheduler.createPortalSafeFinder("bar", "foo", SchedulerTests.numMoveables, ".");
            var orderables = finder(containerElement);
            jqUnit.assertEquals("There should be no elements matched for 'nonExistentContainerId'.", 0, orderables.length);
        });

        jqUnit.test("GenerateJSONStringForOrderables", function () {
            var orderables = [jQuery("#" + SchedulerTests.firstMoveableId).get(0)];
            var jsonString = fluid.Scheduler.generateJSONStringForOrderables(orderables);
            jqUnit.assertTrue("The JSON string should have content.", jsonString.length > 0);
            jqUnit.assertEquals("The JSON string does not contain the expected content.",
                "{\"sortableSchedule.orderable0\":0}", jsonString);

            // Test a larger array of elements.
            orderables = [
                jQuery("#" + SchedulerTests.firstMoveableId).get(0),
                jQuery("#" + SchedulerTests.secondMoveableId).get(0),
                jQuery("#" + SchedulerTests.thirdMoveableId).get(0)
            ];

            jsonString = fluid.Scheduler.generateJSONStringForOrderables(orderables);
            jqUnit.assertTrue("The JSON String should have content.", jsonString.length > 0);
            jqUnit.assertEquals("The JSON string does not contain the expected content.",
                "{\"sortableSchedule.orderable0\":0,\"sortableSchedule.orderable1\":1,\"sortableSchedule.orderable2\":2}", jsonString);
        });

        jqUnit.test("InitScheduler", function () {
            var reorderer = fluid.Scheduler.initScheduler(SchedulerTests.conferenceContainerId);

            // Make sure we have a container.
            jqUnit.assertNotNull("The Reorderer's domNode should not be null.", reorderer.container);
            jqUnit.assertEquals("The Reorderer's domNode should be the sortableSchedule element",
                SchedulerTests.conferenceContainerId, reorderer.container.prop("id"));

            // TODO: This test used to check whether parameters that are passed in are sucessfully set in the Reorderer.
            // Now these parameters (layoutHandler, findMovables) are private and cannot be accessed directly from the test
            // We need to find another way to test this functionality.

        });

    });
})(jQuery);
