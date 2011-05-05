/*
Copyright 2010-2011 OCAD University 

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global FormData, fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {

    fluid.demands("fluid.uploaderImpl", "fluid.uploader.html5", {
        funcName: "fluid.uploader.multiFileUploader"
    });
    
    fluid.demands("fluid.uploader.progressiveStrategy", "fluid.uploader.html5", {
        funcName: "fluid.uploader.html5Strategy"
    });
    
    fluid.defaults("fluid.uploader.html5Strategy", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            local: {
                type: "fluid.uploader.local",
                options: {
                    queueSettings: "{multiFileUploader}.options.queueSettings",
                    events: {
                        onFileDialog: "{multiFileUploader}.events.onFileDialog",
                        afterFileDialog: "{multiFileUploader}.events.afterFileDialog",
                        afterFileQueued: "{multiFileUploader}.events.afterFileQueued",
                        onQueueError: "{multiFileUploader}.events.onQueueError"
                    }
                }
            },
            
            remote: {
                type: "fluid.uploader.remote",
                options: {
                    queueSettings: "{multiFileUploader}.options.queueSettings",
                    events: {
                        afterReady: "{multiFileUploader}.events.afterReady",
                        onFileStart: "{multiFileUploader}.events.onFileStart",
                        onFileProgress: "{multiFileUploader}.events.onFileProgress",
                        onFileSuccess: "{multiFileUploader}.events.onFileSuccess",
                        onFileError: "{multiFileUploader}.events.onFileError",
                        onFileComplete: "{multiFileUploader}.events.onFileComplete"
                    }
                }
            }
        },
        
        // Used for browsers that rely on File.getAsBinary(), such as Firefox 3.6,
        // which load the entire file to be loaded into memory.
        // Set this option to a sane limit (100MB) so your users won't experience crashes or slowdowns (FLUID-3937).
        legacyBrowserFileLimit: 100000
    });
    
    
    // TODO: The following two or three functions probably ultimately belong on a that responsible for
    // coordinating with the XHR. A fileConnection object or something similar.
    
    fluid.uploader.html5Strategy.fileSuccessHandler = function (file, events, xhr) {
        events.onFileSuccess.fire(file, xhr.responseText, xhr);
        events.onFileComplete.fire(file);
    };
    
    fluid.uploader.html5Strategy.fileErrorHandler = function (file, events, xhr) {
        events.onFileError.fire(file, 
                                fluid.uploader.errorConstants.UPLOAD_FAILED,
                                xhr.status,
                                xhr);
        events.onFileComplete.fire(file);
    };
    
    fluid.uploader.html5Strategy.fileStopHandler = function (file, events, xhr) {
        events.onFileError.fire(file, 
                                fluid.uploader.errorConstants.UPLOAD_STOPPED,
                                xhr.status,
                                xhr);
        events.onFileComplete.fire(file);
    };
    
    fluid.uploader.html5Strategy.progressTracker = function () {
        var that = {
            previousBytesLoaded: 0
        };
        
        that.getChunkSize = function (bytesLoaded) {
            var chunkSize = bytesLoaded - that.previousBytesLoaded;
            that.previousBytesLoaded = bytesLoaded;
            return chunkSize;
        };
        
        return that;
    };
    
    fluid.uploader.html5Strategy.createFileUploadXHR = function () {
        var xhr = new XMLHttpRequest();
        return xhr;
    };
    
    fluid.uploader.html5Strategy.monitorFileUploadXHR = function (file, events, xhr) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var status = xhr.status;
                // TODO: See a pattern here? Fix it.
                if (status === 200) {
                    fluid.uploader.html5Strategy.fileSuccessHandler(file, events, xhr);
                } else if (status === 0) {
                    fluid.uploader.html5Strategy.fileStopHandler(file, events, xhr);
                } else {
                    fluid.uploader.html5Strategy.fileErrorHandler(file, events, xhr);
                }
            }
        };

        var progressTracker = fluid.uploader.html5Strategy.progressTracker();
        xhr.upload.onprogress = function (pe) {
            events.onFileProgress.fire(file, progressTracker.getChunkSize(pe.loaded), pe.total);
        };
        
        return xhr;
    };
    
    // Set additional POST parameters for xhr  
    var setPostParams =  function (formData, postParams) {
        $.each(postParams,  function (key, value) {
            formData.append(key, value);
        });
    };
    
    fluid.uploader.html5Strategy.remote = function (queue, options) {
        var that = fluid.initLittleComponent("fluid.uploader.html5Strategy.remote", options);
        that.queue = queue;
        that.queueSettings = that.options.queueSettings;
        
        // Upload files in the current batch without exceeding the fileUploadLimit
        that.uploadNextFile = function () {
            var batch = that.queue.currentBatch;
            var file = batch.files[batch.fileIdx];                        
            that.uploadFile(file);
        };
        
        that.uploadFile = function (file) {
            that.events.onFileStart.fire(file);
            var xhr = that.createXHR();
            that.currentXHR = fluid.uploader.html5Strategy.monitorFileUploadXHR(file, that.events, xhr);
            that.doUpload(file, that.queueSettings, that.currentXHR);            
        };

        that.stop = function () {
            that.queue.isUploading = false;
            that.currentXHR.abort();         
        };
        
        fluid.initDependents(that);
        that.events.afterReady.fire();
        return that;
    };
    
    fluid.defaults("fluid.uploader.html5Strategy.remote", {
        gradeNames: ["fluid.eventedComponent"],
        argumentMap: {
            options: 1  
        },                
        invokers: {
            doUpload: "fluid.uploader.html5Strategy.doUpload",
            createXHR: "fluid.uploader.html5Strategy.createFileUploadXHR"
        }
    });
    
    fluid.demands("fluid.uploader.remote", ["fluid.uploader.html5Strategy", "fluid.uploader.live"], {
        funcName: "fluid.uploader.html5Strategy.remote",
        args: [
            "{multiFileUploader}.queue", 
            fluid.COMPONENT_OPTIONS
        ]
    });
    
    var CRLF = "\r\n";
    
    /** 
     * Firefox 4  implementation.  FF4 has implemented a FormData function which
     * conveniently provides easy construct of set key/value pairs representing 
     * form fields and their values.  The FormData is then easily sent using the 
     * XMLHttpRequest send() method.  
     */
    fluid.uploader.html5Strategy.doFormDataUpload = function (file, queueSettings, xhr) {
        var formData = new FormData();
        formData.append("file", file);
        
        setPostParams(formData, queueSettings.postParams);
        
        // set post params here.
        xhr.open("POST", queueSettings.uploadURL, true);
        xhr.send(formData);
    };
    
    fluid.uploader.html5Strategy.generateMultipartBoundary = function () {
        var boundary = "---------------------------";
        boundary += Math.floor(Math.random() * 32768);
        boundary += Math.floor(Math.random() * 32768);
        boundary += Math.floor(Math.random() * 32768);
        return boundary;
    };
    
    fluid.uploader.html5Strategy.generateMultiPartContent = function (boundary, file) {
        var multipart = "";
        multipart += "--" + boundary + CRLF;
        multipart += "Content-Disposition: form-data;" +
            " name=\"fileData\";" + 
            " filename=\"" + file.name + 
            "\"" + CRLF;
        multipart += "Content-Type: " + file.type + CRLF + CRLF;
        multipart += file.getAsBinary(); // Concatting binary data to JS String; yes, FF will handle it.
        multipart += CRLF + "--" + boundary + "--" + CRLF;
        return multipart;
    };
    
    /*
     * Create the multipart/form-data content by hand to send the file
     */
    fluid.uploader.html5Strategy.doManualMultipartUpload = function (file, queueSettings, xhr) {
        var boundary =  fluid.uploader.html5Strategy.generateMultipartBoundary();
        var multipart = fluid.uploader.html5Strategy.generateMultiPartContent(boundary, file);
        
        xhr.open("POST", queueSettings.uploadURL, true);
        xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
        xhr.sendAsBinary(multipart);
    };
    
    // Default configuration for older browsers that don't support FormData
    fluid.demands("fluid.uploader.html5Strategy.doUpload", "fluid.uploader.html5Strategy.remote", {
        funcName: "fluid.uploader.html5Strategy.doManualMultipartUpload",
        args: ["@0", "@1", "@2"]
    });
    
    fluid.demands("fluid.uploader.html5Strategy.createFileUploadXHR", "fluid.uploader.html5Strategy.remote", {
        funcName: "fluid.uploader.html5Strategy.createFileUploadXHR"
    });    
    
    // Configuration for FF4, Chrome, and Safari 4+, all of which support FormData correctly.
    fluid.demands("fluid.uploader.html5Strategy.doUpload", [
        "fluid.uploader.html5Strategy.remote", 
        "fluid.browser.supportsFormData"
    ], {
        funcName: "fluid.uploader.html5Strategy.doFormDataUpload",
        args: ["@0", "@1", "@2"]
    });
    
    fluid.uploader.html5Strategy.local = function (queue, legacyBrowserFileLimit, options) {
        var that = fluid.initLittleComponent("fluid.uploader.html5Strategy.local", options);
        that.queue = queue;
        that.queueSettings = that.options.queueSettings;

        // Add files to the file queue without exceeding the fileUploadLimit and the fileSizeLimit
        // NOTE:  fileSizeLimit set to bytes for HTML5 Uploader (KB for SWF Uploader).  
        that.addFiles = function (files) {
            // TODO: These look like they should be part of a real model.
            var sizeLimit = (legacyBrowserFileLimit || that.queueSettings.fileSizeLimit) * 1024;
            var fileLimit = that.queueSettings.fileUploadLimit;
            var uploaded = that.queue.getUploadedFiles().length;
            var queued = that.queue.getReadyFiles().length;
            var remainingUploadLimit = fileLimit - uploaded - queued;
            
            // Clear the error queue when "User successfully added a file through the file dialog"
            // that is LEQV to remainingUploadLimit > 0
            if (remainingUploadLimit > 0) {
                that.events.clearFileError.fire();
            }
             
            // Provide feedback to the user if the file size is too large and isn't added to the file queue
            var numFilesAdded = 0;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (fileLimit && remainingUploadLimit === 0) {
                    that.events.onQueueError.fire(file, fluid.uploader.queueErrorConstants.QUEUE_LIMIT_EXCEEDED);
                } else if (file.size >= sizeLimit) {
                    file.filestatus = fluid.uploader.fileStatusConstants.ERROR;
                    that.events.onQueueError.fire(file, fluid.uploader.queueErrorConstants.FILE_EXCEEDS_SIZE_LIMIT);
                } else if (!fileLimit || remainingUploadLimit > 0) {
                    file.id = "file-" + fluid.allocateGuid();
                    file.filestatus = fluid.uploader.fileStatusConstants.QUEUED;
                    that.events.afterFileQueued.fire(file);
                    remainingUploadLimit--;
                    numFilesAdded++;
                }
            }            
            that.events.afterFileDialog.fire(numFilesAdded);
        };
        
        that.removeFile = function (file) {
        };
        
        that.enableBrowseButton = function () {
            that.browseButtonView.enable();
        };
        
        that.disableBrowseButton = function () {
            that.browseButtonView.disable();
        };
        
        fluid.initDependents(that);
        return that;
    };
    
    fluid.defaults("fluid.uploader.html5Strategy.local", {
        argumentMap: {
            options: 2  
        },
        gradeNames: ["fluid.eventedComponent"],
        
        components: {
            browseButtonView: {
                type: "fluid.uploader.html5Strategy.browseButtonView",
                options: {
                    queueSettings: "{multiFileUploader}.options.queueSettings",
                    selectors: {
                        browseButton: "{multiFileUploader}.selectors.browseButton"
                    },
                    listeners: {
                        onFilesQueued: "{local}.addFiles"
                    }
                }
            }
        }
    });
    
    fluid.demands("fluid.uploader.local", "fluid.uploader.html5Strategy", {
        funcName: "fluid.uploader.html5Strategy.local",
        args: [
            "{multiFileUploader}.queue",
            "{html5Strategy}.options.legacyBrowserFileLimit",
            "{options}"
        ]
    });
    
    fluid.demands("fluid.uploader.local", [
        "fluid.uploader.html5Strategy",
        "fluid.browser.supportsFormData"
    ], {
        funcName: "fluid.uploader.html5Strategy.local",
        args: [
            "{multiFileUploader}.queue",
            undefined,
            "{options}"
        ]
    });
    
    
    /********************
     * browseButtonView *
     ********************/
    
    var bindEventsToFileInput = function (that, fileInput) {
        fileInput.click(function () {
            that.events.onBrowse.fire();
        });
        
        fileInput.change(function () {
            var files = fileInput[0].files;
            that.events.onFilesQueued.fire(files);
            that.renderFreshMultiFileInput();
        });
        
        fileInput.focus(function () {
            that.browseButton.addClass("focus");
        });
        
        fileInput.blur(function () {
            that.browseButton.removeClass("focus");
        });
    };
    
    var renderMultiFileInput = function (that) {
        var multiFileInput = $(that.options.multiFileInputMarkup);
        bindEventsToFileInput(that, multiFileInput);
        return multiFileInput;
    };
    
    var setupBrowseButtonView = function (that) {
        var multiFileInput = renderMultiFileInput(that);        
        that.browseButton.append(multiFileInput);
        that.browseButton.attr("tabindex", -1);
    };
    
    fluid.uploader.html5Strategy.browseButtonView = function (container, options) {
        var that = fluid.initView("fluid.uploader.html5Strategy.browseButtonView", container, options);
        that.browseButton = that.locate("browseButton");
        
        that.renderFreshMultiFileInput = function () {
            var previousInput = that.locate("fileInputs").last();
            previousInput.hide();
            previousInput.attr("tabindex", -1);
            var newInput = renderMultiFileInput(that);
            previousInput.after(newInput);
        };
        
        that.enable = function () {
            that.locate("fileInputs").removeAttr("disabled");
        };
        
        that.disable = function () {
            that.locate("fileInputs").attr("disabled", "disabled");
        };
        
        setupBrowseButtonView(that);
        return that;
    };
    
    fluid.defaults("fluid.uploader.html5Strategy.browseButtonView", {
        gradeNames: "fluid.viewComponent",
        multiFileInputMarkup: "<input type='file' multiple='' class='flc-uploader-html5-input' />",
        
        queueSettings: {},
        
        selectors: {
            browseButton: ".flc-uploader-button-browse",
            fileInputs: ".flc-uploader-html5-input"
        },
        
        events: {
            onBrowse: null,
            onFilesQueued: null
        }        
    });

    fluid.demands("fluid.uploader.html5Strategy.browseButtonView", "fluid.uploader.html5Strategy.local", {
        container: "{multiFileUploader}.container",
        mergeOptions: {
            events: {
                onBrowse: "{local}.events.onFileDialog"
            }
        }
    });

})(jQuery, fluid_1_4);