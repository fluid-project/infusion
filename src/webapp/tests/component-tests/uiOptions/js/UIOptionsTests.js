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
    
        var bwSkin = {
            textSize: "1.8",
            textFont: "verdana",
            theme: "bw"
        };
        
        var bwSkin2 = {
            textSize: "11",
            textFont: "italic",
            theme: "bw"                
        };
            
        var saveCalled = false;

        var uiOptionsOptions = {
            listeners: {
                onSave: function () {
                    saveCalled = true;
                }
            },
            resources: {
                template: {
                    url: "../../../../components/uiOptions/html/FullPreviewUIOptions.html"
                }
            }
        };

        var enhancerOptions = {
            savedSettings: fluid.defaults("fluid.uiEnhancer").defaultSiteSettings
        };

        var testUIOptions = function (testFn, uiOptionsTestOptions, enhancerTestOptions) {
            // Supply the template URL of "text and display" panel on the user preferences interface
            fluid.demands("fluid.uiOptions.textControls", ["fluid.uiOptions"], {
                options: {
                    resources: {
                        template: {
                            url: "../../../../components/uiOptions/html/UIOptionsTemplate-text.html"
                        }
                    }
                }
            });

            // Supply the template URL of "layout and navigation" panel on the user preferences interface
            fluid.demands("fluid.uiOptions.layoutControls", ["fluid.uiOptions"], {
                options: {
                    resources: {
                        template: {
                            url: "../../../../components/uiOptions/html/UIOptionsTemplate-layout.html"
                        }
                    }
                }
            });

            // Supply the template URL of "layout and navigation" panel on the user preferences interface
            fluid.demands("fluid.uiOptions.linksControls", ["fluid.uiOptions"], {
                options: {
                    resources: {
                        template: {
                            url: "../../../../components/uiOptions/html/UIOptionsTemplate-links.html"
                        }
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
                defaultSiteSettings: {
                    theme: "wb",
                    textFont: "times"
                },
                settingsStore: {
                    type: "fluid.uiEnhancer.tempStore"
                }
            };
        
            testUIOptions(function (uiOptions) {
                var settings = uiOptions.uiEnhancer.defaultSiteSettings;
                
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
        
        var checkValidatedValue = function (changeRequestValue, expectedValue) {
            var model = {
                min: 2,
                max: 10,
                value: 5,
            };
            var changeRequest = {
                value: changeRequestValue        
            };

            fluid.textfieldSlider.validateValue(model, changeRequest);
            jqUnit.assertEquals("Validating value", expectedValue, changeRequest.value);
        } 
        
        tests.test("textSlider validateValue() tests", function () {
            checkValidatedValue(11, 10);
            checkValidatedValue(1, 2);
            checkValidatedValue(5, 5);
            checkValidatedValue(-1, 2);
            checkValidatedValue(undefined, 5);
            checkValidatedValue(null, 5);
            checkValidatedValue("", 5);
        });
    });
    
})(jQuery);
