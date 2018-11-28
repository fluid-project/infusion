/*
Copyright 2007-2018 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*************************************
     * Preferences Editor Word Spacing *
     *************************************/

    /**
     * A sub-component of fluid.prefs that renders the "word spacing" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panel.wordSpace", {
        gradeNames: ["fluid.prefs.panel.stepperAdjuster"],
        preferenceMap: {
            "fluid.prefs.wordSpace": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum",
                "step": "divisibleBy"
            }
        },
        panelOptions: {
            labelIdTemplate: "wordSpace-label-%guid"
        }
    });

})(jQuery, fluid_3_0_0);
