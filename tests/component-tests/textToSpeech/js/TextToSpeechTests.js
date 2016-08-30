/*
Copyright 2015 OCAD University

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
                }],

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
            },
            {
                name: "Test Including Pause and Resume Events",
                tests: [{
                    expect: 22,
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
                            event: "{tts}.events.onPause"
                        },
                        {
                            func: "{tts}.resume"
                        }, {
                            listener: "fluid.tests.textToSpeech.testResume",
                            args: ["{tts}"],
                            event: "{tts}.events.onResume"
                        },
                        // Test on pause issued after a short delay,
                        {
                            funcName: "fluid.tests.textToSpeech.doAfterDelay",
                            args: ["{tts}.pause", 200]
                        },
                        {
                            listener: "fluid.tests.textToSpeech.testPause",
                            args: ["{tts}"],
                            event: "{tts}.events.onPause"
                        },
                        // Test on resume issued after a short delay,
                        {
                            funcName: "fluid.tests.textToSpeech.doAfterDelay",
                            args: ["{tts}.resume", 200]
                        },
                        {
                            listener: "fluid.tests.textToSpeech.testResume",
                            args: ["{tts}"],
                            event: "{tts}.events.onResume"
                        },
                        // Issue rapid back and forth resume/pause commands;
                        // the queining behaviour shouuld make this safe and
                        // prevent potential race conditions
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

    fluid.tests.textToSpeech.doAfterDelay = function (delayedFunc, delay) {
        setTimeout(function () {
            delayedFunc();
        }, delay);
    };

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
        jqUnit.assertDeepEq("The queue of texts should be empty", [], that.queue.texts);
        jqUnit.assertTrue("A currentUtterance is present in the queue", that.queue.currentUtterance);
        jqUnit.assertTrue("The currentUtterance is a SpeechSynthesisUtterance object", "SpeechSynthesisUtterance", that.queue.currentUtterance.constructor.name);

    };

    fluid.tests.textToSpeech.testStop = function (tts) {
        var that = tts;
        jqUnit.assert("The onStop event should have fired");
        jqUnit.assertFalse("Should not be speaking", that.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", that.model.pending);
        jqUnit.assertFalse("Shouldn't be paused", that.model.paused);
        jqUnit.assertDeepEq("The queue of texts should be empty", [], that.queue.texts);
        jqUnit.assertFalse("No currentUtterance is present in the queue", that.queue.currentUtterance);
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

    fluid.tests.textToSpeech.bypassTest = function (bypassMessage) {
        jqUnit.test("Tests were skipped.", function () {
            jqUnit.assert(bypassMessage);
        });
    };

    // Chooses which test function to execute based on the results of a
    // promise; wraps the promise in an asyncTest to cause QUnit's test
    // runner to suspend while the decision is being made asynchronously by
    // the promise. Without this, QUnit will merrily proceed along to the
    // next test set, which can cause errors various contexts including the
    // all-tests runner.
    //
    // wrapperMessage, task, resolveFunc, rejectFunc: required
    // "task" must be a function returning a promise
    // resolveMessage, rejectMessage: optional strings, passed to the test
    // functions
    fluid.tests.textToSpeech.chooseTestByPromiseResult = function (wrapperMessage, task, resolveFunc, rejectFunc, resolveMessage, rejectMessage) {
        resolveMessage = resolveMessage || "Promise resolved, running resolve test.";
        rejectMessage = rejectMessage || "Promise rejected, running reject test.";
        jqUnit.asyncTest(wrapperMessage, function () {
            jqUnit.expect(0);
            task().then(function () {
                jqUnit.start();
                resolveFunc(resolveMessage);
            }, function () {
                jqUnit.start();
                rejectFunc(rejectMessage);
            });
        });
    };

    fluid.tests.textToSpeech.chooseTestByPromiseResult("Confirming if TTS is available", fluid.textToSpeech.checkTTSSupport, fluid.tests.textToSpeech.ttsTestEnvironment, fluid.tests.textToSpeech.bypassTest, "Browser appears to support TTS", "Browser does not appear to support TTS");

})();
