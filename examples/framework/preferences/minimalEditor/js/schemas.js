 /*
 Copyright The Infusion copyright holders
 See the AUTHORS.md file at the top-level directory of this distribution and at
 https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
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
            // this key must match the name of the pref in the primary schema
            "awesomeCars.prefs.heatedSeats": {
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

   /**
     * Primary Schema
     * This schema defines the "heated seats" preference edited by this preferences
     * editor: its name, type, default value, etc.
     */
    fluid.defaults("awesomeCars.prefs.schemas.heatedSeats", {

        // the base grade for the schema;
        // using this grade tells the framework that this is a primary schema
        gradeNames: ["fluid.prefs.schemas"],

        schema: {
            // the actual specification of the preference
            "awesomeCars.prefs.heatedSeats": {
                "type": "boolean",
                "default": false
            }
        }
    });

})();
