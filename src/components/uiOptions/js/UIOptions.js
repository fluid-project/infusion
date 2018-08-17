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

    fluid.defaults("fluid.uiOptions.prefsEditor.multilingual", {
        gradeNames: ["fluid.uiOptions.prefsEditor"],
        defaultLocale: "fr",
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
        multilingualSettings: {
            // This is necessary because the Table of Contents
            // component doesn't use the localization messages
            // from the panel
            tocHeader: "Table of Contents",
            direction: "ltr",
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
                source: "{that}.options.multilingualSettings.tocHeader"
            },
            locale: {
                // Targeting documented value does not work
                target: "{that prefsEditorLoader}.options.settings.preferences.locale",
                // Targeting the messageLoader locale directly works
                // target: "{that prefsEditorLoader}.options.components.messageLoader.options.locale",
                source: "{that}.options.model.locale"
            }
        },
        invokers: {
            reloadUioMessages: {
                funcName: "fluid.uiOptions.prefsEditor.multilingual.reloadUioMessages",
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
                        "{multilingual}.events.onInterfaceLanguageChangeRequested": {
                            func: "{prefsEditorLoader}.events.onLazyLoad.fire",
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
                                    // these listeners only fire once the sliding panel is open
                                    "{messageLoader}.events.onResourcesLoaded": [{
                                        func: "{that}.events.onPrefsEditorRefresh",
                                        namespace: "rerenderPanels"
                                    },
                                    {
                                        funcName: "fluid.uiOptions.prefsEditor.multilingual.updateUioPanelLanguages",
                                        args: ["{prefsEditorLoader}", "{fluid.uiOptions.prefsEditor.multilingual}"],
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

    fluid.uiOptions.prefsEditor.multilingual.reloadUioMessages = function (lang, uioMessageLoaderComponent, uioMessageLoaderLocalePath) {
        // Set the language in the resource loader
        fluid.set(uioMessageLoaderComponent, uioMessageLoaderLocalePath, lang);

        // Force the resource loader to get the new resources
        fluid.resourceLoader.loadResources(uioMessageLoaderComponent, uioMessageLoaderComponent.resolveResources());
    };

    fluid.uiOptions.prefsEditor.multilingual.updateMessageBase = function (prefsEditorLoaderComponent, localizedComponent, localizedComponentName, newLocale) {
        if (localizedComponent.msgResolver) {
            // language is stored in order to be verifiable
            localizedComponent.msgResolver.messageLanguage = newLocale;
            localizedComponent.msgResolver.messageBase = prefsEditorLoaderComponent.messageLoader.resources[localizedComponentName].resourceText;
        }
    };

    fluid.uiOptions.prefsEditor.multilingual.updateUioPanelLanguages = function (prefsEditorLoaderComponent, uioComponent) {
        if (prefsEditorLoaderComponent) {
            if (prefsEditorLoaderComponent.prefsEditor) {
                fluid.each(prefsEditorLoaderComponent.prefsEditor, function (panel, key) {
                    if (key.startsWith("fluid_prefs_panel_")) {
                        fluid.uiOptions.prefsEditor.multilingual.updateMessageBase(prefsEditorLoaderComponent, panel, key, uioComponent.model.locale);
                    }
                });
            }
            if (prefsEditorLoaderComponent.slidingPanel) {
                fluid.uiOptions.prefsEditor.multilingual.updateMessageBase(prefsEditorLoaderComponent, prefsEditorLoaderComponent.slidingPanel, "prefsEditor", uioComponent.model.locale);
            }
        }

        var tocHeaders = {
            "en": "Table of Contents",
            "es": "Tabla de contenido"
        };

        // Set the Toc Header String
        uioComponent.options.multilingualSettings.tocHeader = tocHeaders[uioComponent.model.locale];

        // Set the language on the body


        uioComponent.events.onUioPanelsUpdated.fire();
    };

})(jQuery, fluid_3_0_0);
