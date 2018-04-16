/*
Copyright 2015-2018 OCAD University

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

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.selfVoicing
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.selfVoicingEnactor", {
        gradeNames: ["fluid.prefs.enactor.selfVoicing"],
        model: {
            enabled: false
        },
        components: {
            tts: {
                type: "fluid.mock.textToSpeech",
                options: {
                    invokers: {
                        // put back the fluid.orator.domReader's own queueSpeech method, but pass in the
                        // mock queueSpeech function as the speechFn
                        queueSpeech: {
                            funcName: "fluid.orator.domReader.queueSpeech",
                            args: ["{that}", "{that}.mockQueueSpeech", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
                        },
                        mockQueueSpeech: {
                            funcName: "fluid.mock.textToSpeech.queueSpeech",
                            args: ["{arguments}.0", "{that}.speechRecord", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
                        }
                    }
                }
            }
        },
        invokers: {
            toggle: {
                changePath: "enabled",
                value: "{arguments}.0"
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
                expect: 4,
                name: "Dom Reading",
                sequence: [{
                    func: "{selfVoicing}.toggle",
                    args: [true]
                }, {
                    listener: "jqUnit.assertDeepEq",
                    args: ["The text to be spoken should have been queued correctly", "{that}.options.testOptions.expectedText", "{selfVoicing}.tts.speechRecord"],
                    spec: {priority: "last:testing"},
                    event: "{selfVoicing}.tts.events.onStop"
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["The parseQueue should be empty.", 0, "{selfVoicing}.parseQueue.length"]
                }, {
                    funcName: "jqUnit.assertEquals",
                    args: ["The parseIndex should be reset to 0.", 0, "{selfVoicing}.parseIndex"]
                }, {
                    funcName: "jqUnit.assertNodeNotExists",
                    args: ["The self voicing has completed. All marks should be removed.", "{selfVoicing}.dom.mark"]
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.selfVoicingTests"
        ]);
    });

})(jQuery);
