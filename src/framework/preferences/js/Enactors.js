/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0 = fluid_2_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.prefs.enactor", {
        gradeNames: ["fluid.modelComponent", "fluid.eventedComponent", "fluid.prefs.modelRelay", "autoInit"]
    });

    /********************************************************************************
     * The grade that contains the connections between an enactor and uiEnhancer
     ********************************************************************************/

    fluid.defaults("fluid.prefs.uiEnhancerConnections", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        mergePolicy: {
            sourceApplier: "nomerge"
        },
        sourceApplier: "{uiEnhancer}.applier"
    });

    /**********************************************************************************
     * styleElements
     *
     * Adds or removes the classname to/from the elements based upon the model value.
     * This component is used as a grade by emphasizeLinks & inputsLarger
     **********************************************************************************/
    fluid.defaults("fluid.prefs.enactor.styleElements", {
        gradeNames: ["fluid.prefs.enactor", "autoInit"],
        cssClass: null,  // Must be supplied by implementors
        invokers: {
            applyStyle: {
                funcName: "fluid.prefs.enactor.styleElements.applyStyle",
                args: ["{arguments}.0", "{arguments}.1"]
            },
            resetStyle: {
                funcName: "fluid.prefs.enactor.styleElements.resetStyle",
                args: ["{arguments}.0", "{arguments}.1"]
            },
            handleStyle: {
                funcName: "fluid.prefs.enactor.styleElements.handleStyle",
                args: ["{arguments}.0", {expander: {func: "{that}.getElements"}}, "{that}"],
                dynamic: true
            },

            // Must be supplied by implementors
            getElements: "fluid.prefs.enactor.getElements"
        },
        listeners: {
            onCreate: {
                listener: "{that}.handleStyle",
                args: ["{that}.model.value"]
            }
        }
    });

    fluid.prefs.enactor.styleElements.applyStyle = function (elements, cssClass) {
        elements.addClass(cssClass);
    };

    fluid.prefs.enactor.styleElements.resetStyle = function (elements, cssClass) {
        $(elements, "." + cssClass).andSelf().removeClass(cssClass);
    };

    fluid.prefs.enactor.styleElements.handleStyle = function (value, elements, that) {
        if (value) {
            that.applyStyle(elements, that.options.cssClass);
        } else {
            that.resetStyle(elements, that.options.cssClass);
        }
    };

    fluid.prefs.enactor.styleElements.finalInit = function (that) {
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

    fluid.defaults("fluid.prefs.enactor.classSwapper", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactor", "autoInit"],
        classes: {},  // Must be supplied by implementors
        invokers: {
            clearClasses: {
                funcName: "fluid.prefs.enactor.classSwapper.clearClasses",
                args: ["{that}.container", "{that}.classStr"]
            },
            swap: {
                funcName: "fluid.prefs.enactor.classSwapper.swap",
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
                    func: "fluid.prefs.enactor.classSwapper.joinClassStr",
                    args: "{that}.options.classes"
                }
            }
        }
    });

    fluid.prefs.enactor.classSwapper.clearClasses = function (container, classStr) {
        container.removeClass(classStr);
    };

    fluid.prefs.enactor.classSwapper.swap = function (value, that) {
        that.clearClasses();
        that.container.addClass(that.options.classes[value]);
    };

    fluid.prefs.enactor.classSwapper.joinClassStr = function (classes) {
        var classStr = "";

        fluid.each(classes, function (oneClassName) {
            if (oneClassName) {
                classStr += classStr ? " " + oneClassName : oneClassName;
            }
        });
        return classStr;
    };

    fluid.prefs.enactor.classSwapper.finalInit = function (that) {
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
    fluid.defaults("fluid.prefs.enactor.emphasizeLinks", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactor.styleElements", "autoInit"],
        preferenceMap: {
            "fluid.prefs.emphasizeLinks": {
                "model.value": "default"
            }
        },
        cssClass: null,  // Must be supplied by implementors
        invokers: {
            getElements: {
                funcName: "fluid.prefs.enactor.emphasizeLinks.getLinks",
                args: "{that}.container"
            }
        }
    });

    fluid.prefs.enactor.emphasizeLinks.getLinks = function (container) {
        return $("a", container);
    };

    /*******************************************************************************
     * inputsLarger
     *
     * The enactor to enlarge inputs in the container according to the value
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.inputsLarger", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactor.styleElements", "autoInit"],
        preferenceMap: {
            "fluid.prefs.inputsLarger": {
                "model.value": "default"
            }
        },
        cssClass: null,  // Must be supplied by implementors
        invokers: {
            getElements: {
                funcName: "fluid.prefs.enactor.inputsLarger.getInputs",
                args: "{that}.container"
            }
        }
    });

    fluid.prefs.enactor.inputsLarger.getInputs = function (container) {
        return $("input, button", container);
    };

    /*******************************************************************************
     * textFont
     *
     * The enactor to change the font face used according to the value
     *******************************************************************************/
    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.textFont", {
        gradeNames: ["fluid.prefs.enactor.classSwapper", "autoInit"],
        preferenceMap: {
            "fluid.prefs.textFont": {
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
    fluid.defaults("fluid.prefs.enactor.contrast", {
        gradeNames: ["fluid.prefs.enactor.classSwapper", "autoInit"],
        preferenceMap: {
            "fluid.prefs.contrast": {
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
    fluid.prefs.enactor.getTextSizeInPx = function (container, fontSizeMap) {
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
     * Sets the text size on the root element to the multiple provided.
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.textSize", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "fluid.prefs.textSize": {
                "model.value": "default"
            }
        },
        members: {
            root: {
                expander: {
                    "this": "{that}.container",
                    "method": "closest", // ensure that the correct document is being used. i.e. in an iframe
                    "args": ["html"]
                }
            }
        },
        fontSizeMap: {},  // must be supplied by implementors
        invokers: {
            set: {
                funcName: "fluid.prefs.enactor.textSize.set",
                args: ["{arguments}.0", "{that}"]
            },
            getTextSizeInPx: {
                funcName: "fluid.prefs.enactor.getTextSizeInPx",
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

    fluid.prefs.enactor.textSize.set = function (times, that) {
        times = times || 1;
        // Calculating the initial size here rather than using a members expand because the "font-size"
        // cannot be detected on hidden containers such as separated paenl iframe.
        if (!that.initialSize) {
            that.initialSize = that.getTextSizeInPx();
        }

        if (that.initialSize) {
            var targetSize = times * that.initialSize;
            that.root.css("font-size", targetSize + "px");
        }
    };

    fluid.prefs.enactor.textSize.finalInit = function (that) {
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
    fluid.defaults("fluid.prefs.enactor.lineSpace", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "fluid.prefs.lineSpace": {
                "model.value": "default"
            }
        },
        fontSizeMap: {},  // must be supplied by implementors
        invokers: {
            set: {
                funcName: "fluid.prefs.enactor.lineSpace.set",
                args: ["{arguments}.0", "{that}"]
            },
            getTextSizeInPx: {
                funcName: "fluid.prefs.enactor.getTextSizeInPx",
                args: ["{that}.container", "{that}.options.fontSizeMap"]
            },
            getLineHeight: {
                funcName: "fluid.prefs.enactor.lineSpace.getLineHeight",
                args: "{that}.container"
            },
            getLineHeightMultiplier: {
                funcName: "fluid.prefs.enactor.lineSpace.getLineHeightMultiplier",
                args: [{expander: {func: "{that}.getLineHeight"}}, {expander: {func: "{that}.getTextSizeInPx"}}],
                dynamic: true
            }
        },
        listeners: {
            onCreate: {
                listener: "{that}.set",
                args: "{that}.model.value"
            }
        }
    });

    // Get the line-height of an element
    // In IE8 and IE9 this will return the line-height multiplier
    // In other browsers it will return the pixel value of the line height.
    fluid.prefs.enactor.lineSpace.getLineHeight = function (container) {
        return container.css("line-height");
    };

    // Interprets browser returned "line-height" value, either a string "normal", a number with "px" suffix or "undefined"
    // into a numeric value in em.
    // Return 0 when the given "lineHeight" argument is "undefined" (http://issues.fluidproject.org/browse/FLUID-4500).
    fluid.prefs.enactor.lineSpace.getLineHeightMultiplier = function (lineHeight, fontSize) {
        // Handle the given "lineHeight" argument is "undefined", which occurs when firefox detects
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

    fluid.prefs.enactor.lineSpace.set = function (times, that) {
        // Calculating the initial size here rather than using a members expand because the "line-height"
        // cannot be detected on hidden containers such as separated paenl iframe.
        if (!that.initialSize) {
            that.initialSize = that.getLineHeightMultiplier();
        }

        // that.initialSize === 0 when the browser returned "lineHeight" css value is undefined,
        // which occurs when firefox detects "line-height" value on a hidden container.
        // @ See getLineHeightMultiplier() & http://issues.fluidproject.org/browse/FLUID-4500
        if (that.initialSize) {
            var targetLineSpace = times * that.initialSize;
            that.container.css("line-height", targetLineSpace);
        }
    };

    fluid.prefs.enactor.lineSpace.finalInit = function (that) {
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
    fluid.defaults("fluid.prefs.enactor.tableOfContents", {
        gradeNames: ["fluid.viewComponent", "fluid.prefs.enactor", "autoInit"],
        preferenceMap: {
            "fluid.prefs.tableOfContents": {
                "model.value": "default"
            }
        },
        tocTemplate: null,  // must be supplied by implementors
        components: {
            tableOfContents: {
                type: "fluid.tableOfContents",
                container: "{fluid.prefs.enactor.tableOfContents}.container",
                createOnEvent: "onCreateTOCReady",
                options: {
                    components: {
                        levels: {
                            type: "fluid.tableOfContents.levels",
                            options: {
                                resources: {
                                    template: {
                                        forceCache: true,
                                        url: "{fluid.prefs.enactor.tableOfContents}.options.tocTemplate"
                                    }
                                }
                            }
                        }
                    },
                    listeners: {
                        afterRender: "{fluid.prefs.enactor.tableOfContents}.events.afterTocRender"
                    }
                }
            }
        },
        invokers: {
            applyToc: {
                funcName: "fluid.prefs.enactor.tableOfContents.applyToc",
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

    fluid.prefs.enactor.tableOfContents.applyToc = function (value, that) {
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

    fluid.prefs.enactor.tableOfContents.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            that.applyToc(newModel.value);
        });
    };

    /*******************************************************************************
     * The demands blocks that hook up tableOfContents enactor with other enactors
     * which need to re-apply their actions on the links inside table of contents
     *******************************************************************************/

    fluid.defaults("fluid.prefs.tocWithEmphasizeLinks", {
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

    fluid.defaults("fluid.prefs.tocWithInputsLarger", {
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

    fluid.demands("fluid.prefs.enactor.tableOfContents", "fluid.prefs.enactor.emphasizeLinks", {
        options: {
            gradeNames: "fluid.prefs.tocWithEmphasizeLinks"
        }
    });

    fluid.demands("fluid.prefs.enactor.tableOfContents", "fluid.prefs.enactor.inputsLarger", {
        options: {
            gradeNames: "fluid.prefs.tocWithInputsLarger"
        }
    });

})(jQuery, fluid_2_0);
