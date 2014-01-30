/*
Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};

(function ($, fluid) {
    fluid.registerNamespace("demo.prefsEditor");

    // add extra prefs to the starter primary schemas
    demo.prefsEditor.primarySchema = {
        "demo.prefs.simplify": {
            "type": "boolean",
            "default": false
        },
        "demo.prefs.speak": {
            "type": "boolean",
            "default": false
        }
    };

    // Fine-tune the starter aux schema and add extra panels
    demo.prefsEditor.auxSchema = {
        // adjust paths
        templatePrefix: "../../framework/preferences/html/",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
        messagePrefix: "../../framework/preferences/messages/",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
        tableOfContents: {
            enactor: {
                tocTemplate: "../../components/tableOfContents/html/TableOfContents.html"
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
        },
        speak: {
            type: "demo.prefs.speak",
            enactor: {
                type: "demo.prefsEditor.speakEnactor",
                container: "body"
            },
            panel: {
                type: "demo.prefsEditor.speakPanel",
                container: ".demo-prefsEditor-speak",
                template: "html/SpeakPanelTemplate.html",
                message: "messages/speak.json"
            }
        }
    };

    /**********************************************************************************
     * simplifyPanel
     **********************************************************************************/
    fluid.defaults("demo.prefsEditor.simplifyPanel", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "demo.prefs.simplify": {
                "model.simplify": "default"
            }
        },
        selectors: {
            simplify: ".demo-prefsEditor-simplify",
            label: ".demo-prefsEditor-simplify-label",
            choiceLabel: ".demo-prefsEditor-simplify-choice-label"
        },
        protoTree: {
            label: {messagekey: "simplifyLabel"},
            choiceLabel: {messagekey: "simplifyChoiceLabel"},
            simplify: "${simplify}"
        }
    });

    /**********************************************************************************
     * speakPanel
     **********************************************************************************/
    fluid.defaults("demo.prefsEditor.speakPanel", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "demo.prefs.speak": {
                "model.speak": "default"
            }
        },
        selectors: {
            speak: ".demo-prefsEditor-speak",
            label: ".demo-prefsEditor-speak-label",
            choiceLabel: ".demo-prefsEditor-speak-choice-label"
        },
        protoTree: {
            label: {messagekey: "speakLabel"},
            choiceLabel: {messagekey: "speakChoiceLabel"},
            speak: "${speak}"
        }
    });

    /**********************************************************************************
     * simplifyEnactor
     *
     * Simplify content based upon the model value.
     **********************************************************************************/
    fluid.defaults("demo.prefsEditor.simplifyEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactor", "autoInit"],
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
        events: {
            settingChanged: null
        },
        invokers: {
            set: {
                funcName: "demo.prefsEditor.simplifyEnactor.set",
                args: ["{arguments}.0", "{that}"]
            }
        },
        listeners: {
            onCreate: {
                listener: "{that}.set",
                args: ["{that}.model.simplify"]
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

    demo.prefsEditor.simplifyEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("simplify", function (newModel) {
            that.set(newModel.simplify);
        });
    };

})(jQuery, fluid);
