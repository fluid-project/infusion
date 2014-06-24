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

    demo.initFullWithPreview = function (container, options) {
        var prefsEditorOpts = $.extend(true, {prefsEditorType: "fluid.prefs.fullPreview"}, options);
        return fluid.prefs.create(container, {
            build: {
                gradeNames: ["fluid.prefs.auxSchema.starter"],
                auxiliarySchema: {
                    "template": "%prefix/FullPreviewPrefsEditor.html",
                    "templatePrefix": "../../../../../src/framework/preferences/html/",
                    "messagePrefix": "../../../../../src/framework/preferences/messages/",
                    "tableOfContents": {
                        "enactor": {
                            "tocTemplate": "../../../../../src/components/tableOfContents/html/TableOfContents.html"
                        }
                    }
                }
            },
            prefsEditor: prefsEditorOpts
        });
    };

})(jQuery, fluid);
