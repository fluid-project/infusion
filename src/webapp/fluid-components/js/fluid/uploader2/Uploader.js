/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    
    /* uploader state */
    
    var setState = function (that, stateClass) {
        that.stateDisplay.attr("className", stateClass);
    };
    
    var addState = function (that, stateClass) {
        that.stateDisplay.addClass(stateClass);
    };
    
    var removeState  = function (that, stateClass) {
        that.stateDisplay.removeClass(stateClass);
    };
    
    var updateUploaderViewState = function (that, state) {
        switch (state) {
        // all files have been removed
        case that.options.styles.queueEmptyState:
            that.locate("uploadButton").attr("disabled", "disabled");
            if (that.uploadManager.queue.files.length === 0) {
                that.locate("browseButton").text("Browse Files");
                setState(that, state);
            }
            break;
        // all files have been uploaded
        case that.options.styles.queueDoneState:
            that.locate("uploadButton").attr("disabled", "disabled");
            that.locate("browseButton").removeAttr("disabled");
            setState(that, state);
        
            break;
        // files have been added to the queue
        case that.options.styles.queueLoadedState:
            that.locate("browseButton").text(that.options.strings.buttons.addMore);
            that.locate("uploadButton").removeAttr("disabled");
            setState(that, state);
        
            break;
        }
    };
    
    var refreshFileTotal = function (that) {
        var readyFiles = that.uploadManager.queue.getReadyFiles();
        var numReadyFiles = readyFiles.length;
        var bytesReadyFiles = that.uploadManager.queue.sizeOfReadyFiles();
        
        var fileLabelStr = (numReadyFiles === 1) ? that.options.strings.progress.singleFile : that.options.strings.progress.pluralFiles;
        
        var totalStateStr = fluid.stringTemplate(that.options.strings.progress.toUploadLabel, {
            fileCount: numReadyFiles, 
            fileLabel: fileLabelStr, 
            totalBytes: fluid.uploader.formatFileSize(bytesReadyFiles)
        });
        $(".total-file-progress").html(totalStateStr);
    };

        
    /* Progress */
   
    var derivePercent = function (num, total) {
        return Math.round((num * 100) / total);
    };
       
    var progressStart = function (that, file) {
        var fileRowElm = $("tr#" + file.id);
        that.fileProgress.refresh(fileRowElm);
    };
        
    var progressUpdate = function (that, file, fileBytesComplete, fileTotalBytes) {
        // file progress
        var filePercent = derivePercent(fileBytesComplete, fileTotalBytes);
        var filePercentStr = filePercent + "%";
        
        that.fileProgress.update(filePercent, filePercentStr);
        
        // total progress
        var batch = that.uploadManager.queue.currentBatch;
        
        var totalPercent = derivePercent(batch.totalBytesUploaded, batch.totalBytes);
        
        var totalProgressStr = fluid.stringTemplate(that.options.strings.progress.totalProgressLabel, {
            curFileN: batch.fileIdx + 1, 
            totalFilesN: batch.files.length, 
            currBytes: fluid.uploader.formatFileSize(batch.bytesUploadedForFile), 
            totalBytes: fluid.uploader.formatFileSize(batch.totalBytes)
        });
        
        that.totalProgress.update(totalPercent, totalProgressStr);
    };
        
    var progressComplete = function (that) {
        var batch = that.uploadManager.queue.currentBatch;
        
        var totalProgressStr = fluid.stringTemplate(that.options.strings.progress.completedLabel, {
            curFileN: batch.fileIdx + 1, 
            totalCurrBytes: fluid.uploader.formatFileSize(batch.totalBytes)
        });
        
        that.totalProgress.update(100, totalProgressStr);
        
        that.totalProgress.hide();
    };

    /* bind events */
   
    var bindDOMEvents = function (that) {
        that.locate("browseButton").click(function () {
            that.uploadManager.browseForFiles();
        });
        
        that.locate("uploadButton").click(function () {
            that.uploadManager.start();
        });
    };
        
    var bindModelEvents = function (that) {
        that.events.onFileDialog.addListener(function () {
            addState(that, that.options.styles.queueBrowsingState);
        });
        
        that.events.afterFileDialog.addListener(function () {
            removeState(that, that.options.styles.queueBrowsingState);

            if (that.uploadManager.queue.getReadyFiles().length > 0) {
                updateUploaderViewState(that, that.options.styles.queueLoadedState);
            }
            
            refreshFileTotal(that);
        });
        
        that.events.afterFileRemoved.addListener(function () {
            if (that.uploadManager.queue.getReadyFiles().length === 0) {
                updateUploaderViewState(that, that.options.styles.queueEmptyState);
            }
            
            refreshFileTotal(that);
        });
        
        // Progress
        
        that.events.onUploadStart.addListener(function () {
            setState(that, that.options.styles.queueUploadingState);
            that.locate("browseButton").attr("disabled", "disabled");
            that.locate("uploadButton").attr("disabled", "disabled");
        });

        that.events.onFileStart.addListener(function (file) {
            progressStart(that, file);
        });
        
        that.events.onFileProgress.addListener(function (file, fileBytesComplete, fileTotalBytes) {
            progressUpdate(that, file, fileBytesComplete, fileTotalBytes); 
        });
        
        that.events.afterFileComplete.addListener(function (file) {
            that.fileProgress.hide(0, false); // no delay, no animation 
        });
        
        that.events.afterUploadComplete.addListener(function () {
            progressComplete(that);
            updateUploaderViewState(that, that.options.styles.queueDoneState);
        });
    };
   
    var setupUploader = function (that) {
        // Instantiate the upload manager and file queue view, 
        // passing them smaller chunks of the overall options for the uploader.
        that.uploadManager = fluid.initSubcomponent(that, 
                                                    "uploadManager", 
                                                    [that.events, fluid.COMPONENT_OPTIONS]);
        that.fileQueueView = fluid.initSubcomponent(that, 
                                                    "fileQueueView", 
                                                    [that.locate("fileQueue"),
                                                    that.events,
                                                    that.container, 
                                                    that.uploadManager,
                                                    fluid.COMPONENT_OPTIONS]);
                                                    
        that.stateDisplay = that.locate("stateDisplay");
        
        that.fileProgress = fluid.progress(that.container, {
            selectors: {
                displayElement: ".file-progress", 
        		label: ".file-progress-text",
                indicator: ".file-progress"
            }
	    });
        
        that.totalProgress  = fluid.progress(that.container, {
            selectors: {
                progressBar: ".fluid-scroller-table-foot",
                displayElement: ".total-progress", 
        		label: ".total-file-progress",
                indicator: ".total-progress"
            }
	    });

        bindDOMEvents(that);
        bindModelEvents(that);
    };
    
    /**
     * Instantiates a new Uploader component.
     * 
     * @param {Object} container the DOM element in which the Uploader lives
     * @param {Object} options configuration options for the component.
     */
    fluid.uploader = function (container, options) {
        var that = fluid.initView("fluid.uploader", container, options);
        
        /**
         * Refreshes the CSS states for the Uploader based on actual states in the model.
         */
        that.refreshView = function () {
            refreshView(that);
        };
        
        setupUploader(that);
        return that;  
    };
    
    /**
     * Pretty prints a file's size, converting from bytes to kilobytes or megabytes.
     * 
     * @param {Number} bytes the files size, specified as in number bytes.
     */
    fluid.uploader.formatFileSize = function (bytes) {
        if (typeof bytes === "number") {
            if (bytes === 0) {
                return "0.0 KB";
            } else if (bytes > 0) {
                if (bytes < 1048576) {
                    return (Math.ceil(bytes / 1024 * 10) / 10).toFixed(1) + " KB";
                }
                else {
                    return (Math.ceil(bytes / 1048576 * 10) / 10).toFixed(1) + " MB";
                }
            }
        }
        return "";
    };
    
    fluid.defaults("fluid.uploader", {
        uploadManager: {
            type: "fluid.swfUploadManager"
        },
        
        fileQueueView: {
            type: "fluid.fileQueueView"
        },
        
        selectors: {
            fileQueue: ".fluid-uploader-queue",
            browseButton: ".fluid-uploader-browse",
            uploadButton: ".fluid-uploader-upload",
            resumeButton: ".fluid-uploader-resume",
            pauseButton: ".fluid-uploader-pause",
            totalFileProgressBar: ".fluid-scroller-table-foot",
            stateDisplay: "div:first"
        },
        
        styles: {
            queueEmptyState: "start",
            queueLoadedState: "loaded",
            queueReloadedState: "reloaded",
            queueDoneState: "done",
            queueBrowsingState: "browsing",
            queueUploadingState: "uploading"
        },
        
        events: {
            afterReady: null,
            onFileDialog: null,
            afterFileQueued: null,
            afterFileRemoved: null,
            onQueueError: null,
            afterFileDialog: null,
            onUploadStart: null,
            onFileStart: null,
            onFileProgress: null,
            onFileError: null,
            onFileSuccess: null,
            afterFileComplete: null,
            afterUploadComplete: null
        },

        strings: {
            progress: {
                pausedLabel: "Paused at: %curFileN of %totalFilesN files (%currBytes of %totalBytes)",
                toUploadLabel: "To upload: %fileCount %fileLabel (%totalBytes)", 
                totalProgressLabel: "Uploading: %curFileN of %totalFilesN files (%currBytes of %totalBytes)", 
                completedLabel: "Uploaded: %curFileN files (%totalCurrBytes)",
                singleFile: "file",
                pluralFiles: "files"
            },
            buttons: {
                addMore: "Add More"
            }
        }
    });
    
})(jQuery, fluid_0_6);
