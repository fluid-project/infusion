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

    /**
     * A custom merge policy that merges primary schema blocks and
     * places them in the right location (consistent with the JSON schema
     * format).
     * @param  {JSON} target A base for merging the options.
     * @param  {JSON} source Options being merged.
     * @return {JSON}        Updated target.
     */
    fluid.uiOptions.schemas.merge = function (target, source) {
        if (!target) {
            target = {
                type: "object",
                properties: {}
            };
        }
        // We can handle both schema blocks in options directly and also inside
        // the |properties| field.
        source = source.properties || source;
        $.extend(true, target.properties, source);
        return target;
    };

    /*******************************************************************************
     * Primary builder grade
     *******************************************************************************/

    fluid.defaults("fluid.uiOptions.primaryBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit", "{that}.buildPrimary"],
        // An index of all schema grades registered with the framework.
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
        // A list of all necessarry top level preference names.
        typeFilter: [],
        invokers: {
            // An invoker used to generate a set of grades that comprise a
            // final version of the primary schema to be used by the UIOptions
            // builder.
            buildPrimary: {
                funcName: "fluid.uiOptions.primaryBuilder.buildPrimary",
                args: [
                    "{that}.options.schemaIndex",
                    "{that}.options.typeFilter",
                    "{that}.options.primarySchema"
                ]
            }
        }
    });

    /**
     * An invoker method that builds a list of grades that comprise a final
     * version of the primary schema.
     * @param  {JSON}  schemaIndex   A global index of all schema grades
     *                               registered with the framework.
     * @param  {Array} typeFilter    A list of all necessarry top level
     *                               preference names.
     * @param  {JSON}  primarySchema Primary schema provided as an option to
     *                               the primary builder.
     * @return {Array}               A list of schema grades.
     */
    fluid.uiOptions.primaryBuilder.buildPrimary = function (schemaIndex, typeFilter, primarySchema) {
        var suppliedPrimaryGradeName = "fluid.uiOptions.schemas.suppliedPrimary" + fluid.allocateGuid();
        // Create a grade that has a primary schema passed as an option inclosed.
        fluid.defaults(suppliedPrimaryGradeName, {
            gradeNames: ["autoInit", "fluid.uiOptions.schemas"],
            schema: fluid.filterKeys(primarySchema.properties || primarySchema,
                typeFilter, false)
        });
        var primary = [suppliedPrimaryGradeName];
        // Lookup all available schema grades from the index that match the
        // top level preference name.
        fluid.each(typeFilter, function merge(type) {
            var schemaGrades = schemaIndex[type];
            if (schemaGrades) {
                primary.push.apply(primary, schemaGrades);
            }
        });
        return primary;
    };

    /**
     * An index function that indexes all shcema grades based on their
     * preference name.
     * @param  {JSON}   defaults Registered defaults for a schema grade.
     * @return {String}          A preference name.
     */
    fluid.uiOptions.primaryBuilder.defaultSchemaIndexer = function (defaults) {
        if (defaults.schema) {
            return fluid.keys(defaults.schema.properties);
        }
    };

    /*******************************************************************************
     * Base primary schema grade
     *******************************************************************************/
    fluid.defaults("fluid.uiOptions.schemas", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        mergePolicy: {
            schema: fluid.uiOptions.schemas.merge
        }
    });

})(jQuery, fluid_1_5);
