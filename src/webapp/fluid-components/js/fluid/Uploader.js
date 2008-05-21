/* Fluid Multi-File Uploader Component
 * 
 * Built by The Fluid Project (http://www.fluidproject.org)
 * 
 * LEGAL
 * 
 * Copyright 2008 University of California, Berkeley
 * Copyright 2008 University of Toronto
 * 
 * Licensed under the Educational Community License (ECL), Version 2.0 or the New
 * BSD license. You may not use this file except in compliance with one these
 * Licenses.
 * 
 * You may obtain a copy of the ECL 2.0 License and BSD License at
 * https://source.fluidproject.org/svn/LICENSE.txt
 * 
 * DOCUMENTATION
 * Technical documentation is available at: http://wiki.fluidproject.org/x/d4ck
 * 
 */

/* TODO:
 * - handle multiple instances
 * - determine strategy for markup: assumed, or pluggable?
 * - handle duplicate file error
 * - make fields configurable
 *	   - strings (for i18n)
 * - remove hard-coding of css class names
 * - refactor 'options' into more than one object as needed
 * - add container constraint to class-based selections
 * - add scroll to bottom
 * - fix resume
 * - clean up debug code
 * - remove commented-out code
 */

/* ABOUT RUNNING IN LOCAL TEST MODE
 * To run locally using a fake upload, set uploadDefaults.uploadUrl to ''
 */

var fluid = fluid || {};

(function ($,fluid) {
	  
	/* these are the internal UI elements of the Uploader as defined in the 
	 * default HTML for the Fluid Uploader
	 */
	var defaultSelectors = {
		upload: ".fluid-uploader-upload",
		pause: ".fluid-uploader-pause",
		browse: ".fluid-uploader-browse",
		done: ".fluid-uploader-done",
		cancel: ".fluid-uploader-cancel",
		fileQueue: ".fluid-uploader-queue",
		emptyRow : ".fluid-uploader-row-placeholder",
		txtTotalFiles: ".fluid-uploader-totalFiles",
		txtTotalBytes: ".fluid-uploader-totalBytes",
		osModifierKey: ".fluid-uploader-modifierKey",
		txtFileStatus: ".fileStatus",
		progress : '.fluid-progress'
    };
	
    // Default configuration options.
	var uploadDefaults = {
		uploadUrl : "",
		flashUrl : "",
		fileSizeLimit : "20480",
		fileTypes : "*.*", 
		fileTypesText : "image files",
		fileUploadLimit : 0,
		fileQueueLimit : 0,
		elmUploaderControl: "",
		whenDone: "", // forces a refresh
		whenCancel: "", // forces a refresh
		whenFileUploaded: function(fileName, serverResponse) {},
		postParams: {},
		httpUploadElm: "",
		continueAfterUpload: true,
		dialogDisplay: false,
		queueListMaxHeight : 200,
        fragmentSelectors: defaultSelectors,
		debug: false
	};
	
	var strings = {
		macControlKey: "Command",
		browseText: "Browse files",
		addMoreText: "Add more",
		fileUploaded: "File Uploaded"
	};
		
	/* DOM Manipulation */

	/** 
	* removes the defined row from the file queue 
	* @param {jQuery} row	a jQuery object for the row
	* @param {SWFUpload} swfObj	the SWF upload object
	* @param {Object} status	the status object to be updated
	* @return {jQuery}	returns the same jQuery object
	*/
	var removeRow = function(uploaderContainer, fragmentSelectors, row, swfObj, status) {
		row.fadeOut('fast', function (){
			var fileId = row.attr('id');
			var file = swfObj.getFile(fileId);
			queueSize (status, -file.size);
			status.totalCount--;
			swfObj.cancelUpload(fileId);
			row.remove();
			updateNumFiles(uploaderContainer, fragmentSelectors.txtTotalFiles, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow);
			updateState(uploaderContainer, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow);
			updateTotalBytes(uploaderContainer, fragmentSelectors.txtTotalBytes, status);
			updateBrowseBtnText(uploaderContainer, fragmentSelectors.browse, status);
		});
		return row;
	};
	
	var updateNumFiles = function(uploaderContainer, totalFilesSelector, fileQueueSelector, emptyRowSelector) {
		$(totalFilesSelector, uploaderContainer).text(numFilesToUpload(uploaderContainer, fileQueueSelector, emptyRowSelector));
	};
	
	/**
	 * Updates the total number of bytes in the UI
	 */
	var updateTotalBytes = function(uploaderContainer, totalBytesSelector, status) {
		$(totalBytesSelector, uploaderContainer).text(fluid.utils.filesizeStr(queueSize(status)));
	};
	 
    /*
     * Sets the state (using a css class) for the top level element
     * @param {String} uploaderContainer    the uploader container
     * @param {String} stateClass    optional class to be assigned.
     *                               If not specified, either 'loaded' or 'empty' will be used.
     */
	var updateState = function(uploaderContainer, fileQueueSelector, emptyRowSelector, stateClass) {
		if (stateClass === undefined) {
			stateClass = (numFilesInQueue(uploaderContainer, fileQueueSelector, emptyRowSelector) > 0) ? "loaded" : "empty";
		}

		// this needs to be changed, because it assumes mark-up structure
		$("#" + uploaderContainer[0].id + " > div").attr('className',stateClass);
	};
	
	var updateBrowseBtnText = function(uploaderContainer, browseButtonSelector, status) {
		if (status.totalCount > 0) {
			$(browseButtonSelector, uploaderContainer).text(strings.addMoreText);
		} else {
			$(browseButtonSelector, uploaderContainer).text(strings.browseText);
		}
	};
	
	 var markRowComplete = function(row, fileStatusSelector) {
		// mark the row uploaded
		row.addClass('uploaded');
		// add Complete text status
		setRowStatus(row, fileStatusSelector, strings.fileUploaded);
	};

	 var setRowStatus = function(row, fileStatusSelector, str) {
		$(row).children(fileStatusSelector).text(str);
	};
	
	// UTILITY SCRIPTS
	/**
	 * displays URL/URI or runs provided function
	 * does not validate action, unknown what it would do with other types of input
	 * @param {String, Function} action
	 */
	var variableAction = function(action) {
		if (action !== undefined) {
			if (typeof action === "function") {
				action();
			}
			else {
				location.href = action;
			}
		}
	};
	
	// SWF Upload Callback Handlers

    /*
     * @param {String} uploaderContainer    the uploader container
     * @param {int} maxHeight    maximum height in pixels for the file queue before scrolling
     * @param {Object} status    
     */
	var createFileQueuedHandler = function (uploaderContainer, fragmentSelectors, maxHeight, status) {
        return function(file){
            var swfObj = this;
            try {
                // make a new jQuery object
                // add the size of the file to the variable maintaining the total size
                queueSize(status, file.size);
                
                // make a new row
                var queue_row = $('<tr id="' + file.id + '">' +
                '<th class="fileName" scope="row">' +
                file.name +
                '</th>' +
                '<td class="fileSize">' +
                fluid.utils.filesizeStr(file.size) +
                '</td>' +
                '<td class="fileRemove"><button type="button" class="removeFile" /></td></tr>');
                
                // add a hover to the row
                queue_row.css('display', 'none').hover(function(){
                    if (!$(this).hasClass('uploaded')) {
                        $(this).addClass('hover');
                    }
                }, function(){
                    if (!$(this).hasClass('uploaded')) {
                        $(this).removeClass('hover');
                    }
                });
                
                // add the queue to the list right before the placeholder which is always at the end
                queue_row.insertBefore($(fragmentSelectors.emptyRow, uploaderContainer));
                
                // add remove action to the button
                $('#' + file.id + ' .removeFile').click(function(){
                    removeRow(uploaderContainer, fragmentSelectors, $(this).parents('tr'), swfObj, status);  
                });
                
                // show the row
                $('#' + file.id, uploaderContainer).fadeIn('slow');
                
                // set the height but only if it's over the maximum
                // this because max-height doesn't seem to work for tbody
                if ($(fragmentSelectors.fileQueue + ' tbody', uploaderContainer).height() > maxHeight) {
                    $(fragmentSelectors.fileQueue + ' tbody', uploaderContainer).height(maxHeight);
                }
                updateState(uploaderContainer, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow);
                updateNumFiles(uploaderContainer, fragmentSelectors.txtTotalFiles, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow);
                updateTotalBytes(uploaderContainer, fragmentSelectors.txtTotalBytes, status);
                
            } 
            catch (ex) {
                fluid.utils.debug(ex);
            }
        };
	};

	function fileDialogStart() {
		try {
			// do nothing
		} catch (ex) {
			fluid.utils.debug (ex);
		}
	}

	var createFileDialogCompleteHandler = function (uploaderContainer, fragmentSelectors, status) {
        return function(numSelected, numQueued){
            try {
                status.currCount = 0;
                status.currTotalBytes = 0;
                status.totalCount = numFilesToUpload(uploaderContainer, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow);
                updateBrowseBtnText(uploaderContainer, fragmentSelectors.browse, status);
                debugStatus(status);
            } 
            catch (ex) {
                fluid.utils.debug(ex);
            }
        };
	};

	function fileQueueError(file, error_code, message) {
		try {
			var error_name = "";
			switch (error_code) {
			case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
				error_name = "QUEUE LIMIT EXCEEDED";
				break;
			case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
				error_name = "FILE EXCEEDS SIZE LIMIT";
				break;
			case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
				error_name = "ZERO BYTE FILE";
				break;
			case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
				error_name = "INVALID FILE TYPE";
				break;
			default:
				error_name = "UNKNOWN";
				break;
			}
			var error_string = error_name + ":File ID: " + (typeof(file) === "object" && file !== null ? file.id : "na") + ":" + message;
			fluid.utils.debug ('error_string = ' + error_string);
		} catch (ex) {
			fluid.utils.debug (ex);
		}
	}	

    var createUploadStartHandler = function (progressBar, status) {
        return function (fileObj) {
            uploadStart (fileObj, progressBar, status);
        };
    };
    
	var uploadStart = function(fileObj, progressBar, status) {
		status.currError = ''; // zero out the error so we can check it later
		status.currCount++;
		updateProgress(progressBar, 0,fileObj.name,0,status.currCount,status.totalCount);
		fluid.utils.debug (
			"Starting Upload: " + status.currCount + ' (' + fileObj.id + ')' + ' [' + fileObj.size + ']' + ' ' + fileObj.name
		);
	};

    // This code was taken from a SWFUpload example.
    // The commented-out lines will be implemented or removed based on our own progress bar code.
	var createUploadErrorHandler = function (progressBar, fragmentSelectors, status) {
        return function(file, error_code, message){
            status.currError = '';
            try {
                switch (error_code) {
                    case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                        status.currError = "Error Code: HTTP Error, File name: " + file.name + ", Message: " + message;
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                        status.currError = "Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
                        break;
                    case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                        status.currError = "Error Code: IO Error, File name: " + file.name + ", Message: " + message;
                        break;
                    case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                        status.currError = "Error Code: Security Error, File name: " + file.name + ", Message: " + message;
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                        status.currError = "Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
                        break;
                    case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                        status.currError = "Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
                        break;
                    case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                        // If there aren't any files left (they were all cancelled) disable the cancel button
                        if (this.getStats().files_queued === 0) {
                            document.getElementById(this.customSettings.cancelButtonId).disabled = true;
                        }
                        //				progress.SetStatus("Cancelled");
                        //				progress.SetCancelled();
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                        status.currError = "Upload Stopped by user input";
                        //				progress.SetStatus("Stopped");
                        hideProgress(progressBar, true);
                        break;
                    default:
                        //				progress.SetStatus("Unhandled Error: " + error_code);
                        status.currError = "Error Code: " + error_code + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
                        break;
                }
                fluid.utils.debug(status.currError);
            } 
            catch (ex) {
                fluid.utils.debug(ex);
            }
        };
	};

	var uploadProgress = function(progressBar, fileObj,bytes,totalBytes, fragmentSelectors, status) {
		fluid.utils.debug ('File Status :: bytes = ' + bytes + ' :: totalBytes = ' + totalBytes);
		fluid.utils.debug ('Total Status :: currBytes = ' + (status.currTotalBytes + bytes)  + ' :: totalBytes = ' + queueSize (status));
		updateProgress(progressBar,
                       fluid.utils.derivePercent (bytes,totalBytes),
                       fileObj.name,
                       fluid.utils.derivePercent (status.currTotalBytes + bytes, queueSize (status)),
                       status.currCount,
                       status.totalCount);
	};
	
    var createUploadProgressHandler = function (progressBar, fragmentSelectors, status) {
        return function(fileObj, bytes, totalBytes) {
            uploadProgress (progressBar, fileObj, bytes, totalBytes, fragmentSelectors, status);
        };
    };
    
	var createUploadCompleteHandler = function (uploaderContainer, progressBar,  fragmentSelectors, status, options) {
        return function(file){
            if (!status.currError) {
            
                if ((file.index + 1) === status.totalCount) {
                    // we've completed all the files in this upload
                    updateProgress(progressBar, 100, file.name, 100, status.totalCount, status.totalCount);
                    fileQueueComplete(uploaderContainer, options, progressBar, fragmentSelectors);
                }
                else {
                    // there are still files to go, fire off the next one
                    status.currTotalBytes += file.size; // now update currTotalBytes with the actual file size
                    updateProgress(progressBar, 100, file.name);
                    this.startUpload(); // if there hasn't been an error then start up the next upload
                                        // in this handler, 'this' is the SWFUpload object
                }
                
                markRowComplete($('tr#' + file.id, uploaderContainer), fragmentSelectors.txtFileStatus);
                
            }
            else {
                fluid.utils.debug(status.currError);
                hideProgress(progressBar, true);
            }
        };
	};
	
	var createUploadSuccessHandler =  function(whenFileUploaded){
		return function(file, server_data) {
			whenFileUploaded(file.name, server_data);
		};
	};	
	
	var fileQueueComplete = function(uploaderContainer, options, progressBar, fragmentSelectors) {
		updateState(uploaderContainer, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow, 'done');
		hideProgress(progressBar, false);
		if (options.continueAfterUpload) {
			variableAction(options.whenDone);
		}
	};

    /*
     * Return the queue size. If a number is passed in, increment the size first.
     */
	 var queueSize = function (status, delta) {
		if (typeof delta === 'number') {
			status.totalBytes += delta;
		}
		return status.totalBytes;
	};

	function numFilesToUpload(uploaderContainer, fileQueueSelector, emptyRowSelector) {
		return numFilesInQueue(uploaderContainer, fileQueueSelector, emptyRowSelector) - numFilesUploaded(uploaderContainer, fileQueueSelector);
	}
	
	function numFilesInQueue(uploaderContainer, fileQueueSelector, emptyRowSelector) {
		return $(fileQueueSelector + ' tbody tr:not("' + emptyRowSelector + '")', uploaderContainer).length ;
	}

	function numFilesUploaded(uploaderContainer, fileQueueSelector) {
		return $(fileQueueSelector + ' tbody tr.uploaded', uploaderContainer).length;
	}

	/* PROGRESS
	 * 
	 */

	var updateProgress = function(progressBar, filePercent, fileName, totalPercent, fileIndex, totalFileNum){
        
		//<span class="file_name">&nbsp;</span> :: 0</span>% complete
		// update file information
		var fileLabel = '<span class="file_name">' + fileName + '</span> :: <span class="percent">' + filePercent + '</span>% complete';
		progressBar.update(progressBar.fragmentSelectors.fileProgress, filePercent, fileLabel);
		
		// update total info
		if (totalPercent) {
			var totalLabel = 'Total Progress: <span class="percent">' + totalPercent 
			+ '</span>% [<span class="file_index">' + fileIndex 
			+ '</span> of <span class="total_file_num">' + totalFileNum 
			+ '</span> files]';
			progressBar.update(progressBar.fragmentSelectors.totalProgress, totalPercent, totalLabel);
			// if we've completed the progress then hide the progress after a delay
		}
	};
	
	var hideProgress = function(progressBar, dontPause) {
	 	progressBar.hide(dontPause);
	};

	/* DEV CODE
	 * to be removed after beta or factored into unit tests
	 */
	
	function debugStatus(status) {
		fluid.utils.debug (
			"\n status.totalBytes = " + queueSize (status) + 
			"\n status.totalCount = " + status.totalCount + 
			"\n status.currCount = " + status.currCount + 
			"\n status.currTotalBytes = " + status.currTotalBytes + 
			"\n status.currError = " + status.currError
		);
	}
	
	/* DEMO CODE
	 * this is code that fakes an upload with out a server
	 */

 
    // need to pass in current uploader
    
    var demoUpload = function (uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status) {
        var demoState = {};
        
        fluid.utils.debug (numFilesToUpload(uploaderContainer, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow)); // check the current state 
        
		if (status.stop === true) {
			queueSize (status, -status.currTotalBytes);
			updateTotalBytes(uploaderContainer, fragmentSelectors.txtTotalBytes, status);
			updateNumFiles(uploaderContainer, fragmentSelectors.txtTotalFiles, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow);
			demoStop();
		} else if (numFilesToUpload(uploaderContainer, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow)) { // there are still files to upload
			demoState.bytes = 0;
			demoState.byteChunk = 200000; // used to break the demo upload into byte-sized chunks
			// set up data
			demoState.row = $(fragmentSelectors.fileQueue + ' tbody tr:not(".fluid-uploader-placeholder"):not(".uploaded)', uploaderContainer).eq(0);
			
			demoState.fileId = jQuery(demoState.row).attr('id');
			demoState.fileObj = swfObj.getFile(demoState.fileId);
			demoState.bytes = 0;
			demoState.totalBytes = demoState.fileObj.size;
			demoState.numChunks = Math.ceil(demoState.totalBytes / demoState.byteChunk);
			fluid.utils.debug ('DEMO :: ' + demoState.fileId + ' :: totalBytes = ' 
                + demoState.totalBytes + ' numChunks = ' + demoState.numChunks);
			
			// start the demo upload
			uploadStart(demoState.fileObj, progressBar, status);
			
			// perform demo progress
			demoProgress();
		} else { // no more files to upload close the display
			fileQueueComplete(uploaderContainer, options, progressBar, fragmentSelectors);
		}

        function demoProgress() {
    		if (status.stop === true) {
    			demoStop();
    		} else {
    			var delay = Math.floor(Math.random() * 5000 + 1) > 1;
    			var tmpBytes = (demoState.bytes + demoState.byteChunk);
    			if (tmpBytes < demoState.totalBytes) {
    				fluid.utils.debug ('tmpBytes = ' + tmpBytes + ' totalBytes = ' + demoState.totalBytes);
    				uploadProgress(progressBar, demoState.fileObj, tmpBytes, demoState.totalBytes, fragmentSelectors, status);
    				demoState.bytes = tmpBytes;
    				var pause = setTimeout(demoProgress, delay);
    			}
    			else {
    				uploadProgress(progressBar, demoState.fileObj, demoState.totalBytes, demoState.totalBytes, fragmentSelectors, status);
    				var timer = setTimeout(demoComplete,delay);
    			}
    		}  
    	}
        
        function demoComplete() {
    		var row = $('tr#'+ demoState.fileObj.id, uploaderContainer);
    		// mark the row completed
    		markRowComplete(row, fragmentSelectors.txtFileStatus);
    		
    		status.currTotalBytes += demoState.fileObj.size; 
    		updateNumFiles(uploaderContainer, fragmentSelectors.txtTotalFiles, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow);
    		updateTotalBytes(uploaderContainer, fragmentSelectors.txtTotalBytes, status);
            var dUpload = function () {
                demoUpload(uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status);
            };
    		var pause = setTimeout(dUpload,1200); // if there hasn't been an error then start up the next upload	
    	}
        
	    function demoStop () {
    		hideProgress(progressBar, true);
    		status.stop = false;
    		status.currCount = 0;
    		status.currTotalBytes = 0;
    		status.totalCount = numFilesToUpload(uploaderContainer, fragmentSelectors.fileQueue, fragmentSelectors.emptyRow);
    	}
        
     };    

    function initSWFUpload(uploaderContainer, uploadURL, flashURL, progressBar, status, fragmentSelectors, options) {
		// Initialize the uploader SWF component
		// Check to see if SWFUpload is available
		if (typeof(SWFUpload) === "undefined") {
			return null;
		}
        
		var swf_settings = {
			// File Upload Settings
			upload_url: uploadURL,
			flash_url: flashURL,
            post_params: options.postParams,
			
			file_size_limit: options.fileSizeLimit,
			file_types: options.fileTypes,
			file_types_description: options.fileTypesDescription,
			file_upload_limit: options.fileUploadLimit,
			file_queue_limit: options.fileQueueLimit,
			
			// Event Handler Settings
			file_dialog_start_handler: fileDialogStart,
			file_queued_handler: createFileQueuedHandler (uploaderContainer, fragmentSelectors, options.queueListMaxHeight, status),
			file_queue_error_handler: fileQueueError,
			file_dialog_complete_handler: createFileDialogCompleteHandler (uploaderContainer, fragmentSelectors, status),
			upload_start_handler: createUploadStartHandler (progressBar, status),
			upload_progress_handler: createUploadProgressHandler (progressBar, fragmentSelectors, status),
			upload_complete_handler: createUploadCompleteHandler (uploaderContainer, progressBar, fragmentSelectors, status, options),
			upload_error_handler: createUploadErrorHandler (progressBar, fragmentSelectors, status),
			upload_success_handler: createUploadSuccessHandler (options.whenFileUploaded),
			// Debug setting
			debug: options.debug
		}; 
		
        return new SWFUpload(swf_settings);
    }
    
    var whichOS = function () {
		if (navigator.appVersion.indexOf("Win") !== -1) {
            return "Windows";
        }
		if (navigator.appVersion.indexOf("Mac") !== -1) {
            return "MacOS";
        }
		if (navigator.appVersion.indexOf("X11") !== -1) {
            return "UNIX";
        }
		if (navigator.appVersion.indexOf("Linux") !== -1) {
            return "Linux";
        }
        else {
            return "unknown";
        }
	};
    
    var setKeyboardModifierString = function (uploaderContainer, modifierKeySelector) {
        // set the text difference for the instructions based on Mac or Windows
		if (whichOS() === 'MacOS') {
			$(modifierKeySelector, uploaderContainer).text(strings.macControlKey);
		}
    };
    
    var bindEvents = function (uploader, uploaderContainer, swfObj, allowMultipleFiles, whenDone, whenCancel) {
		$(uploader.fragmentSelectors.browse, uploaderContainer).click(function () {
            return (allowMultipleFiles) ? swfObj.selectFiles() : swfObj.selectFile();
		});
        
		$(uploader.fragmentSelectors.upload, uploaderContainer).click(function(){
			if (uploader.status.totalCount > 0) {
				uploader.actions.beginUpload();
			}
		});
		
		$(uploader.fragmentSelectors.pause, uploaderContainer).click(function(){
			swfObj.stopUpload();
		});
		
		$(uploader.fragmentSelectors.done, uploaderContainer).click(function(){
			variableAction(whenDone);
		});
		
		$(uploader.fragmentSelectors.cancel, uploaderContainer).click(function(){
			variableAction(whenCancel);
		});
    };
    
    var enableDemoMode = function (uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status) {
		// this is a local override to do a fake upload
		swfObj.startUpload = function(){
			demoUpload(uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status);
		};
		swfObj.stopUpload = function(){
			status.stop = true;
		};
    };
    
	/* Public API */
	fluid.Uploader = function(uploaderSelector, uploadURL, flashURL, settings){
        
        this.uploaderContainer = jQuery(uploaderSelector);
        
        // Mix user's settings in with our defaults.
        // temporarily public; to be made private after beta
		this.options = $.extend({}, uploadDefaults, settings);
        
        this.fragmentSelectors = this.options.fragmentSelectors;
        var progressSelector = this.fragmentSelectors.progress;
        
        // Should the status object be more self-aware? Should various functions that operate on
        // it (and do little else) be encapsulated in it?
        this.status = {
    		totalBytes:0,
	    	totalCount:0,
		    currCount:0,
	    	currTotalBytes:0,
		    currError:'',
		    stop: false
	    };
    
        var progressBar = new fluid.Progress(progressSelector);

        var swfObj = initSWFUpload(this.uploaderContainer, uploadURL, flashURL, progressBar, this.status, this.fragmentSelectors, this.options);
		
        this.actions = new fluid.SWFWrapper(swfObj);
        
        setKeyboardModifierString(this.uploaderContainer, this.fragmentSelectors.osModifierKey);
        
        // Bind all our event handlers.
        var allowMultipleFiles = (this.options.fileQueueLimit !== 1);
        bindEvents(this, this.uploaderContainer, swfObj, allowMultipleFiles, this.options.whenDone, this.options.whenCancel);
        
		
        // If we've been given an empty URL, kick into demo mode.
        if (uploadURL === '') {
            enableDemoMode(this.uploaderContainer, swfObj, progressBar, this.options, this.fragmentSelectors, this.status);
        }
	};
    
    // temporary debuggin' code to be removed after beta
    // USE: call from the console to check the current state of the options and fragmentSelectors objects
    
	fluid.Uploader.prototype._test = function() {
		var str = "";
		for (key in options) {
            if (options.hasOwnProperty(key)) {
                str += key + ' = ' + options[key] + '\n';
            }
		}
		for (key in this.fragmentSelectors) {
           if (this.fragmentSelectors.hasOwnProperty(key)) {
               str += key + ' = ' + this.fragmentSelectors[key] + '\n';
           }
		}
		fluid.utils.debug (str);
	};
	
    fluid.SWFWrapper = function (swfObject) {
        this.swfObj = swfObject;
    };
    fluid.SWFWrapper.prototype.beginUpload = function() {
		this.swfObj.startUpload();
	};
    
})(jQuery,fluid);

/* PROGRESS
 * Currently, Progress is 'contextless' in that it requires the element which contains the progress bar to be 
 * passed in however, it is not fully stateless in that it holds a 'lastPercent' variable. 
*/

(function ($) {
	
    var defaultSelectors = {
		fileProgress: '.file-progress',
		totalProgress: '.total-progress'
    };

	 
	 function animateToWidth(elm,width) {
		elm.animate({ 
		    width: width,
			queue: false
		 }, 200 );
	}
    
    var hideNow = function(which){
        which.fadeOut('slow');
    };      
	
    // This should probably be done in the CSS style sheet rather than in javascript
    var createInitScript = function (container, fragmentSelectors) {
        return function() {
	    	$('.progress-mask', container).css('opacity',0.80);
		    $('.progress-mask-btm', container).height(container.height() - 14);
	     };
    };
 
	 /* Constructor */
	fluid.Progress = function (containerSelector, options) {
        this.progressContainer = jQuery(containerSelector);
        this.fragmentSelectors = (options) ? fluid.utils.initCssClassNames(defaultSelectors, options.fragmentSelectors) : defaultSelectors;
        
    	this.lastPercent = 0;
        // other states to be added
        // opacity
        // delay
        // anamitation style
        // initialization function to handle css display effects
        // options for element selectors inside the container

    	$(document).ready(createInitScript(this.progressContainer, this.fragmentSelectors));

	};
    
    fluid.Progress.prototype.update = function(indicator, percent, label, text) {
		var percentpercent = percent+'%';
        // we may want to pull out the 'progress' element and use it to constrain the other searches.
		var labelElm = $(indicator + ' .progress-label', this.progressContainer);
		var progressElm = $(indicator + ' .progress-indicator', this.progressContainer);
		
		// if there is a separate text indicator then update the text
		if (text) {
			var textElm = $(indicator + ' .progress-text', this.progressContainer);
			textElm.html(text);
		}
		
		if (this.progressContainer.css("display") === "none") {
			this.progressContainer.fadeIn('slow');
		}
		fluid.utils.debug ('percent = ' + percent + ' lastPercent = ' + this.lastPercent);
		
		//update the label of the indicator
		labelElm.html(label);
		
		// de-queue any left over animations
		progressElm.queue("fx", []); 
		
		if (percent === 0) {
			progressElm.width(1);
		} else if (percent < this.lastPercent) {
			progressElm.width(percentpercent);
		} else {
			progressElm.animate({ 
	    		width: percentpercent,
				queue: false
	  		}, 200 );
		}
		this.lastPercent = percent;
	};
        
    fluid.Progress.prototype.hide = function(dontPause) {
        var progressContainer = this.progressContainer;
		var delay = 1600;
		if (dontPause) {
			hideNow(progressContainer);
		} else {
			var timeOut = setTimeout(function(){
                hideNow(progressContainer);
            }, delay);
		}
	};
    
    fluid.Progress.prototype.show = function() {
		this.progressContainer.fadeIn('slow');
	};
	
})(jQuery);

//fluid.Progress.update('.fluid-progress','.file-progress',40,"Label Change");


/* GRAVEYARD and SCRATCH
 
	// alternate progress handler, look at ways of parameterizing this
	var setProgress = function(filePercent,fileName,totalPercent,fileIndex,totalFileNum) {
		// update file information
		if (fileName) jQuery('#file-progress #file_name').text(fileName);
		updateProgress('#file-progress',filePercent);
		// update total info
		if (totalPercent) updateProgress('#total-progress',totalPercent);
		if (totalFileNum) jQuery('#total-progress #total_file_num').text(totalFileNum);
		if (fileIndex) jQuery('#total-progress #file_index').text(fileIndex);
		jQuery('.progress').fadeIn('fast');
	};
	
	// eventually used to create fileTypes sets.
	var fileTypes = {
		all: {
			ext: "*.*",
			desc: 'all files'
		},
		images: {
			ext: "*.gif;*.jpeg;*.jpg;*.png;*.tiff",
			desc: "image files"
		},
		text:"*.txt;*.text",
		Word:"*.doc;*.xdoc",
		Excel:"*.xls",
	}
	
*/
