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

    var peTests = jqUnit.TestCase("Progressive Enhancement");
    
    var checkerOptions = {
        defaultContextName: "food.carrots"
    };
    
    var invokeCheckerWithChecks = function (checks) {
        var options = fluid.expandOptions($.extend({}, checkerOptions, {checks: checks}), null);
        return fluid.progressiveChecker(options).typeName;
    };
    
    peTests.test("progressiveChecker", function () {        
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

})(jQuery);
