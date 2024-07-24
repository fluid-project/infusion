/*
Copyright The Infusion copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/main/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

"use strict";

/*******************************************************************************
 * Starter auxiliary schema grades
 *
 * Contains the settings for 7 preferences: text size, line space, text font,
 * contrast, table of contents, inputs larger and emphasize links
 *******************************************************************************/

fluid.defaults("fluid.prefs.auxSchema.textSize", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "fluid.prefs.textSize": {
            alias: "textSize",
            enactor: {
                type: "fluid.prefs.enactor.textSize"
            },
            panel: {
                type: "fluid.prefs.panel.textSize",
                container: ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                message: "%messagePrefix/textSize.json",
                template: "%templatePrefix/PrefsEditorTemplate-textSize.html"
            }
        }
    }
});

fluid.defaults("fluid.prefs.auxSchema.lineSpace", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "fluid.prefs.lineSpace": {
            alias: "lineSpace",
            enactor: {
                type: "fluid.prefs.enactor.lineSpace",
                fontSizeMap: {
                    "xx-small": "9px",
                    "x-small": "11px",
                    "small": "13px",
                    "medium": "15px",
                    "large": "18px",
                    "x-large": "23px",
                    "xx-large": "30px"
                }
            },
            panel: {
                type: "fluid.prefs.panel.lineSpace",
                container: ".flc-prefsEditor-line-space",  // the css selector in the template where the panel is rendered
                message: "%messagePrefix/lineSpace.json",
                template: "%templatePrefix/PrefsEditorTemplate-lineSpace.html"
            }
        }
    }
});

fluid.defaults("fluid.prefs.auxSchema.textFont", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "fluid.prefs.textFont": {
            alias: "textFont",
            enactor: {
                type: "fluid.prefs.enactor.textFont",
                classes: {
                    "default": "",
                    "system": "fl-font-system-ui",
                    "times": "fl-font-times",
                    "comic": "fl-font-comic-sans",
                    "arial": "fl-font-arial",
                    "verdana": "fl-font-verdana",
                    "open-dyslexic": "fl-font-open-dyslexic",
                    "atkinson-hyperlegible": "fl-font-atkinson-hyperlegible"
                }
            },
            panel: {
                type: "fluid.prefs.panel.textFont",
                container: ".flc-prefsEditor-text-font",  // the css selector in the template where the panel is rendered
                classnameMap: {
                    "textFont": {
                        "default": "",
                        "system": "fl-font-system-ui",
                        "times": "fl-font-times",
                        "comic": "fl-font-comic-sans",
                        "arial": "fl-font-arial",
                        "verdana": "fl-font-verdana",
                        "open-dyslexic": "fl-font-open-dyslexic",
                        "atkinson-hyperlegible": "fl-font-atkinson-hyperlegible"
                    }
                },
                template: "%templatePrefix/PrefsEditorTemplate-textFont.html",
                message: "%messagePrefix/textFont.json"
            }
        }
    }
});

fluid.defaults("fluid.prefs.auxSchema.contrast", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "fluid.prefs.contrast": {
            alias: "theme",
            enactor: {
                type: "fluid.prefs.enactor.contrast",
                classes: {
                    "default": "fl-theme-prefsEditor-default",
                    "bw": "fl-theme-bw",
                    "wb": "fl-theme-wb",
                    "by": "fl-theme-by",
                    "yb": "fl-theme-yb",
                    "lgdg": "fl-theme-lgdg",
                    "gd": "fl-theme-gd",
                    "gw": "fl-theme-gw",
                    "bbr": "fl-theme-bbr"

                }
            },
            panel: {
                type: "fluid.prefs.panel.contrast",
                container: ".flc-prefsEditor-contrast",  // the css selector in the template where the panel is rendered
                classnameMap: {
                    "theme": {
                        "default": "fl-theme-prefsEditor-default",
                        "bw": "fl-theme-bw",
                        "wb": "fl-theme-wb",
                        "by": "fl-theme-by",
                        "yb": "fl-theme-yb",
                        "lgdg": "fl-theme-lgdg",
                        "gd": "fl-theme-gd",
                        "gw": "fl-theme-gw",
                        "bbr": "fl-theme-bbr"

                    }
                },
                template: "%templatePrefix/PrefsEditorTemplate-contrast.html",
                message: "%messagePrefix/contrast.json"
            }
        }
    }
});

fluid.defaults("fluid.prefs.auxSchema.tableOfContents", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "fluid.prefs.tableOfContents": {
            alias: "toc",
            enactor: {
                type: "fluid.prefs.enactor.tableOfContents",
                tocTemplate: "../../components/tableOfContents/html/TableOfContents.html",
                tocMessage: "../../framework/preferences/messages/tableOfContents-enactor.json"
            },
            panel: {
                type: "fluid.prefs.panel.layoutControls",
                container: ".flc-prefsEditor-layout-controls",  // the css selector in the template where the panel is rendered
                template: "%templatePrefix/PrefsEditorTemplate-layout.html",
                message: "%messagePrefix/tableOfContents.json"
            }
        }
    }
});

fluid.defaults("fluid.prefs.auxSchema.enhanceInputs", {
    gradeNames: ["fluid.prefs.auxSchema"],
    auxiliarySchema: {
        "fluid.prefs.enhanceInputs": {
            alias: "inputs",
            enactor: {
                type: "fluid.prefs.enactor.enhanceInputs",
                cssClass: "fl-input-enhanced"
            },
            panel: {
                type: "fluid.prefs.panel.enhanceInputs",
                container: ".flc-prefsEditor-enhanceInputs",  // the css selector in the template where the panel is rendered
                template: "%templatePrefix/PrefsEditorTemplate-enhanceInputs.html",
                message: "%messagePrefix/enhanceInputs.json"
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
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "fluid.prefs.textSize": {
            "type": "number",
            "default": 1,
            "minimum": 0.5,
            "maximum": 2,
            "multipleOf": 0.1
        }
    }
});

fluid.defaults("fluid.prefs.schemas.lineSpace", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "fluid.prefs.lineSpace": {
            "type": "number",
            "default": 1,
            "minimum": 0.7,
            "maximum": 2,
            "multipleOf": 0.1
        }
    }
});

fluid.defaults("fluid.prefs.schemas.textFont", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "fluid.prefs.textFont": {
            "type": "string",
            "default": "default",
            "enum": ["default", "system", "times", "comic", "arial", "verdana", "open-dyslexic", "atkinson-hyperlegible"],
            "enumLabels": [
                "textFont-default",
                "textFont-system",
                "textFont-times",
                "textFont-comic",
                "textFont-arial",
                "textFont-verdana",
                "textFont-open-dyslexic",
                "textFont-atkinson-hyperlegible"
            ]
        }
    }
});

fluid.defaults("fluid.prefs.schemas.contrast", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "fluid.prefs.contrast": {
            "type": "string",
            "default": "default",
            "enum": ["default", "bw", "wb", "by", "yb", "lgdg", "gw", "gd", "bbr"],
            "enumLabels": [
                "contrast-default",
                "contrast-bw",
                "contrast-wb",
                "contrast-by",
                "contrast-yb",
                "contrast-lgdg",
                "contrast-gw",
                "contrast-gd",
                "contrast-bbr"
            ]
        }
    }
});

fluid.defaults("fluid.prefs.schemas.tableOfContents", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "fluid.prefs.tableOfContents": {
            "type": "boolean",
            "default": false
        }
    }
});

fluid.defaults("fluid.prefs.schemas.enhanceInputs", {
    gradeNames: ["fluid.prefs.schemas"],
    schema: {
        "fluid.prefs.enhanceInputs": {
            "type": "boolean",
            "default": false
        }
    }
});
