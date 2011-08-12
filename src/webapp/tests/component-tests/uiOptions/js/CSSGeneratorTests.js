/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(function () {
        var tests = new jqUnit.TestCase("CSSGenerator Tests");
        var expectedArray = ["/* Comment */",
                        "table {",
                        "  background-color: #dddddd;",
                        "  font-size: 16px;",
                        "}",
                        ".cat a {",
                        "  background-image: url('cats.png');",
                        "  font-size: 24px;",
                        "}",
                        "span {" ,
                        "  font-size: 12px;",
                        "  /* Setting font size */",
                        "}",
                        ".sheep {" ,
                        "  cue-before: url('http://sheep.org');",
                        "  cue-after: url('http://sheep.org');",
                         "}\n"];

        var buildExpected = function (expectedArray) {
            return expectedArray.join("\n");
        };
        
        var testStylesheetForPrioritySpec = function (prioritySpec, expectedArray, msg) {
            testStylesheetForProcessSpec({
                type: fluid.build.cssGenerator.prioritize,
                options: prioritySpec
            }, expectedArray, msg);
        };
        
        var testStylesheetForProcessSpec = function (processSpec, expectedArray, msg) {
            var generator = fluid.build.cssGenerator({
                sheetStore: fluid.build.cssGenerator.browserSheetStore($("#testTheme"))
            });
            
            generator.processRules(processSpec);

            var actual = generator.generate();
            jqUnit.assertEquals(msg, buildExpected(expectedArray), actual);
        };
        
        tests.test("No modifications", function () {
            testStylesheetForProcessSpec(null, expectedArray, "The stylesheet should not be modified");
        });
        
        tests.test("Prioritize one CSS property for all rules", function () {
            var priorities = {
                "fluid-cssGenerator-allRules": "background-color"
            };
            
            var expected = jQuery.extend([], expectedArray);
            expected[2] = "  background-color: #dddddd !important;";

            testStylesheetForPrioritySpec(priorities, expected, 
                "The generated style sheet should have !important added to all background colors.");
        });
        
        
        tests.test("Prioritize multiple CSS properties for all rules", function () {
            var priorities = {
                "fluid-cssGenerator-allRules": ["background-color", "font-size"]
            };

            var expected = jQuery.extend([], expectedArray);
            expected[2] = "  background-color: #dddddd !important;";
            expected[3] = "  font-size: 16px !important;";
            expected[7] = "  font-size: 24px !important;";
            expected[10] = "  font-size: 12px !important;";
            
            testStylesheetForPrioritySpec(priorities, expected, 
                "The generated style sheet should have !important added to all background colors and font sizes.");
        });
        
        tests.test("Prioritize one CSS property for a specific selector", function () {
            var priorities = {
                ".cat a": "font-size"
            };
            
            var expected = jQuery.extend([], expectedArray);
            expected[7] = "  font-size: 24px !important;";
            
            testStylesheetForPrioritySpec(priorities, expected, 
                "The generated style sheet should have !important added only to the .cat rule.");
        });
        
        tests.test("Namespace all selectors", function () {
            var classRewriteOptions = {
                match: "cat",
                replace: "fl-theme-cat"
            };
            
            var expected = jQuery.extend([], expectedArray);
            expected[5] = ".fl-theme-cat a {";
            
            testStylesheetForProcessSpec({
                type: fluid.build.cssGenerator.rewriteSelector,
                options: classRewriteOptions
            }, expected, "The .cat selector should be written as '.fl-theme-cat'.");
        });

        tests.test("Rewrite Relative URLs", function () {
            var prefix = "../../../../framework/fss/css/";
            
            var opts = {
                prefix: prefix
            };
            
            var expected = jQuery.extend([], expectedArray);
            expected[6] = "  background-image: url('" + prefix + "cats.png');";

            testStylesheetForProcessSpec({
                type: fluid.build.cssGenerator.rewriteRelativeUrls,
                options: opts
            }, expected, "The urls should be rewritten");
            
        });

    });
    
})(jQuery);
