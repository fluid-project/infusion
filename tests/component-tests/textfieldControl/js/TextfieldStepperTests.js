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
                "label": "Aria self-labeling"
            },
            model: {
                value: 0
            },
            attrs: {
                "aria-labelledby": "label-nativeHTML",
                "aria-label": "{that}.options.strings.label"
            }
        });

        jqUnit.test("Test Init", function () {
            jqUnit.expect(11);
            var options = {
                model: {
                    value: 8,
                    range: {
                        max: 10,
                        min: 1
                    }
                }
            };
            var that = fluid.tests.textfieldStepper(".flc-textfieldStepper", options);

            fluid.tests.textfieldControl.assertRangeControlledTextfieldInit(that.textfield, options);
            jqUnit.assertEquals("The role is set", "spinbutton", that.textfield.container.attr("role"));
            jqUnit.assertEquals("The aria-valuemin is set", that.model.range.min.toString(), that.textfield.container.attr("aria-valuemin"));
            jqUnit.assertEquals("The aria-valuemax is set", that.model.range.max.toString(), that.textfield.container.attr("aria-valuemax"));
            jqUnit.assertEquals("The aria-valuenow is set", that.model.value.toString(), that.textfield.container.attr("aria-valuenow"));

            jqUnit.assertFalse("The increase button is enabled", that.locate("increaseButton").is(":disabled"));
            jqUnit.assertFalse("The decrease button is enabled", that.locate("decreaseButton").is(":disabled"));
        });

        jqUnit.test("Test Maximum", function () {
            jqUnit.expect(10);
            var options = {
                model: {
                    value: 10,
                    range: {
                        max: 10,
                        min: 1
                    }
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

            var decreasedVal = that.model.range.max - that.model.step;
            jqUnit.assertEquals("The model value should decrease", decreasedVal, that.model.value);
            jqUnit.assertEquals("The aria-valuenow should be updated", decreasedVal.toString(), that.textfield.container.attr("aria-valuenow"));
            jqUnit.assertFalse("The increase button is enabled", increaseBtn.is(":disabled"));
            jqUnit.assertFalse("The decrease button is enabled", decreaseBtn.is(":disabled"));

            // increase
            increaseBtn.trigger("click");

            jqUnit.assertEquals("The model value should increase", that.model.range.max, that.model.value);
            jqUnit.assertEquals("The aria-valuenow should be updated", that.model.range.max.toString(), that.textfield.container.attr("aria-valuenow"));
            jqUnit.assertTrue("The increase button is disabled", increaseBtn.is(":disabled"));
            jqUnit.assertFalse("The decrease button is enabled", decreaseBtn.is(":disabled"));
        });

        jqUnit.test("Test Minimum", function () {
            jqUnit.expect(10);
            var options = {
                model: {
                    value: 1,
                    range: {
                        max: 10,
                        min: 1
                    }
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

            var increasedVal = that.model.range.min + that.model.step;
            jqUnit.assertEquals("The model value should increase", increasedVal, that.model.value);
            jqUnit.assertEquals("The aria-valuenow should be updated", increasedVal.toString(), that.textfield.container.attr("aria-valuenow"));
            jqUnit.assertFalse("The increase button is enabled", increaseBtn.is(":disabled"));
            jqUnit.assertFalse("The decrease button is enabled", decreaseBtn.is(":disabled"));

            // decrease
            decreaseBtn.trigger("click");

            jqUnit.assertEquals("The model value should decrease", that.model.range.min, that.model.value);
            jqUnit.assertEquals("The aria-valuenow should be updated", that.model.range.min.toString(), that.textfield.container.attr("aria-valuenow"));
            jqUnit.assertFalse("The increase button is enabled", increaseBtn.is(":disabled"));
            jqUnit.assertTrue("The decrease button is disabled", decreaseBtn.is(":disabled"));
        });

        jqUnit.test("Change with arrow keys", function () {
            jqUnit.expect(4);
            var options = {
                model: {
                    value: 5,
                    range: {
                        max: 10,
                        min: 1
                    }
                }
            };
            var that = fluid.tests.textfieldStepper(".flc-textfieldStepper", options);
            var upArrowEvent = $.Event("keydown");
            upArrowEvent.which = 38; // up arrow === 38
            var downArrowEvent = $.Event("keydown");
            downArrowEvent.which = 40; // down arrow === 40

            // increase
            that.textfield.container.trigger(upArrowEvent);

            var increasedVal = options.model.value + that.model.step;
            jqUnit.assertEquals("The model value should increase", increasedVal, that.model.value);
            jqUnit.assertEquals("The aria-valuenow should be updated", increasedVal.toString(), that.textfield.container.attr("aria-valuenow"));

            // decrease
            that.textfield.container.trigger(downArrowEvent);

            jqUnit.assertEquals("The model value should decrease", options.model.value, that.model.value);
            jqUnit.assertEquals("The aria-valuenow should be updated", options.model.value.toString(), that.textfield.container.attr("aria-valuenow"));
        });
    });
})(jQuery);
