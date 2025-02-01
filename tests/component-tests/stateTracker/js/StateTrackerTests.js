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

        // State tracker that tracks the checked state of a checkbox.
        fluid.defaults("fluid.tests.checkboxTracker", {
            gradeNames: ["fluid.stateTracker"],
            members: {
                checkbox: null,
                numStateChanges: 0
            },
            model: {
                checkboxState: undefined
            },
            modelListeners: {
                checkboxState : {
                    funcName: "fluid.tests.checkboxTracker.countStateChanges",
                    excludeSource: "init",
                    args: ["{that}"]
                }
            },
            invokers: {
                evaluateChange: {
                    funcName: "fluid.tests.checkboxTracker.evaluateChange",
                    args: ["{that}"]
                }
            }
        });

        /**
         * Model listener for state changes:  Count the number of times the
         * test checkbox switches from "checked" to "unchecked" and vice versa.
         * @param {Component} that - An instance of fluid.tests.checkboxTracker
         */
        fluid.tests.checkboxTracker.countStateChanges = function (that) {
            that.numStateChanges++;
        };

        /**
         * Evaluate whether the state being tracked has changed; here, whether
         * the test checkbox has switched from "checked" to "unchecked" or vice
         * versa.
         * @param {Component} that - An instance of fluid.tests.checkboxTracker
         * @return {Boolean} - whether the checked state changed.
         */
        fluid.tests.checkboxTracker.evaluateChange = function (that) {
            if (that.model.checkboxState !== that.checkbox.checked) {
                that.applier.change("checkboxState", that.checkbox.checked);
                return true;
            }
            else {
                return false;
            }
        };

        /**
         * Utility to create an instance of the check box tracker component.
         * @param {Element} checkboxElement - The check box input element to track
         * @return {Component} - a newly minted fluid.tests.checkboxTracker
         */
        fluid.tests.createCheckboxTracker = function (checkboxElement) {
            return fluid.tests.checkboxTracker({
                members: {
                    checkbox: checkboxElement
                },
                model: {
                    checkboxState: checkboxElement.checked
                }
            });
        };

        // Object outside of the tracker that changes the state of the checkbox.
        // Simulates clicking on the checkbox.
        fluid.defaults("fluid.tests.checkboxManipulator", {
            gradeNames: ["fluid.component"],
            members: {
                numChangesToMake: 0,
                numCallsToChangeState: 0
            },
            invokers: {
                changeStateWithDelay: {
                    funcName: "fluid.tests.stateTracker.changeStateWithDelay",
                    args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                                     // number of changes, delay in msec, interval between changes
                }
            }
        });

        /**
         * Simulate a user clicking on the test checkbox to check/uncheck it.
         * @param {Component} that - An instance of fluid.tests.checkboxManipulator
         * @param {Number} numChanges - Number of times to change the checkbox.
         * @param {Number} delay - Base delay in msec before changing the checkbox.
         * @param {Number} interval - Spacing in msec between calls to make the change.
         */
        fluid.tests.stateTracker.changeStateWithDelay = function (that, numChanges, delay, interval) {
            that.numChangesToMake = numChanges;
            for (var i = 0; i < numChanges; i++) {
                setTimeout (function () {
                    stateTrackerTests.checkbox.checked = !stateTrackerTests.checkbox.checked;
                    that.numCallsToChangeState++;
                }, delay);
                delay += interval;
            }
        };

        /**
         * Model listener for testing state change tracking:  Compare the
         * number of actual changes against the tracked ones.
         * @param {Component} tracker - An instance of fluid.tests.checkboxTracker
         * @param {Component} manipulator - An instance of fluid.tests.checkboxManipulator
         */
        fluid.tests.checkboxTracker.testCount = function (tracker, manipulator) {
            if (manipulator.numCallsToChangeState === manipulator.numChangesToMake) {
                jqUnit.start();
                jqUnit.assertEquals(
                    "State change detection",
                    manipulator.numCallsToChangeState,
                    tracker.numStateChanges
                );
                tracker.stopTracking();    // test over, clean up.
            }
        };

        jqUnit.test("Test Initialize", function () {
            jqUnit.expect(5);
            var stateTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            jqUnit.assertNotNull("State tracker instance", stateTracker);
            jqUnit.assertEquals(
                "State tracker's polling interval", 10, stateTracker.interval
            );
            jqUnit.assertEquals(
                "State tracker's intervalID", -1, stateTracker.intervalID
            );
            jqUnit.assertEquals(
                "Tracking test checkbox",
                stateTracker.checkbox,
                stateTrackerTests.checkbox
            );
            jqUnit.assertEquals(
                "State tracker's model initial state",
                stateTracker.model.checkboxState,
                stateTrackerTests.checkbox.checked
            );
        });

        jqUnit.test("Test tracking setup, default interval", function () {
            jqUnit.expect(5);
            var stateTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            jqUnit.assertNotNull("State tracker instance", stateTracker);
            stateTracker.startTracking();
            jqUnit.assertNotEquals("Tracking id", -1, stateTracker.intervalID);
            jqUnit.assertEquals(
                "Interval value", 10, stateTracker.interval
            );
            jqUnit.assertEquals(
                "State change detection", 0, stateTracker.numStateChanges
            );
            stateTracker.stopTracking();
            jqUnit.assertEquals(
                "Tracking ID", -1, stateTracker.intervalID
            );
        });

        jqUnit.test("Test tracking setup, 100 msec interval", function () {
            jqUnit.expect(5);
            var stateTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            jqUnit.assertNotNull("State tracker instance", stateTracker);
            stateTrackerTests.numStateChanges = 0;
            var interval = 100; // msec
            stateTracker.startTracking(interval);

            jqUnit.assertNotEquals("Tracking id", -1, stateTracker.intervalID);
            jqUnit.assertEquals(
                "Interval value", interval, stateTracker.interval
            );
            jqUnit.assertEquals(
                "State change detection", 0, stateTracker.numStateChanges
            );
            stateTracker.stopTracking();
            jqUnit.assertEquals(
                "Tracking ID", -1, stateTracker.intervalID
            );
        });

        jqUnit.asyncTest("Test tracking, default interval", function () {
            jqUnit.expect(1);
            var checkboxTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            var manipulator = fluid.tests.checkboxManipulator();
            checkboxTracker.startTracking();
            checkboxTracker.applier.modelChanged.addListener(
                "checkboxState",
                function () {
                    fluid.tests.checkboxTracker.testCount(checkboxTracker, manipulator);
                }
            );
            // Change the state some number of times, and see if they're
            // detected.  Space the changes by at the tracker's defualt polling
            // interval.
            var delay = 200;
            var numChanges = 3;
            manipulator.changeStateWithDelay(numChanges, delay, checkboxTracker.interval);
        });

        jqUnit.asyncTest("Test tracking, 100 msec interval", function () {
            jqUnit.expect(1);
            var checkboxTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            var manipulator = fluid.tests.checkboxManipulator();
            var interval = 100;
            checkboxTracker.startTracking(interval);
            checkboxTracker.applier.modelChanged.addListener(
                "checkboxState",
                function () {
                    fluid.tests.checkboxTracker.testCount(checkboxTracker, manipulator);
                }
            );
            // Change the a number of times, and see if it's detected.  Space
            // the changes by at least 200 msec.
            var delay = 200;
            var numChanges = 3;
            manipulator.changeStateWithDelay(numChanges, delay, checkboxTracker.interval);
        });

        jqUnit.asyncTest("Test tracking limitation, 100 msec interval", function () {
            jqUnit.expect(1);
            var checkboxTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            var manipulator = fluid.tests.checkboxManipulator();
            var interval = 100;
            checkboxTracker.startTracking(interval);
            checkboxTracker.applier.modelChanged.addListener("checkboxState",
                function () {
                    if (manipulator.numCallsToChangeState === 3) {
                        jqUnit.start();
                        jqUnit.assertNotEquals(
                            "State change detection failure",
                            manipulator.numCallsToChangeState,
                            checkboxTracker.numStateChanges
                        );
                    }
                }
            );
            // Change the state three times, but here the changes are faster
            // than the tracker's polling interval.  This shows a limitation of
            // the technique:  Not all of the changes will be tracked.  Using a
            // short delay with a spacing of that same delay value
            var delay = 25;
            var numChanges = 3;
            manipulator.changeStateWithDelay(numChanges, delay, delay);
        });

        jqUnit.test("Test multiple calls to startTracking()", function () {
            jqUnit.expect(2);
            var stateTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            stateTracker.startTracking();
            var pollingID = stateTracker.intervalID;
            jqUnit.assertNotEquals("Test tracker is tracking", -1, pollingID);

            // Try to start the tracker a second time -- shouldn't happen.
            stateTracker.startTracking();
            jqUnit.assertEquals(
                "Test only one polling interval",
                pollingID, stateTracker.intervalID
            );
        });
    });
})(jQuery);
