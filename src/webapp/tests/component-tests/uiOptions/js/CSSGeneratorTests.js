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
        
        var testStylesheetForPrioritySpec = function (prioritySpec, expected, msg) {
            testStylesheetForProcessSpec({
                type: fluid.build.cssGenerator.prioritize,
                options: prioritySpec
            }, expected, msg);
        };
        
        var testStylesheetForProcessSpec = function (processSpec, expected, msg) {
            var generator = fluid.build.cssGenerator({
                sheetStore: fluid.build.cssGenerator.browserSheetStore($("#testTheme"))
            });
            
            generator.processRules(processSpec);

            var actual = generator.generate();
            jqUnit.assertEquals(msg, expected, actual);
        };
        
        tests.test("Prioritize one CSS property for all rules", function () {
            var priorities = {
                "fluid-cssGenerator-allRules": "background-color"
            };
            
            var expected = "/* Comment */" + 
                "\n" +
                "table {" + "\n" +
                "  background-color: #dddddd !important;" + "\n" +
                "  font-size: 16px;" + "\n" +
                "}" + "\n" +
                ".cat a {" + "\n" +
                "  background-image: url(\"cats.png\");" + "\n" +
                "  font-size: 24px;" + "\n" +
                "}" + "\n" +
                "span {" + "\n" + 
                "  font-size: 12px;" + "\n" +
                "}" + "\n";
            
            testStylesheetForPrioritySpec(priorities, expected, 
                "The generated style sheet should have !important added to all background colors.");
        });
        
        
        tests.test("Prioritize multiple CSS properties for all rules", function () {
            var priorities = {
                "fluid-cssGenerator-allRules": ["background-color", "font-size"]
            };

            var expected = "/* Comment */" + 
                "\n" +
                "table {" + "\n" +
                "  background-color: #dddddd !important;" + "\n" +
                "  font-size: 16px !important;" + "\n" +
                "}" + "\n" +
                ".cat a {" + "\n" +
                "  background-image: url(\"cats.png\");" + "\n" +
                "  font-size: 24px !important;" + "\n" +
                "}" + "\n" +
                "span {" + "\n" + 
                "  font-size: 12px !important;" + "\n" +
                "}" + "\n";
            
            testStylesheetForPrioritySpec(priorities, expected, 
                "The generated style sheet should have !important added to all background colors and font sizes.");
        });
        
        tests.test("Prioritize one CSS property for a specific selector", function () {
            var priorities = {
                ".cat a": "font-size"
            };
            
            var expected = "/* Comment */" + 
                "\n" +
                "table {" + "\n" +
                "  background-color: #dddddd;" + "\n" +
                "  font-size: 16px;" + "\n" +
                "}" + "\n" +
                ".cat a {" + "\n" +
                "  background-image: url(\"cats.png\");" + "\n" +
                "  font-size: 24px !important;" + "\n" +
                "}" + "\n" +
                "span {" + "\n" + 
                "  font-size: 12px;" + "\n" +
                "}" + "\n";
            
            testStylesheetForPrioritySpec(priorities, expected, 
                "The generated style sheet should have !important added only to the .cat rule.");
        });
        
        tests.test("Namespace all selectors", function () {
            var classRewriteOptions = {
                match: "cat",
                replace: "fl-theme-cat"
            };
            
            var expected = "/* Comment */" + 
                "\n" +
                "table {" + "\n" +
                "  background-color: #dddddd;" + "\n" +
                "  font-size: 16px;" + "\n" +
                "}" + "\n" +
                ".fl-theme-cat a {" + "\n" +
                "  background-image: url(\"cats.png\");" + "\n" +
                "  font-size: 24px;" + "\n" +
                "}" + "\n" +
                "span {" + "\n" + 
                "  font-size: 12px;" + "\n" +
                "}" + "\n";
            
            testStylesheetForProcessSpec({
                type: fluid.build.cssGenerator.rewriteSelector,
                options: classRewriteOptions
            }, expected, "The .cat selector should be written as '.fl-theme-cat'.");
        });
        
    });
    
})(jQuery);
