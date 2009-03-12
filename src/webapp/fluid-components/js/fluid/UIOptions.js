/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_0*/

fluid_1_0 = fluid_1_0 || {};


/******************
 * Textbox Slider *
 ******************/

(function ($, fluid) {
    
//    TODO
//    - do something when someone tries to modify the model with a value out of range.
    
    var initTextboxSlider = function (that) {
        var textbox = that.locate("textbox");

        var sliderOptions = that.options.sliderOptions;
        sliderOptions.value = that.model;
        sliderOptions.min = that.options.min;
        sliderOptions.max = that.options.max;
        var slider = that.locate("slider").slider(sliderOptions);

        textbox.change(function () {
            if (this.value < that.min) {
                this.value = that.min;
            } else if (this.value > that.max) {
                this.value = that.max;
            }
            
            if (that.isInRange(this.value)) {
                slider.slider("value", this.value);
                that.updateModel(this.value, this);
            } else { 
                // handle invalid entry
                this.value = that.model;
            }
        });
        
        textbox.keypress(function (evt) {
            if (evt.keyCode !== $.ui.keyCode.ENTER) {
                return true;
            }
            return false;
        });

        slider.bind("slide", function (e, ui) {
            textbox.val(ui.value);
            that.updateModel(ui.value, slider);
        });
    };
    
    fluid.textboxSlider = function (container, options) {
        var that = fluid.initView("fluid.textboxSlider", container, options);
        that.model = that.locate("textbox").val();
        that.min = that.options.min;
        that.max = that.options.max;
        
        initTextboxSlider(that);
        
        that.isInRange = function (value) {
            return (value >= that.min && value <= that.max);
        };
        
        that.updateModel = function (model, source) {
            if (that.isInRange(model)) {
                that.events.modelChanged.fire(model, that.model, source);
                that.model = model;
            } else {
                // TODO: should do something here
                // Throw an error
            }
        };
        
        return that;
    };

    fluid.defaults("fluid.textboxSlider", {
        selectors: {
            textbox: ".fl-textbox",
            slider: ".fl-slider"
        },
        events: {
            modelChanged: null
        },
        sliderOptions: {
            orientation: "horizontal"
        }, 
        min: 0,
        max: 100        
    });
    
})(jQuery, fluid_1_0);


/**************
 * UI Options *
 **************/

(function ($, fluid) {

//    TODO
//    - fix the test that is throwing an error (the issue is the preview not loading because the path is hardcoded in the template)
//    - make the preview a subcomponent
//    - generate the renderer tree
//    - document the API
//    - add the min font size textboxSlider to the renderer tree
//    - pull the strings out of the template and put them into the component?

    // TODO: Generate this tree
    var generateTree = function (that, rendererModel) {
        return {
        
            children: [{
                ID: "font-style",
                selection: {
                    valuebinding: "selections.textFont"
                },
                optionlist: {
                    valuebinding: "labelMap.textFont.values"
                },
                optionnames: {
                    valuebinding: "labelMap.textFont.names"
                }
            }, {
                ID: "text-spacing",
                selection: {
                    valuebinding: "selections.textSpacing"
                },
                optionlist: {
                    valuebinding: "labelMap.textSpacing.values"
                },
                optionnames: {
                    valuebinding: "labelMap.textSpacing.names"
                }
            }, {
                ID: "contrast",
                selection: {
                    valuebinding: "selections.theme"
                },
                optionlist: {
                    valuebinding: "labelMap.theme.values"
                },
                optionnames: {
                    valuebinding: "labelMap.theme.names"
                }
            }, {
                ID: "background-images",
                selection: {
                    valuebinding: "selections.backgroundImages"
                },
                optionlist: {
                    valuebinding: "labelMap.backgroundImages.values"
                },
                optionnames: {
                    valuebinding: "labelMap.backgroundImages.names"
                }
            }, {
                ID: "background-images-row:",
                children: [{
                    ID: "images-choice",
                    choiceindex: 0,
                    parentRelativeID: "..::background-images"
                }, {
                    ID: "images-label",
                    choiceindex: 0,
                    parentRelativeID: "..::background-images"
                }]
            }, {
                ID: "background-images-row:",
                children: [{
                    ID: "images-choice",
                    choiceindex: 1,
                    parentRelativeID: "..::background-images"
                }, {
                    ID: "images-label",
                    choiceindex: 1,
                    parentRelativeID: "..::background-images"
                }]
            }, {
                ID: "layout",
                selection: {
                    valuebinding: "selections.layout"
                },
                optionlist: {
                    valuebinding: "labelMap.layout.values"
                },
                optionnames: {
                    valuebinding: "labelMap.layout.names"
                }
            }, {
                ID: "layout-row:",
                children: [{
                    ID: "layout-choice",
                    choiceindex: 0,
                    parentRelativeID: "..::layout"
                }, {
                    ID: "layout-label",
                    choiceindex: 0,
                    parentRelativeID: "..::layout"
                }]
            }, {
                ID: "layout-row:",
                children: [{
                    ID: "layout-choice",
                    choiceindex: 1,
                    parentRelativeID: "..::layout"
                }, {
                    ID: "layout-label",
                    choiceindex: 1,
                    parentRelativeID: "..::layout"
                }]
            }, {
                ID: "toc",
                selection: {
                    valuebinding: "selections.toc"
                },
                optionlist: {
                    valuebinding: "labelMap.toc.values"
                },
                optionnames: {
                    valuebinding: "labelMap.toc.names"
                }
            }, {
                ID: "toc-row:",
                children: [{
                    ID: "toc-choice",
                    choiceindex: 0,
                    parentRelativeID: "..::toc"
                }, {
                    ID: "toc-label",
                    choiceindex: 0,
                    parentRelativeID: "..::toc"
                }]
            }, {
                ID: "toc-row:",
                children: [{
                    ID: "toc-choice",
                    choiceindex: 1,
                    parentRelativeID: "..::toc"
                }, {
                    ID: "toc-label",
                    choiceindex: 1,
                    parentRelativeID: "..::toc"
                }]
            }, {
                ID: "links-larger",
                valuebinding: "selections.linksLarger" /*,
                decorators: [{
                    type: "jQuery",
                    func: "change",
                    args: function () {
                        alert(that.model.linksLarger);
                    }
                }]*/
                
            }]
        };
    };
    
    // TODO: FLUID-2293: Implement multi-levels of undo in the UndoManager
    var initModels = function (that) {
        that.defaultModel = that.options.settings;
        that.savedModel = that.options.savedSelections;
        that.model = fluid.copy(that.savedModel);
    };
    
    var bindHandlers = function (that) {
        that.locate("save").click(that.save);
        that.locate("reset").click(that.reset);
        that.locate("cancel").click(that.cancel);

        // TODO: This should probably be removed and use a renderer decorator instead.
        that.locate("controls").change(function () {
            // This is strange - old model and new model are the same. 
            // Need the DAR applier so we can hook in before the model changes otherwise we don't have the old model
            that.events.modelChanged.fire(that.model, that.model, that);
        });
        
    };
    
    var initPreview = function (that) {
        var previewFrame = that.locate("previewFrame");
        var previewEnhancer;
        
        that.events.modelChanged.addListener(function (model) {
            /**
             * Setimeout is temp fix for http://issues.fluidproject.org/browse/FLUID-2248
             */
            setTimeout(function () {
                previewEnhancer.updateModel(model); 
            }, 0);
        });

        previewFrame.load(function () {
            var previewFrameContents = previewFrame.contents();
            var options = {
                settings: that.model
            };
            previewEnhancer = fluid.uiEnhancer(previewFrameContents, options);
        });        
        
    };
    
    var createRenderOptions = function (that) {
        // Turn the boolean values into strings so they bind properly
        that.model.toc = String(that.model.toc);
        
        
        that.model.linksLarger = that.model.linksLarger;

        return {
            model: {
                selections: that.model,
                labelMap: that.options.labelMap
            },
            autoBind: true, 
            debugMode: true
       //     renderRaw: true
        };
    };
    
    var initTextMinSize = function (that) {
        var options = {
            listeners: {
                modelChanged: function (value) {
                    that.model.textSize = value;
                    that.updateModel(that.model);
                }
            }
        };
        
        fluid.merge(null, options, that.options.textMinSize.options);
        fluid.initSubcomponents(that, "textMinSize", [that.options.selectors.textMinSizeCtrl, options]);
        
    };
    
    var setupUIOptions = function (that) {
        initModels(that);
        var options = {
            settings: that.model
        };
        that.uiEnhancer = fluid.uiEnhancer(document, options);

        // TODO: This stuff should already be in the renderer tree
        that.events.afterRender.addListener(function () {
            initTextMinSize(that);

            bindHandlers(that);
            initPreview(that);        
        });
        
        var rendererOptions = createRenderOptions(that);
        var template = fluid.selfRender(that.container, generateTree(that, rendererOptions.model), rendererOptions);
        that.events.afterRender.fire();
            
        return template;
    };
    
    fluid.uiOptions = function (container, options) {
        var that = fluid.initView("fluid.uiOptions", container, options);
        var template;
             
        that.save = function () {
            that.events.onSave.fire(that.model);
            that.savedModel = fluid.copy(that.model);
            that.uiEnhancer.updateModel(that.model);
        };

        that.reset = function () {
            that.updateModel(fluid.copy(that.defaultModel), that);
            that.refreshView();
        };
        
        that.cancel = function () {
            that.updateModel(fluid.copy(that.savedModel), that);
            that.refreshView();            
        };
        
        that.refreshView = function () {
            var rendererOptions = createRenderOptions(that);

            fluid.reRender(template, that.container, generateTree(that, rendererOptions.model), rendererOptions);
            that.events.afterRender.fire();
        };
        
        that.updateModel = function (newModel, source) {
            that.events.modelChanged.fire(newModel, that.model, source);
            that.model = newModel;
        };
        
        template = setupUIOptions(that);

        return that;   
    };

    fluid.defaults("fluid.uiOptions", {
        selectors: {
            controls: ".control",
            textMinSizeCtrl: ".fl-control-min_text_size",
            cancel: ".fl-hook-preview-cancel",
            reset: ".fl-hook-preview-reset",
            save: ".fl-hook-preview-save",
            previewFrame : ".fl-hook-preview-frame"
        },
        events: {
            modelChanged: null,
            onSave: null,
            onCancel: null,
            afterRender: null
        },
        // TODO: use a merge policy instead of specifying savedSelections
        savedSelections: {
            textFont: "Default",
            textSpacing: "Default",
            theme: "Default",
            backgroundImages: "Default",
            layout: "Default",
            toc: false,
            linksLarger: false
        },
        settings: {
            textFont: "Default",
            textSpacing: "Default",
            theme: "Default",
            backgroundImages: "Default",
            layout: "Default",
            toc: false,
            linksLarger: false
        },
        labelMap: {
            textFont: {
                names: ["No Preference", "Serif", "Sans-Serif", "Ariel", "Verdana", "Courier", "Times"],
                values: ["Default", "Serif", "Sans-Serif", "Ariel", "Verdana", "Courier", "Times"]
            },
            textSpacing: {
                names: ["No Preference", "Wide", "Wider", "Widest"],
                values: ["Default", "Wide", "Wider", "Widest"]
            },
            theme: {
                names: ["Low Contrast", "Medium Contrast", "Medium Contrast Grey Scale", "High Contrast", "High Contrast Inverted"],
                values: ["Low Contrast", "Default", "Medium Contrast", "High Contrast", "High Contrast Inverted"]
            },
            backgroundImages: {
                names: ["Yes", "No"],
                values: ["Default", "No Images"]
            },
            layout: {
                names: ["Yes", "No"],
                values: ["Simple", "Default"]
            },
            toc: {
                names: ["Yes", "No"],
                values: ["true", "false"]
            }
        },
        textMinSize: {
            type: "fluid.textboxSlider",
            options: {
                min: 6,
                max: 200
            }
        }
    });

})(jQuery, fluid_1_0);

  