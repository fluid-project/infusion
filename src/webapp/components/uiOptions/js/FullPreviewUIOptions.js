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

    fluid.defaults("fluid.uiOptions.fullPreview", {
        gradeNames: ["fluid.uiOptions.inline"],
        container: "{fullPreview}.container",
        uiOptionsTransform: {
            config: {
                "*.templateLoader": {
                    options: {
                        templates: {
                            uiOptions: "%prefixFullPreviewUIOptions.html"
                        }
                    }
                },
                "*.uiOptionsLoader.*.uiOptions": {
                    options: {
                        components: {
                            settingsStore: "{uiEnhancer}.settingsStore"
                        }
                    }
                }
            }
        }
    });
    
    fluid.uiOptions.fullPreview = function (container, options) {
        // make "container" one of the options so it can be munged by the uiOptions.mapOptions.
        // This container is passed down to be used as uiOptionsLoader.container 
        var componentConfig = fluid.defaults("fluid.uiOptions.fullPreview").uiOptionsTransform.config;
        var mergePolicy = fluid.defaults("fluid.uiOptions.fullPreview").mergePolicy;
        options.container = container;
        
        var mappedOptions = fluid.uiOptions.mapOptions(options, componentConfig, mergePolicy);
        var that = fluid.initView("fluid.uiOptions.fullPreview", container, mappedOptions);
        fluid.initDependents(that);
        return that;
    };

})(jQuery, fluid_1_4);