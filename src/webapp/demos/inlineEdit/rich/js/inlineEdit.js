/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2010 University of Toronto
Copyright 2008-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid, demo*/
var demo = demo || {};

(function ($, fluid) {
    demo.initRichInlineEdit = function () {
        /**
         * Create cancel and save buttons for a rich inline editor.
         * @param {Object} editor 
         */
        var makeButtons = function (editor) {
            $(".save", editor.container).click(function () {
                editor.finish();
                return false;
            });

            $(".cancel", editor.container).click(function () {
                editor.cancel();
                return false;
            });
        }; 

        // Create a TinyMCE-based Rich Inline Edit component.
        var tinyEditor = fluid.inlineEdit.tinyMCE("#richEdit1", {
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
            urls: {
                textEditButtonImage: "../../../../components/inlineEdit/images/inline_edit_edit_button_16x16.png"
            }
        });
        makeButtons(tinyEditor);

        // Create an CKEditor 3.x-based Rich Inline Edit component.
        var ckEditor = fluid.inlineEdit.CKEditor("#richEdit2", {
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
            urls: {
                textEditButtonImage: "../../../../components/inlineEdit/images/inline_edit_edit_button_16x16.png"
            }
        });
        makeButtons(ckEditor);    
    };    

    demo.initRichInlineEdit.selectors = {
        undoContainer: ".undoContainer",
        undoControl: ".undoControl",
        redoContainer: ".redoContainer",
        redoControl: ".redoControl"
    };
    
    demo.initRichInlineEdit.undoRenderer = function (that, targetContainer) {
        var markup = 
            "<span class='flc-undo demo-inlineEdit-inlinePadding'>" +
            "<span class='undoContainer' role='button'><a href='#' class='undoControl'>Undo edit</a></span>" +
            "<span class='redoContainer' role='button'><a href='#' class='redoControl'>Redo edit</a></span>" +
            "</span>";
        var markupNode = $(markup);
        var button = $("a", targetContainer);
        button.after(markupNode);
        return markupNode;
    };    

})(jQuery, fluid);
