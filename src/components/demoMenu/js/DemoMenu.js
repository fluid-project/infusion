var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    fluid.defaults("fluid.demoMenu", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        resources: {
            template: {
                href: "../html/demoMenuTemplate.html"
            }
        },
        listeners: {
            "onCreate.showTemplate": {
                "funcName": "fluid.demoMenu.showTemplate"
            }
        },
        selectors: {
            title: ".flc-demoMenu-title",
            instructions: ".flc-demoMenu-instructions"
        },
        protoTree: {
            title: {messagekey: "title"},
            instructions: {
                decorators: [{
                    type: "jQuery",
                    func: "html",
                    args: "${{that}.options.markup.instructions}"
                }]}
        },
        strings: {
            title: "Title"
        },
        markup: {
            instructions: "<ul><li>Instructions</li></ul>"
        }
    });

    fluid.demoMenu.showTemplate = function (that) {
        fluid.fetchResources(that.options.resources, function () {
            that.refreshView();
        });
    };

})(jQuery, fluid_1_5);
