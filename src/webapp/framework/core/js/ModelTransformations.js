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
                var expanderFn = fluid.getGlobalValue(expandSpec.type);
                var expdef = fluid.defaults(expandSpec.type);
                if (!fluid.hasGrade(expdef, "fluid.transformFunction") || !expanderFn) {
                    fluid.fail("Transformation record specifies transformation function with name " + 
                       expandSpec.type + " which is not a properly configured transformation function (missing grade or definition)");
                }
                var expanderArgs = [expandSpec, expander];
                if (fluid.hasGrade(expdef, "fluid.standardInputTransformFunction")) {
                    var expanded = fluid.model.transform.getValue(expandSpec, expander);
                    expanderArgs[0] = expanded;
                    expanderArgs[2] = expandSpec;
                }
                var transformed = expanderFn.apply(null, expanderArgs);
                if (fluid.hasGrade(expdef, "fluid.standardOutputTransformFunction")) {
                    togo = fluid.model.transform.setValue(expandSpec, transformed, expander);
                }
            }
        } else {
            for (var key in rule) {
                var value = rule[key];
                fluid.model.transform.pushPrefix(key, expander);
                expander.expand(value, expander);
                fluid.model.transform.popPrefix(expander);
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
    
    fluid.model.transform.pushPrefix = function (prefix, expander) {
        var newPath = fluid.model.composePaths(expander.prefix, prefix);
        expander.prefixStack.push(expander.prefix);
        expander.prefix = newPath;
    };
    
    fluid.model.transform.popPrefix = function (expander) {
        expander.prefix = expander.prefixStack.pop();
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
            target: {},
            prefix: "",
            prefixStack: []
        };
        
        fluid.model.transform.expandValue(rules, expander);
        return expander.target;
        
    };
    
    $.extend(fluid.model.transformWithRules, fluid.model.transform);
    fluid.model.transform = fluid.model.transformWithRules;
    
})(jQuery, fluid_1_5);
