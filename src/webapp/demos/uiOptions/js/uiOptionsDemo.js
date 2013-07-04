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
/*global demo:true, fluid, jQuery, window*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};
(function ($, fluid) {       

    /**
     * The UI Options interface is defined by several HTML templates. The component
     * needs to know where those templates are. This variable will be used by all
     * versions of the component.
     */
    var pathToTemplates = "../../../components/uiOptions/html/";
    
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
     * UI Options pages as well as by the demo page itself.
     */
    demo.initPageEnhancer = function (customThemeName) {
        fluid.pageEnhancer({
            gradeNames: ["fluid.uiEnhancer.starterEnactors"],
            tocTemplate: pathToTocTemplate,
            classnameMap: {
                theme: {
                    "default": customThemeName
                }
            }
        });
    };

    var commonOpts = {
        gradeNames: ["fluid.uiOptions.transformDefaultPanelsOptions"],
        // Tell UIOptions where to find all the templates, relative to this file
        prefix: pathToTemplates,
        templateLoader: {
            options: {
                gradeNames: ["fluid.uiOptions.starterTemplateLoader"]
            }
        },
        uiOptions: {
            options: {
                gradeNames: ["fluid.uiOptions.starterPanels", "fluid.uiOptions.rootModel.starter", "fluid.uiOptions.uiEnhancerRelay"]
            }
        }
    };
    
    /**
     * Initialize UI Options on the "Fat Panel" version. This version of UI Options uses the
     * page itself as a live preview.
     */
    demo.initFatPanel = function (container) {
        fluid.uiOptions.fatPanel(container, commonOpts);
    };
    
})(jQuery, fluid);
