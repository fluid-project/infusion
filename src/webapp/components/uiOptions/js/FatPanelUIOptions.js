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
/*global fluid_1_5:true, jQuery, window*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    fluid.registerNamespace("fluid.dom");
    
    fluid.dom.getDocumentHeight = function (dokkument) {
        var body = $("body", dokkument)[0]; 
        return body.offsetHeight;
    };

    /*****************************************
     * Fat Panel UI Options Top Level Driver *
     *****************************************/
     
    fluid.registerNamespace("fluid.uiOptions.fatPanel"); 

    fluid.defaults("fluid.uiOptions.fatPanel", {
        gradeNames: ["fluid.uiOptions.inline"],
        events: {
            afterRender: null,
            onReady: null
        },
        listeners: {
            onReady: {
                listener: "fluid.uiOptions.fatPanel.bindEvents",
                args: ["{arguments}.0.uiOptions", "{uiEnhancer}", "{iframeRenderer}.iframeEnhancer", "{fatPanel}"]
            }
        },
        selectors: {
            iframe: ".flc-uiOptions-iframe"
        },
        components: {
            pageEnhancer: "{uiEnhancer}",
            slidingPanel: {
                type: "fluid.slidingPanel",
                container: "{fatPanel}.container",
                options: {
                    invokers: {
                        operateShow: {
                            funcName: "fluid.uiOptions.fatPanel.showPanel"
                        },
                        operateHide: {
                            funcName: "fluid.uiOptions.fatPanel.hidePanel"
                        } 
                    }
                },
                createOnEvent: "afterRender"
            },
            iframeRenderer: {
                type: "fluid.uiOptions.fatPanel.renderIframe",
                container: "{fatPanel}.dom.iframe",
                options: {
                    markupProps: {
                        src: "%prefix/FatPanelUIOptionsFrame.html"
                    },
                    events: {
                        afterRender: "{fatPanel}.events.afterRender"
                    },
                    components: {
                        iframeEnhancer: {
                            type: "fluid.uiEnhancer",
                            container: "{iframeRenderer}.renderUIOContainer",
                            createOnEvent: "afterRender",
                            options: {
                                components: {
                                    settingsStore: "{pageEnhancer}.settingsStore"  
                                },
                                jQuery: "{iframeRenderer}.jQuery",
                                tocTemplate: "{pageEnhancer}.options.tocTemplate"
                            }
                        }
                    }
                }
            }
        },
        // TODO: This material is not really transformation, but would be better expressed by
        // FLUID-4392 additive demands blocks
        derivedDefaults: {
            uiOptionsLoader: {
                options: {
                    events: {
                        templatesAndIframeReady: {
                            events: {
                                iframeReady: "{fatPanel}.events.afterRender",
                                templateReady: "onUIOptionsTemplateReady"
                            }  
                        },
                        onReady: "{fatPanel}.events.onReady"
                    }
                }
            },
            uiOptions: {
                createOnEvent: "templatesAndIframeReady",
                container: "{iframeRenderer}.renderUIOContainer",
                options: {
                    // ensure that model and applier are available to users at top level
                    model: "{fatPanel}.model",
                    applier: "{fatPanel}.applier",
                    events: {
                        onSignificantDOMChange: null  
                    },
                    components: {
                        iframeRenderer: "{fatPanel}.iframeRenderer",
                        settingsStore: "{uiEnhancer}.settingsStore",
                        preview: {
                            type: "fluid.emptySubcomponent"
                        },
                        tabs: {
                            type: "fluid.tabs",
                            container: "{uiOptions}.container",
                            createOnEvent: "onUIOptionsComponentReady",
                            options: {
                                listeners: {
                                    tabsshow: {
                                        listener: "{uiOptions}.events.onSignificantDOMChange"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        uiOptionsTransform: {
            config: { // For FLUID-4409
                "!*.iframeRenderer.*.iframeEnhancer.options":  "outerEnhancerOptions",
                "*.slidingPanel":                              "slidingPanel",
                "*.iframeRenderer":                            "iframeRenderer",
                "*.iframeRenderer.options.prefix":             "prefix",
                "selectors.iframe":                            "iframe"
            }
        }
    });
    
    fluid.uiOptions.fatPanel.optionsProcessor = function (options) {
        var enhancerOptions = fluid.get(fluid, "staticEnvironment.uiEnhancer.options.originalUserOptions");
        options.outerEnhancerOptions = enhancerOptions;
        // Necessary to make IoC self-references work in the absence of FLUID-4392. Also see FLUID-4636
        options.nickName = "fatPanel"; 
        return options;
    };
        
    fluid.uiOptions.inline.makeCreator("fluid.uiOptions.fatPanel", fluid.uiOptions.fatPanel.optionsProcessor);
    
    /*****************************************
     * fluid.uiOptions.fatPanel.renderIframe *
     *****************************************/
    
    fluid.defaults("fluid.uiOptions.fatPanel.renderIframe", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.uiOptions.fatPanel.renderIframe.finalInit",
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
    
    fluid.uiOptions.fatPanel.renderIframe.finalInit = function (that) {
        var styles = that.options.styles;
        // TODO: get earlier access to templateLoader, 
        that.options.markupProps.src = fluid.stringTemplate(that.options.markupProps.src, {"prefix/": that.options.prefix});
        that.iframeSrc = that.options.markupProps.src;
        
        //create iframe and append to container
        that.iframe = $("<iframe/>");
        that.iframe.load(function () {
            var iframeWindow = that.iframe[0].contentWindow;
            that.iframeDocument = iframeWindow.document;

            //var iframeDoc = that.iframe.contents();
            that.jQuery = iframeWindow.jQuery;
            that.renderUIOContainer = that.jQuery("body", that.iframeDocument);
            that.jQuery(that.iframeDocument).ready(that.events.afterRender.fire);
        });
        that.iframe.attr(that.options.markupProps);
        
        that.iframe.addClass(styles.containerFlex);
        that.iframe.addClass(styles.container);

        that.iframe.appendTo(that.container);
    };
        
    fluid.uiOptions.fatPanel.updateView = function (uiOptions, uiEnhancer) {
        uiEnhancer.updateFromSettingsStore();
        uiOptions.events.onSignificantDOMChange.fire();
    };
    
    fluid.uiOptions.fatPanel.bindEvents = function (uiOptions, uiEnhancer, iframeEnhancer, fatPanel) {
        // TODO: This binding should be done declaratively - needs ginger world in order to bind onto slidingPanel
        // which is a child of this component - and also uiOptionsLoader which is another child
        fatPanel.slidingPanel.events.afterPanelShow.addListener(function () {
            fluid.uiOptions.fatPanel.updateView(uiOptions, iframeEnhancer);
        });  
    
        uiOptions.events.modelChanged.addListener(function (model) {
            uiEnhancer.updateModel(model.selections);
            uiOptions.save();
        });
        uiOptions.events.onReset.addListener(function (uiOptions) {
            fluid.uiOptions.fatPanel.updateView(uiOptions, iframeEnhancer);
        });
        uiOptions.events.onSignificantDOMChange.addListener(function () {
            var dokkument = uiOptions.container[0].ownerDocument;
            var height = fluid.dom.getDocumentHeight(dokkument);
            var iframe = fatPanel.iframeRenderer.iframe;
            var attrs = {height: height + 15}; // TODO: Configurable padding here
            var panel = fatPanel.slidingPanel.locate("panel");
            panel.css({height: ""});
            iframe.animate(attrs, 400);
        });
        
        fatPanel.slidingPanel.events.afterPanelHide.addListener(function () {
            fatPanel.iframeRenderer.iframe.height(0);
        });
    };

    // Replace the standard animator since we don't want the panel to become hidden
    // (potential cause of jumping)
    fluid.uiOptions.fatPanel.hidePanel = function (panel, callback) {
        $(panel).animate({height: 0}, {duration: 400, complete: callback});
    };
    
    // no activity - the kickback to the updateView listener will automatically trigger the
    // DOMChangeListener above. This ordering is preferable to avoid causing the animation to
    // jump by refreshing the view inside the iframe
    fluid.uiOptions.fatPanel.showPanel = function (panel, callback) {
        // A bizarre race condition has emerged under FF where the iframe held within the panel does not
        // react synchronously to being shown
        setTimeout(callback, 1);
    };
    
})(jQuery, fluid_1_5);