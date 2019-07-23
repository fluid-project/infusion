/*
Copyright 2011-2019 OCAD University
Copyright 2011 Lucendo Development Ltd.

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

    /**
     * The Preferences Editor interface is defined by several HTML templates. The component
     * needs to know where those templates are. This variable will be used by all
     * versions of the component.
     */
    var pathToTemplates = "../../../../src/framework/preferences/html";
    var pathToMessages = "../../../../src/framework/preferences/messages";

    /**
     * The UI Enhancer's Table of Contents uses a template and message bundle. These path variables are used by all
     * three versions of the component, as well as by the UI Enhancer present in the Preview itself.
     */
    var pathToTocTemplate = "../../../../src/components/tableOfContents/html/TableOfContents.html";
    var pathToTocMessage = "../../../../src/framework/preferences/messages/tableOfContents-enactor.json";

    /**
     * Initialize a settings store for the page.
     */
    example.initSettingsStore = function () {
        fluid.prefs.globalSettingsStore();
    };

    /**
     * Initialize UI Enhancer for the page. This function is used by the two full-page
     * Preferences Editor pages as well as by the example page itself.
     * @param {String} customThemeName - The name of the custom theme.
     *
     * @return {Component} - An instance of the fluid.pageEnhancer
     */
    example.initPageEnhancer = function (customThemeName) {
        return fluid.pageEnhancer({
            uiEnhancer: {
                gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                tocTemplate: pathToTocTemplate,
                tocMessage: pathToTocMessage,
                classnameMap: {
                    theme: {
                        "default": customThemeName
                    }
                }
            }
        });
    };

    /**
     * Initialize Preferences Editor. This version of Preferences Editor uses the
     * page itself as a live preview.
     * @param {jQueryable} container - The Preference Editor's container element
     */
    example.initPrefsEditor = function (container) {
        fluid.prefs.separatedPanel(container, {
            gradeNames: ["fluid.prefs.transformDefaultPanelsOptions", "fluid.prefs.initialModel.starter"],
            // Tell preference editor where to find all the templates, relative to this path
            terms: {
                templatePrefix: pathToTemplates,
                messagePrefix: pathToMessages
            },
            templateLoader: {
                gradeNames: ["fluid.prefs.starterSeparatedPanelTemplateLoader"]
            },
            messageLoader: {
                gradeNames: ["fluid.prefs.starterMessageLoader"]
            },
            prefsEditor: {
                gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.uiEnhancerRelay"]
            }
        });
    };

})(jQuery, fluid);
