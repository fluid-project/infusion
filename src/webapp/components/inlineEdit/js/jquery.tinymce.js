/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/
// A super-simple jQuery TinyMCE plugin that actually works.
// Written by Colin Clark

/*global jQuery, tinyMCE*/

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
