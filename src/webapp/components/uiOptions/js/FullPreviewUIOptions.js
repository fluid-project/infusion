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
        uiOptionsTransform: {
            config: {
                "!*.uiOptionsLoader.*.uiOptions.*.preview.*.enhancer.options": "outerPreviewEnhancerOptions",
                "*.uiOptionsLoader.*.uiOptions.*.preview":            "preview",
                "*.uiOptionsLoader.*.uiOptions.*.preview.*.enhancer": "previewEnhancer"
            }
        },
        outerPreviewEnhancerOptions:"{uiEnhancer}.options.originalUserOptions",
        derivedDefaults: {
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
            }
        }
    });
    
})(jQuery, fluid_1_5);