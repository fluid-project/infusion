/*global SWFUpload*/
/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    
    // Real data binding would be nice to replace these two pairs.
    var rowForFile = function (that, file) {
        return that.locate("fileQueue").find("#" + file.id);
    };
    
    var fileForRow = function (that, row) {
        var files = that.uploadManager.queue.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.id.toString() === row.attr("id")) {
                return file;
            }
        }
        
        return null;
    };
    
    // file progress
    
    var progressorForFile = function (that, file) {
        var progressId = file.id + "_progress";
        return that.fileProgressors[progressId];
    };
    
    // TODO: verbafy these function names 
    var startFileProgress = function (that, file) {
        var fileRowElm = rowForFile(that, file);
        that.scroller.scrollTo(fileRowElm);
         
        // update the progressor and make sure that it's in position
        var fileProgressor = progressorForFile(that, file);
        fileProgressor.refresh(fileRowElm);
        fileProgressor.show();
    };
        
    var updateFileProgress = function (that, file, fileBytesComplete, fileTotalBytes) {
        var filePercent = fluid.uploader.derivePercent(fileBytesComplete, fileTotalBytes);
        var filePercentStr = filePercent + "%";    
        progressorForFile(that, file).update(filePercent, filePercentStr);
    };
    
    var removeFileAndRow = function (that, file, row) {
        that.uploadManager.removeFile(file);
        row.fadeOut("fast", function () {
            row.remove();
            that.refreshView();   
        }); 
    };
    
    var removeFileForRow = function (that, row) {
        var file = fileForRow(that, row);
        removeFileAndRow(that, file, row);
    };
    
    var removeRowForFile = function (that, file) {
        var row = rowForFile(that, file);
        removeFileAndRow(that, file, row);
    };
     
    var bindHover = function (row, styles) {
        var over = function () {
            if (row.hasClass(styles.ready) && !row.hasClass(styles.uploading)) {
                row.addClass(styles.hover);
            }
        };
        
        var out = function () {
            if (row.hasClass(styles.ready) && !row.hasClass(styles.uploading)) {
                row.removeClass(styles.hover);
            }   
        };
        row.hover(over, out);
    };
    
    var bindDeleteKey = function (that, row) {
        var deleteHandler = function () {
            removeFileForRow(that, row);
        };
       
        row.activatable(null, {
            additionalBindings: [{
                key: $.a11y.keys.DELETE, 
                activateHandler: deleteHandler
            }]
        });
    };
    
    var bindRowHandlers = function (that, row) {
        if ($.browser.msie && $.browser.version < 7) {
			bindHover(row, that.options.styles);
        }
		
        that.locate("fileIconBtn", row).click(function () {
            removeFileForRow(that, row);
        });
        
        bindDeleteKey(that, row);
    };
    
    var createRowFromTemplate = function (that, file) {
        var row = that.locate("rowTemplate").clone();
        that.locate("fileName", row).text(file.name);
        that.locate("fileSize", row).text(fluid.uploader.formatFileSize(file.size));
        that.locate("fileIconBtn", row).addClass(that.options.styles.remove);
        row.attr("id", file.id);
        row.addClass(that.options.styles.ready).addClass(that.options.styles.row);
        bindRowHandlers(that, row);
        
        return row;    
    };
    
    var createProgressorFromTemplate = function (that, file, row) {
        // create a new progress bar for the row and position it
        var rowProgressor = that.locate("rowProgressorTemplate", that.uploadContainer).clone();
        var progressId = file.id + "_progress";
        rowProgressor.attr("id", progressId);
        rowProgressor.css("top", row.position().top);
        rowProgressor.height(row.height()).width(5);
        that.container.after(rowProgressor);
       
        that.fileProgressors[progressId] = fluid.progress(that.uploadContainer, {
            selectors: {
                progressBar: "#" + file.id,
                displayElement: "#" + progressId,
                label: "#" + progressId + " .file-progress-text",
                indicator: "#" + progressId
            }
        });
    };
    
    var addFile = function (that, file) {
        var row = createRowFromTemplate(that, file);
        row.hide();
        that.container.append(row);
        row.fadeIn("slow");
        that.scroller.scrollBottom();
        createProgressorFromTemplate(that, file, row);

        that.refreshView();
    };
    
    var changeRowState = function (row, newState) {
        row.removeClass("ready error").addClass(newState);
    };
    
    var bindEvents = function (that) {
        that.events.afterFileQueued.addListener(function (file) {
            addFile(that, file);
        });
        
        that.events.onUploadStart.addListener(function () {
            var rowButtons = that.locate("fileIconBtn", that.locate("fileRows"));
            rowButtons.attr("disabled", "disabled");
            rowButtons.addClass("dim");
        });
        
        that.events.onFileStart.addListener(function (file) {
            startFileProgress(that, file);
        });
        
        that.events.onFileProgress.addListener(function (file, fileBytesComplete, fileTotalBytes) {
            updateFileProgress(that, file, fileBytesComplete, fileTotalBytes); 
        });

        that.events.onFileSuccess.addListener(function (file) {
            // TODO: break out into function markRowComplete
            var fileRowElm = rowForFile(that, file);
            var removeFile = that.locate("fileIconBtn", fileRowElm);
            removeFile.unbind("click");
            removeFile.tabindex(-1);
            removeFile.removeClass(that.options.styles.remove);
            changeRowState(fileRowElm, that.options.styles.uploaded);
            fileRowElm.attr("title", that.options.strings.status.success);
        });
        
        that.events.onFileError.addListener(function (file) {
            if (file.filestatus === fluid.fileQueue.fileStatusConstants.ERROR) {
                var fileRowElm = rowForFile(that, file);
                changeRowState(fileRowElm, that.options.styles.error);
                // add error information to the title attribute
            }
        });
        
        that.events.afterFileComplete.addListener(function (file) {
            var fileRowElm = rowForFile(that, file);
            progressorForFile(that, file).hide();
            that.locate("fileIconBtn", fileRowElm).removeClass("dim");
        });
 
    };
    
    var setupFileQueue = function (that, uploadManager) {
        that.uploadManager = uploadManager;
        
        // Make it scrollable.
        that.scroller = fluid.scroller(that.container);
        
        // And add keyboard navigation.
        that.container.tabbable();
        that.container.selectable({
            selectableSelector: that.options.selectors.fileRows,
            onSelect: function (itemToSelect) {
                $(itemToSelect).addClass(that.options.styles.selected);
            },
            onUnselect: function (selectedItem) {
                $(selectedItem).removeClass(that.options.styles.selected);
            }
        });
        
        that.fileProgress = fluid.progress(that.uploadContainer, {
            selectors: {
                displayElement: ".file-progress", 
        		label: ".file-progress-text",
                indicator: ".file-progress"
            }
	    });
        
        bindEvents(that);
    };
    
    /**
     * Creates a new File Queue view.
     * 
     * @param {jQuery|selector} container the file queue's container DOM element
     * @param {UploadManager} uploadManager an upload manager model instance
     * @param {Object} options configuration options for the view
     */
    fluid.fileQueueView = function (container, events, parentContainer, uploadManager, options) {
        var that = fluid.initView("fluid.fileQueueView", container, options);
        that.uploadContainer = parentContainer;
        that.events = events;
        
        that.fileProgressors = {};
        
        that.addFile = function (file) {
            addFile(that, file);
        };
        
        that.removeFile = function (file) {
            removeRowForFile(that, file);
        };
        
        that.refreshView = function () {
    		that.scroller.refreshView();
            that.container.getSelectableContext().refresh();
        };
        
        setupFileQueue(that, uploadManager);     
        return that;
    };
    
    fluid.defaults("fluid.fileQueueView", {
        selectors: {
            fileRows: ".row",
            fileName: ".fileName",
            fileSize: ".fileSize",
            fileIconBtn: ".iconBtn",            
                  
            rowTemplate: "#queue-row-tmplt",
            rowProgressorTemplate: "#row-progressor-tmplt"
        },
        
        styles: {
            row: "row",
            ready: "ready",
            uploading: "uploading",
            hover: "hover",
            selected: "selected",
            uploaded: "uploaded",
            error: "error",
            remove: "removeFile"
        },
        
        strings: {
            progress: {
                toUploadLabel: "To upload: %fileCount %fileLabel (%totalBytes)", 
                singleFile: "file",
                pluralFiles: "files"
        	},
            status: {
                success: "File Uploaded",
                error: "File Upload Error"
            }
        }
    });
   
})(jQuery, fluid_0_6);
