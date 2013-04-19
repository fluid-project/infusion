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

    /*************************
     * UI Options Text Sizer *
     *************************/

    fluid.defaults("fluid.uiOptions.textfieldSlider", {
        gradeNames: ["fluid.textfieldSlider", "autoInit"],
        path: "value",
        listeners: {
            modelChanged: {
                listener: "{fluid.uiOptions.settingsPanel}.applier.requestChange",
                args: ["{that}.options.path", "{arguments}.0"]
            }
        },
        model: "{fluid.uiOptions.settingsPanel}.model",
        sliderOptions: "{fluid.uiOptions.settingsPanel}.options.sliderOptions"
    });

    /**
     * A sub-component of fluid.uiOptions that renders the "text size" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.textSizer", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        // The default model values reprsent both the expected format as well as the setting to be applied in the absence of values passed down to the component.
        // i.e. from the settings store, or specific defaults derived from schema.
        // Note: Except for being passed down to its subcomponent, these default values are not contributed and shared out
        model: {
            value: 1,
            min: 1,
            max: 2
        },
        sliderOptions: {
            orientation: "horizontal",
            step: 0.1
        },
        selectors: {
            textSize: ".flc-uiOptions-min-text-size"
        },
        protoTree: {
            textSize: {
                decorators: {
                    type: "fluid",
                    func: "fluid.uiOptions.textfieldSlider"
                }
            }
        }
    });
    
    /************************
     * UI Options Text Font *
     ************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "text font" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.textFont", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        // The default model value reprsents both the expected format as well as the setting to be applied in the absence of a value passed down to the component.
        // i.e. from the settings store, or specific defaults derived from schema.
        // Note: This default value is not contributed and shared out
        model: {
            value: "default"
        },
        classnameMap: null, // must be supplied by implementors
        strings: {
            textFont: ["Default", "Times New Roman", "Comic Sans", "Arial", "Verdana"]
        },
        controlValues: { 
            textFont: ["default", "times", "comic", "arial", "verdana"]
        },
        selectors: {
            textFont: ".flc-uiOptions-text-font"
        },
        produceTree: "fluid.uiOptions.textFont.produceTree"
    });
    
    fluid.uiOptions.textFont.produceTree = function (that) {
        // render drop down list box
        return {
            textFont: {
                optionnames: that.options.strings.textFont,
                optionlist: that.options.controlValues.textFont,
                selection: "${value}",
                decorators: {
                    type: "fluid",
                    func: "fluid.uiOptions.selectDecorator",
                    options: {
                        styles: that.options.classnameMap.textFont
                    }
                }
            }
        };
    };
    
    /**************************
     * UI Options Line Spacer *
     **************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "line spacing" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.lineSpacer", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        // The default model values reprsent both the expected format as well as the setting to be applied in the absence of values passed down to the component.
        // i.e. from the settings store, or specific defaults derived from schema.
        // Note: Except for being passed down to its subcomponent, these default values are not contributed and shared out
        model: {
            value: 1,
            min: 1,
            max: 2
        },
        sliderOptions: {
            orientation: "horizontal",
            step: 0.1
        },
        selectors: {
            lineSpacing: ".flc-uiOptions-line-spacing"
        },
        protoTree: {
            lineSpacing: {
                decorators: {
                    type: "fluid",
                    func: "fluid.uiOptions.textfieldSlider"
                }
            }
        }
    });
    
    /***********************
     * UI Options Contrast *
     ***********************/

    /**
     * A sub-component of fluid.uiOptions that renders the "contrast" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.contrast", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        // The default model value reprsents both the expected format as well as the setting to be applied in the absence of a value passed down to the component.
        // i.e. from the settings store, or specific defaults derived from schema.
        // Note: This default value is not contributed and shared out
        model: {
            value: "default"
        },
        strings: {
            theme: ["Default", "Black on white", "White on black", "Black on yellow", "Yellow on black"]
        },
        controlValues: { 
            theme: ["default", "bw", "wb", "by", "yb"]
        },
        selectors: {
            themeRow: ".flc-uiOptions-themeRow",
            themeLabel: ".flc-uiOptions-themeLabel",
            themeInput: ".flc-uiOptions-themeInput"
        },
        markup: {
            label: "<span class=\"fl-preview-A\">A</span><span>%theme</span>"
        },
        invokers: {
            style: {
                funcName: "fluid.uiOptions.contrast.style",
                args: ["{that}.dom.themeLabel", "{that}.options.strings.theme",
                    "{that}.options.markup.label", "{that}.options.controlValues.theme",
                    "{that}.options.classnameMap.theme"]
            }
        },
        listeners: {
            afterRender: "{that}.style"
        },
        repeatingSelectors: ["themeRow"],
        produceTree: "fluid.uiOptions.contrast.produceTree"
    });

    fluid.uiOptions.contrast.style = function (labels, strings, markup, theme, style) {
        fluid.each(labels, function (label, index) {
            label = $(label);
            label.html(fluid.stringTemplate(markup, {
                theme: strings[index]
            }));
            label.addClass(style[theme[index]]);
        });
    };
    
    fluid.uiOptions.contrast.produceTree = function (that) {
        return {
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "themeRow",
                labelID: "themeLabel",
                inputID: "themeInput",
                selectID: "theme-radio",
                tree: {
                    optionnames: that.options.strings.theme,
                    optionlist: that.options.controlValues.theme,
                    selection: "${value}"
                }
            }
        };
    };
    
    /******************************
     * UI Options Layout Controls *
     ******************************/

    /**
     * A sub-component of fluid.uiOptions that renders the "layout and navigation" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.layoutControls", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        // The default model value reprsents both the expected format as well as the setting to be applied in the absence of a value passed down to the component.
        // i.e. from the settings store, or specific defaults derived from schema.
        // Note: This default value is not contributed and shared out
        model: {
            toc: false
        },
        selectors: {
            toc: ".flc-uiOptions-toc"
        },
        protoTree: {
            toc: "${toc}"
        }
    });

    /*****************************
     * UI Options Links Controls *
     *****************************/
    /**
     * A sub-component of fluid.uiOptions that renders the "links and buttons" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.linksControls", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        // The default model values reprsent both the expected format as well as the setting to be applied in the absence of values passed down to the component.
        // i.e. from the settings store, or specific defaults derived from schema.
        // Note: These default values are not contributed and shared out
        model: {
            links: false,
            inputsLarger: false
        },
        selectors: {
            links: ".flc-uiOptions-links",
            inputsLarger: ".flc-uiOptions-inputs-larger"
        },
        protoTree: {
            links: "${links}",
            inputsLarger: "${inputsLarger}"
        }
    });

    /************************************************
     * UI Options Select Dropdown Options Decorator *
     ************************************************/

    /**
     * A sub-component that decorates the options on the select dropdown list box with the css style
     */
    fluid.demands("fluid.uiOptions.selectDecorator", "fluid.uiOptions", {
        container: "{arguments}.0"
    });
    
    fluid.defaults("fluid.uiOptions.selectDecorator", {
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        finalInitFunction: "fluid.uiOptions.selectDecorator.finalInit",
        styles: {
            preview: "fl-preview-theme"
        }
    });
    
    fluid.uiOptions.selectDecorator.finalInit = function (that) {
        fluid.each($("option", that.container), function (option) {
            var styles = that.options.styles;
            $(option).addClass(styles.preview + " " + styles[fluid.value(option)]);
        });
    };

    /************************************************************************
     * The grade that contains shared options by all default settings panels
     ************************************************************************/
    
    fluid.defaults("fluid.uiOptions.defaultSettingsPanel", {
        sourceApplier: "{fluid.uiOptions}.applier",
        listeners: {
            "{uiOptions}.events.onUIOptionsRefresh": "{fluid.uiOptions.settingsPanel}.refreshView"
        }
    });

    /*********************************************************************************************************
     * defaultSettingsPanels
     * 
     * A collection of all the default UIO setting panels.
     *********************************************************************************************************/
    fluid.defaults("fluid.uiOptions.defaultSettingsPanels", {
        gradeNames: ["fluid.uiOptions", "autoInit"],
        selectors: {
            textSizer: ".flc-uiOptions-text-sizer",
            textFont: ".flc-uiOptions-text-font",
            lineSpacer: ".flc-uiOptions-line-spacer",
            contrast: ".flc-uiOptions-contrast",
            textControls: ".flc-uiOptions-text-controls",
            layoutControls: ".flc-uiOptions-layout-controls",
            linksControls: ".flc-uiOptions-links-controls"
        },
        components: {
            textSizer: {
                type: "fluid.uiOptions.textSizer",
                container: "{uiOptions}.dom.textSizer",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    gradeNames: "fluid.uiOptions.defaultSettingsPanel",
                    rules: {
                        "selections.textSize": "value"
                    },
                    resources: {
                        template: "{templateLoader}.resources.textSizer"
                    }
                }
            },
            lineSpacer: {
                type: "fluid.uiOptions.lineSpacer",
                container: "{uiOptions}.dom.lineSpacer",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    gradeNames: "fluid.uiOptions.defaultSettingsPanel",
                    rules: {
                        "selections.lineSpacing": "value"
                    },
                    resources: {
                        template: "{templateLoader}.resources.lineSpacer"
                    }
                }
            },
            textFont: {
                type: "fluid.uiOptions.textFont",
                container: "{uiOptions}.dom.textFont",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    gradeNames: "fluid.uiOptions.defaultSettingsPanel",
                    classnameMap: "{uiEnhancer}.options.classnameMap",
                    rules: {
                        "selections.textFont": "value"
                    },
                    resources: {
                        template: "{templateLoader}.resources.textFont"
                    }
                }
            },
            contrast: {
                type: "fluid.uiOptions.contrast",
                container: "{uiOptions}.dom.contrast",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    gradeNames: "fluid.uiOptions.defaultSettingsPanel",
                    classnameMap: "{uiEnhancer}.options.classnameMap",
                    rules: {
                        "selections.theme": "value"
                    },
                    resources: {
                        template: "{templateLoader}.resources.contrast"
                    }
                }
            },
            layoutControls: {
                type: "fluid.uiOptions.layoutControls",
                container: "{uiOptions}.dom.layoutControls",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    gradeNames: "fluid.uiOptions.defaultSettingsPanel",
                    rules: {
                        "selections.toc": "toc",
                        "selections.layout": "layout"
                    },
                    resources: {
                        template: "{templateLoader}.resources.layoutControls"
                    }
                }
            },
            linksControls: {
                type: "fluid.uiOptions.linksControls",
                container: "{uiOptions}.dom.linksControls",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    gradeNames: "fluid.uiOptions.defaultSettingsPanel",
                    rules: {
                        "selections.links": "links",
                        "selections.inputsLarger": "inputsLarger"
                    },
                    resources: {
                        template: "{templateLoader}.resources.linksControls"
                    }
                }
            }
        }
    });

    /******************************
     * Default Template Loader
     ******************************/

    /**
     * A template loader component that specifies the templates used by defaultSettingsPanels
     * 
     * @param {Object} options
     */    
       
    fluid.defaults("fluid.uiOptions.defaultTemplateLoader", {
        gradeNames: ["fluid.uiOptions.templateLoader", "autoInit"],
        templates: {
            textSizer: "%prefix/UIOptionsTemplate-textSizer.html",
            textFont: "%prefix/UIOptionsTemplate-textFont.html",
            lineSpacer: "%prefix/UIOptionsTemplate-lineSpacer.html",
            contrast: "%prefix/UIOptionsTemplate-contrast.html",
            layoutControls: "%prefix/UIOptionsTemplate-layout.html",
            linksControls: "%prefix/UIOptionsTemplate-links.html"
        }
    });

})(jQuery, fluid_1_5);
