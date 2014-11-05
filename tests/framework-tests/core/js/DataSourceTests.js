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

    jqUnit.test("fluid.toHashKey", function () {
        var singleLevel = {
            a: "A",
            b: "B",
            g: 5,
            c: ["D", "E", "F"]
        };

        var nested = {
            a: "A",
            h: 6,
            f: ["F", "G"],
            b: {
                c: "C",
                d: ["D", "E"]
            }
        };

        var expected = {
            singleLevel: "<object a:|string A|b:|string B|c:<array 0:|string D|1:|string E|2:|string F|>g:|number 5|>",
            nested: "<object a:|string A|b:<object c:|string C|d:<array 0:|string D|1:|string E|>>f:<array 0:|string F|1:|string G|>h:|number 6|>"
        }

        jqUnit.assertEquals("The single level object should be converted properly", expected.singleLevel, fluid.toHashKey(singleLevel));
        jqUnit.assertEquals("The multi-level object should be converted properly", expected.nested, fluid.toHashKey(nested));
    });

    fluid.defaults("fluid.tests.requestQueue", {
        gradeNames: ["fluid.requestQueue", "autoInit"],
        members: {
            // Each record should contain a list of the request ID that was sent to the respective events.
            fireRecord: {
                enqueued: [],
                dropped: [],
                onRequestStart: [],
                afterRequestComplete: []
            }
        },
        listeners: {
            "enqueued": {
                func: "{that}.record",
                args: ["enqueued", "{arguments}.0"]
            },
            "dropped": {
                func: "{that}.record",
                args: ["dropped", "{arguments}.0"]
            },
            "onRequestStart": {
                func: "{that}.record",
                args: ["onRequestStart", "{arguments}.0"]
            },
            "afterRequestComplete": {
                func: "{that}.record",
                args: ["afterRequestComplete", "{arguments}.0"]
            },
        },
        invokers: {
            record: {
                funcName: "fluid.tests.requestQueue.record",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            },
            requestFn: {
                funcName: "fluid.tests.requestQueue.requestFn",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            }
        }
    });

    fluid.tests.requestQueue.record = function (that, recordName, request) {
        var reqID = request.model.ID;
        that.fireRecord[recordName].push(reqID);
    };

    fluid.tests.requestQueue.requestFn = function (that, directModel, model, callback) {
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
            that.enqueue({
                method: that.requestFn,
                directModel: {path: ""},
                model: {ID: currentCycle},
                callback: assertRequest(currentCycle)
            });
        };

        for (var i = 1; i < numRequests; i++) {
            triggerQueue(i);
        }

        // add a final request that occurs after the first should have completed.
        setTimeout(function () {
            triggerQueue(numRequests);
        }, 200);
    };

    fluid.defaults("fluid.tests.requestQueue.concurrencyLimited", {
        gradeNames: ["fluid.requestQueue.concurrencyLimited", "fluid.tests.requestQueue", "autoInit"]
    });

    jqUnit.asyncTest("Request Queue: Concurrency Limited", function () {
        var request

        fluid.tests.requestQueue.concurrencyLimited({
            listeners: {
                "onCreate.verifyDebounceRequestQueue": {
                    listener: "fluid.tests.verifyRequestQueue",
                    args: ["{that}", 4, {
                        enqueued: [1, 2, 3, 4],
                        dropped: [2],
                        onRequestStart: [1, 3, 4],
                        afterRequestComplete: [1, 3, 4]
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
        jqUnit.assert("The " + directModel.path + " request should have been triggerd");
    };

    fluid.tests.queuedDataSource.assertRequestsQueue = function (that, expectedReadQueues, expectedWriteQueues) {
        var actualReadQueues = fluid.keys(that.requests.read).sort();
        var actualWriteQueues = fluid.keys(that.requests.write).sort();

        jqUnit.assertDeepEq("The read queue should be populated correctly", expectedReadQueues.sort(), actualReadQueues);
        jqUnit.assertDeepEq("The write queue should be populated correctly", expectedWriteQueues.sort(), actualWriteQueues);
    };

    jqUnit.test("Queued DataSource", function () {
        jqUnit.expect(5);
        // The expected queues contain a list of the keys for which queues are bound to in the requests object.
        var expectedReadQueues = ["<object path:|string get|>"];
        var expectedWriteQueues = ["<object path:|string set|>", "<object path:|string delete|>"];
        fluid.tests.queuedDataSource({
            listeners: {
                "onCreate": [{
                    listener: "{that}.get",
                    args: [{path: "get"}, fluid.tests.queuedDataSource.assertRequest]
                }, {
                    listener: "{that}.set",
                    args: [{path: "set"}, {key: "value"}, fluid.tests.queuedDataSource.assertRequest]
                }, {
                    listener: "{that}.delete",
                    args: [{path: "delete"}, fluid.tests.queuedDataSource.assertRequest]
                }, {
                    listener: "fluid.tests.queuedDataSource.assertRequestsQueue",
                    args: ["{that}", expectedReadQueues, expectedWriteQueues]
                }]
            }
        });
    });
})();
