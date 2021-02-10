/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.prefs.schemas");

    /**
     * A schema definition for which values a preference(s) may be in. The schema definitions should all be scoped to
     * a property keyed off of the preference name. These may either be top level properties in the Primary Schema or
     * all contained within a property called `properties`. However, a single Primary Schema may not contain a mix of
     * preferences defined at the top level and under the `properties` path.
     * The format is based on JSON Schema. see: https://github.com/GPII/gpii-json-schema/blob/master/docs/gss.md
     *
     * @typedef {Object} PrimarySchema
     * @property {Object} [properties] - Preference definitions may be grouped under this path, or all specified at the
     *                                   top level. Preferences are always keyed off of the preference name.
     */

    /**
     * A custom merge policy that merges primary schema blocks and
     * places them in the right location (consistent with the JSON schema
     * format).
     * @param {Object} target - A base for merging the options.
     * @param {Object} source - Options being merged.
     * @return {Object} - The updated target.
     */
    fluid.prefs.schemas.merge = function (target, source) {
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

    fluid.defaults("fluid.prefs.primaryBuilder", {
        gradeNames: ["fluid.component", "{that}.buildPrimary"],
        // An index of all schema grades registered with the framework.
        schemaIndex: {
            expander: {
                func: "fluid.indexDefaults",
                args: ["schemaIndex", {
                    gradeNames: "fluid.prefs.schemas",
                    indexFunc: "fluid.prefs.primaryBuilder.defaultSchemaIndexer"
                }]
            }
        },
        primarySchema: {},
        // A list of all requested preferences, to be supplied by an integrator or concrete grade.
        // Typically provided through the `fluid.prefs.builder` grade.
        // requestedPrefs: [],
        invokers: {
            // An invoker used to generate a set of grades that comprise a
            // final version of the primary schema to be used by the PrefsEditor
            // builder.
            buildPrimary: {
                funcName: "fluid.prefs.primaryBuilder.buildPrimary",
                args: [
                    "{that}.options.schemaIndex",
                    "{that}.options.requestedPrefs",
                    "{that}.options.primarySchema"
                ]
            }
        }
    });

    /**
     * An invoker method that builds a list of grades that comprise a final version of the primary schema.
     *
     * @param {Object} schemaIndex - A global index of all schema grades registered with the framework.
     * @param {String[]} preferences - A list of all necessary top level preference names.
     * @param {PrimarySchema} primarySchema - Primary schema provided directly; not sourced from the `schemaIndex`.
     * This allows a means of supplying a Primary Schema without first having
     * to define a `fluid.prefs.schemas` grade to wrap it.
     * @return {String[]} - A list of schema grades.
     */
    fluid.prefs.primaryBuilder.buildPrimary = function (schemaIndex, preferences, primarySchema) {
        var suppliedPrimaryGradeName = "fluid.prefs.schemas.suppliedPrimary" + fluid.allocateGuid();
        // Create a grade that has a primary schema passed as an option inclosed.
        fluid.defaults(suppliedPrimaryGradeName, {
            gradeNames: ["fluid.prefs.schemas"],
            schema: fluid.filterKeys(primarySchema.properties || primarySchema,
                preferences)
        });
        var primary = [];
        // Lookup all available schema grades from the index that match the requested preference names.
        fluid.each(preferences, function merge(pref) {
            var schemaGrades = schemaIndex[pref];
            if (schemaGrades) {
                primary = primary.concat(schemaGrades);
            }
        });
        primary.push(suppliedPrimaryGradeName);
        return primary;
    };

    /**
     * An index function that indexes all primary schema grades based on their preference name.
     *
     * @param {Object} defaults - Registered default options for a primary schema grade.
     * @return {String[]} - The preference name.
     */
    fluid.prefs.primaryBuilder.defaultSchemaIndexer = function (defaults) {
        if (defaults.schema) {
            return fluid.keys(defaults.schema.properties);
        }
    };

    /*******************************************************************************
     * Base primary schema grade
     *******************************************************************************/
    fluid.defaults("fluid.prefs.schemas", {
        gradeNames: ["fluid.component"],
        mergePolicy: {
            schema: fluid.prefs.schemas.merge
        }
    });

})(jQuery, fluid_3_0_0);
