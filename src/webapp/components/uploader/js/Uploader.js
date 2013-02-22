/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global window, fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

/************
 * Uploader *
 ************/

(function ($, fluid) {

    var fileOrFiles = function (that, numFiles) {
        return (numFiles === 1) ? that.options.strings.progress.singleFile : 
            that.options.strings.progress.pluralFiles;
    };
    
    var enableElement = function (that, elm) {
        elm.prop("disabled", false);
        elm.removeClass(that.options.styles.dim);
    };
    
    var disableElement = function (that, elm) {
        elm.prop("disabled", true);
        elm.addClass(that.options.styles.dim);
    };
    
    var showElement = function (that, elm) {
        elm.removeClass(that.options.styles.hidden);
    };
     
    var hideElement = function (that, elm) {
        elm.addClass(that.options.styles.hidden);
    };
    
    var maxFilesUploaded = function (that) {
        var fileUploadLimit = that.queue.getUploadedFiles().length + that.queue.getReadyFiles().length + that.queue.getErroredFiles().length;
        return (fileUploadLimit === that.options.queueSettings.fileUploadLimit);
    };    
    
    var setTotalProgressStyle = function (that, didError) {
        didError = didError || false;
        var indicator = that.totalProgress.indicator;
        indicator.toggleClass(that.options.styles.totalProgress, !didError);
        indicator.toggleClass(that.options.styles.totalProgressError, didError);
    };
    
    var setStateEmpty = function (that) {
        disableElement(that, that.locate("uploadButton"));
        
        // If the queue is totally empty, treat it specially.
        if (that.queue.files.length === 0) { 
            that.locate("browseButtonText").text(that.options.strings.buttons.browse);
            that.locate("browseButton").removeClass(that.options.styles.browseButton);
            showElement(that, that.locate("instructions"));
        }
    };
    
    // Only enable the browse button if the fileUploadLimit 
    // has not been reached
    var enableBrowseButton = function (that) {
        if (!maxFilesUploaded(that)) {
            enableElement(that, that.locate("browseButton"));
            that.strategy.local.enableBrowseButton();            
        }
    };
    
    var setStateDone = function (that) {
        disableElement(that, that.locate("uploadButton"));
        hideElement(that, that.locate("pauseButton"));
        showElement(that, that.locate("uploadButton"));
        enableBrowseButton(that);
    };

    var setStateLoaded = function (that) {
        that.locate("browseButtonText").text(that.options.strings.buttons.addMore);
        that.locate("browseButton").addClass(that.options.styles.browseButton);
        hideElement(that, that.locate("pauseButton"));
        showElement(that, that.locate("uploadButton"));
        enableElement(that, that.locate("uploadButton"));
        hideElement(that, that.locate("instructions"));
        that.totalProgress.hide();
        enableBrowseButton(that);
    };
    
    var setStateUploading = function (that) {
        that.totalProgress.hide(false, false);
        setTotalProgressStyle(that);
        hideElement(that, that.locate("uploadButton"));
        disableElement(that, that.locate("browseButton"));
        that.strategy.local.disableBrowseButton();
        enableElement(that, that.locate("pauseButton"));
        showElement(that, that.locate("pauseButton"));
        that.locate(that.options.focusWithEvent.afterUploadStart).focus();
    };

    var setStateFull = function (that) {        
        that.locate("browseButtonText").text(that.options.strings.buttons.addMore);
        that.locate("browseButton").addClass(that.options.styles.browseButton);
        hideElement(that, that.locate("pauseButton"));
        showElement(that, that.locate("uploadButton"));
        enableElement(that, that.locate("uploadButton"));
        disableElement(that, that.locate("browseButton"));        
        that.strategy.local.disableBrowseButton();
        hideElement(that, that.locate("instructions"));
        that.totalProgress.hide();
    };    
    
    var renderUploadTotalMessage = function (that) {
        // Render template for the total file status message.
        var numReadyFiles = that.queue.getReadyFiles().length;
        var bytesReadyFiles = that.queue.sizeOfReadyFiles();
        var fileLabelStr = fileOrFiles(that, numReadyFiles);

        var totalStateStr = fluid.stringTemplate(that.options.strings.progress.toUploadLabel, {
            fileCount: numReadyFiles, 
            fileLabel: fileLabelStr, 
            totalBytes: fluid.uploader.formatFileSize(bytesReadyFiles)
        });
        that.locate("totalFileStatusText").html(totalStateStr);
    };
    
    var renderFileUploadLimit = function (that) {
        if (that.options.queueSettings.fileUploadLimit > 0) {
            var fileUploadLimitText = fluid.stringTemplate(that.options.strings.progress.fileUploadLimitLabel, {
                fileUploadLimit: that.options.queueSettings.fileUploadLimit, 
                fileLabel: fileOrFiles(that, that.options.queueSettings.fileUploadLimit) 
            });
            that.locate("fileUploadLimitText").html(fileUploadLimitText);
        }
    };
        
    var updateTotalProgress = function (that) {
        var batch = that.queue.currentBatch;
        var totalPercent = fluid.uploader.derivePercent(batch.totalBytesUploaded, batch.totalBytes);
        var numFilesInBatch = batch.files.length;
        var fileLabelStr = fileOrFiles(that, numFilesInBatch);
        
        var totalProgressStr = fluid.stringTemplate(that.options.strings.progress.totalProgressLabel, {
            curFileN: batch.fileIdx, 
            totalFilesN: numFilesInBatch, 
            fileLabel: fileLabelStr,
            currBytes: fluid.uploader.formatFileSize(batch.totalBytesUploaded), 
            totalBytes: fluid.uploader.formatFileSize(batch.totalBytes)
        });  
        that.totalProgress.update(totalPercent, totalProgressStr);
    };
    
    var updateTotalAtCompletion = function (that) {
        var numErroredFiles = that.queue.getErroredFiles().length;
        var numTotalFiles = that.queue.files.length;
        var fileLabelStr = fileOrFiles(that, numTotalFiles);
        var errorStr = "";
        
        // if there are errors then change the total progress bar
        // and set up the errorStr so that we can use it in the totalProgressStr
        if (numErroredFiles > 0) {
            var errorLabelString = (numErroredFiles === 1) ? that.options.strings.progress.singleError : 
                                                             that.options.strings.progress.pluralErrors;
            setTotalProgressStyle(that, true);
            errorStr = fluid.stringTemplate(that.options.strings.progress.numberOfErrors, {
                errorsN: numErroredFiles,
                errorLabel: errorLabelString
            });
        }
        
        var totalProgressStr = fluid.stringTemplate(that.options.strings.progress.completedLabel, {
            curFileN: that.queue.getUploadedFiles().length, 
            totalFilesN: numTotalFiles,
            errorString: errorStr,
            fileLabel: fileLabelStr,
            totalCurrBytes: fluid.uploader.formatFileSize(that.queue.sizeOfUploadedFiles())
        });
        
        that.totalProgress.update(100, totalProgressStr);
    };

    /*
     * Summarizes the status of all the files in the file queue.  
     */
    var updateQueueSummaryText = function (that) {
        var fileQueueTable = that.locate("fileQueue");        
        if (that.queue.files.length === 0) {
            fileQueueTable.attr("summary", that.options.strings.queue.emptyQueue);
        } else {
            var queueSummary = fluid.stringTemplate(that.options.strings.queue.queueSummary, {
                totalUploaded: that.queue.getUploadedFiles().length, 
                totalInUploadQueue: that.queue.files.length - that.queue.getUploadedFiles().length
            });
            fileQueueTable.attr("summary", queueSummary);
        }
    };
    
    var bindDOMEvents = function (that) {
        that.locate("uploadButton").click(function () {
            that.start();
        });

        that.locate("pauseButton").click(function () {
            that.stop();
        });
    };

    var updateStateAfterFileDialog = function (that) {
        var queueLength = that.queue.getReadyFiles().length;
        if (queueLength > 0) {
            if (queueLength === that.options.queueSettings.fileUploadLimit) {
                setStateFull(that);
            } else {
                setStateLoaded(that);
            }
            renderUploadTotalMessage(that);
            that.locate(that.options.focusWithEvent.afterFileDialog).focus();
            updateQueueSummaryText(that);
        }
    };
    
    var updateStateAfterFileRemoval = function (that) {
        if (that.queue.getReadyFiles().length === 0) {
            setStateEmpty(that);
        } else {
            setStateLoaded(that);
        }
        renderUploadTotalMessage(that);
        updateQueueSummaryText(that);
    };
    
    var updateStateAfterCompletion = function (that) {
        if (that.queue.getReadyFiles().length === 0) {
            setStateDone(that);
        } else {
            setStateLoaded(that);
        }
        updateTotalAtCompletion(that);
        updateQueueSummaryText(that);
    }; 
    
    var uploadNextOrFinish = function (that) {
        if (that.queue.shouldUploadNextFile()) {
            that.strategy.remote.uploadNextFile();
        } else {
            that.events.afterUploadComplete.fire(that.queue.currentBatch.files);
            that.queue.clearCurrentBatch();
        }        
    };
    
    var bindEvents = function (that) {
        that.events.afterFileDialog.addListener(function () {
            updateStateAfterFileDialog(that);
        });
        
        that.events.afterFileQueued.addListener(function (file) {
            that.queue.addFile(file); 
        });
        
        that.events.onFileRemoved.addListener(function (file) {
            that.removeFile(file);
        });
        
        that.events.afterFileRemoved.addListener(function () {
            updateStateAfterFileRemoval(that);
        });
        
        that.events.onUploadStart.addListener(function () {
            setStateUploading(that);
        });
        
        that.events.onUploadStop.addListener(function () {
            that.locate(that.options.focusWithEvent.onUploadStop).focus();
        });
        
        that.events.onFileStart.addListener(function (file) {
            file.filestatus = fluid.uploader.fileStatusConstants.IN_PROGRESS;
            that.queue.startFile();
        });
        
        that.events.onFileProgress.addListener(function (file, currentBytes, totalBytes) {
            that.queue.updateBatchStatus(currentBytes);
            updateTotalProgress(that); 
        });
        
        that.events.onFileComplete.addListener(function (file) {
            that.queue.finishFile(file);
            that.events.afterFileComplete.fire(file); 
            uploadNextOrFinish(that);
        });
        
        that.events.onFileSuccess.addListener(function (file) {
            file.filestatus = fluid.uploader.fileStatusConstants.COMPLETE;
            if (that.queue.currentBatch.bytesUploadedForFile === 0) {
                that.queue.currentBatch.totalBytesUploaded += file.size;
            }
            
            updateTotalProgress(that); 
        });
        
        that.events.onFileError.addListener(function (file, error) {
            if (error === fluid.uploader.errorConstants.UPLOAD_STOPPED) {
                file.filestatus = fluid.uploader.fileStatusConstants.CANCELLED;
                return;
            } else {
              // TODO: Avoid reaching directly into the filequeue and manipulating its state from here
                file.filestatus = fluid.uploader.fileStatusConstants.ERROR;
                if (that.queue.isUploading) {
                    that.queue.currentBatch.totalBytesUploaded += file.size;
                    that.queue.currentBatch.numFilesErrored++;
                    uploadNextOrFinish(that);
                }
            }
        });

        that.events.afterUploadComplete.addListener(function () {
            that.queue.isUploading = false;
            updateStateAfterCompletion(that);
        });
    };
    
    fluid.uploaderImpl = function () {
        fluid.fail("Error creating uploader component - please make sure that a " + 
            "progressiveCheckerForComponent for \"fluid.uploader\" is registered either in the " + 
            "static environment or else is visible in the current component tree");
    };
    
    fluid.enhance.check({
        "fluid.browser.supportsBinaryXHR": "fluid.enhance.supportsBinaryXHR",
        "fluid.browser.supportsFormData": "fluid.enhance.supportsFormData",
        "fluid.browser.supportsFlash": "fluid.enhance.supportsFlash"
    });
    
    /**
     * Instantiates a new Uploader component.
     * 
     * @param {Object} container the DOM element in which the Uploader lives
     * @param {Object} options configuration options for the component.
     */
    
    fluid.defaults("fluid.uploader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            uploaderContext: {
                type: "fluid.progressiveCheckerForComponent",
                options: {componentName: "fluid.uploader"}
            },
            uploaderImpl: {
                type: "fluid.uploaderImpl",
                container: "{uploader}.container",
            }
        },
        returnedPath: "uploaderImpl", // compatibility courtesy for manual construction
        distributeOptions: {
            source: "{that}.options",
            exclusions: ["components.uploaderContext", "components.uploaderImpl"],
            target: "{that > uploaderImpl}.options"
        },
        progressiveCheckerOptions: {
            checks: [
                {
                    feature: "{fluid.browser.supportsBinaryXHR}",
                    contextName: "fluid.uploader.html5"
                },
                {
                    feature: "{fluid.browser.supportsFlash}",
                    contextName: "fluid.uploader.swfUpload"
                }
            ],
            defaultContextName: "fluid.uploader.singleFile"
        }
    });

    fluid.uploader.demoTypeTag = function (demo) {
        return demo ? "fluid.uploader.demo" : "fluid.uploader.live";
    };

    // Implementation of standard public invoker methods
    
    fluid.uploader.browse = function (queue, localStrategy) {
        if (!queue.isUploading) {
            localStrategy.browse();
        }    
    };

    fluid.uploader.removeFile = function (queue, localStrategy, afterFileRemoved, file) {
        queue.removeFile(file);
        localStrategy.removeFile(file);
        afterFileRemoved.fire(file);      
    };

    fluid.uploader.start = function (queue, remoteStrategy, onUploadStart) {
        queue.start();
        onUploadStart.fire(queue.currentBatch.files);           
        remoteStrategy.uploadNextFile();      
    };
    
    fluid.uploader.stop = function (remoteStrategy, onUploadStop) {
        onUploadStop.fire();
        remoteStrategy.stop();      
    };
    
    /**
     * Multiple file Uploader implementation. Use fluid.uploader() for IoC-resolved, progressively
     * enhanceable Uploader, or call this directly if you don't want support for old-style single uploads
     *
     * @param {jQueryable} container the component's container
     * @param {Object} options configuration options
     */
    fluid.defaults("fluid.uploader.multiFileUploader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
                
        invokers: {
            /**
             * Opens the native OS browse file dialog.
             */
            browse: {
                funcName: "fluid.uploader.browse",
                args: ["{that}.queue", "{that}.strategy.local"]
            },
            /**
             * Removes the specified file from the upload queue.
             * 
             * @param {File} file the file to remove
             */
            removeFile: {
                funcName: "fluid.uploader.removeFile",
                args: ["{that}.queue", "{that}.strategy.local", "{that}.events.afterFileRemoved", "{arguments}.0"]  
            },
            /**
             * Starts uploading all queued files to the server.
             */
            start: {
                funcName: "fluid.uploader.start",
                args: ["{that}.queue", "{that}.strategy.remote", "{that}.events.onUploadStart"]
            },
            /**
             * Cancels an in-progress upload.
             */
            stop: {
                funcName: "fluid.uploader.stop",
                args: ["{that}.strategy.remote", "{that}.events.onUploadStop"]
            },
            statusUpdater: {
                funcName: "fluid.uploader.ariaLiveRegionUpdater",
                args: ["{that}.dom.statusRegion", "{that}.dom.totalFileStatusText", "{that}.events"]
            }
        },
        
        components: {
            demoTag: {
                type: "fluid.typeFount",
                options: {
                    targetTypeName: {
                        expander: {
                            funcName: "fluid.uploader.demoTypeTag",
                            args: "{multiFileUploader}.options.demo"
                        }
                    }
                }  
            },
            queue: {
                type: "fluid.uploader.fileQueue"  
            },
            strategy: {
                type: "fluid.uploader.progressiveStrategy"
            },
            errorPanel: {
                type: "fluid.uploader.errorPanel"
            },

            fileQueueView: {
                type: "fluid.uploader.fileQueueView",
                options: {
                    model: "{multiFileUploader}.queue.files",
                    uploaderContainer: "{multiFileUploader}.container"
                }
            },
            
            totalProgress: {
                type: "fluid.uploader.totalProgressBar",
                options: {
                    selectors: {
                        progressBar: ".flc-uploader-queue-footer",
                        displayElement: ".flc-uploader-total-progress", 
                        label: ".flc-uploader-total-progress-text",
                        indicator: ".flc-uploader-total-progress",
                        ariaElement: ".flc-uploader-total-progress"
                    }
                }
            }
        },
        
        queueSettings: {
            uploadURL: "",
            postParams: {},
            fileSizeLimit: "20480",
            fileTypes: null,
            fileTypesDescription: null,
            fileUploadLimit: 0,
            fileQueueLimit: 0
        },

        demo: false,
        
        selectors: {
            fileQueue: ".flc-uploader-queue",
            browseButton: ".flc-uploader-button-browse",
            browseButtonText: ".flc-uploader-button-browse-text",
            uploadButton: ".flc-uploader-button-upload",
            pauseButton: ".flc-uploader-button-pause",
            totalFileStatusText: ".flc-uploader-total-progress-text",
            fileUploadLimitText: ".flc-uploader-upload-limit-text",
            instructions: ".flc-uploader-browse-instructions",
            statusRegion: ".flc-uploader-status-region",
            errorsPanel: ".flc-uploader-errorsPanel"
        },

        // Specifies a selector name to move keyboard focus to when a particular event fires.
        // Event listeners must already be implemented to use these options.
        focusWithEvent: {
            afterFileDialog: "uploadButton",
            afterUploadStart: "pauseButton",
            onUploadStop: "uploadButton"
        },
        
        styles: {
            disabled: "fl-uploader-disabled",
            hidden: "fl-uploader-hidden",
            dim: "fl-uploader-dim",
            totalProgress: "fl-uploader-total-progress-okay",
            totalProgressError: "fl-uploader-total-progress-errored",
            browseButton: "fl-uploader-browseMore"
        },
        
        events: {
            afterReady: null,
            onFileDialog: null,
            onFilesSelected: null,
            onFileQueued: null,
            afterFileQueued: null,
            onFileRemoved: null,
            afterFileRemoved: null,
            afterFileDialog: null,
            onUploadStart: null,
            onUploadStop: null,
            onFileStart: null,
            onFileProgress: null,
            onFileError: null,
            onQueueError: null,
            onFileSuccess: null,
            onFileComplete: null,
            afterFileComplete: null,
            afterUploadComplete: null
        },

        strings: {
            progress: {
                fileUploadLimitLabel: "%fileUploadLimit %fileLabel maximum",
                toUploadLabel: "To upload: %fileCount %fileLabel (%totalBytes)", 
                totalProgressLabel: "Uploading: %curFileN of %totalFilesN %fileLabel (%currBytes of %totalBytes)", 
                completedLabel: "Uploaded: %curFileN of %totalFilesN %fileLabel (%totalCurrBytes)%errorString",
                numberOfErrors: ", %errorsN %errorLabel",
                singleFile: "file",
                pluralFiles: "files",
                singleError: "error",
                pluralErrors: "errors"
            },
            buttons: {
                browse: "Browse Files",
                addMore: "Add More",
                stopUpload: "Stop Upload",
                cancelRemaning: "Cancel remaining Uploads",
                resumeUpload: "Resume Upload"
            },
            queue: {
                emptyQueue: "File list: No files waiting to be uploaded.",
                queueSummary: "File list: %totalUploaded files uploaded, %totalInUploadQueue file waiting to be uploaded." 
            }
        }
    });
    
    fluid.uploader.multiFileUploader.finalInit = function (that) {
        // Upload button should not be enabled until there are files to upload
        disableElement(that, that.locate("uploadButton"));
        bindDOMEvents(that);
        bindEvents(that);
        
        updateQueueSummaryText(that);
        that.statusUpdater();
        renderFileUploadLimit(that);
        
        // Uploader uses application-style keyboard conventions, so give it a suitable role.
        that.container.attr("role", "application");
    };
    
    fluid.demands("fluid.uploader.totalProgressBar", "fluid.uploader.multiFileUploader", {
        funcName: "fluid.progress",
        container: "{multiFileUploader}.container"
    });
    
    /** Demands blocks for binding to fileQueueView **/
            
    fluid.demands("fluid.uploader.fileQueueView", "fluid.uploader.multiFileUploader", {
        container: "{multiFileUploader}.dom.fileQueue",
        options: {
            events: {
                onFileRemoved: "{multiFileUploader}.events.onFileRemoved"
            }
        }
    });
        
    fluid.demands("fluid.uploader.fileQueueView.eventBinder", [
        "fluid.uploader.multiFileUploader",
        "fluid.uploader.fileQueueView"
    ], {
        options: {
            listeners: {
                "{multiFileUploader}.events.afterFileQueued": "{fileQueueView}.addFile",
                "{multiFileUploader}.events.onUploadStart": "{fileQueueView}.prepareForUpload",
                "{multiFileUploader}.events.onFileStart": "{fileQueueView}.showFileProgress",
                "{multiFileUploader}.events.onFileProgress": "{fileQueueView}.updateFileProgress",
                "{multiFileUploader}.events.onFileSuccess": "{fileQueueView}.markFileComplete",
                "{multiFileUploader}.events.onFileError": "{fileQueueView}.showErrorForFile",
                "{multiFileUploader}.events.afterFileComplete": "{fileQueueView}.hideFileProgress",
                "{multiFileUploader}.events.afterUploadComplete": "{fileQueueView}.refreshAfterUpload"
            }
        }
    });
        
   /**
    * Pretty prints a file's size, converting from bytes to kilobytes or megabytes.
    * 
    * @param {Number} bytes the files size, specified as in number bytes.
    */
    fluid.uploader.formatFileSize = function (bytes) {
        if (typeof (bytes) === "number") {
            if (bytes === 0) {
                return "0.0 KB";
            } else if (bytes > 0) {
                if (bytes < 1048576) {
                    return (Math.ceil(bytes / 1024 * 10) / 10).toFixed(1) + " KB";
                } else {
                    return (Math.ceil(bytes / 1048576 * 10) / 10).toFixed(1) + " MB";
                }
            }
        }
        return "";
    };

    fluid.uploader.derivePercent = function (num, total) {
        return Math.round((num * 100) / total);
    };
     
    // TODO: Refactor this to be a general ARIA utility
    fluid.uploader.ariaLiveRegionUpdater = function (statusRegion, totalFileStatusText, events) {
        statusRegion.attr("role", "log");     
        statusRegion.attr("aria-live", "assertive");
        statusRegion.attr("aria-relevant", "text");
        statusRegion.attr("aria-atomic", "true");

        var regionUpdater = function () {
            statusRegion.text(totalFileStatusText.text());
        };

        events.afterFileDialog.addListener(regionUpdater);
        events.afterFileRemoved.addListener(regionUpdater);
        events.afterUploadComplete.addListener(regionUpdater);
    };
    
    /**************************************************
     * Error constants for the Uploader               *
     * TODO: These are SWFUpload-specific error codes *
     **************************************************/
    fluid.uploader.queueErrorConstants = {
        QUEUE_LIMIT_EXCEEDED:    "queue limit exceeded",
        FILE_EXCEEDS_SIZE_LIMIT: "file exceeds size limit",
        ZERO_BYTE_FILE:          "zero byte file",
        INVALID_FILETYPE:        "invalid filetype"
    };
    
    fluid.uploader.errorConstants = {
        HTTP_ERROR: -200,
        MISSING_UPLOAD_URL: -210,
        IO_ERROR: -220,
        SECURITY_ERROR: -230,
        UPLOAD_LIMIT_EXCEEDED: -240,
        UPLOAD_FAILED: -250,
        SPECIFIED_FILE_ID_NOT_FOUND: -260,
        FILE_VALIDATION_FAILED: -270,
        FILE_CANCELLED: -280,
        UPLOAD_STOPPED: -290
    };
    
    fluid.uploader.fileStatusConstants = {
        QUEUED:      "queued",
        IN_PROGRESS: "in progress",
        ERROR:       "error",
        COMPLETE:    "complete",
        CANCELLED:   "cancelled"
    };

    var toggleVisibility = function (toShow, toHide) {
        // For FLUID-2789: hide() doesn't work in Opera
        if (window.opera) { 
            toShow.show().removeClass("hideUploaderForOpera");
            toHide.show().addClass("hideUploaderForOpera");
        } else {
            toShow.show();
            toHide.hide();
        }
    };

    /**
     * Single file Uploader implementation. Use fluid.uploader() for IoC-resolved, progressively
     * enhanceable Uploader, or call this directly if you only want a standard single file uploader.
     * But why would you want that?
     *
     * @param {jQueryable} container the component's container
     * @param {Object} options configuration options
     */

    fluid.defaults("fluid.uploader.singleFileUploader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        selectors: {
            basicUpload: ".fl-progEnhance-basic"
        }
    });

    fluid.uploader.singleFileUploader.finalInit = function (that) {
        // TODO: direct DOM fascism that will fail with multiple uploaders on a single page.
        toggleVisibility($(that.options.selectors.basicUpload), that.container);
    };

    fluid.demands("fluid.uploaderImpl", "fluid.uploader.singleFile", {
        funcName: "fluid.uploader.singleFileUploader"
    });
    
})(jQuery, fluid_1_5);
