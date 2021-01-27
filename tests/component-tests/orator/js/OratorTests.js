/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global jqUnit */

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
    fluid.tests.orator.domReader.parsed = [
        [{
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
        }],
        [{
            // 0
            "blockIndex": 0,
            "childIndex": 0,
            "endOffset": 4,
            "lang": "en-US",
            "node": {},
            "parentNode": {},
            "startOffset": 0,
            "word": "text"
        }],
        [{
            // 0
            "blockIndex": 0,
            "childIndex": 4,
            "endOffset": 5,
            "lang": "en-CA",
            "node": {},
            "parentNode": {},
            "startOffset": 1,
            "word": "from"
        }, {
            // 1
            "blockIndex": 4,
            "childIndex": 4,
            "endOffset": 6,
            "lang": "en-CA",
            "node": {},
            "parentNode": {},
            "startOffset": 5,
            "word": " "
        }, {
            // 2
            "blockIndex": 5,
            "childIndex": 0,
            "endOffset": 3,
            "lang": "en-CA",
            "node": {},
            "parentNode": {},
            "startOffset": 0,
            "word": "DOM"
        }, {
            // 3
            "blockIndex": 8,
            "childIndex": 7,
            "endOffset": 9,
            "lang": "en-CA",
            "node": {},
            "parentNode": {},
            "startOffset": 0,
            "word": "\n        "
        }]
    ];

    // fluid.orator.domReader.parsedToString tests
    fluid.tests.orator.domReader.str = ["Reading ", "text", "from DOM\n        "];

    jqUnit.test("Test fluid.orator.domReader.parsedToString", function () {
        fluid.each(fluid.tests.orator.domReader.parsed, function (parsed, index) {
            var str = fluid.orator.domReader.parsedToString(parsed);
            jqUnit.assertEquals("The parsed text should have been combined to a string: " + str, fluid.tests.orator.domReader.str[index], str);
        });
    });

    // fluid.orator.domReader.getClosestIndex tests
    fluid.tests.orator.domReader.closestIndexTestCases = [{
        parseIndex: 0,
        boundary: -1,
        parseQueueIndex: 0,
        expected: undefined
    }, {
        parseIndex: 0,
        boundary: 0,
        parseQueueIndex: 0,
        expected: 0
    }, {
        parseIndex: 0,
        boundary: 6,
        parseQueueIndex: 0,
        expected: 0
    }, {
        parseIndex: 0,
        parseQueueIndex: 0,
        boundary: 7,
        expected: 1
    }, {
        parseIndex: 1,
        parseQueueIndex: 0,
        boundary: 8,
        expected: 1
    }, {
        parseIndex: 0,
        parseQueueIndex: 0,
        boundary: 27,
        expected: undefined
    }, {
        parseIndex: 0,
        parseQueueIndex: 1,
        boundary: -2,
        expected: undefined
    }, {
        parseIndex: 0,
        parseQueueIndex: 1,
        boundary: 2,
        expected: 0
    }, {
        parseIndex: null,
        parseQueueIndex: 2,
        boundary: 1,
        expected: 0
    }, {
        parseIndex: 0,
        parseQueueIndex: 2,
        boundary: 1,
        expected: 0
    }, {
        parseIndex: 0,
        parseQueueIndex: 2,
        boundary: 4,
        expected: 1
    }, {
        parseIndex: 1,
        parseQueueIndex: 2,
        boundary: 8,
        expected: 3
    }, {
        parseIndex: 2,
        parseQueueIndex: 2,
        boundary: 4,
        expected: 1
    }, {
        parseIndex: 2,
        parseQueueIndex: 2,
        boundary: 35,
        expected: undefined
    }];

    jqUnit.test("Test fluid.orator.domReader.getClosestIndex", function () {
        fluid.each(fluid.tests.orator.domReader.closestIndexTestCases, function (testCase) {
            var mockThat = {parseQueue: fluid.tests.orator.domReader.parsed, model: {parseIndex: testCase.parseIndex}};
            var closest = fluid.orator.domReader.getClosestIndex(mockThat, testCase.boundary, testCase.parseQueueIndex);
            var msg = "Closest index for boundary \"" + testCase.boundary + "\" and parseQueueIndex \"" + testCase.parseQueueIndex + "\" should be: " + testCase.expected;
            jqUnit.assertEquals(msg, testCase.expected, closest);
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
                onSpeechQueued: 3
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
                "text": "Reading"
            }, {
                "interrupt": false,
                "text": "text"
            }, {
                "interrupt": false,
                "text": "from DOM"
            }],
            // a mock parseQueue for testing adding and removing the highlight
            parseQueue: [
                [{
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
            ]
        },
        modules: [{
            name: "fluid.orator.domReader",
            tests: [{
                expect: 57,
                name: "DOM Reading",
                sequence: [{
                    // Play sequence
                    func: "{domReader}.play"
                }, {
                    func: "fluid.tests.orator.domReaderTester.verifyParseQueue",
                    args: ["{domReader}", fluid.tests.orator.domReader.parsed]
                }, {
                    listener: "fluid.tests.orator.domReaderTester.verifySpeakQueue",
                    args: ["{domReader}", "{that}.options.testOptions.expectedSpeechRecord"],
                    spec: {priority: "last:testing"},
                    event: "{domReader}.events.onStop"
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
                    // set paused
                    funcName: "{domReader}.applier.change",
                    args: ["tts.paused", true, "ADD", "domReaderTests"]
                }, {
                    // Boundary event when paused
                    func: "{domReader}.events.utteranceOnBoundary.fire",
                    args: [{charIndex: 8, name: "word"}]
                }, {
                    func: "jqUnit.assertNull",
                    args: ["The ttsBoundary model path should be null", "{domReader}.model.ttsBoundary"]
                }, {
                    // reset paused state
                    funcName: "{domReader}.applier.change",
                    args: ["tts.paused", false, "ADD", "domReaderTests"]
                }, {
                    // Boundary event with no parseQueue items
                    func: "{domReader}.events.utteranceOnBoundary.fire",
                    args: [{charIndex: 8, name: "word"}]
                }, {
                    listener: "jqUnit.assertNodeNotExists",
                    args: ["The parseQueue is empty, no highlight should be added", "{domReader}.dom.highlight"],
                    spec: {priority: "last:testing", path: "ttsBoundary"},
                    changeEvent: "{domReader}.applier.modelChanged"
                }, {
                    // reset ttsBoundary
                    funcName: "{domReader}.applier.change",
                    args: ["ttsBoundary", null, "ADD", "domReaderTests"]
                }, {
                    // Test boundary events with a populated parseQueue
                    // manually add items to parseQueue so that we can more easily test adding and removing the highlight
                    funcName: "fluid.tests.orator.domReaderTester.setParseQueue",
                    args: ["{domReader}", "{that}.options.testOptions.parseQueue"]
                }, {
                    // manually update parseQueue related model values
                    funcName: "{domReader}.applier.change",
                    args: ["", {
                        parseQueueCount: 1,
                        parseItemCount: 2
                    }, "ADD", "domReaderTests"]
                }, {
                    // boundary event fired for sentence
                    funcName: "{domReader}.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.0.0.blockIndex", name: "sentence"}]
                }, {
                    func: "jqUnit.assertNull",
                    args: ["The ttsBoundary model path should be null", "{domReader}.model.ttsBoundary"]
                }, {
                    // boundary event fired for word
                    funcName: "{domReader}.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.0.0.blockIndex", name: "word"}]
                }, {
                    listener: "fluid.tests.orator.domReaderTester.verifyMark",
                    args: ["{domReader}.dom.highlight", 2, "{that}.options.testOptions.parseQueue.0.0.word"],
                    spec: {priority: "last:testing", path: "ttsBoundary"},
                    changeEvent: "{domReader}.applier.modelChanged"
                }, {
                    func: "{domReader}.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.0.1.blockIndex", name: "word"}]
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyMark",
                    args: ["{domReader}.dom.highlight", 1, "{that}.options.testOptions.parseQueue.0.1.word"],
                    spec: {priority: "last:testing", path: "ttsBoundary"},
                    changeEvent: "{domReader}.applier.modelChanged"
                }, {
                    // simulate finished reading
                    func: "{domReader}.events.onStop.fire"
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
                    event: "{domReader}.events.onStop"
                }, {
                    funcName: "fluid.tests.orator.domReaderTester.verifyEmptyParseQueueState",
                    args: ["Replayed Self Voicing completed", "{domReader}"]
                }, {
                    // utterance threw an error
                    // clear speechRecord
                    funcName: "fluid.set",
                    args: ["{tts}", "speechRecord", []]
                }, {
                    func: "{tts}.applier.change",
                    args: ["throwError", true]
                }, {
                    func: "{domReader}.play"
                }, {
                    listener: "fluid.tests.orator.domReaderTester.verifyEmptyParseQueueState",
                    args: ["Self Voicing terminated by utterance error", "{domReader}"],
                    spec: {priority: "last:testing"},
                    event: "{domReader}.events.onError"
                }, {
                    func: "{tts}.applier.change",
                    args: ["throwError", false]
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
        jqUnit.assertEquals(testPrefix + ": The parseQueueCount model value should be 0.", 0, that.model.parseQueueCount);
        jqUnit.assertEquals(testPrefix + ": The parseItemCount model value should be 0.", 0, that.model.parseItemCount);
        jqUnit.assertNull(testPrefix + ": The parseIndex model value should be null.", that.model.parseIndex);
        jqUnit.assertNull(testPrefix + ": The ttsBoundary model value should be null.", that.model.ttsBoundary);
        jqUnit.assertNodeNotExists(testPrefix + ": All highlights should be removed.", that.locate("highlight"));
    };

    fluid.tests.orator.domReaderTester.verifySpeakQueue = function (that, expectedSpeechRecord) {
        jqUnit.assertDeepEq("The text to be spoken should have been queued correctly", expectedSpeechRecord, that.tts.speechRecord);
    };

    fluid.tests.orator.domReaderTester.verifyParseQueue = function (that, expected) {
        var expectedItemsCount = fluid.accumulate(expected, function (queue, count) {return queue.length + count;}, 0);
        jqUnit.assertDeepEq("The parseQueueCount model value should have been set correctly", expected.length, that.model.parseQueueCount);
        jqUnit.assertDeepEq("The parseItemCount model value should have been set correctly", expectedItemsCount, that.model.parseItemCount);
        jqUnit.assertDeepEq("The parseQueue should have been populated correctly", expected, that.parseQueue);
    };

    fluid.tests.orator.domReaderTester.verifyMark = function (elm, expectedHighlightCount, expectedText) {
        jqUnit.assertNodeExists("The highlight should have been added", elm);
        jqUnit.assertEquals("The expeted number of highlight marks should be present: " + expectedHighlightCount, expectedHighlightCount, elm.length);
        jqUnit.assertEquals("The correct text should be highlighted", elm.text(), expectedText);
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

    fluid.tests.orator.selectionReader.mockRange = {
        getClientRects: function () {
            return [{
                top: 20,
                left: 10,
                bottom: 30
            }];
        },
        startContainer: {
            parentNode: {
                getClientRects: function () {
                    return [{
                        top: 10,
                        left: 5
                    }];
                },
                offsetTop: 150,
                offsetLeft: 50,
                offsetParent: {
                    tagName: "div",
                    offsetTop: 0,
                    offsetLeft: 0,
                    clientTop: 0,
                    clientLeft: 0
                }
            }
        }
    };

    fluid.tests.orator.selectionReader.mockRangeBody = $.extend(true, {}, fluid.tests.orator.selectionReader.mockRange, {
        startContainer: {
            parentNode: {
                offsetParent: {
                    tagName: "body"
                }
            }
        }
    });


    fluid.tests.orator.selectionReader.mockRangeBodyOuterBorder = $.extend(true, {}, fluid.tests.orator.selectionReader.mockRangeBody, {
        startContainer: {
            parentNode: {
                offsetParent: {
                    clientTop: 16,
                    clientLeft: 16
                }
            }
        }
    });

    fluid.tests.orator.selectionReader.mockRangeBodyInnerBorder = $.extend(true, {}, fluid.tests.orator.selectionReader.mockRangeBodyOuterBorder, {
        startContainer: {
            parentNode: {
                offsetParent: {
                    offsetTop: -16,
                    offsetLeft: -16
                }
            }
        }
    });

    fluid.tests.orator.selectionReader.position = {
        viewPort: {
            top: 20,
            bottom: 30,
            left: 10
        },
        offset: {
            top: 160,
            bottom: 170,
            left: 55
        }
    };

    fluid.tests.orator.selectionReader.positionBorder = {
        viewPort: {
            top: 20,
            bottom: 30,
            left: 10
        },
        offset: {
            top: 144,
            bottom: 154,
            left: 39
        }
    };

    jqUnit.test("Test fluid.orator.selectionReader.calculatePosition", function () {
        // offsetParent is not the body
        var actual = fluid.orator.selectionReader.calculatePosition(fluid.tests.orator.selectionReader.mockRange);
        jqUnit.assertDeepEq("The ElementPosition object should be constructed and returned correctly.", fluid.tests.orator.selectionReader.position, actual);

        // offsetParent is the body
        var actualBody = fluid.orator.selectionReader.calculatePosition(fluid.tests.orator.selectionReader.mockRangeBody);
        jqUnit.assertDeepEq("The ElementPosition object should be constructed and returned correctly when the offsetParent is the body.", fluid.tests.orator.selectionReader.position, actualBody);

        // offsetParent is the body, inner border
        var actualBodyInnerBorder = fluid.orator.selectionReader.calculatePosition(fluid.tests.orator.selectionReader.mockRangeBodyInnerBorder);
        jqUnit.assertDeepEq("The ElementPosition object should be constructed and returned correctly when the offsetParent is the body - inner border calculation.", fluid.tests.orator.selectionReader.position, actualBodyInnerBorder);

        // offsetParent is the body, outter border
        var actualBodyOuterBorder = fluid.orator.selectionReader.calculatePosition(fluid.tests.orator.selectionReader.mockRangeBodyOuterBorder);
        jqUnit.assertDeepEq("The ElementPosition object should be constructed and returned correctly when the offsetParent is the body - outer border calculation.", fluid.tests.orator.selectionReader.positionBorder, actualBodyOuterBorder);
    });

    jqUnit.test("Test fluid.orator.selectionReader.adjustForHorizontalCollision", function () {
        var control = $("<div>").css({"width": 10, left: fluid.tests.orator.selectionReader.position.offset.left});

        // test no collision
        fluid.orator.selectionReader.adjustForHorizontalCollision(control, fluid.tests.orator.selectionReader.position);
        jqUnit.assertEquals(
            "No horizontal collision: The left css position remains the same",
            fluid.tests.orator.selectionReader.position.offset.left,
            parseFloat(control.css("left"))
        );

        // test collision left
        control.css("width", 30);
        fluid.orator.selectionReader.adjustForHorizontalCollision(control, fluid.tests.orator.selectionReader.position);
        jqUnit.assertEquals(
            "Adjusted for left collision: The left css position is updated", 60, parseFloat(control.css("left"))
        );

        // test collision right
        control.css("width", 16);
        fluid.orator.selectionReader.adjustForHorizontalCollision(control, fluid.tests.orator.selectionReader.position, 16);
        jqUnit.assertEquals(
            "Adjusted for right collision: The left css position is updated", 49, parseFloat(control.css("left"))
        );
    });

    jqUnit.test("Test fluid.orator.selectionReader.adjustForVerticalCollision", function () {
        var aboveStyle = "above";
        var belowStyle = "below";
        var control = $("<div>").css({"height": 15, top: fluid.tests.orator.selectionReader.position.offset.top}).addClass(aboveStyle);

        // test no collision
        fluid.orator.selectionReader.adjustForVerticalCollision(control, fluid.tests.orator.selectionReader.position, belowStyle, aboveStyle);
        jqUnit.assertTrue("No top collision: The aboveStyle is applied", control.hasClass(aboveStyle));
        jqUnit.assertFalse("No top collision: The belowStyle is not applied", control.hasClass(belowStyle));
        jqUnit.assertEquals(
            "No top collision: The top css position remains the same",
            fluid.tests.orator.selectionReader.position.offset.top,
            parseFloat(control.css("top"))
        );

        // test collision
        control.css("height", 30);
        fluid.orator.selectionReader.adjustForVerticalCollision(control, fluid.tests.orator.selectionReader.position, belowStyle, aboveStyle);
        jqUnit.assertFalse("Flip Vertical Position: The aboveStyle is not applied", control.hasClass(aboveStyle));
        jqUnit.assertTrue("Flip Vertical Position: The belowStyle is applied", control.hasClass(belowStyle));
        jqUnit.assertEquals(
            "Flip Vertical Position: The top css position is updated",
            fluid.tests.orator.selectionReader.position.offset.bottom,
            parseFloat(control.css("top"))
        );
    });

    fluid.tests.orator.selectionReader.parseElementTestCases = [{
        name: "Selected parent element - empty options",
        selector: ".flc-orator-selectionReader-test",
        options: {},
        expected: [{
            text: "\n            Selection Test\n            \n            Other Text\n            Change ",
            options: {lang: "en"}
        }, {
            text: "Language",
            options: {lang: "en-US"}
        }, {
            text: "\n        ",
            options: {lang: "en"}
        }]
    }, {
        name: "Selected parent element - undefined options",
        selector: ".flc-orator-selectionReader-test",
        expected: [{
            text: "\n            Selection Test\n            \n            Other Text\n            Change ",
            options: {lang: "en"}
        }, {
            text: "Language",
            options: {lang: "en-US"}
        }, {
            text: "\n        ",
            options: {lang: "en"}
        }]
    }, {
        name: "Selected parent element - with options",
        selector: ".flc-orator-selectionReader-test",
        options: {
            startOffset: "6",
            endOffset: "8",
            startContainer: ".flc-orator-selectionReader-test-selectionTwo",
            endContainer: ".flc-orator-selectionReader-test-selectionTwo"
        },
        expected: [{
            text: "Te",
            options: {lang: "en"}
        }]
    }, {
        name: "Selected element - empty options",
        selector: ".flc-orator-selectionReader-test-selection",
        options: {},
        expected: [{
            text: "Selection Test",
            options: {lang: "en"}
        }]
    }, {
        name: "Selected element - undefined options",
        selector: ".flc-orator-selectionReader-test-selection",
        expected: [{
            text: "Selection Test",
            options: {lang: "en"}
        }]
    }, {
        name: "Selected element - with options",
        selector: ".flc-orator-selectionReader-test-selection",
        options: {
            startOffset: "1",
            endOffset: "6",
            startContainer: ".flc-orator-selectionReader-test-selection",
            endContainer: ".flc-orator-selectionReader-test-selection"
        },
        expected: [{
            text: "elect",
            options: {lang: "en"}
        }]
    }, {
        name: "Selected element - startContainer not in element",
        selector: ".flc-orator-selectionReader-test-selection",
        options: {
            startContainer: ".flc-orator-selectionReader-test-selectionTwo",
            endContainer: ".flc-orator-selectionReader-test-selection"
        },
        expected: []
    }, {
        name: "Selected element - endContainer not in element",
        selector: ".flc-orator-selectionReader-test-selection",
        options: {
            startContainer: ".flc-orator-selectionReader-test-selection",
            endContainer: ".flc-orator-selectionReader-test-selectionTwo"
        },
        expected: []
    }];

    fluid.tests.orator.selectionReader.selectorToTextNode = function (selector) {
        if (typeof(selector) === "string") {
            return $(selector)[0].childNodes[0];
        }
    };

    jqUnit.test("Test fluid.orator.selectionReader.parseElement", function () {
        jqUnit.expect(fluid.tests.orator.selectionReader.parseElementTestCases.length);
        var parser = fluid.textNodeParser();

        fluid.each(fluid.tests.orator.selectionReader.parseElementTestCases, function (testCase) {
            var elm = $(testCase.selector)[0];
            var opts = fluid.copy(testCase.options);

            if (fluid.get(opts, "startContainer")) {
                opts.startContainer = fluid.tests.orator.selectionReader.selectorToTextNode(opts.startContainer);
            }

            if (fluid.get(opts, "endContainer")) {
                opts.endContainer = fluid.tests.orator.selectionReader.selectorToTextNode(opts.endContainer);
            }

            var result = fluid.orator.selectionReader.parseElement(elm, parser.parse, opts);

            jqUnit.assertDeepEq(testCase.name, testCase.expected, result);
        });
    });

    jqUnit.test("Test fluid.orator.selectionReader.parseRange - element selected", function () {
        var parser = fluid.textNodeParser();
        var element = $(".flc-orator-selectionReader-test-selection");

        var expected = [{
            text: "Selection Test",
            options: {lang: "en"}
        }];

        // Select Element
        fluid.tests.orator.selection.selectNode(element);
        var actual = fluid.orator.selectionReader.parseRange(fluid.tests.orator.selection.getSelectionRange(), parser.parse);
        jqUnit.assertDeepEq("Speech[] should be generated correctly", expected, actual);

        // clean up
        fluid.tests.orator.selection.collapse();
    });

    jqUnit.test("Test fluid.orator.selectionReader.parseRange - text node selected", function () {
        var parser = fluid.textNodeParser();
        var node = $(".flc-orator-selectionReader-test-selection")[0].childNodes[0];

        var expected = [{
            text: "election",
            options: {lang: "en"}
        }];

        // Select Element
        fluid.tests.orator.selection.selectNodes(node, node, 1, 9);
        var actual = fluid.orator.selectionReader.parseRange(fluid.tests.orator.selection.getSelectionRange(), parser.parse);
        jqUnit.assertDeepEq("Speech[] should be generated correctly", expected, actual);

        // clean up
        fluid.tests.orator.selection.collapse();
    });

    jqUnit.test("Test fluid.orator.selectionReader.parseRange - selection across nodes", function () {
        var parser = fluid.textNodeParser();
        var startNode = $(".flc-orator-selectionReader-test-selectionThree")[0].childNodes[0];
        var endNode = $(".flc-orator-selectionReader-test-selectionFour")[0].childNodes[0];

        var expected = [{
            text: "nge ",
            options: {lang: "en"}
        }, {
            text: "Language",
            options: {lang: "en-US"}
        }];

        // Select Element
        fluid.tests.orator.selection.selectNodes(startNode, endNode, 3, endNode.textContent.length);
        var actual = fluid.orator.selectionReader.parseRange(fluid.tests.orator.selection.getSelectionRange(), parser.parse);
        jqUnit.assertDeepEq("Speech[] should be generated correctly", expected, actual);

        // clean up
        fluid.tests.orator.selection.collapse();
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
            play: false,
            text: "",
            enabled: true
        },
        selectors: {
            text: ".flc-orator-selectionReader-test-selection",
            otherText: ".flc-orator-selectionReader-test-selectionTwo",
            whitespaceText: ".flc-orator-selectionReader-test-selectionWhitespace"
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
                    play: false,
                    text: "",
                    enabled: true
                },
                whitespaceSelection: {
                    play: false,
                    text: "",
                    enabled: true
                },
                textSelected: {
                    play: false,
                    text: "Selection Test",
                    enabled: true
                },
                textPlay: {
                    play: true,
                    text: "Selection Test",
                    enabled: true
                },
                text2Selected: {
                    play: false,
                    text: "Other Text",
                    enabled: true
                },
                disabled: {
                    play: false,
                    text: "",
                    enabled: false
                }
            }
        },
        modules: [{
            name: "fluid.orator.selectionReader",
            tests: [{
                expect: 40,
                name: "Selection Reader work flow",
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
                    spec: {priority: "last:testing", path: "text"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // play
                    func: "{selectionReader}.play"
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Play", "{that}.options.testOpts.expected.textPlay"],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // stop
                    func: "{selectionReader}.stop"
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Stop", "{that}.options.testOpts.expected.textSelected"],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // utterance threw an error while playing
                    func: "{tts}.applier.change",
                    args: ["throwError", true]
                }, {
                    func: "{selectionReader}.play"
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Error", "{that}.options.testOpts.expected.textSelected"],
                    spec: {priority: "last:testing"},
                    event: "{selectionReader}.events.onError"
                }, {
                    func: "{tts}.applier.change",
                    args: ["throwError", false]
                }, {
                    // click play
                    jQueryTrigger: "click",
                    element: "{selectionReader}.control"
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
                    // Whitespace selection (NOTE: this will clear the selection and set the model.text path back to "")
                    func: "fluid.tests.orator.selection.selectNode",
                    args: ["{selectionReader}.dom.whitespaceText"]
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Whitespace Selection", "{that}.options.testOpts.expected.whitespaceSelection"],
                    spec: {priority: "last:testing", path: "text"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    // Disable after selection
                    func: "fluid.tests.orator.selection.selectNode",
                    args: ["{selectionReader}.dom.otherText"]
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Selection before disabled", "{that}.options.testOpts.expected.text2Selected"],
                    spec: {priority: "last:testing", path: "text"},
                    changeEvent: "{selectionReader}.applier.modelChanged"
                }, {
                    func: "{selectionReader}.applier.change",
                    args: ["enabled", false]
                }, {
                    listener: "fluid.tests.orator.verifySelectionState",
                    args: ["{selectionReader}", "Disabled", "{that}.options.testOpts.expected.disabled"],
                    spec: {priority: "last:testing", path: "text"},
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
                    spec: {priority: "last:testing", path: "text"},
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
