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
        
        tests.test("Prioritize one CSS property", function () {
            var tg = build.cssGenerator({
                sheetStore: build.cssGenerator.browserSheetStore($("#testTheme"))
            });
            tg.prioritize("background-color");
            
            var expected = "/* Comment */" + 
            "\n" +
            "table {" + "\n" +
            "  background-color: #dddddd !important;" + "\n" +
            "}" + "\n" +
            ".cat {" + "\n" +
            "  background-image: url(\"cats.png\");" + "\n" +
            "}" + "\n";
            var actual = tg.generate();
            jqUnit.assertEquals("The generated style sheet should have !important added to all background colors.",
                expected, actual);
        });

    });
    
})(jQuery);
