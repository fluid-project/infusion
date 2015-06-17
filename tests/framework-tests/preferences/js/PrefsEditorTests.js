/*
Copyright 2008-2010 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {
        fluid.enhance.check({"fluid.prefs.tests": true});

        var templatePrefix = "../../../../src/framework/preferences/html";
        var messagePrefix = "../../../../src/framework/preferences/messages";

        // Define a default configuration but will specify different demands to test the full config with settings
        fluid.defaults("fluid.prefsTests", {
            gradeNames: ["fluid.prefs.prefsEditorLoader", "fluid.prefs.initialModel.starter", "autoInit"],
            terms: {
                templatePrefix: templatePrefix,
                messagePrefix: messagePrefix
            },
            messageLoader: {
                gradeNames: ["fluid.prefs.starterMessageLoader"]
            },
            templateLoader: {
                gradeNames: ["fluid.prefs.starterFullNoPreviewTemplateLoader"]
            },
            components: {
                prefsEditor: {
                    container: "{prefsTests}.container"
                }
            },
            prefsEditorListener: {
                "onReady.runTest": "fluid.prefsTests.testFn"
            },
            distributeOptions: {
                source: "{that}.options.prefsEditorListener",
                target: "{that > prefsEditor}.options.listeners",
                removeSource: true
            }
        });

        // Options for PrefsEditor
        var saveCalled = false;

        fluid.demands("fluid.prefs.prefsEditor", ["fluid.prefsTests", "fluid.prefs.tests"], {
            funcName: "fluid.prefs.starterPanels",
            options: {
                gradeNames: ["fluid.prefs.uiEnhancerRelay"],
                components: {
                    uiEnhancer: {
                        type: "fluid.uiEnhancer",
                        container: "body",
                        priority: "first",
                        options: {
                            gradeNames: ["fluid.uiEnhancer.starterEnactors"]
                        }
                    }
                },
                listeners: {
                    onSave: function () {
                        saveCalled = true;
                    }
                }
            }
        });

        fluid.demands("fluid.prefs.store", ["fluid.globalSettingsStore", "fluid.prefs.tests"], {
            funcName: "fluid.tempStore"
        });

        var bwSkin = {
            textSize: "1.8",
            textFont: "verdana",
            theme: "bw",
            lineSpace: 2
        };

        var bwSkin2 = {
            textSize: "1.1",
            textFont: "italic",
            theme: "cw",
            lineSpace: 1
        };

        var maxTextSize = {
            textSize: "2.0"
        };

        var minTextSize = {
            textSize: "1.0"
        };

        var testPrefsEditor = function (testFn, prefsEditor) {
            prefsEditor = prefsEditor || fluid.prefsTests;
            prefsEditor.testFn = testFn;
            fluid.globalSettingsStore();
            prefsEditor("#ui-options");
        };

        var resetSaveCalled = function () {
            saveCalled = false;
        };

        jqUnit.module("PrefsEditor Tests");

        jqUnit.asyncTest("Template Loader", function () {
            jqUnit.expect(8);

            var testTemplatePrefix = "../../../../src/framework/preferences/html";
            var textControlsFullPath = "../../../../src/framework/preferences/html/PrefsEditorTemplate-textSize.html";
            var linksControlsTemplateName = "PrefsEditorTemplate-linksControls.html";

            function testTemplateLoader(resources) {
                // The template with a customized full url
                jqUnit.assertEquals("textControls template url is set correctly", textControlsFullPath, resources.textControls.url);
                jqUnit.assertTrue("textControls forceCache is set", resources.textControls.forceCache);
                jqUnit.assertEquals("textControls defaultLocale is set correctly in the resource spec", "en", resources.textControls.defaultLocale);
                jqUnit.assertEquals("textControls locale is set correctly in the resource spec", "fr", resources.textControls.locale);

                // The template with prefix + customized name
                jqUnit.assertEquals("linksControls template url is set correctly", testTemplatePrefix + "/" + linksControlsTemplateName, resources.linksControls.url);
                jqUnit.assertTrue("linksControls forceCache is set", resources.linksControls.forceCache);
                jqUnit.assertEquals("linksControls defaultLocale is set correctly in the resource spec", "en", resources.linksControls.defaultLocale);
                jqUnit.assertEquals("linksControls locale is set correctly in the resource spec", "fr", resources.linksControls.locale);

                jqUnit.start();
            }

            fluid.defaults("fluid.prefsTestResourceLoader", {
                gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                defaultLocale: "en",
                locale: "fr",
                resources: {
                    linksControls: "%prefix/" + linksControlsTemplateName,
                    textControls: textControlsFullPath
                },
                listeners: {
                    onResourcesLoaded: testTemplateLoader
                },
                terms: {
                    prefix: testTemplatePrefix
                }
            });

            fluid.prefsTestResourceLoader(null);
        });

        jqUnit.asyncTest("Customized Template Loader", function () {
            jqUnit.expect(2);

            var testTemplatePrefix = "../../../../src/framework/preferences/html";
            var lineSpaceTemplateName = "PrefsEditorTemplate-lineSpace.html";

            function testCustomizedResourceLoader(resources) {
                jqUnit.assertEquals("lineSpace template url is set correctly", testTemplatePrefix + "/" + lineSpaceTemplateName, resources.lineSpace.url);
                jqUnit.assertTrue("lineSpace forceCache is set", resources.lineSpace.forceCache);

                jqUnit.start();
            }

            fluid.defaults("fluid.prefs.customizedResourceLoader", {
                gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                resources: {
                    lineSpace: "%prefix/" + lineSpaceTemplateName
                },
                listeners: {
                    onResourcesLoaded: testCustomizedResourceLoader
                },
                terms: {
                    prefix: testTemplatePrefix
                }
            });

            fluid.defaults("fluid.prefsCustomizedResourceLoader", {
                gradeNames: ["fluid.littleComponent", "autoInit"],
                components: {
                    resourceLoader: {
                        type: "fluid.prefs.resourceLoader",
                        options: {
                            gradeNames: ["fluid.prefs.customizedResourceLoader"]
                        }
                    }
                }
            });

            fluid.prefsCustomizedResourceLoader(null);
        });

        var assertinitialModel = function (model) {
            jqUnit.expect(3);
            jqUnit.assertNotNull("Model is not null", model);
            jqUnit.assertNotUndefined("Model is not undefined", model);
            jqUnit.assertDeepEq("Initial model is the starter initialModel", fluid.defaults("fluid.prefs.initialModel.starter").members.initialModel, model);
        };

        jqUnit.asyncTest("Init Model - default", function () {
            testPrefsEditor(function (prefsEditor) {
                assertinitialModel(prefsEditor.model);
                jqUnit.start();
            });
        });

        jqUnit.asyncTest("Init Model and Controls", function () {
            jqUnit.expect(4);

            testPrefsEditor(function (prefsEditor) {
                assertinitialModel(prefsEditor.model);

                var themeValues = prefsEditor.contrast.options.controlValues.theme;
                jqUnit.assertEquals("There are 6 themes in the control", 6, themeValues.length);
                jqUnit.assertEquals("The first theme is default", "default", themeValues[0]);

                var fontValues = prefsEditor.textFont.options.controlValues.textFont;
                jqUnit.assertEquals("There are 5 font values in the control", 5, fontValues.length);
                jqUnit.assertEquals("There is default font value", 0, jQuery.inArray("default", fontValues));

                jqUnit.start();
            });
        });

        jqUnit.asyncTest("PrefsEditor Save, Reset, and Cancel", function () {
            jqUnit.expect(13);

            testPrefsEditor(function (prefsEditor) {
                prefsEditor.applier.change("", bwSkin);

                jqUnit.assertFalse("Save hasn't been called", saveCalled);
                prefsEditor.saveAndApply();
                var container = $("body");
                jqUnit.assertTrue("Save has been called", saveCalled);

                var uiEnhancerSettings = prefsEditor.getSettings();
                jqUnit.assertDeepEq("bw setting was saved", bwSkin.theme, uiEnhancerSettings.theme);
                jqUnit.assertTrue("Body has the high contrast colour scheme", container.hasClass("fl-theme-bw"));
                jqUnit.assertEquals("Text size has been saved", bwSkin.textSize, prefsEditor.model.textSize);
                jqUnit.assertEquals("Text font has been saved", bwSkin.textFont, prefsEditor.model.textFont);
                jqUnit.assertEquals("Theme has been saved", bwSkin.theme, prefsEditor.model.theme);

                prefsEditor.reset();
                jqUnit.assertNotEquals("Reset model text size", bwSkin.textSize, prefsEditor.options.textSize);
                jqUnit.assertNotEquals("Reset model text font", bwSkin.textFont, prefsEditor.options.textFont);
                jqUnit.assertNotEquals("Reset model theme", bwSkin.theme, prefsEditor.options.theme);

                prefsEditor.applier.change("", bwSkin);
                prefsEditor.applier.change("", bwSkin2);

                prefsEditor.cancel();
                jqUnit.assertEquals("Cancel text size change", bwSkin.textSize, prefsEditor.model.textSize);
                jqUnit.assertEquals("Cancel text font change", bwSkin.textFont, prefsEditor.model.textFont);
                jqUnit.assertEquals("Cancel theme change", bwSkin.theme, prefsEditor.model.theme);

                jqUnit.start();
            });
        });

        jqUnit.asyncTest("Refresh View", function () {
            jqUnit.expect(5);

            testPrefsEditor(function (prefsEditor) {
                prefsEditor.applier.change("", bwSkin);

                jqUnit.assertEquals("bw setting was set in the model", bwSkin.theme, prefsEditor.model.theme);

                var uiEnhancerSettings = prefsEditor.getSettings();
                jqUnit.assertUndefined("bw setting was not saved", uiEnhancerSettings);

                prefsEditor.events.onPrefsEditorRefresh.fire();
                var fontSizeCtrl = $(".flc-prefsEditor-min-text-size");
                var fontSizeSetting = $(".flc-textfieldSlider-field", fontSizeCtrl).val();
                jqUnit.assertEquals("Small font size selected", "1.8", fontSizeSetting);
                var fontStyleSelection = $(":selected", $(".flc-prefsEditor-text-font"));
                jqUnit.assertEquals("Verdana selected", "verdana", fontStyleSelection[0].value);
                var contrastSelection = $(":checked", $(".flc-prefsEditor-contrast"));
                jqUnit.assertEquals("Black on white is selected", "bw", contrastSelection[0].value);

                prefsEditor.reset();
                jqUnit.start();
            });
        });

        jqUnit.asyncTest("Init with site defaults different from PrefsEditor control values", function () {
            jqUnit.expect(2);

            fluid.enhance.check({"fluid.prefs.testDiffInit": true});

            fluid.demands("fluid.prefs.prefsEditor", ["fluid.prefsTests", "fluid.prefs.tests", "fluid.prefs.testDiffInit"], {
                options: {
                    members: {
                        initialModel: {
                            theme: "wb",
                            textFont: "times"
                        }
                    }
                }
            });

            testPrefsEditor(function (prefsEditor) {
                var settings = prefsEditor.initialModel;

                var themeValue = settings.theme;
                jqUnit.assertEquals("The theme is set to wb", "wb", themeValue);

                var fontValue = settings.textFont;
                jqUnit.assertEquals("The font is set to times", "times", fontValue);

                fluid.enhance.forget("fluid.prefs.testDiffInit");
                jqUnit.start();
            });
        });

        /****************************************
         * Preferences Editor Integration tests *
         * **************************************/

        var applierRequestChanges = function (prefsEditor, selectionOptions) {
            prefsEditor.applier.requestChange("textFont", selectionOptions.textFont);
            prefsEditor.applier.requestChange("theme", selectionOptions.theme);
            prefsEditor.applier.requestChange("textSize", selectionOptions.textSize);
            prefsEditor.applier.requestChange("lineSpace", selectionOptions.lineSpace);
        };

        var checkPaths = function (prefsEditor, paths) {
            fluid.each(paths, function (exists, path) {
                jqUnit.assertEquals("Check existence of path " + path, exists, !!fluid.get(prefsEditor, path));
            });
        };

        var checkModelSelections = function (message, expectedSelections, actualSelections) {
            jqUnit.assertEquals(message + ": Text font correctly updated", expectedSelections.textFont, actualSelections.textFont);
            jqUnit.assertEquals(message + ": Theme correctly updated", expectedSelections.theme, actualSelections.theme);
            jqUnit.assertEquals(message + ": Text size correctly updated", expectedSelections.textSize, actualSelections.textSize);
            jqUnit.assertEquals(message + ": Line space correctly updated", expectedSelections.lineSpace, actualSelections.lineSpace);
        };

        var checkSettingsStore = function (message, expectedSelections, actualSelections, preSaveSelections) {
            fluid.each(expectedSelections, function (val, key) {
                if (val === preSaveSelections[key]) {
                    jqUnit.assertUndefined("Only exactly changed options should be stored", actualSelections[key]);
                }
            });
        };

        var checkSaveCancel = function (prefsEditor, saveModel, cancelModel) {
            var saveButton = prefsEditor.locate("save");
            var cancelButton = prefsEditor.locate("cancel");
            var resetButton = prefsEditor.locate("reset");

            jqUnit.assertTrue("Initially, settings store settings are empty",
                $.isEmptyObject(prefsEditor.getSettings()));
            jqUnit.assertDeepEq("Initially, model should correspond to default model",
                prefsEditor.initialModel, prefsEditor.model);

            var preSaveSelections = fluid.copy(prefsEditor.model);
            applierRequestChanges(prefsEditor, saveModel);
            checkModelSelections("After apply saveModel", saveModel, prefsEditor.model);
            checkSettingsStore("After apply saveModel", saveModel, prefsEditor.model,
                preSaveSelections);
            saveButton.click();
            checkModelSelections("After clicking save", saveModel, prefsEditor.getSettings());
            checkSettingsStore("After clicking save", saveModel, prefsEditor.getSettings(), preSaveSelections);
            applierRequestChanges(prefsEditor, cancelModel);
            cancelButton.click();
            checkModelSelections("After applying cancelModel and clicking cancel", saveModel, prefsEditor.getSettings());
            checkSettingsStore("After applying cancelModel and clicking cancel", saveModel,
                prefsEditor.getSettings(), preSaveSelections);
            resetButton.click();
            checkModelSelections("After clicking reset", prefsEditor.initialModel, prefsEditor.model);
            cancelButton.click();
            checkModelSelections("After clicking cancel", saveModel, prefsEditor.getSettings());
            checkSettingsStore("After clicking cancel", saveModel, prefsEditor.getSettings(), preSaveSelections);
            // apply the reset settings to make the test result page more readable
            resetButton.click();
            saveButton.click();
        };

        jqUnit.asyncTest("Non-default PrefsEditor Integration tests", function () {
            fluid.enhance.check({"fluid.prefs.testsNonDefaultIntegration": true});

            fluid.demands("fluid.prefs.prefsEditor", ["fluid.prefs.testsNonDefaultIntegration", "fluid.prefs.tests", "fluid.prefsTests"], {
                funcName: "fluid.prefs.prefsEditor",
                options: {
                    selectors: {
                        textSize: ".flc-prefsEditor-text-size"
                    },
                    components: {
                        textSize: {
                            type: "fluid.prefs.panel.textSize",
                            container: "{prefsEditor}.dom.textSize",
                            createOnEvent: "onPrefsEditorMarkupReady",
                            options: {
                                listeners: {
                                    "{prefsEditor}.events.onPrefsEditorRefresh": "{that}.refreshView"
                                },
                                resources: {
                                    template: "{templateLoader}.resources.textSize"
                                }
                            }
                        },
                        uiEnhancer: {
                            type: "fluid.uiEnhancer",
                            container: "body",
                            priority: "first",
                            options: {
                                components: {
                                    textSize: {
                                        type: "fluid.prefs.enactor.textSize",
                                        container: "{uiEnhancer}.container",
                                        options: {
                                            fontSizeMap: "{uiEnhancer}.options.fontSizeMap",
                                            value: "{uiEnhancer}.model.textSize"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    autoSave: false
                }
            });

            testPrefsEditor(function (prefsEditor) {
                var customizedPanelPaths = {
                    "uiEnhancer": true,
                    "textSize": true,
                    "lineSpace": false,
                    "textFont": false,
                    "contrast": false,
                    "layoutControls": false,
                    "linksControls": false,
                    "uiEnhancer.options.components.tableOfContents": true
                };

                checkPaths(prefsEditor, customizedPanelPaths);
                checkSaveCancel(prefsEditor, maxTextSize, minTextSize);
                fluid.enhance.forget("fluid.prefs.testsNonDefaultIntegration");
                jqUnit.start();
            });
        });

        applierRequestChanges = function (prefsEditor, selectionOptions) {
            prefsEditor.applier.requestChange("textFont", selectionOptions.textFont);
            prefsEditor.applier.requestChange("theme", selectionOptions.theme);
            prefsEditor.applier.requestChange("textSize", selectionOptions.textSize);
            prefsEditor.applier.requestChange("lineSpace", selectionOptions.lineSpace);
        };

        jqUnit.asyncTest("PrefsEditor Integration tests", function () {
            fluid.enhance.check({"fluid.prefs.testsIntegration": true});

            fluid.demands("fluid.prefs.prefsEditor", ["fluid.prefs.testsIntegration", "fluid.prefs.tests", "fluid.prefsTests"], {
                funcName: "fluid.prefs.starterPanels",
                options: {
                    gradeNames: ["fluid.prefs.initialModel.starter", "fluid.prefs.settingsGetter"],
                    components: {
                        uiEnhancer: {
                            type: "fluid.uiEnhancer",
                            container: "body",
                            priority: "first",
                            options: {
                                gradeNames: ["fluid.uiEnhancer.starterEnactors"]
                            }
                        }
                    },
                    listeners: {
                        onSave: function () {
                            saveCalled = true;
                        }
                    },
                    autoSave: false
                }
            });

            testPrefsEditor(function (prefsEditor) {
                var defaultPanelsPaths = {
                    "uiEnhancer": true,
                    "textSize": true,
                    "lineSpace": true,
                    "textFont": true,
                    "contrast": true,
                    "layoutControls": true,
                    "linksControls": true,
                    "uiEnhancer.options.components.tableOfContents": true
                };

                checkPaths(prefsEditor, defaultPanelsPaths);
                checkSaveCancel(prefsEditor, bwSkin, bwSkin2);
                fluid.enhance.forget("fluid.prefs.testsIntegration");
                jqUnit.start();
            });
        });

        // The following two tests (auto-save and preview) need to run at the end of the test file because they cause failures
        // on the subsequent unit tests when they were placed before other tests, due to the possibility that the demands blocks
        // issued specifically within their own staticEnvironment are still in effect on the subsequent tests.
        /*******************
         * Auto-save tests *
         *******************/
        jqUnit.asyncTest("PrefsEditor Auto-save", function () {
            jqUnit.expect(2);

            fluid.enhance.check({"fluid.prefs.testsAutoSave": true});

            fluid.demands("fluid.prefs.prefsEditor", ["fluid.prefs.testsAutoSave", "fluid.prefsTests", "fluid.prefs.tests"], {
                options: {
                    autoSave: true
                }
            });

            testPrefsEditor(function (prefsEditor) {
                resetSaveCalled();
                prefsEditor.applier.change("", bwSkin);
                jqUnit.assertTrue("Model has changed, auto-save changes", saveCalled);

                var uiEnhancerSettings = prefsEditor.getSettings();
                jqUnit.assertDeepEq("bw setting was saved", bwSkin.theme, uiEnhancerSettings.theme);

                fluid.enhance.forget("fluid.prefs.prefsEditorTestsAutoSave");
                prefsEditor.reset();
                jqUnit.start();
            });

        });

        /*****************
         * Preview tests *
         *****************/

        jqUnit.asyncTest("Preview URL", function () {
            jqUnit.expect(1);

            fluid.enhance.check({"fluid.prefs.testsPreview": true});

            fluid.demands("templateLoader", ["fluid.prefsTests", "fluid.prefs.tests", "fluid.prefs.testsPreview"], {
                options: {
                    resources: {
                        prefsEditor: templatePrefix + "/FullPreviewPrefsEditor.html"
                    }
                }
            });

            var templateUrl = "TestPreviewTemplate.html";
            var prefsEditor;

            var testPreview = function () {
                jqUnit.assertEquals("The preview iFrame is pointing to the specified markup",
                        templateUrl, prefsEditor.preview.container.attr("src"));

                fluid.enhance.forget("fluid.prefs.testsPreview");
                jqUnit.start();
            };

            fluid.demands("fluid.prefs.prefsEditor", ["fluid.prefsTests", "fluid.prefs.tests", "fluid.prefs.testsPreview"], {
                options: {
                    components: {
                        preview: {
                            type: "fluid.prefs.preview",
                            createOnEvent: "onReady",
                            container: "{prefsEditor}.dom.previewFrame",
                            options: {
                                templateUrl: templateUrl,
                                listeners: {
                                    onReady: testPreview
                                }
                            }
                        }
                    }
                }
            });

            testPrefsEditor(function (prefsEditorIn) {
                prefsEditor = prefsEditorIn;
            });
        });

        /****************
         * Locale tests *
         ****************/

        fluid.defaults("fluid.prefs.initialModel.localeStarter", {
            members: {
                initialModel: {
                    locale: "fr"
                }
            }
        });

        fluid.defaults("fluid.prefsLocaleTests", {
            gradeNames: ["fluid.prefsTests", "fluid.prefs.initialModel.localeStarter", "autoInit"],
            defaultLocale: "en",
            messagePrefix: "../data/",
            prefsEditorListener: {
                "onReady.runTest": {
                    funcName: "fluid.prefsLocaleTests.testFn",
                    args: ["{prefsLocaleTests}"]
                }
            }
        });

        jqUnit.asyncTest("Locale Tests", function () {
            jqUnit.expect(5);

            testPrefsEditor(function (prefsEditorLoader) {
                jqUnit.assertEquals("The locale value in the initial model has been set properly", "fr", prefsEditorLoader.initialModel.locale);
                jqUnit.assertEquals("The locale value in the settings has been set properly", "fr", prefsEditorLoader.settings.locale);
                jqUnit.assertEquals("The locale value in the initial model has been passed to the prefs editor", "fr", prefsEditorLoader.prefsEditor.initialModel.locale);
                jqUnit.assertEquals("The default locale value in the message loader has been set properly", "en", prefsEditorLoader.messageLoader.options.defaultLocale);
                jqUnit.assertEquals("The locale value in the message loader has been set properly", "fr", prefsEditorLoader.messageLoader.options.locale);
                jqUnit.start();
            }, fluid.prefsLocaleTests);
        });

    });
})(jQuery);
