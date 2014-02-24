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
            description: ".flc-demoMenu-description",
            instructionsHeading: ".flc-demoMenu-instructionsHeading",
            instructions: ".flc-demoMenu-instructions"
        },
        protoTree: {
            title: {messagekey: "title"},
            description: {markup: "${{that}.options.markup.description}"},
            instructionsHeading: {messagekey: "instructionsHeading"},
            instructions: {markup: "${{that}.options.markup.instructions}"}
        },
        strings: {
            title: "Title",
            instructionsHeading: "Instructions"
        },
        markup: {
            description: "A description of the component should appear here. It should say: <ul><li>What the component does.</li><li>Why it is interesting / useful.</li></ul>",
            instructions: "<p>Do this to do this. Do that to do that.</p>"
        }
    });

    fluid.demoMenu.showTemplate = function (that) {
        fluid.fetchResources(that.options.resources, function () {
            that.refreshView();
        });
    };

})(jQuery, fluid_1_5);
