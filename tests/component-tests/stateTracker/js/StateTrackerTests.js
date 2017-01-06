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
                // Reset for next check.
                that.oldState = that.currentState;
                return true;
            }
            else {
                return false;
            }
        };
        var checkBoxEvaluator = fluid.tests.stateTracker.checkBoxEvaluator();

        // Change the state of the checkbox, but with a delay.  Record the
        // number of calls to change the state.
        stateTrackerTests.numCallsToChangeState = 0;
        stateTrackerTests.changeStateWithDelay = function (delay) {
            setTimeout (function () {
                var isChecked = $("#testCheckBox").attr("checked");
                $("#testCheckBox").attr("checked", !isChecked);
                stateTrackerTests.numCallsToChangeState++;
            }, delay);
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
            jqUnit.assertDeepEq(
                "Monitor's evaluator",
                checkBoxEvaluator,
                monitorInfo.changeEvaluator
            );
            jqUnit.assertEquals(
                "Monitor's initial intervalID", -1, monitorInfo.intervalID
            );
        });

        jqUnit.test("Test tracking state setup, default interval", function () {
            jqUnit.expect(4);
            var stateTracker = fluid.stateTracker();
            jqUnit.assertNotNull("State tracker instance", stateTracker);

            stateTrackerTests.numStateChanges = 0;
            checkBoxEvaluator.init();
            var intervalID = stateTracker.startTracking(
                checkBoxEvaluator,
                stateTrackerTests.onStateChanged
            );
            jqUnit.assertNotEquals("Tracking id", -1, intervalID);
            jqUnit.assertEquals(
                "Interval value", 10, stateTracker.interval
            );
            jqUnit.assertEquals(
                "State change detection", 0, stateTrackerTests.numStateChanges
            );
            stateTracker.stopTracking(
                stateTrackerTests.onStateChanged, intervalID
            );
        });

        jqUnit.test("Test tracking state setup, 100msec interval", function () {
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

        jqUnit.asyncTest("Test tracking state, default interval", function () {
            jqUnit.expect(1);
            var stateTracker = fluid.stateTracker();
            checkBoxEvaluator.init();
            stateTrackerTests.numStateChanges = 0;

            var intervalID = stateTracker.startTracking(
                checkBoxEvaluator,
                stateTrackerTests.onStateChanged
            );
            stateTracker.events.onStateChange.addListener(function () {
                // Below this addListener() block are three calls to change
                // the "checked" state of the test checkbox.
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
            // the changes by at least the tracker's polling interval.
            stateTrackerTests.numCallsToChangeState = 0;
            var delay = 200;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += stateTracker.interval;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += stateTracker.interval;
            stateTrackerTests.changeStateWithDelay(delay);
        });

        jqUnit.asyncTest("Test tracking state, 100msec interval", function () {
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
            // the changes by at least <interval> msec.
            stateTrackerTests.numCallsToChangeState = 0;
            var delay = 200;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += interval;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += interval;
            stateTrackerTests.changeStateWithDelay(delay);
        });

        jqUnit.asyncTest("Test tracking limitation, 100msec interval", function () {
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
                // Below this addListener() block are three calls to change the
                // "checked" state of the test checkbox.
                if (stateTrackerTests.numCallsToChangeState === 3) {
                    jqUnit.assertNotEquals(
                        "State change detection failure",
                        stateTrackerTests.numCallsToChangeState,
                        stateTrackerTests.numStateChanges
                    );
                    jqUnit.start();
                    stateTracker.stopTracking(
                        stateTrackerTests.onStateChanged, intervalID
                    );
                }
            });
            // Change the state three times, and see if it's detected.  The
            // changes are faster than the tracker's polling interval.  This
            // shows a limitation of the technique:  Not all of the changes will
            // be tracked.
            stateTrackerTests.numCallsToChangeState = 0;
            var delay = 25;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += delay;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += delay;
            stateTrackerTests.changeStateWithDelay(delay);
        });
    });
})(jQuery);
