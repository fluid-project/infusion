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

    fluid.tests.testExpandSchemaValue = function (that, container, expectedDefaultFlag, expectedCssClass) {
        var elements = that.getElements();
        
        jqUnit.assertEquals("Default value: " + expectedDefaultFlag, expectedDefaultFlag, that.model.value);
        jqUnit.assertEquals("Default css class: " + expectedCssClass, expectedCssClass, that.options.cssClass);
        jqUnit.assertEquals("Default - css class is not applied", undefined, elements.attr("class"));
        
        that.applier.requestChange("value", true);
        jqUnit.assertEquals("True value - Css class has been applied", expectedCssClass, elements.attr("class"));

        that.applier.requestChange("value", false);
        jqUnit.assertEquals("False value - Css class has been removed", "", elements.attr("class"));
    }; 

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

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.expandSchemaValueTest"
        ]);
    });

})(jQuery);
