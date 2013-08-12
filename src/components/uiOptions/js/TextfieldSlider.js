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


/********************
 * Textfield Slider *
 ********************/

fluid.defaults("fluid.textfieldSlider", {
    gradeNames: ["fluid.viewComponent", "autoInit"],
    components: {
        textfield: {
            type: "fluid.textfieldSlider.textfield",
            container: "{textfieldSlider}.dom.textfield",
            options: {
                model: "{textfieldSlider}.model",
                range: "{textfieldSlider}.options.range",
                applier: "{textfieldSlider}.applier"
            }
        },
        slider: {
            type: "fluid.textfieldSlider.slider",
            container: "{textfieldSlider}.dom.slider",
            options: {
                model: "{textfieldSlider}.model",
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
        modelChanged: "{that}.refreshView"
    },
    model: {
        value: null
    },
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
    finalInitFunction: "fluid.textfieldSlider.finalInit",
    renderOnInit: true
});

fluid.textfieldSlider.finalInit = function (that) {

    that.applier.modelChanged.addListener("value", function (newModel) {
        that.events.modelChanged.fire(newModel.value);
    });

    if (that.options.renderOnInit) {
        that.refreshView();
    }
};

fluid.textfieldSlider.refreshView = function (that) {
    that.textfield.container.val(that.model.value);
    that.events.afterRender.fire(that);
};

fluid.defaults("fluid.textfieldSlider.textfield", {
    gradeNames: ["fluid.viewComponent", "autoInit"],
    listeners: {
        onCreate: {
            listener: "fluid.textfieldSlider.textfield.init",
            args: "{that}"
        }
    },
    range: {} // should be used to specify the min, max range e.g. {min: 0, max: 100}
});

fluid.textfieldSlider.validateValue = function (model, range, changeRequest) {
    var oldValue = model.value;
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
    that.applier.guards.addListener({path: "value", transactional: true}, function (model, changeRequest) {
        fluid.textfieldSlider.validateValue(model, that.options.range, changeRequest);
    });

    that.container.change(function (source) {
        that.applier.requestChange("value", source.target.value);
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
        onCreate: {
            listener: "fluid.textfieldSlider.slider.init",
            args: "{that}"
        }
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
    // To support backwards compatability, the range data can still be store in the model.
    var sliderOptions = $.extend(true, {}, that.options.sliderOptions, that.model, that.options.range);

    that.slider = that.container.slider(sliderOptions);
    initSliderAria(that.locate("thumb"), sliderOptions);

    that.setSliderValue = function (value) {
        that.slider.slider("value", value);
    };

    that.setSliderAria = function (value) {
        that.locate("thumb").attr("aria-valuenow", value);
    };

    that.slider.bind("slide", function (e, ui) {
        that.applier.requestChange("value", ui.value);
    });

    that.applier.modelChanged.addListener("value", function (newModel) {
        that.setSliderValue(newModel.value);
        that.setSliderAria(newModel.value);
        that.events.modelChanged.fire(newModel.value);
    });

};