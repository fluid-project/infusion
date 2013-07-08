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

    fluid.registerNamespace("fluid.uiOptions");

    /**
     * Look up the value on the given source object by using the path.
     * Takes a template string containing tokens in the form of "@source-path-to-value".
     * Returns a value (any type) or undefined if the path is not found.
     *
     * @param {object}    root       an object to retrieve the returned value from
     * @param {String}    pathRef    a string that the path to the requested value is embedded into
     *
     * Example:
     * 1. Parameters:
     * source:
     * {
     *     path1: {
     *         path2: "here"
     *     }
     * }
     *
     * template: "@path1.path2"
     *
     * 2. Return: "here"
     */
    fluid.uiOptions.expandSchemaValue = function (root, pathRef) {
        if (pathRef.charAt(0) !== "@") return pathRef;

        return fluid.get(root, pathRef.substring(1));
    };

    fluid.uiOptions.expandSchemaComponents = function (auxSchema, type, index, schema) {
        var components = {};
        fluid.each(auxSchema[type], function expand(component) {
            var type = component.type;
            var preferenceMap = fluid.defaults(type).preferenceMap;

            delete component.type;
            components[type] = {
                type: type,
                options: component
            };
            fluid.each(preferenceMap, function (map, pref) {
                fluid.each(map, function (path, optionsPath) {
                    var prefSchema = schema[pref];
                    if (prefSchema) {
                        fluid.set(components[type].options, optionsPath, prefSchema[path]);
                    }
                });
            });

            components[type].options.rules = {
                // TODO
            };
        });
        auxSchema[type] = components;
    };

    /**
     * Expands a all "@" path references from an auxiliary schema.
     * Note that you cannot chain "@" paths.
     *
     *  @param {object} schemaToExpand the shcema which will be expanded
     *  @param {object} altSource an alternative look up object. This is primarily used for the internal recursive call.
     *  @return {object} an expaneded version of the schema.
     */
    var expandSchemaImpl = function (schemaToExpand, altSource) {
        var expandedSchema = fluid.copy(schemaToExpand);
        altSource = altSource || expandedSchema;

        fluid.each(expandedSchema, function (value, key) {
            if (typeof value === "object") {
                expandedSchema[key] = expandSchemaImpl(value, altSource);
            } else if (typeof value === "string") {
                var expandedVal = fluid.uiOptions.expandSchemaValue(altSource, value);
                if (expandedVal !== undefined) {
                    expandedSchema[key] = expandedVal;
                } else {
                    delete expandedSchema[key];
                }
            }
        });
        return expandedSchema;
    };
    fluid.uiOptions.expandSchema = function (schemaToExpand, enactorsIndex, panelsIndex, schema) {
        var auxSchema = expandSchemaImpl(schemaToExpand);
        fluid.uiOptions.expandSchemaComponents(auxSchema, "enactors", enactorsIndex, schema);
        fluid.uiOptions.expandSchemaComponents(auxSchema, "panels", panelsIndex, schema);
        return auxSchema;
    };

    fluid.defaults("fluid.uiOptions.auxBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        auxiliarySchema: {},
        enactorsIndex: {
            expander: {
                func: "fluid.indexDefaults",
                args: ["enactorsIndex", {
                    gradeNames: "fluid.uiOptions.enactors",
                    indexFunc: "fluid.uiOptions.auxBuilder.prefMapIndexer"
                }]
            }
        },
        panelsIndex: {
            expander: {
                func: "fluid.indexDefaults",
                args: ["panelsIndex", {
                    gradeNames: "fluid.uiOptions.panels",
                    indexFunc: "fluid.uiOptions.auxBuilder.prefMapIndexer"
                }]
            }
        },
        expandedAuxSchema: {
            expander: {
                func: "fluid.uiOptions.expandSchema",
                args: [
                    "{that}.options.auxiliarySchema",
                    "{that}.options.enactorsIndex",
                    "{that}.options.panelsIndex",
                    "{that}.options.schema.properties"
                ]
            }
        }
    });

    fluid.uiOptions.auxBuilder.prefMapIndexer = function (defaults) {
        return fluid.keys(defaults.preferenceMap);
    };

})(jQuery, fluid_1_5);
