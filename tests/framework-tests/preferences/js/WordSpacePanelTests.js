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

/* global fluid */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.prefs.panel.wordSpace", {
        gradeNames: ["fluid.prefs.panel.wordSpace", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
        messageBase: {
            "label": "Word Spacing",
            "description": "Adjust the spacing between words",
            "increaseLabel": "increase word spacing",
            "decreaseLabel": "decrease word spacing"
        },
        model: {
            value: 0
        },
        resources: {
            template: {
                href: "../../../../src/framework/preferences/html/PrefsEditorTemplate-wordSpace.html"
            }
        }
    });

    fluid.defaults("fluid.tests.wordSpacePanelTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            wordSpace: {
                type: "fluid.tests.prefs.panel.wordSpace",
                container: ".flc-wordSpace",
                createOnEvent: "{wordSpaceTester}.events.onTestCaseStart"
            },
            wordSpaceTester: {
                type: "fluid.tests.wordSpaceTester"
            }
        }
    });

    fluid.defaults("fluid.tests.wordSpaceTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            newValue: 2.5
        },
        modules: [{
            name: "Test the wordSpace settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the wordSpace panel",
                sequence: [{
                    event: "{fluid.tests.wordSpacePanelTests wordSpace}.events.afterRender",
                    priority: "last:testing",
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{wordSpace}.model", 0]
                }, {
                    func: "fluid.tests.panels.changeInput",
                    args: ["{wordSpace}.dom.textfieldStepperContainer", "{that}.options.testOptions.newValue"]
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{wordSpace}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last:testing"},
                    changeEvent: "{wordSpace}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.wordSpacePanelTests"
        ]);
    });

})(jQuery);
