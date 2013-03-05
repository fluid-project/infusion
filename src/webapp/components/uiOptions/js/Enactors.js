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
     * Adds or removes the classname to/from the elements based upon the model value.
     * This component is used as a grade by emphasizeLinksEnactor & inputsLargerEnactor
     **********************************************************************************/
    fluid.defaults("fluid.uiOptions.actionAnts.styleElementsEnactor", {
        gradeNames: ["fluid.uiOptions.actionAnts", "autoInit"],
        cssClass: null,  // Must be supplied by implementors
        model: {
            value: false
        },
        invokers: {
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
                args: ["{that}.model.value", {expander: {func: "{that}.getElements"}}, "{that}"]
            },
            
            // Must be supplied by implementors
            getElements: "fluid.uiOptions.actionAnts.getElements"
        },
        listeners: {
            onCreate: "{that}.handleStyle"
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
        that.applier.modelChanged.addListener("value", that.handleStyle);
    };
    
    /*******************************************************************************
     * The enactor to emphasize links in the container according to the value
     *******************************************************************************/
    fluid.defaults("fluid.uiOptions.actionAnts.emphasizeLinksEnactor", {
        gradeNames: ["fluid.uiOptions.actionAnts.styleElementsEnactor", "autoInit"],
        container: null,  // Must be supplied by implementors
        cssClass: "fl-link-enhanced",
        invokers: {
            getElements: {
                funcName: "fluid.uiOptions.actionAnts.emphasizeLinksEnactor.getLinks",
                args: "{that}.options.container"
            }
        }
    });
    
    fluid.uiOptions.actionAnts.emphasizeLinksEnactor.getLinks = function (container) {
        return $("a", container);
    };
    
    /*******************************************************************************
     * The enactor to enlarge inputs in the container according to the value
     *******************************************************************************/
    fluid.defaults("fluid.uiOptions.actionAnts.inputsLargerEnactor", {
        gradeNames: ["fluid.uiOptions.actionAnts.styleElementsEnactor", "autoInit"],
        container: null,  // Must be supplied by implementors
        cssClass: "fl-text-larger",
        invokers: {
            getElements: {
                funcName: "fluid.uiOptions.actionAnts.inputsLargerEnactor.getInputs",
                args: "{that}.options.container"
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
     * This component is used as a grade by textFontEnactor and themeEnactor
     *******************************************************************************/
    
    fluid.defaults("fluid.uiOptions.actionAnts.classSwapperEnactor", {
        gradeNames: ["fluid.uiOptions.actionAnts", "autoInit"],
        container: null,  // Must be supplied by implementors
        classes: {},  // Must be supplied by implementors
        classStr: {
            expander: {
                func: "fluid.uiOptions.actionAnts.classSwapperEnactor.joinClassStr",
                args: "{that}.options.classes"
            }
        },
        model: {
            className: ""
        },
        invokers: {
            clearClasses: {
                funcName: "fluid.uiOptions.actionAnts.classSwapperEnactor.clearClasses",
                args: "{that}"
            },
            swap: {
                funcName: "fluid.uiOptions.actionAnts.classSwapperEnactor.swap",
                args: ["{that}.model.className", "{that}"]
            }
        },
        events: {
            onReady: null
        }
    });
    
    fluid.uiOptions.actionAnts.classSwapperEnactor.clearClasses = function (that) {
        that.options.container.removeClass(that.options.classStr);
    };
    
    fluid.uiOptions.actionAnts.classSwapperEnactor.swap = function (className, that) {
        that.clearClasses(that);
        that.options.container.addClass(that.options.classes[className]);
    };
    
    fluid.uiOptions.actionAnts.classSwapperEnactor.joinClassStr = function (classes) {
        var classStr = "";
        
        fluid.each(classes, function (className) {
            if (className) {
                classStr += classStr ? " " + className : className;
            }
        });
        return classStr;
    };
    
    fluid.uiOptions.actionAnts.classSwapperEnactor.finalInit = function (that) {
        if (!that.options.container) {
            return;
        } else {
            that.options.container = $(that.options.container);
        }
        
        that.applier.modelChanged.addListener("className", that.swap);
        that.swap();
        
        that.events.onReady.fire(that);
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

    /**
     * return "font-size" in em
     * @param (Object) container
     * @param (Object) fontSizeMap: the mapping between the font size string values ("small", "medium" etc) to px values
     */
    fluid.uiOptions.actionAnts.getTextSizeInEm = function (container, fontSizeMap) {
        var px2emFactor = fluid.uiOptions.actionAnts.getPx2EmFactor(container, fontSizeMap);

        // retrieve fontSize in px, convert and return in em 
        return Math.round(fluid.uiOptions.actionAnts.getTextSizeInPx(container, fontSizeMap) / px2emFactor * 10000) / 10000;
    };
    
    fluid.uiOptions.actionAnts.getPx2EmFactor = function (container, fontSizeMap) {
        // The base font size is the computed font size of the container's parent element unless the container itself 
        // has been the DOM root element "HTML" which is NOT detectable with this algorithm
        if (container.get(0).tagName !== "HTML") {
            container = container.parent();
        }
        return fluid.uiOptions.actionAnts.getTextSizeInPx(container, fontSizeMap);
    };

    /*******************************************************************************
     * textSizerEnactor
     *
     * Sets the text size on the container to the multiple provided.
     *******************************************************************************/
    
    fluid.defaults("fluid.uiOptions.actionAnts.textSizerEnactor", {
        gradeNames: ["fluid.uiOptions.actionAnts", "autoInit"],
        container: null,  // must be supplied by implementors
        fontSizeMap: {},  // must be supplied by implementors
        model: {
            textSizeInTimes: 1
        },
        invokers: {
            set: {
                funcName: "fluid.uiOptions.actionAnts.textSizerEnactor.set",
                args: ["{that}.model.textSizeInTimes", "{that}"]
            },
            calcInitSize: {
                funcName: "fluid.uiOptions.actionAnts.textSizerEnactor.calcInitSize",
                args: ["{that}.options.container", "{that}.options.fontSizeMap"]
            }
        },
        events: {
            onReady: null
        }
    });
    
    fluid.uiOptions.actionAnts.textSizerEnactor.set = function (times, that) {
        if (!that.initialSize) {
            that.initialSize = that.calcInitSize();
        }

        if (that.initialSize) {
            var targetSize = times * that.initialSize;
            that.options.container.css("font-size", targetSize + "em");
        }
    };
    
    fluid.uiOptions.actionAnts.textSizerEnactor.calcInitSize = function (container, fontSizeMap) {
        return fluid.uiOptions.actionAnts.getTextSizeInEm(container, fontSizeMap);
    };

    fluid.uiOptions.actionAnts.textSizerEnactor.finalInit = function (that) {
        if (!that.options.container) {
            return;
        } else {
            that.options.container = $(that.options.container);
        }
        
        that.applier.modelChanged.addListener("textSizeInTimes", that.set);
        that.set();
    };
    
    /*******************************************************************************
     * lineSpacerEnactor
     *
     * Sets the line spacing on the container to the multiple provided.
     *******************************************************************************/
    
    fluid.defaults("fluid.uiOptions.actionAnts.lineSpacerEnactor", {
        gradeNames: ["fluid.uiOptions.actionAnts", "autoInit"],
        container: null,  // must be supplied by implementors
        fontSizeMap: {},  // must be supplied by implementors
        model: {
            lineSpaceInTimes: 1
        },
        invokers: {
            set: {
                funcName: "fluid.uiOptions.actionAnts.lineSpacerEnactor.set",
                args: ["{that}.model.lineSpaceInTimes", "{that}"]
            },
            calcInitSize: {
                funcName: "fluid.uiOptions.actionAnts.lineSpacerEnactor.calcInitSize",
                args: ["{that}.options.container", "{that}.options.fontSizeMap"]
            }
        },
        events: {
            onReady: null
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
        if (!that.initialSize) {
            that.initialSize = that.calcInitSize();
        }

        // that.initialSize === 0 when the browser returned "lineHeight" css value is undefined,
        // which occurs when firefox detects "line-height" value on a hidden container.
        // @ See numerizeLineHeight() & http://issues.fluidproject.org/browse/FLUID-4500
        if (that.initialSize) {
            var targetLineSpacing = times * that.initialSize;
            that.options.container.css("line-height", targetLineSpacing);
        }
    };
    
    fluid.uiOptions.actionAnts.lineSpacerEnactor.calcInitSize = function (container, fontSizeMap) {
        var lineHeight = fluid.uiOptions.actionAnts.lineSpacerEnactor.getLineHeight(container);
        var fontSize = fluid.uiOptions.actionAnts.getTextSizeInPx(container, fontSizeMap);

        return fluid.uiOptions.actionAnts.lineSpacerEnactor.numerizeLineHeight(lineHeight, fontSize);
    };

    fluid.uiOptions.actionAnts.lineSpacerEnactor.finalInit = function (that) {
        if (!that.options.container) {
            return;
        } else {
            that.options.container = $(that.options.container);
        }
        
        that.applier.modelChanged.addListener("lineSpaceInTimes", that.set);
        that.set();
    };
    
})(jQuery, fluid_1_5);
