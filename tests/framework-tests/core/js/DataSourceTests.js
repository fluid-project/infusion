/*
Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.requestQueue", {
        gradeNames: ["fluid.requestQueue", "autoInit"],
        members: {
            fireRecord: {
                queued: 0,
                unqueued: 0,
                request: 0,
                isActive: {
                    "true": 0,
                    "false": 0
                }
            }
        },
        listeners: {
            "queued": {
                func: "{that}.record",
                args: ["queued"]
            },
            "unqueued": {
                func: "{that}.record",
                args: ["unqueued"]
            }
        },
        modelListeners: {
            "isActive": {
                funcName: "{that}.record",
                excludeSource: ["init"],
                args: ["isActive", "{change}.value"]
            }
        },
        invokers: {
            record: {
                funcName: "fluid.tests.requestQueue.record",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            },
            request: {
                funcName: "fluid.tests.requestQueue.request",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        }
    });

    fluid.tests.requestQueue.record = function (that, recordName, value) {
        var path = ["fireRecord", recordName];

        if (recordName === "isActive") {
            path.push(value.toString());
        }

        var count = fluid.get(that, path) + 1;
        fluid.set(that, path, count);
    };

    fluid.tests.requestQueue.request = function (that, directModel, callback) {
        that.record("request");
        // use a setTimeout to simulate an asynchronous request
        setTimeout(callback, 100);
    };

    fluid.tests.verifyRequestQueue = function (that, numRequests, expectedRecord, cleanup) {
        cleanup = cleanup || jqUnit.start;
        var previousCallNum = 0;

        var assertRequest = function (callNum) {
            return function () {
                jqUnit.assertTrue("Set call " + callNum + " should be triggered in the correct order", callNum > previousCallNum);
                previousCallNum = callNum;
                if (callNum === numRequests) {
                    jqUnit.assertDeepEq("The event record should have been updated appropriately.", expectedRecord, that.fireRecord);
                    cleanup();
                }
            };
        };

        var triggerQueue = function (currentCycle) {
            that.queue({
                method: that.request,
                directModel: {model: currentCycle},
                callback: assertRequest(currentCycle)
            });
        };

        for (var i = 1; i <= numRequests; i++) {
            triggerQueue(i);
        }
    };

    fluid.defaults("fluid.tests.requestQueue.fifo", {
        gradeNames: ["fluid.requestQueue.fifo", "fluid.tests.requestQueue", "autoInit"]
    });

    jqUnit.asyncTest("Request Queue: FIFO", function () {
        fluid.tests.requestQueue.fifo({
            listeners: {
                "onCreate.verifyFifoRequestQueue": {
                    listener: "fluid.tests.verifyRequestQueue",
                    args: ["{that}", 3, {
                        queued: 3,
                        unqueued: 3,
                        request: 3,
                        isActive: {
                            "true": 3,
                            "false": 3
                        }
                    }]
                }
            }
        });
    });

    fluid.defaults("fluid.tests.requestQueue.debounce", {
        gradeNames: ["fluid.requestQueue.debounce", "fluid.tests.requestQueue", "autoInit"]
    });

    jqUnit.asyncTest("Request Queue: Debounce", function () {
        fluid.tests.requestQueue.debounce({
            listeners: {
                "onCreate.verifyDebounceRequestQueue": {
                    listener: "fluid.tests.verifyRequestQueue",
                    args: ["{that}", 3, {
                        queued: 3,
                        unqueued: 2,
                        request: 2,
                        isActive: {
                            "true": 2,
                            "false": 2
                        }
                    }]
                }
            }
        });
    });

    fluid.defaults("fluid.tests.queuedDataSource", {
        gradeNames: ["fluid.queuedDataSource", "autoInit"],
        components: {
            wrappedDataSource: {
                options: {
                    invokers: {
                        "get": "fluid.tests.queuedDataSource.request",
                        "set": "fluid.tests.queuedDataSource.request",
                        "delete": "fluid.tests.queuedDataSource.request"
                    }
                }
            }
        }
    });

    fluid.tests.queuedDataSource.request = function () {
        var callback = arguments[arguments.length -1];
        var directModel = arguments[0];
        callback(directModel);
    };

    fluid.tests.queuedDataSource.assertRequest = function (directModel) {
        jqUnit.assert("The " + directModel.type + " request should have been triggerd");
    };

    fluid.tests.queuedDataSource.assertResponseQueued = function (queueName, request) {
        jqUnit.assertEquals("The request was added to the correct queue", request.directModel.queue, queueName);
    };

    jqUnit.asyncTest("Queued DataSource", function () {
        jqUnit.expect(6);
        fluid.tests.queuedDataSource({
            listeners: {
                "{writeQueue}.events.queued": {
                    listener: "fluid.tests.queuedDataSource.assertResponseQueued",
                    args: ["writeQueue", "{arguments}.0"]
                },
                "{readQueue}.events.queued": {
                    listener: "fluid.tests.queuedDataSource.assertResponseQueued",
                    args: ["readQueue", "{arguments}.0"]
                },
                "onCreate": [{
                    listener: "{that}.get",
                    args: [{queue: "readQueue", type: "get"}, fluid.tests.queuedDataSource.assertRequest]
                }, {
                    listener: "{that}.set",
                    args: [{queue: "writeQueue", type: "set"}, {key: "value"}, fluid.tests.queuedDataSource.assertRequest]
                }, {
                    listener: "{that}.delete",
                    args: [{queue: "writeQueue", type: "delete"}, fluid.tests.queuedDataSource.assertRequest]
                }, {
                    listener: "jqUnit.start"
                }]
            }
        });
    });
})();
