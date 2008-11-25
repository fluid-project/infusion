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
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    
    // glue between UI and model (skin)
    // introduces assumption that radio buttons are used        
    var getSetting = function (control) {
        return $("input:checked", control).eq(0).attr("value"); 
    };

    var setSetting = function (control, value) {
        var input = $("[value=" + value + "]", control);
        input.click();        
    };
    
    var pullModelFromView = function (that) {
        that.model.textSize = getSetting(that.locate("textSizeCtrl"));
        that.model.textFont = getSetting(that.locate("fontCtrl"));
        that.model.textSpacing = getSetting(that.locate("textSpacingCtrl"));
        that.model.colorScheme = getSetting(that.locate("colorCtrl"));
        that.model.layout = getSetting(that.locate("layoutCtrl"));
    };    
    
    var pushModelToView = function (that) {
        setSetting(that.locate("textSizeCtrl"), that.model.textSize);
        setSetting(that.locate("fontCtrl"), that.model.textFont);
        setSetting(that.locate("textSpacingCtrl"), that.model.textSpacing);
        setSetting(that.locate("colorCtrl"), that.model.colorScheme);
        setSetting(that.locate("layoutCtrl"), that.model.layout);
    };
    
    var updateSkin = function (that) {
        pullModelFromView(that);
        that.events.modelChanged.fire(that.model);
    };

    var initModel = function (that) {
        that.model = {};
        pullModelFromView(that);
    };
    
    var bindHandlers = function (that) {
        that.locate("save").click(function () {
            that.save();
        });
        
        that.locate("options").change(function () {
            updateSkin(that);
        });        
    };
    
    var initPreview = function (that) {
        that.events.modelChanged.addListener(function (skin) {
            fluid.applySkin(skin, that.locate("preview")); 
        });        
    };
    
    var setupUIOptions = function (that) {
        initModel(that);
        bindHandlers(that);
        initPreview(that);    
    };
    
    fluid.uiOptions = function (container, options) {
        var that = fluid.initView("fluid.uiOptions", container, options);
             
        that.save = function () {
            that.events.onSave.fire(that.model);
            fluid.applySkin(that.model);
        };
        
        that.refreshView = function () {
            pushModelToView(that);
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
            save: ".save"
        },
        events: {
            modelChanged: null,
            onSave: null,
            onCancel: null
        }
    });

})(jQuery, fluid_0_6);

  