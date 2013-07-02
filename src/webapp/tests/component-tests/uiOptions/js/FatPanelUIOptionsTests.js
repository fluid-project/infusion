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
        listeners: {
            onDestroy: "fluid.tests.clearStore"
        },
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
                    templateLoader: {
                        options: {
                            gradeNames: ["fluid.uiOptions.starterTemplateLoader"]
                        }
                    },
                    uiOptions: {
                        options: {
                            gradeNames: ["fluid.uiOptions.starterPanels", "fluid.uiOptions.rootModel.starter", "fluid.uiOptions.uiEnhancerRelay"]
                        }
                    }
                }
            },
            fatPanelIntegrationTester: {
                type: "fluid.tests.fatPanelIntegrationTester"
            }
        }
    });

    // Cleanup listener that restores a global settings store model to default.
    fluid.tests.clearStore = function () {
        fluid.staticEnvironment.settingsStore.set();
    };

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
            var rootModel = fatPanel.uiOptionsLoader.uiOptions.rootModel;
            var pageModel = fatPanel.pageEnhancer.model;
            var panelModel = fatPanel.iframeRenderer.iframeEnhancer.model;
            
            fatPanel.locate("reset").click();
            fluid.tests.uiOptions.checkModelSelections("pageModel from defaults", rootModel, pageModel);
            fatPanel.slidingPanel.hidePanel();
            fluid.tests.uiOptions.checkModelSelections("panelModel from defaults", rootModel, panelModel);
            fluid.tests.uiOptions.checkModelSelections("pageModel from panelModel", pageModel, panelModel);  
        };
    };

    fluid.defaults("fluid.tests.fatPanelIntegrationTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Fat panel integration tests",
            tests: [{
                expect: 18,
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

    var expectedIframeSelector = ".uio-munging";
    var isSlidingPanelShown = false;
    
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
                    },
                    slidingPanel: {
                        options: {
                            listeners: {
                                onPanelShow: function() {
                                    isSlidingPanelShown = true;
                                }
                            }
                        }
                    },
                    iframe: expectedIframeSelector,
                    uiOptions: {
                        options: {
                            members: {
                                rootModel: {
                                    theme: "yb"
                                }
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

    fluid.tests.testEnhancerTransit = function testEnhancerTransit(fatPanel, expectedIframeSelector) {
        var cMap = fluid.tests.uiOptions.enhancerOptions.classnameMap;
        
        // "outerEnhancerOptions" option mapping
        jqUnit.assertEquals("classnameMap transferred to outer UIEnhancer", cMap.textFont["default"],
             fatPanel.pageEnhancer.options.classnameMap.textFont["default"]);
        jqUnit.assertEquals("classnameMap transferred to inner UIEnhancer", cMap.textFont["default"],
             fatPanel.iframeRenderer.iframeEnhancer.options.classnameMap.textFont["default"]);
        
        // "slidingPanel" option mapping
        jqUnit.assertFalse("UIO Panel is hidden", isSlidingPanelShown);
        fatPanel.slidingPanel.locate("toggleButton").click();
        jqUnit.assertTrue("UIO Panel is shown", isSlidingPanelShown);
        
        // "iframe" option mapping
        jqUnit.assertEquals("Iframe selector is transferred in", expectedIframeSelector, fatPanel.options.selectors.iframe);
    };

    fluid.defaults("fluid.tests.mungingIntegrationTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        expectedIframeSelector: expectedIframeSelector,
        modules: [{
            name: "Fat panel munging integration tests",
            tests: [{
                expect: 13,
                name: "Fat panel munging integration tests",
                sequence: [{
                    listener: "fluid.tests.uiOptions.testComponentIntegration",
                    event: "{fatPanelMungingIntegration fatPanel uiOptionsLoader}.events.onReady"
                }, {
                    func: "fluid.tests.testEnhancerTransit",
                    args: ["{fatPanel}", "{that}.options.expectedIframeSelector"]
                }]
            }]
        }]
    });

    $(document).ready(function () {

        fluid.globalSettingsStore();
        fluid.pageEnhancer(fluid.tests.uiOptions.enhancerOptions);
    
        fluid.test.runTests([
            "fluid.tests.fatPanelIntegration",
            "fluid.tests.fatPanelMungingIntegration"
        ]);
    });

})(jQuery);
