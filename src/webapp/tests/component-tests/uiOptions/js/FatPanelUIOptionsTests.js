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
    
    /***********
     * Demands *
     ***********/
    
    $(document).ready(function () {

        fluid.staticEnvironment.fatPanelTests = fluid.typeTag("fluid.uiOptions.fatPanelTests");

        // Use temp store rather than the cookie store for setting save
        fluid.demands("fluid.uiOptions.store", ["fluid.uiEnhancer", "fluid.uiOptions.fatPanelTests"], {
            funcName: "fluid.tempStore"
        });

        var tests = jqUnit.testCase("UIOptions fatPanel Tests");
        
        /****************************************
         * UIOptions fatPanel integration tests *
         ****************************************/
        
        var applierRequestChanges = function (uiOptions, selectionOptions) {
            uiOptions.applier.requestChange("selections.textFont", selectionOptions.textFont);
            uiOptions.applier.requestChange("selections.theme", selectionOptions.theme);
            uiOptions.applier.requestChange("selections.textSize", selectionOptions.textSize);
            uiOptions.applier.requestChange("selections.lineSpacing", selectionOptions.lineSpacing);            
        };
        
        var checkUIOComponents = function (uio) {
            var components = uio.options.components;
            var eventBinderComponents = components.eventBinder.options.components; 
            jqUnit.assertTrue("slidingPanel is present", components.slidingPanel);
            jqUnit.assertTrue("markupRenderer is present", components.markupRenderer);
            jqUnit.assertTrue("uiEnhancer is preset", components.uiEnhancer);
            jqUnit.assertTrue("eventBinder is present", components.eventBinder);
            jqUnit.assertTrue("Bridge is present", components.bridge);
            jqUnit.assertTrue("uiEnhancer is present as an eventBinder sub-component", eventBinderComponents.uiEnhancer);
            jqUnit.assertTrue("uiOptionsLoader is present as an eventBinder sub-component", eventBinderComponents.uiOptionsLoader);
            jqUnit.assertTrue("slidingPanel is present as an eventBinder sub-component", eventBinderComponents.slidingPanel);
            jqUnit.assertTrue("markupRenderer is present as an bridge sub-component", components.bridge.options.components.markupRenderer);
        };        
        
        var checkModelSelections = function (message, expectedSelections, actualSelections) {
            jqUnit.assertEquals("Text font correctly updated: " + message,  expectedSelections.textFont, actualSelections.textFont);
            jqUnit.assertEquals("Theme correctly updated: " + message, expectedSelections.theme, actualSelections.theme);
            jqUnit.assertEquals("Text size correctly updated: " + message, expectedSelections.textSize, actualSelections.textSize);
            jqUnit.assertEquals("Line spacing correctly updated: " + message, expectedSelections.lineSpacing, actualSelections.lineSpacing);            
        };
        
        var bwSkin = {
            textSize: "1.8",
            textFont: "verdana",
            theme: "bw",
            lineSpacing: 2
        };
        
        tests.asyncTest("Fat Panel UIOptions Integration tests", function () {
            fluid.pageEnhancer({
                tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
            });

            var that = fluid.uiOptions.fatPanel(".flc-uiOptions-fatPanel", {
                prefix: "../../../../components/uiOptions/html/",
                markupRenderer: {
                    options: {
                        markupProps: {
                            src: "./FatPanelUIOptionsFrame-test.html"
                        }
                    }
                }
            });
            
            checkUIOComponents(that);

            setTimeout(function () {
                var defaultSiteSettings = that.uiEnhancer.settingsStore.options.defaultSiteSettings;
                var pageModel = that.uiEnhancer.model;
                var panelModel = that.bridge.uiOptionsLoader.uiOptions.uiEnhancer.model;
                
                var settingsStoreOptions = that.uiEnhancer.settingsStore.options;
                
                // Open the Fat Panel, apply changes, and close the panel
                that.slidingPanel.showPanel();
                applierRequestChanges(that.bridge.uiOptionsLoader.uiOptions, bwSkin);
                checkModelSelections("pageModel from bwSkin", bwSkin, pageModel);
                that.slidingPanel.hidePanel();
                that.slidingPanel.showPanel();
                checkModelSelections("panelModel from bwSkin", bwSkin, panelModel);
                checkModelSelections("panelModel from pageModel", pageModel, panelModel);
                that.slidingPanel.hidePanel();
                
                // Open the Fat Panel, click "Reset All", and close the panel
                that.slidingPanel.showPanel();
                that.bridge.uiOptionsLoader.uiOptions.locate("reset").click();
                checkModelSelections("pageModel from defaults", defaultSiteSettings, pageModel);
                that.slidingPanel.hidePanel();
                checkModelSelections("panelModel from defaults", defaultSiteSettings, panelModel);
                checkModelSelections("pageModel from panelModel", panelModel, pageModel);
                start();
            }, 2500);
        });
        
        /********************************************************
         * UIOptions fatPanel options munging integration tests *
         ********************************************************/
        
        tests.asyncTest("Fat Panel UIOptions Options Munging Integration tests", function () {
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

            var that = fluid.uiOptions.fatPanel(".flc-uiOptions-fatPanel", {
                prefix: "../../../../components/uiOptions/html/",
                markupRenderer: {
                    options: {
                        markupProps: {
                            src: "./FatPanelUIOptionsFrame-test.html"
                        }
                    }
                },
                textControls: {
                    options: {
                        strings: {
                            textFont: testStrings
                        },
                        controlValues: { 
                            textFont: testControlValues
                        }
                    }
                }
            });
            
            setTimeout(function () {
                var body = $("body");
                
                jqUnit.assertTrue("Times font is set", body.hasClass("fl-font-times"));
                jqUnit.assertTrue("The default test theme is set", body.hasClass("fl-test"));
                
                var actualTextFontStrings = that.bridge.uiOptionsLoader.uiOptions.textControls.options.strings.textFont;
                var actualTextFontControlValues = that.bridge.uiOptionsLoader.uiOptions.textControls.options.controlValues.textFont;
                
                jqUnit.assertEquals("There are 5 elements in the text font string list", 5, actualTextFontStrings.length);
                jqUnit.assertEquals("The first text font string value matches", testStrings[0], actualTextFontStrings[0]);
                jqUnit.assertEquals("The fifth text font string value matches", testStrings[4], actualTextFontStrings[4]);

                jqUnit.assertEquals("There are 5 elements in the text font control value list", 5, actualTextFontControlValues.length);
                jqUnit.assertEquals("The first text font control value matches", testControlValues[0], actualTextFontControlValues[0]);
                jqUnit.assertEquals("The fifth text font control value matches", testControlValues[4], actualTextFontControlValues[4]);

                start();
            }, 2500);
        });
        
    });
})(jQuery);