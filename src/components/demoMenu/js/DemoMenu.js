var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    fluid.defaults("fluid.demoMenu", {
        gradeNames: ["fluid.rendererComponent", "fluid.modelComponent", "autoInit"],
        resources: {
            template: {
                href: "../html/demoMenuTemplate.html"
            }
        },
        listeners: {
            "onCreate.showTemplate": {
                "funcName": "fluid.demoMenu.showTemplate"
            },
            "afterRender.registerShowButtonListener": {
                "this": "{that}.dom.showButton",
                "method": "click",
                "args": "{that}.toggleShowMenu"
            },
            "afterRender.setVisibility": {
                "funcName": "{that}.setVisibility"
            }
        },
        model: {
            showMenu: true
        },
        modelListeners: {
            showMenu: {
                funcName: "{that}.setVisibility"
            }
        },
        invokers: {
            toggleShowMenu: {
                funcName: "fluid.demoMenu.toggleShowMenu",
                args: ["{that}", "{that}.model.showMenu"],
                dynamic: true
            },
            setVisibility: {
                "this": "{that}.dom.menuBody",
                "method": "toggle",
                "args": ["{that}.model.showMenu"]
            }
        },
        selectors: {
            showButton: ".flc-demoMenu-showButton",
            menuBody: ".flc-demoMenu-body",
            title: ".flc-demoMenu-title",
            componentName: ".flc-demoMenu-componentName",
            componentVersion: ".flc-demoMenu-componentVersion",
            description: ".flc-demoMenu-description",
            instructionsHeading: ".flc-demoMenu-instructionsHeading",
            instructions: ".flc-demoMenu-instructions"
        },
        selectorsToIgnore: ["showButton", "menuBody"],
        protoTree: {
            title: {messagekey: "title"},
            componentName: {messagekey: "componentName"},
            componentVersion: {messagekey: "componentVersion"},
            description: {markup: "${{that}.options.markup.description}"},
            instructionsHeading: {messagekey: "instructionsHeading"},
            instructions: {markup: "${{that}.options.markup.instructions}"}
        },
        strings: {
            title: "Title",
            componentName: "Component Name",
            componentVersion: "Version #",
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

    fluid.demoMenu.toggleShowMenu = function (that, value) {
        that.applier.requestChange("showMenu", !value);
    }

})(jQuery, fluid_1_5);
