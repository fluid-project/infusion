/*
Copyright 2015-2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

/* global speechSynthesis, SpeechSynthesisUtterance*/

var fluid_3_0_0 = fluid_3_0_0 || {};

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
     * @param {Number} delay - A time in milliseconds to wait for the speechSynthesis to fire its onStart event
     * by default it is 5000ms (5s). This is crux of the test, as it needs time to attempt to run the speechSynthesis.
     * @return {fluid.promise} - A promise which will resolve if the TTS is supported (the onstart event is fired within the delay period)
     * or be rejected otherwise.
     */
    fluid.textToSpeech.checkTTSSupport = function (delay) {
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
            setTimeout(promise.reject, 0);
        }
        return promise;
    };


    fluid.defaults("fluid.textToSpeech", {
        gradeNames: ["fluid.modelComponent"],
        events: {
            onStart: null,
            onStop: null,
            onError: null,
            onSpeechQueued: null,
            utteranceOnBoundary: null,
            utteranceOnEnd: null,
            utteranceOnError: null,
            utteranceOnMark: null,
            utteranceOnPause: null,
            utteranceOnResume: null,
            utteranceOnStart: null
        },
        members: {
            queue: []
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
            },
            "pauseRequested": {
                listener: "fluid.textToSpeech.requestControl",
                args: ["{that}", "pause", "{change}"]
            },
            "resumeRequested": {
                listener: "fluid.textToSpeech.requestControl",
                args: ["{that}", "resume", "{change}"]
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
                changePath: "pauseRequested",
                value: true,
                source: "pause"
            },
            resume: {
                changePath: "resumeRequested",
                value: true,
                source: "resume"
            },
            getVoices: {
                funcName: "fluid.textToSpeech.invokeSpeechSynthesisFunc",
                args: ["getVoices"]
            }
        },
        listeners: {
            "utteranceOnStart.speak": {
                changePath: "speaking",
                value: true,
                source: "utteranceOnStart"
            },
            "utteranceOnEnd.stop": {
                funcName: "fluid.textToSpeech.handleEnd",
                args: ["{that}"]
            },
            "utteranceOnError.forward": "{that}.events.onError",
            "utteranceOnPause.pause": {
                changePath: "paused",
                value: true,
                source: "utteranceOnPause"
            },
            "utteranceOnResume.resume": {
                changePath: "paused",
                value: false,
                source: "utteranceOnResume"
            },
            "onCreate.unloadCleanup": {
                funcName: "fluid.textToSpeech.cleanupOnUnload"
            },
            "onDestroy.cleanup": {
                funcName: "fluid.textToSpeech.invokeSpeechSynthesisFunc",
                args: ["cancel"]
            }
        }
    });

    // Cancel all synthesis when a page is unloaded.
    // This is necessary so that the speech synthesis stops when navigating to a new page and so that paused
    // speaking doesn't prevent new self voicing after a page reload.
    fluid.textToSpeech.cleanupOnUnload = function () {
        window.onbeforeunload = function () {
            fluid.textToSpeech.invokeSpeechSynthesisFunc("cancel");
        };
    };

    fluid.textToSpeech.invokeSpeechSynthesisFunc = function (control, args) {
        args = fluid.makeArray(args);
        speechSynthesis[control].apply(speechSynthesis, args);
    };

    fluid.textToSpeech.speak = function (that, speaking) {
        that.events[speaking ? "onStart" : "onStop"].fire();
    };

    fluid.textToSpeech.requestControl = function (that, control, change) {
        // If there's a control request (value change to true), clear and
        // execute it
        if (change.value) {
            that.applier.change(change.path, false, "ADD", "requestControl");
            fluid.textToSpeech.invokeSpeechSynthesisFunc(control);
        }
    };

    fluid.textToSpeech.handleEnd = function (that) {

        that.queue.shift();

        var resetValues = {
            speaking: false,
            pending: false,
            paused: false
        };

        if (that.queue.length) {
            that.applier.change("pending", true, "ADD", "handleEnd.pending");
        } else if (!that.queue.length) {
            var newModel = $.extend({}, that.model, resetValues);
            that.applier.change("", newModel, "ADD", "handleEnd.reset");
        }
    };

    fluid.textToSpeech.queueSpeech = function (that, text, interrupt, options) {
        if (interrupt) {
            that.cancel();
        }

        var toSpeak = new SpeechSynthesisUtterance(text);


        var eventBinding = {
            onboundary: that.events.utteranceOnBoundary.fire,
            onend: that.events.utteranceOnEnd.fire,
            onerror: that.events.utteranceOnError.fire,
            onmark:that.events.utteranceOnMark.fire,
            onpause: that.events.utteranceOnPause.fire,
            onresume: that.events.utteranceOnResume.fire,
            onstart: that.events.utteranceOnStart.fire
        };
        $.extend(toSpeak, that.model.utteranceOpts, options, eventBinding);

        // Store toSpeak additionally on the queue to help deal
        // with premature garbage collection described at https://bugs.chromium.org/p/chromium/issues/detail?id=509488#c11
        // this makes the speech synthesis behave much better in Safari in
        // particular
        that.queue.push({text: text, utterance: toSpeak});

        that.events.onSpeechQueued.fire(text);
        fluid.textToSpeech.invokeSpeechSynthesisFunc("speak", toSpeak);
    };

    fluid.textToSpeech.cancel = function (that) {
        that.queue = [];
        fluid.textToSpeech.invokeSpeechSynthesisFunc("cancel");
    };

})(jQuery, fluid_3_0_0);
