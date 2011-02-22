/*
Copyright 2010-2011 OCAD University 

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid_1_3:true, FormData*/

var fluid_1_3 = fluid_1_3 || {};

(function ($, fluid) {

    fluid.uploader = fluid.uploader || {};
    
    fluid.demands("fluid.uploader.impl", ["fluid.uploader", "fluid.uploader.html5"], {
        funcName: "fluid.uploader.multiFileUploader"
    });
    
    fluid.uploader.html5Strategy = function (options) {
        var that = fluid.initLittleComponent("fluid.uploader.html5Strategy", options);
        fluid.initDependents(that);
        return that;
    };
    
    fluid.defaults("fluid.uploader.html5Strategy", {
        components: {
            local: {
                type: "fluid.uploader.html5Strategy.local",
                options: {
                    queueSettings: "{multiFileUploader}.options.queueSettings",
                    events: "{multiFileUploader}.events"
                }
            },
            
            remote: {
                type: "fluid.uploader.remote",
                options: {
                    queueSettings: "{multiFileUploader}.options.queueSettings",
                    events: "{multiFileUploader}.events"
                }
            }
        },
        
        // Used for browsers that rely on File.getAsBinary(), such as Firefox 3.6,
        // which load the entire file to be loaded into memory.
        // Set this option to a sane limit so your users won't experience crashes or slowdowns (FLUID-3937).
        legacyBrowserFileLimit: 100,
        
        mergePolicy: {
            "components.local.options.events": "preserve",
            "components.remote.options.events": "preserve"
        }        
    });

    fluid.demands("fluid.uploader.html5Strategy", "fluid.multiFileUploader", {
        funcName: "fluid.uploader.html5Strategy",
        args: [
            fluid.COMPONENT_OPTIONS
        ]
    });
    
    fluid.demands("fluid.uploader.progressiveStrategy", "fluid.uploader.html5", {
        funcName: "fluid.uploader.html5Strategy",
        args: [
            fluid.COMPONENT_OPTIONS
        ]
    });
    
    
    // TODO: The following two or three functions probably ultimately belong on a that responsible for
    // coordinating with the XHR. A fileConnection object or something similar.
    
    fluid.uploader.html5Strategy.fileSuccessHandler = function (file, events) {
        events.onFileSuccess.fire(file);
        events.onFileComplete.fire(file);
    };
    
    fluid.uploader.html5Strategy.fileErrorHandler = function (file, events) {
        file.filestatus = fluid.uploader.fileStatusConstants.ERROR;
        events.onFileError.fire(file, fluid.uploader.errorConstants.UPLOAD_FAILED);
        events.onFileComplete.fire(file);
    };
    
    fluid.uploader.html5Strategy.fileStopHandler = function (file, events) {
        file.filestatus = fluid.uploader.fileStatusConstants.CANCELLED;
        events.onFileError.fire(file, fluid.uploader.errorConstants.UPLOAD_STOPPED);
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
    
    var createFileUploadXHR = function (file, events) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var status = xhr.status;
                // TODO: See a pattern here? Fix it.
                if (status === 200) {
                    fluid.uploader.html5Strategy.fileSuccessHandler(file, events);
                } else if (status === 0) {
                    fluid.uploader.html5Strategy.fileStopHandler(file, events);
                } else {
                    fluid.uploader.html5Strategy.fileErrorHandler(file, events);
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
        that.events = that.options.events;
        
        // Upload files in the current batch without exceeding the fileUploadLimit
        that.uploadNextFile = function () {
            var batch = that.queue.currentBatch;
            var file = batch.files[batch.fileIdx];                        
            that.uploadFile(file);
        };
        
        that.uploadFile = function (file) {
            that.events.onFileStart.fire(file);
            that.currentXHR = createFileUploadXHR(file, that.events);
            that.doUpload(file, that.queueSettings, that.currentXHR);            
        };

        that.stop = function () {
            that.currentXHR.abort();         
        };
        
        fluid.initDependents(that);
        that.events.afterReady.fire();
        return that;
    };
    
    fluid.defaults("fluid.uploader.html5Strategy.remote", {
        invokers: {
            doUpload: "fluid.uploader.html5Strategy.doUpload"
        }
    });
    
    fluid.demands("fluid.uploader.remote", "fluid.uploader.html5Strategy", {
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
    
    var generateMultipartBoundary = function () {
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
        multipart += file.getAsBinary(); // TODO: Ack, concatting binary data to JS String!
        multipart += CRLF + "--" + boundary + "--" + CRLF;
        return multipart;
    };
    
    /*
     * Create the multipart/form-data content by hand to send the file
     */
    fluid.uploader.html5Strategy.doManualMultipartUpload = function (file, queueSettings, xhr) {
        var boundary = generateMultipartBoundary();
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
        that.events = that.options.events;
        that.queueSettings = that.options.queueSettings;

        // Add files to the file queue without exceeding the fileUploadLimit and the fileSizeLimit
        // NOTE:  fileSizeLimit set to bytes for HTML5 Uploader (MB for SWF Uploader).  
        that.addFiles = function (files) {
            // TODO: These look like they should be part of a real model.
            var sizeLimit = (legacyBrowserFileLimit || that.queueSettings.fileSizeLimit) * 1000000;
            var fileLimit = that.queueSettings.fileUploadLimit;
            var uploaded = that.queue.getUploadedFiles().length;
            var queued = that.queue.getReadyFiles().length;
            var remainingUploadLimit = fileLimit - uploaded - queued;
            
            // TODO:  Provide feedback to the user if the file size is too large and isn't added to the file queue
            var numFilesAdded = 0;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (file.size < sizeLimit && (!fileLimit || remainingUploadLimit > 0)) {
                    file.id = "file-" + fluid.allocateGuid();
                    file.filestatus = fluid.uploader.fileStatusConstants.QUEUED;
                    that.events.afterFileQueued.fire(file);
                    remainingUploadLimit--;
                    numFilesAdded++;
                } else {
                    file.filestatus = fluid.uploader.fileStatusConstants.ERROR;
                    that.events.onQueueError.fire(file, fluid.uploader.errorConstants.UPLOAD_LIMIT_EXCEEDED);
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
        components: {
            browseButtonView: {
                type: "fluid.uploader.html5Strategy.browseButtonView",
                options: {
                    queueSettings: "{multiFileUploader}.options.queueSettings",
                    selectors: {
                        browseButton: "{multiFileUploader}.selectors.browseButton"
                    },
                    listeners: {
                        onBrowse: "{local}.events.onFileDialog.fire", // TODO: Craziness?
                        onFilesQueued: "{local}.addFiles"
                    }
                }
            }
        }
    });
    
    fluid.demands("fluid.uploader.html5Strategy.local", "fluid.uploader.html5Strategy", {
        funcName: "fluid.uploader.html5Strategy.local",
        args: [
            "{multiFileUploader}.queue",
            "{html5Strategy}.options.legacyBrowserFileLimit",
            fluid.COMPONENT_OPTIONS
        ]
    });
    
    fluid.demands("fluid.uploader.html5Strategy.local", [
        "fluid.uploader.html5Strategy",
        "fluid.browser.supportsFormData"
    ], {
        funcName: "fluid.uploader.html5Strategy.local",
        args: [
            "{multiFileUploader}.queue",
            undefined,
            fluid.COMPONENT_OPTIONS
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
        var fileTypes = (that.options.queueSettings.fileTypes).replace(/\;/g, ',');       
        //multiFileInput.attr("accept", fileTypes);
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
        multiFileInputMarkup: "<input type='file' multiple='' class='flc-uploader-html5-input fl-hidden' />",
        
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
        args: [
            "{multiFileUploader}.container",
            fluid.COMPONENT_OPTIONS
        ]
    })
})(jQuery, fluid_1_3);    
