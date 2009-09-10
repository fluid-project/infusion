/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley

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
    
    /**
     * Customize the undo subcomponent appearance.
     * @param {Object} that
     * @param {Object} targetContainer
     */
    var myUndoRenderer = function (that, targetContainer) {
        var markup = "<span class='flc-undo'>" +
        "<span class='flc-undo-undoContainer'><a href='#' class='flc-undo-undoControl'><img src='../../../../integration-demos/sakai/images/undo.png' alt='Undo your edit' title='Undo your edit' style='border:none' /></a></span>" +
        "<span class='flc-undo-redoContainer'><a href='#' class='flc-undo-redoControl'><img src='../../../../integration-demos/sakai/images/redo.png' alt='Redo your edit' title='Redo your edit' style='border:none' /></a></span>" +
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
        fluid.inlineEdit(".simpleEdit", {
            componentDecorators: {
                type: "fluid.undoDecorator"
            }
        });
        
        /**
         * Multiple inline text editors.
         */
        fluid.inlineEdits(".multipleEdit", {
            selectors: {
                text: ".editableText",
                editables : "p"
            },
            componentDecorators: {
                type: "fluid.undoDecorator"
            }
        });
    };
        
    demo.initInlineEdit = function () {        
        inlineSimpleEditSetup();
    };    
})(jQuery, fluid);