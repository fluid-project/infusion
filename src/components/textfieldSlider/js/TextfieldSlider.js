/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, fluid, jQuery, $*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    /********************
     * Textfield Slider *
     ********************/

    fluid.defaults("fluid.textfieldSlider", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        modelPath: null,   // Must be supplied by implementors to specify the model path to save and get the processed value. Such as "value".
        components: {
            textfield: {
                type: "fluid.textfieldSlider.textfield",
                container: "{textfieldSlider}.dom.textfield",
                options: {
                    model: "{textfieldSlider}.model",
                    modelPath: "{textfieldSlider}.options.modelPath",
                    range: "{textfieldSlider}.options.range",
                    applier: "{textfieldSlider}.applier"
                }
            },
            slider: {
                type: "fluid.textfieldSlider.slider",
                container: "{textfieldSlider}.dom.slider",
                options: {
                    model: "{textfieldSlider}.model",
                    modelPath: "{textfieldSlider}.options.modelPath",
                    range: "{textfieldSlider}.options.range",
                    applier: "{textfieldSlider}.applier",
                    sliderOptions: "{textfieldSlider}.options.sliderOptions"
                }
            }
        },
        selectors: {
            textfield: ".flc-textfieldSlider-field",
            slider: ".flc-textfieldSlider-slider"
        },
        events: {
            modelChanged: null,
            afterRender: null
        },
        listeners: {
            modelChanged: "{that}.refreshView",
            onCreate: "fluid.textfieldSlider.init"
        },
        model: {},
        range: {
            min: 0,
            max: 100
        },
        sliderOptions: {
            orientation: "horizontal",
            step: 1.0
        },
        invokers: {
            refreshView: {
                funcName: "fluid.textfieldSlider.refreshView",
                args: ["{that}"]
            }
        },
        renderOnInit: true
    });

    fluid.textfieldSlider.init = function (that) {
        that.applier.modelChanged.addListener(that.options.modelPath, function (newModel) {
            that.events.modelChanged.fire(fluid.get(newModel, that.options.modelPath));
        });

        if (that.options.renderOnInit) {
            that.refreshView();
        }
    };

    fluid.textfieldSlider.refreshView = function (that) {
        that.textfield.container.val(fluid.get(that.model, that.options.modelPath));
        that.events.afterRender.fire(that);
    };

    fluid.defaults("fluid.textfieldSlider.textfield", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        listeners: {
            onCreate: "fluid.textfieldSlider.textfield.init"
        },
        range: {} // should be used to specify the min, max range e.g. {min: 0, max: 100}
    });

    fluid.textfieldSlider.validateValue = function (model, modelPath, range, changeRequest) {
        var oldValue = fluid.get(model, modelPath);
        var newValue = changeRequest.value;

        var isValidNum = !isNaN(parseInt(newValue, 10));

        if (isValidNum) {
            if (newValue < range.min) {
                newValue = range.min;
            } else if (newValue > range.max) {
                newValue = range.max;
            }
            changeRequest.value = newValue;
        } else {
            changeRequest.value = oldValue;
        }
    };

    fluid.textfieldSlider.textfield.init = function (that) {
        that.applier.guards.addListener({path: that.options.modelPath, transactional: true}, function (model, changeRequest) {
            fluid.textfieldSlider.validateValue(model, that.options.modelPath, that.options.range, changeRequest);
        });

        that.container.change(function (source) {
            that.applier.requestChange(that.options.modelPath, source.target.value);
        });
    };

    fluid.defaults("fluid.textfieldSlider.slider", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        selectors: {
            thumb: ".ui-slider-handle"
        },
        events: {
            modelChanged: null
        },
        listeners: {
            onCreate: "fluid.textfieldSlider.slider.init"
        },
        range: {} // should be used to specify the min, max range e.g. {min: 0, max: 100}
    });

    // This will be removed once the jQuery UI slider has built in ARIA
    var initSliderAria = function (thumb, opts) {
        var ariaDefaults = {
            role: "slider",
            "aria-valuenow": opts.value,
            "aria-valuemin": opts.min,
            "aria-valuemax": opts.max
        };
        thumb.attr(ariaDefaults);
    };

    fluid.textfieldSlider.slider.init = function (that) {
        var value = fluid.get(that.model, that.options.modelPath) || null;

        // To support backwards compatability, the range data can still be store in the model.
        var sliderOptions = $.extend(true, {}, that.options.sliderOptions, that.model, that.options.range, {"value": value});

        that.slider = that.container.slider(sliderOptions);
        initSliderAria(that.locate("thumb"), sliderOptions);

        that.setSliderValue = function (value) {
            that.slider.slider("value", value);
        };

        that.setSliderAria = function (value) {
            that.locate("thumb").attr("aria-valuenow", value);
        };

        that.slider.bind("slide", function (e, ui) {
            that.applier.requestChange(that.options.modelPath, ui.value);
        });

        that.applier.modelChanged.addListener(that.options.modelPath, function (newModel) {
            var newValue = fluid.get(newModel, that.options.modelPath);

            that.setSliderValue(newValue);
            that.setSliderAria(newValue);
            that.events.modelChanged.fire(newValue);
        });

    };

})(jQuery, fluid_1_5);
