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
 * 
*/

/* TODO:
 * - abstract the swfObj and the jQUploaderObj to handle multiple instances
 * - handle duplicate file error
 * - make fields configurable
 * - add scroll to bottom
 * - fix resume
 * - move utility scripts to Fluid.js: percent, filesize, debug (what else?)
 */

/* ABOUT RUNNING IN LOCAL TEST MODE
 * To run locally using a fake upload, set uploadDefaults.uploadUrl to ''
 */

var fluid = fluid || {};
var swfObj = {};

(function ($,fluid) {
	
	// TODO: for now this is a single object but well re-factor to handle multiple uploaders in the next pass
	var jQUploaderObj = {};
	
	var options = options || {};

	var uploadDefaults = {
		uploadUrl : "",
		flashUrl : "",
		fileSizeLimit : "20480",
		fileTypes : "*.*", 
		fileTypesText : "image files",
		fileUploadLimit : 0,
		fileQueueLimit : 0,
		elmUploader: "#single-inline-fluid-uploader",
		elmUploaderControl: "",
		whenDone: "", // forces a refresh
		whenCancel: "", // forces a refresh
		postParams: {},
		httpUploadElm: "",
		continueAfterUpload: true,
		dialogDisplay: false,
		queueListMaxHeight : 200,
		debug: false
	};
	
	/* these are the internal UI elements of the Uploader as defined in the 
	 * default HTML for the Fluid Uploader
	 * the master upload container is used for styling and not for funcitonal reference
	 * as there could be more than one uploader
	 */
	var elements = {
		elmUploadContainer: ".fluid-uploader",
		elmUpload: ".fluid-uploader-upload",
		elmPause: ".fluid-uploader-pause",
		elmBrowse: ".fluid-uploader-browse",
		elmDone: ".fluid-uploader-done",
		elmCancel: ".fluid-uploader-cancel",
		elmFileQueue: ".fluid-uploader-queue",
		elmEmptyRow : ".fluid-uploader-row-placeholder",
		txtTotalFiles: ".fluid-uploader-totalFiles",
		txtTotalBytes: ".fluid-uploader-totalBytes",
		osModifierKey: ".fluid-uploader-modifierKey",
		txtFileStatus: ".fileStatus",
		progress : '.fluid-progress',
		fileProgress: '.file-progress',
		totalProgress: '.total-progress'
	};
	
	
	var status = {
		totalBytes:0,
		totalCount:0,
		currCount:0,
		currTotalBytes:0,
		currError:'',
		stop: false
	};
	
	var strings = {
		macControlKey: "Command",
		browseText: "Browse"+unescape('%u2026'),
		addMoreText: "Browse"+unescape('%u2026'),
		fileUploaded: "File Uploaded"
	};
		
	/* DOM Manipulation */

	/** 
	* removes the defined row from the file queue 
	* @param {Object} row	a jQuery object for the row
	* @return {Object}	returns the same jQuery object
	*/
	var removeRow = function(row) {
		row.fadeOut('fast',function(){
			var fileId = row.attr('id');
			var file = swfObj.getFile(fileId);
			totalSizeOfQueue(-file.size);
			status.totalCount--;
			swfObj.cancelUpload(fileId);
			row.remove();
			updateNumFiles();
			updateStatusClass();
			updateTotalBytes();
			updateBrowseBtnText();
		});
		return row;
	};
	
	var updateNumFiles = function() {
		$(elements.txtTotalFiles).text(numFilesToUpload());
	};
	
	/**
	 * Updates the total number of bytes in the UI
	 */
	var updateTotalBytes = function() {
		$(elements.txtTotalBytes).text(filesize(totalSizeOfQueue()));
	};
	 

	var updateStatusClass = function(status) {
		// sets the status for the top level element, not sure that this is a good way to do this given multiple instances
		if (status === undefined) {
			status = (numFilesInQueue() > 0) ? "loaded" : "empty";
		}
		// TODO: refactor for multiple instances
		$(options.elmUploader + " > div").attr('className',status);
	};
	
	var updateBrowseBtnText = function() {
		if (status.totalCount > 0) {
			$(elements.elmBrowse).text(strings.addMoreText);
		} else {
			$(elements.elmBrowse).text(strings.browseText);
		}
	};
	
	 var markRowComplete = function(row) {
		// dim the row
		row.addClass('dim');
		// add Complete text status
		setRowStatus(row,strings.fileUploaded);
	};

	 var setRowStatus = function(row,str) {
		$(row).children(elements.txtFileStatus).text(str);
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
	
	// SWF Upload Actions
	
	var beginUpload = function() {
		swfObj.startUpload();
	};

	function fileQueued(file) {
		try {
			// make a new jQuery object
			// add the size of the file to the variable maintaining the total size
			totalSizeOfQueue(file.size);

			// make a new row
			var queue_row = $('<tr id="'+ file.id +'">'
				+ '<td class="fileName">' + file.name + '</td>' 
				+ '<td class="fileSize">' + filesize(file.size) + '</td>'
				+ '<td class="fileStatus">Ready to Upload</td>' 
				+ '<td class="fileRemove"><button type="button" class="removeFileBtn" /></td></tr>');
				
			// add a hover to the row
			$(queue_row).css('display','none').hover(
				function(){
					if (!$(this).hasClass('dim')) {
						$(this).addClass('hover') ;
					}
				},
				function(){
					if (!$(this).hasClass('dim')) {
						$(this).removeClass('hover');
					}
				}
			);
			
			// add the queue to the list right before the placeholder which is always at the end
			$(queue_row).insertBefore(elements.elmEmptyRow);
			
			// add remove action to the button
			$('#'+ file.id + ' .removeFileBtn').click(function(){
				removeRow($(this).parents('tr'));
			});
			
			// show the row
			$('#'+ file.id).fadeIn('slow');
			
			// set the height but only if it's over the maximum
			// this because max-height doesn't seem to work for tbody
			if ($('.fluid-uploader-queue tbody').height() > options.queueListMaxHeight) {
				$('.fluid-uploader-queue tbody').height(options.queueListMaxHeight);
			}
			updateStatusClass();
			updateNumFiles();
			updateTotalBytes();
			
		} catch (ex) {
			this.debug(ex);
		}
	}

	function fileDialogStart() {
		try {
			// do nothing
		} catch (ex) {
			this.debug(ex);
		}
	}

	function fileDialogComplete(numSelected, numQueued) {
		try {
			status.currCount = 0;
			status.currTotalBytes = 0;
			status.totalCount = numFilesToUpload();
			updateBrowseBtnText();
			debugStatus();
		} catch (ex) {
			this.debug(ex);
		}
	}

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
			debug('error_string = ' + error_string);
		} catch (ex) {
			this.debug(ex);
		}
	}	

	var uploadStart = function(fileObj) {
		status.currError = ''; // zero out the error so we can check it later
		status.currCount++;
		updateProgress(0,fileObj.name,0,status.currCount,status.totalCount);
		debug(
			"Starting Upload: " + status.currCount + ' (' + fileObj.id + ')' + ' [' + fileObj.size + ']' + ' ' + fileObj.name + ''
		);
	};

	var uploadError = function(file, error_code, message) {
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
				progress.SetStatus("Cancelled");
				progress.SetCancelled();
				break;
			case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
				status.currError = "Upload Stopped by user input";
				progress.SetStatus("Stopped");
				hideProgress(true);
				break;
			default:
				progress.SetStatus("Unhandled Error: " + error_code);
				status.currError = "Error Code: " + error_code + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
				break;
			}
			debug(status.currError);
		} catch (ex) {
	        this.debug(ex);
	    }
	};

	var uploadProgress = function(fileObj,bytes,totalBytes) {
		debug('File Status :: bytes = ' + bytes + ' :: totalBytes = ' + totalBytes);
		debug('Total Status :: currBytes = ' + (status.currTotalBytes + bytes)  + ' :: totalBytes = ' + totalSizeOfQueue());
		updateProgress(derivePercent(bytes,totalBytes),fileObj.name,derivePercent(status.currTotalBytes + bytes,totalSizeOfQueue()),status.currCount,status.totalCount);
	};
	
	var uploadComplete = function(file) {
		if (!status.currError) {
			
			if ((file.index + 1) == status.totalCount) { // we're at the end
				updateProgress(100,file.name,100,status.totalCount,status.totalCount);
				fileQueueComplete();
				
			} else {
				status.currTotalBytes += file.size; // now update currTotalBytes with the actual file size
				updateProgress(100,file.name);
				swfObj.startUpload(); // if there hasn't been an error then start up the next upload
			}
			
			markRowComplete($('tr#' + file.id));

		} else {
			debug(status.currError);
			hideProgress(true);
		}
	};
	
	var fileQueueComplete = function() {
		updateStatusClass('done');
		hideProgress(false);
		if (options.continueAfterUpload) {
			variableAction(options.whenDone);
		}
	};

	/* DATA 
	 * 
	 */
	
	 var totalSizeOfQueue = function(delta) {
		if (typeof delta == 'number') {
			status.totalBytes += delta;
		}
		return status.totalBytes;
	};

	var whichOS = function() {
		if (navigator.appVersion.indexOf("Win")!=-1) return "Windows";
		if (navigator.appVersion.indexOf("Mac")!=-1) return "MacOS";
		if (navigator.appVersion.indexOf("X11")!=-1) return "UNIX";
		if (navigator.appVersion.indexOf("Linux")!=-1) return "Linux";
		else return "unknown";
	};

	function numFilesToUpload() {
		return numFilesInQueue() - numFilesUploaded();
	}
	
	function numFilesInQueue() {
		return $('.fluid-uploader-queue tbody tr:not(".fluid-uploader-row-placeholder")').length ;
	}

	function numFilesUploaded() {
		return $('.fluid-uploader-queue tbody tr.dim').length;
	}

	function derivePercent(num,total) {
		return Math.round((num*100)/total);
	}

	// simple function for return kbytes
	// probably should do something fancy that shows MBs if the number is huge
	function filesize(bytes) {
		return Math.round(bytes/1028) + ' KB';
	}
	
	/* PROGRESS
	 * 
	 */

	var updateProgress = function(filePercent, fileName, totalPercent, fileIndex, totalFileNum){
		//<span class="file_name">&nbsp;</span> :: 0</span>% complete
		// update file information
		var fileLabel = '<span class="file_name">' + fileName + '</span> :: <span class="percent">' + filePercent + '</span>% complete';
		fluid.Progress.update(elements.progress, elements.fileProgress, filePercent, fileLabel);
		
		// update total info
		if (totalPercent) {
			var totalLabel = 'Total Progress: <span class="percent">' + totalPercent 
			+ '</span>% [<span class="file_index">' + fileIndex 
			+ '</span> of <span class="total_file_num">' + totalFileNum 
			+ '</span> files]';
			fluid.Progress.update(elements.progress, elements.totalProgress, totalPercent, totalLabel);
			// if we've completed the progress then hide the progress after a delay
		}
	};
	
	var hideProgress = function(justDoIt) {
		justDoIt = (justDoIt) ? true : false;
	 	fluid.Progress.hide(elements.progress, justDoIt);
	};

	/* DEV CODE
	 * 
	 */
	
	function debugStatus() {
		debug(
			"\n status.totalBytes = " + totalSizeOfQueue() + 
			"\n status.totalCount = " + status.totalCount + 
			"\n status.currCount = " + status.currCount + 
			"\n status.currTotalBytes = " + status.currTotalBytes + 
			"\n status.currError = " + status.currError
		);
	}
	
	/* DEMO CODE
	 * this is code that fakes an upload with out a server
	 */

	var updateObj = {};

	var demoUpload = function() {
		debug(numFilesToUpload());
		if (status.stop === true) {
			totalSizeOfQueue(-status.currTotalBytes);
			updateTotalBytes();
			updateNumFiles();
			demoStop();
		} else if (numFilesToUpload()) { // there are still files to upload
			updateObj.bytes = 0;
			updateObj.byteChunk = 200000; // used to break the demo upload into byte-sized chunks
			// set up data
			updateObj.row = $('.fluid-uploader-queue tbody tr:not(".fluid-uploader-placeholder"):not(".dim)').eq(0);
			
			updateObj.fileId = jQuery(updateObj.row).attr('id');
			updateObj.fileObj = swfObj.getFile(updateObj.fileId);
			updateObj.bytes = 0;
			updateObj.totalBytes = updateObj.fileObj.size;
			updateObj.numChunks = Math.ceil(updateObj.totalBytes / updateObj.byteChunk);
			debug('DEMO :: ' + updateObj.fileId + ' :: totalBytes = ' + updateObj.totalBytes + ' numChunks = ' + updateObj.numChunks);
			
			// start the demo upload
			uploadStart(updateObj.fileObj);
			
			// perform demo progress
			demoProgress();
		} else { // no more files to upload close the display
			fileQueueComplete();
		}
	};

	var demoProgress = function() {
		if (status.stop === true) {
			demoStop();
		} else {
			var delay = Math.floor(Math.random() * 5000 + 1) > 1;
			var tmpBytes = (updateObj.bytes + updateObj.byteChunk);
			if (tmpBytes < updateObj.totalBytes) {
				debug('tmpBytes = ' + tmpBytes + ' totalBytes = ' + updateObj.totalBytes);
				uploadProgress(updateObj.fileObj, tmpBytes, updateObj.totalBytes);
				updateObj.bytes = tmpBytes;
				var pause = setTimeout(demoProgress, delay);
			}
			else {
				uploadProgress(updateObj.fileObj, updateObj.totalBytes, updateObj.totalBytes);
				var timer = setTimeout(demoComplete,delay);
			}
		}  
	};

	function demoComplete() {
		var row = $('tr#'+ updateObj.fileObj.id);
		// mark the row completed
		markRowComplete(row);
		
		status.currTotalBytes += updateObj.fileObj.size; 
		updateNumFiles();
		updateTotalBytes();
		var pause = setTimeout(demoUpload,1200); // if there hasn't been an error then start up the next upload	
	}
	
	function demoStop() {
		hideProgress(true);
		status.stop = false;
		status.currCount = 0;
		status.currTotalBytes = 0;
		status.totalCount = numFilesToUpload();
	}

	/* Public API */
	
	fluid.uploader = {};
	
	fluid.uploader.init = function(settings){
		options = $.extend({}, uploadDefaults, settings);
		
		var swf_settings = {
		
			// File Upload Settings
			upload_url: options.uploadUrl,
			flash_url: options.flashUrl,
			post_params: options.postParams,
			
			// File Upload Settings
			file_size_limit: options.fileSizeLimit,
			file_types: options.fileTypes,
			file_types_description: options.fileTypesDescription,
			file_upload_limit: options.fileUploadLimit,
			file_queue_limit: options.fileQueueLimit,
			
			// Event Handler Settings
			file_dialog_start_handler: fileDialogStart,
			file_queued_handler: fileQueued,
			file_queue_error_handler: fileQueueError,
			file_dialog_complete_handler: fileDialogComplete,
			upload_start_handler: uploadStart,
			upload_progress_handler: uploadProgress,
			upload_complete_handler: uploadComplete,
			upload_error_handler: uploadError,
			
			/*
		 upload_success_handler : FeaturesDemoHandlers.uploadSuccess,
		 */
			// Debug setting
			debug: options.debug
		};
		
		// if (debug) fluid.uploader.test();
		
		// Initialize the uploader SWF component
		// Check to see if SWFUpload is available
		if (typeof(SWFUpload) === "undefined") {
			return;
		}
		swfObj = new SWFUpload(swf_settings);
		
		// define the uploader we're working with 
		//jQUploaderObj = $(options.elmUploader);
		
		// set the text difference for the instructions based on Mac or Windows
		if (whichOS() == 'MacOS') {
			$(elements.osModifierKey).text(strings.macControlKey);
		}
		
		$(elements.elmBrowse).click(function() {
			if (options.fileQueueLimit === 1) {
				return swfObj.selectFile() ;
			} else {
				return swfObj.selectFiles() ; 
			}
		});
		
		$(elements.elmUpload).click(function(){
			if (status.totalCount > 0) {
				beginUpload();
			}
		});
		
		$(elements.elmPause).click(function(){
			swfObj.stopUpload();
		});
		
		$(elements.elmDone).click(function(){
			variableAction(options.whenDone);
		});
		
		$(elements.elmCancel).click(function(){
			variableAction(options.whenCancel);
		});
		
		// this is a local override to do a fake upload
		if (options.uploadUrl === '') {
			swfObj.startUpload = function(){
				demoUpload();
			};
			swfObj.stopUpload = function(){
				status.stop = true;
			};
		}
	};
		
	fluid.uploader.test = function() {
		var str = "";
		for (key in options) {
			str += key + ' = ' + options[key] + '\n';
		}
		for (key in elements) {
			str += key + ' = ' + elements[key] + '\n';
		}
		debug(str);
	};
	
})(jQuery,fluid);

/* PROGRESS
 * 
*/

fluid.Progress = function ($) {
	var lastPercent = 0;
	
	$(document).ready(function() {
		$('.progress-mask').css('opacity',0.80);
		$('.progress-mask-btm').height($(".fluid-progress").height() - 14);
	 });
	 
	 function animateToWidth(elm,width) {
		elm.animate({ 
		    width: width,
			queue: false
		 }, 200 );
	}
	 
	 /* Public API */
	
	return {
		update : function(which, indicator, percent, label, text) {
			var percentpercent = percent+'%';
			var labelElm = $(which + ' ' + indicator + ' .progress-label');
			var progressElm = $(which + ' ' + indicator + ' .progress-indicator');
			
			// if there is a separate text indicator then update the text
			if (text) {
				var textElm = $(which + ' ' + indicator + ' .progress-text');
				textElm.html(text);
			}
			
			if ($(which).css("display") === "none") {
				$(which).fadeIn('slow');
			}
			debug('percent = ' + percent + ' lastPercent = ' + lastPercent);
			
			//update the label of the indicator
			labelElm.html(label);
			
			// de-queue any left over animations
			progressElm.queue("fx", []); 
			
			if (percent === 0) {
				progressElm.width(1);
			} else if (percent < lastPercent) {
				progressElm.width(percentpercent);
			} else {
				progressElm.animate({ 
		    		width: percentpercent,
					queue: false
		  		}, 200 );
			}
			lastPercent = percent;
		},	
		hide: function(which, justDoIt) {
			var delay = 1600;
			if (justDoIt) {
				$(which).fadeOut('slow');
			} else {
				var timeOut = setTimeout("fluid.Progress.hide('"+which+"'," + true + ")",delay);
			}
		},
		show: function(which) {
			$(which).fadeIn('slow');
		}
	};
	
}(jQuery);

//fluid.Progress.update('.fluid-progress','.file-progress',40,"Label Change");

function debug(str) {
	if (window.console) {
		console.log(str);
	}
}


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
	
	// code for finding current element
	var uploaderElm = function(elmClass) {
		return $(jQUploaderObj + ' ' + elmClass);
	}



*/
