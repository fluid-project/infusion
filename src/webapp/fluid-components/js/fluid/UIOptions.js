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

    var createSkin = function (that) {
        // glue between UI and model (skin)
        // will go away with use of the renderer
        var skin = {};
        skin.textSize = selectedSetting(that.locate("textSizeCtrl"));
        skin.textFont = selectedSetting(that.locate("fontCtrl"));
        skin.textSpacing = selectedSetting(that.locate("textSpacingCtrl"));
        skin.colorScheme = selectedSetting(that.locate("colorCtrl"));

        return skin;
    };
    
    fluid.uiOptions = function (container, options) {
        if (!container) {
            fluid.fail("UI Options initialised with no container");
        }
        var that = fluid.initView("fluid.uiOptions", container, options);
        
        that.locate("save").click(function () {
            // TODO: save event needs to be dispatched
            that.skin = createSkin(that);
            fluid.applySkin(that.skin);
        });
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
            optionSelector: "input",    // This one is special in that it is relative to the option control instead of the main container
            tocCtrl: ".toc-control",
            preview: ".preview", 
            save: ".save"
        },
        events: {
            onPrefChange: null,
            afterPreview: null,
            onSave: null,
            onCancel: null
        }
    });

})(jQuery, fluid_0_6);

  