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
    $(document).ready(function () {
        var tests = new jqUnit.TestCase("SlidingPanel Tests");
        
        tests.test("Test Init", function () {
            expect(1);
            var slidingPanel = fluid.slidingPanel(".flc-slidingPanel");                    
            jqUnit.assertTrue("The sliding panel is initialised", slidingPanel);                      
        });

        tests.asyncTest("Show Panel", function () {
            expect(2);
            var slidingPanel = fluid.slidingPanel(".flc-slidingPanel");  
            slidingPanel.events.afterPanelShow.addListener(function () {
                jqUnit.assertEquals("Show panel", "block", slidingPanel.locate("panel").css("display"));                                                       
                jqUnit.assertEquals("Show panel button text", slidingPanel.options.strings.hideText, slidingPanel.locate("toggleButton").text());  
                start();
            });
            slidingPanel.showPanel();                                 
        });   
        
        tests.asyncTest("Hide Panel", function () {
            expect(2);
            var slidingPanel = fluid.slidingPanel(".flc-slidingPanel", {hideByDefault: false});
            
            slidingPanel.events.afterPanelHide.addListener(function () {
                jqUnit.assertEquals("Hide panel", "none", slidingPanel.locate("panel").css("display"));                      
                jqUnit.assertEquals("Hide panel button text", slidingPanel.options.strings.showText, slidingPanel.locate("toggleButton").text());    
                start();
            });
            
            slidingPanel.hidePanel();              
        });         
              

        tests.asyncTest("Toggle Panel Show", function () {
            expect(1);
            var slidingPanel = fluid.slidingPanel(".flc-slidingPanel");     
            
            slidingPanel.events.afterPanelShow.addListener(function () {
                jqUnit.assertEquals("Show panel via toggle", "block", slidingPanel.locate("panel").css("display"));                                                                                  
                start();            
            });
            
            slidingPanel.togglePanel();            
        });    

        tests.asyncTest("Toggle Panel Hide", function () {
            expect(1);
            var slidingPanel = fluid.slidingPanel(".flc-slidingPanel", {hideByDefault: false});         
            
            slidingPanel.events.afterPanelHide.addListener(function () {
                jqUnit.assertEquals("Hide panel via toggle", "none",  slidingPanel.locate("panel").css("display"));                                                                       
                start();    
            });
            
            slidingPanel.togglePanel();            
        });

    });
})(jQuery);


