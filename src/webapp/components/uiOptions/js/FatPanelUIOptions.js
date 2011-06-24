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
    
    fluid.setLogging(true);   
    /****************************
     * Fat Panel UI Options Imp *
     ****************************/ 
     
    fluid.defaults("fluid.fatPanelUIOptionsImp", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        selectors: {
            iframe: ".flc-uiOptions-iframe"
        },       
        components: {      
            slidingPanel: {
                type: "fluid.slidingPanel",
                container: "{fatPanelUIOptionsImp}.container",
                createOnEvent: "afterRender"
            },
            preview: {
                type: "fluid.uiOptions.livePreview"
            },
            markupRenderer: {
                type: "fluid.renderIframe",
                container: "{fatPanelUIOptionsImp}.dom.iframe",
                options: {
                    events: {
                        afterRender: "{fatPanelUIOptionsImp}.events.afterRender"
                    },
                    styles: {
                        offScreen: "fl-offScreen-hidden",
                        container: "fl-container-flex"
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
                        pageEnhancer: "{fatPanelUIOptionsImp}.pageEnhancer",
                        uiOptions: "{fatPanelUIOptionsImp}.uiOptionsBridge.uiOptions",
                        slidingPanel: "{fatPanelUIOptionsImp}.slidingPanel"
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
                    markupRenderer: "{fatPanelUIOptionsImp}.markupRenderer"
                }
            }
        },
        events: {
            afterRender: null
        }
    });
    
    fluid.demands("fluid.uiEnhancer", ["fluid.fatPanelUIOptionsImp", "fluid.uiOptionsBridge"], {
        options: {
            listeners: {
                modelChanged: "{fatPanelUIOptionsImp}.markupRenderer.makeVisible"
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
        var markupRenderer = that.options.markupRenderer;
        var iframe = markupRenderer.iframe;
        var iframeDoc = iframe.contents();
        var iframeWin = iframe[0].contentWindow;
        
        that.uiOptions = fluid.invokeGlobalFunction(that.options.uiOptions.type, 
                [$("body", iframeDoc), that.options.uiOptions.options], iframeWin);            
    };
    
    /************************
     * Fat Panel UI Options *
     ************************/
    
    // this should be replaced with proper model transformation code
    var mapOptions = function (options) {
        options = fluid.copy(options);
        var newOpts = {};
        var iframeSelector = fluid.get(options, "selectors.iframe");
        var slidingPanel = fluid.get(options, "components.slidingPanel");
        var pageEnhancer = fluid.get(options, "components.pageEnhancer");
        var preview = fluid.get(options, "components.preview");
        var markupRenderer = fluid.get(options, "component.markupRenderer");
        
        if (iframeSelector) {
            fluid.set(newOpts, "selectors.iframe", iframeSelector);
            delete options.selectors.iframe;
        }
        
        if (slidingPanel) {
            fluid.set(newOpts, "components.slidingPanel", slidingPanel);
            delete options.components.slidingPanel;
        }
        
        if (preview) {
            fluid.set(newOpts, "components.preview", preview);
            delete options.components.preview;
        }
        
        if (pageEnhancer) {
            fluid.set(newOpts, "components.pageEnhancer", pageEnhancer);
            // don't delete this one, it is needed by both the inner and outer components
        }
        
        if (markupRenderer) {
            fluid.set(newOpts, "components.markupRenderer", markupRenderer);
            delete options.components.markupRenderer;
        }
        
        fluid.set(newOpts, "components.uiOptionsBridge.options.components.uiOptions.options", options);
            
        return newOpts;
    };
    
    fluid.fatPanelUIOptions = function (container, options) {
        return fluid.fatPanelUIOptionsImp(container, mapOptions(options));
    };  
    
    fluid.defaults("fluid.fatPanelUIOptions", {
        gradeNames: ["fluid.viewComponent"]
    });     
})(jQuery, fluid_1_4);