/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global skon:true, fluid, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};
(function ($, fluid) {
    /**
     * The Preferences Editor interface is defined by several HTML templates. The component
     * needs to know where those templates are. This variable will be used by all
     * versions of the component.
     */
    var pathToTemplates = "../../../framework/preferences/html/";

    /**
     * The strings used on Preferences Editor interface is defined by several JSON files. The component
     * needs to know where those files are. This variable will be used by all versions of the
     * component.
     */
    var pathToMessages = "../../../framework/preferences/messages/";

    /**
     * The UI Enhancer's Table of Contents uses a template. This path variable is used by all
     * three versions of the component, as well as by the UI Enhancer present in the Preview
     * itself.
     */
    var pathToTocTemplate = "../../../components/tableOfContents/html/TableOfContents.html";

    /**
     * Initialize PrefsEditor global settings store.
     */
    demo.initSettingsStore = function () {
        fluid.globalSettingsStore();
    };

    /**
     * Initialize UI Enhancer for the page.
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

    /**
     * The basic options for configuring the full-page versions of Preferences Editor are the same,
     * regardless of whether or not the Preview is used. These settings used by both
     * full-page version, with and without Preview.
     */
    var basicFullPageOpts = {
        gradeNames: ["fluid.prefs.transformDefaultPanelsOptions"],
        // Tell PrefsEditor where to find all the templates, relative to this file
        templatePrefix: pathToTemplates,
        messagePrefix: pathToMessages,
        messageLoader: {
            gradeNames: ["fluid.prefs.starterMessageLoader"]
        },
        // Tell PrefsEditor where to redirect to if the user cancels the operation
        prefsEditor: {
            gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.rootModel.starter", "fluid.prefs.uiEnhancerRelay"],
            listeners: {
                onCancel: function () {
                    alert("Cancelled - would normally cancel any unsaved changes and return to the previous page.");
                }
            }
        }
    };

    /**
     * Initialize Preferences Editor on the "Full Page, No Preview" version.
     */
    demo.initFullNoPreview = function (container, options) {
        var noPreviewOps = {
            templateLoader: {
                gradeNames: ["fluid.prefs.starterFullNoPreviewTemplateLoader"]
            }
        };
        fluid.prefs.fullNoPreview(container, $.extend(true, {}, basicFullPageOpts, noPreviewOps, options));
    };

    /**
     * Initialize Preferences Editor on the "Full Page, With Preview" version.
     */
    demo.initFullWithPreview = function (container, options) {
        var previewOps = {
            templateLoader: {
                gradeNames: ["fluid.prefs.starterFullPreviewTemplateLoader"]
            }
        };
        fluid.prefs.fullPreview(container, $.extend(true, {}, basicFullPageOpts, previewOps, options));
    };

})(jQuery, fluid);
