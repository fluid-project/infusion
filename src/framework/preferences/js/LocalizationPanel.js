/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    /***********************************
     * Preferences Editor Localization *
     ***********************************/

    /**
    * A sub-component of fluid.prefs that renders the "localization" panel of the user preferences interface.
    */
    fluid.defaults("fluid.prefs.panel.localization", {
        gradeNames: ["fluid.prefs.panel"],
        preferenceMap: {
            "fluid.prefs.localization": {
                "model.value": "default",
                "controlValues.localization": "enum"
            }
        },
        mergePolicy: {
            "controlValues.localization": "replace",
            "stringArrayIndex.localization": "replace"
        },
        selectors: {
            header: ".flc-prefsEditor-localization-header",
            localization: ".flc-prefsEditor-localization",
            label: ".flc-prefsEditor-localization-label",
            localizationDescr: ".flc-prefsEditor-localization-descr"
        },
        selectorsToIgnore: ["header"],
        stringArrayIndex: {
            localization: ["localization-en", "localization-es", "localization-fa", "localization-fr"]
        },
        protoTree: {
            label: {messagekey: "label"},
            localizationDescr: {messagekey: "description"},
            localization: {
                optionnames: "${{that}.msgLookup.localization}",
                optionlist: "${{that}.options.controlValues.localization}",
                selection: "${value}",
                decorators: {
                    type: "fluid",
                    func: "fluid.prefs.selectDecorator",
                    options: {
                        styles: "{that}.options.classnameMap.localization"
                    }
                }
            }
        },
        classnameMap: null, // must be supplied by implementors
        controlValues: {
            localization: ["en", "es", "fa", "fr"]
        }
    });

})(jQuery, fluid_3_0_0);
