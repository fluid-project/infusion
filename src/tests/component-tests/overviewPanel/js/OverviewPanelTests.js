/*
Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
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
            instructions: "ccc<span>ddd</span>",
            codeLinkHref: "#aaa",
            apiLinkHref: "#bbb",
            designLinkHref: "#ccc",
            feedbackLinkHref: "#ddd"
        };

        var assertPanelIsClosed = function (that) {
            jqUnit.assertFalse("Check that model.showPanel is false", that.model.showPanel);
            jqUnit.assertTrue("Check that container has hidden style", that.container.hasClass(that.options.styles.hidden));
        };

        var assertPanelIsOpen = function (that) {
            jqUnit.assertTrue("Check that model.showPanel is true", that.model.showPanel);
            jqUnit.assertFalse("Check that container does not have hidden style", that.container.hasClass(that.options.styles.hidden));
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
            jqUnit.assertEquals("Check link for selector 'codeLink'", markup.codeLinkHref, that.locate("codeLink").attr("href"));
            jqUnit.assertEquals("Check link for selector 'apiLink'", markup.apiLinkHref, that.locate("apiLink").attr("href"));
            jqUnit.assertEquals("Check link for selector 'designLink'", markup.designLinkHref, that.locate("designLink").attr("href"));
            jqUnit.assertEquals("Check link for selector 'feedbackLink'", markup.feedbackLinkHref, that.locate("feedbackLink").attr("href"));

            jqUnit.start();
        };

        jqUnit.asyncTest("Verify Rendering", function () {
            jqUnit.expect(17);
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
                markup: markup
            });
        });

        var verifyWhenInitiallyHidden = function (that) {
            // test that the panel is closed at onCreate
            assertPanelIsClosed(that);
        };

        jqUnit.asyncTest("Verify when initially hidden", function () {
            jqUnit.expect(2);
            fluid.overviewPanel(".flc-overviewPanel", {
                resources: resources,
                listeners: {
                    "onCreate": {
                        "listener": verifyWhenInitiallyHidden,
                        "priority": "last"
                    },
                    "afterRender": {
                        "listener": "jqUnit.start",
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
            jqUnit.expect(2);
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
            jqUnit.expect(4);
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
            jqUnit.expect(4);
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
            jqUnit.expect(10);
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
            jqUnit.expect(10);
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
