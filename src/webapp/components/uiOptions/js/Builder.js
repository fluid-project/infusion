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
        members: {
            consolidatedGrade: {
                expander: {
                    func: "fluid.uiOptions.builder.defaults",
                    args: ["{that}.options.auxSchema.namespace", {
                        gradeNames: ["fluid.viewComponent", "autoInit", "{that}.consolidationGrades.uiOptions", "{that}.consolidationGrades.enhancer"]
                    }]
                }
            },
            consolidationGrades: {
                enhancer: {
                    expander: {
                        func: "fluid.uiOptions.builder.attach",
                        args: ["{that}.constructedGrades.enactors", "fluid.uiOptions.builder.uie"]
                    }
                },
                uiOptions: {
                    expander: {
                        func: "fluid.uiOptions.builder.attach",
                        args: ["{that}.constructedGrades.panels", "fluid.uiOptions.builder.uio"]
                    }
                }
            },
            constructedGrades: {
                expander: {
                    func: "fluid.uiOptions.builder.generateGrades",
                    args: ["{that}.options.auxSchema", ["enactors", "messages", "panels", "rootModel", "templateLoader", "templatePrefix"]]
                }
            }
        }
    });

    fluid.defaults("fluid.uiOptions.builder.uie", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            enhancer: {
                type: "fluid.uiEnhancer",// <--- need to change the type  or add a gradeName
                container: "body",
                options: {
                    gradeNames: ["{fluid.uiOptions.builder.uie}.options.constructedGrades.enactors", "{fluid.uiOptions.builder.uie}.options.constructedGrades.rootModel"],
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

    fluid.defaults("fluid.uiOptions.builder.uio", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            uiOptions: {
                type: "fluid.uiOptions.fatPanel",
                container: "{fluid.uiOptions.builder.uio}.container",
                options: {
                    gradeNames: ["{fluid.uiOptions.builder.uio}.options.constructedGrades.messages", "{fluid.uiOptions.builder.uio}.options.constructedGrades.templatePrefix"],
                    templateLoader: {
                        options: {
                            gradeNames: ["{fluid.uiOptions.builder.uio}.options.constructedGrades.templateLoader"]
                        }
                    },
                    uiOptions: {
                        options: {
                            gradeNames: ["{fluid.uiOptions.builder.uio}.options.constructedGrades.panels", "{fluid.uiOptions.builder.uio}.options.constructedGrades.rootModel"]
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
        var constructedGrades = {};
        fluid.each(gradeCategories, function (category) {
            var gradeName = fluid.stringTemplate(gradeNameTemplate, {category: category});
            var gradeOpts = auxSchema[category];
            if (gradeOpts) {
                constructedGrades[category] = fluid.uiOptions.builder.defaults(gradeName, gradeOpts);
            }
        });
        return constructedGrades;
    };

    fluid.uiOptions.builder.attach = function (constructedGrade, consolidatedGrade) {
        if (constructedGrade) {
            return consolidatedGrade;
        }
    };

})(jQuery, fluid_1_5);
