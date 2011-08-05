/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true, jQuery, window*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {

    /***************************************
     * fluid.uiOptions.fatPanelEventBinder *
     ***************************************/
   
    fluid.defaults("fluid.uiOptions.fatPanelEventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptions.fatPanelEventBinder.finalInit",
        components: {
            uiOptionsLoader: {
                type: "fluid.uiOptions.loader"
            },
            slidingPanel: {
                type: "fluid.slidingPanel"
            }
        }
    });
    
    fluid.defaults("fluid.uiOptions.fatPanelEventBinder.binder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });
    
    fluid.uiOptions.fatPanelEventBinder.bindModelChanged = function (uiOptions, eventBinder) {
        eventBinder.uiOptions = uiOptions;
        uiOptions.events.modelChanged.addListener(function (model) {
            eventBinder.uiEnhancer.updateModel(model.selections);
        });
    };
    
    fluid.uiOptions.fatPanelEventBinder.finalInit = function (that) {
        //TODO: This binding should be done declaratively - needs ginger world in order to bind onto slidingPanel
        // which is a child of this component - and also uiOptionsLoader which is another child
        that.slidingPanel.events.afterPanelHidden.addListener(function () {
            that.uiOptions.save();
        });
        that.slidingPanel.events.afterPanelShown.addListener(function () {
            that.uiOptions.uiEnhancer.updateFromSettingsStore();
        });
    };
    

    /****************************
     * Fat Panel UI Options Imp *
     ****************************/ 
     
    fluid.defaults("fluid.uiOptions.fatPanel", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            iframe: ".flc-uiOptions-iframe"
        },
        relativePrefix: "./",  // Prefix for "other world" component templates relative to the iframe URL
        components: {      
            slidingPanel: {
                type: "fluid.slidingPanel",
                container: "{fatPanel}.container",
                createOnEvent: "afterRender"
            },
            markupRenderer: {
                type: "fluid.uiOptions.renderIframe",
                container: "{fatPanel}.dom.iframe",
                options: {
                    markupProps: {
                        src: "%prefix/FatPanelUIOptionsFrame.html"
                    },
                    events: {
                        afterRender: "{fatPanel}.events.afterRender"
                    },
                    styles: {
                        containerFlex: "fl-container-flex",
                        container: "fl-uiOptions-fatPanel"
                    }
                }
            },
            uiEnhancer: "{uiEnhancer}",
            eventBinder: {
                type: "fluid.uiOptions.fatPanelEventBinder",
                options: {
                    components: {
                        uiEnhancer: "{fatPanel}.uiEnhancer",
                        uiOptionsLoader: "{fatPanel}.bridge.uiOptionsLoader",
                        slidingPanel: "{fatPanel}.slidingPanel",
                        binder: {
                            type: "fluid.uiOptions.fatPanelEventBinder.binder",
                            priority: "last",
                            options: {
                                events: {
                                    onUIOptionsComponentReady: {
                                        event: "{uiOptionsLoader}.events.onUIOptionsComponentReady",
                                        args: ["{arguments}.0", "{fluid.uiOptions.fatPanelEventBinder}"]
                                    }
                                },
                                listeners: {
                                    // This literal specification works around FLUID-4337
                                    onUIOptionsComponentReady: fluid.uiOptions.fatPanelEventBinder.bindModelChanged
                                }
                            }
                        }
                    }
                },
                createOnEvent: "afterRender",
                priority: "last"
            },
            bridge: {
                type: "fluid.uiOptions.bridge",
                createOnEvent: "afterRender",
                priority: "first",
                options: {
                    components: { 
                        markupRenderer: "{fatPanel}.markupRenderer"
                    }
                }
            }
        },
        uiOptionsTransform: {
            transformer: "fluid.uiOptions.mapOptions",
            config: {
                "*.slidingPanel":                              "slidingPanel",
                "*.markupRenderer":                            "markupRenderer",
                "*.markupRenderer.options.prefix":             "prefix",
                "*.eventBinder":                               "eventBinder",
                "selectors.iframe":                            "iframe",
                "*.bridge.options.templateLoader":             "templateLoader",
                "*.bridge.options.prefix":                     "relativePrefix",
                "*.bridge.options.uiOptions":                  "uiOptions",
                "*.bridge.options.textControls":               "textControls",
                "*.bridge.options.layoutControls":             "layoutControls",
                "*.bridge.options.linksControls":              "linksControls"
            }
        },
        events: {
            afterRender: null
        }
    });
    
    /********************************
     * fluid.uiOptions.renderIframe *
     ********************************/
    
    fluid.defaults("fluid.uiOptions.renderIframe", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptions.renderIframe.finalInit",
        events: {
            afterRender: null
        },
        styles: {
            containerFlex: "fl-container-flex",
            container: "fl-uiOptions-fatPanel-iframe"
        },
        prefix: "./",
        markupProps: {
            "class": "flc-iframe",
            src: "%prefix/uiOptionsIframe.html"
        }
    });
    
    fluid.uiOptions.renderIframe.finalInit = function (that) {
        var styles = that.options.styles;
        that.options.markupProps = fluid.uiOptions.transformUrls(that.options.markupProps, that.options.prefix);
        that.iframeSrc = that.options.markupProps.src;
        
        //create iframe and append to container
        $("<iframe/>", that.options.markupProps).appendTo(that.container);
        
        // find the correct iframe
        $("iframe").each(function (idx, iframeElm) {
            var iframe = $(iframeElm);
            if (iframe.hasClass(that.options.markupProps["class"])) {
                that.iframe = iframe;
                return false;
            }
        });
        
        that.iframe.addClass(styles.containerFlex);
        that.iframe.addClass(styles.container);
        that.iframe.load(that.events.afterRender.fire);
    };
    
    /***********************************
     * fluid.uiOptions.bridge *
     ***********************************/
    
    fluid.defaults("fluid.uiOptions.bridge", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptions.bridge.finalInit",  
        iframe: null
    });
    
    fluid.defaults("fluid.uiOptions.FatPanelOtherWorldLoader", {
        gradeNames: ["fluid.uiOptions.inline", "autoInit"],
        uiOptionsTransform: {
            config: {
                "*.uiOptionsLoader.*.uiOptions": {
                    options: {
                        components: {
                            uiEnhancer: "{uiEnhancer}",
                            settingsStore: "{uiEnhancer}.settingsStore",
                            preview: {
                                type: "fluid.emptySubcomponent"
                            },
                            tabs: {
                                type: "fluid.tabs",
                                container: "body",      
                                createOnEvent: "onUIOptionsComponentReady"
                            }
                        }
                    }
                }
            }
        }
    });
    
    fluid.uiOptions.bridge.finalInit = function (that) {
        var iframe = that.markupRenderer.iframe;
        var origPrefix = that.markupRenderer.options.prefix;
        var iframeDoc = iframe.contents();
        var iframeWin = iframe[0].contentWindow;
        var innerFluid = iframeWin.fluid;
        var container = $("body", iframeDoc);
        var outerLocation = window.location.href;
        var iframeLocation = iframeWin.location.href;
        var relativePrefix = fluid.url.computeRelativePrefix(outerLocation, iframeLocation, origPrefix);
        that.options.relativePrefix = relativePrefix; // TODO: more flexible defaulting here
        container.addClass(that.markupRenderer.options.styles.container);
        
        var overallOptions = {};
        overallOptions.container = container;
        var bridgeMapping = fluid.defaults("fluid.uiOptions.fatPanel").uiOptionsTransform.config;
        
        var swappedBridgeMapping = {};
        
        // Swap the mapping for easier extraction on FatPanelOtherWorldLoader options
        fluid.each(bridgeMapping, function (value, key) {
            if (typeof value === "string") {
                swappedBridgeMapping[value] = key;
            }
        });

        // Extracts the mappings that only belong to FatPanelOtherWorldLoader
        fluid.each(swappedBridgeMapping, function (value, key) {
            if (value.indexOf("*.bridge") === 0 && that.options[key]) {
                // find out the option name used in the other world
                var keyInOtherWorld = value.substring(value.lastIndexOf(".") + 1);
                fluid.set(overallOptions, keyInOtherWorld, that.options[key]);
            }
        });

        var defaults = fluid.defaults("fluid.uiOptions.FatPanelOtherWorldLoader");
        var mappedOptions = fluid.uiOptions.mapOptions(overallOptions, defaults.uiOptionsTransform.config, defaults.mergePolicy);

        var component = innerFluid.invokeGlobalFunction("fluid.uiOptions.FatPanelOtherWorldLoader", [container, mappedOptions]);  
        that.uiOptionsLoader = component.uiOptionsLoader;
    };
    
    /************************
     * Fat Panel UI Options *
     ************************/
    
    fluid.uiOptions.fatPanel = function (container, options) {
        var defaults = fluid.defaults("fluid.uiOptions.fatPanel");
        var config = defaults.uiOptionsTransform.config;
        
        var mappedOptions = fluid.uiOptions.mapOptions(options, config, defaults.mergePolicy, config);

        var that = fluid.initView("fluid.uiOptions.fatPanel", container, mappedOptions);
        fluid.initDependents(that);
        return that; 
    };

})(jQuery, fluid_1_4);