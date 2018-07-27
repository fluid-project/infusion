/*
Copyright 2013-2016, 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};
(function ($, fluid) {
    "use strict";

    // Gradename to invoke "fluid.uiOptions.prefsEditor"
    fluid.prefs.builder({
        gradeNames: ["fluid.prefs.auxSchema.starter"]
    });

    fluid.defaults("fluid.uiOptions.prefsEditor", {
        gradeNames: ["fluid.prefs.constructed.prefsEditor"],
        lazyLoad: false,
        distributeOptions: {
            "uio.separatedPanel.lazyLoad": {
                record: "{that}.options.lazyLoad",
                target: "{that separatedPanel}.options.lazyLoad"
            },
            "uio.uiEnhancer.tocTemplate": {
                source: "{that}.options.tocTemplate",
                target: "{that uiEnhancer}.options.tocTemplate"
            },
            "uio.uiEnhancer.ignoreForToC": {
                source: "{that}.options.ignoreForToC",
                target: "{that uiEnhancer}.options.ignoreForToC"
            },
            "uio.localization.defaultLocale": {
                source: "{that}.options.defaultLocale",
                target: "{that prefsEditorLoader}.options.defaultLocale"
            }
        },
        enhancer: {
            distributeOptions: {
                "uio.enhancer.tableOfContents.tocTemplate": {
                    source: "{that}.options.tocTemplate",
                    target: "{that > fluid.prefs.enactor.tableOfContents}.options.tocTemplate"
                },
                "uio.enhancer.tableOfContents.ignoreForToC": {
                    source: "{that}.options.ignoreForToC",
                    target: "{that > fluid.prefs.enactor.tableOfContents}.options.ignoreForToC"
                }
            }
        }
    });

})(jQuery, fluid_3_0_0);
