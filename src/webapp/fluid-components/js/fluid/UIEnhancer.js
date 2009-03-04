/*
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_0, fluid*/

fluid_1_0 = fluid_1_0 || {};

(function ($, fluid) {

    var replaceClass = function (container, selector, regExp, newVal) {
        newVal = newVal || "";
        $(selector, container).andSelf().each(function (i) {    
            var attr = ($.browser.msie === false) ? 'class' : 'className'; 
            if (this.getAttribute(attr)) {
                this.setAttribute(attr, this.getAttribute(attr).replace(regExp, newVal));
            }
        });
        
    };
    
    var addClassForSetting = function (element, label, value, fssMap) {
        var possibleValues = fssMap[label] || {}; 
        var className = possibleValues[value];
        if (className) {
            element.addClass(className);        
        }
    };

    var setToc = function (that, val) {
        if (val === "On") {
            if (that.tableOfContents) {
                that.tableOfContents.show();
            } else {
                that.tableOfContents = fluid.initSubcomponent(that, "tableOfContents", 
                        [that.container, fluid.COMPONENT_OPTIONS]);
            }
        } else {
            if (that.tableOfContents) {
                that.tableOfContents.hide();
            }
        }
        
    };
    
    var setSize = function (container, size) {
        if (size) {
            container.css("font-size", size + "pt");
            replaceClass(container, "[class*=fl-font-size-]", /\bfl-font-size-[0-9]{1,2}\s+/g, 'fl-font-size-100');
        }
    };
    
    fluid.uiEnhancer = function (container, options) {
        var that = fluid.initView("fluid.uiEnhancer", container, options);
        
        /**
         * Removes the classes in the Fluid class namespace: "fl-"
         */
        // TODO: clearing styling is not correct - we need to clear back to the original state not remove all fss styling
        that.removeStyling = function () {
            replaceClass(that.container, "[class*=fl-]", /\bfl-(layout|font|theme|no-background){1}\S+/g);
        };

        /**
         * Styles the container based on the skin passed in
         * @param {Object} skin
         */
        // TODO: Rename this - style is no longer appropriate. 
        that.style = function (skin) {
            
            addClassForSetting(that.container, "textFont", skin.textFont, that.options.fssMap);
            addClassForSetting(that.container, "textSpacing", skin.textSpacing, that.options.fssMap);
            addClassForSetting(that.container, "theme", skin.contrast, that.options.fssMap);
            addClassForSetting(that.container, "layout", skin.layout, that.options.fssMap);
            addClassForSetting(that.container, "backgroundImages", skin.backgroundImages, that.options.fssMap);
            
            setSize(that.container, skin.textSize);
            setToc(that, skin.toc);
        };

        /**
         * Removes all existing classes which start with 'fl-' before restyling the page.
         * @param {Object} skin
         */
        that.applySkin = function (skin) {
            that.removeStyling();
            that.style(skin);
        };
        
        return that;
    };

    fluid.defaults("fluid.uiEnhancer", {
        fssMap: {
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
            "theme": {
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
        },
        tableOfContents: {
            type: "fluid.tableOfContents",
            options: {
                templateUrl: "TableOfContents.html"
            }
        }        
    });
    
})(jQuery, fluid_1_0);
