/*
Copyright 2007-2019 The Infusion Copyright holders
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
     * This Primary Schema defines preferences shared by all of the Preferences Framework examples.
     * Each example only uses some of these preferences, as specified by the example's auxiliary schema.
     */

    example.primarySchema = {
        "example.speakText": {
            "type": "boolean",
            "default": false
        },
        "example.volume": {
            "type": "number",
            "default": 60,
            "minimum": 0,
            "maximum": 100,
            "divisibleBy": 5
        },
        "example.wordsPerMinute": {
            "type": "number",
            "default": 180,
            "minimum": 130,
            "maximum": 250,
            "divisibleBy": 10
        },
        "example.increaseSize": {
            "type": "boolean",
            "default": false
        },
        "example.cursorSize": {
            "type": "number",
            "default": 2,
            "minimum": 1,
            "maximum": 5,
            "divisibleBy": 1
        },
        "example.magnification": {
            "type": "number",
            "default": 100,
            "minimum": 100,
            "maximum": 400,
            "divisibleBy": 10
        },
        "example.magnifierPosition": {
            "type": "string",
            "default": "left",
            "enum": ["centre", "left", "right", "top", "bottom"]
        }
    };

})();
