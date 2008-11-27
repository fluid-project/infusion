/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    
    var enableElement = function (that, elm) {
        elm.removeAttr("disabled");
        elm.removeClass(that.options.styles.dim);
    };
    
    var disableElement = function (that, elm) {
        elm.attr("disabled", "disabled");
        elm.addClass(that.options.styles.dim);
    };
    
    var showElement = function (that, elm) {
        elm.removeClass(that.options.styles.hidden);
    };
     
    var hideElement = function (that, elm) {
        elm.addClass(that.options.styles.hidden);
    };
    
    var setStateEmpty = function (that) {
        disableElement(that, that.locate("uploadButton"));
        
        // If the queue is totally empty, treat it specially.
        if (that.uploadManager.queue.files.length === 0) { 
            that.locate("browseButton").text(that.options.strings.buttons.browse);
            showElement(that, that.locate("instructions"));
        }
    };
    
    var setStateDone = function (that) {
        disableElement(that, that.locate("uploadButton"));
        enableElement(that, that.locate("browseButton"));
        hideElement(that, that.locate("pauseButton"));
        showElement(that, that.locate("uploadButton"));
    };

    var setStateLoaded = function (that) {
        that.locate("browseButton").text(that.options.strings.buttons.addMore);
        enableElement(that, that.locate("uploadButton"));
        enableElement(that, that.locate("browseButton"));
        hideElement(that, that.locate("instructions"));
    };
    
    var setStateUploading = function (that) {
        hideElement(that, that.locate("cancelButton"));
        hideElement(that, that.locate("uploadButton"));
        showElement(that, that.locate("pauseButton"));
        disableElement(that, that.locate("browseButton"));
    };    
    
    var refreshUploadTotal = function (that) {
        // Render template for the total file status message.
        var numReadyFiles = that.uploadManager.queue.getReadyFiles().length;
        var bytesReadyFiles = that.uploadManager.queue.sizeOfReadyFiles();
        var fileLabelStr = (numReadyFiles === 1) ? that.options.strings.progress.singleFile : 
                                                   that.options.strings.progress.pluralFiles;
                                                   
        var totalStateStr = fluid.stringTemplate(that.options.strings.progress.toUploadLabel, {
            fileCount: numReadyFiles, 
            fileLabel: fileLabelStr, 
            totalBytes: fluid.uploader.formatFileSize(bytesReadyFiles)
        });
        that.locate("totalFileStatusText").html(totalStateStr);
    };
        
    var totalProgressUpdate = function (that) {
        var batch = that.uploadManager.queue.currentBatch;        
        var totalPercent = fluid.uploader.derivePercent(batch.totalBytesUploaded, batch.totalBytes);
             
        var totalProgressStr = fluid.stringTemplate(that.options.strings.progress.totalProgressLabel, {
            curFileN: batch.fileIdx + 1, 
            totalFilesN: batch.files.length, 
            currBytes: fluid.uploader.formatFileSize(batch.bytesUploadedForFile), 
            totalBytes: fluid.uploader.formatFileSize(batch.totalBytes)
        });  
        that.totalProgress.update(totalPercent, totalProgressStr);
    };
        
    var progressComplete = function (that) {
        var uploadedFiles = that.uploadManager.queue.getUploadedFiles();
        
        var totalProgressStr = fluid.stringTemplate(that.options.strings.progress.completedLabel, {
            curFileN: uploadedFiles.length, 
            totalCurrBytes: fluid.uploader.formatFileSize(that.uploadManager.queue.sizeOfUploadedFiles())
        });
        that.totalProgress.update(100, totalProgressStr);
        that.totalProgress.hide();
    };
   
    var bindDOMEvents = function (that) {
        that.locate("browseButton").click(function (evnt) {            
            that.uploadManager.browseForFiles();
            evnt.preventDefault();
        });
        
        that.locate("uploadButton").click(function () {
            that.uploadManager.start();
        });

        that.locate("pauseButton").click(function () {
            that.uploadManager.pause();
        });
    };

    var updateStateAfterFileDialog = function (that) {
        if (that.uploadManager.queue.getReadyFiles().length > 0) {
            setStateLoaded(that);
            refreshUploadTotal(that);
        } 
    };
    
    var updateStateAfterFileRemoval = function (that) {
        if (that.uploadManager.queue.getReadyFiles().length === 0) {
            setStateEmpty(that);
        }
        refreshUploadTotal(that);
    };
    
    var updateStateAfterCompletion = function (that) {
        progressComplete(that);
        setStateDone(that);
    };
    
    var bindModelEvents = function (that) {
        that.events.afterFileDialog.addListener(function () {
            updateStateAfterFileDialog(that);
        });
        
        that.events.afterFileRemoved.addListener(function () {
            updateStateAfterFileRemoval(that);
        });
        
        that.events.onUploadStart.addListener(function () {
            setStateUploading(that);
        });

        that.events.onFileProgress.addListener(function () {
            totalProgressUpdate(that); 
        });
        
        that.events.afterUploadComplete.addListener(function () {
            updateStateAfterCompletion(that);
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
                                                    that.container, 
                                                    that.uploadManager,
                                                    fluid.COMPONENT_OPTIONS]);
        // make this a subcomponent                                                            
        that.totalProgress  = fluid.progress(that.container, {
            selectors: {
                progressBar: ".fluid-scroller-table-foot",
                displayElement: ".total-progress", 
        		label: ".total-file-progress",
                indicator: ".total-progress"
            }
	    });
        
        // Upload button should not be enabled until there are files to upload
        disableElement(that, that.locate("uploadButton"));
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
    
    fluid.uploader.derivePercent = function (num, total) {
        return Math.round((num * 100) / total);
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
            cancelButton: ".fluid-uploader-cancel",
            resumeButton: ".fluid-uploader-resume",
            pauseButton: ".fluid-uploader-pause",
            totalFileProgressBar: ".fluid-scroller-table-foot",
            totalFileStatusText: ".total-file-progress",
            instructions: ".fluid-uploader-browse-instructions"
        },
        
        styles: {
            queueStartState: "start",
            queueEmptyState: "empty",
            queueLoadedState: "loaded",
            queueReloadedState: "reloaded",
            queueDoneState: "done",
            queueBrowsingState: "browsing",
            queueUploadingState: "uploading",
            disabled: "disabled",
            hidden: "hidden",
            dim: "dim"
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
                browse: "Browse Files",
                addMore: "Add More",
                stopUpload: "Stop Upload",
                cancelRemaning: "Cancel remaining Uploads",
                resumeUpload: "Resume Upload"
            }
        }
    });
    
})(jQuery, fluid_0_6);
