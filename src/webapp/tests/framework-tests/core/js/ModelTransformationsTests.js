/*
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery, deepEqual*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
  
    fluid.registerNamespace("fluid.tests");
    
    var source = {
        cat: "meow",
        dog: null,
        gerbil: undefined,
        goat: false,
        hamster: {
            wheel: "spin"
        },
        cow: {
            grass: "chew"
        },
        sheep: [
            "baaa",
            "wooooool"
        ],
        hippo: 0,
        polar: "grrr"
    };
    var cleanSource = fluid.copy(source);
    
    jqUnit.module("Model Transformation");
    
    function testOneExpander(message, model, expander, method, expected) {
        var transformed = fluid.model.transform(model, {value: {
            expander: expander}});
        jqUnit[method].apply(null, [message, expected, transformed.value]); 
    }
    
    var valueTests = [{
        message: "A value transform should resolve the specified path.", 
        expander: {
            type: "fluid.model.transform.value", 
            inputPath: "hamster.wheel"
        }, 
        method: "assertEquals", 
        expected: source.hamster.wheel
    }, {
        message: "When the path is valid, the value option should not be returned.", 
        expander: {
            type: "fluid.model.transform.value", 
            inputPath: "hamster.wheel",
            value: "hello!"
        }, 
        method: "assertNotEquals", 
        expected: "hello!"
    }, {
        message: "When the path's value is null, the value option should not be returned.",
        expander: {
            type: "fluid.model.transform.value", 
            inputPath: "dog",
            value: "hello!"
        }, 
        method: "assertNotEquals", 
        expected: "hello!"
    }, {
        message: "When the path's value is false, the value option should not be returned.",
        expander: {
            type: "fluid.model.transform.value", 
            inputPath: "goat",
            value: "hello!"
        }, 
        method: "assertNotEquals", 
        expected: "hello!"
    }, {
        message: "When the path's value is undefined, the value option should be returned.",
        expander: {
            type: "fluid.model.transform.value", 
            inputPath: "gerbil",
            value: "hello!"
        }, 
        method: "assertEquals", 
        expected: "hello!"
    }, {
        message: "When the path's value is not specified, the value option should be returned.",
        expander: {
            type: "fluid.model.transform.value", 
            value: "toothpick"
        }, 
        method: "assertEquals", 
        expected: "toothpick"
    }, {
        message: "When the path's value is defined, the referenced value should be returned.",
        expander: {
            type: "fluid.model.transform.value", 
            inputPath: "cat",
            value: "rrrrr"
        }, 
        method: "assertEquals", 
        expected: source.cat
    }, {
        message: "Where the path is a rules object, the result should be an expanded version of it.",
        expander: {
            type: "fluid.model.transform.value", 
            value: {
               alligator: {
                   expander: {
                       type: "fluid.model.transform.value",
                       inputPath: "hamster"
                   }
               },
               tiger: {
                   expander: {
                       type: "fluid.model.transform.value",
                       inputPath: "hamster.wheel"
                   }
               }
           }
        }, 
        method: "assertDeepEq", 
        expected: {
            alligator: source.hamster,
            tiger: source.hamster.wheel
        }
    }
    ];
    
    var testOneStructure = function (tests) {
        fluid.each(tests, function(v) {
            testOneExpander(v.message, v.model || source, v.expander, v.method, v.expected);
        });
    }
    
    jqUnit.test("fluid.model.transform.value()", function () {
        testOneStructure(valueTests);
    });

    var transformToShortNames = {
        expander: {
            inputPath: "*.expander.type",
            type: "fluid.computeNickName"  
        }
    };
    
    jqUnit.test("Transform with wildcard path and short names", function () {
        var shortened = fluid.model.transform(valueTests, transformToShortNames, {isomorphic: true});
        var expected = fluid.transform(valueTests, function(config) {
             return {
                 expander: {
                     type: fluid.computeNickName(config.expander.type)
                 }
             };
        });
        jqUnit.assertDeepEq("Transformed expander types to short names", expected, shortened);
        var newConfig = $.extend(true, [], valueTests, shortened);
        testOneStructure(newConfig);
    });

    var arrayValueTests = [{
        message: "arrayValue() should box a non-array value up as one.", 
        expander: {
            type: "fluid.model.transform.arrayValue", 
            inputPath: "cat"
        }, 
        method: "assertDeepEq", 
        expected: [source.cat]
    }, {
        message: "arrayValue() should not box up an array value.", 
        expander: {
            type: "fluid.model.transform.arrayValue", 
            inputPath: "sheep"
        }, 
        method: "assertDeepEq", 
        expected: source.sheep
    }];

    jqUnit.test("fluid.model.transform.arrayValue()", function () {
        testOneStructure(arrayValueTests);
    });

    var countTests = [{
        message: "count() should return a length of 1 for a non-array value.", 
        expander: {
            type: "fluid.model.transform.count", 
            inputPath: "cat"
        }, 
        method: "assertEquals", 
        expected: 1
    }, {
        message: "count() should return the length for array values.", 
        expander: {
            type: "fluid.model.transform.count", 
            inputPath: "sheep"
        }, 
        method: "assertEquals", 
        expected: 2
    }];

    jqUnit.test("fluid.model.transform.count()", function () {
        testOneStructure(countTests);
    });
    
    var createValuePathExpanders = function (paths) {        
        return {
            values: fluid.transform(paths, function (path) {
                return {
                    expander: {
                        type: "fluid.model.transform.value",
                        inputPath: path
                    }
                };
            })
        };
    };
    
    var firstValueTests = [{
        message: "firstValue() should return the first non-undefined value in paths", 
        expander: {
            type: "fluid.model.transform.firstValue", 
            values: ["cat", "dog"]
        }, 
        method: "assertEquals", 
        expected: source.cat
    }, {
        message: "firstValue() should return the second path value when the first is undefined", 
        expander: {
            type: "fluid.model.transform.firstValue", 
            values: ["gerbil", "cat"]
        }, 
        method: "assertEquals", 
        expected: source.cat
    }, {
        message: "firstValue() should return the first path value when is false", 
        expander: {
            type: "fluid.model.transform.firstValue", 
            values: ["goat", "cat"]
        }, 
        method: "assertEquals", 
        expected: source.goat
    }, {
        message: "firstValue() should return the first path value when is null", 
        expander: {
            type: "fluid.model.transform.firstValue", 
            values: ["dog", "cat"]
        }, 
        method: "assertEquals", 
        expected: source.dog
    }, {
        message: "firstValue() should return the first path value when is 0", 
        expander: {
            type: "fluid.model.transform.firstValue", 
            values: ["hippo", "cat"]
        }, 
        method: "assertEquals", 
        expected: source.hippo
    }];
    
    jqUnit.test("fluid.model.transform.firstValue()", function () {
        testOneStructure(firstValueTests);
    });
    
    var mapperModel = {
        tracking: "focus"  
    };
    
    var mapperOptions = {
        "mouse": {
            "outputPath": "FollowMouse",
            "outputValue": true
        },
        "focus": {
            "outputPath": "FollowFocus",
            "outputValue": true
         },
        "caret": {
            "outputPath": "FollowCaret",
            "outputValue": true
        }
    };
    
    var mapperTests = {
    "simple": {
        message: "valueMapper selects focus based on path",
        model: mapperModel, 
        expander: {
            type: "fluid.model.transform.valueMapper",
            inputPath: "tracking",
            options: mapperOptions
        },
        method: "assertDeepEq",
        expected: {
            "FollowFocus": true
        }
    }, 
    "deffolt": {
        message: "valueMapper selects mouse by default",
        model: {
            tracking: "unknown-thing"
        }, 
        expander: {
            type: "fluid.model.transform.valueMapper",
            inputPath: "tracking",
            defaultInputValue: "mouse",
            options: mapperOptions
        },
        method: "assertDeepEq",
        expected: {
            "FollowMouse": true
        }
    }, 
    "nonString": {
        message: "valueMapper with default output value and non-string input value",
        model: {
            condition: true
        }, 
        expander: {
            type: "fluid.model.transform.valueMapper",
            inputPath: "condition",
            defaultOutputValue: "CATTOO",
            options: {
                "true": {
                    outputPath: "trueCATT"
                },
                "false": {
                    outputPath: "falseCATT"
                }
            }
        },
        method: "assertDeepEq",
        expected: {
            "trueCATT": "CATTOO"
        }
    }, 
    "nonString-long": {
        message: "valueMapper with default output value and non-string input value with long records",
        model: {
            condition: true
        }, 
        expander: {
            type: "fluid.model.transform.valueMapper",
            inputPath: "condition",
            defaultOutputValue: "CATTOO",
            options: [ {
                    inputValue: true,
                    outputPath: "trueCATT"
                }, {
                    inputValue: false,
                    outputPath: "falseCATT"
                }
             ]
        },
        method: "assertDeepEq",
        expected: {
            "trueCATT": "CATTOO"
        }
    },
    "unmatched-none": {
        message: "valueMapper with unmatched input value and no defaultInput",
        model: {
            condition: true
        }, 
        expander: {
            type: "fluid.model.transform.valueMapper",
            inputPath: "uncondition",
            defaultOutputValue: "CATTOO",
            defaultOutputPath: "anyCATT",
            options: [ {
                    undefinedInputValue: true,
                    undefinedOutputValue: true,
                    outputPath: "trueCATT"
                }, {
                    inputValue: true,
                    outputPath: "trueCATT"
                }, {
                    inputValue: false,
                    outputPath: "falseCATT"
                }
             ]
        },
        method: "assertDeepEq",
        expected: undefined
    }, 
    "unmatched-definite": {
        message: "valueMapper with unmatched input value mapped to definite value",
        model: {}, 
        expander: {
            type: "fluid.model.transform.valueMapper",
            inputPath: "uncondition",
            options: [ {
                    undefinedInputValue: true,
                    outputValue: "undefinedCATT",
                    outputPath: "trueCATT"
                }
             ]
        },
        method: "assertDeepEq",
        expected: {
            trueCATT: "undefinedCATT"
        }
    },
    "unmatched-undefined-short": {
        message: "valueMapper with unmatched input value mapped to undefined value with short form",
        model: {}, 
        expander: {
            type: "fluid.model.transform.valueMapper",
            inputPath: "uncondition",
            defaultOutputPath: "wouldbeCATT",
            options: {
                "undefined": {
                    undefinedOutputValue: true,
                }
            }
        },
        method: "assertDeepEq",
        expected: undefined
    },
    "unmatched-nodefaults": {
        message: "valueMapper with unmatched input value and no default or undefined values specified.",
        model: {
            display: {
                screenEnhancement: {
                    fontSize: 24
                }
            }
        },
        expander: {
            type: "fluid.model.transform.valueMapper",
            inputPath: "display.screenEnhancement.tracking",
            options: {
                "mouse": {
                    "outputValue": "centered"
                }
            }
        },
        method: "assertDeepEq",
        expected: undefined
    }
    };
    
    jqUnit.test("fluid.model.transform.valueMapper()", function () {
        testOneStructure(mapperTests);
    });
    
    var a4aFontRules = {"textFont": {
        "expander": {
            "type": "fluid.model.transform.valueMapper",
            "inputPath": "fontFace.genericFontFace",
            "_comment": "TODO: For now, this ignores the actual 'fontName' setting",
            "options": {
                "serif": "times",
                "sans serif": "verdana",
                "monospaced": "default",
                "fantasy": "default",
                "cursive": "default"
            }
        }
    }
    };
    
   fluid.tests.expandCompactRule = function (value) {
        return {
            outputValue: value,
            outputPath: ""
        };
    }
    
    jqUnit.test("valueMapper with compact value", function() {
        var source = {
            fontFace: {
                genericFontFace: "serif",
                fontName: ["Times New Roman"]
            }
        };
        var expected = {textFont: "times"};
        function testCompact(message, rules) {
            var transformed = fluid.model.transform(source, rules);
            jqUnit.assertDeepEq("valueMapper with compact value" + message, expected, transformed);
        }
                  
        testCompact(" - compact", a4aFontRules);
        var exRules = {
             "textFont.expander.options.*": {
                 expander: {
                      type: "fluid.tests.expandCompactRule"
                 }
             }, 
             "": "" // put this last to test key sorting
        };
        var expandedRules = fluid.model.transform(a4aFontRules, exRules);
        var expectedRules = fluid.copy(a4aFontRules);
        fluid.set(expectedRules, "textFont.expander.options", fluid.transform(a4aFontRules.textFont.expander.options, function (value) {
            return fluid.tests.expandCompactRule(value);
        }));
        jqUnit.assertDeepEq("Rules transformed to expanded form", expectedRules, expandedRules);
        testCompact(" - expanded", expandedRules); 
    });

    jqUnit.test("transform with custom schema", function() {
        var rules = {
            "0.0.feline": "cat"
        };
        var schema = {
            "": "array",
            "*": "array"
        };
        var expected = [
            [ {
              feline: "meow"
            } ]
            ];
        var result = fluid.model.transform(source, rules, {flatSchema: schema});
        jqUnit.assertDeepEq("Default array structure should have been created by transform", expected, result);            
    });
     
    jqUnit.test("transform with isomorphic schema and wildcards", function () {
        var gpiiSettingsResponse = [{
        "org.gnome.desktop.a11y.magnifier": {
            "settings": {
                "cross-hairs-clip": { "oldValue":  false, "newValue": true }
            }
        }
        }];
        var rules = {
            "*.*.settings.*": {
                expander: {
                    type: "value",
                    inputPath: "newValue"
                }
            }
        };
        var expected = [{
            "org.gnome.desktop.a11y.magnifier": {
                "settings": {
                    "cross-hairs-clip": true 
                }
            }
        }]
        var result = fluid.model.transform(gpiiSettingsResponse, rules, {isomorphic: true});
        jqUnit.assertDeepEq("isomorphic structure with wildcards and recursive expander", expected, result);    
    });
    
    jqUnit.test("transform with no schema, wildcards and dot-paths", function() {
         var flatterGpiiSettingsResponse = {
            "org.gnome.desktop.a11y.magnifier": {
                "settings": {
                    "cross-hairs-clip": { "oldValue":  false, "newValue": true }
                }
            }
        };
        var rules = {
            "*.settings.*": {
                expander: {
                    type: "value",
                    inputPath: "newValue"
                }
            }
        };
        var expected = {
            "org.gnome.desktop.a11y.magnifier": {
                "settings": {
                    "cross-hairs-clip": true 
                }
            }
        }
        var result = fluid.model.transform(flatterGpiiSettingsResponse, rules);
        jqUnit.assertDeepEq("wildcards, recursive expander and dot-paths", expected, result);    
    });
    
    jqUnit.test("transform with schema, wildcards AFTER dot-paths", function() {
         var modernGpiiSettingsResponse = {
            "org.gnome.desktop.a11y.magnifier": [{
                "settings": {
                    "cross-hairs-clip": { "oldValue":  false, "newValue": true }
                }
            }]
        };
        var rules = {
            "*.*.settings.*": {
                expander: {
                    type: "value",
                    inputPath: "newValue"
                }
            }
        };
        var expected = {
            "org.gnome.desktop.a11y.magnifier": [{
                "settings": {
                    "cross-hairs-clip": true 
                }
            }]
        }
        var result = fluid.model.transform(modernGpiiSettingsResponse, rules, {isomorphic: true});
        jqUnit.assertDeepEq("wildcards, recursive expander and dot-paths", expected, result);    
    });

    jqUnit.test("transform with path named value and literalValue", function() {
        var model = {
            "Magnification": 100
        };
        var transform = {
            "Magnification": {
                 expander: {
                     type: "fluid.model.transform.value",
                     inputPath: "Magnification",
                     outputPath: "value"
                 },
                 dataType: {
                     expander: {
                         type: "fluid.model.transform.literalValue",
                         value: "REG_DWORD"
                     }
                 }
             }
        };
         
        var expected = {
            "Magnification": {
                "value": 100,
                "dataType": "REG_DWORD"
            }
        };
     
        var actual = fluid.model.transform(model, transform);
     
        jqUnit.assertDeepEq("Model transformed with value", actual, expected);
    });
   
    jqUnit.test("transform with compact inputPath", function() {
        var rules = {
            feline: "cat",
            kangaroo: {
                value: "literal value"
            },
            "farm.goat": "goat",
            "farm.sheep": "sheep"
        };
        var expected = {
            feline: "meow", // prop rename
            kangaroo: "literal value",
            farm: { // Restructure
                goat: false,
                sheep: [
                    "baaa",
                    "wooooool"
                ]
            }
        };
        var result = fluid.model.transform(source, rules);
        jqUnit.assertDeepEq("The model should be transformed based on the specified rules", expected, result);
    });
    
    jqUnit.test("transform with nested farm.goat", function() {
        var rules = {
            "farm": {
                "goat": {
                    expander: {
                        type: "fluid.model.transform.value",
                        inputPath: "goat"
                    }
                }
            }
        };
        var expected = {
           farm: { // Restructure
                goat: false,
            }
        };
        var result = fluid.model.transform(source, rules);
        jqUnit.assertDeepEq("The model should be transformed based on the specified rules", expected, result);
    });
    
    jqUnit.test("invert simple transformation", function() {
        var rules = {
            farm: "goat"
        };
        var inverseRules = fluid.model.transform.invertConfiguration(rules);
        var expectedInverse = {
            expander: [{
                type: "fluid.model.transform.value",
                inputPath: "farm",
                outputPath: "goat"
            }]
        };
        jqUnit.assertDeepEq("Inverted simple rules", expectedInverse, inverseRules);
        var forward = fluid.model.transform(source, rules);
        var reverse = fluid.model.transform(forward, inverseRules);
        var modelBit = {
            goat: false
        };
        jqUnit.assertDeepEq("Recovered image of model", modelBit, reverse);
    });
    
    jqUnit.test("invert valueMapper transformation", function() {
        var rules = {
            expander: {
            type: "fluid.model.transform.valueMapper",
            inputPath: "tracking",
            options: mapperOptions
        },
        };
        var mapperModel = {
            tracking: "focus"  
        };
        
        var inverseRules = fluid.model.transform.invertConfiguration(rules);
        var expectedInverse = {
            expander: [{
                type: "fluid.model.transform.valueMapper",
                outputPath: "tracking",
                options: [{
                    inputPath: "FollowMouse",
                    inputValue: true,
                    outputValue: "mouse"
                },
                {
                    inputPath: "FollowFocus",
                    inputValue: true,
                    outputValue: "focus"
                },
                {
                    inputPath: "FollowCaret",
                    inputValue: true,
                    outputValue: "caret"
                }]
            }]
        };
        jqUnit.assertDeepEq("Inverted valueMapper", expectedInverse, inverseRules);
        var forward = fluid.model.transform(mapperModel, rules);
        var reverse = fluid.model.transform(forward, inverseRules);
        jqUnit.assertDeepEq("Perfectly inverted mapping", mapperModel, reverse);
    });
    
    jqUnit.test("invert long form valueMapper", function() {
        var cattoo = mapperTests["nonString-long"];
        var rules = {expander: cattoo.expander};
        var inverseRules = fluid.model.transform.invertConfiguration(rules);
        var expectedInverse = {
            expander: [{
                type: "fluid.model.transform.valueMapper",
                outputPath: "condition",
                options: [ {
                    outputValue: true,
                    inputValue: "CATTOO",
                    inputPath: "trueCATT"
                }, {
                    outputValue: false,
                    inputValue: "CATTOO",
                    inputPath: "falseCATT"
                }] 
            }]
        };
        jqUnit.assertDeepEq("Inverted valueMapper", expectedInverse, inverseRules);
        var forward = fluid.model.transform(cattoo.model, rules);
        var reverse = fluid.model.transform(forward, inverseRules);
        jqUnit.assertDeepEq("Perfectly inverted mapping", cattoo.model, reverse);
    });
    
    var capabilitiesTransformations = {
        "mag-factor": "display.screenEnhancement.magnification",
        "show-cross-hairs": "display.screenEnhancement.showCrosshairs",
        "mouse-tracking": {
            "expander": {
                "type": "fluid.model.transform.valueMapper",
                "inputPath": "display.screenEnhancement.tracking",
                "options": {
                    "mouse": {
                        "outputValue": "centered"
                    }
                }
            }
        }
    };
    
    jqUnit.test("collect inputPath from mixed transformation", function() {
        var paths = fluid.model.transform.collectInputPaths(capabilitiesTransformations);
        var expected = [
            "display.screenEnhancement.magnification",
            "display.screenEnhancement.showCrosshairs",
            "display.screenEnhancement.tracking"
        ];
        jqUnit.assertDeepEq("Collected input paths", expected, paths.sort());
    });
    
    jqUnit.test("fluid.model.transform()", function () {
        var rules = {
            // Rename a property
            feline: { 
                expander: {
                    type: "fluid.model.transform.value",
                    inputPath: "cat"
                }
            },

            // Use a default value
            gerbil: {
                expander: {
                    type: "fluid.model.transform.value",
                    inputPath: "gerbil",
                    value: "sold out"
                }
            },

            // Use a literal value
            kangaroo: {
                expander: {
                    type: "fluid.model.transform.value",
                    value: "literal value"
                }
            },

            // Restructuring/nesting
            "farm.goat": {                                          
                expander: {
                    type: "fluid.model.transform.value",
                    inputPath: "goat"
                }
            },
            "farm.sheep": {
                expander: {
                    type: "fluid.model.transform.value",
                    inputPath: "sheep"
                }
            },

            // First value
            "bear": {
                expander: {
                    type: "fluid.model.transform.firstValue",
                    values: [
                        {
                            expander: {
                                type: "fluid.model.transform.value",
                                inputPath: "grizzly"
                            }
                        },
                        {
                            expander: {
                                type: "fluid.model.transform.value",
                                inputPath: "polar"
                            }
                        }
                    ]
                }
            }
        };

        var expected = {
            feline: "meow", // prop rename
            gerbil: "sold out", // default value
            kangaroo: "literal value",
            farm: { // Restructure
                goat: false,
                sheep: [
                    "baaa",
                    "wooooool"
                ]
            },
            bear: "grrr" // first value
        };
        
        var result = fluid.model.transform(source, rules);
        jqUnit.assertDeepEq("The model should transformed based on the specified rules", expected, result);
    });
    
    jqUnit.test("fluid.model.transform() with idempotent rules", function () {
        var idempotentRules = {
            wheel: {
                expander: {
                    type: "fluid.model.transform.firstValue",
                    values: [
                        {
                            expander: {
                                type: "fluid.model.transform.value",
                                inputPath: "wheel"
                            }
                        },
                        {
                            expander: {
                                type: "fluid.model.transform.value",
                                inputPath: "hamster.wheel"
                            }
                        }
                    ]
                }
            },
            "barn.cat": {
                expander: {
                    type: "fluid.model.transform.firstValue",
                    values: [
                        {
                            expander: {
                                type: "fluid.model.transform.value",
                                inputPath: "barn.cat"
                            }
                        },
                        {
                            expander: {
                                type: "fluid.model.transform.value",
                                inputPath: "cat"
                            }
                        }
                    ]
                }
            }
        };
        
        var expected = {
            wheel: "spin",
            barn: {
                cat: "meow"
            }
        };
        
        var result = fluid.model.transform(source, idempotentRules);
        
        // Test idempotency of the transform (with these particular rules).
        result = fluid.model.transform(fluid.copy(result), idempotentRules);
        jqUnit.assertDeepEq("Running the transform on the output of itself shouldn't mangle the result.",
                            expected, result);
                            
        // Test that a model that already matches the rules isn't mangled by the transform (with these particular rules).
        result = fluid.model.transform(fluid.copy(expected), idempotentRules);
        jqUnit.assertDeepEq("With the appropriate rules, a model that already matches the transformation rules should pass through successfully.",
                            expected, result);
    });
    
    jqUnit.test("fluid.model.transformWithRules() with multiple rules", function () {
        var ruleA = {
            kitten: "cat"
        };
        
        var ruleB = {
            sirius: "kitten"
        };
        
        var expected = {
            sirius: "meow"
        };
        
        var result = fluid.model.transform.sequence(source, [ruleA, ruleB]);
        jqUnit.assertDeepEq("An array of rules should cause each to be applied in sequence.", expected, result);
    });
    
    var oldOptions = {
        cat: {
            type: "farm.cat"
        },
        numFish: 2
    };
    
    var expectedDelete = {
        cat: {
            type: "farm.cat"
        }
    };
    
    var transformRules = {
        "components.cat": "cat",
        "components.fish.type": {
            expander: {
                type: "fluid.model.transform.value",
                value: "bowl.fish"
            }
        },
        "components.fish.options.quantity": "numFish",
        "food": "food"
    };
    
    var modernOptions = {
        components: {
            cat: {
                type: "farm.cat"
            },
            fish: {
                type: "bowl.fish",
                options: {
                    quantity: 2
                }
            }
        }
    };
    
    var transformFixtures = [ {
        message: "options backwards compatibility",
        rules: transformRules,
        expected: modernOptions
    }, {
        message: "root transform rules, delete and sorting reverse",
        rules: {
            expander: {
                outputPath: "numFish",
                type: "fluid.model.transform.delete",
            },
            "" : "",
        },
        expected: expectedDelete
    }, {
        message: "root transform rules, delete and sorting forward",
        rules: {
            "" : "",
            expander: {
                outputPath: "numFish",
                type: "fluid.model.transform.delete",
            }
        },
        expected: expectedDelete
    }, {
        message: "merge directive",
        rules: {
            "" : "",
            expander: {
                outputPath: "cat",
                inputPath: "",
                merge: true,
                type: "fluid.model.transform.value",
            }
        },
        expected: {
            cat: {
                type: "farm.cat",
                numFish: 2,
                cat: {
                    type: "farm.cat"
                }
            },
            numFish: 2
        }
    }
        
    ];
    
    fluid.each(transformFixtures, function (fixture) {
        jqUnit.test("fluid.model.transform(): " + fixture.message, function () {
            var result = fluid.model.transform(oldOptions, fixture.rules);
            jqUnit.assertDeepEq("Options should be transformed successfully based on the provided rules.", fixture.expected, result);
        });      
    });
    
    fluid.registerNamespace("fluid.tests.transform");
        
    fluid.defaults("fluid.tests.testTransformable", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        food: "tofu"
    });
    
    fluid.makeComponents({
        "farm.cat": "fluid.littleComponent",
        "bowl.fish": "fluid.littleComponent"
    });
    
    var checkTransformedOptions = function (that) {
        var expected = fluid.merge(null, fluid.copy(fluid.rawDefaults(that.typeName)), modernOptions);
        expected = fluid.censorKeys(expected, ["gradeNames"]);
        jqUnit.assertLeftHand("Options sucessfully transformed", expected, that.options);
    };
    
    jqUnit.test("fluid.model.transform applied automatically to component options, without IoC", function () {
        var options = fluid.copy(oldOptions);
        options.transformOptions = {
            transformer: "fluid.model.transform",
            config: transformRules  
        };
        var that = fluid.tests.testTransformable(options);
        checkTransformedOptions(that);
    });
    
    fluid.demands("fluid.tests.testTransformableIoC", ["fluid.tests.transform.version.old"], {
        transformOptions: {
            transformer: "fluid.model.transform",
            config: transformRules
        }
    });

    fluid.defaults("fluid.tests.transform.strategy", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });
    
    fluid.defaults("fluid.tests.testTransformableIoC", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            strategy: {
                type: "fluid.tests.transform.strategy"
            }
        }
    });
    
    fluid.defaults("fluid.tests.transform.tip", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            versionTag: {
                type: "fluid.typeFount",
                options: {
                    targetTypeName: "fluid.tests.transform.version.old"
                }  
            },
            transformable: {
                type: "fluid.tests.testTransformableIoC",
                options: oldOptions
            }  
        }
    });
    
    jqUnit.test("fluid.model.transform applied automatically to component options, with IoC", function () {
        var that = fluid.tests.transform.tip();
        checkTransformedOptions(that.transformable);
    });
})(jQuery);
