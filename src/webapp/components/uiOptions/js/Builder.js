/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};


(function ($, fluid) {

    fluid.registerNamespace("fluid.uiOptions");

    fluid.defaults("fluid.uiOptions.builder", {
        gradeNames: ["fluid.uiOptions.primaryBuilder", "fluid.uiOptions.auxBuilder", "autoInit"],
        components: {
            assembler: {
                type: "fluid.uiOptions.builder.assembler"
            }
        }
    });

    fluid.defaults("fluid.uiOptions.builder.assembler", {
        gradeNames: ["autoInit", "fluid.eventedComponent", "{fluid.uiOptions.builder}.buildPrimary"],
        auxSchema: "{fluid.uiOptions.builder}.options.expandedAuxSchema"
    });

})(jQuery, fluid_1_5);
