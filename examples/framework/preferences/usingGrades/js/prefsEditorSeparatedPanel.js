/*
Copyright 2011 OCAD University
Copyright 2011 Lucendo Development Ltd.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global demo:true, fluid */

var demo = demo || {};
(function ($, fluid) {
    "use strict";

    /**
     * The Preferences Editor interface is defined by several HTML templates. The component
     * needs to know where those templates are. This variable will be used by all
     * versions of the component.
     */
    var pathToTemplates = "../../../framework/preferences/html/";
    var pathToMessages = "../../../framework/preferences/messages/";

    /**
     * The UI Enhancer's Table of Contents uses a template. This path variable is used by all
     * three versions of the component, as well as by the UI Enhancer present in the Preview
     * itself.
     */
    var pathToTocTemplate = "../../../components/tableOfContents/html/TableOfContents.html";

    /**
     * Initialize a settings store for the page.
     */
    demo.initSettingsStore = function () {
        fluid.globalSettingsStore();
    };

    /**
     * Initialize UI Enhancer for the page. This function is used by the two full-page
     * Preferences Editor pages as well as by the demo page itself.
     */
    demo.initPageEnhancer = function (customThemeName) {
        fluid.pageEnhancer({
            uiEnhancer: {
                gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                tocTemplate: pathToTocTemplate,
                classnameMap: {
                    theme: {
                        "default": customThemeName
                    }
                }
            }
        });
    };

    var commonOpts = {
        gradeNames: ["fluid.prefs.transformDefaultPanelsOptions"],
        // Tell preference editor where to find all the templates, relative to this path
        templatePrefix: pathToTemplates,
        messagePrefix: pathToMessages,
        templateLoader: {
            gradeNames: ["fluid.prefs.starterSeparatedPanelTemplateLoader"]
        },
        messageLoader: {
            gradeNames: ["fluid.prefs.starterMessageLoader"]
        },
        prefsEditor: {
            gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.rootModel.starter", "fluid.prefs.uiEnhancerRelay"]
        }
    };

    /**
     * Initialize Preferences Editor. This version of Preferences Editor uses the
     * page itself as a live preview.
     */
    demo.initPrefsEditor = function (container) {
        fluid.prefs.separatedPanel(container, commonOpts);
    };

})(jQuery, fluid);
