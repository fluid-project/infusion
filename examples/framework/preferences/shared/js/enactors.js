/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

"use strict";

var example = example || {};

/**
 * These enactors are shared by many of the Preferences Framework examples.
 * Each example only uses some of these enactors, as specified in the example's auxiliary schema.
 *
 * These enactors do nothing but display a console message when the model changes.
 * In the real world, enactors would do more, depending on what they're for.
 */

fluid.defaults("example.enactors.speak", {
    gradeNames: ["fluid.prefs.enactor"],
    preferenceMap: {
        "example.speakText": {
            "model.speak": "value"
        }
    },
    modelListeners: {
        "speak": {
            funcName: "example.logModelValue",
            args: ["speak", "{change}.value"],
            namespace: "log"
        }
    }
});

fluid.defaults("example.enactors.incSize", {
    gradeNames: ["fluid.prefs.enactor"],
    preferenceMap: {
        "example.increaseSize": {
            "model.incSize": "value"
        }
    },
    modelListeners: {
        "incSize": {
            funcName: "example.logModelValue",
            args: ["incSize", "{change}.value"],
            namespace: "log"
        }
    }
});

fluid.defaults("example.enactors.vol", {
    gradeNames: ["fluid.prefs.enactor"],
    preferenceMap: {
        "example.volume": {
            "model.volume": "value"
        }
    },
    modelListeners: {
        "volume": {
            funcName: "example.logModelValue",
            args: ["vol", "{change}.value"],
            namespace: "log"
        }
    }
});

fluid.defaults("example.enactors.wpm", {
    gradeNames: ["fluid.prefs.enactor"],
    preferenceMap: {
        "example.wordsPerMinute": {
            "model.wordsPerMin": "value"
        }
    },
    modelListeners: {
        "wordsPerMin": {
            funcName: "example.logModelValue",
            args: ["wpm", "{change}.value"],
            namespace: "log"
        }
    }
});

fluid.defaults("example.enactors.cursor", {
    gradeNames: ["fluid.prefs.enactor"],
    preferenceMap: {
        "example.cursorSize": {
            "model.cursorMult": "value"
        }
    },
    modelListeners: {
        "cursorMult": {
            funcName: "example.logModelValue",
            args: ["cursor", "{change}.value"],
            namespace: "log"
        }
    }
});

fluid.defaults("example.enactors.magFactor", {
    gradeNames: ["fluid.prefs.enactor"],
    preferenceMap: {
        "example.magnification": {
            "model.mag": "value"
        }
    },
    modelListeners: {
        "mag": {
            funcName: "example.logModelValue",
            args: ["magFactor", "{change}.value"],
            namespace: "log"
        }
    }
});

fluid.defaults("example.enactors.magPos", {
    gradeNames: ["fluid.prefs.enactor"],
    preferenceMap: {
        "example.magnifierPosition": {
            "model.magPos": "value"
        }
    },
    modelListeners: {
        "magPos": {
            funcName: "example.logModelValue",
            args: ["magPos", "{change}.value"],
            namespace: "log"
        }
    }
});
