/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2008-2009 University of Cambridge
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit, expect*/

(function ($) {
    $(function () {
        
        var removedFile = null;
        var mockEvents = {
            onFileRemoved: {
                fire: function (file) {
                    removedFile = file;
                }
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
        
        var checkARIA = function (file, row) {
            jqUnit.assertEquals("The added row should have an aria-label attribute on it containing descriptive text about the file.",
                                file.name + " " + fluid.uploader.formatFileSize(file.size), row.attr("aria-label"));
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
            checkARIA(file, row);
        };
      
        var createFileQueue = function (qEl) {            
            var q = fluid.uploader.fileQueueView(qEl, mockEvents, {
                model: fluid.uploader.fileQueue().files,
                uploaderContainer: $("#main")
            });
            return q;
        };
        
        // File Queue test case
        var setupFunction = function () {
            qEl = $("#main .flc-uploader-queue");
            jqUnit.subvertAnimations();
        };
        
        var fileQueueViewTests = new jqUnit.TestCase("FileQueueView Tests", setupFunction);
        
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
        
        fileQueueViewTests.test("Prepare for upload/ Refresh for upload", function () {
            expect(2);

            var q = createFileQueue(qEl);
            q.addFile(mountainTestFile);
            q.addFile(oceanTestFile);

            var rowButtons = q.locate("fileIconBtn", q.locate("fileRows"));
            q.prepareForUpload();
            jqUnit.assertTrue("Button should be disabled. ",
                                rowButtons.attr("disabled"));

            //assume upload is done. call refreshAfterUpload
            q.refreshAfterUpload();
            jqUnit.assertFalse("Button should be disabled. ",
                                rowButtons.attr("disabled"));
        });

        fileQueueViewTests.test("File Progress Percentage test", function () {
            expect(7);

            var q = createFileQueue(qEl);
            q.addFile(mountainTestFile);

            q.updateFileProgress(mountainTestFile, "33999.99", mountainTestFile.size); //33999.99/400000 = 8.4999975% ~ 8%            
            jqUnit.assertEquals("Test float rounding down. ",
                                8,
                                q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, "34000.01", mountainTestFile.size); //34000.01/400000 = 8.5000025% ~ 9%            
            jqUnit.assertEquals("Test float rounding up. ",
                                9,
                                q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, "0", mountainTestFile.size); 
            jqUnit.assertEquals("Test zero. ",
                                0,
                                q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, 400000, mountainTestFile.size); 
            jqUnit.assertEquals("Test 100%. ",
                                100,
                                q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, 37600, mountainTestFile.size); //37600/400000 = 9.4% ~9%
            jqUnit.assertEquals("Test integer rounding down, with 1 significant digit ",
                                9,
                                q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, 37960, mountainTestFile.size); //37960/400000 = 9.49% ~9%
            jqUnit.assertEquals("Test integer rounding down, with 2 significant digits. ",
                                9,
                                q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, 38000, mountainTestFile.size); //38000/400000 = 9.5% ~10%
            jqUnit.assertEquals("Test integer rounding up. ",
                                10,
                                q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
        });

        fileQueueViewTests.test("Mark file complete test", function () {
            expect(2);

            var q = createFileQueue(qEl);
            q.addFile(mountainTestFile);
            q.markFileComplete(mountainTestFile);

            jqUnit.assertEquals("Progress should be 100. ",
                                100,
                                q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);

            jqUnit.assertTrue("Row state should be changed when row is marked as completed. ",
                                q.locate("fileQueue").find("#" + mountainTestFile.id).hasClass(q.options.styles.uploaded));
        });

        fileQueueViewTests.test("Show error for files", function () {
            expect(2);

            var q = createFileQueue(qEl);
            mountainTestFile.filestatus = fluid.uploader.fileStatusConstants.ERROR; //manually add an error to the file
            q.addFile(mountainTestFile);
            q.showErrorForFile(mountainTestFile, -250); //fire a UPLOAD_FAILED error

            jqUnit.assertEquals("Error message should print upload failed ",
                                q.options.strings.errors.UPLOAD_FAILED,
                                q.locate("errorText").text());

            jqUnit.assertTrue("Row state should be changed when we have an error. ",
                                q.locate("fileQueue").find("#" + mountainTestFile.id).hasClass(q.options.styles.error));
        });

        fileQueueViewTests.test("Hide file progress", function () {
            expect(1);

            var q = createFileQueue(qEl);
            mountainTestFile.filestatus = fluid.uploader.fileStatusConstants.COMPLETE; //manually set filestatus to complete
            q.addFile(mountainTestFile);
            q.hideFileProgress(mountainTestFile); 
            jqUnit.assertFalse("the dim class should be removed on hidden. ",
                                q.locate("fileIconBtn", q.locate("fileQueue").find("#" + mountainTestFile.id)).hasClass(q.options.styles.dim));
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
        
        
        /********************
         * Scrollable tests *
         ********************/
        
        fileQueueViewTests.test("fluid.scrollableTable", function () {
            var table = $("#scrollableTable");

            var scroller = fluid.scrollableTable(table);

            jqUnit.assertTrue("The table's parent element is a div", table.parent().is("div"));
            jqUnit.assertTrue("The table's parent element has the fl-scrollable-inner class",
                              table.parent().hasClass("fl-scrollable-inner"));
            jqUnit.assertTrue("The table's grandparent element has the fl-scrollable-scroller class",
                              table.parent().parent().hasClass("fl-scrollable-scroller"));
        });
    });
    
    
})(jQuery);
