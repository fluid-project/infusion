/*
Copyright 2013-2016 OCAD University

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
     * TextField Control *
     *********************/

    /**
     * TextField Control is a primarily used as a base grade for combining
     * a textfield with another UI element such as buttons or a slider
     * for inputing numerical values.
     */
    fluid.defaults("fluid.textfieldControl", {
        gradeNames: ["fluid.viewComponent"],
        strings: {
            // Specified by implementor
            // text of label to apply to both textfield and control
            // via aria-label attribute
            // "aria-label": ""
        },
        selectors: {
            textfield: ".flc-textfieldControl-field"
        },
        components: {
            textfield: {
                type: "fluid.textfieldControl.textfield",
                container: "{textfieldControl}.dom.textfield",
                options: {
                    modelRelay: {
                        source: "{textfieldControl}.model.value",
                        target: "value",
                        singleTransform: {
                            type: "fluid.transforms.numberToString",
                            scale: 1
                        }
                    },
                    ariaOptions: "{textfieldControl}.options.ariaOptions",
                    strings: "{textfieldControl}.options.strings"
                }
            }
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
        },
        ariaOptions: {
            // Specified by implementor
            // ID of an external label to refer to with aria-labelledby
            // attribute
            // "aria-labelledby": ""
        }
    });

    fluid.defaults("fluid.textfieldControl.textfield", {
        gradeNames: ["fluid.viewComponent"],
        modelListeners: {
            value: {
                "this": "{that}.container",
                "method": "val",
                args: ["{change}.value"]
            }
        },
        listeners: {
            "onCreate.bindChangeEvt": {
                "this": "{that}.container",
                "method": "change",
                "args": ["{that}.setModel"]
            },
            "onCreate.initTextfieldAttributes": {
                "this": "{that}.container",
                method: "attr",
                args: [{
                    "aria-labelledby": "{that}.options.ariaOptions.aria-labelledby",
                    "aria-label": "{that}.options.strings.aria-label"
                }]
            }
        },
        invokers: {
            setModel: {
                changePath: "value",
                value: "{arguments}.0.target.value"
            }
        }
    });

})(jQuery, fluid_3_0_0);
