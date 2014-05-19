/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jQuery, window*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

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
        listeners: {
            "afterAnnounce.next": "{that}.announceNext",
            "onError.alert": {
                listener: "alert",
                args: ["{that}.options.strings.errorMsg"]
            }
        },
        events: {
            afterAnnounce: null,
            onError: null
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
            announceNext: {
                funcName: "demo.prefsEditor.speakEnactor.announceNext",
                args: "{that}"
            }
        },
        members: {
            seen: [],
            speaking: false
        },
        strings: {
            loaded: "text to speech enabled",
            errorMsg: "Could not connect to the Text-To-Speech server. Please check your internet connection."
        },
        styles: {
            current: "fl-selfVoicing-current"
        },

        // Fireworks Server
        ttsUrl: "http://tts.idrc.ocadu.ca?q=%text",

        lang: "en"
    });

    demo.prefsEditor.speakEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel, oldModel) {
            if (newModel.value !== oldModel.value) {
                that.handleSelfVoicing();
            }
        });
    };

    demo.prefsEditor.speakEnactor.handleSelfVoicing = function (that) {
        if (that.model.value) {
            that.announce(that.options.strings.loaded);
        } else {
            delete that.currentElement;
            that.seen = [];
        }
    };

    demo.prefsEditor.speakEnactor.announce = function (that, text) {
        if (!that.model.value) {return;}
        var audioURL = fluid.stringTemplate(that.options.ttsUrl, {
            lang: that.options.lang,
            text: text
        });
        that.currentAnnouncement = new buzz.sound(audioURL);
        that.currentAnnouncement.bind("ended", function () {
            that.speaking = false;
            that.events.afterAnnounce.fire();
        });
        that.currentAnnouncement.bind("error", function () {
            that.speaking = false;
            that.events.onError.fire();
        });
        that.speaking = true;
        that.currentAnnouncement.play();
    };

    var fullTrim = function (string) {
        string = string.trim();
        return string.replace(/\s{2,}/gi, " ");
    };

    demo.prefsEditor.speakEnactor.announceNext = function (that) {
        var announcement = "";
        that.currentElement = that.currentElement ||
            document.activeElement;
        var nodes = $(that.currentElement).contents();
        var next = fluid.find(nodes, function (node) {
            if (that.seen.indexOf(node) > -1) {return;}

            if (node.nodeType === 8 || node.nodeName === "SCRIPT" || node.nodeName === "IFRAME") {
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
        if (!next && that.currentElement.parentNode.nodeName !== "HTML") {
            that.seen.push(that.currentElement);
            next = that.currentElement.parentNode;
        }
        that.currentElement = next;
        if (announcement) {
            that.announce(announcement);
        } else {
            that.announceNext();
        }
    };

})(jQuery, fluid);