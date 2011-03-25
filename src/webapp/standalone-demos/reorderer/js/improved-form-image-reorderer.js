/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

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