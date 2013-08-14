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
     * Unit tests for fluid.uiOptions.expandSchemaValue
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
            var value = fluid.uiOptions.expandSchemaValue(source, templates[i]);
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
            "type": "fluid.uiOptions.textFont",
            "classes": {
                "default": "",
                "times": "fl-font-uio-times",
                "comic": "fl-font-uio-comic-sans",
                "arial": "fl-font-uio-arial",
                "verdana": "fl-font-uio-verdana"
            }
        },
        "contrast": {
            "type": "fluid.uiOptions.contrast",
            "classes": {
                "default": "fl-theme-uio-default",
                "bw": "fl-theme-uio-bw fl-theme-bw",
                "wb": "fl-theme-uio-wb fl-theme-wb",
                "by": "fl-theme-uio-by fl-theme-by",
                "yb": "fl-theme-uio-yb fl-theme-yb"
            }
        },
        "enactors": [{
            "type": "fluid.uiOptions.enactors.textFont",
            "classes": "@textFont.classes"
        }, {
            "type": "fluid.uiOptions.enactors.contrast",
            "classes": "@contrast.classes"
        }, {
            "type": "fluid.uiOptions.enactors.tableOfContents",
            "template": "the-location-of-toc-template",
            "random": "@random.path"
        }],
        "panels": [{
            "type": "fluid.uiOptions.panels.textFont",
            "container": ".flc-uiOptions-text-font",
            "classnameMap": "@textFont.classes",
            "template": "templates/textFont"
        }, {
            "type": "fluid.uiOptions.panels.contrast",
            "container": ".flc-uiOptions-contrast",
            "classnameMap": "@contrast.classes",
            "template": "templates/contrast"
        }]
    };

    fluid.tests.expectedSchema = {
        "textFont": {
            "type": "fluid.uiOptions.textFont",
            "classes": {
                "default": "",
                "times": "fl-font-uio-times",
                "comic": "fl-font-uio-comic-sans",
                "arial": "fl-font-uio-arial",
                "verdana": "fl-font-uio-verdana"
            }
        },
        "contrast": {
            "type": "fluid.uiOptions.contrast",
            "classes": {
                "default": "fl-theme-uio-default",
                "bw": "fl-theme-uio-bw fl-theme-bw",
                "wb": "fl-theme-uio-wb fl-theme-wb",
                "by": "fl-theme-uio-by fl-theme-by",
                "yb": "fl-theme-uio-yb fl-theme-yb"
            }
        },
        "enactors": [{
            "type": "fluid.uiOptions.enactors.textFont",
            "classes": {
                "default": "",
                "times": "fl-font-uio-times",
                "comic": "fl-font-uio-comic-sans",
                "arial": "fl-font-uio-arial",
                "verdana": "fl-font-uio-verdana"
            }
        }, {
            "type": "fluid.uiOptions.enactors.contrast",
            "classes": {
                "default": "fl-theme-uio-default",
                "bw": "fl-theme-uio-bw fl-theme-bw",
                "wb": "fl-theme-uio-wb fl-theme-wb",
                "by": "fl-theme-uio-by fl-theme-by",
                "yb": "fl-theme-uio-yb fl-theme-yb"
            }
        }, {
            "type": "fluid.uiOptions.enactors.tableOfContents",
            "random": undefined,
            "template": "the-location-of-toc-template"
        }],
        "panels": [{
            "type": "fluid.uiOptions.panels.textFont",
            "container": ".flc-uiOptions-text-font",
            "classnameMap": {
                "default": "",
                "times": "fl-font-uio-times",
                "comic": "fl-font-uio-comic-sans",
                "arial": "fl-font-uio-arial",
                "verdana": "fl-font-uio-verdana"
            },
            "template": "templates/textFont"
        }, {
            "type": "fluid.uiOptions.panels.contrast",
            "container": ".flc-uiOptions-contrast",
            "classnameMap": {
                "default": "fl-theme-uio-default",
                "bw": "fl-theme-uio-bw fl-theme-bw",
                "wb": "fl-theme-uio-wb fl-theme-wb",
                "by": "fl-theme-uio-by fl-theme-by",
                "yb": "fl-theme-uio-yb fl-theme-yb"
            },
            "template": "templates/contrast"
        }]
    };

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.schemaExpander
     *******************************************************************************/

    fluid.tests.testSchemaExpander = function (schema, expectedOutput) {
        var output = fluid.uiOptions.expandSchemaImpl(schema);
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
            "createOnEvent": "onUIOptionsMarkupReady",
            "container": "uiOptions.dom.%prefKey",
            "options.gradeNames": "fluid.uiOptions.defaultPanel",
            "options.resources.template": "templateLoader.resources.%prefKey"
        },
        enactor: {
            "container": "uiEnhancer.container",
            "options.sourceApplier": "uiEnhancer.applier"
        }
    };

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.expandSchemaComponents
     *******************************************************************************/

    fluid.tests.testExpandSchemaComponents = function (auxSchema, type, prefKey, componentConfig, index, primarySchema, expectedOutput) {
        var panelsTopCommonOptions = fluid.get(fluid.defaults("fluid.uiOptions.auxBuilder"), "topCommonOptions.panels");
        var panelsCommonOptions = fluid.get(fluid.tests.elementCommonOptions, "panel");
        var output = fluid.uiOptions.expandSchemaComponents(auxSchema, type, prefKey, componentConfig, index, panelsCommonOptions, primarySchema);
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
                    "type": "fluid.uiOptions.contrast",
                    "classes": {
                        "default": "fl-theme-uio-default",
                        "bw": "fl-theme-uio-bw fl-theme-bw",
                        "wb": "fl-theme-uio-wb fl-theme-wb",
                        "by": "fl-theme-uio-by fl-theme-by",
                        "yb": "fl-theme-uio-yb fl-theme-yb"
                    },
                    "panel": {
                        "type": "fluid.uiOptions.panels.contrast",
                        "container": ".flc-uiOptions-contrast",  // the css selector in the template where the panel is rendered
                        "classnameMap": {
                            "default": "fl-theme-uio-default",
                            "bw": "fl-theme-uio-bw fl-theme-bw",
                            "wb": "fl-theme-uio-wb fl-theme-wb",
                            "by": "fl-theme-uio-by fl-theme-by",
                            "yb": "fl-theme-uio-yb fl-theme-yb"
                        },
                        "template": "templates/contrast",
                        "message": "messages/contrast"
                    }
                }
            },
            index: {
                "fluid.uiOptions.contrast": ["fluid.uiOptions.panels.contrast"]
            },
            primarySchema: {
                "fluid.uiOptions.contrast": {
                    "type": "string",
                    "default": "default",
                    "enum": ["default", "bw", "wb", "by", "yb"]
                }
            },
            expectedOutput: {
                "contrast": {
                    "type": "fluid.uiOptions.contrast",
                    "classes": {
                        "default": "fl-theme-uio-default",
                        "bw": "fl-theme-uio-bw fl-theme-bw",
                        "wb": "fl-theme-uio-wb fl-theme-wb",
                        "by": "fl-theme-uio-by fl-theme-by",
                        "yb": "fl-theme-uio-yb fl-theme-yb"
                    },
                    "panel": {
                        "type": "fluid.uiOptions.panels.contrast",
                        "container": ".flc-uiOptions-contrast",  // the css selector in the template where the panel is rendered
                        "classnameMap": {
                            "default": "fl-theme-uio-default",
                            "bw": "fl-theme-uio-bw fl-theme-bw",
                            "wb": "fl-theme-uio-wb fl-theme-wb",
                            "by": "fl-theme-uio-by fl-theme-by",
                            "yb": "fl-theme-uio-yb fl-theme-yb"
                        },
                        "template": "templates/contrast",
                        "message": "messages/contrast"
                    }
                },
                panels: {
                    selectors: {
                        "fluid_uiOptions_panels_contrast": ".flc-uiOptions-contrast",
                    },
                    components: {
                        "fluid_uiOptions_panels_contrast": {
                            type: "fluid.uiOptions.panels.contrast",
                            container: "uiOptions.dom.fluid_uiOptions_panels_contrast",
                            createOnEvent: "onUIOptionsMarkupReady",
                            options: {
                                gradeNames: "fluid.uiOptions.defaultPanel",
                                classnameMap: {
                                    "default": "fl-theme-uio-default",
                                    "bw": "fl-theme-uio-bw fl-theme-bw",
                                    "wb": "fl-theme-uio-wb fl-theme-wb",
                                    "by": "fl-theme-uio-by fl-theme-by",
                                    "yb": "fl-theme-uio-yb fl-theme-yb"
                                },
                                rules: {
                                    "fluid_uiOptions_contrast": "value"
                                },
                                model: {
                                    value: "default"
                                },
                                controlValues: {
                                    theme: ["default", "bw", "wb", "by", "yb"]
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_uiOptions_panels_contrast"
                                }
                            }
                        }
                    }
                },
                templateLoader: {
                    templates: {
                        "fluid_uiOptions_panels_contrast": "templates/contrast"
                    }
                },
                messageLoader: {
                    templates: {
                        "fluid_uiOptions_panels_contrast": "messages/contrast"
                    }
                },
                rootModel: {
                    members: {
                        rootModel: {
                            "fluid_uiOptions_contrast": "default"
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
     * Unit tests for fluid.uiOptions.expandSchemaDirectOption
     *******************************************************************************/

    fluid.tests.testExpandSchemaDirectOption = function (auxSchema, rules, expectedOutput) {
        fluid.each(rules, function (targetPath, sourcePath) {
            fluid.uiOptions.expandSchemaDirectOption(auxSchema, sourcePath, targetPath);
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
                stringValue: "sPath1.sPath2",
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
     * Unit tests for fluid.uiOptions.auxbuilder
     *******************************************************************************/

    fluid.registerNamespace("fluid.tests.auxSchema");

    fluid.tests.testAuxBuilder = function (expandedSchema, expectedExpandedSchema) {
        jqUnit.assertDeepEq("The schema was expanded correctly", expectedExpandedSchema, expandedSchema);
    };

    fluid.tests.auxSchema.defaultNamespace = fluid.defaults("fluid.uiOptions.auxBuilder").defaultNamespace;
    fluid.tests.auxSchema.newNamespace = "fluid.uiOptions.constructedUIO";

    fluid.tests.auxSchema.panels = {
        "textSize": {
            "type": "fluid.uiOptions.textSize",
            "panel": {
                "type": "fluid.uiOptions.panels.textSize",
                "container": ".flc-uiOptions-text-size",  // the css selector in the template where the panel is rendered
                "template": "%prefix/UIOptionsTemplate-textSize.html",
                "message": "%prefix/UIOptionsTemplate-textSize.json"
            }
        }
    };

    fluid.tests.auxSchema.manyPrefsOnePanel = {
        "emphasizeLinks": {
            "type": "fluid.uiOptions.emphasizeLinks",
            "panel": {
                "type": "fluid.uiOptions.panels.linksControls",
                "container": ".flc-uiOptions-links-controls",  // the css selector in the template where the panel is rendered
                "template": "%prefix/UIOptionsTemplate-links.html",
                "message": "%prefix/UIOptionsTemplate-links.json"
            }
        },
        "inputsLarger": {
            "type": "fluid.uiOptions.inputsLarger",
            "panel": {
                "type": "fluid.uiOptions.panels.linksControls"
            }
        }
    };

    fluid.defaults("fluid.uiOptions.panels.otherTextSize", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.textSize": {
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
            "type": "fluid.uiOptions.textSize",
            "panel": {
                "type": "fluid.uiOptions.panels.textSize",
                "container": ".flc-uiOptions-text-size",  // the css selector in the template where the panel is rendered
                "template": "%prefix/UIOptionsTemplate-textSize.html",
                "message": "%prefix/UIOptionsTemplate-textSize.json"
            }
        },
        "textSize.other": {
            "type": "fluid.uiOptions.textSize",
            "panel": {
                "type": "fluid.uiOptions.panels.otherTextSize",
                "container": ".flc-uiOptions-otherTextSize",  // the css selector in the template where the panel is rendered
                "template": "%prefix/UIOptionsTemplate-otherTextSize.html",
                "message": "%prefix/UIOptionsTemplate-otherTextSize.json"
            }
        }
    };

    fluid.tests.auxSchema.enactors = {
        "textSize": {
            "type": "fluid.uiOptions.textSize",
            "enactor": {
                "type": "fluid.uiOptions.enactors.textSize"
            }
        }
    };

    fluid.tests.auxSchema.namespace = {
        "namespace": fluid.tests.auxSchema.newNamespace
    };

    fluid.tests.auxSchema.template = {
        "template": "%prefix/FatPanelUIOptions.html"
    };

    fluid.tests.auxSchema.templatePrefix = {
        templatePrefix: "../html"
    };

    fluid.tests.auxSchema.message = {
        "message": "%prefix/UIOptionsTemplate-uiOptions.json"
    };

    fluid.tests.auxSchema.messagePrefix = {
        messagePrefix: "../messages"
    };

    fluid.tests.auxSchema.mappedDefaults = {
        "fluid.uiOptions.textSize": {
            "type": "number",
            "default": 1,
            "minimum": 1,
            "maximum": 2,
            "divisibleBy": 0.1
        },
        "fluid.uiOptions.emphasizeLinks": {
            "type": "boolean",
            "default": false
        },
        "fluid.uiOptions.inputsLarger": {
            "type": "boolean",
            "default": false
        }
    };

    fluid.defaults("fluid.tests.auxBuilderTest", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            auxbuilderEmpty: {
                type: "fluid.uiOptions.auxBuilder",
                options: {
                    auxiliarySchema: fluid.tests.auxSchema.prefs,
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderOnlyEnactor: {
                type: "fluid.uiOptions.auxBuilder",
                options: {
                    auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.enactors, fluid.tests.auxSchema.namespace),
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderOnlyPanel: {
                type: "fluid.uiOptions.auxBuilder",
                options: {
                    auxiliarySchema: fluid.tests.auxSchema.panels,
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderManyPanelsOnePref: {
                type: "fluid.uiOptions.auxBuilder",
                options: {
                    auxiliarySchema: fluid.tests.auxSchema.manyPanelsOnePref,
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderManyPrefsOnePanel: {
                type: "fluid.uiOptions.auxBuilder",
                options: {
                    auxiliarySchema: fluid.tests.auxSchema.manyPrefsOnePanel,
                    elementCommonOptions: fluid.tests.elementCommonOptions,
                    mappedDefaults: fluid.tests.auxSchema.mappedDefaults
                }
            },
            auxbuilderAll: {
                type: "fluid.uiOptions.auxBuilder",
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
                    "type": "fluid.uiOptions.textSize",
                    "panel": {
                        "type": "fluid.uiOptions.panels.textSize",
                        "container": ".flc-uiOptions-text-size",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/UIOptionsTemplate-textSize.html",
                        "message": "%prefix/UIOptionsTemplate-textSize.json"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.uiOptions", "autoInit"],
                    "selectors": {
                        "fluid_uiOptions_panels_textSize": ".flc-uiOptions-text-size"
                    },
                    "components": {
                        "fluid_uiOptions_panels_textSize": {
                            "type": "fluid.uiOptions.panels.textSize",
                            "container": "uiOptions.dom.fluid_uiOptions_panels_textSize",
                            "createOnEvent": "onUIOptionsMarkupReady",
                            options: {
                                gradeNames: "fluid.uiOptions.defaultPanel",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_uiOptions_textSize: "value"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_uiOptions_panels_textSize"
                                }
                            }
                        }
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_uiOptions_panels_textSize": "%prefix/UIOptionsTemplate-textSize.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_uiOptions_panels_textSize": "%prefix/UIOptionsTemplate-textSize.json"
                    }
                },
                rootModel: {
                    gradeNames: ["fluid.uiOptions.rootModel", "autoInit"],
                    members: {
                        rootModel: {
                            fluid_uiOptions_textSize: 1
                        }
                    }
                }
            },
            expectedEnactors: {
                "namespace": fluid.tests.auxSchema.newNamespace,
                "textSize": {
                    "type": "fluid.uiOptions.textSize",
                    "enactor": {
                        "type": "fluid.uiOptions.enactors.textSize"
                    }
                },
                enactors: {
                    "gradeNames": ["fluid.uiEnhancer", "autoInit"],
                    "selectors": {},
                    "components": {
                        "fluid_uiOptions_enactors_textSize": {
                            type: "fluid.uiOptions.enactors.textSize",
                            container: "uiEnhancer.container",
                            options: {
                                sourceApplier: "uiEnhancer.applier",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_uiOptions_textSize: "value"
                                }
                            }
                        }
                    }
                },
                rootModel: {
                    gradeNames: ["fluid.uiOptions.rootModel", "autoInit"],
                    members: {
                        rootModel: {
                            fluid_uiOptions_textSize: 1
                        }
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
                    templates: {}
                },
                templateLoader: {
                    gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
                    templates: {}
                }
            },
            expectedManyPanelsOnePref: {
                "namespace": fluid.tests.auxSchema.defaultNamespace,
                "textSize": {
                    "type": "fluid.uiOptions.textSize",
                    "panel": {
                        "type": "fluid.uiOptions.panels.textSize",
                        "container": ".flc-uiOptions-text-size",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/UIOptionsTemplate-textSize.html",
                        "message": "%prefix/UIOptionsTemplate-textSize.json"
                    }
                },
                "textSize.other": {
                    "type": "fluid.uiOptions.textSize",
                    "panel": {
                        "type": "fluid.uiOptions.panels.otherTextSize",
                        "container": ".flc-uiOptions-otherTextSize",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/UIOptionsTemplate-otherTextSize.html",
                        "message": "%prefix/UIOptionsTemplate-otherTextSize.json"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.uiOptions", "autoInit"],
                    "selectors": {
                        "fluid_uiOptions_panels_textSize": ".flc-uiOptions-text-size",
                        "fluid_uiOptions_panels_otherTextSize": ".flc-uiOptions-otherTextSize"
                    },
                    "components": {
                        "fluid_uiOptions_panels_textSize": {
                            "type": "fluid.uiOptions.panels.textSize",
                            "container": "uiOptions.dom.fluid_uiOptions_panels_textSize",
                            "createOnEvent": "onUIOptionsMarkupReady",
                            options: {
                                gradeNames: "fluid.uiOptions.defaultPanel",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_uiOptions_textSize: "value"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_uiOptions_panels_textSize"
                                }
                            }
                        },
                        "fluid_uiOptions_panels_otherTextSize": {
                            "type": "fluid.uiOptions.panels.otherTextSize",
                            "container": "uiOptions.dom.fluid_uiOptions_panels_otherTextSize",
                            "createOnEvent": "onUIOptionsMarkupReady",
                            options: {
                                gradeNames: "fluid.uiOptions.defaultPanel",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_uiOptions_textSize: "value"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_uiOptions_panels_otherTextSize"
                                }
                            }
                        }
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_uiOptions_panels_textSize": "%prefix/UIOptionsTemplate-textSize.html",
                        "fluid_uiOptions_panels_otherTextSize": "%prefix/UIOptionsTemplate-otherTextSize.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_uiOptions_panels_textSize": "%prefix/UIOptionsTemplate-textSize.json",
                        "fluid_uiOptions_panels_otherTextSize": "%prefix/UIOptionsTemplate-otherTextSize.json"
                    }
                },
                rootModel: {
                    gradeNames: ["fluid.uiOptions.rootModel", "autoInit"],
                    members: {
                        rootModel: {
                            fluid_uiOptions_textSize: 1
                        }
                    }
                }
            },
            expectedManyPrefsOnePanel: {
                "namespace": fluid.tests.auxSchema.defaultNamespace,
                "emphasizeLinks": {
                    "type": "fluid.uiOptions.emphasizeLinks",
                    "panel": {
                        "type": "fluid.uiOptions.panels.linksControls",
                        "container": ".flc-uiOptions-links-controls",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/UIOptionsTemplate-links.html",
                        "message": "%prefix/UIOptionsTemplate-links.json"
                    }
                },
                "inputsLarger": {
                    "type": "fluid.uiOptions.inputsLarger",
                    "panel": {
                        "type": "fluid.uiOptions.panels.linksControls"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.uiOptions", "autoInit"],
                    "selectors": {
                        "fluid_uiOptions_panels_linksControls": ".flc-uiOptions-links-controls"
                    },
                    "components": {
                        "fluid_uiOptions_panels_linksControls": {
                            "type": "fluid.uiOptions.panels.linksControls",
                            "container": "uiOptions.dom.fluid_uiOptions_panels_linksControls",
                            "createOnEvent": "onUIOptionsMarkupReady",
                            options: {
                                gradeNames: "fluid.uiOptions.defaultPanel",
                                model: {
                                    links: false,
                                    inputsLarger: false
                                },
                                rules: {
                                    fluid_uiOptions_emphasizeLinks: "links",
                                    fluid_uiOptions_inputsLarger: "inputsLarger"
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_uiOptions_panels_linksControls"
                                }
                            }
                        }
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_uiOptions_panels_linksControls": "%prefix/UIOptionsTemplate-links.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_uiOptions_panels_linksControls": "%prefix/UIOptionsTemplate-links.json"
                    }
                },
                rootModel: {
                    gradeNames: ["fluid.uiOptions.rootModel", "autoInit"],
                    members: {
                        rootModel: {
                            fluid_uiOptions_emphasizeLinks: false,
                            fluid_uiOptions_inputsLarger: false
                        }
                    }
                }
            },
            expectedAll: {
                "namespace": fluid.tests.auxSchema.newNamespace,
                "textSize": {
                    "type": "fluid.uiOptions.textSize",
                    "panel": {
                        "type": "fluid.uiOptions.panels.textSize",
                        "container": ".flc-uiOptions-text-size",  // the css selector in the template where the panel is rendered
                        "template": "%prefix/UIOptionsTemplate-textSize.html",
                        "message": "%prefix/UIOptionsTemplate-textSize.json"
                    },
                    "enactor": {
                        "type": "fluid.uiOptions.enactors.textSize"
                    }
                },
                panels: {
                    "gradeNames": ["fluid.uiOptions", "autoInit"],
                    "selectors": {
                        "fluid_uiOptions_panels_textSize": ".flc-uiOptions-text-size"
                    },
                    "components": {
                        "fluid_uiOptions_panels_textSize": {
                            "type": "fluid.uiOptions.panels.textSize",
                            "container": "uiOptions.dom.fluid_uiOptions_panels_textSize",
                            "createOnEvent": "onUIOptionsMarkupReady",
                            options: {
                                gradeNames: "fluid.uiOptions.defaultPanel",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_uiOptions_textSize: "value"
                                },
                                range: {
                                    min: 1,
                                    max: 2
                                },
                                resources: {
                                    template: "templateLoader.resources.fluid_uiOptions_panels_textSize"
                                }
                            }
                        }
                    }
                },
                templateLoader: {
                    gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
                    templates: {
                        "uiOptions": "%prefix/FatPanelUIOptions.html",
                        "fluid_uiOptions_panels_textSize": "%prefix/UIOptionsTemplate-textSize.html"
                    }
                },
                messageLoader: {
                    gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
                    templates: {
                        "fluid_uiOptions_panels_textSize": "%prefix/UIOptionsTemplate-textSize.json",
                        "uiOptions": "%prefix/UIOptionsTemplate-uiOptions.json"
                    }
                },
                enactors: {
                    "gradeNames": ["fluid.uiEnhancer", "autoInit"],
                    "components": {
                        "fluid_uiOptions_enactors_textSize": {
                            type: "fluid.uiOptions.enactors.textSize",
                            container: "uiEnhancer.container",
                            options: {
                                sourceApplier: "uiEnhancer.applier",
                                model: {
                                    value: 1
                                },
                                rules: {
                                    fluid_uiOptions_textSize: "value"
                                }
                            }
                        }
                    },
                    "selectors": {}
                },
                rootModel: {
                    gradeNames: ["fluid.uiOptions.rootModel", "autoInit"],
                    members: {
                        rootModel: {
                            fluid_uiOptions_textSize: 1
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
