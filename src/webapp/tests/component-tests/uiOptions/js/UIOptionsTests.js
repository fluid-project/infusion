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
        
        fluid.defaults("fluid.uiOptionsTests", {
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
        
        // Supply the templates
        fluid.demands("fluid.uiOptions.templatePath", "fluid.uiOptionsTests", {
            options: {
                value: "{uiOptionsTests}.options.prefix"
            }
        });
        
        fluid.demands("fluid.uiOptions.templateLoader", "fluid.uiOptionsTests", {
            options: {
                templates: {
                    uiOptions: "%prefix/FullPreviewUIOptions.html"
                }
            }
        });
    
        // Options for UIOptions
        var saveCalled = false;

        fluid.demands("fluid.uiOptions", ["fluid.uiOptionsTests", "fluid.uiOptions.tests"], {
            options: {
                components: {
                    uiEnhancer: {
                        type: "fluid.uiEnhancer",
                        container: "body",
                        priority: "first"
                    },
                    settingsStore: "{uiEnhancer}.settingsStore"
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
            
        var testUIOptions = function (testFn) {
            fluid.uiOptionsTests.testFn = testFn;
            fluid.uiOptionsTests("#ui-options");
        };
        
        var resetSaveCalled = function () {
            saveCalled = false;    
        };
        
        var tests = jqUnit.testCase("UIOptions Tests");

        var sortByKeyLength = function (initial, expected) {
            var actual = fluid.uiOptions.sortByKeyLength(initial);
            jqUnit.assertDeepEq("Sorted correctly", expected, actual);
        };
        
        tests.test("Sort object key by length", function () {
            expect(2);

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
    
        tests.test("Expand Path", function () {
            expect(2);
            var initial = "*.comp1.*.comp2.*.comp3";
            var expected = "components.comp1.options.components.comp2.options.components.comp3";
            expandPathTest(initial, expected);

            initial = "comp1.comp2.comp3";
            expandPathTest(initial, initial);
        });
        
        tests.test("Map Options", function () {
            expect(3);
            
            var config = fluid.defaults("fluid.uiOptions.inline").uiOptionsTransform.config;

            var options = null;
            
            var actual = fluid.uiOptions.mapOptions(options, config, "preserve");
            jqUnit.assertDeepEq("The path is expanded correctly", {}, actual);

            
            options = {
                textControls: {
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
                                            textControls: {
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
                textControls: {
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
                                            textControls: {
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
        
        tests.test("Template Loader", function () {
            expect(6);

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

        tests.asyncTest("Init Model and Controls", function () {
            expect(10);
            
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                var model = uiOptions.model;
                jqUnit.assertNotNull("Model is not null", model);
                jqUnit.assertNotUndefined("Model is not undefined", model);
                jqUnit.assertFalse("Min text size is not set", !!model.textSize);
                jqUnit.assertEquals("Text font is set", "default", model.selections.textFont);
                jqUnit.assertEquals("Colour scheme is set", "default", model.selections.theme);
                jqUnit.assertEquals("Layout value is set", false, model.selections.layout);

                var themeValues = uiOptions.textControls.options.controlValues.theme;
                jqUnit.assertEquals("There are 5 themes in the control", 5, themeValues.length);
                jqUnit.assertEquals("The first theme is default", "default", themeValues[0]);

                var fontValues = uiOptions.textControls.options.controlValues.textFont;
                jqUnit.assertEquals("There are 5 font values in the control", 5, fontValues.length);
                jqUnit.assertEquals("There is default font value", 0, jQuery.inArray("default", fontValues));
                
                start();
            });
        });

        tests.asyncTest("UIOptions Save, Reset, and Cancel", function () {
            expect(13);
            
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
                
                start();
            });        
        });
        
        tests.asyncTest("Refresh View", function () {
            expect(5);
            
            testUIOptions(function (uiOptionsLoader, uiOptions) {
                uiOptions.updateModel(bwSkin);

                jqUnit.assertEquals("bw setting was set in the model", bwSkin.theme, uiOptions.model.selections.theme);

                var uiEnhancerSettings = uiOptions.settingsStore.fetch();
                jqUnit.assertEquals("bw setting was not saved", "default", uiEnhancerSettings.theme);

                uiOptions.events.onUIOptionsRefresh.fire();
                var fontSizeCtrl = $(".flc-uiOptions-min-text-size");
                var fontSizeSetting = $(".flc-textfieldSlider-field", fontSizeCtrl).val(); 
                jqUnit.assertEquals("Small font size selected", "1.8", fontSizeSetting);
                var fontStyleSelection = $(":selected", $(".flc-uiOptions-text-font"));
                jqUnit.assertEquals("Verdana selected", "verdana", fontStyleSelection[0].value);
                var contrastSelection = $(":selected", $(".flc-uiOptions-theme"));
                jqUnit.assertEquals("Black on white is selected", "bw", contrastSelection[0].value);
                
                start();
            });          
        });

        tests.asyncTest("Init with site defaults different from UIOptions control values", function () {
            expect(2);
               
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
                start();
            });
        });

        /*****************
         * Preview tests *
         *****************/
         
        tests.asyncTest("Preview URL", function () {
            expect(1);
            
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
                start();
            });
        });
        
        tests.asyncTest("UIOptions Auto-save", function () {
            expect(2);
                
            fluid.staticEnvironment.uiOptionsTestsAutoSave = fluid.typeTag("fluid.uiOptions.testsAutoSave");
            
            fluid.demands("fluid.uiOptions", ["fluid.uiOptions.testsAutoSave", "fluid.uiOptionsTests", "fluid.uiOptions.tests"], {
                options: {
                    components: {
                        uiEnhancer: {
                            type: "fluid.uiEnhancer",
                            container: "body",
                            priority: "first"
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
                start();
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
            jqUnit.assertTrue("Check that textControls sub-component is present", uiOptions.textControls);
            jqUnit.assertTrue("Check that layoutControls sub-component is present", uiOptions.layoutControls);
            jqUnit.assertTrue("Check that linkControls sub-component is present", uiOptions.linksControls);
            jqUnit.assertTrue("Check that preview sub-component is present", uiOptions.options.components.preview);
            jqUnit.assertTrue("Check that store sub-component is present", uiOptions.options.components.settingsStore);
            jqUnit.assertTrue("Check that tableOfContents sub-component is present", uiOptions.uiEnhancer.options.components.tableOfContents);
            jqUnit.assertTrue("Check that store sub-component is present", uiOptions.uiEnhancer.options.components.settingsStore);
        };
        
        var checkModelSelections = function (expectedSelections, actualSelections) {
            jqUnit.assertEquals("Text font correctly updated", expectedSelections.textFont, actualSelections.textFont);
            jqUnit.assertEquals("Theme correctly updated", expectedSelections.theme, actualSelections.theme);
            jqUnit.assertEquals("Text size correctly updated", expectedSelections.textSize, actualSelections.textSize);
            jqUnit.assertEquals("Line spacing correctly updated", expectedSelections.lineSpacing, actualSelections.lineSpacing);            
        };
        
        tests.asyncTest("UIOptions Integration tests", function () {
            fluid.staticEnvironment.uiOptionsTestsIntegration = fluid.typeTag("fluid.uiOptions.testsIntegration");
            
            fluid.demands("fluid.uiOptions", ["fluid.uiOptions.testsIntegration", "fluid.uiOptions.tests", "fluid.uiOptionsTests"], {
                options: {
                    components: {
                        uiEnhancer: {
                            type: "fluid.uiEnhancer",
                            container: "body",
                            priority: "first"
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
                
                var saveButton = uiOptions.locate("save");
                var cancelButton = uiOptions.locate("cancel");
                var resetButton = uiOptions.locate("reset");
                
                applierRequestChanges(uiOptions, bwSkin);
                checkModelSelections(bwSkin, uiOptions.model.selections);
                saveButton.click();
                checkModelSelections(bwSkin, uiOptions.settingsStore.fetch());
                applierRequestChanges(uiOptions, bwSkin2);
                cancelButton.click();
                checkModelSelections(bwSkin, uiOptions.settingsStore.fetch());
                resetButton.click();
                checkModelSelections(uiOptions.model.selections, uiOptions.settingsStore.options.defaultSiteSettings);
                cancelButton.click();
                checkModelSelections(bwSkin, uiOptions.settingsStore.fetch());
                
                // apply the reset settings to make the test result page more readable
                resetButton.click();
                saveButton.click();
                
                delete fluid.staticEnvironment.uiOptionsTestsIntegration;
                start();
            });
        });
    });
    
})(jQuery);
