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

(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.uiOptions", {
        gradeNames: ["fluid.prefs.builder", "fluid.viewComponent"],
        preferences: [
            "fluid.prefs.textSize",
            "fluid.prefs.lineSpace",
            "fluid.prefs.textFont",
            "fluid.prefs.contrast",
            "fluid.prefs.tableOfContents",
            "fluid.prefs.enhanceInputs"
        ]
    });

    /** A configuration of UIOptions which is suitable for statically localised contexts. It accepts two top-level
     * options,
     * {String} locale - The initial locale in which UIOptions should render
     * {String} direction - A suitable value for the `dir` attribute of the UIOptions container - this may take
     * values `ltr`, `rtl` or `auto`
     */
    fluid.defaults("fluid.uiOptions.multilingual", {
        gradeNames: ["fluid.uiOptions"],
        distributeOptions: {
            source: "{that}.options.locale",
            target: "{that messageLoader}.options.resourceOptions.locale"
        },
        listeners: {
            "onPrefsEditorReady.addLanguageAttributesToBody": {
                func: "fluid.uiOptions.multilingual.addLanguageAttributesToBody",
                args: ["{that}.prefsEditorLoader.prefsEditor.container", "{that}.options.locale", "{that}.options.direction"],
                priority: "first"
            }
        }
    });

    /**
     * Adds the locale and direction to the BODY in the IFRAME to enable CSS
     * based on the locale and direction
     *
     * @param {jQuery} prefsEditorContainer - the DOM container for UIO
     * @param {String} locale - the locale to apply
     * @param {String} direction - the text orientation to apply
     */
    fluid.uiOptions.multilingual.addLanguageAttributesToBody = function (prefsEditorContainer, locale, direction) {
        prefsEditorContainer.attr("lang", locale);
        prefsEditorContainer.attr("dir", direction || "");
    };

})(jQuery, fluid_4_0_0);
