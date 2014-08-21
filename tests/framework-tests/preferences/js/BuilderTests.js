/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

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

    /************************************************
     * fluid.prefs.builder.parseAuxSchema tests *
     ************************************************/

    fluid.tests.testparseAuxSchema = function (expected, funcArgs) {
        var actualFitler = fluid.invokeGlobalFunction("fluid.prefs.builder.parseAuxSchema", funcArgs);
        jqUnit.assertDeepEq("The schema should have been parsed correctly", expected, actualFitler);
    };

    fluid.defaults("fluid.tests.parseAuxSchema", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            defaultsTester: {
                type: "fluid.tests.parseAuxSchemaTester"
            }
        }
    });

    fluid.defaults("fluid.tests.parseAuxSchemaTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
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
                        "template": "%prefix/PrefsEditorTemplate-textSize.html",
                        "message": "%prefix/textSize.json"
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
                        "template": "%prefix/PrefsEditorTemplate-lineSpace.html",
                        "message": "%prefix/lineSpace.json"
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
                func: "fluid.tests.testparseAuxSchema",
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
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            defaultsTester: {
                type: "fluid.tests.generateGradeTester"
            }
        }
    });

    fluid.defaults("fluid.tests.generateGradeTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "fluid.prefs.builder.generateGrade",
            tests: [{
                expect: 4,
                name: "grade creation",
                func: "fluid.tests.testGenerateGrade",
                args: [{gradeNames: ["fluid.littleComponent", "autoInit"], members: {test: "test"}}, ["defaults", "fluid.tests.created", {gradeNames: ["fluid.littleComponent", "autoInit"], members: {test: "test"}}]]
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
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            constructGradesTester: {
                type: "fluid.tests.constructGradesTester"
            }
        }
    });

    fluid.defaults("fluid.tests.constructGradesTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            mockAuxSchema: {
                namespace: "fluid.tests.created.constructGrade",
                sample: {
                    gradeNames: ["fluid.littleComponent", "autoInit"],
                    testOpt: "testOpt"
                }
            },
            expected: {
                sample: {
                    gradeName: "fluid.tests.created.constructGrade.sample",
                    options: {
                        gradeNames: ["fluid.littleComponent", "autoInit"],
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
                expect: 7,
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
        "template": "%prefix/SeparatedPanelPrefsEditor.html"
    };

    fluid.tests.templatePrefix = {
        "templatePrefix": "templatePrefix"
    };

    fluid.tests.message = {
        "message": "%prefix/PrefsEditorTemplate-prefsEditor.json"
    };

    fluid.tests.messagePrefix = {
        "messagePrefix": "messagePrefix"
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

    fluid.defaults("fluid.tests.builder", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        testOpts: {
            topCommonOptions: {
                panels: {
                    selectors: {
                        cancel: ".flc-prefsEditor-cancel",
                        reset: ".flc-prefsEditor-reset",
                        save: ".flc-prefsEditor-save",
                        previewFrame : ".flc-prefsEditor-preview-frame"
                    }
                },
                templateLoader: {
                    templates: {
                        prefsEditor: "%prefix/SeparatedPanelPrefsEditor.html"
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
            builderEnactors: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.enactorsOnly", [fluid.tests.prefs, fluid.tests.enactors])
                }
            },
            builderPanels: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.panelsOnly", [fluid.tests.prefs, fluid.tests.panels]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderPanelsAndMessages: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.builderPanelsAndMessages", [fluid.tests.prefs, fluid.tests.panels, fluid.tests.message, fluid.tests.messagePrefix]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderPanelsAndTemplates: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.builderPanelsAndTemplates", [fluid.tests.prefs, fluid.tests.panels, fluid.tests.template, fluid.tests.templatePrefix]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderAll: {
                type: "fluid.prefs.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.all", [fluid.tests.prefs, fluid.tests.panels, fluid.tests.enactors, fluid.tests.message, fluid.tests.messagePrefix, fluid.tests.template, fluid.tests.templatePrefix]),
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
                enhancer: "fluid.prefs.builder.uie",
                prefsEditor: "fluid.prefs.builder.prefsEditor"
            }
        },
        modules: [{
            name: "fluid.prefs.builder - empty",
            tests: [{
                expect: 16,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderEmpty}", ["enactors", "messages", "panels", "rootModel", "templateLoader", "templatePrefix", "messageLoader", "messagePrefix"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEmpty}.options.assembledUIEGrade", {gradeNames: ["fluid.prefs.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEmpty}.options.assembledPrefsEditorGrade", {gradeNames: ["fluid.prefs.assembler.prefsEd"]}]
            }]
        }, {
            name: "fluid.prefs.builder - only enactors",
            tests: [{
                expect: 5,
                name: "enactors",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEnactors}.options.constructedGrades.enactors", "{builderEnactors}.options.auxSchema.enactors"]
            }, {
                expect: 4,
                name: "rootModel",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEnactors}.options.constructedGrades.rootModel", "{builderEnactors}.options.auxSchema.rootModel"]
            }, {
                expect: 8,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderEnactors}", ["messages", "panels", "templatePrefix", "messagePrefix"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEnactors}.options.assembledUIEGrade", {gradeNames: ["fluid.prefs.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEnactors}.options.assembledPrefsEditorGrade", {gradeNames: ["fluid.prefs.assembler.prefsEd"]}]
            }]
        }, {
            name: "fluid.prefs.builder - only panels",
            tests: [{
                expect: 5,
                name: "panels",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.options.constructedGrades.panels", "{builderPanels}.options.auxSchema.panels"]
            }, {
                expect: 4,
                name: "rootModel",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.options.constructedGrades.rootModel", "{builderPanels}.options.auxSchema.rootModel"]
            }, {
                expect: 4,
                name: "templateLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.options.constructedGrades.templateLoader", "{builderPanels}.options.auxSchema.templateLoader"]
            }, {
                expect: 4,
                name: "messageLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.options.constructedGrades.messageLoader", "{builderPanels}.options.auxSchema.messageLoader"]
            }, {
                expect: 8,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderPanels}", ["message", "enactors", "templatePrefix", "messagePrefix"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.options.assembledUIEGrade", {gradeNames: ["fluid.prefs.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.options.assembledPrefsEditorGrade", {gradeNames: ["fluid.prefs.assembler.prefsEd"]}]
            }]
        }, {
            name: "fluid.prefs.builder - panels & messages",
            tests: [{
                expect: 5,
                name: "panels",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.options.constructedGrades.panels", "{builderPanelsAndMessages}.options.auxSchema.panels"]
            }, {
                expect: 4,
                name: "messageLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.options.constructedGrades.messageLoader", "{builderPanelsAndMessages}.options.auxSchema.messageLoader"]
            }, {
                expect: 4,
                name: "messagePrefix",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.options.constructedGrades.messagePrefix", "{builderPanelsAndMessages}.options.auxSchema.messagePrefix"]
            }, {
                expect: 4,
                name: "rootModel",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.options.constructedGrades.rootModel", "{builderPanelsAndMessages}.options.auxSchema.rootModel"]
            }, {
                expect: 4,
                name: "templateLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.options.constructedGrades.templateLoader", "{builderPanelsAndMessages}.options.auxSchema.templateLoader"]
            }, {
                expect: 4,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderPanelsAndMessages}", ["enactors", "templatePrefix"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.options.assembledUIEGrade", {gradeNames: ["fluid.prefs.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.options.assembledPrefsEditorGrade", {gradeNames: ["fluid.prefs.assembler.prefsEd"]}]
            }]
        }, {
            name: "fluid.prefs.builder - panels & templates",
            tests: [{
                expect: 5,
                name: "panels",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndTemplates}.options.constructedGrades.panels", "{builderPanelsAndTemplates}.options.auxSchema.panels"]
            }, {
                expect: 4,
                name: "templatePrefix",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndTemplates}.options.constructedGrades.templatePrefix", "{builderPanelsAndTemplates}.options.auxSchema.templatePrefix"]
            }, {
                expect: 4,
                name: "rootModel",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndTemplates}.options.constructedGrades.rootModel", "{builderPanelsAndTemplates}.options.auxSchema.rootModel"]
            }, {
                expect: 4,
                name: "templateLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndTemplates}.options.constructedGrades.templateLoader", "{builderPanelsAndTemplates}.options.auxSchema.templateLoader"]
            }, {
                expect: 4,
                name: "messageLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndTemplates}.options.constructedGrades.messageLoader", "{builderPanelsAndTemplates}.options.auxSchema.messageLoader"]
            }, {
                expect: 4,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderPanelsAndTemplates}", ["enactors", "messagePrefix"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndTemplates}.options.assembledUIEGrade", {gradeNames: ["fluid.prefs.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndTemplates}.options.assembledPrefsEditorGrade", {gradeNames: ["fluid.prefs.assembler.prefsEd"]}]
            }]
        }, {
            name: "fluid.prefs.builder - all",
            tests: [{
                expect: 5,
                name: "panels",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.constructedGrades.panels", "{builderAll}.options.auxSchema.panels"]
            }, {
                expect: 4,
                name: "messageLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.constructedGrades.messageLoader", "{builderAll}.options.auxSchema.messageLoader"]
            }, {
                expect: 4,
                name: "messagePrefix",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.constructedGrades.messagePrefix", "{builderAll}.options.auxSchema.messagePrefix"]
            }, {
                expect: 5,
                name: "enactors",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.constructedGrades.enactors", "{builderAll}.options.auxSchema.enactors"]
            }, {
                expect: 4,
                name: "rootModel",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.constructedGrades.rootModel", "{builderAll}.options.auxSchema.rootModel"]
            }, {
                expect: 4,
                name: "templateLoader",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.constructedGrades.templateLoader", "{builderAll}.options.auxSchema.templateLoader"]
            }, {
                expect: 4,
                name: "templatePrefix",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.constructedGrades.templatePrefix", "{builderAll}.options.auxSchema.templatePrefix"]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.assembledUIEGrade", {gradeNames: ["fluid.prefs.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledPrefsEditorGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.assembledPrefsEditorGrade", {gradeNames: ["fluid.prefs.assembler.prefsEd"]}]
            }]
        }]
    });

    /**********************************
     * Builder munging tests          *
     **********************************/
    var prefsEditorType = "fluid.prefs.fullNoPreview", storeType = "fluid.tests.store", enhancerType = "fluid.tests.enhancer";
    var templatePrefix = "../../../../src/framework/preferences/html/";
    var messagePrefix = "../../../../src/framework/preferences/messages/";
    var prefsEdReady = false;

    fluid.defaults("fluid.tests.store", {
        gradeNames: ["fluid.globalSettingsStore", "autoInit"]
    });

    fluid.defaults("fluid.tests.enhancer", {
        gradeNames: ["fluid.pageEnhancer", "autoInit"]
    });

    fluid.defaults("fluid.tests.builderMunging", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        testOpts: {
            topCommonOptions: fluid.tests.topCommonOptions
        },
        components: {
            builder: {
                type: "fluid.prefs.builder",
                options: {
                    gradeNames: ["fluid.prefs.auxSchema.starter"],
                    auxiliarySchema: {
                        "template": "%prefix/FullNoPreviewPrefsEditor.html",
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
                    prefsEditorType: prefsEditorType,
                    storeType: storeType,
                    enhancerType: enhancerType,
                    templatePrefix: templatePrefix,
                    messagePrefix: messagePrefix,
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
                        onReady: function () {
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

        jqUnit.assertEquals("Munging options for templatePrefix should be passed down to the template loader", templatePrefix, prefsEditor.prefsEditorLoader.templateLoader.resourcePath.options.value);
        jqUnit.assertEquals("Munging options for messagePrefix should be passed down to the message loader", messagePrefix, prefsEditor.prefsEditorLoader.messageLoader.resourcePath.options.value);
        jqUnit.assertTrue("Munging options for onReady event should be passed down to the constructed pref editor", prefsEdReady);

        jqUnit.assertTrue(prefsEditorType + " should be in the base prefsEditor grades", fluid.hasGrade(prefsEditor.prefsEditorLoader.options, prefsEditorType));
        jqUnit.assertTrue(enhancerType + " should be in the base enhancer grades", fluid.hasGrade(prefsEditor.enhancer.options, enhancerType));
        jqUnit.assertTrue(storeType + " should be in the base store grades", fluid.hasGrade(prefsEditor.store.options, storeType));

        jqUnit.assertEquals("Munging options for enhancer should be passed down to the enhancer", "fl-aria", prefsEditor.enhancer.uiEnhancer.options.classnameMap["textFont.default"]);
    };

    fluid.defaults("fluid.tests.builderMungingTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Builder munging",
            tests: [{
                expect: 9,
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
     
    fluid.setLogging(fluid.logLevel.TRACE);

    fluid.registerNamespace("fluid.tests.composite");

    fluid.tests.composite.primarySchema = {
        "fluid.tests.composite.pref.speakText": {
            "type": "boolean",
            "default": false
        },
        "fluid.tests.composite.pref.increaseSize": {
            "type": "boolean",
            "default": false
        },
        "fluid.tests.composite.pref.magnification": {
            "type": "boolean",
            "default": false
        },
        "fluid.tests.composite.pref.lineSpace": {
            "type": "boolean",
            "default": false
        }
    };

    fluid.defaults("fluid.tests.composite.auxSchema", {
        gradeNames: ["fluid.prefs.auxSchema", "autoInit"],
        auxiliarySchema: {
            template: "%prefix/compositePrefsEditorTemplate.html",
            groups: {
                increasing: {
                    "container": ".fluid-tests-composite-increasing",
                    "template": "%prefix/increaseTemplate.html",
                    "type": "fluid.tests.composite.increase",
                    "panels": {
                        "always": ["incSize"],
                        "fluid.tests.composite.pref.increaseSize": ["magnify", "lineSpace"]
                    }
                }
            },
            speak: {
                type: "fluid.tests.composite.pref.speakText",
                panel: {
                    type: "fluid.tests.cmpPanel.speak",
                    container: ".fluid-tests-composite-speaking-onOff",
                    template: "%prefix/checkboxTemplate.html"
                }
            },
            incSize: {
                type: "fluid.tests.composite.pref.increaseSize",
                panel: {
                    type: "fluid.tests.cmpPanel.incSize",
                    container: ".fluid-tests-composite-increasing-onOff",
                    template: "%prefix/checkboxTemplate.html"
                }
            },
            magnify: {
                type: "fluid.tests.composite.pref.magnification",
                panel: {
                    type: "fluid.tests.cmpPanel.magFactor",
                    container: ".fluid-tests-composite-increasing-magFactor",
                    template: "%prefix/checkboxTemplate.html"
                }
            },
            lineSpace: {
                type: "fluid.tests.composite.pref.lineSpace",
                panel: {
                    type: "fluid.tests.cmpPanel.lineSpace",
                    container: ".fluid-tests-composite-increasing-lineSpace",
                    template: "%prefix/checkboxTemplate.html"
                }
            }
        }
    });

    fluid.defaults("fluid.tests.composite.increase", {
        gradeNames: ["fluid.prefs.compositePanel", "autoInit"],
        strings: {
            increaseHeader: "increase"
        },
        selectors: {
            label: ".fluid-tests-composite-increase-header"
        },
        protoTree: {
            label: {messagekey: "increaseHeader"}
        }
    });

    fluid.defaults("fluid.tests.cmpPanel.speak", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.tests.composite.pref.speakText": {
                "model.speakText": "default"
            }
        },
        selectors: {
            bool: ".fluid-tests-composite-input"
        },
        protoTree: {
            bool: "${speakText}"
        }
    });

    fluid.defaults("fluid.tests.cmpPanel.base", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        selectors: {
            bool: ".fluid-tests-composite-input"
        },
        protoTree: {
            bool: "${value}"
        }
    });

    fluid.defaults("fluid.tests.cmpPanel.incSize", {
        gradeNames: ["fluid.tests.cmpPanel.base", "autoInit"],
        preferenceMap: {
            "fluid.tests.composite.pref.increaseSize": {
                "model.value": "default"
            }
        }
    });

    fluid.defaults("fluid.tests.cmpPanel.magFactor", {
        gradeNames: ["fluid.tests.cmpPanel.base", "autoInit"],
        preferenceMap: {
            "fluid.tests.composite.pref.magnification": {
                "model.value": "default"
            }
        }
    });

    fluid.defaults("fluid.tests.cmpPanel.lineSpace", {
        gradeNames: ["fluid.tests.cmpPanel.base", "autoInit"],
        preferenceMap: {
            "fluid.tests.composite.pref.lineSpace": {
                "model.value": "default"
            }
        }
    });

    var builder = fluid.prefs.builder({
        gradeNames: ["fluid.tests.composite.auxSchema"],
        primarySchema: fluid.tests.composite.primarySchema,
        auxiliarySchema: {
            "templatePrefix": "../testResources/html/"
        }
    });

    fluid.defaults("fluid.tests.compositePrefsEditor", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            prefsEditor: {
                type: builder.options.assembledPrefsEditorGrade,
                container: ".fluid-tests-composite-prefsEditor",
                createOnEvent: "{prefsTester}.events.onTestCaseStart",
                options: {
                    prefsEditorType: "fluid.prefs.fullNoPreview"
                }
            },
            prefsTester: {
                type: "fluid.tests.composite.tester"
            }
        }
    });

    fluid.defaults("fluid.tests.composite.tester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Prefs editor with composite panel",
            tests: [{
                name: "Rendering",
                sequence: [{
                    listener: "fluid.tests.composite.tester.initialRendering",
                    event: "{compositePrefsEditor prefsEditor prefsEditorLoader prefsEditor}.events.onReady"
                }, {
                    func: "{prefsEditor}.prefsEditorLoader.prefsEditor.applier.requestChange",
                    args: ["fluid_tests_composite_pref_increaseSize", true]
                }, {
                    listener: "fluid.tests.composite.tester.conditionalCreation",
                    event: "{prefsEditor}.prefsEditorLoader.prefsEditor.increasing.events.afterRender",
                    priority: "last"
                }, {
                    func: "{prefsEditor}.prefsEditorLoader.prefsEditor.applier.requestChange",
                    args: ["fluid_tests_composite_pref_increaseSize", false]
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
        jqUnit.assertFalse("The single panel's checkbox should be in the correct state", singlePanel.locate("bool").val());
        jqUnit.assertEquals("The composite panel should be rendered correctly", "increase", compositePanel.locate("label").text());
        jqUnit.assertFalse("The composite panel's always on subpanel's checkbox should be in the correct state", compositePanel.fluid_tests_composite_pref_increaseSize.locate("bool").val());
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
                    "templatePrefix": "../../../../src/framework/preferences/html/",
                    "messagePrefix": "../../../../src/framework/preferences/messages/"
                }
            },
            prefsEditor: {
                prefsEditorType: "fluid.prefs.fullNoPreview"
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
                    "templatePrefix": "../../../../src/framework/preferences/html/",
                    "messagePrefix": "../../../../src/framework/preferences/messages/"
                }
            },
            prefsEditor: {
                prefsEditorType: "fluid.prefs.fullNoPreview"
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
