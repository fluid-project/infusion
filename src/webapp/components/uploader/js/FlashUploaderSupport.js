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
/*global fluid_1_5:true, jQuery, swfobject, SWFUpload */

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    // TODO: This context name is required, but has no visible detection support
    fluid.enhance.check({"fluid.uploader.flash.10": true});
    
    /**********************
     * uploader.swfUpload *
     **********************/
    
    fluid.demands("fluid.uploaderImpl", "fluid.uploader.swfUpload", {
        horizon: "fluid.uploader.progressiveCheck",
        funcName: "fluid.uploader.multiFileUploader"
    });
        
    fluid.demands("fluid.uploader.strategy", "fluid.uploader.swfUpload", {
        horizon: "fluid.uploader.progressiveCheck",
        funcName: "fluid.uploader.swfUploadStrategy"
    });
    
    fluid.defaults("fluid.uploader.swfUploadStrategy", {
        gradeNames: ["fluid.uploader.strategy", "autoInit"],
        components: {
            local: {
                type: "fluid.uploader.swfUploadStrategy.local"  
            },
            engine: {
                type: "fluid.uploader.swfUploadStrategy.engine",
                options: {
                    queueSettings: "{uploader}.options.queueSettings",
                    flashMovieSettings: "{swfUploadStrategy}.options.flashMovieSettings"
                }
            }
        },
        
        // TODO: Rename this to "flashSettings" and remove the "flash" prefix from each option
        flashMovieSettings: {
            flashURL: "../../../lib/swfupload/flash/swfupload.swf",
            flashButtonPeerId: "",
            flashButtonAlwaysVisible: false,
            flashButtonTransparentEvenInIE: true,
            flashButtonImageURL: "../images/browse.png", // Used only when the Flash movie is visible.
            flashButtonCursorEffect: SWFUpload.CURSOR.HAND,
            debug: false
        },

        styles: {
            browseButtonOverlay: "fl-uploader-browse-overlay",
            flash9Container: "fl-uploader-flash9-container",
            uploaderWrapperFlash10: "fl-uploader-flash10-wrapper"
        }
    });
    
    fluid.uploader.swfUploadStrategy.stop = function (queue) {
        // FLUID-822: Instead of actually stopping SWFUpload right away, we wait until the current file 
        // is finished and then don't bother to upload any new ones. This is due an issue where SWFUpload
        // appears to hang while Uploading a file that was previously stopped. I have a lingering suspicion
        // that this may actually be a bug in our Image Gallery demo, rather than in SWFUpload itself.
        that.queue.shouldStop = true;      
    };
    
    fluid.defaults("fluid.uploader.swfUploadStrategy.remote", {
        gradeNames: ["fluid.uploader.remote", "autoInit"],
        invokers: {
            uploadNextFile: {
                "this": "{engine}.swfUpload",
                method: "startUpload"
            },
            stop: {
                funcName: "fluid.uploader.swfUploadStrategy.stop",
                args: "{strategy}.queue"
            }
        }
    });

    fluid.demands("fluid.uploader.remote", ["fluid.uploader.swfUploadStrategy", "fluid.uploader.live"], {
        funcName: "fluid.uploader.swfUploadStrategy.remote"
    });

    fluid.defaults("fluid.uploader.swfUploadStrategy.local", {
        gradeNames: ["fluid.uploader.local", "autoInit"],
        members: {
            swfUpload: "{engine}.swfUpload",
        },
        invokers: {
            browse: {
                funcName: "fluid.uploader.swfUploadStrategy.browse",
                args: "{that}"
            },
            removeFile: {
                "this": "{that}.swfUpload",
                method: "cancelUpload",
                args: "{arguments}.0.id" // file.id
            },
            enableBrowseButton: {
                "this": "{that}.swfUpload",
                method: "setButtonDisabled",
                args: false
            },
            disableBrowseButton: {
                "this": "{that}.swfUpload",
                method: "setButtonDisabled",
                args: true
            }
        }
    });
    
    fluid.uploader.swfUploadStrategy.browse = function (that) {
        if (that.options.file_queue_limit === 1) {
            that.swfUpload.selectFile();
        } else {
            that.swfUpload.selectFiles();
        }  
    };

    fluid.uploader.swfUploadStrategy.flashVersionTag = function () {
        return "fluid.uploader.flash." + fluid.enhance.majorFlashVersion();
    };

    fluid.uploader.swfUploadStrategy.mergeSwfConfig = function (queueSettings, flashMovieSettings) {
        return $.extend({}, queueSettings, flashMovieSettings);
    };
    
    fluid.uploader.swfUploadStrategy.makeSwfUpload = function (swfUploadConfig) {
        return new SWFUpload(swfUploadConfig);
    };

    
    fluid.defaults("fluid.uploader.swfUploadStrategy.engine", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        components: {
        // Get the Flash version from swfobject and setup a new context so that the appropriate
            versionTag: {
                type: "fluid.typeFount",
                options: {
                    targetTypeName: {
                        expander: {funcName: "fluid.uploader.swfUploadStrategy.flashVersionTag"},
                    }
                }
            }
        },
        invokers: {
            setupDOM: "fluid.uploader.swfUploadStrategy.setupDOM",
            setupConfig: "fluid.uploader.swfUploadStrategy.setupConfig",
            bindEvents: "fluid.uploader.swfUploadStrategy.eventBinder"
        },
        members: {
            config: {
                expander: {
                    funcName: "fluid.uploader.swfUploadStrategy.mergeSwfConfig",
                    args: ["{that}.options.queueSettings", "{that}.options.flashMovieSettings"]
                }
            },
            flashContainer: {
                expander: {func: "{that}.setupDOM"}
            },
            swfUploadConfig: {
                expander: {func: "{that}.setupConfig"}
            },
            swfUpload: {
                expander: {
                    funcName: "fluid.uploader.swfUploadStrategy.makeSwfUpload",
                    args: "{that}.swfUploadConfig"
                }
            }
        },
        listeners: {
            onCreate: "{that}.bindEvents"
        }
    });

    /*
     * Transform HTML5 MIME types into file types for SWFUpload.
     */
    fluid.uploader.swfUploadStrategy.fileTypeTransformer = function (model, expandSpec) { 
        var fileExts = "";
        var mimeTypes = fluid.get(model, expandSpec.path); 
        var mimeTypesMap = fluid.uploader.mimeTypeRegistry;
        
        if (!mimeTypes) {
            return "*";
        } else if (typeof (mimeTypes) === "string") {
            return mimeTypes;
        }
        
        fluid.each(mimeTypes, function (mimeType) {
            fluid.each(mimeTypesMap, function (mimeTypeForExt, ext) {
                if (mimeTypeForExt === mimeType) {
                    fileExts += "*." + ext + ";";
                }
            });
        });

        return fileExts.length === 0 ? "*" : fileExts.substring(0, fileExts.length - 1);
    };
    
    /**********************
     * swfUpload.setupDOM *
     **********************/
    
    fluid.uploader.swfUploadStrategy.flash10SetupDOM = function (uploaderContainer, browseButton, progressBar, styles) {
        // Wrap the whole uploader first.
        uploaderContainer.wrap("<div class='" + styles.uploaderWrapperFlash10 + "'></div>");

        // Then create a container and placeholder for the Flash movie as a sibling to the uploader.
        var flashContainer = $("<div><span></span></div>");
        flashContainer.addClass(styles.browseButtonOverlay);
        uploaderContainer.after(flashContainer);
        progressBar.append(flashContainer);
        browseButton.attr("tabindex", -1);        
        return flashContainer;   
    };
    
    fluid.demands("fluid.uploader.swfUploadStrategy.setupDOM", [
        "fluid.uploader.swfUploadStrategy.engine",
        "fluid.uploader.flash.10"
    ], {
        funcName: "fluid.uploader.swfUploadStrategy.flash10SetupDOM",
        args: [            
            "{uploader}.container",
            "{uploader}.dom.browseButton",
            "{totalProgress}.dom.progressBar",
            "{swfUploadStrategy}.options.styles"
        ]
    });
     
     
    /*********************************
     * swfUpload.setupConfig *
     *********************************/
      
    // Maps SWFUpload's setting names to our component's setting names.
    fluid.uploader.swfUploadStrategy.swfUploadOptionsMap = {
        uploadURL: "upload_url",
        flashURL: "flash_url",
        postParams: "post_params",
        fileSizeLimit: "file_size_limit",
        fileTypes: "file_types",
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
    fluid.uploader.swfUploadStrategy.swfUploadEventMap = {
        "swfupload_loaded_handler": "afterReady",
        "file_dialog_start_handler": "onFileDialog",
        "file_queued_handler": "onFileQueued",         
        "file_queue_error_handler": "onQueueError", 
        "file_dialog_complete_handler": "afterFileDialog",
        "upload_start_handler": "onFileStart",
        "upload_progress_handler": "onFileProgress",
        "upload_complete_handler": "onFileComplete",
        "upload_error_handler": "onFileError", 
        "upload_success_handler": "onFileSuccess"
    };
    
    fluid.uploader.swfUploadStrategy.mapNames = function (nameMap, source, target) {
        var result = target || {};
        for (var key in source) {
            var mappedKey = nameMap[key];
            if (mappedKey) {
                result[mappedKey] = source[key];
            }
        }
        
        return result;
    };
    
    fluid.uploader.swfUploadStrategy.convertConfigForSWFUpload = function (flashContainer, config, events, queueSettings) {
        config.flashButtonPeerId = fluid.allocateSimpleId(flashContainer.children().eq(0));
        // Map the event and settings names to SWFUpload's expectations.
        // Convert HTML5 MIME types into SWFUpload file types
        config.fileTypes = fluid.uploader.swfUploadStrategy.fileTypeTransformer(queueSettings, {
            path: "fileTypes"
        });
        var convertedConfig = fluid.uploader.swfUploadStrategy.mapNames(fluid.uploader.swfUploadStrategy.swfUploadOptionsMap, config);
        // TODO:  Same with the FLUID-3886 branch:  Can these declarations be done elsewhere?
        convertedConfig.file_upload_limit = 0;
        convertedConfig.file_size_limit = 0;
        var firers = fluid.transform(fluid.uploader.swfUploadStrategy.swfUploadEventMap, function (origEvent) {
            return events[origEvent].fire;
        });
        return $.extend(convertedConfig, firers);
    };
    
    fluid.uploader.swfUploadStrategy.flash10SetupConfig = function (config, events, flashContainer, browseButton, queueSettings) {
        var isTransparent = config.flashButtonAlwaysVisible ? false : (!$.browser.msie || config.flashButtonTransparentEvenInIE);
        config.flashButtonImageURL = isTransparent ? undefined : config.flashButtonImageURL;
        config.flashButtonHeight = config.flashButtonHeight || browseButton.outerHeight();
        config.flashButtonWidth = config.flashButtonWidth || browseButton.outerWidth();
        config.flashButtonWindowMode = isTransparent ? SWFUpload.WINDOW_MODE.TRANSPARENT : SWFUpload.WINDOW_MODE.OPAQUE;
        return fluid.uploader.swfUploadStrategy.convertConfigForSWFUpload(flashContainer, config, events, queueSettings);
    };
    
    fluid.demands("fluid.uploader.swfUploadStrategy.setupConfig", [
        "fluid.uploader.swfUploadStrategy.engine",
        "fluid.uploader.flash.10"
    ], {
        funcName: "fluid.uploader.swfUploadStrategy.flash10SetupConfig",
        args: [
            "{engine}.config",
            "{uploader}.events",
            "{engine}.flashContainer",
            "{uploader}.dom.browseButton",
            "{uploader}.options.queueSettings"
        ]
    });

     
    /*********************************
     * swfUpload.eventBinder *
     *********************************/
     
    var unbindSWFUploadSelectFiles = function () {
        // There's a bug in SWFUpload 2.2.0b3 that causes the entire browser to crash 
        // if selectFile() or selectFiles() is invoked. Remove them so no one will accidently crash their browser.
        SWFUpload.prototype.selectFile = fluid.identity;
        SWFUpload.prototype.selectFiles = fluid.identity;
    };
    
    var convertFileStatus = function (swfFileStatus) {
        var converted = fluid.uploader.swfUploadStrategy.convertCode(swfFileStatus, fluid.uploader.fileStatusConstants, SWFUpload.FILE_STATUS);
        // Some parts of the Uploader core apparatus set native file status codes (e.g. CANCELLED), avoid converting them twice
        // - this is obviously unsatisfactory because we have a race between SWF's onFileError and core onFileError handlers - TODO
        return converted || swfFileStatus;
    };
    
    fluid.uploader.swfUploadStrategy.bindFileEventListeners = function (model, events) {
        // Manually update our public model to keep it in sync with SWFUpload's insane,
        // always-changing references to its internal model.        
        var manualModelUpdater = function (file) {
            var modelFile = fluid.find_if(model, function (modelFile) {
                return modelFile.id === file.id;
            });
            if (modelFile) {
                modelFile.filestatus = convertFileStatus(file.filestatus);
            }
        };
        fluid.each(["onFileStart", "onFileProgress", "onFileError", "onFileSuccess"], function (event) {
            events[event].addListener(manualModelUpdater);
        });
    };
    
    // Convert one value from SWF's lookup table to ours, by finding key agreement
    fluid.uploader.swfUploadStrategy.convertCode = function (value, uploaderCodes, swfCodes) {
        var key = fluid.keyForValue(swfCodes, value);
        return uploaderCodes[key];
    };
    
    fluid.uploader.swfUploadStrategy.mapQueuedFile = function (origFile, events, queue, queueSettings) {
        var file = $.extend({}, origFile); // shallow copy of file to avoid corrupting SWF's instance
        file.filestatus = convertFileStatus(origFile.filestatus);
        var fileSizeLimit = queueSettings.fileSizeLimit * 1000;
        var fileUploadLimit = queueSettings.fileUploadLimit;
        var processedFiles = queue.getReadyFiles().length + queue.getUploadedFiles().length; 

        if (file.size > fileSizeLimit) {
            file.filestatus = fluid.uploader.fileStatusConstants.ERROR;
            events.onQueueError.fire(file, fluid.uploader.queueErrorConstants.FILE_EXCEEDS_SIZE_LIMIT);
        } else if (fileUploadLimit !== 0 && processedFiles >= fileUploadLimit) {
            events.onQueueError.fire(file, fluid.uploader.queueErrorConstants.QUEUE_LIMIT_EXCEEDED);
        } else {
            events.afterFileQueued.fire(file);
        }
    };
    
    fluid.uploader.swfUploadStrategy.flash10EventBinder = function (queue, queueSettings, events) {
        unbindSWFUploadSelectFiles();      
              
        events.onFileQueued.addListener(function (file) {
            fluid.uploader.swfUploadStrategy.mapQueuedFile(file, events, queue, queueSettings);
        });        
        
        fluid.uploader.swfUploadStrategy.bindFileEventListeners(queue.files, events);
    };
    
    fluid.demands("fluid.uploader.swfUploadStrategy.eventBinder", [
        "fluid.uploader.swfUploadStrategy.engine",
        "fluid.uploader.flash.10"
    ], {
        funcName: "fluid.uploader.swfUploadStrategy.flash10EventBinder",
        args: [
            "{uploader}.queue",
            "{uploader}.options.queueSettings",
            "{uploader}.events"
        ]
    });
})(jQuery, fluid_1_5);
