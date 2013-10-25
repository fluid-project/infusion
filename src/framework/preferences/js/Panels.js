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
     * Base grade panels
     ***********************************************/

    fluid.defaults("fluid.prefs.panels", {
        gradeNames: ["fluid.rendererComponent", "fluid.prefs.stringBundle", "fluid.prefs.modelRelay", "autoInit"],
    });

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
            "{fluid.prefs.prefsEditor}.events.onPrefsEditorRefresh": "{fluid.prefs.panels}.refreshView"
        },
        strings: {},
        parentBundle: "{fluid.prefs.prefsEditorLoader}.msgBundle"
    });

    /****************************************
     * Preferences Editor Text Field Slider *
     ****************************************/

    fluid.defaults("fluid.prefs.textfieldSlider", {
        gradeNames: ["fluid.textfieldSlider", "autoInit"],
        model: "{fluid.prefs.panels}.model",
        range: "{fluid.prefs.panels}.options.range",
        listeners: {
            modelChanged: {
                listener: "{fluid.prefs.panels}.applier.requestChange",
                args: ["{that}.options.path", "{arguments}.0"]
            }
        },
        path: "value",
        sliderOptions: "{fluid.prefs.panels}.options.sliderOptions"
    });

    /********************************
     * Preferences Editor Text Size *
     ********************************/

    /**
     * A sub-component of fluid.prefs that renders the "text size" panel of the user preferences interface.
     */
    fluid.defaults("fluid.prefs.panels.textSize", {
        gradeNames: ["fluid.prefs.panels", "autoInit"],
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
    fluid.defaults("fluid.prefs.panels.textFont", {
        gradeNames: ["fluid.prefs.panels", "autoInit"],
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
    fluid.defaults("fluid.prefs.panels.lineSpace", {
        gradeNames: ["fluid.prefs.panels", "autoInit"],
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
    fluid.defaults("fluid.prefs.panels.contrast", {
        gradeNames: ["fluid.prefs.panels", "autoInit"],
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
                funcName: "fluid.prefs.panels.contrast.style",
                args: [
                    "{that}.dom.themeLabel", "{that}.stringBundle.theme",
                    "{that}.options.markup.label", "{that}.options.controlValues.theme",
                    "{that}.options.classnameMap.theme"
                ],
                dynamic: true
            }
        }
    });

    fluid.prefs.panels.contrast.style = function (labels, strings, markup, theme, style) {
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
    fluid.defaults("fluid.prefs.panels.layoutControls", {
        gradeNames: ["fluid.prefs.panels", "autoInit"],
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
    fluid.defaults("fluid.prefs.panels.linksControls", {
        gradeNames: ["fluid.prefs.panels", "autoInit"],
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
