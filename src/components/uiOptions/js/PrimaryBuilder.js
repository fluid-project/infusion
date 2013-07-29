/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    "use strict";

    fluid.registerNamespace("fluid.uiOptions.schemas");

    fluid.uiOptions.schemas.merge = function (target, source) {
        if (!target) {
            target = {
                type: "object",
                properties: {}
            };
        }
        source = source.properties || source;
        $.extend(true, target.properties, source);
        return target;
    };

    fluid.defaults("fluid.uiOptions.primaryBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit", "{that}.buildPrimary"],
        schemaIndex: {
            expander: {
                func: "fluid.indexDefaults",
                args: ["schemaIndex", {
                    gradeNames: "fluid.uiOptions.schemas",
                    indexFunc: "fluid.uiOptions.primaryBuilder.defaultSchemaIndexer"
                }]
            }
        },
        primarySchema: {},
        auxiliarySchema: {},
        auxTypes: {
            expander: {
                func: "fluid.uiOptions.primaryBuilder.parseAuxSchema",
                args: "{that}.options.auxiliarySchema"
            }
        },
        invokers: {
            buildPrimary: {
                funcName: "fluid.uiOptions.primaryBuilder.buildPrimary",
                args: [
                    "{that}.options.schemaIndex",
                    "{that}.options.auxTypes",
                    "{that}.options.primarySchema"
                ]
            }
        },
    });

    fluid.uiOptions.primaryBuilder.buildPrimary = function (schemaIndex, auxTypes, primarySchema) {
        fluid.defaults("fluid.uiOptions.schemas.suppliedPrimary", {
            gradeNames: ["autoInit", "fluid.uiOptions.schemas"],
            schema: fluid.filterKeys(primarySchema.properties || primarySchema,
                auxTypes, false)
        });
        var primary = ["fluid.uiOptions.schemas.suppliedPrimary"];
        fluid.each(auxTypes, function merge(auxType) {
            var schemaGrades = schemaIndex[auxType];
            if (schemaGrades) {
                primary.push.apply(primary, schemaGrades);
            }
        });
        return primary;
    };

    fluid.uiOptions.primaryBuilder.parseAuxSchema = function (auxSchema) {
        var auxTypes = [];
        fluid.each(auxSchema, function parse(field) {
            var type = field.type;
            if (type) {
                auxTypes.push(type);
            }
        });
        return auxTypes;
    };

    fluid.uiOptions.primaryBuilder.defaultSchemaIndexer = function (defaults) {
        if (defaults.schema) {
            return fluid.keys(defaults.schema.properties);
        }
    };

    fluid.defaults("fluid.uiOptions.schemas", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        mergePolicy: {
            schema: fluid.uiOptions.schemas.merge
        }
    });

})(jQuery, fluid_1_5);
