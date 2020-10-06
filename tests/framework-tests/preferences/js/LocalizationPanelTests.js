/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global jqUnit */

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
        stringArrayIndex: {
            localization: [
                "localization-default",
                "localization-en",
                "localization-fr",
                "localization-es",
                "localization-fa"
            ]
        },
        controlValues: {
            localization: ["default", "en", "fr", "es", "fa"]
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
            expectedNumOfOptions: 5,
            defaultValue: "en",
            newValue: "fr"
        },
        modules: [{
            name: "Test the localization settings panel",
            tests: [{
                expect: 15,
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
        var selectOptions = that.container.find("option");
        var messageBase = that.options.messageBase;
        jqUnit.assertEquals("There are " + expectedNumOfOptions + " locales in the control", expectedNumOfOptions, selectOptions.length);
        selectOptions.each(function (index, elm) {
            elm = $(elm);
            jqUnit.assertEquals("The language option at index: " + index + " has the correct value", that.options.controlValues.localization[index], elm.val());
            var stringArrayIndex = that.options.stringArrayIndex.localization[index];
            jqUnit.assertEquals("The language option at index: " + index + " has the correct text", messageBase[stringArrayIndex], elm.text());
        });

        jqUnit.assertEquals("The selected locale is " + expectedLocale, expectedLocale, selectOptions.filter(":selected").val());
        jqUnit.assertEquals("The label text is " + messageBase.label, messageBase.label, that.locate("label").text());
        jqUnit.assertEquals("The description text is " + messageBase.description, messageBase.description, that.locate("localizationDescr").text());
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.localizationPanelTests"
        ]);
    });

})(jQuery);
