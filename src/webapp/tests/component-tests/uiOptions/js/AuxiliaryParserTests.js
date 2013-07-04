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
     * Unit tests for fluid.uiOptions.schemaExpander
     *******************************************************************************/

    fluid.defaults("fluid.tests.schemaExpanderTest", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            schemaExpanderTester: {
                type: "fluid.tests.schemaExpanderTester"
            }
        }
    });

    fluid.tests.testSchemaExpander = function (schema, expectedOutput) {
        var output = fluid.uiOptions.expandSchema(schema);
        jqUnit.assertDeepEq("The source schema is expanded correctly", expectedOutput, output);
    };

    fluid.defaults("fluid.tests.schemaExpanderTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            schema: {
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
                    "type": "fluid.uiOptions.enactors.lineSpacing",
                    "fontSizeMap": {
                        "xx-small": "9px",
                        "x-small": "11px",
                        "small": "13px",
                        "medium": "15px",
                        "large": "18px",
                        "x-large": "23px",
                        "xx-large": "30px"
                    }
                }, {
                    "type": "fluid.uiOptions.enactors.textFont",
                    "classes": "@textFont.classes"
                }, {
                    "type": "fluid.uiOptions.enactors.contrast",
                    "classes": "@contrast.classes"
                }, {
                    "type": "fluid.uiOptions.enactors.tableOfContents",
                    "template": "the-location-of-toc-template",
                    "random": "@random.path"
                }]
            },
            expectedSchema: {
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
                    "type": "fluid.uiOptions.enactors.lineSpacing",
                    "fontSizeMap": {
                        "xx-small": "9px",
                        "x-small": "11px",
                        "small": "13px",
                        "medium": "15px",
                        "large": "18px",
                        "x-large": "23px",
                        "xx-large": "30px"
                    }
                }, {
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
                }]
            }
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

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.expandSchemaValueTest",
            "fluid.tests.schemaExpanderTest"
        ]);
    });

})(jQuery);
