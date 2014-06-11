/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_1_5 = fluid_1_5 || {};
(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.uiOptions");

    // A grade to distribute TOC template
    fluid.defaults("fluid.uiOptions.distributeTocTemplate", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        distributeOptions: {
            source: "{that}.options.tocTemplate",
            removeSource: true,
            target: "{that uiEnhancer}.options.tocTemplate"
        },
        enhancer: {
            distributeOptions: {
                source: "{that}.options.tocTemplate",
                removeSource: true,
                target: "{that > fluid.prefs.enactor.tableOfContents}.options.tocTemplate"
            }
        }
    });

    // Gradename to invoke "fluid.uiOptions.prefsEditor"
    fluid.prefs.builder({
        gradeNames: ["fluid.prefs.auxSchema.starter"],
        auxiliarySchema: {
            "namespace": "fluid.uiOptions"
        }
    });

})(jQuery, fluid_1_5);
