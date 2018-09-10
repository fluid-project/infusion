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
     * Unit tests for fluid.prefs.enactor.wordSpace
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.wordSpaceEnactor", {
        gradeNames: ["fluid.prefs.enactor.wordSpace"],
        model: {
            value: 1
        },
        fontSizeMap: fluid.tests.enactors.utils.fontSizeMap
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
                expect: 7,
                name: "Set word space",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{wordSpaceTests wordSpace}.events.onCreate",
                    args: ["The word space enactor was created"]
                }, {
                    func: "fluid.tests.wordSpaceTester.assertWordSpace",
                    args: ["{wordSpace}", 16, {value: 1, unit: 0}]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.wordSpaceTester.assertWordSpace",
                    args: ["{wordSpace}", 16, {value: 2, unit: 1}]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.wordSpaceTester.assertWordSpace",
                    args: ["{wordSpace}", 16, {value: -0.5, unit: -1.5}]
                }, {
                    funcName: "fluid.tests.wordSpaceTester.reset",
                    args: ["{wordSpace}.container"]
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
                expect: 7,
                name: "Set word space when existing word space present",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{wordSpaceExistingTests wordSpace}.events.onCreate",
                    args: ["The word space enactor was created"]
                }, {
                    func: "fluid.tests.wordSpaceTester.assertWordSpace",
                    args: ["{wordSpace}", 16, {value: 1, unit: 0}, 3.2]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.wordSpaceTester.assertWordSpace",
                    args: ["{wordSpace}", 16, {value: 2, unit: 1}, 19.2]
                }, {
                    func: "{wordSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{wordSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.wordSpaceTester.assertWordSpace",
                    args: ["{wordSpace}", 16, {value: -0.5, unit: -1.5}, -20.8]
                }, {
                    funcName: "fluid.tests.wordSpaceTester.reset",
                    args: ["{wordSpace}.container"]
                }]
            }]
        }]
    });

    fluid.tests.wordSpaceTester.assertWordSpace = function (that, baseFontSize, expectedModel, expectedStyleValue) {
        var pxVal = expectedStyleValue || expectedModel.unit * baseFontSize; // convert from em to px
        var expectedWordSpace = pxVal + "px";
        jqUnit.assertDeepEq("The model should be set correctly", expectedModel, that.model);
        jqUnit.assertEquals("The word-spacing css style should be set to " + expectedWordSpace, expectedWordSpace, that.container.css("word-spacing"));
    };

    fluid.tests.wordSpaceTester.reset = function (elm) {
        $(elm).css("word-spacing", "");
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.wordSpaceTests",
            "fluid.tests.wordSpaceExistingTests"
        ]);
    });

})(jQuery);
