/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    /********************
     * Textfield Slider *
     ********************/

    fluid.defaults("fluid.textfieldSlider", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        components: {
            textfield: {
                type: "fluid.textfieldSlider.textfield",
                container: "{textfieldSlider}.dom.textfield",
                options: {
                    model: "{textfieldSlider}.model",
                    range: "{textfieldSlider}.options.range"
                }
            },
            slider: {
                type: "fluid.textfieldSlider.slider",
                container: "{textfieldSlider}.dom.slider",
                options: {
                    model: "{fluid.textfieldSlider}.model",
                    range: "{fluid.textfieldSlider}.options.range",
                    sliderOptions: "{fluid.textfieldSlider}.options.sliderOptions"
                }
            }
        },
        selectors: {
            textfield: ".flc-textfieldSlider-field",
            slider: ".flc-textfieldSlider-slider"
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
        sliderOptions: {
            orientation: "horizontal",
            step: 1.0
        }
    });

    fluid.defaults("fluid.textfieldSlider.textfield", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
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
            // When the input field receives a invalid input such as a string value, ignore it and populate the field with the previous value
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

    fluid.defaults("fluid.textfieldSlider.slider", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        range: {}, // should be used to specify the min, max range e.g. {min: 0, max: 100}
        selectors: {
            thumb: ".ui-slider-handle"
        },
        members: {
            slider: {
                expander: {
                    // pass in {that}.initSliderAria as one argument since invokers are resolved at a later time
                    funcName: "fluid.textfieldSlider.slider.initSlider",
                    args: ["{that}", "{that}.initSliderAria"]
                }
            }
        },
        invokers: {
            initSliderAria: {
                funcName: "fluid.textfieldSlider.slider.initSliderAria",
                args: ["{that}.dom.thumb", "{arguments}.0"]
            },
            setSliderValue: {
                "this": "{that}.slider",
                "method": "slider",
                args: ["value", "{arguments}.0"]
            },
            setSliderAria: {
                "this": "{that}.dom.thumb",
                "method": "attr",
                args: ["aria-valuenow", "{arguments}.0"]
            },
            setModel: {
                changePath: "value",
                value: "{arguments}.1.value"
            }
        },
        listeners: {
            "onCreate.bindSlideEvt": {
                "this": "{that}.slider",
                "method": "bind",
                "args": ["slide", "{that}.setModel"]
            }
        },
        modelListeners: {
            "value": [{
                listener: "{that}.setSliderValue",
                args: ["{change}.value"]
            }, {
                listener: "{that}.setSliderAria",
                args: ["{change}.value"]
            }]
        }
    });

    // This will be removed once the jQuery UI slider has built in ARIA
    fluid.textfieldSlider.slider.initSliderAria = function (thumb, options) {
        var ariaDefaults = {
            role: "slider",
            "aria-valuenow": options.value,
            "aria-valuemin": options.min,
            "aria-valuemax": options.max
        };
        thumb.attr(ariaDefaults);
    };

    fluid.textfieldSlider.slider.initSlider = function (that, initSliderAriaFunc) {
        var sliderOptions = $.extend(true, {}, that.options.sliderOptions, that.model, that.options.range);
        var slider = that.container.slider(sliderOptions);
        initSliderAriaFunc(sliderOptions);

        return slider;
    };

})(jQuery, fluid_2_0);
