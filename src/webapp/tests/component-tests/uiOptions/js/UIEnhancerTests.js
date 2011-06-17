/*
Copyright 2008-2009 University of Toronto

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
        
        var options = {
            settingsStore: {
                type: "fluid.uiEnhancer.tempStore"
            }
        };
        var tests = new jqUnit.TestCase("UI Enhancer Tests");
        
        tests.test("Initialization", function () {
            expect(13);

            jqUnit.assertEquals("Initially font size classes exist", 3, $(".fl-font-size-90").length);
            jqUnit.assertEquals("Initially layout class exists", 3, $(".fl-layout-linear").length);
            jqUnit.assertEquals("Initially mist class exists", 1, $(".fl-theme-hci").length);
            jqUnit.assertEquals("Initially font-sans class exists", 1, $(".fl-font-sans").length);
            jqUnit.assertEquals("Initially font-arial class exists", 1, $(".fl-font-arial").length);
            jqUnit.assertEquals("Initially text-spacing class exists", 1, $(".fl-font-spacing-3").length);
            fluid.pageEnhancer(options);
            jqUnit.assertEquals("font size classes should not be removed", 3, $(".fl-font-size-90").length);
            jqUnit.assertEquals("layout class is gone", 0, $(".fl-layout-linear").length);
            jqUnit.assertEquals("Fluid theme class is gone", 0, $(".fl-theme-hci").length);
            jqUnit.assertEquals("font comic sans class is gone", 0, $(".fl-font-comic-sans").length);
            jqUnit.assertEquals("arial class is not set", 0, $(".fl-font-arial").length);
            jqUnit.assertEquals("Things are still styled with 'first-class' ", 3, $(".first-class").length);
            jqUnit.assertEquals("Things are still styled with 'last-class' ", 2, $(".last-class").length);
        });

        tests.test("Settings", function () {
            expect(3);

            var body = $("body");
            var initialFontSize = parseFloat(body.css("fontSize"));
            
            var uiEnhancer = fluid.pageEnhancer(options).uiEnhancer;
            uiEnhancer.updateModel(testSettings);
            
            jqUnit.assertEquals("Large text size is set", initialFontSize * testSettings.textSize + "px", body.css("fontSize"));
            jqUnit.assertTrue("Verdana font is set", body.hasClass("fl-font-verdana"));
            jqUnit.assertTrue("High contrast is set", body.hasClass("fl-theme-hc"));

        });
        
        tests.test("Class Swapper", function () {
            var opts = {
                classes: {
                    "default": "",
                    "times": "fl-font-times",
                    "comic": "fl-font-comic-sans",
                    "arial": "fl-font-arial",
                    "verdana": "fl-font-verdana"
                }
            };
            var swapper = fluid.uiEnhancer.classSwapper(".flt-classSwapper", opts);
            
            jqUnit.assertEquals("There should be four classes", 4, swapper.classStr.split(" ").length);
            jqUnit.assertEquals("There should be four class selectors", 4, swapper.classSelector.split(", ").length);
            
            fluid.each(opts.classes, function (classname) {
                jqUnit.assertTrue("All class selectors should be in the combined selector, checking " + classname, swapper.classSelector.indexOf("." + classname) > -1);
                jqUnit.assertTrue("All classes should be in the classes string, checking " + classname, swapper.classStr.indexOf(classname) > -1);
            });
           
            jqUnit.assertTrue("The container has a font setting", swapper.container.is(swapper.classSelector));
            jqUnit.assertEquals("There is a font setting in the container", 1, $(swapper.classSelector, swapper.container).length);
            
            swapper.clearClasses();
            jqUnit.assertFalse("The container's font setting was removed", swapper.container.is(swapper.classSelector));
            jqUnit.assertEquals("There is no font setting in the container", 0, $(swapper.classSelector, swapper.container).length);
            
            swapper.swap("times");
            jqUnit.assertTrue("The container has a font setting of times", swapper.container.hasClass(opts.classes.times));
            jqUnit.assertEquals("There is no font setting in the container", 0, $(swapper.classSelector, swapper.container).length);
            
        });
        
    });
})(jQuery);
