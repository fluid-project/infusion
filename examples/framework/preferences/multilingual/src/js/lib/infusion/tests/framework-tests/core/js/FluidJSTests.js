/*
Copyright 2008-2010 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010-2011 Lucendo Development Ltd.
Copyright 2010-2011 OCAD University
Copyright 2011 Charly Molter
Copyright 2012-2013 Raising the Floor - US
Copyright 2014-2016 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.setLogging(true);

    fluid.registerNamespace("fluid.tests");

    jqUnit.module("Fluid JS Tests");

    fluid.tests.plainObjectTrue = {
        "object": {},
        "noproto": Object.create(null),
        "malignNoProto": Object.create(null, {"constructor": {value: "thing"}})
    };
    fluid.tests.plainObjectFalse = {
        "null": null,
        "undefined": undefined,
        "document": document,
        "window": window,
        "jDocument": $("document"),
        "component": fluid.component()
    };

    jqUnit.test("fluid.isPlainObject tests", function () {
        fluid.each(fluid.tests.plainObjectTrue, function (totest, key) {
            jqUnit.assertEquals("Expected plain: " + key, true, fluid.isPlainObject(totest));
            jqUnit.assertEquals("Expected plain in strict: " + key, true, fluid.isPlainObject(totest, true));
        });
        fluid.each(fluid.tests.plainObjectFalse, function (totest, key) {
            jqUnit.assertEquals("Expected nonplain: " + key, false, fluid.isPlainObject(totest));
            jqUnit.assertEquals("Expected nonplain in strict: " + key, false, fluid.isPlainObject(totest, true));
        });
        jqUnit.assertEquals("Array is plain by standard", true, fluid.isPlainObject([]));
        jqUnit.assertEquals("Array is nonplain in strict", false, fluid.isPlainObject([], true));
    });

    fluid.tests.firstDefinedTests = [
        {a: undefined, b: 3, expected: 3},
        {a: 0, b: 5, expected: 0},
        {a: null, b: 4, expected: null},
        {a: "thing", b: undefined, expected: "thing"},
        {a: undefined, b: undefined, expected: undefined}
    ];

    jqUnit.test("fluid.firstDefined tests", function () {
        fluid.each(fluid.tests.firstDefinedTests, function (fixture, i) {
            jqUnit.assertEquals("fluid.firstDefined fixture " + i, fixture.expected, fluid.firstDefined(fixture.a, fixture.b));
        });
    });

    jqUnit.test("fluid.makeArray tests", function () {
        jqUnit.assertDeepEq("fluid.makeArray on non-array", [1], fluid.makeArray(1));
        jqUnit.assertDeepEq("fluid.makeArray on null", [], fluid.makeArray(null));
        jqUnit.assertDeepEq("fluid.makeArray on undefined", [], fluid.makeArray(undefined));
        var inputArray = [1];
        var outputArray = fluid.makeArray(inputArray);
        jqUnit.assertDeepEq("fluid.makeArray on array - deep equality", inputArray, outputArray);
        jqUnit.assertNotEquals("fluid.makeArray on array - cloning", inputArray, outputArray);
    });

    fluid.tests.pushArray = [{
        message: "nonexistent element - nonarray",
        holder: {},
        topush: 1,
        expected: {
            m1: [1]
        }
    }, {
        message: "nonexistent element - array",
        holder: {},
        topush: [1],
        expected: {
            m1: [1]
        }
    }, {
        message: "existent element - nonarray",
        holder: {
            m1: [1]
        },
        topush: 2,
        expected: {
            m1: [1, 2]
        }
    }, {
        message: "existent element - array",
        holder: {
            m1: [1]
        },
        topush: [2, 3],
        expected: {
            m1: [1, 2, 3]
        }
    }
    ];

    jqUnit.test("fluid.pushArray tests", function () {
        fluid.each(fluid.tests.pushArray, function (fixture) {
            var holder = fluid.copy(fixture.holder);
            fluid.pushArray(holder, "m1", fixture.topush);
            jqUnit.assertDeepEq("fluid.pushArray - " + fixture.message, fixture.expected, holder);
        });
    });

    function isOdd(i) {
        return i % 2 === 1;
    }

    jqUnit.test("remove_if", function () {
        jqUnit.assertDeepEq("Remove nothing", [2, 4, 6, 8], fluid.remove_if([2, 4, 6, 8], isOdd));
        jqUnit.assertDeepEq("Remove first ", [2, 4, 6, 8], fluid.remove_if([1, 2, 4, 6, 8], isOdd));
        jqUnit.assertDeepEq("Remove last ", [2, 4, 6, 8], fluid.remove_if([2, 4, 6, 8, 9], isOdd));
        jqUnit.assertDeepEq("Remove first two ", [2, 4, 6, 8], fluid.remove_if([7, 1, 2, 4, 6, 8], isOdd));
        jqUnit.assertDeepEq("Remove last two ", [2, 4, 6, 8], fluid.remove_if([2, 4, 6, 8, 9, 11], isOdd));
        jqUnit.assertDeepEq("Remove all ", [], fluid.remove_if([1, 3, 5, 7], isOdd));
        jqUnit.assertDeepEq("Remove from nothing ", [], fluid.remove_if([], isOdd));
        jqUnit.assertDeepEq("Remove nothing", {"two": 2, "four": 4, "six": 6, "eight": 8},
            fluid.remove_if({"two": 2, "four": 4, "six": 6, "eight": 8}, isOdd));
        jqUnit.assertDeepEq("Remove first", {"two": 2, "four": 4, "six": 6, "eight": 8},
            fluid.remove_if({"one": 1, "two": 2, "four": 4, "six": 6, "eight": 8}, isOdd));
        jqUnit.assertDeepEq("Remove last", {"two": 2, "four": 4, "six": 6, "eight": 8},
            fluid.remove_if({"two": 2, "four": 4, "six": 6, "eight": 8, "nine": 9}, isOdd));
        jqUnit.assertDeepEq("Remove first two", {"two": 2, "four": 4, "six": 6, "eight": 8},
            fluid.remove_if({"seven": 7, "one": 1, "two": 2, "four": 4, "six": 6, "eight": 8}, isOdd));
        jqUnit.assertDeepEq("Remove last two", {"two": 2, "four": 4, "six": 6, "eight": 8},
            fluid.remove_if({"two": 2, "four": 4, "six": 6, "eight": 8, "nine": 9, "eleven": 11}, isOdd));
        jqUnit.assertDeepEq("Remove all", {},
            fluid.remove_if({"one": 1, "three": 3, "five": 5, "seven": 7}, isOdd));
        jqUnit.assertDeepEq("Remove from nothing", {}, fluid.remove_if({}, isOdd));
    });

    fluid.tests.indexChecker = function (value, index) {
        jqUnit.assertEquals("Index should remain stable through removal: " + value, value, index);
        return value === 1 || value === 2;
    };

    jqUnit.test("remove_if index stability and target", function () {
        jqUnit.expect(5);
        var target = [];
        fluid.remove_if([0, 1, 2, 3], fluid.tests.indexChecker, target);
        jqUnit.assertDeepEq("Target contains removed elements in original order", [1, 2], target);
    });

    jqUnit.test("transform", function () {
        function addOne(i) {
            return i + 1;
        }
        jqUnit.assertDeepEq("Transform array", [false, true, false, true, false], fluid.transform([0, 1, 2, 3, 4], isOdd));
        jqUnit.assertDeepEq("Transform hash", {a: false, b: true}, fluid.transform({a: 0, b: 1}, isOdd));
        jqUnit.assertDeepEq("Transform hash chain", {a: true, b: false}, fluid.transform({a: 0, b: 1}, addOne, isOdd));
    });

    jqUnit.test("fluid.keyForValue, fluid.find, fluid.each, fluid.keys and fluid.values", function () {
        jqUnit.expect(18);
        var seekIt = function (seek) {
            fluid.each(seek, function (value, key) {
                jqUnit.assertEquals("Find value with keyForValue - " + value + ": ", key, fluid.keyForValue(seek, value));
                jqUnit.assertEquals("Find value with fluid.find - " + value + ": ", key, fluid.find(seek, function (thisValue, key) {
                    if (value === thisValue) {
                        return key;
                    }
                }));
            });
        };
        var seek1 = {"One": 1, "Two": null, "Three": false, "Four": "Sneeze"};
        seekIt(seek1);
        var seek2 = [1, null, false, "Sneeze"];
        seekIt(seek2);

        jqUnit.assertDeepEq("fluid.keys", ["One", "Two", "Three", "Four"], fluid.keys(seek1));
        jqUnit.assertDeepEq("fluid.values", [1, null, false, "Sneeze"], fluid.values(seek1));
    });

    jqUnit.test("null iteration", function () {
        jqUnit.expect(2);

        fluid.each(null, function () {
            fluid.fail("This should not run");
        });
        var transformed = fluid.transform(null, function () {
            fluid.fail("This should not run");
        });
        jqUnit.assertEquals("Output of null transform should be null", null, transformed);

        jqUnit.assertTrue("a null each and a null transform don't crash the framework", true);
    });

    fluid.tests.flattenFixtures = [
        {
            message: "standard mixture",
            arg: [1, [{a: 1}, 13], false, [{b: 2}]],
            expected: [1, {a: 1}, 13, false, {b: 2}]
        }, {
            message: "null",
            arg: null,
            expected: []
        }, {
            message: "null element",
            arg: [null],
            expected: [null]
        }, {
            message: "null nested element",
            arg: [[null]],
            expected: [null]
        }
    ];

    jqUnit.test("fluid.flatten", function () {
        fluid.each(fluid.tests.flattenFixtures, function (fixture) {
            jqUnit.assertDeepEq(fixture.message, fixture.expected, fluid.flatten(fixture.arg));
        });
    });

    fluid.tests.roundToDecimalTests = [
        {num: 1.555, scale: 5, round: 1.555, ceil: 1.555, floor: 1.555},
        {num: 1.555, scale: 4, round: 1.555, ceil: 1.555, floor: 1.555},
        {num: 1.555, scale: 3, round: 1.555, ceil: 1.555, floor: 1.555},
        {num: 1.555, scale: 2, round: 1.56, ceil: 1.56, floor: 1.55},
        {num: 1.555, scale: 1, round: 1.6, ceil: 1.6, floor: 1.5},
        {num: 1.555, scale: 1.3, round: 1.6, ceil: 1.6, floor: 1.5},
        {num: 1.555, scale: 1.5, round: 1.56, ceil: 1.56, floor: 1.55},
        {num: -1.555, scale: 5, round: -1.555, ceil: -1.555, floor: -1.555},
        {num: -1.555, scale: 4, round: -1.555, ceil: -1.555, floor: -1.555},
        {num: -1.555, scale: 3, round: -1.555, ceil: -1.555, floor: -1.555},
        {num: -1.555, scale: 2, round: -1.56, ceil: -1.55, floor: -1.56},
        {num: -1.555, scale: 1, round: -1.6, ceil: -1.5, floor: -1.6},
        {num: 1.555, scale: 0, round: 2, ceil: 2, floor: 1},
        {num: 1.555, scale: -2, round: 2, ceil: 2, floor: 1},
        {num: 1.555, scale: NaN, round: 2, ceil: 2, floor: 1},
        {num: 1.555, scale: undefined, round: 2, ceil: 2, floor: 1},
        {num: 1.555, scale: null, round: 2, ceil: 2, floor: 1},
        {num: 1.555, scale: "two", round: 2, ceil: 2, floor: 1},
        {num: 1.005, scale: 2, round: 1.01, ceil: 1.01, floor: 1},
        {num: -1.005, scale: 2, round: -1.01, ceil: -1, floor: -1.01},
        // 1.005 - 1 should equate to 0.005 and round up to 0.01; however,
        // do to the imprecision of floating point number representation
        // it is represented as 0.004999999999999893 instead and as such
        // rounds down to 0.
        {num: 1.005 - 1, scale: 2, round: 0, ceil: 0.01, floor: 0},
        {num: 55.549, scale: 1, round: 55.5, ceil: 55.6, floor: 55.5},
        {num: -55.549, scale: 1, round: -55.5, ceil: -55.5, floor: -55.6},
        {num: 54.9, scale: 0, round: 55, ceil: 55, floor: 54},
        {num: -54.9, scale: 0, round: -55, ceil: -54, floor: -55},
        {num: 55.55, scale: 1, round: 55.6, ceil: 55.6, floor: 55.5},
        {num: -55.55, scale: 1, round: -55.6, ceil: -55.5, floor: -55.6},
        {num: 55.551, scale: 1, round: 55.6, ceil: 55.6, floor: 55.5},
        {num: -55.551, scale: 1, round: -55.6, ceil: -55.5, floor: -55.6},
        {num: 55.59, scale: 1, round: 55.6, ceil: 55.6, floor: 55.5},
        {num: -55.59, scale: 1, round: -55.6, ceil: -55.5, floor: -55.6},
        // IEEE 754 binary floating point numbers treat 0.014999999999999999, 0.0150000000000000001 and 0.015 as equivalent.
        {num: 0.014999999999999999, scale: 2, round: 0.02, ceil: 0.02, floor: 0.01},
        {num: -0.014999999999999999, scale: 2, round: -0.02, ceil: -0.01, floor: -0.02},
        {num: 0.0150000000000000001, scale: 2, round: 0.02, ceil: 0.02, floor: 0.01},
        {num: -0.0150000000000000001, scale: 2, round: -0.02, ceil: -0.01, floor: -0.02},
        {num: 0.015, scale: 2, round: 0.02, ceil: 0.02, floor: 0.01},
        {num: -0.015, scale: 2, round: -0.02, ceil: -0.01, floor: -0.02}
    ];

    jqUnit.test("fluid.roundToDecimal", function () {
        fluid.each(fluid.tests.roundToDecimalTests, function (test) {
            var roundResult = fluid.roundToDecimal(test.num, test.scale, "round");
            jqUnit.assertEquals("Round - num: " + test.num + " with scale: " + test.scale, test.round, roundResult);

            var ceilResult = fluid.roundToDecimal(test.num, test.scale, "ceil");
            jqUnit.assertEquals("Ceil - num: " + test.num + " with scale: " + test.scale, test.ceil, ceilResult);

            var floorResult = fluid.roundToDecimal(test.num, test.scale, "floor");
            jqUnit.assertEquals("Floor - num: " + test.num + " with scale: " + test.scale, test.floor, floorResult);

            var noMethodResult = fluid.roundToDecimal(test.num, test.scale);
            jqUnit.assertEquals("No Method Provided - num: " + test.num + " with scale: " + test.scale, test.round, noMethodResult);

            var invalidMethodResult = fluid.roundToDecimal(test.num, test.scale, "invalid");
            jqUnit.assertEquals("Invalid Method Provided - num: " + test.num + " with scale: " + test.scale, test.round, invalidMethodResult);
        });
    });

    jqUnit.test("merge", function () {
        jqUnit.expect(8);

        var bit1 = {prop1: "thing1"};
        var bit2 = {prop2: "thing2"};
        var bits = {prop1: "thing1", prop2: "thing2"};

        jqUnit.assertDeepEq("Simple merge 1",
            bits, fluid.merge({}, {}, bit1, null, bit2));
        jqUnit.assertDeepEq("Simple merge 2",
            bits, fluid.merge({}, {}, bit2, bit1, undefined));
        jqUnit.assertDeepEq("Simple merge 3",
            bits, fluid.merge({}, {}, {}, bit1, bit2));
        jqUnit.assertDeepEq("Simple merge 4",
            bits, fluid.merge({}, {}, {}, bit2, bit1));

        jqUnit.assertDeepNeq("Anticorruption check", bit1, bit2);

        jqUnit.assertDeepEq("Complex merge", [bits, bits, bits],
            fluid.merge([], [], [bit1, bit2], null, [bit2, bit1, bits]));

        var null1 = {prop1: null};

        jqUnit.assertDeepEq("Null onto property", null1,
            fluid.merge({}, bit1, null1));

        jqUnit.assertDeepEq("Replace 1",
            bit1, fluid.merge({"": "replace"}, {}, bits, bit1));

    });

    jqUnit.test("replace merge at depth", function () {
        var target = {
            root: {
                prop1: "thing1",
                prop2: "thing2"
            }
        };
        var source = {
            root: {
                prop2: "thing3"
            }
        };

        var target2 = fluid.copy(target);
        fluid.merge(null, target2, source);
        jqUnit.assertEquals("prop1 should have been preserved", "thing1", target2.root.prop1);

        var target3 = fluid.merge({root: "replace"}, target, null, source, undefined);
        jqUnit.assertDeepEq("prop1 should have been destroyed", source, target3);

        // "White box text" for "lastNonEmpty" issue
        var target4 = fluid.merge({root: "replace"}, target, null, source, {otherThing: 1});
        var expected = $.extend(true, source, {otherThing: 1});
        jqUnit.assertDeepEq("prop1 should have been destroyed", expected, target4);
    });

    jqUnit.test("copy", function () {
        var array = [1, "thing", true, null];
        var copy = fluid.copy(array);
        jqUnit.assertDeepEq("Array copy", array, copy);
    });

    jqUnit.test("stringTemplate: greedy", function () {
        var template = "%tenant/%tenantname",
            tenant = "../tenant",
            tenantname = "core",
            expected = "../tenant/core",
            result = fluid.stringTemplate(template, {tenant: tenant, tenantname: tenantname});
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });

    jqUnit.test("stringTemplate: array of string values", function () {
        var template = "Paused at: %0 of %1 files (%2 of %3)";

        var atFile = "12";
        var totalFiles = "14";
        var atSize = "100 Kb";
        var totalSize = "12000 Gb";
        var data = [atFile, totalFiles, atSize, totalSize];

        var expected = "Paused at: " + atFile +
                            " of " + totalFiles +
                            " files (" + atSize +
                            " of " + totalSize + ")";

        var result = fluid.stringTemplate(template, data);
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });

    jqUnit.test("stringTemplate: array of mixed type values", function () {
        var template = "Paused at: %0 of %1 files (%2 of %3)";

        var atFile = 12;
        var totalFiles = 14;

        // This represents a complex object type that has a toString method.
        var atSize = {
            toString: function () {
                return "100 Kb";
            }
        };
        var totalSize = "12000 Gb";
        var data = [atFile, totalFiles, atSize, totalSize];

        var expected = "Paused at: " + atFile +
                            " of " + totalFiles +
                            " files (" + atSize +
                            " of " + totalSize + ")";

        var result = fluid.stringTemplate(template, data);
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });


    jqUnit.test("stringTemplate: data object", function () {
        var template = "Paused at: %atFile of %totalFiles files (%atSize of %totalSize)";

        var data = {
            atFile: 12,
            totalFiles: 14,
            atSize: "100 Kb",
            totalSize: "12000 Gb"
        };

        var expected = "Paused at: " + data.atFile +
                            " of " + data.totalFiles +
                            " files (" + data.atSize +
                            " of " + data.totalSize + ")";

        var result = fluid.stringTemplate(template, data);
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });

    jqUnit.test("stringTemplate: empty string", function () {
        var template = "Hello %name!";

        var data = {
            name: ""
        };

        var expected = "Hello !";
        var result = fluid.stringTemplate(template, data);
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });

    jqUnit.test("stringTemplate: missing value", function () {
        var template = "Paused at: %atFile of %totalFiles files (%atSize of %totalSize)";

        var data = {
            atFile: 12,
            atSize: "100 Kb",
            totalSize: "12000 Gb"
        };

        var expected = "Paused at: " + data.atFile +
                            " of %totalFiles" +
                            " files (" + data.atSize +
                            " of " + data.totalSize + ")";

        var result = fluid.stringTemplate(template, data);
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });

    jqUnit.test("stringTemplate: missing token", function () {
        var template = "Paused at: %atFile of %totalFiles files (%atSize of %totalSize)";

        var data = {
            atFile: 12,
            totalFiles: 14,
            atSize: "100 Kb",
            totalSize: "12000 Gb"
        };

        var expected = "Paused at: " + data.atFile +
                            " of " + data.totalFiles +
                            " files (" + data.atSize +
                            " of " + data.totalSize + ")";

        var result = fluid.stringTemplate(template, data);
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });

    jqUnit.test("stringTemplate: multiple replacement", function () {
        var template = "Paused at: %0 of %0 files (%1 of %2)";

        var atFile = "12";
        var totalFiles = "14";
        var atSize = "100 Kb";
        var data = [atFile, totalFiles, atSize];

        var expected = "Paused at: " + atFile +
                            " of " + atFile +
                            " files (" + totalFiles +
                            " of " + atSize + ")";

        var result = fluid.stringTemplate(template, data);
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });

    jqUnit.test("stringTemplate: special character [] and ()", function () {
        var template = "Paused at: %() of %[] files (%file[] of %file)";

        var data = {
            "()": 12,
            "[]": 14,
            "file[]": "100 Kb",
            "file": "12000 Gb"
        };

        var expected = "Paused at: " + data["()"] +
                            " of " + data["[]"] +
                            " files (" + data["file[]"] +
                            " of " + data.file + ")";


        var result = fluid.stringTemplate(template, data);
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });


    var testDefaults = {
        gradeNames: "fluid.component",
        foo: "bar"
    };

    fluid.defaults("test", testDefaults);

    jqUnit.test("Defaults: store and retrieve default values", function () {
        jqUnit.expect(4);
        // Assign a collection of defaults for the first time.

        jqUnit.assertCanoniseEqual("defaults() should return the specified defaults",
            testDefaults, fluid.defaults("test"), function (options) {
                return fluid.filterKeys(options, ["foo"]);
            });

        // Re-assign the defaults with a new collection.
        var testDefaults2 = {
            gradeNames: "fluid.component",
            baz: "foo"
        };
        fluid.defaults("test", testDefaults2);
        var retrieved = fluid.defaults("test");
        jqUnit.assertCanoniseEqual("defaults() should return the updated defaults",
            testDefaults2, retrieved, function (options) {
                return fluid.filterKeys(options, ["foo", "baz"]);
            });
        var assignException;

        try {
            retrieved.baz = "quux";
        } catch (e) {
            assignException = e;
        }
        jqUnit.assertValue("Retrieved defaults should be immutable", assignException);

        // Try to access defaults for a component that doesn't exist.
        jqUnit.assertNoValue("The defaults for a nonexistent component should be null.",
                          fluid.defaults("timemachine"));
    });

    jqUnit.test("FLUID-4842 test - configurable \"soft failure\"", function () {
        var testArgs = [1, "thingit"];
        function failHandle(args) {
            jqUnit.assertDeepEq("Received arguments in error handler", testArgs, args);
            fluid.builtinFail(args); // throw exception to keep expectFrameworkDiagnostic happy
        }
        jqUnit.expect(1);
        fluid.pushSoftFailure(failHandle);
        jqUnit.expectFrameworkDiagnostic("Configurable failure handler", function () {
            fluid.fail.apply(null, testArgs);
        }, "thingit");
        fluid.pushSoftFailure(-1);
    });

    jqUnit.test("FLUID-5807 tests - identify fluid.FluidError", function () {
        // These tests have a direct analogue in basic-node-tests.js
        var error = new fluid.FluidError("thing");
        jqUnit.assertTrue("Framework error is an error (from its own perspective)", error instanceof fluid.Error);
        jqUnit.assertTrue("Framework error is an instance of itself", error instanceof fluid.FluidError);
        var stack = error.stack.toString();
        jqUnit.assertTrue("Our own filename must appear in the stack", stack.indexOf("FluidJSTests") !== -1);
    });

    function passTestLog(level, expected) {
        jqUnit.assertEquals("Should " + (expected ? "not " : "") + "pass debug level " + level, expected, fluid.passLogLevel(fluid.logLevel[level]));
    }

    jqUnit.test("FLUID-4936 test - support for logging levels", function () {
        fluid.setLogging(true);
        passTestLog("INFO", true);
        passTestLog("IMPORTANT", true);
        passTestLog("TRACE", false);
        fluid.popLogging();
        fluid.setLogging(false);
        passTestLog("INFO", false);
        passTestLog("IMPORTANT", true);
        fluid.popLogging();
        fluid.setLogging(fluid.logLevel.TRACE);
        passTestLog("TRACE", true);
        fluid.popLogging();
    });

    jqUnit.test("FLUID-4973 test - activity logging does not crash", function () {
        fluid.pushActivity("testActivity", "testing my activity with argument %argument", {argument: 3});
        var activity = fluid.describeActivity();
        jqUnit.assertTrue("One activity in progress", activity.length === 1);
        var rendered = fluid.renderActivity(activity)[0].join("");
        jqUnit.assertTrue("Activity string rendered", rendered.indexOf("testing my activity with argument 3") !== -1);
        fluid.logActivity(activity); // This would previously crash on IE8
        fluid.popActivity();
    });

    jqUnit.test("FLUID-4285 test - prevent 'double options'", function () {
        jqUnit.expectFrameworkDiagnostic("Registering double options component", function () {
            fluid.defaults("news.parent", {
                gradeNames: ["fluid.component"],
                options: {
                    test: "test"
                }
            });
        }, "error in options structure");
    });

    jqUnit.test("fluid.get and fluid.set", function () {
        var model = {"path3": "thing"};
        jqUnit.assertEquals("Get simple value", "thing", fluid.get(model, "path3"));
        jqUnit.assertDeepEq("Get root value", model, fluid.get(model, ""));
        jqUnit.assertEquals("Get blank value", undefined, fluid.get(model, "path3.nonexistent"));
        jqUnit.assertEquals("Get blank value", undefined, fluid.get(model, "path3.nonexistent.non3"));
        jqUnit.assertEquals("Get blank value", undefined, fluid.get(model, "path1.nonexistent"));
        jqUnit.assertEquals("Get blank value", undefined, fluid.get(model, "path1.nonexistent.non3"));
        jqUnit.assertEquals("Get blank value", undefined, fluid.get(model, "path1"));
        fluid.set(model, "path2.past", "attach");
        jqUnit.assertDeepEq("Set blank value", {path2: {past: "attach"}, path3: "thing"}, model);
        fluid.registerGlobalFunction("fluid.newFunc", function () {
            return 2;
        });
        jqUnit.assertEquals("Call new global function", 2, fluid.newFunc());
    });

    jqUnit.test("Globals", function () {
        var space = fluid.registerNamespace("fluid.engage.mccord");
        space.func = function () {
            return 2;
        };
        jqUnit.assertEquals("Call function in namespace", 2, fluid.engage.mccord.func());

        var fluidd = fluid.getGlobalValue("nothing.fluid");
        jqUnit.assertUndefined("No environment slippage", fluidd);

        var fluidd2 = fluid.getGlobalValue("fluid.fluid");
        jqUnit.assertUndefined("No environment slippage", fluidd2);

        fluid.registerNamespace("cspace.autocomplete");
        var fluidd3 = fluid.getGlobalValue("cspace.fluid");
        jqUnit.assertUndefined("No environment slippage", fluidd3);
        var fluidd4 = fluid.getGlobalValue("cspace.fluid.get");
        jqUnit.assertUndefined("No environment slippage", fluidd4);
    });

    jqUnit.test("fluid.get with resolution and segments", function () {
        var resolver = function () {
            return "resolved";
        };
        var model = {
            resolvePathSegment: resolver
        };
        jqUnit.assertEquals("Root resolver", "resolved", fluid.get(model, "resolver"));
        var model2 = {
            nested: {
                resolvePathSegment: resolver
            }
        };
        jqUnit.assertEquals("Nested resolver", "resolved", fluid.get(model2, ["nested", "resolver"]));
    });

    jqUnit.test("Sorting listeners", function () {
        var accumulate = [];
        var makeListener = function (i) {
            return function () {
                accumulate.push(i);
            };
        };
        var firer = fluid.makeEventFirer();
        firer.addListener(makeListener(4), null, "last");
        firer.addListener(makeListener(3));
        firer.addListener(makeListener(2), null, 10);
        firer.addListener(makeListener(1), null, "first");
        firer.fire();
        jqUnit.assertDeepEq("Listeners fire in priority order", [1, 2, 3, 4], accumulate);
    });

    jqUnit.test("Attach and remove listeners", function () {
        var testListener = function (shouldExecute) {
            jqUnit.assertTrue("Listener firing " + (shouldExecute ? "" : "not ") + "expected", shouldExecute);
        };

        jqUnit.expect(2);
        var firer = fluid.makeEventFirer();
        firer.addListener(testListener);
        firer.fire(true);
        firer.removeListener(testListener);
        firer.fire(false); //listener should not run and assertion should not execute

        firer.addListener(testListener, "namespace");
        firer.fire(true);
        firer.removeListener(testListener);
        firer.fire(false);
        firer.removeListener("toRemoveNonExistent"); // for FLUID-4791
        firer.fire(false);
    });

    jqUnit.test("FLUID-5506 stack for namespaced listeners", function () {
        var firer = fluid.makeEventFirer();
        var record = [];
        function addOne(arg) {
            firer.addListener(function () {
                record.push(arg);
            }, "namespace");
        }
        addOne(1);
        addOne(2); // this one is top of stack
        firer.fire();
        firer.removeListener("namespace");
        firer.fire(); // listener 1 is now top of stack
        jqUnit.assertDeepEq("Listener removed by namespace reveals earlier", [2, 1], record);
    });

    fluid.tests.constraintTests = [{
        name: "one before",
        listeners: {
            "a": "",
            "b": "before:a"
        },
        expected: "ba"
    }, {
        name: "one after, two last, one standard",
        listeners: {
            "a": "after:b",
            "d": "",
            "b": "last:testing",
            "c": "last"
        },
        expected: "dcba"
    }, {
        name: "one before, one after, two first",
        listeners: {
            "a": "before:d",
            "b": "first",
            "c": "first:authoring",
            "d": "after:b"
        },
        expected: "cbad"
    }, {
        name: "two fixed, three after",
        listeners: {
            "a": "after:b",
            "b": 10,
            "c": 20,
            "d": "after:e",
            "e": "after:c"
        },
        expected: "cedba"
    }, {
        name: "nonexistent reference", // in theory this should be a failure but we can't arrange to add listeners atomically
        listeners: {
            "a": "before:b"
        },
        expected: "a"
    }];

    fluid.tests.upgradeListeners = function (listeners) {
        return fluid.hashToArray(listeners, "namespace", function (newElement, oldElement) {
            newElement.priority = fluid.parsePriority(oldElement, 0, false, "listeners");
        });
    };

    jqUnit.test("FLUID-5506 constraint-based listeners", function () {
        fluid.each(fluid.tests.constraintTests, function (fixture) {
            var listeners = fluid.tests.upgradeListeners(fixture.listeners);
            fluid.sortByPriority(listeners);
            var flattened = fluid.transform(listeners, function (listener) {
                return listener.namespace;
            }).join("");
            jqUnit.assertEquals("Expected sort order for test " + fixture.name, fixture.expected, flattened);
        });
    });

    fluid.tests.failedConstraintTests = [{
        name: "self-reference",
        listeners: {
            "a": "before:a"
        }
    }, {
        name: "cyclic reference (2)",
        listeners: {
            "a": "before:b",
            "b": "before:a"
        }
    }, {
        name: "cyclic reference (3)",
        listeners: {
            "a": "before:b",
            "b": "before:c",
            "c": "before:a"
        }
    }, {
        name: "cyclic reference (2) + fixed",
        listeners: {
            "a": 10,
            "b": "before:c",
            "c": "before:b"
        }
    }];

    jqUnit.test("FLUID-5506: constraint-based listeners - failure cases", function () {
        fluid.each(fluid.tests.failedConstraintTests, function (fixture) {
            jqUnit.expectFrameworkDiagnostic("Expected failure for test " + fixture.name, function () {
                var listeners = fluid.tests.upgradeListeners(fixture.listeners);
                fluid.sortByPriority(listeners);
            });
        });
    });

    fluid.defaults("fluid.tests.eventMerge", {
        gradeNames: ["fluid.component"],
        events: {
            event: "preventable"
        }
    });

    jqUnit.test("Merge over named listener", function () {
        var that = fluid.tests.eventMerge({
            events: {
                event: null
            },
            listeners: {
                event: "fluid.identity"
            }
        });
        var result = that.events.event.fire(false);
        jqUnit.assertUndefined("Event returned to nonpreventable through merge", result);
    });

    fluid.tests.makeNotingListener = function (key) {
        return function (that) {
            var existing = that.values[key];
            that.values[key] = existing === undefined ? 1 : existing + 1;
        };
    };

    fluid.defaults("fluid.tests.listenerTest", {
        gradeNames: ["fluid.component"],
        events: {
            event: null
        },
        listeners: {
            event: fluid.tests.makeNotingListener("noNamespace"),
            "event.namespace": fluid.tests.makeNotingListener("namespace"),
            onCreate: fluid.tests.makeNotingListener("onCreate"),
            "onCreate.namespace": fluid.tests.makeNotingListener("onCreate.namespace"),
            "onCreate.makeValues": {
                listener: "fluid.tests.listenerTest.makeValues",
                priority: "first"
            }
        }
    });

    fluid.tests.listenerTest.makeValues = function (that) {
        that.values = {};
    };

    jqUnit.test("Correctly merge optioned listeners", function () {
        var options = {listeners: {
            event: fluid.tests.makeNotingListener("noNamespace2"),
            "event.namespace": fluid.tests.makeNotingListener("namespace2"),
            onCreate: fluid.tests.makeNotingListener("onCreate2"),
            "onCreate.namespace": fluid.tests.makeNotingListener("onCreate.namespace2")
        }};
        var that = fluid.tests.listenerTest(options);
        var expected1 = {
            onCreate: 1,
            onCreate2: 1,
            "onCreate.namespace2": 1
        };
        jqUnit.assertDeepEq("Creation listeners merged and fired", expected1, that.values);
        that.events.event.fire(that);
        var expected2 = {
            noNamespace: 1,
            noNamespace2: 1,
            namespace2: 1
        };
        jqUnit.assertDeepEq("Listeners correctly merged", $.extend(expected2, expected1), that.values);
    });

    /** FLUID-5288: Improved diagnostic for incomplete grade hierarchy **/

    jqUnit.test("FLUID-5288: Improved diagnostic for component with incomplete grade hierarchy", function () {
        jqUnit.expectFrameworkDiagnostic("Framework diagnostic on incomplete grade hierarchy", function () {
            // TODO: in future, there will be no error thrown on definition, but only on use - since it should be possible
            // to declare grade hierarchies through forward reference
            fluid.defaults("fluid.tests.missingGradeComponent", {
                gradeNames: ["fluid.tests.nonexistentGrade"]
            });
            fluid.tests.missingGradeComponent();
        }, ["incomplete", "nonexistentGrade"]);
    });


    fluid.defaults("fluid.tests.forwardRefComponent", {
        gradeNames: "fluid.tests.forwardBaseComponent"
    });

    fluid.defaults("fluid.tests.forwardBaseComponent", {
        gradeNames: "fluid.component"
    });

    jqUnit.test("Forward reference through grade hierarchy", function () {
        jqUnit.expect(1);
        var that = fluid.tests.forwardRefComponent();
        jqUnit.assertValue("Should have received component with forward grade reference", that);
    });

    fluid.defaults("fluid.tests.schema.textSizer", {
        gradeNames: ["fluid.tests.schema", "fluid.component"],
        schema: {
            "fluid.prefs.textSizer": { // common grade name
                "type": "number",
                "default": 1,
                "min": 1,
                "max": 2,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("fluid.tests.nonPanel", { // A dummy grade to ensure that grade filtration is working in the indexer
        gradeNames: ["fluid.component"],
        preferenceMap: {
            thing: "fluid.prefs.nonThing"
        }
    });

    fluid.defaults("fluid.tests.panels.linksControls", {
        gradeNames: ["fluid.tests.settingsPanel", "fluid.component"],
        preferenceMap: {
            links: "fluid.prefs.emphasizeLinks",
            inputsLarger: "fluid.prefs.inputsLarger"
        }
    });

    fluid.tests.schema.indexer = function (defaults) {
        return fluid.keys(defaults.schema);
    };

    fluid.tests.panels.indexer = function (defaults) {
        return fluid.values(defaults.preferenceMap);
    };

    jqUnit.test("FLUID-5067 grade indexing", function () {
        var indexedSchema = fluid.indexDefaults("schemaIndexer", {
            gradeNames: "fluid.tests.schema",
            indexFunc: "fluid.tests.schema.indexer"
        });
        jqUnit.assertDeepEq("Indexed grade", ["fluid.tests.schema.textSizer"], indexedSchema["fluid.prefs.textSizer"]);
        var indexedPanels = fluid.indexDefaults("panelIndexer", {
            gradeNames: "fluid.tests.settingsPanel",
            indexFunc: "fluid.tests.panels.indexer"
        });
        var expected = {
            "fluid.prefs.emphasizeLinks": ["fluid.tests.panels.linksControls"],
            "fluid.prefs.inputsLarger": ["fluid.tests.panels.linksControls"]
        };
        jqUnit.assertDeepEq("Indexed multiple grades", expected, indexedPanels);
    });

    fluid.tests.invokeGlobalFunction = {
        withArgs: function (arg1) {
            jqUnit.assertEquals("A single argument should have been passed in", 1, arguments.length);
            jqUnit.assertEquals("The correct argument should have been passed in", "test arg", arg1);
        },
        withoutArgs: function () {
            jqUnit.assertEquals("There should not have been any arguments passed in", 0, arguments.length);
        }
    };

    jqUnit.test("FLUID-4915: fluid.invokeGlobalFunction", function () {
        jqUnit.expect(3);

        fluid.invokeGlobalFunction("fluid.tests.invokeGlobalFunction.withArgs", ["test arg"]);
        fluid.invokeGlobalFunction("fluid.tests.invokeGlobalFunction.withoutArgs");
    });


    fluid.defaults("fluid.tests.functionWithoutArgMap", {
        gradeNames: "fluid.function"
    });

    fluid.tests.testInvalidGradedFunction = function (name, spec) {
        jqUnit.expectFrameworkDiagnostic("fluid.invokeGradedFunction - failure case - " + name, function () {
            fluid.invokeGradedFunction(name, spec);
        }, "Cannot look up name");
    };

    jqUnit.test("fluid.invokeGradedFunction - diagnostics from bad invocations", function () {
        fluid.tests.testInvalidGradedFunction("fluid.tests.nonexistentName");
        fluid.tests.testInvalidGradedFunction("fluid.tests.functionWithoutArgMap");
        fluid.tests.testInvalidGradedFunction("fluid.tests.gradeComponent");
    });

    fluid.defaults("fluid.tests.functionWithArgMap", {
        gradeNames: "fluid.function",
        argumentMap: {
            numerator: 0,
            denominator: 1
        }
    });

    fluid.tests.functionWithArgMap = function (numerator, denominator) {
        return numerator / denominator;
    };

    jqUnit.test("fluid.invokeGradedFunction - valid case", function () {
        var result = fluid.invokeGradedFunction("fluid.tests.functionWithArgMap", {
            numerator: 1,
            denominator: 2
        });
        jqUnit.assertEquals("Correctly invoked graded function", 0.5, result);
    });

    jqUnit.test("fluid.bind", function () {
        jqUnit.expect(3);
        var expectedText = "New Text";
        var jqElm = $("<div></div>");
        var testObj = {
            baseVal: 3,
            fn: function (a, b) {
                return this.baseVal + a + b;
            }
        };

        fluid.bind(jqElm, "text", expectedText);
        jqUnit.assertEquals("The text should have been set", expectedText, jqElm.text());
        jqUnit.assertEquals("The value returned from the bind should be the same as the native call", jqElm.text(), fluid.bind(jqElm, "text"));
        jqUnit.assertEquals("The correct value should be returned", 6, fluid.bind(testObj, "fn", [1, 2]));
    });

})(jQuery);
