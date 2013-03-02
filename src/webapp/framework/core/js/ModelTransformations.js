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
        if (typeof (inputs.value) !== "number" || typeof inputs.factor !== "number" || typeof inputs.offset !== "number") {
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
    
    var binaryLookup = {
        "===": function (a, b) { return a === b },
        "!==": function (a, b) { return a !== b },
        "<=": function (a, b) { return a <= b },
        "<": function (a, b) { return a < b },
        ">=": function (a, b) { return a >= b },
        ">": function (a, b) { return a > b },
        "+": function (a, b) { return a + b },
        "-": function (a, b) { return a - b },
        "*": function (a, b) { return a * b },
        "/": function (a, b) { return a / b },
        "%": function (a, b) { return a % b },
        "&&": function (a, b) { return a && b },
        "||": function (a, b) { return a || b }
    };

    fluid.model.transform.binaryOp = function (inputs, expandSpec, expander) {
        var operator = fluid.model.transform.getValue(undefined, expandSpec.operator, expander);

        var fun = binaryLookup[operator];
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

        return (inputs.condition) ? 
            (inputs.true === null ? undefined : inputs.true) : 
            (inputs.false === null ? undefined : inputs.false);
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
            //if undefinedOutputValue is set, outputValue should be undefined
            if (indexed.undefinedOutputValue) {
                outputValue = undefined;
            } else {
                //get value from outputValue or outputValuePath. If none is found set the outputValue to be that of defaultOutputValue (or undefined)
                var outputValue = fluid.model.transform.resolveParam(expander, indexed, "outputValue", undefined);
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



})(jQuery, fluid_1_5);
