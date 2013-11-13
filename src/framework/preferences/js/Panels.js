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

    /**********************
     * stringBundle grade *
     **********************/

    fluid.defaults("fluid.prefs.stringBundle", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        members: {
            stringBundle: {
                expander: {
                    funcName: "fluid.prefs.stringLookup",
                    args: ["{that}.messageResolver", "{that}.options.stringArrayIndex"]
                }
            }
        },
        stringArrayIndex: {}
    });

    fluid.prefs.stringLookup = function (messageResolver, stringArrayIndex) {
        var that = {id: fluid.allocateGuid()};
        that.singleLookup = function (value) {
            var looked = messageResolver.lookup([value]);
            return fluid.get(looked, "template");
        };
        that.multiLookup = function (values) {
            return fluid.transform(values, function (value) {
                return that.singleLookup(value);
            });
        };
        that.lookup = function (value) {
            var values = fluid.get(stringArrayIndex, value) || value;
            var lookupFn = fluid.isArrayable(values) ? "multiLookup" : "singleLookup";
            return that[lookupFn](values);
        };
        that.resolvePathSegment = that.lookup;
        return that;
    };

    /***********************************************
     * Base grade panel
     ***********************************************/

    fluid.defaults("fluid.prefs.panel", {
        gradeNames: ["fluid.rendererComponent", "fluid.prefs.stringBundle", "fluid.prefs.modelRelay", "autoInit"]
    });

    /***************************
     * Base grade for subpanel *
     ***************************/

    fluid.defaults("fluid.prefs.subPanel", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        mergePolicy: {
            sourceApplier: "nomerge"
        },
        sourceApplier: "{compositePanel}.applier",
        listeners: {
            "{compositePanel}.events.subPanelAfterRender": {
                listener: "{that}.events.afterRender",
                args: ["{that}"]
            }
        },
        rules: {
            expander: {
                func: "fluid.prefs.subPanel.generateRules",
                args: ["{that}.options.preferenceMap"]
            }
        },
        model: {
            expander: {
                func: "fluid.prefs.subPanel.getInitialModel",
                args: ["{compositePanel}.model", "{that}.options.preferenceMap"]
            }
        },
        invokers: {
            refreshView: "{compositePanel}.refreshView"
        },
        strings: {},
        parentBundle: "{compositePanel}.messageResolver",
        renderOnInit: false
    });

    fluid.prefs.subPanel.safePrefKey = function (prefKey) {
        return prefKey.replace(/[.]/g, "_");
    };

    /*
     * Generates the model relay rules for a subpanel.
     * Takes advantage of the fact that compositePanel
     * uses the preference key (with "." replaced by "_"),
     * as its model path.
     */
    fluid.prefs.subPanel.generateRules = function (preferenceMap) {
        var rules = {};
        fluid.each(preferenceMap, function (prefObj, prefKey) {
            $.each(prefObj, function (prefRule) {
                if (prefRule.indexOf("model.") === 0) {
                    rules[fluid.prefs.subPanel.safePrefKey(prefKey)] = prefRule.slice(6);
                }
            });
        });
        return rules;
    };

    fluid.prefs.subPanel.getInitialModel = function (parentModel, preferenceMap) {
        var initialModel = {};
        fluid.each(preferenceMap, function (prefObj, prefKey) {
            $.each(prefObj, function (prefRule) {
                if (prefRule.indexOf("model.") === 0) {
                    fluid.set(initialModel, prefRule.slice(6), fluid.get(parentModel, fluid.prefs.subPanel.safePrefKey(prefKey)));
                }
            });
        });
        return initialModel;
    };

    /**********************************
     * Base grade for composite panel *
     **********************************/

    fluid.registerNamespace("fluid.prefs.compositePanel");

    fluid.prefs.compositePanel.arrayMergePolicy = function (target, source) {
        target = fluid.makeArray(target);
        source = fluid.makeArray(source);
        fluid.each(source, function (selector) {
            if ($.inArray(selector, target) < 0) {
                target.push(selector);
            }
        });
        return target;
    };

    fluid.defaults("fluid.prefs.compositePanel", {
        gradeNames: ["fluid.prefs.panel", "autoInit", "{that}.getDistributeOptionsGrade"],
        mergePolicy: {
            subPanelOverrides: "noexpand",
            selectorsToIgnore: fluid.prefs.compositePanel.arrayMergePolicy
        },
        selectors: {}, // requires selectors into the template which will act as the containers for the subpanels
        selectorsToIgnore: [], // should match the selectors that are used to identify the containers for the subpanels
        repeatingSelectors: [],
        events: {
            initSubPanels: null,
            subPanelAfterRender: null
        },
        listeners: {
            "onCreate.combineResources": "{that}.combineResources",
            "onCreate.appendTemplate": {
                "this": "{that}.container",
                "method": "append",
                "args": ["{that}.options.resources.template.resourceText"]
            },
            "onCreate.initSubPanels": "{that}.events.initSubPanels",
            "onCreate.surfaceSubpanelRendererSelectors": "{that}.surfaceSubpanelRendererSelectors",
            "afterRender.initSubPanels": "{that}.events.initSubPanels",
            "afterRender.subPanelRelay": {
                listener: "{that}.events.subPanelAfterRender",
                priority: "last"
            }
        },
        invokers: {
            getDistributeOptionsGrade: {
                funcName: "fluid.prefs.compositePanel.assembleDistributeOptions",
                args: ["{that}.options.components"]
            },
            combineResources: {
                funcName: "fluid.prefs.compositePanel.combineTemplates",
                args: ["{that}.options.resources", "{that}.options.selectors"]
            },
            surfaceSubpanelRendererSelectors: {
                funcName: "fluid.prefs.compositePanel.surfaceSubpanelRendererSelectors",
                args: ["{that}", "{that}.options.components", "{that}.options.selectors"]
            },
            produceSubPanelTrees: {
                funcName: "fluid.prefs.compositePanel.produceSubPanelTrees",
                args: ["{that}"]
            },
            expandProtoTree: {
                funcName: "fluid.prefs.compositePanel.expandProtoTree",
                args: ["{that}"]
            },
            produceTree: {
                funcName: "fluid.prefs.compositePanel.produceTree",
                args: ["{that}"]
            }
        },
        subPanelOverrides: {
            gradeNames: ["fluid.prefs.subPanel"]
        },
        rendererFnOptions: {
            noexpand: true,
            cutpointGenerator: "fluid.prefs.compositePanel.cutpointGenerator",
            subPanelRepeatingSelectors: {
                expander: {
                    funcName: "fluid.prefs.compositePanel.surfaceRepeatingSelectors",
                    args: ["{that}.options.components"]
                }
            }
        },
        components: {},
        resources: {} // template is reserved for the compositePanel's template, the subpanel template should have same key as the selector for its container.
    });

    /*
     * Attempts to prefetch a components options before it is instantiated.
     * Only use in cases where the instatiated component cannot be used.
     */
    fluid.prefs.compositePanel.prefetchComponentOptions = function (type, options) {
        var baseOptions = fluid.getGradedDefaults(type, fluid.get(options, "gradeNames"));
        return fluid.merge(baseOptions.mergePolicy, baseOptions, options);
    };
    /*
     * Should only be used when fluid.prefs.compositePanel.isActivatePanel cannot.
     * While this implementation doesn't require an instantiated component, it may in
     * the process miss some configuration provided by distribute options and demands.
     */
    fluid.prefs.compositePanel.isPanel = function (type, options) {
        var opts = fluid.prefs.compositePanel.prefetchComponentOptions(type, options);
        return fluid.hasGrade(opts, "fluid.prefs.panel");
    };

    fluid.prefs.compositePanel.isActivePanel = function (comp) {
        return comp && fluid.hasGrade(comp.options, "fluid.prefs.panel");
    };

    /*
     * Creates a grade containing the distributeOptions rules needed for the subcomponents
     */
    fluid.prefs.compositePanel.assembleDistributeOptions = function (components) {
        var gradeName = "fluid.prefs.compositePanel.distributeOptions";
        var distributeRules = [];
        $.each(components, function (componentName, componentOptions) {
            if (fluid.prefs.compositePanel.isPanel(componentOptions.type, componentOptions.options)) {
                distributeRules.push({
                    source: "{that}.options.subPanelOverrides",
                    target: "{that > " + componentName + "}.options"
                });
            }
        });

        fluid.defaults(gradeName, {
            gradeNames: ["fluid.littleComponent", "autoInit"],
            distributeOptions: distributeRules
        });

        return gradeName;
    };

    /*
     * Use the renderer directly to combine the templates into a single
     * template to be used by the components actual rendering.
     */
    fluid.prefs.compositePanel.combineTemplates = function (resources, selectors) {
        var cutpoints = [];
        var tree = {children: []};

        fluid.each(resources, function (resource, resourceName) {
            if (resourceName !== "template") {
                tree.children.push({
                    ID: resourceName,
                    markup: resource.resourceText
                });
                cutpoints.push({
                    id: resourceName,
                    selector: selectors[resourceName]
                });
            }
        });

        var resourceSpec = {
            base: {
                resourceText: resources.template.resourceText,
                href: ".",
                resourceKey: ".",
                cutpoints: cutpoints
            }
        };

        var templates = fluid.parseTemplates(resourceSpec, ["base"]);
        var renderer = fluid.renderer(templates, tree, {cutpoints: cutpoints, debugMode: true});
        resources.template.resourceText = renderer.renderTemplates();
    };

    fluid.prefs.compositePanel.rebaseSelectorName = function (memberName, selectorName) {
        return memberName + "_" + selectorName;
    };

    /*
     * Surfaces the rendering selectors from the subpanels to the compositePanel,
     * and scopes them to the subpanel's container.
     */
    fluid.prefs.compositePanel.surfaceSubpanelRendererSelectors = function (that, components, selectors) {
        fluid.each(components, function (compOpts, compName) {
            var comp = that[compName];
            if (fluid.prefs.compositePanel.isActivePanel(comp)) {
                fluid.each(comp.options.selectors, function (selector, selName) {
                    if (!comp.options.selectorsToIgnore || $.inArray(selName, comp.options.selectorsToIgnore) < 0) {
                        fluid.set(selectors,  fluid.prefs.compositePanel.rebaseSelectorName(compName, selName), selectors[compName] + " " + selector);
                    }
                });
            }
        });
    };

    fluid.prefs.compositePanel.surfaceRepeatingSelectors = function (components) {
        var repeatingSelectors = [];
        fluid.each(components, function (compOpts, compName) {
            if (fluid.prefs.compositePanel.isPanel(compOpts.type, compOpts.options)) {
                var opts = fluid.prefs.compositePanel.prefetchComponentOptions(compOpts.type, compOpts.options);
                var rebasedRepeatingSelectors = fluid.transform(opts.repeatingSelectors, function (selector) {
                    return fluid.prefs.compositePanel.rebaseSelectorName(compName, selector);
                });
                repeatingSelectors = repeatingSelectors.concat(rebasedRepeatingSelectors);
            }
        });
        return repeatingSelectors;
    };

    fluid.prefs.compositePanel.cutpointGenerator = function (selectors, options) {
        var opts = {
            selectorsToIgnore: options.selectorsToIgnore,
            repeatingSelectors: options.repeatingSelectors.concat(options.subPanelRepeatingSelectors)
        };
        return fluid.renderer.selectorsToCutpoints(selectors, opts);
    };

    fluid.prefs.compositePanel.rebaseID = function (value, memberName) {
        return memberName + "_" + value;
    };

    fluid.prefs.compositePanel.rebaseParentRelativeID = function (val, memberName) {
        var slicePos = "..::".length; // ..:: refers to the parentRelativeID prefix used in the renderer
        return val.slice(0, slicePos) + fluid.prefs.compositePanel.rebaseID(val.slice(slicePos), memberName);
    };

    fluid.prefs.compositePanel.rebaseValueBinding = function (value, modelRelayRules) {
        return fluid.find(modelRelayRules, function (oldModelPath, newModelPath) {
            if (value === oldModelPath) {
                return newModelPath;
            } else if (value.indexOf(oldModelPath) === 0) {
                return value.replace(oldModelPath, newModelPath);
            }
        }) || value;
    };

    fluid.prefs.compositePanel.rebaseTree = function (tree, memberName, modelRelayRules) {
        var rebased = fluid.transform(tree, function (val, key) {
            if (key === "children") {
                return fluid.transform(val, function (v) {
                    return fluid.prefs.compositePanel.rebaseTree(v, memberName, modelRelayRules);
                });
            } else if (key === "selection") {
                return fluid.prefs.compositePanel.rebaseTree(val, memberName, modelRelayRules);
            } else if (key === "ID") {
                return fluid.prefs.compositePanel.rebaseID(val, memberName);
            } else if (key === "parentRelativeID") {
                return fluid.prefs.compositePanel.rebaseParentRelativeID(val, memberName);
            } else if (key === "valuebinding") {
                return fluid.prefs.compositePanel.rebaseValueBinding(val, modelRelayRules);
            } else {
                return val;
            }
        });

        return rebased;
    };

    fluid.prefs.compositePanel.produceTree = function (that) {
        var produceTreeOption = that.options.produceTree;
        var ownTree = produceTreeOption ?
            (typeof (produceTreeOption) === "string" ? fluid.getGlobalValue(produceTreeOption) : produceTreeOption)(that) :
            that.expandProtoTree();
        var subPanelTree = that.produceSubPanelTrees();
        var tree = {
            children: ownTree.children.concat(subPanelTree.children)
        };
        return tree;
    };

    fluid.prefs.compositePanel.expandProtoTree = function (that) {
        var expanderOptions = fluid.renderer.modeliseOptions(that.options.expanderOptions, {ELstyle: "${}"}, that);
        var expander = fluid.renderer.makeProtoExpander(expanderOptions, that);
        return expander(that.options.protoTree || {});
    };

    fluid.prefs.compositePanel.produceSubPanelTrees = function (that) {
        var tree = {children: []};
        fluid.each(that.options.components, function (options, componentName) {
            var subPanel = that[componentName];
            if (fluid.prefs.compositePanel.isActivePanel(subPanel)) {
                var expanderOptions = fluid.renderer.modeliseOptions(subPanel.options.expanderOptions, {ELstyle: "${}"}, subPanel);
                var expander = fluid.renderer.makeProtoExpander(expanderOptions, subPanel);
                var subTree = subPanel.produceTree();
                subTree = fluid.get(subPanel.options, "rendererFnOptions.noexpand") ? subTree : expander(subTree);
                var rebasedTree = fluid.prefs.compositePanel.rebaseTree(subTree, componentName, subPanel.options.rules);
                tree.children = tree.children.concat(rebasedTree.children);
            }
        });
        return tree;
    };

    /********************************************************************************
     * The grade that contains the connections between a panel and the prefs editor *
     ********************************************************************************/

    fluid.defaults("fluid.prefs.prefsEditorConnections", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        mergePolicy: {
            sourceApplier: "nomerge"
        },
        sourceApplier: "{fluid.prefs.prefsEditor}.applier",
        listeners: {
            "{fluid.prefs.prefsEditor}.events.onPrefsEditorRefresh": "{fluid.prefs.panel}.refreshView"
        },
        strings: {},
        parentBundle: "{fluid.prefs.prefsEditorLoader}.msgBundle"
    });

    /********************************
     * Preferences Editor Text Size *
     ********************************/

    /**
     * A sub-component of fluid.prefs that renders the "text size" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panel.textSize", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.textSize": {
                "model.textSize": "default",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        // The default model values represent both the expected format as well as the setting to be applied in the absence of values passed down to the component.
        // i.e. from the settings store, or specific defaults derived from schema.
        // Note: Except for being passed down to its subcomponent, these default values are not contributed and shared out
        range: {
            min: 1,
            max: 2
        },
        selectors: {
            textSize: ".flc-prefsEditor-min-text-size",
            label: ".flc-prefsEditor-min-text-size-label",
            smallIcon: ".flc-prefsEditor-min-text-size-smallIcon",
            largeIcon: ".flc-prefsEditor-min-text-size-largeIcon",
            multiplier: ".flc-prefsEditor-multiplier"
        },
        protoTree: {
            label: {messagekey: "textSizeLabel"},
            smallIcon: {messagekey: "textSizeSmallIcon"},
            largeIcon: {messagekey: "textSizeLargeIcon"},
            multiplier: {messagekey: "multiplier"},
            textSize: {
                decorators: {
                    type: "fluid",
                    func: "fluid.textfieldSlider",
                    options: {
                        rules: {
                            "textSize": "value"
                        },
                        model: {
                            value: "{that}.model.textSize"
                        },
                        sourceApplier: "{that}.applier",
                        range: "{that}.options.range",
                        sliderOptions: "{that}.options.sliderOptions"
                    }
                }
            }
        },
        sliderOptions: {
            orientation: "horizontal",
            step: 0.1,
            range: "min"
        }
    });

    /********************************
     * Preferences Editor Text Font *
     ********************************/

    /**
     * A sub-component of fluid.prefs that renders the "text font" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panel.textFont", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.textFont": {
                "model.value": "default",
                "controlValues.textFont": "enum"
            }
        },
        selectors: {
            textFont: ".flc-prefsEditor-text-font",
            label: ".flc-prefsEditor-text-font-label"
        },
        stringArrayIndex: {
            textFont: ["textFont-default", "textFont-times", "textFont-comic", "textFont-arial", "textFont-verdana"]
        },
        protoTree: {
            label: {messagekey: "textFontLabel"},
            textFont: {
                optionnames: "${{that}.stringBundle.textFont}",
                optionlist: "${{that}.options.controlValues.textFont}",
                selection: "${value}",
                decorators: {
                    type: "fluid",
                    func: "fluid.prefs.selectDecorator",
                    options: {
                        styles: "{that}.options.classnameMap.textFont"
                    }
                }
            }
        },
        classnameMap: null, // must be supplied by implementors
        controlValues: {
            textFont: ["default", "times", "comic", "arial", "verdana"]
        }
    });

    /*********************************
     * Preferences Editor Line Space *
     *********************************/

    /**
     * A sub-component of fluid.prefs that renders the "line space" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panel.lineSpace", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.lineSpace": {
                "model.lineSpace": "default",
                "range.min": "minimum",
                "range.max": "maximum"
            }
        },
        // The default model values represent both the expected format as well as the setting to be applied in the absence of values passed down to the component.
        // i.e. from the settings store, or specific defaults derived from schema.
        // Note: Except for being passed down to its subcomponent, these default values are not contributed and shared out
        range: {
            min: 1,
            max: 2
        },
        selectors: {
            lineSpace: ".flc-prefsEditor-line-space",
            label: ".flc-prefsEditor-line-space-label",
            narrowIcon: ".flc-prefsEditor-line-space-narrowIcon",
            wideIcon: ".flc-prefsEditor-line-space-wideIcon",
            multiplier: ".flc-prefsEditor-multiplier"
        },
        protoTree: {
            label: {messagekey: "lineSpaceLabel"},
            narrowIcon: {messagekey: "lineSpaceNarrowIcon"},
            wideIcon: {messagekey: "lineSpaceWideIcon"},
            multiplier: {messagekey: "multiplier"},
            lineSpace: {
                decorators: {
                    type: "fluid",
                    func: "fluid.textfieldSlider",
                    options: {
                        rules: {
                            "lineSpace": "value"
                        },
                        model: {
                            value: "{that}.model.lineSpace"
                        },
                        sourceApplier: "{that}.applier",
                        range: "{that}.options.range",
                        sliderOptions: "{that}.options.sliderOptions"
                    }
                }
            }
        },
        sliderOptions: {
            orientation: "horizontal",
            step: 0.1,
            range: "min"
        }
    });

    /*******************************
     * Preferences Editor Contrast *
     *******************************/

    /**
     * A sub-component of fluid.prefs that renders the "contrast" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panel.contrast", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.contrast": {
                "model.value": "default",
                "controlValues.theme": "enum"
            }
        },
        listeners: {
            afterRender: "{that}.style"
        },
        selectors: {
            themeRow: ".flc-prefsEditor-themeRow",
            themeLabel: ".flc-prefsEditor-theme-label",
            themeInput: ".flc-prefsEditor-themeInput",
            label: ".flc-prefsEditor-contrast-label"
        },
        stringArrayIndex: {
            theme: ["contrast-default", "contrast-bw", "contrast-wb", "contrast-by", "contrast-yb", "contrast-lgdg"]
        },
        repeatingSelectors: ["themeRow"],
        protoTree: {
            label: {messagekey: "contrastLabel"},
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "themeRow",
                labelID: "themeLabel",
                inputID: "themeInput",
                selectID: "theme-radio",
                tree: {
                    optionnames: "${{that}.stringBundle.theme}",
                    optionlist: "${{that}.options.controlValues.theme}",
                    selection: "${value}"
                }
            }
        },
        controlValues: {
            theme: ["default", "bw", "wb", "by", "yb", "lgdg"]
        },
        markup: {
            label: "<span class=\"fl-preview-A\">A</span><span class=\"fl-hidden-accessible\">%theme</span><div class=\"fl-crossout\"></div>"
        },
        invokers: {
            style: {
                funcName: "fluid.prefs.panel.contrast.style",
                args: [
                    "{that}.dom.themeLabel", "{that}.stringBundle.theme",
                    "{that}.options.markup.label", "{that}.options.controlValues.theme",
                    "{that}.options.classnameMap.theme"
                ],
                dynamic: true
            }
        }
    });

    fluid.prefs.panel.contrast.style = function (labels, strings, markup, theme, style) {
        fluid.each(labels, function (label, index) {
            label = $(label);
            label.html(fluid.stringTemplate(markup, {
                theme: strings[index]
            }));
            label.addClass(style[theme[index]]);
        });
    };

    /**************************************
     * Preferences Editor Layout Controls *
     **************************************/

    /**
     * A sub-component of fluid.prefs that renders the "layout and navigation" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panel.layoutControls", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.tableOfContents": {
                "model.toc": "default"
            }
        },
        selectors: {
            toc: ".flc-prefsEditor-toc",
            label: ".flc-prefsEditor-toc-label",
            choiceLabel: ".flc-prefsEditor-toc-choice-label"
        },
        protoTree: {
            label: {messagekey: "tocLabel"},
            choiceLabel: {messagekey: "tocChoiceLabel"},
            toc: "${toc}"
        }
    });

    /**************************************
     * Preferences Editor Emphasize Links *
     **************************************/
    /**
     * A sub-component of fluid.prefs that renders the "links and buttons" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panel.emphasizeLinks", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.emphasizeLinks": {
                "model.links": "default"
            }
        },
        selectors: {
            links: ".flc-prefsEditor-links",
            linksChoiceLabel: ".flc-prefsEditor-links-choice-label"
        },
        protoTree: {
            linksChoiceLabel: {messagekey: "linksChoiceLabel"},
            links: "${links}"
        }
    });

    /************************************
     * Preferences Editor Inputs Larger *
     ************************************/
    /**
     * A sub-component of fluid.prefs that renders the "links and buttons" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panel.inputsLarger", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.inputsLarger": {
                "model.inputsLarger": "default"
            }
        },
        selectors: {
            inputsLarger: ".flc-prefsEditor-inputs-larger",
            inputsChoiceLabel: ".flc-prefsEditor-links-inputs-choice-label"
        },
        protoTree: {
            inputsChoiceLabel: {messagekey: "inputsChoiceLabel"},
            inputsLarger: "${inputsLarger}"
        }
    });

    /*************************************
     * Preferences Editor Links Controls *
     *************************************/
    /**
     * A sub-component of fluid.prefs that renders the "links and buttons" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panel.linksControls", {
        gradeNames: ["fluid.prefs.compositePanel", "autoInit"],
        selectors: {
            label: ".flc-prefsEditor-linksControls-label"
        },
        protoTree: {
            label: {messagekey: "linksControlsLabel"}
        }
    });

    /********************************************************
     * Preferences Editor Select Dropdown Options Decorator *
     ********************************************************/

    /**
     * A sub-component that decorates the options on the select dropdown list box with the css style
     */
    fluid.defaults("fluid.prefs.selectDecorator", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        listeners: {
            onCreate: "fluid.prefs.selectDecorator.decorateOptions"
        },
        styles: {
            preview: "fl-preview-theme"
        }
    });

    fluid.prefs.selectDecorator.decorateOptions = function (that) {
        fluid.each($("option", that.container), function (option) {
            var styles = that.options.styles;
            $(option).addClass(styles.preview + " " + styles[fluid.value(option)]);
        });
    };

})(jQuery, fluid_1_5);
