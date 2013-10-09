/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function () {

    /**********************************************
     * Browser-based strategy for loading styles. *
     **********************************************/

    fluid.build.cssGenerator.browserSheetStore = function (stylesheetLinkEl) {
        var that = {
            sheetEl: stylesheetLinkEl
        };
        
        that.load = function () {
            return fluid.build.cssGenerator.browserSheetStore.syncLoadStylesheetURL(that.sheetEl.attr("href"));
        };
        
        that.save = function () {
            // No-op for the browser for now.
        };
        
        return that;
    };
    
    fluid.build.cssGenerator.browserSheetStore.syncLoadStylesheetURL = function (url) {
        var cssText;
        jQuery.ajax({
            url: url,
            dataType: "text",
            async: false,
            success: function (response) {
                cssText = response;
            },
            error: function () {
                cssText = null;
            }
        });
        return cssText;
    };
})();
