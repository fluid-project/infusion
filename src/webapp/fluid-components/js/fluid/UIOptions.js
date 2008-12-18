/*
Copyright 2008 University of Toronto
Copyright 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_0_7*/

fluid_0_7 = fluid_0_7 || {};

(function ($, fluid) {
    
    // glue between UI and model (skin)
    // introduces assumption that radio buttons are used        
    var getSetting = function (control) {
        return $("input:checked", control).eq(0).attr("value"); 
    };

    var setSetting = function (control, value) {
        var input = $("[value=" + value + "]", control);
        input.attr("checked", true);        
    };
    
    var pullModelFromView = function (that) {
        var skin = that.model.value;
        skin.textSize = getSetting(that.locate("textSizeCtrl"));
        skin.textFont = getSetting(that.locate("fontCtrl"));
        skin.textSpacing = getSetting(that.locate("textSpacingCtrl"));
        skin.colorScheme = getSetting(that.locate("colorCtrl"));
        skin.layout = getSetting(that.locate("layoutCtrl"));
    };    
    
    var pushModelToView = function (that) {
        var skin = that.model.value;
        setSetting(that.locate("textSizeCtrl"), skin.textSize);
        setSetting(that.locate("fontCtrl"), skin.textFont);
        setSetting(that.locate("textSpacingCtrl"), skin.textSpacing);
        setSetting(that.locate("colorCtrl"), skin.colorScheme);
        setSetting(that.locate("layoutCtrl"), skin.layout);
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
        
        that.locate("options").click(function () {
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
             
        that.save = function () {
            that.events.onSave.fire(that.model.value);
            fluid.applySkin(that.model.value);
        };
        
        that.refreshView = function () {
            pushModelToView(that);
        };
        
        that.updateModel = function (newValue, source) {
            var oldModel = $.extend(true, {}, that.model);
            that.model.value = newValue;
            that.events.modelChanged.fire(that.model, oldModel, source);
            that.refreshView();
        };
        
        setupUIOptions(that);
        return that;   
    };

    fluid.defaults("fluid.uiOptions", {
        selectors: {
            textSizeCtrl: ".textsize-control",
            textSpacingCtrl: ".textspace-control",
            fontCtrl: ".font-control",
            colorCtrl: ".color-control",
            layoutCtrl: ".layout-control",
            options: "input",
            tocCtrl: ".toc-control",
            preview: ".preview", 
            previewFrame : ".previewFrame",
            save: ".save"
        },
        events: {
            modelChanged: null,
            onSave: null,
            onCancel: null
        }
    });

})(jQuery, fluid_0_7);

  