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

    fluid.tests.commonPanelOptions = {
        "createOnEvent": "onUIOptionsMarkupReady",
        "options.resources.template": "templateLoader.resources.%prefKey"
    };

    fluid.tests.commonEnactorOptions = {
        "container": "uiEnhancer.container",
        "options.sourceApplier": "uiEnhancer.applier"
    };

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.expandSchemaComponents
     *******************************************************************************/

    fluid.tests.testExpandSchemaComponents = function (auxSchema, type, index, primarySchema, expectedOutput) {
        var output = fluid.uiOptions.expandSchemaComponents(auxSchema, type, index, fluid.tests.commonPanelOptions, primarySchema);
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
                    "type": "fluid.uiOptions.contrast"
                },
                "tableOfContents": {
                    "type": "fluid.uiOptions.tableOfContents"
                },
                panels: [{
                    "type": "fluid.uiOptions.panels.contrast",
                    "container": ".flc-uiOptions-contrast",  // the css selector in the template where the panel is rendered
                    "classnameMap": {
                        "default": "fl-theme-uio-default",
                        "bw": "fl-theme-uio-bw fl-theme-bw",
                        "wb": "fl-theme-uio-wb fl-theme-wb",
                        "by": "fl-theme-uio-by fl-theme-by",
                        "yb": "fl-theme-uio-yb fl-theme-yb"
                    },
                    "template": "templates/contrast"  // optional
                }, {
                    "type": "fluid.uiOptions.panels.layoutControls",
                    "container": ".flc-uiOptions-layout-controls",  // the css selector in the template where the panel is rendered
                    "template": "templates/tableOfContents"  // optional
                }]
            },
            index: {
                "fluid.uiOptions.contrast": ["fluid.uiOptions.panels.contrast"],
                "fluid.uiOptions.layOutControls": ["fluid.uiOptions.panels.layOutControls"]
            },
            primarySchema: {
                "fluid.uiOptions.contrast": {
                    "type": "string",
                    "default": "default",
                    "enum": ["default", "bw", "wb", "by", "yb"]
                },
                "fluid.uiOptions.tableOfContents": {
                    "type": "boolean",
                    "default": false
                }
            },
            expectedOutput: {
                "contrast": {
                    "type": "fluid.uiOptions.contrast"
                },
                "tableOfContents": {
                    "type": "fluid.uiOptions.tableOfContents"
                },
                panels: {
                    "fluid_uiOptions_panels_contrast": {
                        type: "fluid.uiOptions.panels.contrast",
                        container: ".flc-uiOptions-contrast",  // the css selector in the template where the panel is rendered
                        createOnEvent: "onUIOptionsMarkupReady",
                        options: {
                            classnameMap: {
                                "default": "fl-theme-uio-default",
                                "bw": "fl-theme-uio-bw fl-theme-bw",
                                "wb": "fl-theme-uio-wb fl-theme-wb",
                                "by": "fl-theme-uio-by fl-theme-by",
                                "yb": "fl-theme-uio-yb fl-theme-yb"
                            },
                            rules: {
                                "contrast": "value"
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
                    },
                    "fluid_uiOptions_panels_layoutControls": {
                        type: "fluid.uiOptions.panels.layoutControls",
                        container: ".flc-uiOptions-layout-controls",
                        createOnEvent: "onUIOptionsMarkupReady",
                        options: {
                            rules: {
                                "tableOfContents": "toc"
                            },
                            model: {
                                toc: false
                            },
                            resources: {
                                template: "templateLoader.resources.fluid_uiOptions_panels_layoutControls"
                            }
                        }
                    }
                },
                templates: {
                    "fluid_uiOptions_panels_contrast": "templates/contrast",
                    "fluid_uiOptions_panels_layoutControls": "templates/tableOfContents"
                },
                rootModel: {
                    members: {
                        "contrast": "default",
                        "tableOfContents": false
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
                args: ["{that}.options.testOptions.auxSchema", "panels", "{that}.options.testOptions.index", "{that}.options.testOptions.primarySchema", "{that}.options.testOptions.expectedOutput"]
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

    fluid.tests.auxSchema.prefs = {
        "textSize": {
            "type": "fluid.uiOptions.textSize"
        }
    };

    fluid.tests.auxSchema.panels = {
        "panels": [{
            "type": "fluid.uiOptions.panels.textSize",
            "container": ".flc-uiOptions-text-size",  // the css selector in the template where the panel is rendered
            "template": "templates/textSize"  // optional
        }]
    };

    fluid.tests.auxSchema.enactors = {
        "enactors": [{
            "type": "fluid.uiOptions.enactors.textSize"
        }]
    };

    fluid.defaults("fluid.tests.auxBuilderTest", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            auxbuilderEmpty: {
                type: "fluid.uiOptions.auxBuilder",
                options: {
                    auxiliarySchema: fluid.tests.auxSchema.prefs,
                    commonPanelOptions: fluid.tests.commonPanelOptions,
                    commonEnactorOptions: fluid.tests.commonEnactorOptions
                }
            },
            auxbuilderOnlyEnactor: {
                type: "fluid.uiOptions.auxBuilder",
                options: {
                    auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.prefs, fluid.tests.auxSchema.enactors),
                    commonPanelOptions: fluid.tests.commonPanelOptions,
                    commonEnactorOptions: fluid.tests.commonEnactorOptions
                }
            },
            auxbuilderOnlyPanel: {
                type: "fluid.uiOptions.auxBuilder",
                options: {
                    auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.prefs, fluid.tests.auxSchema.panels),
                    commonPanelOptions: fluid.tests.commonPanelOptions,
                    commonEnactorOptions: fluid.tests.commonEnactorOptions
                }
            },
            auxbuilderAll: {
                type: "fluid.uiOptions.auxBuilder",
                options: {
                    auxiliarySchema: $.extend(true, {}, fluid.tests.auxSchema.prefs, fluid.tests.auxSchema.enactors, fluid.tests.auxSchema.panels),
                    commonPanelOptions: fluid.tests.commonPanelOptions,
                    commonEnactorOptions: fluid.tests.commonEnactorOptions
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
                "textSize": {
                    "type": "fluid.uiOptions.textSize"
                }
            },
            expectedPanels: {
                "textSize": {
                    "type": "fluid.uiOptions.textSize"
                },
                panels: {
                    "fluid_uiOptions_panels_textSize": {
                        "type": "fluid.uiOptions.panels.textSize",
                        "container": ".flc-uiOptions-text-size",
                        "createOnEvent": "onUIOptionsMarkupReady",
                        options: {
                            model: {
                                value: 1
                            },
                            rules: {
                                textSize: "value"
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
                },
                templates: {
                    "fluid_uiOptions_panels_textSize": "templates/textSize"
                },
                rootModel: {
                    members: {
                        textSize: 1
                    }
                }
            },
            expectedEnactors: {
                "textSize": {
                    "type": "fluid.uiOptions.textSize"
                },
                enactors: {
                    "fluid_uiOptions_enactors_textSize": {
                        type: "fluid.uiOptions.enactors.textSize",
                        container: "uiEnhancer.container",
                        options: {
                            sourceApplier: "uiEnhancer.applier",
                            model: {
                                value: 1
                            },
                            rules: {
                                textSize: "value"
                            }
                        }
                    }
                },
                rootModel: {
                    members: {
                        textSize: 1
                    }
                }
            },
            expectedAll: {
                "textSize": {
                    "type": "fluid.uiOptions.textSize"
                },
                panels: {
                    "fluid_uiOptions_panels_textSize": {
                        "type": "fluid.uiOptions.panels.textSize",
                        "container": ".flc-uiOptions-text-size",
                        "createOnEvent": "onUIOptionsMarkupReady",
                        options: {
                            model: {
                                value: 1
                            },
                            rules: {
                                textSize: "value"
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
                },
                templates: {
                    "fluid_uiOptions_panels_textSize": "templates/textSize"
                },
                enactors: {
                    "fluid_uiOptions_enactors_textSize": {
                        type: "fluid.uiOptions.enactors.textSize",
                        container: "uiEnhancer.container",
                        options: {
                            sourceApplier: "uiEnhancer.applier",
                            model: {
                                value: 1
                            },
                            rules: {
                                textSize: "value"
                            }
                        }
                    }
                },
                rootModel: {
                    members: {
                        textSize: 1
                    }
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
            "fluid.tests.auxBuilderTest"
        ]);
    });

})(jQuery);
