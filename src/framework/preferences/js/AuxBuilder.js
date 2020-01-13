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

    /*******************************************************************************
     * Base auxiliary schema grade
     *******************************************************************************/

    /**
     * The Auxiliary Schema configuration for a preference's corresponding panel (adjuster) component.
     *
     * @typedef {Object} PanelAuxConfig
     * @property {String} type - The grade name for the panel component
     * @property {Selector} container - The CSS selector to find a single DOM element to use as the component's
     *                                  container.
     * @property {URL} template - The URL path to the HTML template used by the component. It may contain string
     *                            templating tokens (%tokenName) which will be expanded with values stored in the
     *                            {AuxiliarySchema} terms Object.
     * @property {URL} message - The URL path to the JSON message bundle used by the component. It may contain string
     *                           templating tokens (%tokenName) which will be expanded with values stored in the
     *                           {AuxiliarySchema} terms Object.
     * @property {Any} [key: String] - May specify additional properties that will be passed along as top level options
     *                                 to the component.
     */

    /**
     * The Auxiliary Schema configuration for a preference's corresponding enactor component.
     *
     * @typedef {Object} EnactorAuxConfig
     * @property {String} type - The grade name for the enactor component
     * @property {Selector} [container] - The CSS selector to find a single DOM element to use as the component's
     * @property {Any} [key: String] - May specify additional properties that will be passed along as top level options
     *                                 to the component.
     */

    /**
     * The Auxiliary Schema configuration for a preference
     *
     * @typedef {Object} PreferenceAuxConfig
     * @property {String} [alias] - An alternative name to use for model values. This is useful to store or access
     *                            model values from specific property. Model values for the preference are also stored
     *                            at a property named after the preferences. Typically by replacing any "." with "_".
     * @property {EnactorAuxConfig} [enactor] - The configuration for the related enactor component
     * @property {PanelAuxConfig} [panel] - The configuration for the related panel (adjuster) component
     */

    /**
     * The Auxiliary Schema provides the configuration for a preference editor including the information for which
     * preferences to configure with which panels (adjusters) and enactors. The auxiliary schemas can be merged together
     * allowing for individual auxiliary schemas for each preference, which are combined together for a particular
     * preference editor/enhancer instance.
     *
     * @typedef {Object} AuxiliarySchema
     * @property {String[]} [loaderGrades] - An array of grade names that will be applied to the PrefsEditorLoader component.
     *                                     This can be used to set the type of prefs editor used (e.g. separated panel,
     *                                     full page, full page with preview).
     * @property {URL} [template] - The URL path to the HTML template used by the Preference Editor. It may contain string
     *                            templating tokens (%tokenName) which will be expanded with values stored in the
     *                            `terms` property.
     * @property {URL} [message] - The URL path to the JSON message bundle used by the Preference Editor. It may contain
     *                           string templating tokens (%tokenName) which will be expanded with values stored in the
     *                           `terms` property.
     * @property {Object} [terms] - An object containing key/value pairs of tokens/path segments for interpolating into
     *                              the various `template` and `message` URLs.
     * @property {String} [namespace] - A namespace to use for the generated grades.
     * @property {PreferenceAuxConfig} [key: String] - May specify any number of {PreferenceAuxConfig}'s keyed by the
     *                                                 preference name.
     */

     /**
      * An processed version of an {AuxiliarySchema}. The defined preferences remain, but other top level properties
      * are transformed into the various grade definition options.
      *
      * @typedef {Object} AuxSchema
      * @property {Object} templateLoader - Definition for constructing the `templateLoader` component
      * @property {Object} messageLoader - Definition for constructing the `messageLoader` component
      * @property {Object} terms - Definition for constructing a grade containing the `terms` options
      * @property {String} namespace - A namespace to use for the generated grades.
      * @property {Object} [panels] - Definition for constructing the Preference Editor component, including the
      *                               required panels (adjusters).
      * @property {Object} [enactors] - Definition for constructing the UI Enhancer component, including the required
      *                                 enactors.
      * @property {Object} [initialModel] - Definition for constructing a grade containing the default model values of
      *                                     the included preferences.
      * @property {Object} [aliases_prefsEditor] - Definition for constructing a grade containing the model relays from
      *                                            the preference model values to their aliases. Applied to the
      *                                            Preference Editor model.
      * @property {Object} [aliases_enhancer] - Definition for constructing a grade containing the model relays from
      *                                         the preference model values to their aliases. Applied to the UI Enhancer
      *                                         model.
      * @property {PreferenceAuxConfig} [key: String] - May specify any number of {PreferenceAuxConfig}'s keyed by the
      *                                                 preference name.
      */

    fluid.defaults("fluid.prefs.auxSchema", {
        gradeNames: ["fluid.component"],
        auxiliarySchema: {}
    });

    fluid.prefs.mergeAtPath = function (root, path, object) {
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

    /**
     * Removes the key/value at the specified `path` from the supplied `root` object. It is returned in a new object
     * either at the same path or at the provided `extractedPath`.
     *
     * @param  {Object} root - The source object to extract from
     * @param  {String|String[]} path - The path to be extracted from the `root` object
     * @param  {String|String[]} [extractedPath] - The path to write the extracted value to in the returned object
     * @return {Object} - An object containing the extracted value
     */
    fluid.prefs.extract = function (root, path, extractedPath) {
        extractedPath = fluid.isValue(extractedPath) ? extractedPath : path;
        var result = {};
        var sourceValue = fluid.prefs.removeKey(root, path);
        if (sourceValue) {
            fluid.set(result, extractedPath, sourceValue);
        }
        return result;
    };

// TODO: What does this function do? Why is the early return on no "existingValue" so important?
    fluid.prefs.addCommonOptions = function (root, path, commonOptions, templateValues) {
        templateValues = templateValues || {};

        var existingValue = fluid.get(root, path);

        if (!existingValue) {
            return root;
        }

        var opts = {}, mergePolicy = {};

        fluid.each(commonOptions, function (value, key) {
            // Adds "container" option only for view and renderer components
            if (key === "container") {
                var componentType = fluid.get(root, [path, "type"]);
                var componentOptions = fluid.defaults(componentType);
                // Note that this approach is not completely reliable, although it has been reviewed as "good enough" -
                // a grade which modifies the creation signature of its principal type would cause numerous other problems.
                // We can review this awkward kind of "anticipatory logic" when the new renderer arrives.
                if (fluid.get(componentOptions, ["argumentMap", "container"]) === undefined) {
                    return false;
                }
            }
            // Merge grade names defined in aux schema and system default grades
            if (key.indexOf("gradeNames") !== -1) {
                mergePolicy[key] = fluid.arrayConcatPolicy;
            }

            key = fluid.stringTemplate(key, templateValues);
            value = typeof (value) === "string" ? fluid.stringTemplate(value, templateValues) : value;

            fluid.set(opts, key, value);
        });

        fluid.set(root, path, fluid.merge(mergePolicy, existingValue, opts));
    };

    fluid.prefs.containerNeeded = function (root, path) {
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

    fluid.prefs.flattenName = function (name) {
        var regexp = new RegExp("\\.", "g");
        return name.replace(regexp,  "_");
    };

    fluid.prefs.constructAliases = function (auxSchema, flattenedPrefKey, aliases) {
        aliases = fluid.makeArray(aliases);

        var prefsEditorModel = {};
        var enhancerModel = {};
        fluid.each(aliases, function (alias) {
            prefsEditorModel[alias] = "{that}.model.preferences." + flattenedPrefKey;
            enhancerModel[alias] = "{that}.model." + flattenedPrefKey;
        });

        fluid.prefs.mergeAtPath(auxSchema, ["aliases_prefsEditor", "model", "preferences"], prefsEditorModel);
        fluid.prefs.mergeAtPath(auxSchema, ["aliases_enhancer", "model"], enhancerModel);
    };

    fluid.prefs.expandSchemaComponents = function (auxSchema, type, prefKey, alias, componentConfig, index, commonOptions, modelCommonOptions, mappedDefaults) {
        var componentOptions = fluid.copy(componentConfig) || {};
        var components = {};
        var initialModel = {};

        var componentName = fluid.prefs.removeKey(componentOptions, "type");
        var memberName = fluid.prefs.flattenName(componentName);
        var flattenedPrefKey = fluid.prefs.flattenName(prefKey);

        if (componentName) {

            components[memberName] = {
                type: componentName,
                options: componentOptions
            };

            var selectors = fluid.prefs.extract(componentOptions, "container", memberName);
            var templates = fluid.prefs.extract(componentOptions, "template", memberName);
            var messages = fluid.prefs.extract(componentOptions, "message", memberName);

            var preferenceMap = fluid.defaults(componentName).preferenceMap;

            var map = preferenceMap[prefKey];
            var prefSchema = mappedDefaults[prefKey];

            fluid.each(map, function (primaryPath, internalPath) {
                if (fluid.prefs.checkPrimarySchema(prefSchema, prefKey)) {
                    var opts = {};
                    if (internalPath.indexOf("model.") === 0 && primaryPath === "value") {
                        var internalModelName = internalPath.slice(6);
                        // Set up the binding in "rules" accepted by the modelRelay base grade of every panel
                        fluid.set(opts, "model", fluid.get(opts, "model") || {});
                        fluid.prefs.addCommonOptions(opts, "model", modelCommonOptions, {
                            internalModelName: internalModelName,
                            externalModelName: flattenedPrefKey
                        });
                        fluid.set(initialModel, ["members", "initialModel", "preferences", flattenedPrefKey], prefSchema["default"]);

                        if (alias) {
                            fluid.set(initialModel, ["members", "initialModel", "preferences", alias], prefSchema["default"]);
                        }
                    } else {
                        fluid.set(opts, internalPath, prefSchema[primaryPath]);
                    }
                    $.extend(true, componentOptions, opts);
                }
            });

            fluid.prefs.addCommonOptions(components, memberName, commonOptions, {
                prefKey: memberName
            });

            fluid.prefs.mergeAtPath(auxSchema, [type, "components"], components);
            fluid.prefs.mergeAtPath(auxSchema, [type, "selectors"], selectors);
            fluid.prefs.mergeAtPath(auxSchema, ["templateLoader", "resources"], templates);
            fluid.prefs.mergeAtPath(auxSchema, ["messageLoader", "resources"], messages);
            fluid.prefs.mergeAtPath(auxSchema, "initialModel", initialModel);

            fluid.prefs.constructAliases(auxSchema, flattenedPrefKey, alias);
        }

        return auxSchema;
    };

    fluid.prefs.expandCompositePanels = function (auxSchema, compositePanelList, panelIndex, panelCommonOptions, subPanelCommonOptions,
        compositePanelBasedOnSubCommonOptions, panelModelCommonOptions, mappedDefaults) {
        var panelsToIgnore = [];

        fluid.each(compositePanelList, function (compositeDetail, compositeKey) {
            var compositePanelOptions = {};
            var components = {};
            var initialModel = {};
            var selectors = {};
            var templates = {};
            var messages = {};
            var selectorsToIgnore = [];

            var thisCompositeOptions = fluid.copy(compositeDetail);
            fluid.set(compositePanelOptions, "type", thisCompositeOptions.type);
            delete thisCompositeOptions.type;

            selectors = fluid.prefs.extract(thisCompositeOptions, "container", compositeKey);
            templates = fluid.prefs.extract(thisCompositeOptions, "template", compositeKey);
            messages = fluid.prefs.extract(thisCompositeOptions, "message", compositeKey);

            var subPanelList = []; // list of subpanels to generate options for
            var subPanels = {};
            var subPanelRenderOn = {};

            // thisCompositeOptions.panels can be in two forms:
            // 1. an array of names of panels that should always be rendered;
            // 2. an object that describes what panels should always be rendered,
            //    and what panels should be rendered when a preference is turned on
            // The loop below is only needed for processing the latter.
            if (fluid.isPlainObject(thisCompositeOptions.panels) && !fluid.isArrayable(thisCompositeOptions.panels)) {
                fluid.each(thisCompositeOptions.panels, function (subpanelArray, pref) {
                    subPanelList = subPanelList.concat(subpanelArray);
                    if (pref !== "always") {
                        fluid.each(subpanelArray, function (onePanel) {
                            fluid.set(subPanelRenderOn, onePanel, pref);
                        });
                    }
                });
            } else {
                subPanelList = thisCompositeOptions.panels;
            }

            fluid.each(subPanelList, function (subPanelID) {
                panelsToIgnore.push(subPanelID);
                var safeSubPanelPrefsKey = fluid.prefs.subPanel.safePrefKey(subPanelID);
                selectorsToIgnore.push(safeSubPanelPrefsKey);

                var subPanelOptions = fluid.copy(fluid.get(auxSchema, [subPanelID, "panel"]));
                var subPanelType = fluid.get(subPanelOptions, "type");

                fluid.set(subPanels, [safeSubPanelPrefsKey, "type"], subPanelType);
                var renderOn = fluid.get(subPanelRenderOn, subPanelID);
                if (renderOn) {
                    fluid.set(subPanels, [safeSubPanelPrefsKey, "options", "renderOnPreference"], renderOn);
                }

                // Deal with preferenceMap related options
                var map = fluid.defaults(subPanelType).preferenceMap[subPanelID];
                var prefSchema = mappedDefaults[subPanelID];

                fluid.each(map, function (primaryPath, internalPath) {
                    if (fluid.prefs.checkPrimarySchema(prefSchema, subPanelID)) {
                        var opts;
                        if (internalPath.indexOf("model.") === 0 && primaryPath === "value") {
                            // Set up the binding in "rules" accepted by the modelRelay base grade of every panel
                            fluid.set(compositePanelOptions, ["options", "model"], fluid.get(compositePanelOptions, ["options", "model"]) || {});
                            fluid.prefs.addCommonOptions(compositePanelOptions, ["options", "model"], panelModelCommonOptions, {
                                internalModelName: safeSubPanelPrefsKey,
                                externalModelName: safeSubPanelPrefsKey
                            });
                            fluid.set(initialModel, ["members", "initialModel", "preferences", safeSubPanelPrefsKey], prefSchema["default"]);
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
                fluid.set(compositePanelOptions, ["options", "members", "resources"], fluid.get(compositePanelOptions, ["options", "members", "resources"]) || {});

                fluid.prefs.addCommonOptions(compositePanelOptions.options, "members.resources", compositePanelBasedOnSubCommonOptions, {
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

            fluid.prefs.addCommonOptions(components, compositeKey, panelCommonOptions, {
                prefKey: compositeKey
            });

            // Add onto auxSchema
            fluid.prefs.mergeAtPath(auxSchema, ["panels", "components"], components);
            fluid.prefs.mergeAtPath(auxSchema, ["panels", "selectors"], selectors);
            fluid.prefs.mergeAtPath(auxSchema, ["templateLoader", "resources"], templates);
            fluid.prefs.mergeAtPath(auxSchema, ["messageLoader", "resources"], messages);
            fluid.prefs.mergeAtPath(auxSchema, "initialModel", initialModel);
            $.extend(true, auxSchema, {panelsToIgnore: panelsToIgnore});
        });

        return auxSchema;
    };

    // Processes the auxiliary schema to output an object that contains all grade component definitions
    // required for building the preferences editor, uiEnhancer and the settings store. These grade components
    // are: panels, enactors, initialModel, messageLoader, templateLoader and terms.
    // These grades are consumed and integrated by builder.js
    // (https://github.com/fluid-project/infusion/blob/master/src/framework/preferences/js/Builder.js)
    fluid.prefs.expandSchema = function (schemaToExpand, indexes, topCommonOptions, elementCommonOptions, mappedDefaults) {
        var auxSchema = fluid.copy(schemaToExpand);
        auxSchema.namespace = auxSchema.namespace || "fluid.prefs.created_" + fluid.allocateGuid();

        var terms = fluid.prefs.removeKey(auxSchema, "terms");
        if (terms) {
            fluid.set(auxSchema, ["terms", "terms"], terms);
        }

        var compositePanelList = fluid.get(auxSchema, "groups");
        if (compositePanelList) {
            fluid.prefs.expandCompositePanels(auxSchema, compositePanelList, fluid.get(indexes, "panel"),
                fluid.get(elementCommonOptions, "panel"), fluid.get(elementCommonOptions, "subPanel"),
                fluid.get(elementCommonOptions, "compositePanelBasedOnSub"), fluid.get(elementCommonOptions, "panelModel"),
                mappedDefaults);
        }

        fluid.each(auxSchema, function (category, prefName) {
            // TODO: Replace this cumbersome scheme with one based on an extensible lookup to handlers
            if (fluid.isValue(category)) {
                var type = "panel";
                // Ignore the subpanels that are only for composing composite panels
                if (category[type] && !fluid.contains(auxSchema.panelsToIgnore, prefName)) {
                    fluid.prefs.expandSchemaComponents(auxSchema, "panels", prefName, category.alias, category[type], fluid.get(indexes, type),
                        fluid.get(elementCommonOptions, type), fluid.get(elementCommonOptions, type + "Model"), mappedDefaults);
                }

                type = "enactor";
                if (category[type]) {
                    fluid.prefs.expandSchemaComponents(auxSchema, "enactors", prefName, category.alias, category[type], fluid.get(indexes, type),
                        fluid.get(elementCommonOptions, type), fluid.get(elementCommonOptions, type + "Model"), mappedDefaults);
                }

                fluid.each(["template", "message"], function (type) {
                    if (prefName === type) {
                        fluid.set(auxSchema, [type + "Loader", "resources", "prefsEditor"], category);
                        delete auxSchema[type];
                    }
                });
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
        gradeNames: ["fluid.prefs.auxSchema", "{that}.buildAuxiliary"],
        mergePolicy: {
            elementCommonOptions: "noexpand"
        },
        // A list of all requested preferences, to be supplied by an integrator or concrete grade.
        // Typically provided through the `fluid.prefs.builder` grade.
        // requestedPrefs: [],
        invokers: {
            // An invoker used to generate a set of grades that comprise a
            // final version of the auxiliary schema to be used by the PrefsEditor
            // builder.
            buildAuxiliary: {
                funcName: "fluid.prefs.auxBuilder.buildAuxiliary",
                args: [
                    "{that}.options.indexes.auxSchema",
                    "{that}.options.requestedPrefs"
                ]
            }
        },
        topCommonOptions: {
            panels: {
                gradeNames: ["fluid.prefs.prefsEditor"]
            },
            enactors: {
                gradeNames: ["fluid.uiEnhancer"]
            },
            templateLoader: {
                gradeNames: ["fluid.resourceLoader"]
            },
            messageLoader: {
                gradeNames: ["fluid.resourceLoader"]
            },
            initialModel: {
                gradeNames: ["fluid.prefs.initialModel"]
            },
            terms: {
                gradeNames: ["fluid.component"]
            },
            aliases_prefsEditor: {
                gradeNames: ["fluid.modelComponent"]
            },
            aliases_enhancer: {
                gradeNames: ["fluid.modelComponent"]
            }
        },
        elementCommonOptions: {
            panel: {
                "createOnEvent": "onPrefsEditorMarkupReady",
                "container": "{prefsEditor}.dom.%prefKey",
                "options.gradeNames": "fluid.prefs.prefsEditorConnections",
                "options.members.resources.template": "{templateLoader}.resources.%prefKey",
                "options.messageBase": "{messageLoader}.resources.%prefKey.parsed"
            },
            panelModel: {
                "%internalModelName": "{prefsEditor}.model.preferences.%externalModelName"
            },
            compositePanelBasedOnSub: {
                "%subPrefKey": "{templateLoader}.resources.%subPrefKey"
            },
            subPanel: {
                "container": "{%compositePanel}.dom.%prefKey",
                "options.messageBase": "{messageLoader}.resources.%prefKey.parsed"
            },
            enactor: {
                "container": "{uiEnhancer}.container"
            },
            enactorModel: {
                "%internalModelName": "{uiEnhancer}.model.%externalModelName"
            }
        },
        indexes: {
            auxSchema: {
                expander: {
                    func: "fluid.indexDefaults",
                    args: ["auxSchemaIndex", {
                        gradeNames: "fluid.prefs.auxSchema",
                        indexFunc: "fluid.prefs.auxBuilder.defaultSchemaIndexer"
                    }]
                }
            },
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
        auxiliarySchema: {
            "loaderGrades": ["fluid.prefs.separatedPanel"],
            "template": "%templatePrefix/SeparatedPanelPrefsEditor.html",
            "message": "%messagePrefix/prefsEditor.json",
            "terms": {
                "templatePrefix": "../../framework/preferences/html",
                "messagePrefix": "../../framework/preferences/messages"
            }
        },
        auxSchema: {
            expander: {
                func: "fluid.prefs.expandSchema",
                args: [
                    "{that}.options.auxiliarySchema",
                    "{that}.options.indexes",
                    "{that}.options.topCommonOptions",
                    "{that}.options.elementCommonOptions",
                    "{that}.options.schema.properties"
                ]
            }
        }
    });

    fluid.prefs.auxBuilder.prefMapIndexer = function (defaults) {
        return fluid.keys(defaults.preferenceMap);
    };

    /**
     * An index function that indexes all schema grades based on their
     * preference name.
     * @param {Object} defaults -  Registered defaults for a schema grade.
     * @return {String}          A preference name.
     */
    fluid.prefs.auxBuilder.defaultSchemaIndexer = function (defaults) {
        var censoredKeys = ["defaultLocale", "groups", "loaderGrades", "message", "template", "terms"];
        return fluid.keys(fluid.censorKeys(defaults.auxiliarySchema, censoredKeys));
    };

    /**
     * An invoker method that builds a list of grades that comprise a final version of the primary schema.
     * @param {Object} schemaIndex - A global index of all schema grades registered with the framework.
     * @param {String[]} preferences   - A list of the requested preferences.
     * @return {String[]} - A list of schema grades.
     */
    fluid.prefs.auxBuilder.buildAuxiliary = function (schemaIndex, preferences) {
        var auxSchema = [];
        // Lookup all available schema grades from the index that match the requested preference names.
        fluid.each(preferences, function merge(pref) {
            var schemaGrades = schemaIndex[pref];
            if (schemaGrades) {
                auxSchema = auxSchema.concat(schemaGrades);
            }
        });
        return auxSchema;
    };

})(jQuery, fluid_3_0_0);
