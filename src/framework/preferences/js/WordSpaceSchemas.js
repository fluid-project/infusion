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
    * Contains the settings for the word space preference
    *******************************************************************************/

    // Fine-tune the starter aux schema and add word space preference
    fluid.defaults("fluid.prefs.auxSchema.wordSpace", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            "namespace": "fluid.prefs.constructed",
            "terms": {
                "templatePrefix": "../../framework/preferences/html/",
                "messagePrefix": "../../framework/preferences/messages/"
            },
            "template": "%templatePrefix/SeparatedPanelPrefsEditor.html",
            "message": "%messagePrefix/prefsEditor.json",

            wordSpace: {
                type: "fluid.prefs.wordSpace",
                enactor: {
                    type: "fluid.prefs.enactor.wordSpace",
                    fontSizeMap: {
                        "xx-small": "9px",
                        "x-small": "11px",
                        "small": "13px",
                        "medium": "15px",
                        "large": "18px",
                        "x-large": "23px",
                        "xx-large": "30px"
                    }
                },
                panel: {
                    type: "fluid.prefs.panel.wordSpace",
                    container: ".flc-prefsEditor-word-space",
                    template: "%templatePrefix/PrefsEditorTemplate-wordSpace.html",
                    message: "%messagePrefix/wordSpace.json"
                }
            }
        }
    });


    /*******************************************************************************
    * Primary Schema
    *******************************************************************************/

    // add extra prefs to the starter primary schemas

    fluid.defaults("fluid.prefs.schemas.wordSpace", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.wordSpace": {
                "type": "number",
                "default": 1,
                "minimum": 0.7,
                "maximum": 2,
                "divisibleBy": 0.1
            }
        }
    });

})(fluid_3_0_0);
