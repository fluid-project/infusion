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
/*global fluid_0_7, fluid*/

fluid_0_7 = fluid_0_7 || {};

(function ($, fluid) {
    fluid.skin = {};
    
    /**
     * Removes the classes in the Fluid class namespace: "fl-"
     */
    fluid.skin.removeStyling = function (element) {
        element = element || $("html");
        $('[class*=fl-]', element).andSelf().each(function (i) {    
            var attr = ($.browser.msie === false) ? 'class' : 'className'; 
            if (this.getAttribute(attr)) {
                this.setAttribute(attr, this.getAttribute(attr).replace(/\bfl-(layout|font|theme){1}\S+/g, ''));
            }
        });        
    };
     
    /**
     * Styles the given element based on the skin passed in
     * @param {Object} element
     * @param {Object} skin
     */
    // TODO: this implementation should be improved
    fluid.skin.style = function (skin, element) {
        element = element || $("html");
        element.addClass(fluid.skin.settings.textSize[skin.textSize]);
        element.addClass(fluid.skin.settings.textFont[skin.textFont]);
        element.addClass(fluid.skin.settings.textSpacing[skin.textSpacing]);
        element.addClass(fluid.skin.settings.colorScheme[skin.colorScheme]);        
        element.addClass(fluid.skin.settings.layout[skin.layout]);        
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
        
    fluid.skin.settings = {
        "textSize": {
            "-3": "fl-font-size-70",
            "-2": "fl-font-size-80",
            "-1": "fl-font-size-90",
            "0": "",
            "+1": "fl-font-size-110",
            "+2": "fl-font-size-120",
            "+3": "fl-font-size-130",
            "+4": "fl-font-size-140",
            "+5": "fl-font-size-150"
        },
        "textFont": {
            "Default": "",
            "Ariel": "fl-font-arial",
            "Verdana": "fl-font-verdana",
            "Courier": "fl-font-monospace",
            "Times": "fl-font-serif"
        },
        "textSpacing": {
            "Default": "",
            "Wide": "fl-font-spacing-1",
            "Wider": "fl-font-spacing-2",
            "Widest": "fl-font-spacing-3"
        },
        "colorScheme": {
            "Default": "",
            "Mist": "fl-theme-mist",
            "Rust": "fl-theme-rust",
            "High Contrast": "fl-theme-hc"
        }, 
        "layout": {
            "Default": "",
            "Simple": "fl-layout-linear"
        }
    };

})(jQuery, fluid_0_7);
