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

    fluid.defaults("fluid.uiOptions.fatPanel", {
        gradeNames: ["fluid.uiOptions.inline", "autoInit"],
        events: {
            afterRender: null,
            onReady: null
        },
        listeners: {
            onReady: {
                listener: "fluid.uiOptions.fatPanel.bindEvents",
                args: ["{fatPanel}.uiOptionsLoader.uiOptions", "{iframeRenderer}.iframeEnhancer", "{fatPanel}"]
            }
        },
        selectors: {
            reset: ".flc-uiOptions-reset",
            iframe: ".flc-uiOptions-iframe"
        },
        invokers: {
            bindReset: {
                funcName: "fluid.bind",
                args: ["{fatPanel}.dom.reset", "click", "{arguments}.0"]
            }
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
                                gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                                jQuery: "{iframeRenderer}.jQuery",
                                tocTemplate: "{pageEnhancer}.options.tocTemplate",
                                events: {
                                    onIframeVisible: null
                                }
                            }
                        }
                    }
                }
            },
            uiOptionsLoader: {
                type: "fluid.uiOptions.fatPanelLoader"
            }
        },
        outerEnhancerOptions: "{originalEnhancerOptions}.options.originalUserOptions",
        distributeOptions: [{
            source: "{that}.options.slidingPanel.options",
            removeSource: true,
            target: "{that > slidingPanel}.options"
        }, {
            source: "{that}.options.iframeRenderer.options",
            removeSource: true,
            target: "{that > iframeRenderer}.options"
        }, {
            source: "{that}.options.iframe",
            removeSource: true,
            target: "{that}.options.selectors.iframe"
        }, {
            source: "{that}.options.outerEnhancerOptions",
            removeSource: true,
            target: "{that iframeEnhancer}.options"
        }, 
        {
            source: "{that}.options.prefix",
            target: "{that > iframeRenderer}.options.prefix"
        }]
    });
    
    /*****************************************
     * fluid.uiOptions.fatPanel.renderIframe *
     *****************************************/

    fluid.defaults("fluid.uiOptions.fatPanel.renderIframe", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
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
    
    fluid.uiOptions.fatPanel.renderIframe.finalInit = function (that) {
        var styles = that.options.styles;
        // TODO: get earlier access to templateLoader, 
        that.options.markupProps.src = fluid.stringTemplate(that.options.markupProps.src, {"prefix/": that.options.prefix});
        that.iframeSrc = that.options.markupProps.src;
        
        // Create iframe and append to container
        that.iframe = $("<iframe/>");
        that.iframe.load(function () {
            var iframeWindow = that.iframe[0].contentWindow;
            that.iframeDocument = iframeWindow.document;

            that.jQuery = iframeWindow.jQuery;
            that.renderUIOContainer = that.jQuery("body", that.iframeDocument);
            that.jQuery(that.iframeDocument).ready(that.events.afterRender.fire);
        });
        that.iframe.attr(that.options.markupProps);
        
        that.iframe.addClass(styles.containerFlex);
        that.iframe.addClass(styles.container);
        that.iframe.hide();

        that.iframe.appendTo(that.container);
    };

    fluid.uiOptions.fatPanel.updateView = function (uiOptions) {
        uiOptions.events.onUIOptionsRefresh.fire();
        uiOptions.events.onSignificantDOMChange.fire();
    };
    
    fluid.uiOptions.fatPanel.bindEvents = function (uiOptions, iframeEnhancer, fatPanel) {
        // TODO: This binding should be done declaratively - needs ginger world in order to bind onto slidingPanel
        // which is a child of this component - and also uiOptionsLoader which is another child
        fatPanel.slidingPanel.events.afterPanelShow.addListener(function () {
            iframeEnhancer.events.onIframeVisible.fire(iframeEnhancer);
            fluid.uiOptions.fatPanel.updateView(uiOptions);
        });  
    
        uiOptions.events.onUIOptionsRefresh.addListener(function () {
            iframeEnhancer.updateModel(uiOptions.model.selections);
        });
        uiOptions.events.onReset.addListener(function (uiOptions) {
            fluid.uiOptions.fatPanel.updateView(uiOptions);
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
        
        // Re-apply text size and line space to iframe content since these initial css values are not detectable
        // when the iframe is hidden.
        iframeEnhancer.events.onIframeVisible.addListener(function () {
            iframeEnhancer.textSize.set(iframeEnhancer.model.textSize);
            iframeEnhancer.lineSpace.set(iframeEnhancer.model.lineSpace);
        });

        fatPanel.slidingPanel.events.afterPanelHide.addListener(function () {
            fatPanel.iframeRenderer.iframe.height(0);
            
            // Prevent the hidden UIO panel from being keyboard and screen reader accessible
            fatPanel.iframeRenderer.iframe.hide();
        });
        fatPanel.slidingPanel.events.onPanelShow.addListener(function () {
            fatPanel.iframeRenderer.iframe.show();
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
    
    /*************************************************************
     * fluid.uiOptions.fatPanelLoader: 
     * 
     * Define the loader that are specifically for the fat panel.
     *************************************************************/
    fluid.defaults("fluid.uiOptions.fatPanelLoader", {
        gradeNames: ["fluid.uiOptions.loader", "autoInit"],
        components: {
            uiOptions: {
                createOnEvent: "templatesAndIframeReady",
                container: "{iframeRenderer}.renderUIOContainer",
                options: {
                    gradeNames: ["fluid.uiOptions.uiEnhancerRelay"],
                    // ensure that model and applier are available to users at top level
                    model: "{fatPanel}.model",
                    applier: "{fatPanel}.applier",
                    events: {
                        onSignificantDOMChange: null,
                        updateEnhancerModel: "{that}.events.modelChanged"
                    },
                    listeners: {
                        modelChanged: "{that}.save",
                        onCreate: {
                            listener: "{fatPanel}.bindReset",
                            args: ["{that}.reset"]
                        }
                    },
                    components: {
                        iframeRenderer: "{fatPanel}.iframeRenderer"
                    }
                }
            }
        },
        events: {
            templatesAndIframeReady: {
                events: {
                    iframeReady: "{fatPanel}.events.afterRender",
                    templateReady: "onUIOptionsTemplateReady"
                }
            },
            onReady: "{fatPanel}.events.onReady"
        }
    });

})(jQuery, fluid_1_5);