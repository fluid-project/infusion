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
        jqUnit.module("SlidingPanel Tests");
        
        jqUnit.test("Test Init", function () {
            jqUnit.expect(1);
            var slidingPanel = fluid.slidingPanel(".flc-slidingPanel");                    
            jqUnit.assertTrue("The sliding panel is initialised", slidingPanel);                      
        });

        jqUnit.asyncTest("Show Panel", function () {
            jqUnit.expect(2);
            var slidingPanel = fluid.slidingPanel(".flc-slidingPanel");  
            slidingPanel.events.afterPanelShow.addListener(function () {
                jqUnit.assertEquals("Show panel", "block", slidingPanel.locate("panel").css("display"));                                                       
                jqUnit.assertEquals("Show panel button text", slidingPanel.options.strings.hideText, slidingPanel.locate("toggleButton").text());  
                jqUnit.start();
            });
            slidingPanel.showPanel();                                 
        });   
        
        jqUnit.asyncTest("Hide Panel", function () {
            jqUnit.expect(2);
            var slidingPanel = fluid.slidingPanel(".flc-slidingPanel", {model: {isShowing: true}});
            
            slidingPanel.events.afterPanelHide.addListener(function () {
                jqUnit.assertEquals("Hide panel", "none", slidingPanel.locate("panel").css("display"));                      
                jqUnit.assertEquals("Hide panel button text", slidingPanel.options.strings.showText, slidingPanel.locate("toggleButton").text());    
                jqUnit.start();
            });
            
            slidingPanel.hidePanel();              
        });         
              

        jqUnit.asyncTest("Toggle Panel Show", function () {
            jqUnit.expect(1);
            var slidingPanel = fluid.slidingPanel(".flc-slidingPanel");     
            
            slidingPanel.events.afterPanelShow.addListener(function () {
                jqUnit.assertEquals("Show panel via toggle", "block", slidingPanel.locate("panel").css("display"));                                                                                  
                jqUnit.start();            
            });
            
            slidingPanel.togglePanel();            
        });    

        jqUnit.asyncTest("Toggle Panel Hide", function () {
            jqUnit.expect(1);
            var slidingPanel = fluid.slidingPanel(".flc-slidingPanel", {model: {isShowing: true}});         
            
            slidingPanel.events.afterPanelHide.addListener(function () {
                jqUnit.assertEquals("Hide panel via toggle", "none",  slidingPanel.locate("panel").css("display"));                                                                       
                jqUnit.start();    
            });
            
            slidingPanel.togglePanel();            
        });

    });
})(jQuery);


