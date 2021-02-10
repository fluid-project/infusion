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

/* This file contains functions which depend on the presence of a markup document
 * somehow represented and which depend on the contents of Fluid.js
 */

var fluid_3_0_0 = fluid_3_0_0 || {}; // eslint-disable-line no-redeclare

(function ($, fluid) {
    "use strict";

    /** Invoke the supplied function on the supplied arguments
     * @param {Object} options - A structure encoding a function invocation
     * @param {Function} options.func - The function to be invoked
     * @param {Array} options.args - The arguments on which the function is to be invoked
     * @return {Any} The return value from the function invocation
     */
    fluid.apply = function (options) {
        return options.func.apply(null, options.args);
    };

    // A "proto-viewComponent" which simply defines a DOM binder and is agnostic as to how its container is defined
    // Temporary factoring artefact which will most likely go away/be improved once new renderer has stabilised
    fluid.defaults("fluid.baseViewComponent", {
        gradeNames: "fluid.component",
        argumentMap: {
            container: 0,
            options: 1
        },
        invokers: {
            locate: {
                // We use this peculiar form of definition since the current implementation of makeInvoker can't
                // cope with a variable function, and the DOM binder instance is historically mutable
                // TODO: We should be able to get rid of this again once we remove the virtual DOM
                funcName: "fluid.apply",
                args: {
                    func: "{that}.dom.locate",
                    args: "{arguments}"
                }
            }
        },
        events: {
            onDomBind: null
        },
        // Note that we apply the same timing as the pref's framework's panels for old-style components, to avoid
        // confusing its timing before it is rewritten, which has a whole bunch of createOnEvent: "onDomBind" subcomponents.
        // The renderer and all modern components will fire this in a timely way when the DOM binder is actually constructed
        listeners: {
            "onCreate.onDomBind": "{that}.events.onDomBind"
        },
        selectors: {
        },
        members: {
            dom: "@expand:fluid.createDomBinder({that}.container, {that}.options.selectors)"
        },
        // mergePolicy allows these members to be cleanly overridden, avoiding FLUID-5668
        mergePolicy: {
            "members.dom": "replace",
            "members.container": "replace"
        }
    });

    fluid.defaults("fluid.viewComponent", {
        gradeNames: ["fluid.modelComponent", "fluid.baseViewComponent"],
        members: {
            container: "@expand:fluid.containerForViewComponent({that}, {that}.options.container)"
        }
    });

    // unsupported, NON-API function
    fluid.dumpSelector = function (selectable) {
        return typeof(selectable) === "string" ? selectable :
            selectable.selector ? selectable.selector : "";
    };

    fluid.checkTryCatchParameter = function () {
        var location = window.location || { search: "", protocol: "file:" };
        var GETparams = location.search.slice(1).split("&");
        return fluid.find(GETparams, function (param) {
            if (param.indexOf("notrycatch") === 0) {
                return true;
            }
        }) === true;
    };

    fluid.notrycatch = fluid.checkTryCatchParameter();


    /**
     * Wraps an object in a jQuery if it isn't already one. This function is useful since
     * it ensures to wrap a null or otherwise falsy argument to itself, rather than the
     * often unhelpful jQuery default of returning the overall document node.
     *
     * @param {Object} obj - the object to wrap in a jQuery
     * @param {jQuery} [userJQuery] - the jQuery object to use for the wrapping, optional - use the current jQuery if absent
     * @return {jQuery} - The wrapped object.
     */
    fluid.wrap = function (obj, userJQuery) {
        userJQuery = userJQuery || $;
        return ((!obj || obj.jquery) ? obj : userJQuery(obj));
    };

    /**
     * If obj is a jQuery, this function will return the first DOM element within it. Otherwise, the object will be returned unchanged.
     *
     * @param {jQuery} obj - The jQuery instance to unwrap into a pure DOM element.
     * @return {Object} - The unwrapped object.
     */
    fluid.unwrap = function (obj) {
        return obj && obj.jquery ? obj[0] : obj;
    };

    /**
     * Fetches a single container element and returns it as a jQuery.
     *
     * @param {String|jQuery|element} containerSpec - an id string, a single-element jQuery, or a DOM element specifying a unique container
     * @param {Boolean} fallible - <code>true</code> if an empty container is to be reported as a valid condition
     * @param {jQuery} [userJQuery] - the jQuery object to use for the wrapping, optional - use the current jQuery if absent
     * @return {jQuery} - A single-element jQuery container.
     */
    fluid.container = function (containerSpec, fallible, userJQuery) {
        if (!containerSpec) {
            fluid.fail("fluid.container argument is empty");
        }
        var selector = containerSpec.selector || containerSpec;
        if (userJQuery) {
            containerSpec = fluid.unwrap(containerSpec);
        }
        var container = fluid.wrap(containerSpec, userJQuery);
        if (fallible && (!container || container.length === 0)) {
            return null;
        }

        if (!container || !container.jquery || container.length !== 1) {
            if (typeof(containerSpec) !== "string") {
                containerSpec = container.selector;
            }
            var count = container.length !== undefined ? container.length : 0;
            var extraMessage = container.selectorName ? " with selector name " + container.selectorName +
                " in context " + fluid.dumpEl(containerSpec.context) : "";
            fluid.fail((count > 1 ? "More than one (" + count + ") container elements were" :
                "No container element was") + " found for selector " + containerSpec + extraMessage );
        }
        if (!fluid.isDOMNode(container[0])) {
            fluid.fail("fluid.container was supplied a non-jQueryable element");
        }

        // To address FLUID-5966, manually adding back the selector and context properties that were removed from jQuery v3.0.
        // ( see: https://jquery.com/upgrade-guide/3.0/#breaking-change-deprecated-context-and-selector-properties-removed )
        // In most cases the "selector" property will already be restored through the DOM binder;
        // however, when a selector or pure jQuery element is supplied directly as a component's container, we need to add them
        // if it is possible to infer them. This feature is rarely used but is crucial for the prefs framework infrastructure
        // in Panels.js fluid.prefs.subPanel.resetDomBinder
        container.selector = selector;
        container.context = container.context || containerSpec.ownerDocument || document;

        return container;
    };

    /**
     * Creates a new DOM Binder instance, used to locate elements in the DOM by name.
     *
     * @param {Object} container - the root element in which to locate named elements
     * @param {Object} selectors - a collection of named jQuery selectors
     * @return {Object} - The new DOM binder.
     */
    fluid.createDomBinder = function (container, selectors) {
        var that = {
            id: fluid.allocateGuid(),
            cache: {}
        };
        var userJQuery = container.constructor;

        function cacheKey(name, thisContainer) {
            return fluid.allocateSimpleId(thisContainer) + "-" + name;
        }

        function record(name, thisContainer, result) {
            that.cache[cacheKey(name, thisContainer)] = result;
        }

        that.locate = function (name, localContainer) {
            var selector, thisContainer, togo;

            selector = selectors[name];
            if (selector === undefined) {
                if (name === "container") {
                    selector = "";
                } else { // TODO: This should become an error case
                    return undefined;
                }
            }
            thisContainer = localContainer ? $(localContainer) : container;
            if (!thisContainer) {
                fluid.fail("DOM binder invoked for selector " + name + " without container");
            }
            if (selector === "") {
                togo = thisContainer;
            }
            else if (!selector) {
                togo = userJQuery(); // TODO: This is not reasonable and must be made into an error case
            }
            else {
                if (typeof(selector) === "function") {
                    togo = userJQuery(selector.call(null, fluid.unwrap(thisContainer)));
                } else {
                    togo = userJQuery(selector, thisContainer);
                }
            }

            if (!togo.selector) {
                togo.selector = selector;
                togo.context = thisContainer;
            }
            togo.selectorName = name;
            record(name, thisContainer, togo);
            return togo;
        };
        that.fastLocate = function (name, localContainer) {
            var thisContainer = localContainer ? localContainer : container;
            var key = cacheKey(name, thisContainer);
            var togo = that.cache[key];
            return togo ? togo : that.locate(name, localContainer);
        };
        that.clear = function () {
            that.cache = {};
        };
        that.refresh = function (names, localContainer) {
            var thisContainer = localContainer ? localContainer : container;
            if (typeof names === "string") {
                names = [names];
            }
            if (thisContainer.length === undefined) {
                thisContainer = [thisContainer];
            }
            for (var i = 0; i < names.length; ++i) {
                for (var j = 0; j < thisContainer.length; ++j) {
                    that.locate(names[i], thisContainer[j]);
                }
            }
        };
        that.resolvePathSegment = that.locate;

        return that;
    };

    /* Expect that jQuery selector query has resulted in a non-empty set of
     * results. If none are found, this function will fail with a diagnostic message,
     * with the supplied message prepended.
     */
    fluid.expectFilledSelector = function (result, message) {
        if (result && result.length === 0 && result.jquery) {
            fluid.fail(message + ": selector \"" + result.selector + "\" with name " + result.selectorName +
                       " returned no results in context " + fluid.dumpEl(result.context));
        }
    };

    fluid.containerForViewComponent = function (that, containerSpec) {
        var container = fluid.container(containerSpec);
        fluid.expectFilledSelector(container, "Error instantiating viewComponent at path \"" + fluid.pathForComponent(that));
        return container;
    };


    /**
     * Returns the id attribute from a jQuery or pure DOM element.
     *
     * @param {jQuery|Element} element - the element to return the id attribute for.
     * @return {String} - The id attribute of the element.
     */
    fluid.getId = function (element) {
        return fluid.unwrap(element).id;
    };

    /*
     * Allocate an id to the supplied element if it has none already, by a simple
     * scheme resulting in ids "fluid-id-nnnn" where nnnn is an increasing integer.
     */
    fluid.allocateSimpleId = function (element) {
        element = fluid.unwrap(element);
        if (!element || fluid.isPrimitive(element)) {
            return null;
        }

        if (!element.id) {
            var simpleId = "fluid-id-" + fluid.allocateGuid();
            element.id = simpleId;
        }
        return element.id;
    };

    // The current implementation of fluid.ariaLabeller consists 100% of side-effects on the document and so
    // this grade is supplied only so that instantiation on the server is not an error
    fluid.defaults("fluid.ariaLabeller", {
        gradeNames: "fluid.viewComponent"
    });

})(jQuery, fluid_3_0_0);
