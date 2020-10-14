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

    fluid.defaults("fluid.tests.prefs.panel.captions", {
        gradeNames: ["fluid.prefs.panel.captions", "fluid.tests.panels.utils.defaultTestPanel"],
        messageBase: {
            "label": "Caption",
            "description": "Caption YouTube videos",
            "switchOn": "Caption On",
            "switchOff": "Caption Off"
        },
        model: {
            value: false
        },
        resources: {
            template: {
                href: "../../../../src/framework/preferences/html/PrefsEditorTemplate-captions.html"
            }
        }
    });

    fluid.defaults("fluid.tests.captionsPanel", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            captions: {
                type: "fluid.tests.prefs.panel.captions",
                container: ".flc-captions",
                createOnEvent: "{captionsTester}.events.onTestCaseStart"
            },
            captionsTester: {
                type: "fluid.tests.captionsTester"
            }
        }
    });

    fluid.defaults("fluid.tests.captionsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            newValue: true
        },
        modules: [{
            name: "Test the captions settings panel",
            tests: [{
                expect: 7,
                name: "Test the rendering of the captions panel",
                sequence: [{
                    event: "{testEnvironment captions}.events.onResourcesFetched",
                    listener: "fluid.identity"
                },  {
                    func: "{captions}.refreshView"
                }, {
                    listener: "fluid.tests.panels.checkSwitchAdjusterRendering",
                    event: "{captions}.events.afterRender",
                    args: ["{captions}", false]
                }, {
                    jQueryTrigger: "click",
                    element: "{captions}.switchUI.dom.control"
                }, {
                    listener: "fluid.tests.panels.utils.checkModel",
                    args: ["value", "{captions}.model", "{that}.options.testOptions.newValue"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{captions}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(function () {
        fluid.test.runTests([
            "fluid.tests.captionsPanel"
        ]);
    });

})(jQuery);
