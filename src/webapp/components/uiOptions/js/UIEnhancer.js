/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_1, fluid*/

fluid_1_1 = fluid_1_1 || {};

(function ($, fluid) {

    /****************
     * UI Enhancer  *
     ****************/

    /**
     * Searches within the container for things that match the selector and then replaces the classes 
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
            var attr = ($.browser.msie === false) ? 'class' : 'className'; // TODO: does this need to happen inside the loop?
            if (this.getAttribute(attr)) {
                // The regular expression was required for speed
                this.setAttribute(attr, this.getAttribute(attr).replace(regExp, newVal));
            }
        });
        
    };
    
    /**
     * Adds the class related to the setting to the element
     * @param {jQuery} element
     * @param {String} settingName
     * @param {String} value
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
     * Returns true if the value is true or the string "true", false otherwise
     * @param {Object} val
     */
    var isTrue = function (val) {
        return val && (val === true || val === "true");
    };
    
    /**
     * Shows the table of contents when tocSetting is "On". Hides the table of contents otherwise.
     * @param {Object} that
     * @param {Object} tocSetting
     */
    var setToc = function (that, tocSetting) {
        if (isTrue(tocSetting)) {
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
    
    /**
     * Sets the line spacing on the container.  
     * @param {Object} container
     * @param {Object} spacing
     */
    var setLineSpacing = function (container, spacing) {
        spacing = spacing && spacing > 0 ? spacing : 1; 
        container.css("line-height", spacing + "em");
    };

    /**
     * Sets the font size on the container. Removes all fss classes that decrease font size. 
     * @param {Object} container
     * @param {Object} size
     */
    var setMinSize = function (container, size) {
        // TODO: fss font size class prefix is hardcoded here
		if (size && size > 0) {
            container.css("font-size", size + "pt");
            replaceClass(container, "[class*=fl-font-size-]", /\bfl-font-size-[0-9]{1,2}\s+/g, 'fl-font-size-100');
        } else {
            container.css("font-size", ""); // empty is same effect as not being set
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
    };
    
    /**
     * Adds or removes the classname to/from the elements based upon the setting.
     * @param {Object} elements
     * @param {Object} setting
     * @param {Object} classname
     */
    var styleElements = function (elements, setting, classname) {
        if (setting) {
            elements.addClass(classname);
        } else {
            elements.removeClass(classname);
        }        
    };
    
    /**
     * Style links in the container according to the settings
     * @param {Object} container
     * @param {Object} settings
     * @param {Object} classnameMap
     */
    var styleLinks = function (container, settings, classnameMap) {
        var links = $("a", container);
        // TODO: collect up the classnames and add or remove them all at once. 
        styleElements(links, settings.linksUnderline, classnameMap.linksUnderline);
        styleElements(links, settings.linksBold, classnameMap.linksBold);
        styleElements(links, settings.linksLarger, classnameMap.linksLarger);
    };

    /**
     * Style inputs in the container according to the settings
     * @param {Object} container
     * @param {Object} settings
     * @param {Object} classnameMap
     */
    var styleInputs = function (container, settings, classnameMap) {
        styleElements($("input", container), settings.inputsLarger, classnameMap.inputsLarger);
    };
     
    /**
     * Initialize the model first looking at options.savedSettings, then in the settingsStore and finally in the options.defaultSiteSettings
     * @param {Object} that
     */
    var initModel = function (that) {
        // First check for settings in the options
        if (that.options.savedSettings) {
            that.model = that.options.savedSettings;
            return;
        }
  
        // Use the settingsStore or the defaultSiteSettings if there are no settings
        that.model = that.settingsStore.fetch() || fluid.copy(that.defaultSiteSettings);        
    };

    /**
     * Clears FSS classes from within the container that may clash with the current settings.
     * These are the classes from the classnameMap for settings where we work on the container rather
     * then on individual elements.
     * @param {Object} that
     * @return {String} the classnames that were removed separated by spaces
     */
    var clearClashingClasses = function (container, classnameMap) {
        var settingsWhichMayClash = ["textFont", "textSpacing", "theme", "layout"];  // + no background images
        var classesToRemove =  "fl-noBackgroundImages";
        var selector = ".fl-noBackgroundImages";
        
        for (var i = 0; i < settingsWhichMayClash.length; i++) {
            var settingValues = classnameMap[settingsWhichMayClash[i]];
            for (var val in settingValues) {
                var classname = settingValues[val];
                if (classname) {
                    classesToRemove = classesToRemove + " " + classname;
                    selector = selector + ",." + classname;
                }
            }
        }
        
        $(selector, container).removeClass(classesToRemove);
        return classesToRemove;
    };
    
    var setupUIEnhancer = function (that) {
        that.settingsStore = fluid.initSubcomponent(that, "settingsStore", [fluid.COMPONENT_OPTIONS]); 
        initModel(that);
        that.refreshView();        
    };
      
    /**
     * Component that works in conjunction with FSS to transform the interface based on settings. 
     * @param {Object} doc
     * @param {Object} options
     */
    fluid.uiEnhancer = function (doc, options) {
        doc = doc || document;
        var that = fluid.initView("fluid.uiEnhancer", doc, options);
        $(doc).data("uiEnhancer", that);
        that.container = $("body", doc);
        that.defaultSiteSettings = that.options.defaultSiteSettings;
        
        var clashingClassnames;
        
        /**
         * Transforms the interface based on the settings in that.model
         */
        that.refreshView = function () {
            that.container.removeClass(clashingClassnames);
            addStyles(that.container, that.model, that.options.classnameMap);
            styleElements(that.container, !isTrue(that.model.backgroundImages), that.options.classnameMap.noBackgroundImages);
            setMinSize(that.container, that.model.textSize);
            setLineSpacing(that.container, that.model.lineSpacing);
            setToc(that, that.model.toc);
            styleLinks(that.container, that.model, that.options.classnameMap);
            styleInputs(that.container, that.model, that.options.classnameMap);
        };
        
        /**
         * Stores the new settings, refreshes the view to reflect the new settings and fires modelChanged.
         * @param {Object} newModel
         * @param {Object} source
         */
        that.updateModel = function (newModel, source) {
            that.events.modelChanged.fire(newModel, that.model, source);
            fluid.clear(that.model);
            fluid.model.copyModel(that.model, newModel);
            that.settingsStore.save(that.model);
            that.refreshView();
        };

        clashingClassnames = clearClashingClasses(that.container, that.options.classnameMap);
        setupUIEnhancer(that);
        return that;
    };

    fluid.defaults("fluid.uiEnhancer", {
        tableOfContents: {
            type: "fluid.tableOfContents",
            options: {
                templateUrl: "../../tableOfContents/html/TableOfContents.html"
            }
        },
        
        settingsStore: {
            type: "fluid.uiEnhancer.cookieStore"
        },
        
        events: {
            modelChanged: null
        },
        
        classnameMap: {
            "textFont": {
                "serif": "fl-font-serif",
                "sansSerif": "fl-font-sans",
                "arial": "fl-font-arial",
                "verdana": "fl-font-verdana",
                "monospace": "fl-font-monospace",
                "courier": "fl-font-courier",
                "times": "fl-font-times"
            },
            "textSpacing": {
                "default": "",
                "wide0": "fl-font-spacing-0",
                "wide1": "fl-font-spacing-1",
                "wide2": "fl-font-spacing-2",
                "wide3": "fl-font-spacing-3",
                "wide4": "fl-font-spacing-4",
                "wide5": "fl-font-spacing-5",
                "wide6": "fl-font-spacing-6"
            },
            "theme": {
                "mist": "fl-theme-mist",
                "rust": "fl-theme-rust",
                "highContrast": "fl-theme-hc",
                "highContrastInverted": "fl-theme-hci",
                "lowContrast": "fl-theme-slate",
                "mediumContrast": "fl-theme-coal",
                "default": ""
            },
            "layout": {
                "simple": "fl-layout-linear",
                "default": ""
            },
            "noBackgroundImages": "fl-noBackgroundImages",
            "linksUnderline": "fl-text-underline", 
            "linksBold": "fl-text-bold", 
            "linksLarger": "fl-text-larger", 
            "inputsLarger": "fl-text-larger"
        },
        defaultSiteSettings: {
            textFont: "",                 // key from classname map
            textSpacing: "",              // key from classname map
            theme: "default",             // key from classname map
            layout: "default",            // key from classname map
            textSize: "",                 // in points
            lineSpacing: "",              // in ems
            backgroundImages: true,       // boolean
            toc: false,                   // boolean
            linksUnderline: false,        // boolean
            linksBold: false,             // boolean
            linksLarger: false,           // boolean
            inputsLarger: false           // boolean
        }
    });
    
    /****************
     * Cookie Store *
     ****************/
     
    /**
     * SettingsStore Subcomponent that uses a cookie for persistence.
     * @param {Object} options
     */
    fluid.uiEnhancer.cookieStore = function (options) {
        var that = {};
        fluid.mergeComponentOptions(that, "fluid.uiEnhancer.cookieStore", options);
        
        /**
         * Retrieve and return the value of the cookie
         */
        that.fetch = function () {
            var cookie = document.cookie;
            var cookiePrefix = that.options.cookieName + "=";
            var retObj, startIndex, endIndex;
            
            if (cookie.length > 0) {
                startIndex = cookie.indexOf(cookiePrefix);
                if (startIndex > -1) { 
                    startIndex = startIndex + cookiePrefix.length; 
                    endIndex = cookie.indexOf(";", startIndex);
                    if (endIndex < startIndex) {
                        endIndex = cookie.length;
                    }
                    retObj = JSON.parse(decodeURIComponent(cookie.substring(startIndex, endIndex)));
                } 
            }
            
            return retObj;
        };

        /**
         * Saves the settings into a cookie
         * @param {Object} settings
         */
        that.save = function (settings) {
            document.cookie = that.options.cookieName + "=" +  encodeURIComponent(JSON.stringify(settings));
        };
    
        return that;
    };
    
    fluid.defaults("fluid.uiEnhancer.cookieStore", {
        cookieName: "fluid-ui-settings"
    });

    /**************
     * Temp Store *
     **************/

    /**
     * SettingsStore Subcomponent that doesn't do persistence.
     * @param {Object} options
     */
    fluid.uiEnhancer.tempStore = function (options) {
        var that = {};
        that.model = null;
         
        that.fetch = function () {
            return that.model;
        };

        that.save = function (settings) {
            that.model = settings;
        };
    
        return that;
    };

})(jQuery, fluid_1_1);
