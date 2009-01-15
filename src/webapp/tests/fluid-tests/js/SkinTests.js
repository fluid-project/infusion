/* 
Copyright 2008-2009 University of California, Berkeley
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of Cambridge

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
        var tests = new jqUnit.TestCase("Skin Tests");
        
        tests.test("Remove Styling", function () {
            jqUnit.expect(8);

            jqUnit.assertEquals("Initially fluid classes are in the markup", 4, $(".fl-font-size-90").length);
            jqUnit.assertEquals("Initially fluid layout class is in the markup", 1, $(".fl-layout-default").length);
            jqUnit.assertEquals("Initially fluid theme class is in the markup", 1, $(".fl-theme-mist").length);
            fluid.skin.removeStyling($("#inner-div"));
            jqUnit.assertEquals("Fluid classes on and in the inner div have been removed", 1, $(".fl-font-size-90").length);
            jqUnit.assertEquals("Fluid layout class is gone", 0, $(".fl-layout-default").length);
            jqUnit.assertEquals("Fluid theme class is gone", 0, $(".fl-theme-mist").length);
            jqUnit.assertEquals("Things are still styled with 'first-class' ", 3, $(".first-class").length);
            jqUnit.assertEquals("Things are still styled with 'last-class' ", 2, $(".last-class").length);
        });

        tests.test("Remove Styling - dynamically added classes to the container", function () {
            jqUnit.expect(4);

            var main = $("#main");
            main.addClass("fl-blah");
            main.addClass("fl-blip");
            main.addClass("blop");
            
            fluid.skin.removeStyling(main);
            jqUnit.assertTrue("main has the container class", main.hasClass("container"));
            jqUnit.assertTrue("main has the blop class", main.hasClass("blop"));
            jqUnit.assertTrue("main has the fl-blah class", main.hasClass("fl-blah"));
            jqUnit.assertTrue("main has the fl-blip class", main.hasClass("fl-blip"));

        });

        tests.test("Style", function () {
            jqUnit.expect(4);

            var hcLargeFontSkin = {
                textSize: "+3",
                textFont: "Courier",
                textSpacing: "Wide",
                colorScheme: "High Contrast"
            };
            var main = $("#main");
            
            fluid.skin.style(hcLargeFontSkin, main);
            jqUnit.assertTrue("main has large text size class", main.hasClass("fl-font-size-130"));
            jqUnit.assertTrue("main has courier font class", main.hasClass("fl-font-monospace"));
            jqUnit.assertTrue("main has wide text spacing class", main.hasClass("fl-font-spacing-1"));
            jqUnit.assertTrue("main has high contrast class", main.hasClass("fl-theme-hc"));

        });
    });
})(jQuery);
