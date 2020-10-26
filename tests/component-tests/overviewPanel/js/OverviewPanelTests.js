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

/* global fluid, jqUnit */

(function ($) {

    "use strict";

    fluid.registerNamespace("fluid.tests.overviewPanel");

    fluid.tests.overviewPanel.resources = {
        template: {
            url: "../../../../src/components/overviewPanel/html/overviewPanelTemplate.html"
        }
    };

    fluid.tests.overviewPanel.strings = {
        titleBegin: "aaa",
        titleLinkText: "bbb",
        titleEnd: "ccc",
        componentName: "ddd",
        instructionsHeading: "fff",
        demoCodeLinkText: "ggg",
        apiLinkText: "hhh",
        designLinkText: "iii",
        feedbackText: "jjj",
        feedbackLinkText: "lll",
        closeText: "mmm",
        infusionCodeLinkText: "nnn"
    };

    fluid.tests.overviewPanel.labels = {
        openPanelLabel: "label_aaa",
        closePanelLabel: "label_bbb"
    };

    fluid.tests.overviewPanel.markup = {
        description: "aaa<span>bbb</span>",
        instructions: "ccc<span>ddd</span>"
    };

    fluid.tests.overviewPanel.links = {
        demoCodeLink: "#aaa",
        apiLink: "#bbb",
        designLink: "#ccc",
        feedbackLink: "#ddd",
        titleLink: "#eee",
        infusionCodeLink: "#fff"
    };

    fluid.tests.overviewPanel.expectedAriaForClosedPanel = [
        {selector: "toggleControl", attr: "aria-pressed", value: "true"},
        {selector: "toggleControl", attr: "aria-expanded", value: "false"},
        {selector: "closeControl", attr: "aria-expanded", value: "false"},
        {selector: "toggleControl", attr: "aria-label", value: fluid.tests.overviewPanel.labels.openPanelLabel},
        {selector: "closeControl", attr: "aria-label", value: fluid.tests.overviewPanel.labels.closePanelLabel}
    ];

    fluid.tests.overviewPanel.expectedAriaForOpenPanel = [
        {selector: "toggleControl", attr: "aria-pressed", value: "false"},
        {selector: "toggleControl", attr: "aria-expanded", value: "true"},
        {selector: "closeControl", attr: "aria-expanded", value: "true"},
        {selector: "toggleControl", attr: "aria-label", value: fluid.tests.overviewPanel.labels.closePanelLabel},
        {selector: "closeControl", attr: "aria-label", value: fluid.tests.overviewPanel.labels.closePanelLabel}
    ];

    fluid.tests.overviewPanel.assertAttributes = function (that, expectedAttributes) {
        fluid.each(expectedAttributes, function (expected) {
            var message = "Check that selector \"" + expected.selector +
                "\" has " + expected.attr + " value \"" + expected.value + "\"";
            jqUnit.assertEquals(message, expected.value,
                that.locate(expected.selector).attr(expected.attr));
        });
    };

    fluid.tests.overviewPanel.assertModelAndStylesForClosedPanel = function (that) {
        jqUnit.assertFalse("Check that model.showPanel is false", that.model.showPanel);
        jqUnit.assertTrue("Check that container has hidden style", that.container.hasClass(that.options.styles.hidden));
    };

    fluid.tests.overviewPanel.assertAriaForClosedPanel = function (that) {
        fluid.tests.overviewPanel.assertAttributes(that, fluid.tests.overviewPanel.expectedAriaForClosedPanel);
    };

    fluid.tests.overviewPanel.assertPanelIsClosed = function (that) {
        fluid.tests.overviewPanel.assertModelAndStylesForClosedPanel(that);
        fluid.tests.overviewPanel.assertAriaForClosedPanel(that);
    };

    fluid.tests.overviewPanel.assertPanelIsOpen = function (that) {
        jqUnit.assertTrue("Check that model.showPanel is true", that.model.showPanel);
        jqUnit.assertFalse("Check that container does not have hidden style",
            that.container.hasClass(that.options.styles.hidden));
        fluid.tests.overviewPanel.assertAttributes(that, fluid.tests.overviewPanel.expectedAriaForOpenPanel);
    };

    fluid.tests.overviewPanel.verifyRenderingListener = function (that, strings, markup, links) {
        // check strings
        fluid.each(strings, function (value, key) {
            jqUnit.assertEquals("Check string with selector '" + key + "'", value, that.locate(key).text());
        });

        // check markup
        jqUnit.assertEquals("Check markup with selector 'description'",
            markup.description, that.locate("description").html().replace(/SPAN/g, "span"));
        jqUnit.assertEquals("Check markup with selector 'instructions'",
            markup.instructions, that.locate("instructions").html().replace(/SPAN/g, "span"));

        // check links
        jqUnit.assertEquals("Check link for selector 'demoCodeLink'", links.demoCodeLink, that.locate("demoCodeLink").attr("href"));
        jqUnit.assertEquals("Check link for selector 'apiLink'", links.apiLink, that.locate("apiLink").attr("href"));
        jqUnit.assertEquals("Check link for selector 'designLink'", links.designLink, that.locate("designLink").attr("href"));
        jqUnit.assertEquals("Check link for selector 'feedbackLink'", links.feedbackLink, that.locate("feedbackLink").attr("href"));
        jqUnit.assertEquals("Check link for selector 'titleLink'", links.titleLink, that.locate("titleLink").attr("href"));
        jqUnit.assertEquals("Check link for selector 'infusionCodeLink'", links.infusionCodeLink, that.locate("infusionCodeLink").attr("href"));


        // check aria-controls
        var containerId = that.container.attr("id");
        jqUnit.assertEquals("Check aria-controls on toggleControl (" + containerId + ")",
            containerId, that.locate("toggleControl").attr("aria-controls"));
        jqUnit.assertEquals("Check aria-controls on closeControl (" + containerId + ")",
            containerId, that.locate("closeControl").attr("aria-controls"));

        jqUnit.start();
    };

    fluid.tests.overviewPanel.verifyAtOnCreateWhenInitiallyHidden = function (that) {
        fluid.tests.overviewPanel.assertModelAndStylesForClosedPanel(that);
    };

    fluid.tests.overviewPanel.verifyAtAfterRenderWhenInitiallyHidden = function (that) {
        fluid.tests.overviewPanel.assertAriaForClosedPanel(that);
        jqUnit.start();
    };

    fluid.tests.overviewPanel.verifyWhenInitiallyVisibleListener = function (that) {
        // check that the panel is open at the point of afterRender
        fluid.tests.overviewPanel.assertPanelIsOpen(that);
        jqUnit.start();
    };

    fluid.tests.overviewPanel.verifyCloseControlListener = function (that) {
        fluid.tests.overviewPanel.assertPanelIsOpen(that);
        that.locate("closeControl").click();
        fluid.tests.overviewPanel.assertPanelIsClosed(that);
        that.locate("closeControl").click();
        fluid.tests.overviewPanel.assertPanelIsClosed(that);
        jqUnit.start();
    };

    fluid.tests.overviewPanel.verifyToggleControlListener = function (that) {
        fluid.tests.overviewPanel.assertPanelIsOpen(that);
        that.locate("toggleControl").click();
        fluid.tests.overviewPanel.assertPanelIsClosed(that);
        that.locate("toggleControl").click();
        fluid.tests.overviewPanel.assertPanelIsOpen(that);
        that.locate("closeControl").click();
        fluid.tests.overviewPanel.assertPanelIsClosed(that);
        that.locate("toggleControl").click();
        fluid.tests.overviewPanel.assertPanelIsOpen(that);
        jqUnit.start();
    };

    fluid.defaults("fluid.tests.overviewPanel.verifyRendering", {
        gradeNames: ["fluid.overviewPanel"],
        resources: fluid.tests.overviewPanel.resources,
        listeners: {
            "afterRender": {
                "listener": fluid.tests.overviewPanel.verifyRenderingListener,
                "args": ["{that}", fluid.tests.overviewPanel.strings, fluid.tests.overviewPanel.markup, fluid.tests.overviewPanel.links],
                "priority": "last"
            }
        },
        strings: fluid.tests.overviewPanel.strings,
        markup: fluid.tests.overviewPanel.markup,
        links: fluid.tests.overviewPanel.links
    });

    fluid.defaults("fluid.tests.overviewPanel.verifyWhenInitiallyHidden", {
        gradeNames: ["fluid.overviewPanel"],
        resources: fluid.tests.overviewPanel.resources,
        listeners: {
            "onCreate": {
                "listener": fluid.tests.overviewPanel.verifyAtOnCreateWhenInitiallyHidden,
                "priority": "last"
            },
            "afterRender": {
                "listener": fluid.tests.overviewPanel.verifyAtAfterRenderWhenInitiallyHidden,
                "priority": "last"
            }
        },
        model: {
            showPanel: false
        },
        strings: fluid.tests.overviewPanel.labels
    });

    fluid.defaults("fluid.tests.overviewPanel.verifyWhenInitiallyVisible", {
        gradeNames: ["fluid.overviewPanel"],
        resources: fluid.tests.overviewPanel.resources,
        listeners: {
            "afterRender": {
                "listener": fluid.tests.overviewPanel.verifyWhenInitiallyVisibleListener,
                "priority": "last"
            }
        },
        model: {
            showPanel: true
        },
        strings: fluid.tests.overviewPanel.labels
    });

    fluid.defaults("fluid.tests.overviewPanel.verifyCloseControl", {
        gradeNames: ["fluid.overviewPanel"],
        resources: fluid.tests.overviewPanel.resources,
        listeners: {
            "afterRender": {
                "listener": fluid.tests.overviewPanel.verifyCloseControlListener,
                "priority": "last"
            }
        },
        model: {
            showPanel: true
        },
        strings: fluid.tests.overviewPanel.labels
    });

    fluid.defaults("fluid.tests.overviewPanel.verifyToggleControl", {
        gradeNames: ["fluid.overviewPanel"],
        resources: fluid.tests.overviewPanel.resources,
        listeners: {
            "afterRender": {
                "listener": fluid.tests.overviewPanel.verifyToggleControlListener,
                "priority": "last"
            }
        },
        model: {
            showPanel: true
        },
        strings: fluid.tests.overviewPanel.labels
    });

    $(document).ready(function () {

        jqUnit.module("OverviewPanel Tests");

        jqUnit.asyncTest("Verify Rendering", function () {
            jqUnit.expect(22);
            fluid.tests.overviewPanel.verifyRendering(".flc-overviewPanel");
        });

        jqUnit.asyncTest("Verify when initially hidden", function () {
            jqUnit.expect(7);
            fluid.tests.overviewPanel.verifyWhenInitiallyHidden(".flc-overviewPanel");
        });

        jqUnit.asyncTest("Verify when initially visible", function () {
            jqUnit.expect(7);
            fluid.tests.overviewPanel.verifyWhenInitiallyVisible(".flc-overviewPanel");
        });

        jqUnit.asyncTest("Verify close control", function () {
            jqUnit.expect(21);
            fluid.tests.overviewPanel.verifyCloseControl(".flc-overviewPanel");
        });

        jqUnit.asyncTest("Verify toggle control", function () {
            jqUnit.expect(35);
            fluid.tests.overviewPanel.verifyToggleControl(".flc-overviewPanel");
        });

    });
})(jQuery);
