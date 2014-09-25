/*
Copyright 2014 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
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
        holder.addListeners = function (arg) {
            var argVal = arg === undefined ? "" : arg;
            holder.addResolveListener(argVal);
            holder.addRejectListener(argVal);
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
    });
    
    fluid.tests.testConflictedPromise = function (resolve1, resolve2) {
        try {
            fluid.pushSoftFailure(true);
            jqUnit.expect(1);
            var holder = fluid.promise();
            holder[resolve1]();
            holder[resolve2]();
        } catch (e) {
            if (e instanceof fluid.FluidError) {
                jqUnit.assert("Double resolution triggers error");
            }
        } finally {
            fluid.pushSoftFailure(-1);
        }
    };
    
    jqUnit.test("Conflicted resolution tests", function () {
        fluid.tests.testConflictedPromise("resolve", "resolve");
        fluid.tests.testConflictedPromise("resolve", "reject");
        fluid.tests.testConflictedPromise("resolve", "resolve");
        fluid.tests.testConflictedPromise("reject", "reject");
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
    
    fluid.tests.linearScale = function (value, options) {
        var transform = $.extend({
            type: "fluid.transforms.linearScale",
            value: value
        }, options);
        var fullTransform = {};
        fluid.set(fullTransform, ["", "transform"], transform);
        var togo = fluid.model.transformWithRules(value, fullTransform);
        return togo;
    };
    
    fluid.defaults("fluid.tests.simplePromiseTransform", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            forwardTransform: null,
            backwardTransform: null
        },
        invokers: {
            linearScale: "fluid.tests.linearScale"
        },
        listeners: {
            forwardTransform: [{
                func: "{that}.linearScale",
                args: ["{arguments}.0", {offset: 1}],
                priority: 2
            }, {
                func: "{that}.linearScale",
                args: ["{arguments}.0", {factor: 2}],
                priority: 1
            }],
            backwardTransform: [{
                func: "{that}.linearScale",
                args: ["{arguments}.0", {offset: -1}],
                priority: 2
            }, {
                func: "{that}.linearScale",
                args: ["{arguments}.0", {factor: 0.5}],
                priority: 1
            }]
        }
    });
    
    jqUnit.test("Simple synchronous transform chain", function () {
        jqUnit.expect(2);
        var that = fluid.tests.simplePromiseTransform();
        var transformed = fluid.promise.fireTransformEvent(that.events.forwardTransform, 1);
        // This will be synchronous as per Fluid promises impl
        transformed.then(function (value) {
            jqUnit.assertEquals("Received forward transformed value", 4, value);
        });
        var back = fluid.promise.fireTransformEvent(that.events.backwardTransform, 4, true);
        back.then(function (value) {
            jqUnit.assertEquals("Received backward transformed value", 1, value);
        });
    });
    
    fluid.tests.linearScaleLater = function (value, options) {
        var promise = fluid.promise();
        fluid.invokeLater(function() {
            promise.resolve(fluid.tests.linearScale(value, options));
        });
        return promise;
    };
    
    jqUnit.asyncTest("Asynchronous transform chain", function () {
        jqUnit.expect(1);
        var that = fluid.tests.simplePromiseTransform({
            invokers: {
                linearScale: "fluid.tests.linearScaleLater"
            }
        });
        var transformed = fluid.promise.fireTransformEvent(that.events.forwardTransform, 1);
        transformed.then(function (value) {
            jqUnit.assertEquals("Received forward transformed value", 4, value);
            jqUnit.start();
        });
    });
    
    fluid.tests.firePromiseError = function () {
        var promise = fluid.promise();
        fluid.invokeLater(function () {
            promise.reject({
                isError: true,
                message: "This tests an asynchronous error return"
            });
        });
        return promise;
    };
    
    fluid.defaults("fluid.tests.errorPromiseTransform", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
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
    
    jqUnit.asyncTest("Error promise chain", function () {
        jqUnit.expect(1);
        var that = fluid.tests.errorPromiseTransform();
        var transformed = fluid.promise.fireTransformEvent(that.events.forwardTransform, 1);
        transformed.then(function () {
            fluid.fail("Failed chain should not produce resolve return");
        }, function (value) {
            jqUnit.assertTrue("Failed chain should produce first return's payload", value.isError);
            jqUnit.start();
        });
    });
    
})(jQuery);
