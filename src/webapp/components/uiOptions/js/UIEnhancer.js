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
     * CSSClassEnhancerBase
     *
     * Provides the map between the settings and css classes to be applied. 
     * Used as a UIEnhancer base grade that can be pulled in as requestd.
     *******************************************************************************/
    
    fluid.defaults("fluid.uiEnhancer.cssClassEnhancerBase", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
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
        }
    });

    /*******************************************************************************
     * BrowserTextEnhancerBase
     *
     * Provides the default font size translation between the strings and actual pixels. 
     * Used as a UIEnhancer base grade that can be pulled in as requestd.
     *******************************************************************************/
    
    fluid.defaults("fluid.uiEnhancer.browserTextEnhancerBase", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        fontSizeMap: {
            "xx-small": "9px",
            "x-small":  "11px",
            "small":    "13px",
            "medium":   "15px",
            "large":    "18px",
            "x-large":  "23px",
            "xx-large": "30px"
        }
    });

    /*******************************************************************************
     * UI Enhancer                                                                 *
     *                                                                             *
     * Works in conjunction with FSS to transform the page based on user settings. *
     *******************************************************************************/
    
    fluid.defaults("fluid.uiEnhancer", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
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
                args: ["{arguments}.0", "{uiEnhancer}.applier"]
            },
            updateFromSettingsStore: {
                funcName: "fluid.uiEnhancer.updateFromSettingsStore",
                args: ["{uiEnhancer}"]
            }
        },
        events: {
            onAsyncEnactorsReady: null
        }
    });

    fluid.uiEnhancer.updateFromSettingsStore = function (that) {
        that.updateModel(that.settingsStore.fetch());
    };

    fluid.uiEnhancer.updateModel = function (newModel, applier) {
        applier.requestChange("", newModel);
    };
    
    fluid.uiEnhancer.finalInit = function (that) {
        that.updateFromSettingsStore();
    };

    /*******************************************************************************
     * UI Enhancer Default Actions
     *
     * A grade component for UIEnhancer. It is a collection of default UI Enhancer 
     * action ants.
     *******************************************************************************/
    
    fluid.defaults("fluid.uiEnhancer.defaultActions", {
        gradeNames: ["fluid.uiEnhancer", "fluid.uiEnhancer.cssClassEnhancerBase", "fluid.uiEnhancer.browserTextEnhancerBase", "autoInit"],
        components: {
            textSize: {
                type: "fluid.uiOptions.enactors.textSizer",
                container: "{uiEnhancer}.container",
                options: {
                    fontSizeMap: "{uiEnhancer}.options.fontSizeMap",
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "textSize": "value"
                    }
                }
            },
            textFont: {
                type: "fluid.uiOptions.enactors.classSwapper",
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
                type: "fluid.uiOptions.enactors.lineSpacer",
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
                type: "fluid.uiOptions.enactors.classSwapper",
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
                type: "fluid.uiOptions.enactors.emphasizeLinks",
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
                type: "fluid.uiOptions.enactors.inputsLarger",
                container: "{uiEnhancer}.container",
                options: {
                    cssClass: "{uiEnhancer}.options.classnameMap.inputsLarger",
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "inputsLarger": "value"
                    }
                }
            },
            tableOfContents: {
                type: "fluid.uiOptions.enactors.tableOfContents",
                container: "{uiEnhancer}.container",
                createOnEvent: "onCreateToc",
                options: {
                    tocTemplate: "{uiEnhancer}.options.tocTemplate",
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "toc": "value"
                    },
                    listeners: {
                        afterTocRender: "{uiEnhancer}.events.onAsyncEnactorsReady",
                        onLateRefreshRelay: "{uiEnhancer}.events.onAsyncEnactorsReady"
                    }
                }
            },
            IE6ColorInversion: {
                type: "fluid.uiOptions.enactors.IE6ColorInversion",
                container: "{uiEnhancer}.container",
                options: {
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "theme": "value"
                    }
                }
            }
        },
        events: {
            onCreateToc: null
        },
        listeners: {
            onAsyncEnactorsReady: [{
                listener: "{that}.emphasizeLinks.handleStyle",
                args: "{that}.model.links"
            }, {
                listener: "{that}.inputsLarger.handleStyle",
                args: "{that}.model.inputsLarger"
            }, {
                listener: "{that}.IE6ColorInversion.setIE6ColorInversion",
                args: "{that}.model.theme"
            }]
        },
        finalInitFunction: "fluid.uiEnhancer.defaultActions.finalInit"
    });

    fluid.uiEnhancer.defaultActions.finalInit = function (that) {
        $(document).ready(function () {
            that.events.onCreateToc.fire();
            
            // Directly calling toc apply function rather than firing a model change request
            // is because the modelRelay component prevents the relay on the unchanged value.
            that.tableOfContents.applyToc(that.model.toc);
        });
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
