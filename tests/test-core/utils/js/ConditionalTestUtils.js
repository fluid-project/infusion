/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

/* global jqUnit */

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
        // contextAwareness: {},
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
        // tests: {}
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

    // Given the lack of standards around navigator.platform, this is based on
    // web developer "folk knowledge" as embodied in posts like
    // http://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
    //
    // These checks should not be relied upon outside of a controlled testing
    // context, when we need to skip certain tests based on bugs or partial
    // implementation on a particular browser/platform combination

    // Linux platforms identify themselves with a full "Linux" string plus
    // a platform architecture string, as the following partial list:
    // - Linux x86_64
    // - Linux aarch64
    fluid.test.conditionalTestUtils.isBrowserOnLinux = function () {
        return fluid.test.conditionalTestUtils.contextValueContains("Linux", "{fluid.browser.platformName}");
    };

    // Macintosh platforms identify themselves with a "Mac" string concatenated
    // with a platform architecture string, such as:
    // - MacIntel
    // - MacPPC
    fluid.test.conditionalTestUtils.isBrowserOnMac = function () {
        return fluid.test.conditionalTestUtils.contextValueContains("Mac", "{fluid.browser.platformName}");
    };

    // Windows platforms identify themselves with a "Win" string concatenated
    // with a platform architecture string, such as:
    // - Win32
    // - Win16
    // - WinCE
    fluid.test.conditionalTestUtils.isBrowserOnWindows = function () {
        return fluid.test.conditionalTestUtils.contextValueContains("Win", "{fluid.browser.platformName}");
    };

    // Makes checks for browser platform
    fluid.contextAware.makeChecks({
        "fluid.browser.platform.isLinux": "fluid.test.conditionalTestUtils.isBrowserOnLinux",
        "fluid.browser.platform.isMac": "fluid.test.conditionalTestUtils.isBrowserOnMac",
        "fluid.browser.platform.isWindows": "fluid.test.conditionalTestUtils.isBrowserOnWindows"
    });

    // Functions for web browser name reporting for makeChecks

    // Edge reports Chrome in its userAgent string, so we have to additionally check for
    // the Edge string
    fluid.test.conditionalTestUtils.isChromeBrowser = function () {
        return fluid.test.conditionalTestUtils.contextValueContains("Chrome", "{fluid.browser.userAgent}") && !fluid.test.conditionalTestUtils.contextValueContains("Edge", "{fluid.browser.userAgent}");
    };

    // We have to check that the userAgent string contains Safari, but does not
    // contain Chrome, because Chrome on Mac includes the string "Safari"
    fluid.test.conditionalTestUtils.isSafariBrowser = function () {
        return fluid.test.conditionalTestUtils.contextValueContains("Safari", "{fluid.browser.userAgent}") && !fluid.test.conditionalTestUtils.contextValueContains("Chrome", "{fluid.browser.userAgent}");
    };

    fluid.test.conditionalTestUtils.isFirefoxBrowser = function () {
        return fluid.test.conditionalTestUtils.contextValueContains("Firefox", "{fluid.browser.userAgent}");
    };

    fluid.test.conditionalTestUtils.isEdgeBrowser = function () {
        return fluid.test.conditionalTestUtils.contextValueContains("Edge", "{fluid.browser.userAgent}");
    };

    // Makes checks for browser name
    fluid.contextAware.makeChecks({
        "fluid.browser.isChrome": "fluid.test.conditionalTestUtils.isChromeBrowser",
        "fluid.browser.isSafari": "fluid.test.conditionalTestUtils.isSafariBrowser",
        "fluid.browser.isFirefox": "fluid.test.conditionalTestUtils.isFirefoxBrowser",
        "fluid.browser.isEdge": "fluid.test.conditionalTestUtils.isEdgeBrowser"
    });

})();
