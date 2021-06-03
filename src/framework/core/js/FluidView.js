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
            dom: "@expand:fluid.createDomBinder({that}.container, {that}.options.selectors)",
            locate: "{that}.dom.locate"
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
     * @param {String|jQuery|Element} containerSpec - an selector, a single-element jQuery, or a DOM element specifying a unique container
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
            // TODO: This boneheaded overwriting of our arguments prevents plain view components appearing as children of renderer components -
            // unless of course it has already overwritten the DOM binder's cache value - doesn't seem possible. A renderer component could
            // of course broadcast an addon grade to all its viewComponent children overriding their container resolver
            if (typeof(containerSpec) !== "string") {
                containerSpec = container.selector;
            }
            var count = container.length !== undefined ? container.length : 0;
            // TODO: "in context" confusingly reports "undefined" in the usual case that containerSpec is just a selector
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
        var userJQuery = container.constructor;
        var that = {
            container: container,
            id: fluid.allocateGuid(),
            doQuery: function (selector) {
                return userJQuery(selector, that.container);
            },
            cache: {}
        };

        that.locate = function (selectorName) {
            var selector = selectorName === "container" ? "" : selectors[selectorName];
            if (selector === undefined) {
                fluid.fail("DOM binder request for selector " + selectorName + " which is not registered");
            }
            var togo;
            if (selector === "") {
                togo = that.container;
            } else {
                togo = that.doQuery(selector, selectorName);
            }
            // These hacks are still required since fluid.prefs.subPanel.resetDomBinder egregiously reads them off the panel container
            togo.selector = selector;
            togo.context = that.container;

            togo.selectorName = selectorName;
            that.cache[selectorName] = togo;
            return togo;
        };
        that.fastLocate = function (selectorName) {
            return that.cache[selectorName] || that.locate(selectorName);
        };
        that.resetContainer = function (container) {
            that.container = container;
            that.clear();
        };
        that.clear = function () {
            that.cache = {};
        };
        that.resolvePathSegment = that.locate;

        return that;
    };

    /**
     * Creates a new "local container"-capable DOM Binder instance, used to locate elements in the DOM by name. This
     * is a historical contract for the DOM binder which was used by two components, the FileQueueView and the Reorderer.
     * A simpler contract has been extracted in order to be compatible with future notions of the DOM binder used by
     * the "new" FLUID-6580 renderer.
     *
     * @param {Object} container - the root element in which to locate named elements
     * @param {Object} selectors - a collection of named jQuery selectors
     * @return {Object} - The new DOM binder.
     */
    fluid.createLocalContainerDomBinder = function (container, selectors) {
        var that = {
            container: container,
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
                } else {
                    fluid.fail("DOM binder request for selector " + name + " which is not registered");
                }
            }
            thisContainer = localContainer || that.container;
            if (!thisContainer) {
                fluid.fail("DOM binder invoked for selector " + name + " without container");
            }
            if (selector === "") {
                togo = thisContainer;
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
            var thisContainer = localContainer ? localContainer : that.container;
            var key = cacheKey(name, thisContainer);
            var togo = that.cache[key];
            return togo ? togo : that.locate(name, localContainer);
        };
        that.resetContainer = function (container) {
            that.container = container;
            that.clear();
        };
        that.clear = function () {
            that.cache = {};
        };
        that.refresh = function (names, localContainer) {
            var thisContainer = localContainer ? localContainer : that.container;
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

    fluid.registerNamespace("fluid.materialisers");

    fluid.makeDomMaterialiserManager = function () {
        // In future we will want to track listeners and other elements in order to invalidate them, but currently
        // there are no use cases
        var that = {
            idToModelListeners: {}
        };
        return that;
    };

    fluid.checkMaterialisedElement = function (element, selectorName, that) {
        if (!element || !element.length) {
            fluid.fail("Could not locate element for selector " + selectorName + " for component " + fluid.dumpComponentAndPath(that));
        }
    };

    fluid.domMaterialiserManager = fluid.makeDomMaterialiserManager();

    // Passive - pushes out to single-arg jQuery method, active in acquiring initial markup value for booleanAttr
    fluid.materialisers.domOutput = function (that, segs, type, options) {
        fluid.freezeRecursive(segs);
        var selectorName = segs[1];
        var listener = function (value) {
            if (that.dom) {
                var element = that.dom.locate(selectorName);
                fluid.checkMaterialisedElement(element, selectorName, that);

                if (type === "jQuery") {
                    var model = {
                        value: value,
                        segs: segs
                    };
                    var args = options.makeArgs ? options.makeArgs(model) : [model.value];
                    element[options.method].apply(element, args);
                } else if (type === "booleanAttr") {
                    if (value === undefined) {
                        var markupValue = !!element.attr(options.attr);
                        that.applier.change(segs, options.negate ? !markupValue : markupValue);
                    } else {
                        var attrValue = options.negate ? !value : value;
                        if (attrValue) {
                            element.attr(options.attr, options.attr);
                        } else {
                            element.removeAttr(options.attr);
                        }
                    }
                }
            }
        };
        //        fluid.pushArray(fluid.domMaterialiserManager.idToModelListeners, that.id, listener);
        that.applier.modelChanged.addListener({segs: segs}, listener);
        that.events.onDomBind.addListener(function () {
            var modelValue = fluid.getImmediate(that.model, segs);
            listener(modelValue);
        });
        // For "read" materialisers, if the DOM has shorter lifetime than the component, the binder will still function
    };

    fluid.incrementModel = function (that, segs) {
        var oldValue = fluid.getImmediate(that.model, segs) || 0;
        that.applier.change(segs, oldValue + 1);
    };

    // Active - count of received clicks
    fluid.materialisers.domClick = function (that, segs) {
        // Note that we no longer supply an initial value to avoid confusing non-integral modelListeners
        // that.applier.change(segs, 0);
        var listener = function () {
            fluid.incrementModel(that, segs);
            // TODO: Add a change source, and stick "event" on the stack somehow
        };
        // TODO: ensure that we don't miss the initial DOM bind event - unlikely, since models are resolved first
        // We assume that an outdated DOM will cease to generate events and be GCed
        that.events.onDomBind.addListener(function () {
            that.dom.locate(segs[1]).click(listener);
        });
    };

    // Active - hover state
    fluid.materialisers.hover = function (that, segs) {
        var makeListener = function (state) {
            return function () {
                // TODO: Add a change source, and stick "event" on the stack somehow
                that.applier.change(segs, state);
            };
        };
        // TODO: For this, click and focusin, integralise over the entire document and add just one single listener - also, preferably eliminate jQuery
        // Perhaps a giant WeakMap of all DOM binder cache contents?
        that.events.onDomBind.addListener(function () {
            that.dom.locate(segs[1]).hover(makeListener(true), makeListener(false));
        });
    };

    // Active - focusin state
    fluid.materialisers.focusin = function (that, segs) {
        var makeListener = function (state) {
            return function () {
                // TODO: Add a change source, and stick "event" on the stack somehow
                that.applier.change(segs, state);
            };
        };
        that.events.onDomBind.addListener(function () {
            that.dom.locate(segs[1]).focusin(makeListener(true)).focusout(makeListener(false));
        });
    };

    // Bidirectional - reads existing id or allocates simple if not present, and also allows it to be rewritten from the model
    fluid.materialisers.id = function (that, segs) {
        that.events.onDomBind.addListener(function () {
            var element = that.dom.locate(segs[1])[0];
            var id = fluid.allocateSimpleId(element);
            that.applier.change(segs, id, "ADD", "DOM");
            var modelListener = function (value) {
                if (value !== undefined) {
                    element.id = value;
                }
            };

            that.applier.modelChanged.addListener({segs: segs, excludeSource: "DOM"}, modelListener);
        });
    };


    // Bidirectional - pushes and receives values
    fluid.materialisers.domValue = function (that, segs) {
        that.events.onDomBind.addListener(function () {
            var element = that.dom.locate(segs[1]);

            var domListener = function () {
                var val = fluid.value(element);
                that.applier.change(segs, val, "ADD", "DOM");
            };

            var modelListener = function (value) {
                if (value !== undefined) {
                    fluid.value(element, value);
                }
            };

            that.applier.modelChanged.addListener({segs: segs, excludeSource: "DOM"}, modelListener);

            var options = fluid.getImmediate(that, ["options", "bindingOptions", fluid.model.composeSegments.apply(null, segs)]);
            var changeEvent = options && options.changeEvent || "change";

            element.on(changeEvent, domListener);
            // Pull the initial value from the model
            modelListener(fluid.getImmediate(that.model, segs));
            // TODO: How do we know not to pull the value from the DOM on startup? Are we expected to introspect into
            // the relay rule connecting it? Surely not. In practice this should use the same rule as "outlying init
            // values" in the main ChangeApplier which we have done, but so far there is no mechanism to override it.
        });
    };

    // Passive
    fluid.materialisers.style = function (that, segs) {
        var selectorName = segs[1];
        that.events.onDomBind.addListener(function () {
            var element = that.dom.locate(selectorName);
            fluid.checkMaterialisedElement(element, selectorName, that);
            var modelValue = fluid.getImmediate(that.model, segs);
            element[0].style[segs[3]] = modelValue;
        });
    };

    // Remember, naturally all this stuff will go into defaults when we can afford it
    fluid.registerNamespace("fluid.materialiserRegistry");


    fluid.materialiserRegistry["fluid.viewComponent"] = {
        "dom": {
            "*": {
                "text": {
                    materialiser: "fluid.materialisers.domOutput",
                    args: ["jQuery", {method: "text"}]
                },
                "attrs": {
                    materialiser: "fluid.materialisers.domOutput",
                    args: ["jQuery", {method: "attr", makeArgs: function (model) {
                        return [ model.segs[3], model.value];
                    }}]
                },
                "visible": {
                    materialiser: "fluid.materialisers.domOutput",
                    args: ["jQuery", {method: "toggle"}]
                },
                "enabled": {
                    materialiser: "fluid.materialisers.domOutput",
                    args: ["booleanAttr", {attr: "disabled", negate: true}]
                },
                "click": {
                    materialiser: "fluid.materialisers.domClick"
                },
                "hover": {
                    materialiser: "fluid.materialisers.hover"
                },
                "focusin": {
                    materialiser: "fluid.materialisers.focusin"
                },
                "value": {
                    materialiser: "fluid.materialisers.domValue"
                },
                "class": {
                    materialiser: "fluid.materialisers.domOutput",
                    args: ["jQuery", {method: "toggleClass", makeArgs: function (model) {
                        return [ model.segs[3], !!model.value];
                    }}]
                },
                "style": {
                    materialiser: "fluid.materialisers.style"
                },
                "id": {
                    materialiser: "fluid.materialisers.id"
                }
            }
        }
    };

    /** A generalisation of jQuery.val to correctly handle the case of acquiring and setting the value of clustered
     * radio button/checkbox sets, potentially, given a node corresponding to just one element.
     * @param {jQuery} nodeIn - The node whose value is to be read or written
     * @param {Any} newValue - If `undefined`, the value will be read, otherwise, the supplied value will be applied to the node
     * @return {Any} The queried value, if `newValue` was undefined
     */
    fluid.value = function (nodeIn, newValue) {
        var node = fluid.unwrap(nodeIn);
        var isMultiple = false;
        if (node.nodeType === undefined && node.length > 1) {
            node = node[0];
            isMultiple = true;
        }
        if ("input" !== node.nodeName.toLowerCase() || !/radio|checkbox/.test(node.type)) {
            // resist changes to contract of jQuery.val() in jQuery 1.5.1 (see FLUID-4113)
            return newValue === undefined ? $(node).val() : $(node).val(newValue);
        }
        var name = node.name;
        var elements;
        if (isMultiple || name === "") {
            elements = nodeIn;
        } else {
            elements = node.ownerDocument.getElementsByName(name);
            var scope = fluid.findForm(node);
            elements = $.grep(elements, function (element) {
                if (element.name !== name) {
                    return false;
                }
                return !scope || fluid.dom.isContainer(scope, element);
            });
            // TODO: "Code to the test" for old renderer - remove all HTML 1.0 behaviour when old renderer is abolished
            isMultiple = elements.length > 1;
        }
        if (newValue !== undefined) {
            if (typeof(newValue) === "boolean") {
                newValue = (newValue ? "true" : "false");
            }
            // jQuery gets this partially right, but when dealing with radio button array will
            // set all of their values to "newValue" rather than setting the checked property
            // of the corresponding control.
            $.each(elements, function () {
                this.checked = (newValue instanceof Array ?
                    newValue.indexOf(this.value) !== -1 : newValue === this.value);
            });
        } else { // it is a checkbox - jQuery fails on this - see https://stackoverflow.com/questions/5621324/jquery-val-and-checkboxes
            var checked = $.map(elements, function (element) {
                return element.checked ? element.value : null;
            });
            return node.type === "radio" ? checked[0] :
                isMultiple ? checked : !!checked[0]; // else it's a checkbox
        }
    };

    // The current implementation of fluid.ariaLabeller consists 100% of side-effects on the document and so
    // this grade is supplied only so that instantiation on the server is not an error
    fluid.defaults("fluid.ariaLabeller", {
        gradeNames: "fluid.viewComponent"
    });

})(jQuery, fluid_3_0_0);
