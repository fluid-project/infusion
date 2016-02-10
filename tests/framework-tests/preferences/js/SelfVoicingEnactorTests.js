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
                            args: ["{that}", "{that}.handleStart", "{that}.handleEnd", "{that}.speechRecord", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
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
                            args: ["{arguments}.0", "{that}.handleStart", "{that}.handleEnd", "{that}.speechRecord", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
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
                {text: "Reading text from DOM", interrupt: false},
                {text: "no image", interrupt: false}
            ]
        },
        modules: [{
            name: "fluid.prefs.enactor.selfVoicing",
            tests: [{
                expect: 1,
                name: "Dom Reading",
                sequence: [{
                    func: "{selfVoicing}.toggle",
                    args: [true]
                }, {
                    listener: "fluid.tests.selfVoicingTester.verifySpeakQueue",
                    args: ["{selfVoicing}", "{that}.options.testOptions.expectedText"],
                    spec: {priority: "last"},
                    event: "{selfVoicing}.tts.events.onStop"
                }]
            }]
        }]
    });

    fluid.tests.selfVoicingTester.verifySpeakQueue = function (that, expectedText) {
        jqUnit.assertDeepEq("The text to be spoken should have been queued correctly", expectedText, that.tts.speechRecord);
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.speakTests",
            "fluid.tests.selfVoicingTests"
        ]);
    });

})(jQuery);
