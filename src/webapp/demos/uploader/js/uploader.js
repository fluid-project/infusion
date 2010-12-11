/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid*/
/*global demo*/

var demo = demo || {};

(function ($, fluid) {
    demo.initUploader = function () {
        // Load the Uploader's template via AJAX and inject it into this page.
        var templateURLSelector = "../../../components/uploader/html/Uploader.html .fl-uploader";
        $("#uploader-contents").load(templateURLSelector, null, function () {
            
            // Initialize the Uploader in demo mode.
            fluid.uploader(".flc-uploader", {
                demo: true
            });
        });
    };
})(jQuery, fluid);


  