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
(function () {
    "use strict";

    /**
     * These Primary Schemas define preferences shared by all of the Preferences Framework examples.
     * Each example only uses some of these preferences, as specified by the example's auxiliary schema.
     */

    fluid.defaults("example.schemas.speakText", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "example.speakText": {
                "type": "boolean",
                "default": false
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

    fluid.defaults("example.schemas.increaseSize", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "example.increaseSize": {
                "type": "boolean",
                "default": false
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

})();
