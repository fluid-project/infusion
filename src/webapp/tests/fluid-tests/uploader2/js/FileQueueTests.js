/*global jQuery, fluid*/

(function ($) {
    $(function () {
        
        var mountainTestFile = {
             id : 0, // SWFUpload file id, used for starting or cancelling and upload 
             index : 0, // The index of this file for use in getFile(i) 
             name : "Mountain.jpg", // The file name. The path is not included. 
             size : 400000, // The file size in bytes   
             filestatus: fluid.fileQueue.fileStatusConstants.QUEUED // initial file queued status
        };
        
        var oceanTestFile = {
             id : 230948230984, // SWFUpload file id, used for starting or cancelling and upload 
             index : 1, // The index of this file for use in getFile(i) 
             name : "Ocean.jpg", // The file name. The path is not included. 
             size : 950000000, // The file size in bytes   
             filestatus: fluid.fileQueue.fileStatusConstants.QUEUED // initial file queued status
        };
        
        var fileQueueViewTests = new jqUnit.TestCase("FileQueue Tests");
        
        fileQueueViewTests.test("Initialize fileQueue: everything is empty", function () {
            jqUnit.expect(2);
            
            var testQueue = fluid.fileQueue();
        
            jqUnit.assertEquals("fileQueue queue is empty at the start",
                                0,
                                testQueue.totalBytes());
            jqUnit.assertEquals("fileQueue queue.files is an empty array",0,testQueue.files.length);
            
        });
 
        fileQueueViewTests.test("addFiles and removing files", function () {
            jqUnit.expect(5);
            
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
            jqUnit.expect(10);
            
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
            jqUnit.expect(16);
            
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
            
            var curFiles = testQueue.files;
                        
            curFiles[0].filestatus = fluid.fileQueue.fileStatusConstants.COMPLETE;
            
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
                                                         
            curFiles[1].filestatus = fluid.fileQueue.fileStatusConstants.COMPLETE;
            
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


   });
    
})(jQuery);
