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

    /********************
     * Textfield Slider *
     ********************/

    fluid.defaults("fluid.textfieldSlider", {
        gradeNames: ["fluid.textfieldControl"],
        components: {
            slider: {
                type: "fluid.slider",
                container: "{textfieldSlider}.dom.slider",
                options: {
                    model: "{textfieldSlider}.model",
                    range: "{textfieldSlider}.options.range",
                    sliderOptions: "{textfieldSlider}.options.sliderOptions",
                    ariaOptions: "{textfieldSlider}.options.ariaOptions",
                    strings: "{textfieldSlider}.options.strings"
                }
            }
        },
        selectors: {
            textfield: ".flc-textfieldSlider-field",
            slider: ".flc-textfieldSlider-slider"
        },
        styles: {
            container: "fl-textfieldSlider fl-focus"
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
        },
        sliderOptions: {
            orientation: "horizontal",
            step: 1.0
        },
        strings: {
            // Specified by implementor
            // text of label to apply to both textfield and slider input
            // via aria-label attribute
            // "aria-label": ""
        },
        listeners: {
            "onCreate.addContainerStyle": {
                "this": "{that}.container",
                method: "addClass",
                args: ["{that}.options.styles.container"]
            }
        }
    });

    fluid.defaults("fluid.slider", {
        gradeNames: ["fluid.viewComponent"],
        modelRelay: {
            target: "value",
            singleTransform: {
                type: "fluid.transforms.stringToNumber",
                input: "{that}.model.stringValue"
            }
        },
        invokers: {
            setModel: {
                changePath: "stringValue",
                value: {
                    expander: {
                        "this": "{that}.container",
                        "method": "val"
                    }
                }
            }
        },
        listeners: {
            "onCreate.initSliderAttributes": {
                "this": "{that}.container",
                method: "attr",
                args: [{
                    "min": "{that}.options.range.min",
                    "max": "{that}.options.range.max",
                    "step": "{that}.options.sliderOptions.step",
                    "type": "range",
                    "value": "{that}.model.value",
                    "aria-labelledby": "{that}.options.ariaOptions.aria-labelledby",
                    "aria-label": "{that}.options.strings.aria-label"
                }]
            },
            "onCreate.bindSlideEvt": {
                "this": "{that}.container",
                "method": "on",
                "args": ["input", "{that}.setModel"]
            },
            "onCreate.bindRangeChangeEvt": {
                "this": "{that}.container",
                "method": "on",
                "args": ["change", "{that}.setModel"]
            }
        },
        modelListeners: {
            "value": [{
                "this": "{that}.container",
                "method": "val",
                args: ["{change}.value"],
                // If we don't exclude init, the value can get
                // set before onCreate.initSliderAttributes
                // sets min / max / step, which messes up the
                // initial slider rendering
                excludeSource: "init"
            }]
        }
    });

})(jQuery, fluid_3_0_0);
