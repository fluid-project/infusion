/*
Copyright 2008 University of Cambridge
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_0_7*/
/*global tinyMCE*/
/*global FCKeditor*/
/*global FCKeditorAPI*/
/*global fluid*/ //this global function will refer to whichever version of Fluid Infusion was first loaded

fluid_0_7 = fluid_0_7 || {};

(function ($, fluid) {

    var configureInlineEdit = function (configurationName, container, options) {
        var assembleOptions = $.extend({}, fluid.defaults(configurationName), options);
        return fluid.inlineEdit(container, assembleOptions);
    };

    // Configuration for integrating tinyMCE
    
    /**
     * Instantiate a rich-text InlineEdit component that uses an instance of TinyMCE.
     * 
     * @param {Object} componentContainer the element containing the inline editors
     * @param {Object} options configuration options for the components
     */
    fluid.inlineEdit.tinyMCE = function (container, options) {
        return configureInlineEdit("fluid.inlineEdit.tinyMCE", container, options);
    };
        
    fluid.inlineEdit.tinyMCE.viewAccessor = function (editField) {
        return {
            value: function (newValue) {
                var editor = tinyMCE.get(editField.id);
                if (!editor) {
                    return "";
                }
                if (newValue) {
                    // without this, there is an intermittent race condition if the editor has been created on this event.
                    $(editField).val(newValue); 
                    editor.setContent(newValue, {format : 'raw'});
                }
                else {
                    return editor.getContent();
                }
            }
        };
    };
   
    fluid.inlineEdit.tinyMCE.editModeRenderer = function (that) {
        var defaultOptions = {
            mode: "exact", 
            theme: "simple"
        };
        var options = $.extend(true, defaultOptions, that.options.tinyMCE);
        options.elements = fluid.allocateSimpleId(that.editField);
        tinyMCE.init(options);
    };
    
      
    fluid.defaults("fluid.inlineEdit.tinyMCE", {
        useTooltip: true,
        selectors: {
            edit: "textarea" 
        },
        
        styles: {
            invitation: null // Override because it causes problems with flickering. Help?
        },
        displayAccessor: "fluid.inlineEdit.richTextViewAccessor",
        editAccessor: "fluid.inlineEdit.tinyMCE.viewAccessor",
        lazyEditView: true,
        editModeRenderer: fluid.inlineEdit.tinyMCE.editModeRenderer
    });
    
    
    
    // Configuration for integrating FCKEditor
    
    /**
     * Instantiate a rich-text InlineEdit component that uses an instance of FCKeditor.
     * 
     * @param {Object} componentContainer the element containing the inline editors
     * @param {Object} options configuration options for the components
     */
    fluid.inlineEdit.FCKEditor = function (container, options) {
        return configureInlineEdit("fluid.inlineEdit.FCKEditor", container, options);
    };
    
    fluid.inlineEdit.FCKEditor.complete = fluid.event.getEventFirer();
    
    fluid.inlineEdit.FCKEditor.editModeRenderer = function (that) {
        var id = fluid.allocateSimpleId(that.editField);
        var oFCKeditor = new FCKeditor(id);
        oFCKeditor.BasePath = "fckeditor/";
        $.extend(true, oFCKeditor.Config, that.options.FCKEditor);
        // somehow, some properties like Width and Height are set on the object itself
        $.extend(true, oFCKeditor, that.options.FCKEditor);
        oFCKeditor.ReplaceTextarea();
        $.data(fluid.unwrap(that.editField), "fluid.inlineEdit.FCKEditor", oFCKeditor);
    };
    
    fluid.inlineEdit.FCKEditor.viewAccessor = function (editField) {
        return {
            value: function (newValue) {
                var editor = typeof(FCKeditorAPI) === "undefined"? null: FCKeditorAPI.GetInstance(editField.id);
                if (!editor) {
                	if (newValue) {
                        $(editField).val(newValue);
                	}
                	return "";
                }
                if (newValue) {
                    editor.SetHTML(newValue);
                }
                else {
                    return editor.GetHTML();
                }
            }
        };
    };
    
    
    fluid.defaults("fluid.inlineEdit.FCKEditor", {
        selectors: {
            edit: "textarea" 
        },
        
        styles: {
            invitation: null // Override because it causes problems with flickering. Help?
        },
      
        displayAccessor: "fluid.inlineEdit.richTextViewAccessor",
        editAccessor: "fluid.inlineEdit.FCKEditor.viewAccessor",
        lazyEditView: true,
        editModeRenderer: fluid.inlineEdit.FCKEditor.editModeRenderer
    });
    
    
    // Configuration for integrating a drop-down editor
    
    /**
     * Instantiate a drop-down InlineEdit component
     * 
     * @param {Object} container
     * @param {Object} options
     */
    fluid.inlineEdit.dropdown = function (container, options) {
        return configureInlineEdit("fluid.inlineEdit.dropdown", container, options);
    };

    fluid.inlineEdit.dropdown.editModeRenderer = function (that) {
        var id = fluid.allocateSimpleId(that.editField);
        that.editField.selectbox({
            finishHandler: function () {
                that.finish();
            }
        });
        return {
            container: that.editContainer,
            field: $("input.selectbox", that.editContainer) 
        };
    };
   
    fluid.inlineEdit.dropdown.blurHandlerBinder = function (that) {
        fluid.deadMansBlur(that.editField,
                           $("div.selectbox-wrapper li", that.editContainer),
                           function () {
                               that.cancel();
                            });
    };


    
    fluid.defaults("fluid.inlineEdit.dropdown", {
        applyEditPadding: false,
        blurHandlerBinder: fluid.inlineEdit.dropdown.blurHandlerBinder,
        editModeRenderer: fluid.inlineEdit.dropdown.editModeRenderer
    });
    
    
})(jQuery, fluid_0_7);


// This must be written outside any scope as a result of the FCKEditor event model.
// Do not overwrite this function, if you wish to add your own listener to FCK completion,
// register it with the standard fluid event firer at fluid.inlineEdit.FCKEditor.complete
function FCKeditor_OnComplete(editorInstance) {
    fluid.inlineEdit.FCKEditor.complete.fire(editorInstance);
}