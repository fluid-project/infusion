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
    // will go away with use of the renderer
    // introduces assumption that radio buttons are used        
    var selectedSetting = function (control) {
        var checked = $("input:checked", control);
        return checked.eq(0).attr("value"); 
    };

    var updateSkin = function (that) {
        // glue between UI and model (skin)
        // will go away with use of the renderer
        that.model.textSize = selectedSetting(that.locate("textSizeCtrl"));
        that.model.textFont = selectedSetting(that.locate("fontCtrl"));
        that.model.textSpacing = selectedSetting(that.locate("textSpacingCtrl"));
        that.model.colorScheme = selectedSetting(that.locate("colorCtrl"));
        
        that.events.afterSkinChange.fire(that.model);
    };
    
    var initPreviewView = function (that) {
        that.events.afterSkinChange.addListener(function (skin) {
            fluid.applySkin(skin, that.locate("preview")); 
        });        
    };
    
    var bindHandlers = function (that) {
        that.locate("save").click(function () {
            that.events.onSave.fire(that.model);
            fluid.applySkin(that.model);
        });
        
        that.locate("options").click(function () {
            updateSkin(that);
        });        
    };
    
    fluid.uiOptions = function (container, options) {
        if (!container) {
            fluid.fail("UI Options initialised with no container");
        }
        var that = fluid.initView("fluid.uiOptions", container, options);
        that.model = that.options.skin;
        
        bindHandlers(that);
        initPreviewView(that);
    };

    fluid.defaults("fluid.uiOptions", {
        skin: {
            textSize: "Default",
            textFont: "Default",
            textSpacing: "Default",
            colorScheme: "Mist"
        },
        selectors: {
            textSizeCtrl: ".textsize-control",
            textSpacingCtrl: ".textspace-control",
            fontCtrl: ".font-control",
            colorCtrl: ".color-control",
            options: "input",
            tocCtrl: ".toc-control",
            preview: ".preview", 
            save: ".save"
        },
        events: {
            afterSkinChange: null,
            afterPreview: null,
            onSave: null,
            onCancel: null
        }
    });

})(jQuery, fluid_0_6);

  