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
    
    jqUnit.test("fluid.enhance.typeToKey", function () {
        jqUnit.expect(2);
        
        var typeName = "fluid.type.name";
        var expectedName = "fluid--type--name";
        var otherName = "otherName";
        
        jqUnit.assertEquals("The typeName should be converted", expectedName, fluid.enhance.typeToKey(typeName));
        jqUnit.assertEquals("The name should not be modified", otherName, fluid.enhance.typeToKey(otherName));
    });
    
    jqUnit.test("fluid.enhance.check", function () {
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
            "check.set.one": "fluid.test.setEnvironment",
            "check.set.two": fluid.test.setEnvironment
        };
        
        var checksNotSet = {
            "check.notSet.one": "fluid.test.notSetEnvironment",
            "check.notSet.two": fluid.test.notSetEnvironment
        }
        
        // Run the check and add keys to the static environment
        fluid.enhance.check(checkSet);
        // Verify that the keys have been added to the static environment 
        fluid.each(checkSet, function (val, key) {
            var staticKey = fluid.enhance.typeToKey(key);
            jqUnit.assertValue("The key '" + staticKey + "', should exist in the static environment", fluid.staticEnvironment[staticKey]);
        });
        
        // Run the check but don't add keys to the static environment
        fluid.enhance.check(checksNotSet);
        // Verify that the keys have not been added to the static environment
        fluid.each(checksNotSet, function (val, key) {
            var staticKey = fluid.enhance.typeToKey(key);
            jqUnit.assertUndefined("The key '" + staticKey + "', should not exist in the static environment", fluid.staticEnvironment[staticKey]);
        });

        // Rerun a check that has been run before. It should not execute the check func.
        var origSE = fluid.copy(fluid.staticEnvironment);
        fluid.enhance.check({"check.set.one": "fluid.test.setEnvironment", "check.notSet.one": "fluid.test.notSetEnvironment"});
        // Verify that the static environment hasn't changed
        jqUnit.assertDeepEq("The static environment should not have been changed", origSE, fluid.staticEnvironment);
    }); 
    
    jqUnit.test("fluid.forget", function () {
        jqUnit.expect(8);
        var checked = "checked.key";
        var unChecked = "static.unChecked";
        var neverAdded = "never.added";
        
        // Add and verify that keys are in the static environment
        var checkedKey = fluid.enhance.typeToKey(checked);
        fluid.staticEnvironment[checkedKey] = fluid.typeTag(checked);
        fluid.enhance.checked[checkedKey] = true;
        jqUnit.assertValue("The key '" + checkedKey + "', should exist in the static environment", fluid.staticEnvironment[checkedKey]);
        jqUnit.assertValue("The key '" + checkedKey + "', should exist in fluid.enhance.checked", fluid.enhance.checked[checkedKey]);
        
        var unCheckedKey = fluid.enhance.typeToKey(unChecked);
        fluid.staticEnvironment[unCheckedKey] = fluid.typeTag(unChecked);
        jqUnit.assertValue("The key '" + unCheckedKey + "', should exist in the static environment", fluid.staticEnvironment[unCheckedKey]);
        jqUnit.assertNoValue("The key '" + unCheckedKey + "', should not exist in fluid.enhance.checked", fluid.enhance.checked[unCheckedKey]);
        
        // forget keys
        fluid.enhance.forget(checked);
        jqUnit.assertNoValue("The key '" + checkedKey + "', should not exist in the static environment", fluid.staticEnvironment[checkedKey]);
        jqUnit.assertNoValue("The key '" + checkedKey + "', should not exist in fluid.enhance.checked", fluid.enhance.checked[checkedKey]);
        
        var origSE = fluid.copy(fluid.staticEnvironment);
        var origChecked = fluid.copy(fluid.enhance.checked);
        
        jqUnit.assertDeepEq("The static enivonment should not have changed", origSE, fluid.staticEnvironment);
        jqUnit.assertDeepEq("fluid.enhance.checked should not have changed", origChecked, fluid.enhance.checked);
    });
    
    jqUnit.test("fluid.enhance.forgetAll", function () {
        jqUnit.expect(8);
        var typeNames = ["check.one", "check.two"];
        var keys = [];
        
        // Add keys to the static environment
        fluid.each(typeNames, function (val) {
            var key = fluid.enhance.typeToKey(val);
            keys.push(key);
            fluid.staticEnvironment[key] = fluid.typeTag(val);
            fluid.enhance.checked[key] = true;
            jqUnit.assertValue("The key '" + key + "', should exist in the static environment", fluid.staticEnvironment[key]);
            jqUnit.assertValue("The key '" + key + "', should exist in fluid.enhance.checked", fluid.enhance.checked[key]);
        });
        
        // Remove all checked keys
        fluid.enhance.forgetAll();
        
        // Verify that the checked keys have been removed
        fluid.each(keys, function (val) {
            jqUnit.assertNoValue("The key '" + val + "', should not exist in the static environment", fluid.staticEnvironment[val]);
            jqUnit.assertNoValue("The key '" + val + "', should not exist in fluid.enhance.checked", fluid.enhance.checked[val]);
        });
    });

})(jQuery);
