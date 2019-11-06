/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};
(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.uiOptions.prefsEditor", {
        gradeNames: ["fluid.prefs.create"],
        auxiliarySchemas: [
            "fluid.prefs.auxSchema.textSize",
            "fluid.prefs.auxSchema.lineSpace",
            "fluid.prefs.auxSchema.textFont",
            "fluid.prefs.auxSchema.contrast",
            "fluid.prefs.auxSchema.tableOfContents",
            "fluid.prefs.auxSchema.enhanceInputs"
        ],
        lazyLoad: false,
        distributeOptions: {
            "uio.separatedPanel.lazyLoad": {
                record: "{that}.options.lazyLoad",
                target: "{that separatedPanel}.options.lazyLoad"
            },
            "uio.uiEnhancer.tocTemplate": {
                source: "{that}.options.tocTemplate",
                target: "{that uiEnhancer > tableOfContents}.options.tocTemplate"
            },
            "uio.uiEnhancer.tocMessage": {
                source: "{that}.options.tocMessage",
                target: "{that uiEnhancer > tableOfContents}.options.tocMessage"
            },
            "uio.uiEnhancer.ignoreForToC": {
                source: "{that}.options.ignoreForToC",
                target: "{that uiEnhancer > tableOfContents}.options.ignoreForToC"
            }
        }
    });

})(jQuery, fluid_3_0_0);
