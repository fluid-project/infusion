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

    $(document).ready(function () {

        // Only run tests in browsers that support HTML5 upload
        if (!window.FormData) {
            jqUnit.test("No Tests Run", function () {
                // have to run a dummy test to prevent a false failure report when running allTest.html
                jqUnit.assert("This browser does not support HTML5 upload");
            });
        } else {
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
                                invokers: {
                                    enableBrowseButton: null,
                                    disableBrowseButton: null
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
                file3 = fluid.tests.uploader.html5.mockFile("file3", "bigfile.rar", "application/x-rar-compressed", 200000),
                file4 = fluid.tests.uploader.html5.mockFile("file4", "justOver1KB.jpg", "image/jpeg", 1025),
                file5 = fluid.tests.uploader.html5.mockFile("file5", "exact1KB.jpg", "image/jpeg", 1024);


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

            fluid.defaults("fluid.tests.uploader.HTML5.browseTree", {
                //markupFixture: "#iocBrowseButtonContainer",
                gradeNames: ["fluid.test.testEnvironment"],
                components: {
                    browseButtonView: {
                        type: "fluid.uploader.html5Strategy.browseButtonView",
                        container: "#iocBrowseButtonContainer",
                        options: {
                            queueSettings: {
                                fileTypes: []
                            }
                        }
                    },
                    fixtures: {
                        type: "fluid.tests.uploader.HTML5.browseTreeFixtures"
                    }
                }
            });

            fluid.defaults("fluid.tests.uploader.HTML5.browseTreeFixtures", {
                gradeNames: ["fluid.test.testCaseHolder"],
                modules: [ {
                    name: "Browse button tests",
                    tests: [{
                        name: "Focus sequence",
                        sequence: [ {
                            func: "fluid.tests.uploader.HTML5.initial",
                            args: ["{browseButtonView}"]
                        }, {
                            func: "fluid.tests.uploader.HTML5.focusInput",
                            args: ["{browseButtonView}", 1, true]
                        }, {
                            listener: "fluid.tests.uploader.HTML5.checkFocused",
                            event: "{browseButtonView}.events.onFocusFileInput"
                        }, {
                            func: "fluid.tests.uploader.HTML5.focusInput",
                            args: ["{browseButtonView}", 1, false]
                        }, {
                            listener: "fluid.tests.uploader.HTML5.checkFocused",
                            event: "{browseButtonView}.events.onFocusFileInput"
                        }]
                    }]
                }]
            });

            fluid.tests.uploader.HTML5.focusInput = function (browseButtonView, index, focus) {
                var inputs = browseButtonView.browseButton.children();
                var input = inputs.eq(index);
                window.setTimeout(function () {
                    if (focus) {
                        input[0].focus();
                    } else { // a Firefox bug makes a direct "blur" on the element itself ineffective at transferring focus away
                        $("#focusTarget").trigger("focus");
                    }
                }, 100); // This delay is necessary on Firefox since there seems an initial "refractory period" on load where the upload control will not accept focus
            };

            fluid.tests.uploader.HTML5.checkFocused = function (browseButtonView, fileInput, isFocus) {
                var browseButton = browseButtonView.browseButton;
                var message = isFocus ? "On focus, the browseButton input has the focus class" : "On blur, the browseButton no longer has the focus class";
                jqUnit.assertEquals(message, isFocus, browseButton.hasClass("focus"));
            };

            fluid.tests.uploader.HTML5.initial = function (browseButtonView) {
                var browseButton = $("#iocBrowseButton");

                var inputs = browseButton.children();
                var firstInput = inputs.eq(0);
                jqUnit.assertEquals("There should be one multi-file input element at the start", 1, inputs.length);
                jqUnit.assertEquals("The multi-file input element should be visible and in the tab order to start",
                    0, firstInput.prop("tabindex"));
                jqUnit.assertEquals("The aria-lable for the initial multi-file input should be set", browseButtonView.options.strings.browse, firstInput.attr("aria-label"));

                browseButtonView.renderFreshMultiFileInput();
                inputs = browseButton.children();
                firstInput = inputs.eq(0);
                var secondInput = inputs.eq(1);
                jqUnit.assertEquals("After the first batch of files have processed, there should now be two multi-file input elements",
                    2, inputs.length);
                jqUnit.assertEquals("The original multi-file input element should be removed from the tab order",
                    -1, firstInput.prop("tabindex"));
                jqUnit.assertEquals("The second multi-file input element should be visible and in the tab order",
                    0, secondInput.prop("tabindex"));
                jqUnit.assertEquals("The aria-lable for the second multi-file input should be set", browseButtonView.options.strings.addMore, secondInput.attr("aria-label"));

                browseButtonView.disable();
                jqUnit.assertTrue("The browse browseButton has been disabled", secondInput.prop("disabled"));
                browseButtonView.enable();
                jqUnit.assertFalse("The browse browseButton has been enabled", secondInput.prop("disabled"));
            };

            fluid.test.runTests([
                "fluid.tests.uploader.HTML5.browseTree"
            ]);


            /********************
             * addFiles() Tests *
             ********************/
            var addFilesTests = [ {
                fileUploadLimit: 4,
                fileSizeLimit: 1,
                step1Events: ["afterFileQueued", "afterFileQueued", "onQueueError", "onQueueError", "afterFileQueued"],
                step1Files: 3, // Test #1: Three out of five files should have been added to the queue. The third and fourth are too large.
                step2Events: ["afterFileQueued", "onQueueError", "onQueueError", "onQueueError", "onQueueError"],
                step2Files: 1  // Test #2: One file should have been added, after which the fileUploadLimit will have been hit.
            }, {
                fileUploadLimit: 1,
                fileSizeLimit: 100000,
                step1Events: ["afterFileQueued", "onQueueError", "onQueueError", "onQueueError", "onQueueError"],
                step1Files: 1, // Test #1: One out of five files should have been added to the queue.
                step2Events: ["onQueueError", "onQueueError", "onQueueError", "onQueueError", "onQueueError"],
                step2Files: 0  // Test #2: No files should have been added, since the fileUploadLimit has been hit.
            }, {
                fileUploadLimit: 0,
                fileSizeLimit: 100000,
                step1Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued"],
                step1Files: 5, // Test #1: All five files should have been added to the queue.
                step2Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued"],
                step2Files: 5  // Test #2: All five files should have been added to the queue.
            }, {
                fileUploadLimit: null,
                fileSizeLimit: 100000,
                step1Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued"],
                step1Files: 5, // Test #1: All five files should have been added to the queue.
                step2Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued"],
                step2Files: 5  // Test #2: All five files should have been added to the queue.
            }, {
                fileUploadLimit: undefined,
                fileSizeLimit: 100000,
                step1Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued"],
                step1Files: 5, // Test #1: All five files should have been added to the queue.
                step2Events: ["afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued", "afterFileQueued"],
                step2Files: 5  // Test #2: All five files should have been added to the queue.
            }
            ];

            fluid.tests.uploader.addFilesTest = function (fixture) {
                jqUnit.test("Uploader HTML5 addFiles: upload limit " + fixture.fileUploadLimit + " , " + fixture.fileSizeLimit + "KB file size limit", function () {
                    var files = [
                        file1,
                        file2,
                        file3,
                        file4,
                        file5
                    ];

                    var tracker = trackLocalListeners();
                    var localUploader = getLocalUploader(fixture.fileUploadLimit, fixture.fileSizeLimit, tracker);
                    localUploader.addFiles(files);

                    checkEventSequenceForAddedFiles(fixture.step1Events, fixture.step1Files, files, tracker.transcript);
                    jqUnit.assertEquals("Sanity check: the queue should contain " + fixture.step1Files + " files", fixture.step1Files, localUploader.queue.files.length);

                    clearTranscriptAndAddFiles(tracker, files, localUploader);
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
                jqUnit.assertEquals("postParam is correctly appended to FormData", "8", formData.data.id);
                jqUnit.assertEquals("XHR receives the proper method", "POST", xhr.method);
                jqUnit.assertEquals("XHR url is set", "/home/Uploader", xhr.url);
                jqUnit.assertTrue("XHR to execute asynchronously", xhr.async);
                jqUnit.assertEquals("XHR.sendAsBinary() received one argument", 1, xhr.sent.length);
                jqUnit.assertEquals("The FormData instance was sent via XHR.sendAsBinary()", formData, xhr.sent[0]);
            });
        }
    });
})(jQuery);
