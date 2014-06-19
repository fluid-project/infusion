/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010-2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid */

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    demo.uploader = function () {
        // Load the Uploader's markup via AJAX and inject it into this page.
        // Since the template is actually a standalone Web page, we also need to
        // specify a selector that points to the part of the page we're interested in.

        var templateURL = "../../src/components/uploader/html/Uploader.html";
        var fragmentSelector = ".fl-uploader";

        $("#uploader-contents").load(templateURL + " " + fragmentSelector, function () {

            // Once the template has been loaded into the page, instantiate the Uploader.
            fluid.uploader(".flc-uploader", {
                demo: true
            });
        });
    };

})(jQuery, fluid);
