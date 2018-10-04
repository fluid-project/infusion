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

    /*******************************************************************************
     * syllabification
     *
     * An enactor that is capable of breaking words down into syllables
     *******************************************************************************/

    /*
        TODO:
        - Add hyphens to text
        - Remove hyphens from text
        - create hyphenation based on languages
        - load patterns only for those languages used on page
     */

    fluid.defaults("fluid.prefs.enactor.syllabification", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.syllabification": {
                "model.enabled": "value"
            }
        },

        model: {
            enabled: false
        }
    });

})(jQuery, fluid_3_0_0);
