/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};


/******************
 * Textfield Slider *
 ******************/

(function ($, fluid) {

    fluid.defaults("fluid.textfieldSlider", {
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        components: {
            textfield: {
                type: "fluid.textfieldSlider.textfield"
            },
            slider: {
                type: "fluid.textfieldSlider.slider"
            }
        },
        selectors: {
            textfield: ".flc-textfieldSlider-field",
            slider: ".flc-textfieldSlider-slider",
            thumb: ".ui-slider-handle"
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
            orientation: "horizontal"
        }, 
        finalInitFunction: "fluid.textfieldSlider.finalInit",
        invokers: {
            refreshView: {
                funcName: "fluid.textfieldSlider.refreshView",
                args: ["{textfieldSlider}", "{textfield}", "{slider}.slider"]
            }
        }
    });    
    
    // This will be removed once the jQuery UI slider has built in ARIA 
    var initSliderAria = function (thumb, opts) {
        var ariaDefaults = {
            role: 'slider',
            "aria-valuenow": opts.value,
            "aria-valuemin": opts.min, 
            "aria-valuemax": opts.max    
        };
        thumb.attr(ariaDefaults);        
    };
    
    fluid.textfieldSlider.refreshView = function (textfieldSlider, textfield, slider) {
        var val = textfieldSlider.model.value;
        
        textfield.container.val(val);
        slider.slider("value", val);
        textfieldSlider.dom.locate("thumb").attr("aria-valuenow", val);
    };
    
    fluid.textfieldSlider.finalInit = function (that) {
        // initialize slider
        var sliderOptions = that.options.sliderOptions;
        sliderOptions.value = that.model.value;
        sliderOptions.min = that.model.min;
        sliderOptions.max = that.model.max;
        
        var slider = that.locate("slider").slider(sliderOptions);
        initSliderAria(that.locate("thumb"), sliderOptions);

        that.applier.modelChanged.addListener("value", 
            function (newModel, oldModel, changeRequest) {
                // update preview window
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

    fluid.textfieldSlider.textfield.finalInit = function (that) {
        that.container.change(function () {
            var value = this.value; 
            var isValid = !(isNaN(parseInt(value, 10)) || isNaN(value));

            if (isValid) {
                if (value < that.model.min) {
                    value = that.model.min;
                } else if (value > that.model.max) {
                    value = that.model.max;
                }
                
                that.applier.requestChange("value", value);
            } else {
                that.container.val(that.model.value);
            }
        });
    };

    fluid.demands("fluid.textfieldSlider.textfield", "fluid.textfieldSlider", {
        container: "{textfieldSlider}.dom.textfield",
        options: {
            model: "{textfieldSlider}.model",
            applier: "{textfieldSlider}.applier"
        }
    });

    fluid.defaults("fluid.textfieldSlider.slider", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.textfieldSlider.slider.finalInit"
    });
    
    fluid.textfieldSlider.slider.finalInit = function (that) {       
        that.slider = that.container.slider(that.model);
        
        that.slider.bind("slide", function (e, ui) {
            that.applier.requestChange("value", ui.value);
        });
    };

    fluid.demands("fluid.textfieldSlider.slider", "fluid.textfieldSlider", {
        container: "{textfieldSlider}.dom.slider",
        options: {
            model: "{textfieldSlider}.model",
            applier: "{textfieldSlider}.applier"
        }
    });

})(jQuery, fluid_1_4);


/**************
 * UI Options *
 **************/

(function ($, fluid) {

//    TODO
//    - pull the strings out of the template and put them into the component?

    /**
     * Update the change applier of sub-component fluid.uiOptions.controls to set 
     * the value of "selections" array that is mapped with selections on user preferences.
     * 
     * This method is used by both fluid.uiOptions and fluid.uiOptions.controls
     * 
     * @param {Object} controls - fluid.uiOptions.controls
     * @param {Object} model - an array of selections on user preferences
     */
    var setControlsChangeApplier = function (controls, model) {
        controls.applier.requestChange("selections", model);
    
        // Turn the boolean select values into strings so they can be properly bound and rendered
        controls.applier.requestChange("selections.toc", String(controls.model.selections.toc));
        controls.applier.requestChange("selections.backgroundImages", String(controls.model.selections.backgroundImages));
    };
    
        
    /**************
     * UI Options *
     **************/

    /**
     * A component that works in conjunction with the UI Enhancer component and the Fluid Skinning System (FSS) 
     * to allow users to set personal user interface preferences. The UI Options component provides a user 
     * interface for setting and saving personal preferences, and the UI Enhancer component carries out the 
     * work of applying those preferences to the user interface.
     * 
     * @param {Object} container
     * @param {Object} options
     */
    fluid.defaults("fluid.uiOptions", {
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        components: {
            controls: {
                type: "fluid.uiOptions.controls",
                priority: "first",
                container: "{uiOptions}.dom.controls",
                createOnEvent: "onReady",
                options: {
                    uiEnhancer: "{uiOptions}.uiEnhancer",
                    textSize: "{uiOptions}.options.textSize",
                    lineSpacing: "{uiOptions}.options.lineSpacing"
                }
            },
            preview: {
                type: "fluid.uiOptions.preview",
                createOnEvent: "onReady"
            }
        },
        textSize: {
            min: 6,
            max: 30
        },
        lineSpacing: {
            min: 1,
            max: 10
        },
        selectors: {
            controls: ".flc-uiOptions-controls",
            cancel: ".flc-uiOptions-cancel",
            reset: ".flc-uiOptions-reset",
            save: ".flc-uiOptions-save",
            previewFrame : ".flc-uiOptions-preview-frame"
        },
        events: {
            onReady: null,
            onSave: null,
            onCancel: null,
            onReset: null
        },
        finalInitFunction: "fluid.uiOptions.finalInit",
        resources: {
            template: {
                forceCache: true,
                url: "../html/UIOptions.html"
            }
        }
    });
    
    fluid.uiOptions.finalInit = function (that) {

        that.uiEnhancer = $(document).data("uiEnhancer");
        
        var savedModel = that.uiEnhancer.model;
 
        /**
         * Saves the current model and fires onSave
         */ 
        that.save = function () {
            that.events.onSave.fire(that.controls.model.selections);
            savedModel = fluid.copy(that.controls.model.selections); 
            that.uiEnhancer.updateModel(savedModel);
        };

        /**
         * Resets the selections to the integrator's defaults and fires onReset
         */
        that.reset = function () {
            that.events.onReset.fire();
            that.updateControlsModel(fluid.copy(that.uiEnhancer.defaultSiteSettings));
            that.controls.refreshView();
        };
        
        /**
         * Resets the selections to the last saved selections and fires onCancel
         */
        that.cancel = function () {
            that.events.onCancel.fire();
            that.updateControlsModel(fluid.copy(savedModel));
            that.controls.refreshView();            
        };
        
        /**
         * Updates the change applier and fires modelChanged on subcomponent fluid.uiOptions.controls
         * 
         * @param {Object} newModel
         * @param {Object} source
         */
        that.updateControlsModel = function (newModel) {
            that.controls.events.modelChanged.fire(newModel, that.controls.model.selections, that.controls);
            setControlsChangeApplier(that.controls, newModel);
        };
        
        var bindHandlers = function (that) {
            var saveButton = that.locate("save");
            saveButton.click(that.save);
            that.locate("reset").click(that.reset);
            that.locate("cancel").click(that.cancel);
            var form = fluid.findForm(saveButton);
            $(form).submit(function () {
                that.save();
            });
        };
        
        fluid.fetchResources(that.options.resources, function () {
            that.container.append(that.options.resources.template.resourceText);
            bindHandlers(that);
            that.events.onReady.fire();
        });

    };
    
    /***********************
     * UI Options Controls *
     ***********************/

    /**
     * A sub-component of fluid.uiOptions that renders the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.controls", {
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        strings: {
            textFont: ["Serif", "Sans-Serif", "Arial", "Verdana", "Courier", "Times"],
            textSpacing: ["Regular", "Wide", "Wider", "Widest"],
            theme: ["Low Contrast", "Medium Contrast", "Medium Contrast Grey Scale", "High Contrast", "High Contrast Inverted"],
            backgroundImages: ["Yes", "No"],
            layout: ["Yes", "No"],
            toc: ["Yes", "No"]
        },
        controlValues: { 
            textFont: ["serif", "sansSerif", "arial", "verdana", "courier", "times"],
            textSpacing: ["default", "wide1", "wide2", "wide3"],
            theme: ["lowContrast", "default", "mediumContrast", "highContrast", "highContrastInverted"],
            backgroundImages: ["true", "false"],
            layout: ["simple", "default"],
            toc: ["true", "false"]
        },
        selectors: {
            textFont: ".flc-uiOptions-text-font",
            textSpacing: ".flc-uiOptions-text-spacing",
            theme: ".flc-uiOptions-theme",
            "backgroundImagesRowID:": ".flc-uiOptions-background-images-row",
            backgroundImagesInputID: ".flc-uiOptions-background-images-choice",
            backgroundImagesLabelID: ".flc-uiOptions-background-images-label",
            "layoutRowID:": ".flc-uiOptions-layout-row",
            layoutInputID: ".flc-uiOptions-layout-choice",
            layoutLabelID: ".flc-uiOptions-layout-label",
            "tocRowID:": ".flc-uiOptions-toc-row",
            tocInputID: ".flc-uiOptions-toc-choice",
            tocLabelID: ".flc-uiOptions-toc-label",
            textSize: ".flc-uiOptions-min-text-size",
            lineSpacing: ".flc-uiOptions-line-spacing",
            linksUnderline: ".flc-uiOptions-links-underline",
            linksBold: ".flc-uiOptions-links-bold",
            linksLarger: ".flc-uiOptions-links-larger",
            inputsLarger: ".flc-uiOptions-inputs-larger"
        },
        events: {
            afterRender: null,
            modelChanged: null
        },
        rendererOptions: {
            autoBind: true
        },
        finalInitFunction: "fluid.uiOptions.controls.finalInit",
        produceTree: "fluid.uiOptions.controls.produceTree"
    });

    var mergeSiteDefaults = function (options, siteDefaults) {
        for (var settingName in options.controlValues) {
            var setting = String(siteDefaults[settingName]);
            var settingValues = options.controlValues[settingName];
            
            if (setting) {
                var index = $.inArray(setting, settingValues);
                if (index === -1) {
                    var defaultIndex = $.inArray("default", settingValues);
                    if (defaultIndex === -1) {
                        settingValues.push(setting);
                    } else {
                        settingValues[defaultIndex] = setting;
                    }
                }
            }
        }
    };
    
    var initModel = function (that) {
        mergeSiteDefaults(that.options, that.options.uiEnhancer.defaultSiteSettings);
        
        fluid.each(that.options.controlValues, function (item, key) {
            that.applier.requestChange("labelMap." + key, {
                values: that.options.controlValues[key],
                names: that.options.strings[key]
            });
        });
    };
    
    fluid.uiOptions.controls.finalInit = function (that) {
        initModel(that);
        setControlsChangeApplier(that, fluid.copy(that.options.uiEnhancer.model));

        /**
         * Rerenders the UI and fires afterRender
         */
        that.refreshView = function () {
            that.renderer.refreshView();
            that.events.afterRender.fire();
        };
        
        that.applier.modelChanged.addListener("selections",
            function (newModel, oldModel, changeRequest) {
                that.events.modelChanged.fire(newModel, oldModel, changeRequest.source);
            }
        );
            
        that.refreshView();
    };

    var createRadioButtonNode = function (item) {
        return {
            type: "fluid.renderer.selection.inputs", 
            inputID: item + "InputID",
            tree: {
                optionnames: "${labelMap." + item + ".names}",
                optionlist: "${labelMap." + item + ".values}",
                selection: "${selections." + item + "}"
            },
            rowID: item + "RowID",
            selectID: item,
            labelID: item + "LabelID"
        };
    };
    
    var createSliderNode = function (that, item) {
        return {
            decorators: {
                type: "fluid",
                func: "fluid.textfieldSlider",
                options: {
                    listeners: {
                        modelChanged: function (value) {
                            that.applier.requestChange("selections." + item, value);
                        }
                    },
                    model: {
                        min: that.options[item].min,
                        max: that.options[item].max,
                        value: that.model.selections[item]
                    }
                }
            }
        };
    };
    
    fluid.uiOptions.controls.produceTree = function (that) {
        var tree = {};
        var radiobuttons = [];
        
        for (var item in that.model.selections) {
            if (item === "backgroundImages" || item === "layout" || item === "toc") {
                // render radio buttons
                radiobuttons.push(createRadioButtonNode(item));
            } else if (item === "textFont" || item === "textSpacing" || item === "theme") {
                // render drop down list box
                tree[item] = {
                    optionnames: "${labelMap." + item + ".names}",
                    optionlist: "${labelMap." + item + ".values}",
                    selection: "${selections." + item + "}"
                };
            } else if (item === "textSize" || item === "lineSpacing") {
                // textfield sliders
                tree[item] = createSliderNode(that, item);                        
            } else {
                // render check boxes
                tree[item] = "${selections." + item + "}";
            }
        }

        tree.expander = radiobuttons;
        
        return tree;
    };

    
    /**********************
     * UI Options Preview *
     **********************/

    fluid.defaults("fluid.uiOptions.preview", {
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        components: {
            enhancer: {
                type: "fluid.uiEnhancer",
                createOnEvent: "onReady",
                options: {
                    savedSettings: "{controls}.model.selections",
                    tableOfContents: "{controls}.options.uiEnhancer.options.tableOfContents", // TODO: Tidy this up when the page's UI Enhancer is IoC-visible.
                    settingsStore: {
                        type: "fluid.uiEnhancer.tempStore"
                    }
                }
            },
            eventBinder: {
                type: "fluid.uiOptions.preview.eventBinder",
                createOnEvent: "onReady"
            }
        },
        invokers: {
            updateModel: {
                funcName: "fluid.uiOptions.preview.updateModel",
                args: [
                    "{preview}",
                    "{controls}.model.selections"
                ]
            }
        },
        finalInitFunction: "fluid.uiOptions.preview.finalInit",
        events: {
            onReady: null
        },
        
        templateUrl: "UIOptionsPreview.html"
    });
    
    fluid.uiOptions.preview.updateModel = function (that, selections) {
        /**
         * Setimeout is temp fix for http://issues.fluidproject.org/browse/FLUID-2248
         */
        setTimeout(function () {
            if (that.enhancer) {
                that.enhancer.updateModel(selections);
            }
        }, 0);
    };
    
    fluid.uiOptions.preview.finalInit = function (that) {
        that.container.attr("src", that.options.templateUrl);        

        that.container.load(function () {
            that.previewFrameContents = that.container.contents();
            that.events.onReady.fire();
        });
    };

    fluid.demands("fluid.uiOptions.preview", ["fluid.uiOptions", "fluid.uiOptions.controls"], {
        args: [
            "{uiOptions}.dom.previewFrame",
            "{options}"
        ]
    });
    
    fluid.demands("fluid.uiEnhancer", "fluid.uiOptions.preview", {
        funcName: "fluid.uiEnhancer",
        args: [
            "{preview}.previewFrameContents",
            "{options}"
        ]
    });
    
    /***
     * Event binder binds events between UI Options and the Preview
     */
    fluid.defaults("fluid.uiOptions.preview.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });
    
    fluid.demands("fluid.uiOptions.preview.eventBinder", ["fluid.uiOptions.preview", "fluid.uiOptions.controls"], {
        options: {
            listeners: {
                "{controls}.events.modelChanged": "{preview}.updateModel"
            }
        }
    });
})(jQuery, fluid_1_4);
