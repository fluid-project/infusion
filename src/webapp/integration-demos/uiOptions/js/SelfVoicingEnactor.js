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
            ],
            afterAnnounce: "{that}.announceNext"
        },
        events: {
            afterAnnounce: null
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
            },
            buildSpeechQueue: {
                funcName: "fluid.selfVoicer.buildSpeechQueue",
                args: ["{that}.queue", "{arguments}.0"]
            },
            announceNext: {
                funcName: "fluid.selfVoicer.announceNext",
                args: "{that}"
            }
        },
        members: {
            selfVoicingEnabled: "{selfVoicingEnactor}.model.value",
            seen: [],
            queue: []
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

    fluid.selfVoicer.attachAudio = function (that) {
        that.audio = $(that.options.markup);
        that.audio.attr("id", that.options.audioSelector);
        that.audio.hide();
        $("body").remove(that.options.audioSelector);
        $("body").append(that.audio);
        var audioElement = that.audio[0];
        audioElement.addEventListener("loadedmetadata", function () {
            audioElement.play();
            setTimeout(that.events.afterAnnounce.fire, audioElement.duration * 1000);
        });
    };

    fluid.selfVoicer.handleSelfVoicing = function (enabled) {
        if (!enabled) {
            delete that.currentElement;
            that.seen = [];
            that.queue = [];
        }
    };

    fluid.selfVoicer.announce = function (enabled, audio, url, lang, text) {
        if (!enabled) {return;}
        audio.attr("src", fluid.stringTemplate(url, {
            lang: lang,
            text: text
        }));
    };

    var fullTrim = function (string) {
        string = string.trim();
        return string.replace(/\s{2,}/gi, " ");
    };

    var buildSpeechQueueImpl = function (queue, text) {
        var currentText = text.substr(0, 100);
        var sIndex = currentText.lastIndexOf("\s");
        queue.push(currentText.substring(0, sIndex));
        buildSpeechQueueImpl(queue, text.substring(sIndex + 1));
    };

    fluid.selfVoicer.buildSpeechQueue = function (queue, text) {
        buildSpeechQueueImpl(queue, text);
    };

    fluid.selfVoicer.announceNext = function (that) {
        if (that.queue.length > 0) {
            that.announce(that.queue.shift())
            return;
        }
        var announcement = "";
        that.currentElement = that.currentElement ||
            $("article p")[5];//document.activeElement;
        var nodes = $(that.currentElement).contents();
        var next = fluid.find(nodes, function (node) {
            if (that.seen.indexOf(node) > -1) {return;}

            if (node.nodeType === 8 || node.nodeName === "SCRIPT" ||
                node.nodeName === "IFRAME") {
                that.seen.push(node);
                return;
            }

            if (node.nodeType === 3) {
                announcement = fullTrim(node.nodeValue);
                that.seen.push(node);
                if (announcement) {
                    return node;
                }
                return;
            }

            if (node.nodeType === 1) {
                if (window.getComputedStyle(node).display === "none") {
                    that.seen.push(node);
                    return;
                }
                if (node.nodeName === "IMG") {
                    announcement = fluid.find(node.attributes, function (attr) {
                        if (attr.name === "alt") {
                            return fullTrim(attr.value);
                        }
                    });
                }
                return node;
            }
        });
        if (!next && !that.currentElement.parentNode.nodeName !== "HTML") {
            that.seen.push(that.currentElement);
            next = that.currentElement.parentNode;
        };
        that.currentElement = next;
        if (announcement) {
            buildSpeechQueue(announcement);
            that.announce(that.queue.shift());
        } else {
            that.announceNext();
        }
    };

})(jQuery, fluid_1_5);