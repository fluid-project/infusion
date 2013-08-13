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

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    /*******************************************************************************
     * Root Model                                                                  *
     *                                                                             *
     * Holds the default values for enactors and panel model values                *
     *******************************************************************************/

    fluid.defaults("fluid.uiOptions.rootModel", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        members: {
            // TODO: This information is supposed to be generated from the JSON
            // schema describing various preferences. For now it's kept in top
            // level uiOptions to avoid further duplication.
            rootModel: {}
        }
    });

    /*******************************************************************************
     * UI Enhancer                                                                 *
     *                                                                             *
     * Works in conjunction with FSS to transform the page based on user settings. *
     *******************************************************************************/

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
        gradeNames: ["fluid.eventedComponent", "fluid.originalEnhancerOptions", "fluid.uiOptions.rootModel", "fluid.uiOptions.settingsGetter", "autoInit"],
        components: {
            uiEnhancer: {
                type: "fluid.uiEnhancer",
                container: "body"
            }
        },
        distributeOptions: {
            source: "{that}.options.uiEnhancer",
            target: "{that > uiEnhancer}.options"
        },
        invokers: {
            init: {
                funcName: "fluid.pageEnhancer.init",
                args: "{that}"
            }
        },
        listeners: {
            onCreate: [{
                listener: "{that}.init"
            }]
        }
    });

    fluid.pageEnhancer.init = function (that) {
        that.options.originalUserOptions = $.extend(true, that.uiEnhancer.options, fluid.copy(that.options.uiEnhancer));
        fluid.staticEnvironment.originalEnhancerOptions = that;
        that.uiEnhancer.updateModel(that.getSettings());
        fluid.staticEnvironment.uiEnhancer = that.uiEnhancer;
    };

})(jQuery, fluid_1_5);
