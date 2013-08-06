/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

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

var demo = demo || {};
(function ($, fluid) {

    /**
     * Initialize UI Options on the "Fat Panel" version. This version of UI Options uses the
     * page itself as a live preview.
     *
     * Makes use of a schema to configure UI Options
     */
    demo.initFatPanel = function (container) {
        var builder = fluid.uiOptions.builder({
            gradeNames: ["fluid.uiOptions.auxSchema.starter"],
            auxiliarySchema: {
                "templatePrefix": "../../../../components/uiOptions/html/",
                "messagePrefix": "../../../../components/uiOptions/messages/"
            }
        });
        return fluid.invokeGlobalFunction(builder.options.assembledUIOGrade, [container]);
    };

})(jQuery, fluid);
