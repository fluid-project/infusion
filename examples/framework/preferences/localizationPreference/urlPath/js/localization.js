/*
Copyright 2018-2019 OCAD University

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

    fluid.defaults("example.prefs.localization", {
        gradeNames: ["fluid.prefs.constructed.localizationPrefsEditorConfig"],
        localizationScheme: "urlPath",
        localeNames: ["localization-default", "localization-en", "localization-fr", "localization-es", "localization-fa"],
        locales: ["default", "en", "fr", "es", "fa"],
        langMap: {
            "default": null,
            "en": "",
            "es": "es",
            "fa": "fa",
            "fr": "fr"
        },
        langSegIndex: {
            expander: {
                funcName: "example.prefs.localization.getLangSegIndex",
                args: ["{that}.options.langMap"]
            }
        }
    });

    /**
     * Used as an expander to find the `langSegIndex`. For most implementations this would actually refers to 1 and is
     * the default `langSegIndex` set in the component's defaults. Meaning a scheme such as this would not be required.
     * However, the way this example is constructed and expected to run, the `langSegIndex` is at the end of the path.
     * Because we don't know ahead of time how this example will be served, we don't know the full path and must
     * dynamically calculate the index.
     *
     * @param {Object} langMap - a mapping of language code to URL path resource.
     *
     * @return {Integer} - The `lagSegIndex`. Defaults to 1 if none of the values from the langMap are found in the
     *                     current location's pathname.
     */
    example.prefs.localization.getLangSegIndex = function (langMap) {
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
