/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("demo.prefsEditor");

    // add extra prefs to the starter primary schemas
    fluid.defaults("demo.schemas.simplify", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "demo.prefs.simplify": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.contextAware.makeChecks({
        "fluid.supportsTTS": "fluid.textToSpeech.isSupported"
    });

    fluid.defaults("demo.prefsEditor.progressiveEnhancement", {
        gradeNames: ["fluid.contextAware"],
        contextAwareness: {
            textToSpeech: {
                checks: {
                    supportsTTS: {
                        contextValue: "{fluid.supportsTTS}",
                        gradeNames: "demo.prefsEditor.speak"
                    }
                }
            }
        }
    });

    // Fine-tune the starter aux schema and add simplify panel
    fluid.defaults("demo.prefsEditor.auxSchema.simplify", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            // add panels and enactors for extra settings
            "demo.prefs.simplify": {
                enactor: {
                    type: "demo.prefsEditor.simplifyEnactor",
                    container: "body"
                },
                panel: {
                    type: "demo.prefsEditor.simplifyPanel",
                    container: ".demo-prefsEditor-simplify",
                    template: "html/SimplifyPanelTemplate.html",
                    message: "messages/simplify.json"
                }
            }
        }
    });

    // Fine-tune the starter aux schema and add speak panel
    fluid.defaults("demo.prefsEditor.speak", {
        prefsPrioritized: {
            "fluid.prefs.speak": {
                priority: "after:demo.prefs.simplify"
            }
        }
    });

    /**********************************************************************************
     * simplifyPanel
     **********************************************************************************/

    fluid.defaults("demo.prefsEditor.simplifyPanel", {
        gradeNames: ["fluid.prefs.panel.switchAdjuster"],
        preferenceMap: {
            "demo.prefs.simplify": {
                "model.value": "value"
            }
        }
    });

    /**********************************************************************************
     * simplifyEnactor
     *
     * Simplify content based upon the model value.
     *
     * This component is added as an example of how simplification may appear.
     * However, the following code does not provide a generalized solution that
     * can be easily used across sites.
     **********************************************************************************/
    fluid.defaults("demo.prefsEditor.simplifyEnactor", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "demo.prefs.simplify": {
                "model.simplify": "value"
            }
        },
        styles: {
            simplified: "demo-content-simplified"
        },
        model: {
            simplify: false
        },
        modelListeners: {
            simplify: {
                "this": "{that}.container",
                method: "toggleClass",
                args: ["{that}.options.styles.simplified", "{change}.value"]
            }
        }
    });

})(jQuery, fluid);
