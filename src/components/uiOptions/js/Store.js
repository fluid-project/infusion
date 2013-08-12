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
     * A Generic data source grade that defines an API for getting and setting
     * data.
     */
    fluid.defaults("fluid.uiOptions.dataSource", {
        gradeNames: ["fluid.littleComponent"],
        invokers: {
            get: "fluid.uiOptions.dataSource.get",
            set: "fluid.uiOptions.dataSource.set"
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
        gradeNames: ["fluid.uiOptions.dataSource", "autoInit"],
        cookie: {
            name: "fluid-ui-settings",
            path: "/",
            expires: ""
        }
    });

    fluid.demands("fluid.uiOptions.dataSource.get", "fluid.cookieStore", {
        funcName: "fluid.cookieStore.get",
        args: "{that}.options.cookie.name"
    });

    fluid.demands("fluid.uiOptions.dataSource.set", "fluid.cookieStore", {
        funcName: "fluid.cookieStore.set",
        args: ["{arguments}.0", "{that}.options.cookie"]
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
        gradeNames: ["fluid.uiOptions.dataSource", "fluid.modelComponent", "autoInit"]
    });

    fluid.demands("fluid.uiOptions.dataSource.get", "fluid.tempStore", {
        funcName: "fluid.identity",
        args: "{that}.model"
    });

    fluid.demands("fluid.uiOptions.dataSource.set", "fluid.tempStore", {
        funcName: "fluid.tempStore.set",
        args: ["{arguments}.0", "{that}.applier"]
    });

    fluid.tempStore.set = function (settings, applier) {
        applier.requestChange("", settings);
    };

    fluid.defaults("fluid.globalSettingsStore", {
        gradeNames: ["autoInit", "fluid.littleComponent"],
        components: {
            settingsStore: {
                type: "fluid.uiOptions.store"
            }
        }
    });

    fluid.globalSettingsStore.finalInit = function (that) {
        fluid.staticEnvironment.settingsStore = that.settingsStore;
    };

    fluid.demands("fluid.uiOptions.store", ["fluid.globalSettingsStore"], {
        funcName: "fluid.cookieStore"
    });

})(jQuery, fluid_1_5);