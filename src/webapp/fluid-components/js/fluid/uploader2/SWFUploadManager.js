/*global SWFUpload*/
/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {

    // Maps SWFUpload's setting names to our component's setting names.
    var swfUploadOptionsMap = {
        uploadURL: "upload_url",
        flashURL: "flash_url",
        postParams: "post_params",
        fileSizeLimit: "file_size_limit",
        fileTypes: "file_types",
        fileTypesDescription: "file_types_description",
        fileUploadLimit: "file_upload_limit",
        fileQueueLimit: "file_queue_limit",
        debug: "debug"
    };
    
    // Maps SWFUpload's callback names to our component's callback names.
    var swfUploadEventMap = {
        afterReady: "swfupload_loaded_handler",
        onFileDialog: "file_dialog_start_handler",
        afterFileQueued: "file_queued_handler",
        onQueueError: "file_queue_error_handler",
        afterFileDialog: "file_dialog_complete_handler",
        onFileStart: "upload_start_handler",
        onFileProgress: "upload_progress_handler",
        onFileError: "upload_error_handler",
        onFileSuccess: "upload_success_handler",
        afterFileComplete: "upload_complete_handler"
    };
    
    var mapNames = function (nameMap, source, target) {
        var result = target || {};
        for (var key in source) {
            var mappedKey = nameMap[key];
            if (mappedKey) {
                result[mappedKey] = source[key];
            }
        }
        
        return result;
    };
    
    var finishUploading = function (that) {
        that.events.afterUploadComplete.fire(that.queue.currentBatch.files);
        that.queue.clearCurrentBatch();
    };
    
    var wrapAfterFileComplete = function (that, swfCallbacks) {
        var fireAfterFileComplete = swfCallbacks.upload_complete_handler;
        var fileCompleteWrapper = function (file) {
            var batch = that.queue.currentBatch;
            batch.numFilesCompleted++;
            
            fireAfterFileComplete(file);
            
            if (batch.numFilesCompleted < batch.files.length) {
                that.uploadNextFile();
            } else {
                finishUploading(that);
            }
        };
        swfCallbacks.upload_complete_handler = fileCompleteWrapper;
    };
    
    // For each event type, hand the fire function to SWFUpload so it can fire the event at the right time for us.
    var mapEvents = function (that, nameMap, target) {
        var result = target || {};
        for (var eventType in that.events) {
            var fireFn = that.events[eventType].fire;
            var mappedName = nameMap[eventType];
            if (mappedName) {
                result[mappedName] = fireFn;
            }   
        }
        wrapAfterFileComplete(that, result);
        
        return result;
    };

    var start = function (that) {
        that.queue.setupCurrentBatch();
        that.events.onUploadStart.fire(that.queue.currentBatch.files); 
        that.uploadNextFile();
    };
    
    // Invokes the OS browse files dialog, allowing either single or multiple select based on the options.
    var browse = function (swfUploader, fileQueueLimit) {              
        if (fileQueueLimit === 1) {
            swfUploader.selectFile();
        } else {
            swfUploader.selectFiles();
        }  
    };
    
    var bindEvents = function (that) {
        // Add a listener that will keep our file queue model in sync with SWFUpload.
        that.events.afterFileQueued.addListener(function (file) {
            that.queue.addFile(file); 
        });

        that.events.onFileStart.addListener(function (file) {
            that.queue.currentBatch.fileIdx++;
            that.queue.currentBatch.previousChunk = 0; 
            that.queue.currentBatch.bytesUploadedForFile = 0;
        });
        
        that.events.onFileProgress.addListener(function (file, currentBytes, totalBytes) {
            var currentBatch = that.queue.currentBatch;
            var byteIncrement = currentBytes - currentBatch.previousChunk;
            currentBatch.bytesUploaded += byteIncrement;
            currentBatch.bytesUploadedForFile += byteIncrement;
            currentBatch.previousChunk = currentBytes;
        });
        
        that.events.onFileSuccess.addListener(function (file) {
            if (that.queue.currentBatch.bytesUploadedForFile === 0) {
                that.queue.currentBatch.bytesUploaded += file.size;
            }
        });
    };
    
    var removeFile = function (that, file) {
        that.queue.removeFile(file);
        that.swfUploader.cancelUpload(file.id);
        that.events.afterFileRemoved.fire(file);
    };
    
    // Instantiates a new SWFUploader instance and attaches it the upload manager.
    var setupSwfUploadManager = function (that, events) {
        that.events = events;
        that.queue = fluid.fileQueue();
        
        // Map the event and settings names to SWFUpload's expectations.
        that.swfUploadSettings = mapNames(swfUploadOptionsMap, that.options);
        mapEvents(that, swfUploadEventMap, that.swfUploadSettings);
        
        // Setup the instance.
        that.swfUploader = new SWFUpload(that.swfUploadSettings);
        
        bindEvents(that);
    };
    
    /**
     * Server Upload Manager is responsible for coordinating with the Flash-based SWFUploader library,
     * providing a simple way to start, pause, and cancel the uploading process. It requires a working
     * server to respond to the upload POST requests.
     * 
     * @param {Object} eventBindings an object containing upload lifecycle callbacks
     * @param {Object} options configuration options for the upload manager
     */
    fluid.swfUploadManager = function (events, options) {
        var that = {};
        
        // This needs to be refactored!
        fluid.mergeComponentOptions(that, "fluid.swfUploadManager", options);
        fluid.mergeListeners(events, that.options.listeners);
   
        /**
         * Opens the native OS browse file dialog.
         */
        that.browseForFiles = function () {
            browse(that.swfUploader, that.options.fileQueueLimit);
        };
        
        /**
         * Removes the specified file from the upload queue.
         * 
         * @param {File} file the file to remove
         */
        that.removeFile = function (file) {
            removeFile(that, file);
        };
        
        /**
         * Starts uploading all queued files to the server.
         */
        that.start = function () {
            start(that);
        };
        
        /**
         * Triggers the next file in the current batch to be uploaded.
         * This function is called internally, and should be moved.
         */
        that.uploadNextFile = function () {
            that.swfUploader.startUpload();
        };
        
        /**
         * Cancels an in-progress upload.
         */
        that.cancel = function () {
            that.swfUploader.stopUpload();
        };
        
        setupSwfUploadManager(that, events);
        return that;
    };
    
    fluid.defaults("fluid.swfUploadManager", {
        uploadURL: "",
        flashURL: "../../swfupload/swfupload_f9.swf",
        postParams: {},
        fileSizeLimit: "20480",
        fileTypes: "*.*",
        fileTypesDescription: null,
        fileUploadLimit: 0,
        fileQueueLimit: 0,
        debug: false
    });
})(jQuery, fluid_0_6);
