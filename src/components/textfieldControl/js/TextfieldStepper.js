/*
Copyright 2016 Stanislav Shterev
Copyright 2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*********************
     * Textfield Stepper *
     *********************/

    fluid.defaults("fluid.textfieldStepper", {
        gradeNames: ["fluid.viewComponent"],
        strings: {
            // Specified by implementor
            // text of label to apply to both textfield and control
            // via aria-label attribute
            // "aria-label": "",
            increaseLabel: "increment",
            decreaseLabel: "decrement"
        },
        selectors: {
            textfield: ".flc-textfieldStepper-field",
            increaseButton: ".flc-textfieldStepper-increase",
            decreaseButton: ".flc-textfieldStepper-decrease"
        },
        styles: {
            container: "fl-textfieldStepper fl-focus"
        },
        components: {
            textfield: {
                type: "fluid.textfield",
                container: "{that}.dom.textfield",
                options: {
                    gradeNames: ["fluid.textfield.rangeController"],
                    components: {
                        controller: {
                            options: {
                                model: "{textfieldStepper}.model"
                            }
                        }
                    },
                    ariaOptions: "{textfieldStepper}.options.ariaOptions",
                    strings: "{textfieldStepper}.options.strings"
                }
            },
            increaseButton: {
                type: "fluid.textfieldStepper.button",
                container: "{textfieldStepper}.dom.increaseButton",
                options: {
                    strings: {
                        label: "{textfieldStepper}.options.strings.increaseLabel"
                    },
                    listeners: {
                        "onClick.increase": "{textfieldStepper}.increase"
                    },
                    modelRelay: {
                        target: "disabled",
                        singleTransform: {
                            type: "fluid.transforms.binaryOp",
                            left: "{textfieldStepper}.model.value",
                            right: "{textfieldStepper}.model.range.max",
                            operator: ">="
                        }
                    }
                }
            },
            decreaseButton: {
                type: "fluid.textfieldStepper.button",
                container: "{textfieldStepper}.dom.decreaseButton",
                options: {
                    strings: {
                        label: "{textfieldStepper}.options.strings.decreaseLabel"
                    },
                    listeners: {
                        "onClick.increase": "{textfieldStepper}.decrease"
                    },
                    modelRelay: {
                        target: "disabled",
                        singleTransform: {
                            type: "fluid.transforms.binaryOp",
                            left: "{textfieldStepper}.model.value",
                            right: "{textfieldStepper}.model.range.min",
                            operator: "<="
                        }
                    }
                }
            }
        },
        invokers: {
            increase: {
                funcName: "fluid.textfieldStepper.step",
                args: ["{that}"]
            },
            decrease: {
                funcName: "fluid.textfieldStepper.step",
                args: ["{that}", -1]
            }
        },
        listeners: {
            "onCreate.addContainerStyle": {
                "this": "{that}.container",
                method: "addClass",
                args: ["{that}.options.styles.container"]
            }
        },
        model: {
            value: null,
            step: 1,
            range: {
                min: 0,
                max: 100
            }
        },
        ariaOptions: {
            // Specified by implementor
            // ID of an external label to refer to with aria-labelledby
            // attribute
            // "aria-labelledby": ""
        },
        distributeOptions: [{
            source: "{that}.options.scale",
            target: "{that > fluid.textfield > controller}.options.scale"
        }]
    });


    fluid.textfieldStepper.step = function (that, coefficient) {
        coefficient = coefficient || 1;
        var newValue = that.model.value + (coefficient * that.model.step);
        that.applier.change("value", newValue);
    };

    fluid.defaults("fluid.textfieldStepper.button", {
        gradeNames: ["fluid.viewComponent"],
        strings: {
            // to be specified by an implementor.
            // to provide a label for the button.
            // label: ""
        },
        styles: {
            container: "fl-textfieldStepper-button"
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
            },
            "onCreate.addContainerStyle": {
                "this": "{that}.container",
                method: "addClass",
                args: ["{that}.options.styles.container"]
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

})(jQuery, fluid_3_0_0);
