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
        
        // test files
        
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
        
        // More test files
        
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
        
        var loadQueue = function (fileArray, queue) {
            for (var i = 0; i < fileArray.length; i++) {
                queue.addFile(fileArray[i]);
                queue.files[i].filestatus = fluid.uploader.fileStatusConstants.QUEUED;
            }
        };
        
        var fileQueueViewTests = new jqUnit.TestCase("FileQueue Tests");
        
        fileQueueViewTests.test("Initialize fileQueue: everything is empty", function () {
            expect(2);
            
            var testQueue = fluid.fileQueue();
        
            jqUnit.assertEquals("fileQueue queue is empty at the start",
                                0,
                                testQueue.totalBytes());
            jqUnit.assertEquals("fileQueue queue.files is an empty array",0,testQueue.files.length);
            
        });
 
        fileQueueViewTests.test("addFiles and removing files", function () {
            expect(5);
            
            var testQueue = fluid.fileQueue();
        
            jqUnit.assertEquals("fileQueue queue is empty at the start",
                                0,
                                testQueue.totalBytes());
                                
            testQueue.addFile(mountainTestFile);                 
            
            jqUnit.assertEquals("added Mountain, size 400000, totalBytes should now be 400000",
                                400000,
                                testQueue.totalBytes());

            testQueue.addFile(oceanTestFile);                 
            
            jqUnit.assertEquals("added Ocean, size 950000000, totalBytes should now be 950400000",
                                950400000,
                                testQueue.totalBytes());
                                                          
            testQueue.removeFile(mountainTestFile);                            
            
            jqUnit.assertEquals("removed Mountain, size 400000, totalBytes should now be 950000000",
                                950000000,
                                testQueue.totalBytes());

            testQueue.removeFile(oceanTestFile);                            
            
            jqUnit.assertEquals("removed Ocean, size 950000000, totalBytes should now be 0",
                                0,
                                testQueue.totalBytes());
           
            
        });
        
        fileQueueViewTests.test("fileQueue: getReadyFiles() and sizeOfReadyFiles()", function () {
            expect(10);
            
            var testQueue = fluid.fileQueue();
        
            jqUnit.assertEquals("getReadyFiles() should contain 0 files at the start",
                                0,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("and sizeOfReadyFiles() should return 0",
                                0,
                                testQueue.sizeOfReadyFiles());
                                
            testQueue.addFile(mountainTestFile);                 
            
            jqUnit.assertEquals("added Mountain, size 400000, getReadyFiles() should contain 1 files",
                                1,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("and sizeOfReadyFiles() should now return 400000",
                                400000,
                                testQueue.sizeOfReadyFiles());

            testQueue.addFile(oceanTestFile);                 
            
            jqUnit.assertEquals("added Ocean, size 950000000, getReadyFiles() should contain 2 files",
                                2,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("and sizeOfReadyFiles() should now return 950400000",
                                950400000,
                                testQueue.sizeOfReadyFiles());
                                                         
            testQueue.removeFile(mountainTestFile);                            
            
            jqUnit.assertEquals("removed Mountain, size 400000, getReadyFiles() should contain 1 files",
                                1,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("and sizeOfReadyFiles() should now return 950000000",
                                950000000,
                                testQueue.sizeOfReadyFiles());

            testQueue.removeFile(oceanTestFile);                            
            
            jqUnit.assertEquals("removed Ocean, size 950000000, getReadyFiles() should contain 1 files",
                                0,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("removed Ocean, size 950000000, totalBytes should now be 0",
                                0,
                                testQueue.sizeOfReadyFiles());
           
        });
        
        fileQueueViewTests.test("fileQueue: getUploadedFiles() and sizeOfUploadedFiles()", function () {
            expect(24);
            
            var testQueue = fluid.fileQueue();
            jqUnit.assertEquals("getReadyFiles() should contain 0 files at the start",
                                0,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("----- sizeOfReadyFiles() should return 0",
                                0,
                                testQueue.sizeOfReadyFiles());
            jqUnit.assertEquals("----- and getUploadedFiles() should contain 0 files at the start",
                                0,
                                testQueue.getUploadedFiles().length);
            jqUnit.assertEquals("----- and getUploadedFiles() should contain 0 files at the start",
                                0,
                                testQueue.sizeOfUploadedFiles());
                                
            testQueue.addFile(mountainTestFile);
            testQueue.addFile(oceanTestFile);
            
            jqUnit.assertEquals("added Mountain and Ocean, with status QUEUED, getReadyFiles() should contain 2 files",
                                2,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("----- and sizeOfReadyFiles() should now return 950400000",
                                950400000,
                                testQueue.sizeOfReadyFiles());
            jqUnit.assertEquals("----- getUploadedFiles() should contain 0 files at the start",
                                0,
                                testQueue.getUploadedFiles().length);
            jqUnit.assertEquals("----- and sizeOfUploadedFiles() should contain 0",
                                0,
                                testQueue.sizeOfUploadedFiles());
            
            testQueue.files[0].filestatus = fluid.uploader.fileStatusConstants.CANCELLED;
            
            jqUnit.assertEquals("changed status of Mountain to CANCELLED, getReadyFiles() should contain 2 files",
                                2,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("----- and sizeOfReadyFiles() should now return 950400000",
                                950400000,
                                testQueue.sizeOfReadyFiles());
            jqUnit.assertEquals("----- and getUploadedFiles() should contain 0 file",
                                0,
                                testQueue.getUploadedFiles().length);
            jqUnit.assertEquals("----- and sizeOfUploadedFiles() should contain 0",
                                0,
                                testQueue.sizeOfUploadedFiles());

            testQueue.files[0].filestatus = fluid.uploader.fileStatusConstants.COMPLETE;

            jqUnit.assertEquals("changed status of Mountain to COMPLETE, getReadyFiles() should contain 1 files",
                                1,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("----- and sizeOfReadyFiles() should now return 950000000",
                                950000000,
                                testQueue.sizeOfReadyFiles());
            jqUnit.assertEquals("----- and getUploadedFiles() should contain 1 file",
                                1,
                                testQueue.getUploadedFiles().length);
            jqUnit.assertEquals("----- and sizeOfUploadedFiles() should contain 400000",
                                400000,
                                testQueue.sizeOfUploadedFiles());
                                                         
            testQueue.files[1].filestatus = fluid.uploader.fileStatusConstants.CANCELLED;
            
            jqUnit.assertEquals("changed status of Ocean to CANCELLED, getReadyFiles() should contain 1 files",
                                1,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("----- and sizeOfReadyFiles() should now return 950000000",
                                950000000,
                                testQueue.sizeOfReadyFiles());
            jqUnit.assertEquals("----- and getUploadedFiles() should contain 1 files",
                                1,
                                testQueue.getUploadedFiles().length);
            jqUnit.assertEquals("----- and sizeOfUploadedFiles() should contain 400000",
                                400000,
                                testQueue.sizeOfUploadedFiles());

            testQueue.files[1].filestatus = fluid.uploader.fileStatusConstants.COMPLETE;
            
            jqUnit.assertEquals("changed status of Ocean to COMPLETE, getReadyFiles() should contain 0 files",
                                0,
                                testQueue.getReadyFiles().length);
            jqUnit.assertEquals("----- and sizeOfReadyFiles() should now return 0",
                                0,
                                testQueue.sizeOfReadyFiles());
            jqUnit.assertEquals("----- and getUploadedFiles() should contain 2 files",
                                2,
                                testQueue.getUploadedFiles().length);
            jqUnit.assertEquals("----- and sizeOfUploadedFiles() should contain 950400000",
                                950400000,
                                testQueue.sizeOfUploadedFiles());
           
        });

        fileQueueViewTests.test("fileQueue: setupCurrentBatch(), clearCurrentBatch() and updateCurrentBatch()", function () {
            expect(10);
            
            var testQueue = fluid.fileQueue();
            loadQueue(fileSet, testQueue);
            
            jqUnit.assertEquals("load queue, getReadyFiles() should contain 5 files at the start",
                                5,
                                testQueue.getReadyFiles().length);
                                
            jqUnit.assertNull("----- currentBatch should be null",
                                testQueue.currentBatch);
                                
            testQueue.setupCurrentBatch();
                                
            jqUnit.assertEquals("all files QUEUED, setupCurrentBatch(), currentBatch should contain 5 files",
                                5,
                                testQueue.currentBatch.files.length);
            
            jqUnit.assertEquals("----- currentBatch.totalBytes should contain 3000000",
                                3000000,
                                testQueue.currentBatch.totalBytes);

            testQueue.clearCurrentBatch();
                                
            jqUnit.assertNotNull("clearCurrentBatch(), currentBatch should NOT be null",
                                testQueue.currentBatch);
                                
            jqUnit.assertEquals("----- currentBatch should contain 0 files",
                                0,
                                testQueue.currentBatch.files.length);
            
            jqUnit.assertEquals("----- currentBatch.totalBytes should contain 0",
                                0,
                                testQueue.currentBatch.totalBytes);
            
            testQueue.files[0].filestatus = fluid.uploader.fileStatusConstants.COMPLETE;
            testQueue.updateCurrentBatch();
            
            jqUnit.assertEquals("first file COMPLETE, setupCurrentBatch(), currentBatch should contain 4 files",
                                4,
                                testQueue.currentBatch.files.length);
                                
            testQueue.files[1].filestatus = fluid.uploader.fileStatusConstants.COMPLETE;
            testQueue.setupCurrentBatch();
            
            jqUnit.assertEquals("second file COMPLETE, updateCurrentBatch(), currentBatch should contain 3 files",
                                3,
                                testQueue.currentBatch.files.length);
                                
            jqUnit.assertEquals("----- currentBatch.totalBytes should contain 2400000",
                                2400000,
                                testQueue.currentBatch.totalBytes);
        });        
   });
    
})(jQuery);
