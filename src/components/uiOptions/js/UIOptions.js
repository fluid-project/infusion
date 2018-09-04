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
        model: {
            locale: "en"
        },
        modelListeners: {
            locale: {
                funcName: "fluid.set",
                args: ["{that}", "", "{change}.value"],
                namespace: "updateUioLanguage"
            }
        },
        events: {
            onInterfaceLanguageChangeRequested: null,
            onUioPanelsUpdated: null
        },
        listeners: {
            "onInterfaceLanguageChangeRequested.changeLocale": {
                func: "{that}.applier.change",
                args: ["locale", "{arguments}.0.data"]
            },
            "onInterfaceLanguageChangeRequested.reloadUioMessages": {
                func: "{that}.reloadUioMessages",
                args: "{arguments}.0.data",
                priority: "after:fireLazyLoad"
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
                    listeners: {
                        "{localized}.events.onInterfaceLanguageChangeRequested": {
                            func: "{prefsEditorLoader}.events.onLazyLoad",
                            priority: "after:changeLocale",
                            namespace: "fireLazyLoad"
                        }
                    },
                    components: {
                        slidingPanel: {
                            options:{
                                listeners: {
                                    "{messageLoader}.events.onResourcesLoaded": {
                                        func: "{slidingPanel}.refreshView",
                                        namespace: "updateSlidingPanel",
                                        priority: "last"
                                    }
                                },
                                invokers: {
                                    setShowText: {
                                        "funcName": "fluid.slidingPanel.setText",
                                        "args": ["{that}.dom.toggleButtonLabel", "{that}.msgLookup.slidingPanelShowText", "{that}.msgLookup.showTextAriaLabel"]
                                    },
                                    setHideText: {
                                        "funcName": "fluid.slidingPanel.setText",
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
                                        func: "{that}.events.onPrefsEditorRefresh",
                                        namespace: "rerenderPanels"
                                    },
                                    {
                                        funcName: "fluid.uiOptions.prefsEditor.localized.updateUioPanelLanguages",
                                        args: ["{fluid.uiOptions.prefsEditor.localized}"],
                                        priority: "before:rerenderPanels",
                                        namespace: "updateUioPanelLanguages"
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
        // Set the language in the resource loader
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

    /* Updates and redraws all panels and the slidingPanel (tab) of a UIO component
     * - "uioComponent": the UIO component proper
     */
    fluid.uiOptions.prefsEditor.localized.updateUioPanelLanguages = function (uioComponent) {
        if (uioComponent.prefsEditorLoader) {
            fluid.each(uioComponent.prefsEditorLoader.prefsEditor, function (panel, key) {
                if (panel && panel.options && fluid.hasGrade(panel.options, "fluid.prefs.panel")) {
                    fluid.uiOptions.prefsEditor.localized.updateLocalizedComponent(panel, key, uioComponent.prefsEditorLoader.messageLoader.resources, uioComponent.model.locale);
                }
            });

            if (uioComponent.prefsEditorLoader.slidingPanel) {
                fluid.uiOptions.prefsEditor.localized.updateLocalizedComponent(uioComponent.prefsEditorLoader.slidingPanel, "prefsEditor", uioComponent.prefsEditorLoader.messageLoader.resources, uioComponent.model.locale);
            }
        }

        uioComponent.events.onUioPanelsUpdated.fire();
    };

})(jQuery, fluid_3_0_0);
