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

    fluid.defaults("fluid.uiOptions.builder", {
        gradeNames: ["fluid.eventedComponent", "fluid.uiOptions.primaryBuilder", "fluid.uiOptions.auxBuilder", "autoInit"],
        mergePolicy: {
            auxSchema: "expandedAuxSchema"
        },
        members: {
            constructedGrades: {
                enactors: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.enactors", ["fluid.uiEnhancer"], "{that}.options.auxSchema.enactors", "components"]
                    }
                },
                panels: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.panels", ["fluid.uiOptions"], "{that}.options.auxSchema.panels"]
                    }
                },
                rootModel: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.rootModel", ["fluid.uiOptions.rootModel"], "{that}.options.auxSchema.rootModel", "members.rootModel"]
                    }
                },
                templateLoader: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.templateLoader", ["fluid.uiOptions.templateLoader"], "{that}.options.auxSchema.templateLoader"]
                    }
                }
            }
        }
    });

    fluid.uiOptions.builder.generateGrade = function (namespace, gradeNameTemplate, baseGrades, gradeOptions, path) {
        // fluid.registerNamespace(namespace);
        if (gradeOptions) {
            var gradeName = fluid.stringTemplate(gradeNameTemplate, {namespace: namespace});
            var opts = {};

            if (path) {
                fluid.set(opts, path, gradeOptions);
            } else {
                opts = gradeOptions;
            }

            opts.gradeNames = fluid.makeArray(baseGrades);
            if ($.inArray("autoInit", opts.gradeNames) < 0) {
                opts.gradeNames.push("autoInit");
            }

            fluid.defaults(gradeName, opts); // creates the grade with name specified by gradeName
            return gradeName;
        }
    };

})(jQuery, fluid_1_5);
