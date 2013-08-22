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
     * Starter auxiliary schema grade
     *
     * Contains the settings for 7 preferences: text size, line space, text font,
     * contrast, table of contents, inputs larger and emphasize links
     *******************************************************************************/

    fluid.defaults("fluid.uiOptions.auxSchema.starter", {
        gradeNames: ["fluid.uiOptions.auxSchema", "autoInit"],
        auxiliarySchema: {
            "namespace": "fluid.uiOptions.constructed", // The author of the auxiliary schema will provide this and will be the component to call to initialize the constructed UIO.
            "templatePrefix": "../../../components/uiOptions/html/",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
            "template": "%prefix/FatPanelUIOptions.html",
            "messagePrefix": "../../../components/uiOptions/messages/",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
            "message": "%prefix/uiOptions.json",
            "textSize": {
                "type": "fluid.uiOptions.textSize",
                "enactor": {
                    "type": "fluid.uiOptions.enactors.textSize"
                },
                "panel": {
                    "type": "fluid.uiOptions.panels.textSize",
                    "container": ".flc-uiOptions-text-size",  // the css selector in the template where the panel is rendered
                    "template": "%prefix/UIOptionsTemplate-textSize.html",
                    "message": "%prefix/textSize.json"
                }
            },
            "lineSpace": {
                "type": "fluid.uiOptions.lineSpace",
                "enactor": {
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
                },
                "panel": {
                    "type": "fluid.uiOptions.panels.lineSpace",
                    "container": ".flc-uiOptions-line-space",  // the css selector in the template where the panel is rendered
                    "template": "%prefix/UIOptionsTemplate-lineSpace.html",
                    "message": "%prefix/lineSpace.json"
                }
            },
            "textFont": {
                "type": "fluid.uiOptions.textFont",
                "classes": {
                    "default": "",
                    "times": "fl-font-uio-times",
                    "comic": "fl-font-uio-comic-sans",
                    "arial": "fl-font-uio-arial",
                    "verdana": "fl-font-uio-verdana"
                },
                "enactor": {
                    "type": "fluid.uiOptions.enactors.textFont",
                    "classes": "@textFont.classes"
                },
                "panel": {
                    "type": "fluid.uiOptions.panels.textFont",
                    "container": ".flc-uiOptions-text-font",  // the css selector in the template where the panel is rendered
                    "classnameMap": {"textFont": "@textFont.classes"},
                    "template": "%prefix/UIOptionsTemplate-textFont.html",
                    "message": "%prefix/textFont.json"
                }
            },
            "contrast": {
                "type": "fluid.uiOptions.contrast",
                "classes": {
                    "default": "fl-theme-uio-default",
                    "bw": "fl-theme-uio-bw fl-theme-bw",
                    "wb": "fl-theme-uio-wb fl-theme-wb",
                    "by": "fl-theme-uio-by fl-theme-by",
                    "yb": "fl-theme-uio-yb fl-theme-yb",
                    "lgdg": "fl-theme-uio-lgdg fl-theme-lgdg"

                },
                "enactor": {
                    "type": "fluid.uiOptions.enactors.contrast",
                    "classes": "@contrast.classes"
                },
                "panel": {
                    "type": "fluid.uiOptions.panels.contrast",
                    "container": ".flc-uiOptions-contrast",  // the css selector in the template where the panel is rendered
                    "classnameMap": {"theme": "@contrast.classes"},
                    "template": "%prefix/UIOptionsTemplate-contrast.html",
                    "message": "%prefix/contrast.json"
                }
            },
            "tableOfContents": {
                "type": "fluid.uiOptions.tableOfContents",
                "enactor": {
                    "type": "fluid.uiOptions.enactors.tableOfContents",
                    "tocTemplate": "../../../../components/tableOfContents/html/TableOfContents.html"
                },
                "panel": {
                    "type": "fluid.uiOptions.panels.layoutControls",
                    "container": ".flc-uiOptions-layout-controls",  // the css selector in the template where the panel is rendered
                    "template": "%prefix/UIOptionsTemplate-layout.html",
                    "message": "%prefix/tableOfContents.json"
                }
            },
            "emphasizeLinks": {
                "type": "fluid.uiOptions.emphasizeLinks",
                "enactor": {
                    "type": "fluid.uiOptions.enactors.emphasizeLinks",
                    "cssClass": "fl-link-enhanced"
                },
                "panel": {
                    "type": "fluid.uiOptions.panels.linksControls",
                    "container": ".flc-uiOptions-links-controls",  // the css selector in the template where the panel is rendered
                    "template": "%prefix/UIOptionsTemplate-links.html",
                    "message": "%prefix/links.json"
                }
            },
            "inputsLarger": {
                "type": "fluid.uiOptions.inputsLarger",
                "enactor": {
                    "type": "fluid.uiOptions.enactors.inputsLarger",
                    "cssClass": "fl-text-larger"
                },
                "panel": {
                    "type": "fluid.uiOptions.panels.linksControls"
                }
            }
        }
    });

    /*******************************************************************************
     * Starter primary schema grades
     *
     * Contains the settings for 7 preferences: text size, line space, text font,
     * contrast, table of contents, inputs larger and emphasize links
     *******************************************************************************/

    fluid.defaults("fluid.uiOptions.schemas.textSize", {
        gradeNames: ["autoInit", "fluid.uiOptions.schemas"],
        schema: {
            "fluid.uiOptions.textSize": {
                "type": "number",
                "default": 1,
                "minimum": 1,
                "maximum": 2,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schemas.lineSpace", {
        gradeNames: ["autoInit", "fluid.uiOptions.schemas"],
        schema: {
            "fluid.uiOptions.lineSpace": {
                "type": "number",
                "default": 1,
                "minimum": 1,
                "maximum": 2,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schemas.textFont", {
        gradeNames: ["autoInit", "fluid.uiOptions.schemas"],
        schema: {
            "fluid.uiOptions.textFont": {
                "type": "string",
                "default": "",
                "enum": ["default", "times", "comic", "arial", "verdana"]
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schemas.contrast", {
        gradeNames: ["autoInit", "fluid.uiOptions.schemas"],
        schema: {
            "fluid.uiOptions.contrast": {
                "type": "string",
                "default": "default",
                "enum": ["default", "bw", "wb", "by", "yb", "lgdg"]
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schemas.tableOfContents", {
        gradeNames: ["autoInit", "fluid.uiOptions.schemas"],
        schema: {
            "fluid.uiOptions.tableOfContents": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schemas.emphasizeLinks", {
        gradeNames: ["autoInit", "fluid.uiOptions.schemas"],
        schema: {
            "fluid.uiOptions.emphasizeLinks": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("fluid.uiOptions.schemas.inputsLarger", {
        gradeNames: ["autoInit", "fluid.uiOptions.schemas"],
        schema: {
            "fluid.uiOptions.inputsLarger": {
                "type": "boolean",
                "default": false
            }
        }
    });
})(fluid_1_5);
