(function ($) {
    $(function () {
 
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
      
        var richEditor = fluid.inlineEdit.tinyMCE("#rich-editable-paragraph");
        makeButtons(richEditor);
        
        var richEditor2 = fluid.inlineEdit.tinyMCE("#rich-editable-paragraph-2", 
           //{tinyMCE: {theme: "advanced"}} // this will cause the entire browser to become corrupted
           {tinyMCE: {width: 1024}}
           );
        makeButtons(richEditor2);

        var richEditor3 = fluid.inlineEdit.FCKEditor("#FCK-editable-paragraph");
        makeButtons(richEditor3);
        
        var richEditor4 = fluid.inlineEdit.FCKEditor("#FCK-editable-paragraph-2", 
          {FCKEditor: {Width: 600}}
          );
        makeButtons(richEditor4);
        
    });
})(jQuery);