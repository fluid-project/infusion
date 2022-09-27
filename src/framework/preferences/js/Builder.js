/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

"use strict";

fluid.registerNamespace("fluid.prefs.builder");

/**
 * A merge policy where the items are not merged, but returned as a merge array to be handled by another
 * function (e.g. by an expander). Similar merge policies are `fluid.membersMergePolicy` and
 * `fluid.deferringMergePolicy`. These types of deferred merges are required to work around
 * [FLUID-6457](https://issues.fluidproject.org/browse/FLUID-6457).
 *
 * @param  {Object} target - A base for merging the options.
 * @param  {Object} source - Options being merged.
 * @return {Object[]} - The merge array
 */
fluid.deferredMergePolicy = function (target, source) {
    if (!target) {
        target = new fluid.mergingArray();
    }
    if (source instanceof fluid.mergingArray) {
        target.push.apply(target, source);
    } else if (source !== undefined) {
        target.push(source);
    }

    return target;
};

fluid.defaults("fluid.prefs.builder", {
    gradeNames: [
        "fluid.prefs.primaryBuilder",
        "fluid.prefs.auxBuilder",
        "{that}.applyAssemblerGrades"
    ],
    mergePolicy: {
        preferences: "replace",
        prefsPrioritized: {
            noexpand: true,
            func: fluid.deferredMergePolicy
        }
    },
    selectors: {
        containerMarker: ".flc-prefsEditor-main"
    },
    invokers: {
        applyAssemblerGrades: {
            funcName: "fluid.get",
            args: ["{that}.options.assemblerGrades", "{that}.options.buildType"]
        }
    },
    buildType: "prefsEditor",
    assemblerGrades: {
        store: "fluid.prefs.assembler.store",
        prefsEditor: "fluid.prefs.assembler.prefsEd",
        enhancer: "fluid.prefs.assembler.uie"
    },
    requestedPrefs: {
        expander: {
            funcName: "fluid.keys",
            args: ["{that}.options.prefsMerged"]
        }
    },
    prefsMerged: {
        expander: {
            funcName: "fluid.prefs.builder.mergePrefs",
            args: ["{that}", "{that}.options.prefsPrioritized"]
        }
    },
    // TODO: Due to https://issues.fluidproject.org/browse/FLUID-6438
    // Context aware supplied preferences must be targeted at `prefsPrioritized` instead of `preferences` and
    // be supplied as {PrioritizedPrefs} object.
    prefsPrioritized: {
        expander: {
            funcName: "fluid.prefs.builder.prioritizePrefs",
            args: ["{that}.options.preferences"]
        }
    },
    componentGrades: {
        expander: {
            func: "fluid.prefs.builder.constructGrades",
            args: [
                "{that}.options.auxSchema",
                [
                    "enactors",
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
    distributeOptions: {
        generatePanelContainers: {
            source: "{that}.options.auxiliarySchema.generatePanelContainers",
            target: "{that prefsEditorLoader prefsEditor}.options.generatePanelContainers"
        },
        containerMarker: {
            source: "{that}.options.selectors.containerMarker",
            target: "{that fluid.prefs.enactor}.options.ignoreSelectorForEnactor.forEnactor"
        }
    }
});

fluid.defaults("fluid.prefs.assembler.store", {
    gradeNames: ["fluid.component"],
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
        }
    },
    distributeOptions: {
        "uie.store": {
            source: "{that}.options.store",
            target: "{that fluid.prefs.store}.options"
        }
    }
});

fluid.defaults("fluid.prefs.assembler.uie", {
    gradeNames: ["fluid.prefs.assembler.store", "fluid.viewComponent"],
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
    gradeNames: ["fluid.prefs.assembler.uie"],
    components: {
        prefsEditorLoader: {
            type: "fluid.viewComponent",
            container: "{fluid.prefs.assembler.prefsEd}.container",
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
            target: "{that prefsEditor}.options"
        },
        "prefsEdAssembler.prefsEditorPrefs": {
            source: "{that}.options.prefsMerged",
            target: "{that prefsEditor}.options.preferences"
        },
        "prefsEdAssembler.prefsEditorLoader": {
            source: "{that}.options.prefsEditorLoader",
            target: "{that prefsEditorLoader}.options"
        }
    }
});

/**
 * Constructs a grade with the supplied options.
 *
 * @param  {String} name - the "short" name of the grade
 * @param  {String} namespace - the namespace to use for the grade name.
 * @param  {Object} options - any options required for defining the grade
 * @return {String} - the full grade name for the newly constructed grade
 */
fluid.prefs.builder.constructGrade = function (name, namespace, options) {
    var gradeNameTemplate = "%namespace.%name";
    var gradeName = fluid.stringTemplate(gradeNameTemplate, {name: name, namespace: namespace});
    fluid.defaults(gradeName, options);
    return gradeName;
};

/**
 * Will attempt to construct grades for each supplied category if appropriate configuration can be found for the
 * category in the supplied `auxSchema`. Categories refer to the top level properties of the {AuxSchema} which will
 * be used to source the options for defining the related grades.
 *
 * @param  {AuxSchema} auxSchema - A processed {AuxiliarySchema}
 * @param  {String[]} gradeCategories - an array of grade categories to construct
 * @return {Object} - the grade names of the constructed grades
 */
fluid.prefs.builder.constructGrades = function (auxSchema, gradeCategories) {
    var constructedGrades = {};
    fluid.each(gradeCategories, function (category) {
        var gradeOpts = auxSchema[category];
        if (fluid.get(gradeOpts, "gradeNames")) {
            constructedGrades[category] = fluid.prefs.builder.constructGrade(category, auxSchema.namespace, gradeOpts);
        }
    });
    return constructedGrades;
};

/**
 * A prioritized set of preferences where the keys are the {String} name of the preference and value in the form
 * {priority: "optional.priority.definition"}. If the value is set to `null` the preference will be removed.
 *
 * @typedef {Object} PrioritizedPrefs
 */

/**
 * Converts a list of preferences into a prioritized set. The preferences are prioritized based on their position
 * in the array of preferences.
 *
 * @param  {String[]} preferences - The list of preferences
 * @return {PrioritizedPrefs} - The prioritized preferences
 */
fluid.prefs.builder.prioritizePrefs = function (preferences) {
    var prioritized = {};
    fluid.each(preferences, function (preference, index) {
        var record = {};
        if (index) {
            record.priority = "after:" + preferences[index - 1];
        }
        prioritized[preference] = record;
    });
    return prioritized;
};

/**
 * Handles the deferred merging of {PrioritizedPrefs} options. Each item in the mergingArray will be merged on top
 * of the previous value. If a preference is supplied with a `null` value, the preference will be removed.
 *
 * @param  {fluid.prefs.builder} that - The `fluid.prefs.builder` component
 * @param  {Object[]} mergingArray - The array of deferred merge objects
 * @return {Object} - The fully merged option
 */
fluid.prefs.builder.mergePrefs = function (that, mergingArray) {
    var merged = {};
    fluid.each(mergingArray, function (mergeRecord) {
        var expanded = fluid.expandImmediate(mergeRecord, that);

        fluid.each(expanded, function (prefConfig, preference) {
            if (prefConfig === null) {
                delete merged[preference];
                delete expanded[preference];
            }
        });

        $.extend(true, merged, expanded);
    });
    return merged;
};
