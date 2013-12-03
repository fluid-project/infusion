/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global skon:true, fluid, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};
(function ($, fluid) {

    var generateBuildOpts = function (template) {
        return {
            gradeNames: ["fluid.prefs.auxSchema.starter"],
            auxiliarySchema: {
                "template": template,
                "tableOfContents": {
                    "enactor": {
                        "tocTemplate": "../../../src/components/tableOfContents/html/TableOfContents.html"
                    }
                }
            }
        }
    };

    demo.initFullWithPreview = function (container, options) {
        var prefsEditorOpts = $.extend(true, {prefsEditorType: "fluid.prefs.fullPreview"}, options);
        return fluid.prefs.create(container, {
            build: generateBuildOpts("%prefix/FullPreviewPrefsEditor.html"),
            prefsEditor: prefsEditorOpts
        });
    };

    demo.initFullNoPreview = function (container, options) {
        var prefsEditorOpts = $.extend(true, {prefsEditorType: "fluid.prefs.fullNoPreview"}, options);
        return fluid.prefs.create(container, {
            build: generateBuildOpts("%prefix/FullNoPreviewPrefsEditor.html"),
            prefsEditor: prefsEditorOpts
        });
    };

})(jQuery, fluid);
