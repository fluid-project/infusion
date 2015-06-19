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
    // Web Speech API. This will, amongst other things, remove asynchrony
    // and allow for tests to run in browsers that don't support the
    // Web Speech API.
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
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
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

    fluid.mock.textToSpeech.queueSpeech = function (that, text, interrupt, options) {
        if (interrupt) {
            that.cancel();
        }

        that.speechRecord.push({
            text: text,
            interrupt: interrupt,
            options: options
        });

        that.queue.push(text);
        that.events.onSpeechQueued.fire(text);

        // mocking speechSynthesis speak
        that.handleStart();
        that.handleEnd();

    };

    fluid.mock.textToSpeech.cancel = function (that, handleEnd) {
        that.queue = [];
        handleEnd();
    };

})();
