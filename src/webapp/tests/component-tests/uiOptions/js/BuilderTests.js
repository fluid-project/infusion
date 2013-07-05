/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, start, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {

    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.defaults("fluid.tests.builder", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            builder: {
                type: "fluid.uiOptions.builder"
            },
            builderTester: {
                type: "fluid.tests.builderTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builderTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Builder",
            tests: [{
                expect: 1,
                name: "Empty builder.",
                sequence: [{
                    func: "fluid.tests.testEmptyBuilder",
                    args: "{builder}"
                }]
            }]
        }]
    });

    fluid.tests.testEmptyBuilder = function (that) {
        jqUnit.assertValue("Builder is alive", that);
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.builder"
        ]);
    });

})(jQuery);
