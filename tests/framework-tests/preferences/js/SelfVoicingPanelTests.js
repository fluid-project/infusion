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

    fluid.defaults("fluid.tests.prefs.panel.speak", {
        gradeNames: ["fluid.prefs.panel.speak", "fluid.tests.panels.utils.defaultTestPanel"],
        messageBase: {
            "label": "Text-to-Speech",
            "description": "Let the computer read site content out loud",
            "switchOn": "Speak On",
            "switchOff": "Speak Off"
        },
        model: {
            value: false
        },
        resources: {
            template: {
                href: "../../../../src/framework/preferences/html/PrefsEditorTemplate-speak.html"
            }
        }
    });

    fluid.defaults("fluid.tests.speakPanel", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            speak: {
                type: "fluid.tests.prefs.panel.speak",
                container: ".flc-speak",
                createOnEvent: "{speakTester}.events.onTestCaseStart"
            },
            speakTester: {
                type: "fluid.tests.speakTester"
            }
        }
    });

    fluid.defaults("fluid.tests.speakTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            newValue: true
        },
        modules: [{
            name: "Test the speak settings panel",
            tests: [{
                expect: 7,
                name: "Test the rendering of the speak panel",
                sequence: [{
                    event: "{testEnvironment speak}.events.onResourcesFetched",
                    listener: "fluid.identity"
                },  {
                    func: "{speak}.refreshView"
                }, {
                    listener: "fluid.tests.panels.checkSwitchAdjusterRendering",
                    event: "{speak}.events.afterRender",
                    args: ["{speak}", false]
                }, {
                    jQueryTrigger: "click",
                    element: "{speak}.switchUI.dom.control"
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{speak}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{speak}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(function () {
        fluid.test.runTests([
            "fluid.tests.speakPanel"
        ]);
    });

})(jQuery);
