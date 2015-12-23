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

var fluid_1_9 = fluid_1_9 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * Root Model                                                                  *
     *                                                                             *
     * Holds the default values for enactors and panel model values                *
     *******************************************************************************/

    fluid.defaults("fluid.prefs.initialModel", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        members: {
            // TODO: This information is supposed to be generated from the JSON
            // schema describing various preferences. For now it's kept in top
            // level prefsEditor to avoid further duplication.
            initialModel: {}
        }
    });

    /***********************************************
     * UI Enhancer                                 *
     *                                             *
     * Transforms the page based on user settings. *
     ***********************************************/

    fluid.defaults("fluid.uiEnhancer", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        invokers: {
            updateModel: {
                func: "{that}.applier.change",
                args: ["", "{arguments}.0"]
            }
        }
    });

    /********************************************************************************
     * PageEnhancer                                                                 *
     *                                                                              *
     * A UIEnhancer wrapper that concerns itself with the entire page.              *
     *                                                                              *
     * "originalEnhancerOptions" is a grade component to keep track of the original *
     * uiEnhancer user options                                                      *
     ********************************************************************************/
    fluid.defaults("fluid.pageEnhancer", {
        gradeNames: ["fluid.eventedComponent", "fluid.originalEnhancerOptions", "fluid.prefs.initialModel", "fluid.prefs.settingsGetter", "autoInit"],
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

})(jQuery, fluid_1_9);
