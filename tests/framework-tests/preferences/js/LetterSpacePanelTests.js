/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.prefs.panel.letterSpace", {
        gradeNames: ["fluid.prefs.panel.letterSpace", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
        messageBase: {
            "label": "Letter Spacing",
            "description": "Adjust the spacing between letters",
            "increaseLabel": "increase letter spacing",
            "decreaseLabel": "decrease letter spacing"
        },
        model: {
            value: 0
        },
        resources: {
            template: {
                url: "../../../../src/framework/preferences/html/PrefsEditorTemplate-letterSpace.html"
            }
        }
    });

    fluid.defaults("fluid.tests.letterSpacePanelTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            letterSpace: {
                type: "fluid.tests.prefs.panel.letterSpace",
                container: ".flc-letterSpace",
                createOnEvent: "{letterSpaceTester}.events.onTestCaseStart"
            },
            letterSpaceTester: {
                type: "fluid.tests.letterSpaceTester"
            }
        }
    });

    fluid.defaults("fluid.tests.letterSpaceTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            newValue: 2.5
        },
        modules: [{
            name: "Test the letterSpace settings panel",
            tests: [{
                expect: 2,
                name: "Test the rendering of the letterSpace panel",
                sequence: [{
                    event: "{fluid.tests.letterSpacePanelTests letterSpace}.events.afterRender",
                    priority: "last:testing",
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{letterSpace}.model", 0]
                }, {
                    func: "fluid.tests.panels.changeInput",
                    args: ["{letterSpace}.dom.textfieldStepperContainer", "{that}.options.testOptions.newValue"]
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{letterSpace}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last:testing"},
                    changeEvent: "{letterSpace}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(function () {
        fluid.test.runTests([
            "fluid.tests.letterSpacePanelTests"
        ]);
    });

})(jQuery);
