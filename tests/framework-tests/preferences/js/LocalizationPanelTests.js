/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.prefs.panel.localization", {
        gradeNames: ["fluid.prefs.panel.localization", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
        messageBase: {
            "label": "Localization",
            "description": "Change the locale and/or language",
            "localization-default": "Default",
            "localization-en": "English",
            "localization-en_CA": "English (Canada)",
            "localization-en_US": "English (USA)",
            "localization-es": "Spanish",
            "localization-fa": "Farsi",
            "localization-fr": "French"
        },
        model: {
            value: "en"
        },
        resources: {
            template: {
                href: "../../../../src/framework/preferences/html/PrefsEditorTemplate-localization.html"
            }
        },
        classnameMap: {
            "localization": {
                "en": "fl-localization-en",
                "es": "fl-localization-es",
                "fa": "fl-localization-fa",
                "fr": "fl-localization-fr"
            }
        }
    });

    fluid.defaults("fluid.tests.localizationPanelTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            localization: {
                type: "fluid.tests.prefs.panel.localization",
                container: ".flc-localization",
                createOnEvent: "{localizationTester}.events.onTestCaseStart"
            },
            localizationTester: {
                type: "fluid.tests.localizationTester"
            }
        }
    });

    fluid.defaults("fluid.tests.localizationTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            expectedNumOfOptions: 4,
            defaultValue: "en",
            newValue: "fr"
        },
        modules: [{
            name: "Test the localization settings panel",
            tests: [{
                expect: 9,
                name: "Test the rendering of the localization panel",
                sequence: [{
                    event: "{fluid.tests.localizationPanelTests localization}.events.afterRender",
                    priority: "last:testing",
                    listener: "fluid.tests.localizationTester.testDefault",
                    args: ["{localization}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"]
                },
                {
                    func: "fluid.changeElementValue",
                    args: ["{localization}.dom.localization", "{that}.options.testOptions.newValue"]
                },
                {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{localization}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last:testing"},
                    changeEvent: "{localization}.applier.modelChanged"
                }]
            }]
        }]
    });

    fluid.tests.localizationTester.testDefault = function (that, expectedNumOfOptions, expectedLocale) {
        var options = that.container.find("option");
        var messageBase = that.options.messageBase;
        jqUnit.assertEquals("There are " + expectedNumOfOptions + " locales in the control", expectedNumOfOptions, options.length);
        jqUnit.assertEquals("The first locale is " + expectedLocale, expectedLocale, options.filter(":selected").val());
        jqUnit.assertEquals("The label text is " + messageBase.label, messageBase.label, that.locate("label").text());
        jqUnit.assertEquals("The description text is " + messageBase.description, messageBase.description, that.locate("localizationDescr").text());

        fluid.each(options, function (option) {
            var css = that.options.classnameMap.localization[option.value];
            if (css) {
                jqUnit.assertTrue("The option has appropriate css applied", $(option).hasClass(css));
            }
        });
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.localizationPanelTests"
        ]);
    });

})(jQuery);
