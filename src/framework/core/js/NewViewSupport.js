/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/*
    The contents of this file were adapted from ViewComponentSupport.js and ComponentGraph.js in fluid-authoring
    See: https://github.com/fluid-project/fluid-authoring/blob/FLUID-4884/src/js/ViewComponentSupport.js
         https://github.com/fluid-project/fluid-authoring/blob/FLUID-4884/src/js/ComponentGraph.js
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /**
     * A viewComponent which renders its own markup including its container, into a
     * specified parent container.
     */
    fluid.defaults("fluid.containerRenderingView", {
        gradeNames: ["fluid.viewComponent"],
        members: {
            container: "@expand:{that}.renderContainer()"
        },
        // The DOM element which this component should inject its markup into on startup
        parentContainer: "{that}.options.container",
        injectionType: "append",
        invokers: {
            renderMarkup: "fluid.identity({that}.options.markup.container)",
            renderContainer: "fluid.containerRenderingView.renderContainer({that}, {that}.renderMarkup, {that}.addToParent)",
            addToParent: {
                funcName: "fluid.containerRenderingView.addToParent",
                args: ["{that}.options.parentContainer", "{arguments}.0", "{that}.options.injectionType"]
            }
        },
        workflows: {
            global: {
                // This workflow function is necessary since otherwise the natural evaluation order of lensed components
                // during local workflow will evaluate them in reverse order
                evaluateContainers: {
                    funcName: "fluid.renderer.evaluateContainers",
                    priority: "last",
                    waitIO: true
                }
            }
        },
        listeners: {
            "onDestroy.clearInjectedMarkup": {
                "this": "{that}.container",
                method: "remove",
                args: []
            }
        }
    });

    fluid.registerNamespace("fluid.renderer");

    /** A component depending on template markup resources during startup. Shared between fluid.templateRenderingView
     * and the new renderer
     */
    fluid.defaults("fluid.templateResourceFetcher", {
        gradeNames: "fluid.resourceLoader",
        // Configure a map here of all templates which should be pre-fetched during fetchTemplates so that they are
        // ready for renderMarkup
        rendererTemplateResources: {
            template: true
        },
        // Set to true to defeat template fetching during startup
        skipTemplateFetch: false,
        workflows: {
            global: {
                fetchTemplates: {
                    funcName: "fluid.renderer.fetchTemplates",
                    priority: "after:enlistModel"
                }
            }
        }
    });

    fluid.renderer.fetchTemplates = function (shadows) {
        shadows.forEach(function (shadow) {
            var that = shadow.that;
            if (fluid.componentHasGrade(that, "fluid.templateResourceFetcher")) {
                var skipTemplateFetch = fluid.getForComponent(that, ["options", "skipTemplateFetch"]);
                if (!skipTemplateFetch) {
                    var rendererTemplateResources = fluid.getForComponent(that, ["options", "rendererTemplateResources"]);
                    fluid.each(rendererTemplateResources, function (value, key) {
                        if (value) {
                            fluid.getForComponent(that, ["resources", key]);
                        }
                    });
                }
            }
        });
    };

    /**
     * Used to add an element to a parent container. Internally it can use either of jQuery's prepend or append methods.
     *
     * @param {jQuery|DOMElement|Selector} parentContainer - any jQueryable selector representing the parent element to
     *                                                       inject the `elm` into.
     * @param {DOMElement|jQuery} elm - a DOM element or jQuery element to be added to the parent.
     * @param {String} method - (optional) a string representing the method to use to add the `elm` to the
     *                          `parentContainer`. The method can be "append" (default), "prepend", or "html" (will
     *                          replace the contents).
     */
    fluid.containerRenderingView.addToParent = function (parentContainer, elm, method) {
        if (!parentContainer) {
            fluid.fail("fluid.containerRenderingView needs to have \"parentContainer\" or \"container\" option supplied");
        }
        method = method || "append";
        $(parentContainer)[method](elm);
    };

    fluid.renderer.evaluateContainers = function (shadows) {
        shadows.forEach(function (shadow) {
            fluid.getForComponent(shadow.that, "container");
        });
    };

    /**
     * Renders the components markup and inserts it into the parent container based on the addToParent method
     *
     * @param {Component} that - the component
     * @param {Function} renderMarkup - a function returning the components container markup to be inserted into the
     *                                  parentContainer element
     * @param {Function} addToParent - a function that inserts the container into the DOM
     * @return {DOMElement} - the container
     */
    fluid.containerRenderingView.renderContainer = function (that, renderMarkup, addToParent) {
        fluid.log("Rendering container for " + that.id);
        var containerMarkup = renderMarkup();
        var container = $(containerMarkup);
        addToParent(container);
        return container;
    };

    /**
     * A fluid.containerRenderingView which fetches a template and renders it into the container.
     *
     * The template path must be supplied either via a top level `templateUrl` option or directly to the
     * `resources.template` option. The path may optionally include "terms" to use as tokens which will be resolved
     * from values specified in the `resourceOptions.terms` option --- see fluid.resourceLoader for further details.
     *
     * The template is fetched on creation and rendered into the container after it has been fetched.
     */
    fluid.defaults("fluid.templateRenderingView", {
        gradeNames: ["fluid.containerRenderingView", "fluid.templateResourceFetcher"],
        invokers: {
            renderMarkup: "fluid.identity({that}.resources.template.parsed)"
        },
        distributeOptions: {
            "mapTemplateUrl": {
                source: "{that}.options.templateUrl",
                target: "{that}.options.resources.template.url"
            }
        }
    });

})(jQuery, fluid_3_0_0);
