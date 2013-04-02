
(function ($, fluid) {
    fluid.registerNamespace("demo");

    var pathToTocTemplate = "../../components/tableOfContents/html/TableOfContents.html";
    var pathToTemplates = "../../components/uiOptions/html/";

    var extraSiteSettings = {
        simplifiedContent: false,
        selfVoicing: false
    };

    demo.updateToc = function (tocEnactor) {
        if (tocEnactor.tableOfContents) {
            tocEnactor.tableOfContents.regenerateToc();
        }
    };

    demo.initPageEnhancer = function (customThemeName) {
        fluid.pageEnhancer({
            gradeNames: ["fluid.uiEnhancer.defaultActions", "fluid.uiEnhancer.extraActions"],
            defaultSiteSettings: extraSiteSettings,
            tocTemplate: pathToTocTemplate,
            classnameMap: {
                theme: {
                    "default": customThemeName
                }
            },
            components: {
                simplifiedContent: {
                    options: {
                        listeners: {
                            settingChanged: "{uiEnhancer}.events.simplifyContentChanged"
                        }
                    }
                }
            },
            events: {
                simplifyContentChanged: null
            },
            listeners: {
                simplifyContentChanged: {
                    listener: "demo.updateToc",
                    args: "{that}.tableOfContents"
                }
            }
        });
    };

    demo.initFatPanel = function (container) {
        fluid.uiOptions.fatPanel(container, {
            prefix: pathToTemplates,
            uiOptions: {
                options: {
                    gradeNames: ["fluid.uiOptions.defaultSettingsPanels", "fluid.uiOptions.extraSettingsPanels"]
                }
            },
             templateLoader: {
                options: {
                    templates: {
                        uiOptions: "templates/FatPanelUIOptions.html",
                        simplifiedContent: "templates/UIOptionsTemplate-simplifiedContent.html",
                        selfVoicing: "templates/UIOptionsTemplate-selfVoicing.html"
                     }
                }
            },
            outerEnhancerOptions: {
                defaultSiteSettings: extraSiteSettings
            }
        });
    };

    fluid.demands("iframeEnhancer", null, {
        options: {
            components: {
                selfVoicingEnactor: {
                    type: "fluid.emptySubcomponent"
                }
            }
        }
    });

})(jQuery, fluid);
