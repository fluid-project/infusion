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
     * @param {object}    source      an object to retrieve the returned value from
     * @param {String}    template    a string that the path to the requested value is embedded into
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
    fluid.uiOptions.expandSchemaValue = function (source, template) {
        if (template.charAt(0) !== "@") return template;

        var fullPath = template.substring(1);
        var paths = fullPath.split(".");

        var expandedValue = source;
        for( var i = 0; i < paths.length; i++ ) {
            expandedValue = expandedValue[ paths[i] ];

            if (typeof expandedValue === "undefined") {
                break;
            }
        }

        return expandedValue;
    };

    fluid.uiOptions.expandSchema = function (source, schemaToExpand) {
        var expandedSchema = {};

        fluid.each(schemaToExpand, function(value, key) {
            if (typeof value === "object") {
                expandedSchema[key] = fluid.uiOptions.expandSchema(source, value);
            } else if (typeof value === "string") {
                expandedSchema[key] = fluid.uiOptions.expandSchemaValue(source, value);
            } else {
                expandedSchema[key] = value;
            }
        });

        return expandedSchema;
    };

    fluid.uiOptions.auxiliaryExpander = function (schema) {
        var sourceSchema = schemaToExpand = schema;
        return fluid.uiOptions.expandSchema(sourceSchema, schemaToExpand);
    };

    fluid.defaults("fluid.uiOptions.auxBuilder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        auxiliarySchema: {},
        expandedAuxSchema: {
            expander: {
                func: "fluid.uiOptions.auxiliaryParser",
                args: "{that}.options.auxiliarySchema"
            }
        }
    });

    //TODO: remove, this is just for testsing
    var expandedAuxiliarySchema = fluid.uiOptions.auxiliaryExpander(auxiliarySchema);
    console.log(expandedAuxiliarySchema);

})(jQuery, fluid_1_5);
