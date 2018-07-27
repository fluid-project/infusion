/*
Copyright 2011-2014, 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

 */

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    var customizedTocTemplate = "../../../../src/components/tableOfContents/html/TableOfContents.html";

    /* Mixin grade for UIO test component */
    fluid.defaults("fluid.uiOptions.testPrefsEditorBase", {
        gradeNames: ["fluid.uiOptions.prefsEditor"],
        terms: {
            templatePrefix: "../../../../src/framework/preferences/html",
            messagePrefix: "../../../../src/framework/preferences/messages"
        }
    });

    /* Mixin grade for UIO test environment */
    fluid.defaults("fluid.uiOptions.prefsEditorBaseTest", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            prefsEditor: {
                createOnEvent: "{prefsEditorTester}.events.onTestCaseStart"
            },
            prefsEditorTester: {}
        }
    });

    fluid.defaults("fluid.uiOptions.testPrefsEditorCustomToc", {
        gradeNames: ["fluid.uiOptions.testPrefsEditorBase"],
        tocTemplate: customizedTocTemplate
    });

    fluid.defaults("fluid.uiOptions.prefsEditorCustomTocTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "UIOptions Tests",
            tests: [{
                name: "Pass in customized toc template",
                expect: 2,
                sequence: [{
                    event: "{prefsEditorCustomTocTest prefsEditor}.events.onCreate",
                    listener: "jqUnit.assertEquals",
                    args: ["The toc template is applied properly to the pageEnhancer", customizedTocTemplate, "{prefsEditor}.enhancer.uiEnhancer.fluid_prefs_enactor_tableOfContents.options.tocTemplate"]
                },
                {
                    funcName: "fluid.identity"
                },
                {
                    event: "{prefsEditor}.events.onReady",
                    listener: "jqUnit.assertEquals",
                    args: ["FLUID-5474: The toc template is applied properly to iframeEnhancer", customizedTocTemplate, "{prefsEditor}.prefsEditorLoader.iframeRenderer.iframeEnhancer.fluid_prefs_enactor_tableOfContents.options.tocTemplate"]
                }]
            }]
        }]
    });

    fluid.defaults("fluid.uiOptions.prefsEditorCustomTocTest", {
        gradeNames: ["fluid.uiOptions.prefsEditorBaseTest"],
        components: {
            prefsEditor: {
                type: "fluid.uiOptions.testPrefsEditorCustomToc",
                container: ".flc-prefsEditor-separatedPanel"
            },
            prefsEditorTester: {
                type: "fluid.uiOptions.prefsEditorCustomTocTester"
            }
        }
    });

    fluid.defaults("fluid.uiOptions.testPrefsEditorLocalized", {
        gradeNames: ["fluid.uiOptions.testPrefsEditorBase"],
        defaultLocale: "fr"
    });

    fluid.defaults("fluid.uiOptions.prefsEditorLocalizedTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "UIOptions Locale Tests",
            tests: [{
                name: "UIO defaultLocale tests",
                expect: 8,
                sequence: [{
                    event: "{prefsEditorBaseTest prefsEditor messageLoader}.events.onResourcesLoaded",
                    listener: "jqUnit.assertEquals",
                    args: ["defaultLocale is properly propagated to messageLoader", "fr", "{prefsEditor}.prefsEditorLoader.messageLoader.options.defaultLocale"]
                },
                {
                    funcName: "fluid.uiOptions.prefsEditorLocalizedTester.verifyLocalizedMessages",
                    args: "{prefsEditor}"
                }]
            }]
        }]
    });

    var localizedValuesToVerify = {
        fluid_prefs_panel_contrast: "Couleur et contraste",
        fluid_prefs_panel_enhanceInputs: "Accentuer les contrôles",
        fluid_prefs_panel_layoutControls: "Table des matières",
        fluid_prefs_panel_lineSpace: "Interligne",
        fluid_prefs_panel_textFont: "style du texte",
        fluid_prefs_panel_textSize: "Taille du texte",
        prefsEditor: "Préférences de l'utilisateur"
    };

    fluid.uiOptions.prefsEditorLocalizedTester.verifyLocalizedMessages = function (prefsEditor) {
        fluid.each(prefsEditor.prefsEditorLoader.messageLoader.resources, function (panel, key) {
            var actualValue = "";
            switch (key) {
            case "fluid_prefs_panel_textFont":
                actualValue = panel.resourceText.textFontLabel;
                break;
            case "prefsEditor":
                actualValue = panel.resourceText.slidingPanelPanelLabel;
                break;
            default:
                actualValue = panel.resourceText.label;
                break;
            };

            jqUnit.assertEquals("Panel " + key + " localized message loaded correctly", localizedValuesToVerify[key], actualValue);
        });
    };

    fluid.defaults("fluid.uiOptions.prefsEditorLocalizedTest", {
        gradeNames: ["fluid.uiOptions.prefsEditorBaseTest"],
        components: {
            prefsEditor: {
                type: "fluid.uiOptions.testPrefsEditorLocalized",
                container: ".flc-prefsEditor-separatedPanel-localized"
            },
            prefsEditorTester: {
                type: "fluid.uiOptions.prefsEditorLocalizedTester"
            }
        }
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.uiOptions.prefsEditorCustomTocTest",
            "fluid.uiOptions.prefsEditorLocalizedTest"
        ]);
    });
})(jQuery);
