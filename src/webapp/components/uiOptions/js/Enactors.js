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
        gradeNames: ["fluid.modelComponent", "fluid.eventedComponent", "fluid.uiOptions.modelRelay", "autoInit"]
    });
    
    /**********************************************************************************
     * styleElementsEnactor
     * 
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
                args: ["{arguments}.0", {expander: {func: "{that}.getElements"}}, "{that}"]
            },
            
            // Must be supplied by implementors
            getElements: "fluid.uiOptions.actionAnts.getElements"
        },
        listeners: {
            onCreate: {
                listener: "{that}.handleStyle",
                args: ["{that}.model.value"]
            }
        }
    });
    
    fluid.uiOptions.actionAnts.styleElementsEnactor.applyStyle = function (elements, cssClass) {
        elements.addClass(cssClass);
    };

    fluid.uiOptions.actionAnts.styleElementsEnactor.resetStyle = function (elements, cssClass) {
        $(elements, "." + cssClass).andSelf().removeClass(cssClass);
    };

    fluid.uiOptions.actionAnts.styleElementsEnactor.handleStyle = function (value, elements, that) {
        if (value) {
            that.applyStyle(elements, that.options.cssClass);
        } else {
            that.resetStyle(elements, that.options.cssClass);
        }
    };

    fluid.uiOptions.actionAnts.styleElementsEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.handleStyle(newModel.value);
        });
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
        model: {
            value: false
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
        model: {
            value: false
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
        model: {
            value: ""
        },
        invokers: {
            clearClasses: {
                funcName: "fluid.uiOptions.actionAnts.classSwapperEnactor.clearClasses",
                args: ["{that}.container", "{that}.classStr"]
            },
            swap: {
                funcName: "fluid.uiOptions.actionAnts.classSwapperEnactor.swap",
                args: ["{arguments}.0", "{that}"]
            }
        },
        listeners: {
            onCreate: {
                listener: "{that}.swap",
                args: ["{that}.model.value"]
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
    
    fluid.uiOptions.actionAnts.classSwapperEnactor.swap = function (value, that) {
        that.clearClasses();
        that.container.addClass(that.options.classes[value]);
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
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.swap(newModel.value);
        });
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
            value: 1
        },
        invokers: {
            set: {
                funcName: "fluid.uiOptions.actionAnts.textSizerEnactor.set",
                args: ["{arguments}.0", "{that}"]
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
                args: "{that}.model.value"
            }
        }
    });
    
    fluid.uiOptions.actionAnts.textSizerEnactor.set = function (times, that) {
        // Calculating the initial size here rather than using a members expand because the "font-size"
        // cannot be detected on hidden containers such as fat paenl iframe.
        if (!that.initialSize) {
            that.initialSize = that.getTextSizeInEm();
        }
        
        if (that.initialSize) {
            var targetSize = times * that.initialSize;
            that.container.css("font-size", targetSize + "em");
        }
    };

    /**
     * Return "font-size" in em
     * @param (Object) container
     * @param (Object) fontSizeMap: the mapping between the font size string values ("small", "medium" etc) to px values
     */
    fluid.uiOptions.actionAnts.textSizerEnactor.getTextSizeInEm = function (textSizeInPx, px2emFactor) {
        // retrieve fontSize in px, convert and return in em 
        return Math.round(textSizeInPx / px2emFactor * 10000) / 10000;
    };
    
    /**
     * Return the base font size used for converting text size from px to em
     */
    fluid.uiOptions.actionAnts.textSizerEnactor.getPx2EmFactor = function (container, fontSizeMap) {
        // The base font size for converting text size to em is the computed font size of the container's 
        // parent element unless the container itself has been the DOM root element "HTML"
        // The reference to this algorithm: http://clagnut.com/blog/348/
        if (container.get(0).tagName !== "HTML") {
            container = container.parent();
        }
        return fluid.uiOptions.actionAnts.getTextSizeInPx(container, fontSizeMap);
    };

    fluid.uiOptions.actionAnts.textSizerEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.set(newModel.value);
        });
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
            value: 1
        },
        invokers: {
            set: {
                funcName: "fluid.uiOptions.actionAnts.lineSpacerEnactor.set",
                args: ["{arguments}.0", "{that}"]
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
                args: "{that}.model.value"
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
        // Calculating the initial size here rather than using a members expand because the "line-height"
        // cannot be detected on hidden containers such as fat paenl iframe.
        if (!that.initialSize) {
            that.initialSize = that.numerizeLineHeight();
        }
        
        // that.initialSize === 0 when the browser returned "lineHeight" css value is undefined,
        // which occurs when firefox detects "line-height" value on a hidden container.
        // @ See numerizeLineHeight() & http://issues.fluidproject.org/browse/FLUID-4500
        if (that.initialSize) {
            var targetLineSpacing = times * that.initialSize;
            that.container.css("line-height", targetLineSpacing);
        }
    };
    
    fluid.uiOptions.actionAnts.lineSpacerEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.set(newModel.value);
        });
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
            value: false
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
                    },
                    listeners: {
                        afterRender: "{tableOfContentsEnactor}.events.afterTocRender"
                    }
                }
            }
        },
        invokers: {
            applyToc: {
                funcName: "fluid.uiOptions.actionAnts.tableOfContentsEnactor.applyToc",
                args: ["{arguments}.0", "{that}"]
            }
        },
        events: {
            onCreateTOCReady: null,
            afterTocRender: null,
            onLateRefreshRelay: null
        },
        listeners: {
            onCreate: {
                listener: "{that}.applyToc",
                args: "{that}.model.value"
            }
        }
    });
    
    fluid.uiOptions.actionAnts.tableOfContentsEnactor.applyToc = function (value, that) {
        var async = false;
        if (value) {
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
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.applyToc(newModel.value);
        });
    };
    
    /*******************************************************************************
     * Browser type and version detection.                                         *
     *                                                                             *
     * Add type tags of IE and browser version into static environment for the     * 
     * spcial handling on IE6.                                                     *
     *******************************************************************************/
    
    fluid.registerNamespace("fluid.browser.version");

    fluid.browser.msie = function () {
        var isIE = ($.browser.msie);
        return isIE ? fluid.typeTag("fluid.browser.msie") : undefined;
    };

    fluid.browser.majorVersion = function () {
    // From http://www.useragentstring.com/pages/Internet%20Explorer/ several variants are possible
    // for IE6 - and in general we probably just want to detect major versions
        var version = $.browser.version;
        var dotpos = version.indexOf(".");
        var majorVersion = version.substring(0, dotpos);
        return fluid.typeTag("fluid.browser.majorVersion." + majorVersion);
    };

    var features = {
        browserIE: fluid.browser.msie(),
        browserMajorVersion: fluid.browser.majorVersion()
    };
    
    fluid.merge(null, fluid.staticEnvironment, features);
    
    // Temporary solution pending revised IoC system in 1.5
    
    fluid.hasFeature = function (tagName) {
        return fluid.find_if(fluid.staticEnvironment, function (value) {
            return value && value.typeName === tagName;
        });
    };

    /********************************************************************************************
     * setIE6ColorInversionEnactor
     * 
     * Remove the instances of fl-inverted-color when the default theme is selected. 
     * This prevents a bug in IE6 where the default theme will have elements styled 
     * with the theme color.
     *
     * Caused by:
     * http://thunderguy.com/semicolon/2005/05/16/multiple-class-selectors-in-internet-explorer/
     ********************************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.actionAnts.IE6ColorInversionEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.actionAnts", "autoInit"],
        selectors: {
            colorInversion: ".fl-inverted-color"
        },
        styles: {
            colorInversionClass: "fl-inverted-color"
        },
        model: {
            value: null
        },
        invokers: {
            setIE6ColorInversion: {
                funcName: "fluid.uiOptions.actionAnts.IE6ColorInversionEnactor.setIE6ColorInversion",
                args: ["{arguments}.0", "{that}"]
            }
        },
        listeners: {
            onCreate: {
                listener: "{that}.setIE6ColorInversion",
                args: ["{that}.model.value"]
            }
        }
    });
    
    fluid.uiOptions.actionAnts.IE6ColorInversionEnactor.setIE6ColorInversion = function (value, that) {
        if (fluid.hasFeature("fluid.browser.msie") && fluid.hasFeature("fluid.browser.majorVersion.6") && value === "default") {
            that.locate("colorInversion").removeClass(that.options.styles.colorInversionClass);
        }
    };
    
    fluid.uiOptions.actionAnts.IE6ColorInversionEnactor.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.setIE6ColorInversion(newModel.value);
        });
    };

})(jQuery, fluid_1_5);
