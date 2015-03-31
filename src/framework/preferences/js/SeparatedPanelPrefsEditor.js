/*
Copyright 2011-2015 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.dom");

    fluid.dom.getDocumentHeight = function (dokkument) {
        var body = $("body", dokkument)[0];
        return body.offsetHeight;
    };

    /*******************************************************
     * Separated Panel Preferences Editor Top Level Driver *
     *******************************************************/

    fluid.defaults("fluid.prefs.separatedPanel", {
        gradeNames: ["fluid.prefs.prefsEditorLoader", "autoInit"],
        events: {
            afterRender: null,
            onReady: null,
            onCreateSlidingPanelReady: {
                events: {
                    iframeRendered: "afterRender",
                    onPrefsEditorMessagesLoaded: "onPrefsEditorMessagesLoaded"
                }
            },
            templatesAndIframeReady: {
                events: {
                    iframeReady: "afterRender",
                    templatesLoaded: "onPrefsEditorTemplatesLoaded",
                    messagesLoaded: "onPrefsEditorMessagesLoaded"
                }
            }
        },
        listeners: {
            onReady: {
                listener: "fluid.prefs.separatedPanel.bindEvents",
                args: ["{separatedPanel}.prefsEditor", "{iframeRenderer}.iframeEnhancer", "{separatedPanel}"]
            },
            onCreate: {
                listener: "fluid.prefs.separatedPanel.hideReset",
                args: ["{separatedPanel}"]
            }
        },
        selectors: {
            reset: ".flc-prefsEditor-reset",
            iframe: ".flc-prefsEditor-iframe"
        },
        invokers: {
            bindReset: {
                funcName: "fluid.bind",
                args: ["{separatedPanel}.dom.reset", "click", "{arguments}.0"]
            }
        },
        components: {
            pageEnhancer: "{uiEnhancer}",
            slidingPanel: {
                type: "fluid.slidingPanel",
                container: "{separatedPanel}.container",
                createOnEvent: "onCreateSlidingPanelReady",
                options: {
                    gradeNames: ["fluid.prefs.msgLookup"],
                    strings: {
                        showText: "{that}.msgLookup.slidingPanelShowText",
                        hideText: "{that}.msgLookup.slidingPanelHideText"
                    },
                    invokers: {
                        operateShow: {
                            funcName: "fluid.prefs.separatedPanel.showPanel",
                            args: ["{that}.dom.panel", "{that}.events.afterPanelShow.fire"],
                            // override default implementation
                            "this": null,
                            "method": null
                        },
                        operateHide: {
                            funcName: "fluid.prefs.separatedPanel.hidePanel",
                            args: ["{that}.dom.panel", "{iframeRenderer}.iframe", "{that}.events.afterPanelHide.fire"],
                            // override default implementation
                            "this": null,
                            "method": null
                        }
                    },
                    components: {
                        msgResolver: {
                            type: "fluid.messageResolver",
                            options: {
                                messageBase: "{messageLoader}.resources.prefsEditor.resourceText"
                            }
                        }
                    }
                }
            },
            iframeRenderer: {
                type: "fluid.prefs.separatedPanel.renderIframe",
                container: "{separatedPanel}.dom.iframe",
                options: {
                    markupProps: {
                        src: "%templatePrefix/SeparatedPanelPrefsEditorFrame.html"
                    },
                    events: {
                        afterRender: "{separatedPanel}.events.afterRender"
                    },
                    components: {
                        iframeEnhancer: {
                            type: "fluid.uiEnhancer",
                            container: "{iframeRenderer}.renderPrefsEditorContainer",
                            createOnEvent: "afterRender",
                            options: {
                                gradeNames: ["{pageEnhancer}.options.gradeNames"],
                                jQuery: "{iframeRenderer}.jQuery",
                                tocTemplate: "{pageEnhancer}.options.tocTemplate"
                            }
                        }
                    }
                }
            },
            prefsEditor: {
                createOnEvent: "templatesAndIframeReady",
                container: "{iframeRenderer}.renderPrefsEditorContainer",
                options: {
                    gradeNames: ["fluid.prefs.uiEnhancerRelay"],
                    // ensure that model and applier are available to users at top level
                    model: "{separatedPanel}.model",
                    events: {
                        onSignificantDOMChange: null,
                        updateEnhancerModel: "{that}.events.modelChanged"
                    },
                    listeners: {
                        modelChanged: "{that}.save",
                        onCreate: {
                            listener: "{separatedPanel}.bindReset",
                            args: ["{that}.reset"]
                        },
                        onReset: "{that}.applyChanges",
                        onReady: {
                            listener: "{separatedPanel}.events.onReady",
                            args: "{separatedPanel}"
                        }
                    }
                }
            }
        },
        outerEnhancerOptions: "{originalEnhancerOptions}.options.originalUserOptions",
        distributeOptions: [{
            source: "{that}.options.slidingPanel",
            removeSource: true,
            target: "{that > slidingPanel}.options"
        }, {
            source: "{that}.options.iframeRenderer",
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
        }, {
            source: "{that}.options.templatePrefix",
            target: "{that > iframeRenderer}.options.templatePrefix"
        }]
    });

    fluid.prefs.separatedPanel.hideReset = function (separatedPanel) {
        separatedPanel.locate("reset").hide();
    };
    /*****************************************
     * fluid.prefs.separatedPanel.renderIframe *
     *****************************************/

    fluid.defaults("fluid.prefs.separatedPanel.renderIframe", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        events: {
            afterRender: null
        },
        styles: {
            container: "fl-prefsEditor-separatedPanel-iframe"
        },
        templatePrefix: "./",
        markupProps: {
            "class": "flc-iframe",
            src: "%templatePrefix/prefsEditorIframe.html"
        }
    });

    fluid.prefs.separatedPanel.renderIframe.finalInit = function (that) {
        var styles = that.options.styles;
        // TODO: get earlier access to templateLoader,
        that.options.markupProps.src = fluid.stringTemplate(that.options.markupProps.src, {"templatePrefix/": that.options.templatePrefix});
        that.iframeSrc = that.options.markupProps.src;

        // Create iframe and append to container
        that.iframe = $("<iframe/>");
        that.iframe.load(function () {
            var iframeWindow = that.iframe[0].contentWindow;
            that.iframeDocument = iframeWindow.document;

            that.jQuery = iframeWindow.jQuery;
            that.renderPrefsEditorContainer = that.jQuery("body", that.iframeDocument);
            that.jQuery(that.iframeDocument).ready(that.events.afterRender.fire);
        });
        that.iframe.attr(that.options.markupProps);

        that.iframe.addClass(styles.container);
        that.iframe.hide();

        that.iframe.appendTo(that.container);
    };

    fluid.prefs.separatedPanel.updateView = function (prefsEditor) {
        prefsEditor.events.onPrefsEditorRefresh.fire();
        prefsEditor.events.onSignificantDOMChange.fire();
    };

    fluid.prefs.separatedPanel.bindEvents = function (prefsEditor, iframeEnhancer, separatedPanel) {
        // TODO: This binding should be done declaratively - needs ginger world in order to bind onto slidingPanel
        // which is a child of this component
        separatedPanel.slidingPanel.events.afterPanelShow.addListener(function () {
            fluid.prefs.separatedPanel.updateView(prefsEditor);
        });

        prefsEditor.events.onPrefsEditorRefresh.addListener(function () {
            iframeEnhancer.updateModel(prefsEditor.model);
        });
        prefsEditor.events.onReset.addListener(function (prefsEditor) {
            fluid.prefs.separatedPanel.updateView(prefsEditor);
        });
        prefsEditor.events.onSignificantDOMChange.addListener(function () {
            var dokkument = prefsEditor.container[0].ownerDocument;
            var height = fluid.dom.getDocumentHeight(dokkument);
            var iframe = separatedPanel.iframeRenderer.iframe;
            var attrs = {height: height + 15}; // TODO: Configurable padding here
            var panel = separatedPanel.slidingPanel.locate("panel");
            panel.css({height: ""});
            iframe.animate(attrs, 400);
        });

        separatedPanel.slidingPanel.events.afterPanelHide.addListener(function () {
            separatedPanel.iframeRenderer.iframe.height(0);

            // Prevent the hidden Preferences Editorpanel from being keyboard and screen reader accessible
            separatedPanel.iframeRenderer.iframe.hide();
        });
        separatedPanel.slidingPanel.events.onPanelShow.addListener(function () {
            separatedPanel.iframeRenderer.iframe.show();
            separatedPanel.locate("reset").show();
        });
        separatedPanel.slidingPanel.events.onPanelHide.addListener(function () {
            separatedPanel.locate("reset").hide();
        });
    };

    // Replace the standard animator since we don't want the panel to become hidden
    // (potential cause of jumping)
    fluid.prefs.separatedPanel.hidePanel = function (panel, iframe, callback) {
        iframe.clearQueue(); // FLUID-5334: clear the animation queue
        $(panel).animate({height: 0}, {duration: 400, complete: callback});
    };

    // no activity - the kickback to the updateView listener will automatically trigger the
    // DOMChangeListener above. This ordering is preferable to avoid causing the animation to
    // jump by refreshing the view inside the iframe
    fluid.prefs.separatedPanel.showPanel = function (panel, callback) {
        // A bizarre race condition has emerged under FF where the iframe held within the panel does not
        // react synchronously to being shown
        setTimeout(callback, 1);
    };

})(jQuery, fluid_2_0);
