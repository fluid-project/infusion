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

    fluid.staticEnvironment.skonEnvironment = fluid.typeTag("skon.demo");

    /* Our demo script */   
    skon.slidingUIOptions = function (panel, uioptions) {
        fluid.demands("fluid.uiOptionsTemplatePath", [ "skon.demo"], {
            options: {
                prefix: "../../../components/uiOptions/html/"
            }
        });

        // Supply the table of contents' template URL
        fluid.demands("fluid.tableOfContents", ["fluid.uiEnhancer", "skon.demo"], {
            options: {
                templateUrl: "../../../components/tableOfContents/html/TableOfContents.html"
            }
        });

        fluid.pageEnhancer({
            classnameMap: {
                theme: {
                    "default": "skon-theme-basic"
                }
            }
        });
        
        // Next, start up UI Options
        fluid.fatPanelUIOptions(".flc-uiOptions-fatPanel");            
    };
    
})(jQuery, fluid);
