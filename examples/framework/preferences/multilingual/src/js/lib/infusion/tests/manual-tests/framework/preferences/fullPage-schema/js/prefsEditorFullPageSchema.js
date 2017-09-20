/*
Copyright 2013-2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var demo = demo || {};
(function ($, fluid) {
    "use strict";

    demo.initFullWithPreview = function (container, options) {
        return fluid.prefs.create(container, {
            build: {
                gradeNames: ["fluid.prefs.auxSchema.starter"],
                auxiliarySchema: {
                    "loaderGrades": ["fluid.prefs.fullPreview"],
                    "terms": {
                        "templatePrefix": "../../../../../src/framework/preferences/html/",
                        "messagePrefix": "../../../../../src/framework/preferences/messages/"
                    },
                    "template": "%templatePrefix/FullPreviewPrefsEditor.html",
                    "tableOfContents": {
                        "enactor": {
                            "tocTemplate": "../../../../../src/components/tableOfContents/html/TableOfContents.html"
                        }
                    }
                }
            },
            prefsEditor: options
        });
    };

})(jQuery, fluid);
