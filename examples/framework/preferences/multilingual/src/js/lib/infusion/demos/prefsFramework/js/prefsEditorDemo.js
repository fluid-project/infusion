/*
Copyright 2014-2017 OCAD University
Copyright 2015 Raising the Floor - International

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
    demo.prefsEditor.primarySchema = {
        "demo.prefs.simplify": {
            "type": "boolean",
            "default": false
        }
    };

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
                        gradeNames: "demo.prefsEditor.auxSchema.speak"
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
                    tocTemplate: "../../src/components/tableOfContents/html/TableOfContents.html"
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
    fluid.defaults("demo.prefsEditor.auxSchema.speak", {
        gradeNames: ["fluid.prefs.auxSchema.speak"],
        auxiliarySchema: {
            terms: {
                // adjust paths
                templatePrefix: "../../src/framework/preferences/html",  // Must match the keyword used below to identify the common path to settings panel templates.
                messagePrefix: "../../src/framework/preferences/messages"  // Must match the keyword used below to identify the common path to message files.
            },
            tableOfContents: {
                enactor: {
                    tocTemplate: "../../src/components/tableOfContents/html/TableOfContents.html",
                    ignoreForToC: {
                        "overviewPanel": ".flc-overviewPanel"
                    }
                }
            },

            // sepcify augmented container template for panels
            template: "html/SeparatedPanelPrefsEditorWithTTS.html"
        }
    });


    /**********************************************************************************
     * simplifyPanel
     **********************************************************************************/

    fluid.defaults("demo.prefsEditor.simplifyPanel", {
        gradeNames: ["fluid.prefs.panel.switchAdjuster"],
        preferenceMap: {
            "demo.prefs.simplify": {
                "model.value": "default"
            }
        }
    });

    /**********************************************************************************
     * simplifyEnactor
     *
     * Simplify content based upon the model value.
     **********************************************************************************/
    fluid.defaults("demo.prefsEditor.simplifyEnactor", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "demo.prefs.simplify": {
                "model.simplify": "default"
            }
        },
        selectors: {
            content: ".demo-content"
        },
        styles: {
            simplified: "demo-content-simplified" // TODO: This class is not defined anywhere; do we need it?
        },
        model: {
            simplify: false
        },
        modelListeners: {
            simplify: {
                listener: "{that}.set",
                args: ["{change}.value"]
            }
        },
        events: {
            settingChanged: null
        },
        invokers: {
            set: {
                funcName: "demo.prefsEditor.simplifyEnactor.set",
                args: ["{arguments}.0", "{that}"]
            }
        }
    });

    demo.prefsEditor.simplifyEnactor.set = function (value, that) {
        var contentContainer = that.container.find(that.options.selectors.content);
        var simplified = contentContainer.hasClass(that.options.styles.simplified);

        if (!that.initialContent || !that.article) {
            that.initialContent = contentContainer.html();
            var articleDom = contentContainer.find("article").clone();
            $("aside", articleDom).remove();
            $("img", articleDom).css("float", "none");
            $("figure", articleDom).css("float", "none");
            var article = articleDom.html();
            that.article = article ? article : that.initialContent;
            that.origBg = $("body").css("background-image");
        }

        if (value) {
            if (!simplified) {
                $("body").css("background-image", "none");
                contentContainer.html(that.article);
                contentContainer.addClass(that.options.styles.simplified);
                that.events.settingChanged.fire();
            }
        } else {
            if (simplified) {
                $("body").css("background-image", that.origBg);
                contentContainer.html(that.initialContent);
                contentContainer.removeClass(that.options.styles.simplified);
                that.events.settingChanged.fire();
            }
        }
    };

})(jQuery, fluid);
