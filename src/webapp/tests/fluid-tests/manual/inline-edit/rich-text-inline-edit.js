(function ($) {
    $(function () {
        
        // Configuration for integrating tinyMCE
        
        fluid.tinyMCE = {};
        
        fluid.tinyMCE.inlineEditViewAccessor = function(editField) {
            return {
                value: function(newValue) {
                    var editor = tinyMCE.get(editField.id);
                    if (!editor) return "";
                    if (newValue) {
                        editor.setContent(newValue, {format : 'raw'});
                    }
                    else {
                        return editor.getContent();
                    }
                }
            }
        };
       
        fluid.tinyMCE.editModeRenderer = function(that) {
            var defaultOptions = {
                mode: "exact", 
                theme: "simple",
            }
            var options = $.extend(true, defaultOptions, that.options.tinyMCE);
            options.elements = fluid.allocateSimpleId(that.editField);
            tinyMCE.init(options);
        };
        
        
        // Configuration for integrating FCKEditor
        
        fluid.FCKEditor = {};
        
        fluid.FCKEditor.complete = fluid.event.getEventFirer();
        
        fluid.FCKEditor.complete.addListener(
            function (editorInstance) {
                var editField = fluid.byId(editorInstance.Name);
                var newValue = $.data(editField, "fluid.FCKEditor.pending");
                if (newValue !== undefined && newValue !== null) {
                    editorInstance.SetHTML(newValue);
                    $.data(editField, "fluid.FCKEditor.pending", null);
                }
            }
        );
        
        fluid.FCKEditor.editModeRenderer = function(that) {
            var id = fluid.allocateSimpleId(that.editField);
            var oFCKeditor = new FCKeditor(id);
            oFCKeditor.BasePath = "fckeditor/";
            $.extend(true, oFCKeditor.Config, that.options.FCKEditor);
            // somehow, some properties like Width and Height are set on the object itself
            $.extend(true, oFCKeditor, that.options.FCKEditor);
            oFCKeditor.ReplaceTextarea();
            $.data(fluid.unwrap(that.editField), "fluid.FCKEditor", oFCKeditor);
        }
        
        fluid.FCKEditor.inlineEditViewAccessor = function(editField) {
            return {
                value: function(newValue) {
                  // FCKEditor has a lunatic instantiation model whereby none of its active
                  // classes may be present at this time. In this case, defer application of
                  // "newValue" to an event handler operating 
                    if (typeof FCKeditorAPI === "undefined") {
                         $.data(fluid.unwrap(editField), 
                             "fluid.FCKEditor.pending", newValue);
                         return;
                    }
                    var editor = FCKeditorAPI.GetInstance(editField.id);
                    if (newValue) {
                        editor.SetHTML(newValue);
                    }
                    else {
                        return editor.GetHTML();
                    }
                }
            }
        };
        
       fluid.selectbox = {};
      
       fluid.selectbox.editModeRenderer = function(that) {
           var id = fluid.allocateSimpleId(that.editField);
           that.editField.selectbox({finishHandler: function() {that.finish();}});
           return {
               container: that.editContainer,
               field: $("input.selectbox", that.editContainer) 
           }
       }
       
       fluid.selectbox.blurHandlerBinder = function(that) {
           fluid.deadMansBlur(that.editField, $("div.selectbox-wrapper li", that.editContainer),
              function() {that.cancel()});
       }
      
      
      
       var MCEoptions = {
            useTooltip: true,
            selectors: {
                edit: "textarea" 
            },
            
            styles: {
                invitation: null // Override because it causes problems with flickering. Help?
            },
            displayAccessor: "fluid.inlineEdit.richTextViewAccessor",
            editAccessor: "fluid.tinyMCE.inlineEditViewAccessor",
            editModeRenderer: fluid.tinyMCE.editModeRenderer
        };

        var FCKoptions = {
            selectors: {
                edit: "textarea" 
            },
            
            styles: {
                invitation: null // Override because it causes problems with flickering. Help?
            },
          
            displayAccessor: "fluid.inlineEdit.richTextViewAccessor",
            editAccessor: "fluid.FCKEditor.inlineEditViewAccessor",
            editModeRenderer: fluid.FCKEditor.editModeRenderer
        };
        
        var selectoptions = {
            selectors: {
                edit: "#myselectbox"
            },
            applyEditPadding: false,
            blurHandlerBinder: fluid.selectbox.blurHandlerBinder,
            editModeRenderer: fluid.selectbox.editModeRenderer
        };

        function makeButtons(editor) {
            $(".save", editor.container).click(function(){
                editor.finish();
                return false;
            });
        
            $(".cancel", editor.container).click(function(){
                editor.cancel();
                return false;
            });
        }
      
        var richEditor = fluid.inlineEdit("#rich-editable-paragraph", MCEoptions);
        makeButtons(richEditor);
        
        var richEditor2 = fluid.inlineEdit("#rich-editable-paragraph-2", 
           $.extend(true, {}, MCEoptions, 
           //{tinyMCE: {theme: "advanced"}} // this will cause the entire browser to become corrupted
           {tinyMCE: {width: 1024}}
           ));
        makeButtons(richEditor2);

        var richEditor3 = fluid.inlineEdit("#FCK-editable-paragraph", FCKoptions);
        makeButtons(richEditor3);
        
        var richEditor4 = fluid.inlineEdit("#FCK-editable-paragraph-2", 
          $.extend(true, {}, FCKoptions, 
          {FCKEditor: {Width: 600}}
          ));
        makeButtons(richEditor4);
        
    });
})(jQuery);


// This must be written outside any scope as a result of the FCKEditor event model.
// Do not overwrite this function, if you wish to add your own listener to FCK completion,
// register it with the standard fluid event firer at fluid.FCKEditor.complete
function FCKeditor_OnComplete(editorInstance) {
    fluid.FCKEditor.complete.fire(editorInstance);
    }
