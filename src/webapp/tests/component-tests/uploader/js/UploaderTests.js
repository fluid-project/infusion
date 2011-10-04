/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010-2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

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
  
    $(document).ready(function () {
        var uploaderTests = new jqUnit.TestCase("Uploader Basic Tests");

        fluid.staticEnvironment.uploader = fluid.typeTag("fluid.uploader.tests");
        
        var container = ".flc-uploader";
        
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
        
        var fileerror = {
            id: "fileerror",
            size: 10, 
            error: true,
            getAsBinary: function () {}
        };
        
        fluid.registerNamespace("fluid.tests.uploader");
        
        fluid.tests.uploader.noIoC = function (options) {
            var that = fluid.uploader(".flc-uploader", options);
            return that;
        };
        
        /*
         * Instantiate an uploader as a subcomponent 
         */
        fluid.tests.uploader.parent = function (options) {
            var that = fluid.initLittleComponent("fluid.tests.uploader.parent", options);
            fluid.initDependents(that);
            return that.uploader;
        };
        
        /*
         * Instantiate an uploader as a subcomponent with external demands
         */
        fluid.tests.uploader.parent.loadDemands = function (options) {
            var that = fluid.initLittleComponent("fluid.tests.uploader.parent.loadDemands", options);
            fluid.initDependents(that);
            return that.uploader;
        };        
        
        fluid.defaults("fluid.tests.uploader.parent", {
            gradeNames: ["fluid.littleComponent"],
            components: {
                uploader: {
                    type: "fluid.uploader",
                    container: ".flc-uploader"
                }
            }
        });
        
        fluid.defaults("fluid.tests.uploader.parent.loadDemands", {
            gradeNames: ["fluid.littleComponent"],
            components: {
                uploader: {
                    type: "fluid.uploader"
                }
            }
        });
        
        fluid.demands("fluid.uploader", ["fluid.tests.uploader.parent", "fluid.tests.demoRemote"], {
            options: {
                demo: true
            }     
        });
        
        // Beat the above demands block since demands resolution is still broken in 1.4
        fluid.demands("fluid.uploader", ["fluid.tests.uploader.parent"], { });
        
        fluid.demands("fluid.uploader", "fluid.tests.uploader.parent.loadDemands", {
            container: ".flc-uploader"
        });             
                
        fluid.demands("fluid.uploader", ["fluid.tests.uploader.parent.loadDemands", "fluid.tests.demoRemote"], {
            container: ".flc-uploader",
            options: {
                demo: true
            }            
        });        
        
        fluid.demands("fluid.uploader.html5Strategy.createXHR", ["fluid.uploader.html5Strategy.remote", "fluid.uploader.tests"], {
            funcName: "fluid.tests.uploader.createMockXHR",
            args: ["{multiFileUploader}.uploaderTestSet"]
        });
        
        
        /*
         * Override the HTML5 FormData creators with mocks so we can verify the correct behaviour.
         * FF4 restricts passing JSON objects as the value in the FormData append() function.
         */
        fluid.demands("fluid.uploader.html5Strategy.createFormData", [
            "fluid.uploader.html5Strategy.remote", 
            "fluid.browser.supportsFormData",
            "fluid.uploader.tests"
        ], {
            funcName: "fluid.tests.uploader.mockFormData"
        });
        
        var addFiles = function (uploader, fileset) {
            var browseButtonView = uploader.strategy.local.browseButtonView;
            browseButtonView.events.onFilesQueued.fire(fileset);            
        };
        
        // Mock the SWF effects of adding files 
        var addFilesSWF = function (uploader, fileset) {
            fluid.each(fileset, function (file) {
                file.filestatus = fluid.uploader.fileStatusConstants.QUEUED;
                uploader.events.afterFileQueued.fire(file);
            });
            uploader.events.afterFileDialog.fire(uploader.queue.files.length);
        };        
        
        // Mock the swfUploadStrategy local 
        var mockSWFUploadLocal = function (local) {
            local.browse = fluid.identity;
            local.removeFile = fluid.identity;
            local.enableBrowseButton = fluid.identity;
            local.disableBrowseButton = fluid.identity;
        };        

        var createXHR = function (status) {
            var xhr = {
                readyState: 4, 
                status: status,
                responseText: "",
                upload: function () {},
                send: function () {},
                sendAsBinary: function () {},
                open: function () {},
                setRequestHeader: function () {},
                abort: function () {}
            };    
            return xhr;
        };
        
        /*
         * Override the component's actual XHR creator function
         * TODO:  A true XHR mock will need to be instantiated here with capabilities
         *        of firing random progress events and send files to a remote server
         *        in 2 ways: 1) sendAsBinary, 2) send(formData)   
         */
        fluid.tests.uploader.createMockXHR = function (testset) {
            var xhr = createXHR(200);
            testset.xhr = xhr;
            return xhr;
        };

        var checkRemoteFileHandler = function (uploader, fileset) {
            var xhrStatus = [200, 0, 100];
            var fileStatus = [
                fluid.uploader.fileStatusConstants.COMPLETE,
                fluid.uploader.fileStatusConstants.CANCELLED,
                fluid.uploader.fileStatusConstants.ERROR
            ];
            
            for (var i = 0; i < xhrStatus.length; i++) {
                addFiles(uploader, fileset);
                var file = uploader.queue.getReadyFiles()[0]; 
                var xhr = createXHR(xhrStatus[i]);
                fluid.uploader.html5Strategy.monitorFileUploadXHR(file, uploader.events, xhr);
                xhr.onreadystatechange();
                jqUnit.assertEquals("The file status is updated", fileStatus[i], file.filestatus);

                // Clear the queue for the next test
                uploader.queue.files = [];
            }
        };        
        
        var checkSingleFileUploader = function (uploader, fileset) {
            // TODO: probably not possible to test error behaviour for single-file?
            jqUnit.assertEquals("The single-file uploader is in fact the single-file version", 
                                "fluid.uploader.singleFileUploader", uploader.typeName);
            start();
        };
        
        var checkMultiFileUploaderOptions = function (uploader, expectedStrategy) {
            jqUnit.assertEquals("The uploader is configured with the correct strategy", expectedStrategy, uploader.strategy.typeName);            
            jqUnit.assertTrue("The uploader strategy contains a local component", uploader.strategy.local);
            jqUnit.assertTrue("The uploader contains a remote component", uploader.strategy.remote);
            jqUnit.assertTrue("The uploader has a container", uploader.container);
            jqUnit.assertEquals("The uploader container has the correct selector", container, uploader.container.selector);            
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
        
        var checkUploaderButton = function (uploader, buttonName, state) {
            var button = uploader.locate(buttonName);
            jqUnit.assertEquals("The " + buttonName + " is " + (state ? "enabled" : "disabled"), state, !button.prop("disabled"));
        };
        
        var checkUploaderArgumentMap = function (uploader, expectedLocal, expectedRemote) {
            jqUnit.assertEquals("Check local component argumentMap options value", 
                                expectedLocal, uploader.strategy.local.options.argumentMap.options);
            jqUnit.assertEquals("Check remote component argumentMap options value", 
                                expectedRemote, uploader.strategy.remote.options.argumentMap.options);            
        };
        
        fluid.tests.uploader.removeUploadPause = function (uploader, statusRegion, testset) {
            // remove file, check status region update            
            var addFilesStatusRegionText = statusRegion.text();
            var fileQueueView = uploader.fileQueueView;
            var row = fileQueueView.locate("fileRows");
            fileQueueView.locate("fileIconBtn", row[0]).click();
            
            jqUnit.assertEquals("File deleted from the queue", 
                                1, uploader.queue.files.length);
            jqUnit.assertNotEquals("Remove file: update status region text",
                                addFilesStatusRegionText, statusRegion.text());    
            
            // upload files
            uploader.locate("uploadButton").click();
            checkUploaderButton(uploader, "browseButton", false);
            jqUnit.assertTrue("Uploading has started", uploader.queue.isUploading);
            
            // stop uploading files
            uploader.locate("pauseButton").click();
            checkUploaderButton(uploader, "uploadButton", true);
            jqUnit.assertFalse("Uploading has stopped", uploader.queue.isUploading);
            
            if (testset.integrationKey === "HTML5") {
            // This pretty bizarre test was rescued from higher level checkHTML5Integration - it just barely tests SOMETHING,
            // although it does so in a way exercising impossible logic and doing some violence to the
            // component's consistency. We need more realistic test sequences that actually exercise
            // possible histories of the component - this is an integration test after all
                checkRemoteFileHandler(uploader, testset.files);
            }       
        };
        
        fluid.tests.uploader.uploadError = function (uploader, statusRegion, testset) {
                        // upload files
            uploader.locate("uploadButton").click();
            checkUploaderButton(uploader, "browseButton", false);
            jqUnit.assertTrue("Uploading has started", uploader.queue.isUploading);
            var uploadComplete = false;
            var uploadCompleteListener = function () {
                uploadComplete = true;
            };
            if (testset.integrationKey === "HTML5") {
                testset.xhr.status = 100;
                uploader.events.afterUploadComplete.addListener(uploadCompleteListener);
                testset.xhr.onreadystatechange();
                jqUnit.assertTrue("Upload complete after single file error", uploadComplete);

                var button = uploader.strategy.local.browseButtonView;
                var enabled = button.isEnabled();
                jqUnit.assertTrue("Browse button enabled after single file error (FLUID-4443)", enabled);
            }
        };
        
        var checkUploaderIntegration = function (uploader, addFilesFn, testset) {
            var statusRegion = $(".flc-uploader-status-region");
            var initialStatusRegionText = statusRegion.text();
            
            checkUploaderButton(uploader, "browseButton", true);
            checkUploaderButton(uploader, "uploadButton", false);
            
            // add files, check status region update
            addFilesFn(uploader, testset.files);
            
            checkUploaderButton(uploader, "uploadButton", true);
            jqUnit.assertEquals("Files are added after the file dialog", 
                                testset.files.length, uploader.queue.files.length);
            jqUnit.assertNotEquals("Add files: update status region text",
                                   initialStatusRegionText, statusRegion.text());
            
            testset.testLoad(uploader, statusRegion, testset);
        };
        
        var checkFlashIntegration = function (uploader, testset) {
            checkMultiFileUploaderOptions(uploader, "fluid.uploader.swfUploadStrategy");            
            checkUploaderArgumentMap(uploader, 0, 1);
            mockSWFUploadLocal(uploader.strategy.local);
            checkUploaderIntegration(uploader, addFilesSWF, testset);
            start();
        };
        
        var checkHTML5Integration = function (uploader, testset) {
            checkMultiFileUploaderOptions(uploader, "fluid.uploader.html5Strategy");
            checkUploaderArgumentMap(uploader, 2, 1);
            checkUploaderIntegration(uploader, addFiles, testset);
            start();
        };        
        
        var configurations = [
            {
                label: "Uploader with direct creator function",
                type: fluid.tests.uploader.noIoC
            }, {
                label: "Uploader in an IoC tree",
                type: fluid.tests.uploader.parent
            },  {
                label: "Uploader in an IoC tree with demands",
                type: fluid.tests.uploader.parent.loadDemands
            }
        ];
        
        var testsets = {
            standard: {
                files: [file1, file2],
                testLoad: fluid.tests.uploader.removeUploadPause
            },
            error: { 
                files: [fileerror],
                testLoad: fluid.tests.uploader.uploadError
            }
        };
        
        var integrations = [
            {   
                key: "single",
                label: "Single-file integration tests",
                supportsBinaryXHR: {
                    type: "typeTag",
                    typeName: "fluid.uploader.singleFile"
                },          
                test: checkSingleFileUploader,
                demo: false
            },                
            {   
                key: "HTML5",
                label: "HTML5 integration tests",
                supportsBinaryXHR: {
                    type: "typeTag",
                    typeName: "fluid.browser.supportsBinaryXHR"
                },
                uploaderConfig: {
                    type: "progressiveCheckerForComponent",
                    componentName: "fluid.uploader"
                },
                test: checkHTML5Integration,
                demo: false
            },
            {   
                key: "Flash",
                label: "Flash integration tests",
                supportsBinaryXHR: {
                    type: "typeTag",
                    typeName: "fluid.browser.supportsFlash"
                },
                demoRemote: {
                    type: "typeTag",
                    typeName: "fluid.tests.demoRemote"
                },
                uploaderConfig: {
                    type: "progressiveCheckerForComponent",
                    componentName: "fluid.uploader"
                },
                test: checkFlashIntegration,
                demo: true
            }
        ];
                            
        var setStaticEnvironment = function (integration) {
            fluid.staticEnvironment.supportsBinaryXHR = fluid.typeTag(integration.supportsBinaryXHR.typeName);
            
            if (integration.uploaderConfig) {
                fluid.staticEnvironment.uploaderConfig = fluid.progressiveCheckerForComponent({
                    componentName: integration.uploaderConfig.componentName
                });
            }
            if (integration.demoRemote) {
                fluid.staticEnvironment.demo = fluid.typeTag(integration.demoRemote.typeName);
            }
        };
        
        var constructUploader = function (configuration, integration) {
            var that = configuration.type({
                demo: integration.demo
            });
            return that;
        };
        
        var cleanupEnvironment = function () {
            delete fluid.staticEnvironment.supportsBinaryXHR;
            delete fluid.staticEnvironment.uploaderConfig;
            delete fluid.staticEnvironment.demo;            
        };
        
        // Set up and run the integration tests for a specified configuration
        var setupIntegration = function (configuration, integration, testset) {
            try {
                setStaticEnvironment(integration);
                var that = constructUploader(configuration, integration);
                // We stash this here on the uploader so that it is easier to access via IoC and other parts of
                // the infrastructure - a better design would have "IoC test cases"
                that.uploaderTestSet = testset;
                integration.test(that, testset);
            } finally {
                cleanupEnvironment();
            }
        };
        
        // Run the integration tests individually to reset the markup
        fluid.each(testsets, function (testset, testsetkey) {
            fluid.each(configurations, function (config) {
                fluid.each(integrations, function (integration) {
                    var testsetLive = fluid.copy(testset);
                    testsetLive.integrationKey = integration.key;
                    uploaderTests.asyncTest(config.label + " - " + integration.label
                        + " - " + testsetkey + " testset", function () {
                            setupIntegration(config, integration, testsetLive);
                        });
                });
            });
        });
    });
})(jQuery);
