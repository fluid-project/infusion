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

/*global demo:true, fluid, jQuery*/

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
        auxiliarySchema: {
            terms: {
                // adjust paths
                templatePrefix: "../../src/framework/preferences/html",  // Must match the keyword used below to identify the common path to settings panel templates.
                messagePrefix: "../../src/framework/preferences/messages"  // Must match the keyword used below to identify the common path to message files.
            },
            tableOfContents: {
                enactor: {
                    tocTemplate: "../../src/components/tableOfContents/html/TableOfContents.html",
                    tocMessage: "../../src/framework/preferences/messages/tableOfContents-enactor.json"
                }
            },

            // sepcify augmented container template for panels
            template: "html/SeparatedPanelPrefsEditor.html",

            // add panels and enactors for extra settings
            simplify: {
                type: "demo.prefs.simplify",
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
        auxiliarySchema: {
            // specify augmented container template for panels
            template: "html/SeparatedPanelPrefsEditorWithTTS.html"
        },
        preferences: [
            "fluid.prefs.textSize",
            "fluid.prefs.lineSpace",
            "fluid.prefs.textFont",
            "fluid.prefs.contrast",
            "fluid.prefs.tableOfContents",
            "fluid.prefs.enhanceInputs",
            "fluid.prefs.letterSpace",
            "fluid.prefs.wordSpace",
            "fluid.prefs.syllabification",
            "fluid.prefs.speak",
            "demo.prefs.simplify"
        ]
    });

    // // Fine-tune the starter aux schema and add speak panel
    // fluid.defaults("demo.prefsEditor.auxSchema.speak", {
    //     gradeNames: ["fluid.prefs.auxSchema.speak"],
    //     auxiliarySchema: {
    //         terms: {
    //             // adjust paths
    //             templatePrefix: "../../src/framework/preferences/html",  // Must match the keyword used below to identify the common path to settings panel templates.
    //             messagePrefix: "../../src/framework/preferences/messages"  // Must match the keyword used below to identify the common path to message files.
    //         },
    //         tableOfContents: {
    //             enactor: {
    //                 tocTemplate: "../../src/components/tableOfContents/html/TableOfContents.html",
    //                 tocMessage: "../../src/framework/preferences/messages/tableOfContents-enactor.json",
    //                 ignoreForToC: {
    //                     "overviewPanel": ".flc-overviewPanel"
    //                 }
    //             }
    //         },
    //
    //         // specify augmented container template for panels
    //         template: "html/SeparatedPanelPrefsEditorWithTTS.html"
    //     }
    // });

    // // Fine-tune the syllabification schema
    // fluid.defaults("demo.prefsEditor.auxSchema.syllabification", {
    //     gradeNames: ["fluid.prefs.auxSchema.syllabification"],
    //     auxiliarySchema: {
    //         syllabification: {
    //             enactor: {
    //                 terms: {
    //                     patternPrefix: "../../src/lib/hypher/patterns"
    //                 }
    //             }
    //         }
    //     }
    // });


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
