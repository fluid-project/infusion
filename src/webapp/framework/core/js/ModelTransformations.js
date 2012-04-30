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
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

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
    
    // uses the standard layout and workflow involving inputPath and outputPath
    fluid.defaults("fluid.standardTransformFunction", {
        gradeNames: ["fluid.standardInputTransformFunction", "fluid.standardOutputTransformFunction"]  
    });
    
    fluid.defaults("fluid.lens", {
        gradeNames: "fluid.transformFunction"
        // inverseLens - plan is for this method to return "inverted configuration" rather than actually
        // to perform inversion
        // TODO: harmonise with strategy used in VideoPlayer_framework.js
    });
    
    /***********************************
     * Base utilities for transformers *
     ***********************************/

    fluid.model.transform.pathToRule = function (inputPath) {
        return {
            expander: {
                type: "fluid.model.transform.value",
                inputPath: inputPath
            }
        };
    };
    
    fluid.model.transform.valueToRule = function (value) {
        return {
            expander: {
                type: "fluid.model.transform.literalValue",
                value: value
            }
        };
    };

    fluid.model.transform.getValue = function (expandSpec, expander) {
        var val;
        if (expandSpec.inputPath) {
            val = fluid.get(expander.source, expandSpec.inputPath);
        }
        if (val === undefined && expandSpec.value) {
            var toExpand = fluid.isPrimitive(expandSpec.value)? fluid.model.transform.valueToRule(expandSpec.value) : expandSpec.value;
            val = expander.expand(toExpand, expander);
        }
        return val;
    };
    
    // distinguished value which indicates that a transformation rule supplied a 
    // non-default output path, and so the user should be prevented from making use of it
    // in a compound expander definition
    fluid.model.transform.NONDEFAULT_OUTPUT_PATH_RETURN = {};
    
    fluid.model.transform.setValue = function (expandSpec, value, expander) {
        var outputPath = expander.prefix;
        // avoid crosslinking to input object - this might be controlled by a "nocopy" option in future
        var toset = fluid.copy(value); 
        if (expandSpec.outputPath) {
            outputPath = fluid.model.composePaths(outputPath, expandSpec.outputPath);
        }
        // TODO: custom resolver config here to create non-hash output model structure
        if (toset !== undefined) {
            fluid.set(expander.target, outputPath, toset);
        }
        return expandSpec.outputPath? fluid.model.transform.NONDEFAULT_OUTPUT_PATH_RETURN: toset;
    };
    
    /****************************************
     * Standard transformermation functions *
     ****************************************/
        
    fluid.model.transform.value = fluid.identity;
    
    fluid.defaults("fluid.model.transform.value", { 
        gradeNames: "fluid.standardTransformFunction"
    });
    
    fluid.model.transform.literalValue = function (expanderSpec) {
        return expanderSpec.value;  
    };
    
    fluid.defaults("fluid.model.transform.literalValue", { 
        gradeNames: "fluid.standardOutputTransformFunction"
    });
    
    fluid.model.transform.arrayValue = function (value) {
        return fluid.makeArray(value);
    };
        
    fluid.defaults("fluid.model.transform.arrayValue", { 
        gradeNames: "fluid.standardTransformFunction"
    });
     
    fluid.model.transform.count = function (value) {
        return fluid.makeArray(value).length;
    };
    
    fluid.defaults("fluid.model.transform.count", { 
        gradeNames: "fluid.standardTransformFunction"
    });
     
    fluid.model.transform.firstValue = function (expandSpec, expander) {
        if (!expandSpec.values || !expandSpec.values.length) {
            fluid.fail("firstValue transformer requires an array of values at path named \"values\", supplied", expandSpec);
        }
        for (var i = 0; i < expandSpec.values.length; i++) {
            var value = expandSpec.values[i];
            var expanded = expander.expand(value, expander);
            if (expanded !== undefined) {
                return expanded;
            }
        }
    };
    
    fluid.defaults("fluid.model.transform.firstValue", { 
        gradeNames: "fluid.standardOutputTransformFunction"
    });

    fluid.model.transform.demultiplexValue = function (value, expander, expandSpec) {
        if (!expandSpec.options) {
            fluid.fail("demultiplexValue requires a hash of options at path named \"options\", supplied ", expandSpec);
        }
        var indexed = expandSpec.options[value];
        if (!indexed) {
            indexed = expandSpec.options[expandSpec.defaultOption];
            if (!indexed) {
                fluid.fail("value ", value, " for demultiplexValue could not be looked up to an option, and no defaultOption supplied with ", expandSpec);
            }
        }
        var value = indexed.value === undefined? expandSpec.defaultValue : indexed.value;
        return fluid.model.transform.setValue(indexed, value, expander); 
    };
    
    fluid.defaults("fluid.model.transform.demultiplexValue", { 
        gradeNames: "fluid.standardInputTransformFunction"
    });
    
    fluid.model.transform.expandExpander = function (expandSpec, expander) {
        var typeName = expandSpec.type;
        if (typeName.indexOf(".") === -1) {
            typeName = "fluid.model.transform." + typeName;
        }
        var expanderFn = fluid.getGlobalValue(typeName);
        var expdef = fluid.defaults(typeName);
        if (typeof(expanderFn) !== "function") {
           fluid.fail("Transformation record specifies transformation function with name " + 
               expandSpec.type + " which is not a function - ", expanderFn);
        }
        if (!fluid.hasGrade(expdef, "fluid.transformFunction")) {
            // If no suitable grade is set up, assume that it is intended to be used as a standardTransformFunction
            expdef = fluid.defaults("fluid.standardTransformFunction");
        }
        var expanderArgs = [expandSpec, expander];
        if (fluid.hasGrade(expdef, "fluid.standardInputTransformFunction")) {
            var expanded = fluid.model.transform.getValue(expandSpec, expander);
            expanderArgs[0] = expanded;
            expanderArgs[2] = expandSpec;
        }
        var transformed = expanderFn.apply(null, expanderArgs);
        if (fluid.hasGrade(expdef, "fluid.standardOutputTransformFunction")) {
            transformed = fluid.model.transform.setValue(expandSpec, transformed, expander);
        }
        return transformed;
    };
    
    fluid.model.transform.expandValue = function (rule, expander) {
        if (typeof(rule) === "string") {
            rule = fluid.model.transform.pathToRule(rule);
        }
        // special dispensation to allow "value" at top level
        else if (rule.value && expander.prefix !== "") {
            rule = fluid.model.transform.valueToRule(rule.value);
        }
        var togo;
        if (rule.expander) {
            var expanders = fluid.makeArray(rule.expander);
            for (var i = 0; i < expanders.length; ++ i) {
                var expandSpec = expanders[i];
                if (typeof(expandSpec.inputPath) === "string" && expandSpec.inputPath.indexOf("*") !== -1) {
                    expander.queued.push({expandSpec: expandSpec, prefix: expander.prefix});
                    continue;
                }
                togo = fluid.model.transform.expandExpander(expandSpec, expander);
            }
        } else {
            for (var key in rule) {
                var value = rule[key];
                expander.prefixOp.push(key);
                expander.expand(value, expander);
                expander.prefixOp.pop();
            }
            togo = fluid.get(expander.target, expander.prefix);
        }
        return togo;
    };
    
    /** Accepts two fully escaped paths, either of which may be empty **/
    fluid.model.composePaths = function (prefix, suffix) {
        if (prefix === "" || suffix === "") {
            return prefix + suffix;
        }
        else {
            return prefix + "." + suffix;
        }
    };
    
    fluid.model.transform.makePathStack = function (expander, prefixName) {
        var stack = expander[prefixName + "Stack"];
        return {
            push: function (prefix) {
                var newPath = fluid.model.composePaths(expander[prefixName], prefix);
                stack.push(expander[prefixName]);
                expander[prefixName] = newPath;
            },
            pop: function () {
                expander[prefixName] = stack.pop();
            }
        };
    };
    
    fluid.model.transform.expandWildcards = function (expander, source) {
        fluid.each(source, function (value, key) {
            var q = expander.queued;
            expander.pathOp.push(key);
            for (var i = 0; i < q.length; ++ i) {
                var expandSpec = q[i].expandSpec;
                if (fluid.pathUtil.matchPath(expandSpec.inputPath, expander.path, true)) {
                    var esCopy = fluid.copy(expandSpec);
                    esCopy.inputPath = expander.path;
                    // TODO: allow some kind of interpolation for output path
                    esCopy.outputPath = expander.path;
                    fluid.model.transform.expandExpander(esCopy, expander);
                }
            }
            if (!fluid.isPrimitive(value)) {
                fluid.model.transform.expandWildcards(expander, value);
            }
            expander.pathOp.pop();
        });
    };
    /**
     * Transforms a model based on a specified expansion rules objects.
     * Rules objects take the form of:
     *   {
     *       "target.path": "value.el.path" || {
     *          expander: {
     *              type: "expander.function.path",
     *               ...
     *           }
     *       }
     *   }
     *
     * @param {Object} source the model to transform
     * @param {Object} rules a rules object containing instructions on how to transform the model
     */
    fluid.model.transformWithRules = function (source, rules) {

        var expander = {
            expand: fluid.model.transform.expandValue,
            source: source,
            target: fluid.freshContainer(source),
            prefix: "",
            prefixStack: [],
            queued: []
        };
        expander.prefixOp = fluid.model.transform.makePathStack(expander, "prefix");
        
        fluid.model.transform.expandValue(rules, expander);
        if (expander.queued.length > 0) {
            expander.typeStack = [];
            expander.path = "";
            expander.pathStack = [];
            expander.pathOp = fluid.model.transform.makePathStack(expander, "path");
            fluid.model.transform.expandWildcards(expander, source);
        }
        return expander.target;
        
    };
    
    $.extend(fluid.model.transformWithRules, fluid.model.transform);
    fluid.model.transform = fluid.model.transformWithRules;
    
})(jQuery, fluid_1_5);
