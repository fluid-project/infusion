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

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests.prefs");

    fluid.tests.prefs.bwSkin = {
        preferences: {
            textSize: 1.8,
            textFont: "verdana",
            theme: "bw",
            lineSpace: 2
        }
    };

    fluid.tests.prefs.ybSkin = {
        preferences: {
            textSize: 2,
            textFont: "comic sans",
            theme: "yb",
            lineSpace: 1.5
        }
    };

    fluid.tests.prefs.expectedComponents = {
        "fluid.prefs.separatedPanel": [
            "textSize",
            "lineSpace",
            "textFont",
            "contrast",
            "enhanceInputs"
        ],
        "fluid.prefs.fullNoPreview": [
            "textSize",
            "lineSpace",
            "textFont",
            "contrast",
            "enhanceInputs"
        ],
        "fluid.prefs.fullPreview": [
            "textSize",
            "lineSpace",
            "textFont",
            "contrast",
            "enhanceInputs",
            "preview"
        ]
    };


    fluid.tests.prefs.assertPresent = function (prefsEditor, expecteds) {
        fluid.each(expecteds, function (expected) {
            var value = fluid.get(prefsEditor, expected);
            jqUnit.assertTrue("Expected component at path " + expected, value);
        });
    };

    fluid.tests.prefs.checkModelSelections = function (message, expectedSelections, actualSelections) {
        jqUnit.assertLeftHand("Model correctly updated: " + message, expectedSelections.preferences || {}, actualSelections.preferences);
    };

    fluid.tests.prefs.applierRequestChanges = function (prefsEditor, selectionOptions) {
        prefsEditor.applier.change("", selectionOptions);
    };

    fluid.defaults("fluid.tests.prefs.globalSettingsStore", {
        gradeNames: ["fluid.prefs.globalSettingsStore"],
        distributeOptions: {
            target: "{that fluid.prefs.store}.options.gradeNames",
            record: "fluid.prefs.tempStore"
        }
    });

    fluid.tests.prefs.integrationTest = function (componentName, resetShouldSave) {
        // TODO: Rewrite this test case as a proper grade rather than a bunch of functions and state in a closure
        jqUnit.asyncTest(componentName + " Integration tests", function () {
            fluid.tests.prefs.globalSettingsStore();

            fluid.pageEnhancer({
                uiEnhancer: {
                    gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                    tocTemplate: "../../../../src/components/tableOfContents/html/TableOfContents.html",
                    tocMessage: "../../../../src/framework/preferences/messages/tableOfContents-enactor.json"
                }
            });
            var savedSelections;
            function testSave(selections) {
                savedSelections = selections;
            }
            var savedSelections2;
            function testSave2(selections) {
                savedSelections2 = selections;
            }

            function testComponent(prefsEditorLoader) {
                var prefsEditor = prefsEditorLoader.prefsEditor;
                var globalUIEnhancer = fluid.queryIoCSelector(fluid.rootComponent, "fluid.pageEnhancer", true)[0].uiEnhancer;
                var initialModel = prefsEditorLoader.initialModel;

                fluid.tests.prefs.assertPresent(prefsEditor, fluid.tests.prefs.expectedComponents[componentName]);
                fluid.tests.prefs.applierRequestChanges(prefsEditor, fluid.tests.prefs.bwSkin);

                var saveButton = prefsEditor.locate("save");
                saveButton.click();
                fluid.tests.prefs.checkModelSelections("model from bwSkin", fluid.tests.prefs.bwSkin, prefsEditor.model);
                jqUnit.assertDeepEq("Save event fired with selections", fluid.tests.prefs.bwSkin, savedSelections);
                jqUnit.assertDeepEq("Direct save event fired with selections", fluid.tests.prefs.bwSkin, savedSelections2);
                fluid.tests.prefs.applierRequestChanges(prefsEditor, fluid.tests.prefs.ybSkin);

                var cancelButton = prefsEditor.locate("cancel");
                cancelButton.click();
                fluid.tests.prefs.checkModelSelections("model from bwSkin (unchanged after cancel", fluid.tests.prefs.bwSkin, prefsEditor.model);

                var resetButton = prefsEditor.locate("reset");
                resetButton.click();
                fluid.tests.prefs.checkModelSelections("model from original", initialModel, prefsEditor.model);
                fluid.tests.prefs.applierRequestChanges(prefsEditor, fluid.tests.prefs.bwSkin);
                fluid.tests.prefs.checkModelSelections("model from original (correct state after reset)",
                    (resetShouldSave ? initialModel.preferences : fluid.tests.prefs.bwSkin.preferences), globalUIEnhancer.model);

                cancelButton.click();
                fluid.tests.prefs.checkModelSelections("model from original (correct state after reset and cancel)",
                    (resetShouldSave ? initialModel : fluid.tests.prefs.bwSkin), prefsEditor.model);

                jqUnit.start();
            }

            fluid.invokeGlobalFunction(componentName, ["#myPrefsEditor", {
                gradeNames: ["fluid.prefs.transformDefaultPanelsOptions", "fluid.prefs.initialModel.starter"],
                terms: {
                    templatePrefix: "../../../../src/framework/preferences/html/",
                    messagePrefix: "../../../../src/framework/preferences/messages/"
                },
                templateLoader: {
                    gradeNames: ["fluid.prefs.starterFullPreviewTemplateLoader"]
                },
                messageLoader: {
                    gradeNames: ["fluid.prefs.starterMessageLoader"]
                },
                prefsEditor: {
                    gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.uiEnhancerRelay"],
                    listeners: {
                        "onSave.direct": testSave2,
                        "onSave.munged": testSave
                    }
                },
                listeners: {
                    "onReady.runTest": {
                        listener: testComponent,
                        priority: "last"
                    }
                }
            }]);

        });
    };

    fluid.tests.prefs.enhancerOptions = {
        uiEnhancer: {
            gradeNames: ["fluid.uiEnhancer.starterEnactors", "fluid.prefs.initialModel.starter"],
            tocTemplate: "../../../../src/components/tableOfContents/html/TableOfContents.html",
            tocMessage: "../../../../src/framework/preferences/messages/tableOfContents-enactor.json",
            classnameMap: {
                "textFont": {
                    "default": "fl-font-times"
                },
                "theme": {
                    "yb": "fl-test"
                }
            }
        }
    };

    fluid.tests.prefs.testStrings = ["Test1", "Test2", "Test3", "Test4", "Test5", "Test6"];
    fluid.tests.prefs.testControlValues = ["a", "b", "c", "d", "e", "f"];

    fluid.tests.prefs.testComponentIntegration = function (prefsEditor) {
        var body = $("body");
        var testStrings = fluid.tests.prefs.testStrings;
        var testControlValues = fluid.tests.prefs.testControlValues;

        jqUnit.assertTrue("Times font is set", body.hasClass("fl-font-times"));
        jqUnit.assertTrue("The default test theme is set", body.hasClass("fl-test"));

        var actualTextFontStrings = prefsEditor.textFont.options.strings.textFont;
        var actualTextFontControlValues = prefsEditor.textFont.options.controlValues.textFont;

        jqUnit.assertEquals("There are 6 elements in the text font string list", 6, actualTextFontStrings.length);
        jqUnit.assertEquals("The first text font string value matches", testStrings[0], actualTextFontStrings[0]);
        jqUnit.assertEquals("The sixth text font string value matches", testStrings[5], actualTextFontStrings[5]);

        jqUnit.assertEquals("There are 6 elements in the text font control value list", 6, actualTextFontControlValues.length);
        jqUnit.assertEquals("The first text font control value matches", testControlValues[0], actualTextFontControlValues[0]);
        jqUnit.assertEquals("The sixth text font control value matches", testControlValues[5], actualTextFontControlValues[5]);
    };

    fluid.defaults("fluid.tests.prefs.mungingIntegrationBase", {
        gradeNames: ["fluid.prefs.transformDefaultPanelsOptions", "fluid.prefs.initialModel.starter"],
        terms: {
            templatePrefix: "../../../../src/framework/preferences/html",
            messagePrefix: "../../../../src/framework/preferences/messages"
        },
        textFont: {
            strings: {
                textFont: fluid.tests.prefs.testStrings
            },
            controlValues: {
                textFont: fluid.tests.prefs.testControlValues
            }
        },
        templateLoader: {
            gradeNames: ["fluid.prefs.starterFullPreviewTemplateLoader"]
        },
        messageLoader: {
            gradeNames: ["fluid.prefs.starterMessageLoader"]
        },
        prefsEditor: {
            gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.uiEnhancerRelay"]
        }
    });

    fluid.defaults("fluid.tests.prefs.mungingIntegration", {
        gradeNames: ["fluid.tests.prefs.mungingIntegrationBase"],
        members: {
            initialModel: {
                preferences: {
                    theme: "yb"
                }
            }
        },
        prefsEditor: {
            listeners: {
                "onReady.testComponentIntegration": {
                    funcName: "fluid.tests.prefs.testComponentIntegration",
                    priority: "before:jqUnitStart"
                },
                "onReady.jqUnitStart": {
                    func: "jqUnit.start",
                    priority: "last:testing"
                }
            }
        }
    });

    fluid.tests.prefs.mungingIntegrationTest = function (componentName, container, options) {

        jqUnit.asyncTest(componentName + " Munging Integration tests", function () {
            fluid.tests.prefs.globalSettingsStore();
            fluid.pageEnhancer(fluid.tests.prefs.enhancerOptions);
            fluid.invokeGlobalFunction(componentName, [container, options]);
        });
    };

})(jQuery);
