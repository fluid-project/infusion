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
        
        fluid.tests.uploader.html5.checkMultipartRequest = function (req, file, boundary) {
            var parts = req.split('\r\n');
            
            // Check for the MIME multipart boundary, if we know what it is.
            if (boundary) {
                jqUnit.assertEquals("The first line of the multipart content must contain the boundary", 2, parts[0].indexOf(boundary));
                jqUnit.assertTrue("The sixth line of the multipart content must also contain the boundary", parts[5].indexOf(boundary) !== -1);
            }
            
            // Check the rest of the request.
            jqUnit.assertEquals("The multipart content must contain 7 lines", 7, parts.length);
            jqUnit.assertEquals("The first line of the multipart content should start with two dashes.", 0, parts[0].indexOf("--"));
            jqUnit.assertTrue("The second line of the multipart content must contain the Content-Disposition", parts[1].indexOf('Content-Disposition') !== -1);
            jqUnit.assertTrue("The second line of the multipart content must contain the name attribute with value of 'fileData'", parts[1].indexOf('name=\"fileData\"') !== -1);            
            jqUnit.assertTrue("The second line of the multipart content must contain the file name", parts[1].indexOf('filename') !== -1);
            jqUnit.assertTrue("The file name should be 'test'", parts[1].indexOf(file.name) !== -1);
            jqUnit.assertTrue("The third line of the multipart content must contain the Content-Type", parts[2].indexOf('Content-Type') !== -1);
            jqUnit.assertTrue("The Content-Type should be 'image'", parts[2].indexOf(file.type) !== -1);
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
        
        var getLocalUploader = function (fileUploadLimit, fileSizeLimit, legacyBrowserFileLimit, tracker) {
            var queue = fluid.uploader.fileQueue();
            
            var local = fluid.uploader.html5Strategy.local(queue, legacyBrowserFileLimit, {
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
                events: {
                    afterFileQueued: null,
                    onQueueError: null,
                    afterFileDialog: null,
                    onFilesSelected: null
                },
                listeners: tracker.listeners 
            });
            
            // TODO: This code is tragic. Refactor the FileQueue and it can go.
            local.events.afterFileQueued.addListener(function (file) {
                queue.addFile(file);
            });
            
            return local;
        };
        
        var getRemoteUploader = function (tracker) {
            var queue = fluid.uploader.fileQueue();
            
            var remote = fluid.uploader.html5Strategy.remote(queue, {
                queueSettings: {
                    uploadURL: "",
                    postParams: ""
                },
                events: {
                    afterReady: null,
                    onFileSuccess: null,
                    onFileError: null,
                    onFileComplete: null,
                    onFileProgress: null
                }, 
                listeners: tracker.listeners
            });
            
            return remote;
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
         
        var html5UploaderTests = new jqUnit.TestCase("Uploader Basic Tests");

        var file1 = fluid.tests.uploader.html5.mockFile("file1", "emptyfile.zip", "application/zip", 0),
            file2 = fluid.tests.uploader.html5.mockFile("file2", "tinyfile.jpg", "image/jpeg", 5),
            file3 = fluid.tests.uploader.html5.mockFile("file3", "bigfile.rar", "application/x-rar-compressed", 200000);
            
        
        /******************************
         * fileSuccessHandler() Tests *
         ******************************/
        
        html5UploaderTests.test("Ensure event sequence for fileSuccessHandler", function () {
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
         * fileErorrHandler() Tests *
         ****************************/
        
        html5UploaderTests.test("Ensure event sequence for fileErrorHandler", function () {
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
        
        html5UploaderTests.test("Ensure event sequence for fileStopHandler", function () {
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

        
        /************************************
         * generateMultiPartContent() Tests *
         ************************************/
                
        html5UploaderTests.test("Ensure multipart content is correctly built", function () {
            var boundary = 1234567890123456789;
            var file = {
                name: "test",
                type: "image",
                getAsBinary: function () {
                    return "";
                }
            };
            
            var req = fluid.uploader.html5Strategy.generateMultiPartContent(boundary, file);
            fluid.tests.uploader.html5.checkMultipartRequest(req, file, boundary);
        });
        
        
        /****************************
         * browseButtonView() Tests *
         ****************************/
        
        html5UploaderTests.test("Uploader HTML5 browseHandler", function () {
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
        
        html5UploaderTests.test("Uploader HTML5 addFiles: upload limit 3, 1MB file size limit", function () {
            var files = [
                file1, 
                file2, 
                file3
            ];
            
            var tracker = trackLocalListeners();            
            var localUploader = getLocalUploader(3, 1, null, tracker);
            localUploader.addFiles(files);
            
            // Test #1: Two out of three files should have been added to the queue. The third is too large.
            var eventOrder = ["afterFileQueued", "afterFileQueued", "onQueueError"];
            checkEventSequenceForAddedFiles(eventOrder, 2, files, tracker.transcript);
            jqUnit.assertEquals("Sanity check: the queue should contain 2 files", 2, localUploader.queue.files.length);
            
            // Test #2: One file should have been added, after which the fileUploadLimit will have been hit.
            clearTranscriptAndAddFiles(tracker, files, localUploader);
            eventOrder = ["afterFileQueued", "onQueueError", "onQueueError"];
            checkEventSequenceForAddedFiles(eventOrder, 1, files, tracker.transcript);
            jqUnit.assertEquals("Sanity check: the queue should contain 3 files", 3, localUploader.queue.files.length);
        });
        
        html5UploaderTests.test("Uploader HTML5 addFiles: upload limit 1, 100MB file size limit", function () {
            var files = [
                file1, 
                file2, 
                file3
            ];
            
            var tracker = trackLocalListeners();
            var localUploader = getLocalUploader(1, 0, 100000, tracker);
            localUploader.addFiles(files);
            
            // Test #1: One out of three files should have been added to the queue.
            var eventOrder = ["afterFileQueued", "onQueueError", "onQueueError"];
            checkEventSequenceForAddedFiles(eventOrder, 1, files, tracker.transcript);
            jqUnit.assertEquals("Sanity check: the queue should contain 1 files", 1, localUploader.queue.files.length);
            
            // Test #2: No files should have been added, since the fileUploadLimit has been hit.
            clearTranscriptAndAddFiles(tracker, files, localUploader);
            eventOrder = ["onQueueError", "onQueueError", "onQueueError"];
            checkEventSequenceForAddedFiles(eventOrder, 0, files, tracker.transcript);
            jqUnit.assertEquals("Sanity check: the queue should contain 1 files", 1, localUploader.queue.files.length);        
        });
        
        html5UploaderTests.test("Uploader HTML5 addFiles: upload limit 0 (infinity), 100MB file size limit", function () {
            var files = [
                    file1, 
                    file2, 
                    file3
                ];
             
            var tracker = trackLocalListeners(); 
            var localUploader = getLocalUploader(0, 0, 100000, tracker);
            localUploader.addFiles(files);
             
            // Test #1: All three files should have been added to the queue.
            var eventOrder = ["afterFileQueued", "afterFileQueued", "afterFileQueued"];
            checkEventSequenceForAddedFiles(eventOrder, 3, files, tracker.transcript);
            jqUnit.assertEquals("Sanity check: the queue should contain 3 files", 3, localUploader.queue.files.length);
             
            // Test #2: All three files should have been added to the queue.
            clearTranscriptAndAddFiles(tracker, files, localUploader);
            eventOrder = ["afterFileQueued", "afterFileQueued", "afterFileQueued"];
            checkEventSequenceForAddedFiles(eventOrder, 3, files, tracker.transcript);
            jqUnit.assertEquals("Sanity check: the queue should contain 6 files", 6, localUploader.queue.files.length);
        });            
        
        html5UploaderTests.test("Uploader HTML5 addFiles: upload limit is null, 100MB file size limit", function () {
            var files = [
                    file1, 
                    file2, 
                    file3
                ];
             
            var tracker = trackLocalListeners();
            var localUploader = getLocalUploader(null, 0, 100000, tracker);
            localUploader.addFiles(files);
             
            // Test #1: All three files should have been added to the queue.
            var eventOrder = ["afterFileQueued", "afterFileQueued", "afterFileQueued"];
            checkEventSequenceForAddedFiles(eventOrder, 3, files, tracker.transcript);
            jqUnit.assertEquals("Sanity check: the queue should contain 3 files", 3, localUploader.queue.files.length);
            
            // Test #2: All three files should have been added to the queue.
            clearTranscriptAndAddFiles(tracker, files, localUploader);
            eventOrder = ["afterFileQueued", "afterFileQueued", "afterFileQueued"];
            checkEventSequenceForAddedFiles(eventOrder, 3, files, tracker.transcript);
            jqUnit.assertEquals("Sanity check: the queue should contain 4 files", 6, localUploader.queue.files.length);
        });             
        
        html5UploaderTests.test("Uploader HTML5 addFiles: upload limit is undefined, 100MB file size limit", function () {
            var files = [
                    file1, 
                    file2, 
                    file3
                ];
             
            var tracker = trackLocalListeners();
            var localUploader = getLocalUploader(undefined, 0, 100000, tracker);
            localUploader.addFiles(files);
             
            // Test #1: All three files should have been added to the queue.
            var eventOrder = ["afterFileQueued", "afterFileQueued", "afterFileQueued"];
            checkEventSequenceForAddedFiles(eventOrder, 3, files, tracker.transcript);
            jqUnit.assertEquals("Sanity check: the queue should contain 3 files", 3, localUploader.queue.files.length);
             
            // Test #2: All three files should have been added to the queue.
            clearTranscriptAndAddFiles(tracker, files, localUploader);
            eventOrder = ["afterFileQueued", "afterFileQueued", "afterFileQueued"];
            checkEventSequenceForAddedFiles(eventOrder, 3, files, tracker.transcript);
            jqUnit.assertEquals("Sanity check: the queue should contain 6 files", 6, localUploader.queue.files.length);
        });                 
        
        html5UploaderTests.test("formDataSender tests", function () {
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
        
        html5UploaderTests.test("doManualMultipartUpload tests", function () {
            var queueSettings = {
                uploadURL: "/home/Uploader"
            }; 

            var xhr = fluid.tests.uploader.html5.mockXHR();
            var sender = fluid.uploader.html5Strategy.rawMIMESender();
            sender.send(file1, queueSettings, xhr);
            jqUnit.assertEquals("XHR receives the proper method", "POST", xhr.method);
            jqUnit.assertEquals("XHR url is set", "/home/Uploader", xhr.url);
            jqUnit.assertTrue("XHR to execute asynchronously", xhr.async);
            jqUnit.assertTrue("XHR has the contentType set", xhr.contentType);
            jqUnit.assertEquals("XHR.send() received one argument", 1, xhr.sent.length);
            fluid.tests.uploader.html5.checkMultipartRequest(xhr.sent[0], file1);
        });        
    });
})(jQuery);