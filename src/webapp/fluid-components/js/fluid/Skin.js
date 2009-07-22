/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_0_8, fluid*/

fluid_0_8 = fluid_0_8 || {};

(function ($, fluid) {
    fluid.skin = {};
    
    /**
     * Removes the classes in the Fluid class namespace: "fl-"
     */
    // TODO: clearing styling is not correct - we need to clear back to the original state not remove all fss styling
    fluid.skin.removeStyling = function (element) {
        element = element || $("html");
        $('[class*=fl-]', element).andSelf().each(function (i) {    
            var attr = ($.browser.msie === false) ? 'class' : 'className'; 
            if (this.getAttribute(attr)) {
                this.setAttribute(attr, this.getAttribute(attr).replace(/\bfl-(layout|font|theme|no-background){1}\S+/g, ''));
            }
        });        
    };

    var fssSeek = function (label, value) {
        var possibleValues = fluid.skin.fssMap[label] || {}; 
        return possibleValues[value] || "";
    };
      
    /**
     * Styles the given element based on the skin passed in
     * @param {Object} element
     * @param {Object} skin
     */
    // TODO: this implementation should be improved
    fluid.skin.style = function (skin, element) {
        element = element || $("html");
        element.addClass(fssSeek("textSize", skin.textSize));
        element.addClass(fssSeek("textFont", skin.textFont));
        element.addClass(fssSeek("textSpacing", skin.textSpacing));
        element.addClass(fssSeek("colorScheme", skin.contrast));
        element.addClass(fssSeek("layout", skin.layout));
        element.addClass(fssSeek("backgroundImages", skin.backgroundImages));
    };

    /**
     * Removes all existing classes which start with 'fl-' before restyling the page.
     * @param {Object} skin
     */
    fluid.applySkin = function (skin, element) {
        element = element || $("html");
        fluid.skin.removeStyling(element);
        fluid.skin.style(skin, element);
    };

    fluid.skin.fssMap = {
        "textSize": {
            "-3": "fl-font-size-70",
            "-2": "fl-font-size-80",
            "-1": "fl-font-size-90",
            "+1": "fl-font-size-110",
            "+2": "fl-font-size-120",
            "+3": "fl-font-size-130",
            "+4": "fl-font-size-140",
            "+5": "fl-font-size-150"
        },
        "textFont": {
            "Serif": "fl-font-serif",
            "Sans-Serif": "fl-font-sans",
            "Ariel": "fl-font-arial",
            "Verdana": "fl-font-verdana",
            "Courier": "fl-font-monospace",
            "Times": "fl-font-serif"
        },
        "textSpacing": {
            "Wide": "fl-font-spacing-1",
            "Wider": "fl-font-spacing-2",
            "Widest": "fl-font-spacing-3"
        },
        "colorScheme": {
            "Mist": "fl-theme-mist",
            "Rust": "fl-theme-rust",
            "High Contrast": "fl-theme-hc"
        }, 
        "layout": {
            "Simple": "fl-layout-linear"
        },
        "backgroundImages": {
            "No Images": "fl-no-background-images"
        }
    };


})(jQuery, fluid_0_8);
