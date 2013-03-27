/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    
    /*******************************************************************************
     * selfVoicing
     * 
     * The enactor that enables self voicing in the user interface options.
     *******************************************************************************/

    fluid.defaults("fluid.uiOptions.actionAnts.selfVoicingEnactor", {
        gradeNames: ["fluid.uiOptions.actionAnts", "autoInit"],
        model: {
            value: true
        },
        events: {
            onSelfVoicingUpdate: null
        },
        components: {
            selfVoicer: {
                type: "fluid.selfVoicer"
            }
        }
    });

    fluid.uiOptions.actionAnts.selfVoicingEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", that.events.onSelfVoicingUpdate.fire);
    };

    fluid.defaults("fluid.selfVoicer", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            "{selfVoicingEnactor}.events.onSelfVoicingUpdate": "{that}.handleSelfVoicing",
            "onCreate": [
                "{that}.attachAudio", {
                    listener: "{that}.announce",
                    args: "{that}.options.strings.loaded"
                }
            ]
        },
        events: {
            afterAnnounce: 
        },
        invokers: {
            handleSelfVoicing: {
                funcName: "fluid.selfVoicer.handleSelfVoicing",
                args: ["{that}.selfVoicingEnabled", "{that}"]
            },
            attachAudio: {
                funcName: "fluid.selfVoicer.attachAudio",
                args: ["{that}"]
            },
            announce: {
                funcName: "fluid.selfVoicer.announce",
                args: ["{that}.selfVoicingEnabled", "{that}.audio", "{that}.options.ttsUrl", "{that}.options.lang", "{arguments}.0"]
            }
        },
        members: {
            selfVoicingEnabled: "{selfVoicingEnactor}.model.value"
        },
        strings: {
            loaded: "Self Voicing Enabled"
        },

        // HTML5 Audio configuration
        audioSelector: "#selfVoicer-audio",
        markup: '<audio type="audio/mpeg"></audio>',

        // Google Translate TTS
        lang: "en",
        ttsUrl: "http://translate.google.com/translate_tts?q=%text&tl=%lang"
    });

    fluid.selfVoicer.finalInit = function (that) {
/*
        function keyCode(evt) {
            // Fix for handling arrow key presses. See FLUID-760.
            return evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0);          
        }
        function getActiveElement () {
            that.currentElement = that.currentElement || $(document.activeElement);
        }
        $("body").keypress(function (event) {
            if (keyCode(event) !== $.ui.keyCode.SPACE) {return;}
            getActiveElement();
            that.announce(that.currentElement.text().trim());
        });
*/
    };

    fluid.selfVoicer.attachAudio = function (that) {
        that.audio = $(that.options.markup);
        that.audio.attr("id", that.options.audioSelector);
        that.audio.hide();
        $("body").remove(that.options.audioSelector);
        $("body").append(that.audio);
        var audioElement = that.audio[0];
        audioElement.addEventListener("loadedmetadata", function () {
            audioElement.play();
            setTimeout(that.events.afterAnnounce.fire, audioElement.duration);
        });
    };

    fluid.selfVoicer.handleSelfVoicing = function (enabled) {
        if (!enabled) {
            delete that.currentElement;
        }
    };

    fluid.selfVoicer.announce = function (enabled, audio, url, lang, text) {
        if (!enabled) {return;}
        audio.attr("src", fluid.stringTemplate(url, {
            lang: lang,
            text: text
        }));
    };

})(jQuery, fluid_1_5);