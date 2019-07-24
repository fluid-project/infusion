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

    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * IoC unit tests for fluid.orator.controller
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator.controller", {
        gradeNames: ["fluid.orator.controller"],
        model: {
            enabled: true,
            playing: false
        }
    });

    fluid.defaults("fluid.tests.orator.controllerTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-orator-controller-test",
        components: {
            oratorController: {
                type: "fluid.tests.orator.controller",
                options: {
                    parentContainer: ".flc-orator-controller-test"
                },
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
                expect: 23,
                name: "Controller UI",
                sequence: [{
                    listener: "fluid.tests.orator.controllerTester.verifyState",
                    args: ["{oratorController}", false],
                    spec: {priority: "last:testing"},
                    event: "{controllerTests oratorController}.events.onCreate"
                }, {
                    func: "{oratorController}.toggle",
                    args: ["playing"]
                }, {
                    listener: "fluid.tests.orator.controllerTester.verifyState",
                    args: ["{oratorController}", true],
                    spec: {path: "playing", priority: "last:testing"},
                    changeEvent: "{oratorController}.applier.modelChanged"
                }, {
                    func: "{oratorController}.toggle",
                    args: ["playing"]
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
                }, {
                    // Disable
                    func: "{oratorController}.applier.change",
                    args: ["enabled", false]
                }, {
                    funcName: "jqUnit.notVisible",
                    args: ["The controller should not be visible when it is disabled", "{oratorController}.container"]
                }, {
                    // Enable
                    func: "{oratorController}.applier.change",
                    args: ["enabled", true]
                }, {
                    funcName: "jqUnit.isVisible",
                    args: ["The controller should be visible when it is enabled", "{oratorController}.container"]
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

    /************************************************************************************
     * Unit tests for fluid.orator.domReader and fluid.orator.domReader.parser functions
     ************************************************************************************/

    fluid.registerNamespace("fluid.tests.orator.domReader.parser");

    fluid.tests.orator.domReader.removeExtraWhiteSpaceTestCases = {
        resolve: [{
            name: "leading space",
            text: " leading",
            expected: "leading"
        }, {
            name: "leading tab",
            text: "\tleading",
            expected: "leading"
        }, {
            name: "leading new line",
            text: "\nleading",
            expected: "leading"
        }, {
            name: "multiple leading whitespaces",
            text: "\n\t leading",
            expected: "leading"
        }, {
            name: "trailing space",
            text: "trailing ",
            expected: "trailing"
        }, {
            name: "trailing tab",
            text: "trailing\t",
            expected: "trailing"
        }, {
            name: "trailing new line",
            text: "trailing\n",
            expected: "trailing"
        }, {
            name: "multiple trailing whitespaces",
            text: "trailing \n\t",
            expected: "trailing"
        }, {
            name: "extra whitespaces",
            text: "\n\t whitespace around \n\t",
            expected: "whitespace around"
        }],
        reject: [{
            name: "empty",
            text: ""
        }, {
            name: "only whitespace",
            text: " \t\n"
        }]
    };

    jqUnit.test("Test fluid.orator.domReader.removeExtraWhiteSpace", function () {
        // resolved cases
        fluid.each(fluid.tests.orator.domReader.removeExtraWhiteSpaceTestCases.resolve, function (testCase) {
            var promise = fluid.orator.domReader.removeExtraWhiteSpace(testCase.text);
            promise.then(function (text) {
                jqUnit.assertEquals(testCase.name + " - The extra whitespace should have been removed properly.", testCase.expected, text);
            }, function (error) {
                jqUnit.fail(testCase.name + " - fluid.orator.domReader.removeExtraWhiteSpace should not have been rejected; error msg: " + error);
            });
        });

        // rejected cases
        fluid.each(fluid.tests.orator.domReader.removeExtraWhiteSpaceTestCases.reject, function (testCase) {
            var promise = fluid.orator.domReader.removeExtraWhiteSpace(testCase.text);
            promise.then(function (text) {
                jqUnit.fail(testCase.name + " - fluid.orator.domReader.removeExtraWhiteSpace should not have been resolved; resolve test: " + text);
            }, function (error) {
                jqUnit.assert(testCase.name + " - The whitespace removal should have been rejected; error msg: " + error);
            });
        });
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

    // fluid.orator.domReader.parse tests
    fluid.tests.orator.domReader.parsed = [{
        // 0
        "blockIndex": 0,
        "childIndex": 0,
        "endOffset": 20,
        "lang": "en-CA",
        "node": {},
        "parentNode": {},
        "startOffset": 13,
        "word": "Reading"
    }, {
        // 1
        "blockIndex": 7,
        "childIndex": 2,
        "endOffset": 4,
        "lang": "en-CA",
        "node": {},
        "parentNode": {},
        "startOffset": 3,
        "word": " "
    }, {
        // 2
        "blockIndex": 8,
        "childIndex": 0,
        "endOffset": 4,
        "lang": "en-CA",
        "node": {},
        "parentNode": {},
        "startOffset": 0,
        "word": "text"
    }, {
        // 3
        "blockIndex": 12,
        "childIndex": 4,
        "endOffset": 1,
        "lang": "en-CA",
        "node": {},
        "parentNode": {},
        "startOffset": 0,
        "word": " "
    }, {
        // 4
        "blockIndex": 13,
        "childIndex": 4,
        "endOffset": 5,
        "lang": "en-CA",
        "node": {},
        "parentNode": {},
        "startOffset": 1,
        "word": "from"
    }, {
        // 5
        "blockIndex": 17,
        "childIndex": 4,
        "endOffset": 6,
        "lang": "en-CA",
        "node": {},
        "parentNode": {},
        "startOffset": 5,
        "word": " "
    }, {
        // 6
        "blockIndex": 18,
        "childIndex": 0,
        "endOffset": 3,
        "lang": "en-CA",
        "node": {},
        "parentNode": {},
        "startOffset": 0,
        "word": "DOM"
    }, {
        // 7
        "blockIndex": 21,
        "childIndex": 7,
        "endOffset": 9,
        "lang": "en-CA",
        "node": {},
        "parentNode": {},
        "startOffset": 0,
        "word": "\n        "
    }];

    // fluid.orator.domReader.parsedToString tests
    fluid.tests.orator.domReader.str = "Reading text from DOM\n        ";

    jqUnit.test("Test fluid.orator.domReader.parsedToString", function () {
        var str = fluid.orator.domReader.parsedToString(fluid.tests.orator.domReader.parsed);
        jqUnit.assertEquals("The parsed text should have been combined to a string", fluid.tests.orator.domReader.str, str);
    });

    // fluid.orator.domReader.getClosestIndex tests
    fluid.tests.orator.domReader.closestIndexTestCases = [{
        parseIndex: 0,
        boundary: -1,
        expected: undefined
    }, {
        parseIndex: 0,
        boundary: 0,
        expected: 0
    }, {
        parseIndex: 0,
        boundary: 6,
        expected: 0
    }, {
        parseIndex: 0,
        boundary: 7,
        expected: 1
    }, {
        parseIndex: 2,
        boundary: 27,
        expected: 7
    }, {
        parseIndex: 5,
        boundary: 2,
        expected: 0
    }, {
        parseIndex: 7,
        boundary: 18,
        expected: 6
    }, {
        parseIndex: 7,
        boundary: 29,
        expected: 7
    }, {
        parseIndex: 7,
        boundary: 30,
        expected: 7
    }, {
        parseIndex: 7,
        boundary: 35,
        expected: undefined
    }];

    jqUnit.test("Test fluid.orator.domReader.getClosestIndex", function () {
        fluid.each(fluid.tests.orator.domReader.closestIndexTestCases, function (testCase) {
            var mockThat = {parseQueue: fluid.tests.orator.domReader.parsed, model: {parseIndex: testCase.parseIndex}};
            var closest = fluid.orator.domReader.getClosestIndex(mockThat, testCase.boundary);
            jqUnit.assertEquals("Closest index for boundary \"" + testCase.boundary + "\" should be: " + testCase.expected, testCase.expected, closest);
        });
    });

    // fluid.orator.domReader.findTextNode tests
    fluid.tests.orator.domReader.findTextNodeTestCases = [{
        markup: "<span>first <strong>child</strong></span>",
        expected: "first "
    }, {
        markup: "<span><strong></strong>second child</span>",
        expected: "second child"
    }, {
        markup: "<span><strong>nested</strong> child</span>",
        expected: "nested"
    }];

    jqUnit.test("Test fluid.orator.domReader.findTextNode", function () {

        var undefinedNode = fluid.orator.domReader.findTextNode();
        jqUnit.assertUndefined("An undefined node should return undefined", undefinedNode);

        var textNode = fluid.orator.domReader.findTextNode($("<span>test</span>")[0].childNodes[0]);
        jqUnit.assertEquals("Should return the node, if it is already a text node.", "test", textNode.textContent);

        fluid.each(fluid.tests.orator.domReader.findTextNodeTestCases, function (testCase) {
            var node = $(testCase.markup)[0];
            var retrieved = fluid.orator.domReader.findTextNode(node);
            jqUnit.assertEquals("The text node with text \"" + testCase.expected + "\" should be retrieved", testCase.expected, retrieved.textContent);
        });
    });

    // fluid.orator.domReader.getTextNodeFromSibling tests
    fluid.tests.orator.domReader.getTextNodeFromSiblingTestCases = [{
        markup: "<span>no sibling</span>"
    }, {
        markup: "<span></span><strong>sibling</strong>",
        expected: "sibling"
    }, {
        markup: "<span></span><span></span><strong>third</strong>",
        expected: "third"
    }, {
        markup: "<span></span><strong><span>nested<span></strong>",
        expected: "nested"
    }];

    jqUnit.test("Test fluid.orator.domReader.getTextNodeFromSibling", function () {
        fluid.each(fluid.tests.orator.domReader.getTextNodeFromSiblingTestCases, function (testCase) {
            var node = $(testCase.markup)[0];
            var retrieved = fluid.orator.domReader.getTextNodeFromSibling(node);
            var expected = testCase.expected;
            var actual = retrieved && retrieved.textContent;
            jqUnit.assertEquals("The text node with text \"" + expected + "\" should be retrieved", expected, actual);
        });
    });

    // fluid.orator.domReader.getNextTextNode tests
    fluid.tests.orator.domReader.getNextTextNodeTestCases = [{
        markup: "<span class=\"start\">no sibling or parent</span>"
    }, {
        markup: "<span class=\"start\"></span><strong>sibling</strong>",
        expected: "sibling"
    }, {
        markup: "<span><span class=\"start\"></span></span><strong>parent sibling</strong>",
        expected: "parent sibling"
    }];

    jqUnit.test("Test fluid.orator.domReader.getNextTextNode", function () {
        fluid.each(fluid.tests.orator.domReader.getNextTextNodeTestCases, function (testCase) {
            var node = $(testCase.markup);
            node = node.is(".start") ? node[0] : node.find(".start")[0];
            var retrieved = fluid.orator.domReader.getNextTextNode(node);
            var expected = testCase.expected;
            var actual = retrieved && retrieved.textContent;
            jqUnit.assertEquals("The text node with text \"" + expected + "\" should be retrieved", expected, actual);
        });
    });

    /*******************************************************************************
     * IoC unit tests for fluid.orator.domReader
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator.domReader", {
        // gradeNames: ["fluid.orator.domReader", "fluid.tests.orator.mockTTS"],
        gradeNames: ["fluid.orator.domReader"],
        model: {
            tts: {
                paused: false,
                speaking: false,
                enabled: true
            }
        }
    });

    fluid.defaults("fluid.tests.orator.domReaderTests", {
        gradeNames: ["fluid.test.testEnvironment", "fluid.tests.orator.mockTTS"],
        markupFixture: ".flc-orator-domReader-test",
        components: {
            domReader: {
                type: "fluid.tests.orator.domReader",
                container: ".flc-orator-domReader-test",
                options: {
                    members: {
                        tts: "{tts}"
                    }
                }
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
                paused: false,
                enabled: true
            },
            speakingModel: {
                speaking: true,
                paused: false,
                enabled: true
            },
            pausedModel: {
                speaking: false,
                paused: true,
                enabled: true
            },
            disabledModel: {
                speaking: false,
                paused: false,
                enabled: false
            },
            expectedSpeechRecord: [{
                "interrupt": true,
                "text": "Reading text from DOM"
            }],
            // a mock parseQueue for testing adding and removing the highlight
            parseQueue: [{
                "blockIndex": 0,
                "childIndex": 0,
                "endOffset": 20,
                "lang": "en-CA",
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
                "lang": "en-CA",
                "node": {},
                "parentNode": {
                    expander: {
                        func: function (elm) {
                            return $(elm).children()[1];
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
                expect: 43,
                name: "DOM Reading",
                sequence: [{
                    func: "{domReader}.play"
                }, {
                    func: "fluid.tests.orator.domReaderTester.verifyParseQueue",
                    args: ["{domReader}", fluid.tests.orator.domReader.parsed]
                }, {
                    listener: "fluid.tests.orator.domReaderTester.verifySpeakQueue",
                    args: ["{domReader}", "{that}.options.testOptions.expectedSpeechRecord"],
                    spec: {priority: "last:testing"},
                    event: "{domReader}.events.utteranceOnEnd"
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyEmptyParseQueueState",
                    args: ["Self Voicing completed", "{domReader}"]
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyRecords",
                    args: [
                        "{domReader}",
                        "{that}.options.testOptions.startStopFireRecord",
                        "{that}.options.testOptions.expectedSpeechRecord",
                        "{that}.options.testOptions.stoppedModel"
                    ]
                }, {
                    func: "{domReader}.events.utteranceOnBoundary.fire",
                    args: [{charIndex: 8}]
                }, {
                    listener: "jqUnit.assertNodeNotExists",
                    args: ["The parseQueue is empty, no highlight should be added", "{domReader}.dom.highlight"],
                    spec: {priority: "last:testing", path: "ttsBoundary"},
                    changeEvent: "{domReader}.applier.modelChanged"
                }, {
                    // manually add items to parseQueue so that we can more easily test adding and removing the highlight
                    funcName: "fluid.tests.orator.domReaderTester.setParseQueue",
                    args: ["{domReader}", "{that}.options.testOptions.parseQueue"]
                }, {
                    funcName: "{domReader}.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.0.blockIndex"}]
                }, {
                    listener: "fluid.tests.orator.domReaderTester.verifyMark",
                    args: ["{domReader}.dom.highlight", "{that}.options.testOptions.parseQueue.0.word"],
                    spec: {priority: "last:testing", path: "ttsBoundary"},
                    changeEvent: "{domReader}.applier.modelChanged"
                }, {
                    func: "{domReader}.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.1.blockIndex"}]
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyMark",
                    args: ["{domReader}.dom.highlight", "{that}.options.testOptions.parseQueue.1.word"],
                    spec: {priority: "last:testing", path: "ttsBoundary"},
                    changeEvent: "{domReader}.applier.modelChanged"
                }, {
                    // simulate ending reading
                    func: "{domReader}.events.utteranceOnEnd.fire"
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyEmptyParseQueueState",
                    args: ["utteranceOnEnd fired", "{domReader}"],
                    spec: {priority: "last:testing", path: "parseQueueLength"},
                    changeEvent: "{domReader}.applier.modelChanged"
                }, {
                    // test readFromDom if the element to parse isn't available
                    funcName: "fluid.orator.domReader.readFromDOM",
                    args: ["{domReader}", "{domReader}.dom.highlight"]
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyEmptyParseQueueState",
                    args: ["No DOM Element to read from", "{domReader}"]
                }, {
                    // replay after finishing
                    // clear speechRecord
                    funcName: "fluid.set",
                    args: ["{tts}", "speechRecord", []]
                }, {
                    func: "{domReader}.play"
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyParseQueue",
                    args: ["{domReader}", fluid.tests.orator.domReader.parsed]
                }, {
                    listener: "fluid.tests.orator.domReaderTester.verifySpeakQueue",
                    args: ["{domReader}", "{that}.options.testOptions.expectedSpeechRecord"],
                    spec: {priority: "last:testing"},
                    event: "{domReader}.events.utteranceOnEnd"
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyEmptyParseQueueState",
                    args: ["Replayed Self Voicing completed", "{domReader}"]
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
                    args: ["{domReader}", ["model", "tts"], "{that}.options.testOptions.pausedModel"]
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
                    args: ["{domReader}", ["model", "tts"], "{that}.options.testOptions.speakingModel"]
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
                    args: ["{domReader}", ["model", "tts"], "{that}.options.testOptions.pausedModel"]
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
                    args: ["{domReader}", ["model", "tts"], "{that}.options.testOptions.speakingModel"]
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
                }, {
                    // speak when disabled
                    funcName: "fluid.set",
                    args: ["{domReader}", ["model", "tts"], "{that}.options.testOptions.disabledModel"]
                }, {
                    funcName: "fluid.tests.orator.addStub",
                    args: ["{that}.stubs", "{domReader}", "readFromDOM"]
                }, {
                    funcName: "fluid.tests.orator.addStub",
                    args: ["{that}.stubs", "{domReader}.tts", "resume"]
                }, {
                    func: "{domReader}.play"
                }, {
                    funcName: "jqUnit.assertFalse",
                    args: ["The readFromDOM method should not be called when the component state is disabled", "{that}.stubs.readFromDOM.called"]
                }, {
                    funcName: "jqUnit.assertFalse",
                    args: ["The resume method should not be called when the component state is disabled", "{that}.stubs.resume.called"]
                }, {
                    funcName: "fluid.tests.orator.restoreStubs",
                    args: ["{that}.stubs", ["readFromDOM", "resume"]]
                }]
            }]
        }]
    });

    fluid.tests.orator.domReaderTester.setParseQueue = function (that, parseQueue) {
        that.parseQueue = parseQueue;
        that.applier.change("parseQueueLength", parseQueue.length);
    };

    fluid.tests.orator.domReaderTester.verifyEmptyParseQueueState = function (testPrefix, that) {
        jqUnit.assertDeepEq(testPrefix + ": The parseQueue should be empty.", [], that.parseQueue);
        jqUnit.assertEquals(testPrefix + ": The parseQueueLength model value should be 0.", 0, that.model.parseQueueLength);
        jqUnit.assertNull(testPrefix + ": The parseIndex model value should be null.", that.model.parseIndex);
        jqUnit.assertNull(testPrefix + ": The ttsBoundary model value should be null.", that.model.ttsBoundary);
        jqUnit.assertNodeNotExists(testPrefix + ": All highlights should be removed.", that.locate("highlight"));
    };

    fluid.tests.orator.domReaderTester.verifySpeakQueue = function (that, expectedSpeechRecord) {
        jqUnit.assertDeepEq("The text to be spoken should have been queued correctly", expectedSpeechRecord, that.tts.speechRecord);
    };

    fluid.tests.orator.domReaderTester.verifyParseQueue = function (that, expected) {
        jqUnit.assertDeepEq("The parsedQueueLength model value should have been set correctly", expected.length, that.model.parseQueueLength);
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
        jqUnit.assertDeepEq("TTS: model should be reset correctly", expectedModel, that.model.tts);
    };

    /*******************************************************************************
     * Unit tests for fluid.orator.selectionReader
     *******************************************************************************/

    fluid.registerNamespace("fluid.tests.orator.selectionReader");

    jqUnit.test("Test fluid.orator.selectionReader.stopSpeech", function () {
        jqUnit.expect(1);
        fluid.orator.selectionReader.stopSpeech (true, function () {
            jqUnit.assert("The cancel callback function should have been triggered");
        });
        fluid.orator.selectionReader.stopSpeech (false, function () {
            jqUnit.assert("The cancel callback function should not have been triggered");
        });
    });

    jqUnit.test("Test fluid.orator.selectionReader.getSelectedText", function () {
        var elm = $(".flc-orator-selectionReader-test-selection");
        fluid.tests.orator.selection.selectNode(elm);

        var selectedText = fluid.orator.selectionReader.getSelectedText();
        jqUnit.assertEquals("The correct text should be selected", elm.text(), selectedText);

        // selection cleanup
        fluid.tests.orator.selection.collapse();
    });

    fluid.tests.orator.selectionReader.positionTests = {
        fontSize: 16,
        wndw: {
            pageYOffset: 5,
            pageXOffset: 5
        },
        rect: {top: 20, left: 20, bottom: 40},
        clientWidth: 100,
        testCases: [{
            name: "default offsetScale",
            expected: {
                location: fluid.orator.selectionReader.location.TOP,
                top: 9,
                left: 25
            }
        }, {
            name: "collision with top edge",
            offsetScale: {
                edge: 2,
                pointer: 1.5
            },
            rect: {left: 40},
            expected: {
                location: fluid.orator.selectionReader.location.BOTTOM,
                top: 45,
                left: 45
            }
        }, {
            name: "collision with left edge",
            offsetScale: {
                edge: 2,
                pointer: 1.5
            },
            rect: {top: 36},
            expected: {
                location: fluid.orator.selectionReader.location.TOP,
                top: 17,
                left: 37
            }
        }, {
            name: "collision with right edge",
            offsetScale: {
                edge: 1,
                pointer: 1.5
            },
            clientWidth: 50,
            rect: {left: 35},
            expected: {
                location: fluid.orator.selectionReader.location.TOP,
                top: 1,
                left: 39
            }
        }, {
            name: "no collisions",
            offsetScale: {
                edge: 1.5,
                pointer: 1.5
            },
            rect: {top: 30, left: 30},
            expected: {
                location: fluid.orator.selectionReader.location.TOP,
                top: 11,
                left: 35
            }
        }]
    };

    jqUnit.test("Test fluid.orator.selectionReader.calculatePosition", function () {
        var sandbox = fluid.tests.orator.createSandbox({});
        fluid.each(fluid.tests.orator.selectionReader.positionTests.testCases, function (testCase) {
            sandbox.stub(document.documentElement, "clientWidth")
                .value(testCase.clientWidth || fluid.tests.orator.selectionReader.positionTests.clientWidth);

            var rect = $.extend({}, fluid.tests.orator.selectionReader.positionTests.rect, testCase.rect);
            var actual = fluid.orator.selectionReader.calculatePosition(rect,
                fluid.tests.orator.selectionReader.positionTests.fontSize,
                testCase.offsetScale,
                fluid.tests.orator.selectionReader.positionTests.wndw
            );

            jqUnit.assertDeepEq("Position object generated for - " + testCase.name, testCase.expected, actual);

        });
        sandbox.restore();
    });

    /*******************************************************************************
     * IoC unit tests for fluid.orator.selectionReader
     *******************************************************************************/

    // Due to FLUID-6281 added the "fluid.tests.orator.mockTTS" grade to "fluid.tests.orator.selectionReaderTests"
    // instead of in this grade.
    fluid.defaults("fluid.tests.orator.selectionReader", {
        gradeNames: ["fluid.orator.selectionReader"],
        // gradeNames: ["fluid.orator.selectionReader", "fluid.tests.orator.mockTTS"],
        model: {
            showUI: false,
            play: false,
            text: "",
            enabled: true
        },
        selectors: {
            text: ".flc-orator-selectionReader-test-selection",
            otherText: ".flc-orator-selectionReader-test-selectionTwo"
        }
    });

    fluid.defaults("fluid.tests.orator.selectionReaderTests", {
        // Due to FLUID-6281 adding the "fluid.tests.orator.mockTTS" grade here instead of on "fluid.orator.selectionReader"
        gradeNames: ["fluid.test.testEnvironment", "fluid.tests.orator.mockTTS"],
        markupFixture: ".flc-orator-selectionReader-test",
        components: {
            selectionReader: {
                type: "fluid.tests.orator.selectionReader",
                container: ".flc-orator-selectionReader-test",
                createOnEvent: "{selectionReaderTester}.events.onTestCaseStart"
            },
            selectionReaderTester: {
                type: "fluid.tests.orator.selectionReaderTester"
            }
        }
    });

    fluid.defaults("fluid.tests.orator.selectionReaderTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            expected: {
                noSelection: {
                    showUI: false,
                    play: false,
                    text: "",
                    enabled: true
                },
                textSelected: {
                    showUI: true,
                    play: false,
                    text: "Selection Test",
                    enabled: true
                },
                textPlay: {
                    showUI: true,
                    play: true,
                    text: "Selection Test",
                    enabled: true
                },
                text2Selected: {
                    showUI: true,
                    play: false,
                    text: "Other Text",
                    enabled: true
                },
                disabled: {
                    showUI: false,
                    play: false,
                    text: "",
                    enabled: false
                }
            }
        },
        modules: [{
            name: "fluid.orator.selectionReader",
            tests: [{
                expect: 29,
                name: "fluid.orator.selectionReader",
                sequence: [{
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Init", "{that}.options.testOpts.expected.noSelection"],
                    spec: {priority: "last:testing"},
                    event: "{selectionReaderTests selectionReader}.events.onCreate"
                }, {
                    // Make a selection
                    func: "fluid.tests.orator.selection.selectNode",
                    args: ["{selectionReader}.dom.text"]
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Selection", "{that}.options.testOpts.expected.textSelected"],
                    spec: {priority: "last:testing", path: "showUI"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // play
                    func: "{selectionReader}.play",
                    args: ["play", true]
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Play", "{that}.options.testOpts.expected.textPlay"],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // stop
                    func: "{selectionReader}.stop",
                    args: ["play", true]
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Stop", "{that}.options.testOpts.expected.textSelected"],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // click play
                    jQueryTrigger: "click",
                    element: "{selectionReader}.dom.control"
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Replay", "{that}.options.testOpts.expected.textPlay"],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // Change selection
                    func: "fluid.tests.orator.selection.selectNode",
                    args: ["{selectionReader}.dom.otherText"]
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "New Selection", "{that}.options.testOpts.expected.text2Selected"],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // Collapse selection
                    func: "fluid.tests.orator.selection.collapse"
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Selection Collapsed", "{that}.options.testOpts.expected.noSelection"],
                    spec: {priority: "last:testing", path: "showUI"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // Disable after selection
                    func: "fluid.tests.orator.selection.selectNode",
                    args: ["{selectionReader}.dom.otherText"]
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Selection before disabled", "{that}.options.testOpts.expected.text2Selected"],
                    spec: {priority: "last:testing", path: "showUI"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    func: "{selectionReader}.applier.change",
                    args: ["enabled", false]
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Disabled", "{that}.options.testOpts.expected.disabled"],
                    spec: {priority: "last:testing", path: "showUI"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // Selection while disabled
                    func: "fluid.tests.orator.selection.selectNode",
                    args: ["{selectionReader}.dom.otherText"]
                }, {
                    funcName: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Selection while disabled", "{that}.options.testOpts.expected.disabled"]
                }, {
                    // Enable after selection
                    func: "{selectionReader}.applier.change",
                    args: ["enabled", true]
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Enabled after selection", "{that}.options.testOpts.expected.text2Selected"],
                    spec: {priority: "last:testing", path: "showUI"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }]
            }]
        }]
    });

    /*******************************************************************************
     * IoC unit tests for fluid.orator
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator", {
        gradeNames: ["fluid.orator", "fluid.tests.orator.mockTTS"],
        model: {
            play: false,
            enabled: true
        },
        domReader: {
            gradeNames: ["fluid.tests.orator.domReaderStubs"]
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
                expect: 35,
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
                }, {
                    // disable
                    func: "{orator}.applier.change",
                    args: ["enabled", false]
                }, {
                    funcName: "fluid.tests.oratorTester.verifyDisabled",
                    args: ["{orator}"]
                }]
            }]
        }]
    });

    fluid.tests.oratorTester.verifyDisabled = function (that) {
        jqUnit.assertFalse("The controller should be disabled", that.controller.model.enabled);
        jqUnit.notVisible("The controller should not be visible when it is disabled", that.controller.container);
        jqUnit.assertFalse("The domReader should be disabled", that.domReader.model.enabled);
        fluid.tests.orator.verifySelectionState(that.selectionReader, "selectionReader disabled by orator", {
            showUI: false,
            play: false,
            text: "",
            enabled: false
        });
    };

    $(document).ready(function () {
        var tests = ["fluid.tests.orator.controllerTests"];
        var ttsTests = [
            "fluid.tests.orator.domReaderTests",
            "fluid.tests.orator.selectionReaderTests",
            "fluid.tests.oratorTests"
        ];

        if (fluid.textToSpeech.isSupported()) {
            tests = tests.concat(ttsTests);
        };
        fluid.test.runTests(tests);
    });

})(jQuery);
