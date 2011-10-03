/*
Copyright 2009 University of Toronto
Copyright 2009 University of California, Berkeley
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    
    fluid.uploader = fluid.uploader || {};
    
    var startUploading; // Define early due to subtle circular dependency.
    
    var updateProgress = function (file, events, demoState, isUploading) {
        if (!isUploading) {
            return;
        }
        
        var chunk = Math.min(demoState.chunkSize, file.size);
        demoState.bytesUploaded = Math.min(demoState.bytesUploaded + chunk, file.size);
        events.onFileProgress.fire(file, demoState.bytesUploaded, file.size);
    };
    
    var finishAndContinueOrCleanup = function (that, file) {
        that.queue.finishFile(file);
        that.events.afterFileComplete.fire(file);
        
        if (that.queue.shouldUploadNextFile()) {
            startUploading(that);
        } else {
            that.events.afterUploadComplete.fire(that.queue.currentBatch.files);
            if (file.status !== fluid.uploader.fileStatusConstants.CANCELLED) {
                that.queue.clearCurrentBatch(); // Only clear the current batch if we're actually done the batch.
            }
        }
    };
    
    var finishUploading = function (that) {
        if (!that.queue.isUploading) {
            return;
        }
        
        var file = that.demoState.currentFile;
        that.events.onFileSuccess.fire(file);
        that.demoState.fileIdx++;
        finishAndContinueOrCleanup(that, file);
    };
    
    var simulateUpload = function (that) {
        if (!that.queue.isUploading) {
            return;
        }
        
        var file = that.demoState.currentFile;
        if (that.demoState.bytesUploaded < file.size) {
            fluid.invokeAfterRandomDelay(function () {
                updateProgress(file, that.events, that.demoState, that.queue.isUploading);
                simulateUpload(that);
            });
        } else {
            finishUploading(that);
        } 
    };
    
    startUploading = function (that) {
        // Reset our upload stats for each new file.
        that.demoState.currentFile = that.queue.files[that.demoState.fileIdx];
        that.demoState.chunksForCurrentFile = Math.ceil(that.demoState.currentFile / that.demoState.chunkSize);
        that.demoState.bytesUploaded = 0;
        that.queue.isUploading = true;
        
        that.events.onFileStart.fire(that.demoState.currentFile);
        simulateUpload(that);
    };

    var stopDemo = function (that) {
        var file = that.demoState.currentFile;
        file.filestatus = fluid.uploader.fileStatusConstants.CANCELLED;
        that.queue.shouldStop = true;
        
        // In SWFUpload's world, pausing is a combinination of an UPLOAD_STOPPED error and a complete.
        that.events.onFileError.fire(file, 
                                     fluid.uploader.errorConstants.UPLOAD_STOPPED, 
                                     "The demo upload was paused by the user.");
        finishAndContinueOrCleanup(that, file);
        that.events.onUploadStop.fire();
    };
    
    var setupDemo = function (that) {
        if (that.simulateDelay === undefined || that.simulateDelay === null) {
            that.simulateDelay = true;
        }
          
        // Initialize state for our upload simulation.
        that.demoState = {
            fileIdx: 0,
            chunkSize: 200000
        };
        
        return that;
    };
       
    /**
     * The demo remote pretends to upload files to the server, firing all the appropriate events
     * but without sending anything over the network or requiring a server to be running.
     * 
     * @param {FileQueue} queue the Uploader's file queue instance
     * @param {Object} the Uploader's bundle of event firers
     * @param {Object} configuration options
     */
    fluid.uploader.demoRemote = function (queue, options) {
        var that = fluid.initLittleComponent("fluid.uploader.demoRemote", options);
        that.queue = queue;
        
        that.uploadNextFile = function () {
            startUploading(that);   
        };
        
        that.stop = function () {
            stopDemo(that);
        };
        
        setupDemo(that);
        return that;
    };
    
    /**
     * Invokes a function after a random delay by using setTimeout.
     * If the simulateDelay option is false, the function is invoked immediately.
     * This is an odd function, but a potential candidate for central inclusion.
     * 
     * @param {Function} fn the function to invoke
     */
    fluid.invokeAfterRandomDelay = function (fn) {
        var delay = Math.floor(Math.random() * 1000 + 100);
        setTimeout(fn, delay);
    };
    
    fluid.defaults("fluid.uploader.demoRemote", {
        gradeNames: ["fluid.eventedComponent"],
        argumentMap: {
            options: 1  
        },
        events: {
            onFileProgress: "{multiFileUploader}.events.onFileProgress",
            afterFileComplete: "{multiFileUploader}.events.afterFileComplete",
            afterUploadComplete: "{multiFileUploader}.events.afterUploadComplete",
            onFileSuccess: "{multiFileUploader}.events.onFileSuccess",
            onFileStart: "{multiFileUploader}.events.onFileStart",
            onFileError: "{multiFileUploader}.events.onFileError",
            onUploadStop: "{multiFileUploader}.events.onUploadStop"
        }
    });
    
    fluid.demands("fluid.uploader.remote", ["fluid.uploader.multiFileUploader", "fluid.uploader.demo"], {
        funcName: "fluid.uploader.demoRemote",
        args: [
            "{multiFileUploader}.queue",
            "{multiFileUploader}.events",
            fluid.COMPONENT_OPTIONS
        ]
    });
    
})(jQuery, fluid_1_4);
