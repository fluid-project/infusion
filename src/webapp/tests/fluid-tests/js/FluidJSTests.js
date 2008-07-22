/* 
Copyright 2008 University of California, Berkeley
Copyright 2008 University of Toronto

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
        var fluidJSTests = new jqUnit.TestCase("Fluid JS Tests");

        fluidJSTests.test("fileSizer", function () {      
            
			function testFileSize(testVal, expected) {
				jqUnit.assertEquals("File size " + testVal + " bytes ", expected, fluid.utils.filesizeStr(testVal));
			}
			
			testFileSize(0, "0.0 KB");
			testFileSize(1, "0.1 KB");
			testFileSize(10, "0.1 KB");
			testFileSize(50, "0.1 KB");
			testFileSize(100, "0.1 KB");
			testFileSize(150, "0.2 KB");
			testFileSize(200, "0.2 KB");
			testFileSize(400, "0.4 KB");
			testFileSize(600, "0.6 KB");
			testFileSize(800, "0.8 KB");
			testFileSize(900, "0.9 KB");
			testFileSize(910, "0.9 KB");
			testFileSize(950, "1.0 KB");
			testFileSize(999, "1.0 KB");
			testFileSize(1023, "1.0 KB");
			testFileSize(1024, "1.0 KB");
			testFileSize(1025, "1.1 KB");
			testFileSize(10000, "9.8 KB");
			testFileSize(100000, "97.7 KB");
			testFileSize(1000000, "976.6 KB");
			testFileSize(10000000, "9.6 MB");
			testFileSize(100000000, "95.4 MB");
			testFileSize(10000000000, "9536.8 MB");
			testFileSize(-1024, "");
			testFileSize("string", "");
			
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
								
			var result = fluid.utils.stringTemplate(template, data);
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
								
			var result = fluid.utils.stringTemplate(template, data);
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
								
			var result = fluid.utils.stringTemplate(template, data);
			jqUnit.assertEquals("The template strings should match.", expected, result);
		});
		
		fluidJSTests.test("stringTemplate: empty string", function () {
			var template = "Hello %name!";
			
			var data = {
				name: ""
			};
			
			var expected = "Hello !";
			var result = fluid.utils.stringTemplate(template, data);
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
								
			var result = fluid.utils.stringTemplate(template, data);
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
								
			var result = fluid.utils.stringTemplate(template, data);
			jqUnit.assertEquals("The template strings should match.", expected, result);
		});

        fluidJSTests.test("initCssClassNames: mix-in css values in an object: empty classNames", function () {
			var defaultNames = {
				t1: 'a1',
				t2: 'a2',
				t3: 'a3',
				t4: 'a4'
			};	
			
			var classNames = {};
			
			var options = fluid.utils.initCssClassNames(defaultNames, classNames);
			
			var expected = defaultNames.t1 + "," + defaultNames.t2 + "," + defaultNames.t3 + "," + defaultNames.t4;
			var result = options.t1 + "," + options.t2 + "," + options.t3 + "," + options.t4;
			
			jqUnit.assertEquals("The values in the options object should match those in defaults.", expected, result);

		});

		fluidJSTests.test("initCssClassNames: mix-in css values in an object: trying to insert a new value", function () {
			var defaultNames = {
				t1: 'a1',
				t2: 'a2',
				t3: 'a3',
				t4: 'a4'
			};	
			
			var classNames = {
				t5: "a5"
			};
			
			var options = fluid.utils.initCssClassNames(defaultNames, classNames);
						
			jqUnit.assertUndefined("t5 should be undefined in options.", options.t5);

		});

		fluidJSTests.test("initCssClassNames: mix-in css values in an object: trying to insert a new value", function () {
			var defaultNames = {
				t1: 'a1',
				t2: 'a2',
				t3: 'a3',
				t4: 'a4'
			};	
			
			var classNames = {
				t1: 'b1',
				t2: 'b2',
				t3: 'b3',
				t4: 'b4',
				t5: "b5"
			};
			
			var options = fluid.utils.initCssClassNames(defaultNames, classNames);
						
			var expected = "b1,b2,b3,b4";
			var result = options.t1 + "," + options.t2 + "," + options.t3 + "," + options.t4;

			jqUnit.assertUndefined("t5 should be undefined in options.", options.t5);
			jqUnit.assertEquals("The values in the options object should match those in classNames.", expected, result);

		});

        fluidJSTests.test("jById id not found", function () {
            var invalidIdElement = fluid.utils.jById("this-id-does-not-exitst");
            jqUnit.assertEquals("element not found", null, invalidIdElement);
        });

        fluidJSTests.test("findAncestor", function () {
            var testFunc = function (elementOfArray, indexInArray) {
                return elementOfArray.id === "top1";
            };
            jqUnit.assertEquals("Ancestor should be 'top1'", "top1", fluid.utils.findAncestor($("#page-link-1"), testFunc).id);
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
                jqUnit.assertEquals("The exception should be a NotOne.", "NotOne", e.name);
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
                jqUnit.assertEquals("The exception should be a NotOne.", "NotOne", e.name);
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
                jqUnit.assertEquals("The exception should be a NotOne.", "NotOne", e.name);
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
