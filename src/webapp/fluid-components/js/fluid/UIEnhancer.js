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
        if (tocSetting && (tocSetting === true || tocSetting === "true")) {
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
     * @param {Object} container
     * @param {Object} settings
     * @param {Object} classnameMap
     */
    var addStyles = function (container, settings, classnameMap) {
        addClassForSetting(container, "textFont", settings.textFont, classnameMap);
        addClassForSetting(container, "textSpacing", settings.textSpacing, classnameMap);
        addClassForSetting(container, "theme", settings.theme, classnameMap);
        addClassForSetting(container, "layout", settings.layout, classnameMap);
        addClassForSetting(container, "backgroundImages", settings.backgroundImages, classnameMap);
    };

    var styleElements = function (elements, setting, classname) {
        if (setting) {
            elements.addClass(classname);
        } else {
            elements.removeClass(classname);
        }        
    };
    
    var styleLinks = function (container, settings, classnameMap) {
        var links = $("a", container);
        // TODO: collect up the classnames and add or remove them all at once. 
        styleElements(links, settings.linksUnderline, classnameMap.linksUnderline);
        styleElements(links, settings.linksBold, classnameMap.linksBold);
        styleElements(links, settings.linksLarger, classnameMap.linksLarger);
    };

    var styleInputs = function (container, settings, classnameMap) {
        styleElements($("input", container), settings.inputsLarger, classnameMap.inputsLarger);
    };
     
    /**
     * Component that works in conjunction with FSS to transform the interface based on settings. 
     * @param {Object} doc
     * @param {Object} options
     */
    fluid.uiEnhancer = function (doc, options) {
        doc = doc || document;
        var that = fluid.initView("fluid.uiEnhancer", doc, options);
        that.container = $("body", doc);
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
            addStyles(that.container, that.model, that.options.classnameMap);
            setMinSize(that.container, that.model.textSize);
            setToc(that, that.model.toc);
            styleLinks(that.container, that.model, that.options.classnameMap);
            styleInputs(that.container, that.model, that.options.classnameMap);
        };
        
        that.updateModel = function (newModel, source) {
            that.events.modelChanged.fire(newModel, that.model, source);
            that.model = newModel;
            that.refreshView();
        };

        that.refreshView();
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
            },
            "linkColor": {
                "aqua": "fl-text-aqua",
                "yellow": "fl-text-yellow"
            },
            "linksUnderline": "fl-text-underline", 
            "linksBold": "fl-text-bold", 
            "linksLarger": "fl-text-larger", 
            "inputsLarger": "fl-text-larger"
        },
        tableOfContents: {
            type: "fluid.tableOfContents",
            options: {
                templateUrl: "TableOfContents.html"
            }
        },
        settings: {
            textFont: "",            // key from classname map
            textSpacing: "",         // key from classname map
            theme: "",               // key from classname map
            backgroundImages: "",    // key from classname map
            layout: "",              // key from classname map
            toc: false,              // boolean
            textSize: "",            // in points
            linksUnderline: false,   // boolean
            linksBold: false,        // boolean
            linksLarger: false,      // boolean
            inputsLarger: false      // boolean
        }
    });
    
})(jQuery, fluid_1_0);
