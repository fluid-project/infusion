/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one of these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var fluid_3_0_0 = fluid_3_0_0 || {};
var fluid = fluid || fluid_3_0_0;

(function (fluid) {
    "use strict";

    // setting up the `fluid.load` namespace
    fluid.load = fluid.load || {};

    /**
     * based on Jake Archibald's example from:
     * http://www.html5rocks.com/en/tutorials/speed/script-loading/#toc-dom-rescue
     * Licensed as Apache 2.0
     *
     * Will load an array of scripts into an HTML document syncronously, by
     * appending script tags into the `<head>`
     *
     * @param scripts {Array} - the array of script URLs to load
     */
    fluid.load.loadScripts = function (scripts) {
        scripts.forEach(function (src) {
            var script = document.createElement("script");
            script.src = src;
            script.async = false;
            document.head.appendChild(script);
        });
    };

    /**
     * Determines if a browser cookie with the given name is available. It does
     * not check the contents of the cookie.
     *
     * @param cookieName {String} - name of browser cookie to look for
     * @returns {Boolean} - returns `true` if the browser cookie is found, false
     *                      otherwise.
     */
    fluid.load.hasCookie = function (cookieName) {
        var cookie = document.cookie;
        return cookie && cookie.indexOf(cookieName) >= 0;
    };


    /**
     * Will load the set of scripts into the Document if the specified browser
     * cookie is available.
     *
     * @param cookieName {String} - name of browser cookie to look for
     * @param scripts {Array} - the array of script URLs to load
     */
    fluid.load.lazyLoadScripts = function (cookieName, scripts) {
        if (fluid.load.hasCookie(cookieName)) {
            fluid.load.loadScripts(scripts);
        }
    };

})(fluid_3_0_0);
