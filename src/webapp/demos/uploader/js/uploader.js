/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010 OCAD University

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

fluid.registerNamespace("fluid.uploader.demo");

(function ($, fluid) {
    fluid.defaults("fluid.uploader.demo.demoLoader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.uploader.demo.initDemoLoader",
        templateURL: "../../../components/uploader/html/Uploader.html",
        fragmentSelector: ".fl-uploader",
        uploaderContainer: ".flc-uploader"
    });
    
    fluid.uploader.demo.defaultContainer = "#uploader-contents";
    
    fluid.uploader.demo.initDemoLoader = function(that) {
         var templateURLSelector = that.options.templateURL + " " + that.options.fragmentSelector;
         // Load the Uploader's template via AJAX and inject it into this page.
         that.container.load(templateURLSelector, null, that.options.callback);
    };
    
    fluid.uploader.demo.makeInitUploaderFunc = function(callback) {
        return function() {
            fluid.uploader.demo.demoLoader(fluid.uploader.demo.defaultContainer, {callback: callback});
        }
    };
    
    fluid.uploader.demo.initUploader = fluid.uploader.demo.makeInitUploaderFunc( function() {
        fluid.uploader(".flc-uploader", {
            demo: true
        });
    });          

    fluid.defaults("fluid.uploader.demo.IoCLoader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            uploader: {
                type: "fluid.uploader",
                container: "{IoCLoader}.container",
                options: {
                    demo: true
                }
            }
        }
    });

    // Demonstrate the user requesting that they want default configuration for all uploaders created in this session
    fluid.staticEnvironment.uploaderConfig = fluid.progressiveCheckerForComponent({componentName: "fluid.uploader"});

    fluid.uploader.demo.initIoCUploader = fluid.uploader.demo.makeInitUploaderFunc( function() {
        fluid.uploader.demo.IoCLoader(fluid.uploader.demo.defaultContainer);
    });

})(jQuery, fluid);


  