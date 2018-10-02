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
     * Localization
     *
     * The enactor to change the locale shown according to the value
     *******************************************************************************/
    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.localization", {
        gradeNames: ["fluid.prefs.enactor"],
        preferenceMap: {
            "fluid.prefs.localization": {
                "model.value": "value"
            }
        },
        events: {
            onLocalizationChangeRequested: null
        },
        modelListeners: {
            value: {
                listener: "{that}.events.onLocalizationChangeRequested.fire",
                args: ["{change}.value"],
                namespace: "onLocalizationChangeRequested"
            }
        }
    });

})(jQuery, fluid_3_0_0);
