/*
Copyright 2011-2016 OCAD University
Copyright 2011 Lucendo Development Ltd.
Copyright 2015 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */


(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * PrefsEditor separatedPanel integration tests
     *******************************************************************************/
    fluid.tests.prefs.panelState = {
        panelIndex: 0,
        panelMaxIndex: 5
    };

    fluid.tests.prefs.expectedSeparatedPanel = [
        "templateLoader",
        "messageLoader",
        "slidingPanel",
        "iframeRenderer",
        "iframeRenderer.iframeEnhancer"
    ];

    fluid.defaults("fluid.tests.prefs.separatedPanelIntegration", {
        gradeNames: ["fluid.test.testEnvironment"],
        listeners: {
            onDestroy: "fluid.tests.prefs.clearStore"
        },
        components: {
            separatedPanel: {
                type: "fluid.prefs.separatedPanel",
                container: ".flc-prefsEditor-separatedPanel",
                createOnEvent: "{separatedPanelIntegrationTester}.events.onTestCaseStart",
                options: {
                    gradeNames: ["fluid.prefs.transformDefaultPanelsOptions", "fluid.prefs.initialModel.starter"],
                    terms: {
                        templatePrefix: "../../../../src/framework/preferences/html/",
                        messagePrefix: "../../../../src/framework/preferences/messages/"
                    },
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
                        gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.uiEnhancerRelay"]
                    }
                }
            },
            separatedPanelIntegrationTester: {
                type: "fluid.tests.prefs.separatedPanelIntegrationTester"
            }
        }
    });

    fluid.tests.prefs.fetchGlobalSettingsStore = function () {
        return fluid.queryIoCSelector(fluid.rootComponent, "fluid.prefs.globalSettingsStore", true)[0].settingsStore;
    };

    // Cleanup listener that restores a global settings store model to default.
    fluid.tests.prefs.clearStore = function () {
        var settingsStore = fluid.tests.prefs.fetchGlobalSettingsStore();
        settingsStore.set();
    };

    fluid.tests.prefs.getPageEnhancer = function (that) {
        var pageEnhancer = fluid.resolveContext("pageEnhancer", that);
        return pageEnhancer.uiEnhancer;
    };

    fluid.tests.prefs.assertAriaForButton = function (button, buttonName, controlsId) {
        jqUnit.assertEquals(buttonName + " button has the button role", "button", button.attr("role"));
        jqUnit.assertEquals(buttonName + " button has correct aria-controls", controlsId, button.attr("aria-controls"));
    };

    fluid.tests.prefs.assertAriaForToggleButton = function (button, buttonName, controlsId, state) {
        fluid.tests.prefs.assertAriaForButton(button, buttonName, controlsId);
        jqUnit.assertEquals(buttonName + " button has correct aria-pressed", state, button.attr("aria-pressed"));
    };

    fluid.tests.prefs.assertAria = function (that, state) {
        var toggleButton = that.locate("toggleButton");
        var panel = that.locate("panel");
        var panelId = panel.attr("id");

        fluid.tests.prefs.assertAriaForToggleButton(toggleButton, "Hide/show", panelId, state);
        jqUnit.assertEquals("Panel has the group role", "group", panel.attr("role"));
        jqUnit.assertEquals("Panel has the correct aria-label", that.options.strings.panelLabel, panel.attr("aria-label"));
        jqUnit.assertEquals("Panel has correct aria-expanded", state, panel.attr("aria-expanded"));
    };

    fluid.tests.prefs.testSeparatedPanel = function (separatedPanel) {
        jqUnit.assertEquals("IFrame is invisible and keyboard inaccessible", false, separatedPanel.iframeRenderer.iframe.is(":visible"));
        fluid.tests.prefs.assertPresent(separatedPanel, fluid.tests.prefs.expectedSeparatedPanel);

        var prefsEditor = separatedPanel.prefsEditor;
        jqUnit.assertEquals("Reset button is invisible", false, $(".flc-prefsEditor-reset").is(":visible"));
        fluid.tests.prefs.assertPresent(prefsEditor, fluid.tests.prefs.expectedComponents["fluid.prefs.separatedPanel"]);

        fluid.tests.prefs.assertAria(separatedPanel.slidingPanel, "false");
        fluid.tests.prefs.assertAriaForButton(separatedPanel.locate("reset"), "Reset", separatedPanel.slidingPanel.panelId);
    };

    fluid.tests.prefs.afterShowFunc1 = function (separatedPanel) {
        return function () {
            fluid.tests.prefs.applierRequestChanges(separatedPanel.prefsEditor, fluid.tests.prefs.bwSkin);
            var enhancerModel = fluid.tests.prefs.getPageEnhancer(separatedPanel).model;
            fluid.tests.prefs.checkModelSelections("enhancerModel from bwSkin", fluid.tests.prefs.bwSkin.preferences, enhancerModel);
            jqUnit.assertEquals("Reset button is visible", true, $(".flc-prefsEditor-reset").is(":visible"));

            fluid.tests.prefs.assertAria(separatedPanel.slidingPanel, "true");
            fluid.tests.prefs.assertAriaForButton(separatedPanel.locate("reset"), "Reset", separatedPanel.slidingPanel.panelId, "true");
        };
    };

    fluid.tests.prefs.afterHideFunc1 = function () {
        return function () {
            var settingsStore = fluid.tests.prefs.fetchGlobalSettingsStore();
            var expected = $.extend(true, {}, fluid.tests.prefs.panelState, fluid.tests.prefs.bwSkin);
            jqUnit.assertEquals("Reset button is invisible", false, $(".flc-prefsEditor-reset").is(":visible"));
            jqUnit.assertDeepEq("Only the changed preferences are saved", expected, settingsStore.get());
        };
    };
    fluid.tests.prefs.afterShowFunc2 = function (separatedPanel) {
        return function () {
            var enhancerModel = fluid.tests.prefs.getPageEnhancer(separatedPanel).model;
            var iframeEnhancerModel = separatedPanel.iframeRenderer.iframeEnhancer.model;

            fluid.tests.prefs.checkModelSelections("iframeEnhancerModel from bwSkin", fluid.tests.prefs.bwSkin.preferences, iframeEnhancerModel);
            fluid.tests.prefs.checkModelSelections("iframeEnhancerModel from enhancerModel", enhancerModel, iframeEnhancerModel);
        };
    };

    fluid.tests.prefs.afterShowFunc3 = function (separatedPanel) {
        return function () {
            separatedPanel.locate("reset").click();

            var initialModel = separatedPanel.initialModel;
            var enhancerModel = fluid.tests.prefs.getPageEnhancer(separatedPanel).model;
            var iframeEnhancerModel = separatedPanel.iframeRenderer.iframeEnhancer.model;

            fluid.tests.prefs.checkModelSelections("enhancerModel from defaults", initialModel.preferences, enhancerModel);
            separatedPanel.slidingPanel.hidePanel();
            fluid.tests.prefs.checkModelSelections("iframeEnhancerModel from defaults", initialModel.preferences, iframeEnhancerModel);
            fluid.tests.prefs.checkModelSelections("enhancerModel from iframeEnhancerModel", enhancerModel, iframeEnhancerModel);
        };
    };

    fluid.defaults("fluid.tests.prefs.separatedPanelIntegrationTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Separated panel integration tests",
            tests: [{
                expect: 37,
                name: "Separated panel integration tests",
                sequence: [{
                    listener: "fluid.tests.prefs.testSeparatedPanel",
                    event: "{separatedPanelIntegration separatedPanel}.events.onReady"
                }, {
                    func: "{separatedPanel}.slidingPanel.hidePanel"
                }, {
                    func: "{separatedPanel}.slidingPanel.showPanel"
                }, {
                    listenerMaker: "fluid.tests.prefs.afterShowFunc1",
                    makerArgs: ["{separatedPanel}"],
                    event: "{separatedPanel}.slidingPanel.events.afterPanelShow"
                }, {
                    func: "{separatedPanel}.slidingPanel.hidePanel"
                }, {
                    listenerMaker: "fluid.tests.prefs.afterHideFunc1",
                    makerArgs: ["{separatedPanel}"],
                    event: "{separatedPanel}.slidingPanel.events.afterPanelHide"
                }, {
                    func: "{separatedPanel}.slidingPanel.showPanel"
                }, {
                    listenerMaker: "fluid.tests.prefs.afterShowFunc2",
                    makerArgs: ["{separatedPanel}"],
                    event: "{separatedPanel}.slidingPanel.events.afterPanelShow"
                }, {
                    func: "{separatedPanel}.slidingPanel.hidePanel"
                }, {
                    func: "{separatedPanel}.slidingPanel.showPanel"
                }, {
                    listenerMaker: "fluid.tests.prefs.afterShowFunc3",
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

    fluid.defaults("fluid.tests.prefs.separatedPanelMungingIntegration", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            separatedPanel: {
                type: "fluid.prefs.separatedPanel",
                container: ".flc-prefsEditor-separatedPanel",
                createOnEvent: "{mungingIntegrationTester}.events.onTestCaseStart",
                options: {
                    gradeNames: ["fluid.tests.prefs.mungingIntegrationBase"],
                    iframeRenderer: {
                        markupProps: {
                            src: "./SeparatedPanelPrefsEditorFrame.html"
                        }
                    },
                    slidingPanel: {
                        listeners: {
                            onPanelShow: function () {
                                isSlidingPanelShown = true;
                            }
                        }
                    },
                    iframe: expectedIframeSelector,
                    prefsEditor: {
                        members: {
                            initialModel: {
                                preferences: {
                                    theme: "yb"
                                }
                            }
                        }
                    }
                }
            },
            mungingIntegrationTester: {
                type: "fluid.tests.prefs.mungingIntegrationTester"
            }
        }
    });

    fluid.tests.prefs.testEnhancerTransit = function testEnhancerTransit(separatedPanel, expectedIframeSelector) {
        var cMap = fluid.tests.prefs.enhancerOptions.uiEnhancer.classnameMap;
        var pageEnhancer = fluid.tests.prefs.getPageEnhancer(separatedPanel);

        // "outerEnhancerOptions" option mapping
        jqUnit.assertEquals("classnameMap transferred to outer UIEnhancer", cMap.textFont["default"],
             pageEnhancer.options.classnameMap.textFont["default"]);
        jqUnit.assertEquals("classnameMap transferred to inner UIEnhancer", cMap.textFont["default"],
             separatedPanel.iframeRenderer.iframeEnhancer.options.classnameMap.textFont["default"]);

        // "slidingPanel" option mapping
        jqUnit.assertFalse("Preferences EditorPanel is hidden", isSlidingPanelShown);
        separatedPanel.slidingPanel.locate("toggleButton").click();
        jqUnit.assertTrue("Preferences EditorPanel is shown", isSlidingPanelShown);

        // "iframe" option mapping
        jqUnit.assertEquals("Iframe selector is transferred in", expectedIframeSelector, separatedPanel.options.selectors.iframe);
    };

    fluid.defaults("fluid.tests.prefs.mungingIntegrationTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
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
                    func: "fluid.tests.prefs.testEnhancerTransit",
                    args: ["{separatedPanel}", "{that}.options.expectedIframeSelector"]
                }]
            }]
        }]
    });

    /*******************************************************************************
     * PrefsEditor separatedPanel conditional panel integration tests
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.separatedPanelConditionalPanelIntegration", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            prefsEditor: {
                type: "fluid.tests.composite.separatedPanel.prefsEditor",
                container: ".flc-prefsEditor-separatedPanel",
                createOnEvent: "{prefsTester}.events.onTestCaseStart"
            },
            prefsTester: {
                type: "fluid.tests.prefs.separatedPanelConditionalPanelIntegrationTester"
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.separatedPanelConditionalPanelIntegrationTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Prefs editor with composite panel",
            tests: [{
                name: "Rendering",
                expect: 14,
                sequence: [{
                    listener: "fluid.tests.prefs.separatedPanelConditionalPanelIntegrationTester.assertConditionalComponents",
                    event: "{separatedPanelConditionalPanelIntegration prefsEditorLoader prefsEditor}.events.onReady",
                    args: [
                        "{prefsEditor}.prefsEditorLoader.prefsEditor.increasing.fluid_tests_composite_pref_increaseSize",
                        ["fluid_tests_composite_pref_lineSpace", "fluid_tests_composite_pref_magnification"],
                        false
                    ]
                }, {
                    func: "{prefsEditor}.prefsEditorLoader.slidingPanel.showPanel"
                }, {
                    func: "{prefsEditor}.prefsEditorLoader.prefsEditor.applier.change",
                    args: ["preferences.fluid_tests_composite_pref_increaseSize", true]
                }, {
                    listener: "fluid.tests.prefs.separatedPanelConditionalPanelIntegrationTester.assertConditionalComponents",
                    event: "{prefsEditor}.prefsEditorLoader.prefsEditor.increasing.events.afterRender",
                    args: ["{arguments}.0", ["fluid_tests_composite_pref_lineSpace", "fluid_tests_composite_pref_magnification"], true],
                    priority: "last"
                }, {
                    func: "{prefsEditor}.prefsEditorLoader.prefsEditor.applier.change",
                    args: ["preferences.fluid_tests_composite_pref_increaseSize", false]
                }, {
                    listener: "fluid.tests.prefs.separatedPanelConditionalPanelIntegrationTester.assertConditionalComponents",
                    event: "{prefsEditor}.prefsEditorLoader.prefsEditor.increasing.events.afterRender",
                    args: ["{arguments}.0", ["fluid_tests_composite_pref_lineSpace", "fluid_tests_composite_pref_magnification"], false],
                    priority: "last"
                }]
            }]
        }]
    });

    fluid.tests.prefs.separatedPanelConditionalPanelIntegrationTester.assertConditionalComponents = function (parentPanel, memberNames, instantiated) {
        if (instantiated) {
            fluid.each(memberNames, function (memberName) {
                var comp = parentPanel[memberName];
                jqUnit.assertNotUndefined("The " + memberName + " should be instantiated", comp);
                jqUnit.assertEquals("The context for " + memberName + " should be retained", comp.origContext.URL, comp.container[0].ownerDocument.URL);
                jqUnit.assertNodeExists("The container for " + memberName + " should exist", comp.container);
                jqUnit.assertNodeExists("The input for " + memberName + " should exist", comp.locate("bool"));
                jqUnit.assertEquals("The " + memberName + " should be rendered", comp.model.value, comp.locate("bool").prop("checked"));
            });
        } else {
            fluid.each(memberNames, function (memberName) {
                jqUnit.assertUndefined("The " + memberName + " should not be instantiated", parentPanel[memberName]);
            });
        }
    };

    /*******************************************************************************
     * PrefsEditor separatedPanel lazy load integration tests
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.separatedPanelLazyLoadIntegration", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            prefsEditor: {
                type: "fluid.tests.composite.separatedPanel.lazyLoad.prefsEditor",
                container: ".flc-prefsEditor-separatedPanel",
                createOnEvent: "{prefsTester}.events.onTestCaseStart"
            },
            prefsTester: {
                type: "fluid.tests.prefs.separatedPanelLazyLoadIntegrationTester"
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.separatedPanelLazyLoadIntegrationTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Lazy Loaded Prefs Editor",
            tests: [{
                name: "Initialization",
                expect: 6,
                sequence: [{
                    listener: "fluid.tests.prefs.separatedPanelLazyLoadIntegrationTester.assertPreload",
                    event: "{separatedPanelLazyLoadIntegration prefsEditorLoader slidingPanel}.events.onCreate",
                    args: ["{prefsEditor}.prefsEditorLoader"],
                    priority: "last:testing"
                }, {
                    func: "{prefsEditor}.prefsEditorLoader.slidingPanel.showPanel"
                }, {
                    listener: "fluid.tests.prefs.separatedPanelLazyLoadIntegrationTester.assertLazyLoad",
                    event: "{separatedPanelLazyLoadIntegration}.prefsEditor.prefsEditorLoader.slidingPanel.events.afterPanelShow",
                    args: ["{prefsEditor}.prefsEditorLoader"],
                    priority: "last:testing"
                }]
            }]
        }]
    });

    fluid.tests.prefs.separatedPanelLazyLoadIntegrationTester.assertPreload = function (prefsEditorLoader) {
        jqUnit.assertUndefined("The prefsEditor should not have been instantiated", prefsEditorLoader.prefsEditor);
        jqUnit.assertUndefined("The templateLoader should not have been instantiated", prefsEditorLoader.templateLoader);

        var expectedPreloadedResources = fluid.makeArray(prefsEditorLoader.messageLoader.options.preloadResources);
        var actualPreloadedResources = fluid.keys(prefsEditorLoader.messageLoader.resources);
        jqUnit.assertDeepEq("Only the preloaded resources should have loaded", expectedPreloadedResources, actualPreloadedResources);
    };

    fluid.tests.prefs.separatedPanelLazyLoadIntegrationTester.assertLazyLoad = function (prefsEditorLoader) {
        jqUnit.assertNotUndefined("The prefsEditor should have been instantiated", prefsEditorLoader.prefsEditor);
        jqUnit.assertNotUndefined("The templateLoader should have been instantiated", prefsEditorLoader.templateLoader);

        var expectedResources = fluid.keys(prefsEditorLoader.messageLoader.options.resources);
        var actualResources = fluid.keys(prefsEditorLoader.messageLoader.resources);
        jqUnit.assertDeepEq("All of the resources should have loaded", expectedResources, actualResources);
    };

    $(document).ready(function () {

        fluid.tests.prefs.globalSettingsStore();
        fluid.pageEnhancer(fluid.tests.prefs.enhancerOptions);

        fluid.test.runTests([
            "fluid.tests.prefs.separatedPanelIntegration",
            "fluid.tests.prefs.separatedPanelMungingIntegration",
            "fluid.tests.prefs.separatedPanelConditionalPanelIntegration",
            "fluid.tests.prefs.separatedPanelLazyLoadIntegration"
        ]);
    });

})(jQuery);
