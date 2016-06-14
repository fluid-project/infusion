/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var example = example || {};
(function ($, fluid) {
    "use strict";

    /**
     * Auxiliary Schema
     */
    fluid.defaults("example.auxSchema", {
        gradeNames: ["fluid.prefs.auxSchema", "fluid.contextAware"],
        contextAwareness: {
            sliderVariety: {
                checks: {
                    jQueryUI: {
                        contextValue: "{fluid.prefsWidgetType}",
                        equals: "jQueryUI",
                        gradeNames: "example.auxSchema.jQueryUI"
                    }
                },
                defaultGradeNames: "example.auxSchema.nativeHTML"
            }
        },
        auxiliarySchema: {
            template: "html/prefsEditor.html",
            message: "%messagePrefix/prefsEditor.json",
            groups: {
                speakIncrease: {
                    "container": ".mpe-speakIncrease",
                    "template": "%templatePrefix/speakIncrease.html",
                    "message": "%messagePrefix/speakIncrease.json",
                    "type": "example.panels.speakIncrease",
                    "panels": {
                        "always": ["speak", "incSize"],
                        "example.speakText": ["vol", "wpm"],
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
                    template: "%templatePrefix/speak-template.html",
                    message: "%messagePrefix/speakIncrease.json"
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
                    message: "%messagePrefix/speakIncrease.json"
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
                    message: "%messagePrefix/speakIncrease.json"
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
                    template: "%templatePrefix/incSize-template.html",
                    message: "%messagePrefix/speakIncrease.json"
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
                    message: "%messagePrefix/speakIncrease.json"
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
                    message: "%messagePrefix/speakIncrease.json"
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
                    template: "%templatePrefix/radioButton-template.html",
                    message: "%messagePrefix/speakIncrease.json"
                }
            }
        }
    });

    // Context-aware mixin for jQueryUI slider
    fluid.defaults("example.auxSchema.nativeHTML", {
        auxiliarySchema: {
            vol: {
                panel: {
                    template: "%templatePrefix/slider-template-nativeHTML.html"
                }
            },
            wpm: {
                panel: {
                    template: "%templatePrefix/slider-template-nativeHTML.html"
                }
            },
            cursor: {
                type: "example.cursorSize",
                panel: {
                    template: "%templatePrefix/slider-template-nativeHTML.html"
                }
            },
            magFactor: {
                type: "example.magnification",
                panel: {
                    template: "%templatePrefix/slider-template-nativeHTML.html"
                }
            }
        }
    });
})(jQuery, fluid);
