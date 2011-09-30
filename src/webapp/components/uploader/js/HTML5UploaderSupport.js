/*
Copyright 2010-2011 OCAD University 
Copyright 2011 Lucendo Development Ltd.

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
                        onFilesSelected: "{multiFileUploader}.events.onFilesSelected",
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

        xhr.upload.onprogress = function (pe) {
            events.onFileProgress.fire(file, pe.loaded, pe.total);
        };
    };
    
    
    /*************************************
     * HTML5 Strategy's remote behaviour *
     *************************************/
     
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
            that.currentXHR = that.createXHR();
            fluid.uploader.html5Strategy.monitorFileUploadXHR(file, that.events, that.currentXHR);
            that.fileSender.send(file, that.queueSettings, that.currentXHR);            
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
        components: {
            fileSender: {
                type: "fluid.uploader.html5Strategy.fileSender"
            }
        },
        invokers: {
            createXHR: "fluid.uploader.html5Strategy.createXHR"
        }
    });
    
    fluid.demands("fluid.uploader.remote", ["fluid.uploader.html5Strategy", "fluid.uploader.live"], {
        funcName: "fluid.uploader.html5Strategy.remote",
        args: [
            "{multiFileUploader}.queue", 
            fluid.COMPONENT_OPTIONS
        ]
    });


    fluid.uploader.html5Strategy.createXHR = function () {
        return new XMLHttpRequest();
    };
    
    fluid.uploader.html5Strategy.createFormData = function () {
        return new FormData();
    };
    
    // Set additional POST parameters for xhr  
    var setPostParams =  function (formData, postParams) {
        $.each(postParams,  function (key, value) {
            formData.append(key, value);
        });
    };
    
    /*******************************************************
     * HTML5 FormData Sender, used by most modern browsers *
     *******************************************************/
    
    fluid.defaults("fluid.uploader.html5Strategy.formDataSender", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "fluid.uploader.html5Strategy.formDataSender.init",
        invokers: {
            createFormData: "fluid.uploader.html5Strategy.createFormData"
        }
    });
    
    fluid.uploader.html5Strategy.formDataSender.init = function (that) {
        /**
         * Uploads the file using the HTML5 FormData object.
         */
        that.send = function (file, queueSettings, xhr) {
            var formData = that.createFormData();
            formData.append("file", file);
            setPostParams(formData, queueSettings.postParams);
            xhr.open("POST", queueSettings.uploadURL, true);
            xhr.send(formData);
            return formData;
        };
    };
    
    fluid.demands("fluid.uploader.html5Strategy.fileSender", [
        "fluid.uploader.html5Strategy.remote", 
        "fluid.browser.supportsFormData"
    ], {
        funcName: "fluid.uploader.html5Strategy.formDataSender"
    });
    
    /********************************************
     * Raw MIME Sender, required by Firefox 3.6 *
     ********************************************/
     
    fluid.uploader.html5Strategy.generateMultipartBoundary = function () {
        var boundary = "---------------------------";
        boundary += Math.floor(Math.random() * 32768);
        boundary += Math.floor(Math.random() * 32768);
        boundary += Math.floor(Math.random() * 32768);
        return boundary;
    };
    
    fluid.uploader.html5Strategy.generateMultiPartContent = function (boundary, file) {
        var CRLF = "\r\n";
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
    
    fluid.defaults("fluid.uploader.html5Strategy.rawMIMESender", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "fluid.uploader.html5Strategy.rawMIMESender.init"
    });
    
    fluid.uploader.html5Strategy.rawMIMESender.init = function (that) {
        /**
         * Uploads the file by manually creating the multipart/form-data request. Required by Firefox 3.6.
         */
        that.send = function (file, queueSettings, xhr) {
            var boundary =  fluid.uploader.html5Strategy.generateMultipartBoundary();
            var multipart = fluid.uploader.html5Strategy.generateMultiPartContent(boundary, file);
            xhr.open("POST", queueSettings.uploadURL, true);
            xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
            xhr.sendAsBinary(multipart);
            return multipart;
        };
    };
    
    fluid.demands("fluid.uploader.html5Strategy.fileSender", "fluid.uploader.html5Strategy.remote", {
        funcName: "fluid.uploader.html5Strategy.rawMIMESender"
    });


    /************************************
     * HTML5 Strategy's Local Behaviour *
     ************************************/
     
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
            
            that.events.onFilesSelected.fire(files.length);
            
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
            that.renderFreshMultiFileInput();
            that.events.onFilesQueued.fire(files);
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
        var fileTypes = that.options.queueSettings.fileTypes;
        if (fluid.isArrayable(fileTypes)) {
            fileTypes = fileTypes.join();
            multiFileInput.attr("accept", fileTypes);
        }
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
            that.locate("fileInputs").prop("disabled", false);
        };
        
        that.disable = function () {
            that.locate("fileInputs").prop("disabled", true);
        };
        
        that.isEnabled = function() {
            return !that.locate("fileInputs").prop("disabled");  
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