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

    /**
     * Searches within the container for things that match the selector and then replace the classes 
     * that are matched by the regular expression with the new value. 
     * 
     * @param {Object} container
     * @param {Object} selector
     * @param {Object} regExp
     * @param {Object} newVal
     */
    var replaceClass = function (container, selector, regExp, newVal) {
        newVal = newVal || "";
        $(selector, container).andSelf().each(function (i) {    
            var attr = ($.browser.msie === false) ? 'class' : 'className'; 
            if (this.getAttribute(attr)) {
                // The regular expression was required for speed
                this.setAttribute(attr, this.getAttribute(attr).replace(regExp, newVal));
            }
        });
        
    };
    
    /**
     * Adds the class related to the setting to the element
     * @param {Object} element
     * @param {Object} settingName
     * @param {Object} value
     * @param {Object} classnameMap
     */
    var addClassForSetting = function (element, settingName, value, classnameMap) {
        var settingValues = classnameMap[settingName] || {}; 
        var className = settingValues[value];
        if (className) {
            element.addClass(className);        
        }
    };

    /**
     * Shows the table of contents when tocSetting is "On". Hides the table of contents otherwise.
     * @param {Object} that
     * @param {Object} tocSetting
     */
    var setToc = function (that, tocSetting) {
        if (tocSetting === "On") {
            if (that.tableOfContents) {
                that.tableOfContents.show();
            } else {
                that.tableOfContents = fluid.initSubcomponent(that, "tableOfContents", 
                        [that.container, fluid.COMPONENT_OPTIONS]);
            }
        } else {
            that.removeTableOfContents();
        }
        
    };
    
    /**
     * Sets the font size on the container. Removes all fss classes that decrease font size. 
     * @param {Object} container
     * @param {Object} size
     */
    var setMinSize = function (container, size) {
		if (size && size > 0) {
            container.css("font-size", size + "pt");
            replaceClass(container, "[class*=fl-font-size-]", /\bfl-font-size-[0-9]{1,2}\s+/g, 'fl-font-size-100');
        }
    };

    /**
     * Styles the container based on the settings passed in
     * 
     * @param {Object} that
     * @param {Object} settings
     */
    var addStyles = function (that, settings) {
        addClassForSetting(that.container, "textFont", settings.textFont, that.options.classnameMap);
        addClassForSetting(that.container, "textSpacing", settings.textSpacing, that.options.classnameMap);
        addClassForSetting(that.container, "theme", settings.contrast, that.options.classnameMap);
        addClassForSetting(that.container, "layout", settings.layout, that.options.classnameMap);
        addClassForSetting(that.container, "backgroundImages", settings.backgroundImages, that.options.classnameMap);
    };
    
    /**
     * Component that works in conjunction with FSS to transform the interface based on settings. 
     * @param {Object} container
     * @param {Object} options
     */
    fluid.uiEnhancer = function (container, options) {
        var that = fluid.initView("fluid.uiEnhancer", container, options);
        that.model = that.options.settings;
        
        /**
         * Removes the classes in the Fluid class namespace: "fl-"
         */
        // TODO: clearing styling is not correct - we need to clear back to the original state not remove all fss styling
        that.removeStyling = function () {
            replaceClass(that.container, "[class*=fl-]", /\bfl-(layout|font|theme|no-background){1}\S+/g);
        };
        
        /**
         * Hides the table of contents
         */
        that.removeTableOfContents = function () {
            if (that.tableOfContents) {
                that.tableOfContents.hide();
            }
        };

        that.refreshView = function () {
            that.removeStyling();
            addStyles(that, that.model);
            setMinSize(that.container, that.model.textSize);
            setToc(that, that.model.toc);
        };
        
        that.updateModel = function (newModel, source) {
            that.events.modelChanged.fire(newModel, that.model, source);
            that.model = newModel;
            that.refreshView();
        };
        
        return that;
    };

    fluid.defaults("fluid.uiEnhancer", {
        events: {
            modelChanged: null
        },
        classnameMap: {
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
                "High Contrast": "fl-theme-hc",
                "High Contrast Inverted": "fl-theme-hci",
                "Low Contrast": "fl-theme-slate",
                "Medium Contrast": "fl-theme-coal"
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
        },
        settings: {
            textFont: "Default",
            textSpacing: "Default",
            contrast: "Default",
            backgroundImages: "Default",
            layout: "Default",
            toc: "Default",
            textSize: "Default"
        }
    });
    
})(jQuery, fluid_1_0);
