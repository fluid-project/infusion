/*
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, jqUnit*/

(function ($) {
    $(document).ready(function () {
        
        /************************************************
         * Utility Functions for setting up an Uploader *
         ************************************************/
         
        var makeUploaderEventFirers = function () {
            var mockUploader = {};
            fluid.instantiateFirers(mockUploader, fluid.defaults("fluid.uploader.multiFileUploader"));
            return mockUploader.events;
        };
        
        var makeListeners = function () {
            return {
                afterFileQueued: function () {},
                onQueueError: function () {},
                afterFileDialog: function () {}
            };
        };
        
        var getLocalUploader = function (fileUploadLimit, fileSizeLimit, listeners, legacyBrowserFileLimit) {
            var queue = fluid.uploader.fileQueue();
            var events = makeUploaderEventFirers();            
            fluid.mergeListeners(events, listeners);
            
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
                events: events
            });
            
            // TODO: This code is tragic. Refactor the FileQueue and it can go.
            local.events.afterFileQueued.addListener(function (file) {
                queue.addFile(file);
            });
            
            return local;
        };
        
        
        /*********
         * Setup *
         *********/
         
        var html5UploaderTests = new jqUnit.TestCase("Uploader Basic Tests");
        
        var file1 = {
            id: "file1",
            size: 0
        };
                
        var file2 =  {
            id: "file2",
            size: 5000
        };

        var file3 =  {
            id: "file3",
            size: 1000001
        };
        
        html5UploaderTests.test("Ensure multipart content is correctly built", function () {
            var boundary = 1234567890123456789;
            var file = {
                name: "test",
                type: "image",
                getAsBinary: function () {
                    return "";
                }
            };
            
            var multipart = fluid.uploader.html5Strategy.generateMultiPartContent(boundary, file);
            var parts = multipart.split('\r\n');
            
            jqUnit.assertEquals("The multipart content must contain 7 lines", 7, parts.length);
            jqUnit.assertEquals("The first line of the multipart content should start with two dashes.", 0, parts[0].indexOf("--"));
            jqUnit.assertEquals("The first line of the multipart content must contain the boundary", 2, parts[0].indexOf(boundary));
            jqUnit.assertTrue("The second line of the multipart content must contain the Content-Disposition", parts[1].indexOf('Content-Disposition') !== -1);
            jqUnit.assertTrue("The second line of the multipart content must contain the name attribute with value of 'fileData'", parts[1].indexOf('name=\"fileData\"') !== -1);            
            jqUnit.assertTrue("The second line of the multipart content must contain the file name", parts[1].indexOf('filename') !== -1);
            jqUnit.assertTrue("The file name should be 'test'", parts[1].indexOf(file.name) !== -1);
            jqUnit.assertTrue("The third line of the multipart content must contain the Content-Type", parts[2].indexOf('Content-Type') !== -1);
            jqUnit.assertTrue("The Content-Type should be 'image'", parts[2].indexOf(file.type) !== -1);
            jqUnit.assertTrue("The sixth line of the multipart content must also contain the boundary", parts[5].indexOf(boundary) !== -1);
        });
        
        html5UploaderTests.test("Uploader HTML5 browseHandler", function () {
            var browseButton = $("#browseButton");
            var browseButtonView = fluid.uploader.html5Strategy.browseButtonView("#browseButtonContainer", {
                queueSettings: {
                    fileTypes: ""
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
            
            inputs.eq(1).focus();
            jqUnit.assertTrue("On focus, the browseButton input has the focus class", browseButton.hasClass("focus"));
            
            inputs.eq(1).blur();
            jqUnit.assertFalse("On blur, the browseButton no longer has the focus class", browseButton.hasClass("focus"));
        });
        
        
        /********************
         * addFiles() Tests *
         ********************/
        
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
        
        var checkAfterFileDialogEvent = function (expectedNumFiles, transcript) {
            var lastTranscriptEntry = transcript[transcript.length -1];
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
        
        html5UploaderTests.test("Uploader HTML5 addFiles: upload limit 3, 1MB file size limit", function () {
            var files = [
                file1, 
                file2, 
                file3
            ];
            
            var tracker = jqUnit.invocationTracker();
            var listeners = makeListeners();
            tracker.interceptAll(listeners);
            
            var localUploader = getLocalUploader(3, 1, listeners, null);
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
            
            var tracker = jqUnit.invocationTracker();
            var listeners = makeListeners();
            tracker.interceptAll(listeners);
            
            var localUploader = getLocalUploader(1, 0, listeners, 1000);
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
             
             var tracker = jqUnit.invocationTracker();
             var listeners = makeListeners();
             tracker.interceptAll(listeners);
                                                  
             var localUploader = getLocalUploader(0, 0, listeners, 1000);
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
             
             var tracker = jqUnit.invocationTracker();
             var listeners = makeListeners();
             tracker.interceptAll(listeners);
                                                  
             var localUploader = getLocalUploader(null, 0, listeners, 1000);
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
             
             var tracker = jqUnit.invocationTracker();
             var listeners = makeListeners();
             tracker.interceptAll(listeners);
                                                  
             var localUploader = getLocalUploader(undefined, 0, listeners, 1000);
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
    });
})(jQuery);