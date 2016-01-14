/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0_0 = fluid_2_0_0 || {};

(function (fluid) {
    "use strict";

    /************************************************************************************
    * Starter auxiliary schema grade for integrating GPII into the preferences framework
    *
    * Contains the settings for GPII auto syncing preference and all other settings for
    * preferences defined in fluid.prefs.auxSchema
    *************************************************************************************/

    // Fine-tune the starter aux schema and add GPII auto syncing panel
    fluid.defaults("fluid.prefs.auxSchema.gpiiStarter", {
        gradeNames: ["fluid.prefs.auxSchema.starter"],
        auxiliarySchema: {
            "template": "%templatePrefix/SeparatedPanelPrefsEditorWithGPII.html",
            "gpii": {
                "type": "fluid.prefs.gpii",
                "panel": {
                    "type": "fluid.prefs.panel.gpii",
                    "container": ".flc-prefsEditor-gpii",  // the css selector in the template where the panel is rendered
                    "template": "%templatePrefix/PrefsEditorTemplate-gpii.html",
                    "message": "%messagePrefix/gpii.json"
                }
            }
        }
    });

    /*******************************************************************************
    * Primary Schema
    *******************************************************************************/

    // add extra GPII auto syncing preference to the starter primary schemas

    fluid.defaults("fluid.prefs.schemas.gpii", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.gpii": {
                "type": "boolean",
                "auto": false
            }
        }
    });

})(fluid_2_0_0);
