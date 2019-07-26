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

/* global fluid, QUnit */

(function () {
    "use strict";

    /** Definitions which assist in writing test infrastructure - these are useful
     * when writing tests which must fail. For the duration that the flag `fluid.tests.jqUnit.failIsPass` is
     * set, a test fail will count as a pass and vice versa.
     *
     * The usage style for this infrastructure is to create a jqUnit module which has `fluid.test.failingSetup" as its
     * setup function and `fluid.test.failingTeardown` as its teardown function.
     */

    fluid.registerNamespace("fluid.test.jqUnit");

    fluid.test.jqUnit.failIsPass = false;

    // Insanely, we need both the teardown function and the log subversion because qunit-composite.js uses a completely
    // different strategy to the standard QUnit UI for accounting for test failures:
    // https://github.com/fluid-project/infusion/blob/master/tests/lib/qunit/addons/composite/qunit-composite.js#L79 .
    // If we just use failingTeardown, the main QUnit UI works fine, but the "failures" are rendered as real failures in the iframe-based all-tests.html driver.
    // When will the "industry" learn that integration is the first priority?
    QUnit.log(function (data) {
        if (fluid.test.jqUnit.failIsPass) {
            data.result = !data.result;
        }
    });

    fluid.test.failingSetup = function () {
        // Ensure that the "data" argument sent to QUnit.log() callbacks is subverted too
        fluid.test.jqUnit.failIsPass = true;
    };

    fluid.test.failingTeardown = function () {
        // Subvert QUnit's records by converting every failing test to a passing test and vice versa
        var current = QUnit.config.current;
        fluid.each(current.assertions, function (assertion) {
            assertion.result = !assertion.result;
        });
        // Undo subversion of QUnit.log() callbacks at the end of the test
        fluid.test.jqUnit.failIsPass = false;
    };

})();
