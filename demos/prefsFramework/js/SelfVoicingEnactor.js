/*
Copyright 2013-2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid */

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * selfVoicing
     *
     * The enactor that enables self voicing in the user interface options.
     *******************************************************************************/

    fluid.defaults("demo.prefsEditor.speakEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "demo.prefs.speak": {
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
            afterAnnounce: null,
            onError: null
        },
        components: {
            tts: {
                type: "fluid.textToSpeech",
                options: {
                    utteranceOpts: {
                        lang: "{speakEnactor}.options.lang"
                    },
                    listeners: {
                        "onCreate.clear": "{that}.cancel"
                    }
                }
            }
        },
        invokers: {
            handleSelfVoicing: {
                funcName: "demo.prefsEditor.speakEnactor.handleSelfVoicing",
                args: "{that}"
            },
            announce: {
                funcName: "demo.prefsEditor.speakEnactor.announce",
                args: ["{that}", "{arguments}.0"]
            },
            readFromDOM: {
                funcName: "demo.prefsEditor.speakEnactor.readFromDOM",
                args: ["{that}", "{that}.container"]
            },
            stop: {
                func: "{tts}.cancel"
            },
            speak: {
                func: "{tts}.speak"
            }
        },
        strings: {
            loaded: "text to speech enabled",
            errorMsg: "Could not connect to the Text-To-Speech server. Please check your internet connection."
        },
        styles: {
            current: "fl-selfVoicing-current"
        },
        lang: "en"
    });

    demo.prefsEditor.speakEnactor.handleSelfVoicing = function (that) {
        if (that.model.value) {
            that.announce(that.options.strings.loaded);
            that.readFromDOM();
        } else {
            that.stop();
        }
    };

    demo.prefsEditor.speakEnactor.announce = function (that, text) {
        // force a string value
        var str = text.toString();

        // remove extra whitespace
        str = str.trim();
        str.replace(/\s{2,}/gi, " ");

        if (that.model.value && str) {
            that.speak(str);
        }
    };

    // Constants representing DOM node types.
    demo.prefsEditor.speakEnactor.nodeType = {
        ELEMENT_NODE: 1,
        TEXT_NODE: 3
    };

    demo.prefsEditor.speakEnactor.readFromDOM = function (that, elm) {
        elm = $(elm);
        var nodes = elm.contents();
        fluid.each(nodes, function (node) {
            if (node.nodeType === demo.prefsEditor.speakEnactor.nodeType.TEXT_NODE && node.nodeValue) {
                that.announce(node.nodeValue);
            }


            if (node.nodeType === demo.prefsEditor.speakEnactor.nodeType.ELEMENT_NODE && window.getComputedStyle(node).display !== "none") {
                if (node.nodeName === "IMG") {
                    var altText = node.getAttribute("alt");
                    if (altText) {
                        that.announce(altText);
                    }
                } else {
                    demo.prefsEditor.speakEnactor.readFromDOM(that, node);
                }
            }
        });
    };

})(jQuery, fluid);
