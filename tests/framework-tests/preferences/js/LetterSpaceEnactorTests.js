/*
Copyright 2007-2019 The Infusion Copyright holders
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
                expect: 7,
                name: "Set letter space",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{letterSpaceTests letterSpace}.events.onCreate",
                    args: ["The letter space enactor was created"]
                }, {
                    func: "fluid.tests.enactor.spacingSetter.assertSpacing",
                    args: ["{letterSpace}", 16, "letter-spacing", {value: 1, unit: 0}]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.spacingSetter.assertSpacing",
                    args: ["{letterSpace}", 16, "letter-spacing", {value: 2, unit: 1}]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.spacingSetter.assertSpacing",
                    args: ["{letterSpace}", 16, "letter-spacing", {value: -0.5, unit: -1.5}]
                }, {
                    funcName: "fluid.tests.letterSpaceTester.reset",
                    args: ["{letterSpace}.container"]
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
                expect: 7,
                name: "Set letter space when existing letter space present",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{letterSpaceExistingTests letterSpace}.events.onCreate",
                    args: ["The letter space enactor was created"]
                }, {
                    func: "fluid.tests.enactor.spacingSetter.assertSpacing",
                    args: ["{letterSpace}", 16, "letter-spacing", {value: 1, unit: 0}, 3.2]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.spacingSetter.assertSpacing",
                    args: ["{letterSpace}", 16, "letter-spacing", {value: 2, unit: 1}, 19.2]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.enactor.spacingSetter.assertSpacing",
                    args: ["{letterSpace}", 16, "letter-spacing", {value: -0.5, unit: -1.5}, -20.8]
                }, {
                    funcName: "fluid.tests.letterSpaceTester.reset",
                    args: ["{letterSpace}.container"]
                }]
            }]
        }]
    });

    fluid.tests.letterSpaceTester.reset = function (elm) {
        $(elm).css("letter-spacing", "");
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.letterSpaceTests",
            "fluid.tests.letterSpaceExistingTests"
        ]);
    });

})(jQuery);
