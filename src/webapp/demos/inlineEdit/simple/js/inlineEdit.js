/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley

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