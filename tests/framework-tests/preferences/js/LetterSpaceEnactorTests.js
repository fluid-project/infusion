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
     * Unit tests for fluid.prefs.enactor.letterSpace
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.letterSpaceEnactor", {
        gradeNames: ["fluid.prefs.enactor.letterSpace"],
        model: {
            value: 1
        },
        fontSizeMap: fluid.tests.enactor.utils.fontSizeMap
    });

    fluid.defaults("fluid.tests.letterSpaceTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            letterSpace: {
                type: "fluid.tests.prefs.enactor.letterSpaceEnactor",
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
        modules: [{
            name: "fluid.prefs.enactor.letterSpace",
            tests: [{
                expect: 15,
                name: "Set letter space",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{letterSpaceTests letterSpace}.events.onCreate",
                    args: ["The letter space enactor was created"]
                }, {
                    func: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{letterSpace}", "Initial"]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{letterSpace}", "Space Increased", "letter-spacing", {size: "1em", factor: "1", computed: "16px"}]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{letterSpace}", "Space Decreased", "letter-spacing", {size: "-1.5em", factor: "-1.5", computed: "-24px"}]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", 1]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{letterSpace}", "Reset"]
                }]
            }]
        }]
    });

    fluid.defaults("fluid.tests.letterSpaceExistingTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            letterSpace: {
                type: "fluid.tests.prefs.enactor.letterSpaceEnactor",
                container: ".flc-letterSpace-existing",
                createOnEvent: "{letterSpaceTester}.events.onTestCaseStart"
            },
            letterSpaceTester: {
                type: "fluid.tests.letterSpaceExistingTester"
            }
        }
    });

    fluid.defaults("fluid.tests.letterSpaceExistingTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.enactor.letterSpace",
            tests: [{
                expect: 15,
                name: "Set letter space when existing letter space present",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{letterSpaceExistingTests letterSpace}.events.onCreate",
                    args: ["The letter space enactor was created"]
                }, {
                    func: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{letterSpace}", "Initial"]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{letterSpace}", "Space Increased", "letter-spacing", {size: "1.2em", factor: "1", computed: "19.2px"}]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{letterSpace}", "Space Decreased", "letter-spacing", {size: "-1.3em", factor: "-1.5", computed: "-20.8px"}]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", 1]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{letterSpace}", "Reset"]
                }]
            }]
        }]
    });

    fluid.defaults("fluid.tests.letterSpaceFactorTests", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            letterSpace: {
                type: "fluid.tests.prefs.enactor.letterSpaceEnactor",
                container: ".flc-letterSpace-factor",
                createOnEvent: "{letterSpaceTester}.events.onTestCaseStart"
            },
            letterSpaceTester: {
                type: "fluid.tests.letterSpaceFactorTester"
            }
        }
    });

    fluid.defaults("fluid.tests.letterSpaceFactorTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.enactor.letterSpace",
            tests: [{
                expect: 15,
                name: "Set letter space based on the factor of the change",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{letterSpaceFactorTests letterSpace}.events.onCreate",
                    args: ["The letter space enactor was created"]
                }, {
                    func: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{letterSpace}", "Initial"]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{letterSpace}", "Space Increased", "letter-spacing", {size: "1.2em", factor: "1", computed: "19.2px"}]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingComputedCSS",
                    args: ["{letterSpace}", "Space Decreased", "letter-spacing", {size: "-1.3em", factor: "-1.5", computed: "-20.8px"}]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", 1]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.verifySpacingSettings",
                    args: ["{letterSpace}", "Reset"]
                }]
            }]
        }]
    });

    $(function () {
        fluid.test.runTests([
            "fluid.tests.letterSpaceTests",
            "fluid.tests.letterSpaceExistingTests",
            "fluid.tests.letterSpaceFactorTests"
        ]);
    });

})(jQuery);
