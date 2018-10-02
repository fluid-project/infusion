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

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.localization
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.localizationEnactor", {
        gradeNames: ["fluid.prefs.enactor.localization"],
        model: {
            value: "en"
        }
    });

    fluid.defaults("fluid.tests.localizationTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            localization: {
                type: "fluid.tests.prefs.enactor.localizationEnactor",
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
        modules: [{
            name: "fluid.prefs.enactor.localization",
            tests: [{
                expect: 5,
                name: "Set localization",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{localizationTests localization}.events.onCreate",
                    args: ["The localization enactor was created"]
                },
                {
                    func: "fluid.tests.localizationTester.assertLocale",
                    args: ["{localization}", {value: "en"}]
                },
                {
                    func: "{localization}.applier.change",
                    args: ["value", "fr"]
                },
                {
                    changeEvent: "{localization}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.localizationTester.assertLocale",
                    args: ["{localization}", {value: "fr"}]
                },
                {
                    func: "{localization}.applier.change",
                    args: ["value", "es"]
                },
                {
                    event: "{localization}.events.onLocalizationChangeRequested",
                    listener: "fluid.tests.localizationTester.assertLocale",
                    args: ["{localization}", {value: "es"}]
                },
                {
                    funcName: "fluid.tests.localizationTester.reset",
                    args: ["{localization}"]
                },
                {
                    func: "fluid.tests.localizationTester.assertLocale",
                    args: ["{localization}", {value: ""}]
                }]
            }]
        }]
    });

    fluid.tests.localizationTester.assertLocale = function (that, expectedModel) {
        console.log(that.model)
        jqUnit.assertDeepEq("The model value is set correctly: " + expectedModel.value, expectedModel, that.model);
    };

    fluid.defaults("fluid.tests.localizationExistingTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            localization: {
                type: "fluid.tests.prefs.enactor.localizationEnactor",
                container: ".flc-localization-existing",
                createOnEvent: "{localizationTester}.events.onTestCaseStart"
            },
            localizationTester: {
                type: "fluid.tests.localizationExistingTester"
            }
        }
    });

    fluid.defaults("fluid.tests.localizationExistingTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.enactor.localization",
            tests: [{
                expect: 4,
                name: "Set localization when existing localization present",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{localizationExistingTests localization}.events.onCreate",
                    args: ["The localization enactor was created"]
                },
                {
                    func: "fluid.tests.localizationTester.assertLocale",
                    args: ["{localization}", {value: "en"}]
                },
                {
                    func: "{localization}.applier.change",
                    args: ["value", "fr"]
                },
                {
                    changeEvent: "{localization}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    func: "fluid.tests.localizationTester.assertLocale",
                    args: ["{localization}", {value: "fr"}]
                },
                {
                    func: "{localization}.applier.change",
                    args: ["value", "es"]
                },
                {
                    event: "{localization}.events.onLocalizationChangeRequested",
                    listener: "fluid.tests.localizationTester.assertLocale",
                    args: ["{localization}", {value: "es"}]
                },
                {
                    funcName: "fluid.tests.localizationTester.reset",
                    args: ["{localization}.container"]
                },
                {
                    func: "fluid.tests.localizationTester.assertLocale",
                    args: ["{localization}", {value: ""}]
                }]
            }]
        }]
    });

    fluid.tests.localizationTester.reset = function (that) {
        that.model.value = "";
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.localizationTests",
            "fluid.tests.localizationExistingTests"
        ]);
    });

})(jQuery);
