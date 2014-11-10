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
            singleLevel: "<object a:|\"A\"|b:|\"B\"|c:<array 0:|\"D\"|1:|\"E\"|2:|\"F\"|>g:|5|>",
            nested: "<object a:|\"A\"|b:<object c:|\"C\"|d:<array 0:|\"D\"|1:|\"E\"|>>f:<array 0:|\"F\"|1:|\"G\"|>h:|6|>"
        }

        jqUnit.assertEquals("The single level object should be converted properly", expected.singleLevel, fluid.toHashKey(singleLevel));
        jqUnit.assertEquals("The multi-level object should be converted properly", expected.nested, fluid.toHashKey(nested));
    });

    fluid.defaults("fluid.tests.queuedDataSource", {
        gradeNames: ["fluid.queuedDataSource", "autoInit"],
        members: {
            // Each record should contain a list of the directModels from the requests
            // that were sent to the respective events.
            fireRecord: {
                enqueued: [],
                dropped: [],
                onRequestStart: [],
                afterRequestComplete: []
            }
        },
        listeners: {
            "enqueued.test": {
                listener: "fluid.tests.queuedDataSource.record",
                args: ["{that}.fireRecord.enqueued", "{arguments}.0"]
            },
            "dropped.test": {
                listener: "fluid.tests.queuedDataSource.record",
                args: ["{that}.fireRecord.dropped", "{arguments}.0"]
            },
            "onRequestStart.test": {
                listener: "fluid.tests.queuedDataSource.record",
                args: ["{that}.fireRecord.onRequestStart", "{arguments}.0"]
            },
            "afterRequestComplete.test": {
                listener: "fluid.tests.queuedDataSource.record",
                args: ["{that}.fireRecord.afterRequestComplete", "{arguments}.0"]
            }
        },
        components: {
            wrappedDataSource: {
                options: {
                    invokers: {
                        "get": "fluid.tests.queuedDataSource.requestFn",
                        "set": "fluid.tests.queuedDataSource.requestSetFn",
                        "delete": "fluid.tests.queuedDataSource.requestFn"
                    }
                }
            }
        }
    });

    fluid.tests.queuedDataSource.record = function (record, request) {
        record.push(request.options.ID);
    };

    fluid.tests.queuedDataSource.requestImpl = function (request, duration) {
        var promise = fluid.promise();
        setTimeout(function () {
            promise.resolve(request);
        }, duration);
        return promise;
    };

    fluid.tests.queuedDataSource.requestFn = function (directModel, options) {
        var request = {
            directModel: directModel,
            options: options
        };
        return fluid.tests.queuedDataSource.requestImpl(request, options.duration);
    };

    fluid.tests.queuedDataSource.requestSetFn = function (directModel, model, options) {
        var request = {
            directModel: directModel,
            model: model,
            options: options
        };
        return fluid.tests.queuedDataSource.requestImpl(request, options.duration);
    };

    fluid.tests.invokeWithDelay = function (requests) {
        requests = fluid.makeArray(requests);

        fluid.each(requests, function (request) {
            setTimeout(function () {
                request.method.apply(null, request.args || []);
            }, request.delay || 0);
        });
    };

    jqUnit.asyncTest("Queued DataSource - get", function () {
        var that = fluid.tests.queuedDataSource();
        var expectedRecord = {
            "enqueued": ["get1", "get2", "get3"],
            "dropped": ["get2"],
            "onRequestStart": ["get1", "get3"],
            "afterRequestComplete": ["get1", "get3"]
        };

        var requests = [{
            method: that.get,
            delay: 0,
            args: [{"path": "get"}, {"ID": "get1", "duration": 100}]
        }, {
            method: that.get,
            delay: 20,
            args: [{"path": "get"}, {"ID": "get2", "duration": 100}]
        }, {
            method: that.get,
            delay: 50,
            args: [{"path": "get"}, {"ID": "get3", "duration": 100}]
        }];

        fluid.tests.invokeWithDelay(requests);

        setTimeout(function () {
            jqUnit.assertDeepEq("The requests should have been processed through the read queue correctly.", expectedRecord, that.fireRecord);
            jqUnit.start();
        }, 300);
    });

    jqUnit.asyncTest("Queued DataSource - set", function () {
        var that = fluid.tests.queuedDataSource();
        var expectedRecord = {
            "enqueued": ["set1", "set2", "set3", "set4"],
            "dropped": ["set2", "set3"],
            "onRequestStart": ["set1", "set4"],
            "afterRequestComplete": ["set1", "set4"]
        };

        var requests = [{
            method: that.set,
            delay: 0,
            args: [{"path": "set"}, {"key": "value1"}, {"ID": "set1", "duration": 50}]
        }, {
            method: that.set,
            delay: 0,
            args: [{"path": "set"}, {"key": "value2"}, {"ID": "set2", "duration": 50}]
        }, {
            method: that.set,
            delay: 0,
            args: [{"path": "set"}, {"key": "value2"}, {"ID": "set3", "duration": 50}]
        }, {
            method: that.set,
            delay: 25,
            args: [{"path": "set"}, {"key": "value3"}, {"ID": "set4", "duration": 50}]
        }];

        fluid.tests.invokeWithDelay(requests);

        setTimeout(function () {
            jqUnit.assertDeepEq("The requests should have been processed through the write queue correctly.", expectedRecord, that.fireRecord);
            jqUnit.start();
        }, 200);
    });

    jqUnit.asyncTest("Queued DataSource - delete", function () {
        var that = fluid.tests.queuedDataSource();
        var expectedRecord = {
            "enqueued": ["delete1", "delete2", "delete3", "delete4"],
            "dropped": ["delete3"],
            "onRequestStart": ["delete1", "delete2", "delete4"],
            "afterRequestComplete": ["delete1", "delete2", "delete4"]
        };

        var requests = [{
            method: that.delete,
            delay: 0,
            args: [{"path": "delete"}, {"ID": "delete1", "duration": 50}]
        }, {
            method: that.delete,
            delay: 60,
            args: [{"path": "delete"}, {"ID": "delete2", "duration": 50}]
        }, {
            method: that.delete,
            delay: 75,
            duration: 20,
            args: [{"path": "delete"}, {"ID": "delete3", "duration": 50}]
        }, {
            method: that.delete,
            delay: 90,
            args: [{"path": "delete"}, {"ID": "delete4", "duration": 50}]
        }];

        fluid.tests.invokeWithDelay(requests);

        setTimeout(function () {
            jqUnit.assertDeepEq("The requests should have been processed through the write queue correctly.", expectedRecord, that.fireRecord);
            jqUnit.start();
        }, 200);
    });

    jqUnit.asyncTest("Queued DataSource - combined", function () {
        var that = fluid.tests.queuedDataSource();
        var expectedRecord = {
            "enqueued": ["get1", "set1", "delete1", "set2"],
            "dropped": ["delete1"],
            "onRequestStart": ["get1", "set1", "set2"],
            "afterRequestComplete": ["get1", "set1", "set2"]
        };

        var requests = [{
            method: that.get,
            delay: 0,
            duration: 10,
            args: [{"path": "combined"}, {"ID": "get1", "duration": 50}]
        }, {
            method: that.set,
            delay: 0,
            duration: 10,
            args: [{"path": "combined"}, {"key": "value1"}, {"ID": "set1", "duration": 100}]
        }, {
            method: that.delete,
            delay: 50,
            args: [{"path": "combined"}, {"ID": "delete1", "duration": 50}]
        }, {
            method: that.set,
            delay: 60,
            duration: 10,
            args: [{"path": "combined"}, {"key": "value2"}, {"ID": "set2", "duration": 100}]
        }];

        fluid.tests.invokeWithDelay(requests);

        setTimeout(function () {
            jqUnit.assertDeepEq("The requests should have been processed through the write queue correctly.", expectedRecord, that.fireRecord);
            jqUnit.start();
        }, 300);
    });
})();
