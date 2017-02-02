/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010-2011 OCAD University
Copyright 2013 Raising the Floor - US
Copyright 2015 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.uploader");

    fluid.defaults("fluid.uploader.fileQueue", {
        gradeNames: ["fluid.component"],
        members: {
            files: [],
            isUploading: false
        },
        invokers: {
            /********************
             * Queue Operations *
             ********************/
            start: {
                funcName: "fluid.uploader.fileQueue.start",
                args: "{that}"
            },
            startFile: {
                funcName: "fluid.uploader.fileQueue.startFile",
                args: "{that}.currentBatch"
            },
            finishFile: {
                funcName: "fluid.uploader.fileQueue.finishFile",
                args: "{that}.currentBatch"
            },
            shouldUploadNextFile: {
                funcName: "fluid.uploader.fileQueue.shouldUploadNextFile",
                args: "{that}"
            },
            /*****************************
             * File manipulation methods *
             *****************************/
            addFile: {
                funcName: "fluid.uploader.fileQueue.addFile",
                args: ["{that}.files", "{arguments}.0"]
            },
            removeFile: {
                funcName: "fluid.uploader.fileQueue.removeFile",
                args: ["{that}.files", "{arguments}.0"]
            },
            /**********************
             * Queue Info Methods *
             **********************/
            totalBytes: {
                funcName: "fluid.uploader.fileQueue.sizeOfFiles",
                args: "{that}.files"
            },
            getReadyFiles: {
                funcName: "fluid.uploader.fileQueue.filesByStatus",
                args: ["{that}.files", ["QUEUED", "CANCELLED"]]
            },
            getErroredFiles: {
                funcName: "fluid.uploader.fileQueue.filesByStatus",
                args: ["{that}.files", "ERROR"]
            },
            getUploadedFiles: {
                funcName: "fluid.uploader.fileQueue.filesByStatus",
                args: ["{that}.files", "COMPLETE"]
            },
            sizeOfReadyFiles: {
                funcName: "fluid.uploader.fileQueue.sizeOfFilesByStatus",
                args: ["{that}.files", ["QUEUED", "CANCELLED"]]
            },
            sizeOfUploadedFiles: {
                funcName: "fluid.uploader.fileQueue.sizeOfFilesByStatus",
                args: ["{that}.files", "COMPLETE"]
            },
            /*****************
             * Batch Methods *
             *****************/
            setupCurrentBatch:  {
                funcName: "fluid.uploader.fileQueue.setupCurrentBatch",
                args: "{that}"
            },
            clearCurrentBatch:  {
                funcName: "fluid.uploader.fileQueue.clearCurrentBatch",
                args: "{that}"
            },
            updateCurrentBatch:  {
                funcName: "fluid.uploader.fileQueue.updateCurrentBatch",
                args: [{expander: {func: "{that}.getReadyFiles"}}, "{that}.currentBatch"]
            },
            updateBatchStatus:  {
                funcName: "fluid.uploader.fileQueue.updateBatchStatus",
                args: ["{arguments}.0", "{that}.currentBatch"]
            }
        }
    });

    fluid.uploader.fileQueue.start = function (that) {
        that.setupCurrentBatch();
        that.isUploading = true;
        that.shouldStop = false;
    };

    fluid.uploader.fileQueue.startFile = function (currentBatch) {
        currentBatch.fileIdx++;
        currentBatch.bytesUploadedForFile = 0;
        currentBatch.previousBytesUploadedForFile = 0;
    };

    fluid.uploader.fileQueue.finishFile = function (currentBatch) {
        currentBatch.numFilesCompleted++;
    };

    fluid.uploader.fileQueue.shouldUploadNextFile = function (that) {
        return !that.shouldStop &&
            that.isUploading &&
            (that.currentBatch.numFilesCompleted + that.currentBatch.numFilesErrored) <
            that.currentBatch.files.length;
    };

    fluid.uploader.fileQueue.addFile = function (files, file) {
        files.push(file);
    };

    fluid.uploader.fileQueue.removeFile = function (files, file) {
        fluid.remove_if(files, function (thisFile) {
            return file === thisFile;
        });
    };

    fluid.uploader.fileQueue.sizeOfFiles = function (files) {
        return fluid.accumulate(files, function (file, totalBytes) {
            return totalBytes + file.size;
        }, 0);
    };

    fluid.uploader.fileQueue.filterFiles = function (files, filterFn) {
        var filteredFiles = []; // filterFn returns TRUE for the files we want
        return fluid.remove_if(fluid.makeArray(files), filterFn, filteredFiles);
    };

    fluid.uploader.fileQueue.filesByStatus = function (files, statuses) {
        statuses = fluid.makeArray(statuses);
        return fluid.uploader.fileQueue.filterFiles(files, function (file) {
            return fluid.find_if(statuses, function (status) {
                return file.filestatus === fluid.uploader.fileStatusConstants[status];
            });
        });
    };

    fluid.uploader.fileQueue.sizeOfFilesByStatus = function (files, statuses) {
        files = fluid.uploader.fileQueue.filesByStatus(files, statuses);
        return fluid.uploader.fileQueue.sizeOfFiles(files);
    };

    fluid.uploader.fileQueue.setupCurrentBatch = function (that) {
        that.clearCurrentBatch();
        that.updateCurrentBatch();
    };

    fluid.uploader.fileQueue.clearCurrentBatch = function (that) {
        that.currentBatch = {
            fileIdx: 0,
            files: [],
            totalBytes: 0,
            numFilesCompleted: 0,
            numFilesErrored: 0,
            bytesUploadedForFile: 0,
            previousBytesUploadedForFile: 0,
            totalBytesUploaded: 0
        };
    };

    fluid.uploader.fileQueue.updateCurrentBatch = function (readyFiles, currentBatch) {
        currentBatch.files = readyFiles;
        currentBatch.totalBytes = fluid.uploader.fileQueue.sizeOfFiles(readyFiles);
    };

    fluid.uploader.fileQueue.updateBatchStatus = function (currentBytes, currentBatch) {
        var byteIncrement = currentBytes - currentBatch.previousBytesUploadedForFile;
        currentBatch.totalBytesUploaded += byteIncrement;
        currentBatch.bytesUploadedForFile += byteIncrement;
        currentBatch.previousBytesUploadedForFile = currentBytes;
    };


})(jQuery, fluid_3_0_0);
