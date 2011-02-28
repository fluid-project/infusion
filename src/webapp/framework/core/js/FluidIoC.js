/*
Copyright 2007-2010 University of Cambridge
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery*/

var fluid_1_3 = fluid_1_3 || {};

(function ($, fluid) {

    /** The Fluid "IoC System proper" - resolution of references and 
     * completely automated instantiation of declaratively defined
     * component trees */ 
    
    var inCreationMarker = "__CURRENTLY_IN_CREATION__";
    
    // unsupported, non-API function
    fluid.isFireBreak = function(component) {
        return component.options && component.options["fluid.visitComponents.fireBreak"]  
    };
    
    var findMatchingComponent = function(that, visitor, visited) {
        for (var name in that) {
            var component = that[name];
            //Every component *should* have an id, but some clients may not yet be compliant
            //if (component && component.typeName && !component.id) {
            //    fluid.fail("No id");
            //}
            if (!component || !component.typeName || component.id && visited[component.id]) {continue;}
            visited[component.id] = true;
            if (visitor(component, name)) {
                return true;
            }
            if (!fluid.isFireBreak(component)) {
                findMatchingComponent(component, visitor, visited);
            }
         }
    };
    
    // thatStack contains an increasing list of MORE SPECIFIC thats.
    var visitComponents = function(thatStack, visitor, visited) {
        visited = visited || {};
        for (var i = thatStack.length - 1; i >= 0; -- i) {
            var that = thatStack[i];
            if (fluid.isFireBreak(that)) {
               return;
            }
            if (that.typeName) {
                visited[that.id] = true;
                if (visitor(that, "")) {
                    return;
                }
            }
            if (findMatchingComponent(that, visitor, visited)) {
                return;
            }
        }
    };
    
    // An EL segment resolver strategy that will attempt to trigger creation of
    // components that it discovers along the EL path, if they have been defined but not yet
    // constructed. Spring, eat your heart out! Wot no SPR-2048?
    
    function makeGingerStrategy(thatStack) {
        return function(component, thisSeg) {
            if (thisSeg === "") {
                return component; // explicitly allow lookup to self TODO review
            }
            var atval = component[thisSeg];
            if (atval !== undefined) {
                if (atval[inCreationMarker] && atval !== thatStack[0]) {
                    fluid.fail("Component of type " + 
                    atval.typeName + " cannot be used for lookup of path " + thisSeg +
                    " since it is still in creation. Please reorganise your dependencies so that they no longer contain circular references");
                }
            }
            else {
                if (fluid.get(component, fluid.path("options", "components", thisSeg, "type"))) {
                    fluid.initDependent(component, thisSeg);
                    atval = component[thisSeg];
                }
            };
            return atval;
        }
    };

    function makeStackFetcher(thatStack, directModel) {
        var fetchStrategies = [fluid.model.funcResolverStrategy, makeGingerStrategy(thatStack)]; 
        var fetcher = function(parsed) {
            var context = parsed.context;
            var foundComponent;
            visitComponents(thatStack, function(component, name) {
                if (context === name || context === component.typeName || context === component.nickName) {
                    foundComponent = component;
                    return true; // YOUR VISIT IS AT AN END!!
                }
                if (fluid.get(component, fluid.path("options", "components", context, "type")) && !component[context]) {
                    foundComponent = fluid.get(component, context, {strategies: fetchStrategies});
                    return true;
                }
            });
                // TODO: we used to get a helpful diagnostic when we failed to match a context name before we fell back
                // to the environment for FLUID-3818
                //fluid.fail("No context matched for name " + context + " from root of type " + thatStack[0].typeName);
            return fluid.get(foundComponent, parsed.path, {strategies: fetchStrategies});
        };
        return fetcher;
    }
     
    function makeStackResolverOptions(thatStack, directModel) {
        return $.extend({}, fluid.defaults("fluid.resolveEnvironment"), {
            noCopy: true,
            fetcher: makeStackFetcher(thatStack, directModel)
            }); 
    } 
     
    function resolveRvalue(thatStack, arg, initArgs, componentOptions) {
        var directModel = thatStack[0].model; // TODO: this is not reasonable
        var options = makeStackResolverOptions(thatStack, directModel);
        options.model = directModel;
        
        if (fluid.isMarker(arg, fluid.COMPONENT_OPTIONS)) {
            arg = fluid.expandOptions(componentOptions, thatStack[thatStack.length - 1]); //fluid.expander.expandLight(componentOptions, options);
        }
        else {
            if (typeof(arg) === "string" && arg.charAt(0) === "@") { // Test cases for i) single-args, ii) composite args
                var argpos = arg.substring(1);
                arg = initArgs[argpos];
            }
            else {
                arg = fluid.expander.expandLight(arg, options); // fluid.resolveEnvironment(arg, directModel, options);
            }
        }
        return arg;
    }
    
    
    /** Given a concrete argument list and/or options, determine the final concrete
     * "invocation specification" which is coded by the supplied demandspec in the 
     * environment "thatStack" - the return is a package of concrete global function name
     * and argument list which is suitable to be executed directly by fluid.invokeGlobalFunction.
     */
    fluid.embodyDemands = function(thatStack, demandspec, initArgs, options) {
        var demands = $.makeArray(demandspec.args);
        options = options || {};
        if (demands.length === 0) {
            if (options.componentOptions) { // Guess that it is meant to be a subcomponent TODO: component grades
               demands = [fluid.COMPONENT_OPTIONS];
            }
            else if (options.passArgs) {
                demands = fluid.transform(initArgs, function(arg, index) {
                    return "@"+index;
                });
            }
        }
        var args = [];
        if (demands) {
            for (var i = 0; i < demands.length; ++ i) {
                var arg = demands[i];
                if (typeof(arg) === "object" && !fluid.isMarker(arg)) {
                    var resolvedOptions = {};
                    for (var key in arg) {
                        var ref = arg[key];
                        var rvalue = resolveRvalue(thatStack, ref, initArgs, options.componentOptions);
                        fluid.set(resolvedOptions, key, rvalue);
                    }
                    args[i] = resolvedOptions;
                }
                else {
                    var resolvedArg = resolveRvalue(thatStack, arg, initArgs, options.componentOptions);
                    args[i] = resolvedArg;
                }
                if (i === demands.length - 1 && args[i] && typeof(args[i]) === "object" && !args[i].typeName && !args[i].targetTypeName) {
                    args[i].targetTypeName = demandspec.funcName; // TODO: investigate the general sanity of this
                }
            }
        }
        else {
            args = initArgs? initArgs: [];
        }

        var togo = {
            args: args,
            funcName: demandspec.funcName
        };
        return togo;
    };
   
    var dependentStore = {};
    
    function searchDemands(demandingName, contextNames) {
        var exist = dependentStore[demandingName] || [];
        outer: for (var i = 0; i < exist.length; ++ i) {
            var rec = exist[i];
            for (var j = 0; j < contextNames.length; ++ j) {
                 if (rec.contexts[j] !== contextNames[j]) {
                     continue outer;
                 }
            }
            return rec.spec;   
        }
    }
    
    fluid.demands = function(demandingName, contextName, spec) {
        var contextNames = $.makeArray(contextName).sort(); 
        if (!spec) {
            return searchDemands(demandingName, contextNames);
        }
        else if (spec.length) {
            spec = {args: spec};
        }
        var exist = dependentStore[demandingName];
        if (!exist) {
            exist = [];
            dependentStore[demandingName] = exist;
        }
        exist.push({contexts: contextNames, spec: spec});
    };
    
    fluid.instantiator = function() {
        // NB: We may not use the options merging framework itself here, since "withInstantiator" below
        // will blow up, as it tries to resolve the instantiator which we are instantiating *NOW*
        var preThat = {
            options: {
                "fluid.visitComponents.fireBreak": true         
            },
            idToPath: {},
            pathToComponent: {},
            stackCount: 0
        };
        var that = fluid.initLittleComponent("fluid.instantiator");
        that = $.extend(that, preThat);

        that.stack = function(count) {
            return that.stackCount += count;
        }
        that.getThatStack = function(component) {
            var path = that.idToPath[component.id] || "";
            var parsed = fluid.model.parseEL(path);
            var togo = fluid.transform(parsed, function(value, i) {
                var parentPath = fluid.model.composeSegments.apply(null, parsed.slice(0, i + 1));
                return that.pathToComponent[parentPath];    
            });
            var root = that.pathToComponent[""];
            if (root) {
                togo.unshift(root);
            }
            return togo;
        };
        that.getFullStack = function(component) {
            var thatStack = component? that.getThatStack(component) : [];
            return [fluid.staticEnvironment, fluid.threadLocal()].concat(thatStack);
        }
        function recordComponent(component, path) {
            that.idToPath[component.id] = path;
            that.pathToComponent[path] = component;          
        }
        that.recordRoot = function(component) {
            if (component && component.id && !that.pathToComponent[""]) {
                recordComponent(component, "");
            }  
        };
        that.pushUpcomingInstantiation = function(parent, name) {
            that.expectedParent = parent;
            that.expectedName = name;
        };
        that.recordComponent = function(component) {
            if (that.expectedName) {
                that.recordKnownComponent(that.expectedParent, component, that.expectedName);
                delete that.expectedName;
                delete that.expectedParent;
            }
            else {
                that.recordRoot(component);
            }
        };
        that.clearComponent = function(component, name) {
            var child = component[name];
            var path = that.idToPath[child.id];
            delete that.idToPath[child.id];
            delete that.pathToComponent[path];
            delete component[name];
        };
        that.recordKnownComponent = function(parent, component, name) {
            var parentPath = that.idToPath[parent.id] || "";
            var path = fluid.model.composePath(parentPath, name);
            recordComponent(component, path);
        };
        return that;
    };

    fluid.locateDemands = function(demandingNames, thatStack) {
        var contextNames = {};
        visitComponents(thatStack, function(component) {
            contextNames[component.typeName] = true;
        });
        var matches = [];
        for (var i = 0; i < demandingNames.length; ++ i) {
            var rec = dependentStore[demandingNames[i]] || [];
            for (var j = 0; j < rec.length; ++ j) {
                var spec = rec[j];
                var record = {spec: spec.spec, intersect: 0, uncess: 0};
                for (var k = 0; k < spec.contexts.length; ++ k) {
                    record[contextNames[spec.contexts[k]]? "intersect" : "uncess"] += 2;
                }
                if (spec.contexts.length === 0) { // allow weak priority for contextless matches
                    record.intersect ++;
                }
                // TODO: Potentially more subtle algorithm here - also ambiguity reports  
                matches.push(record); 
            }
        }
        matches.sort(function(speca, specb) {
            var p1 = specb.intersect - speca.intersect; 
            return p1 === 0? speca.uncess - specb.uncess : p1;
            });
        return matches.length === 0 || matches[0].intersect === 0? null : matches[0].spec;
    };
    
    /** Determine the appropriate demand specification held in the fluid.demands environment 
     * relative to "thatStack" for the function name(s) funcNames.
     */
    fluid.determineDemands = function (thatStack, funcNames) {
        var that = thatStack[thatStack.length - 1];
        funcNames = $.makeArray(funcNames);
        var demandspec = fluid.locateDemands(funcNames, thatStack);
   
        if (!demandspec) {
            demandspec = {};
        }
        var newFuncName = funcNames[0];
        if (demandspec.funcName) {
            newFuncName = demandspec.funcName;
           /**    TODO: "redirects" disabled pending further thought
            var demandspec2 = fluid.fetchDirectDemands(funcNames[0], that.typeName);
            if (demandspec2) {
                demandspec = demandspec2; // follow just one redirect
            } **/
        }
        var mergeArgs = [];
        if (demandspec.parent) {
            var parent = searchDemands(funcNames[0], $.makeArray(demandspec.parent).sort());
            if (parent) {
                mergeArgs = parent.args; // TODO: is this really a necessary feature?
            }
        }
        var args = [];
        fluid.merge(null, args, $.makeArray(mergeArgs), $.makeArray(demandspec.args)); // TODO: avoid so much copying
        return {funcName: newFuncName, args: args};
    };
    
    fluid.resolveDemands = function (thatStack, funcNames, initArgs, options) {
        var demandspec = fluid.determineDemands(thatStack, funcNames);
        return fluid.embodyDemands(thatStack, demandspec, initArgs, options);
    };
    
    // TODO: make a *slightly* more performant version of fluid.invoke that perhaps caches the demands
    // after the first successful invocation
    fluid.invoke = function(functionName, args, that, environment) {
        args = fluid.makeArray(args);
        return fluid.withInstantiator(that, function(instantiator) {
            var thatStack = instantiator.getFullStack(that);
            var invokeSpec = fluid.resolveDemands(thatStack, functionName, args, {passArgs: true});
            return fluid.invokeGlobalFunction(invokeSpec.funcName, invokeSpec.args, environment);
        });
    };
    
    /** Make a function which performs only "static redispatch" of the supplied function name - 
     * that is, taking only account of the contents of the "static environment". Since the static
     * environment is assumed to be constant, the dispatch of the call will be evaluated at the
     * time this call is made, as an optimisation.
     */
    
    fluid.makeFreeInvoker = function(functionName, environment) {
        var demandSpec = fluid.determineDemands([fluid.staticEnvironment], functionName);
        return function() {
            var invokeSpec = fluid.embodyDemands(fluid.staticEnvironment, demandSpec, arguments);
            return fluid.invokeGlobalFunction(invokeSpec.funcName, invokeSpec.args, environment);
        };
    };
    
    fluid.makeInvoker = function(that, instantiator, demandspec, functionName, environment) {
        var thatStack = instantiator.getFullStack(that);
        demandspec = demandspec || fluid.determineDemands(thatStack, functionName);
        return function() {
            var invokeSpec = fluid.embodyDemands(thatStack, demandspec, arguments);
            return fluid.invokeGlobalFunction(invokeSpec.funcName, invokeSpec.args, environment);
        };
    };
    
    fluid.addBoiledListener = function(thatStack, eventName, listener, namespace, predicate) {
        thatStack = $.makeArray(thatStack);
        var topThat = thatStack[thatStack.length - 1];
        topThat.events[eventName].addListener(function(args) {
            var resolved = fluid.resolveDemands(thatStack, eventName, args);
            listener.apply(null, resolved.args);
        }, namespace, predicate);
    };
    
        
    fluid.registerNamespace("fluid.expander");
    
    /** rescue that part of a component's options which should not be subject to
     * options expansion via IoC - this initially consists of "components" and "mergePolicy" 
     * but will be expanded by the set of paths specified as "noexpand" within "mergePolicy" 
     */
    
    fluid.expander.preserveFromExpansion = function(options) {
        var preserve = {};
        var preserveList = ["mergePolicy", "components", "invokers"];
        fluid.each(options.mergePolicy, function(value, key) {
            if (fluid.mergePolicyIs(value, "noexpand")) {
                preserveList.push(key);
            }
        });
        fluid.each(preserveList, function(path) {
            var pen = fluid.model.getPenultimate(options, path);
            var value = pen.root[pen.last];
            delete pen.root[pen.last];
            fluid.set(preserve, path, value);  
        });
        return {
            restore: function(target) {
                fluid.each(preserveList, function(path) {
                    var preserved = fluid.get(preserve, path);
                    if (preserved !== undefined) {
                        fluid.set(target, path, preserved)
                    }
                });
            }
        };
    };
    
    /** Expand a set of component options with respect to a set of "expanders" (essentially only
     *  deferredCall) -  This substitution is destructive since it is assumed that the options are already "live" as the
     *  result of environmental substitutions. Note that options contained inside "components" will not be expanded
     *  by this call directly to avoid linearly increasing expansion depth if this call is occuring as a result of
     *  "initDependents" */
     // TODO: This needs to be integrated with "embodyDemands" above which makes a call to "resolveEnvironment" directly
     // but with very similarly derived options (makeStackResolverOptions)
     // The whole merge/expansion pipeline needs an overhaul once we have "grades" to allow merging and
     // defaulting to occur smoothly across a "demands" stack - right now, "demanded" options have exactly
     // the same status as user options whereas they should slot into the right place between 
     // "earlyDefaults"/"defaults"/"demands"/"user options". Demands should be allowed to say whether they
     // integrate with or override defaults.
    fluid.expandOptions = function(args, that) {
        if (fluid.isPrimitive(args)) {
            return args;
        }
        return fluid.withInstantiator(that, function(instantiator) {
            fluid.log("expandOptions for " + that.typeName + " executing with instantiator " + instantiator.id);
            var thatStack = instantiator.getFullStack(that);
            var expandOptions = makeStackResolverOptions(thatStack);
            expandOptions.noCopy = true; // It is still possible a model may be fetched even though it is preserved
            if (!fluid.isArrayable(args)) {
                var pres = fluid.expander.preserveFromExpansion(args);
            }
            var expanded = fluid.expander.expandLight(args, expandOptions);
            if (pres) {
                pres.restore(expanded);
            }
            return expanded;
        });
    };
    
    // The case without the instantiator is from the ginger strategy - this logic is still a little ragged
    fluid.initDependent = function(that, name, userInstantiator, directArgs) {
        if (!that || that[name]) { return; }
        directArgs = directArgs || [];
        var root = fluid.threadLocal();
        if (userInstantiator) {
           var existing = root["fluid.instantiator"];
           if (existing && existing !== userInstantiator) {
               fluid.fail("Error in initDependent: user instantiator supplied with id " + userInstantiator.id 
                + " which differs from that for currently active instantiation with id " + existing.id);
           }
           else {
               root["fluid.instantiator"] = userInstantiator;
               fluid.log("*** initDependent for " + that.typeName + " member " + name + " was supplied USER instantiator with id " + userInstantiator.id + " - STORED");
           }
        }
        
        fluid.withInstantiator(that, function(instantiator) {
            var thatStack = instantiator.getFullStack(that);
            var component = that.options.components[name];
            if (typeof(component) === "string") {
                that[name] = fluid.expandOptions([component], that)[0]; // TODO: expose more sensible semantic for expandOptions 
            }
            else if (component.type) {
                var invokeSpec = fluid.resolveDemands(thatStack, [component.type, name], directArgs, {componentOptions: component.options});
                // TODO: only want to expand "options" or all args? See "component rescuing" in expandOptions above
                //invokeSpec.args = fluid.expandOptions(invokeSpec.args, thatStack, true);
                instantiator.pushUpcomingInstantiation(that, name);
                try {
                    that[inCreationMarker] = true;
                    var instance = fluid.initSubcomponentImpl(that, {type: invokeSpec.funcName}, invokeSpec.args);
                    if (instance) { // TODO: more fallibility
                       // Interestingly, by the time we have actually recorded this component here, it is far too late
                       // to have used it for resolution required by itself and subcomponents....
                        that[name] = instance;
                    }
                }
                finally {
                    delete that[inCreationMarker];
                    instantiator.pushUpcomingInstantiation();
                }
            }
            else { 
                that[name] = component;
            }
        });
    };
    
    // NON-API function
    // This function is stateful and MUST NOT be called by client code
    fluid.withInstantiator = function(that, func) {
        var typeName = that? that.typeName: "[none]";
        var root = fluid.threadLocal();
        var instantiator = root["fluid.instantiator"];
        if (!instantiator) {
            instantiator = root["fluid.instantiator"] = fluid.instantiator();
            fluid.log("Created new instantiator with id " + instantiator.id + " in order to operate on component " + typeName);
        }
        try {
            if (that) {
                instantiator.recordComponent(that);
            }
            instantiator.stack(1);
            fluid.log("Instantiator stack +1 to " + instantiator.stackCount + " for " + typeName);
            return func(instantiator);
        }
        finally {
            var count = instantiator.stack(-1);
            fluid.log("Instantiator stack -1 to " + instantiator.stackCount + " for " + typeName);
            if (count === 0) {
                fluid.log("Clearing instantiator with id " + instantiator.id + " from threadLocal for end of " + typeName);
                delete root["fluid.instantiator"];
            }
        }              
    };
        
    fluid.initDependents = function(that) {
        var options = that.options;
        var components = options.components || {};
        for (var name in components) {
            fluid.initDependent(that, name);
        }
        var invokers = options.invokers || {};
        for (var name in invokers) {
            var invokerec = invokers[name];
            var funcName = typeof(invokerec) === "string"? invokerec : null;
            that[name] = fluid.withInstantiator(that, function(instantiator) { 
                return fluid.makeInvoker(that, instantiator, funcName? null : invokerec, funcName);
            });
        }
    };
    
    // Standard Fluid component types
    
    fluid.viewComponent = function(name) {
        return function(container, options) {
            var that = fluid.initView(name, container, options);
            fluid.initDependents(that);
            return that;
        };
    };
    
    // backwards compatibility with 1.3.x although this was probably never used/advertised
    fluid.standardComponent = fluid.viewComponent; 
    
    fluid.littleComponent = function(name) {
        return function(options) {
            var that = fluid.initLittleComponent(name, options);
            fluid.initDependents(that);
            return that;
        };
    };
    
    fluid.makeComponents = function(components, env) {
        if (!env) {
            env = fluid.environment;
        }
        for (var name in components) {
            fluid.setGlobalValue(name, 
                fluid.invokeGlobalFunction(components[name], [name], env), env);
        }
    };
    
        
    fluid.staticEnvironment = fluid.typeTag("fluid.staticEnvironment");
    
    fluid.staticEnvironment.environmentClass = fluid.typeTag("fluid.browser");
    
    // fluid.environmentalRoot.environmentClass = fluid.typeTag("fluid.rhino");
    
    fluid.demands("fluid.threadLocal", "fluid.browser", {funcName: "fluid.singleThreadLocal"});

    var singleThreadLocal = fluid.typeTag("fluid.dynamicEnvironment");
    
    fluid.singleThreadLocal = function() {
        return singleThreadLocal;
    };

    fluid.threadLocal = fluid.makeFreeInvoker("fluid.threadLocal");

    fluid.withEnvironment = function(envAdd, func) {
        var root = fluid.threadLocal();
        try {
            $.extend(root, envAdd);
            return func();
        }
        finally {
            for (var key in envAdd) {
               delete root[key];
            }
        }
    };
    
    fluid.extractEL = function(string, options) {
        if (options.ELstyle === "ALL") {
            return string;
        }
        else if (options.ELstyle.length === 1) {
            if (string.charAt(0) === options.ELstyle) {
                return string.substring(1);
            }
        }
        else if (options.ELstyle === "${}") {
            var i1 = string.indexOf("${");
            var i2 = string.lastIndexOf("}");
            if (i1 === 0 && i2 !== -1) {
                return string.substring(2, i2);
            }
        }
    };
    
    fluid.extractELWithContext = function(string, options) {
        var EL = fluid.extractEL(string, options);
        if (EL && EL.charAt(0) === "{") {
            return fluid.parseContextReference(EL, 0);
        }
        return EL? {path: EL} : EL;
    };

    /* An EL extraction utility suitable for context expressions which occur in 
     * expanding component trees. It assumes that any context expressions refer
     * to EL paths that are to be referred to the "true (direct) model" - since
     * the context during expansion may not agree with the context during rendering.
     * It satisfies the same contract as fluid.extractEL, in that it will either return
     * an EL path, or undefined if the string value supplied cannot be interpreted
     * as an EL path with respect to the supplied options.
     */
        
    fluid.extractContextualPath = function (string, options, env) {
        var parsed = fluid.extractELWithContext(string, options);
        if (parsed) {
            if (parsed.context) {
                var fetched = env[parsed.context];
                if (typeof(fetched) !== "string") {
                    fluid.fail("Could not look up context path named " + parsed.context + " to string value");
                }
                return fluid.model.composePath(fetched, parsed.path);
            }
            else {
                return parsed.path;
            }
        }
    };

    fluid.parseContextReference = function(reference, index, delimiter) {
        var endcpos = reference.indexOf("}", index + 1);
        if (endcpos === -1) {
            fluid.fail("Malformed context reference without }");
        }
        var context = reference.substring(index + 1, endcpos);
        var endpos = delimiter? reference.indexOf(delimiter, endcpos + 1) : reference.length;
        var path = reference.substring(endcpos + 1, endpos);
        if (path.charAt(0) === ".") {
            path = path.substring(1);
        }
        return {context: context, path: path, endpos: endpos};
    };
    
    fluid.fetchContextReference = function(parsed, directModel, env) {
        var base = parsed.context? env[parsed.context] : directModel;
        if (!base) {
            return base;
        }
        return fluid.get(base, parsed.path);
    };
    
    fluid.resolveContextValue = function(string, options) {
        if (options.bareContextRefs && string.charAt(0) === "{") {
            var parsed = fluid.parseContextReference(string, 0);
            return options.fetcher(parsed);        
        }
        else if (options.ELstyle && options.ELstyle !== "${}") {
            var parsed = fluid.extractELWithContext(string, options);
            if (parsed) {
                return options.fetcher(parsed);
            }
        }
        while (typeof(string) === "string") {
            var i1 = string.indexOf("${");
            var i2 = string.indexOf("}", i1 + 2);
            var all = (i1 === 0 && i2 === string.length - 1); 
            if (i1 !== -1 && i2 !== -1) {
                var parsed;
                if (string.charAt(i1 + 2) === "{") {
                    parsed = fluid.parseContextReference(string, i1 + 2, "}");
                    i2 = parsed.endpos;
                }
                else {
                    parsed = {path: string.substring(i1 + 2, i2)};
                }
                var subs = options.fetcher(parsed);
                // TODO: test case for all undefined substitution
                if (subs === undefined || subs === null) {
                    return subs;
                    }
                string = all? subs : string.substring(0, i1) + subs + string.substring(i2 + 1);
            }
            else {
                break;
            }
        }
        return string;
    };
    
    function resolveEnvironmentImpl(obj, options) {
        function recurse(arg) {
            return resolveEnvironmentImpl(arg, options);
        }
        if (typeof(obj) === "string" && !options.noValue) {
            return fluid.resolveContextValue(obj, options);
        }
        else if (fluid.isPrimitive(obj) || obj.nodeType !== undefined || obj.jquery) {
            return obj;
        }
        else if (options.filter) {
            return options.filter(obj, recurse, options);
        }
        else {
            return (options.noCopy? fluid.each : fluid.transform)(obj, function(value, key) {
                return resolveEnvironmentImpl(value, options);
            });
        }
    }
    
    fluid.defaults("fluid.resolveEnvironment", 
        {ELstyle:     "${}",
         bareContextRefs: true});
    
    fluid.environmentFetcher = function(directModel) {
        var env = fluid.threadLocal();
        return function(parsed) {
            return fluid.fetchContextReference(parsed, directModel, env);
        };
    };
    
    fluid.resolveEnvironment = function(obj, directModel, userOptions) {
        directModel = directModel || {};
        var options = fluid.merge(null, {}, fluid.defaults("fluid.resolveEnvironment"), userOptions);
        if (!options.fetcher) {
            options.fetcher = fluid.environmentFetcher(directModel);
        }
        return resolveEnvironmentImpl(obj, options);
    };

    /** "light" expanders, starting with support functions for the "deferredFetcher" expander **/

    fluid.expander.deferredCall = function(target, source, recurse) {
        var expander = source.expander;
        var args = (!expander.args || fluid.isArrayable(expander.args))? expander.args : $.makeArray(expander.args);
        args = recurse(args); 
        return fluid.invokeGlobalFunction(expander.func, args);
    };
    
    fluid.deferredCall = fluid.expander.deferredCall; // put in top namespace for convenience
    
    fluid.deferredInvokeCall = function(target, source, recurse) {
        var expander = source.expander;
        var args = (!expander.args || fluid.isArrayable(expander.args))? expander.args : $.makeArray(expander.args);
        args = recurse(args);  
        return fluid.invoke(expander.func, args);
    };
    
    // The "noexpand" expander which simply unwraps one level of expansion and ceases.
    fluid.expander.noexpand = function(target, source) {
        return $.extend(target, source.expander.tree);
    };
  
    fluid.noexpand = fluid.expander.noexpand; // TODO: check naming and namespacing
  
    fluid.expander.lightFilter = function (obj, recurse, options) {
          var togo;
          if (fluid.isArrayable(obj)) {
              togo = options.noCopy? obj : [];
              fluid.each(obj, function(value, key) {togo[key] = recurse(value);});
          }
          else {
              togo = options.noCopy? obj : {};
              for (var key in obj) {
                  var value = obj[key];
                  var expander;
                  if (key === "expander" && !(options.expandOnly && options.expandOnly[value.type])){
                      expander = fluid.getGlobalValue(value.type);  
                      if (expander) {
                          return expander.call(null, togo, obj, recurse);
                      }
                  }
                  if (key !== "expander" || !expander) {
                      togo[key] = recurse(value);
                  }
              }
          }
          return options.noCopy? obj : togo;
      };
      
    fluid.expander.expandLight = function (source, expandOptions) {
        var options = $.extend({}, expandOptions);
        options.filter = fluid.expander.lightFilter;
        return fluid.resolveEnvironment(source, options.model, options);       
    };
          
})(jQuery, fluid_1_3);
