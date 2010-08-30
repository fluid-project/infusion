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
     * Initialize all simple inline edit components present on the inline-edit 
     * demo.
     */
    var inlineSimpleEditSetup = function () {
    
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
         * Simple inline edits example.
         */            
        fluid.inlineEdit("#simpleEdit", {
            componentDecorators: {
                type: "fluid.undoDecorator"
            }
        });
        
        fluid.inlineEdit("#artistName", {
            componentDecorators: {
                type: "fluid.undoDecorator"
            }
        });
        
        fluid.inlineEdit("#artistNameHC", {
            componentDecorators: {
                type: "fluid.undoDecorator"
            }
        });
        
        /**
         * Customized simple inline edit.
         */
        fluid.inlineEdit("#customEdit", {
            selectors: {
                editContainer: "#customEditorContainer",
                edit: "#customizedEditField"
            }, 
            componentDecorators: {
                type: "fluid.undoDecorator",
                options: {
                    renderer: myUndoRenderer
                }
            }
        });
        
        /**
         * Multiple inline text editors.
         */
        fluid.inlineEdits("#multipleEdit", {
            selectors: {
                text: ".editableText",
                editables : "p"
            },
            componentDecorators: {
                type: "fluid.undoDecorator"
            }
        });
    };
    
    /**
     * Initialize all rich text inline edit components present on the inline-edit 
     * demo.
     */
    var inlineRichTextEditSetup = function () {
        
        var editors = [];
        
        /**
         * Create cancel and save buttons for a rich inline editor.
         * @param {Object} editor 
         */
        var makeButtons = function (editor) {
            $(".save", editor.container).click(function(){
                editor.finish();
                return false;
    	    });

            $(".cancel", editor.container).click(function(){
                editor.cancel();
                return false;
            });
        };
        
        /**
         * Create cancel and save buttons for all rich text editors.
         * @param {Object} editors array of rich inline editors.
         */
        var makeAllButtons = function (editors) {
            while (editors.length > 0) {
                makeButtons(editors.pop());
            }
        }            
        
        /**
         * Tiny MCE rich inline text editor example. 
         */
        editors.push(
            fluid.inlineEdit.tinyMCE("#richEdit1", {
                tinyMCE: {
                        width: 1024,
                        theme: "advanced",
                        theme_advanced_toolbar_location : "top"
                    }, 
                componentDecorators: {
                    type: "fluid.undoDecorator"
                }
            })
        );
        
        /**
         * FCK Editor rich inline text editor example. 
         */
        editors.push(
            fluid.inlineEdit.FCKEditor("#richEdit2", {
                FCKEditor: {BasePath: "../../../../tests/manual-tests/lib/fckeditor/"},
                componentDecorators: {
                    type: "fluid.undoDecorator"
                }
            })
        );
        
        /**
         * Mist theme block.
         */            
        editors.push(
            fluid.inlineEdit.tinyMCE("#cd-review1", {
                tinyMCE: {width: 300},
                componentDecorators: {
                    type: "fluid.undoDecorator"
                }
            })
        );
        
        editors.push(
            fluid.inlineEdit.FCKEditor("#cd-review2", {
                FCKEditor: {BasePath: "../../../../tests/manual-tests/lib/fckeditor/"},
                componentDecorators: {
                    type: "fluid.undoDecorator"
                }
            })
        );
        
        /**
         * High Contrast theme block.
         */            
        editors.push(
            fluid.inlineEdit.tinyMCE("#cd-review1HC", {
                tinyMCE: {width: 300}, 
                componentDecorators: {
                    type: "fluid.undoDecorator"
                }
            })
        );
        
        editors.push(
            fluid.inlineEdit.FCKEditor("#cd-review2HC", {
                FCKEditor: {BasePath: "../../../../tests/manual-tests/lib/fckeditor/"},
                componentDecorators: {
                    type: "fluid.undoDecorator"
                }
            })
        );
        
        makeAllButtons(editors);
    };
        
    demo.initInlineEdit = function () {        
        inlineSimpleEditSetup();
        inlineRichTextEditSetup();
    };    
})(jQuery, fluid);