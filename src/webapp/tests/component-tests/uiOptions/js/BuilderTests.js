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

    fluid.tests.testGenerateGrade = function (expectedGradeName, expectedOpts, funcArgs) {
        var gradeName = fluid.invokeGlobalFunction("fluid.uiOptions.builder.generateGrade", funcArgs);

        if (expectedGradeName) {
            var grade = fluid.defaults(expectedGradeName);
            jqUnit.assertEquals("The grade name should be generated correctly", expectedGradeName, gradeName);
            jqUnit.assertNotUndefined("The grade should be created", grade);
            var component = fluid.invokeGlobalFunction(gradeName, []);
            jqUnit.assertTrue("The component is 'autoInit'", fluid.hasGrade(component.options, "autoInit"));
            fluid.each(funcArgs[2], function (baseGrade) {
                jqUnit.assertTrue("The gradeName '" + baseGrade + "' is set", fluid.hasGrade(component.options, baseGrade));
            });
            fluid.each(expectedOpts, function (optVal, optKey) {
                jqUnit.assertDeepEq("The options at path '" + optKey + "'' is set correctly", optVal, fluid.get(component.options, optKey));
            });

        } else {
            jqUnit.assertUndefined("The gradeName should not have been generated", gradeName);
            jqUnit.assertUndefined("The grade should not have been created", fluid.defaults(fluid.stringTemplate(funcArgs[0], {namespace: funcArgs[1]})));
        }
    };

    fluid.defaults("fluid.tests.generateGradeName", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            generateGradeTester: {
                type: "fluid.tests.generateGradeTester"
            }
        }
    });

    fluid.defaults("fluid.tests.generateGradeTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "fluid.uiOptions.builder.generateGrade",
            tests: [{
                expect: 2,
                name: "no gradeOptions",
                sequence: [{
                    func: "fluid.tests.testGenerateGrade",
                    args: [undefined, {}, ["fluid.tests.created", "%namespace.generateGradeNoGradeOptions", ["fluid.littleComponent"]]]
                }]
            }, {
                expect: 5,
                name: "no path",
                sequence: [{
                    func: "fluid.tests.testGenerateGrade",
                    args: ["fluid.tests.created.generateGradeNoPath", {test: "test"}, ["fluid.tests.created", "%namespace.generateGradeNoPath", ["fluid.littleComponent"], {test: "test"}]]
                }]
            }, {
                expect: 6,
                name: "no path",
                sequence: [{
                    func: "fluid.tests.testGenerateGrade",
                    args: ["fluid.tests.created.generateGradeWithPath", {test: {test: "test"}}, ["fluid.tests.created", "%namespace.generateGradeWithPath", ["fluid.littleComponent", "autoInit"], {test: "test"}, "test"]]
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.generateGradeName"
        ]);
    });

})(jQuery);
