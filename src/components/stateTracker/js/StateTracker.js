/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0_0 = fluid_2_0_0 || {};
(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.stateTracker");

    fluid.defaults("fluid.stateTracker", {
        gradeNames: ["fluid.component"],
        events: {
            onStateChange: null
        },
        members: {
            // default polling frequency in msec.
            interval: 10
        },
        invokers: {
            startTracking: {
                funcName: "fluid.stateTracker.startTracking",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                                 // changeListener, polling interval
            },
            stopTracking: {
                funcName: "fluid.stateTracker.stopTracking",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
                                 // changeListener, intervalID
            },
            monitorChange: {
                funcName: "fluid.stateTracker.monitorChange",
                args: ["{that}", "{arguments}.0"]
                                 // monitor info structure
            },
            initMonitorInfo: {
                funcName: "fluid.stateTracker.initMonitorInfo",
                args: ["{that}"]
            },
            evaluateChange: {
                funcName: "fluid.notImplemented"
            }
        }
    });

    /**
     * Initiate polling.
     * @psrsm that {Component} An instance of fluid.stateTracker
     * @param changeListener {Function} a listener to handle the onStateChange event.
     * @param interval {Number} optional delay between calls to check the state's current value (msec).
     * @return {Number}the intervalID.
     */
    fluid.stateTracker.startTracking = function (that, changeListener, interval) {
        var monitor = that.initMonitorInfo();
        that.events.onStateChange.addListener(changeListener);
        if (interval) {
            that.interval = interval;
        }
        monitor.intervalID = setInterval(function () {
            that.monitorChange(monitor);
        }, that.interval);
        return monitor.intervalID;
    };

    /**
     * Stop polling.
     * @psrsm that {Component} An instance of fluid.stateTracker
     * @param changeListener {Function} the listener to remove.
     * @param intervalID {Object} the interval to clear.
     */
    fluid.stateTracker.stopTracking = function (that, changeListener, intervalID) {
        that.events.onStateChange.removeListener(changeListener);
        clearInterval(intervalID);
    };

    /**
     * Callback to pass to setInterval() to periodically check a state.
     * @psrsm that {Component} An instance of fluid.stateTracker
     * @psrsm monitor {Object} Contains the changeEvaluator object and the intervalID.
     */
    fluid.stateTracker.monitorChange = function (that, monitor) {
        if (monitor.changeEvaluator.evaluateChange()) {
            that.events.onStateChange.fire(monitor.changeEvaluator);
        }
    };

    /**
     * Create and initialize a monitor object for passing to that.monitorChange() that periodically checks for chanages in state.
     * @psrsm that {Component} An instance of fluid.stateTracker
     * @return {Object} the monitor object.
     */
    fluid.stateTracker.initMonitorInfo = function (that) {
        var monitor = {};
        monitor.intervalID = -1;
        monitor.changeEvaluator = that;
        return monitor;
    };

})(jQuery, fluid_2_0_0);
