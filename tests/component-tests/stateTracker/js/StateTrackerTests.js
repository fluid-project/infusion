/*
Copyright 2016 OCAD University

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
        jqUnit.module("StateTracker Tests");
        var stateTrackerTests = fluid.registerNamespace("fluid.tests.stateTracker");

        // Handler for when state changes -- count the number of changes.
        stateTrackerTests.numStateChanges = 0;
        stateTrackerTests.onStateChanged = function () {
            stateTrackerTests.numStateChanges++;
        };

        // Object to determine if a state change occurred.
        // TODO:  ?make this part of the fluid.stateTracker source file with a
        // grade of "basic evaluator", abstracting out checkbox specificity?
        fluid.defaults("fluid.tests.stateTracker.checkBoxEvaluator", {
            gradeNames: ["fluid.component"],
            members: {
                oldState: false,
                currentState: false
            },
            invokers: {
                init: {
                    funcName: "fluid.tests.stateTracker.checkBoxEvaluator.init",
                    args: ["{that}"]
                },
                evaluateChange: {
                    funcName: "fluid.tests.stateTracker.checkBoxEvaluator.evaluateChange",
                    args: ["{that}"]
                }
            }
        });
        fluid.tests.stateTracker.checkBoxEvaluator.init = function (that) {
            that.oldState = $("#testCheckBox").attr("checked");
        };
        fluid.tests.stateTracker.checkBoxEvaluator.evaluateChange = function (that) {
            that.currentState = $("#testCheckBox").attr("checked");
            if (that.currentState !== that.oldState) {
                // Reset for next change.
                that.oldState = that.currentState;
                return true;
            }
            else {
                return false;
            }
        };
        var checkBoxEvaluator = fluid.tests.stateTracker.checkBoxEvaluator();

        // Change the state of the checkbox, but with a delay.  For each change
        // count the number of changes.
        stateTrackerTests.numCallsToChangeState = 0;
        stateTrackerTests.changeStateWithDelay = function (delay) {
            setTimeout (function () {
                var isChecked = $("#testCheckBox").attr("checked");
                $("#testCheckBox").attr("checked", !isChecked);
                stateTrackerTests.numCallsToChangeState++;
            }, delay);
        };

        // Set up to track the checkbox's checked state
        stateTrackerTests.initStateTracking = function (stateTracker, interval) {
            checkBoxEvaluator.init();
            stateTrackerTests.numStateChanges = 0;
            stateTrackerTests.numCallsToChangeState = 0;
            var intervalID = stateTracker.startTracking(
                checkBoxEvaluator,
                stateTrackerTests.onStateChanged,
                interval
            );
            return intervalID;
        };

        jqUnit.test("Test Initialize", function () {
            jqUnit.expect(2);
            var stateTracker = fluid.stateTracker();
            jqUnit.assertNotNull("State tracker instance", stateTracker);
            jqUnit.assertEquals(
                "State tracker's polling interval", 10, stateTracker.interval
            );
        });

        jqUnit.test("Test Initialize monitorInfo", function () {
            jqUnit.expect(3);
            checkBoxEvaluator.init();
            var stateTracker = fluid.stateTracker();
            var monitorInfo = stateTracker.initMonitorInfo(checkBoxEvaluator);

            jqUnit.assertNotNull("Monitor instance", monitorInfo);
            jqUnit.assertEquals(
                "Monitor's evaluator",
                checkBoxEvaluator,
                monitorInfo.changeEvaluator
            );
            jqUnit.assertEquals(
                "Monitor's initial intervalID", -1, monitorInfo.intervalID
            );
        });

        jqUnit.test("Test tracking state setup", function () {
            jqUnit.expect(4);
            var stateTracker = fluid.stateTracker();
            jqUnit.assertNotNull("State tracker instance", stateTracker);

            stateTrackerTests.numStateChanges = 0;
            checkBoxEvaluator.init();
            var interval = 100; // msec
            var intervalID = stateTracker.startTracking(
                checkBoxEvaluator,
                stateTrackerTests.onStateChanged,
                interval
            );
            jqUnit.assertNotEquals("Tracking id", -1, intervalID);
            jqUnit.assertEquals(
                "Interval value", interval, stateTracker.interval
            );
            jqUnit.assertEquals(
                "State change detection", 0, stateTrackerTests.numStateChanges
            );
            stateTracker.stopTracking(
                stateTrackerTests.onStateChanged, intervalID
            );
        });

        jqUnit.asyncTest("Test tracking state", function () {
            jqUnit.expect(1);
            var stateTracker = fluid.stateTracker();
            checkBoxEvaluator.init();
            stateTrackerTests.numStateChanges = 0;
            var interval = 100;

            var intervalID = stateTracker.startTracking(
                checkBoxEvaluator,
                stateTrackerTests.onStateChanged,
                interval
            );
            stateTracker.events.onStateChange.addListener(function () {
                // Below this listener are three calls to change the "checked"
                // state of the test checkbox.
                if (stateTrackerTests.numCallsToChangeState === 3) {
                    jqUnit.assertEquals(
                        "State change detection",
                        stateTrackerTests.numCallsToChangeState,
                        stateTrackerTests.numStateChanges
                    );
                    jqUnit.start();
                    stateTracker.stopTracking(
                        stateTrackerTests.onStateChanged, intervalID
                    );
                }
            });
            // Change the state three times, and see if it's detected.  Space
            // the changes by at least <interval> msec plus some slop.
            stateTrackerTests.numCallsToChangeState = 0;
            var delay = 200;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += interval + 25;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += interval + 25;
            stateTrackerTests.changeStateWithDelay(delay);
        });
    });
})(jQuery);
