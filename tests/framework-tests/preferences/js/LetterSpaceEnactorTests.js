/*
Copyright 2017 OCAD University

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
     * Unit tests for fluid.prefs.enactor.letterSpace
     *******************************************************************************/

    fluid.defaults("fluid.tests.prefs.enactor.letterSpaceEnactor", {
        gradeNames: ["fluid.prefs.enactor.letterSpace"],
        model: {
            value: 0
        },
        fontSizeMap: fluid.tests.enactors.utils.fontSizeMap
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
                expect: 10,
                name: "Set letter space",
                sequence: [{
                    listener: "jqUnit.assert",
                    event: "{letterSpaceTests letterSpace}.events.onCreate",
                    args: ["The letter space enactor was created"]
                }, {
                    func: "fluid.tests.letterSpaceTester.assertLineSpace",
                    args: ["{letterSpace}", 0, "0"]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", 2]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.letterSpaceTester.assertLineSpace",
                    args: ["{letterSpace}", 2, "2px"]
                }, {
                    func: "{letterSpace}.applier.change",
                    args: ["value", -0.5]
                }, {
                    changeEvent: "{letterSpace}.applier.modelChanged",
                    spec: {path: "value", priority: "last:testing"},
                    listener: "fluid.tests.letterSpaceTester.assertLineSpace",
                    args: ["{letterSpace}", -0.5, "-0.5px"]
                }, {
                    funcName: "fluid.tests.letterSpaceTester.reset"
                }]
            }]
        }]
    });

    fluid.tests.letterSpaceTester.assertLineSpace = function (that, expectedModelValue) {
        var expectedLetterSpace = expectedModelValue ? expectedModelValue + "px" : "0";
        jqUnit.assertEquals("The model value should be set to " + expectedModelValue, expectedModelValue, that.model.value);
        jqUnit.assertEquals("The line-spacing css style should be set to " + expectedLetterSpace, expectedLetterSpace, that.root.css("letter-spacing"));
        jqUnit.assertEquals("The line-spacing of the content is set to " + expectedLetterSpace, expectedLetterSpace, that.container.css("letter-spacing"));
    };

    fluid.tests.letterSpaceTester.reset = function () {
        $("body").css("letter-spacing", "normal");
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.letterSpaceTests"
        ]);
    });

})(jQuery);
