/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit*/

// JSLint options 
/*jslint white: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        fluid.staticEnvironment = fluid.typeTag("fluid.uploader.tests");
        
        var uploaderTests = new jqUnit.TestCase("Uploader Basic Tests");
        var errorHandler = fluid.uploader.errorHandler(".uploader-total-errored");
        var mountainTestFile = {
                fileName : "Mountain.jpg", // The file name. The path is not included. 
                size : 400000 // The file size in bytes     
            };            
        var oceanTestFile = {
            fileName : "Ocean.jpg", // The file name. The path is not included. 
            size : 950000000 // The file size in bytes        
        };

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
            testFileSize(Math.pow(2, 52), "4294967296.0 MB");
            testFileSize(Math.pow(2, 1024), "Infinity MB"); //test "infinity"
        });

        uploaderTests.test("derivePercent()", function () {          
            var total = 5;
            var testPercentage = function (testVal, expected) {
                jqUnit.assertEquals(testVal + "/" + total + " is " + expected + "%", expected, 
                                    fluid.uploader.derivePercent(testVal, total));
            };
            testPercentage(0, 0);
            testPercentage(2.5, 50);
            testPercentage(total, 100);
            testPercentage(10, 200);
            testPercentage(0.1, 2);
            testPercentage(-5, -100);
            testPercentage("1", 20);
            testPercentage("0.2", 4);
            
            //change total to odd number to test rounding
            total = 7;
            testPercentage(0, 0);
            testPercentage(3.5, 50);
            testPercentage(total, 100);
            testPercentage(10, 143); //142.857
            testPercentage(0.1, 1);  //1.42857
            testPercentage(-5, -71); //-71.42857
            testPercentage("3.5", 50); 
            testPercentage("0.1", 1);  //1.42857
            
            //infinity test
            testPercentage(Math.pow(2, 1024), "Infinity");
            total = Math.pow(2, 1024);
            testPercentage(0, 0);
            jqUnit.assertTrue(total + "/" + total + " is not a number", 
                            isNaN(fluid.uploader.derivePercent(total / total)));
        });

        var events = {
            afterFileDialog: fluid.event.getEventFirer(),
            afterFileRemoved: fluid.event.getEventFirer(),
            onUploadStart: fluid.event.getEventFirer(),
            onFileProgress: fluid.event.getEventFirer(),
            afterUploadComplete: fluid.event.getEventFirer()
        };
        var status = $("#statusRegion");
        var totalStatusText = $("#totalFileStatusText");
        
        var checkStatusAfterFiringEvent = function (text, eventName) {
            totalStatusText.text(text);
            events[eventName].fire();
            jqUnit.assertEquals("The status region should match the total text after firing " + eventName, 
                                totalStatusText.text(), status.text());    
        };
        
        uploaderTests.test("ARIA Updater", function () {
            fluid.uploader.ariaLiveRegionUpdater(status, totalStatusText, events);
            
            jqUnit.assertEquals("The status region should be empty to start.", "", status.text());
            
            totalStatusText.text("hello world");
            jqUnit.assertEquals("The status region should be empty after invoking the updater.", "", status.text());
            
            checkStatusAfterFiringEvent("cat", "afterFileDialog");
            checkStatusAfterFiringEvent("dog", "afterFileRemoved");
            checkStatusAfterFiringEvent("shark", "afterUploadComplete");
        });

        uploaderTests.test("ErrorHandling tests - addError", function () {
            var testAddingError = function (fileName, errorCode) {
                errorHandler.addError(fileName, errorCode); 
                jqUnit.assertNotEquals("Error array should not be empty.", 0, errorHandler.errorMsgs[errorCode].files.length);
                jqUnit.assertNotEquals("Filename should appear in the array", -1, $.inArray(fileName, errorHandler.errorMsgs[errorCode].files));
            };
            testAddingError(mountainTestFile.fileName, "exceedsUploadLimit");
            testAddingError(mountainTestFile.fileName, "exceedsFileLimit");
        });

        uploaderTests.test("ErrorHandling tests - removeError", function () {
            var testArray = function (errorCode) {
                jqUnit.assertEquals("Error array should contains nothing.", 0, errorHandler.errorMsgs[errorCode].files.length);
            };
            errorHandler.addError(oceanTestFile.fileName, "exceedsUploadLimit");
            errorHandler.addError(oceanTestFile.fileName, "exceedsFileLimit");
            errorHandler.removeError("exceedsUploadLimit");
            testArray("exceedsUploadLimit");
            errorHandler.removeError("exceedsFileLimit");
            testArray("exceedsFileLimit");
        });

        uploaderTests.test("ErrorHandling tests - refreshView", function () {
            //use a new errorHandler
            var errorHandler = fluid.uploader.errorHandler(".uploader-total-errored"); 
            var fileLimitRow = errorHandler.locate("exceedsFileLimit");
            var uploadLimitRow = errorHandler.locate("exceedsUploadLimit");
            var testVisibility = function (element, state) {
                if (state) {
                    jqUnit.assertTrue("This element should be Visible.", element.is(":visible"));
                } else {
                    jqUnit.assertFalse("This element should be Invisible.", element.is(":visible"));
                }
            };
            //Error is invisible at beginning
            testVisibility(errorHandler.container, false);
            testVisibility(uploadLimitRow, false);
            testVisibility(fileLimitRow, false);
            //Adding errors
            errorHandler.addError(oceanTestFile.fileName, "exceedsUploadLimit");
            errorHandler.refreshView();
            testVisibility(errorHandler.container, true);
            testVisibility(uploadLimitRow, true);
            testVisibility(fileLimitRow, false);
            errorHandler.addError(oceanTestFile.fileName, "exceedsFileLimit");
            errorHandler.refreshView();
            testVisibility(uploadLimitRow, true);
            testVisibility(fileLimitRow, true);
            //Delete row
            errorHandler.locate("deleteErrorButton", uploadLimitRow).click();
            testVisibility(uploadLimitRow, false);
            testVisibility(fileLimitRow, true);
            errorHandler.locate("deleteErrorButton", fileLimitRow).click();
            testVisibility(uploadLimitRow, false);
            testVisibility(fileLimitRow, false);
            //When all errors are deleted, error box should disappear.
            testVisibility(errorHandler.container, false);
        });

        uploaderTests.test("ErrorHandling tests - toggle error message body", function () {
            //use a new errorHandler
            var errorHandler = fluid.uploader.errorHandler(".uploader-total-errored"); 
            var fileLimitRow = errorHandler.locate("exceedsFileLimit");
            var uploadLimitRow = errorHandler.locate("exceedsUploadLimit");
            var testVisibility = function (element, state) {
                if (state) {
                    jqUnit.assertTrue("This element should be Visible.", 
                        errorHandler.locate("errorBodyTogglable", element).is(":visible"));
                } else {
                    jqUnit.assertFalse("This element should be Invisible.", 
                        errorHandler.locate("errorBodyTogglable", element).is(":visible"));
                }
            };
            var testToggle = function (row, upload_state, file_state) {
                if (row !== null) {
                    errorHandler.locate("toggleErrorBodyButton", row).click();
                }
                testVisibility(uploadLimitRow, upload_state);
                testVisibility(fileLimitRow, file_state);
            }
            testToggle(null, false, false);
            errorHandler.addError(oceanTestFile.fileName, "exceedsUploadLimit");
            errorHandler.addError(oceanTestFile.fileName, "exceedsFileLimit");
            errorHandler.refreshView();
            testToggle(null, false, false);
            testToggle(uploadLimitRow, true, false);
            testToggle(uploadLimitRow, false, false);
            testToggle(fileLimitRow, false, true);
            testToggle(fileLimitRow, false, false);
        });

        uploaderTests.test("ErrorHandling tests - cleanErrors", function () {
            errorHandler.addError(oceanTestFile.fileName, "exceedsUploadLimit");
            errorHandler.addError(oceanTestFile.fileName, "exceedsFileLimit");
            errorHandler.clearErrors();
            $.each(errorHandler.errorMsgs, function (errorCode, errObj) {
                jqUnit.assertEquals("Error array '" + errorCode + "' should contains nothing.", 0, errObj.files.length);
            });
        });
    });
})(jQuery);
