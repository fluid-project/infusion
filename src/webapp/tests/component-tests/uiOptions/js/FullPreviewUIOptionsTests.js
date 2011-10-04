/*
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
        
        var tests = jqUnit.testCase("FullPreviewUIOptions Tests");
        
        /**************************************************
         * fluid.fullPreviewUIOptions Integration Tests *
         **************************************************/        
        fluid.tests.uiOptions.integrationTest(tests, "fluid.uiOptions.fullPreview", false);
        
        var testSettings = {
            textSize: "1.5",
            textFont: "verdana",
            theme: "bw",
            layout: false,
            toc: true,
            links: true
        };
        
        // TODO: we need MUCH better event boiling support in order to avoid rubbish like this
        var that, uiOptions;
        function testToCEnhancement(innerThat, uiOptionsLoader, innerUIOptions) {
            uiOptions = innerUIOptions;
        }
        
        function testToCEnhancement2() {
            fluid.tests.uiOptions.applierRequestChanges(uiOptions, testSettings);
            jqUnit.expect(1);
            // TODO: Very unsatisfactory - the TOC resources are the final thing we wait on, and the
            // event for this is very deeply buried
            setTimeout(function () {
                var container = uiOptions.preview.enhancerContainer;
                var links = $(".flc-toc-tocContainer a", container);
                jqUnit.assertTrue("ToC links created", links.length > 0); 
                start();
            }, 200);
        }
        
        that = fluid.tests.uiOptions.mungingIntegrationTest(tests, "fluid.uiOptions.fullPreview", "#myUIOptions", {
            preview: {
                options: {
                    templateUrl: "TestPreviewTemplate.html",
                    listeners: {
                        "onReady.toc2": {
                            listener: testToCEnhancement2,
                            priority: "last"
                        }
                    }
                }
            }
        }, testToCEnhancement);    
    });

})(jQuery);