/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010-2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

var demo = demo || {};

(function ($, fluid) {
    "use strict";

    fluid.defaults("demo.uploader", {
        gradeNames: ["fluid.viewComponent"],
        events: {
            onMarkupReady: null
        },
        listeners: {
            // Load the Uploader's markup via AJAX and inject it into the page.
            "onCreate.loadTemplate": "{that}.loadTemplate"
        },
        invokers: {
            loadTemplate: {
                funcName: "demo.uploader.loadTemplate",
                args: ["{that}.container", "{that}.options.templateURL", "{that}.options.fragmentSelector", "{that}.events.onMarkupReady.fire"]
            }
        },
        // Path to the Uploader's markup
        templateURL: "../../src/components/uploader/html/Uploader.html",
        // Because the template is an actual standalone Web page, we also need to
        // specify a selector that points to the part of the page we're interested in.
        fragmentSelector: ".flc-uploader-container",
        components: {
            // Configuration for the actual Uploader component
            uploader: {
                type: "fluid.uploader",
                container: "{that}.options.fragmentSelector",
                // Once the template has been loaded into the page, instantiate the Uploader.
                createOnEvent: "onMarkupReady",
                options: {
                    // the demo flag causes the Uploader to simulate the uploading of files.
                    demo: true
                }
            }
        }
    });

    demo.uploader.loadTemplate = function (element, templateURL, fragmentSelector, callback) {
        templateURL = fragmentSelector ? templateURL + " " + fragmentSelector : templateURL;
        $(element).load(templateURL, callback);
    };

})(jQuery, fluid);
