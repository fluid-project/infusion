/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit*/


(function ($) {
    $(document).ready(function () {      
         // Test files.
        var file1 = {
            id: 0,
            size: 400000,
            filestatus: -1
        };
               
        var file2 = {
            id: 1,
            size: 600000,
            filestatus: -1
        };
                
        var file3 =  {
            id: 2,
            size: 800000,
            filestatus: -1
        };

        var uploaderTests = new jqUnit.TestCase("Uploader Basic Tests");

        uploaderTests.test("Initialize Default", function () {
            expect(2);
            
            var testUploader = fluid.uploader("#single-inline-fluid-uploader");
             
            jqUnit.assertEquals("Upload Manager queue is empty at the start",
                                0,
                                testUploader.uploadManager.queue.totalBytes());
            jqUnit.assertUndefined("Upload Manager should not have an invokeAfterRandomDelay() method", 
                                   testUploader.uploadManager.invokeAfterRandomDelay);
        });
       
		uploaderTests.test("Initialize DemoUploadManager", function () {
            expect(2);
            
            var testUploader = fluid.uploader("#single-inline-fluid-uploader", {
                demo: true,
                uploadManager: "fluid.swfUploadManager"
            });
            
            jqUnit.assertEquals("Upload Manager queue is empty at the start",
                                0,
                                testUploader.uploadManager.queue.totalBytes());
            jqUnit.assertNotUndefined("Upload Manager should have an invokeAfterRandomDelay() method", 
                                      testUploader.uploadManager.invokeAfterRandomDelay);        
        });
        
        uploaderTests.test("Test queue totalBytes()", function () {       
            expect(2);
            var testUploader = fluid.uploader("#single-inline-fluid-uploader");
            
            jqUnit.assertEquals("Upload Manager queue should be empty at the start",
                                0,
                                testUploader.uploadManager.queue.totalBytes());
                                
            // Add some files & check that the total size is correct.
            testUploader.uploadManager.queue.files = [file1, file2, file3];
            jqUnit.assertEquals("With three files in the queue, the byte size should be big and fat.",
                                1800000,
                                testUploader.uploadManager.queue.totalBytes());            
        });
        
        // Test formatFileSize()
        uploaderTests.test("formatFileSize()", function () {          
            var testFileSize = function (testVal, expected) {
                jqUnit.assertEquals("File size " + testVal + " bytes ", expected, 
                                    fluid.uploader.formatFileSize(testVal));
            };
            
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
        
        /* These tests need to be completely rewritten for the new ways that we're
         * setting state
         */
        /*
uploaderTests.test("testing the setting of various uploader states set by events or state", function () {
            var testUploader = fluid.uploader("#single-inline-fluid-uploader");
            var uploaderStateElm = testUploader.stateDisplay;
            
            var uploaderStateIsTest = function (testVal) {
                jqUnit.assertEquals("State should be: " + testVal, testVal, 
                                    uploaderStateElm.attr("class"));
            };
            
            var uploaderStateContainsTest = function (testVal) {
                jqUnit.assertTrue("State should contain: " + testVal, uploaderStateElm.hasClass(testVal));
            };
            
            // start
            uploaderStateIsTest("start");
            
            // browsing
            // fire browsing event check if we contain the browsing class
            testUploader.events.onFileDialog.fire();
            uploaderStateContainsTest("browsing");
            
            // loaded
            // add some files and set the state
            testUploader.uploadManager.queue.files = [file1, file2, file3];
            testUploader.events.afterFileDialog.fire();
            uploaderStateIsTest("loaded");
            
            // uploading	 	 
            // done	 	 
            // error
        });   
*/

       
    });
})(jQuery);
