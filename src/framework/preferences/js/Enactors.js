/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0_0 = fluid_2_0_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.prefs.enactor", {
        gradeNames: ["fluid.modelComponent"]
    });

    /**********************************************************************************
     * styleElements
     *
     * Adds or removes the classname to/from the elements based upon the model value.
     * This component is used as a grade by emphasizeLinks & inputsLarger
     **********************************************************************************/
    fluid.defaults("fluid.prefs.enactor.styleElements", {
        gradeNames: ["fluid.prefs.enactor"],
        cssClass: null,  // Must be supplied by implementors
        elementsToStyle: null,  // Must be supplied by implementors
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
                args: ["{arguments}.0", "{that}.options.elementsToStyle", "{that}.options.cssClass", "{that}.applyStyle", "{that}.resetStyle"]
            }
        },
        modelListeners: {
            value: {
                listener: "{that}.handleStyle",
                args: ["{change}.value"]
            }
        }
    });

    fluid.prefs.enactor.styleElements.applyStyle = function (elements, cssClass) {
        elements.addClass(cssClass);
    };

    fluid.prefs.enactor.styleElements.resetStyle = function (elements, cssClass) {
        $(elements, "." + cssClass).andSelf().removeClass(cssClass);
    };

    fluid.prefs.enactor.styleElements.handleStyle = function (value, elements, cssClass, applyStyleFunc, resetStyleFunc) {
        var func = value ? applyStyleFunc : resetStyleFunc;
        func(elements, cssClass);
    };

    /*******************************************************************************
     * ClassSwapper
     *
     * Has a hash of classes it cares about and will remove all those classes from
     * its container before setting the new class.
     * This component tends to be used as a grade by textFont and contrast
     *******************************************************************************/

    fluid.defaults("fluid.prefs.enactor.classSwapper", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        classes: {},  // Must be supplied by implementors
        invokers: {
            clearClasses: {
                funcName: "fluid.prefs.enactor.classSwapper.clearClasses",
                args: ["{that}.container", "{that}.classStr"]
            },
            swap: {
                funcName: "fluid.prefs.enactor.classSwapper.swap",
                args: ["{arguments}.0", "{that}", "{that}.clearClasses"]
            }
        },
        modelListeners: {
            value: {
                listener: "{that}.swap",
                args: ["{change}.value"]
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

    fluid.prefs.enactor.classSwapper.swap = function (value, that, clearClassesFunc) {
        clearClassesFunc();
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

    /*******************************************************************************
     * emphasizeLinks
     *
     * The enactor to emphasize links in the container according to the value
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.emphasizeLinks", {
        gradeNames: ["fluid.prefs.enactor.styleElements", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.emphasizeLinks": {
                "model.value": "default"
            }
        },
        cssClass: null,  // Must be supplied by implementors
        elementsToStyle: "{that}.container"
    });

    /*******************************************************************************
     * inputsLarger
     *
     * The enactor to enlarge inputs in the container according to the value
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.inputsLarger", {
        gradeNames: ["fluid.prefs.enactor.styleElements", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.inputsLarger": {
                "model.value": "default"
            }
        },
        cssClass: null,  // Must be supplied by implementors
        elementsToStyle: "{that}.container"
    });

    /*******************************************************************************
     * textFont
     *
     * The enactor to change the font face used according to the value
     *******************************************************************************/
    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.textFont", {
        gradeNames: ["fluid.prefs.enactor.classSwapper"],
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
        gradeNames: ["fluid.prefs.enactor.classSwapper"],
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
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
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
                args: ["{arguments}.0", "{that}", "{that}.getTextSizeInPx"]
            },
            getTextSizeInPx: {
                funcName: "fluid.prefs.enactor.getTextSizeInPx",
                args: ["{that}.root", "{that}.options.fontSizeMap"]
            }
        },
        modelListeners: {
            value: {
                listener: "{that}.set",
                args: ["{change}.value"]
            }
        }
    });

    fluid.prefs.enactor.textSize.set = function (times, that, getTextSizeInPxFunc) {
        times = times || 1;
        // Calculating the initial size here rather than using a members expand because the "font-size"
        // cannot be detected on hidden containers such as separated paenl iframe.
        if (!that.initialSize) {
            that.initialSize = getTextSizeInPxFunc();
        }

        if (that.initialSize) {
            var targetSize = times * that.initialSize;
            that.root.css("font-size", targetSize + "px");
        }
    };

    /*******************************************************************************
     * lineSpace
     *
     * Sets the line space on the container to the multiple provided.
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.lineSpace", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.lineSpace": {
                "model.value": "default"
            }
        },
        fontSizeMap: {},  // must be supplied by implementors
        invokers: {
            set: {
                funcName: "fluid.prefs.enactor.lineSpace.set",
                args: ["{arguments}.0", "{that}", "{that}.getLineHeightMultiplier"]
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
                args: [{expander: {func: "{that}.getLineHeight"}}, {expander: {func: "{that}.getTextSizeInPx"}}]
            }
        },
        modelListeners: {
            value: {
                listener: "{that}.set",
                args: ["{change}.value"]
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
            return Number(lineHeight);
        }

        return Math.round(parseFloat(lineHeight) / fontSize * 100) / 100;
    };

    fluid.prefs.enactor.lineSpace.set = function (times, that, getLineHeightMultiplierFunc) {
        // Calculating the initial size here rather than using a members expand because the "line-height"
        // cannot be detected on hidden containers such as separated paenl iframe.
        if (!that.initialSize) {
            that.initialSize = getLineHeightMultiplierFunc();
        }

        // that.initialSize === 0 when the browser returned "lineHeight" css value is undefined,
        // which occurs when firefox detects "line-height" value on a hidden container.
        // @ See getLineHeightMultiplier() & http://issues.fluidproject.org/browse/FLUID-4500
        if (that.initialSize) {
            var targetLineSpace = times * that.initialSize;
            that.container.css("line-height", targetLineSpace);
        }
    };

    /*******************************************************************************
     * tableOfContents
     *
     * To create and show/hide table of contents
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.tableOfContents", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.tableOfContents": {
                "model.toc": "default"
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
        modelListeners: {
            toc: {
                listener: "{that}.applyToc",
                args: ["{change}.value"]
            }
        },
        distributeOptions: {
            source: "{that}.options.ignoreForToC",
            target: "{that tableOfContents}.options.ignoreForToC"
        }
    });

    fluid.prefs.enactor.tableOfContents.applyToc = function (value, that) {
        if (value) {
            if (that.tableOfContents) {
                that.tableOfContents.show();
            } else {
                that.events.onCreateTOCReady.fire();
            }
        } else if (that.tableOfContents) {
            that.tableOfContents.hide();
        }
    };

    /*******************************************************************************
     * muteAudio
     *
     * To mute and unmute all audios and videos in the page
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.muteAudio", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.muteAudio": {
                "model.muteAudio": "default"
            }
        },
        invokers: {
            applyMuteAudio: {
                funcName: "fluid.prefs.enactor.muteAudio.applyMuteAudio",
                args: ["{arguments}.0"]
            }
        },
        modelListeners: {
            muteAudio: {
                listener: "{that}.applyMuteAudio",
                args: ["{change}.value"]
            }
        }
    });

    // An array in which all the components that have been muted by this option are stored
    var mutedComponents = [];

    fluid.prefs.enactor.muteAudio.applyMuteAudio = function (value) {
        var audios = $("audio, video");
        if (value) {
            audios.each(function () {
                if (!$(this).prop("muted")) {
                    $(this).prop("muted", true);
                    mutedComponents.push(this);
                }
            });
        }
        else {
            audios.each(function () {
                for (var index in mutedComponents) {
                    if (mutedComponents[index] == this) {
                        $(this).prop("muted", false);
                        mutedComponents.splice(index,1);
                        break;
                    }
                }
            });
        }
    };

    /*******************************************************************************
     * blueColorFilter
     *
     * Sets the intensity of the blue color of the page to the multiple provided.
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.blueColorFilter", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.blueColorFilter": {
                "model.value": "default"
            }
        },
        expander: {
            func: "{that}.addMutationObserver"
        },
        invokers: {
            applyFilter: {
                funcName: "fluid.prefs.enactor.blueColorFilter.applyFilter",
                args: ["{that}.model.value"]
            },
            addMutationObserver: {
                funcName: "fluid.prefs.enactor.blueColorFilter.addMutationObserver",
                args: ["{that}.applyFilter"]
            }
        },
        modelListeners: {
            value: {
                listener: "{that}.applyFilter"
            }
        }
    });

    /*Used in fluid.prefs.enactor.blueColorFilter.applyFilter and fluid.prefs.enactor.blueColorFilter.addMutationObserver
     had to be defined here in order to not be create every time the model is changed */
    var initialColorsDictionary = [];
    var noMatchFlag = true;
    var changedDOMFlag = false;
    var blueColorFilterValue;

    fluid.prefs.enactor.blueColorFilter.applyFilter = function (times) {
        // Prevents a bug when the panel is open and the model.value becomes undefined
        if (times === undefined) {
            times = blueColorFilterValue;
        }
        blueColorFilterValue = times;
        var elements = $("body *");
        var index;
        elements.each(function () {
            var element = this;
            // Checks if the element exists in the dictionary with keys the elements and values the colors
            for (var count in initialColorsDictionary) {
                if (initialColorsDictionary[count].key == this) {
                    noMatchFlag = false;
                    break;
                }
            }
            // If it is not already in the records its color and background-color are added as arrays
            if (noMatchFlag) {
                var color = $(element).css("color");  // get the color as "rgb(..., ..., ...)"
                color = color.slice(4, -1);
                color = color.split(", ");  // color becomes and array with the 3 color components as his elements
                var backgroundColor = $(element).css("background-color"); // the color can be is rgb or rgba format
                if (backgroundColor.substr(0,4) === "rgba") {
                    backgroundColor = backgroundColor.slice(5,-1);
                }
                else {
                    backgroundColor = backgroundColor.slice(4,-1);
                }
                backgroundColor = backgroundColor.split(", ");
                initialColorsDictionary.push({
                    key: this,
                    color: color,
                    backgroundColor: backgroundColor
                });
            }
            noMatchFlag = true;
        });

        var initialColors = $.extend(true, [], initialColorsDictionary);  // make a deep copy of the original array in order to prevent changes in the initial array
        elements.each(function () {
            // Finds the element in the dictionary
            for (var count in initialColors) {
                if (initialColors[count].key == this) {
                    index = count;
                    break;
                }
            }
            var color = initialColors[index].color;  //get the color of the current component
            color[2] = Math.round(color[2] * (1 - times)) + "";  //blue component
            var colorToSet = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";  //make the color in a "rbg(..,..,..)" format
            $(this).css("color", colorToSet);
            var backgroundColor = initialColors[index].backgroundColor;
            backgroundColor[2] = Math.round(backgroundColor[2] * (1 - times)) + "";
            if (backgroundColor[3] === undefined) {
                var backgroundColorToSet = "rgb(" + backgroundColor[0] + ", " + backgroundColor[1] + ", " + backgroundColor[2] + ")";
            }
            else {
                var backgroundColorToSet = "rgba(" + backgroundColor[0] + ", " + backgroundColor[1] + ", " + backgroundColor[2] + ", " + backgroundColor[3] + ")";
            }
            $(this).css("background-color", backgroundColorToSet);
        });
    };

    fluid.prefs.enactor.blueColorFilter.addMutationObserver = function (applyFilter) {
        // Uses document ready, because the script is added before the body
        $(document).ready(function (){
            var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            if (isSafari) {
                var observer = new WebKitMutationObserver(function(mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.type === "childList") {
                            // Changes in HTMLHtmlElement can be just hovering over elements, which should not trigger applyFilter
                            if (changedDOMFlag === false && mutation.target != "[object HTMLHtmlElement]") {
                                changedDOMFlag = true;
                                applyFilter();
                            }
                        }
                    });
                    changedDOMFlag = false;
                });
            }
            else {
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.type === "childList") {
                            // Changes in HTMLHtmlElement can be just hovering over elements, which should not trigger applyFilter
                            if (changedDOMFlag === false && mutation.target != "[object HTMLHtmlElement]") {
                                changedDOMFlag = true;
                                applyFilter();
                            }
                        }
                    });
                    changedDOMFlag = false;
                });
            }

            var target = document.body;
            var config = {
                childList : true,
                subtree : true
            };

            observer.observe(target, config);
        });
    };

    /* Add a mutationObserver to track when the UI panel in its responsive version is opened.
       It then adds and removes a class to the hide/show button to style it properly. */
    $(document).ready(function (){
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        function observerFunction() {
            var openedResponsivePanelCheck = $(".flc-slidingPanel-panel.flc-prefsEditor-iframe").attr("aria-expanded");
            var panelButtons = $(".fl-prefsEditor-buttons");
            if (openedResponsivePanelCheck == "true" && $(window).width() < 640) {
                panelButtons.addClass("flc-prefsEditor-opened-panel-buttons");
            }
            else {
                panelButtons.removeClass("flc-prefsEditor-opened-panel-buttons")
            }
        }

        if (isSafari) {
            var observer = new WebKitMutationObserver(function(mutations) {
                mutations.forEach(function (mutation) {
                    observerFunction();
                });
            });
        }
        else {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function (mutation) {
                    observerFunction();
                });
            });
        }

        var target = document.querySelector(".flc-slidingPanel-panel.flc-prefsEditor-iframe");
        var config = {
            subtree : true,
            attributeFilter: ["aria-expanded"]
        };

        observer.observe(target, config);
    });
})(jQuery, fluid_2_0_0);
