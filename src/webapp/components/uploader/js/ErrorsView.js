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
    
    fluid.defaults("fluid.uploader.errorsView", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "fluid.uploader.errorsView.preInit",
        finalInitFunction: "fluid.uploader.errorsView.finalInit",
        
        components: {
            // TODO: This won't scale to more errors. Error types themselves need to be part of a model.
            fileSizeErrorPanel: {
                type: "fluid.uploader.errorsView.panel",
                container: "{errorsView}.dom.fileSizeErrorPanel",
                options: {
                    strings: {
                        header: "{errorsView}.options.strings.exceedsFileSize"
                    }
                }
            },
            
            numFilesErrorPanel: {
                type: "fluid.uploader.errorsView.panel",
                container: "{errorsView}.dom.numFilesErorPanel",
                options: {
                    strings: {
                        header: "{errorsView}.options.strings.exceedsNumFilesLimit"
                    }
                }
            }
        },
        
        selectors: {
            errorHeader: ".flc-uploader-erroredHeader",
            numFilesErorPanel: ".flc-uploader-exceededFileLimit-template",
            fileSizeErrorPanel: ".flc-uploader-exceededUploadLimit-template"
        },
        
        strings: {
            errorTemplateHeader: "Warning(s)",
            exceedsNumFilesLimit: "Too many files were selected. %numFiles were not added to the queue.",
            exceedsFileSize: "%numFiles files were too large and were not added to the queue."
        }
    });

    fluid.uploader.errorsView.preInit = function (that) {
        that.showPanels = function () {
            fluid.each(that.panels, function (panel) {
                panel.show();
            });
        };
        
        that.hidePanels = function () {
            fluid.each(that.panels, function (panel) {
                panel.hide();
            });
        };
        
        /**
         * Add the specified error to the list of errors
         * @param (string)   The filename of the file which introduced the error.
         * @param (string) The ID of the error box. 
         */
        that.addError = function (file, error) {
            // TODO: Won't scale with more error types.
            var panelForError = error === fluid.uploader.queueErrorConstants.FILE_EXCEEDS_SIZE_LIMIT ?
                that.fileSizeErrorPanel : that.numFilesErrorPanel;
            panelForError.addFile(file);
        };
        
        that.clearAllErrors = function () {
            fluid.each(that.panels, function (panel) {
                panel.clear();
            });
            that.refreshView();
        };  
        
        that.refreshView = function () {
            // TODO: This is pretty snarly.
            var hasErrors = false;
            fluid.each(that.panels, function (panel) {
                hasErrors = (panel.model.files.length > 0);
            });
            if (hasErrors) {
                that.container.show();
            } else {
                that.container.hide();
            }
        };
    };
    
    fluid.uploader.errorsView.finalInit = function (that) {
        that.panels = [that.fileSizeErrorPanel, that.numFilesErrorPanel];
        that.locate("errorHeader").text(that.options.strings.errorTemplateHeader);
        that.hidePanels();
        that.container.hide();
    };

    fluid.demands("fluid.uploader.errorsView", "fluid.uploader.multiFileUploader", {
        container: "{multiFileUploader}.options.selectors.errors", // TODO: Why can't I bind to {multiFileUploader}.dom.errors?
        options: {            
            listeners: {
                "{multiFileUploader}.events.onFilesSelected": "{errorsView}.clearAllErrors",
                "{multiFileUploader}.events.afterFileDialog": "{errorsView}.refreshView",
                "{multiFileUploader}.events.onQueueError": "{errorsView}.addError",
                "{multiFileUploader}.events.onUploadStart": "{errorsView}.clearAllErrors"
            }
        }
    });
    
    fluid.defaults("fluid.uploader.errorsView.panel", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "fluid.uploader.errorsView.panel.preInit",
        finalInitFunction: "fluid.uploader.errorsView.panel.finalInit",
        
        model: {
            files: [],
            showingDetails: false
        },
        
        selectors: {
            deleteErrorButton: ".flc-uploader-erroredButton",
            toggleErrorBodyButton: ".flc-uploader-errored-bodyButton",
            errorBodyTogglable: ".flc-uploader-erroredBody-togglable",
            errorTitle: ".flc-uploader-erroredTitle",
            erroredFiles: ".flc-uploader-erroredFiles"
        },
        
        strings: {
            errorTemplateButtonSpan: "Remove error",
            errorTemplateHideThisList: "Hide files",
            errorTemplateWhichOnes: "Show files",
            errorTemplateFilesListing: "%files, "
        }
    });
    
    fluid.uploader.errorsView.panel.preInit = function (that) {
        that.show = function () {
            that.container.show();
        };
        
        that.hide = function () {
            that.container.hide();
        };
        
        that.toggleDetails = function () {
            var detailsAction = that.model.showingDetails ? that.hideDetails : that.showDetails;
            detailsAction();
        };
        
        that.showDetails = function () {
            that.locate("errorBodyTogglable").show();
            that.locate("toggleErrorBodyButton").text(that.options.strings.errorTemplateHideThisList);
            that.model.showingDetails = true;
        };
        
        that.hideDetails = function () {
            that.locate("errorBodyTogglable").hide();
            that.locate("toggleErrorBodyButton").text(that.options.strings.errorTemplateWhichOnes);
            that.model.showingDetails = false;
        };
        
        that.addFile = function (file) {
            that.model.files.push(file.name);
            that.refreshView();
        };
        
        that.clear = function () {
            that.model.files = [];
        };
        
        that.refreshView = function () {
            if (that.model.files.length <= 0) {
                that.hide();
                return;
            }
            
            fluid.uploader.errorsView.panel.renderHeader(that);
            fluid.uploader.errorsView.panel.renderErrorBody(that);
            fluid.uploader.errorsView.panel.renderDetailsToggle(that);
            that.show();
        };
    };
    
    fluid.uploader.errorsView.panel.finalInit = function (that) {        
        // Bind delete button
        that.locate("deleteErrorButton").click(that.clear);

        // Bind hide/show error details link
        that.locate("toggleErrorBodyButton").click(that.toggleDetails);
    };
    
    fluid.uploader.errorsView.panel.renderHeader = function (that) {
        var errorTitle = fluid.stringTemplate(that.options.strings.header, {
            numFiles: that.model.files.length
        });
        
        that.locate("errorTitle").text(errorTitle);         
    };
    
    fluid.uploader.errorsView.panel.renderDetailsToggle = function (that) {
        that.locate("toggleErrorBodyButton").text(that.options.strings.errorTemplateWhichOnes);
        that.locate("errorBodyTogglable").hide();
    };
    
    fluid.uploader.errorsView.panel.renderErrorBody = function (that) {
        var errorStr = "";
        fluid.each(that.model.files, function (fileName, idx) {
            // TODO: Why are we string templating this?
            errorStr = fluid.stringTemplate(that.options.strings.errorTemplateFilesListing, {
                files: errorStr + fileName
            });
        });
        // Take out the extra comma and the space
        // TODO: Umm?
        that.locate("erroredFiles").text(errorStr.substring(0, errorStr.length - 2));
    };
    
})(jQuery, fluid_1_4);
