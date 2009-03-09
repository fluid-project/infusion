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
    
    var initTextboxSlider = function (that) {
        var textbox = that.locate("textbox");

        var sliderOptions = that.options.sliderOptions;
        sliderOptions.value = that.model;
        var slider = that.locate("slider").slider(sliderOptions);

        textbox.change(function () {
            slider.slider("value", this.value);
            that.updateModel(this.value, this);
        });

        slider.bind("slide", function (e, ui) {
            textbox.val(ui.value);
            that.updateModel(ui.value, slider);
        });
    };
    
    fluid.textboxSlider = function (container, options) {
        var that = fluid.initView("fluid.textboxSlider", container, options);
        that.model = that.locate("textbox").val();
        initTextboxSlider(that);
        
        that.updateModel = function (model, source) {
            that.events.modelChanged.fire(model, that.model, source);
            that.model = model;
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
            min: 6,
            max: 200,
            orientation: "horizontal"
        }
    });
    
})(jQuery, fluid_1_0);


/**************
 * UI Options *
 **************/

(function ($, fluid) {

//    TODO
//    - handle enter in the textbox - currently it causes the page to reload
//    - fix the test that is throwing an error (the issue is the preview not loading because the path is hardcoded in the template)
//    - make the preview a subcomponent
//    - generate the renderer tree
//    - document the API
//    - constrain the size that can be entered in the text box
//    - merge user options to the textslider into other options.
//    - write tests for textboxSlider
//    - add the min font size textboxSlider to the renderer tree

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
                    valuebinding: "selections.contrast"
                },
                optionlist: {
                    valuebinding: "labelMap.contrast.values"
                },
                optionnames: {
                    valuebinding: "labelMap.contrast.names"
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
            }]
        };
    };
    
    // TODO: FLUID-2293: Implement multi-levels of undo in the UndoManager
    var initModels = function (that) {
        that.originalModel = that.options.originalSettings;
        that.savedModel = that.options.savedSelections;
        that.model = fluid.copy(that.savedModel);
    };
    
    var bindHandlers = function (that) {
        that.locate("save").click(function () {
            that.save();
        });
        
        that.locate("reset").click(function () {
            that.reset();
        });

        that.locate("cancel").click(function () {
            that.cancel();
        });

        // TODO: This should probably be removed and use a renderer decorator instead.
        that.locate("controls").change(function () {
            // This is strange - old model and new model are the same. 
            that.events.modelChanged.fire(that.model, that.model, that);
        });
        
    };
    
    // TODO: Make the preview a subcomponent
    var initPreview = function (that) {
        var previewFrame = that.locate("previewFrame");
        var previewEnhancer;
        
        var updatePreview = function (model) {
            /**
             * Setimeout is temp fix for http://issues.fluidproject.org/browse/FLUID-2248
             */
            setTimeout(function () {
                previewEnhancer.applySkin(model); 
            }, 0);
        };

        previewFrame.load(function () {
            var previewFrameContents = previewFrame.contents();
            var preview = that.locate("preview", previewFrameContents);
            previewEnhancer = fluid.uiEnhancer(preview);
            updatePreview(that.model);
        });        
        
        that.events.modelChanged.addListener(updatePreview);
        
    };
    
    var createRenderOptions = function (that) {
        return {
            model: {
                selections: that.model,
                labelMap: that.options.labelMap
            },
            autoBind: true, 
            debugMode: true
        };
    };
    
    var setupUIOptions = function (that) {
        initModels(that);
        
        // TODO: This stuff should already be in the renderer tree
        that.events.afterRender.addListener(function () {
            fluid.initSubcomponents(that, "fontMinSize", 
                        [that.options.selectors.fontMinSize, 
                            {
                                listeners: {
                                    modelChanged: function (value) {
                                        var uiOptionsModel = fluid.copy(that.model);
                                        uiOptionsModel.textSize = value;
                                        that.updateModel(uiOptionsModel);
                                    }
                                }
                        }]);

            bindHandlers(that);
            initPreview(that);        
        });
        
        var rendererOptions = createRenderOptions(that);
        var template = fluid.selfRender(that.container, generateTree(that, rendererOptions.model), rendererOptions);
        that.events.afterRender.fire();

        // Setup any registered decorators for the component.
        that.decorators = fluid.initSubcomponents(that, "componentDecorators", 
            [that, fluid.COMPONENT_OPTIONS]);
            
        return template;
    };
    
    fluid.uiOptions = function (container, options) {
        var that = fluid.initView("fluid.uiOptions", container, options);
        that.uiEnhancer = fluid.uiEnhancer(that.locate("enhanceContainer", "html"));
        var template;
             
        that.save = function () {
            that.events.onSave.fire(that.model);
            that.savedModel = fluid.copy(that.model);
            that.uiEnhancer.applySkin(that.model);
        };

        that.reset = function () {
            that.updateModel(fluid.copy(that.originalModel), that);
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
            preview: ".fl-hook-preview-content", 
            previewFrame : ".fl-hook-preview-frame",
            save: ".fl-hook-preview-save",
            reset: ".fl-hook-preview-reset",
            cancel: ".fl-hook-preview-cancel",
            enhanceContainer: "body",
            fontMinSize: ".fl-control-min_text_size"
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
            contrast: "Default",
            backgroundImages: "Default",
            layout: "Default",
            toc: "Default"
        },
        originalSettings: {
            textFont: "Default",
            textSpacing: "Default",
            contrast: "Default",
            backgroundImages: "Default",
            layout: "Default",
            toc: "Default"
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
            contrast: {
                names: ["Standard", "Medium Contrast", "High Contrast", "High Contrast Inverted", "Low Contrast"],
                values: ["Default", "Medium Contrast", "High Contrast", "High Contrast Inverted", "Low Contrast"]
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
                values: ["On", "Default"]
            }
        },
        fontMinSize: {
            type: "fluid.textboxSlider"
        }
    });

})(jQuery, fluid_1_0);

  