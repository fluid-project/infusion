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
/*global fluid_0_8, fluid*/

fluid_0_8 = fluid_0_8 || {};

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
        function index(val, vals) {
            return $.inArray(val, vals);
        }
        element = element || $("html");
        element.addClass(fluid.skin.model.textSize.fss[index(skin.textSize, fluid.skin.model.textSize.values)]);
        element.addClass(fluid.skin.model.textFont.fss[index(skin.textFont, fluid.skin.model.textFont.values)]);
        element.addClass(fluid.skin.model.textSpacing.fss[index(skin.textSpacing, fluid.skin.model.textSpacing.values)]);
        element.addClass(fluid.skin.model.contrast.fss[index(skin.colorScheme, fluid.skin.model.contrast.values)]);        
        element.addClass(fluid.skin.model.layout.fss[index(skin.layout, fluid.skin.model.layout.values)]);        
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
    
    fluid.skin.model = {
        textFont: {
            names: ["No Preference", "Serif", "Sans-Serif", "Ariel", "Verdana", "Courier", "Times"],
            values: ["Default", "Serif", "Sans-Serif", "Ariel", "Verdana", "Courier", "Times"],
            fss: ["", "fl-font-serif", "fl-font-sans", "fl-font-arial", "fl-font-verdana", "fl-font-monospace", "fl-font-serif"],
            selection: "Default"
        },
        textSize: {
            value: "Default",
            values: ["0", "-3", "-2", "-1", "+1", "+2", "+3", "+4", "+5"], 
            fss: ["", "fl-font-size-70", "fl-font-size-80", "fl-font-size-90", "fl-font-size-110", "fl-font-size-120", "fl-font-size-130", "fl-font-size-140", "fl-font-size-150"]
        },
        textSpacing: {
            value: "Default",
            values: ["Default", "Wide", "Wider", "Widest"],
            fss: ["", "fl-font-spacing-1", "fl-font-spacing-2", "fl-font-spacing-3"]
        },
        contrast: {
            names: ["No Preference", "High Contrast", "Mist", "Rust"],
            values: ["Default", "High Contrast", "Mist", "Rust"],
            selection: "Default",
            fss: ["", "fl-theme-hc", "fl-theme-mist", "fl=theme-rust"]
        },
        backgroundImages: {
            names: ["Yes", "No"],
            values: ["yes", "no"],
            selection: "yes"
        },
        layout: {
            names: ["Yes", "No"],
            values: ["yes", "no"],
            selection: "no", 
            fss: ["fl-layout-linear", ""]
        }
    };

})(jQuery, fluid_0_8);
