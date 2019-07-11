/*
Copyright 2007-2019 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {
        jqUnit.module("SlidingPanel Tests");

        fluid.registerNamespace("fluid.tests.slidingPanel");

        fluid.tests.createSlidingPanel = function (options) {
            var commonOptions = {
                members: {
                    msgResolver: {
                        expander: {
                            funcName: "fluid.messageResolver",
                            args: {
                                messageBase: {
                                    "slidingPanelShowText": "+ Show Display Preferences",
                                    "slidingPanelHideText": "- Hide"
                                }
                            }
                        }
                    }
                }
            };
            return fluid.slidingPanel(".flc-slidingPanel", $.extend(true, commonOptions, options));
        };

        fluid.tests.slidingPanel.assertAria = function (that, state) {
            var button = that.locate("toggleButton");
            var panel = that.locate("panel");

            jqUnit.assertEquals("Show/hide button has the button role", "button", button.attr("role"));
            jqUnit.assertEquals("Show/hide button has correct aria-pressed", state, button.attr("aria-pressed"));
            jqUnit.assertEquals("Show/hide button has correct aria-controls", panel.attr("id"), button.attr("aria-controls"));
            jqUnit.assertEquals("Show/hide button has correct aria-expanded", state, button.attr("aria-expanded"));
            jqUnit.assertEquals("Panel has the group role", "group", panel.attr("role"));
            jqUnit.assertEquals("Panel has the correct aria-label", that.options.strings.panelLabel, panel.attr("aria-label"));
        };

        jqUnit.test("Test Init", function () {
            jqUnit.expect(7);
            var slidingPanel = fluid.tests.createSlidingPanel();

            jqUnit.assertTrue("The sliding panel is initialised", slidingPanel);
            fluid.tests.slidingPanel.assertAria(slidingPanel, "false");
        });

        jqUnit.asyncTest("Show Panel", function () {
            jqUnit.expect(8);
            var slidingPanel = fluid.tests.createSlidingPanel();
            slidingPanel.events.afterPanelShow.addListener(function () {
                var toggleButton = slidingPanel.locate("toggleButton");
                var panel = slidingPanel.locate("panel");

                jqUnit.assertEquals("Show panel", "block", panel.css("display"));
                jqUnit.assertEquals("Show panel button text", slidingPanel.options.strings.hideText, toggleButton.text());
                fluid.tests.slidingPanel.assertAria(slidingPanel, "true");

                jqUnit.start();
            });
            slidingPanel.showPanel();
        });

        jqUnit.asyncTest("Hide Panel", function () {
            jqUnit.expect(2);
            var slidingPanel = fluid.tests.createSlidingPanel({
                model: {
                    isShowing: true
                }
            });

            slidingPanel.events.afterPanelHide.addListener(function () {
                jqUnit.assertEquals("Hide panel", "none", slidingPanel.locate("panel").css("display"));
                jqUnit.assertEquals("Hide panel button text", slidingPanel.options.strings.showText, slidingPanel.locate("toggleButton").text());
                jqUnit.start();
            });

            slidingPanel.hidePanel();
        });


        jqUnit.asyncTest("Toggle Panel Show", function () {
            jqUnit.expect(1);
            var slidingPanel = fluid.tests.createSlidingPanel();

            slidingPanel.events.afterPanelShow.addListener(function () {
                jqUnit.assertEquals("Show panel via toggle", "block", slidingPanel.locate("panel").css("display"));
                jqUnit.start();
            });

            slidingPanel.togglePanel();
        });

        jqUnit.asyncTest("Toggle Panel Hide", function () {
            jqUnit.expect(1);
            var slidingPanel = fluid.tests.createSlidingPanel({
                model: {
                    isShowing: true
                }
            });

            slidingPanel.events.afterPanelHide.addListener(function () {
                jqUnit.assertEquals("Hide panel via toggle", "none",  slidingPanel.locate("panel").css("display"));
                jqUnit.start();
            });

            slidingPanel.togglePanel();
        });

    });
})(jQuery);
