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

    /***********************************************
     * Base grade panel
     ***********************************************/

    fluid.defaults("fluid.prefs.panel", {
        gradeNames: ["fluid.rendererComponent", "fluid.prefs.modelRelay", "autoInit"]
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
        invokers: {
            refreshView: "{compositePanel}.refreshView"
        },
        strings: {},
        // parentBundle: "", // add this in later
        renderOnInit: false
    });

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
                    rules[prefKey.replace(".", "_", "g")] = prefRule.slice(6);
                }
            });
        });
        return rules;
    };

    /*********************************
     * Base grade for combined panel *
     *********************************/

    fluid.defaults("fluid.prefs.compositePanel", {
        gradeNames: ["fluid.prefs.panel", "autoInit", "{that}.getDistributeOptionsGrade"],
        mergePolicy: {
            subPanelOverrides: "noexpand"
        },
        preferenceMap: {
            expander: {
                funcName: "fluid.prefs.compositePanel.combinePreferenceMaps",
                args: ["{that}.options.components"]
            }
        },
        selectors: {}, // requires selectors into the template which will act as the containers for the subpanels
        selectorsToIgnore: [], // should match the selectors that are used to identify the containers for the subpanels
        events: {
            initSubPanels: null,
            subPanelAfterRender: null,
        },
        listeners: {
            "onCreate.combineResources": "{that}.combineResources",
            "onCreate.surfaceSubpanelRendererSelectors": "{that}.surfaceSubpanelRendererSelectors",
            "onCreate.initSubPanels": "{that}.events.initSubPanels",
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
                args: ["{that}.options.components", "{that}.options.selectors"]
            }
        },
        subPanelOverrides: {
            gradeNames: ["fluid.prefs.subPanel"]
        },
        produceTree: "fluid.prefs.compositePanel.produceTree",
        rendererFnOptions: {
            noexpand: true
        },
        components: {},
        resources: {} // template is reserved for the compositePanel's template, the subpanel template should have same key as the selector for its container.
    });

    /*
     * Combines the preference maps of the subpanels into a single preference map,
     * to be used by the combined panel.
     * Note that this assumes the internal model paths to be the same as the
     * preference key (with "." replaced by "_").
     * Any other options mapping is done by forwarding the option down to the subpanel.
     */
    fluid.prefs.compositePanel.combinePreferenceMaps = function (components) {
        var preferenceMap = {};
        fluid.each(components, function (component, cmpName) {
            var opts = $.extend(true, {}, fluid.defaults(component.type), component.options);
            var prefMap = opts.preferenceMap;
            if (prefMap) {
                fluid.each(prefMap, function (preference, prefName) {
                    var prefObj = {};
                    fluid.each(preference, function (rule, ruleName) {
                        var mdlPrefix = "model.";
                        if (ruleName.indexOf(mdlPrefix) === 0) {
                            prefObj[mdlPrefix + prefName.replace(/[.]/g, "_")] = rule;
                        } else {
                            prefObj["components." + cmpName  + ".options." + ruleName] = rule;
                        }
                    });
                    preferenceMap[prefName] = prefObj;
                });
            }
        });
        return preferenceMap;
    };

    /*
     * Creates a grade containing the distributeOptions rules needed for the subcomponents
     */
    fluid.prefs.compositePanel.assembleDistributeOptions = function (components) {
        var gradeName = "fluid.prefs.compositePanel.distributeOptions";
        var distributeRules = [];
        $.each(components, function (componentName) {
            distributeRules.push({
                source: "{that}.options.subPanelOverrides",
                target: "{that > " + componentName + "}.options"
            });
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

    /*
     * Surfaces the rendering selectors from the subpanels to the compositePanel,
     * and scopes them to the subpanel's container.
     */
    fluid.prefs.compositePanel.surfaceSubpanelRendererSelectors = function (components, selectors) {
        fluid.each(components, function (compOpts, compName) {
            var comp = fluid.defaults(compOpts.type);
            fluid.each(comp.selectors, function (selector, selName) {
                if (!comp.selectorsToIgnore || $.inArray(selName, comp.selectorsToIgnore) < 0) {
                    fluid.set(selectors,  compName + "_" + selName, selectors[compName] + " " + selector);
                }
            });
        });
    };

    fluid.defaults("fluid.prefs.compositePanel.rebaseID", {
        gradeNames: "fluid.standardTransformFunction",
        memberName: null
    });

    fluid.prefs.compositePanel.rebaseID = function (value, transformSpec) {
        return transformSpec.memberName + "_" + value;
    };


    fluid.defaults("fluid.prefs.compositePanel.rebaseValueBinding", {
        gradeNames: "fluid.standardTransformFunction",
        rules: {}
    });

    fluid.prefs.compositePanel.rebaseValueBinding = function (value, transformSpec) {
        return fluid.find(transformSpec.rules, function (oldModelPath, newModelPath) {
            if (value === oldModelPath) {
                return newModelPath;
            }
        });
    };

    fluid.prefs.compositePanel.rebaseTreeImp = function (tree, rules) {
        var rebased = fluid.transform(tree, function (val, key) {
            if (key === "children") {
                return fluid.transform(val, function (v) {
                    return fluid.prefs.compositePanel.rebaseTreeImp(v, rules);
                });
            } else {
                return val;
            }
        });

        return fluid.model.transform(rebased, rules);
    };

    fluid.prefs.compositePanel.rebaseTree = function (tree, memberName, modelRelayRules) {
        var rules = {
            "ID": {
                transform: {
                    type: "fluid.prefs.compositePanel.rebaseID",
                    inputPath: "ID",
                    memberName: memberName
                }
            },
            "valuebinding": {
                transform: {
                    type: "fluid.prefs.compositePanel.rebaseValueBinding",
                    inputPath: "valuebinding",
                    rules: modelRelayRules
                }
            },
            "": ""
        };
        return fluid.prefs.compositePanel.rebaseTreeImp(tree, rules);
    };

    fluid.prefs.compositePanel.produceTree = function (that) {
        var tree = {children: []};
        fluid.each(that.options.components, function (options, componentName) {
            var subPanel = that[componentName];
            var expanderOptions = fluid.renderer.modeliseOptions(subPanel.options.expanderOptions, {ELstyle: "${}"}, subPanel);
            var expander = fluid.renderer.makeProtoExpander(expanderOptions, subPanel);
            var rebasedTree = fluid.prefs.compositePanel.rebaseTree(expander(subPanel.produceTree()), componentName, that[componentName].options.rules);
            tree.children = tree.children.concat(rebasedTree.children);
        });
        return tree;
    };

    /****************************************
     * Preferences Editor Text Field Slider *
     ****************************************/

    fluid.defaults("fluid.prefs.textfieldSlider", {
        gradeNames: ["fluid.textfieldSlider", "autoInit"],
        model: "{fluid.prefs.panel}.model",
        range: "{fluid.prefs.panel}.options.range",
        listeners: {
            modelChanged: {
                listener: "{fluid.prefs.panel}.applier.requestChange",
                args: ["{that}.options.path", "{arguments}.0"]
            }
        },
        path: "value",
        sliderOptions: "{fluid.prefs.panel}.options.sliderOptions"
    });

    /**************************************
     * Functions shared by several panels *
     **************************************/

    fluid.prefs.panel.lookupMsg = function (messageResolver, prefix, values) {
        var messages = [];
        fluid.each(values, function (value, key) {
            var looked = messageResolver.lookup([prefix + "." + value]);
            messages.push(looked ? looked.template : looked);
        });
        return messages;
    };

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
                "model.value": "default",
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
                    func: "fluid.prefs.textfieldSlider"
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
        strings: {
            textFont: {
                expander: {
                    func: "fluid.prefs.panel.lookupMsg",
                    args: ["{that}.options.parentBundle", "textFont", "{that}.options.controlValues.textFont"]
                }
            }
        },
        protoTree: {
            label: {messagekey: "textFontLabel"},
            textFont: {
                optionnames: "${{that}.options.strings.textFont}",
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
                "model.value": "default",
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
                    func: "fluid.prefs.textfieldSlider"
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
        strings: {
            theme: {
                expander: {
                    func: "fluid.prefs.panel.lookupMsg",
                    args: ["{that}.options.parentBundle", "contrast", "{that}.options.controlValues.theme"]
                }
            }
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
                    optionnames: "${{that}.options.strings.theme}",
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
                    "{that}.dom.themeLabel", "{that}.options.strings.theme",
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

    /*************************************
     * Preferences Editor Links Controls *
     *************************************/
    /**
     * A sub-component of fluid.prefs that renders the "links and buttons" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panel.linksControls", {
        gradeNames: ["fluid.prefs.panel", "autoInit"],
        preferenceMap: {
            "fluid.prefs.emphasizeLinks": {
                "model.links": "default"
            },
            "fluid.prefs.inputsLarger": {
                "model.inputsLarger": "default"
            }
        },
        selectors: {
            links: ".flc-prefsEditor-links",
            inputsLarger: ".flc-prefsEditor-inputs-larger",
            label: ".flc-prefsEditor-links-label",
            linksChoiceLabel: ".flc-prefsEditor-links-choice-label",
            inputsChoiceLabel: ".flc-prefsEditor-links-inputs-choice-label"
        },
        protoTree: {
            label: {messagekey: "linksLabel"},
            linksChoiceLabel: {messagekey: "linksChoiceLabel"},
            inputsChoiceLabel: {messagekey: "inputsChoiceLabel"},
            links: "${links}",
            inputsLarger: "${inputsLarger}"
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
