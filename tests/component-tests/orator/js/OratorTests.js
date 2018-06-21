/*
Copyright 2015-2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");


    /*******************************************************************************
     * Unit tests for fluid.orator.controller functions
     *******************************************************************************/

    // fluid.orator.domReader.queueSpeech tests
    jqUnit.test("Test fluid.orator.controller.container", function () {
        var existingContainer = fluid.orator.controller.container(".flc-orator-controller-container-test");
        fluid.orator.controller.container(".flc-orator-controller-injected",
            "<div class=\"flc-orator-controller-container-injectedScope\"></div>",
            ".flc-orator-controller-container-test"
        );
        fluid.orator.controller.container(".flc-orator-controller-injected", "<div class=\"flc-orator-controller-container-defaultScope\"></div>");
        fluid.orator.controller.container(".flc-orator-controller-injected",
            "<div class=\"flc-orator-controller-container-missingScope\"></div>",
            ".flc-orator-controller-container-noScope"
        );


        jqUnit.expect(4);
        jqUnit.assertDomEquals("The existing container should be returned", $(".flc-orator-controller-container-test"), existingContainer);
        jqUnit.assertNodeExists("The container should have been injected into the specified scope",
            $(".flc-orator-controller-container-injectedScope", ".flc-orator-controller-container-test")
        );
        jqUnit.assertNodeExists("The container should have been injected into default scope", $(".flc-orator-controller-container-defaultScope", "body"));
        jqUnit.assertNodeExists("The container should have been injected into default scope when scope element isn't found",
            $(".flc-orator-controller-container-missingScope", "body")
        );
    });


    /*******************************************************************************
     * IoC unit tests for fluid.orator.controller
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator.controller", {
        gradeNames: ["fluid.orator.controller"],
        model: {
            playing: false
        }
    });

    fluid.defaults("fluid.tests.orator.controllerTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-orator-controller-test",
        components: {
            oratorController: {
                type: "fluid.tests.orator.controller",
                container: ".flc-orator-controller-test",
                createOnEvent: "{oratorControllerTester}.events.onTestCaseStart"
            },
            oratorControllerTester: {
                type: "fluid.tests.orator.controllerTester"
            }
        }
    });

    fluid.defaults("fluid.tests.orator.controllerTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.orator.controller",
            tests: [{
                expect: 21,
                name: "Controller UI",
                sequence: [{
                    listener: "fluid.tests.orator.controllerTester.verifyState",
                    args: ["{oratorController}", false],
                    spec: {priority: "last:testing"},
                    event: "{controllerTests oratorController}.events.onCreate"
                }, {
                    func: "{oratorController}.toggle"
                }, {
                    listener: "fluid.tests.orator.controllerTester.verifyState",
                    args: ["{oratorController}", true],
                    spec: {path: "playing", priority: "last:testing"},
                    changeEvent: "{oratorController}.applier.modelChanged"
                }, {
                    func: "{oratorController}.toggle"
                }, {
                    listener: "fluid.tests.orator.controllerTester.verifyState",
                    args: ["{oratorController}", false],
                    spec: {path: "playing", priority: "last:testing"},
                    changeEvent: "{oratorController}.applier.modelChanged"
                }, {
                    func: "{oratorController}.play"
                }, {
                    listener: "fluid.tests.orator.controllerTester.verifyState",
                    args: ["{oratorController}", true],
                    spec: {path: "playing", priority: "last:testing"},
                    changeEvent: "{oratorController}.applier.modelChanged"
                }, {
                    func: "{oratorController}.pause"
                }, {
                    listener: "fluid.tests.orator.controllerTester.verifyState",
                    args: ["{oratorController}", false],
                    spec: {path: "playing", priority: "last:testing"},
                    changeEvent: "{oratorController}.applier.modelChanged"
                }, {
                    // Test the toggleState function directly so that we can exercise the `state` argument
                    funcName: "fluid.orator.controller.toggleState",
                    args: ["{oratorController}", "playing", true]
                }, {
                    listener: "fluid.tests.orator.controllerTester.verifyState",
                    args: ["{oratorController}", true],
                    spec: {path: "playing", priority: "last:testing"},
                    changeEvent: "{oratorController}.applier.modelChanged"
                }, {
                    funcName: "fluid.orator.controller.toggleState",
                    args: ["{oratorController}", "playing", false]
                }, {
                    listener: "fluid.tests.orator.controllerTester.verifyState",
                    args: ["{oratorController}", false],
                    spec: {path: "playing", priority: "last:testing"},
                    changeEvent: "{oratorController}.applier.modelChanged"
                }]
            }]
        }]
    });

    fluid.tests.orator.controllerTester.verifyState = function (that, state) {
        var toggleButton = that.locate("playToggle");
        jqUnit.assertEquals("The model state should be set correctly", state, that.model.playing);
        jqUnit.assertEquals("The playing class should only be added if playing is true", state, toggleButton.hasClass(that.options.styles.play));

        var expectedLabel = state ? "pause" : "play";
        jqUnit.assertEquals("The aria-label should be set correctly", that.options.strings[expectedLabel], toggleButton.attr("aria-label"));
    };

    /*******************************************************************************
     * Unit tests for fluid.orator.domReader functions
     *******************************************************************************/

    fluid.registerNamespace("fluid.tests.orator.domReader");

    fluid.tests.orator.domReader.speechFnArgs = ["the component", "text", false, {}];

    fluid.tests.orator.domReader.verifyQueueSpeech = function (/* that, str, interrupt, options */) {
        var calledWith = [].slice.call(arguments);
        jqUnit.assertDeepEq("The arguments shuld have been passed to the speechFn correctly", fluid.tests.orator.domReader.speechFnArgs, calledWith);
    };

    // fluid.orator.domReader.queueSpeech tests
    jqUnit.test("Test fluid.orator.domReader.queueSpeech - function", function () {
        jqUnit.expect(1);
        fluid.orator.domReader.queueSpeech(
            fluid.tests.orator.domReader.speechFnArgs[0],
            fluid.tests.orator.domReader.verifyQueueSpeech,
            fluid.tests.orator.domReader.speechFnArgs[1],
            fluid.tests.orator.domReader.speechFnArgs[2],
            fluid.tests.orator.domReader.speechFnArgs[3]
        );
    });

    jqUnit.test("Test fluid.orator.domReader.queueSpeech - function name", function () {
        jqUnit.expect(1);
        fluid.orator.domReader.queueSpeech(
            fluid.tests.orator.domReader.speechFnArgs[0],
            "fluid.tests.orator.domReader.verifyQueueSpeech",
            fluid.tests.orator.domReader.speechFnArgs[1],
            fluid.tests.orator.domReader.speechFnArgs[2],
            fluid.tests.orator.domReader.speechFnArgs[3]
        );
    });

    // fluid.orator.domReader.unWrap tests
    jqUnit.test("Test fluid.orator.domReader.unWrap", function () {
        jqUnit.assertNodeExists("The wrapper node should exist", ".flc-orator-domReader-test-wrap");
        fluid.orator.domReader.unWrap(".flc-orator-domReader-test-wrap");

        jqUnit.assertNodeNotExists("The wrapper node should have been removed", ".flc-orator-domReader-test-wrap");
        fluid.orator.domReader.unWrap(".flc-orator-domReader-test-wrap");
        jqUnit.assertEquals("There should only be one childnode in the wrapper's parent", 1, $(".flc-orator-domReader-test-wrap-parent")[0].childNodes.length);

        jqUnit.assert("Unwrapping a second time should not cause an error");
    });

    // fluid.orator.domReader.isWord tests
    fluid.tests.orator.domReader.isWordTestCases = {
        "trueCase": ["a", "hello", "test string"],
        "falseCase": ["", " ", "\t", "\n", undefined, null]
    };

    jqUnit.test("Test fluid.orator.domReader.isWord", function () {
        // test trueCase
        fluid.each(fluid.tests.orator.domReader.isWordTestCases.trueCase, function (str) {
            jqUnit.assertTrue("\"" + str + "\" is considered a word.", fluid.orator.domReader.isWord(str));
        });

        // test falseCase
        fluid.each(fluid.tests.orator.domReader.isWordTestCases.falseCase, function (str) {
            jqUnit.assertFalse("\"" + str + "\" is not considered a word.", fluid.orator.domReader.isWord(str));
        });
    });

    // fluid.orator.domReader.hasTextToRead tests
    fluid.tests.orator.domReader.hasTextToReadTestCases = {
        "trueCase": [
            ".flc-orator-domReader-test-checkDOMText",
            ".flc-orator-domReader-test-checkDOMText-ariaHiddenFalse",
            ".flc-orator-domReader-test-checkDOMText-ariaHiddenFalse-nested",
            ".flc-orator-domReader-test-checkDOMText-hiddenA11y",
            ".flc-orator-domReader-test-checkDOMText-hiddenA11y-nested",
            ".flc-orator-domReader-test-checkDOMText-visible"
        ],
        "falseCase": [
            ".flc-orator-domReader-test-checkDOMText-noNode",
            ".flc-orator-domReader-test-checkDOMText-none",
            ".flc-orator-domReader-test-checkDOMText-none-nested",
            ".flc-orator-domReader-test-checkDOMText-visHidden",
            ".flc-orator-domReader-test-checkDOMText-visHidden-nested",
            ".flc-orator-domReader-test-checkDOMText-hidden",
            ".flc-orator-domReader-test-checkDOMText-hidden-nested",
            ".flc-orator-domReader-test-checkDOMText-ariaHiddenTrue",
            ".flc-orator-domReader-test-checkDOMText-ariaHiddenTrue-nested",
            ".flc-orator-domReader-test-checkDOMText-nestedNone",
            ".flc-orator-domReader-test-checkDOMText-empty",
            ".flc-orator-domReader-test-checkDOMText-script",
            ".flc-orator-domReader-test-checkDOMText-nestedScript"
        ]
    };

    jqUnit.test("Test fluid.orator.domReader.hasTextToRead", function () {
        // The innerText method called in fluid.orator.domReader.hasTextToRead returns text from some hidden elements
        // that modern browsers do not.
        if ($.browser.msie) {
            jqUnit.assert("Tests were not run because innerText works differently on IE 11 and is used for a feature not supported in IE");
        } else {
            // test trueCase
            fluid.each(fluid.tests.orator.domReader.hasTextToReadTestCases.trueCase, function (selector) {
                jqUnit.assertTrue("\"" + selector + "\" should have text to read.", fluid.orator.domReader.hasTextToRead($(selector)));
            });

            // test falseCase
            fluid.each(fluid.tests.orator.domReader.hasTextToReadTestCases.falseCase, function (selector) {
                jqUnit.assertFalse("\"" + selector + "\" shouldn't have text to read.", fluid.orator.domReader.hasTextToRead($(selector)));
            });
        }
    });

    // fluid.orator.domReader.addParsedData tests

    fluid.tests.orator.domReader.expectedParsedAdditions = {
        fromEmpty: [{
            blockIndex: 1,
            startOffset: 1,
            endOffset: 5,
            node: {
                parentNode: {}
            },
            childIndex: 0,
            parentNode: {},
            word: "word"
        }],
        additional: [{
            blockIndex: 1,
            startOffset: 1,
            endOffset: 5,
            node: {
                parentNode: {}
            },
            childIndex: 0,
            parentNode: {},
            word: "word"
        }, {
            blockIndex: 6,
            startOffset: 6,
            endOffset: 9,
            node: {
                parentNode: {test: "value"}
            },
            childIndex: 2,
            parentNode: {test: "value"},
            word: "new"
        }]
    };

    jqUnit.test("Test fluid.orator.domReader.addParsedData", function () {
        var emptyParsed = [];
        fluid.orator.domReader.addParsedData(emptyParsed, "word", {parentNode: {}}, 1, 1, 0);
        jqUnit.assertDeepEq("The data point should be added to the previously empty parsed array", fluid.tests.orator.domReader.expectedParsedAdditions.fromEmpty, emptyParsed);

        var parsed = [fluid.copy(fluid.tests.orator.domReader.expectedParsedAdditions.additional[0])];
        fluid.orator.domReader.addParsedData(parsed, "new", {parentNode: {test: "value"}}, 6, 6, 2);
        jqUnit.assertDeepEq("The data point should be added to the parsed array", fluid.tests.orator.domReader.expectedParsedAdditions.additional, parsed);
    });



    // fluid.orator.domReader.parse tests
    fluid.tests.orator.domReader.parsed = [{
        // 0
        "blockIndex": 0,
        "childIndex": 0,
        "endOffset": 20,
        "node": {},
        "parentNode": {},
        "startOffset": 13,
        "word": "Reading"
    }, {
        // 1
        "blockIndex": 7,
        "childIndex": 0,
        "endOffset": 21,
        "node": {},
        "parentNode": {},
        "startOffset": 20,
        "word": " "
    }, {
        // 2
        "blockIndex": 8,
        "childIndex": 0,
        "endOffset": 4,
        "node": {},
        "parentNode": {},
        "startOffset": 0,
        "word": "text"
    }, {
        // 3
        "blockIndex": 12,
        "childIndex": 2,
        "endOffset": 1,
        "node": {},
        "parentNode": {},
        "startOffset": 0,
        "word": " "
    }, {
        // 4
        "blockIndex": 13,
        "childIndex": 2,
        "endOffset": 5,
        "node": {},
        "parentNode": {},
        "startOffset": 1,
        "word": "from"
    }, {
        // 5
        "blockIndex": 17,
        "childIndex": 2,
        "endOffset": 6,
        "node": {},
        "parentNode": {},
        "startOffset": 5,
        "word": " "
    }, {
        // 6
        "blockIndex": 18,
        "childIndex": 0,
        "endOffset": 3,
        "node": {},
        "parentNode": {},
        "startOffset": 0,
        "word": "DOM"
    }, {
        // 7
        "blockIndex": 21,
        "childIndex": 5,
        "endOffset": 9,
        "node": {},
        "parentNode": {},
        "startOffset": 0,
        "word": "\n        "
    }];

    jqUnit.test("Test fluid.orator.domReader.parse", function () {
        var elm = $(".flc-orator-domReader-test")[0];
        var parsed = fluid.orator.domReader.parse(elm);
        jqUnit.assertDeepEq("The DOM element should have been parsed correctly", fluid.tests.orator.domReader.parsed, parsed);
    });

    // fluid.orator.domReader.parsedToString tests
    fluid.tests.orator.domReader.str = "Reading text from DOM\n        ";

    jqUnit.test("fluid.orator.domReader.parsedToString", function () {
        var str = fluid.orator.domReader.parsedToString(fluid.tests.orator.domReader.parsed);
        jqUnit.assertEquals("The parsed text should have been combined to a string", fluid.tests.orator.domReader.str, str);
    });

    // fluid.orator.domReader.getClosestIndex tests
    fluid.tests.orator.domReader.closestIndexTestCases = [{
        currentIndex: 0,
        boundary: -1,
        expected: undefined
    }, {
        currentIndex: 0,
        boundary: 0,
        expected: 0
    }, {
        currentIndex: 0,
        boundary: 6,
        expected: 0
    }, {
        currentIndex: 0,
        boundary: 7,
        expected: 1
    }, {
        currentIndex: 2,
        boundary: 27,
        expected: 7
    }, {
        currentIndex: 5,
        boundary: 2,
        expected: 0
    }, {
        currentIndex: 7,
        boundary: 18,
        expected: 6
    }, {
        currentIndex: 7,
        boundary: 29,
        expected: 7
    }, {
        currentIndex: 7,
        boundary: 30,
        expected: 7
    }, {
        currentIndex: 7,
        boundary: 35,
        expected: undefined
    }];

    jqUnit.test("fluid.orator.domReader.getClosestIndex", function () {
        fluid.each(fluid.tests.orator.domReader.closestIndexTestCases, function (testCase) {
            var closest = fluid.orator.domReader.getClosestIndex(fluid.tests.orator.domReader.parsed, testCase.currentIndex, testCase.boundary);
            jqUnit.assertEquals("Closest index for boundary \"" + testCase.boundary + "\" should be: " + testCase.expected, testCase.expected, closest);
        });
    });

    /*******************************************************************************
     * IoC unit tests for fluid.orator.domReader
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator.domReader", {
        gradeNames: ["fluid.orator.domReader", "fluid.tests.orator.domReaderMockTTS"]
    });

    fluid.defaults("fluid.tests.orator.domReaderTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-orator-domReader-test",
        components: {
            domReader: {
                type: "fluid.tests.orator.domReader",
                container: ".flc-orator-domReader-test"
            },
            domReaderTester: {
                type: "fluid.tests.orator.domReaderTester"
            }
        }
    });

    fluid.defaults("fluid.tests.orator.domReaderTester", {
        gradeNames: ["fluid.test.testCaseHolder", "fluid.tests.orator.stubs"],
        testOptions: {
            startStopFireRecord: {
                onStart: 1,
                onStop: 1,
                onSpeechQueued: 1
            },
            stoppedModel: {
                speaking: false,
                pending: false,
                paused: false,
                utteranceOpts: {}
            },
            speakingModel: {
                speaking: true,
                pending: false,
                paused: false,
                utteranceOpts: {}
            },
            pausedModel: {
                speaking: false,
                pending: false,
                paused: true,
                pauseRequested: false,
                utteranceOpts: {}
            },
            expectedSpeechRecord: [{
                "interrupt": false,
                "text": "Reading text from DOM"
            }],
            // a mock parseQueue for testing adding and removing the highlight
            parseQueue: [{
                "blockIndex": 0,
                "childIndex": 0,
                "endOffset": 20,
                "node": {},
                "parentNode": {
                    expander: {
                        "this": "{domReader}.container",
                        method: "get",
                        args: [0]
                    }
                },
                "startOffset": 13,
                "word": "Reading"
            }, {
                "blockIndex": 8,
                "childIndex": 0,
                "endOffset": 4,
                "node": {},
                "parentNode": {
                    expander: {
                        func: function (elm) {
                            return $(elm).children()[0];
                        },
                        args: ["{domReader}.container"]
                    }
                },
                "startOffset": 0,
                "word": "text"
            }]
        },
        modules: [{
            name: "fluid.orator.domReader",
            tests: [{
                expect: 31,
                name: "Dom Reading",
                sequence: [{
                    func: "{domReader}.play"
                }, {
                    listener: "fluid.tests.orator.domReaderTester.verifyParseQueue",
                    args: ["{domReader}", fluid.tests.orator.domReader.parsed, "{arguments}.0"],
                    spec: {priority: "last:testing"},
                    event: "{domReader}.events.onReadFromDOM"
                }, {
                    listener: "fluid.tests.orator.domReaderTester.verifySpeakQueue",
                    args: ["{domReader}", "{that}.options.testOptions.expectedSpeechRecord"],
                    spec: {priority: "last:testing"},
                    event: "{domReader}.tts.events.utteranceOnEnd"
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyEnd",
                    args: ["{domReader}"]
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyRecords",
                    args: [
                        "{domReader}",
                        "{that}.options.testOptions.startStopFireRecord",
                        "{that}.options.testOptions.expectedSpeechRecord",
                        "{that}.options.testOptions.stoppedModel"
                    ]
                }, {
                    func: "{domReader}.tts.events.utteranceOnBoundary.fire",
                    args: [{charIndex: 8}]
                }, {
                    funcName: "jqUnit.assertNodeNotExists",
                    args: ["The parseQueue is empty, no highlight should be added", "{domReader}.dom.highlight"]
                }, {
                    // manually add items to parseQueue so that we can more easily test adding and removing the highlight
                    funcName: "fluid.set",
                    args: ["{domReader}", ["parseQueue"], "{that}.options.testOptions.parseQueue"]
                }, {
                    func: "{domReader}.tts.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.0.blockIndex"}]
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyMark",
                    args: ["{domReader}.dom.highlight", "{that}.options.testOptions.parseQueue.0.word"]
                }, {
                    func: "{domReader}.tts.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.1.blockIndex"}]
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyMark",
                    args: ["{domReader}.dom.highlight", "{that}.options.testOptions.parseQueue.1.word"]
                }, {
                    // simulate ending reading
                    func: "{domReader}.tts.events.utteranceOnEnd.fire"
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyEnd",
                    args: ["{domReader}"]
                }, {
                    // test readFromDom if the element to parse isn't available
                    funcName: "fluid.orator.domReader.readFromDOM",
                    args: ["{domReader}", "{domReader}.dom.highlight"]
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["The parseQueue should still be empty after trying to parse an unavailable DOM node.", 0, "{domReader}.parseQueue.length"]
                }, {
                    // replay after finishing
                    // clear speechRecord
                    funcName: "fluid.set",
                    args: ["{domReader}.tts", "speechRecord", []]
                }, {
                    func: "{domReader}.play"
                }, {
                    listener: "fluid.tests.orator.domReaderTester.verifyParseQueue",
                    args: ["{domReader}", fluid.tests.orator.domReader.parsed, "{arguments}.0"],
                    spec: {priority: "last:testing"},
                    event: "{domReader}.events.onReadFromDOM"
                }, {
                    listener: "fluid.tests.orator.domReaderTester.verifySpeakQueue",
                    args: ["{domReader}", "{that}.options.testOptions.expectedSpeechRecord"],
                    spec: {priority: "last:testing"},
                    event: "{domReader}.tts.events.utteranceOnEnd"
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyEnd",
                    args: ["{domReader}"]
                }, {
                    // pause when stopped
                    funcName: "fluid.tests.orator.addStub",
                    args: ["{that}.stubs", "{domReader}.tts", "pause"]
                }, {
                    func: "{domReader}.pause"
                }, {
                    funcName: "jqUnit.assertFalse",
                    args: ["The pause method should not have been called when pausing after speaking has stopped.", "{that}.stubs.pause.called"]
                }, {
                    funcName: "fluid.tests.orator.restoreStubs",
                    args: ["{that}.stubs", "pause"]
                }, {
                    // pause when paused
                    funcName: "fluid.tests.orator.addStub",
                    args: ["{that}.stubs", "{domReader}.tts", "pause"]
                }, {
                    funcName: "fluid.set",
                    args: ["{domReader}", "model", "{that}.options.testOptions.pausedModel"]
                }, {
                    func: "{domReader}.pause"
                }, {
                    funcName: "jqUnit.assertFalse",
                    args: ["The pause method should not have been called when pausing while already paused.", "{that}.stubs.pause.called"]
                }, {
                    funcName: "fluid.tests.orator.restoreStubs",
                    args: ["{that}.stubs", "pause"]
                }, {
                    // pause when speaking
                    funcName: "fluid.tests.orator.addStub",
                    args: ["{that}.stubs", "{domReader}.tts", "pause"]
                }, {
                    funcName: "fluid.set",
                    args: ["{domReader}", "model", "{that}.options.testOptions.speakingModel"]
                }, {
                    func: "{domReader}.pause"
                }, {
                    funcName: "jqUnit.assertTrue",
                    args: ["The pause method should be called when pausing while speaking.", "{that}.stubs.pause.called"]
                }, {
                    funcName: "fluid.tests.orator.restoreStubs",
                    args: ["{that}.stubs", "pause"]
                }, {
                    // play after pause
                    funcName: "fluid.set",
                    args: ["{domReader}", "model", "{that}.options.testOptions.pausedModel"]
                }, {
                    funcName: "fluid.tests.orator.addStub",
                    args: ["{that}.stubs", "{domReader}.tts", "resume"]
                }, {
                    func: "{domReader}.play"
                }, {
                    funcName: "jqUnit.assertTrue",
                    args: ["The resume method should have been called", "{that}.stubs.resume.called"]
                }, {
                    funcName: "fluid.tests.orator.restoreStubs",
                    args: ["{that}.stubs", "resume"]
                }, {
                    // play while speaking
                    funcName: "fluid.set",
                    args: ["{domReader}", "model", "{that}.options.testOptions.speakingModel"]
                }, {
                    funcName: "fluid.tests.orator.addStub",
                    args: ["{that}.stubs", "{domReader}", "readFromDOM"]
                }, {
                    func: "{domReader}.play"
                }, {
                    funcName: "jqUnit.assertFalse",
                    args: ["The readFromDOM method should not be called again when currently speaking", "{that}.stubs.readFromDOM.called"]
                }, {
                    funcName: "fluid.tests.orator.restoreStubs",
                    args: ["{that}.stubs", "readFromDOM"]
                }]
            }]
        }]
    });

    fluid.tests.orator.domReaderTester.verifyEnd = function (that) {
        jqUnit.assertEquals("The parseQueue should be empty.", 0, that.parseQueue.length);
        jqUnit.assertEquals("The parseIndex should be reset to 0.", 0, that.parseIndex);
        jqUnit.assertNodeNotExists("The self voicing has completed. All highlights should be removed.", that.locate("highlight"));
    };

    fluid.tests.orator.domReaderTester.verifySpeakQueue = function (that, expectedSpeechRecord) {
        jqUnit.assertDeepEq("The text to be spoken should have been queued correctly", expectedSpeechRecord, that.tts.speechRecord);
    };

    fluid.tests.orator.domReaderTester.verifyParseQueue = function (that, expected, parsed) {
        jqUnit.assertDeepEq("The parsed data should have been returned correctly", expected, parsed);
        jqUnit.assertDeepEq("The parseQueue should have been populated correctly", expected, that.parseQueue);
    };

    fluid.tests.orator.domReaderTester.verifyMark = function (elm, expectedText) {
        jqUnit.assertNodeExists("The highlight should have been added", elm);
        jqUnit.assertEquals("Only one highlight should be present", 1, elm.length);
        jqUnit.assertEquals("The correct textnode should be highlighted", elm.text(), expectedText);
    };

    fluid.tests.orator.domReaderTester.verifyRecords = function (that, expectedEvents, expectedSpeechRecord, expectedModel) {
        jqUnit.assertDeepEq("TTS: events should have fired correctly", expectedEvents, that.tts.eventRecord);
        jqUnit.assertDeepEq("TTS: text to be spoken should have been queued correctly", expectedSpeechRecord, that.tts.speechRecord);
        jqUnit.assertDeepEq("TTS: model should be reset correctly", expectedModel, that.model);
    };

    /*******************************************************************************
     * IoC unit tests for fluid.orator
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator", {
        gradeNames: ["fluid.orator"],
        model: {
            play: false
        },
        domReader: {
            gradeNames: ["fluid.tests.orator.domReaderStubs", "fluid.tests.orator.domReaderMockTTS"]
        }
    });

    fluid.defaults("fluid.tests.oratorTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-orator-test",
        components: {
            orator: {
                type: "fluid.tests.orator",
                container: ".flc-orator-test",
                createOnEvent: "{oratorTester}.events.onTestCaseStart"
            },
            oratorTester: {
                type: "fluid.tests.oratorTester"
            }
        }
    });

    fluid.defaults("fluid.tests.oratorTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.orator",
            tests: [{
                expect: 30,
                name: "Integration",
                sequence: [{
                    listener: "fluid.tests.orator.verifyState",
                    args: ["{orator}", "Init", false],
                    spec: {priority: "last:testing"},
                    event: "{oratorTests orator}.events.onCreate"
                }, {
                    func: "{orator}.applier.change",
                    args: ["play", true, "ADD", "IntegrationTest"]
                }, {
                    listener: "fluid.tests.orator.verifyState",
                    args: ["{orator}", "Play", true],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{orator}.applier.modelChanged"
                }, {
                    func: "{orator}.applier.change",
                    args: ["play", false, "ADD", "IntegrationTest"]
                }, {
                    listener: "fluid.tests.orator.verifyState",
                    args: ["{orator}", "Pause", false],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{orator}.applier.modelChanged"
                }, {
                    jQueryTrigger: "click",
                    element: "{orator}.controller.dom.playToggle"
                }, {
                    listener: "fluid.tests.orator.verifyState",
                    args: ["{orator}", "Play", true],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{orator}.applier.modelChanged"
                }, {
                    jQueryTrigger: "click",
                    element: "{orator}.controller.dom.playToggle"
                }, {
                    listener: "fluid.tests.orator.verifyState",
                    args: ["{orator}", "Pause", false],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{orator}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.orator.controllerTests",
            "fluid.tests.orator.domReaderTests",
            "fluid.tests.oratorTests"
        ]);
    });

})(jQuery);
