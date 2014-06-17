/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};


(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.prefs");

    fluid.defaults("fluid.prefs.builder", {
        gradeNames: ["fluid.eventedComponent", "fluid.prefs.auxBuilder", "autoInit"],
        mergePolicy: {
            auxSchema: "expandedAuxSchema"
        },
        assembledPrefsEditorGrade: {
            expander: {
                func: "fluid.prefs.builder.generateGrade",
                args: ["prefsEditor", "{that}.options.auxSchema.namespace", {
                    gradeNames: ["fluid.viewComponent", "autoInit", "fluid.prefs.assembler.prefsEd"],
                    componentGrades: "{that}.options.constructedGrades"
                }]
            }
        },
        assembledUIEGrade: {
            expander: {
                func: "fluid.prefs.builder.generateGrade",
                args: ["uie", "{that}.options.auxSchema.namespace", {
                    gradeNames: ["fluid.viewComponent", "autoInit", "fluid.prefs.assembler.uie"],
                    componentGrades: "{that}.options.constructedGrades"
                }]
            }
        },
        constructedGrades: {
            expander: {
                func: "fluid.prefs.builder.constructGrades",
                args: ["{that}.options.auxSchema", ["enactors", "messages", "panels", "rootModel", "templateLoader", "messageLoader", "templatePrefix", "messagePrefix"]]
            }
        },
        mappedDefaults: "{primaryBuilder}.options.schema.properties",
        components: {
            primaryBuilder: {
                type: "fluid.prefs.primaryBuilder",
                options: {
                    typeFilter: {
                        expander: {
                            func: "fluid.prefs.builder.parseAuxSchema",
                            args: "{builder}.options.auxiliarySchema"
                        }
                    }
                }
            }
        },
        distributeOptions: [{
            source: "{that}.options.primarySchema",
            removeSource: true,
            target: "{that > primaryBuilder}.options.primarySchema"
        }]
    });

    fluid.defaults("fluid.prefs.assembler.uie", {
        gradeNames: ["autoInit", "fluid.viewComponent"],
        components: {
            store: {
                type: "fluid.littleComponent",
                options: {
                    gradeNames: ["{that}.options.storeType"],
                    storeType: "fluid.globalSettingsStore"
                }
            },
            enhancer: {
                type: "fluid.littleComponent",
                options: {
                    gradeNames: "{that}.options.enhancerType",
                    enhancerType: "fluid.pageEnhancer",
                    components: {
                        uiEnhancer: {
                            options: {
                                gradeNames: ["{fluid.prefs.assembler.uie}.options.componentGrades.enactors"]
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
        }, {
            source: "{that}.options.store",
            removeSource: true,
            target: "{that settingsStore}.options"
        }, {
            source: "{that}.options.storeType",
            removeSource: true,
            target: "{that > store}.options.storeType"
        }, {
            source: "{that}.options.enhancerType",
            removeSource: true,
            target: "{that > enhancer}.options.enhancerType"
        }]
    });

    fluid.defaults("fluid.prefs.assembler.prefsEd", {
        gradeNames: ["autoInit", "fluid.viewComponent", "fluid.prefs.assembler.uie"],
        components: {
            prefsEditorLoader: {
                type: "fluid.viewComponent",
                container: "{fluid.prefs.assembler.prefsEd}.container",
                priority: "last",
                options: {
                    gradeNames: ["{fluid.prefs.assembler.prefsEd}.options.componentGrades.templatePrefix", "{fluid.prefs.assembler.prefsEd}.options.componentGrades.messagePrefix", "{fluid.prefs.assembler.prefsEd}.options.componentGrades.messages", "{that}.options.prefsEditorType"],
                    prefsEditorType: "fluid.prefs.separatedPanel",
                    templateLoader: {
                        gradeNames: ["{fluid.prefs.assembler.prefsEd}.options.componentGrades.templateLoader"]
                    },
                    messageLoader: {
                        gradeNames: ["{fluid.prefs.assembler.prefsEd}.options.componentGrades.messageLoader"]
                    },
                    prefsEditor: {
                        gradeNames: ["{fluid.prefs.assembler.prefsEd}.options.componentGrades.panels", "{fluid.prefs.assembler.prefsEd}.options.componentGrades.rootModel", "fluid.prefs.uiEnhancerRelay"]
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
        distributeOptions: [{
            source: "{that}.options.prefsEditorType",
            removeSource: true,
            target: "{that > prefsEditorLoader}.options.prefsEditorType"
        }, {
            source: "{that}.options.prefsEditor",
            removeSource: true,
            target: "{that prefsEditor}.options"
        }, {
            source: "{that}.options.templatePrefix",
            removeSource: true,
            target: "{that prefsEditorLoader}.options.templatePrefix"
        }, {
            source: "{that}.options.messagePrefix",
            removeSource: true,
            target: "{that prefsEditorLoader}.options.messagePrefix"
        }]
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

    /*
     * A one-stop-shop function to build and instantiate a prefsEditor from a schema.
     */
    fluid.prefs.create = function (container, options) {
        options = options || {};
        var builder = fluid.prefs.builder(options.build);
        return fluid.invokeGlobalFunction(builder.options.assembledPrefsEditorGrade, [container, options.prefsEditor]);
    };

})(jQuery, fluid_2_0);
