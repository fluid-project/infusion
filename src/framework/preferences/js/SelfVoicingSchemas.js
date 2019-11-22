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

(function (fluid) {
    "use strict";

    /*******************************************************************************
    * Auxiliary schema grade
    *
    * Contains the settings for text-to-speech
    *******************************************************************************/

    fluid.defaults("fluid.prefs.auxSchema.speak", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "fluid.prefs.speak": {
                enactor: {
                    type: "fluid.prefs.enactor.selfVoicing"
                },
                panel: {
                    type: "fluid.prefs.panel.speak",
                    container: ".flc-prefsEditor-speak",
                    template: "%templatePrefix/PrefsEditorTemplate-speak.html",
                    message: "%messagePrefix/speak.json"
                }
            }
        }
    });


    /*******************************************************************************
    * Primary Schema
    *******************************************************************************/

    // add extra prefs to the starter primary schemas

    fluid.defaults("fluid.prefs.schemas.speak", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.speak": {
                "type": "boolean",
                "default": false
            }
        }
    });

})(fluid_3_0_0);
