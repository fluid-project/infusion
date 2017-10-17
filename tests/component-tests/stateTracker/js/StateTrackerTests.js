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
         * @param that {Component} An instance of fluid.tests.checkboxTracker
         */
        fluid.tests.checkboxTracker.countStateChanges = function (that) {
            that.numStateChanges++;
        };

        /**
         * Evaluate whether the state being tracked has changed; here, whether
         * the test checkbox has switched from "checked" to "unchecked" or vice
         * versa.
         * @param that {Component} An instance of fluid.tests.checkboxTracker
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
                numCallsToChangeState: 0
            },
            invokers: {
                changeStateWithDelay: {
                    funcName: "fluid.tests.stateTracker.changeStateWithDelay",
                    args: ["{that}", "{arguments}.0"]
                                     // delay in msec.
                }
            }
        });

        /**
         * Simulate a user clicking on the test checkbox to check/uncheck it.
         * @param that {Component}  An instance of fluid.tests.checkboxManipulator
         * @param delay {Number}    Delay in msec before changing the checkbox.
         */
        fluid.tests.stateTracker.changeStateWithDelay = function (that, delay) {
            setTimeout (function () {
                stateTrackerTests.checkbox.checked = !stateTrackerTests.checkbox.checked;
                that.numCallsToChangeState++;
            }, delay);
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
            checkboxTracker.applier.modelChanged.addListener("checkboxState", function () {
                // Below this addListener() block are three calls to change
                // the "checked" state of the test checkbox.
                if (manipulator.numCallsToChangeState === 3) {
                    jqUnit.assertEquals(
                        "State change detection",
                        manipulator.numCallsToChangeState,
                        checkboxTracker.numStateChanges
                    );
                    jqUnit.start();
                    checkboxTracker.stopTracking();
                }
            });
            // Change the state three times, and see if they're detected.  Space
            // the changes by at least the tracker's polling interval.
            var delay = 200;
            manipulator.changeStateWithDelay(delay);
            delay += checkboxTracker.interval;
            manipulator.changeStateWithDelay(delay);
            delay += checkboxTracker.interval;
            manipulator.changeStateWithDelay(delay);
        });

        jqUnit.asyncTest("Test tracking, 100 msec interval", function () {
            jqUnit.expect(1);
            var checkboxTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            var manipulator = fluid.tests.checkboxManipulator();
            var interval = 100;
            checkboxTracker.startTracking(interval);
            checkboxTracker.applier.modelChanged.addListener("checkboxState", function () {
                // Below this listener are three calls to change the "checked"
                // state of the test checkbox.
                if (manipulator.numCallsToChangeState === 3) {
                    jqUnit.assertEquals(
                        "State change detection",
                        manipulator.numCallsToChangeState,
                        checkboxTracker.numStateChanges
                    );
                    jqUnit.start();
                    checkboxTracker.stopTracking();
                }
            });
            // Change the state three times, and see if it's detected.  Space
            // the changes by at least msec.
            var delay = 200;
            manipulator.changeStateWithDelay(delay);
            delay += interval;
            manipulator.changeStateWithDelay(delay);
            delay += interval;
            manipulator.changeStateWithDelay(delay);
        });

        jqUnit.asyncTest("Test tracking limitation, 100 msec interval", function () {
            jqUnit.expect(1);
            var checkboxTracker = fluid.tests.createCheckboxTracker(stateTrackerTests.checkbox);
            var manipulator = fluid.tests.checkboxManipulator();
            var interval = 100;
            checkboxTracker.startTracking(interval);
            checkboxTracker.applier.modelChanged.addListener("checkboxState", function () {
                // Below this addListener() block are three calls to change the
                // "checked" state of the test checkbox.
                if (manipulator.numCallsToChangeState === 3) {
                    jqUnit.assertNotEquals(
                        "State change detection failure",
                        manipulator.numCallsToChangeState,
                        checkboxTracker.numStateChanges
                    );
                    jqUnit.start();
                    checkboxTracker.stopTracking();
                }
            });
            // Change the state three times, and see if it's detected.  The
            // changes are faster than the tracker's polling interval.  This
            // shows a limitation of the technique:  Not all of the changes will
            // be tracked.
            var delay = 25;
            manipulator.changeStateWithDelay(delay);
            delay += delay;
            manipulator.changeStateWithDelay(delay);
            delay += delay;
            manipulator.changeStateWithDelay(delay);
        });
    });
})(jQuery);
