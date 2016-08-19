/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0_0 = fluid_2_0_0 || {};

(function ($, fluid) {
    "use strict";

    /********************
     * Textfield Buttons *
     ********************/

    fluid.defaults("fluid.textfieldButtons", {
        gradeNames: ["fluid.viewComponent"],
        distributeOptions: {
            target: "{that > fluid.stepper.button}.options",
            record: {
                model: "{fluid.textfieldButtons}.model",
                range: "{fluid.textfieldButtons}.options.range",
                buttonOptions: "{fluid.textfieldButtons}.options.buttonOptions"
            }
        },
        components: {
            textfield: {
                type: "fluid.textfieldSlider.textfield",
                container: "{fluid.textfieldButtons}.dom.textfield",
                options: {
                    model: "{fluid.textfieldButtons}.model",
                    range: "{fluid.textfieldButtons}.options.range"
                }
            },
            increaseButton: {
                type: "fluid.stepper.button",
                container: "{fluid.textfieldButtons}.dom.increaseButton",
                options: {
                    incrementCoefficient: 1
                }
            },
            decreaseButton: {
                type: "fluid.stepper.button",
                container: "{fluid.textfieldButtons}.dom.decreaseButton",
                options: {
                    incrementCoefficient: -1
                }
            }
        },
        selectors: {
            textfield: ".flc-textfieldButtons-field",
            increaseButton: ".fl-increase-button",
            decreaseButton: ".fl-decrease-button"
        },
        model: {
            value: null
        },
        modelRelay: {
            target: "value",
            singleTransform: {
                type: "fluid.transforms.limitRange",
                input: "{that}.model.value",
                min: "{that}.options.range.min",
                max: "{that}.options.range.max"
            }
        },
        range: {
            min: 0,
            max: 100
        }
    });

    fluid.defaults("fluid.stepper.button", {
        gradeNames: ["fluid.viewComponent"],
        range: {}, // should be used to specify the min, max range e.g. {min: 0, max: 100}
        invokers: {
            setModel: {
                changePath: "value",
                value: {
                    expander: {
                        funcName: "{that}.calculateValue"
                    }
                }
            },
            calculateValue: {
                funcName: "fluid.stepper.button.buttonCalculateValue",
                args: ["{that}.options.incrementCoefficient", "{that}.options.buttonOptions.stepMultiplier", "{that}.model.value"]
            }
        },
        listeners: {
            "onCreate.bindClickEvt": {
                "this": "{that}.container",
                "method": "click",
                "args": "{that}.setModel"
            }
        },
        incrementCoefficient: 1,
        buttonOptions: {
            stepMultiplier: 10
        }
    });

    fluid.stepper.button.buttonCalculateValue = function (incrementCoefficient, stepMultiplier, modelValue) {
        return (Math.round(modelValue * stepMultiplier + incrementCoefficient)) / stepMultiplier;
    };

})(jQuery, fluid_2_0_0);
