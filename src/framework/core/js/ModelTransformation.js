/*
Copyright 2010 University of Toronto
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies

/*global fluid:true, fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, elsecatch: true, jslintok: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};
var fluid = fluid || fluid_1_5;

(function ($) {

    fluid.registerNamespace("fluid.model.transform");
    
    /** Grade definitions for standard transformation function hierarchy **/
    
    fluid.defaults("fluid.transformFunction", {
        gradeNames: "fluid.function"
    });
    
    // uses standard layout and workflow involving inputPath
    fluid.defaults("fluid.standardInputTransformFunction", {
        gradeNames: "fluid.transformFunction"  
    });
    
    fluid.defaults("fluid.standardOutputTransformFunction", {
        gradeNames: "fluid.transformFunction"  
    });

    fluid.defaults("fluid.multiInputTransformFunction", {
        gradeNames: "fluid.transformFunction"
    });
    
    // uses the standard layout and workflow involving inputPath and outputPath
    fluid.defaults("fluid.standardTransformFunction", {
        gradeNames: ["fluid.standardInputTransformFunction", "fluid.standardOutputTransformFunction"]  
    });
    
    fluid.defaults("fluid.lens", {
        gradeNames: "fluid.transformFunction",
        invertConfiguration: null
        // this function method returns "inverted configuration" rather than actually performing inversion
        // TODO: harmonise with strategy used in VideoPlayer_framework.js
    });
    
    /***********************************
     * Base utilities for transformers *
     ***********************************/

    // unsupported, NON-API function
    fluid.model.transform.pathToRule = function (inputPath) {
        return {
            transform: {
                type: "fluid.transforms.value",
                inputPath: inputPath
            }
        };
    };
    
    // unsupported, NON-API function    
    fluid.model.transform.valueToRule = function (value) {
        return {
            transform: {
                type: "fluid.transforms.literalValue",
                value: value
            }
        };
    };
        
    /** Accepts two fully escaped paths, either of which may be empty or null **/
    fluid.model.composePaths = function (prefix, suffix) {
        prefix = prefix || "";
        suffix = suffix || "";
        return !prefix ? suffix : (!suffix ? prefix : prefix + "." + suffix);
    };

    fluid.model.transform.accumulateInputPath = function (inputPath, transform, paths) {
        if (inputPath !== undefined) {
            paths.push(fluid.model.composePaths(transform.inputPrefix, inputPath));
        }
    };

    fluid.model.transform.accumulateStandardInputPath = function (input, transformSpec, transform, paths) {
        fluid.model.transform.getValue(undefined, transformSpec[input], transform);    
        fluid.model.transform.accumulateInputPath(transformSpec[input + "Path"], transform, paths);
    };

    fluid.model.transform.accumulateMultiInputPaths = function (inputVariables, transformSpec, transform, paths) {
        fluid.each(inputVariables, function (v, k) {
            fluid.model.transform.accumulateStandardInputPath(k, transformSpec, transform, paths);
        });
    };

    fluid.model.transform.getValue = function (inputPath, value, transform) {
        var togo;
        if (inputPath !== undefined) { // NB: We may one day want to reverse the crazy jQuery-like convention that "no path means root path"
            togo = fluid.get(transform.source, fluid.model.composePaths(transform.inputPrefix, inputPath), transform.resolverGetConfig);
        }
        if (togo === undefined) {
            togo = fluid.isPrimitive(value) ? value : transform.expand(value);
        }
        return togo;
    };
    
    // distinguished value which indicates that a transformation rule supplied a 
    // non-default output path, and so the user should be prevented from making use of it
    // in a compound transform definition
    fluid.model.transform.NONDEFAULT_OUTPUT_PATH_RETURN = {};
    
    fluid.model.transform.setValue = function (userOutputPath, value, transform, merge) {
        // avoid crosslinking to input object - this might be controlled by a "nocopy" option in future
        var toset = fluid.copy(value); 
        var outputPath = fluid.model.composePaths(transform.outputPrefix, userOutputPath);
        // TODO: custom resolver config here to create non-hash output model structure
        if (toset !== undefined) {
            transform.applier.requestChange(outputPath, toset, merge ? "MERGE" : undefined);
        }
        return userOutputPath ? fluid.model.transform.NONDEFAULT_OUTPUT_PATH_RETURN : toset;
    };
    
    /* Resolves the <key> given as parameter by looking up the path <key>Path in the object
     * to be transformed. If not present, it resolves the <key> by using the literal value if primitive,
     * or expanding otherwise. <def> defines the default value if unableto resolve the key. If no
     * default value is given undefined is returned
     */
    fluid.model.transform.resolveParam = function (transformSpec, transform, key, def) {
        var val = fluid.model.transform.getValue(transformSpec[key + "Path"], transformSpec[key], transform);
        return (val !== undefined) ? val : def;
    };

    // TODO: Incomplete implementation which only checks expected paths
    fluid.deepEquals = function (expected, actual, stats) {
        if (fluid.isPrimitive(expected)) {
            if (expected === actual) {
                ++stats.matchCount;
            } else {
                ++stats.mismatchCount;
                stats.messages.push("Value mismatch at path " + stats.path + ": expected " + expected + " actual " + actual);
            }
        }
        else {
            if (typeof(expected) !== typeof(actual)) {
                ++stats.mismatchCount;
                stats.messages.push("Type mismatch at path " + stats.path + ": expected " + typeof(expected)  + " actual " + typeof(actual)); 
            } else {
                fluid.each(expected, function (value, key) {
                    stats.pathOps.push(key);
                    fluid.deepEquals(expected[key], actual[key], stats);
                    stats.pathOps.pop(key);
                });
            }
        }
    };
    
    fluid.model.transform.matchValue = function (expected, actual) {
        if (fluid.isPrimitive(expected)) {
            return expected === actual ? 1 : 0;
        } else {
            var stats = {
                matchCount: 0,
                mismatchCount: 0,
                messages: []
            };
            fluid.model.makePathStack(stats, "path");
            fluid.deepEquals(expected, actual, stats);
            return stats.matchCount;
        }
    };
    
    // unsupported, NON-API function    
    fluid.model.transform.compareMatches = function (speca, specb) {
        return specb.matchCount - speca.matchCount;
    };
    
    fluid.firstDefined = function (a, b) {
        return a === undefined ? b : a;
    };

        
    // TODO: prefixApplier is a transform which is currently unused and untested
    fluid.model.transform.prefixApplier = function (transformSpec, transform) {
        if (transformSpec.inputPrefix) {
            transform.inputPrefixOp.push(transformSpec.inputPrefix);
        }
        if (transformSpec.outputPrefix) {
            transform.outputPrefixOp.push(transformSpec.outputPrefix);
        }
        transform.expand(transformSpec.value);
        if (transformSpec.inputPrefix) {
            transform.inputPrefixOp.pop();
        }
        if (transformSpec.outputPrefix) {
            transform.outputPrefixOp.pop();
        }
    };
    
    fluid.defaults("fluid.model.transform.prefixApplier", {
        gradeNames: ["fluid.transformFunction"]
    });
    
    // unsupported, NON-API function
    fluid.model.makePathStack = function (transform, prefixName) {
        var stack = transform[prefixName + "Stack"] = [];
        transform[prefixName] = "";
        return {
            push: function (prefix) {
                var newPath = fluid.model.composePaths(transform[prefixName], prefix);
                stack.push(transform[prefixName]);
                transform[prefixName] = newPath;
            },
            pop: function () {
                transform[prefixName] = stack.pop();
            }
        };
    };
    
    // unsupported, NON-API function
    fluid.model.transform.expandTransform = function (transformSpec, transform) {
        var typeName = transformSpec.type;
        if (!typeName) {
            fluid.fail("Transformation record is missing a type name: ", transformSpec);
        }
        if (typeName.indexOf(".") === -1) {
            typeName = "fluid.transforms." + typeName;
        }
        var transformFn = fluid.getGlobalValue(typeName);
        var expdef = fluid.defaults(typeName);
        if (typeof(transformFn) !== "function") {
            fluid.fail("Transformation record specifies transformation function with name " + 
                transformSpec.type + " which is not a function - ", transformFn);
        }
        if (!fluid.hasGrade(expdef, "fluid.transformFunction")) {
            // If no suitable grade is set up, assume that it is intended to be used as a standardTransformFunction
            expdef = fluid.defaults("fluid.standardTransformFunction");
        }
        var transformArgs = [transformSpec, transform];
        if (fluid.hasGrade(expdef, "fluid.standardInputTransformFunction")) {
            if (transformSpec.input !== undefined) { 
                transformSpec.value = transformSpec.input; // alias input and value
            }
            var expanded = fluid.model.transform.getValue(transformSpec.inputPath, transformSpec.value, transform);
            transformArgs.unshift(expanded);
        } else if (fluid.hasGrade(expdef, "fluid.multiInputTransformFunction")) {
            var inputs = {};
            fluid.each(expdef.inputVariables, function (v, k) {
                var input = fluid.model.transform.getValue(transformSpec[k + "Path"], transformSpec[k], transform);
                inputs[k] = (input !== undefined) ? input : v; // if no match, assign default
            });
            transformArgs.unshift(inputs);
        }
        var transformed = transformFn.apply(null, transformArgs);
        if (fluid.hasGrade(expdef, "fluid.standardOutputTransformFunction")) {
            transformed = fluid.model.transform.setValue(transformSpec.outputPath, transformed, transform, transformSpec.merge);
        }
        return transformed;
    };
    
    // unsupported, NON-API function    
    fluid.model.transform.expandWildcards = function (transform, source) {
        fluid.each(source, function (value, key) {
            var q = transform.queuedTransforms;
            transform.pathOp.push(fluid.pathUtil.escapeSegment(key.toString()));
            for (var i = 0; i < q.length; ++i) {
                if (fluid.pathUtil.matchPath(q[i].matchPath, transform.path, true)) {
                    var esCopy = fluid.copy(q[i].transformSpec);
                    if (esCopy.inputPath === undefined || fluid.model.transform.hasWildcard(esCopy.inputPath)) {
                        esCopy.inputPath = "";
                    }
                    // TODO: allow some kind of interpolation for output path
                    transform.inputPrefixOp.push(transform.path);
                    transform.outputPrefixOp.push(transform.path);
                    fluid.model.transform.expandTransform(esCopy, transform);
                    transform.outputPrefixOp.pop();
                    transform.inputPrefixOp.pop();
                }
            }
            if (!fluid.isPrimitive(value)) {
                fluid.model.transform.expandWildcards(transform, value);
            }
            transform.pathOp.pop();
        });
    };
    
    // unsupported, NON-API function   
    fluid.model.transform.hasWildcard = function (path) {
        return typeof(path) === "string" && path.indexOf("*") !== -1;
    };
    
    // unsupported, NON-API function
    fluid.model.transform.maybePushWildcard = function (transformSpec, transform) {
        var hw = fluid.model.transform.hasWildcard;
        var matchPath;
        if (hw(transformSpec.inputPath)) {
            matchPath = fluid.model.composePaths(transform.inputPrefix, transformSpec.inputPath);
        }
        else if (hw(transform.outputPrefix) || hw(transformSpec.outputPath)) {
            matchPath = fluid.model.composePaths(transform.outputPrefix, transformSpec.outputPath);
        }
                         
        if (matchPath) {
            transform.queuedTransforms.push({transformSpec: transformSpec, outputPrefix: transform.outputPrefix, inputPrefix: transform.inputPrefix, matchPath: matchPath});
            return true;
        }
        return false;
    };
    
    fluid.model.sortByKeyLength = function (inObject) {
        var keys = fluid.keys(inObject);
        return keys.sort(fluid.compareStringLength(true));
    };
    
    // Three handler functions operating the (currently) three different processing modes
    // unsupported, NON-API function
    fluid.model.transform.handleExpandTransform = function (transformSpec, transform) {
        if (fluid.model.transform.maybePushWildcard(transformSpec, transform)) {
            return;
        }
        else {
            return fluid.model.transform.expandTransform(transformSpec, transform);
        }
    };
    // unsupported, NON-API function
    fluid.model.transform.handleInvertTransform = function (transformSpec, transform, expdef) {
        var invertor = expdef.invertConfiguration;
        if (invertor) {
            var inverted = fluid.invokeGlobalFunction(invertor, [transformSpec, transform]);
            transform.inverted.push(inverted);
        }
    };
    
    // unsupported, NON-API function
    fluid.model.transform.handlerCollectTransform = function (transformSpec, transform, expdef) {
        var standardInput = fluid.hasGrade(expdef, "fluid.standardInputTransformFunction");
        var multiInput = fluid.hasGrade(expdef, "fluid.multiInputTransformFunction");

        if (standardInput) {
            fluid.model.transform.accumulateStandardInputPath("input", transformSpec, transform, transform.inputPaths);
        } else if (multiInput) {
            fluid.model.transform.accumulateMultiInputPaths(expdef.inputVariables, transformSpec, transform, transform.inputPaths);
        } else {
            var collector = expdef.collectInputPaths;
            if (collector) {
                var collected = fluid.makeArray(fluid.invokeGlobalFunction(collector, [transformSpec, transform]));
                transform.inputPaths = transform.inputPaths.concat(collected);
            }
        }
    };
    
    // unsupported, NON-API function
    fluid.model.transform.expandValue = function (rule, transform) {
        if (typeof(rule) === "string") {
            rule = fluid.model.transform.pathToRule(rule);
        }
        // special dispensation to allow "value" at top level
        // TODO: Proper escaping rules
        else if (rule.value && transform.outputPrefix !== "") {
            rule = fluid.model.transform.valueToRule(rule.value);
        }
        var togo;
        if (rule.transform) {
            var transforms = fluid.makeArray(rule.transform);
            for (var i = 0; i < transforms.length; ++i) {
                var transformSpec = transforms[i];
                var expdef = fluid.defaults(transformSpec.type);
                var returned = transform.transformHandler(transformSpec, transform, expdef);
                if (returned !== undefined) {
                    togo = returned;
                }
            }
        }
        fluid.each(rule, function (value, key) {
            if (key !== "transform") {
                transform.outputPrefixOp.push(key);
                // TODO: Note that result by convention is discarded otherwise value transforms will cascade in a faulty way 
                var result = transform.expand(value, transform); 
                transform.outputPrefixOp.pop();
            }
        });
        return togo;
    };
    
    // unsupported, NON-API function
    fluid.model.transform.makeTransform = function (transform, handleFn, transformFn) {
        transformFn = transformFn || fluid.model.transform.expandValue;
        transform.expand = function (rules) {
            return transformFn(rules, transform);
        };
        transform.outputPrefixOp = fluid.model.makePathStack(transform, "outputPrefix");
        transform.inputPrefixOp = fluid.model.makePathStack(transform, "inputPrefix");
        transform.transformHandler = handleFn;
    };
    
    fluid.model.transform.invertConfiguration = function (rules) {
        var transform = {
            inverted: []
        };
        fluid.model.transform.makeTransform(transform, fluid.model.transform.handleInvertTransform);
        transform.expand(rules);
        return {
            transform: transform.inverted
        };
    };
    
    fluid.model.transform.collectInputPaths = function (rules) {
        var transform = {
            inputPaths: []
        };
        fluid.model.transform.makeTransform(transform, fluid.model.transform.handlerCollectTransform);
        transform.expand(rules);
        return transform.inputPaths;        
    };
    
    // unsupported, NON-API function
    fluid.model.transform.flatSchemaStrategy = function (flatSchema) {
        var keys = fluid.model.sortByKeyLength(flatSchema);
        return function (root, segment, index, segs) {
            var path = fluid.path.apply(null, segs.slice(0, index));
          // TODO: clearly this implementation could be much more efficient
            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                if (fluid.pathUtil.matchPath(key, path, true) !== null) {
                    return flatSchema[key];
                }
            }
        };
    };
    
    // unsupported, NON-API function
    fluid.model.transform.defaultSchemaValue = function (schemaValue) {
        var type = fluid.isPrimitive(schemaValue) ? schemaValue : schemaValue.type;
        return type === "array" ? [] : {};
    };
    
    // unsupported, NON-API function
    fluid.model.transform.isomorphicSchemaStrategy = function (source, getConfig) { 
        return function (root, segment, index, segs) {
            var existing = fluid.get(source, segs.slice(0, index), getConfig);
            return fluid.isArrayable(existing) ? "array" : "object";
        };
    };
    
    // unsupported, NON-API function
    fluid.model.transform.decodeStrategy = function (source, options, getConfig) {
        if (options.isomorphic) {
            return fluid.model.transform.isomorphicSchemaStrategy(source, getConfig);
        }
        else if (options.flatSchema) {
            return fluid.model.transform.flatSchemaStrategy(options.flatSchema, getConfig);
        }
    };
    
    // unsupported, NON-API function
    fluid.model.transform.schemaToCreatorStrategy = function (strategy) {
        return function (root, segment, index, segs) {
            if (root[segment] === undefined) {
                var schemaValue = strategy(root, segment, index, segs); 
                return root[segment] = fluid.model.transform.defaultSchemaValue(schemaValue);
            }
        };  
    };
    
    /** Transforms a model by a sequence of rules. Parameters as for fluid.model.transform,
     * only with an array accepted for "rules"
     */
    fluid.model.transform.sequence = function (source, rules, options) {
        for (var i = 0; i < rules.length; ++i) {
            source = fluid.model.transform(source, rules[i], options);
        }
        return source;
    };
    
    fluid.model.compareByPathLength = function (changea, changeb) {
        var pdiff = changea.path.length - changeb.path.length; 
        return pdiff === 0 ? changea.sequence - changeb.sequence : pdiff;
    };
    
   /** Fires an accumulated set of change requests in increasing order of target pathlength
     */
    fluid.model.fireSortedChanges = function (changes, applier) {
        changes.sort(fluid.model.compareByPathLength);
        fluid.requestChanges(applier, changes);  
    };
    
    /**
     * Transforms a model based on a specified expansion rules objects.
     * Rules objects take the form of:
     *   {
     *       "target.path": "value.el.path" || {
     *          transform: {
     *              type: "transform.function.path",
     *               ...
     *           }
     *       }
     *   }
     *
     * @param {Object} source the model to transform
     * @param {Object} rules a rules object containing instructions on how to transform the model
     * @param {Object} options a set of rules governing the transformations. At present this may contain
     * the values <code>isomorphic: true</code> indicating that the output model is to be governed by the
     * same schema found in the input model, or <code>flatSchema</code> holding a flat schema object which 
     * consists of a hash of EL path specifications with wildcards, to the values "array"/"object" defining
     * the schema to be used to construct missing trunk values.
     */
    fluid.model.transformWithRules = function (source, rules, options) {
        options = options || {};
        
        var getConfig = fluid.model.escapedGetConfig;
        
        var schemaStrategy = fluid.model.transform.decodeStrategy(source, options, getConfig);
        var setConfig = fluid.copy(fluid.model.escapedSetConfig);
        setConfig.strategies = [fluid.model.defaultFetchStrategy, schemaStrategy ? fluid.model.transform.schemaToCreatorStrategy(schemaStrategy)
                : fluid.model.defaultCreatorStrategy];

        var transform = {
            source: source,
            target: schemaStrategy ? fluid.model.transform.defaultSchemaValue(schemaStrategy(null, "", 0, [""])) : {},
            resolverGetConfig: getConfig,
            queuedChanges: [],
            queuedTransforms: [] // TODO: This is used only by wildcard applier - explain its operation
        };
        fluid.model.transform.makeTransform(transform, fluid.model.transform.handleExpandTransform);
        transform.applier = {
            fireChangeRequest: function (changeRequest) {
                changeRequest.sequence = transform.queuedChanges.length;
                transform.queuedChanges.push(changeRequest);
            }
        };
        fluid.bindRequestChange(transform.applier);
        transform.finalApplier = fluid.makeChangeApplier(transform.target, {resolverSetConfig: setConfig});
        
        transform.expand(rules);
        if (transform.queuedTransforms.length > 0) {
            transform.typeStack = [];
            transform.pathOp = fluid.model.makePathStack(transform, "path");
            fluid.model.transform.expandWildcards(transform, source);
        }
        fluid.model.fireSortedChanges(transform.queuedChanges, transform.finalApplier);
        return transform.target;    
    };
    
    $.extend(fluid.model.transformWithRules, fluid.model.transform);
    fluid.model.transform = fluid.model.transformWithRules;

    /** Utility function to produce a standard options transformation record for a single set of rules **/    
    fluid.transformOne = function (rules) {
        return {
            transformOptions: {
                transformer: "fluid.model.transformWithRules",
                config: rules
            }
        };
    };
    
    /** Utility function to produce a standard options transformation record for multiple rules to be applied in sequence **/    
    fluid.transformMany = function (rules) {
        return {
            transformOptions: {
                transformer: "fluid.model.transform.sequence",
                config: rules
            }
        };
    };
    
})(jQuery, fluid_1_5);
