/*
Copyright 2007-2019 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

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
        floatAddLow: 0.1 + 0.2,
        floatAddHigh: 0.1 + 0.7,
        floaty2: -9876.789,
        hundredInString: "100",
        floatInString: "12.52",
        floatInStringScale1: "12.5",
        floatInStringScale1Ceil: "12.6",
        floatInStringScale0: "13",
        floaty2InString: "-9876.789",
        floaty2InString2: "-9876.79",
        floaty2InString1: "-9876.8",
        floaty2InString0: "-9877",
        floatAddLowInString: "0.3",
        floatAddHighInString: "0.8"
    };

    jqUnit.module("Model Transformation");

    fluid.tests.transforms.wrapTransform = function (transform) {
        return {
            value: {
                transform: transform
            }
        };
    };

    fluid.tests.transforms.testInputPathCollection = function (test) {
        var collected = fluid.model.transform.collectInputPaths(test.transform);
        jqUnit.expect(1);
        jqUnit.assertDeepEq(test.message + " - collect input paths", test.expectedInputPaths, collected);
    };

    fluid.tests.transforms.testOneTransform = function (test) {
        if (test.errorTexts) {
            jqUnit.expectFrameworkDiagnostic(test.message, function () {
                fluid.model.transform(test.model, test.transform);
            }, test.errorTexts);
        } else {
            var transformed = fluid.model.transform(test.model, test.transform);
            jqUnit.expect(1);
            jqUnit[test.method].apply(null, [test.message, test.expected, transformed]);
        }
    };

    fluid.tests.transforms.testOneInversion = function (test) {
        var inverseRules = fluid.model.transform.invertConfiguration(test.transform); // generate B
        if (test.invertedRules) { // if we got an inverse rule to assert against
            jqUnit.expect(1);
            jqUnit.assertDeepEq(test.message + " -- inverted rules", test.invertedRules, inverseRules);
        }
        if (test.fullyInvertible || test.weaklyInvertible) {
            var inverseTransformed = fluid.model.transform(test.expected, inverseRules); // B(A(x))
            if (test.fullyInvertible) { // if fully invertible, expect: B(A(x)) = x (where B is inverse of A)
                jqUnit.expect(1);
                jqUnit.assertDeepEq(test.message + " -- transformation with lossless inverse", test.model, inverseTransformed);
            } else if (test.weaklyInvertible) { // if weakly invertible, expect: A(x) = A(B(A(x)))
                if (test.modelAfterInversion) { // if we're provided with a model to assert B(A(x)) against
                    jqUnit.expect(1);
                    jqUnit.assertDeepEq(test.message + " -- result transformation with inverse", test.modelAfterInversion, inverseTransformed);
                }
                var tripleTransformed = fluid.model.transform(inverseTransformed, test.transform);
                var singleTransformed = fluid.model.transform(test.model, test.transform);
                jqUnit.expect(1);
                jqUnit.assertDeepEq(test.message + " -- weakly invertible check", singleTransformed, tripleTransformed);
            }
        }
    };

    // An "undefined-safe" copy utility to preserve whether a property is set in the source or not
    fluid.tests.copySafe = function (target, source) {
        fluid.each(source, function (value, key) {
            target[key] = value;
        });
    };
    /*
     * Used to test transformations and potentially their invertibility.
     * Expects an array of objects, each object holding the test definitions. The extra options
     * argument are test-options that will be merged with the individual tests options.
     *
     * The allowed directives in each test are the following:
     *
     * message (REQUIRED): the title of the test (string)
     * transform (REQUIRED): the transformation rules
     * expected (REQUIRED): the expected output
     * model: the source model. If undefined, fluid.tests.transforms.source will be used
     * invertedRules: How the rules are expected to look after inversion
     * fullyInvertible: if true, the transformation is tested to see if it's fully invertible
     *        that is, B(A(x)) = x (where A is regular transformation func, B is inverted func)
     * weaklyInvertible: if true, the transformation is tested to see if it's weakly invertible
     *        that is, A(x) = (A(B(A(x))) (where A is regular transformation func, B is inverted func).
     *        We expect that every transform will satisfy this property.
     * transformWrap: if true, the 'transform' will be wrapped in a: { value: { transform: <content> }}
     *        where <content> is the original content of the transform property. It will also wrap the
     *        'expected' content with { value: <expected> }, where <expected> is the original content
     *        of the 'expected' property. transformWrap is used to compensate for the fact that the transformer can't output primitive values
     */
    fluid.tests.transforms.testOneStructure = function (tests, options) {
        fluid.each(tests, function (oneTest) {
            var test = options ? fluid.copy(options) : {};
            fluid.tests.copySafe(test, oneTest);
            if (test.model === undefined) {
                test.model = fluid.tests.transforms.source;
            }
            if (test.transformWrap) {
                test.transform = fluid.tests.transforms.wrapTransform(test.transform);
                test.expected = (test.expected === undefined) ? {} : { value: test.expected };
            }
            if (test.method === undefined) {
                test.method = "assertDeepEq";
            }
            fluid.tests.transforms.testOneTransform(test);
            if (test.expectedInputPaths) {
                fluid.tests.transforms.testInputPathCollection(test);
            }
            if (test.invertedRules || test.fullyInvertible || test.weaklyInvertible) {
                fluid.tests.transforms.testOneInversion(test);
            }
        });
    };

    fluid.tests.transforms.outputTests = [{
        message: "Value transform should implicitly output to document",
        transform: {
            dog: {
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
            dog: {
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
            dog: {
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
            dog: {
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
            dog: [
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
                    cat: {
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


    fluid.transforms.extraCollectInputPathsTests = [{
        message: "Using an array of transformers with a given outputkey",
        transform: {
            dog: [
                {
                    transform: {
                        type: "fluid.transforms.linearScale",
                        inputPath: "scaleMe",
                        factorPath: "scaleFactor",
                        offset: 5
                    }
                }, {
                    "cat": {
                        transform: {
                            type: "fluid.transforms.value",
                            inputPath: "helloAnimal"
                        }
                    }
                }
            ]
        },
        expected: {
            dog: [ 11, { cat: "I'm a cat"} ]
        },
        model: {
            scaleMe: 3,
            scaleFactor: 2,
            helloAnimal: "I'm a cat"
        },
        expectedInputPaths: [ "scaleMe", "scaleFactor", "helloAnimal" ]
    }, {
        message: "Simple path from condition",
        transform: {
            transform: [
                {
                    "type": "fluid.transforms.condition",
                    "conditionPath": "contrastPath",
                    "condition": false,
                    "outputPath": "theme",
                    "false": "colour",
                    "true": "hc"
                }
            ]
        },
        expected: {
            theme: "hc"
        },
        model: {
            contrastPath: true
        },
        expectedInputPaths: [ "contrastPath" ]
    }, {
        message: "Nested Condition",
        transform: {
            transform: [
                {
                    "type": "fluid.transforms.condition",
                    "conditionPath": "contrastPath",
                    "condition": false,
                    "outputPath": "theme",
                    "falsePath": "falsePath",
                    "true": {
                        "transform": {
                            "type": "fluid.transforms.value",
                            "inputPath": "cat"
                        }
                    }
                }
            ]
        },
        expected: {
            "theme": "meow"
        },
        model: {
            "contrastPath": true,
            "cat": "meow"
        },
        expectedInputPaths: [
            "cat",
            "falsePath",
            "contrastPath"
        ]
    }, {
        message: "FLUID-6196: Complex transform nested in simpler transform",
        transform: {
            "transform": [
                {
                    "type": "fluid.transforms.condition",
                    "conditionPath": "myCond",
                    "condition": false,
                    "outputPath": "theme",
                    "falsePath": "myFalsePath",
                    "true": {
                        "transform": {
                            "type": "fluid.transforms.valueMapper",
                            "defaultInputPath": "mapper",
                            "match": {
                                "black-white": "bw",
                                "white-black": "bw",
                                "black-yellow": "hc",
                                "yellow-black": "hc"
                            },
                            "noMatch": {
                                "outputValue": "bw"
                            }
                        }
                    }
                }
            ]
        },
        expected: {
            "theme": "hc"
        },
        model: {
            "myCond": true,
            "mapper": "black-yellow"
        },
        expectedInputPaths: [
            "mapper",
            "myFalsePath",
            "myCond"
        ]
    }];

    jqUnit.test("fluid.transforms.extraCollectInputPathsTests()", function () {
        fluid.tests.transforms.testOneStructure(fluid.transforms.extraCollectInputPathsTests, {
            method: "assertDeepEq"
        });
    });

    fluid.transforms.nestedValueMapperTransformationTest = [{
        message: "Using an nested valueMapper transformation to see if expected input paths are detected correctly",
        transform: {
            Arrow: {
                "transform": {
                    "type": "fluid.transforms.quantize",
                    "inputPath": "cursorSize",
                    "ranges": [
                        {
                            "upperBound": 0.333,
                            "output": {
                                "transform": {
                                    "type": "fluid.transforms.valueMapper",
                                    "defaultInputPath": "cursorColor",
                                    "defaultOutputValue": "",
                                    "match": {
                                        "": "Nothing on cursor color",
                                        "White": "",
                                        "Black": "%SystemRoot%\\cursors\\arrow_r.cur",
                                        "ReverseBlack": "%SystemRoot%\\cursors\\arrow_i.cur"
                                    }
                                }
                            }
                        },
                        {
                            "upperBound": 0.666,
                            "output": {
                                "transform": {
                                    "type": "fluid.transforms.valueMapper",
                                    "defaultInputPath": "cursorColor",
                                    "defaultOutputValue": "",
                                    "match": {
                                        "": "Nothing on cursor color",
                                        "White": "%SystemRoot%\\cursors\\arrow_m.cur",
                                        "Black": "%SystemRoot%\\cursors\\arrow_rm.cur",
                                        "ReverseBlack": "%SystemRoot%\\cursors\\arrow_im.cur"
                                    }
                                }
                            }
                        },
                        {
                            "output": {
                                "transform": {
                                    "type": "fluid.transforms.valueMapper",
                                    "defaultInputPath": "cursorColor",
                                    "defaultOutputValue": "",
                                    "match": {
                                        "": "Nothing on cursor color",
                                        "White": "%SystemRoot%\\cursors\\arrow_l.cur",
                                        "Black": "%SystemRoot%\\cursors\\arrow_rl.cur",
                                        "ReverseBlack": "%SystemRoot%\\cursors\\arrow_il.cur"
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        expected: {
            Arrow: "%SystemRoot%\\cursors\\arrow_im.cur"
        },
        model: {
            "cursorSize": 0.4,
            "cursorColor": "ReverseBlack"
        },
        expectedInputPaths: [ "cursorSize", "cursorColor" ]
    }];

    jqUnit.test("fluid.transforms.nestedValueMapperTransformationTest()", function () {
        fluid.tests.transforms.testOneStructure(fluid.transforms.nestedValueMapperTransformationTest, {
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
        },
        fullyInvertible: true
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
        },
        fullyInvertible: true
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
        },
        fullyInvertible: true
    }];

    jqUnit.test("fluid.transforms.literalValue()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.literalValueTests);
    });

    fluid.tests.transforms.linearScaleTests = [{
        message: "linearScale - no parameters given",
        transform: {
            type: "fluid.transforms.linearScale",
            inputPath: "dozen"
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.linearScale",
                outputPath: "dozen",
                inputPath: "value"
            }]
        },
        expected: 12,
        expectedInputPaths: [
            "dozen"
        ]
    }, {
        message: "linearScale - factor parameter only",
        transform: {
            type: "fluid.transforms.linearScale",
            inputPath: "dozen",
            factor: 0.25
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.linearScale",
                outputPath: "dozen",
                inputPath: "value",
                factor: 4
            }]
        },
        expected: 3,
        expectedInputPaths: [
            "dozen"
        ]
    }, {
        message: "linearScale - factor parameter and offset",
        transform: {
            type: "fluid.transforms.linearScale",
            inputPath: "dozen",
            factor: 0.50,
            offset: 100
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
        expected: 106,
        expectedInputPaths: [
            "dozen"
        ]
    }, {
        message: "linearScale - everything by path",
        transform: {
            type: "fluid.transforms.linearScale",
            inputPath: "dozen",
            factorPath: "halfdozen",
            offsetPath: "hundred"
        },
        model: {
            dozen: 12,
            halfdozen: 6,
            hundred: 100
        },
        weaklyInvertible: true,
        fullyInvertible: false,
        expected: 172,
        expectedInputPaths: [
            "dozen",
            "halfdozen",
            "hundred"
        ]
    }];

    jqUnit.test("fluid.transforms.linearScale()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.linearScaleTests, {
            fullyInvertible: true,
            transformWrap: true,
            model: {
                dozen: 12
            }
        });
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
        expected: 14,
        expectedInputPaths: []
    }, {
        message: "binaryOp - ===",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "dozen",
            operator: "===",
            right: 12
        },
        expected: true,
        expectedInputPaths: [
            "dozen"
        ]
    }, {
        message: "binaryOp - === (FLUID-5669)",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: NaN,
            operator: "===",
            right: NaN
        },
        expected: true,
        expectedInputPaths: []
    }, {
        message: "binaryOp - === (FLUID-5669)",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: 0.20000000000000004, // test "floating point slop" via fluid.model.isSameValue
            operator: "===",
            right: 0.2
        },
        expected: true,
        expectedInputPaths: []
    }, {
        message: "binaryOp - !==",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: 100,
            operator: "!==",
            rightPath: "hundred"
        },
        expected: false,
        expectedInputPaths: [ "hundred" ]
    }, {
        message: "binaryOp - !== (FLUID-5669)",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: NaN,
            operator: "!==",
            right: NaN
        },
        expected: false,
        expectedInputPaths: []
    }, {
        message: "binaryOp - !== (FLUID-5669)",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: 0.20000000000000004,
            operator: "!==",
            right: 0.2
        },
        expected: false,
        expectedInputPaths: []
    }, {
        message: "binaryOp - <=",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "dozen",
            operator: "<=",
            right: 13
        },
        expected: true,
        expectedInputPaths: [ "dozen" ]
    }, {
        message: "binaryOp - <",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "hundred",
            operator: "<",
            rightPath: "dozen"
        },
        expected: false,
        expectedInputPaths: [ "hundred", "dozen" ]
    }, {
        message: "binaryOp - >=",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "dozen",
            operator: ">=",
            right: 13
        },
        expected: false,
        expectedInputPaths: [ "dozen" ]
    }, {
        message: "binaryOp - >",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "hundred",
            operator: ">",
            rightPath: "dozen"
        },
        expected: true,
        expectedInputPaths: [ "hundred", "dozen" ]
    }, {
        message: "binaryOp - +",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "dozen",
            operator: "+",
            right: 13
        },
        expected: 25,
        expectedInputPaths: [ "dozen" ]
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
        expected: 156,
        expectedInputPaths: [ "dozen" ]
    }, {
        message: "binaryOp - /",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: 96,
            operator: "/",
            rightPath: "dozen"
        },
        expected: 8,
        expectedInputPaths: [ "dozen" ]
    }, {
        message: "binaryOp - %",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "hundred",
            operator: "%",
            rightPath: "dozen"
        },
        expected: 4,
        expectedInputPaths: [ "hundred", "dozen" ]
    }, {
        message: "binaryOp - &&",
        transform: {
            type: "fluid.transforms.binaryOp",
            leftPath: "catsAreDecent",
            operator: "&&",
            right: false
        },
        expected: false,
        expectedInputPaths: [ "catsAreDecent" ]
    }, {
        message: "binaryOp - ||",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: false,
            operator: "||",
            rightPath: "catsAreDecent"
        },
        expected: true,
        expectedInputPaths: [ "catsAreDecent" ]
    }, {
        message: "binaryOp - invalid operator",
        transform: {
            type: "fluid.transforms.binaryOp",
            left: false,
            operator: "-+",
            rightPath: "catsAreDecent"
        },
        expected: undefined,
        expectedInputPaths: [ "catsAreDecent" ]
    }];

    jqUnit.test("fluid.transforms.binaryOp()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.binaryOpTests, {
            transformWrap: true
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
            expected: "it was true",
            expectedInputPaths: [ "catsAreDecent" ]
        }, {
            message: "truePath working",
            transform: {
                type: "fluid.transforms.condition",
                condition: true,
                "truePath": "cow"
            },
            expected: {
                grass: "chew"
            },
            expectedInputPaths: [ "cow" ]
        }, {
            message: "falsePath working",
            transform: {
                type: "fluid.transforms.condition",
                condition: false,
                "falsePath": "cow"
            },
            expected: {
                grass: "chew"
            },
            expectedInputPaths: [ "cow" ]
        }, {
            message: "invalid truePath",
            transform: {
                type: "fluid.transforms.condition",
                conditionPath: "catsAreDecent",
                truePath: "fluid.tests.transforms.source.idontexist"
            },
            expected: undefined,
            expectedInputPaths: [
                "fluid.tests.transforms.source.idontexist",
                "catsAreDecent"
            ]
        }, {
            message: "invalid condition path",
            transform: {
                type: "fluid.transforms.condition",
                conditionPath: "bogusPath",
                "true": "it was true",
                "false": "it was false"
            },
            expected: "it was false",
            expectedInputPaths: [ "bogusPath" ]
        }, {
            message: "Condition is a string - evaluating to true",
            transform: {
                type: "fluid.transforms.condition",
                condition: "foo",
                "true": "it was true",
                "false": "it was false"
            },
            expected: "it was true",
            expectedInputPaths: [ ]
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
            expected: {
                conclusion: "Congratulations, you are a genius"
            },
            expectedInputPaths: [ ]
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
            expected: {
                "Antranig": "meow"
            },
            expectedInputPaths: [ "cat", "polar", "catsAreDecent" ]
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
            expected: fluid.tests.transforms.source.hamster.wheel,
            fullyInvertible: true,
            model: {
                "hamster": {
                    "wheel": "spin"
                }
            },
            expectedInputPaths: [ "hamster.wheel" ]
        }, {
            message: "When the path is valid, the value option should not be returned.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "hamster.wheel",
                input: "hello!"
            },
            expected: "spin",
            expectedInputPaths: [ "hamster.wheel" ]
        }, {
            message: "When the path's value is null, the value option should not be returned.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "dog",
                input: "hello!"
            },
            expected: null,
            expectedInputPaths: [ "dog" ]
        }, {
            message: "When the path's value is false, the value option should not be returned.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "goat",
                input: "hello!"
            },
            expected: false,
            expectedInputPaths: [ "goat" ]
        }, {
            message: "When the path's value is undefined, the value option should be returned.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "gerbil",
                input: "hello!"
            },
            expected: "hello!",
            expectedInputPaths: [ "gerbil" ]
        }, {
            message: "When the path's value is not specified, the value option should be returned.",
            transform: {
                type: "fluid.transforms.value",
                input: "toothpick"
            },
            expected: "toothpick",
            expectedInputPaths: [ ]
        }, {
            message: "When the path's value is defined, the referenced value should be returned.",
            transform: {
                type: "fluid.transforms.value",
                inputPath: "cat",
                input: "rrrrr"
            },
            expected: fluid.tests.transforms.source.cat,
            expectedInputPaths: [ "cat" ]
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
            expected: {
                alligator: fluid.tests.transforms.source.hamster,
                tiger: fluid.tests.transforms.source.hamster.wheel
            },
            expectedInputPaths: [ "hamster", "hamster.wheel" ]
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
        jqUnit.expect(1);
        jqUnit.assertDeepEq("Transformed transform types to short names", expected, shortened);
        var newConfig = $.extend(true, [], fluid.tests.transforms.valueTests, shortened);
        fluid.tests.transforms.testOneStructure(newConfig, {
            transformWrap: true
        });
    });

    fluid.tests.transforms.stringToNumberTests = [{
        message: "stringToNumber() converts integers.",
        transform: {
            type: "fluid.transforms.stringToNumber",
            inputPath: "hundredInString"
        },
        method: "assertValue",
        expected: fluid.tests.transforms.source.hundred,
        expectedInputPaths: [ "hundredInString" ]
    }, {
        message: "stringToNumber() converts float values.",
        transform: {
            type: "fluid.transforms.stringToNumber",
            inputPath: "floatInString"
        },
        method: "assertValue",
        expected: fluid.tests.transforms.source.floatyHighy,
        expectedInputPaths: [ "floatInString" ]
    }, {
        message: "stringToNumber() converts negative float values.",
        transform: {
            type: "fluid.transforms.stringToNumber",
            inputPath: "floaty2InString"
        },
        method: "assertValue",
        expected: fluid.tests.transforms.source.floaty2,
        expectedInputPaths: [ "floaty2InString" ]
    }, {
        message: "stringToNumber() doesn't convert non-number strings #2",
        transform: {
            type: "fluid.transforms.stringToNumber",
            inputPath: "cat"
        },
        expected: undefined,
        expectedInputPaths: [ "cat" ]
    }, {
        message: "stringToNumber() doesn't convert non-number strings",
        transform: {
            type: "fluid.transforms.stringToNumber",
            inputPath: "gerbil"
        },
        expected: undefined,
        expectedInputPaths: [ "gerbil" ]
    }];

    jqUnit.test("fluid.transforms.stringToNumber()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.stringToNumberTests, {
            transformWrap: true
        });
    });

    fluid.tests.transforms.numberToStringTests = [{
        message: "numberToString() converts integers",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "hundred"
        },
        expected: fluid.tests.transforms.source.hundredInString,
        expectedInputPaths: [ "hundred" ]
    }, {
        message: "numberToString() converts integers - with scale",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "hundred",
            scale: 2
        },
        expected: fluid.tests.transforms.source.hundredInString,
        expectedInputPaths: [ "hundred" ]
    }, {
        message: "numberToString() converts float values",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floatyHighy"
        },
        expected: fluid.tests.transforms.source.floatInString,
        expectedInputPaths: [ "floatyHighy" ]
    }, {
        message: "numberToString() converts float values - with scale = 2",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floatyHighy",
            scale: 2
        },
        expected: fluid.tests.transforms.source.floatInString,
        expectedInputPaths: [ "floatyHighy" ]
    }, {
        message: "numberToString() converts float values - with scale = 1",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floatyHighy",
            scale: 1
        },
        expected: fluid.tests.transforms.source.floatInStringScale1,
        expectedInputPaths: [ "floatyHighy" ]
    }, {
        message: "numberToString() converts float values - with scale = 0",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floatyHighy",
            scale: 0
        },
        expected: fluid.tests.transforms.source.floatInStringScale0,
        expectedInputPaths: [ "floatyHighy" ]
    }, {
        message: "numberToString() converts float values - with scale invalid",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floatyHighy",
            scale: "not a number"
        },
        expected: fluid.tests.transforms.source.floatInString,
        expectedInputPaths: [ "floatyHighy" ]
    }, {
        message: "numberToString() converts negative float values",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floaty2"
        },
        expected: fluid.tests.transforms.source.floaty2InString,
        expectedInputPaths: [ "floaty2" ]
    }, {
        message: "numberToString() converts negative float values with scale = 3",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floaty2",
            scale: 3
        },
        expected: fluid.tests.transforms.source.floaty2InString,
        expectedInputPaths: [ "floaty2" ]
    }, {
        message: "numberToString() converts negative float values with scale = 2",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floaty2",
            scale: 2
        },
        expected: fluid.tests.transforms.source.floaty2InString2,
        expectedInputPaths: [ "floaty2" ]
    }, {
        message: "numberToString() converts negative float values with scale = 1",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floaty2",
            scale: 1
        },
        expected: fluid.tests.transforms.source.floaty2InString1,
        expectedInputPaths: [ "floaty2" ]
    }, {
        message: "numberToString() converts negative float values with scale = 0",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floaty2",
            scale: 0
        },
        expected: fluid.tests.transforms.source.floaty2InString0,
        expectedInputPaths: [ "floaty2" ]
    }, {
        message: "numberToString() converts negative float values with scale = -1",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floaty2",
            scale: -1
        },
        expected: fluid.tests.transforms.source.floaty2InString0,
        expectedInputPaths: [ "floaty2" ]
    }, {
        message: "numberToString() converts negative float values with scale invalid",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floaty2",
            scale: NaN
        },
        expected: fluid.tests.transforms.source.floaty2InString,
        expectedInputPaths: [ "floaty2" ]
    }, {
        message: "numberToString() converts added floats (low) with scale",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floatAddLow",
            scale: 1
        },
        expected: fluid.tests.transforms.source.floatAddLowInString,
        expectedInputPaths: [ "floatAddLow" ]
    }, {
        message: "numberToString() converts added floats (high) with scale",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floatAddHigh",
            scale: 2
        },
        expected: fluid.tests.transforms.source.floatAddHighInString,
        expectedInputPaths: [ "floatAddHigh" ]
    }, {
        message: "numberToString() doesn't attempt to convert non-numbers",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "cat"
        },
        expected: undefined,
        expectedInputPaths: [ "cat" ]
    }, {
        message: "numberToString() converts float values - with scale = 1 and method = ceil",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floatyHighy",
            scale: 1,
            method: "ceil"
        },
        expected: fluid.tests.transforms.source.floatInStringScale1Ceil,
        expectedInputPaths: [ "floatyHighy" ]
    }, {
        message: "numberToString() converts float values - with scale = 1 and method = floor",
        transformWrap: true,
        transform: {
            type: "fluid.transforms.numberToString",
            inputPath: "floatyHighy",
            scale: 1,
            method: "floor"
        },
        expected: fluid.tests.transforms.source.floatInStringScale1,
        expectedInputPaths: [ "floatyHighy" ]
    }];

    jqUnit.test("fluid.transforms.numberToString()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.numberToStringTests);
    });

    fluid.tests.transforms.stringToNumberAndInverseTests = [{
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
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.stringToNumberAndInverseTests);
    });

    fluid.tests.transforms.countTests = [{
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
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.countTests, {
            transformWrap: true
        });
    });

    fluid.tests.transforms.roundTests = [{
        message: "round() expected to return round down number",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "floatyLowy"
        },
        expected: 12,
        expectedInputPaths: [ "floatyLowy" ]
    }, {
        message: "round() expected to return round up number",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "floatyHighy"
        },
        expected: 13,
        expectedInputPaths: [ "floatyHighy" ]
    }, {
        message: "round() should round up on negative float.",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "floaty2"
        },
        expected: -9877,
        expectedInputPaths: [ "floaty2" ]
    }, {
        message: "round() round to decimal - up",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "floatyLowy",
            scale: 1
        },
        expected: 12.4,
        expectedInputPaths: [ "floatyLowy" ]
    }, {
        message: "round() round to decimal - down",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "floatyHighy",
            scale: 1
        },
        expected: 12.5,
        expectedInputPaths: [ "floatyHighy" ]
    }, {
        message: "round() round to decimal - whole number",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "hundred",
            scale: 1
        },
        expected: 100,
        expectedInputPaths: [ "hundred" ]
    }, {
        message: "round() round to decimal - ceil",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "floatyHighy",
            scale: 1,
            method: "ceil"
        },
        expected: 12.6,
        expectedInputPaths: [ "floatyHighy" ]
    }, {
        message: "round() round to decimal - floor",
        transform: {
            type: "fluid.transforms.round",
            inputPath: "floatyLowy",
            scale: 1,
            method: "floor"
        },
        expected: 12.3,
        expectedInputPaths: [ "floatyLowy" ]
    }, {
        message: "round() is able to do (lossy) inverse.",
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
            outie: -913
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.identity",
                outputPath: "myin",
                inputPath: "outie"
            }]
        },
        modelAfterInversion: {
            myin: -913
        },
        weaklyInvertible: true,
        transformWrap: false,
        method: "assertDeepEq"
    }];

    jqUnit.test("fluid.transforms.round()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.roundTests, {
            transformWrap: true
        });
    });

    fluid.tests.transforms.firstValueTests = [{
        message: "firstValue() should return the first non-undefined value in paths",
        transform: {
            type: "fluid.transforms.firstValue",
            values: ["cat", "dog"]
        },
        expected: fluid.tests.transforms.source.cat,
        expectedInputPaths: [ ]
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
            transformWrap: true
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
                defaultInputPath: "tracking",
                match: fluid.tests.transforms.mapperOptions
            },
            expected: {
                "FollowFocus": true
            },
            expectedInputPaths: [ "tracking" ]
        },
        "nonString": {
            message: "valueMapper with default output value and non-string input value",
            model: {
                condition: true
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "condition",
                defaultOutputValue: "CATTOO",
                match: {
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
            },
            expectedInputPaths: [ "condition" ]
        },
        "outputUndefinedValue-test1": {
            message: "valueMapper with outputUndefinedValue",
            model: {
                condition: true
            },
            transform: {
                transform: {
                    type: "fluid.transforms.valueMapper",
                    defaultInputPath: "condition",
                    defaultOutputValue: "CATTOO",
                    match: {
                        "true": {
                            outputPath: "trueCATT",
                            outputUndefinedValue: true
                        },
                        "false": {
                            outputPath: "falseCATT"
                        }
                    }
                }
            },
            expected: {},
            expectedInputPaths: [ "condition" ],
            transformWrap: false
        },
        "outputUndefinedValue-falsevalue": {
            message: "valueMapper with outputUndefinedValue set to false",
            model: {
                condition: true
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "condition",
                defaultOutputValue: "CATTOO",
                match: {
                    "true": {
                        outputPath: "trueCATT",
                        outputUndefinedValue: false
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
                defaultInputPath: "condition",
                defaultOutputValue: "CATTOO",
                match: [
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
        "inputPath-works": {
            message: "inputPath in 'match' overrides defaultInputPath",
            model: {
                whichAnimal: "CATTOO",
                whichCountry: "Brazil"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "bogusPath",
                defaultOutputValue: "CATT",
                match: [
                    {
                        inputPath: "whichAnimal",
                        inputValue: "CATTOO",
                        outputPath: "trueCATT"
                    }, {
                        inputPath: "whichAnimal",
                        inputValue: "tiger",
                        outputPath: "falseCATT"
                    }
                ]
            },
            expected: {
                "trueCATT": "CATT"
            },
            expectedInputPaths: [ "bogusPath", "whichAnimal" ]
        },
        "inputPath-no-defaultInputPath-fallback": {
            message: "inputPath does not fallback to defaultInputPath if no value is found at inputPath",
            model: {
                whichAnimal: "CATTOO",
                whichCountry: "Brazil"
            },
            transform: {
                transform: {
                    type: "fluid.transforms.valueMapper",
                    defaultInputPath: "whichAnimal",
                    defaultOutputValue: "CATT",
                    match: [
                        {
                            inputPath: "bogusPath",
                            inputValue: "CATTOO",
                            outputPath: "trueCATT"
                        }, {
                            inputPath: "bogusPath",
                            inputValue: "tiger",
                            outputPath: "falseCATT"
                        }
                    ]
                }
            },
            expected: {},
            expectedInputPaths: [ "whichAnimal", "bogusPath" ],
            transformWrap: false
        },
        "inputPath-double-match-first-returned": {
            message: "inputPath - if multiple directives matches, first one is returned",
            model: {
                whichAnimal: "CATTOO",
                whichCountry: "Brazil"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "whichAnimal",
                defaultOutputValue: "youWin",
                match: [
                    {
                        inputPath: "whichAnimal",
                        inputValue: "CATTOO",
                        outputPath: "smartAnimal"
                    }, {
                        inputPath: "whichCountry",
                        inputValue: "Brazil",
                        outputPath: "smartCountry"
                    }
                ]
            },
            expected: {
                smartAnimal: "youWin"
            },
            expectedInputPaths: [ "whichAnimal", "whichCountry" ]
        },
        "multiMatch-test": {
            message: "valueMapper tie-breaks equally good matches by selecting the first",
            model: {
                whichAnimal: "CATTOO"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "whichAnimal",
                defaultOutputValue: "CATTOO",
                match: [
                    {
                        inputValue: "CATTOO",
                        outputPath: "firstCATT"
                    }, {
                        inputValue: "CATTOO",
                        outputPath: "secondCATT"
                    }
                ]
            },
            expected: {
                "firstCATT": "CATTOO"
            }
        },
        "noMatch-test1": {
            message: "valueMapper using noMatch",
            model: {
                whichAnimal: "CATTOO"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "condition",
                defaultOutputValue: "CATTOO",
                match: [
                    {
                        inputValue: "eagle",
                        outputPath: "trueCATT"
                    }, {
                        inputValue: "tiger",
                        outputPath: "falseCATT"
                    }
                ],
                noMatch: {
                    outputPath: "WhosThat",
                    outputValue: "theNoMatchCATT"
                }
            },
            expected: {
                "WhosThat": "theNoMatchCATT"
            }
        },
        "noMatch-test2": {
            message: "valueMapper with noMatch still able to match regularly",
            model: {
                whichAnimal: "tiger"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "whichAnimal",
                defaultOutputValue: "CATTOO",
                match: [
                    {
                        inputValue: "eagle",
                        outputPath: "trueCATT"
                    }, {
                        inputValue: "tiger",
                        outputPath: "falseCATT"
                    }
                ],
                noMatch: {
                    outputPath: "WhosThat",
                    outputValue: "theNoMatchCATT"
                }
            },
            expected: {
                "falseCATT": "CATTOO"
            }
        },
        "noMatch-works-with-outputUndefinedValue": {
            message: "valueMapper using noMatch is working with outputUndefinedValue",
            model: {
                whichAnimal: "CATTOO"
            },
            transform: {
                transform: {
                    type: "fluid.transforms.valueMapper",
                    defaultInputPath: "condition",
                    defaultOutputValue: "CATTOO",
                    defaultOutputPath: "mypath",
                    match: [
                        {
                            inputValue: "eagle",
                            outputPath: "trueCATT"
                        }, {
                            inputValue: "tiger",
                            outputPath: "falseCATT"
                        }
                    ],
                    noMatch: {
                        outputPath: "WhosThat",
                        outputUndefinedValue: true
                    }
                }
            },
            expected: {},
            transformWrap: false
        },
        "noMatch-works-with-defaultOutputValue": {
            message: "valueMapper using noMatch is working with defaultOutputValue",
            model: {
                whichAnimal: "CATTOO"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "condition",
                defaultOutputValue: "CATTOO",
                defaultOutputPath: "mypath",
                match: [
                    {
                        inputValue: "eagle",
                        outputPath: "trueCATT"
                    }, {
                        inputValue: "tiger",
                        outputPath: "falseCATT"
                    }
                ],
                noMatch: {
                    outputPath: "WhosThat"
                }
            },
            expected: {
                WhosThat: "CATTOO"
            }
        },
        "noMatch-works-with-defaultOutputPath": {
            message: "valueMapper using noMatch is working with defaultOutputPath",
            model: {
                whichAnimal: "CATTOO"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "condition",
                defaultOutputValue: "CATTOO",
                defaultOutputPath: "mypath",
                match: [
                    {
                        inputValue: "eagle",
                        outputPath: "trueCATT"
                    }, {
                        inputValue: "tiger",
                        outputPath: "falseCATT"
                    }
                ],
                noMatch: {
                    outputValue: "myValue"
                }
            },
            expected: {
                mypath: "myValue"
            }
        },
        "defaultOutpath": {
            message: "valueMapper with defaultOutputPath",
            model: {
                foo: "bar"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "foo",
                defaultOutputPath: "stupidCATT",
                match: {
                    bar: {
                        outputValue: "it works"
                    }
                }
            },
            expected: {
                stupidCATT: "it works"
            }
        },
        "defaultOutpath-2": {
            message: "valueMapper with defaultOutputPath uses outputPath if available",
            model: {
                foo: "bar"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "foo",
                defaultOutputPath: "stupidCATT",
                match: {
                    bar: {
                        outputValue: "it works",
                        outputPath: "decentCATT"
                    }
                }
            },
            expected: {
                decentCATT: "it works"
            }
        },
        "unmatched-no-defaults": {
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
                defaultInputPath: "display.screenEnhancement.tracking",
                match: {
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
                defaultInputPath: "animals.mammals.elephant",
                match: {
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
            },
            whichAnimal: "animals.mammals.elephant",
            weaklyInvertible: false // due to nested transforms
        },
        "valueMapping-multiout": {
            message: "valueMapper with multiple outputs to different paths",
            model: {
                screenReaderTTSEnabled: false
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "screenReaderTTSEnabled",
                match: {
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
            },
            weaklyInvertible: false // due to nested transforms
        },
        "FLUID-5300": {
            message: "FLUID-5300: Compact way to produce literal output",
            model: {
                hazard: "flashing"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "hazard",
                match: {
                    "flashing": {
                        "outputValue": {
                            "hasHazard": true,
                            "sound": true
                        }
                    }
                }
            },
            expected: {
                hasHazard: true,
                sound: true
            }
        },
        "FLUID-5300 #2": {
            message: "FLUID-5300 #2: Ultra compact way for outputting primitive types",
            model: {
                hazard: "flashing"
            },
            transform: {
                value: {
                    transform: {
                        type: "fluid.transforms.valueMapper",
                        defaultInputPath: "hazard",
                        match: {
                            "flashing": "test"
                        }
                    }
                }
            },
            expected: {
                value: "test"
            },
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.valueMapper",
                    defaultOutputPath: "hazard",
                    defaultInputPath: "value",
                    match: [{
                        inputValue: "test",
                        outputValue: "flashing"
                    }]
                }]
            },
            transformWrap: false

        },
        "FLUID-5608": {
            message: "FLUID-5608: be able to output `false` (as outputValue) in short format",
            model: {
                hazard: "flashing"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "hazard",
                match: {
                    "flashing": false,
                    "non-flashing": true
                }
            },
            expected: false
        },
        "FLUID-5608 #2": {
            message: "FLUID-5608 #2: be able to output `false` (as outputValue) in noMatch directive",
            model: {
                hazard: "bla"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "hazard",
                match: {
                    "flashing": false,
                    "non-flashing": true
                },
                noMatch: false
            },
            expected: false
        },
        "FLUID-5608 #3": {
            message: "FLUID-5608 #3: be able to output `false` to outputPath",
            model: {
                hazard: "flashing"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "hazard",
                match: {
                    "flashing": {
                        outputValue: false,
                        outputPath: "myPath"
                    }
                }
            },
            expected: {
                myPath: false
            }
        },
        "FLUID-5608 #4": {
            message: "FLUID-5608 #4: be able to output `false` defaultOutputValue",
            model: {
                hazard: "flashing"
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "hazard",
                defaultOutputValue: false,
                match: {
                    "flashing": {
                        outputPath: "myPath1"
                    }
                }
            },
            expected: {
                myPath1: false
            }
        },
        "FLUID-5473": {
            message: "FLUID-5473: Support \"noMatch\" as a means for explicitly outputting value in case of no match",
            model: {
                flashing: true,
                noFlashing: true
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultOutputPath: "flashing",
                defaultOutputValue: "unknown",
                match: [
                    {
                        inputValue: { flashing: true },
                        partialMatches: true,
                        outputValue: "flashing"
                    },
                    {
                        inputValue: { noflashing: true },
                        partialMatches: true,
                        outputValue: "noflashing"
                    }
                ],
                noMatch: {
                    outputValue: "unknown"
                }
            },
            expected: {
                flashing: "unknown"
            }
        },
        "UndefinedOutputValue-test": {
            message: "valueMapper - UndefinedOutputValue behaves correctly on inversion",
            model: {
                info: {
                    "tester": true,
                    "bester": true
                }
            },
            transform: {
                transform: {
                    type: "fluid.transforms.valueMapper",
                    defaultInputPath: "info",
                    defaultOutputPath: "whoWon",
                    match: [{
                        inputValue: "tester",
                        partialMatches: true,
                        outputUndefinedValue: true
                    }, {
                        inputValue: "bester",
                        outputValue: "I'm hit",
                        partialMatches: true
                    }]
                }
            },
            expected: {},
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.valueMapper",
                    defaultInputPath: "whoWon",
                    defaultOutputPath: "info",
                    match: [{
                        outputValue: "bester",
                        inputValue: "I'm hit"
                    }]
                }]
            },
            transformWrap: false
        },
        "FLUID-6174": {
            message: "FLUID-6174: Support \"input\" for sourcing model data",
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultOutputPath: "flashing",
                defaultOutputValue: false,
                defaultInput: "blinking",
                match: {
                    blinking: true
                }
            },
            expected: {
                flashing: true
            }
        },
        "FLUID-6174-nested": {
            message: "FLUID-6174: Support \"input\" for sourcing model data from a nested transform",
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultOutputPath: "flashing",
                defaultOutputValue: "unknown",
                defaultInput: {
                    transform: {
                        type: "fluid.transforms.identity",
                        input: {
                            blinking: false
                        }
                    }
                },
                match: [{
                    inputValue: {
                        blinking: false
                    },
                    partialMatches: true,
                    outputValue: false
                }]
            },
            expected: {
                flashing: false
            }
        },
        "FLUID-6248: Valuemapper collects paths from defaultInput": {
            message: "Valuemapper with nested arrayToSetMembership as input",
            transform: {
                "type": "fluid.transforms.valueMapper",
                "match": [{
                    "inputValue": {
                        "dictionaryEnabled": true
                    },
                    "outputValue": true
                }],
                "noMatch": {
                    "outputValue": false
                },
                "defaultInput": {
                    "transform": {
                        "type": "fluid.transforms.arrayToSetMembership",
                        "inputPath": "http://registry\\.gpii\\.net/common/supportTool",
                        "options": {
                            "dictionary": "dictionaryEnabled"
                        }
                    }
                }
            },
            expectedInputPaths: [ "http://registry\\.gpii\\.net/common/supportTool" ],
            model: {
                "http://registry.gpii.net/common/supportTool": ["dictionary"]
            },
            expected: true,
            weaklyInvertible: false
        }
    };


    fluid.tests.transforms.mapperMatchDirectiveForPartial = [
        {
            inputValue: {
                "legs": 2,
                "arms": 2,
                "hasLazers": true
            },
            outputValue: "KASPARNET"
        }, {
            inputValue: {
                "legs": 2,
                "arms": 2,
                "veryhairy": false
            },
            partialMatches: true,
            outputValue: "human"
        }, {
            inputValue: {
                "legs": 2,
                "arms": 2
            },
            partialMatches: true,
            outputValue: "probably monkey"
        }, {
            inputValue: {
                "eyes": 2
            },
            partialMatches: true,
            outputValue: "can see"
        }, {
            inputValue: {
                "arms": 2
            },
            partialMatches: true,
            outputValue: "can handstand"
        }, {
            inputValue: {
                "fingers": 2000
            },
            partialMatches: true,
            outputUndefinedValue: true
        }, {
            inputValue: {
                "special": 1
            },
            partialMatches: true
        }, {
            inputValue: {
                "special": 2
            },
            partialMatches: true,
            outputPath: "secretPath"
        }
    ];

    fluid.tests.transforms.mapperTestsForPartial = [
        {
            message: "valueMapper partialMatches available, but non-partial is fully matching",
            model: {
                info: {
                    "legs": 2,
                    "arms": 2,
                    "hasLazers": true
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "info",
                defaultOutputPath: "creature",
                match: [
                    {
                        inputValue: {
                            "legs": 2,
                            "arms": 2,
                            "hasLazers": true
                        },
                        outputValue: "KASPARNET"
                    }, {
                        inputValue: {
                            "legs": 2,
                            "arms": 2,
                            "veryhairy": false
                        },
                        partialMatches: true,
                        outputValue: "human"
                    }
                ]
            },
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.valueMapper",
                    defaultOutputPath: "info",
                    defaultInputPath: "value.creature",
                    match: [{
                        inputValue: "KASPARNET",
                        outputValue: {
                            "legs": 2,
                            "arms": 2,
                            "hasLazers": true
                        }
                    }, {
                        outputValue: {
                            "legs": 2,
                            "arms": 2,
                            "veryhairy": false
                        },
                        inputValue: "human"
                    }]
                }]
            },
            expected: {
                creature: "KASPARNET"
            }
        }, {
            message: "valueMapper partialMatches entry matches fully",
            model: {
                info: {
                    "legs": 2,
                    "arms": 2,
                    "veryhairy": false
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "info",
                defaultOutputPath: "creature",
                match: fluid.tests.transforms.mapperMatchDirectiveForPartial
            },
            expected: {
                creature: "human"
            }
        }, {
            message: "valueMapper partialMatches: partial match works",
            model: {
                info: {
                    "arms": 2,
                    "ears": 2
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "info",
                defaultOutputPath: "creature",
                match: fluid.tests.transforms.mapperMatchDirectiveForPartial
            },
            expected: {
                creature: "can handstand"
            }
        }, {
            message: "valueMapper partialMatches: best partial match wins",
            model: {
                info: {
                    "arms": 2,
                    "eyes": 2,
                    "legs": 2
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "info",
                defaultOutputPath: "creature",
                match: fluid.tests.transforms.mapperMatchDirectiveForPartial
            },
            expected: {
                creature: "probably monkey"
            }
        }, {
            message: "valueMapper partialMatches: if 2+ best partial matches ties, first match is returned",
            model: {
                info: {
                    "arms": 2,
                    "eyes": 2
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "info",
                defaultOutputPath: "creature",
                match: fluid.tests.transforms.mapperMatchDirectiveForPartial
            },
            expected: {
                creature: "can see"
            }
        }, {
            message: "valueMapper partialMatches: working with outputUndefinedValue",
            model: {
                info: {
                    "face": false,
                    "fingers": 2000
                }
            },
            transform: {
                transform: {
                    type: "fluid.transforms.valueMapper",
                    defaultInputPath: "info",
                    defaultOutputPath: "creature",
                    match: fluid.tests.transforms.mapperMatchDirectiveForPartial
                }
            },
            expected: {},
            transformWrap: false
        }, {
            message: "valueMapper partialMatches: working with defaultOutputValue",
            model: {
                info: {
                    "special": 1,
                    "other": true
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "info",
                defaultOutputPath: "creature",
                defaultOutputValue: "default animal",
                match: fluid.tests.transforms.mapperMatchDirectiveForPartial
            },
            expected: {
                creature: "default animal"
            }
        }, {
            message: "valueMapper partialMatches: working with outputPath overrides default",
            model: {
                info: {
                    "special": 2,
                    "other": true
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "info",
                defaultOutputPath: "creature",
                defaultOutputValue: "default animal",
                match: fluid.tests.transforms.mapperMatchDirectiveForPartial
            },
            expected: {
                secretPath: "default animal"
            }
        }, {
            message: "valueMapper - exact partialMatch vs. input path - first entry wins",
            model: {
                info: {
                    "special": 2,
                    "other": true
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "info",
                defaultOutputPath: "whoWon",
                match: [{
                    inputPath: "info.special",
                    inputValue: 2,
                    outputValue: "inputPath won"
                }, {
                    partialMatches: true,
                    inputValue: {
                        "special": 2,
                        "other": true
                    },
                    outputValue: "partialMatches won"
                }]
            },
            expected: {
                whoWon: "inputPath won"
            },
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.valueMapper",
                    defaultInputPath: "value.whoWon",
                    defaultOutputPath: "info",
                    match: [{
                        outputPath: "info.special",
                        inputValue: "inputPath won",
                        outputValue: 2
                    }, {
                        outputValue: {
                            "special": 2,
                            "other": true
                        },
                        inputValue: "partialMatches won"
                    }]
                }]
            }
        }, {
            message: "valueMapper - exact partialMatches vs. input path - first entry wins #2",
            model: {
                info: {
                    "special": 2,
                    "other": true
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "info",
                defaultOutputPath: "whoWon",
                match: [{
                    partialMatches: true,
                    inputValue: {
                        "special": 2,
                        "other": true
                    },
                    outputValue: "partialMatches won"
                }, {
                    inputPath: "info.special",
                    inputValue: 2,
                    outputValue: "inputPath won"
                }]
            },
            expected: {
                whoWon: "partialMatches won"
            },
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.valueMapper",
                    defaultInputPath: "value.whoWon",
                    defaultOutputPath: "info",
                    match: [{
                        outputValue: {
                            "special": 2,
                            "other": true
                        },
                        inputValue: "partialMatches won"
                    }, {
                        outputPath: "info.special",
                        inputValue: "inputPath won",
                        outputValue: 2
                    }]
                }]
            }
        }, {
            message: "valueMapper - unexact partialMatch vs. input path - input path wins",
            model: {
                info: {
                    "special": 2,
                    "other": true
                }
            },
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "info",
                defaultOutputPath: "whoWon",
                match: [{
                    partialMatches: true,
                    inputValue: {
                        "special": 2
                    },
                    outputValue: "partialMatches won"
                }, {
                    inputPath: "info.special",
                    inputValue: 2,
                    outputValue: "inputPath won"
                }]
            },
            expected: {
                whoWon: "inputPath won"
            },
            weaklyInvertible: false // due to the two matches actually being identical wrt what they're testing (ie. info.special: 2)
        }, {
            message: "valueMapper - partial match when part of it is given as inputPath (a part which doesn't affect how well it matches) #1",
            model: {
                a: {
                    b: 1,
                    c: 2
                }
            },
            transform: {
                type: "valueMapper",
                defaultInputPath: "",
                defaultOutputPath: "whoWon",
                match: [{
                    inputPath: "a",
                    partialMatches: true,
                    inputValue: { b: 1 },
                    outputValue: "first one"
                }, {
                    partialMatches: true,
                    inputValue: { a: { b: 1 }},
                    outputValue: "second one"
                }]
            },
            expected: {
                whoWon: "first one"
            }
        }, {
            message: "valueMapper - partial match when part of it is given as inputPath (a part which doesn't affect how well it matches) #2",
            model: {
                a: {
                    b: 1,
                    c: 2
                }
            },
            transform: {
                type: "valueMapper",
                defaultInputPath: "",
                defaultOutputPath: "whoWon",
                match: [{
                    partialMatches: true,
                    inputValue: { a: { b: 1 }},
                    outputValue: "new first one"
                }, {
                    inputPath: "a",
                    partialMatches: true,
                    inputValue: { b: 1 },
                    outputValue: "new second one"
                }]
            },
            expected: {
                whoWon: "new first one"
            }
        }, {
            message: "valueMapper: we partial match only looking at the content of the given path",
            model: {
                a: {
                    b: 1,
                    c: 2
                },
                x: "extra"
            },
            transform: {
                type: "valueMapper",
                defaultInputPath: "",
                defaultOutputPath: "outie",
                match: [{
                    partialMatches: true,
                    inputPath: "a",
                    inputValue: { b: 1 },
                    outputValue: "first"
                }, {
                    partialMatches: true,
                    inputValue: { a: { b: 1 }},
                    outputValue: "second"
                }]
            },
            expected: {
                outie: "first"
            }
        }
    ];

    jqUnit.test("fluid.transforms.valueMapper()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.mapperTests, {
            transformWrap: true,
            method: "assertDeepEq",
            weaklyInvertible: true
        });
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.mapperTestsForPartial, {
            transformWrap: true,
            method: "assertDeepEq",
            weaklyInvertible: true
        });

    });

    fluid.tests.transforms.a4aFontRules = {
        "textFont": {
            "transform": {
                "type": "fluid.transforms.valueMapper",
                "defaultInputPath": "fontFace.genericFontFace",
                "_comment": "TODO: For now, this ignores the actual \"fontName\" setting",
                "match": {
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
            "textFont.transform.match.*": {
                transform: {
                    type: "fluid.tests.transforms.expandCompactRule"
                }
            },
            "": "" // put this last to test key sorting
        };
        var expandedRules = fluid.model.transform(fluid.tests.transforms.a4aFontRules, exRules);
        var expectedRules = fluid.copy(fluid.tests.transforms.a4aFontRules);
        fluid.set(expectedRules, "textFont.transform.match", fluid.transform(fluid.tests.transforms.a4aFontRules.textFont.transform.match, function (value) {
            return fluid.tests.transforms.expandCompactRule(value);
        }));
        jqUnit.assertDeepEq("Rules transformed to expanded form", expectedRules, expandedRules);
        testCompact(" - expanded", expandedRules);
    });

    fluid.tests.transforms.metadataRules = {
        type: "fluid.transforms.valueMapper",
        defaultOutputPath: "soundHazard",
        defaultInputPath: "",
        match: [
            {
                inputPath: "flashing",
                outputValue: "yes",
                inputValue: true
            }, {
                inputPath: "noFlashingHazard",
                outputValue: "no",
                inputValue: true
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
                defaultInputPath: "tracking",
                match: fluid.tests.transforms.mapperOptions
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
                defaultInputPath: "",
                match: [
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
                defaultInputPath: "",
                match: [ {
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
                defaultInputPath: "audio",
                match: [
                    {
                        "inputValue": true,
                        "outputPath": "audio",
                        "outputValue": "available"
                    },
                    {
                        "inputValue": false,
                        "outputPath": "audio",
                        "outputValue": "unavailable"
                    }
                ]
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
                "defaultInputPath": "display.screenEnhancement.tracking",
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
            defaultInputPath: "",
            match: [{
                inputValue: {
                    "isTooltipOpen": true,
                    "isDialogOpen": true
                },
                outputValue: true
            }],
            noMatch: {
                outputValue: false
            }
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
        transform: {
            type: "fluid.transforms.count",
            inputPath: "idontexist"
        },
        expected: undefined
    }, {
        message: "FLUID-5130: input from expander that evaluates to undefined",
        transform: {
            type: "fluid.transforms.count",
            input: {
                transform: {
                    type: "fluid.transforms.count",
                    inputPath: "i.dont.exist"
                }
            }
        },
        expected: undefined
    }];

    jqUnit.test("Tests for undefined inputs to standardInputTransformations", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.undefinedSingleInput, {
            transformWrap: true
        });
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
        expected: "This is a CATTTE"
    }];

    jqUnit.test("Defeat undefined input issue with side-inputs", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.fluid5703);
    });

    /* --------------- indexArrayByKey and inverse tests -------------------- */
    fluid.tests.transforms.indexArrayByKeyTests = [
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
                        type: "fluid.transforms.indexArrayByKey",
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
                        type: "fluid.transforms.deindexIntoArrayByKey",
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
                        type: "fluid.transforms.indexArrayByKey",
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
                        type: "fluid.transforms.deindexIntoArrayByKey",
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
                    type: "fluid.transforms.indexArrayByKey",
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
            expectedInputPaths: [ "foo.bar" ],
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.deindexIntoArrayByKey",
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
                        type: "fluid.transforms.indexArrayByKey",
                        inputPath: "outer",
                        key: "outerpivot",
                        innerValue: [
                            {
                                "outervar": {
                                    "transform": {
                                        type: "fluid.transforms.indexArrayByKey",
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
                "outer"
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
                    type: "fluid.transforms.deindexIntoArrayByKey",
                    inputPath: "outer",
                    outputPath: "outer",
                    key: "outerpivot",
                    innerValue: [{
                        transform: [{
                            type: "fluid.transforms.deindexIntoArrayByKey",
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
                        type: "fluid.transforms.indexArrayByKey",
                        inputPath: "outer",
                        key: "outerpivot",
                        innerValue: [
                            {
                                "outervar.arr1": {
                                    "transform": {
                                        type: "fluid.transforms.indexArrayByKey",
                                        inputPath: "outervar.arr1",
                                        key: "innerpivot1"
                                    }
                                }
                            },
                            {
                                "outervar.arr2": {
                                    "transform": {
                                        type: "fluid.transforms.indexArrayByKey",
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
                "outer"
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
                    type: "fluid.transforms.deindexIntoArrayByKey",
                    inputPath: "outer",
                    outputPath: "outer",
                    key: "outerpivot",
                    innerValue: [{
                        transform: [{
                            type: "fluid.transforms.deindexIntoArrayByKey",
                            inputPath: "outervar.arr1",
                            outputPath: "outervar.arr1",
                            key: "innerpivot1"
                        }]
                    }, {
                        transform: [{
                            type: "fluid.transforms.deindexIntoArrayByKey",
                            inputPath: "outervar.arr2",
                            outputPath: "outervar.arr2",
                            key: "innerpivot2"
                        }]
                    }]
                }]
            }
        }
    ];

    jqUnit.test("indexArrayByKey and inverse transformation tests", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.indexArrayByKeyTests, {
            method: "assertDeepEq"
        });
    });

        /* --------------- deindexIntoArrayByKey and inverse tests -------------------- */
    fluid.tests.transforms.deindexIntoArrayByKeyTests = [
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
                        type: "fluid.transforms.deindexIntoArrayByKey",
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
                        type: "fluid.transforms.indexArrayByKey",
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
                        type: "fluid.transforms.deindexIntoArrayByKey",
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
                        type: "fluid.transforms.indexArrayByKey",
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
                        type: "fluid.transforms.deindexIntoArrayByKey",
                        inputPath: "outer",
                        key: "outerpivot",
                        innerValue: [
                            {
                                "outervar": {
                                    "transform": {
                                        type: "fluid.transforms.deindexIntoArrayByKey",
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
                "outer"
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
                    type: "fluid.transforms.indexArrayByKey",
                    inputPath: "outer",
                    outputPath: "outer",
                    key: "outerpivot",
                    innerValue: [{
                        transform: [{
                            type: "fluid.transforms.indexArrayByKey",
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
                        type: "fluid.transforms.deindexIntoArrayByKey",
                        inputPath: "outer",
                        key: "outerpivot",
                        innerValue: [
                            {
                                "outervar.arr1": {
                                    "transform": {
                                        type: "fluid.transforms.deindexIntoArrayByKey",
                                        inputPath: "outervar.arr1",
                                        key: "innerpivot1"
                                    }
                                }
                            },
                            {
                                "outervar.arr2": {
                                    "transform": {
                                        type: "fluid.transforms.deindexIntoArrayByKey",
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
                    type: "fluid.transforms.indexArrayByKey",
                    inputPath: "outer",
                    outputPath: "outer",
                    key: "outerpivot",
                    innerValue: [{
                        transform: [{
                            type: "fluid.transforms.indexArrayByKey",
                            inputPath: "outervar.arr1",
                            outputPath: "outervar.arr1",
                            key: "innerpivot1"
                        }]
                    }, {
                        transform: [{
                            type: "fluid.transforms.indexArrayByKey",
                            inputPath: "outervar.arr2",
                            outputPath: "outervar.arr2",
                            key: "innerpivot2"
                        }]
                    }]
                }]
            }
        }
    ];

    jqUnit.test("deindexIntoArrayByKey transformation tests", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.deindexIntoArrayByKeyTests, {
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
        expected: 14.5,
        expectedInputPaths: []
    }, {
        message: "limitRange with inputPath",
        transform: {
            type: "fluid.transforms.limitRange",
            min: -3,
            max: 3,
            excludeMax: 1,
            inputPath: "halfdozen"
        },
        expected: 2,
        expectedInputPaths: [ "halfdozen" ]
    }, {
        message: "limitRange is able to do (lossy) inverse.",
        transform: {
            outie: {
                transform: {
                    type: "fluid.transforms.limitRange",
                    min: 0,
                    max: 10,
                    inputPath: "myin"
                }
            }
        },
        model: {
            myin: 11
        },
        expected: {
            outie: 10
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.identity",
                max: 10,
                min: 0,
                outputPath: "myin",
                inputPath: "outie"
            }]
        },
        modelAfterInversion: {
            myin: 10
        },
        weaklyInvertible: true,
        transformWrap: false,
        method: "assertDeepEq"
    }
    ];

    jqUnit.test("limitRange tests", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.limitRangeTests, {
            transformWrap: true
        });
    });

    /* --------------- fluid.transforms.indexOf tests -------------------- */

    fluid.tests.transforms.indexOfTests = [{
        message: "indexOf() should return the index of the value on the array.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: ["sheep", "dog"],
            inputPath: "element"
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.dereference",
                array: ["sheep", "dog"],
                outputPath: "element",
                inputPath: "value"
            }]
        },
        model: {
            element: "dog"
        },
        expected: 1,
        expectedInputPaths: [ "element" ]
    }, {
        message: "indexOf() should return the index of the value when the value of the \"array\" argument is arrayable and match.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: "sheep",
            inputPath: "element"
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.dereference",
                array: "sheep",
                outputPath: "element",
                inputPath: "value"
            }]
        },
        model: {
            element: "sheep"
        },
        expected: 0
    }, {
        message: "indexOf() should add offset value to the return.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: ["sheep", "dog"],
            inputPath: "element",
            offset: 3
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
        model: {
            element: "dog"
        },
        expected: 4
    }, {
        message: "indexOf() should add offset value to the return even when the offset value can be converted to a number.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: ["sheep", "dog"],
            inputPath: "element",
            offset: "1"
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
        model: {
            element: "dog"
        },
        expected: 2
    }];

    fluid.tests.transforms.indexOfBoundaryTests = [{
        message: "indexOf() should return -1 when the value is not found in the array.",
        transform: {
            type: "fluid.transforms.indexOf",
            array: ["sheep", "dog"],
            input: "cat"
        },
        expected: -1,
        expectedInputPaths: []
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
            array: ["sheep", "dog"],
            input: undefined
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
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.indexOfTests, {
            transformWrap: true,
            fullyInvertible: true
        });

        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.indexOfBoundaryTests, {
            transformWrap: true,
            weaklyInvertible: true
        });
    });

    /* --------------- fluid.transforms.dereference tests -------------------- */

    fluid.tests.transforms.deferenceTests = [{
        message: "dereference() should return the value in an array based on the given index.",
        transform: {
            type: "fluid.transforms.dereference",
            array: ["sheep", "dog"],
            inputPath: "element"
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.indexOf",
                array: ["sheep", "dog"],
                outputPath: "element",
                inputPath: "value"
            }]
        },
        model: {
            element: 1
        },
        expected: "dog"
    }, {
        message: "dereference() should return the value when the \"array\" is arrayable and match the given index.",
        transform: {
            type: "fluid.transforms.dereference",
            array: "sheep",
            inputPath: "element"
        },
        invertedRules: {
            transform: [{
                type: "fluid.transforms.indexOf",
                array: "sheep",
                outputPath: "element",
                inputPath: "value"
            }]
        },
        model: {
            element: 0
        },
        expected: "sheep",
        expectedInputPaths: [ "element" ]
    }, {
        message: "dereference() should take the offset value into consideration.",
        transform: {
            type: "fluid.transforms.dereference",
            array: ["sheep", "dog"],
            offset: -3,
            inputPath: "element"
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
        model: {
            element: 4
        },
        expected: "dog"
    }, {
        message: "dereference() should take the offset value into consideration if the offset value can be converted to a number.",
        transform: {
            type: "fluid.transforms.dereference",
            array: ["sheep", "dog"],
            offset: "-1",
            inputPath: "element"
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
        model: {
            element: 2
        },
        expected: "dog"
    }, {
        message: "dereference() should ignore notFound when the value is found in the array.",
        transform: {
            type: "fluid.transforms.dereference",
            array: ["sheep", "dog"],
            notFound: "notFound",
            inputPath: "element"
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
        model: {
            element: 0
        },
        expected: "sheep"
    }];

    fluid.tests.transforms.dereferenceBoundaryTests = [{
        message: "dereference() should return undefined when the given index is -1.",
        transform: {
            type: "fluid.transforms.dereference",
            array: ["sheep", "dog"],
            input: -1
        },
        expected: undefined,
        expectedInputPaths: []
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
            input: undefined,
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
    }];

    jqUnit.test("fluid.transforms.dereference()", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.deferenceTests, {
            transformWrap: true,
            fullyInvertible: true
        });

        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.dereferenceBoundaryTests, {
            transformWrap: true
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
            transformWrap: true
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
                    options: {
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
        expectedInputPaths: [ "a" ],
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
                    options: {
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
    },  {
        message: "FLUID-5907 test: escaping of EL values",
        model: {
            "http://registry.gpii.net/common/trackingTTS": [ "focus", "caret" ]
        },
        transform: {
            transform: {
                type: "fluid.transforms.arrayToSetMembership",
                inputPath: "http://registry\\.gpii\\.net/common/trackingTTS",
                outputPath: "",
                presentValue: true,
                missingValue: false,
                options: {
                    focus: "reviewCursor\\.followFocus",
                    caret: "reviewCursor\\.followCaret",
                    mouse: "reviewCursor\\.followMouse"
                }
            }
        },
        expected: {
            "reviewCursor.followFocus": true,
            "reviewCursor.followCaret": true,
            "reviewCursor.followMouse": false
        },
        invertedRules: {
            transform: [
                {
                    type: "fluid.transforms.setMembershipToArray",
                    outputPath: "http://registry\\.gpii\\.net/common/trackingTTS",
                    inputPath: "",
                    presentValue: true,
                    missingValue: false,
                    options: {
                        "reviewCursor\\.followFocus": "focus",
                        "reviewCursor\\.followCaret": "caret",
                        "reviewCursor\\.followMouse": "mouse"
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
        expectedInputPaths: [ "a" ],
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
    }, {
        message: "Checking for missing / extra values",
        model: {
            detections: {
                hasMouse: "supported",
                hasKeyboard: "supported",
                hasTrackpad: "not supported",
                hasHeadtracker: "not supported",
                hasTelephone: "supported"
            }
        },
        transform: {
            transform: {
                type: "fluid.transforms.setMembershipToArray",
                inputPath: "detections",
                outputPath: "controls",
                presentValue: "supported",
                missingValue: "not supported",
                options: {
                    hasMouse: "mouse",
                    hasKeyboard: "keyboard",
                    hasTrackpad: "trackpad",
                    hasHeadtracker: "headtracker"
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
                    presentValue: "supported",
                    missingValue: "not supported",
                    options: {
                        mouse: "hasMouse",
                        keyboard: "hasKeyboard",
                        trackpad: "hasTrackpad",
                        headtracker: "hasHeadtracker"
                    }
                }
            ]
        },
        weaklyInvertible: true
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
        expectedInputPaths: [ "someval" ],
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
        expectedInputPaths: [ "" ],
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
                jqUnit.assertDeepEq(quantizeTest.name + " - " + testname, test.expected === undefined ? {} : test.expected, transformed);
                var collected = fluid.model.transform.collectInputPaths(quantizeTest.rules);
                jqUnit.assertDeepEq(testname + " - collect input paths", quantizeTest.expectedInputPaths, collected);
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
        expectedInputPaths: [ "bar" ],
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
            var collected = fluid.model.transform.collectInputPaths(fluid.tests.transforms.inRangeTests.rules[test.rule]);
            jqUnit.assertDeepEq(tname + " - collect input paths", fluid.tests.transforms.inRangeTests.expectedInputPaths, collected);
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
        errorTexts: "inputPath"
    }, {
        message: "Ensure standardTransformFunction (transforms.value) no longer supports 'valuePath'",
        transform: {
            type: "fluid.transforms.value",
            valuePath: "tester"
        },
        model: {
            tester: "hello"
        },
        errorTexts: "inputPath"
    }, {
        message: "Ensure valueMapper no longer supports 'valuePath'",
        transform: {
            type: "fluid.transforms.valueMapper",
            valuePath: "condition",
            defaultOutputValue: "CATTOO",
            match: {
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
            match: {
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
        errorTexts: "inputPath"
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
        errorTexts: "inputPath"
    }];

    jqUnit.test("FLUID-5294: avoid ambiguous support of 'value' and 'valuePath' - only accept 'input' and 'inputPath'", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.noValueSupport, {
            transformWrap: true
        });
    });

    fluid.tests.transforms.uninvertible = [{
        message: "Plain fluid.identity", // Note that unlike fluid.transforms.identity, this is just a random function with no inverse
        transform: {
            type: "fluid.identity"
        }
    }, {
        message: "Nested fluid.identity", // Our one transform that supports compound inversion
        transform: {
            type: "fluid.transforms.indexArrayByKey",
            inputPath: "outer",
            key: "outerpivot",
            innerValue: [
                {
                    "outervar": {
                        "transform": {
                            type: "fluid.identity",
                            inputPath: "outervar",
                            key: "innerpivot"
                        }
                    }
                }
            ]
        }
    }, {
        message: "Nested within path rule",
        b: {
            transform: {
                type: "fluid.transforms.inRange"
            }
        }
    }];

    jqUnit.test("FLUID-6194: report on uninvertible transforms", function () {
        fluid.each(fluid.tests.transforms.uninvertible, function (oneTransform) {
            var inverted = fluid.model.transform.invertConfiguration(fluid.censorKeys(oneTransform, ["message"]));
            jqUnit.assertEquals(oneTransform.message, fluid.model.transform.uninvertibleTransform, inverted);
        });
    });

    fluid.tests.transforms.objectStringTests = [
        {
            message: "An object should be converted to stringified JSON correctly (with inversion)...",
            transformWrap: false,
            transform: {
                outie: {
                    transform: {
                        type: "fluid.transforms.objectToJSONString",
                        inputPath: "originalObject"
                    }
                }
            },
            expected: { outie: "{\"foo\":\"bar\"}" },
            method: "assertDeepEq",
            model: { originalObject: { foo: "bar" } },
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.JSONstringToObject",
                    outputPath: "originalObject",
                    inputPath: "outie"
                }]
            },
            fullyInvertible: true
        },
        {
            message: "The object -> stringified JSON transform should support spaces...",
            transform: {
                type: "fluid.transforms.objectToJSONString",
                inputPath: "",
                space: 2
            },
            expected: "{\n  \"foo\": \"bar\"\n}",
            method: "assertDeepEq",
            model: { foo: "bar" }
        },
        {
            message: "Stringified JSON should be converted to an object correctly (with inversion)...",
            transformWrap: false,
            transform: {
                outie: {
                    transform: {
                        type: "fluid.transforms.JSONstringToObject",
                        inputPath: "stringifiedObject"
                    }
                }
            },
            expected: { outie: { foo: "bar" } },
            method: "assertDeepEq",
            model: { stringifiedObject: "{\"foo\":\"bar\"}" },
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.objectToJSONString",
                    outputPath: "stringifiedObject",
                    inputPath: "outie"
                }]
            },
            fullyInvertible: true
        },
        {
            message: "Invalid JSON strings should result in undefined values...",
            transform: {
                type: "fluid.transforms.JSONstringToObject",
                inputPath: ""
            },
            expected: undefined,
            method:   "assertDeepEq",
            model:    "stuff and nonsense."
        }
    ];

    jqUnit.test("Object <-> JSON String transforms...", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.objectStringTests, {
            transformWrap: true
        });
    });

    fluid.tests.transforms.stringBooleanTests = [
        {
            message: "A `false` boolean value should be converted to a string correctly...",
            transform: {
                type: "fluid.transforms.booleanToString",
                inputPath: "falseValue"
            },
            expected: "false",
            method: "assertDeepEq",
            model: { falseValue: false }
        },
        {
            message: "`null` should be converted to a string correctly...",
            transform: {
                type: "fluid.transforms.booleanToString",
                inputPath: "undefinedValue"
            },
            expected: "false",
            method: "assertDeepEq",
            model: { undefinedValue: null }
        },
        {
            message: "Zero should be converted to a stringified boolean correctly...",
            transform: {
                type: "fluid.transforms.booleanToString",
                inputPath: "zeroValue"
            },
            expected: "false",
            method: "assertDeepEq",
            model: { zeroValue: 0 }
        },
        {
            message: "A `true` boolean value should be converted to a string correctly...",
            transform: {
                type: "fluid.transforms.booleanToString",
                inputPath: "trueValue"
            },
            expected: "true",
            method: "assertDeepEq",
            model: { trueValue: true }
        },
        {
            message: "A non-empty string should be converted to a stringified boolean correctly...",
            transform: {
                type: "fluid.transforms.booleanToString",
                inputPath: "stringValue"
            },
            expected: "true",
            method: "assertDeepEq",
            model: { stringValue: "something truthy this way comes" }
        },
        {
            message: "One should be converted to a stringified boolean correctly...",
            transform: {
                type: "fluid.transforms.booleanToString",
                inputPath: "oneValue"
            },
            expected: "true",
            method: "assertDeepEq",
            model: { oneValue: 1 }
        },
        {
            message: "An empty string should be converted to a boolean correctly...",
            transform: {
                type: "fluid.transforms.stringToBoolean",
                inputPath: "emptyString"
            },
            expected: false,
            method: "assertDeepEq",
            model: { emptyString: "" }
        },
        {
            message: "A non-empty string should be converted to a boolean correctly...",
            transform: {
                type: "fluid.transforms.stringToBoolean",
                inputPath: ""
            },
            expected: true,
            method: "assertDeepEq",
            model: "something truthy this way comes"
        },
        {
            message: "The string 'true' should be converted to a boolean correctly (with inversion)...",
            transformWrap: false,
            transform: {
                outie: {
                    transform: {
                        type: "fluid.transforms.stringToBoolean",
                        inputPath: "trueString"
                    }
                }
            },
            expected: { outie: true},
            method: "assertDeepEq",
            model: { trueString: "true" },
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.booleanToString",
                    outputPath: "trueString",
                    inputPath: "outie"
                }]
            },
            fullyInvertible: true
        },
        {
            message: "The string 'false' should be converted to a boolean correctly (with inversion)...",
            transformWrap: false,
            transform: {
                outie: {
                    transform: {
                        type: "fluid.transforms.stringToBoolean",
                        inputPath: "falseString"
                    }
                }
            },
            expected: { outie: false },
            method: "assertDeepEq",
            model: { falseString: "false" },
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.booleanToString",
                    outputPath: "falseString",
                    inputPath: "outie"
                }]
            },
            fullyInvertible: true
        }
    ];

    jqUnit.test("String <-> Boolean transforms...", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.stringBooleanTests, {
            transformWrap: true
        });
    });

    fluid.tests.transforms.stringDateTests = [
        {
            message: "A stringified date should be correctly decoded..",
            transform: {
                type: "fluid.transforms.stringToDate",
                inputPath: "dateString"
            },
            expected: new Date("1972-02-05"),
            method: "assertDeepEq",
            model: { dateString: "1972-02-05" }
        },
        {
            message: "A stringified date/time should be correctly decoded (with inversion)..",
            transformWrap: false,
            transform: {
                outie: {
                    transform: {
                        type: "fluid.transforms.stringToDate",
                        inputPath: "dateTimeString"
                    }
                }
            },
            expected: { outie: new Date("1972-02-05T17:14:25.000Z") },
            method: "assertDeepEq",
            model: { dateTimeString: "1972-02-05T17:14:25.000Z" }
        },
        {
            message: "A meaningless string should result in an undefined date value...",
            transform: {
                type: "fluid.transforms.stringToDate",
                inputPath: "meaninglessDate"
            },
            expected: undefined,
            method: "assertDeepEq",
            model: { meaninglessDate: "whenever I feel like it" }
        },
        {
            message: "A date should be correctly converted to a string...",
            transform: {
                type: "fluid.transforms.dateToString",
                inputPath: "date"
            },
            expected: "2014-01-17",
            method: "assertDeepEq",
            model: { date: new Date("2014-01-17") }
        },
        {
            message: "A date/time should be correctly converted to a string (with inversion)...",
            transformWrap: false,
            transform: {
                outie: {
                    transform: {
                        type: "fluid.transforms.dateTimeToString",
                        inputPath: "dateTime"
                    }
                }
            },
            expected: { outie: "2011-04-22T17:14:25.000Z"},
            method: "assertDeepEq",
            model: { dateTime: new Date("2011-04-22T17:14:25.000Z") },
            invertedRules: {
                transform: [{
                    type: "fluid.transforms.stringToDate",
                    outputPath: "dateTime",
                    inputPath: "outie"
                }]
            },
            fullyInvertible: true
        },
        {
            message: "A non-date should be treated as `undefined` (dateToString)...",
            transform: {
                type: "fluid.transforms.dateToString",
                inputPath: "nonDate"
            },
            expected: undefined,
            method: "assertDeepEq",
            model: { nonDate: "definitely not a date" }
        },
        {
            message: "A non-date should be treated as `undefined` (dateTimeToString)...",
            transform: {
                type: "fluid.transforms.dateTimeToString",
                inputPath: "dateTime"
            },
            expected: undefined,
            method: "assertDeepEq",
            model: { nonDate: "definitely not a date" }
        }
    ];

    jqUnit.test("String <-> Date transforms...", function () {
        fluid.tests.transforms.testOneStructure(fluid.tests.transforms.stringDateTests, {
            transformWrap: true
        });
    });
})(jQuery);
