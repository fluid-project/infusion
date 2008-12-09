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
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};


/***********************
 * SWF Upload Manager *
 ***********************/

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
            if (that.queue.isUploading && batch.numFilesCompleted < batch.files.length) {
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
        that.queue.isUploading = true;
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
        var fileStatusUpdater = function (file) {
            fluid.find(that.queue.files, function (potentialMatch) {
                if (potentialMatch.id === file.id) {
                    potentialMatch.filestatus = file.filestatus;
                    return true;
                }
            });
        };

        // Add a listener that will keep our file queue model in sync with SWFUpload.
        that.events.afterFileQueued.addListener(function (file) {
            that.queue.addFile(file); 
        });

        that.events.onFileStart.addListener(function (file) {
            that.queue.currentBatch.fileIdx++;
            that.queue.currentBatch.bytesUploadedForFile = 0;
            that.queue.currentBatch.previousBytesUploadedForFile = 0; 
            fileStatusUpdater(file);
        });
        
        that.events.onFileProgress.addListener(function (file, currentBytes, totalBytes) {
            var currentBatch = that.queue.currentBatch;
            var byteIncrement = currentBytes - currentBatch.previousBytesUploadedForFile;
            currentBatch.totalBytesUploaded += byteIncrement;
            currentBatch.bytesUploadedForFile += byteIncrement;
            currentBatch.previousBytesUploadedForFile = currentBytes;
            fileStatusUpdater(file);
        });
        
        that.events.onFileError.addListener(function (file, error) {
            if (error === SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED) {
                that.queue.isUploading = false;
            }
            fileStatusUpdater(file, error);
        });
        
        that.events.onFileSuccess.addListener(function (file) {
            if (that.queue.currentBatch.bytesUploadedForFile === 0) {
                that.queue.currentBatch.totalBytesUploaded += file.size;
            }
            fileStatusUpdater(file);
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
        that.stop = function () {
            that.swfUploader.stopUpload();
        };
        
        setupSwfUploadManager(that, events);
        return that;
    };
    
    fluid.defaults("fluid.swfUploadManager", {
        uploadURL: "",
        flashURL: "../../flash/swfupload_f9.swf",
        postParams: {},
        fileSizeLimit: "20480",
        fileTypes: "*.*",
        fileTypesDescription: null,
        fileUploadLimit: 0,
        fileQueueLimit: 0,
        debug: false
    });
})(jQuery, fluid_0_6);


/***********************
 * Demo Upload Manager *
 ***********************/

(function ($, fluid) {
    
    var updateProgress = function (file, events, demoState) {
        if (demoState.shouldPause) {
            return;
        }
        
        var chunk = Math.min(demoState.chunkSize, file.size);
        demoState.bytesUploaded = Math.min(demoState.bytesUploaded + chunk, file.size);
        events.onFileProgress.fire(file, demoState.bytesUploaded, file.size);
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
        if (that.demoState.shouldPause) {
            return;
        }
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

    var pauseDemo = function (that) {
        that.demoState.shouldPause = true;
        that.demoState.currentFile.filestatus = fluid.fileQueue.fileStatusConstants.CANCELLED;
        
        // In SWFUpload's world, pausing is a combinination of an UPLOAD_STOPPED error and a complete.
        that.events.onFileError.fire(that.demoState.currentFile, 
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
        that.stop = function () {
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
