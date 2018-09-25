/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};
(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.uiOptions.prefsEditor.localizedDemoControls", {
        gradeNames: ["fluid.viewComponent"],
        events: {
            onLocaleChangeRequested: null
        },
        selectors: {
            languageLinkEnglish: ".flc-languages-en",
            languageLinkSpanish: ".flc-languages-es",
            languageLinkFarsi: ".flc-languages-fa",
            languageLinkFrench: ".flc-languages-fr"
        },
        listeners: {
            "onCreate.bindLanguageLinkEnglish": {
                "this": "{that}.dom.languageLinkEnglish",
                "method": "click",
                "args": ["en", "{that}.events.onLocaleChangeRequested.fire"]
            },
            "onCreate.bindLanguageLinkSpanish": {
                "this": "{that}.dom.languageLinkSpanish",
                "method": "click",
                "args": ["es", "{that}.events.onLocaleChangeRequested.fire"]
            },
            "onCreate.bindLanguageLinkFarsi": {
                "this": "{that}.dom.languageLinkFarsi",
                "method": "click",
                "args": ["fa", "{that}.events.onLocaleChangeRequested.fire"]
            },
            "onCreate.bindLanguageLinkFrench": {
                "this": "{that}.dom.languageLinkFrench",
                "method": "click",
                "args": ["fr", "{that}.events.onLocaleChangeRequested.fire"]
            }
        }
    });

})(jQuery, fluid_3_0_0);
