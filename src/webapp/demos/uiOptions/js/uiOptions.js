/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery, window*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};
(function ($, fluid) {       

    /**
     * Initialize UI Enhancer for the page. This function is used by the two full-page
     * UI Options pages as well as by the demo page itself.
     */
    demo.initPageEnhancer = function (customThemeName) {
        fluid.pageEnhancer({
            tocTemplate: "../../../components/tableOfContents/html/TableOfContents.html",
            classnameMap: {
                theme: {
                    "default": customThemeName
                }
            }
        });
    };

    /**
     * The basic options for configuring the full-page versions of UI Options are the same,
     * regardless of whether or not the Preview is used. This function is used by both
     * full-page version, with and without Preview, to set up these options.
     */
    var setUpBasicFullPageOpts = function () {
        return {
            // Tell UIOptions where to find all the templates, relative to this file
            prefix: "../../../components/uiOptions/html/",

            // Tell UIOptions where to redirect to if the user cancels the operation
            uiOptions: {
                options: {
                    listeners: {
                        onCancel: function () {
                            window.location = "uiOptions.html";
                        }
                    }
                }
            }
        };
    };

    /**
     * Initialize UI Options on the "Full Page, No Preview" version.
     */
    demo.initFullNoPreview = function (container) {
        fluid.uiOptions.fullNoPreview(container, setUpBasicFullPageOpts());
    };

    /**
     * Initialize UI Options on the "Full Page, With Preview" version.
     */
    demo.initFullWithPreview = function (container, customThemeName) {
        var opts = setUpBasicFullPageOpts();
     
        // In addition to the basic options, we need to configure the Preview's UI Enhancer
        opts.previewEnhancer = {
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
        };
        fluid.uiOptions.fullPreview(container, opts);
    };

    /**
     * Initialize UI Options on the "Fat Panel" version. This version of UI Options uses the
     * page itself as a live preview.
     */
    demo.initFatPanel = function (container) {        
        fluid.uiOptions.fatPanel(container, {
            // Tell UIOptions where to find all the templates, relative to this file
            prefix: "../../../components/uiOptions/html/"
        });
    };

    /**
     * Set up the buttons to link to the full-page versions of UI Options.
     */
    demo.setUpButtons = function () {
        // Configure the buttons
        $(".disp-opts-with-preview").click(function () {
            window.location = "uiOptionsFullWithPreview.html";
        });
        $(".disp-opts-without-preview").click(function () {
            window.location = "uiOptionsFullWithoutPreview.html";
        });
    };
    
})(jQuery, fluid);
