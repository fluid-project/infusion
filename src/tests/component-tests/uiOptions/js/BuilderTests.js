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

    /************************************************
     * fluid.uiOptions.builder.parseAuxSchema tests *
     ************************************************/

    fluid.tests.testparseAuxSchema = function (expected, funcArgs) {
        var actualFitler = fluid.invokeGlobalFunction("fluid.uiOptions.builder.parseAuxSchema", funcArgs);
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
                "namespace": "fluid.uiOptions.constructed", // The author of the auxiliary schema will provide this and will be the component to call to initialize the constructed UIO.
                "textSize": {
                    "type": "fluid.uiOptions.textSize",
                    "enactor": {
                        "type": "fluid.uiOptions.enactors.textSize"
                    },
                    "panel": {
                        "type": "fluid.uiOptions.panels.textSize",
                        "container": ".flc-uiOptions-text-size",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/UIOptionsTemplate-textSize.html",
                        "message": "%prefix/textSize.json"
                    }
                },
                "lineSpace": {
                    "type": "fluid.uiOptions.lineSpace",
                    "enactor": {
                        "type": "fluid.uiOptions.enactors.lineSpace",
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
                        "type": "fluid.uiOptions.panels.lineSpace",
                        "container": ".flc-uiOptions-line-space",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/UIOptionsTemplate-lineSpace.html",
                        "message": "%prefix/lineSpace.json"
                    }
                }
            },
            expectedTypeFilter: ["fluid.uiOptions.textSize", "fluid.uiOptions.lineSpace"]
        },
        modules: [{
            name: "fluid.uiOptions.builder.parseAuxSchema",
            tests: [{
                expect: 1,
                name: "grade creation",
                func: "fluid.tests.testparseAuxSchema",
                args: ["{that}.options.testOpts.expectedTypeFilter", ["{that}.options.testOpts.auxSchema"]]
            }]
        }]
    });

    /***********************************************
     * fluid.uiOptions.builder.generateGrade tests *
     ***********************************************/

    fluid.tests.testGenerateGrade = function (expectedOpts, funcArgs) {
        var gradeName = fluid.invokeGlobalFunction("fluid.uiOptions.builder.generateGrade", funcArgs);
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
            name: "fluid.uiOptions.builder.generateGrade",
            tests: [{
                expect: 4,
                name: "grade creation",
                func: "fluid.tests.testGenerateGrade",
                args: [{gradeNames: ["fluid.littleComponent", "autoInit"], members: {test: "test"}}, ["defaults", "fluid.tests.created", {gradeNames: ["fluid.littleComponent", "autoInit"], members: {test: "test"}}]]
            }]
        }]
    });

    /*************************************************
     * fluid.uiOptions.builder.constructGrades tests *
     *************************************************/

    fluid.tests.testConstructGrades = function (expected, funcArgs) {
        var gradeNames = fluid.invokeGlobalFunction("fluid.uiOptions.builder.constructGrades", funcArgs);

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
            name: "fluid.uiOptions.builder.constructGrade",
            tests: [{
                expect: 7,
                name: "generate grades",
                func: "fluid.tests.testConstructGrades",
                args: ["{that}.options.testOptions.expected", ["{that}.options.testOptions.mockAuxSchema", ["sample", "missing"]]]
            }]
        }]
    });

    /**********************************
     * fluid.uiOptions.builder. tests *
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
            "type": "fluid.uiOptions.textSize"
        }
    };

    fluid.tests.template = {
        "template": "%prefix/FatPanelUIOptions.html"
    };

    fluid.tests.templatePrefix = {
        "templatePrefix": "templatePrefix"
    };

    fluid.tests.message = {
        "message": "%prefix/UIOptionsTemplate-uiOptions.json"
    };

    fluid.tests.messagePrefix = {
        "messagePrefix": "messagePrefix"
    };

    fluid.tests.panels = {
        "textSize": {
            "panel": {
                "type": "fluid.uiOptions.panels.textSize",
                "container": ".flc-uiOptions-text-size",
                "template": "templates/textSize",
                "message": "messages/textSize"
            }
        }
    };

    fluid.tests.enactors = {
        "textSize": {
            "enactor": {
                "type": "fluid.uiOptions.enactors.textSize"
            }
        }
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
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.builderPanelsAndMessages", [fluid.tests.prefs, fluid.tests.panels, fluid.tests.message, fluid.tests.messagePrefix]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderPanelsAndTemplates: {
                type: "fluid.uiOptions.builder",
                options: {
                    auxiliarySchema: fluid.tests.assembleAuxSchema("fluid.tests.created.builderPanelsAndTemplates", [fluid.tests.prefs, fluid.tests.panels, fluid.tests.template, fluid.tests.templatePrefix]),
                    topCommonOptions: "{fluid.tests.builder}.options.testOpts.topCommonOptions"
                }
            },
            builderAll: {
                type: "fluid.uiOptions.builder",
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
                enhancer: "fluid.uiOptions.builder.uie",
                uiOptions: "fluid.uiOptions.builder.uio"
            }
        },
        modules: [{
            name: "fluid.uiOptions.builder - empty",
            tests: [{
                expect: 16,
                name: "not created",
                func: "fluid.tests.testNotCreated",
                args: ["{builderEmpty}", ["enactors", "messages", "panels", "rootModel", "templateLoader", "templatePrefix", "messageLoader", "messagePrefix"]]
            }, {
                expect: 2,
                name: "assembledUIEGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEmpty}.options.assembledUIEGrade", {gradeNames: ["fluid.uiOptions.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledUIOGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEmpty}.options.assembledUIOGrade", {gradeNames: ["fluid.uiOptions.assembler.uio"]}]
            }]
        }, {
            name: "fluid.uiOptions.builder - only enactors",
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
                args: ["{builderEnactors}.options.assembledUIEGrade", {gradeNames: ["fluid.uiOptions.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledUIOGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderEnactors}.options.assembledUIOGrade", {gradeNames: ["fluid.uiOptions.assembler.uio"]}]
            }]
        }, {
            name: "fluid.uiOptions.builder - only panels",
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
                args: ["{builderPanels}.options.assembledUIEGrade", {gradeNames: ["fluid.uiOptions.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledUIOGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanels}.options.assembledUIOGrade", {gradeNames: ["fluid.uiOptions.assembler.uio"]}]
            }]
        }, {
            name: "fluid.uiOptions.builder - panels & messages",
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
                args: ["{builderPanelsAndMessages}.options.assembledUIEGrade", {gradeNames: ["fluid.uiOptions.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledUIOGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndMessages}.options.assembledUIOGrade", {gradeNames: ["fluid.uiOptions.assembler.uio"]}]
            }]
        }, {
            name: "fluid.uiOptions.builder - panels & templates",
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
                args: ["{builderPanelsAndTemplates}.options.assembledUIEGrade", {gradeNames: ["fluid.uiOptions.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledUIOGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderPanelsAndTemplates}.options.assembledUIOGrade", {gradeNames: ["fluid.uiOptions.assembler.uio"]}]
            }]
        }, {
            name: "fluid.uiOptions.builder - all",
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
                args: ["{builderAll}.options.assembledUIEGrade", {gradeNames: ["fluid.uiOptions.assembler.uie"]}]
            }, {
                expect: 2,
                name: "assembledUIOGrade",
                func: "fluid.tests.assertDefaults",
                args: ["{builderAll}.options.assembledUIOGrade", {gradeNames: ["fluid.uiOptions.assembler.uio"]}]
            }]
        }]
    });

    /**********************************
     * Builder munging tests          *
     **********************************/
    var uioType = "fluid.uiOptions.fullNoPreview";

    fluid.defaults("fluid.tests.builderMunging", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        testOpts: {
            topCommonOptions: fluid.tests.topCommonOptions
        },
        components: {
            builder: {
                type: "fluid.uiOptions.builder",
                options: {
                    gradeNames: ["fluid.uiOptions.auxSchema.starter"],
                    auxiliarySchema: {
                        "templatePrefix": "../../../../components/uiOptions/html/",
                        "messagePrefix": "../../../../components/uiOptions/messages/",
                        "template": "%prefix/FullNoPreviewUIOptions.html",
                        "tableOfContents": {
                            "enactor": {
                                "tocTemplate": "../../../../components/tableOfContents/html/TableOfContents.html"
                            }
                        }
                    }
                }
            },
            uio: {
                type: "fluid.viewComponent",
                container: "#flc-uiOptions",
                createOnEvent: "{builderMungingTester}.events.onTestCaseStart",
                options: {
                    gradeNames: ["{builder}.options.assembledUIOGrade"],
                    uioType: uioType,
                    enhancer: {
                        classnameMap: {
                            "textFont.default": "fl-aria"
                        }
                    },
                    uiOptions: {
                        listeners: {
                            onReady: {
                                listener: "{uio}.events.onReady",
                                args: "{uio}"
                            }
                        },
                        userOption: 1
                    },
                    events: {
                        onReady: null
                    }
                }
            },
            builderMungingTester: {
                type: "fluid.tests.builderMungingTester"
            }
        }
    });

    fluid.tests.assertBuilderMunging = function (uio) {
        return function (uio) {
            jqUnit.assertEquals("Munging options for UIO options should be passed down to the uiOptions", 1, uio.uiOptionsLoader.uiOptions.options.userOption);

            jqUnit.assertTrue(uioType + " should be in the base uio grades", fluid.hasGrade(uio.uiOptionsLoader.options, uioType));
            jqUnit.assertEquals("Munging options for enhancer should be passed down to the enhancer", "fl-aria", uio.enhancer.uiEnhancer.options.classnameMap["textFont.default"]);
        };
    };

    fluid.defaults("fluid.tests.builderMungingTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Builder munging",
            tests: [{
                expect: 3,
                name: "Builder munging",
                sequence: [{
                    listenerMaker: "fluid.tests.assertBuilderMunging",
                    spec: {priority: "last"},
                    event: "{builderMunging uio}.events.onReady"
                }]
            }]
        }]
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
            "fluid.tests.builderMunging"
        ]);
    });

})(jQuery);
