/*
Copyright 2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

/* global fluid */

(function () {
    "use strict";

    // Mocks the fluid.textToSpeech component, removing calls to the
    // Web Speech API. This will allow for tests to run in browsers
    // that don't support the Web Speech API.
    fluid.defaults("fluid.mock.textToSpeech", {
        gradeNames: ["fluid.textToSpeech"],
        members: {
            // An archive of all the calls to queueSpeech.
            // Will contain an ordered set of objects -- {text: String, options: Object}.
            speechRecord: [],
            // An archive of all the events fired
            // Will contain a key/value pairing where key is the name of the event and the
            // value is the number of times the event was fired.
            eventRecord: {}
        },
        listeners: {
            "onStart.recordEvent": {
                listener: "{that}.recordEvent",
                args: ["onStart"]
            },
            "onStop.recordEvent": {
                listener: "{that}.recordEvent",
                args: ["onStop"]
            },
            "onSpeechQueued.recordEvent": {
                listener: "{that}.recordEvent",
                args: ["onSpeechQueued"]
            },
            "onCreate.unloadCleanup": {
                funcName: "fluid.identity"
            },
            "onDestroy.cleanup": {
                funcName: "fluid.identity"
            }
        },
        invokers: {
            queueSpeech: {
                funcName: "fluid.mock.textToSpeech.queueSpeech",
                args: ["{that}", "{that}.speechRecord", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            cancel: {
                funcName: "fluid.mock.textToSpeech.cancel",
                args: ["{that}"]
            },
            getVoices: {
                funcName: "fluid.identity",
                args: []
            },
            recordEvent: {
                funcName: "fluid.mock.textToSpeech.recordEvent",
                args: ["{that}.eventRecord", "{arguments}.0"]
            }
        }
    });

    fluid.mock.textToSpeech.queueSpeech = function (that, speechRecord, text, interrupt, options) {
        if (interrupt) {
            that.cancel();
        }

        var record = {
            text: text,
            interrupt: !!interrupt
        };

        if (options) {
            record.options = options;
        }

        speechRecord.push(record);

        that.queue.push(text);
        that.events.onSpeechQueued.fire(text);

        // mocking speechSynthesis speak
        that.events.utteranceOnStart.fire();
        // using setTimeout to preserve asynchronous behaviour
        setTimeout(that.events.utteranceOnEnd.fire, 0);

    };

    fluid.mock.textToSpeech.cancel = function (that) {
        that.queue = [];
        that.events.utteranceOnEnd.fire();
    };

    fluid.mock.textToSpeech.recordEvent = function (eventRecord, name) {
        eventRecord[name] = (eventRecord[name] || 0) + 1;
    };

})();
