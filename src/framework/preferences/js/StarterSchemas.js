/*
Copyright 2013-2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_2_0_0 = fluid_2_0_0 || {};

(function (fluid) {
    "use strict";

    /*******************************************************************************
     * Starter auxiliary schema grade
     *
     * Contains the settings for 7 preferences: text size, line space, text font,
     * contrast, table of contents, inputs larger and emphasize links
     *******************************************************************************/

    var check;
    var widthCheck = function() {
        var width = $(window).width();
        check = (width<640);
        if (check) {
            fluid.contextAware.makeChecks({
                "fluid.responsiveCheck": true
            });
        }
        else {
            fluid.contextAware.forgetChecks("fluid.responsiveCheck");
            fluid.defaults("fluid.prefs.auxSchema.starter.default", {
                gradeNames: ["fluid.contextAware"],
                contextAwareness: {
                    sliderVariety: {
                        checks: {
                            jQueryUI: {
                                contextValue: "{fluid.prefsWidgetType}",
                                equals: "jQueryUI",
                                gradeNames: ["fluid.prefs.auxSchema.starter.textSize.jQueryUI", "fluid.prefs.auxSchema.starter.lineSpace.jQueryUI", "fluid.prefs.auxSchema.starter.blueColorFilter.jQueryUI"]
                            }
                        },
                        defaultGradeNames: ["fluid.prefs.auxSchema.starter.textSize.nativeHTML", "fluid.prefs.auxSchema.starter.lineSpace.nativeHTML", "fluid.prefs.auxSchema.starter.blueColorFilter.nativeHTML"]
                    }
                }
            });
        }
    };
    widthCheck();
    $(window).resize(widthCheck);

    fluid.defaults("fluid.prefs.termsAware");

    // textSize mixin (base)
    fluid.defaults("fluid.prefs.auxSchema.starter.textSize", {
        auxiliarySchema: {
            "textSize": {
                "type": "fluid.prefs.textSize",
                "enactor": {
                    "type": "fluid.prefs.enactor.textSize"
                },
                "panel": {
                    "type": "fluid.prefs.panel.textSize",
                    "container": ".flc-prefsEditor-text-size",  // the css selector in the template where the panel is rendered
                    "message": "%messagePrefix/textSize.json"
                }
            }
        }
    });

    fluid.defaults("fluid.prefs.auxSchema.starter.textSize.nativeHTML", {
        auxiliarySchema: {
            "textSize": {
                "panel": {
                    "template": "%templatePrefix/PrefsEditorTemplate-textSize-nativeHTML.html"
                }
            }
        }
    });

    fluid.defaults("fluid.prefs.auxSchema.starter.textSize.jQueryUI", {
        auxiliarySchema: {
            "textSize": {
                "panel": {
                    "template": "%templatePrefix/PrefsEditorTemplate-textSize-jQueryUI.html"
                }
            }
        }
    });

    // lineSpace mixin (base)
    fluid.defaults("fluid.prefs.auxSchema.starter.lineSpace", {
        gradeNames: ["fluid.contextAware"],
        auxiliarySchema: {
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
                    "message": "%messagePrefix/lineSpace.json"
                }
            }
        }
    });

    fluid.defaults("fluid.prefs.auxSchema.starter.lineSpace.nativeHTML", {
        auxiliarySchema: {
            "lineSpace": {
                "panel": {
                    "template": "%templatePrefix/PrefsEditorTemplate-lineSpace-nativeHTML.html"
                }
            }
        }
    });

    fluid.defaults("fluid.prefs.auxSchema.starter.lineSpace.jQueryUI", {
        auxiliarySchema: {
            "lineSpace": {
                "panel": {
                    "template": "%templatePrefix/PrefsEditorTemplate-lineSpace-jQueryUI.html"
                }
            }
        }
    });

    // blueColorFilter mixin (base)
    fluid.defaults("fluid.prefs.auxSchema.starter.blueColorFilter", {
        gradeNames: ["fluid.contextAware"],
        auxiliarySchema: {
            "blueColorFilter": {
                "type": "fluid.prefs.blueColorFilter",
                "enactor": {
                    "type": "fluid.prefs.enactor.blueColorFilter"
                    // "fontSizeMap": {
                    //     "xx-small": "9px",
                    //     "x-small": "11px",
                    //     "small": "13px",
                    //     "medium": "15px",
                    //     "large": "18px",
                    //     "x-large": "23px",
                    //     "xx-large": "30px"
                    // }
                },
                "panel": {
                    "type": "fluid.prefs.panel.blueColorFilter",
                    "container": ".flc-prefsEditor-blue-color-filter",  // the css selector in the template where the panel is rendered
                    "message": "%messagePrefix/blueColorFilter.json"
                }
            }
        }
    });

    fluid.defaults("fluid.prefs.auxSchema.starter.blueColorFilter.nativeHTML", {
        auxiliarySchema: {
            "blueColorFilter": {
                "panel": {
                    "template": "%templatePrefix/PrefsEditorTemplate-blueColorFilter-nativeHTML.html"
                }
            }
        }
    });

    fluid.defaults("fluid.prefs.auxSchema.starter.blueColorFilter.jQueryUI", {
        auxiliarySchema: {
            "blueColorFilter": {
                "panel": {
                    "template": "%templatePrefix/PrefsEditorTemplate-blueColorFilter-jQueryUI.html"
                }
            }
        }
    });

    fluid.defaults("fluid.prefs.responsiveSchema", {
        auxiliarySchema: {
            "textSize": {
                "panel": {
                    "template": "%templatePrefix/PrefsEditorTemplate-textSize-responsive.html"
                }
            },
            "lineSpace": {
                "panel": {
                    "template": "%templatePrefix/PrefsEditorTemplate-lineSpace-responsive.html"
                }
            },
            "blueColorFilter" : {
                "panel": {
                    "template": "%templatePrefix/PrefsEditorTemplate-blueColorFilter-responsive.html"
                }
            }
        }
    });

    fluid.defaults("fluid.prefs.auxSchema.starter", {
        gradeNames: ["fluid.prefs.auxSchema", "fluid.prefs.auxSchema.starter.lineSpace", "fluid.prefs.auxSchema.starter.textSize", "fluid.prefs.auxSchema.starter.blueColorFilter", "fluid.contextAware", "fluid.prefs.auxSchema.starter.default"],
        contextAwareness: {
            responsiveAware: {
                checks: {
                    responsive: {
                        contextValue: "{fluid.responsiveCheck}",
                        gradeNames: "fluid.prefs.responsiveSchema"
                    }
                }
            }
        },
        auxiliarySchema: {
            "loaderGrades": ["fluid.prefs.separatedPanel"],
            "namespace": "fluid.prefs.constructed", // The author of the auxiliary schema will provide this and will be the component to call to initialize the constructed PrefsEditor.
            "terms": {
                "templatePrefix": "../../framework/preferences/html",  // Must match the keyword used below to identify the common path to settings panel templates.
                "messagePrefix": "../../framework/preferences/messages"  // Must match the keyword used below to identify the common path to message files.
            },
            "template": "%templatePrefix/SeparatedPanelPrefsEditor.html",
            "message": "%messagePrefix/prefsEditor.json",
            "textFont": {
                "type": "fluid.prefs.textFont",
                "classes": {
                    "default": "",
                    "times": "fl-font-times",
                    "comic": "fl-font-comic-sans",
                    "arial": "fl-font-arial",
                    "verdana": "fl-font-verdana"
                },
                "enactor": {
                    "type": "fluid.prefs.enactor.textFont",
                    "classes": "@textFont.classes"
                },
                "panel": {
                    "type": "fluid.prefs.panel.textFont",
                    "container": ".flc-prefsEditor-text-font",  // the css selector in the template where the panel is rendered
                    "classnameMap": {"textFont": "@textFont.classes"},
                    "template": "%templatePrefix/PrefsEditorTemplate-textFont.html",
                    "message": "%messagePrefix/textFont.json"
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
                    "template": "%templatePrefix/PrefsEditorTemplate-contrast.html",
                    "message": "%messagePrefix/contrast.json"
                }
            },
            "tableOfContents": {
                "type": "fluid.prefs.tableOfContents",
                "enactor": {
                    "type": "fluid.prefs.enactor.tableOfContents",
                    "tocTemplate": "../../components/tableOfContents/html/TableOfContents.html"
                },
                "panel": {
                    "type": "fluid.prefs.panel.layoutControls",
                    "container": ".flc-prefsEditor-layout-controls",  // the css selector in the template where the panel is rendered
                    "template": "%templatePrefix/PrefsEditorTemplate-layout.html",
                    "message": "%messagePrefix/tableOfContents.json"
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
                    "template": "%templatePrefix/PrefsEditorTemplate-emphasizeLinks.html",
                    "message": "%messagePrefix/emphasizeLinks.json"
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
                    "template": "%templatePrefix/PrefsEditorTemplate-inputsLarger.html",
                    "message": "%messagePrefix/inputsLarger.json"
                }
            },
            groups: {
                "linksControls": {
                    "container": ".flc-prefsEditor-links-controls",
                    "template": "%templatePrefix/PrefsEditorTemplate-linksControls.html",
                    "message": "%messagePrefix/linksControls.json",
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
        gradeNames: ["fluid.prefs.schemas"],
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
        gradeNames: ["fluid.prefs.schemas"],
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

    fluid.defaults("fluid.prefs.schemas.blueColorFilter", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.blueColorFilter": {
                "type": "number",
                "default": 1,
                "minimum": 0,
                "maximum": 1,
                "divisibleBy": 0.1
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.textFont", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.textFont": {
                "type": "string",
                "default": "default",
                "enum": ["default", "times", "comic", "arial", "verdana"]
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.contrast", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.contrast": {
                "type": "string",
                "default": "default",
                "enum": ["default", "bw", "wb", "by", "yb", "lgdg"]
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

    fluid.defaults("fluid.prefs.schemas.emphasizeLinks", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.emphasizeLinks": {
                "type": "boolean",
                "default": false
            }
        }
    });

    fluid.defaults("fluid.prefs.schemas.inputsLarger", {
        gradeNames: ["fluid.prefs.schemas"],
        schema: {
            "fluid.prefs.inputsLarger": {
                "type": "boolean",
                "default": false
            }
        }
    });
})(fluid_2_0_0);
