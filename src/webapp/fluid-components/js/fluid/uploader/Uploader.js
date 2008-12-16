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
/*global swfobject*/
/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};


/*******************
 * File Queue View *
 *******************/

(function ($, fluid) {
    
    // Real data binding would be nice to replace these two pairs.
    var rowForFile = function (that, file) {
        return that.locate("fileQueue").find("#" + file.id);
    };
    
    var fileForRow = function (that, row) {
        var files = that.uploadManager.queue.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.id.toString() === row.attr("id")) {
                return file;
            }
        }
        
        return null;
    };
    
    var progressorForFile = function (that, file) {
        var progressId = file.id + "_progress";
        return that.fileProgressors[progressId];
    };
    
    var startFileProgress = function (that, file) {
        var fileRowElm = rowForFile(that, file);
        that.scroller.scrollTo(fileRowElm);
         
        // update the progressor and make sure that it's in position
        var fileProgressor = progressorForFile(that, file);
        fileProgressor.refresh(fileRowElm);
        fileProgressor.show();
    };
        
    var updateFileProgress = function (that, file, fileBytesComplete, fileTotalBytes) {
        var filePercent = fluid.uploader.derivePercent(fileBytesComplete, fileTotalBytes);
        var filePercentStr = filePercent + "%";    
        progressorForFile(that, file).update(filePercent, filePercentStr);
    };
    
    var hideFileProgress = function (that, file) {
        var fileRowElm = rowForFile(that, file);
        progressorForFile(that, file).hide();
        if (file.filestatus === fluid.uploader.fileStatusConstants.COMPLETE) {
            that.locate("fileIconBtn", fileRowElm).removeClass("dim");
        } 
    };
    
    var removeFileAndRow = function (that, file, row) {
        that.uploadManager.removeFile(file);
        row.fadeOut("fast", function () {
            row.remove();
            that.refreshView();   
        }); 
    };
    
    var removeFileForRow = function (that, row) {
        var file = fileForRow(that, row);
        if (!file) return;
        removeFileAndRow(that, file, row);
    };
    
    var removeRowForFile = function (that, file) {
        var row = rowForFile(that, file);
        removeFileAndRow(that, file, row);
    };
     
    var bindHover = function (row, styles) {
        var over = function () {
            if (row.hasClass(styles.ready) && !row.hasClass(styles.uploading)) {
                row.addClass(styles.hover);
            }
        };
        
        var out = function () {
            if (row.hasClass(styles.ready) && !row.hasClass(styles.uploading)) {
                row.removeClass(styles.hover);
            }   
        };
        row.hover(over, out);
    };
    
    var bindDeleteKey = function (that, row) {
        var deleteHandler = function () {
            removeFileForRow(that, row);
        };
       
        fluid.activatable(row, null, {
            additionalBindings: [{
                key: fluid.a11y.keys.DELETE, 
                activateHandler: deleteHandler
            }]
        });
    };
    
    var bindRowHandlers = function (that, row) {
        if ($.browser.msie && $.browser.version < 7) {
            bindHover(row, that.options.styles);
        }
        
        that.locate("fileIconBtn", row).click(function () {
            removeFileForRow(that, row);
        });
        
        bindDeleteKey(that, row);
    };
    
    var createRowFromTemplate = function (that, file) {
        var row = that.locate("rowTemplate").clone();
        that.locate("fileName", row).text(file.name);
        that.locate("fileSize", row).text(fluid.uploader.formatFileSize(file.size));
        that.locate("fileIconBtn", row).addClass(that.options.styles.remove);
        row.attr("id", file.id);
        row.addClass(that.options.styles.ready).addClass(that.options.styles.row);
        bindRowHandlers(that, row);
        
        return row;    
    };
    
    var createProgressorFromTemplate = function (that, file, row) {
        // create a new progress bar for the row and position it
        var rowProgressor = that.locate("rowProgressorTemplate", that.uploadContainer).clone();
        var progressId = file.id + "_progress";
        rowProgressor.attr("id", progressId);
        rowProgressor.css("top", row.position().top);
        rowProgressor.height(row.height()).width(5);
        that.container.after(rowProgressor);
       
        that.fileProgressors[progressId] = fluid.progress(that.uploadContainer, {
            selectors: {
                progressBar: "#" + file.id,
                displayElement: "#" + progressId,
                label: "#" + progressId + " .file-progress-text",
                indicator: "#" + progressId
            }
        });
    };
    
    var addFile = function (that, file) {
        var row = createRowFromTemplate(that, file);
        row.hide();
        that.container.append(row);
        row.fadeIn("slow");
        that.scroller.scrollBottom();
        createProgressorFromTemplate(that, file, row);

        that.refreshView();
    };
    
    var prepareForUpload = function (that) {
        var rowButtons = that.locate("fileIconBtn", that.locate("fileRows"));
        rowButtons.attr("disabled", "disabled");
        rowButtons.addClass("dim");    
    };
        
    var changeRowState = function (row, newState) {
        row.removeClass("ready error").addClass(newState);
    };
    
    var markRowAsComplete = function (that, file) {
        var row = rowForFile(that, file);
        var removeFile = that.locate("fileIconBtn", row);
        removeFile.unbind("click");
        fluid.tabindex(removeFile, -1);
        removeFile.removeClass(that.options.styles.remove);
        changeRowState(row, that.options.styles.uploaded);
        row.attr("title", that.options.strings.status.success);
    };
    
    var showErrorForFile = function (that, file, error) {
        hideFileProgress(that, file);
        if (file.filestatus === fluid.uploader.fileStatusConstants.ERROR) {
            // file errored
            var fileRowElm = rowForFile(that, file);
            changeRowState(fileRowElm, that.options.styles.error);
            // add error information to the title attribute
        }
    };
    
    var bindModelEvents = function (that) {
        that.returnedOptions = {
            listeners: {
                afterFileQueued: that.addFile,
                onUploadStart: that.prepareForUpload,
                onFileStart: that.showFileProgress,
                onFileProgress: that.updateFileProgress,
                onFileSuccess: that.markFileComplete,
                onFileError: that.showErrorForFile,
                afterFileComplete: that.hideFileProgress
            }
        };
    };
    
    var addKeyboardNavigation = function (that) {
        fluid.tabbable(that.container);
        that.selectableContext = fluid.selectable(that.container, {
            selectableSelector: that.options.selectors.fileRows,
            onSelect: function (itemToSelect) {
                $(itemToSelect).addClass(that.options.styles.selected);
            },
            onUnselect: function (selectedItem) {
                $(selectedItem).removeClass(that.options.styles.selected);
            }
        });
    };
    
    var setupFileQueue = function (that, uploadManager) {
        that.uploadManager = uploadManager;
        that.scroller = fluid.scroller(that.container);
        addKeyboardNavigation(that); 
        bindModelEvents(that);
    };
    
    /**
     * Creates a new File Queue view.
     * 
     * @param {jQuery|selector} container the file queue's container DOM element
     * @param {UploadManager} uploadManager an upload manager model instance
     * @param {Object} options configuration options for the view
     */
    fluid.fileQueueView = function (container, parentContainer, uploadManager, options) {
        var that = fluid.initView("fluid.fileQueueView", container, options);
        that.uploadContainer = parentContainer;
        that.fileProgressors = {};
        
        that.addFile = function (file) {
            addFile(that, file);
        };
        
        that.removeFile = function (file) {
            removeRowForFile(that, file);
        };
        
        that.prepareForUpload = function () {
            prepareForUpload(that);
        };
        
        that.showFileProgress = function (file) {
            startFileProgress(that, file);
        };
        
        that.updateFileProgress = function (file, fileBytesComplete, fileTotalBytes) {
            updateFileProgress(that, file, fileBytesComplete, fileTotalBytes); 
        };
        
        that.markFileComplete = function (file) {
            progressorForFile(that, file).update(100, "100%");
            markRowAsComplete(that, file);
        };
        
        that.showErrorForFile = function (file, error) {
            showErrorForFile(that, file, error);
        };
        
        that.hideFileProgress = function (file) {
            hideFileProgress(that, file);
        };
        
        that.refreshView = function () {
            that.scroller.refreshView();
            that.selectableContext.refresh();
        };
        
        setupFileQueue(that, uploadManager);     
        return that;
    };
    
    fluid.defaults("fluid.fileQueueView", {
        selectors: {
            fileRows: ".row",
            fileName: ".fileName",
            fileSize: ".fileSize",
            fileIconBtn: ".iconBtn",            
                  
            rowTemplate: "#queue-row-tmplt",
            rowProgressorTemplate: "#row-progressor-tmplt"
        },
        
        styles: {
            row: "row",
            ready: "ready",
            uploading: "uploading",
            hover: "hover",
            selected: "selected",
            uploaded: "uploaded",
            error: "error",
            remove: "removeFile"
        },
        
        strings: {
            progress: {
                toUploadLabel: "To upload: %fileCount %fileLabel (%totalBytes)", 
                singleFile: "file",
                pluralFiles: "files"
            },
            status: {
                success: "File Uploaded",
                error: "File Upload Error"
            }
        }
    });
   
})(jQuery, fluid_0_6);


/************
 * Uploader *
 ************/

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
        hideElement(that, that.locate("pauseButton"));
        showElement(that, that.locate("uploadButton"));
        enableElement(that, that.locate("uploadButton"));
        enableElement(that, that.locate("browseButton"));
        hideElement(that, that.locate("instructions"));
    };
    
    var setStateUploading = function (that) {
        hideElement(that, that.locate("uploadButton"));
        disableElement(that, that.locate("browseButton"));
        enableElement(that, that.locate("pauseButton"));
        showElement(that, that.locate("pauseButton"));
    };    
    
    var renderUploadTotalMessage = function (that) {
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
        
    var updateTotalProgress = function (that) {
        var batch = that.uploadManager.queue.currentBatch;
        var totalPercent = fluid.uploader.derivePercent(batch.totalBytesUploaded, batch.totalBytes);
             
        var totalProgressStr = fluid.stringTemplate(that.options.strings.progress.totalProgressLabel, {
            curFileN: batch.fileIdx + 1, 
            totalFilesN: batch.files.length, 
            currBytes: fluid.uploader.formatFileSize(batch.totalBytesUploaded), 
            totalBytes: fluid.uploader.formatFileSize(batch.totalBytes)
        });  
        that.totalProgress.update(totalPercent, totalProgressStr);
    };
        
    var hideTotalProgress = function (that) {
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
            that.uploadManager.stop();
        });
    };

    var updateStateAfterFileDialog = function (that) {
        if (that.uploadManager.queue.getReadyFiles().length > 0) {
            setStateLoaded(that);
            renderUploadTotalMessage(that);
        } 
    };
    
    var updateStateAfterFileRemoval = function (that) {
        if (that.uploadManager.queue.getReadyFiles().length === 0) {
            setStateEmpty(that);
        }
        renderUploadTotalMessage(that);
    };
    
    var updateStateAfterError = function (that) {
        that.totalProgress.hide();
        setStateLoaded(that);
    };
    
    var updateStateAfterCompletion = function (that) {
        hideTotalProgress(that);
        if (that.uploadManager.queue.getReadyFiles().length === 0) {
            setStateDone(that);
        } else {
            setStateLoaded(that);
        }
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
            updateTotalProgress(that); 
        });
        
        that.events.onFileError.addListener(function (file, error, message) {
            if (error === fluid.uploader.errorConstants.UPLOAD_STOPPED) {
                updateStateAfterError(that);
            }
        });

        that.events.afterUploadComplete.addListener(function () {
            updateStateAfterCompletion(that);
        });
    };
   
    var setupUploader = function (that) {
        // Instantiate the upload manager, file queue view, and total file progress bar,
        // passing them smaller chunks of the overall options for the uploader.
        that.decorators = fluid.initSubcomponents(that, "decorators", [that, fluid.COMPONENT_OPTIONS]);
        that.uploadManager = fluid.initSubcomponent(that, 
                                                    "uploadManager", 
                                                    [that.events, fluid.COMPONENT_OPTIONS]);
        that.fileQueueView = fluid.initSubcomponent(that, 
                                                    "fileQueueView", 
                                                    [that.locate("fileQueue"),
                                                    that.container, 
                                                    that.uploadManager,
                                                    fluid.COMPONENT_OPTIONS]); 
        that.totalProgress = fluid.initSubcomponent(that,
                                                    "totalProgressBar",
                                                    [that.container, fluid.COMPONENT_OPTIONS]);
        
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
     * Instantiates a new Uploader component in the progressive enhancement style.
     * This mode requires another DOM element to be present, the element that is to be enhanced.
     * This method checks to see if the correct version of Flash is present, and will only
     * create the Uploader component if so.
     * 
     * @param {Object} container the DOM element in which the Uploader component lives
     * @param {Object} enhanceable the DOM element to show if the system requirements aren't met
     * @param {Object} options configuration options for the component
     */
    fluid.progressiveEnhanceableUploader = function (container, enhanceable, options) {
        enhanceable = fluid.container(enhanceable);
        container = fluid.container(container);
        
        if (swfobject.getFlashPlayerVersion().major > 8) {
            container.show();
            return fluid.uploader(container, options);
        } else {
            enhanceable.show();
        }
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
        decorators: {
            type: "fluid.swfUploadSetupDecorator"
        },
        
        uploadManager: {
            type: "fluid.swfUploadManager"
        },
        
        fileQueueView: {
            type: "fluid.fileQueueView"
        },
        
        totalProgressBar: {
            type: "fluid.progress",
            options: {
                selectors: {
                    progressBar: ".fl-scroller-table-foot",
                    displayElement: ".total-progress", 
                    label: ".total-file-progress",
                    indicator: ".total-progress"
                }
            }
        },
        
        selectors: {
            fileQueue: ".fl-uploader-queue",
            browseButton: ".fl-uploader-browse",
            uploadButton: ".fl-uploader-upload",
            resumeButton: ".fl-uploader-resume",
            pauseButton: ".fl-uploader-pause",
            totalFileProgressBar: ".fl-scroller-table-foot",
            totalFileStatusText: ".total-file-progress",
            instructions: ".fl-uploader-browse-instructions"
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
        QUEUED: -1,
        IN_PROGRESS: -2,
        ERROR: -3,
        COMPLETE: -4,
        CANCELLED: -5
    };
    
})(jQuery, fluid_0_6);
