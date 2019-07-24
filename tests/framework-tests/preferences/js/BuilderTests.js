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

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    fluid.tests.assertGradesPresent = function (gradeName, grades) {
        var grade = fluid.defaults(gradeName);
        jqUnit.assertNotUndefined("The grade should be created", grade);

        fluid.each(grades, function (baseGrade) {
            jqUnit.assertTrue(gradeName + " should have the base grade '" + baseGrade + "'", grade.gradeNames.indexOf(baseGrade) >= 0);
        });
    };

    fluid.tests.assertGradesNotPresent = function (gradeName, grades) {
        var grade = fluid.defaults(gradeName);
        jqUnit.assertNotUndefined("The grade should be created", grade);

        fluid.each(grades, function (baseGrade) {
            jqUnit.assertFalse(gradeName + " should not have the base grade '" + baseGrade + "'", grade.gradeNames.indexOf(baseGrade) >= 0);
        });
    };

    fluid.tests.assertDefaults = function (gradeName, expectedOpts) {
        fluid.tests.assertGradesPresent(gradeName, expectedOpts.gradeNames);
        var grade = fluid.defaults(gradeName);

        fluid.each(expectedOpts, function (opt, optPath) {
            var actualOpt = fluid.get(grade, optPath);
            if (optPath === "members") {
                actualOpt = fluid.transform(actualOpt, fluid.tests.mergeMembers);
            }
            if (optPath !== "gradeNames") {
                jqUnit.assertDeepEq("The options at path '" + optPath + "'' is set correctly", opt, actualOpt);
            }
        });
    };

    /************************************************
     * fluid.prefs.builder.parseAuxSchema tests *
     ************************************************/

    fluid.tests.testParseAuxSchema = function (expected, funcArgs) {
        var actualFilter = fluid.invokeGlobalFunction("fluid.prefs.builder.parseAuxSchema", funcArgs);
        jqUnit.assertDeepEq("The schema should have been parsed correctly", expected, actualFilter);
    };

    fluid.defaults("fluid.tests.parseAuxSchema", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            defaultsTester: {
                type: "fluid.tests.parseAuxSchemaTester"
            }
        }
    });

    fluid.defaults("fluid.tests.parseAuxSchemaTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOpts: {
            auxSchema: {
                "namespace": "fluid.prefs.constructed", // The author of the auxiliary schema will provide this and will be the component to call to initialize the constructed PrefsEditor.
                "textSize": {
                    "type": "fluid.prefs.textSize",
                    "enactor": {
                        "type": "fluid.prefs.enactor.textSize"
                    },
                    "panel": {
                        "type": "fluid.prefs.panel.textSize",
                        "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                        "template": "%templatePrefix/PrefsEditorTemplate-textSize-nativeHTML.html",
                        "message": "%messagePrefix/textSize.json"
                    }
                },
                "lineSpace": {
                    "type": "fluid.prefs.lineSpace",
                    "enactor": {
                        "type": "fluid.prefs.enactor.lineSpace",
                        "fontSizeMap": {
                            "xx-small": "9px",
                            "x-small": "11px",
                            "small": "13px",
                            "medium": "15px",
                            "large": "18px",
                            "x-large": "23px",
                            "xx-large": "30px"
                        }
                    },
                    "panel": {
                        "type": "fluid.prefs.panel.lineSpace",
                        "container": ".flc-prefsEditor-line-space",  // the css selector in the template where the panel is rendered
                        "template": "%templatePrefix/PrefsEditorTemplate-lineSpace-nativeHTML.html",
                        "message": "%messagePrefix/lineSpace.json"
                    }
                }
            },
            expectedTypeFilter: ["fluid.prefs.textSize", "fluid.prefs.lineSpace"]
        },
        modules: [{
            name: "fluid.prefs.builder.parseAuxSchema",
            tests: [{
                expect: 1,
                name: "grade creation",
                func: "fluid.tests.testParseAuxSchema",
                args: ["{that}.options.testOpts.expectedTypeFilter", ["{that}.options.testOpts.auxSchema"]]
            }]
        }]
    });

    /***********************************************
     * fluid.prefs.builder.generateGrade tests *
     ***********************************************/

    fluid.tests.testGenerateGrade = function (expectedOpts, funcArgs) {
        var gradeName = fluid.invokeGlobalFunction("fluid.prefs.builder.generateGrade", funcArgs);
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
            name: "fluid.prefs.builder.generateGrade",
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
            name: "fluid.prefs.builder.constructGrade",
            tests: [{
                expect: 6,
                name: "generate grades",
                func: "fluid.tests.testConstructGrades",
                args: ["{that}.options.testOptions.expected", ["{that}.options.testOptions.mockAuxSchema", ["sample", "missing"]]]
            }]
        }]
    });

    /**********************************
     * fluid.prefs.builder. tests *
     **********************************/

    fluid.tests.testNotCreated = function (that, grades) {
        fluid.each(grades, function (grade) {
            jqUnit.assertUndefined("{that}.options.constructedGrades." + grade + " should be undefined", that.options.constructedGrades[grade]);
            jqUnit.assertUndefined("No defaults for the " + grade + " grade should have been created", fluid.defaults(that.options.auxSchema.namespace + "." + grade));
        });
    };

    fluid.tests.assertConstructedDefaults = function (builder, grades) {
        grades = fluid.makeArray(grades);
        fluid.each(grades, function (grade) {
            var constructedGrade = fluid.get(builder, ["options", "constructedGrades", grade]);
            var auxSchemaConfig = fluid.get(builder, ["options", "auxSchema", grade]);
            fluid.tests.assertDefaults(constructedGrade, auxSchemaConfig);
        });
    };

    fluid.tests.assertConstructedAliases = function (builder, aliasGrades) {
        aliasGrades = fluid.makeArray(aliasGrades);
        fluid.each(aliasGrades, function (aliasGrade) {
            var constructedGrade = fluid.get(builder, ["options", "constructedGrades", aliasGrade]);
            var constructedDefaults = fluid.defaults(constructedGrade);
            var auxSchemaConfig = fluid.get(builder, ["options", "auxSchema", aliasGrade]);
            jqUnit.assertDeepEq("The model setup is correct", constructedDefaults.model[0], auxSchemaConfig.model);
        });
    };

    fluid.tests.assembleAuxSchema = function (namespace, auxObjs) {
        var auxSchema = {
            namespace: namespace
        };
        fluid.each(auxObjs, function (auxObj) {
            $.extend(true, auxSchema, auxObj);
        });
        return auxSchema;
    };

    fluid.tests.prefs = {
        "textSize": {
            "type": "fluid.prefs.textSize"
        }
    };

    fluid.tests.template = {
        "template": "%templatePrefix/SeparatedPanelPrefsEditor.html"
    };

    fluid.tests.message = {
        "message": "%messagePrefix/PrefsEditorTemplate-prefsEditor.json"
    };

    fluid.tests.terms = {
        "terms": {
            "templatePrefix": "templatePrefix",
            "messagePrefix": "messagePrefix"
        }
    };

    fluid.tests.panels = {
        "textSize": {
            "panel": {
                "type": "fluid.prefs.panel.textSize",
                "container": ".flc-prefsEditor-text-size",
                "template": "templates/textSize",
                "message": "messages/textSize"
            }
        }
    };

    fluid.tests.enactors = {
        "textSize": {
            "enactor": {
                "type": "fluid.prefs.enactor.textSize"
            }
        }
    };

    fluid.tests.defaultLocale = {
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

    fluid.defaults("fluid.tests.builder", {
        gradeNames: ["fluid.test.testEnvironment"],
        testOpts: {
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
        },
        components: {
            builderEmpty: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.empty", [fluid.tests.prefs])
                }
            },
            builderDefaultLocale: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.defaultLocale", [
                        fluid.tests.prefs,
                        fluid.tests.defaultLocale
                    ])
                }
            },
            builderEnactors: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.enactorsOnly", [
                        fluid.tests.prefs,
                        fluid.tests.enactors
                    ])
                }
            },
            builderPanels: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.panelsOnly", [
                        fluid.tests.prefs,
                        fluid.tests.panels
                    ]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderPanelsAndMessages: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.builderPanelsAndMessages", [
                        fluid.tests.prefs,
                        fluid.tests.panels,
                        fluid.tests.message,
                        fluid.tests.terms
                    ]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderPanelsAndTemplates: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.builderPanelsAndTemplates", [
                        fluid.tests.prefs,
                        fluid.tests.panels,
                        fluid.tests.template,
                        fluid.tests.terms
                    ]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderAll: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.all", [
                        fluid.tests.prefs,
                        fluid.tests.defaultLocale,
                        fluid.tests.panels,
                        fluid.tests.enactors,
                        fluid.tests.message,
                        fluid.tests.template,
                        fluid.tests.terms
                    ]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderTester: {
                type: "fluid.tests.builderTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builderTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            consolidationGrades: {
                enhancer: "fluid.prefs.builder.uie",
                prefsEditor: "fluid.prefs.builder.prefsEditor"
            }
        },
        modules: [{
            name: "fluid.prefs.builder - empty",
            tests: [{
                expect: 18,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: [
                    "{builderEmpty}",
                    [
                        "enactors",
                        "messages",
                        "panels",
                        "initialModel",
                        "templateLoader",
                        "messageLoader",
                        "terms",
                        "aliases_prefsEditor",
                        "aliases_enhancer"
                    ]
                ]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEmpty}.options.assembledUIEGrade", fluid.tests.expectedOpts.uie]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEmpty}.options.assembledPrefsEditorGrade", fluid.tests.expectedOpts.prefsEditor]
            }]
        }, {
            name: "fluid.prefs.builder - defaultLocale",
            tests: [{
                expect: 18,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: [
                    "{builderEmpty}",
                    [
                        "enactors",
                        "messages",
                        "panels",
                        "initialModel",
                        "templateLoader",
                        "messageLoader",
                        "terms",
                        "aliases_prefsEditor",
                        "aliases_enhancer"
                    ]
                ]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEmpty}.options.assembledUIEGrade", fluid.tests.expectedOpts.uie]
            }, {
                expect: 4,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderDefaultLocale}.options.assembledPrefsEditorGrade", fluid.tests.expectedOpts.prefsEditorWithLocale]
            }]
        }, {
            name: "fluid.prefs.builder - only enactors",
            tests: [{
                expect: 7,
                name: "constructed grades",
                func: "fluid.tests.assertConstructedDefaults",
                args: ["{builderEnactors}", ["enactors", "initialModel"]]
            }, {
                expect: 2,
                name: "constructed alias grades",
                func: "fluid.tests.assertConstructedAliases",
                args: ["{builderEnactors}", ["aliases_prefsEditor", "aliases_enhancer"]]
            }, {
                expect: 6,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderEnactors}", ["messages", "panels", "terms"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEnactors}.options.assembledUIEGrade", fluid.tests.expectedOpts.uie]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEnactors}.options.assembledPrefsEditorGrade", fluid.tests.expectedOpts.prefsEditor]
            }]
        }, {
            name: "fluid.prefs.builder - only panels",
            tests: [{
                expect: 13,
                name: "constructed grades",
                func: "fluid.tests.assertConstructedDefaults",
                args: ["{builderPanels}", ["panels", "initialModel", "templateLoader", "messageLoader"]]
            }, {
                expect: 2,
                name: "constructed alias grades",
                func: "fluid.tests.assertConstructedAliases",
                args: ["{builderEnactors}", ["aliases_prefsEditor", "aliases_enhancer"]]
            }, {
                expect: 6,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderPanels}", ["message", "enactors", "terms"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.options.assembledUIEGrade", fluid.tests.expectedOpts.uie]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.options.assembledPrefsEditorGrade", fluid.tests.expectedOpts.prefsEditor]
            }]
        }, {
            name: "fluid.prefs.builder - panels & messages",
            tests: [{
                expect: 16,
                name: "constructed grades",
                func: "fluid.tests.assertConstructedDefaults",
                args: ["{builderPanelsAndMessages}", ["panels", "initialModel", "templateLoader", "messageLoader", "terms"]]
            }, {
                expect: 2,
                name: "constructed alias grades",
                func: "fluid.tests.assertConstructedAliases",
                args: ["{builderEnactors}", ["aliases_prefsEditor", "aliases_enhancer"]]
            }, {
                expect: 2,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderPanelsAndMessages}", ["enactors"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.options.assembledUIEGrade", fluid.tests.expectedOpts.uie]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.options.assembledPrefsEditorGrade", fluid.tests.expectedOpts.prefsEditor]
            }]
        }, {
            name: "fluid.prefs.builder - panels & templates",
            tests: [{
                expect: 16,
                name: "constructed grades",
                func: "fluid.tests.assertConstructedDefaults",
                args: ["{builderPanelsAndTemplates}", ["panels", "initialModel", "templateLoader", "messageLoader", "terms"]]
            }, {
                expect: 2,
                name: "constructed alias grades",
                func: "fluid.tests.assertConstructedAliases",
                args: ["{builderEnactors}", ["aliases_prefsEditor", "aliases_enhancer"]]
            }, {
                expect: 2,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderPanelsAndTemplates}", ["enactors"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndTemplates}.options.assembledUIEGrade", fluid.tests.expectedOpts.uie]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndTemplates}.options.assembledPrefsEditorGrade", fluid.tests.expectedOpts.prefsEditor]
            }]
        }, {
            name: "fluid.prefs.builder - all",
            tests: [{
                expect: 20,
                name: "constructed grades",
                func: "fluid.tests.assertConstructedDefaults",
                args: ["{builderAll}", ["panels", "enactors", "initialModel", "templateLoader", "messageLoader", "terms"]]
            }, {
                expect: 2,
                name: "constructed alias grades",
                func: "fluid.tests.assertConstructedAliases",
                args: ["{builderEnactors}", ["aliases_prefsEditor", "aliases_enhancer"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.assembledUIEGrade", fluid.tests.expectedOpts.uie]
            }, {
                expect: 4,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.assembledPrefsEditorGrade", fluid.tests.expectedOpts.prefsEditorWithLocale]
            }]
        }]
    });

    /**********************************
     * Builder munging tests          *
     **********************************/
    var loaderGrades = ["fluid.prefs.fullNoPreview"];
    var storeType = "fluid.tests.store";
    var enhancerType = "fluid.tests.enhancer";
    var terms = {
        templatePrefix: "../../../../src/framework/preferences/html",
        messagePrefix: "../../../../src/framework/preferences/messages"
    };
    var prefsEdReady = false;

    fluid.defaults("fluid.tests.store", {
        gradeNames: "fluid.prefs.store",
        listeners: {
            "onRead.impl": {
                func: "fluid.identity"
            },
            "onWrite.impl": {
                func: "fluid.identity"
            }
        }
    });

    fluid.defaults("fluid.tests.enhancer", {
        gradeNames: ["fluid.pageEnhancer"]
    });

    fluid.defaults("fluid.tests.builderMunging", {
        gradeNames: ["fluid.test.testEnvironment"],
        testOpts: {
            topCommonOptions: fluid.tests.topCommonOptions
        },
        components: {
            builder: {
                type: "fluid.prefs.builder",
                options: {
                    gradeNames: ["fluid.prefs.auxSchema.starter"],
                    auxiliarySchema: {
                        loaderGrades: loaderGrades,
                        "template": "%templatePrefix/FullNoPreviewPrefsEditor.html",
                        "tableOfContents": {
                            "enactor": {
                                "tocTemplate": "../../../../src/components/tableOfContents/html/TableOfContents.html"
                            }
                        }
                    }
                }
            },
            prefsEd: {
                type: "fluid.viewComponent",
                container: "#flc-prefsEditor",
                createOnEvent: "{builderMungingTester}.events.onTestCaseStart",
                options: {
                    gradeNames: ["{builder}.options.assembledPrefsEditorGrade"],
                    storeType: storeType,
                    enhancerType: enhancerType,
                    terms: terms,
                    enhancer: {
                        classnameMap: {
                            "textFont.default": "fl-aria"
                        }
                    },
                    prefsEditor: {
                        userOption: 1
                    },
                    store: {
                        storeOption: 2
                    },
                    listeners: {
                        "onReady.setReadyFlag": function () {
                            prefsEdReady = true;
                        }
                    }
                }
            },
            builderMungingTester: {
                type: "fluid.tests.builderMungingTester"
            }
        }
    });

    fluid.tests.assertBuilderMunging = function (prefsEditor) {
        jqUnit.assertEquals("Munging options for prefsEditor should be passed down to the prefsEditor", 1, prefsEditor.prefsEditorLoader.prefsEditor.options.userOption);
        jqUnit.assertEquals("Munging options for store should be passed down to the prefsEditor", 2, prefsEditor.store.settingsStore.options.storeOption);

        jqUnit.assertDeepEq("Munging options for terms should be passed down to the template loader", terms, prefsEditor.prefsEditorLoader.templateLoader.options.terms);
        jqUnit.assertDeepEq("Munging options for terms should be passed down to the message loader", terms, prefsEditor.prefsEditorLoader.messageLoader.options.terms);
        jqUnit.assertTrue("Munging options for onReady event should be passed down to the constructed pref editor", prefsEdReady);

        fluid.each(loaderGrades, function (loaderGrade) {
            jqUnit.assertTrue(loaderGrade + " should be in the base prefsEditor grades", fluid.hasGrade(prefsEditor.prefsEditorLoader.options, loaderGrade));
        });

        jqUnit.assertTrue(enhancerType + " should be in the base enhancer grades", fluid.hasGrade(prefsEditor.enhancer.options, enhancerType));
        var storeOptions = prefsEditor.store.settingsStore.options;
        jqUnit.assertTrue(storeType + " should be in the base store grades", fluid.hasGrade(storeOptions, storeType));
        jqUnit.assertFalse("The default store grade should have been displaced", fluid.hasGrade(storeOptions, "fluid.prefs.cookieStore"));
        jqUnit.assertFalse("The default store grade should have been displaced", fluid.hasGrade(storeOptions, "fluid.prefs.tempStore"));

        jqUnit.assertEquals("Munging options for enhancer should be passed down to the enhancer", "fl-aria", prefsEditor.enhancer.uiEnhancer.options.classnameMap["textFont.default"]);
    };

    fluid.defaults("fluid.tests.builderMungingTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Builder munging",
            tests: [{
                expect: 11,
                name: "Builder munging",
                sequence: [{
                    listener: "fluid.tests.assertBuilderMunging",
                    spec: {priority: "last"},
                    event: "{builderMunging > prefsEd}.events.onReady"
                }]
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
                    event: "{compositePrefsEditor prefsEditor prefsEditorLoader prefsEditor}.events.onReady"
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

    var startsWith = function (str, subStr) {
        return str.indexOf(subStr) === 0;
    };

    jqUnit.test("fluid.prefs.create", function () {
        var pref_defaultNamespace = fluid.prefs.create(".prefs_defaultNamespace", {
            build: {
                gradeNames: ["fluid.prefs.auxSchema.starter"],
                auxiliarySchema: {
                    "namespace": "",
                    "loaderGrades": ["fluid.prefs.fullNoPreview"],
                    "terms": {
                        "templatePrefix": "../../../../src/framework/preferences/html",
                        "messagePrefix": "../../../../src/framework/preferences/messages"
                    }
                }
            }
        });
        jqUnit.assertTrue("The prefs editor should have been returned", fluid.hasGrade(pref_defaultNamespace.options, "fluid.prefs.assembler.prefsEd"));
        jqUnit.assertTrue("The prefsEditor grade should use the custom namespace", startsWith(pref_defaultNamespace.typeName, "fluid.prefs.created_"));

        var namespace = "fluid.test.namespace";
        var pref_customNamespace = fluid.prefs.create(".prefs_customNamespace", {
            build: {
                gradeNames: ["fluid.prefs.auxSchema.starter"],
                auxiliarySchema: {
                    "namespace": namespace,
                    "loaderGrades": ["fluid.prefs.fullNoPreview"],
                    "terms": {
                        "templatePrefix": "../../../../src/framework/preferences/html",
                        "messagePrefix": "../../../../src/framework/preferences/messages"
                    }
                }
            }
        });
        jqUnit.assertTrue("The prefs editor should have been returned", fluid.hasGrade(pref_customNamespace.options, "fluid.prefs.assembler.prefsEd"));
        jqUnit.assertTrue("The prefsEditor grade should use the custom namespace", startsWith(pref_customNamespace.typeName, namespace));
    });

    /***********************
     * Test Initialization *
     ***********************/

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.parseAuxSchema",
            "fluid.tests.generateGrade",
            "fluid.tests.constructGrades",
            "fluid.tests.builder",
            "fluid.tests.builderMunging",
            "fluid.tests.compositePrefsEditor"
        ]);
    });

})(jQuery);
