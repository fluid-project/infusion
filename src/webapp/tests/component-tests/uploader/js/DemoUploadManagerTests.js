/*
Copyright 2008-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(function () {
        // Redefine SWFUploadStrategy's invokers in this testing context.
        fluid.staticEnvironment.uploaderTests = fluid.typeTag("fluid.uploader.tests");
        fluid.demands("fluid.uploader.swfUploadStrategy.setupDOM", ["fluid.uploader.tests"], {
            funcName: "fluid.identity",
            args: []
        });
        
        fluid.uploader.demoRemote.tests = {
            makeMockConfig: function () {
                return {
                    button_placeholder_id: "swfUploadLovesDestroyingInnocentDomElements"
                };
            }    
        };
        
        fluid.demands("fluid.uploader.swfUploadStrategy.setupConfig", ["fluid.uploader.tests"], {
            funcName: "fluid.uploader.demoRemote.tests.makeMockConfig",
            args: []
        });
        
        fluid.demands("fluid.uploader.swfUploadStrategy.eventBinder", ["fluid.uploader.tests"], {
            funcName: "fluid.identity",
            args: []
        });
        
        var events;        
        
        // Setup test files.
        var file1 = {
            id: 0,
            size: 400000
        };
               
        var file2 = {
            id: 1,
            size: 600000
        };
                
        var file3 =  {
            id: 2,
            size: 800000
        };
        
        var file_smallerThanChunkSize =  {
            id: 3,
            size: 165432
        };
        
        var file_largerAndNotMultipleOfChunkSize =  {
            id: 4,
            size: 812345
        };
        
        var allFiles = [file1, file2, file3, file_smallerThanChunkSize, file_largerAndNotMultipleOfChunkSize];
        
        
        // Silly little data structure for capturing the sequence and parameters of the upload flow.
        var eventTracker = function (testBody) {
            var emptyFunction = function () {};
            
            var listeners = {
                onFileStart: emptyFunction,
                onFileProgress: emptyFunction,
                onFileSuccess: emptyFunction,
                afterFileComplete: emptyFunction,
                afterUploadComplete: emptyFunction
            };
            
            var tracker = jqUnit.invocationTracker({
                runTestsOnFunctionNamed: "afterUploadComplete", 
                testBody: testBody
            });
            
            tracker.interceptAll(listeners);
            tracker.listeners = listeners;
            
            return tracker;
        };
        
        var uploadFilesAndTest = function (files, testBody) {
            var tracker = eventTracker(testBody);
            
            var queue = fluid.uploader.fileQueue();
            queue.files = files;     
            
            var demo = fluid.uploader.demoRemote(queue, {
                events: {
                    onFileProgress: null,
                    afterFileComplete: null,
                    afterUploadComplete: null,
                    onFileSuccess: null,
                    onFileStart: null,
                    onFileError: null,
                    onUploadStop: null
                },
                
                listeners: tracker.listeners
            });

            queue.start();
            demo.uploadNextFile();
            
            tracker.transcript.files = files;
            return tracker.transcript;    
        };
        
        var uploadFirstFileAndTest = function (testBody) {
            return uploadFilesAndTest([file1], testBody);
        };
        
        var uploadAllFilesAndTest = function (testBody) {
            return uploadFilesAndTest([file1, file2, file3], testBody);
        };
        
        var uploadSmallFileAndTest = function (testBody) {
            return uploadFilesAndTest([file_smallerThanChunkSize], testBody);
        };
        
        var uploadNotMultipleFileAndTest = function (testBody) {
            return uploadFilesAndTest([file_largerAndNotMultipleOfChunkSize], testBody);
        };
        
        var checkEventSequenceForFile = function (transcript, file) {
            // Check that each event corresponds to the specified file.
            for (var i = 0; i < transcript.length; i++) {
                jqUnit.assertEquals("In each event callback, the file id should be correctly set.",
                                    file.id, transcript[i].args[0].id);
            }
            
            // Then check the file sequence.
            var lastEvent = transcript.length - 1;
            jqUnit.assertEquals("We should get onFileStart first.",
                                "onFileStart", transcript[0].name);    
            jqUnit.assertEquals("The second to last event should be onFileSuccess.",
                                "onFileSuccess", transcript[lastEvent - 1].name);      
            jqUnit.assertEquals("And the last event should be afterFileComplete.",
                                "afterFileComplete", transcript[lastEvent].name);
            for (i = 1; i < lastEvent - 1; i++) {
                jqUnit.assertEquals("Then an onFileProgress.",
                                    "onFileProgress", transcript[i].name);      
            }   
        };
                
        var demoUploadTests = new jqUnit.TestCase("DemoEngine Tests", function () {
            events = {};
            fluid.mergeListeners(events, fluid.defaults("fluid.uploader.multiFileUploader").events);

            for (var i = 0; i < allFiles.length; i++) {
                allFiles[i].filestatus = fluid.uploader.fileStatusConstants.QUEUED;
            }
        });
        
        demoUploadTests.asyncTest("Simulated upload flow: sequence of events.", function () {
            // Test with just one file.
            uploadFirstFileAndTest(function (transcript) {
                jqUnit.assertEquals("We should have received seven upload events.", 6, transcript.length);
                checkEventSequenceForFile(transcript.slice(0, transcript.length - 1), file1);
                jqUnit.assertEquals("The last event of a batch should be afterUploadComplete.",
                             "afterUploadComplete", transcript[transcript.length - 1].name);
                jqUnit.assertDeepEq("The argument to afterUploadComplete should be an array containing the current batch.",
                                    transcript.files, transcript[transcript.length - 1].args[0]);
                                    
                start();
            });
        });
    
        demoUploadTests.asyncTest("Simulated upload flow: sequence of events for multiple files.", function () {
            // Upload three files.
            uploadAllFilesAndTest(function (transcript) {
                jqUnit.assertEquals("We should have received nineteen upload events.", 19, transcript.length);

                // The first file is 400000 bytes, so it should have 2 progress events, for a total of 5 events.
                checkEventSequenceForFile(transcript.slice(0, 5), file1);

                // The second file is 600000 bytes, so it should have 3 progress events, for a total of 6 events.
                checkEventSequenceForFile(transcript.slice(5, 11), file2);

                // The second file is 800000 bytes, so it should have 4 progress events, for a total of 7 events.
                checkEventSequenceForFile(transcript.slice(11, transcript.length - 1), file3);

                jqUnit.assertEquals("The last event of a batch should be afterUploadComplete.",
                                    "afterUploadComplete", transcript[transcript.length - 1].name);
                jqUnit.assertDeepEq("The argument to afterUploadComplete should be an array containing the current batch.",
                                    transcript.files, transcript[transcript.length - 1].args[0]);
                start();
            });
        });
        
        demoUploadTests.asyncTest("Simulated upload flow: onFileProgress data.", function () {
            uploadFirstFileAndTest(function (transcript) {
                // Check that we're getting valid progress data for the onFileProgress events.
                jqUnit.assertEquals("The first onFileProgress event should have 200000 bytes complete.",
                                    200000, transcript[1].args[1]);
                jqUnit.assertEquals("The first onFileProgress event should have 400000 bytes in total.",
                                    400000, transcript[1].args[2]);                    
                jqUnit.assertEquals("The first onFileProgress event should have 400000 bytes complete.",
                                    400000, transcript[2].args[1]);
                jqUnit.assertEquals("The first onFileProgress event should have 400000 bytes in total.",
                                    400000, transcript[2].args[2]);
                start();
            });
        });
    
        demoUploadTests.asyncTest("Chunking test: smaller files don't get reported larger because of demo file chunking.", function () {
            uploadSmallFileAndTest(function (transcript) {
                // Check that we're getting valid progress data for the onFileProgress events.
                jqUnit.assertEquals("The only onFileProgress event should have 165432 bytes complete.",
                                    165432, transcript[1].args[1]);
                jqUnit.assertEquals("The only onFileProgress event should have 165432 bytes in total.",
                                    165432, transcript[1].args[2]);
                jqUnit.assertNotEquals("There is only one onFileProgress event in the transcript.",
                                       "onFileProgress", transcript[3].name);
                start();
            });
        });

        demoUploadTests.asyncTest("Chunking test: files that are not a multiple of the chunk size don't get reported larger because of the chunking.", function () {
            uploadNotMultipleFileAndTest(function (transcript) {
                // Check that we're getting valid progress data for the onFileProgress events.
                jqUnit.assertEquals("The first onFileProgress event should have 200000 bytes complete.",
                                    200000, transcript[1].args[1]);
                jqUnit.assertEquals("The second onFileProgress event should have 200000 more bytes complete.",
                                    400000, transcript[2].args[1]);                    
                jqUnit.assertEquals("The third onFileProgress event should have 200000 more bytes complete.",
                                    600000, transcript[3].args[1]);                    
                jqUnit.assertEquals("The fourth onFileProgress event should have 200000 more bytes complete.",
                                    800000, transcript[4].args[1]);                    
                jqUnit.assertEquals("The last onFileProgress event should have 12345 more bytes complete.",
                                    812345, transcript[5].args[1]);
                start();
            });
        });
    });
})(jQuery);
