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

"use strict";

var example = example || {};

/**
 * These Schemas define preferences shared by all of the Preferences Framework examples.
 * Each example only uses some of these preferences, as specified by the example's configuration.
 */

/************************************************************
 * example.speakText preference                             *
 ************************************************************/

fluid.defaults("example.auxSchema.speakText", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "example.speakText": {
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
        }
    }
});

fluid.defaults("example.schemas.speakText", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "example.speakText": {
            "type": "boolean",
            "default": false
        }
    }
});

/************************************************************
 * example.volume preference                                *
 ************************************************************/

fluid.defaults("example.auxSchema.volume", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "example.volume": {
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
        }
    }
});

fluid.defaults("example.schemas.volume", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "example.volume": {
            "type": "number",
            "default": 60,
            "minimum": 0,
            "maximum": 100,
            "multipleOf": 5
        }
    }
});

/************************************************************
 * example.wordsPerMinute preference                        *
 ************************************************************/

fluid.defaults("example.auxSchema.wordsPerMinute", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "example.wordsPerMinute": {
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
        }
    }
});

fluid.defaults("example.schemas.wordsPerMinute", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "example.wordsPerMinute": {
            "type": "number",
            "default": 180,
            "minimum": 130,
            "maximum": 250,
            "multipleOf": 10
        }
    }
});

/************************************************************
 * example.increaseSize preference                          *
 ************************************************************/

fluid.defaults("example.auxSchema.increaseSize", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "example.increaseSize": {
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
        }
    }
});

fluid.defaults("example.schemas.increaseSize", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "example.increaseSize": {
            "type": "boolean",
            "default": false
        }
    }
});

/************************************************************
 * example.cursorSize preference                            *
 ************************************************************/

fluid.defaults("example.auxSchema.cursorSize", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "example.cursorSize": {
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
        }
    }
});

fluid.defaults("example.schemas.cursorSize", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "example.cursorSize": {
            "type": "number",
            "default": 2,
            "minimum": 1,
            "maximum": 5,
            "multipleOf": 1
        }
    }
});

/************************************************************
 * example.magnification preference                         *
 ************************************************************/

fluid.defaults("example.auxSchema.magnification", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "example.magnification": {
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
        }
    }
});

fluid.defaults("example.schemas.magnification", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "example.magnification": {
            "type": "number",
            "default": 100,
            "minimum": 100,
            "maximum": 400,
            "multipleOf": 10
        }
    }
});

/************************************************************
 * example.magnifierPosition preference                     *
 ************************************************************/

fluid.defaults("example.auxSchema.magnifierPosition", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "example.magnifierPosition": {
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

fluid.defaults("example.schemas.magnifierPosition", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "example.magnifierPosition": {
            "type": "string",
            "default": "left",
            "enum": ["centre", "left", "right", "top", "bottom"],
            "enumLabels": ["magPos-centre", "magPos-left", "magPos-right", "magPos-top", "magPos-bottom"]
        }
    }
});
