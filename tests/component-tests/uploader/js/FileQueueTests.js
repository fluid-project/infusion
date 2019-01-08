/*
Copyright 2007-2019 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(function () {

        /****************************
         * File Objects for testing *
         ****************************/

        var mountainTestFile = {
            id : 0, // used for starting or cancelling and upload
            index : 0, // The index of this file for use in getFile(i)
            name : "Mountain.jpg", // The file name. The path is not included.
            size : 400000, // The file size in bytes
            filestatus: fluid.uploader.fileStatusConstants.QUEUED // initial file queued status
        };

        var oceanTestFile = {
            id : 230948230984, // used for starting or cancelling and upload
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
        };

        var loadQueue = function (fileArray, queue) {
            for (var i = 0; i < fileArray.length; i++) {
                queue.addFile(fileArray[i]);
                queue.files[i].filestatus = fluid.uploader.fileStatusConstants.QUEUED;
            }
        };


        /*************************
         * File Queue Unit tests *
         *************************/

        jqUnit.module("FileQueue Tests");

        jqUnit.test("sizeOfFiles", function () {
            jqUnit.expect(3);

            var arrayOfFilesWithoutFilesize = [{id: 1}, {id: 2}, {id: 3}];

            jqUnit.assertEquals("size of fileSet should be 3000000",
                                3000000,
                                fluid.uploader.fileQueue.sizeOfFiles(fileSet));

            jqUnit.assertEquals("size of empty array should be 0",
                                0,
                                fluid.uploader.fileQueue.sizeOfFiles([]));

            //The following should returns a NaN instead of 0.
            var expected_NaN = fluid.uploader.fileQueue.sizeOfFiles(arrayOfFilesWithoutFilesize);
            jqUnit.assertFalse("size of fileset array without fileSize should be NaN",
                                expected_NaN === 0 || expected_NaN);
        });

        jqUnit.test("Initialize fileQueue: everything is empty", function () {
            jqUnit.expect(2);

            var q = setupQueue();

            jqUnit.assertEquals("fileQueue queue is empty at the start",
                                0,
                                q.totalBytes());
            jqUnit.assertEquals("fileQueue queue.files is an empty array", 0, q.files.length);

        });

        jqUnit.test("filterFiles ", function () {
            jqUnit.expect(8);

            var testQueue = fluid.uploader.fileQueue();
            loadQueue(fileSet, testQueue);

            //manually adjust the status of the files
            testQueue.files[0].filestatus = fluid.uploader.fileStatusConstants.ERROR;
            testQueue.files[1].filestatus = fluid.uploader.fileStatusConstants.QUEUED;
            testQueue.files[2].filestatus = fluid.uploader.fileStatusConstants.CANCELLED;
            testQueue.files[3].filestatus = fluid.uploader.fileStatusConstants.QUEUED;
            testQueue.files[4].filestatus = fluid.uploader.fileStatusConstants.COMPLETE;

            var completedFiles = testQueue.getUploadedFiles();
            var queuedFiles = testQueue.getReadyFiles();
            var errorFiles = testQueue.getErroredFiles();

            //completed
            jqUnit.assertEquals("filterFiles: COMPLETE have filesize 1",
                                1,
                                completedFiles.length);
            jqUnit.assertEquals("filterFiles: COMPLETE should give file id 4",
                                4,
                                completedFiles[0].id);

            //queued + cancelled
            jqUnit.assertEquals("filterFiles: QUEUED or CANCELLED have filesize 3",
                                3,
                                queuedFiles.length);
            jqUnit.assertEquals("filterFiles: QUEUED should give file id 1",
                                1,
                                queuedFiles[0].id);
            jqUnit.assertEquals("filterFiles: CANCELLED should give file id 2",
                                2,
                                queuedFiles[1].id);
            jqUnit.assertEquals("filterFiles: QUEUED should give file id 3",
                                3,
                                queuedFiles[2].id);

            //errored
            jqUnit.assertEquals("filterFiles: COMPLETE have filesize 1",
                                1,
                                errorFiles.length);
            jqUnit.assertEquals("filterFiles: COMPLETE should give file id 0",
                                0,
                                errorFiles[0].id);
        });

        jqUnit.test("Test file info methods", function () {
            jqUnit.expect(6);
            var testQueue = fluid.uploader.fileQueue();
            /**
             * Generate an array with the given parameters defined below.
             *
             * @param {Integer} mode - 0: default, generate an array with the given file_size
             *                         1: decrement, generate an array with initial file_size = array_size,
             *                            and subtract 1 each element afterwards.
             *                            ie. 50, 49, 48,...,3, 2, 1
             *                         2: increment, generate an array with the initial file_size = 0, up to
             *                            the array_size.
             * @param {Integer} array_size - The length of the array. Array index starts at 0.
             * @param {Integer} file_size - The file size in each array element.
             * @return {Array} - The generated array.
             */
            var array_generator = function (mode, array_size, file_size) {
                var generated_array = [];
                if (mode === 1) {
                    file_size = array_size;
                } else if (mode === 2) {
                    file_size = 1;
                }
                //create each file object
                for (var i = 0; i < array_size; i++) {
                    generated_array.push({size: file_size});
                    if (mode === 1) {
                        file_size--;
                    } else if (mode === 2) {
                        file_size++;
                    }
                }
                return generated_array;
            };


            var filesize_1 = array_generator(0, 1, 10000);
            var filesize_2 = [{size: 10000}, {size: 1000}, {size: 100}, {size: 10}, {size: 1}];
            var filesize_3 = array_generator(0, 30000, 1);
            var filesize_4 = array_generator(1, 10);
            var filesize_5 = array_generator(1, 10000);  //(10000 + 1) * 10000 /2 = 50005000
            var filesize_6 = array_generator(2, 10000);  //(10000 + 1) * 10000 /2 = 50005000

            var test_filesize = function (files, expected) {
                fluid.model.copyModel(testQueue.files, files);
                jqUnit.assertEquals("testQueue uploaded files byte",
                    expected, testQueue.totalBytes());
            };

            test_filesize(filesize_1, 10000);
            test_filesize(filesize_2, 11111);
            test_filesize(filesize_3, 30000);
            test_filesize(filesize_4, 55);
            test_filesize(filesize_5, 50005000);
            test_filesize(filesize_6, 50005000);
        });

        jqUnit.test("Test fileQueue operations", function () {
            jqUnit.expect(8);
            var testQueue = fluid.uploader.fileQueue();
            loadQueue(fileSet, testQueue);

            testQueue.start();
            jqUnit.assertTrue("testQueue should set isUploading to TRUE",
                                testQueue.isUploading);
            jqUnit.assertFalse("testQueue should set shouldStop to FALSE",
                                testQueue.shouldStop);

            testQueue.startFile();
            jqUnit.assertEquals("testQueue uploaded files byte should be 0",
                                0,
                                testQueue.currentBatch.bytesUploadedForFile);
            jqUnit.assertEquals("testQueue previous uploaded files byte should be 0",
                                0,
                                testQueue.currentBatch.previousBytesUploadedForFile);
            jqUnit.assertEquals("testQueue file index should be 1",
                                1,
                                testQueue.currentBatch.fileIdx);
            jqUnit.assertEquals("testQueue number of files finished should be 0",
                                0,
                                testQueue.currentBatch.numFilesCompleted);

            testQueue.finishFile();
            jqUnit.assertEquals("testQueue number of files finished should now be 1",
                                1,
                                testQueue.currentBatch.numFilesCompleted);
            jqUnit.assertTrue("testQueue shouldUploadNextFile() should return True since it just finished a file",
                                testQueue.shouldUploadNextFile());
        });

        jqUnit.test("Test file manipulation methods", function () {
            jqUnit.expect(5);
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

        jqUnit.test("fileQueue: getReadyFiles() and sizeOfReadyFiles()", function () {
            jqUnit.expect(10);

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

        jqUnit.test("fileQueue: getUploadedFiles() and sizeOfUploadedFiles()", function () {
            jqUnit.expect(24);

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

        jqUnit.test("fileQueue: setupCurrentBatch(), clearCurrentBatch() and updateCurrentBatch()", function () {
            jqUnit.expect(14);

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

        jqUnit.test("fileQueue: updateBatchStatus()", function () {
            jqUnit.expect(93);
            var checkCurrentBatch = function (q, expected) {
                jqUnit.assertEquals("totalBytesUploaded is ",
                                    expected,
                                    q.currentBatch.totalBytesUploaded);

                jqUnit.assertEquals("bytesUploadedForFile is ",
                                    expected,
                                    q.currentBatch.bytesUploadedForFile);
                jqUnit.assertEquals("previousBytesUploadedForFile is ",
                                    expected,
                                    q.currentBatch.previousBytesUploadedForFile);
            };

            var q = setupQueue();
            loadQueue(fileSet, q);
            q.setupCurrentBatch();
            checkCurrentBatch(q, 0);    //before initialization
            var progress = 0;  //mimic 0 byte
            for (var i = 1; i <= 30; i++) {
                progress = progress + Math.floor(Math.random() * 110);
                q.updateBatchStatus(progress);
                checkCurrentBatch(q, progress);
            }
        });
    });

})(jQuery);
