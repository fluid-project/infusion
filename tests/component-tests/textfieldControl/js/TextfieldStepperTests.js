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

        /***************************
         * Textfield Stepper Tests *
         ***************************/

        jqUnit.module("Textfield Stepper Tests");

        fluid.defaults("fluid.tests.textfieldStepper", {
            gradeNames: ["fluid.textfieldStepper"],
            strings: {
                "aria-label": "Aria self-labeling"
            },
            model: {
                value: 0
            },
            ariaOptions: {
                "aria-labelledby": "label-nativeHTML"
            }
        });

        jqUnit.test("Test Init", function () {
            jqUnit.expect(8);
            var options = {
                model: {
                    value: 8
                },
                range: {
                    max: 10,
                    min: 1
                }
            };
            var that = fluid.tests.textfieldStepper(".flc-textfieldStepper", options);

            fluid.tests.textfieldControl.assertTextfieldControlInit(that, options);

            jqUnit.assertFalse("The increase button is enabled", that.locate("increaseButton").is(":disabled"));
            jqUnit.assertFalse("The decrease button is enabled", that.locate("decreaseButton").is(":disabled"));
        });

        jqUnit.test("Test Maximum", function () {
            jqUnit.expect(8);
            var options = {
                model: {
                    value: 10
                },
                range: {
                    max: 10,
                    min: 1
                }
            };
            var that = fluid.tests.textfieldStepper(".flc-textfieldStepper", options);
            var increaseBtn = that.locate("increaseButton");
            var decreaseBtn = that.locate("decreaseButton");

            // init
            jqUnit.assertTrue("The increase button is disabled", increaseBtn.is(":disabled"));
            jqUnit.assertFalse("The decrease button is enabled", decreaseBtn.is(":disabled"));

            // decrease
            decreaseBtn.trigger("click");

            jqUnit.assertEquals("The model value should decrease", that.options.range.max - that.options.step, that.model.value);
            jqUnit.assertFalse("The increase button is enabled", increaseBtn.is(":disabled"));
            jqUnit.assertFalse("The decrease button is enabled", decreaseBtn.is(":disabled"));

            // increase
            increaseBtn.trigger("click");

            jqUnit.assertEquals("The model value should increase", that.options.range.max, that.model.value);
            jqUnit.assertTrue("The increase button is disabled", increaseBtn.is(":disabled"));
            jqUnit.assertFalse("The decrease button is enabled", decreaseBtn.is(":disabled"));
        });

        jqUnit.test("Test Minimum", function () {
            jqUnit.expect(8);
            var options = {
                model: {
                    value: 1
                },
                range: {
                    max: 10,
                    min: 1
                }
            };
            var that = fluid.tests.textfieldStepper(".flc-textfieldStepper", options);
            var increaseBtn = that.locate("increaseButton");
            var decreaseBtn = that.locate("decreaseButton");

            // init
            jqUnit.assertFalse("The increase button is enabled", increaseBtn.is(":disabled"));
            jqUnit.assertTrue("The decrease button is disabled", decreaseBtn.is(":disabled"));

            // increase
            increaseBtn.trigger("click");

            jqUnit.assertEquals("The model value should decrease", that.options.range.min + that.options.step, that.model.value);
            jqUnit.assertFalse("The increase button is enabled", increaseBtn.is(":disabled"));
            jqUnit.assertFalse("The decrease button is enabled", decreaseBtn.is(":disabled"));

            // decrease
            decreaseBtn.trigger("click");

            jqUnit.assertEquals("The model value should increase", that.options.range.min, that.model.value);
            jqUnit.assertFalse("The increase button is enabled", increaseBtn.is(":disabled"));
            jqUnit.assertTrue("The decrease button is disabled", decreaseBtn.is(":disabled"));
        });



    });
})(jQuery);
