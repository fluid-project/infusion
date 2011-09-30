/*
Copyright 2009 University of Toronto
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_4:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    
    fluid.defaults("fluid.uiOptions.store", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        defaultSiteSettings: {
            textFont: "default",          // key from classname map
            theme: "default",             // key from classname map
            textSize: 1,                  // in points
            lineSpacing: 1,               // in ems
            layout: false,                // boolean
            toc: false,                   // boolean
            links: false,                 // boolean
            inputsLarger: false           // boolean
        }
    });
    
    /****************
     * Cookie Store *
     ****************/
     
    /**
     * SettingsStore Subcomponent that uses a cookie for persistence.
     * @param {Object} options
     */
    fluid.defaults("fluid.cookieStore", {
        gradeNames: ["fluid.uiOptions.store", "autoInit"],
        invokers: {
            fetch: {
                funcName: "fluid.cookieStore.fetch",
                args: ["{cookieStore}.options.cookie.name", "{cookieStore}.options.defaultSiteSettings"]
            },
            save: {
                funcName: "fluid.cookieStore.save",
                args: ["{arguments}.0", "{cookieStore}.options.cookie"]
            }
        },
        cookie: {
            name: "fluid-ui-settings",
            path: "/",
            expires: ""
        }
    });

    /**
     * Retrieve and return the value of the cookie
     */
    fluid.cookieStore.fetch = function (cookieName, defaults) {
        var cookie = document.cookie;
        var cookiePrefix = cookieName + "=";
        var retObj, startIndex, endIndex;
        
        if (cookie.length > 0) {
            startIndex = cookie.indexOf(cookiePrefix);
            if (startIndex > -1) { 
                startIndex = startIndex + cookiePrefix.length; 
                endIndex = cookie.indexOf(";", startIndex);
                if (endIndex < startIndex) {
                    endIndex = cookie.length;
                }
                retObj = JSON.parse(decodeURIComponent(cookie.substring(startIndex, endIndex)));
            } 
        }
        
        return retObj || defaults;
    };
    
    /**
     * Assembles the cookie string
     * @param {Object} cookie settings
     */
    fluid.cookieStore.assembleCookie = function (cookieOptions) {
        var cookieStr = cookieOptions.name + "=" + cookieOptions.data;
        
        if (cookieOptions.expires) {
            cookieStr += "; expires=" + cookieOptions.expires;
        }
        
        if (cookieOptions.path) {
            cookieStr += "; path=" + cookieOptions.path;
        }
        
        return cookieStr;
    };

    /**
     * Saves the settings into a cookie
     * @param {Object} settings
     * @param {Object} cookieOptions
     */
    fluid.cookieStore.save = function (settings, cookieOptions) {
        cookieOptions.data = encodeURIComponent(JSON.stringify(settings));
        document.cookie = fluid.cookieStore.assembleCookie(cookieOptions);
    };
    

    /**************
     * Temp Store *
     **************/

    /**
     * SettingsStore Subcomponent that doesn't do persistence.
     * @param {Object} options
     */
    fluid.defaults("fluid.tempStore", {
        gradeNames: ["fluid.uiOptions.store", "autoInit"],
        invokers: {
            fetch: {
                funcName: "fluid.tempStore.fetch",
                args: ["{tempStore}"]
            },
            save: {
                funcName: "fluid.tempStore.save",
                args: ["{arguments}.0", "{tempStore}"]
            }
        },
        finalInitFunction: "fluid.tempStore.finalInit"
    });

    fluid.tempStore.finalInit = function (that) {
        that.model = that.options.defaultSiteSettings;
    };
    
    fluid.tempStore.fetch = function (that) {
        return that.model;
    };

    fluid.tempStore.save = function (settings, that) {
        that.model = settings;
    };

})(jQuery, fluid_1_4);