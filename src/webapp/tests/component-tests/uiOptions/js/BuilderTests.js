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
            "template": "the-location-of-toc-template"
        }]
    };

    fluid.defaults("fluid.tests.builder", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            emptyBuilder: {
                type: "fluid.uiOptions.builder"
            },
            sampleBuilder: {
                type: "fluid.uiOptions.builder",
                options: {
                    auxiliarySchema: fluid.tests.schema
                }
            },
            builderTester: {
                type: "fluid.tests.builderTester"
            }
        }
    });

    fluid.defaults("fluid.tests.builderTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Builder",
            tests: [{
                expect: 2,
                name: "Empty builder.",
                sequence: [{
                    func: "fluid.tests.testEmptyBuilder",
                    args: "{emptyBuilder}.assembler"
                }]
            }]
        }, {
            name: "Sample Builder",
            tests: [{
                expect: 2,
                name: "Sample builder.",
                sequence: [{
                    func: "fluid.tests.testSampleBuilder",
                    args: "{sampleBuilder}.assembler"
                }]
            }]
        }]
    });

    fluid.tests.testEmptyBuilder = function (assembler) {
        jqUnit.assertDeepEq("Resolved aux schema should be empty", {},
            assembler.options.auxSchema);
        jqUnit.assertDeepEq("Resolved primary schema should be empty", {},
            assembler.options.schema.properties);
    };

    fluid.tests.testSampleBuilder = function (assembler) {
        jqUnit.assertDeepEq("Resolved aux schema should be expanded correctly",
            fluid.tests.expectedSchema, assembler.options.auxSchema);
        jqUnit.assertDeepEq("Resolved primary schema should be assembled correctly",
            $.extend(true, {}, fluid.defaults("fluid.uiOptions.schemas.textFont").schema,
                fluid.defaults("fluid.uiOptions.schemas.contrast").schema),
            assembler.options.schema);
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.builder"
        ]);
    });

})(jQuery);
