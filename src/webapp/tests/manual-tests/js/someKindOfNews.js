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
        // First, start up Settings Store and Page Enhancer
        fluid.globalSettingsStore();
        fluid.pageEnhancer({
            gradeNames: ["fluid.uiEnhancer.starterEnactors"],
            classnameMap: {
                theme: {
                    "default": "skon-theme-basic"
                }
            },
            tocTemplate: "../../../components/tableOfContents/html/TableOfContents.html"
        });
        
        // Next, start up UI Options
        fluid.uiOptions.fatPanel(".flc-uiOptions-fatPanel", {
            gradeNames: ["fluid.uiOptions.transformDefaultPanelsOptions"],
            prefix: "../../../components/uiOptions/html/",
            templateLoader: {
                options: {
                    gradeNames: ["fluid.uiOptions.starterTemplateLoader"]
                }
            },
            uiOptions: {
                options: {
                    gradeNames: ["fluid.uiOptions.starterPanels", "fluid.uiOptions.rootModel.starter", "fluid.uiOptions.uiEnhancerRelay"]
                }
            },
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
