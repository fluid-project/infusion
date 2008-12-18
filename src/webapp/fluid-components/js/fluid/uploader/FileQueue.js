/*
Copyright 2007-2008 University of Toronto
Copyright 2007-2008 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global SWFUpload*/
/*global jQuery*/
/*global fluid_0_7*/

fluid_0_7 = fluid_0_7 || {};

(function ($, fluid) {
    
    var filterFiles = function (files, filterFn) {
        var filteredFiles = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (filterFn(file) === true) {
                filteredFiles.push(file);
            }
        }
        
        return filteredFiles;
    };
    
    var getUploadedFiles = function (that) {
        return filterFiles(that.files, function (file) {
            return (file.filestatus === fluid.uploader.fileStatusConstants.COMPLETE);
        });
    };
    
    var getReadyFiles = function (that) {
        return filterFiles(that.files, function (file) {
            return (file.filestatus === fluid.uploader.fileStatusConstants.QUEUED || file.filestatus === fluid.uploader.fileStatusConstants.CANCELLED);
        });
    };

    var removeFile = function (that, file) {
        // Remove the file from the collection and tell the world about it.
        var idx = $.inArray(file, that.files);
        that.files.splice(idx, 1);
    };
    
    var clearCurrentBatch = function (that) {
        that.currentBatch = {
            fileIdx: -1,
            files: [],
            totalBytes: 0,
            numFilesCompleted: 0,
            numFilesErrored: 0,
            bytesUploadedForFile: 0,
            previousBytesUploadedForFile: 0,
            totalBytesUploaded: 0
        };
    };
    
    var updateCurrentBatch = function (that) {
        var readyFiles = that.getReadyFiles();
        that.currentBatch.files = readyFiles;
        that.currentBatch.totalBytes = fluid.fileQueue.sizeOfFiles(readyFiles);
    };
    
    var setupCurrentBatch = function (that) {
        clearCurrentBatch(that);
        updateCurrentBatch(that);
    };
     
    fluid.fileQueue = function () {
        var that = {};
        that.files = [];
        that.isUploading = false;
        
        that.addFile = function (file) {
            that.files.push(file);    
        };
        
        that.removeFile = function (file) {
            removeFile(that, file);
        };
        
        that.totalBytes = function () {
            return fluid.fileQueue.sizeOfFiles(that.files);
        };
        
        that.getReadyFiles = function () {
            return getReadyFiles(that);
        };
        
        that.sizeOfReadyFiles = function () {
            return fluid.fileQueue.sizeOfFiles(that.getReadyFiles());
        };
        
        that.getUploadedFiles = function () {
            return getUploadedFiles(that);
        };

        that.sizeOfUploadedFiles = function () {
            return fluid.fileQueue.sizeOfFiles(that.getUploadedFiles());
        };

        that.setupCurrentBatch = function () {
            setupCurrentBatch(that);
        };
        
        that.clearCurrentBatch = function () {
            clearCurrentBatch(that);
        };
        
        that.updateCurrentBatch = function () {
            updateCurrentBatch(that);
        };
                
        return that;
    };
    
    fluid.fileQueue.sizeOfFiles = function (files) {
        var totalBytes = 0;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            totalBytes += file.size;
        }        
        return totalBytes;
    };
          
})(jQuery, fluid_0_7);
