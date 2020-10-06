/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var example = example || {};
(function ($, fluid) {
    "use strict";

    /**
     * Auxiliary Schema
     */
    fluid.defaults("example.auxSchema", {
        gradeNames: ["fluid.prefs.auxSchema"],
        auxiliarySchema: {
            template: "html/prefsEditor.html",
            message: "%messagePrefix/prefsEditor.json",
            groups: {
                speaking: {
                    "container": ".mpe-speaking",
                    "template": "%templatePrefix/speaking.html",
                    "message": "%messagePrefix/speaking.json",
                    "type": "example.panels.speaking",
                    "panels": {
                        "always": ["speak"],
                        "example.speakText": ["vol", "wpm"]
                    }
                },
                increasing: {
                    "container": ".mpe-increasing",
                    "template": "%templatePrefix/increasing.html",
                    "message": "%messagePrefix/increasing.json",
                    "type": "example.panels.increasing",
                    "panels": {
                        "always": ["incSize"],
                        "example.increaseSize": ["cursor", "magFactor", "magPos"]
                    }
                }
            },
            speak: {
                type: "example.speakText",
                alias: "speakText",
                enactor: {
                    type: "example.enactors.speak"
                },
                panel: {
                    type: "example.panels.speak",
                    container: ".mpe-speaking-onOff",
                    template: "%templatePrefix/switch-template.html",
                    message: "%messagePrefix/speaking.json"
                }
            },
            vol: {
                type: "example.volume",
                alias: "volume",
                enactor: {
                    type: "example.enactors.vol"
                },
                panel: {
                    type: "example.panels.vol",
                    container: ".mpe-speaking-vol",
                    message: "%messagePrefix/speaking.json",
                    template: "%templatePrefix/slider-template.html"
                }
            },
            wpm: {
                type: "example.wordsPerMinute",
                alias: "wpm",
                enactor: {
                    type: "example.enactors.wpm"
                },
                panel: {
                    type: "example.panels.wpm",
                    container: ".mpe-speaking-wpm",
                    message: "%messagePrefix/speaking.json",
                    template: "%templatePrefix/slider-template.html"
                }
            },
            incSize: {
                type: "example.increaseSize",
                alias: "increaseSize",
                enactor: {
                    type: "example.enactors.incSize"
                },
                panel: {
                    type: "example.panels.incSize",
                    container: ".mpe-increasing-onOff",
                    template: "%templatePrefix/switch-template.html",
                    message: "%messagePrefix/increasing.json"
                }
            },
            cursor: {
                type: "example.cursorSize",
                alias: "cursorSize",
                enactor: {
                    type: "example.enactors.cursor"
                },
                panel: {
                    type: "example.panels.cursor",
                    container: ".mpe-increasing-cursor",
                    message: "%messagePrefix/increasing.json",
                    template: "%templatePrefix/slider-template.html"
                }
            },
            magFactor: {
                type: "example.magnification",
                alias: "magnification",
                enactor: {
                    type: "example.enactors.magFactor"
                },
                panel: {
                    type: "example.panels.magFactor",
                    container: ".mpe-increasing-magFactor",
                    message: "%messagePrefix/increasing.json",
                    template: "%templatePrefix/slider-template.html"
                }
            },
            magPos: {
                type: "example.magnifierPosition",
                alias: "magnifierPosition",
                enactor: {
                    type: "example.enactors.magPos"
                },
                panel: {
                    type: "example.panels.magPos",
                    container: ".mpe-increasing-magPos",
                    template: "%templatePrefix/radioButton-template.html",
                    message: "%messagePrefix/increasing.json"
                }
            }
        }
    });

})(jQuery, fluid);
