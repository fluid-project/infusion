/*
Copyright 2008-2009 University of Toronto
Copyright 2010 OCAD University

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
        fluid.setLogging(true);
        fluid.staticEnvironment.uiOptionsTests = fluid.typeTag("fluid.uiOptions.tests");

        fluid.defaults("fluid.uiOptionsTests", {
            gradeNames: ["fluid.viewComponent", "autoInit"],            
            components: {
                uiOptions: {
                    type: "fluid.uiOptions",
                    container: "{uiOptionsTests}.container",
                    options: "{uiOptionsTests}.options"
                }
            }
        });       
        
        // Supply the templates
        fluid.demands("fluid.uiOptionsTemplateLoader", "fluid.uiOptions.tests", {
            options: {
                templates: {
                    uiOptions: "../../../../components/uiOptions/html/FullPreviewUIOptions.html",
                    textControls: "../../../../components/uiOptions/html/UIOptionsTemplate-text.html",
                    layoutControls: "../../../../components/uiOptions/html/UIOptionsTemplate-layout.html",
                    linksControls: "../../../../components/uiOptions/html/UIOptionsTemplate-links.html"
                }
            }
        });

        // Options for UIOptions
        var saveCalled = false;

        fluid.demands("fluid.uiOptions", ["fluid.uiOptionsTests"], {
            options: {
                components: {
                    settingsStore: "{uiEnhancer}.settingsStore"
                },
                listeners: {
                    onSave: function () {
                        saveCalled = true;
                    }
                }
            }
        });
     
        fluid.demands("fluid.uiOptions.store", ["fluid.uiOptions.tests", "fluid.uiEnhancer"], {
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
            
        var testUIOptions = function (testFn, enhancerTestOptions) {
            var uiEnhancer = fluid.pageEnhancer(fluid.merge(null, enhancerTestOptions)).uiEnhancer;
            var uiOptions = fluid.uiOptionsTests("#ui-options").uiOptions;

            uiOptions.events.onReady.addListener(function () {
                testFn(uiOptions, uiEnhancer);
                start();
            });
        };
        
        var resetSaveCalled = function () {
            saveCalled = false;    
        };
        
        var tests = jqUnit.testCase("UIOptions Tests");

        tests.asyncTest("Init Model and Controls", function () {
            expect(10);
            
            testUIOptions(function (uiOptions) {
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
            });            
        });

        tests.asyncTest("UIOptions Save, Reset, and Cancel", function () {
            expect(13);
            
            testUIOptions(function (uiOptions) {
                uiOptions.updateModel(bwSkin);
                
                jqUnit.assertFalse("Save hasn't been called", saveCalled);
                uiOptions.save();
                var container = $("body");
                jqUnit.assertTrue("Save has been called", saveCalled);
                
                var uiEnhancerSettings = uiOptions.settingsStore.fetch();
                jqUnit.assertDeepEq("hc setting was saved", bwSkin.theme, uiEnhancerSettings.theme);
                jqUnit.assertTrue("Body has the high contrast colour scheme", container.hasClass("fl-theme-hc"));
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
            });        
        });
        
        tests.asyncTest("Refresh View", function () {
            expect(5);
            
            testUIOptions(function (uiOptions) {
                uiOptions.updateModel(bwSkin);

                jqUnit.assertEquals("hc setting was set in the model", bwSkin.theme, uiOptions.model.selections.theme);

                var uiEnhancerSettings = uiOptions.settingsStore.fetch();
                jqUnit.assertEquals("hc setting was not saved", "default", uiEnhancerSettings.theme);

                uiOptions.refreshControlsView();
                var fontSizeCtrl = $(".flc-uiOptions-min-text-size");
                var fontSizeSetting = $(".flc-textfieldSlider-field", fontSizeCtrl).val(); 
                jqUnit.assertEquals("Small font size selected", "1.8", fontSizeSetting);
                var fontStyleSelection = $(":selected", $(".flc-uiOptions-text-font"));
                jqUnit.assertEquals("Verdana selected", "verdana", fontStyleSelection[0].value);
                var contrastSelection = $(":selected", $(".flc-uiOptions-theme"));
                jqUnit.assertEquals("Black on white is selected", "bw", contrastSelection[0].value);
            });          
        });

        tests.asyncTest("Init with site defaults different from UIOptions control values", function () {
            expect(2);
               
            var enhancerOpts = {
                components: {
                    settingsStore: {
                        options: {
                            defaultSiteSettings: {
                                theme: "wb",
                                textFont: "times"
                            }
                        }
                    }
                }
            };
            
            testUIOptions(function (uiOptions) {
                var settings = uiOptions.settingsStore.options.defaultSiteSettings;
                
                var themeValue = settings.theme;
                jqUnit.assertEquals("The theme is set to wb", "wb", themeValue);

                var fontValue = settings.textFont;
                jqUnit.assertEquals("The font is set to times", "times", fontValue);
            }, enhancerOpts);
        });


        /*****************
         * Preview tests *
         *****************/
         
        tests.asyncTest("Preview URL", function () {
            expect(1);
            
            fluid.staticEnvironment.uiOptionsTestsPreview = fluid.typeTag("fluid.uiOptions.testsPreview");
            
            var templateUrl = "TestPreviewTemplate.html";
            fluid.demands("fluid.uiOptions.preview", ["fluid.uiOptions.tests", "fluid.uiOptions", "fluid.uiOptions.textControls"], {
                container: "{uiOptions}.dom.previewFrame",
                options: {
                    templateUrl: templateUrl
                }
            });     
    
            testUIOptions(function (uiOptions) {
                jqUnit.assertEquals("The preview iFrame is pointing to the specified markup",
                    templateUrl, uiOptions.preview.container.attr("src"));
            });
            
            delete fluid.staticEnvironment.uiOptionsTestsPreview;
        });
        
        tests.asyncTest("UIOptions Auto-save", function () {
            expect(2);
                
            fluid.staticEnvironment.uiOptionsTestsAutoSave = fluid.typeTag("fluid.uiOptions.testsAutoSave");
            
            fluid.demands("fluid.uiOptions", ["fluid.uiOptions.testsAutoSave", "fluid.uiOptions.tests", "fluid.uiOptionsTests"], {
                options: {
                    components: {
                        uiEnhancer: "{uiEnhancer}",
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
     
            testUIOptions(function (uiOptions) {
                resetSaveCalled();
                uiOptions.updateModel(bwSkin);
                jqUnit.assertTrue("Model has changed, auto-save changes", saveCalled);
                
                var uiEnhancerSettings = uiOptions.settingsStore.fetch();
                jqUnit.assertDeepEq("hc setting was saved", bwSkin.theme, uiEnhancerSettings.theme);
                
            });
            
            delete fluid.staticEnvironment.uiOptionsTestsAutoSave;
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
        
        var checkUIOComponents = function (uiOptions, uiEnhancer) {
            jqUnit.assertTrue("Check that uiEnhancer is present", uiOptions.options.components.uiEnhancer);
            jqUnit.assertTrue("Check that textControls sub-component is present", uiOptions.options.components.textControls);
            jqUnit.assertTrue("Check that layoutControls sub-component is present", uiOptions.options.components.layoutControls);
            jqUnit.assertTrue("Check that linkControls sub-component is present", uiOptions.options.components.linksControls);
            jqUnit.assertTrue("Check that preview sub-component is present", uiOptions.options.components.preview);
            jqUnit.assertTrue("Check that store sub-component is present", uiOptions.options.components.settingsStore);
            jqUnit.assertTrue("Check that tableOfContents sub-component is present", uiEnhancer.options.components.tableOfContents);
            jqUnit.assertTrue("Check that store sub-component is present", uiEnhancer.options.components.settingsStore);
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
                        uiEnhancer: "{uiEnhancer}",
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
     
            testUIOptions(function (uiOptions, uiEnhancer) {
                checkUIOComponents(uiOptions, uiEnhancer);
                
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
            });
            
            delete fluid.staticEnvironment.uiOptionsTestsIntegration;
        });
    });
    
})(jQuery);
