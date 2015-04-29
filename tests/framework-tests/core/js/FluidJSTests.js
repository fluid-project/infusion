/*
Copyright 2008-2010 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010-2011 Lucendo Development Ltd.
Copyright 2010-2011 OCAD University
Copyright 2011 Charly Molter

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.setLogging(true);

    fluid.registerNamespace("fluid.tests");

    jqUnit.module("Fluid JS Tests");

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
        jqUnit.expect(1);

        fluid.each(null, function () {
            fluid.fail("This should not run");
        });
        fluid.transform(null, function () {
            fluid.fail("This should not run");
        });

        jqUnit.assertTrue("a null each and a null transform don't crash the framework", true);
    });
    
    fluid.tests.flattenFixtures = [ {
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
        foo: "bar"
    };

    fluid.defaults("test", testDefaults);

    jqUnit.test("Defaults: store and retrieve default values", function () {
        // Assign a collection of defaults for the first time.

        jqUnit.assertDeepEq("defaults() should return the specified defaults",
                            testDefaults, fluid.filterKeys(fluid.defaults("test"), ["foo"]));

        // Re-assign the defaults with a new collection.
        var testDefaults2 = {
            baz: "foo"
        };
        fluid.defaults("test", testDefaults2);
        jqUnit.assertDeepEq("defaults() should return the original defaults",
                            testDefaults2, fluid.filterKeys(fluid.defaults("test"), ["foo", "baz"]));

        // Try to access defaults for a component that doesn't exist.
        jqUnit.assertNoValue("The defaults for a nonexistent component should be null.",
                          fluid.defaults("timemachine"));
    });

    jqUnit.test("FLUID-4842 test - configurable \"soft failure\"", function () {
        var testArgs = [1, "thingit"];
        function failHandle(args) {
            jqUnit.assertDeepEq("Received arguments in error handler", testArgs, args);
        }
        jqUnit.expect(1);
        fluid.pushSoftFailure(failHandle);
        fluid.fail.apply(null, testArgs);
        fluid.pushSoftFailure(-1);
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
                gradeNames: ["fluid.littleComponent", "autoInit"],
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

    jqUnit.test("messageResolver", function () {
        var bundlea = {
            key1: "value1a",
            key2: "value2a"
        };
        var bundleb = {
            key1: "value1b",
            key3: "value3b"
        };
        var resolverParent = fluid.messageResolver({messageBase: bundlea});
        var resolver = fluid.messageResolver({messageBase: bundleb, parents: [resolverParent]});

        var requiredLook = {
            key1: "value1b",
            key2: "value2a",
            key3: "value3b",
            key4: undefined
        };
        fluid.each(requiredLook, function (value, key) {
            var looked = resolver.lookup([key]);
            jqUnit.assertEquals("Resolve key " + key, value, looked ? looked.template : looked);
        });
        jqUnit.assertEquals("Local fallback",  bundleb.key1, resolver.resolve(["key2", "key1"]));
        jqUnit.assertEquals("Global fallback", bundlea.key2, resolver.resolve(["key4", "key2"]));
    });

    jqUnit.test("Sorting listeners", function () {
        var accumulate = [];
        var makeListener = function (i) {
            return function () {
                accumulate.push(i);
            };
        };
        var firer = fluid.makeEventFirer();
        firer.addListener(makeListener(4), null, null, "last");
        firer.addListener(makeListener(3));
        firer.addListener(makeListener(2), null, null, 10);
        firer.addListener(makeListener(1), null, null, "first");
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

    fluid.defaults("fluid.tests.eventMerge", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
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
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            event: null
        },
        listeners: {
            event: fluid.tests.makeNotingListener("noNamespace"),
            "event.namespace": fluid.tests.makeNotingListener("namespace"),
            onCreate: fluid.tests.makeNotingListener("onCreate"),
            "onCreate.namespace": fluid.tests.makeNotingListener("onCreate.namespace")
        },
        finalInitFunction: "fluid.tests.listenerTest.finalInit"
    });

    fluid.tests.listenerTest.finalInit = function (that) {
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


    /** Test FLUID-4776 - only one instance of preinit function registered **/

    fluid.defaults("fluid.tests.lifecycleTest3", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        preInitFunction: "fluid.tests.lifecycleTest3.preInit"
    });

    fluid.tests.lifecycleTest3.preInit = function (that) {
        if (!that.count) {
            that.count = 0;
        }
        ++that.count;
    };

    jqUnit.test("Registration of lifecycle functions by convention", function () {
        var that = fluid.tests.lifecycleTest3();
        jqUnit.assertEquals("Only one call to preInitFunction", 1, that.count);
    });

    /** Test FLUID-4788 - acquiring default initFunctions through the hierarchy **/

    fluid.defaults("fluid.tests.gradeComponent", {
        gradeNames: ["autoInit", "fluid.littleComponent"]
    });
    fluid.tests.gradeComponent.preInit = function () {
        jqUnit.assert("Pre init function is called by a component of fluid.tests.gradeComponent grade.");
    };
    fluid.defaults("fluid.tests.gradeUsingComponent", {
        gradeNames: ["autoInit", "fluid.tests.gradeComponent"]
    });

    jqUnit.test("FLUID-4788 test - default lifecycle functions inherited from a grade", function () {
        jqUnit.expect(1);
        fluid.tests.gradeUsingComponent();
    });

    /** FLUID-5288: Improved diagnostic for incomplete grade hierarchy **/

    jqUnit.test("FLUID-5288: Improved diagnostic for component with incomplete grade hierarchy", function () {
        jqUnit.expectFrameworkDiagnostic("Framework diagnostic on incomplete grade hierarchy", function () {
            // TODO: in future, there will be no error thrown on definition, but only on use - since it should be possible
            // to declare grade hierarchies through forward reference
            fluid.defaults("fluid.tests.missingGradeComponent", {
                gradeNames: ["fluid.tests.nonexistentGrade", "autoInit"]
            });
            fluid.tests.missingGradeComponent();
        }, ["is incomplete", "fluid.tests.nonexistentGrade"]);
    });

    fluid.registerNamespace("fluid.tests.initSubcomponentTest");

    fluid.defaults("fluid.tests.initSubcomponentTest.parent", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        child: {
            type: "fluid.tests.initSubcomponentTest.child"
        }
    });

    fluid.tests.initSubcomponentTest.parent.finalInit = function (that) {
        that.child = fluid.initSubcomponent(that, "child", [fluid.COMPONENT_OPTIONS]);
    };

    fluid.defaults("fluid.tests.initSubcomponentTest.child", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });

    var checkSubcomponentGrade = function (parent, subcomponentName, expectedGrade) {
        jqUnit.expect(2);
        var child = parent[subcomponentName];
        jqUnit.assertNotUndefined("The parent component has a child component", child);
        jqUnit.assertTrue("The child component has the correct grade.",
            fluid.hasGrade(child.options, expectedGrade));
    };

    var testSubcomponents = function (tests) {
        fluid.each(tests, function (test) {
            var parent = fluid.invokeGlobalFunction(test.funcName, [test.options]);
            checkSubcomponentGrade(parent, test.subcomponentName, test.expectedGrade);
        });
    };

    jqUnit.test("initSubcomponent", function () {
        testSubcomponents([
            {
                funcName: "fluid.tests.initSubcomponentTest.parent",
                subcomponentName: "child",
                expectedGrade: "fluid.tests.initSubcomponentTest.child"
            },
            {
                funcName: "fluid.tests.initSubcomponentTest.parent",
                options: {
                    child: {
                        type: "fluid.emptySubcomponent"
                    }
                },
                subcomponentName: "child",
                expectedGrade: "fluid.emptySubcomponent"
            }
        ]);
    });

    fluid.defaults("fluid.tests.schema.textSizer", {
        gradeNames: ["fluid.tests.schema", "fluid.littleComponent", "autoInit"],
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
        gradeNames: ["fluid.littleComponent"],
        preferenceMap: {
            thing: "fluid.prefs.nonThing"
        }
    });

    fluid.defaults("fluid.tests.panels.linksControls", {
        gradeNames: ["fluid.tests.settingsPanel", "fluid.littleComponent", "autoInit"],
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
