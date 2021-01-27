/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global jqUnit */


(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests.prefs.responsive");

    /******************
     * Setup sequence *
     ******************/

    fluid.defaults("fluid.tests.prefs.responsive.iframeSetup", {
        gradeNames: "fluid.test.sequenceElement",
        events: {
            iframeLoaded: null
        },
        iframe: ".flc-iframeSetup",
        sequence: [{
            func: "fluid.tests.prefs.responsive.iframeSetup.load",
            args: ["{that}"]
        }]
    });

    fluid.tests.prefs.responsive.iframeSetup.load = function (that) {
        var iframe = $(that.options.iframe);

        // remove any old src values
        iframe.removeAttr("src");

        iframe.one("load", function () {
            // the global settings store and pageEnhancer are added
            // as they are required by the prefs editor.
            fluid.tests.prefs.globalSettingsStore();
            fluid.pageEnhancer(fluid.tests.prefs.enhancerOptions);
            that.events.iframeLoaded.fire(that);
        });

        iframe.css({width: "400px", height: "400px"}); // set to a small screen size

        // injecting the iframe source so that we can ensure the iframe on load event
        // is fired after the listener is bound.
        iframe.attr("src", "SeparatedPanelPrefsEditorResponsiveTestPage.html");
    };

    fluid.defaults("fluid.tests.prefs.responsive.iframeSequence", {
        gradeNames: "fluid.test.sequence",
        sequenceElements: {
            setup: {
                gradeNames: "fluid.tests.prefs.responsive.iframeSetup",
                options: {
                    events: {
                        iframeLoaded: "{fluid.test.testCaseHolder}.events.afterSetup"
                    },
                    iframe: "{fluid.test.testCaseHolder}.options.iframe"
                },
                priority: "before:sequence"
            }
        }
    });

    /*******************************************************************************
     * PrefsEditor separatedPanel responsive tests
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.responsive.separatedPanel", {
        gradeNames: ["fluid.prefs.transformDefaultPanelsOptions", "fluid.prefs.initialModel.starter", "fluid.prefs.separatedPanel"],
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
    });

    fluid.tests.prefs.responsive.separatedPanel.assignSeparatedPanelContainer = function () {
        return $(".flc-prefsEditor-separatedPanel", $("iframe")[0].contentWindow.document);
    };

    fluid.defaults("fluid.tests.prefs.responsive.separatedPanelResponsive", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            separatedPanel: {
                type: "fluid.tests.prefs.responsive.separatedPanel",
                container: {
                    expander: {
                        funcName: "fluid.tests.prefs.responsive.separatedPanel.assignSeparatedPanelContainer"
                    }
                },
                createOnEvent: "{separatedPanelResponsiveTester}.events.afterSetup"
            },
            separatedPanelResponsiveTester: {
                type: "fluid.tests.prefs.responsive.separatedPanelResponsiveTester"
            }
        }
    });

    fluid.tests.prefs.responsive.assertAriaForButton = function (button, buttonName, controlsId) {
        jqUnit.assertEquals(buttonName + " button has the button role", "button", button.attr("role"));
        jqUnit.assertEquals(buttonName + " button has correct aria-controls", controlsId, button.attr("aria-controls"));
    };

    fluid.tests.prefs.responsive.assertAriaForToggleButton = function (button, buttonName, controlsId, state) {
        var attrState = state ? "true" : "false";
        fluid.tests.prefs.responsive.assertAriaForButton(button, buttonName, controlsId);
        jqUnit.assertEquals(buttonName + " button has correct aria-pressed", attrState, button.attr("aria-pressed"));
        jqUnit.assertEquals(buttonName + " button has correct aria-expanded", attrState, button.attr("aria-expanded"));
    };

    fluid.tests.prefs.responsive.assertAria = function (that, state) {
        var toggleButton = that.locate("toggleButton");
        var panel = that.locate("panel");
        var panelId = panel.attr("id");

        fluid.tests.prefs.responsive.assertAriaForToggleButton(toggleButton, "Hide/show", panelId, state);
        jqUnit.assertEquals("Panel has the group role", "group", panel.attr("role"));
        jqUnit.assertEquals("Panel has the correct aria-label", that.options.strings.panelLabel, panel.attr("aria-label"));
    };

    fluid.tests.prefs.responsive.assertResetButton = function (separatedPanel, state) {
        separatedPanel.locate("reset").each(function (idx, elm) {
            elm = $(elm);
            var smallScreenContainer = elm.parents(".fl-panelBar-smallScreen");

            if (smallScreenContainer.length > 0) {
                jqUnit.assertEquals("The small screen Reset button visibility should be " + state, state, elm.is(":visible"));
                fluid.tests.prefs.responsive.assertAriaForButton(elm, "The small screen Reset", separatedPanel.slidingPanel.panelId);
            } else {
                jqUnit.assertEquals("The wide screen Reset button visibility should be false", false, elm.is(":visible"));
                fluid.tests.prefs.responsive.assertAriaForButton(elm, "The wide screen Reset", separatedPanel.slidingPanel.panelId);
            }
        });
    };

    fluid.tests.prefs.responsive.assertSeparatedPanelState = function (separatedPanel, state) {
        jqUnit.assertEquals("The iframe visibility should be " + state, state, separatedPanel.iframeRenderer.iframe.is(":visible"));
        fluid.tests.prefs.responsive.assertResetButton(separatedPanel, state);
        fluid.tests.prefs.responsive.assertAria(separatedPanel.slidingPanel, state);
    };

    fluid.tests.prefs.responsive.assertSeparatedPanelInit = function (separatedPanel, expectedPanelIndex) {
        var prefsEditor = separatedPanel.prefsEditor;
        jqUnit.assertEquals("The panelIndex should be " + expectedPanelIndex, expectedPanelIndex, prefsEditor.model.panelIndex);
        jqUnit.assertEquals("The panelMaxIndex should be 5", 5, prefsEditor.model.panelMaxIndex);
        fluid.tests.prefs.responsive.assertSeparatedPanelState(separatedPanel, false);
        fluid.tests.prefs.assertPresent(separatedPanel, fluid.tests.prefs.expectedSeparatedPanel);
        fluid.tests.prefs.assertPresent(prefsEditor, fluid.tests.prefs.expectedComponents["fluid.prefs.separatedPanel"]);
    };

    fluid.tests.prefs.responsive.assertPanelVisibility = function (prefsEditor, testName, panelIndex) {
        var panels = prefsEditor.locate("panels");

        panels.each(function (idx, elm) {
            var panelOffset = $(elm).offset().left;
            if (idx === panelIndex) {
                jqUnit.assertEquals(testName + ": The panel at index " + idx + " should be scrolled into view with offset = 0", 0, panelOffset);
            } else {
                jqUnit.assertNotEquals(testName + ": The panel at index " + idx + " should not be scrolled into view and have an offset greater or less than 0", 0, panelOffset);
            }
        });

        jqUnit.assertEquals("fluid.prefs.arrowScrolling.getClosestPanelIndex should return " + panelIndex, panelIndex, fluid.prefs.arrowScrolling.getClosestPanelIndex(panels));
    };

    fluid.tests.prefs.responsive.clickArrow = function (elm, direction) {
        var keyEvent = $.Event("click");
        keyEvent.offsetX = direction === "RIGHT" ? elm.width() : 0;

        elm.trigger(keyEvent);
    };

    fluid.tests.prefs.responsive.triggerDOMEvent = function (elm, type) {
        var event;
        // In IE 11 Event is an object not a function
        if (typeof Event === "function") {
            event = new Event(type);
        } else {
            event = document.createEvent("Event");
            event.initEvent(type, true, true);
        }
        elm.dispatchEvent(event);
    };

    fluid.defaults("fluid.tests.prefs.responsive.separatedPanelResponsiveTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        events: {
            afterSetup: null
        },
        iframe: ".flc-iframeSetup-responsiveTests",
        modules: [{
            name: "Separated panel integration tests",
            tests: [{
                expect: 77,
                name: "Separated panel integration tests",
                sequenceGrade: "fluid.tests.prefs.responsive.iframeSequence",
                sequence: [{
                    listener: "fluid.tests.prefs.responsive.assertSeparatedPanelInit",
                    event: "{separatedPanelResponsive separatedPanel}.events.onReady",
                    args: ["{separatedPanel}", undefined] // initially there is no panelIndex set
                }, {
                    func: "{separatedPanel}.slidingPanel.showPanel"
                }, {
                    listener: "fluid.tests.prefs.responsive.assertSeparatedPanelState",
                    event: "{separatedPanel}.slidingPanel.events.afterPanelShow",
                    args: ["{separatedPanel}", true]
                }, {
                    func: "fluid.tests.prefs.responsive.assertPanelVisibility",
                    args: ["{separatedPanel}.prefsEditor", "Initial Rendering", 0]
                }, {
                    func: "{separatedPanel}.applier.change",
                    args: ["panelIndex", 2]
                }, {
                    func: "fluid.tests.prefs.responsive.assertPanelVisibility",
                    args: ["{separatedPanel}.prefsEditor", "ScrollToPanel 2", 2]
                }, {
                    func: "fluid.tests.prefs.responsive.clickArrow",
                    args: ["{separatedPanel}.prefsEditor.lineSpace.dom.header", "RIGHT"]
                }, {
                    func: "fluid.tests.prefs.responsive.assertPanelVisibility",
                    args: ["{separatedPanel}.prefsEditor", "Clicked to go to Panel to the Right", 3]
                }, {
                    func: "fluid.tests.prefs.responsive.clickArrow",
                    args: ["{separatedPanel}.prefsEditor.contrast.dom.header", "LEFT"]
                }, {
                    func: "fluid.tests.prefs.responsive.assertPanelVisibility",
                    args: ["{separatedPanel}.prefsEditor", "Clicked to go to Panel to the Left", 2]
                }, {
                    func: "{separatedPanel}.applier.change",
                    args: ["panelIndex", -1]
                }, {
                    func: "fluid.tests.prefs.responsive.assertPanelVisibility",
                    args: ["{separatedPanel}.prefsEditor", "Scrolled to panel below bounds", 0]
                }, {
                    func: "{separatedPanel}.applier.change",
                    args: ["panelIndex", 20]
                }, {
                    func: "fluid.tests.prefs.responsive.assertPanelVisibility",
                    args: ["{separatedPanel}.prefsEditor", "Scrolled to panel beyond bounds", 5]
                }, {
                    func: "fluid.tests.prefs.responsive.triggerDOMEvent",
                    args: [window, "resize"]
                }, {
                    listener: "jqUnit.assert",
                    event: "{separatedPanel}.prefsEditor.events.onSignificantDOMChange",
                    args: ["A window resize event triggered the onSignificantDOMChange event"]
                }, {
                    jQueryTrigger: "scroll",
                    element: "{separatedPanel}.prefsEditor.dom.scrollContainer"
                }, {
                    listener: "jqUnit.assert",
                    event: "{separatedPanel}.prefsEditor.events.onScroll",
                    args: ["A scroll event triggered the onScroll event"]
                }]
            }]
        }]
    });

    fluid.defaults("fluid.tests.prefs.responsive.separatedPanel.initialPanelIndex", {
        gradeNames: ["fluid.tests.prefs.responsive.separatedPanel"],
        model: {
            panelIndex: 2,
            preferences: {}
        }
    });

    fluid.defaults("fluid.tests.prefs.responsive.separatedPanelInitialPanelIndex", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            separatedPanel: {
                type: "fluid.tests.prefs.responsive.separatedPanel.initialPanelIndex",
                container: {
                    expander: {
                        funcName: "fluid.tests.prefs.responsive.separatedPanel.assignSeparatedPanelContainer"
                    }
                },
                createOnEvent: "{separatedPanelInitialPanelIndexTester}.events.afterSetup"
            },
            separatedPanelInitialPanelIndexTester: {
                type: "fluid.tests.prefs.responsive.separatedPanelInitialPanelIndexTester"
            }
        }
    });

    fluid.defaults("fluid.tests.prefs.responsive.separatedPanelInitialPanelIndexTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        events: {
            afterSetup: null
        },
        iframe: ".flc-iframeSetup-panelIndexTests",
        modules: [{
            name: "Separated panel initial panelIndex tester",
            tests: [{
                expect: 40,
                name: "Separated panel initial panelIndex tester",
                sequenceGrade: "fluid.tests.prefs.responsive.iframeSequence",
                sequence: [{
                    listener: "fluid.tests.prefs.responsive.assertSeparatedPanelInit",
                    event: "{separatedPanelInitialPanelIndex separatedPanel}.events.onReady",
                    args: ["{separatedPanel}", 2]
                }, {
                    func: "{separatedPanel}.slidingPanel.showPanel"
                }, {
                    listener: "fluid.tests.prefs.responsive.assertSeparatedPanelState",
                    event: "{separatedPanel}.slidingPanel.events.afterPanelShow",
                    args: ["{separatedPanel}", true],
                    priority: "last:testing"
                }, {
                    func: "fluid.tests.prefs.responsive.assertPanelVisibility",
                    args: ["{separatedPanel}.prefsEditor", "Scrolled to panel 2", 2]
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.prefs.responsive.separatedPanelResponsive",
            "fluid.tests.prefs.responsive.separatedPanelInitialPanelIndex"
        ]);
    });

})(jQuery);
