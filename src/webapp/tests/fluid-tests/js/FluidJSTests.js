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
        var FluidJSTests = new jqUnit.TestCase ("Fluid JS Tests");

        FluidJSTests.test ("fileSizer", function () {      
            
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
    });
}) (jQuery);
