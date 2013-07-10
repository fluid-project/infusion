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

    fluid.tests.testNotCreated = function (that, grades) {
        fluid.each(grades, function (grade) {
            jqUnit.assertUndefined("{that}.constructedGrades." + "grade should be undefined", that.constructedGrades[grade]);
            jqUnit.assertUndefined("No defaults for the " + grade + " grade should have been created", fluid.defaults(that.options.auxSchema.namespace + "." + grade));
        });
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

    fluid.defaults("fluid.tests.builder", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            builderEmpty: {
                type: "fluid.uiOptions.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.empty", [fluid.tests.prefs])
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
        }]
    });

//TODO: Tests to write
// 1) Only Enactors
// 2) Only Panels and templateLoader
// 3) Only rootModel// 4) Only tempalteLoader
// 4) Only messages
// 5) Everything

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.generateGradeName",
            "fluid.tests.builder"
        ]);
    });

})(jQuery);
