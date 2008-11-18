/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    
    /* uploader state 
     * Uploader understands the following states
     * Start [not set by code, set as the initial class of the component]
     * Uploading
     * Browsing
     * 
     */
    
    var setChromeState = function (that, stateClass) {
        that.stateDisplay.attr("className", stateClass);
    };
    
    var enableElement = function (elm) {
        elm.removeAttr("disabled");
    };
    
    var disableElement = function (elm) {
        elm.attr("disabled", "disabled");
    };
     
    /* state: empty */
    var setState_EMPTY = function(that){
        disableElement(that.locate("uploadButton"));
        if (that.uploadManager.queue.files.length === 0) {
            that.locate("browseButton").text(that.options.strings.buttons.browse);
            setChromeState(that, that.options.styles.queueEmptyState);
        }
    };
    
    /* state: done */
    var setState_DONE = function(that){
        disableElement(that.locate("uploadButton"));
        enableElement(that.locate("browseButton"));
        setChromeState(that, that.options.styles.queueDoneState);
    };

    /* state: loaded */
    var setState_LOADED = function(that){
        that.locate("browseButton").text(that.options.strings.buttons.addMore);
        enableElement(that.locate("uploadButton"));
        setChromeState(that, that.options.styles.queueLoadedState);
    };
    
     /* state: uploading */
    var setState_UPLOADING = function(that){
        setChromeState(that, that.options.styles.queueUploadingState);
        disableElement(that.locate("browseButton"));
        disableElement(that.locate("uploadButton"));
    };         
    
    var refreshUploadTotal = function (that) {
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
        var uploadedFiles = that.uploadManager.queue.getUploadedFiles(); // total uploaded files
        
        
        var totalProgressStr = fluid.stringTemplate(that.options.strings.progress.completedLabel, {
            curFileN: uploadedFiles.length, 
            totalCurrBytes: fluid.uploader.formatFileSize(that.uploadManager.queue.sizeOfUploadedFiles())
        });
        
        that.totalProgress.update(100, totalProgressStr);
        
        that.totalProgress.hide();
    };
   

    /* bind events */
   
    var bindDOMEvents = function (that) {
        that.locate("browseButton").click(function (evnt) {            
            that.uploadManager.browseForFiles();
            evnt.preventDefault();
        });
        
        that.locate("uploadButton").click(function () {
            that.uploadManager.start();
        });
    };
        
    var bindModelEvents = function (that) {
        that.events.onFileDialog.addListener(function () {
            that.stateDisplay.addClass(that.options.styles.queueBrowsingState);
        });
        
        that.events.afterFileDialog.addListener(function () {
            that.stateDisplay.removeClass(that.options.styles.queueBrowsingState);
            if (that.uploadManager.queue.getReadyFiles().length > 0) {
                setState_LOADED(that);
            }
            
            refreshUploadTotal(that);
        });
        
        that.events.afterFileRemoved.addListener(function () {
            if (that.uploadManager.queue.getReadyFiles().length === 0) {
                setState_EMPTY(that);
            }
            
            refreshUploadTotal(that);
        });
        
        // Progress
        
        that.events.onUploadStart.addListener(function () {
            setState_UPLOADING(that);
        });

        that.events.onFileProgress.addListener(function () {
            totalProgressUpdate(that); 
        });
        
        that.events.afterUploadComplete.addListener(function () {
            progressComplete(that);
            setState_DONE(that);
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
        
        that.totalProgress  = fluid.progress(that.container, {
            selectors: {
                progressBar: ".fluid-scroller-table-foot",
                displayElement: ".total-progress", 
        		label: ".total-file-progress",
                indicator: ".total-progress"
            }
	    });
        
        // Upload button should not be enabled until there are files to upload
        that.locate("uploadButton").attr("disabled", "disabled");

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
                browse: "Browse Files",
                addMore: "Add More"
            }
        }
    });
    
})(jQuery, fluid_0_6);
