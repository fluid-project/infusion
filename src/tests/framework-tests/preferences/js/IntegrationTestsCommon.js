/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, start, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {

    fluid.staticEnvironment.prefsEditorTest = fluid.typeTag("fluid.tests.prefs");

    // Use temp store rather than the cookie store for setting save
    fluid.demands("fluid.prefs.store", ["fluid.globalSettingsStore", "fluid.tests.prefs"], {
        funcName: "fluid.tempStore"
    });

    // Supply the table of contents' template URL
    fluid.demands("fluid.prefs.enactor.tableOfContents", ["fluid.uiEnhancer"], {
        options: {
            templateUrl: "../../../../components/tableOfContents/html/TableOfContents.html"
        }
    });

    fluid.registerNamespace("fluid.tests.prefs");

    fluid.tests.prefs.bwSkin = {
        textSize: "1.8",
        textFont: "verdana",
        theme: "bw",
        lineSpace: 2
    };

    fluid.tests.prefs.ybSkin = {
        textSize: "2",
        textFont: "comic sans",
        theme: "yb",
        lineSpace: 1.5
    };

    fluid.tests.prefs.expectedComponents = {
        "fluid.prefs.separatedPanel": [
            "textSize",
            "lineSpace",
            "textFont",
            "contrast",
            "layoutControls",
            "linksControls"
        ],
        "fluid.prefs.fullNoPreview": [
            "textSize",
            "lineSpace",
            "textFont",
            "contrast",
            "layoutControls",
            "linksControls"
        ],
        "fluid.prefs.fullPreview": [
            "textSize",
            "lineSpace",
            "textFont",
            "contrast",
            "layoutControls",
            "linksControls",
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
        jqUnit.assertLeftHand("Model correctly updated: " + message, expectedSelections, actualSelections);
    };

    fluid.tests.prefs.applierRequestChanges = function (prefsEditor, selectionOptions) {
        fluid.each(selectionOptions, function (value, key) {
            prefsEditor.applier.requestChange("" + key, value);
        });
    };

    fluid.tests.prefs.integrationTest = function (componentName, resetShouldSave) {
        jqUnit.asyncTest(componentName + " Integration tests", function () {
            fluid.globalSettingsStore();
            fluid.pageEnhancer({
                uiEnhancer: {
                    gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                    tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
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
                var rootModel = prefsEditor.rootModel;

                fluid.tests.prefs.assertPresent(prefsEditor, fluid.tests.prefs.expectedComponents[componentName]);
                fluid.tests.prefs.applierRequestChanges(prefsEditor, fluid.tests.prefs.bwSkin);

                var saveButton = prefsEditor.locate("save");
                saveButton.click();
                fluid.tests.prefs.checkModelSelections("model from bwSkin", fluid.tests.prefs.bwSkin, prefsEditor.model);
                jqUnit.assertEquals("Save event fired with selections", prefsEditor.model, savedSelections);
                jqUnit.assertEquals("Direct save event fired with selections", prefsEditor.model, savedSelections2);
                fluid.tests.prefs.applierRequestChanges(prefsEditor, fluid.tests.prefs.ybSkin);

                var cancelButton = prefsEditor.locate("cancel");
                cancelButton.click();
                fluid.tests.prefs.checkModelSelections("model from bwSkin (unchanged after cancel", fluid.tests.prefs.bwSkin, prefsEditor.model);

                var resetButton = prefsEditor.locate("reset");
                resetButton.click();
                fluid.tests.prefs.checkModelSelections("model from original", rootModel, prefsEditor.model);
                fluid.tests.prefs.applierRequestChanges(prefsEditor, fluid.tests.prefs.bwSkin);
                fluid.tests.prefs.checkModelSelections("model from original (correct state after reset)",
                    (resetShouldSave ? rootModel : fluid.tests.prefs.bwSkin), fluid.staticEnvironment.uiEnhancer.model);

                cancelButton.click();
                fluid.tests.prefs.checkModelSelections("model from original (correct state after reset and cancel)",
                    (resetShouldSave ? rootModel : fluid.tests.prefs.bwSkin), prefsEditor.model);

                jqUnit.start();
            }

            var that = fluid.invokeGlobalFunction(componentName, ["#myPrefsEditor", {
                gradeNames: ["fluid.prefs.transformDefaultPanelsOptions"],
                templatePrefix: "../../../../framework/preferences/html/",
                messagePrefix: "../../../../framework/preferences/messages/",
                templateLoader: {
                    gradeNames: ["fluid.prefs.starterFullPreviewTemplateLoader"]
                },
                messageLoader: {
                    gradeNames: ["fluid.prefs.starterMessageLoader"]
                },
                prefsEditor: {
                    gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.rootModel.starter", "fluid.prefs.uiEnhancerRelay"],
                    listeners: {
                        "onSave.direct": testSave2,
                        "onSave.munged": testSave
                    }
                },
                listeners: {
                    onReady: {
                        listener: testComponent,
                        priority: "last"
                    }
                }
            }]);

        });
    };

    fluid.tests.prefs.enhancerOptions = {
        uiEnhancer: {
            gradeNames: ["fluid.uiEnhancer.starterEnactors", "fluid.prefs.rootModel.starter"],
            tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html",
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

    fluid.tests.prefs.testStrings = ["Test1", "Test2", "Test3", "Test4", "Test5"];
    fluid.tests.prefs.testControlValues = ["a", "b", "c", "d", "e"];

    fluid.tests.prefs.testComponentIntegration = function (prefsEditor) {
        var body = $("body");
        var testStrings = fluid.tests.prefs.testStrings;
        var testControlValues = fluid.tests.prefs.testControlValues;

        jqUnit.assertTrue("Times font is set", body.hasClass("fl-font-times"));
        jqUnit.assertTrue("The default test theme is set", body.hasClass("fl-test"));

        var actualTextFontStrings = prefsEditor.textFont.options.strings.textFont;
        var actualTextFontControlValues = prefsEditor.textFont.options.controlValues.textFont;

        jqUnit.assertEquals("There are 5 elements in the text font string list", 5, actualTextFontStrings.length);
        jqUnit.assertEquals("The first text font string value matches", testStrings[0], actualTextFontStrings[0]);
        jqUnit.assertEquals("The fifth text font string value matches", testStrings[4], actualTextFontStrings[4]);

        jqUnit.assertEquals("There are 5 elements in the text font control value list", 5, actualTextFontControlValues.length);
        jqUnit.assertEquals("The first text font control value matches", testControlValues[0], actualTextFontControlValues[0]);
        jqUnit.assertEquals("The fifth text font control value matches", testControlValues[4], actualTextFontControlValues[4]);
    };

    fluid.tests.prefs.mungingIntegrationOptions = {
        gradeNames: ["fluid.prefs.transformDefaultPanelsOptions"],
        templatePrefix: "../../../../framework/preferences/html/",
        messagePrefix: "../../../../framework/preferences/messages/",
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
            gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.rootModel.starter", "fluid.prefs.uiEnhancerRelay"]
        }
    };

    fluid.tests.prefs.mungingIntegrationTest = function (componentName, container, extraOpts, extraListener) {
        extraListener = extraListener || function () { jqUnit.start(); };

        jqUnit.asyncTest(componentName + " Munging Integration tests", function () {
            fluid.globalSettingsStore();
            fluid.pageEnhancer(fluid.tests.prefs.enhancerOptions);
            var options = fluid.merge(null, fluid.tests.prefs.mungingIntegrationOptions, {
                prefsEditor: {
                    members: {
                        rootModel: {
                            theme: "yb"
                        }
                    },
                    listeners: {
                        onReady: [
                            "fluid.tests.prefs.testComponentIntegration",
                            extraListener
                        ]
                    }
                }
            }, extraOpts);
            fluid.invokeGlobalFunction(componentName, [container, options]);
        });
    };

})(jQuery);
