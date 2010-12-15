/*
Copyright 2008-2010 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit, expect*/


(function ($) {
    $(document).ready(function () {
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
        
        fluidJSTests.test("keyForValue, fluid.find and fluid.each", function () {
            expect(16);
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
          
            expect(8);
            
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
            
            jqUnit.assertDeepEq("Value fetch", [bits, bits], 
              fluid.merge({"0.prop1": "1.prop1",
                           "1.prop2": "0.prop2"}, [], [bit2, bit1], []));  
            
        });
      
        fluidJSTests.test("reverse merge", function () {
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
            fluid.merge(target2, source);
            jqUnit.assertEquals("Property 1 should have been preserved", "thing1", target2.root.prop1);
      
        });
        
        fluidJSTests.test("reverse merge: object with multiple keys", function () {
            var target = {
                prop1: {
                    child1: {"key1": "value1", "key2": 2},
                    child2: 2,
                    child3: 3
                },
                prop2: "old",
                prop3: {"key1": "value1", "key2": 2}
            };
            var source = {
                prop1: {
                    child1: {"key1": "value1", "key2": 2},
                    child2: 2,
                    child3: 3
                },
                prop2: "new",
                prop3: {"key1": "value1", "key2": 2}
            };

            var testReverseMerge = function (policy, expected) {
                var thisTarget = fluid.copy(target);
                if (policy === "undeclared") {
                    fluid.merge(thisTarget, source);
                } else {
                    fluid.merge(policy, thisTarget, source);
                }
                jqUnit.assertEquals("\"" + policy + "\" policy", expected, thisTarget.prop2);
            };

            testReverseMerge("reverse", target.prop2);
            testReverseMerge("undeclared",  target.prop2);

            //falsy policy should be replaced.
            var undefined_obj = {}; //to mimic undefined behavior
            testReverseMerge(undefined_obj[""],  source.prop2);
            testReverseMerge(null,  source.prop2);
            testReverseMerge("",  source.prop2);
            testReverseMerge("random_string",  source.prop2);
        });
        
        fluidJSTests.test("copy", function () {
            var array = [1, "thing", true, null];
            var copy = fluid.copy(array);
            jqUnit.assertDeepEq("Array copy", array, copy);
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
            var template = "Paused at: %atFile of files (%atSize of %totalSize)";
            
            var data = {
                atFile: 12,
                totalFiles: 14,
                atSize: "100 Kb",
                totalSize: "12000 Gb"
            };
            
            var expected = "Paused at: " + data.atFile + 
                                " of files (" + data.atSize + 
                                " of " + data.totalSize + ")";
                                
            var result = fluid.stringTemplate(template, data);
            jqUnit.assertEquals("The template strings should match.", expected, result);
        });


        fluidJSTests.test("jById id not found", function () {
            var invalidIdElement = fluid.jById("this-id-does-not-exitst");
            jqUnit.assertEquals("element not found", 0, invalidIdElement.length);
        });

        fluidJSTests.test("findAncestor", function () {
            var testFunc = function (elementOfArray, indexInArray) {
                return elementOfArray.id === "top1";
            };
            jqUnit.assertEquals("Ancestor should be 'top1'", "top1", fluid.findAncestor($("#page-link-1"), testFunc).id);
        });
        
        fluidJSTests.test("Container: bind to an id", function () {
            // Give it a valid id string.
            var result = fluid.container("#main");
            jqUnit.assertTrue("One element should be returned when specifying a selector",
                              1, result.length);
          
            // Now try with a invalid string... a CSS selector matching two elements
            try {
                result = fluid.container(".container");
                jqUnit.ok(false); // We expect to get an exception. If we don't, fail immediately.
            } catch (e) {
                jqUnit.assertTrue("We should have received an exception", !!e);
            }
        });
    
        fluidJSTests.test("container(): bind to a single jQuery", function () {
            // Try with a single-item jQuery.
            var oneContainer = jQuery("#main");
            var result = fluid.container(oneContainer);
            jqUnit.assertEquals("If a single-element jQuery is used, it should be immediately returned.",
                         oneContainer, result);
             
            // Now try with a two-element jQuery, which should cause an exception.
            var twoContainers = jQuery(".container");
            try {
                result = fluid.container(twoContainers);
                jqUnit.ok(false); // We expect to get an exception. If we don't, fail immediately.
            } catch (e) {
                jqUnit.assertTrue("We should have received an exception", !!e);
            }
        });
        
        fluidJSTests.test("container(): bind to a DOM element", function () {
            var container = document.getElementById("main");
            var result = fluid.container(container);
            jqUnit.assertEquals("If a single DOM element is used, it should be wrapped in a jQuery.",
                                container, result[0]);
        });
        
        fluidJSTests.test("container(): garbage object", function () {
            // Random objects should fail.
            var container = {foo: "bar"};

            try {
                fluid.container(container);
                jqUnit.ok(false); // We expect to get an exception. If we don't, fail immediately.
            } catch (e) {
                jqUnit.assertTrue("We should have received an exception", !!e);
            }
        });
        
        fluidJSTests.test("DOM binder", function () {
            var container = $(".pager-top");
            var selectors = {
                "page-link": ".page-link",
                "inexistent": ".inexistent",
                "inner-link": "a"
            };
            var binder = fluid.createDomBinder(container, selectors);
            var pageLinks = binder.locate("page-link");
            jqUnit.assertEquals("Find 3 links", 3, pageLinks.length);
            function testSublocate(method) {
                for (var i = 0; i < 3; ++ i) {
                    var scoped = binder[method]("inner-link", pageLinks[i]);
                    jqUnit.assertNotNull("Find inner link: " + method + "(" + i + ")", scoped);
                    jqUnit.assertEquals("Found second link: " + method + "(" + i + ")", scoped[0].id, "page-link-" + (i + 1));
                }
            }
            
            testSublocate("locate");
            testSublocate("fastLocate");
            
            var inexistent = binder.locate("inexistent");
            jqUnit.assertNotNull("Inexistent return", inexistent);
            jqUnit.assertEquals("Inexistent length", 0, inexistent.length);
            binder.locate("inexistent", pageLinks[0]);
            jqUnit.assertNotNull("Scoped inexistent return", inexistent);
            jqUnit.assertEquals("Scoped inexistent length", 0, inexistent.length);
        });
         
        fluidJSTests.test("Defaults: store and retrieve default values", function () {
            var testDefaults = {
                foo: "bar"    
            };
            
            // Assign a collection of defaults for the first time.
            fluid.defaults("test", testDefaults);
            jqUnit.assertEquals("defaults() should return the specified defaults", 
                                testDefaults, fluid.defaults("test"));
            
            // Re-assign the defaults with a new collection.
            testDefaults = {
                baz: "foo"
            };
            fluid.defaults("test", testDefaults);
            jqUnit.assertEquals("defaults() should return the new defaults", 
                                testDefaults, fluid.defaults("test"));
            jqUnit.assertEquals("Foo should no longer be a property of the tabs defaults.", 
                                undefined, fluid.defaults("test").foo);
            
            // Nullify the defaults altogether.
            fluid.defaults("test", null);
            jqUnit.assertNull("The test defaults should be null.", 
                              fluid.defaults("test"));
            
            // Try to access defaults for a component that doesn't exist.
            jqUnit.assertNull("The defaults for a nonexistent component should be null.", 
                              fluid.defaults("timemachine"));
        });
        
        var defineTestComponent = function () {
            fluid.tests = fluid.tests || {};
            
            fluid.tests.testComponent = function (container, options) {
                var that = fluid.initView("fluid.tests.testComponent", container, options);
                that.subcomponent = fluid.initSubcomponent(that, "subcomponent", [that.container, fluid.COMPONENT_OPTIONS]);
                return that;
            };
            
            fluid.tests.subcomponent = function (container, options) {
                var that = fluid.initView("fluid.tests.subcomponent", container, options);
                that.greeting = that.options.greeting;
                return that;
            };
            
            fluid.defaults("fluid.tests.testComponent", {
                subcomponent: {
                    type: "fluid.tests.subcomponent"
                } 
            });
            
            fluid.defaults("fluid.tests.subcomponent", {
                greeting: "hello"
            });
        };
        
        var componentWithOverridenSubcomponentOptions = function (greeting) {
            return fluid.tests.testComponent("#notmain", {
                subcomponent: {
                    options: {
                        greeting: greeting
                    }
                }
            });
        };
        
        fluidJSTests.test("initSubcomponents", function () {
            defineTestComponent();
           
            // First, let's check that the defaults are used if no other options are specified.
            var myComponent = fluid.tests.testComponent("#notmain");
            jqUnit.assertEquals("The subcomponent should have its default options.", 
                                "hello", myComponent.subcomponent.greeting);
           
            // Now try overriding the subcomponent options with specific options.
            myComponent = componentWithOverridenSubcomponentOptions("bonjour");
            jqUnit.assertEquals("The subcomponent's options should have been overridden correctly.", 
                                "bonjour", myComponent.subcomponent.greeting);
                               
        });
        
        fluidJSTests.test("set/getBeanValue", function () {
            var model = {"path3": "thing"};
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
        
        var customStrategy = function (root, segment, index) {
            return index === 0 && segment === "path3" ? fluid.NO_VALUE : undefined;
        };
        
        fluidJSTests.test("getBeanValue with custom strategy", function () {
            var model = {path3: "thing", path4: "otherThing"};
            var value = fluid.get(model, "path3", [customStrategy, fluid.model.defaultFetchStrategy]);
            jqUnit.assertUndefined("path3 value censored", value);
            var value2 = fluid.get(model, "path4", [customStrategy, fluid.model.defaultFetchStrategy]);
            jqUnit.assertEquals("path4 value uncensored", model.path4, value2);
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
                jqUnit.assertEquals("Resolve key " + key, value, looked ? looked.template: looked);
            });
            jqUnit.assertEquals("Local fallback",  bundleb.key1, resolver.resolve(["key2", "key1"]));
            jqUnit.assertEquals("Global fallback", bundlea.key2, resolver.resolve(["key4", "key2"]));
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
            firer.fire(false); //listener should not run and assertion should not 
        });
    });
})(jQuery);
