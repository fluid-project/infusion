var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    fluid.defaults("fluid.overviewPanel", {
        gradeNames: ["fluid.rendererComponent", "fluid.modelComponent", "autoInit"],
        resources: {
            template: {
                href: "../html/overviewPanelTemplate.html"
            }
        },
        listeners: {
            "onCreate.showTemplate": {
                "funcName": "fluid.overviewPanel.showTemplate"
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
                funcName: "fluid.overviewPanel.setVisibility",
                args: ["{that}", "{that}.model.showMenu"],
                dynamic: true
            },
            toggleMenu: {
                funcName: "fluid.overviewPanel.toggleMenu",
                args: ["{that}", "{that}.model.showMenu"],
                dynamic: true
            },
            closeMenu: {
                funcName: "fluid.overviewPanel.closeMenu",
                args: "{that}"
            }
        },
        selectors: {
            overviewPanelRoot: ".flc-overviewPanel-root",
            toggleControl: ".flc-overviewPanel-toggleControl",
            titleBegin: ".flc-overviewPanel-title-begin",
            titleLinkText: ".flc-overviewPanel-title-linkText",
            titleEnd: ".flc-overviewPanel-title-end",
            componentName: ".flc-overviewPanel-componentName",
            componentVersion: ".flc-overviewPanel-componentVersion",
            description: ".flc-overviewPanel-description",
            instructionsHeading: ".flc-overviewPanel-instructionsHeading",
            instructions: ".flc-overviewPanel-instructions",
            codeLink: ".flc-overviewPanel-codeLink",
            codeLinkText: ".flc-overviewPanel-codeLinkText",
            apiLink: ".flc-overviewPanel-apiLink",
            apiLinkText: ".flc-overviewPanel-apiLinkText",
            designLink: ".flc-overviewPanel-designLink",
            designLinkText: ".flc-overviewPanel-designLinkText",
            feedbackText: ".flc-overviewPanel-feedbackText",
            feedbackLink: ".flc-overviewPanel-feedbackLink",
            feedbackLinkText: ".flc-overviewPanel-feedbackLinkText",
            closeControl: ".flc-overviewPanel-closeControl",
            closeText: ".flc-overviewPanel-closeText"
        },
        selectorsToIgnore: ["overviewPanelRoot", "toggleControl", "codeLink", "apiLink", "designLink", "feedbackLink", "closeControl"],
        protoTree: {
            titleBegin: {messagekey: "titleBegin"},
            titleLinkText: {messagekey: "titleLinkText"},
            titleEnd: {messagekey: "titleEnd"},
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
            titleBegin: "A ",
            titleLinkText: "fluid project",
            titleEnd: " component demo",
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

    fluid.overviewPanel.showTemplate = function (that) {
        fluid.fetchResources(that.options.resources, function () {
            that.refreshView();
        });
    };

    fluid.overviewPanel.setVisibility = function (that, value) {
        that.locate("overviewPanelRoot").toggleClass("fl-overviewPanel-hidden", !value);
    };

    fluid.overviewPanel.toggleMenu = function (that, value) {
        that.applier.requestChange("showMenu", !value);
    };

    fluid.overviewPanel.closeMenu = function (that) {
        that.applier.requestChange("showMenu", false);
    };

})(jQuery, fluid_1_5);
