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
/*global fluid_0_6, fluid*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    fluid.skin = {};
    
    /**
     * Removes the classes in the Fluid class namespace: "fl-"
     */
    // TODO: This currently causes an error in IE.
    fluid.skin.removeStyling = function (element) {
        element = element || $("body");
        $('[class*=fl-]', element).andSelf().each(function (i) {
            var attr = this.getAttribute('class').replace(/\bfl-\S+/g, '');
            this.setAttribute('class', attr);
        });
    };
     
    /**
     * Styles the given element based on the skin passed in
     * @param {Object} element
     * @param {Object} skin
     */
    // TODO: this implementation should be improved
    fluid.skin.style = function (element, skin) {
        element.addClass(fluid.skin.settings.textSize[skin.textSize]);
        element.addClass(fluid.skin.settings.textFont[skin.textFont]);
        element.addClass(fluid.skin.settings.textSpacing[skin.textSpacing]);
        element.addClass(fluid.skin.settings.colorScheme[skin.colorScheme]);        
    };

    /**
     * Removes all existing classes which start with 'fl-' before restyling the page.
     * @param {Object} skin
     */
    fluid.applySkin = function (skin) {
        var body = $("body");
        fluid.skin.removeStyling(body);
        fluid.skin.style(body, skin);
    };
        
    fluid.skin.settings = {
        "textSize": {
            "-2": "fl-font-size-70",
            "-1": "fl-font-size-80",
            "Default": "fl-font-size-90",
            "+1": "fl-font-size-100",
            "+2": "fl-font-size-110",
            "+3": "fl-font-size-120",
            "+4": "fl-font-size-130",
            "+5": "fl-font-size-140",
            "+6": "fl-font-size-150"
        },
        "textFont": {
            "Default": "fl-font-default",
            "Ariel": "fl-font-arial",
            "Verdana": "fl-font-sans",
            "Courier": "fl-font-monospace",
            "Times": "fl-font-serif"
        },
        "textSpacing": {
            "Default": "fl-font-spacing-0",
            "Wide": "fl-font-spacing-1",
            "Wider": "fl-font-spacing-2",
            "Widest": "fl-font-spacing-3"
        },
        "colorScheme": {
            "Mist": "fl-theme-mist",
            "High Contrast": "fl-theme-hc"
        }
    };

})(jQuery, fluid_0_6);
