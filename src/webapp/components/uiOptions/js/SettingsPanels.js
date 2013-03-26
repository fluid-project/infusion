/*
Copyright 2009 University of Toronto
Copyright 2010-2013 OCAD University
Copyright 2011 Lucendo Development Ltd.

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
     * UI Options Select Dropdown Options Decorator*
     ***********************************************/
     
    fluid.registerNamespace("fluid.uiOptions.settingsPanel");

    fluid.defaults("fluid.uiOptions.settingsPanel", {
        gradeNames: ["fluid.rendererComponent", "fluid.uiOptions.modelRelay"],
        invokers: {
            refreshView: "{that}.renderer.refreshView"
        }
    });

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
        model: {
            value: 1,
            min: 1,
            max: 2
        },
		sliderOptions: {
			orientation: "horizontal",
			step: 0.1,
			range: "min"
		}, 
        selectors: {
            textSize: ".flc-uiOptions-min-text-size",
        },
        protoTree: {
            textSize: {
                decorators: {
                    type: "fluid",
                    func: "fluid.uiOptions.textfieldSlider"
                }
            }
        },
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-textSizer.html"
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
        model: {
            value: "default"
        },
        strings: {
            textFont: ["Default", "Times New Roman", "Comic Sans", "Arial", "Verdana"]
        },
        controlValues: { 
            textFont: ["default", "times", "comic", "arial", "verdana"]
        },
        selectors: {
            textFont: ".flc-uiOptions-text-font"
        },
        produceTree: "fluid.uiOptions.textFont.produceTree",
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-textFont.html"
            }
        }
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
        model: {
            value: 1,
            min: 1,
            max: 2
        },
		sliderOptions: {
			orientation: "horizontal",
			step: 0.1,
			range: "min"
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
        },
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-lineSpacer.html"
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
            label: "<span class=\"fl-preview-A\">A</span><span class=\"fl-hidden-accessible\">%theme</span>"
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
        produceTree: "fluid.uiOptions.contrast.produceTree",
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-contrast.html"
            }
        }
    });

    fluid.uiOptions.contrast.style = function (labels, strings, markup, theme, style) {
        fluid.each(labels, function (label, index) {
            label = $(label);
            label.html(fluid.stringTemplate(markup, {
                theme: strings[index]
            }));
            label.addClass(style[theme[index]]);
        });
        
		//$("input:checked").before("<div class='fl-choice-current'></div>");        
        
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
        model: {
            toc: false,
            layout: false
        },
        selectors: {
            layout: ".flc-uiOptions-layout",
            toc: ".flc-uiOptions-toc"
        },
        protoTree: {
            toc: "${toc}",
            layout: "${layout}"        
        },
        resources: {                    
            template: {
                url: "../html/UIOptionsTemplate-layout.html"
            }
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
        },
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-links.html"
            }
        }
    });

    /*****************************
     * UI Options Media Controls *
     *****************************/
    /**
     * A sub-component of fluid.uiOptions that renders the media language.
     */

    fluid.defaults("fluid.uiOptions.language", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            value: "en"
        },
        strings: {
            language: ["English", "French"]
        },
        controlValues: {
            language: ["en", "fr"]
        },
        selectors: {
            language: ".flc-uiOptions-language"
        },
        produceTree: "fluid.uiOptions.language.produceTree",
        resources: {
            template: {
                url: "../html/UIOptionsTemplate-language.html"
            }
        }
    });

    fluid.uiOptions.language.produceTree = function (that) {
        // render drop down list box
        return {
            textFont: {
                optionnames: that.options.strings.language,
                optionlist: that.options.controlValues.language,
                selection: "${value}"
            }
        };
    };

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

})(jQuery, fluid_1_5);
