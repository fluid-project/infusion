/*
Copyright 2007-2009 University of Toronto
Copyright 2007-2009 University of Cambridge

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

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