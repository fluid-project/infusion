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
    
    var easierToSeeModel = {
        fontStyleModel: {
            names: ["No Preference", "Serif", "Sans-Serif"],
            values: ["Default", "Serif", "Sans-Serif"],
            selection: "Default"
        },
        fontMinSizeModel: {
            value: "Default"
        },
        textSpacingModel: {
            value: "Default"
        },
        contrastModel: {
            names: ["No Preference", "High Contrast", "Mist"],
            values: ["Default", "High Contrast", "Mist"],
            selection: "Default"
        },
        backgroundImagesModel: {
            names: ["Yes", "No"],
            values: ["yes", "no"],
            selection: "yes"
        },
        layoutModel: {
            names: ["Yes", "No"],
            values: ["yes", "no"],
            selection: "no"
        }
    };
    
    var tree = {
        children: [
            {
                ID: "font-style",
                selection: {valuebinding: "fontStyleModel.selection"},
                optionlist: {valuebinding: "fontStyleModel.values"},
                optionnames: {valuebinding: "fontStyleModel.names"}
            },
            {
                ID: "font-min-size",
                valuebinding: "fontMinSizeModel.value"
            },
            {
                ID: "text-spacing",
                valuebinding: "textSpacingModel.value"
            },
            {
                ID: "contrast",
                selection: {valuebinding: "contrastModel.selection"},
                optionlist: {valuebinding: "contrastModel.values"},
                optionnames: {valuebinding: "contrastModel.names"}
            },
            {
                ID: "background-images",
                selection: {valuebinding: "backgroundImagesModel.selection"},
                optionlist: {valuebinding: "backgroundImagesModel.values"},
                optionnames: {valuebinding: "backgroundImagesModel.names"}
            },
            {
                ID: "background-images-row:",
                children: [
                    {
                        ID: "images-choice",
                         choiceindex:0,
                         parentRelativeID: "..::background-images"
                    },
                    {
                        ID: "images-label",
                         choiceindex:0,
                         parentRelativeID: "..::background-images"
                    }
                ]
            },
            {
                ID: "background-images-row:",
                children: [
                    {
                        ID: "images-choice",
                         choiceindex:1,
                         parentRelativeID: "..::background-images"
                    },
                    {
                        ID: "images-label",
                         choiceindex:1,
                         parentRelativeID: "..::background-images"
                    }
                ]
            },
            {
                ID: "layout",
                selection: {valuebinding: "layoutModel.selection"},
                optionlist: {valuebinding: "layoutModel.values"},
                optionnames: {valuebinding: "layoutModel.names"}
            },
            {
                ID: "layout-row:",
                children: [
                    {
                        ID: "layout-choice",
                         choiceindex:0,
                         parentRelativeID: "..::layout"
                    },
                    {
                        ID: "layout-label",
                         choiceindex:0,
                         parentRelativeID: "..::layout"
                    }
                ]
            },
            {
                ID: "layout-row:",
                children: [
                    {
                        ID: "layout-choice",
                         choiceindex:1,
                         parentRelativeID: "..::layout"
                    },
                    {
                        ID: "layout-label",
                         choiceindex:1,
                         parentRelativeID: "..::layout"
                    }
                ]
            }
        ]
    };
        
    var pullModelFromView = function (that) {
        var skin = that.model.value;
        skin.textSize = easierToSeeModel.fontMinSizeModel.value;
        skin.textFont = easierToSeeModel.fontStyleModel.selection;
        skin.textSpacing = easierToSeeModel.textSpacingModel.value;
        skin.colorScheme = easierToSeeModel.contrastModel.selection;
        skin.layout = easierToSeeModel.layoutModel.selection;
    };    
            
    var updateSkin = function (that) {
        var oldModel = $.extend(true, {}, that.model);

        pullModelFromView(that);
        that.events.modelChanged.fire(that.model, oldModel, that);
    };

    var initModel = function (that) {
        that.model = {value: {}};
        pullModelFromView(that);
    };
    
    var bindHandlers = function (that) {
        that.locate("save").click(function () {
            that.save();
        });
        
        that.locate("controls").change(function () {
            updateSkin(that);
        });        
    };
    
    var initPreview = function (that) {
        that.events.modelChanged.addListener(function (model) {
            var previewFrame = that.locate("previewFrame").contents();
            fluid.applySkin(model.value, that.locate("preview",previewFrame)); 
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
        fluid.selfRender(that.container, tree, {model: easierToSeeModel, autoBind: true, debugMode: true});
             
        that.save = function () {
            that.events.onSave.fire(that.model.value);
            fluid.applySkin(that.model.value);
        };

        that.refreshView = function () {
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
            save: ".fl-hook-preview-save"
        },
        events: {
            modelChanged: null,
            onSave: null,
            onCancel: null
        }
    });

})(jQuery, fluid_0_8);

  