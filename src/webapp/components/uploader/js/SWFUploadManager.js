/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global SWFUpload*/
/*global swfobject*/
/*global jQuery*/
/*global fluid_1_0*/

fluid_1_0 = fluid_1_0 || {};

(function ($, fluid) {

    /*****************************
     * SWFUpload Setup Decorator *
     *****************************/
    
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
            flashMovie.attr("role", "button");
            flashMovie.attr("alt", "Browse files button");
            
            if (that.isTransparent) {
                // Style the Flash movie so that it floats trasparently over the button.
                flashMovie.addClass(that.options.styles.browseButtonOverlay);
                flashMovie.css("top", browseButton.position().top);
                flashMovie.css("left", browseButton.position().left);
            }
        };
    };
    
    var createFlash9MovieContainer = function () {
        // Create a hidden container and a placeholder element for SWFUpload to replace.
        var container = $("<div class='fl-uploader-flash9-container'></div>");
        var placeholder = $("<span></span>");
        var placeholderId = fluid.allocateSimpleId(placeholder);
        container.append(placeholder);
        $("body").append(container);
        return placeholderId;
    };
    
    var setupForFlash9 = function (that, uploader) {
        that.returnedOptions.uploadManager.options = {
            flashURL: that.options.flash9URL || undefined,
            flashButtonPeerId: createFlash9MovieContainer()
        };
    };
    
    var createEmptyPlaceholder = function () {
        var placeholder = $("<span></span>");
        fluid.allocateSimpleId(placeholder);
        
        return placeholder;
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
            flashURL: that.options.flash10URL || undefined,
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
        // The flash9URL and flash10URLs are now deprecated in favour of the flashURL option in upload manager.
        flashButtonAlwaysVisible: true,
        transparentEvenInIE: false,
        
        // Used only when the Flash movie is visible.
        flashButtonImageURL: "../images/browse.png",
        flashButtonHeight: 22,
        flashButtonWidth: 106,
        
        styles: {
            browseButtonOverlay: "fl-uploader-browse-overlay"
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
        onFileSuccess: "upload_success_handler"
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
        
        result.upload_complete_handler = function (file) {
            that.queueManager.finishFile(file);
            if (that.queueManager.shouldUploadNextFile()) {
                that.swfUploader.startUpload();
            } else {
                if (that.queueManager.queue.shouldStop) {
                    that.swfUploader.stopUpload();
                }
                that.queueManager.complete();
            }
        };

        return result;
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
    
    /* FLUID-822: while stopping the upload cycle while a file is in mid-upload should be possible
     * in practice, it sets up a state where when the upload cycle is restarted SWFUpload will get stuck
     * therefor we only stop the upload after a file has completed but before the next file begins. 
     */
    
    var stopUpload = function (that) {
        that.queue.shouldStop = true;
        that.events.onUploadStop.fire();
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
            that.queueManager.startFile();
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
                that.queue.currentBatch.totalBytesUploaded += file.size;
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
        that.queueManager = fluid.fileQueue.manager(that.queue, that.events);
        
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
            that.queueManager.start();
            that.swfUploader.startUpload();
        };
        
        /**
         * Cancels an in-progress upload.
         */
        that.stop = function () {
            stopUpload(that);
        };
        
        setupSwfUploadManager(that, events);
        return that;
    };
    
    fluid.defaults("fluid.swfUploadManager", {
        uploadURL: "",
        flashURL: "../../../lib/swfupload/flash/swfupload.swf",
        flashButtonPeerId: "",
        postParams: {},
        fileSizeLimit: "20480",
        fileTypes: "*.*",
        fileTypesDescription: null,
        fileUploadLimit: 0,
        fileQueueLimit: 0,
        debug: false
    });
    
})(jQuery, fluid_1_0);
