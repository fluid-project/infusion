/*
Copyright 2007-2018 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /*******************************************************************************
     * letterSpace
     *
     * Sets the letter space on the container to the number of units to increase
     * the letter space by. If a negative number is provided, the space between
     * characters will decrease. Setting the value to 1 or unit to 0 will use the
     * default letter space.
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.letterSpace", {
        gradeNames: ["fluid.prefs.enactor.textRelatedSizer"],
        preferenceMap: {
            "fluid.prefs.letterSpace": {
                "model.value": "value"
            }
        },
        members: {
            originalLetterSpace: {
                expander: {
                    func: "{that}.getLetterSpace"
                }
            }
        },
        invokers: {
            set: {
                funcName: "fluid.prefs.enactor.letterSpace.set",
                args: ["{that}", "{arguments}.0"]
            },
            getLetterSpace: {
                funcName: "fluid.prefs.enactor.letterSpace.getLetterSpace",
                args: ["{that}", "{that}.getTextSizeInPx"]
            }
        },
        modelListeners: {
            unit: {
                listener: "{that}.set",
                args: ["{change}.value"],
                namespace: "setAdaptation"
            },
            // Replace default model listener, because `value` needs be transformed before being applied.
            // The `unit` model value should be used for setting the adaptation.
            value: {
                listener: "fluid.identity",
                namespace: "setAdaptation"
            }
        },
        modelRelay: {
            target: "unit",
            namespace: "toUnit",
            singleTransform: {
                type: "fluid.transforms.round",
                scale: 1,
                input: {
                    transform: {
                        "type": "fluid.transforms.linearScale",
                        "offset": -1,
                        "input": "{that}.model.value"
                    }
                }
            }
        }
    });

    fluid.prefs.enactor.letterSpace.getLetterSpace = function (that, getTextSizeFn) {
        var current = parseFloat(that.container.css("letter-spacing"));
        var textSize = getTextSizeFn();
        return fluid.roundToDecimal(current / textSize, 2);
    };

    fluid.prefs.enactor.letterSpace.set = function (that, units) {
        var targetSize = that.originalLetterSpace;

        if (units) {
            targetSize = targetSize + units;
        }

        // setting the style value to "" will remove it.
        var letterSpace = targetSize ?  fluid.roundToDecimal(targetSize, 2) + "em" : "";
        that.container.css("letter-spacing", letterSpace);
    };

})(jQuery, fluid_3_0_0);
