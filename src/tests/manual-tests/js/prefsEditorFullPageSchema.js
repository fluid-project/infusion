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

    demo.initWithSchema = function (container, compOpts, prefsEditorType, template) {
        var builder = fluid.prefs.builder({
            gradeNames: ["fluid.prefs.auxSchema.starter"],
            auxiliarySchema: {
                "template": template,
                "tableOfContents": {
                    "enactor": {
                        "tocTemplate": "../../../components/tableOfContents/html/TableOfContents.html"
                    }
                }
            }
        });
        var baseOpts = {
            prefsEditorType: prefsEditorType
        };
        $.extend(true, baseOpts, compOpts);
        return fluid.invokeGlobalFunction(builder.options.assembledPrefsEditorGrade, [container, baseOpts]);
    };

    demo.initFullWithPreview = function (container, options) {
        return demo.initWithSchema(container, options, "fluid.prefs.fullPreview", "%prefix/FullPreviewPrefsEditor.html");
    };

    demo.initFullNoPreview = function (container, options) {
        return demo.initWithSchema(container, options, "fluid.prefs.fullNoPreview", "%prefix/FullNoPreviewPrefsEditor.html");
    };

})(jQuery, fluid);
