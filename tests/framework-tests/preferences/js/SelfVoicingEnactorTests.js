/*
Copyright 2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit, speechSynthesis */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.speak
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.speakEnactor", {
        gradeNames: ["fluid.prefs.enactor.speak", "autoInit"],
        members: {
            eventRecord: {},
            speakQueue: []
        },
        model: {
            enabled: true
        },
        utteranceOpts: {
            volume: 0
        },
        listeners: {
            "onCreate.cleanUp": "fluid.tests.prefs.enactor.speakEnactor.cleanUp",
            "onStart.record": {
                listener: "{that}.record",
                args: ["onStart"]
            },
            "onStop.record": {
                listener: "{that}.record",
                args: ["onStop"]
            },
            "onSpeechQueued.record": {
                listener: "{that}.record",
                args: ["onSpeechQueued"]
            },
            "onSpeechQueued.recordText": "{that}.recordText"
        },
        invokers: {
            record: {
                funcName: "fluid.tests.prefs.enactor.speakEnactor.record",
                args: ["{that}", "{arguments}.0"]
            },
            recordText: {
                funcName: "fluid.tests.prefs.enactor.speakEnactor.recordText",
                args: ["{that}", "{arguments}.0"]
            },
            clearRecords: {
                funcName: "fluid.tests.prefs.enactor.speakEnactor.clearRecords",
                args: ["{that}"]
            }
        }
    });

    fluid.tests.prefs.enactor.speakEnactor.cleanUp = function () {
        speechSynthesis.cancel();
    };

    fluid.tests.prefs.enactor.speakEnactor.record = function (that, name) {
        that.eventRecord[name] = (that.record[name] || 0) + 1;
    };

    fluid.tests.prefs.enactor.speakEnactor.recordText = function (that, text) {
        that.speakQueue.push(text);
    };

    fluid.tests.prefs.enactor.speakEnactor.clearRecords = function (that) {
        that.eventRecord = {};
        that.speakQueue = {};
    };

    fluid.defaults("fluid.tests.speakTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
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
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
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
                paused: false
            }
        },
        modules: [{
            name: "fluid.prefs.enactor.speak",
            tests: [{
                expect: 3,
                name: "Start-Stop flow",
                sequence: [{
                    func: "{speak}.queueSpeech",
                    args: ["{that}.options.testOptions.sampleText"]
                }, {
                    listener: "fluid.tests.speakTester.verifyRecords",
                    args: [
                        "{speak}",
                        "{that}.options.testOptions.startStopFireRecord",
                        ["{that}.options.testOptions.sampleText"],
                        "{that}.options.testOptions.stoppedModel"
                    ],
                    spec: {priority: "last"},
                    event: "{speak}.events.onStop"
                }]
            }]
        }]
    });

    fluid.tests.speakTester.verifyRecords = function (that, expectedEvents, expectedText, expectedModel) {
        jqUnit.assertDeepEq("The events should have fired correctly", expectedEvents, that.eventRecord);
        jqUnit.assertDeepEq("The text to be spoken should have been queued correctly", expectedText, that.speakQueue);
        jqUnit.assertDeepEq("The model should be reset correctly", expectedModel, that.model);
        that.clearRecords();
    };

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.selfVoicing
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.selfVoicingEnactor", {
        gradeNames: ["fluid.prefs.enactor.selfVoicing", "fluid.tests.prefs.enactor.speakEnactor", "autoInit"],
        model: {
            enabled: false
        },
        invokers: {
            toggle: {
                changePath: "enabled",
                value: "{arguments}.0"
            }
        }
    });

    fluid.defaults("fluid.tests.selfVoicingTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
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
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedText: [
                "{selfVoicing}.options.strings.welcomeMsg",
                "Reading text from DOM",
                "no image"
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
                    event: "{selfVoicing}.events.onStop"
                }]
            }]
        }]
    });

    fluid.tests.selfVoicingTester.verifySpeakQueue = function (that, expectedText) {
        jqUnit.assertDeepEq("The text to be spoken should have been queued correctly", expectedText, that.speakQueue);
        that.clearRecords();
    };

    $(document).ready(function () {
        // only run the tests in browsers that support the Web Speech API for speech synthesis
        if (!fluid.textToSpeech.isSupported()) {
            jqUnit.test("No Tests Run", function () {
                jqUnit.assert("Does not support the SpeechSynthesis Interface");
            });

        } else {
            fluid.test.runTests([
                "fluid.tests.speakTests",
                "fluid.tests.selfVoicingTests"
            ]);
        }
    });

})(jQuery);
