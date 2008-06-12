/* 
Copyright 2008 University of California, Berkeley
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

(function ($) {
    $(document).ready (function () {
        var fluidJSTests = new jqUnit.TestCase ("Fluid JS Tests");

        fluidJSTests.test ("fileSizer", function () {      
            
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
   });
}) (jQuery);
