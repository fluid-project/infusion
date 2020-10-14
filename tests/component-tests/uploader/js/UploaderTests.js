/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(function () {
        jqUnit.module("Uploader Basic Tests");

        fluid.contextAware.forgetChecks(["fluid.browser.supportsFormData", "fluid.browser.supportsBinaryXHR"]);

        fluid.contextAware.makeChecks({
            "fluid.tests.uploader": true,
            "fluid.browser.supportsFormData": true
        });

        /**************************
         * formatFileSize() tests *
         **************************/

        jqUnit.test("formatFileSize()", function () {
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
        });

        /*************************
         * derivePercent() tests *
         *************************/

        jqUnit.test("derivePercent()", function () {
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

            // change total to odd number to test rounding
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
            testPercentage(Math.pow(2, 1024), Infinity);
            total = Math.pow(2, 1024);
            testPercentage(0, 0);
            jqUnit.assertTrue(total + "/" + total + " is not a number",
                            isNaN(fluid.uploader.derivePercent(total / total)));
        });

        /*************************************************************
         * Uploader Integration Tests                                *
         *                                                           *
         * Tests single-file and HTML5 uploader strategies.    *
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

        fluid.tests.uploader.container = ".flc-uploader";

        fluid.tests.uploader.noIoC = function (options) {
            var that = fluid.uploader(fluid.tests.uploader.container, options);
            return that;
        };

        /*
         * Instantiate an uploader as a subcomponent
         */
        fluid.tests.uploader.parent = function (options) {
            var that = fluid.tests.uploader.parentWrapper(options);
            return that.uploader;
        };

        fluid.defaults("fluid.tests.uploader.parentWrapper", {
            gradeNames: ["fluid.component"],
            components: {
                uploader: {
                    type: "fluid.uploader",
                    container: fluid.tests.uploader.container
                }
            }
        });

        fluid.defaults("fluid.tests.uploader.mockHtml5", {
            distributeOptions: [{
                target: "{that fluid.uploader.remote}.options.invokers.createXHR",
                record: {
                    funcName: "fluid.tests.uploader.createMockXHR",
                    args: ["{uploader}.uploaderTestSet"]
                }
            }, {
                target: "{that fluid.uploader.html5Strategy.formDataSender}.options.invokers.createFormData",
                record: {
                    funcName: "fluid.tests.uploader.mockFormData"
                }
            }]
        });

        fluid.contextAware.makeAdaptation({
            distributionName: "fluid.tests.uploader.mockHtml5Distribution",
            targetName: "fluid.uploader",
            adaptationName: "test",
            checkName: "test",
            record: {
                contextValue: "{fluid.tests.uploader}",
                gradeNames: "fluid.tests.uploader.mockHtml5"
            }
        });

        var addFiles = function (uploader, fileset) {
            var browseButtonView = uploader.strategy.local.browseButtonView;
            browseButtonView.events.onFilesQueued.fire(fileset);
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

        fluid.tests.uploader.checkRemoteFileHandler = function (uploader, fileset) {
            var status = {
                200: fluid.uploader.fileStatusConstants.COMPLETE,
                201: fluid.uploader.fileStatusConstants.COMPLETE,
                202: fluid.uploader.fileStatusConstants.COMPLETE,
                203: fluid.uploader.fileStatusConstants.COMPLETE,
                204: fluid.uploader.fileStatusConstants.COMPLETE,
                0: fluid.uploader.fileStatusConstants.CANCELLED,
                100: fluid.uploader.fileStatusConstants.ERROR,
                205: fluid.uploader.fileStatusConstants.ERROR,
                301: fluid.uploader.fileStatusConstants.ERROR,
                404: fluid.uploader.fileStatusConstants.ERROR
            };

            for (var httpStatus in status) {
                addFiles(uploader, fileset);
                var file = uploader.queue.getReadyFiles()[0];
                var xhr = createXHR(parseInt(httpStatus, 10));
                fluid.uploader.html5Strategy.monitorFileUploadXHR(file, uploader.events, xhr);
                xhr.onreadystatechange();
                jqUnit.assertEquals("The file status is updated", status[httpStatus], file.filestatus);

                // Clear the queue for the next test
                uploader.queue.files = [];
            }
        };

        fluid.tests.uploader.checkSingleFileUploader = function (uploader) {
            // TODO: probably not possible to test error behaviour for single-file?
            jqUnit.assertTrue("The single-file uploader is in fact the single-file version",
                                fluid.componentHasGrade(uploader, "fluid.uploader.singleFile"));
            jqUnit.start();
        };

        fluid.tests.uploader.checkMultiFileUploaderOptions = function (uploader, expectedStrategy) {
            jqUnit.assertEquals("The uploader is configured with the correct strategy", expectedStrategy, uploader.strategy.typeName);
            jqUnit.assertTrue("The uploader strategy contains a local component", uploader.strategy.local);
            jqUnit.assertTrue("The uploader contains a remote component", uploader.strategy.remote);
            jqUnit.assertTrue("The uploader has a container", uploader.container);
            jqUnit.assertEquals("The uploader container has the correct selector", fluid.tests.uploader.container, uploader.container.selector);
            jqUnit.assertTrue("The uploader has a fileQueueView", uploader.fileQueueView);
            jqUnit.assertTrue("The fileQueueView has a scroller component", uploader.fileQueueView.scroller);
            jqUnit.assertTrue("The fileQueueView's container is the file queue", uploader.fileQueueView.container.hasClass("fl-uploader-queue"));
            jqUnit.assertTrue("The uploader has a total progress component", uploader.totalProgress);
            jqUnit.assertTrue("The total progress component has a progressBar", uploader.totalProgress.progressBar);
            jqUnit.assertTrue("The uploader has all the events", uploader.events);
            jqUnit.assertTrue("The uploader has a file queue", uploader.queue);
            jqUnit.assertTrue("The uploader must have queueSettings", uploader.options.queueSettings);
            jqUnit.assertTrue("The uploader must have an argument map in its options", uploader.options.argumentMap);

            // aria related tests
            var statusID = uploader.totalFileStatusTextId;
            var statusArea = uploader.locate("totalFileStatusText");
            var fileQueue = uploader.locate("fileQueue");
            jqUnit.assertEquals("The status area has an id set", statusID, statusArea.attr("id"));
            jqUnit.assertEquals("The status area has the correct aria role", "log", statusArea.attr("role"));
            jqUnit.assertEquals("The status area has the correct value for aria-live", "assertive", statusArea.attr("aria-live"));
            jqUnit.assertEquals("The status area has the correct value for aria-relevant", "text", statusArea.attr("aria-relevant"));
            jqUnit.assertEquals("The status area has the correct value for aria-atomic", "true", statusArea.attr("aria-atomic"));
            jqUnit.assertEquals("The file queue controls the status", statusID, fileQueue.attr("aria-controls"));
            jqUnit.assertEquals("The file queue is labelled by the status", statusID, fileQueue.attr("aria-labelledby"));

        };

        fluid.tests.uploader.checkUploaderButton = function (uploader, buttonName, state) {
            var button = uploader.locate(buttonName);
            jqUnit.assertEquals("The " + buttonName + " is " + (state ? "enabled" : "disabled"), state, !button.prop("disabled"));
        };

        fluid.tests.uploader.removeUploadPause = function (uploader, statusRegion, testset) {
            // remove file, check status region update
            var addFilesStatusRegionText = statusRegion.text();
            var fileQueueView = uploader.fileQueueView;
            var row = fileQueueView.locate("fileRows");
            fileQueueView.locate("fileIconBtn", row[0]).trigger("click");

            jqUnit.assertEquals("File deleted from the queue",
                                1, uploader.queue.files.length);
            jqUnit.assertNotEquals("Remove file: update status region text",
                                addFilesStatusRegionText, statusRegion.text());

            // upload files
            uploader.locate("uploadButton").trigger("click");
            fluid.tests.uploader.checkUploaderButton(uploader, "browseButton", false);
            jqUnit.assertTrue("Uploading has started", uploader.queue.isUploading);

            // stop uploading files
            uploader.locate("pauseButton").trigger("click");
            fluid.tests.uploader.checkUploaderButton(uploader, "uploadButton", true);
            jqUnit.assertFalse("Uploading has stopped", uploader.queue.isUploading);

            if (testset.integrationKey === "HTML5") {
            // This pretty bizarre test was rescued from higher level checkHTML5Integration - it just barely tests SOMETHING,
            // although it does so in a way exercising impossible logic and doing some violence to the
            // component's consistency. We need more realistic test sequences that actually exercise
            // possible histories of the component - this is an integration test after all
                fluid.tests.uploader.checkRemoteFileHandler(uploader, testset.files);
            }
        };

        fluid.tests.uploader.uploadError = function (uploader, statusRegion, testset) {
                        // upload files
            uploader.locate("uploadButton").trigger("click");
            fluid.tests.uploader.checkUploaderButton(uploader, "browseButton", false);
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

        fluid.tests.uploader.checkUploaderIntegration = function (uploader, addFilesFn, testset) {
            var statusRegion = $(".flc-uploader-total-progress-text");
            var initialStatusRegionText = statusRegion.text();

            fluid.tests.uploader.checkUploaderButton(uploader, "browseButton", true);
            fluid.tests.uploader.checkUploaderButton(uploader, "uploadButton", false);

            // add files, check status region update
            addFilesFn(uploader, testset.files);

            fluid.tests.uploader.checkUploaderButton(uploader, "uploadButton", true);
            jqUnit.assertEquals("Files are added after the file dialog",
                                testset.files.length, uploader.queue.files.length);
            jqUnit.assertNotEquals("Add files: update status region text",
                                   initialStatusRegionText, statusRegion.text());

            testset.testLoad(uploader, statusRegion, testset);
        };

        fluid.tests.uploader.checkHTML5Integration = function (uploader, testset) {
            fluid.tests.uploader.checkMultiFileUploaderOptions(uploader, "fluid.uploader.html5Strategy");
            fluid.tests.uploader.checkUploaderIntegration(uploader, addFiles, testset);
            jqUnit.start();
        };

        fluid.tests.uploader.configurations = [
            {
                label: "Uploader with direct creator function",
                type: fluid.tests.uploader.noIoC
            }, {
                label: "Uploader in an IoC tree",
                type: fluid.tests.uploader.parent
            }
        ];

        fluid.tests.uploader.testsets = {
            standard: {
                files: [file1, file2],
                testLoad: fluid.tests.uploader.removeUploadPause
            },
            error: {
                files: [fileerror],
                testLoad: fluid.tests.uploader.uploadError
            }
        };

        fluid.tests.uploader.integrations = [
            {
                key: "single",
                label: "Single-file integration tests",
                test: fluid.tests.uploader.checkSingleFileUploader,
                demo: false
            },
            {
                key: "HTML5",
                label: "HTML5 integration tests",
                contextTag: "fluid.browser.supportsBinaryXHR",
                test: fluid.tests.uploader.checkHTML5Integration,
                demo: false
            }
        ]; // TODO: We seem to have lost all the configurations which check with demoRemote

        fluid.tests.uploader.setContext = function (integration) {
            var contexts = fluid.makeArray(integration.contextTag);
            fluid.contextAware.makeChecks(fluid.arrayToHash(contexts));
        };

        fluid.tests.uploader.constructUploader = function (configuration, integration) {
            var that = configuration.type({
                demo: integration.demo
            });
            return that;
        };

        fluid.tests.uploader.cleanupContext = function (integration) {
            fluid.contextAware.forgetChecks(fluid.makeArray(integration.contextTag));
        };

        // Set up and run the integration tests for a specified configuration
        fluid.tests.uploader.setupIntegration = function (configuration, integration, testset) {
            try {
                fluid.tests.uploader.setContext(integration);
                var that = fluid.tests.uploader.constructUploader(configuration, integration);
                // We stash this here on the uploader so that it is easier to access via IoC and other parts of
                // the infrastructure - a better design would have "IoC test cases" (now FLUID-4850)
                that.uploaderTestSet = testset;
                integration.test(that, testset);
            } finally {
                fluid.tests.uploader.cleanupContext(integration);
            }
        };

        // Run the integration tests individually to reset the markup
        fluid.each(fluid.tests.uploader.testsets, function (testset, testsetkey) {
            fluid.each(fluid.tests.uploader.configurations, function (config) {
                fluid.each(fluid.tests.uploader.integrations, function (integration) {
                    var testsetLive = fluid.copy(testset);
                    testsetLive.integrationKey = integration.key;
                    jqUnit.asyncTest(config.label + " - " + integration.label +
                        " - " + testsetkey + " testset", function () {
                        fluid.tests.uploader.setupIntegration(config, integration, testsetLive);
                    });
                });
            });
        });
    });
})(jQuery);
