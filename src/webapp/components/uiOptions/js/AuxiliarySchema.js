/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function (fluid) {

    /*******************************************************************************
     * Base auxiliary schema grade
     *******************************************************************************/

    fluid.defaults("fluid.uiOptions.auxSchema", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        auxiliarySchema: {}
    });

    /*******************************************************************************
     * Starter auxiliary schema grade
     *
     * Contains the settings for 6 preferences: text size, line space, text font,
     * table of contents, inputs larger and emphasize links
     *******************************************************************************/

    fluid.defaults("fluid.uiOptions.auxSchema.starter", {
        gradeNames: ["fluid.uiOptions.auxSchema", "autoInit"],
        auxiliarySchema: {
            "namespace": "fluid.uiOptions.constructed", // The author of the auxiliary schema will provide this and will be the component to call to initialize the constructed UIO.
            "templatePrefix": "../../../components/uiOptions/html/",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
            "textSize": {
                "type": "fluid.uiOptions.textSize"
            },
            "lineSpace": {
                "type": "fluid.uiOptions.lineSpace"
            },
            "textFont": {
                "type": "fluid.uiOptions.textFont",
                "classes": {
                    "default": "",
                    "times": "fl-font-uio-times",
                    "comic": "fl-font-uio-comic-sans",
                    "arial": "fl-font-uio-arial",
                    "verdana": "fl-font-uio-verdana"
                }
            },
            "contrast": {
                "type": "fluid.uiOptions.contrast",
                "classes": {
                    "default": "fl-theme-uio-default",
                    "bw": "fl-theme-uio-bw fl-theme-bw",
                    "wb": "fl-theme-uio-wb fl-theme-wb",
                    "by": "fl-theme-uio-by fl-theme-by",
                    "yb": "fl-theme-uio-yb fl-theme-yb"
                }
            },
            "tableOfContents": {
                "type": "fluid.uiOptions.tableOfContents"
            },
            "emphasizeLinks": {
                "type": "fluid.uiOptions.emphasizeLinks"
            },
            "inputsLarger": {
                "type": "fluid.uiOptions.inputsLarger"
            },
            "enactors": [{
                "type": "fluid.uiOptions.enactors.textSize"
            }, {
                "type": "fluid.uiOptions.enactors.lineSpace",
                "fontSizeMap": {
                    "xx-small": "9px",
                    "x-small": "11px",
                    "small": "13px",
                    "medium": "15px",
                    "large": "18px",
                    "x-large": "23px",
                    "xx-large": "30px"
                }
            }, {
                "type": "fluid.uiOptions.enactors.textFont",
                "classes": "@textFont.classes"
            }, {
                "type": "fluid.uiOptions.enactors.contrast",
                "classes": "@contrast.classes"
            }, {
                "type": "fluid.uiOptions.enactors.tableOfContents",
                "tocTemplate": "../../../components/tableOfContents/html/TableOfContents.html"
            }, {
                "type": "fluid.uiOptions.enactors.emphasizeLinks",
                "cssClass": "fl-link-enhanced"
            }, {
                "type": "fluid.uiOptions.enactors.inputsLarger",
                "cssClass": "fl-text-larger"
            }],
            "panels": [{
                "type": "fluid.uiOptions.panels.textSize",
                "container": ".flc-uiOptions-text-size",  // the css selector in the template where the panel is rendered
                "template": "%prefix/UIOptionsTemplate-textSize.html"
            }, {
                "type": "fluid.uiOptions.panels.lineSpace",
                "container": ".flc-uiOptions-line-space",  // the css selector in the template where the panel is rendered
                "template": "%prefix/UIOptionsTemplate-lineSpace.html"
            }, {
                "type": "fluid.uiOptions.panels.textFont",
                "container": ".flc-uiOptions-text-font",  // the css selector in the template where the panel is rendered
                "classnameMap": "@textFont.classes",
                "template": "%prefix/UIOptionsTemplate-textFont.html"
            }, {
                "type": "fluid.uiOptions.panels.contrast",
                "container": ".flc-uiOptions-contrast",  // the css selector in the template where the panel is rendered
                "classnameMap": "@contrast.classes",
                "template": "%prefix/UIOptionsTemplate-contrast.html"
            }, {
                "type": "fluid.uiOptions.panels.layoutControls",
                "container": ".flc-uiOptions-layout-controls",  // the css selector in the template where the panel is rendered
                "template": "%prefix/UIOptionsTemplate-layout.html"
            }, {
                "type": "fluid.uiOptions.panels.linksControls",
                "container": ".flc-uiOptions-links-controls",  // the css selector in the template where the panel is rendered
                "template": "%prefix/UIOptionsTemplate-links.html"
            }]
        }
    });

})(fluid_1_5);
