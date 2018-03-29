/*
Copyright 2015 OCAD University

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
     * Unit tests for fluid.prefs.enactor.speak
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.speakEnactor", {
        gradeNames: ["fluid.prefs.enactor.speak"],
        model: {
            enabled: true
        },
        components: {
            tts: {
                type: "fluid.mock.textToSpeech",
                options: {
                    invokers: {
                        queueSpeech: {
                            funcName: "fluid.mock.textToSpeech.queueSpeech",
                            args: ["{that}", "{that}.speechRecord", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.tests.speakTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            speak: {
                type: "fluid.tests.prefs.enactor.speakEnactor"
            },
            speakTester: {
                type: "fluid.tests.speakTester"
            }
        }
    });

    fluid.defaults("fluid.tests.speakTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            sampleText: "Reading sample text",
            startStopFireRecord: {
                onStart: 1,
                onStop: 1,
                onSpeechQueued: 1
            },
            stoppedModel: {
                enabled: true,
                speaking: false,
                pending: false,
                paused: false,
                utteranceOpts: {}
            }
        },
        modules: [{
            name: "fluid.prefs.enactor.speak",
            tests: [{
                expect: 3,
                name: "Start-Stop flow",
                sequence: [{
                    func: "{speak}.tts.queueSpeech",
                    args: ["{that}.options.testOptions.sampleText"]
                }, {
                    listener: "fluid.tests.speakTester.verifyRecords",
                    args: [
                        "{speak}",
                        "{that}.options.testOptions.startStopFireRecord",
                        [{
                            text: "{that}.options.testOptions.sampleText",
                            interrupt: false
                        }],
                        "{that}.options.testOptions.stoppedModel"
                    ],
                    spec: {priority: "last"},
                    event: "{speak}.tts.events.onStop"
                }]
            }]
        }]
    });

    fluid.tests.speakTester.verifyRecords = function (that, expectedEvents, expectedSpeechRecord, expectedModel) {
        jqUnit.assertDeepEq("The events should have fired correctly", expectedEvents, that.tts.eventRecord);
        jqUnit.assertDeepEq("The text to be spoken should have been queued correctly", expectedSpeechRecord, that.tts.speechRecord);
        jqUnit.assertDeepEq("The model should be reset correctly", expectedModel, that.model);
    };

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.selfVoicing
     *******************************************************************************/

    fluid.registerNamespace("fluid.tests.prefs.enactor.selfVoicingEnactor");

    // fluid.prefs.enactor.selfVoicing.unWrap tests
    jqUnit.test("Test fluid.prefs.enactor.selfVoicing.unWrap", function () {
        jqUnit.assertNodeExists("The wrapper node should exist", ".flc-wrap");
        fluid.prefs.enactor.selfVoicing.unWrap(".flc-wrap");

        jqUnit.assertNodeNotExists("The wrapper node should have been removed", ".flc-wrap");
        fluid.prefs.enactor.selfVoicing.unWrap(".flc-wrap");
        jqUnit.assertEquals("There should only be one childnode in the wrapper's parent", 1, $(".flc-wrap-parent")[0].childNodes.length);

        jqUnit.assert("Unwrapping a second time should not cause an error");
    });

    // fluid.prefs.enactor.selfVoicing.isWord tests
    fluid.tests.prefs.enactor.selfVoicingEnactor.isWordTestCases = {
        "trueCase": ["a", "hello", "test string"],
        "falseCase": ["", " ", "\t", "\n", undefined, null]
    };

    jqUnit.test("Test fluid.prefs.enactor.selfVoicing.isWord", function () {
        // test trueCase
        fluid.each(fluid.tests.prefs.enactor.selfVoicingEnactor.isWordTestCases.trueCase, function (str) {
            jqUnit.assertTrue("\"" + str + "\" is considered a word.", fluid.prefs.enactor.selfVoicing.isWord(str));
        });

        // test falseCase
        fluid.each(fluid.tests.prefs.enactor.selfVoicingEnactor.isWordTestCases.falseCase, function (str) {
            jqUnit.assertFalse("\"" + str + "\" is not considered a word.", fluid.prefs.enactor.selfVoicing.isWord(str));
        });
    });

    // fluid.prefs.enactor.selfVoicing.parse tests
    fluid.tests.prefs.enactor.selfVoicingEnactor.parsed = [{
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
        "childIndex": 4,
        "endOffset": 9,
        "node": {},
        "parentNode": {},
        "startOffset": 0,
        "word": "\n        "
    }];

    jqUnit.test("Test fluid.prefs.enactor.selfVoicing.parse", function () {
        var elm = $(".flc-selfVoicing")[0];
        var parsed = fluid.prefs.enactor.selfVoicing.parse(elm);
        jqUnit.assertDeepEq("The DOM element should have been parsed correctly", fluid.tests.prefs.enactor.selfVoicingEnactor.parsed, parsed);
    });

    // fluid.prefs.enactor.selfVoicing.parsedToString tests
    fluid.tests.prefs.enactor.selfVoicingEnactor.str = "Reading text from DOM\n        ";

    jqUnit.test("fluid.prefs.enactor.selfVoicing.parsedToString", function () {
        var str = fluid.prefs.enactor.selfVoicing.parsedToString(fluid.tests.prefs.enactor.selfVoicingEnactor.parsed);
        jqUnit.assertEquals("The parsed text should have been combined to a string", fluid.tests.prefs.enactor.selfVoicingEnactor.str, str);
    });

    // fluid.prefs.enactor.selfVoicing.getClosestIndex tests
    fluid.tests.prefs.enactor.selfVoicingEnactor.closestIndexTestCases = [{
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

    jqUnit.test("fluid.prefs.enactor.selfVoicing.getClosestIndex", function () {
        fluid.each(fluid.tests.prefs.enactor.selfVoicingEnactor.closestIndexTestCases, function (testCase) {
            var closest = fluid.prefs.enactor.selfVoicing.getClosestIndex(fluid.tests.prefs.enactor.selfVoicingEnactor.parsed, testCase.currentIndex, testCase.boundary);
            jqUnit.assertEquals("Closest index for boundary \"" + testCase.boundary + "\" should be: " + testCase.expected, testCase.expected, closest);
        });
    });

    fluid.defaults("fluid.tests.prefs.enactor.selfVoicingEnactor", {
        gradeNames: ["fluid.prefs.enactor.selfVoicing"],
        model: {
            enabled: false
        },
        components: {
            tts: {
                type: "fluid.mock.textToSpeech",
                options: {
                    invokers: {
                        // put back the selfVoicingEnactors own queueSpeech method, but pass in the
                        // mock queueSpeech function as the speechFn
                        queueSpeech: {
                            funcName: "fluid.prefs.enactor.speak.queueSpeech",
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

    fluid.defaults("fluid.tests.selfVoicingTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-selfVoicing",
        components: {
            selfVoicing: {
                type: "fluid.tests.prefs.enactor.selfVoicingEnactor",
                container: ".flc-selfVoicing"
            },
            selfVoicingTester: {
                type: "fluid.tests.selfVoicingTester"
            }
        }
    });

    fluid.defaults("fluid.tests.selfVoicingTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            expectedText: [
                {text: "{selfVoicing}.options.strings.welcomeMsg", interrupt: true},
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
                        "this": "{selfVoicing}.container",
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
                        args: ["{selfVoicing}.container"]
                    }
                },
                "startOffset": 0,
                "word": "text"
            }]]
        },
        modules: [{
            name: "fluid.prefs.enactor.selfVoicing",
            tests: [{
                expect: 15,
                name: "Dom Reading",
                sequence: [{
                    func: "{selfVoicing}.toggle",
                    args: [true]
                }, {
                    listener: "fluid.tests.selfVoicingTester.verifyParseQueue",
                    args: ["{selfVoicing}", [fluid.tests.prefs.enactor.selfVoicingEnactor.parsed], "{arguments}.0"],
                    spec: {priority: "last:testing"},
                    event: "{selfVoicing}.events.onReadFromDOM"
                }, {
                    listener: "fluid.tests.selfVoicingTester.verifySpeakQueue",
                    args: ["{selfVoicing}", "{that}.options.testOptions.expectedText"],
                    spec: {priority: "last:testing"},
                    event: "{selfVoicing}.tts.events.onStop"
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["The parseQueue should be empty.", 0, "{selfVoicing}.parseQueue.length"]
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["The parseIndex should be reset to 0.", 0, "{selfVoicing}.parseIndex"]
                }, {
                    funcName: "jqUnit.assertNodeNotExists",
                    args: ["The self voicing has completed. All marks should be removed.", "{selfVoicing}.dom.mark"]
                }, {
                    func: "{selfVoicing}.tts.events.utteranceOnBoundary.fire",
                    args: [{charIndex: 8}]
                }, {
                    funcName: "jqUnit.assertNodeNotExists",
                    args: ["The parseQueue is empty, so no mark should be added", "{selfVoicing}.dom.mark"]
                }, {
                    // manually add items to parseQueue so that we can more easily test adding and removing the mark
                    funcName: "fluid.set",
                    args: ["{selfVoicing}", ["parseQueue"], "{that}.options.testOptions.parseQueue"]
                }, {
                    func: "{selfVoicing}.tts.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.0.0.blockIndex"}]
                }, {
                    funcName: "fluid.tests.selfVoicingTester.verifyMark",
                    args: ["{selfVoicing}.dom.mark", "{that}.options.testOptions.parseQueue.0.0.word"]
                }, {
                    func: "{selfVoicing}.tts.events.utteranceOnBoundary.fire",
                    args: [{charIndex: "{that}.options.testOptions.parseQueue.0.1.blockIndex"}]
                }, {
                    funcName: "fluid.tests.selfVoicingTester.verifyMark",
                    args: ["{selfVoicing}.dom.mark", "{that}.options.testOptions.parseQueue.0.1.word"]
                }, {
                    // disabled text to speech
                    func: "{selfVoicing}.applier.change",
                    args: ["enabled", false]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The utteranceOnEnd event should have fired"],
                    spec: {priority: "last:testing"},
                    event: "{selfVoicing}.tts.events.utteranceOnEnd"
                }, {
                    // test readFromDom if the element to parse isn't available
                    funcName: "fluid.prefs.enactor.selfVoicing.readFromDOM",
                    args: ["{selfVoicing}", "{selfVoicing}.dom.mark"]
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["The parseQueue should still be empty after trying to parse an unavailable DOM node.", 0, "{selfVoicing}.parseQueue.length"]
                }]
            }]
        }]
    });

    fluid.tests.selfVoicingTester.verifySpeakQueue = function (that, expectedText) {
        jqUnit.assertDeepEq("The text to be spoken should have been queued correctly", expectedText, that.tts.speechRecord);
    };

    fluid.tests.selfVoicingTester.verifyParseQueue = function (that, expected, parsed) {
        jqUnit.assertDeepEq("The DOM should have been parsed correctly", expected[0], parsed);
        jqUnit.assertDeepEq("The parseQueue should have been populated correctly", expected, that.parseQueue);
    };

    fluid.tests.selfVoicingTester.verifyMark = function (elm, expectedText) {
        jqUnit.assertNodeExists("The mark should have been added", elm);
        jqUnit.assertEquals("Only one mark should be present", 1, elm.length);
        jqUnit.assertEquals("The marked textnode should be correct", elm.text(), expectedText);
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.speakTests",
            "fluid.tests.selfVoicingTests"
        ]);
    });

})(jQuery);
