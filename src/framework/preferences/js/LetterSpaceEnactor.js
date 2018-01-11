/*
Copyright 2017 OCAD University

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
     * characters will decrease. Setting the size to 0 will use the default letter
     * space.``
     *******************************************************************************/

    // Note that the implementors need to provide the container for this view component
    fluid.defaults("fluid.prefs.enactor.letterSpace", {
        gradeNames: ["fluid.prefs.enactor", "fluid.viewComponent"],
        preferenceMap: {
            "fluid.prefs.letterSpace": {
                "model.value": "default"
            }
        },
        fontSizeMap: {},  // must be supplied by implementors
        members: {
            root: {
                expander: {
                    "this": "{that}.container",
                    "method": "closest", // ensure that the correct document is being used. i.e. in an iframe
                    "args": ["html"]
                }
            }
        },
        invokers: {
            set: {
                funcName: "fluid.prefs.enactor.letterSpace.set",
                args: ["{that}", "{arguments}.0"]
            }
        },
        modelListeners: {
            unit: {
                listener: "{that}.set",
                args: ["{change}.value"]
            }
        },
        modelRelay: {
            target: "unit",
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

    fluid.prefs.enactor.letterSpace.set = function (that, units) {
        var targetSize = units  ? units + "em" : "normal";
        that.root.css("letter-spacing", targetSize);
    };

})(jQuery, fluid_3_0_0);
