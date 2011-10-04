/*
Copyright 2011 OCAD University
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

        var tests = jqUnit.testCase("UIOptions fatPanel Tests");
        
        fluid.tests.uiOptions.expectedFatPanel = [
            "eventBinder.uiEnhancer",
            "eventBinder.uiOptionsLoader",
            "eventBinder.slidingPanel",
            "bridge.markupRenderer"];
        
        /****************************************
         * UIOptions fatPanel integration tests *
         ****************************************/

        tests.asyncTest("Fat Panel UIOptions Integration tests", function () {
            fluid.pageEnhancer({
                tocTemplate: "../../../../components/tableOfContents/html/TableOfContents.html"
            });
            var that, uiOptions;
            var sequence = 0;
            
            function afterShowFunc() {
                var defaultSiteSettings = that.uiEnhancer.settingsStore.options.defaultSiteSettings;
                var pageModel = that.uiEnhancer.model;
                var panelModel = uiOptions.uiEnhancer.model;
                if (sequence === 0) {
                    fluid.tests.uiOptions.applierRequestChanges(that.bridge.uiOptionsLoader.uiOptions, fluid.tests.uiOptions.bwSkin);
                    fluid.tests.uiOptions.checkModelSelections("pageModel from bwSkin", fluid.tests.uiOptions.bwSkin, pageModel);
                    that.slidingPanel.hidePanel();
                    that.slidingPanel.showPanel();
                } else if (sequence === 1) {    
                    fluid.tests.uiOptions.checkModelSelections("panelModel from bwSkin", fluid.tests.uiOptions.bwSkin, panelModel);
                    fluid.tests.uiOptions.checkModelSelections("panelModel from pageModel", pageModel, panelModel);
                    that.slidingPanel.hidePanel();
                    that.slidingPanel.showPanel();
                } else if (sequence === 2) {
                  // Open the Fat Panel, click "Reset All", and close the panel
                    uiOptions.locate("reset").click();
                    fluid.tests.uiOptions.checkModelSelections("pageModel from defaults", defaultSiteSettings, pageModel);
                    that.slidingPanel.hidePanel();
                    fluid.tests.uiOptions.checkModelSelections("panelModel from defaults", defaultSiteSettings, panelModel);
                    fluid.tests.uiOptions.checkModelSelections("pageModel from panelModel", pageModel, panelModel);  
                    start();
                }
                ++sequence;
            }

            function testComponent(uiOptionsLoader, uiOptionsIn) {
                uiOptions = uiOptionsIn;
                fluid.tests.uiOptions.assertPresent(uiOptions, fluid.tests.uiOptions.expectedInline);
                fluid.tests.uiOptions.assertPresent(that, fluid.tests.uiOptions.expectedFatPanel);
                that.slidingPanel.showPanel();
            }

            that = fluid.uiOptions.fatPanel(".flc-uiOptions-fatPanel", {
                prefix: "../../../../components/uiOptions/html/",
                markupRenderer: {
                    options: {
                        markupProps: {
                            src: "./FatPanelUIOptionsFrame.html"
                        }
                    }
                },
                uiOptionsLoader: {
                    options: {
                        listeners: {
                            onReady: testComponent
                        }
                    }
                },
                slidingPanel: {
                    options: {
                        listeners: {
                            afterPanelShow: afterShowFunc
                        }
                    }
                }
            });
            jqUnit.expect(6);

        });
        
        /********************************************************
         * UIOptions fatPanel options munging integration tests *
         ********************************************************/
        
        function testEnhancerTransit(that, uiOptionsLoader, uiOptions) {
            jqUnit.expect(2);
            var cMap = fluid.tests.uiOptions.enhancerOptions.classnameMap;
            jqUnit.assertEquals("classnameMap transferred to outer UIEnhancer", cMap.textFont["default"],
                   that.uiEnhancer.options.classnameMap.textFont["default"]);
                   
            jqUnit.assertEquals("classnameMap transferred to inner UIEnhancer", cMap.textFont["default"],
                   uiOptions.uiEnhancer.options.classnameMap.textFont["default"]);
            start();
        }
        
        fluid.tests.uiOptions.mungingIntegrationTest(tests, "fluid.uiOptions.fatPanel", ".flc-uiOptions-fatPanel", 
            {
                markupRenderer: {
                    options: {
                        markupProps: {
                            src: "./FatPanelUIOptionsFrame.html"
                        }
                    }
                }
            }, testEnhancerTransit);
        
        
    });
})(jQuery);