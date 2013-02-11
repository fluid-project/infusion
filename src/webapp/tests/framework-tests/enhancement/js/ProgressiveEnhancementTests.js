/*
Copyright 2010 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {

    jqUnit.module("Progressive Enhancement");
    
    var checkerOptions = {
        defaultContextName: "food.carrots"
    };
    
    var invokeCheckerWithChecks = function (checks) {
        var options = fluid.expandOptions($.extend({}, checkerOptions, {checks: checks}), null);
        return fluid.progressiveChecker(options).typeName;
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
    });
    
    fluid.registerNamespace("fluid.test");
    
    jqUnit.test("fluid.check", function () {
        jqUnit.expect(9);
        fluid.test.setEnvironment = function () {
            jqUnit.assertTrue("The setEnvironment check was run", true);
            return true;
        };
        
        fluid.test.notSetEnvironment = function () {
            jqUnit.assertTrue("The notSetEnvironment test was run", true);
            return false;
        };
        
        var checkSet = {
            set1: "fluid.test.setEnvironment",
            set2: fluid.test.setEnvironment
        };
        
        var checksNotSet = {
            notSet1: "fluid.test.notSetEnvironment",
            notSet2: fluid.test.notSetEnvironment
        }
        
        // Run the check and add keys to the static environment
        fluid.check(checkSet);
        // Verify that the keys have been added to the static environment 
        fluid.each(checkSet, function (val, key) {
            jqUnit.assertValue("The key '" + key + "', should exist in the static environment", fluid.staticEnvironment[key]);
        });
        
        // Run the check but don't add keys to the static environment
        fluid.check(checksNotSet);
        // Verify that the keys have not been added to the static environment
        fluid.each(checksNotSet, function (val, key) {
            jqUnit.assertUndefined("The key '" + key + "', should not exist in the static environment", fluid.staticEnvironment[key]);
        });

        // Rerun a check that has been run before. It should not execute the check func.
        fluid.check({set1: "fluid.test.setEnvironment"});
        // Verify that the key is still in the static environment
        jqUnit.assertValue("The key 'set1', should exist in the static environment", fluid.staticEnvironment.set1);
    }); 
    
    jqUnit.test("fluid.forget", function () {
        jqUnit.expect(5);
        var toForget = ["toForget1", "toForget2"];
        var neverAdded = "neverAdded";
        
        // Add and verify that keys are in the static environment
        fluid.each(toForget, function (val) {
            fluid.staticEnvironment[val] = fluid.typeTag(val);
            jqUnit.assertValue("The key '" + val + "', should exist in the static environment", fluid.staticEnvironment[val]);
        });
        
        // Add a key to test, that isn't in the static environment
        toForget.push(neverAdded);
        
        // Remove keys from the static environment
        fluid.forget(toForget);
        
        // Verify that keys have been removed form the static environment
        fluid.each(toForget, function (val) {
            jqUnit.assertUndefined("The key '" + val + "', should not exist in the static environment", fluid.staticEnvironment[val]);
        });
    });

})(jQuery);
