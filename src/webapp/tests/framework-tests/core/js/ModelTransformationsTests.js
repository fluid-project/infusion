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
    
    var testCase = jqUnit.TestCase("Model Transformation", function () {
        source = cleanSource;
    });
    
    testCase.test("fluid.model.transform.value()", function () {    
        // Transform value with path
        var result = fluid.model.transform.value(source, {
            path: "hamster.wheel"
        });
        jqUnit.assertEquals("A value transform should resolve the specified path.", 
                            source.hamster.wheel, result);
        
        // Transform value with path and default value
        result = fluid.model.transform.value(source, {
            path: "hamster.wheel",
            value: "hello!"
        });
        
        jqUnit.assertNotEquals("When the path is valid, the value option should not be returned.", 
                               "hello!", result);
                               
        result = fluid.model.transform.value(source, {
            path: "dog",
            value: "hello!"
        });

        jqUnit.assertNotEquals("When the path's value is null, the value option should not be returned.", 
                               "hello!", result);
                              
        result = fluid.model.transform.value(source, {
            path: "goat",
            value: "hello!"
        });

        jqUnit.assertNotEquals("When the path's value is 'false', the value option should not be returned.", 
                               "hello!", result);

        result = fluid.model.transform.value(source, {
            path: "gerbil",
            value: "hello!"
        });
       
        jqUnit.assertEquals("When the path's value is undefined, the value option should be returned.", 
                            "hello!", result);
                            
        // Transform value with literal value
        result = fluid.model.transform.value(source, {
            value: "toothpick"
        });
        
        jqUnit.assertEquals("When the path's value is not specified, the value option should be returned.", 
                            "toothpick", result);

        // Transform value with path and literal value
        result = fluid.model.transform.value(source, {
            path: "cat",
            value: "rrrrr"
        });
        
        jqUnit.assertEquals("When the path's value is undefined, the value option should be returned.", 
                            source.cat, result);
        
        // Transform with rules instead of EL path
        result = fluid.model.transform.value(source, {
            value: {
                alligator: {
                    expander: {
                        type: "fluid.model.transform.value",
                        path: "hamster"
                    }
                },
                tiger: {
                    expander: {
                        type: "fluid.model.transform.value",
                        path: "hamster.wheel"
                    }
                }
            }
        }, fluid.model.transformWithRules);
        
        var expected = {
            alligator: source.hamster,
            tiger: source.hamster.wheel
        };
        
        jqUnit.assertDeepEq("Where the path is a rules object, it the result should be an expanded version of it.",
                            expected, result);
    });
    
    testCase.test("fluid.model.transform.arrayValue()", function () {
        var result = fluid.model.transform.arrayValue(source, {
            path: "cat"
        });
        
        jqUnit.assertDeepEq("arrayValue() should box a non-array value up as one.", 
                            [source.cat], result);
                            
        result = fluid.model.transform.arrayValue(source, {
            path: "sheep"
        });
        
        jqUnit.assertDeepEq("arrayValue() should not box up an array value.", 
                            source.sheep, result);
    });
    
    testCase.test("fluid.model.transform.arrayValue()", function () {
        var result = fluid.model.transform.count(source, {
            path: "cat"
        });
        
        jqUnit.assertEquals("count() should return a length of 1 for a non-array value.", 
                            1, result);
                            
        result = fluid.model.transform.count(source, {
            path: "sheep"
        });
        
        jqUnit.assertEquals("count() should return the length for array values.", 
                            2, result);
    });

    
    var createValuePathExpanders = function (paths) {
        var values = [];
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            values.push({
                expander: {
                    type: "fluid.model.transform.value",
                    path: path
                }
            });
        }
        
        return {
            values: values
        };
    };
    
    testCase.test("fluid.model.transform.firstValue()", function () {
        var result = fluid.model.transform.firstValue(source, createValuePathExpanders(["cat", "dog"]));
        jqUnit.assertEquals("firstValue() should return the first non-undefined value in paths",
                            source.cat, result);

        result = fluid.model.transform.firstValue(source, createValuePathExpanders(["gerbil", "cat"]));

        jqUnit.assertEquals("firstValue() should return the second path value when the first is undefined",
                             source.cat, result);
                            
        result = fluid.model.transform.firstValue(source, createValuePathExpanders(["goat", "cat"]));

        jqUnit.assertEquals("firstValue() should return the first path value when is false",
                            source.goat, result);
                            
        result = fluid.model.transform.firstValue(source, createValuePathExpanders(["dog", "cat"]));

        jqUnit.assertEquals("firstValue() should return the first path value when is null",
                            source.dog, result);
                            
        result = fluid.model.transform.firstValue(source, createValuePathExpanders(["hippo", "cat"]));

        jqUnit.assertEquals("firstValue() should return the first path value when is 0",
                            source.hippo, result);
    });
    
    testCase.test("fluid.model.transform.merge()", function () {        
        // Merge to simple objects via EL paths.
        var result = fluid.model.transform.merge(source, {
            left: "hamster",
            right: "cow"
        });
        
        var expected = {
            wheel: source.hamster.wheel,
            grass: source.cow.grass
        };
        
        jqUnit.assertDeepEq("Objects should be correctly merged.", expected, result);
        jqUnit.assertDeepEq("The source object should be unchanged after merging.", cleanSource, source);
        
        // Merging a non-object property should return the left-hand side.                            
        result = fluid.model.transform.merge(source, {
            left: "hamster",
            right: "cat"
        });
        jqUnit.assertEquals("If a non-object property is used to merge, the left hand side value should be returned.",
                            source.hamster, result);
                            
        // Merge two objects, one specified by an EL path and other by a sub-rules object.
        result = fluid.model.transform.merge(source, {
            left: "hamster",
            right: {
                guppy: {
                    expander: {
                        type: "fluid.model.transform.value",
                        path: "cow.grass"
                    }
                },
                minnow: {
                    expander: {
                        type: "fluid.model.transform.value",
                        path: "sheep.1"
                    }
                }
            }
        }, fluid.model.transformWithRules);
        expected = {
            wheel: source.hamster.wheel,
            guppy: source.cow.grass,
            minnow: source.sheep[1]
        };
        jqUnit.assertDeepEq("", expected, result);
  
    });
    
    testCase.test("fluid.model.transformWithRules()", function () {
        var rules = {
            // Rename a property
            feline: { 
                expander: {
                    type: "fluid.model.transform.value",
                    path: "cat"
                }
            },

            // Use a default value
            gerbil: {
                expander: {
                    type: "fluid.model.transform.value",
                    path: "gerbil",
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
                    path: "goat"
                }
            },
            "farm.sheep": {
                expander: {
                    type: "fluid.model.transform.value",
                    path: "sheep"
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
                                path: "grizzly"
                            }
                        },
                        {
                            expander: {
                                type: "fluid.model.transform.value",
                                path: "polar"
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
        
        var result = fluid.model.transformWithRules(source, rules);
        jqUnit.assertDeepEq("The model should transformed based on the specified rules", expected, result);
    });
    
    testCase.test("fluid.model.transformWithRules() with idempotent rules", function () {
        var idempotentRules = {
            wheel: {
                expander: {
                    type: "fluid.model.transform.firstValue",
                    values: [
                        {
                            expander: {
                                type: "fluid.model.transform.value",
                                path: "wheel"
                            }
                        },
                        {
                            expander: {
                                type: "fluid.model.transform.value",
                                path: "hamster.wheel"
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
                                path: "barn.cat"
                            }
                        },
                        {
                            expander: {
                                type: "fluid.model.transform.value",
                                path: "cat"
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
        
        var result = fluid.model.transformWithRules(source, idempotentRules);
        
        // Test idempotency of the transform (with these particular rules).
        result = fluid.model.transformWithRules(fluid.copy(result), idempotentRules);
        jqUnit.assertDeepEq("Running the transform on the output of itself shouldn't mangle the result.",
                            expected, result);
                            
        // Test that a model that already matches the rules isn't mangled by the transform (with these particular rules).
        result = fluid.model.transformWithRules(fluid.copy(expected), idempotentRules);
        jqUnit.assertDeepEq("With the appropriate rules, a model that already matches the transformation rules should pass through successfully.",
                            expected, result);
    });
    
    testCase.test("fluid.model.transformWithRules() with multiple rules", function () {
        var ruleA = {
            kitten: "cat"
        };
        
        var ruleB = {
            sirius: "kitten"
        };
        
        var expected = {
            sirius: "meow"
        };
        
        var result = fluid.model.transformWithRules(source, [ruleA, ruleB]);
        jqUnit.assertDeepEq("An array of rules should cause each to be applied in sequence.", expected, result);
    });
    
    var oldOptions = {
        cat: {
            type: "farm.cat"
        },
        numFish: 2
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

    var checkTransformedOptions = function (that) {
        var expected = fluid.merge(null, fluid.copy(fluid.rawDefaults(that.typeName)), modernOptions);
        fluid.testUtils.assertLeftHand("Options sucessfully transformed", expected, that.options);
    };
    
    testCase.test("fluid.model.transformWithRules(): options backwards compatibility", function () {
        var result = fluid.model.transformWithRules(oldOptions, transformRules);
        deepEqual(result, modernOptions, "Options should be transformed successfully based on the provided rules.");
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
    
    testCase.test("fluid.model.transformWithRules applied automatically to component options, without IoC", function () {
        var options = fluid.copy(oldOptions);
        options.transformOptions = {
            transformer: "fluid.model.transformWithRules",
            config: transformRules  
        };
        var that = fluid.tests.testTransformable(options);
        checkTransformedOptions(that);
    });
    
    fluid.demands("fluid.transformOptions", ["fluid.tests.testTransformableIoC", "fluid.tests.transform.version.old"], {
        options: {
            transformer: "fluid.model.transformWithRules",
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
    
    testCase.test("fluid.model.transformWithRules applied automatically to component options, with IoC", function () {
        var that = fluid.tests.transform.tip();
        checkTransformedOptions(that.transformable);
    });
})(jQuery);
