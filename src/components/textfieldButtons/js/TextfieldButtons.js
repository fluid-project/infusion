/*
Copyright 2013 OCAD University

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
        components: {
            textfield: {
                type: "fluid.textfieldButtons.textfield",
                container: "{textfieldButtons}.dom.textfield",
                options: {
                    model: "{textfieldButtons}.model",
                    range: "{textfieldButtons}.options.range"
                }
            },
            increaseButton: {
                type: "fluid.button",
                container: "{textfieldButtons}.dom.increaseButton",
                options: {
                    model: "{fluid.textfieldButtons}.model",
                    range: "{fluid.textfieldButtons}.options.range",
                    buttonOptions: "{fluid.textfieldButtons}.options.buttonOptions",
                    incrementCoefficient: 1
                }
            },
            decreaseButton: {
                type: "fluid.button",
                container: "{textfieldButtons}.dom.decreaseButton",
                options: {
                    model: "{fluid.textfieldButtons}.model",
                    range: "{fluid.textfieldButtons}.options.range",
                    buttonOptions: "{fluid.textfieldButtons}.options.buttonOptions",
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

    fluid.defaults("fluid.textfieldButtons.textfield", {
        gradeNames: ["fluid.viewComponent"],
        range: {}, // should be used to specify the min, max range e.g. {min: 0, max: 100}
        modelRelay: {
            target: "value",
            singleTransform: {
                type: "fluid.transforms.stringToNumber",
                input: "{that}.model.stringValue"
            }
        },
        modelListeners: {
            value: {
                "this": "{that}.container",
                "method": "val",
                args: ["{change}.value"]
            },
            // TODO: This listener is to deal with the issue that, when the input field receives a invalid input such as a string value,
            // ignore it and populate the field with the previous value.
            // This is an area in which UX has spilled over into our model configuration, which to some extent we should try to prevent.
            // Whenever we receive a "change" event or some other similar checkpoint, if these updates occurred any faster, the user would
            // be infuriated by being unable to type into the field. This situation doesn't occur at the moment because the change event is
            // only fired when users leave the input feild. At the very least, we need to give a namespace to this listener - unfortunately
            // the current dataBinding implementation will ignore it. Having this listener here represents an interaction decision rather
            // than an implementation decision. This issue needs to be revisited.
            stringValue: {
                "this": "{that}.container",
                "method": "val",
                args: ["{that}.model.value"]
            }
        },
        listeners: {
            "onCreate.bindChangeEvt": {
                "this": "{that}.container",
                "method": "change",
                "args": ["{that}.setModel"]
            }
        },
        invokers: {
            setModel: {
                changePath: "stringValue",
                value: "{arguments}.0.target.value"
            }
        }
    });

    fluid.defaults("fluid.button", {
        gradeNames: ["fluid.viewComponent"],
        range: {}, // should be used to specify the min, max range e.g. {min: 0, max: 100}
        invokers: {
            setModel: {
                changePath: "value",
                value: {
                    expander: {
                        funcName: "fluid.buttonCalculateValue",
                        args: ["{that}.options.incrementCoefficient", "{that}.options.buttonOptions.stepMultiplier", "{that}.model.value", "{that}.options.range.min", "{that}.options.range.max"]
                    }
                }
            }
        },
        listeners: {
            "onCreate.bindClickEvt": {
                "this": "{that}.container",
                "method": "click",
                "args": "{that}.setModel"
            }
        }
    });

    fluid.buttonCalculateValue = function (value, stepMultiplier, modelValue, min, max) {
        modelValue = Math.round(modelValue * stepMultiplier);
        min = Math.round(min * stepMultiplier);
        max = Math.round(max * stepMultiplier);
        if ((modelValue + value) < min) return min/stepMultiplier;
        else if ((modelValue + value) > max) return max/stepMultiplier;
        else return (modelValue + value)/stepMultiplier;
    };

})(jQuery, fluid_2_0_0);
