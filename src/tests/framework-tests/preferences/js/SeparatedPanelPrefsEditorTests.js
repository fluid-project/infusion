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
     * PrefsEditor separatedPanel integration tests
     *******************************************************************************/
    fluid.tests.prefs.expectedSeparatedPanel = [
        "templateLoader",
        "messageLoader",
        "pageEnhancer",
        "slidingPanel",
        "iframeRenderer",
        "iframeRenderer.iframeEnhancer"];

    fluid.defaults("fluid.tests.separatedPanelIntegration", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        listeners: {
            onDestroy: "fluid.tests.clearStore"
        },
        components: {
            separatedPanel: {
                type: "fluid.prefs.separatedPanel",
                container: ".flc-prefsEditor-separatedPanel",
                createOnEvent: "{separatedPanelIntegrationTester}.events.onTestCaseStart",
                options: {
                    gradeNames: ["fluid.prefs.transformDefaultPanelsOptions"],
                    templatePrefix: "../../../../framework/preferences/html/",
                    messagePrefix: "../../../../framework/preferences/messages/",
                    iframeRenderer: {
                        markupProps: {
                            src: "./SeparatedPanelPrefsEditorFrame.html"
                        }
                    },
                    templateLoader: {
                        gradeNames: ["fluid.prefs.starterSeparatedPanelTemplateLoader"]
                    },
                    messageLoader: {
                        gradeNames: ["fluid.prefs.starterMessageLoader"]
                    },
                    prefsEditor: {
                        gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.rootModel.starter", "fluid.prefs.uiEnhancerRelay"]
                    }
                }
            },
            separatedPanelIntegrationTester: {
                type: "fluid.tests.separatedPanelIntegrationTester"
            }
        }
    });

    // Cleanup listener that restores a global settings store model to default.
    fluid.tests.clearStore = function () {
        fluid.staticEnvironment.settingsStore.set();
    };

    fluid.tests.testSeparatedPanel = function (separatedPanel) {
        jqUnit.assertEquals("IFrame is invisible and keyboard inaccessible", false, separatedPanel.iframeRenderer.iframe.is(":visible"));
        fluid.tests.prefs.assertPresent(separatedPanel, fluid.tests.prefs.expectedSeparatedPanel);

        var prefsEditor = separatedPanel.prefsEditor;
        jqUnit.assertEquals("Reset button is invisible", false, $(".flc-prefsEditor-reset").is(":visible"));
        fluid.tests.prefs.assertPresent(prefsEditor, fluid.tests.prefs.expectedComponents["fluid.prefs.separatedPanel"]);
    };

    fluid.tests.afterShowFunc1 = function (separatedPanel) {
        return function () {
            fluid.tests.prefs.applierRequestChanges(separatedPanel.prefsEditor, fluid.tests.prefs.bwSkin);
            fluid.tests.prefs.checkModelSelections("pageModel from bwSkin", fluid.tests.prefs.bwSkin, separatedPanel.pageEnhancer.model);
            jqUnit.assertEquals("Reset button is visible", true, $(".flc-prefsEditor-reset").is(":visible"));
        };
    };

    fluid.tests.afterHideFunc1 = function (separatedPanel) {
        return function () {
            jqUnit.assertEquals("Reset button is invisible", false, $(".flc-prefsEditor-reset").is(":visible"));
        };
    };
    fluid.tests.afterShowFunc2 = function (separatedPanel) {
        return function () {
            var pageModel = separatedPanel.pageEnhancer.model;
            var panelModel = separatedPanel.iframeRenderer.iframeEnhancer.model;

            fluid.tests.prefs.checkModelSelections("panelModel from bwSkin", fluid.tests.prefs.bwSkin, panelModel);
            fluid.tests.prefs.checkModelSelections("panelModel from pageModel", pageModel, panelModel);
        };
    };

    fluid.tests.afterShowFunc3 = function (separatedPanel) {
        return function () {
            var rootModel = separatedPanel.prefsEditor.rootModel;
            var pageModel = separatedPanel.pageEnhancer.model;
            var panelModel = separatedPanel.iframeRenderer.iframeEnhancer.model;

            separatedPanel.locate("reset").click();
            fluid.tests.prefs.checkModelSelections("pageModel from defaults", rootModel, pageModel);
            separatedPanel.slidingPanel.hidePanel();
            fluid.tests.prefs.checkModelSelections("panelModel from defaults", rootModel, panelModel);
            fluid.tests.prefs.checkModelSelections("pageModel from panelModel", pageModel, panelModel);
        };
    };

    fluid.defaults("fluid.tests.separatedPanelIntegrationTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Separated panel integration tests",
            tests: [{
                expect: 22,
                name: "Separated panel integration tests",
                sequence: [{
                    listener: "fluid.tests.testSeparatedPanel",
                    event: "{separatedPanelIntegration separatedPanel}.events.onReady"
                }, {
                    func: "{separatedPanel}.slidingPanel.hidePanel"
                }, {
                    func: "{separatedPanel}.slidingPanel.showPanel"
                }, {
                    listenerMaker: "fluid.tests.afterShowFunc1",
                    makerArgs: ["{separatedPanel}"],
                    event: "{separatedPanel}.slidingPanel.events.afterPanelShow"
                }, {
                    func: "{separatedPanel}.slidingPanel.hidePanel"
                }, {
                    listenerMaker: "fluid.tests.afterHideFunc1",
                    makerArgs: ["{separatedPanel}"],
                    event: "{separatedPanel}.slidingPanel.events.afterPanelHide"
                }, {
                    func: "{separatedPanel}.slidingPanel.showPanel"
                }, {
                    listenerMaker: "fluid.tests.afterShowFunc2",
                    makerArgs: ["{separatedPanel}"],
                    event: "{separatedPanel}.slidingPanel.events.afterPanelShow"
                }, {
                    func: "{separatedPanel}.slidingPanel.hidePanel"
                }, {
                    func: "{separatedPanel}.slidingPanel.showPanel"
                }, {
                    listenerMaker: "fluid.tests.afterShowFunc3",
                    makerArgs: ["{separatedPanel}"],
                    event: "{separatedPanel}.slidingPanel.events.afterPanelShow"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * PrefsEditor separatedPanel options munging integration tests
     *******************************************************************************/

    var expectedIframeSelector = ".prefsEditor-munging";
    var isSlidingPanelShown = false;

    fluid.defaults("fluid.tests.separatedPanelMungingIntegration", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            separatedPanel: {
                type: "fluid.prefs.separatedPanel",
                container: ".flc-prefsEditor-separatedPanel",
                createOnEvent: "{mungingIntegrationTester}.events.onTestCaseStart",
                options: fluid.merge(null, fluid.tests.prefs.mungingIntegrationOptions, {
                    iframeRenderer: {
                        markupProps: {
                            src: "./SeparatedPanelPrefsEditorFrame.html"
                        }
                    },
                    slidingPanel: {
                        listeners: {
                            onPanelShow: function() {
                                isSlidingPanelShown = true;
                            }
                        }
                    },
                    iframe: expectedIframeSelector,
                    prefsEditor: {
                        members: {
                            rootModel: {
                                theme: "yb"
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

    fluid.tests.testEnhancerTransit = function testEnhancerTransit(separatedPanel, expectedIframeSelector) {
        var cMap = fluid.tests.prefs.enhancerOptions.uiEnhancer.classnameMap;

        // "outerEnhancerOptions" option mapping
        jqUnit.assertEquals("classnameMap transferred to outer UIEnhancer", cMap.textFont["default"],
             separatedPanel.pageEnhancer.options.classnameMap.textFont["default"]);
        jqUnit.assertEquals("classnameMap transferred to inner UIEnhancer", cMap.textFont["default"],
             separatedPanel.iframeRenderer.iframeEnhancer.options.classnameMap.textFont["default"]);

        // "slidingPanel" option mapping
        jqUnit.assertFalse("Preferences EditorPanel is hidden", isSlidingPanelShown);
        separatedPanel.slidingPanel.locate("toggleButton").click();
        jqUnit.assertTrue("Preferences EditorPanel is shown", isSlidingPanelShown);

        // "iframe" option mapping
        jqUnit.assertEquals("Iframe selector is transferred in", expectedIframeSelector, separatedPanel.options.selectors.iframe);
    };

    fluid.defaults("fluid.tests.mungingIntegrationTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        expectedIframeSelector: expectedIframeSelector,
        modules: [{
            name: "Separated panel munging integration tests",
            tests: [{
                expect: 13,
                name: "Separated panel munging integration tests",
                sequence: [{
                    listener: "fluid.tests.prefs.testComponentIntegration",
                    event: "{separatedPanelMungingIntegration separatedPanel prefsEditor}.events.onReady"
                }, {
                    func: "fluid.tests.testEnhancerTransit",
                    args: ["{separatedPanel}", "{that}.options.expectedIframeSelector"]
                }]
            }]
        }]
    });

    $(document).ready(function () {

        fluid.globalSettingsStore();
        fluid.pageEnhancer(fluid.tests.prefs.enhancerOptions);

        fluid.test.runTests([
            "fluid.tests.separatedPanelIntegration",
            "fluid.tests.separatedPanelMungingIntegration"
        ]);
    });

})(jQuery);
