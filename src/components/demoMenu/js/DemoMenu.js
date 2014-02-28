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
            "afterRender.registerToggleListener": {
                "this": "{that}.dom.toggleControl",
                "method": "click",
                "args": "{that}.toggleMenu"
            },
            "afterRender.registerCloseListener": {
                "this": "{that}.dom.closeControl",
                "method": "click",
                "args": "{that}.closeMenu"
            },
            "afterRender.bindBlurHandler": {
                "funcName": "{that}.bindBlurHandler"
            },
            "afterRender.setCodeLinkHref": {
                "this": "{that}.dom.codeLink",
                "method": "attr",
                "args": ["href", "${{that}.options.markup.codeLinkHref}"]
            },
            "afterRender.setApiLinkHref": {
                "this": "{that}.dom.apiLink",
                "method": "attr",
                "args": ["href", "${{that}.options.markup.apiLinkHref}"]
            },
            "afterRender.setDesignLinkHref": {
                "this": "{that}.dom.designLink",
                "method": "attr",
                "args": ["href", "${{that}.options.markup.designLinkHref}"]
            },
            "afterRender.setFeedbackLinkHref": {
                "this": "{that}.dom.feedbackLink",
                "method": "attr",
                "args": ["href", "${{that}.options.markup.feedbackLinkHref}"]
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
            setVisibility: {
                "this": "{that}.dom.menuBody",
                "method": "toggle",
                "args": ["{that}.model.showMenu"]
            },
            toggleMenu: {
                funcName: "fluid.demoMenu.toggleMenu",
                args: ["{that}", "{that}.model.showMenu"],
                dynamic: true
            },
            closeMenu: {
                funcName: "fluid.demoMenu.closeMenu",
                args: "{that}"
            },
            bindBlurHandler: {
                funcName: "fluid.demoMenu.bindBlurHandler",
                args: "{that}"
            }
        },
        selectors: {
            toggleControl: ".flc-demoMenu-toggleControl",
            menuBody: ".flc-demoMenu-body",
            componentName: ".flc-demoMenu-componentName",
            componentVersion: ".flc-demoMenu-componentVersion",
            description: ".flc-demoMenu-description",
            instructionsHeading: ".flc-demoMenu-instructionsHeading",
            instructions: ".flc-demoMenu-instructions",
            codeLink: ".flc-demoMenu-codeLink",
            codeLinkText: ".flc-demoMenu-codeLinkText",
            apiLink: ".flc-demoMenu-apiLink",
            apiLinkText: ".flc-demoMenu-apiLinkText",
            designLink: ".flc-demoMenu-designLink",
            designLinkText: ".flc-demoMenu-designLinkText",
            feedbackText: ".flc-demoMenu-feedbackText",
            feedbackLink: ".flc-demoMenu-feedbackLink",
            feedbackLinkText: ".flc-demoMenu-feedbackLinkText",
            closeControl: ".flc-demoMenu-closeControl",
            closeText: ".flc-demoMenu-closeText"
        },
        selectorsToIgnore: ["toggleControl", "menuBody", "codeLink", "apiLink", "designLink", "feedbackLink", "closeControl"],
        protoTree: {
            componentName: {messagekey: "componentName"},
            componentVersion: {messagekey: "componentVersion"},
            description: {markup: "${{that}.options.markup.description}"},
            instructionsHeading: {messagekey: "instructionsHeading"},
            instructions: {markup: "${{that}.options.markup.instructions}"},
            codeLinkText: {messagekey: "codeLinkText"},
            apiLinkText: {messagekey: "apiLinkText"},
            designLinkText: {messagekey: "designLinkText"},
            feedbackText: {messagekey: "feedbackText"},
            feedbackLinkText: {messagekey: "feedbackLinkText"},
            closeText: {messagekey: "closeText"}
        },
        strings: {
            componentName: "Component Name",
            componentVersion: "Version #",
            instructionsHeading: "Instructions",
            codeLinkText: "code",
            apiLinkText: "API",
            designLinkText: "design",
            feedbackText: "Feedback statement and link",
            feedbackLinkText: "Link text",
            closeText: "close"
        },
        markup: {
            description: "A description of the component should appear here. It should say: <ul><li>What the component does.</li><li>Why it is interesting / useful.</li></ul>",
            instructions: "<p>Do this to do this. Do that to do that.</p>",
            codeLinkHref: "#",
            apiLinkHref: "#",
            designLinkHref: "#",
            feedbackLinkHref: "#"
        }
    });

    fluid.demoMenu.showTemplate = function (that) {
        fluid.fetchResources(that.options.resources, function () {
            that.refreshView();
        });
    };

    fluid.demoMenu.toggleMenu = function (that, value) {
        that.applier.requestChange("showMenu", !value);
    };

    fluid.demoMenu.closeMenu = function (that) {
        that.applier.requestChange("showMenu", false);
    };

    fluid.demoMenu.bindBlurHandler = function (that) {
        fluid.deadMansBlur(that.container, {
            exclusions: [that.container],
            handler: function () {
                fluid.demoMenu.closeMenu(that);
            }
        });
    };

})(jQuery, fluid_1_5);
