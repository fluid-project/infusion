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

        fluid.demands("settingsStore", ["fluid.uiEnhancer", "fluid.uiOptions.tests"], {
            funcName: "fluid.tempStore"
        });
        
        var bwSkin = {
            textSize: "1.8",
            textFont: "verdana",
            theme: "bw",
            lineSpacing: 2
        };
        
        var bwSkin2 = {
            textSize: "11",
            textFont: "italic",
            theme: "cw",
            lineSpacing: 1
        };
            
        var saveCalled = false;

        var uiOptionsOptions = {
            listeners: {
                onSave: function () {
                    saveCalled = true;
                }
            }
        };

        var enhancerOptions = {
            savedSettings: fluid.defaults("fluid.uiEnhancer").defaultSiteSettings
        };

        var testUIOptions = function (testFn, uiOptionsTestOptions, enhancerTestOptions) {
            // Supply the templates
            fluid.staticEnvironment.uiOptionsDemo = fluid.typeTag("fluid.uiOptionsDemo");
            fluid.demands("fluid.uiOptionsTemplateLoader", "fluid.uiOptionsDemo", {
                options: {
                    templates: {
                        uiOptions: "../../../../components/uiOptions/html/FullPreviewUIOptions.html",
                        textControls: "../../../../components/uiOptions/html/UIOptionsTemplate-text.html",
                        layoutControls: "../../../../components/uiOptions/html/UIOptionsTemplate-layout.html",
                        linksControls: "../../../../components/uiOptions/html/UIOptionsTemplate-links.html"
                    }
                }
            });

            var uiEnhancer = fluid.pageEnhancer(fluid.merge(null, enhancerOptions, enhancerTestOptions)).uiEnhancer;
            var uiOptions = fluid.uiOptions("#ui-options", fluid.merge(null, uiOptionsOptions, uiOptionsTestOptions));

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
                jqUnit.assertDeepEq("hc setting was saved", bwSkin.theme, uiOptions.uiEnhancer.model.theme);
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
                jqUnit.assertEquals("hc setting was not saved", "default", uiOptions.uiEnhancer.model.theme);

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
                jqUnit.assertEquals("The theme is is set to wb", "wb", themeValue);

                var fontValue = settings.textFont;
                jqUnit.assertEquals("The font is is set to times", "times", fontValue);
            }, null, enhancerOpts);
        });


        /*****************
         * Preview tests *
         *****************/
         
        tests.asyncTest("Preview URL", function () {
            expect(1);
            
            var templateUrl = "TestPreviewTemplate.html";
            var myOpts = {
                components: {
                    preview: {
                        options: {
                            templateUrl: templateUrl
                        }
                    }
                }        
            };
            
            testUIOptions(function (uiOptions) {
                jqUnit.assertEquals("The preview iFrame is pointing to the specified markup",
                    templateUrl, uiOptions.preview.container.attr("src"));
            }, myOpts);
        });
        
        tests.asyncTest("UIOptions Auto-save", function () {
            expect(2);
            
            var autoSaveOptions = {
                autoSave: true
            };

            testUIOptions(function (uiOptions) {
                resetSaveCalled();
                uiOptions.updateModel(bwSkin);
                jqUnit.assertTrue("Model has changed, auto-save changes", saveCalled);
                jqUnit.assertDeepEq("hc setting was saved", bwSkin.theme, uiOptions.uiEnhancer.model.theme);
                
            }, autoSaveOptions);
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
            testUIOptions(function (uiOptions, uiEnhancer) {
                checkUIOComponents(uiOptions, uiEnhancer);
                
                var saveButton = uiOptions.locate("save");
                var cancelButton = uiOptions.locate("cancel");
                var resetButton = uiOptions.locate("reset");
                
                applierRequestChanges(uiOptions, bwSkin);
                checkModelSelections(bwSkin, uiOptions.model.selections);
                saveButton.click();
                checkModelSelections(bwSkin, uiOptions.options.savedSelections);
                applierRequestChanges(uiOptions, bwSkin2);
                cancelButton.click();
                checkModelSelections(bwSkin, uiOptions.options.savedSelections);
                resetButton.click();
                checkModelSelections(uiOptions.model.selections, uiOptions.settingsStore.options.defaultSiteSettings);
            });
        });
    });
    
})(jQuery);
