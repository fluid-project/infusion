/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global jqUnit */

(function ($) {
    "use strict";

    $(function () {

        var removedFile = null;

        fluid.defaults("fluid.tests.uploader.multiFileUploader", {
            gradeNames: ["fluid.component"],
            components: {
                fileQueueView: {
                    type: "fluid.uploader.fileQueueView",
                    container: "#qunit-fixture .flc-uploader-queue",
                    options: {
                        model: fluid.uploader.fileQueue().files,
                        uploaderContainer: "#qunit-fixture",
                        events: {
                            onFileRemoved: "{multiFileUploader}.events.onFileRemoved"
                        }
                    }
                }
            },
            events: {
                onFileRemoved: null
            },
            listeners: {
                onFileRemoved: function (file) {
                    removedFile = file;
                }
            }
        });

        var mountainTestFile = {
            id : 0, // used for starting or cancelling and upload
            index : 0, // The index of this file for use in getFile(i)
            name : "Mountain.jpg", // The file name. The path is not included.
            size : 400000 // The file size in bytes
        };

        var oceanTestFile = {
            id : 230948230984, // used for starting or cancelling and upload
            index : 1, // The index of this file for use in getFile(i)
            name : "Ocean.jpg", // The file name. The path is not included.
            size : 950000000 // The file size in bytes
        };

        // Useful locate functions.
        var locateRows = function (q) {
            return $("#qunit-fixture .flc-uploader-queue").find(q.options.selectors.fileRows);
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
            jqUnit.assertEquals("The added row should have the correct id attribute.", file.id, parseInt(row.prop("id"), 10));
            jqUnit.assertEquals("The added row should have the correct filename.", file.name, nameForRow(q, row));
            jqUnit.assertEquals("The added row should have the correct size.", fluid.uploader.formatFileSize(file.size), sizeForRow(q, row));

            var fileIconBtn = row.find(q.options.selectors.fileIconBtn);
            jqUnit.assertTrue("The added row should have the correct class on the file action button.", fileIconBtn.hasClass(q.options.styles.remove));
            jqUnit.assertEquals("The added row should have the correct aria label for the file action button.", q.options.strings.buttons.remove, fileIconBtn.attr("aria-label"));

            checkARIA(file, row);
        };

        var createFileQueue = function () {
            var uploader = fluid.tests.uploader.multiFileUploader();
            return uploader.fileQueueView;
        };

        // File Queue test case
        var setupFunction = function () {
            jqUnit.subvertAnimations();
        };

        jqUnit.module("FileQueueView Tests", {setup: setupFunction});

        jqUnit.test("Initialization", function () {
            jqUnit.expect(2);
            var q = createFileQueue();

            jqUnit.assertNotUndefined("The fileQueueView is initialized", q);
            jqUnit.assertEquals("The application role is added", "application", q.container.attr("role"));
        });

        jqUnit.test("Add file", function () {
            var q = createFileQueue();

            // Add one file.
            q.addFile(mountainTestFile);

            var addedRows = locateRows(q);
            jqUnit.assertEquals("There should be one file row in the queue after adding a file.", 1, addedRows.length);
            checkFileRow(q, mountainTestFile, addedRows.eq(0));

            // And add another.
            q.addFile(oceanTestFile);
            addedRows = locateRows(q);
            jqUnit.assertEquals("There should be two file rows in the queue.", 2, addedRows.length);
            checkFileRow(q, oceanTestFile, addedRows.eq(1));
        });

        jqUnit.test("Remove file", function () {
            var q = createFileQueue();

            // Add a file, then remove it.
            q.addFile(mountainTestFile);
            jqUnit.assertEquals("There should be one row in the queue before removing it.", 1, locateRows(q).length);
            q.removeFile(mountainTestFile);

            // Ensure that it has been correctly removed.
            var rows = locateRows(q);
            jqUnit.assertEquals("There should be no rows in the queue after removing the only file.", 0, rows.length);

            // Add the file back and try removing a file that was never there.
            q.addFile(mountainTestFile);
            q.removeFile(oceanTestFile);
            jqUnit.assertEquals("There should still be one row in the queue after removing a nonexistent file.",
                1, locateRows(q).length);
            checkFileRow(q, mountainTestFile, locateRows(q).eq(0));
            jqUnit.assertEquals("The file queue model should have been correctly modified.", oceanTestFile, removedFile);

            // Add another file and remove both.
            q.addFile(oceanTestFile);
            jqUnit.assertEquals("Two files should be in the queue before removing the first file.", 2, locateRows(q).length);
            q.removeFile(mountainTestFile);
            jqUnit.assertEquals("There should still be one row in the queue after removing the first file.",
                1, locateRows(q).length);
            jqUnit.assertEquals("The file queue model should have been correctly modified.", mountainTestFile, removedFile);
            checkFileRow(q, oceanTestFile, locateRows(q).eq(0));

            q.removeFile(oceanTestFile);
            jqUnit.assertEquals("There should be no rows in the queue after removing the last file.", 0, locateRows(q).length);
            jqUnit.assertEquals("The file queue model should have been correctly modified.", oceanTestFile, removedFile);
        });

        jqUnit.test("Prepare for upload/ Refresh for upload", function () {
            jqUnit.expect(2);

            var q = createFileQueue();
            q.addFile(mountainTestFile);
            q.addFile(oceanTestFile);

            var rowButtons = q.locate("fileIconBtn", q.locate("fileRows"));
            q.prepareForUpload();
            jqUnit.assertTrue("Button should be disabled. ", rowButtons.prop("disabled"));

            // Simulates the workflow where an upload is started but then stopped
            // before any files have completed uploading.
            // prepareForUpload -> "upload interrupted" -> refreshAfterUpload
            q.refreshAfterUpload();
            jqUnit.assertFalse("Button should be enabled.", rowButtons.prop("disabled"));
        });

        jqUnit.test("File Progress Percentage test", function () {
            jqUnit.expect(7);

            var q = createFileQueue();
            q.addFile(mountainTestFile);

            q.updateFileProgress(mountainTestFile, "33999.99", mountainTestFile.size); //33999.99/400000 = 8.4999975% ~ 8%
            jqUnit.assertEquals("Test float rounding down. ", 8, q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, "34000.01", mountainTestFile.size); //34000.01/400000 = 8.5000025% ~ 9%
            jqUnit.assertEquals("Test float rounding up. ", 9, q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, "0", mountainTestFile.size);
            jqUnit.assertEquals("Test zero. ", 0, q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, 400000, mountainTestFile.size);
            jqUnit.assertEquals("Test 100%. ", 100, q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, 37600, mountainTestFile.size); //37600/400000 = 9.4% ~9%
            jqUnit.assertEquals("Test integer rounding down, with 1 significant digit ",
                9, q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, 37960, mountainTestFile.size); //37960/400000 = 9.49% ~9%
            jqUnit.assertEquals("Test integer rounding down, with 2 significant digits. ",
                9, q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
            q.updateFileProgress(mountainTestFile, 38000, mountainTestFile.size); //38000/400000 = 9.5% ~10%
            jqUnit.assertEquals("Test integer rounding up. ", 10, q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);
        });

        jqUnit.test("Mark file complete test", function () {
            jqUnit.expect(4);

            var q = createFileQueue();
            q.addFile(mountainTestFile);
            q.prepareForUpload(mountainTestFile);
            q.markFileComplete(mountainTestFile);

            var row = q.container.find("#" + mountainTestFile.id);
            var rowButton = row.find("button");

            jqUnit.assertEquals("Progress should be 100. ", 100, q.fileProgressors[mountainTestFile.id + "_progress"].storedPercent);

            jqUnit.assertTrue("Row state should be changed when row is marked as completed. ", row.hasClass(q.options.styles.uploaded));
            jqUnit.assertTrue("Remove file button should be disabled", rowButton.prop("disabled"));

            //assume upload is done. call refreshAfterUpload
            // Simulates the workflow where an upload is started and completed
            // prepareForUpload -> markFileComplete -> refreshAfterUpload
            q.refreshAfterUpload();
            jqUnit.assertTrue("Remove file button should still be disabled after upload finished. ", rowButton.prop("disabled"));
        });

        jqUnit.test("Show error for files", function () {
            jqUnit.expect(2);

            var q = createFileQueue();
            mountainTestFile.filestatus = fluid.uploader.fileStatusConstants.ERROR; //manually add an error to the file
            q.addFile(mountainTestFile);
            q.showErrorForFile(mountainTestFile, fluid.uploader.errorConstants.UPLOAD_FAILED); //fire a UPLOAD_FAILED error

            jqUnit.assertEquals("Error message should print upload failed ",
                q.options.strings.errors.UPLOAD_FAILED, q.locate("errorText").text());

            jqUnit.assertTrue("Row state should be changed when we have an error. ",
                q.container.find("#" + mountainTestFile.id).hasClass(q.options.styles.error));
        });

        jqUnit.test("Hide file progress", function () {
            jqUnit.expect(1);

            var q = createFileQueue();
            mountainTestFile.filestatus = fluid.uploader.fileStatusConstants.COMPLETE; //manually set filestatus to complete
            q.addFile(mountainTestFile);
            q.hideFileProgress(mountainTestFile);
            jqUnit.assertFalse("the dim class should be removed on hidden. ",
                q.locate("fileIconBtn", q.container.find("#" + mountainTestFile.id)).hasClass(q.options.styles.dim));
        });

        jqUnit.test("Keyboard navigation", function () {
            // Setup the queue.
            var q = createFileQueue();
            q.addFile(mountainTestFile);
            q.addFile(oceanTestFile);

            fluid.focus($("#qunit-fixture .flc-uploader-queue"));
            // Ensure that the first item is focussed.
            jqUnit.assertTrue("The first row should be selected.", locateRows(q).eq(0).hasClass(q.options.styles.selected));

            // And that the second item is also selectable.
            fluid.selectable.selectNext(q.container);
            jqUnit.assertTrue("The second row should now be selected.", locateRows(q).eq(1).hasClass(q.options.styles.selected));
            jqUnit.assertFalse("The first row should no longer be selected.", locateRows(q).eq(0).hasClass(q.options.styles.selected));
        });

        /********************
         * Scrollable tests *
         ********************/
        jqUnit.test("fluid.scrollableTable", function () {
            var table = $("#scrollableTable");
            fluid.scrollableTable(table);

            jqUnit.assertTrue("The table's parent element is a div", table.parent().is("div"));
            jqUnit.assertTrue("The table's parent element has the fl-scrollable-inner class",
                table.parent().hasClass("fl-scrollable-inner"));
            jqUnit.assertTrue("The table's grandparent element has the fl-scrollable-scroller class",
                table.parent().parent().hasClass("fl-scrollable-scroller"));
        });
    });

})(jQuery);
