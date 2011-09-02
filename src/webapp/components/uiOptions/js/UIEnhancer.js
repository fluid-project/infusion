/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2010-2011 OCAD University

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

    /*******************************************************************************
     * Browser type and version detection.                                         *
     *                                                                             *
     * Add type tags of IE and browser version into static environment for the     * 
     * spcial handling on IE6.                                                     *
     *******************************************************************************/
    
    fluid.registerNamespace("fluid.browser.version");

    fluid.browser.msie = function () {
        var isIE = ($.browser.msie);
        return isIE ? fluid.typeTag("fluid.browser.msie") : undefined;
    };

    fluid.browser.majorVersion = function () {
    // From http://www.useragentstring.com/pages/Internet%20Explorer/ several variants are possible
    // for IE6 - and in general we probably just want to detect major versions
        var version = $.browser.version;
        var dotpos = version.indexOf(".");
        var majorVersion = version.substring(0, dotpos);
        return fluid.typeTag("fluid.browser.majorVersion." + majorVersion);
    };

    var features = {
        browserIE: fluid.browser.msie(),
        browserMajorVersion: fluid.browser.majorVersion()
    };
    
    fluid.merge(null, fluid.staticEnvironment, features);
    
    // Temporary solution pending revised IoC system in 1.5
    
    fluid.hasFeature = function (tagName) {
        return fluid.find(fluid.staticEnvironment, function (value) {
            return value && value.typeName === tagName ? true : undefined;
        });
    };

    /*******************************************************************************
     * UI Enhancer                                                                 *
     *                                                                             *
     * Works in conjunction with FSS to transform the page based on user settings. *
     *******************************************************************************/
    
    // TODO: These are left here since toc refactoring has been carried out in another branch.
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
                $(document).ready(that.events.onCreateTOCReady.fire);
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
            textSize: {
                type: "fluid.uiEnhancer.textSizer",
                container: "{uiEnhancer}.container"
            },
            tableOfContents: {
                type: "fluid.tableOfContents",
                container: "{uiEnhancer}.container",
                createOnEvent: "onCreateTOCReady",
                options: {
                    components: {
                        levels: {
                            type: "fluid.tableOfContents.levels",
                            options: {
                                resources: {
                                    template: {
                                        forceCache: true,
                                        url: "{uiEnhancer}.options.tocTemplate"
                                    }
                                }
                            } 
                        }
                    }
                }
            },
            textFont: {
                type: "fluid.uiEnhancer.classSwapper",
                container: "{uiEnhancer}.container",
                options: {
                    classes: "{uiEnhancer}.options.classnameMap.textFont"
                }
            },
            lineSpacing: {
                type: "fluid.uiEnhancer.lineSpacer",
                container: "{uiEnhancer}.container"
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
                options: {
                    defaultSiteSettings: "{uiEnhancer}.options.defaultSiteSettings"
                }
            }
        },
        invokers: {
            updateModel: {
                funcName: "fluid.uiEnhancer.updateModel",
                args: ["@0", "{uiEnhancer}.applier"]
            },
            updateFromSettingsStore: {
                funcName: "fluid.uiEnhancer.updateFromSettingsStore",
                args: ["{uiEnhancer}"]
            },
            refreshView: {
                funcName: "fluid.uiEnhancer.refreshView",
                args: ["{uiEnhancer}"]
            },
            styleElements: "fluid.uiEnhancer.styleElements",
            
            // NOTE: when we do the ants refactoring each of these will be half an ant
            setLayout: "fluid.uiEnhancer.setLayout",
            styleLinks: "fluid.uiEnhancer.styleLinks",
            styleInputs: "fluid.uiEnhancer.styleInputs",
            setIE6ColorInversion: "fluid.uiEnhancer.setIE6ColorInversion"
        },
        events: {
            onCreateTOCReady: null,
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
                "default": "fl-uio-default-theme",
                "bw": "fl-theme-uio-bw fl-theme-bw",
                "wb": "fl-theme-uio-wb fl-theme-wb",
                "by": "fl-theme-uio-by fl-theme-by",
                "yb": "fl-theme-uio-yb fl-theme-yb"
            },
            "layout": "fl-layout-linear",
            "links": "fl-text-underline fl-text-bold fl-text-larger", 
            "inputsLarger": "fl-text-larger"
        },
        selectors: {
            colorInversion: ".fl-inverted-color"
        },
        styles: {
            colorInversionClass: "fl-inverted-color"
        },
        finalInitFunction: "fluid.uiEnhancer.finalInit"
    });

    fluid.uiEnhancer.finalInit = function (that) {        
        that.applier.modelChanged.addListener("",
            function (newModel, oldModel, changeRequest) {
                that.events.modelChanged.fire(newModel, oldModel, changeRequest);
                that.refreshView();   
            });

        that.updateFromSettingsStore();
        return that;
    };
    
    fluid.uiEnhancer.updateFromSettingsStore = function (that) {
        that.updateModel(that.settingsStore.fetch());
    };

    fluid.uiEnhancer.updateModel = function (newModel, applier) {
        applier.requestChange("", newModel);
    };

    /**
     * Transforms the interface based on the settings in that.model
     */
    fluid.uiEnhancer.refreshView = function (that) {
        that.textSize.set(that.model.textSize);
        that.textFont.swap(that.model.textFont);
        that.lineSpacing.set(that.model.lineSpacing);
        that.theme.swap(that.model.theme);
        that.setLayout(that);
        setToc(that, that.model.toc);
        that.styleLinks(that);
        that.styleInputs(that);
        that.setIE6ColorInversion(that);
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
     * Style layout in the container according to the settings
     * @param {Object} that - the uiEnhancer
     */
    fluid.uiEnhancer.setLayout = function (that) {
        that.styleElements(that.container, that.model.layout, that.options.classnameMap.layout);
    };

    /**
     * Style links in the container according to the settings
     * @param {Object} that - the uiEnhancer
     */
    fluid.uiEnhancer.styleLinks = function (that) {
        var links = $("a", that.container);
        that.styleElements(links, that.model.links, that.options.classnameMap.links);
    };

    /**
     * Style inputs in the container according to the settings
     * @param {Object} that - the uiEnhancer
     */
    fluid.uiEnhancer.styleInputs = function (that) {
        that.styleElements($("input", that.container), that.model.inputsLarger, that.options.classnameMap.inputsLarger);
    };

    /**
     * remove the instances of fl-inverted-color when the default theme is selected. 
     * This prevents a bug in IE6 where the default theme will have elements styled 
     * with the theme color.
     *
     * Caused by:
     * http://thunderguy.com/semicolon/2005/05/16/multiple-class-selectors-in-internet-explorer/
     * @param {Object} that - the uiEnhancer
     */
    fluid.uiEnhancer.setIE6ColorInversion = function (that) {
        if (fluid.hasFeature("fluid.browser.msie") && fluid.hasFeature("fluid.browser.majorVersion.6") && that.model.theme === "default") {
            that.locate("colorInversion").removeClass(that.options.styles.colorInversionClass);
        }
    };

    fluid.uiEnhancer.getTextSize = function (container) {
        return parseFloat(container.css("font-size"));        
    };



    /*******************************************************************************
     * TextSizer                                                              *
     *                                                                             *
     * Sets the text size on the container to the multiple provided.               *
     * Note: This will become half an ant                                          *
     *******************************************************************************/
    
    fluid.defaults("fluid.uiEnhancer.textSizer", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        invokers: {
            set: {
                funcName: "fluid.uiEnhancer.textSizer.set",
                args: ["@0", "{textSizer}"]
            },
            calcInitSize: {
                funcName: "fluid.uiEnhancer.textSizer.calcInitSize",
                args: ["{textSizer}"]
            }
        }
    });
       
    fluid.uiEnhancer.textSizer.set = function (times, that) {
        if (!that.initialSize) {
            that.calcInitSize();
        }
        if (times === 1) {
            that.container.css("font-size", ""); // empty is same effect as not being set
        } else if (times && times > 0) {
            var targetSize = that.initialSize * times + "px";
            that.container.css("font-size", targetSize);
        }
    };
    
    fluid.uiEnhancer.textSizer.calcInitSize = function (that) {
        that.initialSize = fluid.uiEnhancer.getTextSize(that.container);     
    };
    




    /*******************************************************************************
     * ClassSwapper                                                                *
     *                                                                             *
     * Has a hash of classes it cares about and will remove all those classes from *
     * its container before setting the new class.                                 *
     * Note: This will become half an ant                                          *
     *******************************************************************************/
    
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
        that.container.removeClass(that.classStr);
    };
    
    fluid.uiEnhancer.classSwapper.swap = function (classname, that) {
        that.clearClasses(that);
        that.container.addClass(that.options.classes[classname]);
    };



    
    /*******************************************************************************
     * LineSpacer                                                                  *
     *                                                                             *
     * Sets the line spacing on the container to the multiple provided.            *
     * Note: This will become half an ant                                          *
     *******************************************************************************/
    
    fluid.defaults("fluid.uiEnhancer.lineSpacer", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        invokers: {
            set: {
                funcName: "fluid.uiEnhancer.lineSpacer.set",
                args: ["@0", "{lineSpacer}"]
            },
            calcInitSize: {
                funcName: "fluid.uiEnhancer.lineSpacer.calcInitSize",
                args: ["{lineSpacer}"]
            }
        }
    });
    
    // TODO: this might be almost the same as textSize setting - can we share?
    fluid.uiEnhancer.lineSpacer.set = function (times, that) {
        if (!that.initialSize) {
            that.calcInitSize();
        }
        
        var newLineSpacing = times === "" || times === 1 ? that.initialSize : times * that.initialSize;
        that.container.css("line-height", newLineSpacing + "em");
    };
    
    // Returns the value of css style "line-height" in em 
    fluid.uiEnhancer.lineSpacer.calcInitSize = function (that) {
        var lineHeight = that.container.css("lineHeight");
        
        // Needs a better solution. For now, "line-height" value "normal" is defaulted to 1em.
        if (lineHeight === "normal") {
            return 1;
        }
        
        // A work-around of jQuery + IE bug - http://bugs.jquery.com/ticket/2671
        if ($.browser.msie) {
            var lineHeightInIE;
            
            // if unit is missing, assume the value is in "em"
            lineHeightInIE = that.container[0].currentStyle.lineHeight;
            
            if (lineHeightInIE.match(/[0-9]$/)) {
                return lineHeightInIE;
            }
        }
        
        that.initialSize = Math.round(parseFloat(lineHeight) / fluid.uiEnhancer.getTextSize(that.container) * 100) / 100;
    };

    /*******************************************************************************
     * PageEnhancer                                                                *
     *                                                                             *
     * A UIEnhancer wrapper that concerns itself with the entire page.             *
     *******************************************************************************/    
    
    fluid.pageEnhancer = function (uiEnhancerOptions) {
        var that = fluid.initLittleComponent("fluid.pageEnhancer");
        uiEnhancerOptions = fluid.copy(uiEnhancerOptions);
        // This hack is required to resolve FLUID-4409 - much improved framework support is required
        uiEnhancerOptions.originalUserOptions = fluid.copy(uiEnhancerOptions);
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
