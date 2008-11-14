// A super-simple jQuery TinyMCE plugin that actually works.
// Written by Colin Clark

(function ($) {
    // Invoke this immediately to prime TinyMCE.
    tinyMCE.init({
        mode: "none",
        theme: "simple"
    });
    
    $.fn.tinymce = function () {
        this.each(function () {
            // Need code to generate an id for the tinymce control if one doesn't exist.            
            tinyMCE.execCommand("mceAddControl", false, this.id);
        });
        
        return this;
    };
})(jQuery);
