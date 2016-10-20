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

    fluid.registerNamespace("fluid.test.conditionalTestUtils");

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

    fluid.test.conditionalTestUtils.chooseTestByPromiseResult = function (wrapperMessage, task, resolveFunc, rejectFunc, resolveMessage, rejectMessage) {
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

    // a grade for executing context-aware tests
    fluid.defaults("fluid.test.conditionalTestUtils.contextAwareTestRunner", {
        gradeNames: ["fluid.component", "fluid.contextAware"],
        // should contain one or more contextAwareness checks
        // see TestToSpeechTests or TestingTests for concrete usage examples,
        // contextAwareness: {
        // },
        listeners: {
            "onCreate.runTests": {
                funcName: "fluid.test.conditionalTestUtils.runTests",
                args: ["{that}"]
            }
        },
        invokers: {
            "getCheckValue": {
                funcName: "fluid.contextAware.getCheckValue",
                args: ["{that}", "{arguments}.0"]
            }
        }
        // key-value pairs; values are zero-arg test funcNames to be run
        // by the onCreate listener after contextAware grade merging
        // tests: {
        // }
    });

    fluid.test.conditionalTestUtils.runTests = function (that) {
        fluid.each(that.options.tests, function (test) {
            fluid.invokeGlobalFunction(test);
        });
    };

    // Convenience function for skipping a test and displaying an explanatory
    // message
    fluid.test.conditionalTestUtils.bypassTest = function (bypassMessage) {
        jqUnit.test("Tests were skipped.", function () {
            jqUnit.assert(bypassMessage);
        });
    };

    // Checks string-based contextAwareness check values to see if they
    // contain the searchValue string
    fluid.test.conditionalTestUtils.contextValueContains = function (searchValue, checkValue) {
        var value = fluid.contextAware.getCheckValue(fluid.rootComponent, checkValue);
        return value.indexOf(searchValue) >= 0;
    };

    // Functions for browser platform reporting for makeChecks
    fluid.test.conditionalTestUtils.isBrowserOnLinux = function () {
        return fluid.test.conditionalTestUtils.contextValueContains("Linux", "{fluid.browser.platformName}");
    };

    fluid.test.conditionalTestUtils.isBrowserOnMac = function () {
        return fluid.test.conditionalTestUtils.contextValueContains("Mac", "{fluid.browser.platformName}");
    };

    fluid.test.conditionalTestUtils.isBrowserOnWindows = function () {
        return fluid.test.conditionalTestUtils.contextValueContains("Windows", "{fluid.browser.platformName}");
    };

    fluid.contextAware.makeChecks({
        "fluid.browser.platform.isLinux": "fluid.test.conditionalTestUtils.isBrowserOnLinux",
        "fluid.browser.platform.isMac": "fluid.test.conditionalTestUtils.isBrowserOnMac",
        "fluid.browser.platform.isWindows": "fluid.test.conditionalTestUtils.isBrowserOnWindows"
    });

})();
