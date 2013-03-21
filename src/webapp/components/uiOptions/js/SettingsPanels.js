/*
Copyright 2009 University of Toronto
Copyright 2010-2011 OCAD University
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

var fluid_1_5 = fluid_1_5 || {};


(function ($, fluid) {

    /***********************************************
     * UI Options Select Dropdown Options Decorator*
     ***********************************************/
     
    fluid.registerNamespace("fluid.uiOptions.settingsPanel");

    fluid.defaults("fluid.uiOptions.settingsPanel", {
        gradeNames: ["fluid.rendererComponent", "fluid.uiOptions.modelRelay"],
        invokers: {
            refreshView: "{that}.renderer.refreshView"
        }
    });
    
    fluid.uiOptions.createSliderNode = function (that, path, type, options) {
        return {
            decorators: {
                type: "fluid",
                func: type,
                options: {
                    listeners: {
                        modelChanged: function (value) {
                            that.applier.requestChange(path, value);
                        }
                    },
                    model: {
                        min: that.options.min,
                        max: that.options.max,
                        value: fluid.get(that.model, path)
                        
                    },
                    sliderOptions: that.options.sliderOptions
                }
            }
        };
    };

    /*************************
     * UI Options Text Sizer *
     *************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "text size" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.textSizer", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            value: 1
        },
        min: 1,
        max: 2,
        sliderOptions: {
            orientation: "horizontal",
            step: 0.1
        },
        selectors: {
            textSize: ".flc-uiOptions-min-text-size",
        },
        produceTree: "fluid.uiOptions.textSizer.produceTree",
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-textSizer.html"
            }
        }
    });
    
    fluid.uiOptions.textSizer.produceTree = function (that) {
        return {
            textSize: fluid.uiOptions.createSliderNode(that, "value", "fluid.textfieldSlider")
        }
    };
    
    /************************
     * UI Options Text Font *
     ************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "text font" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.textFont", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            value: "default"
        },
        strings: {
            textFont: ["Default", "Times New Roman", "Comic Sans", "Arial", "Verdana"]
        },
        controlValues: { 
            textFont: ["default", "times", "comic", "arial", "verdana"]
        },
        selectors: {
            textFont: ".flc-uiOptions-text-font"
        },
        produceTree: "fluid.uiOptions.textFont.produceTree",
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-textFont.html"
            }
        }
    });
    
    fluid.uiOptions.textFont.produceTree = function (that) {
        // render drop down list box
        return {
            textFont: {
                optionnames: that.options.strings.textFont,
                optionlist: that.options.controlValues.textFont,
                selection: "${value}",
                decorators: {
                    type: "fluid",
                    func: "fluid.uiOptions.selectDecorator",
                    options: {
                        styles: that.options.classnameMap.textFont
                    }
                }
            }
        };
    };
    
    /**************************
     * UI Options Line Spacer *
     **************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "line spacing" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.lineSpacer", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            value: 1
        },
        min: 1,
        max: 2,
        sliderOptions: {
            orientation: "horizontal",
            step: 0.1
        },
        selectors: {
            lineSpacing: ".flc-uiOptions-line-spacing"
        },
        produceTree: "fluid.uiOptions.lineSpacer.produceTree",
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-lineSpacer.html"
            }
        }
    });
    
    fluid.uiOptions.lineSpacer.produceTree = function (that) {
        var tree = {
            lineSpacing: fluid.uiOptions.createSliderNode(that, "value", "fluid.textfieldSlider")
        };
        return tree;
    };
    
    /***********************
     * UI Options Contrast *
     ***********************/

    /**
     * A sub-component of fluid.uiOptions that renders the "contrast" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.contrast", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            value: "default"
        },
        strings: {
            theme: ["Default", "Black on white", "White on black", "Black on yellow", "Yellow on black"]
        },
        controlValues: { 
            theme: ["default", "bw", "wb", "by", "yb"]
        },
        selectors: {
            themeRow: ".flc-uiOptions-themeRow",
            themeLabel: ".flc-uiOptions-themeLabel",
            themeInput: ".flc-uiOptions-themeInput"
        },
        repeatingSelectors: ["themeRow"],
        produceTree: "fluid.uiOptions.contrast.produceTree",
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-contrast.html"
            }
        }
    });
    
    fluid.uiOptions.contrast.produceTree = function (that) {
        return {
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "themeRow",
                labelID: "themeLabel",
                inputID: "themeInput",
                selectID: "theme-radio",
                tree: {
                    optionnames: that.options.strings.theme,
                    optionlist: that.options.controlValues.theme,
                    selection: "${value}"//,
                    //decorators: {
                    //    type: "fluid",
                    //    func: "fluid.uiOptions.selectDecorator",
                    //    options: {
                    //        styles: that.options.classnameMap.theme
                    //    }
                    //}
                }
            }
        };
    };
    
    /******************************
     * UI Options Layout Controls *
     ******************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "layout and navigation" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.layoutControls", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            toc: false,
            layout: false
        },
        selectors: {
            layout: ".flc-uiOptions-layout",
            toc: ".flc-uiOptions-toc"
        },
        protoTree: {
            toc: "${toc}",
            layout: "${layout}"        
        },
        resources: {                    
            template: {
                url: "../html/UIOptionsTemplate-layout.html"
            }
        }
    });

    /*****************************
     * UI Options Links Controls *
     *****************************/
    /**
     * A sub-component of fluid.uiOptions that renders the "links and buttons" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.linksControls", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            links: false,
            inputsLarger: false
        },
        selectors: {
            links: ".flc-uiOptions-links",
            inputsLarger: ".flc-uiOptions-inputs-larger"
        },
        protoTree: {
            links: "${links}",
            inputsLarger: "${inputsLarger}"          
        },
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-links.html"
            }
        }
    });

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
            modelChanged: null
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
        finalInitFunction: "fluid.textfieldSlider.finalInit"
    });    
    
    fluid.textfieldSlider.finalInit = function (that) {

        that.refreshView = function () {
            var val = that.model.value;
            that.textfield.container.val(val);
        };
        
        // TODO: replace this with "model events relay" system.
        // problem: if we place these directly in "events", this will destroy all
        // existing events named "modelChanged".
        that.applier.modelChanged.addListener("value", 
            function (newModel) {
                that.events.modelChanged.fire(newModel.value);
            }
        );

        that.events.modelChanged.addListener(that.refreshView);

        that.refreshView();
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

    /************************************************
     * UI Options Select Dropdown Options Decorator *
     ************************************************/

    /**
     * A sub-component that decorates the options on the select dropdown list box with the css style
     */
    fluid.demands("fluid.uiOptions.selectDecorator", "fluid.uiOptions", {
        container: "{arguments}.0"
    });
    
    fluid.defaults("fluid.uiOptions.selectDecorator", {
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        finalInitFunction: "fluid.uiOptions.selectDecorator.finalInit",
        styles: {
            preview: "fl-preview-theme"
        }
    });
    
    fluid.uiOptions.selectDecorator.finalInit = function (that) {
        fluid.each($("option", that.container), function (option) {
            var styles = that.options.styles;
            $(option).addClass(styles.preview + " " + styles[fluid.value(option)]);
        });
    };

})(jQuery, fluid_1_5);
