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

    /**
     * Look up the value on the given source object by using the path.
     * Takes a template string containing tokens in the form of "@source-path-to-value".
     * Returns a value (any type) or undefined if the path is not found.
     *
     * @param {object}    root       an object to retrieve the returned value from
     * @param {String}    pathRef    a string that the path to the requested value is embedded into
     *
     * Example:
     * 1. Parameters:
     * source:
     * {
     *     path1: {
     *         path2: "here"
     *     }
     * }
     *
     * template: "@path1.path2"
     *
     * 2. Return: "here"
     */
    fluid.uiOptions.expandSchemaValue = function (root, pathRef) {
        if (pathRef.charAt(0) !== "@") {
            return pathRef;
        }

        return fluid.get(root, pathRef.substring(1));
    };

    fluid.uiOptions.addAtPath = function (root, path, object) {
        var existingObject = fluid.get(root, path);
        fluid.set(root, path, $.extend(true, {}, existingObject, object));

        return root;
    }

    fluid.uiOptions.expandSchemaComponents = function (auxSchema, type, prefKey, componentConfig, index, commonOptions, primarySchema) {
        var components = {};
        var selectors = {};
        var templates = {};
        var rootModel = {};

        type = type + "s";

        var componentName = componentConfig.type;
        var memberName = componentName.replace(new RegExp("\\.", 'g'),  "_");
        var flattenedPrefKey = prefKey.replace(new RegExp("\\.", 'g'),  "_");

        if (componentName) {
            var instance = {
                type: componentName
            };

            var container = componentConfig.container;
            if (container) {
                fluid.set(selectors, memberName, container);
            }

            var template = componentConfig.template;
            if (template) {
                templates[memberName] = template;
            }

            var componentOptions = fluid.copy(componentConfig);
            delete componentOptions.type;
            delete componentOptions.container;
            delete componentOptions.template;

            if (fluid.keys(componentOptions).length > 0) {
                instance.options = componentOptions;
            }

            var preferenceMap = fluid.defaults(componentName).preferenceMap;

            var map = preferenceMap[prefKey];
            fluid.each(map, function (PrimaryPath, internalPath) {
                var prefSchema = primarySchema[prefKey];
                if (prefSchema) {
                    if (internalPath.slice(0, 6) === "model.") {
                        var internalModelName = internalPath.slice(6);
                        fluid.set(instance, "options.rules." + flattenedPrefKey, internalModelName);
                        fluid.set(instance, "options.model." + internalModelName, prefSchema[PrimaryPath]);
                        fluid.set(rootModel, "members.rootModel." + flattenedPrefKey, prefSchema[PrimaryPath]);
                    } else {
                        fluid.set(instance, "options." + internalPath, prefSchema[PrimaryPath]);
                    }
                }
            });

            // Merge common options
            if (commonOptions) {
                fluid.each(commonOptions, function (value, key) {
                    value = fluid.stringTemplate(value, {
                        prefKey: memberName
                    });
                    fluid.set(instance, key, value);
                });
            }

            components[memberName] = instance;
        }

        if (fluid.keys(components).length > 0) {
            auxSchema = fluid.uiOptions.addAtPath(auxSchema, type + ".components", components);

            if (fluid.keys(selectors).length > 0) {
                auxSchema = fluid.uiOptions.addAtPath(auxSchema, type + ".selectors", selectors);
            }
        }
        if (fluid.keys(templates).length > 0) {
            auxSchema = fluid.uiOptions.addAtPath(auxSchema, "templateLoader.templates", templates);
        }
        if (fluid.keys(rootModel).length > 0) {
            auxSchema = fluid.uiOptions.addAtPath(auxSchema, "rootModel", rootModel);
        }
        return auxSchema;
    };

    fluid.uiOptions.expandSchemaDirectOption = function(auxSchema, type, targetPath) {
        var value = auxSchema[type];
        if (value) {
            delete auxSchema[type];
            fluid.set(auxSchema, targetPath, value);
            var a = 1;
        }
    };

    /**
     * Expands a all "@" path references from an auxiliary schema.
     * Note that you cannot chain "@" paths.
     *
     *  @param {object} schemaToExpand the shcema which will be expanded
     *  @param {object} altSource an alternative look up object. This is primarily used for the internal recursive call.
     *  @return {object} an expaneded version of the schema.
     */
    fluid.uiOptions.expandSchemaImpl = function (schemaToExpand, altSource) {
        var expandedSchema = fluid.copy(schemaToExpand);
        altSource = altSource || expandedSchema;

        fluid.each(expandedSchema, function (value, key) {
            if (typeof value === "object") {
                expandedSchema[key] = fluid.uiOptions.expandSchemaImpl(value, altSource);
            } else if (typeof value === "string") {
                var expandedVal = fluid.uiOptions.expandSchemaValue(altSource, value);
                if (expandedVal !== undefined) {
                    expandedSchema[key] = expandedVal;
                } else {
                    delete expandedSchema[key];
                }
            }
        });
        return expandedSchema;
    };

    fluid.uiOptions.expandSchema = function (schemaToExpand, defaultNamespace, indexes, topCommonOptions, elementCommonOptions, primarySchema) {
        var auxSchema = fluid.uiOptions.expandSchemaImpl(schemaToExpand);
        auxSchema.namespace = auxSchema.namespace || defaultNamespace;

        fluid.each(auxSchema, function (category, prefName) {
            var type = "panel";
            if (category[type]) {
                fluid.uiOptions.expandSchemaComponents(auxSchema, type, category.type, category[type], fluid.get(indexes, type), fluid.get(elementCommonOptions, type), primarySchema);
            }
            type = "enactor";
            if (category[type]) {
                fluid.uiOptions.expandSchemaComponents(auxSchema, type, category.type, category[type], fluid.get(indexes, type), fluid.get(elementCommonOptions, type), primarySchema);
            }

            type = "messages";
            if (prefName === type) {
                fluid.uiOptions.expandSchemaDirectOption(auxSchema, type, "messages.members.messages");
            }

            type = "templatePrefix";
            if (prefName === type) {
                fluid.uiOptions.expandSchemaDirectOption(auxSchema, type, "templatePrefix.templatePrefix");
            }
        });

        // Add top common options
        fluid.each(topCommonOptions, function (topOptions, type) {
            var typeObject = fluid.get(auxSchema, type);

            if (typeObject) {
                auxSchema[type] = $.extend(true, topOptions, typeObject);
            }
        });

        return auxSchema;
    };

    fluid.defaults("fluid.uiOptions.auxBuilder", {
        gradeNames: ["fluid.uiOptions.primaryBuilder", "fluid.uiOptions.auxSchema", "autoInit"],
        defaultNamespace: "fluid.uiOptions.create",
        mergePolicy: {
            elementCommonOptions: "noexpand"
        },
        topCommonOptions: {
            panels: {
                gradeNames: ["fluid.uiOptions", "autoInit"]
            },
            enactors: {
                gradeNames: ["fluid.uiEnhancer", "autoInit"]
            },
            templateLoader: {
                gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"]
            },
            rootModel: {
                gradeNames: ["fluid.uiOptions.rootModel", "autoInit"]
            },
            messages: {
                gradeNames: ["fluid.littleComponent", "autoInit"]
            },
            templatePrefix: {
                gradeNames: ["fluid.littleComponent", "autoInit"]
            }
        },
        elementCommonOptions: {
            panel: {
                "createOnEvent": "onUIOptionsMarkupReady",
                "container": "{uiOptions}.dom.%prefKey",
                "options.gradeNames": "fluid.uiOptions.defaultPanel",
                "options.resources.template": "{templateLoader}.resources.%prefKey"
            },
            enactor: {
                "container": "{uiEnhancer}.container",
                "options.sourceApplier": "{uiEnhancer}.applier"
            }
        },
        indexes: {
            panel: {
                expander: {
                    func: "fluid.indexDefaults",
                    args: ["panelsIndex", {
                        gradeNames: "fluid.uiOptions.panels",
                        indexFunc: "fluid.uiOptions.auxBuilder.prefMapIndexer"
                    }]
                }
            },
            enactor: {
                expander: {
                    func: "fluid.indexDefaults",
                    args: ["enactorsIndex", {
                        gradeNames: "fluid.uiOptions.enactors",
                        indexFunc: "fluid.uiOptions.auxBuilder.prefMapIndexer"
                    }]
                }
            }
        },
        expandedAuxSchema: {
            expander: {
                func: "fluid.uiOptions.expandSchema",
                args: [
                    "{that}.options.auxiliarySchema",
                    "{that}.options.defaultNamespace",
                    "{that}.options.indexes",
                    "{that}.options.topCommonOptions",
                    "{that}.options.elementCommonOptions",
                    "{that}.options.schema.properties"
                ]
            }
        }
    });

    fluid.uiOptions.auxBuilder.prefMapIndexer = function (defaults) {
        return fluid.keys(defaults.preferenceMap);
    };

})(jQuery, fluid_1_5);
