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

(function ($, fluid) {
    demo.initTableOfContent = function () {
        fluid.staticEnvironment.demo = fluid.typeTag("fluid.tableOfContentsDemo");   
        fluid.demands("fluid.tableOfContents.levels", ["fluid.tableOfContents", "fluid.tableOfContentsDemo"], {
            options: {
                resources: {
                    template: {
                        forceCache: true,
                        url: "../../../components/tableOfContents/html/TableOfContents.html"
                    }
                }
            }
        });
                   
        fluid.tableOfContents("body");
    };    
})(jQuery, fluid);
