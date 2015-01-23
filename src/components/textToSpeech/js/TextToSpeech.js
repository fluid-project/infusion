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

    fluid.textToSpeech.isSupported = function () {
        return !!(window && window.speechSynthesis);
    };

    fluid.defaults("fluid.textToSpeech", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            start: null,
            end: null,
            error: null,
            pause: null,
            resume: null,
            mark: null,
            boundary: null
        },
        utteranceOpts: {
            // text: "", // text to synthesize. avoid as it will override any other text passed in
            // lang: "", // the language of the synthesized text
            // voiceURI: "" // a uri pointing at a voice synthesizer to use. If not set, will use the default one provided by the browser
            // volume: 1, // a value between 0 and 1
            // rate: 1, // a value from 0.1 to 10 although different synthesizers may have a smaller range
            // pitch: 1, // a value from 0 to 2
        },
        utteranceEventBinding: {
            onstart: "{that}.events.start.fire",
            onend: "{that}.events.end.fire",
            onerror: "{that}.events.error.fire",
            onpause: "{that}.events.pause.fire",
            onresume: "{that}.events.resume.fire",
            onmark: "{that}.events.mark.fire",
            onboundary: "{that}.events.boundary.fire"
        },
        invokers: {
            speak: {
                funcName: "fluid.textToSpeech.speak",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            cancel: {
                "this": "speechSynthesis",
                "method": "cancel"
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
            isPending: {
                funcName: "fluid.textToSpeech.getSpeechAttr",
                args: ["pending"]
            },
            isSpeaking: {
                funcName: "fluid.textToSpeech.getSpeechAttr",
                args: ["speaking"]
            },
            isPaused: {
                funcName: "fluid.textToSpeech.getSpeechAttr",
                args: ["paused"]
            }
        }
    });

    fluid.textToSpeech.speak = function (that, text, interupt, options) {
        if (interupt) {
            that.cancel();
        }

        var toSpeak = new SpeechSynthesisUtterance(text);
        $.extend(toSpeak, that.options.utteranceOpts, options, that.options.utteranceEventBinding);

        speechSynthesis.speak(toSpeak);
    };

    fluid.textToSpeech.getSpeechAttr = function (attrName) {
        return speechSynthesis[attrName];
    };

})(jQuery, fluid_2_0);
