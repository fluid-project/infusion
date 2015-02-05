/*
Copyright 2010 - 2014 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests.enhance");

    jqUnit.module("Progressive Enhancement");

    fluid.tests.enhance.checkerOptions = {
        defaultContextName: "food.carrots"
    };

    fluid.tests.enhance.invokeCheckerWithChecks = function (checks) {
        var options = fluid.expandOptions($.extend({},  fluid.tests.enhance.checkerOptions, {checks: checks}), fluid.rootComponent);
        var names = fluid.progressiveChecker(options).options.gradeNames;
        return fluid.find(names, function (name) {
            return (/fluid\.progressiveChecker|fluid\.littleComponent|fluid\.typeFount|autoInit/).test(name) ? undefined : name;
        });
    };

    jqUnit.test("progressiveChecker", function () {
        // No checks at all
        var result =  fluid.tests.enhance.invokeCheckerWithChecks([]);
        jqUnit.assertEquals("No checks, the default type tag should be returned.",
            "food.carrots", result);

        // Single specified context, and it should match.
        fluid.enhance.check({"animal.cat": true});
        result =  fluid.tests.enhance.invokeCheckerWithChecks([{
            "feature": "{animal.cat}",
            "contextName": "food.fancyFeast"
        }]);
        jqUnit.assertEquals("One matching features, should return the correct context name.",
                           "food.fancyFeast", result);

        // Two contexts, both match, first should be returned.
        fluid.enhance.check({"animal.dog": true});
        result =  fluid.tests.enhance.invokeCheckerWithChecks([{
            "feature": "{animal.cat}",
            "contextName": "food.fancyFeast"
        }, {
            "feature": "{animal.dog}",
            "contextName": "food.iams"
        }]);
        jqUnit.assertEquals("Both features match, so the first contextName should be returned.",
                            "food.fancyFeast", result);

        // Two contexts, second should match.
        result =  fluid.tests.enhance.invokeCheckerWithChecks([{
            "feature": "{animal.hamster}",
            "contextName": "food.fancyFeast"
        }, {
            "feature": "{animal.dog}",
            "contextName": "food.iams"
        }]);
        jqUnit.assertEquals("First feature doesn't match, second feature should match and return the correct context name.",
                            "food.iams", result);

        // Two contexts, none match.
        result =  fluid.tests.enhance.invokeCheckerWithChecks([{
            "feature": "{animal.gerbil}",
            "contextName": "food.celery"
        }, {
            "feature": "{animal.crocodile}",
            "contextName": "food.arm"
        }]);
        jqUnit.assertEquals("Neither feature matches, default value should be returned.",
                            "food.carrots", result);
        fluid.enhance.forget("animal.cat");
        fluid.enhance.forget("animal.dog");
    });
    
    fluid.tests.enhance.isResolvable = function (typeName) {
        var component = fluid.expandOptions("{" + typeName + "}", fluid.rootComponent);
        return !!component;
    };
    
    fluid.tests.enhance.assertResolvable = function (typeHash) {
        fluid.each(typeHash, function (value, key) {
            jqUnit.assertEquals("Typename " + key + " should be resolvable: " + value, value, fluid.tests.enhance.isResolvable(key));
        });
    };
    
    fluid.tests.enhance.setEnvironment = function () {
        jqUnit.assertTrue("The setEnvironment check was run", true);
        return true;
    };

    fluid.tests.enhance.notSetEnvironment = function () {
        jqUnit.assertTrue("The notSetEnvironment test was run", true);
        return false;
    };

    jqUnit.test("fluid.enhance.check and fluid.enhance.forget", function () {
        jqUnit.expect(10);

        var checkSet = {
            "check.set.one": "fluid.tests.enhance.setEnvironment",
            "check.set.two": fluid.tests.enhance.setEnvironment
        };

        var checksNotSet = {
            "check.notSet.one": "fluid.tests.enhance.notSetEnvironment",
            "check.notSet.two": fluid.tests.enhance.notSetEnvironment
        };

        fluid.enhance.check(checkSet);
        fluid.tests.enhance.assertResolvable({
            "check.set.one": true,
            "check.set.two": true
        });

        fluid.enhance.check(checksNotSet);
        fluid.tests.enhance.assertResolvable({
            "check.notSet.one": false,
            "check.notSet.two": false
        });

        fluid.enhance.check({"check.set.one": "fluid.test.setEnvironment", "check.notSet.one": "fluid.test.notSetEnvironment"});
        // TODO: assert no components constructed
        fluid.enhance.forget(fluid.keys(checkSet));
        fluid.tests.enhance.assertResolvable({
            "check.set.one": false,
            "check.set.two": false
        });
    });

    jqUnit.test("fluid.enhance.forgetAll", function () {
        var typeNames = {
            "check.one": true,
            "check.two": true
        };
        fluid.enhance.check(typeNames);
        
        fluid.tests.enhance.assertResolvable({
            "check.one": true,
            "check.two": true
        });
        
        fluid.enhance.forgetAll();

        fluid.tests.enhance.assertResolvable({
            "check.one": false,
            "check.two": false
        });
    });

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
                    feature: "{fluid.tests.enhance}",
                    contextName: "fluid.enhanceTarget.test"
                }
            ]
        }
    });

    jqUnit.test("progressiveCheckerForComponent", function () {
        fluid.enhance.check({"fluid.tests.enhance": true});
        
        var that = fluid.tests.enhanceTarget();
        var checkerGrades = that.progressiveChecker.options.gradeNames;
        jqUnit.assertTrue("Context name resolved into checker grade", $.inArray("fluid.enhanceTarget.test", checkerGrades) !== -1);
        jqUnit.assertTrue("Horizon name resolved into checker grade", $.inArray("fluid.tests.enhanceTarget.progressiveCheck", checkerGrades) !== -1);
    });

})(jQuery);
