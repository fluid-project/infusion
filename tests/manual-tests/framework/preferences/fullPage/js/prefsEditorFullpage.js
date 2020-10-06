/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var demo = demo || {};
(function ($, fluid) {
    "use strict";

    /*
     * The Preferences Editor interface is defined by several HTML templates. The component
     * needs to know where those templates are. This variable will be used by all
     * versions of the component.
     */
    var pathToTemplates = "../../../../../src/framework/preferences/html";

    /*
     * The strings used on Preferences Editor interface is defined by several JSON files. The component
     * needs to know where those files are. This variable will be used by all versions of the
     * component.
     */
    var pathToMessages = "../../../../../src/framework/preferences/messages";

    /*
     * The UI Enhancer's Table of Contents uses a template. This path variable is used by all
     * three versions of the component, as well as by the UI Enhancer present in the Preview
     * itself.
     */
    var pathToTocTemplate = "../../../../../src/components/tableOfContents/html/TableOfContents.html";
    var pathToTocMessage = "../../../../../src/framework/preferences/messages/tableOfContents-enactor.json";

    /*
     * Initialize PrefsEditor global settings store.
     */
    demo.initSettingsStore = function () {
        fluid.prefs.globalSettingsStore();
    };

    /*
     * Initialize UI Enhancer for the page.
     */
    demo.initPageEnhancer = function (customThemeName) {
        fluid.pageEnhancer({
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

    /*
     * Initialize Full Page preferences editor
     */
    demo.initFullWithPreview = function (container, options) {
        var opts = {
            gradeNames: ["fluid.prefs.transformDefaultPanelsOptions", "fluid.prefs.initialModel.starter"],
            // Tell PrefsEditor where to find all the templates, relative to this file
            terms: {
                templatePrefix: pathToTemplates,
                messagePrefix: pathToMessages
            },
            messageLoader: {
                gradeNames: ["fluid.prefs.starterMessageLoader"]
            },
            // Tell PrefsEditor where to redirect to if the user cancels the operation
            prefsEditor: {
                gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.uiEnhancerRelay"],
                listeners: {
                    "onCancel.alert": function () {
                        alert("Cancelled - would normally cancel any unsaved changes and return to the previous page.");
                    }
                }
            },
            templateLoader: {
                gradeNames: ["fluid.prefs.starterFullPreviewTemplateLoader"]
            }
        };
        fluid.prefs.fullPreview(container, $.extend(true, {}, opts, options));
    };

})(jQuery, fluid);
