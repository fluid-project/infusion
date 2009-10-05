/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_1*/
/*global tinyMCE*/
/*global FCKeditor*/
/*global FCKeditorAPI*/
/*global fluid*/ //this global function will refer to whichever version of Fluid Infusion was first loaded

fluid_1_1 = fluid_1_1 || {};

(function ($, fluid) {

    var configureInlineEdit = function (configurationName, container, options) {
    	var defaults = fluid.defaults(configurationName); 
        var assembleOptions = fluid.merge(defaults? defaults.mergePolicy: null, {}, defaults, options);
        return fluid.inlineEdit(container, assembleOptions);
    };

    fluid.inlineEdit.normalizeHTML = function(value) {
        var togo = $.trim(value.replace(/\s+/g, " "));
        togo = togo.replace(/\s+<\//g, "</");
        togo = togo.replace(/\<(\S+)[^\>\s]*\>/g, function(match) {
            return match.toLowerCase();
            });
        return togo;
    };
    
    fluid.inlineEdit.htmlComparator = function(el1, el2) {
        return fluid.inlineEdit.normalizeHTML(el1) ===
           fluid.inlineEdit.normalizeHTML(el2);
    };

    // Configuration for integrating tinyMCE
    
    /**
     * Instantiate a rich-text InlineEdit component that uses an instance of TinyMCE.
     * 
     * @param {Object} componentContainer the element containing the inline editors
     * @param {Object} options configuration options for the components
     */
    fluid.inlineEdit.tinyMCE = function (container, options) {
        var inlineEditor = configureInlineEdit("fluid.inlineEdit.tinyMCE", container, options);
        tinyMCE.init(inlineEditor.options.tinyMCE);
        return inlineEditor;
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
   
    fluid.inlineEdit.tinyMCE.blurHandlerBinder = function (that) {
        function focusEditor(editor) {
            setTimeout(function () {
                tinyMCE.execCommand('mceFocus', false, that.editField[0].id);
                if ($.browser.mozilla && $.browser.version.substring(0, 3) === "1.8") {
                    // Have not yet found any way to make this work on FF2.x - best to do nothing,
                    // for FLUID-2206
                    //var body = editor.getBody();
                    //fluid.setCaretToEnd(body.firstChild, "");
                    return;
                }
                editor.selection.select(editor.getBody(), 1);
                editor.selection.collapse(0);
            }, 10);
        }
        
        that.events.afterInitEdit.addListener(function (editor) {
            focusEditor(editor);
            var editorBody = editor.getBody();

            // NB - this section has no effect - on most browsers no focus events
            // are delivered to the actual body
            fluid.deadMansBlur(that.editField, $(editorBody), function () {
                that.cancel();
            });
        });
            
        that.events.afterBeginEdit.addListener(function () {
            var editor = tinyMCE.get(that.editField[0].id);
            if (editor) {
                focusEditor(editor);
            } 
        });
    };
   
   
    fluid.inlineEdit.tinyMCE.editModeRenderer = function (that) {
        var options = that.options.tinyMCE;
        options.elements = fluid.allocateSimpleId(that.editField);
        var oldinit = options.init_instance_callback;
        
        options.init_instance_callback = function (instance) {
            that.events.afterInitEdit.fire(instance);
            if (oldinit) {
                oldinit();
            }
        };
        
        tinyMCE.init(options);
    };
    
      
    fluid.defaults("fluid.inlineEdit.tinyMCE", {
        tinyMCE : {
            mode: "exact", 
            theme: "simple"
        },
        useTooltip: true,
        selectors: {
            edit: "textarea" 
        },
        
        styles: {
            invitation: "fl-inlineEdit-richText-invitation"
        },
        displayAccessor: {
            type: "fluid.inlineEdit.richTextViewAccessor"
        },
        editAccessor: {
            type: "fluid.inlineEdit.tinyMCE.viewAccessor"
        },
        lazyEditView: true,
        modelComparator: fluid.inlineEdit.htmlComparator,
        blurHandlerBinder: fluid.inlineEdit.tinyMCE.blurHandlerBinder,
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
    
    fluid.inlineEdit.FCKEditor.complete.addListener(function (editor) {
        var editField = editor.LinkedField;
        var that = $.data(editField, "fluid.inlineEdit.FCKEditor"); 
        that.events.afterInitEdit.fire(editor);
    });
    
    fluid.inlineEdit.FCKEditor.blurHandlerBinder = function (that) {
	    function focusEditor(editor) {
            editor.Focus(); 
        }
        
        that.events.afterInitEdit.addListener(
            function (editor) {
                focusEditor(editor);
                var editorBody = editor.EditingArea.TargetElement;

                // NB - this section has no effect - on most browsers no focus events
                // are delivered to the actual body
                //fluid.deadMansBlur(that.editField,
                //         $(editorBody),
                //           function () {
                //               that.cancel();
                //            });
            }
        );
        that.events.afterBeginEdit.addListener(function () {
            var editor = fluid.inlineEdit.FCKEditor.byId(that.editField[0].id);
            if (editor) {
                focusEditor(editor);
            } 
        });

    };

    fluid.inlineEdit.FCKEditor.byId = function (id) {
        var editor = typeof(FCKeditorAPI) === "undefined"? null: FCKeditorAPI.GetInstance(id);
        return editor;  
    };
    
    fluid.inlineEdit.FCKEditor.editModeRenderer = function (that) {
        var id = fluid.allocateSimpleId(that.editField);
        $.data(fluid.unwrap(that.editField), "fluid.inlineEdit.FCKEditor", that);
        var oFCKeditor = new FCKeditor(id);
        // The Config object and the FCKEditor object itself expose different configuration sets,
        // which possess a member "BasePath" with different meanings. Solve FLUID-2452, FLUID-2438
        // by auto-inferring the inner path for Config (method from http://drupal.org/node/344230 )
        var opcopy = fluid.copy(that.options.FCKEditor);
        opcopy.BasePath = opcopy.BasePath + "editor/";
        $.extend(true, oFCKeditor.Config, opcopy);
        // somehow, some properties like Width and Height are set on the object itself

        $.extend(true, oFCKeditor, that.options.FCKEditor);
        oFCKeditor.Config.fluidInstance = that;
        oFCKeditor.ReplaceTextarea();
    };
    
    fluid.inlineEdit.FCKEditor.viewAccessor = function (editField) {
        return {
            value: function (newValue) {
                var editor = fluid.inlineEdit.FCKEditor.byId(editField.id); 
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
            invitation: "fl-inlineEdit-richText-invitation"
        },
      
        displayAccessor: {
            type: "fluid.inlineEdit.richTextViewAccessor"
        },
        editAccessor: {
            type: "fluid.inlineEdit.FCKEditor.viewAccessor"
        },
        lazyEditView: true,
        modelComparator: fluid.inlineEdit.htmlComparator,
        blurHandlerBinder: fluid.inlineEdit.FCKEditor.blurHandlerBinder,
        editModeRenderer: fluid.inlineEdit.FCKEditor.editModeRenderer,
        FCKEditor: {
            BasePath: "fckeditor/"    
        }
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
    
    
})(jQuery, fluid_1_1);


// This must be written outside any scope as a result of the FCKEditor event model.
// Do not overwrite this function, if you wish to add your own listener to FCK completion,
// register it with the standard fluid event firer at fluid.inlineEdit.FCKEditor.complete
function FCKeditor_OnComplete(editorInstance) {
    fluid.inlineEdit.FCKEditor.complete.fire(editorInstance);
}