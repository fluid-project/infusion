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
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.setLogging(true);
    
    fluid.registerNamespace("fluid.tests");
    
    var fluidJSTests = new jqUnit.TestCase("Fluid JS Tests");

    function isOdd(i) {
        return i % 2 === 1;
    }
    
    fluidJSTests.test("remove_if", function () {
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

    fluidJSTests.test("transform", function () {
        function addOne(i) {
            return i + 1;
        }
        jqUnit.assertDeepEq("Transform array", [false, true, false, true, false], fluid.transform([0, 1, 2, 3, 4], isOdd));
        jqUnit.assertDeepEq("Transform hash", {a: false, b: true}, fluid.transform({a: 0, b: 1}, isOdd));
        jqUnit.assertDeepEq("Transform hash chain", {a: true, b: false}, fluid.transform({a: 0, b: 1}, addOne, isOdd));
    });
    
    fluidJSTests.test("keyForValue, fluid.find, fluid.each, fluid.keys and fluid.values", function () {
        expect(18);
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
    
    fluidJSTests.test("null iteration", function () {
        expect(1);
        
        fluid.each(null, function () {
            fluid.fail("This should not run");
        });
        fluid.transform(null, function () {
            fluid.fail("This should not run");
        });
        
        jqUnit.assertTrue("a null each and a null transform don't crash the framework", true);
    });

    fluidJSTests.test("merge", function () {
        expect(7);
        
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
        
        jqUnit.assertDeepEq("Replace 1", 
            bit1, fluid.merge({"": "replace"}, {}, bits, bit1));
          
        jqUnit.assertDeepEq("Complex merge", [bits, bits, bits], 
            fluid.merge([], [], [bit1, bit2], null, [bit2, bit1, bits]));
    });
  
    fluidJSTests.test("reverse merge at depth", function () {
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
        var target1 = fluid.copy(target);
        fluid.merge("reverse", target1, source);
        jqUnit.assertEquals("Property 1 should have been preserved", "thing1", target1.root.prop1);
        
        var target2 = fluid.copy(target);
        fluid.merge(null, target2, source);
        jqUnit.assertEquals("Property 1 should have been preserved", "thing1", target2.root.prop1);
  
    });
    
    fluidJSTests.test("reverse merge at root", function () {
        var target = {
            prop2: "old"
        };
        var source = {
            prop2: "new"
        };

        var testReverseMerge = function (policy, expected) {
            var thisTarget = fluid.copy(target);
            fluid.merge(policy, thisTarget, source);
            jqUnit.assertEquals("\"" + policy + "\" policy", expected, thisTarget.prop2);
        };

        testReverseMerge("reverse", target.prop2);
        testReverseMerge(null,  source.prop2);
    });
    
    fluidJSTests.test("copy", function () {
        var array = [1, "thing", true, null];
        var copy = fluid.copy(array);
        jqUnit.assertDeepEq("Array copy", array, copy);
    });
    
    fluidJSTests.test("stringTemplate: greedy", function () {
        var template = "%tenant/%tenantname",
            tenant = "../tenant",
            tenantname = "core",
            expected = "../tenant/core",
            result = fluid.stringTemplate(template, {tenant: tenant, tenantname: tenantname});
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });

    fluidJSTests.test("stringTemplate: array of string values", function () {
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
    
    fluidJSTests.test("stringTemplate: array of mixed type values", function () {
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
    
            
    fluidJSTests.test("stringTemplate: data object", function () {
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
    
    fluidJSTests.test("stringTemplate: empty string", function () {
        var template = "Hello %name!";
        
        var data = {
            name: ""
        };
        
        var expected = "Hello !";
        var result = fluid.stringTemplate(template, data);
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });
    
    fluidJSTests.test("stringTemplate: missing value", function () {
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

    fluidJSTests.test("stringTemplate: missing token", function () {
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
    
    fluidJSTests.test("stringTemplate: multiple replacement", function () {
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

    fluidJSTests.test("stringTemplate: special character [] and ()", function () {
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
                            " of " + data["file"] + ")";

                            
        var result = fluid.stringTemplate(template, data);
        jqUnit.assertEquals("The template strings should match.", expected, result);
    });


    var testDefaults = {
        foo: "bar"    
    };

    fluid.defaults("test", testDefaults); 
     
    fluidJSTests.test("Defaults: store and retrieve default values", function () {
        // Assign a collection of defaults for the first time.

        jqUnit.assertDeepEq("defaults() should return the specified defaults", 
                            testDefaults, fluid.filterKeys(fluid.defaults("test"), ["foo"]));
        
        // Re-assign the defaults with a new collection.
        testDefaults2 = {
            baz: "foo"
        };
        fluid.defaults("test", testDefaults2);
        jqUnit.assertDeepEq("defaults() should return the original defaults", 
                            testDefaults, fluid.filterKeys(fluid.defaults("test"), ["foo", "baz"]));
        
        // Try to access defaults for a component that doesn't exist.
        jqUnit.assertNoValue("The defaults for a nonexistent component should be null.", 
                          fluid.defaults("timemachine"));
    });
           
    fluidJSTests.test("FLUID-4285 test - prevent 'double options'", function () {
        try {
            jqUnit.expect(1);
            fluid.pushSoftFailure(true);
            fluid.defaults("news.parent", {
                gradeNames: ["fluid.littleComponent", "autoInit"],
                options: {
                    test: "test"
                }
            });
        } catch (e) {
            jqUnit.assert("Caught exception in constructing double options component");
        } finally {
            fluid.pushSoftFailure(-1);  
        }
    });
    
    fluidJSTests.test("set/getBeanValue", function () {
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
 
        fluidJSTests.test("Globals", function () {
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
        
    });
    
    fluidJSTests.test("messageResolver", function () {
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
    
    fluid.defaults("fluid.tests.defaultMergePolicy", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        defaultSource: "sourceValue",
        defaultTarget: "targetValue",
        mergePolicy: {
            defaultTarget: "defaultSource"
        }
    }); 
    
    fluid.tests.fluid4736Tests = [{
        message: "merge policy has no effect on plain defaults",
        options: undefined,
        expected: {
            defaultSource: "sourceValue",
            defaultTarget: "targetValue"          
        }
    }, {
        message: "merge policy copies user option to default value",
        options: {
            defaultSource: "userSource"
        },
        expected: {
            defaultSource: "userSource",
            defaultTarget: "userSource"
        }
    }, {
        message: "merge policy has no effect on full user values",
        options: {
            defaultSource: "userSource",
            defaultTarget: "userTarget"
        },
        expected: {
            defaultSource: "userSource",
            defaultTarget: "userTarget"
        }
    }, 
    /*
    // This test case can probably not be supported until FLUID-4392: See implementation comment in
    // fluid.applyDefaultValueMergePolicy - see also FLUID-4733
    {
        message: "user modifies value to default",
        options: {
            defaultSource: "sourceValue",
        },
        expected: {
            defaultSource: "sourceValue",
            defaultTarget: "sourceValue"
        }
    }*/];
    
    fluidJSTests.test("FLUID-4736: Interaction of default value merge policy with grade chain", function () {
        fluid.each(fluid.tests.fluid4736Tests, function (fixture) {
            var component = fluid.tests.defaultMergePolicy(fixture.options);
            fluid.testUtils.assertLeftHand(fixture.message, fixture.expected, component.options);              
        });      
    });
    
    
    fluidJSTests.test("Sorting listeners", function () {
        var accumulate = [];
        var makeListener = function (i) {
            return function () {
                accumulate.push(i);
            };
        };
        var firer = fluid.event.getEventFirer();
        firer.addListener(makeListener(4), null, null, "last");
        firer.addListener(makeListener(3));
        firer.addListener(makeListener(2), null, null, 10);
        firer.addListener(makeListener(1), null, null, "first");
        firer.fire();
        jqUnit.assertDeepEq("Listeners fire in priority order", [1, 2, 3, 4], accumulate);
    });
    
    fluidJSTests.test("Attach and remove listeners", function () {
        var testListener = function (shouldExecute) {
            jqUnit.assertTrue("This listener should be reached only once", shouldExecute);
        };

        expect(1);
        var firer = fluid.event.getEventFirer();
        firer.addListener(testListener);
        firer.fire(true);

        firer.removeListener(testListener);
        firer.fire(false); //listener should not run and assertion should not execute 
    });
    
    fluid.tests.makeNotingListener = function(key, value) {
        return function(that) {
            var existing = that.values[key];
            that.values[key] = existing === undefined? 1 : existing + 1;
        };
    };
    
    fluid.defaults("fluid.tests.listenerTest", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            event: null
        },
        listeners: {
            event: fluid.tests.makeNotingListener("noNamespace"),
            "event.namespace": fluid.tests.makeNotingListener("namespace")
        }
    });
    
    fluidJSTests.test("Correctly merge optioned listeners", function() {
        var options = {listeners: {
            event: fluid.tests.makeNotingListener("noNamespace2"),
            "event.namespace": fluid.tests.makeNotingListener("namespace2")
        }};
        var that = fluid.tests.listenerTest(options);
        that.values = {};
        that.events.event.fire(that);
        var expected = {
            noNamespace: 1,
            noNamespace2: 1,
            namespace2: 1  
        };
        jqUnit.assertDeepEq("Listeners correctly merged", expected, that.values); 
    });
    
    fluid.tests.initLifecycle = function (that) {
        that.initted = true;  
    };
    
    fluid.defaults("fluid.tests.lifecycleTest", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        preInitFunction: "fluid.tests.initLifecycle"  
    });
    
    fluidJSTests.test("Proper merging of lifecycle functions", function () {
        var model = { value: 3 };
        var that = fluid.tests.lifecycleTest({model: model});
        jqUnit.assertEquals("Grade preInit function fired", model, that.model);
        jqUnit.assertEquals("Custom preInit function fired", true, that.initted);
    });
    
    fluid.tests.initLifecycle1 = function (that) {
        that.initted = 1;  
    };
    
    fluid.tests.initLifecycle2 = function (that) {
        that.initted = 2;
    };
    
    fluid.defaults("fluid.tests.lifecycleTest2", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        preInitFunction: [{
            namespace: "preInitModelComponent",
            listener: "fluid.identity"
        }, {
            priority: 2,
            listener: "fluid.tests.initLifecycle2"
        }, {
            priority: 1,
            listener: "fluid.tests.initLifecycle1"
        }]
    });
    
    fluidJSTests.test("Detailed interaction of priority and namespacing with lifecycle functions", function () {
        var model = { value: 3 };
        var that = fluid.tests.lifecycleTest2({model: model});
        jqUnit.assertUndefined("Grade preInit function defeated", that.model);
        jqUnit.assertEquals("Priority order respected", 1, that.initted);
    });

})(jQuery);
