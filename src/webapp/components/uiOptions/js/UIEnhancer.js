/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

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
                that.events.onReady.fire();
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
    var setLineSpacing = function (container, times, initLineSpacing, textSizeTimes) {
        var newLineSpacing = times === "" || times === 1 ? initLineSpacing : times * initLineSpacing * textSizeTimes;
        container.css("line-height", newLineSpacing + "em");
    };

    /**
     * Sets the font size on the container. Removes all fss classes that decrease font size. 
     * @param {Object} container
     * @param {Object} size
     */
    var setMinSize = function (container, times, initFontSize) {
        // TODO: fss font size class prefix is hardcoded here
        if (times == 1){
            container.css("font-size", ""); // empty is same effect as not being set
        } else if (times && times > 0) {
            newFontSize = initFontSize * times;
            container.css("font-size", newFontSize + "px");
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
        styleElements(links, settings.links, classnameMap.links);
    };

    /**
     * Style layout in the container according to the settings
     * @param {Object} container
     * @param {Object} settings
     * @param {Object} classnameMap
     */
    var styleLayout = function (container, settings, classnameMap) {
        styleElements(container, settings.layout, classnameMap.layout);
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
            that.applier.requestChange("", that.options.savedSettings);
            return;
        }
  
        // Use the settingsStore or the defaultSiteSettings if there are no settings
        that.applier.requestChange("", that.settingsStore.fetch() || fluid.copy(that.defaultSiteSettings));
    };

    /**
     * Clears FSS classes from within the container that may clash with the current settings.
     * These are the classes from the classnameMap for settings where we work on the container rather
     * then on individual elements.
     * @param {Object} that
     * @return {String} the classnames that were removed separated by spaces
     */
    var clearClashingClasses = function (container, classnameMap) {
        var settingsWhichMayClash = ["textFont", "textSpacing", "theme", "layout"];
        var classesToRemove, selector;
        
        for (var i = 0; i < settingsWhichMayClash.length; i++) {
            var settingValues = classnameMap[settingsWhichMayClash[i]];
            if (typeof settingValues === 'object') {
                fluid.each(settingValues, function (className) {
                    if (className) {
                        classesToRemove = classesToRemove + " " + className;
                        selector = selector + ",." + className;
                    }
                });
            } else if (typeof settingValues === 'string'){
                classesToRemove = classesToRemove + " " + settingValues;
                selector = selector + ",." + settingValues;
            }
        }
        
        $(selector, container).removeClass(classesToRemove);
        return classesToRemove;
    };
    
    var setupUIEnhancer = function (that) {
        fluid.initDependents(that);
        that.events.onInitSettingStore.fire(); 
        initModel(that);
    };
    
    // Returns the value of css style "line-height" in em 
    var getLineHeight = function (container) {
        var lineHeight = container.css("lineHeight");
        
        // A work-around of jQuery + IE bug - http://bugs.jquery.com/ticket/2671
        if ($.browser.msie) {
            var lineHeightInIE;
            
            // if unit is missing, assume the value is in "em"
            lineHeightInIE = container[0].currentStyle.lineHeight;
            
            if (lineHeightInIE.match(/[0-9]$/)) {
                return lineHeightInIE;
            }
        }
        
        // Needs a better solution. For now, "line-height" value "normal" is hardcodedly converted to 1em.
        if (lineHeight === "normal") {
            return 1;
        }
        return parseFloat(lineHeight) / 16;
    };
      
    /**
     * Component that works in conjunction with FSS to transform the interface based on settings. 
     * @param {Object} container
     * @param {Object} options
     */
    fluid.uiEnhancer = function (container, options) {
        var originalContainer = container || document;
        container = $("body", originalContainer);
        var that = fluid.initView("fluid.uiEnhancer", container, options);
        $(originalContainer).data("uiEnhancer", that);
        that.defaultSiteSettings = that.options.defaultSiteSettings;

        var clashingClassnames;
        
        var initFontSize = parseFloat(container.css("font-size"));
        
        var initLineSpacing = getLineHeight(container);
        
        /**
         * Transforms the interface based on the settings in that.model
         */
        that.refreshView = function () {
            that.container.removeClass(clashingClassnames);
            addStyles(that.container, that.model, that.options.classnameMap);
            styleElements(that.container, !isTrue(that.model.backgroundImages), that.options.classnameMap.noBackgroundImages);
            setMinSize(that.container, that.model.textSize, initFontSize);
            setLineSpacing(that.container, that.model.lineSpacing, initLineSpacing, that.model.textSize);
            setToc(that, that.model.toc);
            styleLinks(that.container, that.model, that.options.classnameMap);
            styleLayout(that.container, that.model, that.options.classnameMap);
            styleInputs(that.container, that.model, that.options.classnameMap);
        };
        
        /**
         * Stores the new settings, refreshes the view to reflect the new settings and fires modelChanged.
         * @param {Object} newModel
         * @param {Object} source
         */
        that.events.onSave.addListener(
            function (newModel) {
                that.settingsStore.save(that.model);
            }
        );

        that.applier.modelChanged.addListener("",
            function (newModel, oldModel, changeRequest) {
                that.events.modelChanged.fire(newModel, oldModel, changeRequest);
                that.refreshView();
            }
        );

        clashingClassnames = clearClashingClasses(that.container, that.options.classnameMap);
        setupUIEnhancer(that);
        return that;
    };

    fluid.defaults("fluid.uiEnhancer", {
        gradeNames: "fluid.viewComponent",
        components: {
            tableOfContents: {
                type: "fluid.tableOfContents",
                container: "{uiEnhancer}.container",
                createOnEvent: "onReady",
                options: {
                    templateUrl: "../../tableOfContents/html/TableOfContents.html"
                }
            },
            settingsStore: {
                type: "fluid.uiEnhancer.cookieStore",
                container: "{uiEnhancer}.container",
                createOnEvent: "onInitSettingStore"
            }
        },
        events: {
            onReady: null,
            onSave: null,
            modelChanged: null,
            onInitSettingStore: null
        },
        classnameMap: {
            "textFont": {
                "default": "",
                "times": "fl-font-times",
                "comic": "fl-font-sans",
                "arial": "fl-font-arial",
                "verdana": "fl-font-verdana"
            },
            "theme": {
                "default": "",
                "bw": "fl-theme-hc",
                "wb": "fl-theme-hci",
                "by": "",
                "yb": ""
            },
            "layout": "fl-layout-linear",
            "links": "fl-text-underline fl-text-bold fl-text-larger", 
            "inputsLarger": "fl-text-larger"
        },
        defaultSiteSettings: {
            textFont: "default",          // key from classname map
            theme: "default",             // key from classname map
            textSize: 1,                  // in points
            lineSpacing: 1,               // in ems
            layout: false,                // boolean
            toc: false,                   // boolean
            links: false,                 // boolean
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
    fluid.defaults("fluid.uiEnhancer.cookieStore", {
        gradeNames: ["fluid.littleComponent", "autoInit"], 
        cookieName: "fluid-ui-settings",
        finalInitFunction: "fluid.uiEnhancer.cookieStore.finalInit"
    });

    fluid.uiEnhancer.cookieStore.finalInit = function (that) {
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
    };
    
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

})(jQuery, fluid_1_4);
