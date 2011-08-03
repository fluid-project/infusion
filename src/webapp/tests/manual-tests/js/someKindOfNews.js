/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global skon:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var skon = skon || {};
(function ($, fluid) {
	
    /* Our demo script */   
    skon.slidingUIOptions = function (panel, uioptions) {
        // First, start up Page Enhancer
        fluid.pageEnhancer({
            classnameMap: {
                theme: {
                    "default": "skon-theme-basic"
                }
            },
            tocTemplate: "../../../components/tableOfContents/html/TableOfContents.html"
        });
        
        // Next, start up UI Options
        fluid.uiOptions.fatPanel(".flc-uiOptions-fatPanel", {
            prefix: "../../../components/uiOptions/html/",
            markupRenderer: {
                options: {
                    markupProps: {
                        src: "../../../components/uiOptions/html/FatPanelUIOptionsFrame.html"
                    }
                }
            }
        });
    };
    
})(jQuery, fluid);
