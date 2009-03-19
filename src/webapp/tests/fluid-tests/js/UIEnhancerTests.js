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
        var testSettings = {
            textSize: "18",
            textFont: "Courier",
            textSpacing: "Wide",
            theme: "High Contrast"
        };
        
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
                savedSettings: testSettings
            };
            var body = $("body");
            var uiEnhancer = fluid.uiEnhancer(null, options);

            jqUnit.assertEquals("Large text size is set", "18pt", body.css("fontSize"));
            jqUnit.assertTrue("Courier font is set", body.hasClass("fl-font-monospace"));
            jqUnit.assertTrue("Wide text spacing is set", body.hasClass("fl-font-spacing-1"));
            jqUnit.assertTrue("High contrast is set", body.hasClass("fl-theme-hc"));

        });
        
        tests.test("Cookie", function () {
            var store = fluid.uiEnhancer.cookieStore();
            store.save(testSettings);
            
            // Check that we get back the test settings correctly.
            var result = store.fetch();
            jqUnit.assertDeepEq("The settings are saved and retrieved correctly.", testSettings, result);
            
            // Change the results, save again. It should work again.
            var differentSettings = fluid.copy(testSettings);
            differentSettings.textSize = "32";
            store.save(differentSettings);
            jqUnit.assertEquals("Changed settings are saved correctly.", store.fetch().textSize, "32");
            
            // Let's go check the cookie directly and make sure it's there.
            var cookieNameIndex = document.cookie.indexOf(store.options.cookieName);
            jqUnit.assertTrue("Our cookie should be floating somewhere in the browser.",
                               cookieNameIndex >= 0);
            jqUnit.assertTrue("Our cookie should contain the textSize 32.",
                               document.cookie.indexOf("32") > cookieNameIndex);
                               
            // Now we can create a uiEnhancer and see that the textSize is set to 32
            var enhancer = fluid.uiEnhancer();
            jqUnit.assertEquals("The uiEnhancer should have a textSize of 32", "32", enhancer.model.textSize);
            
            // Reset the cookie settings
            store.save(enhancer.options.defaultSiteSettings);
            
        });

        tests.test("Temp store", function () {
            var store = fluid.uiEnhancer.tempStore();
            store.save(testSettings);
            
            // Check that we get back the test settings correctly.
            var result = store.fetch();
            jqUnit.assertDeepEq("The settings are saved and retrieved correctly.", testSettings, result);
            
            // Change the results, save again. It should work again.
            var differentSettings = fluid.copy(testSettings);
            differentSettings.textSize = "32";
            store.save(differentSettings);
            jqUnit.assertEquals("Changed settings are saved correctly.", "32", store.fetch().textSize);
            jqUnit.assertEquals("Theme was saved correctly.", "High Contrast", store.fetch().theme);
                                           
            // Now we can create a uiEnhancer and see that the theme is default not high contrast
            var enhancer = fluid.uiEnhancer();
            jqUnit.assertEquals("The uiEnhancer should have a default theme", "default", enhancer.model.theme);
            
        });

    });
})(jQuery);
