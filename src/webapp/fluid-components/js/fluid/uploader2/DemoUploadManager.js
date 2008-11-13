/*global SWFUpload*/
/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    
    var updateProgress = function (file, events, demoState) {
        if (demoState.shouldPause) {
            return;
        }
        
        var chunk = Math.min(demoState.chunkSize, file.size);
        demoState.bytesUploaded = Math.min(demoState.bytesUploaded + chunk, file.size);
        events.onFileProgress.fire(file, demoState.bytesUploaded, file.size);
    };
    
    var startUploading = function (that) {
        // Reset our upload stats for each new file.
        that.demoState.currentFile = that.queue.files[that.demoState.fileIdx];
        that.demoState.chunksForCurrentFile = Math.ceil(that.demoState.currentFile / that.demoState.chunkSize);
        that.demoState.bytesUploaded = 0;
        that.demoState.shouldPause = false;
        
        that.events.onFileStart.fire(that.demoState.currentFile);
        that.demoState.currentFile.filestatus = fluid.fileQueue.fileStatusConstants.IN_PROGRESS;
        simulateUpload(that);
    };
    
    var finishUploading = function (that) {
        var file = that.demoState.currentFile;
        file.filestatus = fluid.fileQueue.fileStatusConstants.COMPLETE;
        that.events.onFileSuccess.fire(file);
        that.invokeAfterRandomDelay(function () {
            that.demoState.fileIdx++;
            that.swfUploadSettings.upload_complete_handler(file); // this is a hack that needs to be addressed.
        });     
    };
    
    var simulateUpload = function (that) {
        var file = that.demoState.currentFile;
        that.invokeAfterRandomDelay(function () {
            if (that.demoState.bytesUploaded < file.size) {
                updateProgress(file, that.events, that.demoState);
                simulateUpload(that);
            } else {
                finishUploading(that);
            }
        });
    };
    
    var pauseDemo = function (that) {
        that.demoState.shouldPause = true;
        that.demoState.currentFile.filestatus = fluid.fileQueue.fileStatusConstants.CANCELLED;
        
        // In SWFUpload's world, pausing is a combinination of an UPLOAD_STOPPED error and a complete.
        that.events.onUploadError.fire(that.demoState.currentFile, 
                                       SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED, 
                                       "The demo upload was paused by the user.");
        // This is a hack that needs to be addressed.
        that.swfUploadSettings.upload_complete_handler(that.demoState.currentFile);
    };
    
    var initDemoUploadManager = function (events, options) {
        // Instantiate ourself as a slightly modified ServerUploadManager.
        var that = fluid.swfUploadManager(events, options);
        fluid.mergeComponentOptions(that, "fluid.demoUploadManager", that.options);
        
        // Initialize state for our upload simulation.
        that.demoState = {
            fileIdx: 0,
            chunkSize: 200000
        };
        
        return that;
    };
       
    /**
     * The Demo Upload Manager derives from the standard Server Upload Manager, but simulates the upload process.
     * 
     * @param {Object} options configuration options
     */
    fluid.demoUploadManager = function (events, options) {
        var that = initDemoUploadManager(events, options);
        
        that.uploadNextFile = function () {
            startUploading(that);
        };
        
        /**
         * Cancels a simulated upload.
         * This method overrides the default behaviour in SWFUploadManager.
         */
        that.cancel = function () {
            pauseDemo(that);
        };
        
        /**
         * Invokes a function after a random delay by using setTimeout.
         * If the simulateDelay option is false, the function is invoked immediately.
         * 
         * @param {Object} fn the function to invoke
         */
        that.invokeAfterRandomDelay = function (fn) {
            var delay;
            
            if (that.options.simulateDelay) {
                delay = Math.floor(Math.random() * 1000 + 100);
                setTimeout(fn, delay);
            } else {
                fn();
            }
        };
        
        return that;
    };
    
    fluid.defaults("fluid.demoUploadManager", {
        simulateDelay: true 
    });
})(jQuery, fluid_0_6);
