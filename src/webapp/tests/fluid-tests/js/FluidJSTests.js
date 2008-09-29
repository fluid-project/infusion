/* 
Copyright 2008 University of California, Berkeley
Copyright 2008 University of Toronto
Copyright 2008 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global jqUnit*/


(function ($) {
    $(document).ready(function () {
        fluid.logEnabled = true;
        
        var fluidJSTests = new jqUnit.TestCase("Fluid JS Tests");
        
        fluidJSTests.test("remove_if", function() {
            function isOdd(i) {return i % 2 === 1;}
            jqUnit.assertDeepEq("Remove nothing", [2, 4, 6, 8], fluid.remove_if([2, 4, 6, 8], isOdd));
            jqUnit.assertDeepEq("Remove first ", [2, 4, 6, 8], fluid.remove_if([1, 2, 4, 6, 8], isOdd));
            jqUnit.assertDeepEq("Remove last ", [2, 4, 6, 8], fluid.remove_if([2, 4, 6, 8, 9], isOdd));
            jqUnit.assertDeepEq("Remove first two ", [2, 4, 6, 8], fluid.remove_if([7, 1, 2, 4, 6, 8], isOdd));
            jqUnit.assertDeepEq("Remove last two ", [2, 4, 6, 8], fluid.remove_if([2, 4, 6, 8, 9, 11], isOdd));
            jqUnit.assertDeepEq("Remove all ", [], fluid.remove_if([1, 3, 5, 7], isOdd));
            jqUnit.assertDeepEq("Remove from nothing ", [], fluid.remove_if([], isOdd));    
        });

        fluidJSTests.test("merge", function() {
          
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
            
            jqUnit.assertDeepEq("Replace 1", 
              bit1, fluid.merge({"": "replace"}, {}, bits, bit1));
              
            jqUnit.assertDeepEq("Complex merge", [bits, bits, bits], 
              fluid.merge({}, {}, [bit1, bit2], null, [bit2, bit1, bits]));
            
            jqUnit.assertDeepEq("Value fetch", [bits, bits], 
              fluid.merge({"0.prop1": "1.prop1",
                                 "1.prop2": "0.prop2"}, {}, [bit2, bit1], {}));  
            
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
            jqUnit.assertEquals("element not found", null, invalidIdElement);
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
    
        fluidJSTests.test("container(): bind to a single jQuery", function() {
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
                var result = fluid.container(container);
                jqUnit.ok(false); // We expect to get an exception. If we don't, fail immediately.
            } catch (e) {
                jqUnit.assertTrue("We should have received an exception", !!e);
            }
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
    });
})(jQuery);
