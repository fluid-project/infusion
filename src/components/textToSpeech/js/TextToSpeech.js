/*
Copyright 2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global speechSynthesis, SpeechSynthesisUtterance*/

var fluid_2_0 = fluid_2_0 || {};

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

    fluid.defaults("fluid.textToSpeech", {
        gradeNames: ["fluid.standardComponent", "autoInit"],
        events: {
            onStart: null,
            onStop: null,
            onPause: null,
            onResume: null,
            onError: null,
            onSpeechQueued: null
        },
        members: {
            queue: []
        },
        model: {
            speaking: false,
            pending: false,
            paused: false
        },
        utteranceOpts: {
            // text: "", // text to synthesize. avoid as it will override any other text passed in
            // lang: "", // the language of the synthesized text
            // voiceURI: "" // a uri pointing at a voice synthesizer to use. If not set, will use the default one provided by the browser
            // volume: 1, // a value between 0 and 1
            // rate: 1, // a value from 0.1 to 10 although different synthesizers may have a smaller range
            // pitch: 1, // a value from 0 to 2
        },
        // TODO: When this is updated to be a model relay component,
        // remove this manual relaying of modelListeners to listeners
        // in favour of having integrators use the modelListeners directly.
        // This system is currently setup because when the entire model
        // is changed in a single operation, the change value is the entire
        // model instead of just the value of the registered path.
        modelListeners: {
            "speaking": {
                listener: "fluid.textToSpeech.relaySpeaking",
                args: ["{that}"]
            },
            "paused": {
                listener: "fluid.textToSpeech.relayPaused",
                args: ["{that}"]
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
                "this": "speechSynthesis",
                "method": "pause"
            },
            resume: {
                "this": "speechSynthesis",
                "method": "resume"
            },
            getVoices: {
                "this": "speechSynthesis",
                "method": "getVoices"
            },
            handleStart: {
                funcName: "fluid.textToSpeech.handleStart",
                args: ["{that}"]
            },
            handleEnd: {
                funcName: "fluid.textToSpeech.handleEnd",
                args: ["{that}"]
            },
            handleError: "{that}.events.onError.fire",
            handlePause: {
                changePath: "paused",
                value: true
            },
            handleResume: {
                changePath: "paused",
                value: false
            }
        }
    });

    fluid.textToSpeech.relaySpeaking = function (that) {
        if (that.model.speaking) {
            that.events.onStart.fire();
        } else {
            that.events.onStop.fire();
        }
    };

    fluid.textToSpeech.relayPaused = function (that) {
        if (that.model.paused) {
            that.events.onPause.fire();
        } else if (that.model.speaking) {
            that.events.onResume.fire();
        }
    };

    fluid.textToSpeech.handleStart = function (that) {
        that.queue.shift();
        that.applier.change("speaking", true);

        if (that.queue.length) {
            that.applier.change("pending", true);
        }
    };

    fluid.textToSpeech.handleEnd = function (that) {
        var resetValues = {
            speaking: false,
            pending: false,
            paused: false
        };

        if (!that.queue.length) {
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
        var eventBinding = {
            onstart: that.handleStart,
            onend: that.handleEnd,
            onerror: errorFn,
            onpause: that.handlePause,
            onresume: that.handleResume
        };
        $.extend(toSpeak, that.options.utteranceOpts, options, eventBinding);

        that.queue.push(toSpeak);
        that.events.onSpeechQueued.fire(text);
        speechSynthesis.speak(toSpeak);
    };

    fluid.textToSpeech.cancel = function (that) {
        that.queue = [];
        speechSynthesis.cancel();
    };

})(jQuery, fluid_2_0);
