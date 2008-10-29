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
    
    var removeFileAndRow = function (that, file, row) {
        // Remove the file from the upload queue.
        that.uploadManager.removeFile(file);
        
        // And pull it out of the DOM with a nice fade.
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
		
        that.locate("removeButton", row).click(function () {
            removeFileForRow(that, row);
        });
        
        bindDeleteKey(that, row);
    };
    
    var addFile = function (that, file) {
        // Create a new file row from the template and set it up.
        var row = that.locate("rowTemplate").clone();
        that.locate("fileName", row).text(file.name);
        that.locate("fileSize", row).text(fluid.uploader.formatFileSize(file.size));
        row.attr("id", file.id);
        row.addClass(that.options.styles.ready).addClass(that.options.styles.row);
        bindRowHandlers(that, row);
        
        // Hide the row, add it to the queue, and then fade it in slowly.
        row.hide();
        that.container.append(row);
        row.fadeIn("slow");
        that.scroller.scrollBottom();
        
        // create a new progress bar for the row and position it
        var rowProgressor = that.locate("rowProgressorTemplate", that.uploadContainer).clone();
        rowProgressor.attr("id", file.id+"_progress");
        rowProgressor.css('top',(row.position().top)).height(row.height()).width(5);
        that.container.after(rowProgressor);
        
        that.refreshView();
    };
    
    var changeRowState = function (row, newState) {
        // remove the ready status and add the new status
        row.removeClass('ready').removeClass('error').addClass(newState);
    };
    
    var bindEvents = function (that) {
        
        that.events.onFileSuccess.addListener(function (file) {
            var row = rowForFile(that, file);
            // remove click event on Remove button
            that.locate("removeButton", row).unbind('click');
            // remove the tabFocus on the Remove button
            that.locate("removeButton", row).tabindex(-1);
            // change row class
            changeRowState(row, that.options.styles.uploaded);
        });
        
        that.events.onFileError.addListener(function (file) {
            var row = rowForFile(that, file);
            changeRowState(row, that.options.styles.error);
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
            fileRows: "tr:not(#queue-row-tmplt)",
            fileName: ".fileName",
            fileSize: ".fileSize",
            removeButton: ".removeFile",
                  
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
            error: "error"
        }
    });
   
})(jQuery, fluid_0_6);
