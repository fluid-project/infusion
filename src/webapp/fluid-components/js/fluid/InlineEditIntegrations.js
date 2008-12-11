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
/*global fluid_0_6*/
/*global tinyMCE*/
/*global FCKeditor*/
/*global FCKeditorAPI*/
/*global fluid*/ //this global function will refer to whichever version of Fluid Infusion was first loaded

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {

    // Configuration for integrating tinyMCE
    
    fluid.tinyMCE = {};
    
    fluid.tinyMCE.inlineEditViewAccessor = function (editField) {
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
   
    fluid.tinyMCE.editModeRenderer = function (that) {
        var defaultOptions = {
            mode: "exact", 
            theme: "simple"
        };
        var options = $.extend(true, defaultOptions, that.options.tinyMCE);
        options.elements = fluid.allocateSimpleId(that.editField);
        tinyMCE.init(options);
    };
    
      
    fluid.defaults("fluid.inlineTinyMCE", {
        useTooltip: true,
        selectors: {
            edit: "textarea" 
        },
        
        styles: {
            invitation: null // Override because it causes problems with flickering. Help?
        },
        displayAccessor: "fluid.inlineEdit.richTextViewAccessor",
        editAccessor: "fluid.tinyMCE.inlineEditViewAccessor",
        lazyEditView: true,
        editModeRenderer: fluid.tinyMCE.editModeRenderer
    });
    
    
    
    // Configuration for integrating FCKEditor
    
    fluid.FCKEditor = {};
    
    fluid.FCKEditor.complete = fluid.event.getEventFirer();
    
    fluid.FCKEditor.editModeRenderer = function (that) {
        var id = fluid.allocateSimpleId(that.editField);
        var oFCKeditor = new FCKeditor(id);
        oFCKeditor.BasePath = "fckeditor/";
        $.extend(true, oFCKeditor.Config, that.options.FCKEditor);
        // somehow, some properties like Width and Height are set on the object itself
        $.extend(true, oFCKeditor, that.options.FCKEditor);
        oFCKeditor.ReplaceTextarea();
        $.data(fluid.unwrap(that.editField), "fluid.inlineFCKEditor", oFCKeditor);
    };
    
    fluid.FCKEditor.inlineEditViewAccessor = function (editField) {
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
    
    
    fluid.defaults("fluid.inlineFCKEditor", {
        selectors: {
            edit: "textarea" 
        },
        
        styles: {
            invitation: null // Override because it causes problems with flickering. Help?
        },
      
        displayAccessor: "fluid.inlineEdit.richTextViewAccessor",
        editAccessor: "fluid.FCKEditor.inlineEditViewAccessor",
        lazyEditView: true,
        editModeRenderer: fluid.FCKEditor.editModeRenderer
    });
    
    
    fluid.selectbox = {};
  
    fluid.selectbox.editModeRenderer = function (that) {
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
   
    fluid.selectbox.blurHandlerBinder = function (that) {
        fluid.deadMansBlur(that.editField,
                           $("div.selectbox-wrapper li", that.editContainer),
                           function () {
                               that.cancel();
                            });
    };


    
    fluid.defaults("fluid.selectbox", {
        selectors: {
            edit: "#myselectbox"
        },
        applyEditPadding: false,
        blurHandlerBinder: fluid.selectbox.blurHandlerBinder,
        editModeRenderer: fluid.selectbox.editModeRenderer
    });
    
    var configureInlineEdit = function (configurationName, container, options) {
        var assembleOptions = $.extend({}, fluid.defaults(configurationName), options);
        return fluid.inlineEdit(container, assembleOptions);
    };

    /**
     * Instantiate a rich-text InlineEdit component that uses an instance of FCKeditor.
     * 
     * @param {Object} componentContainer the element containing the inline editors
     * @param {Object} options configuration options for the components
     */
    fluid.inlineEditFCK = function (container, options) {
        return configureInlineEdit("fluid.inlineFCKEditor", container, options);
    };
    
    /**
     * Instantiate a rich-text InlineEdit component that uses an instance of TinyMCE.
     * 
     * @param {Object} componentContainer the element containing the inline editors
     * @param {Object} options configuration options for the components
     */
    fluid.inlineEditTinyMCE = function (container, options) {
        return configureInlineEdit("fluid.inlineTinyMCE", container, options);
    };
    
    /**
     * Instantiate a drop-down InlineEdit component
     * 
     * @param {Object} container
     * @param {Object} options
     */
    fluid.inlineEditDropdown = function (container, options) {
        return configureInlineEdit("fluid.selectbox", container, options);
    };

    
})(jQuery, fluid_0_6);


// This must be written outside any scope as a result of the FCKEditor event model.
// Do not overwrite this function, if you wish to add your own listener to FCK completion,
// register it with the standard fluid event firer at fluid.FCKEditor.complete
function FCKeditor_OnComplete(editorInstance) {
    fluid.FCKEditor.complete.fire(editorInstance);
}