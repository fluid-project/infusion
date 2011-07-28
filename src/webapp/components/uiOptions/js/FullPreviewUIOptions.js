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
    /***************************
     * Full Preview UI Options *
     ***************************/
    fluid.demands("fluid.uiOptions.templateLoader", "fluid.uiOptions.fullPreviewUIOptions", {
        options: {
            templates: {
                uiOptions: "%prefixFullPreviewUIOptions.html"
            }
        }
    });
    
    // Options for UIOptions in full with preview mode
    fluid.demands("fluid.uiOptions", ["fluid.uiOptions.fullPreviewUIOptions"], {
        options: {
            components: {
                settingsStore: "{uiEnhancer}.settingsStore"
            }
        }
    });
    
    fluid.defaults("fluid.uiOptions.fullPreviewUIOptions", {
        gradeNames: ["fluid.uiOptions.inline"],
        container: "{fullPreviewUIOptions}.container"
    });       
    
    fluid.uiOptions.fullPreviewUIOptions = function (container, options) {
        // make "container" one of the options so it can be munged by the uiOptions.mapOptions.
        // This container is passed down to be used as uiOptionsLoader.container 
        var mapping = fluid.defaults("fluid.uiOptions.fullPreviewUIOptions").uiOptionsTransform.config;
        options.container = container;
        
        var mappedOptions = fluid.uiOptions.mapOptions(options, mapping);
        var that = fluid.initView("fluid.uiOptions.fullPreviewUIOptions", container, mappedOptions);
        fluid.initDependents(that);
        return that;
    };

})(jQuery, fluid_1_4);