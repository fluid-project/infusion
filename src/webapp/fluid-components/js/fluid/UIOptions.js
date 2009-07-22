/*
Copyright 2008-2009 University of Toronto

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
                selection: {valuebinding: "selections.textFont"},
                optionlist: {valuebinding: "labelMap.textFont.values"},
                optionnames: {valuebinding: "labelMap.textFont.names"}
            },
            {
                ID: "font-min-size",
                selection: {valuebinding: "selections.textSize"},
                optionlist: {valuebinding: "labelMap.textSize.values"},
                optionnames: {valuebinding: "labelMap.textSize.names"}
            },
            {
                ID: "text-spacing",
                selection: {valuebinding: "selections.textSpacing"},
                optionlist: {valuebinding: "labelMap.textSpacing.values"},
                optionnames: {valuebinding: "labelMap.textSpacing.names"}
            },
            {
                ID: "contrast",
                selection: {valuebinding: "selections.contrast"},
                optionlist: {valuebinding: "labelMap.contrast.values"},
                optionnames: {valuebinding: "labelMap.contrast.names"}
            },
            {
                ID: "background-images",
                selection: {valuebinding: "selections.backgroundImages"},
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
                selection: {valuebinding: "selections.layout"},
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

    var initModels = function (that) {
        that.renderModel = that.options.renderModel;
        that.originalModel = fluid.copy(that.renderModel.selections);
        that.savedModel = that.options.savedSelections;
        $.extend(true, that.renderModel.selections, that.savedModel);                
        that.model = that.renderModel.selections;
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

        // TODO: This should probably be removed and use a renderer event instead.
        that.locate("controls").change(function () {
            var oldModel = $.extend(true, {}, that.model);
            that.events.modelChanged.fire(that.model, oldModel, that);
        });        
    };
    
    var initPreview = function (that) {
        var updatePreview = function (model) {
            var previewFrame = that.locate("previewFrame").contents();
            /**
             * Setimeout is temp fix for http://issues.fluidproject.org/browse/FLUID-2248
             */
            setTimeout(function(){
                fluid.applySkin(model, that.locate("preview", previewFrame)); 
            },0);
        };
        that.events.modelChanged.addListener(updatePreview);
        
        updatePreview(that.model);
    };
    
    var setupUIOptions = function (that) {
        initModels(that);
        var template = fluid.selfRender(that.container, fluid.copy(tree), {model: that.renderModel, autoBind: true, debugMode: true});
        bindHandlers(that);
        initPreview(that);    

        // Setup any registered decorators for the component.
        that.decorators = fluid.initSubcomponents(that, "componentDecorators", 
            [that, fluid.COMPONENT_OPTIONS]);
            
        return template;
    };
    
    fluid.uiOptions = function (container, options) {
        var that = fluid.initView("fluid.uiOptions", container, options);
        var template;
             
        that.save = function () {
            that.savedModel = fluid.copy(that.model);
            that.events.onSave.fire(that.model);
            fluid.applySkin(that.model);
        };

        that.reset = function () {
            $.extend(true, that.model, that.originalModel);
            that.refreshView();
        };
        
        that.cancel = function () {
            $.extend(true, that.model, that.savedModel);
            that.refreshView();            
            fluid.applySkin(that.model);
        };
        
        that.refreshView = function () {
            fluid.reRender(template, that.container, fluid.copy(tree), {model: that.renderModel, autoBind: true, debugMode: true});
            // TODO: this should not be necessary. 
            // We should fill in the tree with the handlers so that we don't need to rebind when we reRender
            bindHandlers(that);
            initPreview(that);    
        };
        
        that.updateModel = function (newModel, source) {
            var oldModel = fluid.copy(that.model);
            $.extend(true, that.model, newModel);
            that.events.modelChanged.fire(that.model, oldModel, source);
        };
        
        template = setupUIOptions(that);

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
            reset: ".fl-hook-preview-reset",
            cancel: ".fl-hook-preview-cancel"
        },
        events: {
            modelChanged: null,
            onSave: null,
            onCancel: null
        },
        savedSelections: {
            textFont: "Default",
            textSize: "Default",
            textSpacing: "Default",
            contrast: "Default",
            backgroundImages: "Default",
            layout: "Default"
        },
        renderModel: {
            selections: {
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
                    names: ["No Preference", "-3", "-2", "-1", "+1", "+2", "+3", "+4", "+5"],
                    values: ["0", "-3", "-2", "-1", "+1", "+2", "+3", "+4", "+5"]
                },
                textSpacing: {
                    names: ["No Preference", "Wide", "Wider", "Widest"],
                    values: ["Default", "Wide", "Wider", "Widest"]
                },
                contrast: {
                    names: ["Medium Contrast", "High Contrast", "Mist", "Rust"],
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

  