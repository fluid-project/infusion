/*
Copyright 2013-2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * speak
     *
     * An enactor that is capable of speaking text.
     * Typically this will be used as a base grade to an enactor that supplies
     * the text to be spoken.
     *******************************************************************************/

    fluid.defaults("fluid.prefs.enactor.speakEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "fluid.prefs.speak": {
                "model.value": "default"
            }
        },
        model: {
            value: false
        },
        modelListeners: {
            "value": "{that}.handleSelfVoicing"
        },
        events: {
            onStart: null,
            onStop: null,
            onPause: null,
            onResume: null,
            onError: null
        },
        components: {
            tts: {
                type: "fluid.textToSpeech",
                options: {
                    listeners: {
                        "onCreate.clear": "{that}.cancel",
                        "start.hoist": "{speakEnactor}.events.onStart",
                        "end.hoist": "{speakEnactor}.events.onStop",
                        "pause.hoist": "{speakEnactor}.events.onPause",
                        "resume.hoist": "{speakEnactor}.events.onResume",
                        "error.hoist": "{speakEnactor}.events.onError"
                    }
                }
            }
        },
        invokers: {
            announce: {
                funcName: "fluid.prefs.enactor.speakEnactor.announce",
                args: ["{that}", "{arguments}.0", "{tts}.speak"]
            },
            stop: "{tts}.cancel",
            pause: "{tts}.pause",
            resume: "{tts}.resume"
        },
        strings: {
            loaded: "text to speech enabled"
        },
        voiceOpts: {},
        distributeOptions: {
            source: "{that}.options.voiceOpts",
            target: "{that > fluid.textToSpeech}.options.utteranceOpts"
        }
    });


    fluid.prefs.enactor.speakEnactor.announce = function (that, text, speakFn) {
        // force a string value
        var str = text.toString();

        // remove extra whitespace
        str = str.trim();
        str.replace(/\s{2,}/gi, " ");

        if (that.model.value && str) {
            speakFn(str);
        }
    };

    /*******************************************************************************
     * selfVoicing
     *
     * The enactor that enables self voicing of an entire page
     *******************************************************************************/

    fluid.defaults("fluid.prefs.enactor.selfVoicing", {
        gradeNames: ["fluid.prefs.enactor.speakEnactor", "autoInit"],
        modelListeners: {
            "value": "{that}.handleSelfVoicing"
        },
        invokers: {
            handleSelfVoicing: {
                funcName: "fluid.prefs.enactor.selfVoicing.handleSelfVoicing",
                args: "{that}"
            },
            readFromDOM: {
                funcName: "fluid.prefs.enactor.selfVoicing.readFromDOM",
                args: ["{that}", "{that}.container"]
            }
        },
        strings: {
            welcomeMsg: "text to speech enabled"
        }
    });

    fluid.prefs.enactor.selfVoicing.handleSelfVoicing = function (that) {
        if (that.model.value) {
            that.announce(that.options.strings.welcomeMsg);
            that.readFromDOM();
        } else {
            that.stop();
        }
    };

    // Constants representing DOM node types.
    fluid.prefs.enactor.selfVoicing.nodeType = {
        ELEMENT_NODE: 1,
        TEXT_NODE: 3
    };

    fluid.prefs.enactor.selfVoicing.readFromDOM = function (that, elm) {
        elm = $(elm);
        var nodes = elm.contents();
        fluid.each(nodes, function (node) {
            if (node.nodeType === fluid.prefs.enactor.selfVoicing.nodeType.TEXT_NODE && node.nodeValue) {
                that.announce(node.nodeValue);
            }

            if (node.nodeType === fluid.prefs.enactor.selfVoicing.nodeType.ELEMENT_NODE && window.getComputedStyle(node).display !== "none") {
                if (node.nodeName === "IMG") {
                    var altText = node.getAttribute("alt");
                    if (altText) {
                        that.announce(altText);
                    }
                } else {
                    fluid.prefs.enactor.selfVoicing.readFromDOM(that, node);
                }
            }
        });
    };

})(jQuery, fluid_2_0);
