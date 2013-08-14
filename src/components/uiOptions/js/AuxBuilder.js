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

    /*******************************************************************************
     * Base auxiliary schema grade
     *******************************************************************************/

    fluid.defaults("fluid.uiOptions.auxSchema", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        auxiliarySchema: {}
    });

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
    };

    // only works with top level elements
    fluid.uiOptions.removeKey = function (root, key) {
        var value = root[key];
        delete root[key];
        return value;
    };

    fluid.uiOptions.rearrangeDirect = function (root, toPath, sourcePath) {
        var result = {};
        var sourceValue = fluid.uiOptions.removeKey(root, sourcePath);
        if (sourceValue) {
            fluid.set(result, toPath, sourceValue);
        }
        return result;
    };

    fluid.uiOptions.expandSchemaComponents = function (auxSchema, type, prefKey, componentConfig, index, commonOptions, mappedDefaults) {
        var componentOptions = fluid.copy(componentConfig) || {};
        var components = {};
        var rootModel = {};

        var componentName = fluid.uiOptions.removeKey(componentOptions, "type");
        var regexp = new RegExp("\\.", 'g');
        var memberName = componentName.replace(regexp,  "_");
        var flattenedPrefKey = prefKey.replace(regexp,  "_");

        if (componentName) {

            var cmp = components[memberName] = {
                type: componentName,
                options: componentOptions
            };

            var selectors = fluid.uiOptions.rearrangeDirect(componentOptions, memberName, "container");
            var templates = fluid.uiOptions.rearrangeDirect(componentOptions, memberName, "template");
            var messages = fluid.uiOptions.rearrangeDirect(componentOptions, memberName, "message");

            var preferenceMap = fluid.defaults(componentName).preferenceMap;

            var map = preferenceMap[prefKey];
            fluid.each(map, function (PrimaryPath, internalPath) {
                var prefSchema = mappedDefaults[prefKey];
                if (prefSchema) {
                    var opts = {};
                    if (internalPath.indexOf("model.") === 0) {
                        var internalModelName = internalPath.slice(6);
                        // Set up the binding in "rules" accepted by the modelRelay base grade of every panel
                        fluid.set(opts, ["rules", flattenedPrefKey], internalModelName);
                        fluid.set(opts, ["model", internalModelName], prefSchema[PrimaryPath]);
                        fluid.set(rootModel, ["members", "rootModel", flattenedPrefKey], prefSchema[PrimaryPath]);
                    } else {
                        fluid.set(opts, internalPath, prefSchema[PrimaryPath]);
                    }
                    $.extend(true, componentOptions, opts);
                }
            });

            fluid.each(commonOptions, function (value, path) {
                var opts = {};
                value = fluid.stringTemplate(value, {
                    prefKey: memberName
                });
                fluid.set(opts, path, value);
                $.extend(true, cmp, opts);
            });

            fluid.uiOptions.addAtPath(auxSchema, [type, "components"], components);
            fluid.uiOptions.addAtPath(auxSchema, [type, "selectors"], selectors);
            fluid.uiOptions.addAtPath(auxSchema, ["templateLoader", "templates"], templates);
            fluid.uiOptions.addAtPath(auxSchema, ["messageLoader", "templates"], messages);
            fluid.uiOptions.addAtPath(auxSchema, "rootModel", rootModel);
        }

        return auxSchema;
    };

    fluid.uiOptions.expandSchemaDirectOption = function (auxSchema, type, targetPath) {
        var value = auxSchema[type];
        if (value) {
            delete auxSchema[type];
            fluid.set(auxSchema, targetPath, value);
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

    fluid.uiOptions.expandSchema = function (schemaToExpand, defaultNamespace, indexes, topCommonOptions, elementCommonOptions, mappedDefaults) {
        var auxSchema = fluid.uiOptions.expandSchemaImpl(schemaToExpand);
        auxSchema.namespace = auxSchema.namespace || defaultNamespace;

        fluid.each(auxSchema, function (category, prefName) {
            // TODO: Replace this cumbersome scheme with one based on an extensible lookup to handlers
            var type = "panel";
            if (category[type]) {
                fluid.uiOptions.expandSchemaComponents(auxSchema, "panels", category.type, category[type], fluid.get(indexes, type), fluid.get(elementCommonOptions, type), mappedDefaults);
            }
            type = "enactor";
            if (category[type]) {
                fluid.uiOptions.expandSchemaComponents(auxSchema, "enactors", category.type, category[type], fluid.get(indexes, type), fluid.get(elementCommonOptions, type), mappedDefaults);
            }

            type = "template";
            if (prefName === type) {
                fluid.set(auxSchema, ["templateLoader", "templates", "uiOptions"], auxSchema[type]);
                delete auxSchema[type];
            }

            type = "templatePrefix";
            if (prefName === type) {
                fluid.uiOptions.expandSchemaDirectOption(auxSchema, type, "templatePrefix.templatePrefix");
            }

            type = "message";
            if (prefName === type) {
                fluid.set(auxSchema, ["messageLoader", "templates", "uiOptions"], auxSchema[type]);
                delete auxSchema[type];
            }

            type = "messagePrefix";
            if (prefName === type) {
                fluid.uiOptions.expandSchemaDirectOption(auxSchema, type, "messagePrefix.messagePrefix");
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
        gradeNames: ["fluid.uiOptions.auxSchema", "autoInit"],
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
            messageLoader: {
                gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"]
            },
            rootModel: {
                gradeNames: ["fluid.uiOptions.rootModel", "autoInit"]
            },
            templatePrefix: {
                gradeNames: ["fluid.littleComponent", "autoInit"]
            },
            messagePrefix: {
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
        mappedDefaults: {},
        expandedAuxSchema: {
            expander: {
                func: "fluid.uiOptions.expandSchema",
                args: [
                    "{that}.options.auxiliarySchema",
                    "{that}.options.defaultNamespace",
                    "{that}.options.indexes",
                    "{that}.options.topCommonOptions",
                    "{that}.options.elementCommonOptions",
                    "{that}.options.mappedDefaults"
                ]
            }
        }
    });

    fluid.uiOptions.auxBuilder.prefMapIndexer = function (defaults) {
        return fluid.keys(defaults.preferenceMap);
    };

})(jQuery, fluid_1_5);
