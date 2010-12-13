/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit*/

(function ($) {

    var peTests = jqUnit.TestCase("Progressive Enhancement");
    
    var checkerOptions = {
        defaultTypeTag: fluid.typeTag("food.carrots")
    };
    
    var invokeCheckerWithChecks = function (checks) {
        checkerOptions.checks = checks;
        
        fluid.demands("fluid.progressiveChecker", "fluid.progressiveChecker.tests", {
            funcName: "fluid.progressiveChecker",
            args: [checkerOptions]
        });
        
        return fluid.invoke("fluid.progressiveChecker", null, fluid.typeTag("fluid.progressiveChecker.tests"));
    };
    
    peTests.test("progressiveChecker", function () {        
        // No checks at all
        var result = invokeCheckerWithChecks([]);
        jqUnit.assertDeepEq("No checks, the default type tag should be returned.", 
                            fluid.typeTag("food.carrots"), result);
        
        // Single specified context, and it should match.
        fluid.staticEnvironment.cat = fluid.typeTag("animal.cat");
        result = invokeCheckerWithChecks([{
            "feature": "{animal.cat}", 
            "contextName": "food.fancyFeast"
        }]);
        jqUnit.assertDeepEq("One matching features, should return the correct context name.", 
                            fluid.typeTag("food.fancyFeast"), result);
        
        // Two contexts, both match, first should be returned.
        fluid.staticEnvironment.dog = fluid.typeTag("animal.dog");
        result = invokeCheckerWithChecks([{
            "feature": "{animal.cat}", 
            "contextName": "food.fancyFeast"
        }, {
            "feature": "{animal.dog}", 
            "contextName": "food.iams"
        }]);
        jqUnit.assertDeepEq("Both features match, so the first contextName should be returned.", 
                            fluid.typeTag("food.fancyFeast"), result);
        
        // Two contexts, second should match.
        result = invokeCheckerWithChecks([{
            "feature": "{animal.hamster}", 
            "contextName": "food.fancyFeast"
        }, {
            "feature": "{animal.dog}", 
            "contextName": "food.iams"
        }]);
        jqUnit.assertDeepEq("First feature doesn't match, second feature should match and return the correct context name.", 
                            fluid.typeTag("food.iams"), result);
        
        // Two contexts, none match.
        result = invokeCheckerWithChecks([{
            "feature": "{animal.gerbil}", 
            "contextName": "food.celery"
        }, {
            "feature": "{animal.crocodile}", 
            "contextName": "food.arm"
        }]);
        jqUnit.assertDeepEq("Neither feature matches, default value should be returned.", 
                            fluid.typeTag("food.carrots"), result);
    });

})(jQuery);
