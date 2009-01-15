/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the GNU General Public License or the MIT license.
You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the GPL and MIT License at
https://source.fluidproject.org/svn/sandbox/tabindex/trunk/LICENSE.txt
*/
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
