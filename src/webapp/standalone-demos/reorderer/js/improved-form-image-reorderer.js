/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

var demo = demo || {};
(function ($) {
    var postOrder = function (images) {
        // Serialize the form and post it back to the server.
        var form = $("form.flc-imageReorderer");
        var imageOrder = $(form).serialize();
        $.ajax({
            type: "POST",
            url: form.action, 
            data: imageOrder, 
            complete: function (data, ajaxStatus) {
                // Handle success or failure by being nice to the user.
            }
        });
    };
    
    var afterMoveListener = function (item, pos, images) {        
        // Update the order correctly.
        images.each(function (idx, image) {
            $(image).children("input").val(idx);
        });
        
        // POST it back to the server.
        postOrder(images);
    };
    
    demo.formBasedImageReorderer = function () {
        var reorderer = fluid.reorderImages(".flc-imageReorderer", {
            selectors: {
                movables: ".flc-imageReorderer-item"
            },
            
            listeners: {
                afterMove: afterMoveListener
            }
        });  
    };
})(jQuery);