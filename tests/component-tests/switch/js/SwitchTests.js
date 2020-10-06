/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        jqUnit.module("Switch Tests");

        fluid.defaults("fluid.tests.switchUI", {
            gradeNames: ["fluid.switchUI"],
            strings: {
                "label": "Aria label"
            },
            attrs: {
                // typically only one of these will be set, but have both here for the tests
                "aria-label": "{that}.options.strings.label",
                "aria-labelledby": "label"
            }
        });

        fluid.tests.assertState = function (that, state) {
            jqUnit.assertEquals("The model state is set correctly", state, that.model.enabled);
            jqUnit.assertEquals("The aria-checked state is specified correctly", state.toString(), that.locate("control").attr("aria-checked"));
        };

        fluid.tests.assertInit = function (that) {
            var control = that.locate("control");
            jqUnit.assertEquals("The switch role is added", "switch", control.attr("role"));
            jqUnit.assertEquals("Tabindex is set", "0", control.attr("tabindex"));
            jqUnit.assertEquals("The aria-label is set", that.options.strings.label, control.attr("aria-label"));
            jqUnit.assertEquals("The aria-labelledby is set", "label", control.attr("aria-labelledby"));
            jqUnit.assertEquals("The on text is set", that.options.strings.on, that.locate("on").text());
            jqUnit.assertEquals("The off text is set", that.options.strings.off, that.locate("off").text());
        };

        jqUnit.test("Test Init - enabled", function () {
            var that = fluid.tests.switchUI(".flc-switchUI", {model: {enabled: true}});
            fluid.tests.assertInit(that);
            fluid.tests.assertState(that, true);
        });

        jqUnit.test("Test Init - not enabled", function () {
            var that = fluid.tests.switchUI(".flc-switchUI", {model: {enabled: false}});
            fluid.tests.assertInit(that);
            fluid.tests.assertState(that, false);
        });

        jqUnit.test("Toggle State - Click", function () {
            var that = fluid.tests.switchUI(".flc-switchUI", {model: {enabled: false}});

            that.locate("control").trigger("click");
            fluid.tests.assertState(that, true);

            that.locate("control").trigger("click");
            fluid.tests.assertState(that, false);
        });

        jqUnit.test("Toggle State - ENTER Key", function () {
            var that = fluid.tests.switchUI(".flc-switchUI", {model: {enabled: false}});
            var keyEvent = $.Event("keydown");
            keyEvent.which = $.ui.keyCode.ENTER;

            that.locate("control").trigger(keyEvent);
            fluid.tests.assertState(that, true);

            that.locate("control").trigger(keyEvent);
            fluid.tests.assertState(that, false);
        });

        jqUnit.test("Toggle State - SPACEBAR Key", function () {
            var that = fluid.tests.switchUI(".flc-switchUI", {model: {enabled: false}});
            var keyEvent = $.Event("keydown");
            keyEvent.which = $.ui.keyCode.SPACE;

            that.locate("control").trigger(keyEvent);
            fluid.tests.assertState(that, true);

            that.locate("control").trigger(keyEvent);
            fluid.tests.assertState(that, false);
        });
    });
})(jQuery);
