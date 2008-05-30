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
 * - handle duplicate file error
 * - make fields configurable
 *	   - strings (for i18n)
 * - refactor 'options' into more than one object as needed
 * - clean up debug code
 * - remove commented-out code
 * - use swfObj status to check states, etc. > drop our status obj
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
		resume: ".fluid-uploader-resume",
		pause: ".fluid-uploader-pause",
		done: ".fluid-uploader-done",
		cancel: ".fluid-uploader-cancel",
		browse: ".fluid-uploader-browse",
		fluidUploader: ".fluid-uploader-queue-wrapper",
		fileQueue: ".fluid-uploader-queue",
		scrollingElement: ".fluid-scroller",
		emptyRow : ".fluid-uploader-row-placeholder",
		txtTotalFiles: ".fluid-uploader-totalFiles",
		txtTotalBytes: ".fluid-uploader-totalBytes",
		osModifierKey: ".fluid-uploader-modifierKey",
		txtFileStatus: ".removeFile",
		progress : '.fluid-progress',
		qRowTemplate: '#queue-row-tmplt',
		qRowFileName: '.fileName',
		qRowFileSize: '.fileSize',
		qRowRemove: '.fileRemove',
		debug: false
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
		continueDelay: 2000, //in milles
		queueListMaxHeight : 190,
        fragmentSelectors: defaultSelectors,
		// when to show the File browser
		// if false then the browser shows when the Browse button is clicked
		// if true
			// if using dialog then browser will show immediately
			// else browser will show as soon as dialog shows
		browseOnInit: false, 
		// dialog settings
		dialogDisplay: false,
		addFilesBtn: ".fluid-add-files-btn", // used in conjunction with dialog display to activate the Uploader
		debug: false
	};
	
	var dialog_settings = {
		title: "Upload Files", 
		width: 482,
		height: '', // left empty so that the dialog will auto-resize
		draggable: true, 
		modal: true, 
		resizable: false,
		autoOpen: false
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
	var removeRow = function(uploaderContainer, fragmentSelectors, row, swfObj, status, maxHeight) {
		row.fadeOut('fast', function (){
			var fileId = row.attr('id');
			var file = swfObj.getFile(fileId);
			queueSize (status, -file.size);
			status.totalCount--;
			swfObj.cancelUpload(fileId);
			row.remove();
			updateQueueHeight($(fragmentSelectors.scrollingElement, uploaderContainer), maxHeight);
			updateNumFiles(uploaderContainer, fragmentSelectors.txtTotalFiles, fragmentSelectors.fluidUploader, fragmentSelectors.emptyRow);
			updateStateByState(uploaderContainer,fragmentSelectors.fluidUploader);
			updateTotalBytes(uploaderContainer, fragmentSelectors.txtTotalBytes, status);
			updateBrowseBtnText(uploaderContainer, fragmentSelectors.browse, status);
		});
		return row;
	};
	
	var updateQueueHeight = function(scrollingElm, maxHeight){
		var overMaxHeight = (scrollingElm.children().eq(0).height() > maxHeight);
		var setHeight = (overMaxHeight) ? maxHeight : '';
		scrollingElm.height( setHeight ) ;
		return overMaxHeight;
	};
	
	var scrollBottom = function(scrollingElm){
		// cast potentially a jQuery obj to a regular obj
		scrollingElm = $(scrollingElm)[0];
		// set the scrollTop to the scrollHeight
		scrollingElm.scrollTop = scrollingElm.scrollHeight;
	};
	
	var scrollTo = function(scrollingElm,row){
		var rowPosTop = $(row)[0].offsetTop;
		var rowHeight = $(row).height();
		var containerScrollTop = $(scrollingElm)[0].scrollTop;
		var containerHeight = $(scrollingElm).height();
		
		// if the top of the row is ABOVE the view port move the row into position
		if (rowPosTop < containerScrollTop) {
			$(scrollingElm)[0].scrollTop = rowPosTop;
		}
		
		// if the bottom of the row is BELOW the viewport then scroll it into position
		if ((rowPosTop + rowHeight) > (containerScrollTop + containerHeight)) {
			$(scrollingElm)[0].scrollTop = (rowPosTop - containerHeight + rowHeight);
		}
		//$(scrollingElm)[0].scrollTop = $(row)[0].offsetTop;
	};
	
	var updateNumFiles = function(uploaderContainer, totalFilesSelector, fileQueueSelector) {
		$(totalFilesSelector, uploaderContainer).text(numFilesToUpload(uploaderContainer, fileQueueSelector));
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
     * @param {String} fileQueueSelector    the file queue used to test numbers.
     */
	var updateStateByState = function(uploaderContainer, fileQueueSelector) {
		var totalRows = numberOfRows(uploaderContainer, fileQueueSelector);
		var rowsUploaded = numFilesUploaded(uploaderContainer, fileQueueSelector);
		var rowsReady = numFilesToUpload(uploaderContainer, fileQueueSelector);
		
		if (rowsUploaded > 0) {
			if (rowsReady === 0) {
				updateState(uploaderContainer, 'empty');
			} else {
				updateState(uploaderContainer, 'reloaded');
			}
		} else if (numberOfRows(uploaderContainer, fileQueueSelector) === 0) {
			updateState(uploaderContainer, 'start');
		} else {
			updateState(uploaderContainer, 'loaded');
		}
	};
	
    /*
     * Sets the state (using a css class) for the top level element
     * @param {String} uploaderContainer    the uploader container
     * @param {String} stateClass    the file queue used to test numbers.
     */
	var updateState = function(uploaderContainer, stateClass) {
		$(uploaderContainer).children("div:first").attr('className',stateClass);
	};
	
	var updateBrowseBtnText = function(uploaderContainer, browseButtonSelector, status) {
		if (status.totalCount > 0) {
			$(browseButtonSelector, uploaderContainer).text(strings.addMoreText);
		} else {
			$(browseButtonSelector, uploaderContainer).text(strings.browseText);
		}
	};
	
	 var markRowComplete = function(row, fileStatusSelector, removeBtnSelector) {
		// update the status of the row to "uploaded"
		rowChangeState(row, removeBtnSelector, fileStatusSelector, 'uploaded', strings.fileUploaded);
	};
	
	var markRowError = function(row, fileStatusSelector, removeBtnSelector, scrollingElm, maxHeight, humanError) {
		// update the status of the row to "error"
		rowChangeState(row, removeBtnSelector, fileStatusSelector, 'error', 'File Upload Error');
		
		updateQueueHeight(scrollingElm, maxHeight);
		
		if (humanError !== '') {
            displayHumanReableError(row, humanError);
        }	
	};
	
	/* rows can only go from ready to error or uploaded */
	var rowChangeState = function(row, removeBtnSelector, fileStatusSelector, stateClass, stateMessage) {
		
		// remove the ready status and add the new status
		row.removeClass('ready').addClass(stateClass);
		
		// remove click event on Remove button
		$(row).find(removeBtnSelector).unbind('click');
		
		// add text status
		$(row).find(fileStatusSelector).attr('title',stateMessage);
	};
	
	var displayHumanReableError = function(row, humanError) {
		var newErrorRow = $('#queue-error-tmplt').clone();
		$(newErrorRow).find('.queue-error').html(humanError);
		$(newErrorRow).removeAttr('id').insertAfter(row);
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
				var newQueueRow = $(fragmentSelectors.qRowTemplate).clone();
				// update the file name
				$(newQueueRow).children(fragmentSelectors.qRowFileName).text(file.name);
				// update the file size
				$(newQueueRow).children(fragmentSelectors.qRowFileSize).text(fluid.utils.filesizeStr(file.size));
				// update the file id and add the hover action
				newQueueRow.attr('id',file.id).css('display','none').addClass("ready row").hover(function(){
                    if ($(this).hasClass('ready')) {
                        $(this).addClass('hover');
                    }
                }, function(){
                    if ($(this).hasClass('ready')) {
                        $(this).removeClass('hover');
                    }
                });
                // insert the new row into the file queue
				$(fragmentSelectors.fileQueue, uploaderContainer).append(newQueueRow);
				
                // add remove action to the button
                $('#' + file.id, uploaderContainer).children(fragmentSelectors.qRowRemove).click(function(){
                    removeRow(uploaderContainer, fragmentSelectors, $(this).parents('tr'), swfObj, status, maxHeight);  
                });
                
                // display the new row
                $('#' + file.id, uploaderContainer).fadeIn('slow');
				
				updateStateByState(uploaderContainer, fragmentSelectors.fluidUploader);

				var scrollingElm = $(fragmentSelectors.scrollingElement, uploaderContainer);
                
				var scrolling = updateQueueHeight(scrollingElm, maxHeight);
                
				// scroll to the bottom to reviel element
				if (scrolling) {
					scrollBottom(scrollingElm);
				}
				
                updateNumFiles(uploaderContainer, fragmentSelectors.txtTotalFiles, fragmentSelectors.fluidUploader, fragmentSelectors.emptyRow);
                updateTotalBytes(uploaderContainer, fragmentSelectors.txtTotalBytes, status);
                
            } 
            catch (ex) {
                fluid.utils.debug(ex);
            }
        };
	};
	
	var createSWFReadyHandler = function (browseOnInit, allowMultipleFiles, useDialog) {
		return function(){
			if (browseOnInit && !useDialog) {
				browseForFiles(this,allowMultipleFiles);
			}
		};
	};
	
	function browseForFiles(swfObj,allowMultipleFiles) {
		if (allowMultipleFiles) {
			this.selectFiles();
		}
		else {
			this.selectFile();
		}
	}

	var createFileDialogStartHandler = function(uploaderContainer){
		return function(){
			try {
				$(uploaderContainer).children("div:first").addClass('browsing');
			} 
			catch (ex) {
				fluid.utils.debug(ex);
			}
		};
	};

	var createFileDialogCompleteHandler = function(uploaderContainer, fragmentSelectors, status) {
        return function(numSelected, numQueued){
            try {
                status.currCount = 0;
                status.currTotalBytes = 0;
                status.totalCount = numFilesToUpload(uploaderContainer, fragmentSelectors.fluidUploader);
                updateBrowseBtnText(uploaderContainer, fragmentSelectors.browse, status);
				$(uploaderContainer).children("div:first").removeClass('browsing');
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

    var createUploadStartHandler = function (uploaderContainer, fragmentSelectors, progressBar, status) {
        return function (fileObj) {
            uploadStart (fileObj, uploaderContainer, fragmentSelectors, progressBar, status);
        };
    };
    
	var uploadStart = function(fileObj, uploaderContainer, fragmentSelectors, progressBar, status) {
		status.currError = ''; // zero out the error so we can check it later
		status.currCount++;
		scrollTo($(fragmentSelectors.scrollingElement, uploaderContainer),$("#"+fileObj.id, uploaderContainer));
		updateProgress(progressBar, 0, fileObj.name, 0, status.currCount, status.totalCount);
		updateState(uploaderContainer,'uploading');
		fluid.utils.debug (
			"Starting Upload: " + status.currCount + ' (' + fileObj.id + ')' + ' [' + fileObj.size + ']' + ' ' + fileObj.name
		);
	};

    // This code was taken from a SWFUpload example.
    // The commented-out lines will be implemented or removed based on our own progress bar code.
	var createUploadErrorHandler = function (uploaderContainer, progressBar, fragmentSelectors, maxHeight, status, options) {
        return function(file, error_code, message){
            status.currError = '';
			var humanErrorMsg = '';
			var markError = true;
			var queueContinueOnError = false;
            try {
                switch (error_code) {
                    case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                        status.currError = "Error Code: HTTP Error, File name: " + file.name + ", Message: " + message;
						humanErrorMsg = 'An upload error occurred. Mostly likely because the file is already in your collection.' + 
						formatErrorCode(message);
						queueContinueOnError = true;
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
						updateState(uploaderContainer,'paused');
                        hideProgress(progressBar, true, $(fragmentSelectors.done, uploaderContainer));
						markError = false;
                        break;
                    default:
                        //				progress.SetStatus("Unhandled Error: " + error_code);
                        status.currError = "Error Code: " + error_code + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
                        break;
                }
								
				if (markError) {
                    markRowError($('tr#' + file.id, uploaderContainer), fragmentSelectors.txtFileStatus, fragmentSelectors.qRowRemove, $(fragmentSelectors.scrollingElement, uploaderContainer), maxHeight, humanErrorMsg);
                }
                
				// if the file upload error is very file specific then start the next upload
				if (queueContinueOnError) {
                    this.startUpload();
                }
                
				fluid.utils.debug(status.currError + '\n' + humanErrorMsg);
				
				// override continueAfterUpload
				options.continueAfterUpload = false;
            } 
            catch (ex) {
                fluid.utils.debug(ex);
            }
        };
	};
	
	var formatErrorCode = function(str) {
		return " (Error code: " + str + ")";
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
    
	var createUploadCompleteHandler = function (uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj) {
        return function(file){
            if (!status.currError) {
            
                if ((file.index + 1) === status.totalCount) {
                    // we've completed all the files in this upload
                    updateProgress(progressBar, 100, file.name, 100, status.totalCount, status.totalCount);
                    fileQueueComplete(uploaderContainer, options, progressBar, fragmentSelectors, dialogObj);
                }
                else {
                    // there are still files to go, fire off the next one
                    status.currTotalBytes += file.size; // now update currTotalBytes with the actual file size
                    updateProgress(progressBar, 100, file.name);
                    this.startUpload(); // if there hasn't been an error then start up the next upload
                                        // in this handler, 'this' is the SWFUpload object
                }
                
                markRowComplete($('tr#' + file.id, uploaderContainer), fragmentSelectors.txtFileStatus, fragmentSelectors.qRowRemove);
                
            }
            else {
                fluid.utils.debug(status.currError);
                hideProgress(progressBar, true, $(fragmentSelectors.done, uploaderContainer));
            }
        };
	};
	
	var createUploadSuccessHandler =  function(whenFileUploaded){
		return function(file, server_data) {
			whenFileUploaded(file.name, server_data);
		};
	};	
	
	var fileQueueComplete = function(uploaderContainer, options, progressBar, fragmentSelectors) {
		updateState(uploaderContainer, 'done');
		hideProgress(progressBar, false, $(fragmentSelectors.done, uploaderContainer));
		options.continueDelay = (!options.continueDelay) ? 0 : options.continueDelay;
		if (options.continueAfterUpload) {
			setTimeout(function(){
				variableAction(options.whenDone);
			},options.continueDelay);
			if (dialogObj) {
                closeDialog(dialogObj);
            }
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
	
	function numberOfRows(uploaderContainer, fileQueueSelector) {
		return $(fileQueueSelector, uploaderContainer).find('.row').length ;
	}

	function numFilesToUpload(uploaderContainer, fileQueueSelector) {
		return $(fileQueueSelector, uploaderContainer).find('.ready').length ;
	}
	
	function numFilesUploaded(uploaderContainer, fileQueueSelector) {
		return $(fileQueueSelector, uploaderContainer).find('.uploaded').length;
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
	
	var hideProgress = function(progressBar, dontPause, focusAfterHide) {
	 	progressBar.hide(dontPause);
        focusAfterHide.focus();
	};
	
	/* DIALOG
	 * 
	 */
	
 	var initDialog = function(uploaderSelector, addBtnSelector, browseOnInit, uploaderContainer, fileBrowseSelector) {
		dialogObj = $(uploaderSelector).dialog(dialog_settings).css('display','block');
		$(addBtnSelector).click(function(){
			$(dialogObj).dialog("open");
			if (browseOnInit) {
				$(fileBrowseSelector, uploaderSelector).click();
			}
		});
		
		
		
		return dialogObj;
	};
		
	var closeDialog = function(dialogObj) {
		$(dialogObj).dialog("close");
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
    
    var demoUpload = function (uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status, dialogObj) {
        var demoState = {};
        
        fluid.utils.debug("num of ready files = " + numFilesToUpload(uploaderContainer, fragmentSelectors.fluidUploader)); // check the current state 
        
		if (status.stop === true) {
			queueSize (status, -status.currTotalBytes);
			updateTotalBytes(uploaderContainer, fragmentSelectors.txtTotalBytes, status);
			updateNumFiles(uploaderContainer, fragmentSelectors.txtTotalFiles, fragmentSelectors.fluidUploader, fragmentSelectors.emptyRow);
			demoStop();
		} else if (numFilesToUpload(uploaderContainer, fragmentSelectors.fluidUploader)) { // there are still files to upload
			demoState.bytes = 0;
			demoState.byteChunk = 200000; // used to break the demo upload into byte-sized chunks
			// set up data
			demoState.row = $(fragmentSelectors.fluidUploader + ' tbody tr:not(".fluid-uploader-placeholder"):not(".uploaded)', uploaderContainer).eq(0);
			
			demoState.fileId = jQuery(demoState.row).attr('id');
			demoState.fileObj = swfObj.getFile(demoState.fileId);
			demoState.bytes = 0;
			demoState.totalBytes = demoState.fileObj.size;
			demoState.numChunks = Math.ceil(demoState.totalBytes / demoState.byteChunk);
			fluid.utils.debug ('DEMO :: ' + demoState.fileId + ' :: totalBytes = ' 
                + demoState.totalBytes + ' numChunks = ' + demoState.numChunks);
			
			// start the demo upload
			uploadStart(demoState.fileObj, uploaderContainer, fragmentSelectors, progressBar, status);
			
			// perform demo progress
			demoProgress();
		} else { // no more files to upload close the display
			fileQueueComplete(uploaderContainer, options, progressBar, fragmentSelectors, dialogObj);
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
    		markRowComplete(row, fragmentSelectors.txtFileStatus, fragmentSelectors.qRowRemove);
    		
    		status.currTotalBytes += demoState.fileObj.size; 
    		updateNumFiles(uploaderContainer, fragmentSelectors.txtTotalFiles, fragmentSelectors.fluidUploader, fragmentSelectors.emptyRow);
    		updateTotalBytes(uploaderContainer, fragmentSelectors.txtTotalBytes, status);
            var dUpload = function () {
                demoUpload(uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status, dialogObj);
            };
    		var pause = setTimeout(dUpload,1200); // if there hasn't been an error then start up the next upload	
    	}
        
	    function demoStop () {
    		hideProgress(progressBar, true, $(fragmentSelectors.done, uploaderContainer));
    		status.stop = false;
    		status.currCount = 0;
    		status.currTotalBytes = 0;
    		status.totalCount = numFilesToUpload(uploaderContainer, fragmentSelectors.fluidUploader);
			if (status.totalCount > 0) {
				updateState(uploaderContainer,'paused');
			} else {
				updateState(uploaderContainer,'done');
			}
    	}
        
     };    

    function initSWFUpload(uploaderContainer, uploadURL, flashURL, progressBar, status, fragmentSelectors, options, allowMultipleFiles, dialogObj) {
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
			swfupload_loaded_handler : createSWFReadyHandler(options.browseOnInit, allowMultipleFiles, options.dialogDisplay),
			file_dialog_start_handler: createFileDialogStartHandler (uploaderContainer),
			file_queued_handler: createFileQueuedHandler (uploaderContainer, fragmentSelectors, options.queueListMaxHeight, status),
			file_queue_error_handler: fileQueueError,
			file_dialog_complete_handler: createFileDialogCompleteHandler (uploaderContainer, fragmentSelectors, status),
			upload_start_handler: createUploadStartHandler (uploaderContainer, fragmentSelectors, progressBar, status),
			upload_progress_handler: createUploadProgressHandler (progressBar, fragmentSelectors, status),
			upload_complete_handler: createUploadCompleteHandler (uploaderContainer, progressBar, fragmentSelectors, status, options, dialogObj),
			upload_error_handler: createUploadErrorHandler (uploaderContainer, progressBar, fragmentSelectors, options.queueListMaxHeight, status, options),
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

		// browse button
        var activateBrowse = function () {
            return (allowMultipleFiles) ? swfObj.selectFiles() : swfObj.selectFile();
		};
        
		$(uploader.fragmentSelectors.browse, uploaderContainer).click(activateBrowse).activatable(activateBrowse);
        
		// upload button
		$(uploader.fragmentSelectors.upload, uploaderContainer).click(function(){
			if ($(uploader.fragmentSelectors.upload, uploaderContainer).css('cursor') === 'pointer') {
				uploader.actions.beginUpload();
			}
		});
		
		// resume button
		$(uploader.fragmentSelectors.resume, uploaderContainer).click(function(){
			if ($(uploader.fragmentSelectors.resume, uploaderContainer).css('cursor') === 'pointer') {
				uploader.actions.beginUpload();
			}
		});
		
		// pause button
		$(uploader.fragmentSelectors.pause, uploaderContainer).click(function(){
			swfObj.stopUpload();
		});
		
		// done button
		$(uploader.fragmentSelectors.done, uploaderContainer).click(function(){
			variableAction(whenDone);
		});
		
		// cancel button
		$(uploader.fragmentSelectors.cancel, uploaderContainer).click(function(){
			variableAction(whenCancel);
		});
    };
    
    var enableDemoMode = function (uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status, dialogObj) {
		// this is a local override to do a fake upload
		swfObj.startUpload = function(){
			demoUpload(uploaderContainer, swfObj, progressBar, options, fragmentSelectors, status, dialogObj);
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
				
		var allowMultipleFiles = (this.options.fileQueueLimit !== 1);

 		// displaying Uploader in a dialog
		if (this.options.dialogDisplay) {
			var dialogObj = initDialog(uploaderSelector, this.options.addFilesBtn, this.options.browseOnInit, this.uploaderContainer, this.fragmentSelectors.browse);
		}

        var swfObj = initSWFUpload(this.uploaderContainer, uploadURL, flashURL, progressBar, this.status, this.fragmentSelectors, this.options, allowMultipleFiles, dialogObj);
		
        this.actions = new fluid.SWFWrapper(swfObj);
        
        setKeyboardModifierString(this.uploaderContainer, this.fragmentSelectors.osModifierKey);
        
        // Bind all our event handlers.
        bindEvents(this, this.uploaderContainer, swfObj, allowMultipleFiles, this.options.whenDone, this.options.whenCancel);
		
        // If we've been given an empty URL, kick into demo mode.
        if (uploadURL === '') {
            enableDemoMode(this.uploaderContainer, swfObj, progressBar, this.options, this.fragmentSelectors, this.status, dialogObj);
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
		totalProgress: '.total-progress',
        pause: ".fluid-uploader-pause"
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
			$(this.fragmentSelectors.pause, this.progressContainer).focus();
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

	// for use in a better way of setting state to simplify structure
	states: "start uploading browse loaded reloaded paused empty done",

*/
