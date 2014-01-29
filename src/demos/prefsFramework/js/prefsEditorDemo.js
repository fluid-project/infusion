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
                "type": "demo.prefsEditor.simplifyEnactor"
            },
            panel: {
                "type": "demo.prefsEditor.simplifyPanel",
                "container": ".demo-prefsEditor-simplify",
                "template": "html/SimplifyPanelTemplate.html",
                "message": "messages/simplify.json"
            }
        },
    };

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

    fluid.defaults("demo.prefsEditor.simplifyEnactor", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "demo.prefs.simplify": {
                "model.value": "default"
            }
        }
    });
})(jQuery, fluid);
