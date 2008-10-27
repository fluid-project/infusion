/*global jQuery, fluid, jqUnit*/

(function ($) {
    $(function () {
        var demoUploadTests = new jqUnit.TestCase("DemoUploadManager Tests");
        
        // Test files.
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
        
        var events = {};
        fluid.mergeListeners(events, fluid.defaults("fluid.uploader").events);
        
        // Silly little data structure for capturing the sequence and parameters of the upload flow.
        var eventTracker = function () {
            var emptyFunction = function () {};
            
            var listeners = {
                onUploadStart: emptyFunction,
                onFileProgress: emptyFunction,
                onFileSuccess: emptyFunction,
                afterFileComplete: emptyFunction,
                afterUploadComplete: emptyFunction
            };
            
            var tracker = jqUnit.invocationTracker();
            tracker.interceptAll(listeners);
            tracker.listeners = listeners;
            
            return tracker;
        };
        
        var uploadFiles = function (files) {      
            var tracker = eventTracker();
            
            var demoManager = fluid.demoUploadManager(events, {
                simulateDelay: false,
                listeners: tracker.listeners
            });
            
            // Just upload one file.
            demoManager.queue.files = files;
            demoManager.start();
            
            tracker.transcript.files = files;
            
            return tracker.transcript;    
        };
        
        var uploadFirstFile = function () {
            return uploadFiles([file1]);
        };
        
        var uploadAllFiles = function () {
            return uploadFiles([file1, file2, file3]);
        };

        demoUploadTests.test("Options merging", function () {
            // Test with no events and no additional options. simulateDelay should be true.
            var demoManager = fluid.demoUploadManager(events);
            
            // Ensure our default options are cool.
            jqUnit.assertTrue("simulateDelay should default to true.", demoManager.options.simulateDelay);
            jqUnit.assertEquals("We should have inherited our parent's default options.",
                                "../../swfupload/swfupload_f9.swf",
                                demoManager.options.flashURL);
                                
            // Test an alternative option. simulateDelay should be false.
            demoManager = fluid.demoUploadManager(events, {
                simulateDelay: false
            });
            jqUnit.assertFalse("simulateDelay should be false.", demoManager.options.simulateDelay);
        });
        
        var checkEventSequenceForFile = function (transcript, file) {
            // Check that each event corresponds to the specified file.
            for (var i = 0; i < transcript.length; i++) {
                jqUnit.assertEquals("In each event callback, the file id should be 0.",
                                    file.id, transcript[i].args[0].id);
            }
            
            // Then check the file sequence.
            var lastEvent = transcript.length - 1;
            jqUnit.assertEquals("We should get onUploadStart first.",
                                "onUploadStart", transcript[0].name);    
            jqUnit.assertEquals("The second to last event should be onFileSuccess.",
                                "onFileSuccess", transcript[lastEvent - 1].name);      
            jqUnit.assertEquals("And the last event should be afterFileComplete.",
                                "afterFileComplete", transcript[lastEvent].name);
            for (i = 1; i < lastEvent - 1; i++) {
                jqUnit.assertEquals("Then an onFileProgress.",
                                    "onFileProgress", transcript[i].name);      
            }   
        };
        
        demoUploadTests.test("Simulated upload flow: sequence of events.", function () {
            // Test with just one file.
            var transcript = uploadFirstFile();
            jqUnit.assertEquals("We should have received six upload events.", 6, transcript.length);
            
            checkEventSequenceForFile(transcript.slice(0, transcript.length -1), file1);
            jqUnit.assertEquals("The last event of a batch should be afterUploadComplete.",
                         "afterUploadComplete", transcript[transcript.length - 1].name);
            jqUnit.assertEquals("The argument to afterUploadComplete should be the full list of files.",
                                transcript.files, transcript[transcript.length - 1].args[0]);
            // Now upload them all.
            transcript = uploadAllFiles();
            jqUnit.assertEquals("We should have received nineteen upload events.", 19, transcript.length);
            
            checkEventSequenceForFile(transcript.slice(0, 5), file1);
            checkEventSequenceForFile(transcript.slice(5, 11), file2);
            checkEventSequenceForFile(transcript.slice(11, 18), file3);
        });
        
        demoUploadTests.test("Simulated upload flow: onFileProgress data.", function () {
            var transcript = uploadFirstFile();
            
            // Check that we're getting valid progress data for the onFileProgress events.
            jqUnit.assertEquals("The first onFileProgress event should have 200000 bytes complete.",
                                200000, transcript[1].args[1]);
            jqUnit.assertEquals("The first onFileProgress event should have 400000 bytes in total.",
                                400000, transcript[1].args[2]);                    
            jqUnit.assertEquals("The first onFileProgress event should have 400000 bytes complete.",
                                400000, transcript[2].args[1]);
            jqUnit.assertEquals("The first onFileProgress event should have 400000 bytes in total.",
                                400000, transcript[2].args[2]);
        });
    });
})(jQuery);
