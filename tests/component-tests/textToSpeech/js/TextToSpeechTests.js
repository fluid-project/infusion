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

/* global fluid, jqUnit, speechSynthesis */

(function () {
    "use strict";

    fluid.registerNamespace("fluid.tests");
    
    /**
     * Ensures that TTS is supported in the browser, including the following cases:
     * - Feature is not detected
     * - Feature is detected, but where the underlying audio engine is missing. For example in VMs without an audio
     *   driver
     * - Feature is detected, but calling speechSynthesis.speak witout user activation is not supported
     *   (e.g. https://developers.google.com/web/updates/2018/10/chrome-71-deps-rems#remove_speechsynthesisspeak_without_user_activation)
     *
     * The behaviour for browsers which report that the SpeechSynthesis API is implemented, but which fails this
     * check, is for the `onend` event not to fire. If we do not receive the `onend` event within a specified `delay`,
     * the promise is rejected.
     *
     * @param {Number} delay - A time in milliseconds to wait for the speechSynthesis to fire its `onend` event,
     * by default it is 5000ms (5s). This is crux of the test, as it needs time to attempt to run the speechSynthesis.
     *
     * @return {fluid.promise} - A promise which will resolve if the TTS is supported (the `onend` event is fired within
     * the delay period) or be rejected otherwise.
     */
    fluid.tests.checkTTSSupport = function (delay) {
        var promise = fluid.promise();
        if (fluid.textToSpeech.isSupported()) {
            // MS Edge speech synthesizer won't speak if the text string is blank,
            // so this must contain actual text
            var toSpeak = new SpeechSynthesisUtterance("short"); // short text to attempt to speak
            toSpeak.volume = 0; // mutes the Speech Synthesizer
            // Same timeout as the timeout in the IoC testing framework
            var timeout = setTimeout(function () {
                fluid.textToSpeech.invokeSpeechSynthesisFunc("cancel");
                promise.reject();
            }, delay || 5000);
            toSpeak.onend = function () {
                clearTimeout(timeout);
                fluid.textToSpeech.invokeSpeechSynthesisFunc("cancel");
                promise.resolve();
            };
            fluid.textToSpeech.invokeSpeechSynthesisFunc("speak", toSpeak);
        } else {
            fluid.invokeLater(promise.reject);
        }
        return promise;
    };

    /*********************************************************************************************
     * fluid.textToSpeech tests
     *********************************************************************************************/

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
        modules: [{
            name: "fluid.textToSpeech",
            tests: [{
                expect: 4,
                name: "Test initialization",
                sequence:
                [{
                    func: "fluid.tests.textToSpeech.testInitialization",
                    args: ["{tts}"]
                }]
            }, {
                expect: 14,
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
                }, {
                    listener: "fluid.tests.textToSpeech.testUtteranceDetached",
                    args: ["The utterance should not be attached", "{tts}"],
                    priority: "last:testing",
                    event: "{tts}.utterance.events.afterDestroy"
                }]
            }, {
                expect: 1,
                name: "queueSpeech promise",
                sequence:
                [{
                    task: "{tts}.queueSpeech",
                    args: "Testing queueSpeech promise",
                    resolve: "jqUnit.assert",
                    resolveArgs: ["The queueSpeech promise resolved"]
                }]
            }]
        }]
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

    fluid.defaults("fluid.tests.textToSpeech.ttsTesterPauseResume", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.textToSpeech",
            tests: [{
                expect: 14,
                name: "Test Including Pause and Resume Events",
                sequence: [{
                    func: "{tts}.queueSpeech",
                    args: "Testing pause and resume events"
                }, {
                    // This is necessary or {tts}.pause can be called
                    // before the speech event has actually started,
                    // which messes up the sequencing
                    listener: "{tts}.pause",
                    event: "{tts}.events.onStart"
                }, {
                    // Tests on pause / resume requests issued close together
                    // the queueing behaviour needs to handle these gracefully
                    listener: "fluid.tests.textToSpeech.testPause",
                    args: ["{tts}"],
                    changeEvent: "{tts}.applier.modelChanged",
                    path: "paused"
                }, {
                    func: "{tts}.resume"
                }, {
                    listener: "fluid.tests.textToSpeech.testResume",
                    args: ["{tts}"],
                    changeEvent: "{tts}.applier.modelChanged",
                    path: "paused"
                }, {
                    func: "{tts}.resume"
                }, {
                    listener: "fluid.tests.textToSpeech.testStop",
                    args: ["{tts}"],
                    priority: "last:testing",
                    event: "{tts}.events.onStop"
                }, {
                    listener: "fluid.tests.textToSpeech.testUtteranceDetached",
                    args: ["The utterance should not be attached", "{tts}"],
                    priority: "last:testing",
                    event: "{tts}.utterance.events.afterDestroy"
                }]
            }]
        }]
    });

    fluid.tests.textToSpeech.testInitialization = function (tts) {
        jqUnit.assertTrue("The Text to Speech component should have initialized", tts);
        jqUnit.assertFalse("Nothing should be speaking", tts.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", tts.model.pending);
        jqUnit.assertFalse("Shouldn't be paused", tts.model.paused);
    };

    fluid.tests.textToSpeech.testStart = function (tts) {
        jqUnit.assert("The onStart event should have fired");
        jqUnit.assertTrue("Should be speaking", tts.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", tts.model.pending);
        jqUnit.assertFalse("Shouldn't be paused", tts.model.paused);
        jqUnit.assertEquals("The queue should contain one item", 1, tts.queue.length);
        jqUnit.assertTrue("An utterance component is present as the queue's first item", fluid.hasGrade(tts.queue[0].options, "fluid.textToSpeech.utterance"));
        jqUnit.assertTrue("An utterance is present in the queue's first item", tts.queue[0].utterance);
        jqUnit.assertTrue("The utterance is a SpeechSynthesisUtterance object", "SpeechSynthesisUtterance", tts.queue[0].utterance.constructor.name);

    };

    fluid.tests.textToSpeech.testStop = function (tts) {
        jqUnit.assert("The onStop event should have fired");
        jqUnit.assertFalse("Should not be speaking", tts.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", tts.model.pending);
        jqUnit.assertFalse("Shouldn't be paused", tts.model.paused);
        jqUnit.assertDeepEq("The queue should be empty", [], tts.queue);
        tts.cancel();
    };

    // Need to wrap jqUnit.assertUndefined because the framework will throw an error when trying to resolve
    // {tts}.utterance after it has already been detached.
    fluid.tests.textToSpeech.testUtteranceDetached = function (msg, tts) {
        jqUnit.assertUndefined(msg, tts.utterance);
    };

    fluid.tests.textToSpeech.testPause = function (tts) {
        jqUnit.assert("The pause event should have fired");
        jqUnit.assertTrue("Should be speaking", tts.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", tts.model.pending);
        jqUnit.assertTrue("Should be paused", tts.model.paused);
    };

    fluid.tests.textToSpeech.testResume = function (tts) {
        jqUnit.assert("The resume event should have fired");
        jqUnit.assertTrue("Should be speaking", tts.model.speaking);
        jqUnit.assertFalse("Nothing should be pending", tts.model.pending);
        jqUnit.assertFalse("Shouldn't be paused", tts.model.paused);
    };

    fluid.tests.textToSpeech.baseTests = function () {
        fluid.test.conditionalTestUtils.chooseTestByPromiseResult("Confirming if TTS is available for initialization and start/stop tests",
         fluid.tests.checkTTSSupport,
          fluid.tests.textToSpeech.ttsTestEnvironment,
           fluid.test.conditionalTestUtils.bypassTest,
           "Browser appears to support TTS start/stop", "Browser does not appear to support TTS start/stop");
    };

    fluid.tests.textToSpeech.supportsPauseResumeTests = function () {
        fluid.test.conditionalTestUtils.chooseTestByPromiseResult("Confirming if TTS is available for pause and resume tests",
         fluid.tests.checkTTSSupport,
          fluid.tests.textToSpeech.ttsPauseResumeTestEnvironment,
           fluid.test.conditionalTestUtils.bypassTest, "Browser appears to support TTS pause/resume", "Browser does not appear to support TTS pause/resume");
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

    /*********************************************************************************************
     * fluid.textToSpeech.utterance tests
     *********************************************************************************************/

    fluid.tests.textToSpeech.supportsPitch = function () {
        var newPitch = 1.2;
        if (fluid.textToSpeech.isSupported()) {
            var utterance = new SpeechSynthesisUtterance("test");
            utterance.pitch = newPitch;
            return fluid.roundToDecimal(utterance.pitch, 1) === newPitch;
        } else {
            return false;
        }
    };

    fluid.contextAware.makeChecks({
        "fluid.tts.utterance.supportsPitch": {
            funcName: "fluid.tests.textToSpeech.supportsPitch"
        }
    });

    fluid.defaults("fluid.tests.textToSpeech.utterance", {
        gradeNames: ["fluid.textToSpeech.utterance", "fluid.contextAware"],
        // MS Edge doesn't support pitch.
        contextAwareness: {
            supportPitch: {
                checks: {
                    supportsPitch: {
                        contextValue: "{fluid.tts.utterance.supportsPitch}",
                        equals: true,
                        gradeNames: ["fluid.tests.textToSpeech.utterance.pitch"]
                    }
                }
            }
        },
        utterance: {
            text: "Hello World!",
            lang: "en",
            volume: 0.8,
            rate: 2
        }
    });

    fluid.defaults("fluid.tests.textToSpeech.utterance.pitch", {
        utterance: {
            pitch: 1.1
        }
    });

    fluid.defaults("fluid.tests.textToSpeech.utteranceEnvironment", {
        gradeNames: "fluid.test.testEnvironment",
        components: {
            utterance: {
                type: "fluid.tests.textToSpeech.utterance"
            },
            utteranceError: {
                type: "fluid.tests.textToSpeech.utterance"
            },
            utteranceTester: {
                type: "fluid.tests.textToSpeech.utteranceTester"
            }
        }
    });

    fluid.defaults("fluid.tests.textToSpeech.utteranceTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.textToSpeech.utterance",
            tests: [{
                expect: 6,
                name: "Test successful utterance event sequence",
                sequence:
                [{
                    func: "fluid.tests.textToSpeech.utteranceTester.verifyUtterance",
                    args: ["{utterance}.utterance", "{utterance}.options.utterance"]
                }, {
                    funcName: "fluid.tests.textToSpeech.utteranceTester.dispatchEvent",
                    args: ["{utterance}.utterance", "start"]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The onStart event fired"],
                    priority: "last:testing",
                    event: "{utterance}.events.onStart"
                }, {
                    funcName: "fluid.tests.textToSpeech.utteranceTester.dispatchEvent",
                    args: ["{utterance}.utterance", "boundary"]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The onBoundary event fired"],
                    priority: "last:testing",
                    event: "{utterance}.events.onBoundary"
                }, {
                    funcName: "fluid.tests.textToSpeech.utteranceTester.dispatchEvent",
                    args: ["{utterance}.utterance", "mark"]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The onMark event fired"],
                    priority: "last:testing",
                    event: "{utterance}.events.onMark"
                }, {
                    funcName: "fluid.tests.textToSpeech.utteranceTester.dispatchEvent",
                    args: ["{utterance}.utterance", "pause"]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The onPause event fired"],
                    priority: "last:testing",
                    event: "{utterance}.events.onPause"
                }, {
                    funcName: "fluid.tests.textToSpeech.utteranceTester.dispatchEvent",
                    args: ["{utterance}.utterance", "resume"]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The onResume event fired"],
                    priority: "last:testing",
                    event: "{utterance}.events.onResume"
                }, {
                    funcName: "fluid.tests.textToSpeech.utteranceTester.dispatchEvent",
                    args: ["{utterance}.utterance", "end"]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The onEnd event fired"],
                    priority: "last:testing",
                    event: "{utterance}.events.onEnd"
                }]
            }, {
                expect: 1,
                name: "Test utterance error",
                sequence:
                [{
                    func: "fluid.tests.textToSpeech.utteranceTester.verifyUtterance",
                    args: ["{utteranceError}.utterance", "{utteranceError}.options.utterance"]
                }, {
                    funcName: "fluid.tests.textToSpeech.utteranceTester.dispatchEvent",
                    args: ["{utteranceError}.utterance", "error"]
                }, {
                    listener: "jqUnit.assert",
                    args: ["The onError event fired"],
                    priority: "last:testing",
                    event: "{utteranceError}.events.onError"
                }]
            }]
        }]
    });

    fluid.tests.textToSpeech.utteranceTester.dispatchEvent = function (utterance, type) {
        var newEvent = new Event(type);
        utterance.dispatchEvent(newEvent);
    };

    fluid.tests.textToSpeech.utteranceTester.verifyUtterance = function (utterance, expectedProps) {
        jqUnit.expect(fluid.values(expectedProps).length);
        fluid.each(expectedProps, function (value, propName) {
            var expectedValue = utterance[propName];
            if (typeof(expectedValue) === "number") {
                expectedValue = fluid.roundToDecimal(expectedValue, 1);
            }

            jqUnit.assertEquals("The utterance '" + propName + "' property should have been set correctly.", value, expectedValue);
        });
    };

    fluid.tests.textToSpeech.utteranceTests = function () {
        fluid.test.conditionalTestUtils.chooseTestByPromiseResult("Confirming if TTS is available for Utterance tests",
         fluid.tests.checkTTSSupport,
          fluid.tests.textToSpeech.utteranceEnvironment,
           fluid.test.conditionalTestUtils.bypassTest,
           "Browser appears to support TTS", "Browser does not appear to support TTS");
    };

    /*********************************************************************************************
     * Test Runner
     *********************************************************************************************/

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
            base: "fluid.tests.textToSpeech.baseTests",
            utterance: "fluid.tests.textToSpeech.utteranceTests"
        }
    });

    fluid.defaults("fluid.tests.textToSpeech.contextAwareTestRunner.supportsPauseResume", {
        tests: {
            supportsPauseResume: "fluid.tests.textToSpeech.supportsPauseResumeTests"
        }
    });

    fluid.tests.textToSpeech.contextAwareTestRunner();

})();
