/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global uioDemo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var uioDemo = uioDemo || {};
(function ($, fluid) {       

    /* Our demo script */   
    uioDemo.slidingUIOptions = function (panel, uioptions) {

        fluid.pageEnhancer({
            // Supply the table of contents' template URL
            tocTemplate: "../../../components/tableOfContents/html/TableOfContents.html",
            classnameMap: {
                theme: {
                    "default": "uio-demo-theme"
                }
            }
        });
        
        // Next, start up UI Options
        fluid.uiOptions.fatPanel(".flc-uiOptions-fatPanel", {
            prefix: "../../../components/uiOptions/html/"
        });

        $(".disp-opts-with-preview").click(function(){
           window.location = "uiOptionsFullWithPreview.html";
       });
        $(".disp-opts-without-preview").click(function(){
           window.location = "uiOptionsFullWithoutPreview.html";
       });
    };
    
})(jQuery, fluid);
