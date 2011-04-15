/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010 OCAD University

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
        var uploaderTests = new jqUnit.TestCase("Uploader Basic Tests");
        
        fluid.staticEnvironment.uploader = fluid.typeTag("fluid.uploader.tests");
        
        /**************************
         * formatFileSize() tests *
         **************************/
        
        uploaderTests.test("formatFileSize()", function () {          
            var testFileSize = function (testVal, expected) {
                jqUnit.assertEquals("File size " + testVal + " bytes ", expected, 
                                    fluid.uploader.formatFileSize(testVal));
            };
            
            testFileSize(0, "0.0 KB");
            testFileSize(1, "0.1 KB");
            testFileSize(10, "0.1 KB");
            testFileSize(50, "0.1 KB");
            testFileSize(100, "0.1 KB");
            testFileSize(150, "0.2 KB");
            testFileSize(200, "0.2 KB");
            testFileSize(400, "0.4 KB");
            testFileSize(600, "0.6 KB");
            testFileSize(800, "0.8 KB");
            testFileSize(900, "0.9 KB");
            testFileSize(910, "0.9 KB");
            testFileSize(950, "1.0 KB");
            testFileSize(999, "1.0 KB");
            testFileSize(1023, "1.0 KB");
            testFileSize(1024, "1.0 KB");
            testFileSize(1025, "1.1 KB");
            testFileSize(10000, "9.8 KB");
            testFileSize(100000, "97.7 KB");
            testFileSize(1000000, "976.6 KB");
            testFileSize(10000000, "9.6 MB");
            testFileSize(100000000, "95.4 MB");
            testFileSize(10000000000, "9536.8 MB");
            testFileSize(-1024, "");
            testFileSize("string", "");
            testFileSize(Math.pow(2, 52), "4294967296.0 MB");
            testFileSize(Math.pow(2, 1024), "Infinity MB"); //test "infinity"
        });

        /*************************
         * derivePercent() tests *
         *************************/
        
        uploaderTests.test("derivePercent()", function () {          
            var total = 5;
            var testPercentage = function (testVal, expected) {
                jqUnit.assertEquals(testVal + "/" + total + " is " + expected + "%", expected, 
                                    fluid.uploader.derivePercent(testVal, total));
            };
            testPercentage(0, 0);
            testPercentage(2.5, 50);
            testPercentage(total, 100);
            testPercentage(10, 200);
            testPercentage(0.1, 2);
            testPercentage(-5, -100);
            testPercentage("1", 20);
            testPercentage("0.2", 4);
            
            //change total to odd number to test rounding
            total = 7;
            testPercentage(0, 0);
            testPercentage(3.5, 50);
            testPercentage(total, 100);
            testPercentage(10, 143); //142.857
            testPercentage(0.1, 1);  //1.42857
            testPercentage(-5, -71); //-71.42857
            testPercentage("3.5", 50); 
            testPercentage("0.1", 1);  //1.42857
            
            //infinity test
            testPercentage(Math.pow(2, 1024), "Infinity");
            total = Math.pow(2, 1024);
            testPercentage(0, 0);
            jqUnit.assertTrue(total + "/" + total + " is not a number", 
                            isNaN(fluid.uploader.derivePercent(total / total)));
        });

        var events = {
            afterFileDialog: fluid.event.getEventFirer(),
            afterFileRemoved: fluid.event.getEventFirer(),
            onUploadStart: fluid.event.getEventFirer(),
            onFileProgress: fluid.event.getEventFirer(),
            afterUploadComplete: fluid.event.getEventFirer()
        };
        var status = $("#statusRegion");
        var totalStatusText = $("#totalFileStatusText");
        
        var checkStatusAfterFiringEvent = function (text, eventName) {
            totalStatusText.text(text);
            events[eventName].fire();
            jqUnit.assertEquals("The status region should match the total text after firing " + eventName, 
                                totalStatusText.text(), status.text());    
        };
        
        /*********************************
         * ariaLiveRegionUpdater() tests *
         *********************************/
        
        uploaderTests.test("ARIA Updater", function () {
            fluid.uploader.ariaLiveRegionUpdater(status, totalStatusText, events);
            
            jqUnit.assertEquals("The status region should be empty to start.", "", status.text());
            
            totalStatusText.text("hello world");
            jqUnit.assertEquals("The status region should be empty after invoking the updater.", 
                                "", status.text());
            
            checkStatusAfterFiringEvent("cat", "afterFileDialog");
            checkStatusAfterFiringEvent("dog", "afterFileRemoved");       
            checkStatusAfterFiringEvent("shark", "afterUploadComplete");           
        });
        
        /*************************************************************
         * Uploader Integration Tests                                *
         *                                                           * 
         * Tests single-file, SWF, and HTML5 uploader strategies.    *
         * Ensure that the uploader is correctly instantiated by     *
         * the following methods:                                    *
         *                                                           *
         * 1. Plain, simple instantiation                            *
         * 2. Instantiation as a subcomponent                        *
         * 3. Instantiation as a subcomponent with external demands  *
         *************************************************************/
        
        var file1 = {
            id: "file1",
            size: 0, 
            getAsBinary: function () {}
        };
                    
        var file2 =  {
            id: "file2",
            size: 5, 
            getAsBinary: function () {}
        };
        
        /*
         * Instantiate an uploader as a subcomponent 
         */
        fluid.uploader.parent = function (options) {
            var that = fluid.initLittleComponent("fluid.uploader.parent", options);
            fluid.initDependents(that);
            return that;
        };
        
        /*
         * Instantiate an uploader as a subcomponent with external demands
         */
        fluid.uploader.parent.loadDemands = function (options) {
            var that = fluid.initLittleComponent("fluid.uploader.parent.loadDemands", options);
            fluid.initDependents(that);
            return that;
        };        
        
        fluid.defaults("fluid.uploader.parent", {
            gradeNames: ["fluid.littleComponent"],
            components: {
                uploader: {
                    type: "fluid.uploader",
                    container: ".flc-uploader"
                }
            }
        });
        
        fluid.defaults("fluid.uploader.parent.loadDemands", {
            gradeNames: ["fluid.littleComponent"],
            components: {
                uploader: {
                    type: "fluid.uploader"
                }
            }
        });

        fluid.demands("fluid.uploader", "fluid.uploader.parent.loadDemands", {
            container: ".flc-uploader"
        });             
        
        fluid.demands("fluid.uploader.html5Strategy.createFileUploadXHR", ["fluid.uploader.html5Strategy.remote", "fluid.uploader.tests"], {
            funcName: "fluid.uploader.html5Strategy.createMockXHR"
        });    
        
        var clearFileQueue = function (uploader) {
            uploader.queue.files = [];
        };
        
        var checkSingleFileUploader = function (uploader) {
            jqUnit.assertEquals("The single-file uploader is in fact the single-file version", 
                                "fluid.uploader.singleFileUploader", uploader.typeName);
        };
        
        var checkMultiFileUploaderOptions = function (uploader, expectedStrategy) {
            jqUnit.assertEquals("The uploader is configured with the correct strategy", expectedStrategy, uploader.strategy.typeName);            
            jqUnit.assertTrue("The uploader strategy contains a local component", uploader.strategy.local);
            jqUnit.assertTrue("The uploader contains a remote component", uploader.strategy.remote);
            jqUnit.assertTrue("The uploader has a container", uploader.container);
            jqUnit.assertEquals("The uploader container has the correct selector", ".flc-uploader", uploader.container.selector);            
            jqUnit.assertTrue("The uploader has a fileQueueView", uploader.fileQueueView);
            jqUnit.assertTrue("The fileQueueView has a scroller component", uploader.fileQueueView.scroller);
            jqUnit.assertTrue("The fileQueueView has an eventBinder component", uploader.fileQueueView.eventBinder);            
            jqUnit.assertTrue("The fileQueueView's container is the file queue", uploader.fileQueueView.container.hasClass("fl-uploader-queue"));
            jqUnit.assertTrue("The uploader has a total progress component", uploader.totalProgress);
            jqUnit.assertTrue("The total progress component has a progressBar", uploader.totalProgress.progressBar);
            jqUnit.assertTrue("The uploader has all the events", uploader.events);
            jqUnit.assertTrue("The uploader has a file queue", uploader.queue);
            jqUnit.assertTrue("The uploader must have queueSettings", uploader.options.queueSettings);
            jqUnit.assertTrue("The uploader must have an argument map in its options", uploader.options.argumentMap);
        };
        
        fluid.uploader.html5Strategy.createMockXHR = function () {
            var xhr = {
                readyState: 4, 
                status: 200,
                responseText: "",
                upload: function() {},
                send: function() {},
                sendAsBinary: function() {},
                open: function () {},
                setRequestHeader: function () {}
            };    
            return xhr;
        };
        
        var checkRemoteFileHandler = function (uploader) {
            var xhrStatus = [200, 0, 100];
            var fileStatus = [fluid.uploader.fileStatusConstants.COMPLETE,
                              fluid.uploader.fileStatusConstants.CANCELLED,
                             fluid.uploader.fileStatusConstants.ERROR];
            
            for (var i = 0; i < xhrStatus.length; i++) {
                addFiles(uploader);
                uploader.queue.setupCurrentBatch();
                var file = uploader.queue.getReadyFiles()[0]; 
                var xhr = fluid.uploader.html5Strategy.monitorFileUploadXHR(
                        file , uploader.events, createXHR(xhrStatus[i]));
                xhr.onreadystatechange();
                jqUnit.assertEquals("The file status is updated", fileStatus[i], file1.filestatus);

                // Clear the queue for the next test
                clearFileQueue(uploader);
            }
        };
        
        var checkBrowseButtonIsEnabled = function (uploader) {
            var browseButton = uploader.locate("browseButton");
            jqUnit.assertFalse("The browse button is enabled", browseButton.attr("disabled"));
        };
        
        var checkBrowseButtonIsDisabled = function (uploader) {
            var browseButton = uploader.locate("browseButton");
            jqUnit.assertTrue("The browse button is disabled", browseButton.attr("disabled"));
        };
        
        var checkUploadButtonIsEnabled = function (uploader) {
            var uploadButton = uploader.locate("uploadButton");
            jqUnit.assertFalse("The upload button is enabled", uploadButton.attr("disabled"));
        };
        
        var checkUploadButtonIsDisabled = function (uploader) {
            var uploadButton = uploader.locate("uploadButton");
            jqUnit.assertTrue("The upload button is enabled", uploadButton.attr("disabled"));
        };                
        
        var checkUploaderArgumentMap = function (uploader, expectedLocal, expectedRemote) {
            jqUnit.assertEquals("Check local component argumentMap options value", 
                    expectedLocal, uploader.strategy.local.options.argumentMap.options);
            jqUnit.assertEquals("Check remote component argumentMap options value", 
                    expectedRemote, uploader.strategy.remote.options.argumentMap.options);            
        };
        
        var checkHTML5Uploader = function (uploader) {
            var statusRegion = $(".flc-uploader-status-region");
            var initialStatusRegionText = statusRegion.text();
            
            checkBrowseButtonIsEnabled(uploader);
            checkUploadButtonIsDisabled(uploader);
            
            // add files, check status region update
            var browseButtonView = uploader.strategy.local.browseButtonView;
            var files = [file1, file2];
            browseButtonView.events.onFilesQueued.fire(files);
            
            jqUnit.assertEquals("Files are added after the file dialog", 
                                2, uploader.queue.files.length);
            jqUnit.assertNotEquals("Add files: update status region text",
                    initialStatusRegionText, statusRegion.text());     
            
            checkUploadButtonIsEnabled(uploader);
            
            // delete file, check status region update            
            var addFilesStatusRegionText = statusRegion.text();
            var fileQueueView = uploader.fileQueueView;
            var row = fileQueueView.locate("fileRows");
            fileQueueView.locate("fileIconBtn", row[0]).click();
            
            jqUnit.assertEquals("File deleted from the queue", 
                    1, uploader.queue.files.length);
            jqUnit.assertNotEquals("Remove file: update status region text",
                    addFilesStatusRegionText, statusRegion.text());    
            
            // upload files, check status region update
            var removeFileStatusRegionText = statusRegion.text();
            
            // Will need to mock XHR to allow the ability to send files to a remote server
            // in 2 ways: 1) sendAsBinary(), 2) send(formData)
            uploader.locate("uploadButton").click();
            
            checkBrowseButtonIsDisabled(uploader);
            
            jqUnit.assertNotEquals("Upload complete:  update status region text", 
                    removeFileStatusRegionText, statusRegion.text());
            
        };
        
        uploaderTests.test("Single-file Uploader is instantiated", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.uploader.singleFile");
            var container = $(".flc-uploader");
            var that = fluid.uploader(container);
            checkSingleFileUploader(that);
        });
        
        uploaderTests.test("HTML5 uploader is instantiated", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.browser.supportsBinaryXHR");
            var container = $(".flc-uploader");
            var that = fluid.uploader(container);
            checkMultiFileUploaderOptions(that, "fluid.uploader.html5Strategy");
            checkUploaderArgumentMap(that, 2, 1);
            checkHTML5Uploader(that);
        });        
        
        uploaderTests.test("Flash uploader is instantiated", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.browser.supportsFlash");
            var container = $(".flc-uploader");
            var that = fluid.uploader(container);
            checkMultiFileUploaderOptions(that, "fluid.uploader.swfUploadStrategy");            
            checkUploaderArgumentMap(that, 0, 0);
        });    

        uploaderTests.test("Single-file Uploader as a subcomponent", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.uploader.singleFile");
            var that = fluid.uploader.parent();
            checkSingleFileUploader(that.uploader);
        });
        
        uploaderTests.test("HTML5 uploader as a subcomponent", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.browser.supportsBinaryXHR");
            var that = fluid.uploader.parent();
            checkMultiFileUploaderOptions(that.uploader, "fluid.uploader.html5Strategy");
            checkUploaderArgumentMap(that.uploader, 2, 1);
        });
        
        uploaderTests.test("Flash uploader as a subcomponent", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.browser.supportsFlash");
            var that = fluid.uploader.parent();
            checkMultiFileUploaderOptions(that.uploader, "fluid.uploader.swfUploadStrategy");
            checkUploaderArgumentMap(that.uploader, 0, 0);
        });  

        uploaderTests.test("Single-file Uploader as a subcomponent with external demands", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.uploader.singleFile");
            var that = fluid.uploader.parent.loadDemands();
            checkSingleFileUploader(that.uploader);
        });
        
        uploaderTests.test("HTML5 uploader as a subcomponent with external demands", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.browser.supportsBinaryXHR");
            var that = fluid.uploader.parent.loadDemands();
            checkMultiFileUploaderOptions(that.uploader, "fluid.uploader.html5Strategy");
            checkUploaderArgumentMap(that.uploader, 2, 1);
        }); 
        
        uploaderTests.test("Flash uploader as a subcomponent with external demands", function () {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag("fluid.browser.supportsFlash");
            var that = fluid.uploader.parent.loadDemands();
            checkMultiFileUploaderOptions(that.uploader, "fluid.uploader.swfUploadStrategy");
            checkUploaderArgumentMap(that.uploader, 0, 0);
        });           
    });
})(jQuery);
