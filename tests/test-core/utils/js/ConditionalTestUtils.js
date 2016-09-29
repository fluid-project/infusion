/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

/* global fluid, jqUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.conditionalTestUtils");

    // "platformArg" is a string or array of strings of platform names to detect
    // This returns a boolean based on whether or not the string is
    // present in the navigator.platform string

    fluid.tests.isPlatform = function (platformArg) {
        var detectedPlatform = navigator.platform;
        var isPlatform = false;
        if (fluid.isArrayable (platformArg) ) {
            fluid.each(platformArg, function (currentPlatform) {
                if (detectedPlatform.indexOf(currentPlatform) >= 0) {
                    isPlatform = true;
                }
            });
        } else if (detectedPlatform.indexOf(platformArg) >= 0) {
            isPlatform = true;
        }

        return isPlatform;
    };

    // Chooses which test function to execute based on the results of a
    // promise; wraps the promise in an asyncTest to cause QUnit's test
    // runner to suspend while the decision is being made asynchronously by
    // the promise. Without this, QUnit will merrily proceed along to the
    // next test set, which can cause errors various contexts including the
    // all-tests runner.
    //
    // wrapperMessage, task, resolveFunc, rejectFunc: required
    // "task" must be a function returning a promise
    // resolveMessage, rejectMessage: optional strings, passed to the test
    // functions

    fluid.tests.conditionalTestUtils.chooseTestByPromiseResult = function (wrapperMessage, task, resolveFunc, rejectFunc, resolveMessage, rejectMessage) {
        resolveMessage = resolveMessage || "Promise resolved, running resolve test.";
        rejectMessage = rejectMessage || "Promise rejected, running reject test.";
        jqUnit.asyncTest(wrapperMessage, function () {
            jqUnit.expect(0);
            task().then(function () {
                jqUnit.start();
                resolveFunc(resolveMessage);
            }, function () {
                jqUnit.start();
                rejectFunc(rejectMessage);
            });
        });
    };

    // Chooses which test function to execute based on a boolean, displaying
    // messages accordingly
    fluid.tests.conditionalTestUtils.chooseTestByBooleanResult = function (boolean, trueFunc, falseFunc, trueMessage, falseMessage) {
        trueMessage = trueMessage || "Boolean is true, running true test.";
        falseMessage = falseMessage || "Boolean is false, running false test.";
        if (boolean) {
            trueFunc(trueMessage);
        } else {
            falseFunc(falseMessage);
        }
    };

    // Convenience function for skipping a test and displaying an explanatory
    // message
    fluid.tests.conditionalTestUtils.bypassTest = function (bypassMessage) {
        jqUnit.test("Tests were skipped.", function () {
            jqUnit.assert(bypassMessage);
        });
    };

})();
