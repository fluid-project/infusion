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
            var tg = build.cssGenerator({
                sheetStore: build.cssGenerator.browserSheetStore($("#testTheme"))
            });
            tg.prioritize(prioritySpec);
            
            var actual = tg.generate();
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
            ".cat {" + "\n" +
            "  background-image: url(\"cats.png\");" + "\n" +
            "  font-size: 24px;" + "\n" +
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
            ".cat {" + "\n" +
            "  background-image: url(\"cats.png\");" + "\n" +
            "  font-size: 24px !important;" + "\n" +
            "}" + "\n";
            
            testStylesheetForPrioritySpec(priorities, expected, 
                "The generated style sheet should have !important added to all background colors and font sizes.");
        });
        
        tests.test("Prioritize one CSS property for a specific selector", function () {
            var priorities = {
                ".cat": "font-size"
            };
            
            var expected = "/* Comment */" + 
            "\n" +
            "table {" + "\n" +
            "  background-color: #dddddd;" + "\n" +
            "  font-size: 16px;" + "\n" +
            "}" + "\n" +
            ".cat {" + "\n" +
            "  background-image: url(\"cats.png\");" + "\n" +
            "  font-size: 24px !important;" + "\n" +
            "}" + "\n";
            
            testStylesheetForPrioritySpec(priorities, expected, 
                "The generated style sheet should have !important added only to the .cat rule.");
        });
    });
    
})(jQuery);
