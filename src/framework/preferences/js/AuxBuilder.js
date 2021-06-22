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

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("fluid.prefs");

    /*******************************************************************************
     * Base auxiliary schema grade
     *******************************************************************************/

    /**
     * The Auxiliary Schema configuration for a preference's corresponding panel (adjuster) component. Any additional
     * properties, other than those specified below, will be passed along as top level options to the panel component.
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
     */

    /**
     * The Auxiliary Schema configuration for a preference's corresponding enactor component. Any additional properties,
     * other than those specified below, will be passed along as top level options to the enactor component.
     *
     * @typedef {Object} EnactorAuxConfig
     * @property {String} type - The grade name for the enactor component
     * @property {Selector} [container] - The CSS selector to find a single DOM element to use as the component's
     *                                    container.
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
     * The configuration of the preference panels within a composite panel. The `always` property identifies the
     * the preferences that should always be visible. These always visible preferences can, in turn, be used to
     * identify which other preferences in the composite panel are displayed when it is enabled. To define this, the
     * key {String} is the name of the always on preference, and the value {String[]} is a list of preferences to be
     * displayed when it is enabled.
     *
     * @typedef {Object} CompositePanelPanelsDefinition
     * @property {String[]} always - An array of preferences for whose related panel should always be visible in the
     *                               composite panel.
     */

    /**
     * The Auxiliary Schema configuration composing multiple preferences into a single panel. Can also configure a
     * preference to control the visibility of the other preference adjusters contained within the same panel.
     *
     * @typedef {Object} CompositePanelAuxConfig
     * @property {Object} type - The grade name for the composite panel component
     * @property {Selector} container - The CSS selector to find a single DOM element to use as the component's
     *                                  container.
     * @property {URL} template - The URL path to the HTML template used by the component. It may contain string
     *                            templating tokens (%tokenName) which will be expanded with values stored in the
     *                            {AuxiliarySchema} terms Object.
     * @property {URL} message - The URL path to the JSON message bundle used by the component. It may contain string
     *                           templating tokens (%tokenName) which will be expanded with values stored in the
     *                           {AuxiliarySchema} terms Object.
     * @property {CompositePanelPanelsDefinition} panels - The definition of which panels are to be included in the
     */

    /**
     * A set of {CompositePanelAuxConfig} defining how to compose groups of preference panels. The key can be any
     * {String} name that appropriately identifies the grouping of preferences.
     *
     * @typedef {Object} CompositePanelsAuxConfig
     */

    /**
     * The Auxiliary Schema provides the configuration for a preference editor including the information for which
     * preferences to configure with which panels (adjusters) and enactors. Auxiliary schemas can be merged together
     * allowing for individual auxiliary schemas for each preference; which are combined together for a particular
     * preference editor/enhancer instance. In addition the properties specified below, {PreferenceAuxConfig} should be
     * added, using the preference name as the key, to define which preferences to use and how they are configured.
     *
     * @typedef {Object} AuxiliarySchema
     * @property {String[]} [loaderGrades] - An array of grade names that will be applied to the PrefsEditorLoader component.
     *                                     This can be used to set the type of prefs editor used (e.g. separated panel,
     *                                     full page, full page with preview).
     * @property {Boolean} [generatePanelContainers] - Indicate if the panel containers should be generated. If false
     *                                                 it is expected that the supplied template alread contains all of
     *                                                 the necessary container elements.
     * @property {URL} [template] - The URL path to the HTML template used by the Preference Editor. It may contain string
     *                            templating tokens (%tokenName) which will be expanded with values stored in the
     *                            `terms` property.
     * @property {URL} [message] - The URL path to the JSON message bundle used by the Preference Editor. It may contain
     *                           string templating tokens (%tokenName) which will be expanded with values stored in the
     *                           `terms` property.
     * @property {Object} [terms] - An object containing key/value pairs of tokens/path segments for interpolating into
     *                              the various `template` and `message` URLs.
     * @property {String} [namespace] - A namespace to use for the generated grades.
     * @property {CompositePanelsAuxConfig} [groups] - The configuration defining the composition of groups of preferences
     */

    /**
     * A processed, or processing, version of an {AuxiliarySchema}. The defined {PreferenceAuxConfig} preferences
     * remain, but other top level properties are transformed into the various grade definition options.
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

    /**
     * Applies a set of options onto the supplied `root` object at the specified `path`. Values are typically replaced
     * with the exception of `gradeNames` properties, which are concatenated together. The `commonOptions` can also
     * contain string tokens (%tokenName) which will be replaced with the related values from the `templateValues`.
     * @param  {Object} root - Any object, but typically a Component option definition or portion there of.
     * @param  {String|String[]} path - The EL path to property within the `root` to apply the `commonOptions`
     * @param  {Object} commonOptions - The options to apply to the `root` object at the specified `path`. May include
     *                                  string tokens (%tokenName) to be sourced from `templateValues`.
     * @param  {Object.<String.String>} templateValues - A map of token names to the values which should be interpolated
     * @return {Object|undefined} - When successful nothing (Undefined) is returned and the `root` object is modified
     *                              directly. When there is no existing value in the `root` object at the specified
     *                              `path`, the `root` object itself is returned without any modifications.
     */
    fluid.prefs.addCommonOptions = function (root, path, commonOptions, templateValues) {
        templateValues = templateValues || {};

        var existingValue = fluid.get(root, path);

        // TODO: Why is the early return on no "existingValue" so important? Why is root returned?
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
            value = typeof(value) === "string" ? fluid.stringTemplate(value, templateValues) : value;

            fluid.set(opts, key, value);
        });

        fluid.set(root, path, fluid.merge(mergePolicy, existingValue, opts));
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

    /**
     * Adds implicit model relay definitions for preference aliases to the `auxSchema`.
     *
     * @param  {AuxSchema} auxSchema - The {AuxiliarySchema} being processed to add the model relay definitions to
     * @param  {String} flattenedPrefKey - The preference to associate with the alias. The preference name must have
     *                                     past through fluid.prefs.flattenName to ensure that is is in a format that
     *                                     is safe to use in IoC expressions.
     * @param  {String|String[]} aliases - One or more model names to use as model properties where the preference's
     *                                     model value will be linked.
     */
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

    /**
     * Expands the configuration from the {AuxiliarySchema} related to configuring the panel and enactor components for
     * the various preferences.
     *
     * @param  {AuxSchema} auxSchema - The {AuxiliarySchema} being processed to expand the component definitions into
     * @param  {String} type - Identifies the type of component that is being expanded; either `panels` or `enactors`
     * @param  {String} prefKey - The preference name.
     * @param  {String} alias - A model property to alias the preferences model value to
     * @param  {PanelAuxConfig|EnactorAuxConfig} componentConfig - Component configuration for the preference's enactor
     *                                                             or panel component.
     * @param  {Object} commonOptions - Additional configuration needed to mix into the enactor or panel component.
     * @param  {Object} modelCommonOptions - Configuration for relaying the enactor or panel component's model to the
     *                                       one used by the parent UI Enhancer or Prefs Editor respectively. The
     *                                       configuration can include string tokens for "%internalModelName" and
     *                                       "%externalModelName" which will be interpolated with values from the
     *                                       `preferenceMap` and the flattened preference name.
     * @param  {PrimarySchema} mappedDefaults - A primary schema for the preference
     * @return {AuxSchema} - Returns the supplied `auxSchema` with the additional modifications
     */
    fluid.prefs.expandSchemaComponents = function (auxSchema, type, prefKey, alias, componentConfig, commonOptions, modelCommonOptions, mappedDefaults) {
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

            var selectors = {};
            // only need to generate containers for panels
            if (auxSchema.generatePanelContainers && type === "panels") {
                fluid.prefs.removeKey(componentOptions, "container");
                selectors[memberName] = ".flc-prefsEditor-" + flattenedPrefKey;
            } else {
                selectors = fluid.prefs.extract(componentOptions, "container", memberName);
            }

            var prefToMemberMap = {};
            prefToMemberMap[prefKey] = memberName;

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
            fluid.prefs.mergeAtPath(auxSchema, [type, "prefToMemberMap"], prefToMemberMap);
            fluid.prefs.mergeAtPath(auxSchema, ["templateLoader", "resources"], templates);
            fluid.prefs.mergeAtPath(auxSchema, ["messageLoader", "resources"], messages);
            fluid.prefs.mergeAtPath(auxSchema, "initialModel", initialModel);

            fluid.prefs.constructAliases(auxSchema, flattenedPrefKey, alias);
        }

        return auxSchema;
    };

    /**
     * Expands the configuration from the {AuxiliarySchema} related to configuring composite panels. Composite panels
     * allow for expressing a panel that contains multiple preferences and optionally a preference that controls
     * whether the other preference panels are displayed.
     *
     * @param  {AuxSchema} auxSchema - The {AuxiliarySchema} being processed to expand the composite panel definitions
     * @param  {CompositePanelsAuxConfig} compositePanelList - The groups of preference panels.
     * @param  {Object} panelCommonOptions - Additional configuration needed to mix into the panel component.
     * @param  {Object} subPanelCommonOptions - Additional configuration needed by sub panels.
     * @param  {Object} compositePanelBasedOnSubCommonOptions - [description]
     * @param  {Object} panelModelCommonOptions - Configuration for relaying the panel component's model to the one used
     *                                            by the parent Prefs Editor. The configuration can include string
     *                                            tokens for "%internalModelName" and "%externalModelName" which will be
     *                                            interpolated with values from the `preferenceMap` and the flattened
     *                                            preference name.
     * @param  {PrimarySchema} mappedDefaults - A primary schema for the preference
     * @return {AuxSchema} - Returns the supplied `auxSchema` with the additional modifications
     */
    fluid.prefs.expandCompositePanels = function (auxSchema, compositePanelList, panelCommonOptions, subPanelCommonOptions,
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

    /**
     * Processes the auxiliary schema to output an object that contains all grade component definitions required for
     * building the preferences editor, uiEnhancer and the settings store. These grade components are: panels, enactors,
     * initialModel, messageLoader, templateLoader, terms, aliases_prefsEditor, and aliases_enhancer. These grades are
     * consumed and integrated by a `fluid.prefs.builder` component.
     *
     * @param  {String[]} [requestedPrefs] - The preferences requested by the builder
     * @param  {AuxiliarySchema} schemaToExpand - The auxiliary schema to process
     * @param  {Object} topCommonOptions - component options to apply to the various grade components.
     * @param  {Object} elementCommonOptions - component options mixed into the various
     * @param  {PrimarySchema} mappedDefaults - A Primary Schema for the requested preferences.
     * @return {AuxSchema} - The processed auxiliary schema
     */
    fluid.prefs.expandSchema = function (requestedPrefs, schemaToExpand, topCommonOptions, elementCommonOptions, mappedDefaults) {
        var schemaIndex = fluid.indexDefaults("auxSchemaIndex", {
            gradeNames: "fluid.prefs.auxSchema",
            indexFunc: "fluid.prefs.auxBuilder.defaultSchemaIndexer"
        });
        var auxGradeNames = fluid.prefs.auxBuilder.auxGradesForPrefs(schemaIndex, requestedPrefs);
        var auxGrades = auxGradeNames.map(function (gradeName) {
            return fluid.defaults(gradeName).auxiliarySchema;
        });
        var mergeArgs = [true, {}].concat(auxGrades).concat(schemaToExpand);

        var auxSchema = fluid.extend.apply(null, mergeArgs);

        auxSchema.namespace = auxSchema.namespace || "fluid.prefs.created_" + fluid.allocateGuid();

        var terms = fluid.prefs.removeKey(auxSchema, "terms");
        if (terms) {
            fluid.set(auxSchema, ["terms", "terms"], terms);
        }

        var compositePanelList = fluid.get(auxSchema, "groups");
        if (compositePanelList) {
            fluid.prefs.expandCompositePanels(auxSchema, compositePanelList,
                fluid.get(elementCommonOptions, "panel"), fluid.get(elementCommonOptions, "subPanel"),
                fluid.get(elementCommonOptions, "compositePanelBasedOnSub"), fluid.get(elementCommonOptions, "panelModel"),
                mappedDefaults);
        }

        fluid.each(auxSchema, function (category, prefName) {
            // TODO: Replace this cumbersome scheme with one based on an extensible lookup to handlers
            if (fluid.isValue(category)) {
                var panelSchemaConfig = category.panel;
                // Ignore the subpanels that are only for composing composite panels
                if (panelSchemaConfig && !fluid.contains(auxSchema.panelsToIgnore, prefName)) {
                    fluid.prefs.expandSchemaComponents(auxSchema, "panels", prefName, category.alias, panelSchemaConfig,
                        fluid.get(elementCommonOptions, "panel"), fluid.get(elementCommonOptions, "panelModel"), mappedDefaults);
                }

                var enactorSchemaConfig = category.enactor;
                if (enactorSchemaConfig) {
                    fluid.prefs.expandSchemaComponents(auxSchema, "enactors", prefName, category.alias, enactorSchemaConfig,
                        fluid.get(elementCommonOptions, "enactor"), fluid.get(elementCommonOptions, "enactorModel"), mappedDefaults);
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
        gradeNames: ["fluid.component"],
        mergePolicy: {
            elementCommonOptions: "noexpand"
        },
        // A list of all requested preferences, to be supplied by an integrator or concrete grade.
        // Typically provided through the `fluid.prefs.builder` grade.
        // requestedPrefs: [],
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
        auxiliarySchema: {
            "loaderGrades": ["fluid.prefs.separatedPanel"],
            "generatePanelContainers": true,
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
                    "{that}.options.requestedPrefs",
                    "{that}.options.auxiliarySchema",
                    "{that}.options.topCommonOptions",
                    "{that}.options.elementCommonOptions",
                    "{that}.options.schema.properties"
                ]
            }
        }
    });

    /**
     * An index function that indexes all schema grades based on their
     * preference name.
     * @param {Object} defaults -  Registered defaults for a schema grade.
     * @return {String} - A preference name.
     */
    fluid.prefs.auxBuilder.defaultSchemaIndexer = function (defaults) {
        var censoredKeys = ["defaultLocale", "groups", "loaderGrades", "message", "template", "terms"];
        return fluid.keys(fluid.censorKeys(defaults.auxiliarySchema, censoredKeys));
    };

    /**
     * An invoker method that builds a list of grades that comprise a final version of the primary schema.
     * @param {Object} schemaIndex - A global index of all schema grades registered with the framework.
     * @param {String[]} preferences - A list of the requested preferences.
     * @return {String[]} - A list of aux schema grades.
     */
    fluid.prefs.auxBuilder.auxGradesForPrefs = function (schemaIndex, preferences) {
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

})(jQuery, fluid_4_0_0);
