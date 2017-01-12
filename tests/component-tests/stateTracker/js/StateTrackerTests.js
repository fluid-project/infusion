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
        stateTrackerTests.checkbox = document.getElementById("testCheckBox");

        // Handler for when state changes -- count the number of changes.
        stateTrackerTests.numStateChanges = 0;
        stateTrackerTests.onStateChanged = function () {
            stateTrackerTests.numStateChanges++;
        };

        // State tracker that tracks the checked state of a checkbox.
        fluid.defaults("fluid.tests.checkboxTracker", {
            gradeNames: ["fluid.stateTracker"],
            members: {
                checkbox: null,
                oldState: false
            },
            invokers: {
                evaluateChange: {
                    funcName: "fluid.tests.checkboxTracker.evaluateChange",
                    args: ["{that}"]
                }
            }
        });
        fluid.tests.checkboxTracker.evaluateChange = function (that) {
            if (that.oldState !== that.checkbox.checked) {
                // Reset for next check.
                that.oldState = that.checkbox.checked;
                return true;
            }
            else {
                return false;
            }
        };

        fluid.tests.createCheckboxTracker = function (checkboxElement) {
            return fluid.tests.checkboxTracker({
                members: {
                    checkbox: checkboxElement,
                    oldState: checkboxElement.checked
                }
            });
        };

        // Change the state of the checkbox, but with a delay.  Record the
        // number of calls to change the state.
        stateTrackerTests.numCallsToChangeState = 0;
        stateTrackerTests.changeStateWithDelay = function (delay) {
            setTimeout (function () {
                stateTrackerTests.checkbox.checked = !stateTrackerTests.checkbox.checked;
                stateTrackerTests.numCallsToChangeState++;
            }, delay);
        };

        jqUnit.test("Test Initialize", function () {
            jqUnit.expect(2);
            var stateTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            jqUnit.assertNotNull("State tracker instance", stateTracker);
            jqUnit.assertEquals(
                "State tracker's polling interval", 10, stateTracker.interval
            );
        });

        jqUnit.test("Test Initialize monitorInfo", function () {
            jqUnit.expect(3);
            var stateTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            var monitorInfo = stateTracker.initMonitorInfo();

            jqUnit.assertNotNull("Monitor instance", monitorInfo);
            jqUnit.assertDeepEq(
                "Monitor's evaluator",
                stateTracker,
                monitorInfo.changeEvaluator
            );
            jqUnit.assertEquals(
                "Monitor's initial intervalID", -1, monitorInfo.intervalID
            );
        });

        jqUnit.test("Test tracking setup, default interval", function () {
            jqUnit.expect(4);
            var stateTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            jqUnit.assertNotNull("State tracker instance", stateTracker);

            stateTrackerTests.numStateChanges = 0;
            var intervalID = stateTracker.startTracking(
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

        jqUnit.test("Test tracking setup, 100 msec interval", function () {
            jqUnit.expect(4);
            var stateTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            jqUnit.assertNotNull("State tracker instance", stateTracker);

            stateTrackerTests.numStateChanges = 0;
            var interval = 100; // msec
            var intervalID = stateTracker.startTracking(
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

        jqUnit.asyncTest("Test tracking, default interval", function () {
            jqUnit.expect(1);

            stateTrackerTests.numStateChanges = 0;
            stateTrackerTests.numCallsToChangeState = 0;
            var checkboxTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            var intervalID = checkboxTracker.startTracking(
                stateTrackerTests.onStateChanged
            );
            checkboxTracker.events.onStateChange.addListener(function () {
                // Below this addListener() block are three calls to change
                // the "checked" state of the test checkbox.
                if (stateTrackerTests.numCallsToChangeState === 3) {
                    jqUnit.assertEquals(
                        "State change detection",
                        stateTrackerTests.numCallsToChangeState,
                        stateTrackerTests.numStateChanges
                    );
                    jqUnit.start();
                    checkboxTracker.stopTracking(
                        stateTrackerTests.onStateChanged, intervalID
                    );
                }
            });
            // Change the state three times, and see if it's detected.  Space
            // the changes by at least the tracker's polling interval.
            var delay = 200;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += checkboxTracker.interval;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += checkboxTracker.interval;
            stateTrackerTests.changeStateWithDelay(delay);
        });

        jqUnit.asyncTest("Test tracking, 100 msec interval", function () {
            jqUnit.expect(1);

            stateTrackerTests.numStateChanges = 0;
            stateTrackerTests.numCallsToChangeState = 0;
            var checkboxTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            var interval = 100;

            var intervalID = checkboxTracker.startTracking(
                stateTrackerTests.onStateChanged,
                interval
            );
            checkboxTracker.events.onStateChange.addListener(function () {
                // Below this listener are three calls to change the "checked"
                // state of the test checkbox.
                if (stateTrackerTests.numCallsToChangeState === 3) {
                    jqUnit.assertEquals(
                        "State change detection",
                        stateTrackerTests.numCallsToChangeState,
                        stateTrackerTests.numStateChanges
                    );
                    jqUnit.start();
                    checkboxTracker.stopTracking(
                        stateTrackerTests.onStateChanged, intervalID
                    );
                }
            });
            // Change the state three times, and see if it's detected.  Space
            // the changes by at least <interval> msec.
            var delay = 200;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += interval;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += interval;
            stateTrackerTests.changeStateWithDelay(delay);
        });

        jqUnit.asyncTest("Test tracking limitation, 100 msec interval", function () {
            jqUnit.expect(1);

            stateTrackerTests.numStateChanges = 0;
            stateTrackerTests.numCallsToChangeState = 0;
            var checkboxTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            var interval = 100;

            var intervalID = checkboxTracker.startTracking(
                stateTrackerTests.onStateChanged,
                interval
            );
            checkboxTracker.events.onStateChange.addListener(function () {
                // Below this addListener() block are three calls to change the
                // "checked" state of the test checkbox.
                if (stateTrackerTests.numCallsToChangeState === 3) {
                    jqUnit.assertNotEquals(
                        "State change detection failure",
                        stateTrackerTests.numCallsToChangeState,
                        stateTrackerTests.numStateChanges
                    );
                    jqUnit.start();
                    checkboxTracker.stopTracking(
                        stateTrackerTests.onStateChanged, intervalID
                    );
                }
            });
            // Change the state three times, and see if it's detected.  The
            // changes are faster than the tracker's polling interval.  This
            // shows a limitation of the technique:  Not all of the changes will
            // be tracked.
            var delay = 25;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += delay;
            stateTrackerTests.changeStateWithDelay(delay);
            delay += delay;
            stateTrackerTests.changeStateWithDelay(delay);
        });
    });
})(jQuery);
