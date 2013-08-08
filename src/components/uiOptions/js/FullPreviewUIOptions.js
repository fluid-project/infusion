/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    /***************************
     * Full Preview UI Options *
     ***************************/

    fluid.defaults("fluid.uiOptions.fullPreview", {
        gradeNames: ["fluid.uiOptions.inline", "autoInit"],
        container: "{fullPreview}.container",
        outerPreviewEnhancerOptions: "{originalEnhancerOptions}.options.originalUserOptions",
        templateLoader: {
            options: {
                templates: {
                    uiOptions: "%prefix/FullPreviewUIOptions.html"
                }
            }
        },
        uiOptions: {
            options: {
                components: {
                    preview: {
                        type: "fluid.uiOptions.preview",
                        createOnEvent: "onUIOptionsComponentReady",
                        container: "{uiOptions}.dom.previewFrame"
                    }
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.outerPreviewEnhancerOptions",
            removeSource: true,
            target: "{that enhancer}.options"
        }, {
            source: "{that}.options.preview.options",
            target: "{that preview}.options"
        }, {
            source: "{that}.options.previewEnhancer.options",
            removeSource: true,
            target: "{that enhancer}.options"
        }]
    });
    
})(jQuery, fluid_1_5);