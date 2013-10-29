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

    fluid.defaults("fluid.prefs.auxSchema.starter", {
        gradeNames: ["fluid.prefs.auxSchema", "autoInit"],
        auxiliarySchema: {
            "namespace": "fluid.prefs.constructed", // The author of the auxiliary schema will provide this and will be the component to call to initialize the constructed PrefsEditor.
            "templatePrefix": "../../../framework/preferences/html/",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
            "template": "%prefix/SeparatedPanelPrefsEditor.html",
            "messagePrefix": "../../../framework/preferences/messages/",  // The common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
            "message": "%prefix/prefsEditor.json",
            "textSize": {
                "type": "fluid.prefs.textSize",
                "enactor": {
                    "type": "fluid.prefs.enactor.textSize"
                },
                "panel": {
                    "type": "fluid.prefs.panel.textSize",
                    "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                    "template": "%prefix/PrefsEditorTemplate-textSize.html",
                    "message": "%prefix/textSize.json"
                }
            },
            "lineSpace": {
                "type": "fluid.prefs.lineSpace",
                "enactor": {
                    "type": "fluid.prefs.enactor.lineSpace",
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
                    "type": "fluid.prefs.panel.lineSpace",
                    "container": ".flc-prefsEditor-line-space",  // the css selector in the template where the panel is rendered
                    "template": "%prefix/PrefsEditorTemplate-lineSpace.html",
                    "message": "%prefix/lineSpace.json"
                }
            },
            "textFont": {
                "type": "fluid.prefs.textFont",
                "classes": {
                    "default": "",
                    "times": "fl-font-prefsEditor-times",
                    "comic": "fl-font-prefsEditor-comic-sans",
                    "arial": "fl-font-prefsEditor-arial",
                    "verdana": "fl-font-prefsEditor-verdana"
                },
                "enactor": {
                    "type": "fluid.prefs.enactor.textFont",
                    "classes": "@textFont.classes"
                },
                "panel": {
                    "type": "fluid.prefs.panel.textFont",
                    "container": ".flc-prefsEditor-text-font",  // the css selector in the template where the panel is rendered
                    "classnameMap": {"textFont": "@textFont.classes"},
                    "template": "%prefix/PrefsEditorTemplate-textFont.html",
                    "message": "%prefix/textFont.json"
                }
            },
            "contrast": {
                "type": "fluid.prefs.contrast",
                "classes": {
                    "default": "fl-theme-prefsEditor-default",
                    "bw": "fl-theme-prefsEditor-bw fl-theme-bw",
                    "wb": "fl-theme-prefsEditor-wb fl-theme-wb",
                    "by": "fl-theme-prefsEditor-by fl-theme-by",
                    "yb": "fl-theme-prefsEditor-yb fl-theme-yb",
                    "lgdg": "fl-theme-prefsEditor-lgdg fl-theme-lgdg"

                },
                "enactor": {
                    "type": "fluid.prefs.enactor.contrast",
                    "classes": "@contrast.classes"
                },
                "panel": {
                    "type": "fluid.prefs.panel.contrast",
                    "container": ".flc-prefsEditor-contrast",  // the css selector in the template where the panel is rendered
                    "classnameMap": {"theme": "@contrast.classes"},
                    "template": "%prefix/PrefsEditorTemplate-contrast.html",
                    "message": "%prefix/contrast.json"
                }
            },
            "tableOfContents": {
                "type": "fluid.prefs.tableOfContents",
                "enactor": {
                    "type": "fluid.prefs.enactor.tableOfContents",
                    "tocTemplate": "../../../components/tableOfContents/html/TableOfContents.html"
                },
                "panel": {
                    "type": "fluid.prefs.panel.layoutControls",
                    "container": ".flc-prefsEditor-layout-controls",  // the css selector in the template where the panel is rendered
                    "template": "%prefix/PrefsEditorTemplate-layout.html",
                    "message": "%prefix/tableOfContents.json"
                }
            },
            "emphasizeLinks": {
                "type": "fluid.prefs.emphasizeLinks",
                "enactor": {
                    "type": "fluid.prefs.enactor.emphasizeLinks",
                    "cssClass": "fl-link-enhanced"
                },
                "panel": {
                    "type": "fluid.prefs.panel.emphasizeLinks",
                    "container": ".flc-prefsEditor-emphasizeLinks",  // the css selector in the template where the panel is rendered
                    "template": "%prefix/PrefsEditorTemplate-emphasizeLinks.html",
                    "message": "%prefix/emphasizeLinks.json"
                }
            },
            "inputsLarger": {
                "type": "fluid.prefs.inputsLarger",
                "enactor": {
                    "type": "fluid.prefs.enactor.inputsLarger",
                    "cssClass": "fl-text-larger"
                },
                "panel": {
                    "type": "fluid.prefs.panel.inputsLarger",
                    "container": ".flc-prefsEditor-inputsLarger",  // the css selector in the template where the panel is rendered
                    "template": "%prefix/PrefsEditorTemplate-inputsLarger.html",
                    "message": "%prefix/inputsLarger.json"
                }
            },
            groups: {
                "linksControls": {
                    "container": ".flc-prefsEditor-links-controls",
                    "template": "%prefix/PrefsEditorTemplate-linksControls.html",
                    "message": "%prefix/linksControls.json",
                    "type": "fluid.prefs.panel.linksControls",
                    "panels": ["emphasizeLinks", "inputsLarger"]
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

    fluid.defaults("fluid.prefs.schemas.textSize", {
        gradeNames: ["autoInit", "fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.textSize": {
                "type": "number",
                "default": 1,
                "minimum": 1,
                "maximum": 2,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.lineSpace", {
        gradeNames: ["autoInit", "fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.lineSpace": {
                "type": "number",
                "default": 1,
                "minimum": 1,
                "maximum": 2,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.textFont", {
        gradeNames: ["autoInit", "fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.textFont": {
                "type": "string",
                "default": "",
                "enum": ["default", "times", "comic", "arial", "verdana"]
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.contrast", {
        gradeNames: ["autoInit", "fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.contrast": {
                "type": "string",
                "default": "default",
                "enum": ["default", "bw", "wb", "by", "yb", "lgdg"]
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.tableOfContents", {
        gradeNames: ["autoInit", "fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.tableOfContents": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.emphasizeLinks", {
        gradeNames: ["autoInit", "fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.emphasizeLinks": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.inputsLarger", {
        gradeNames: ["autoInit", "fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.inputsLarger": {
                "type": "boolean",
                "default": false
            }
        }
    });
})(fluid_1_5);
