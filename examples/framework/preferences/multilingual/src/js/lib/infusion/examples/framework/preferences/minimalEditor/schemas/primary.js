 /*
Copyright 2015 OCAD University

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
