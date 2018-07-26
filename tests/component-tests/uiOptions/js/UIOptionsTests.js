/*
Copyright 2011-2014, 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

 */

/* global fluid */

(function ($) {
    "use strict";

    var customizedTocTemplate = "../../../../src/components/tableOfContents/html/TableOfContents.html";

    fluid.defaults("fluid.uiOptions.testPrefsEditor", {
        gradeNames: ["fluid.uiOptions.prefsEditor"],
        tocTemplate: customizedTocTemplate,
        terms: {
            templatePrefix: "../../../../src/framework/preferences/html",
            messagePrefix: "../../../../src/framework/preferences/messages"
        }
    });

    fluid.defaults("fluid.uiOptions.prefsEditorTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "UIOptions Tests",
            tests: [{
                name: "Pass in customized toc template",
                expect: 2,
                sequence: [{
                    event: "{prefsEditorTest prefsEditor}.events.onCreate",
                    listener: "jqUnit.assertEquals",
                    args: ["The toc template is applied properly to the pageEnhancer", customizedTocTemplate, "{prefsEditor}.enhancer.uiEnhancer.fluid_prefs_enactor_tableOfContents.options.tocTemplate"]
                },
                {
                    funcName: "fluid.identity"
                },
                {
                    event: "{prefsEditor}.events.onReady",
                    listener: "jqUnit.assertEquals",
                    args: ["FLUID-5474: The toc template is applied properly to iframeEnhancer", customizedTocTemplate, "{prefsEditor}.prefsEditorLoader.iframeRenderer.iframeEnhancer.fluid_prefs_enactor_tableOfContents.options.tocTemplate"]
                }]
            }]
        }]
    });

    fluid.defaults("fluid.uiOptions.prefsEditorTest", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            prefsEditor: {
                type: "fluid.uiOptions.testPrefsEditor",
                container: ".flc-prefsEditor-separatedPanel",
                createOnEvent: "{prefsEditorTester}.events.onTestCaseStart"
            },
            prefsEditorTester: {
                type: "fluid.uiOptions.prefsEditorTester"
            }
        }
    });




    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.uiOptions.prefsEditorTest",
        ]);
    });
})(jQuery);
