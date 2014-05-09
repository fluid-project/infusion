/*
Copyright 2010 - 2014 OCAD University
Copyright 2011 Lucendo Development Ltd.

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

    jqUnit.module("Progressive Enhancement");

    var checkerOptions = {
        defaultContextName: "food.carrots"
    };

    var invokeCheckerWithChecks = function (checks) {
        var options = fluid.expandOptions($.extend({}, checkerOptions, {checks: checks}), null);
        var names = fluid.progressiveChecker(options).options.gradeNames;
        return fluid.find(names, function (name) {
            return (/fluid\.progressiveChecker|fluid\.littleComponent|fluid\.typeFount|autoInit/).test(name) ? undefined : name;
        });
    };

    jqUnit.test("progressiveChecker", function () {
        // No checks at all
        var result = invokeCheckerWithChecks([]);
        jqUnit.assertEquals("No checks, the default type tag should be returned.",
            "food.carrots", result);

        // Single specified context, and it should match.
        fluid.staticEnvironment.cat = fluid.typeTag("animal.cat");
        result = invokeCheckerWithChecks([{
            "feature": "{animal.cat}",
            "contextName": "food.fancyFeast"
        }]);
        jqUnit.assertEquals("One matching features, should return the correct context name.",
                           "food.fancyFeast", result);

        // Two contexts, both match, first should be returned.
        fluid.staticEnvironment.dog = fluid.typeTag("animal.dog");
        result = invokeCheckerWithChecks([{
            "feature": "{animal.cat}",
            "contextName": "food.fancyFeast"
        }, {
            "feature": "{animal.dog}",
            "contextName": "food.iams"
        }]);
        jqUnit.assertEquals("Both features match, so the first contextName should be returned.",
                            "food.fancyFeast", result);

        // Two contexts, second should match.
        result = invokeCheckerWithChecks([{
            "feature": "{animal.hamster}",
            "contextName": "food.fancyFeast"
        }, {
            "feature": "{animal.dog}",
            "contextName": "food.iams"
        }]);
        jqUnit.assertEquals("First feature doesn't match, second feature should match and return the correct context name.",
                            "food.iams", result);

        // Two contexts, none match.
        result = invokeCheckerWithChecks([{
            "feature": "{animal.gerbil}",
            "contextName": "food.celery"
        }, {
            "feature": "{animal.crocodile}",
            "contextName": "food.arm"
        }]);
        jqUnit.assertEquals("Neither feature matches, default value should be returned.",
                            "food.carrots", result);
        delete fluid.staticEnvironment.cat;
        delete fluid.staticEnvironment.dog;
    });

    fluid.registerNamespace("fluid.test");

    var NOT_CHECKED = false;
    var CHECKED = true;

    var STATIC_ENV_NOT_SET = NOT_CHECKED;
    var STATIC_ENV_SET = CHECKED;

    var assertEnvKey = function (env, key, shouldExist) {
        jqUnit.expect(1);
        var val = fluid.getGlobalValue(env)[key];
        if (shouldExist) {
            jqUnit.assertValue("The key '" + key + "' should exist in " + env, val);
        } else {
            jqUnit.assertNoValue("The key '" + key + "' should not exist in " + env, val);
        }
    };

    var assertKeyInEnvironments = function (key, staticShoulExist, checkedShouldExist) {
        assertEnvKey("fluid.staticEnvironment", key, staticShoulExist);
        assertEnvKey("fluid.enhance.checked", key, checkedShouldExist);
    };

    jqUnit.test("fluid.enhance.typeToKey", function () {
        jqUnit.expect(2);

        var typeName = "fluid.type.name";
        var expectedName = "fluid--type--name";
        var otherName = "otherName";

        jqUnit.assertEquals("The typeName should be converted", expectedName, fluid.enhance.typeToKey(typeName));
        jqUnit.assertEquals("The name should not be modified", otherName, fluid.enhance.typeToKey(otherName));
    });

    jqUnit.test("fluid.enhance.check", function () {
        jqUnit.expect(5);
        fluid.test.setEnvironment = function () {
            jqUnit.assertTrue("The setEnvironment check was run", true);
            return true;
        };

        fluid.test.notSetEnvironment = function () {
            jqUnit.assertTrue("The notSetEnvironment test was run", true);
            return false;
        };

        var checkSet = {
            "check.set.one": "fluid.test.setEnvironment",
            "check.set.two": fluid.test.setEnvironment
        };

        var checksNotSet = {
            "check.notSet.one": "fluid.test.notSetEnvironment",
            "check.notSet.two": fluid.test.notSetEnvironment
        };

        // Run the check and add keys to the static environment
        fluid.enhance.check(checkSet);
        // Verify that the keys have been added to the static environment and the checked obj
        fluid.each(checkSet, function (val, key) {
            var staticKey = fluid.enhance.typeToKey(key);
            assertKeyInEnvironments(staticKey, STATIC_ENV_SET, CHECKED);
        });

        // Run the check but don't add keys to the static environment
        fluid.enhance.check(checksNotSet);
        // Verify that the keys have not been added to the static environment, but have are in the checked obj
        fluid.each(checksNotSet, function (val, key) {
            var staticKey = fluid.enhance.typeToKey(key);
            assertKeyInEnvironments(staticKey, STATIC_ENV_NOT_SET, CHECKED);
        });

        // Rerun a check that has been run before. It should not execute the check func.
        var origSE = fluid.copy(fluid.staticEnvironment);
        fluid.enhance.check({"check.set.one": "fluid.test.setEnvironment", "check.notSet.one": "fluid.test.notSetEnvironment"});
        // Verify that the static environment hasn't changed
        jqUnit.assertDeepEq("The static environment should not have been changed", origSE, fluid.staticEnvironment);
    });

    jqUnit.test("fluid.forget", function () {
        jqUnit.expect(2);
        var checked = "checked.key";
        var unChecked = "static.unChecked";

        // Add and verify that keys are in the static environment and checked
        var checkedKey = fluid.enhance.typeToKey(checked);
        fluid.staticEnvironment[checkedKey] = fluid.typeTag(checked);
        fluid.enhance.checked[checkedKey] = true;
        assertKeyInEnvironments(checkedKey, STATIC_ENV_SET, CHECKED);

        var unCheckedKey = fluid.enhance.typeToKey(unChecked);
        fluid.staticEnvironment[unCheckedKey] = fluid.typeTag(unChecked);
        assertKeyInEnvironments(unCheckedKey, STATIC_ENV_SET, NOT_CHECKED);

        // forget keys
        fluid.enhance.forget(checked);
        assertKeyInEnvironments(checkedKey, STATIC_ENV_NOT_SET, NOT_CHECKED);

        var origSE = fluid.copy(fluid.staticEnvironment);
        var origChecked = fluid.copy(fluid.enhance.checked);

        jqUnit.assertDeepEq("The static environment should not have changed", origSE, fluid.staticEnvironment);
        jqUnit.assertDeepEq("fluid.enhance.checked should not have changed", origChecked, fluid.enhance.checked);
    });

    jqUnit.test("fluid.enhance.forgetAll", function () {
        var typeNames = ["check.one", "check.two"];
        var keys = [];

        // Add keys to the static environment
        fluid.each(typeNames, function (val) {
            var key = fluid.enhance.typeToKey(val);
            keys.push(key);
            fluid.staticEnvironment[key] = fluid.typeTag(val);
            fluid.enhance.checked[key] = true;
            assertKeyInEnvironments(key, STATIC_ENV_SET, CHECKED);
        });

        // Remove all checked keys
        fluid.enhance.forgetAll();

        // Verify that the checked keys have been removed
        fluid.each(keys, function (val) {
            assertKeyInEnvironments(val, STATIC_ENV_NOT_SET, NOT_CHECKED);
        });
    });

    fluid.staticEnvironment.testEnv = fluid.typeTag("fluid.test");

    fluid.defaults("fluid.tests.enhanceTarget", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            progressiveChecker: {
                type: "fluid.progressiveCheckerForComponent",
                options: {componentName: "fluid.tests.enhanceTarget"}
            }
        },
        progressiveCheckerOptions: {
            checks: [
                {
                    feature: "{fluid.test}",
                    contextName: "fluid.enhanceTarget.test"
                }
            ]
        }
    });

    jqUnit.test("progressiveCheckerForComponent", function () {
        var that = fluid.tests.enhanceTarget();
        var checkerGrades = that.progressiveChecker.options.gradeNames;
        jqUnit.assertTrue("Context name resolved into checker grade", $.inArray("fluid.enhanceTarget.test", checkerGrades) !== -1);
        jqUnit.assertTrue("Horizon name resolved into checker grade", $.inArray("fluid.tests.enhanceTarget.progressiveCheck", checkerGrades) !== -1);
    });

})(jQuery);
