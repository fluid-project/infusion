/*global google*/
/*global jQuery*/
/*global fluid_0_7*/

fluid_0_8 = fluid_0_8 || {};

(function ($, fluid) {

    var browseForFiles = function (that) {
        that.events.onFileDialog.fire();
        
        var openFileOptions = {
            singleFile: (that.options.fileQueueLimit === 1) ? true : false,
            filter: that.options.fileTypes
        };
        
        that.gearsDesktop.openFiles(function (files) {
            that.addFiles(files);
            that.events.afterFileDialog.fire(files.length, files.length, that.queue.files.length);
        }, openFileOptions);
    };
    
    var addFiles = function (that, files) {
        // Add the files to our queue and tell the world about it.
        $.each(files, function (idx, file) {
            file.filestatus = fluid.uploader.fileStatusConstants.QUEUED;
            file.size = file.blob.length;
            fluid.allocateSimpleId(file);
            
            that.queue.addFile(file);
            that.events.afterFileQueued.fire(file);
        });
    };
    
    var updateProgress = function (that, progressEvent) {
        that.events.fire.onFileProgress(that.queue.currentBatch.files[that.queue.currentBatch.fileIdx], 
                                        progressEvent.loaded, 
                                        progressEvent.total); // Fix me; gears returns an accumated loaded
                                                              // Whereas our event semantics assume a block value
                                                              // since the last event.
                                                              
        // Need the queue management code from the various event listeners in SWFUploadManager here and in other places!
    };
    
    var completeFile = function (that, file) {
        that.events.afterFileComplete.fire(file);
    };
    
    var createReadyStateChangedHandler = function (that, file, uploadRequest) {
        return function () {
            if (uploadRequest.readyState === 4) {
                completeFile(that, file);
            }
        };
    };
    
    var postFile = function (that, file) {
        if (!file) {
            return;
        }
        
        var uploadRequest = google.gears.factory.create('beta.httprequest');
        uploadRequest.open("POST", that.options.uploadURL);
        uploadRequest.onreadystatechange = createReadyStateChangedHandler;
        uploadRequest.onprogress = that.updateProgress;
        uploadRequest.send(file.blob);     
    };
    
    var startUploadingFiles = function (that) {
        that.queueManager.start();
        that.queueManager.startFile();
        var file = that.queue.currentBatch.files[that.queue.currentBatch.fileIdx];
        postFile(that, file);
    };

    var setupGearsUploadManager = function (that, events) {  
        that.queue = fluid.fileQueue();
        that.events = events;
        that.queueManager = fluid.fileQueue.manager(that.queue, that.events);
        that.gearsDesktop = google.gears.factory.create("beta.desktop");
        that.events.afterReady.fire();
    };
    
    fluid.gearsUploadManager = function (events, options) {
        var that = {};
        fluid.mergeComponentOptions(that, "fluid.gearsUploadManager", options);
        fluid.mergeListeners(that.events, that.options.listeners);
        
        /**
         * Starts uploading all queued files to the server.
         */
        that.start = function () {
            startUploadingFiles(that);
        };
        
        /**
         * Adds new files to the queue.
         * @param {Array} files an array of files to add
         */
        that.addFiles = function (files) {
            addFiles(that, files);
        };
        
        /**
         * Removes a file from the queue.
         * @param {File} the file to remove
         */
        that.removeFile = function (file) {
            that.queue.removeFile();
            that.events.afterFileRemoved.fire(file);
        };
        
        /**
         * Opens the native OS browse file dialog using Gears.
         */
        that.browseForFiles = function () {
            browseForFiles(that);
        };
        
        that.updateProgress = function (progressEvent) {
            updateProgress(that, progressEvent);
        };
        
        setupGearsUploadManager(that, events);
        return that;
    };
    
    fluid.defaults("fluid.gearsUploadManager", {
        uploadURL: "",
        fileSizeLimit: "20480",
        fileTypes: undefined,
        fileUploadLimit: 0,
        fileQueueLimit: 0
    });
    
})(jQuery, fluid_0_8);
