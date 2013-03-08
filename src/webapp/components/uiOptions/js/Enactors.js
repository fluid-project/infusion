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

    fluid.defaults("fluid.uiOptions.actionAnts", {
        gradeNames: ["fluid.modelComponent", "fluid.eventedComponent", "autoInit"]
    });
    
    /**********************************************************************************
     * Functions shared by various enactors
     **********************************************************************************/
    
    fluid.uiOptions.actionAnts.getModelValueByPath = function (model, path) {
        return model[path];
    };
    

    /**********************************************************************************
     * styleElementsEnactor
     * 
     * Adds or removes the classname to/from the elements based upon the model value.
     * This component is used as a grade by emphasizeLinksEnactor & inputsLargerEnactor
     **********************************************************************************/
    fluid.defaults("fluid.uiOptions.actionAnts.styleElementsEnactor", {
        gradeNames: ["fluid.uiOptions.actionAnts", "autoInit"],
        cssClass: null,  // Must be supplied by implementors
        modelPath: "value",  // Must be supplied by implementors
        model: {
            value: false
        },
        invokers: {
            getModelValueByPath: {
                funcName: "fluid.uiOptions.actionAnts.getModelValueByPath",
                args: ["{that}.model", "{that}.options.modelPath"]
            },
            applyStyle: {
                funcName: "fluid.uiOptions.actionAnts.styleElementsEnactor.applyStyle",
                args: ["{arguments}.0", "{arguments}.1"]
            },
            resetStyle: {
                funcName: "fluid.uiOptions.actionAnts.styleElementsEnactor.resetStyle",
                args: ["{arguments}.0", "{arguments}.1"]
            },
            handleStyle: {
                funcName: "fluid.uiOptions.actionAnts.styleElementsEnactor.handleStyle",
                args: [{expander: {func: "{that}.getModelValueByPath", args: "{arguments}.0"}}, {expander: {func: "{that}.getElements"}}, "{that}"]
            },
            
            // Must be supplied by implementors
            getElements: "fluid.uiOptions.actionAnts.getElements"
        },
        listeners: {
            onCreate: {
                listener: "{that}.handleStyle",
                args: [{expander: {func: "{that}.getModelValueByPath", args: "{that}.model"}}]
            }
        }
    });
    
    fluid.uiOptions.actionAnts.styleElementsEnactor.applyStyle = function (elements, cssClass) {
        elements.addClass(cssClass);
    };

    fluid.uiOptions.actionAnts.styleElementsEnactor.resetStyle = function (elements, cssClass) {
        $("." + cssClass, elements).andSelf().removeClass(cssClass);
    };

    fluid.uiOptions.actionAnts.styleElementsEnactor.handleStyle = function (value, elements, that) {
        if (value) {
            that.applyStyle(elements, that.options.cssClass);
        } else {
            that.resetStyle(elements, that.options.cssClass);
        }
    };

    fluid.uiOptions.actionAnts.styleElementsEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener(that.options.modelPath, that.handleStyle);
    };
    
    /*******************************************************************************
     * emphasizeLinksEnactor
     * 
     * The enactor to emphasize links in the container according to the value
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.actionAnts.emphasizeLinksEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.actionAnts.styleElementsEnactor", "autoInit"],
        cssClass: null,  // Must be supplied by implementors
        modelPath: "links",  // Must be supplied by implementors
        model: {
            links: false
        },
        invokers: {
            getElements: {
                funcName: "fluid.uiOptions.actionAnts.emphasizeLinksEnactor.getLinks",
                args: "{that}.container"
            }
        }
    });
    
    fluid.uiOptions.actionAnts.emphasizeLinksEnactor.getLinks = function (container) {
        return $("a", container);
    };
    
    /*******************************************************************************
     * inputsLargerEnactor
     * 
     * The enactor to enlarge inputs in the container according to the value
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.actionAnts.inputsLargerEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.actionAnts.styleElementsEnactor", "autoInit"],
        cssClass: null,  // Must be supplied by implementors
        modelPath: "inputsLarger",  // Must be supplied by implementors if different
        model: {
            inputsLarger: false
        },
        invokers: {
            getElements: {
                funcName: "fluid.uiOptions.actionAnts.inputsLargerEnactor.getInputs",
                args: "{that}.container"
            }
        }
    });
    
    fluid.uiOptions.actionAnts.inputsLargerEnactor.getInputs = function (container) {
        return $("input, button", container);
    };
    
    /*******************************************************************************
     * ClassSwapperEnactor
     *
     * Has a hash of classes it cares about and will remove all those classes from
     * its container before setting the new class.
     * This component tends to be used as a grade by textFontEnactor and themeEnactor
     *******************************************************************************/
    
    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.actionAnts.classSwapperEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.actionAnts", "autoInit"],
        classes: {},  // Must be supplied by implementors
        modelPath: "className",  // Must be supplied by implementors to identify the EL path to the model key
        model: {
            className: ""
        },
        invokers: {
            clearClasses: {
                funcName: "fluid.uiOptions.actionAnts.classSwapperEnactor.clearClasses",
                args: ["{that}.container", "{that}.classStr"]
            },
            getModelValueByPath: {
                funcName: "fluid.uiOptions.actionAnts.getModelValueByPath",
                args: ["{that}.model", "{that}.options.modelPath"]
            },
            swap: {
                funcName: "fluid.uiOptions.actionAnts.classSwapperEnactor.swap",
                args: [{expander: {func: "{that}.getModelValueByPath", args: "{arguments}.0"}}, "{that}"]
            }
        },
        listeners: {
            onCreate: {
                listener: "{that}.swap",
                args: [{expander: {func: "{that}.getModelValueByPath", args: "{that}.model"}}]
            }
        },
        members: {
            classStr: {
                expander: {
                    func: "fluid.uiOptions.actionAnts.classSwapperEnactor.joinClassStr",
                    args: "{that}.options.classes"
                }
            }
        }
    });
    
    fluid.uiOptions.actionAnts.classSwapperEnactor.clearClasses = function (container, classStr) {
        container.removeClass(classStr);
    };
    
    fluid.uiOptions.actionAnts.classSwapperEnactor.swap = function (className, that) {
        that.clearClasses();
        that.container.addClass(that.options.classes[className]);
    };
    
    fluid.uiOptions.actionAnts.classSwapperEnactor.joinClassStr = function (classes) {
        var classStr = "";
        
        fluid.each(classes, function (oneClassName) {
            if (oneClassName) {
                classStr += classStr ? " " + oneClassName : oneClassName;
            }
        });
        return classStr;
    };
    
    fluid.uiOptions.actionAnts.classSwapperEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener(that.options.modelPath, that.swap);
    };
    
    /*******************************************************************************
     * Functions shared by textSizerEnactor and lineSpacerEnactor
     *******************************************************************************/
    
    /**
     * return "font-size" in px
     * @param (Object) container
     * @param (Object) fontSizeMap: the mapping between the font size string values ("small", "medium" etc) to px values
     */
    fluid.uiOptions.actionAnts.getTextSizeInPx = function (container, fontSizeMap) {
        var fontSize = container.css("font-size");

        if (fontSizeMap[fontSize]) {
            fontSize = fontSizeMap[fontSize];
        }

        // return fontSize in px
        return parseFloat(fontSize);
    };

    /*******************************************************************************
     * textSizerEnactor
     *
     * Sets the text size on the container to the multiple provided.
     *******************************************************************************/
    
    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.actionAnts.textSizerEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.actionAnts", "autoInit"],
        fontSizeMap: {},  // must be supplied by implementors
        model: {
            textSize: 1
        },
        invokers: {
            set: {
                funcName: "fluid.uiOptions.actionAnts.textSizerEnactor.set",
                args: ["{arguments}.0.textSize", "{that}"]
            },
            getTextSizeInPx: {
                funcName: "fluid.uiOptions.actionAnts.getTextSizeInPx",
                args: ["{that}.container", "{that}.options.fontSizeMap"]
            },
            getTextSizeInEm: {
                funcName: "fluid.uiOptions.actionAnts.textSizerEnactor.getTextSizeInEm",
                args: [{expander: {func: "{that}.getTextSizeInPx"}}, {expander: {func: "{that}.getPx2EmFactor"}}]
            },
            getPx2EmFactor: {
                funcName: "fluid.uiOptions.actionAnts.textSizerEnactor.getPx2EmFactor",
                args: ["{that}.container", "{that}.options.fontSizeMap"]
            }
        },
        listeners: {
            onCreate: {
                listener: "{that}.set",
                args: "{that}.model.textSize"
            }
        },
        members: {
            initialSize: {
                expander: {
                    func: "{that}.getTextSizeInEm"
                }
            }
        }
    });
    
    fluid.uiOptions.actionAnts.textSizerEnactor.set = function (times, that) {
        if (that.initialSize) {
            var targetSize = times * that.initialSize;
            that.container.css("font-size", targetSize + "em");
        }
    };

    /**
     * return "font-size" in em
     * @param (Object) container
     * @param (Object) fontSizeMap: the mapping between the font size string values ("small", "medium" etc) to px values
     */
    fluid.uiOptions.actionAnts.textSizerEnactor.getTextSizeInEm = function (textSizeInPx, px2emFactor) {
        // retrieve fontSize in px, convert and return in em 
        return Math.round(textSizeInPx / px2emFactor * 10000) / 10000;
    };
    
    fluid.uiOptions.actionAnts.textSizerEnactor.getPx2EmFactor = function (container, fontSizeMap) {
        // The base font size is the computed font size of the container's parent element unless the container itself 
        // has been the DOM root element "HTML" which is NOT detectable with this algorithm
        if (container.get(0).tagName !== "HTML") {
            container = container.parent();
        }
        return fluid.uiOptions.actionAnts.getTextSizeInPx(container, fontSizeMap);
    };

    fluid.uiOptions.actionAnts.textSizerEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("textSize", that.set);
    };
    
    /*******************************************************************************
     * lineSpacerEnactor
     *
     * Sets the line spacing on the container to the multiple provided.
     *******************************************************************************/
    
    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.actionAnts.lineSpacerEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.actionAnts", "autoInit"],
        fontSizeMap: {},  // must be supplied by implementors
        model: {
            lineSpacing: 1
        },
        invokers: {
            set: {
                funcName: "fluid.uiOptions.actionAnts.lineSpacerEnactor.set",
                args: ["{arguments}.0.lineSpacing", "{that}"]
            },
            getTextSizeInPx: {
                funcName: "fluid.uiOptions.actionAnts.getTextSizeInPx",
                args: ["{that}.container", "{that}.options.fontSizeMap"]
            },
            getLineHeight: {
                funcName: "fluid.uiOptions.actionAnts.lineSpacerEnactor.getLineHeight",
                args: "{that}.container"
            },
            numerizeLineHeight: {
                funcName: "fluid.uiOptions.actionAnts.lineSpacerEnactor.numerizeLineHeight",
                args: [{expander: {func: "{that}.getLineHeight"}}, {expander: {func: "{that}.getTextSizeInPx"}}]
            }
        },
        listeners: {
            onCreate: {
                listener: "{that}.set",
                args: "{that}.model.lineSpacing"
            }
        },
        members: {
            initialSize: {
                expander: {
                    func: "{that}.numerizeLineHeight"
                }
            }
        }
    });
    
    // Return "line-height" css value
    fluid.uiOptions.actionAnts.lineSpacerEnactor.getLineHeight = function (container) {
        var lineHeight;
        
        // A work-around of jQuery + IE bug - http://bugs.jquery.com/ticket/2671
        if (container[0].currentStyle) {
            lineHeight = container[0].currentStyle.lineHeight;
        } else {
            lineHeight = container.css("line-height");
        }
        
        return lineHeight;
    };
    
    // Interprets browser returned "line-height" value, either a string "normal", a number with "px" suffix or "undefined" 
    // into a numeric value in em. 
    // Return 0 when the given "lineHeight" argument is "undefined" (http://issues.fluidproject.org/browse/FLUID-4500).
    fluid.uiOptions.actionAnts.lineSpacerEnactor.numerizeLineHeight = function (lineHeight, fontSize) {
        // Handel the given "lineHeight" argument is "undefined", which occurs when firefox detects 
        // "line-height" css value on a hidden container. (http://issues.fluidproject.org/browse/FLUID-4500)
        if (!lineHeight) {
            return 0;
        }

        // Needs a better solution. For now, "line-height" value "normal" is defaulted to 1.2em
        // according to https://developer.mozilla.org/en/CSS/line-height
        if (lineHeight === "normal") {
            return 1.2;
        }
        
        // Continuing the work-around of jQuery + IE bug - http://bugs.jquery.com/ticket/2671
        if (lineHeight.match(/[0-9]$/)) {
            return lineHeight;
        }
        
        return Math.round(parseFloat(lineHeight) / fontSize * 100) / 100;
    };

    fluid.uiOptions.actionAnts.lineSpacerEnactor.set = function (times, that) {
        // that.initialSize === 0 when the browser returned "lineHeight" css value is undefined,
        // which occurs when firefox detects "line-height" value on a hidden container.
        // @ See numerizeLineHeight() & http://issues.fluidproject.org/browse/FLUID-4500
        if (that.initialSize) {
            var targetLineSpacing = times * that.initialSize;
            that.container.css("line-height", targetLineSpacing);
        }
    };
    
    fluid.uiOptions.actionAnts.lineSpacerEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("lineSpacing", that.set);
    };
    
    /*******************************************************************************
     * tableOfContentsEnactor
     *
     * To create and show/hide table of contents
     *******************************************************************************/
    
    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.actionAnts.tableOfContentsEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.actionAnts", "autoInit"],
        tocTemplate: null,  // must be supplied by implementors
        model: {
            toc: false
        },
        components: {
            tableOfContents: {
                type: "fluid.tableOfContents",
                container: "{tableOfContentsEnactor}.container",
                createOnEvent: "onCreateTOCReady",
                options: {
                    components: {
                        levels: {
                            type: "fluid.tableOfContents.levels",
                            options: {
                                resources: {
                                    template: {
                                        forceCache: true,
                                        url: "{tableOfContentsEnactor}.options.tocTemplate"
                                    }
                                }
                            } 
                        }
                    }
                }
            }
        },
        invokers: {
            applyToc: {
                funcName: "fluid.uiOptions.actionAnts.tableOfContentsEnactor.applyToc",
                args: ["{arguments}.0.toc", "{that}"]
            }
        },
        events: {
            onCreateTOCReady: null,
            onLateRefreshRelay: null
        },
        listeners: {
            onCreate: {
                listener: "{that}.applyToc",
                args: "{that}.model.toc"
            }
        }
    });
    
    fluid.uiOptions.actionAnts.tableOfContentsEnactor.applyToc = function (toc, that) {
        var async = false;
        if (toc) {
            if (that.tableOfContents) {
                that.tableOfContents.show();
            } else {
                that.events.onCreateTOCReady.fire();
                async = true;
            }
        } else {
            if (that.tableOfContents) {
                that.tableOfContents.hide();
            }
        }
        if (!async) {
            that.events.onLateRefreshRelay.fire(that);
        }
    };
    
    fluid.uiOptions.actionAnts.tableOfContentsEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("toc", that.applyToc);
    };
    
})(jQuery, fluid_1_5);
