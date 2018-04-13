/*
Copyright 2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.remoteModelComponent", {
        gradeNames: ["fluid.remoteModelComponent"],
        members: {
            fetchedData: {},
            resolveFetch: true,
            resolveWrite: true
        },
        model: {
            settings: {
                pref1: true,
                pref2: false
            },
            local: "{that}.model.settings"
        },
        invokers: {
            fetchImpl: {
                funcName: "fluid.tests.remoteModelComponent.reqImpl",
                args: [100, "{that}.resolveFetch", "{that}.fetchedData"]
            },
            writeImpl: {
                funcName: "fluid.tests.remoteModelComponent.reqImpl",
                args: [100, "{that}.resolveWrite", "{arguments}.0"]
            }
        }
    });

    fluid.tests.remoteModelComponent.expectedModel = {
        emptyRemote: {
            settings: {
                pref1: true,
                pref2: false
            },
            local: {
                pref1: true,
                pref2: false
            },
            remote: {},
            requestInFlight: false
        },

        emptyRemoteWithRequestInFlight: {
            settings: {
                pref1: true,
                pref2: false
            },
            local: {
                pref1: true,
                pref2: false
            },
            remote: {},
            requestInFlight: true
        },

        threePrefs: {
            settings: {
                pref1: true,
                pref2: false,
                pref3: "value"
            },
            local: {
                pref1: true,
                pref2: false,
                pref3: "value"
            },
            remote: {
                pref3: "value"
            },
            requestInFlight: false
        },

        differentRemote: {
            settings: {
                pref1: true,
                pref2: false
            },
            local: {
                pref1: true,
                pref2: false
            },
            remote: {
                pref1: false
            },
            requestInFlight: false
        }
    };

    fluid.tests.remoteModelComponent.fetchedData = {
        pref1False: {
            pref1: false
        },
        pref3Value: {
            pref3: "value"
        },
        empty: {}
    };

    fluid.tests.remoteModelComponent.reqImpl = function (delay, resolve, returnData) {
        var promise = fluid.promise();
        setTimeout(function () {
            if (resolve) {
                promise.resolve(returnData);
            } else {
                promise.reject({message: "request error"});
            }
        }, delay);
        return promise;
    };

    fluid.defaults("fluid.tests.remoteModelComponent.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Remote Model tests",
            tests: [{
                expect: 34,
                name: "Fetch",
                sequence: [{
                    event: "{fluid.tests.remoteModelComponentTests remoteModelComponent}.events.onCreate",
                    listener: "jqUnit.assertDeepEq",
                    args: ["The initialized model is correct.", fluid.tests.remoteModelComponent.expectedModel.emptyRemote, "{remoteModelComponent}.model"]
                }, {
                    // fetch an empty data set
                    task: "fluid.tests.remoteModelComponent.tester.triggerFetch",
                    args: ["{remoteModelComponent}", "empty fetch", fluid.tests.remoteModelComponent.fetchedData.empty],
                    resolve: "fluid.tests.remoteModelComponent.tester.assertFetch",
                    resolveArgs: ["{remoteModelComponent}", "empty fetch", "{arguments}.0", fluid.tests.remoteModelComponent.expectedModel.emptyRemote]
                }, {
                    // fetch the pref3Value data set
                    task: "fluid.tests.remoteModelComponent.tester.triggerFetch",
                    args: ["{remoteModelComponent}", "pref3Value", fluid.tests.remoteModelComponent.fetchedData.pref3Value],
                    resolve: "fluid.tests.remoteModelComponent.tester.assertFetch",
                    resolveArgs: ["{remoteModelComponent}", "pref3Value", "{arguments}.0", fluid.tests.remoteModelComponent.expectedModel.threePrefs]
                }, {
                    // fetch the empty data set - should remove previous fetch addition
                    task: "fluid.tests.remoteModelComponent.tester.triggerFetch",
                    args: ["{remoteModelComponent}", "Remove Previous Additions", fluid.tests.remoteModelComponent.fetchedData.empty],
                    resolve: "fluid.tests.remoteModelComponent.tester.assertFetch",
                    resolveArgs: ["{remoteModelComponent}", "Remove Previous Additions", "{arguments}.0", fluid.tests.remoteModelComponent.expectedModel.emptyRemote]
                }, {
                    // fetch the pref1False data set. values in the local model take priority over changes from the remote model
                    task: "fluid.tests.remoteModelComponent.tester.triggerFetch",
                    args: ["{remoteModelComponent}", "pref1False", fluid.tests.remoteModelComponent.fetchedData.pref1False],
                    resolve: "fluid.tests.remoteModelComponent.tester.assertFetch",
                    resolveArgs: ["{remoteModelComponent}", "pref1False", "{arguments}.0", fluid.tests.remoteModelComponent.expectedModel.differentRemote]
                }, {
                    // multiple fetches
                    funcName: "fluid.set",
                    args: ["{remoteModelComponent}", ["fetchedData"], fluid.tests.remoteModelComponent.fetchedData.empty]
                }, {
                    task: "fluid.tests.remoteModelComponent.tester.testMultipleFetches",
                    args: ["{remoteModelComponent}"],
                    resolve: "fluid.tests.remoteModelComponent.tester.assertFetch",
                    resolveArgs: ["{remoteModelComponent}", "multiple fetches", "{arguments}.0", fluid.tests.remoteModelComponent.expectedModel.emptyRemote]
                }]
            }, {
                expect: 19,
                name: "Write",
                sequence: [{
                    funcName: "jqUnit.assertDeepEq",
                    args: ["The initialized model is correct.", fluid.tests.remoteModelComponent.expectedModel.emptyRemote, "{remoteModelComponent}.model"]
                }, {
                    task: "fluid.tests.remoteModelComponent.tester.triggerWrite",
                    args: ["{remoteModelComponent}", "single write"],
                    resolve: "fluid.tests.remoteModelComponent.tester.assertWrite",
                    resolveArgs: ["{remoteModelComponent}", "single write", "{arguments}.0", false]
                }, {
                    task: "fluid.tests.remoteModelComponent.tester.testMultipleWrites",
                    args: ["{remoteModelComponent}"],
                    resolve: "fluid.tests.remoteModelComponent.tester.assertWrite",
                    resolveArgs: ["{remoteModelComponent}", "multiple writes", "{arguments}.0", false]
                }]
            }, {
                expect: 33,
                name: "Fetch and Write",
                sequence: [{
                    funcName: "jqUnit.assertDeepEq",
                    args: ["The initialized model is correct.", fluid.tests.remoteModelComponent.expectedModel.emptyRemote, "{remoteModelComponent}.model"]
                }, {
                    task: "fluid.tests.remoteModelComponent.tester.testWriteThenFetch",
                    args: ["{remoteModelComponent}"],
                    resolve: "fluid.tests.remoteModelComponent.tester.assertFetch",
                    resolveArgs: ["{remoteModelComponent}", "fetch after write", "{arguments}.0", fluid.tests.remoteModelComponent.expectedModel.emptyRemote]
                }, {
                    task: "fluid.tests.remoteModelComponent.tester.testFetchThenWrite",
                    args: ["{remoteModelComponent}", fluid.tests.remoteModelComponent.expectedModel.emptyRemoteWithRequestInFlight],
                    resolve: "fluid.tests.remoteModelComponent.tester.assertWrite",
                    resolveArgs: ["{remoteModelComponent}", "write after fetch", "{arguments}.0", false]
                }]
            }]
        }]
    });

    fluid.tests.remoteModelComponent.tester.addEvents = function (that, testName, events, namespace, priority) {
        events = fluid.makeArray(events);
        priority = priority || "last:testing";
        fluid.each(events, function (eventName) {
            that.events[eventName].addListener(function () {
                jqUnit.assert(testName + ": The " + eventName + " event should have fired.");
            }, namespace, priority);
        });
    };

    fluid.tests.remoteModelComponent.tester.removeEvents = function (that, events, namespace) {
        events = fluid.makeArray(events);
        fluid.each(events, function (eventName) {
            that.events[eventName].removeListener(namespace);
        });
    };

    fluid.tests.remoteModelComponent.tester.assertFetch = function (that, testName, fetchedData, expectedModel) {
        jqUnit.assertDeepEq(testName + ": The fetched data should be returned", expectedModel.remote, fetchedData);
        jqUnit.assertDeepEq(testName + ": The model values should be updated correctly", expectedModel, that.model);
        jqUnit.assertNull(testName + ": There shouldn't be any pending fetch requests", that.pendingRequests.fetch);
    };

    fluid.tests.remoteModelComponent.tester.triggerFetch = function (that, testName, fetchedData) {
        var promise = fluid.promise();

        that.fetchedData = fetchedData;
        fluid.tests.remoteModelComponent.tester.addEvents(that, testName, ["onFetch", "afterFetch"], "testFetch");

        var fetch = that.fetch();
        fetch.then(function () {
            fluid.tests.remoteModelComponent.tester.removeEvents(that, ["onFetch", "afterFetch"], "testFetch");
        });
        fluid.promise.follow(fetch, promise);

        return promise;
    };

    fluid.tests.remoteModelComponent.tester.testMultipleFetches = function (that) {
        var promise = fluid.promise();
        fluid.tests.remoteModelComponent.tester.addEvents(that, "multiple fetches", ["onFetch", "afterFetch"], "testFetch");

        // first fetch
        var firstFetch  = that.fetch();
        jqUnit.assertTrue("multiple fetches - fetch #1: There should be a request in flight", that.model.requestInFlight);
        jqUnit.assertValue("multiple fetches - fetch #1: There should be a pending fetch request", that.pendingRequests.fetch);
        jqUnit.assertEquals("multiple fetches - fetch #1: The pending fetch request promise should match the promise of the first fetch request", that.pendingRequests.fetch, firstFetch);
        firstFetch.then(function () {
            jqUnit.assert("multiple fetches - fetch #1: The first fetch should have resolved");
        });

        //second fetch
        var secondFetch = that.fetch();
        jqUnit.assertTrue("multiple fetches - fetch #2: There should be a request in flight", that.model.requestInFlight);
        jqUnit.assertValue("multiple fetches - fetch #2: There should be a pending fetch request", that.pendingRequests.fetch);
        jqUnit.assertEquals("multiple fetches - fetch #2: The pending fetch request promise should match the promise of the second fetch request", that.pendingRequests.fetch, firstFetch);
        secondFetch.then(function () {
            jqUnit.assert("multiple fetches - fetch #2: The second fetch should have resolved");
            fluid.tests.remoteModelComponent.tester.removeEvents(that, ["onFetch", "afterFetch"], "testFetch");
        });

        fluid.promise.follow(secondFetch, promise);
        return promise;
    };

    fluid.tests.remoteModelComponent.tester.assertWrite = function (that, name, writeData, requestInFlight) {
        jqUnit.assertDeepEq(name + ": The local model should be passed to the write implementation", that.model.local, writeData);
        jqUnit.assertNull(name + ": There shouldn't be any pending write requests", that.pendingRequests.write);
        jqUnit.assertEquals(name + ": requestInFlight should be set to " + requestInFlight, requestInFlight, that.model.requestInFlight);
    };

    fluid.tests.remoteModelComponent.tester.triggerWrite = function (that, testName) {
        var promise = fluid.promise();

        fluid.tests.remoteModelComponent.tester.addEvents(that, testName, ["onWrite", "afterWrite"], "testWrite");

        var write = that.write();
        write.then(function () {
            fluid.tests.remoteModelComponent.tester.removeEvents(that, ["onWrite", "afterWrite"], "testWrite");
        });
        fluid.promise.follow(write, promise);

        return promise;
    };

    fluid.tests.remoteModelComponent.tester.testMultipleWrites = function (that) {
        var promise = fluid.promise();
        fluid.tests.remoteModelComponent.tester.addEvents(that, "multiple writes", ["onWrite", "afterWrite"], "testWrite");

        // first write
        var firstWrite = that.write();
        jqUnit.assertTrue("multiple writes - write #1: There should be a request in flight", that.model.requestInFlight);
        jqUnit.assertNull("multiple writes  - write #1: There should not be a pending write request", that.pendingRequests.write);
        firstWrite.then(function () {
            jqUnit.assert("multiple writes  - write #1: The first write should have resolved");
        });

        //second write
        var secondWrite = that.write();
        jqUnit.assertTrue("multiple writes  - write #2: There should be a request in flight", that.model.requestInFlight);
        jqUnit.assertValue("multiple writes  - write #2: There should be a pending write request", that.pendingRequests.write);
        secondWrite.then(function () {
            jqUnit.assert("multiple writes  - write #2: The second write should have resolved");
            fluid.tests.remoteModelComponent.tester.removeEvents(that, ["onWrite", "afterWrite"], "testWrite");
        });

        fluid.promise.follow(secondWrite, promise);
        return promise;
    };

    fluid.tests.remoteModelComponent.tester.testWriteThenFetch = function (that) {
        var promise = fluid.promise();
        fluid.tests.remoteModelComponent.tester.addEvents(that, "write/fetch", ["onFetch", "afterFetch", "onWrite", "afterWrite"], "testWriteFetch");

        // write tests
        var write  = that.write();
        jqUnit.assertTrue("write/fetch - write: There should be a request in flight", that.model.requestInFlight);
        jqUnit.assertNull("write/fetch - write: There should not be a pending write request", that.pendingRequests.write);
        jqUnit.assertNull("write/fetch - write: There should not be a pending fetch request", that.pendingRequests.fetch);
        write.then(function (writeData) {
            fluid.tests.remoteModelComponent.tester.assertWrite(that, "write/fetch - write resolved", writeData, true);
        });

        // fetch tests
        var fetch = that.fetch();
        jqUnit.assertTrue("write/fetch - fetch: There should be a request in flight", that.model.requestInFlight);
        jqUnit.assertValue("write/fetch - fetch: There should be a pending fetch request", that.pendingRequests.fetch);
        fetch.then(function () {
            jqUnit.assert("write/fetch - fetch: The fetch promise should have resolved");
            fluid.tests.remoteModelComponent.tester.removeEvents(that, ["onFetch", "afterFetch", "onWrite", "afterWrite"], "testWriteFetch");
        });

        fluid.promise.follow(fetch, promise);
        return promise;
    };

    fluid.tests.remoteModelComponent.tester.testFetchThenWrite = function (that, expectedModel) {
        var promise = fluid.promise();
        fluid.tests.remoteModelComponent.tester.addEvents(that, "write/fetch", ["onFetch", "afterFetch", "onWrite", "afterWrite"], "testFetchWrite");

        // fetch tests
        var fetch  = that.fetch();
        fetch.then(function (fetchedData) {
            fluid.tests.remoteModelComponent.tester.assertFetch(that, "fetch/write - fetch resolved", fetchedData, expectedModel);
        });
        jqUnit.assertTrue("fetch/write - fetch: There should be a request in flight", that.model.requestInFlight);
        jqUnit.assertValue("fetch/write - fetch: There should be a pending fetch request", that.pendingRequests.fetch);
        jqUnit.assertNoValue("fetch/write - fetch: There shouldn't be a pending write request", that.pendingRequests.write);

        // write tests
        var write = that.write();
        jqUnit.assertTrue("fetch/write - write: There should be a request in flight", that.model.requestInFlight);
        jqUnit.assertValue("fetch/write - write: There should be a pending write request", that.pendingRequests.write);
        write.then(function () {
            jqUnit.assert("fetch/write - write: The write promise should have resolved");
            fluid.tests.remoteModelComponent.tester.removeEvents(that, ["onFetch", "afterFetch", "onWrite", "afterWrite"], "testFetchWrite");
        });

        fluid.promise.follow(write, promise);
        return promise;
    };

    fluid.defaults("fluid.tests.remoteModelComponentTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            remoteModelComponent: {
                type: "fluid.tests.remoteModelComponent",
                createOnEvent: "{testCases}.events.onTestCaseStart"
            },
            testCases: {
                type: "fluid.tests.remoteModelComponent.tester"
            }
        }
    });


    // Tests for workflows that trigger fetch during a write request
    fluid.defaults("fluid.tests.remoteModelComponent.combined", {
        gradeNames: ["fluid.tests.remoteModelComponent"],
        listeners: {
            "onWrite.preFetch": "{that}.fetch",
            "afterWrite.postFetch": "{that}.fetch"
        }
    });

    fluid.defaults("fluid.tests.remoteModelComponent.combined.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Remote Model - write with fetch tests",
            tests: [{
                expect: 10,
                name: "Fetches triggered by write",
                sequence: [{
                    event: "{fluid.tests.remoteModelComponent.combinedTests remoteModelComponent}.events.onCreate",
                    listener: "jqUnit.assertDeepEq",
                    args: ["The initialized model is correct.", fluid.tests.remoteModelComponent.expectedModel.emptyRemote, "{remoteModelComponent}.model"]
                }, {
                    task: "fluid.tests.remoteModelComponent.combined.tester.triggerWrite",
                    args: ["{remoteModelComponent}", "combined"],
                    resolve: "fluid.tests.remoteModelComponent.tester.assertWrite",
                    resolveArgs: ["{remoteModelComponent}", "combined", "{arguments}.0", false]
                }]
            }]
        }]
    });

    fluid.tests.remoteModelComponent.combined.tester.triggerWrite = function (that, testName) {
        var promise = fluid.promise();

        fluid.tests.remoteModelComponent.tester.addEvents(that, testName, ["onFetch", "afterFetch", "onWrite", "afterWrite"], "testWrite");

        var write = that.write();
        write.then(function () {
            fluid.tests.remoteModelComponent.tester.removeEvents(that, ["onFetch", "afterFetch", "onWrite", "afterWrite"], "testWrite");
        });
        fluid.promise.follow(write, promise);

        return promise;
    };

    fluid.defaults("fluid.tests.remoteModelComponent.combinedTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            remoteModelComponent: {
                type: "fluid.tests.remoteModelComponent.combined",
                createOnEvent: "{testCases}.events.onTestCaseStart"
            },
            testCases: {
                type: "fluid.tests.remoteModelComponent.combined.tester"
            }
        }
    });

    fluid.test.runTests([
        "fluid.tests.remoteModelComponentTests",
        "fluid.tests.remoteModelComponent.combinedTests"
    ]);

})();
