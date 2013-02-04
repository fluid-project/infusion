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

    fluid.defaults("fluid.uiOptions.builder", {
        gradeNames: ["fluid.littleComponent", "autoInit"]
    });

    fluid.defaults("fluid.uiOptions.accessor", {
        gradeNames: ["fluid.dataSource", "fluid.modelComponent", "autoInit"],
        mergePolicy: {
            schema: "nomerge"
        },
        invokers: {
            get: {
                funcName: "fluid.get",
                args: ["{that}.model", "{arguments}.0", "{that}.options.config"]
            },
            set: {
                funcName: "fluid.set",
                args: ["{that}.model", "{arguments}.0", "{arguments}.1"]
            }
        },
        config: {
            strategies: [
                fluid.model.funcResolverStrategy,
                fluid.model.defaultFetchStrategy
            ]
        },
        strategy: undefined,
        schema: "{schema}"
    });

    fluid.uiOptions.accessor.finalInit = function (that) {
        that.options.config.strategies.push(that.strategy);
    };

    fluid.defaults("fluid.uiOptions.accessor.defaults", {
        gradeNames: ["fluid.uiOptions.accessor", "autoInit"],
        invokers: {
            strategy: {
                funcName: "fluid.uiOptions.strategies.defaults",
                args: ["{that}.options.schema", "{arguments}.0", "{arguments}.1",
                    "{arguments}.2", "{arguments}.3"]
            }
        }
    });

    fluid.registerNamespace("fluid.uiOptions.strategies");

    var lookupSchema = function (schema, index, segments) {
        var i, seg, thisSchema = schema;
        for (i = 0; i < index; ++i) {
            seg = segments[i];
            if (thisSchema.type === "object") {
                thisSchema = thisSchema.properties;
            }
            if (thisSchema.type === "array") {
                thisSchema = thisSchema.items;
            }
            thisSchema = thisSchema[seg];
            if (!thisSchema) {
                return;
            }
        }
        return thisSchema;
    };

    fluid.uiOptions.strategies.defaults = function (schema, root, segment, index, segments) {
        var thisSchema = lookupSchema(schema, index, segments);
        if (!thisSchema) {
            return;
        }
        var defaultValue = thisSchema["default"];
        if (defaultValue) {
            return defaultValue;
        }
        var type = thisSchema.type;
        if (type === "object") {
            return {};
        }
        if (type === "array") {
            return [];
        }
    };

})(jQuery, fluid_1_5);