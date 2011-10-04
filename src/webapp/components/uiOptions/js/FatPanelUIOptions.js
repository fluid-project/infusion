/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

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
    
    fluid.registerNamespace("fluid.dom");
    
    fluid.dom.getDocumentHeight = function (dokkument) {
        var body = $("body", dokkument)[0]; 
        return body.offsetHeight;
    };
    
    fluid.uiOptions.fatPanelEventBinder.updateView = function (uiOptions) {
        uiOptions.uiEnhancer.updateFromSettingsStore();
        uiOptions.events.onSignificantDOMChange.fire();
    };
    
    fluid.uiOptions.fatPanelEventBinder.bindLateEvents = function (uiOptions, eventBinder, fatPanel) {
        eventBinder.uiOptions = uiOptions;
        uiOptions.events.modelChanged.addListener(function (model) {
            eventBinder.uiEnhancer.updateModel(model.selections);
            uiOptions.save();
        });
        uiOptions.events.onReset.addListener(function (uiOptions) {
            fluid.uiOptions.fatPanelEventBinder.updateView(uiOptions);
        });
        uiOptions.events.onSignificantDOMChange.addListener(function () {
            var dokkument = uiOptions.container[0].ownerDocument;
            var height = fluid.dom.getDocumentHeight(dokkument);
            var iframe = fatPanel.markupRenderer.iframe;
            var attrs = {height: height + 15}; // TODO: Configurable padding here
            iframe.animate(attrs, 400);
        });
        
        fatPanel.slidingPanel.events.afterPanelHide.addListener(function () {
            fatPanel.markupRenderer.iframe.height(0);
        });
    };
        
    fluid.uiOptions.fatPanelEventBinder.finalInit = function (that) {
        //TODO: This binding should be done declaratively - needs ginger world in order to bind onto slidingPanel
        // which is a child of this component - and also uiOptionsLoader which is another child
        that.slidingPanel.events.afterPanelShow.addListener(function () {
            fluid.uiOptions.fatPanelEventBinder.updateView(that.uiOptions);
        });
    };
    
    // show immediately, animation will be done after size calculation above
    fluid.uiOptions.fatPanelEventBinder.showPanel = function (panel, callback) {
        panel.show();
        // A bizarre race condition has emerged under FF where the iframe held within the panel does not
        // react synchronously to being shown
        setTimeout(callback, 1);
    };

    /***************************************************************
     * Fat Panel UI Options Top Level Driver (out in normal world) *
     ***************************************************************/ 
     
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
                options: {
                    invokers: {
                        operateShow: {
                            funcName: "fluid.uiOptions.fatPanelEventBinder.showPanel"
                        }  
                    }
                },
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
                                        args: ["{arguments}.0", "{fluid.uiOptions.fatPanelEventBinder}", "{fatPanel}"]
                                    }
                                },
                                listeners: {
                                    // This literal specification works around FLUID-4337
                                    // The actual behaviour should really be handled by FLUID-4335
                                    onUIOptionsComponentReady: fluid.uiOptions.fatPanelEventBinder.bindLateEvents
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
                        uiEnhancer: "{fatPanel}.uiEnhancer",
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
                "*.bridge.options.uiOptionsLoader":            "uiOptionsLoader",
                "*.bridge.options.uiOptions":                  "uiOptions",
                "*.bridge.options.textControls":               "textControls",
                "*.bridge.options.layoutControls":             "layoutControls",
                "*.bridge.options.linksControls":              "linksControls",
                "*.bridge.options.uiEnhancer":                 "uiEnhancer"
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
            // This overflow specification fixes anomalous x overflow on FF, but may not on IE
            style: "overflow-x:hidden; overflow-y:auto;",
            "class": "flc-iframe",
            src: "%prefix/uiOptionsIframe.html"
        }
    });
    
    fluid.uiOptions.renderIframe.finalInit = function (that) {
        var styles = that.options.styles;
        // TODO: get earlier access to templateLoader, 
        that.options.markupProps.src = fluid.stringTemplate(that.options.markupProps.src, {"prefix/": that.options.prefix});
        that.iframeSrc = that.options.markupProps.src;
        
        //create iframe and append to container
        that.iframe = $("<iframe/>");
        that.iframe.load(function () {
            that.events.afterRender.fire();
        });
        that.iframe.attr(that.options.markupProps);
        
        that.iframe.addClass(styles.containerFlex);
        that.iframe.addClass(styles.container);

        that.iframe.appendTo(that.container);
    };
    
    /***********************************
     * fluid.uiOptions.bridge *
     ***********************************/
    
    fluid.defaults("fluid.uiOptions.bridge", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptions.bridge.finalInit",  
        iframe: null
    });
    
    // TODO: This function is only necessary through lack of listener boiling power - it should
    // be possible to directly relay one event firing to another, FLUID-4398
    fluid.uiOptions.tabSelectRelay = function (uiOptions) {
        uiOptions.events.onSignificantDOMChange.fire();
    };
    
    fluid.defaults("fluid.uiOptions.FatPanelOtherWorldLoader", {
        gradeNames: ["fluid.uiOptions.inline", "autoInit"],
        // TODO: This material is not really transformation, but would be better expressed by
        // FLUID-4392 additive demands blocks
        derivedDefaults: {
            uiOptions: {
                options: {
                    events: {
                        onSignificantDOMChange: null  
                    },
                    components: {
                        uiEnhancer: {
                            type: "fluid.uiEnhancer",
                            container: "body",
                            priority: "first",
                            options: {
                                tocTemplate: "../../tableOfContents/html/TableOfContents.html"
                            }
                        },
                        settingsStore: "{uiEnhancer}.settingsStore",
                        preview: {
                            type: "fluid.emptySubcomponent"
                        },
                        tabs: {
                            type: "fluid.tabs",
                            container: "body",
                            createOnEvent: "onUIOptionsComponentReady",
                            options: {
                                events: { // TODO: this mess required through lack of FLUID-4398
                                    boiledTabShow: {
                                        event: "tabsshow",
                                        args: ["{uiOptions}"]
                                    }
                                },
                                listeners: { // FLUID-4337 bug again
                                    boiledTabShow: fluid.uiOptions.tabSelectRelay
                                }
                            }
                        }
                    }
                }
            }
        },
        uiOptionsTransform: {
            config: { // For FLUID-4409
                "!*.uiOptionsLoader.*.uiOptions.*.uiEnhancer.options": "uiEnhancer.options"
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
        
        var overallOptions = {};
        overallOptions.container = container;
        var bridgeMapping = fluid.defaults("fluid.uiOptions.fatPanel").uiOptionsTransform.config;
        
        var swappedBridgeMapping = {};
        
        // Swap the mapping for easier extraction on FatPanelOtherWorldLoader options
        fluid.each(bridgeMapping, function (value, key) {
            swappedBridgeMapping[value] = key;
        });

        // Extracts the mappings that only belong to FatPanelOtherWorldLoader
        var bridgeSymbol = "*.bridge.options";
        fluid.each(swappedBridgeMapping, function (value, key) {
            if (value.indexOf(bridgeSymbol) === 0 && that.options[key]) {
                // find out the option name used in the other world
                var keyInOtherWorld = value.substring(bridgeSymbol.length + 1);
                fluid.set(overallOptions, keyInOtherWorld, that.options[key]);
            }
        });

        var defaults = fluid.defaults("fluid.uiOptions.FatPanelOtherWorldLoader");
        // Hack for FLUID-4409: Capabilities of our ad hoc "mapOptions" function have been exceeded - put weak priority instance of outer
        // merged options into the inner world
        fluid.set(overallOptions, "uiEnhancer.options", that.uiEnhancer.options.originalUserOptions);
        var mappedOptions = fluid.uiOptions.mapOptions(overallOptions, defaults.uiOptionsTransform.config, defaults.mergePolicy, 
            fluid.copy(defaults.derivedDefaults));
        var component = innerFluid.invokeGlobalFunction("fluid.uiOptions.FatPanelOtherWorldLoader", [container, mappedOptions]);
        that.uiOptionsLoader = component.uiOptionsLoader;
    };
    
    /************************
     * Fat Panel UI Options *
     ************************/
    
    fluid.uiOptions.fatPanel = function (container, options) {
        var defaults = fluid.defaults("fluid.uiOptions.fatPanel");
        var config = defaults.uiOptionsTransform.config;
        
        var mappedOptions = fluid.uiOptions.mapOptions(options, config, defaults.mergePolicy);

        var that = fluid.initView("fluid.uiOptions.fatPanel", container, mappedOptions);
        fluid.initDependents(that);
        return that; 
    };

})(jQuery, fluid_1_4);