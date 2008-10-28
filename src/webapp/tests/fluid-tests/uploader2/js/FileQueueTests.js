/*global jQuery, fluid*/

(function ($) {
    $(function () {
        
        var mountainTestFile = {
             id : 0, // SWFUpload file id, used for starting or cancelling and upload 
             index : 0, // The index of this file for use in getFile(i) 
             name : "Mountain.jpg", // The file name. The path is not included. 
             size : 400000 // The file size in bytes     
        };
        
        var oceanTestFile = {
             id : 230948230984, // SWFUpload file id, used for starting or cancelling and upload 
             index : 1, // The index of this file for use in getFile(i) 
             name : "Ocean.jpg", // The file name. The path is not included. 
             size : 950000000 // The file size in bytes        
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

   });
    
})(jQuery);
