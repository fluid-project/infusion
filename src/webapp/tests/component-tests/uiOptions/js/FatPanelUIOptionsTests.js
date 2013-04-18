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
    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * UIOptions fatPanel integration tests
     *******************************************************************************/
    fluid.tests.uiOptions.expectedFatPanel = [
        "pageEnhancer",
        "slidingPanel",
        "iframeRenderer",
        "iframeRenderer.iframeEnhancer"];
    
    fluid.defaults("fluid.tests.fatPanelIntegration", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            fatPanel: {
                type: "fluid.uiOptions.fatPanel",
                container: ".flc-uiOptions-fatPanel",
                createOnEvent: "{fatPanelIntegrationTester}.events.onTestCaseStart",
                options: {
                    gradeNames: ["fluid.uiOptions.transformDefaultPanelsOptions"],
                    prefix: "../../../../components/uiOptions/html/",
                    iframeRenderer: {
                        options: {
                            markupProps: {
                                src: "./FatPanelUIOptionsFrame.html"
                            }
                        }
                    },
                    uiOptions: {
                        options: {
                            gradeNames: ["fluid.uiOptions.defaultSettingsPanels"]
                        }
                    }
                }
            },
            fatPanelIntegrationTester: {
                type: "fluid.tests.fatPanelIntegrationTester"
            }
        }
    });

    fluid.tests.testComponent = function (uiOptionsLoader, uiOptions) {
        jqUnit.assertEquals("IFrame is invisible and keyboard inaccessible", false, uiOptions.iframeRenderer.iframe.is(":visible"));

        fluid.tests.uiOptions.assertPresent(uiOptions, fluid.tests.uiOptions.expectedComponents["fluid.uiOptions.fatPanel"]);
    };
    
    fluid.tests.testFatPanel = function (fatPanel) {
        fluid.tests.uiOptions.assertPresent(fatPanel, fluid.tests.uiOptions.expectedFatPanel);
    };
    
    fluid.tests.afterShowFunc1 = function (fatPanel) {
        return function () {
            fluid.tests.uiOptions.applierRequestChanges(fatPanel.uiOptionsLoader.uiOptions, fluid.tests.uiOptions.bwSkin);
            fluid.tests.uiOptions.checkModelSelections("pageModel from bwSkin", fluid.tests.uiOptions.bwSkin, fatPanel.pageEnhancer.model);
        };
    };
    
    fluid.tests.afterShowFunc2 = function (fatPanel) {
        return function () {
            var pageModel = fatPanel.pageEnhancer.model;
            var panelModel = fatPanel.iframeRenderer.iframeEnhancer.model;
            
            fluid.tests.uiOptions.checkModelSelections("panelModel from bwSkin", fluid.tests.uiOptions.bwSkin, panelModel);
            fluid.tests.uiOptions.checkModelSelections("panelModel from pageModel", pageModel, panelModel);
        };
    };
    
    fluid.tests.afterShowFunc3 = function (fatPanel) {
        return function () {
            var defaultSiteSettings = fatPanel.pageEnhancer.settingsStore.options.defaultSiteSettings;
            var pageModel = fatPanel.pageEnhancer.model;
            var panelModel = fatPanel.iframeRenderer.iframeEnhancer.model;
            
            fatPanel.uiOptionsLoader.uiOptions.locate("reset").click();
            fluid.tests.uiOptions.checkModelSelections("pageModel from defaults", defaultSiteSettings, pageModel);
            fatPanel.slidingPanel.hidePanel();
            fluid.tests.uiOptions.checkModelSelections("panelModel from defaults", defaultSiteSettings, panelModel);
            fluid.tests.uiOptions.checkModelSelections("pageModel from panelModel", pageModel, panelModel);  
        };
    };

    fluid.defaults("fluid.tests.fatPanelIntegrationTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Fat panel integration tests",
            tests: [{
                expect: 19,
                name: "Fat panel integration tests",
                sequence: [{
                    listener: "fluid.tests.testComponent",
                    event: "{fatPanelIntegration fatPanel uiOptionsLoader}.events.onReady"
                }, {
                    func: "fluid.tests.testFatPanel",
                    args: "{fatPanel}"
                }, {
                    func: "{fatPanel}.slidingPanel.hidePanel"
                }, {
                    func: "{fatPanel}.slidingPanel.showPanel"
                }, {
                    listenerMaker: "fluid.tests.afterShowFunc1",
                    makerArgs: ["{fatPanel}"],
                    event: "{fatPanel}.slidingPanel.events.afterPanelShow"
                }, {
                    func: "{fatPanel}.slidingPanel.hidePanel"
                }, {
                    func: "{fatPanel}.slidingPanel.showPanel"
                }, {
                    listenerMaker: "fluid.tests.afterShowFunc2",
                    makerArgs: ["{fatPanel}"],
                    event: "{fatPanel}.slidingPanel.events.afterPanelShow"
                }, {
                    func: "{fatPanel}.slidingPanel.hidePanel"
                }, {
                    func: "{fatPanel}.slidingPanel.showPanel"
                }, {
                    listenerMaker: "fluid.tests.afterShowFunc3",
                    makerArgs: ["{fatPanel}"],
                    event: "{fatPanel}.slidingPanel.events.afterPanelShow"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * UIOptions fatPanel options munging integration tests
     *******************************************************************************/

    fluid.defaults("fluid.tests.fatPanelMungingIntegration", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            fatPanel: {
                type: "fluid.uiOptions.fatPanel",
                container: ".flc-uiOptions-fatPanel",
                createOnEvent: "{mungingIntegrationTester}.events.onTestCaseStart",
                options: fluid.merge(null, fluid.tests.uiOptions.mungingIntegrationOptions, {
                    iframeRenderer: {
                        options: {
                            markupProps: {
                                src: "./FatPanelUIOptionsFrame.html"
                            }
                        }
                    }
                })
            },
            mungingIntegrationTester: {
                type: "fluid.tests.mungingIntegrationTester"
            }
        }
    });

    fluid.tests.testEnhancerTransit = function testEnhancerTransit(uiOptions) {
        var cMap = fluid.tests.uiOptions.enhancerOptions.classnameMap;
        jqUnit.assertEquals("classnameMap transferred to outer UIEnhancer", cMap.textFont["default"],
             uiOptions.pageEnhancer.options.classnameMap.textFont["default"]);
        jqUnit.assertEquals("classnameMap transferred to inner UIEnhancer", cMap.textFont["default"],
             uiOptions.iframeRenderer.iframeEnhancer.options.classnameMap.textFont["default"]);
    };

    fluid.defaults("fluid.tests.mungingIntegrationTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Fat panel munging integration tests",
            tests: [{
                expect: 10,
                name: "Fat panel munging integration tests",
                sequence: [{
                    listener: "fluid.tests.uiOptions.testComponentIntegration",
                    event: "{fatPanelMungingIntegration fatPanel uiOptionsLoader}.events.onReady"
                }, {
                    func: "fluid.tests.testEnhancerTransit",
                    args: "{fatPanel}"
                }]
            }]
        }]
    });

    $(document).ready(function () {

        fluid.pageEnhancer(fluid.tests.uiOptions.enhancerOptions);
    
        fluid.test.runTests([
            "fluid.tests.fatPanelIntegration",
            "fluid.tests.fatPanelMungingIntegration"
        ]);
    });

})(jQuery);
