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

    fluid.defaults("fluid.uiOptions.enactors", {
        gradeNames: ["fluid.modelComponent", "fluid.eventedComponent", "fluid.uiOptions.modelRelay", "autoInit"]
    });

    /**********************************************************************************
     * styleElements
     *
     * Adds or removes the classname to/from the elements based upon the model value.
     * This component is used as a grade by emphasizeLinks & inputsLarger
     **********************************************************************************/
    fluid.defaults("fluid.uiOptions.enactors.styleElements", {
        gradeNames: ["fluid.uiOptions.enactors", "autoInit"],
        cssClass: null,  // Must be supplied by implementors
        invokers: {
            applyStyle: {
                funcName: "fluid.uiOptions.enactors.styleElements.applyStyle",
                args: ["{arguments}.0", "{arguments}.1"]
            },
            resetStyle: {
                funcName: "fluid.uiOptions.enactors.styleElements.resetStyle",
                args: ["{arguments}.0", "{arguments}.1"]
            },
            handleStyle: {
                funcName: "fluid.uiOptions.enactors.styleElements.handleStyle",
                args: ["{arguments}.0", {expander: {func: "{that}.getElements"}}, "{that}"],
                dynamic: true
            },

            // Must be supplied by implementors
            getElements: "fluid.uiOptions.enactors.getElements"
        },
        listeners: {
            onCreate: {
                listener: "{that}.handleStyle",
                args: ["{that}.model.value"]
            }
        }
    });

    fluid.uiOptions.enactors.styleElements.applyStyle = function (elements, cssClass) {
        elements.addClass(cssClass);
    };

    fluid.uiOptions.enactors.styleElements.resetStyle = function (elements, cssClass) {
        $(elements, "." + cssClass).andSelf().removeClass(cssClass);
    };

    fluid.uiOptions.enactors.styleElements.handleStyle = function (value, elements, that) {
        if (value) {
            that.applyStyle(elements, that.options.cssClass);
        } else {
            that.resetStyle(elements, that.options.cssClass);
        }
    };

    fluid.uiOptions.enactors.styleElements.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.handleStyle(newModel.value);
        });
    };

    /*******************************************************************************
     * ClassSwapper
     *
     * Has a hash of classes it cares about and will remove all those classes from
     * its container before setting the new class.
     * This component tends to be used as a grade by textFont and contrast
     *******************************************************************************/

    fluid.defaults("fluid.uiOptions.enactors.classSwapper", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.enactors", "autoInit"],
        classes: {},  // Must be supplied by implementors
        invokers: {
            clearClasses: {
                funcName: "fluid.uiOptions.enactors.classSwapper.clearClasses",
                args: ["{that}.container", "{that}.classStr"]
            },
            swap: {
                funcName: "fluid.uiOptions.enactors.classSwapper.swap",
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
                    func: "fluid.uiOptions.enactors.classSwapper.joinClassStr",
                    args: "{that}.options.classes"
                }
            }
        }
    });

    fluid.uiOptions.enactors.classSwapper.clearClasses = function (container, classStr) {
        container.removeClass(classStr);
    };

    fluid.uiOptions.enactors.classSwapper.swap = function (value, that) {
        that.clearClasses();
        that.container.addClass(that.options.classes[value]);
    };

    fluid.uiOptions.enactors.classSwapper.joinClassStr = function (classes) {
        var classStr = "";

        fluid.each(classes, function (oneClassName) {
            if (oneClassName) {
                classStr += classStr ? " " + oneClassName : oneClassName;
            }
        });
        return classStr;
    };

    fluid.uiOptions.enactors.classSwapper.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.swap(newModel.value);
        });
    };

    /*******************************************************************************
     * emphasizeLinks
     *
     * The enactor to emphasize links in the container according to the value
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.enactors.emphasizeLinks", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.enactors.styleElements", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.emphasizeLinks": {
                "model.value": "default"
            }
        },
        cssClass: null,  // Must be supplied by implementors
        invokers: {
            getElements: {
                funcName: "fluid.uiOptions.enactors.emphasizeLinks.getLinks",
                args: "{that}.container"
            }
        }
    });

    fluid.uiOptions.enactors.emphasizeLinks.getLinks = function (container) {
        return $("a", container);
    };

    /*******************************************************************************
     * inputsLarger
     *
     * The enactor to enlarge inputs in the container according to the value
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.enactors.inputsLarger", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.enactors.styleElements", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.inputsLarger": {
                "model.value": "default"
            }
        },
        cssClass: null,  // Must be supplied by implementors
        invokers: {
            getElements: {
                funcName: "fluid.uiOptions.enactors.inputsLarger.getInputs",
                args: "{that}.container"
            }
        }
    });

    fluid.uiOptions.enactors.inputsLarger.getInputs = function (container) {
        return $("input, button", container);
    };

    /*******************************************************************************
     * textFont
     *
     * The enactor to change the font face used according to the value
     *******************************************************************************/
    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.enactors.textFont", {
        gradeNames: ["fluid.uiOptions.enactors.classSwapper", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.textFont": {
                "model.value": "default"
            }
        }
    });

    /*******************************************************************************
     * contrast
     *
     * The enactor to change the contrast theme according to the value
     *******************************************************************************/
    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.enactors.contrast", {
        gradeNames: ["fluid.uiOptions.enactors.classSwapper", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.contrast": {
                "model.value": "default"
            }
        }
    });



    /*******************************************************************************
     * Functions shared by textSize and lineSpace
     *******************************************************************************/

    /**
     * return "font-size" in px
     * @param (Object) container
     * @param (Object) fontSizeMap: the mapping between the font size string values ("small", "medium" etc) to px values
     */
    fluid.uiOptions.enactors.getTextSizeInPx = function (container, fontSizeMap) {
        var fontSize = container.css("font-size");

        if (fontSizeMap[fontSize]) {
            fontSize = fontSizeMap[fontSize];
        }

        // return fontSize in px
        return parseFloat(fontSize);
    };

    /*******************************************************************************
     * textSize
     *
     * Sets the text size on the container to the multiple provided.
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.enactors.textSize", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.enactors", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.textSize": {
                "model.value": "default"
            }
        },
        fontSizeMap: {},  // must be supplied by implementors
        invokers: {
            set: {
                funcName: "fluid.uiOptions.enactors.textSize.set",
                args: ["{arguments}.0", "{that}"]
            },
            getTextSizeInPx: {
                funcName: "fluid.uiOptions.enactors.getTextSizeInPx",
                args: ["{that}.container", "{that}.options.fontSizeMap"]
            },
            getTextSizeInEm: {
                funcName: "fluid.uiOptions.enactors.textSize.getTextSizeInEm",
                args: [{expander: {func: "{that}.getTextSizeInPx"}}, {expander: {func: "{that}.getPx2EmFactor"}}]
            },
            getPx2EmFactor: {
                funcName: "fluid.uiOptions.enactors.textSize.getPx2EmFactor",
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

    fluid.uiOptions.enactors.textSize.set = function (times, that) {
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
    fluid.uiOptions.enactors.textSize.getTextSizeInEm = function (textSizeInPx, px2emFactor) {
        // retrieve fontSize in px, convert and return in em
        return Math.round(textSizeInPx / px2emFactor * 10000) / 10000;
    };

    /**
     * Return the base font size used for converting text size from px to em
     */
    fluid.uiOptions.enactors.textSize.getPx2EmFactor = function (container, fontSizeMap) {
        // The base font size for converting text size to em is the computed font size of the container's
        // parent element unless the container itself has been the DOM root element "HTML"
        // The reference to this algorithm: http://clagnut.com/blog/348/
        if (container.get(0).tagName !== "HTML") {
            container = container.parent();
        }
        return fluid.uiOptions.enactors.getTextSizeInPx(container, fontSizeMap);
    };

    fluid.uiOptions.enactors.textSize.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.set(newModel.value);
        });
    };

    /*******************************************************************************
     * lineSpace
     *
     * Sets the line space on the container to the multiple provided.
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.enactors.lineSpace", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.enactors", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.lineSpace": {
                "model.value": "default"
            }
        },
        fontSizeMap: {},  // must be supplied by implementors
        invokers: {
            set: {
                funcName: "fluid.uiOptions.enactors.lineSpace.set",
                args: ["{arguments}.0", "{that}"]
            },
            getTextSizeInPx: {
                funcName: "fluid.uiOptions.enactors.getTextSizeInPx",
                args: ["{that}.container", "{that}.options.fontSizeMap"]
            },
            getLineHeight: {
                funcName: "fluid.uiOptions.enactors.lineSpace.getLineHeight",
                args: "{that}.container"
            },
            numerizeLineHeight: {
                funcName: "fluid.uiOptions.enactors.lineSpace.numerizeLineHeight",
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
    fluid.uiOptions.enactors.lineSpace.getLineHeight = function (container) {
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
    fluid.uiOptions.enactors.lineSpace.numerizeLineHeight = function (lineHeight, fontSize) {
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

    fluid.uiOptions.enactors.lineSpace.set = function (times, that) {
        // Calculating the initial size here rather than using a members expand because the "line-height"
        // cannot be detected on hidden containers such as fat paenl iframe.
        if (!that.initialSize) {
            that.initialSize = that.numerizeLineHeight();
        }

        // that.initialSize === 0 when the browser returned "lineHeight" css value is undefined,
        // which occurs when firefox detects "line-height" value on a hidden container.
        // @ See numerizeLineHeight() & http://issues.fluidproject.org/browse/FLUID-4500
        if (that.initialSize) {
            var targetLineSpace = times * that.initialSize;
            that.container.css("line-height", targetLineSpace);
        }
    };

    fluid.uiOptions.enactors.lineSpace.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.set(newModel.value);
        });
    };

    /*******************************************************************************
     * tableOfContents
     *
     * To create and show/hide table of contents
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.uiOptions.enactors.tableOfContents", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.enactors", "autoInit"],
        preferenceMap: {
            "fluid.uiOptions.tableOfContents": {
                "model.value": "default"
            }
        },
        tocTemplate: null,  // must be supplied by implementors
        components: {
            tableOfContents: {
                type: "fluid.tableOfContents",
                container: "{fluid.uiOptions.enactors.tableOfContents}.container",
                createOnEvent: "onCreateTOCReady",
                options: {
                    components: {
                        levels: {
                            type: "fluid.tableOfContents.levels",
                            options: {
                                resources: {
                                    template: {
                                        forceCache: true,
                                        url: "{fluid.uiOptions.enactors.tableOfContents}.options.tocTemplate"
                                    }
                                }
                            }
                        }
                    },
                    listeners: {
                        afterRender: "{fluid.uiOptions.enactors.tableOfContents}.events.afterTocRender"
                    }
                }
            }
        },
        invokers: {
            applyToc: {
                funcName: "fluid.uiOptions.enactors.tableOfContents.applyToc",
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

    fluid.uiOptions.enactors.tableOfContents.applyToc = function (value, that) {
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

    fluid.uiOptions.enactors.tableOfContents.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.applyToc(newModel.value);
        });
    };

    /*******************************************************************************
     * The demands blocks that hook up tableOfContents enactor with other enactors
     * which need to re-apply their actions on the links inside table of contents
     *******************************************************************************/

    fluid.defaults("fluid.uiOptions.tocWithEmphasizeLinks", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            afterTocRender: {
                listener: "{uiEnhancer}.emphasizeLinks.handleStyle",
                args: "{uiEnhancer}.model.links"
            },
            onLateRefreshRelay: {
                listener: "{uiEnhancer}.emphasizeLinks.handleStyle",
                args: "{uiEnhancer}.model.links"
            }
        }
    });

    fluid.defaults("fluid.uiOptions.tocWithInputsLarger", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            afterTocRender: {
                listener: "{uiEnhancer}.inputsLarger.handleStyle",
                args: "{uiEnhancer}.model.inputsLarger"
            },
            onLateRefreshRelay: {
                listener: "{uiEnhancer}.inputsLarger.handleStyle",
                args: "{uiEnhancer}.model.inputsLarger"
            }
        }
    });

    fluid.demands("fluid.uiOptions.enactors.tableOfContents", "fluid.uiOptions.enactors.emphasizeLinks", {
        options: {
            gradeNames: "fluid.uiOptions.tocWithEmphasizeLinks"
        }
    });

    fluid.demands("fluid.uiOptions.enactors.tableOfContents", "fluid.uiOptions.enactors.inputsLarger", {
        options: {
            gradeNames: "fluid.uiOptions.tocWithInputsLarger"
        }
    });

})(jQuery, fluid_1_5);
