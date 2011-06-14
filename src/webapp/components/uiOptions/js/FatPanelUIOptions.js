/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {    
    /**********************
     * Fat Panel UI Options *
     *********************/
     
    fluid.defaults("fluid.fatPanelUIOptions", {
        gradeNames: ["fluid.viewComponent", "autoInit"],            
        components: {
            uiOptions: {
                type: "fluid.uiOptions",
                container: ".flc-slidingPanel-panel"
            },        
            slidingPanel: {
                type: "fluid.slidingPanel",
                priority: "last",
                container: "{fatPanelUIOptions}.container"
            }
        }
    });       
    
    // Options for UIOptions in fat panel mode
    fluid.demands("fluid.uiOptions", ["fluid.fatPanelUIOptions"], {
        options: {
            components: {
                preview: {
                    type: "fluid.uiOptions.livePreview"
                },
                tabs: {
                    type: "fluid.tabs",
                    container: "{fatPanelUIOptions}.container",      
                    createOnEvent: "onReady"               
                },
                settingsStore: "{uiEnhancer}.settingsStore"
            },    
            autoSave: true
        }
    });      
     
    // Supply the templates for the demo
    fluid.demands("fluid.uiOptionsTemplateLoader", "fluid.uiOptionsDemo", {
        options: {
            templates: {
                uiOptions: "../../../../components/uiOptions/html/FatPanelUIOptions.html",
                textControls: "../../../../components/uiOptions/html/UIOptionsTemplate-text.html",
                layoutControls: "../../../../components/uiOptions/html/UIOptionsTemplate-layout.html",
                linksControls: "../../../../components/uiOptions/html/UIOptionsTemplate-links.html"
            }
        }
    });

    // Supply the table of contents' template URL
    fluid.demands("fluid.tableOfContents", ["fluid.uiEnhancer"], {
        options: {
            templateUrl: "../../../../components/tableOfContents/html/TableOfContents.html"
        }
    });     
  
})(jQuery, fluid_1_4);