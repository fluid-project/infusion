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
                container: "{fatPanelUIOptionsImp}.container"
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
                    }
                }
            },
            uiEnhancer: {
                type: "fluid.pageEnhancer"
            },
            eventBinder: {
                type: "fluid.uiOptionsEventBinder",
                options: {
                    uiEnhancer: "{fatPanelUIOptionsImp}.uiEnhancer",
                    uiOptions: "{fatPanelUIOptionsImp}.uiOptionsBridge",
                    slidingPanel: "{fatPanelUIOptionsImp}.slidingPanel"
                },
                createOnEvent: "afterRender",
                priority: "last"
            },
            uiOptionsBridge: {
                type: "fluid.uiOptionsBridge",
                options: {
                    iframe: "{fatPanelUIOptionsImp}.markupRenderer.iframe",
                    uiOptionsOptions: { // needs a better name
                        components: {
                            uiEnhancer: {
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
                            },
                            textControls: {
                                resources: {
                                    template: {
                                        expander: {
                                            args: {
                                                url: "../../../../components/uiOptions/html/UIOptionsTemplate-text.html"
                                            }
                                        }
                                    }
                                }
                            },
                            layoutControls: {
                                resources: {
                                    template: {
                                        expander: {
                                            args: {
                                                url: "../../../../components/uiOptions/html/UIOptionsTemplate-layout.html"
                                            }
                                        }
                                    }
                                }
                            },
                            linkControls: {
                                resources: {
                                    template: {
                                        expander: {
                                            args: {
                                                url: "../../../../components/uiOptions/html/UIOptionsTemplate-links.html"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    resources: {
                        template: {
                            expander: {
                                args: {
                                    url: "../../../../components/uiOptions/html/FatPanelUIOptions.html"
                                }
                            }
                        }
                    }
                },
                createOnEvent: "afterRender"
            }
        },
        events: {
            afterRender: null
        }
    });
    
    /******************************
     * fluid.uiOptionsEventBinder *
     ******************************/
    
    fluid.defaults("fluid.uiOptionsEventBinder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptionsEventBinder.finalInit",
        uiEnhancer: null,
        uiOptions: null,
        slidingPanel: null
    });
    
    fluid.uiOptionsEventBinder.finalInit = function (that) {
        that.uiOptions.events.modelChanged.addListener(that.uiEnhancer.updateModel);
        that.slidingPanel.events.afterPanelHidden.addListener(that.uiOptions.save);
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
        //create iframe and append to container
        $("<iframe/>", that.options.markupProps).appendTo(that.container);
        
        that.iframe = $(".flc-iframe", that.container);
        that.iframe.load(that.events.afterRender.fire);
    };
    
    /*************************
     * fluid.uiOptionsBridge *
     *************************/
    
    fluid.uiOptionsBridge = function (options) {
        var that = fluid.initLittleComponent("fluid.uiOptionsBridge", options);
        var iframe = that.options.iframe;
        var iframeDoc = iframe.contents();
        var iframeWin = iframe[0].contentWindow;
        
        return iframeWin.fluid.uiOptions($("body", iframeDoc), that.options.uiOptionsOptions);
    };
    
    fluid.defaults("fluid.uiOptionsBridge", {
        gradeNames: ["fluid.littleComponent"],
        iframe: null, 
         mergePolicy: {
            uiOptionsOptions: "noexpand"  
        }
    });
    
    /************************
     * Fat Panel UI Options *
     ************************/
    
    // this should be replaced with proper model transformation code
    var mapOptions = function (options) {
        options = fluid.copy(options);
        var newOpts = {};
        var iframeSelector = fluid.get(options, "selectors.iframe");
        var slidingPanel = fluid.get(options, "components.slidingPanel");
        var uiEnhancer = fluid.get(options, "components.uiEnhancer");
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
        
        if (uiEnhancer) {
            fluid.set(newOpts, "components.uiEnhancer", uiEnhancer);
            // don't delete this one, it is needed by both the inner and outer components
        }
        
        if (markupRenderer) {
            fluid.set(newOpts, "components.markupRenderer", markupRenderer);
            delete options.components.markupRenderer;
        }
        
        fluid.set(newOpts, "components.uiOptionsBridge.options.uiOptionsOptions", options);
            
        return newOpts;
    };
    
    fluid.fatPanelUIOptions = function (container, options) {
        return fluid.fatPanelUIOptionsImp(container, mapOptions(options));
    };  
    
    fluid.defaults("fluid.fatPanelUIOptions", {
        gradeNames: ["fluid.viewComponent"]
    });     
})(jQuery, fluid_1_4);