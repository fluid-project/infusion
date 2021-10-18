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

    /*******************************************************************************
     * Unit tests for fluid.prefs.enactor.wordSpace
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.wordSpaceEnactor", {
        gradeNames: ["fluid.prefs.enactor.wordSpace"],
        model: {
            value: 1
        },
        fontSizeMap: fluid.tests.enactor.utils.fontSizeMap
    });

    fluid.defaults("fluid.tests.wordSpaceTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            wordSpace: {
                type: "fluid.tests.prefs.enactor.wordSpaceEnactor",
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
        modules: [{
            name: "fluid.prefs.enactor.wordSpace",
            tests: [{
                expect: 15,
                name: "Set word space",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{wordSpaceTests wordSpace}.events.onCreate",
                    args: ["The word space enactor was created"]
                }, {
                    func: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{wordSpace}", "Initial"]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{wordSpace}", "Space Increased", "word-spacing", {size: "1em", factor: "1", computed: "16px"}]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{wordSpace}", "Space Decreased", "word-spacing", {size: "-1.5em", factor: "-1.5", computed: "-24px"}]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", 1]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{wordSpace}", "Reset"]
                }]
            }]
        }]
    });

    fluid.defaults("fluid.tests.wordSpaceExistingTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            wordSpace: {
                type: "fluid.tests.prefs.enactor.wordSpaceEnactor",
                container: ".flc-wordSpace-existing",
                createOnEvent: "{wordSpaceTester}.events.onTestCaseStart"
            },
            wordSpaceTester: {
                type: "fluid.tests.wordSpaceExistingTester"
            }
        }
    });

    fluid.defaults("fluid.tests.wordSpaceExistingTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.enactor.wordSpace",
            tests: [{
                expect: 15,
                name: "Set word space when existing word space present",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{wordSpaceExistingTests wordSpace}.events.onCreate",
                    args: ["The letter space enactor was created"]
                }, {
                    func: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{wordSpace}", "Initial"]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{wordSpace}", "Space Increased", "word-spacing", {size: "1.2em", factor: "1", computed: "19.2px"}]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{wordSpace}", "Space Decreased", "word-spacing", {size: "-1.3em", factor: "-1.5", computed: "-20.8px"}]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", 1]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{wordSpace}", "Reset"]
                }]
            }]
        }]
    });

    fluid.defaults("fluid.tests.wordSpaceFactorTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            wordSpace: {
                type: "fluid.tests.prefs.enactor.wordSpaceEnactor",
                container: ".flc-wordSpace-existing",
                createOnEvent: "{wordSpaceTester}.events.onTestCaseStart"
            },
            wordSpaceTester: {
                type: "fluid.tests.wordSpaceFactorTester"
            }
        }
    });

    fluid.defaults("fluid.tests.wordSpaceFactorTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.enactor.wordSpace",
            tests: [{
                expect: 15,
                name: "Set word space based on the factor of the change",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{wordSpaceFactorTests wordSpace}.events.onCreate",
                    args: ["The letter space enactor was created"]
                }, {
                    func: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{wordSpace}", "Initial"]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{wordSpace}", "Space Increased", "word-spacing", {size: "1.2em", factor: "1", computed: "19.2px"}]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{wordSpace}", "Space Decreased", "word-spacing", {size: "-1.3em", factor: "-1.5", computed: "-20.8px"}]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", 1]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{wordSpace}", "Reset"]
                }]
            }]
        }]
    });

    $(function () {
        fluid.test.runTests([
            "fluid.tests.wordSpaceTests",
            "fluid.tests.wordSpaceExistingTests",
            "fluid.tests.wordSpaceFactorTests"
        ]);
    });

})(jQuery);
