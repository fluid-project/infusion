/*
Copyright 2011 OCAD University

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
     
})(jQuery, fluid_1_4);