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
    fluid.defaults("fluid.tests.uiOptions.testPrefsEditorBase", {
        gradeNames: ["fluid.uiOptions.prefsEditor"],
        terms: {
            templatePrefix: "../../../../src/framework/preferences/html",
            messagePrefix: "../../../../src/framework/preferences/messages"
        }
    });

    /* Mixin grade for UIO test environment */
    fluid.defaults("fluid.tests.uiOptions.prefsEditorBaseTest", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            prefsEditor: {
                createOnEvent: "{prefsEditorTester}.events.onTestCaseStart"
            },
            prefsEditorTester: {}
        }
    });

    fluid.defaults("fluid.tests.uiOptions.testPrefsEditorCustomToc", {
        gradeNames: ["fluid.tests.uiOptions.testPrefsEditorBase"],
        tocTemplate: customizedTocTemplate
    });

    fluid.defaults("fluid.tests.uiOptions.prefsEditorCustomTocTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "UI Options Tests",
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

    fluid.defaults("fluid.tests.uiOptions.prefsEditorCustomTocTest", {
        gradeNames: ["fluid.tests.uiOptions.prefsEditorBaseTest"],
        components: {
            prefsEditor: {
                type: "fluid.tests.uiOptions.testPrefsEditorCustomToc",
                container: ".flc-prefsEditor-separatedPanel"
            },
            prefsEditorTester: {
                type: "fluid.tests.uiOptions.prefsEditorCustomTocTester"
            }
        }
    });

    fluid.defaults("fluid.tests.uiOptions.testPrefsEditorLocalized", {
        gradeNames: ["fluid.tests.uiOptions.testPrefsEditorBase"],
        defaultLocale: "fr"
    });

    fluid.defaults("fluid.tests.uiOptions.prefsEditorLocalizedTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "UI Options Locale Tests",
            tests: [{
                name: "UIO defaultLocale tests",
                expect: 8,
                sequence: [{
                    event: "{prefsEditorBaseTest prefsEditor messageLoader}.events.onResourcesLoaded",
                    listener: "jqUnit.assertEquals",
                    args: ["defaultLocale is properly propagated to messageLoader", "fr", "{prefsEditor}.prefsEditorLoader.messageLoader.options.defaultLocale"]
                },
                {
                    funcName: "fluid.tests.uiOptions.prefsEditorLocalizedTester.verifyLocalizedMessages",
                    args: "{prefsEditor}"
                }]
            }]
        }]
    });

    fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify = {
        fluid_prefs_panel_contrast: {
            path: "label",
            expected: "Couleur et contraste"
        },
        fluid_prefs_panel_enhanceInputs: {
            path: "label",
            expected: "Accentuer les contrôles"
        },
        fluid_prefs_panel_layoutControls: {
            path: "label",
            expected: "Table des matières"
        },
        fluid_prefs_panel_lineSpace: {
            path: "label",
            expected: "Interligne"
        },
        fluid_prefs_panel_textFont: {
            path: "textFontLabel",
            expected: "style du texte"
        },
        fluid_prefs_panel_textSize: {
            path: "label",
            expected: "Taille du texte"
        },
        prefsEditor: {
            path: "slidingPanelPanelLabel",
            expected: "Préférences de l'utilisateur"
        }
    };

    fluid.tests.uiOptions.prefsEditorLocalizedTester.verifyLocalizedMessages = function (prefsEditor) {
        fluid.each(prefsEditor.prefsEditorLoader.messageLoader.resources, function (panel, key) {
            var actualValue = panel.resourceText[fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify[key].path];
            jqUnit.assertEquals("Panel " + key + " localized message loaded correctly", fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify[key].expected, actualValue);
        });
    };

    fluid.defaults("fluid.tests.uiOptions.prefsEditorLocalizedTest", {
        gradeNames: ["fluid.tests.uiOptions.prefsEditorBaseTest"],
        components: {
            prefsEditor: {
                type: "fluid.tests.uiOptions.testPrefsEditorLocalized",
                container: ".flc-prefsEditor-separatedPanel-localized"
            },
            prefsEditorTester: {
                type: "fluid.tests.uiOptions.prefsEditorLocalizedTester"
            }
        }
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.uiOptions.prefsEditorCustomTocTest",
            "fluid.tests.uiOptions.prefsEditorLocalizedTest"
        ]);
    });
})(jQuery);
