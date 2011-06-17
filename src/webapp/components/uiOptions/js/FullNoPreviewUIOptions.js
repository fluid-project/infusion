/*
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
     * Full No Preview UI Options *
     *********************/
     
    fluid.defaults("fluid.fullNoPreviewUIOptions", {
        gradeNames: ["fluid.viewComponent", "autoInit"],            
        components: {
            uiOptions: {
                type: "fluid.uiOptions",
                container: "{fullNoPreviewUIOptions}.container"
            }                     
        }
    });       
    
    // Options for UIOptions in fat panel mode
    fluid.demands("fluid.uiOptions", ["fluid.fullNoPreviewUIOptions"], {
        options: {
            components: {
                preview: {
                    type: "fluid.emptySubcomponent"
                },
                settingsStore: "{uiEnhancer}.settingsStore"
            }
        }
    });      
     
})(jQuery, fluid_1_4);