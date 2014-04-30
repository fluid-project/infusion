/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {
        jqUnit.module("SlidingPanel Tests");

        fluid.registerNamespace("fluid.tests");

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

        jqUnit.test("Test Init", function () {
            jqUnit.expect(1);
            var slidingPanel = fluid.tests.createSlidingPanel();
            jqUnit.assertTrue("The sliding panel is initialised", slidingPanel);
        });

        jqUnit.asyncTest("Show Panel", function () {
            jqUnit.expect(2);
            var slidingPanel = fluid.tests.createSlidingPanel();
            slidingPanel.events.afterPanelShow.addListener(function () {
                jqUnit.assertEquals("Show panel", "block", slidingPanel.locate("panel").css("display"));
                jqUnit.assertEquals("Show panel button text", slidingPanel.options.strings.hideText, slidingPanel.locate("toggleButton").text());
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