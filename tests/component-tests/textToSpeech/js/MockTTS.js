/*
Copyright 2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

*/

// Declare dependencies
/* global fluid */

(function () {
    "use strict";

    // Mocks the fluid.textToSpeech component, removing calls to the
    // Web Speech API. This will allow for tests to run in browsers
    // that don't support the Web Speech API.
    fluid.defaults("fluid.mock.textToSpeech", {
        gradeNames: ["fluid.textToSpeech", "autoInit"],
        members: {
            // an archive of all the calls to queueSpeech
            // will contain an ordered set of objects -- {text: String, options: Object}
            speechRecord: []
        },
        invokers: {
            queueSpeech: {
                funcName: "fluid.mock.textToSpeech.queueSpeech",
                args: ["{that}", "{that}.handleStart", "{that}.handleEnd", "{that}.speechRecord", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            },
            cancel: {
                funcName: "fluid.mock.textToSpeech.cancel",
                args: ["{that}", "{that}.handleEnd"]
            },
            pause: {
                "this": null,
                "method": null,
                listener: "{that}.events.onPause.fire"
            },
            resume: {
                "this": null,
                "method": null,
                listener: "{that}.events.onResume.fire"
            },
            getVoices: {
                "this": null,
                "method": null,
                listener: "fluid.identity",
                args: []
            }
        }
    });

    fluid.mock.textToSpeech.queueSpeech = function (that, handleStart, handleEnd, speechRecord, text, interrupt, options) {
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
        handleStart();
        // using setTimeout to preserve asynchronous behaviour
        setTimeout(handleEnd, 0);

    };

    fluid.mock.textToSpeech.cancel = function (that, handleEnd) {
        that.queue = [];
        handleEnd();
    };

})();
