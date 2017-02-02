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

    $(document).ready(function () {

        /**********************************
         * Textfield Stepper Button Tests *
         **********************************/

        jqUnit.module("Textfield Stepper Button Tests");

        fluid.defaults("fluid.tests.textfieldStepper.button", {
            gradeNames: ["fluid.textfieldStepper.button"],
            strings: {
                label: "Button Label"
            }
        });

        jqUnit.test("Test Init", function () {
            jqUnit.expect(2);
            var that = fluid.tests.textfieldStepper.button(".flc-textfieldStepper-button");

            jqUnit.assertEquals("The label should be set", that.options.strings.label, that.container.attr("aria-label"));
            jqUnit.assertEquals("The state of the button should match the model", that.model.disabled, that.container.is(":disabled"));
        });

        jqUnit.test("Change State", function () {
            var that = fluid.tests.textfieldStepper.button(".flc-textfieldStepper-button");
            var newState = !that.model.disabled;

            that.applier.change("disabled", newState);
            jqUnit.assertEquals("The state of the button should match the model", newState, that.container.is(":disabled"));
        });

        jqUnit.test("Trigger Click", function () {
            jqUnit.expect(1);
            var that = fluid.tests.textfieldStepper.button(".flc-textfieldStepper-button", {
                listeners: {
                    "onClick.test": {
                        listener: "jqUnit.assert",
                        args: ["The onClick event should have fired."]
                    }
                }
            });

            that.container.trigger("click");
        });

    });
})(jQuery);
