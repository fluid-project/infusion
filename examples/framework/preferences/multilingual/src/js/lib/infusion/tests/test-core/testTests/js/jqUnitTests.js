/*
 Copyright 2016 Raising the Floor - International

 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 */

/* global fluid, jqUnit */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests.jqUnit");

    jqUnit.module("Conventional jqUnit tests");

    jqUnit.test("Simple Deep Equivalence Tests", function () {
        jqUnit.expect(12);
        jqUnit.assertDeepEq("eq1", {p1: "thing1"}, {p1: "thing1"});
        jqUnit.assertDeepNeq("eq2", {p1: "thing1"}, {p2: "thing1"});
        jqUnit.assertDeepNeq("eq3", {p1: "thing1"}, null);
        jqUnit.assertDeepNeq("eq4", null, {p1: "thing1"});
        jqUnit.assertDeepEq("eq5", null, null);
        jqUnit.assertDeepEq("eq6", undefined, undefined);
        jqUnit.assertDeepNeq("eq7", {p1: "thing1", p2: "thing"}, {p1: "thing1"});
        jqUnit.assertDeepNeq("eq8",  {p1: "thing1"}, {p1: "thing1", p2: "thing"});
        jqUnit.assertDeepEq("eq9", [1, 2], [1, 2]);
        jqUnit.assertDeepNeq("eq10", [1, 2], [1, 2, 3]);
        jqUnit.assertDeepNeq("eq11", [1, [2, 3, 4]], [1, [2, 3, 4, 5]]);
        jqUnit.assertDeepEq("eq12", [1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
    });

    jqUnit.test("jqUnit.assertDeepEq passing tests (FLUID-5901)", function () {
        jqUnit.expect(5);
        jqUnit.assertDeepNeq("True is not deep equal to false", true, false);
        jqUnit.assertDeepEq("True is deep equal to false", true, true);
        jqUnit.assertDeepNeq("1 is not deep equal to 2", 1, 2);
        jqUnit.assertDeepEq("1 is deep equal to 1", 1, 1);
        jqUnit.assertDeepNeq("{} is not equal to true", {}, true);
    });

    /** From here on, EVERY TEST MUST FAIL **/

    jqUnit.module("jqUnit tests which must each fail", {
        setup: fluid.test.failingSetup,
        teardown: fluid.test.failingTeardown
    });

    jqUnit.test("jqUnit.assertDeepEq failing tests (FLUID-5901)", function () {
        jqUnit.expect(5);

        jqUnit.assertDeepEq("True is not deep equal to false", true, false);
        jqUnit.assertDeepNeq("True is deep equal to false", true, true);
        jqUnit.assertDeepEq("1 is not deep equal to 2", 1, 2);
        jqUnit.assertDeepNeq("1 is deep equal to 1", 1, 1);
        jqUnit.assertDeepEq("{} is not equal to true", {}, true);
    });

    jqUnit.test("THESE TESTS SHOULD FAIL - testing message support", function () {
        jqUnit.expect(4);
        jqUnit.assertDeepEq("eq12", [1, 2, 3, 4, 5], [1, 2, 3, 4, 6]);
        jqUnit.assertDeepEq("eq10", [1, 2], [1, 2, 3]);
        jqUnit.assertDeepEq("eq11", [1, [2, 3, 4]], [1, [2, 3, 4, 5]]);
        jqUnit.assertDeepEq("eq4", null, {p1: "thing1"});
    });

})();
