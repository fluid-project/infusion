/*
Copyright 2008-2010 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2011-2015 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";
    
    fluid.registerNamespace("fluid.tests.prefs");

    jqUnit.module("PrefsEditor ResourceLoader Tests");
    
    fluid.registerNamespace("fluid.tests.prefs.resourceLoader");
    
    fluid.tests.prefs.resourceLoader.linksControlsTemplateName = "PrefsEditorTemplate-linksControls.html";
    fluid.tests.prefs.resourceLoader.testTemplatePrefix = "../../../../src/framework/preferences/html/";
    fluid.tests.prefs.resourceLoader.textControlsFullResourcePath = "../../../../src/framework/preferences/html/PrefsEditorTemplate-textSize.html";

    fluid.defaults("fluid.tests.prefs.resourceLoader", {
        gradeNames: ["fluid.prefs.resourceLoader"],
        resources: {
            linksControls: "%prefix/" + fluid.tests.prefs.resourceLoader.linksControlsTemplateName,
            textControls: fluid.tests.prefs.resourceLoader.textControlsFullResourcePath
        },
        listeners: {
            onResourcesLoaded: "fluid.tests.prefs.resourceLoader.testTemplateLoader"
        },
        components: {
            resourcePath: {
                options: {
                    value: fluid.tests.prefs.resourceLoader.testTemplatePrefix
                }
            }
        }
    });
    
    fluid.tests.prefs.resourceLoader.testTemplateLoader = function (resources) {
        // The template with a customized full url
        jqUnit.assertEquals("textControls template url is set correctly", fluid.tests.prefs.resourceLoader.textControlsFullResourcePath, resources.textControls.url);
        jqUnit.assertTrue("textControls forceCache is set", resources.textControls.forceCache);

        // The template with prefix + customized name
        jqUnit.assertEquals("linksControls template url is set correctly", fluid.tests.prefs.resourceLoader.testTemplatePrefix + fluid.tests.prefs.resourceLoader.linksControlsTemplateName, resources.linksControls.url);
        jqUnit.assertTrue("linksControls forceCache is set", resources.linksControls.forceCache);

        jqUnit.start();
    };

    jqUnit.asyncTest("Template Loader", function () {
        jqUnit.expect(4);
        fluid.tests.prefs.resourceLoader();
    });
    
    fluid.tests.prefs.resourceLoader.lineSpaceTemplateName = "PrefsEditorTemplate-lineSpace.html";
    
    fluid.tests.prefs.resourceLoader.testCustomizedResourceLoader = function (resources) {
        jqUnit.assertEquals("lineSpace template url is set correctly", fluid.tests.prefs.resourceLoader.testTemplatePrefix + fluid.tests.prefs.resourceLoader.lineSpaceTemplateName, resources.lineSpace.url);
        jqUnit.assertTrue("lineSpace forceCache is set", resources.lineSpace.forceCache);

        jqUnit.start();
    };
    
    fluid.defaults("fluid.tests.prefs.customizedResourceLoader", {
        gradeNames: ["fluid.prefs.resourceLoader"],
        resources: {
            lineSpace: "%prefix/" + fluid.tests.prefs.resourceLoader.lineSpaceTemplateName
        },
        listeners: {
            onResourcesLoaded: "fluid.tests.prefs.resourceLoader.testCustomizedResourceLoader"
        },
        components: {
            resourcePath: {
                options: {
                    value: fluid.tests.prefs.resourceLoader.testTemplatePrefix
                }
            }
        }
    });

    jqUnit.asyncTest("Customized Template Loader", function () {
        jqUnit.expect(2);
        fluid.tests.prefs.customizedResourceLoader();
    });
    
    jqUnit.module("PrefsEditor Tests");
       
    fluid.tests.prefs.noteSaveCalled = function (that) {
        that.saveCalled = true;
    };
    
    fluid.defaults("fluid.tests.prefs.standardEditor", { // a mixin grade for fluid.prefs.prefsEditor
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
        members: {
            saveCalled: false
        },
        listeners: {
            onSave: {
                funcName: "fluid.tests.prefs.noteSaveCalled",
                args: "{prefsEditor}"
            }
        }
    });
    
            
    fluid.tests.prefs.templatePrefix = "../../../../src/framework/preferences/html/";
    fluid.tests.prefs.messagePrefix = "../../../../src/framework/preferences/messages/";

    fluid.defaults("fluid.tests.prefs.commonLoader", {
        gradeNames: ["fluid.prefs.prefsEditorLoader", "fluid.prefs.initialModel.starter"],
        templatePrefix: fluid.tests.prefs.templatePrefix,
        messagePrefix: fluid.tests.prefs.messagePrefix,
        messageLoader: {
            gradeNames: ["fluid.prefs.starterMessageLoader"]
        },
        templateLoader: {
            gradeNames: ["fluid.prefs.starterFullNoPreviewTemplateLoader"]
        },
        components: {
            prefsEditor: {
                container: "{commonLoader}.container",
                options: {
                    gradeNames: "fluid.tests.prefs.standardEditor"

                }
            }
        }
    });
    
    fluid.registerNamespace("fluid.tests.prefs.models");

    fluid.tests.prefs.models.bwSkin = {
        textSize: "1.8",
        textFont: "verdana",
        theme: "bw",
        lineSpace: 2
    };

    fluid.tests.prefs.models.bwSkin2 = {
        textSize: "1.1",
        textFont: "italic",
        theme: "cw",
        lineSpace: 1
    };

    fluid.tests.prefs.models.maxTextSize = {
        textSize: "2.0"
    };

    fluid.tests.prefs.models.minTextSize = {
        textSize: "1.0"
    };

    fluid.tests.prefs.testPrefsEditor = function (onReady, prefsEditorGrades, loaderGrades) {
        fluid.prefs.globalSettingsStore();
        fluid.tests.prefs.commonLoader("#ui-options", {
            gradeNames: fluid.makeArray(loaderGrades),
            distributeOptions: [{
                record: {
                    funcName: onReady,
                    args: ["{prefsEditor}", "{prefsEditorLoader}"]
                },
                target: "{that prefsEditor}.options.listeners.onReady"
            }, {
                record: fluid.makeArray(prefsEditorGrades),
                target: "{that prefsEditor}.options.gradeNames"
            }]
        });
    };

    fluid.tests.prefs.assertInitialModel = function (model) {
        jqUnit.expect(3);
        jqUnit.assertNotNull("Model is not null", model);
        jqUnit.assertNotUndefined("Model is not undefined", model);
        var initialModel = fluid.tests.mergeMembers(fluid.defaults("fluid.prefs.initialModel.starter").members.initialModel);
        jqUnit.assertDeepEq("Initial model is the starter initialModel", initialModel, model);
    };

    jqUnit.asyncTest("Init Model and Controls", function () {
        jqUnit.expect(4);

        fluid.tests.prefs.testPrefsEditor(function (prefsEditor) {
            fluid.tests.prefs.assertInitialModel(prefsEditor.model);

            var themeValues = prefsEditor.contrast.options.controlValues.theme;
            jqUnit.assertEquals("There are 6 themes in the control", 6, themeValues.length);
            jqUnit.assertEquals("The first theme is default", "default", themeValues[0]);

            var fontValues = prefsEditor.textFont.options.controlValues.textFont;
            jqUnit.assertEquals("There are 5 font values in the control", 5, fontValues.length);
            jqUnit.assertTrue("There is a default font value", fontValues.indexOf("default") !== -1);

            jqUnit.start();
        }, "fluid.prefs.starterPanels");
    });

    jqUnit.asyncTest("PrefsEditor Save, Reset, and Cancel", function () {
        jqUnit.expect(13);

        fluid.tests.prefs.testPrefsEditor(function (prefsEditor) {
            var bwSkin = fluid.tests.prefs.models.bwSkin;
            prefsEditor.applier.change("", bwSkin);

            jqUnit.assertFalse("Save hasn't been called", prefsEditor.saveCalled);
            prefsEditor.saveAndApply();
            jqUnit.assertTrue("Save has been called", prefsEditor.saveCalled);

            var uiEnhancerSettings = prefsEditor.getSettings();
            var container = $("body");
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
            prefsEditor.applier.change("", fluid.tests.prefs.models.bwSkin2);

            prefsEditor.cancel();
            jqUnit.assertEquals("Cancel text size change", bwSkin.textSize, prefsEditor.model.textSize);
            jqUnit.assertEquals("Cancel text font change", bwSkin.textFont, prefsEditor.model.textFont);
            jqUnit.assertEquals("Cancel theme change", bwSkin.theme, prefsEditor.model.theme);

            jqUnit.start();
        }, "fluid.prefs.starterPanels");
    });

    jqUnit.asyncTest("Refresh View", function () {
        jqUnit.expect(5);

        fluid.tests.prefs.testPrefsEditor(function (prefsEditor) {
            var bwSkin = fluid.tests.prefs.models.bwSkin;
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
        }, "fluid.prefs.starterPanels");
    });
    
    fluid.defaults("fluid.tests.prefs.diffInit", {
        distributeOptions: {
            record: {
                theme: "wb",
                textFont: "times"
            },
            target: "{fluid.prefs.prefsEditor}.options.members.initialModel"
        }
    });

    jqUnit.asyncTest("Init with site defaults different from PrefsEditor control values", function () {
        jqUnit.expect(2);

        fluid.tests.prefs.testPrefsEditor(function (prefsEditor) {
            var settings = prefsEditor.initialModel;

            var themeValue = settings.theme;
            jqUnit.assertEquals("The theme is set to wb", "wb", themeValue);

            var fontValue = settings.textFont;
            jqUnit.assertEquals("The font is set to times", "times", fontValue);
            jqUnit.start();
        }, ["fluid.prefs.starterPanels", "fluid.tests.prefs.diffInit"]);
    });
   
    /****************************************
     * Preferences Editor Integration tests *
     * **************************************/
    
    fluid.tests.prefs.applierRequestChanges = function (prefsEditor, selectionOptions) {
        prefsEditor.applier.requestChange("textFont", selectionOptions.textFont);
        prefsEditor.applier.requestChange("theme", selectionOptions.theme);
        prefsEditor.applier.requestChange("textSize", selectionOptions.textSize);
        prefsEditor.applier.requestChange("lineSpace", selectionOptions.lineSpace);
    };
    
    fluid.tests.prefs.checkPaths = function (prefsEditor, paths) {
        fluid.each(paths, function (exists, path) {
            jqUnit.assertEquals("Check existence of path " + path, exists, !!fluid.get(prefsEditor, path));
        });
    };

    fluid.tests.prefs.checkModelSelections = function (message, expectedSelections, actualSelections) {
        jqUnit.assertEquals(message + ": Text font correctly updated", expectedSelections.textFont, actualSelections.textFont);
        jqUnit.assertEquals(message + ": Theme correctly updated", expectedSelections.theme, actualSelections.theme);
        jqUnit.assertEquals(message + ": Text size correctly updated", expectedSelections.textSize, actualSelections.textSize);
        jqUnit.assertEquals(message + ": Line space correctly updated", expectedSelections.lineSpace, actualSelections.lineSpace);
    };

    fluid.tests.prefs.checkSettingsStore = function (message, expectedSelections, actualSelections, preSaveSelections) {
        fluid.each(expectedSelections, function (val, key) {
            if (val === preSaveSelections[key]) {
                jqUnit.assertUndefined("Only exactly changed options should be stored", actualSelections[key]);
            }
        });
    };

    fluid.tests.prefs.checkSaveCancel = function (prefsEditor, saveModel, cancelModel) {
        var saveButton = prefsEditor.locate("save");
        var cancelButton = prefsEditor.locate("cancel");
        var resetButton = prefsEditor.locate("reset");

        jqUnit.assertTrue("Initially, settings store settings are empty",
            $.isEmptyObject(prefsEditor.getSettings()));
        jqUnit.assertDeepEq("Initially, model should correspond to default model",
            prefsEditor.initialModel, prefsEditor.model);

        var preSaveSelections = fluid.copy(prefsEditor.model);
        fluid.tests.prefs.applierRequestChanges(prefsEditor, saveModel);
        fluid.tests.prefs.checkModelSelections("After apply saveModel", saveModel, prefsEditor.model);
        fluid.tests.prefs.checkSettingsStore("After apply saveModel", saveModel, prefsEditor.model,
            preSaveSelections);
        saveButton.click();
        fluid.tests.prefs.checkModelSelections("After clicking save", saveModel, prefsEditor.getSettings());
        fluid.tests.prefs.checkSettingsStore("After clicking save", saveModel, prefsEditor.getSettings(), preSaveSelections);
        fluid.tests.prefs.applierRequestChanges(prefsEditor, cancelModel);
        cancelButton.click();
        fluid.tests.prefs.checkModelSelections("After applying cancelModel and clicking cancel", saveModel, prefsEditor.getSettings());
        fluid.tests.prefs.checkSettingsStore("After applying cancelModel and clicking cancel", saveModel,
            prefsEditor.getSettings(), preSaveSelections);
        resetButton.click();
        fluid.tests.prefs.checkModelSelections("After clicking reset", prefsEditor.initialModel, prefsEditor.model);
        cancelButton.click();
        fluid.tests.prefs.checkModelSelections("After clicking cancel", saveModel, prefsEditor.getSettings());
        fluid.tests.prefs.checkSettingsStore("After clicking cancel", saveModel, prefsEditor.getSettings(), preSaveSelections);
        // apply the reset settings to make the test result page more readable
        resetButton.click();
        saveButton.click();
    };
    
    fluid.defaults("fluid.tests.prefs.testIntegration", {
        gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.initialModel.starter"],
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
        autoSave: false
    });
    
    fluid.tests.prefs.defaultPanelsPaths = {
        "uiEnhancer": true,
        "textSize": true,
        "lineSpace": true,
        "textFont": true,
        "contrast": true,
        "layoutControls": true,
        "linksControls": true,
        "uiEnhancer.options.components.tableOfContents": true
    };
    
    jqUnit.asyncTest("PrefsEditor Integration tests", function () {
        fluid.tests.prefs.testPrefsEditor(function (prefsEditor) {
            fluid.tests.prefs.checkPaths(prefsEditor, fluid.tests.prefs.defaultPanelsPaths);
            fluid.tests.prefs.checkSaveCancel(prefsEditor, fluid.tests.prefs.models.bwSkin, fluid.tests.prefs.models.bwSkin2);
            jqUnit.start();
        }, "fluid.tests.prefs.testIntegration");
    });

    fluid.defaults("fluid.tests.prefs.testNonDefaultIntegration", {
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
    });

    fluid.tests.prefs.customizedPanelPaths = {
        "uiEnhancer": true,
        "textSize": true,
        "lineSpace": false,
        "textFont": false,
        "contrast": false,
        "layoutControls": false,
        "linksControls": false,
        "uiEnhancer.options.components.tableOfContents": true
    };

    jqUnit.asyncTest("Non-default PrefsEditor Integration tests", function () {
        fluid.tests.prefs.testPrefsEditor(function (prefsEditor) {
            fluid.tests.prefs.checkPaths(prefsEditor, fluid.tests.prefs.customizedPanelPaths);
            fluid.tests.prefs.checkSaveCancel(prefsEditor, fluid.tests.prefs.models.maxTextSize, fluid.tests.prefs.models.minTextSize);
            jqUnit.start();
        }, "fluid.tests.prefs.testNonDefaultIntegration");
    });

    /*******************
     * Auto-save tests *
     *******************/
     
    fluid.defaults("fluid.prefs.tests.autoSave", {
        gradeNames: "fluid.prefs.starterPanels",
        autoSave: true
    });
    
    jqUnit.asyncTest("PrefsEditor Auto-save", function () {
        jqUnit.expect(2);

        fluid.tests.prefs.testPrefsEditor(function (prefsEditor) {
            prefsEditor.applier.change("", fluid.tests.prefs.models.bwSkin);
            jqUnit.assertTrue("Model has changed, auto-save changes", prefsEditor.saveCalled);

            var uiEnhancerSettings = prefsEditor.getSettings();
            jqUnit.assertDeepEq("bw setting was saved", fluid.tests.prefs.models.bwSkin.theme, uiEnhancerSettings.theme);

            prefsEditor.reset();
            jqUnit.start();
        }, "fluid.prefs.tests.autoSave");
    });


    /*****************
     * Preview tests *
     *****************/

    fluid.tests.prefs.templateUrl = "TestPreviewTemplate.html";
     
    fluid.defaults("fluid.prefs.tests.preview", {
        gradeNames: "fluid.prefs.starterPanels",
        components: {
            preview: {
                type: "fluid.prefs.preview",
                createOnEvent: "onReady",
                container: "{prefsEditor}.dom.previewFrame",
                options: {
                    templateUrl: fluid.tests.prefs.templateUrl,
                    listeners: {
                        onReady: {
                            funcName: "fluid.tests.prefs.testPreview",
                            args: "{prefsEditor}"
                        }
                    }
                }
            }
        }
    });
    
    fluid.defaults("fluid.prefs.tests.preview.loader", {
        distributeOptions: {
            target: "{that templateLoader}.options",
            record: {
                resources: {
                    prefsEditor: fluid.tests.prefs.templatePrefix + "FullPreviewPrefsEditor.html"
                }
            }
        }
    });

    fluid.tests.prefs.testPreview = function (prefsEditor) {
        jqUnit.assertEquals("The preview iFrame is pointing to the specified markup",
                fluid.tests.prefs.templateUrl, prefsEditor.preview.container.attr("src"));
        jqUnit.start();
    };

    jqUnit.asyncTest("Preview URL", function () {
        jqUnit.expect(1);
        fluid.tests.prefs.testPrefsEditor(fluid.identity, "fluid.prefs.tests.preview", "fluid.prefs.tests.preview.loader");
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

    fluid.defaults("fluid.tests.prefs.locale", {
        gradeNames: ["fluid.prefs.initialModel.localeStarter"],
        defaultLocale: "en",
        messagePrefix: "../data/"
    });
    
    fluid.tests.prefs.testLocale = function (prefsEditor, prefsEditorLoader) {
        jqUnit.assertEquals("The locale value in the initial model has been set properly", "fr", prefsEditorLoader.initialModel.locale);
        jqUnit.assertEquals("The locale value in the settings has been set properly", "fr", prefsEditorLoader.settings.locale);
        jqUnit.assertEquals("The locale value in the initial model has been passed to the prefs editor", "fr", prefsEditorLoader.prefsEditor.initialModel.locale);
        jqUnit.assertEquals("The default locale value in the message loader has been set properly", "en", prefsEditorLoader.messageLoader.options.defaultLocale);
        jqUnit.assertEquals("The locale value in the message loader has been set properly", "fr", prefsEditorLoader.messageLoader.options.locale);
        jqUnit.start();
    };

    jqUnit.asyncTest("Locale Tests", function () {
        jqUnit.expect(5);

        fluid.tests.prefs.testPrefsEditor(fluid.tests.prefs.testLocale, [], "fluid.tests.prefs.locale");
    });
    
      
})(jQuery);
