/*
Copyright 2017 OCAD University

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
     * PrefsEditor separatedPanel responsive tests
     *******************************************************************************/

    fluid.defaults("fluid.tests.separatedPanel", {
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

    fluid.tests.separatedPanel.assignSeparatedPanelContainer = function () {
        return $(".flc-prefsEditor-separatedPanel", $("iframe")[0].contentWindow.document);
    };

    fluid.defaults("fluid.tests.separatedPanelResponsive", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            separatedPanel: {
                type: "fluid.tests.separatedPanel",
                container: {
                    expander: {
                        funcName: "fluid.tests.separatedPanel.assignSeparatedPanelContainer"
                    }
                },
                createOnEvent: "{separatedPanelResponsiveTester}.events.onTestCaseStart"
            },
            separatedPanelResponsiveTester: {
                type: "fluid.tests.separatedPanelResponsiveTester"
            }
        }
    });

    fluid.tests.assertAriaForButton = function (button, buttonName, controlsId) {
        jqUnit.assertEquals(buttonName + " button has the button role", "button", button.attr("role"));
        jqUnit.assertEquals(buttonName + " button has correct aria-controls", controlsId, button.attr("aria-controls"));
    };

    fluid.tests.assertAriaForToggleButton = function (button, buttonName, controlsId, state) {
        fluid.tests.assertAriaForButton(button, buttonName, controlsId);
        jqUnit.assertEquals(buttonName + " button has correct aria-pressed", state, button.attr("aria-pressed"));
    };

    fluid.tests.assertAria = function (that, state) {
        var toggleButton = that.locate("toggleButton");
        var panel = that.locate("panel");
        var panelId = panel.attr("id");

        fluid.tests.assertAriaForToggleButton(toggleButton, "Hide/show", panelId, state);
        jqUnit.assertEquals("Panel has the group role", "group", panel.attr("role"));
        jqUnit.assertEquals("Panel has the correct aria-label", that.options.strings.panelLabel, panel.attr("aria-label"));
        jqUnit.assertEquals("Panel has correct aria-expanded", state, panel.attr("aria-expanded"));
    };

    fluid.tests.testSeparatedPanel = function (separatedPanel) {
        jqUnit.assertEquals("IFrame is invisible and keyboard inaccessible", false, separatedPanel.iframeRenderer.iframe.is(":visible"));
        fluid.tests.prefs.assertPresent(separatedPanel, fluid.tests.prefs.expectedSeparatedPanel);

        var prefsEditor = separatedPanel.prefsEditor;
        jqUnit.assertEquals("Reset button is invisible", false, $(".flc-prefsEditor-reset").is(":visible"));
        fluid.tests.prefs.assertPresent(prefsEditor, fluid.tests.prefs.expectedComponents["fluid.prefs.separatedPanel"]);

        fluid.tests.assertAria(separatedPanel.slidingPanel, "false");
        fluid.tests.assertAriaForButton(separatedPanel.locate("reset"), "Reset", separatedPanel.slidingPanel.panelId);
    };

    fluid.defaults("fluid.tests.separatedPanelResponsiveTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Separated panel integration tests",
            tests: [{
                // expect: 37,
                name: "Separated panel integration tests",
                sequence: [{
                    listener: "fluid.tests.testSeparatedPanel",
                    event: "{separatedPanelResponsive separatedPanel}.events.onReady"
                }, {
                    func: "{separatedPanel}.slidingPanel.showPanel"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        var iframe = $("iframe");

        iframe.on("load", function () {
            fluid.tests.prefs.globalSettingsStore();
            fluid.pageEnhancer(fluid.tests.prefs.enhancerOptions);

            fluid.test.runTests([
                "fluid.tests.separatedPanelResponsive"
            ]);
        });

        iframe.css({width: "639px"}); // set to the largest mobile screen size
        // injecting the iframe source so that we can ensure the iframe on load event
        // is fired after the listener is bound.
        iframe.attr("src", "SeparatedPanelPrefsEditorResponsiveTestPage.html");
    });

})(jQuery);
