/*!
 * Fluid Infusion v1.5
 *
 * Infusion is distributed under the Educational Community License 2.0 and new BSD licenses: 
 * http://wiki.fluidproject.org/display/fluid/Fluid+Licensing
 *
 * For information on copyright, see the individual Infusion source code files: 
 * https://github.com/fluid-project/infusion/
 */

/*
Copyright 2007-2010 University of Cambridge
Copyright 2007-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley
Copyright 2010-2011 Lucendo Development Ltd.
Copyright 2010 OCAD University
Copyright 2011 Charly Molter

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global console, window, fluid:true, fluid_1_5:true, jQuery, opera, YAHOO*/

// JSLint options 
/*jslint white: true, funcinvoke: true, continue: true, jslintok: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};
var fluid = fluid || fluid_1_5;

(function ($, fluid) {
    
    fluid.version = "Infusion 1.5";
    
    fluid.environment = {
        fluid: fluid
    };
    var globalObject = window || {};
    
    var softFailure = [false];
    
    // This function will be patched from FluidIoC.js in order to describe complex activities
    fluid.describeActivity = function () {
        return [];
    };
    
    /**
     * Causes an error message to be logged to the console and a real runtime error to be thrown.
     * 
     * @param {String|Error} message the error message to log
     * @param ... Additional arguments
     */
    fluid.fail = function (message /*, ... */) { // jslint:ok - whitespace in arg list
        fluid.setLogging(true);
        fluid.log.apply(null, ["ASSERTION FAILED: "].concat(fluid.makeArray(arguments)).concat(fluid.describeActivity()));
        if (softFailure[0]) {
            throw new Error(message);
        } else {
            message.fail(); // Intentionally cause a browser error by invoking a nonexistent function.
        }
    };
    
    fluid.pushSoftFailure = function (condition) {
        if (typeof (condition) === "boolean") {
            softFailure.unshift(condition);
        } else if (condition === -1) {
            softFailure.shift();
        }
    };
    
    fluid.notrycatch = false;
    
    // A wrapper for the try/catch/finally language feature, to aid debugging on environments
    // such as IE, where any try will destroy stack information for errors
    fluid.tryCatch = function (tryfun, catchfun, finallyfun) {
        finallyfun = finallyfun || fluid.identity;
        if (fluid.notrycatch) {
            var togo = tryfun();
            finallyfun();
            return togo;
        } else {
            try {
                return tryfun();  
            } catch (e) {
                if (catchfun) {
                    catchfun(e);
                } else { 
                    throw (e);
                }
            } finally {
                finallyfun();
            }
        }
    };
    
    // TODO: rescued from kettleCouchDB.js - clean up in time
    fluid.expect = function (name, members, target) {
        fluid.transform(fluid.makeArray(members), function (key) {
            if (typeof target[key] === "undefined") {
                fluid.fail(name + " missing required parameter " + key);
            }
        });
    };

    // Logging

    var logging;
        
    /** Returns whether logging is enabled **/
    fluid.isLogging = function () {
        return logging;
    };

    /** method to allow user to enable logging (off by default) */
    fluid.setLogging = function (enabled) {
        if (typeof enabled === "boolean") {
            logging = enabled;
        } else {
            logging = false;
        }
    };

    // On some dodgy environments (notably IE9 and recent alphas of Firebug 1.8), 
    // console.log/debug are incomplete function objects and need to be operated via
    // this trick: http://stackoverflow.com/questions/5472938/does-ie9-support-console-log-and-is-it-a-real-function
    fluid.applyHostFunction = function (obj, func, args) {
        if (func.apply) {
            func.apply(obj, args);
        } else {
            var applier = Function.prototype.bind.call(func, obj);
            applier.apply(obj, args);
        }
    };

    /** Log a message to a suitable environmental console. If the standard "console" 
     * stream is available, the message will be sent there - otherwise either the
     * YAHOO logger or the Opera "postError" stream will be used. Logging must first
     * be enabled with a call to the fluid.setLogging(true) function.
     */
    fluid.log = function (message /*, ... */) { // jslint:ok - whitespace in arg list
        if (logging) {
            var arg0 = fluid.renderTimestamp(new Date()) + ":  "; 
            var args = [arg0].concat(fluid.makeArray(arguments));
            var str = args.join("");
            if (typeof (console) !== "undefined") {
                if (console.debug) {
                    fluid.applyHostFunction(console, console.debug, args);
                } else if (typeof (console.log) === "function") {
                    fluid.applyHostFunction(console, console.log, args);
                } else {
                    console.log(str); // this branch executes on old IE, fully synthetic console.log
                }
            } else if (typeof (YAHOO) !== "undefined") {
                YAHOO.log(str);
            } else if (typeof (opera) !== "undefined") {
                opera.postError(str);
            }
        }
    };
     
    // Functional programming utilities.
               
    /** A basic utility that returns its argument unchanged */
    
    fluid.identity = function (arg) {
        return arg;
    };
    
    // Framework and instantiation functions.

    
    /** Returns true if the argument is a value other than null or undefined **/
    fluid.isValue = function (value) {
        return value !== undefined && value !== null;
    };
    
    /** Returns true if the argument is a primitive type **/
    fluid.isPrimitive = function (value) {
        var valueType = typeof (value);
        return !value || valueType === "string" || valueType === "boolean" || valueType === "number" || valueType === "function";
    };
    
    fluid.isDOMNode = function (obj) {
      // This could be more sound, but messy: 
      // http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
        return obj && typeof (obj.nodeType) === "number";  
    };
    
    /** Determines whether the supplied object can be treated as an array, by 
     * iterating an index towards its length. The test functions by detecting
     * a property named "length" which is of type "number", but excluding objects
     * which are themselves of primitive types (in particular functions and strings)
     */
    fluid.isArrayable = function (totest) {
        return totest && !fluid.isPrimitive(totest) && typeof (totest.length) === "number";
    };
    
    /** Return an empty container as the same type as the argument (either an
     * array or hash */
    fluid.freshContainer = function (tocopy) {
        return fluid.isArrayable(tocopy) ? [] : {};   
    };
    
    /** Performs a deep copy (clone) of its argument **/
    
    fluid.copy = function (tocopy) {
        if (fluid.isPrimitive(tocopy)) {
            return tocopy;
        }
        return $.extend(true, fluid.freshContainer(tocopy), tocopy);
    };
            
    /** Corrected version of jQuery makeArray that returns an empty array on undefined rather than crashing **/
    fluid.makeArray = function (arg) {
        if (arg === null || arg === undefined) {
            return [];
        } else {
            return $.makeArray(arg);
        }
    };
    
    function transformInternal(source, togo, key, args) {
        var transit = source[key];
        for (var j = 0; j < args.length - 1; ++j) {
            transit = args[j + 1](transit, key);
        }
        togo[key] = transit; 
    }
    
    /** Return a list or hash of objects, transformed by one or more functions. Similar to
     * jQuery.map, only will accept an arbitrary list of transformation functions and also
     * works on non-arrays.
     * @param source {Array or Object} The initial container of objects to be transformed.
     * @param fn1, fn2, etc. {Function} An arbitrary number of optional further arguments,
     * all of type Function, accepting the signature (object, index), where object is the
     * list member to be transformed, and index is its list index. Each function will be
     * applied in turn to each list member, which will be replaced by the return value
     * from the function.
     * @return The finally transformed list, where each member has been replaced by the
     * original member acted on by the function or functions.
     */
    fluid.transform = function (source) {
        var togo = fluid.freshContainer(source);
        if (fluid.isArrayable(source)) {
            for (var i = 0; i < source.length; ++i) {
                transformInternal(source, togo, i, arguments);
            }
        } else {
            for (var key in source) {
                transformInternal(source, togo, key, arguments);
            }
        }  
        return togo;
    };
    
    /** Better jQuery.each which works on hashes as well as having the arguments
     * the right way round. 
     * @param source {Arrayable or Object} The container to be iterated over
     * @param func {Function} A function accepting (value, key) for each iterated
     * object. This function may return a value to terminate the iteration
     */
    fluid.each = function (source, func) {
        if (fluid.isArrayable(source)) {
            for (var i = 0; i < source.length; ++i) {
                func(source[i], i);
            }
        } else {
            for (var key in source) {
                func(source[key], key);
            }
        }
    };
    
    /** Scan through a list or hash of objects, terminating on the first member which
     * matches a predicate function.
     * @param source {Arrayable or Object} The list or hash of objects to be searched.
     * @param func {Function} A predicate function, acting on a member. A predicate which
     * returns any value which is not <code>undefined</code> will terminate
     * the search. The function accepts (object, index).
     * @param deflt {Object} A value to be returned in the case no predicate function matches
     * a list member. The default will be the natural value of <code>undefined</code>
     * @return The first return value from the predicate function which is not <code>undefined</code>
     */
    fluid.find = function (source, func, deflt) {
        var disp;
        if (fluid.isArrayable(source)) {
            for (var i = 0; i < source.length; ++i) {
                disp = func(source[i], i);
                if (disp !== undefined) {
                    return disp;
                }
            }
        } else {
            for (var key in source) {
                disp = func(source[key], key);
                if (disp !== undefined) {
                    return disp;
                }
            }
        }
        return deflt;
    };
    
    /** Scan through a list of objects, "accumulating" a value over them 
     * (may be a straightforward "sum" or some other chained computation).
     * @param list {Array} The list of objects to be accumulated over.
     * @param fn {Function} An "accumulation function" accepting the signature (object, total, index) where
     * object is the list member, total is the "running total" object (which is the return value from the previous function),
     * and index is the index number.
     * @param arg {Object} The initial value for the "running total" object.
     * @return {Object} the final running total object as returned from the final invocation of the function on the last list member.
     */
    fluid.accumulate = function (list, fn, arg) {
        for (var i = 0; i < list.length; ++i) {
            arg = fn(list[i], arg, i);
        }
        return arg;
    };
    
    /** Can through a list of objects, removing those which match a predicate. Similar to
     * jQuery.grep, only acts on the list in-place by removal, rather than by creating
     * a new list by inclusion.
     * @param source {Array|Object} The list of objects to be scanned over.
     * @param fn {Function} A predicate function determining whether an element should be
     * removed. This accepts the standard signature (object, index) and returns a "truthy"
     * result in order to determine that the supplied object should be removed from the list.
     * @return The list, transformed by the operation of removing the matched elements. The
     * supplied list is modified by this operation.
     */
    fluid.remove_if = function (source, fn) {
        if (fluid.isArrayable(source)) {
            for (var i = 0; i < source.length; ++i) {
                if (fn(source[i], i)) {
                    source.splice(i, 1);
                    --i;
                }
            }
        } else {
            for (var key in source) {
                if (fn(source[key], key)) {
                    delete source[key];
                }
            }
        }
        return source;
    };
    
    /** Accepts an object to be filtered, and a list of keys. Either all keys not present in
     * the list are removed, or only keys present in the list are returned.
     * @param toFilter {Array|Object} The object to be filtered - this will be modified by the operation
     * @param keys {Array of String} The list of keys to operate with
     * @param exclude {boolean} If <code>true</code>, the keys listed are removed rather than included
     * @return the filtered object (the same object that was supplied as <code>toFilter</code>
     */
    
    fluid.filterKeys = function (toFilter, keys, exclude) {
        return fluid.remove_if($.extend({}, toFilter), function (value, key) {
            return exclude ^ ($.inArray(key, keys) === -1);
        });
    };
    
    /** A convenience wrapper for <code>fluid.filterKeys</code> with the parameter <code>exclude</code> set to <code>true</code>
     *  Returns the supplied object with listed keys removed */

    fluid.censorKeys = function (toCensor, keys) {
        return fluid.filterKeys(toCensor, keys, true);
    };
    
    /** Return the keys in the supplied object as an array **/
    fluid.keys = function (obj) {
        var togo = [];
        fluid.each(obj, function (value, key) {
            togo.push(key);
        });
        return togo;
    };
    
    /** 
     * Searches through the supplied object, and returns <code>true</code> if the supplied value
     * can be found 
     */
    fluid.contains = function (obj, value) {
        return obj ? fluid.find(obj, function (thisValue, key) {
            if (value === thisValue) {
                return true;
            }
        }) : undefined;
    };
    
    /** 
     * Searches through the supplied object for the first value which matches the one supplied.
     * @param obj {Object} the Object to be searched through
     * @param value {Object} the value to be found. This will be compared against the object's
     * member using === equality.
     * @return {String} The first key whose value matches the one supplied, or <code>null</code> if no
     * such key is found.
     */
    fluid.keyForValue = function (obj, value) {
        return fluid.find(obj, function (thisValue, key) {
            if (value === thisValue) {
                return key;
            }
        });
    };
    
    /**
     * This method is now deprecated and will be removed in a future release of Infusion. 
     * See fluid.keyForValue instead.
     */
    fluid.findKeyInObject = fluid.keyForValue;
    
    /** Converts an array into an object whose keys are the elements of the array, each with the value "true"
     */ 
    
    fluid.arrayToHash = function (array) {
        var togo = {};
        fluid.each(array, function (el) {
            togo[el] = true;
        });
        return togo;
    };
    
    /** 
     * Clears an object or array of its contents. For objects, each property is deleted.
     * 
     * @param {Object|Array} target the target to be cleared
     */
    fluid.clear = function (target) {
        if (fluid.isArrayable(target)) {
            target.length = 0;
        } else {
            for (var i in target) {
                delete target[i];
            }
        }
    };
        
    // Model functions
    fluid.model = {}; // cannot call registerNamespace yet since it depends on fluid.model
       
    /** Another special "marker object" representing that a distinguished 
     * (probably context-dependent) value should be substituted.
     */
    fluid.VALUE = {type: "fluid.marker", value: "VALUE"};
    
    /** Another special "marker object" representing that no value is present (where
     * signalling using the value "undefined" is not possible) */
    fluid.NO_VALUE = {type: "fluid.marker", value: "NO_VALUE"};
    
    /** A marker indicating that a value requires to be expanded after component construction begins **/
    fluid.EXPAND = {type: "fluid.marker", value: "EXPAND"};
    /** A marker indicating that a value requires to be expanded immediately**/
    fluid.EXPAND_NOW = {type: "fluid.marker", value: "EXPAND_NOW"};
    
    /** Determine whether an object is any marker, or a particular marker - omit the
     * 2nd argument to detect any marker
     */
    fluid.isMarker = function (totest, type) {
        if (!totest || typeof (totest) !== 'object' || totest.type !== "fluid.marker") {
            return false;
        }
        if (!type) {
            return true;
        }
        return totest === type;
    };
   
    /** Copy a source "model" onto a target **/
    fluid.model.copyModel = function (target, source) {
        fluid.clear(target);
        $.extend(true, target, source);
    };
    
    /** Parse an EL expression separated by periods (.) into its component segments.
     * @param {String} EL The EL expression to be split
     * @return {Array of String} the component path expressions.
     * TODO: This needs to be upgraded to handle (the same) escaping rules (as RSF), so that
     * path segments containing periods and backslashes etc. can be processed, and be harmonised
     * with the more complex implementations in fluid.pathUtil(data binding).
     */
    fluid.model.parseEL = function (EL) {
        return EL === "" ? [] : String(EL).split('.');
    };
    
    /** Compose an EL expression from two separate EL expressions. The returned 
     * expression will be the one that will navigate the first expression, and then
     * the second, from the value reached by the first. Either prefix or suffix may be
     * the empty string **/
    
    fluid.model.composePath = function (prefix, suffix) {
        return prefix === "" ? suffix : (suffix === "" ? prefix : prefix + "." + suffix);
    };
    
    /** Compose any number of path segments, none of which may be empty **/
    fluid.model.composeSegments = function () {
        return $.makeArray(arguments).join(".");
    };
    
    /** Helpful alias for old-style API **/
    fluid.path = fluid.model.composeSegments;
    fluid.composePath = fluid.model.composePath;

    /** Standard strategies for resolving path segments **/
    fluid.model.environmentStrategy = function (initEnvironment) {
        return {
            init: function () {
                var environment = initEnvironment;
                return function (root, segment, index) {
                    var togo;
                    if (environment && environment[segment]) {
                        togo = environment[segment];
                    }
                    environment = null;
                    return togo; 
                };
            }
        };
    };

    fluid.model.defaultCreatorStrategy = function (root, segment) {
        if (root[segment] === undefined) {
            root[segment] = {};
            return root[segment];
        }
    };
    
    fluid.model.defaultFetchStrategy = function (root, segment) {
        return segment === "" ? root : root[segment];
    };
        
    fluid.model.funcResolverStrategy = function (root, segment) {
        if (root.resolvePathSegment) {
            return root.resolvePathSegment(segment);
        }
    };
    
    // unsupported, NON-API function
    fluid.model.applyStrategy = function (strategy, root, segment, index) {
        if (typeof (strategy) === "function") { 
            return strategy(root, segment, index);
        } else if (strategy && strategy.next) {
            return strategy.next(root, segment, index);
        }
    };
    
    // unsupported, NON-API function
    fluid.model.initStrategy = function (baseStrategy, index, oldStrategies) {
        return baseStrategy.init ? baseStrategy.init(oldStrategies ? oldStrategies[index] : undefined) : baseStrategy;
    };
    
    // unsupported, NON-API function
    fluid.model.makeTrundler = function (root, config, oldStrategies) {
        var that = {
            root: root,
            strategies: fluid.isArrayable(config) ? config : 
                fluid.transform(config.strategies, function (strategy, index) {
                    return fluid.model.initStrategy(strategy, index, oldStrategies); 
                })
        };
        that.trundle = function (EL, uncess) {
            uncess = uncess || 0;
            var newThat = fluid.model.makeTrundler(that.root, config, that.strategies);
            newThat.segs = fluid.model.parseEL(EL);
            newThat.index = 0;
            newThat.step(newThat.segs.length - uncess);
            return newThat;
        };
        that.next = function () {
            if (!that.root) {
                return;
            }
            var accepted;
            for (var i = 0; i < that.strategies.length; ++i) {
                var value = fluid.model.applyStrategy(that.strategies[i], that.root, that.segs[that.index], that.index);
                if (accepted === undefined) {
                    accepted = value;
                }
            }
            if (accepted === fluid.NO_VALUE) {
                accepted = undefined;
            }
            that.root = accepted;
            ++that.index;
        };
        that.step = function (limit) {
            for (var i = 0; i < limit; ++i) {
                that.next();
            }
            that.last = that.segs[that.index];
        };
        return that;
    };

    fluid.model.defaultSetConfig = {
        strategies: [fluid.model.funcResolverStrategy, fluid.model.defaultFetchStrategy, fluid.model.defaultCreatorStrategy]
    };
    
    // unsupported, NON-API function
    // core trundling recursion point
    fluid.model.trundleImpl = function (trundler, EL, config, uncess) {
        if (typeof (EL) === "string") {
            trundler = trundler.trundle(EL, uncess);
        } else {
            var key = EL.type || "default";
            var resolver = config.resolvers[key];
            if (!resolver) {
                fluid.fail("Unable to find resolver of type " + key);
            }
            trundler = resolver(EL, trundler) || {};
            if (EL.path && trundler.trundle && trundler.root !== undefined) {
                trundler = fluid.model.trundleImpl(trundler, EL.path, config, uncess);
            }
        }
        return trundler;  
    };
    
    // unsupported, NON-API function
    // entry point for initially unbased trundling
    fluid.model.trundle = function (root, EL, config, uncess) {
        EL = EL || "";
        config = config || fluid.model.defaultGetConfig;
        var trundler = fluid.model.makeTrundler(root, config);
        return fluid.model.trundleImpl(trundler, EL, config, uncess);
    };
    
    fluid.model.getPenultimate = function (root, EL, config) {
        return fluid.model.trundle(root, EL, config, 1);
    };
    
    fluid.set = function (root, EL, newValue, config) {
        config = config || fluid.model.defaultSetConfig;
        var trundler = fluid.model.getPenultimate(root, EL, config);
        trundler.root[trundler.last] = newValue;
    };
    
    fluid.model.defaultGetConfig = {
        strategies: [fluid.model.funcResolverStrategy, fluid.model.defaultFetchStrategy]
    };
    
    /** Evaluates an EL expression by fetching a dot-separated list of members
     * recursively from a provided root.
     * @param root The root data structure in which the EL expression is to be evaluated
     * @param {string} EL The EL expression to be evaluated
     * @param environment An optional "environment" which, if it contains any members
     * at top level, will take priority over the root data structure.
     * @return The fetched data value.
     */
    
    fluid.get = function (root, EL, config) {
        return fluid.model.trundle(root, EL, config).root;
    };

    // This backward compatibility will be maintained for a number of releases, probably until Fluid 2.0
    fluid.model.setBeanValue = fluid.set;
    fluid.model.getBeanValue = fluid.get;
    
    fluid.getGlobalValue = function (path, env) {
        if (path) {
            env = env || fluid.environment;
            var envFetcher = fluid.model.environmentStrategy(env);
            return fluid.get(globalObject, path, {strategies: [envFetcher].concat(fluid.model.defaultGetConfig.strategies)});
        }
    };
    
    /**
     * Allows for the calling of a function from an EL expression "functionPath", with the arguments "args", scoped to an framework version "environment".
     * @param {Object} functionPath - An EL expression
     * @param {Object} args - An array of arguments to be applied to the function, specified in functionPath
     * @param {Object} environment - (optional) The object to scope the functionPath to  (typically the framework root for version control)
     */
    fluid.invokeGlobalFunction = function (functionPath, args, environment) {
        var func = fluid.getGlobalValue(functionPath, environment);
        if (!func) {
            fluid.fail("Error invoking global function: " + functionPath + " could not be located");
        } else {
            return func.apply(null, args);
        }
    };
    
    /** Registers a new global function at a given path (currently assumes that
     * it lies within the fluid namespace)
     */
    
    fluid.registerGlobalFunction = function (functionPath, func, env) {
        env = env || fluid.environment;
        var envFetcher = fluid.model.environmentStrategy(env);
        fluid.set(globalObject, functionPath, func, {strategies: [envFetcher].concat(fluid.model.defaultSetConfig.strategies)});
    };
    
    fluid.setGlobalValue = fluid.registerGlobalFunction;
    
    /** Ensures that an entry in the global namespace exists **/
    fluid.registerNamespace = function (naimspace, env) {
        env = env || fluid.environment;
        var existing = fluid.getGlobalValue(naimspace, env);
        if (!existing) {
            existing = {};
            fluid.setGlobalValue(naimspace, existing, env);
        }
        return existing;
    };
    
    // stubs for two functions in FluidDebugging.js
    fluid.dumpEl = fluid.identity;
    fluid.renderTimestamp = fluid.identity;
    
    
    /*** The Model Events system. ***/
    
    fluid.registerNamespace("fluid.event");
    
    fluid.generateUniquePrefix = function () {
        return (Math.floor(Math.random() * 1e12)).toString(36) + "-";
    };
    
    var fluid_prefix = fluid.generateUniquePrefix(); 
    
    var fluid_guid = 1;
    
    /** Allocate an string value that will be very likely unique within this (browser) process **/
    
    fluid.allocateGuid = function () {
        return fluid_prefix + (fluid_guid++);
    };
    
    fluid.event.identifyListener = function (listener) {
        if (typeof (listener) === "string") {
            return listener; 
        }
        if (!listener.$$guid) {
            listener.$$guid = fluid.allocateGuid();
        }
        return listener.$$guid;
    };
    
    // unsupported, NON-API function
    fluid.event.mapPriority = function (priority, count) {
        return (priority === null || priority === undefined ? -count : 
           (priority === "last" ? -Number.MAX_VALUE :
              (priority === "first" ? Number.MAX_VALUE : priority)));
    };
    
    // unsupported, NON-API function
    fluid.event.listenerComparator = function (recA, recB) {
        return recB.priority - recA.priority;
    };
    
    // unsupported, NON-API function
    fluid.event.sortListeners = function (listeners) {
        var togo = [];
        fluid.each(listeners, function (listener) {
            togo.push(listener);
        });
        return togo.sort(fluid.event.listenerComparator);
    };
    
    // unsupported, NON-API function
    fluid.event.resolveListener = function (listener) {
        if (typeof (listener) === "string") {
            var listenerFunc = fluid.getGlobalValue(listener);
            if (!listenerFunc) {
                fluid.fail("Unable to look up name " + listener + " as a global function"); 
            } else {
                listener = listenerFunc;
            }
        }
        return listener;
    };
    
    fluid.event.nameEvent = function (that, eventName) {
        return eventName + " of " + fluid.nameComponent(that);
    };
    
    /** Construct an "event firer" object which can be used to register and deregister 
     * listeners, to which "events" can be fired. These events consist of an arbitrary
     * function signature. General documentation on the Fluid events system is at
     * http://wiki.fluidproject.org/display/fluid/The+Fluid+Event+System .
     * @param {Boolean} unicast If <code>true</code>, this is a "unicast" event which may only accept
     * a single listener.
     * @param {Boolean} preventable If <code>true</code> the return value of each handler will 
     * be checked for <code>false</code> in which case further listeners will be shortcircuited, and this
     * will be the return value of fire()
     */
    
    fluid.event.getEventFirer = function (unicast, preventable, name) {
        var listeners = {};
        var sortedListeners = [];
        
        function fireToListeners(listeners, args, wrapper) {
            fluid.log("Firing event " + name + " to list of " + listeners.length + " listeners");
            for (var i = 0; i < listeners.length; ++ i) {
                var lisrec = listeners[i];
                lisrec.listener = fluid.event.resolveListener(lisrec.listener);
                var listener = lisrec.listener;

                if (lisrec.predicate && !lisrec.predicate(listener, args)) {
                    continue;
                }
                var value = fluid.tryCatch(function () {
                    var ret = (wrapper ? wrapper(listener) : listener).apply(null, args);
                    if (preventable && ret === false) {
                        return false;
                    }
                    if (unicast) {
                        return ret;
                    }
                }, function (e) { // jslint:ok - function within a loop, only invoked synchronously
                    fluid.log("FireEvent received exception " + e.message + " e " + e + " firing to listener " + i);
                    throw (e);       
                }); // jslint:ok - function within loop
                if (value !== undefined) {
                    return value;
                }
            }
        }
        
        return {
            name: name,
            typeName: "fluid.event.firer", 
            addListener: function (listener, namespace, predicate, priority) {
                if (!listener) {
                    return;
                }
                if (unicast) {
                    namespace = "unicast";
                }
                if (!namespace) {
                    namespace = fluid.event.identifyListener(listener);
                }

                listeners[namespace] = {listener: listener, predicate: predicate, priority: 
                    fluid.event.mapPriority(priority, sortedListeners.length)};
                sortedListeners = fluid.event.sortListeners(listeners);
            },

            removeListener: function (listener) {
                if (typeof (listener) === 'string') {
                    delete listeners[listener];
                } else if (listener.$$guid) {
                    delete listeners[listener.$$guid];
                }
                sortedListeners = fluid.event.sortListeners(listeners);
            },
            // NB - this method exists currently solely for the convenience of the new,
            // transactional changeApplier. As it exists it is hard to imagine the function
            // being helpful to any other client. We need to get more experience on the kinds
            // of listeners that are useful, and ultimately factor this method away.
            fireToListeners: function (listeners, args, wrapper) {
                return fireToListeners(listeners, args, wrapper);
            },
            fire: function () {
                return fireToListeners(sortedListeners, arguments);
            }
        };
    };
    
    // unsupported, NON-API function
    fluid.event.addListenerToFirer = function (firer, value, namespace) {
        if (fluid.isArrayable(value)) {
            for (var i = 0; i < value.length; ++i) {
                fluid.event.addListenerToFirer(firer, value[i], namespace); 
            }
        } else if (typeof (value) === "function" || typeof (value) === "string") {
            firer.addListener(value, namespace);
        } else if (value && typeof (value) === "object") {
            firer.addListener(value.listener, namespace || value.namespace, value.predicate, value.priority);
        }
    };
    
    fluid.event.resolveListenerRecord = fluid.identity; // non-IOC passthrough
    
    // unsupported, NON-API function
    fluid.mergeListeners = function (that, events, listeners) {
        fluid.each(listeners, function (value, key) {
            var firer, namespace;
            if (key.charAt(0) === "{") {
                if (!fluid.expandOptions) {
                    fluid.fail("fluid.expandOptions could not be loaded - please include FluidIoC.js in order to operate IoC-driven event with descriptor " + 
                        key);
                }
                firer = fluid.expandOptions(key, that);
            } else {
                var keydot = key.indexOf(".");
            
                if (keydot !== -1) {
                    namespace = key.substring(keydot + 1);
                    key = key.substring(0, keydot);
                }
                if (!events[key]) {
                    fluid.fail("Listener registered for event " + key + " which is not defined for this component");
                    events[key] = fluid.event.getEventFirer(null, null, fluid.event.nameEvent(that, key));
                }
                firer = events[key];
            }
            value = fluid.event.resolveListenerRecord(value, that, key);
            fluid.event.addListenerToFirer(firer, value, namespace);
        });
    };
    
    function initEvents(that, events, pass) {
        fluid.each(events, function (eventSpec, eventKey) { 
            var isIoCEvent = eventSpec && (typeof (eventSpec) !== "string" || eventSpec.charAt(0) === "{");
            var event;
            if (isIoCEvent && pass === "IoC") {
                if (!fluid.event.resolveEvent) {
                    fluid.fail("fluid.event.resolveEvent could not be loaded - please include FluidIoC.js in order to operate IoC-driven event with descriptor ", 
                        eventSpec);
                } else {
                    event = fluid.event.resolveEvent(that, eventKey, eventSpec);
                }
            } else if (pass === "flat") {
                event = fluid.event.getEventFirer(eventSpec === "unicast", eventSpec === "preventable", fluid.event.nameEvent(that, eventKey));
            }
            if (event) {
                that.events[eventKey] = event;
            } 
        });
    }
    
    // unsupported, NON-API function
    fluid.instantiateFirers = function (that, options) {
        that.events = {};
        // TODO: manual 2-phase instantiation since we have no GINGER WORLD
        initEvents(that, options.events, "flat"); 
        initEvents(that, options.events, "IoC");
        // TODO: manually expand these late so that members attached to ourselves with preInitFunction can be detected
        //var listeners = fluid.expandOptions ? fluid.expandOptions(options.listeners, that) : options.listeners;
        fluid.mergeListeners(that, that.events, options.listeners);
    };
    
    fluid.mergeListenersPolicy = function (target, source) {
        var togo = target || {};
        fluid.each(source, function (listeners, key) {
            togo[key] = fluid.makeArray(source[key]).concat(fluid.makeArray(listeners));
        });
        return togo;
    };
    
    /*** DEFAULTS AND OPTIONS MERGING SYSTEM ***/
    
    var defaultsStore = {};
        
    var resolveGradesImpl = function (gs, gradeNames) {
        gradeNames = fluid.makeArray(gradeNames);
        fluid.each(gradeNames, function (gradeName) {
            var options = fluid.rawDefaults(gradeName) || {};
            gs.gradeHash[gradeName] = true;
            gs.gradeChain.push(gradeName);
            gs.optionsChain.push(options);
            fluid.each(options.gradeNames, function (parent) {
                if (!gs.gradeHash[parent]) {
                    resolveGradesImpl(gs, parent);
                }
            });
        });
        return gs;
    };
    
    // unsupported, NON-API function
    fluid.resolveGradeStructure = function (gradeNames) {
        var gradeStruct = {
            gradeChain: [],
            gradeHash: {},
            optionsChain: []
        };
        return resolveGradesImpl(gradeStruct, gradeNames);
    };
    
    fluid.lifecycleFunctions = {
        preInitFunction: true,
        postInitFunction: true,
        finalInitFunction: true
    };
    
    // unsupported, NON-API function
    fluid.mergeLifecycleFunction = function (target, source) {
        fluid.event.addListenerToFirer(target, source);
        return target;
    };
    
    fluid.rootMergePolicy = fluid.transform(fluid.lifecycleFunctions, function () {
        return fluid.mergeLifecycleFunction;
    });
        
    // unsupported, NON-API function
    fluid.makeLifecycleFirers = function () {
        return fluid.transform(fluid.lifecycleFunctions, function (value, key) {
            return fluid.event.getEventFirer(null, null, key);
        });
    };
    
    // unsupported, NON-API function
    fluid.resolveGrade = function (defaults, gradeNames) {
        var mergeArgs = [defaults];
        if (gradeNames) {
            var gradeStruct = fluid.resolveGradeStructure(gradeNames);
            mergeArgs = gradeStruct.optionsChain.reverse().concat(mergeArgs).concat({gradeNames: gradeStruct.gradeChain});
        }
        mergeArgs = [fluid.rootMergePolicy, fluid.makeLifecycleFirers()].concat(mergeArgs);
        var mergedDefaults = fluid.merge.apply(null, mergeArgs);
        return mergedDefaults;  
    };

    // unsupported, NON-API function
    fluid.resolveGradedOptions = function (componentName) {
        var defaults = fluid.rawDefaults(componentName);
        if (!defaults) {
            return defaults;
        } else {
            return fluid.resolveGrade(defaults, defaults.gradeNames);
        }
    };
    
    // unsupported, NON-API function
    fluid.rawDefaults = function (componentName, options) {
        if (options === undefined) {
            return defaultsStore[componentName];
        } else {
            defaultsStore[componentName] = options;
        }
    };
    
        
    fluid.hasGrade = function (options, gradeName) {
        return !options || !options.gradeNames ? false : fluid.contains(options.gradeNames, gradeName);
    };
    
     /**
     * Retrieves and stores a component's default settings centrally.
     * @param {boolean} (options) if true, manipulate a global option (for the head
     *   component) rather than instance options. NB - the use of "global options" 
     *   is deprecated and will be removed from the framework in release 1.5 
     * @param {String} componentName the name of the component
     * @param {Object} (optional) an container of key/value pairs to set
     */
     
    fluid.defaults = function () {
        var offset = 0;
        if (typeof arguments[0] === "boolean") {
            offset = 1;
        }
        var componentName = (offset === 0 ? "" : "*.global-") + arguments[offset];
        var options = arguments[offset + 1];
        if (options === undefined) {
            return fluid.resolveGradedOptions(componentName);
        } else {
            if (options && options.options) {
                fluid.fail("Probable error in options structure with option named \"options\" - perhaps you meant to write these options at top level in fluid.defaults?");  
            }
            fluid.rawDefaults(componentName, options);
            if (fluid.hasGrade(options, "autoInit")) {
                fluid.makeComponent(componentName, fluid.resolveGradedOptions(componentName));
            }
        }
    };
    
    fluid.makeComponent = function (componentName, options) {
        if (!options.initFunction || !options.gradeNames) {
            fluid.fail("Cannot autoInit component " + componentName + " which does not have an initFunction and gradeName defined");
        }
        var creator = function () {
            return fluid.initComponent(componentName, arguments);
        };
        var existing = fluid.getGlobalValue(componentName);
        if (existing) {
            $.extend(creator, existing);
        }
        fluid.setGlobalValue(componentName, creator);
    };
        
    fluid.makeComponents = function (components, env) {
        fluid.each(components, function (value, key) {
            var options = {
                gradeNames: fluid.makeArray(value).concat(["autoInit"])
            };
            fluid.defaults(key, options);
        });
    };
    
    // The base system grade definitions
    
    fluid.defaults("fluid.littleComponent", {
        initFunction: "fluid.initLittleComponent",
        argumentMap: {
            options: 0
        }
    });
    
    fluid.defaults("fluid.eventedComponent", {
        gradeNames: ["fluid.littleComponent"],
        mergePolicy: {
            listeners: "fluid.mergeListenersPolicy"
        }
    });
    
        
    fluid.preInitModelComponent = function (that) {
        that.model = that.options.model || {};
        that.applier = that.options.applier || fluid.makeChangeApplier(that.model, that.options.changeApplierOptions);
    };
    
    fluid.defaults("fluid.modelComponent", {
        gradeNames: ["fluid.littleComponent"],
        preInitFunction: {
            namespace: "preInitModelComponent",
            listener: "fluid.preInitModelComponent"
        },
        mergePolicy: {
            model: "preserve",
            applier: "nomerge"
        }
    });
    
    fluid.defaults("fluid.viewComponent", {
        gradeNames: ["fluid.littleComponent", "fluid.modelComponent", "fluid.eventedComponent"],
        initFunction: "fluid.initView",
        argumentMap: {
            container: 0,
            options: 1
        }
    });

    /** Generate a name for a component for debugging purposes */    
    fluid.nameComponent = function (that) {
        return that? "component with typename " + that.typeName + " and id " + that.id : "[unknown component]"
    };
    
    // unsupported, NON-API function
    fluid.guardCircularity = function (seenIds, source, message1, message2) {
        if (source && source.id) {
            if (!seenIds[source.id]) {
                seenIds[source.id] = source;
            } else if (seenIds[source.id] === source) {
                fluid.fail("Circularity in options " + message1 + " - " + fluid.nameComponent(source)
                    + " has already been seen" + message2);  
            }
        }      
    };
                
    fluid.mergePolicyIs = function (policy, test) {
        return typeof (policy) === "string" && $.inArray(test, policy.split(/\s*,\s*/)) !== -1;
    };
    
    function mergeImpl(policy, basePath, target, source, thisPolicy, rec) {
        if (typeof (thisPolicy) === "function") {
            thisPolicy.call(null, target, source);
            return target;
        }
        if (fluid.mergePolicyIs(thisPolicy, "replace")) {
            fluid.clear(target);
        }
        fluid.guardCircularity(rec.seenIds, source, "merging", " when evaluating path " + basePath + " - please protect components from merging using the \"nomerge\" merge policy");
      
        for (var name in source) {
            var path = (basePath ? basePath + "." : "") + name;
            var newPolicy = policy && typeof (policy) !== "string" ? policy[path] : policy;
            var thisTarget = target[name];
            var thisSource = source[name];
            var primitiveTarget = fluid.isPrimitive(thisTarget);
    
            if (thisSource !== undefined) {
                if (thisSource !== null && typeof (thisSource) === "object" &&
                        !fluid.isDOMNode(thisSource) && !thisSource.jquery && thisSource !== fluid.VALUE &&
                        !fluid.mergePolicyIs(newPolicy, "preserve") && !fluid.mergePolicyIs(newPolicy, "nomerge") && !fluid.mergePolicyIs(newPolicy, "noexpand")) {
                    if (primitiveTarget) {
                        target[name] = thisTarget = fluid.freshContainer(thisSource)
                    }
                    mergeImpl(policy, path, thisTarget, thisSource, newPolicy, rec);
                } else {
                    if (typeof (newPolicy) === "function") {
                        target[name] = newPolicy.call(null, thisTarget, thisSource, name);
                    } else if (!fluid.isValue(thisTarget) || !fluid.mergePolicyIs(newPolicy, "reverse")) {
                        // TODO: When "grades" are implemented, grandfather in any paired applier to perform these operations
                        // NB: mergePolicy of "preserve" now creates dependency on DataBinding.js
                        target[name] = fluid.isValue(thisTarget) && fluid.mergePolicyIs(newPolicy, "preserve") ? fluid.model.mergeModel(thisTarget, thisSource) : thisSource;
                    }
                }
            }
        }
        return target;
    }
    
    /** Merge a collection of options structures onto a target, following an optional policy.
     * This function is typically called automatically, as a result of an invocation of
     * <code>fluid.initLittleComponent</code>. The behaviour of this function is explained more fully on
     * the page http://wiki.fluidproject.org/display/fluid/Options+Merging+for+Fluid+Components .
     * @param policy {Object/String} A "policy object" specifiying the type of merge to be performed.
     * If policy is of type {String} it should take on the value "reverse" or "replace" representing
     * a static policy. If it is an
     * Object, it should contain a mapping of EL paths onto these String values, representing a
     * fine-grained policy. If it is an Object, the values may also themselves be EL paths 
     * representing that a default value is to be taken from that path.
     * @param target {Object} The options structure which is to be modified by receiving the merge results.
     * @param options1, options2, .... {Object} an arbitrary list of options structure which are to
     * be merged "on top of" the <code>target</code>. These will not be modified.    
     */
    
    fluid.merge = function (policy, target) {
        var path = "";
        
        for (var i = 2; i < arguments.length; ++i) {
            var source = arguments[i];
            if (source !== null && source !== undefined) {
                mergeImpl(policy, path, target, source, policy ? policy[""] : null, {seenIds: {}});
            }
        }
        if (policy && typeof (policy) !== "string") {
            for (var key in policy) {
                var elrh = policy[key];
                if (typeof (elrh) === "string" && elrh !== "replace" && elrh !== "preserve") {
                    var oldValue = fluid.get(target, key);
                    if (oldValue === null || oldValue === undefined) {
                        var value = fluid.get(target, elrh);
                        fluid.set(target, key, value);
                    }
                }
            }
        }
        return target;     
    };

    // unsupported, NON-API function
    fluid.transformOptions = function (mergeArgs, transRec) {
        fluid.expect("Options transformation record", ["transformer", "config"], transRec);
        var transFunc = fluid.getGlobalValue(transRec.transformer);
        var togo = fluid.transform(mergeArgs, function (value, key) {
            return key === 0 ? value : transFunc.call(null, value, transRec.config);
        });
        return togo;
    };
    
    // unsupporter, NON-API function
    fluid.lastTransformationRecord = function (extraArgs) {
        for (var i = extraArgs.length - 1; i >= 0; --i) {
            if (extraArgs[i] && extraArgs[i].transformOptions) {
                return extraArgs[i].transformOptions;
            } 
        }
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
    // unsupported, NON-API function
    fluid.mergeComponentOptions = function (that, componentName, userOptions, localOptions) {
        var defaults = fluid.defaults(componentName);
        var mergePolicy = $.extend({}, fluid.rootMergePolicy, defaults ? defaults.mergePolicy : {});
        var defaultGrades = defaults && defaults.gradeNames;
        var mergeArgs;
        if (!defaultGrades) {
            defaults = fluid.censorKeys(defaults, fluid.keys(fluid.lifecycleFunctions));
            mergeArgs = [mergePolicy, localOptions];
        } else {
            mergeArgs = [mergePolicy];
        }
        var extraArgs;
        if (fluid.expandComponentOptions) {
            extraArgs = fluid.expandComponentOptions(defaults, userOptions, that);
        } else {
            extraArgs = [defaults, userOptions];
        }
        var transRec = fluid.lastTransformationRecord(extraArgs);
        if (transRec) {
            extraArgs = fluid.transformOptions(extraArgs, transRec);
        }
        mergeArgs = mergeArgs.concat(extraArgs);
        that.options = fluid.merge.apply(null, mergeArgs);
    };
    
    // The Fluid Component System proper   
            
    /** A special "marker object" which is recognised as one of the arguments to 
     * fluid.initSubcomponents. This object is recognised by reference equality - 
     * where it is found, it is replaced in the actual argument position supplied
     * to the specific subcomponent instance, with the particular options block
     * for that instance attached to the overall "that" object.
     * NOTE: The use of this marker has been deprecated as of the Fluid 1.4 release in 
     * favour of the contextual EL path "{options}" - it will be removed in a future
     * release of the framework.
     */
    fluid.COMPONENT_OPTIONS = {type: "fluid.marker", value: "COMPONENT_OPTIONS"};
    
    /** Construct a dummy or "placeholder" subcomponent, that optionally provides empty
     * implementations for a set of methods.
     */
    fluid.emptySubcomponent = function (options) {
        var that = {};
        options = $.makeArray(options);
        var empty = function () {};
        for (var i = 0; i < options.length; ++i) {
            that[options[i]] = empty;
        }
        return that;
    };
    
    /** Compute a "nickname" given a fully qualified typename, by returning the last path
     * segment.
     */
    
    fluid.computeNickName = function (typeName) {
        var segs = fluid.model.parseEL(typeName);
        return segs[segs.length - 1];
    };
        
    /** Create a "type tag" component with no state but simply a type name and id. The most 
     *  minimal form of Fluid component */
       
    fluid.typeTag = function (name) {
        return name ? {
            typeName: name,
            id: fluid.allocateGuid()
        } : null;
    };
    
    /** A combined "component and grade name" which allows type tags to be declaratively constructed
     * from options material */
    
    fluid.typeFount = function (options) {
        var that = fluid.initLittleComponent("fluid.typeFount", options);
        return fluid.typeTag(that.options.targetTypeName);
    };
    
    /**
     * Creates a new "little component": a that-ist object with options merged into it by the framework.
     * This method is a convenience for creating small objects that have options but don't require full
     * View-like features such as the DOM Binder or events
     * 
     * @param {Object} name the name of the little component to create
     * @param {Object} options user-supplied options to merge with the defaults
     */
    // NOTE: the 3rd argument localOptions is NOT to be advertised as part of the stable API, it is present
    // just to allow backward compatibility whilst grade specifications are not mandatory
    fluid.initLittleComponent = function (name, options, localOptions) {
        var that = fluid.typeTag(name);
        // TODO: nickName must be available earlier than other merged options so that component may resolve to itself
        that.nickName = options && options.nickName ? options.nickName : fluid.computeNickName(that.typeName);
        localOptions = localOptions || {gradeNames: "fluid.littleComponent"};
        localOptions = fluid.resolveGrade({}, localOptions.gradeNames);
        
        fluid.mergeComponentOptions(that, name, options, localOptions);
        that.options.preInitFunction.fire(that);

        if (fluid.hasGrade(that.options, "fluid.eventedComponent")) {
            fluid.instantiateFirers(that, that.options);
        }
        if (!fluid.hasGrade(that.options, "autoInit")) {
            fluid.clearLifecycleFunctions(that.options);
        }
        return that;
    };
    
    fluid.clearLifecycleFunctions = function (options) {
        fluid.each(fluid.lifecycleFunctions, function (value, key) {
            delete options[key];
        });
        delete options.initFunction; 
    };
    
    // unsupported, NON-API function
    // NOTE: this function represents a temporary strategy until we have more integrated IoC debugging.
    // It preserves the current framework behaviour for the 1.4 release, but provides a more informative
    // diagnostic - in fact, it is perfectly acceptable for a component's creator to return no value and
    // the failure is really in assumptions in fluid.initComponent. Revisit this issue for 1.5
    fluid.diagnoseFailedView = function(componentName, that, options, args) {
        if (!that && fluid.hasGrade(options, "fluid.viewComponent")) {
            var container = fluid.wrap(args[1]);
            var message1 = "Instantiation of autoInit component with type " + componentName + " failed, since "
            if (container.length === 0) {
                fluid.fail(message1 + "selector \"", args[1], "\" did not match any markup in the document");
            }
            else {
                fluid.fail(message1 + " component creator function did not return a value");
            }  
        }  
    };
    
    fluid.initComponent = function (componentName, initArgs) {
        var options = fluid.defaults(componentName);
        if (!options.gradeNames) {
            fluid.fail("Cannot initialise component " + componentName + " which has no gradeName registered");
        }
        var args = [componentName].concat(fluid.makeArray(initArgs)); // TODO: support different initFunction variants
        var that = fluid.invokeGlobalFunction(options.initFunction, args);
        fluid.diagnoseFailedView(componentName, that, options, args);
        that.options.postInitFunction.fire(that);
        if (fluid.initDependents) {
            fluid.initDependents(that);
        }
        that.options.finalInitFunction.fire(that);
        fluid.clearLifecycleFunctions(that.options);
        return that.options.returnedPath ? fluid.get(that, that.options.returnedPath) : that;
    };

    // unsupported, NON-API function
    fluid.initSubcomponentImpl = function (that, entry, args) {
        var togo;
        if (typeof (entry) !== "function") {
            var entryType = typeof (entry) === "string" ? entry : entry.type;
            var globDef = fluid.defaults(true, entryType);
            fluid.merge("reverse", that.options, globDef);
            togo = entryType === "fluid.emptySubcomponent" ?
                fluid.emptySubcomponent(entry.options) : 
                fluid.invokeGlobalFunction(entryType, args);
        } else {
            togo = entry.apply(null, args);
        }

        var returnedOptions = togo ? togo.returnedOptions : null;
        if (returnedOptions) {
            fluid.merge(that.options.mergePolicy, that.options, returnedOptions);
            if (returnedOptions.listeners) {
                fluid.mergeListeners(that, that.events, returnedOptions.listeners);
            }
        }
        return togo;
    };
    
    /** Initialise all the "subcomponents" which are configured to be attached to 
     * the supplied top-level component, which share a particular "class name".
     * @param {Component} that The top-level component for which sub-components are
     * to be instantiated. It contains specifications for these subcomponents in its
     * <code>options</code> structure.
     * @param {String} className The "class name" or "category" for the subcomponents to
     * be instantiated. A class name specifies an overall "function" for a class of 
     * subcomponents and represents a category which accept the same signature of
     * instantiation arguments.
     * @param {Array of Object} args The instantiation arguments to be passed to each 
     * constructed subcomponent. These will typically be members derived from the
     * top-level <code>that</code> or perhaps globally discovered from elsewhere. One
     * of these arguments may be <code>fluid.COMPONENT_OPTIONS</code> in which case this
     * placeholder argument will be replaced by instance-specific options configured
     * into the member of the top-level <code>options</code> structure named for the
     * <code>className</code>
     * @return {Array of Object} The instantiated subcomponents, one for each member
     * of <code>that.options[className]</code>.
     */
    
    fluid.initSubcomponents = function (that, className, args) {
        var entry = that.options[className];
        if (!entry) {
            return;
        }
        var entries = $.makeArray(entry);
        var optindex = -1;
        var togo = [];
        args = $.makeArray(args);
        for (var i = 0; i < args.length; ++i) {
            if (args[i] === fluid.COMPONENT_OPTIONS) {
                optindex = i;
            }
        }
        for (i = 0; i < entries.length; ++i) {
            entry = entries[i];
            if (optindex !== -1) {
                args[optindex] = entry.options;
            }
            togo[i] = fluid.initSubcomponentImpl(that, entry, args);
        }
        return togo;
    };
        
    fluid.initSubcomponent = function (that, className, args) {
        return fluid.initSubcomponents(that, className, args)[0];
    };


  // **** VIEW-DEPENDENT DEFINITIONS BELOW HERE

    fluid.checkTryCatchParameter = function () {
        var location = window.location || { search: "", protocol: "file:" };
        var GETParams = location.search.slice(1).split('&');
        return fluid.contains(GETParams, "notrycatch");
    };
    
    fluid.notrycatch = fluid.checkTryCatchParameter();

   
    /**
     * Wraps an object in a jQuery if it isn't already one. This function is useful since
     * it ensures to wrap a null or otherwise falsy argument to itself, rather than the
     * often unhelpful jQuery default of returning the overall document node.
     * 
     * @param {Object} obj the object to wrap in a jQuery
     * @param {jQuery} userJQuery the jQuery object to use for the wrapping, optional - use the current jQuery if absent
     */
    fluid.wrap = function (obj, userJQuery) {
        userJQuery = userJQuery || $;
        return ((!obj || obj.jquery) ? obj : userJQuery(obj)); 
    };
    
    /**
     * If obj is a jQuery, this function will return the first DOM element within it.
     * 
     * @param {jQuery} obj the jQuery instance to unwrap into a pure DOM element
     */
    fluid.unwrap = function (obj) {
        return obj && obj.jquery && obj.length === 1 ? obj[0] : obj; // Unwrap the element if it's a jQuery.
    };
    
    /**
     * Fetches a single container element and returns it as a jQuery.
     * 
     * @param {String||jQuery||element} containerSpec an id string, a single-element jQuery, or a DOM element specifying a unique container
     * @param {Boolean} fallible <code>true</code> if an empty container is to be reported as a valid condition
     * @return a single-element jQuery of container
     */
    fluid.container = function (containerSpec, fallible, userJQuery) {
        if (userJQuery) {
            containerSpec = fluid.unwrap(containerSpec);
        }
        var container = fluid.wrap(containerSpec, userJQuery);
        if (fallible && (!container || container.length === 0)) {
            return null;
        }
        
        // Throw an exception if we've got more or less than one element.
        if (!container || !container.jquery || container.length !== 1) {
            if (typeof (containerSpec) !== "string") {
                containerSpec = container.selector;
            }
            var count = container.length !== undefined ? container.length : 0;
            fluid.fail((count > 1 ? "More than one (" + count + ") container elements were"
                    : "No container element was") + " found for selector " + containerSpec);
        }
        if (!fluid.isDOMNode(container[0])) {
            fluid.fail("fluid.container was supplied a non-jQueryable element");  
        }
        
        return container;
    };
    
    /**
     * Creates a new DOM Binder instance, used to locate elements in the DOM by name.
     * 
     * @param {Object} container the root element in which to locate named elements
     * @param {Object} selectors a collection of named jQuery selectors
     */
    fluid.createDomBinder = function (container, selectors) {
        var cache = {}, that = {};
        var userJQuery = container.constructor;
        
        function cacheKey(name, thisContainer) {
            return fluid.allocateSimpleId(thisContainer) + "-" + name;
        }

        function record(name, thisContainer, result) {
            cache[cacheKey(name, thisContainer)] = result;
        }

        that.locate = function (name, localContainer) {
            var selector, thisContainer, togo;
            
            selector = selectors[name];
            thisContainer = localContainer ? localContainer : container;
            if (!thisContainer) {
                fluid.fail("DOM binder invoked for selector " + name + " without container");
            }

            if (!selector) {
                return thisContainer;
            }

            if (typeof (selector) === "function") {
                togo = userJQuery(selector.call(null, fluid.unwrap(thisContainer)));
            } else {
                togo = userJQuery(selector, thisContainer);
            }
            if (togo.get(0) === document) {
                togo = [];
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
            var togo = cache[key];
            return togo ? togo : that.locate(name, localContainer);
        };
        that.clear = function () {
            cache = {};
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
    
    /** Expect that jQuery selector query has resulted in a non-empty set of 
     * results. If none are found, this function will fail with a diagnostic message, 
     * with the supplied message prepended.
     */
    fluid.expectFilledSelector = function (result, message) {
        if (result && result.length === 0 && result.jquery) {
            fluid.fail(message + ": selector \"" + result.selector + "\" with name " + result.selectorName +
                       " returned no results in context " + fluid.dumpEl(result.context));
        }
    };
    
    /** 
     * The central initialiation method called as the first act of every Fluid
     * component. This function automatically merges user options with defaults,
     * attaches a DOM Binder to the instance, and configures events.
     * 
     * @param {String} componentName The unique "name" of the component, which will be used
     * to fetch the default options from store. By recommendation, this should be the global
     * name of the component's creator function.
     * @param {jQueryable} container A specifier for the single root "container node" in the
     * DOM which will house all the markup for this component.
     * @param {Object} userOptions The configuration options for this component.
     */
     // 4th argument is NOT SUPPORTED, see comments for initLittleComponent
    fluid.initView = function (componentName, containerSpec, userOptions, localOptions) {
        fluid.expectFilledSelector(container, "Error instantiating component with name \"" + componentName);
        var container = fluid.container(containerSpec, true);
        if (!container) {
            return null;
        }
        var that = fluid.initLittleComponent(componentName, userOptions, localOptions || {gradeNames: ["fluid.viewComponent"]});
        var userJQuery = that.options.jQuery; // Do it a second time to correct for jQuery injection
        if (userJQuery) {
            container = fluid.container(containerSpec, true, userJQuery);
        }
        fluid.log("Constructing view component " + componentName + " with container " + container.constructor.expando + 
            (userJQuery? " user jQuery " + userJQuery.expando: "") + " env: " + $.expando);
        that.container = container;
        fluid.initDomBinder(that);

        return that;
    };
    
    /**
     * Creates a new DOM Binder instance for the specified component and mixes it in.
     * 
     * @param {Object} that the component instance to attach the new DOM Binder to
     */
    fluid.initDomBinder = function (that) {
        that.dom = fluid.createDomBinder(that.container, that.options.selectors);
        that.locate = that.dom.locate;      
    };

    // DOM Utilities.
    
    /**
     * Finds the nearest ancestor of the element that passes the test
     * @param {Element} element DOM element
     * @param {Function} test A function which takes an element as a parameter and return true or false for some test
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
    
    /**
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
     * @param {Object} id the id of the DOM node to find
     * @param {Document} dokkument the document in which it is to be found (if left empty, use the current document)
     * @return The DOM element with this id, or null, if none exists in the document.
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
     * Returns the id attribute from a jQuery or pure DOM element.
     * 
     * @param {jQuery||Element} element the element to return the id attribute for
     */
    fluid.getId = function (element) {
        return fluid.unwrap(element).id;
    };
    
    /** 
     * Allocate an id to the supplied element if it has none already, by a simple
     * scheme resulting in ids "fluid-id-nnnn" where nnnn is an increasing integer.
     */
    
    fluid.allocateSimpleId = function (element) {
        var simpleId = "fluid-id-" + fluid.allocateGuid();
        if (!element) {
            return simpleId;
        }
        element = fluid.unwrap(element);
        if (!element.id) {
            element.id = simpleId;
        }
        return element.id;
    };
    

    // Message resolution and templating
   
   
    /**
    * Converts a string to a regexp with the specified flags given in parameters
    * @param {String} a string that has to be turned into a regular expression
    * @param {String} the flags to provide to the reg exp 
    */
    fluid.stringToRegExp = function (str, flags) {
        return new RegExp(str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), flags);
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
    fluid.stringTemplate = function (template, values) {
        var newString = template;
        for (var key in values) {
            var re = fluid.stringToRegExp("%" + key, "g");
            newString = newString.replace(re, values[key]);
        }
        return newString;
    };
    

    fluid.messageResolver = function (options) {
        var that = fluid.initLittleComponent("fluid.messageResolver", options);
        that.messageBase = that.options.parseFunc(that.options.messageBase);
        
        that.lookup = function (messagecodes) {
            var resolved = fluid.messageResolver.resolveOne(that.messageBase, messagecodes);
            if (resolved === undefined) {
                return fluid.find(that.options.parents, function (parent) {
                    return parent.lookup(messagecodes);
                });
            } else {
                return {template: resolved, resolveFunc: that.options.resolveFunc};
            }
        };
        that.resolve = function (messagecodes, args) {
            if (!messagecodes) {
                return "[No messagecodes provided]";
            }
            messagecodes = fluid.makeArray(messagecodes);
            var looked = that.lookup(messagecodes);
            return looked ? looked.resolveFunc(looked.template, args) :
                "[Message string for key " + messagecodes[0] + " not found]";
        };
        
        return that;  
    };
    
    fluid.defaults("fluid.messageResolver", {
        mergePolicy: {
            messageBase: "preserve"  
        },
        resolveFunc: fluid.stringTemplate,
        parseFunc: fluid.identity,
        messageBase: {},
        parents: []
    });
    
    fluid.messageResolver.resolveOne = function (messageBase, messagecodes) {
        for (var i = 0; i < messagecodes.length; ++i) {
            var code = messagecodes[i];
            var message = messageBase[code];
            if (message !== undefined) {
                return message;
            }
        }
    };
          
    /** Converts a data structure consisting of a mapping of keys to message strings,
     * into a "messageLocator" function which maps an array of message codes, to be 
     * tried in sequence until a key is found, and an array of substitution arguments,
     * into a substituted message string.
     */
    fluid.messageLocator = function (messageBase, resolveFunc) {
        var resolver = fluid.messageResolver({messageBase: messageBase, resolveFunc: resolveFunc});
        return function (messagecodes, args) {
            return resolver.resolve(messagecodes, args);
        };
    };

})(jQuery, fluid_1_5);
