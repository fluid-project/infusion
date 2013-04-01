/*
Copyright 2009 University of Toronto
Copyright 2010-2013 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

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
                applier: "{textfieldSlider}.applier"
            }
        },
        slider: {
            type: "fluid.textfieldSlider.slider",
            container: "{textfieldSlider}.dom.slider",
            options: {
                model: "{textfieldSlider}.model",
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
        value: null,
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
    
    that.applier.modelChanged.addListener("value", 
        function (newModel) {
            that.events.modelChanged.fire(newModel.value);
        }
    );

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
    finalInitFunction: "fluid.textfieldSlider.textfield.finalInit"
});

fluid.textfieldSlider.validateValue = function (model, changeRequest, applier) {
    var oldValue = model.value;
    var newValue = changeRequest.value;
    
    var isValidNum = !isNaN(parseInt(newValue, 10));

    if (isValidNum) {
        if (newValue < model.min) {
            newValue = model.min;
        } else if (newValue > model.max) {
            newValue = model.max;
        }
        changeRequest.value = newValue;
    } else {
        changeRequest.value = oldValue;
    }
};

fluid.textfieldSlider.textfield.finalInit = function (that) {
    that.applier.guards.addListener({path: "value", transactional: true}, fluid.textfieldSlider.validateValue);
    
    that.container.change(function (source) {
        that.applier.requestChange("value", source.target.value);
    });
};

fluid.defaults("fluid.textfieldSlider.slider", {
    gradeNames: ["fluid.viewComponent", "autoInit"],
    finalInitFunction: "fluid.textfieldSlider.slider.finalInit",
    selectors: {
        thumb: ".ui-slider-handle"
    },
    events: {
        modelChanged: null
    }
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

fluid.textfieldSlider.slider.finalInit = function (that) {
    var sliderOptions = $.extend(true, {}, that.options.sliderOptions, that.model);
    
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
    
    that.applier.modelChanged.addListener("value", 
        function (newModel) {
            that.setSliderValue(newModel.value);
            that.setSliderAria(newModel.value);
            that.events.modelChanged.fire(newModel.value);
        }
    );
    
};