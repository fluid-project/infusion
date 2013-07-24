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

    fluid.registerNamespace("fluid.uiOptions");

    fluid.uiOptions.messages = {

        // UI Options Text Font Settings Panel
        // Note: if you modify these, you need to update the appropriate
        // controlValues in fluid.uiOptions.panels.textFont component options.
        textFont: ["Default", "Times New Roman", "Comic Sans", "Arial",
            "Verdana"],
        textFontLabel: "Text Style",

        // UI Options Contrast Settings Panel
        // Note: if you modify these, you need to update the appropriate
        // controlValues in fluid.uiOptions.panels.contrast component options.
        theme: ["Default", "Black on white", "White on black", "Black on yellow",
            "Yellow on black"],
        contrastLabel: "Colour & Contrast",

        // Table of Contents Settings Panel
        tocLabel: "Table of Contents",
        tocChoiceLabel: "Add a table of contents",

        // Line spacing
        lineSpaceLabel: "Line Spacing",
        lineSpaceNarrowIcon: "icon of 3 horizontal lines with narrow spacing",
        lineSpaceWideIcon: "icon of 3 horizontal lines with wide spacing",

        // Links and Buttons
        linksLabel: "Links & buttons",
        linksChoiceLabel: "Underline and bold",
        inputsChoiceLabel: "Enlarge buttons, menus, text-fields, and other inputs",

        // Text Size
        textSizeLabel: "Text Size",
        textSizeSmallIcon: "icon of a small capital letter 'A'",
        textSizeLargeIcon: "icon of a large capital letter 'A'",

        // Shared
        multiplier: "times",
        
        // Sliding Panel
        slidingPanelShowText: "+ Show Display Preferences",
        slidingPanelHideText: "- Hide"        
    };

    fluid.staticEnvironment.uioMsgBundle = fluid.messageResolver({
        messageBase: fluid.uiOptions.messages
    });

})(fluid_1_5);