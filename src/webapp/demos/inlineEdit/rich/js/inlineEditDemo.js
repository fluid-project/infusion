/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2010 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010-2011 OCAD University

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
    demo.initRichInlineEdit = function () {
        /**
         * Create cancel and save buttons for a rich inline editor.
         * @param {Object} editor 
         */
        var makeButtons = function (editor) {
            $(".demo-save", editor.container).click(function () {
                editor.finish();
                return false;
            });

            $(".demo-cancel", editor.container).click(function () {
                editor.cancel();
                return false;
            });
        }; 

        // Create a TinyMCE-based Rich Inline Edit component.
        var tinyEditor = fluid.inlineEdit.tinyMCE("#demo-richInlineEdit-container-tinyMCE", {
            tinyMCE: {
                width: 1024,
                theme: "advanced",
                theme_advanced_toolbar_location : "top"
            }, 
            componentDecorators: {
                type: "fluid.undoDecorator",
                options: {
                    selectors: demo.initRichInlineEdit.selectors,
                    renderer: demo.initRichInlineEdit.undoRenderer
                }                
            },
            strings: {
                textEditButton: "Edit"
            },
            tooltipText: "Use the edit link to make changes"            
        });
        makeButtons(tinyEditor);

        // Create an CKEditor 3.x-based Rich Inline Edit component.
        var ckEditor = fluid.inlineEdit.CKEditor("#demo-richInlineEdit-container-ckEditor", {
            componentDecorators: {
                type: "fluid.undoDecorator",
                options: {
                    selectors: demo.initRichInlineEdit.selectors,
                    renderer: demo.initRichInlineEdit.undoRenderer
                }
            },
            strings: {
                textEditButton: "Edit"
            },
            tooltipText: "Use the edit link to make changes"
        });
        makeButtons(ckEditor);    
    };    

    demo.initRichInlineEdit.selectors = {
        undoContainer: ".demo-undoContainer",
        undoControl: ".demo-undoControl",
        redoContainer: ".demo-redoContainer",
        redoControl: ".demo-redoControl"
    };
    
    demo.initRichInlineEdit.undoRenderer = function (that, targetContainer) {
        var markup = 
            "<span class='flc-undo demo-inlineEdit-inlinePadding'>" +
            "<span class='demo-undoContainer' role='button'><a href='#' class='demo-undoControl'>Undo edit</a></span>" +
            "<span class='demo-redoContainer' role='button'><a href='#' class='demo-redoControl'>Redo edit</a></span>" +
            "</span>";
        var markupNode = $(markup);
        var button = $("a", targetContainer);
        button.after(markupNode);
        return markupNode;
    };    

})(jQuery, fluid);
