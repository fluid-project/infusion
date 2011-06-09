/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global window, fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {

    fluid.uploader = fluid.uploader || {};
    
    // TODO: cut and pastage from fileQueueView
    var bindDeleteKey = function (that, row, errorCode) {
        var deleteHandler = function () {
            that.removeError(errorCode);
        };
       
        fluid.activatable(row, null, {
            additionalBindings: [{
                key: $.ui.keyCode.DELETE, 
                activateHandler: deleteHandler
            }]
        });
    };
    
    var bindErrorHandlers = function (that, errorCode) {
        var row = that.locate(errorCode);

        //Bind delete button
        that.locate("deleteErrorButton", row).click(function () {
            that.removeError(errorCode);
        });

        //Bind hide/show error details link
        that.locate("toggleErrorBodyButton", row).click(function () {
            that.errorMsgs[errorCode].show = !that.errorMsgs[errorCode].show;
            if (that.errorMsgs[errorCode].show) {
                that.locate("errorBodyTogglable", row).show();
                that.locate("toggleErrorBodyButton", row).text(that.options.strings.errorTemplateHideThisList);
            } else {
                that.locate("errorBodyTogglable", row).hide();
                that.locate("toggleErrorBodyButton", row).text(that.options.strings.errorTemplateWhichOnes);
            }
        });

        //Bind delete key on keyboard
        bindDeleteKey(that, row, errorCode);
    };

    var removeError = function (that, errorCode) {
        that.errorMsgs[errorCode].files = [];
    };

    var updateTotalError = function (that) {
        var errorSize = 0; //the number of errors, the total of all the subarrays

        $.each(that.errorMsgs, function (errorCode, errObj) {
            var errorStr = "";
            var row = that.locate(errorCode);

            errorSize = errorSize + that.errorMsgs[errorCode].files.length;

            //render header title
            var errorTitle = fluid.stringTemplate(that.options.strings[errorCode], {
                    num_of_files: that.errorMsgs[errorCode].files.length
                });
            that.locate("errorTitle", row).text(errorTitle); 
            $.each(errObj.files, function (errKey, indivErrMsg) {
                errorStr = fluid.stringTemplate(that.options.strings.errorTemplateFilesListing, {
                    files: errorStr + indivErrMsg
                });
            });
            if (!errorStr) {
                row.hide();
            } else {
                row.show();
            }
            //Take out the extra comma and the space
            that.locate("erroredFiles", row).text(errorStr.substring(0, errorStr.length - 2));
        });

        //if size is 0, then no errors -> hide the error box
        if (errorSize === 0) {
            that.hideErrorsPanel();
        } else {
            that.showErrorsPanel();
        }
    };
    
    fluid.defaults("fluid.uploader.errorsView", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "fluid.uploader.errorsView.preInit",
        postInitFunction: "fluid.uploader.errorsView.postInit",
        
        selectors: {
            errorHeader: ".flc-uploader-erroredHeader",
            exceedsFileLimit: ".flc-uploader-exceededFileLimit-template",
            exceedsUploadLimit: ".flc-uploader-exceededUploadLimit-template",
            deleteErrorButton: ".flc-uploader-erroredButton",
            toggleErrorBodyButton: ".flc-uploader-errored-bodyButton",
            errorBodyTogglable: ".flc-uploader-erroredBody-togglable",
            errorTitle: ".flc-uploader-erroredTitle",
            erroredFiles: ".flc-uploader-erroredFiles"
        },
        
        strings: {
            exceedsFileLimit: "Too many files were selected. %num_of_files were not added to the queue.",
            exceedsUploadLimit: "%num_of_files files were too large and were not added to the queue.",
            errorTemplateHeader: "Warning(s)",
            errorTemplateButtonSpan: "Remove error",
            errorTemplateHideThisList: "Hide files",
            errorTemplateWhichOnes: "Show files",
            errorTemplateFilesListing: "%files, "
        }
    });
    
    fluid.uploader.errorsView.postInit = function (that) {
        that.locate("errorHeader").text(that.options.strings.errorTemplateHeader);
        bindErrorHandlers(that, "exceedsFileLimit");
        bindErrorHandlers(that, "exceedsUploadLimit");        
        that.locate("toggleErrorBodyButton").text(that.options.strings.errorTemplateWhichOnes);
        that.locate("errorBodyTogglable").hide();
        that.hideErrorsPanel();
    };
    
    fluid.uploader.errorsView.preInit = function (that) {
        /**
         * A map that stores error messages toggle mode and its files. Mapped by the error name as key.
         */
         // TODO: This should be a real model
        that.errorMsgs = {
            exceedsFileLimit: {
                files: [],
                show: false
            },
            exceedsUploadLimit: {
                files: [],
                show: false
            }
        }; 

        that.showErrorsPanel = function () {
            that.container.show();
        };
        
        that.hideErrorsPanel = function () {
            that.container.hide();
        };
        
        /**
         * Removes the specified error from the list of errors
         * 
         * @param {string} The ID of the error box. Usually the error code itself (unique)
         */
        that.removeError = function (errorCode) {
            removeError(that, errorCode);
            that.refreshView();
        };
        
        /**
         * Add the specified error to the list of errors
         * @param (string)   The filename of the file which introduced the error.
         * @param (string) The ID of the error box. 
         */
        that.addError = function (file, error) {
            // TODO: Replace ad-hoc error code strings here with a real model.
            var errorCode = error === fluid.uploader.queueErrorConstants.FILE_EXCEEDS_SIZE_LIMIT ? 
                "exceedsUploadLimit" : "exceedsFileLimit";
            that.errorMsgs[errorCode].files.push(file.name);
        };
        
        that.clearErrors = function () {
            $.each(that.errorMsgs, function (errorCode, errObj) {
                removeError(that, errorCode);
            });
            that.refreshView();
        };  
        
        that.refreshView = function () {
            updateTotalError(that);
        };
    };

    fluid.demands("fluid.uploader.errorsView", "fluid.uploader.multiFileUploader", {
        container: "{multiFileUploader}.options.selectors.errors", // TODO: Why can't I bind to {multiFileUploader}.dom.errors?
        options: {
            model: {
                queuedFiles: "{multiFileUploader}.queue.files",
                errorMessages: {}
            },
            
            listeners: {
                "{multiFileUploader}.events.onFilesSelected": "{errorsView}.clearErrors",
                "{multiFileUploader}.events.afterFileDialog": "{errorsView}.refreshView",
                "{multiFileUploader}.events.onQueueError": "{errorsView}.addError",
                "{multiFileUploader}.events.onUploadStart": "{errorsView}.clearErrors"
            }
        }
    });
    
})(jQuery, fluid_1_4);
