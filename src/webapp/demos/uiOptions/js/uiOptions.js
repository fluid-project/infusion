/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2010 University of Toronto
Copyright 2008-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};
(function ($, fluid) {

    // Places UI Options into a sliding panel, which can be controlled by a button.
    var slidingPanel = function (uiOptions, button) {
        var slideUp = function () {
            uiOptions.container.slideUp();
        };
        
        // Bind listeners to UIOptions save & cancel events, sliding the panel up.
        uiOptions.events.onCancel.addListener(slideUp);
        uiOptions.events.onSave.addListener(slideUp);
        
        // Bind listeners to show and hide the panel when the button is clicked.
        button.click(function () {
            if (uiOptions.container.is(":hidden")) {
                uiOptions.container.slideDown();
            } else {
                uiOptions.container.slideUp();
                uiOptions.cancel();
            }
            return false;
        });
            
        // Hide the panel to start.
        uiOptions.container.hide();
    };
    
    demo.slidingUIOptions = function (container, button) {
        // First, initialize a UIEnhancer for the page
        var pageEnhancer = fluid.uiEnhancer(document, {
            defaultSiteSettings: {
                theme: "mist",
                linksBold: true,
                linksUnderline: true
            },
            tableOfContents: {
                options: {
                    templateUrl: "../../../components/tableOfContents/html/TableOfContents.html"
                }
            
            }
        });
        
        // Next, start up UI Options
        var myUIOptions = fluid.uiOptions(container, {
            templateUrl: "../../../components/uiOptions/html/UIOptions.html"
        });

        // Put it in the sliding panel.
        slidingPanel(myUIOptions, button);
    };
    
})(jQuery, fluid);
