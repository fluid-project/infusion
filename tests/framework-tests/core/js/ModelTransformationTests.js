/*
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests.transforms");

    // A standard "model source" which is used in several tests
    fluid.tests.transforms.source = {
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
        polar: "grrr",
        dozen: 12,
        hundred: 100,
        halfdozen: 6,
        lots: 172,
        lt: "<",
        catsAreDecent: true,
        floatyLowy: 12.3910,
        floatyHighy: 12.52,
        floaty2: -9876.789,
        hundredInString: "100",
        floatInString: "12.52",
        floaty2InString: "-9876.789"
    };

    jqUnit.module("Model Transformation");

    fluid.tests.transforms.wrapTransform = function (transform) {
        return {
            value: {
                transform: transform
            }
        };
    };

    fluid.tests.transforms.testOneTransform = function (message, model, transform, method, expected, transformWrap) {
        if (transformWrap) {
            transform = fluid.tests.transforms.wrapTransform(transform);
        }
        var transformed = fluid.model.transform(model, transform);
        jqUnit[method].apply(null, [message, expected, (transformWrap ? transformed.value : transformed) ]);
    };

    fluid.tests.transforms.testOneInversion = function (test) {
        var inverseRules = fluid.model.transform.invertConfiguration(test.transform);
        jqUnit.assertDeepEq(test.message + " -- inverted rules", test.invertedRules, inverseRules);
        if (test.fullyInvertible) {
            var transformed = fluid.model.transform(test.expected, inverseRules);
            jqUnit.assertDeepEq(test.message + " -- result transformation with inverse", test.model, transformed);
        } else if (test.partlyInvertible) {
            var trans = fluid.model.transform(test.expected, inverseRules);
            jqUnit.assertDeepEq(test.message + " -- result transformation with inverse", test.modelAfterInversion, trans);
        }
    };

    fluid.tests.transforms.testOneStructure = function (tests, options) {
        fluid.each(tests, function (test) {
            var v = $.extend(true, {}, options, test);
            fluid.tests.transforms.testOneTransform(v.message, v.model || fluid.tests.transforms.source, v.transform, v.method, v.expected, v.transformWrap);
            if (v.invertedRules) {
                fluid.tests.transforms.testOneInversion(v);
            }
        });
    };

    fluid.tests.transforms.outputTests = [{
        message: "Value transform should implicitly output to document",
        transform: {
            "dog": {
                transform: {
                    type: "fluid.transforms.linearScale",
                    input: 3,
                    factor: 2,
                    offset: 5
                }
            }
        },
        expected: {
            dog: 11
        },
        model: {}
    }, {
        message: "A transform with outputPath should output to that path",
        transform: {
            "dog": {
                transform: {
                    type: "fluid.transforms.linearScale",
                    input: 3,
                    factor: 2,
                    offset: 5,
                    outputPath: "walk"
                }
            }
        },
        expected: {
            dog: {
                walk: 11
            }
        },
        model: {}
    }, {
        message: "Inner transforms with no outputPath returns the result for higher level transforms to do any outputting",
        transform: {
            Magnification: {
                transform: {
                    type: "fluid.transforms.round",
                    input: {
                        transform: {
                            type: "fluid.transforms.linearScale",
                            inputPath: "dozen",
                            factor: 100
                        }
                    },
                    outputPath: "value"
                },
                dataType: {
                    transform: {
                        type: "fluid.transforms.literalValue",
                        input: "REG_DWORD"
                    }
                }
            }
        },
        expected: {
            Magnification: {
                value: 1200,
                dataType: "REG_DWORD"
            }
        }
    }, {
        message: "A transform with arrays should not return any values",
        transform: {
            "dog": {
                transform: [{
                    type: "fluid.transforms.linearScale",
                    input: 3,
                    factor: 2,
                    offset: 5
                }, {
                    type: "fluid.transforms.literalValue",
                    input: "ooooops"
                }]
            }
        },
        expected: {},
        model: {}
    }, {
        message: "A transform with arrays with entries containing outputPath should output to that path, relative to the outputPath containing the transform",
        transform: {
            "dog": {
                transform: [{
                    type: "fluid.transforms.linearScale",
                    input: 3,
                    factor: 2,
                    offset: 5,
                    outputPath: "math"
                }, {
                    type: "fluid.transforms.literalValue",
                    input: "ooooops"
                }]
            }
        },
        expected: {
            dog: {
                math: 11
            }
        },
        model: {}
    }, {
        message: "An array of transformers, should output to the array entries",
        transform: {
            "dog": [
                {
                    transform: {
                        type: "fluid.transforms.linearScale",
                        input: 3,
                        factor: 2,
                        offset: 5
                    }
                }, {
                    "cat": {
                        transform: {
                            type: "fluid.transforms.literalValue",
                            input: "I'm a cat"
                        }
                    }
                }, {
                    transform: {
                        type: "fluid.transforms.literalValue",
                        input: "And I'm a squirrel",
                        outputPath: "squirrel"
                    }
                }
            ]
        },
        expected: {
            dog: [ 11, { cat: "I'm a cat"}, { "squirrel": "And I'm a squirrel"} ]
        },
        model: {}
    }, {
        message: "FLUID-5247: An array of transformers, where the new key has an escaped '.', should still output to the array entries",
        transform: {
            "labrador\\.retriever": [
                {
                    transform: {
                        type: "fluid.transforms.linearScale",
                        input: 3,
                        factor: 2,
                        offset: 5
                    }
                }, {
                    "cat": {
                        transform: {
                            type: "fluid.transforms.literalValue",
                            input: "I'm a cat"
                        }
                    }
                }, {
                    transform: {
                        type: "fluid.transforms.literalValue",
                        input: "And I'm a squirrel",
                        outputPath: "squirrel"
                    }
                }
            ]
        },
        expected: {
            "labrador.retriever": [ 11, { cat: "I'm a cat"}, { "squirrel": "And I'm a squirrel"} ]
        },
        model: {}
    }];

    jqUnit.test("fluid.transforms.outputTests()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.outputTests, {
            method: "assertDeepEq"
        });
    });


    fluid.tests.transforms.literalValueTests = [{
        message: "literalValue - basic test",
        transform: {
            outie: {
                transform: {
                    type: "fluid.transforms.literalValue",
                    input: "lazers"
                }
            }
        },
        method: "assertDeepEq",
        model: {},
        expected: {
            outie: "lazers"
        }
    }, {
        message: "literalValue - ensuring that input isn't interpreted",
        transform: {
            outie: {
                transform: {
                    type: "fluid.transforms.literalValue",
                    input: {
                        transform: {
                            type: "fluid.transforms.helloworld",
                            value: "I'm not interpreted"
                        }
                    }
                }
            }
        },
        method: "assertDeepEq",
        model: {},
        expected: {
            outie: {
                transform: {
                    type: "fluid.transforms.helloworld",
                    value: "I'm not interpreted"
                }
            }
        }
    }, {
        message: "literalValue - shorthand notation",
        transform: {
            outie: {
                "literalValue": {
                    transform: {
                        type: "fluid.transforms.helloworld",
                        value: "I'm not interpreted"
                    }
                }
            }
        },
        method: "assertDeepEq",
        model: {},
        expected: {
            outie: {
                transform: {
                    type: "fluid.transforms.helloworld",
                    value: "I'm not interpreted"
                }
            }
        }
    }];

    jqUnit.test("fluid.transforms.literalValue()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.literalValueTests);
    });

    fluid.tests.transforms.linearScaleTests = [{
        message: "linearScale - no parameters given",
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.linearScale",
                    inputPath: "dozen"
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.linearScale",
                outputPath: "dozen",
                inputPath: "value"
            }]
        },
        method: "assertDeepEq",
        model: {
            dozen: 12
        },
        expected: {
            value: 12
        },
        fullyInvertible: true
    }, {
        message: "linearScale - factor parameter only",
        model: {
            dozen: 12
        },
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.linearScale",
                    inputPath: "dozen",
                    factor: 0.25
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.linearScale",
                outputPath: "dozen",
                inputPath: "value",
                factor: 4
            }]
        },
        method: "assertDeepEq",
        expected: {
            value: 3
        },
        fullyInvertible: true
    }, {
        message: "linearScale - factor parameter and offset",
        model: {
            dozen: 12
        },
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.linearScale",
                    inputPath: "dozen",
                    factor: 0.50,
                    offset: 100
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.linearScale",
                outputPath: "dozen",
                inputPath: "value",
                factor: 2,
                offset: -200
            }]
        },
        method: "assertDeepEq",
        expected: {
            value: 106
        },
        fullyInvertible: true
    }, {
        message: "linearScale - everything by path",
        transform: {
            type: "fluid.transforms.linearScale",
            inputPath: "dozen",
            factorPath: "halfdozen",
            offsetPath: "hundred"
        },
        method: "assertEquals",
        expected: 172,
        transformWrap: true
    }];

    jqUnit.test("fluid.transforms.linearScale()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.linearScaleTests);
    });

    fluid.tests.transforms.binaryOpTests = [{
        message: "binaryOp - compound",
        transform: {
            type: "fluid.transforms.binaryOp",
            operator: "+",
            left: {
                transform: {
                    type: "fluid.transforms.binaryOp",
                    left: 3,
                    right: 3,
                    operator: "*"
                }
            },
            right: 5
        },
        expected: 14
    }, {
        message: "binaryOp - ===",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "dozen",
            operator: "===",
            right: 12
        },
        expected: true
    }, {
        message: "binaryOp - === (FLUID-5669)",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: NaN,
            operator: "===",
            right: NaN
        },
        expected: true
    }, {
        message: "binaryOp - === (FLUID-5669)",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: 0.20000000000000004,
            operator: "===",
            right: 0.2
        },
        expected: true
    }, {
        message: "binaryOp - !==",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: 100,
            operator: "!==",
            rightPath: "hundred"
        },
        expected: false
    }, {
        message: "binaryOp - !== (FLUID-5669)",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: NaN,
            operator: "!==",
            right: NaN
        },
        expected: false
    }, {
        message: "binaryOp - !== (FLUID-5669)",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: 0.20000000000000004,
            operator: "!==",
            right: 0.2
        },
        expected: false
    }, {
        message: "binaryOp - <=",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "dozen",
            operator: "<=",
            right: 13
        },
        expected: true
    }, {
        message: "binaryOp - <",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "hundred",
            operator: "<",
            rightPath: "dozen"
        },
        expected: false
    }, {
        message: "binaryOp - >=",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "dozen",
            operator: ">=",
            right: 13
        },
        expected: false
    }, {
        message: "binaryOp - >",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "hundred",
            operator: ">",
            rightPath: "dozen"
        },
        expected: true
    }, {
        message: "binaryOp - +",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "dozen",
            operator: "+",
            right: 13
        },
        expected: 25
    }, {
        message: "binaryOp - -",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "hundred",
            operator: "-",
            rightPath: "dozen"
        },
        expected: 88
    }, {
        message: "binaryOp - *",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "dozen",
            operator: "*",
            right: 13
        },
        expected: 156
    }, {
        message: "binaryOp - /",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: 96,
            operator: "/",
            rightPath: "dozen"
        },
        expected: 8
    }, {
        message: "binaryOp - %",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "hundred",
            operator: "%",
            rightPath: "dozen"
        },
        expected: 4
    }, {
        message: "binaryOp - &&",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "catsAreDecent",
            operator: "&&",
            right: false
        },
        expected: false
    }, {
        message: "binaryOp - ||",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: false,
            operator: "||",
            rightPath: "catsAreDecent"
        },
        expected: true
    }, {
        message: "binaryOp - invalid operator",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: false,
            operator: "-+",
            rightPath: "catsAreDecent"
        },
        expected: undefined
    }];

    jqUnit.test("fluid.transforms.binaryOp()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.binaryOpTests, {
            transformWrap: true,
            method: "assertEquals"
        });
    });

    fluid.tests.transforms.conditionTests = [
        {
            message: "simple condition",
            transform: {
                type: "fluid.transforms.condition",
                conditionPath: "catsAreDecent",
                "true": "it was true",
                "false": "it was false"
            },
            method: "assertEquals",
            expected: "it was true"
        }, {
            message: "truePath condition",
            transform: {
                type: "fluid.transforms.condition",
                condition: true,
                "truePath": "cow"
            },
            method: "assertDeepEq",
            expected: {
                grass: "chew"
            }
        }, {
            message: "invalid truePath",
            transform: {
                type: "fluid.transforms.condition",
                conditionPath: "catsAreDecent",
                "true": fluid.tests.transforms.source.bow
            },
            method: "assertEquals",
            expected: undefined
        }, {
            message: "invalid condition path",
            transform: {
                type: "fluid.transforms.condition",
                conditionPath: "bogusPath",
                "true": "it was true",
                "false": "it was false"
            },
            method: "assertEquals",
            expected: "it was false"
        }, {
            message: "Condition is a string - evaluating to true",
            transform: {
                type: "fluid.transforms.condition",
                condition: "foo",
                "true": "it was true",
                "false": "it was false"
            },
            method: "assertEquals",
            expected: "it was true"
        }, {
            message: "Nesting",
            transform: {
                type: "fluid.transforms.condition",
                condition: {
                    transform: {
                        type: "fluid.transforms.binaryOp",
                        left: true,
                        operator: "&&",
                        right: false
                    }
                },
                "false": {
                    transform: {
                        type: "fluid.transforms.literalValue",
                        input: "Congratulations, you are a genius",
                        outputPath: "conclusion"
                    }
                }
            },
            method: "assertDeepEq",
            expected: {
                conclusion: "Congratulations, you are a genius"
            }
        }, {
            message: "GPII-5251: Only one of the conditions should be executed",
            transform: {
                type: "fluid.transforms.condition",
                conditionPath: "catsAreDecent",
                "true": {
                    transform: {
                        type: "fluid.transforms.value",
                        outputPath: "Antranig",
                        inputPath: "cat"
                    }
                },
                "false": {
                    transform: {
                        type: "fluid.transforms.value",
                        outputPath: "Kasper",
                        inputPath: "polar"
                    }
                }
            },
            method: "assertDeepEq",
            expected: {
                "Antranig": "meow"
            }
        }
    ];

    jqUnit.test("fluid.transforms.condition()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.conditionTests, {
            transformWrap: true
        });
    });

    fluid.tests.transforms.valueTests = [
        {
            message: "A value transform should resolve the specified path.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "hamster.wheel"
            },
            method: "assertEquals",
            expected: fluid.tests.transforms.source.hamster.wheel
        }, {
            message: "When the path is valid, the value option should not be returned.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "hamster.wheel",
                input: "hello!"
            },
            method: "assertNotEquals",
            expected: "hello!"
        }, {
            message: "When the path's value is null, the value option should not be returned.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "dog",
                input: "hello!"
            },
            method: "assertNotEquals",
            expected: "hello!"
        }, {
            message: "When the path's value is false, the value option should not be returned.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "goat",
                input: "hello!"
            },
            method: "assertNotEquals",
            expected: "hello!"
        }, {
            message: "When the path's value is undefined, the value option should be returned.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "gerbil",
                input: "hello!"
            },
            method: "assertEquals",
            expected: "hello!"
        }, {
            message: "When the path's value is not specified, the value option should be returned.",
            transform: {
                type: "fluid.transforms.value",
                input: "toothpick"
            },
            method: "assertEquals",
            expected: "toothpick"
        }, {
            message: "When the path's value is defined, the referenced value should be returned.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "cat",
                input: "rrrrr"
            },
            method: "assertEquals",
            expected: fluid.tests.transforms.source.cat
        }, {
            message: "Where input is another transform, the result should be the expanded version of it.",
            transform: { // FLUID-5867: NOONE wants the original behaviour here of expanding short-form value transforms automatically
                type: "fluid.transforms.value",
                input: {
                    transform: [{
                        type: "fluid.transforms.value",
                        outputPath: "alligator",
                        input: {
                            transform: {
                                type: "fluid.transforms.value",
                                inputPath: "hamster"
                            }
                        }
                    }, {
                        type: "fluid.transforms.value",
                        outputPath: "tiger",
                        input: {
                            transform: {
                                type: "fluid.transforms.value",
                                inputPath: "hamster.wheel"
                            }
                        }
                    }]
                }
            },
            method: "assertDeepEq",
            expected: {
                alligator: fluid.tests.transforms.source.hamster,
                tiger: fluid.tests.transforms.source.hamster.wheel
            }
        }
    ];

    fluid.tests.transforms.valueTestsWithInversion = [{
        message: "Inversion of fluid.transforms.value",
        model: {
            hamster: {
                wheel: "spin"
            }
        },
        transform: {
            outie: {
                transform: {
                    type: "fluid.transforms.value",
                    inputPath: "hamster.wheel"
                }
            }
        },
        method: "assertDeepEq",
        expected: {
            outie: fluid.tests.transforms.source.hamster.wheel
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.value",
                outputPath: "hamster.wheel",
                inputPath: "outie"
            }]
        },
        fullyInvertible: true
    }];

    jqUnit.test("fluid.transforms.value()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.valueTests, {
            transformWrap: true
        });

        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.valueTestsWithInversion);
    });

    var transformToShortNames = {
        transform: {
            inputPath: "*.transform.type",
            type: "fluid.computeNickName",
            outputPath: ""
        }
    };

    jqUnit.test("Transform with wildcard path and short names", function () {
        var shortened = fluid.model.transform(fluid.tests.transforms.valueTests, transformToShortNames, {isomorphic: true});
        var expected = fluid.transform(fluid.tests.transforms.valueTests, function (config) {
            return {
                transform: {
                    type: fluid.computeNickName(config.transform.type)
                }
            };
        });
        jqUnit.assertDeepEq("Transformed transform types to short names", expected, shortened);
        var newConfig = $.extend(true, [], fluid.tests.transforms.valueTests, shortened);
        fluid.tests.transforms.testOneStructure(newConfig, {
            transformWrap: true
        });
    });

    var stringToNumberTests = [{
        message: "stringToNumber() converts integers.",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.stringToNumber",
            inputPath: "hundredInString"
        },
        method: "assertValue",
        expected: fluid.tests.transforms.source.hundred
    }, {
        message: "stringToNumber() converts float values.",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.stringToNumber",
            inputPath: "floatInString"
        },
        method: "assertValue",
        expected: fluid.tests.transforms.source.floatyHighy
    }, {
        message: "stringToNumber() converts negative float values.",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.stringToNumber",
            inputPath: "floaty2InString"
        },
        method: "assertValue",
        expected: fluid.tests.transforms.source.floaty2
    }, {
        message: "stringToNumber() doesn't convert non-number strings #2",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.stringToNumber",
            inputPath: "cat"
        },
        method: "assertEquals",
        expected: undefined
    }, {
        message: "stringToNumber() doesn't convert non-number strings",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.stringToNumber",
            inputPath: "gerbil"
        },
        method: "assertEquals",
        expected: undefined
    }];

    jqUnit.test("fluid.transforms.stringToNumber()", function () {
        fluid.tests.transforms.testOneStructure(stringToNumberTests);
    });

    var numberToStringTests = [{
        message: "numberToString() converts integers.",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "hundred"
        },
        method: "assertValue",
        expected: fluid.tests.transforms.source.hundredInString
    }, {
        message: "numberToString() converts float values.",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floatyHighy"
        },
        method: "assertValue",
        expected: fluid.tests.transforms.source.floatInString
    }, {
        message: "numberToString() converts negative float values.",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floaty2"
        },
        method: "assertValue",
        expected: fluid.tests.transforms.source.floaty2InString
    }, {
        message: "numberToString() doesnt attempt to convert non-numbers.",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "cat"
        },
        method: "assertEquals",
        expected: undefined
    }];

    jqUnit.test("fluid.transforms.numberToString()", function () {
        fluid.tests.transforms.testOneStructure(numberToStringTests);
    });

    var stringToNumberAndInverseTests = [{
        message: "stringToNumber() converts integers - with inversion.",
        model: {
            perhapsNumber: "1337"
        },
        transform: {
            outie: {
                transform: {
                    type: "fluid.transforms.stringToNumber",
                    inputPath: "perhapsNumber"
                }
            }
        },
        method: "assertDeepEq",
        expected: {
            outie: 1337
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.numberToString",
                outputPath: "perhapsNumber",
                inputPath: "outie"
            }]
        },
        fullyInvertible: true
    }, {
        message: "stringToNumber() converts integers - with inversion.",
        model: {
            perhapsNumber: "13.37"
        },
        transform: {
            outie: {
                transform: {
                    type: "fluid.transforms.stringToNumber",
                    inputPath: "perhapsNumber"
                }
            }
        },
        method: "assertDeepEq",
        expected: {
            outie: 13.37
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.numberToString",
                outputPath: "perhapsNumber",
                inputPath: "outie"
            }]
        },
        fullyInvertible: true
    }, {
        message: "numberToString() converts to string - with inversion.",
        model: {
            perhapsNumber: 1337
        },
        transform: {
            outie: {
                transform: {
                    type: "fluid.transforms.numberToString",
                    inputPath: "perhapsNumber"
                }
            }
        },
        method: "assertDeepEq",
        expected: {
            outie: "1337"
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.stringToNumber",
                outputPath: "perhapsNumber",
                inputPath: "outie"
            }]
        },
        fullyInvertible: true
    }];

    jqUnit.test("fluid.transforms.stringToNumber() <-> fluid.transforms.numberToString() inversion tests", function () {
        fluid.tests.transforms.testOneStructure(stringToNumberAndInverseTests);
    });

    var countTests = [{
        message: "count() should return a length of 1 for a non-array value.",
        transform: {
            type: "fluid.transforms.count",
            inputPath: "cat"
        },
        expected: 1
    }, {
        message: "count() should return the length for array values.",
        transform: {
            type: "fluid.transforms.count",
            inputPath: "sheep"
        },
        expected: 2
    }];

    jqUnit.test("fluid.transforms.count()", function () {
        fluid.tests.transforms.testOneStructure(countTests, {
            transformWrap: true,
            method: "assertEquals"
        });
    });

    var roundTests = [{
        message: "round() expected to return round down number",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "floatyLowy"
        },
        expected: 12
    }, {
        message: "round() expected to return round up number",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "floatyHighy"
        },
        expected: 13
    }, {
        message: "round() should round up on negative float.",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "floaty2"
        },
        expected: -9877
    }, {
        message: "round() is able to do (lacky) inverse.",
        transform: {
            outie: {
                transform: {
                    type: "fluid.transforms.round",
                    inputPath: "myin"
                }
            }
        },
        model: {
            myin: -912.50
        },
        expected: {
            outie: -912
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.identity",
                outputPath: "myin",
                inputPath: "outie"
            }]
        },
        modelAfterInversion: {
            myin: -912
        },
        partlyInvertible: true,
        transformWrap: false,
        method: "assertDeepEq"
    }];

    jqUnit.test("fluid.transforms.round()", function () {
        fluid.tests.transforms.testOneStructure(roundTests, {
            transformWrap: true,
            method: "assertEquals"
        });
    });

    fluid.tests.transforms.firstValueTests = [{
        message: "firstValue() should return the first non-undefined value in paths",
        transform: {
            type: "fluid.transforms.firstValue",
            values: ["cat", "dog"]
        },
        expected: fluid.tests.transforms.source.cat
    }, {
        message: "firstValue() should return the second path value when the first is undefined",
        transform: {
            type: "fluid.transforms.firstValue",
            values: ["gerbil", "cat"]
        },
        expected: fluid.tests.transforms.source.cat
    }, {
        message: "firstValue() should return the first path value when is false",
        transform: {
            type: "fluid.transforms.firstValue",
            values: ["goat", "cat"]
        },
        expected: fluid.tests.transforms.source.goat
    }, {
        message: "firstValue() should return the first path value when is null",
        transform: {
            type: "fluid.transforms.firstValue",
            values: ["dog", "cat"]
        },
        expected: fluid.tests.transforms.source.dog
    }, {
        message: "firstValue() should return the first path value when is 0",
        transform: {
            type: "fluid.transforms.firstValue",
            values: ["hippo", "cat"]
        },
        expected: fluid.tests.transforms.source.hippo
    }, {
        message: "firstValue() should return the first non-undefined value in paths",
        transform: {
            type: "fluid.transforms.firstValue",
            values: ["cat", "dog"],
            outputPath: "whichanimal"
        },
        expected: {
            whichanimal: fluid.tests.transforms.source.cat
        },
        method: "assertDeepEq"
    }];

    jqUnit.test("fluid.transforms.firstValue()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.firstValueTests, {
            transformWrap: true,
            method: "assertEquals"
        });
    });

    fluid.tests.transforms.mapperModel = {
        tracking: "focus"
    };

    fluid.tests.transforms.mapperOptions = {
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

    fluid.tests.transforms.mapperTests = {
        "simple": {
            message: "valueMapper selects focus based on path",
            model: fluid.tests.transforms.mapperModel,
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "tracking",
                options: fluid.tests.transforms.mapperOptions
            },
            expected: {
                "FollowFocus": true
            }
        },
        "deffolt": {
            message: "valueMapper selects mouse by default",
            model: {
                tracking: "unknown-thing"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "tracking",
                defaultInputValue: "mouse",
                options: fluid.tests.transforms.mapperOptions
            },
            expected: {
                "FollowMouse": true
            }
        },
        "nonString": {
            message: "valueMapper with default output value and non-string input value",
            model: {
                condition: true
            },
            transform: {
                type: "fluid.transforms.valueMapper",
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
            expected: {
                "trueCATT": "CATTOO"
            }
        },
        "nonString-long": {
            message: "valueMapper with default output value and non-string input value with long records",
            model: {
                condition: true
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "condition",
                defaultOutputValue: "CATTOO",
                options: [
                    {
                        inputValue: true,
                        outputPath: "trueCATT"
                    }, {
                        inputValue: false,
                        outputPath: "falseCATT"
                    }
                ]
            },
            expected: {
                "trueCATT": "CATTOO"
            }
        },
        "unmatched-none": {
            message: "valueMapper with undefined input value and no defaultInput",
            model: {},
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "uncondition",
                defaultOutputValue: "CATTOO",
                defaultOutputPath: "anyCATT",
                options: [
                    {
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
            expected: undefined
        },
        "unmatched-definite": {
            message: "valueMapper with undefined input value mapped to definite value",
            model: {},
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "uncondition",
                options: [
                    {
                        undefinedInputValue: true,
                        outputValue: "undefinedCATT",
                        outputPath: "trueCATT"
                    }
                ]
            },
            expected: {
                trueCATT: "undefinedCATT"
            }
        },
        "unmatched-undefined-short": {
            message: "valueMapper with undefined input value mapped to undefined value with short form",
            model: {},
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "uncondition",
                defaultOutputPath: "wouldbeCATT",
                options: {
                    "undefined": {
                        undefinedOutputValue: true
                    }
                }
            },
            expected: undefined
        },
        "unmatched-defaultOutpath": {
            message: "valueMapper with defaultOutputPath",
            model: {
                foo: "bar"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "foo",
                defaultOutputPath: "stupidCATT",
                options: {
                    bar: {
                        outputValue: "it works"
                    }
                }
            },
            expected: {
                stupidCATT: "it works"
            }
        },
        "unmatched-nodefaults": {
            message: "valueMapper with undefined and unmatched input value",
            model: {
                display: {
                    screenEnhancement: {
                        fontSize: 24
                    }
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "display.screenEnhancement.tracking",
                options: {
                    "mouse": {
                        "outputValue": "centered"
                    }
                }
            },
            expected: undefined
        },
        "nested-mapping": {
            message: "valueMapper with nested transforms",
            model: {
                animals: {
                    mammals: {
                        elephant: "big",
                        mouse: "small"
                    }
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "animals.mammals.elephant",
                options: {
                    big: {
                        outputPath: "correct",
                        outputValue: {
                            transform: {
                                type: "fluid.transforms.literalValue",
                                input: "Elephant - Brilliant work, it is indeed big",
                                outputPath: "path"
                            }
                        }
                    }
                }
            },
            expected: {
                correct: {
                    path: "Elephant - Brilliant work, it is indeed big"
                }
            }
        },
        "valueMapping-multiout": {
            message: "valueMapper with multiple outputs to different paths",
            model: {
                screenReaderTTSEnabled: false
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "screenReaderTTSEnabled",
                options: {
                    "false": {
                        outputValue: {
                            transform: [
                                {
                                    type: "fluid.transforms.literalValue",
                                    input: "silence",
                                    outputPath: "speech.synth"
                                },
                                {
                                    type: "fluid.transforms.literalValue",
                                    input: "Microsoft Sound Mapper",
                                    outputPath: "speech.outputDevice"
                                }
                            ]
                        }
                    }
                }
            },
            expected: {
                speech: {
                    synth: "silence",
                    outputDevice: "Microsoft Sound Mapper"
                }
            }
        }
    };

    jqUnit.test("fluid.transforms.valueMapper()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.mapperTests, {
            transformWrap: true,
            method: "assertDeepEq"
        });
    });

    fluid.tests.transforms.a4aFontRules = {
        "textFont": {
            "transform": {
                "type": "fluid.transforms.valueMapper",
                "inputPath": "fontFace.genericFontFace",
                "_comment": "TODO: For now, this ignores the actual \"fontName\" setting",
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

    fluid.tests.transforms.expandCompactRule = function (value) {
        return {
            outputValue: value
        };
    };

    jqUnit.test("valueMapper with compact value", function () {
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

        testCompact(" - compact", fluid.tests.transforms.a4aFontRules);
        var exRules = {
            "textFont.transform.options.*": {
                transform: {
                    type: "fluid.tests.transforms.expandCompactRule"
                }
            },
            "": "" // put this last to test key sorting
        };
        var expandedRules = fluid.model.transform(fluid.tests.transforms.a4aFontRules, exRules);
        var expectedRules = fluid.copy(fluid.tests.transforms.a4aFontRules);
        fluid.set(expectedRules, "textFont.transform.options", fluid.transform(fluid.tests.transforms.a4aFontRules.textFont.transform.options, function (value) {
            return fluid.tests.transforms.expandCompactRule(value);
        }));
        jqUnit.assertDeepEq("Rules transformed to expanded form", expectedRules, expandedRules);
        testCompact(" - expanded", expandedRules);
    });

    fluid.tests.transforms.metadataRules = {
        type: "fluid.transforms.valueMapper",
        defaultInputValue: true,
        defaultOutputPath: "soundHazard",
        options: [
            {
                inputPath: "flashing",
                outputValue: "yes"
            }, {
                inputPath: "noFlashingHazard",
                outputValue: "no"
            }, {
                inputPath: "",
                inputValue: {
                    "flashing": false,
                    "noFlashingHazard": false
                },
                outputValue: "unknown"
            }
        ]
    };

    fluid.tests.transforms.inverseMetadataRules =
        fluid.model.transform.invertConfiguration({
            "": {
                transform: fluid.tests.transforms.metadataRules
            }
        });

    fluid.tests.transforms.metadataCases = {
        "forward flashing": {
            message: "valueMapper selects primitive option 1",
            model: {
                flashing: true
            },
            transform: fluid.tests.transforms.metadataRules,
            expected: {
                "soundHazard": "yes"
            }
        },
        "forward noFlashing": {
            message: "valueMapper selects primitive option 2",
            model: {
                noFlashingHazard: true
            },
            transform: fluid.tests.transforms.metadataRules,
            expected: {
                "soundHazard": "no"
            }
        },
        "forward unknown": {
            message: "valueMapper selects compound option 3",
            model: {
                flashing: false,
                noFlashingHazard: false
            },
            transform: fluid.tests.transforms.metadataRules,
            expected: {
                "soundHazard": "unknown"
            }
        }
        // TODO: It was probably expected that there was particular behaviour with respect to partial matches of the
        // compund input value here - we would need to write further test cases using the new "partialMatches" option
    };

    fluid.tests.transforms.inverseMetadataCases = {
        "backward flashing": {
            message: "valueMapper inverts to primitive 1",
            model: {
                "soundHazard": "yes"
            },
            transform: fluid.tests.transforms.inverseMetadataRules,
            expected: {
                flashing: true
            }
        },
        "backward noFlashing": {
            message: "valueMapper inverts to primitive 2",
            model: {
                "soundHazard": "no"
            },
            transform: fluid.tests.transforms.inverseMetadataRules,
            expected: {
                noFlashingHazard: true
            }
        },
        "backward unknown": {
            message: "valueMapper inverts to compound option 3",
            model: {
                "soundHazard": "unknown"
            },
            transform: fluid.tests.transforms.inverseMetadataRules,
            expected: {
                flashing: false,
                noFlashingHazard: false
            }
        }
    };

    jqUnit.test("valueMapper with compound values - FLUID-5479 metadata editing example", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.metadataCases, {
            transformWrap: true,
            method: "assertDeepEq"
        });
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.inverseMetadataCases, {
            method: "assertDeepEq"
        });
    });

    jqUnit.test("transform with custom schema", function () {
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
        var result = fluid.model.transform(fluid.tests.transforms.source, rules, {flatSchema: schema});
        jqUnit.assertDeepEq("Default array structure should have been created by transform", expected, result);
    });

    jqUnit.test("transform with custom schema and collected schema options for flatSchema", function () {
        var rules = {
            "0.0.feline": [
                {
                    transform: {
                        type: "fluid.transforms.linearScale",
                        input: 3,
                        factor: 2,
                        offset: 5
                    }
                }, {
                    "cat": {
                        transform: {
                            type: "fluid.transforms.literalValue",
                            input: "I'm a cat"
                        }
                    }
                }, {
                    transform: {
                        type: "fluid.transforms.literalValue",
                        input: "And I'm a squirrel",
                        outputPath: "squirrel"
                    }
                }
            ]
        };
        var schema = {
            "": "array",
            "*": "array"
        };
        var expected = [
            [ {
                feline: [ 11, { cat: "I'm a cat"}, { "squirrel": "And I'm a squirrel"} ]
            } ]
        ];
        var result = fluid.model.transform(fluid.tests.transforms.source, rules, {flatSchema: schema});
        jqUnit.assertDeepEq("Array structure should have been created by transform", expected, result);
    });

    // TODO: wildcards are not used in practice, have bugs and limitations (FLUID-5510, etc)
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
                transform: {
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
        }];
        var result = fluid.model.transform(gpiiSettingsResponse, rules, {isomorphic: true});
        jqUnit.assertDeepEq("isomorphic structure with wildcards and recursive transform", expected, result);
    });

    jqUnit.test("transform with no schema, wildcards and dot-paths", function () {
        var flatterGpiiSettingsResponse = {
            "org.gnome.desktop.a11y.magnifier": {
                "settings": {
                    "cross-hairs-clip": { "oldValue":  false, "newValue": true }
                }
            }
        };
        var rules = {
            "*.settings.*": {
                transform: {
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
        };
        var result = fluid.model.transform(flatterGpiiSettingsResponse, rules);
        jqUnit.assertDeepEq("wildcards, recursive transform and dot-paths", expected, result);
    });

    jqUnit.test("transform with schema, wildcards AFTER dot-paths", function () {
        var modernGpiiSettingsResponse = {
            "org.gnome.desktop.a11y.magnifier": [{
                "settings": {
                    "cross-hairs-clip": { "oldValue":  false, "newValue": true }
                }
            }]
        };
        var rules = {
            "*.*.settings.*": {
                transform: {
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
        };
        var result = fluid.model.transform(modernGpiiSettingsResponse, rules, {isomorphic: true});
        jqUnit.assertDeepEq("wildcards, recursive transform and dot-paths", expected, result);
    });

    jqUnit.test("Test of keyword literalValue as key and outputting 'literalValue' to output document", function () {
        var model = {
            "Magnification": 100
        };
        var transform = {
            "Magnification": {
                transform: {
                    type: "fluid.transforms.value",
                    inputPath: "Magnification",
                    outputPath: "literalValue"
                },
                "dataType": {
                    "literalValue": "REG_DWORD"
                }
            }
        };

        var expected = {
            "Magnification": {
                "literalValue": 100,
                "dataType": "REG_DWORD"
            }
        };

        var actual = fluid.model.transform(model, transform);

        jqUnit.assertDeepEq("Model transformed with value", expected, actual);
    });

    jqUnit.test("transform with compact inputPath", function () {
        var rules = {
            feline: "cat",
            kangaroo: {
                literalValue: "literal value"
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
        var result = fluid.model.transform(fluid.tests.transforms.source, rules);
        jqUnit.assertDeepEq("The model should be transformed based on the specified rules", expected, result);
    });

    jqUnit.test("transform with nested farm.goat", function () {
        var rules = {
            "farm": {
                "goat": {
                    transform: {
                        type: "fluid.transforms.value",
                        inputPath: "goat"
                    }
                }
            }
        };
        var expected = {
            farm: { // Restructure
                goat: false
            }
        };
        var result = fluid.model.transform(fluid.tests.transforms.source, rules);
        jqUnit.assertDeepEq("The model should be transformed based on the specified rules", expected, result);
    });

    jqUnit.test("invert simple transformation", function () {
        var rules = {
            farm: "goat"
        };
        var inverseRules = fluid.model.transform.invertConfiguration(rules);
        var expectedInverse = {
            transform: [{
                type: "fluid.transforms.value",
                inputPath: "farm",
                outputPath: "goat"
            }]
        };
        jqUnit.assertDeepEq("Inverted simple rules", expectedInverse, inverseRules);
        var forward = fluid.model.transform(fluid.tests.transforms.source, rules);
        var reverse = fluid.model.transform(forward, inverseRules);
        var modelBit = {
            goat: false
        };
        jqUnit.assertDeepEq("Recovered image of model", modelBit, reverse);
    });

    jqUnit.test("invert valueMapper transformation", function () {
        var rules = {
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "tracking",
                options: fluid.tests.transforms.mapperOptions
            }
        };
        var mapperModel = {
            tracking: "focus"
        };

        var inverseRules = fluid.model.transform.invertConfiguration(rules);
        var expectedInverse = {
            transform: [{
                type: "fluid.transforms.valueMapper",
                defaultOutputPath: "tracking",
                options: [
                    {
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
                    }
                ]
            }]
        };
        jqUnit.assertDeepEq("Inverted valueMapper", expectedInverse, inverseRules);
        var forward = fluid.model.transform(mapperModel, rules);
        var reverse = fluid.model.transform(forward, inverseRules);
        jqUnit.assertDeepEq("Perfectly inverted mapping", mapperModel, reverse);
    });

    jqUnit.test("invert long form valueMapper", function () {
        var cattoo = fluid.tests.transforms.mapperTests["nonString-long"];
        var rules = {transform: cattoo.transform};
        var inverseRules = fluid.model.transform.invertConfiguration(rules);
        var expectedInverse = {
            transform: [{
                type: "fluid.transforms.valueMapper",
                defaultOutputPath: "condition",
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

    jqUnit.test("FLUID-5472: invert valueMapper to boolean values", function () {
        var model = {
            audio: true
        };

        var rules = {
            transform: {
                type: "fluid.transforms.valueMapper",
                inputPath: "audio",
                options: [ {
                    "inputValue": true,
                    "outputPath": "audio",
                    "outputValue": "available"
                },
                {
                    "inputValue": false,
                    "outputPath": "audio",
                    "outputValue": "unavailable"
                }]
            }
        };

        var expectedTransformedModel = {
            audio: "available"
        };

        var transformedModel = fluid.model.transform(model, {value: rules});

        jqUnit.assertDeepEq("The model is transformed properly", expectedTransformedModel, transformedModel.value);

        var inverseRules = fluid.model.transform.invertConfiguration(rules);
        var invertedModel = fluid.model.transform(transformedModel.value, {value: inverseRules});

        jqUnit.assertDeepEq("The model is inverted properly", model, invertedModel.value);
    });


    fluid.tests.transforms.capabilitiesTransformations = {
        "mag-factor": "display.screenEnhancement.magnification",
        "show-cross-hairs": "display.screenEnhancement.showCrosshairs",
        "mouse-tracking": {
            "transform": {
                "type": "fluid.transforms.valueMapper",
                "inputPath": "display.screenEnhancement.tracking",
                "options": {
                    "mouse": {
                        "outputValue": "centered"
                    }
                }
            }
        },
        "foo-bar": {
            transform: {
                type: "fluid.transforms.value",
                input: {
                    transform: {
                        type: "fluid.transforms.value",
                        inputPath: "im.nested"
                    }
                }
            }
        }
    };

    jqUnit.test("collect inputPath from mixed transformation", function () {
        var paths = fluid.model.transform.collectInputPaths(fluid.tests.transforms.capabilitiesTransformations);
        var expected = [
            "display.screenEnhancement.magnification",
            "display.screenEnhancement.showCrosshairs",
            "display.screenEnhancement.tracking",
            "im.nested"
        ];
        jqUnit.assertDeepEq("Collected input paths", expected, paths.sort());
    });

    // FLUID-5512: valueMapper with a default output value
    fluid.tests.valueMapperWithDefaultOutputCases = {
        case1: {
            model: {
                isTooltipOpen: true,
                isDialogOpen: true
            },
            expected: {
                value: true
            }
        },
        case2: {
            model: {
                isTooltipOpen: false,
                isDialogOpen: true
            },
            expected: {
                value: false
            }
        },
        case3: {
            model: {
                isTooltipOpen: true,
                isDialogOpen: false
            },
            expected: {
                value: false
            }
        },
        case4: {
            model: {
                isTooltipOpen: false,
                isDialogOpen: false
            },
            expected: {
                value: false
            }
        },
        case5: {
            model: {
                isTooltipOpen: undefined,
                isDialogOpen: false
            },
            expected: {
                value: false
            }
        }
    };

    jqUnit.test("FLUID-5512: valueMapper with a defaulting output value", function () {
        var rules = {
            type: "fluid.transforms.valueMapper",
            inputPath: "",
            options: [{
                inputValue: {
                    "isTooltipOpen": true,
                    "isDialogOpen": true
                },
                outputValue: true
            }, { // a "match always" rule
                undefinedInputValue: true,
                partialMatches: true,
                outputValue: false
            }]
        };

        var transform = {
            value: {
                transform: rules
            }
        };

        fluid.each(fluid.tests.valueMapperWithDefaultOutputCases, function (aCase) {
            jqUnit.assertDeepEq("The transformed result is expected", aCase.expected, fluid.model.transform(aCase.model, transform));
        });
    });

    fluid.tests.transforms.multiInputTransformations = {
        transform: {
            type: "fluid.transforms.condition",
            condition: {
                transform: {
                    type: "fluid.transforms.binaryOp",
                    leftPath: "hello.world",
                    operator: "&&",
                    right: false
                }
            },
            "false": {
                transform: {
                    type: "fluid.transforms.value",
                    inputPath: "falsey.goes.here",
                    outputPath: "conclusion"
                }
            },
            truePath: "kasper.rocks"
        }
    };

    jqUnit.test("collect inputPath from multiInput transformations", function () {
        var paths = fluid.model.transform.collectInputPaths(fluid.tests.transforms.multiInputTransformations);
        var expected = [
            "falsey.goes.here",
            "hello.world",
            "kasper.rocks"
        ];
        jqUnit.assertDeepEq("Collected input paths", expected, paths.sort());
    });

    jqUnit.test("fluid.model.transform()", function () {
        var rules = {
            // Rename a property
            feline: {
                transform: {
                    type: "fluid.transforms.value",
                    inputPath: "cat"
                }
            },

            // Use a default value
            gerbil: {
                transform: {
                    type: "fluid.transforms.value",
                    inputPath: "gerbil",
                    input: "sold out"
                }
            },

            // Use a literal value
            kangaroo: {
                transform: {
                    type: "fluid.transforms.value",
                    input: "literal value"
                }
            },

            // Restructuring/nesting
            "farm.goat": {
                transform: {
                    type: "fluid.transforms.value",
                    inputPath: "goat"
                }
            },
            "farm.sheep": {
                transform: {
                    type: "fluid.transforms.value",
                    inputPath: "sheep"
                }
            },

            // First value
            "bear": {
                transform: {
                    type: "fluid.transforms.firstValue",
                    values: [
                        {
                            transform: {
                                type: "fluid.transforms.value",
                                inputPath: "grizzly"
                            }
                        },
                        {
                            transform: {
                                type: "fluid.transforms.value",
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

        var result = fluid.model.transform(fluid.tests.transforms.source, rules);
        jqUnit.assertDeepEq("The model should transformed based on the specified rules", expected, result);
    });

    jqUnit.test("fluid.model.transform() with idempotent rules", function () {
        var idempotentRules = {
            wheel: {
                transform: {
                    type: "fluid.transforms.firstValue",
                    values: [
                        {
                            transform: {
                                type: "fluid.transforms.value",
                                inputPath: "wheel"
                            }
                        },
                        {
                            transform: {
                                type: "fluid.transforms.value",
                                inputPath: "hamster.wheel"
                            }
                        }
                    ]
                }
            },
            "barn.cat": {
                transform: {
                    type: "fluid.transforms.firstValue",
                    values: [
                        {
                            transform: {
                                type: "fluid.transforms.value",
                                inputPath: "barn.cat"
                            }
                        },
                        {
                            transform: {
                                type: "fluid.transforms.value",
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

        var result = fluid.model.transform(fluid.tests.transforms.source, idempotentRules);

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

        var result = fluid.model.transform.sequence(fluid.tests.transforms.source, [ruleA, ruleB]);
        jqUnit.assertDeepEq("An array of rules should cause each to be applied in sequence.", expected, result);
    });

    fluid.tests.transforms.oldOptions = {
        cat: {
            type: "farm.cat"
        },
        numFish: 2
    };

    fluid.tests.transforms.expectedDelete = {
        cat: {
            type: "farm.cat"
        }
    };

    fluid.tests.transforms.transformRules = {
        "components.cat": "cat",
        "components.fish.type": {
            transform: {
                type: "fluid.transforms.value",
                input: "bowl.fish"
            }
        },
        "components.fish.options.quantity": "numFish",
        "food": "food"
    };

    fluid.tests.transforms.modernOptions = {
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

    fluid.tests.transforms.transformFixtures = [
        {
            message: "options backwards compatibility",
            rules: fluid.tests.transforms.transformRules,
            expected: fluid.tests.transforms.modernOptions
        }, {
            message: "root transform rules, delete and sorting reverse",
            rules: {
                transform: {
                    outputPath: "numFish",
                    type: "fluid.transforms.delete"
                },
                "" : ""
            },
            expected: fluid.tests.transforms.expectedDelete
        }, {
            message: "root transform rules, delete and sorting forward",
            rules: {
                "" : "",
                transform: {
                    outputPath: "numFish",
                    type: "fluid.transforms.delete"
                }
            },
            expected: fluid.tests.transforms.expectedDelete
        }, {
            message: "merge directive",
            rules: {
                "" : "",
                transform: {
                    outputPath: "cat",
                    inputPath: "",
                    merge: true,
                    type: "fluid.transforms.value"
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

    fluid.each(fluid.tests.transforms.transformFixtures, function (fixture) {
        jqUnit.test("fluid.model.transform(): " + fixture.message, function () {
            var result = fluid.model.transform(fluid.tests.transforms.oldOptions, fixture.rules);
            jqUnit.assertDeepEq("Options should be transformed successfully based on the provided rules.", fixture.expected, result);
        });
    });

    fluid.defaults("fluid.tests.testTransformable", {
        gradeNames: ["fluid.component"],
        food: "tofu"
    });

    fluid.makeComponents({
        "farm.cat": "fluid.component",
        "bowl.fish": "fluid.component"
    });

    fluid.tests.transforms.checkTransformedOptions = function (that) {
        var expected = fluid.merge(null, fluid.copy(fluid.rawDefaults(that.typeName)), fluid.tests.transforms.modernOptions);
        expected = fluid.censorKeys(expected, ["gradeNames"]);
        jqUnit.assertLeftHand("Options sucessfully transformed", expected, that.options);
    };

    jqUnit.test("fluid.model.transform applied automatically to component options, without IoC", function () {
        var options = fluid.copy(fluid.tests.transforms.oldOptions);
        options.transformOptions = {
            transformer: "fluid.model.transform",
            config: fluid.tests.transforms.transformRules
        };
        var that = fluid.tests.testTransformable(options);
        fluid.tests.transforms.checkTransformedOptions(that);
    });

    fluid.defaults("fluid.tests.transforms.strategy", {
        gradeNames: ["fluid.component"]
    });

    fluid.defaults("fluid.tests.testTransformableIoC", {
        gradeNames: ["fluid.component"],
        components: {
            strategy: {
                type: "fluid.tests.transforms.strategy"
            }
        }
    });

    fluid.defaults("fluid.tests.transforms.tip", {
        gradeNames: ["fluid.component"],
        distributeOptions: {
            record: {
                transformer: "fluid.model.transform",
                config: fluid.tests.transforms.transformRules
            },
            target: "{that transformable}.options.transformOptions"
        },
        components: {
            transformable: {
                type: "fluid.tests.testTransformableIoC",
                options: fluid.tests.transforms.oldOptions
            }
        }
    });

    jqUnit.test("fluid.model.transform applied automatically to component options, with IoC", function () {
        var that = fluid.tests.transforms.tip();
        fluid.tests.transforms.checkTransformedOptions(that.transformable);
    });

    fluid.tests.transforms.undefinedSingleInput = [{
        message: "FLUID-5130: non-existing path.",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.count",
            inputPath: "idontexist"
        },
        method: "assertEquals",
        expected: undefined
    }, {
        message: "FLUID-5130: input from expander that evaluates to undefined",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.count",
            input: {
                transform: {
                    type: "fluid.transforms.count",
                    inputPath: "i.dont.exist"
                }
            }
        },
        method: "assertEquals",
        expected: undefined
    }];

    jqUnit.test("Tests for undefined inputs to standardInputTransformations", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.undefinedSingleInput);
    });

    fluid.tests.transforms.fluid5703 = [{
        message: "FLUID-5703: defeat undefined input suppression with side-inputs",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.stringTemplate",
            template: "This is a %thing",
            terms: {
                thing: "CATTTE"
            }
        },
        method: "assertEquals",
        expected: "This is a CATTTE"
    }];

    jqUnit.test("Defeat undefined input issue with side-inputs", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.fluid5703);
    });

    /* --------------- arrayToObject and inverse tests -------------------- */
    fluid.tests.transforms.arrayToObjectTests = [
        {
            message: "Basic Array transformations",
            fullyInvertible: true,
            model: {
                a: {
                    c: [
                        { name: "c1", val: "vc1" },
                        { name: "c2", val: "vc2" }
                    ]
                }
            },
            transform: {
                "a.c": {
                    "transform": {
                        type: "fluid.transforms.arrayToObject",
                        inputPath: "a.c",
                        key: "name"
                    }
                }
            },
            expectedInputPaths: [
                "a.c"
            ],
            expected: {
                a: {
                    c: {
                        c1: { val: "vc1" },
                        c2: { val: "vc2" }
                    }
                }
            },
            invertedRules: {
                transform: [
                    {
                        type: "fluid.transforms.objectToArray",
                        inputPath: "a.c",
                        outputPath: "a.c",
                        key: "name"
                    }
                ]
            }
        }, {
            message: "More Complex Array transformations",
            fullyInvertible: true,
            model: {
                b: {
                    b1: "hello",
                    b2: "hello"
                },
                a: {
                    "dotted.key": [
                        { "uni.que": "u.q1", val: { first: "vc1.1", second: "vc1.2" }},
                        { "uni.que": "u.q2", val: { first: "vc2.1", second: "vc2.2" }}
                    ]
                }
            },
            transform: {
                b: "b",
                "c.dotted\\.key": {
                    "transform": {
                        type: "fluid.transforms.arrayToObject",
                        inputPath: "a.dotted\\.key",
                        key: "uni.que"
                    }
                }
            },
            expectedInputPaths: [
                "b",
                "a.dotted\\.key"
            ],
            expected: {
                b: {
                    b1: "hello",
                    b2: "hello"
                },
                c: {
                    "dotted.key": {
                        "u.q1": { val: { first: "vc1.1", second: "vc1.2" } },
                        "u.q2": { val: { first: "vc2.1", second: "vc2.2" } }
                    }
                }
            },
            invertedRules: {
                transform: [
                    {
                        type: "fluid.transforms.value",
                        inputPath: "b",
                        outputPath: "b"
                    }, {
                        type: "fluid.transforms.objectToArray",
                        inputPath: "c.dotted\\.key",
                        outputPath: "a.dotted\\.key",
                        key: "uni.que"
                    }
                ]
            }
        }, {
            message: "basic Nested Transformation",
            fullyInvertible: false,
            model: {
                foo: {
                    bar: [
                        { product: "salad", info: { price: 10, healthy: "yes" }},
                        { product: "candy", info: { price: 18, healthy: "no", tasty: "yes" }}
                    ]
                }
            },
            transform: {
                transform: {
                    type: "fluid.transforms.arrayToObject",
                    inputPath: "foo.bar",
                    key: "product",
                    outputPath: "",
                    innerValue: [{
                        transform: {
                            type: "fluid.transforms.value",
                            inputPath: "info.healthy"
                        }
                    }]
                }
            },
            expected: {
                "candy": "no",
                "salad": "yes"
            },
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.objectToArray",
                    outputPath: "foo.bar",
                    key: "product",
                    innerValue: [{
                        transform: [{
                            type: "fluid.transforms.value",
                            inputPath: "",
                            outputPath: "info.healthy"
                        }]
                    }],
                    inputPath: ""
                }]
            }
        }, {
            message: "Nested Array transformations",
            fullyInvertible: true,
            model: {
                outer: [
                    {
                        outerpivot: "outerkey1",
                        outervar:  [
                            {
                                innerpivot: "innerkey1.1",
                                innervar: "innerval1.1.1",
                                innervarx: "innerval1.1.2"
                            },
                            {
                                innerpivot: "innerkey1.2",
                                innervar: "innerval1.2.1"
                            }
                        ]
                    }, {
                        outerpivot: "outerkey2",
                        outervar: [
                            {
                                innerpivot: "innerkey2.1",
                                innervar: "innerval2.1.1",
                                innervarx: "innerval2.1.2"
                            },
                            {
                                innerpivot: "innerkey2.2",
                                innervar: "innerval2.2.1"
                            }
                        ]
                    }
                ]
            },
            transform: {
                "outer": {
                    "transform": {
                        type: "fluid.transforms.arrayToObject",
                        inputPath: "outer",
                        key: "outerpivot",
                        innerValue: [
                            {
                                "outervar": {
                                    "transform": {
                                        type: "fluid.transforms.arrayToObject",
                                        inputPath: "outervar",
                                        key: "innerpivot"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            expectedInputPaths: [
                "outer",
                "outervar"
            ],
            expected: {
                "outer": {
                    "outerkey1": {
                        "outervar": {
                            "innerkey1.1": {
                                "innervar": "innerval1.1.1",
                                "innervarx": "innerval1.1.2"
                            },
                            "innerkey1.2": {
                                "innervar": "innerval1.2.1"
                            }
                        }
                    },
                    "outerkey2": {
                        "outervar": {
                            "innerkey2.1": {
                                "innervar": "innerval2.1.1",
                                "innervarx": "innerval2.1.2"
                            },
                            "innerkey2.2": {
                                "innervar": "innerval2.2.1"
                            }
                        }
                    }
                }
            },
            invertedRules: {
                "transform": [{
                    type: "fluid.transforms.objectToArray",
                    inputPath: "outer",
                    outputPath: "outer",
                    key: "outerpivot",
                    innerValue: [{
                        transform: [{
                            type: "fluid.transforms.objectToArray",
                            inputPath: "outervar",
                            outputPath: "outervar",
                            key: "innerpivot"
                        }]
                    }]
                }]
            }
        }, {
            message: "Multiple Nested Array transformations",
            fullyInvertible: true,
            model: {
                outer: [
                    {
                        outerpivot: "outerkey1",
                        outervar:  {
                            arr1: [
                                {
                                    innerpivot1: "arr1.1",
                                    innervar: "arr1.1.1"
                                },
                                {
                                    innerpivot1: "arr1.2",
                                    innervar: "arr1.2.1"
                                }
                            ],
                            arr2: [
                                {
                                    innerpivot2: "arr2.1",
                                    innervar: "arr2.1.1"
                                },
                                {
                                    innerpivot2: "arr2.2",
                                    innervar: "arr2.2.1"
                                }
                            ]
                        }
                    }
                ]
            },
            transform: {
                "outer": {
                    "transform": {
                        type: "fluid.transforms.arrayToObject",
                        inputPath: "outer",
                        key: "outerpivot",
                        innerValue: [
                            {
                                "outervar.arr1": {
                                    "transform": {
                                        type: "fluid.transforms.arrayToObject",
                                        inputPath: "outervar.arr1",
                                        key: "innerpivot1"
                                    }
                                }
                            },
                            {
                                "outervar.arr2": {
                                    "transform": {
                                        type: "fluid.transforms.arrayToObject",
                                        inputPath: "outervar.arr2",
                                        key: "innerpivot2"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            expectedInputPaths: [
                "outer",
                "outervar.arr1",
                "outervar.arr2"
            ],
            expected: {
                "outer": {
                    "outerkey1": {
                        "outervar": {
                            "arr1": {
                                "arr1.1": { "innervar": "arr1.1.1" },
                                "arr1.2": { "innervar": "arr1.2.1" }
                            },
                            "arr2": {
                                "arr2.1": { "innervar": "arr2.1.1" },
                                "arr2.2": { "innervar": "arr2.2.1" }
                            }
                        }
                    }
                }
            },
            invertedRules: {
                "transform": [{
                    type: "fluid.transforms.objectToArray",
                    inputPath: "outer",
                    outputPath: "outer",
                    key: "outerpivot",
                    innerValue: [{
                        transform: [{
                            type: "fluid.transforms.objectToArray",
                            inputPath: "outervar.arr1",
                            outputPath: "outervar.arr1",
                            key: "innerpivot1"
                        }]
                    }, {
                        transform: [{
                            type: "fluid.transforms.objectToArray",
                            inputPath: "outervar.arr2",
                            outputPath: "outervar.arr2",
                            key: "innerpivot2"
                        }]
                    }]
                }]
            }
        }
    ];

    jqUnit.test("arrayToObject and inverse transformation tests", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.arrayToObjectTests, {
            method: "assertDeepEq"
        });
    });

        /* --------------- objectToArray and inverse tests -------------------- */
    fluid.tests.transforms.objectToArrayTests = [
        {
            message: "Basic Array transformations",
            fullyInvertible: true,
            model: {
                a: {
                    c: {
                        c1: { val: "vc1" },
                        c2: { val: "vc2" }
                    }
                }
            },
            transform: {
                "a.c": {
                    "transform": {
                        type: "fluid.transforms.objectToArray",
                        inputPath: "a.c",
                        key: "name"
                    }
                }
            },
            expectedInputPaths: [
                "a.c"
            ],
            expected: {
                a: {
                    c: [
                        { name: "c1", val: "vc1" },
                        { name: "c2", val: "vc2" }
                    ]
                }
            },
            invertedRules: {
                transform: [
                    {
                        type: "fluid.transforms.arrayToObject",
                        inputPath: "a.c",
                        outputPath: "a.c",
                        key: "name"
                    }
                ]
            }
        }, {
            message: "More Complex Array transformations",
            fullyInvertible: true,
            model: {
                b: {
                    b1: "hello",
                    b2: "hello"
                },
                c: {
                    "dotted.key": {
                        "u.q1": { val: { first: "vc1.1", second: "vc1.2" } },
                        "u.q2": { val: { first: "vc2.1", second: "vc2.2" } }
                    }
                }
            },
            transform: {
                b: "b",
                "a.dotted\\.key": {
                    "transform": {
                        type: "fluid.transforms.objectToArray",
                        inputPath: "c.dotted\\.key",
                        key: "uni.que"
                    }
                }
            },
            expectedInputPaths: [
                "b",
                "c.dotted\\.key"
            ],
            expected: {
                b: {
                    b1: "hello",
                    b2: "hello"
                },
                a: {
                    "dotted.key": [
                        { "uni.que": "u.q1", val: { first: "vc1.1", second: "vc1.2" }},
                        { "uni.que": "u.q2", val: { first: "vc2.1", second: "vc2.2" }}
                    ]
                }
            },
            invertedRules: {
                transform: [
                    {
                        type: "fluid.transforms.value",
                        inputPath: "b",
                        outputPath: "b"
                    }, {
                        type: "fluid.transforms.arrayToObject",
                        inputPath: "a.dotted\\.key",
                        outputPath: "c.dotted\\.key",
                        key: "uni.que"
                    }
                ]
            }
        }, {
            message: "Nested Array transformations",
            fullyInvertible: true,
            model: {
                "outer": {
                    "outerkey1": {
                        "outervar": {
                            "innerkey1.1": {
                                "innervar": "innerval1.1.1",
                                "innervarx": "innerval1.1.2"
                            },
                            "innerkey1.2": {
                                "innervar": "innerval1.2.1"
                            }
                        }
                    },
                    "outerkey2": {
                        "outervar": {
                            "innerkey2.1": {
                                "innervar": "innerval2.1.1",
                                "innervarx": "innerval2.1.2"
                            },
                            "innerkey2.2": {
                                "innervar": "innerval2.2.1"
                            }
                        }
                    }
                }
            },
            transform: {
                "outer": {
                    "transform": {
                        type: "fluid.transforms.objectToArray",
                        inputPath: "outer",
                        key: "outerpivot",
                        innerValue: [
                            {
                                "outervar": {
                                    "transform": {
                                        type: "fluid.transforms.objectToArray",
                                        inputPath: "outervar",
                                        key: "innerpivot"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            expectedInputPaths: [
                "outer",
                "outervar"
            ],
            expected: {
                outer: [
                    {
                        outerpivot: "outerkey1",
                        outervar:  [
                            {
                                innerpivot: "innerkey1.1",
                                innervar: "innerval1.1.1",
                                innervarx: "innerval1.1.2"
                            },
                            {
                                innerpivot: "innerkey1.2",
                                innervar: "innerval1.2.1"
                            }
                        ]
                    }, {
                        outerpivot: "outerkey2",
                        outervar: [
                            {
                                innerpivot: "innerkey2.1",
                                innervar: "innerval2.1.1",
                                innervarx: "innerval2.1.2"
                            },
                            {
                                innerpivot: "innerkey2.2",
                                innervar: "innerval2.2.1"
                            }
                        ]
                    }
                ]
            },
            invertedRules: {
                "transform": [{
                    type: "fluid.transforms.arrayToObject",
                    inputPath: "outer",
                    outputPath: "outer",
                    key: "outerpivot",
                    innerValue: [{
                        transform: [{
                            type: "fluid.transforms.arrayToObject",
                            inputPath: "outervar",
                            outputPath: "outervar",
                            key: "innerpivot"
                        }]
                    }]
                }]
            }
        }, {
            message: "Multiple Nested Array transformations",
            fullyInvertible: true,
            model: {
                "outer": {
                    "outerkey1": {
                        "outervar": {
                            "arr1": {
                                "arr1.1": { "innervar": "arr1.1.1" },
                                "arr1.2": { "innervar": "arr1.2.1" }
                            },
                            "arr2": {
                                "arr2.1": { "innervar": "arr2.1.1" },
                                "arr2.2": { "innervar": "arr2.2.1" }
                            }
                        }
                    }
                }
            },
            transform: {
                "outer": {
                    "transform": {
                        type: "fluid.transforms.objectToArray",
                        inputPath: "outer",
                        key: "outerpivot",
                        innerValue: [
                            {
                                "outervar.arr1": {
                                    "transform": {
                                        type: "fluid.transforms.objectToArray",
                                        inputPath: "outervar.arr1",
                                        key: "innerpivot1"
                                    }
                                }
                            },
                            {
                                "outervar.arr2": {
                                    "transform": {
                                        type: "fluid.transforms.objectToArray",
                                        inputPath: "outervar.arr2",
                                        key: "innerpivot2"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            expected: {
                outer: [
                    {
                        outerpivot: "outerkey1",
                        outervar:  {
                            arr1: [
                                {
                                    innerpivot1: "arr1.1",
                                    innervar: "arr1.1.1"
                                },
                                {
                                    innerpivot1: "arr1.2",
                                    innervar: "arr1.2.1"
                                }
                            ],
                            arr2: [
                                {
                                    innerpivot2: "arr2.1",
                                    innervar: "arr2.1.1"
                                },
                                {
                                    innerpivot2: "arr2.2",
                                    innervar: "arr2.2.1"
                                }
                            ]
                        }
                    }
                ]
            },
            invertedRules: {
                "transform": [{
                    type: "fluid.transforms.arrayToObject",
                    inputPath: "outer",
                    outputPath: "outer",
                    key: "outerpivot",
                    innerValue: [{
                        transform: [{
                            type: "fluid.transforms.arrayToObject",
                            inputPath: "outervar.arr1",
                            outputPath: "outervar.arr1",
                            key: "innerpivot1"
                        }]
                    }, {
                        transform: [{
                            type: "fluid.transforms.arrayToObject",
                            inputPath: "outervar.arr2",
                            outputPath: "outervar.arr2",
                            key: "innerpivot2"
                        }]
                    }]
                }]
            }
        }
    ];

    jqUnit.test("objectToArray transformation tests", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.objectToArrayTests, {
            method: "assertDeepEq"
        });
    });


    /* --------------- fluid.transforms.limitRange tests --------------------*/

    fluid.tests.transforms.limitRangeTests = [{
        message: "limitRange minimum",
        transform: {
            type: "fluid.transforms.limitRange",
            min: 0,
            max: 10,
            input: -3
        },
        expected: 0
    }, {
        message: "limitRange maximum",
        transform: {
            type: "fluid.transforms.limitRange",
            min: 0,
            max: 10,
            input: 13
        },
        expected: 10
    }, {
        message: "limitRange excludeMin",
        transform: {
            type: "fluid.transforms.limitRange",
            min: -15,
            max: 10,
            excludeMin: 1,
            input: -Infinity
        },
        expected: -14
    }, {
        message: "limitRange excludeMax",
        transform: {
            type: "fluid.transforms.limitRange",
            min: 0,
            max: 17,
            excludeMax: 2.5,
            input: 999
        },
        expected: 14.5
    }, {
        message: "limitRange with inputPath",
        transform: {
            type: "fluid.transforms.limitRange",
            min: -3,
            max: 3,
            excludeMax: 1,
            inputPath: "halfdozen"
        },
        expected: 2
    }
    ];

    jqUnit.test("limitRange tests", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.limitRangeTests, {
            transformWrap: true,
            method: "assertEquals"
        });
    });

    /* --------------- fluid.transforms.indexOf tests -------------------- */

    fluid.tests.transforms.indexOfTests = [{
        message: "indexOf() should return the index of the value on the array.",
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.indexOf",
                    array: ["sheep", "dog"],
                    inputPath: "element"
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.dereference",
                array: ["sheep", "dog"],
                outputPath: "element",
                inputPath: "value"
            }]
        },
        method: "assertDeepEq",
        model: {
            element: "dog"
        },
        expected: {
            value: 1
        },
        fullyInvertible: true
    }, {
        message: "indexOf() should return the index of the value when the value of the \"array\" argument is arrayable and match.",
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.indexOf",
                    array: "sheep",
                    inputPath: "element"
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.dereference",
                array: "sheep",
                outputPath: "element",
                inputPath: "value"
            }]
        },
        method: "assertDeepEq",
        model: {
            element: "sheep"
        },
        expected: {
            value: 0
        },
        fullyInvertible: true
    }, {
        message: "indexOf() should add offset value to the return.",
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.indexOf",
                    array: ["sheep", "dog"],
                    inputPath: "element",
                    offset: 3
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.dereference",
                array: ["sheep", "dog"],
                offset: -3,
                outputPath: "element",
                inputPath: "value"
            }]
        },
        method: "assertDeepEq",
        model: {
            element: "dog"
        },
        expected: {
            value: 4
        },
        fullyInvertible: true
    }, {
        message: "indexOf() should add offset value to the return even when the offset value can be converted to a number.",
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.indexOf",
                    array: ["sheep", "dog"],
                    inputPath: "element",
                    offset: "1"
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.dereference",
                array: ["sheep", "dog"],
                offset: -1,
                outputPath: "element",
                inputPath: "value"
            }]
        },
        method: "assertDeepEq",
        model: {
            element: "dog"
        },
        expected: {
            value: 2
        },
        fullyInvertible: true
    }];

    fluid.tests.transforms.indexOfBoundaryTests = [{
        message: "indexOf() should return -1 when the value is not found in the array.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: ["sheep", "dog"],
            input: "cat"
        },
        expected: -1
    }, {
        message: "indexOf() should return -1 when the value of the \"array\" argument is arrayable and mismatch.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: "dog",
            input: "sheep"
        },
        expected: -1
    }, {
        message: "indexOf() should return undefined when the value is not provided.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: ["sheep", "dog"]
        },
        expected: undefined
    }, {
        message: "indexOf() should add offset value to the return even when the return is -1.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: ["sheep", "dog"],
            input: "a",
            offset: 3
        },
        expected: 2
    }, {
        message: "indexOf() should return what's defined in the notFound when the value is not found in the array.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: ["sheep", "dog"],
            input: "cat",
            notFound: "notFound"
        },
        expected: "notFound"
    }, {
        message: "indexOf() should return the proper index when notFound is defined but the value is found in the array.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: ["sheep", "dog"],
            input: "sheep",
            notFound: "notFound"
        },
        expected: 0
    }];

    jqUnit.test("fluid.transforms.indexOf()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.indexOfTests);

        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.indexOfBoundaryTests, {
            transformWrap: true,
            method: "assertEquals"
        });
    });

    /* --------------- fluid.transforms.dereference tests -------------------- */

    fluid.tests.transforms.deferenceTests = [{
        message: "dereference() should return the value in an array based on the given index.",
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.dereference",
                    array: ["sheep", "dog"],
                    inputPath: "element"
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.indexOf",
                array: ["sheep", "dog"],
                outputPath: "element",
                inputPath: "value"
            }]
        },
        method: "assertDeepEq",
        model: {
            element: 1
        },
        expected: {
            value: "dog"
        },
        fullyInvertible: true
    }, {
        message: "dereference() should return the value when the \"array\" is arrayable and match the given index.",
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.dereference",
                    array: "sheep",
                    inputPath: "element"
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.indexOf",
                array: "sheep",
                outputPath: "element",
                inputPath: "value"
            }]
        },
        method: "assertDeepEq",
        model: {
            element: 0
        },
        expected: {
            value: "sheep"
        },
        fullyInvertible: true
    }, {
        message: "dereference() should take the offset value into consideration.",
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.dereference",
                    array: ["sheep", "dog"],
                    offset: -3,
                    inputPath: "element"
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.indexOf",
                array: ["sheep", "dog"],
                offset: 3,
                outputPath: "element",
                inputPath: "value"
            }]
        },
        method: "assertDeepEq",
        model: {
            element: 4
        },
        expected: {
            value: "dog"
        },
        fullyInvertible: true
    }, {
        message: "dereference() should take the offset value into consideration if the offset value can be converted to a number.",
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.dereference",
                    array: ["sheep", "dog"],
                    offset: "-1",
                    inputPath: "element"
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.indexOf",
                array: ["sheep", "dog"],
                offset: 1,
                outputPath: "element",
                inputPath: "value"
            }]
        },
        method: "assertDeepEq",
        model: {
            element: 2
        },
        expected: {
            value: "dog"
        },
        fullyInvertible: true
    }, {
        message: "dereference() should ignore notFound when the value is found in the array.",
        transform: {
            value: {
                transform: {
                    type: "fluid.transforms.dereference",
                    array: ["sheep", "dog"],
                    notFound: "notFound",
                    inputPath: "element"
                }
            }
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.indexOf",
                array: ["sheep", "dog"],
                notFound: "notFound",
                outputPath: "element",
                inputPath: "value"
            }]
        },
        method: "assertDeepEq",
        model: {
            element: 0
        },
        expected: {
            value: "sheep"
        },
        fullyInvertible: true
    }];

    fluid.tests.transforms.dereferenceBoundaryTests = [{
        message: "dereference() should return undefined when the given index is -1.",
        transform: {
            type: "fluid.transforms.dereference",
            array: ["sheep", "dog"],
            input: -1
        },
        expected: undefined
    }, {
        message: "dereference() should return undefined when the \"array\" is arrayable but the given index is -1.",
        transform: {
            type: "fluid.transforms.dereference",
            array: "dog",
            input: -1
        },
        expected: undefined
    }, {
        message: "dereference() should return undefined when the index is not provided.",
        transform: {
            type: "fluid.transforms.dereference",
            array: ["sheep", "dog"]
        },
        expected: undefined
    }, {
        message: "dereference() should return undefined when the calculated index is -1.",
        transform: {
            type: "fluid.transforms.dereference",
            array: ["sheep", "dog"],
            input: 2,
            offset: 3
        },
        expected: undefined
    }, {
        message: "dereference() should return what's defined in the notFound when the value is not found in the array.",
        transform: {
            type: "fluid.transforms.dereference",
            array: ["sheep", "dog"],
            input: -1,
            notFound: "notFound"
        },
        expected: "notFound"
    }];

    jqUnit.test("fluid.transforms.dereference()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.deferenceTests);

        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.dereferenceBoundaryTests, {
            transformWrap: true,
            method: "assertEquals"
        });
    });

    /* --------------- fluid.transforms.free tests -------------------- */

    fluid.tests.addThree = function (a, b, c) {
        return a + b + c;
    };

    fluid.tests.addNumbers = function (options) {
        return fluid.tests.addThree.apply(null, options.numbers);
    };

    fluid.tests.transforms.freeTests = [{
        message: "free multi-arg",
        transform: {
            type: "fluid.transforms.free",
            func: "fluid.tests.addThree",
            args: [1, 2, 3]
        },
        expected: 6
    }, {
        message: "free compound arg",
        transform: {
            type: "fluid.transforms.free",
            func: "fluid.tests.addNumbers",
            args: {numbers: [1, 2, 3]}
        },
        expected: 6
    }];

    jqUnit.test("free tests", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.freeTests, {
            transformWrap: true,
            method: "assertEquals"
        });
    });

    /* --------------- array to set-membership tests -------------------- */
    fluid.tests.transforms.arrayToSetMembershipTests = [{
        message: "basic test 1",
        model: {
            a: [ "foo", "bar" ]
        },
        transform: {
            "b": {
                "transform": {
                    type: "fluid.transforms.arrayToSetMembership",
                    inputPath: "a",
                    presentValue: "yes",
                    missingValue: "no",
                    options: { //(paths)
                        "foo": "settingF",
                        "bar": "settingB",
                        "tar": "settingT"
                    }
                }
            }
        },
        expected: {
            b: {
                settingF: "yes",
                settingB: "yes",
                settingT: "no"
            }
        },
        invertedRules: {
            transform: [
                {
                    type: "fluid.transforms.setMembershipToArray",
                    outputPath: "a",
                    inputPath: "b",
                    presentValue: "yes",
                    missingValue: "no",
                    options: {
                        "settingF": "foo",
                        "settingB": "bar",
                        "settingT": "tar"
                    }
                }
            ]
        },
        fullyInvertible: true
    }, {
        message: "basic test with defaulted present and missing values",
        model: {
            a: [ "foo", "bar" ]
        },
        transform: {
            "b": {
                "transform": {
                    type: "fluid.transforms.arrayToSetMembership",
                    inputPath: "a",
                    options: { //(paths)
                        "foo": "settingF",
                        "bar": "settingB",
                        "tar": "settingT"
                    }
                }
            }
        },
        expected: {
            b: {
                settingF: true,
                settingB: true,
                settingT: false
            }
        },
        invertedRules: {
            transform: [
                {
                    type: "fluid.transforms.setMembershipToArray",
                    outputPath: "a",
                    inputPath: "b",
                    presentValue: true,
                    missingValue: false,
                    options: {
                        "settingF": "foo",
                        "settingB": "bar",
                        "settingT": "tar"
                    }
                }
            ]
        },
        fullyInvertible: true
    }];

    jqUnit.test("arrayToSetMembership and setMembershipToArray transformation tests", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.arrayToSetMembershipTests, {
            method: "assertDeepEq"
        });
    });

    /* --------------- array to set-membership tests -------------------- */
    fluid.tests.transforms.setMembershipToArrayTests = [{
        message: "basic test",
        model: {
            a: {
                settingF: "yes",
                settingB: "yes",
                settingT: "no"
            }
        },
        transform: {
            b: {
                transform: {
                    type: "fluid.transforms.setMembershipToArray",
                    inputPath: "a",
                    presentValue: "yes",
                    missingValue: "no",
                    options: {
                        "settingF": "foo",
                        "settingB": "bar",
                        "settingT": "tar"
                    }
                }
            }
        },
        expected: {
            b: [ "foo", "bar" ]
        },
        invertedRules: {
            transform: [
                {
                    type: "fluid.transforms.arrayToSetMembership",
                    outputPath: "a",
                    inputPath: "b",
                    presentValue: "yes",
                    missingValue: "no",
                    options: { //(paths)
                        "foo": "settingF",
                        "bar": "settingB",
                        "tar": "settingT"
                    }
                }
            ]
        },
        fullyInvertible: true
    }, {
        message: "basic test with defaults for present and missing value",
        model: {
            detections: {
                hasMouse: true,
                hasKeyboard: true,
                hasTrackpad: false,
                hasHeadtracker: false
            }
        },
        transform: {
            controls: {
                transform: {
                    type: "fluid.transforms.setMembershipToArray",
                    inputPath: "detections",
                    options: {
                        hasMouse: "mouse",
                        hasKeyboard: "keyboard",
                        hasTrackpad: "trackpad",
                        hasHeadtracker: "headtracker"
                    }
                }
            }
        },
        expected: {
            controls: [ "mouse", "keyboard" ]
        },
        invertedRules: {
            transform: [
                {
                    type: "fluid.transforms.arrayToSetMembership",
                    outputPath: "detections",
                    inputPath: "controls",
                    presentValue: true,
                    missingValue: false,
                    options: { //(paths)
                        mouse: "hasMouse",
                        keyboard: "hasKeyboard",
                        trackpad: "hasTrackpad",
                        headtracker: "hasHeadtracker"
                    }
                }
            ]
        },
        fullyInvertible: true
    }];

    jqUnit.test("setMembershipToArray transformation tests", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.setMembershipToArrayTests, {
            method: "assertDeepEq"
        });
    });

    /* --------------- fluid.transforms.quantize tests -------------------- */
    fluid.tests.transforms.quantizeTests = [{
        name: "Basic quantize transformations",
        rules: {
            "foo": {
                "transform": {
                    "type": "fluid.transforms.quantize",
                    "inputPath": "someval",
                    "ranges": [
                        {
                            "upperBound": 380,
                            "output": 1
                        }, {
                            "upperBound": 450,
                            "output": 2
                        }, {
                            "upperBound": 600,
                            "output": {
                                "transform": {
                                    "type": "fluid.transforms.literalValue",
                                    "input": "DOGG",
                                    "outputPath": "bar"
                                }
                            }
                        }, {
                            "output": 3
                        }
                    ]
                }
            }
        },
        fixtures: {
            "low value check": {
                input: {
                    someval: 200
                },
                expected: {
                    foo: 1
                }
            },
            "on upper bound limit": {
                input: {
                    someval: 380
                },
                expected: {
                    foo: 1
                }
            },
            "interval check": {
                input: {
                    someval: 429
                },
                expected: {
                    foo: 2
                }
            },
            "upper default value": {
                input: {
                    someval: 1000
                },
                expected: {
                    foo: 3
                }
            },
            "expander in output": {
                input: {
                    someval: 500
                },
                expected: {
                    foo: {
                        bar: "DOGG"
                    }
                }
            }
        }
    }, {
        name: "Treatment of non-finite values",
        rules: {
            "transform": {
                "type": "fluid.transforms.quantize",
                "inputPath": "",
                "outputPath": "value",
                "ranges": [{
                    "output": 1
                }]
            }
        },
        fixtures: {
            "undefined check": {
            },
            "NaN check": {
                input: NaN // warning, this fixture not valid for JSON interchange
            },
            "single value check": {
                input: 6,
                expected: {
                    value: 1
                }
            }
        }
    }];

    jqUnit.test("Quantize tests", function () {
        fluid.each(fluid.tests.transforms.quantizeTests, function (quantizeTest) {
            fluid.each(quantizeTest.fixtures, function (test, testname) {
                var transformed = fluid.model.transformWithRules(test.input, quantizeTest.rules);
                jqUnit.assertDeepEq(quantizeTest.name + " - " + testname, test.expected, transformed);
            });
        });
    });

     /* --------------- fluid.transforms.inRange tests -------------------- */
    fluid.tests.transforms.inRangeTests = {
        rules: {
            minOnly: {
                "foo": {
                    "transform": {
                        "type": "fluid.transforms.inRange",
                        "inputPath": "bar",
                        "min": 100
                    }
                }
            },
            maxOnly: {
                "foo": {
                    "transform": {
                        "type": "fluid.transforms.inRange",
                        "inputPath": "bar",
                        "max": 200
                    }
                }
            },
            minAndMax: {
                "foo": {
                    "transform": {
                        "type": "fluid.transforms.inRange",
                        "inputPath": "bar",
                        "min": 100,
                        "max": 200
                    }
                }
            }
        },
        expects: {
            "Min only - below threshold": {
                rule: "minOnly",
                input: {
                    bar: 23
                },
                expected: {
                    foo: false
                }
            },
            "Min only - on threshold": {
                rule: "minOnly",
                input: {
                    bar: 100
                },
                expected: {
                    foo: true
                }
            },
            "Min only - above threshold": {
                rule: "minOnly",
                input: {
                    bar: 100
                },
                expected: {
                    foo: true
                }
            },
            "Max only - below threshold": {
                rule: "maxOnly",
                input: {
                    bar: 23
                },
                expected: {
                    foo: true
                }
            },
            "Max only - on threshold": {
                rule: "maxOnly",
                input: {
                    bar: 200
                },
                expected: {
                    foo: true
                }
            },
            "Max only - above threshold": {
                rule: "maxOnly",
                input: {
                    bar: 2100
                },
                expected: {
                    foo: false
                }
            },
            "Min and Max - above threshold": {
                rule: "minAndMax",
                input: {
                    bar: 2100
                },
                expected: {
                    foo: false
                }
            },
            "Min and Max - within range": {
                rule: "minAndMax",
                input: {
                    bar: 160
                },
                expected: {
                    foo: true
                }
            },
            "Min and Max - below threshold": {
                rule: "minAndMax",
                input: {
                    bar: 21
                },
                expected: {
                    foo: false
                }
            }
        }
    };

    jqUnit.test("fluid.transforms.inRange tests", function () {
        fluid.each(fluid.tests.transforms.inRangeTests.expects, function (test, tname) {
            var transformed = fluid.model.transformWithRules(test.input, fluid.tests.transforms.inRangeTests.rules[test.rule]);
            jqUnit.assertDeepEq("inRange transformation tests - " + tname, test.expected, transformed);
        });
    });


    /* --------------- FLUID-5294: `value` key should no longer be supported ------------- */
    fluid.tests.transforms.noValueSupport = [{
        message: "Ensure literalValue transformation no longer supports value",
        transform: {
            type: "fluid.transforms.literalValue",
            value: "I am wrong"
        },
        expected: undefined
    }, {
        message: "Ensure literalValue transformation no longer supports valuePath",
        transform: {
            type: "fluid.transforms.literalValue",
            inputPath: "mypath"
        },
        model: {
            mypath: "Hello world"
        },
        expected: undefined
    }, {
        message: "Ensure standardTransformFunction (transforms.value) no longer supports 'value'",
        transform: {
            type: "fluid.transforms.value",
            value: {
                literalValue: "I should not be read"
            }
        },
        expected: undefined
    }, {
        message: "Ensure standardTransformFunction (transforms.value) no longer supports 'valuePath'",
        transform: {
            type: "fluid.transforms.value",
            valuePath: "tester"
        },
        model: {
            tester: "hello"
        },
        expected: undefined
    }, {
        message: "Ensure valueMapper no longer supports 'valuePath'",
        transform: {
            type: "fluid.transforms.valueMapper",
            valuePath: "condition",
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
        model: {
            condition: true
        },
        expected: undefined
    }, {
        message: "Ensure valueMapper no longer supports 'value'",
        transform: {
            type: "fluid.transforms.valueMapper",
            value: "true",
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
        expected: undefined
    }, {
        message: "Ensure linearScale no longer supports 'value'",
        transform: {
            type: "fluid.transforms.linearScale",
            value: 3,
            factor: 2,
            offset: 5
        },
        expected: undefined
    }, {
        message: "Ensure linearScale no longer supports 'valuePath'",
        transform: {
            type: "fluid.transforms.linearScale",
            valuePath: "myvalue",
            factor: 2,
            offset: 5
        },
        model: {
            myvalue: 4
        },
        expected: undefined
    }];

    //to test:
    // test inversions


    jqUnit.test("FLUID-5294: avoid ambiguous support of 'value' and 'valuePath' - only accept 'input' and 'inputPath'", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.noValueSupport, {
            transformWrap: true,
            method: "assertEquals"
        });
    });
})(jQuery);
