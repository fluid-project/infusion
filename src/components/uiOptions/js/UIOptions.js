/*
Copyright 2013-2016, 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};
(function ($, fluid) {
    "use strict";

    // Gradename to invoke "fluid.uiOptions.prefsEditor"
    fluid.prefs.builder({
        gradeNames: ["fluid.prefs.auxSchema.starter"]
    });

    fluid.defaults("fluid.uiOptions.prefsEditor", {
        gradeNames: ["fluid.prefs.constructed.prefsEditor"],
        lazyLoad: false,
        distributeOptions: {
            "uio.separatedPanel.lazyLoad": {
                record: "{that}.options.lazyLoad",
                target: "{that separatedPanel}.options.lazyLoad"
            },
            "uio.uiEnhancer.tocTemplate": {
                source: "{that}.options.tocTemplate",
                target: "{that uiEnhancer}.options.tocTemplate"
            },
            "uio.uiEnhancer.ignoreForToC": {
                source: "{that}.options.ignoreForToC",
                target: "{that uiEnhancer}.options.ignoreForToC"
            },
            "uio.localization.defaultLocale": {
                source: "{that}.options.defaultLocale",
                target: "{that prefsEditorLoader}.options.defaultLocale"
            }
        },
        enhancer: {
            distributeOptions: {
                "uio.enhancer.tableOfContents.tocTemplate": {
                    source: "{that}.options.tocTemplate",
                    target: "{that > fluid.prefs.enactor.tableOfContents}.options.tocTemplate"
                },
                "uio.enhancer.tableOfContents.ignoreForToC": {
                    source: "{that}.options.ignoreForToC",
                    target: "{that > fluid.prefs.enactor.tableOfContents}.options.ignoreForToC"
                }
            }
        }
    });

    // Localized/internationalized version of the UIO Preferences Editor
    fluid.defaults("fluid.uiOptions.prefsEditor.localized", {
        gradeNames: ["fluid.uiOptions.prefsEditor"],
        defaultLocale: "en",
        modelListeners: {
            locale: {
                funcName: "fluid.set",
                args: ["{that}", "", "{change}.value"],
                namespace: "updateUioLocale",
                excludeSource: "init"
            }
        },
        events: {
            onInterfaceLocaleChangeRequested: null,
            onUioPanelsUpdated: null,
            onSlidingPanelUpdated: null,
            onAllPanelsUpdated: {
                events: {
                    onUioPanelsUpdated: "onUioPanelsUpdated",
                    onSlidingPanelUpdated: "onSlidingPanelUpdated"
                }
            }
        },
        listeners: {
            "onInterfaceLocaleChangeRequested.changeLocale": {
                changePath: "locale",
                value: "{arguments}.0.data"
            },
            "onInterfaceLocaleChangeRequested.reloadUioMessages": {
                funcName: "fluid.uiOptions.prefsEditor.localized.reloadUioMessages",
                args: ["{arguments}.0.data", "{prefsEditorLoader}.messageLoader", "options.locale"],
                priority: "after:changeLocale"
            }
        },
        localeSettings: {
            // This is necessary because the Table of Contents
            // component doesn't use the localization messages
            // from the panel
            tocHeader: "Table of Contents",
            slidingPanelStringMap: {
                showText: "slidingPanelShowText",
                hideText: "slidingPanelHideText",
                showTextAriaLabel: "showTextAriaLabel",
                hideTextAriaLabel: "hideTextAriaLabel",
                panelLabel: "slidingPanelPanelLabel"
            }
        },
        distributeOptions: {
            tocHeader: {
                target: "{that fluid.tableOfContents}.options.strings.tocHeader",
                source: "{that}.options.localeSettings.tocHeader"
            },
            locale: {
                target: "{that prefsEditorLoader}.options.settings.preferences.locale",
                source: "{that}.options.model.locale"
            }
        },
        components: {
            prefsEditorLoader: {
                options: {
                    components: {
                        slidingPanel: {
                            options:{
                                listeners: {
                                    "{messageLoader}.events.onResourcesLoaded": {
                                        funcName: "fluid.uiOptions.prefsEditor.localized.updateSlidingPanel",
                                        args: [
                                            "{fluid.uiOptions.prefsEditor.localized}.prefsEditorLoader.messageLoader.resources",
                                            "{fluid.uiOptions.prefsEditor.localized}.model.locale",
                                            "{fluid.uiOptions.prefsEditor.localized}.prefsEditorLoader.slidingPanel",
                                            "{fluid.uiOptions.prefsEditor.localized}.options.localeSettings.slidingPanelStringMap"
                                        ],
                                        namespace: "updateSlidingPanel",
                                        priority: "after:updateUioPanelLocales"
                                    },
                                    "afterPanelHide.slidingPanelUpdated": {
                                        func: "{fluid.uiOptions.prefsEditor.localized}.events.onSlidingPanelUpdated",
                                        priority: "last"
                                    },
                                    "afterPanelShow.slidingPanelUpdated": {
                                        namespace: "",
                                        func: "{fluid.uiOptions.prefsEditor.localized}.events.onSlidingPanelUpdated",
                                        priority: "last"
                                    }
                                },
                                invokers: {
                                    setShowText: {
                                        "args": ["{that}.dom.toggleButtonLabel", "{that}.msgLookup.slidingPanelShowText", "{that}.msgLookup.showTextAriaLabel"]
                                    },
                                    setHideText: {
                                        "args": ["{that}.dom.toggleButtonLabel", "{that}.msgLookup.slidingPanelHideText", "{that}.msgLookup.hideTextAriaLabel"]
                                    }
                                }
                            }
                        },
                        prefsEditor: {
                            options: {
                                listeners: {
                                    "{messageLoader}.events.onResourcesLoaded": [{
                                        funcName: "fluid.uiOptions.prefsEditor.localized.updateUioPanelLocales",
                                        args: [
                                            "{fluid.uiOptions.prefsEditor.localized}.prefsEditorLoader.messageLoader.resources",
                                            "{fluid.uiOptions.prefsEditor.localized}.model.locale",
                                            "{fluid.uiOptions.prefsEditor.localized}.prefsEditorLoader.prefsEditor"
                                        ],
                                        priority: "before:rerenderPanels",
                                        namespace: "updateUioPanelLocales"
                                    },
                                    {
                                        funcName: "fluid.prefs.separatedPanel.updateView",
                                        args: ["{that}"],
                                        namespace: "rerenderPanels"
                                    },
                                    {
                                        func: "{fluid.uiOptions.prefsEditor.localized}.events.onUioPanelsUpdated",
                                        namespace: "panelsUpdated",
                                        priority: "last"
                                    }]
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    /* Reloads UIO message bundles with the given locale,
     * subject to the fallback rules of the resourceLoader
     * - "lang": the locale for which to load messages
     * - "uioMessageLoaderComponent": the UIO messageLoader component
     * - "uioMessageLoaderLocalePath": the path on the messageLoader for its locale
     */
    fluid.uiOptions.prefsEditor.localized.reloadUioMessages = function (locale, uioMessageLoaderComponent, uioMessageLoaderLocalePath) {
        // Set the locale in the resource loader
        fluid.set(uioMessageLoaderComponent, uioMessageLoaderLocalePath, locale);

        // Force the resource loader to get the new resources
        fluid.resourceLoader.loadResources(uioMessageLoaderComponent, uioMessageLoaderComponent.resolveResources());
    };

    /* Updates a given localized component's messages with new values and sets a
     * messageLocale value in order for the current locale to be verifiable
     * - "localizedComponent": the component to be updated
     * - "resourceKey": the key to access in the resources collection
     *   where this component's messages are stored
     * - "resources": the collection of messages
     * - "locale": the locale of the messages
     */
    fluid.uiOptions.prefsEditor.localized.updateLocalizedComponent = function (localizedComponent, resourceKey, resources, locale) {
        if (localizedComponent.msgResolver) {
            localizedComponent.msgResolver.messageLocale = locale;
            localizedComponent.msgResolver.messageBase = resources[resourceKey].resourceText;
        }
    };

    /* Updates and redraws the slidingPanel of a UIO component
    * - "uioComponent": the UIO component proper
    * - "slidingPanel": the fluid.slidingPanel being updated
    * - "resources": a set of message bundles
    * - "locale": the locale to be loaded/updated
    * - "slidingPanel": the slidingPanel component to update
    * - "slidingPanelStringMap": a map of msgLookup key names to bundle-specific key names
    */
    fluid.uiOptions.prefsEditor.localized.updateSlidingPanel = function (resources, locale, slidingPanel, slidingPanelStringMap) {
        fluid.uiOptions.prefsEditor.localized.updateLocalizedComponent(slidingPanel, "prefsEditor", resources, locale);

        slidingPanel.options.strings = fluid.transform(slidingPanel.options.strings, function (localizedString, key) {
            return slidingPanel.msgResolver.messageBase[slidingPanelStringMap[key]];
        });

        slidingPanel.refreshView();
    };

    /* Updates the locale and text for all panels of a UIO component
     * - "prefsEditorComponent": the prefsEditor subcomponent of the UIO's prefsEditorLoader component
     * - "locale": the locale to be loaded/updated
     */
    fluid.uiOptions.prefsEditor.localized.updateUioPanelLocales = function (resources, locale, prefsEditorComponent) {
        fluid.each(prefsEditorComponent, function (panel, key) {
            if (panel && panel.options && fluid.hasGrade(panel.options, "fluid.prefs.panel")) {
                fluid.uiOptions.prefsEditor.localized.updateLocalizedComponent(panel, key, resources, locale);
            }
        });
    };

})(jQuery, fluid_3_0_0);
