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
    
    var easierToSeeModel = fluid.copy(fluid.skin.model);

    var tree = {
        children: [
            {
                ID: "font-style",
                selection: {valuebinding: "textFont.selection"},
                optionlist: {valuebinding: "textFont.values"},
                optionnames: {valuebinding: "textFont.names"}
            },
            {
                ID: "font-min-size",
                valuebinding: "textSize.value"
            },
            {
                ID: "text-spacing",
                valuebinding: "textSpacing.value"
            },
            {
                ID: "contrast",
                selection: {valuebinding: "contrast.selection"},
                optionlist: {valuebinding: "contrast.values"},
                optionnames: {valuebinding: "contrast.names"}
            },
            {
                ID: "background-images",
                selection: {valuebinding: "backgroundImages.selection"},
                optionlist: {valuebinding: "backgroundImages.values"},
                optionnames: {valuebinding: "backgroundImages.names"}
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
                selection: {valuebinding: "layout.selection"},
                optionlist: {valuebinding: "layout.values"},
                optionnames: {valuebinding: "layout.names"}
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
        
    var pullSkinFromModel = function (that) {
        var skin = that.model.value;
        skin.textSize = easierToSeeModel.textSize.value;
        skin.textFont = easierToSeeModel.textFont.selection;
        skin.textSpacing = easierToSeeModel.textSpacing.value;
        skin.colorScheme = easierToSeeModel.contrast.selection;
        skin.layout = easierToSeeModel.layout.selection;
    };    
            
    var updateSkin = function (that) {
        var oldModel = $.extend(true, {}, that.model);

        pullSkinFromModel(that);
        that.events.modelChanged.fire(that.model, oldModel, that);
    };

    var initModel = function (that) {
        that.model = {value: {}};
        pullSkinFromModel(that);
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

  