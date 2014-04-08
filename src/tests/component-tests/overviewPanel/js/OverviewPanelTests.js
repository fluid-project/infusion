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

    $(document).ready(function () {

        jqUnit.module("OverviewPanel Tests");

        var resources = {
            template: {
                href: "../../../../components/overviewPanel/html/overviewPanelTemplate.html"
            }
        };

        var strings = {
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

        var markup = {
            description: "aaa<span>bbb</span>",
            instructions: "ccc<span>ddd</span>"
        };

        var links = {
            codeLinkHref: "#aaa",
            apiLinkHref: "#bbb",
            designLinkHref: "#ccc",
            feedbackLinkHref: "#ddd",
            titleLinkHref: "#eee"
        };

        var assertModelAndStylesForClosedPanel = function (that) {
            jqUnit.assertFalse("Check that model.showPanel is false", that.model.showPanel);
            jqUnit.assertTrue("Check that container has hidden style", that.container.hasClass(that.options.styles.hidden));
        };

        var assertAriaForClosedPanel = function (that) {
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

        var assertPanelIsClosed = function (that) {
            assertModelAndStylesForClosedPanel(that);
            assertAriaForClosedPanel(that);
        };

        var assertPanelIsOpen = function (that) {
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

        var verifyRendering = function (that, strings) {
            // check strings
            fluid.each(strings, function (value, key) {
                jqUnit.assertEquals("Check string with selector '" + key + "'", value, that.locate(key).text());
            });

            // check markup
            jqUnit.assertEquals("Check markup with selector 'description'", markup.description, that.locate("description").html());
            jqUnit.assertEquals("Check markup with selector 'instructions'", markup.instructions, that.locate("instructions").html());

            // check links
            jqUnit.assertEquals("Check link for selector 'codeLink'", links.codeLinkHref, that.locate("codeLink").attr("href"));
            jqUnit.assertEquals("Check link for selector 'apiLink'", links.apiLinkHref, that.locate("apiLink").attr("href"));
            jqUnit.assertEquals("Check link for selector 'designLink'", links.designLinkHref, that.locate("designLink").attr("href"));
            jqUnit.assertEquals("Check link for selector 'feedbackLink'", links.feedbackLinkHref, that.locate("feedbackLink").attr("href"));
            jqUnit.assertEquals("Check link for selector 'titleLink'", links.titleLinkHref, that.locate("titleLink").attr("href"));

            // check aria-controls
            var containerId = that.container.attr("id");
            jqUnit.assertEquals("Check aria-controls on toggleControl (" + containerId + ")",
                containerId, that.locate("toggleControl").attr("aria-controls"));
            jqUnit.assertEquals("Check aria-controls on closeControl (" + containerId + ")",
                containerId, that.locate("closeControl").attr("aria-controls"));

            jqUnit.start();
        };

        jqUnit.asyncTest("Verify Rendering", function () {
            jqUnit.expect(20);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: resources,
                listeners: {
                    "afterRender": {
                        "listener": verifyRendering,
                        "args": ["{that}", strings],
                        "priority": "last"
                    }
                },
                strings: strings,
                markup: markup,
                links: links
            });
        });


        var verifyAtOnCreateWhenInitiallyHidden = function (that) {
            assertModelAndStylesForClosedPanel(that);
        };

        var verifyAtAfterRenderWhenInitiallyHidden = function (that) {
            assertAriaForClosedPanel(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify when initially hidden", function () {
            jqUnit.expect(7);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: resources,
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
            assertPanelIsOpen(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify when initially visible", function () {
            jqUnit.expect(7);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: resources,
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
            assertPanelIsOpen(that);
            that.locate("closeControl").click();
            assertPanelIsClosed(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify close control", function () {
            jqUnit.expect(14);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: resources,
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
            assertPanelIsOpen(that);
            that.closePanel();
            assertPanelIsClosed(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify closePanel invoker", function () {
            jqUnit.expect(14);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: resources,
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
            assertPanelIsOpen(that);
            that.locate("toggleControl").click();
            assertPanelIsClosed(that);
            that.locate("toggleControl").click();
            assertPanelIsOpen(that);
            that.locate("closeControl").click();
            assertPanelIsClosed(that);
            that.locate("toggleControl").click();
            assertPanelIsOpen(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify toggle control", function () {
            jqUnit.expect(35);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: resources,
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
            assertPanelIsOpen(that);
            that.togglePanel();
            assertPanelIsClosed(that);
            that.togglePanel();
            assertPanelIsOpen(that);
            that.closePanel();
            assertPanelIsClosed(that);
            that.togglePanel();
            assertPanelIsOpen(that);
            jqUnit.start();
        };

        jqUnit.asyncTest("Verify togglePanel invoker", function () {
            jqUnit.expect(35);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: resources,
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
