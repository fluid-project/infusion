/*
Copyright 2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global speechSynthesis, SpeechSynthesisUtterance*/

var fluid_2_0_0 = fluid_2_0_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.textToSpeech");

    /******************************************************************************************* *
     * fluid.textToSpeech provides a wrapper around the SpeechSynthesis Interface                *
     * from the Web Speech API ( https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html ) *
     *********************************************************************************************/

    fluid.textToSpeech.isSupported = function () {
        return !!(window && window.speechSynthesis);
    };

    /**
     * Ensures that TTS is supported in the browser, including cases where the
     * feature is detected, but where the underlying audio engine is missing.
     * For example in VMs on SauceLabs, the behaviour for browsers which report that the speechSynthesis
     * API is implemented is for the `onstart` event of an utterance to never fire. If we don't receive this
     * event within a timeout, this API's behaviour is to return a promise which rejects.
     *
     * @param delay {Number} A time in milliseconds to wait for the speechSynthesis to fire its onStart event
     * by default it is 1000ms (1s). This is crux of the test, as it needs time to attempt to run the speechSynthesis.
     * @return {fluid.promise} A promise which will resolve if the TTS is supported (the onstart event is fired within the delay period)
     * or be rejected otherwise.
     */
    fluid.textToSpeech.checkTTSSupport = function (delay) {
        var promise = fluid.promise();
        if (fluid.textToSpeech.isSupported()) {
            var toSpeak = new SpeechSynthesisUtterance(" "); // short text to attempt to speak
            toSpeak.volume = 0; // mutes the Speech Synthesizer
            var timeout = setTimeout(function () {
                fluid.textToSpeech.asyncSpeechSynthesisControl("cancel", 10);
                promise.reject();
            }, delay || 1000);
            toSpeak.onend = function () {
                clearTimeout(timeout);
                fluid.textToSpeech.asyncSpeechSynthesisControl("cancel", 10);
                promise.resolve();
            };
            fluid.textToSpeech.asyncSpeechSynthesisControl("speak", 10, toSpeak);
        } else {
            setTimeout(promise.reject, 0);
        }
        return promise;
    };


    fluid.defaults("fluid.textToSpeech", {
        gradeNames: ["fluid.modelComponent"],
        events: {
            onStart: null,
            onStop: null,
            onPause: null,
            onResume: null,
            onError: null,
            onSpeechQueued: null
        },
        members: {
            queue: {
                texts: [],
                currentUtterance: {}
            }
        },
        // Model paths: speaking, pending, paused, utteranceOpts, pauseRequested, resumeRequested
        model: {
            // Changes to the utteranceOpts will only text that is queued after the change.
            // All of these options can be overriden in the queueSpeech method by passing in
            // options directly there. It is useful in cases where a single instance needs to be
            // spoken with different options (e.g. single text in a different language.)
            utteranceOpts: {
                // text: "", // text to synthesize. avoid as it will override any other text passed in
                // lang: "", // the language of the synthesized text
                // voice: {} // a WebSpeechSynthesis object; if not set, will use the default one provided by the browser
                // volume: 1, // a value between 0 and 1
                // rate: 1, // a value from 0.1 to 10 although different synthesizers may have a smaller range
                // pitch: 1, // a value from 0 to 2
            }
        },
        modelListeners: {
            "speaking": {
                listener: "fluid.textToSpeech.speak",
                args: ["{that}", "{change}.value"]
            }
        },
        invokers: {
            queueSpeech: {
                funcName: "fluid.textToSpeech.queueSpeech",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            cancel: {
                funcName: "fluid.textToSpeech.cancel",
                args: ["{that}"]
            },
            pause: {
                funcName: "fluid.textToSpeech.issueControlRequest",
                args: ["{that}", "pauseRequested", "pause", false]
            },
            resume: {
                funcName: "fluid.textToSpeech.issueControlRequest",
                args: ["{that}", "resumeRequested", "resume", true]
            },
            getVoices: {
                "this": "speechSynthesis",
                "method": "getVoices"
            },
            handleStart: {
                funcName: "fluid.textToSpeech.handleStart",
                args: ["{that}"]
            },
            // The handleEnd method is assumed to be triggered asynchronously
            // as it is processed/triggered by the mechanism voicing the utterance.
            handleEnd: {
                funcName: "fluid.textToSpeech.handleEnd",
                args: ["{that}"]
            },
            handleError: "{that}.events.onError.fire",
            handlePause: {
                funcName: "fluid.textToSpeech.handlePause",
                args: ["{that}"]
            },
            handleResume: {
                funcName: "fluid.textToSpeech.handleResume",
                args: ["{that}"]
            }
        }
    });

    // Issue commands to the speechSynthesis interface after a delay; this
    // makes the wrapper behave somewhat better when issuing commands, especially
    // play and pause
    fluid.textToSpeech.asyncSpeechSynthesisControl = function (control, delay, args) {
        setTimeout(function () {
            speechSynthesis[control](args);
        }, delay);
    };

    fluid.textToSpeech.speak = function (that, speaking) {
        that.events[speaking ? "onStart" : "onStop"].fire();
    };

    fluid.textToSpeech.handlePause = function (that) {
        that.applier.change("paused", true);
        that.events.onPause.fire();
        // Clear to issue any waiting resume command
        fluid.textToSpeech.clearControlRequest(that, "resumeRequested", "resume");
    };

    fluid.textToSpeech.handleResume = function (that) {
        that.applier.change("paused", false);
        that.events.onResume.fire();
        // Clear to issue any waiting pause command
        fluid.textToSpeech.clearControlRequest(that, "pauseRequested", "pause");
    };

    fluid.textToSpeech.clearControlRequest = function (that, modelBoolPath, controlName) {
        if (fluid.get(that.model, modelBoolPath)) {
            that.applier.change(modelBoolPath, false);
            fluid.textToSpeech.asyncSpeechSynthesisControl(controlName, 10);
        }
    };

    fluid.textToSpeech.issueControlRequest = function (that, modelBoolPath, controlName, invert) {
        if (invert ? !that.model.paused : that.model.paused) {
            that.applier.change(modelBoolPath, true);
        } else {
            fluid.textToSpeech.asyncSpeechSynthesisControl(controlName, 10);
        }
    };

    fluid.textToSpeech.handleStart = function (that) {
        that.queue.texts.shift();
        that.applier.change("speaking", true);

        if (that.queue.texts.length) {
            that.applier.change("pending", true);
        }
    };

    fluid.textToSpeech.handleEnd = function (that) {
        var resetValues = {
            speaking: false,
            pending: false,
            paused: false
        };

        if (!that.queue.texts.length) {
            var newModel = $.extend({}, that.model, resetValues);
            that.applier.change("", newModel);
        }
    };

    fluid.textToSpeech.queueSpeech = function (that, text, interrupt, options) {
        if (interrupt) {
            that.cancel();
        }

        var errorFn = function () {
            that.handleError(text);
        };

        var toSpeak = new SpeechSynthesisUtterance(text);
        // Store toSpeak additionally on the queue.currentUtterance member to help deal with the issue
        // with premature garbage collection described at https://bugs.chromium.org/p/chromium/issues/detail?id=509488#c11
        // this makes the speech synthesis behave much better in Safari in
        // particular
        that.queue.currentUtterance = toSpeak;

        var eventBinding = {
            onstart: that.handleStart,
            onend: that.handleEnd,
            onerror: errorFn,
            onpause: that.handlePause,
            onresume: that.handleResume
        };
        $.extend(toSpeak, that.model.utteranceOpts, options, eventBinding);

        that.queue.texts.push(text);
        that.events.onSpeechQueued.fire(text);
        fluid.textToSpeech.asyncSpeechSynthesisControl("speak", 10, toSpeak);
    };

    fluid.textToSpeech.cancel = function (that) {
        that.queue.texts = [];
        fluid.textToSpeech.asyncSpeechSynthesisControl("cancel", 10);
    };

})(jQuery, fluid_2_0_0);
