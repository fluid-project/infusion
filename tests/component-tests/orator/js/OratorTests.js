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
     * Unit tests for fluid.orator functions
     *******************************************************************************/

    fluid.registerNamespace("fluid.tests.orator");

    // fluid.orator.unWrap tests
    jqUnit.test("Test fluid.orator.unWrap", function () {
        jqUnit.assertNodeExists("The wrapper node should exist", ".flc-orator-test-wrap");
        fluid.orator.unWrap(".flc-orator-test-wrap");

        jqUnit.assertNodeNotExists("The wrapper node should have been removed", ".flc-orator-test-wrap");
        fluid.orator.unWrap(".flc-orator-test-wrap");
        jqUnit.assertEquals("There should only be one childnode in the wrapper's parent", 1, $(".flc-orator-test-wrap-parent")[0].childNodes.length);

        jqUnit.assert("Unwrapping a second time should not cause an error");
    });

    // fluid.orator.isWord tests
    fluid.tests.orator.isWordTestCases = {
        "trueCase": ["a", "hello", "test string"],
        "falseCase": ["", " ", "\t", "\n", undefined, null]
    };

    jqUnit.test("Test fluid.orator.isWord", function () {
        // test trueCase
        fluid.each(fluid.tests.orator.isWordTestCases.trueCase, function (str) {
            jqUnit.assertTrue("\"" + str + "\" is considered a word.", fluid.orator.isWord(str));
        });

        // test falseCase
        fluid.each(fluid.tests.orator.isWordTestCases.falseCase, function (str) {
            jqUnit.assertFalse("\"" + str + "\" is not considered a word.", fluid.orator.isWord(str));
        });
    });

    // fluid.orator.hasRenderedText tests
    fluid.tests.orator.hasRenderedTextTestCases = {
        "trueCase": [
            ".flc-orator-test-rendering",
            ".flc-orator-test-rendering-ariaHiddenFalse",
            ".flc-orator-test-rendering-ariaHiddenFalse-nested",
            ".flc-orator-test-rendering-hiddenA11y",
            ".flc-orator-test-rendering-hiddenA11y-nested",
            ".flc-orator-test-rendering-visible"
        ],
        "falseCase": [
            ".flc-orator-test-rendering-noNode",
            ".flc-orator-test-rendering-none",
            ".flc-orator-test-rendering-none-nested",
            ".flc-orator-test-rendering-visHidden",
            ".flc-orator-test-rendering-visHidden-nested",
            ".flc-orator-test-rendering-hidden",
            ".flc-orator-test-rendering-hidden-nested",
            ".flc-orator-test-rendering-ariaHiddenTrue",
            ".flc-orator-test-rendering-ariaHiddenTrue-nested",
            ".flc-orator-test-rendering-nestedNone",
            ".flc-orator-test-rendering-empty",
            ".flc-orator-test-rendering-script",
            ".flc-orator-test-rendering-nestedScript"
        ]
    };

    jqUnit.test("Test fluid.orator.hasRenderedText", function () {
        // test trueCase
        fluid.each(fluid.tests.orator.hasRenderedTextTestCases.trueCase, function (selector) {
            jqUnit.assertTrue("\"" + selector + "\" should have text to read.", fluid.orator.hasRenderedText($(selector)));
        });

        // test falseCase
        fluid.each(fluid.tests.orator.hasRenderedTextTestCases.falseCase, function (selector) {
            jqUnit.assertFalse("\"" + selector + "\" shouldn't have text to read.", fluid.orator.hasRenderedText($(selector)));
        });
    });

    // fluid.orator.parse tests
    fluid.tests.orator.parsed = [{
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

    jqUnit.test("Test fluid.orator.parse", function () {
        var elm = $(".flc-orator-test")[0];
        var parsed = fluid.orator.parse(elm);
        jqUnit.assertDeepEq("The DOM element should have been parsed correctly", fluid.tests.orator.parsed, parsed);
    });

    // fluid.orator.parsedToString tests
    fluid.tests.orator.str = "Reading text from DOM\n        ";

    jqUnit.test("fluid.orator.parsedToString", function () {
        var str = fluid.orator.parsedToString(fluid.tests.orator.parsed);
        jqUnit.assertEquals("The parsed text should have been combined to a string", fluid.tests.orator.str, str);
    });

    // fluid.orator.getClosestIndex tests
    fluid.tests.orator.closestIndexTestCases = [{
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

    jqUnit.test("fluid.orator.getClosestIndex", function () {
        fluid.each(fluid.tests.orator.closestIndexTestCases, function (testCase) {
            var closest = fluid.orator.getClosestIndex(fluid.tests.orator.parsed, testCase.currentIndex, testCase.boundary);
            jqUnit.assertEquals("Closest index for boundary \"" + testCase.boundary + "\" should be: " + testCase.expected, testCase.expected, closest);
        });
    });

    /*******************************************************************************
     * IoC unit tests for fluid.orator
     *******************************************************************************/

    fluid.defaults("fluid.tests.orator", {
        gradeNames: ["fluid.orator"],
        model: {
            enabled: false
        },
        components: {
            tts: {
                type: "fluid.mock.textToSpeech",
                options: {
                    invokers: {
                        // put back the orator's own queueSpeech method, but pass in the
                        // mock queueSpeech function as the speechFn
                        queueSpeech: {
                            funcName: "fluid.orator.queueSpeech",
                            args: ["{that}", "{that}.mockQueueSpeech", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                        },
                        mockQueueSpeech: {
                            funcName: "fluid.mock.textToSpeech.queueSpeech",
                            args: ["{arguments}.0", "{that}.speechRecord", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
                        }
                    }
                }
            }
        },
        invokers: {
            toggle: {
                changePath: "enabled",
                value: "{arguments}.0"
            }
        }
    });

    fluid.defaults("fluid.tests.oratorTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-orator-test",
        components: {
            orator: {
                type: "fluid.tests.orator",
                container: ".flc-orator-test"
            },
            oratorTester: {
                type: "fluid.tests.oratorTester"
            }
        }
    });

    fluid.defaults("fluid.tests.oratorTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            startStopFireRecord: {
                onStart: 1,
                onStop: 2,
                onSpeechQueued: 2
            },
            stoppedModel: {
                enabled: true,
                speaking: false,
                pending: false,
                paused: false,
                utteranceOpts: {}
            },
            expectedSpeechRecord: [{
                "interrupt": true,
                "text": "text to speech enabled"
            }, {
                "interrupt": false,
                "text": "Reading text from DOM"
            }],
            expectedText: [
                {text: "{orator}.options.strings.welcomeMsg", interrupt: true},
                {text: "Reading text from DOM", interrupt: false}
            ],
            // a mock parseQueue for testing adding and removing the mark
            parseQueue: [[{
                "blockIndex": 0,
                "childIndex": 0,
                "endOffset": 20,
                "node": {},
                "parentNode": {
                    expander: {
                        "this": "{orator}.container",
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
                        args: ["{orator}.container"]
                    }
                },
                "startOffset": 0,
                "word": "text"
            }]]
        },
        modules: [{
            name: "fluid.prefs.enactor.orator",
            tests: [{
                expect: 18,
                name: "Dom Reading",
                sequence: [{
                    func: "{orator}.toggle",
                    args: [true]
                }, {
                    listener: "fluid.tests.oratorTester.verifyParseQueue",
                    args: ["{orator}", [fluid.tests.orator.parsed], "{arguments}.0"],
                    spec: {priority: "last:testing"},
                    event: "{orator}.events.onReadFromDOM"
                }, {
                    listener: "fluid.tests.oratorTester.verifySpeakQueue",
                    args: ["{orator}", "{that}.options.testOptions.expectedText"],
                    spec: {priority: "last:testing"},
                    event: "{orator}.tts.events.onStop"
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["The parseQueue should be empty.", 0, "{orator}.parseQueue.length"]
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["The parseIndex should be reset to 0.", 0, "{orator}.parseIndex"]
                }, {
                    funcName: "jqUnit.assertNodeNotExists",
                    args: ["The self voicing has completed. All marks should be removed.", "{orator}.dom.mark"]
                }, {
                    funcName: "fluid.tests.oratorTester.verifyRecords",
                    args: [
                        "{orator}",
                        "{that}.options.testOptions.startStopFireRecord",
                        "{that}.options.testOptions.expectedSpeechRecord",
                        "{that}.options.testOptions.stoppedModel"
                    ]
                }, {
                    func: "{orator}.tts.events.utteranceOnBoundary.fire",
                    args: [{charIndex: 8}]
                }, {
                    funcName: "jqUnit.assertNodeNotExists",
                    args: ["The parseQueue is empty, so no mark should be added", "{orator}.dom.mark"]
                }, {
                    // manually add items to parseQueue so that we can more easily test adding and removing the mark
                    funcName: "fluid.set",
                    args: ["{orator}", ["parseQueue"], "{that}.options.testOptions.parseQueue"]
                }, {
                    func: "{orator}.tts.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.0.0.blockIndex"}]
                }, {
                    funcName: "fluid.tests.oratorTester.verifyMark",
                    args: ["{orator}.dom.mark", "{that}.options.testOptions.parseQueue.0.0.word"]
                }, {
                    func: "{orator}.tts.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.0.1.blockIndex"}]
                }, {
                    funcName: "fluid.tests.oratorTester.verifyMark",
                    args: ["{orator}.dom.mark", "{that}.options.testOptions.parseQueue.0.1.word"]
                }, {
                    // disabled text to speech
                    func: "{orator}.applier.change",
                    args: ["enabled", false]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The utteranceOnEnd event should have fired"],
                    spec: {priority: "last:testing"},
                    event: "{orator}.tts.events.utteranceOnEnd"
                }, {
                    // test readFromDom if the element to parse isn't available
                    funcName: "fluid.orator.readFromDOM",
                    args: ["{orator}", "{orator}.dom.mark"]
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["The parseQueue should still be empty after trying to parse an unavailable DOM node.", 0, "{orator}.parseQueue.length"]
                }]
            }]
        }]
    });

    fluid.tests.oratorTester.verifySpeakQueue = function (that, expectedText) {
        jqUnit.assertDeepEq("The text to be spoken should have been queued correctly", expectedText, that.tts.speechRecord);
    };

    fluid.tests.oratorTester.verifyParseQueue = function (that, expected, parsed) {
        jqUnit.assertDeepEq("The DOM should have been parsed correctly", expected[0], parsed);
        jqUnit.assertDeepEq("The parseQueue should have been populated correctly", expected, that.parseQueue);
    };

    fluid.tests.oratorTester.verifyMark = function (elm, expectedText) {
        jqUnit.assertNodeExists("The mark should have been added", elm);
        jqUnit.assertEquals("Only one mark should be present", 1, elm.length);
        jqUnit.assertEquals("The marked textnode should be correct", elm.text(), expectedText);
    };

    fluid.tests.oratorTester.verifyRecords = function (that, expectedEvents, expectedSpeechRecord, expectedModel) {
        jqUnit.assertDeepEq("TTS: events should have fired correctly", expectedEvents, that.tts.eventRecord);
        jqUnit.assertDeepEq("TTS: text to be spoken should have been queued correctly", expectedSpeechRecord, that.tts.speechRecord);
        jqUnit.assertDeepEq("TTS: model should be reset correctly", expectedModel, that.model);
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.oratorTests"
        ]);
    });

})(jQuery);
