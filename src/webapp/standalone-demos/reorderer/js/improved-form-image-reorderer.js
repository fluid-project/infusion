var demo = demo || {};
(function ($) {
    var url = "http://localhost/gallery";
    
    var postOrder = function (images) {
        // Serialize the form and post it back to the server.
        var imageOrder = $("form.flc-imageReorderer").serialize();
        $.ajax({
            type: "POST",
            url: url, 
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