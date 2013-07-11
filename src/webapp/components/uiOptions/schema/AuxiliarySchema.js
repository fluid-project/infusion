var auxiliarySchema = {
    "namespace": "fluid.uiOptions.constructed", // the author of the auxiliary schema will provide this and will be the component to call to initialize the constructed UIO.
    "templatePrefix": "../html",  // the common path to settings panel templates. The template defined in "panels" element will take precedence over this definition.
    "messages": {
        // UI Options Text Font Settings Panel
        // Note: if you modify these, you need to update the appropriate
        // controlValues in fluid.uiOptions.textFont component options.
        "textFont": ["Default", "Times New Roman", "Comic Sans", "Arial",
            "Verdana"],
        "textFontLabel": "Text Style",
 
        // Shared
        "multiplier": "times"
    },
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
        "tocTemplate": "the-location-of-toc-template"
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
        "template": "templates/textSize"  // optional
    }, {
        "type": "fluid.uiOptions.panels.lineSpace",
        "container": ".flc-uiOptions-line-space",  // the css selector in the template where the panel is rendered
        "template": "templates/lineSpace"  // optional
    }, {
        "type": "fluid.uiOptions.panels.textFont",
        "container": ".flc-uiOptions-text-font",  // the css selector in the template where the panel is rendered
        "classnameMap": "@textFont.classes",
        "template": "templates/textFont"  // optional
    }, {
        "type": "fluid.uiOptions.panels.contrast",
        "container": ".flc-uiOptions-contrast",  // the css selector in the template where the panel is rendered
        "classnameMap": "@contrast.classes",
        "template": "templates/contrast"  // optional
    }, {
        "type": "fluid.uiOptions.panels.layoutControls",
        "container": ".flc-uiOptions-layout-controls",  // the css selector in the template where the panel is rendered
        "template": "templates/tableOfContents"  // optional
    }, {
        "type": "fluid.uiOptions.panels.linksControls",
        "container": ".flc-uiOptions-links-controls",  // the css selector in the template where the panel is rendered
        "template": "templates/linksControls"  // optional
    }]
};
