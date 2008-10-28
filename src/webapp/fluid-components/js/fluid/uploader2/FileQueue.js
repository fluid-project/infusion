/*global SWFUpload*/
/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

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
            return (file.filestatus === fluid.fileQueue.fileStatusConstants.COMPLETE);
        });
    };
    
    var getReadyFiles = function (that) {
        return filterFiles(that.files, function (file) {
            return (file.filestatus === fluid.fileQueue.fileStatusConstants.QUEUED);
        });
    };

    var removeFile = function (that, file) {
        // Remove the file from the collection and tell the world about it.
        var idx = $.inArray(file, that.files);
        that.files.splice(idx, 1);
    };
    
    var clearCurrentBatch = function (that) {
        that.currentBatch = {
        	files: [],
        	totalBytes: 0,
        	numFilesCompleted: 0,
        	bytesUploaded: 0
        };
    };
    
    var updateCurrentBatch = function (that) {
        var readyFiles = that.getReadyFiles();
        var sizeOfReadyFiles = fluid.fileQueue.sizeOfFiles(readyFiles);
        
        that.currentBatch = {
        	files: readyFiles,
        	totalBytes: sizeOfReadyFiles,
        	numFilesCompleted: 0,
        	bytesUploaded: 0
        };
    };
     
    fluid.fileQueue = function () {
        var that = {};
        that.files = [];
       
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
            return sizeOfFiles(that.getReadyFiles());
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
    
    fluid.fileQueue.fileStatusConstants = {
        QUEUED: -1,
	    IN_PROGRESS: -2,
	    ERROR: -3,
        COMPLETE: -4,
        CANCELLED: -5
    };
          
})(jQuery, fluid_0_6);
