/*
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {
        
        fluid.registerNamespace("fluid.tests.uploader.html5");
        
        /*******************************************************************
         * Useful testing functions for the HTML5 version of the Uploader. *
         *******************************************************************/
         
        fluid.tests.uploader.html5.mockFile = function (id, name, type, size) {
            return {
                id: id,
                name: name,
                type: type,
                size: size,
                getAsBinary: fluid.identity
            };
        };
        
        fluid.tests.uploader.html5.mockXHR = function () {
            var that = {};
            
            that.resetMock = function () {
                that.method = undefined;
                that.url = undefined;
                that.async = undefined;
                that.contentType = undefined;
                that.sent = undefined;
            };
            
            that.open = function (method, url, async) {
                that.method = method;
                that.url = url;
                that.async = async;
            };
            
            that.setRequestHeader = function (contentType) {
                that.contentType = contentType;
            };
            
            that.sendAsBinary = function () {
                that.sent = arguments;
            };
            
            that.send = that.sendAsBinary;
            
            that.resetMock();
            return that;
        };
        
        
        /************************************************
         * Utility Functions for setting up an Uploader *
         ************************************************/
        
        var trackLocalListeners = function () {
            var tracker = jqUnit.invocationTracker();
            var emptyFn = function () {};
            var listeners = {
                afterFileQueued: emptyFn,
                onQueueError: emptyFn,
                afterFileDialog: emptyFn
            };
            tracker.interceptAll(listeners);
            tracker.listeners = listeners;
            return tracker;
        };
        
        var trackRemoteListeners = function () {
            var tracker = jqUnit.invocationTracker();
            var emptyFn = function () {};
            var listeners = {
                onFileSuccess: emptyFn,
                onFileError: emptyFn,
                onFileComplete: emptyFn
            };
            tracker.interceptAll(listeners);
            tracker.listeners = listeners;
            return tracker;            
        };
        
        var getLocalUploader = function (fileUploadLimit, fileSizeLimit, tracker) {
            var shell = fluid.tests.uploader.mockUploader( {
                components: {
                    local: {
                        type: "fluid.uploader.html5Strategy.local",
                        options: {
                            components: {
                                browseButtonView: { 
                                    type: "fluid.emptySubcomponent", 
                                    options: {} 
                                }
                            },
                            queueSettings: {
                                fileUploadLimit: fileUploadLimit, 
                                fileSizeLimit: fileSizeLimit
                            },
                            listeners: tracker.listeners            
                        }
                    }
                }
            });
            var local = shell.local;
            
            // TODO: This code is tragic. Refactor the FileQueue and it can go.
            local.events.afterFileQueued.addListener(function (file) {
                shell.queue.addFile(file);
            });
            
            return local;
        };
        
        var getRemoteUploader = function (tracker) {
            var shell = fluid.tests.uploader.mockUploader( {
                components: {
                    remote: {
                        type: "fluid.uploader.html5Strategy.remote",
                        options: {
                            listeners: tracker.listeners
                        } 
                    }
                }
            });
            return shell.remote;
        };
        
        var checkEventForFile = function (eventName, file, transcriptEntry) {
            jqUnit.assertEquals("An " + eventName + " event should have been fired.", 
                                eventName, transcriptEntry.name);
            jqUnit.assertEquals("The event should have be passed the correct file", 
                                file, transcriptEntry.args[0]);
        };
        
        var checkEventOrderForFiles = function (eventOrder, files, transcript) {
            for (var i = 0; i < files.length; i++) {
                checkEventForFile(eventOrder[i], files[i], transcript[i]);
            }
        };
        
        var checkOnFileCompleteEvent = function (transcript) {
            var lastTranscriptEntry = transcript[transcript.length - 1];
            jqUnit.assertEquals("The last event should be onFileComplete", 
                                "onFileComplete", lastTranscriptEntry.name);
            jqUnit.assertEquals("One argument should have been passed to onFileComplete", 
                                1, lastTranscriptEntry.args.length);        
        };
        
        var checkAfterFileDialogEvent = function (expectedNumFiles, transcript) {
            var lastTranscriptEntry = transcript[transcript.length - 1];
            jqUnit.assertEquals("The last event should be afterFileDialog", 
                                "afterFileDialog", lastTranscriptEntry.name);
            jqUnit.assertEquals("One argument should have been passed to afterFileDialog", 
                                1, lastTranscriptEntry.args.length);        
            jqUnit.assertEquals(expectedNumFiles + " files should have been passed to afterFileDialog", 
                                expectedNumFiles, lastTranscriptEntry.args[0]);
        };
        
        var checkEventSequenceForAddedFiles = function (eventOrder, expectedNumFilesAdded, files, transcript) {
            var expectedNumEvents = eventOrder.length + 1;
            jqUnit.assertEquals(expectedNumEvents + " events should have been fired.", 
                                expectedNumEvents, transcript.length);
            checkEventOrderForFiles(eventOrder, files, transcript);
            checkAfterFileDialogEvent(expectedNumFilesAdded, transcript);
        };
        
        var clearTranscriptAndAddFiles = function (tracker, files, localUploader) {
            tracker.clearTranscript();
            localUploader.addFiles(files);
        };
        
        /*********
         * Setup *
         *********/
         
        jqUnit.module("Uploader Basic Tests");

        var file1 = fluid.tests.uploader.html5.mockFile("file1", "emptyfile.zip", "application/zip", 0),
            file2 = fluid.tests.uploader.html5.mockFile("file2", "tinyfile.jpg", "image/jpeg", 5),
            file3 = fluid.tests.uploader.html5.mockFile("file3", "bigfile.rar", "application/x-rar-compressed", 200000);
            
        
        /******************************
         * fileSuccessHandler() Tests *
         ******************************/
        
        jqUnit.test("Ensure event sequence for fileSuccessHandler", function () {
            var xhr = {
                status: 200, 
                responseText: "testing"
            };
            
            var files = [file1];
            var tracker = trackRemoteListeners();
            var transcript = tracker.transcript;
            var remote = getRemoteUploader(tracker);
            
            fluid.uploader.html5Strategy.fileSuccessHandler(file1, remote.events, xhr);
            
            var eventOrder = ["onFileSuccess", "onFileComplete"];
            var expectedNumEvents = eventOrder.length;
            jqUnit.assertEquals(expectedNumEvents + " events should have been fired.", 
                                expectedNumEvents, transcript.length);      
            checkEventOrderForFiles(eventOrder, files, transcript);
            checkOnFileCompleteEvent(transcript);
        });
        
        /****************************
         * fileErrorHandler() Tests *
         ****************************/
        
        jqUnit.test("Ensure event sequence for fileErrorHandler", function () {
            var xhr = {
                status: 200, 
                responseText: "testing"
            };
            
            var files = [file2];
            var tracker = trackRemoteListeners();
            var transcript = tracker.transcript;
            var remote = getRemoteUploader(tracker);
            
            fluid.uploader.html5Strategy.fileErrorHandler(file2, remote.events, xhr);
            
            var eventOrder = ["onFileError", "onFileComplete"];
            var expectedNumEvents = eventOrder.length;
            jqUnit.assertEquals(expectedNumEvents + " events should have been fired.", 
                                expectedNumEvents, transcript.length);      
            checkEventOrderForFiles(eventOrder, files, transcript);
            checkOnFileCompleteEvent(transcript);            
        });
        
        /***************************
         * fileStopHandler() Tests *
         ***************************/
        
        jqUnit.test("Ensure event sequence for fileStopHandler", function () {
            var xhr = {
                status: 200, 
                responseText: "testing"
            };
            
            var files = [file3];
            var tracker = trackRemoteListeners();
            var transcript = tracker.transcript;
            var remote = getRemoteUploader(tracker);
            
            fluid.uploader.html5Strategy.fileStopHandler(file3, remote.events, xhr);
            
            var eventOrder = ["onFileError", "onFileComplete"];
            var expectedNumEvents = eventOrder.length;
            jqUnit.assertEquals(expectedNumEvents + " events should have been fired.", 
                                expectedNumEvents, transcript.length);      
            checkEventOrderForFiles(eventOrder, files, transcript);
            checkOnFileCompleteEvent(transcript);            
        });         

        
        /****************************
         * browseButtonView() Tests *
         ****************************/
        
        jqUnit.test("Uploader HTML5 browseHandler", function () {
            var browseButton = $("#browseButton");
            var browseButtonView = fluid.uploader.html5Strategy.browseButtonView("#browseButtonContainer", {
                queueSettings: {
                    fileTypes: []
                }
            });

            var inputs = browseButton.children();
            jqUnit.assertEquals("There should be one multi-file input element at the start", 1, inputs.length);
            jqUnit.assertEquals("The multi-file input element should be visible and in the tab order to start", 
                0, inputs.eq(0).attr("tabindex"));
            
            browseButtonView.renderFreshMultiFileInput();
            inputs = browseButton.children();
            jqUnit.assertEquals("After the first batch of files have processed, there should now be two multi-file input elements", 
                2, inputs.length);
            jqUnit.assertEquals("The original multi-file input element should be removed from the tab order", 
                -1, inputs.eq(0).attr("tabindex"));            
            jqUnit.assertEquals("The second multi-file input element should be visible and in the tab order", 
                0, inputs.eq(1).attr("tabindex"));
            
            browseButtonView.disable();
            jqUnit.assertTrue("The browse browseButton has been disabled", inputs.eq(1).prop("disabled"));
            browseButtonView.enable();
            jqUnit.assertFalse("The browse browseButton has been enabled", inputs.eq(1).prop("disabled"));                      
            inputs.eq(1).focus();
            jqUnit.assertTrue("On focus, the browseButton input has the focus class", browseButton.hasClass("focus"));
            inputs.eq(1).blur();
            jqUnit.assertFalse("On blur, the browseButton no longer has the focus class", browseButton.hasClass("focus"));
        });
        
        
        /********************
         * addFiles() Tests *
         ********************/
        var addFilesTests = [ {
            fileUploadLimit: 3,
            fileSizeLimit: 1,
            step1Events: ["afterFileQueued", "afterFileQueued", "onQueueError"],
            step1Files: 2, // Test #1: Two out of three files should have been added to the queue. The third is too large.
            step2Events: ["afterFileQueued", "onQueueError", "onQueueError"],
            step2Files: 1  // Test #2: One file should have been added, after which the fileUploadLimit will have been hit.
        }, {
            fileUploadLimit: 1,
            fileSizeLimit: 100000,
            step1Events: ["afterFileQueued", "onQueueError", "onQueueError"],
            step1Files: 1, // Test #1: One out of three files should have been added to the queue.
            step2Events: ["onQueueError", "onQueueError", "onQueueError"],
            step2Files: 0  // Test #2: No files should have been added, since the fileUploadLimit has been hit.
        }, {
            fileUploadLimit: 0,
            fileSizeLimit: 100000,
            step1Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued"],
            step1Files: 3, // Test #1: All three files should have been added to the queue.
            step2Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued"],
            step2Files: 3  // Test #2: All three files should have been added to the queue.
        }, {
            fileUploadLimit: null,
            fileSizeLimit: 100000,
            step1Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued"],
            step1Files: 3, // Test #1: All three files should have been added to the queue.
            step2Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued"],
            step2Files: 3  // Test #2: All three files should have been added to the queue.
        }, {
            fileUploadLimit: undefined,
            fileSizeLimit: 100000,
            step1Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued"],
            step1Files: 3, // Test #1: All three files should have been added to the queue.
            step2Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued"],
            step2Files: 3  // Test #2: All three files should have been added to the queue.
        }
        ];
        
        fluid.tests.uploader.addFilesTest = function (fixture) {
            jqUnit.test("Uploader HTML5 addFiles: upload limit " + fixture.fileUploadLimit + " , " + fixture.fileSizeLimit + "KB file size limit", function () {
                var files = [
                    file1, 
                    file2, 
                    file3
                ];
                
                var tracker = trackLocalListeners();            
                var localUploader = getLocalUploader(fixture.fileUploadLimit, fixture.fileSizeLimit, tracker);
                localUploader.addFiles(files);
                
                checkEventSequenceForAddedFiles(fixture.step1Events, fixture.step1Files, files, tracker.transcript);
                jqUnit.assertEquals("Sanity check: the queue should contain " + fixture.step1Files + " files", fixture.step1Files, localUploader.queue.files.length);

                clearTranscriptAndAddFiles(tracker, files, localUploader);
                eventOrder = ["afterFileQueued", "onQueueError", "onQueueError"];
                checkEventSequenceForAddedFiles(fixture.step2Events, fixture.step2Files, files, tracker.transcript);
                var totalFiles = fixture.step1Files + fixture.step2Files;
                jqUnit.assertEquals("Sanity check: the queue should contain " + totalFiles + " files", totalFiles, localUploader.queue.files.length);
            });
        };
        
        fluid.each(addFilesTests, fluid.tests.uploader.addFilesTest);
        
        jqUnit.test("formDataSender tests", function () {
            var queueSettings = {
                uploadURL: "/home/Uploader",
                postParams: {
                    name: "HTML5",
                    id: "8"
                }
            };
            
            var xhr = fluid.tests.uploader.html5.mockXHR();
            var sender = fluid.uploader.html5Strategy.formDataSender({
                invokers: {
                    createFormData: "fluid.tests.uploader.mockFormData"
                }
            });
            
            var formData = sender.send(file1, queueSettings, xhr);
            jqUnit.assertEquals("The correct file is appended", file1.id, formData.data.file.id);
            jqUnit.assertEquals("postParam is correctly appended to FormData", "HTML5", formData.data.name);
            jqUnit.assertEquals("postParam is correctly appended to FormData", 8, formData.data.id);
            jqUnit.assertEquals("XHR receives the proper method", "POST", xhr.method);
            jqUnit.assertEquals("XHR url is set", "/home/Uploader", xhr.url);
            jqUnit.assertTrue("XHR to execute asynchronously", xhr.async);
            jqUnit.assertEquals("XHR.sendAsBinary() received one argument", 1, xhr.sent.length);
            jqUnit.assertEquals("The FormData instance was sent via XHR.sendAsBinary()", formData, xhr.sent[0]);
        });
       
    });
})(jQuery);