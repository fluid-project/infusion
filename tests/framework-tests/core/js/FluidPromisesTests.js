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

/* global jqUnit */

"use strict";

fluid.setLogging(true);

fluid.registerNamespace("fluid.tests");

jqUnit.module("Fluid Promises Tests");

fluid.tests.makeTrackingPromise = function () {
    var holder = {
        record: [],
        promise: fluid.promise()
    };
    holder.addResolveListener = function (arg) {
        holder.promise.then(function (val) {
            holder.record.push({resolve: val + arg});
        });
    };
    holder.addRejectListener = function (arg) {
        holder.promise.then(null, function (val) {
            holder.record.push({reject: val + arg});
        });
    };
    holder.addCancelListener = function (arg) {
        holder.promise.then(null, null, function (val) {
            holder.record.push({cancel: val + arg});
        });
    };
    holder.addListeners = function (arg) {
        var argVal = arg === undefined ? "" : arg;
        holder.addResolveListener(argVal);
        holder.addRejectListener(argVal);
        holder.addCancelListener(argVal);
    };
    return holder;
};

fluid.tests.makeStandardTrackingPromise = function () {
    var holder = fluid.tests.makeTrackingPromise();
    holder.addListeners();
    return holder;
};

jqUnit.test("Forward resolution tests", function () {
    var holder = fluid.tests.makeStandardTrackingPromise();
    holder.promise.resolve("resolved");
    jqUnit.assertDeepEq("Resolved promise just fires resolve", [{
        resolve: "resolved"
    }], holder.record);
    var holder2 = fluid.tests.makeStandardTrackingPromise();
    holder2.promise.reject("rejected");
    jqUnit.assertDeepEq("Rejected promise just fires reject", [{
        reject: "rejected"
    }], holder2.record);
    var holder3 = fluid.tests.makeStandardTrackingPromise();
    holder3.promise.cancel("cancelled");
    jqUnit.assertDeepEq("Cancelled promise just fires cancel", [{
        cancel: "cancelled"
    }], holder3.record);
});

jqUnit.test("Backward resolution tests", function () {
    var holder = fluid.tests.makeTrackingPromise();
    holder.promise.resolve("resolved");
    holder.addListeners();
    jqUnit.assertDeepEq("Resolved promise fires resolve on registration", [{
        resolve: "resolved"
    }], holder.record);
    var holder2 = fluid.tests.makeTrackingPromise();
    holder2.promise.reject("rejected");
    holder2.addListeners();
    jqUnit.assertDeepEq("Rejected promise fires reject on registration", [{
        reject: "rejected"
    }], holder2.record);
    var holder3 = fluid.tests.makeTrackingPromise();
    holder3.promise.cancel("cancelled");
    holder3.addListeners();
    jqUnit.assertDeepEq("Cancelled promise fires cancel on registration", [{
        cancel: "cancelled"
    }], holder3.record);
});

fluid.tests.executePromiseResolutions = function (resolve1, resolve2) {
    var holder = fluid.promise();
    holder.then(null, fluid.identity); // Dummy rejection handler to avoid false diagnostic
    holder[resolve1]();
    holder[resolve2]();
    return holder;
};

fluid.tests.testConflictedPromise = function (resolve1, resolve2) {
    jqUnit.expectFrameworkDiagnostic("Double resolution of promises - " + resolve1 + ", " + resolve2,
        function () {
            fluid.tests.executePromiseResolutions(resolve1, resolve2);
        }, "already");
};

fluid.tests.testNoopPromise = function (resolve1, resolve2) {
    jqUnit.expect(0);
    var promise = fluid.tests.executePromiseResolutions(resolve1, resolve2);
    var fail = function () {
        jqUnit.fail("Received resolution from cancelled promise");
    };
    promise.then(fail, fail);
};

fluid.tests.testActivePromise = function (resolve1, resolve2) {
    jqUnit.expect(1);
    var promise = fluid.tests.executePromiseResolutions(resolve1, resolve2);
    var count = 0;
    var countIt = function () {
        ++count;
    };
    promise.then(countIt, countIt);
    jqUnit.assertEquals("One callback should have been invoked", 1, count);
};

jqUnit.test("Conflicted resolution tests", function () {
    fluid.tests.testConflictedPromise("resolve", "resolve");
    fluid.tests.testConflictedPromise("resolve", "reject");
    fluid.tests.testConflictedPromise("resolve", "resolve");
    fluid.tests.testConflictedPromise("reject", "reject");
});

jqUnit.test("Cancellation resolution tests", function () {
    jqUnit.expect(0);
    fluid.tests.testNoopPromise("cancel", "resolve");
    fluid.tests.testNoopPromise("cancel", "reject");
    fluid.tests.testActivePromise("resolve", "cancel");
    fluid.tests.testActivePromise("reject", "cancel");
});

jqUnit.test("Cancellation through fluid.promise.follow", function () {
    var source = fluid.promise();
    var target = fluid.promise();
    fluid.promise.follow(source, target);
    var unwantedSideEffect = false;
    source.then(function () {
        unwantedSideEffect = true;
    });
    target.cancel();
    source.resolve(42);
    jqUnit.assertFalse("Cancellation of followed target cancels source", unwantedSideEffect);
});

fluid.tests.makeMultipleListenerPromise = function () {
    var holder = fluid.tests.makeTrackingPromise();
    holder.addListeners(1);
    holder.addListeners(2);
    return holder;
};

jqUnit.test("Test multiple listeners", function () {
    var holder = fluid.tests.makeMultipleListenerPromise();
    holder.promise.resolve("resolved");
    jqUnit.assertDeepEq("Resolved promise just fires resolves in order", [{
        resolve: "resolved1"
    }, {
        resolve: "resolved2"
    }], holder.record);
    var holder2 = fluid.tests.makeMultipleListenerPromise();
    holder2.promise.reject("rejected");
    jqUnit.assertDeepEq("Rejected promise just fires rejects in order", [{
        reject: "rejected1"
    }, {
        reject: "rejected2"
    }], holder2.record);
});

jqUnit.test("Promise detection", function () {
    var promises = [fluid.promise(), $.Deferred()];
    fluid.each(promises, function (promise) {
        jqUnit.assertTrue("Detect promises", fluid.isPromise(promise));
    });
    var nonPromises = [null, undefined, 0, false, "thing", {then: 5}, []];
    fluid.each(nonPromises, function (promise) {
        jqUnit.assertFalse("Detect nonpromises", fluid.isPromise(promise));
    });
});

jqUnit.asyncTest("Unhandled rejection: FLUID-6453", function () {
    var listener = function (err) {
        jqUnit.assertValue("Expected payload to global rejection handler", "expected", err);
        fluid.unhandledRejectionEvent.removeListener("test");
        jqUnit.start();
    };
    var promise = fluid.promise();
    promise.reject("expected");
    fluid.unhandledRejectionEvent.addListener(listener);
});

fluid.tests.testFluid6453 = function (promiseMaker) {
    var listener = function () {
        jqUnit.fail("No calls expected to global rejection handler");
    };
    var guard = function () {
        jqUnit.assert("No calls expected to global rejection handler");
        fluid.unhandledRejectionEvent.removeListener("test");
        jqUnit.start();
    };
    fluid.unhandledRejectionEvent.addListener(listener);
    promiseMaker();
    window.setTimeout(guard, 17);
};

jqUnit.asyncTest("Unhandled rejection: FLUID-6453 reject first", function () {
    fluid.tests.testFluid6453(function () {
        var promise = fluid.promise();
        promise.reject("expected");
        promise.then(null, fluid.identity);
    });
});

jqUnit.asyncTest("Unhandled rejection: FLUID-6453 reject after", function () {
    fluid.tests.testFluid6453(function () {
        var promise = fluid.promise();
        promise.then(null, fluid.identity);
        promise.reject("expected");
    });
});

// Tests for transform chain algorithm

fluid.tests.linearScale = function (value, options) {
    var transform = $.extend({
        type: "fluid.transforms.linearScale",
        input: value
    }, options);
    var fullTransform = {};
    fluid.set(fullTransform, ["", "transform"], transform);
    var togo = fluid.model.transformWithRules(value, fullTransform);
    return togo;
};

fluid.defaults("fluid.tests.simplePromiseTransform", {
    gradeNames: ["fluid.modelComponent"],
    events: {
        forwardTransform: null,
        backwardTransform: null,
        thisist: null,
        modelPath: null
    },
    invokers: {
        linearScale: "fluid.tests.linearScale"
    },
    listeners: {
        thisist: {
            "this": "$",
            method: "extend",
            args: [{}, "{arguments}.0", {new: "new"}],
            namespace: "thisist"
        },
        modelPath: {
            changePath: "value",
            value: "{arguments}.0",
            namespace: "modelChange"
        },
        forwardTransform: [{
            func: "{that}.linearScale",
            args: ["{arguments}.0", {offset: 1}],
            namespace: "add",
            priority: 2
        }, {
            func: "{that}.linearScale",
            args: ["{arguments}.0", {factor: 2}],
            namespace: "double",
            priority: 1
        }],
        backwardTransform: [{
            func: "{that}.linearScale",
            args: ["{arguments}.0", {offset: -1}],
            namespace: "add",
            priority: 2
        }, {
            func: "{that}.linearScale",
            args: ["{arguments}.0", {factor: 0.5}],
            namespace: "double",
            priority: 1
        }]
    }
});

fluid.tests.testSyncPromises = function (name, forwardValue, fireOptions) {
    jqUnit.test(name, function () {
        jqUnit.expect(2);
        var that = fluid.tests.simplePromiseTransform();
        var transformed = fluid.promise.fireTransformEvent(that.events.forwardTransform, 1, fireOptions);
        // This will be synchronous as per Fluid promises impl
        transformed.then(function (value) {
            jqUnit.assertEquals("Received forward transformed value", forwardValue, value);
        });
        var back = fluid.promise.fireTransformEvent(that.events.backwardTransform, forwardValue, $.extend({}, fireOptions, {reverse: true}));
        back.then(function (value) {
            jqUnit.assertEquals("Received backward transformed value", 1, value);
        });
    });
};

// Operate all transforms
fluid.tests.testSyncPromises("Simple synchronous transform chain", 4);

// Operate only "add" namespaces transforms
fluid.tests.testSyncPromises("Chain filtering by namespace", 2, {filterNamespaces: ["add"]});

jqUnit.test("Transform chain with changePath", function () {
    jqUnit.expect(1);
    var that = fluid.tests.simplePromiseTransform();
    var transformed = fluid.promise.fireTransformEvent(that.events.modelPath, 1);
    // This will be synchronous as per Fluid promises impl
    transformed.then(function () {
        jqUnit.assertEquals("Received transformed value", 1, that.model.value);
    });
});

jqUnit.test("Transform chain with thisist listener", function () {
    jqUnit.expect(1);
    var that = fluid.tests.simplePromiseTransform();
    var transformed = fluid.promise.fireTransformEvent(that.events.thisist, {orig: "orig", new: null});
    // This will be synchronous as per Fluid promises impl
    transformed.then(function (value) {
        jqUnit.assertDeepEq("Received transformed value", {orig: "orig", new: "new"}, value);
    });
});

fluid.tests.linearScaleLater = function (value, options) {
    var promise = fluid.promise();
    fluid.invokeLater(function () {
        promise.resolve(fluid.tests.linearScale(value, options));
    });
    return promise;
};

fluid.tests.testAsyncPromises = function (name, follow) {
    jqUnit.asyncTest(name, function () {
        jqUnit.expect(1);
        var that = fluid.tests.simplePromiseTransform({
            invokers: {
                linearScale: "fluid.tests.linearScaleLater"
            }
        });
        var initPayload = fluid.promise();
        fluid.invokeLater(function () {
            var toresolve = initPayload;
            if (follow) { // tests follow in resolve case
                toresolve = fluid.promise();
                fluid.promise.follow(toresolve, initPayload);
            }
            toresolve.resolve(1);
        });
        var transformed = fluid.promise.fireTransformEvent(that.events.forwardTransform, initPayload, {follow: follow});
        transformed.then(function (value) {
            jqUnit.assertEquals("Received forward transformed value", 4, value);
            jqUnit.start();
        });
    });
};

fluid.tests.testAsyncPromises("Asynchronous transform chain with asynchronous initial value");

fluid.tests.testAsyncPromises("Asynchronous transform chain via follow", true);

fluid.tests.firePromiseError = function (model, options) {
    var togo = fluid.promise();
    fluid.invokeLater(function () {
        var toreject = togo;
        if (options.follow) { // tests follow in reject case
            toreject = fluid.promise();
            fluid.promise.follow(toreject, togo);
        }
        toreject.reject({
            isError: true,
            message: "This tests an asynchronous error return"
        });
    });
    return togo;
};

fluid.defaults("fluid.tests.errorPromiseTransform", {
    gradeNames: ["fluid.component"],
    events: {
        forwardTransform: null
    },
    listeners: {
        forwardTransform: [{
            funcName: "fluid.tests.firePromiseError",
            priority: 2
        }, {
            funcName: "fluid.fail",
            args: "This failure should not occur, through being short-circuited in the promise chain",
            priority: 1
        }]
    }
});

fluid.tests.testErrorPromises = function (name, follow) {
    jqUnit.asyncTest(name, function () {
        jqUnit.expect(1);
        var that = fluid.tests.errorPromiseTransform();
        var transformed = fluid.promise.fireTransformEvent(that.events.forwardTransform, 1, {follow: follow});
        transformed.then(function () {
            fluid.fail("Failed chain should not produce resolve return");
        }, function (value) {
            jqUnit.assertTrue("Failed chain should produce first return's payload", value.isError);
            jqUnit.start();
        });
    });
};

fluid.tests.testErrorPromises("Error promise chain");
fluid.tests.testErrorPromises("Error promise chain via fluid.promise.follow", true);

fluid.defaults("fluid.tests.optionsTransform", {
    gradeNames: ["fluid.component"],
    events: {
        forwardTransform: null
    },
    listeners: {
        forwardTransform: {
            funcName: "fluid.tests.linearScale",
            args: ["{arguments}.0", "{arguments}.1"]
        }
    }
});

jqUnit.test("Transforms accepting options", function () {
    jqUnit.expect(1);
    var that = fluid.tests.optionsTransform();
    var transformed = fluid.promise.fireTransformEvent(that.events.forwardTransform, 1, {offset: 1});
    transformed.then(function (value) {
        jqUnit.assertEquals("Received forward transformed value", 2, value);
    });
});

fluid.tests.optionValueViaPromise = function (options) {
    var promise = fluid.promise();
    fluid.invokeLater(function () {
        promise.resolve(options.optionValue);
    });
    if (options.accumulateReject) {
        promise.accumulateRejectionReason = function (originalReject) { // test FLUID-5584 reject wrapper
            return {
                isError: true,
                originalReject: originalReject,
                message: "Option value resolver for " + options.optionValue + " received upstream reject of " + originalReject
            };
        };
    }
    return promise;
};

fluid.tests.fluid6445wait = function () {
    var togo = fluid.promise();
    fluid.invokeLater(togo.resolve);
    return togo;
};

// In practice this function will never execute at all, but we place its side-effect here as a final stopgap check
fluid.tests.fluid6445sideEffect = function () {
    var togo = fluid.promise();
    togo.then(function () {
        jqUnit.fail("Undesirable side-effect was not prevented through component destruction while chain in progress");
    });
    fluid.invokeLater(togo.resolve);
};

fluid.defaults("fluid.tests.fluid6445", {
    gradeNames: "fluid.component",
    events: {
        cancellableTransform: null
    },
    listeners: {
        "cancellableTransform.first": {
            funcName: "fluid.tests.fluid6445wait"
        },
        "cancellableTransform.sideEffect": {
            funcName: "fluid.tests.fluid6445sideEffect",
            args: "{fluid.tests.fluid6445}"
        }
    }
});

jqUnit.test("FLUID-6445: Sequence cancellation of fluid.promise.fireTransformEvent through component destruction", function () {
    var that = fluid.tests.fluid6445();
    var promise = fluid.promise.fireTransformEvent(that.events.cancellableTransform);
    that.destroy();
    jqUnit.assertEquals("In-progress transform was cancelled through component destruction", "cancel", promise.disposition);
});

jqUnit.asyncTest("fluid.promise.sequence", function () {
    var sources = [3, fluid.promise(), fluid.tests.optionValueViaPromise, function () { return 12;}];
    var response = fluid.promise.sequence(sources, {
        optionValue: 9
    });
    fluid.invokeLater(function () {
        sources[1].resolve(6);
    });
    response.then(function (result) {
        jqUnit.assertDeepEq("Mixture of direct, promised, function promise and function value elements resolved", [3, 6, 9, 12], result);
        jqUnit.start();
    });
});

fluid.tests.testSequenceRejection = function (accumulateReject, expectedRejection) {
    jqUnit.asyncTest("fluid.promise.sequence reject with accumulateReject " + accumulateReject, function () {
        var sources = [fluid.tests.optionValueViaPromise, 6, fluid.promise(), fluid.promise()];
        var response = fluid.promise.sequence(sources, {
            optionValue: 9,
            accumulateReject: accumulateReject
        });
        sources[2].reject(97);
        response.then(function () {
            jqUnit.fail("Error - resolved result from rejected sequence");
        }, function (reason) {
            jqUnit.assertDeepEq("Overall sequence rejected with individual reason", expectedRejection, reason);
            jqUnit.start();
        });
    });
};

fluid.tests.testSequenceRejection(false, 97);
fluid.tests.testSequenceRejection(true, {
    isError: true,
    originalReject: 97,
    message: "Option value resolver for 9 received upstream reject of 97"
});

jqUnit.asyncTest("fluid.promise.sequence sequencing", function () {
    var record = [];
    var produceTrackingPromise = function (index) {
        return function () {
            record.push("produce " + index);
            var promise = fluid.promise();
            promise.then(function () {
                record.push("resolve " + index);
            });
            fluid.invokeLater(function () {
                promise.resolve(index);
            });
            return promise;
        };
    };
    var sources = [produceTrackingPromise(1), produceTrackingPromise(2), produceTrackingPromise(3)];
    var response = fluid.promise.sequence(sources);
    response.then(function (resolved) {
        jqUnit.assertDeepEq("Promise values resolved to expected", [1, 2, 3], resolved);
        jqUnit.assertDeepEq("Promise values resolved in sequence",
            ["produce 1", "resolve 1", "produce 2", "resolve 2", "produce 3", "resolve 3"], record);
        jqUnit.start();
    });
});

jqUnit.test("fluid.promise.sequence error on non-array", function () {
    jqUnit.expectFrameworkDiagnostic("Diagnostic on non-array", function () {
        fluid.promise.sequence({unearthly: "object"});
    }, "array");
});

jqUnit.test("fluid.promise.map tests", function () {
    jqUnit.expect(3);
    var mapper = function (val) {
        return val + 1;
    };
    var p1 = fluid.promise.map(1, mapper);
    p1.then(function (resolve) {
        jqUnit.assertEquals("Mapped value returned from fluid.promise.map", 2, resolve);
    });
    var unit = fluid.promise().resolve(1);
    var p2 = fluid.promise.map(unit, mapper);
    p2.then(function (resolve) {
        jqUnit.assertEquals("Mapped promise returned from fluid.promise.map", 2, resolve);
    });
    var fail = fluid.promise().reject("Error");
    var p3 = fluid.promise.map(fail, mapper);
    p3 = fluid.toPromise(p3); // test idempotency of toPromise on promises
    p3.then(function () {
        jqUnit.fail("Should not resolve from mapping failed promise");
    }, function (error) {
        jqUnit.assertEquals("Should receive failure from mapped failed promise", "Error", error);
    });
});

jqUnit.asyncTest("fluid.promise.map FLUID-5968 tests", function () {
    var mapper = function (val) {
        var togo = fluid.promise();
        fluid.invokeLater(function () {
            togo.resolve(val + 1);
        });
        return togo;
    };
    var unit = fluid.promise().resolve(1);
    var p4 = fluid.promise.map(unit, mapper);
    p4.then(function (resolve) {
        jqUnit.assertEquals("Mapped promise returned from fluid.promise.map", 2, resolve);
        jqUnit.start();
    });
});

jqUnit.test("fluid.toPromise tests", function () {
    jqUnit.expect(1);
    var promise = fluid.toPromise(3);
    promise.then(function (resolved) {
        jqUnit.assertEquals("Converted constant to promise", 3, resolved);
    });
});
