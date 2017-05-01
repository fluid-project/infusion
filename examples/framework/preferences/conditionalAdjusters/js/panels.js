/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var example = example || {};
(function ($, fluid) {
    "use strict";

    /**
     * Composite Panels
     */
    fluid.defaults("example.panels.speaking", {
        gradeNames: ["fluid.prefs.compositePanel"],
        selectors: {
            header: ".flc-prefsEditor-header",
            label: ".mpe-speaking-header"
        },
        selectorsToIgnore: ["header"],
        protoTree: {
            label: {messagekey: "speakingHeader"}
        }
    });
    fluid.defaults("example.panels.increasing", {
        gradeNames: ["fluid.prefs.compositePanel"],
        selectors: {
            header: ".flc-prefsEditor-header",
            label: ".mpe-increasing-header"
        },
        selectorsToIgnore: ["header"],
        protoTree: {
            label: {messagekey: "increasingHeader"}
        }
    });


})(jQuery, fluid);
