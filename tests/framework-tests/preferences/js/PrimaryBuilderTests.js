/*
Copyright 2007-2019 The Infusion Copyright holders
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

    fluid.defaults("fluid.tests.sampleSchemaGrade", {
        gradeNames: ["fluid.prefs.schemas"],
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

    fluid.defaults("fluid.tests.customTextSize", {
        gradeNames: ["fluid.component"],
        schema: {
            "type": "object",
            "properties": {
                "fluid.prefs.textSize": {
                    "type": "number",
                    "default": 1,
                    "minimum": 1,
                    "maximum": 2,
                    "divisibleBy": 0.2
                }
            }
        }
    });

    fluid.defaults("fluid.tests.contributedSchema", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            schema: {
                type: "fluid.component",
                options: {
                    gradeNames: ["fluid.prefs.schemas.textSize", "fluid.prefs.schemas.lineSpace"]
                }
            },
            properSchema: {
                type: "fluid.component",
                options: {
                    gradeNames: ["fluid.tests.sampleSchemaGrade"]
                }
            },
            primaryBuilder: {
                type: "fluid.prefs.primaryBuilder",
                options: {
                    typeFilter: ["fluid.prefs.textSize", "fluid.prefs.lineSpace"]
                }
            },
            primaryBuilderSchema: {
                type: "fluid.component",
                options: {
                    gradeNames: ["{primaryBuilder}.buildPrimary"]
                }
            },
            primaryBuilderWithSuppliedPrimarySchema: {
                type: "fluid.prefs.primaryBuilder",
                options: {
                    typeFilter: ["fluid.prefs.textSize", "fluid.prefs.lineSpace", "fluid.tests.somePreference"],
                    primarySchema: {
                        "fluid.tests.somePreference": {
                            "type": "number",
                            "default": 1,
                            "minimum": 1,
                            "maximum": 10,
                            "divisibleBy": 1
                        },
                        "fluid.prefs.textSize": fluid.defaults(
                            "fluid.tests.customTextSize").schema.properties["fluid.prefs.textSize"]
                    }
                }
            },
            primaryBuilderWithSuppliedPrimarySchemaSchema: {
                type: "fluid.component",
                options: {
                    gradeNames: ["{primaryBuilderWithSuppliedPrimarySchema}.buildPrimary"]
                }
            },
            schemaTester: {
                type: "fluid.tests.schemaTester"
            }
        }
    });

    fluid.defaults("fluid.tests.schemaTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
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
        }, {
            name: "Primary Builder",
            tests: [{
                expect: 4,
                name: "Primary schema is assembled correctly.",
                sequence: [{
                    func: "fluid.tests.primaryBuilder",
                    args: ["{primaryBuilderSchema}.options.schema"]
                }]
            }]
        }, {
            name: "Primary Builder with supplied primary schema",
            tests: [{
                expect: 4,
                name: "Primary schema is assembled correctly.",
                sequence: [{
                    func: "fluid.tests.primaryBuilderWithSuppliedPrimarySchema",
                    args: ["{primaryBuilderWithSuppliedPrimarySchemaSchema}.options.schema"]
                }]
            }]
        }]
    });

    fluid.tests.primaryBuilderWithSuppliedPrimarySchema = function (schema) {
        verifyBuilder(schema, [
            "fluid.tests.customTextSize",
            "fluid.prefs.schemas.lineSpace",
            "fluid.tests.sampleSchemaGrade"
        ], [
            "fluid.prefs.contrast"
        ]);
        jqUnit.assertEquals("Supplied primary schema should override the default schema grades",
            0.2, schema.properties["fluid.prefs.textSize"].divisibleBy);
    };

    fluid.tests.primaryBuilder = function (schema) {
        verifyBuilder(schema, [
            "fluid.prefs.schemas.textSize",
            "fluid.prefs.schemas.lineSpace"
        ], [
            "fluid.prefs.contrast",
            "fluid.tests.somePreference"
        ]);
    };

    var verifyBuilder = function (schema, includedSchemas, excludedGrades) {
        var included = {};
        fluid.each(includedSchemas, function (schemaName) {
            $.extend(true, included, fluid.defaults(schemaName).schema);
        });
        var contributedSchema = $.extend(true, {}, included);
        verifySchema(contributedSchema, schema);
        fluid.each(excludedGrades, function (gradeName) {
            jqUnit.assertUndefined(
                "Schema outside of auxiliary schema should not be included",
                schema.properties[gradeName]);
        });
    };

    var verifySchema = function (contributedSchema, finalSchema) {
        jqUnit.assertValue("Final Schema is defined",
            finalSchema);
        jqUnit.assertDeepEq("Schemas are merged correctly",
            contributedSchema, finalSchema);
    };

    fluid.tests.testContributedSchema = function (schema) {
        var contributedSchema = $.extend(true, {},
            fluid.defaults("fluid.prefs.schemas.textSize").schema,
            fluid.defaults("fluid.prefs.schemas.lineSpace").schema);
        var finalSchema = schema.options.schema;
        verifySchema(contributedSchema, finalSchema);
        contributedSchema =
            fluid.defaults("fluid.prefs.schemas.textSize").schema.properties["fluid.prefs.textSize"];
        finalSchema = schema.options.schema.properties["fluid.prefs.textSize"];
        verifySchema(contributedSchema, finalSchema);
        contributedSchema =
            fluid.defaults("fluid.prefs.schemas.lineSpace").schema.properties["fluid.prefs.lineSpace"];
        finalSchema = schema.options.schema.properties["fluid.prefs.lineSpace"];
        verifySchema(contributedSchema, finalSchema);
    };

    fluid.tests.testContributedProperSchema = function (schema) {
        jqUnit.assertDeepEq("Schema is merged correctly",
            fluid.defaults("fluid.tests.sampleSchemaGrade").schema,
            schema.options.schema);
        var contributedSchema =
            fluid.defaults("fluid.tests.sampleSchemaGrade").schema.properties["fluid.tests.somePreference"];
        var finalSchema = schema.options.schema.properties["fluid.tests.somePreference"];
        verifySchema(contributedSchema, finalSchema);
    };

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.contributedSchema"
        ]);
    });

})(jQuery);
