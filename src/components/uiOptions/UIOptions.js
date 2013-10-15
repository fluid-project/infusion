/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery, window*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};
(function ($, fluid) {

    // Gradename to invoke "fluid.uiOptions.prefsEditor"
    fluid.prefs.builder({
        gradeNames: ["fluid.prefs.auxSchema.starter"],
        auxiliarySchema: {
            "namespace": "fluid.uiOptions"
        }
    });

})(jQuery, fluid_1_5);
