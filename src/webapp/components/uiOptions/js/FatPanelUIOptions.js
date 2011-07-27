/*
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

    fluid.demands("fluid.uiOptions.templatePath", "fluid.uiOptions.fatPanelUIOptions", {
        options: {
            value: "{fatPanelUIOptions}.options.prefix"
        }
    });
    
    /***************************************
     * fluid.uiOptions.fatPanelEventBinder *
     ***************************************/
   
    fluid.defaults("fluid.uiOptions.fatPanelEventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptions.fatPanelEventBinder.finalInit",
        components: {
            uiEnhancer: {
                type: "fluid.uiEnhancer"
            },
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
     
    fluid.defaults("fluid.uiOptions.fatPanelUIOptions", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            iframe: ".flc-uiOptions-iframe"
        },       
        components: {      
            slidingPanel: {
                type: "fluid.slidingPanel",
                container: "{fatPanelUIOptions}.container",
                createOnEvent: "afterRender"
            },
            markupRenderer: {
                type: "fluid.uiOptions.renderIframe",
                container: "{fatPanelUIOptions}.dom.iframe",
                options: {
                    events: {
                        afterRender: "{fatPanelUIOptions}.events.afterRender"
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
                        uiEnhancer: "{fatPanelUIOptions}.uiEnhancer",
                        uiOptionsLoader: "{fatPanelUIOptions}.uiOptionsBridge.uiOptionsLoader",
                        slidingPanel: "{fatPanelUIOptions}.slidingPanel",
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
            uiOptionsBridge: {
                type: "fluid.uiOptions.uiOptionsBridge",
                createOnEvent: "afterRender",
                priority: "first",
                options: {
                    components: { 
                        markupRenderer: "{fatPanelUIOptions}.markupRenderer"
                    }
                }
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
        markupProps: {
            "class": "flc-iframe",
            src: "./uiOptionsIframe.html"
        }
    });
    
    fluid.uiOptions.renderIframe.finalInit = function (that) {
        var styles = that.options.styles;
        
        //create iframe and append to container
        $("<iframe/>", that.options.markupProps).appendTo(that.container);
        
        // find the correct iframe
        $("iframe").each(function (idx, iframeElm) {
            var iframe = $(iframeElm);
            if(iframe.hasClass(that.options.markupProps["class"])) {
                that.iframe = iframe;
                return false;
            }
        });
        
        that.iframe.addClass(styles.containerFlex);
        that.iframe.addClass(styles.container);
        that.iframe.load(that.events.afterRender.fire);
    };
    
    /***********************************
     * fluid.uiOptions.uiOptionsBridge *
     ***********************************/
    
    fluid.defaults("fluid.uiOptions.uiOptionsBridge", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptions.uiOptionsBridge.finalInit",  
        iframe: null,
        uiOptionsOptions: {}
    });
    
    fluid.defaults("fluid.uiOptions.FatPanelOtherWorldLoader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            templateLoader: {
                priority: "first",
                type: "fluid.uiOptions.templateLoader"
            },  
            uiOptionsLoader: {
                type: "fluid.uiOptions.loader",
                container: "{FatPanelOtherWorldLoader}.container"
            }
        }
    });
    
    // Options for UIOptions in fat panel mode
    fluid.demands("fluid.uiOptions", ["fluid.uiOptions.FatPanelOtherWorldLoader"], {
        options: {
            components: {
                uiEnhancer: "{uiEnhancer}",
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
    });
    
    fluid.uiOptions.uiOptionsBridge.finalInit = function (that) {
        var iframe = that.markupRenderer.iframe;
        var iframeDoc = iframe.contents();
        var iframeWin = iframe[0].contentWindow;
        var innerFluid = iframeWin.fluid;
        var body = $("body", iframeDoc);      
        body.addClass(that.markupRenderer.options.styles.container);
        var uiOptionsOptions = {
            options: that.options.uiOptionsOptions,
            container: body
        };
        var overallOptions = {};
        // TODO: Awful hard-wiring of dependence on exact component path
        fluid.set(overallOptions, "components.uiOptionsLoader.options.components.uiOptions.options", uiOptionsOptions);
        
        var component = innerFluid.invokeGlobalFunction("fluid.uiOptions.FatPanelOtherWorldLoader", [body, overallOptions]);  
        that.uiOptionsLoader = component.uiOptionsLoader;
    };
    
    /************************
     * Fat Panel UI Options *
     ************************/
    
    fluid.uiOptions.fatPanelUIOptions = function (container, options) {
        var mappedOptions = fluid.uiOptions.fatPanelUIOptions.mapOptions(options);
        var that = fluid.initView("fluid.uiOptions.fatPanelUIOptions", container, mappedOptions);
        fluid.initDependents(that);
        return that; 
    };

    /**
    * @param {Object} source, original object
    * @param {Object} destination, object to copy options to
    * @param {String} defaultLocation, default path to move options location
    * @param {Object} map, move instructions format {key: location}
    */
    fluid.uiOptions.fatPanelUIOptions.moveOptions = function (source, destination, defaultLocation, map) {
        fluid.each(source, function (value, key) {
            var location = (map && map[key]) || defaultLocation || "";
            fluid.set(destination, (location ? location + "." : "") + key, value);
        });
    };
    
    // TODO: Maybe we need a framework function for model transformation to
    //       replace the code below? 
    /**
    * @param {Object} options, top level options to be mapped
    */
    fluid.uiOptions.fatPanelUIOptions.mapOptions = function (options) {
        var newOpts = {};
        var componentPath = "components";
        var selectorPath = "selectors";
        var defaultBasePath = "components.uiOptionsBridge.options.uiOptionsOptions";
        
        var fatPanelComponentMapping = {
            slidingPanel: componentPath,
            uiEnhancer: componentPath,
            preview: componentPath,
            markupRenderer: componentPath,
            eventBinder: componentPath
        };
        var selectorMapping = {
            iframe: selectorPath
        };
        
        fluid.each(options, function (value, key) {
            var defaultPath = defaultBasePath + "." + key;
            if (key === "components") {
                fluid.uiOptions.fatPanelUIOptions.moveOptions(value, newOpts, defaultPath, fatPanelComponentMapping);
            } else if (key === "selectors") {
                fluid.uiOptions.fatPanelUIOptions.moveOptions(value, newOpts, defaultPath, selectorMapping);
            } else {
                fluid.uiOptions.fatPanelUIOptions.moveOptions(value, newOpts, defaultPath);
            }
        });

        return newOpts;
    };
})(jQuery, fluid_1_4);