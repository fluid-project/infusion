/*!
 * Fluid Infusion v1.3
 *
 * Infusion is distributed under the Educational Community License 2.0 and new BSD licenses: 
 * http://wiki.fluidproject.org/display/fluid/Fluid+Licensing
 *
 * For information on copyright, see the individual Infusion source code files: 
 * https://source.fluidproject.org/svn/fluid/infusion/
 */

/*
Copyright 2007-2010 University of Cambridge
Copyright 2007-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, YAHOO, opera, window, console*/

var fluid_1_3 = fluid_1_3 || {};
var fluid = fluid || fluid_1_3;

(function ($, fluid) {
    
    fluid.version = "Infusion 1.3";
    
    fluid.environment = {
        fluid: fluid
    };
    var globalObject = window || {};
    
    /**
     * Causes an error message to be logged to the console and a real runtime error to be thrown.
     * 
     * @param {String|Error} message the error message to log
     */
    fluid.fail = function (message) {
        fluid.setLogging(true);
        fluid.log(message.message ? message.message : message);
        //throw new Error(message);
        message.fail(); // Intentionally cause a browser error by invoking a nonexistent function.
    };
    
    // Logging
    var logging;
    /** method to allow user to enable logging (off by default) */
    fluid.setLogging = function (enabled) {
        if (typeof enabled === "boolean") {
            logging = enabled;
        } else {
            logging = false;
        }
    };

    /** Log a message to a suitable environmental console. If the standard "console" 
     * stream is available, the message will be sent there - otherwise either the
     * YAHOO logger or the Opera "postError" stream will be used. Logging must first
     * be enabled with a call fo the fluid.setLogging(true) function.
     */
    fluid.log = function (str) {
        if (logging) {
            str = fluid.renderTimestamp(new Date()) + ":  " + str;
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
    
    /**
     * Wraps an object in a jQuery if it isn't already one. This function is useful since
     * it ensures to wrap a null or otherwise falsy argument to itself, rather than the
     * often unhelpful jQuery default of returning the overall document node.
     * 
     * @param {Object} obj the object to wrap in a jQuery
     */
    fluid.wrap = function (obj) {
        return ((!obj || obj.jquery) ? obj : $(obj)); 
    };
    
    /**
     * If obj is a jQuery, this function will return the first DOM element within it.
     * 
     * @param {jQuery} obj the jQuery instance to unwrap into a pure DOM element
     */
    fluid.unwrap = function (obj) {
        return obj && obj.jquery && obj.length === 1 ? obj[0] : obj; // Unwrap the element if it's a jQuery.
    };
    
    // Functional programming utilities.
            
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
    
    /** A basic utility that returns its argument unchanged */
    
    fluid.identity = function (arg) {
        return arg;
    };
    
    // Framework and instantiation functions.

    
    /** Returns true if the argument is a primitive type **/
    fluid.isPrimitive = function (value) {
        var valueType = typeof(value);
        return !value || valueType === "string" || valueType === "boolean" || valueType === "number" || valueType === "function";
    };
    
    fluid.isDOMNode = function (obj) {
      // This could be more sound, but messy: 
      // http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
        return obj && typeof(obj.nodeType) === "number";  
    };
    
    /** Determines whether the supplied object can be treated as an array, by 
     * iterating an index towards its length. The test functions by detecting
     * a property named "length" which is of type "number", but excluding objects
     * which are themselves of primitive types (in particular functions and strings)
     */
    fluid.isArrayable = function (totest) {
        return totest && !fluid.isPrimitive(totest) && typeof(totest.length) === "number";
    };
    
            
    /** Corrected version of jQuery makearray that returns an empty array on undefined rather than crashing **/
    fluid.makeArray = function (arg) {
        if (arg === null || arg === undefined) {
            return [];
        }
        else {
            return $.makeArray(arg);
        }
    };
    
    function transformInternal(source, togo, key, args) {
        var transit = source[key];
        for (var j = 0; j < args.length - 1; ++ j) {
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
            for (var i = 0; i < source.length; ++ i) {
                transformInternal(source, togo, i, arguments);
            }
        }
        else {
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
            for (var i = 0; i < source.length; ++ i) {
                func(source[i], i);
            }
        }
        else {
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
            for (var i = 0; i < source.length; ++ i) {
                disp = func(source[i], i);
                if (disp !== undefined) {
                    return disp;
                }
            }
        }
        else {
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
        for (var i = 0; i < list.length; ++ i) {
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
        }
        else {
            for (var key in source) {
                if (fn(source[key], key)) {
                    delete source[key];
                }
            }
        }
        return source;
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
    
    /** 
     * Clears an object or array of its contents. For objects, each property is deleted.
     * 
     * @param {Object|Array} target the target to be cleared
     */
    fluid.clear = function (target) {
        if (target instanceof Array) {
            target.length = 0;
        }
        else {
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
    
    /** Determine whether an object is any marker, or a particular marker - omit the
     * 2nd argument to detect any marker
     */
    fluid.isMarker = function (totest, type) {
        if (!totest || typeof(totest) !== 'object' || totest.type !== "fluid.marker") {
            return false;
        }
        if (!type) {
            return true;
        }
        return totest.value === type || totest.value === type.value;
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
    fluid.model.parseEL = function(EL) {
        return EL === ""? [] : String(EL).split('.');
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

    /** Standard strategies for resolving path segments **/
    fluid.model.environmentStrategy = function(initEnvironment) {
        return {
            init: function() {
                var environment = initEnvironment;
                return function(root, segment, index) {
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
        return segment === ""? root : root[segment];
    };
        
    fluid.model.funcResolverStrategy = function (root, segment) {
        if (root.resolvePathSegment) {
            return root.resolvePathSegment(segment);
        }
    };
    
    // unsupported, NON-API function
    fluid.model.applyStrategy = function(strategy, root, segment, index) {
        if (typeof(strategy) === "function") { 
            return strategy(root, segment, index);
        }
        else if (strategy && strategy.next) {
            return strategy.next(root, segment, index);
        }
    };
    
    fluid.model.initStrategy = function(baseStrategy, index, oldStrategies) {
        return baseStrategy.init? baseStrategy.init(oldStrategies? oldStrategies[index] : undefined) : baseStrategy;
    };
    
    // unsupported, NON-API function
    fluid.model.makeTrundler = function(root, config, oldStrategies) {
        var that = {
            root: root,
            strategies: fluid.isArrayable(config)? config : 
                fluid.transform(config.strategies, function (strategy, index) {
                    return fluid.model.initStrategy(strategy, index, oldStrategies); 
            })
        };
        that.trundle = function(EL, uncess) {
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
            for (var i = 0; i < that.strategies.length; ++ i) {
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
            for (var i = 0; i < limit; ++ i) {
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
    fluid.model.trundleImpl = function(trundler, EL, config, uncess) {
        if (typeof(EL) === "string") {
            trundler = trundler.trundle(EL, uncess);
        }
        else {
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
    fluid.model.trundle = function(root, EL, config, uncess) {
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
    
    fluid.registerNamespace("fluid.event");
    
    fluid.event.addListenerToFirer = function (firer, value, namespace) {
        if (typeof(value) === "function") {
            firer.addListener(value, namespace);
        }
        else if (value && typeof(value) === "object") {
            firer.addListener(value.listener, namespace, value.predicate, value.priority);
        }
    };
    /**
     * Attaches the user's listeners to a set of events.
     * 
     * @param {Object} events a collection of named event firers
     * @param {Object} listeners optional listeners to add
     */
    fluid.mergeListeners = function (events, listeners) {
        fluid.each(listeners, function (value, key) {
            var keydot = key.indexOf(".");
            var namespace;
            if (keydot !== -1) {
                namespace = key.substring(keydot + 1);
                key = key.substring(0, keydot);
            }
            if (!events[key]) {
                events[key] = fluid.event.getEventFirer();
            }
            var firer = events[key];
            if (fluid.isArrayable(value)) {
                for (var i = 0; i < value.length; ++ i) {
                    fluid.event.addListenerToFirer(firer, value[i], namespace); 
                }
            }
            else {
                fluid.event.addListenerToFirer(firer, value, namespace);
            } 
        });
    };
    
    /**
     * Sets up a component's declared events.
     * Events are specified in the options object by name. There are three different types of events that can be
     * specified: 
     * 1. an ordinary multicast event, specified by "null". 
     * 2. a unicast event, which allows only one listener to be registered
     * 3. a preventable event
     * 
     * @param {Object} that the component
     * @param {Object} options the component's options structure, containing the declared event names and types
     */
    fluid.instantiateFirers = function (that, options) {
        that.events = {};
        if (options.events) {
            for (var event in options.events) {
                var eventType = options.events[event];
                that.events[event] = fluid.event.getEventFirer(eventType === "unicast", eventType === "preventable");
            }
        }
        fluid.mergeListeners(that.events, options.listeners);
    };
    
        
    // stubs for two functions in FluidDebugging.js
    fluid.dumpEl = fluid.identity;
    fluid.renderTimestamp = fluid.identity;
    
    /*** DEFAULTS AND OPTIONS MERGING SYSTEM ***/
    
    var defaultsStore = {};
        
    var resolveGradesImpl = function(gs, gradeNames) {
        gradeNames = fluid.makeArray(gradeNames);
        fluid.each(gradeNames, function(gradeName) {
            var options = fluid.rawDefaults(gradeName);
            if (!options) {
                return;
            }
            gs.gradeHash[gradeName] = true;
            gs.gradeChain.push(gradeName);
            gs.optionsChain.push(options);
            fluid.each(options.gradeNames, function(parent) {
                if (!gs.gradeHash[parent]) {
                    resolveGradesImpl(gs, parent);
                }
            });
        });
        return gs;
    };
    
    fluid.resolveGrade = function(gradeNames) {
        var gradeStruct = {
            gradeChain: [],
            gradeHash: {},
            optionsChain:[]
        };
        return resolveGradesImpl(gradeStruct, gradeNames);
    };

    fluid.resolveGradedOptions = function(componentName) {
        var defaults = fluid.rawDefaults(componentName);
        if (!defaults) {
            return defaults;
        }
        var mergeArgs = [defaults];
        var gradeNames = defaults.gradeNames;
        if (gradeNames) {
            var gradeStruct = fluid.resolveGrade(gradeNames);
            mergeArgs = gradeStruct.optionsChain.reverse().concat(mergeArgs);
        }
        mergeArgs = [{}, {}].concat(mergeArgs);
        var mergedDefaults = fluid.merge.apply(null, mergeArgs);
        return mergedDefaults;
    };
    
    fluid.rawDefaults = function(componentName, options) {
        if (options === undefined) {
            return defaultsStore[componentName];
        }
        else {
            defaultsStore[componentName] = options;
        }
    };
    
     /**
     * Retreives and stores a component's default settings centrally.
     * @param {boolean} (options) if true, manipulate a global option (for the head
     *   component) rather than instance options. NB - the use of "global options" 
     *   is deprecated and will be removed from the framework in release 1.5 
     * @param {String} componentName the name of the component
     * @param {Object} (optional) an container of key/value pairs to set
     * 
     */
     
    fluid.defaults = function () {
        var offset = 0;
        if (typeof arguments[0] === "boolean") {
            offset = 1;
        }
        var componentName = (offset === 0? "" : "*.global-") + arguments[offset];
        var options = arguments[offset + 1];
        if (options === undefined) {
            return fluid.resolveGradedOptions(componentName);
        }
        else {
            fluid.rawDefaults(componentName, options);
            if (options && options.gradeNames && $.inArray("autoInit", options.gradeNames) !== -1) {
                fluid.makeComponent(componentName, fluid.resolveGradedOptions(componentName));
            }
        }
    };
    
    fluid.makeComponent = function(componentName, options) {
        if (!options.initFunction) {
            fluid.fail("Cannot autoInit component " + componentName + " which does not have an initFunction defined");
        }
        fluid.setGlobalValue(componentName, function() {
            return fluid.initComponent(componentName, arguments);
        });
    };
    
    fluid.defaults("fluid.littleComponent", {
        initFunction: "fluid.initLittleComponent",
        mergePolicy: {
            that: "preserve"
        },
        argumentMap: {
            options: 0
        }
    });
    
    fluid.defaults("fluid.modelComponent", {
        gradeNames: ["fluid.littleComponent"],
        postInitFunction: {
            postInitModelComponent: "fluid.postInitModelComponent"
        },
        mergePolicy: {
            model: "preserve",
            applier: "nomerge"
        }
    });
    
    fluid.defaults("fluid.viewComponent", {
        gradeNames: ["fluid.littleComponent", "fluid.modelComponent"],
        initFunction: "fluid.initView",
        argumentMap: {
            container: 0,
            options: 1
        }
    });
    
                
    fluid.mergePolicyIs = function (policy, test) {
        return typeof(policy) === "string" && $.inArray(test, policy.split(/\s*,\s*/)) !== -1;
    };
    
    function mergeImpl(policy, basePath, target, source, thisPolicy, rec) {
        if (typeof(thisPolicy) === "function") {
            thisPolicy.apply(null, target, source);
            return target;
        }
        if (fluid.mergePolicyIs(thisPolicy, "replace")) {
            fluid.clear(target);
        }
        if (source.id) {
            var seenIds = rec.seenIds;
            if (!seenIds[source.id]) {
                seenIds[source.id] = source;
            }
            else if (seenIds[source.id] === source) {
                fluid.fail("Circularity in options merging - component with typename " + source.typeName + " and id " + source.id 
                + " has already been seen when evaluating path " + basePath + " - please protect components from merging using the \"nomerge\" merge policy");  
            }
        }
      
        for (var name in source) {
            var path = (basePath ? basePath + ".": "") + name;
            var newPolicy = policy && typeof(policy) !== "string" ? policy[path] : policy;
            var thisTarget = target[name];
            var thisSource = source[name];
            var primitiveTarget = fluid.isPrimitive(thisTarget);
    
            if (thisSource !== undefined) {
                if (thisSource !== null && typeof thisSource === 'object' &&
                      !fluid.isDOMNode(thisSource) && !thisSource.jquery && thisSource !== fluid.VALUE &&
                       !fluid.mergePolicyIs(newPolicy, "preserve") && !fluid.mergePolicyIs(newPolicy, "nomerge") && !fluid.mergePolicyIs(newPolicy, "noexpand")) {
                    if (primitiveTarget) {
                        target[name] = thisTarget = thisSource instanceof Array ? [] : {};
                    }
                    mergeImpl(policy, path, thisTarget, thisSource, newPolicy, rec);
                }
                else {
                    if (typeof(newPolicy) === "function") {
                        newPolicy.call(null, target, source, name);
                    }
                    else if (thisTarget === null || thisTarget === undefined || !fluid.mergePolicyIs(newPolicy, "reverse")) {
                        // TODO: When "grades" are implemented, grandfather in any paired applier to perform these operations
                        // NB: mergePolicy of "preserve" now creates dependency on DataBinding.js
                        target[name] = fluid.mergePolicyIs(newPolicy, "preserve") ? fluid.model.mergeModel(thisTarget, thisSource) : thisSource;
                    }
                }
            }
        }
        return target;
    }
    
    /** Merge a collection of options structures onto a target, following an optional policy.
     * This function is typically called automatically, as a result of an invocation of
     * <code>fluid.initView</code>. The behaviour of this function is explained more fully on
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
        if (policy && typeof(policy) !== "string") {
            for (var key in policy) {
                var elrh = policy[key];
                if (typeof(elrh) === "string" && elrh !== "replace" && elrh !== "preserve") {
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
        if (fluid.expandOptions) {
            defaults = fluid.expandOptions(fluid.copy(defaults), that);
        }
        var mergePolicy = $.extend({}, defaults? defaults.mergePolicy : {});
        that.options = fluid.merge(mergePolicy, {}, defaults, userOptions);    
    };
    
        
    /** A special "marker object" which is recognised as one of the arguments to 
     * fluid.initSubcomponents. This object is recognised by reference equality - 
     * where it is found, it is replaced in the actual argument position supplied
     * to the specific subcomponent instance, with the particular options block
     * for that instance attached to the overall "that" object.
     */
    fluid.COMPONENT_OPTIONS = {type: "fluid.marker", value: "COMPONENT_OPTIONS"};
    
    /** Construct a dummy or "placeholder" subcomponent, that optionally provides empty
     * implementations for a set of methods.
     */
    fluid.emptySubcomponent = function (options) {
        var that = {};
        options = $.makeArray(options);
        var empty = function () {};
        for (var i = 0; i < options.length; ++ i) {
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
       
    fluid.typeTag = function(name) {
        return {
            typeName: name,
            id: fluid.allocateGuid()
        };
    };
    
    /**
     * Creates a new "little component": a that-ist object with options merged into it by the framework.
     * This method is a convenience for creating small objects that have options but don't require full
     * View-like features such as the DOM Binder or events
     * 
     * @param {Object} name the name of the little component to create
     * @param {Object} options user-supplied options to merge with the defaults
     */
    fluid.initLittleComponent = function (name, options) {
        var that = fluid.typeTag(name);
        // TODO: nickName must be available earlier than other merged options so that component may resolve to itself
        that.nickName = options && options.nickName ? options.nickName: fluid.computeNickName(that.typeName);
        fluid.mergeComponentOptions(that, name, options);
        return that;
    };
    
    fluid.postInitModelComponent = function(that) {
        that.model = that.options.model || {};
        that.applier = that.options.applier || fluid.makeChangeApplier(that.model, that.options.changeApplierOptions);
    };
    
    fluid.invokeLifecycleFunction = function(that, func) {
        if (typeof(func) === "string") {
            fluid.invokeGlobalFunction(func, [that]);
        }
        else if (typeof(func) === "function") {
            func.apply(null, [that]);
        }
    };
    
    fluid.invokeLifecycleFunctions = function(that, element) {
        var el = fluid.get(that, fluid.path("options", element));
        if (!fluid.isPrimitive(el)) {
            fluid.each(el, function(elitem) {
                fluid.invokeLifecycleFunction(that, elitem);
            });
        }
        else if (el) {
            fluid.invokeLifecycleFunction(that, el);
        }
    };
    
    fluid.initComponent = function(componentName, initArgs) {
        var options = fluid.defaults(componentName);
        if (!options.gradeNames) {
            fluid.fail("Cannot initialise component " + componentName + " which has no gradeName registered");
        }
        var args = [componentName].concat(fluid.makeArray(initArgs)); // TODO: support different initFunction variants
        var that = fluid.invokeGlobalFunction(options.initFunction, args);
        fluid.invokeLifecycleFunctions(that, "postInitFunction");
        if (fluid.initDependents) {
            fluid.initDependents(that);
        }
        fluid.invokeLifecycleFunctions(that, "finalInitFunction");
        if (that.options.finalInitFunction) {
            fluid.invokeGlobalFunction(that.options.finalInitFunction, [that]);
        }
        return that;
    };
    
    // TODO: for components of the "old style", unless a GRADE is written in defaults, there
    // is no way we could infer it. We don't know which init function a component is going to call 
    // before it executes. For modern-style components, they will presumably use "makeComponents" - 
    // and should really use the "initFunction" + "finalInitFunction" style.
    // If they do this, we can somehow pervert the componentName signature so that we can tell
    // when we are instantiating, although that is a "later problem" - the one of "unrelated instantiation" - not so important
    // Our important problem now is on seeing no grade, we have no idea what do. In the renderer, unless we see a grade,
    // probably have to assume it is a view component - if we don't even see defaults? 
    // Another thing we want to implement is "mergePaths".
    // What we want to support is some demands blocks being able to override material from componentOptions - 
    // specified by fluid.COMPONENT_OPTIONS in the demands blocks.
    // currently we specified that this needs to be specified as specific args - but this causes signature pollution.
    // thing is - that IoC expansion currently occurs AFTER merging. Phases:
    // i) resolve graded defaults (without expansion or IoC), ii) expand THAT merged form,
    // using IoC - it is passed to "expandOptions"., iii) merge on the user options
    
    // however - issue is that BEFORE i), COMPONENT_OPTIONS are fished out of configuration, and 
    // expanded FIRST - since they can only appear as user options. This is the reason we cannot mix
    // them right now with demands block material - in resolveDemands for the instantiation itself, they
    // are expanded. However this is PRECISELY what we could do with a grade. If we see a grade which
    // mentions a mergePath of {componentOptions}, we can instead tunnel them in raw somehow.
    // This is where the whole "tunneling" aspect appears. We somehow need to be able to get
    // EXTRA arguments in to the component creator functions, which, for example, can specify that
    // componentOptions NEED MERGING AND EXPANSION. For example, componentOptions are something that appear
    // in the tree, and so need expansion. However, they may need to be merged with various other things
    // in the tree by demands blocks, with parts overriden. THEN they can be supplied as an "expanded argument"
    // to the component's creator function. This possibility needs to be advertised in the antigenic
    // (graded) part of the upcoming component's defaults. What we ALSO advertise is where to put this
    // expanded, merged argument, and that it should NOT be expanded again. This means that the branch for
    // "expandOptions" in littleComponent is defeated in this case. ALL of this is an antigenic advertisemenet
    // to the IoC system ahead of time. 
    // Further requirement of the tunnelling of course is that littleComponent is informed... but of course we
    // just assume "the will of the framework is always being done" - we just look in our own default options
    // to see if they indicate that they WILL be expanded and merged before being provided. 
    // Big problem here is with demands blocks referring to the component itself.   So, this implies we
    // cannot do it "up front" in that way.
    // littleComponent constructs first, and THEN calls mergeComponentOptions. So all of this REALLY needs
    // to go in mergeComponentOptions. Ah! not all of it! We STILL need to defeat expansion, which currently
    // occurs in resolveRValue, and then inform mCO that expansion now IS required, only after merging (and resolution).
    // we then somehow need {componentOptions} to be put in a tree where they are somehow resolvable.... in theory,
    // we could just look at our own argument list to know where we directed the IoC system to put them.
    // For "old" components that lack a grade, we will just have to infer an "argumentMap" somehow - we could
    // even make THIS an IoC resolvable operation so it could be done in bulk - try to invoke a 
    // resolveArgumentMap function which just defaults to its being the first and only arg. 
    
    // grades: "autoInit" - the framework does all the packaging and just invokes the "final" function, if any.
    // grades: "mergePaths" - if we see this, we defeat RValue expansion, and instead do it all in expandOptions, firstly
    // IoC resolving all the material referred in the paths
    // mergePaths: ["{componentOptions}", "{parent}.innerPath"] etc. but how do we CONTRIBUTE to this with
    // demands blocks? mergePaths itself is the main thing that will be demanded... but demands blocks hit
    // SIGNATURES. For example, they mention [args] as replacement material for the arguments - there are "direct arguments",
    // which in the case of subcomponents are mainly "invented" - although clearly a manual call to initDependent can supply
    // literal ones. In the normal case, [COMPONENT_OPTIONS] is just spliced in, already-expanded, at one position or another.
    // Once we have resolved the **FUNC NAME** addressed by the demands block, ONLY THEN do we know where to put the 
    // options. The caller, however, knows... one big issue is that we have no way for writing an expansion directive that
    // performs arbitrary "compositing" - we can only attach subtrees at particular paths. This is because demands blocks
    // cannot specify MERGING. 
    // So - the fact remains - it needs to be possible to write something, purely in a demands block, that contributes to 
    // the MERGE DIRECTIVE - this seems to be really separate from the ability to write args. But really - it is 
    // IN THE SAME SPACE as args - this is why demands blocks are defective - we are ALREADY compositing the args out of 
    // pieces.... it's just that we are using the "limited dialect" of "direct tree attachment compositing".
    // Again - this MUST be in the demands block - since we are not going to write a new component or change component logic.
    // Can we write "merge compositing" in the same syntax as "args" are currently written? This is exactly the
    // "model transformation" problem, with exactly the same core issue - that the current dialect makes an assumption that
    // "you get what is there already" - an absence of any "{context}.name" directives implies you just get the literal
    // object unchanged. Well.... of course we are compositing "args" themselves!! But again, we either mention a value, and
    // get it WHOLE, or not - we can't specify a value, and then have it possibly overwritten during compositing.
    // of course, compositing and expansion need to occur in step - we aren't doing GLOBAL GINGER MERGING, but we still
    // need to be able to expand EACH RHS before sending it to merging.
    // This is very similar to grades themselves - we fetch a collection of things and they are merged together. We need to
    // be able to write, for example, ["": "{expr}"], ["path2", "{expr2}"] etc. A LIST which is then send in to be merged.
    // This is a FLAT STRUCTURE.... as opposed to the RECURSIVE STRUCTURE of the RHS. This implies that we want
    // each RHS to be EXACTLY as before, a "leaf-composited object". After this expansion, merging then happens, according to the
    // mergePolicy. 
    // The only question now, is how to WRITE this. We can't write it in args: [] directly... can we just get by with making
    // a new directive, "mergeArgs" and expect just one or the other? Bothering every user with the ["":] syntax is a bit
    // disagreeable. We can say that if we just find a string, or an object, as one of the elements, we will interpret it
    // as a root? Hopefully this will not surprise people who actually write a literal array too much? This is only with
    // "mergeArgs" after all. People who use literal arrays and want them to mean arrays can just use "args".
    // What would be nice is to be able to write general args specs in components: areas rather than having a demands
    // block... we already experimented with converting these into equivalent demands using the member nickname.
    
    // The plan for this was that we would actually take "components": material and simply remove it... and create 1-valent
    // demands blocks for them. This itself of course created the special role for COMPONENT_OPTIONS... it *IS* the value
    // written in the components block. If it is put into a demands block, how will we know which value it is :)
    // That is... a TRUE demands block expects to be able to refer to the ONE, unique value which is in component
    // options by a stable name. TRUE demands blocks hide each other - only one can be active. So one could never 
    // refer to another. The ability to resolve {options} is then unique... this material was "put in the space of the
    // users" and so became stably referencable during expansion, along with initArgs. 
    // So, we have a problem operating "defaults to demands" rewriting - the rewritten demands block would violate
    // rules on SINGLE-ACTIVITY of demands blocks.
    // However, can we STILL have a contribution to args or mergeArgs from the components area, even if it is not
    // rewritten? If a demands block DOES act, clearly it trashes this completely. Well - semicompletely.
    // Clearly, there is an issue of the args/mergeArgs attempts to deposit something in the number in the argument
    // list that represents "components" - **OTHER** demands blocks are expecting to refer to this material - yet
    // we are compositing it ourselves! If the other blocks refer to it...... they presumably will have to do so
    // in this "already composited form".... Of course, these demands blocks are executing BEFORE the component
    // constructs. This makes a real mess... (*Q) do we really just want to honour "the part" of the in-line demands block
    // that produces "options" for the purpose of making the EXTERNAL demands blocks have something to resolve to {options} - 
    // whilst throwing away all the rest of the material they produce?
    // Remember that external demands blocks always resolve FIRST... they intercept the ferrying of 
    // initArgs/components to the creator function. 
    // Well, they don't really, do they... otherwise how could you write material in an external demands block that
    // refers to the component itself under construction? Or can they? I don't think they actually can... 
    // initDependent calls "resolveDemands"... which then embodyDemands -> expandOptions for componentOptions ... this is all
    // before initLittle even begins. Once it HAS begun... it then just expands its DEFAULTS. NOT these already expanded
    // args-derived material.
    // In our new model, mergeArgs expansion is done LATER... ALL in the initLittle expandOptions branch.
    // probably a component could NOT refer to itself... we would say that this is what "mergePolicy" is for.
    // the fact that mergePolicy consists of "lhs PATH: rhs PATH"... is suggestive. The big issue is that mergePolicy
    // is currently UNORDERED, and allows just one string per path. We need an ORDERED version of this, and one which 
    // actually accepts context references on RHS rather than just strings - and IN ADDITION one which works across
    // all args, not just the particular component options.
    // And then, we need to make sure what we write... doesn't interfere with genuine merge policy. 
    // Well... "plain merge policy" is applied at EVERY STEP, after expansion of mergeArgs. 
    
    // Back to (*Q). If we put componentOptions itself on an equal footing with demands blocks, ....
    // (*A) well.... clearly, the "options" part can be preserved and honoured... and then we can write
    // BOTH args/mergeArgs there too. "options" then remains permanent, if written - but args/mergeArgs 
    // can be beaten and so permanently replaced. And given that "mergeArgs" is at least as powerful
    // as "options" anyway - given that it can not only refuse to mention "options" but also do even more
    // with respect to compositing.... 
    
    
    
    


    // The Model Events system.
    
    var fluid_guid = 1;
    
    /** Allocate an integer value that will be unique for this session **/
    
    fluid.allocateGuid = function () {
        return fluid_guid++;
    };
    
    fluid.event.identifyListener = function (listener) {
        if (!listener.$$guid) {
            listener.$$guid = fluid.allocateGuid();
        }
        return listener.$$guid;
    };
    
    fluid.event.mapPriority = function (priority) {
        return (priority === null || priority === undefined ? 0 : 
           (priority === "last" ? -Number.MAX_VALUE :
              (priority === "first" ? Number.MAX_VALUE : priority)));
    };
    
    fluid.event.listenerComparator = function (recA, recB) {
        return recB.priority - recA.priority;
    };
    
    fluid.event.sortListeners = function (listeners) {
        var togo = [];
        fluid.each(listeners, function (listener) {
            togo.push(listener);
        });
        return togo.sort(fluid.event.listenerComparator);
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
    
    fluid.event.getEventFirer = function (unicast, preventable) {
        var listeners = {};
        var sortedListeners = [];
        
        function fireToListeners(listeners, args, wrapper) {
            for (var i in listeners) {
                var lisrec = listeners[i];
                var listener = lisrec.listener;
                if (lisrec.predicate && !lisrec.predicate(listener, args)) {
                    continue;
                }
                try {
                    var ret = (wrapper ? wrapper(listener) : listener).apply(null, args);
                    if (preventable && ret === false) {
                        return false;
                    }
                }
                catch (e) {
                    fluid.log("FireEvent received exception " + e.message + " e " + e + " firing to listener " + i);
                    throw (e);       
                }
            }
        }
        
        return {
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
                    fluid.event.mapPriority(priority)};
                sortedListeners = fluid.event.sortListeners(listeners);
            },

            removeListener: function (listener) {
                if (typeof(listener) === 'string') {
                    delete listeners[listener];
                }
                else if (listener.$$guid) {
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

  // **** VIEW-DEPENDENT DEFINITIONS BELOW HERE

    /**
     * Fetches a single container element and returns it as a jQuery.
     * 
     * @param {String||jQuery||element} containerSpec an id string, a single-element jQuery, or a DOM element specifying a unique container
     * @param {Boolean} fallible <code>true</code> if an empty container is to be reported as a valid condition
     * @return a single-element jQuery of container
     */
    fluid.container = function (containerSpec, fallible) {
        var container = fluid.wrap(containerSpec);
        if (fallible && (!container || container.length === 0)) {
            return null;
        }
        
        // Throw an exception if we've got more or less than one element.
        if (!container || !container.jquery || container.length !== 1) {
            if (typeof(containerSpec) !== "string") {
                containerSpec = container.selector;
            }
            var count = container.length !== undefined ? container.length : 0;
            fluid.fail({
                name: "NotOne",
                message: count > 1 ? "More than one (" + count + ") container elements were "
                : "No container element was found for selector " + containerSpec
            });
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
        
        function cacheKey(name, thisContainer) {
            return fluid.allocateSimpleId(thisContainer) + "-" + name;
        }

        function record(name, thisContainer, result) {
            cache[cacheKey(name, thisContainer)] = result;
        }

        that.locate = function (name, localContainer) {
            var selector, thisContainer, togo;
            
            selector = selectors[name];
            thisContainer = localContainer ? localContainer: container;
            if (!thisContainer) {
                fluid.fail("DOM binder invoked for selector " + name + " without container");
            }

            if (!selector) {
                return thisContainer;
            }

            if (typeof(selector) === "function") {
                togo = $(selector.call(null, fluid.unwrap(thisContainer)));
            } else {
                togo = $(selector, thisContainer);
            }
            if (togo.get(0) === document) {
                togo = [];
                //fluid.fail("Selector " + name + " with value " + selectors[name] +
                //            " did not find any elements with container " + fluid.dumpEl(container));
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
            var thisContainer = localContainer ? localContainer: container;
            var key = cacheKey(name, thisContainer);
            var togo = cache[key];
            return togo ? togo : that.locate(name, localContainer);
        };
        that.clear = function () {
            cache = {};
        };
        that.refresh = function (names, localContainer) {
            var thisContainer = localContainer ? localContainer: container;
            if (typeof names === "string") {
                names = [names];
            }
            if (thisContainer.length === undefined) {
                thisContainer = [thisContainer];
            }
            for (var i = 0; i < names.length; ++ i) {
                for (var j = 0; j < thisContainer.length; ++ j) {
                    that.locate(names[i], thisContainer[j]);
                }
            }
        };
        that.resolvePathSegment = that.locate;
        
        return that;
    };
    
    /** Expect that an output from the DOM binder has resulted in a non-empty set of 
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
    fluid.initView = function (componentName, container, userOptions) {
        fluid.expectFilledSelector(container, "Error instantiating component with name \"" + componentName);
        container = fluid.container(container, true);
        if (!container) {
            return null;
        }
        var that = fluid.initLittleComponent(componentName, userOptions); 
        that.container = container;
        fluid.initDomBinder(that);
        
        fluid.instantiateFirers(that, that.options);

        return that;
    };

    
    fluid.initSubcomponentImpl = function (that, entry, args) {
        var togo;
        if (typeof(entry) !== "function") {
            var entryType = typeof(entry) === "string" ? entry : entry.type;
            var globDef = fluid.defaults(true, entryType);
            fluid.merge("reverse", that.options, globDef);
            togo = entryType === "fluid.emptySubcomponent" ?
               fluid.emptySubcomponent(entry.options) : 
               fluid.invokeGlobalFunction(entryType, args);
        }
        else {
            togo = entry.apply(null, args);
        }

        var returnedOptions = togo ? togo.returnedOptions : null;
        if (returnedOptions) {
            fluid.merge(that.options.mergePolicy, that.options, returnedOptions);
            if (returnedOptions.listeners) {
                fluid.mergeListeners(that.events, returnedOptions.listeners);
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
        for (var i = 0; i < args.length; ++ i) {
            if (args[i] === fluid.COMPONENT_OPTIONS) {
                optindex = i;
            }
        }
        for (i = 0; i < entries.length; ++ i) {
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
            if (el.getAttribute("id") !== id) {
                fluid.fail("Problem in document structure - picked up element " +
                    fluid.dumpEl(el) + " for id " + id +
                    " without this id - most likely the element has a name which conflicts with this id");
            }
            return el;
        }
        else {
            return null;
        }
    };
    
    /**
     * Returns the id attribute from a jQuery or pure DOM element.
     * 
     * @param {jQuery||Element} element the element to return the id attribute for
     */
    fluid.getId = function (element) {
        return fluid.unwrap(element).getAttribute("id");
    };
    
    /** 
     * Allocate an id to the supplied element if it has none already, by a simple
     * scheme resulting in ids "fluid-id-nnnn" where nnnn is an increasing integer.
     */
    
    fluid.allocateSimpleId = function (element) {
        element = fluid.unwrap(element);
        if (!element.id) {
            element.id = "fluid-id-" + fluid.allocateGuid(); 
        }
        return element.id;
    };
    

    // Message resolution and templating
    
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
            var searchStr = "%" + key;
            newString = newString.replace(searchStr, values[key]);
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
            }
            else {
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
        for (var i = 0; i < messagecodes.length; ++ i) {
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

})(jQuery, fluid_1_3);
