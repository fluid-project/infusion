/*
Copyright 2011-2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var assortedContent = assortedContent || {};
(function ($, fluid) {
    "use strict";

    /* Our demo script */
    assortedContent.slidingPrefsEditor = function () {
        // First, start up Settings Store and Page Enhancer
        fluid.prefs.globalSettingsStore();
        fluid.pageEnhancer({
            uiEnhancer: {
                gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                classnameMap: {
                    theme: {
                        "default": "assortedContent-theme-basic"
                    }
                },
                tocTemplate: "../../../../../src/components/tableOfContents/html/TableOfContents.html"
            }
        });

        // Next, start up Preferences Editor
        fluid.prefs.separatedPanel(".flc-prefsEditor-separatedPanel", {
            gradeNames: ["fluid.prefs.transformDefaultPanelsOptions", "fluid.prefs.initialModel.starter"],
            terms: {
                templatePrefix: "../../../../../src/framework/preferences/html/",
                messagePrefix: "../../../../../src/framework/preferences/messages/"
            },
            iframeRenderer: {
                markupProps: {
                    src: "html/SeparatedPanelPrefsEditorFrame.html"
                }
            },
            messageLoader: {
                gradeNames: ["fluid.prefs.starterMessageLoader"]
            },
            templateLoader: {
                gradeNames: ["fluid.prefs.starterSeparatedPanelTemplateLoader"]
            },
            prefsEditor: {
                gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.uiEnhancerRelay"]
            }
        });
    };

})(jQuery, fluid);
