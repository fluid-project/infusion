/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        var testSettings = {
            textSize: "1.5",
            textFont: "verdana",
            theme: "bw",
            layout: false
        };
        
        var tests = new jqUnit.TestCase("Store Tests");
                
        tests.test("Cookie", function () {
            var store = fluid.cookieStore();
            store.save(testSettings);
            
            // Check that we get back the test settings correctly.
            var result = store.fetch();
            jqUnit.assertDeepEq("The settings are saved and retrieved correctly.", testSettings, result);
            
            // Change the results, save again. It should work again.
            var differentSettings = fluid.copy(testSettings);
            differentSettings.textSize = "2";
            store.save(differentSettings);
            jqUnit.assertEquals("Changed settings are saved correctly.", store.fetch().textSize, "2");
            
            // Let's go check the cookie directly and make sure it's there.
            var cookieNameIndex = document.cookie.indexOf(store.options.cookieName);
            jqUnit.assertTrue("Our cookie should be floating somewhere in the browser.",
                               cookieNameIndex >= 0);
            jqUnit.assertTrue("Our cookie should contain the textSize 2.",
                               document.cookie.indexOf("2") > cookieNameIndex);
                                           
            // Reset the cookie settings
            store.save(store.options.defaultSiteSettings);
            
        });

        tests.test("Temp store", function () {
            var store = fluid.tempStore();
            store.save(testSettings);
            
            // Check that we get back the test settings correctly.
            var result = store.fetch();
            jqUnit.assertDeepEq("The settings are saved and retrieved correctly.", testSettings, result);
            
            // Change the results, save again. It should work again.
            var differentSettings = fluid.copy(testSettings);
            differentSettings.textSize = "32";
            store.save(differentSettings);
            jqUnit.assertEquals("Changed settings are saved correctly.", "32", store.fetch().textSize);
            jqUnit.assertEquals("Theme was saved correctly.", "bw", store.fetch().theme);
            
        });

    });
})(jQuery);
