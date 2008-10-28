/*global SWFUpload*/
/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    
    var totalBytes = function (that) {
        var bytes = 0;
        for (var i = 0; i < that.files.length; i++) {
            var file = that.files[i];
            bytes += file.size;
        }  
        
        return bytes;
    };
    
    var numReadyFiles = function (that) {
        var count = 0;
        for (var i = 0; i < that.queue.files.length; i++) {
            count += (that.queue.files[i].filestatus > fileQueue.fileStatusConstants.COMPLETE);
        }  
        return count;  
    };
    
    var sizeOfUploadedFiles = function (that) {
        var totalBytes = 0;
        for (var i = 0; i < that.queue.files.length; i++) {
            var file = that.queue.files[i];
            totalBytes += (file.filestatus === fileQueue.fileStatusConstants.COMPLETE) ? file.size : 0;
        }          
        return totalBytes;
    };
        
    var sizeOfReadyFiles = function (that) {
        var totalBytes = 0;
        for (var i = 0; i < that.queue.files.length; i++) {
            var file = that.queue.files[i];
            totalBytes += (file.filestatus < fileQueue.fileStatusConstants.COMPLETE) ? file.size : 0;
        }          
        return totalBytes;
    };
    
    var removeFile = function (that, file) {
        // Remove the file from the collection and tell the world about it.
        var idx = $.inArray(file, that.files);
        that.files.splice(idx, 1);
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
            return totalBytes(that); 
        };
                
        return that;
    };
    
    fluid.fileQueue.fileStatusConstants = {
        QUEUED: -1,
	    IN_PROGRESS: -2,
	    ERROR: -3,
        COMPLETE: -4,
        CANCELLED: -5
    }
          
})(jQuery, fluid_0_6);
