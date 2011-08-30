/*
Copyright 2011 OCAD University

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
        
        var tests = jqUnit.testCase("FullNoPreviewUIOptions Tests");
        fluid.staticEnvironment.noPreviewTests = fluid.typeTag("fluid.uiOptions.noPreviewTests");
        
        // Use temp store rather than the cookie store for setting save
        fluid.demands("fluid.uiOptions.store", ["fluid.uiEnhancer", "fluid.uiOptions.noPreviewTests"], {
            funcName: "fluid.tempStore"
        });

        var bwSkin = {
            textSize: "1.8",
            textFont: "verdana",
            theme: "bw",
            lineSpacing: 2
        };
        
        var ybSkin = {
            textSize: "2",
            textFont: "comic sans",
            theme: "yb",
            lineSpacing: 1.5
        };        
        
        /**************************************************
         * fluid.fullNoPreviewUIOptions Integration Tests *
         **************************************************/        

        var checkUIOComponents = function (uiOptions) {
            jqUnit.assertTrue("Check that textControls sub-component is present", uiOptions.textControls);
            jqUnit.assertTrue("Check that layoutControls sub-component is present", uiOptions.layoutControls);
            jqUnit.assertTrue("Check that linkControls sub-component is present", uiOptions.linksControls);
            jqUnit.assertTrue("Check that preview sub-component is present", uiOptions.options.components.preview);
            jqUnit.assertTrue("Check that store sub-component is present", uiOptions.options.components.settingsStore);
            jqUnit.assertTrue("Check that eventBinder sub-component is present", uiOptions.options.components.eventBinder);
        };
        
        var checkModelSelections = function (expectedSelections, actualSelections) {
            jqUnit.assertEquals("Text font correctly updated", expectedSelections.textFont, actualSelections.textFont);
            jqUnit.assertEquals("Theme correctly updated", expectedSelections.theme, actualSelections.theme);
            jqUnit.assertEquals("Text size correctly updated", expectedSelections.textSize, actualSelections.textSize);
            jqUnit.assertEquals("Line spacing correctly updated", expectedSelections.lineSpacing, actualSelections.lineSpacing);            
        };
        
        var applierRequestChanges = function (uiOptions, selectionOptions) {
            uiOptions.applier.requestChange("selections.textFont", selectionOptions.textFont);
            uiOptions.applier.requestChange("selections.theme", selectionOptions.theme);
            uiOptions.applier.requestChange("selections.textSize", selectionOptions.textSize);
            uiOptions.applier.requestChange("selections.lineSpacing", selectionOptions.lineSpacing);            
        };                
        

        
        tests.asyncTest("FullNoPreview UIOptions Integration tests", function () {
            fluid.pageEnhancer({
                tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
            });
            
            function testComponent(uiOptionsLoader, uiOptions) {
                var defaultSiteSettings = uiOptions.settingsStore.options.defaultSiteSettings;
                
                checkUIOComponents(uiOptions);
                applierRequestChanges(uiOptions, bwSkin);
    
                var saveButton = uiOptions.locate("save");
                saveButton.click();
                checkModelSelections(uiOptions.model.selections, bwSkin);
                applierRequestChanges(uiOptions, ybSkin);
    
                var cancelButton = uiOptions.locate("cancel");
                cancelButton.click();
                checkModelSelections(uiOptions.model.selections, bwSkin);
                
                var resetButton = uiOptions.locate("reset");
                resetButton.click();
                checkModelSelections(uiOptions.model.selections, defaultSiteSettings);
                applierRequestChanges(uiOptions, bwSkin);
                
                cancelButton.click();
                checkModelSelections(uiOptions.model.selections, defaultSiteSettings);
                
                start();
            };
            
            jqUnit.expect(22);
                       
            var that = fluid.uiOptions.fullNoPreview("#myUIOptions", {
                prefix: "../../../../components/uiOptions/html/",
                uiOptionsLoader: {
                    options: {
                        listeners: {
                            onReady: testComponent
                        }
                    }
                }
            });
            
        });        

        /******************************************************************
         * fluid.fullNoPreviewUIOptions Options Munging Integration Tests *
         ******************************************************************/

        tests.asyncTest("Full w/o Preview UIOptions Options Munging Integration tests", function () {
            fluid.pageEnhancer({
                tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html",
                classnameMap: {
                    "textFont": {
                        "default": "fl-font-times"
                    },
                    "theme": {
                        "yb": "fl-test"
                    }
                },
                defaultSiteSettings: {
                    theme: "yb"
                }
            });

            var testStrings = ["Test1", "Test2", "Test3", "Test4", "Test5"];
            var testControlValues = ["a", "b", "c", "d", "e"];
            
            jqUnit.expect(8);

            function testComponent(uiOptionsLoader, uiOptions) {
                var body = $("body");
                
                jqUnit.assertTrue("Times font is set", body.hasClass("fl-font-times"));
                jqUnit.assertTrue("The default test theme is set", body.hasClass("fl-test"));
                
                var actualTextFontStrings = uiOptions.textControls.options.strings.textFont;
                var actualTextFontControlValues = uiOptions.textControls.options.controlValues.textFont;
                
                jqUnit.assertEquals("There are 5 elements in the text font string list", 5, actualTextFontStrings.length);
                jqUnit.assertEquals("The first text font string value matches", testStrings[0], actualTextFontStrings[0]);
                jqUnit.assertEquals("The fifth text font string value matches", testStrings[4], actualTextFontStrings[4]);

                jqUnit.assertEquals("There are 5 elements in the text font control value list", 5, actualTextFontControlValues.length);
                jqUnit.assertEquals("The first text font control value matches", testControlValues[0], actualTextFontControlValues[0]);
                jqUnit.assertEquals("The fifth text font control value matches", testControlValues[4], actualTextFontControlValues[4]);

                start();
            };

            var that = fluid.uiOptions.fullNoPreview("#myUIOptions", {
                prefix: "../../../../components/uiOptions/html/",
                textControls: {
                    options: {
                        strings: {
                            textFont: testStrings
                        },
                        controlValues: { 
                            textFont: testControlValues
                        }
                    }
                },
                uiOptionsLoader: {
                    options: {
                        listeners: {
                            onReady: testComponent
                        }
                    }
                }
            });
        });
        
    });
})(jQuery);