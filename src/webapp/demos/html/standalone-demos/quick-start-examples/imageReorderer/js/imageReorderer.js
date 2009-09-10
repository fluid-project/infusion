var demo = demo || {};
(function ($) {
    
    demo.formBasedImageReorderer = function () {
        var reorderer = fluid.reorderImages(".flc-imageReorderer", {
            selectors: {
                movables: ".flc-imageReorderer-item"
            }
        });  
    };
})(jQuery);