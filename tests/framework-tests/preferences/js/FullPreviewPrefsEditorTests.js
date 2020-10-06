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

/* global jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        jqUnit.module("FullPreviewPrefsEditor Tests");

        /**************************************************
         * fluid.fullPreviewPrefsEditor Integration Tests *
         **************************************************/

        fluid.tests.prefs.integrationTest("fluid.prefs.fullPreview", false);

        fluid.registerNamespace("fluid.tests.prefs.FullPreviewMungingIntegration");

        fluid.tests.prefs.FullPreviewMungingIntegration.testSettings = {
            preferences: {
                textSize: "1.5",
                textFont: "verdana",
                theme: "bw",
                layout: false,
                toc: true
            }
        };

        fluid.tests.prefs.FullPreviewMungingIntegration.assertToCEnhancement = function (container) {
            var links = $(".flc-toc-tocContainer a", container);
            jqUnit.assertTrue("ToC links created", links.length > 0);
        };

        fluid.defaults("fluid.tests.prefs.FullPreviewMungingIntegration", {
            gradeNames: ["fluid.tests.prefs.mungingIntegration"],
            previewEnhancer: {
                components: {
                    tableOfContents: {
                        options: {
                            listeners: {
                                "afterTocRender.verifyToCEnhancement": {
                                    listener: "fluid.tests.prefs.FullPreviewMungingIntegration.assertToCEnhancement",
                                    args: ["{that}.container"],
                                    priority: "last:testing"
                                },
                                "afterTocRender.jqUnitStart": {
                                    listener: "jqUnit.start",
                                    priority: "after:verifyToCEnhancement"
                                }
                            }
                        }
                    }
                }
            },
            preview: {
                templateUrl: "TestPreviewTemplate.html"
            },
            prefsEditor: {
                listeners: {
                    "onReady.applyTestSettings": {
                        listener: "fluid.tests.prefs.applierRequestChanges",
                        args: ["{that}", fluid.tests.prefs.FullPreviewMungingIntegration.testSettings]
                    },
                    // Override jqUnit.start call to have it run at afterToCRender
                    "onReady.jqUnitStart": {
                        func: "fluid.identity",
                        priority: "last:testing"
                    }
                }
            }
        });

        fluid.tests.prefs.mungingIntegrationTest("fluid.prefs.fullPreview", "#myPrefsEditor", {
            gradeNames: ["fluid.tests.prefs.FullPreviewMungingIntegration"]
        });
    });
})(jQuery);
