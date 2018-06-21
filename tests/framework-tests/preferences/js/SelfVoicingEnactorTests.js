/*
Copyright 2015-2018 OCAD University

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

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.selfVoicing
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.selfVoicingEnactor", {
        gradeNames: ["fluid.prefs.enactor.selfVoicing"],
        model: {
            enabled: false
        },
        orator: {
            domReader: {
                gradeNames: ["fluid.tests.orator.domReaderStubs", "fluid.tests.orator.domReaderMockTTS"]
            }
        },
        invokers: {
            toggle: {
                changePath: "enabled",
                value: "{arguments}.0",
                source: "testToggle"
            }
        }
    });

    fluid.defaults("fluid.tests.selfVoicingTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-selfVoicing",
        components: {
            selfVoicing: {
                type: "fluid.tests.prefs.enactor.selfVoicingEnactor",
                container: ".flc-selfVoicing"
            },
            selfVoicingTester: {
                type: "fluid.tests.selfVoicingTester"
            }
        }
    });

    fluid.defaults("fluid.tests.selfVoicingTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            expectedText: [
                {text: "{selfVoicing}.options.strings.welcomeMsg", interrupt: true},
                {text: "Reading text from DOM", interrupt: false}
            ]
        },
        modules: [{
            name: "fluid.prefs.enactor.selfVoicing",
            tests: [{
                expect: 22,
                name: "Init",
                sequence: [{
                    func: "fluid.tests.selfVoicingTester.verifySubComponnetNotInitted",
                    args: ["{selfVoicing}", "orator"]
                }, {
                    func: "{selfVoicing}.toggle",
                    args: [true]
                }, {
                    listener: "fluid.tests.orator.verifyState",
                    args: ["{selfVoicing}.orator", "Init", false],
                    spec: {priority: "last:testing"},
                    event: "{selfVoicing orator}.events.onCreate"
                }, {
                    func: "jqUnit.isVisible",
                    args: ["The orator controller should be visible.", "{selfVoicing}.orator.controller.container"]
                }, {
                    func: "{selfVoicing}.toggle",
                    args: [false]
                }, {
                    func: "jqUnit.notVisible",
                    args: ["The orator controller should not be visible.", "{selfVoicing}.orator.controller.container"]
                }, {
                    func: "{selfVoicing}.toggle",
                    args: [true]
                }, {
                    func: "jqUnit.isVisible",
                    args: ["The orator controller should be visible again.", "{selfVoicing}.orator.controller.container"]
                }, {
                    jQueryTrigger: "click",
                    element: "{selfVoicing}.orator.controller.dom.playToggle"
                }, {
                    listener: "fluid.tests.orator.verifyState",
                    args: ["{selfVoicing}.orator", "Play", true],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{selfVoicing}.orator.applier.modelChanged"
                }, {
                    jQueryTrigger: "click",
                    element: "{selfVoicing}.orator.controller.dom.playToggle"
                }, {
                    listener: "fluid.tests.orator.verifyState",
                    args: ["{selfVoicing}.orator", "Pause", false],
                    spec: {priority: "last:testing", path: "play"},
                    changeEvent: "{selfVoicing}.orator.applier.modelChanged"
                }]
            }]
        }]
    });

    fluid.tests.selfVoicingTester.verifySubComponnetNotInitted = function (that, subComponentName) {
        jqUnit.assertUndefined("The \"" + subComponentName + "\" subcomponent should not have been initialized yet.", that[subComponentName]);
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.selfVoicingTests"
        ]);
    });

})(jQuery);
