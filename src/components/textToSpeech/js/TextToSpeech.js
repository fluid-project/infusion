/*
Copyright 2015-2018 OCAD University

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

    /*********************************************************************************************
     * fluid.window is a singleton component to be used for registering event bindings to        *
     * events fired by the window object                                                         *
     *********************************************************************************************/

    fluid.defaults("fluid.window", {
        gradeNames: ["fluid.component", "fluid.resolveRootSingle"],
        singleRootType: "fluid.window",
        members: {
            window: window
        },
        listeners: {
            "onCreate.bindEvents": {
                funcName: "fluid.window.bindEvents",
                args: ["{that}"]
            }
        }
    });

    /**
    * Adds a lister to a window event for each event defined on the component.
    * The name must match a valid window event.
    *
    * @param {Component} that - the component itself
    */
    fluid.window.bindEvents = function (that) {
        fluid.each(that.options.events, function (type, eventName) {
            window.addEventListener(eventName, that.events[eventName].fire);
        });
    };

    /*********************************************************************************************
     * fluid.textToSpeech provides a wrapper around the SpeechSynthesis Interface                *
     * from the Web Speech API ( https://w3c.github.io/speech-api/speechapi.html#tts-section )   *
     *********************************************************************************************/

    fluid.registerNamespace("fluid.textToSpeech");

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
            fluid.invokeLater(promise.reject);
        }
        return promise;
    };

    /*********************************************************************************************
     * fluid.textToSpeech component
     *********************************************************************************************/

    fluid.defaults("fluid.textToSpeech", {
        gradeNames: ["fluid.modelComponent", "fluid.resolveRootSingle"],
        singleRootType: "fluid.textToSpeech",
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
        components: {
            wndw: {
                type: "fluid.window",
                options: {
                    events: {
                        beforeunload: null
                    }
                }
            }
        },
        dynamicComponents: {
            utterance: {
                type: "fluid.textToSpeech.utterance",
                createOnEvent: "onSpeechQueued",
                options: {
                    listeners: {
                        "onBoundary.relay": "{textToSpeech}.events.utteranceOnBoundary.fire",
                        "onEnd.relay": "{textToSpeech}.events.utteranceOnEnd.fire",
                        "onError.relay": "{textToSpeech}.events.utteranceOnError.fire",
                        "onMark.relay": "{textToSpeech}.events.utteranceOnMark.fire",
                        "onPause.relay": "{textToSpeech}.events.utteranceOnPause.fire",
                        "onResume.relay": "{textToSpeech}.events.utteranceOnResume.fire",
                        "onStart.relay": "{textToSpeech}.events.utteranceOnStart.fire",
                        "onCreate.queue": {
                            "this": "{fluid.textToSpeech}.queue",
                            method: "push",
                            args: ["{that}"]
                        },
                        "onEnd.destroy": {
                            func: "{that}.destroy",
                            priority: "last"
                        }
                    },
                    utterance: "{arguments}.0"
                }
            }
        },
        // Model paths: speaking, pending, paused, utteranceOpts, pauseRequested, resumeRequested
        model: {
            // Changes to the utteranceOpts will only affect text that is queued after the change.
            // All of these options can be overridden in the queueSpeech method by passing in
            // options directly there. It is useful in cases where a single instance needs to be
            // spoken with different options (e.g. single text in a different language.)
            utteranceOpts: {
                // text: "", // text to synthesize. Avoid using, it will be overwritten by text passed in directly to a queueSpeech
                // lang: "", // the language of the synthesized text
                // voice: {} // a WebSpeechSynthesis object; if not set, will use the default one provided by the browser
                // volume: 1, // a Floating point number between 0 and 1
                // rate: 1, // a Floating point number from 0.1 to 10 although different synthesizers may have a smaller range
                // pitch: 1, // a Floating point number from 0 to 2
            }
        },
        modelListeners: {
            "speaking": {
                listener: "fluid.textToSpeech.toggleSpeak",
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
                func: "{that}.invokeSpeechSynthesisFunc",
                args: ["getVoices"]
            },
            speak: {
                func: "{that}.invokeSpeechSynthesisFunc",
                args: ["speak", "{that}.queue.0.utterance"]
            },
            invokeSpeechSynthesisFunc: "fluid.textToSpeech.invokeSpeechSynthesisFunc"
        },
        listeners: {
            "onSpeechQueued.speak": {
                func: "{that}.speak",
                priority: "last"
            },
            "utteranceOnStart.speaking": {
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
            "onDestroy.cleanup": {
                func: "{that}.invokeSpeechSynthesisFunc",
                args: ["cancel"]
            },
            "{wndw}.events.beforeunload": {
                funcName: "{that}.invokeSpeechSynthesisFunc",
                args: ["cancel"],
                namespace: "cancelSpeechSynthesisOnUnload"
            }
        }
    });

    /**
     * Wraps the SpeechSynthesis API
     *
     * @param {String} method - a SpeechSynthesis method name
     * @param {Array} args - arguments to call the method with. If args isn't an array, it will be added as the first
     *                       element of one.
     */
    fluid.textToSpeech.invokeSpeechSynthesisFunc = function (method, args) {
        args = fluid.makeArray(args);
        speechSynthesis[method].apply(speechSynthesis, args);
    };

    fluid.textToSpeech.toggleSpeak = function (that, speaking) {
        that.events[speaking ? "onStart" : "onStop"].fire();
    };

    fluid.textToSpeech.requestControl = function (that, control, change) {
        // If there's a control request (value change to true), clear and
        // execute it
        if (change.value) {
            that.applier.change(change.path, false, "ADD", "requestControl");
            that.invokeSpeechSynthesisFunc(control);
        }
    };

    /*
     * After an utterance has finished, the utterance is removed from the queue and the model is updated as needed.
     */
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

    /**
     * Options to configure the SpeechSynthesis Utterance with.
     * See: https://w3c.github.io/speech-api/speechapi.html#utterance-attributes
     *  {
     *      text: "", // the text to Synthesize
     *      lang: "", // the language of the synthesized text
     *      voice: {} // a WebSpeechSynthesis object; if not set, will use the default one provided by the browser
     *      volume: 1, // a Floating point number between 0 and 1
     *      rate: 1, // a Floating point number from 0.1 to 10 although different synthesizers may have a smaller range
     *      pitch: 1, // a Floating point number from 0 to 2
     *   }
     *
     * @typedef {Object} UtteranceOpts
     */

    /**
     * Assembles the utterance options and fires onSpeechQueued which will kick off the creation of an utterance
     * component. If "interrupt" is true, this utterance will replace any existing ones.
     *
     * @param {Component} that - the component
     * @param {String} text - the text to be synthesized
     * @param {Boolean} interrupt - used to indicate if this text should be queued or replace existing utterances
     * @param {UtteranceOpts} options - options to configure the SpeechSynthesis utterance with. It is merged on top of the
     *                           utteranceOpts from the component's model.
     *
     * @return {Promise} - returns a promise that is resolved after the onSpeechQueued event has fired.
     */
    fluid.textToSpeech.queueSpeech = function (that, text, interrupt, options) {
        var promise = fluid.promise();
        if (interrupt) {
            that.cancel();
        }

        var utteranceOpts = $.extend({}, that.model.utteranceOpts, options, {text: text});

        // The setTimeout is needed for Safari to fully cancel out the previous speech.
        // Without this the synthesizer gets confused and may play multiple utterances at once.
        setTimeout(function () {
            that.events.onSpeechQueued.fire(utteranceOpts, interrupt);
            promise.resolve(text);
        }, 100);
        return promise;
    };

    fluid.textToSpeech.cancel = function (that) {
        // Safari does not fire the onend event from an utterance when the speech synthesis is cancelled.
        // Manually triggering the onEnd event for each utterance as we empty the queue, before calling cancel.
        while (that.queue.length) {
            var utterance = that.queue.shift();
            utterance.events.onEnd.fire();
        }

        that.invokeSpeechSynthesisFunc("cancel");
        // clear any paused state.
        that.invokeSpeechSynthesisFunc("resume");
    };

    /*********************************************************************************************
     * fluid.textToSpeech.utterance component
     *********************************************************************************************/

    fluid.defaults("fluid.textToSpeech.utterance", {
        gradeNames: ["fluid.modelComponent"],
        members: {
            utterance: {
                expander: {
                    funcName: "fluid.textToSpeech.utterance.construct",
                    args: ["{that}", "{that}.options.utteranceEventMap", "{that}.options.utterance"]
                }
            }
        },
        model: {
            boundary: 0
        },
        utterance: {
            // text: "", // text to synthesize. avoid as it will override any other text passed in
            // lang: "", // the language of the synthesized text
            // voice: {} // a WebSpeechSynthesis object; if not set, will use the default one provided by the browser
            // volume: 1, // a Floating point number between 0 and 1
            // rate: 1, // a Floating point number from 0.1 to 10 although different synthesizers may have a smaller range
            // pitch: 1, // a Floating point number from 0 to 2
        },
        utteranceEventMap: {
            onboundary: "onBoundary",
            onend: "onEnd",
            onerror: "onError",
            onmark: "onMark",
            onpause: "onPause",
            onresume: "onResume",
            onstart: "onStart"
        },
        events: {
            onBoundary: null,
            onEnd: null,
            onError: null,
            onMark: null,
            onPause: null,
            onResume: null,
            onStart: null
        },
        listeners: {
            "onBoundary.updateModel": {
                changePath: "boundary",
                value: "{arguments}.0.charIndex"
            }
        }
    });

    /**
     * Creates a SpeechSynthesisUtterance instance and configures it with the utteranceOpts and utteranceMap. For any
     * event provided in the utteranceEventMap, any corresponding event binding passed in directly through the
     * utteranceOpts will be rebound as component event listeners with the "external" namespace.
     *
     * @param {Component} that - the component
     * @param {Object} utteranceEventMap - a mapping from SpeechSynthesisUtterance events to component events.
     * @param {UtteranceOpts} utteranceOpts - options to configure the SpeechSynthesis utterance with.
     *
     * @return {SpeechSynthesisUtterance} - returns the created SpeechSynthesisUtterance object
     */
    fluid.textToSpeech.utterance.construct = function (that, utteranceEventMap, utteranceOpts) {
        var utterance = new SpeechSynthesisUtterance();
        $.extend(utterance, utteranceOpts);

        fluid.each(utteranceEventMap, function (compEventName, utteranceEvent) {
            var compEvent = that.events[compEventName];
            var origHandler = utteranceOpts[utteranceEvent];

            utterance[utteranceEvent] = compEvent.fire;

            if (origHandler) {
                compEvent.addListener(origHandler, "external");
            }
        });

        return utterance;
    };


})(jQuery, fluid_3_0_0);
