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
                "!*.uiOptionsLoader.*.uiOptions.*.preview.*.enhancer.options": "outerPreviewEnhancerOptions"
            }
        },
        derivedDefaults: {
            templateLoader: {
                options: {
                    templates: {
                        uiOptions: "%prefix/FullPreviewUIOptions.html"
                    }
                }
            }
        }
    });
    
    fluid.uiOptions.inline.makeCreator("fluid.uiOptions.fullPreview", function (options) {
        // This is a terrible hack for FLUID-4409. Since it is impossible for us to be invoked via IoC, the only
        // source of this configuration could be the static pageEnhancer
        // The correct way to resolve the problem is to refactor UIEnhancer so that all of its configuration other than
        // the container to be bound to be enhanced is kept in a separate, shared component, "UIEnhancerConfig".
        var enhancerOptions = fluid.get(fluid, "staticEnvironment.uiEnhancer.options.originalUserOptions");
        options.outerPreviewEnhancerOptions = enhancerOptions;
        return options;
    });
    
})(jQuery, fluid_1_4);