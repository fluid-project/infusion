/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};


(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.prefs");

    // fluid.defaults("fluid.prefs.builder", {
    //     gradeNames: ["fluid.component", "fluid.prefs.auxBuilder", "{that}.applyAuxiliarySchemaGrades"],
    //     mergePolicy: {
    //         auxSchema: "expandedAuxSchema"
    //     },
    //     invokers: {
    //         applyAuxiliarySchemaGrades: {
    //             funcName: "fluid.identity",
    //             args: ["{that}.options.auxiliarySchemas"]
    //         }
    //     },
    //     assembledPrefsEditorGrade: {
    //         expander: {
    //             func: "fluid.prefs.builder.generateGrade",
    //             args: ["prefsEditor", "{that}.options.auxSchema.namespace", {
    //                 gradeNames: ["fluid.prefs.assembler.prefsEd", "fluid.viewComponent"],
    //                 componentGrades: "{that}.options.constructedGrades",
    //                 loaderGrades: "{that}.options.auxSchema.loaderGrades",
    //                 defaultLocale: "{that}.options.auxSchema.defaultLocale",
    //                 enhancer: {
    //                     defaultLocale: "{that}.options.auxSchema.defaultLocale"
    //                 }
    //             }]
    //         }
    //     },
    //     assembledUIEGrade: {
    //         expander: {
    //             func: "fluid.prefs.builder.generateGrade",
    //             args: ["uie", "{that}.options.auxSchema.namespace", {
    //                 gradeNames: ["fluid.viewComponent", "fluid.prefs.assembler.uie"],
    //                 componentGrades: "{that}.options.constructedGrades"
    //             }]
    //         }
    //     },
    //     constructedGrades: {
    //         expander: {
    //             func: "fluid.prefs.builder.constructGrades",
    //             args: [
    //                 "{that}.options.auxSchema",
    //                 [
    //                     "enactors",
    //                     "messages",
    //                     "panels",
    //                     "initialModel",
    //                     "templateLoader",
    //                     "messageLoader",
    //                     "terms",
    //                     "aliases_prefsEditor",
    //                     "aliases_enhancer"
    //                 ]
    //             ]
    //         }
    //     },
    //     mappedDefaults: "{primaryBuilder}.options.schema.properties",
    //     components: {
    //         primaryBuilder: {
    //             type: "fluid.prefs.primaryBuilder",
    //             options: {
    //                 typeFilter: {
    //                     expander: {
    //                         func: "fluid.prefs.builder.parseAuxSchema",
    //                         args: "{builder}.options.auxiliarySchema"
    //                     }
    //                 }
    //             }
    //         }
    //     },
    //
    //     distributeOptions: {
    //         "builder.primaryBuilder.primarySchema": {
    //             source: "{that}.options.primarySchema",
    //             removeSource: true,
    //             target: "{that > primaryBuilder}.options.primarySchema"
    //         },
    //         "builder.auxiliarySchema.loaderGrades": {
    //             source: "{that}.options.loaderGrades",
    //             removeSource: true,
    //             target: "{that}.options.auxiliarySchema.loaderGrades"
    //         },
    //         "builder.auxiliarySchema.terms": {
    //             source: "{that}.options.terms",
    //             removeSource: true,
    //             target: "{that}.options.auxiliarySchema.terms"
    //         },
    //         "builder.auxiliarySchema.prefsEditorTemplate": {
    //             source: "{that}.options.prefsEditorTemplate",
    //             removeSource: true,
    //             target: "{that}.options.auxiliarySchema.template"
    //         },
    //         "builder.auxiliarySchema.prefsEditorMessage": {
    //             source: "{that}.options.prefsEditorMessage",
    //             removeSource: true,
    //             target: "{that}.options.auxiliarySchema.message"
    //         },
    //         "builder.auxiliarySchema.defaultLocale": {
    //             source: "{that}.options.defaultLocale",
    //             removeSource: true,
    //             target: "{that}.options.auxiliarySchema.defaultLocale"
    //         }
    //     }
    // });

    fluid.defaults("fluid.prefs.builder", {
        gradeNames: ["fluid.component", "{that}.applyAssemblerGrades"],
        mergePolicy: {
            auxSchema: "expandedAuxSchema"
        },
        invokers: {
            applyAssemblerGrades: {
                funcName: "fluid.prefs.builder.getAssemblerGrades",
                args: ["{that}.options.assemblerGrades", "{that}.options.buildType"]
            }
        },
        buildType: "prefsEditor",
        assemblerGrades: {
            store: "fluid.prefs.assembler.store",
            prefsEditor: "fluid.prefs.assembler.prefsEd",
            enhancer: "fluid.prefs.assembler.uie"
        },
        componentGrades: {
            expander: {
                func: "fluid.prefs.builder.constructGrades",
                args: [
                    "{that}.options.auxSchema",
                    [
                        "enactors",
                        "messages",
                        "panels",
                        "initialModel",
                        "templateLoader",
                        "messageLoader",
                        "terms",
                        "aliases_prefsEditor",
                        "aliases_enhancer"
                    ]
                ]
            }
        },
        // distributeOptions: {
        //     "builder.auxiliarySchema.loaderGrades": {
        //         source: "{that}.options.loaderGrades",
        //         removeSource: true,
        //         target: "{that}.options.auxiliarySchema.loaderGrades"
        //     },
        //     "builder.auxiliarySchema.terms": {
        //         source: "{that}.options.terms",
        //         removeSource: true,
        //         target: "{that}.options.auxiliarySchema.terms"
        //     },
        //     "builder.auxiliarySchema.prefsEditorTemplate": {
        //         source: "{that}.options.prefsEditorTemplate",
        //         removeSource: true,
        //         target: "{that}.options.auxiliarySchema.template"
        //     },
        //     "builder.auxiliarySchema.prefsEditorMessage": {
        //         source: "{that}.options.prefsEditorMessage",
        //         removeSource: true,
        //         target: "{that}.options.auxiliarySchema.message"
        //     },
        //     "builder.auxiliarySchema.defaultLocale": {
        //         source: "{that}.options.defaultLocale",
        //         removeSource: true,
        //         target: "{that}.options.auxiliarySchema.defaultLocale"
        //     }
        // }
    });

    fluid.prefs.builder.getAssemblerGrades = function (assemblers, buildType) {
        return assemblers[buildType];
    };

    fluid.defaults("fluid.prefs.assembler.store", {
        gradeNames: ["fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.prefs.globalSettingsStore",
                options: {
                    distributeOptions: {
                        "uie.store.context.checkUser": {
                            target: "{that fluid.prefs.store}.options.contextAwareness.strategy.checks.user",
                            record: {
                                contextValue: "{fluid.prefs.assembler.store}.options.storeType",
                                gradeNames: "{fluid.prefs.assembler.store}.options.storeType"
                            }
                        }
                    }
                }
            },
        },
        distributeOptions: {
            "uie.store": {
                source: "{that}.options.store",
                target: "{that fluid.prefs.store}.options"
            }
        }
    });

    fluid.defaults("fluid.prefs.assembler.uie", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.assembler.store"],
        enhancerType: "fluid.pageEnhancer",
        components: {
            store: {
                type: "fluid.prefs.globalSettingsStore",
                options: {
                    distributeOptions: {
                        "uie.store.context.checkUser": {
                            target: "{that fluid.prefs.store}.options.contextAwareness.strategy.checks.user",
                            record: {
                                contextValue: "{fluid.prefs.assembler.store}.options.storeType",
                                gradeNames: "{fluid.prefs.assembler.store}.options.storeType"
                            }
                        }
                    }
                }
            },
            enhancer: {
                type: "fluid.component",
                options: {
                    gradeNames: "{that}.options.enhancerType",
                    components: {
                        uiEnhancer: {
                            options: {
                                gradeNames: [
                                    "{fluid.prefs.assembler.uie}.options.componentGrades.enactors",
                                    "{fluid.prefs.assembler.uie}.options.componentGrades.aliases_enhancer"
                                ],
                                defaultLocale: "{fluid.prefs.assembler.uie}.options.auxSchema.defaultLocale"
                            }
                        }
                    }
                }
            }
        },
        distributeOptions: {
            "uie.enhancer": {
                source: "{that}.options.enhancer",
                target: "{that uiEnhancer}.options",
                removeSource: true
            },
            "uie.enhancer.enhancerType": {
                source: "{that}.options.enhancerType",
                target: "{that > enhancer}.options.enhancerType"
            }
        }
    });

    fluid.defaults("fluid.prefs.assembler.prefsEd", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.assembler.uie"],
        // gradeNames: ["fluid.viewComponent", "fluid.prefs.assembler.store"],
        components: {
            prefsEditorLoader: {
                type: "fluid.viewComponent",
                container: "{fluid.prefs.assembler.prefsEd}.container",
                priority: "last",
                options: {
                    gradeNames: [
                        "{fluid.prefs.assembler.prefsEd}.options.componentGrades.terms",
                        "{fluid.prefs.assembler.prefsEd}.options.componentGrades.messages",
                        "{fluid.prefs.assembler.prefsEd}.options.componentGrades.initialModel",
                        "{fluid.prefs.assembler.prefsEd}.options.auxSchema.loaderGrades"
                    ],
                    defaultLocale: "{fluid.prefs.assembler.prefsEd}.options.auxSchema.defaultLocale",
                    templateLoader: {
                        gradeNames: ["{fluid.prefs.assembler.prefsEd}.options.componentGrades.templateLoader"]
                    },
                    messageLoader: {
                        gradeNames: ["{fluid.prefs.assembler.prefsEd}.options.componentGrades.messageLoader"]
                    },
                    prefsEditor: {
                        gradeNames: [
                            "{fluid.prefs.assembler.prefsEd}.options.componentGrades.panels",
                            "{fluid.prefs.assembler.prefsEd}.options.componentGrades.aliases_prefsEditor",
                            "fluid.prefs.uiEnhancerRelay"
                        ]
                    },
                    events: {
                        onReady: "{fluid.prefs.assembler.prefsEd}.events.onPrefsEditorReady"
                    }
                }
            }
        },
        events: {
            onPrefsEditorReady: null,
            onReady: {
                events: {
                    onPrefsEditorReady: "onPrefsEditorReady",
                    onCreate: "onCreate"
                },
                args: ["{that}"]
            }
        },
        distributeOptions: {
            "prefsEdAssembler.prefsEditor": {
                source: "{that}.options.prefsEditor",
                removeSource: true,
                target: "{that prefsEditor}.options"
            }
        }
    });

    fluid.prefs.builder.generateGrade = function (name, namespace, options) {
        var gradeNameTemplate = "%namespace.%name";
        var gradeName = fluid.stringTemplate(gradeNameTemplate, {name: name, namespace: namespace});
        fluid.defaults(gradeName, options);
        return gradeName;
    };

    fluid.prefs.builder.constructGrades = function (auxSchema, gradeCategories) {
        var constructedGrades = {};
        fluid.each(gradeCategories, function (category) {
            var gradeOpts = auxSchema[category];
            if (fluid.get(gradeOpts, "gradeNames")) {
                constructedGrades[category] = fluid.prefs.builder.generateGrade(category, auxSchema.namespace, gradeOpts);
            }
        });
        return constructedGrades;
    };

    fluid.prefs.builder.parseAuxSchema = function (auxSchema) {
        var auxTypes = [];
        fluid.each(auxSchema, function parse(field) {
            var type = field.type;
            if (type) {
                auxTypes.push(type);
            }
        });
        return auxTypes;
    };

    // /*
    //  * A one-stop-shop function to build and instantiate a prefsEditor from a schema.
    //  */
    // fluid.defaults("fluid.prefs.create", {
    //     gradeNames: ["fluid.viewComponent", "{that}.getGradeFromSchema"],
    //     invokers: {
    //         getGradeFromSchema: {
    //             funcName: "fluid.prefs.getGradeFromSchema",
    //             args: [{
    //                 auxiliarySchemas: "{that}.options.auxiliarySchemas",
    //                 defaultLocale: "{that}.options.defaultLocale",
    //                 loaderGrades: "{that}.options.loaderGrades",
    //                 prefsEditorMessage: "{that}.options.prefsEditorMessage",
    //                 prefsEditorTemplate: "{that}.options.prefsEditorTemplate",
    //                 primarySchema: "{that}.options.primarySchema",
    //                 terms: "{that}.options.terms"
    //             }]
    //         }
    //     }
    // });
    //
    // fluid.prefs.getGradeFromSchema = function (options) {
    //     var builder = fluid.prefs.builder(options);
    //     return builder.options.assembledPrefsEditorGrade;
    // };

    // TODO: merge buildAuxiliary functions with fluid.prefs.primaryBuilder
    // TODO: remove fluid.uio.mappedDefaults distribute options in favour of accessing the option directly in auxBuilder
    // TODO: remove merge policy in favour of calling expandedAuxSchema, auxSchema, or using expandedAuxSchema directly
    fluid.defaults("fluid.uio", {
        gradeNames: [
            "fluid.prefs.primaryBuilder",
            "{that}.buildAuxiliary",
            "fluid.prefs.auxBuilder",
            "fluid.prefs.builder",
            "fluid.viewComponent"
        ],
        mergePolicy: {
            auxSchema: "expandedAuxSchema"
        },
        auxSchemaIndex: {
            expander: {
                func: "fluid.indexDefaults",
                args: ["schemaIndex", {
                    gradeNames: "fluid.prefs.auxSchema",
                    indexFunc: "fluid.uio.defaultSchemaIndexer"
                }]
            }
        },
        invokers: {
            // An invoker used to generate a set of grades that comprise a
            // final version of the auxiliary schema to be used by the PrefsEditor
            // builder.
            buildAuxiliary: {
                funcName: "fluid.uio.buildAuxiliary",
                args: [
                    "{that}.options.auxSchemaIndex",
                    "{that}.options.typeFilter"
                ]
            }
        },
        distributeOptions: {
            "fluid.uio.mappedDefaults": {
                source: "{that}.options.schema.properties",
                target: "{that}.options.mappedDefaults"
            },
            "fluid.uio.prefsEditorLoader": {
                source: "{that}.options.prefsEditorLoader",
                target: "{that > prefsEditorLoader}.options"
            },
            "fluid.uio.enhancer": {
                source: "{that}.options.enhancer",
                target: "{that > enhancer}.options"
            },
            "fluid.uio.store": {
                source: "{that}.options.store",
                target: "{that > store}.options"
            }
        }
    });

    /**
     * An index function that indexes all schema grades based on their
     * preference name.
     * @param {JSON} defaults -  Registered defaults for a schema grade.
     * @return {String}          A preference name.
     */
    fluid.uio.defaultSchemaIndexer = function (defaults) {
        var censoredKeys = ["defaultLocale", "groups", "loaderGrades", "message", "template", "terms"];
        return fluid.keys(fluid.censorKeys(defaults.auxiliarySchema, censoredKeys));
    };

    /*
    "prefsEditor": {
        "loaderGrades": ["fluid.prefs.separatedPanel"],
        "template": "%templatePrefix/SeparatedPanelPrefsEditor.html",
        "message": "%messagePrefix/prefsEditor.json"
    },
    "terms": {
        "templatePrefix": "../../framework/preferences/html",
        "messagePrefix": "../../framework/preferences/messages"
    }
     */

    /**
     * An invoker method that builds a list of grades that comprise a final version of the primary schema.
     * @param {JSON} schemaIndex - A global index of all schema grades registered with the framework.
     * @param {Array} typeFilter   - A list of all necessarry top level preference names.
     * @param {JSON} primarySchema - Primary schema provided as an option to the primary builder.
     * @return {Array} - A list of schema grades.
     */
    fluid.uio.buildAuxiliary = function (schemaIndex, typeFilter, auxiliarySchema) {
        var auxSchema = [];
        // Lookup all available schema grades from the index that match the
        // top level preference name.
        fluid.each(typeFilter, function merge(type) {
            var schemaGrades = schemaIndex[type];
            if (schemaGrades) {
                auxSchema = auxSchema.concat(schemaGrades);
            }
        });
        return auxSchema;
    };

})(jQuery, fluid_3_0_0);
