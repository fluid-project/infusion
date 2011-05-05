/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};
(function ($, fluid) {
    
    demo.undoRenderer = function (that, targetContainer) {
        var markup = 
            "<span class='flc-undo'>" +
            "<span class='demo-undoContainer' role='button'><a href='#' class='demo-undoControl'><img src='../images/inline_edit_undo_button_16x16.png' alt='Undo edit'></a></span>" +
            "<span class='demo-redoContainer' role='button'><a href='#' class='demo-redoControl'><img src='../images/inline_edit_redo_button_16x16.png' alt='Redo edit'></a></span>" +
            "</span>";
        var markupNode = $(markup);
        targetContainer.append(markupNode);
        return markupNode;
    };
    
    /**
     * Initialize all simple inline edit components present on the inline-edit 
     * demo.
     */
    demo.initInlineEdit = function () {
          
        /**
         * Simple inline edits example.
         */            
        fluid.inlineEdit(".demoSelector-inlineEdit-container-title", {
            componentDecorators: {
                type: "fluid.undoDecorator",
                options: {
                    selectors: demo.initInlineEdit.selectors,
                    renderer: demo.undoRenderer
                }
            },
            styles: {
                edit: "demo-inlineEdit-title-edit demo-inlineEdit-edit"
            },
            defaultViewText: "Edit this"
        });
        
        fluid.inlineEdit(".demoSelector-inlineEdit-container-caption", {
            componentDecorators: {
                type: "fluid.undoDecorator",
                options: {
                    selectors: demo.initInlineEdit.selectors,
                    renderer: demo.undoRenderer
                }
            },
            defaultViewText: "Edit this"
        });
    };
        
    demo.initInlineEdit.selectors = {
        undoContainer: ".demo-undoContainer",
        undoControl: ".demo-undoControl",
        redoContainer: ".demo-redoContainer",
        redoControl: ".demo-redoControl"
    };    
})(jQuery, fluid);