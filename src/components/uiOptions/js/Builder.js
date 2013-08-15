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
        gradeNames: ["fluid.eventedComponent", "fluid.uiOptions.auxBuilder", "autoInit"],
        mergePolicy: {
            auxSchema: "expandedAuxSchema"
        },
        assembledUIOGrade: {
            expander: {
                func: "fluid.uiOptions.builder.generateGrade",
                args: ["uio", "{that}.options.auxSchema.namespace", {
                    gradeNames: ["fluid.viewComponent", "autoInit", "fluid.uiOptions.assembler.uio"],
                    componentGrades: "{that}.options.constructedGrades"
                }]
            }
        },
        assembledUIEGrade: {
            expander: {
                func: "fluid.uiOptions.builder.generateGrade",
                args: ["uie", "{that}.options.auxSchema.namespace", {
                    gradeNames: ["fluid.viewComponent", "autoInit", "fluid.uiOptions.assembler.uie"],
                    componentGrades: "{that}.options.constructedGrades"
                }]
            }
        },
        constructedGrades: {
            expander: {
                func: "fluid.uiOptions.builder.constructGrades",
                args: ["{that}.options.auxSchema", ["enactors", "messages", "panels", "rootModel", "templateLoader", "messageLoader", "templatePrefix", "messagePrefix"]]
            }
        },
        mappedDefaults: "{primaryBuilder}.options.schema.properties",
        components: {
            primaryBuilder: {
                type: "fluid.uiOptions.primaryBuilder",
                options: {
                    typeFilter: {
                        expander: {
                            func: "fluid.uiOptions.builder.parseAuxSchema",
                            args: "{builder}.options.auxiliarySchema"
                        }
                    },
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.primarySchema",
            removeSource: true,
            target: "{that > primaryBuilder}.options.primarySchema"
        }]
    });

    fluid.defaults("fluid.uiOptions.assembler.uie", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.globalSettingsStore"
            },
            enhancer: {
                type: "fluid.littleComponent",
                options: {
                    gradeNames: "{that}.options.enhancerType",
                    enhancerType: "fluid.pageEnhancer",
                    components: {
                        uiEnhancer: {
                            options: {
                                gradeNames: ["{fluid.uiOptions.assembler.uie}.options.componentGrades.enactors"]
                            }
                        }
                    }
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.enhancer",
            removeSource: true,
            target: "{that uiEnhancer}.options"
        }]
    });

    fluid.defaults("fluid.uiOptions.assembler.uio", {
        gradeNames: ["autoInit", "fluid.viewComponent", "fluid.uiOptions.assembler.uie"],
        components: {
            uiOptionsInline: {
                type: "fluid.viewComponent",
                container: "{fluid.uiOptions.assembler.uio}.container",
                priority: "last",
                options: {
                    gradeNames: ["{fluid.uiOptions.assembler.uio}.options.componentGrades.templatePrefix", "{fluid.uiOptions.assembler.uio}.options.componentGrades.messagePrefix", "{fluid.uiOptions.assembler.uio}.options.componentGrades.messages", "{that}.options.uioType"],
                    uioType: "fluid.uiOptions.fatPanel",
                    templateLoader: {
                        gradeNames: ["{fluid.uiOptions.assembler.uio}.options.componentGrades.templateLoader"]
                    },
                    messageLoader: {
                        gradeNames: ["{fluid.uiOptions.assembler.uio}.options.componentGrades.messageLoader"]
                    },
                    uiOptions: {
                        gradeNames: ["{fluid.uiOptions.assembler.uio}.options.componentGrades.panels", "{fluid.uiOptions.assembler.uio}.options.componentGrades.rootModel", "fluid.uiOptions.uiEnhancerRelay"]
                    }
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.uioType",
            removeSource: true,
            target: "{that > uiOptionsInline}.options.uioType"
        }, {
            source: "{that}.options.uiOptionsInline",
            removeSource: true,
            target: "{that > uiOptionsInline}.options"
        }, {
            source: "{that}.options.uiOptions",
            removeSource: true,
            target: "{that uiOptions}.options"
        }]
    });

    fluid.uiOptions.builder.generateGrade = function (name, namespace, options) {
        var gradeNameTemplate = "%namespace.%name";
        var gradeName = fluid.stringTemplate(gradeNameTemplate, {name: name, namespace: namespace});
        fluid.defaults(gradeName, options);
        return gradeName;
    };

    fluid.uiOptions.builder.constructGrades = function (auxSchema, gradeCategories) {
        var constructedGrades = {};
        fluid.each(gradeCategories, function (category) {
            var gradeOpts = auxSchema[category];
            if (fluid.get(gradeOpts, "gradeNames")) {
                constructedGrades[category] = fluid.uiOptions.builder.generateGrade(category, auxSchema.namespace, gradeOpts);
            }
        });
        return constructedGrades;
    };

    fluid.uiOptions.builder.parseAuxSchema = function (auxSchema) {
        var auxTypes = [];
        fluid.each(auxSchema, function parse(field) {
            var type = field.type;
            if (type) {
                auxTypes.push(type);
            }
        });
        return auxTypes;
    };

})(jQuery, fluid_1_5);
