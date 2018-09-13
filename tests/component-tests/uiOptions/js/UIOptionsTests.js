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

    fluid.tests.uiOptions.customizedTocTemplate = "../../../../src/components/tableOfContents/html/TableOfContents.html";

    fluid.defaults("fluid.tests.uiOptions.testPrefsEditorCustomToc", {
        gradeNames: ["fluid.tests.uiOptions.testPrefsEditorBase"],
        tocTemplate: fluid.tests.uiOptions.customizedTocTemplate
    });

    fluid.defaults("fluid.tests.uiOptions.prefsEditorCustomTocTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "UI Options Tests",
            tests: [{
                name: "Pass in customized toc template",
                expect: 2,
                sequence: [{
                    "event": "{prefsEditorCustomTocTest testPrefsEditorCustomToc}.events.onReady",
                    "listener": "fluid.tests.uiOptions.prefsEditorCustomTocTester.verifyCustomizedTocTemplates",
                    "args": ["{testPrefsEditorCustomToc}", fluid.tests.uiOptions.customizedTocTemplate]
                }]
            }]
        }]
    });

    fluid.tests.uiOptions.prefsEditorCustomTocTester.verifyCustomizedTocTemplates = function (prefsEditorComponent, expectedTocTemplate) {
        jqUnit.assertEquals("The toc template is applied properly to the pageEnhancer", expectedTocTemplate, prefsEditorComponent.enhancer.uiEnhancer.fluid_prefs_enactor_tableOfContents.options.tocTemplate);
        jqUnit.assertEquals("FLUID-5474: The toc template is applied properly to iframeEnhancer", expectedTocTemplate, prefsEditorComponent.prefsEditorLoader.iframeRenderer.iframeEnhancer.fluid_prefs_enactor_tableOfContents.options.tocTemplate);
    };

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
        gradeNames: ["fluid.tests.uiOptions.testPrefsEditorBase", "fluid.uiOptions.prefsEditor.localized"],
        defaultLocale: "fr"
    });

    fluid.defaults("fluid.tests.uiOptions.prefsEditorLocalizedTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "UI Options Locale Tests",
            tests: [{
                name: "UIO defaultLocale tests",
                expect: 15,
                sequence: [{
                    event: "{prefsEditorBaseTest prefsEditor prefsEditorLoader prefsEditor}.events.onReady",
                    listener: "fluid.tests.uiOptions.prefsEditorLocalizedTester.verifyPanelMessages",
                    args: ["{prefsEditor}", "fr"]
                },
                {
                    funcName: "fluid.tests.uiOptions.prefsEditorLocalizedTester.verifySlidingPanelMessages",
                    args: ["{prefsEditor}", "prefsEditor", "Préférences de l'utilisateur"]
                },
                {
                    func: "{prefsEditor}.events.onInterfaceLocaleChangeRequested.fire",
                    args: ["es"]
                },
                {
                    event: "{prefsEditor messageLoader}.events.onResourcesLoaded",
                    listener: "fluid.tests.uiOptions.prefsEditorLocalizedTester.verifyPanelMessages",
                    args: ["{prefsEditor}", "es"]
                }]
            }]
        }]
    });

    fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify = {
        fluid_prefs_panel_contrast: {
            path: "label",
            expected: {
                es: "Color y contraste",
                fr: "Couleur et contraste"
            }
        },
        fluid_prefs_panel_enhanceInputs: {
            path: "label",
            expected: {
                es: "Mejorar las entradas",
                fr: "Accentuer les contrôles"
            }
        },
        fluid_prefs_panel_layoutControls: {
            path: "label",
            expected: {
                es: "Tabla de contenido",
                fr: "Table des matières"
            }
        },
        fluid_prefs_panel_lineSpace: {
            path: "label",
            expected: {
                es: "Espaciado entre líneas",
                fr: "Interligne"
            }
        },
        fluid_prefs_panel_textFont: {
            path: "textFontLabel",
            expected: {
                es: "Estilo de texto",
                fr: "Style du texte"
            }
        },
        fluid_prefs_panel_textSize: {
            path: "label",
            expected: {
                es: "Tamano del texto",
                fr: "Taille du texte"
            }
        }
    };

    fluid.tests.uiOptions.prefsEditorLocalizedTester.verifyPanelMessages = function (prefsEditor, expectedLocale) {
        jqUnit.assertEquals("defaultLocale is properly propagated to messageLoader", expectedLocale, prefsEditor.prefsEditorLoader.messageLoader.options.defaultLocale);

        fluid.each(prefsEditor.prefsEditorLoader.messageLoader.resources, function (panel, key) {
            if (fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify[key]) {
                var actualMessageValue = panel.resourceText[fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify[key].path];
                jqUnit.assertEquals("Panel " + key + " localized message loaded correctly", fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify[key].expected[expectedLocale], actualMessageValue);

                var actualRenderedValue = prefsEditor.prefsEditorLoader.prefsEditor[key].locate("label").text();
                jqUnit.assertEquals("Panel " + key + " localized message rendered correctly", fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify[key].expected[expectedLocale], actualRenderedValue);
            }
        });
    };

    fluid.tests.uiOptions.prefsEditorLocalizedTester.verifySlidingPanelMessages = function (prefsEditor, resourceKey, expectedValue) {
        var actualMessageValue = prefsEditor.prefsEditorLoader.messageLoader.resources.prefsEditor.resourceText.slidingPanelPanelLabel;
        jqUnit.assertEquals("Sliding panel localized message loaded correctly", expectedValue, actualMessageValue);

        var actualRenderedValue = prefsEditor.prefsEditorLoader.slidingPanel.locate("panel").attr("aria-label");
        jqUnit.assertEquals("Sliding panel localized message rendered correctly", expectedValue, actualRenderedValue);
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
