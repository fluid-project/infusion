/*
Copyright 2007-2019 The Infusion Copyright holders
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-project/infusion/raw/master/AUTHORS.md.

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};

(function ($, fluid) {
    "use strict";

    fluid.defaults("fluid.prefs.store", {
        gradeNames: ["fluid.dataSource", "fluid.contextAware"],
        contextAwareness: {
            strategy: {
                defaultGradeNames: "fluid.prefs.cookieStore"
            }
        }
    });

    fluid.prefs.store.decodeURIComponent = function (payload) {
        if (typeof payload === "string") {
            return decodeURIComponent(payload);
        }
    };

    fluid.prefs.store.encodeURIComponent = function (payload) {
        if (typeof payload === "string") {
            return encodeURIComponent(payload);
        }
    };

    /****************
     * Cookie Store *
     ****************/

    /**
     * SettingsStore Subcomponent that uses a cookie for persistence.
     * @param options {Object}
     */
    fluid.defaults("fluid.prefs.cookieStore", {
        gradeNames: ["fluid.dataSource"],
        cookie: {
            name: "fluid-ui-settings",
            path: "/",
            expires: ""
        },
        listeners: {
            "onRead.impl": {
                listener: "fluid.prefs.cookieStore.getCookie",
                args: ["{arguments}.1"]
            },
            "onRead.decodeURI": {
                listener: "fluid.prefs.store.decodeURIComponent",
                priority: "before:encoding"
            }
        },
        invokers: {
            get: {
                args: ["{that}", "{arguments}.0", "{that}.options.cookie"] // directModel, options/callback
            }
        }
    });

    fluid.defaults("fluid.prefs.cookieStore.writable", {
        gradeNames: ["fluid.dataSource.writable"],
        listeners: {
            "onWrite.encodeURI": {
                func: "fluid.prefs.store.encodeURIComponent",
                priority: "before:impl"
            },
            "onWrite.impl": {
                listener: "fluid.prefs.cookieStore.writeCookie"
            },
            "onWriteResponse.decodeURI": {
                listener: "fluid.prefs.store.decodeURIComponent",
                priority: "before:encoding"
            }
        },
        invokers: {
            set: {
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{that}.options.cookie"] // directModel, model, options/callback
            }
        }
    });

    fluid.makeGradeLinkage("fluid.prefs.cookieStore.linkage", ["fluid.dataSource.writable", "fluid.prefs.cookieStore"], "fluid.prefs.cookieStore.writable");

    /*
     * Retrieve and return the value of the cookie
     */
    fluid.prefs.cookieStore.getCookie = function (options) {
        var cookieName = fluid.get(options, ["directModel", "cookieName"]) || options.name;
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
        return cookie.substring(startIndex, endIndex);
    };

    /**
     * Assembles the cookie string
     * @param {String} cookieName - name of the cookie
     * @param {String} data - the serialized data to be stored in the cookie
     * @param {Object} options - settings
     * @return {String} - A string representing the assembled cookie.
     */
    fluid.prefs.cookieStore.assembleCookie = function (cookieName, data, options) {
        options = options || {};
        var cookieStr = cookieName + "=" + data;

        if (options.expires) {
            cookieStr += "; expires=" + options.expires;
        }

        if (options.path) {
            cookieStr += "; path=" + options.path;
        }

        return cookieStr;
    };

    /**
     * Saves the settings into a cookie
     * @param {Object} payload - the serialized data to write to the cookie
     * @param {Object} options - settings
     * @return {Object} - The original payload.
     */
    fluid.prefs.cookieStore.writeCookie = function (payload, options) {
        var cookieName = fluid.get(options, ["directModel", "cookieName"]) || options.name;
        var cookieStr = fluid.prefs.cookieStore.assembleCookie(cookieName, payload, options);

        document.cookie = cookieStr;
        return payload;
    };


    /**************
     * Temp Store *
     **************/

    fluid.defaults("fluid.dataSource.encoding.model", {
        gradeNames: "fluid.component",
        invokers: {
            parse: "fluid.identity",
            render: "fluid.identity"
        },
        contentType: "application/json"
    });

    /**
     * SettingsStore mock that doesn't do persistence.
     * @param options {Object}
     */
    fluid.defaults("fluid.prefs.tempStore", {
        gradeNames: ["fluid.dataSource", "fluid.modelComponent"],
        components: {
            encoding: {
                type: "fluid.dataSource.encoding.model"
            }
        },
        listeners: {
            "onRead.impl": {
                listener: "fluid.identity",
                args: ["{that}.model"]
            }
        }
    });

    fluid.defaults("fluid.prefs.tempStore.writable", {
        gradeNames: ["fluid.dataSource.writable", "fluid.modelComponent"],
        components: {
            encoding: {
                type: "fluid.dataSource.encoding.model"
            }
        },
        listeners: {
            "onWrite.impl": {
                listener: "fluid.prefs.tempStore.write",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        }
    });

    fluid.prefs.tempStore.write = function (that, settings) {
        var transaction = that.applier.initiate();
        transaction.fireChangeRequest({path: "", type: "DELETE"});
        transaction.change("", settings);
        transaction.commit();
        return that.model;
    };

    fluid.makeGradeLinkage("fluid.prefs.tempStore.linkage", ["fluid.dataSource.writable", "fluid.prefs.tempStore"], "fluid.prefs.tempStore.writable");

    fluid.defaults("fluid.prefs.globalSettingsStore", {
        gradeNames: ["fluid.component"],
        components: {
            settingsStore: {
                type: "fluid.prefs.store",
                options: {
                    gradeNames: ["fluid.resolveRootSingle", "fluid.dataSource.writable"],
                    singleRootType: "fluid.prefs.store"
                }
            }
        }
    });

})(jQuery, fluid_3_0_0);
