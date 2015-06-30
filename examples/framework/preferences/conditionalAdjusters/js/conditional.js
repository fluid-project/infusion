/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid */

var example = example || {};
(function ($, fluid) {
    "use strict";

    /**
     * Initialize Preference Editor.
     */
    example.initPrefsEditor = function (container) {
        return fluid.prefs.create(container, {
            build: {
                gradeNames: ["example.auxSchema"],
                primarySchema: example.primarySchema,
                auxiliarySchema: {
                    "terms": {
                        "templatePrefix": "../shared/html",
                        "messagePrefix": "../shared/messages"
                    }
                }
            }
        });
    };

})(jQuery, fluid);
