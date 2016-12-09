/*
Copyright 2015 OCAD University
Copyright 2015 Raising the Floor - International

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

    fluid.defaults("fluid.tests.prefs.panel.speak", {
        gradeNames: ["fluid.prefs.panel.speak", "fluid.tests.panels.utils.defaultTestPanel"],
        messageBase: {
            "speakLabel": "Text-to-Speech",
            "speakDescr": "Let the computer read site content out loud"
        },
        model: {
            speak: false
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

    fluid.tests.speakPanel.verifyRendering = function (that) {
        fluid.tests.panels.utils.verifyCheckboxState("The text-to-speech option is not checked by default", false, that.locate("speak"));
        jqUnit.assertEquals("The text for speakLabel should be rendered", that.options.messageBase.speakLabel, that.locate("label").text());
        jqUnit.assertEquals("The text for speakDescr should be rendered", that.options.messageBase.speakDescr, that.locate("speakDescr").text());
    };

    fluid.defaults("fluid.tests.speakTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            newValue: true
        },
        modules: [{
            name: "Test the speak settings panel",
            tests: [{
                expect: 4,
                name: "Test the rendering of the speak panel",
                sequence: [{
                    event: "{testEnvironment speak}.events.onResourcesFetched",
                    listeners: "fluid.identity"
                },  {
                    func: "{speak}.refreshView"
                }, {
                    listener: "fluid.tests.speakPanel.verifyRendering",
                    event: "{speak}.events.afterRender"
                }, {
                    func: "fluid.tests.panels.utils.setCheckboxState",
                    args: ["{speak}.dom.speak", "{that}.options.testOptions.newValue"]
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["speak", "{speak}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "speak", priority: "last"},
                    changeEvent: "{speak}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.speakPanel"
        ]);
    });

})(jQuery);
