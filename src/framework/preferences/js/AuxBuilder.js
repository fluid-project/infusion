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

    fluid.registerNamespace("fluid.prefs");

    /*******************************************************************************
     * Base auxiliary schema grade
     *******************************************************************************/

    fluid.defaults("fluid.prefs.auxSchema", {
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
    fluid.prefs.expandSchemaValue = function (root, pathRef) {
        if (pathRef.charAt(0) !== "@") {
            return pathRef;
        }

        return fluid.get(root, pathRef.substring(1));
    };

    fluid.prefs.addAtPath = function (root, path, object) {
        var existingObject = fluid.get(root, path);
        fluid.set(root, path, $.extend(true, {}, existingObject, object));

        return root;
    };

    // only works with top level elements
    fluid.prefs.removeKey = function (root, key) {
        var value = root[key];
        delete root[key];
        return value;
    };

    fluid.prefs.rearrangeDirect = function (root, toPath, sourcePath) {
        var result = {};
        var sourceValue = fluid.prefs.removeKey(root, sourcePath);
        if (sourceValue) {
            fluid.set(result, toPath, sourceValue);
        }
        return result;
    };

    fluid.prefs.addCommonOptions = function (root, path, commonOptions, templateValues) {
        templateValues = templateValues || {};

        var typeObject = fluid.get(root, path);
        var opts = {};

        fluid.each(commonOptions, function (value, key) {
            var canAdd = true;

            // Execute the validation function to decide if this common option should be added
            if (value.func) {
                canAdd = fluid.invokeGlobalFunction(value.func, [root, path, commonOptions, templateValues]);
                value = value.value;
            }

            if (canAdd) {
                key = fluid.stringTemplate(key, templateValues);
                value = typeof (value) === "string" ? fluid.stringTemplate(value, templateValues) : value;
                fluid.set(opts, key, value);
            }
        });
    
        if (typeObject) {
            $.extend(true, root[path], $.extend(true, typeObject, opts));
        }

        return root;
    };

    fluid.prefs.containerNeeded = function (root, path, commonOptions, templateValues) {
        var componentType = fluid.get(root, [path, "type"]);
        var componentOptions = fluid.defaults(componentType);
        return (fluid.hasGrade(componentOptions, "fluid.viewComponent") || fluid.hasGrade(componentOptions, "fluid.rendererComponent"));
    };

    fluid.prefs.checkPrimarySchema = function (primarySchema, prefKey) {
        if (!primarySchema) {
            fluid.fail("The primary schema for " + prefKey + " is not defined.");
        }
        return !!primarySchema;
    };

    fluid.prefs.expandSchemaComponents = function (auxSchema, type, prefKey, componentConfig, index, commonOptions, mappedDefaults) {
        var componentOptions = fluid.copy(componentConfig) || {};
        var components = {};
        var rootModel = {};

        var componentName = fluid.prefs.removeKey(componentOptions, "type");
        var regexp = new RegExp("\\.", 'g');
        var memberName = componentName.replace(regexp,  "_");
        var flattenedPrefKey = prefKey.replace(regexp,  "_");

        if (componentName) {

            var cmp = components[memberName] = {
                type: componentName,
                options: componentOptions
            };

            var selectors = fluid.prefs.rearrangeDirect(componentOptions, memberName, "container");
            var templates = fluid.prefs.rearrangeDirect(componentOptions, memberName, "template");
            var messages = fluid.prefs.rearrangeDirect(componentOptions, memberName, "message");

            var preferenceMap = fluid.defaults(componentName).preferenceMap;

            var map = preferenceMap[prefKey];
            var prefSchema = mappedDefaults[prefKey];

            fluid.each(map, function (primaryPath, internalPath) {
                if (fluid.prefs.checkPrimarySchema(prefSchema, prefKey)) {
                    var opts = {};
                    if (internalPath.indexOf("model.") === 0) {
                        var internalModelName = internalPath.slice(6);
                        // Set up the binding in "rules" accepted by the modelRelay base grade of every panel
                        fluid.set(opts, ["rules", flattenedPrefKey], internalModelName);
                        fluid.set(opts, ["model", internalModelName], prefSchema[primaryPath]);
                        fluid.set(rootModel, ["members", "rootModel", flattenedPrefKey], prefSchema[primaryPath]);
                    } else {
                        fluid.set(opts, internalPath, prefSchema[primaryPath]);
                    }
                    $.extend(true, componentOptions, opts);
                }
            });

            fluid.prefs.addCommonOptions(components, memberName, commonOptions, {
                prefKey: memberName
            });

            fluid.prefs.addAtPath(auxSchema, [type, "components"], components);
            fluid.prefs.addAtPath(auxSchema, [type, "selectors"], selectors);
            fluid.prefs.addAtPath(auxSchema, ["templateLoader", "templates"], templates);
            fluid.prefs.addAtPath(auxSchema, ["messageLoader", "templates"], messages);
            fluid.prefs.addAtPath(auxSchema, "rootModel", rootModel);
        }

        return auxSchema;
    };

    fluid.prefs.expandSchemaDirectOption = function (auxSchema, type, targetPath) {
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
    fluid.prefs.expandSchemaImpl = function (schemaToExpand, altSource) {
        var expandedSchema = fluid.copy(schemaToExpand);
        altSource = altSource || expandedSchema;

        fluid.each(expandedSchema, function (value, key) {
            if (typeof value === "object") {
                expandedSchema[key] = fluid.prefs.expandSchemaImpl(value, altSource);
            } else if (typeof value === "string") {
                var expandedVal = fluid.prefs.expandSchemaValue(altSource, value);
                if (expandedVal !== undefined) {
                    expandedSchema[key] = expandedVal;
                } else {
                    delete expandedSchema[key];
                }
            }
        });
        return expandedSchema;
    };

    fluid.prefs.expandCompositePanels = function (auxSchema, compositePanelList, panelIndex, compositePanelCommonOptions, subPanelCommonOptions,
        compositePanelBasedOnSubCommonOptions, mappedDefaults) {
        var type = "panel";
        var panelsToIgnore = [];

        fluid.each(compositePanelList, function (compositeDetail, compositeKey) {
            var compositePanelOptions = {};
            var components = {};
            var rootModel = {};
            var selectors = {};
            var templates = {};
            var messages = {};
            var selectorsToIgnore = [];

            var thisCompositeOptions = fluid.copy(compositeDetail);
            fluid.set(compositePanelOptions, "type", thisCompositeOptions.type);
            delete thisCompositeOptions.type;

            selectors = fluid.prefs.rearrangeDirect(thisCompositeOptions, compositeKey, "container");
            templates = fluid.prefs.rearrangeDirect(thisCompositeOptions, compositeKey, "template");
            messages = fluid.prefs.rearrangeDirect(thisCompositeOptions, compositeKey, "message");

            var subPanels = {};

            fluid.each(thisCompositeOptions.panels, function (subPanelID) {
                panelsToIgnore.push(subPanelID);
                var subPanelPrefsKey = fluid.get(auxSchema, [subPanelID, "type"]);
                var safeSubPanelPrefsKey = fluid.prefs.subPanel.safePrefKey(subPanelPrefsKey);
                selectorsToIgnore.push(safeSubPanelPrefsKey);

                var subPanelOptions = fluid.copy(fluid.get(auxSchema, [subPanelID, "panel"]));
                var subPanelType = fluid.get(subPanelOptions, "type");

                fluid.set(subPanels, [safeSubPanelPrefsKey, "type"], subPanelType);

                // Deal with preferenceMap related options
                var map = fluid.defaults(subPanelType).preferenceMap[subPanelPrefsKey];
                var prefSchema = mappedDefaults[subPanelPrefsKey];

                fluid.each(map, function (primaryPath, internalPath) {
                    if (fluid.prefs.checkPrimarySchema(prefSchema, subPanelPrefsKey)) {
                        var opts;
                        if (internalPath.indexOf("model.") === 0) {
                            var internalModelName = internalPath.slice(6);
                            // Set up the binding in "rules" accepted by the modelRelay base grade of every panel
                            fluid.set(compositePanelOptions, ["options", "rules", safeSubPanelPrefsKey], safeSubPanelPrefsKey);
                            fluid.set(compositePanelOptions, ["options", "model", safeSubPanelPrefsKey], prefSchema[primaryPath]);
                            fluid.set(rootModel, ["members", "rootModel", safeSubPanelPrefsKey], prefSchema[primaryPath]);
                        } else {
                            opts = opts || {options: {}};
                            fluid.set(opts, "options." + internalPath, prefSchema[primaryPath]);
                        }
                        $.extend(true, subPanels[safeSubPanelPrefsKey], opts);
                    }
                });

                fluid.set(templates, safeSubPanelPrefsKey, fluid.get(subPanelOptions, "template"));
                fluid.set(messages, safeSubPanelPrefsKey, fluid.get(subPanelOptions, "message"));

                fluid.set(compositePanelOptions, ["options", "selectors", safeSubPanelPrefsKey], fluid.get(subPanelOptions, "container"));
                fluid.set(compositePanelOptions, ["options", "resources"], fluid.get(compositePanelOptions, ["options", "resources"]) || {});

                fluid.prefs.addCommonOptions(compositePanelOptions.options, "resources", compositePanelBasedOnSubCommonOptions, {
                    subPrefKey: safeSubPanelPrefsKey
                });

                // add additional options from the aux schema for subpanels
                delete subPanelOptions.type;
                delete subPanelOptions.template;
                delete subPanelOptions.message;
                delete subPanelOptions.container;
                fluid.set(subPanels, [safeSubPanelPrefsKey, "options"], $.extend(true, {}, fluid.get(subPanels, [safeSubPanelPrefsKey, "options"]), subPanelOptions));

                fluid.prefs.addCommonOptions(subPanels, safeSubPanelPrefsKey, subPanelCommonOptions, {
                    compositePanel: compositeKey,
                    prefKey: safeSubPanelPrefsKey
                });
            });
            delete thisCompositeOptions.panels;

            // add additional options from the aux schema for the composite panel
            fluid.set(compositePanelOptions, ["options"], $.extend(true, {}, compositePanelOptions.options, thisCompositeOptions));
            fluid.set(compositePanelOptions, ["options", "selectorsToIgnore"], selectorsToIgnore);
            fluid.set(compositePanelOptions, ["options", "components"], subPanels);

            components[compositeKey] = compositePanelOptions;

            fluid.prefs.addCommonOptions(components, compositeKey, compositePanelCommonOptions, {
                prefKey: compositeKey
            });

            // Add onto auxSchema
            fluid.prefs.addAtPath(auxSchema, ["panels", "components"], components);
            fluid.prefs.addAtPath(auxSchema, ["panels", "selectors"], selectors);
            fluid.prefs.addAtPath(auxSchema, ["templateLoader", "templates"], templates);
            fluid.prefs.addAtPath(auxSchema, ["messageLoader", "templates"], messages);
            fluid.prefs.addAtPath(auxSchema, "rootModel", rootModel);
            $.extend(true, auxSchema, {panelsToIgnore: panelsToIgnore});
        });

        return auxSchema;
    };

    fluid.prefs.expandSchema = function (schemaToExpand, defaultNamespace, indexes, topCommonOptions, elementCommonOptions, mappedDefaults) {
        var auxSchema = fluid.prefs.expandSchemaImpl(schemaToExpand);
        auxSchema.namespace = auxSchema.namespace || defaultNamespace;

        var compositePanelList = fluid.get(auxSchema, "groups");
        if (compositePanelList) {
            fluid.prefs.expandCompositePanels(auxSchema, compositePanelList, fluid.get(indexes, "panel"),
                fluid.get(elementCommonOptions, "compositePanel"), fluid.get(elementCommonOptions, "subPanel"),
                fluid.get(elementCommonOptions, "compositePanelBasedOnSub"), mappedDefaults);
        }

        fluid.each(auxSchema, function (category, prefName) {
            // TODO: Replace this cumbersome scheme with one based on an extensible lookup to handlers
            var type = "panel";
            // Ignore the subpanels that are only for composing composite panels
            if (category[type] && $.inArray(prefName, auxSchema.panelsToIgnore) === -1) {
                fluid.prefs.expandSchemaComponents(auxSchema, "panels", category.type, category[type], fluid.get(indexes, type), fluid.get(elementCommonOptions, type), mappedDefaults);
            }
            type = "enactor";
            if (category[type]) {
                fluid.prefs.expandSchemaComponents(auxSchema, "enactors", category.type, category[type], fluid.get(indexes, type), fluid.get(elementCommonOptions, type), mappedDefaults);
            }

            type = "template";
            if (prefName === type) {
                fluid.set(auxSchema, ["templateLoader", "templates", "prefsEditor"], auxSchema[type]);
                delete auxSchema[type];
            }

            type = "templatePrefix";
            if (prefName === type) {
                fluid.prefs.expandSchemaDirectOption(auxSchema, type, "templatePrefix.templatePrefix");
            }

            type = "message";
            if (prefName === type) {
                fluid.set(auxSchema, ["messageLoader", "templates", "prefsEditor"], auxSchema[type]);
                delete auxSchema[type];
            }

            type = "messagePrefix";
            if (prefName === type) {
                fluid.prefs.expandSchemaDirectOption(auxSchema, type, "messagePrefix.messagePrefix");
            }
        });

        // Remove subPanels array. It is to keep track of the panels that are only used as sub-components of composite panels.
        if (auxSchema.panelsToIgnore) {
            delete auxSchema.panelsToIgnore;
        }

        // Add top common options
        fluid.each(topCommonOptions, function (topOptions, type) {
            fluid.prefs.addCommonOptions(auxSchema, type, topOptions);
        });

        return auxSchema;
    };

    fluid.defaults("fluid.prefs.auxBuilder", {
        gradeNames: ["fluid.prefs.auxSchema", "autoInit"],
        defaultNamespace: "fluid.prefs.create",
        mergePolicy: {
            elementCommonOptions: "noexpand"
        },
        topCommonOptions: {
            panels: {
                gradeNames: ["fluid.prefs.prefsEditor", "autoInit"]
            },
            enactors: {
                gradeNames: ["fluid.uiEnhancer", "autoInit"]
            },
            templateLoader: {
                gradeNames: ["fluid.prefs.resourceLoader", "autoInit"]
            },
            messageLoader: {
                gradeNames: ["fluid.prefs.resourceLoader", "autoInit"]
            },
            rootModel: {
                gradeNames: ["fluid.prefs.rootModel", "autoInit"]
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
                "createOnEvent": "onPrefsEditorMarkupReady",
                "container": "{prefsEditor}.dom.%prefKey",
                "options.gradeNames": "fluid.prefs.prefsEditorConnections",
                "options.resources.template": "{templateLoader}.resources.%prefKey"
            },
            compositePanel: {
                "createOnEvent": "onPrefsEditorMarkupReady",
                "container": "{prefsEditor}.dom.%prefKey",
                "options.gradeNames": ["fluid.prefs.prefsEditorConnections", "fluid.prefs.compositePanel"],
                "options.resources.template": "{templateLoader}.resources.%prefKey"
            },
            compositePanelBasedOnSub: {
                "%subPrefKey": "{templateLoader}.resources.%subPrefKey"
            },
            subPanel: {
                "createOnEvent": "initSubPanels",
                "container": "{%compositePanel}.dom.%prefKey"
            },
            enactor: {
                // Conditional handling. Add value to the path only if the execution of func returns true.
                "container": {
                    value: "{uiEnhancer}.container",
                    func: "fluid.prefs.containerNeeded"
                },
                "options.sourceApplier": "{uiEnhancer}.applier"
            }
        },
        indexes: {
            panel: {
                expander: {
                    func: "fluid.indexDefaults",
                    args: ["panelsIndex", {
                        gradeNames: "fluid.prefs.panel",
                        indexFunc: "fluid.prefs.auxBuilder.prefMapIndexer"
                    }]
                }
            },
            enactor: {
                expander: {
                    func: "fluid.indexDefaults",
                    args: ["enactorsIndex", {
                        gradeNames: "fluid.prefs.enactor",
                        indexFunc: "fluid.prefs.auxBuilder.prefMapIndexer"
                    }]
                }
            }
        },
        mappedDefaults: {},
        expandedAuxSchema: {
            expander: {
                func: "fluid.prefs.expandSchema",
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

    fluid.prefs.auxBuilder.prefMapIndexer = function (defaults) {
        return fluid.keys(defaults.preferenceMap);
    };

})(jQuery, fluid_1_5);
