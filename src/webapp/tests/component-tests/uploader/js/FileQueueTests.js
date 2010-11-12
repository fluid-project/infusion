/*
Copyright 2008-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid*/

(function ($) {
    $(function () {
                 
        /****************************
         * File Objects for testing *
         ****************************/
         
        var mountainTestFile = {
             id : 0, // SWFUpload file id, used for starting or cancelling and upload 
             index : 0, // The index of this file for use in getFile(i) 
             name : "Mountain.jpg", // The file name. The path is not included. 
             size : 400000, // The file size in bytes   
             filestatus: fluid.uploader.fileStatusConstants.QUEUED // initial file queued status
        };
        
        var oceanTestFile = {
             id : 230948230984, // SWFUpload file id, used for starting or cancelling and upload 
             index : 1, // The index of this file for use in getFile(i) 
             name : "Ocean.jpg", // The file name. The path is not included. 
             size : 950000000, // The file size in bytes   
             filestatus: fluid.uploader.fileStatusConstants.QUEUED // initial file queued status
        };
                
        // Total size of this list files: 200000 + 400000 + 600000 + 800000 + 1000000 = 3000000
        var file0 = {
            id: 0,
            size: 200000
        };
               
        var file1 = {
            id: 1,
            size: 400000
        };
                
        var file2 =  {
            id: 2,
            size: 600000
        };

        var file3 =  {
            id: 3,
            size: 800000
        };

        var file4 =  {
            id: 4,
            size: 1000000
        };
        
        var fileSet = [file0, file1, file2, file3, file4];
        var totalFileSetSize = file0.size + file1.size + file2.size + file3.size + file4.size;
        
        var setupQueue = function () {
            return fluid.uploader.fileQueue();
        }
        var loadQueue = function (fileArray, queue) {
            for (var i = 0; i < fileArray.length; i++) {
                queue.addFile(fileArray[i]);
                queue.files[i].filestatus = fluid.uploader.fileStatusConstants.QUEUED;
            }
        };
        
        
        /*************************
         * File Queue Unit tests *
         *************************/
         
        var fileQueueTests = new jqUnit.TestCase("FileQueue Tests");
        
        fileQueueTests.test("Initialize fileQueue: everything is empty", function () {
            expect(2);
            
            var q = setupQueue();
        
            jqUnit.assertEquals("fileQueue queue is empty at the start",
                                0,
                                q.totalBytes());
            jqUnit.assertEquals("fileQueue queue.files is an empty array", 0, q.files.length);
            
        });
 
        fileQueueTests.test("addFiles and removing files", function () {
            expect(5);
            var q = setupQueue();
        
            jqUnit.assertEquals("fileQueue queue is empty at the start", 0, q.totalBytes());
            
            // Add a file to the queue, check the size.            
            q.addFile(mountainTestFile);
            jqUnit.assertEquals("added Mountain, size 400000, totalBytes should now be 400000", 400000, q.totalBytes());

            // Add another. totalBytes() should increase.
            q.addFile(oceanTestFile);                 
            jqUnit.assertEquals("added Ocean, size 950000000, totalBytes should now be 950400000",
                                950400000,
                                q.totalBytes());
                                
            // Remove the first file, check that the total bytes are smaller.
            q.removeFile(mountainTestFile);                            
            jqUnit.assertEquals("removed Mountain, size 400000, totalBytes should now be 950000000",
                                950000000,
                                q.totalBytes());

            // Remove the second file, queue should be empty again.
            q.removeFile(oceanTestFile);                            
            jqUnit.assertEquals("removed Ocean, size 950000000, totalBytes should now be 0",
                                0,
                                q.totalBytes());
        });
        
        var checkReadyFiles = function (q, numReadFiles, sizeOfReadyFiles) {
            jqUnit.assertEquals("getReadyFiles() should reflect the number of files currently in the queue.",
                                numReadFiles,
                                q.getReadyFiles().length);
            jqUnit.assertEquals("and sizeOfReadyFiles() should return the number of bytes for each ready file in the queue.",
                                sizeOfReadyFiles,
                                q.sizeOfReadyFiles());
        };
        
        fileQueueTests.test("fileQueue: getReadyFiles() and sizeOfReadyFiles()", function () {
            expect(10);
            
            var q = setupQueue();
            checkReadyFiles(q, 0, 0);
                                
            q.addFile(mountainTestFile);
            checkReadyFiles(q, 1, 400000);

            q.addFile(oceanTestFile);
            checkReadyFiles(q, 2, 950400000);
                                                         
            q.removeFile(mountainTestFile);                            
            checkReadyFiles(q, 1, 950000000);

            q.removeFile(oceanTestFile);                            
            checkReadyFiles(q, 0, 0);
        });
        
        var checkUploadedFiles = function (q, numReadyFiles, sizeOfReadyFiles, numUploadedFiles, sizeOfUploadedFiles) {
            jqUnit.assertEquals("getReadyFiles() should reflect the number of files currently in the queue.",
                                numReadyFiles,
                                q.getReadyFiles().length);
            jqUnit.assertEquals("----- sizeOfReadyFiles() should return the number of bytes for each ready file in the queue.",
                                sizeOfReadyFiles,
                                q.sizeOfReadyFiles());
            jqUnit.assertEquals("----- and getUploadedFiles() should reflect the number of files that have been uploaded",
                                numUploadedFiles,
                                q.getUploadedFiles().length);
            jqUnit.assertEquals("----- and getUploadedFiles() should return the size of all uploaded files",
                                sizeOfUploadedFiles,
                                q.sizeOfUploadedFiles());
        };
        
        fileQueueTests.test("fileQueue: getUploadedFiles() and sizeOfUploadedFiles()", function () {
            expect(24);
            
            var q = setupQueue();
            
            // Check the empty queue
            checkUploadedFiles(q, 0, 0, 0, 0);
            
            // Add two files to the queue, but don't upload them yet.
            q.addFile(mountainTestFile);
            q.addFile(oceanTestFile);
            checkUploadedFiles(q, 2, 950400000, 0, 0);
            
            // Cancel one file.
            q.files[0].filestatus = fluid.uploader.fileStatusConstants.CANCELLED;
            checkUploadedFiles(q, 2, 950400000, 0, 0);

            // Upload the first file.
            q.files[0].filestatus = fluid.uploader.fileStatusConstants.COMPLETE;
            checkUploadedFiles(q, 1, 950000000, 1, 400000);

            // Cancel the second file.                                             
            q.files[1].filestatus = fluid.uploader.fileStatusConstants.CANCELLED;
            checkUploadedFiles(q, 1, 950000000, 1, 400000);

            // Upload the second file.
            q.files[1].filestatus = fluid.uploader.fileStatusConstants.COMPLETE;
            checkUploadedFiles(q, 0, 0, 2, 950400000);           
        });

        var checkCurrentBatch = function (q, numBatchedFiles, sizeOfBatch) {
            jqUnit.assertNotNull("currentBatch should not be null",
                                 q.currentBatch);
            
            jqUnit.assertEquals("all files QUEUED, setupCurrentBatch(), currentBatch should contain 5 files",
                                numBatchedFiles,
                                q.currentBatch.files.length);
            
            jqUnit.assertEquals("----- currentBatch.totalBytes should contain 3000000",
                                sizeOfBatch,
                                q.currentBatch.totalBytes);
        };
        
        fileQueueTests.test("fileQueue: setupCurrentBatch(), clearCurrentBatch() and updateCurrentBatch()", function () {
            expect(14);
            
            var q = setupQueue();
            loadQueue(fileSet, q);
            
            jqUnit.assertEquals("load queue, getReadyFiles() should contain 5 files at the start",
                                5,
                                q.getReadyFiles().length);
                                
            jqUnit.assertNull("----- currentBatch should be null",
                                q.currentBatch);
                                
            q.setupCurrentBatch();
            checkCurrentBatch(q, 5, totalFileSetSize);

            q.clearCurrentBatch();
            checkCurrentBatch(q, 0, 0);
            
            q.files[0].filestatus = fluid.uploader.fileStatusConstants.COMPLETE;
            q.updateCurrentBatch();
            checkCurrentBatch(q, 4, totalFileSetSize - q.files[0].size);
                                
            q.files[1].filestatus = fluid.uploader.fileStatusConstants.COMPLETE;
            q.setupCurrentBatch();
            checkCurrentBatch(q, 3, 2400000);
        });        
   });
    
})(jQuery);
