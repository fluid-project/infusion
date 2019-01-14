/*
Copyright 2019 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function (fluid) {
    "use strict";

    /*******************************************************************************
    * Starter auxiliary schema grade
    *
    * Contains the settings for the localization preference
    *******************************************************************************/

    // Fine-tune the starter aux schema and add localization preference
    fluid.defaults("fluid.prefs.constructed.localizationConfig", {
        gradeNames: ["fluid.contextAware"],
        contextAwareness: {
            localeChange: {
                checks: {
                    urlPath: {
                        contextValue: "{localizationConfig}.options.localizationScheme",
                        equals: "urlPath",
                        gradeNames: "fluid.prefs.constructed.localizationConfig.urlPathLocale"
                    }
                }
            }
        },
        distributeOptions: {
            // When FLUID-6322 is complete, the default locale will be specifiable directly from the aux schema
            "example.localization.defaultLocale": {
                source: "{that}.options.defaultLocale",
                target: "{that prefsEditorLoader}.options.defaultLocale"
            },
            "example.localization.enactor.localizationScheme": {
                source: "{that}.options.localizationScheme",
                target: "{that uiEnhancer fluid.prefs.enactor.localization}.options.localizationScheme"
            },
            "example.localization.panel.locales": {
                source: "{that}.options.locales",
                target: "{that prefsEditor fluid.prefs.panel.localization}.options.controlValues.localization"
            }
        }
    });

    fluid.defaults("fluid.prefs.constructed.localizationConfig.urlPathLocale", {
        distributeOptions: {
            "example.localization.enactor.langMap": {
                source: "{that}.options.langMap",
                target: "{that uiEnhancer fluid.prefs.enactor.localization}.options.langMap"
            },
            "example.localization.enactor.langSegIndex": {
                source: "{that}.options.langSegIndex",
                target: "{that uiEnhancer fluid.prefs.enactor.localization}.options.langSegIndex"
            }
        }
    });

})(fluid_3_0_0);
