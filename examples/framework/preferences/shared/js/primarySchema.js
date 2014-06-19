/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var demo = demo || {};
(function () {
    "use strict";

    /**
     * This Primary Schema defines preferences shared by all of the Preferences Framework demos.
     * Each demo only uses some of these preferences, as specified by the demo's auxiliary schema.
     */

    demo.primarySchema = {
        "demo.speakText": {
            "type": "boolean",
            "default": false
        },
        "demo.volume": {
            "type": "number",
            "default": 60,
            "minimum": 0,
            "maximum": 100,
            "divisibleBy": 5
        },
        "demo.wordsPerMinute": {
            "type": "number",
            "default": 180,
            "minimum": 130,
            "maximum": 250,
            "divisibleBy": 10
        },
        "demo.increaseSize": {
            "type": "boolean",
            "default": false
        },
        "demo.cursorSize": {
            "type": "number",
            "default": 2,
            "minimum": 1,
            "maximum": 5,
            "divisibleBy": 1
        },
        "demo.magnification": {
            "type": "number",
            "default": 100,
            "minimum": 100,
            "maximum": 400,
            "divisibleBy": 10
        },
        "demo.magnifierPosition": {
            "type": "string",
            "default": "left",
            "enum": ["centre", "left", "right", "top", "bottom"]
        }
    };

})();
