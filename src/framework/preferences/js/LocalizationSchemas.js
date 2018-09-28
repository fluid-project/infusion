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
                "classes": {
                    "en": "fl-localization-en",
                    "es": "fl-localization-es",
                    "fa": "fl-localization-fa",
                    "fr": "fl-localization-fr"
                },
                "enactor": {
                    "type": "fluid.prefs.enactor.localization",
                    "classes": "@localization.classes"
                },
                "panel": {
                    "type": "fluid.prefs.panel.localization",
                    "container": ".flc-prefsEditor-localization",  // the css selector in the template where the panel is rendered
                    "classnameMap": {"localization": "@localization.classes"},
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
                "default": "English",
                "enum": ["en", "fa", "fr", "es"]
            }
        }
    });

})(fluid_3_0_0);
