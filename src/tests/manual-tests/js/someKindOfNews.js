/*
Copyright 2011 OCAD University

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

var skon = skon || {};
(function ($, fluid) {

    /* Our demo script */
    skon.slidingPrefsEditor = function (panel, prefsEditor) {
        // First, start up Settings Store and Page Enhancer
        fluid.globalSettingsStore();
        fluid.pageEnhancer({
            uiEnhancer: {
                gradeNames: ["fluid.uiEnhancer.starterEnactors"],
                classnameMap: {
                    theme: {
                        "default": "skon-theme-basic"
                    }
                },
                tocTemplate: "../../../components/tableOfContents/html/TableOfContents.html"
            }
        });

        // Next, start up Preferences Editor
        fluid.prefs.separatedPanel(".flc-prefsEditor-separatedPanel", {
            gradeNames: ["fluid.prefs.transformDefaultPanelsOptions"],
            templatePrefix: "../../../framework/preferences/html/",
            messagePrefix: "../../../framework/preferences/messages/",
            messageLoader: {
                gradeNames: ["fluid.prefs.starterMessageLoader"]
            },
            templateLoader: {
                gradeNames: ["fluid.prefs.starterSeparatedPanelTemplateLoader"]
            },
            prefsEditor: {
                gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.rootModel.starter", "fluid.prefs.uiEnhancerRelay"]
            },
            iframeRenderer: {
                markupProps: {
                    src: "../../../framework/preferences/html/SeparatedPanelPrefsEditorFrame.html"
                }
            }
        });
    };

})(jQuery, fluid);
