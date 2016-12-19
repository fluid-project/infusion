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
            interval: 10          // msec, polling frequency (default)
        },
        invokers: {
            startTracking: {
                funcName: "fluid.stateTracker.startTracking",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                                 // changeEvaluator, changeListener, polling interval
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
                args: ["{arguments}.0"]
                       // changeEvaluator object or function
            }
        }
    });

    // Initiate polling.
    // @param changeEvaluator - an object used to evaluate if the state
    //                          has changed.  It must have an evaluateChange()
    //                          function.
    // @param changeListener  - a listener to handle the onStateChange event.
    // @param interval        - optional delay between calls to check the state's
    //                          current value (msec).
    // @return                - the intervalID.
    fluid.stateTracker.startTracking = function (that, changeEvaluator, changeListener, interval) {
        // TODO?:  provide checks that <changeEvaluator> and <changeListener>
        // are not undefined?
        var monitor = that.initMonitorInfo(changeEvaluator);
        that.events.onStateChange.addListener(changeListener);
        if (!!interval) {
            that.interval = interval;
        }
        monitor.intervalID = setInterval(function () {
            // or that.monitorChange()?
            fluid.stateTracker.monitorChange(that, monitor);
        }, that.interval);
        return monitor.intervalID;
    };

    // Stop polling.
    // @param changeListener - the listener to remove.
    // @param intervalID     - the interval to clear.
    fluid.stateTracker.stopTracking = function (that, listener, intervalID) {
        that.events.onStateChange.removeListener(listener);
        clearInterval(intervalID);
    };

    // Callback to pass to setInterval() to periodically check a state.
    fluid.stateTracker.monitorChange = function (that, monitor) {
        if (monitor.changeEvaluator.evaluateChange()) {
            that.events.onStateChange.fire(monitor.changeEvaluator);
        }
    };

    // Initialize a monitor object for passing to a function that periodically
    // checks for chanages in the state of a process.
    // @param changeEvaluator - an object to evaluate if the state has changed
    //                          that has a function named evaluateChange().
    //                          Provided by client.
    // @return                - the monitor object.
    fluid.stateTracker.initMonitorInfo = function (changeEvaluator) {
        var monitor = {};
        monitor.intervalID = -1;
        monitor.changeEvaluator = changeEvaluator;
        return monitor;
    };

})(jQuery, fluid_2_0_0);
