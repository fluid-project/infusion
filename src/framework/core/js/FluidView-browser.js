/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/** This file contains functions which depend on the presence of a browser-style DOM document
 *  and which depend on the contents of Fluid.js **/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.materialisers");

    fluid.makeDomMaterialiserManager = function () {
        // In future we will want to track listeners and other elements in order to invalidate them, but currently
        // there are no use cases
        var that = {
            idToModelListeners: {}
        };
        return that;
    };

    fluid.domMaterialiserManager = fluid.makeDomMaterialiserManager();

    // Passive - pushes out to single-arg jQuery method, active in acquiring initial markup value for booleanAttr
    fluid.materialisers.domOutput = function (that, segs, type, options) {
        var selectorName = segs[1];
        var listener = function (value) {
            if (that.dom) {
                var element = that.dom.locate(selectorName);

                if (!element || !element.length) {
                    fluid.fail("Could not locate element for selector " + selectorName + " for component " + fluid.dumpComponentAndPath(that));
                }
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
        // TODO: For this and click, integralise over the entire document and add just one single listener - also, preferably eliminate jQuery
        // Perhaps a giant WeakMap of all DOM binder cache contents?
        that.events.onDomBind.addListener(function () {
            that.dom.locate(segs[1]).hover(makeListener(true), makeListener(false));
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

    // Remember, naturally all this stuff will go into defaults when we can afford it
    fluid.registerNamespace("fluid.materialiserRegistry");


    fluid.materialiserRegistry["fluid.viewComponent"] = {
        "dom": {
            "*": {
                "text": {
                    materialiser: "fluid.materialisers.domOutput",
                    args: ["jQuery", {method: "text"}]
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
                "value": {
                    materialiser: "fluid.materialisers.domValue"
                },
                "class": {
                    materialiser: "fluid.materialisers.domOutput",
                    args: ["jQuery", {method: "toggleClass", makeArgs: function (model) {
                        return [ model.segs[3], !!model.value];
                    }}]
                }
            }
        }
    };

    /** A generalisation of jQuery.val to correctly handle the case of acquiring and setting the value of clustered
     * radio button/checkbox sets, potentially, given a node corresponding to just one element.
     * @param {jQuery} nodeIn The node whose value is to be read or written
     * @param {Any} newValue If `undefined`, the value will be read, otherwise, the supplied value will be applied to the node
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


    /* Sets the value to the DOM element and triggers the change event on the element.
     * Note: when using jQuery val() function to change the node value, the change event would
     * not be fired automatically, it requires to be initiated by the user.
     *
     * @param {A jQueryable DOM element} node - A selector, a DOM node, or a jQuery instance
     * @param {String|Number|Array} value - A string of text, a number, or an array of strings
     * corresponding to the value of each matched element to set in the node
     */
    fluid.changeElementValue = function (node, value) {
        node = $(node);
        fluid.value(node, value);
        node.change();
    };

    // TODO: Most of these utilities below are not general purpose, and should either be packaged with individual components
    // such as the Reorderer if they are still appropriate, or else abolished once the new renderer is fully rolled out

    // DOM Utilities.

    /**
     * Finds the nearest ancestor of the element that matches a predicate
     * @param {Element} element - DOM element
     * @param {Function} test - A function (predicate) accepting a DOM element, returning a truthy value representing a match
     * @return {Element|undefined} - The first element parent for which the predicate returns truthy - or undefined if no parent matches
     */
    fluid.findAncestor = function (element, test) {
        element = fluid.unwrap(element);
        while (element) {
            if (test(element)) {
                return element;
            }
            element = element.parentNode;
        }
    };

    fluid.findForm = function (node) {
        return fluid.findAncestor(node, function (element) {
            return element.nodeName.toLowerCase() === "form";
        });
    };

    /* A utility with the same signature as jQuery.text and jQuery.html, but without the API irregularity
     * that treats a single argument of undefined as different to no arguments */
    // in jQuery 1.7.1, jQuery pulled the same dumb trick with $.text() that they did with $.val() previously,
    // see comment in fluid.value below
    fluid.each(["text", "html"], function (method) {
        fluid[method] = function (node, newValue) {
            node = $(node);
            return newValue === undefined ? node[method]() : node[method](newValue);
        };
    });

    fluid.BINDING_ROOT_KEY = "fluid-binding-root";

    /* Recursively find any data stored under a given name from a node upwards
     * in its DOM hierarchy **/

    fluid.findData = function (elem, name) {
        while (elem) {
            var data = $.data(elem, name);
            if (data) {
                return data;
            }
            elem = elem.parentNode;
        }
    };

    fluid.bindFossils = function (node, data, fossils) {
        $.data(node, fluid.BINDING_ROOT_KEY, {data: data, fossils: fossils});
    };

    fluid.boundPathForNode = function (node, fossils) {
        node = fluid.unwrap(node);
        var key = node.name || node.id;
        var record = fossils[key];
        return record ? record.EL : null;
    };

    /* relevant, the changed value received at the given DOM node */
    fluid.applyBoundChange = function (node, newValue, applier) {
        node = fluid.unwrap(node);
        if (newValue === undefined) {
            newValue = fluid.value(node);
        }
        if (node.nodeType === undefined && node.length > 0) {
            node = node[0];
        } // assume here that they share name and parent
        var root = fluid.findData(node, fluid.BINDING_ROOT_KEY);
        if (!root) {
            fluid.fail("Bound data could not be discovered in any node above " + fluid.dumpEl(node));
        }
        var name = node.name;
        var fossil = root.fossils[name];
        if (!fossil) {
            fluid.fail("No fossil discovered for name " + name + " in fossil record above " + fluid.dumpEl(node));
        }
        var EL = root.fossils[name].EL;
        if (applier) {
            applier.fireChangeRequest({path: EL, value: newValue, source: "DOM:" + node.id});
        } else {
            fluid.set(root.data, EL, newValue);
        }
    };


    /*
     * Returns a jQuery object given the id of a DOM node. In the case the element
     * is not found, will return an empty list.
     */
    fluid.jById = function (id, dokkument) {
        dokkument = dokkument && dokkument.nodeType === 9 ? dokkument : document;
        var element = fluid.byId(id, dokkument);
        var togo = element ? $(element) : [];
        togo.selector = "#" + id;
        togo.context = dokkument;
        return togo;
    };

    /**
     * Returns an DOM element quickly, given an id
     *
     * @param {Object} id - the id of the DOM node to find
     * @param {Document} dokkument - the document in which it is to be found (if left empty, use the current document)
     * @return {Object} - The DOM element with this id, or null, if none exists in the document.
     */
    fluid.byId = function (id, dokkument) {
        dokkument = dokkument && dokkument.nodeType === 9 ? dokkument : document;
        var el = dokkument.getElementById(id);
        if (el) {
        // Use element id property here rather than attribute, to work around FLUID-3953
            if (el.id !== id) {
                fluid.fail("Problem in document structure - picked up element " +
                    fluid.dumpEl(el) + " for id " + id +
                    " without this id - most likely the element has a name which conflicts with this id");
            }
            return el;
        } else {
            return null;
        }
    };

    /**
     * Returns the document to which an element belongs, or the element itself if it is already a document
     *
     * @param {jQuery|Element} element - The element to return the document for
     * @return {Document} - The document in which it is to be found
     */
    fluid.getDocument = function (element) {
        var node = fluid.unwrap(element);
        // DOCUMENT_NODE - guide to node types at https://developer.mozilla.org/en/docs/Web/API/Node/nodeType
        return node.nodeType === 9 ? node : node.ownerDocument;
    };

    // END DOM UTILITIES which are probably not general purpose

    /** Fluid ARIA Labeller **/

    fluid.defaults("fluid.ariaLabeller", {
        gradeNames: ["fluid.viewComponent"],
        labelAttribute: "aria-label",
        liveRegionMarkup: "<div class=\"liveRegion fl-hidden-accessible\" aria-live=\"polite\"></div>",
        liveRegionId: "fluid-ariaLabeller-liveRegion",
        invokers: {
            generateLiveElement: {
                funcName: "fluid.ariaLabeller.generateLiveElement",
                args: "{that}"
            },
            update: {
                funcName: "fluid.ariaLabeller.update",
                args: ["{that}", "{arguments}.0"]
            }
        },
        listeners: {
            onCreate: {
                func: "{that}.update",
                args: [null]
            }
        }
    });

    fluid.ariaLabeller.update = function (that, newOptions) {
        newOptions = newOptions || that.options;
        that.container.attr(that.options.labelAttribute, newOptions.text);
        if (newOptions.dynamicLabel) {
            var live = fluid.jById(that.options.liveRegionId);
            if (live.length === 0) {
                live = that.generateLiveElement();
            }
            live.text(newOptions.text);
        }
    };

    fluid.ariaLabeller.generateLiveElement = function (that) {
        var liveEl = $(that.options.liveRegionMarkup);
        liveEl.prop("id", that.options.liveRegionId);
        $("body").append(liveEl);
        return liveEl;
    };

    var LABEL_KEY = "aria-labelling";

    fluid.getAriaLabeller = function (element) {
        element = $(element);
        var that = fluid.getScopedData(element, LABEL_KEY);
        return that;
    };

    /* Manages an ARIA-mediated label attached to a given DOM element. An
     * aria-labelledby attribute and target node is fabricated in the document
     * if they do not exist already, and a view component is returned exposing a method
     * "update" that allows the text to be updated. */

    fluid.updateAriaLabel = function (element, text, options) {
        options = $.extend({}, options || {}, {text: text});
        var that = fluid.getAriaLabeller(element);
        if (!that) {
            that = fluid.ariaLabeller(element, options);
            fluid.setScopedData(element, LABEL_KEY, that);
        } else {
            that.update(options);
        }
        return that;
    };

    /* "Global Dismissal Handler" for the entire page. Attaches a click handler to the
     * document root that will cause dismissal of any elements (typically dialogs) which
     * have registered themselves. Dismissal through this route will automatically clean up
     * the record - however, the dismisser themselves must take care to deregister in the case
     * dismissal is triggered through the dialog interface itself. This component can also be
     * automatically configured by fluid.deadMansBlur by means of the "cancelByDefault" option */

    var dismissList = {};

    $(document).click(function (event) {
        var target = fluid.resolveEventTarget(event);
        while (target) {
            if (dismissList[target.id]) {
                return;
            }
            target = target.parentNode;
        }
        fluid.each(dismissList, function (dismissFunc, key) {
            dismissFunc(event);
            delete dismissList[key];
        });
    });
    // TODO: extend a configurable equivalent of the above dealing with "focusin" events

    /* Accepts a free hash of nodes and an optional "dismissal function".
     * If dismissFunc is set, this "arms" the dismissal system, such that when a click
     * is received OUTSIDE any of the hierarchy covered by "nodes", the dismissal function
     * will be executed.
     */
    fluid.globalDismissal = function (nodes, dismissFunc) {
        fluid.each(nodes, function (node) {
          // Don't bother to use the real id if it is from a foreign document - we will never receive events
          // from it directly in any case - and foreign documents may be under the control of malign fiends
          // such as tinyMCE who allocate the same id to everything
            var id = fluid.unwrap(node).ownerDocument === document ? fluid.allocateSimpleId(node) : fluid.allocateGuid();
            if (dismissFunc) {
                dismissList[id] = dismissFunc;
            }
            else {
                delete dismissList[id];
            }
        });
    };

    /* Sets an interation on a target control, which morally manages a "blur" for
     * a possibly composite region.
     * A timed blur listener is set on the control, which waits for a short period of
     * time (options.delay, defaults to 150ms) to discover whether the reason for the
     * blur interaction is that either a focus or click is being serviced on a nominated
     * set of "exclusions" (options.exclusions, a free hash of elements or jQueries).
     * If no such event is received within the window, options.handler will be called
     * with the argument "control", to service whatever interaction is required of the
     * blur.
     */

    fluid.deadMansBlur = function (control, options) {
        // TODO: This should be rewritten as a proper component
        var that = {options: $.extend(true, {}, fluid.defaults("fluid.deadMansBlur"), options)};
        that.blurPending = false;
        that.lastCancel = 0;
        that.canceller = function (event) {
            fluid.log("Cancellation through " + event.type + " on " + fluid.dumpEl(event.target));
            that.lastCancel = Date.now();
            that.blurPending = false;
        };
        that.noteProceeded = function () {
            fluid.globalDismissal(that.options.exclusions);
        };
        that.reArm = function () {
            fluid.globalDismissal(that.options.exclusions, that.proceed);
        };
        that.addExclusion = function (exclusions) {
            fluid.globalDismissal(exclusions, that.proceed);
        };
        that.proceed = function (event) {
            fluid.log("Direct proceed through " + event.type + " on " + fluid.dumpEl(event.target));
            that.blurPending = false;
            that.options.handler(control);
        };
        fluid.each(that.options.exclusions, function (exclusion) {
            exclusion = $(exclusion);
            fluid.each(exclusion, function (excludeEl) {
                $(excludeEl).on("focusin", that.canceller).
                    on("fluid-focus", that.canceller).
                    click(that.canceller).mousedown(that.canceller);
    // Mousedown is added for FLUID-4212, as a result of Chrome bug 6759, 14204
            });
        });
        if (!that.options.cancelByDefault) {
            $(control).on("focusout", function (event) {
                fluid.log("Starting blur timer for element " + fluid.dumpEl(event.target));
                var now = Date.now();
                fluid.log("back delay: " + (now - that.lastCancel));
                if (now - that.lastCancel > that.options.backDelay) {
                    that.blurPending = true;
                }
                setTimeout(function () {
                    if (that.blurPending) {
                        that.options.handler(control);
                    }
                }, that.options.delay);
            });
        }
        else {
            that.reArm();
        }
        return that;
    };

    fluid.defaults("fluid.deadMansBlur", {
        gradeNames: "fluid.function",
        delay: 150,
        backDelay: 100
    });

})(jQuery, fluid_3_0_0);
