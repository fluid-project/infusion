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

    fluid.registerNamespace("fluid.uiOptions.schema");

    fluid.uiOptions.schema.merge = function merge(target, source) {
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

    fluid.defaults("fluid.uiOptions.schemaBuilder", {
        gradeNames: ["fluid.littleComponent"],
        initFunction: "fluid.uiOptions.initSchemaBuilder",
        argumentMap: {
            schema: 0,
            options: 1
        }
    });

    fluid.uiOptions.initSchemaBuilder = function init() {};

    fluid.defaults("fluid.uiOptions.schema", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        mergePolicy: {
            schema: fluid.uiOptions.schema.merge
        }
    });

    fluid.defaults("fluid.uiOptions.schema.textSizer", {
        gradeNames: ["autoInit", "fluid.uiOptions.schema"],
        schema: {
            "fluid.uiOptions.textSizer": {
                "type": "number",
                "default": 1,
                "minimum": 1,
                "maximum": 2,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schema.lineSpacer", {
        gradeNames: ["autoInit", "fluid.uiOptions.schema"],
        schema: {
            "fluid.uiOptions.lineSpacer": {
                "type": "number",
                "default": 1,
                "minimum": 1,
                "maximum": 2,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schema.textFont", {
        gradeNames: ["autoInit", "fluid.uiOptions.schema"],
        schema: {
            "fluid.uiOptions.textFont": {
                "type": "string",
                "default": "",
                "enum": ["", "Times New Roman", "Comic Sans", "Arial", "Verdana"]
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schema.contrast", {
        gradeNames: ["autoInit", "fluid.uiOptions.schema"],
        schema: {
            "fluid.uiOptions.contrast": {
                "type": "string",
                "default": "default",
                "enum": ["default", "bw", "wb", "by", "yb"]
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schema.layoutControls", {
        gradeNames: ["autoInit", "fluid.uiOptions.schema"],
        schema: {
            "fluid.uiOptions.layoutControls": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schema.linksControls", {
        gradeNames: ["autoInit", "fluid.uiOptions.schema"],
        schema: {
            "fluid.uiOptions.linksControls": {
                "links": false,
                "inputsLarger": false
            }
        }
    });

})(jQuery, fluid_1_5);
