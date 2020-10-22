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

/* global fluid */

var demo = demo || {};
(function ($, fluid) {
    "use strict";

    demo.undoRenderer = function (that, targetContainer) {
        var markup =
            "<span class='flc-undo'>" +
            "<span class='demo-undoContainer' role='button'><a href='#' class='demo-undoControl'><img src='images/inline_edit_undo_button_16x16.png' alt='Undo edit'></a></span>" +
            "<span class='demo-redoContainer' role='button'><a href='#' class='demo-redoControl'><img src='images/inline_edit_redo_button_16x16.png' alt='Redo edit'></a></span>" +
            "</span>";
        var markupNode = $(markup);
        targetContainer.append(markupNode);
        return markupNode;
    };

    fluid.defaults("demo.inlineEdit", {
        gradeNames: ["fluid.inlineEdit"],
        strings: {
            defaultViewText: "Edit this",
            defaultFocussedViewText: "Edit this (click or press enter)"
        },
        components: {
            undo: {
                type: "fluid.undo",
                options: {
                    selectors: {
                        undoContainer: ".demo-undoContainer",
                        undoControl: ".demo-undoControl",
                        redoContainer: ".demo-redoContainer",
                        redoControl: ".demo-redoControl"
                    },
                    renderer: demo.undoRenderer
                }
            }
        }
    });
})(jQuery, fluid);
