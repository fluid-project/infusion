/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global fluid */

var example = example || {};
(function ($, fluid) {
    "use strict";

    fluid.defaults("example.prefs.localization", {
        gradeNames: ["fluid.prefs.constructed.localizationPrefsEditorConfig"],
        localizationScheme: "urlPath",
        localeNames: ["localization-default", "localization-en", "localization-fr", "localization-es", "localization-fa"],
        locales: ["", "en", "fr", "es", "fa"],
        langMap: {
            "en": "en",
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
     * Used as an expander to find the `langSegIndex`. For most implementations this would actually refer to 1; which is
     * the default `langSegIndex` set in the component's defaults. Meaning a scheme such as this would not be required.
     * However, the way this example is constructed, the `langSegIndex` is at the end of the path.
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
        var index = 1;

        // Add an empty string to capture the case where no language has been set in the URL.
        langVals.unshift("");

        fluid.each(langVals, function (langVal) {
            // we use `lastIndexOf` because we know the language code is set at the end of the URL in this example
            var foundIndex = pathSegs.lastIndexOf(langVal);
            if (foundIndex >= 0) {
                index = foundIndex;
            }
        });

        return index;
    };

})(jQuery, fluid);
