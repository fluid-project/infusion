/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var example = example || {};
(function ($, fluid) {
    "use strict";

    fluid.prefs.builder({
        gradeNames: ["fluid.prefs.auxSchema.localization"],
        auxiliarySchema: {
            "namespace": "example.prefs.localization"
        }
    });

    fluid.defaults("example.prefsEditor", {
        gradeNames: ["example.prefs.localization.prefsEditor"],
        localizationOpts: {
            enactor: {
                localizationScheme: "urlPath",
                langMap: {
                    "default": null,
                    "en": "",
                    "es": "es",
                    "fa": "fa",
                    "fr": "fr"
                },
                langSegIndex: 6
            },
            panel: {
                controlValues: {
                    localization: ["default", "en", "fr", "es", "fa"]
                }
            }
        },
        distributeOptions: {
            "example.localization.defaultLocale": {
                source: "{that}.options.defaultLocale",
                target: "{that prefsEditorLoader}.options.defaultLocale"
            },
            "example.localization.localizationEnactor": {
                source: "{that}.options.localizationOpts.enactor",
                target: "{that uiEnhancer fluid.prefs.enactor.localization}.options"
            },
            "example.localization.localizationPanel": {
                source: "{that}.options.localizationOpts.panel",
                target: "{that prefsEditor fluid.prefs.panel.localization}.options"
            },
            "example.localization.template": {
                source: "{that}.options.template",
                target: "{that prefsEditorLoader > templateLoader}.options.resources.prefsEditor"
            }
        }
    });

})(jQuery, fluid);
