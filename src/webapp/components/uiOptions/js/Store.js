/*
Copyright 2009 University of Toronto
Copyright 2011-2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    /**
     * A Generic store grade that defines base uiOptions store API.
     */
    fluid.defaults("fluid.uiOptions.store", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        invokers: {
            get: "fluid.uiOptions.store.get",
            set: "fluid.uiOptions.store.set"
        },
        nickName: "store" // framework bug FLUID-4636 - this is not resolved
    });

    fluid.uiOptions.store.preInit = function (that) {
        that.nickName = "store"; // work around FLUID-4636
    };

    /****************
     * Cookie Store *
     ****************/
     
    /**
     * SettingsStore Subcomponent that uses a cookie for persistence.
     * @param {Object} options
     */
    fluid.defaults("fluid.cookieStore", {
        gradeNames: ["fluid.uiOptions.store", "autoInit"],
        cookie: {
            name: "fluid-ui-settings",
            path: "/",
            expires: ""
        }
    });

    fluid.demands("fluid.uiOptions.store.get", "fluid.cookieStore", {
        funcName: "fluid.cookieStore.get",
        args: "{store}.options.cookie.name"
    });

    fluid.demands("fluid.uiOptions.store.set", "fluid.cookieStore", {
        funcName: "fluid.cookieStore.set",
        args: ["{arguments}.0", "{store}.options.cookie"]
    });

    /**
     * Retrieve and return the value of the cookie
     */
    fluid.cookieStore.get = function (cookieName) {
        var cookie = document.cookie;
        if (cookie.length <= 0) {
            return;
        }

        var cookiePrefix = cookieName + "=";
        var startIndex = cookie.indexOf(cookiePrefix);
        if (startIndex < 0) {
            return;
        }

        startIndex = startIndex + cookiePrefix.length;
        var endIndex = cookie.indexOf(";", startIndex);
        if (endIndex < startIndex) {
            endIndex = cookie.length;
        }

        var retObj = JSON.parse(decodeURIComponent(cookie.substring(startIndex, endIndex)));
        return retObj;
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
    fluid.cookieStore.set = function (settings, cookieOptions) {
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
        gradeNames: ["fluid.uiOptions.store", "fluid.modelComponent", "autoInit"]
    });

    fluid.demands("fluid.uiOptions.store.get", "fluid.tempStore", {
        funcName: "fluid.identity",
        args: "{store}.model"
    });

    fluid.demands("fluid.uiOptions.store.set", "fluid.tempStore", {
        funcName: "fluid.tempStore.set",
        args: ["{arguments}.0", "{store}.applier"]
    });

    fluid.tempStore.set = function (settings, applier) {
        applier.requestChange("", settings);
    };

})(jQuery, fluid_1_5);