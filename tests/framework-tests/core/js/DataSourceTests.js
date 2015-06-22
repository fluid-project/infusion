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
        };

        jqUnit.assertEquals("The single level object should be converted properly", expected.singleLevel, fluid.toHashKey(singleLevel));
        jqUnit.assertEquals("The multi-level object should be converted properly", expected.nested, fluid.toHashKey(nested));
    });

    fluid.defaults("fluid.tests.dataSource", {
        gradeNames: ["fluid.dataSource", "autoInit"],
        invokers: {
            "get": {
                funcName: "fluid.tests.dataSource.request",
                args: ["get", "{arguments}.0", "{arguments}.1"]
            },
            "set": {
                funcName: "fluid.tests.dataSource.request",
                args: ["set", "{arguments}.0", "{arguments}.2", "{arguments}.1"]
            },
            "delete": {
                funcName: "fluid.tests.dataSource.request",
                args: ["delete", "{arguments}.0", "{arguments}.1"]
            }
        }
    });

    fluid.tests.dataSource.request = function (type, directModel, options, model) {
        var promise = fluid.promise();
        var ID = fluid.get(model, "ID") || options.ID;
        setTimeout(function () {
            promise.resolve({
                requestType: type,
                ID: ID
            });
        }, options.duration);
        return promise;
    };

    fluid.defaults("fluid.tests.debouncedDataSource", {
        gradeNames: ["fluid.debouncedDataSource", "autoInit"],
        members: {
            // Each record should contain a list of the directModels from the requests
            // that were sent to the respective events.
            fireRecord: {
                "get": [],
                "set": [],
                "delete": []
            }
        },
        components: {
            wrappedDataSource: {
                type: "fluid.tests.dataSource"
            }
        }
    });

    fluid.tests.invokeRequestWithDelay = function (that, type, delays, duration, directModel) {
        var count = 0;
        fluid.each(delays, function (delay) {
            setTimeout(function () {
                var response;
                if (type === "set") {
                    response = that[type](directModel, {ID: ++count}, {duration: duration});
                } else {
                    response = that[type](directModel, {
                        duration: duration,
                        ID: ++count
                    });
                }
                response.then(function (val) {
                    that.fireRecord[val.requestType].push(val.ID);
                });
            }, delay);
        });
    };

    // s = short delay
    // l = long delay
    fluid.tests.debouncedDataSource.requestRuns = {
        ss: [0, 50, 55],
        sl: [0, 50, 200],
        ls: [0, 150, 200],
        ll: [0, 150, 300],
        sss: [0, 50, 55, 75],
        lss: [0, 150, 200, 220],
        ssl: [0, 50, 75, 200],
        ssss: [0, 50, 55, 75, 80],
        lsss: [0, 150, 200, 220, 250],
        sssl: [0, 50, 60, 75, 200]
    };

    fluid.tests.debouncedDataSource.expected100ms = {
        ss: [1, 3],
        sl: [1, 2, 3],
        ls: [1, 2, 3],
        ll: [1, 2, 3],
        sss: [1, 4],
        lss: [1, 2, 4],
        ssl: [1, 3, 4],
        ssss: [1, 5],
        lsss: [1, 2, 5],
        sssl: [1, 4, 5]
    };

    fluid.tests.debouncedDataSource.testRequests = [{
        requestType: "get",
        source: fluid.tests.debouncedDataSource.expected100ms
    }, {
        requestType: "set",
        source: fluid.tests.debouncedDataSource.expected100ms
    }, {
        requestType: "delete",
        source: fluid.tests.debouncedDataSource.expected100ms
    }];

    fluid.tests.debouncedDataSource.assertRequest = function (requestType, setName, delays, expected, delayBuffer) {
        // Time in milliseconds to add to the assertion delay, to buffer against setTimeout impressions.
        // Because multiple instances run simultaneously this number may need to be increased to take into
        // account extra delays related to the thread blocking.
        delayBuffer = delayBuffer || 300;
        var promise = fluid.promise();
        var that = fluid.tests.debouncedDataSource();
        var assertionDelay = delays[delays.length - 1] + delayBuffer; // time to wait to assert the requests.

        fluid.tests.invokeRequestWithDelay(that, requestType, delays, 100, {path: "value"});

        setTimeout(function () {
            jqUnit.assertDeepEq("The " + requestType  + " requests from set '" + setName +  "' should have been queued correctly.", expected, that.fireRecord[requestType]);
            promise.resolve(that);
        }, assertionDelay);
        return promise;
    };

    // Note: Due to the timeouts used to simulate actual asynchronous operations, this test
    // will take a while to execute.
    jqUnit.asyncTest("Debounce DataSource", function () {
        var sources = [];
        fluid.each(fluid.tests.debouncedDataSource.testRequests, function (testRequest) {
            fluid.each(fluid.tests.debouncedDataSource.requestRuns, function (delays, setName) {
                sources.push(function () {
                    return fluid.tests.debouncedDataSource.assertRequest(testRequest.requestType, setName, delays, testRequest.source[setName]);
                });
            });
        });
        var testSequence = fluid.promise.sequence(sources);
        testSequence.then(jqUnit.start);
    });
})();
