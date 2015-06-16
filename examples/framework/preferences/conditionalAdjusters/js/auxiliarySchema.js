/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid */

var example = example || {};
(function ($, fluid) {
    "use strict";

    /**
     * Auxiliary Schema
     */
    fluid.defaults("example.auxSchema", {
        gradeNames: ["fluid.prefs.auxSchema", "autoInit"],
        auxiliarySchema: {
            template: "html/prefsEditor.html",
            message: "%prefix/prefsEditor.json",
            groups: {
                speaking: {
                    "container": ".mpe-speaking",
                    "template": "%prefix/speaking.html",
                    "message": "%prefix/speaking.json",
                    "type": "example.panels.speaking",
                    "panels": {
                        "always": ["speak"],
                        "example.speakText": ["vol", "wpm"]
                    }
                },
                increasing: {
                    "container": ".mpe-increasing",
                    "template": "%prefix/increasing.html",
                    "message": "%prefix/increasing.json",
                    "type": "example.panels.increasing",
                    "panels": {
                        "always": ["incSize"],
                        "example.increaseSize": ["cursor", "magFactor", "magPos"]
                    }
                }
            },
            speak: {
                type: "example.speakText",
                enactor: {
                    type: "example.enactors.speak"
                },
                panel: {
                    type: "example.panels.speak",
                    container: ".mpe-speaking-onOff",
                    template: "%prefix/speak-template.html",
                    message: "%prefix/speaking.json"
                }
            },
            vol: {
                type: "example.volume",
                enactor: {
                    type: "example.enactors.vol"
                },
                panel: {
                    type: "example.panels.vol",
                    container: ".mpe-speaking-vol",
                    template: "%prefix/slider-template.html",
                    message: "%prefix/speaking.json"
                }
            },
            wpm: {
                type: "example.wordsPerMinute",
                enactor: {
                    type: "example.enactors.wpm"
                },
                panel: {
                    type: "example.panels.wpm",
                    container: ".mpe-speaking-wpm",
                    template: "%prefix/slider-template.html",
                    message: "%prefix/speaking.json"
                }
            },
            incSize: {
                type: "example.increaseSize",
                enactor: {
                    type: "example.enactors.incSize"
                },
                panel: {
                    type: "example.panels.incSize",
                    container: ".mpe-increasing-onOff",
                    template: "%prefix/incSize-template.html",
                    message: "%prefix/increasing.json"
                }
            },
            cursor: {
                type: "example.cursorSize",
                enactor: {
                    type: "example.enactors.cursor"
                },
                panel: {
                    type: "example.panels.cursor",
                    container: ".mpe-increasing-cursor",
                    template: "%prefix/slider-template.html",
                    message: "%prefix/increasing.json"
                }
            },
            magFactor: {
                type: "example.magnification",
                enactor: {
                    type: "example.enactors.magFactor"
                },
                panel: {
                    type: "example.panels.magFactor",
                    container: ".mpe-increasing-magFactor",
                    template: "%prefix/slider-template.html",
                    message: "%prefix/increasing.json"
                }
            },
            magPos: {
                type: "example.magnifierPosition",
                enactor: {
                    type: "example.enactors.magPos"
                },
                panel: {
                    type: "example.panels.magPos",
                    container: ".mpe-increasing-magPos",
                    template: "%prefix/radioButton-template.html",
                    message: "%prefix/increasing.json"
                }
            }
        }
    });


})(jQuery, fluid);
