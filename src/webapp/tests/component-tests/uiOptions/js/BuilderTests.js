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

    fluid.tests.assertDefaults = function (gradeName, expectedOpts) {
        var grade = fluid.defaults(gradeName);
        jqUnit.assertNotUndefined("The grade should be created", grade);

        fluid.each(expectedOpts, function (opt, optPath) {
            var actualOpt = fluid.get(grade, optPath);
            if (optPath === "gradeNames") {
                fluid.each(opt, function (baseGrade) {
                    jqUnit.assertTrue(gradeName + " should have the base grade '" + baseGrade + "'", $.inArray(baseGrade, actualOpt) >= 0);
                });
            } else {
                jqUnit.assertDeepEq("The options at path '" + optPath + "'' is set correctly", opt, actualOpt);
            }
        });
    };

    fluid.tests.testGenerateGrade = function (expectedGradeName, expectedOpts, funcArgs) {
        var gradeName = fluid.invokeGlobalFunction("fluid.uiOptions.builder.generateGrade", funcArgs);

        if (expectedGradeName) {
            jqUnit.assertEquals("The grade name should be generated correctly", expectedGradeName, gradeName);
            fluid.tests.assertDefaults(expectedGradeName, expectedOpts);
            var component = fluid.invokeGlobalFunction(gradeName, []);
            jqUnit.assertTrue("The component from grade " + gradeName + " should be instantiable", component);
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
                    args: [undefined, {}, ["fluid.tests.created", "%namespace.generateGradeNoGradeOptions"]]
                }]
            }, {
                expect: 6,
                name: "complete",
                sequence: [{
                    func: "fluid.tests.testGenerateGrade",
                    args: ["fluid.tests.created.generateGradeWithPath", {gradeNames: ["fluid.littleComponent", "autoInit"], members: {test: "test"}}, ["fluid.tests.created", "%namespace.generateGradeWithPath", {gradeNames: ["fluid.littleComponent", "autoInit"], members: {test: "test"}}]]
                }]
            }]
        }]
    });

    fluid.tests.testNotCreated = function (that, grades) {
        fluid.each(grades, function (grade) {
            jqUnit.assertUndefined("{that}.constructedGrades." + "grade should be undefined", that.constructedGrades[grade]);
            jqUnit.assertUndefined("No defaults for the " + grade + " grade should have been created", fluid.defaults(that.options.auxSchema.namespace + "." + grade));
        });
    };

    fluid.tests.testEnactors = function (that) {
        var enactorsGradeName = that.constructedGrades.enactors;
        var enactorDefaults = fluid.defaults(enactorsGradeName);
        jqUnit.assertNotUndefined("{that}.constructedGrades.enactors should be defined", enactorsGradeName);
        jqUnit.assertNotUndefined("The defaults for " + enactorsGradeName + " should be defined", enactorDefaults);
        jqUnit.assertDeepEq("The options should be set correctly", that.options.auxSchema.enactors.members, enactorDefaults.components);
    };

    fluid.tests.testRootModel = function (that) {
        var rootModelGradeName = that.constructedGrades.rootModel;
        var rootModelDefaults = fluid.defaults(rootModelGradeName);
        jqUnit.assertNotUndefined("{that}.constructedGrades.roodModel should be defined", rootModelGradeName);
        jqUnit.assertNotUndefined("The defaults for " + rootModelGradeName + " should be defined", rootModelDefaults);
        jqUnit.assertDeepEq("The members option should be set correctly", that.options.auxSchema.rootModel.members, rootModelDefaults.members);
        jqUnit.assertDeepEq("The members option should be set correctly", that.options.auxSchema.rootModel.members, rootModelDefaults.grad);
    };

    fluid.tests.assembleAuxSchema = function (namespace, auxObjs) {
        var auxSchema = {
            namespace: namespace
        };
        fluid.each(auxObjs, function(auxObj) {
            $.extend(true, auxSchema, auxObj);
        });
        return auxSchema;
    };

    fluid.tests.prefs = {
        "textSize": {
            "type": "fluid.uiOptions.textSize"
        }
    };

    fluid.tests.panels = {
        "panels": [{
            "type": "fluid.uiOptions.panels.textSize",
            "container": ".flc-uiOptions-text-size",
            "template": "templates/textSize"
        }]
    };

    fluid.tests.enactors = {
        "enactors": [{
            "type": "fluid.uiOptions.enactors.textSize"
        }]
    };

    fluid.defaults("fluid.tests.builderTestGrade", {
        gradeNames: ["fluid.littleComponent"],
        panelsTopOptions: {
            gradeNames: ["fluid.littleComponent", "autoInit"]
        },
        enactorsTopOptions: {
            gradeNames: ["fluid.littleComponent", "autoInit"]
        }
    });

    fluid.defaults("fluid.tests.builder", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            builderEmpty: {
                type: "fluid.uiOptions.builder",
                options: {
                    gradeNames: ["fluid.tests.builderTestGrade"],
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.empty", [fluid.tests.prefs])
                }
            },
            builderEnactors: {
                type: "fluid.uiOptions.builder",
                options: {
                    gradeNames: ["fluid.tests.builderTestGrade"],
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.enactorsOnly", [fluid.tests.prefs, fluid.tests.enactors])
                }
            },
            builderTester: {
                type: "fluid.tests.builderTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builderTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "fluid.uiOptions.builder - empty",
            tests: [{
                expect: 8,
                name: "not created",
                sequence: [{
                    func: "fluid.tests.testNotCreated",
                    args: ["{builderEmpty}", ["enactors", "panels", "rootModel", "templateLoader"]]
                }]
            }]
        }, {
            name: "fluid.uiOptions.builder - only enactors",
            tests: [{
                expect: 4,
                name: "enactors",
                sequence: [{
                    func: "fluid.tests.assertDefaults",
                    args: ["{builderEnactors}.constructedGrades.enactors", "{builderEnactors}.options.auxSchema.enactors"]
                }]
            }, {
                expect: 4,
                name: "rootModel",
                sequence: [{
                    func: "fluid.tests.assertDefaults",
                    args: ["{builderEnactors}.constructedGrades.rootModel", "{builderEnactors}.options.auxSchema.rootModel"]
                }]
            },{
                expect: 4,
                name: "not created",
                sequence: [{
                    func: "fluid.tests.testNotCreated",
                    args: ["{builderEnactors}", ["panels", "templateLoader"]]
                }]
            }]
        }]
    });

//TODO: Tests to write
// 1) Only Panels
// 2) Only messages
// 3) Everything

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.generateGradeName",
            "fluid.tests.builder"
        ]);
    });

})(jQuery);
