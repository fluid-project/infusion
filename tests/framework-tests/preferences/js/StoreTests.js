/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/* global fluid, jqUnit */

(function ($) {
    "use strict";

    $(document).ready(function () {
        var testSettings = {
            textSize: "1.5",
            textFont: "verdana",
            theme: "bw",
            layout: false
        };

        var cookieName = "fluid-cookieStore-test";

        var dropCookie = function (cookieName) {
            var date = new Date();
            document.cookie = cookieName + "=; expires=" + date.toGMTString() + "; path=/";
        };

        var assembleCookieTest = function (cookieOptions, expectedAssembledCookie) {
            var assembledCookie = fluid.cookieStore.assembleCookie(cookieOptions);
            jqUnit.assertEquals("The expected cookie string should have been assembled", expectedAssembledCookie, assembledCookie);
        };

        jqUnit.module("Store Tests");

        jqUnit.test("assembleCookie: all cookieOptions set", function () {
            var expected = "cookieName=cookieValue; expires=Fri, 15 Jul 2011 16:44:24 GMT; path=/";
            var opts = {
                name: "cookieName",
                data: "cookieValue",
                expires: "Fri, 15 Jul 2011 16:44:24 GMT",
                path: "/"
            };
            assembleCookieTest(opts, expected);
        });

        jqUnit.test("assembleCookie: no expiry date set", function () {
            var expected = "cookieName=cookieValue; path=/";
            var opts = {
                name: "cookieName",
                data: "cookieValue",
                path: "/"
            };
            assembleCookieTest(opts, expected);
        });

        jqUnit.test("assembleCookie: no path set", function () {
            var expected = "cookieName=cookieValue; expires=Fri, 15 Jul 2011 16:44:24 GMT";
            var opts = {
                name: "cookieName",
                data: "cookieValue",
                expires: "Fri, 15 Jul 2011 16:44:24 GMT"
            };
            assembleCookieTest(opts, expected);
        });

        jqUnit.test("assembleCookie: no path or expiry date set", function () {
            var expected = "cookieName=cookieValue";
            var opts = {
                name: "cookieName",
                data: "cookieValue"
            };
            assembleCookieTest(opts, expected);
        });

        jqUnit.test("Cookie", function () {
            var store = fluid.cookieStore({
                cookie: {
                    name: cookieName
                }
            });
            store.set(testSettings);

            // Check that we get back the test settings correctly.
            var result = store.get();
            jqUnit.assertLeftHand("The settings are saved and retrieved correctly.", testSettings, result);

            // Change the results, save again. It should work again.
            var differentSettings = fluid.copy(testSettings);
            differentSettings.textSize = "2";
            store.set(differentSettings);
            jqUnit.assertEquals("Changed settings are saved correctly.", store.get().textSize, "2");

            // Check the cookie directly and make sure it's there.
            var startIndex = document.cookie.indexOf(store.options.cookie.name);
            jqUnit.assertTrue("Our cookie should be floating somewhere in the browser.",
                               startIndex >= 0);

            // Make sure textSize == 2
            var endIndex = document.cookie.indexOf(";", startIndex);
            if (endIndex < startIndex) {
                endIndex = document.cookie.length;
            }
            var cookieStr = decodeURIComponent(document.cookie.substring(startIndex, endIndex));

            jqUnit.assertTrue("Our cookie should contain the textSize 2.", cookieStr.indexOf("\"textSize\":\"2\"") > 0);

            // Remove test cookie
            dropCookie(store.options.cookie.name);
        });

        jqUnit.test("Temp store", function () {
            var store = fluid.tempStore();
            store.set(testSettings);

            // Check that we get back the test settings correctly.
            var result = store.get();
            jqUnit.assertDeepEq("The settings are saved and retrieved correctly.", testSettings, result);

            // Change the results, save again. It should work again.
            var differentSettings = fluid.copy(testSettings);
            differentSettings.textSize = "32";
            store.set(differentSettings);
            jqUnit.assertEquals("Changed settings are saved correctly.", "32", store.get().textSize);
            jqUnit.assertEquals("Theme was saved correctly.", "bw", store.get().theme);

        });

    });
})(jQuery);
