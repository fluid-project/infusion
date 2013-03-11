/*
Copyright 2009 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

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
        return fluid.find_if(fluid.staticEnvironment, function (value) {
            return value && value.typeName === tagName;
        });
    };

    /*******************************************************************************
     * UI Enhancer                                                                 *
     *                                                                             *
     * Works in conjunction with FSS to transform the page based on user settings. *
     *******************************************************************************/
    
    fluid.defaults("fluid.uiEnhancer", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            textSize: {
                type: "fluid.uiOptions.actionAnts.textSizerEnactor",
                container: "{uiEnhancer}.container",
                options: {
                    fontSizeMap: "{uiEnhancer}.options.fontSizeMap",
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "textSize": "value"
                    }
                }
            },
            tableOfContents: {
//                type: "fluid.uiOptions.actionAnts.tableOfContentsEnactor",
//                container: "{uiEnhancer}.container",
//                createOnEvent: "onCreateToc",
////                priority: "last",
//                options: {
//                    tocTemplate: "{uiEnhancer}.options.tocTemplate",
//                    model: "{uiEnhancer}.model",
//                    applier: "{uiEnhancer}.applier",
//                    listeners: {
//                        afterTocRender: "{uiEnhancer}.events.onTocReady",
//                        onLateRefreshRelay: "{uiEnhancer}.events.onTocReady"
//                    }
//                }
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
                    },
                    listeners: {
                        afterRender: "{uiEnhancer}.lateRefreshRelay"
                    }
                }
            },
            textFont: {
                type: "fluid.uiOptions.actionAnts.classSwapperEnactor",
                container: "{uiEnhancer}.container",
                options: {
                    classes: "{uiEnhancer}.options.classnameMap.textFont",
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "textFont": "value"
                    }
                }
            },
            lineSpacing: {
                type: "fluid.uiOptions.actionAnts.lineSpacerEnactor",
                container: "{uiEnhancer}.container",
                options: {
                    fontSizeMap: "{uiEnhancer}.options.fontSizeMap",
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "lineSpacing": "value"
                    }
                }
            },
            theme: {
                type: "fluid.uiOptions.actionAnts.classSwapperEnactor",
                container: "{uiEnhancer}.container",
                options: {
                    classes: "{uiEnhancer}.options.classnameMap.theme",
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "theme": "value"
                    }
                }
            },
            emphasizeLinks: {
                type: "fluid.uiOptions.actionAnts.emphasizeLinksEnactor",
                container: "{uiEnhancer}.container",
                options: {
                    cssClass: "{uiEnhancer}.options.classnameMap.links",
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "links": "value"
                    }
                }
            },
            inputsLarger: {
                type: "fluid.uiOptions.actionAnts.inputsLargerEnactor",
                container: "{uiEnhancer}.container",
                options: {
                    cssClass: "{uiEnhancer}.options.classnameMap.inputsLarger",
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "inputsLarger": "value"
                    }
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
            setIE6ColorInversion: {
                funcName: "fluid.uiEnhancer.setIE6ColorInversion",
                args: "{uiEnhancer}"
            },
            applyDomReadingSettings: {
                funcName: "fluid.uiEnhancer.applyDomReadingSettings",
                args: "{uiEnhancer}"
            }
        },
        events: {
            onCreateTOCReady: null,
            lateRefreshView: null,
            onCreateToc: null,
            onTocReady: null,
            modelChanged: null
        },
        listeners: {
            "lateRefreshView.domReading": "fluid.uiEnhancer.applyDomReadingSettings",
            onTocReady: "{that}.applyDomReadingSettings"//,
//            onTocReady: [{
//                listener: "{that}.emphasizeLinks.handleStyle",
//                args: "{that}.model"
//            }, {
//                listener: "{that}.inputsLarger.handleStyle",
//                args: "{that}.model"
//            }, {
//                listener: "{that}.setIE6ColorInversion"
//            }]
        },
        classnameMap: {
            "textFont": {
                "default": "",
                "times": "fl-font-uio-times",
                "comic": "fl-font-uio-comic-sans",
                "arial": "fl-font-uio-arial",
                "verdana": "fl-font-uio-verdana"
            },
            "theme": {
                "default": "fl-uio-default-theme",
                "bw": "fl-theme-uio-bw fl-theme-bw",
                "wb": "fl-theme-uio-wb fl-theme-wb",
                "by": "fl-theme-uio-by fl-theme-by",
                "yb": "fl-theme-uio-yb fl-theme-yb"
            },
            "layout": "fl-layout-linear",
            "links": "fl-link-enhanced",
            "inputsLarger": "fl-text-larger"
        },
        fontSizeMap: {
            "xx-small": "9px",
            "x-small":  "11px",
            "small":    "13px",
            "medium":   "15px",
            "large":    "18px",
            "x-large":  "23px",
            "xx-large": "30px"
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

        that.lateRefreshRelay = function () {
            that.events.lateRefreshView.fire(that);
        };
        that.updateFromSettingsStore();
        return that;
    };
    
    fluid.uiEnhancer.updateFromSettingsStore = function (that) {
        that.updateModel(that.settingsStore.fetch());
    };

    fluid.uiEnhancer.updateModel = function (newModel, applier) {
        applier.requestChange("", newModel);
    };

    fluid.uiEnhancer.applyTocSetting = function (that) {
        var async = false;
        if (that.model.toc) {
            if (that.tableOfContents) {
                that.tableOfContents.show();
            } else {
                that.events.onCreateTOCReady.fire();
                async = true;
            }
        } else {
            if (that.tableOfContents) {
                that.tableOfContents.hide();
            }
        }
        if (!async) {
            that.lateRefreshRelay();
        }
    };

    // Apply those UIEnhancer settings which require reading elements from the DOM - 
    // as opposed to those which may be honoured by static CSS styles
    fluid.uiEnhancer.applyDomReadingSettings = function (that) {
        that.emphasizeLinks.handleStyle(that.model);
        that.inputsLarger.handleStyle(that.model);
        that.setIE6ColorInversion(that); 
    };

    /**
     * Transforms the interface based on the settings in that.model
     */
    fluid.uiEnhancer.refreshView = function (that) {
        that.textSize.set(that.model.textSize);
        that.textFont.swap(that.model.textFont);
        that.lineSpacing.set(that.model.lineSpacing);
        that.theme.swap(that.model.theme);
        $(document).ready(function () {
            that.events.onCreateToc.fire();
        });
    };


//    /**
//     * Adds or removes the classname to/from the elements based upon the setting.
//     * @param {Object} elements
//     * @param {Object} setting
//     * @param {Object} classname
//     */
//    fluid.uiEnhancer.styleElements = function (elements, setting, classname) {
//        if (setting) {
//            elements.addClass(classname);
//        } else {
//            $("." + classname, elements).andSelf().removeClass(classname);
//        }        
//    };

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
    
})(jQuery, fluid_1_5);
