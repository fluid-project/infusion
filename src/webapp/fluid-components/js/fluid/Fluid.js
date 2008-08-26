/*
Copyright 2007-2008 University of Cambridge
Copyright 2007-2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/

var fluid = fluid || {};

(function (jQuery, fluid) {
    fluid.keys = {
        TAB: 9,
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        META: 19,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        i: 73,
        j: 74,
        k: 75,
        m: 77
    };
    
    /**
     * These roles are used to add ARIA roles to orderable items. This list can be extended as needed,
     * but the values of the container and item roles must match ARIA-specified roles.
     */  
    fluid.roles = {
        GRID: { container: "grid", item: "gridcell" },
        LIST: { container: "list", item: "listitem" },
        REGIONS: { container: "main", item: "article" }
    };
    
    fluid.orientation = {
        HORIZONTAL: "horiz",
        VERTICAL: "vert"
    };
    
    /**
     * This is the position, relative to a given drop target, that a dragged item should be dropped.
     */
    fluid.position = {
        BEFORE: 0, 
        AFTER: 1,
        INSIDE: 2,
        USE_LAST_KNOWN: 3,  // given configuration meaningless, use last known drop target
        DISALLOWED: -1      // cannot drop in given configuration
    };
    
    /**
     * For incrementing/decrementing a count or index.
     */
    fluid.direction = {
        NEXT: 1,
        PREVIOUS: -1
    };
    
    fluid.defaultKeysets = [{
        modifier : function (evt) {
            return evt.ctrlKey;
        },
        up : fluid.keys.UP,
        down : fluid.keys.DOWN,
        right : fluid.keys.RIGHT,
        left : fluid.keys.LEFT
    },
    {
        modifier : function (evt) {
            return evt.ctrlKey;
        },
        up : fluid.keys.i,
        down : fluid.keys.m,
        right : fluid.keys.k,
        left : fluid.keys.j
    }];
    
    fluid.wrap = function (obj) {
        return ((!obj || obj.jquery) ? obj : jQuery(obj)); 
    };
    
    fluid.unwrap = function (obj) {
        return obj.jquery ? obj[0] : obj; // Unwrap the element if it's a jQuery.
    };
    
    /**
     * Fetches a single container element and returns it as a jQuery.
     * 
     * @param {String||jQuery||element} an id string, a single-element jQuery, or a DOM element specifying a unique container
     * @return a single-element jQuery of container
     */
    fluid.container = function (container) {
        if (typeof container === "string" || 
          container.nodeType && (container.nodeType === 1  || container.nodeType === 9)) {
            container = jQuery(container);
        }
        
        // Throw an exception if we've got more or less than one element.
        if (!container || !container.jquery || container.length !== 1) {
            fluid.fail({
                name: "NotOne",
                message: "A single container element was not found."
            });
        }
        
        return container;
    };
    
    /**
     * Retreives and stores a component's default settings centrally.
     * 
     * @param {String} componentName the name of the component
     * @param {Object} (optional) an container of key/value pairs to set
     * 
     */
    var defaultsStore = {};
    fluid.defaults = function (componentName, defaultsObject) {
        if (arguments.length > 1) {
            defaultsStore[componentName] = defaultsObject;   
            return defaultsObject;
        }
        
        return defaultsStore[componentName];
    };
    
    fluid.dumpEl = function (element) {
        if (!element) {
            return "null";
        }
        element = jQuery(element);
        var togo = element.get(0).tagName;
        if (element.attr("id")) {
            togo += "#" + element.attr("id");
        }
        if (element.attr("class")) {
            togo += "." + element.attr("class");
        }
        return togo;
    };
    
    fluid.fail = function (message) {
        fluid.utils.setLogging(true);
        fluid.utils.debug(message.message? message.message : message);
        message.fail(); // Intentionally cause a browser error by invoking a nonexistent function.
    };
    
    function getNextNode(iterator) {
        if (iterator.node.firstChild) {
            iterator.node = iterator.node.firstChild;
            iterator.depth += 1;
            return iterator;
        }
        while (iterator.node) {
            if (iterator.node.nextSibling) {
                iterator.node = iterator.node.nextSibling;
                return iterator;
            }
            iterator.node = iterator.node.parentNode;
            iterator.depth -= 1;
        }
        return iterator;
    }
    
    // Work around IE circular DOM issue. This is the default max DOM depth on IE.
    // http://msdn2.microsoft.com/en-us/library/ms761392(VS.85).aspx
    fluid.DOM_BAIL_DEPTH = 256;
    
    fluid.iterateDom = function (node, acceptor) {
        var currentNode = {node: node, depth: 0};
        while (currentNode.node !== null && currentNode.depth >= 0 && currentNode.depth < fluid.DOM_BAIL_DEPTH) {
            if (currentNode.nodeType === 1) {
                acceptor(currentNode.node, currentNode.depth);
            }
            currentNode = getNextNode(currentNode);
        }
    };
    
    fluid.createDomBinder = function (container, selectors) {
        var cache = {}, that = {};
        
        function cacheKey(name, thisContainer) {
            return jQuery.data(fluid.unwrap(thisContainer)) + "-" + name;
        }

        function record(name, thisContainer, result) {
            cache[cacheKey(name, thisContainer)] = result;
        }

        that.locate = function (name, localContainer) {
            var selector, thisContainer, togo;
            
            selector = selectors[name];
            thisContainer = localContainer? localContainer: container;
            if (!thisContainer) {
                fluid.fail("DOM binder invoked for selector " + name + " without container");
            }

            if (!selector) {
                return thisContainer;
            }

            if (typeof(selector) === "function") {
                togo = jQuery(selector.call(null, fluid.unwrap(thisContainer)));
            } else {
                togo = jQuery(selector, thisContainer);
            }
            if (togo.get(0) === document) {
                togo = [];
                //fluid.fail("Selector " + name + " with value " + selectors[name] +
                //            " did not find any elements with container " + fluid.dumpEl(container));
            }
            record(name, thisContainer, togo);
            return togo;
        };
        that.fastLocate = function (name, localContainer) {
            var thisContainer = localContainer? localContainer: container;
            var key = cacheKey(name, thisContainer);
            var togo = cache[key];
            return togo? togo : that.locate(name, localContainer);
        };
        that.clear = function () {
            cache = {};
        };
        that.refresh = function (names, localContainer) {
            if (typeof names === "string") {
                names = [names];
            }
            if (! (localContainer instanceof Array)) {
                localContainer = [localContainer];
            }
            for (var i = 0; i < names.length; ++ i) {
                for (var j = 0; j < localContainer.length; ++ j) {
                    that.locate(names[i], localContainer[j]);
                }
            }
        };
        
        return that;
    };
    
    /**
     * Merges the component's declared defaults, as obtained from fluid.defaults(),
     * with the user's specified overrides.
     * 
     * @param {Object} that the instance to attach the options to
     * @param {String} componentName the unique "name" of the component, which will be used
     * to fetch the default options from store. By recommendation, this should be the global
     * name of the component's creator function.
     * @param {Object} userOptions the user-specified configuration options for this component
     */
    fluid.mergeComponentOptions = function (that, componentName, userOptions) {
        var defaults = fluid.defaults(componentName); 
        that.options = fluid.utils.merge(defaults? defaults.mergePolicy: null, {}, defaults, userOptions);    
    };
    
    /** 
     * The central initialisation method called as the first act of every 
     * Fluid view. This function automatically merges user options with defaults
     * and attaches a DOM Binder to the instance.
     * 
     * @param {String} componentName The unique "name" of the component, which will be used
     * to fetch the default options from store. By recommendation, this should be the global
     * name of the component's creator function.
     * @param {jQueryable} container A specifier for the single root "container node" in the
     * DOM which will house all the markup for this component.
     * @param {Object} userOptions The configuration options for this component.
     */
    fluid.initView = function (componentName, container, userOptions) {
        var that = {};
        fluid.mergeComponentOptions(that, componentName, userOptions);
        
        if (container) {
            that.container = fluid.container(container);
            fluid.initDomBinder(that);
        }

        return that;
    };
    
    fluid.initDomBinder = function (that) {
        that.dom = fluid.createDomBinder(that.container, that.options.selectors);
        that.locate = that.dom.locate;      
    };
    
    fluid.initDecorators = function (that) {
        var decorators = that.options.componentDecorators;
        if (!decorators) {
            return;
        }
      
        if (typeof(decorators) === 'string') {
            decorators = [decorators];
        }
        for (var i = 0; i < decorators.length; i += 1) {
            var decoratorName = decorators[i];
            fluid.utils.invokeGlobalFunction(decoratorName, [that, that.options[decoratorName]]);
        }
    };
    
    var fluid_guid = 1;
    
    // A hash of (jQuery data id) elements to "true" indicating whether the corresponding
    // DOM element is the source of an event for the current cycle.
    var fluid_sourceElements = {};
    
    fluid.event = {};
    
    fluid.event.getEventFirer = function () {
        var log = fluid.utils.debug;
        var listeners = {};
        return {
            addListener: function (listener, namespace, exclusions) {
                if (!namespace) {
                    if (!listener.$$guid) {
                        listener.$$guid = fluid_guid += 1;
                    }
                    namespace = listener.$$guid;
                }

                var excludeids = [];
                if (exclusions) {
                    for (var i in exclusions) {
                        excludeids.push(jQuery.data(exclusions[i]));
                    }
                }
                listeners[namespace] = {listener: listener, exclusions: excludeids};
            },

            removeListener: function (listener) {
                if (typeof(listener) === 'string') {
                    delete listeners[listener];
                }
                else if (typeof(listener) === 'object' && listener.$$guid) {
                    delete listeners[listener.$$guid];
                }
            },
        
            fireEvent: function () {
                for (var i in listeners) {
                    var lisrec = listeners[i];
                    var excluded = false;
                    for (var j in lisrec.exclusions) {
                        var exclusion = lisrec.exclusions[j];
                        log("Checking exclusion for " + exclusion);
                        if (fluid_sourceElements[exclusion]) {
                            log("Excluded");
                            excluded = true;
                            break;
                        }
                    }
                    if (!excluded) {
                        try {
                            log("Firing to listener " + i + " with arguments " + arguments);
                            lisrec.listener.apply(null, arguments);
                        }
                        catch (e) {
                            log("FireEvent received exception " + e.message + " e " + e + " firing to listener " + i);
                            throw (e);       
                        }
                    }
                }
            }
        };
    };
    
    fluid.model = {};
    
   
    /** Copy a source "model" onto a target **/
    fluid.model.copyModel = function copyModel(target, source) {
        fluid.utils.clear(target);
        jQuery.extend(true, target, source);
    };
    
    fluid.model.parseEL = function (EL) {
        return EL.split('.');
    };
  
    /** This function implements the RSF "DARApplier" **/
    fluid.model.setBeanValue = function (root, EL, newValue) {
        var segs = fluid.model.parseEL(EL);
        for (var i = 0; i < segs.length - 1; i += 1) {
            if (!root[segs[i]]) {
                root[segs[i]] = {};
            }
            root = root[segs[i]];
        }
        root[segs[segs.length - 1]] = newValue;
    };
      
    fluid.model.getBeanValue = function (root, EL) {
        var segs = fluid.model.parseEL(EL);
        for (var i = 0; i < segs.length; i += 1) {
            root = root[segs[i]];
            if (!root) {
                return root;
            }
        }
        return root;
    };
      
    /*
     * Utilities object for providing various general convenience functions
     */
    fluid.utils = {};
    
    /** Returns the absolute position of a supplied DOM node in pixels.
     * Implementation taken from quirksmode http://www.quirksmode.org/js/findpos.html
     */
    fluid.utils.computeAbsolutePosition = function (element) {
        var curleft = 0, curtop = 0;
	    if (element.offsetParent) {
	        do {
	            curleft += element.offsetLeft;
	            curtop += element.offsetTop;
	        } while (element = element.offsetParent);
	        return [curleft, curtop];
	    }
	};
    
    fluid.utils.computeDomDepth = function (element) {
        var depth = 0;
        while (element) {
            element = element.parentNode;
            depth += 1;
        }
        return depth;
    };
    
    /**
     * Useful for drag-and-drop during a drag:  is the mouse over the "before" half
     * of the droppable?  In the case of a vertically oriented set of orderables,
     * "before" means "above".  For a horizontally oriented set, "before" means
     * "left of".
     */
    fluid.utils.mousePosition = function (droppableEl, orientation, x, y) {        
        var mid;
        var isBefore;
        if (orientation === fluid.orientation.VERTICAL) {
            mid = jQuery(droppableEl).offset().top + (droppableEl.offsetHeight / 2);
            isBefore = y < mid;
        } else {
            mid = jQuery(droppableEl).offset().left + (droppableEl.offsetWidth / 2);
            isBefore = x < mid;
        }
        
        return (isBefore ? fluid.position.BEFORE : fluid.position.AFTER);
    };  
    
    // Custom query method seeks all tags descended from a given root with a 
    // particular tag name, whose id matches a regex. The Dojo query parser
    // is broken http://trac.dojotoolkit.org/ticket/3520#preview, this is all
    // it might do anyway, and this will be plenty fast.
    fluid.utils.seekNodesById = function (rootnode, tagname, idmatch) {
        var inputs = rootnode.getElementsByTagName(tagname);
        var togo = [];
        for (var i = 0; i < inputs.length; i += 1) {
            var input = inputs[i];
            var id = input.id;
            if (id && id.match(idmatch)) {
                togo.push(input);
            }
        }
        return togo;
    };
          
    fluid.utils.escapeSelector = function (id) {
        return id.replace(/\:/g, "\\:");
    };
      
    fluid.utils.findForm = function (element) {
        while (element) {
            if (element.nodeName.toLowerCase() === "form") {
                return element;
            }
            element = element.parentNode;
        }
    };
    
    /** 
     * Clears an object or array of its contents. For objects, each property is deleted.
     * 
     * @param {Object|Array} target the thing to clear
     */
    fluid.utils.clear = function (target) {
        if (target instanceof Array) {
            target.length = 0;
        }
        else {
            for (var i in target) {
                delete target[i];
            }
        }
    };
    
    function mergeImpl(policy, basePath, target, source) {
        var thisPolicy = policy? policy[basePath] : policy;
        if (typeof(thisPolicy) === "function") {
            thisPolicy.apply(null, target, source);
            return target;
        }
        if (thisPolicy === "replace") {
            fluid.utils.clear(target);
        }
      
        for (var name in source) {
            var path = (basePath? basePath + ".": "") + name;
            var thisTarget = target[name];
            var thisSource = source[name];
    
            if (thisSource !== undefined) {
                if (thisSource !== null && typeof(thisSource) === 'object') {
                    if (!thisTarget) {
                        target[name] = thisTarget = thisSource instanceof Array? [] : {};
                    }
                    mergeImpl(policy, path, thisTarget, thisSource);
                }
                else {
                    target[name] = thisSource;
                }
            }
        }
        return target;    
    }
    
    fluid.utils.permute = function () {
      
    };
    
    fluid.utils.merge = function (policy, target) {
        var path = "";
        
        for (var i = 2; i < arguments.length; i += 1) {
            var source = arguments[i];
            mergeImpl(policy, path, target, source);
        }
        if (policy) {
            for (var key in policy) {
                var elrh = policy[key];
                if (typeof(elrh) === 'string' && elrh !== "replace") {
                    var oldValue = fluid.model.getBeanValue(target, key);
                    if (oldValue === null || oldValue === undefined) {
                        var value = fluid.model.getBeanValue(target, elrh);
                        fluid.model.setBeanValue(target, key, value);
                    }
                }
            }
        }
        return target;     
    };
    
    fluid.utils.invokeGlobalFunction = function (functionPath, args) {
        return fluid.model.getBeanValue(window, functionPath).apply(null, args);
    };
    
    /**
     * Returns a jQuery object given the id of a DOM node
     */
    fluid.utils.jById = function (id) {
        var el = jQuery("[id=" + id + "]");
        if (el[0] && el[0].id === id) {
            return el;        
        }       
        
        return null;
    };

    var fluid_logging = false;

    fluid.utils.debug = function (str) {
        if (fluid_logging) {
            str = new Date().toTimeString() + ":  " + str;
            if (typeof(console) !== "undefined") {
                if (console.debug) {
                    console.debug(str);
                } else {
                    console.log(str);
                }
            }
            else if (typeof(YAHOO) !== "undefined") {
                YAHOO.log(str);
            }
            else if (typeof(opera) !== "undefined") {
                opera.postError(str);
            }
        }
    };
    
    fluid.log = fluid.utils.debug;
    
     /** method to allow user to enable logging (off by default) */
    fluid.utils.setLogging = function (enabled) {
        if (typeof enabled === "boolean") {
            fluid_logging = enabled;
        } else {
            fluid_logging = false;
        }
    };
    

    fluid.utils.derivePercent = function (num, total) {
        return Math.round((num * 100) / total);
    };
    
    /**
     * Simple string template system. 
     * Takes a template string containing tokens in the form of "%value".
     * Returns a new string with the tokens replaced by the specified values.
     * Keys and values can be of any data type that can be coerced into a string. Arrays will work here as well.
     * 
     * @param {String}    template    a string (can be HTML) that contains tokens embedded into it
     * @param {object}    values        a collection of token keys and values
     */
    fluid.utils.stringTemplate = function (template, values) {
        var newString = template;
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                var searchStr = "%" + key;
                newString = newString.replace(searchStr, values[key]);
            }
        }
        return newString;
    };

    /**
     * Finds the ancestor of the element that passes the test
     * @param {Element} element DOM element
     * @param {Function} test A function which takes an element as a parameter and return true or false for some test
     */
    fluid.utils.findAncestor = function (element, test) {
        return test(element) ? element : jQuery.grep(jQuery(element).parents(), test)[0];
    };
    
})(jQuery, fluid);
