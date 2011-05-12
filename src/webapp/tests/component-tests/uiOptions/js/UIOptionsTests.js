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
        
        var hcSkin = {
            textSize: "8",
            textFont: "verdana",
            textSpacing: "wide2",
            theme: "highContrast"
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
                    url: "../../../../components/uiOptions/html/UIOptions.html"
                }
            }
        };

        var enhancerOptions = {
            savedSettings: fluid.defaults("fluid.uiEnhancer").defaultSiteSettings
        };

        var testUIOptions = function (testFn, uiOptionsTestOptions, enhancerTestOptions) {
            var uiEnhancer = fluid.uiEnhancer(document, fluid.merge(null, enhancerOptions, enhancerTestOptions));
            var uiOptions = fluid.uiOptions("#ui-options", fluid.merge(null, uiOptionsOptions, uiOptionsTestOptions));
            uiOptions.events.onReady.addListener(function () {
                testFn(uiOptions, uiEnhancer);
                start();
            });
        };
        
        var tests = jqUnit.testCase("UIOptions Tests");

        tests.asyncTest("Init Model and Controls", function () {
            expect(15);
            
            testUIOptions(function (uiOptions) {
                var model = uiOptions.controls.model;
                jqUnit.assertNotNull("Model is not null", model);
                jqUnit.assertNotUndefined("Model is not undefined", model);
                jqUnit.assertFalse("Min text size is not set", !!model.textSize);
                jqUnit.assertEquals("Text font is set", "arial", model.selections.textFont);
                jqUnit.assertEquals("Text spacing is set", "", model.selections.textSpacing);
                jqUnit.assertEquals("Colour scheme is set", "default", model.selections.theme);

                var themeValues = uiOptions.controls.options.controlValues.theme;
                jqUnit.assertEquals("There are 5 themes in the control", 5, themeValues.length);
                jqUnit.assertEquals("The second theme is default", "default", themeValues[1]);

                var spacingValues = uiOptions.controls.options.controlValues.textSpacing;
                jqUnit.assertEquals("There are 4 text spacing values in the control", 4, spacingValues.length);
                jqUnit.assertEquals("The first value is default", "default", spacingValues[0]);

                var fontValues = uiOptions.controls.options.controlValues.textFont;
                jqUnit.assertEquals("There are 6 font values in the control", 6, fontValues.length);
                jqUnit.assertEquals("There is no default font value", -1, jQuery.inArray("default", fontValues));

                var layoutValues = uiOptions.controls.options.controlValues.layout;
                jqUnit.assertEquals("There are 2 layout values in the control", 2, layoutValues.length);
                jqUnit.assertEquals("There is a default layout value", 1, jQuery.inArray("default", layoutValues));

                var bgValues = uiOptions.controls.options.controlValues.backgroundImages;
                jqUnit.assertEquals("There are 2 back ground images values in the control", 2, bgValues.length);
            });            
        });

        tests.asyncTest("Save", function () {
            expect(4);
            
            testUIOptions(function (uiOptions) {
                uiOptions.updateControlsModel(hcSkin);

                jqUnit.assertFalse("Save hasn't been called", saveCalled);
                uiOptions.save();
                var container = $("body");
                jqUnit.assertTrue("Save has been called", saveCalled);
                jqUnit.assertDeepEq("hc setting was saved", hcSkin.theme, uiOptions.uiEnhancer.model.theme);
                jqUnit.assertTrue("Body has the high contrast colour scheme", container.hasClass("fl-theme-hc"));
                
            });
        });

        tests.asyncTest("Refresh View", function () {
            expect(6);
            
            testUIOptions(function (uiOptions) {
                uiOptions.updateControlsModel(hcSkin);

                jqUnit.assertEquals("hc setting was set in the model", hcSkin.theme, uiOptions.controls.model.selections.theme);
                jqUnit.assertEquals("hc setting was not saved", "default", uiOptions.uiEnhancer.model.theme);

                uiOptions.controls.refreshView();
                var fontSizeCtrl = $(".flc-uiOptions-min-text-size");
                var fontSizeSetting = $(".flc-textfieldSlider-field", fontSizeCtrl).val(); 
                jqUnit.assertEquals("Small font size selected", "8", fontSizeSetting);
                var fontStyleSelection = $(":selected", $(".flc-uiOptions-text-font"));
                jqUnit.assertEquals("Verdana selected", "verdana", fontStyleSelection[0].value);
                var textSpacingSelection = $(":selected", $(".flc-uiOptions-text-spacing"));
                jqUnit.assertEquals("Wider spacing is selected", "wide2", textSpacingSelection[0].value);
                var contrastSelection = $(":selected", $(".flc-uiOptions-theme"));
                jqUnit.assertEquals("High Contrast is selected", "highContrast", contrastSelection[0].value);
            
            });          
        });

        tests.asyncTest("Init with site defaults different from UIOptions control values", function () {
            expect(8);
            
            var enhancerOpts = {
                defaultSiteSettings: {
                    theme: "mist",
                    textSpacing: "wide4",
                    textFont: "monospace"
                },
                settingsStore: {
                    type: "fluid.uiEnhancer.tempStore"
                }
            };
        
            testUIOptions(function (uiOptions) {
                var themeValues = uiOptions.controls.options.controlValues.theme;
                jqUnit.assertEquals("There are 5 themes in the control", 5, themeValues.length);
                jqUnit.assertEquals("The second theme is mist", "mist", themeValues[1]);
                jqUnit.assertEquals("default theme value is gone", -1, jQuery.inArray("default", themeValues));

                var spacingValues = uiOptions.controls.options.controlValues.textSpacing;
                jqUnit.assertEquals("There are 4 text spacing values in the control", 4, spacingValues.length);
                jqUnit.assertEquals("The first value is wide4", "wide4", spacingValues[0]);
                jqUnit.assertEquals("default spacing value is gone", -1, jQuery.inArray("default", spacingValues));

                var fontValues = uiOptions.controls.options.controlValues.textFont;
                jqUnit.assertEquals("There are 7 font values in the control", 7, fontValues.length);
                jqUnit.assertEquals("The last font value is monospace", "monospace", fontValues[6]);
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
    });
    
})(jQuery);
