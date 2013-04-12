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
        var uiEnhancerOptions = {
            components: {
                settingsStore: {
                    type: "fluid.tempStore"
                }
            },
            tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
        };

        jqUnit.module("Page Enhancer Tests");
        
        jqUnit.test("UIEnhancer options passing", function () {
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

    });
})(jQuery);
