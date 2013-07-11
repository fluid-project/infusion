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
                        args: ["{that}.options.auxSchema.namespace", "%namespace.enactors", "{that}.options.auxSchema.enactors"]
                    }
                },
                panels: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.panels", "{that}.options.auxSchema.panels"]
                    }
                },
                rootModel: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.rootModel", "{that}.options.auxSchema.rootModel"]
                    }
                },
                templateLoader: {
                    expander: {
                        func: "fluid.uiOptions.builder.generateGrade",
                        args: ["{that}.options.auxSchema.namespace", "%namespace.templateLoader", "{that}.options.auxSchema.templateLoader"]
                    }
                }
            }
        }
    });

    fluid.uiOptions.builder.generateGrade = function (namespace, gradeNameTemplate, gradeOptions) {
        if (gradeOptions) {
            var gradeName = fluid.stringTemplate(gradeNameTemplate, {namespace: namespace});
            var opts = fluid.copy(gradeOptions);

            fluid.defaults(gradeName, opts); // creates the grade with name specified by gradeName
            return gradeName;
        }
    };

})(jQuery, fluid_1_5);
