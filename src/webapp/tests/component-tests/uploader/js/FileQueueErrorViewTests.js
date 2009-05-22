/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2008-2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid*/

(function ($) {
    $(function () {
        
        var removedFile = null;

        var mockUploadManager = {
            options: {
                fileSizeLimit: "20480 KB",
                fileTypes: "*.png",
                fileUploadLimit: 3,
                fileQueueLimit: 0
            },
            swfUploader: {
                movieName: "mockSWFobj"
            },
            events: {}
        };

        fluid.mergeListeners(mockUploadManager.events , {
            onShowErrorMessage: null,
            afterHideErrorMessage: null
        });

        
        var docLittleTestFile = {
             id : 0, // SWFUpload file id, used for starting or cancelling and upload 
             index : 0, // The index of this file for use in getFile(i) 
             name : "Mountain.doc", // The file name. The path is not included. 
             size : 400000 // The file size in bytes     
        };
        
        var jpgBiggerTestFile = {
             id : 230948230984, // SWFUpload file id, used for starting or cancelling and upload 
             index : 1, // The index of this file for use in getFile(i) 
             name : "Ocean.jpg", // The file name. The path is not included. 
             size : 950000000 // The file size in bytes        
        };
        
        var zeroLengthTestFile = {
             id : 230948230985, // SWFUpload file id, used for starting or cancelling and upload 
             index : 1, // The index of this file for use in getFile(i) 
             name : "Desert.png", // The file name. The path is not included. 
             size : 0 // The file size in bytes        
        };
        
        
        
        var qEl;
        
        // Useful locate functions.
        var locateRows = function (q) {
            return qEl.find(q.options.selectors.row);   
        };
        
        var nameForRow = function (q, rowEl) {
            return rowEl.find(q.options.selectors.fileName).text();
        };
        
        var sizeForRow = function (q, rowEl) {
            return rowEl.find(q.options.selectors.fileSize).text();
        };
        
        // Reusable test functions
        var checkFileRow = function (q, file, row) {
            jqUnit.assertEquals("The added row should have the correct filename.",
                                file.name, nameForRow(q, row));
            jqUnit.assertEquals("The added row should have the correct size.",
                                fluid.uploader.formatFileSize(file.size), 
                                sizeForRow(q, row));    
        };
      
        var createErrorQueue = function (qEl) {
            return fluid.fileQueueErrorView(qEl, mockUploadManager);
        };
        
       
        
        // File Error Queue test case
        var setupFunction = function () {
            qEl = $("#main .flc-uploader-queueError");
        };
        
        var fileQueueErrorViewTests = new jqUnit.TestCase("fileQueueErrorViewTests Tests", setupFunction);
        
        /* Test 1 */
        
        fileQueueErrorViewTests.test("Init and initial visibility", function () {
            expect(7);
            
            var q = createErrorQueue(qEl);
            var qSelector = q.options.selectors.errorQueue;
            
            /* 1.1 */
            jqUnit.assertNotNull("We have an error queue (not null).", q);

            /* 1.2 */
            jqUnit.assertNotUndefined("We have an error queue (not undefined).", q);

            /* 1.3 */
            jqUnit.assertNotNull("Error Queue has an Upload Manager (not null).", q.uploadManager);

            /* 1.4 */
            jqUnit.assertNotUndefined("Error Queue has an Upload Manager (not undefined).", q.uploadManager);
            
            /* 1.5 */
            jqUnit.assertEquals("ErrorCount is 0", q.errorCount, 0);
            
            /* 1.6 */
            jqUnit.notVisible("The queue is not visible", qSelector);
            
            /* 1.7 */
            q.showErrors();
            jqUnit.notVisible(".showErrors() DID NOT show because there are not any errors yet.", qSelector);
                        
        });
        
        /* Test 2 */
        
        fileQueueErrorViewTests.test("show and hide", function () {
            expect(3);
            
            var q = createErrorQueue(qEl);
            var qSelector = q.options.selectors.errorQueue;
            
            /* 2.1 */
            q.queueError(docLittleTestFile, -110, "");                        
            jqUnit.assertEquals("Added error, errorCount should be 1", q.errorCount, 1);
            
            /* 2.2 */
            q.showErrors();            
            jqUnit.isVisible("showErrors() DID show -  we now have an error", qSelector);
            
            /* 2.3 */
            q.hideErrors();
            jqUnit.notVisible("hideErrors() DID hide", qSelector);
                        
        });

        /* Need tests for 
         * * file errors
         * * file number limit errors
         * * scrolling
         * * OK button
         */

    });
    
})(jQuery);
