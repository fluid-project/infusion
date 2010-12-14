/*
Copyright 2008-2010 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit, start, stop, window*/


fluid.registerNamespace("fluid.tests");

(function ($) {

    fluid.setLogging(true);

    fluid.tests.testView = function () {
 
        var fluidViewTests = new jqUnit.TestCase("Fluid View Tests");
      
        fluid.tests.blurTester = function (container, options) {
            var that = fluid.initView("fluid.tests.blurTester", container, options);
            return that;  
        };
     
        fluid.defaults("fluid.tests.blurTester", {
            selectors: {
                select: "select",
                input: "input",
                div: "#component-3"
            }
        });
      
        function blurTest(message, provokeTarget, provokeOp, shouldBlur, excludeMaker) { 
            fluidViewTests.test("Dead man's blur test - " + message, function () {
                var blurReceived = false;
                var blurTester = fluid.tests.blurTester("#blurrable-widget");
                var input = blurTester.locate("input");
             
                var blurHandler = function () {
                    if (!blurReceived) {
                        jqUnit.assertTrue("Blur handler should " + (shouldBlur ? "" : "not ") + "execute", shouldBlur);
                        blurReceived = true;
                        start();
                    }
                };
                var blurrer = fluid.deadMansBlur(input, {
                    delay: 200,
                    exclusions: excludeMaker(blurTester),
                    handler: blurHandler 
                });
                input.focus();
             
                var blurOutwaiter = function () {
                    jqUnit.assertFalse("Blur handler has not executed", shouldBlur && !blurReceived);
                    if (!blurReceived) {
                        start();
                    }  
                };
             
                input.blur();
                window.setTimeout(function () {
                    fluid.log("Apply " + provokeOp + " to " + provokeTarget);
                    blurTester.locate(provokeTarget)[provokeOp]();
                }, blurrer.options.delay - 100);
             
                window.setTimeout(blurOutwaiter, blurrer.options.delay + 100);
             
                stop();
            });
        }
     
        var selectExclusions = function (dom) {
            return {selection: dom.locate("select")};
        };

        var bothExclusions = function (dom) {
            return {
                selection: dom.locate("select"),
                div:  dom.locate("div")
            };
        };
     
        blurTest("nonExcluded component one", "div", "click", true, selectExclusions);
        blurTest("excluded component one", "select", "focus", false, selectExclusions);
     
        blurTest("excluded component two - a", "div", "click", false, bothExclusions);
        blurTest("excluded component two - b", "select", "focus", false, bothExclusions);
     
        fluidViewTests.test("ARIA labeller test", function () {
            var target = $("#component-3");
            var labeller = fluid.updateAriaLabel(target, "Label 1");
            var attr = target.attr("aria-label");
            jqUnit.assertValue("Target must be labelled", attr);
            jqUnit.assertEquals("Target label", "Label 1", attr);
            labeller.update({text: "Label 2"});
            jqUnit.assertEquals("Label updated", "Label 2", target.attr("aria-label"));
        });
    };
   
})(jQuery); 