/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

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

    fluid.tests.assertGradesPresent = function (gradeName, grades) {
        var grade = fluid.defaults(gradeName);
        jqUnit.assertNotUndefined(gradeName + " should be created", grade);

        fluid.each(grades, function (baseGrade) {
            jqUnit.assertTrue(gradeName + " should have the base grade '" + baseGrade + "'", grade.gradeNames.indexOf(baseGrade) >= 0);
        });
    };

    fluid.tests.flattenResources = function (resources) {
        return fluid.transform(resources, function (resourceConfig) {
            return typeof(resourceConfig) === "string" ? resourceConfig : resourceConfig.url;
        });
    };

    fluid.tests.assertDefaults = function (gradeName, expectedOpts) {
        fluid.tests.assertGradesPresent(gradeName, expectedOpts.gradeNames);
        var grade = fluid.defaults(gradeName);

        fluid.each(expectedOpts, function (opt, optPath) {
            var actualOpt = fluid.get(grade, optPath);
            if (optPath === "members") {
                actualOpt = fluid.transform(actualOpt, fluid.tests.mergeMembers);
            } else if (optPath === "components") {
                actualOpt = jqUnit.flattenMergedSubcomponents(actualOpt);
            } else if (optPath === "resources") {
                actualOpt = fluid.tests.flattenResources(actualOpt);
            } else if (optPath === "model") {
                actualOpt = actualOpt[0];
            }

            if (optPath !== "gradeNames") {
                jqUnit.assertDeepEq("The options at path '" + optPath + "'' is set correctly", opt, actualOpt);
            }
        });
    };

    /***********************************************
     * fluid.prefs.builder.constructGrade tests *
     ***********************************************/

    fluid.tests.testGenerateGrade = function (expectedOpts, funcArgs) {
        var gradeName = fluid.invokeGlobalFunction("fluid.prefs.builder.constructGrade", funcArgs);
        fluid.tests.assertDefaults(gradeName, expectedOpts);
    };

    fluid.defaults("fluid.tests.generateGrade", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            defaultsTester: {
                type: "fluid.tests.generateGradeTester"
            }
        }
    });

    fluid.defaults("fluid.tests.generateGradeTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.builder.constructGrade",
            tests: [{
                expect: 3,
                name: "grade creation",
                func: "fluid.tests.testGenerateGrade",
                args: [{gradeNames: ["fluid.component"], members: {test: "test"}}, ["defaults", "fluid.tests.created", {gradeNames: ["fluid.component"], members: {test: "test"}}]]
            }]
        }]
    });

    /*************************************************
     * fluid.prefs.builder.constructGrades tests *
     *************************************************/

    fluid.tests.testConstructGrades = function (expected, funcArgs) {
        var gradeNames = fluid.invokeGlobalFunction("fluid.prefs.builder.constructGrades", funcArgs);

        fluid.each(expected, function (expectValues, category) {
            var actualGradeName = gradeNames[category];
            var eOpts = expectValues.options;
            var eGradeName = expectValues.gradeName;
            if (eOpts) {
                jqUnit.assertEquals("The grade name should be generated correctly", eGradeName, actualGradeName);
                fluid.tests.assertDefaults(eGradeName, eOpts);
                var component = fluid.invokeGlobalFunction(eGradeName, []);
                jqUnit.assertTrue("The component from grade " + eGradeName + " should be instantiable", component);
            } else {
                jqUnit.assertUndefined("The gradeName should not have been generated", gradeNames[eGradeName]);
            }
        });
    };

    fluid.defaults("fluid.tests.constructGrades", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            constructGradesTester: {
                type: "fluid.tests.constructGradesTester"
            }
        }
    });

    fluid.defaults("fluid.tests.constructGradesTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            mockAuxSchema: {
                namespace: "fluid.tests.created.constructGrade",
                sample: {
                    gradeNames: ["fluid.component"],
                    testOpt: "testOpt"
                }
            },
            expected: {
                sample: {
                    gradeName: "fluid.tests.created.constructGrade.sample",
                    options: {
                        gradeNames: ["fluid.component"],
                        testOpt: "testOpt"
                    }
                },
                missing: {
                    gradeName: "fluid.tests.created.constructGrade.missing"
                }
            }
        },
        modules: [{
            name: "fluid.prefs.builder.constructGrades",
            tests: [{
                expect: 6,
                name: "generate grades",
                func: "fluid.tests.testConstructGrades",
                args: ["{that}.options.testOptions.expected", ["{that}.options.testOptions.mockAuxSchema", ["sample", "missing"]]]
            }]
        }]
    });

    /**********************************
     * fluid.prefs.builder tests      *
     **********************************/

    fluid.test.testAssembly = function (that, assembly) {
        fluid.each(assembly.included, function (grade, subComponent) {
            jqUnit.assertTrue("The " + grade + " should have been added", fluid.hasGrade(that.options, grade));
            jqUnit.assertValue("The " + subComponent + " sub component should have been instantiated", that[subComponent]);
        });
        fluid.each(assembly.excluded, function (grade, subComponent) {
            jqUnit.assertFalse("The " + grade + " should not have been added", fluid.hasGrade(that.options, grade));
            jqUnit.assertUndefined("The " + subComponent + " sub component should not have been instantiated", that[subComponent]);
        });
    };

    fluid.tests.assertConstructedDefaults = function (builder, grades) {
        grades = fluid.makeArray(grades);
        fluid.each(grades, function (grade) {
            var constructedGrade = fluid.get(builder, ["options", "componentGrades", grade]);
            var auxSchemaConfig = fluid.get(builder, ["options", "auxSchema", grade]);
            fluid.tests.assertDefaults(constructedGrade, auxSchemaConfig);
        });
    };

    fluid.tests.assertComponentGradeCreation = function (builder, createdGrades, notCreatedGrades) {
        jqUnit.assertEquals("The correct number of component grades should have been created", createdGrades.length, fluid.keys(builder.options.componentGrades).length);

        fluid.tests.assertConstructedDefaults(builder, createdGrades);
        fluid.each(notCreatedGrades, function (grade) {
            jqUnit.assertUndefined("{that}.options.componentGrades." + grade + " should be undefined", builder.options.componentGrades[grade]);
            jqUnit.assertUndefined("No defaults for the " + grade + " grade should have been created", fluid.defaults(builder.options.auxSchema.namespace + "." + grade));
        });
    };

    fluid.tests.assembleAuxSchema = function (auxObjs) {
        return fluid.accumulate(auxObjs, function (auxObj, auxiliarySchema) {
            return $.extend(true, auxiliarySchema, auxObj);
        }, {});
    };

    fluid.registerNamespace("fluid.tests.aux");

    fluid.tests.aux.prefs = {
        "fluid.prefs.textSize": {}
    };

    fluid.tests.aux.template = {
        "template": "%templatePrefix/SeparatedPanelPrefsEditor.html"
    };

    fluid.tests.aux.message = {
        "message": "%messagePrefix/PrefsEditorTemplate-prefsEditor.json"
    };

    fluid.tests.aux.terms = {
        "terms": {
            "templatePrefix": "templatePrefix",
            "messagePrefix": "messagePrefix"
        }
    };

    fluid.tests.aux.panels = {
        "fluid.prefs.textSize": {
            "panel": {
                "type": "fluid.prefs.panel.textSize",
                "container": ".flc-prefsEditor-text-size",
                "template": "templates/textSize",
                "message": "messages/textSize"
            }
        }
    };

    fluid.tests.aux.enactors = {
        "fluid.prefs.textSize": {
            "enactor": {
                "type": "fluid.prefs.enactor.textSize"
            }
        }
    };

    fluid.tests.aux.defaultLocale = {
        "defaultLocale": "en-CA"
    };

    fluid.tests.expectedOpts = {
        uie: {
            gradeNames: ["fluid.prefs.assembler.uie"]
        },
        prefsEditor: {
            gradeNames: ["fluid.prefs.assembler.prefsEd"]
        },
        prefsEditorWithLocale: {
            gradeNames: ["fluid.prefs.assembler.prefsEd"],
            defaultLocale: "en-CA",
            enhancer: {
                defaultLocale: "en-CA"
            }
        }
    };

    fluid.tests.expectedAssembly = {
        prefsEditor: {
            included: {
                prefsEditorLoader: "fluid.prefs.assembler.prefsEd",
                enhancer: "fluid.prefs.assembler.uie",
                store: "fluid.prefs.assembler.store"
            }
        },
        enhancer: {
            included: {
                enhancer: "fluid.prefs.assembler.uie",
                store: "fluid.prefs.assembler.store"
            },
            excluded: {
                prefsEditorLoader: "fluid.prefs.assembler.prefsEd"
            }
        },
        store: {
            included: {
                store: "fluid.prefs.assembler.store"
            },
            excluded: {
                prefsEditorLoader: "fluid.prefs.assembler.prefsEd",
                enhancer: "fluid.prefs.assembler.uie"
            }
        }
    };

    fluid.defaults("fluid.tests.prefs.builder", {
        gradeNames: ["fluid.prefs.builder", "fluid.prefs.schemas.textSize", "fluid.viewComponent"]
    });

    fluid.defaults("fluid.tests.builder.empty", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-prefs-builder",
        components: {
            builder: {
                type: "fluid.tests.prefs.builder",
                container: "{that}.options.markupFixture",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema([fluid.tests.aux.prefs])
                }
            },
            builderTester: {
                type: "fluid.tests.builder.emptyTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builder.emptyTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.builder - empty",
            tests: [{
                expect: 20,
                name: "Component Grade Creation",
                func: "fluid.tests.assertComponentGradeCreation",
                args: [
                    "{builder}",
                    [
                        "templateLoader",
                        "messageLoader",
                        "terms"
                    ],
                    [
                        "enactors",
                        "panels",
                        "initialModel",
                        "aliases_prefsEditor",
                        "aliases_enhancer"
                    ]
                ]
            }, {
                expect: 6,
                name: "assemblerGrades",
                func: "fluid.test.testAssembly",
                args: ["{builder}", fluid.tests.expectedAssembly.prefsEditor]
            }]
        }]
    });

    fluid.defaults("fluid.tests.builder.defaultLocale", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-prefs-builder",
        components: {
            builder: {
                type: "fluid.tests.prefs.builder",
                container: "{that}.options.markupFixture",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema([
                        fluid.tests.aux.prefs,
                        fluid.tests.aux.defaultLocale
                    ])
                }
            },
            builderTester: {
                type: "fluid.tests.builder.defaultLocaleTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builder.defaultLocaleTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.builder - defaultLocale",
            tests: [{
                expect: 20,
                name: "Component Grade Creation",
                func: "fluid.tests.assertComponentGradeCreation",
                args: [
                    "{builder}",
                    [
                        "templateLoader",
                        "messageLoader",
                        "terms"
                    ],
                    [
                        "enactors",
                        "panels",
                        "initialModel",
                        "aliases_prefsEditor",
                        "aliases_enhancer"
                    ]
                ]
            }, {
                expect: 6,
                name: "assemblerGrades",
                func: "fluid.test.testAssembly",
                args: ["{builder}", fluid.tests.expectedAssembly.prefsEditor]
            }]
        }]
    });

    fluid.defaults("fluid.tests.builder.enactors", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-prefs-builder",
        components: {
            builder: {
                type: "fluid.tests.prefs.builder",
                container: "{that}.options.markupFixture",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema([
                        fluid.tests.aux.prefs,
                        fluid.tests.aux.enactors
                    ])
                }
            },
            builderTester: {
                type: "fluid.tests.builder.enactorsTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builder.enactorsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.builder - only enactors",
            tests: [{
                expect: 25,
                name: "Component Grade Creation",
                func: "fluid.tests.assertComponentGradeCreation",
                args: [
                    "{builder}",
                    [
                        "templateLoader",
                        "messageLoader",
                        "terms",
                        "enactors",
                        "initialModel",
                        "aliases_prefsEditor",
                        "aliases_enhancer"
                    ],
                    [
                        "panels"
                    ]
                ]
            }, {
                expect: 6,
                name: "assemblerGrades",
                func: "fluid.test.testAssembly",
                args: ["{builder}", fluid.tests.expectedAssembly.prefsEditor]
            }]
        }]
    });

    fluid.defaults("fluid.tests.prefs.builder.topCommonOptions", {
        topCommonOptions: {
            panels: {
                selectors: {
                    cancel: ".flc-prefsEditor-cancel",
                    reset: ".flc-prefsEditor-reset",
                    save: ".flc-prefsEditor-save",
                    panels: ".flc-prefsEditor-panel",
                    previewFrame : ".flc-prefsEditor-preview-frame"
                }
            },
            templateLoader: {
                resources: {
                    prefsEditor: "%templatePrefix/SeparatedPanelPrefsEditor.html"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.builder.panels", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-prefs-builder",
        components: {
            builder: {
                type: "fluid.tests.prefs.builder",
                container: "{that}.options.markupFixture",
                options: {
                    gradeNames: ["fluid.tests.prefs.builder.topCommonOptions"],
                    auxiliarySchema: fluid.tests.assembleAuxSchema([
                        fluid.tests.aux.prefs,
                        fluid.tests.aux.panels
                    ])
                }
            },
            builderTester: {
                type: "fluid.tests.builder.panelsTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builder.panelsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.builder - only panels",
            tests: [{
                expect: 25,
                name: "Component Grade Creation",
                func: "fluid.tests.assertComponentGradeCreation",
                args: [
                    "{builder}",
                    [
                        "templateLoader",
                        "messageLoader",
                        "terms",
                        "panels",
                        "initialModel",
                        "aliases_prefsEditor",
                        "aliases_enhancer"
                    ],
                    [
                        "enactors"
                    ]
                ]
            }, {
                expect: 6,
                name: "assemblerGrades",
                func: "fluid.test.testAssembly",
                args: ["{builder}", fluid.tests.expectedAssembly.prefsEditor]
            }]
        }]
    });

    fluid.defaults("fluid.tests.builder.panelsAndMessages", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-prefs-builder",
        components: {
            builder: {
                type: "fluid.tests.prefs.builder",
                container: "{that}.options.markupFixture",
                options: {
                    gradeNames: ["fluid.tests.prefs.builder.topCommonOptions"],
                    auxiliarySchema: fluid.tests.assembleAuxSchema([
                        fluid.tests.aux.prefs,
                        fluid.tests.aux.panels,
                        fluid.tests.aux.message,
                        fluid.tests.aux.terms
                    ])
                }
            },
            builderTester: {
                type: "fluid.tests.builder.panelsAndMessagesTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builder.panelsAndMessagesTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.builder - panels and messages",
            tests: [{
                expect: 25,
                name: "Component Grade Creation",
                func: "fluid.tests.assertComponentGradeCreation",
                args: [
                    "{builder}",
                    [
                        "templateLoader",
                        "messageLoader",
                        "terms",
                        "panels",
                        "initialModel",
                        "aliases_prefsEditor",
                        "aliases_enhancer"
                    ],
                    [
                        "enactors"
                    ]
                ]
            }, {
                expect: 6,
                name: "assemblerGrades",
                func: "fluid.test.testAssembly",
                args: ["{builder}", fluid.tests.expectedAssembly.prefsEditor]
            }]
        }]
    });

    fluid.defaults("fluid.tests.builder.panelsAndTemplates", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-prefs-builder",
        components: {
            builder: {
                type: "fluid.tests.prefs.builder",
                container: "{that}.options.markupFixture",
                options: {
                    gradeNames: ["fluid.tests.prefs.builder.topCommonOptions"],
                    auxiliarySchema: fluid.tests.assembleAuxSchema([
                        fluid.tests.aux.prefs,
                        fluid.tests.aux.panels,
                        fluid.tests.aux.template,
                        fluid.tests.aux.terms
                    ])
                }
            },
            builderTester: {
                type: "fluid.tests.builder.panelsAndTemplatesTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builder.panelsAndTemplatesTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.builder - panels and templates",
            tests: [{
                expect: 25,
                name: "Component Grade Creation",
                func: "fluid.tests.assertComponentGradeCreation",
                args: [
                    "{builder}",
                    [
                        "templateLoader",
                        "messageLoader",
                        "terms",
                        "panels",
                        "initialModel",
                        "aliases_prefsEditor",
                        "aliases_enhancer"
                    ],
                    [
                        "enactors"
                    ]
                ]
            }, {
                expect: 6,
                name: "assemblerGrades",
                func: "fluid.test.testAssembly",
                args: ["{builder}", fluid.tests.expectedAssembly.prefsEditor]
            }]
        }]
    });

    fluid.defaults("fluid.tests.builder.all", {
        gradeNames: ["fluid.test.testEnvironment"],
        markupFixture: ".flc-prefs-builder",
        components: {
            builder: {
                type: "fluid.tests.prefs.builder",
                container: "{that}.options.markupFixture",
                options: {
                    gradeNames: ["fluid.tests.prefs.builder.topCommonOptions"],
                    auxiliarySchema: fluid.tests.assembleAuxSchema([
                        fluid.tests.aux.prefs,
                        fluid.tests.aux.defaultLocale,
                        fluid.tests.aux.panels,
                        fluid.tests.aux.enactors,
                        fluid.tests.aux.message,
                        fluid.tests.aux.template,
                        fluid.tests.aux.terms
                    ])
                }
            },
            builderTester: {
                type: "fluid.tests.builder.allTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builder.allTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "fluid.prefs.builder - all",
            tests: [{
                expect: 27,
                name: "Component Grade Creation",
                func: "fluid.tests.assertComponentGradeCreation",
                args: [
                    "{builder}",
                    [
                        "templateLoader",
                        "messageLoader",
                        "terms",
                        "panels",
                        "enactors",
                        "initialModel",
                        "aliases_prefsEditor",
                        "aliases_enhancer"
                    ]
                ]
            }, {
                expect: 6,
                name: "assemblerGrades",
                func: "fluid.test.testAssembly",
                args: ["{builder}", fluid.tests.expectedAssembly.prefsEditor]
            }]
        }]
    });

    /**************************
     * Composite Panels Tests *
     **************************/

    fluid.defaults("fluid.tests.compositePrefsEditor", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            prefsEditor: {
                type: "fluid.tests.composite.fullNoPreview.prefsEditor",
                container: ".fluid-tests-composite-prefsEditor",
                createOnEvent: "{prefsTester}.events.onTestCaseStart"
            },
            prefsTester: {
                type: "fluid.tests.composite.tester"
            }
        }
    });

    fluid.defaults("fluid.tests.composite.tester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Prefs editor with composite panel",
            tests: [{
                name: "Rendering",
                sequence: [{
                    listener: "fluid.tests.composite.tester.initialRendering",
                    event: "{compositePrefsEditor prefsEditorLoader prefsEditor}.events.onReady"
                }, {
                    func: "{prefsEditor}.prefsEditorLoader.prefsEditor.applier.change",
                    args: ["preferences.fluid_tests_composite_pref_increaseSize", true]
                }, {
                    listener: "fluid.tests.composite.tester.conditionalCreation",
                    event: "{prefsEditor}.prefsEditorLoader.prefsEditor.increasing.events.afterRender",
                    priority: "last"
                }, {
                    func: "{prefsEditor}.prefsEditorLoader.prefsEditor.applier.change",
                    args: ["preferences.fluid_tests_composite_pref_increaseSize", false]
                }, {
                    listener: "fluid.tests.composite.tester.conditionalDestruction",
                    event: "{prefsEditor}.prefsEditorLoader.prefsEditor.increasing.events.afterRender",
                    priority: "last"
                }]
            }]
        }]
    });

    fluid.tests.composite.tester.initialRendering = function (prefsEditor) {
        var singlePanel = prefsEditor.fluid_tests_cmpPanel_speak;
        var compositePanel = prefsEditor.increasing;
        jqUnit.assertFalse("The single panel's checkbox should be in the correct state", singlePanel.locate("bool").prop("checked"));
        jqUnit.assertEquals("The composite panel should be rendered correctly", "increase", compositePanel.locate("label").text());
        jqUnit.assertFalse("The composite panel's always on subpanel's checkbox should be in the correct state", compositePanel.fluid_tests_composite_pref_increaseSize.locate("bool").prop("checked"));
        jqUnit.notVisible("The composite panel's conditional subpanel container should not be visible", compositePanel.locate("fluid_tests_composite_pref_magnification"));
        jqUnit.assertFalse("The composite panel's conditional subpanel should not be initialized", compositePanel.fluid_tests_composite_pref_magnification);
    };

    fluid.tests.composite.tester.conditionalCreation = function (compositePanel) {
        jqUnit.assertTrue("The conditional panel was created", compositePanel.fluid_tests_composite_pref_magnification);
        jqUnit.isVisible("The container for the conditional panel is visible", compositePanel.locate("fluid_tests_composite_pref_magnification"));
        jqUnit.assertTrue("The conditional panel was created", compositePanel.fluid_tests_composite_pref_lineSpace);
        jqUnit.isVisible("The container for the conditional panel is visible", compositePanel.locate("fluid_tests_composite_pref_lineSpace"));
    };

    fluid.tests.composite.tester.conditionalDestruction = function (compositePanel) {
        jqUnit.assertFalse("The conditional panel is not created", compositePanel.fluid_tests_composite_pref_magnification);
        jqUnit.notVisible("The container for the conditional panel is not visible", compositePanel.locate("fluid_tests_composite_pref_magnification"));
        jqUnit.assertFalse("The conditional panel is not created", compositePanel.fluid_tests_composite_pref_lineSpace);
        jqUnit.notVisible("The container for the conditional panel is not visible", compositePanel.locate("fluid_tests_composite_pref_lineSpace"));
    };

    /***************************************
     * fluid.prefs.builder buildType tests *
     ***************************************/

    jqUnit.test("fluid.prefs.builder - prefsEditor/default", function () {
        jqUnit.expect(6);
        var prefsEditor = fluid.tests.prefs.builder(".prefs_defaultNamespace");

        fluid.test.testAssembly(prefsEditor, fluid.tests.expectedAssembly.prefsEditor);

    });

    jqUnit.test("fluid.prefs.builder - enhancer", function () {
        jqUnit.expect(6);
        var prefsEditor = fluid.tests.prefs.builder(".prefs_defaultNamespace", {
            buildType: "enhancer"
        });

        fluid.test.testAssembly(prefsEditor, fluid.tests.expectedAssembly.enhancer);
    });

    jqUnit.test("fluid.prefs.builder - store", function () {
        jqUnit.expect(6);
        var prefsEditor = fluid.prefs.builder({
            buildType: "store"
        });

        fluid.test.testAssembly(prefsEditor, fluid.tests.expectedAssembly.store);
    });

    /***********************
     * Test Initialization *
     ***********************/

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.generateGrade",
            "fluid.tests.constructGrades",
            "fluid.tests.builder.empty",
            "fluid.tests.builder.defaultLocale",
            "fluid.tests.builder.enactors",
            "fluid.tests.builder.panels",
            "fluid.tests.builder.panelsAndMessages",
            "fluid.tests.builder.panelsAndTemplates",
            "fluid.tests.builder.all",
            "fluid.tests.compositePrefsEditor"
        ]);
    });

})(jQuery);
