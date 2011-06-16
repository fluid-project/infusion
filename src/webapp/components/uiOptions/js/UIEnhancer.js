/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2011 OCAD University

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
     * Shows the table of contents when tocSetting is "On". Hides the table of contents otherwise.
     * @param {Object} that
     * @param {Object} tocSetting
     */
    var setToc = function (that, tocSetting) {
        if (that.isTrue(tocSetting)) {
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
    
    

              

    fluid.defaults("fluid.uiEnhancer", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            tableOfContents: {
                type: "fluid.tableOfContents",
                container: "{uiEnhancer}.container",
                createOnEvent: "onReady",
                options: {
                    templateUrl: "../../tableOfContents/html/TableOfContents.html"
                }
            },
            textFont: {
                type: "fluid.uiEnhancer.classSwapper",
                container: "{uiEnhancer}.container",
                options: {
                    classes: "{uiEnhancer}.options.classnameMap.textFont"
                }
            },
            theme: {
                type: "fluid.uiEnhancer.classSwapper",
                container: "{uiEnhancer}.container",
                options: {
                    classes: "{uiEnhancer}.options.classnameMap.theme"
                }
            },
            settingsStore: {
                type: "fluid.uiOptions.store",
                container: "{uiEnhancer}.container"
            }
        },
        invokers: {
            setTextSize: "fluid.uiEnhancer.setTextSize",
            updateModel: {
                funcName: "fluid.uiEnhancer.updateModel",
                args: ["@0", "{uiEnhancer}.applier"]
            },
            setContainerClass: "fluid.uiEnhancer.setContainerClass",
            setLineSpacing: "fluid.uiEnhancer.setLineSpacing",
            getLineHeight: "fluid.uiEnhancer.getLineHeight",
            styleElements: "fluid.uiEnhancer.styleElements",
            styleLinks: "fluid.uiEnhancer.styleLinks",
            styleInputs: "fluid.uiEnhancer.styleInputs",
            setLayout: "fluid.uiEnhancer.setLayout",
            isTrue: "fluid.uiEnhancer.isTrue",
            refreshView: "fluid.uiEnhancer.refreshView"
        },
        events: {
            onReady: null,
            modelChanged: null
        },
        classnameMap: {
            "textFont": {
                "default": "",
                "times": "fl-font-times",
                "comic": "fl-font-comic-sans",
                "arial": "fl-font-arial",
                "verdana": "fl-font-verdana"
            },
            "theme": {
                "default": "",
                "bw": "fl-theme-hc",
                "wb": "fl-theme-hci",
                "by": "fl-theme-blackYellow",
                "yb": "fl-theme-yellowBlack"
            },
            "layout": "fl-layout-linear",
            "links": "fl-text-underline fl-text-bold fl-text-larger", 
            "inputsLarger": "fl-text-larger"
        },
        finalInitFunction: "fluid.uiEnhancer.finalInit"
    });

    /**
     * Component that works in conjunction with FSS to transform the interface based on settings. 
     * @param {Object} container
     * @param {Object} options
     */
    fluid.uiEnhancer.finalInit = function (that) {
        
        that.initialFontSize = parseFloat(that.container.css("font-size"));        
        that.initialLineSpacing = that.getLineHeight(that.container);
        
        that.applier.modelChanged.addListener("",
            function (newModel, oldModel, changeRequest) {
                that.events.modelChanged.fire(newModel, oldModel, changeRequest);
                that.refreshView(that);
            }
        );

        that.applier.requestChange("", that.settingsStore.fetch());
        return that;
    };

    fluid.uiEnhancer.updateModel = function (newModel, applier) {
        applier.requestChange("", newModel);
    };

    /**
     * Transforms the interface based on the settings in that.model
     */
    fluid.uiEnhancer.refreshView = function (that) {
        that.textFont.swap(that.model.textFont);
        that.theme.swap(that.model.theme);
        that.setTextSize(that.container, that.model.textSize, that.initialFontSize);
        that.setLineSpacing(that);
        setToc(that, that.model.toc);
        that.styleElements(that.container, !that.isTrue(that.model.backgroundImages), that.options.classnameMap.noBackgroundImages);
        that.styleLinks(that);
        that.setLayout(that);
        that.styleInputs(that);
    };

    /**
     * Sets the font size on the container. Removes all fss classes that decrease font size. 
     * @param {Object} container
     * @param {Object} size
     */
    fluid.uiEnhancer.setTextSize = function (container, times, initFontSize) {
        if (times === 1) {
            container.css("font-size", ""); // empty is same effect as not being set
        } else if (times && times > 0) {
            container.css("font-size", initFontSize * times + "px");
        }
    };

    // Returns the value of css style "line-height" in em 
    fluid.uiEnhancer.getLineHeight = function (container) {
        var lineHeight = container.css("lineHeight");
        
        // Needs a better solution. For now, "line-height" value "normal" is defaulted to 1em.
        if (lineHeight === "normal") {
            return 1;
        }
        
        // A work-around of jQuery + IE bug - http://bugs.jquery.com/ticket/2671
        if ($.browser.msie) {
            var lineHeightInIE;
            
            // if unit is missing, assume the value is in "em"
            lineHeightInIE = container[0].currentStyle.lineHeight;
            
            if (lineHeightInIE.match(/[0-9]$/)) {
                return lineHeightInIE;
            }
        }
        
        return parseFloat(lineHeight) / 16;
    };

    /**
     * Sets the line spacing on the container.  
     * @param {Object} container
     * @param {Object} spacing
     */
    fluid.uiEnhancer.setLineSpacing = function (that) {
        var times = that.model.lineSpacing;
        var newLineSpacing = times === "" || times === 1 ? that.initialLineSpacing : times * that.initialLineSpacing * that.model.textSize;
        that.container.css("line-height", newLineSpacing + "em");
    };

    /**
     * Adds or removes the classname to/from the elements based upon the setting.
     * @param {Object} elements
     * @param {Object} setting
     * @param {Object} classname
     */
    fluid.uiEnhancer.styleElements = function (elements, setting, classname) {
        if (setting) {
            elements.addClass(classname);
        } else {
            $("." + classname, elements).andSelf().removeClass(classname);
        }        
    };
    
    /**
     * Style links in the container according to the settings
     * @param {Object} container
     * @param {Object} settings
     * @param {Object} classnameMap
     */
    fluid.uiEnhancer.styleLinks = function (that) {
        var links = $("a", that.container);
        that.styleElements(links, that.model.links, that.options.classnameMap.links);
    };

    /**
     * Style layout in the container according to the settings
     * @param {Object} container
     * @param {Object} settings
     * @param {Object} classnameMap
     */
    fluid.uiEnhancer.setLayout = function (that) {
        that.styleElements(that.container, that.model.layout, that.options.classnameMap.layout);
    };
     
    /**
     * Style inputs in the container according to the settings
     * @param {Object} container
     * @param {Object} settings
     * @param {Object} classnameMap
     */
    fluid.uiEnhancer.styleInputs = function (that) {
        that.styleElements($("input", that.container), that.model.inputsLarger, that.options.classnameMap.inputsLarger);
    };
     
    /**
     * Returns true if the value is true or the string "true", false otherwise
     * @param {Object} val
     */
    fluid.uiEnhancer.isTrue = function (val) {
        return val && (val === true || val === "true");
    };

    
    
    
    
    fluid.defaults("fluid.uiEnhancer.classSwapper", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        invokers: {
            clearClasses: {
                funcName: "fluid.uiEnhancer.classSwapper.clearClasses",
                args: ["{classSwapper}"]
            },
            swap: {
                funcName: "fluid.uiEnhancer.classSwapper.swap",
                args: ["@0", "{classSwapper}"]
            }
        },
        classes: {},
        finalInitFunction: "fluid.uiEnhancer.classSwapper.finalInit"
    });
    
    fluid.uiEnhancer.classSwapper.finalInit = function (that) {
        that.classSelector = "";
        that.classStr = "";
        
        fluid.each(that.options.classes, function (className) {
            if (className) {
                that.classSelector += that.classSelector ? ", ." + className : "." + className;
                that.classStr += that.classStr ? " " + className : className;
            }
        });
    };
    
    fluid.uiEnhancer.classSwapper.clearClasses = function (that) {
        $(that.classSelector, that.container).add(that.container).removeClass(that.classStr);
    };
    
    fluid.uiEnhancer.classSwapper.swap = function (classname, that) {
        that.clearClasses(that);
        that.container.addClass(that.options.classes[classname]);
    };

    
    
    
    
    
    fluid.pageEnhancer = function (uiEnhancerOptions) {
        var that = fluid.initLittleComponent("fluid.pageEnhancer");
        that.uiEnhancerOptions = uiEnhancerOptions;
        fluid.initDependents(that);
        fluid.staticEnvironment.uiEnhancer = that.uiEnhancer;
        return that;
    };

    fluid.defaults("fluid.pageEnhancer", {
        gradeNames: ["fluid.littleComponent"],
        components: {
            uiEnhancer: {
                type: "fluid.uiEnhancer",
                container: "body",
                options: "{pageEnhancer}.uiEnhancerOptions"
            }
        }
    });
    
    fluid.demands("fluid.uiOptions.store", ["fluid.uiEnhancer"], {
        funcName: "fluid.cookieStore"
    });

})(jQuery, fluid_1_4);
