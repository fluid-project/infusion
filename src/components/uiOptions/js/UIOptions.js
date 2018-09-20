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
                func: "{that}.reloadUioMessages",
                args: "{arguments}.0.data",
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
        invokers: {
            reloadUioMessages: {
                funcName: "fluid.uiOptions.prefsEditor.localized.reloadUioMessages",
                args: [
                    "{arguments}.0",
                    "{prefsEditorLoader}.messageLoader",
                    "options.locale"
                ]
            }
        },
        components: {
            prefsEditorLoader: {
                options: {
                    contextAwareness: {
                        lazyLoad: {
                            checks: {
                                lazyLoad: {
                                    gradeNames: "fluid.prefs.separatedPanel.localized.lazyLoad"
                                }
                            }
                        }
                    },
                    components: {
                        slidingPanel: {
                            options:{
                                listeners: {
                                    "{messageLoader}.events.onResourcesLoaded": {
                                        funcName: "fluid.uiOptions.prefsEditor.localized.updateSlidingPanel",
                                        args: ["{fluid.uiOptions.prefsEditor.localized}", "{fluid.uiOptions.prefsEditor.localized}.prefsEditorLoader.slidingPanel"],
                                        namespace: "updateSlidingPanel"
                                    },
                                    "afterPanelHide.slidingPanelUpdated": "{fluid.uiOptions.prefsEditor.localized}.events.onSlidingPanelUpdated",
                                    "afterPanelShow.slidingPanelUpdated": "{fluid.uiOptions.prefsEditor.localized}.events.onSlidingPanelUpdated"
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
                                    // these listeners only fire once the sliding panel is open, if lazyLoad is enabled
                                    "{messageLoader}.events.onResourcesLoaded": [{
                                        funcName: "fluid.uiOptions.prefsEditor.localized.updateUioPanelLocales",
                                        args: ["{fluid.uiOptions.prefsEditor.localized}"],
                                        priority: "before:rerenderPanels",
                                        namespace: "updateUioPanelLocales"
                                    },
                                    {
                                        func: "{that}.events.onPrefsEditorRefresh",
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

    // Extension of lazyLoad grade to add listener for locale change
    fluid.defaults("fluid.prefs.separatedPanel.localized.lazyLoad", {
        gradeNames: ["fluid.prefs.separatedPanel.lazyLoad"],
        listeners: {
            "{localized}.events.onInterfaceLocaleChangeRequested": {
                func: "{that}.events.onLazyLoad",
                priority: "after:changeLocale",
                namespace: "fireLazyLoad"
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

    /* Updates the locale and text for all panels of a UIO component
     * - "uioComponent": the UIO component proper
     */
    fluid.uiOptions.prefsEditor.localized.updateUioPanelLocales = function (uioComponent) {
        if (uioComponent.prefsEditorLoader) {
            fluid.each(uioComponent.prefsEditorLoader.prefsEditor, function (panel, key) {
                if (panel && panel.options && fluid.hasGrade(panel.options, "fluid.prefs.panel")) {
                    fluid.uiOptions.prefsEditor.localized.updateLocalizedComponent(panel, key, uioComponent.prefsEditorLoader.messageLoader.resources, uioComponent.model.locale);
                }
            });
        }
    };

    /* Updates and redraws the slidingPanel of a UIO component
     * - "uioComponent": the UIO component proper
     * - "slidingPanel": the fluid.slidingPanel being updated
     */
    fluid.uiOptions.prefsEditor.localized.updateSlidingPanel = function (uioComponent, slidingPanel) {
        fluid.uiOptions.prefsEditor.localized.updateLocalizedComponent(slidingPanel, "prefsEditor", uioComponent.prefsEditorLoader.messageLoader.resources, uioComponent.model.locale);

        slidingPanel.options.strings = fluid.transform(slidingPanel.options.strings, function (localizedString, key) {
            return slidingPanel.msgResolver.messageBase[uioComponent.options.localeSettings.slidingPanelStringMap[key]];
        });

        slidingPanel.refreshView();
    };

})(jQuery, fluid_3_0_0);
