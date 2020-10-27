/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    fluid.defaults("demo.timer", {
        gradeNames: ["fluid.modelComponent"],
        events: {
            afterFinish: null
        },
        model: {
            percent: 0,
            // The number of recursive steps to use for the simulated progress
            // note: because of some randomness inserted into the simulation
            // for realism, the number of steps will actually be much less
            steps: 200
        },
        invokers: {
            start: {
                funcName: "demo.timer.simulateTime",
                args: ["{that}", "{that}.events.onStep.fire", "{that}.events.afterFinish.fire"]
            }
        }
    });

    demo.timer.invokeAfterRandomDelay = function (fn) {
        var delay = Math.floor(Math.random() * 1000 + 100);
        setTimeout(fn, delay);
    };

    demo.timer.getSmallRandomNumber = function () {
        return Math.floor(Math.random() * 10);
    };

    /**
     * Used to simulate an application that would call Progress.
     * @param {Object} that - the component to source the model and applier from
     * @param {Function} stepFunction - the function to update the progress component
     * @param {Function} finishFunction - the function to enable the submit button, hide the progress simulation and update the text
     */
    demo.timer.simulateTime = function (that, stepFunction, finishFunction) {
        var steps = that.model.steps;
        var percent = that.model.percent;
        var increment = (steps) ? (100 / steps) : 10;

        if (percent < 100) {
            // bump up the current percentage
            percent = Math.round(Math.min(percent + increment + demo.timer.getSmallRandomNumber(), 100));
            that.applier.change("percent", percent);

            // after a random delay, do it all over again
            demo.timer.invokeAfterRandomDelay(function () {
                demo.timer.simulateTime(that, stepFunction, finishFunction);
            });
        } else {
            finishFunction();
        }
    };

    fluid.defaults("demo.shoppingDemo", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            submitButton: ".progress-demo-submit button",
            statusText: ".demoSelector-progress-status-text",
            restartDemo: ".demoSelector-progress-restart",
            liveRegion: ".demoSelector-liveRegion",
            progress: ".demoSelector-progress-theComponent"
        },
        strings: {
            confirmStatus: "Confirm and submit your order.",
            orderSubmitted: "Order Submitted. Demo finished.",
            percentCompleted: "%percentComplete% Complete",
            progressTitle: "Checking inventory, please wait."
        },
        events: {
            afterOrderSubmitted: null,
            onSubmit: null
        },
        listeners: {
            "onCreate.setInitialStatus": {
                "this": "{that}.dom.statusText",
                method: "text",
                args: ["{that}.options.strings.confirmStatus"]
            },
            "onCreate.setLiveRegionAria": {
                "this": "{that}.dom.liveRegion",
                method: "attr",
                args: [{
                    "aria-relevant": "additions text",
                    "aria-atomic": "false",
                    "role": "status"
                }]
            },
            "onCreate.setAriaControls": {
                "this": "{that}.dom.submitButton",
                method: "attr",
                args: ["aria-controls", "{that}.containerID"]
            },
            "onCreate.bindSubmitEvents": {
                "this": "{that}.dom.submitButton",
                "method": "on",
                args: ["click", "{that}.events.onSubmit.fire"]
            },
            "onSubmit.verifyInventory": {
                funcName: "demo.shoppingDemo.verifyInventory",
                args: ["{that}"]
            },
            "afterOrderSubmitted.confirm": {
                funcName: "demo.shoppingDemo.confirmOrder",
                args: ["{that}.dom.statusText", "{that}.options.strings.orderSubmitted", "{that}.dom.restartDemo"]
            }
        },
        members: {
            containerID: {
                expander: {
                    funcName: "fluid.allocateSimpleId",
                    args: ["{that}.container"]
                }
            }
        },
        animationSpeed: 1000, // speed in milliseconds
        components: {
            progress: {
                type: "fluid.progress",
                container: "{that}.dom.progress",
                options: {
                    speed: "{demo.shoppingDemo}.options.animationSpeed",
                    listeners: {
                        "afterProgressHidden.myProgressHide": "{shoppingDemo}.events.afterOrderSubmitted"
                    }
                }
            },
            timer: {
                type: "demo.timer",
                options: {
                    listeners: {
                        "afterFinish.hideProgress": {
                            func: "{progress}.hide",
                            args: ["{demo.shoppingDemo}.options.animationSpeed"]
                        }
                    },
                    modelListeners: {
                        "percent": {
                            func: "{progress}.update",
                            args: ["{change}.value", "{shoppingDemo}.options.strings.percentCompleted"],
                            excludeSource: "init"
                        }
                    }
                }
            }
        }
    });

    demo.shoppingDemo.verifyInventory = function (that) {
        var submitButton = that.locate("submitButton");
        that.timer.start();
        submitButton.blur();

        // disable the button
        submitButton.prop("disabled", true);

        // add area role to the progress title
        that.locate("statusText").text(that.options.strings.progressTitle).show();
    };

    demo.shoppingDemo.confirmOrder = function (statusElm, confirmation, restartDemo) {
        statusElm.text(confirmation);
        statusElm.show();
        restartDemo.show();
    };

})(jQuery, fluid);
