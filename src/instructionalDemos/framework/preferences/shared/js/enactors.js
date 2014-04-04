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

var demo = demo || {};
(function ($, fluid) {
    "use strict";

    /**
     * These enactors are shared by many of the Preferences Framework demos.
     * Each demo only uses some of these enactors, as specified in the demo's auxiliary schema.
     *
     * These enactors do nothing but display a console message when the model changes.
     * In the real world, enactors would do more, depending on what they're for.
     */

    fluid.defaults("demo.enactors.speak", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "demo.speakText": {
                "model.speak": "default"
            }
        },
        modelListeners: {
            "speak": {
                funcName: "demo.logModelValue",
                args: ["speak", "{change}.value"]
            }
        }
    });

    fluid.defaults("demo.enactors.incSize", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "demo.increaseSize": {
                "model.incSize": "default"
            }
        },
        modelListeners: {
            "incSize": {
                funcName: "demo.logModelValue",
                args: ["incSize", "{change}.value"]
            }
        }
    });

    fluid.defaults("demo.enactors.vol", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "demo.volume": {
                "model.volume": "default"
            }
        },
        modelListeners: {
            "volume": {
                funcName: "demo.logModelValue",
                args: ["vol", "{change}.value"]
            }
        }
    });

    fluid.defaults("demo.enactors.wpm", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "demo.wordsPerMinute": {
                "model.wordsPerMin": "default"
            }
        },
        modelListeners: {
            "wordsPerMin": {
                funcName: "demo.logModelValue",
                args: ["wpm", "{change}.value"]
            }
        }
    });

    fluid.defaults("demo.enactors.cursor", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "demo.cursorSize": {
                "model.cursorMult": "default"
            }
        },
        modelListeners: {
            "cursorMult": {
                funcName: "demo.logModelValue",
                args: ["cursor", "{change}.value"]
            }
        }
    });

    fluid.defaults("demo.enactors.magFactor", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "demo.magnification": {
                "model.mag": "default"
            }
        },
        modelListeners: {
            "mag": {
                funcName: "demo.logModelValue",
                args: ["magFactor", "{change}.value"]
            }
        }
    });

    fluid.defaults("demo.enactors.magPos", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "demo.magnifierPosition": {
                "model.magPos": "default"
            }
        },
        modelListeners: {
            "magPos": {
                funcName: "demo.logModelValue",
                args: ["magPos", "{change}.value"]
            }
        }
    });

})(jQuery, fluid);
