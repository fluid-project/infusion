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

    fluid.tests.assertGradesPresent = function (gradeName, grades) {
        var grade = fluid.defaults(gradeName);
        jqUnit.assertNotUndefined("The grade should be created", grade);

        fluid.each(grades, function (baseGrade) {
            jqUnit.assertTrue(gradeName + " should have the base grade '" + baseGrade + "'", $.inArray(baseGrade, grade.gradeNames) >= 0);
        });
    };

    fluid.tests.assertGradesNotPresent = function (gradeName, grades) {
        var grade = fluid.defaults(gradeName);
        jqUnit.assertNotUndefined("The grade should be created", grade);

        fluid.each(grades, function (baseGrade) {
            jqUnit.assertFalse(gradeName + " should not have the base grade '" + baseGrade + "'", $.inArray(baseGrade, grade.gradeNames) >= 0);
        });
    };

    fluid.tests.assertDefaults = function (gradeName, expectedOpts) {
        fluid.tests.assertGradesPresent(gradeName, expectedOpts.gradeNames);
        var grade = fluid.defaults(gradeName);

        fluid.each(expectedOpts, function (opt, optPath) {
            var actualOpt = fluid.get(grade, optPath);
            if (optPath !== "gradeNames") {
                jqUnit.assertDeepEq("The options at path '" + optPath + "'' is set correctly", opt, actualOpt);
            }
        });
    };

    /******************************************
     * fluid.uiOptions.builder.defaults tests *
     ******************************************/

    fluid.tests.testDefaults = function (expectedOpts, funcArgs) {
        var gradeName = fluid.invokeGlobalFunction("fluid.uiOptions.builder.defaults", funcArgs);
        fluid.tests.assertDefaults(gradeName, expectedOpts);
    };

    fluid.defaults("fluid.tests.defaults", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            defaultsTester: {
                type: "fluid.tests.defaultsTester"
            }
        }
    });

    fluid.defaults("fluid.tests.defaultsTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "fluid.uiOptions.builder.defaults",
            tests: [{
                expect: 4,
                name: "grade creation",
                func: "fluid.tests.testDefaults",
                args: [{gradeNames: ["fluid.littleComponent", "autoInit"], members: {test: "test"}}, ["fluid.tests.created.defaults", {gradeNames: ["fluid.littleComponent", "autoInit"], members: {test: "test"}}]]
            }]
        }]
    });

    /***********************************************
     * fluid.uiOptions.builder.generateGrade tests *
     ***********************************************/

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
                func: "fluid.tests.testGenerateGrade",
                args: [undefined, {}, ["fluid.tests.created", "%namespace.generateGradeNoGradeOptions"]]
            }, {
                expect: 6,
                name: "complete",
                func: "fluid.tests.testGenerateGrade",
                args: ["fluid.tests.created.generateGrade", {gradeNames: ["fluid.littleComponent", "autoInit"], members: {test: "test"}}, ["fluid.tests.created", "%namespace.generateGrade", {gradeNames: ["fluid.littleComponent", "autoInit"], members: {test: "test"}}]]
            }]
        }]
    });

    /****************************************
     * fluid.uiOptions.builder.attach tests *
     ****************************************/

    fluid.tests.testAttach = function (expected, funcArgs) {
        var actual = fluid.invokeGlobalFunction("fluid.uiOptions.builder.attach", funcArgs);
        jqUnit.assertEquals("The output should be set correctly", expected, actual);
    };

    fluid.defaults("fluid.tests.attach", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            attachTester: {
                type: "fluid.tests.attachTester"
            }
        }
    });

    fluid.defaults("fluid.tests.attachTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            exists: "fluid.tests.created.exists"
        },
        modules: [{
            name: "fluid.uiOptions.builder.attach",
            tests: [{
                expect: 1,
                name: "constructedGrade exists",
                func: "fluid.tests.testAttach",
                args: ["{that}.options.testOptions.exists", [true, "{that}.options.testOptions.exists"]]
            }, {
                expect: 1,
                name: "constructedGrade doesn't exists",
                func: "fluid.tests.testAttach",
                args: [undefined, [undefined, "{that}.options.testOptions.exists"]]
            }]
        }]
    });

    /**********************************
     * fluid.uiOptions.builder. tests *
     **********************************/

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

    fluid.tests.messages = {
        "messages": {
            "textSizeLabel": "Text Size"
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
        testOpts: {
            topCommonOptions: {
                panels: {
                    selectors: {
                        cancel: ".flc-uiOptions-cancel",
                        reset: ".flc-uiOptions-reset",
                        save: ".flc-uiOptions-save",
                        previewFrame : ".flc-uiOptions-preview-frame"
                    }
                },
                templateLoader: {
                    templates: {
                        uiOptions: "%prefix/FatPanelUIOptions.html"
                    }
                }
            }
        },
        components: {
            builderEmpty: {
                type: "fluid.uiOptions.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.empty", [fluid.tests.prefs])
                }
            },
            builderEnactors: {
                type: "fluid.uiOptions.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.enactorsOnly", [fluid.tests.prefs, fluid.tests.enactors])
                }
            },
            builderPanels: {
                type: "fluid.uiOptions.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.panelsOnly", [fluid.tests.prefs, fluid.tests.panels]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderPanelsAndMessages: {
                type: "fluid.uiOptions.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.builderPanelsAndMessages", [fluid.tests.prefs, fluid.tests.panels, fluid.tests.messages]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderAll: {
                type: "fluid.uiOptions.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.all", [fluid.tests.prefs, fluid.tests.panels, fluid.tests.enactors, fluid.tests.messages]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderTester: {
                type: "fluid.tests.builderTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builderTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            consolidationGrades: {
                enhancer: "fluid.uiOptions.builder.uie",
                uiOptions: "fluid.uiOptions.builder.uio"
            }
        },
        modules: [{
            name: "fluid.uiOptions.builder - empty",
            tests: [{
                expect: 10,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderEmpty}", ["enactors", "messages", "panels", "rootModel", "templateLoader"]]
            }, {
                expect: 1,
                name: "consolidationGrades.enhancer",
                func: "jqUnit.assertUndefined",
                args: ["The consolidationGrades.enhancer should be undefined", "{builderEmpty}.consolidationGrades.enhancer"]
            }, {
                expect: 1,
                name: "consolidationGrades.uiOptions",
                func: "jqUnit.assertUndefined",
                args: ["The consolidationGrades.uiOptions should be undefined", "{builderEmpty}.consolidationGrades.uiOptions"]
            }, {
                expect: 3,
                name: "consolidated grade",
                func: "fluid.tests.assertGradesNotPresent",
                args: ["{builderEmpty}.consolidatedGrade", ["{builderTester}.options.testOptions.consolidationGrades.uiOptions", "{builderTester}.options.testOptions.consolidationGrades.enhancer"]]
            }]
        }, {
            name: "fluid.uiOptions.builder - only enactors",
            tests: [{
                expect: 4,
                name: "enactors",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEnactors}.constructedGrades.enactors", "{builderEnactors}.options.auxSchema.enactors"]
            }, {
                expect: 4,
                name: "rootModel",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEnactors}.constructedGrades.rootModel", "{builderEnactors}.options.auxSchema.rootModel"]
            }, {
                expect: 6,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderEnactors}", ["messages", "panels", "templateLoader"]]
            }, {
                expect: 1,
                name: "consolidationGrades.enhancer",
                func: "jqUnit.assertEquals",
                args: ["The consolidationGrades.enhancer should be set", "{builderTester}.options.testOptions.consolidationGrades.enhancer", "{builderEnactors}.consolidationGrades.enhancer"]
            }, {
                expect: 1,
                name: "consolidationGrades.uiOptions",
                func: "jqUnit.assertUndefined",
                args: ["The consolidationGrades.uiOptions should be undefined", "{builderEnactors}.consolidationGrades.uiOptions"]
            }, {
                expect: 2,
                name: "consolidated grade - gradeNames not added",
                func: "fluid.tests.assertGradesNotPresent",
                args: ["{builderEnactors}.consolidatedGrade", ["{builderTester}.options.testOptions.consolidationGrades.uiOptions"]]
            }, {
                expect: 2,
                name: "consolidated grade - gradeNames added",
                func: "fluid.tests.assertGradesPresent",
                args: ["{builderEnactors}.consolidatedGrade", ["{builderTester}.options.testOptions.consolidationGrades.enhancer"]]
            }]
        }, {
            name: "fluid.uiOptions.builder - only panels",
            tests: [{
                expect: 5,
                name: "panels",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.constructedGrades.panels", "{builderPanels}.options.auxSchema.panels"]
            }, {
                expect: 4,
                name: "rootModel",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.constructedGrades.rootModel", "{builderPanels}.options.auxSchema.rootModel"]
            }, {
                expect: 4,
                name: "templateLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.constructedGrades.templateLoader", "{builderPanels}.options.auxSchema.templateLoader"]
            }, {
                expect: 4,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderPanels}", ["messages", "enactors"]]
            }, {
                expect: 1,
                name: "consolidationGrades.uiOptions",
                func: "jqUnit.assertEquals",
                args: ["The consolidationGrades.uiOptions should be set", "{builderTester}.options.testOptions.consolidationGrades.uiOptions", "{builderPanels}.consolidationGrades.uiOptions"]
            }, {
                expect: 1,
                name: "consolidationGrades.enhancer",
                func: "jqUnit.assertUndefined",
                args: ["The consolidationGrades.enhancer should be undefined", "{builderPanels}.consolidationGrades.enhancer"]
            }, {
                expect: 2,
                name: "consolidated grade - gradeNames not added",
                func: "fluid.tests.assertGradesNotPresent",
                args: ["{builderPanels}.consolidatedGrade", ["{builderTester}.options.testOptions.consolidationGrades.enhancer"]]
            }, {
                expect: 2,
                name: "consolidated grade - gradeNames added",
                func: "fluid.tests.assertGradesPresent",
                args: ["{builderPanels}.consolidatedGrade", ["{builderTester}.options.testOptions.consolidationGrades.uiOptions"]]
            }]
        }, {
            name: "fluid.uiOptions.builder - panels & messages",
            tests: [{
                expect: 5,
                name: "panels",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.constructedGrades.panels", "{builderPanelsAndMessages}.options.auxSchema.panels"]
            }, {
                expect: 4,
                name: "messages",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.constructedGrades.messages", "{builderPanelsAndMessages}.options.auxSchema.messages"]
            }, {
                expect: 4,
                name: "rootModel",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.constructedGrades.rootModel", "{builderPanelsAndMessages}.options.auxSchema.rootModel"]
            }, {
                expect: 4,
                name: "templateLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.constructedGrades.templateLoader", "{builderPanelsAndMessages}.options.auxSchema.templateLoader"]
            }, {
                expect: 2,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderPanelsAndMessages}", ["enactors"]]
            }, {
                expect: 1,
                name: "consolidationGrades.uiOptions",
                func: "jqUnit.assertEquals",
                args: ["The consolidationGrades.uiOptions should be set", "{builderTester}.options.testOptions.consolidationGrades.uiOptions", "{builderPanelsAndMessages}.consolidationGrades.uiOptions"]
            }, {
                expect: 1,
                name: "consolidationGrades.enhancer",
                func: "jqUnit.assertUndefined",
                args: ["The consolidationGrades.enhancer should be undefined", "{builderPanelsAndMessages}.consolidationGrades.enhancer"]
            }, {
                expect: 2,
                name: "consolidated grade - gradeNames not added",
                func: "fluid.tests.assertGradesNotPresent",
                args: ["{builderPanelsAndMessages}.consolidatedGrade", ["{builderTester}.options.testOptions.consolidationGrades.enhancer"]]
            }, {
                expect: 2,
                name: "consolidated grade - gradeNames added",
                func: "fluid.tests.assertGradesPresent",
                args: ["{builderPanelsAndMessages}.consolidatedGrade", ["{builderTester}.options.testOptions.consolidationGrades.uiOptions"]]
            }]
        }, {
            name: "fluid.uiOptions.builder - all",
            tests: [{
                expect: 5,
                name: "panels",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.constructedGrades.panels", "{builderAll}.options.auxSchema.panels"]
            }, {
                expect: 4,
                name: "messages",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.constructedGrades.messages", "{builderAll}.options.auxSchema.messages"]
            }, {
                expect: 4,
                name: "enactors",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.constructedGrades.enactors", "{builderAll}.options.auxSchema.enactors"]
            }, {
                expect: 4,
                name: "rootModel",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.constructedGrades.rootModel", "{builderAll}.options.auxSchema.rootModel"]
            }, {
                expect: 4,
                name: "templateLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.constructedGrades.templateLoader", "{builderAll}.options.auxSchema.templateLoader"]
            }, {
                expect: 1,
                name: "consolidationGrades.uiOptions",
                func: "jqUnit.assertEquals",
                args: ["The consolidationGrades.uiOptions should be set", "{builderTester}.options.testOptions.consolidationGrades.uiOptions", "{builderAll}.consolidationGrades.uiOptions"]
            }, {
                expect: 1,
                name: "consolidationGrades.enhancer",
                func: "jqUnit.assertEquals",
                args: ["The consolidationGrades.enhancer should be set", "{builderTester}.options.testOptions.consolidationGrades.enhancer", "{builderAll}.consolidationGrades.enhancer"]
            }, {
                expect: 3,
                name: "consolidated grade",
                func: "fluid.tests.assertGradesPresent",
                args: ["{builderAll}.consolidatedGrade", ["{builderTester}.options.testOptions.consolidationGrades.uiOptions", "{builderTester}.options.testOptions.consolidationGrades.enhancer"]]
            }]
        }]
    });

    /***********************
     * Test Initialization *
     ***********************/

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.defaults",
            "fluid.tests.generateGradeName",
            "fluid.tests.attach",
            "fluid.tests.builder"
        ]);
    });

})(jQuery);
