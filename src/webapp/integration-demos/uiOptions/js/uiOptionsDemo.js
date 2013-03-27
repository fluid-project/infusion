
(function ($, fluid) {
    fluid.registerNamespace("demo");

    var pathToTocTemplate = "../../components/tableOfContents/html/TableOfContents.html";
    var pathToTemplates = "../../components/uiOptions/html/";

    var extraSiteSettings = {
        selfVoicing: false
    };
    
    demo.initPageEnhancer = function (customThemeName) {
        fluid.pageEnhancer({
            gradeNames: ["fluid.uiEnhancer.defaultActions", "fluid.uiEnhancer.extraActions"],
            tocTemplate: pathToTocTemplate,
            classnameMap: {
                theme: {
                    "default": customThemeName
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
                        selfVoicing: "templates/UIOptionsTemplate-selfVoicing.html"
                     }
                }
            }
        });
    };

})(jQuery, fluid);
