/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_0_8*/

fluid_0_8 = fluid_0_8 || {};

(function ($, fluid) {
    
    // TODO: Generate this tree
    var tree = {
        children: [
            {
                ID: "font-style",
                selection: {valuebinding: "selectedOptions.textFont"},
                optionlist: {valuebinding: "labelMap.textFont.values"},
                optionnames: {valuebinding: "labelMap.textFont.names"}
            },
            {
                ID: "font-min-size",
                valuebinding: "selectedOptions.textSize"
            },
            {
                ID: "text-spacing",
                valuebinding: "selectedOptions.textSpacing"
            },
            {
                ID: "contrast",
                selection: {valuebinding: "selectedOptions.contrast"},
                optionlist: {valuebinding: "labelMap.contrast.values"},
                optionnames: {valuebinding: "labelMap.contrast.names"}
            },
            {
                ID: "background-images",
                selection: {valuebinding: "selectedOptions.backgroundImages"},
                optionlist: {valuebinding: "labelMap.backgroundImages.values"},
                optionnames: {valuebinding: "labelMap.backgroundImages.names"}
            },
            {
                ID: "background-images-row:",
                children: [
                    {
                        ID: "images-choice",
                        choiceindex: 0,
                        parentRelativeID: "..::background-images"
                    },
                    {
                        ID: "images-label",
                        choiceindex: 0,
                        parentRelativeID: "..::background-images"
                    }
                ]
            },
            {
                ID: "background-images-row:",
                children: [
                    {
                        ID: "images-choice",
                        choiceindex: 1,
                        parentRelativeID: "..::background-images"
                    },
                    {
                        ID: "images-label",
                        choiceindex: 1,
                        parentRelativeID: "..::background-images"
                    }
                ]
            },
            {
                ID: "layout",
                selection: {valuebinding: "selectedOptions.layout"},
                optionlist: {valuebinding: "labelMap.layout.values"},
                optionnames: {valuebinding: "labelMap.layout.names"}
            },
            {
                ID: "layout-row:",
                children: [
                    {
                        ID: "layout-choice",
                        choiceindex: 0,
                        parentRelativeID: "..::layout"
                    },
                    {
                        ID: "layout-label",
                        choiceindex: 0,
                        parentRelativeID: "..::layout"
                    }
                ]
            },
            {
                ID: "layout-row:",
                children: [
                    {
                        ID: "layout-choice",
                        choiceindex: 1,
                        parentRelativeID: "..::layout"
                    },
                    {
                        ID: "layout-label",
                        choiceindex: 1,
                        parentRelativeID: "..::layout"
                    }
                ]
            }
        ]
    };

    var initModel = function (that) {
        that.model = {value: {}};
        that.model.value = that.renderModel.selectedOptions;
        that.originalModel = fluid.copy(that.model);

    };
    
    var bindHandlers = function (that) {
        that.locate("save").click(function () {
            that.save();
        });
        
        that.locate("reset").click(function () {
            that.reset();
        });

        // TODO: This should probably be removed and use a renderer event instead.
        that.locate("controls").change(function () {
            var oldModel = $.extend(true, {}, that.model);
            that.events.modelChanged.fire(that.model, oldModel, that);
        });        
    };
    
    var initPreview = function (that) {
        that.events.modelChanged.addListener(function (model) {
            var previewFrame = that.locate("previewFrame").contents();
            fluid.applySkin(model.value, that.locate("preview", previewFrame)); 
        });
    };
    
    var setupUIOptions = function (that) {
        initModel(that);
        bindHandlers(that);
        initPreview(that);    

        // Setup any registered decorators for the component.
        that.decorators = fluid.initSubcomponents(that, "componentDecorators", 
            [that, fluid.COMPONENT_OPTIONS]);

    };
    
    fluid.uiOptions = function (container, options) {
        var that = fluid.initView("fluid.uiOptions", container, options);
        that.renderModel = that.options.renderModel;
        var template = fluid.selfRender(that.container, tree, {model: that.renderModel, autoBind: true, debugMode: true});
             
        that.save = function () {
            that.events.onSave.fire(that.model.value);
            fluid.applySkin(that.model.value);
        };

        that.reset = function () {
            that.model.value = that.originalModel;
            that.refreshView();
        };
        
        that.refreshView = function () {
            fluid.reRender(template, that.container, tree, {model: that.renderModel, autoBind: true, debugMode: true});
        };
        
        that.updateModel = function (newValue, source) {
            var oldModel = $.extend(true, {}, that.model);
            that.model.value = newValue;
            that.events.modelChanged.fire(that.model, oldModel, source);
        };
        
        setupUIOptions(that);

        return that;   
    };

    fluid.defaults("fluid.uiOptions", {
        selectors: {
            textSizeCtrl: ".fl-hook-font-size",
            textSpacingCtrl: ".fl-hook-font-spacing",
            fontCtrl: ".fl-hook-font-face",
            colorCtrl: ".fl-hook-color",
            layoutCtrl: ".fl-hook-layout",
            controls: ".control",
            tocCtrl: ".toc-control",
            preview: ".fl-hook-preview-content", 
            previewFrame : ".fl-hook-preview-frame",
            save: ".fl-hook-preview-save",
            reset: ".fl-hook-preview-reset"
        },
        events: {
            modelChanged: null,
            onSave: null,
            onCancel: null
        }, 
        renderModel: {
            selectedOptions: {
                textFont: "Default",
                textSize: "Default",
                textSpacing: "Default",
                contrast: "Default",
                backgroundImages: "Default",
                layout: "Default"
            },
            labelMap: {
                textFont: {
                    names: ["No Preference", "Serif", "Sans-Serif", "Ariel", "Verdana", "Courier", "Times"],
                    values: ["Default", "Serif", "Sans-Serif", "Ariel", "Verdana", "Courier", "Times"]
                },
                textSize: {
                    values: ["0", "-3", "-2", "-1", "+1", "+2", "+3", "+4", "+5"]
                },
                textSpacing: {
                    values: ["Default", "Wide", "Wider", "Widest"]
                },
                contrast: {
                    names: ["No Preference", "High Contrast", "Mist", "Rust"],
                    values: ["Default", "High Contrast", "Mist", "Rust"]
                },
                backgroundImages: {
                    names: ["Yes", "No"],
                    values: ["Default", "No Images"]
                },
                layout: {
                    names: ["Yes", "No"],
                    values: ["Simple", "Default"]
                }
            }
        }
    });

})(jQuery, fluid_0_8);

  