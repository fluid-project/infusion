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

/* global fluid */

(function () {
    "use strict";

    /**
     * Auxiliary Schema
     */
    fluid.defaults("awesomeCars.prefs.auxSchema", {

        // the base grade for the schema
        gradeNames: ["fluid.prefs.auxSchema"],

        auxiliarySchema: {

            // the loaderGrade identifies the "base" form of preference editor desired
            loaderGrades: ["fluid.prefs.fullNoPreview"],

            // 'terms' are strings that can be re-used elsewhere in this schema;
            terms: {
                templatePrefix: "html"
            },

            // the main template for the preference editor itself
            template: "%templatePrefix/prefsEditorTemplate.html",

            heatedSeats: {
                // this 'type' must match the name of the pref in the primary schema
                type: "awesomeCars.prefs.heatedSeats",
                panel: {
                    // this 'type' must match the name of the panel grade created for this pref
                    type: "awesomeCars.prefs.panels.heatedSeats",

                    // selector indicating where, in the main template, to place this panel
                    container: ".awec-heatedSeats",

                    // the template for this panel
                    template: "%templatePrefix/heatedSeats.html"
                }
            }
        }
    });


})();
