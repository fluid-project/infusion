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

var build = build || {};

(function () {
    
    var setupCSSGenerator = function (that) {
        that.cssText = that.options.sheetStore.load();
        that.parser = new CSSParser();
        that.stylesheet = that.parser.parse(that.cssText, false, true);
    };
    
    build.cssGenerator = function (options) {
        var that = {
            options: options
        };
        
        that.prioritize = function (properties) {
            if (typeof (properties) === "string") {
                properties = [properties];
            }
            
            // Bail right away if we have no rules to process or no properties specified by the user.
            if (!that.stylesheet.cssRules || that.stylesheet.cssRules.length < 1 || 
                !properties || properties.length < 1) {
                return;
            }
            
            for (var i = 0; i < that.stylesheet.cssRules.length; i++) {
                var rule = that.stylesheet.cssRules[i];
                
                // If this rule doesn't have any declarations, keep on trucking.
                if (!rule.declarations || rule.declarations.length < 1) {
                    continue;
                }
                
                // Whip through each declaration's properties and see if they match one of our priorities.
                for (var j = 0; j < rule.declarations.length; j++) {
                    var declaration = rule.declarations[j];
                    for (var k = 0; k < properties.length; k++) {
                        var property = properties[k];
                        if (declaration.property === property) {
                            declaration.priority = true; // Prioritize this declaration as !important.
                        }
                    }
                }
            }
        };
        
        that.generate = function () {
            return that.stylesheet.cssText();
        };

        setupCSSGenerator(that);
        return that;
    };
    
    /**********************************************
     * Browser-based strategy for loading styles. *
     **********************************************/

    build.cssGenerator.browserSheetStore = function (stylesheetLinkEl) {
        var that = {
            sheetEl: stylesheetLinkEl
        };
        
        that.load = function () {
            return build.cssGenerator.browserSheetStore.syncLoadStylesheetURL(that.sheetEl.attr("href"));
        };
        
        that.save = function () {
            // No-op for the browser for now.
        };
        
        return that;
    };
    
    build.cssGenerator.browserSheetStore.syncLoadStylesheetURL = function (url) {
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
    
    /*******************************************
     * Rhino-based strategy for loading styles *
     *******************************************/
     
     build.cssGenerator.rhinoSheetStore = function (stylesheetPath) {
         var that = {
             path: stylesheetPath
         };

         that.load = function () {

         };

         that.save = function () {
             
         };

         return that;
     };

})();
