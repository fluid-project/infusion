/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

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
    gradeNames: ["fluid.prefs.prefsEditorLoader", "fluid.contextAware"],
    events: {
        onReady: null,
        onCreateSlidingPanelReady: {
            events: {
                onPrefsEditorMessagesLoaded: "onPrefsEditorMessagesLoaded"
            }
        },
        templatesAndMessagesReady: {
            events: {
                templatesLoaded: "onPrefsEditorTemplatesLoaded",
                messagesLoaded: "onPrefsEditorMessagesLoaded"
            }
        }
    },
    lazyLoad: false,
    contextAwareness: {
        lazyLoad: {
            checks: {
                lazyLoad: {
                    contextValue: "{fluid.prefs.separatedPanel}.options.lazyLoad",
                    gradeNames: "fluid.prefs.separatedPanel.lazyLoad"
                }
            }
        }
    },
    selectors: {
        reset: ".flc-prefsEditor-reset",
        prefsEditor: ".flc-slidingPanel-panel",
        containerMarker: ".flc-prefsEditor-main"
    },
    listeners: {
        "onReady.bindEvents": {
            listener: "fluid.prefs.separatedPanel.bindEvents",
            args: ["{separatedPanel}.prefsEditor", "{separatedPanel}.innerEnhancer", "{separatedPanel}"]
        },
        "onCreate.hideReset": {
            listener: "fluid.prefs.separatedPanel.hideReset",
            args: ["{separatedPanel}"]
        }
    },
    components: {
        slidingPanel: {
            type: "fluid.slidingPanel",
            container: "{separatedPanel}.container",
            createOnEvent: "onCreateSlidingPanelReady",
            options: {
                gradeNames: ["fluid.prefs.msgLookup"],
                strings: {
                    showText: "{that}.msgLookup.slidingPanelShowText",
                    hideText: "{that}.msgLookup.slidingPanelHideText",
                    showTextAriaLabel: "{that}.msgLookup.showTextAriaLabel",
                    hideTextAriaLabel: "{that}.msgLookup.hideTextAriaLabel",
                    panelLabel: "{that}.msgLookup.slidingPanelPanelLabel"
                },
                components: {
                    msgResolver: {
                        type: "fluid.messageResolver",
                        options: {
                            messageBase: "{messageLoader}.resources.prefsEditor.parsed"
                        }
                    }
                }
            }
        },
        // innerEnhancer handles preferences applied to the UIO container
        innerEnhancer: {
            type: "fluid.uiEnhancer",
            container: "{separatedPanel}.dom.prefsEditor",
            options: {
                gradeNames: ["{pageEnhancer}.uiEnhancer.options.userGrades"],
                tocTemplate: "{pageEnhancer}.uiEnhancer.options.tocTemplate",
                distributeOptions: {
                    applyInitValue: {
                        record: true,
                        target: "{that enactor}.options.applyInitValue"
                    },
                    syllabifyHiddenContents: {
                        record: true,
                        target: "{that fluid.prefs.enactor.syllabification > parser}.options.parseHidden"
                    },
                    // Disable TOC and self voicing enactors in the UIO container
                    removeTocEnactor: {
                        record: "fluid.emptySubcomponent",
                        target: "{that fluid.prefs.enactor.tableOfContents}.type"
                    },
                    removeOrator: {
                        record: "fluid.emptySubcomponent",
                        target: "{that fluid.orator}.type"
                    },
                    removeSelfVoicingEnactor: {
                        record: "fluid.emptySubcomponent",
                        target: "{that fluid.prefs.enactor.selfVoicing}.type"
                    }
                }
            }
        },
        prefsEditor: {
            createOnEvent: "templatesAndMessagesReady",
            container: "{separatedPanel}.dom.prefsEditor",
            options: {
                gradeNames: ["fluid.prefs.uiEnhancerRelay", "fluid.prefs.arrowScrolling"],
                // ensure that model and applier are available to users at top level
                model: {
                    preferences: "{separatedPanel}.model.preferences"
                    // The `local` model path is used by the `fluid.remoteModelComponent` grade
                    // for persisting and synchronizing model values with remotely stored data.
                    // local: {}
                },
                autoSave: true,
                events: {
                    updateEnhancerModel: "{that}.events.modelChanged"
                },
                listeners: {
                    "onCreate.bindReset": {
                        "this": "{separatedPanel}.dom.reset",
                        method: "on",
                        args: ["click", "{that}.reset"]
                    },
                    "afterReset.applyChanges": "{that}.applyChanges"
                }
            }
        }
    },
    outerEnhancerOptions: "{originalEnhancerOptions}.options.originalUserOptions",
    distributeOptions: {
        "separatedPanel.slidingPanel": {
            source: "{that}.options.slidingPanel",
            removeSource: true,
            target: "{that > slidingPanel}.options"
        },
        "separatedPanel.innerEnhancer.outerEnhancerOptions": {
            source: "{that}.options.outerEnhancerOptions",
            removeSource: true,
            target: "{that > innerEnhancer}.options"
        },
        "separatedPanel.ignoreSelectorForToc": {
            source: "{that}.options.selectors.containerMarker",
            target: "{enhancer fluid.prefs.enactor.tableOfContents}.options.ignoreSelectorForEnactor.forEnactor"
        },
        "separatedPanel.ignoreSelectorForSelfVoicing": {
            source: "{that}.options.selectors.containerMarker",
            target: "{enhancer fluid.prefs.enactor.selfVoicing}.options.ignoreSelectorForEnactor.forEnactor"
        },
        "separatedPanel.ignoreSelectorForSyllabification": {
            source: "{that}.options.selectors.prefsEditor",
            target: "{enhancer fluid.prefs.enactor.syllabification}.options.ignoreSelectorForEnactor.forEnactor"
        }
    }
});

fluid.prefs.separatedPanel.hideReset = function (separatedPanel) {
    separatedPanel.locate("reset").hide();
};

fluid.prefs.separatedPanel.updateView = function (prefsEditor) {
    prefsEditor.events.onPrefsEditorRefresh.fire();
};


// fluid.prefs.separatedPanel.bindEvents = function (prefsEditor, iframeEnhancer, separatedPanel) {
fluid.prefs.separatedPanel.bindEvents = function (prefsEditor, innerEnhancer, separatedPanel) {
    // FLUID-5740: This binding should be done declaratively - needs ginger world in order to bind onto slidingPanel
    // which is a child of this component

    var separatedPanelId = separatedPanel.slidingPanel.panelId;
    separatedPanel.locate("reset").attr({
        "aria-controls": separatedPanelId,
        "role": "button"
    });

    separatedPanel.slidingPanel.events.afterPanelHide.addListener(function () {
        fluid.prefs.separatedPanel.updateView(prefsEditor);
    }, "updateView");

    prefsEditor.events.onPrefsEditorRefresh.addListener(function () {
        innerEnhancer.updateModel(prefsEditor.model.preferences);
    }, "updateModel");
    prefsEditor.events.afterReset.addListener(function (prefsEditor) {
        fluid.prefs.separatedPanel.updateView(prefsEditor);
    }, "updateView");
    separatedPanel.slidingPanel.events.afterPanelShow.addListener(function () {
        separatedPanel.prefsEditor.container.slideDown(separatedPanel.slidingPanel.options.animationDurations.show);
        separatedPanel.locate("reset").show();
    }, "openPanel");
    separatedPanel.slidingPanel.events.onPanelHide.addListener(function () {
        separatedPanel.locate("reset").hide();
    }, "hideReset");
};

/**
 * FLUID-5926: Some of our users have asked for ways to improve the initial page load
 * performance when using the separated panel prefs editor / UI Options. One option,
 * provided here, is to implement a scheme for lazy loading the instantiation of the
 * prefs editor, only instantiating enough of the workflow to allow display the
 * sliding panel tab.
 *
 * fluid.prefs.separatedPanel.lazyLoad modifies the typical separatedPanel workflow
 * by delaying the instantiation and loading of resources for the prefs editor until
 * the first time it is opened.
 *
 * Lazy Load Workflow:
 *
 * - On instantiation of the prefsEditorLoader only the messageLoader and slidingPanel are instantiated
 * - On instantiation, the messageLoader only loads preLoadResources, these are the messages required by
 *   the slidingPanel. The remaining message bundles will not be loaded until the "onLazyLoad" event is fired.
 * - After the preLoadResources have been loaded, the onPrefsEditorMessagesPreloaded event is fired, and triggers the
 *   sliding panel to instantiate.
 * - When a user opens the separated panel prefs editor / UI Options, it checks to see if the prefs editor has been
 *   instantiated. If it hasn't, a listener is temporarily bound to the onReady event, which gets fired
 *   after the prefs editor is ready. This is used to continue the process of opening the sliding panel for the first time.
 *   Additionally the onLazyLoad event is fired, which kicks off the remainder of the instantiation process.
 * - onLazyLoad triggers the templateLoader to fetch all of the templates and the messageLoader to fetch the remaining
 *   message bundles. From here the standard instantiation workflow takes place.
 */
fluid.defaults("fluid.prefs.separatedPanel.lazyLoad", {
    events: {
        onLazyLoad: null,
        onPrefsEditorMessagesPreloaded: null,
        onCreateSlidingPanelReady: {
            events: {
                onPrefsEditorMessagesLoaded: "onPrefsEditorMessagesPreloaded"
            }
        },
        templatesAndMessagesReady: {
            events: {
                onLazyLoad: "onLazyLoad"
            }
        }
    },
    components: {
        templateLoader: {
            createOnEvent: "onLazyLoad"
        },
        messageLoader: {
            options: {
                events: {
                    onResourcesPreloaded: "{separatedPanel}.events.onPrefsEditorMessagesPreloaded"
                },
                preloadResources: "prefsEditor",
                listeners: {
                    "onCreate.loadResources": { // Override of framework's definition
                        listener: "fluid.prefs.separatedPanel.lazyLoad.preloadResources",
                        args: ["{that}", "{that}.options.preloadResources"]
                    },
                    "{separatedPanel}.events.onLazyLoad": {
                        listener: "{that}.resourceFetcher.fetchAll"
                    }
                }
            }
        },
        slidingPanel: {
            options: {
                invokers: {
                    operateShow: {
                        funcName: "fluid.prefs.separatedPanel.lazyLoad.showPanel",
                        args: ["{separatedPanel}", "{that}.events.afterPanelShow.fire"]
                    }
                }
            }
        }
    }
});

fluid.prefs.separatedPanel.lazyLoad.showPanel = function (separatedPanel, callback) {
    if (separatedPanel.prefsEditor) {
        fluid.invokeLater(callback);
    } else {
        separatedPanel.events.onReady.addListener(function (that) {
            that.events.onReady.removeListener("showPanelCallBack");
            fluid.invokeLater(callback);
        }, "showPanelCallBack");
        separatedPanel.events.onLazyLoad.fire();
    }

};

/**
 * Used to override the standard "onCreate.loadResources" listener for fluid.resourceLoader component,
 * allowing for pre-loading of a subset of resources. This is required for the lazyLoading workflow
 * for the "fluid.prefs.separatedPanel.lazyLoad".
 *
 * @param {fluid.resourceLoader} that - the resourceLoader, augmented with the preload workflow
 * @param {String|String[]} toPreload - a String or an String[]s corresponding to the names
 *                                   of the resources, supplied in the resource argument, that
 *                                   should be loaded. Only these resources will be loaded.
 */
fluid.prefs.separatedPanel.lazyLoad.preloadResources = function (that, toPreload) {
    toPreload = fluid.makeArray(toPreload);
    var resourceFetcher = that.resourceFetcher;
    var preloadPromises = toPreload.map(function (onePreload) {
        return fluid.fetchResources.fetchOneResource(resourceFetcher.resourceSpecs[onePreload], resourceFetcher);
    });
    var preloadAllPromise = fluid.promise.sequence(preloadPromises);
    preloadAllPromise.then(function () {
        that.events.onResourcesPreloaded.fire(that.resources);
    });
};
