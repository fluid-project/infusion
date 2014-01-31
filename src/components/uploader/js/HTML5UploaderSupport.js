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
/*global FormData, fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    fluid.demands("fluid.uploaderImpl", "fluid.uploader.html5", {
        horizon: "fluid.uploader.progressiveCheck",
        funcName: "fluid.uploader.multiFileUploader"
    });
    
    fluid.demands("fluid.uploader.strategy", "fluid.uploader.html5", {
        horizon: "fluid.uploader.progressiveCheck",
        funcName: "fluid.uploader.html5Strategy"
    });
    
    fluid.defaults("fluid.uploader.html5Strategy", {
        gradeNames: ["fluid.uploader.strategy", "autoInit"],
        components: {
            local: { // TODO: Would be nice to have some way to express that this is a "natural covariant refinement"
                type: "fluid.uploader.html5Strategy.local"
            }
        }
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
                if (status >= 200 && status <= 204) {
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
    
    fluid.uploader.html5Strategy.uploadNextFile = function (queue, uploadFile) {
        var batch = queue.currentBatch;
        var file = batch.files[batch.fileIdx];                        
        uploadFile(file);
    };
    
    fluid.uploader.html5Strategy.uploadFile = function (that, file) {
        that.events.onFileStart.fire(file);
        that.currentXHR = that.createXHR();
        fluid.uploader.html5Strategy.monitorFileUploadXHR(file, that.events, that.currentXHR);
        that.fileSender.send(file, that.queueSettings, that.currentXHR); 
    };
    
    fluid.uploader.html5Strategy.stop = function (that) {
        that.queue.isUploading = false;
        that.currentXHR.abort();
        that.events.onUploadStop.fire();
    };
    
    fluid.defaults("fluid.uploader.html5Strategy.remote", {
        gradeNames: ["fluid.uploader.remote", "autoInit"],
        components: {
            fileSender: {
                type: "fluid.uploader.html5Strategy.fileSender"
            }
        },
        invokers: {
            createXHR: "fluid.uploader.html5Strategy.createXHR",
            // Upload files in the current batch without exceeding the fileUploadLimit
            uploadNextFile: {
                funcName: "fluid.uploader.html5Strategy.uploadNextFile",
                args: ["{that}.queue", "{that}.uploadFile"]
            },
            uploadFile: {
                funcName: "fluid.uploader.html5Strategy.uploadFile",
                args: ["{that}", "{arguments}.0"]
            },
            stop: {
                funcName: "fluid.uploader.html5Strategy.stop",
                args: ["{that}"]
            },
        }
    });
    
    fluid.demands("fluid.uploader.remote", ["fluid.uploader.html5Strategy", "fluid.uploader.live"], {
        funcName: "fluid.uploader.html5Strategy.remote"
    });


    fluid.uploader.html5Strategy.createXHR = function () {
        return new XMLHttpRequest();
    };
    
    fluid.uploader.html5Strategy.createFormData = function () {
        return new FormData();
    };
    
    // Set additional POST parameters for xhr  
    fluid.uploader.html5Strategy.setPostParams = function (formData, postParams) {
        $.each(postParams, function (key, value) {
            formData.append(key, value);
        });
    };
    
    /*******************************************************
     * HTML5 FormData Sender, used by most modern browsers *
     *******************************************************/
    
    fluid.uploader.html5Strategy.fileSender = function () {
        fluid.fail("Error instantiating HTML5 Uploader - browser does not support FormData feature. Please try version 1.4 or earlier of Uploader which has Firefox 3.x support")  
    };
    
    fluid.defaults("fluid.uploader.html5Strategy.formDataSender", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        invokers: {
            createFormData: "fluid.uploader.html5Strategy.createFormData",
            send: {
                funcName: "fluid.uploader.html5Strategy.sendFormData",
                args: ["{that}.createFormData", "{arguments}.0", "{arguments}.1", "{arguments}.2"], 
            }
        }
    });

    /**
     * Uploads the file using the HTML5 FormData object.
     */    
    fluid.uploader.html5Strategy.sendFormData = function (formCreator, file, queueSettings, xhr) {
        var formData = formCreator();
        formData.append("file", file);
        fluid.uploader.html5Strategy.setPostParams(formData, queueSettings.postParams);
        xhr.open("POST", queueSettings.uploadURL, true);
        xhr.send(formData);
        return formData;
    };

    fluid.demands("fluid.uploader.html5Strategy.fileSender", [
        "fluid.uploader.html5Strategy.remote", 
        "fluid.browser.supportsFormData"
    ], {
        funcName: "fluid.uploader.html5Strategy.formDataSender"
    });

    /************************************
     * HTML5 Strategy's Local Behaviour *
     ************************************/
    
    fluid.defaults("fluid.uploader.html5Strategy.local", {
        gradeNames: ["fluid.uploader.local", "autoInit"],
        invokers: {
            addFiles: {
                funcName: "fluid.uploader.html5Strategy.local.addFiles",
                args: ["{that}", "{arguments}.0"] // files
            },
            removeFile: "fluid.identity", // it appears this was never implemented
            enableBrowseButton: "{that}.browseButtonView.enable",
            disableBrowseButton: "{that}.browseButtonView.disable"
        },
        components: {
            browseButtonView: {
                type: "fluid.uploader.html5Strategy.browseButtonView",
                options: {
                    queueSettings: "{uploader}.options.queueSettings",
                    selectors: {
                        browseButton: "{uploader}.options.selectors.browseButton"
                    },
                    listeners: {
                        onFilesQueued: "{local}.addFiles"
                    }
                }
            }
        }
    });
     
    fluid.uploader.html5Strategy.local.addFiles = function (that, files) {
        // Add files to the file queue without exceeding the fileUploadLimit and the fileSizeLimit
        // NOTE: fileSizeLimit set to bytes for HTML5 Uploader (KB for SWF Uploader).  
        // TODO: These look like they should be part of a real model.
        var queueSettings = that.options.queueSettings;
        var sizeLimit = queueSettings.fileSizeLimit * 1024;
        var fileLimit = queueSettings.fileUploadLimit;
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
    
    /********************
     * browseButtonView *
     ********************/
    
    fluid.uploader.bindEventsToFileInput = function (that, fileInput) {
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
            that.events.onFocusFileInput.fire(that, fileInput, true);
        });
        
        fileInput.blur(function () {
            that.browseButton.removeClass("focus");
            that.events.onFocusFileInput.fire(that, fileInput, false);
        });
    };
    
    fluid.uploader.renderMultiFileInput = function (that) {
        var multiFileInput = $(that.options.multiFileInputMarkup);
        var fileTypes = that.options.queueSettings.fileTypes;
        if (fluid.isArrayable(fileTypes)) {
            fileTypes = fileTypes.join();
            multiFileInput.attr("accept", fileTypes);
        }
        return multiFileInput;
    };
    
    fluid.uploader.renderFreshMultiFileInput = function (that) {
        var previousInput = that.locate("fileInputs").last();
        previousInput.hide();
        previousInput.prop("tabindex", -1);
        var newInput = fluid.uploader.renderMultiFileInput(that);
        previousInput.after(newInput);
        fluid.uploader.bindEventsToFileInput(that, newInput);
    };
    
    fluid.uploader.setupBrowseButtonView = function (that) {
        var multiFileInput = fluid.uploader.renderMultiFileInput(that);        
        that.browseButton.append(multiFileInput);
        fluid.uploader.bindEventsToFileInput(that, multiFileInput);
        that.browseButton.prop("tabindex", -1);
    };
    
    fluid.uploader.isEnabled = function (element) {
        return !element.prop("disabled");   
    };
    
    fluid.defaults("fluid.uploader.html5Strategy.browseButtonView", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        multiFileInputMarkup: "<input type='file' multiple='' class='flc-uploader-html5-input' />",
        queueSettings: {},
        members: {
            browseButton: "{that}.dom.browseButton"
        },
        invokers: {
            enable: { // TODO: FLUID-4928
                "this": "{that}.dom.fileInputs",
                method: "prop",
                args: ["disabled", false]
            },
            disable: {
                "this": "{that}.dom.fileInputs",
                method: "prop",
                args: ["disabled", true]
            },
            isEnabled: {
                funcName: "fluid.uploader.isEnabled",
                args: "{that}.dom.fileInputs"
            },
            renderFreshMultiFileInput: {
                funcName: "fluid.uploader.renderFreshMultiFileInput",
                args: "{that}"
            }
        },
        selectors: {
            browseButton: ".flc-uploader-button-browse",
            fileInputs: ".flc-uploader-html5-input"
        },
        events: {
            onFocusFileInput: null,
            onBrowse: null,
            onFilesQueued: null
        },
        listeners: {
            onCreate: {
                funcName: "fluid.uploader.setupBrowseButtonView",
                args: "{that}"
            }  
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

})(jQuery, fluid_1_5);