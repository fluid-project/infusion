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

    fluid.defaults("fluid.tests.properSchemaGrade", {
        gradeNames: ["autoInit", "fluid.uiOptions.schemas"],
        schema: {
            "type": "object",
            "properties": {
                "fluid.tests.somePreference": {
                    "type": "number",
                    "default": 1,
                    "minimum": 1,
                    "maximum": 10,
                    "divisibleBy": 1
                }
            }
        }
    });

    fluid.defaults("fluid.tests.contributedSchema", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            schema: {
                type: "fluid.littleComponent",
                options: {
                    gradeNames: ["fluid.uiOptions.schemas.textSize", "fluid.uiOptions.schemas.lineSpacing"]
                }
            },
            properSchema: {
                type: "fluid.littleComponent",
                options: {
                    gradeNames: ["fluid.tests.properSchemaGrade"]
                }
            },
            schemaTester: {
                type: "fluid.tests.schemaTester"
            }
        }
    });

    fluid.defaults("fluid.tests.schemaTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Contributed Schema",
            tests: [{
                expect: 6,
                name: "Custom schema grades added to the default empty grade.",
                sequence: [{
                    func: "fluid.tests.testContributedSchema",
                    args: ["{schema}"]
                }]
            }]
        }, {
            name: "Proper Schema",
            tests: [{
                expect: 3,
                name: "Custom proper schema grade added to the default empty grade.",
                sequence: [{
                    func: "fluid.tests.testContributedProperSchema",
                    args: ["{properSchema}"]
                }]
            }]
        }]
    });

    var verifySchema = function verifySchema(contributedSchema, finalSchema) {
        jqUnit.assertValue("Final Schema is defined",
            finalSchema);
        jqUnit.assertDeepEq("Schemas are merged correctectly",
            contributedSchema, finalSchema);
    };

    fluid.tests.testContributedSchema = function testContributedSchema(schema) {
        var contributedSchema = $.extend(true, {},
            fluid.defaults("fluid.uiOptions.schemas.textSize").schema,
            fluid.defaults("fluid.uiOptions.schemas.lineSpacing").schema);
        var finalSchema = schema.options.schema;
        verifySchema(contributedSchema, finalSchema);
        contributedSchema =
            fluid.defaults("fluid.uiOptions.schemas.textSize").schema.properties["fluid.uiOptions.textSize"];
        finalSchema = schema.options.schema.properties["fluid.uiOptions.textSize"];
        verifySchema(contributedSchema, finalSchema);
        contributedSchema =
            fluid.defaults("fluid.uiOptions.schemas.lineSpacing").schema.properties["fluid.uiOptions.lineSpacing"];
        finalSchema = schema.options.schema.properties["fluid.uiOptions.lineSpacing"];
        verifySchema(contributedSchema, finalSchema);
    };

    fluid.tests.testContributedProperSchema = function testContributedProperSchema(schema) {
        jqUnit.assertDeepEq("Schema is merged correctly",
            fluid.defaults("fluid.tests.properSchemaGrade").schema,
            schema.options.schema);
        var contributedSchema =
            fluid.defaults("fluid.tests.properSchemaGrade").schema.properties["fluid.tests.somePreference"];
        var finalSchema = schema.options.schema.properties["fluid.tests.somePreference"];
        verifySchema(contributedSchema, finalSchema);
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.contributedSchema"
        ]);
    });

})(jQuery);
