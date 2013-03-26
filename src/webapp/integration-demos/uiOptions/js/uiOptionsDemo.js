
(function ($, fluid) {
    fluid.registerNamespace("demo");

    var pathToTocTemplate = "../../components/tableOfContents/html/TableOfContents.html";
    var pathToTemplates = "../../components/uiOptions/html/";

    demo.initPageEnhancer = function (customThemeName) {
        fluid.pageEnhancer({
            gradeNames: ["fluid.uiEnhancer.defaultActions"],
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
                    gradeNames: ["fluid.uiOptions.defaultSettingsPanels"]
                }
            }
        });
    };

})(jQuery, fluid);
