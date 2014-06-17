/*
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

/**************************************************************************************
 * Note: this file should not be included in the InfusionAll build.                   *
 * Instead, users should add this file manually if backwards compatibility is needed. *
 **************************************************************************************/

(function (fluid) {
    "use strict";

    fluid.registerNamespace("fluid.compat.fluid_1_2.uploader");

    fluid.enhance.check({"fluid.uploader.fluid_1_2" : true});

    fluid.compat.fluid_1_2.uploader.optionsRules = {
        "components": {
            transform: [
                {
                    type: "fluid.transforms.value",
                    inputPath: "components",
                    outputPath: "",
                    merge: true
                },
                {
                    type: "fluid.transforms.value",
                    outputPath: "",
                    merge: true,
                    value: {
                        "strategy": {
                            "options": {
                                "styles": "decorators.0.options.styles"
                            }
                        },
                        "fileQueueView": "fileQueueView",
                        "totalProgressBar": "totalProgressBar"
                    }
                }
            ]
        },
        "queueSettings": {
            transform: {
                type: "fluid.transforms.firstValue",
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
        options: fluid.transformOne(fluid.compat.fluid_1_2.uploader.optionsRules)
    });

})(fluid_2_0);
