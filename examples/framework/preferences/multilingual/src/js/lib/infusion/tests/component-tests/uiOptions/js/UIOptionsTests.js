/*
Copyright 2011-2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

 */

/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {

        jqUnit.module("UIOptions Tests");

        jqUnit.asyncTest("Pass in customized toc template", function () {
            jqUnit.expect(2);

            var customizedTocTemplate = "../../../../src/components/tableOfContents/html/TableOfContents.html";

            fluid.uiOptions.prefsEditor(".flc-prefsEditor-separatedPanel", {
                tocTemplate: customizedTocTemplate,
                listeners: {
                    onReady: function (that) {
                        jqUnit.assertEquals("The toc template is applied properly to the pageEnhancer", customizedTocTemplate, that.enhancer.uiEnhancer.fluid_prefs_enactor_tableOfContents.options.tocTemplate);
                        jqUnit.assertEquals("FLUID-5474: The toc template is applied properly to iframeEnhancer", customizedTocTemplate, that.prefsEditorLoader.iframeRenderer.iframeEnhancer.fluid_prefs_enactor_tableOfContents.options.tocTemplate);
                        jqUnit.start();
                    }
                },
                terms: {
                    templatePrefix: "../../../../src/framework/preferences/html",
                    messagePrefix: "../../../../src/framework/preferences/messages"
                }
            });
        });

    });
})(jQuery);
