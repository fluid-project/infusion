/*
Copyright 2016 Stanislav Shterev

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0_0 = fluid_2_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*********************
     * Textfield Stepper *
     *********************/

    // fluid.defaults("fluid.textfieldStepper", {
    //     gradeNames: ["fluid.textfieldControl"],
    //     strings: {
    //         // Specified by implementor
    //         // text of label to apply to both textfield and control
    //         // via aria-label attribute
    //         // "aria-label": ""
    //     },
    //     components: {
    //         textfield: {
    //             type: "fluid.textfieldSlider.textfield",
    //             container: "{fluid.textfieldButtons}.dom.textfield",
    //             options: {
    //                 model: "{fluid.textfieldButtons}.model",
    //                 range: "{fluid.textfieldButtons}.options.range"
    //             }
    //         },
    //         increaseButton: {
    //             type: "fluid.stepper.button",
    //             container: "{fluid.textfieldButtons}.dom.increaseButton",
    //             options: {
    //                 coefficient: 1
    //             }
    //         },
    //         decreaseButton: {
    //             type: "fluid.stepper.button",
    //             container: "{fluid.textfieldButtons}.dom.decreaseButton",
    //             options: {
    //                 coefficient: -1
    //             }
    //         }
    //     },
    //     selectors: {
    //         textfield: ".flc-textfieldStepper-field",
    //         increaseButton: ".flc-textfieldStepper-increase",
    //         decreaseButton: ".flc-textfieldStepper-decrease"
    //     },
    //     model: {
    //         value: null
    //     },
    //     range: {
    //         min: 0,
    //         max: 100
    //     },
    //     ariaOptions: {
    //         // Specified by implementor
    //         // ID of an external label to refer to with aria-labelledby
    //         // attribute
    //         // "aria-labelledby": ""
    //     }
    // });

    fluid.defaults("fluid.textfieldStepper.button", {
        gradeNames: ["fluid.viewComponent"],
        strings: {
            // to be specified by an implementor.
            // to provide a label for the button.
            // label: ""
        },
        model: {
            disabled: false
        },
        events: {
            onClick: null
        },
        listeners: {
            "onCreate.bindClick": {
                "this": "{that}.container",
                "method": "click",
                "args": "{that}.events.onClick.fire"
            },
            "onCreate.addLabel": {
                "this": "{that}.container",
                method: "attr",
                args: ["aria-label", "{that}.options.strings.label"]
            }
        },
        modelListeners: {
            disabled: {
                "this": "{that}.container",
                method: "prop",
                args: ["disabled", "{change}.value"]
            }
        }
    });

    fluid.textfieldStepper.button.step = function (that) {
        var newValue = that.model.value + (that.options.coefficient * that.options.step);
        that.applier.change("value", newValue);
    };

})(jQuery, fluid_3_0_0);
