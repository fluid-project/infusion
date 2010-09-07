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
            removeFile: function(file){
                removedFile = file;
            }
        };
        
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
        
        var qEl;
        
        // Useful locate functions.
        var locateRows = function (q) {
            return qEl.find(q.options.selectors.fileRows);   
        };
        
        var nameForRow = function (q, rowEl) {
            return rowEl.find(q.options.selectors.fileName).text();
        };
        
        var sizeForRow = function (q, rowEl) {
            return rowEl.find(q.options.selectors.fileSize).text();
        };
        
        // Reusable test functions
        var checkFileRow = function (q, file, row) {
            jqUnit.assertEquals("The added row should have the correct id attribute.",
                                file.id, row.attr("id"));
            jqUnit.assertEquals("The added row should have the correct filename.",
                                file.name, nameForRow(q, row));
            jqUnit.assertEquals("The added row should have the correct size.",
                                fluid.uploader.formatFileSize(file.size), 
                                sizeForRow(q, row));    
        };
      
        var createFileQueue = function (qEl) {
            var q = fluid.fileQueueView(qEl, $("#main"), mockUploadManager);
            
            return q;
        };
        
        // File Queue test case
        var setupFunction = function () {
            qEl = $("#main .flc-uploader-queue");
            jqUnit.subvertAnimations();
        };
        
        var fileQueueViewTests = new jqUnit.TestCase("FileQueueView Tests", setupFunction);

        fileQueueViewTests.test("Scrollability", function () {
            var q = createFileQueue(qEl);
            
            jqUnit.assertNotNull("The queue should have a scroller attached to it.", q.scroller);
            jqUnit.assertNotUndefined("The queue should have a scroller attached to it.", q.scroller);
            jqUnit.assertEquals("The queue's container should be scrollable", 
                                $(".flc-uploader-queue")[0], 
                                q.scroller.container[0]);
            jqUnit.assertEquals("The queue's scroller should have a scroller wrapper.", 
                                $(".flc-scroller")[0], 
                                q.scroller.scrollingElm[0]);
        });
        
        fileQueueViewTests.test("Add file", function () {
            var q = createFileQueue(qEl);
            
            // Add one file.
            q.addFile(mountainTestFile);
            
            var addedRows = locateRows(q);
            jqUnit.assertEquals("There should be one file row in the queue after adding a file.",
                                1, addedRows.length);
            checkFileRow(q, mountainTestFile, addedRows.eq(0));
                                
            // And add another.
            q.addFile(oceanTestFile);                                    
            addedRows = locateRows(q);
            jqUnit.assertEquals("There should be two file rows in the queue.",
                                2, addedRows.length);
            checkFileRow(q, oceanTestFile, addedRows.eq(1));
        });
        
        fileQueueViewTests.test("Remove file", function () {
            var q = createFileQueue(qEl);
            
            // Add a file, then remove it.
            q.addFile(mountainTestFile);
            jqUnit.assertEquals("There should be one row in the queue before removing it.",
                                1, locateRows(q).length);         
            q.removeFile(mountainTestFile);
            
            // Ensure that it has been correctly removed.
            var rows = locateRows(q);
            jqUnit.assertEquals("There should be no rows in the queue after removing the only file.",
                                0, rows.length);
            
            // Add the file back and try removing a file that was never there.
            q.addFile(mountainTestFile);
            q.removeFile(oceanTestFile);
            jqUnit.assertEquals("There should still be one row in the queue after removing a nonexistent file.",
                                1, locateRows(q).length);
            checkFileRow(q, mountainTestFile, locateRows(q).eq(0));
            jqUnit.assertEquals("The file queue model should have been correctly modified.",
                         oceanTestFile, removedFile);
            
            // Add another file and remove both.
            q.addFile(oceanTestFile);
            jqUnit.assertEquals("Two files should be in the queue before removing the first file.",
                                2, locateRows(q).length);
            q.removeFile(mountainTestFile);            
            jqUnit.assertEquals("There should still be one row in the queue after removing the first file.",
                                1, locateRows(q).length);
            jqUnit.assertEquals("The file queue model should have been correctly modified.",
                         mountainTestFile, removedFile);
            checkFileRow(q, oceanTestFile, locateRows(q).eq(0));
            
            q.removeFile(oceanTestFile);
            jqUnit.assertEquals("There should be no rows in the queue after removing the last file.",
                                0, locateRows(q).length);
            jqUnit.assertEquals("The file queue model should have been correctly modified.",
                         oceanTestFile, removedFile);
        });
        
        fileQueueViewTests.test("Keyboard navigation", function () {
            // Setup the queue.
            var q = createFileQueue(qEl);
            q.addFile(mountainTestFile);
            q.addFile(oceanTestFile);
            
            qEl.focus();
            // Ensure that the first item is focussed.
            jqUnit.assertTrue("The first row should be selected.",
                                locateRows(q).eq(0).hasClass(q.options.styles.selected));
                                
            // And that the second item is also selectable.
            fluid.selectable.selectNext(q.container);
            jqUnit.assertTrue("The second row should now be selected.",
                                locateRows(q).eq(1).hasClass(q.options.styles.selected));
            jqUnit.assertFalse("The first row should no longer be selected.",
                                locateRows(q).eq(0).hasClass(q.options.styles.selected));
        });
    });
    
})(jQuery);
