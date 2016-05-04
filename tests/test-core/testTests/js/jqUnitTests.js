/*
 Copyright 2016 Raising the Floor - International

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 */

/* global fluid, jqUnit, QUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.jqUnit");
    
    jqUnit.module("Conventional jqUnit tests");
    
    fluid.tests.jqUnit.failIsPass = false;
    
    // We have to use this insane scheme for subverting QUnit's accounting rather than a teardown function,
    // since we need to beat qunit-composite.js own logging function. When will the "industry" learn that
    // integration is the first priority?
    QUnit.log(function (data) {
        if (fluid.tests.jqUnit.failIsPass) {
            data.result = !data.result;
        }
    });
    
    jqUnit.test("jqUnit.assertDeepEq passing tests (FLUID-5901)", function () {
        jqUnit.expect(4);
        jqUnit.assertDeepNeq("True is not deep equal to false", true, false);
        jqUnit.assertDeepEq("True is deep equal to false", true, true);
        jqUnit.assertDeepNeq("1 is not deep equal to 2", 1, 2);
        jqUnit.assertDeepEq("1 is deep equal to 1", 1, 1);
    });
    
    /** From here on, EVERY TEST MUST FAIL **/

    fluid.tests.failingSetup = function () {
        // Ensure that the "data" argument sent to QUnit.log() callbacks is subverted too
        fluid.tests.jqUnit.failIsPass = true;
    };
    
    fluid.tests.failingTeardown = function () {
        // Subvert QUnit's records by converting every failing test to a passing test and vice versa
        var current = QUnit.config.current;
        fluid.each(current.assertions, function (assertion) {
            assertion.result = !assertion.result;
        });
        // Undo subversion of QUnit.log() callbacks at the end of the test
        fluid.tests.jqUnit.failIsPass = false;
    };
    
    jqUnit.module("jqUnit tests which must each fail", {
        setup: fluid.tests.failingSetup,
        teardown: fluid.tests.failingTeardown
    });
    
    jqUnit.test("jqUnit.assertDeepEq failing tests (FLUID-5901)", function () {
        jqUnit.expect(4);

        jqUnit.assertDeepEq("True is not deep equal to false", true, false);
        jqUnit.assertDeepNeq("True is deep equal to false", true, true);
        jqUnit.assertDeepEq("1 is not deep equal to 2", 1, 2);
        jqUnit.assertDeepNeq("1 is deep equal to 1", 1, 1);
    });
    
})();
