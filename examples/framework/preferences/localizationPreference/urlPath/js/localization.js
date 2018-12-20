/*
Copyright 2018 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var example = example || {};
(function ($, fluid) {
    "use strict";

    fluid.prefs.builder({
        gradeNames: ["fluid.prefs.auxSchema.localization"],
        auxiliarySchema: {
            "namespace": "example.prefs.localization"
        }
    });

    fluid.defaults("example.prefsEditor", {
        gradeNames: ["example.prefs.localization.prefsEditor"],
        localizationOpts: {
            enactor: {
                localizationScheme: "urlPath",
                langMap: {
                    "default": null,
                    "en": "",
                    "es": "es",
                    "fa": "fa",
                    "fr": "fr"
                },
                langSegIndex: {
                    expander: {
                        funcName: "example.prefsEditor.getLangSegIndex",
                        args: ["{example.prefsEditor}.options.localizationOpts.enactor.langMap"]
                    }
                }
            },
            panel: {
                controlValues: {
                    localization: ["default", "en", "fr", "es", "fa"]
                }
            }
        },
        distributeOptions: {
            "example.localization.defaultLocale": {
                source: "{that}.options.defaultLocale",
                target: "{that prefsEditorLoader}.options.defaultLocale"
            },
            "example.localization.localizationEnactor": {
                source: "{that}.options.localizationOpts.enactor",
                target: "{that uiEnhancer fluid.prefs.enactor.localization}.options"
            },
            "example.localization.localizationPanel": {
                source: "{that}.options.localizationOpts.panel",
                target: "{that prefsEditor fluid.prefs.panel.localization}.options"
            },
            "example.localization.template": {
                source: "{that}.options.template",
                target: "{that prefsEditorLoader > templateLoader}.options.resources.prefsEditor"
            }
        }
    });

    /**
     * Used as an expander to find the langSegIndex. For most implementations this would actually refer to 1, which
     * is the default value; meaning a scheme such as this would not be required. However, the way this example is
     * constructed and expected to run, the langSegIndex is at the end of the path. Because we don't know ahead of time
     * where how the example will be served, we don't know the full path and must dynamically calculate the index.
     *
     * @param {Object} langMap - a mapping of language code to URL path resource.
     *
     * @return {Integer} - The lagSegIndex. Defaults to 1 if none of the values from the langMap are found in the
     *                     current location pathname.
     */
    example.prefsEditor.getLangSegIndex = function (langMap) {
        var langVals = fluid.values(langMap);
        var pathSegs = location.pathname.split("/");
        var index = "1";

        fluid.each(langVals, function (langVal) {
            var foundIndex = pathSegs.lastIndexOf(langVal);
            if (foundIndex >= 0) {
                index = foundIndex;
            }
        });

        return index;
    };

})(jQuery, fluid);
