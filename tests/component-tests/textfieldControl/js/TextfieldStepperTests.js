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

/* global jqUnit */

(function ($) {
    "use strict";

    $(function () {

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
            jqUnit.expect(4);
            var that = fluid.tests.textfieldStepper.button(".flc-textfieldStepper-button");

            jqUnit.assertEquals("The label should be set", that.options.strings.label, that.container.attr("aria-label"));
            jqUnit.assertTrue("The container styles should be added", that.container.hasClass(that.options.styles.container));
            jqUnit.assertEquals("The button should be removed from the tab order", "-1", that.container.attr("tabindex"));
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
                value: 0,
                range: {
                    max: 10,
                    min: 1
                }
            },
            attrs: {
                "aria-labelledby": "label-nativeHTML",
                "aria-label": "{that}.options.strings.label"
            }
        });

        fluid.tests.textfieldStepper.verifyState = function (that, expectedValue, incBtnState, decBtnState) {
            jqUnit.assertEquals("The model value should be " + expectedValue, expectedValue, that.model.value);
            jqUnit.assertEquals("The aria-valuenow should be " + expectedValue, expectedValue.toString(), that.textfield.container.attr("aria-valuenow"));
            jqUnit.assertEquals("The increase button is " + (incBtnState ? "enabled" : "disabled"), incBtnState, !that.locate("increaseButton").is(":disabled"));
            jqUnit.assertEquals("The decrease button is " + (decBtnState ? "enabled" : "disabled"), decBtnState, !that.locate("decreaseButton").is(":disabled"));
        };

        fluid.defaults("fluid.tests.stepperTestTree", {
            gradeNames: ["fluid.test.testEnvironment", "fluid.modelComponent"],
            components: {
                stepper: {
                    type: "fluid.tests.textfieldStepper",
                    container: ".flc-textfieldStepper",
                    options: {
                        model: {
                            value: 1,
                            step: 1,
                            range: {
                                min: 0,
                                max: 2
                            }
                        }
                    }
                },
                testCases: {
                    type: "fluid.tests.stepperTestCases"
                }
            }
        });

        fluid.defaults("fluid.tests.stepperTestCases", {
            gradeNames: ["fluid.test.testCaseHolder"],
            modules: [ {
                name: "Textfield Stepper Interaction Tests",
                tests: [{
                    name: "Change Value",
                    expect: 20,
                    sequence: [{
                        // initial state
                        funcName: "fluid.tests.textfieldStepper.verifyState",
                        args: ["{stepper}", 1, true, true]
                    }, {
                        jQueryTrigger: "click",
                        element: "{stepper}.dom.increaseButton"
                    }, {
                        // increase to maximum
                        listener: "fluid.tests.textfieldStepper.verifyState",
                        args: ["{stepper}", 2, false, true],
                        spec: {path: "value", priority: "last:testing"},
                        changeEvent: "{stepper}.applier.modelChanged"
                    }, {
                        // decrease
                        jQueryTrigger: "click",
                        element: "{stepper}.dom.decreaseButton"
                    }, {
                        listener: "fluid.tests.textfieldStepper.verifyState",
                        args: ["{stepper}", 1, true, true],
                        spec: {path: "value", priority: "last:testing"},
                        changeEvent: "{stepper}.applier.modelChanged"
                    }, {
                        // decrease to minimum
                        jQueryTrigger: fluid.tests.textfieldControl.createKeyEvent("keydown", 40),
                        element: "{stepper}.dom.textfield"
                    }, {
                        listener: "fluid.tests.textfieldStepper.verifyState",
                        args: ["{stepper}", 0, true, false],
                        spec: {path: "value", priority: "last:testing"},
                        changeEvent: "{stepper}.applier.modelChanged"
                    }, {
                        // increase
                        jQueryTrigger: fluid.tests.textfieldControl.createKeyEvent("keydown", 38),
                        element: "{stepper}.dom.textfield"
                    }, {
                        listener: "fluid.tests.textfieldStepper.verifyState",
                        args: ["{stepper}", 1, true, true],
                        spec: {path: "value", priority: "last:testing"},
                        changeEvent: "{stepper}.applier.modelChanged"
                    }]
                }]
            }]
        });

        fluid.test.runTests([
            "fluid.tests.stepperTestTree"
        ]);
    });
})(jQuery);
