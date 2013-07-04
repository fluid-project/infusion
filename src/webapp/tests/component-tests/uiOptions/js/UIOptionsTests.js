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
/*global fluid, jqUnit, expect, start, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        fluid.enhance.check({"fluid.uiOptions.tests": true});

        var templatePrefix = "../../../../components/uiOptions/html/";
        
        fluid.defaults("fluid.uiOptionsDefaultTests", {
            gradeNames: ["fluid.viewComponent", "autoInit"],
            components: {
                uiOptionsLoader: {
                    type: "fluid.uiOptions.loader",
                    container: "{uiOptionsTests}.container",
                    options: {
                        listeners: {
                            onReady: "fluid.uiOptionsTests.testFn"
                        }
                    }
                },
                templateLoader: {
                    type: "fluid.uiOptions.templateLoader",
                    priority: "first",
                    options: {
                        gradeNames: ["fluid.uiOptions.starterTemplateLoader"],
                        templates: {
                            uiOptions: templatePrefix + "FullNoPreviewUIOptions.html"
                        }
                    }
                }
            },
            prefix: templatePrefix
        });
        
        // use "fluid.uiOptionsDefaultTests" configuration but will specify different demands to test the full config with settings
        fluid.defaults("fluid.uiOptionsTests", {
            gradeNames: ["fluid.uiOptionsDefaultTests", "autoInit"]
        });
        
        // Supply the templates
        fluid.demands("fluid.uiOptions.templatePath", ["fluid.uiOptionsTests", "fluid.uiOptions.tests"], {
            options: {
                value: "{uiOptionsTests}.options.prefix"
            }
        });
        
        // Options for UIOptions
        var saveCalled = false;

        fluid.demands("fluid.uiOptions", ["fluid.uiOptionsTests", "fluid.uiOptions.tests"], {
            funcName: "fluid.uiOptions.starterPanels",
            options: {
                gradeNames: ["fluid.uiOptions.rootModel.starter", "fluid.uiOptions.uiEnhancerRelay"],
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

        fluid.demands("fluid.uiOptions.store", ["fluid.globalSettingsStore", "fluid.uiOptions.tests"], {
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
            
        var testUIOptions = function (testFn, uio) {
            uio = uio || fluid.uiOptionsTests;
            uio.testFn = testFn;
            fluid.globalSettingsStore();
            uio("#ui-options");
        };
        
        var resetSaveCalled = function () {
            saveCalled = false;    
        };
        
        jqUnit.module("UIOptions Tests");

        jqUnit.test("Template Loader", function () {
            jqUnit.expect(6);

            var testTemplatePrefix = "../test/";
            var uiOptionsDefaultTemplateName = "FatPanelUIOptions.html";
            var textControlsFullTemplatePath = "../../../../components/uiOptions/html/UIOptionsTemplate-text.html";
            var linksControlsTemplateName = "links.html";

            // Supply the templates
            fluid.demands("fluid.uiOptions.templatePath", "fluid.uiOptionsTestTemplateLoader", {
                options: {
                    value: testTemplatePrefix
                }
            });

            fluid.demands("fluid.uiOptions.templateLoader", "fluid.uiOptionsTestTemplateLoader", {
                options: {
                    templates: {
                        linksControls: "%prefix/" + linksControlsTemplateName,
                        textControls: textControlsFullTemplatePath
                    }
                }
            });

            fluid.defaults("fluid.uiOptionsTestTemplateLoader", {
                gradeNames: ["fluid.littleComponent", "autoInit"],
                components: {
                    templateLoader: {
                        type: "fluid.uiOptions.templateLoader"
                    }
                }
            });

            var loader = fluid.uiOptionsTestTemplateLoader(null);

            // The template with prefix + default name
            jqUnit.assertEquals("uiOptions template url is set correctly", testTemplatePrefix + uiOptionsDefaultTemplateName, loader.templateLoader.resources.uiOptions.url);
            jqUnit.assertTrue("uiOptions forceCache is set", loader.templateLoader.resources.uiOptions.forceCache);

            // The template with a customized full url
            jqUnit.assertEquals("textControls template url is set correctly", textControlsFullTemplatePath, loader.templateLoader.resources.textControls.url);
            jqUnit.assertTrue("textControls forceCache is set", loader.templateLoader.resources.textControls.forceCache);

            // The template with prefix + customized name
            jqUnit.assertEquals("linksControls template url is set correctly", testTemplatePrefix + linksControlsTemplateName, loader.templateLoader.resources.linksControls.url);
            jqUnit.assertTrue("linksControls forceCache is set", loader.templateLoader.resources.linksControls.forceCache);
        });
        
        jqUnit.test("Customized Template Loader", function () {
            jqUnit.expect(4);

            var testTemplatePrefix = "../test/";
            var uiOptionsDefaultTemplateName = "FatPanelUIOptions.html";
            var lineSpaceTemplateName = "UIOptionsTemplate-lineSpace.html";

            // Supply the templates
            fluid.demands("fluid.uiOptions.templatePath", "fluid.uiOptionsCustomizedTemplateLoader", {
                options: {
                    value: testTemplatePrefix
                }
            });

            fluid.defaults("fluid.uiOptions.customizedTemplateLoader", {
                gradeNames: ["fluid.uiOptions.templateLoader", "autoInit"],
                templates: {
                    lineSpace: "%prefix/" + lineSpaceTemplateName
                }
            });

            fluid.defaults("fluid.uiOptionsCustomizedTemplateLoader", {
                gradeNames: ["fluid.littleComponent", "autoInit"],
                components: {
                    templateLoader: {
                        type: "fluid.uiOptions.templateLoader",
                        options: {
                            gradeNames: ["fluid.uiOptions.customizedTemplateLoader"]
                        }
                    }
                }
            });

            var loader = fluid.uiOptionsCustomizedTemplateLoader(null);

            jqUnit.assertEquals("uiOptions template url is set correctly", testTemplatePrefix + uiOptionsDefaultTemplateName, loader.templateLoader.resources.uiOptions.url);
            jqUnit.assertTrue("uiOptions forceCache is set", loader.templateLoader.resources.uiOptions.forceCache);

            jqUnit.assertEquals("lineSpace template url is set correctly", testTemplatePrefix + lineSpaceTemplateName, loader.templateLoader.resources.lineSpace.url);
            jqUnit.assertTrue("lineSpace forceCache is set", loader.templateLoader.resources.lineSpace.forceCache);
        });
        
        var assertRootModel = function (model) {
            jqUnit.expect(5);
            jqUnit.assertNotNull("Model is not null", model);
            jqUnit.assertNotUndefined("Model is not undefined", model);
            jqUnit.assertFalse("Min text size is not set", !!model.textSize);
            jqUnit.assertEquals("Text font is set", "default", model.selections.textFont);
            jqUnit.assertEquals("Colour scheme is set", "default", model.selections.theme);
        };
        
        jqUnit.asyncTest("Init Model - default", function () {
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                assertRootModel(uiOptions.model);
                jqUnit.start();
            });
        });

        jqUnit.asyncTest("Init Model and Controls", function () {
            jqUnit.expect(4);
            
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                assertRootModel(uiOptions.model);

                var themeValues = uiOptions.contrast.options.controlValues.theme;
                jqUnit.assertEquals("There are 5 themes in the control", 5, themeValues.length);
                jqUnit.assertEquals("The first theme is default", "default", themeValues[0]);

                var fontValues = uiOptions.textFont.options.controlValues.textFont;
                jqUnit.assertEquals("There are 5 font values in the control", 5, fontValues.length);
                jqUnit.assertEquals("There is default font value", 0, jQuery.inArray("default", fontValues));
                
                jqUnit.start();
            });
        });

        jqUnit.asyncTest("UIOptions Save, Reset, and Cancel", function () {
            jqUnit.expect(13);
            
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                uiOptions.updateModel(bwSkin);
                
                jqUnit.assertFalse("Save hasn't been called", saveCalled);
                uiOptions.saveAndApply();
                var container = $("body");
                jqUnit.assertTrue("Save has been called", saveCalled);
                
                var uiEnhancerSettings = uiOptions.getSettings();
                jqUnit.assertDeepEq("bw setting was saved", bwSkin.theme, uiEnhancerSettings.theme);
                jqUnit.assertTrue("Body has the high contrast colour scheme", container.hasClass("fl-theme-bw"));
                jqUnit.assertEquals("Text size has been saved", bwSkin.textSize, uiOptions.model.selections.textSize);
                jqUnit.assertEquals("Text font has been saved", bwSkin.textFont, uiOptions.model.selections.textFont);
                jqUnit.assertEquals("Theme has been saved", bwSkin.theme, uiOptions.model.selections.theme);
                
                uiOptions.reset();
                jqUnit.assertNotEquals("Reset model text size", bwSkin.textSize, uiOptions.options.textSize);
                jqUnit.assertNotEquals("Reset model text font", bwSkin.textFont, uiOptions.options.textFont);
                jqUnit.assertNotEquals("Reset model theme", bwSkin.theme, uiOptions.options.theme);
                
                uiOptions.updateModel(bwSkin);
                uiOptions.updateModel(bwSkin2);

                uiOptions.cancel();
                jqUnit.assertEquals("Cancel text size change", bwSkin.textSize, uiOptions.model.selections.textSize);
                jqUnit.assertEquals("Cancel text font change", bwSkin.textFont, uiOptions.model.selections.textFont);
                jqUnit.assertEquals("Cancel theme change", bwSkin.theme, uiOptions.model.selections.theme);
                
                jqUnit.start();
            });        
        });
        
        jqUnit.asyncTest("Refresh View", function () {
            jqUnit.expect(5);
            
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                uiOptions.updateModel(bwSkin);

                jqUnit.assertEquals("bw setting was set in the model", bwSkin.theme, uiOptions.model.selections.theme);

                var uiEnhancerSettings = uiOptions.getSettings();
                jqUnit.assertUndefined("bw setting was not saved", uiEnhancerSettings.theme);

                uiOptions.events.onUIOptionsRefresh.fire();
                var fontSizeCtrl = $(".flc-uiOptions-min-text-size");
                var fontSizeSetting = $(".flc-textfieldSlider-field", fontSizeCtrl).val(); 
                jqUnit.assertEquals("Small font size selected", "1.8", fontSizeSetting);
                var fontStyleSelection = $(":selected", $(".flc-uiOptions-text-font"));
                jqUnit.assertEquals("Verdana selected", "verdana", fontStyleSelection[0].value);
                var contrastSelection = $(":checked", $(".flc-uiOptions-contrast"));
                jqUnit.assertEquals("Black on white is selected", "bw", contrastSelection[0].value);

                uiOptions.reset();
                jqUnit.start();
            });
        });

        jqUnit.asyncTest("Init with site defaults different from UIOptions control values", function () {
            jqUnit.expect(2);
            
            fluid.enhance.check({"fluid.uiOptions.testDiffInit": true});

            fluid.demands("fluid.uiOptions", ["fluid.uiOptionsTests", "fluid.uiOptions.tests", "fluid.uiOptions.testDiffInit"], {
                options: {
                    members: {
                        rootModel: {
                            theme: "wb",
                            textFont: "times"
                        }
                    }
                }
            });

            testUIOptions(function (uiOptionsLoader, uiOptions) {
                var settings = uiOptions.rootModel;
                
                var themeValue = settings.theme;
                jqUnit.assertEquals("The theme is set to wb", "wb", themeValue);

                var fontValue = settings.textFont;
                jqUnit.assertEquals("The font is set to times", "times", fontValue);
                
                fluid.enhance.forget("fluid.uiOptions.testDiffInit");
                jqUnit.start();
            });
        });

        /********************************
         * UI Options Integration tests *
         * ******************************
         */

        var applierRequestChanges = function (uiOptions, selectionOptions) {
            uiOptions.applier.requestChange("selections.textFont", selectionOptions.textFont);
            uiOptions.applier.requestChange("selections.theme", selectionOptions.theme);
            uiOptions.applier.requestChange("selections.textSize", selectionOptions.textSize);
            uiOptions.applier.requestChange("selections.lineSpace", selectionOptions.lineSpace);
        };
        
        var checkPaths = function (uiOptions, paths) {
            fluid.each(paths, function (exists, path) {
                jqUnit.assertEquals("Check existence of path " + path, exists, !!fluid.get(uiOptions, path));
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

        var checkSaveCancel = function (uiOptions, saveModel, cancelModel) {
            var saveButton = uiOptions.locate("save");
            var cancelButton = uiOptions.locate("cancel");
            var resetButton = uiOptions.locate("reset");

            jqUnit.assertTrue("Initially, settings store settings are empty",
                $.isEmptyObject(uiOptions.getSettings()));
            jqUnit.assertDeepEq("Initially, model should correspond to default model",
                uiOptions.rootModel, uiOptions.model.selections);

            var preSaveSelections = fluid.copy(uiOptions.model.selections);
            applierRequestChanges(uiOptions, saveModel);
            checkModelSelections("After apply saveModel", saveModel, uiOptions.model.selections);
            checkSettingsStore("After apply saveModel", saveModel, uiOptions.model.selections,
                preSaveSelections);
            saveButton.click();
            checkModelSelections("After clicking save", saveModel, uiOptions.getSettings());
            checkSettingsStore("After clicking save", saveModel, uiOptions.getSettings(), preSaveSelections);
            applierRequestChanges(uiOptions, cancelModel);
            cancelButton.click();
            checkModelSelections("After applying cancelModel and clicking cancel", saveModel, uiOptions.getSettings());
            checkSettingsStore("After applying cancelModel and clicking cancel", saveModel,
                uiOptions.getSettings(), preSaveSelections);
            resetButton.click();
            checkModelSelections("After clicking reset", uiOptions.rootModel, uiOptions.model.selections);
            cancelButton.click();
            checkModelSelections("After clicking cancel", saveModel, uiOptions.getSettings());
            checkSettingsStore("After clicking cancel", saveModel, uiOptions.getSettings(), preSaveSelections);
            // apply the reset settings to make the test result page more readable
            resetButton.click();
            saveButton.click();
        };

        jqUnit.asyncTest("Non-default UIOptions Integration tests", function () {
            fluid.enhance.check({"fluid.uiOptions.testsNonDefaultIntegration": true});

            fluid.demands("fluid.uiOptions", ["fluid.uiOptions.testsNonDefaultIntegration", "fluid.uiOptions.tests", "fluid.uiOptionsTests"], {
                funcName: "fluid.uiOptions",
                options: {
                    selectors: {
                        textSize: ".flc-uiOptions-text-size"
                    },
                    components: {
                        textSize: {
                            type: "fluid.uiOptions.panels.textSize",
                            container: "{uiOptions}.dom.textSize",
                            createOnEvent: "onUIOptionsMarkupReady",
                            options: {
                                sourceApplier: "{uiOptions}.applier",
                                rules: {
                                    "selections.textSize": "value"
                                },
                                listeners: {
                                    "{uiOptions}.events.onUIOptionsRefresh": "{that}.refreshView"
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
                                        type: "fluid.uiOptions.enactors.textSize",
                                        container: "{uiEnhancer}.container",
                                        options: {
                                            fontSizeMap: "{uiEnhancer}.options.fontSizeMap",
                                            sourceApplier: "{uiEnhancer}.applier",
                                            rules: {
                                                "textSize": "value"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    autoSave: false
                }
            });

            testUIOptions(function (uiOptionsLoader, uiOptions) {
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

                checkPaths(uiOptions, customizedPanelPaths);
                checkSaveCancel(uiOptions, maxTextSize, minTextSize);
                fluid.enhance.forget("fluid.uiOptions.testsNonDefaultIntegration");
                jqUnit.start();
            });
        });

        applierRequestChanges = function (uiOptions, selectionOptions) {
            uiOptions.applier.requestChange("selections.textFont", selectionOptions.textFont);
            uiOptions.applier.requestChange("selections.theme", selectionOptions.theme);
            uiOptions.applier.requestChange("selections.textSize", selectionOptions.textSize);
            uiOptions.applier.requestChange("selections.lineSpace", selectionOptions.lineSpace);
        };
        
        jqUnit.asyncTest("UIOptions Integration tests", function () {
            fluid.enhance.check({"fluid.uiOptions.testsIntegration": true});
            
            fluid.demands("fluid.uiOptions", ["fluid.uiOptions.testsIntegration", "fluid.uiOptions.tests", "fluid.uiOptionsTests"], {
                funcName: "fluid.uiOptions.starterPanels",
                options: {
                    gradeNames: ["fluid.uiOptions.rootModel.starter"],
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
     
            testUIOptions(function (uiOptionsLoader, uiOptions) {
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

                checkPaths(uiOptions, defaultPanelsPaths);
                checkSaveCancel(uiOptions, bwSkin, bwSkin2);
                fluid.enhance.forget("fluid.uiOptions.testsIntegration");
                jqUnit.start();
            });
        });

        // The following two tests (auto-save and preview) need to run at the end of the test file because they cause failures 
        // on the subsequent unit tests when they were placed before other tests, due to the possibility that the demands blocks
        // issued specifically within their own staticEnvironment are still in effect on the subsequent tests.
        /*******************
         * Auto-save tests *
         *******************/
        jqUnit.asyncTest("UIOptions Auto-save", function () {
            jqUnit.expect(2);
            
            fluid.enhance.check({"fluid.uiOptions.testsAutoSave": true});
            
            fluid.demands("fluid.uiOptions", ["fluid.uiOptions.testsAutoSave", "fluid.uiOptionsTests", "fluid.uiOptions.tests"], {
                options: {
                    autoSave: true
                }
            });
     
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                resetSaveCalled();
                uiOptions.updateModel(bwSkin);
                jqUnit.assertTrue("Model has changed, auto-save changes", saveCalled);
                
                var uiEnhancerSettings = uiOptions.getSettings();
                jqUnit.assertDeepEq("bw setting was saved", bwSkin.theme, uiEnhancerSettings.theme);
                
                fluid.enhance.forget("fluid.uiOptions.uiOptionsTestsAutoSave");
                uiOptions.reset();
                jqUnit.start();
            });
            
        });
        
        /*****************
         * Preview tests *
         *****************/
        
        jqUnit.asyncTest("Preview URL", function () {
            jqUnit.expect(1);
            
            fluid.enhance.check({"fluid.uiOptions.testsPreview": true});
            
            fluid.demands("fluid.uiOptions.templateLoader", ["fluid.uiOptionsTests", "fluid.uiOptions.tests", "fluid.uiOptions.testsPreview"], {
                options: {
                    templates: {
                        uiOptions: templatePrefix + "FullPreviewUIOptions.html"
                    }
                }
            });
        
            var templateUrl = "TestPreviewTemplate.html";
            var uiOptions;
            
            var testPreview = function () {
                jqUnit.assertEquals("The preview iFrame is pointing to the specified markup",
                        templateUrl, uiOptions.preview.container.attr("src"));
                    
                fluid.enhance.forget("fluid.uiOptions.testsPreview");
                jqUnit.start();
            };
            
            fluid.demands("fluid.uiOptions", ["fluid.uiOptionsTests", "fluid.uiOptions.tests", "fluid.uiOptions.testsPreview"], {
                options: {
                    components: {
                        preview: {
                            type: "fluid.uiOptions.preview",
                            createOnEvent: "onUIOptionsComponentReady",
                            container: "{uiOptions}.dom.previewFrame",
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
         
            testUIOptions(function (uiOptionsLoader, uiOptionsIn) {
                uiOptions = uiOptionsIn;
            });
        });
        
    });
})(jQuery);
