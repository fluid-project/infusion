/*
Copyright 2018 OCAD University

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
    fluid.defaults("fluid.prefs.auxSchema.localization", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "terms": {
                "templatePrefix": "../../framework/preferences/html/",
                "messagePrefix": "../../framework/preferences/messages/"
            },
            "template": "%templatePrefix/SeparatedPanelPrefsEditor.html",
            "message": "%messagePrefix/prefsEditor.json",
            localization: {
                "type": "fluid.prefs.localization",
                "enactor": {
                    "type": "fluid.prefs.enactor.localization",
                    "classes": "@localization.classes"
                },
                "panel": {
                    "type": "fluid.prefs.panel.localization",
                    "container": ".flc-prefsEditor-localization",  // the css selector in the template where the panel is rendered
                    "template": "%templatePrefix/PrefsEditorTemplate-localization.html",
                    "message": "%messagePrefix/localization.json"
                }
            }
        }
    });

    /*******************************************************************************
    * Primary Schema
    *******************************************************************************/

    // add extra prefs to the starter primary schemas

    fluid.defaults("fluid.prefs.schemas.localization", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.localization": {
                "type": "string",
                "default": "default",
                "enum": ["default", "en", "en_CA", "en_US", "fr", "es", "fa"]
            }
        }
    });

})(fluid_3_0_0);
