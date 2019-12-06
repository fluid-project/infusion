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

    /*******************************************************************************
     * Unit tests for fluid.prefs.expandSchemaValue
     *******************************************************************************/

    fluid.defaults("fluid.tests.expandSchemaValueTest", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            expandSchemaValueTester: {
                type: "fluid.tests.expandSchemaValueTester"
            }
        }
    });

    fluid.tests.testExpandSchemaValue = function (source, templates, expectedValues) {
        for (var i = 0; i < templates.length; i++) {
            var value = fluid.prefs.expandSchemaValue(source, templates[i]);
            jqUnit.assertEquals("Template \"" + templates[i] + "\" has been expanded correctly", expectedValues[i], value);
        }
    };

    fluid.defaults("fluid.tests.expandSchemaValueTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            source: {
                path1: "value1",
                path2: {
                    nestedPath2: "value2"
                }
            },
            templates: ["@path1", "@path2.nestedPath2", "@path3"],
            expectedReturns: ["value1", "value2", undefined]
        },
        modules: [{
            name: "Test expanding templates to retrieve schema values",
            tests: [{
                expect: 3,
                name: "Expand templates to retrieve schema values",
                type: "test",
                func: "fluid.tests.testExpandSchemaValue",
                args: ["{that}.options.testOptions.source", "{that}.options.testOptions.templates", "{that}.options.testOptions.expectedReturns"]
            }]
        }]
    });

    /*******************************************************************************
     * shared schema test resources
     *******************************************************************************/

    fluid.tests.schema = {
        "namespace": "fluid.tests.prefsEditor",
        "textFont": {
            "type": "fluid.prefs.textFont",
            "classes": {
                "default": "",
                "times": "fl-font-times",
                "comic": "fl-font-comic-sans",
                "arial": "fl-font-arial",
                "verdana": "fl-font-verdana",
                "open-dyslexic": "fl-font-open-dyslexic"
            }
        },
        "contrast": {
            "type": "fluid.prefs.contrast",
            "classes": {
                "default": "fl-theme-prefsEditor-default",
                "bw": "fl-theme-bw",
                "wb": "fl-theme-wb",
                "by": "fl-theme-by",
                "yb": "fl-theme-yb"
            }
        },
        "enactors": [{
            "type": "fluid.prefs.enactor.textFont",
            "classes": "@textFont.classes"
        }, {
            "type": "fluid.prefs.enactor.contrast",
            "classes": "@contrast.classes"
        }, {
            "type": "fluid.prefs.enactor.tableOfContents",
            "template": "the-location-of-toc-template",
            "random": "@random.path"
        }],
        "panels": [{
            "type": "fluid.prefs.panel.textFont",
            "container": ".flc-prefsEditor-text-font",
            "classnameMap": "@textFont.classes",
            "template": "templates/textFont"
        }, {
            "type": "fluid.prefs.panel.contrast",
            "container": ".flc-prefsEditor-contrast",
            "classnameMap": "@contrast.classes",
            "template": "templates/contrast"
        }]
    };

    fluid.tests.expectedSchema = {
        "namespace": "fluid.tests.prefsEditor",
        "textFont": {
            "type": "fluid.prefs.textFont",
            "classes": {
                "default": "",
                "times": "fl-font-times",
                "comic": "fl-font-comic-sans",
                "arial": "fl-font-arial",
                "verdana": "fl-font-verdana",
                "open-dyslexic": "fl-font-open-dyslexic"
            }
        },
        "contrast": {
            "type": "fluid.prefs.contrast",
            "classes": {
                "default": "fl-theme-prefsEditor-default",
                "bw": "fl-theme-bw",
                "wb": "fl-theme-wb",
                "by": "fl-theme-by",
                "yb": "fl-theme-yb"
            }
        },
        "enactors": [{
            "type": "fluid.prefs.enactor.textFont",
            "classes": {
                "default": "",
                "times": "fl-font-times",
                "comic": "fl-font-comic-sans",
                "arial": "fl-font-arial",
                "verdana": "fl-font-verdana",
                "open-dyslexic": "fl-font-open-dyslexic"
            }
        }, {
            "type": "fluid.prefs.enactor.contrast",
            "classes": {
                "default": "fl-theme-prefsEditor-default",
                "bw": "fl-theme-bw",
                "wb": "fl-theme-wb",
                "by": "fl-theme-by",
                "yb": "fl-theme-yb"
            }
        }, {
            "type": "fluid.prefs.enactor.tableOfContents",
            "random": undefined,
            "template": "the-location-of-toc-template"
        }],
        "panels": [{
            "type": "fluid.prefs.panel.textFont",
            "container": ".flc-prefsEditor-text-font",
            "classnameMap": {
                "default": "",
                "times": "fl-font-times",
                "comic": "fl-font-comic-sans",
                "arial": "fl-font-arial",
                "verdana": "fl-font-verdana",
                "open-dyslexic": "fl-font-open-dyslexic"
            },
            "template": "templates/textFont"
        }, {
            "type": "fluid.prefs.panel.contrast",
            "container": ".flc-prefsEditor-contrast",
            "classnameMap": {
                "default": "fl-theme-prefsEditor-default",
                "bw": "fl-theme-bw",
                "wb": "fl-theme-wb",
                "by": "fl-theme-by",
                "yb": "fl-theme-yb"
            },
            "template": "templates/contrast"
        }]
    };

    /*******************************************************************************
     * Unit tests for fluid.prefs.schemaExpander
     *******************************************************************************/

// TODO: It is unnecessary for this to use the IoC testing framework, there is no asynchrony

    fluid.tests.testSchemaExpander = function (schema, expectedOutput) {
        var output = fluid.prefs.expandSchemaImpl(schema);
        jqUnit.assertDeepEq("The source schema is expanded correctly", expectedOutput, output);
    };

    fluid.defaults("fluid.tests.schemaExpanderTest", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            schemaExpanderTester: {
                type: "fluid.tests.schemaExpanderTester"
            }
        }
    });

    fluid.defaults("fluid.tests.schemaExpanderTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            schema: fluid.tests.schema,
            expectedSchema: fluid.tests.expectedSchema
        },
        modules: [{
            name: "Test schema expander",
            tests: [{
                expect: 1,
                name: "Schema expander",
                type: "test",
                func: "fluid.tests.testSchemaExpander",
                args: ["{that}.options.testOptions.schema", "{that}.options.testOptions.expectedSchema"]
            }]
        }]
    });

    /*******************************************************************************
     * Shared variables by following unit tests
     *******************************************************************************/

// TODO: Why did we take out all the IoC references in these keys?
    fluid.tests.elementCommonOptions = {
        panel: {
            "createOnEvent": "onPrefsEditorMarkupReady",
            "container": "prefsEditor.dom.%prefKey",
            "options.gradeNames": "fluid.prefs.prefsEditorConnections",
            "options.members.resources.template": "templateLoader.resources.%prefKey"
        },
        panelModel: {
            "%internalModelName": "prefsEditor.model.preferences.%externalModelName"
        },
        compositePanelBasedOnSub: {
            "%subPrefKey": "templateLoader.resources.%subPrefKey"
        },
        subPanel: {
            "container": "%compositePanel.dom.%prefKey"
        },
        enactor: {
            "container": "uiEnhancer.container"
        },
        enactorModel: {
            "%internalModelName": "uiEnhancer.model.preferences.%externalModelName"
        }
    };

    /*******************************************************************************
     * Unit tests for fluid.prefs.expandSchemaComponents
     *******************************************************************************/

    fluid.tests.testExpandSchemaComponents = function (auxSchema, type, prefKey, alias, componentConfig, index, primarySchema, expectedOutput) {
        var panelsCommonOptions = fluid.get(fluid.tests.elementCommonOptions, "panel");
        var panelModelOptions = fluid.get(fluid.tests.elementCommonOptions, "panelModel");
        var output = fluid.prefs.expandSchemaComponents(auxSchema, type, prefKey, alias, componentConfig, index, panelsCommonOptions, panelModelOptions, primarySchema);
        jqUnit.assertDeepEq("The components and templates blocks are constructed correctly", expectedOutput, output);
    };

    fluid.defaults("fluid.tests.prefs.panel.contrast", {
        gradeNames: ["fluid.prefs.panel.contrast"],
        preferenceMap: {
            "fluid.prefs.contrast": {
                "model.value": "value",
                "model.type": "type",
                "controlValues.theme": "enum"
            }
        }
    });

    fluid.defaults("fluid.tests.expandSchemaComponentsTest", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            schemaExpanderTester: {
                type: "fluid.tests.expandSchemaComponentsTester"
            }
        }
    });

    fluid.defaults("fluid.tests.expandSchemaComponentsTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        mergePolicy: {
            "testOptions.expectedOutput": "noexpand"
        },
        testOptions: {
            auxSchema: {
                "contrast": {
                    "type": "fluid.prefs.contrast",
                    "classes": {
                        "default": "fl-theme-prefsEditor-default",
                        "bw": "fl-theme-bw",
                        "wb": "fl-theme-wb",
                        "by": "fl-theme-by",
                        "yb": "fl-theme-yb"
                    },
                    "panel": {
                        "type": "fluid.tests.prefs.panel.contrast",
                        "container": ".flc-prefsEditor-contrast",  // the css selector in the template where the panel is rendered
                        "gradeNames": ["fluid.tests.panelGrade"],
                        "classnameMap": {
                            "default": "fl-theme-prefsEditor-default",
                            "bw": "fl-theme-bw",
                            "wb": "fl-theme-wb",
                            "by": "fl-theme-by",
                            "yb": "fl-theme-yb"
                        },
                        "template": "templates/contrast",
                        "message": "messages/contrast"
                    }
                }
            },
            index: {
                "fluid.prefs.contrast": ["fluid.tests.prefs.panel.contrast"]
            },
            primarySchema: {
                "fluid.prefs.contrast": {
                    "type": "string",
                    "default": "default",
                    "enum": ["default", "bw", "wb", "by", "yb"],
                    "enumLabels": [
                        "contrast-default",
                        "contrast-bw",
                        "contrast-wb",
                        "contrast-by",
                        "contrast-yb"
                    ]
                }
            },
            expectedOutput: {
                "contrast": {
                    "type": "fluid.prefs.contrast",
                    "classes": {
                        "default": "fl-theme-prefsEditor-default",
                        "bw": "fl-theme-bw",
                        "wb": "fl-theme-wb",
                        "by": "fl-theme-by",
                        "yb": "fl-theme-yb"
                    },
                    "panel": {
                        "type": "fluid.tests.prefs.panel.contrast",
                        "container": ".flc-prefsEditor-contrast",  // the css selector in the template where the panel is rendered
                        "gradeNames": ["fluid.tests.panelGrade"],
                        "classnameMap": {
                            "default": "fl-theme-prefsEditor-default",
                            "bw": "fl-theme-bw",
                            "wb": "fl-theme-wb",
                            "by": "fl-theme-by",
                            "yb": "fl-theme-yb"
                        },
                        "template": "templates/contrast",
                        "message": "messages/contrast"
                    }
                },
                panels: {
                    selectors: {
                        "fluid_tests_prefs_panel_contrast": ".flc-prefsEditor-contrast"
                    },
                    components: {
                        "fluid_tests_prefs_panel_contrast": {
                            type: "fluid.tests.prefs.panel.contrast",
                            container: "prefsEditor.dom.fluid_tests_prefs_panel_contrast",
                            createOnEvent: "onPrefsEditorMarkupReady",
                            options: {
                                gradeNames: ["fluid.tests.panelGrade", "fluid.prefs.prefsEditorConnections"],
                                classnameMap: {
                                    "default": "fl-theme-prefsEditor-default",
                                    "bw": "fl-theme-bw",
                                    "wb": "fl-theme-wb",
                                    "by": "fl-theme-by",
                                    "yb": "fl-theme-yb"
                                },
                                model: {
                                    value: "prefsEditor.model.preferences.fluid_prefs_contrast",
                                    type: "string"
                                },
                                controlValues: {
                                    theme: ["default", "bw", "wb", "by", "yb"]
                                },
                                stringArrayIndex: {
                                    theme: [
                                        "contrast-default",
                                        "contrast-bw",
                                        "contrast-wb",
                                        "contrast-by",
                                        "contrast-yb"
                                    ]
                                },
                                members: {
                                    resources: {
                                        template: "templateLoader.resources.fluid_tests_prefs_panel_contrast"
                                    }
                                }
                            }
                        }
                    }
                },
                aliases_enhancer: {
                    model: {
                        "contrast": "{that}.model.fluid_prefs_contrast"
                    }
                },
                aliases_prefsEditor: {
                    model: {
                        preferences: {
                            "contrast": "{that}.model.preferences.fluid_prefs_contrast"
                        }
                    }
                },
                templateLoader: {
                    resources: {
                        "fluid_tests_prefs_panel_contrast": "templates/contrast"
                    }
                },
                messageLoader: {
                    resources: {
                        "fluid_tests_prefs_panel_contrast": "messages/contrast"
                    }
                },
                initialModel: {
                    members: {
                        initialModel: {
                            preferences: {
                                "contrast": "default",
                                "fluid_prefs_contrast": "default"
                            }
                        }
                    }
                }
            }
        },
        modules: [{
            name: "Test component expander",
            tests: [{
                expect: 1,
                name: "Component expander based on schema",
                type: "test",
                func: "fluid.tests.testExpandSchemaComponents",
                args: ["{that}.options.testOptions.auxSchema", "panels", "{that}.options.testOptions.auxSchema.contrast.type", "contrast", "{that}.options.testOptions.auxSchema.contrast.panel",
                    "{that}.options.testOptions.index", "{that}.options.testOptions.primarySchema", "{that}.options.testOptions.expectedOutput"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.prefs.expandSchemaDirectOption
     *******************************************************************************/

    fluid.tests.testExpandSchemaDirectOption = function (auxSchema, rules, expectedOutput) {
        fluid.each(rules, function (targetPath, sourcePath) {
            fluid.prefs.expandSchemaDirectOption(auxSchema, sourcePath, targetPath);
        });
        jqUnit.assertDeepEq("The components and templates blocks are constructed correctly", expectedOutput, auxSchema);
    };

    fluid.defaults("fluid.tests.expandSchemaDirectOptionTest", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            schemaExpanderTester: {
                type: "fluid.tests.expandSchemaDirectOptionTester"
            }
        }
    });

    fluid.defaults("fluid.tests.expandSchemaDirectOptionTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        testOptions: {
            auxSchema: {
                objectValue: {
                    key1: "value1"
                },
                arrayValue: ["string1", "string2"],
                stringValue: "a test string"
            },
            rules: {
                objectValue: "oPath1.oPath2",
                arrayValue: "aPath1.aPath2",
                stringValue: "sPath1.sPath2"
            },
            expectedOutput: {
                oPath1: {
                    oPath2: {
                        key1: "value1"
                    }
                },
                aPath1: {
                    aPath2: ["string1", "string2"]
                },
                sPath1: {
                    sPath2: "a test string"
                }
            }
        },
        modules: [{
            name: "Test direct option expander",
            tests: [{
                expect: 1,
                name: "Option expander based on schema and rules",
                type: "test",
                func: "fluid.tests.testExpandSchemaDirectOption",
                args: ["{that}.options.testOptions.auxSchema", "{that}.options.testOptions.rules", "{that}.options.testOptions.expectedOutput"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for fluid.prefs.auxbuilder
     *******************************************************************************/

    fluid.registerNamespace("fluid.tests.auxSchema");

    fluid.tests.assertIsEmptyExpandedAuxSchema = function (expandedAuxSchema) {
        var schemaKeys = fluid.keys(expandedAuxSchema).sort();
        var expectedKeys = [
            "loaderGrades",
            "namespace",
            "terms",
            "templateLoader",
            "messageLoader"
        ].sort();

        jqUnit.assertDeepEq("Only namespace and loaderGrades are in the expanded aux schema", expectedKeys, schemaKeys);
    };

    fluid.tests.testEmpty = function (expandedAuxSchema) {
        var namespace = fluid.get(expandedAuxSchema, "namespace");

        jqUnit.assertTrue("The prefsEditor grade should use the custom namespace", namespace.indexOf("fluid.prefs.created_") === 0);
        fluid.tests.assertIsEmptyExpandedAuxSchema(expandedAuxSchema);
    };

    fluid.tests.testAuxBuilder = function (expandedSchema, expectedExpandedSchema) {
        jqUnit.assertDeepEq("The schema was expanded correctly", expectedExpandedSchema, expandedSchema);
    };

    fluid.tests.auxSchema.customizedNamespace = "fluid.prefs.constructedPrefsEditor";

    fluid.tests.auxSchema.panels = {
        "textSize": {
            "type": "fluid.prefs.textSize",
            "panel": {
                "type": "fluid.prefs.panel.textSize",
                "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/PrefsEditorTemplate-textSize-nativeHTML.html",
                "message": "%messagePrefix/PrefsEditorTemplate-textSize.json"
            }
        }
    };

    fluid.defaults("fluid.prefs.panel.oneForManyPrefs", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.emphasizeLinks": {
                "model.links": "value"
            },
            "fluid.prefs.inputsLarger": {
                "model.inputsLarger": "value"
            }
        }
    });

    fluid.tests.auxSchema.manyPrefsOnePanel = {
        "emphasizeLinks": {
            "type": "fluid.prefs.emphasizeLinks",
            "panel": {
                "type": "fluid.prefs.panel.oneForManyPrefs",
                "container": ".flc-prefsEditor-links-controls",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/PrefsEditorTemplate-linksControls.html",
                "message": "%messagePrefix/PrefsEditorTemplate-linksControls.json"
            }
        },
        "inputsLarger": {
            "type": "fluid.prefs.inputsLarger",
            "panel": {
                "type": "fluid.prefs.panel.oneForManyPrefs"
            }
        }
    };

    fluid.defaults("fluid.prefs.panel.otherTextSize", {
        gradeNames: ["fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.textSize": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        range: {
            min: 0,
            max: 100
        }
    });

    fluid.tests.auxSchema.manyPanelsOnePref = {
        "textSize": {
            "type": "fluid.prefs.textSize",
            "panel": {
                "type": "fluid.prefs.panel.textSize",
                "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/PrefsEditorTemplate-textSize-nativeHTML.html",
                "message": "%messagePrefix/PrefsEditorTemplate-textSize.json"
            }
        },
        "textSize.other": {
            "type": "fluid.prefs.textSize",
            "panel": {
                "type": "fluid.prefs.panel.otherTextSize",
                "container": ".flc-prefsEditor-otherTextSize",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/PrefsEditorTemplate-otherTextSize.html",
                "message": "%messagePrefix/PrefsEditorTemplate-otherTextSize.json"
            }
        }
    };

    fluid.tests.auxSchema.enactors = {
        "textSize": {
            "type": "fluid.prefs.textSize",
            "enactor": {
                "type": "fluid.prefs.enactor.textSize"
            }
        }
    };

    fluid.tests.auxSchema.namespace = {
        "namespace": fluid.tests.auxSchema.customizedNamespace
    };

    fluid.tests.auxSchema.template = {
        "template": "%templatePrefix/SeparatedPanelPrefsEditor.html"
    };

    fluid.tests.auxSchema.terms = {
        "terms": {
            templatePrefix: "../html",
            messagePrefix: "../messages"
        }
    };

    fluid.tests.auxSchema.message = {
        "message": "%messagePrefix/PrefsEditorTemplate-prefsEditor.json"
    };

    fluid.tests.auxSchema.mappedDefaults = {
        "fluid.prefs.textSize": {
            "type": "number",
            "default": 1,
            "minimum": 1,
            "maximum": 2,
            "multipleOf": 0.1
        },
        "fluid.prefs.emphasizeLinks": {
            "type": "boolean",
            "default": false
        },
        "fluid.prefs.inputsLarger": {
            "type": "boolean",
            "default": false
        }
    };

    fluid.tests.auxSchema.expectedEnactors = {
        "namespace": fluid.tests.auxSchema.customizedNamespace,
        "loaderGrades": ["fluid.prefs.separatedPanel"],
        "textSize": {
            "type": "fluid.prefs.textSize",
            "enactor": {
                "type": "fluid.prefs.enactor.textSize"
            }
        },
        enactors: {
            "gradeNames": ["fluid.uiEnhancer"],
            "selectors": {},
            "components": {
                "fluid_prefs_enactor_textSize": {
                    type: "fluid.prefs.enactor.textSize",
                    container: "uiEnhancer.container",
                    options: {
                        model: {
                            value: "uiEnhancer.model.preferences.fluid_prefs_textSize"
                        }
                    }
                }
            }
        },
        initialModel: {
            gradeNames: ["fluid.prefs.initialModel"],
            members: {
                initialModel: {
                    preferences: {
                        fluid_prefs_textSize: 1
                    }
                }
            }
        },
        aliases_enhancer: {
            gradeNames: ["fluid.modelComponent"],
            model: {}
        },
        aliases_prefsEditor: {
            gradeNames: ["fluid.modelComponent"],
            model: {
                preferences: {}
            }
        },
        messageLoader: {
            gradeNames: ["fluid.resourceLoader"],
            resources: {
                "prefsEditor": "%messagePrefix/prefsEditor.json"
            }
        },
        templateLoader: {
            gradeNames: ["fluid.resourceLoader"],
            resources: {
                "prefsEditor": "%templatePrefix/SeparatedPanelPrefsEditor.html"
            }
        },
        terms: {
            gradeNames: ["fluid.component"],
            terms: {
                "messagePrefix": "../../framework/preferences/messages",
                "templatePrefix": "../../framework/preferences/html"
            }
        }
    };

    fluid.tests.auxSchema.expectedPanels = {
        "namespace": fluid.tests.auxSchema.customizedNamespace,
        "loaderGrades": ["fluid.prefs.separatedPanel"],
        "textSize": {
            "type": "fluid.prefs.textSize",
            "panel": {
                "type": "fluid.prefs.panel.textSize",
                "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/PrefsEditorTemplate-textSize-nativeHTML.html",
                "message": "%messagePrefix/PrefsEditorTemplate-textSize.json"
            }
        },
        panels: {
            "gradeNames": ["fluid.prefs.prefsEditor"],
            "selectors": {
                "fluid_prefs_panel_textSize": ".flc-prefsEditor-text-size"
            },
            "components": {
                "fluid_prefs_panel_textSize": {
                    "type": "fluid.prefs.panel.textSize",
                    "container": "prefsEditor.dom.fluid_prefs_panel_textSize",
                    "createOnEvent": "onPrefsEditorMarkupReady",
                    options: {
                        gradeNames: ["fluid.prefs.prefsEditorConnections"],
                        model: {
                            value: "prefsEditor.model.preferences.fluid_prefs_textSize"
                        },
                        range: {
                            min: 1,
                            max: 2
                        },
                        step: 0.1,
                        messageBase: "{messageLoader}.resources.fluid_prefs_panel_textSize.parsed",
                        members: {
                            resources: {
                                template: "templateLoader.resources.fluid_prefs_panel_textSize"
                            }
                        }
                    }
                }
            }
        },
        aliases_enhancer: {
            gradeNames: ["fluid.modelComponent"],
            model: {}
        },
        aliases_prefsEditor: {
            gradeNames: ["fluid.modelComponent"],
            model: {
                preferences: {}
            }
        },
        templateLoader: {
            gradeNames: ["fluid.resourceLoader"],
            resources: {
                "fluid_prefs_panel_textSize": "%templatePrefix/PrefsEditorTemplate-textSize-nativeHTML.html",
                "prefsEditor": "%templatePrefix/SeparatedPanelPrefsEditor.html"
            }
        },
        messageLoader: {
            gradeNames: ["fluid.resourceLoader"],
            resources: {
                "fluid_prefs_panel_textSize": "%messagePrefix/PrefsEditorTemplate-textSize.json",
                "prefsEditor": "%messagePrefix/prefsEditor.json"
            }
        },
        terms: {
            gradeNames: ["fluid.component"],
            terms: {
                templatePrefix: "../html",
                messagePrefix: "../messages"
            }
        },
        initialModel: {
            gradeNames: ["fluid.prefs.initialModel"],
            members: {
                initialModel: {
                    preferences: {
                        fluid_prefs_textSize: 1
                    }
                }
            }
        }
    };

    fluid.defaults("fluid.tests.auxBuilderTest", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            auxbuilderEmpty: {
                type: "fluid.prefs.auxBuilder",
                options: {
                    auxiliarySchema: fluid.tests.auxSchema.prefs,
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderOnlyEnactor: {
                type: "fluid.prefs.auxBuilder",
                options: {
                    auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.enactors, fluid.tests.auxSchema.namespace),
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderOnlyPanel: {
                type: "fluid.prefs.auxBuilder",
                options: {
                    auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.panels, fluid.tests.auxSchema.namespace, fluid.tests.auxSchema.terms),
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderManyPanelsOnePref: {
                type: "fluid.prefs.auxBuilder",
                options: {
                    auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.manyPanelsOnePref, fluid.tests.auxSchema.namespace, fluid.tests.auxSchema.terms),
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderManyPrefsOnePanel: {
                type: "fluid.prefs.auxBuilder",
                options: {
                    auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.manyPrefsOnePanel, fluid.tests.auxSchema.namespace, fluid.tests.auxSchema.terms),
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderAll: {
                type: "fluid.prefs.auxBuilder",
                options: {
                    auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.enactors, fluid.tests.auxSchema.panels, fluid.tests.auxSchema.namespace, fluid.tests.auxSchema.messages, fluid.tests.auxSchema.terms, fluid.tests.auxSchema.template, fluid.tests.auxSchema.message),
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxBuilderTester: {
                type: "fluid.tests.auxBuilderTester"
            }
        }
    });

    fluid.defaults("fluid.tests.auxBuilderTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        mergePolicy: {
            testOptions: {
                noexpand: true
            }
        },
        testOptions: {
            expectedPanels: fluid.tests.auxSchema.expectedPanels,
            expectedEnactors: fluid.tests.auxSchema.expectedEnactors,
            expectedManyPanelsOnePref: {
                "namespace": fluid.tests.auxSchema.customizedNamespace,
                "loaderGrades": ["fluid.prefs.separatedPanel"],
                "textSize": {
                    "type": "fluid.prefs.textSize",
                    "panel": {
                        "type": "fluid.prefs.panel.textSize",
                        "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                        "template": "%templatePrefix/PrefsEditorTemplate-textSize-nativeHTML.html",
                        "message": "%messagePrefix/PrefsEditorTemplate-textSize.json"
                    }
                },
                "textSize.other": {
                    "type": "fluid.prefs.textSize",
                    "panel": {
                        "type": "fluid.prefs.panel.otherTextSize",
                        "container": ".flc-prefsEditor-otherTextSize",  // the css selector in the template where the panel is rendered
                        "template": "%templatePrefix/PrefsEditorTemplate-otherTextSize.html",
                        "message": "%messagePrefix/PrefsEditorTemplate-otherTextSize.json"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.prefs.prefsEditor"],
                    "selectors": {
                        "fluid_prefs_panel_textSize": ".flc-prefsEditor-text-size",
                        "fluid_prefs_panel_otherTextSize": ".flc-prefsEditor-otherTextSize"
                    },
                    "components": {
                        "fluid_prefs_panel_textSize": {
                            "type": "fluid.prefs.panel.textSize",
                            "container": "prefsEditor.dom.fluid_prefs_panel_textSize",
                            "createOnEvent": "onPrefsEditorMarkupReady",
                            options: {
                                gradeNames: ["fluid.prefs.prefsEditorConnections"],
                                model: {
                                    value: "prefsEditor.model.preferences.fluid_prefs_textSize"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                step: 0.1,
                                messageBase: "{messageLoader}.resources.fluid_prefs_panel_textSize.parsed",
                                members: {
                                    resources: {
                                        template: "templateLoader.resources.fluid_prefs_panel_textSize"
                                    }
                                }
                            }
                        },
                        "fluid_prefs_panel_otherTextSize": {
                            "type": "fluid.prefs.panel.otherTextSize",
                            "container": "prefsEditor.dom.fluid_prefs_panel_otherTextSize",
                            "createOnEvent": "onPrefsEditorMarkupReady",
                            options: {
                                gradeNames: ["fluid.prefs.prefsEditorConnections"],
                                model: {
                                    value: "prefsEditor.model.preferences.fluid_prefs_textSize"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                messageBase: "{messageLoader}.resources.fluid_prefs_panel_otherTextSize.parsed",
                                members: {
                                    resources: {
                                        template: "templateLoader.resources.fluid_prefs_panel_otherTextSize"
                                    }
                                }
                            }
                        }
                    }
                },
                aliases_enhancer: {
                    gradeNames: ["fluid.modelComponent"],
                    model: {}
                },
                aliases_prefsEditor: {
                    gradeNames: ["fluid.modelComponent"],
                    model: {
                        preferences: {}
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.resourceLoader"],
                    resources: {
                        "fluid_prefs_panel_textSize": "%templatePrefix/PrefsEditorTemplate-textSize-nativeHTML.html",
                        "fluid_prefs_panel_otherTextSize": "%templatePrefix/PrefsEditorTemplate-otherTextSize.html",
                        "prefsEditor": "%templatePrefix/SeparatedPanelPrefsEditor.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.resourceLoader"],
                    resources: {
                        "fluid_prefs_panel_textSize": "%messagePrefix/PrefsEditorTemplate-textSize.json",
                        "fluid_prefs_panel_otherTextSize": "%messagePrefix/PrefsEditorTemplate-otherTextSize.json",
                        "prefsEditor": "%messagePrefix/prefsEditor.json"
                    }
                },
                terms: {
                    gradeNames: ["fluid.component"],
                    terms: {
                        templatePrefix: "../html",
                        messagePrefix: "../messages"
                    }
                },
                initialModel: {
                    gradeNames: ["fluid.prefs.initialModel"],
                    members: {
                        initialModel: {
                            preferences: {
                                fluid_prefs_textSize: 1
                            }
                        }
                    }
                }
            },
            expectedManyPrefsOnePanel: {
                "namespace": fluid.tests.auxSchema.customizedNamespace,
                "loaderGrades": ["fluid.prefs.separatedPanel"],
                "emphasizeLinks": {
                    "type": "fluid.prefs.emphasizeLinks",
                    "panel": {
                        "type": "fluid.prefs.panel.oneForManyPrefs",
                        "container": ".flc-prefsEditor-links-controls",  // the css selector in the template where the panel is rendered
                        "template": "%templatePrefix/PrefsEditorTemplate-linksControls.html",
                        "message": "%messagePrefix/PrefsEditorTemplate-linksControls.json"
                    }
                },
                "inputsLarger": {
                    "type": "fluid.prefs.inputsLarger",
                    "panel": {
                        "type": "fluid.prefs.panel.oneForManyPrefs"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.prefs.prefsEditor"],
                    "selectors": {
                        "fluid_prefs_panel_oneForManyPrefs": ".flc-prefsEditor-links-controls"
                    },
                    "components": {
                        "fluid_prefs_panel_oneForManyPrefs": {
                            "type": "fluid.prefs.panel.oneForManyPrefs",
                            "container": "prefsEditor.dom.fluid_prefs_panel_oneForManyPrefs",
                            "createOnEvent": "onPrefsEditorMarkupReady",
                            options: {
                                gradeNames: ["fluid.prefs.prefsEditorConnections"],
                                model: {
                                    links: "prefsEditor.model.preferences.fluid_prefs_emphasizeLinks",
                                    inputsLarger: "prefsEditor.model.preferences.fluid_prefs_inputsLarger"
                                },
                                messageBase: "{messageLoader}.resources.fluid_prefs_panel_oneForManyPrefs.parsed",
                                members: {
                                    resources: {
                                        template: "templateLoader.resources.fluid_prefs_panel_oneForManyPrefs"
                                    }
                                }
                            }
                        }
                    }
                },
                aliases_enhancer: {
                    gradeNames: ["fluid.modelComponent"],
                    model: {}
                },
                aliases_prefsEditor: {
                    gradeNames: ["fluid.modelComponent"],
                    model: {
                        preferences: {}
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.resourceLoader"],
                    resources: {
                        "fluid_prefs_panel_oneForManyPrefs": "%templatePrefix/PrefsEditorTemplate-linksControls.html",
                        "prefsEditor": "%templatePrefix/SeparatedPanelPrefsEditor.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.resourceLoader"],
                    resources: {
                        "fluid_prefs_panel_oneForManyPrefs": "%messagePrefix/PrefsEditorTemplate-linksControls.json",
                        "prefsEditor": "%messagePrefix/prefsEditor.json"
                    }
                },
                terms: {
                    gradeNames: ["fluid.component"],
                    terms: {
                        templatePrefix: "../html",
                        messagePrefix: "../messages"
                    }
                },
                initialModel: {
                    gradeNames: ["fluid.prefs.initialModel"],
                    members: {
                        initialModel: {
                            preferences: {
                                fluid_prefs_emphasizeLinks: false,
                                fluid_prefs_inputsLarger: false
                            }
                        }
                    }
                }
            },
            expectedAll: {
                "namespace": fluid.tests.auxSchema.customizedNamespace,
                "loaderGrades": ["fluid.prefs.separatedPanel"],
                "textSize": {
                    "type": "fluid.prefs.textSize",
                    "panel": {
                        "type": "fluid.prefs.panel.textSize",
                        "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                        "template": "%templatePrefix/PrefsEditorTemplate-textSize-nativeHTML.html",
                        "message": "%messagePrefix/PrefsEditorTemplate-textSize.json"
                    },
                    "enactor": {
                        "type": "fluid.prefs.enactor.textSize"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.prefs.prefsEditor"],
                    "selectors": {
                        "fluid_prefs_panel_textSize": ".flc-prefsEditor-text-size"
                    },
                    "components": {
                        "fluid_prefs_panel_textSize": {
                            "type": "fluid.prefs.panel.textSize",
                            "container": "prefsEditor.dom.fluid_prefs_panel_textSize",
                            "createOnEvent": "onPrefsEditorMarkupReady",
                            options: {
                                gradeNames: ["fluid.prefs.prefsEditorConnections"],
                                model: {
                                    value: "prefsEditor.model.preferences.fluid_prefs_textSize"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                step: 0.1,
                                messageBase: "{messageLoader}.resources.fluid_prefs_panel_textSize.parsed",
                                members: {
                                    resources: {
                                        template: "templateLoader.resources.fluid_prefs_panel_textSize"
                                    }
                                }
                            }
                        }
                    }
                },
                aliases_enhancer: {
                    gradeNames: ["fluid.modelComponent"],
                    model: {}
                },
                aliases_prefsEditor: {
                    gradeNames: ["fluid.modelComponent"],
                    model: {
                        preferences: {}
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.resourceLoader"],
                    resources: {
                        "prefsEditor": "%templatePrefix/SeparatedPanelPrefsEditor.html",
                        "fluid_prefs_panel_textSize": "%templatePrefix/PrefsEditorTemplate-textSize-nativeHTML.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.resourceLoader"],
                    resources: {
                        "fluid_prefs_panel_textSize": "%messagePrefix/PrefsEditorTemplate-textSize.json",
                        "prefsEditor": "%messagePrefix/PrefsEditorTemplate-prefsEditor.json"
                    }
                },
                enactors: {
                    "gradeNames": ["fluid.uiEnhancer"],
                    "components": {
                        "fluid_prefs_enactor_textSize": {
                            type: "fluid.prefs.enactor.textSize",
                            container: "uiEnhancer.container",
                            options: {
                                model: {
                                    value: "uiEnhancer.model.preferences.fluid_prefs_textSize"
                                }
                            }
                        }
                    },
                    "selectors": {}
                },
                initialModel: {
                    gradeNames: ["fluid.prefs.initialModel"],
                    members: {
                        initialModel: {
                            preferences: {
                                fluid_prefs_textSize: 1
                            }
                        }
                    }
                },
                terms: {
                    gradeNames: ["fluid.component"],
                    terms: {
                        templatePrefix: "../html",
                        messagePrefix: "../messages"
                    }
                }
            }
        },
        modules: [{
            name: "Test auxBuilder",
            tests: [{
                expect: 2,
                name: "expandedAuxSchema - empty",
                type: "test",
                func: "fluid.tests.testEmpty",
                args: ["{auxbuilderEmpty}.options.expandedAuxSchema"]
            }, {
                expect: 1,
                name: "expandedAuxSchema - onlyPanel",
                type: "test",
                func: "fluid.tests.testAuxBuilder",
                args: ["{auxbuilderOnlyPanel}.options.expandedAuxSchema", "{that}.options.testOptions.expectedPanels"]
            }, {
                expect: 1,
                name: "expandedAuxSchema - onlyEnactor",
                type: "test",
                func: "fluid.tests.testAuxBuilder",
                args: ["{auxbuilderOnlyEnactor}.options.expandedAuxSchema", "{that}.options.testOptions.expectedEnactors"]
            }, {
                expect: 1,
                name: "expandedAuxSchema - manyPanelsOnePref",
                type: "test",
                func: "fluid.tests.testAuxBuilder",
                args: ["{auxbuilderManyPanelsOnePref}.options.expandedAuxSchema", "{that}.options.testOptions.expectedManyPanelsOnePref"]
            }, {
                expect: 1,
                name: "expandedAuxSchema - manyPrefsOnePanel",
                type: "test",
                func: "fluid.tests.testAuxBuilder",
                args: ["{auxbuilderManyPrefsOnePanel}.options.expandedAuxSchema", "{that}.options.testOptions.expectedManyPrefsOnePanel"]
            }, {
                expect: 1,
                name: "expandedAuxSchema - all",
                type: "test",
                func: "fluid.tests.testAuxBuilder",
                args: ["{auxbuilderAll}.options.expandedAuxSchema", "{that}.options.testOptions.expectedAll"]
            }]
        }]
    });

    /*******************************************************************************
     * Unit tests for composite panel
     *******************************************************************************/

    fluid.defaults("fluid.prefs.schemas.subPanel1", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.subPanel1": {
                "default": "sub1",
                "options.min": "minimum",
                "options.max": "maximum"
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.subPanel2", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.subPanel2": {
                "default": "sub2"
            }
        }
    });

    fluid.defaults("fluid.prefs.panel.combinedBoth", {
        gradeNames: ["fluid.prefs.panel"]
    });

    fluid.defaults("fluid.prefs.panel.subPanel1", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.subPanel1": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        selectors: {
            header: "h2"
        },
        protoTree: {
            header: "${value}"
        }
    });

    fluid.defaults("fluid.prefs.panel.subPanel2", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.subPanel2": {
                "model.value": "value"
            }
        },
        selectors: {
            header: "h2"
        },
        protoTree: {
            header: "${value}"
        }
    });

    fluid.defaults("fluid.prefs.enactor.subPanel1", {
        gradeNames: ["fluid.prefs.enactor"],
        preferenceMap: {
            "fluid.prefs.subPanel1": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("fluid.prefs.enactor.subPanel2", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.subPanel2": {
                "model.value": "value"
            }
        }
    });

    fluid.tests.auxSchema.compositePanelMappedDefaults = {
        "fluid.prefs.subPanel1": {
            "type": "boolean",
            "default": false,
            "minimum": 1,
            "maximum": 10
        },
        "fluid.prefs.subPanel2": {
            "type": "boolean",
            "default": false
        }
    };

    fluid.tests.auxSchema.panelIndex = {
        "fluid.prefs.subPanel1": ["fluid.prefs.panel.subPanel1"],
        "fluid.prefs.subPanel2": ["fluid.prefs.panel.subPanel2"]
    };

    fluid.tests.auxSchema.compositePanelSchema = {
        "namespace": fluid.tests.auxSchema.customizedNamespace, // The author of the auxiliary schema will provide this and will be the component to call to initialize the constructed UIO.
        "loaderGrades": ["fluid.prefs.separatedPanel"],
        "terms": {
            "templatePrefix": "../html",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
            "messagePrefix": "../messages"  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
        },
        "template": "%templatePrefix/prefs.html",
        "message": "%messagePrefix/prefs.json",
        "groups": {
            "combinedBoth": {
                "container": "#flc-combinedBoth",
                "template": "%templatePrefix/combinedBoth.html",
                "message": "%messagePrefix/combinedBoth.json",
                "type": "fluid.prefs.panel.combinedBoth",
                "panels": ["x", "y"],
                "extraOption": 1
            }
        },
        "x": {
            "type": "fluid.prefs.subPanel1",
            "enactor": {
                "type": "fluid.prefs.enactor.subPanel1",
                "cssClass": "fl-link-enhanced"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel1",
                "container": "#flc-prefs-subPanel1",
                "template": "%templatePrefix/subPanel1.html",
                "message": "%messagePrefix/subPanel1.json",
                "subPanelOption": 1
            }
        },
        "y": {
            "type": "fluid.prefs.subPanel2",
            "enactor": {
                "type": "fluid.prefs.enactor.subPanel2",
                "cssClass": "fl-text-larger"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel2",
                "container": "#flc-prefs-subPanel2",
                "template": "%templatePrefix/subPanel2.html",
                "message": "%messagePrefix/subPanel2.json"
            }
        }
    };

    fluid.tests.auxSchema.expandedComposite = {
        "namespace": fluid.tests.auxSchema.customizedNamespace,
        "loaderGrades": ["fluid.prefs.separatedPanel"],
        "terms": {
            "templatePrefix": "../html",
            "messagePrefix": "../messages"
        },
        "template": "%templatePrefix/prefs.html",
        "message": "%messagePrefix/prefs.json",
        "groups": {
            "combinedBoth": {
                "container": "#flc-combinedBoth",
                "template": "%templatePrefix/combinedBoth.html",
                "message": "%messagePrefix/combinedBoth.json",
                "type": "fluid.prefs.panel.combinedBoth",
                "panels": ["x", "y"],
                "extraOption": 1
            }
        },
        "x": {
            "type": "fluid.prefs.subPanel1",
            "enactor": {
                "type": "fluid.prefs.enactor.subPanel1",
                "cssClass": "fl-link-enhanced"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel1",
                "container": "#flc-prefs-subPanel1",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel1.html",
                "message": "%messagePrefix/subPanel1.json",
                "subPanelOption": 1
            }
        },
        "y": {
            "type": "fluid.prefs.subPanel2",
            "enactor": {
                "type": "fluid.prefs.enactor.subPanel2",
                "cssClass": "fl-text-larger"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel2",
                "container": "#flc-prefs-subPanel2",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel2.html",
                "message": "%messagePrefix/subPanel2.json"
            }
        },
        panels: {
            "selectors": {
                "combinedBoth": "#flc-combinedBoth"
            },
            "components": {
                "combinedBoth": {
                    type: "fluid.prefs.panel.combinedBoth",
                    container: "prefsEditor.dom.combinedBoth",
                    createOnEvent: "onPrefsEditorMarkupReady",
                    options: {
                        gradeNames: ["fluid.prefs.prefsEditorConnections"],
                        extraOption: 1,
                        members: {
                            resources: {
                                template: "templateLoader.resources.combinedBoth",
                                "fluid_prefs_subPanel1": "templateLoader.resources.fluid_prefs_subPanel1",
                                "fluid_prefs_subPanel2": "templateLoader.resources.fluid_prefs_subPanel2"
                            }
                        },
                        selectors: {
                            "fluid_prefs_subPanel1": "#flc-prefs-subPanel1",
                            "fluid_prefs_subPanel2": "#flc-prefs-subPanel2"
                        },
                        selectorsToIgnore: ["fluid_prefs_subPanel1", "fluid_prefs_subPanel2"],
                        model: {
                            "fluid_prefs_subPanel1": "prefsEditor.model.preferences.fluid_prefs_subPanel1",
                            "fluid_prefs_subPanel2": "prefsEditor.model.preferences.fluid_prefs_subPanel2"
                        },
                        components: {
                            "fluid_prefs_subPanel1": {
                                "type": "fluid.prefs.panel.subPanel1",
                                "container": "combinedBoth.dom.fluid_prefs_subPanel1",
                                "options": {
                                    range: {
                                        min: 1,
                                        max: 10
                                    },
                                    "subPanelOption": 1
                                }
                            },
                            "fluid_prefs_subPanel2": {
                                "type": "fluid.prefs.panel.subPanel2",
                                "container": "combinedBoth.dom.fluid_prefs_subPanel2",
                                options: {}
                            }
                        }
                    }
                }
            }
        },
        templateLoader: {
            resources: {
                "combinedBoth": "%templatePrefix/combinedBoth.html",
                "fluid_prefs_subPanel1": "%templatePrefix/subPanel1.html",
                "fluid_prefs_subPanel2": "%templatePrefix/subPanel2.html"
            }
        },
        messageLoader: {
            resources: {
                "combinedBoth": "%messagePrefix/combinedBoth.json",
                "fluid_prefs_subPanel1": "%messagePrefix/subPanel1.json",
                "fluid_prefs_subPanel2": "%messagePrefix/subPanel2.json"
            }
        },
        initialModel: {
            members: {
                initialModel: {
                    preferences: {
                        fluid_prefs_subPanel1: false,
                        fluid_prefs_subPanel2: false
                    }
                }
            }
        },
        panelsToIgnore: ["x", "y"]
    };

    fluid.tests.auxSchema.expandedCompositeFull = $.extend(true, {}, fluid.tests.auxSchema.expandedComposite, {
        panels: {
            "components": {
                "combinedBoth": {
                    options: {
                        messageBase: "{messageLoader}.resources.combinedBoth.parsed",
                        components: {
                            "fluid_prefs_subPanel1": {
                                "options": {
                                    messageBase: "{messageLoader}.resources.fluid_prefs_subPanel1.parsed"
                                }
                            },
                            "fluid_prefs_subPanel2": {
                                options: {
                                    messageBase: "{messageLoader}.resources.fluid_prefs_subPanel2.parsed"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    jqUnit.test("Test expanding composite panel groups fluid.prefs.expandCompositePanels()", function () {
        var expandedCompositePanel = fluid.prefs.expandCompositePanels(fluid.tests.auxSchema.compositePanelSchema, fluid.tests.auxSchema.compositePanelSchema.groups, fluid.tests.auxSchema.panelIndex,
                fluid.get(fluid.tests.elementCommonOptions, "panel"), fluid.get(fluid.tests.elementCommonOptions, "subPanel"), fluid.get(fluid.tests.elementCommonOptions, "compositePanelBasedOnSub"),
                fluid.get(fluid.tests.elementCommonOptions, "panelModel"), fluid.tests.auxSchema.compositePanelMappedDefaults);

        jqUnit.assertDeepEq("The auxiliary schema for a composite panel has been parsed correctly", fluid.tests.auxSchema.expandedComposite, expandedCompositePanel);
    });

    /******************************************************
    * Multiple composite panels in one aux schema
    ******************************************************/

    fluid.defaults("fluid.prefs.schemas.subPanel3", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.subPanel3": {
                "default": "sub3",
                "options.min": "minimum",
                "options.max": "maximum"
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.subPanel4", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.subPanel4": {
                "default": "sub4"
            }
        }
    });

    fluid.defaults("fluid.prefs.panel.combinedBoth2", {
        gradeNames: ["fluid.prefs.panel"]
    });

    fluid.defaults("fluid.prefs.panel.subPanel3", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.subPanel3": {
                "model.value": "value",
                "range.min": "minimum",
                "range.max": "maximum",
                "model.step": "multipleOf" // to test that model paths without the "default" keyword are mapped correctly.
            }
        }
    });

    fluid.defaults("fluid.prefs.panel.subPanel4", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.subPanel4": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("fluid.prefs.enactor.subPanel3", {
        gradeNames: ["fluid.prefs.enactor"],
        preferenceMap: {
            "fluid.prefs.subPanel3": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("fluid.prefs.enactor.subPanel4", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.subPanel4": {
                "model.value": "value"
            }
        }
    });

    fluid.tests.auxSchema.multiCompositePanelMappedDefaults = $.extend(true, {}, fluid.tests.auxSchema.compositePanelMappedDefaults, {
        "fluid.prefs.subPanel3": {
            "type": "boolean",
            "default": false,
            "minimum": 20,
            "maximum": 100,
            "multipleOf": 0.1
        },
        "fluid.prefs.subPanel4": {
            "type": "boolean",
            "default": false
        }
    });

    fluid.tests.auxSchema.multiPanelIndex = $.extend(true, {}, fluid.tests.auxSchema.panelIndex, {
        "fluid.prefs.subPanel3": ["fluid.prefs.panel.subPanel3"],
        "fluid.prefs.subPanel4": ["fluid.prefs.panel.subPanel4"]
    });

    fluid.tests.auxSchema.anotherCompositePanelSchema = {
        "groups": {
            "combinedBoth2": {
                "container": "#flc-combinedBoth2",
                "template": "%templatePrefix/combinedBoth2.html",
                "message": "%messagePrefix/combinedBoth2.json",
                "type": "fluid.prefs.panel.combinedBoth2",
                "panels": ["subPanel3", "subPanel4"],
                "extraOption": 2
            }
        },
        "subPanel3": {
            "type": "fluid.prefs.subPanel3",
            "enactor": {
                "type": "fluid.prefs.enactor.subPanel3",
                "cssClass": "fl-link-enhanced3"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel3",
                "container": "#flc-prefs-subPanel3",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel3.html",
                "message": "%messagePrefix/subPanel3.json"
            }
        },
        "subPanel4": {
            "type": "fluid.prefs.subPanel4",
            "enactor": {
                "type": "fluid.prefs.enactor.subPanel4",
                "cssClass": "fl-text-larger4"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel4",
                "container": "#flc-prefs-subPanel4",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel4.html",
                "message": "%messagePrefix/subPanel4.json"
            }
        }
    };

    fluid.tests.auxSchema.anotherExpandedComposite = {
        "groups": {
            "combinedBoth2": {
                "container": "#flc-combinedBoth2",
                "template": "%templatePrefix/combinedBoth2.html",
                "message": "%messagePrefix/combinedBoth2.json",
                "type": "fluid.prefs.panel.combinedBoth2",
                "panels": ["subPanel3", "subPanel4"],
                "extraOption": 2
            }
        },
        "subPanel3": {
            "type": "fluid.prefs.subPanel3",
            "enactor": {
                "type": "fluid.prefs.enactor.subPanel3",
                "cssClass": "fl-link-enhanced3"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel3",
                "container": "#flc-prefs-subPanel3",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel3.html",
                "message": "%messagePrefix/subPanel3.json"
            }
        },
        "subPanel4": {
            "type": "fluid.prefs.subPanel4",
            "enactor": {
                "type": "fluid.prefs.enactor.subPanel4",
                "cssClass": "fl-text-larger4"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel4",
                "container": "#flc-prefs-subPanel4",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel4.html",
                "message": "%messagePrefix/subPanel4.json"
            }
        },
        panels: {
            "selectors": {
                "combinedBoth2": "#flc-combinedBoth2"
            },
            "components": {
                "combinedBoth2": {
                    "type": "fluid.prefs.panel.combinedBoth2",
                    "container": "prefsEditor.dom.combinedBoth2",
                    "createOnEvent": "onPrefsEditorMarkupReady",
                    options: {
                        gradeNames: ["fluid.prefs.prefsEditorConnections"],
                        extraOption: 2,
                        members: {
                            resources: {
                                template: "templateLoader.resources.combinedBoth2",
                                "fluid_prefs_subPanel3": "templateLoader.resources.fluid_prefs_subPanel3",
                                "fluid_prefs_subPanel4": "templateLoader.resources.fluid_prefs_subPanel4"
                            }
                        },
                        selectors: {
                            "fluid_prefs_subPanel3": "#flc-prefs-subPanel3",
                            "fluid_prefs_subPanel4": "#flc-prefs-subPanel4"
                        },
                        "selectorsToIgnore": ["fluid_prefs_subPanel3", "fluid_prefs_subPanel4"],
                        model: {
                            "fluid_prefs_subPanel3": "prefsEditor.model.preferences.fluid_prefs_subPanel3",
                            "fluid_prefs_subPanel4": "prefsEditor.model.preferences.fluid_prefs_subPanel4"
                        },
                        components: {
                            "fluid_prefs_subPanel3": {
                                "type": "fluid.prefs.panel.subPanel3",
                                "container": "combinedBoth2.dom.fluid_prefs_subPanel3",
                                "options": {
                                    model: {
                                        step: 0.1
                                    },
                                    range: {
                                        min: 20,
                                        max: 100
                                    }
                                }
                            },
                            "fluid_prefs_subPanel4": {
                                "type": "fluid.prefs.panel.subPanel4",
                                "container": "combinedBoth2.dom.fluid_prefs_subPanel4",
                                options: {}
                            }
                        }
                    }
                }
            }
        },
        templateLoader: {
            resources: {
                "combinedBoth2": "%templatePrefix/combinedBoth2.html",
                "fluid_prefs_subPanel3": "%templatePrefix/subPanel3.html",
                "fluid_prefs_subPanel4": "%templatePrefix/subPanel4.html"
            }
        },
        messageLoader: {
            resources: {
                "combinedBoth2": "%messagePrefix/combinedBoth2.json",
                "fluid_prefs_subPanel3": "%messagePrefix/subPanel3.json",
                "fluid_prefs_subPanel4": "%messagePrefix/subPanel4.json"
            }
        },
        initialModel: {
            members: {
                initialModel: {
                    preferences: {
                        fluid_prefs_subPanel3: false,
                        fluid_prefs_subPanel4: false
                    }
                }
            }
        },
        panelsToIgnore: ["x", "y", "subPanel3", "subPanel4"]
    };

    fluid.tests.auxSchema.multiCompositePanelSchema = $.extend(true, {}, fluid.tests.auxSchema.compositePanelSchema, fluid.tests.auxSchema.anotherCompositePanelSchema);
    fluid.tests.auxSchema.expandedMultiComposite = $.extend(true, {}, fluid.tests.auxSchema.expandedComposite, fluid.tests.auxSchema.anotherExpandedComposite);

    jqUnit.test("Test expanding multiple composite panel groups with fluid.prefs.expandCompositePanels()", function () {
        var expandedCompositePanel = fluid.prefs.expandCompositePanels(fluid.tests.auxSchema.multiCompositePanelSchema, fluid.tests.auxSchema.multiCompositePanelSchema.groups,
                fluid.tests.auxSchema.multiPanelIndex, fluid.get(fluid.tests.elementCommonOptions, "panel"), fluid.get(fluid.tests.elementCommonOptions, "subPanel"),
                fluid.get(fluid.tests.elementCommonOptions, "compositePanelBasedOnSub"), fluid.get(fluid.tests.elementCommonOptions, "panelModel"),
                fluid.tests.auxSchema.multiCompositePanelMappedDefaults);

        jqUnit.assertDeepEq("The auxiliary schema for multiple composite panels has been parsed correctly", fluid.tests.auxSchema.expandedMultiComposite, expandedCompositePanel);
    });

    /******************************************************
    * Support subpanels with renderOnPreference requests
    ******************************************************/

    fluid.defaults("fluid.prefs.schemas.subPanel5", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.subPanel5": {
                "default": "sub5"
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.subPanel6", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.subPanel6": {
                "default": "sub6"
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.subPanel7", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.subPanel5": {
                "default": "sub7"
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.subPanel8", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.subPanel8": {
                "default": "sub8"
            }
        }
    });

    fluid.defaults("fluid.prefs.panel.combinedBoth3", {
        gradeNames: ["fluid.prefs.panel"]
    });

    fluid.defaults("fluid.prefs.panel.subPanel5", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.subPanel5": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("fluid.prefs.panel.subPanel6", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.subPanel6": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("fluid.prefs.panel.subPanel7", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.subPanel7": {
                "model.value": "value"
            }
        }
    });

    fluid.defaults("fluid.prefs.panel.subPanel8", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.subPanel8": {
                "model.value": "value"
            }
        }
    });

    fluid.tests.auxSchema.renderOnPrefMappedDefaults = $.extend(true, {}, fluid.tests.auxSchema.multiCompositePanelMappedDefaults, {
        "fluid.prefs.subPanel5": {
            "type": "boolean",
            "default": false
        },
        "fluid.prefs.subPanel6": {
            "type": "boolean",
            "default": false
        },
        "fluid.prefs.subPanel7": {
            "type": "boolean",
            "default": false
        },
        "fluid.prefs.subPanel8": {
            "type": "boolean",
            "default": false
        }
    });

    fluid.tests.auxSchema.renderOnPreflIndex = $.extend(true, {}, fluid.tests.auxSchema.multiPanelIndex, {
        "fluid.prefs.subPanel5": ["fluid.prefs.panel.subPanel5"],
        "fluid.prefs.subPanel6": ["fluid.prefs.panel.subPanel6"],
        "fluid.prefs.subPanel7": ["fluid.prefs.panel.subPanel7"],
        "fluid.prefs.subPanel8": ["fluid.prefs.panel.subPanel8"]
    });

    fluid.tests.auxSchema.renderOnPrefSchema = {
        "groups": {
            "combinedBoth3": {
                "container": "#flc-combinedBoth3",
                "template": "%templatePrefix/combinedBoth3.html",
                "message": "%messagePrefix/combinedBoth3.json",
                "type": "fluid.prefs.panel.combinedBoth3",
                "panels": {
                    "always": ["subPanel5"],
                    "fluid.prefs.subPanel5": ["subPanel6"],
                    "fluid.prefs.subPanel6": ["subPanel7", "subPanel8"]
                },
                "renderOnPrefOption": 1
            }
        },
        "subPanel5": {
            "type": "fluid.prefs.subPanel5",
            "panel": {
                "type": "fluid.prefs.panel.subPanel5",
                "container": "#flc-prefs-subPanel5",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel5.html",
                "message": "%messagePrefix/subPanel5.json"
            }
        },
        "subPanel6": {
            "type": "fluid.prefs.subPanel6",
            "panel": {
                "type": "fluid.prefs.panel.subPanel6",
                "container": "#flc-prefs-subPanel6",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel6.html",
                "message": "%messagePrefix/subPanel6.json"
            }
        },
        "subPanel7": {
            "type": "fluid.prefs.subPanel7",
            "panel": {
                "type": "fluid.prefs.panel.subPanel7",
                "container": "#flc-prefs-subPanel7",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel7.html",
                "message": "%messagePrefix/subPanel7.json"
            }
        },
        "subPanel8": {
            "type": "fluid.prefs.subPanel8",
            "panel": {
                "type": "fluid.prefs.panel.subPanel8",
                "container": "#flc-prefs-subPanel8",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel8.html",
                "message": "%messagePrefix/subPanel8.json"
            }
        }
    };

    fluid.tests.auxSchema.renderOnPrefExpandedComposite = {
        "groups": {
            "combinedBoth3": {
                "container": "#flc-combinedBoth3",
                "template": "%templatePrefix/combinedBoth3.html",
                "message": "%messagePrefix/combinedBoth3.json",
                "type": "fluid.prefs.panel.combinedBoth3",
                "panels": {
                    "always": ["subPanel5"],
                    "fluid.prefs.subPanel5": ["subPanel6"],
                    "fluid.prefs.subPanel6": ["subPanel7", "subPanel8"]
                },
                "renderOnPrefOption": 1
            }
        },
        "subPanel5": {
            "type": "fluid.prefs.subPanel5",
            "panel": {
                "type": "fluid.prefs.panel.subPanel5",
                "container": "#flc-prefs-subPanel5",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel5.html",
                "message": "%messagePrefix/subPanel5.json"
            }
        },
        "subPanel6": {
            "type": "fluid.prefs.subPanel6",
            "panel": {
                "type": "fluid.prefs.panel.subPanel6",
                "container": "#flc-prefs-subPanel6",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel6.html",
                "message": "%messagePrefix/subPanel6.json"
            }
        },
        "subPanel7": {
            "type": "fluid.prefs.subPanel7",
            "panel": {
                "type": "fluid.prefs.panel.subPanel7",
                "container": "#flc-prefs-subPanel7",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel7.html",
                "message": "%messagePrefix/subPanel7.json"
            }
        },
        "subPanel8": {
            "type": "fluid.prefs.subPanel8",
            "panel": {
                "type": "fluid.prefs.panel.subPanel8",
                "container": "#flc-prefs-subPanel8",  // the css selector in the template where the panel is rendered
                "template": "%templatePrefix/subPanel8.html",
                "message": "%messagePrefix/subPanel8.json"
            }
        },
        panels: {
            "selectors": {
                "combinedBoth3": "#flc-combinedBoth3"
            },
            "components": {
                "combinedBoth3": {
                    "type": "fluid.prefs.panel.combinedBoth3",
                    "container": "prefsEditor.dom.combinedBoth3",
                    "createOnEvent": "onPrefsEditorMarkupReady",
                    options: {
                        gradeNames: ["fluid.prefs.prefsEditorConnections"],
                        renderOnPrefOption: 1,
                        members: {
                            resources: {
                                template: "templateLoader.resources.combinedBoth3",
                                "fluid_prefs_subPanel5": "templateLoader.resources.fluid_prefs_subPanel5",
                                "fluid_prefs_subPanel6": "templateLoader.resources.fluid_prefs_subPanel6",
                                "fluid_prefs_subPanel7": "templateLoader.resources.fluid_prefs_subPanel7",
                                "fluid_prefs_subPanel8": "templateLoader.resources.fluid_prefs_subPanel8"
                            }
                        },
                        selectors: {
                            "fluid_prefs_subPanel5": "#flc-prefs-subPanel5",
                            "fluid_prefs_subPanel6": "#flc-prefs-subPanel6",
                            "fluid_prefs_subPanel7": "#flc-prefs-subPanel7",
                            "fluid_prefs_subPanel8": "#flc-prefs-subPanel8"
                        },
                        "selectorsToIgnore": ["fluid_prefs_subPanel5", "fluid_prefs_subPanel6", "fluid_prefs_subPanel7", "fluid_prefs_subPanel8"],
                        model: {
                            "fluid_prefs_subPanel5": "prefsEditor.model.preferences.fluid_prefs_subPanel5",
                            "fluid_prefs_subPanel6": "prefsEditor.model.preferences.fluid_prefs_subPanel6",
                            "fluid_prefs_subPanel7": "prefsEditor.model.preferences.fluid_prefs_subPanel7",
                            "fluid_prefs_subPanel8": "prefsEditor.model.preferences.fluid_prefs_subPanel8"
                        },
                        components: {
                            "fluid_prefs_subPanel5": {
                                "type": "fluid.prefs.panel.subPanel5",
                                "container": "combinedBoth3.dom.fluid_prefs_subPanel5",
                                options: {}
                            },
                            "fluid_prefs_subPanel6": {
                                "type": "fluid.prefs.panel.subPanel6",
                                "container": "combinedBoth3.dom.fluid_prefs_subPanel6",
                                options: {
                                    "renderOnPreference": "fluid.prefs.subPanel5"
                                }
                            },
                            "fluid_prefs_subPanel7": {
                                "type": "fluid.prefs.panel.subPanel7",
                                "container": "combinedBoth3.dom.fluid_prefs_subPanel7",
                                options: {
                                    "renderOnPreference": "fluid.prefs.subPanel6"
                                }
                            },
                            "fluid_prefs_subPanel8": {
                                "type": "fluid.prefs.panel.subPanel8",
                                "container": "combinedBoth3.dom.fluid_prefs_subPanel8",
                                options: {
                                    "renderOnPreference": "fluid.prefs.subPanel6"
                                }
                            }
                        }
                    }
                }
            }
        },
        templateLoader: {
            resources: {
                "combinedBoth3": "%templatePrefix/combinedBoth3.html",
                "fluid_prefs_subPanel5": "%templatePrefix/subPanel5.html",
                "fluid_prefs_subPanel6": "%templatePrefix/subPanel6.html",
                "fluid_prefs_subPanel7": "%templatePrefix/subPanel7.html",
                "fluid_prefs_subPanel8": "%templatePrefix/subPanel8.html"
            }
        },
        messageLoader: {
            resources: {
                "combinedBoth3": "%messagePrefix/combinedBoth3.json",
                "fluid_prefs_subPanel5": "%messagePrefix/subPanel5.json",
                "fluid_prefs_subPanel6": "%messagePrefix/subPanel6.json",
                "fluid_prefs_subPanel7": "%messagePrefix/subPanel7.json",
                "fluid_prefs_subPanel8": "%messagePrefix/subPanel8.json"
            }
        },
        initialModel: {
            members: {
                initialModel: {
                    preferences: {
                        fluid_prefs_subPanel5: false,
                        fluid_prefs_subPanel6: false,
                        fluid_prefs_subPanel7: false,
                        fluid_prefs_subPanel8: false
                    }
                }
            }
        },
        panelsToIgnore: ["subPanel5", "subPanel6", "subPanel7", "subPanel8"]
    };

    jqUnit.test("Test expanding composite panel group having subpanels rendered on particular pref key with fluid.prefs.expandCompositePanels()", function () {
        var expandedCompositePanel = fluid.prefs.expandCompositePanels(fluid.tests.auxSchema.renderOnPrefSchema, fluid.tests.auxSchema.renderOnPrefSchema.groups,
                fluid.tests.auxSchema.renderOnPrefIndex, fluid.get(fluid.tests.elementCommonOptions, "panel"), fluid.get(fluid.tests.elementCommonOptions, "subPanel"),
                fluid.get(fluid.tests.elementCommonOptions, "compositePanelBasedOnSub"), fluid.get(fluid.tests.elementCommonOptions, "panelModel"),
                fluid.tests.auxSchema.renderOnPrefMappedDefaults);

        jqUnit.assertDeepEq("The auxiliary schema for multiple composite panels has been parsed correctly", fluid.tests.auxSchema.renderOnPrefExpandedComposite, expandedCompositePanel);
    });

    fluid.tests.auxSchema.expandedRestForAll = {
        panels: {
            "gradeNames": ["fluid.prefs.prefsEditor"]
        },
        enactors: {
            "gradeNames": ["fluid.uiEnhancer"],
            "components": {
                "fluid_prefs_enactor_subPanel1": {
                    type: "fluid.prefs.enactor.subPanel1",
                    options: {
                        "cssClass": "fl-link-enhanced",
                        model: {
                            value: "uiEnhancer.model.preferences.fluid_prefs_subPanel1"
                        }
                    }
                },
                "fluid_prefs_enactor_subPanel2": {
                    type: "fluid.prefs.enactor.subPanel2",
                    container: "uiEnhancer.container",
                    options: {
                        "cssClass": "fl-text-larger",
                        model: {
                            value: "uiEnhancer.model.preferences.fluid_prefs_subPanel2"
                        }
                    }
                }
            },
            "selectors": {}
        },
        templateLoader: {
            gradeNames: ["fluid.resourceLoader"],
            resources: {
                "prefsEditor": "%templatePrefix/prefs.html"
            }
        },
        messageLoader: {
            gradeNames: ["fluid.resourceLoader"],
            resources: {
                "prefsEditor": "%messagePrefix/prefs.json"
            }
        },
        initialModel: {
            gradeNames: ["fluid.prefs.initialModel"]
        },
        terms: {
            gradeNames: ["fluid.component"],
            terms: {
                templatePrefix: "../html",
                messagePrefix: "../messages"
            }
        }
    };

    jqUnit.test("Full schema with a composite panel", function () {
        var expandedFull = $.extend(true, {}, fluid.tests.auxSchema.expectedEnactors, fluid.tests.auxSchema.expectedPanels, fluid.tests.auxSchema.expandedCompositeFull, fluid.tests.auxSchema.expandedRestForAll);
        delete expandedFull.panelsToIgnore;
        delete expandedFull.message;
        delete expandedFull.template;
        delete expandedFull.terms.templatePrefix;
        delete expandedFull.terms.messagePrefix;

        var auxBuilder = fluid.prefs.auxBuilder({
            auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.compositePanelSchema, fluid.tests.auxSchema.enactors, fluid.tests.auxSchema.panels),
            elementCommonOptions: fluid.tests.elementCommonOptions,
            mappedDefaults: $.extend(true, {}, fluid.tests.auxSchema.mappedDefaults, fluid.tests.auxSchema.compositePanelMappedDefaults)
        });

        jqUnit.assertDeepEq("The full auxiliary schema with a composite panel has been parsed correctly", expandedFull, auxBuilder.options.expandedAuxSchema);
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.expandSchemaValueTest",
            "fluid.tests.schemaExpanderTest",
            "fluid.tests.expandSchemaComponentsTest",
            "fluid.tests.auxBuilderTest"
        ]);
    });

})(jQuery);
