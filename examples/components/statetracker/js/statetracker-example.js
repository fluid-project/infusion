/*
Copyright 2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var example = example || {};

(function ($, fluid) {
    "use strict";

    fluid.defaults("example.checkboxTracker", {
        gradeNames: ["fluid.stateTracker"],
        members: {
            checkbox: null,
            statusEl: null
        },
        model: {
            checkboxState: undefined
        },
        modelListeners: {
            checkboxState: {
                funcName: "example.checkboxTracker.showDetectedThenWipe",
                excludeSource: "init",
                args: ["{that}"]
            }
        },
        invokers: {
            evaluateChange: {
                funcName: "example.checkboxTracker.evaluateChange",
                args: ["{that}"]
            }
        }
    });

    /**
     * Evaluate whether the state being tracked has changed; here, whether
     * the test checkbox has switched from "checked" to "unchecked" or vice
     * versa.
     * @param {Component} that - An instance of example.checkboxTracker
     * @return {Boolean} - whether the checked state changed.
     */
    example.checkboxTracker.evaluateChange = function (that) {
        if (that.model.checkboxState !== that.checkbox.checked) {
            that.applier.change("checkboxState", that.checkbox.checked);
            return true;
        } else {
            return false;
        }
    };

    /**
     * Update the status line, but then wipe the status after 500 msec.
     * @param {Component} that - An instance of example.checkboxTracker.
     */
    example.checkboxTracker.showDetectedThenWipe = function (that) {
        that.statusEl.innerHTML = "Checkbox status: STATE CHANGE DETECTED!";
        setTimeout(function () {
            that.statusEl.innerHTML = "Checkbox status: ";
        }, 500);
    };

    /**
     * Initialize a tracker instance.
     */
    var theTracker = null;
    var theCheckbox = null;
    example.start = function () {
        // Reset any existing tracking.
        if (theTracker !== null) {
            theTracker.destroy();
            theTracker = null;
        }
        theCheckbox = document.getElementById("testCheckBox");
        theTracker = example.checkboxTracker({
            members: {
                checkbox: theCheckbox,
                statusEl: document.getElementById("status")
            },
            model: {
                checkboxState: "{that}.checkbox.checked"
            }
        });
        theTracker.startTracking();
    };

    /**
     * Reset the example and remove the tracker instance.
     */
    example.stop = function () {
        theTracker.destroy();
        theTracker = null;
    };

    /**
     * Programmatically change the state of the checkbox with a one
     * second delay.
     */
    example.delayStateChange = function () {
        if (theCheckbox !== null) {
            setTimeout(function () {
                theCheckbox.checked = !(theCheckbox.checked);
            }, 1000);
        }
    };

})(jQuery, fluid);
