/*
Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

(function ($) {

    "use strict";

    fluid.registerNamespace("fluid.tests.overviewPanel");

    fluid.tests.overviewPanel.resources = {
        template: {
            href: "../../../../components/overviewPanel/html/overviewPanelTemplate.html"
        }
    };

    fluid.tests.overviewPanel.strings = {
        titleBegin: "aaa",
        titleLinkText: "bbb",
        titleEnd: "ccc",
        componentName: "ddd",
        instructionsHeading: "fff",
        codeLinkText: "ggg",
        apiLinkText: "hhh",
        designLinkText: "iii",
        feedbackText: "jjj",
        feedbackLinkText: "lll",
        closeText: "mmm"
    };

    fluid.tests.overviewPanel.markup = {
        description: "aaa<span>bbb</span>",
        instructions: "ccc<span>ddd</span>"
    };

    fluid.tests.overviewPanel.links = {
        codeLink: "#aaa",
        apiLink: "#bbb",
        designLink: "#ccc",
        feedbackLink: "#ddd",
        titleLink: "#eee"
    };

    fluid.tests.overviewPanel.assertModelAndStylesForClosedPanel = function (that) {
        jqUnit.assertFalse("Check that model.showPanel is false", that.model.showPanel);
        jqUnit.assertTrue("Check that container has hidden style", that.container.hasClass(that.options.styles.hidden));
    };

    fluid.tests.overviewPanel.assertAriaForClosedPanel = function (that) {
        jqUnit.assertEquals("Check that toggleControl aria-pressed is true",
            "true", that.locate("toggleControl").attr("aria-pressed"));
        jqUnit.assertEquals("Check that toggleControl aria-expanded is false",
            "false", that.locate("toggleControl").attr("aria-expanded"));
        jqUnit.assertEquals("Check that closeControl aria-expanded is false",
            "false", that.locate("closeControl").attr("aria-expanded"));
        jqUnit.assertEquals("Check toggleControl aria-label",
            that.options.strings.openPanelLabel, that.locate("toggleControl").attr("aria-label"));
        jqUnit.assertEquals("Check closeControl aria-label",
            that.options.strings.closePanelLabel, that.locate("closeControl").attr("aria-label"));
    };

    fluid.tests.overviewPanel.assertPanelIsClosed = function (that) {
        fluid.tests.overviewPanel.assertModelAndStylesForClosedPanel(that);
        fluid.tests.overviewPanel.assertAriaForClosedPanel(that);
    };

    fluid.tests.overviewPanel.assertPanelIsOpen = function (that) {
        jqUnit.assertTrue("Check that model.showPanel is true", that.model.showPanel);
        jqUnit.assertFalse("Check that container does not have hidden style",
            that.container.hasClass(that.options.styles.hidden));
        jqUnit.assertEquals("Check that toggleControl aria-pressed is false",
            "false", that.locate("toggleControl").attr("aria-pressed"));
        jqUnit.assertEquals("Check that toggleControl aria-expanded is true",
            "true", that.locate("toggleControl").attr("aria-expanded"));
        jqUnit.assertEquals("Check that closeControl aria-expanded is true",
            "true", that.locate("closeControl").attr("aria-expanded"));
        jqUnit.assertEquals("Check toggleControl aria-label",
            that.options.strings.closePanelLabel, that.locate("toggleControl").attr("aria-label"));
        jqUnit.assertEquals("Check closeControl aria-label",
            that.options.strings.closePanelLabel, that.locate("closeControl").attr("aria-label"));
    };

    fluid.tests.overviewPanel.verifyRendering = function (that, strings, markup, links) {
        // check strings
        fluid.each(strings, function (value, key) {
            jqUnit.assertEquals("Check string with selector '" + key + "'", value, that.locate(key).text());
        });

        // check markup
        jqUnit.assertEquals("Check markup with selector 'description'", markup.description, that.locate("description").html());
        jqUnit.assertEquals("Check markup with selector 'instructions'", markup.instructions, that.locate("instructions").html());

        // check links
        jqUnit.assertEquals("Check link for selector 'codeLink'", links.codeLink, that.locate("codeLink").attr("href"));
        jqUnit.assertEquals("Check link for selector 'apiLink'", links.apiLink, that.locate("apiLink").attr("href"));
        jqUnit.assertEquals("Check link for selector 'designLink'", links.designLink, that.locate("designLink").attr("href"));
        jqUnit.assertEquals("Check link for selector 'feedbackLink'", links.feedbackLink, that.locate("feedbackLink").attr("href"));
        jqUnit.assertEquals("Check link for selector 'titleLink'", links.titleLink, that.locate("titleLink").attr("href"));

        // check aria-controls
        var containerId = that.container.attr("id");
        jqUnit.assertEquals("Check aria-controls on toggleControl (" + containerId + ")",
            containerId, that.locate("toggleControl").attr("aria-controls"));
        jqUnit.assertEquals("Check aria-controls on closeControl (" + containerId + ")",
            containerId, that.locate("closeControl").attr("aria-controls"));

        jqUnit.start();
    };

    $(document).ready(function () {

        jqUnit.module("OverviewPanel Tests");

        jqUnit.asyncTest("Verify Rendering", function () {
            jqUnit.expect(20);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: fluid.tests.overviewPanel.resources,
                listeners: {
                    "afterRender": {
                        "listener": fluid.tests.overviewPanel.verifyRendering,
                        "args": ["{that}", fluid.tests.overviewPanel.strings, fluid.tests.overviewPanel.markup, fluid.tests.overviewPanel.links],
                        "priority": "last"
                    }
                },
                strings: fluid.tests.overviewPanel.strings,
                markup: fluid.tests.overviewPanel.markup,
                links: fluid.tests.overviewPanel.links
            });
        });


        var verifyAtOnCreateWhenInitiallyHidden = function (that) {
            fluid.tests.overviewPanel.assertModelAndStylesForClosedPanel(that);
        };

        var verifyAtAfterRenderWhenInitiallyHidden = function (that) {
            fluid.tests.overviewPanel.assertAriaForClosedPanel(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify when initially hidden", function () {
            jqUnit.expect(7);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: fluid.tests.overviewPanel.resources,
                listeners: {
                    "onCreate": {
                        "listener": verifyAtOnCreateWhenInitiallyHidden,
                        "priority": "last"
                    },
                    "afterRender": {
                        "listener": verifyAtAfterRenderWhenInitiallyHidden,
                        "priority": "last"
                    }
                },
                model: {
                    showPanel: false
                }
            });
        });

        var verifyWhenInitiallyVisible = function (that) {
            // check that the panel is open at the point of afterRender
            fluid.tests.overviewPanel.assertPanelIsOpen(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify when initially visible", function () {
            jqUnit.expect(7);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: fluid.tests.overviewPanel.resources,
                listeners: {
                    "afterRender": {
                        "listener": verifyWhenInitiallyVisible,
                        "priority": "last"
                    }
                },
                model: {
                    showPanel: true
                }
            });
        });

        var verifyCloseControl = function (that) {
            fluid.tests.overviewPanel.assertPanelIsOpen(that);
            that.locate("closeControl").click();
            fluid.tests.overviewPanel.assertPanelIsClosed(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify close control", function () {
            jqUnit.expect(14);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: fluid.tests.overviewPanel.resources,
                listeners: {
                    "afterRender": {
                        "listener": verifyCloseControl,
                        "priority": "last"
                    }
                },
                model: {
                    showPanel: true
                }
            });
        });

        var verifyClosePanelInvoker = function (that) {
            fluid.tests.overviewPanel.assertPanelIsOpen(that);
            that.closePanel();
            fluid.tests.overviewPanel.assertPanelIsClosed(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify closePanel invoker", function () {
            jqUnit.expect(14);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: fluid.tests.overviewPanel.resources,
                listeners: {
                    "afterRender": {
                        "listener": verifyClosePanelInvoker,
                        "priority": "last"
                    }
                },
                model: {
                    showPanel: true
                }
            });
        });

        var verifyToggleControl = function (that) {
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

        jqUnit.asyncTest("Verify toggle control", function () {
            jqUnit.expect(35);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: fluid.tests.overviewPanel.resources,
                listeners: {
                    "afterRender": {
                        "listener": verifyToggleControl,
                        "priority": "last"
                    }
                },
                model: {
                    showPanel: true
                }
            });
        });

        var verifyTogglePanelInvoker = function (that) {
            fluid.tests.overviewPanel.assertPanelIsOpen(that);
            that.togglePanel();
            fluid.tests.overviewPanel.assertPanelIsClosed(that);
            that.togglePanel();
            fluid.tests.overviewPanel.assertPanelIsOpen(that);
            that.closePanel();
            fluid.tests.overviewPanel.assertPanelIsClosed(that);
            that.togglePanel();
            fluid.tests.overviewPanel.assertPanelIsOpen(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify togglePanel invoker", function () {
            jqUnit.expect(35);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: fluid.tests.overviewPanel.resources,
                listeners: {
                    "afterRender": {
                        "listener": verifyTogglePanelInvoker,
                        "priority": "last"
                    }
                },
                model: {
                    showPanel: true
                }
            });
        });

    });
})(jQuery);
