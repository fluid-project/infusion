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
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        jqUnit.module("FullPreviewPrefsEditor Tests");

        /**************************************************
         * fluid.fullPreviewPrefsEditor Integration Tests *
         **************************************************/
        fluid.demands("fluid.prefs.preview", ["fluid.prefs.fullPreview"], {
            options: {
                templateUrl: "TestPreviewTemplate.html"
            }
        });

        fluid.tests.prefs.integrationTest("fluid.prefs.fullPreview", false);

        var testSettings = {
            textSize: "1.5",
            textFont: "verdana",
            theme: "bw",
            layout: false,
            toc: true,
            links: true
        };

        // TODO: we need MUCH better event boiling support in order to avoid rubbish like this
        var that, prefsEditor;
        function testToCEnhancement(innerPrefsEditor) {
            prefsEditor = innerPrefsEditor;
        }

        function requestApplierChange() {
            fluid.tests.prefs.applierRequestChanges(prefsEditor, testSettings);
        }

        function testToCEnhancement2() {
            var container = prefsEditor.preview.enhancerContainer;
            var links = $(".flc-toc-tocContainer a", container);
            jqUnit.assertTrue("ToC links created", links.length > 0);
            jqUnit.start();
        }

        that = fluid.tests.prefs.mungingIntegrationTest("fluid.prefs.fullPreview", "#myPrefsEditor", {
            previewEnhancer: {
                components: {
                    tableOfContents: {
                        options: {
                            listeners: {
                                afterTocRender: {
                                    listener: testToCEnhancement2,
                                    priority: "last"
                                }
                            }
                        }
                    }
                }
            },
            preview: {
                templateUrl: "TestPreviewTemplate.html",
                listeners: {
                    "onReady.toc2": {
                        listener: requestApplierChange,
                        priority: "last"
                    }
                }
            }
        }, testToCEnhancement);
    });

})(jQuery);
