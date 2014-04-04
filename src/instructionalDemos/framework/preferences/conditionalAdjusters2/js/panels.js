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

var demo = demo || {};
(function ($, fluid) {
    "use strict";

    /**
     * Composite Panels
     */
    fluid.defaults("demo.panels.speakIncrease", {
        gradeNames: ["fluid.prefs.compositePanel", "autoInit"],
        selectors: {
            label: ".mpe-speakIncrease-header"
        },
        protoTree: {
            label: {messagekey: "speakIncreaseHeader"}
        }
    });


})(jQuery, fluid);
