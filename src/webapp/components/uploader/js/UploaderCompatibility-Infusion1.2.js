/*
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

/**************************************************************************************
 * Note: this file should not be included in the InfusionAll build.                   *
 * Instead, users should add this file manually if backwards compatibility is needed. *
 **************************************************************************************/
 
(function (fluid) {
    
    fluid.registerNamespace("fluid.compat.fluid_1_2.uploader");
    fluid.staticEnvironment.uploader_1_2_Compatibility = fluid.typeTag("fluid.uploader.fluid_1_2");

    fluid.compat.fluid_1_2.uploader.optionsRules = {
        "components": {
            expander: {
                type: "fluid.model.transform.firstValue",
                values: [
                    {
                        expander: {
                            type: "fluid.model.transform.value",
                            path: "components"
                        }
                    },
                    {
                        expander: {
                            type: "fluid.model.transform.value",
                            value: {
                                "strategy": {
                                    "options": {
                                        "flashMovieSettings": {
                                            expander: {
                                                type: "fluid.model.transform.value",
                                                value: {
                                                    "flashURL": "uploadManager.options.flashURL",
                                                    "flashButtonPeerId": "decorators.0.options.flashButtonPeerId",
                                                    "flashButtonAlwaysVisible": "decorators.0.options.flashButtonAlwaysVisible",
                                                    "flashButtonTransparentEvenInIE": "decorators.0.options.flashButtonTransparentEvenInIE",
                                                    "flashButtonImageURL": "decorators.0.options.flashButtonImageURL",
                                                    "flashButtonCursorEffect": "decorators.0.options.flashButtonCursorEffect",
                                                    "debug": "decorators.0.options.debug"
                                                }
                                            }
                                        },
                                        "styles": "decorators.0.options.styles"
                                    }
                                },
                                "fileQueueView": "fileQueueView",
                                "totalProgressBar": "totalProgressBar"
                            }
                        }
                    }
                ]
            }
        },
        "queueSettings": {
            expander: {
                type: "fluid.model.transform.firstValue",
                values: ["queueSettings", "uploadManager.options"]
            }
        },
        "invokers": "invokers",
        "demo": "demo",
        "selectors": "selectors",
        "focusWithEvent": "focusWithEvent",
        "styles": "styles",
        "listeners": "listeners",
        "strings": "strings",
        "mergePolicy": "mergePolicy"
    };
    
    fluid.demands("fluid.uploader", "fluid.uploader.fluid_1_2", {
        mergeOptions: {
            transformOptions: {
                transformer: "fluid.model.transformWithRules",
                config: fluid.compat.fluid_1_2.uploader.optionsRules
            }
        }
    });
    
    fluid.uploader.transformOptions = function (options) {
        if (!options) {
            return;
        }
        
        options.transformOptions = {
            transformer: "fluid.model.transformWithRules",
            config: fluid.compat.fluid_1_2.uploader.optionsRules
        };
        
        return options;
    };
})(fluid_1_4);
