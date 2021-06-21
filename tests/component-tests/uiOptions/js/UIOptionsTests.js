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

/* global jqUnit */

(function ($) {
    "use strict";

    // use tempStore for tests
    fluid.contextAware.makeChecks({"fluid.prefs.tests": true});

    fluid.contextAware.makeAdaptation({
        distributionName: "fluid.tests.prefs.tempStoreDistributor",
        targetName: "fluid.prefs.store",
        adaptationName: "strategy",
        checkName: "test",
        record: {
            contextValue: "{fluid.prefs.tests}",
            gradeNames: "fluid.prefs.tempStore",
            priority: "after:user"
        }
    });

    fluid.registerNamespace("fluid.tests.uiOptions");

    fluid.tests.uiOptions.customizedTocTemplate = "../../../../src/components/tableOfContents/html/TableOfContents.html";
    fluid.tests.uiOptions.customizedTocMessage = "../../../../src/framework/preferences/messages/tableOfContents-enactor.json";

    /* Mixin grade for UIO test component */
    fluid.defaults("fluid.tests.uiOptions.testPrefsEditorBase", {
        gradeNames: ["fluid.uiOptions"],
        auxiliarySchema: {
            terms: {
                templatePrefix: "../../../../src/framework/preferences/html",
                messagePrefix: "../../../../src/framework/preferences/messages"
            },
            "fluid.prefs.tableOfContents": {
                enactor: {
                    "tocTemplate": fluid.tests.uiOptions.customizedTocTemplate,
                    "tocMessage": fluid.tests.uiOptions.customizedTocMessage
                }
            }
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

    fluid.defaults("fluid.tests.uiOptions.prefsEditorCustomTocTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "UI Options Tests",
            tests: [{
                name: "Pass in customized toc template",
                expect: 4,
                sequence: [{
                    "event": "{prefsEditorCustomTocTest testPrefsEditorBase}.events.onReady",
                    "listener": "fluid.tests.uiOptions.prefsEditorCustomTocTester.verifyCustomizedTocTemplates",
                    "args": ["{testPrefsEditorBase}", fluid.tests.uiOptions.customizedTocTemplate,  fluid.tests.uiOptions.customizedTocMessage]
                }]
            }]
        }]
    });

    fluid.tests.uiOptions.prefsEditorCustomTocTester.verifyCustomizedTocTemplates = function (prefsEditorComponent, expectedTocTemplate, expectedTocMessage) {
        // template
        jqUnit.assertEquals("The toc template is applied properly to the pageEnhancer",
            expectedTocTemplate, prefsEditorComponent.enhancer.uiEnhancer.fluid_prefs_enactor_tableOfContents.options.tocTemplate);
        jqUnit.assertEquals("FLUID-5474: The toc template is applied properly to iframeEnhancer", expectedTocTemplate,
            prefsEditorComponent.prefsEditorLoader.iframeRenderer.iframeEnhancer.fluid_prefs_enactor_tableOfContents.options.tocTemplate);

        // message bundle
        jqUnit.assertEquals("The toc message is applied properly to the pageEnhancer",
            expectedTocMessage, prefsEditorComponent.enhancer.uiEnhancer.fluid_prefs_enactor_tableOfContents.options.tocMessage);
        jqUnit.assertEquals("The toc message is applied properly to iframeEnhancer", expectedTocMessage,
            prefsEditorComponent.prefsEditorLoader.iframeRenderer.iframeEnhancer.fluid_prefs_enactor_tableOfContents.options.tocMessage);
    };

    fluid.defaults("fluid.tests.uiOptions.prefsEditorCustomTocTest", {
        gradeNames: ["fluid.tests.uiOptions.prefsEditorBaseTest"],
        components: {
            prefsEditor: {
                type: "fluid.tests.uiOptions.testPrefsEditorBase",
                container: ".flc-prefsEditor-separatedPanel"
            },
            prefsEditorTester: {
                type: "fluid.tests.uiOptions.prefsEditorCustomTocTester"
            }
        }
    });

    fluid.defaults("fluid.tests.uiOptions.testPrefsEditorLocalized", {
        gradeNames: ["fluid.tests.uiOptions.testPrefsEditorBase"],
        auxiliarySchema: {
            defaultLocale: "fr"
        }
    });

    fluid.defaults("fluid.tests.uiOptions.prefsEditorLocalizedTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            localized: {
                fr: {
                    "tocHeader": "Table des matières"
                }
            }
        },
        modules: [{
            name: "UI Options Locale Tests",
            tests: [{
                name: "UIO defaultLocale tests",
                expect: 17,
                sequence: [{
                    event: "{prefsEditorBaseTest prefsEditorLoader > messageLoader}.events.onResourcesLoaded",
                    listener: "jqUnit.assertEquals",
                    args: ["defaultLocale is properly propagated to messageLoader", "fr",
                        "{prefsEditor}.prefsEditorLoader.messageLoader.options.resourceOptions.defaultLocale"]
                },
                {
                    event: "{prefsEditorBaseTest prefsEditor prefsEditorLoader prefsEditor}.events.onReady",
                    listener: "fluid.tests.uiOptions.prefsEditorLocalizedTester.verifyPanelMessages",
                    args: "{prefsEditor}"
                },
                {
                    funcName: "fluid.tests.uiOptions.prefsEditorLocalizedTester.verifySlidingPanelMessages",
                    args: ["{prefsEditor}", "prefsEditor", "Préférences de l'utilisateur"]
                },
                {
                    funcName: "jqUnit.assertEquals",
                    args: ["defaultLocale is properly propagated to the toc messageLoader", "fr",
                        "{prefsEditor}.enhancer.uiEnhancer.fluid_prefs_enactor_tableOfContents.messageLoader.options.resourceOptions.defaultLocale"]
                },
                {
                    funcName: "jqUnit.assertDeepEq",
                    args: ["The localized messages are loaded correctly", "{that}.options.testOpts.localized.fr",
                        "{prefsEditor}.enhancer.uiEnhancer.fluid_prefs_enactor_tableOfContents.messageLoader.resources.tocMessage.parsed"]
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
        }
    };

    fluid.tests.uiOptions.prefsEditorLocalizedTester.verifyPanelMessages = function (prefsEditor) {
        fluid.each(prefsEditor.prefsEditorLoader.messageLoader.resources, function (panel, key) {
            if (fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify[key]) {
                var actualMessageValue = panel.parsed[fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify[key].path];
                jqUnit.assertEquals("Panel " + key + " localized message loaded correctly",
                    fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify[key].expected, actualMessageValue);

                var actualRenderedValue = prefsEditor.prefsEditorLoader.prefsEditor[key].locate("label").text();
                jqUnit.assertEquals("Panel " + key + " localized message rendererd correctly",
                    fluid.tests.uiOptions.prefsEditorLocalizedTester.localizedValuesToVerify[key].expected, actualRenderedValue);
            }
        });
    };

    fluid.tests.uiOptions.prefsEditorLocalizedTester.verifySlidingPanelMessages = function (prefsEditor, resourceKey, expectedValue) {
        var actualMessageValue = prefsEditor.prefsEditorLoader.messageLoader.resources.prefsEditor.parsed.slidingPanelPanelLabel;
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

    $(function () {
        fluid.test.runTests([
            "fluid.tests.uiOptions.prefsEditorCustomTocTest",
            "fluid.tests.uiOptions.prefsEditorLocalizedTest"
        ]);
    });
})(jQuery);
