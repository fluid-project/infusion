/*
Copyright 2008-2009 University of Toronto
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, start, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        fluid.staticEnvironment.uiEnhancerTests = fluid.typeTag("fluid.uiOptions.uiEnhancerTests");

        var testSettings = {
            textSize: "1.5",
            textFont: "verdana",
            theme: "bw",
            layout: false,
            toc: true,
            links: true
        };
        
        var uiEnhancerOptions = {
            components: {
                settingsStore: {
                    type: "fluid.tempStore"
                }
            },
            tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
        };

        jqUnit.module("UI Enhancer Tests");
        
        jqUnit.test("Initialization", function () {
            jqUnit.expect(10);

            jqUnit.assertEquals("Initially font size classes exist", 3, $(".fl-font-size-90").length);
            jqUnit.assertEquals("Initially layout class exists", 3, $(".fl-layout-linear").length);
            jqUnit.assertEquals("Initially white on black class exists", 1, $(".fl-theme-wb").length);
            jqUnit.assertEquals("Initially font-sans class exists", 1, $(".fl-font-sans").length);
            jqUnit.assertEquals("Initially font-arial class exists", 1, $(".fl-font-arial").length);
            jqUnit.assertEquals("Initially text-spacing class exists", 1, $(".fl-font-spacing-3").length);

            fluid.pageEnhancer(uiEnhancerOptions);
            jqUnit.assertEquals("font size classes should not be removed", 3, $(".fl-font-size-90").length);
            jqUnit.assertEquals("FSS theme class has not been removed", 1, $(".fl-theme-wb").length);
            jqUnit.assertEquals("Things are still styled with 'first-class' ", 3, $(".first-class").length);
            jqUnit.assertEquals("Things are still styled with 'last-class' ", 2, $(".last-class").length);
        });

        jqUnit.asyncTest("Settings", function () {
            jqUnit.expect(5);

            var body = $("body");
            var initialFontSize = parseFloat(body.css("fontSize"));
            var refreshCount = 0;
            
            function testTocStyling() {
                var tocLinks = $(".flc-toc-tocContainer a");
                var filtered = tocLinks.filter(".fl-link-enhanced");
                ++refreshCount;
                if (refreshCount === 2) {
                    jqUnit.assertEquals("All toc links have been styled", tocLinks.length, filtered.length);
                    jqUnit.assertNotEquals("Some toc links generated on 2nd pass", 0, tocLinks.length);
                    jqUnit.start();
                }
            }
            
            var options = fluid.merge(null, {}, uiEnhancerOptions, {
                listeners: {
                    onTocReady: {
                        priority: "last",
                        listener: testTocStyling
                    }
                }
            });
            
            var uiEnhancer = fluid.pageEnhancer(options).uiEnhancer;
            uiEnhancer.updateModel(testSettings);
            
            var expectedTextSize = initialFontSize * testSettings.textSize;
            
            jqUnit.assertEquals("Large text size is set", expectedTextSize.toFixed(0) + "px", body.css("fontSize"));
            jqUnit.assertTrue("Verdana font is set", body.hasClass("fl-font-uio-verdana"));
            jqUnit.assertTrue("High contrast is set", body.hasClass("fl-theme-bw"));

        });
        
        jqUnit.test("Options munging", function () {
            jqUnit.expect(2);

            uiEnhancerOptions = {
                components: {
                    settingsStore: {
                        type: "fluid.tempStore"
                    }
                },
                tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html",
                classnameMap: {
                    "textFont": {
                        "default": "fl-font-times"
                    },
                    "theme": {
                        "yb": "fl-test"
                    }
                },
                defaultSiteSettings: {
                    theme: "yb"
                }
            };

            fluid.pageEnhancer(uiEnhancerOptions);

            var body = $("body");
                
            jqUnit.assertTrue("The initial times font is set correctly", body.hasClass("fl-font-times"));
            jqUnit.assertTrue("The initial test theme is set correctly", body.hasClass("fl-test"));
        });

        jqUnit.test("FLUID-4703: Line height unit", function () {
            var child1El = $(".flt-lineHeight-child-1em");
            var child2El = $(".flt-lineHeight-child-2em");

            var child1emHeight = child1El.height() - 1; // adjusted to account for rounding by jQuery
            var child2emHeight = child2El.height();
            jqUnit.assertTrue("The line height of the 2em child should be close to twice the size of the 1em child", 2*child1emHeight < child2emHeight);
        });

    });
})(jQuery);
