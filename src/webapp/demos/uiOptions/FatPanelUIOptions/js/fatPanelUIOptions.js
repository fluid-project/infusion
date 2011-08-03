/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */
var demo = demo || {};
(function ($) {
    demo.init = function () {
        fluid.pageEnhancer({
            tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
        });

        fluid.uiOptions.fatPanel(".flc-uiOptions-fatPanel", {
            // Note that the path provided in the "prefix" option is the relative path from 
            // the location of UI Options templates to the iFrame whose location is provided 
            // below in markupRenderer.options.markupProps.src
            prefix: "./",
            markupRenderer: {
                options: {
                    markupProps: {
                        src: "../../../../components/uiOptions/html/FatPanelUIOptionsFrame.html"
                    }
                }
            }
        });
    };
})(jQuery);