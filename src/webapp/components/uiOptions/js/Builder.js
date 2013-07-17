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
        gradeNames: ["fluid.eventedComponent", "fluid.uiOptions.primaryBuilder", "fluid.uiOptions.auxBuilder", "fluid.uiOptions.auxSchema.starter", "autoInit"],
        mergePolicy: {
            auxSchema: "expandedAuxSchema"
        },

        consolidatedGrade: {
            expander: {
                func: "fluid.uiOptions.builder.defaults",
                args: ["{that}.options.auxSchema.namespace", {
                    gradeNames: ["fluid.viewComponent", "autoInit", "fluid.uiOptions.assembler.consolidated"],
                    componentGrades: "{that}.options.constructedGrades"
                }]
            }
        },

        enhancerGrade: {
            expander: {
                func: "fluid.uiOptions.builder.defaults",
                args: ["{that}.options.auxSchema.namespace", { // how do i get the namespace??
                    gradeNames: ["fluid.viewComponent", "autoInit", "fluid.uiOptions.assembler.uie"],
                    componentGrades: "{that}.options.constructedGrades"
                }]
            }
        },

        constructedGrades: {
            expander: {
                func: "fluid.uiOptions.builder.generateGrades",
                args: ["{that}.options.auxSchema", ["enactors", "messages", "panels", "rootModel", "templateLoader", "templatePrefix"]]
            }
        }
    });

    fluid.defaults("fluid.uiOptions.assembler.uie", {
        gradeNames: ["autoInit", "fluid.viewComponent", "fluid.originalEnhancerOptions"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            enhancer: {
                type: "fluid.uiEnhancer",// <--- need to change the type  or add a gradeName
                container: "body",
                options: {
                    gradeNames: ["{fluid.uiOptions.builder.uie}.options.componentGrades.enactors", "{fluid.uiOptions.builder.uie}.options.componentGrades.rootModel"],
                    listeners: {
                        onCreate: {
                            listener: "fluid.set",
                            args: [fluid.staticEnvironment, "uiEnhancer", "{that}"]
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.uiOptions.assembler.consolidated", {
        gradeNames: ["autoInit", "fluid.viewComponent", "fluid.uiOptions.assembler.uie"],
        components: {
            uiOptions: {
                type: "fluid.uiOptions.fatPanel",
                container: "{fluid.uiOptions.builder.uio}.container",
                priority: "last",
                options: {
                    gradeNames: ["{fluid.uiOptions.builder.uio}.options.componentGrades.templatePrefix", "{fluid.uiOptions.builder.uio}.options.componentGrades.messages"],
                    templateLoader: {
                        options: {
                            gradeNames: ["{fluid.uiOptions.builder.uio}.options.componentGrades.templateLoader"]
                        }
                    },
                    uiOptions: {
                        options: {
                            gradeNames: ["{fluid.uiOptions.builder.uio}.options.componentGrades.panels", "{fluid.uiOptions.builder.uio}.options.componentGrades.rootModel"]
                        }
                    }
                }
            }
        }
    });

    fluid.uiOptions.builder.defaults = function (name, options) {
        fluid.defaults(name, options);
        return name;
    };

    fluid.uiOptions.builder.generateGrades = function (auxSchema, gradeCategories) {
        var gradeNameTemplate = auxSchema.namespace + ".%category";
        var componentGrades = {};
        fluid.each(gradeCategories, function (category) {
            var gradeName = fluid.stringTemplate(gradeNameTemplate, {category: category});
            var gradeOpts = auxSchema[category];
            if (gradeOpts) {
                constructedGrades[category] = fluid.uiOptions.builder.defaults(gradeName, gradeOpts);
            }
        });
        return constructedGrades;
    };

})(jQuery, fluid_1_5);
