/*
Copyright 2009 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * Root Model                                                                  *
     *                                                                             *
     * Holds the default values for enactors and panel model values                *
     *******************************************************************************/

    fluid.defaults("fluid.prefs.rootModel", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        members: {
            // TODO: This information is supposed to be generated from the JSON
            // schema describing various preferences. For now it's kept in top
            // level prefsEditor to avoid further duplication.
            rootModel: {}
        }
    });

    /***********************************************
     * UI Enhancer                                 *
     *                                             *
     * Transforms the page based on user settings. *
     ***********************************************/

    fluid.defaults("fluid.uiEnhancer", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        invokers: {
            updateModel: {
                funcName: "fluid.uiEnhancer.updateModel",
                args: ["{arguments}.0", "{uiEnhancer}.applier"]
            }
        }
    });

    fluid.uiEnhancer.updateModel = function (newModel, applier) {
        applier.requestChange("", newModel);
    };

    /********************************************************************************
     * PageEnhancer                                                                 *
     *                                                                              *
     * A UIEnhancer wrapper that concerns itself with the entire page.              *
     *                                                                              *
     * "originalEnhancerOptions" is a grade component to keep track of the original *
     * uiEnhancer user options                                                      *
     ********************************************************************************/
     
    fluid.defaults("fluid.pageEnhancer", {
        gradeNames: ["fluid.eventedComponent", "fluid.originalEnhancerOptions",
            "fluid.prefs.rootModel", "fluid.prefs.settingsGetter",
            "fluid.resolveRoot", "autoInit"],
        distributeOptions: {
            source: "{that}.options.uiEnhancer",
            target: "{that > uiEnhancer}.options"
        },
        components: {
            uiEnhancer: {
                type: "fluid.uiEnhancer",
                options: {
                    gradeNames: "fluid.resolveRoot"
                },
                container: "body"
            }
        },
        members: {
            originalUserOptions: "{uiEnhancer}.options"
        },
        listeners: {
            "onCreate.initModel": "fluid.pageEnhancer.init"
        }
    });
    
    // TODO: It is likely that "originalUserOptions" is now unnecessary
    // Note that the original implementation in fact never succeeded in avoiding 
    // to distribute defaults in any case

    fluid.pageEnhancer.init = function (that) {
        that.uiEnhancer.updateModel(that.getSettings());
    };

})(jQuery, fluid_2_0);
