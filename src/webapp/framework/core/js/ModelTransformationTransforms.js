/*
Copyright 2010 University of Toronto
Copyright 2010-2011 OCAD University
Copyright 2013 Raising the Floor - International

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
    /**********************************
     * Standard transformer functions *
     **********************************/
        
    fluid.defaults("fluid.model.transform.value", { 
        gradeNames: "fluid.standardTransformFunction",
        invertConfiguration: "fluid.model.transform.invertValue"
    });

    fluid.model.transform.value = fluid.identity;
    
    fluid.model.transform.invertValue = function (expandSpec, expander) {
        var togo = fluid.copy(expandSpec);
        // TODO: this will not behave correctly in the face of compound "value" which contains
        // further expanders
        togo.inputPath = fluid.model.composePaths(expander.outputPrefix, expandSpec.outputPath);
        togo.outputPath = fluid.model.composePaths(expander.inputPrefix, expandSpec.inputPath);
        return togo;
    };


    fluid.defaults("fluid.model.transform.literalValue", { 
        gradeNames: "fluid.standardOutputTransformFunction"
    });

    fluid.model.transform.literalValue = function (expanderSpec) {
        return expanderSpec.value;  
    };
    

    fluid.defaults("fluid.model.transform.arrayValue", { 
        gradeNames: "fluid.standardTransformFunction"
    });
    
    fluid.model.transform.arrayValue = fluid.makeArray;


    fluid.defaults("fluid.model.transform.count", { 
        gradeNames: "fluid.standardTransformFunction"
    });
    
    fluid.model.transform.count = function (value) {
        return fluid.makeArray(value).length;
    };
    
    
    fluid.defaults("fluid.model.transform.round", { 
        gradeNames: "fluid.standardTransformFunction"
    });
    
    fluid.model.transform.round = function (value) {
        return Math.round(value);
    };
    

    fluid.defaults("fluid.model.transform.delete", { 
        gradeNames: "fluid.transformFunction"
    });

    fluid.model.transform["delete"] = function (expandSpec, expander) {
        var outputPath = fluid.model.composePaths(expander.outputPrefix, expandSpec.outputPath);
        expander.applier.requestChange(outputPath, null, "DELETE");
    };

    
    fluid.defaults("fluid.model.transform.firstValue", { 
        gradeNames: "fluid.transformFunction"
    });
    
    fluid.model.transform.firstValue = function (expandSpec, expander) {
        if (!expandSpec.values || !expandSpec.values.length) {
            fluid.fail("firstValue transformer requires an array of values at path named \"values\", supplied", expandSpec);
        }
        for (var i = 0; i < expandSpec.values.length; i++) {
            var value = expandSpec.values[i];
            // TODO: problem here - all of these expanders will have their side-effects (setValue) even if only one is chosen 
            var expanded = expander.expand(value);
            if (expanded !== undefined) {
                return expanded;
            }
        }
    };
    
     
    fluid.defaults("fluid.model.transform.scaleValue", {
        gradeNames: [ "fluid.multiInputTransformFunction", "fluid.standardOutputTransformFunction" ],
        inputVariables: { 
            value: null, 
            factor: 1,
            offset: 0
        }
    });

    /* simple linear transformation */
    fluid.model.transform.scaleValue = function (inputs, expandSpec, expander) {        
        if (typeof(inputs.value) !== "number" || typeof(inputs.factor) !== "number" || typeof(inputs.offset) !== "number") {
            return undefined;
        }
        return inputs.value * inputs.factor + inputs.offset;
    };


    fluid.defaults("fluid.model.transform.binaryOp", { 
        gradeNames: [ "fluid.multiInputTransformFunction", "fluid.standardOutputTransformFunction" ],
        inputVariables: {
            left: null,
            right: null
        }
    });
    
    fluid.model.transform.binaryLookup = {
        "===": function (a, b) { return a === b; },
        "!==": function (a, b) { return a !== b; },
        "<=": function (a, b) { return a <= b; },
        "<": function (a, b) { return a < b; },
        ">=": function (a, b) { return a >= b; },
        ">": function (a, b) { return a > b; },
        "+": function (a, b) { return a + b; },
        "-": function (a, b) { return a - b; },
        "*": function (a, b) { return a * b; },
        "/": function (a, b) { return a / b; },
        "%": function (a, b) { return a % b; },
        "&&": function (a, b) { return a && b; },
        "||": function (a, b) { return a || b; }
    };

    fluid.model.transform.binaryOp = function (inputs, expandSpec, expander) {
        var operator = fluid.model.transform.getValue(undefined, expandSpec.operator, expander);

        var fun = fluid.model.transform.binaryLookup[operator];
        return (fun === undefined || inputs.left === null || inputs.right === null) ? undefined : fun(inputs.left, inputs.right);
    };


    fluid.defaults("fluid.model.transform.condition", { 
        gradeNames: [ "fluid.multiInputTransformFunction", "fluid.standardOutputTransformFunction" ],
        inputVariables: {
            "true": null,
            "false": null,
            "condition": null
        }
    });
    
    fluid.model.transform.condition = function (inputs, expandSpec, expander) {
        if (inputs.condition === null) {
            return undefined;
        }

        return inputs[inputs.condition];
    };


    fluid.defaults("fluid.model.transform.valueMapper", { 
        gradeNames: ["fluid.transformFunction", "fluid.lens"],
        invertConfiguration: "fluid.model.transform.valueMapper.invert",
        collectInputPaths: "fluid.model.transform.valueMapper.collect"
    });

    // unsupported, NON-API function    
    fluid.model.transform.matchValueMapperFull = function (outerValue, expandSpec, expander) {
        var o = expandSpec.options;
        if (o.length === 0) {
            fluid.fail("valueMapper supplied empty list of options: ", expandSpec);
        }
        if (o.length === 1) {
            return 0;
        }
        var matchPower = []; 
        for (var i = 0; i < o.length; ++i) {
            var option = o[i];
            var value = fluid.firstDefined(fluid.model.transform.getValue(option.inputPath, undefined, expander),
                outerValue);
            var matchCount = fluid.model.transform.matchValue(option.undefinedInputValue ? undefined : option.inputValue, value);
            matchPower[i] = {index: i, matchCount: matchCount};
        }
        matchPower.sort(fluid.model.transform.compareMatches);
        return matchPower[0].matchCount === matchPower[1].matchCount ? -1 : matchPower[0].index; 
    };

    fluid.model.transform.valueMapper = function (expandSpec, expander) {
        if (!expandSpec.options) {
            fluid.fail("demultiplexValue requires a list or hash of options at path named \"options\", supplied ", expandSpec);
        }
        var value = fluid.model.transform.getValue(expandSpec.inputPath, undefined, expander);
        var deref = fluid.isArrayable(expandSpec.options) ? // long form with list of records    
            function (testVal) {
                var index = fluid.model.transform.matchValueMapperFull(testVal, expandSpec, expander);
                return index === -1 ? null : expandSpec.options[index];
            } : 
            function (testVal) {
                return expandSpec.options[testVal];
            };
      
        var indexed = deref(value);
        if (!indexed) {
            // if no branch matches, try again using this value - WARNING, this seriously
            // threatens invertibility
            indexed = deref(expandSpec.defaultInputValue);
        }
        if (!indexed) {
            return;
        }

        var outputPath = indexed.outputPath === undefined ? expandSpec.defaultOutputPath : indexed.outputPath;
        expander.outputPrefixOp.push(outputPath);
        var outputValue;
        if (fluid.isPrimitive(indexed)) {
            outputValue = indexed;
        } else {
            // if undefinedOutputValue is set, outputValue should be undefined
            if (indexed.undefinedOutputValue) {
                outputValue = undefined;
            } else {
                // get value from outputValue or outputValuePath. If none is found set the outputValue to be that of defaultOutputValue (or undefined)
                outputValue = fluid.model.transform.resolveParam(indexed, expander, "outputValue", undefined);
                outputValue = (outputValue === undefined) ? expandSpec.defaultOutputValue : outputValue;
            }
        }
        var togo = fluid.model.transform.setValue(undefined, outputValue, expander, expandSpec.merge);
        expander.outputPrefixOp.pop();
        return togo; 
    };
    
    fluid.model.transform.valueMapper.invert = function (expandSpec, expander) {
        var options = [];
        var togo = {
            type: "fluid.model.transform.valueMapper",
            options: options
        };
        var isArray = fluid.isArrayable(expandSpec.options);
        var findCustom = function (name) {
            return fluid.find(expandSpec.options, function (option) {
                if (option[name]) {
                    return true;
                }
            });
        };
        var anyCustomOutput = findCustom("outputPath");
        var anyCustomInput = findCustom("inputPath");
        if (!anyCustomOutput) {
            togo.inputPath = fluid.model.composePaths(expander.outputPrefix, expandSpec.outputPath);
        }
        if (!anyCustomInput) {
            togo.defaultOutputPath = fluid.model.composePaths(expander.inputPrefix, expandSpec.inputPath);
        }
        var def = fluid.firstDefined;
        fluid.each(expandSpec.options, function (option, key) {
            var outOption = {};
            var origInputValue = def(isArray ? option.inputValue : key, expandSpec.defaultInputValue);
            if (origInputValue === undefined) {
                fluid.fail("Failure inverting configuration for valueMapper - inputValue could not be resolved for record " + key + ": ", expandSpec);
            }
            outOption.outputValue = origInputValue;
            var origOutputValue = def(option.outputValue, expandSpec.defaultOutputValue);
            outOption.inputValue = fluid.model.transform.getValue(option.outputValuePath, origOutputValue, expander);
            if (anyCustomOutput) {
                outOption.inputPath = fluid.model.composePaths(expander.outputPrefix, def(option.outputPath, expandSpec.outputPath));
            }
            if (anyCustomInput) {
                outOption.outputPath = fluid.model.composePaths(expander.inputPrefix, def(option.inputPath, expandSpec.inputPath));
            }
            if (option.outputValuePath) {
                outOption.inputValuePath = option.outputValuePath;
            }
            options.push(outOption);
        });
        return togo;
    };
    
    fluid.model.transform.valueMapper.collect = function (expandSpec, expander) {
        var togo = [];
        fluid.model.transform.accumulateInputPath(expandSpec.inputPath, expander, togo);
        fluid.each(expandSpec.options, function (option) {
            fluid.model.transform.accumulateInputPath(option.inputPath, expander, togo);
        });
        return togo;
    };

    /* -------- arrayToSetMembership and setMembershipToArray ---------------- */
    
    fluid.defaults("fluid.model.transform.arrayToSetMembership", { 
        gradeNames: ["fluid.standardInputTransformFunction", "fluid.lens"],
        invertConfiguration: "fluid.model.transform.arrayToSetMembership.invert"
    });

 
    fluid.model.transform.arrayToSetMembership = function (value, expandSpec, expander) {
        var options = expandSpec.options;

        if (!value || !fluid.isArrayable(value)) {
            fluid.fail("arrayToSetMembership didn't find array at inputPath nor passed as value.", expandSpec);
        }
        if (!options) {
            fluid.fail("arrayToSetMembership requires an options block set");
        }

        if (expandSpec.presentValue === undefined) {
            expandSpec.presentValue = true;
        }
        
        if (expandSpec.missingValue === undefined) {
            expandSpec.missingValue = false;
        }

        fluid.each(options, function (outPath, key) {
            // write to output path given in options the value <presentValue> or <missingValue> depending on whether key is found in user input
            var outVal = (value.indexOf(key) !== -1) ? expandSpec.presentValue : expandSpec.missingValue;
            fluid.model.transform.setValue(outPath, outVal, expander);
        });
        // TODO: Why does this transform make no return?
    };

    fluid.model.transform.arrayToSetMembership.invert = function (expandSpec, expander) {
        var togo = fluid.copy(expandSpec);
        delete togo.inputPath;
        togo.type = "fluid.model.transform.setMembershipToArray";
        togo.outputPath = fluid.model.composePaths(expander.inputPrefix, expandSpec.inputPath);
        var newOptions = {};
        fluid.each(expandSpec.options, function (path, oldKey) {
            var newKey = fluid.model.composePaths(expander.outputPrefix, path);
            newOptions[newKey] = oldKey;
        });
        togo.options = newOptions;
        return togo;
    };

    fluid.defaults("fluid.model.transform.setMembershipToArray", { 
        gradeNames: ["fluid.standardOutputTransformFunction"]
    });

    fluid.model.transform.setMembershipToArray = function (expandSpec, expander) {
        var options = expandSpec.options;

        if (!options) {
            fluid.fail("setMembershipToArray requires an options block specified");
        }

        if (expandSpec.presentValue === undefined) {
            expandSpec.presentValue = true;
        }
        
        if (expandSpec.missingValue === undefined) {
            expandSpec.missingValue = false;
        }

        var outputArr = [];
        fluid.each(options, function (arrVal, inPath) {
            var val = fluid.model.transform.getValue(inPath, undefined, expander);
            if (val === expandSpec.presentValue) {
                outputArr.push(arrVal);
            }
        });
        return outputArr;
    };    

    /* -------- objectToArray and arrayToObject -------------------- */
    
    /**
     * Transforms the given array to an object.
     * Uses the expandSpec.options.key values from each object within the array as new keys.
     *
     * For example, with expandSpec.key = "name" and an input object like this:
     *
     * {
     *   b: [
     *     { name: b1, v: v1 },
     *     { name: b2, v: v2 }
     *   ]
     * }
     *
     * The output will be:
     * {
     *   b: {
     *     b1: {
     *       v: v1
     *     }
     *   },
     *   {
     *     b2: {
     *       v: v2
     *     }
     *   }
     * }
     */
    fluid.model.transform.applyPaths = function (operation, pathOp, paths) {
        for (var i = 0; i < paths.length; ++i) {
            if (operation === "push") {
                pathOp.push(paths[i]);
            } else {
                pathOp.pop();   
            }
        }
    };
    
    fluid.model.transform.expandInnerValues = function (inputPath, outputPath, expander, innerValues) {
        var inputPrefixOp = expander.inputPrefixOp;
        var outputPrefixOp = expander.outputPrefixOp;
        var apply = fluid.model.transform.applyPaths;
        
        apply("push", inputPrefixOp, inputPath);
        apply("push", outputPrefixOp, outputPath);
        var expanded = {};
        fluid.each(innerValues, function (innerValue) {
            var expandedInner = expander.expand(innerValue);
            $.extend(true, expanded, expandedInner);
        });
        apply("pop", outputPrefixOp, outputPath);
        apply("pop", inputPrefixOp, inputPath);
        
        return expanded;
    };


    fluid.defaults("fluid.model.transform.arrayToObject", {
        gradeNames: ["fluid.standardTransformFunction", "fluid.lens" ],
        invertConfiguration: "fluid.model.transform.arrayToObject.invertRules"
    });

    fluid.model.transform.arrayToObject = function (arr, expandSpec, expander) {
        if (expandSpec.key === undefined) {
            fluid.fail("arrayToObject requires a 'key' option.", expandSpec);
        }
        if (!fluid.isArrayable(arr)) {
            fluid.fail("arrayToObject didn't find array at inputPath.", expandSpec);
        }
        var newHash = {};
        var pivot = expandSpec.key;

        fluid.each(arr, function (v, k) {
            // check that we have a pivot entry in the object and it's a valid type:            
            var newKey = v[pivot];
            var keyType = typeof(newKey);
            if (keyType !== "string" && keyType !== "boolean" && keyType !== "number") {
                fluid.fail("arrayToObject encountered untransformable array due to missing or invalid key", v);
            }
            // use the value of the key element as key and use the remaining content as value
            var content = fluid.copy(v);
            delete content[pivot];
            // fix sub Arrays if needed:
            if (expandSpec.innerValue) {
                content = fluid.model.transform.expandInnerValues([expander.inputPrefix, expandSpec.inputPath, k.toString()], 
                    [newKey], expander, expandSpec.innerValue);
            }
            newHash[newKey] = content;
        });
        return newHash;
    };

    fluid.model.transform.arrayToObject.invertRules = function (expandSpec, expander) {
        var togo = fluid.copy(expandSpec);
        togo.type = "fluid.model.transform.objectToArray";
        togo.inputPath = fluid.model.composePaths(expander.outputPrefix, expandSpec.outputPath);
        togo.outputPath = fluid.model.composePaths(expander.inputPrefix, expandSpec.inputPath);
        // invert expanders from innerValue as well:
        // TODO: The Model Transformations framework should be capable of this, but right now the
        // issue is that we use a "private contract" to operate the "innerValue" slot. We need to
        // spend time thinking of how this should be formalised
        if (togo.innerValue) {
            var innerValue = togo.innerValue;
            for (var i = 0; i < innerValue.length; ++i) {
                innerValue[i] = fluid.model.transform.invertConfiguration(innerValue[i]);
            }            
        }
        return togo;
    };
    

    fluid.defaults("fluid.model.transform.objectToArray", {
        gradeNames: "fluid.standardTransformFunction"
    });

    /**
     * Transforms an object into array of objects.
     * This performs the inverse transform of fluid.model.transform.arrayToObject.
     */
    fluid.model.transform.objectToArray = function (hash, expandSpec, expander) {
        if (expandSpec.key === undefined) {
            fluid.fail("objectToArray requires a 'key' option.", expandSpec);
        }
        
        var newArray = [];
        var pivot = expandSpec.key;

        fluid.each(hash, function (v, k) {
            var content = {};
            content[pivot] = k;
            if (expandSpec.innerValue) {
                v = fluid.model.transform.expandInnerValues([expandSpec.inputPath, k], [expandSpec.outputPath, newArray.length.toString()], 
                    expander, expandSpec.innerValue);
            }
            $.extend(true, content, v);
            newArray.push(content);
        });
        return newArray;
    };
})(jQuery, fluid_1_5);
