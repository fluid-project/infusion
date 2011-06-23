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
    
    fluid.defaults("fluid.uploader.errorPanel", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "fluid.uploader.errorPanel.preInit",
        postInitFunction: "fluid.uploader.errorPanel.renderSectionTemplates",
        finalInitFunction: "fluid.uploader.errorPanel.finalInit",
        
        components: {
            // TODO: This won't scale nicely with more types of errors. 
            fileSizeErrorSection: {
                type: "fluid.uploader.errorPanel.section",
                container: "{errorPanel}.dom.fileSizeErrorSection",
                options: {
                    model: {
                        errorCode: fluid.uploader.queueErrorConstants.FILE_EXCEEDS_SIZE_LIMIT
                    },
                    strings: {
                        header: "{errorPanel}.options.strings.exceedsFileSize"
                    }
                }
            },
            
            numFilesErrorSection: {
                type: "fluid.uploader.errorPanel.section",
                container: "{errorPanel}.dom.numFilesErrorSection",
                options: {
                    model: {
                        errorCode: fluid.uploader.queueErrorConstants.QUEUE_LIMIT_EXCEEDED
                    },
                    strings: {
                        header: "{errorPanel}.options.strings.exceedsNumFilesLimit"
                    }
                }
            }
        },
        
        selectors: {
            header: ".flc-uploader-errorPanel-header",
            sectionTemplate: ".flc-uploader-errorPanel-section-tmplt",
            fileSizeErrorSection: ".flc-uploader-errorPanel-section-fileSize",
            numFilesErrorSection: ".flc-uploader-errorPanel-section-numFiles"
        },
        
        strings: {
            headerText: "Warning(s)",
            exceedsNumFilesLimit: "Too many files were selected. %numFiles were not added to the queue.",
            exceedsFileSize: "%numFiles files were too large and were not added to the queue."
        },
        
        styles: {
            hiddenTemplate: "fl-hidden-templates"
        }
    });

    fluid.uploader.errorPanel.preInit = function (that) {
        that.refreshView = function () {
            for (var i = 0; i < that.sections.length; i++) {
                if (that.sections[i].model.files.length > 0) {
                    // One of the sections has errors. Show them and bail immediately.
                    that.container.show();
                    return;
                }
            }            
            that.container.hide();
        };
    };
    
    fluid.uploader.errorPanel.renderSectionTemplates = function (that) {
        var sectionTmpl = that.locate("sectionTemplate").remove().removeClass(that.options.styles.hiddenTemplate);
        that.locate("fileSizeErrorSection").append(sectionTmpl.clone());
        that.locate("numFilesErrorSection").append(sectionTmpl.clone());
    };
    
    fluid.uploader.errorPanel.finalInit = function (that) {
        that.sections = [that.fileSizeErrorSection, that.numFilesErrorSection];
        that.locate("header").text(that.options.strings.headerText);
        that.container.hide();
    };

    fluid.demands("fluid.uploader.errorPanel", "fluid.uploader.multiFileUploader", {
        container: "{multiFileUploader}.dom.errorsPanel",
        options: {            
            listeners: {
                "{multiFileUploader}.events.afterFileDialog": "{errorPanel}.refreshView"
            }
        }
    });
    
    fluid.defaults("fluid.uploader.errorPanel.section", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "fluid.uploader.errorPanel.section.preInit",
        finalInitFunction: "fluid.uploader.errorPanel.section.finalInit",
        
        model: {
            errorCode: undefined,
            files: [],
            showingDetails: false
        },
        
        events: {
            afterErrorsCleared: null
        },
        
        selectors: {
            errorTitle: ".fl-uploader-errorPanel-section-title",
            deleteErrorButton: ".flc-uploader-errorPanel-section-removeButton",
            errorDetails: ".flc-uploader-errorPanel-section-details",
            erroredFiles: ".flc-uploader-errorPanel-section-files",
            showHideFilesToggle: ".flc-uploader-errorPanel-section-toggleDetails"
        },
        
        strings: {
            hideFiles: "Hide files",
            showFiles: "Show files",
            fileListDelimiter: ", "
        }
    });
    
    fluid.uploader.errorPanel.section.preInit = function (that) {
        that.toggleDetails = function () {
            var detailsAction = that.model.showingDetails ? that.hideDetails : that.showDetails;
            detailsAction();
        };
        
        that.showDetails = function () {
            that.locate("errorDetails").show();
            that.locate("showHideFilesToggle").text(that.options.strings.hideFiles);
            that.model.showingDetails = true;
        };
        
        that.hideDetails = function () {
            that.locate("errorDetails").hide();
            that.locate("showHideFilesToggle").text(that.options.strings.showFiles);
            that.model.showingDetails = false;
        };
        
        that.addFile = function (file, errorCode) {
            if (errorCode === that.model.errorCode) {
                that.model.files.push(file.name);
                that.refreshView();
            }
        };
        
        that.clear = function () {
            that.model.files = [];
            that.refreshView();
            that.events.afterErrorsCleared.fire();
        };
        
        that.refreshView = function () {
            fluid.uploader.errorPanel.section.renderHeader(that);
            fluid.uploader.errorPanel.section.renderErrorDetails(that);
            that.hideDetails();
            
            if (that.model.files.length <= 0) {
                that.container.hide();
            } else {
                that.container.show();
            }
        };
    };
    
    fluid.uploader.errorPanel.section.finalInit = function (that) {        
        // Bind delete button
        that.locate("deleteErrorButton").click(that.clear);

        // Bind hide/show error details link
        that.locate("showHideFilesToggle").click(that.toggleDetails);
        
        that.refreshView();
    };
    
    fluid.uploader.errorPanel.section.renderHeader = function (that) {
        var errorTitle = fluid.stringTemplate(that.options.strings.header, {
            numFiles: that.model.files.length
        });
        
        that.locate("errorTitle").text(errorTitle);         
    };
    
    fluid.uploader.errorPanel.section.renderErrorDetails = function (that) {
        var files = that.model.files;
        var filesList = files.length > 0 ? files.join(that.options.strings.fileListDelimiter) : "";
        that.locate("erroredFiles").text(filesList);
    };
    
    fluid.demands("fluid.uploader.errorPanel.section", [
        "fluid.uploader.errorPanel", 
        "fluid.uploader.multiFileUploader"
    ], {
        options: {
            listeners: {                
                "{multiFileUploader}.events.onQueueError": "{section}.addFile",
                "{multiFileUploader}.events.onFilesSelected": "{section}.clear",
                "{multiFileUploader}.events.onUploadStart": "{section}.clear",
                "{section}.events.afterErrorsCleared": "{errorPanel}.refreshView"
            }
        }
    });
})(jQuery, fluid_1_4);
