/*
Copyright 2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var minEditor = minEditor || {};

(function () {
    "use strict";

    /**
     * Primary Schema
     * This schema defines the preference(s) edited by this preferences editor:
     * their names, types, default values, etc.
     */
    minEditor.primarySchema = {
        // the string "minEditor.autoPilot" is the 'name' of the preference
        "minEditor.autoPilot": {
            type: "boolean",
            "default": false
        }
    };

    /**
     * Panel for the auto-pilot preference
     */
    fluid.defaults("minEditor.panels.autoPilot", {
        gradeNames: ["fluid.prefs.panel"],

        // the Preference Map maps the information in the primary schema to this panel
        preferenceMap: {
            // the key must match the name of the pref in the primary schema
            "minEditor.autoPilot": {
                // this key is the path into the panel's model where this preference is stored
                "model.autoPilot": "default"
            }
        },

        // selectors identify elements in the DOM that need to be accessed by the code
        // in this case, the Renderer will render data into these particular elements
        selectors: {
            header: ".mec-autoPilot-header",
            label: ".mec-autoPilot-label",
            autoPilot: ".mec-autoPilot"
        },

        // the ProtoTree is basically instructions to the Renderer
        // the keys in the prototree match the selectors above
        protoTree: {
            // "messagekey" refers to the keys for strings in the JSON messages file
            header: {messagekey: "autoPilotHeader"},
            label: {messagekey: "autoPilotLabel"},

            // this string 'autoPilot' refers to the last part of the model path in the preferenceMap
            autoPilot: "${autoPilot}"
        }
    });

    /**
     * Auxiliary Schema
     */
    fluid.defaults("minEditor.auxSchema", {

        // the basic grade for the schema
        gradeNames: ["fluid.prefs.auxSchema"],

        auxiliarySchema: {

            // the loaderGrade identifies the "base" form of preference editor desired
            loaderGrades: ["fluid.prefs.fullNoPreview"],

            // these are the root paths used to reference templates
            // and message files in this schema
            terms: {
                templatePrefix: "html",
                messagePrefix: "messages"
            },

            // the main template for the preference editor itself
            template: "%templatePrefix/minEditor.html",

            // the message bundle for the preference editor itself
            message: "%messagePrefix/prefsEditor.json",

            autoPilot: {
                // this 'type' must match the name of the pref in the primary schema
                type: "minEditor.autoPilot",
                panel: {
                    // this 'type' must match the name of the panel grade created for this pref
                    type: "minEditor.panels.autoPilot",

                    // selector indicating where, in the main template, to place this panel
                    container: ".mec-autoPilot",

                    // the template for this panel
                    template: "%templatePrefix/autoPilot.html",

                    // the message bundle for this panel
                    message: "%messagePrefix/autoPilot.json"
                }
            }
        }
    });

    /**
     * Initialize and instantiate the editor
     */
    minEditor.init = function (container) {
        return fluid.prefs.create(container, {
            build: {
                gradeNames: ["minEditor.auxSchema"],
                primarySchema: minEditor.primarySchema
            }
        });
    };

})();






