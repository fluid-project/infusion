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

    /*****************************
     * SWFUpload Setup Decorator *
     *****************************/

    var addFlash9Compatibility = function () {
        // There's a bug in SWFUpload 2.2.0b3 that prevents using Flash 9 correctly.
        // Override the implementation of SWFUpload.callFlash() to use the old 2.1 version.
        SWFUpload.prototype.callFlash = SWFUpload.callFlash_Flash9Compatibility;
    };
    
    var unbindSelectFiles = function () {
        // There's a bug in SWFUpload 2.2.0b3 that causes the entire browser to crash 
        // if selectFile() or selectFiles() is invoked. Remove them so no one will accidently crash their browser.
        var emptyFunction = function () {};
        SWFUpload.prototype.selectFile = emptyFunction;
        SWFUpload.prototype.selectFiles = emptyFunction;
    };
    
    var prepareUpstreamOptions = function (that, uploader) {
        that.returnedOptions = {
            uploadManager: {
                type: uploader.options.uploadManager.type || uploader.options.uploadManager
            }
        };
    };
    
    var createAfterReadyHandler = function (that, uploader) {
        return function () {
            var flashMovie = $("#" + uploader.uploadManager.swfUploader.movieName, uploader.container);
            var browseButton = uploader.locate("browseButton");
            
            // Do our best to make the Flash movie as accessible as possib
            fluid.tabindex(flashMovie, 0);
            flashMovie.ariaRole("button");
            flashMovie.attr("alt", "Browse files button");
            
            if (that.isTransparent) {
                // Style the Flash movie so that it floats trasparently over the button.
                flashMovie.addClass(that.options.styles.browseButtonOverlay);
                flashMovie.css("top", browseButton.position().top);
                flashMovie.css("left", browseButton.position().left);
            }
        };
    };
    
    var setupForFlash9 = function (that, uploader) {
        addFlash9Compatibility();
        that.returnedOptions.uploadManager.options = {
            flashURL: that.options.flash9URL,
            flashButtonPeerId: ""
        };
    };
    
    var createButtonPlaceholder = function (browseButton) {
        var placeholder = $("<span></span>");
        var placeholderId = fluid.allocateSimpleId(placeholder);
        browseButton.before(placeholder);
        unbindSelectFiles();
        
        return placeholderId;
    };
    
    var setupForFlash10 = function (that, uploader) {
        // If we're working in Flash 10 or later, we need to attach the Flash movie to the browse button.
        var browseButton = uploader.locate("browseButton");
        fluid.tabindex(browseButton, -1);

        that.isTransparent = that.options.flashButtonAlwaysVisible ? false : 
                                                                     (!$.browser.msie || that.options.transparentEvenInIE);
        
        // If the button is transparent, we'll need an extra placeholder element which will be replaced by the movie.
        // If the Flash movie is visible, we can just replace the button itself.
        var peerId = that.isTransparent ? createButtonPlaceholder(browseButton) : fluid.allocateSimpleId(browseButton);
        
        that.returnedOptions.uploadManager.options = {
            flashURL: that.options.flash10URL,
            flashButtonImageURL: that.isTransparent ? undefined : that.options.flashButtonImageURL, 
            flashButtonPeerId: peerId,
            flashButtonHeight: that.isTransparent ? browseButton.outerHeight(): that.options.flashButtonHeight,
            flashButtonWidth: that.isTransparent ? browseButton.outerWidth(): that.options.flashButtonWidth,
            flashButtonWindowMode: that.isTransparent ? SWFUpload.WINDOW_MODE.TRANSPARENT : SWFUpload.WINDOW_MODE.WINDOW,
            flashButtonCursorEffect: SWFUpload.CURSOR.HAND,
            listeners: {
                afterReady: createAfterReadyHandler(that, uploader),
                onUploadStart: function () {
                    uploader.uploadManager.swfUploader.setButtonDisabled(true);
                },
                afterUploadComplete: function () {
                    uploader.uploadManager.swfUploader.setButtonDisabled(false);
                }
            }   
        };
    };
    
    /**
     * SWFUploadSetupDecorator is a decorator designed to setup the DOM correctly for SWFUpload and configure
     * the Uploader component according to the version of Flash and browser currently running.
     * 
     * @param {Uploader} uploader the Uploader component to decorate
     * @param {options} options configuration options for the decorator
     */
    fluid.swfUploadSetupDecorator = function (uploader, options) {
        var that = {};
        fluid.mergeComponentOptions(that, "fluid.swfUploadSetupDecorator", options);
               
        that.flashVersion = swfobject.getFlashPlayerVersion().major;
        prepareUpstreamOptions(that, uploader);  
        if (that.flashVersion === 9) {
            setupForFlash9(that, uploader);
        } else {
            setupForFlash10(that, uploader);
        }
        
        return that;
    };
    
    fluid.defaults("fluid.swfUploadSetupDecorator", {
        flash9URL: "../../flash/swfupload_f9.swf",
        flash10URL: "../../flash/swfupload_f10.swf",
        flashButtonAlwaysVisible: true,
        transparentEvenInIE: false,
        
        // Used only when the Flash movie is visible.
        flashButtonImageURL: "../../images/uploader/browse.png",
        flashButtonHeight: 22,
        flashButtonWidth: 106,
        
        styles: {
            browseButtonOverlay: "fl-browse-button-overlay"
        }
    });
    
    
    /***********************
     * SWF Upload Manager *
     ***********************/
    
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
        flashButtonPeerId: "button_placeholder_id",
        flashButtonImageURL: "button_image_url",
        flashButtonHeight: "button_height",
        flashButtonWidth: "button_width",
        flashButtonWindowMode: "button_window_mode",
        flashButtonCursorEffect: "button_cursor",
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
    var browse = function (that) {
        if (that.queue.isUploading) {
            return;
        }
                   
        if (that.options.fileQueueLimit === 1) {
            that.swfUploader.selectFile();
        } else {
            that.swfUploader.selectFiles();
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
            if (error === fluid.uploader.errorConstants.UPLOAD_STOPPED) {
                that.queue.isUploading = false;
            } else if (that.queue.isUploading) {
                that.queue.currentBatch.numFilesErrored++;
            }
            fileStatusUpdater(file);
        });
        
        that.events.onFileSuccess.addListener(function (file) {
            if (that.queue.currentBatch.bytesUploadedForFile === 0) {
                that.queue.currentBatch.totalBytesUploaded += file.size;
            }
            fileStatusUpdater(file);
        });
        
        that.events.afterUploadComplete.addListener(function () {
            that.queue.isUploading = false; 
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
            browse(that);
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
        flashButtonPeerId: "",
        postParams: {},
        fileSizeLimit: "20480",
        fileTypes: "*.*",
        fileTypesDescription: null,
        fileUploadLimit: 0,
        fileQueueLimit: 0,
        debug: false
    });
    
})(jQuery, fluid_0_7);


/***********************
 * Demo Upload Manager *
 ***********************/

(function ($, fluid) {
    
    var updateProgress = function (file, events, demoState, isUploading) {
        if (!isUploading) {
            return;
        }
        
        var chunk = Math.min(demoState.chunkSize, file.size);
        demoState.bytesUploaded = Math.min(demoState.bytesUploaded + chunk, file.size);
        events.onFileProgress.fire(file, demoState.bytesUploaded, file.size);
    };
    
    var finishUploading = function (that) {
        if (!that.queue.isUploading) {
            return;
        }
        
        var file = that.demoState.currentFile;
        file.filestatus = fluid.uploader.fileStatusConstants.COMPLETE;
        that.events.onFileSuccess.fire(file);
        that.demoState.fileIdx++;
        that.swfUploadSettings.upload_complete_handler(file); // this is a hack that needs to be addressed.
    };
    
    var simulateUpload = function (that) {
        if (!that.queue.isUploading) {
            return;
        }
        
        var file = that.demoState.currentFile;
        if (that.demoState.bytesUploaded < file.size) {
            that.invokeAfterRandomDelay(function () {
                updateProgress(file, that.events, that.demoState, that.queue.isUploading);
                simulateUpload(that);
            });
        } else {
            finishUploading(that);
        } 
    };
    
    var startUploading = function (that) {
        // Reset our upload stats for each new file.
        that.demoState.currentFile = that.queue.files[that.demoState.fileIdx];
        that.demoState.chunksForCurrentFile = Math.ceil(that.demoState.currentFile / that.demoState.chunkSize);
        that.demoState.bytesUploaded = 0;
        that.queue.isUploading = true;
        
        that.events.onFileStart.fire(that.demoState.currentFile);
        that.demoState.currentFile.filestatus = fluid.uploader.fileStatusConstants.IN_PROGRESS;
        simulateUpload(that);
    };

    var stopDemo = function (that) {
        that.demoState.currentFile.filestatus = fluid.uploader.fileStatusConstants.CANCELLED;
        // In SWFUpload's world, pausing is a combinination of an UPLOAD_STOPPED error and a complete.
        that.events.onFileError.fire(that.demoState.currentFile, 
                                       fluid.uploader.errorConstants.UPLOAD_STOPPED, 
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
            stopDemo(that);
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
})(jQuery, fluid_0_7);
