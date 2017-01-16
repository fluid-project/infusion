/*
Copyright 2015-2016 OCAD University
Copyright 2015 Raising the Floor - International

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

/* global fluid, jqUnit, speechSynthesis */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.textToSpeech", {
        gradeNames: ["fluid.textToSpeech"],
        model: {
            utteranceOpts: {
                // not all speech synthesizers will respect this setting
                volume: 0
            }
        },
        listeners: {
            "onCreate.cleanUp": "fluid.tests.textToSpeech.cleanUp"
        }
    });

    fluid.tests.textToSpeech.cleanUp = function () {
        if (fluid.textToSpeech.isSupported()) {
            speechSynthesis.cancel();
        }
    };

    fluid.defaults("fluid.tests.textToSpeech.ttsTestEnvironment", {
        gradeNames: "fluid.test.testEnvironment",
        components: {
            tts: {
                type: "fluid.tests.textToSpeech",
                createOnEvent: "{ttsTester}.events.onTestCaseStart"
            },
            ttsTester: {
                type: "fluid.tests.textToSpeech.ttsTester"
            }
        }
    });

    fluid.defaults("fluid.tests.textToSpeech.ttsPauseResumeTestEnvironment", {
        gradeNames: "fluid.test.testEnvironment",
        components: {
            tts: {
                type: "fluid.tests.textToSpeech",
                createOnEvent: "{ttsTester}.events.onTestCaseStart"
            },
            ttsTester: {
                type: "fluid.tests.textToSpeech.ttsTesterPauseResume"
            }
        }
    });

    fluid.defaults("fluid.tests.textToSpeech.ttsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [
            {
                name: "Initialization",
                tests: [{
                    expect: 4,
                    name: "Test initialization",
                    sequence:
                    [{
                        func: "fluid.tests.textToSpeech.testInitialization",
                        args: ["{tts}"]
                    }]
                }]

            },
            {
                name: "Start and Stop Events",
                tests: [{
                    expect: 13,
                    name: "Test Start and Stop Events",
                    sequence:
                    [{
                        func: "{tts}.queueSpeech",
                        args: "Testing start and end events"
                    }, {
                        listener: "fluid.tests.textToSpeech.testStart",
                        args: ["{tts}"],
                        event: "{tts}.events.onStart"
                    }, {
                        listener: "fluid.tests.textToSpeech.testStop",
                        args: ["{tts}"],
                        event: "{tts}.events.onStop"
                    }]
                }]
            }]
    });

    fluid.defaults("fluid.tests.textToSpeech.ttsTesterPauseResume", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [
            {
                name: "Test Including Pause and Resume Events",
                tests: [{
                    expect: 13,
                    name: "Test Including Pause and Resume Events",
                    sequence:
                    [
                        {
                            func: "{tts}.queueSpeech",
                            args: "Testing pause and resume events"
                        },
                        // This is necessary or {tts}.pause can be called
                        // before the speech event has actually started,
                        // which messes up the sequencing
                        {
                            listener: "{tts}.pause",
                            event: "{tts}.events.onStart"
                        },
                        // Tests on pause / resume requests issued close together
                        // the queueing behaviour needs to handle these gracefully
                        {
                            listener: "fluid.tests.textToSpeech.testPause",
                            args: ["{tts}"],
                            changeEvent: "{tts}.applier.modelChanged",
                            path: "paused"
                        },
                        {
                            func: "{tts}.resume"
                        }, {
                            listener: "fluid.tests.textToSpeech.testResume",
                            args: ["{tts}"],
                            changeEvent: "{tts}.applier.modelChanged",
                            path: "paused"
                        },
                        // Issue rapid back and forth resume/pause commands,
                        // including doubles
                        // the throttling behaviour shouuld make this safe and
                        // prevent potential race conditions
                        {
                            func: "{tts}.resume"
                        },{
                            func: "{tts}.resume"
                        },{
                            func: "{tts}.pause"
                        },
                        {
                            func: "{tts}.resume"
                        },
                        {
                            func: "{tts}.pause"
                        },
                        {
                            func: "{tts}.resume"
                        },{
                            func: "{tts}.pause"
                        },
                        {
                            func: "{tts}.resume"
                        },
                        {
                            func: "{tts}.pause"
                        },
                        {
                            func: "{tts}.pause"
                        },
                        {
                            func: "{tts}.resume"
                        },{
                            func: "{tts}.pause"
                        },
                        {
                            func: "{tts}.resume"
                        },
                        {
                            func: "{tts}.pause"
                        },
                        {
                            func: "{tts}.resume"
                        },
                        // Test on stop to make sure the speech
                        // completes despite the rapid resume/pause
                        {
                            listener: "fluid.tests.textToSpeech.testStop",
                            args: ["{tts}"],
                            event: "{tts}.events.onStop"
                        }
                    ]
                }]
            }]
    });

    fluid.tests.textToSpeech.testInitialization = function (tts) {
        var that = tts;
        jqUnit.assertTrue("The Text to Speech component should have initialized", that);
        jqUnit.assertFalse("Nothing should be speaking", that.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", that.model.pending);
        jqUnit.assertFalse("Shouldn't be paused", that.model.paused);
    };

    fluid.tests.textToSpeech.testStart = function (tts) {
        var that = tts;
        jqUnit.assert("The onStart event should have fired");
        jqUnit.assertTrue("Should be speaking", that.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", that.model.pending);
        jqUnit.assertFalse("Shouldn't be paused", that.model.paused);
        jqUnit.assertEquals("The queue should contain one item", 1, that.queue.length);
        jqUnit.assertTrue("A text is present in the queue's first item", that.queue[0].text);
        jqUnit.assertTrue("An utterance is present in the queue's first item", that.queue[0].utterance);
        jqUnit.assertTrue("The utterance is a SpeechSynthesisUtterance object", "SpeechSynthesisUtterance", that.queue[0].utterance.constructor.name);

    };

    fluid.tests.textToSpeech.testStop = function (tts) {
        var that = tts;
        jqUnit.assert("The onStop event should have fired");
        jqUnit.assertFalse("Should not be speaking", that.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", that.model.pending);
        jqUnit.assertFalse("Shouldn't be paused", that.model.paused);
        jqUnit.assertDeepEq("The queue should be empty", [], that.queue);
        // jqUnit.assertFalse("No currentUtterance is present in the queue", that.queue.currentUtterance);
        that.cancel();
    };

    fluid.tests.textToSpeech.testPause = function (tts) {
        var that = tts;
        jqUnit.assert("The pause event should have fired");
        jqUnit.assertTrue("Should be speaking", that.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", that.model.pending);
        jqUnit.assertTrue("Should be paused", that.model.paused);
    };

    fluid.tests.textToSpeech.testResume = function (tts) {
        var that = tts;
        jqUnit.assert("The resume event should have fired");
        jqUnit.assertTrue("Should be speaking", that.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", that.model.pending);
        jqUnit.assertFalse("Shouldn't be paused", that.model.paused);
    };

    fluid.tests.textToSpeech.baseTests = function () {
        fluid.test.conditionalTestUtils.chooseTestByPromiseResult("Confirming if TTS is available for initialization and start/stop tests",
         fluid.textToSpeech.checkTTSSupport,
          fluid.tests.textToSpeech.ttsTestEnvironment,
           fluid.test.conditionalTestUtils.bypassTest,
           "Browser appears to support TTS", "Browser does not appear to support TTS");
    };

    fluid.tests.textToSpeech.supportsPauseResumeTests = function () {
        fluid.test.conditionalTestUtils.chooseTestByPromiseResult("Confirming if TTS is available for pause and resume tests",
         fluid.textToSpeech.checkTTSSupport,
          fluid.tests.textToSpeech.ttsPauseResumeTestEnvironment,
           fluid.test.conditionalTestUtils.bypassTest, "Browser appears to support TTS", "Browser does not appear to support TTS");
    };

    fluid.tests.textToSpeech.isChromeOnWindows = function () {
        return fluid.contextAware.getCheckValue(fluid.rootComponent, "{fluid.browser.isChrome}") && fluid.contextAware.getCheckValue(fluid.rootComponent, "{fluid.browser.platform.isWindows}");
    };

    // The following environments are currently consider to not support
    // pause and resume:
    // Linux (any browser)
    // Chrome on Windows due to this bug:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=679043

    fluid.tests.textToSpeech.isPauseResumeSupporting = function () {
        return !fluid.tests.textToSpeech.isChromeOnWindows() && !fluid.test.conditionalTestUtils.isBrowserOnLinux();
    };

    // Makes check Chrome on Windows due to TTS pause/resume bug
    fluid.contextAware.makeChecks({
        "fluid.tests.textToSpeech.supportsPauseResume": "fluid.tests.textToSpeech.isPauseResumeSupporting"
    });

    fluid.defaults("fluid.tests.textToSpeech.contextAwareTestRunner", {
        gradeNames: ["fluid.test.conditionalTestUtils.contextAwareTestRunner"],
        contextAwareness: {
            supportsPauseResume: {
                checks: {
                    supportsPauseResume: {
                        contextValue: "{fluid.tests.textToSpeech.supportsPauseResume}",
                        equals: true,
                        gradeNames: ["fluid.tests.textToSpeech.contextAwareTestRunner.supportsPauseResume"]
                    }
                }
            }
        },
        tests: {
            base: "fluid.tests.textToSpeech.baseTests"
        }
    });

    fluid.defaults("fluid.tests.textToSpeech.contextAwareTestRunner.supportsPauseResume", {
        tests: {
            supportsPauseResume: "fluid.tests.textToSpeech.supportsPauseResumeTests"
        }
    });

    fluid.tests.textToSpeech.contextAwareTestRunner();

})();
