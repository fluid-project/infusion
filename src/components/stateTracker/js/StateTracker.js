/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};
(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.stateTracker");

    fluid.defaults("fluid.stateTracker", {
        gradeNames: ["fluid.modelComponent"],
        members: {
            // default polling frequency in msec.
            interval: 10,
            // reference to timer returned by setInterval()
            intervalID: -1
        },
        invokers: {
            startTracking: {
                funcName: "fluid.stateTracker.startTracking",
                args: ["{that}", "{arguments}.0"]
                                 // polling interval
            },
            stopTracking: {
                funcName: "fluid.stateTracker.stopTracking",
                args: ["{that}"]
            },
            evaluateChange: {
                funcName: "fluid.notImplemented"
            }
        },
        listeners: {
            onDestroy: {
                funcName: "fluid.stateTracker.stopTracking",
                args: ["{that}"]
            }
        }
    });

    /**
     * Initiate polling.  If already polling -- there was a previous call to
     * startTracking() -- this is a no-op.
     * @param {Component} that - An instance of fluid.stateTracker
     * @param {Number} interval - optional delay between calls to check the state's current value (msec).
     */
    fluid.stateTracker.startTracking = function (that, interval) {
        if (that.intervalID === -1) {
            if (interval) {
                that.interval = interval;
            }
            that.intervalID = setInterval(function () {that.evaluateChange();}, that.interval);
        }
    };

    /**
     * Stop polling.
     * @param {Component} that - An instance of fluid.stateTracker
     */
    fluid.stateTracker.stopTracking = function (that) {
        clearInterval(that.intervalID);
        that.intervalID = -1;
    };

})(jQuery, fluid_3_0_0);
