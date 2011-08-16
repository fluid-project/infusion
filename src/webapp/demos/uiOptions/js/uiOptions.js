/*
Copyright 2011 OCAD University

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
(function ($, fluid) {       

    // Initialize UI Enhancer for the page.
    demo.initPageEnhancer = function (customThemeName) {
        var opts = {
            tocTemplate: "../../../components/tableOfContents/html/TableOfContents.html"
        };
        if (customThemeName) {
            opts.classnameMap = {
                theme: {
                    "default": customThemeName
                }
            };
        }
        fluid.pageEnhancer(opts);
    };

    // Initialize UI Options on the Full Page, No Preview version
    demo.initFullNoPreview = function (container) {
        fluid.uiOptions.fullNoPreview(container, {
            // Tell UIOptions where to find all the templates, relative to this file
            prefix: "../../../components/uiOptions/html/",

            // Tell UIOptions where to redirect to if the user cancels the operation
            uiOptions: {
                options: {
                    listeners: {
                        onCancel: function(){
                            window.location = "uiOptions.html";
                        }
                    }
                }
            }
        });
    };

    // Initialize UI Options on the Full Page, With Preview version
    demo.initFullWithPreview = function (container, customThemeName) {
        fluid.uiOptions.fullPreview(container, {
            // Tell UIOptions where to find all the templates, relative to this file
            prefix: "../../../components/uiOptions/html/",

            // Tell UIOptions where to redirect to if the user cancels the operation
            uiOptions: {
               options: {
                   listeners: {
                       onCancel: function(){
                           window.location = "uiOptions.html";
                       }
                   }
               }
            },

            // Configure the preview's UI Enhancer
            previewEnhancer: {
                options: {
                    // Tell the Preview's UI Enhancer where the Table of Contents template is
                    tocTemplate: "../../../components/tableOfContents/html/TableOfContents.html",

                    // and the name of the default theme
                    classnameMap: {
                        theme: {
                            "default": customThemeName
                        }
                    }
                }
            }
        });
    };

    // Initialize UI Options on the Fat Panel version
    demo.initFatPanel = function (panel, uioptions) {        
        // Start up UI Options
        fluid.uiOptions.fatPanel(".flc-uiOptions-fatPanel", {
            prefix: "../../../components/uiOptions/html/"
        });

        // Configure the buttons
        $(".disp-opts-with-preview").click(function(){
           window.location = "uiOptionsFullWithPreview.html";
       });
        $(".disp-opts-without-preview").click(function(){
           window.location = "uiOptionsFullWithoutPreview.html";
       });
    };
    
})(jQuery, fluid);
