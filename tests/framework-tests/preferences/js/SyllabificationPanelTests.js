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

"use strict";

fluid.registerNamespace("fluid.tests");

fluid.defaults("fluid.tests.prefs.panel.syllabification", {
    gradeNames: ["fluid.prefs.panel.syllabification", "fluid.tests.panels.utils.defaultTestPanel"],
    messageBase: {
        "label": "Syllables",
        "description": "Display words separated into syllables.",
        "switchOn": "Syllables On",
        "switchOff": "Syllables Off"
    },
    model: {
        value: false
    },
    resources: {
        template: {
            url: "../../../../src/framework/preferences/html/PrefsEditorTemplate-syllabification.html"
        }
    }
});

fluid.defaults("fluid.tests.syllabificationPanel", {
    gradeNames: ["fluid.test.testEnvironment"],
    components: {
        syllabification: {
            type: "fluid.tests.prefs.panel.syllabification",
            container: ".flc-syllabification",
            createOnEvent: "{syllabificationTester}.events.onTestCaseStart"
        },
        syllabificationTester: {
            type: "fluid.tests.syllabificationTester"
        }
    }
});

fluid.defaults("fluid.tests.syllabificationTester", {
    gradeNames: ["fluid.test.testCaseHolder"],
    testOptions: {
        newValue: true
    },
    modules: [{
        name: "Test the syllabification settings panel",
        tests: [{
            expect: 7,
            name: "Test the rendering of the syllabification panel",
            sequence: [{
                event: "{testEnvironment syllabification}.events.onCreate",
                listener: "fluid.identity"
            },  {
                func: "{syllabification}.refreshView"
            }, {
                listener: "fluid.tests.panels.checkSwitchAdjusterRendering",
                event: "{syllabification}.events.afterRender",
                args: ["{syllabification}", false]
            }, {
                jQueryTrigger: "click",
                element: "{syllabification}.switchUI.dom.control"
            }, {
                listener: "fluid.tests.panels.utils.checkModel",
                args: ["value", "{syllabification}.model", "{that}.options.testOptions.newValue"],
                spec: {path: "value", priority: "last"},
                changeEvent: "{syllabification}.applier.modelChanged"
            }]
        }]
    }]
});

$(function () {
    fluid.test.runTests([
        "fluid.tests.syllabificationPanel"
    ]);
});
