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

    fluid.staticEnvironment.uioDemoEnvironment = fluid.typeTag("uioDemo.demo");

    /* Our demo script */   
    uioDemo.slidingUIOptions = function (panel, uioptions) {
        fluid.demands("fluid.uiOptions.templatePath", ["fluid.fatPanelUIOptions", "uioDemo.demo"], {
            options: {
                value: "{fatPanelUIOptions}.options.prefix"
            }
        });

        fluid.demands("fluid.renderIframe", ["uioDemo.demo"], {
            options: {
                markupProps: {
                    src: "../../../components/uiOptions/html/FatPanelUIOptionsFrame.html"
                }
            }
        });
    
        // Supply the table of contents' template URL
        fluid.demands("fluid.tableOfContents.levels", ["fluid.tableOfContents", "uioDemo.demo"], {
            options: {
                resources: {
                    template: {
                        forceCache: true,
                        url: "../../../components/tableOfContents/html/TableOfContents.html"
                    }
                }
            }
        });

        fluid.pageEnhancer({
            classnameMap: {
                theme: {
                    "default": "uio-demo-theme"
                }
            }
        });
        
        // Next, start up UI Options
        fluid.fatPanelUIOptions(".flc-uiOptions-fatPanel", {
            prefix: "../../../../components/uiOptions/html/"
        });            
    };
    
})(jQuery, fluid);
