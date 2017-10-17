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
     * @param that {Component} An instance of example.checkboxTracker
     * @return {Boolean}
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
     * @param {Component} An instance of example.checkboxTracker.
     */
    example.checkboxTracker.showDetectedThenWipe = function (that) {
        that.statusEl.innerHTML = "Status: STATE CHANGE DETECTED!";
        setTimeout(function () {
            that.statusEl.innerHTML = "Status: ";
        }, 500);
    };

    /**
     * Initialize a tracker instance.
     */
    var theTracker = null;
    example.initialize = function () {
        theTracker = example.checkboxTracker({
            members: {
                checkbox: document.getElementById("testCheckBox"),
                statusEl: document.getElementById("status")
            },
            model: {
                checkboxState: "{that}.checkbox.checked"
            }
        });
        return theTracker;
    };

    /**
     * Programmatically change the state of the checkbox with a one
     * second delay.
     */
    example.delayStateChange = function () {
        setTimeout(function () {
            theTracker.checkbox.checked = !(theTracker.checkbox.checked);
        }, 1000);
    };

})(jQuery, fluid);
