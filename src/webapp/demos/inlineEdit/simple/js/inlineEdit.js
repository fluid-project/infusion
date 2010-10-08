/*
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global demo*/

var demo = demo || {};
(function ($, fluid) {
    
    var undoRenderer = function (that, targetContainer) {
        var markup = 
            "<span class='flc-undo'>" +
            "<span class='undoContainer' role='button'><a href='#' class='undoControl'><img src='../images/undo.jpg' alt='Undo edit'></a></span>" +
            "<span class='redoContainer' role='button'><a href='#' class='redoControl'><img src='../images/redo.jpg' alt='Redo edit'></a></span>" +
            "</span>";
        var markupNode = $(markup);
        targetContainer.append(markupNode);
        return markupNode;
    };
    
    /**
     * Initialize all simple inline edit components present on the inline-edit 
     * demo.
     */
    var inlineSimpleEditSetup = function () {
          
        /**
         * Simple inline edits example.
         */            
        fluid.inlineEdit(".simpleEditTitle", {
            componentDecorators: {
                type: "fluid.undoDecorator",
                options: {
                    selectors: demo.initInlineEdit.selectors,
                    renderer: undoRenderer
                }
            },
            urls: {
                textEditButtonImage: "../images/pencil.jpg"
            },
            strings: {
                editModeToolTip: demo.initInlineEdit.strings.editModeToolTip
            },
            styles: {
                textEditButton: "fl-inlineEdit-button",
                edit: "fl-inlineEdit-title-edit"
            },
            tooltipText: demo.initInlineEdit.strings.tooltipTextTitle
        });
        
        fluid.inlineEdit(".simpleEditCaption", {
            componentDecorators: {
                type: "fluid.undoDecorator",
                options: {
                    selectors: demo.initInlineEdit.selectors,
                    renderer: undoRenderer
                }
            },
            urls: {
                textEditButtonImage: "../images/pencil.jpg"
            },
            strings: {
                editModeToolTip: demo.initInlineEdit.strings.editModeToolTip
            },            
            tooltipText: demo.initInlineEdit.strings.tooltipTextCaption
        });
    };
        
    demo.initInlineEdit = function () {        
        inlineSimpleEditSetup();
    };  
    
    demo.initInlineEdit.strings = {
        editModeToolTip : "Press Enter, Tab, or click elsewhere when done.",
        tooltipTextCaption : "Edit caption.  Select or press Enter.", 
        tooltipTextTitle : "Edit title.  Select or press Enter."
    };
    
    demo.initInlineEdit.selectors = {
        undoContainer: ".undoContainer",
        undoControl: ".undoControl",
        redoContainer: ".redoContainer",
        redoControl: ".redoControl"
    };    
})(jQuery, fluid);