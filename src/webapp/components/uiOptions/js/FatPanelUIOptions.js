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

    /****************************
     * Fat Panel UI Options Imp *
     ****************************/ 
     
    fluid.defaults("fluid.fatPanelUIOptionsImpl", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        selectors: {
            iframe: ".flc-uiOptions-iframe"
        },       
        components: {      
            slidingPanel: {
                type: "fluid.slidingPanel",
                container: "{fatPanelUIOptionsImpl}.container",
                createOnEvent: "afterRender"
            },
            markupRenderer: {
                type: "fluid.renderIframe",
                container: "{fatPanelUIOptionsImpl}.dom.iframe",
                options: {
                    events: {
                        afterRender: "{fatPanelUIOptionsImpl}.events.afterRender"
                    },
                    styles: {
                        offScreen: "fl-offScreen-hidden",
                        containerFlex: "fl-container-flex",
                        container: "fl-uiOptions-fatPanel"
                    }
                }
            },
            pageEnhancer: {
                type: "fluid.pageEnhancer", 
                priority: "first"
            },
            eventBinder: {
                type: "fluid.uiOptionsEventBinder",
                options: {
                    components: {
                        pageEnhancer: "{fatPanelUIOptionsImpl}.pageEnhancer",
                        uiOptions: "{fatPanelUIOptionsImpl}.uiOptionsBridge.uiOptions",
                        slidingPanel: "{fatPanelUIOptionsImpl}.slidingPanel"
                    }
                },
                createOnEvent: "afterRender",
                priority: "last"
            },
            uiOptionsBridge: {
                type: "fluid.uiOptionsBridge",
                createOnEvent: "afterRender",
                priority: "first",
                options: {
                    components: { 
                        markupRenderer: "{fatPanelUIOptionsImpl}.markupRenderer"
                    }
                }
            }
        },
        events: {
            afterRender: null
        }
    });
    
    fluid.demands("fluid.uiEnhancer", ["fluid.fatPanelUIOptionsImpl", "fluid.uiOptionsBridge"], {
        options: {
            listeners: {
                modelChanged: "{fatPanelUIOptionsImpl}.markupRenderer.makeVisible"
            }
        }
    });
    
    /******************************
     * fluid.uiOptionsEventBinder *
     ******************************/
    
    fluid.defaults("fluid.uiOptionsEventBinder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptionsEventBinder.finalInit",
        components: {
            pageEnhancer: {
                type: "fluid.pageEnhancer"
            },
            uiOptions: {
                type: "fluid.uiOptions"
            },
            slidingPanel: {
                type: "fluid.slidingPanel"
            }
        }
    });
    
    fluid.uiOptionsEventBinder.finalInit = function (that) {
        that.uiOptions.events.modelChanged.addListener(function (model) {
            that.pageEnhancer.uiEnhancer.updateModel(model.selections);
        });
        that.slidingPanel.events.afterPanelHidden.addListener(function () {
            that.uiOptions.save();
        });
        that.slidingPanel.events.afterPanelShown.addListener(function () {
            that.uiOptions.pageEnhancer.uiEnhancer.updateFromSettingsStore();
        });
    };
    
    /**********************
     * fluid.renderIframe *
     **********************/
    
    fluid.defaults("fluid.renderIframe", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.renderIframe.finalInit",
        events: {
            afterRender: null
        },
        markupProps: {
            "class": "flc-iframe",
            src: "./uiOptionsIframe.html"
        }
    });
    
    fluid.renderIframe.finalInit = function (that) {
        var styles = that.options.styles;
        
        //create iframe and append to container
        $("<iframe/>", that.options.markupProps).appendTo(that.container);
        
        that.iframe = $(".flc-iframe", that.container);
        that.iframe.addClass(styles.containerFlex);
        that.iframe.addClass(styles.container);
        that.iframe.addClass(styles.offScreen);
        that.iframe.load(that.events.afterRender.fire);
        
        that.makeVisible = function () {
            that.iframe.removeClass(styles.offScreen);
        };
    };
    
    /*************************
     * fluid.uiOptionsBridge *
     *************************/
    
    fluid.defaults("fluid.uiOptionsBridge", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptionsBridge.finalInit",
        uiOptions: {
            type: "fluid.uiOptions",
            options: {
                components: {
                    pageEnhancer: {
                        type: "fluid.pageEnhancer",
                        priority: "first"
                    },
                    preview: {
                        type: "fluid.emptySubcomponent"
                    },
                    tabs: {
                        type: "fluid.tabs",
                        container: "body",      
                        createOnEvent: "onReady"               
                    }
                }
            }
        },        
        iframe: null
    });
    
    fluid.uiOptionsBridge.finalInit = function (that) {
        var iframe = that.markupRenderer.iframe;
        var iframeDoc = iframe.contents();
        var iframeWin = iframe[0].contentWindow;
        var innerFluid = iframeWin.fluid;
        var body = $("body", iframeDoc);      
        body.addClass(that.markupRenderer.options.styles.container);        
        
        that.uiOptions = innerFluid.invokeGlobalFunction(that.options.uiOptions.type, 
                [body, that.options.uiOptions.options], innerFluid);            
    };
    
    /************************
     * Fat Panel UI Options *
     ************************/
    
    fluid.registerNamespace("fluid.fatPanelUIOptions");

    fluid.fatPanelUIOptions = function (container, options) {
        return fluid.fatPanelUIOptionsImpl(container, 
                fluid.fatPanelUIOptions.mapOptions(options));
    };  
    
    fluid.defaults("fluid.fatPanelUIOptions", {
        gradeNames: ["fluid.viewComponent"]
    });     
    
    /**
    * @param {Object} source, original object
    * @param {Object} destination, object to copy options to
    * @param {String} defaultLocation, default path to move options location
    * @param {Object} map, move instructions format {key: location}
    */
    fluid.fatPanelUIOptions.moveOptions = function (source, destination, defaultLocation, map) {
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
    fluid.fatPanelUIOptions.mapOptions = function (options) {
        var newOpts = {};
        var componentPath = "components";
        var selectorPath = "selectors";
        var defaultBasePath = "components.uiOptionsBridge.uiOptions.options";
        
        var fatPanelComponentMapping = {
            slidingPanel: componentPath,
            pageEnhancer: componentPath,
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
                fluid.fatPanelUIOptions.moveOptions(value, newOpts, defaultPath, fatPanelComponentMapping);
            } else if (key === "selectors") {
                fluid.fatPanelUIOptions.moveOptions(value, newOpts, defaultPath, selectorMapping);
            } else {
                fluid.fatPanelUIOptions.moveOptions(value, newOpts, defaultPath);
            }
        });
            
        return newOpts;
    };
})(jQuery, fluid_1_4);