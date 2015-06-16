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
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
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
        // Model paths: speaking, pending, paused, utteranceOpts
        model: {
            // Changes to the utteranceOpts will only text that is queued after the change.
            // All of these options can be overriden in the queueSpeech method by passing in
            // options directly there. It is useful in cases where a single instance needs to be
            // spoken with different options (e.g. single text in a different language.)
            utteranceOpts: {
                // text: "", // text to synthesize. avoid as it will override any other text passed in
                // lang: "", // the language of the synthesized text
                // voiceURI: "" // a uri pointing at a voice synthesizer to use. If not set, will use the default one provided by the browser
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
            "paused": {
                listener: "fluid.textToSpeech.pause",
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

    fluid.textToSpeech.speak = function (that, speaking) {
        that.events[speaking ? "onStart" : "onStop"].fire();
    };

    fluid.textToSpeech.pause = function (that, paused) {
        if (paused) {
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
        $.extend(toSpeak, that.model.utteranceOpts, options, eventBinding);

        that.queue.push(text);
        that.events.onSpeechQueued.fire(text);
        speechSynthesis.speak(toSpeak);
    };

    fluid.textToSpeech.cancel = function (that) {
        that.queue = [];
        speechSynthesis.cancel();
    };

})(jQuery, fluid_2_0);
