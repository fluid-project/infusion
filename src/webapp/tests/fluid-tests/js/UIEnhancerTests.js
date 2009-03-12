/* 
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit*/


(function ($) {
    $(document).ready(function () {
        var tests = new jqUnit.TestCase("UI Enhancer Tests");
        
        tests.test("Initialization", function () {
            expect(8);

            jqUnit.assertEquals("Initially fluid classes are in the markup", 4, $(".fl-font-size-90").length);
            jqUnit.assertEquals("Initially fluid layout class is in the markup", 1, $(".fl-layout-default").length);
            jqUnit.assertEquals("Initially fluid theme class is in the markup", 1, $(".fl-theme-mist").length);
            var uiEnhancer = fluid.uiEnhancer();
            jqUnit.assertEquals("Fluid classes have been removed", 0, $(".fl-font-size-90").length);
            jqUnit.assertEquals("Fluid layout class is gone", 0, $(".fl-layout-default").length);
            jqUnit.assertEquals("Fluid theme class is gone", 0, $(".fl-theme-mist").length);
            jqUnit.assertEquals("Things are still styled with 'first-class' ", 3, $(".first-class").length);
            jqUnit.assertEquals("Things are still styled with 'last-class' ", 2, $(".last-class").length);
        });

        tests.test("Settings", function () {
            expect(4);

            var options = {
                settings: {
                    textSize: "18",
                    textFont: "Courier",
                    textSpacing: "Wide",
                    theme: "High Contrast"
                }
            };
            var body = $("body");
            var uiEnhancer = fluid.uiEnhancer(document, options);

            jqUnit.assertEquals("main has large text size", "18pt", body.css("fontSize"));
            jqUnit.assertTrue("main has courier font class", body.hasClass("fl-font-monospace"));
            jqUnit.assertTrue("main has wide text spacing class", body.hasClass("fl-font-spacing-1"));
            jqUnit.assertTrue("main has high contrast class", body.hasClass("fl-theme-hc"));

        });
    });
})(jQuery);
