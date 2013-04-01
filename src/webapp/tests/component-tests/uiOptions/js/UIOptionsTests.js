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
        fluid.staticEnvironment.uiOptionsTests = fluid.typeTag("fluid.uiOptions.tests");

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
                    priority: "first",
                    type: "fluid.uiOptions.templateLoader"
                }                  
            },
            prefix: templatePrefix
        });
        
        // use "fluid.uiOptionsDefaultTests" configuration but will specify different demands to test the full config with settings
        fluid.defaults("fluid.uiOptionsTests", {
            gradeNames: ["fluid.uiOptionsDefaultTests", "autoInit"]
        });
        
        // Supply the templates
        fluid.demands("fluid.uiOptions.templatePath", "fluid.uiOptionsDefaultTests", {
            options: {
                value: "{uiOptionsTests}.options.prefix"
            }
        });
        
        fluid.demands("fluid.uiOptions.templateLoader", "fluid.uiOptionsDefaultTests", {
            options: {
                templates: {
                    uiOptions: "%prefix/FullPreviewUIOptions.html"
                }
            }
        });
    
        // Options for UIOptions
        var saveCalled = false;

        fluid.demands("fluid.uiOptions", ["fluid.uiOptionsTests", "fluid.uiOptions.tests"], {
            funcName: "fluid.uiOptions.defaultSettingsPanels",
            options: {
                components: {
                    uiEnhancer: {
                        type: "fluid.uiEnhancer",
                        container: "body",
                        priority: "first",
                        options: {
                            gradeNames: ["fluid.uiEnhancer.defaultActions"]
                        }
                    },
                    settingsStore: "{uiEnhancer}.settingsStore",
                    preview: {
                        type: "fluid.uiOptions.preview",
                        createOnEvent: "onUIOptionsComponentReady",
                        container: "{uiOptions}.dom.previewFrame"
                    }
                },
                listeners: {
                    onSave: function () {
                        saveCalled = true;
                    },
                    onUIOptionsRefresh: "{uiEnhancer}.updateFromSettingsStore"
                }
            }
        });
     
        fluid.demands("fluid.uiOptions.store", ["fluid.uiEnhancer", "fluid.uiOptions.tests"], {
            funcName: "fluid.tempStore"
        });
        
        var bwSkin = {
            textSize: "1.8",
            textFont: "verdana",
            theme: "bw",
            lineSpacing: 2
        };
        
        var bwSkin2 = {
            textSize: "1.1",
            textFont: "italic",
            theme: "cw",
            lineSpacing: 1
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
            uio("#ui-options");
        };
        
        var resetSaveCalled = function () {
            saveCalled = false;    
        };
        
        jqUnit.module("UIOptions Tests");

        var sortByKeyLength = function (initial, expected) {
            var actual = fluid.uiOptions.sortByKeyLength(initial);
            jqUnit.assertDeepEq("Sorted correctly", expected, actual);
        };
        
        jqUnit.test("Sort object key by length", function () {
            jqUnit.expect(2);

            var initial = {
                "ddd": "1",
                "cc": "2",
                "a": "3"
            };
            var expected = ["a", "cc", "ddd"];
            sortByKeyLength(initial, expected);

            initial = {
                "aaaa.***.ccc": "1",
                "aaaa.bbb.cc": "2",
                "aaaa.bbb.cccdd": "3",
                "a.b.c": "1"
            };
            expected = ["a.b.c", "aaaa.bbb.cc", "aaaa.***.ccc", "aaaa.bbb.cccdd"];
            sortByKeyLength(initial, expected);
        });
        
        var expandPathTest = function (initial, expected) {
            var actual = fluid.uiOptions.expandShortPath(initial);
            jqUnit.assertDeepEq("The path is expanded correctly", expected, actual);
        };
    
        jqUnit.test("Expand Path", function () {
            jqUnit.expect(2);
            var initial = "*.comp1.*.comp2.*.comp3";
            var expected = "components.comp1.options.components.comp2.options.components.comp3";
            expandPathTest(initial, expected);

            initial = "comp1.comp2.comp3";
            expandPathTest(initial, initial);
        });
        
        jqUnit.test("Map Options", function () {
            jqUnit.expect(3);
            
            var config = fluid.defaults("fluid.uiOptions.inline").uiOptionsTransform.config;

            var options = null;
            
            var actual = fluid.uiOptions.mapOptions(options, config, "preserve");
            jqUnit.assertDeepEq("The path is expanded correctly", {}, actual);

            
            options = {
                textFont: {
                    opt1: "food"
                }
            };

            var expected = {
                components: {
                    uiOptionsLoader: {
                        options: {
                            components: {
                                uiOptions: {
                                    options: {
                                        components: {
                                            textFont: {
                                                opt1: "food"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            
            actual = fluid.uiOptions.mapOptions(options, config, "preserve");
            jqUnit.assertDeepEq("The path is expanded correctly", expected, actual);

            options = {
                uiOptions: {
                    opt: "drink"
                },
                contrast: {
                    opt1: "food"
                }
            };
            
            expected = {
                components: {
                    uiOptionsLoader: {
                        options: {
                            components: {
                                uiOptions: {
                                    opt: "drink",
                                    options: {
                                        components: {
                                            contrast: {
                                                opt1: "food"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            
            actual = fluid.uiOptions.mapOptions(options, config);
            jqUnit.assertDeepEq("Multiple options are expanded and combined correctly", expected, actual);
        });
        
        jqUnit.test("Template Loader", function () {
            jqUnit.expect(6);

            var testTemplatePrefix = "../test/";
            var uiOptionsTemplateName = "FullPreviewUIOptions.html";
            var textControlsFullTemplatePath = "../../../../components/uiOptions/html/UIOptionsTemplate-text.html";
            var linksControlsDefaultTemplateName = "UIOptionsTemplate-links.html";

            // Supply the templates
            fluid.demands("fluid.uiOptions.templatePath", "fluid.uiOptionsTestTemplateLoader", {
                options: {
                    value: testTemplatePrefix
                }
            });

            fluid.demands("fluid.uiOptions.templateLoader", "fluid.uiOptionsTestTemplateLoader", {
                options: {
                    templates: {
                        uiOptions: "%prefix/" + uiOptionsTemplateName,
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

            // The template with prefix + a customized name
            jqUnit.assertEquals("uiOptions template url is set correctly", testTemplatePrefix + uiOptionsTemplateName, loader.templateLoader.resources.uiOptions.url);
            jqUnit.assertTrue("uiOptions forceCache is set", loader.templateLoader.resources.uiOptions.forceCache);

            // The template with a customized full url
            jqUnit.assertEquals("textControls template url is set correctly", textControlsFullTemplatePath, loader.templateLoader.resources.textControls.url);
            jqUnit.assertTrue("textControls forceCache is set", loader.templateLoader.resources.textControls.forceCache);

            // The template with prefix + default name
            jqUnit.assertEquals("textControls template url is set correctly", testTemplatePrefix + linksControlsDefaultTemplateName, loader.templateLoader.resources.linksControls.url);
            jqUnit.assertTrue("textControls forceCache is set", loader.templateLoader.resources.linksControls.forceCache);
        });
        
        var assertDefaultModel = function (model) {
            jqUnit.expect(6);
            jqUnit.assertNotNull("Model is not null", model);
            jqUnit.assertNotUndefined("Model is not undefined", model);
            jqUnit.assertFalse("Min text size is not set", !!model.textSize);
            jqUnit.assertEquals("Text font is set", "default", model.selections.textFont);
            jqUnit.assertEquals("Colour scheme is set", "default", model.selections.theme);
            jqUnit.assertEquals("Layout value is set", false, model.selections.layout);
        };
        
        jqUnit.asyncTest("Init Model - default", function () {
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                assertDefaultModel(uiOptions.model);
                jqUnit.start();
            });
        });

        jqUnit.asyncTest("Init Model and Controls", function () {
            jqUnit.expect(4);
            
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                assertDefaultModel(uiOptions.model);

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
                
                var uiEnhancerSettings = uiOptions.settingsStore.fetch();
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

                var uiEnhancerSettings = uiOptions.settingsStore.fetch();
                // TODO: Note that this test used to test for "undefined" and once again it should, after
                // FLUID-4686 is resolved.
                var defaultTheme = fluid.defaults("fluid.uiOptions.store").defaultSiteSettings.theme;
                jqUnit.assertEquals("bw setting was not saved", defaultTheme, uiEnhancerSettings.theme);

                uiOptions.events.onUIOptionsRefresh.fire();
                var fontSizeCtrl = $(".flc-uiOptions-min-text-size");
                var fontSizeSetting = $(".flc-textfieldSlider-field", fontSizeCtrl).val(); 
                jqUnit.assertEquals("Small font size selected", "1.8", fontSizeSetting);
                var fontStyleSelection = $(":selected", $(".flc-uiOptions-text-font"));
                jqUnit.assertEquals("Verdana selected", "verdana", fontStyleSelection[0].value);
                var contrastSelection = $(":checked", $(".flc-uiOptions-contrast"));
                jqUnit.assertEquals("Black on white is selected", "bw", contrastSelection[0].value);
                
                jqUnit.start();
            });
        });

        jqUnit.asyncTest("Init with site defaults different from UIOptions control values", function () {
            jqUnit.expect(2);
               
            fluid.staticEnvironment.uiOptionsTestsDiffInit = fluid.typeTag("fluid.uiOptions.testDiffInit");
            
            fluid.demands("settingsStore", ["fluid.uiOptionsTests", "fluid.uiOptions.testDiffInit", "fluid.uiEnhancer"], {
                funcName: "fluid.tempStore",
                options: {
                    defaultSiteSettings: {
                        theme: "wb",
                        textFont: "times"
                    }
                }
            });     

            testUIOptions(function (uiOptionsLoader, uiOptions) {
                var settings = uiOptions.settingsStore.options.defaultSiteSettings;
                
                var themeValue = settings.theme;
                jqUnit.assertEquals("The theme is set to wb", "wb", themeValue);

                var fontValue = settings.textFont;
                jqUnit.assertEquals("The font is set to times", "times", fontValue);
                
                delete fluid.staticEnvironment.uiOptionsTestsDiffInit;
                jqUnit.start();
            });
        });

        /*****************
         * Preview tests *
         *****************/
         
        jqUnit.asyncTest("Preview URL", function () {
            jqUnit.expect(1);
            
            fluid.staticEnvironment.uiOptionsTestsPreview = fluid.typeTag("fluid.uiOptions.testsPreview");
            
            var templateUrl = "TestPreviewTemplate.html";
            fluid.demands("fluid.uiOptions.preview", ["fluid.uiOptionsTests", "fluid.uiOptions.tests", "fluid.uiOptions"], {
                container: "{uiOptions}.dom.previewFrame",
                options: {
                    templateUrl: templateUrl
                }
            });     
    
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                jqUnit.assertEquals("The preview iFrame is pointing to the specified markup",
                    templateUrl, uiOptions.preview.container.attr("src"));
                
                delete fluid.staticEnvironment.uiOptionsTestsPreview;
                jqUnit.start();
            });
        });
        
        jqUnit.asyncTest("UIOptions Auto-save", function () {
            jqUnit.expect(2);
                
            fluid.staticEnvironment.uiOptionsTestsAutoSave = fluid.typeTag("fluid.uiOptions.testsAutoSave");
            
            fluid.demands("fluid.uiOptions", ["fluid.uiOptions.testsAutoSave", "fluid.uiOptionsTests", "fluid.uiOptions.tests"], {
                options: {
                    components: {
                        uiEnhancer: {
                            type: "fluid.uiEnhancer",
                            container: "body",
                            priority: "first",
                            options: {
                                gradeNames: ["fluid.uiEnhancer.defaultActions"],
                            }
                        },
                        settingsStore: "{uiEnhancer}.settingsStore"
                    },
                    listeners: {
                        onSave: function () {
                            saveCalled = true;
                        }
                    },
                    autoSave: true
                }
            });
     
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                resetSaveCalled();
                uiOptions.updateModel(bwSkin);
                jqUnit.assertTrue("Model has changed, auto-save changes", saveCalled);
                
                var uiEnhancerSettings = uiOptions.settingsStore.fetch();
                jqUnit.assertDeepEq("bw setting was saved", bwSkin.theme, uiEnhancerSettings.theme);
                
                delete fluid.staticEnvironment.uiOptionsTestsAutoSave;
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
            uiOptions.applier.requestChange("selections.lineSpacing", selectionOptions.lineSpacing);
        };
        
        var checkUIOComponents = function (uiOptionsLoader, uiOptions) {
            jqUnit.assertTrue("Check that uiEnhancer is present", uiOptions.uiEnhancer);
            jqUnit.assertTrue("Check that textSizer sub-component is present", uiOptions.textSizer);
            jqUnit.assertTrue("Check that lineSpacer sub-component is present", uiOptions.lineSpacer);
            jqUnit.assertTrue("Check that textFont sub-component is present", uiOptions.textFont);
            jqUnit.assertTrue("Check that contrast sub-component is present", uiOptions.contrast);
            jqUnit.assertTrue("Check that layoutControls sub-component is present", uiOptions.layoutControls);
            jqUnit.assertTrue("Check that linkControls sub-component is present", uiOptions.linksControls);
            jqUnit.assertTrue("Check that preview sub-component is present", uiOptions.options.components.preview);
            jqUnit.assertTrue("Check that store sub-component is present", uiOptions.options.components.settingsStore);
            jqUnit.assertTrue("Check that tableOfContents sub-component is present", uiOptions.uiEnhancer.options.components.tableOfContents);
            jqUnit.assertTrue("Check that store sub-component is present", uiOptions.uiEnhancer.options.components.settingsStore);
        };

        var checkNonDefaultUIOComponents = function (uiOptionsLoader, uiOptions) {
            jqUnit.assertTrue("Check that uiEnhancer is present", uiOptions.uiEnhancer);
            jqUnit.assertTrue("Check that textSizer sub-component is present", uiOptions.textSizer);
            jqUnit.assertFalse("Check that lineSpacer sub-component is not present", uiOptions.lineSpacer);
            jqUnit.assertFalse("Check that textFont sub-component is not present", uiOptions.textFont);
            jqUnit.assertFalse("Check that contrast sub-component is not present", uiOptions.contrast);
            jqUnit.assertFalse("Check that layoutControls sub-component is not present", uiOptions.layoutControls);
            jqUnit.assertFalse("Check that linkControls sub-component is not present", uiOptions.linksControls);
            jqUnit.assertTrue("Check that preview sub-component is present", uiOptions.options.components.preview);
            jqUnit.assertTrue("Check that store sub-component is present", uiOptions.options.components.settingsStore);
            jqUnit.assertTrue("Check that tableOfContents sub-component is present", uiOptions.uiEnhancer.options.components.tableOfContents);
            jqUnit.assertTrue("Check that store sub-component is present", uiOptions.uiEnhancer.options.components.settingsStore);
        };
        
        var checkModelSelections = function (message, expectedSelections, actualSelections) {
            jqUnit.assertEquals(message + ": Text font correctly updated", expectedSelections.textFont, actualSelections.textFont);
            jqUnit.assertEquals(message + ": Theme correctly updated", expectedSelections.theme, actualSelections.theme);
            jqUnit.assertEquals(message + ": Text size correctly updated", expectedSelections.textSize, actualSelections.textSize);
            jqUnit.assertEquals(message + ": Line spacing correctly updated", expectedSelections.lineSpacing, actualSelections.lineSpacing);
        };

        var checkSaveCancel = function (uiOptions, saveModel, cancelModel) {
            var saveButton = uiOptions.locate("save");
            var cancelButton = uiOptions.locate("cancel");
            var resetButton = uiOptions.locate("reset");

            applierRequestChanges(uiOptions, saveModel);
            checkModelSelections("After apply saveModel", saveModel, uiOptions.model.selections);
            saveButton.click();
            checkModelSelections("After clicking save", saveModel, uiOptions.settingsStore.fetch());
            applierRequestChanges(uiOptions, cancelModel);
            cancelButton.click();
            checkModelSelections("After applying cancelModel and clicking cancel", saveModel,
                uiOptions.settingsStore.fetch());
            resetButton.click();
            checkModelSelections("After clicking reset", uiOptions.defaultModel, uiOptions.model.selections);
            cancelButton.click();
            checkModelSelections("After clicking cancel", saveModel, uiOptions.settingsStore.fetch());

            // apply the reset settings to make the test result page more readable
            resetButton.click();
            saveButton.click();
        };

        jqUnit.asyncTest("Non-default UIOptions Integration tests", function () {
            fluid.staticEnvironment.uiOptionsTestsIntegration = fluid.typeTag("fluid.uiOptions.testsNonDefaultIntegration");

            fluid.demands("fluid.uiOptions", ["fluid.uiOptions.testsNonDefaultIntegration", "fluid.uiOptions.tests", "fluid.uiOptionsTests"], {
                funcName: "fluid.uiOptions",
                options: {
                    selectors: {
                        textSizer: ".flc-uiOptions-text-sizer"
                    },
                    components: {
                        textSizer: {
                            type: "fluid.uiOptions.textSizer",
                            container: "{uiOptions}.dom.textSizer",
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
                                    template: "{templateLoader}.resources.textSizer"
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
                                        type: "fluid.uiOptions.actionAnts.textSizerEnactor",
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
                        },
                        settingsStore: "{uiEnhancer}.settingsStore"
                    },
                    autoSave: false
                }
            });

            testUIOptions(function (uiOptionsLoader, uiOptions) {
                checkNonDefaultUIOComponents(uiOptionsLoader, uiOptions);
                checkSaveCancel(uiOptions, maxTextSize, minTextSize);
                delete fluid.staticEnvironment.testsNonDefaultIntegration;
                jqUnit.start();
            });
        });

        jqUnit.asyncTest("UIOptions Integration tests", function () {
            fluid.staticEnvironment.uiOptionsTestsIntegration = fluid.typeTag("fluid.uiOptions.testsIntegration");
            
            fluid.demands("fluid.uiOptions", ["fluid.uiOptions.testsIntegration", "fluid.uiOptions.tests", "fluid.uiOptionsTests"], {
                funcName: "fluid.uiOptions.defaultSettingsPanels",
                options: {
                    components: {
                        uiEnhancer: {
                            type: "fluid.uiEnhancer",
                            container: "body",
                            priority: "first",
                            options: {
                                gradeNames: ["fluid.uiEnhancer.defaultActions"],
                            }
                        },
                        settingsStore: "{uiEnhancer}.settingsStore"
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
                checkUIOComponents(uiOptionsLoader, uiOptions);
                checkSaveCancel(uiOptions, bwSkin, bwSkin2);
                delete fluid.staticEnvironment.uiOptionsTestsIntegration;
                jqUnit.start();
            });
        });
    });
    
})(jQuery);
