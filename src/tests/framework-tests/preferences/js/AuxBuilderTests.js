/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * Unit tests for fluid.prefs.expandSchemaValue
     *******************************************************************************/

    fluid.defaults("fluid.tests.expandSchemaValueTest", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
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
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
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
        "textFont": {
            "type": "fluid.prefs.textFont",
            "classes": {
                "default": "",
                "times": "fl-font-prefsEditor-times",
                "comic": "fl-font-prefsEditor-comic-sans",
                "arial": "fl-font-prefsEditor-arial",
                "verdana": "fl-font-prefsEditor-verdana"
            }
        },
        "contrast": {
            "type": "fluid.prefs.contrast",
            "classes": {
                "default": "fl-theme-prefsEditor-default",
                "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                "by": "fl-theme-prefsEditor-by fl-theme-by",
                "yb": "fl-theme-prefsEditor-yb fl-theme-yb"
            }
        },
        "enactors": [{
            "type": "fluid.prefs.enactors.textFont",
            "classes": "@textFont.classes"
        }, {
            "type": "fluid.prefs.enactors.contrast",
            "classes": "@contrast.classes"
        }, {
            "type": "fluid.prefs.enactors.tableOfContents",
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
        "textFont": {
            "type": "fluid.prefs.textFont",
            "classes": {
                "default": "",
                "times": "fl-font-prefsEditor-times",
                "comic": "fl-font-prefsEditor-comic-sans",
                "arial": "fl-font-prefsEditor-arial",
                "verdana": "fl-font-prefsEditor-verdana"
            }
        },
        "contrast": {
            "type": "fluid.prefs.contrast",
            "classes": {
                "default": "fl-theme-prefsEditor-default",
                "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                "by": "fl-theme-prefsEditor-by fl-theme-by",
                "yb": "fl-theme-prefsEditor-yb fl-theme-yb"
            }
        },
        "enactors": [{
            "type": "fluid.prefs.enactors.textFont",
            "classes": {
                "default": "",
                "times": "fl-font-prefsEditor-times",
                "comic": "fl-font-prefsEditor-comic-sans",
                "arial": "fl-font-prefsEditor-arial",
                "verdana": "fl-font-prefsEditor-verdana"
            }
        }, {
            "type": "fluid.prefs.enactors.contrast",
            "classes": {
                "default": "fl-theme-prefsEditor-default",
                "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                "by": "fl-theme-prefsEditor-by fl-theme-by",
                "yb": "fl-theme-prefsEditor-yb fl-theme-yb"
            }
        }, {
            "type": "fluid.prefs.enactors.tableOfContents",
            "random": undefined,
            "template": "the-location-of-toc-template"
        }],
        "panels": [{
            "type": "fluid.prefs.panel.textFont",
            "container": ".flc-prefsEditor-text-font",
            "classnameMap": {
                "default": "",
                "times": "fl-font-prefsEditor-times",
                "comic": "fl-font-prefsEditor-comic-sans",
                "arial": "fl-font-prefsEditor-arial",
                "verdana": "fl-font-prefsEditor-verdana"
            },
            "template": "templates/textFont"
        }, {
            "type": "fluid.prefs.panel.contrast",
            "container": ".flc-prefsEditor-contrast",
            "classnameMap": {
                "default": "fl-theme-prefsEditor-default",
                "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                "by": "fl-theme-prefsEditor-by fl-theme-by",
                "yb": "fl-theme-prefsEditor-yb fl-theme-yb"
            },
            "template": "templates/contrast"
        }]
    };

    /*******************************************************************************
     * Unit tests for fluid.prefs.schemaExpander
     *******************************************************************************/

    fluid.tests.testSchemaExpander = function (schema, expectedOutput) {
        var output = fluid.prefs.expandSchemaImpl(schema);
        jqUnit.assertDeepEq("The source schema is expanded correctly", expectedOutput, output);
    };

    fluid.defaults("fluid.tests.schemaExpanderTest", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            schemaExpanderTester: {
                type: "fluid.tests.schemaExpanderTester"
            }
        }
    });

    fluid.defaults("fluid.tests.schemaExpanderTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
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

    fluid.tests.elementCommonOptions = {
        panel: {
            "createOnEvent": "onPrefsEditorMarkupReady",
            "container": "prefsEditor.dom.%prefKey",
            "options.gradeNames": "fluid.prefs.defaultPanel",
            "options.resources.template": "templateLoader.resources.%prefKey"
        },
        compositePanel: {
            "createOnEvent": "onPrefsEditorMarkupReady",
            "container": "prefsEditor.dom.%prefKey",
            "options.gradeNames": ["fluid.prefs.defaultPanel", "fluid.prefs.compositePanel"],
            "options.resources.template": "templateLoader.resources.%prefKey"
        },
        compositePanelBasedOnSub: {
            "%subPrefKey": "templateLoader.resources.%subPrefKey"
        },
        subPanel: {
            "createOnEvent": "initSubPanels",
            "container": "%compositePanel.dom.%prefKey"
        },
        enactor: {
            "container": "uiEnhancer.container",
            "options.sourceApplier": "uiEnhancer.applier"
        }
    };

    /*******************************************************************************
     * Unit tests for fluid.prefs.expandSchemaComponents
     *******************************************************************************/

    fluid.tests.testExpandSchemaComponents = function (auxSchema, type, prefKey, componentConfig, index, primarySchema, expectedOutput) {
        // var panelsTopCommonOptions = fluid.get(fluid.defaults("fluid.prefs.auxBuilder"), "topCommonOptions.panels");
        var panelsCommonOptions = fluid.get(fluid.tests.elementCommonOptions, "panel");
        var output = fluid.prefs.expandSchemaComponents(auxSchema, type, prefKey, componentConfig, index, panelsCommonOptions, primarySchema);
        jqUnit.assertDeepEq("The components and templates blocks are constructed correctly", expectedOutput, output);
    };

    fluid.defaults("fluid.tests.expandSchemaComponentsTest", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            schemaExpanderTester: {
                type: "fluid.tests.expandSchemaComponentsTester"
            }
        }
    });

    fluid.defaults("fluid.tests.expandSchemaComponentsTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            auxSchema: {
                "contrast": {
                    "type": "fluid.prefs.contrast",
                    "classes": {
                        "default": "fl-theme-prefsEditor-default",
                        "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                        "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                        "by": "fl-theme-prefsEditor-by fl-theme-by",
                        "yb": "fl-theme-prefsEditor-yb fl-theme-yb"
                    },
                    "panel": {
                        "type": "fluid.prefs.panel.contrast",
                        "container": ".flc-prefsEditor-contrast",  // the css selector in the template where the panel is rendered
                        "classnameMap": {
                            "default": "fl-theme-prefsEditor-default",
                            "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                            "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                            "by": "fl-theme-prefsEditor-by fl-theme-by",
                            "yb": "fl-theme-prefsEditor-yb fl-theme-yb"
                        },
                        "template": "templates/contrast",
                        "message": "messages/contrast"
                    }
                }
            },
            index: {
                "fluid.prefs.contrast": ["fluid.prefs.panel.contrast"]
            },
            primarySchema: {
                "fluid.prefs.contrast": {
                    "type": "string",
                    "default": "default",
                    "enum": ["default", "bw", "wb", "by", "yb"]
                }
            },
            expectedOutput: {
                "contrast": {
                    "type": "fluid.prefs.contrast",
                    "classes": {
                        "default": "fl-theme-prefsEditor-default",
                        "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                        "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                        "by": "fl-theme-prefsEditor-by fl-theme-by",
                        "yb": "fl-theme-prefsEditor-yb fl-theme-yb"
                    },
                    "panel": {
                        "type": "fluid.prefs.panel.contrast",
                        "container": ".flc-prefsEditor-contrast",  // the css selector in the template where the panel is rendered
                        "classnameMap": {
                            "default": "fl-theme-prefsEditor-default",
                            "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                            "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                            "by": "fl-theme-prefsEditor-by fl-theme-by",
                            "yb": "fl-theme-prefsEditor-yb fl-theme-yb"
                        },
                        "template": "templates/contrast",
                        "message": "messages/contrast"
                    }
                },
                panels: {
                    selectors: {
                        "fluid_prefs_panel_contrast": ".flc-prefsEditor-contrast"
                    },
                    components: {
                        "fluid_prefs_panel_contrast": {
                            type: "fluid.prefs.panel.contrast",
                            container: "prefsEditor.dom.fluid_prefs_panel_contrast",
                            createOnEvent: "onPrefsEditorMarkupReady",
                            options: {
                                gradeNames: "fluid.prefs.defaultPanel",
                                classnameMap: {
                                    "default": "fl-theme-prefsEditor-default",
                                    "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                                    "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                                    "by": "fl-theme-prefsEditor-by fl-theme-by",
                                    "yb": "fl-theme-prefsEditor-yb fl-theme-yb"
                                },
                                rules: {
                                    "fluid_prefs_contrast": "value"
                                },
                                model: {
                                    value: "default"
                                },
                                controlValues: {
                                    theme: ["default", "bw", "wb", "by", "yb"]
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_prefs_panel_contrast"
                                }
                            }
                        }
                    }
                },
                templateLoader: {
                    templates: {
                        "fluid_prefs_panel_contrast": "templates/contrast"
                    }
                },
                messageLoader: {
                    templates: {
                        "fluid_prefs_panel_contrast": "messages/contrast"
                    }
                },
                rootModel: {
                    members: {
                        rootModel: {
                            "fluid_prefs_contrast": "default"
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
                args: ["{that}.options.testOptions.auxSchema", "panels", "{that}.options.testOptions.auxSchema.contrast.type", "{that}.options.testOptions.auxSchema.contrast.panel",
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
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            schemaExpanderTester: {
                type: "fluid.tests.expandSchemaDirectOptionTester"
            }
        }
    });

    fluid.defaults("fluid.tests.expandSchemaDirectOptionTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
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

    fluid.tests.testAuxBuilder = function (expandedSchema, expectedExpandedSchema) {
        jqUnit.assertDeepEq("The schema was expanded correctly", expectedExpandedSchema, expandedSchema);
    };

    fluid.tests.auxSchema.defaultNamespace = fluid.defaults("fluid.prefs.auxBuilder").defaultNamespace;
    fluid.tests.auxSchema.newNamespace = "fluid.prefs.constructedPrefsEditor";

    fluid.tests.auxSchema.panels = {
        "textSize": {
            "type": "fluid.prefs.textSize",
            "panel": {
                "type": "fluid.prefs.panel.textSize",
                "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                "template": "%prefix/PrefsEditorTemplate-textSize.html",
                "message": "%prefix/PrefsEditorTemplate-textSize.json"
            }
        }
    };

    fluid.tests.auxSchema.manyPrefsOnePanel = {
        "emphasizeLinks": {
            "type": "fluid.prefs.emphasizeLinks",
            "panel": {
                "type": "fluid.prefs.panel.linksControls",
                "container": ".flc-prefsEditor-links-controls",  // the css selector in the template where the panel is rendered
                "template": "%prefix/PrefsEditorTemplate-links.html",
                "message": "%prefix/PrefsEditorTemplate-links.json"
            }
        },
        "inputsLarger": {
            "type": "fluid.prefs.inputsLarger",
            "panel": {
                "type": "fluid.prefs.panel.linksControls"
            }
        }
    };

    fluid.defaults("fluid.prefs.panel.otherTextSize", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preferenceMap: {
            "fluid.prefs.textSize": {
                "model.value": "default",
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
                "template": "%prefix/PrefsEditorTemplate-textSize.html",
                "message": "%prefix/PrefsEditorTemplate-textSize.json"
            }
        },
        "textSize.other": {
            "type": "fluid.prefs.textSize",
            "panel": {
                "type": "fluid.prefs.panel.otherTextSize",
                "container": ".flc-prefsEditor-otherTextSize",  // the css selector in the template where the panel is rendered
                "template": "%prefix/PrefsEditorTemplate-otherTextSize.html",
                "message": "%prefix/PrefsEditorTemplate-otherTextSize.json"
            }
        }
    };

    fluid.tests.auxSchema.enactors = {
        "textSize": {
            "type": "fluid.prefs.textSize",
            "enactor": {
                "type": "fluid.prefs.enactors.textSize"
            }
        }
    };

    fluid.tests.auxSchema.namespace = {
        "namespace": fluid.tests.auxSchema.newNamespace
    };

    fluid.tests.auxSchema.template = {
        "template": "%prefix/SeparatedPanelPrefsEditor.html"
    };

    fluid.tests.auxSchema.templatePrefix = {
        templatePrefix: "../html"
    };

    fluid.tests.auxSchema.message = {
        "message": "%prefix/PrefsEditorTemplate-prefsEditor.json"
    };

    fluid.tests.auxSchema.messagePrefix = {
        messagePrefix: "../messages"
    };

    fluid.tests.auxSchema.mappedDefaults = {
        "fluid.prefs.textSize": {
            "type": "number",
            "default": 1,
            "minimum": 1,
            "maximum": 2,
            "divisibleBy": 0.1
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

    fluid.defaults("fluid.tests.auxBuilderTest", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
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
                    auxiliarySchema: fluid.tests.auxSchema.panels,
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderManyPanelsOnePref: {
                type: "fluid.prefs.auxBuilder",
                options: {
                    auxiliarySchema: fluid.tests.auxSchema.manyPanelsOnePref,
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderManyPrefsOnePanel: {
                type: "fluid.prefs.auxBuilder",
                options: {
                    auxiliarySchema: fluid.tests.auxSchema.manyPrefsOnePanel,
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderAll: {
                type: "fluid.prefs.auxBuilder",
                options: {
                    auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.enactors, fluid.tests.auxSchema.panels, fluid.tests.auxSchema.namespace, fluid.tests.auxSchema.messages, fluid.tests.auxSchema.templatePrefix, fluid.tests.auxSchema.template, fluid.tests.auxSchema.messagePrefix, fluid.tests.auxSchema.message),
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
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            expectedPrefs: {
                "namespace": fluid.tests.auxSchema.defaultNamespace
            },
            expectedPanels: {
                "namespace": fluid.tests.auxSchema.defaultNamespace,
                "textSize": {
                    "type": "fluid.prefs.textSize",
                    "panel": {
                        "type": "fluid.prefs.panel.textSize",
                        "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/PrefsEditorTemplate-textSize.html",
                        "message": "%prefix/PrefsEditorTemplate-textSize.json"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.prefs.prefsEditor", "autoInit"],
                    "selectors": {
                        "fluid_prefs_panel_textSize": ".flc-prefsEditor-text-size"
                    },
                    "components": {
                        "fluid_prefs_panel_textSize": {
                            "type": "fluid.prefs.panel.textSize",
                            "container": "prefsEditor.dom.fluid_prefs_panel_textSize",
                            "createOnEvent": "onPrefsEditorMarkupReady",
                            options: {
                                gradeNames: "fluid.prefs.defaultPanel",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_prefs_textSize: "value"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_prefs_panel_textSize"
                                }
                            }
                        }
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_prefs_panel_textSize": "%prefix/PrefsEditorTemplate-textSize.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_prefs_panel_textSize": "%prefix/PrefsEditorTemplate-textSize.json"
                    }
                },
                rootModel: {
                    gradeNames: ["fluid.prefs.rootModel", "autoInit"],
                    members: {
                        rootModel: {
                            fluid_prefs_textSize: 1
                        }
                    }
                }
            },
            expectedEnactors: {
                "namespace": fluid.tests.auxSchema.newNamespace,
                "textSize": {
                    "type": "fluid.prefs.textSize",
                    "enactor": {
                        "type": "fluid.prefs.enactors.textSize"
                    }
                },
                enactors: {
                    "gradeNames": ["fluid.uiEnhancer", "autoInit"],
                    "selectors": {},
                    "components": {
                        "fluid_prefs_enactors_textSize": {
                            type: "fluid.prefs.enactors.textSize",
                            container: "uiEnhancer.container",
                            options: {
                                sourceApplier: "uiEnhancer.applier",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_prefs_textSize: "value"
                                }
                            }
                        }
                    }
                },
                rootModel: {
                    gradeNames: ["fluid.prefs.rootModel", "autoInit"],
                    members: {
                        rootModel: {
                            fluid_prefs_textSize: 1
                        }
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                    templates: {}
                },
                templateLoader: {
                    gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                    templates: {}
                }
            },
            expectedManyPanelsOnePref: {
                "namespace": fluid.tests.auxSchema.defaultNamespace,
                "textSize": {
                    "type": "fluid.prefs.textSize",
                    "panel": {
                        "type": "fluid.prefs.panel.textSize",
                        "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/PrefsEditorTemplate-textSize.html",
                        "message": "%prefix/PrefsEditorTemplate-textSize.json"
                    }
                },
                "textSize.other": {
                    "type": "fluid.prefs.textSize",
                    "panel": {
                        "type": "fluid.prefs.panel.otherTextSize",
                        "container": ".flc-prefsEditor-otherTextSize",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/PrefsEditorTemplate-otherTextSize.html",
                        "message": "%prefix/PrefsEditorTemplate-otherTextSize.json"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.prefs.prefsEditor", "autoInit"],
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
                                gradeNames: "fluid.prefs.defaultPanel",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_prefs_textSize: "value"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_prefs_panel_textSize"
                                }
                            }
                        },
                        "fluid_prefs_panel_otherTextSize": {
                            "type": "fluid.prefs.panel.otherTextSize",
                            "container": "prefsEditor.dom.fluid_prefs_panel_otherTextSize",
                            "createOnEvent": "onPrefsEditorMarkupReady",
                            options: {
                                gradeNames: "fluid.prefs.defaultPanel",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_prefs_textSize: "value"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_prefs_panel_otherTextSize"
                                }
                            }
                        }
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_prefs_panel_textSize": "%prefix/PrefsEditorTemplate-textSize.html",
                        "fluid_prefs_panel_otherTextSize": "%prefix/PrefsEditorTemplate-otherTextSize.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_prefs_panel_textSize": "%prefix/PrefsEditorTemplate-textSize.json",
                        "fluid_prefs_panel_otherTextSize": "%prefix/PrefsEditorTemplate-otherTextSize.json"
                    }
                },
                rootModel: {
                    gradeNames: ["fluid.prefs.rootModel", "autoInit"],
                    members: {
                        rootModel: {
                            fluid_prefs_textSize: 1
                        }
                    }
                }
            },
            expectedManyPrefsOnePanel: {
                "namespace": fluid.tests.auxSchema.defaultNamespace,
                "emphasizeLinks": {
                    "type": "fluid.prefs.emphasizeLinks",
                    "panel": {
                        "type": "fluid.prefs.panel.linksControls",
                        "container": ".flc-prefsEditor-links-controls",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/PrefsEditorTemplate-links.html",
                        "message": "%prefix/PrefsEditorTemplate-links.json"
                    }
                },
                "inputsLarger": {
                    "type": "fluid.prefs.inputsLarger",
                    "panel": {
                        "type": "fluid.prefs.panel.linksControls"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.prefs.prefsEditor", "autoInit"],
                    "selectors": {
                        "fluid_prefs_panel_linksControls": ".flc-prefsEditor-links-controls"
                    },
                    "components": {
                        "fluid_prefs_panel_linksControls": {
                            "type": "fluid.prefs.panel.linksControls",
                            "container": "prefsEditor.dom.fluid_prefs_panel_linksControls",
                            "createOnEvent": "onPrefsEditorMarkupReady",
                            options: {
                                gradeNames: "fluid.prefs.defaultPanel",
                                model: {
                                    links: false,
                                    inputsLarger: false
                                },
                                rules: {
                                    fluid_prefs_emphasizeLinks: "links",
                                    fluid_prefs_inputsLarger: "inputsLarger"
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_prefs_panel_linksControls"
                                }
                            }
                        }
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_prefs_panel_linksControls": "%prefix/PrefsEditorTemplate-links.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_prefs_panel_linksControls": "%prefix/PrefsEditorTemplate-links.json"
                    }
                },
                rootModel: {
                    gradeNames: ["fluid.prefs.rootModel", "autoInit"],
                    members: {
                        rootModel: {
                            fluid_prefs_emphasizeLinks: false,
                            fluid_prefs_inputsLarger: false
                        }
                    }
                }
            },
            expectedAll: {
                "namespace": fluid.tests.auxSchema.newNamespace,
                "textSize": {
                    "type": "fluid.prefs.textSize",
                    "panel": {
                        "type": "fluid.prefs.panel.textSize",
                        "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/PrefsEditorTemplate-textSize.html",
                        "message": "%prefix/PrefsEditorTemplate-textSize.json"
                    },
                    "enactor": {
                        "type": "fluid.prefs.enactors.textSize"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.prefs.prefsEditor", "autoInit"],
                    "selectors": {
                        "fluid_prefs_panel_textSize": ".flc-prefsEditor-text-size"
                    },
                    "components": {
                        "fluid_prefs_panel_textSize": {
                            "type": "fluid.prefs.panel.textSize",
                            "container": "prefsEditor.dom.fluid_prefs_panel_textSize",
                            "createOnEvent": "onPrefsEditorMarkupReady",
                            options: {
                                gradeNames: "fluid.prefs.defaultPanel",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_prefs_textSize: "value"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_prefs_panel_textSize"
                                }
                            }
                        }
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                    templates: {
                        "prefsEditor": "%prefix/SeparatedPanelPrefsEditor.html",
                        "fluid_prefs_panel_textSize": "%prefix/PrefsEditorTemplate-textSize.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_prefs_panel_textSize": "%prefix/PrefsEditorTemplate-textSize.json",
                        "prefsEditor": "%prefix/PrefsEditorTemplate-prefsEditor.json"
                    }
                },
                enactors: {
                    "gradeNames": ["fluid.uiEnhancer", "autoInit"],
                    "components": {
                        "fluid_prefs_enactors_textSize": {
                            type: "fluid.prefs.enactors.textSize",
                            container: "uiEnhancer.container",
                            options: {
                                sourceApplier: "uiEnhancer.applier",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_prefs_textSize: "value"
                                }
                            }
                        }
                    },
                    "selectors": {}
                },
                rootModel: {
                    gradeNames: ["fluid.prefs.rootModel", "autoInit"],
                    members: {
                        rootModel: {
                            fluid_prefs_textSize: 1
                        }
                    }
                },
                templatePrefix: {
                    gradeNames: ["fluid.littleComponent", "autoInit"],
                    templatePrefix: "../html"
                },
                messagePrefix: {
                    gradeNames: ["fluid.littleComponent", "autoInit"],
                    messagePrefix: "../messages"
                }
            }
        },
        modules: [{
            name: "Test auxBuilder",
            tests: [{
                expect: 1,
                name: "expandedAuxSchema - empty",
                type: "test",
                func: "fluid.tests.testAuxBuilder",
                args: ["{auxbuilderEmpty}.options.expandedAuxSchema", "{that}.options.testOptions.expectedPrefs"]
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
        gradeNames: ["autoInit", "fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.subPanel1": {
                "default": "sub1",
                "options.min": "minimum",
                "options.max": "maximum"
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.subPanel2", {
        gradeNames: ["autoInit", "fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.subPanel2": {
                "default": "sub2"
            }
        }
    });

    fluid.defaults("fluid.prefs.panel.combinedBoth", {
        gradeNames: ["fluid.prefs.panel", "autoInit"]
    });

    fluid.defaults("fluid.prefs.panel.subPanel1", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.subPanel1": {
                "model.value": "default",
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
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.subPanel2": {
                "model.value": "default"
            }
        },
        selectors: {
            header: "h2"
        },
        protoTree: {
            header: "${value}"
        }
    });

    fluid.defaults("fluid.prefs.enactors.subPanel1", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactors", "autoInit"],
        preferenceMap: {
            "fluid.prefs.subPanel1": {
                "model.value": "default"
            }
        }
    });

    fluid.defaults("fluid.prefs.enactors.subPanel2", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactors", "autoInit"],
        preferenceMap: {
            "fluid.prefs.subPanel2": {
                "model.value": "default"
            }
        }
    });
    
    var mappedDefaults = {
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

    var panelIndex = {
        "fluid.prefs.subPanel1": ["fluid.prefs.panel.subPanel1"],
        "fluid.prefs.subPanel2": ["fluid.prefs.panel.subPanel2"]
    };

    var compositePanelSchema = {
        "namespace": "fluid.prefs.constructed", // The author of the auxiliary schema will provide this and will be the component to call to initialize the constructed UIO.
        "templatePrefix": "../html/",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
        "template": "%prefix/FatPanelprefs.html",
        "messagePrefix": "../messages",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
        "message": "%prefix/prefs.json",
        "groups": {
            "combinedBoth": {
                "container": "#flc-combinedBoth",
                "template": "%prefix/combinedBoth.html",
                "message": "%prefix/combinedBoth.json",
                "type": "fluid.prefs.panel.combinedBoth",
                "panels": ["subPanel1", "subPanel2"]
            }
        },
        "subPanel1": {
            "type": "fluid.prefs.subPanel1",
            "showInGroupsOnly": true,
            "enactor": {
                "type": "fluid.prefs.enactors.subPanel1",
                "cssClass": "fl-link-enhanced"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel1",
                "container": "#flc-prefs-subPanel1",  // the css selector in the template where the panel is rendered
                "template": "%prefix/subPanel1.html",
                "message": "%prefix/subPanel1.json"
            }
        },
        "subPanel2": {
            "type": "fluid.prefs.subPanel2",
            "enactor": {
                "type": "fluid.prefs.enactors.subPanel2",
                "cssClass": "fl-text-larger"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel2",
                "container": "#flc-prefs-subPanel2",  // the css selector in the template where the panel is rendered
                "template": "%prefix/subPanel2.html",
                "message": "%prefix/subPanel2.json"
            }
        }
    };

    var expectedCompositePanelGrades = {
        "namespace": "fluid.prefs.constructed",
        "groups": {
            "combinedBoth": {
                "container": "#flc-combinedBoth",
                "template": "%prefix/combinedBoth.html",
                "message": "%prefix/combinedBoth.json",
                "type": "fluid.prefs.panel.combinedBoth",
                "panels": ["subPanel1", "subPanel2"]
            }
        },
        "subPanel1": {
            "type": "fluid.prefs.subPanel1",
            "showInGroupsOnly": true,
            "enactor": {
                "type": "fluid.prefs.enactors.subPanel1",
                "cssClass": "fl-link-enhanced"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel1",
                "container": ".flc-prefs-subPanel1",  // the css selector in the template where the panel is rendered
                "template": "%prefix/subPanel1.html",
                "message": "%prefix/subPanel1.json"
            }
        },
        "subPanel2": {
            "type": "fluid.prefs.subPanel2",
            "enactor": {
                "type": "fluid.prefs.enactors.subPanel2",
                "cssClass": "fl-text-larger"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel2",
                "container": ".flc-prefs-subPanel2",  // the css selector in the template where the panel is rendered
                "template": "%prefix/subPanel2.html",
                "message": "%prefix/subPanel2.json"
            }
        },
        panels: {
            "gradeNames": ["fluid.prefs.prefsEditor", "autoInit"],
            "selectors": {
                "combinedBoth": "#flc-combinedBoth"
            },
            "components": {
                "combinedBoth": {
                    "type": "fluid.prefs.panel.combinedBoth",
                    "container": "prefsEditor.dom.combinedBoth",
                    "createOnEvent": "onPrefsEditorMarkupReady",
                    options: {
                        gradeNames: ["fluid.prefs.defaultPanel", "fluid.prefs.compositePanel"],
                        resources: {
                            template: "templateLoader.resources.combinedBoth",
                            "fluid_prefs_subPanel1": "templateLoader.resources.fluid_prefs_subPanel1",
                            "fluid_prefs_subPanel2": "templateLoader.resources.fluid_prefs_subPanel2"
                        },
                        selectors: {
                            "fluid_prefs_subPanel1": ".flc-prefs-subPanel1",
                            "fluid_prefs_subPanel2": ".flc-prefs-subPanel2"
                        },
                        "selectorsToIgnore": ["fluid_prefs_subPanel1", "fluid_prefs_subPanel2"],
                        model: {
                            "fluid_prefs_subPanel1": false,
                            "fluid_prefs_subPanel2": false
                        },
                        rules: {
                            "fluid_prefs_subPanel1": "fluid_prefs_subPanel1",
                            "fluid_prefs_subPanel2": "fluid_prefs_subPanel2"
                        },
                        components: {
                            "fluid_prefs_subPanel1": {
                                "type": "fluid.prefs.panel.subPanel1",
                                "container": "{combinedBoth}.dom.fluid_prefs_subPanel1",
                                createOnEvent: "initSubPanels",
                                "options": {
                                    range: {
                                        min: 1,
                                        max: 10
                                    }
                                }
                            },
                            "fluid_prefs_subPanel2": {
                                "type": "fluid.prefs.panel.subPanel2",
                                "container": "{combinedBoth}.dom.fluid_prefs_subPanel2",
                                createOnEvent: "initSubPanels"
                            }
                        }
                    }
                }
            }
        },
        templateLoader: {
            gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
            templates: {
                "combinedBoth": "%prefix/combinedBoth.html",
                "fluid_prefs_subPanel1": "%prefix/subPanel1.html",
                "fluid_prefs_subPanel2": "%prefix/subPanel2.html"
            }
        },
        messageLoader: {
            gradeNames: ["fluid.prefs.resourceLoader", "autoInit"],
            templates: {
                "combinedBoth": "%prefix/combinedBoth.json",
                "fluid_prefs_subPanel1": "%prefix/subPanel1.json",
                "fluid_prefs_subPanel2": "%prefix/subPanel2.json"
            }
        },
        enactors: {
            "gradeNames": ["fluid.uiEnhancer", "autoInit"],
            "components": {
                "fluid_prefs_enactors_subPanel1": {
                    type: "fluid.prefs.enactors.subPanel1",
                    container: "uiEnhancer.container",
                    options: {
                        sourceApplier: "uiEnhancer.applier",
                        model: {
                            value: 1
                        },
                        rules: {
                            fluid_prefs_subPanel1: "value"
                        }
                    }
                },
                "fluid_prefs_enactors_subPanel2": {
                    type: "fluid.prefs.enactors.subPanel2",
                    container: "uiEnhancer.container",
                    options: {
                        sourceApplier: "uiEnhancer.applier",
                        model: {
                            value: 1
                        },
                        rules: {
                            fluid_prefs_subPanel2: "value"
                        }
                    }
                }
            },
            "selectors": {}
        },
        rootModel: {
            gradeNames: ["fluid.prefs.rootModel", "autoInit"],
            members: {
                rootModel: {
                    fluid_prefs_subPanel1: false,
                    fluid_prefs_subPanel2: false
                }
            }
        },
        templatePrefix: {
            gradeNames: ["fluid.littleComponent", "autoInit"],
            templatePrefix: "../html"
        },
        messagePrefix: {
            gradeNames: ["fluid.littleComponent", "autoInit"],
            messagePrefix: "../messages"
        },
        panelsToIgnore: ["subPanel1", "subPanel2"]
    };

    var expandedComposite = {
        "namespace": "fluid.prefs.constructed", // The author of the auxiliary schema will provide this and will be the component to call to initialize the constructed UIO.
        "templatePrefix": "../html/",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
        "template": "%prefix/FatPanelprefs.html",
        "messagePrefix": "../messages",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
        "message": "%prefix/prefs.json",
        "groups": {
            "combinedBoth": {
                "container": "#flc-combinedBoth",
                "template": "%prefix/combinedBoth.html",
                "message": "%prefix/combinedBoth.json",
                "type": "fluid.prefs.panel.combinedBoth",
                "panels": ["subPanel1", "subPanel2"]
            }
        },
        "subPanel1": {
            "type": "fluid.prefs.subPanel1",
            "showInGroupsOnly": true,
            "enactor": {
                "type": "fluid.prefs.enactors.subPanel1",
                "cssClass": "fl-link-enhanced"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel1",
                "container": "#flc-prefs-subPanel1",  // the css selector in the template where the panel is rendered
                "template": "%prefix/subPanel1.html",
                "message": "%prefix/subPanel1.json"
            }
        },
        "subPanel2": {
            "type": "fluid.prefs.subPanel2",
            "enactor": {
                "type": "fluid.prefs.enactors.subPanel2",
                "cssClass": "fl-text-larger"
            },
            "panel": {
                "type": "fluid.prefs.panel.subPanel2",
                "container": "#flc-prefs-subPanel2",  // the css selector in the template where the panel is rendered
                "template": "%prefix/subPanel2.html",
                "message": "%prefix/subPanel2.json"
            }
        },
        panels: {
            "selectors": {
                "combinedBoth": "#flc-combinedBoth"
            },
            "components": {
                "combinedBoth": {
                    "type": "fluid.prefs.panel.combinedBoth",
                    "container": "prefsEditor.dom.combinedBoth",
                    "createOnEvent": "onPrefsEditorMarkupReady",
                    options: {
                        gradeNames: ["fluid.prefs.defaultPanel", "fluid.prefs.compositePanel"],
                        resources: {
                            template: "templateLoader.resources.combinedBoth",
                            "fluid_prefs_subPanel1": "templateLoader.resources.fluid_prefs_subPanel1",
                            "fluid_prefs_subPanel2": "templateLoader.resources.fluid_prefs_subPanel2"
                        },
                        selectors: {
                            "fluid_prefs_subPanel1": "#flc-prefs-subPanel1",
                            "fluid_prefs_subPanel2": "#flc-prefs-subPanel2"
                        },
                        "selectorsToIgnore": ["fluid_prefs_subPanel1", "fluid_prefs_subPanel2"],
                        model: {
                            "fluid_prefs_subPanel1": false,
                            "fluid_prefs_subPanel2": false
                        },
                        rules: {
                            "fluid_prefs_subPanel1": "fluid_prefs_subPanel1",
                            "fluid_prefs_subPanel2": "fluid_prefs_subPanel2"
                        },
                        components: {
                            "fluid_prefs_subPanel1": {
                                "type": "fluid.prefs.panel.subPanel1",
                                "container": "combinedBoth.dom.fluid_prefs_subPanel1",
                                createOnEvent: "initSubPanels",
                                "options": {
                                    range: {
                                        min: 1,
                                        max: 10
                                    }
                                }
                            },
                            "fluid_prefs_subPanel2": {
                                "type": "fluid.prefs.panel.subPanel2",
                                "container": "combinedBoth.dom.fluid_prefs_subPanel2",
                                createOnEvent: "initSubPanels"
                            }
                        }
                    }
                }
            }
        },
        templateLoader: {
            templates: {
                "combinedBoth": "%prefix/combinedBoth.html",
                "fluid_prefs_subPanel1": "%prefix/subPanel1.html",
                "fluid_prefs_subPanel2": "%prefix/subPanel2.html"
            }
        },
        messageLoader: {
            templates: {
                "combinedBoth": "%prefix/combinedBoth.json",
                "fluid_prefs_subPanel1": "%prefix/subPanel1.json",
                "fluid_prefs_subPanel2": "%prefix/subPanel2.json"
            }
        },
        rootModel: {
            members: {
                rootModel: {
                    fluid_prefs_subPanel1: false,
                    fluid_prefs_subPanel2: false
                }
            }
        },
        panelsToIgnore: ["subPanel1", "subPanel2"]
    };

    jqUnit.test("Test expanding composite panel groups fluid.prefs.expandCompositePanels()", function () {
        var expandedCompositePanel = fluid.prefs.expandCompositePanels(compositePanelSchema, compositePanelSchema["groups"], panelIndex,
                fluid.get(fluid.tests.elementCommonOptions, "compositePanel"), fluid.get(fluid.tests.elementCommonOptions, "subPanel"), 
                fluid.get(fluid.tests.elementCommonOptions, "compositePanelBasedOnSub"), mappedDefaults);

        jqUnit.assertDeepEq("The auxiliary schema for a composit panel has been parsed correctly", expandedComposite, expandedCompositePanel);
    });

    var restForAll = {};

    var expandedRestForAll = {
        enactors: {
            "gradeNames": ["fluid.uiEnhancer", "autoInit"],
            "components": {
                "fluid_prefs_enactors_subPanel1": {
                    type: "fluid.prefs.enactors.subPanel1",
                    container: "uiEnhancer.container",
                    options: {
                        sourceApplier: "uiEnhancer.applier",
                        model: {
                            value: 1
                        },
                        rules: {
                            fluid_prefs_subPanel1: "value"
                        }
                    }
                },
                "fluid_prefs_enactors_subPanel2": {
                    type: "fluid.prefs.enactors.subPanel2",
                    container: "uiEnhancer.container",
                    options: {
                        sourceApplier: "uiEnhancer.applier",
                        model: {
                            value: 1
                        },
                        rules: {
                            fluid_prefs_subPanel2: "value"
                        }
                    }
                }
            },
            "selectors": {}
        },
    };
    // jqUnit.test("Parse aux builder for compositePanel", function () {
    //     var auxBuilder = fluid.prefs.auxBuilder({
    //         auxiliarySchema: $.extend(true, compositePanelSchema, restForAll),
    //         elementCommonOptions: fluid.tests.elementCommonOptions,
    //         mappedDefaults: mappedDefaults
    //     });
    //     jqUnit.assertDeepEq("The auxiliary schema for a composit panel has been parsed correctly", $.extend(true, expandedComposite, expandedRestForAll), auxBuilder.options.expandedAuxSchema);
    // });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.expandSchemaValueTest",
            "fluid.tests.schemaExpanderTest",
            "fluid.tests.expandSchemaComponentsTest",
            "fluid.tests.expandSchemaDirectOptionTest",
            "fluid.tests.auxBuilderTest"
        ]);
    });

})(jQuery);
