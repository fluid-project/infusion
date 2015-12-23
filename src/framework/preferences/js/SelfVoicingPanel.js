/*
Copyright 2014-2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_1_9 = fluid_1_9 || {};

(function ($, fluid) {
    "use strict";

    /**********************************************************************************
    * speakPanel
    **********************************************************************************/
    fluid.defaults("fluid.prefs.panel.speak", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.speak": {
                "model.speak": "default"
            }
        },
        selectors: {
            speak: ".flc-prefsEditor-speak",
            label: ".flc-prefsEditor-speak-label",
            choiceLabel: ".flc-prefsEditor-speak-choice-label"
        },
        protoTree: {
            label: {messagekey: "speakLabel"},
            choiceLabel: {messagekey: "speakChoiceLabel"},
            speak: "${speak}"
        }
    });

})(jQuery, fluid_1_9);
