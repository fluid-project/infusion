/*
Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

// Declare dependencies
/*global fluid, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

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
            "onCreate.setVisibility": "{that}.setVisibility",
            "onCreate.showTemplate": "fluid.demoMenu.showTemplate",
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
                funcName: "fluid.demoMenu.setVisibility",
                args: ["{that}", "{that}.model.showMenu"],
                dynamic: true
            },
            toggleMenu: {
                funcName: "fluid.demoMenu.toggleMenu",
                args: ["{that}", "{that}.model.showMenu"],
                dynamic: true
            },
            closeMenu: {
                funcName: "fluid.demoMenu.closeMenu",
                args: "{that}"
            }
        },
        selectors: {
            toggleControl: ".flc-demoMenu-toggleControl",
            titleBegin: ".flc-demoMenu-title-begin",
            titleLinkText: ".flc-demoMenu-title-linkText",
            titleEnd: ".flc-demoMenu-title-end",
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
        selectorsToIgnore: ["toggleControl", "codeLink", "apiLink", "designLink", "feedbackLink", "closeControl"],
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
        styles: {
            hidden: "fl-demoMenu-hidden"
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

    fluid.demoMenu.setVisibility = function (that, value) {
        that.container.toggleClass(that.options.styles.hidden, !value);
    };

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

})(jQuery, fluid_1_5);
