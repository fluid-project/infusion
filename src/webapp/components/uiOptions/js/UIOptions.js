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
                    applier: "{textfieldSlider}.applier"
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
            orientation: "horizontal"
        }, 
        finalInitFunction: "fluid.textfieldSlider.finalInit"
    });    
    
    fluid.textfieldSlider.finalInit = function (that) {
        // initialize slider
        var sliderOptions = $.extend(true, {}, that.options.sliderOptions, that.model);
        
        that.slider.initSlider(sliderOptions);

        that.refreshView = function () {
            var val = that.model.value;
            
            that.textfield.container.val(val);
            that.slider.setSliderValue(val);
            that.slider.setSliderAria(val);
        };
        
        that.applier.modelChanged.addListener("value", 
            function (newModel) {
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

    var validateValue = function (model, changeRequest, applier) {
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
        that.applier.guards.addListener({path: "value", transactional: true}, validateValue);
        
        that.container.change(function (source) {
            that.applier.requestChange("value", source.target.value);
        });
    };

    fluid.defaults("fluid.textfieldSlider.slider", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.textfieldSlider.slider.finalInit",
        selectors: {
            thumb: ".ui-slider-handle"
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
    
    fluid.textfieldSlider.slider.finalInit = function (that) {       
        that.slider = that.container.slider(that.model);
        
        that.initSlider = function (sliderOptions) {
            var slider = that.slider.slider(sliderOptions);
            initSliderAria(that.locate("thumb"), sliderOptions);
        };
        
        that.setSliderValue = function (value) {
            that.slider.slider("value", value);
        };
        
        that.setSliderAria = function (value) {
            that.locate("thumb").attr("aria-valuenow", value);
        };
        
        that.slider.bind("slide", function (e, ui) {
            that.applier.requestChange("value", ui.value);
        });
    };

})(jQuery, fluid_1_4);


/**************
 * UI Options *
 **************/

(function ($, fluid) {

    /**
     * Update the change applier of sub-component fluid.uiOptions.controls to set 
     * the value of "selections" array that is mapped with selections on user preferences.
     * 
     * This method is used by both fluid.uiOptions and fluid.uiOptions.controls
     * 
     * @param {Object} controls - fluid.uiOptions.controls
     * @param {Object} model - an array of selections on user preferences
     */
    var setSelections = function (that, model) {
        that.applier.requestChange("selections", model);
    
        // Turn the boolean select values into strings so they can be properly bound and rendered
        // TODO: there must be a better way to do this
        that.applier.requestChange("selections.toc", String(that.model.selections.toc));
        that.applier.requestChange("selections.backgroundImages", String(that.model.selections.backgroundImages));
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
            uiEnhancer: "{uiEnhancer}",
            textControls: {
                type: "fluid.uiOptions.textControls",
                container: "{uiOptions}.dom.textControls",
                createOnEvent: "onUIOptionsTemplateReady",
                options: {
                    textSize: "{uiOptions}.options.textSize",
                    lineSpacing: "{uiOptions}.options.lineSpacing",
                    model: "{uiOptions}.model",
                    applier: "{uiOptions}.applier"
                }
            },
            layoutControls: {
                type: "fluid.uiOptions.layoutControls",
                container: "{uiOptions}.dom.layoutControls",
                createOnEvent: "onUIOptionsTemplateReady",
                options: {
                    model: "{uiOptions}.model",
                    applier: "{uiOptions}.applier"
                }
            },
            linksControls: {
                type: "fluid.uiOptions.linksControls",
                container: "{uiOptions}.dom.linksControls",
                createOnEvent: "onUIOptionsTemplateReady",
                options: {
                    model: "{uiOptions}.model",
                    applier: "{uiOptions}.applier"
                }
            },
            preview: {
                type: "fluid.uiOptions.preview",
                createOnEvent: "onReady"
            },
            settingsStore: "{uiEnhancer}.settingsStore",
        },
        defaultSiteSettings: "{uiEnhancer}.defaultSiteSettings",
        savedSelections: "{uiEnhancer}.model",
        textSize: {
            min: 6,
            max: 30
        },
        lineSpacing: {
            min: 1,
            max: 10
        },
        selectors: {
            textControls: ".flc-uiOptions-text-controls",
            layoutControls: ".flc-uiOptions-layout-controls",
            linksControls: ".flc-uiOptions-links-controls",
            cancel: ".flc-uiOptions-cancel",
            reset: ".flc-uiOptions-reset",
            save: ".flc-uiOptions-save",
            previewFrame : ".flc-uiOptions-preview-frame"
        },
        events: {
            onReady: null,
            onSave: null,
            onCancel: null,
            onReset: null,
            modelChanged: null,
            onUIOptionsTemplateReady: null
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

        setSelections(that, fluid.copy(that.options.savedSelections));
         
        /**
         * Saves the current model and fires onSave
         */ 
        that.save = function () {
            that.events.onSave.fire(that.model.selections);
            that.options.savedSelections = fluid.copy(that.model.selections); 
            that.uiEnhancer.applier.requestChange("", that.options.savedSelections);
            that.settingsStore.save(that.model.selections);
        };

        /**
         * Resets the selections to the integrator's defaults and fires onReset
         */
        that.reset = function () {
            that.events.onReset.fire();
            that.updateModel(fluid.copy(that.options.defaultSiteSettings));
            that.refreshControlsView();
        };
        
        /**
         * Resets the selections to the last saved selections and fires onCancel
         */
        that.cancel = function () {
            that.events.onCancel.fire();
            that.updateModel(fluid.copy(that.options.savedSelections));
            that.refreshControlsView();            
        };
        
        /**
         * Updates the change applier and fires modelChanged on subcomponent fluid.uiOptions.controls
         * 
         * @param {Object} newModel
         * @param {Object} source
         */
        // TODO: this is badly named - it only updates the selections part of the model
        that.updateModel = function (newModel) {
            setSelections(that, newModel);
        };
        
        that.refreshControlsView = function () {
            that.textControls.refreshView();
            that.layoutControls.refreshView();
            that.linksControls.refreshView();
        };
        
        that.applier.modelChanged.addListener("selections",
            function (newModel, oldModel, changeRequest) {
                that.events.modelChanged.fire(newModel, oldModel, changeRequest.source);
            }
        );
            
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
            that.events.onUIOptionsTemplateReady.fire();
            that.events.onReady.fire();
        });

    };
    
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
        mergeSiteDefaults(that.options, that.options.defaultSiteSettings);
        
        fluid.each(that.options.controlValues, function (item, key) {
            that.applier.requestChange("labelMap." + key, {
                values: that.options.controlValues[key],
                names: that.options.strings[key]
            });
        });
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
    
    fluid.uiOptions.controlsFinalInit = function (that) {
        initModel(that);

        /**
         * Rerenders the UI
         */
        that.refreshView = function () {
            that.renderer.refreshView();
        };
        
        fluid.fetchResources(that.options.resources, function () {
            that.container.append(that.options.resources.template.resourceText);
            that.refreshView();
        });        
    };
    
    /****************************
     * UI Options Text Controls *
     ****************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "text and display" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.textControls", {
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        strings: {
            textFont: ["Serif", "Sans-Serif", "Arial", "Verdana", "Courier", "Times"],
            textSpacing: ["Regular", "Wide", "Wider", "Widest"],
            theme: ["Low Contrast", "Medium Contrast", "Medium Contrast Grey Scale", "High Contrast", "High Contrast Inverted"]
        },
        controlValues: { 
            textFont: ["serif", "sansSerif", "arial", "verdana", "courier", "times"],
            textSpacing: ["default", "wide1", "wide2", "wide3"],
            theme: ["lowContrast", "default", "mediumContrast", "highContrast", "highContrastInverted"]
        },
        selectors: {
            textFont: ".flc-uiOptions-text-font",
            textSpacing: ".flc-uiOptions-text-spacing",
            theme: ".flc-uiOptions-theme",
            textSize: ".flc-uiOptions-min-text-size",
            lineSpacing: ".flc-uiOptions-line-spacing"
        },
        finalInitFunction: "fluid.uiOptions.controlsFinalInit",
        produceTree: "fluid.uiOptions.textControls.produceTree",
        resources: {
            template: {
                forceCache: true,
                url: "../html/UIOptionsTemplate-text.html"
            }
        },
        defaultSiteSettings: "{uiOptions}.options.defaultSiteSettings"
    });

    fluid.uiOptions.textControls.produceTree = function (that) {
        var tree = {};
        
        for (var item in that.model.selections) {
            if (item === "textFont" || item === "textSpacing" || item === "theme") {
                // render drop down list box
                tree[item] = {
                    optionnames: "${labelMap." + item + ".names}",
                    optionlist: "${labelMap." + item + ".values}",
                    selection: "${selections." + item + "}"
                };
            }
            else if (item === "textSize" || item === "lineSpacing") {
                    // textfield sliders
                    tree[item] = createSliderNode(that, item);
                }
        }
        
        return tree;
    };

    /******************************
     * UI Options Layout Controls *
     ******************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "layout and navigation" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.layoutControls", {
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        strings: {
            backgroundImages: ["Yes", "No"],
            layout: ["Yes", "No"],
            toc: ["Yes", "No"]
        },
        controlValues: { 
            backgroundImages: ["true", "false"],
            layout: ["simple", "default"],
            toc: ["true", "false"]
        },
        selectors: {
            "backgroundImagesRowID:": ".flc-uiOptions-background-images-row",
            backgroundImagesInputID: ".flc-uiOptions-background-images-choice",
            backgroundImagesLabelID: ".flc-uiOptions-background-images-label",
            "layoutRowID:": ".flc-uiOptions-layout-row",
            layoutInputID: ".flc-uiOptions-layout-choice",
            layoutLabelID: ".flc-uiOptions-layout-label",
            "tocRowID:": ".flc-uiOptions-toc-row",
            tocInputID: ".flc-uiOptions-toc-choice",
            tocLabelID: ".flc-uiOptions-toc-label"
        },
        finalInitFunction: "fluid.uiOptions.controlsFinalInit",
        produceTree: "fluid.uiOptions.layoutControls.produceTree",
        resources: {
            template: {
                forceCache: true,
                url: "../html/UIOptionsTemplate-layout.html"
            }
        },
        defaultSiteSettings: "{uiOptions}.options.defaultSiteSettings"
    });

    fluid.uiOptions.layoutControls.produceTree = function (that) {
        var tree = {};
        var radiobuttons = [];
        
        for (var item in that.model.selections) {
            if (item === "backgroundImages" || item === "layout" || item === "toc") {
                // render radio buttons
                radiobuttons.push(createRadioButtonNode(item));
            }
        }
        
        tree.expander = radiobuttons;
        
        return tree;
    };

    /*****************************
     * UI Options Links Controls *
     *****************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "links and buttons" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.linksControls", {
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        selectors: {
            lineSpacing: ".flc-uiOptions-line-spacing",
            linksUnderline: ".flc-uiOptions-links-underline",
            linksBold: ".flc-uiOptions-links-bold",
            linksLarger: ".flc-uiOptions-links-larger",
            inputsLarger: ".flc-uiOptions-inputs-larger"
        },
        finalInitFunction: "fluid.uiOptions.controlsFinalInit",
        produceTree: "fluid.uiOptions.linksControls.produceTree",
        resources: {
            template: {
                forceCache: true,
                url: "../html/UIOptionsTemplate-links.html"
            }
        },
        defaultSiteSettings: "{uiOptions}.options.defaultSiteSettings"

    });

    fluid.uiOptions.linksControls.produceTree = function (that) {
        var tree = {};
        
        for (var item in that.model.selections) {
            if (item === "linksUnderline" || item === "linksBold" || item === "linksLarger" || item === "inputsLarger") {
                // render check boxes
                tree[item] = "${selections." + item + "}";
            }
        }

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
                    savedSettings: "{uiOptions}.model.selections",
                    tableOfContents: "{uiEnhancer}.options.tableOfContents", 
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
                    "{uiOptions}.model.selections"
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
                that.enhancer.applier.requestChange("", selections);
            }
        }, 0);
    };
    
    fluid.uiOptions.preview.finalInit = function (that) {
        that.container.attr("src", that.options.templateUrl);        

        that.container.load(function () {
            that.enhancerContainer = $("body", that.container.contents());
            that.events.onReady.fire();
        });
    };

    fluid.demands("fluid.uiOptions.preview", ["fluid.uiOptions", "fluid.uiOptions.textControls"], {
        args: [
            "{uiOptions}.dom.previewFrame",
            "{options}"
        ]
    });
    
    fluid.demands("fluid.uiEnhancer", "fluid.uiOptions.preview", {
        funcName: "fluid.uiEnhancer",
        args: [
            "{preview}.enhancerContainer",
            "{options}"
        ]
    });
    
    /***
     * Event binder binds events between UI Options and the Preview
     */
    fluid.defaults("fluid.uiOptions.preview.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });
    
    fluid.demands("fluid.uiOptions.preview.eventBinder", ["fluid.uiOptions.preview", "fluid.uiOptions.textControls"], {
        options: {
            listeners: {
                "{uiOptions}.events.modelChanged": "{preview}.updateModel"
            }
        }
    });
})(jQuery, fluid_1_4);
