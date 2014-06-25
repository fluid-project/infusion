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
     * These enactors are shared by many of the Preferences Framework examples.
     * Each example only uses some of these enactors, as specified in the example's auxiliary schema.
     *
     * These enactors do nothing but display a console message when the model changes.
     * In the real world, enactors would do more, depending on what they're for.
     */

    fluid.defaults("example.enactors.speak", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "example.speakText": {
                "model.speak": "default"
            }
        },
        modelListeners: {
            "speak": {
                funcName: "example.logModelValue",
                args: ["speak", "{change}.value"]
            }
        }
    });

    fluid.defaults("example.enactors.incSize", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "example.increaseSize": {
                "model.incSize": "default"
            }
        },
        modelListeners: {
            "incSize": {
                funcName: "example.logModelValue",
                args: ["incSize", "{change}.value"]
            }
        }
    });

    fluid.defaults("example.enactors.vol", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "example.volume": {
                "model.volume": "default"
            }
        },
        modelListeners: {
            "volume": {
                funcName: "example.logModelValue",
                args: ["vol", "{change}.value"]
            }
        }
    });

    fluid.defaults("example.enactors.wpm", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "example.wordsPerMinute": {
                "model.wordsPerMin": "default"
            }
        },
        modelListeners: {
            "wordsPerMin": {
                funcName: "example.logModelValue",
                args: ["wpm", "{change}.value"]
            }
        }
    });

    fluid.defaults("example.enactors.cursor", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "example.cursorSize": {
                "model.cursorMult": "default"
            }
        },
        modelListeners: {
            "cursorMult": {
                funcName: "example.logModelValue",
                args: ["cursor", "{change}.value"]
            }
        }
    });

    fluid.defaults("example.enactors.magFactor", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "example.magnification": {
                "model.mag": "default"
            }
        },
        modelListeners: {
            "mag": {
                funcName: "example.logModelValue",
                args: ["magFactor", "{change}.value"]
            }
        }
    });

    fluid.defaults("example.enactors.magPos", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "example.magnifierPosition": {
                "model.magPos": "default"
            }
        },
        modelListeners: {
            "magPos": {
                funcName: "example.logModelValue",
                args: ["magPos", "{change}.value"]
            }
        }
    });

})(jQuery, fluid);
